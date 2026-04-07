// src/components/charts/CategoryBreakdown.jsx
// ─────────────────────────────────────────────────────────────
// Shows spending per category as animated horizontal bars.
// Calculated live from your subscriptions data.
//
// Categories: Internet / Streaming / VOD Arabe / Transport
// Each row shows: icon, name, amount, bar, percentage
// ─────────────────────────────────────────────────────────────

import { useEffect, useState } from "react";
import { subscriptions } from "../../data/subscriptions";

// ── CATEGORY CONFIG ───────────────────────────────────────────
// All the display info for each category in one place.
// To add a new category, add an entry here.
const CATEGORIES = [
  { key: "internet", label: "Internet", icon: "📡", color: "var(--teal)" },
  { key: "streaming", label: "Streaming", icon: "🎬", color: "var(--orange)" },
  { key: "vod", label: "VOD Arabe", icon: "🎭", color: "var(--gold)" },
  { key: "transport", label: "Transport", icon: "🚇", color: "var(--red)" },
];

// ── HELPER ────────────────────────────────────────────────────

// Formats number as Algerian DZD — e.g. 5000 → "5 000"
function formatDZD(amount) {
  return new Intl.NumberFormat("fr-DZ").format(amount);
}

// Calculates total spend per category from subscriptions.
// Only counts active and trial subs (paused don't charge you).
// Returns an array of { key, label, icon, color, amount, percent }
function computeBreakdown() {
  // Sum amounts per category
  const totals = {};
  subscriptions
    .filter((s) => s.status === "active" || s.status === "trial")
    .forEach((s) => {
      totals[s.category] = (totals[s.category] || 0) + s.amount;
    });

  // Grand total across all categories — used to calculate percentages
  const grandTotal = Object.values(totals).reduce((a, b) => a + b, 0);

  // Build the final array, sorted by amount descending (biggest first)
  return CATEGORIES.map((cat) => ({
    ...cat,
    amount: totals[cat.key] || 0,
    // Percentage of total spend, rounded to nearest whole number
    percent:
      grandTotal > 0
        ? Math.round(((totals[cat.key] || 0) / grandTotal) * 100)
        : 0,
  })).sort((a, b) => b.amount - a.amount);
}

// ── BREAKDOWN ROW ─────────────────────────────────────────────
// One row in the breakdown list. Shows icon, name, amount,
// an animated bar, and a percentage label.
function BreakdownRow({ item, animate }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "10px",
        marginBottom: "16px",
      }}
    >
      {/* Category icon in a tinted square */}
      <div
        style={{
          width: "32px",
          height: "32px",
          borderRadius: "7px",
          background: `${item.color}18`, // color at ~10% opacity
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "14px",
          flexShrink: 0,
        }}
      >
        {item.icon}
      </div>

      {/* Middle: name + amount on top, bar on bottom */}
      <div style={{ flex: 1, minWidth: 0 }}>
        {/* Name and amount on the same row, space-between */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "baseline",
            marginBottom: "6px",
          }}
        >
          <span
            style={{
              fontFamily: "'DM Mono', monospace",
              fontSize: "10px",
              color: "var(--text)",
            }}
          >
            {item.label}
          </span>
          <span
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: "14px",
              fontWeight: 600,
              color: item.color, // each category gets its own accent color
            }}
          >
            {formatDZD(item.amount)}
          </span>
        </div>

        {/* Progress bar track */}
        <div
          style={{
            height: "3px",
            background: "var(--border-2)",
            borderRadius: "2px",
            overflow: "hidden",
          }}
        >
          {/* Filled bar — animates from 0% to the real percent on mount */}
          <div
            style={{
              height: "100%",
              // animate=true means bars have loaded and should show real width
              // animate=false means we're still on first render, keep at 0%
              width: animate ? `${item.percent}%` : "0%",
              background: item.color,
              borderRadius: "2px",
              transition: "width 0.9s cubic-bezier(0.23, 1, 0.32, 1)",
            }}
          />
        </div>
      </div>

      {/* Percentage label on the right */}
      <div
        style={{
          fontFamily: "'DM Mono', monospace",
          fontSize: "9px",
          color: "var(--text-faint)",
          minWidth: "30px",
          textAlign: "right",
          flexShrink: 0,
        }}
      >
        {item.percent}%
      </div>
    </div>
  );
}

// ── CATEGORY BREAKDOWN (MAIN EXPORT) ─────────────────────────
export function CategoryBreakdown() {
  const breakdown = computeBreakdown();

  // animate controls whether bars show their real width or 0%.
  // We start at false (bars at 0%) and flip to true after a short
  // delay so the animation plays on first render — not on every re-render.
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    // Small delay so the bars animate in after the panel appears
    const timer = setTimeout(() => setAnimate(true), 150);
    return () => clearTimeout(timer);
  }, []);

  // Grand total of all billable subs — shown in the panel header
  const total = breakdown.reduce((sum, item) => sum + item.amount, 0);

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
          Par catégorie
        </div>
        {/* Total spend shown on the right */}
        <div
          style={{
            marginLeft: "auto",
            fontFamily: "'DM Mono', monospace",
            fontSize: "9px",
            color: "var(--text-faint)",
            letterSpacing: "1px",
          }}
        >
          {formatDZD(total)} DZD
        </div>
      </div>

      {/* ── Breakdown rows ── */}
      {breakdown.map((item) => (
        <BreakdownRow key={item.key} item={item} animate={animate} />
      ))}
    </div>
  );
}
