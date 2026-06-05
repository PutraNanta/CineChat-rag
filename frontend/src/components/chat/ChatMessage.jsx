import { Avatar } from "@/components/ui/avatar";
import { User, Bot } from "lucide-react";

function normalizeAssistantContent(content) {
   return String(content || "")
      .replace(/\r\n/g, "\n")
      .replace(/\n{3,}/g, "\n\n")
      .replace(/^\s*\.{2,}\s*$/gm, "")
      .trim();
}

function renderInline(text) {
   const pattern = /(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g;
   const parts = text.split(pattern).filter((part) => part.length > 0);

   return parts.map((part, index) => {
      if (part.startsWith("**") && part.endsWith("**")) {
         return <strong key={index}>{part.slice(2, -2)}</strong>;
      }
      if (part.startsWith("*") && part.endsWith("*")) {
         return <em key={index}>{part.slice(1, -1)}</em>;
      }
      if (part.startsWith("`") && part.endsWith("`")) {
         return (
            <code key={index} className="chat-message-prose__code">
               {part.slice(1, -1)}
            </code>
         );
      }
      return <span key={index}>{part}</span>;
   });
}

function renderAssistantContent(content) {
   const lines = normalizeAssistantContent(content).split("\n");
   const nodes = [];
   let listBuffer = [];

   const flushList = () => {
      if (listBuffer.length === 0) return;

      const isOrdered = listBuffer.every((item) => /^\d+\./.test(item.trim()));
      const ListTag = isOrdered ? "ol" : "ul";
      nodes.push(
         <ListTag key={`list-${nodes.length}`} className="chat-message-prose__list">
            {listBuffer.map((item, idx) => {
               const cleaned = item.replace(/^\s*(?:\d+\.|[-*•])\s*/, "");
               return <li key={idx}>{renderInline(cleaned)}</li>;
            })}
         </ListTag>,
      );
      listBuffer = [];
   };

   lines.forEach((rawLine) => {
      const line = rawLine.trim();

      if (!line) {
         flushList();
         return;
      }

      const headingMatch = line.match(/^(#{1,3})\s+(.+)$/);
      if (headingMatch) {
         flushList();
         const level = headingMatch[1].length;
         const Tag = level === 1 ? "h3" : level === 2 ? "h4" : "h5";
         nodes.push(
            <Tag key={`h-${nodes.length}`} className="chat-message-prose__heading">
               {renderInline(headingMatch[2])}
            </Tag>,
         );
         return;
      }

      if (line.startsWith("> ")) {
         flushList();
         nodes.push(
            <blockquote
               key={`bq-${nodes.length}`}
               className="chat-message-prose__blockquote"
            >
               {renderInline(line.slice(2))}
            </blockquote>,
         );
         return;
      }

      if (/^(\d+\.|[-*•])\s+/.test(line)) {
         listBuffer.push(line);
         return;
      }

      flushList();
      nodes.push(
         <p key={`p-${nodes.length}`} className="chat-message-prose__paragraph">
            {renderInline(line)}
         </p>,
      );
   });

   flushList();
   return nodes;
}

export function ChatMessage({ role, content }) {
   const isUser = role === "user";
   return (
      <div
         className={`flex w-full gap-4 ${isUser ? "flex-row-reverse" : "flex-row"}`}
      >
         <Avatar
            className={`h-8 w-8 flex items-center justify-center shrink-0 ${isUser ? "bg-primary text-primary-foreground" : "bg-blue-600 text-white"}`}
         >
            {isUser ? (
               <User className="h-5 w-5" />
            ) : (
               <Bot className="h-5 w-5" />
            )}
         </Avatar>
         <div
            className={`flex flex-col gap-1 max-w-[85%] ${isUser ? "items-end" : "items-start"}`}
         >
            <div className="font-semibold text-sm px-1">
               {isUser ? "Anda" : "CineChat"}
            </div>
            <div
               className={`text-sm ${isUser ? "bg-muted py-3 px-5 rounded-3xl rounded-tr-sm" : "bg-transparent py-2"} text-foreground leading-relaxed`}
            >
               {isUser ? (
                  content
               ) : (
                  <div className="chat-message-prose">
                     {renderAssistantContent(content)}
                  </div>
               )}
            </div>
         </div>
      </div>
   );
}
