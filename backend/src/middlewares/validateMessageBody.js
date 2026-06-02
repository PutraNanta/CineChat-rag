import { HttpError } from "../utils/httpError.js";

export function validateMessageBody(req, _res, next) {
  const { message } = req.body || {};
  if (!message || typeof message !== "string" || !message.trim()) {
    return next(new HttpError(400, "Field 'message' wajib diisi."));
  }

  req.body.message = message.trim();
  next();
}
