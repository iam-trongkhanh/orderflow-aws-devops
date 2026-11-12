resource "aws_ecr_repository" "api" {
  name                 = "orderflow-api"
  image_tag_mutability = "IMMUTABLE"

  image_scanning_configuration { scan_on_push = true }

  tags = {
    Name = "orderflow-api"
  }
}