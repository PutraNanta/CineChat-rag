import express from "express";
import cors from "cors";
import { env } from "./config/env.js";
import apiRoutes from "./routes/index.js";
import { notFound } from "./middlewares/notFound.js";
import { errorHandler } from "./middlewares/errorHandler.js";

export function createApp() {
  const app = express();
  const allowedOrigins = env.FRONTEND_ORIGINS.length > 0 ? env.FRONTEND_ORIGINS : [];

  app.use(
    cors({
      origin: (requestOrigin, callback) => {
        if (!requestOrigin) {
          callback(null, true);
          return;
        }

        if (allowedOrigins.includes("*") || allowedOrigins.includes(requestOrigin)) {
          callback(null, true);
          return;
        }

        callback(new Error(`Origin not allowed: ${requestOrigin}`));
      },
      credentials: true,
    }),
  );
  app.use(express.json());

  app.use("/api", apiRoutes);

  app.use(notFound);
  app.use(errorHandler);

  return app;
}
