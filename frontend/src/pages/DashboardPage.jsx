import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Clapperboard,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const CHAT_PROMPT =
  "Bantu saya mencari rekomendasi, sinopsis, trivia, atau diskusi film menggunakan CineChat.";

export function DashboardPage() {
  const navigate = useNavigate();

  const welcomeText = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return "Selamat pagi";
    if (hour < 18) return "Selamat sore";
    return "Selamat malam";
  }, []);

  const startChat = (prompt) => {
    navigate("/chat/new", {
      state: {
        initialPrompt: prompt || null,
      },
    });
  };

  return (
    <section className="dashboard-page">
      <div className="dashboard-shell">
        <header className="dashboard-header">
          <div>
            <p className="dashboard-greeting">{welcomeText}</p>
            <h1 className="dashboard-title">CineChat RAG Web</h1>
            <p className="dashboard-subtitle">
              Web chat ini terhubung ke satu endpoint AI melalui Node-RED untuk percakapan seputar film.
            </p>
          </div>
          <Button
            onClick={() => startChat(CHAT_PROMPT)}
            className="rounded-full bg-sky-500 px-6 text-white hover:bg-sky-600"
          >
            Mulai Chat
          </Button>
        </header>
        
        <div className="prompt-grid">
          <article className="prompt-card">
            <div className="prompt-card-head">
              <div className="prompt-icon-wrap">
                <Clapperboard className="h-5 w-5" />
              </div>
              <h3>AI Chat Film</h3>
            </div>
            <p>
              Tanyakan rekomendasi film, sinopsis, trivia, atau diskusi seputar dunia perfilman dalam satu alur chat.
            </p>
            <Button
              variant="outline"
              onClick={() => startChat(CHAT_PROMPT)}
              className="mt-4 w-full rounded-xl border-sky-200 text-sky-700 hover:bg-sky-50"
            >
              Gunakan Chat
            </Button>
          </article>
        </div>
      </div>
    </section>
  );
}
