# Mikrotik Admin Panel (Express.js)

Panel admin berbasis web untuk manajemen router Mikrotik, menggunakan Express.js sebagai backend.

## Struktur Project
Lihat file `structure.txt` untuk penjelasan detail struktur folder dan file.

### Penjelasan Struktur Folder
- **public/**: Berisi file statis yang diakses langsung oleh browser (HTML, CSS, JS, gambar)
  - **css/**: File stylesheet (tampilan)
  - **js/**: File JavaScript untuk interaksi di frontend
  - **img/**: Gambar/icon yang digunakan di website
- **src/**: Source code utama aplikasi Express.js
  - **config/**: Konfigurasi aplikasi, misal koneksi Supabase, pengaturan environment
  - **controllers/**: Logic utama untuk menangani request dan response tiap fitur/route
  - **middleware/**: Middleware Express, misal autentikasi, logging, dsb
  - **routes/**: Definisi endpoint/route aplikasi (misal: /user, /login)
  - **utils/**: Helper atau fungsi utilitas yang membantu controller/middleware
  - **views/**: Template EJS untuk tampilan dinamis
    - **layouts/**: Template layout utama (misal: main layout)
    - **partials/**: Komponen partial (misal: header, footer, sidebar)
    - **dashboard.ejs**: Contoh halaman dashboard utama
  - **app.js**: Entry point utama aplikasi Express.js
- **.env**: File environment variable (port, supabase url/key, dsb)
- **package.json**: Konfigurasi npm & dependencies project
- **package-lock.json**: Lock file npm (otomatis, untuk konsistensi dependency)
- **README.md**: Dokumentasi project dan petunjuk penggunaan
- **structure.txt**: Penjelasan struktur folder/file project

## Cara Menjalankan
1. Pastikan Node.js sudah terinstall.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Jalankan server:
   ```bash
   npm start
   ```
4. Buka browser ke `http://localhost:3000`

## Fitur
- Dashboard overview
- Manajemen router
- Manajemen user
- Monitoring jaringan

## Catatan
- Layout dan tampilan menggunakan EJS (views)
- Backend menggunakan Express.js
- Koneksi database/backend menggunakan Supabase (atur di src/config atau .env)