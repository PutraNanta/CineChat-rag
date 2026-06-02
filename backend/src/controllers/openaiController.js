import { sendMessageToMode } from "../services/chatService.js";
import { OPENAI_MODES } from "../config/constants.js";

async function handle(req, res, mode) {
  const result = await sendMessageToMode({
    mode,
    message: req.body.message,
    sessionId: req.body.sessionId,
    userId: req.user?.id ?? null,
    forceNewSession: Boolean(req.body.forceNewSession),
  });
  res.json(result);
}

export async function postRag(req, res) {
  await handle(req, res, OPENAI_MODES.RAG);
}

export async function postOltp(req, res) {
  await handle(req, res, OPENAI_MODES.OLTP);
}

export async function postDwh(req, res) {
  await handle(req, res, OPENAI_MODES.DWH);
}
