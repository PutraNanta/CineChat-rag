import { pingDatabase } from "../config/database.js";
import { dbConfigured, nodeRedConfiguredMap } from "../config/env.js";

export async function getHealth(_req, res) {
  const dbHealth = await pingDatabase();

  res.json({
    status: dbHealth.ok || !dbConfigured ? "ok" : "degraded",
    service: "rag-web-backend",
    database: {
      configured: dbConfigured,
      connected: dbHealth.ok,
      reason: dbHealth.ok ? null : dbHealth.reason,
    },
    configuredEndpoints: {
      rag: nodeRedConfiguredMap.rag !== "(not set)",
      oltp: nodeRedConfiguredMap.oltp !== "(not set)",
      dwh: nodeRedConfiguredMap.dwh !== "(not set)",
    },
  });
}
