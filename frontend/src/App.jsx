import { Navigate, Route, Routes } from "react-router-dom";
import { LandingPage } from "@/pages/LandingPage";
import { ChatEntryPage } from "@/pages/ChatEntryPage";
import { ChatPage } from "@/pages/ChatPage";
import { AuthPage } from "@/pages/auth/AuthPage";
import { useAuthContext } from "@/context/AuthContext";

function App() {
  const { isLoading } = useAuthContext();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8fbff]">
        <div className="rounded-2xl border border-sky-100 bg-white px-6 py-4 shadow-sm">
          <p className="text-sm text-slate-600">Memverifikasi sesi...</p>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/chat" element={<ChatEntryPage />} />
      {/* /chat/new harus lewat :sessionId agar useParams() = "new", bukan undefined */}
      <Route path="/chat/:sessionId" element={<ChatPage />} />
      <Route path="/auth" element={<AuthPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
