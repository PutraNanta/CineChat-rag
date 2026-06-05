import "dotenv/config";

function toNumber(value, fallback) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function toList(value) {
  return String(value || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export const env = Object.freeze({
  NODE_ENV: process.env.NODE_ENV || "development",
  PORT: toNumber(process.env.PORT, 3000),
  FRONTEND_ORIGIN: process.env.FRONTEND_ORIGIN || "http://localhost:5173",
  FRONTEND_ORIGINS: toList(process.env.FRONTEND_ORIGIN),
  DB_HOST: process.env.DB_HOST || process.env.MYSQLHOST || "127.0.0.1",
  DB_PORT: toNumber(process.env.DB_PORT || process.env.MYSQLPORT, 3306),
  DB_USER: process.env.DB_USER || process.env.MYSQLUSER || "",
  DB_PASSWORD: process.env.DB_PASSWORD || process.env.MYSQLPASSWORD || "",
  DB_NAME: process.env.DB_NAME || process.env.MYSQLDATABASE || "",
  DB_CONNECTION_LIMIT: toNumber(process.env.DB_CONNECTION_LIMIT, 10),
  GUEST_USER_EMAIL: process.env.GUEST_USER_EMAIL || "guest@rag.local",
  JWT_SECRET: process.env.JWT_SECRET || "dev-only-change-me",
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "7d",
  NODE_RED_BASE_URL: process.env.NODE_RED_BASE_URL || "",
  NODE_RED_TIMEOUT_MS: toNumber(process.env.NODE_RED_TIMEOUT_MS, 30000),
  NODE_RED_URL: process.env.NODE_RED_URL || "",
});

export const nodeRedConfiguredMap = Object.freeze({
  chat: env.NODE_RED_URL || "(not set)",
});

export const dbConfigured = Boolean(env.DB_HOST && env.DB_USER && env.DB_NAME);
