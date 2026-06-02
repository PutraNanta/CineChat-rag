import {
  deleteSession,
  getLatestSession,
  getSessionMessages,
  listSessions,
} from "../services/chatService.js";

export async function getLatestSessionHandler(req, res) {
  const userId = req.user?.id || null;
  const latest = await getLatestSession(userId);
  res.json(latest || null);
}

export async function getSessions(req, res) {
  const userId = req.user?.id || null;
  const sessions = await listSessions(userId);
  res.json(sessions);
}

export async function getSessionById(req, res) {
  const userId = req.user?.id || null;
  const messages = await getSessionMessages(req.params.id, userId);
  res.json(messages);
}

export async function removeSession(req, res) {
  const userId = req.user?.id || null;
  const result = await deleteSession(req.params.id, userId);
  res.json(result);
}
