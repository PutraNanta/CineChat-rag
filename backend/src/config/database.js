import mysql from "mysql2/promise";
import { dbConfigured, env } from "./env.js";

let pool = null;

export function getDbPool() {
  if (!dbConfigured) return null;
  if (pool) return pool;

  pool = mysql.createPool({
    host: env.DB_HOST,
    port: env.DB_PORT,
    user: env.DB_USER,
    password: env.DB_PASSWORD,
    database: env.DB_NAME,
    connectionLimit: env.DB_CONNECTION_LIMIT,
    waitForConnections: true,
    queueLimit: 0,
    enableKeepAlive: true,
    timezone: "Z",
  });

  return pool;
}

export async function pingDatabase() {
  if (!dbConfigured) {
    return { ok: false, reason: "DB env belum lengkap." };
  }

  try {
    const db = getDbPool();
    await db.query("SELECT 1 AS ok");
    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      reason: error?.message || "Koneksi DB gagal.",
    };
  }
}
