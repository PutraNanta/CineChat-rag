/** Ekstrak metrik dari payload Node-RED (node Hitung Cost O1/O2/O3). */
export function parseNodeRedMetrics(rawPayload) {
  const metrik = rawPayload?.metrik;
  if (!metrik || typeof metrik !== "object") return null;

  const costUsd = metrik.biaya_usd != null ? Number(metrik.biaya_usd) : null;
  const costIdr = metrik.biaya_rp != null ? Number(metrik.biaya_rp) : null;

  return {
    latency_ms: metrik.latency_ms ?? null,
    token_in: metrik.token_in ?? null,
    token_out: metrik.token_out ?? null,
    cost_usd: Number.isFinite(costUsd) ? costUsd : null,
    cost_idr: Number.isFinite(costIdr) ? costIdr : null,
    raw_metrics_json: metrik,
  };
}
