import { Sidebar } from "./Sidebar";

export function AppLayout({
  children,
  isSidebarOpen,
  toggleSidebar,
  onNewChat,
}) {
  return (
    <div className="flex h-screen w-full bg-background text-foreground overflow-hidden">
      <Sidebar
        isOpen={isSidebarOpen}
        toggleSidebar={toggleSidebar}
        onNewChat={onNewChat}
      />
      <main className="flex-1 flex flex-col h-full overflow-hidden transition-all duration-300">
        {children}
      </main>
    </div>
  );
}
