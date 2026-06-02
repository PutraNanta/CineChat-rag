import { useState, useEffect } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { apiClient } from "../apis/client.js";
import { AppLayout } from "../components/layout/AppLayout";
import { ChatContainer } from "../components/chat/ChatContainer";
import { useNotify } from "@/context/NotifyContext";
import { useLoading } from "@/context/LoadingContext";

const ENDPOINT_OPTIONS = [
   { value: "/api/openai/rag", label: "RAG Database" },
   { value: "/api/openai/oltp", label: "SQL normalisasi (OLTP)" },
   { value: "/api/openai/dwh", label: "SQL denormalisasi (DWH)" },
];

const normalizeEndpointPath = (selectedEndpoint) => {
   const baseURL = apiClient.defaults.baseURL || "";
   if (baseURL.endsWith("/api") && selectedEndpoint.startsWith("/api/")) {
      return selectedEndpoint.replace("/api", "");
   }
   return selectedEndpoint;
};

export function ChatPage() {
   const { sessionId } = useParams();
   const location = useLocation();
   const navigate = useNavigate();
   const notify = useNotify();
   const { withLoading } = useLoading();
   const initialPrompt = location.state?.initialPrompt || null;
   const forceNewSession =
      sessionId === "new" && location.state?.forceNewSession === true;

   const [messages, setMessages] = useState(
      location.state?.initialMessages || [],
   );
   const [isTyping, setIsTyping] = useState(false);
   const [isSidebarOpen, setIsSidebarOpen] = useState(true);
   const [selectedEndpoint, setSelectedEndpoint] = useState(
      ENDPOINT_OPTIONS[0].value,
   );
   const [resolvingSession, setResolvingSession] = useState(
      sessionId === "new" && !forceNewSession,
   );

   const toggleSidebar = () => setIsSidebarOpen((prev) => !prev);

   const handleNewChat = () => {
      navigate("/chat/new", { state: { forceNewSession: true } });
   };

   useEffect(() => {
      if (sessionId !== "new" || forceNewSession) {
         setResolvingSession(false);
         return;
      }

      const resumeLatestSession = async () => {
         try {
            const res = await apiClient.get("/chat/sessions/latest");
            if (res.data?.id) {
               navigate(`/chat/${res.data.id}`, { replace: true });
               return;
            }
         } catch (error) {
            console.error("Failed to resolve latest session:", error);
         } finally {
            setResolvingSession(false);
         }
      };

      resumeLatestSession();
   }, [sessionId, forceNewSession, navigate]);

   useEffect(() => {
      const fetchHistory = async () => {
         if (resolvingSession) return;

         if (
            sessionId &&
            sessionId !== "new" &&
            (!location.state?.initialMessages ||
               location.state.initialMessages.length === 0)
         ) {
            try {
               const res = await withLoading(async () =>
                  apiClient.get(`/chat/sessions/${sessionId}`),
               );
               if (res.data) {
                  const history = res.data.map((msg) => ({
                     role: msg.sender,
                     content: msg.content,
                  }));
                  setMessages(history);
               }
            } catch (error) {
               console.error("Failed to fetch chat history:", error);
               notify.error(
                  "Gagal Memuat Riwayat",
                  "Riwayat chat tidak berhasil diambil dari server.",
               );
               if (error.response?.status === 404) {
                  navigate("/chat", { replace: true });
               }
            }
         } else if (sessionId === "new" && forceNewSession) {
            setMessages([]);
         }
      };

      fetchHistory();
   }, [
      sessionId,
      location.state?.initialMessages,
      navigate,
      notify,
      withLoading,
      resolvingSession,
      forceNewSession,
   ]);

   useEffect(() => {
      if (
         sessionId === "new" &&
         !forceNewSession &&
         !resolvingSession &&
         initialPrompt &&
         messages.length === 0 &&
         !isTyping
      ) {
         handleSendMessage(initialPrompt);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [sessionId, initialPrompt, resolvingSession, forceNewSession]);

   const handleSendMessage = async (text, endpointOverride) => {
      if (!text.trim()) return;
      const endpoint = endpointOverride || selectedEndpoint;

      const newMessage = { role: "user", content: text };
      setMessages((prev) => [...prev, newMessage]);
      setIsTyping(true);

      try {
         const payload = { message: text };
         if (sessionId && sessionId !== "new") {
            payload.sessionId = sessionId;
         }
         if (forceNewSession) {
            payload.forceNewSession = true;
         }

         const res = await withLoading(async () =>
            apiClient.post(normalizeEndpointPath(endpoint), payload),
         );

         const aiResponse = {
            role: "assistant",
            content: res.data.answer,
         };

         setMessages((prev) => [...prev, aiResponse]);

         if (sessionId === "new" && res.data.sessionId) {
            navigate(`/chat/${res.data.sessionId}`, {
               replace: true,
               state: {
                  initialMessages: [...messages, newMessage, aiResponse],
               },
            });
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
            `Pesan tidak bisa dikirim ke endpoint ${endpoint}${statusText}. Detail: ${backendError}`,
         );
         setMessages((prev) => [
            ...prev,
            {
               role: "assistant",
               content:
                  `Mohon maaf, terjadi kesalahan saat menghubungi endpoint ${endpoint}${statusText}.`,
            },
         ]);
      } finally {
         setIsTyping(false);
      }
   };

   if (resolvingSession) {
      return (
         <div className="min-h-screen flex items-center justify-center bg-background">
            <p className="text-sm text-muted-foreground">Memuat percakapan...</p>
         </div>
      );
   }

   return (
      <AppLayout
         isSidebarOpen={isSidebarOpen}
         toggleSidebar={toggleSidebar}
         onNewChat={handleNewChat}
      >
         <ChatContainer
            messages={messages}
            onSendMessage={handleSendMessage}
            endpointOptions={ENDPOINT_OPTIONS}
            selectedEndpoint={selectedEndpoint}
            onSelectEndpoint={setSelectedEndpoint}
            isTyping={isTyping}
            isSidebarOpen={isSidebarOpen}
            toggleSidebar={toggleSidebar}
         />
      </AppLayout>
   );
}
