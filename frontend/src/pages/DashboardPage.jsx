import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Database,
  Table2,
  Warehouse,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const NODE_RED_ENDPOINTS = [
  {
    id: "rag",
    title: "RAG Database",
    description: "Tanya jawab berbasis retrieval dari konteks dokumen.",
    icon: Database,
    prompt:
      "Gunakan mode RAG Database untuk menjawab berdasarkan konteks yang tersedia.",
  },
  {
    id: "oltp",
    title: "SQL Normalisasi (OLTP)",
    description: "Mode query untuk struktur data transaksional.",
    icon: Table2,
    prompt:
      "Gunakan mode SQL normalisasi (OLTP) untuk analisis data operasional.",
  },
  {
    id: "dwh",
    title: "SQL Denormalisasi (DWH)",
    description: "Mode query untuk data warehouse dan agregasi.",
    icon: Warehouse,
    prompt:
      "Gunakan mode SQL denormalisasi (DWH) untuk kebutuhan analitik dan reporting.",
  },
];

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
            <h1 className="dashboard-title">Node-RED Chat Gateway</h1>
            <p className="dashboard-subtitle">
              Web chat ini terhubung ke HTTP Request Node-RED. Pilih mode endpoint sesuai kebutuhan query kamu.
            </p>
          </div>
          <Button
            onClick={() => startChat("")}
            className="rounded-full bg-sky-500 px-6 text-white hover:bg-sky-600"
          >
            Buka Chat
          </Button>
        </header>
        
        <div className="prompt-grid">
          {NODE_RED_ENDPOINTS.map((item) => {
            const Icon = item.icon;
            return (
              <article key={item.id} className="prompt-card">
                <div className="prompt-card-head">
                  <div className="prompt-icon-wrap">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3>{item.title}</h3>
                </div>
                <p>{item.description}</p>
                <Button
                  variant="outline"
                  onClick={() => startChat(item.prompt)}
                  className="mt-4 w-full rounded-xl border-sky-200 text-sky-700 hover:bg-sky-50"
                >
                  Gunakan Mode Ini
                </Button>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
