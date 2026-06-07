import { useEffect, useRef, useState } from "react";
import { SendHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";

const MODE_OPTIONS = [
  { value: "rag", label: "RAG" },
  { value: "oltp", label: "SQL Normalisasi (OLTP)" },
  { value: "dwh", label: "SQL Denormalisasi (DWH)" },
  { value: "addfilm", label: "Tambah Film" },
  { value: "editfilm", label: "Edit Film" },
  { value: "delfilm", label: "Hapus Film" },
];

const MODE_PLACEHOLDERS = {
  rag: "Tanya info film — plot, aktor, tahun rilis, dan sejenisnya...",
  oltp: "Tanya film, genre/kategori, atau aktor. Contoh: 5 film Action terbaru",
  dwh: "Tanya data film lengkap: judul, genre, aktor, rating, harga, durasi...",
  addfilm:
    "Wajib: judul, deskripsi, kategori, aktor. Opsional: rating, harga, durasi",
  editfilm:
    "Sebut judul film, lalu bagian yang ingin diubah (deskripsi, kategori, rating, aktor...)",
  delfilm: "Ketik judul film yang ingin dihapus dari database",
};

function getInputPlaceholder(mode, isTyping) {
  if (isTyping) return "Memproses jawaban...";
  return MODE_PLACEHOLDERS[mode] ?? "Tanyakan sesuatu ke CineChat Assistant...";
}

const CHAT_EXAMPLES = [
  {
    id: "oltp-sample",
    mode: "oltp",
    title: "Contoh OLTP",
    prompt: "Tampilkan 5 film terbaru dari kategori Action beserta nama kategorinya.",
  },
  {
    id: "addfilm-sample",
    mode: "addfilm",
    title: "Contoh Tambah Film",
    prompt:
      "Tambahkan film dengan judul Academy Dinosaur, deskripsi Film drama investigasi modern, kategori Drama, aktor Penelope Guiness dan Johnny Cage.",
  },
  {
    id: "editfilm-sample",
    mode: "editfilm",
    title: "Contoh Edit Film",
    prompt:
      "Perbarui deskripsi film Academy Dinosaur menjadi Film Dinosaur yang menceritakan tentang dinosaurus.",
  },
  {
    id: "delfilm-sample",
    mode: "delfilm",
    title: "Contoh Hapus Film",
    prompt: "Hapus film dengan judul Academy Dinosaur.",
  },
];

export function ChatInput({
  onSendMessage,
  currentMode,
  onModeChange,
  isTyping,
  showExamples = false,
}) {
  const [text, setText] = useState("");
  const textareaRef = useRef(null);

  const resizeTextarea = () => {
    if (!textareaRef.current) return;

    textareaRef.current.style.height = "auto";
    const nextHeight = Math.min(textareaRef.current.scrollHeight, 160);
    textareaRef.current.style.height = `${nextHeight}px`;
    textareaRef.current.style.overflowY = textareaRef.current.scrollHeight > 160 ? "auto" : "hidden";
  };

  useEffect(() => {
    resizeTextarea();
  }, [text]);

  const applyExamplePrompt = (example) => {
    onModeChange?.(example.mode);
    setText(example.prompt);
  };

  const handleSend = () => {
    if (text.trim() && !isTyping) {
      onSendMessage(text);
      setText("");
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (!isTyping) {
        handleSend();
      }
    }
  };

  return (
    <div className="relative">
      {showExamples && (
        <div className="pointer-events-none absolute bottom-full left-0 right-0 mb-3 z-10">
          <div className="pointer-events-auto grid grid-cols-1 sm:grid-cols-2 gap-2">
            {CHAT_EXAMPLES.map((example) => (
              <button
                key={example.id}
                type="button"
                disabled={isTyping}
                onClick={() => applyExamplePrompt(example)}
                className="text-left rounded-xl border border-blue-100 bg-blue-50/90 hover:bg-blue-50 px-3 py-2 transition-colors shadow-sm disabled:opacity-60"
                title="Klik untuk mengisi contoh pertanyaan"
              >
                <p className="text-xs font-semibold text-blue-700">{example.title}</p>
                <p className="mt-1 text-xs text-slate-600 line-clamp-2">{example.prompt}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      <div
        className={`relative rounded-3xl border bg-background px-4 py-3 shadow-lg focus-within:shadow-xl transition-all flex items-end gap-3 ${isTyping ? "opacity-70 pointer-events-none" : "focus-within:border-primary/50"}`}
      >
        <div className="flex-1 flex items-center gap-3">
          <textarea
            ref={textareaRef}
            className="flex-1 max-h-32 min-h-[24px] bg-transparent resize-none outline-none py-1.5 text-sm disabled:cursor-not-allowed"
            placeholder={getInputPlaceholder(currentMode, isTyping)}
            rows={1}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isTyping}
          />
        </div>

        <div className="flex items-center gap-2 mb-0.5 shrink-0">
          <select
            value={currentMode}
            onChange={(e) => onModeChange?.(e.target.value)}
            disabled={isTyping}
            className="h-9 max-w-[220px] rounded-full border border-input bg-muted px-3 text-xs text-foreground outline-none focus:ring-1 focus:ring-ring"
            title="Pilih mode percakapan"
          >
            {MODE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <Button
            onClick={handleSend}
            size="icon"
            disabled={!text.trim() || isTyping}
            className="rounded-full shrink-0 bg-primary text-primary-foreground shadow-md hover:bg-primary/90 disabled:opacity-50"
          >
            <SendHorizontal className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
