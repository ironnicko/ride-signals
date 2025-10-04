provider "aws" {
  region = "ap-south-2"
}

resource "aws_ecs_cluster" "this" {
  name = "Ride-Signals-cluster"
}

resource "aws_acm_certificate" "app_cert" {
  domain_name       = "nikhilivannan.live"
  validation_method = "DNS"

  subject_alternative_names = [
    "www.nikhilivannan.live"
  ]

  lifecycle {
    create_before_destroy = true
  }
}

# resource "aws_acm_certificate_validation" "app_cert_validation" {
#   certificate_arn         = aws_acm_certificate.app_cert.arn
#   validation_record_fqdns = [for record in aws_route53_record.app_cert_validation : record.fqdn]
# }


resource "aws_iam_role" "ecs_task_execution_role" {
  name = "ecsTaskExecutionRole"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action = "sts:AssumeRole"
      Principal = {
        Service = "ecs-tasks.amazonaws.com"
      }
      Effect = "Allow"
    }]
  })
}

resource "aws_iam_role_policy_attachment" "ecs_task_execution_role_policy" {
  role       = aws_iam_role.ecs_task_execution_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
}

resource "aws_cloudwatch_log_group" "backend" {
  name              = "/ecs/backend"
  retention_in_days = 7
}

resource "aws_cloudwatch_log_group" "frontend" {
  name              = "/ecs/frontend"
  retention_in_days = 7
}


locals {
  backend_env = tomap({
    for tuple in regexall("(\\w+)=(.*)", file("${path.module}/backend.env")) :
    tuple[0] => tuple[1]
  })

  frontend_env_file = tomap({
    for tuple in regexall("(\\w+)=(.*)", file("${path.module}/frontend.env")) :
    tuple[0] => tuple[1]
  })

  backend_url = "http://${aws_lb.app.dns_name}/api/v1"

  frontend_env = merge(
    local.frontend_env_file,
    { NEXT_PUBLIC_API_URL = local.backend_url }
  )

}

