import { verifyAccessToken } from "../services/authService.js";
import { HttpError } from "../utils/httpError.js";

function extractBearerToken(req) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) return null;
  return header.slice(7).trim();
}

/** Set req.user jika token valid; jika tidak ada token, lanjut sebagai tamu. */
export function authenticateOptional(req, _res, next) {
  const token = extractBearerToken(req);
  if (!token) {
    req.user = null;
    return next();
  }

  const user = verifyAccessToken(token);
  req.user = user;
  return next();
}

/** Wajib login — token invalid/absent -> 401. */
export function authenticateRequired(req, _res, next) {
  const token = extractBearerToken(req);
  if (!token) {
    return next(new HttpError(401, "Autentikasi diperlukan."));
  }

  const user = verifyAccessToken(token);
  if (!user) {
    return next(new HttpError(401, "Token tidak valid atau sudah kedaluwarsa."));
  }

  req.user = user;
  return next();
}
