# CineChat RAG Web

Aplikasi web chat untuk menguji tiga mode endpoint **Node-RED** (RAG, OLTP, DWH) lewat antarmuka percakapan. Mendukung autentikasi pengguna, riwayat chat per akun di **MySQL**, dan mode tamu untuk mencoba tanpa login. Aplikasi ini didesain untuk pencarian/tanya jawab konteks seputar film (CineChat).

## Fitur

- **Landing page** — halaman beranda dengan CTA masuk/daftar atau coba sebagai tamu
- **Chat multi-mode** — pilih endpoint: RAG Database, SQL normalisasi (OLTP), SQL denormalisasi (DWH)
- **Autentikasi** — daftar, login (JWT), verifikasi sesi saat refresh (`GET /api/auth/me`)
- **Riwayat percakapan** — satu ruang chat aktif per user (sesi baru hanya lewat **Chat Baru**)
- **Integrasi Node-RED** — backend meneruskan `pertanyaan` ke flow HTTP Node-RED; jawaban diambil dari field `jawaban`
- **Notifikasi & loading** — toast sukses/error/konfirmasi dan indikator loading non-blocking

## Tech stack

| Lapisan   | Teknologi                                      |
| --------- | ---------------------------------------------- |
| Frontend  | React 19, Vite, React Router, Tailwind CSS, Framer Motion |
| Backend   | Node.js, Express 5, JWT, bcryptjs, mysql2      |
| Database  | MySQL                                          |
| Server AI | Node-RED (HTTP Request nodes, run locally)     |

## Struktur proyek

```
CineChat-rag/
├── frontend/          # UI React (Vite)
│   ├── src/
│   │   ├── components/  # Chat, Layout, UI Elements (MUI/Radix)
│   │   ├── context/     # Auth, Notify, Loading
│   │   ├── pages/       # Landing, Chat, Auth
│   │   └── apis/        # Integrasi backend Express
│   ├── package.json
│   └── vite.config.js
├── backend/           # API Express & Node-RED config
│   ├── data/          # Konfigurasi workspace Node-RED
│   ├── src/
│   │   ├── controllers/
│   │   ├── middlewares/
│   │   ├── repositories/
│   │   ├── routes/
│   │   └── services/
│   ├── index.js
│   ├── package.json
│   └── .env.example
└── README.md
```

## Prasyarat

- **Node.js** 18+ (disarankan 20+)
- **MySQL** 8+
- **Node-RED** terinstal global (`npm install -g node-red`) untuk menjalankan flows.

## Setup & Instalasi

### 1. Database MySQL

Buat database, misalnya `rag_web_chat`, lalu jalankan skema yang sudah Anda siapkan. Tabel inti yang dipakai aplikasi:

| Tabel              | Fungsi singkat                          |
| ------------------ | --------------------------------------- |
| `users`            | Akun pengguna (UUID) + user tamu        |
| `endpoint_modes`   | Referensi mode RAG / OLTP / DWH         |
| `chat_sessions`    | Ruang percakapan per user               |
| `chat_messages`    | Pesan user & assistant                  |
| `message_metrics`  | Metrik dari respons Node-RED (opsional) |

User tamu dibuat otomatis saat pertama kali chat tanpa login, dengan email default `guest@rag.local`.

### 2. Backend & Node-RED

```bash
cd backend
npm install
cp .env.example .env
```

Edit `backend/.env` sesuaikan dengan konfigurasi MySQL dan Port:

```env
PORT=3000
FRONTEND_ORIGIN=http://localhost:5173

DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=rag_web_chat

JWT_SECRET=rahasia-string-acak
JWT_EXPIRES_IN=7d

NODE_RED_RAG_URL=http://localhost:1880/api/openai/rag
NODE_RED_OLTP_URL=http://localhost:1880/api/openai/oltp
NODE_RED_DWH_URL=http://localhost:1880/api/openai/dwh
NODE_RED_TIMEOUT_MS=30000
```

### 3. Frontend

```bash
cd frontend
npm install
```

Buat `frontend/.env` jika API / Backend tidak menggunakan port 3000:

```env
VITE_API_BASE_URL=http://localhost:3000/api
```

## Menjalankan dengan Docker Compose (disarankan)

Satu MySQL Docker untuk **dua database**: `db_rag_web` (chat app) dan `sakila` (Node-RED SQL).

