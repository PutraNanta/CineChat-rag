# RAG Web Chat

Aplikasi web chat untuk menguji tiga mode endpoint **Node-RED** (RAG, OLTP, DWH) lewat antarmuka percakapan. Mendukung autentikasi pengguna, riwayat chat per akun di **MySQL**, dan mode tamu untuk mencoba tanpa login.

## Fitur

- **Landing page** — halaman beranda dengan CTA masuk/daftar atau coba sebagai tamu
- **Chat multi-mode** — pilih endpoint: RAG Database, SQL normalisasi (OLTP), SQL denormalisasi (DWH)
- **Autentikasi** — daftar, login (JWT), verifikasi sesi saat refresh (`GET /api/auth/me`)
- **Riwayat percakapan** — satu ruang chat aktif per user (sesi baru hanya lewat **Chat Baru**)
- **Integrasi Node-RED** — backend meneruskan `pertanyaan` ke flow HTTP; jawaban diambil dari field `jawaban`
- **Notifikasi & loading** — toast sukses/error/konfirmasi dan indikator loading non-blocking

## Tech stack

| Lapisan   | Teknologi                                      |
| --------- | ---------------------------------------------- |
| Frontend  | React 19, Vite, React Router, Tailwind CSS     |
| Backend   | Node.js, Express 5, JWT, bcryptjs, mysql2      |
| Database  | MySQL                                          |
| Eksternal | Node-RED (HTTP Request nodes)                  |

## Struktur proyek

```
rag-web/
├── frontend/          # UI React (Vite)
│   └── src/
│       ├── pages/     # Landing, Chat, Auth
│       ├── components/
│       ├── context/   # Auth, Notify, Loading
│       └── apis/
├── backend/           # API Express
│   ├── src/
│   │   ├── routes/
│   │   ├── controllers/
│   │   ├── services/
│   │   └── repositories/
│   └── .env.example
└── README.md
```

## Prasyarat

- **Node.js** 18+ (disarankan 20+)
- **MySQL** 8+
- **Node-RED** (opsional untuk jawaban nyata; tanpa konfigurasi URL, backend memakai respons mock)

## Setup

### 1. Database MySQL

Buat database, misalnya `rag_web_chat`, lalu jalankan skema yang sudah Anda siapkan. Tabel inti yang dipakai aplikasi:

| Tabel              | Fungsi singkat                          |
| ------------------ | --------------------------------------- |
| `users`            | Akun pengguna (UUID) + user tamu        |
| `endpoint_modes`   | Referensi mode RAG / OLTP / DWH         |
| `chat_sessions`    | Ruang percakapan per user               |
| `chat_messages`    | Pesan user & assistant                  |
| `message_metrics`  | Metrik dari respons Node-RED (opsional) |

User tamu dibuat otomatis saat pertama kali chat tanpa login, dengan email dari env `GUEST_USER_EMAIL` (default: `guest@rag.local`).

### 2. Backend

```bash
cd backend
npm install
cp .env.example .env
```

Edit `backend/.env`:

```env
PORT=3000
FRONTEND_ORIGIN=http://localhost:5173

DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=rag_web_chat

JWT_SECRET=ganti-dengan-string-acak-panjang
JWT_EXPIRES_IN=7d

# Opsi A: URL absolut per endpoint
NODE_RED_RAG_URL=http://localhost:1880/api/openai/rag
NODE_RED_OLTP_URL=http://localhost:1880/api/openai/oltp
NODE_RED_DWH_URL=http://localhost:1880/api/openai/dwh

# Opsi B: path relatif + base URL Node-RED
# NODE_RED_BASE_URL=http://localhost:1880
# NODE_RED_RAG_URL=/api/openai/rag
# NODE_RED_OLTP_URL=/api/openai/oltp
# NODE_RED_DWH_URL=/api/openai/dwh

NODE_RED_TIMEOUT_MS=30000
```

Jalankan backend:

```bash
npm run dev
```

API tersedia di `http://localhost:3000/api`.

### 3. Frontend

```bash
cd frontend
npm install
```

Buat `frontend/.env` jika perlu mengubah URL API:

```env
VITE_API_BASE_URL=http://localhost:3000/api
```

Jalankan frontend:

```bash
npm run dev
```

Buka `http://localhost:5173`.

## Menjalankan (ringkas)

Terminal 1 — backend:

```bash
cd backend && npm run dev
```

Terminal 2 — frontend:

```bash
cd frontend && npm run dev
```

Pastikan MySQL berjalan dan variabel `DB_*` di `.env` sudah benar.

