data "aws_ssm_parameter" "al2023" {
  name = "/aws/service/ami-amazon-linux-latest/al2023-ami-kernel-default-x86_64"
}

resource "aws_instance" "api" {
  ami           = data.aws_ssm_parameter.al2023.value
  instance_type = "t3.medium"

  subnet_id                   = aws_subnet.orderflow["public_a"].id
  associate_public_ip_address = true

  vpc_security_group_ids = [aws_security_group.ec2.id]

  # Root EBS volume
  root_block_device {
    volume_type           = "gp3"
    volume_size           = 30
    encrypted             = true
    delete_on_termination = true
  }

  # Require IMDSv2
  metadata_options {
    http_endpoint = "enabled"
    http_tokens   = "required"
  }

  iam_instance_profile = aws_iam_instance_profile.ec2.name

  tags = {
    Name    = "orderflow-api"
    Project = "CLOUD-PROD-001"
  }
}