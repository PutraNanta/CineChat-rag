import { useState } from "react";
import { SendHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ChatInput({
  onSendMessage,
  isTyping,
  endpointOptions,
  selectedEndpoint,
  onSelectEndpoint,
}) {
  const [text, setText] = useState("");

  const handleSend = () => {
    if (text.trim() && !isTyping) {
      onSendMessage(text, selectedEndpoint);
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
    <div
      className={`relative rounded-3xl border bg-background px-4 py-3 shadow-lg focus-within:shadow-xl transition-all flex items-end gap-3 ${isTyping ? "opacity-70 pointer-events-none" : "focus-within:border-primary/50"}`}
    >
      <div className="flex-1 flex items-center gap-3">
      <textarea
        className="flex-1 max-h-32 min-h-[24px] bg-transparent resize-none outline-none py-1.5 text-sm disabled:cursor-not-allowed"
        placeholder={
          isTyping ? "Memproses jawaban..." : "Tanyakan sesuatu ke RAG Assistant..."
        }
        rows={1}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={isTyping}
      />
      </div>

      <div className="flex items-center gap-2 mb-0.5 shrink-0">
        <select
          value={selectedEndpoint}
          onChange={(e) => onSelectEndpoint(e.target.value)}
          disabled={isTyping}
          className="h-9 max-w-[220px] rounded-full border border-input bg-muted px-3 text-xs text-foreground outline-none focus:ring-1 focus:ring-ring"
          title="Pilih sumber jawaban"
        >
          {(endpointOptions || []).map((option) => (
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
  );
}
