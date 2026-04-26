# Jenkins Staging Pipeline Setup Guide

Complete step-by-step guide to set up the staging branch CI/CD pipeline on Jenkins.

## Prerequisites Checklist

Before starting, ensure you have:

- [ ] Jenkins running at `http://10.0.2.4:8080`
- [ ] SonarQube running at `http://10.0.2.4:9000`
- [ ] Docker installed on Jenkins VM
- [ ] Node.js 18+ installed
- [ ] Git repository access
- [ ] Harbor registry credentials
- [ ] SonarQube authentication token

## Step 1: Install Required Jenkins Plugins

1. Go to **Manage Jenkins** → **Manage Plugins**
2. Search for and install these plugins:
   - `Pipeline`
   - `Git`
   - `Docker Pipeline`
   - `HTML Publisher`
   - `Credentials Binding`
   - `SonarQube Scanner`

3. Click **Install without restart** or **Restart Jenkins when installation is complete**

## Step 2: Configure Jenkins System Settings

### 2.1 Configure SonarQube

1. Go to **Manage Jenkins** → **Configure System**
2. Scroll to **SonarQube servers**
3. Click **Add SonarQube**
   - **Name**: `SonarQube`
   - **Server URL**: `http://10.0.2.4:9000`
   - **Server authentication token**: (leave blank for now, we'll add it in credentials)

4. Click **Save**

### 2.2 Configure Git (if not already configured)

1. Go to **Manage Jenkins** → **Configure System**
2. Scroll to **Git**
3. Verify Git executable is found (usually `/usr/bin/git`)
4. Click **Save**

## Step 3: Add Credentials to Jenkins

### 3.1 Add SonarQube Token

1. Go to **Manage Jenkins** → **Manage Credentials**
2. Click **System** → **Global credentials (unrestricted)**
3. Click **+ Add Credentials**
   - **Kind**: `Secret text`
   - **Secret**: Your SonarQube token (from SonarQube admin panel)
   - **ID**: `sonarqube-token`
   - **Description**: `SonarQube Authentication Token`

4. Click **Create**

### 3.2 Add Harbor Registry Credentials

1. Go to **Manage Jenkins** → **Manage Credentials**
2. Click **System** → **Global credentials (unrestricted)**
3. Click **+ Add Credentials**
   - **Kind**: `Username with password`
   - **Username**: Your Harbor username
   - **Password**: Your Harbor password
   - **ID**: `harbor-credentials`
   - **Description**: `Harbor Registry Credentials`

4. Click **Create**

### 3.3 Add Git Repository Credentials (if using private repo)

1. Go to **Manage Jenkins** → **Manage Credentials**
2. Click **System** → **Global credentials (unrestricted)**
3. Click **+ Add Credentials**
   - **Kind**: `Username with password` (or SSH key if preferred)
   - **Username**: Your Git username
   - **Password**: Your Git personal access token
   - **ID**: `git-credentials`
   - **Description**: `Git Repository Credentials`

4. Click **Create**

## Step 4: Create the Staging Pipeline Job

### 4.1 Create New Job

1. Click **+ New Item** on Jenkins home page
2. Enter job name: `task-frontend-staging`
3. Select **Pipeline**
4. Click **OK**

### 4.2 Configure General Settings

In the job configuration page:

1. **Description**: `CI/CD Pipeline for staging branch - Jest tests, SonarQube, Docker build, Trivy scan, Harbor push`

2. **Build Triggers** section:
   - Check ✅ **GitHub hook trigger for GITScm polling** (if using GitHub)
   - OR check ✅ **Poll SCM** and set schedule to `H/5 * * * *` (polls every 5 minutes)

3. **Advanced Project Options**:
   - Check ✅ **Concurrent builds can be run if necessary** (optional)

### 4.3 Configure Pipeline

1. Scroll to **Pipeline** section
2. **Definition**: Select `Pipeline script from SCM`
3. **SCM**: Select `Git`
4. **Repository URL**: Enter your Git repository URL
   - Example: `https://github.com/your-org/task-frontend.git`
5. **Credentials**: Select `git-credentials` (if private repo)
6. **Branch Specifier**: `*/staging`
7. **Script Path**: `Jenkinsfile.staging`

### 4.4 Save the Job

Click **Save** at the bottom

## Step 5: Update Jenkinsfile.staging with Your Values

Before running the pipeline, update these values in `Jenkinsfile.staging`:

```groovy
environment {
    // Update these with your actual values
    DOCKER_REGISTRY = 'harbor.example.com'      // Your Harbor registry URL
    DOCKER_REPO = 'task-frontend'               // Your Harbor project name
    SONARQUBE_HOST = 'http://10.0.2.4:9000'     // Your SonarQube URL
}
```

### Example Configuration:

If your Harbor is at `harbor.mycompany.com` and project is `frontend`:

```groovy
environment {
    DOCKER_REGISTRY = 'harbor.mycompany.com'
    DOCKER_REPO = 'frontend'
    DOCKER_IMAGE = "${DOCKER_REGISTRY}/${DOCKER_REPO}"
    DOCKER_TAG = "${BUILD_NUMBER}-staging"
    SONARQUBE_HOST = 'http://10.0.2.4:9000'
    SONARQUBE_TOKEN = credentials('sonarqube-token')
    HARBOR_CREDENTIALS = credentials('harbor-credentials')
}
```

## Step 6: Fix Docker Permissions

Run this on the Jenkins VM to allow Jenkins to use Docker:

```bash
sudo usermod -aG docker jenkins
sudo systemctl restart jenkins
```

## Step 7: Test the Pipeline

### 7.1 Manual Trigger

1. Go to your `task-frontend-staging` job
2. Click **Build Now**
3. Watch the build progress in **Build History**

### 7.2 Monitor Build Progress

1. Click on the build number (e.g., `#1`)
2. Click **Console Output** to see real-time logs
3. Watch for each stage:
   - ✅ Checkout
   - ✅ Install Dependencies
   - ✅ Unit Tests (Jest)
   - ✅ Lint
   - ✅ SonarQube Analysis
   - ✅ Build Docker Image
   - ✅ Trivy Security Scan
   - ✅ Push to Harbor

## Step 8: Verify Each Stage

### Check Unit Tests

After build completes:
1. Go to build page
2. Look for **Jest Coverage Report** link
3. Click to view coverage details

### Check SonarQube Results

1. Go to SonarQube at `http://10.0.2.4:9000`
2. Look for `task-frontend` project
3. Review code quality metrics

### Check Docker Image in Harbor

1. Login to Harbor registry
2. Navigate to `task-frontend` project
3. Verify images are pushed:
   - `{BUILD_NUMBER}-staging`
   - `staging-latest`

### Check Trivy Report

1. Go to build page
2. Look for **trivy-report.json** in artifacts
3. Download and review vulnerability scan results

## Troubleshooting

### Build Fails at "Install Dependencies"

**Error**: `npm: command not found`

**Solution**:
```bash
# On Jenkins VM
sudo apt-get install -y nodejs npm
# Or use nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install 18
```

### Build Fails at "SonarQube Analysis"

**Error**: `sonar-scanner: command not found`

**Solution**:
```bash
# On Jenkins VM
sudo npm install -g sonar-scanner
```

### Build Fails at "Build Docker Image"

**Error**: `permission denied while trying to connect to Docker daemon`

**Solution**:
```bash
# On Jenkins VM
sudo usermod -aG docker jenkins
sudo systemctl restart jenkins
```

### Build Fails at "Push to Harbor"

**Error**: `unauthorized: authentication required`

**Solution**:
1. Verify Harbor credentials in Jenkins:
   - Go to **Manage Credentials**
   - Check `harbor-credentials` username and password
2. Test Harbor login manually:
   ```bash
   docker login harbor.example.com
   ```

### SonarQube Connection Timeout

**Error**: `Connection refused` or `timeout`

**Solution**:
1. Verify SonarQube is running:
   ```bash
   curl http://10.0.2.4:9000
   ```
2. Check firewall allows port 9000:
   ```bash
   sudo ufw allow 9000/tcp
   ```

## Next Steps After Successful Build

### 1. Set Up Automated Triggers

The pipeline will now automatically trigger when:
- Code is pushed to `staging` branch (if using GitHub webhook)
- Or every 5 minutes (if using Poll SCM)

### 2. Configure Notifications (Optional)

Add email or Slack notifications to the pipeline:

Edit `Jenkinsfile.staging` and add to `post` section:

```groovy
post {
    success {
        echo "✅ Staging pipeline completed successfully!"
        // Add email notification
        // emailext(subject: "Build Success", body: "...", to: "team@example.com")
    }
    failure {
        echo "❌ Staging pipeline failed!"
        // Add email notification
        // emailext(subject: "Build Failed", body: "...", to: "team@example.com")
    }
}
```

### 3. Monitor Build History

1. Go to `task-frontend-staging` job
2. View **Build History** to track all builds
3. Click on any build to see details and logs

### 4. Set Up SonarQube Quality Gate

In SonarQube:
1. Go to **Quality Gates**
2. Create or edit quality gate
3. Set conditions:
   - Code Coverage > 80%
   - Duplicated Lines < 3%
   - Maintainability Rating = A

## Pipeline Stages Explained

### 1. Checkout
Clones the staging branch from your Git repository

### 2. Install Dependencies
Runs `npm ci` to install exact versions from package-lock.json

### 3. Unit Tests (Jest)
Runs `npm test` with coverage report
- Generates coverage/junit.xml
- Generates coverage/lcov.info
- Publishes HTML coverage report

### 4. Lint
Runs `npm run lint` to check code quality

### 5. SonarQube Analysis
Analyzes code with SonarQube:
- Checks code quality
- Measures coverage
- Identifies code smells
- Reports security issues

### 6. Build Docker Image
Builds Docker image with tags:
- `{BUILD_NUMBER}-staging` (e.g., `42-staging`)
- `staging-latest`

### 7. Trivy Security Scan
Scans Docker image for vulnerabilities:
- Checks for HIGH and CRITICAL vulnerabilities
- Generates JSON report
- Displays summary

### 8. Push to Harbor
Pushes Docker images to Harbor registry:
- Logs in with credentials
- Pushes both tags
- Logs out

## Performance Tips

### Speed Up Builds

1. **Cache npm packages**:
   ```bash
   # In Jenkins VM
   mkdir -p /var/jenkins_home/.npm
   chown jenkins:jenkins /var/jenkins_home/.npm
   ```

2. **Use Docker layer caching**:
   - Dockerfile is already optimized with multi-stage build

3. **Parallel stages** (optional):
   - Lint and Unit Tests can run in parallel
   - Modify Jenkinsfile to use `parallel` block

### Typical Build Times

- Checkout: ~5 seconds
- Install Dependencies: ~30 seconds
- Unit Tests: ~20 seconds
- Lint: ~5 seconds
- SonarQube: ~30 seconds
- Build Docker: ~60 seconds
- Trivy Scan: ~30 seconds
- Push to Harbor: ~20 seconds

**Total**: ~3-5 minutes

## Security Best Practices

1. ✅ Never hardcode credentials in Jenkinsfile
2. ✅ Use Jenkins credentials for all secrets
3. ✅ Use minimal Docker base images (alpine)
4. ✅ Scan Docker images with Trivy
5. ✅ Use private Harbor projects
6. ✅ Rotate credentials regularly
7. ✅ Keep Jenkins and plugins updated

## Monitoring and Maintenance

### Weekly Tasks
- Check Jenkins logs for errors
- Review build history for failures
- Monitor SonarQube quality metrics

### Monthly Tasks
- Update Jenkins plugins
- Review and update credentials
- Clean up old Docker images from Harbor

### Quarterly Tasks
- Review and optimize pipeline performance
- Update Node.js and dependencies
- Audit security scan results

## Support & Debugging

### View Jenkins Logs

```bash
# On Jenkins VM
tail -f /var/log/jenkins/jenkins.log
```

### View Build Console Output

1. Go to build page
2. Click **Console Output**
3. Search for errors or warnings

### Test Pipeline Locally

Before pushing to staging, test locally:

```bash
# Run tests
npm test -- --coverage --watchAll=false

# Run lint
npm run lint

# Build Docker image
docker build -t task-frontend:test .

# Scan with Trivy
trivy image task-frontend:test
```

## Next: Main Branch Pipeline

Once staging pipeline is working well, you can set up the main branch pipeline following similar steps with `Jenkinsfile.main`.

---

**Questions?** Check the main `JENKINS_SETUP.md` for more detailed information.
