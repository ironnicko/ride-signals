module "vpc" {
  source  = "terraform-aws-modules/vpc/aws"
  version = "5.1.2"

  name = "tandem-sync-vpc"
  cidr = "10.0.0.0/16"

  azs             = ["ap-south-2a", "ap-south-2b"]
  public_subnets  = ["10.0.1.0/24", "10.0.2.0/24"]
  private_subnets = ["10.0.4.0/24", "10.0.5.0/24"]

  enable_nat_gateway = false
  single_nat_gateway = false

  enable_dns_support   = true
  enable_dns_hostnames = true
}
