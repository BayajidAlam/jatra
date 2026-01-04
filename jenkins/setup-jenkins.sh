#!/bin/bash
# Jenkins Setup Script for Jatra Railway Project
# This script sets up Jenkins in Docker with all required configurations

set -e

echo "🚀 Setting up Jenkins for Jatra Railway..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

# Check if Jenkins container already exists
if docker ps -a | grep -q jenkins; then
    echo "⚠️  Jenkins container already exists. Removing it..."
    docker stop jenkins 2>/dev/null || true
    docker rm jenkins 2>/dev/null || true
fi

# Create Jenkins container with Docker and Kubernetes access
echo "📦 Creating Jenkins container..."
docker run -d \
  --name jenkins \
  --restart unless-stopped \
  -p 8080:8080 \
  -p 50000:50000 \
  -v jenkins_home:/var/jenkins_home \
  -v /var/run/docker.sock:/var/run/docker.sock \
  -v ~/.kube:/var/jenkins_home/.kube:ro \
  -v ~/.minikube:/var/jenkins_home/.minikube:ro \
  -v $(pwd):/workspace:ro \
  -e JENKINS_OPTS="--prefix=/jenkins" \
  jenkins/jenkins:lts-jdk17

echo "⏳ Waiting for Jenkins to start (this may take 1-2 minutes)..."
sleep 30

# Wait for Jenkins to be ready
until docker exec jenkins cat /var/jenkins_home/secrets/initialAdminPassword > /dev/null 2>&1; do
    echo "   Still waiting for Jenkins to initialize..."
    sleep 10
done

# Get initial admin password
ADMIN_PASSWORD=$(docker exec jenkins cat /var/jenkins_home/secrets/initialAdminPassword)

# Install Docker CLI inside Jenkins container
echo "🐳 Installing Docker CLI inside Jenkins..."
docker exec -u root jenkins sh -c "apt-get update && apt-get install -y docker.io kubectl"

# Install kubectl inside Jenkins
echo "☸️  Installing kubectl inside Jenkins..."
docker exec -u root jenkins sh -c "curl -LO https://dl.k8s.io/release/\$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl && chmod +x kubectl && mv kubectl /usr/local/bin/"

echo ""
echo "✅ Jenkins is ready!"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🌐 Access Jenkins at: http://localhost:8080"
echo "🔑 Initial Admin Password: $ADMIN_PASSWORD"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📝 Next Steps:"
echo "   1. Open http://localhost:8080 in your browser"
echo "   2. Enter the password above"
echo "   3. Install suggested plugins"
echo "   4. Create admin user"
echo "   5. Run: ./jenkins/scripts/configure-jenkins.sh"
echo ""
