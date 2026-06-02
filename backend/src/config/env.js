import "dotenv/config";

function toNumber(value, fallback) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export const env = Object.freeze({
  NODE_ENV: process.env.NODE_ENV || "development",
  PORT: toNumber(process.env.PORT, 3000),
  FRONTEND_ORIGIN: process.env.FRONTEND_ORIGIN || "http://localhost:5173",
  DB_HOST: process.env.DB_HOST || "127.0.0.1",
  DB_PORT: toNumber(process.env.DB_PORT, 3306),
  DB_USER: process.env.DB_USER || "",
  DB_PASSWORD: process.env.DB_PASSWORD || "",
  DB_NAME: process.env.DB_NAME || "",
  DB_CONNECTION_LIMIT: toNumber(process.env.DB_CONNECTION_LIMIT, 10),
  GUEST_USER_EMAIL: process.env.GUEST_USER_EMAIL || "guest@rag.local",
  JWT_SECRET: process.env.JWT_SECRET || "dev-only-change-me",
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "7d",
  NODE_RED_BASE_URL: process.env.NODE_RED_BASE_URL || "",
  NODE_RED_TIMEOUT_MS: toNumber(process.env.NODE_RED_TIMEOUT_MS, 30000),
  NODE_RED_ENDPOINTS: {
    rag: process.env.NODE_RED_RAG_URL || "",
    oltp: process.env.NODE_RED_OLTP_URL || "",
    dwh: process.env.NODE_RED_DWH_URL || "",
  },
});

export const nodeRedConfiguredMap = Object.freeze({
  rag: env.NODE_RED_ENDPOINTS.rag || "(not set)",
  oltp: env.NODE_RED_ENDPOINTS.oltp || "(not set)",
  dwh: env.NODE_RED_ENDPOINTS.dwh || "(not set)",
});

export const dbConfigured = Boolean(env.DB_HOST && env.DB_USER && env.DB_NAME);
