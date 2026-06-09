# CineChat RAG Web

Aplikasi web chat untuk menanyakan data film lewat **Node-RED** (RAG vector, SQL, dan CRUD). Mendukung autentikasi JWT, riwayat chat per akun di **MySQL**, dan mode tamu tanpa login.

## Fitur

- **Landing page** — beranda dengan CTA masuk/daftar atau coba sebagai tamu
- **Chat multi-mode** — 6 mode lewat dropdown:
  - **RAG** — pencarian semantik via Pinecone + Gemini
  - **SQL Normalisasi (OLTP)** — query ke database Sakila (tabel terpisah)
  - **SQL Denormalisasi (DWH)** — query ke tabel `film_denorm`
  - **Tambah / Edit / Hapus Film** — CRUD pada `film_denorm`
- **Placeholder dinamis** — petunjuk singkat di input chat sesuai mode yang dipilih
- **Autentikasi** — daftar, login (JWT), verifikasi sesi saat refresh
- **Riwayat percakapan** — sesi chat tersimpan per user; **Chat Baru** membuat ruang baru
- **Mode tamu** — chat tanpa login (riwayat tidak tersimpan di sidebar)
- **Integrasi Node-RED** — satu endpoint `POST /api/chat`; backend meneruskan `pertanyaan` + `mode`
- **Notifikasi & loading** — toast dan indikator loading non-blocking

## Tech stack

| Lapisan    | Teknologi |
| ---------- | --------- |
| Frontend   | React 19, Vite, React Router, Tailwind CSS, Framer Motion |
| Backend    | Node.js, Express 5, JWT, bcryptjs, mysql2 |
| Database   | MySQL 8 (`db_rag_web` + `sakila`) |
| AI / Flow  | Node-RED 3, Gemini API, Pinecone |
| Deploy     | Docker Compose (lokal), Railway + Vercel (production) |

## Arsitektur

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  Frontend   │────▶│   Backend   │────▶│  Node-RED   │
│  (React)    │     │  (Express)  │     │  (flows)    │
└─────────────┘     └──────┬──────┘     └──────┬──────┘
                           │                    │
                           ▼                    ├──▶ Gemini API
                    ┌─────────────┐             ├──▶ Pinecone
                    │   MySQL     │◀────────────┘
                    │ db_rag_web  │             (sakila / film_denorm)
                    │   sakila    │
                    └─────────────┘
```

| Database      | Dipakai oleh | Isi |
| ------------- | ------------ | --- |
| `db_rag_web`  | Backend      | users, chat_sessions, chat_messages |
| `sakila`      | Node-RED     | data film OLTP + tabel `film_denorm` (DWH/CRUD) |

## Struktur proyek

```
CineChat-rag/
├── frontend/              # UI React (Vite)
├── backend/               # API Express
├── nodered/               # Node-RED flows + Dockerfile Railway
│   ├── data/
│   │   ├── flows.json
│   │   └── settings.js
│   ├── Dockerfile
│   └── railway.toml
├── scripts/               # Import schema ke MySQL Docker
│   ├── import-rag-schema.ps1
│   └── import-sakila.ps1
├── docker-compose.yml
├── rag-web.sql            # Schema app (db_rag_web)
├── sakila.sql             # Data film + film_denorm
├── .env.example           # Template env root (Docker Compose)
└── README.md
```

## Prasyarat

**Docker Compose (disarankan):**

- Docker Desktop
- File `.env` di root (salin dari `.env.example`)

**Manual / dev (opsional):**

- Node.js 20+
- MySQL 8+
- API key **Gemini** dan **Pinecone**

---

## Menjalankan dengan Docker Compose (disarankan)

Satu MySQL Docker untuk **dua database** — tidak perlu Laragon.

### 1. Environment

```powershell
cp .env.example .env
```

Isi minimal di `.env`:

```env
DB_PASSWORD=password_mysql_anda
DB_NAME=db_rag_web
JWT_SECRET=string-random-panjang
GEMINI_API_KEY=...
PINECONE_API_KEY=...
```

### 2. Database

```powershell
docker compose up -d database

