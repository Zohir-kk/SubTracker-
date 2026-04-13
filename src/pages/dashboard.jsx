// src/pages/Dashboard.jsx
// ─────────────────────────────────────────────────────────────
// The main dashboard page. Previously this JSX lived in App.jsx.
// Moving it here keeps App.jsx clean and makes it easy to add
// new pages (Budget, Settings, etc.) later.
//
// To add a new page:
//   1. Create src/pages/NewPage.jsx
//   2. Import it in App.jsx
//   3. Render it conditionally based on a route or active state
// ─────────────────────────────────────────────────────────────

import { KPIRow } from "../components/kpi/KPIRow";
import { SubscriptionPanel } from "../components/subs/SubscriptionPanel";
import { TrendChart } from "../components/charts/TrendCharts";
import { CategoryBreakdown } from "../components/charts/CategoryBreakdown";
import { UpcomingRenewals } from "../components/upcoming/UpcomingRenewals";
import { BudgetPanel } from "../components/budget/BudgetPanel";
import { InsightCard } from "../components/insight/InsightCard";
import { useWideLayout } from "../hooks/useSubscriptions";

export function Dashboard() {
  // Controls whether CategoryBreakdown and UpcomingRenewals
  // sit side by side or stack vertically on smaller screens
  const isWide = useWideLayout(768);

  return (
    <div style={{ padding: isWide ? "16px" : "10px", overflowY: "auto" }}>
      {/* ── KPI summary cards ── */}
      <section id="dashboard">
        <KPIRow />
      </section>

      {/* ── Subscription grid with filter tabs ── */}
      <section id="abonnements">
        <SubscriptionPanel />
      </section>

      {/* ── Category breakdown + Upcoming renewals side by side ── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: isWide ? "1fr 1fr" : "1fr",
          gap: "16px",
          marginBottom: "16px",
        }}
      >
        <CategoryBreakdown />

        {/* Upcoming renewals + insight card stacked in right column */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
            <UpcomingRenewals />
          </div>
          <InsightCard />
        </div>
      </div>

      {/* ── Spending trend chart ── */}
      <section id="tendances">
        <TrendChart />
      </section>

      {/* ── Budget bars + financial summary ── */}
      <section id="budget">
        <BudgetPanel />
      </section>
    </div>
  );
}
