import { KPIRow } from "../components/kpi/KPIRow";
import { SubscriptionPanel } from "../components/subs/SubscriptionPanel";
import { TrendChart } from "../components/charts/TrendCharts";
import { CategoryBreakdown } from "../components/charts/CategoryBreakdown";
import { UpcomingRenewals } from "../components/upcoming/UpcomingRenewals";
import { BudgetPanel } from "../components/budget/BudgetPanel";
import { InsightCard } from "../components/insight/InsightCard";

export function Dashboard() {
  return (
    <div className="p-2.5 md:p-4 overflow-y-auto">
      <section id="dashboard">
        <KPIRow />
      </section>

      <section id="abonnements">
        <SubscriptionPanel />
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <CategoryBreakdown />
        <div className="flex flex-col gap-4">
          <div className="flex-1 flex flex-col">
            <UpcomingRenewals />
          </div>
          <InsightCard />
        </div>
      </div>

      <section id="tendances">
        <TrendChart />
      </section>

      <section id="budget">
        <BudgetPanel />
      </section>
    </div>
  );
}
