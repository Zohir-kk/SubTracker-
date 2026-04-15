// src/App.jsx
// ─────────────────────────────────────────────────────────────
// Root component. Now just a shell — layout + providers.
// All dashboard content lives in src/pages/Dashboard.jsx.
//
// To add new pages later:
//   import { Budget } from "./pages/Budget"
//   import { Settings } from "./pages/Settings"
//   and render them based on active route or sidebar state
// ─────────────────────────────────────────────────────────────

import { useState } from "react";
import { StoreProvider } from "./store/useStore";
import { AppHeader } from "./components/layout/AppHeader";
import { AppSidebar } from "./components/layout/AppSidebar";
import { Dashboard } from "./pages/dashboard";
import { Parametres } from "./pages/Parametres";

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState("dashboard");

  return (
    <StoreProvider>
      <div
        style={{ display: "flex", minHeight: "100vh", background: "var(--bg)" }}
      >
        <AppSidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          currentPage={currentPage}
          onNavigate={setCurrentPage}
        />

        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            minWidth: 0,
          }}
        >
          <AppHeader onMenuClick={() => setSidebarOpen((v) => !v)} />
          {currentPage === "settings" ? <Parametres /> : <Dashboard />}
        </div>
      </div>
    </StoreProvider>
  );
}
