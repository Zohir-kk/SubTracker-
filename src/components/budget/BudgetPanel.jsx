// src/components/budget/BudgetPanel.jsx
// ─────────────────────────────────────────────────────────────
// Shows how much of your monthly budget you've used per category.
// Budget limits are defined in src/data/subscriptions.js
//
// Contains two sections side by side:
//   Left  — BudgetBars: one bar per category with used/limit
//   Right — FinancialSummary: 4 mini stat cards
//
// A bar turns red when usage exceeds 90% of the limit.
// ─────────────────────────────────────────────────────────────

import { useEffect, useState } from "react";
import { subscriptions, budgetLimits } from "../../data/subscriptions";

// ── HELPERS ───────────────────────────────────────────────────

// Formats a number as DZD — e.g. 5000 → "5 000"
function formatDZD(amount) {
  return new Intl.NumberFormat("fr-DZ").format(amount);
}

// Calculates how much is being spent per category.
// Only counts active + trial (paused don't charge you).
function computeSpendPerCategory() {
  const totals = {};
  subscriptions
    .filter((s) => s.status === "active" || s.status === "trial")
    .forEach((s) => {
      totals[s.category] = (totals[s.category] || 0) + s.amount;
    });
  return totals;
}

// Category display config — matches the rest of the dashboard
const CATEGORIES = [
  { key: "internet", label: "Internet", icon: "📡", color: "var(--teal)" },
  { key: "streaming", label: "Streaming", icon: "🎬", color: "var(--orange)" },
  { key: "vod", label: "VOD Arabe", icon: "🎭", color: "var(--gold)" },
  { key: "transport", label: "Transport", icon: "🚇", color: "var(--red)" },
];