# Import schema (sekali saja)
.\scripts\import-rag-schema.ps1
.\scripts\import-sakila.ps1
```

### 3. Jalankan semua service

```powershell
docker compose up -d --build
```

| Service   | URL lokal |
| --------- | --------- |
| Frontend  | http://localhost |
| Backend   | http://localhost:5000 |
| Node-RED  | http://localhost:1880 |
| MySQL     | `127.0.0.1:3307` (dari host) |

### Perintah berguna

```powershell
docker compose logs -f nodered    # log Node-RED
docker compose restart nodered    # setelah ubah flows.json
docker compose down               # stop semua service
```

---

## Menjalankan manual (dev)

Jika tidak memakai Docker untuk app (MySQL tetap bisa via Docker):

**Terminal 1 — MySQL** (atau `docker compose up -d database` saja)

**Terminal 2 — Node-RED:**

```bash
cd nodered/data
npm install
node-red --userDir . --settings settings.js
```

Set env `GEMINI_API_KEY`, `PINECONE_API_KEY`, `MYSQL_HOST`, `MYSQL_PORT`, `MYSQL_USER`, `MYSQL_PASSWORD`, `MYSQL_DATABASE_SAKILA=sakila` sebelum menjalankan.

**Terminal 3 — Backend:**

```bash
cd backend
npm install
cp .env.example .env
# DB_HOST=127.0.0.1, DB_PORT=3307 jika MySQL di Docker
npm run dev
```

**Terminal 4 — Frontend:**

```bash
cd frontend
npm install
# VITE_API_BASE_URL=http://localhost:5000/api
npm run dev
```

Akses UI di http://localhost:5173

---

## Konfigurasi environment

### Root `.env` (Docker Compose)

| Variabel | Keterangan |
| -------- | ---------- |
| `DB_PASSWORD`, `DB_USER`, `DB_NAME` | MySQL root & nama DB app |
| `JWT_SECRET` | Secret JWT backend |
| `FRONTEND_ORIGIN` | URL frontend (CORS), pisahkan dengan koma |
| `GEMINI_API_KEY` | Google Gemini (Node-RED) |
| `PINECONE_API_KEY` | Pinecone vector DB (Node-RED) |
| `MYSQL_HOST` | `database` di Docker; hostname Railway di production |
| `MYSQL_DATABASE_SAKILA` | `sakila` |
| `NODE_RED_BASE_URL` | Base URL Node-RED |
| `NODE_RED_URL` | Path endpoint, default `/api/chat` |
| `NODE_RED_TIMEOUT_MS` | Timeout ke Node-RED (disarankan `120000`) |
| `VITE_API_BASE_URL` | URL API untuk build frontend Docker |

### Backend (Railway / manual)

Backend membaca `DB_*` atau alias Railway `MYSQLHOST`, `MYSQLPORT`, dll.

```env
NODE_ENV=production
FRONTEND_ORIGIN=https://your-app.vercel.app
DB_HOST=...
DB_PORT=3306
DB_USER=...
DB_PASSWORD=...
DB_NAME=db_rag_web
JWT_SECRET=...
NODE_RED_BASE_URL=https://your-nodered.up.railway.app
NODE_RED_URL=/api/chat
NODE_RED_TIMEOUT_MS=120000
```

### Node-RED (Railway)

Root directory deploy: **`nodered`**

```env
GEMINI_API_KEY=...
PINECONE_API_KEY=...
MYSQL_HOST=${{MySQL.MYSQLHOST}}
MYSQL_PORT=${{MySQL.MYSQLPORT}}
MYSQL_USER=${{MySQL.MYSQLUSER}}
MYSQL_PASSWORD=${{MySQL.MYSQLPASSWORD}}
MYSQL_DATABASE_SAKILA=sakila
```

API key di flow dibaca via `env.get()` di function node dan `valueType: env` di HTTP header — **bukan** `$(VAR)` di URL.

### Frontend (Vercel)

```env
VITE_API_BASE_URL=https://your-backend.up.railway.app/api
```

Set sebelum build, lalu redeploy.

---

## Deploy production

Urutan disarankan:

1. **MySQL (Railway)** — buat plugin MySQL, catat `MYSQLHOST`, `MYSQLPORT`, `MYSQLUSER`, `MYSQLPASSWORD`
2. **Import SQL** — `rag-web.sql` → `db_rag_web`, `sakila.sql` → `sakila` (SQLyog, DBeaver, atau Railway Query tab)
3. **Node-RED (Railway)** — root `nodered`, set env di atas
4. **Backend (Railway)** — root `backend`, link ke MySQL + `NODE_RED_BASE_URL`
5. **Frontend (Vercel)** — root `frontend`, set `VITE_API_BASE_URL`

**Verifikasi:**

```bash
curl https://your-backend.up.railway.app/api/health
curl -X POST https://your-nodered.up.railway.app/api/chat \
  -H "Content-Type: application/json" \
  -d '{"pertanyaan":"test","mode":"rag","sessionId":"test"}'
