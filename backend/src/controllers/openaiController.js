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
  res.json({
    jawaban: result.answer,
    answer: result.answer,
    sessionId: result.sessionId,
    mode: result.mode,
    source: result.source,
  });
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

export async function postChat(req, res) {
  const requestedMode = String(req.body.mode || OPENAI_MODES.RAG).toLowerCase();
  const mode = Object.values(OPENAI_MODES).includes(requestedMode)
    ? requestedMode
    : OPENAI_MODES.RAG;

  await handle(req, res, mode);
}
