# Cost ledger

Real charges from Billing, not estimates. Every resource carries the tags `Project=CLOUD-PROD-001`, `Environment=lab`, `ManagedBy=Terraform` so costs can be filtered.

| Period | Source | Amount (USD) | Main drivers | Note |
| --- | --- | --- | --- | --- |
| 2026-11-12 → | Billing → Bills | not recorded yet | EC2, RDS, ALB, public IPv4, EBS | Resources running since 2026-11-12 |

## Approval rule

Anything that adds cost or can break the running system needs a written estimate and the owner's approval first: EKS clusters, AWS WAF, RDS Multi-AZ, load tests, fault injection on AWS, deletions.
