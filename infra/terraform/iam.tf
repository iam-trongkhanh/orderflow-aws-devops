data "aws_iam_policy_document" "ec2_assume_role" {
  statement {
    effect  = "Allow"
    actions = ["sts:AssumeRole"]

    principals {
      type        = "Service"
      identifiers = ["ec2.amazonaws.com"]

    }
  }
}


resource "aws_iam_role" "ec2" {
  name               = "orderflow-ec2-role"
  assume_role_policy = data.aws_iam_policy_document.ec2_assume_role.json

  tags = {
    Name = "orderflow-ec2-role"
  }
}

resource "aws_iam_role_policy_attachment" "ssm" {
  role       = aws_iam_role.ec2.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonSSMManagedInstanceCore"
}


# 1. ECR — Cho phép EC2 pull Docker images
resource "aws_iam_role_policy_attachment" "ecr" {
  role       = aws_iam_role.ec2.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonEC2ContainerRegistryPullOnly"
}

# 2. CloudWatch — Cho phép CloudWatch Agent gửi logs/metrics
resource "aws_iam_role_policy_attachment" "cloudwatch" {
  role       = aws_iam_role.ec2.name
  policy_arn = "arn:aws:iam::aws:policy/CloudWatchAgentServerPolicy"
}

# 3. Instance Profile — Liên kết IAM Role với EC2
resource "aws_iam_instance_profile" "ec2" {
  name = "orderflow-ec2-profile"
  role = aws_iam_role.ec2.name

  tags = {
    Name = "orderflow-ec2-profile"
  }
}