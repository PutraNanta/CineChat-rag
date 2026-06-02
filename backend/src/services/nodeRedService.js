import axios from "axios";
import { env } from "../config/env.js";
import { MODE_TITLES } from "../config/constants.js";
import { HttpError } from "../utils/httpError.js";

function extractAnswer(payload, mode) {
  if (!payload) return "";
  if (typeof payload === "string") return payload;

  // Prioritas utama: format respons dari flow Node-RED kamu
  if (typeof payload.jawaban === "string" && payload.jawaban.trim()) {
    return payload.jawaban.trim();
  }
  if (typeof payload?.data?.jawaban === "string" && payload.data.jawaban.trim()) {
    return payload.data.jawaban.trim();
  }

  // Dukung format OpenAI mentah jika suatu saat di-return langsung
  const openAiContent = payload?.choices?.[0]?.message?.content;
  if (typeof openAiContent === "string" && openAiContent.trim()) {
    return openAiContent.trim();
  }

  const candidates = [
    payload.answer,
    payload.response,
    payload.output,
    payload.reply,
    payload.message,
    payload?.data?.answer,
    payload?.data?.response,
  ];

  const found = candidates.find((item) => typeof item === "string" && item.trim().length > 0);
  if (found) return found;

  return `Respons ${MODE_TITLES[mode]} diterima, tetapi field jawaban belum sesuai format.`;
}

function mockAnswer(mode, userMessage) {
  return [
    `[MOCK ${MODE_TITLES[mode]}] Endpoint Node-RED belum dikonfigurasi.`,
    "Isi variabel environment backend:",
    `- NODE_RED_${mode.toUpperCase()}_URL`,
    "",
    `Pertanyaan kamu: "${userMessage}"`,
  ].join("\n");
}

function resolveTargetUrl(rawUrl, mode) {
  if (!rawUrl) return "";

  // Absolute URL -> langsung pakai
  if (/^https?:\/\//i.test(rawUrl)) {
    return rawUrl;
  }

  // Relative path -> butuh NODE_RED_BASE_URL
  if (rawUrl.startsWith("/")) {
    if (!env.NODE_RED_BASE_URL) {
      throw new HttpError(
        500,
        `Konfigurasi Node-RED untuk mode ${MODE_TITLES[mode]} belum valid.`,
          {
            reason:
              "Endpoint menggunakan path relatif, tapi NODE_RED_BASE_URL belum diisi.",
            targetUrl: rawUrl,
          expectedExample: "NODE_RED_BASE_URL=<your-node-red-base-url>",
          },
        );
    }

    try {
      return new URL(rawUrl, env.NODE_RED_BASE_URL).toString();
    } catch (_error) {
      throw new HttpError(
        500,
        `Konfigurasi NODE_RED_BASE_URL tidak valid untuk mode ${MODE_TITLES[mode]}.`,
        {
          reason: "Gagal menggabungkan NODE_RED_BASE_URL dengan endpoint path.",
          targetUrl: rawUrl,
          nodeRedBaseUrl: env.NODE_RED_BASE_URL,
        },
      );
    }
  }

  throw new HttpError(
    500,
    `Konfigurasi URL Node-RED untuk mode ${MODE_TITLES[mode]} tidak valid.`,
    {
      reason: "Endpoint harus URL absolut (http/https) atau path relatif diawali '/'.",
      targetUrl: rawUrl,
    },
  );
}

export async function requestNodeRed({ mode, message, sessionId }) {
  const rawTargetUrl = env.NODE_RED_ENDPOINTS[mode];

  if (!rawTargetUrl) {
    return {
      answer: mockAnswer(mode, message),
      source: "mock",
      rawPayload: null,
    };
  }

  const targetUrl = resolveTargetUrl(rawTargetUrl, mode);

  try {
    const response = await axios.post(
      targetUrl,
      {
        // Flow Node-RED membaca pertanyaan dari msg.payload.pertanyaan
        pertanyaan: message,
        // Tetap kirim message untuk kompatibilitas bila flow lain pakai key ini
        message,
        sessionId,
        mode,
      },
      {
        timeout: env.NODE_RED_TIMEOUT_MS,
        headers: { "Content-Type": "application/json" },
      },
    );

    return {
      answer: extractAnswer(response.data, mode),
      source: "node-red",
      rawPayload: response.data,
    };
  } catch (error) {
    throw new HttpError(502, "Gagal menghubungi endpoint Node-RED.", {
      mode,
      targetUrl,
      reason: error?.message || "Unknown error",
    });
  }
}
