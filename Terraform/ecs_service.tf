resource "aws_ecs_service" "backend" {
  name            = "backend-service"
  cluster         = aws_ecs_cluster.this.id
  task_definition = aws_ecs_task_definition.backend.arn
  desired_count   = 1
  launch_type     = "FARGATE"

  network_configuration {
    subnets = module.vpc.public_subnets
    security_groups = [aws_security_group.ecs_tasks.id]
    assign_public_ip = true
  }


  load_balancer {
    target_group_arn = aws_lb_target_group.backend.arn
    container_name   = "backend"
    container_port   = 8080
  }
  depends_on = [
    aws_lb_target_group.backend
  ]
}

resource "aws_ecs_service" "frontend" {
  name            = "frontend-service"
  cluster         = aws_ecs_cluster.this.id
  task_definition = aws_ecs_task_definition.frontend.arn
  desired_count   = 1
  launch_type     = "FARGATE"


  network_configuration {
    subnets = module.vpc.public_subnets
    security_groups = [aws_security_group.ecs_tasks.id]
    assign_public_ip = true
  }


  load_balancer {
    target_group_arn = aws_lb_target_group.frontend.arn
    container_name   = "frontend"
    container_port   = 3000
  }
  depends_on = [
    aws_lb_target_group.frontend
  ]
}

output "alb_dns" {
  value = aws_lb.app.dns_name
}
