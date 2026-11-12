resource "aws_db_subnet_group" "orderflow" {
  name        = "orderflow-db-subnets"
  description = "Private subnets for OrderFlow PostgreSQL"

  subnet_ids = [
    aws_subnet.orderflow["private_a"].id,
    aws_subnet.orderflow["private_b"].id
  ]

  tags = {
    Name    = "orderflow-db-subnets"
    Project = "CLOUD-PROD-001"
  }
}

resource "aws_db_instance" "orderflow" {
  identifier     = "orderflow-postgres"
  engine         = "postgres"
  engine_version = "17"
  instance_class = "db.t4g.micro"

  allocated_storage = 20
  storage_type      = "gp3"
  storage_encrypted = true

  db_name                     = "orderflow"
  username                    = "orderflow_admin"
  manage_master_user_password = true

  db_subnet_group_name = aws_db_subnet_group.orderflow.name

  vpc_security_group_ids = [
    aws_security_group.rds.id
  ]

  port                = 5432
  publicly_accessible = false
  multi_az            = false

  # Backup
  backup_retention_period = 7
  copy_tags_to_snapshot   = true

  # Deletion protection
  deletion_protection       = true
  skip_final_snapshot       = false
  final_snapshot_identifier = "orderflow-postgres-final"

  tags = {
    Name    = "orderflow-postgres"
    Project = "CLOUD-PROD-001"
  }
}