import { useState, useEffect, useRef } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { apiClient } from "../apis/client.js";
import { AppLayout } from "../components/layout/AppLayout";
import { ChatContainer } from "../components/chat/ChatContainer";
import { useNotify } from "@/context/NotifyContext";
import { useLoading } from "@/context/LoadingContext";
import { useAuthContext } from "@/context/AuthContext";
import {
   isNewChatSession,
   isValidSessionId,
   resolveSessionIdFromResponse,
} from "@/utils/session.js";
import { notifyChatSessionsChanged } from "@/utils/chatEvents.js";

const CHAT_ENDPOINT = "/chat";

export function ChatPage() {
   const { sessionId } = useParams();
   const location = useLocation();
   const navigate = useNavigate();
   const notify = useNotify();
   const { withLoading } = useLoading();
   const { isAuthenticated, isLoading: authLoading } = useAuthContext();
   const initialPrompt = location.state?.initialPrompt || null;
   const isNewChat = isNewChatSession(sessionId);

   const [messages, setMessages] = useState([]);
   const [isTyping, setIsTyping] = useState(false);
   const [isSidebarOpen, setIsSidebarOpen] = useState(true);
   
   // 🌟 TAMBAHAN: State untuk melacak mode dropdown aktif (default: 'rag')
   const [currentMode, setCurrentMode] = useState("rag");
   const skipHistoryFetchRef = useRef(null);
   const prevSessionIdRef = useRef(sessionId);
   const guestSessionIdRef = useRef(null);

   const toggleSidebar = () => setIsSidebarOpen((prev) => !prev);

   const handleNewChat = () => {
      setMessages([]);
      setCurrentMode("rag");
      skipHistoryFetchRef.current = null;
      guestSessionIdRef.current = null;
      navigate("/chat/new", {
         replace: isNewChat,
      });
   };

   useEffect(() => {
      if (authLoading) return;

      const prevSessionId = prevSessionIdRef.current;
      prevSessionIdRef.current = sessionId;

      if (!isAuthenticated) {
         if (!isNewChat) {
            navigate("/chat/new", { replace: true });
         }
         return;
      }

      if (isNewChat) {
         if (!isNewChatSession(prevSessionId)) {
            setMessages([]);
            skipHistoryFetchRef.current = null;
         }
         return;
      }

      if (!isValidSessionId(sessionId)) {
         navigate("/chat/new", { replace: true });
         return;
      }

      let cancelled = false;

      const fetchHistory = async () => {
         if (skipHistoryFetchRef.current === sessionId) {
            skipHistoryFetchRef.current = null;
            return;
         }

         setMessages([]);

         try {
            const res = await withLoading(async () =>
               apiClient.get(`/chat/sessions/${sessionId}`),
            );
            if (cancelled) return;

            if (!Array.isArray(res.data)) {
               throw new Error("Format riwayat chat tidak valid.");
            }

            const history = res.data.map((msg) => ({
               role: msg.sender,
               content: msg.content,
               sql: msg.sql_tereksekusi || null,
            }));
            setMessages(history);
         } catch (error) {
            if (cancelled) return;

            const status = error.response?.status;
            if (status === 401 || status === 403) {
               return;
            }

            console.error("Failed to fetch chat history:", error);

            if (status === 404) {
               notify.error(
                  "Percakapan Tidak Ditemukan",
                  "Sesi ini tidak ada, sudah dihapus, atau bukan milik akun Anda. Silakan pilih percakapan lain.",
               );
               navigate("/chat/new", { replace: true });
               return;
            }

            notify.error(
               "Gagal Memuat Riwayat",
               "Terjadi kesalahan saat mengambil riwayat chat. Silakan coba lagi.",
            );
         }
      };

      fetchHistory();

      return () => {
         cancelled = true;
      };
   }, [sessionId, navigate, notify, authLoading, isAuthenticated]);

   useEffect(() => {
      if (
         isNewChat &&
         initialPrompt &&
         messages.length === 0 &&
         !isTyping
      ) {
         handleSendMessage(initialPrompt);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [sessionId, initialPrompt]);

   const handleSendMessage = async (text) => {
      if (!text.trim()) return;

      const newMessage = { role: "user", content: text };
      setMessages((prev) => [...prev, newMessage]);
      setIsTyping(true);

      try {
         // 🌟 PERBAIKAN: Format payload diubah dari 'message' menjadi 'pertanyaan'
         // Dan menyertakan properti 'mode' ke backend Express sesuai spesifikasi
         const payload = { 
            pertanyaan: text, 
            mode: currentMode 
         };
         
         if (isAuthenticated) {
            if (isValidSessionId(sessionId)) {
               payload.sessionId = sessionId;
            }
            if (isNewChat) {
               payload.forceNewSession = true;
            }
         } else if (isValidSessionId(guestSessionIdRef.current)) {
            payload.sessionId = guestSessionIdRef.current;
         } else if (isNewChat) {
            payload.forceNewSession = true;
         }

         const res = await withLoading(async () =>
            apiClient.post(CHAT_ENDPOINT, payload),
         );

         // PERBAIKAN: Mengambil data respons dari properti '.jawaban', bukan '.answer'
         const aiResponse = {
            role: "assistant",
            content: res.data.jawaban,
            // TAMBAHAN: Menyimpan kueri SQL produksi untuk dirender di komponen UI Transparan
            sql: res.data.sql_tereksekusi || null 
         };

         setMessages((prev) => [...prev, aiResponse]);

         const createdSessionId = resolveSessionIdFromResponse(res.data);

         if (isNewChat && createdSessionId && isAuthenticated) {
            skipHistoryFetchRef.current = createdSessionId;
            notifyChatSessionsChanged();
            navigate(`/chat/${createdSessionId}`, {
               replace: true,
               state: null,
            });
         } else if (!isAuthenticated && createdSessionId) {
            guestSessionIdRef.current = createdSessionId;
         } else if (isNewChat && !createdSessionId) {
            notify.error(
               "Sesi Chat Gagal Dibuat",
               "Server tidak mengembalikan ID percakapan. Pesan mungkin sudah terkirim, silakan refresh atau coba lagi.",
            );
         }
      } catch (error) {
         console.error("Error sending message:", error);
         const backendError =
            error?.response?.data?.details?.reason ||
            error?.response?.data?.error ||
            error?.message ||
            "Unknown error";
         const statusCode = error?.response?.status;
         const statusText = statusCode ? ` (HTTP ${statusCode})` : "";
         notify.error(
            "Pengiriman Gagal",
            `Pesan tidak bisa dikirim ke endpoint ${CHAT_ENDPOINT}${statusText}. Detail: ${backendError}`,
         );
         setMessages((prev) => [
            ...prev,
            {
               role: "assistant",
               content:
                  `Mohon maaf, terjadi kesalahan saat menghubungi endpoint ${CHAT_ENDPOINT}${statusText}.`,
            },
         ]);
      } finally {
         setIsTyping(false);
      }
   };

   return (
      <AppLayout
         isSidebarOpen={isSidebarOpen}
         toggleSidebar={toggleSidebar}
         onNewChat={handleNewChat}
      >
         <ChatContainer
            messages={messages}
            onSendMessage={handleSendMessage}
            isTyping={isTyping}
            isSidebarOpen={isSidebarOpen}
            toggleSidebar={toggleSidebar}
            currentMode={currentMode}
            onModeChange={setCurrentMode}
            showExamples={isNewChat && messages.length === 0}
         />
      </AppLayout>
   );
}