## Alur pengguna

1. **Beranda** (`/`) — masuk/daftar atau coba sebagai tamu
2. **Daftar** — setelah sukses diarahkan ke halaman login (belum auto-login)
3. **Login** — diarahkan ke chat (`/chat`)
4. **Chat** — memakai sesi terakhir; **Chat Baru** membuat ruang percakapan baru
5. **Beranda dari chat** — klik area brand di sidebar atau tombol **Beranda** saat sidebar tertutup

## Integrasi Node-RED

Backend mengirim POST JSON ke endpoint yang dikonfigurasi:

```json
{
  "pertanyaan": "teks pertanyaan user",
  "message": "teks pertanyaan user",
  "sessionId": "uuid-sesi-jika-ada",
  "mode": "rag"
}
```

Respons yang diharapkan (contoh):

```json
{
  "jawaban": "teks jawaban untuk ditampilkan",
  "metrik": {},
  "sql_tereksekusi": "..."
}
```

Field **`jawaban`** diprioritaskan untuk ditampilkan di UI. Jika URL Node-RED kosong, backend mengembalikan jawaban **mock** agar UI tetap bisa diuji.

> **Catatan:** Jangan mengisi `NODE_RED_*_URL` dengan path aplikasi web ini (mis. `/api/openai/rag` tanpa host). Itu adalah route backend Express, bukan URL Node-RED. Gunakan URL lengkap Node-RED atau `NODE_RED_BASE_URL` + path relatif.

## API utama

Semua route diawali prefix `/api`.

### Health

| Method | Path        | Keterangan        |
| ------ | ----------- | ----------------- |
| GET    | `/health`   | Status & DB check |

### Auth

| Method | Path             | Auth     | Keterangan   |
| ------ | ---------------- | -------- | ------------ |
| POST   | `/auth/register` | —        | Daftar akun  |
| POST   | `/auth/login`    | —        | Login → JWT  |
| GET    | `/auth/me`       | Bearer   | Profil user  |

### Chat (Bearer opsional — tamu memakai user guest)

| Method | Path                      | Keterangan              |
| ------ | ------------------------- | ----------------------- |
| GET    | `/chat/sessions/latest`   | Sesi terakhir user      |
| GET    | `/chat/sessions`          | Daftar sesi aktif       |
| GET    | `/chat/sessions/:id`      | Riwayat pesan sesi      |
| DELETE | `/chat/sessions/:id`      | Soft-delete sesi        |

### OpenAI / Node-RED proxy

| Method | Path              | Body (contoh)                                      |
| ------ | ----------------- | -------------------------------------------------- |
| POST   | `/openai/rag`     | `{ "message", "sessionId?", "forceNewSession?" }`  |
| POST   | `/openai/oltp`    | sama                                               |
| POST   | `/openai/dwh`     | sama                                               |

## Halaman frontend

| Path              | Halaman                          |
| ----------------- | -------------------------------- |
| `/`               | Landing                          |
| `/auth`           | Login & daftar                   |
| `/chat`           | Redirect ke sesi terakhir / baru |
| `/chat/new`       | Chat (sesi baru jika dipaksa)    |
| `/chat/:sessionId`| Chat dengan ID sesi              |

## Troubleshooting

| Gejala | Kemungkinan penyebab | Solusi |
| ------ | -------------------- | ------ |
| `502` / Invalid URL | `NODE_RED_*_URL` salah | Pakai URL Node-RED penuh atau set `NODE_RED_BASE_URL` |
| Jawaban mock | URL Node-RED kosong | Isi `NODE_RED_RAG_URL` dll. di `.env` |
| DB error | MySQL / kredensial | Cek `DB_*`, pastikan skema sudah di-import |
| Banyak riwayat chat duplikat | Sesi lama sebelum perbaikan | Hapus dari sidebar atau soft-delete di DB |
| 401 setelah login | Token kadaluarsa / secret berubah | Login ulang; jangan ubah `JWT_SECRET` sembarangan |

## Build production (opsional)

```bash
cd frontend && npm run build
cd backend && npm start
```

Serve folder `frontend/dist` lewat static server atau reverse proxy; arahkan `VITE_API_BASE_URL` ke URL API production.

## Keamanan

- Jangan commit file `.env` (sudah ada di `.gitignore`)
- Ganti `JWT_SECRET` untuk environment production
- Batasi `FRONTEND_ORIGIN` ke domain frontend Anda

## Lisensi

Proyek akademik / pribadi — sesuaikan lisensi jika akan dipublikasikan.
