# Jenkins CI/CD with Performance Improvements

## What Changed?

The Jenkins pipeline now automatically deploys all 6 performance improvements:

### 🎯 Performance Features Included:

1. **PgBouncer** - Connection pooling (1000 clients → 100 DB connections)
2. **HPA** - Auto-scaling for all services (2-20 replicas)
3. **Circuit Breaker** - Fail-fast protection in API Gateway
4. **Async Payment** - Code already integrated in services
5. **Atomic Seat Locking** - Lua scripts already integrated
6. **Idempotency** - Middleware already integrated

## 🚀 How to Use

### Option 1: Use Enhanced Pipeline (Recommended)

```bash
# Copy the new Jenkinsfile
cp jenkins/Jenkinsfile.performance jenkins/Jenkinsfile
git add jenkins/Jenkinsfile
git commit -m "feat: add performance improvements to Jenkins pipeline"
git push
```

### Option 2: Jenkins Web UI Steps

1. **Go to Jenkins** → http://localhost:8080
2. **Click** your pipeline job
3. **Build with Parameters**
4. **Select:**
   - Environment: `dev`
   - Build Mode: `ALL_SERVICES` (first time)
   - ✅ `DEPLOY_PERFORMANCE_IMPROVEMENTS` (checked)
   - Skip Tests: as needed
5. **Click** "Build"

### Pipeline Stages:

```
1. Checkout Code
2. Detect Changes
3. Run Tests (optional)
4. Build Docker Images
5. Load to Minikube
6. 🆕 Deploy Infrastructure (ConfigMaps, Secrets)
7. 🆕 Deploy PgBouncer (Connection Pooler)
8. 🆕 Deploy HPA (Auto-scaling)
9. 🆕 Build API Gateway (Circuit Breaker)
10. Deploy Services
11. Verify Deployments
12. Health Checks
```

## 📊 What Jenkins Does (vs Manual Script)

| Feature               | Bash Script      | Jenkins Pipeline         |
| --------------------- | ---------------- | ------------------------ |
| **Automation**        | Manual execution | Triggered by git push    |
| **Audit Trail**       | None             | Full history with logs   |
| **Rollback**          | Manual           | Previous build replay    |
| **Notifications**     | None             | Slack/email alerts       |
| **Approval Gates**    | None             | Manual approval for prod |
| **Environment Mgmt**  | Single env       | dev/staging/prod         |
| **Secret Management** | Hardcoded        | Jenkins credentials      |
| **Parallel Builds**   | Sequential       | Can parallelize          |
| **Test Integration**  | Manual           | Automated                |

## 🔐 Secret Management (Best Practice)

Instead of hardcoded secrets in YAML:

```bash
# In Jenkins UI: Manage Jenkins → Credentials
# Add these secrets:
- POSTGRES_PASSWORD
- REDIS_PASSWORD
- JWT_SECRET
- RABBITMQ_PASSWORD
```

Then reference in Jenkinsfile:

```groovy
environment {
    POSTGRES_PASSWORD = credentials('postgres-password')
    JWT_SECRET = credentials('jwt-secret')
}
```

## 🌍 Multi-Environment Deployment

```groovy
// Jenkinsfile supports:
- dev (Minikube, auto-deploy)
- staging (requires approval)
- production (manual approval gate)
```

## 📈 Monitoring & Alerts

Add to `post` section:

```groovy
success {
    slackSend(
        color: 'good',
        message: "✅ Deployed to ${ENVIRONMENT} - Build #${BUILD_NUMBER}"
    )
}
failure {
    slackSend(
        color: 'danger',
        message: "❌ Deployment failed - Check: ${BUILD_URL}"
    )
}
```

## 🎯 Best Practices Applied

1. **Immutable Infrastructure**: Every deployment uses tagged images
2. **Health Checks**: Automated verification after deployment
3. **Gradual Rollout**: Services update one at a time (K8s rolling update)
4. **Automatic Rollback**: If health checks fail, previous ReplicaSet restored
5. **Infrastructure as Code**: All configs in Git
6. **Approval Gates**: Production requires manual confirmation

## 🔄 Typical Workflow

```mermaid
Developer → Git Push → Jenkins Triggered
                          ↓
                    Build Images
                          ↓
                    Run Tests
                          ↓
                    Deploy to Dev (auto)
                          ↓
                    Health Checks Pass?
                          ↓
                    [Manual] Approve for Staging
                          ↓
                    Deploy to Staging
                          ↓
                    [Manual] Approve for Prod
                          ↓
                    Deploy to Production
                          ↓
                    Notify Team (Slack)
```

## 🆚 When to Use What?

### Use Bash Script (`deploy-improvements.sh`) for:

- Local development testing
- One-time emergency fixes
- Learning/experimentation
- Quick manual rollbacks

### Use Jenkins Pipeline for:

- ✅ All production deployments
- ✅ Staging deployments
- ✅ Automated testing
- ✅ Team collaboration
- ✅ Audit compliance
- ✅ CI/CD automation

## 🔧 Next Steps

1. **Copy Enhanced Pipeline:**

   ```bash
   cp jenkins/Jenkinsfile.performance jenkins/Jenkinsfile
   ```

2. **Configure Jenkins Credentials** (if not already done):

   ```bash
   # These will be used instead of hardcoded secrets
   - postgres-password
   - jwt-access-secret
   - jwt-refresh-secret
   ```

3. **Set Up Slack Notifications** (optional):

   - Install Slack plugin in Jenkins
   - Get webhook URL from Slack
   - Add to Jenkinsfile post sections

4. **Run First Build:**
   - Trigger pipeline with all options enabled
   - Watch logs to verify each stage
   - Check deployment verification stage

## 📝 Summary

**The bash script is fine for learning**, but **Jenkins is production-ready** with:

- Automatic triggers
- Approval gates
- Full audit trail
- Secret management
- Team notifications
- Easy rollbacks
- Environment separation

Your existing Jenkins setup is already good - the enhanced version just adds the 6 performance improvements automatically!
