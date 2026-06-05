const INVALID_SESSION_IDS = new Set(["new", "undefined", "null"]);

export function isNewChatSession(sessionId) {
  return sessionId === "new";
}

export function isValidSessionId(value) {
  if (typeof value !== "string") return false;

  const trimmed = value.trim();
  if (!trimmed || INVALID_SESSION_IDS.has(trimmed)) return false;

  return true;
}

export function resolveSessionIdFromResponse(data) {
  if (!data || typeof data !== "object") return null;

  const candidates = [data.sessionId, data.session_id, data.id];
  return candidates.find((value) => isValidSessionId(value)) || null;
}
