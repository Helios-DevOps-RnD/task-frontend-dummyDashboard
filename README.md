# Frontend Dashboard - Task Dummy Microservices

Repository ini berisi antarmuka pengguna (Frontend) untuk aplikasi Task Dummy BE/FE Dashboard. Dibangun menggunakan Next.js, aplikasi ini berkomunikasi dengan dua layanan backend terpisah (Main API dan Pub/Sub Service).

## 💻 Tech Stack

- Next.js
- Tailwind CSS
- Axios

## ⚙️ Persiapan (Prerequisites)

Sebelum menjalankan aplikasi Frontend ini, pastikan kedua layanan Backend sudah berjalan terlebih dahulu di terminal yang terpisah:

- **Backend Main API** (menangani GET, PUT, DELETE) harus berjalan di `http://localhost:3000`
- **Backend Pub/Sub** (menangani POST/Create User) harus berjalan di `http://localhost:3001`

## 🚀 Cara Menjalankan Aplikasi (Getting Started)

1. Pertama, install semua _dependencies_ yang dibutuhkan:
   ```bash
   npm install
   ```
2. Lalu jalankan :
   ```bash
   npm run dev
   ```
3. Buka browser dan akses aplikasi pada URL yang tertera di terminal (http://localhost:xxxx)
