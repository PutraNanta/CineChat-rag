import { MODE_TITLES } from "../config/constants.js";
import { dbConfigured } from "../config/env.js";
import { memorySessionStore } from "../repositories/sessionStore.memory.js";
import { mysqlSessionStore } from "../repositories/sessionStore.mysql.js";
import { requestNodeRed } from "./nodeRedService.js";
import { HttpError } from "../utils/httpError.js";
import { parseNodeRedMetrics } from "../utils/metricsParser.js";

function getSessionStore() {
  return dbConfigured ? mysqlSessionStore : memorySessionStore;
}

export async function getLatestSession(userId) {
  return getSessionStore().getLatest(userId);
}

export async function sendMessageToMode({
  mode,
  message,
  sessionId,
  userId,
  forceNewSession = false,
}) {
  const sessionStore = getSessionStore();
  const session = await sessionStore.getOrCreate(sessionId, message, {
    mode,
    userId,
    forceNew: forceNewSession,
  });

  if (!session?.id) {
    throw new HttpError(500, "Gagal membuat atau memuat session chat.");
  }

  await sessionStore.appendMessage(session.id, {
    sender: "user",
    content: message,
    endpointMode: mode,
  });

  try {
    const result = await requestNodeRed({
      mode,
      message,
      sessionId: session.id,
    });

    const metrics =
      result.source === "node-red" ? parseNodeRedMetrics(result.rawPayload) : null;

    await sessionStore.appendMessage(
      session.id,
      {
        sender: "assistant",
        content: result.answer,
        endpointMode: mode,
        source: result.source,
      },
      { metrics },
    );

    return {
      answer: result.answer,
      sessionId: session.id,
      mode,
      source: result.source,
    };
  } catch (error) {
    const reason =
      error?.details?.reason || error?.message || "Silakan coba lagi.";
    const fallback = `Gagal menghubungi AI untuk mode ${MODE_TITLES[mode]}. ${reason}`;

    await sessionStore.appendMessage(session.id, {
      sender: "assistant",
      content: fallback,
      endpointMode: mode,
      source: "manual",
    });

    return {
      answer: fallback,
      sessionId: session.id,
      mode,
      source: "manual",
    };
  }
}

export async function listSessions(userId) {
  return getSessionStore().list(userId);
}

export async function getSessionMessages(sessionId, userId) {
  const session = await getSessionStore().getById(sessionId, userId);
  if (!session) throw new HttpError(404, "Session tidak ditemukan.");
  return session.messages;
}

export async function deleteSession(sessionId, userId) {
  const deleted = await getSessionStore().removeById(sessionId, userId);
  if (!deleted) throw new HttpError(404, "Session tidak ditemukan.");
  return { ok: true };
}
