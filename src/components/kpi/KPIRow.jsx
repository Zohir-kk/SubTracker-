// src/components/kpi/KPIRow.jsx
// ─────────────────────────────────────────────────────────────
// This file renders the 4 summary cards at the top of the
// dashboard. Each card shows one key number calculated from
// your real subscription data in src/data/subscriptions.js
//
// Cards:
//   1. Total mensuel     — how much you pay per month
//   2. Abonnements actifs — how many subs are currently active
//   3. Économies possibles — money saved from paused subs
//   4. Prochain renouvellement — which sub renews soonest
// ─────────────────────────────────────────────────────────────

import { useEffect, useState } from "react";
import { subscriptions } from "../../data/subscriptions";

// ── HELPER FUNCTIONS ──────────────────────────────────────────
// Small utility functions used to calculate the KPI values.
// They live here (not in a separate file) because they're only
// needed by this component.

// Returns how many days until the next occurrence of a given
// day-of-month. For example, daysUntil(15) tells you how many
// days until the 15th. If the 15th already passed this month,
// it jumps to next month's 15th.
function daysUntil(day) {
  const today = new Date();
  const target = new Date(today.getFullYear(), today.getMonth(), day);
  if (target < today) target.setMonth(target.getMonth() + 1);
  return Math.ceil((target - today) / (1000 * 60 * 60 * 24));
}

// Formats a number as Algerian DZD style.
// e.g. 10780 → "10 780" (French locale, no decimal)
function formatDZD(amount) {
  return new Intl.NumberFormat("fr-DZ").format(amount);
}

// Reads the subscriptions array and calculates all 4 KPI values.
// Returns an object with: total, activeCount, savings, next
function computeKPIs() {
  // Only "active" subs count toward the active badge
  const active = subscriptions.filter((s) => s.status === "active");

  // Paused subs = money you're saving by not paying them
  const paused = subscriptions.filter((s) => s.status === "paused");

  // Billable = active + trial (trial subs still charge you)
  const billable = subscriptions.filter(
    (s) => s.status === "active" || s.status === "trial",
  );

  // Add up all billable amounts for the monthly total
  const total = billable.reduce((sum, s) => sum + s.amount, 0);

  // Simple count of active subs
  const activeCount = active.length;

  // Add up paused sub amounts — this is what you "save"
  const savings = paused.reduce((sum, s) => sum + s.amount, 0);

  // Find which active sub renews soonest by calculating
  // days until each one's renewalDay, then sorting ascending
  const withDays = active.map((s) => ({ ...s, days: daysUntil(s.renewalDay) }));
  withDays.sort((a, b) => a.days - b.days);
  const next = withDays[0]; // first item = closest renewal

  return { total, activeCount, savings, next };
}

