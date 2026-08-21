import { useState } from "react";
import { StoreProvider, useStore } from "./store/useStore";
import { AppHeader } from "./components/layout/AppHeader";
import { AppSidebar } from "./components/layout/AppSidebar";
import { Dashboard } from "./pages/dashboard";
import { Parametres } from "./pages/Parametres";
import { AskSubDz } from "./components/ai/AskSubDz";
import { AuthScreen } from "./components/auth/AuthScreen";

function AppContent() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState("dashboard");
  const { user, authLoading } = useStore();

  if (authLoading) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return <AuthScreen />;
  }

  return (
    <>
      <div className="flex min-h-screen bg-bg">
        <AppSidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          currentPage={currentPage}
          onNavigate={setCurrentPage}
        />
        <div className="flex flex-col flex-1 min-w-0">
          <AppHeader onMenuClick={() => setSidebarOpen((v) => !v)} />
          {currentPage === "settings" ? <Parametres /> : <Dashboard />}
        </div>
      </div>
      <AskSubDz />
    </>
  );
}

export default function App() {
  return (
    <StoreProvider>
      <AppContent />
    </StoreProvider>
  );
}
