# Import dump sakila.sql ke MySQL Docker (cinechat_db)
# Jalankan dari root proyek: .\scripts\import-sakila.ps1

$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $PSScriptRoot
$DumpFile = Join-Path $Root "sakila.sql"

if (-not (Test-Path $DumpFile)) {
    Write-Error "File tidak ditemukan: $DumpFile"
}

if (-not (Test-Path (Join-Path $Root ".env"))) {
    Write-Error "Buat file .env dulu dari .env.example"
}

$envContent = Get-Content (Join-Path $Root ".env") | Where-Object { $_ -match "^DB_PASSWORD=" }
$password = ($envContent -replace "^DB_PASSWORD=", "").Trim()

if (-not $password) {
    Write-Error "DB_PASSWORD kosong di .env"
}

Write-Host "Mengimpor sakila.sql ke container cinechat_db (bisa beberapa menit)..."

Get-Content $DumpFile -Raw | docker exec -i cinechat_db mysql -uroot "-p$password"

Write-Host "Selesai. Verifikasi:"
docker exec cinechat_db mysql -uroot "-p$password" -e "USE sakila; SHOW TABLES LIKE 'film_denorm'; SELECT COUNT(*) AS film_count FROM film;"
