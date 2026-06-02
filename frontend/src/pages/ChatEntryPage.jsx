import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { apiClient } from "@/apis/client.js";

/** Mengarahkan ke sesi terakhir user, atau ruang chat baru jika belum ada. */
export function ChatEntryPage() {
  const navigate = useNavigate();

  useEffect(() => {
    const resolveChatRoute = async () => {
      try {
        const res = await apiClient.get("/chat/sessions/latest");
        if (res.data?.id) {
          navigate(`/chat/${res.data.id}`, { replace: true });
          return;
        }
      } catch {
        // fallback ke new
      }
      navigate("/chat/new", { replace: true });
    };

    resolveChatRoute();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8fbff]">
      <p className="text-sm text-slate-600">Membuka chat...</p>
    </div>
  );
}
