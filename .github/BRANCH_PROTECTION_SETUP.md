# Branch Protection Setup — Checklist

Panduan ini menjelaskan langkah-langkah konfigurasi **Branch Protection Rules** dan **Merge Strategy** melalui GitHub UI.

> **Catatan:** Konfigurasi ini tidak dapat dilakukan via file — harus diterapkan secara manual melalui GitHub repository settings.

---

## Cara Membuka Pengaturan

1. Buka repository di GitHub
2. Klik tab **Settings**
3. Di sidebar kiri, klik **Branches** (di bawah bagian *Code and automation*)

---

## 1. Branch Protection Rules — `develop`

### Langkah-langkah

1. Klik tombol **Add branch ruleset** atau **Add rule**
2. Pada field **Branch name pattern**, ketik: `develop`
3. Terapkan pengaturan berikut:

### Checklist Pengaturan

- [ ] **Require a pull request before merging** → ✅ Aktifkan
  - [ ] **Required number of approvals before merging** → Set ke **`1`**
  - [ ] **Dismiss stale pull request approvals when new commits are pushed** → ✅ Aktifkan
  - [ ] Require review from Code Owners → ❌ Biarkan nonaktif
  - [ ] Restrict who can dismiss pull request reviews → ❌ Biarkan nonaktif

- [ ] **Require status checks to pass before merging** → ✅ Aktifkan
  - [ ] **Require branches to be up to date before merging** → ✅ Aktifkan
  - [ ] Pada kolom pencarian status checks, cari dan tambahkan: **`lint`**

- [ ] **Require conversation resolution before merging** → ✅ Aktifkan

- [ ] **Allow force pushes** → ❌ Pastikan **nonaktif** (tidak dicentang)

- [ ] **Allow deletions** → ❌ Pastikan **nonaktif** (tidak dicentang)

- [ ] **Do not allow bypassing the above settings** → ✅ Aktifkan
  *(Pengaturan ini memastikan aturan berlaku untuk admin sekalipun)*

4. Klik **Create** atau **Save changes**

---

## 2. Branch Protection Rules — `main`

### Langkah-langkah

1. Klik tombol **Add branch ruleset** atau **Add rule**
2. Pada field **Branch name pattern**, ketik: `main`
3. Terapkan pengaturan berikut:

### Checklist Pengaturan

- [ ] **Require a pull request before merging** → ✅ Aktifkan
  - [ ] **Required number of approvals before merging** → Set ke **`2`**
  - [ ] **Dismiss stale pull request approvals when new commits are pushed** → ✅ Aktifkan
  - [ ] Require review from Code Owners → ❌ Biarkan nonaktif
  - [ ] Restrict who can dismiss pull request reviews → ❌ Biarkan nonaktif

- [ ] **Require status checks to pass before merging** → ✅ Aktifkan
  - [ ] **Require branches to be up to date before merging** → ✅ Aktifkan
  - [ ] Pada kolom pencarian status checks, cari dan tambahkan: **`lint`** dan **`build`**

- [ ] **Require conversation resolution before merging** → ✅ Aktifkan

- [ ] **Allow force pushes** → ❌ Pastikan **nonaktif** (tidak dicentang)

- [ ] **Allow deletions** → ❌ Pastikan **nonaktif** (tidak dicentang)

- [ ] **Do not allow bypassing the above settings** → ✅ Aktifkan
  *(Pengaturan ini memastikan aturan berlaku untuk admin sekalipun)*

4. Klik **Create** atau **Save changes**

---

## 3. Merge Strategy Settings

### Cara Membuka Pengaturan

1. Buka repository di GitHub
2. Klik tab **Settings**
3. Scroll ke bawah ke bagian **Pull Requests**

### Checklist Pengaturan

- [ ] **Allow merge commits** → ✅ Aktifkan
  *(Digunakan untuk merge `release/*` dan `hotfix/*` ke `main`)*

- [ ] **Allow squash merging** → ✅ Aktifkan
  *(Digunakan untuk merge `feature/*`, `fix/*`, `chore/*`, `docs/*`, `refactor/*` ke `develop`)*
  - [ ] **Default commit message** → Pilih **"Pull request title and commit details"** atau **"Pull request title"**
    *(Pastikan format: `<type>(<scope>): <short description> (#<PR-number>)`)*

- [ ] **Allow rebase merging** → ❌ Nonaktifkan

- [ ] **Automatically delete head branches** → ✅ Aktifkan
  *(Branch akan otomatis terhapus setelah PR di-merge)*

4. Klik **Save** jika ada tombol simpan, atau perubahan tersimpan otomatis

---

## Ringkasan Konfigurasi

| Setting | `develop` | `main` |
|---|---|---|
| Require PR before merging | ✅ | ✅ |
| Required approving reviews | **1** | **2** |
| Dismiss stale approvals | ✅ | ✅ |
| Require status checks | ✅ (`lint`) | ✅ (`lint`, `build`) |
| Require up-to-date branch | ✅ | ✅ |
| Require conversation resolution | ✅ | ✅ |
| Allow force pushes | ❌ | ❌ |
| Allow deletions | ❌ | ❌ |
| Bypass settings (incl. admin) | ❌ Tidak diizinkan | ❌ Tidak diizinkan |

| Merge Strategy | Nilai |
|---|---|
| Allow merge commits | ✅ (untuk `main` target) |
| Allow squash merging | ✅ (untuk `develop` target) |
| Allow rebase merging | ❌ |
| Auto-delete head branches | ✅ |

---

## Verifikasi Setelah Konfigurasi

Setelah semua pengaturan diterapkan, lakukan verifikasi berikut:

- [ ] Coba `git push origin develop` langsung → harus ditolak
- [ ] Coba `git push origin main` langsung → harus ditolak
- [ ] Buat PR dari feature branch ke `develop` → template PR muncul otomatis
- [ ] Coba merge tanpa approval → tombol merge disabled
- [ ] Merge dengan 1 approval ke `develop` → berhasil
- [ ] Merge dengan 1 approval ke `main` → tombol merge masih disabled
- [ ] Merge dengan 2 approval ke `main` → berhasil
- [ ] Setelah merge, feature branch terhapus otomatis
