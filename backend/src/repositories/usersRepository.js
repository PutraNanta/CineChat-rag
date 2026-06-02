import { randomUUID } from "node:crypto";
import { getDbPool } from "../config/database.js";
import { env } from "../config/env.js";
import { dbConfigured } from "../config/env.js";

const GUEST_EMAIL = env.GUEST_USER_EMAIL;

let cachedGuestUserId = null;

const GUEST_PASSWORD_PLACEHOLDER =
  "$2b$10$guest.placeholder.hash.not.used.for.login.xxxxxxxxx";

function mapUserRow(row) {
  if (!row) return null;
  return {
    id: row.id,
    email: row.email,
    username: row.username,
    password_hash: row.password_hash,
    display_name: row.display_name,
    is_active: Boolean(row.is_active),
  };
}

export async function ensureGuestUserId() {
  if (!dbConfigured) {
    throw new Error("Database belum dikonfigurasi.");
  }
  if (cachedGuestUserId) return cachedGuestUserId;

  const db = getDbPool();
  const [rows] = await db.query("SELECT id FROM users WHERE email = ? LIMIT 1", [
    GUEST_EMAIL,
  ]);

  if (rows.length > 0) {
    cachedGuestUserId = rows[0].id;
    return cachedGuestUserId;
  }

  const id = randomUUID();
  await db.query(
    `INSERT INTO users (id, email, username, password_hash, display_name, is_active)
     VALUES (?, ?, ?, ?, ?, 1)`,
    [id, GUEST_EMAIL, "guest", GUEST_PASSWORD_PLACEHOLDER, "Tamu"],
  );

  cachedGuestUserId = id;
  return id;
}

export async function findByEmail(email) {
  const db = getDbPool();
  const [rows] = await db.query(
    `SELECT id, email, username, password_hash, display_name, is_active
     FROM users WHERE email = ? LIMIT 1`,
    [email.trim().toLowerCase()],
  );
  return mapUserRow(rows[0]);
}

export async function findById(id) {
  const db = getDbPool();
  const [rows] = await db.query(
    `SELECT id, email, username, password_hash, display_name, is_active
     FROM users WHERE id = ? LIMIT 1`,
    [id],
  );
  return mapUserRow(rows[0]);
}

export async function createUser({ email, passwordHash, displayName, username = null }) {
  const db = getDbPool();
  const id = randomUUID();
  const normalizedEmail = email.trim().toLowerCase();

  await db.query(
    `INSERT INTO users (id, email, username, password_hash, display_name, is_active)
     VALUES (?, ?, ?, ?, ?, 1)`,
    [id, normalizedEmail, username, passwordHash, displayName],
  );

  return findById(id);
}
