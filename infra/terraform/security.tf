# ==========================================
# 1. CREATE SECURITY GROUPS
# ==========================================

# ALB Security Group
resource "aws_security_group" "alb" {
  name        = "orderflow-alb-sg"
  description = "Security group for OrderFlow ALB"
  vpc_id      = aws_vpc.orderflow.id

  tags = {
    Name = "orderflow-alb-sg"
  }
}

# EC2 Security Group
resource "aws_security_group" "ec2" {
  name        = "orderflow-ec2-sg"
  description = "Security group for OrderFlow EC2"
  vpc_id      = aws_vpc.orderflow.id

  tags = {
    Name = "orderflow-ec2-sg"
  }
}

# RDS Security Group
resource "aws_security_group" "rds" {
  name        = "orderflow-rds-sg"
  description = "Security group for OrderFlow PostgreSQL"
  vpc_id      = aws_vpc.orderflow.id

  tags = {
    Name = "orderflow-rds-sg"
  }
}


# ==========================================
# 2. ALB SECURITY GROUP RULES
# ==========================================

# Rule 1: Your IP -> ALB :443
resource "aws_vpc_security_group_ingress_rule" "alb_https" {
  security_group_id = aws_security_group.alb.id

  cidr_ipv4   = var.my_public_ip_cidr
  ip_protocol = "tcp"
  from_port   = 443
  to_port     = 443
}

# Rule 2: ALB -> EC2 :8080
resource "aws_vpc_security_group_egress_rule" "alb_to_ec2" {
  security_group_id = aws_security_group.alb.id

  referenced_security_group_id = aws_security_group.ec2.id
  ip_protocol                  = "tcp"
  from_port                    = 8080
  to_port                      = 8080
}


# ==========================================
# 3. EC2 SECURITY GROUP RULES
# ==========================================

# Rule 3: ALB -> EC2 :8080
resource "aws_vpc_security_group_ingress_rule" "ec2_from_alb" {
  security_group_id = aws_security_group.ec2.id

  referenced_security_group_id = aws_security_group.alb.id
  ip_protocol                  = "tcp"
  from_port                    = 8080
  to_port                      = 8080
}

# Rule 4: EC2 -> RDS :5432
resource "aws_vpc_security_group_egress_rule" "ec2_to_rds" {
  security_group_id = aws_security_group.ec2.id

  referenced_security_group_id = aws_security_group.rds.id
  ip_protocol                  = "tcp"
  from_port                    = 5432
  to_port                      = 5432
}

# Rule 5: EC2 -> HTTPS :443
resource "aws_vpc_security_group_egress_rule" "ec2_https" {
  security_group_id = aws_security_group.ec2.id

  cidr_ipv4   = "0.0.0.0/0"
  ip_protocol = "tcp"
  from_port   = 443
  to_port     = 443
}


# ==========================================
# 4. RDS SECURITY GROUP RULES
# ==========================================

# Rule 6: EC2 -> RDS :5432
resource "aws_vpc_security_group_ingress_rule" "rds_from_ec2" {
  security_group_id = aws_security_group.rds.id

  referenced_security_group_id = aws_security_group.ec2.id
  ip_protocol                  = "tcp"
  from_port                    = 5432
  to_port                      = 5432
}