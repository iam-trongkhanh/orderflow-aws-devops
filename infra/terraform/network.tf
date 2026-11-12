resource "aws_vpc" "orderflow" {
  cidr_block           = var.vpc_cidr
  enable_dns_support   = true
  enable_dns_hostnames = true

  tags = {
    Name = "orderflow-vpc"
  }
}

resource "aws_internet_gateway" "orderflow" {
  vpc_id = aws_vpc.orderflow.id

  tags = { Name = "orderflow-igw" }
}


locals {
  subnets = {
    public_a = {
      cidr   = "10.30.1.0/24"
      az     = "us-east-2a"
      public = true
    }
    public_b = {
      cidr   = "10.30.2.0/24"
      az     = "us-east-2b"
      public = true
    }
    private_a = {
      cidr   = "10.30.11.0/24"
      az     = "us-east-2a"
      public = false
    }
    private_b = {
      cidr   = "10.30.12.0/24"
      az     = "us-east-2b"
      public = false
    }
  }
}

resource "aws_subnet" "orderflow" {
  for_each = local.subnets

  vpc_id                  = aws_vpc.orderflow.id
  cidr_block              = each.value.cidr
  availability_zone       = each.value.az
  map_public_ip_on_launch = each.value.public

  tags = { Name = "orderflow-${replace(each.key, "_", "-")}" }
}


resource "aws_route_table" "public" {
  vpc_id = aws_vpc.orderflow.id

  tags = {
    Name = "orderflow-public-rt"
  }
}

resource "aws_route" "public_default" {
  route_table_id         = aws_route_table.public.id
  destination_cidr_block = "0.0.0.0/0"
  gateway_id             = aws_internet_gateway.orderflow.id
}

resource "aws_route_table_association" "public" {
  for_each = {
    for name, subnet in local.subnets :
    name => subnet if subnet.public
  }

  subnet_id      = aws_subnet.orderflow[each.key].id
  route_table_id = aws_route_table.public.id
}


resource "aws_route_table" "private" {
  vpc_id = aws_vpc.orderflow.id

  tags = {
    Name = "orderflow-private-rt"
  }
}


resource "aws_route_table_association" "private" {
  for_each = {
    for name, subnet in local.subnets :
    name => subnet if !subnet.public
  }

  subnet_id      = aws_subnet.orderflow[each.key].id
  route_table_id = aws_route_table.private.id
}
