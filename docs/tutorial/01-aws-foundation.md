---
title: "Part 1 — From an empty AWS account to verified infrastructure"
phase: P1
checkpoints: [M2-APPLY, M3-01, M3-02, INC-03, M3-03.1]
updated_at: "2026-11-19"
verified_at: "2026-11-19T12:01:00+07:00"
source_commit: 7ded466
region: us-east-2
environment: AWS
status: "Steps 1-5 RECONSTRUCTED from code and logs; steps 6-8 ACTUAL_CAPTURE"
evidence_ids: [EV-20261118-P1-01, EV-20261118-P1-02, EV-20261118-P1-03, EV-20261119-P1-01, EV-20261119-P1-02, EV-20261119-P1-05, EV-20261119-P1-07]
next: "Part 2 — image on ECR, app on EC2, RDS app user"
---

# Part 1 — From an empty AWS account to verified infrastructure

At the end of this part you have 40 AWS resources built by Terraform, you have checked that the database, the server and Session Manager are really up, and you can open a shell on the server without SSH. The app itself is not running yet; that is Part 2.

**Cost.** AWS bills by the hour from the moment resources exist, even with no traffic. The main costs here are the EC2 `t3.medium` with its 30 GiB disk, RDS `db.t4g.micro`, the Application Load Balancer, public IPv4 addresses and one Secrets Manager secret. Set a budget alert in step 2 and tear everything down when you finish the project.

**Values to replace.** Wherever you see them: `<ACCOUNT_ID>` (your 12-digit AWS account), `<INSTANCE_ID>` (step 6), `khanhcloud.online` (your domain). Keep the profile name `orderflow-lab` and Region `us-east-2` so the commands work as written.

**Never commit** `terraform.tfstate`, `tfplan`, `*.tfvars` or `.env`. The repo's `.gitignore` already blocks them.

## 1. Tools on your Mac

Open Terminal (`Cmd + Space`, type *Terminal*). Commands with `sudo` ask for your Mac password; nothing shows while you type.

