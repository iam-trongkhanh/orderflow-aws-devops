# Progress ledger

Current stage: **P1 — OrderFlow on EC2**, checkpoint M3-03. Statuses only change with evidence. Times are UTC+7.

| Date | Checkpoint | Result | Status | Evidence |
| --- | --- | --- | --- | --- |
| 2026-11-20 10:14 | M3-03 step 5 | EC2 pulled `orderflow-api:7ded466` with its instance role; `linux/amd64`; `node --version` = `v26.13.0` | `VERIFIED_AWS_EC2` | `20261120-1014_M3-03_ec2-pull.png` |
| 2026-11-19 15:09 | M3-03 step 4 | `linux/amd64` image pushed to ECR as `orderflow-api:7ded466` (index `sha256:05c7fdef…`); first try failed because Docker Desktop was off | `VERIFIED_AWS_EC2` | `20261119-1509_M3-03_ecr-push.png` |
| 2026-11-19 12:32 | M3-03 step 3 | App source, Dockerfile, migrations and tests pushed (`7ded466`); secret scan clean, `Evidence/` ignored (`cc49d3a`) | `VERIFIED_PASS` | git log, scan output |
| 2026-11-19 12:01 | M3-03 step 1 | Docker installed on EC2, `hello-world` ran, 28G free on `/` | `VERIFIED_AWS_EC2` | `20261119-1201_M3-03_docker-install.png` |
| 2026-11-19 10:36 | Security | MFA on `orderflow-operator` (passkey); root MFA reported by owner | `VERIFIED_AWS_EC2` / `SELF_REPORTED` | IAM screenshot |
| 2026-11-19 10:17 | INC-03 | Session Manager access fixed and scope tested | `RECOVERED_PASS` | [INC-03](../incidents/INC-03-ssm-startsession-denied.md) |
| 2026-11-19 09:57 | M3-02 | Shell on EC2 via SSM: `ssm-user`, `x86_64`, AL2023 | `VERIFIED_AWS_EC2` | `20261119-0957_M3-02_ec2-baseline.png` |
| 2026-11-18 21:02 | M3-01 | RDS `available`, not public, secret `active`; EC2 `running` with profile; SSM `Online` | `VERIFIED_AWS_EC2` | `20261118-2059_...`, `20261118-2102_...` |
| 2026-11-12 | M2 apply | 40 resources created after INC-01 and INC-02 | `APPLIED` | Terraform output in chat history |
| 2026-11-04 | App local | Compose stack healthy, `/healthz` and `/readyz` 200, metrics exposed | `VERIFIED_LOCAL` | [VERIFICATION.md](../../VERIFICATION.md) |

## Next

1. Database user for the app with least privilege; decide where its password lives.
2. EC2 role reads exactly one secret; separate least-privilege DB user for the app.
3. Run migrations, start the API, `/healthz` and `/readyz` 200.
4. Target group healthy; create and read an order over HTTPS through the ALB.

## Open risks

- `compute.tf` follows the latest AMI; a plan may replace EC2 and lose manual setup.
- Terraform state lives only on the operator's Mac.
- `ReadOnlyAccess` on the operator is broader than needed.
- IAM changes were made as root; an admin identity with MFA should take over.
