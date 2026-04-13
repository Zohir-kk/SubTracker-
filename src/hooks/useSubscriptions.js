// src/hooks/useSubscriptions.js
// ─────────────────────────────────────────────────────────────
// React hooks for shared state and data logic.
// Pure utility functions have been moved to src/lib/utils.js
//
// Rule: only put things here that need useState or useEffect.
// Everything else goes in lib/utils.js
// ─────────────────────────────────────────────────────────────

import { useState, useEffect } from "react";
import { subscriptions } from "../data/subscriptions.js";
import { daysUntil } from "../lib/utils.js";

// Re-export utilities from lib/utils.js so components that
// currently import from hooks don't need to change their imports
export {
  formatDZD,
  daysUntil,
  renewalMonth,
  computeSpendPerCategory,
  computeBreakdown,
} from "../lib/utils.js";

// ── USE MEDIA GRID ────────────────────────────────────────────
// Returns a responsive column count that updates on window resize.
// Usage: const cols = useMediaGrid(4)
// Breakpoints: <480px=1col, <1024px=2cols, else=defaultCols
export function useMediaGrid(defaultCols = 3) {
  const [cols, setCols] = useState(defaultCols);

  useEffect(() => {
    function update() {
      const width = window.innerWidth;
      if (width < 480) setCols(1);
      else if (width < 1024) setCols(2);
      else setCols(defaultCols);
    }
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [defaultCols]);

  return cols;
}

// ── USE WIDE LAYOUT ───────────────────────────────────────────
// Returns true if screen is wider than the given breakpoint.
// Usage: const isWide = useWideLayout(768)
export function useWideLayout(breakpoint = 768) {
  const [isWide, setIsWide] = useState(
    typeof window !== "undefined" ? window.innerWidth >= breakpoint : true,
  );

  useEffect(() => {
    function update() {
      setIsWide(window.innerWidth >= breakpoint);
    }
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [breakpoint]);

  return isWide;
}

// ── USE KPI ───────────────────────────────────────────────────
// Computes all 4 dashboard KPI values from subscriptions data.
// Usage: const { total, activeCount, savings, next } = useKPI()
export function useKPI() {
  // Import daysUntil locally since it's needed for the calculation

  const active = subscriptions.filter((s) => s.status === "active");
  const paused = subscriptions.filter((s) => s.status === "paused");
  const billable = subscriptions.filter(
    (s) => s.status === "active" || s.status === "trial",
  );

  const total = billable.reduce((sum, s) => sum + s.amount, 0);
  const activeCount = active.length;
  const savings = paused.reduce((sum, s) => sum + s.amount, 0);

  const withDays = active
    .map((s) => ({ ...s, days: daysUntil(s.renewalDay) }))
    .sort((a, b) => a.days - b.days);
  const next = withDays[0];

  return { total, activeCount, savings, next };
}

