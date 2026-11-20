# Evidence manifest

Originals stay private in `Evidence/` (git-ignored): they show account IDs, IPs and personal browser tabs. Only redacted copies, with the same file names, are published under `docs/screenshots/`. Capture type: `ACTUAL_CAPTURE` (screenshot or terminal output at the time), `RECONSTRUCTED_FROM_LOG`, `DIAGRAM`, `NOT_CAPTURED`.

Evidence ID: `EV-YYYYMMDD-<phase>-<n>`. File name: `YYYYMMDD-HHMM_<checkpoint>_<what>.png`, lower case, no spaces. Times are UTC+7.

| ID | File | Proves | Redact | Type | Published |
| --- | --- | --- | --- | --- | --- |
| EV-20261118-P1-01 | `20261118-2049_M3-01_aws-login-sts.png` | Expired session, `aws login`, caller is `orderflow-operator` | Account ID, OAuth URL | ACTUAL_CAPTURE | No |
| EV-20261118-P1-02 | `20261118-2059_M3-01_rds-ec2-describe.png` | RDS `available False active`; EC2 `running` with profile | Account ID, public IP | ACTUAL_CAPTURE | No |
| EV-20261118-P1-03 | `20261118-2102_M3-01_ssm-online.png` | SSM `Online Amazon Linux` | — | ACTUAL_CAPTURE | No |
| EV-20261118-P1-04 | `20261118-2117_M3-02_plugin-not-found.png` | Session Manager plugin missing | Background windows | ACTUAL_CAPTURE | No |
| EV-20261118-P1-05 | `20261118-2137_M3-02_plugin-installed.png` | Plugin `1.2.896.0` installed | — | ACTUAL_CAPTURE | No |
| EV-20261118-P1-06 | `20261118-2149_INC-03_startsession-accessdenied.png` | INC-03 symptom | Account ID | ACTUAL_CAPTURE | No |
| EV-20261118-P1-07 | `20261118-2150_M3-01_console-wrong-region-sydney.png` | Empty console in the wrong Region | Account ID | ACTUAL_CAPTURE | No |
| EV-20261119-P1-01 | `20261119-0953_INC-03_startsession-ok.png` | Session opens after the fix | — | ACTUAL_CAPTURE | No |
| EV-20261119-P1-02 | `20261119-0957_M3-02_ec2-baseline.png` | `ssm-user`, `x86_64`, AL2023, no Docker | — | ACTUAL_CAPTURE | No |
| EV-20261119-P1-03 | `20261119-1016_INC-03_iam-user-permissions.png` | Four policies on the operator | Account ID | ACTUAL_CAPTURE | No |
| EV-20261119-P1-04 | `20261119-1016_INC-03_iam-user-tags.png` | Tags, console access, no access keys | Account ID, ARN | ACTUAL_CAPTURE | No |
| EV-20261119-P1-05 | `20261119-1017_INC-03_deny-portforward.png` | Port forwarding still denied | Account ID | ACTUAL_CAPTURE | No |
| EV-20261119-P1-06 | `20261119-1036_SEC_operator-mfa.png` | Operator console access with MFA | Account ID, device name | ACTUAL_CAPTURE | No |
| EV-20261119-P1-07 | `20261119-1201_M3-03_docker-install.png` | `hello-world` output and disk space | — | ACTUAL_CAPTURE | No |
| EV-20261119-P1-08 | `20261119-1232_M3-03_secret-scan.png` | Case-insensitive secret scan: placeholders only | — | ACTUAL_CAPTURE | No |
| EV-20261119-P1-09 | `20261119-1232_M3-03_git-push.png` | Push `ea4196f..7ded466`, commits `cc49d3a`, `7ded466` | — | ACTUAL_CAPTURE | No |
| EV-20261119-P1-10 | `20261119-1509_M3-03_ecr-push.png` | Docker engine error, then build 112 s, push, tag `7ded466` with index and image digests | Account ID | ACTUAL_CAPTURE | No |
| EV-20261120-P1-01 | `20261120-1014_M3-03_ec2-pull.png` | ECR login with the instance role, pull with the same index digest, `linux/amd64`, `v26.13.0` | Account ID, instance ID | ACTUAL_CAPTURE | No |
| EV-20261112-P1-01 | Terraform apply output, 2026-11-12 | 39 resources, then RDS `Creation complete after 7m30s` | Account ID | NOT_CAPTURED | No |

Still capturable while resources exist: policy page (JSON and Tags tabs), exported `OrderFlowTerraformDeployPolicy`, original Terraform output from the chat history of 2026-11-12.
