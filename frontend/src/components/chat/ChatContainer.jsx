import { useRef, useEffect } from "react";
import { Home, Menu } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ChatMessage } from "./ChatMessage";
import { ChatInput } from "./ChatInput";
import { useAuthContext } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";

export function ChatContainer({
   messages,
   onSendMessage,
   currentMode,
   onModeChange,
   isTyping,
   isSidebarOpen,
   toggleSidebar,
   showExamples = false,
}) {
   // Ambil data user dari context (Best Practice)
   const { user, isAuthenticated } = useAuthContext();
   const navigate = useNavigate();
   const scrollRef = useRef(null);

   // Nama user diambil langsung dari state context
   const userName = user?.name || user?.username || null;

   const isGuestLimited = !isAuthenticated && messages.length >= 2;

   useEffect(() => {
      if (scrollRef.current) {
         scrollRef.current.scrollTo({
            top: scrollRef.current.scrollHeight,
            behavior: "smooth",
         });
      }
   }, [messages, isTyping]);

   return (
      <div className="flex-1 flex flex-col w-full h-full min-h-0 bg-background">
         {!isSidebarOpen && (
            <div className="flex items-center gap-1 border-b border-border/40 px-3 py-2 shrink-0 bg-background">
               <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleSidebar}
                  title="Buka sidebar"
               >
                  <Menu className="h-5 w-5" />
               </Button>
               <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate("/")}
                  className="rounded-full text-muted-foreground hover:bg-sky-50 hover:text-sky-700"
               >
                  <Home className="mr-1.5 h-4 w-4" />
                  Landing Page
               </Button>
            </div>
         )}

         <div
            ref={scrollRef}
            className="flex-1 min-h-0 w-full max-w-4xl mx-auto overflow-y-auto scrollbar-hide px-4 sm:px-6 space-y-6 pb-6 pt-4"
         >
            <AnimatePresence mode="wait">
               {messages.length === 0 ? (
                  <motion.div
                     key="empty-state"
                     initial={{ opacity: 0, y: 16 }}
                     animate={{ opacity: 1, y: 0 }}
                     exit={{ opacity: 0, y: -8 }}
                     transition={{ duration: 0.4, ease: "easeOut" }}
                     className="py-10 text-center space-y-4"
                  >
                     <h1 className="text-4xl font-semibold bg-gradient-to-r from-blue-500 to-primary bg-clip-text text-transparent">
                        {userName ? `Halo, ${userName}!` : "Halo!"}
                     </h1>
                     <p className="text-xl text-muted-foreground">
                        Ada yang bisa saya bantu untuk membantu kamu hari ini?
                     </p>
                  </motion.div>
               ) : (
                  <motion.div
                     key="messages-list"
                     initial={{ opacity: 0 }}
                     animate={{ opacity: 1 }}
                     className="space-y-6"
                  >
                     {messages.map((msg, idx) => (
                        <ChatMessage
                           key={idx}
                           role={msg.role}
                           content={msg.content}
                        />
                     ))}
                  </motion.div>
               )}
            </AnimatePresence>

            {isTyping && (
               <div className="flex w-full gap-4 flex-row items-center animate-pulse">
                  <div className="h-8 w-8 rounded-full bg-blue-600/50 shrink-0" />
                  <div className="text-sm bg-muted py-2 px-4 rounded-3xl rounded-tr-sm text-muted-foreground">
                     Memproses jawaban...
                  </div>
               </div>
            )}
         </div>

         <footer className="shrink-0 border-t border-border/60 bg-background px-4 sm:px-6 pt-4 pb-5 shadow-[0_-12px_24px_-8px_rgba(15,23,42,0.06)]">
            <div className="max-w-3xl mx-auto">
               {isGuestLimited ? (
                  <motion.div
                     initial={{ opacity: 0, y: 10 }}
                     animate={{ opacity: 1, y: 0 }}
                     className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-center shadow-sm"
                  >
                     <p className="text-sm text-blue-700 font-medium mb-3">
                        Limit percobaan gratis telah habis. Silakan Masuk atau Daftar untuk melanjutkan percakapan dan menyimpan riwayat Anda.
                     </p>
                     <Button
                        onClick={() => navigate("/auth")}
                        className="bg-blue-600 hover:bg-blue-700 text-white rounded-full px-6"
                     >
                        Masuk / Daftar
                     </Button>
                  </motion.div>
               ) : (
                  <>
                     <ChatInput
                        onSendMessage={onSendMessage}
                        currentMode={currentMode}
                        onModeChange={onModeChange}
                        isTyping={isTyping}
                        showExamples={showExamples}
                     />
                     <p className="text-xs text-center text-muted-foreground mt-3">
                        CineChat dapat membuat kesalahan. Harap verifikasi informasi penting.
                     </p>
                  </>
               )}
            </div>
         </footer>
      </div>
   );
}