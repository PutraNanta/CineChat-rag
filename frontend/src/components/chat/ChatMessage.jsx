import { Avatar } from "@/components/ui/avatar";
import { User } from "lucide-react";
import LogoImage from "@/assets/react.svg";

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
               <img src={LogoImage} alt="logo" width={24} />
            )}
         </Avatar>
         <div
            className={`flex flex-col gap-1 max-w-[85%] ${isUser ? "items-end" : "items-start"}`}
         >
            <div className="font-semibold text-sm px-1">
               {isUser ? "Anda" : "RAG Assistant"}
            </div>
            <div
               className={`text-sm ${isUser ? "bg-muted py-3 px-5 rounded-3xl rounded-tr-sm" : "bg-transparent py-2"} text-foreground whitespace-pre-wrap leading-relaxed`}
            >
               {content}
            </div>
         </div>
      </div>
   );
}
