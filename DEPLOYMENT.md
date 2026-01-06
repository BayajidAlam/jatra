# Production Deployment Guide (AWS)

This guide explains how to deploy the "Jatra Railway" infrastructure using industry-standard tools (`eksctl` and `helm`), as per the Thesis methodology.

## 1. Prerequisites
- AWS CLI configured (`aws configure`)
- `eksctl` installed
- `kubectl` installed
- `helm` installed

## 2. Infrastructure Provisioning (No Pulumi needed)

Instead of complex IaC scripts, we use `eksctl` for a simplified "GitOps" friendly approach.

### Step 2.1: Create EKS Cluster
```bash
eksctl create cluster \
  --name jatra-cluster \
  --region ap-southeast-1 \
  --nodegroup-name standard-workers \
  --node-type t3.medium \
  --nodes 3 \
  --nodes-min 1 \
  --nodes-max 4 \
  --managed
```
*Effect*: Creates VPC, Subnets, Internet Gateway, and Kubernetes Control Plane.

### Step 2.3: Create ECR Repositories
We need a place to store our Docker images. Run this for each service (or use a script):
```bash
aws ecr create-repository --repository-name jatra-api-gateway
aws ecr create-repository --repository-name jatra-auth-service
# ... repeat for all 12 services
```

## 3. Application Deployment (CI/CD)

We use **Jenkins** to build and deploy.

### Step 3.1: Connect Jenkins to EKS
Ensure your Jenkins server has the `aws-iam-authenticator` installed and configured with the same credentials used to create the cluster.

### Step 3.2: The Pipeline Support
The project includes a `Jenkinsfile` (implied) that:
1.  Builds Docker Image: `docker build -t jatra-api-gateway .`
2.  Pushes to ECR: `docker push 123456789.dkr.ecr.ap-southeast-1.amazonaws.com/jatra-api-gateway`
3.  Deploys to K8s: `helm upgrade --install jatra ...`

## 4. Manual Deployment (Fallback)
If Jenkins is not set up, you can manually run:
```bash
aws eks update-kubeconfig --name jatra-cluster --region ap-southeast-1
helm upgrade --install jatra ./infra/helm/jatra \
  -f ./infra/helm/jatra/values-prod.yaml \
  --set global.databaseUrl="postgresql://postgres:YourStrongPassword123!@jatra-db-prod..."
```

## 5. Why not Pulumi/Terraform?
For this project scope, **Helm** manages the *Application* lifecycle, and **eksctl** manages the *Infrastructure* lifecycle. This "Split-Stack" approach is standard for microservices and removes the need for a monolithic Pulumi state file, making it easier for a single developer to maintain.
