import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount, currencyCode = "DZD") {
  // Use French locale to get space separators like 1 000,00 but format it as currency
  return new Intl.NumberFormat("fr-DZ", {
    style: "currency",
    currency: currencyCode,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function daysUntil(sub) {
  if (!sub || !sub.renewalDay) return 0;
  const now = new Date();

  if (sub.billingCycle === "yearly" && sub.renewalMonth) {
    const currentYearDay = new Date(now.getFullYear(), sub.renewalMonth - 1, sub.renewalDay);
    if (currentYearDay >= now) {
      return Math.ceil((currentYearDay - now) / (1000 * 60 * 60 * 24));
    }
    const nextYearDay = new Date(now.getFullYear() + 1, sub.renewalMonth - 1, sub.renewalDay);
    return Math.ceil((nextYearDay - now) / (1000 * 60 * 60 * 24));
  } else {
    const currentMonthDay = new Date(now.getFullYear(), now.getMonth(), sub.renewalDay);
    if (currentMonthDay >= now) {
      return Math.ceil((currentMonthDay - now) / (1000 * 60 * 60 * 24));
    }
    const nextMonthDay = new Date(now.getFullYear(), now.getMonth() + 1, sub.renewalDay);
    return Math.ceil((nextMonthDay - now) / (1000 * 60 * 60 * 24));
  }
}

export function renewalMonth(day) {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  let target = new Date(today.getFullYear(), today.getMonth(), day);
  if (target < today) {
    target = new Date(today.getFullYear(), today.getMonth() + 1, day);
  }
  return target.toLocaleDateString("fr-DZ", { month: "short" });
}

export function computeSpendPerCategory(subscriptions) {
  const result = {};
  subscriptions.forEach((sub) => {
    if (sub.status !== "active") return;
    if (!result[sub.category]) result[sub.category] = 0;
    const normalizedAmount = sub.billingCycle === "yearly" ? sub.amount / 12 : sub.amount;
    result[sub.category] += normalizedAmount;
  });
  return result;
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
