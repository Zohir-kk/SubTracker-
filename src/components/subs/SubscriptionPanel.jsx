// src/components/subs/SubscriptionPanel.jsx
// ─────────────────────────────────────────────────────────────
// The main subscription section of the dashboard.
// Contains two sub-components:
//   - CategoryTabs: filter buttons (Tous / Internet / etc.)
//   - SubscriptionCard: one card per subscription
//
// All 7 subscriptions are shown by default.
// Clicking a tab filters the grid to that category only.
// ─────────────────────────────────────────────────────────────

import { useState, useEffect } from "react";
import { useStore } from "../../store/useStore.jsx";
import { formatDZD, daysUntil } from "../../hooks/useSubscriptions.js";
import { SubscriptionModal } from "../subscription/SubscriptionModal.jsx";

// Looks up color/label from the live categories array with a safe fallback
function getCatInfo(categories, key) {
  const cat = categories.find((c) => c.key === key);
  return { color: cat?.color ?? "var(--teal)", label: cat?.label ?? key };
}

// ── STATUS BADGE ──────────────────────────────────────────────
// Small pill shown in the top-right of each card.
// Color changes based on status: active=green, paused=red, trial=teal
function StatusBadge({ status }) {
  // Each status gets its own background, text color, and border
  const styles = {
    active: {
      background: "rgba(74, 222, 128, 0.10)",
      color: "var(--green)",
      border: "1px solid rgba(74, 222, 128, 0.20)",
    },
    paused: {
      background: "rgba(248, 113, 113, 0.10)",
      color: "var(--red)",
      border: "1px solid rgba(248, 113, 113, 0.20)",
    },
    trial: {
      background: "rgba(45, 212, 191, 0.10)",
      color: "var(--teal)",
      border: "1px solid rgba(45, 212, 191, 0.20)",
    },
  };

  // French labels for each status
  const labels = {
    active: "Actif",
    paused: "Pausé",
    trial: "Essai",
  };

  return (
    <div
      style={{
        ...styles[status],
        fontFamily: "'IBM Plex Mono', monospace",
        fontSize: "8px",
        letterSpacing: "1px",
        textTransform: "uppercase",
        padding: "3px 8px",
        borderRadius: "4px",
      }}
    >
      {labels[status]}
    </div>
  );
}

// ── RENEWAL BAR ───────────────────────────────────────────────
// A thin progress bar at the bottom of each card showing how far
// through the current billing cycle you are.
// e.g. if you're on day 20 of a 28-day cycle → bar is ~71% full
function RenewalBar({ renewalDay, color }) {
  const today = new Date();
  const currentDay = today.getDate(); // what day of the month is it today
  const daysInMonth = new Date(
    today.getFullYear(),
    today.getMonth() + 1,
    0,
  ).getDate();

  // Calculate progress: how far from last renewal to next renewal
  // If renewal is on day 15 and today is day 20 → we're 5/30 days in (roughly)
  let progress;
  if (currentDay <= renewalDay) {
    // Haven't hit renewal day yet this month
    progress = ((currentDay + (daysInMonth - renewalDay)) / daysInMonth) * 100;
  } else {
    // Already passed renewal day, counting toward next month's
    progress = ((currentDay - renewalDay) / daysInMonth) * 100;
  }

  // Cap between 5% and 100% so bar is always slightly visible
  progress = Math.min(100, Math.max(5, progress));

  return (
    <div
      style={{
        height: "3px",
        background: "var(--border-2)", // grey track background
        borderRadius: "2px",
        marginTop: "10px",
        overflow: "hidden",
      }}
    >
      {/* Filled portion of the bar */}
      <div
        style={{
          height: "100%",
          width: `${progress}%`,
          background: color,
          borderRadius: "2px",
          transition: "width 0.8s cubic-bezier(0.23, 1, 0.32, 1)", // smooth on mount
        }}
      />
    </div>
  );
}

