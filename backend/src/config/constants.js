export const OPENAI_MODES = Object.freeze({
  RAG: "rag",
  OLTP: "oltp",
  DWH: "dwh",
});

export const MODE_TITLES = Object.freeze({
  [OPENAI_MODES.RAG]: "RAG Database",
  [OPENAI_MODES.OLTP]: "SQL Normalisasi (OLTP)",
  [OPENAI_MODES.DWH]: "SQL Denormalisasi (DWH)",
});
