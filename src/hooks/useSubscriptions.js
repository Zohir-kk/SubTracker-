// src/hooks/useSubscriptions.js
// ─────────────────────────────────────────────────────────────
// React hooks for shared state and data logic.
// Pure utility functions have been moved to src/lib/utils.js
//
// Rule: only put things here that need useState or useEffect.
// Everything else goes in lib/utils.js
// ─────────────────────────────────────────────────────────────

import { useState, useEffect, useMemo } from "react";
import { useStore } from "../store/useStore.jsx";
import { daysUntil } from "../lib/utils.js";
import { useExchangeRates } from "./useExchangeRates.js";

// Re-export utilities from lib/utils.js so components that
// currently import from hooks don't need to change their imports
export {
  formatCurrency,
  daysUntil,
  renewalMonth,
  computeSpendPerCategory,
  computeBreakdown,
} from "../lib/utils.js";

// ── USE MEDIA GRID ────────────────────────────────────────────
/**
 * Returns a responsive column count that updates on window resize.
 * Breakpoints: <480px = 1 col, <1024px = 2 cols, else = defaultCols.
 * 
 * @param {number} defaultCols - The default number of columns for large screens.
 * @returns {number} The current number of columns based on window width.
 */
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
/**
 * Detects if the current viewport width is greater than or equal to a given breakpoint.
 * 
 * @param {number} breakpoint - The width in pixels to check against (default: 768).
 * @returns {boolean} True if the window is wider than the breakpoint.
 */
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
/**
 * Computes all 4 dashboard KPI values from the user's subscriptions data.
 * Values are memoized to prevent expensive array reductions on every render.
 * 
 * @returns {{ total: number, activeCount: number, savings: number, next: Object|undefined }}
 */
export function useKPI() {
  const { subscriptions } = useStore();
  const { convertToBase } = useExchangeRates();

  return useMemo(() => {
    const active = subscriptions.filter((s) => s.status === "active");
    const paused = subscriptions.filter((s) => s.status === "paused");
    const billable = subscriptions.filter(
      (s) => s.status === "active" || s.status === "trial"
    );

    const total = billable.reduce((sum, s) => {
      let amt = convertToBase(s.amount, s.currency);
      if (s.billingCycle === "yearly") amt = amt / 12;
      return sum + amt;
    }, 0);
    
    const activeCount = active.length;
    
    const savings = paused.reduce((sum, s) => {
      let amt = convertToBase(s.amount, s.currency);
      if (s.billingCycle === "yearly") amt = amt / 12;
      return sum + amt;
    }, 0);

    const withDays = active
      .map((s) => ({ ...s, days: daysUntil(s) }))
      .sort((a, b) => a.days - b.days);
    const next = withDays[0];

    return { total, activeCount, savings, next };
  }, [subscriptions, convertToBase]);
}

