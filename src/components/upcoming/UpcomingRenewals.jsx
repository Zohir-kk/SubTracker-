// src/components/upcoming/UpcomingRenewals.jsx
// ─────────────────────────────────────────────────────────────
// Shows a list of upcoming subscription renewals sorted by
// how soon they renew. Only active and trial subs are shown
// since paused subs won't charge you.
//
// Each row shows:
//   - Day number + month name (left)
//   - Subscription name + category (middle)
//   - Amount in DZD (right)
//   - Pulse dot if renewing within 7 days
// ─────────────────────────────────────────────────────────────

import { subscriptions } from "../../data/subscriptions";
import { formatDZD, daysUntil, renewalMonth } from "../../hooks/useSubscriptions.js";

// Category colors — matches the rest of the dashboard
const CATEGORY_COLORS = {
  internet: "var(--teal)",
  transport: "var(--red)",
  streaming: "var(--orange)",
  vod: "var(--gold)",
};

const CATEGORY_LABELS = {
  internet: "Internet",
  transport: "Transport",
  streaming: "Streaming",
  vod: "VOD Arabe",
};

// ── UPCOMING ITEM ─────────────────────────────────────────────
// A single row in the renewals list.
function UpcomingItem({ sub, days }) {
  const isSoon = days <= 7; // within 7 days = show pulse dot + red day number
  const color = CATEGORY_COLORS[sub.category] || "var(--teal)";
  const month = renewalMonth(sub.renewalDay);

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "12px",
        padding: "10px 0",
        borderBottom: "1px solid var(--border-2)",
      }}
    >
      {/* ── Date block: big day number + month ── */}
      <div style={{ textAlign: "center", minWidth: "36px", flexShrink: 0 }}>
        <div
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: "22px",
            fontWeight: 700,
            // Red if renewing soon, gold/teal accent otherwise
            color: isSoon ? "var(--red)" : "var(--gold)",
            lineHeight: 1,
          }}
        >
          {sub.renewalDay}
        </div>
        <div
          style={{
            fontFamily: "'DM Mono', monospace",
            fontSize: "8px",
            letterSpacing: "1px",
            textTransform: "uppercase",
            color: "var(--text-faint)",
            marginTop: "2px",
          }}
        >
          {month}
        </div>
      </div>

      {/* ── Vertical divider ── */}
      <div
        style={{
          width: "1px",
          height: "32px",
          background: "var(--border-2)",
          flexShrink: 0,
        }}
      />

      {/* ── Name + category (takes remaining space) ── */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            marginBottom: "2px",
          }}
        >
          {/* Pulse dot — only shown if renewal is within 7 days */}
          {isSoon && (
            <div
              style={{
                width: "5px",
                height: "5px",
                borderRadius: "50%",
                background: "var(--red)",
                flexShrink: 0,
                animation: "subdz-pulse 1.5s ease infinite",
              }}
            />
          )}
          <div
            style={{
              fontFamily: "'DM Mono', monospace",
              fontSize: "11px",
              color: "var(--text)",
              // Truncate long names with ellipsis
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {sub.name}
          </div>
        </div>
        <div
          style={{
            fontFamily: "'DM Mono', monospace",
            fontSize: "8px",
            letterSpacing: "1.5px",
            textTransform: "uppercase",
            color: color,
          }}
        >
          {CATEGORY_LABELS[sub.category]}
        </div>
      </div>

      {/* ── Amount on the right ── */}
      <div style={{ textAlign: "right", flexShrink: 0 }}>
        <span
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: "16px",
            fontWeight: 600,
            color: "var(--text)",
          }}
        >
          {formatDZD(sub.amount)}
        </span>
        <span
          style={{
            fontFamily: "'DM Mono', monospace",
            fontSize: "8px",
            color: "var(--text-faint)",
            marginLeft: "3px",
          }}
        >
          DZD
        </span>
      </div>
    </div>
  );
}

// ── UPCOMING RENEWALS (MAIN EXPORT) ───────────────────────────
export function UpcomingRenewals() {
  // Only show active and trial subs — paused won't charge you
  const upcoming = subscriptions
    .filter((s) => s.status === "active" || s.status === "trial")
    .map((s) => ({ ...s, days: daysUntil(s.renewalDay) }))
    // Sort by soonest renewal first
    .sort((a, b) => a.days - b.days);

  return (
    <div
      style={{
        background: "var(--bg-2)",
        border: "1px solid var(--border-2)",
        borderRadius: "14px",
        padding: "18px",
        marginBottom: "0",
        height: "100%",
        boxSizing: "border-box",
      }}
    >
      {/* ── Panel header ── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          marginBottom: "4px",
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
          Prochains renouvellements
        </div>
        {/* Count of upcoming subs */}
        <div
          style={{
            marginLeft: "auto",
            fontFamily: "'DM Mono', monospace",
            fontSize: "9px",
            letterSpacing: "1.5px",
            textTransform: "uppercase",
            color: "var(--text-faint)",
          }}
        >
          {upcoming.length} abonnements
        </div>
      </div>

      {/* ── Renewal rows ── */}
      {/* The last item has no border, so we remove it with a style override */}
      <div>
        {upcoming.map((sub, index) => (
          <div
            key={sub.id}
            style={
              index === upcoming.length - 1 ? { borderBottom: "none" } : {}
            }
          >
            <UpcomingItem sub={sub} days={sub.days} />
          </div>
        ))}
      </div>
    </div>
  );
}
