import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Conditionally merges Tailwind CSS classes, resolving conflicts using tailwind-merge.
 * @param {...(string|undefined|null|false)} inputs - The class values to merge.
 * @returns {string} The safely merged class string.
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

/**
 * Formats a numeric amount into a localized currency string.
 * Enforces exactly 2 decimal places to prevent "30.33 vs 30" layout shifts.
 * 
 * @param {number} amount - The amount to format.
 * @param {string} [currencyCode="DZD"] - The 3-letter currency code (e.g. "EUR", "DZD").
 * @returns {string} The formatted currency string (e.g., "1 000,00 DZD").
 */
export function formatCurrency(amount, currencyCode = "DZD") {
  // Use French locale to get space separators like 1 000,00 but format it as currency
  return new Intl.NumberFormat("fr-DZ", {
    style: "currency",
    currency: currencyCode,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Calculates the exact number of days remaining until a subscription renews next.
 * Handles both monthly and yearly billing cycles correctly.
 * 
 * @param {Object} sub - The subscription object.
 * @returns {number} The number of days remaining until the next renewal.
 */
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

/**
 * Returns the short localized string of the next renewal month.
 * e.g., if today is Aug 24 and day is 15, returns "sept." (September).
 * 
 * @param {number} day - The day of the month the subscription renews (1-31).
 * @returns {string} The localized short month name (e.g., "août", "sept.").
 */
export function renewalMonth(day) {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  let target = new Date(today.getFullYear(), today.getMonth(), day);
  if (target < today) {
    target = new Date(today.getFullYear(), today.getMonth() + 1, day);
  }
  return target.toLocaleDateString("fr-DZ", { month: "short" });
}

/**
 * Sums up the total active spending per category, normalizing yearly amounts to monthly.
 * Converts foreign currencies into the base currency if a conversion function is provided.
 * 
 * @param {Array<Object>} subscriptions - The list of subscriptions.
 * @param {Function} [convertToBase] - Optional conversion function from useExchangeRates.
 * @returns {Object.<string, number>} A dictionary mapping category keys to total monthly spend.
 */
export function computeSpendPerCategory(subscriptions, convertToBase) {
  const result = {};
  subscriptions.forEach((sub) => {
    if (sub.status !== "active") return;
    if (!result[sub.category]) result[sub.category] = 0;
    
    let amt = sub.amount;
    if (convertToBase) amt = convertToBase(amt, sub.currency);
    
    const normalizedAmount = sub.billingCycle === "yearly" ? amt / 12 : amt;
    result[sub.category] += normalizedAmount;
  });
  return result;
}

/**
 * Computes a detailed breakdown of spending by category, including percentages
 * for use in charts and data visualization.
 * 
 * @param {Array<Object>} subscriptions - The list of subscriptions.
 * @param {Array<Object>} categories - The list of known categories.
 * @param {Function} [convertToBase] - Optional conversion function.
 * @returns {Array<Object>} An array of category breakdown objects, sorted by amount descending.
 */
export function computeBreakdown(subscriptions, categories, convertToBase) {
  const totals = computeSpendPerCategory(subscriptions, convertToBase);
  const grandTotal = Object.values(totals).reduce((a, b) => a + b, 0);

  const knownKeys = categories.map(c => c.key);
  let otherAmount = 0;

  for (const [key, amount] of Object.entries(totals)) {
    if (!knownKeys.includes(key)) {
      otherAmount += amount;
    }
  }

  const breakdown = categories
    .map((cat) => ({
      ...cat,
      amount: totals[cat.key] || 0,
      percent:
        grandTotal > 0
          ? Math.round(((totals[cat.key] || 0) / grandTotal) * 100)
          : 0,
    }));

  if (otherAmount > 0) {
    breakdown.push({
      key: "other",
      label: "Other",
      color: "var(--text-faint)",
      amount: otherAmount,
      percent: grandTotal > 0 ? Math.round((otherAmount / grandTotal) * 100) : 0,
    });
  }

  return breakdown.sort((a, b) => b.amount - a.amount);
}
