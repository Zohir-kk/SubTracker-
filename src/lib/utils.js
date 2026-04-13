// src/lib/utils.js
// ─────────────────────────────────────────────────────────────
// Pure utility functions shared across the entire app.
// These are plain JS functions — no React, no hooks, no state.
//
// Rule: if it doesn't use useState/useEffect/useContext,
// it belongs here rather than in hooks/useSubscriptions.js
// ─────────────────────────────────────────────────────────────

// ── FORMAT DZD ────────────────────────────────────────────────
// Formats a number as Algerian DZD display format.
// Uses French locale so thousands are separated by spaces.
// e.g. 10780 → "10 780"
export function formatDZD(amount) {
  return new Intl.NumberFormat("fr-DZ").format(amount);
}

// ── DAYS UNTIL ────────────────────────────────────────────────
// Returns how many days until the next occurrence of a given
// day-of-month. If that day already passed this month, it rolls
// forward to next month.
// e.g. today is the 20th, renewalDay is 15 → returns ~25 days
export function daysUntil(day) {
  const today = new Date();
  const target = new Date(today.getFullYear(), today.getMonth(), day);
  if (target < today) target.setMonth(target.getMonth() + 1);
  return Math.ceil((target - today) / (1000 * 60 * 60 * 24));
}

// ── RENEWAL MONTH ─────────────────────────────────────────────
// Returns the short month name for when a sub next renews.
// If the renewalDay already passed this month, returns next month.
// e.g. renewalDay=5, today=12 → "Mai"
export function renewalMonth(day) {
  const today = new Date();
  const target = new Date(today.getFullYear(), today.getMonth(), day);
  if (target < today) target.setMonth(target.getMonth() + 1);
  return target.toLocaleDateString("fr-DZ", { month: "short" });
}

// ── COMPUTE SPEND PER CATEGORY ────────────────────────────────
// Takes a subscriptions array and returns an object with total
// spend per category key. Only counts active + trial subs.
// e.g. { internet: 5000, streaming: 1990, vod: 2590, transport: 1200 }
export function computeSpendPerCategory(subscriptions) {
  const totals = {};
  subscriptions
    .filter((s) => s.status === "active" || s.status === "trial")
    .forEach((s) => {
      totals[s.category] = (totals[s.category] || 0) + s.amount;
    });
  return totals;
}

// ── COMPUTE BREAKDOWN ─────────────────────────────────────────
// Returns category breakdown array sorted by amount descending.
// Each item has: key, label, icon, color, amount, percent
export function computeBreakdown(subscriptions, categories) {
  const totals = computeSpendPerCategory(subscriptions);
  const grandTotal = Object.values(totals).reduce((a, b) => a + b, 0);

  return categories
    .map((cat) => ({
      ...cat,
      amount: totals[cat.key] || 0,
      percent:
        grandTotal > 0
          ? Math.round(((totals[cat.key] || 0) / grandTotal) * 100)
          : 0,
    }))
    .sort((a, b) => b.amount - a.amount);
}
