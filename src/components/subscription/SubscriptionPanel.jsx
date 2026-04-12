// src/components/kpi/KPIRow.jsx
import {
  useKPI,
  useMediaGrid,
  formatDZD,
} from "../../hooks/useSubscriptions.js";
import { subscriptions } from "../../data/subscriptions.js";

// BUG FIXED: removed local daysUntil, formatDZD, computeKPIs — now from hooks
// BUG FIXED: useMediaGrid(4) — was useMediaGrid(undefined, 4) which is wrong

function KPICard({ label, value, sub, accent, delta, deltaUp }) {
  return (
    <div
      style={{
        background: "var(--bg-2)",
        border: "1px solid var(--border-2)",
        borderRadius: "12px",
        padding: "18px 20px 14px",
        position: "relative",
        overflow: "hidden",
        cursor: "default",
        transition: "border-color 0.2s ease, transform 0.2s ease",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = "var(--border)";
        e.currentTarget.style.transform = "translateY(-2px)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = "var(--border-2)";
        e.currentTarget.style.transform = "translateY(0)";
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 0,
          right: 0,
          width: "80px",
          height: "80px",
          borderRadius: "0 12px 0 80px",
          background: accent,
          opacity: 0.08,
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          fontFamily: "'IBM Plex Mono', monospace",
          fontSize: "9px",
          letterSpacing: "2px",
          textTransform: "uppercase",
          color: "var(--text-faint)",
          marginBottom: "10px",
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: "30px",
          fontWeight: 700,
          color: "var(--text)",
          lineHeight: 1,
          marginBottom: "4px",
        }}
      >
        {value}
      </div>
      {sub && (
        <div
          style={{
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: "9px",
            color: "var(--text-faint)",
            marginBottom: "8px",
          }}
        >
          {sub}
        </div>
      )}
      {delta && (
        <div
          style={{
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: "10px",
            color: deltaUp ? "var(--red)" : "var(--green)",
            marginTop: "6px",
          }}
        >
          {delta}
        </div>
      )}
    </div>
  );
}

export function KPIRow() {
  const { total, activeCount, savings, next } = useKPI();
  const cols = useMediaGrid(4); // BUG FIXED: was useMediaGrid(undefined, 4)

  const cards = [
    {
      label: "Total mensuel",
      value: formatDZD(total),
      sub: "DZD / mois",
      accent: "var(--gold)",
      delta: "▲ abonnements actifs + essai",
      deltaUp: true,
    },
    {
      label: "Abonnements actifs",
      value: activeCount,
      sub: `sur ${subscriptions.length} au total`, // BUG FIXED: subscriptions now imported
      accent: "var(--teal)",
      delta: "— stable ce mois",
      deltaUp: false,
    },
    {
      label: "Économies possibles",
      value: savings > 0 ? formatDZD(savings) : "—",
      sub: savings > 0 ? "DZD en abonnements pausés" : "aucun abonnement pausé",
      accent: "var(--green)",
      delta: savings > 0 ? "▼ abonnements en pause" : null,
      deltaUp: false,
    },
    {
      label: "Prochain renouvellement",
      value: next
        ? next.days === 0
          ? "Aujourd'hui"
          : next.days === 1
            ? "Demain"
            : `Dans ${next.days}j`
        : "—",
      sub: next ? `${next.name} — ${formatDZD(next.amount)} DZD` : null,
      accent: "var(--red)",
      delta: next && next.days <= 3 ? "● Renouvellement imminent" : null,
      deltaUp: true,
    },
  ];

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
        gap: "14px",
        padding: "0 0 16px",
        margin: "0 0 20px",
      }}
    >
      {cards.map((card) => (
        <KPICard key={card.label} {...card} />
      ))}
    </div>
  );
}
