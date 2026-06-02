import { MODE_TITLES } from "../config/constants.js";
import { sessionStore } from "../repositories/sessionStore.js";
import { requestNodeRed } from "./nodeRedService.js";
import { HttpError } from "../utils/httpError.js";
import { parseNodeRedMetrics } from "../utils/metricsParser.js";

export async function getLatestSession(userId) {
  return sessionStore.getLatest(userId);
}

export async function sendMessageToMode({
  mode,
  message,
  sessionId,
  userId,
  forceNewSession = false,
}) {
  const session = await sessionStore.getOrCreate(sessionId, message, {
    mode,
    userId,
    forceNew: forceNewSession,
  });

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
    const fallback = `Gagal menghubungi Node-RED untuk mode ${MODE_TITLES[mode]}.`;
    await sessionStore.appendMessage(session.id, {
      sender: "assistant",
      content: fallback,
      endpointMode: mode,
      source: "manual",
    });
    throw error;
  }
}

export async function listSessions(userId) {
  return sessionStore.list(userId);
}

export async function getSessionMessages(sessionId, userId) {
  const session = await sessionStore.getById(sessionId, userId);
  if (!session) throw new HttpError(404, "Session tidak ditemukan.");
  return session.messages;
}

export async function deleteSession(sessionId, userId) {
  const deleted = await sessionStore.removeById(sessionId, userId);
  if (!deleted) throw new HttpError(404, "Session tidak ditemukan.");
  return { ok: true };
}
