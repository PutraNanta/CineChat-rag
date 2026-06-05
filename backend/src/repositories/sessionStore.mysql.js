import { randomUUID } from "node:crypto";
import { getDbPool } from "../config/database.js";
import { OPENAI_MODES } from "../config/constants.js";
import { ensureGuestUserId } from "./usersRepository.js";

const MODE_TO_ENDPOINT_ID = {
  [OPENAI_MODES.RAG]: 1,
  [OPENAI_MODES.OLTP]: 2,
  [OPENAI_MODES.DWH]: 3,
};

function mapModeToEndpointId(mode) {
  return MODE_TO_ENDPOINT_ID[mode] ?? null;
}

function mapSourceToEnum(source) {
  if (source === "node-red") return "node-red";
  if (source === "mock") return "mock";
  return "manual";
}

export const mysqlSessionStore = {
  async getLatest(userId) {
    const db = getDbPool();
    const ownerId = userId || (await ensureGuestUserId());

    const [rows] = await db.query(
      `SELECT id, title, user_id AS userId, created_at AS createdAt, updated_at AS updatedAt
       FROM chat_sessions
       WHERE user_id = ? AND status = 'active'
       ORDER BY updated_at DESC
       LIMIT 1`,
      [ownerId],
    );
    return rows[0] || null;
  },

  async getOrCreate(sessionId, firstUserMessage, { mode, userId, forceNew = false } = {}) {
    const db = getDbPool();
    const ownerId = userId || (await ensureGuestUserId());

    if (sessionId && !forceNew) {
      const [rows] = await db.query(
        `SELECT id, title, user_id AS userId, created_at AS createdAt, updated_at AS updatedAt
         FROM chat_sessions
         WHERE id = ? AND user_id = ? AND status = 'active'
         LIMIT 1`,
        [sessionId, ownerId],
      );
      if (rows.length > 0) {
        return rows[0];
      }
    }

    if (!forceNew) {
      const latest = await this.getLatest(userId);
      if (latest) return latest;
    }

    const id = randomUUID();
    const title = firstUserMessage?.slice(0, 150) || "Percakapan Baru";
    const startedModeId = mode ? mapModeToEndpointId(mode) : null;

    await db.query(
      `INSERT INTO chat_sessions (id, user_id, title, started_mode_id, status)
       VALUES (?, ?, ?, ?, 'active')`,
      [id, ownerId, title, startedModeId],
    );

    const [created] = await db.query(
      `SELECT id, title, user_id AS userId, created_at AS createdAt, updated_at AS updatedAt
       FROM chat_sessions WHERE id = ?`,
      [id],
    );
    return created[0];
  },

  async appendMessage(sessionId, message, { metrics } = {}) {
    const db = getDbPool();
    const endpointModeId = message.endpointMode
      ? mapModeToEndpointId(message.endpointMode)
      : null;
    const source = message.source ? mapSourceToEnum(message.source) : null;

    const [[seqRow]] = await db.query(
      `SELECT COALESCE(MAX(sequence_no), 0) + 1 AS nextSeq
       FROM chat_messages WHERE session_id = ?`,
      [sessionId],
    );
    const sequenceNo = seqRow.nextSeq;

    const [insertResult] = await db.query(
      `INSERT INTO chat_messages
        (session_id, sender, content, endpoint_mode_id, source, sequence_no)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [sessionId, message.sender, message.content, endpointModeId, source, sequenceNo],
    );

    const messageId = insertResult.insertId;

    if (metrics) {
      await db.query(
        `INSERT INTO message_metrics
          (message_id, latency_ms, token_in, token_out, cost_usd, cost_idr, raw_metrics_json)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          messageId,
          metrics.latency_ms,
          metrics.token_in,
          metrics.token_out,
          metrics.cost_usd,
          metrics.cost_idr,
          JSON.stringify(metrics.raw_metrics_json),
        ],
      );
    }

    await db.query(`UPDATE chat_sessions SET updated_at = CURRENT_TIMESTAMP WHERE id = ?`, [
      sessionId,
    ]);

    return { id: sessionId, messageId, sequenceNo };
  },

  async list(userId) {
    const db = getDbPool();
    const ownerId = userId || (await ensureGuestUserId());

    const [rows] = await db.query(
      `SELECT id, title, updated_at AS updatedAt
       FROM chat_sessions
       WHERE user_id = ? AND status = 'active'
       ORDER BY updated_at DESC`,
      [ownerId],
    );
    return rows;
  },

  async getById(id, userId) {
    const db = getDbPool();
    const ownerId = userId || (await ensureGuestUserId());

    const [sessionRows] = await db.query(
      `SELECT id, title, user_id AS userId, created_at AS createdAt, updated_at AS updatedAt
       FROM chat_sessions
       WHERE id = ? AND user_id = ? AND status = 'active'
       LIMIT 1`,
      [id, ownerId],
    );
    if (sessionRows.length === 0) return null;

    const [messages] = await db.query(
      `SELECT sender, content, created_at AS createdAt
       FROM chat_messages
       WHERE session_id = ?
       ORDER BY sequence_no ASC`,
      [id],
    );

    return {
      ...sessionRows[0],
      messages,
    };
  },

  async removeById(id, userId) {
    const db = getDbPool();
    const ownerId = userId || (await ensureGuestUserId());

    const [result] = await db.query(
      `UPDATE chat_sessions SET status = 'deleted', updated_at = CURRENT_TIMESTAMP
       WHERE id = ? AND user_id = ? AND status = 'active'`,
      [id, ownerId],
    );
    return result.affectedRows > 0;
  },
};
