import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function formatDZD(amount) {
  return new Intl.NumberFormat("fr-DZ").format(amount);
}

export function daysUntil(day) {
  const today = new Date();
  const target = new Date(today.getFullYear(), today.getMonth(), day);
  if (target < today) target.setMonth(target.getMonth() + 1);
  return Math.ceil((target - today) / (1000 * 60 * 60 * 24));
}

export function renewalMonth(day) {
  const today = new Date();
  const target = new Date(today.getFullYear(), today.getMonth(), day);
  if (target < today) target.setMonth(target.getMonth() + 1);
  return target.toLocaleDateString("fr-DZ", { month: "short" });
}

export function computeSpendPerCategory(subscriptions) {
  const totals = {};
  subscriptions
    .filter((s) => s.status === "active" || s.status === "trial")
    .forEach((s) => {
      totals[s.category] = (totals[s.category] || 0) + s.amount;
    });
  return totals;
}

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