// ── SUBSCRIPTION CARD ─────────────────────────────────────────
// One card per subscription. Shows icon, name, category, amount,
// renewal info, status badge, and a progress bar.
function SubscriptionCard({ sub, onClick, categories }) {
  const { color, label: catLabel } = getCatInfo(categories, sub.category);
  const days = daysUntil(sub.renewalDay);
  const isSoon = days <= 7; // renewal within 7 days = show pulse dot

  // Renewal text shown below the amount
  const renewalText =
    days === 0
      ? "Renouvellement aujourd'hui"
      : days === 1
        ? "Renouvellement demain"
        : `Le ${sub.renewalDay} du mois — dans ${days}j`;

  return (
    <div
      style={{
        background: "var(--bg-3)",
        border: "1px solid var(--border-2)",
        borderRadius: "10px",
        padding: "14px",
        cursor: "pointer",
        transition: "border-color 0.2s ease, transform 0.15s ease",
        // Paused cards get a slightly lower opacity to feel "inactive"
        opacity: sub.status === "paused" ? 0.7 : 1,
      }}
      onClick={onClick}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = "var(--border)";
        e.currentTarget.style.transform = "translateY(-1px)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = "var(--border-2)";
        e.currentTarget.style.transform = "translateY(0)";
      }}
    >
      {/* ── Top row: icon + status badge ── */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: "10px",
        }}
      >
        {/* Category icon in a tinted rounded square */}
        <div
          style={{
            width: "36px",
            height: "36px",
            borderRadius: "8px",
            background: `${color}18`, // color at ~10% opacity as background tint
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "16px",
          }}
        >
          {sub.icon}
        </div>

        <StatusBadge status={sub.status} />
      </div>

      {/* ── Name + category label ── */}
      <div
        style={{
          fontFamily: "'IBM Plex Mono', monospace",
          fontSize: "11px",
          color: "var(--text)",
          marginBottom: "2px",
        }}
      >
        {sub.name}
      </div>
      <div
        style={{
          fontFamily: "'IBM Plex Mono', monospace",
          fontSize: "8px",
          letterSpacing: "1.5px",
          textTransform: "uppercase",
          color: color, // category color (teal, red, orange, gold)
          marginBottom: "10px",
        }}
      >
        {catLabel}
      </div>

      {/* ── Amount in big Cormorant serif ── */}
      <div style={{ display: "flex", alignItems: "baseline", gap: "5px" }}>
        <span
          style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: "22px",
            fontWeight: 700,
            color: "var(--text)",
          }}
        >
          {formatDZD(sub.amount)}
        </span>
        <span
          style={{
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: "9px",
            color: "var(--text-faint)",
          }}
        >
          DZD/mois
        </span>
      </div>

      {/* ── Renewal date row ── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "6px",
          marginTop: "6px",
          fontFamily: "'IBM Plex Mono', monospace",
          fontSize: "9px",
          color: "var(--text-faint)",
        }}
      >
        {/* Pulse dot — only shown when renewal is within 7 days */}
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
        <span>{renewalText}</span>
      </div>

      {/* ── Progress bar showing billing cycle progress ── */}
      <RenewalBar renewalDay={sub.renewalDay} color={color} />
    </div>
  );
}

