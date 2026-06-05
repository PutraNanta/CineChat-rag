import { HttpError } from "../utils/httpError.js";

export function validateMessageBody(req, _res, next) {
  const body = req.body || {};
  const message = body.message || body.pertanyaan;

  if (!message || typeof message !== "string" || !message.trim()) {
    return next(new HttpError(400, "Field 'message' atau 'pertanyaan' wajib diisi."));
  }

  req.body.message = message.trim();
  req.body.pertanyaan = req.body.message;
  next();
}
