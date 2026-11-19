# IAM policies

Everything the operator user `orderflow-operator` can do, and why. Replace `<ACCOUNT_ID>` and `<INSTANCE_ID>` with your own values before use.

| Policy | Type | Purpose | File |
| --- | --- | --- | --- |
| `SignInLocalDevelopmentAccess` | AWS managed | Lets `aws login` exchange a console sign-in for short-lived CLI credentials | — |
| `ReadOnlyAccess` | AWS managed | Read-only `describe` calls for verification. Broad; to be narrowed later | — |
| `OrderFlowTerraformDeployPolicy` | Customer managed | Lets Terraform create, change and delete the 40 OrderFlow resources | Not published yet |
| `orderflow-operator-ssm-session` | Customer managed | Shell on the OrderFlow EC2 instance through Session Manager, own sessions only | [JSON](orderflow-operator-ssm-session.json) |

The EC2 instance role `orderflow-ec2-role` is defined in [`iam.tf`](../../infra/terraform/iam.tf): SSM core, ECR pull-only and CloudWatch agent.

## Export a policy you already have

```bash
POLICY_ARN=$(aws iam list-policies --scope Local \
  --query "Policies[?PolicyName=='OrderFlowTerraformDeployPolicy'].Arn" --output text)
VERSION=$(aws iam get-policy --policy-arn "$POLICY_ARN" --query Policy.DefaultVersionId --output text)
aws iam get-policy-version --policy-arn "$POLICY_ARN" --version-id "$VERSION" \
  --query PolicyVersion.Document --output json > OrderFlowTerraformDeployPolicy.json
```

Replace the account ID with `<ACCOUNT_ID>` before committing.