// ── CATEGORY TABS ─────────────────────────────────────────────
// The filter buttons above the subscription grid.
// "Tous" shows everything. Other tabs filter by category.
// activeTab is controlled by the parent (SubscriptionPanel).
function CategoryTabs({ activeTab, onChange, categories }) {
  const tabs = [
    { value: "all", label: "Tous" },
    ...categories.map((c) => ({ value: c.key, label: c.label })),
  ];

  return (
    <div
      style={{
        display: "flex",
        gap: "6px",
        flexWrap: "wrap",
        marginBottom: "14px",
      }}
    >
      {tabs.map((tab) => {
        const isActive = tab.value === activeTab;
        return (
          <button
            key={tab.value}
            onClick={() => onChange(tab.value)} // tell parent which tab was clicked
            style={{
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: "9px",
              letterSpacing: "1px",
              textTransform: "uppercase",
              padding: "5px 12px",
              borderRadius: "6px",
              cursor: "pointer",
              border: isActive
                ? "1px solid var(--gold)"
                : "1px solid var(--border-2)",
              color: isActive ? "var(--gold)" : "var(--text-faint)",
              background: isActive ? "var(--gold-dim)" : "transparent",
              transition: "all 0.2s ease",
            }}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}

// ── SUBSCRIPTION PANEL (MAIN EXPORT) ─────────────────────────
// This is what you import in App.jsx.
// It manages the active filter tab and renders the full panel.
export function SubscriptionPanel() {
  const { subscriptions, categories } = useStore();
  const [activeTab, setActiveTab] = useState("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [modalSub, setModalSub] = useState(null);

  function openAdd() {
    setModalSub(null);
    setModalOpen(true);
  }

  function openEdit(sub) {
    setModalSub(sub);
    setModalOpen(true);
  }

  // Responsive grid columns — same breakpoints as KPIRow
  // <480px = 1 col, <768px = 2 cols, else 3 cols
  const [cols, setCols] = useState(3);

  useEffect(() => {
    function update() {
      if (window.innerWidth < 480) setCols(1);
      else if (window.innerWidth < 768) setCols(2);
      else setCols(3);
    }
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  // Filter the subscriptions array based on the active tab.
  // If "all" is selected, show everything unfiltered.
  const filtered =
    activeTab === "all"
      ? subscriptions
      : subscriptions.filter((s) => s.category === activeTab);

  return (
    <div
      style={{
        background: "var(--bg-2)",
        border: "1px solid var(--border-2)",
        borderRadius: "14px",
        padding: "18px",
        margin: "0 0 16px",
      }}
    >
      {/* ── Panel header: gold dot + title + count ── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          marginBottom: "16px",
        }}
      >
        {/* Gold dot — decorative accent from the design system */}
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
          Mes Abonnements
        </div>
        {/* Right side: count + add button */}
        <div
          style={{
            marginLeft: "auto",
            display: "flex",
            alignItems: "center",
            gap: "12px",
          }}
        >
          <div
            style={{
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: "9px",
              letterSpacing: "1.5px",
              textTransform: "uppercase",
              color: "var(--text-faint)",
            }}
          >
            {filtered.length} / {subscriptions.length}
          </div>
          <button
            onClick={openAdd}
            style={{
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: "9px",
              letterSpacing: "1px",
              textTransform: "uppercase",
              padding: "5px 12px",
              borderRadius: "6px",
              cursor: "pointer",
              background: "var(--gold)",
              border: "1px solid var(--gold)",
              color: "#020d0d",
              fontWeight: 600,
            }}
          >
            + Ajouter
          </button>
        </div>
      </div>

      {/* ── Category filter tabs ── */}
      <CategoryTabs activeTab={activeTab} onChange={setActiveTab} categories={categories} />

      {/* ── Subscription grid ── */}
      {/* cols changes based on screen width: 1 on mobile, 2 on tablet, 3 on desktop */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
          gap: "10px",
        }}
      >
        {filtered.map((sub) => (
          <SubscriptionCard key={sub.id} sub={sub} onClick={() => openEdit(sub)} categories={categories} />
        ))}
      </div>

      {/* Empty state */}
      {filtered.length === 0 && (
        <div
          style={{
            textAlign: "center",
            padding: "40px 0",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "12px",
          }}
        >
          <div
            style={{
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: "10px",
              letterSpacing: "1.5px",
              textTransform: "uppercase",
              color: "var(--text-faint)",
            }}
          >
            {activeTab === "all"
              ? "Aucun abonnement pour l'instant"
              : "Aucun abonnement dans cette catégorie"}
          </div>
          {activeTab === "all" && (
            <button
              onClick={openAdd}
              style={{
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: "9px",
                letterSpacing: "1px",
                textTransform: "uppercase",
                padding: "7px 16px",
                borderRadius: "8px",
                cursor: "pointer",
                background: "var(--gold)",
                border: "1px solid var(--gold)",
                color: "#020d0d",
                fontWeight: 600,
              }}
            >
              + Ajouter un abonnement
            </button>
          )}
        </div>
      )}

      <SubscriptionModal
        isOpen={modalOpen}
        sub={modalSub}
        onClose={() => { setModalOpen(false); setModalSub(null); }}
      />
    </div>
  );
}
