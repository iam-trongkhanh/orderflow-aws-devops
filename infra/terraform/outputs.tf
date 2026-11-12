output "vpc_id" {
  description = "OrderFlow VPC ID"
  value       = aws_vpc.orderflow.id
}

output "subnet_ids" {
  description = "OrderFlow subnet IDs"
  value = {
    for name, subnet in aws_subnet.orderflow : name => subnet.id
  }
}