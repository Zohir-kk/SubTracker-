import { useState } from "react";
import { StoreProvider } from "./store/useStore";
import { AppHeader } from "./components/layout/AppHeader";
import { AppSidebar } from "./components/layout/AppSidebar";
import { Dashboard } from "./pages/dashboard";
import { Parametres } from "./pages/Parametres";
import { AskSubDz } from "./components/ai/AskSubDz";

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState("dashboard");

  return (
    <StoreProvider>
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
    </StoreProvider>
  );
}
