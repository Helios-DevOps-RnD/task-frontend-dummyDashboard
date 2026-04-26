# Jenkins CI/CD Pipeline Setup Guide

This guide covers setting up Jenkins pipelines for the task-frontend project with staging and main branch workflows.

## Environment Overview

- **Jenkins VM IP**: 10.0.2.4
- **Jenkins Port**: 8080
- **SonarQube Port**: 9000
- **Network**: Azure Private Subnet with NAT Gateway
- **Access**: Azure Point-to-Site VPN

## Prerequisites

### Jenkins Plugins Required

Install these plugins in Jenkins (Manage Jenkins → Manage Plugins):

1. **Pipeline** - For declarative pipelines
2. **Git** - For Git integration
3. **Docker Pipeline** - For Docker operations
4. **SonarQube Scanner** - For SonarQube integration
5. **HTML Publisher** - For publishing HTML reports
6. **Credentials Binding** - For credential management
7. **Slack Notification** (optional) - For notifications
8. **Email Extension** (optional) - For email notifications

### System Requirements

- Docker installed on Jenkins VM
- Node.js 18+ installed
- npm installed
- Trivy installed (or will be installed during pipeline)
- sonar-scanner installed (or will be installed during pipeline)
- Git installed

## Jenkins Configuration

### 1. Configure System Settings

Go to **Manage Jenkins → Configure System**

#### SonarQube Configuration
- **Name**: SonarQube
- **Server URL**: `http://10.0.2.4:9000`
- **Server Authentication Token**: Add your SonarQube token

#### Global Tool Configuration
- **Git**: Ensure Git is configured
- **Docker**: Ensure Docker is available
- **Node.js**: Add Node.js installation (if using NodeJS plugin)

### 2. Create Credentials

Go to **Manage Jenkins → Manage Credentials → System → Global credentials**

#### Add SonarQube Token
- **Kind**: Secret text
- **Secret**: Your SonarQube authentication token
- **ID**: `sonarqube-token`

#### Add Harbor Registry Credentials
- **Kind**: Username with password
- **Username**: Your Harbor username
- **Password**: Your Harbor password
- **ID**: `harbor-credentials`

#### Add SSH Key for Deployment (Main branch only)
- **Kind**: SSH Username with private key
- **Username**: `deploy`
- **Private Key**: Your SSH private key
- **ID**: `deploy-ssh-key`

### 3. Create Pipeline Jobs

#### Job 1: Staging Pipeline

1. **New Item** → Enter name: `task-frontend-staging`
2. **Type**: Pipeline
3. **Configuration**:
   - **Build Triggers**:
     - ✅ GitHub hook trigger for GITScm polling (if using GitHub)
     - Or: Poll SCM with schedule `H/5 * * * *` (every 5 minutes)
   - **Pipeline**:
     - **Definition**: Pipeline script from SCM
     - **SCM**: Git
     - **Repository URL**: Your Git repository URL
     - **Credentials**: Select your Git credentials
     - **Branch Specifier**: `*/staging`
     - **Script Path**: `Jenkinsfile.staging`

#### Job 2: Main Pipeline

1. **New Item** → Enter name: `task-frontend-main`
2. **Type**: Pipeline
3. **Configuration**:
   - **Build Triggers**:
     - ✅ GitHub hook trigger for GITScm polling (if using GitHub)
     - Or: Poll SCM with schedule `H/5 * * * *`
   - **Pipeline**:
     - **Definition**: Pipeline script from SCM
     - **SCM**: Git
     - **Repository URL**: Your Git repository URL
     - **Credentials**: Select your Git credentials
     - **Branch Specifier**: `*/main`
     - **Script Path**: `Jenkinsfile.main`

## Jenkinsfile Configuration

### Update Environment Variables

Edit both `Jenkinsfile.staging` and `Jenkinsfile.main`:

```groovy
environment {
    DOCKER_REGISTRY = 'harbor.example.com'  // Your Harbor registry
    DOCKER_REPO = 'task-frontend'
    SONARQUBE_HOST = 'http://10.0.2.4:9000'  // Your SonarQube URL
    DEPLOY_HOST = 'your-deploy-server.com'  // For main branch deployment
}
```

## Pipeline Stages Explained

### Staging Pipeline (`Jenkinsfile.staging`)

1. **Checkout** - Clone repository from staging branch
2. **Install Dependencies** - Run `npm ci`
3. **Unit Tests (Jest)** - Run `npm test` with coverage
4. **Lint** - Run `npm run lint`
5. **SonarQube Analysis** - Analyze code quality
6. **Build Docker Image** - Build Docker image
7. **Trivy Security Scan** - Scan for vulnerabilities
8. **Push to Harbor** - Push image to Harbor registry

**Duration**: ~15-20 minutes

### Main Pipeline (`Jenkinsfile.main`)

1. **Checkout** - Clone repository from main branch
2. **Install Dependencies** - Run `npm ci`
3. **Unit Tests (Jest)** - Run `npm test` with coverage
4. **Lint** - Run `npm run lint`
5. **Build Application** - Run `npm run build`
6. **Build Docker Image** - Build Docker image
7. **Push to Harbor** - Push image to Harbor registry
8. **Deploy to Production** - Deploy via SSH
9. **Smoke Tests** - Verify deployment

**Duration**: ~15-20 minutes

## Docker Configuration

### Dockerfile Requirements

Ensure your `Dockerfile` is optimized for CI/CD:

```dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
EXPOSE 3000
CMD ["npm", "start"]
```

## SonarQube Configuration

### Create SonarQube Project

