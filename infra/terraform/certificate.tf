
# ==========================================
# M2-06 — ACM + CLOUDFLARE DNS VALIDATION
# ==========================================

# 1. Request an ACM certificate
resource "aws_acm_certificate" "orderflow" {
  domain_name       = "orderflow.khanhcloud.online"
  validation_method = "DNS"

  lifecycle {
    create_before_destroy = true
  }

  tags = {
    Name    = "orderflow-certificate"
    Project = "CLOUD-PROD-001"
  }
}

# This certificate has exactly one domain
locals {
  acm_validation = one(
    aws_acm_certificate.orderflow.domain_validation_options
  )
}

# 2. Create ACM validation CNAME in Cloudflare
resource "cloudflare_dns_record" "acm_validation" {
  zone_id = var.cloudflare_zone_id

  name    = trimsuffix(local.acm_validation.resource_record_name, ".")
  type    = local.acm_validation.resource_record_type
  content = trimsuffix(local.acm_validation.resource_record_value, ".")

  ttl     = 1
  proxied = false

  comment = "ACM validation for OrderFlow"
}

# 3. Wait until ACM certificate is issued
resource "aws_acm_certificate_validation" "orderflow" {
  certificate_arn = aws_acm_certificate.orderflow.arn

  validation_record_fqdns = [
    cloudflare_dns_record.acm_validation.name
  ]
}
