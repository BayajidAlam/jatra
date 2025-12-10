# Jenkins CI/CD Pipeline for Jatra Railway

This directory contains Jenkins pipeline configuration and scripts for automated building, testing, and deployment of all Jatra Railway microservices.

## 🚀 Quick Start

### 1. Setup Jenkins
```bash
cd /path/to/jatra-railway
chmod +x jenkins/setup-jenkins.sh
./jenkins/setup-jenkins.sh
```

This will:
- Start Jenkins in Docker container
- Install required tools (Docker, kubectl)
- Configure volumes for Kubernetes access
- Display initial admin password

### 2. Configure Jenkins Web UI
1. Open http://localhost:8080
2. Enter the initial admin password (shown after setup)
3. Install suggested plugins
4. Create admin user
5. Complete setup wizard

### 3. Create Pipeline Job
1. Click "New Item"
2. Enter name: `jatra-railway-pipeline`
3. Select "Pipeline"
4. In "Pipeline" section:
   - Definition: "Pipeline script from SCM"
   - SCM: Git
   - Repository URL: (your repo URL)
   - Branch: `*/feature/jenkins-cicd`
   - Script Path: `jenkins/Jenkinsfile`
5. Save

### 4. Run Pipeline
1. Click "Build with Parameters"
2. Choose options:
   - **BUILD_MODE**: 
     - `CHANGED_ONLY` - Build only services with code changes (faster)
     - `ALL_SERVICES` - Build all 11 services
   - **SKIP_TESTS**: Skip running tests
   - **FORCE_DEPLOY**: Deploy even if no changes detected
3. Click "Build"

## 📁 Directory Structure

```
jenkins/
├── Jenkinsfile                 # Main pipeline definition
├── setup-jenkins.sh            # Jenkins setup script
├── README.md                   # This file
└── scripts/
    ├── detect-changes.sh       # Detect which services changed
    ├── build-services.sh       # Build Docker images
    ├── load-to-minikube.sh     # Load images to Minikube
    ├── deploy-k8s.sh           # Deploy to Kubernetes
    └── health-check.sh         # Verify deployment health
```

## 🔧 Pipeline Stages

1. **Checkout** - Clone repository
2. **Detect Changes** - Find which services changed (git diff)
3. **Build Docker Images** - Build changed/all services in parallel
4. **Load to Minikube** - Load images to Minikube registry
5. **Deploy to Kubernetes** - Apply manifests and restart pods
6. **Health Check** - Verify all services are running

## ⚙️ Configuration

### Services List
The pipeline handles these services:
- auth-service
- user-service
- schedule-service
- search-service
- seat-reservation-service
- booking-service
- payment-service
- ticket-service
- notification-service
- admin-service
- reporting-service
- api-gateway

### Environment Variables
- `DOCKER_REGISTRY`: Docker registry prefix (default: `jatra`)
- `IMAGE_TAG`: Git commit short hash (auto-generated)
- `NAMESPACE`: Kubernetes namespace (default: `jatra`)

## 🎯 Build Modes

### Changed Only (Recommended)
- Detects changes using `git diff`
- Builds only modified services
- Typical build time: 30-60 seconds
- Best for rapid iteration

### All Services
- Builds all 11 services
- Parallel execution
- Typical build time: 3-5 minutes
- Use for major changes or after long time

## 📊 Monitoring

### View Build Logs
- Click on build number
- Select "Console Output"
- See real-time progress

### Check Kubernetes Status
```bash
kubectl get pods -n jatra
kubectl logs -f <pod-name> -n jatra
```

### View Build Summary
Each build generates `build-summary.txt` with:
- Build mode
- Services built
- Build time
- Image tags
- Status

## 🔄 Triggering Builds

### Manual Trigger
1. Go to Jenkins dashboard
2. Click "Build with Parameters"
3. Select options and build

### Automatic Trigger (Optional)
Add webhook in GitHub:
1. Go to repo Settings → Webhooks
2. Add webhook: `http://your-jenkins:8080/github-webhook/`
3. Enable in Jenkinsfile under `triggers`

## 🛠️ Troubleshooting

### Jenkins Can't Access Docker
```bash
docker exec -u root jenkins chmod 666 /var/run/docker.sock
```

### Minikube Connection Issues
```bash
# Ensure Minikube is running
minikube status

# Copy kubeconfig to Jenkins
docker cp ~/.kube jenkins:/var/jenkins_home/.kube
```

### Build Failures
- Check `/tmp/build-<service>.log` in Jenkins container
- Verify Dockerfile syntax
- Ensure dependencies are available

### Deployment Issues
- Check pod status: `kubectl get pods -n jatra`
- View logs: `kubectl logs <pod> -n jatra`
- Check events: `kubectl get events -n jatra --sort-by='.lastTimestamp'`

## 📝 Development

### Adding New Service
1. Add service to `SERVICES` array in:
   - `detect-changes.sh`
   - `build-services.sh`
   - `load-to-minikube.sh`
2. Create Dockerfile in `apps/<service>/`
3. Create deployment YAML in `infra/kubernetes/deployments/`

### Modifying Pipeline
- Edit `Jenkinsfile` for stage changes
- Edit scripts in `jenkins/scripts/` for logic changes
- Make scripts executable: `chmod +x jenkins/scripts/*.sh`

## 🎓 Best Practices

1. **Use CHANGED_ONLY** for development
2. **Use ALL_SERVICES** before production
3. **Monitor build logs** for issues
4. **Check health checks** after deployment
5. **Commit often** for accurate change detection

## 📚 Resources

- [Jenkins Documentation](https://www.jenkins.io/doc/)
- [Kubernetes Documentation](https://kubernetes.io/docs/)
- [Docker Documentation](https://docs.docker.com/)
- [Minikube Documentation](https://minikube.sigs.k8s.io/docs/)
