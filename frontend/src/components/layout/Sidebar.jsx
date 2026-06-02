import { useState, useEffect } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import {
  Plus, MessageSquare, Menu, LogOut, LogIn, UserCircle2, Lock, Trash2, Home,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuthContext } from "@/context/AuthContext"
import { useNotify } from "@/context/NotifyContext"
import { useLoading } from "@/context/LoadingContext"
import { apiClient } from "@/apis/client.js"

export function Sidebar({ isOpen, toggleSidebar, onNewChat }) {
  const { isAuthenticated, logout } = useAuthContext()
  const notify = useNotify()
  const { withLoading } = useLoading()
  const navigate = useNavigate()
  const location = useLocation()
  const [sessions, setSessions] = useState([])

  useEffect(() => {
     if (isAuthenticated) {
        withLoading(async () => {
          const res = await apiClient.get('/chat/sessions')
          setSessions(res.data)
        }).catch((err) => {
          console.error("Failed to fetch sessions", err)
          notify.error("Gagal Memuat Sesi", "Daftar riwayat percakapan tidak berhasil diambil.")
        })
     } else {
        setSessions([])
     }
  }, [isAuthenticated, location.pathname, notify, withLoading])

  const handleDeleteSession = async (e, id) => {
    e.stopPropagation()
    const confirmed = await notify.confirm({
      title: "Hapus Percakapan",
      message: "Percakapan yang dihapus tidak bisa dikembalikan. Lanjutkan?",
      confirmText: "Ya, Hapus",
      cancelText: "Batal",
    })

    if (!confirmed) return

    try {
      await withLoading(async () => {
        await apiClient.delete(`/chat/sessions/${id}`)
      })
      setSessions(sessions.filter(s => s.id !== id))
      notify.success("Sesi Dihapus", "Percakapan berhasil dihapus.")
      if (location.pathname === `/chat/${id}`) {
        navigate("/chat")
      }
    } catch (error) {
      console.error("Failed to delete session", error)
      notify.error("Hapus Gagal", "Percakapan tidak berhasil dihapus.")
    }
  }

  // Read the stored user object to get the display name
  const storedUser = (() => {
    try {
      const raw = localStorage.getItem("user") || sessionStorage.getItem("user")
      return raw ? JSON.parse(raw) : null
    } catch {
      return null
    }
  })()

  const userName = storedUser?.name || storedUser?.username || storedUser?.email || "Pengguna"

  const handleLogoutConfirm = async () => {
    const confirmed = await notify.confirm({
      title: "Konfirmasi Keluar",
      message: "Apakah Anda yakin ingin keluar dari akun saat ini?",
      confirmText: "Ya, Keluar",
      cancelText: "Batal",
    })

    if (!confirmed) return

    logout()
    notify.info("Berhasil Keluar", "Anda telah keluar dari sesi saat ini.")
    navigate("/")
  }

  return (
    <>
      <aside
        className={`
          transition-all duration-300 ease-in-out
          ${isOpen ? "w-64 opacity-100" : "w-0 opacity-0 overflow-hidden"}
          border-r bg-muted/30 flex flex-col h-full shrink-0
        `}
      >
        <div className="w-64 border-r bg-muted/30 flex flex-col transition-all h-full shrink-0">

          <div className="p-3 flex items-center gap-1 border-b border-border/40">
            <button
              type="button"
              onClick={() => navigate("/")}
              className="flex flex-1 min-w-0 items-center gap-2.5 rounded-xl px-2 py-2 text-left transition-colors hover:bg-muted/80"
              title="Kembali ke Landing Page"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-sky-500/15 text-sky-600">
                <Home className="h-4 w-4" />
              </span>
              <span className="min-w-0">
                <span className="block truncate text-sm font-semibold text-foreground">
                  RAG Gateway
                </span>
                <span className="block text-[11px] text-muted-foreground">
                  Landing Page
                </span>
              </span>
            </button>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleSidebar}
              className="hidden md:flex shrink-0"
              title="Sembunyikan sidebar"
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>

          {/* ── New chat ── */}
          <div className="px-4 pb-4">
            <Button
              onClick={onNewChat}
              className="w-full justify-start rounded-full shadow-sm bg-background text-foreground border hover:bg-muted"
              variant="outline"
            >
              <Plus className="mr-2 h-4 w-4" />
              Chat Baru
            </Button>
          </div>

          {/* ── History section ── */}
          <div className="flex-1 overflow-y-auto scrollbar-hide px-2">
            <div className="text-xs font-medium text-muted-foreground mb-2 px-2 mt-4">
              Terkini
            </div>

            {isAuthenticated ? (
              /* ── Logged-in: show real history ── */
              <div className="space-y-1 mt-2">
                {sessions.length === 0 ? (
                   <div className="px-2 py-4 text-xs text-center text-muted-foreground">
                      Belum ada percakapan
                   </div>
                ) : (
                   sessions.map((session) => {
                      const isActive = location.pathname === `/chat/${session.id}`;
                       return (
                          <div key={session.id} className="relative group mb-1">
                             <Button
                               variant={isActive ? "secondary" : "ghost"}
                               className={`w-full justify-start font-normal text-sm px-3 text-left pr-8 ${isActive ? "bg-muted font-medium" : ""}`}
                               onClick={() => {
                                  if (!isActive) navigate(`/chat/${session.id}`);
                               }}
                             >
                               <MessageSquare className="mr-3 h-4 w-4 shrink-0 opacity-70" />
                               <span className="truncate">{session.title || "Percakapan Baru"}</span>
                             </Button>
                             <button
                               onClick={(e) => handleDeleteSession(e, session.id)}
                               className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                               title="Hapus percakapan"
                             >
                               <Trash2 className="h-4 w-4" />
                             </button>
                          </div>
                       );
                   })
                )}
              </div>
            ) : (
              /* ── Guest: locked history + info text ── */
              <div className="mx-1 space-y-3">
                {/* Locked visual hint */}
                <div className="flex items-center gap-2 rounded-lg px-2 py-2 text-sm text-muted-foreground opacity-50">
                  <Lock className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate">Riwayat Chat</span>
                </div>

                {/* Info message */}
                <div className="rounded-xl border border-blue-200/60 bg-blue-50/50 px-3 py-2.5 text-[12px] text-blue-600 leading-relaxed">
                  Silakan Masuk atau Daftar untuk menyimpan dan melihat riwayat percakapan Anda.
                </div>

                {/* Link to auth page */}
                {/* <Button
                  variant="outline"
                  size="sm"
                  className="w-full rounded-lg text-xs border-blue-200 text-blue-600 hover:bg-blue-50 hover:border-blue-300"
                  onClick={() => navigate("/auth")}
                >
                  <LogIn className="mr-1.5 h-3.5 w-3.5" />
                  Masuk / Daftar
                </Button> */}
              </div>
            )}
          </div>

          {/* ── Profile / Auth section (bottom) ── */}
          <div className="p-4 mt-auto border-t border-border/40">
            {isAuthenticated ? (
              /* Logged-in: user card + logout button */
              <div className="flex items-center gap-2">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 shrink-0">
                  <UserCircle2 className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{userName}</p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-destructive shrink-0"
                  onClick={handleLogoutConfirm}
                  title="Keluar"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              /* Guest: login button */
              <Button
                variant="outline"
                className="w-full justify-start rounded-lg border-gray-200 text-muted-foreground hover:text-foreground"
                onClick={() => navigate("/auth")}
              >
                <LogIn className="mr-2 h-4 w-4" />
                Masuk / Daftar
              </Button>
            )}
          </div>

        </div>
      </aside>

    </>
  )
}
