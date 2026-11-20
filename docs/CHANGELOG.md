# Changelog

## 2026-11-20

- Part 2, section 2: pull the image on EC2 with the instance role and check the CPU architecture.

## 2026-11-19

- Part 2 started: build and push the `linux/amd64` image to ECR (`orderflow-api:7ded466`).
- Part 1 guide: empty AWS account → verified infrastructure → Session Manager shell → Docker on EC2.
- Incident index with 393 scenarios; INC-03 write-up (IAM-019).
- Operator Session Manager policy with placeholders; IAM policy overview.
- Progress ledger, `progress.yaml`, evidence manifest with evidence IDs, cost ledger.
- README: current status, architecture, links.
- App source, Dockerfile, migrations and tests published (`7ded466`); raw evidence kept out of git (`cc49d3a`).

## 2026-11-12

- Terraform for VPC, security groups, IAM, ECR, EC2, RDS, ACM, ALB and Cloudflare DNS validation (`ea4196f`).
