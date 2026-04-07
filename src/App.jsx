// src/App.jsx
// ─────────────────────────────────────────────────────────────
// Root component. All dashboard sections sit inside a single
// padded wrapper so spacing is consistent across the whole page.
// To add a new section, just drop it inside the content div.
// ─────────────────────────────────────────────────────────────

import { AppHeader } from "./components/layout/AppHeader";
import { KPIRow } from "./components/kpi/KPIRow";
import { SubscriptionPanel } from "./components/subs/SubscriptionPanel";
import { TrendChart } from "./components/charts/TrendCharts";
import { CategoryBreakdown } from "./components/charts/CategoryBreakdown";
import { UpcomingRenewals } from "./components/upcoming/UpcomingRenewals";
import { BudgetPanel } from "./components/budget/BudgetPanel";
export default function App() {
  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      {/* Sticky top navigation bar */}
      <AppHeader userInitials="AK" />

      {/* Main content — 16px padding on both sides for all sections */}
      <div style={{ padding: "16px" }}>
        <KPIRow />
        <SubscriptionPanel />
        <TrendChart />
        <CategoryBreakdown />
        <UpcomingRenewals />
        <BudgetPanel />
      </div>
    </div>
  );
}