1. Login to SonarQube at `http://10.0.2.4:9000`
2. **Create Project** → **Manually**
3. **Project Key**: `task-frontend`
4. **Display Name**: `Task Frontend`
5. **Generate Token** and save it

### SonarQube Quality Gate

Configure quality gates in SonarQube:
- Code Coverage: > 80%
- Duplicated Lines: < 3%
- Maintainability Rating: A
- Security Rating: A
- Reliability Rating: A

## Harbor Registry Configuration

### Create Harbor Project

1. Login to Harbor registry
2. **New Project** → `task-frontend`
3. **Access Level**: Private
4. **Enable Content Trust**: Optional

### Harbor Credentials in Jenkins

Already configured in credentials section above.

## Deployment Configuration (Main Branch)

### SSH Key Setup

1. Generate SSH key on deployment server:
   ```bash
   ssh-keygen -t rsa -b 4096 -f ~/.ssh/deploy_key
   ```

2. Add public key to authorized_keys:
   ```bash
   cat ~/.ssh/deploy_key.pub >> ~/.ssh/authorized_keys
   ```

3. Add private key to Jenkins credentials (see Credentials section)

### Deployment Server Setup

On your deployment server:

```bash
# Create deployment directory
mkdir -p /opt/task-frontend
cd /opt/task-frontend

# Create docker-compose.yml (optional)
cat > docker-compose.yml << 'EOF'
version: '3.8'
services:
  app:
    image: harbor.example.com/task-frontend:latest
    ports:
      - "3000:3000"
    restart: unless-stopped
    environment:
      - NODE_ENV=production
EOF
```

## Monitoring and Notifications

### Jenkins Notifications

#### Email Notifications

1. **Manage Jenkins** → **Configure System**
2. **E-mail Notification**:
   - **SMTP Server**: Your SMTP server
   - **Default user e-mail suffix**: Your domain
   - **Reply-To Address**: Your email

#### Slack Notifications (Optional)

1. Install Slack Notification plugin
2. **Manage Jenkins** → **Configure System**
3. **Slack**:
   - **Workspace**: Your Slack workspace
   - **Credential**: Add Slack token
   - **Default Channel**: #deployments

### Add Notifications to Jenkinsfiles

Add to `post` section:

```groovy
post {
    success {
        emailext(
            subject: "Build Successful: ${env.JOB_NAME} #${env.BUILD_NUMBER}",
            body: "Build succeeded. Check console output at ${env.BUILD_URL}",
            to: "team@example.com"
        )
    }
    failure {
        emailext(
            subject: "Build Failed: ${env.JOB_NAME} #${env.BUILD_NUMBER}",
            body: "Build failed. Check console output at ${env.BUILD_URL}",
            to: "team@example.com"
        )
    }
}
```

## Troubleshooting

### Docker Permission Denied

If you get "permission denied" errors with Docker:

```bash
# Add jenkins user to docker group
sudo usermod -aG docker jenkins
sudo systemctl restart jenkins
```

### SonarQube Connection Issues

- Verify SonarQube is running: `curl http://10.0.2.4:9000`
- Check firewall rules allow port 9000
- Verify SonarQube token is correct

### Harbor Push Failures

- Verify Harbor credentials are correct
- Check Harbor registry is accessible from Jenkins VM
- Ensure Docker is logged in: `docker login harbor.example.com`

### Trivy Installation Issues

Trivy will auto-install during pipeline, but if issues occur:

```bash
# Manual installation
curl -sfL https://raw.githubusercontent.com/aquasecurity/trivy/main/contrib/install.sh | sh -s -- -b /usr/local/bin
```

### SSH Deployment Issues

- Verify SSH key is added to Jenkins credentials
- Check deployment server SSH access: `ssh -i ~/.ssh/deploy_key deploy@your-deploy-server.com`
- Ensure deployment directory exists and has correct permissions

## Performance Optimization

### Cache Dependencies

Add to Jenkinsfile to cache npm packages:

```groovy
options {
    timestamps()
    timeout(time: 1, unit: 'HOURS')
    disableConcurrentBuilds()
}
```

### Parallel Stages (Optional)

For faster builds, run independent stages in parallel:

```groovy
stage('Parallel Tests') {
    parallel {
        stage('Unit Tests') {
            steps {
                sh 'npm test'
            }
        }
        stage('Lint') {
            steps {
                sh 'npm run lint'
            }
        }
    }
}
```

## Security Best Practices

1. **Credentials**: Always use Jenkins credentials, never hardcode secrets
2. **Docker**: Use minimal base images (alpine)
3. **SonarQube**: Enable authentication and use tokens
4. **Harbor**: Use private projects and strong credentials
5. **SSH**: Use SSH keys instead of passwords
6. **Network**: Ensure Jenkins VM is in private subnet with NAT gateway

## Maintenance

### Regular Tasks

- **Weekly**: Check Jenkins logs for errors
- **Monthly**: Update Jenkins plugins
- **Monthly**: Review SonarQube quality gates
- **Quarterly**: Audit Harbor images and clean up old versions

### Backup

Backup Jenkins configuration:

```bash
# Backup Jenkins home directory
tar -czf jenkins-backup-$(date +%Y%m%d).tar.gz /var/lib/jenkins
```

## References

- [Jenkins Documentation](https://www.jenkins.io/doc/)
- [SonarQube Documentation](https://docs.sonarqube.org/)
- [Harbor Documentation](https://goharbor.io/docs/)
- [Trivy Documentation](https://aquasecurity.github.io/trivy/)
- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)

## Support

For issues or questions:
1. Check Jenkins logs: **Manage Jenkins** → **System Log**
2. Check build console output
3. Verify all credentials are configured correctly
4. Ensure all required plugins are installed