```bash
# 1. Env root
cp .env.example .env
# isi DB_PASSWORD, GEMINI_API_KEY, PINECONE_API_KEY, JWT_SECRET

# 2. Jalankan stack
docker compose up -d database

# 3. Import schema app + sakila (sekali saja)
.\scripts\import-rag-schema.ps1
.\scripts\import-sakila.ps1

# 4. Jalankan semua service
docker compose up -d --build
```

| Service   | URL lokal              |
| --------- | ---------------------- |
| Frontend  | http://localhost       |
| Backend   | http://localhost:5000  |
| Node-RED  | http://localhost:1880  |
| MySQL     | 127.0.0.1:**3307**     |

**Tidak perlu Laragon lagi** — Node-RED connect ke `database:3306` / DB `sakila` di dalam Docker.

### Deploy Node-RED ke Railway

1. Buat service baru → root directory: `nodered`
2. Set env: `GEMINI_API_KEY`, `PINECONE_API_KEY`, `MYSQL_HOST`, `MYSQL_PORT`, `MYSQL_USER`, `MYSQL_PASSWORD`, `MYSQL_DATABASE_SAKILA=sakila`
3. Import `sakila.sql` ke MySQL Railway (satu server dengan `db_rag_web`)
4. Backend Railway: `NODE_RED_BASE_URL=https://<nodered>.up.railway.app` dan `NODE_RED_URL=/api/chat`

## Menjalankan Aplikasi (manual / dev)

Anda akan membutuhkan 3 terminal untuk menjalankan keseluruhan skenario:

**Terminal 1 — Node-RED (AI Engine):**
```bash
cd backend
npm run startnodered
```
*(Node-RED berjalan dengan konfigurasi `/data` di port lokal, biasanya `1880`)*

**Terminal 2 — Backend Express API:**
```bash
cd backend
npm run dev
```
*(API tersedia di `http://localhost:3000/api`)*

**Terminal 3 — Frontend React:**
```bash
cd frontend
npm run dev
```
*(Akses UI di `http://localhost:5173`)*

## Alur Sistem & Interaksi Node-RED

Backend Express bertindak sebagai perantara yang menyimpan sesi chat & histori pesan di MySQL, lalu meneruskan pesan ke AI via **Node-RED**. Payload yang dikirim backend ke HTTP In Node-RED:

```json
{
  "pertanyaan": "teks dari user",
  "message": "teks dari user",
  "sessionId": "uuid-sesi",
  "mode": "rag"
}
```

Respons yang diharuskan keluar dari Node-RED (HTTP Out):

```json
{
  "jawaban": "Teks jawaban asisten AI / RAG ...",
  "metrik": {},
  "sql_tereksekusi": "..."
}
```

Jika aplikasi Node-RED tidak menyala atau timeout, API dapat mengembalikan respon gagal atau *mock* (tergantung implementasi backend).

## Troubleshooting

| Gejala | Kemungkinan penyebab | Solusi |
| ------ | -------------------- | ------ |
| `502` / Invalid URL | URL Node-RED backend tidak cocok | Sesuaikan `NODE_RED_*_URL` pada `.env` dengan port run `startnodered` |
| Gagal Login / Auth 401 | Sesi expired / kredensial salah | Gunakan *Guest Mode* atau ulangi auth |
| Database Error (`ECONNREFUSED`) | MySQL mati atau salah port/password | Docker: `DB_PORT=3307` dari host; di dalam compose: `database:3306` |
| Node-RED SQL gagal | DB `sakila` belum di-import | Jalankan `.\scripts\import-sakila.ps1` |
| Node-RED crash saat Start | Port 1880 bentrok | Matikan layanan di Node-RED global jika ada, atau tambal `settings.cjs` |

## Build Production

**Frontend:**
```bash
cd frontend
npm run build
```
Hasil siap di-host (di path `frontend/dist`).

**Backend:**
```bash
cd backend
npm start
```

## Keamanan

- File `.env` sudah berada dalam cakupan `.gitignore` (jangan di-commit).
- Selalu ganti variabel `JWT_SECRET` apabila kode di-*publish* secara luas atau di-deploy.
- Konfigurasi limitasi `cors` pada `FRONTEND_ORIGIN` untuk mencegah eksploitasi perutean backend API.
