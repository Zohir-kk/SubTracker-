// src/components/budget/BudgetPanel.jsx
import { useEffect, useState } from "react";
import { subscriptions, budgetLimits } from "../../data/subscriptions.js";
import { formatDZD, useWideLayout } from "../../hooks/useSubscriptions.js";
// BUG FIXED: removed local formatDZD, replaced local isWide useEffect with useWideLayout hook

const CATEGORIES = [
  { key: "internet", label: "Internet", icon: "📡", color: "var(--teal)" },
  { key: "streaming", label: "Streaming", icon: "🎬", color: "var(--orange)" },
  { key: "vod", label: "VOD Arabe", icon: "🎭", color: "var(--gold)" },
  { key: "transport", label: "Transport", icon: "🚇", color: "var(--red)" },
];

function computeSpendPerCategory() {
  const totals = {};
  subscriptions
    .filter((s) => s.status === "active" || s.status === "trial")
    .forEach((s) => {
      totals[s.category] = (totals[s.category] || 0) + s.amount;
    });
  return totals;
}

function BudgetBar({ category, used, limit, animate }) {
  const percent = limit > 0 ? Math.min((used / limit) * 100, 100) : 0;
  const isOverspend = percent >= 90;
  const barColor = isOverspend ? "var(--red)" : category.color;

  return (
    <div style={{ marginBottom: "18px" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "7px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
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
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: "10px",
              color: "var(--text)",
            }}
          >
            {category.label}
          </span>
        </div>
        <div
          style={{
            fontFamily: "'IBM Plex Mono', monospace",
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
      <div
        style={{
          height: "4px",
          background: "var(--border-2)",
          borderRadius: "2px",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: "100%",
            width: animate ? `${percent}%` : "0%",
            background: barColor,
            borderRadius: "2px",
            transition: "width 0.9s cubic-bezier(0.23,1,0.32,1)",
          }}
        />
      </div>
      {isOverspend && (
        <div
          style={{
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: "8px",
            color: "var(--red)",
            marginTop: "4px",
          }}
        >
          ● Budget dépassé
        </div>
      )}
    </div>
  );
}

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
          fontFamily: "'IBM Plex Mono', monospace",
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
          fontFamily: "'Playfair Display', serif",
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
            fontFamily: "'IBM Plex Mono', monospace",
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

export function BudgetPanel() {
  const spent = computeSpendPerCategory();
  const totalSpent = Object.values(spent).reduce((a, b) => a + b, 0);
  const totalBudget = Object.values(budgetLimits).reduce((a, b) => a + b, 0);
  const savedAmount = subscriptions
    .filter((s) => s.status === "paused")
    .reduce((sum, s) => sum + s.amount, 0);
  const usageRate =
    totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0;

  const [animate, setAnimate] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setAnimate(true), 150);
    return () => clearTimeout(timer);
  }, []);

  // BUG FIXED: replaced manual useEffect with useWideLayout hook
  const isWide = useWideLayout(768);

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
            fontFamily: "'Playfair Display', serif",
            fontSize: "16px",
            fontWeight: 600,
            color: "var(--text)",
          }}
        >
          Budget mensuel
        </div>
        <div
          style={{
            marginLeft: "auto",
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: "9px",
            color: usageRate >= 90 ? "var(--red)" : "var(--text-faint)",
            letterSpacing: "1px",
          }}
        >
          {usageRate}% utilisé
        </div>
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: isWide ? "1fr 1fr" : "1fr",
          gap: "24px",
        }}
      >
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
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "10px",
            alignContent: "start",
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
