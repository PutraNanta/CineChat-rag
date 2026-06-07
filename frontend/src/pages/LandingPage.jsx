import { useNavigate } from "react-router-dom";
import {
  Clapperboard,
  CircleCheckBig,
  Film,
  Bot,
  LogIn,
  Database,
  FolderOpen,
  MessageCircleMore,
  MessageCircle,
  MoreVertical,
  LayoutGrid,
  Send,
  Star,
  ShieldCheck,
  Zap,
  UserRound,
  Terminal,
} from "lucide-react";
import { useAuthContext } from "@/context/AuthContext";

const featureItems = [
  {
    icon: Star,
    title: "Rekomendasi\nPersonal",
  },
  {
    icon: Zap,
    title: "Jawaban Cepat\ndan Akurat",
  },
  {
    icon: LayoutGrid,
    title: "Data Film\nLengkap",
  },
];

const movieItems = [
  {
    number: "1.",
    title: "Interstellar (2014)",
    description: "Perpaduan epik antara perjalanan emosional dan sains.",
  },
  {
    number: "2.",
    title: "Inception (2010)",
    description: "Thriller mind-bending tentang mimpi di dalam mimpi.",
  },
  {
    number: "3.",
    title: "Blade Runner 2049 (2017)",
    description: "Visual memukau dengan cerita yang mendalam.",
  },
];

const promptCards = [
  {
    icon: UserRound,
    title: "Pencarian Data Film",
    description: "Akses informasi lengkap mulai dari data film, TV series, aktor, hingga genre secara realtime.",
  },
  {
    icon: Database,
    title: "Manajemen Data CRUD",
    description: "Fitur manipulasi database untuk menambah, memperbarui, atau menghapus data film langsung dari chat.",
  },
  {
    icon: FolderOpen,
    title: "Multi-Mode Selector",
    description: "Gunakan menu dropdown untuk memilih otak chatbot: mode RAG AI, SQL Normalisasi, atau SQL Denormalisasi.",
  },
  {
    icon: ShieldCheck,
    title: "Validasi & Arsitektur",
    description: "Sistem RAG memastikan jawaban AI tetap akurat sesuai basis data tanpa ada halusinasi informasi.",
  },
];

