export function errorHandler(error, _req, res, _next) {
  const statusCode = error.statusCode || 500;
  const message = error.message || "Terjadi kesalahan pada server.";

  if (statusCode >= 500) {
    console.error("[SERVER_ERROR]", error);
  }

  res.status(statusCode).json({
    error: message,
    ...(error.details ? { details: error.details } : {}),
  });
}
