# Import schema db_rag_web (rag-web.sql) ke MySQL Docker
# Jalankan dari root proyek: .\scripts\import-rag-schema.ps1

$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $PSScriptRoot
$SchemaFile = Join-Path $Root "rag-web.sql"
$EnvFile = Join-Path $Root ".env"

if (-not (Test-Path $SchemaFile)) {
    Write-Error "File tidak ditemukan: $SchemaFile"
}

if (-not (Test-Path $EnvFile)) {
    Write-Error "Buat file .env dulu dari .env.example"
}

$envLines = Get-Content $EnvFile
$password = ($envLines | Where-Object { $_ -match "^DB_PASSWORD=" } | ForEach-Object { $_ -replace "^DB_PASSWORD=", "" }).Trim()
$dbName = ($envLines | Where-Object { $_ -match "^DB_NAME=" } | ForEach-Object { $_ -replace "^DB_NAME=", "" }).Trim()

if (-not $dbName) { $dbName = "db_rag_web" }

Write-Host "Mengimpor rag-web.sql ke database $dbName ..."

$sql = @"
CREATE DATABASE IF NOT EXISTS ``$dbName`` CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;
USE ``$dbName``;
"@

$sql + (Get-Content $SchemaFile -Raw) | docker exec -i cinechat_db mysql -uroot "-p$password"

Write-Host "Selesai."