export function LandingPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthContext();

  const goToChat = () => {
    navigate("/chat");
  };

  const goToAuth = () => {
    navigate("/auth");
  };

  return (
    <section className="cinechat-landing">
      <div className="cinechat-landing__ambient cinechat-landing__ambient--left" />
      <div className="cinechat-landing__ambient cinechat-landing__ambient--right" />
      <div className="cinechat-landing__ambient cinechat-landing__ambient--bottom" />

      <div className="cinechat-landing__film cinechat-landing__film--left" aria-hidden="true">
        <Film className="h-full w-full" />
      </div>
      <div className="cinechat-landing__film cinechat-landing__film--right" aria-hidden="true">
        <Film className="h-full w-full" />
      </div>

      <div className="cinechat-landing__container">
        <header className="cinechat-landing__header">
          <button className="cinechat-brand" type="button" onClick={goToChat}>
            <span className="cinechat-brand__mark">
              <Clapperboard className="h-5 w-5" />
            </span>
            <span className="cinechat-brand__text">CineChat</span>
          </button>

          <div className="cinechat-header-actions">
            <button
              className="cinechat-button cinechat-button--ghost"
              type="button"
              onClick={isAuthenticated ? goToChat : goToAuth}
            >
              <LogIn className="h-4 w-4" />
              <span>Masuk</span>
            </button>
            <button className="cinechat-button cinechat-button--primary" type="button" onClick={goToChat}>
              <MessageCircle className="h-4 w-4" />
              <span>Mulai Chat</span>
            </button>
          </div>
        </header>

        <main className="cinechat-hero">
          <div className="cinechat-hero__content">
            <div className="cinechat-pill">
              <Star className="h-4 w-4" />
              <span>Chatbot untuk Pecinta Film</span>
            </div>

            <h1 className="cinechat-hero__title">
              Temukan rekomendasi
              <br />
              film terbaik lewat chat
            </h1>

            <div className="cinechat-hero__rule" />

            <p className="cinechat-hero__description">
              Dapatkan rekomendasi film dan serial yang sesuai selera, jelajahi sinopsis,
              trivia menarik, dan diskusi seru seputar dunia perfilman - semua lewat chat.
            </p>

            <div className="cinechat-hero__actions">
              <button className="cinechat-button cinechat-button--cta" type="button" onClick={goToChat}>
                <MessageCircleMore className="h-5 w-5" />
                <span>Mulai Chat</span>
              </button>
            </div>

            <section className="cinechat-features" aria-label="Keunggulan CineChat">
              {featureItems.map((feature) => {
                const Icon = feature.icon;

                return (
                  <article className="cinechat-feature" key={feature.title}>
                    <div className="cinechat-feature__icon">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="cinechat-feature__body">
                      <h3>{feature.title}</h3>
                    </div>
                  </article>
                );
              })}
            </section>
          </div>

          <aside className="cinechat-preview" aria-label="Pratinjau percakapan CineChat">
            <div className="cinechat-preview__shell">
              <div className="cinechat-preview__header">
                <div className="cinechat-preview__profile">
                  <span className="cinechat-preview__logo">
                    <Clapperboard className="h-5 w-5" />
                  </span>
                  <div>
                    <h2>CineChat</h2>
                    <p>
                      <CircleCheckBig className="h-3.5 w-3.5" />
                      <span>Online</span>
                    </p>
                  </div>
                </div>
                <button className="cinechat-icon-button" type="button" aria-label="Menu">
                  <MoreVertical className="h-5 w-5" />
                </button>
              </div>

              <div className="cinechat-preview__messages">
                <div className="cinechat-preview__message cinechat-preview__message--user">
                  <p>Rekomendasikan film sci-fi terbaik yang wajib ditonton!</p>
                  <span>10:30</span>
                </div>

                <div className="cinechat-preview__message cinechat-preview__message--assistant">
                  <div className="cinechat-preview__assistant-badge">
                    <Bot className="h-4 w-4" />
                  </div>
                  <div className="cinechat-preview__assistant-content">
                    <p>Berikut beberapa rekomendasi film sci-fi terbaik menurut saya:</p>

                    <div className="cinechat-preview__list">
                      {movieItems.map((movie) => (
                        <div className="cinechat-preview__list-item" key={movie.title}>
                          <span className="cinechat-preview__list-number">{movie.number}</span>
                          <div className="cinechat-preview__list-copy">
                            <strong>{movie.title}</strong>
                            <span>{movie.description}</span>
                          </div>
                        </div>
                      ))}
                    </div>

                    <p>
                      Mau rekomendasi yang lebih spesifik? Beri tahu saya preferensi kamu, ya!
                    </p>
                    <span className="cinechat-preview__timestamp">10:31</span>
                  </div>
                </div>
              </div>

              <div className="cinechat-preview__composer">
                <div className="cinechat-preview__input">
                  <span>Ketik pesan Anda...</span>
                </div>
                <button className="cinechat-preview__send" type="button" aria-label="Kirim pesan">
                  <Send className="h-5 w-5" />
                </button>
              </div>
            </div>
          </aside>
        </main>

        <section className="prompt-grid" aria-label="Panduan mode CineChat">
          {promptCards.map((card) => {
            const Icon = card.icon;

            return (
              <article className="prompt-card" key={card.title}>
                <div className="prompt-card-head">
                  <div className="prompt-icon-wrap">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="prompt-card-copy">
                    <h3>{card.title}</h3>
                    <p>{card.description}</p>
                  </div>
                </div>
              </article>
            );
          })}
        </section>
        <footer className="cinechat-footer">
          <div className="cinechat-footer__brand">
            <span className="cinechat-brand__mark cinechat-brand__mark--footer">
              <Clapperboard className="h-4 w-4" />
            </span>
            <span className="cinechat-brand__text">CineChat</span>
          </div>
          <p>Teman terbaik kamu untuk menemukan, menjelajahi, dan membahas film.</p>
        </footer>
      </div>
    </section>
  );
}
