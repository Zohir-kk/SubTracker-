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

import { AppHeader } from "./components/layout/AppHeader";
import { AppSidebar } from "./components/layout/AppSidebar";
import { Dashboard } from "./pages/dashboard";

export default function App() {
  return (
    <div
      style={{ display: "flex", minHeight: "100vh", background: "var(--bg)" }}
    >
      {/* Persistent left navigation */}
      <AppSidebar />

      {/* Main content area */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          minWidth: 0,
        }}
      >
        {/* Sticky top bar */}
        <AppHeader userInitials="ZK" />

        {/* Active page — swap Dashboard for other pages here */}
        <Dashboard />
      </div>
    </div>
  );
}
