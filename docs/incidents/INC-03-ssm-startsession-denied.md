# INC-03 — Session Manager access denied

Bank ID: IAM-019 · Status: `RECOVERED_PASS` · AWS us-east-2, live

| Field | Value |
| --- | --- |
| Detected | 2026-11-18 21:49 (UTC+7) |
| Recovered | 2026-11-19 09:53, scope verified 10:17 |
| Layer | IAM, operator identity |
| Impact | No user impact. The operator could not open a shell on the only EC2 host, so deployment was blocked |
| Cost | None |

## Baseline

- EC2 `<INSTANCE_ID>` running with instance profile `orderflow-ec2-profile`. Its role has `AmazonSSMManagedInstanceCore`.
- 21:02: `aws ssm describe-instance-information` returned `Online  Amazon Linux`.
- The operator works as IAM user `orderflow-operator` through `aws login`. Attached policies: `ReadOnlyAccess`, `SignInLocalDevelopmentAccess`, `OrderFlowTerraformDeployPolicy`.

Two identities take part in a session:

```
Mac (orderflow-operator) ──StartSession──► SSM service ◄──HTTPS 443, opened by the agent── EC2 (orderflow-ec2-role)
```

## Symptom

```
$ aws ssm start-session --target <INSTANCE_ID>
An error occurred (AccessDeniedException) when calling the StartSession operation:
User: arn:aws:iam::<ACCOUNT_ID>:user/orderflow-operator is not authorized to perform:
ssm:StartSession on resource: arn:aws:ssm:us-east-2:<ACCOUNT_ID>:document/SSM-SessionManagerRunShell
because no identity-based policy allows the ssm:StartSession action
```

## Hypotheses and checks

| Hypothesis | Check | Result |
| --- | --- | --- |
| Agent, instance role or network broken | `describe-instance-information` | Ruled out: `Online` 47 minutes earlier |
| Wrong profile, account or Region | Principal and resource in the error | Ruled out: `orderflow-operator`, `us-east-2` |
| Operator lacks `ssm:StartSession` | Error text: *no identity-based policy allows* | Confirmed. It is a missing allow, not an explicit deny |

## Root cause

`ReadOnlyAccess` gives the operator `Describe*` on SSM, which is why the status check worked. Opening a session is a separate action that no attached policy allowed.

## Fix

Customer managed policy [`orderflow-operator-ssm-session`](../iam-policies/orderflow-operator-ssm-session.json), based on the [AWS sample policies for Session Manager](https://docs.aws.amazon.com/systems-manager/latest/userguide/getting-started-restrict-access-quickstart.html):

- `ssm:StartSession` on this one instance and the `SSM-SessionManagerRunShell` document only.
- Terminate, resume and open data channels only for sessions the caller started.
- Tags `Project=CLOUD-PROD-001`, `Environment=lab`, `ManagedBy=manual`.

Attached on 2026-11-19 from the root user, because the account had no other admin identity yet.

## Recovery verified

```
$ aws ssm start-session --target <INSTANCE_ID>
Starting session with SessionId: orderflow-operator-<id>
sh-5.2$ whoami          → ssm-user
sh-5.2$ uname -m        → x86_64
sh-5.2$ grep PRETTY_NAME /etc/os-release → Amazon Linux 2023.12.20261109
```

Scope check, which must fail:

```
$ aws ssm start-session --target <INSTANCE_ID> \
    --document-name AWS-StartPortForwardingSession \
    --parameters portNumber=8080,localPortNumber=18080
AccessDeniedException ... on resource: arn:aws:ssm:us-east-2::document/AWS-StartPortForwardingSession
```

## Prevention

- **The policy pins one instance ID.** `compute.tf` takes the latest AMI, so a future plan can replace the instance and this incident comes back. Next revision: allow instances tagged `Project=CLOUD-PROD-001` instead of one ID.
- Keep operator permissions as code in a separate admin stack, applied by an admin identity, not by root.
- After any infrastructure change, run `start-session` as a smoke check.

## Interview drill

1. *SSM shows the instance Online, yet StartSession returns AccessDenied. Where do you look?* At the caller's identity policies. Online proves the agent and its role; StartSession is checked against whoever runs the command.
2. *Which identities does a Session Manager session involve, and what does each need?* The operator needs `ssm:StartSession` (plus session actions). The instance role needs the SSM core permissions so the agent can register and receive sessions.
3. *Why test a call that should fail?* It proves the grant is as narrow as written, not wider.

English explain-back: "The agent was online, so the instance side was fine. The error named my IAM user and said no policy allowed StartSession. I added a policy that allows a shell on that one instance and only on sessions I own, then confirmed port forwarding is still denied."

## Evidence

`20261118-2102_M3-01_ssm-online.png`, `20261118-2149_INC-03_startsession-accessdenied.png`, `20261119-0953_INC-03_startsession-ok.png`, `20261119-0957_M3-02_ec2-baseline.png`, `20261119-1016_INC-03_iam-user-permissions.png`, `20261119-1017_INC-03_deny-portforward.png`. Originals are private; see [evidence manifest](../evidence/MANIFEST.md).
