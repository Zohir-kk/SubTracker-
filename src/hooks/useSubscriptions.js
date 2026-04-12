// src/hooks/useSubscriptions.js
// ─────────────────────────────────────────────────────────────
// Shared hooks and utilities used across the dashboard.
// Import what you need in each component.
// ─────────────────────────────────────────────────────────────

import { useState, useEffect } from "react";
import { subscriptions } from "../data/subscriptions.js";

// ── FORMAT DZD ────────────────────────────────────────────────
// Formats a number as Algerian DZD — e.g. 3200 → "3 200"
export function formatDZD(amount) {
  return new Intl.NumberFormat("fr-DZ").format(amount);
}

// ── DAYS UNTIL ────────────────────────────────────────────────
// Returns days until the next occurrence of a given day-of-month.
// If the day already passed this month, rolls to next month.
export function daysUntil(day) {
  const today = new Date();
  const target = new Date(today.getFullYear(), today.getMonth(), day);
  if (target < today) target.setMonth(target.getMonth() + 1);
  return Math.ceil((target - today) / (1000 * 60 * 60 * 24));
}

// ── USE MEDIA GRID ────────────────────────────────────────────
// Returns a column count that updates on window resize.
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

// ── USE KPI ───────────────────────────────────────────────────
// Computes all 4 KPI values from subscriptions data.
// Usage: const { total, activeCount, savings, next } = useKPI()
export function useKPI() {
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

// ── USE FILTERED SUBSCRIPTIONS ────────────────────────────────
// Filters subscriptions by category tab.
// "all" returns everything unfiltered.
// Usage: const filtered = useFilteredSubscriptions(activeTab)
export function useFilteredSubscriptions(activeTab = "all") {
  return activeTab === "all"
    ? subscriptions
    : subscriptions.filter((s) => s.category === activeTab);
}

// ── USE WIDE LAYOUT ───────────────────────────────────────────
// Returns true if screen is wider than a given breakpoint.
// Used by BudgetPanel for its side-by-side layout.
// Usage: const isWide = useWideLayout()
export function useWideLayout(breakpoint = 768) {
  const [isWide, setIsWide] = useState(window.innerWidth >= breakpoint);

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
