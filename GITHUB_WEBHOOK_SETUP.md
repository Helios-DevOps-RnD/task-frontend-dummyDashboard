# GitHub Polling Integration dengan Jenkins (Private Subnet)

Panduan lengkap untuk setup GitHub polling agar Jenkins otomatis trigger build saat ada push ke repository. Cocok untuk Jenkins di private subnet yang tidak accessible dari internet.

## Cara Kerja Polling

Jenkins akan secara berkala (setiap N menit) polling GitHub untuk cek ada perubahan di repository. Jika ada push baru, Jenkins akan otomatis trigger build.

**Keuntungan:**
- ✅ Cocok untuk Jenkins di private subnet
- ✅ Tidak perlu expose Jenkins ke internet
- ✅ Simple setup, minimal dependencies
- ✅ Secure, semua komunikasi outbound dari Jenkins

**Kekurangan:**
- ⚠️ Ada delay antara push dan build trigger (tergantung polling interval)
- ⚠️ Lebih banyak API calls ke GitHub

## Prerequisites

- Jenkins server dengan akses internet (via NAT gateway)
- GitHub repository
- Plugin Jenkins: "GitHub plugin" atau "Git plugin" (biasanya sudah built-in)

## Step 1: Setup GitHub Personal Access Token

1. Buka GitHub → Settings → Developer settings → Personal access tokens
2. Klik **Generate new token (classic)**
3. Berikan nama: `jenkins-polling`
4. Pilih scopes:
   - ✅ `repo` (full control of private repositories)
   - ✅ `read:repo_hook` (read access to hooks)
5. Generate dan copy token

## Step 2: Add GitHub Credentials di Jenkins

1. Buka Jenkins Dashboard
2. Klik **Manage Jenkins** → **Manage Credentials**
3. Klik **System** → **Global credentials**
4. Klik **Add Credentials**
5. Pilih kind: **Username with password**
   - Username: `github` (atau username GitHub kamu)
   - Password: Paste personal access token yang sudah di-generate
   - ID: `github-credentials`
   - Description: `GitHub Polling Credentials`
6. Klik **Create**

## Step 3: Configure Jenkins Job untuk GitHub Polling

### Untuk Pipeline Job (Jenkinsfile):

1. Buka Jenkins job untuk staging pipeline
2. Klik **Configure**
3. Di section **Pipeline**, pastikan:
   - Definition: **Pipeline script from SCM**
   - SCM: **Git**
   - Repository URL: `https://github.com/your-org/your-repo.git`
   - Credentials: Pilih `github-credentials` yang sudah dibuat
   - Branch Specifier: `*/staging` (untuk staging branch)
   - Script Path: `Jenkinsfile.staging`

4. Di section **Build Triggers**, centang:
   - ✅ **Poll SCM**
   
5. Di field **Schedule**, isi dengan cron expression:
   ```
   H/5 * * * *
   ```
   Ini berarti: polling setiap 5 menit
   
   **Contoh schedule lain:**
   - `H/2 * * * *` - setiap 2 menit
   - `H/10 * * * *` - setiap 10 menit
   - `H * * * *` - setiap jam
   - `H 0 * * *` - setiap hari jam 00:00
   - `H 9-17 * * 1-5` - setiap jam 9-17 hari kerja

6. Klik **Save**

### Untuk Freestyle Job:

1. Buka Jenkins job
2. Klik **Configure**
3. Di section **Source Code Management**, pilih **Git**:
   - Repository URL: `https://github.com/your-org/your-repo.git`
   - Credentials: Pilih `github-credentials`
   - Branch Specifier: `*/staging`

4. Di section **Build Triggers**, centang:
   - ✅ **Poll SCM**

5. Di field **Schedule**, isi:
   ```
   H/5 * * * *
   ```

6. Klik **Save**

## Step 4: Verify Setup

### Check Polling Status:

1. Buka Jenkins job
2. Klik **Configure**
3. Di section **Build Triggers**, lihat **Poll SCM** sudah di-centang
4. Klik **Save**

### Monitor Polling:

