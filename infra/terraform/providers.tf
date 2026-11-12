provider "aws" {
  region  = var.aws_region
  profile = "orderflow-lab"


  default_tags {
    tags = {
      Project     = "CLOUD-PROD-001"
      Environment = "lab"
      ManagedBy   = "Terraform"
    }
  }
}

provider "cloudflare" {}