| Tool | Why | Install | Check |
| --- | --- | --- | --- |
| Homebrew | Installs the other tools | Command on [brew.sh](https://brew.sh), then run the two *Next steps* lines it prints | `brew --version` |
| Git | Get the code | `brew install git` | `git --version` |
| AWS CLI v2, 2.32.0 or newer | Talk to AWS; `aws login` needs 2.32.0 | see below | `aws --version` |
| Terraform 1.5+ | Build the infrastructure | `brew tap hashicorp/tap && brew install hashicorp/tap/terraform` | `terraform -version` |
| Session Manager plugin | Open a shell on EC2 | see below | `session-manager-plugin --version` |

```bash
# AWS CLI (official installer)
curl "https://awscli.amazonaws.com/AWSCLIV2.pkg" -o "AWSCLIV2.pkg"
sudo installer -pkg AWSCLIV2.pkg -target /

# Session Manager plugin, Apple silicon (Intel Macs: replace mac_arm64 with mac)
cd ~/Downloads
curl "https://s3.amazonaws.com/session-manager-downloads/plugin/latest/mac_arm64/session-manager-plugin.pkg" -o session-manager-plugin.pkg
sudo installer -pkg session-manager-plugin.pkg -target /
sudo mkdir -p /usr/local/bin
sudo ln -s /usr/local/sessionmanagerplugin/bin/session-manager-plugin /usr/local/bin/session-manager-plugin

# The code
git clone https://github.com/iam-trongkhanh/orderflow-aws-devops.git
cd orderflow-aws-devops
```

Every check command should print a version. `command not found` right after installing usually means you need a new Terminal window.

## 2. AWS account

1. Sign up at [aws.amazon.com](https://aws.amazon.com). New accounts start on a Free plan with credits but only a subset of services; if a service is blocked, upgrade to the Paid plan ([AWS Free Tier FAQs](https://aws.amazon.com/free/faqs/)).
2. **Protect the root user.** The email you signed up with is the master key. Console → account name (top right) → **Security credentials** → **Assign MFA device** → passkey or authenticator app. Add a second device so a lost phone does not lock you out. Never create access keys for root.
3. **Budget alert.** Search *Budgets* → **Create budget** → **Monthly cost budget** → your limit and email. A budget only emails you; it does not stop anything.
4. **Region.** Resources live in one Region and the console only shows the Region selected top right. Pick **US East (Ohio) us-east-2**. If the EC2 page says *No matching instances* while your server is running, you are looking at the wrong Region.

## 3. Operator user and CLI login

Terraform and the CLI run as an IAM user, never as root.

1. Sign in as root → **IAM → Users → Create user** → name `orderflow-operator`.
2. Tick **Provide user access to the AWS Management Console** (`aws login` uses this sign-in). Choose *I want to create an IAM user* if asked. Save the password in a password manager.
3. **Attach policies directly:** `SignInLocalDevelopmentAccess`, `ReadOnlyAccess`, and the Terraform deploy policy (see [IAM policies](../iam-policies/README.md)).
4. Tag `Project` = `CLOUD-PROD-001` → **Create user**.
5. Open the user → **Security credentials** → **Assign MFA device**.

Log in from Terminal:

```bash
aws login --profile orderflow-lab
```

A browser opens; sign in as `orderflow-operator` with MFA. The first time, type `us-east-2` when asked for a Region. Credentials last up to 12 hours; after that you will see `Your session has expired` and run `aws login` again.

Start every session with these three lines:

```bash
export AWS_PROFILE=orderflow-lab AWS_DEFAULT_REGION=us-east-2 AWS_PAGER=""
env | grep -E '^AWS_' | sed 's/=.*/=<set>/'
aws sts get-caller-identity --query Arn --output text
```

Expected: only `AWS_PROFILE`, `AWS_DEFAULT_REGION`, `AWS_PAGER` listed, then `arn:aws:iam::<ACCOUNT_ID>:user/orderflow-operator`. If you see `AWS_ACCESS_KEY_ID` or `:root`, stop: an old key is overriding your profile.

## 4. Cloudflare

Terraform proves to AWS that you own the domain by writing one DNS record in Cloudflare.

1. Add your domain in [dash.cloudflare.com](https://dash.cloudflare.com) (Free plan), then replace the nameservers at your registrar with the two Cloudflare gives you. Wait for the zone to show **Active**.
2. Copy the **Zone ID** from the zone's Overview page, right column.
3. **My Profile → API Tokens → Create Token → Edit zone DNS** template → Zone resources: **Include → Specific zone →** your domain → **Continue to summary → Create Token**. Copy it now; Cloudflare shows it once.

Load the token without leaving it on screen or in shell history:

```bash
read -rs CLOUDFLARE_API_TOKEN     # paste, press Enter; nothing is shown
export CLOUDFLARE_API_TOKEN
curl -s -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
  https://api.cloudflare.com/client/v4/user/tokens/verify
```

Expected: `"success":true` and `"status":"active"`. The variable lives only in this Terminal window.

## 5. Build the infrastructure

```bash
cd infra/terraform
curl -s https://checkip.amazonaws.com      # your public IP
```

Create `terraform.tfvars` in this folder (git-ignored):

```hcl
cloudflare_zone_id = "<ZONE_ID>"
my_public_ip_cidr  = "<YOUR_PUBLIC_IP>/32"
```

`/32` means exactly one address: only your machine can reach the load balancer for now.

```bash
terraform init                 # downloads the AWS and Cloudflare providers
terraform fmt
terraform validate             # syntax and references only, no AWS calls
terraform plan -out=tfplan     # compares code with AWS and saves the plan
terraform apply tfplan         # does exactly what the saved plan says
```

Expected plan: `Plan: 40 to add, 0 to change, 0 to destroy.` Read it before applying: `+` create, `~` change, `-/+` replace, `-` delete. Applying takes several minutes; RDS alone took 7m30s.

The `.tf` files are in [`infra/terraform`](../../infra/terraform): network (13 resources), security groups (9), IAM (5), ECR (1), EC2 (1), RDS (2), certificate (3), load balancer (6).

If apply stops halfway, the resources already created stay in the state file. Fix the cause and run `plan` and `apply` again; Terraform only creates what is missing. Do not destroy and start over. Both real failures in this project were missing permissions on the operator user, not code errors ([incident index](../incidents/INDEX.md): IAM-001, DB-001).

Check the count (lines starting with `data.` are lookups, not resources):

```bash
terraform state list | grep -v '^data\.' | wc -l      # expected: 40
```

## 6. Verify it is really running

Terraform saying *created* is not the same as *running*. These three calls only read.

```bash
# Instance ID, found by the Name tag set in compute.tf
aws ec2 describe-instances \
  --filters "Name=tag:Name,Values=orderflow-api" "Name=instance-state-name,Values=running" \
  --query 'Reservations[].Instances[].InstanceId' --output text

aws rds describe-db-instances --db-instance-identifier orderflow-postgres \
  --query 'DBInstances[0].[DBInstanceStatus,PubliclyAccessible,MasterUserSecret.SecretStatus]' --output text

aws ec2 describe-instances --instance-ids <INSTANCE_ID> \
  --query 'Reservations[0].Instances[0].[State.Name,PublicIpAddress,IamInstanceProfile.Arn]' --output text

aws ssm describe-instance-information --filters 'Key=InstanceIds,Values=<INSTANCE_ID>' \
  --query 'InstanceInformationList[].[PingStatus,PlatformName]' --output text
```

Expected:

```
available   False   active
running     <PUBLIC_IP>   arn:aws:iam::<ACCOUNT_ID>:instance-profile/orderflow-ec2-profile
Online      Amazon Linux
```

`False` means the database has no public address. `Online` means the SSM Agent on the server has called home. The agent is preinstalled on Amazon Linux 2023 and only needs the instance role and outbound HTTPS, both set by Terraform.

## 7. Open a shell without SSH

Port 22 is closed. Session Manager works the other way round: the agent on the server keeps an outbound HTTPS connection to AWS, and your shell travels through it.

Your user needs permission to start a session. Sign in with an admin identity → **IAM → Policies → Create policy → JSON**, paste [this policy](../iam-policies/orderflow-operator-ssm-session.json) with your account and instance IDs, name it `orderflow-operator-ssm-session`, tag `Project=CLOUD-PROD-001`, `Environment=lab`, `ManagedBy=manual`, then attach it to `orderflow-operator`. Without it you get the error in [INC-03](../incidents/INC-03-ssm-startsession-denied.md).

```bash
aws ssm start-session --target <INSTANCE_ID>
```

When the prompt changes to `sh-5.2$` you are on the server:

```bash
whoami                              # ssm-user
uname -m                            # x86_64: images must be built for linux/amd64
grep PRETTY_NAME /etc/os-release    # Amazon Linux 2023
```

Check the grant is narrow; this must fail with `AccessDenied`:

```bash
aws ssm start-session --target <INSTANCE_ID> \
  --document-name AWS-StartPortForwardingSession \
  --parameters portNumber=8080,localPortNumber=18080
```

## 8. Docker on the server

Inside a session:

```bash
sudo dnf install -y docker
sudo systemctl enable --now docker   # start now and on every boot
sudo docker run --rm hello-world     # daemon, outbound network and image pull in one test
df -h /                              # free disk before pulling the app image
exit
```

Expected: `Hello from Docker!` and plenty of free space on `/` (about 28G of 30G here). The server only allows outbound port 443; package repositories and Docker Hub both use HTTPS, so this works.

Installing by hand is lost if Terraform replaces the instance. Part 2 moves it into `user_data`.

## When something goes wrong

| You see | Where the problem is | Do |
| --- | --- | --- |
| `Your session has expired` | Your Mac | `aws login` |
| `command not found` | Your Mac | Install the tool, open a new Terminal |
| `ParamValidation: ... required: --target` | Your Mac, a typo | Fix the flag; the call never reached AWS |
| `AccessDenied ... no identity-based policy allows` | AWS, the identity in the message | Add the smallest permission to that identity |
| `NotFound` for an instance or database | Usually wrong Region or profile | Re-run the three lines in step 3 |
| Console shows nothing | Wrong Region selected | Switch to US East (Ohio) |
| SSM returns an empty list | Agent, instance role or outbound network | Check `iam.tf`, the route to the internet gateway and egress 443 |