// ── BUDGET BAR ────────────────────────────────────────────────
// One row showing how much of a category's budget is used.
// Bar turns red if usage is above 90% of the limit.
function BudgetBar({ category, used, limit, animate }) {
  const percent = limit > 0 ? Math.min((used / limit) * 100, 100) : 0;
  const isOverspend = percent >= 90; // threshold for red warning state

  // Bar color: red if overspending, category color if normal
  const barColor = isOverspend ? "var(--red)" : category.color;

  return (
    <div style={{ marginBottom: "18px" }}>
      {/* Top row: icon + label on left, used/limit on right */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "7px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          {/* Small category icon */}
          <div
            style={{
              width: "26px",
              height: "26px",
              borderRadius: "6px",
              background: `${category.color}18`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "12px",
            }}
          >
            {category.icon}
          </div>
          <span
            style={{
              fontFamily: "'DM Mono', monospace",
              fontSize: "10px",
              color: "var(--text)",
            }}
          >
            {category.label}
          </span>
        </div>

        {/* Used amount / limit on the right */}
        <div
          style={{
            fontFamily: "'DM Mono', monospace",
            fontSize: "9px",
            color: isOverspend ? "var(--red)" : "var(--text-faint)",
          }}
        >
          {formatDZD(used)}{" "}
          <span style={{ color: "var(--text-faint)" }}>
            / {formatDZD(limit)}
          </span>
        </div>
      </div>

      {/* Bar track */}
      <div
        style={{
          height: "4px",
          background: "var(--border-2)",
          borderRadius: "2px",
          overflow: "hidden",
        }}
      >
        {/* Filled bar — animates from 0 to real percent on mount */}
        <div
          style={{
            height: "100%",
            width: animate ? `${percent}%` : "0%",
            background: barColor,
            borderRadius: "2px",
            transition: "width 0.9s cubic-bezier(0.23, 1, 0.32, 1)",
          }}
        />
      </div>

      {/* Overspend warning — only shown when above 90% */}
      {isOverspend && (
        <div
          style={{
            fontFamily: "'DM Mono', monospace",
            fontSize: "8px",
            color: "var(--red)",
            marginTop: "4px",
            letterSpacing: "0.5px",
          }}
        >
          ● Budget dépassé
        </div>
      )}
    </div>
  );
}

// ── STAT CARD ─────────────────────────────────────────────────
// One of the 4 mini summary cards on the right side.
function StatCard({ label, value, sub, color }) {
  return (
    <div
      style={{
        background: "var(--bg-3)",
        border: "1px solid var(--border-2)",
        borderRadius: "10px",
        padding: "14px",
      }}
    >
      <div
        style={{
          fontFamily: "'DM Mono', monospace",
          fontSize: "8px",
          letterSpacing: "1.5px",
          textTransform: "uppercase",
          color: "var(--text-faint)",
          marginBottom: "8px",
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: "22px",
          fontWeight: 700,
          color: color || "var(--text)",
          lineHeight: 1,
          marginBottom: "2px",
        }}
      >
        {value}
      </div>
      {sub && (
        <div
          style={{
            fontFamily: "'DM Mono', monospace",
            fontSize: "8px",
            color: "var(--text-faint)",
          }}
        >
          {sub}
        </div>
      )}
    </div>
  );
}

// ── BUDGET PANEL (MAIN EXPORT) ────────────────────────────────
export function BudgetPanel() {
  const spent = computeSpendPerCategory();

  // Total spent across all categories
  const totalSpent = Object.values(spent).reduce((a, b) => a + b, 0);

  // Total budget across all categories
  const totalBudget = Object.values(budgetLimits).reduce((a, b) => a + b, 0);

  // Money saved = paused subscriptions not being charged
  const savedAmount = subscriptions
    .filter((s) => s.status === "paused")
    .reduce((sum, s) => sum + s.amount, 0);

  // Usage rate as a percentage
  const usageRate =
    totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0;

  // animate controls bar animation on mount — same pattern as CategoryBreakdown
  const [animate, setAnimate] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setAnimate(true), 150);
    return () => clearTimeout(timer);
  }, []);

  // Responsive layout: side-by-side on desktop, stacked on mobile
  const [isWide, setIsWide] = useState(true);
  useEffect(() => {
    function update() {
      setIsWide(window.innerWidth >= 768);
    }
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  return (
    <div
      style={{
        background: "var(--bg-2)",
        border: "1px solid var(--border-2)",
        borderRadius: "14px",
        padding: "18px",
        marginBottom: "16px",
      }}
    >
      {/* ── Panel header ── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          marginBottom: "20px",
        }}
      >
        <div
          style={{
            width: "6px",
            height: "6px",
            borderRadius: "50%",
            background: "var(--gold)",
            flexShrink: 0,
          }}
        />
        <div
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: "16px",
            fontWeight: 600,
            color: "var(--text)",
          }}
        >
          Budget mensuel
        </div>
        {/* Overall usage rate shown on the right */}
        <div
          style={{
            marginLeft: "auto",
            fontFamily: "'DM Mono', monospace",
            fontSize: "9px",
            color: usageRate >= 90 ? "var(--red)" : "var(--text-faint)",
            letterSpacing: "1px",
          }}
        >
          {usageRate}% utilisé
        </div>
      </div>

      {/* ── Two-column layout ── */}
      <div
        style={{
          display: "grid",
          // On wide screens: budget bars take more space, stat cards fixed width
          // On narrow screens: stack vertically
          gridTemplateColumns: isWide ? "1fr 1fr" : "1fr",
          gap: "24px",
        }}
      >
        {/* ── Left: budget bars per category ── */}
        <div>
          {CATEGORIES.map((cat) => (
            <BudgetBar
              key={cat.key}
              category={cat}
              used={spent[cat.key] || 0}
              limit={budgetLimits[cat.key] || 0}
              animate={animate}
            />
          ))}
        </div>

        {/* ── Right: 4 summary stat cards in a 2×2 grid ── */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "10px",
            alignContent: "start", // cards don't stretch to fill height
          }}
        >
          <StatCard
            label="Total dépensé"
            value={formatDZD(totalSpent)}
            sub="DZD ce mois"
            color="var(--text)"
          />
          <StatCard
            label="Budget total"
            value={formatDZD(totalBudget)}
            sub="DZD alloué"
            color="var(--text)"
          />
          <StatCard
            label="Économies"
            value={formatDZD(savedAmount)}
            sub="DZD en pause"
            color="var(--green)"
          />
          <StatCard
            label="Taux utilisation"
            value={`${usageRate}%`}
            sub={usageRate >= 90 ? "⚠ Limite proche" : "dans le budget"}
            color={usageRate >= 90 ? "var(--red)" : "var(--text)"}
          />
        </div>
      </div>
    </div>
  );
}