```

---

## Alur API chat

**Request** `POST /api/chat` (backend → Node-RED):

```json
{
  "pertanyaan": "Siapa sutradara film X?",
  "message": "Siapa sutradara film X?",
  "sessionId": "uuid-sesi",
  "mode": "rag"
}
```

Mode yang dikirim frontend: `rag` | `oltp` | `dwh` | `addfilm` | `editfilm` | `delfilm`

**Response** dari Node-RED:

```json
{
  "jawaban": "Teks jawaban asisten...",
  "sql_tereksekusi": "SELECT ...",
  "sessionId": "uuid-sesi-baru"
}
```

---

## Troubleshooting

| Gejala | Penyebab | Solusi |
| ------ | -------- | ------ |
| Pinecone `Unauthorized` | API key invalid / index salah | Cek `PINECONE_API_KEY` di env Node-RED; rotate key jika perlu |
| Jawaban RAG aneh (halusinasi) | Pinecone gagal, konteks kosong | Pastikan Pinecone OK; flow memblokir Gemini jika tidak ada matches |
| `502` ke Node-RED | URL atau service mati | Cek `NODE_RED_BASE_URL` + `NODE_RED_URL=/api/chat` |
| OLTP/DWH/CRUD gagal | `sakila` belum di-import | Jalankan `import-sakila.ps1` atau import manual |
| Login / chat gagal | `db_rag_web` belum ada | Jalankan `import-rag-schema.ps1` |
| CORS error (production) | `FRONTEND_ORIGIN` salah | Pastikan exact URL Vercel di env backend |
| FE call `localhost` | `VITE_API_BASE_URL` tidak diset saat build | Set di Vercel → redeploy |
| Chat history tetap setelah logout | State React belum di-reset | Sudah di-handle di `ChatPage` saat `isAuthenticated` false |
| Node-RED crash | Port bentrok / CRLF entrypoint | Docker: `PORT=1880` di compose; rebuild image `nodered` |
| Request timeout | RAG/AI lambat | Naikkan `NODE_RED_TIMEOUT_MS` ke `120000` |

---

## Keamanan

- Jangan commit `.env` — sudah ada di `.gitignore`
- Ganti `JWT_SECRET` untuk production
- Rotate API key Gemini/Pinecone jika pernah ter-commit ke Git
- Set `FRONTEND_ORIGIN` hanya ke domain yang Anda pakai

## Build production (manual)

```bash
# Frontend
cd frontend && npm run build   # output: dist/

# Backend
cd backend && npm start
```

---

## Lisensi & konteks

Proyek kuliah — integrasi RAG, SQL OLTP/DWH, dan CRUD film melalui antarmuka chat tunggal (CineChat).
