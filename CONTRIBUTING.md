# Panduan Kontribusi

Dokumen ini menjelaskan standar kontribusi untuk repository ini.

## Branching Strategy

Kami menggunakan Git Flow yang disederhanakan dengan dua protected branch:
- `main` — kode production yang stabil
- `develop` — integrasi pengembangan aktif

### Naming Convention Branch

Format: `<type>/<short-description>` atau `<type>/<issue-number>-<short-description>`

| Tipe | Digunakan untuk | Dibuat dari | PR ke | Contoh |
|---|---|---|---|---|
| `feature` | Fitur baru | `develop` | `develop` | `feature/add-policy-crud` |
| `fix` | Bugfix di develop | `develop` | `develop` | `fix/user-delete-error` |
| `hotfix` | Bug kritis production | `main` | `main` + `develop` | `hotfix/firebase-upload-crash` |
| `release` | Persiapan rilis | `develop` | `main` | `release/v1.2.0` |
| `chore` | Maintenance, config, CI | `develop` | `develop` | `chore/update-express-version` |
| `docs` | Dokumentasi saja | `develop` | `develop` | `docs/update-api-readme` |
| `refactor` | Refactoring tanpa ubah fungsi | `develop` | `develop` | `refactor/cleanup-db-queries` |

**Aturan:**
- Semua huruf kecil
- Gunakan tanda hubung `-` sebagai pemisah kata
- `<short-description>` maksimal 50 karakter

## Commit Message Convention

Format squash merge: `<type>(<scope>): <short description> (#<PR-number>)`

Contoh:
- `feat(users): add delete endpoint (#15)`
- `fix(devices): resolve null pointer on fetch (#22)`
- `chore(ci): add eslint workflow (#8)`
- `docs(readme): update setup instructions (#31)`
- `refactor(db): simplify query builder (#19)`
- `hotfix(firebase): fix upload crash on large files (#44)`

## Alur Kerja

1. Buat branch dari `develop` (atau `main` untuk hotfix)
2. Kerjakan perubahan di branch tersebut
3. Buat Pull Request ke branch tujuan
4. Pastikan CI check passed
5. Minta review dari anggota tim
6. Setelah approval terpenuhi, merge menggunakan Squash and Merge

> **Catatan khusus untuk perubahan UI:** Setiap PR yang mengubah komponen UI wajib menyertakan screenshot atau screen recording perubahan tampilan di deskripsi PR.

## Approval Requirements

| Target Branch | Minimum Approver |
|---|---|
| `develop` | 1 |
| `main` | 2 |

## Stale PR Policy

PR yang tidak aktif selama 7 hari akan diberi label `stale`.
PR yang tidak aktif selama 10 hari total akan ditutup otomatis.
Untuk melanjutkan PR yang ditutup, buka kembali PR dan tambahkan komentar yang menjelaskan status terkini pekerjaan.
