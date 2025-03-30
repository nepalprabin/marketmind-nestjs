# main.tf - with updated PostgreSQL and EKS versions
terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 4.0"
    }
    kubernetes = {
      source  = "hashicorp/kubernetes"
      version = "~> 2.16"
    }
  }

  backend "s3" {
    bucket = "marketmind-terraform-state"
    key    = "terraform.tfstate"
    region = "us-east-1"
  }
}

provider "aws" {
  region = "us-east-1"
}

# VPC and Networking
module "vpc" {
  source  = "terraform-aws-modules/vpc/aws"
  version = "3.14.0"

  name = "marketmind-vpc"
  cidr = "10.0.0.0/16"

  azs             = ["us-east-1a", "us-east-1b", "us-east-1c"]
  private_subnets = ["10.0.1.0/24", "10.0.2.0/24", "10.0.3.0/24"]
  public_subnets  = ["10.0.101.0/24", "10.0.102.0/24", "10.0.103.0/24"]

  enable_nat_gateway = true
  single_nat_gateway = true
  enable_vpn_gateway = false

  tags = {
    Environment = "production"
    Project     = "marketmind"
  }
}

# ECR Repository
resource "aws_ecr_repository" "marketmind_api" {
  name                 = "marketmind-api"
  image_tag_mutability = "MUTABLE"

  image_scanning_configuration {
    scan_on_push = true
  }
}

# AWS Secrets Manager for DB credentials
resource "aws_secretsmanager_secret" "db_credentials" {
  name = "marketmind-db-credentials"
}

resource "aws_secretsmanager_secret_version" "db_credentials" {
  secret_id = aws_secretsmanager_secret.db_credentials.id
  secret_string = jsonencode({
    username = "marketmind_admin"
    password = "REPLACE_WITH_SECURE_PASSWORD" # Use a secure password in production
    engine   = "postgres"
    host     = aws_db_instance.marketmind_db.address
    port     = aws_db_instance.marketmind_db.port
    dbname   = "marketmind"
  })
}

# RDS PostgreSQL Instance
resource "aws_db_subnet_group" "marketmind" {
  name       = "marketmind-db-subnet-group"
  subnet_ids = module.vpc.private_subnets
}

resource "aws_db_instance" "marketmind_db" {
  identifier                = "marketmind-db"
  allocated_storage         = 20
  storage_type              = "gp2"
  engine                    = "postgres"
  engine_version            = "14" # Updated from 14.5 to a supported version
  instance_class            = "db.t3.medium"
  db_name                   = "marketmind"
  username                  = "marketmind_admin"
  password                  = "REPLACE_WITH_SECURE_PASSWORD" # Use a secure password in production
  parameter_group_name      = "default.postgres14"
  skip_final_snapshot       = false
  final_snapshot_identifier = "marketmind-db-final-snapshot"
  vpc_security_group_ids    = [aws_security_group.rds.id]
  db_subnet_group_name      = aws_db_subnet_group.marketmind.name
  backup_retention_period   = 7
  backup_window             = "03:00-06:00"
  maintenance_window        = "Mon:00:00-Mon:03:00"

  tags = {
    Environment = "production"
    Project     = "marketmind"
  }
}

# Security Group for RDS
resource "aws_security_group" "rds" {
  name        = "marketmind-rds-sg"
  description = "Allow PostgreSQL inbound traffic from EKS cluster"
  vpc_id      = module.vpc.vpc_id

  ingress {
    description     = "PostgreSQL from EKS"
    from_port       = 5432
    to_port         = 5432
    protocol        = "tcp"
    security_groups = [module.eks.cluster_security_group_id]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "marketmind-rds-sg"
  }
}

# EKS Cluster
module "eks" {
  source          = "terraform-aws-modules/eks/aws"
  version         = "18.30.0"
  cluster_name    = "marketmind-cluster"
  cluster_version = "1.27" # Updated from 1.24 to a supported version
  subnet_ids      = module.vpc.private_subnets
  vpc_id          = module.vpc.vpc_id

  eks_managed_node_groups = {
    general = {
      desired_size = 2
      min_size     = 1
      max_size     = 3

      instance_types = ["t3.medium"]
      capacity_type  = "ON_DEMAND"
    }
  }

  tags = {
    Environment = "production"
    Project     = "marketmind"
  }
}

# IAM Roles for GitHub Actions
resource "aws_iam_role" "github_actions" {
  name = "github-actions-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRoleWithWebIdentity"
        Effect = "Allow"
        Principal = {
          Federated = aws_iam_openid_connect_provider.github_actions.arn
        }
        Condition = {
          StringEquals = {
            "token.actions.githubusercontent.com:aud" = "sts.amazonaws.com"
          }
          StringLike = {
            "token.actions.githubusercontent.com:sub" = "repo:nepalprabin/marketmind-nestjs:*"
          }
        }
      }
    ]
  })
}

resource "aws_iam_openid_connect_provider" "github_actions" {
  url = "https://token.actions.githubusercontent.com"

  client_id_list = [
    "sts.amazonaws.com",
  ]

  thumbprint_list = [
    "6938fd4d98bab03faadb97b34396831e3780aea1"
  ]
}

resource "aws_iam_policy" "github_actions_policy" {
  name        = "github-actions-policy"
  description = "Policy for GitHub Actions to interact with AWS resources"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = [
          "ecr:GetAuthorizationToken",
          "ecr:BatchCheckLayerAvailability",
          "ecr:GetDownloadUrlForLayer",
          "ecr:BatchGetImage",
          "ecr:InitiateLayerUpload",
          "ecr:UploadLayerPart",
          "ecr:CompleteLayerUpload",
          "ecr:PutImage"
        ]
        Effect   = "Allow"
        Resource = "*"
      },
      {
        Action = [
          "eks:DescribeCluster",
          "eks:ListClusters"
        ]
        Effect   = "Allow"
        Resource = "*"
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "github_actions_attachment" {
  role       = aws_iam_role.github_actions.name
  policy_arn = aws_iam_policy.github_actions_policy.arn
}

# S3 Bucket for future use
resource "aws_s3_bucket" "marketmind_assets" {
  bucket = "marketmind-assets"

  tags = {
    Name        = "MarketMind Assets"
    Environment = "Production"
  }
}

resource "aws_s3_bucket_versioning" "marketmind_assets_versioning" {
  bucket = aws_s3_bucket.marketmind_assets.id
  versioning_configuration {
    status = "Enabled"
  }
}

# Outputs
output "ecr_repository_url" {
  value = aws_ecr_repository.marketmind_api.repository_url
}

output "eks_cluster_endpoint" {
  value = module.eks.cluster_endpoint
}

output "eks_cluster_name" {
  value = module.eks.cluster_id # Corrected from cluster_name
}

output "rds_hostname" {
  value = aws_db_instance.marketmind_db.address
}

output "rds_port" {
  value = aws_db_instance.marketmind_db.port
}
