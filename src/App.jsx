// src/App.jsx
import { AppHeader } from "./components/layout/AppHeader";
import { KPIRow } from "./components/kpi/KPIRow";
import { SubscriptionPanel } from "./components/subs/SubscriptionPanel";
import { TrendChart } from "./components/charts/TrendCharts";
import { CategoryBreakdown } from "./components/charts/CategoryBreakdown";
import { UpcomingRenewals } from "./components/upcoming/UpcomingRenewals";
import { BudgetPanel } from "./components/budget/BudgetPanel";
import { AppSidebar } from "./components/layout/AppSidebar";
import { useWideLayout } from "./hooks/useSubscriptions";

export default function App() {
  //hook must be inside the component function, not outside
  const isWide = useWideLayout(768);

  return (
    <div
      style={{ display: "flex", minHeight: "100vh", background: "var(--bg)" }}
    >
      {/* Persistent left navigation */}
      <AppSidebar />

      {/* Main content — flex:1 fills remaining space, minWidth:0 fixes Recharts overflow */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          minWidth: 0,
        }}
      >
        <AppHeader userInitials="ZK" />

        <div style={{ padding: "16px", overflowY: "auto" }}>
          <section id="dashboard">
            <KPIRow />
          </section>

          <section id="abonnements">
            <SubscriptionPanel />
          </section>

          {/* Category Breakdown + Upcoming Renewals side by side */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: isWide ? "1fr 1fr" : "1fr",
              gap: "16px",
              marginBottom: "16px",
            }}
          >
            <CategoryBreakdown />
            <UpcomingRenewals />
          </div>

          <section id="tendances">
            <TrendChart />
          </section>

          <section id="budget">
            <BudgetPanel />
          </section>
        </div>
      </div>
    </div>
  );
}
