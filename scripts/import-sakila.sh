#!/usr/bin/env sh
set -e

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
DUMP_FILE="$ROOT/sakila.sql"
ENV_FILE="$ROOT/.env"

if [ ! -f "$DUMP_FILE" ]; then
  echo "File tidak ditemukan: $DUMP_FILE" >&2
  exit 1
fi

if [ ! -f "$ENV_FILE" ]; then
  echo "Buat file .env dulu dari .env.example" >&2
  exit 1
fi

# shellcheck disable=SC1090
DB_PASSWORD="$(grep '^DB_PASSWORD=' "$ENV_FILE" | cut -d= -f2-)"

if [ -z "$DB_PASSWORD" ]; then
  echo "DB_PASSWORD kosong di .env" >&2
  exit 1
fi

echo "Mengimpor sakila.sql ke container cinechat_db..."
docker exec -i cinechat_db mysql -uroot -p"$DB_PASSWORD" < "$DUMP_FILE"

echo "Selesai. Verifikasi:"
docker exec cinechat_db mysql -uroot -p"$DB_PASSWORD" -e "USE sakila; SHOW TABLES LIKE 'film_denorm'; SELECT COUNT(*) AS film_count FROM film;"