1. Buka Jenkins job
2. Klik **Build Now** untuk test manual
3. Atau push code ke staging branch dan tunggu polling interval
4. Lihat di **Build History** apakah ada build baru

### Check Polling Logs:

1. Buka Jenkins job
2. Klik **Build** terbaru
3. Klik **Console Output**
4. Cari log yang menunjukkan polling activity

## Step 5: Verify Build Trigger Info

Setelah polling trigger build, Jenkins akan menampilkan:

- **Build Cause**: "Started by an SCM change" atau "Started by GitHub push"
- **Git Commit**: Author dan email dari commit
- **Branch**: Branch yang di-push

Ini akan terlihat di Jenkins UI dan build logs.

## Environment Variables di Build

Setelah polling trigger, Jenkins akan set environment variables:

```groovy
// Tersedia di Jenkinsfile:
GIT_COMMIT          // Commit hash
GIT_BRANCH          // Branch name
GIT_AUTHOR          // Author name (jika tersedia)
GIT_AUTHOR_EMAIL    // Author email (jika tersedia)
BUILD_CAUSE         // "Started by an SCM change"
```

Contoh penggunaan di Jenkinsfile:

```groovy
stage('Info') {
    steps {
        script {
            echo "Build Cause: ${BUILD_CAUSE}"
            echo "Commit: ${GIT_COMMIT}"
            echo "Branch: ${GIT_BRANCH}"
            echo "Author: ${GIT_AUTHOR}"
        }
    }
}
```

## Optimization Tips

### 1. Reduce API Rate Limiting

GitHub memiliki rate limit untuk API calls. Untuk mengurangi:

- Gunakan polling interval yang lebih lama (misal 10 menit daripada 2 menit)
- Gunakan GitHub credentials untuk meningkatkan rate limit

### 2. Exclude Certain Commits

Jika ingin skip polling untuk commit tertentu, tambahkan di commit message:

```
[skip ci]
```

Contoh:
```
git commit -m "Update README [skip ci]"
```

### 3. Monitor Polling Performance

1. Buka Jenkins → Manage Jenkins → System Log
2. Cari logs tentang SCM polling
3. Monitor resource usage saat polling

## Troubleshooting

### Build tidak trigger setelah push:

1. Cek polling schedule sudah benar
2. Cek branch specifier sesuai dengan branch yang di-push
3. Cek credentials valid
4. Tunggu polling interval (jangan langsung expect trigger)

### Error "Failed to connect to GitHub":

1. Pastikan Jenkins bisa akses internet via NAT gateway
2. Test connectivity: `curl -I https://api.github.com`
3. Pastikan personal access token masih valid
4. Regenerate token jika perlu

### Polling terlalu sering/jarang:

1. Adjust cron expression di **Poll SCM** schedule
2. Contoh: `H/10 * * * *` untuk 10 menit

### Rate limit exceeded:

1. Increase polling interval (misal dari 5 menit ke 15 menit)
2. Gunakan GitHub credentials (sudah di-setup)
3. Pertimbangkan upgrade GitHub account untuk higher rate limits

## Cron Expression Reference

```
┌───────────── minute (0 - 59)
│ ┌───────────── hour (0 - 23)
│ │ ┌───────────── day of month (1 - 31)
│ │ │ ┌───────────── month (1 - 12)
│ │ │ │ ┌───────────── day of week (0 - 6) (0 to 6 are Sunday to Saturday)
│ │ │ │ │
│ │ │ │ │
* * * * *
```

**Common Examples:**
- `H/5 * * * *` - Every 5 minutes
- `H/15 * * * *` - Every 15 minutes
- `H * * * *` - Every hour
- `H 0 * * *` - Every day at midnight
- `H 9 * * 1-5` - Every weekday at 9 AM
- `H 0 1 * *` - First day of month at midnight

**Note:** `H` adalah hash function untuk distribute load, bukan exact time.

## References

- [Jenkins Poll SCM Documentation](https://www.jenkins.io/doc/book/pipeline/syntax/#triggers)
- [Cron Syntax Reference](https://crontab.guru/)
- [GitHub Personal Access Tokens](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token)
- [Jenkins Git Plugin](https://plugins.jenkins.io/git/)