// ── KPI CARD COMPONENT ────────────────────────────────────────
// A single card. Receives all its data as props so it stays
// reusable — it doesn't know anything about subscriptions.
//
// Props:
//   label    — title shown at the top (e.g. "Total mensuel")
//   value    — the big number or text in the middle
//   sub      — small text below the value (e.g. "DZD / mois")
//   accent   — CSS color variable for the corner glow
//   delta    — small status line at the bottom (optional)
//   deltaUp  — true = red color, false = green color
function KPICard({ label, value, sub, accent, delta, deltaUp }) {
  return (
    <div
      style={{
        background: "var(--bg-2)", // card surface color from tokens.css
        border: "1px solid var(--border-2)",
        borderRadius: "12px",
        padding: "18px 20px 14px",
        position: "relative", // needed for the corner accent overlay
        overflow: "hidden", // clips the corner accent to the card shape
        cursor: "default",
        transition: "border-color 0.2s ease, transform 0.2s ease",
      }}
      // Hover: lift the card slightly and brighten its border
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = "var(--border)";
        e.currentTarget.style.transform = "translateY(-2px)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = "var(--border-2)";
        e.currentTarget.style.transform = "translateY(0)";
      }}
    >
      {/* Corner accent — a coloured quarter-circle in the top-right.
          Each card gets a different accent color passed via props.
          opacity: 0.08 keeps it subtle so it doesn't overpower the text. */}
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
          pointerEvents: "none", // so it doesn't block clicks
        }}
      />

      {/* Label — tiny ALL CAPS title at the top of the card */}
      <div
        style={{
          fontFamily: "'DM Mono', monospace",
          fontSize: "9px",
          letterSpacing: "2px",
          textTransform: "uppercase",
          color: "var(--text-faint)",
          marginBottom: "10px",
        }}
      >
        {label}
      </div>

      {/* Value — the main big number, uses Cormorant Garamond serif font */}
      <div
        style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: "30px",
          fontWeight: 700,
          color: "var(--text)",
          lineHeight: 1,
          marginBottom: "4px",
        }}
      >
        {value}
      </div>

      {/* Sub label — optional small line below the value.
          Only renders if a sub string was passed in. */}
      {sub && (
        <div
          style={{
            fontFamily: "'DM Mono', monospace",
            fontSize: "9px",
            color: "var(--text-faint)",
            marginBottom: "8px",
          }}
        >
          {sub}
        </div>
      )}

      {/* Delta — optional status line at the bottom.
          deltaUp=true → red (e.g. spending increased)
          deltaUp=false → green (e.g. savings detected)
          Only renders if a delta string was passed in. */}
      {delta && (
        <div
          style={{
            fontFamily: "'DM Mono', monospace",
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

// ── KPI ROW (MAIN EXPORT) ─────────────────────────────────────
// This is what you import in App.jsx.
// It calculates all the numbers, builds the 4 card configs,
// handles responsive columns, and renders the grid.
export function KPIRow() {
  // Get all computed values from subscriptions data
  const { total, activeCount, savings, next } = computeKPIs();

  // cols = how many columns the grid shows.
  // We use a JS resize listener instead of CSS media queries
  // because the grid column count is set inline via style prop.
  // Breakpoints: <480px = 1 col, <1024px = 2 cols, else 4 cols
  const [cols, setCols] = useState(4);

  useEffect(() => {
    function update() {
      if (window.innerWidth < 480) setCols(1);
      else if (window.innerWidth < 1024) setCols(2);
      else setCols(4);
    }
    update(); // run once on mount to set initial value
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update); // cleanup on unmount
  }, []);

  // Each object here becomes one KPICard.
  // To change a card's label, value, or color — edit it here.
  const cards = [
    {
      label: "Total mensuel",
      value: formatDZD(total), // e.g. "10 780"
      sub: "DZD / mois",
      accent: "var(--gold)", // teal in dark mode (gold token = teal now)
      delta: "▲ abonnements actifs + essai",
      deltaUp: true, // red — spending is going up
    },
    {
      label: "Abonnements actifs",
      value: activeCount, // e.g. 5
      sub: `sur ${subscriptions.length} au total`,
      accent: "var(--teal)",
      delta: "— stable ce mois",
      deltaUp: false, // green — no change
    },
    {
      label: "Économies possibles",
      value: savings > 0 ? formatDZD(savings) : "—",
      sub: savings > 0 ? "DZD en abonnements pausés" : "aucun abonnement pausé",
      accent: "var(--green)",
      delta: savings > 0 ? "▼ abonnements en pause" : null,
      deltaUp: false, // green — savings are good
    },
    {
      label: "Prochain renouvellement",
      // Show "Aujourd'hui", "Demain", or "Dans Xj" based on days remaining
      value: next
        ? next.days === 0
          ? "Aujourd'hui"
          : next.days === 1
            ? "Demain"
            : `Dans ${next.days}j`
        : "—",
      sub: next ? `${next.name} — ${formatDZD(next.amount)} DZD` : null,
      accent: "var(--red)",
      // Only show the urgent alert if renewal is within 3 days
      delta: next && next.days <= 3 ? "● Renouvellement imminent" : null,
      deltaUp: true, // red — urgent
    },
  ];

  return (
    // Responsive grid — columns change based on screen width (see cols state above)
    <div
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
        gap: "14px",
        padding: "0 0 16px",
        margin: "0 0 20px",
      }}
    >
      {/* Render one KPICard per card config object */}
      {cards.map((card) => (
        <KPICard key={card.label} {...card} />
      ))}
    </div>
  );
}
