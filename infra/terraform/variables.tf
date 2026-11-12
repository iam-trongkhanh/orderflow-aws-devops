variable "aws_region" {
  description = "AWS Region used by OrderFlow"
  type        = string
  default     = "us-east-2"
}

variable "vpc_cidr" {
  description = "IPv4 CIDR block for OrderFlow VPC"
  type        = string
  default     = "10.30.0.0/16"
}

variable "cloudflare_zone_id" {
  description = "Cloudflare Zone ID for khanhcloud.online"
  type        = string
}

variable "my_public_ip_cidr" {
  description = "Public IPv4 CIDR allowed to access ALB"
  type        = string
}