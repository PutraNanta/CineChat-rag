export const OPENAI_MODES = Object.freeze({
  RAG: "rag",
  OLTP: "oltp",
  DWH: "dwh",
  ADDFILM: "addfilm",
  EDITFILM: "editfilm",
  DELFILM: "delfilm",
});

export const MODE_TITLES = Object.freeze({
  [OPENAI_MODES.RAG]: "RAG Database",
  [OPENAI_MODES.OLTP]: "SQL Normalisasi (OLTP)",
  [OPENAI_MODES.DWH]: "SQL Denormalisasi (DWH)",
  [OPENAI_MODES.ADDFILM]: "Tambah Film",
  [OPENAI_MODES.EDITFILM]: "Edit Film",
  [OPENAI_MODES.DELFILM]: "Hapus Film",
});
