# Panduan Kontribusi dan Policy

Dokumen ini menjadi sumber aturan kontribusi utama untuk repository ini. Konten branch protection, alur pull request, dan standar kontribusi digabung di sini agar tidak tersebar di beberapa file.

## Posisi Branch

Repository ini mengikuti alur branch berikut:

- `develop` adalah branch integrasi pengembangan aktif.
- `staging` adalah branch utama untuk validasi hasil integrasi sebelum rilis.
- `main` adalah branch utama untuk rilis yang sudah siap production.

Urutan promosi perubahan:

1. Kerja harian masuk ke `develop`
2. Kandidat rilis dipromosikan ke `staging`
3. Perubahan yang lolos validasi dipromosikan ke `main`

## Aturan Branching

Format branch: `<type>/<short-description>` atau `<type>/<issue-number>-<short-description>`

| Tipe | Digunakan untuk | Dibuat dari | Target PR |
|---|---|---|---|
| `feature` | Fitur baru | `develop` | `develop` |
| `fix` | Bugfix hasil pengembangan aktif | `develop` | `develop` |
| `chore` | Maintenance, dependency, CI, config | `develop` | `develop` |
| `docs` | Perubahan dokumentasi | `develop` | `develop` |
| `refactor` | Perapihan tanpa perubahan perilaku | `develop` | `develop` |
| `release` | Persiapan rilis | `develop` | `staging` |
| `hotfix` | Perbaikan kritis yang harus cepat rilis | `main` | `main`, lalu back-merge ke `staging` dan `develop` |

Aturan penamaan:

- Gunakan huruf kecil semua
- Gunakan tanda hubung `-` sebagai pemisah kata
- Buat nama singkat dan langsung menjelaskan perubahan

## Alur Pull Request

1. Buat branch kerja dari branch sumber yang sesuai
2. Kerjakan perubahan dan lakukan self-review
3. Pastikan branch sudah sinkron dengan target branch
4. Buka pull request ke target branch yang benar
5. Pastikan seluruh status check wajib sudah lulus
6. Selesaikan semua komentar review
7. Merge hanya setelah approval sesuai target branch terpenuhi

Aturan target PR:

- `feature/*`, `fix/*`, `chore/*`, `docs/*`, `refactor/*` masuk ke `develop`
- `release/*` masuk ke `staging`
- `staging` dipromosikan ke `main` saat siap rilis
- `hotfix/*` masuk ke `main`, lalu perubahan yang sama harus dikembalikan ke `staging` dan `develop`

## Template Isi Pull Request

Setiap pull request minimal memuat:

### Deskripsi Perubahan

Jelaskan apa yang berubah, kenapa perlu diubah, dan dampak utamanya.

### Tipe Perubahan

Pilih salah satu atau lebih sesuai konteks:

- Feature baru
- Bug fix
- Hotfix
- Refactoring
- Dokumentasi
- Chore atau maintenance

### Cara Pengujian

Tuliskan langkah verifikasi yang benar-benar dilakukan, misalnya:

1. Jalankan `npm run lint`, `npm run test`, atau pengujian relevan lain
2. Validasi perilaku halaman, komponen, atau integrasi yang berubah
3. Catat hasil validasinya di deskripsi PR

### Bukti Visual

Untuk perubahan UI, sertakan screenshot atau screen recording di deskripsi pull request.

### Checklist Sebelum Merge

- Sudah self-review
- Tidak ada secret, credential, atau API key yang ikut ter-commit
- Status check wajib sudah passed
- Branch sudah up to date dengan target branch
- Semua komentar review sudah dibereskan

## Branch Protection

Branch yang perlu dijaga paling ketat adalah `staging` dan `main`. `develop` tetap diproteksi, tetapi difokuskan sebagai branch integrasi aktif.

Karena repository frontend ini sudah memiliki script `lint` dan `build`, status check wajib untuk branch utama sebaiknya memasukkan check yang merepresentasikan keduanya bila workflow GitHub sudah diaktifkan.

### Aturan untuk `develop`

- Wajib pull request sebelum merge
- Minimal 1 approval
- Dismiss approval lama saat ada commit baru
- Wajib menyelesaikan conversation review
- Tidak boleh force push
- Tidak boleh delete branch
- Admin tidak boleh bypass aturan

### Aturan untuk `staging`

- Wajib pull request sebelum merge
- Minimal 1 approval
- Dismiss approval lama saat ada commit baru
- Wajib branch up to date sebelum merge
- Wajib menyelesaikan conversation review
- Wajib lulus status check yang memang aktif di repository ini
- Tidak boleh force push
- Tidak boleh delete branch
- Admin tidak boleh bypass aturan

### Aturan untuk `main`

- Wajib pull request sebelum merge
- Minimal 2 approval
- Dismiss approval lama saat ada commit baru
- Wajib branch up to date sebelum merge
- Wajib menyelesaikan conversation review
- Wajib lulus status check yang memang aktif di repository ini
- Tidak boleh force push
- Tidak boleh delete branch
- Admin tidak boleh bypass aturan

## Merge Strategy

- Gunakan `Squash and Merge` untuk PR menuju `develop`
- Gunakan merge yang menjaga histori rilis tetap jelas untuk promosi `staging -> main` bila diperlukan tim
- Nonaktifkan rebase merge bila ingin histori review dan promosi branch tetap konsisten
- Aktifkan auto-delete branch setelah PR di-merge

## Approval Minimum

| Target Branch | Minimum Approval |
|---|---|
| `develop` | 1 |
| `staging` | 1 |
| `main` | 2 |

## Verifikasi Setelah Aturan Diterapkan

- Push langsung ke `develop`, `staging`, dan `main` harus ditolak
- PR ke `develop` tidak bisa di-merge tanpa approval
- PR ke `staging` harus lolos check yang diwajibkan repository
- PR ke `main` tidak bisa di-merge dengan hanya 1 approval
- PR perubahan UI wajib menyertakan bukti visual
- Setelah merge, branch kerja terhapus otomatis bila auto-delete aktif
