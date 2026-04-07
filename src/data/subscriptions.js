// src/data/subscriptions.js
// Mock subscription data for SubDz — all amounts in DZD

export const subscriptions = [
  {
    id: "djezzy-fibre",
    name: "Djezzy Fibre",
    provider: "Djezzy",
    category: "internet",
    icon: "📡",
    amount: 3200,
    renewalDay: 28,
    status: "active",
    startDate: "2025-09-01",
  },
  {
    id: "mobilis-4g",
    name: "Mobilis 4G+",
    provider: "Mobilis",
    category: "internet",
    icon: "📶",
    amount: 1800,
    renewalDay: 20,
    status: "active",
    startDate: "2025-11-01",
  },
  {
    id: "netflix",
    name: "Netflix",
    provider: "Netflix",
    category: "streaming",
    icon: "🎬",
    amount: 1990,
    renewalDay: 3,
    status: "active",
    startDate: "2024-03-01",
  },
  {
    id: "disney-plus",
    name: "Disney+",
    provider: "Disney",
    category: "streaming",
    icon: "🎬",
    amount: 1800,
    renewalDay: 25,
    status: "paused",
    startDate: "2025-01-01",
  },
  {
    id: "metro-etusa",
    name: "Metro ETUSA",
    provider: "ETUSA",
    category: "transport",
    icon: "🚇",
    amount: 1200,
    renewalDay: 1,
    status: "active",
    startDate: "2025-10-01",
  },
  {
    id: "osn-plus",
    name: "OSN+",
    provider: "OSN",
    category: "vod",
    icon: "🎭",
    amount: 1490,
    renewalDay: 12,
    status: "active",
    startDate: "2025-06-01",
  },
  {
    id: "shahid-vip",
    name: "Shahid VIP",
    provider: "Shahid",
    category: "vod",
    icon: "🎭",
    amount: 1100,
    renewalDay: 18,
    status: "trial",
    startDate: "2026-02-18",
  },
];

// 6-month spending trend
export const trendData = [
  { month: "Oct", amount: 9800 },
  { month: "Nov", amount: 10200 },
  { month: "Déc", amount: 11100 },
  { month: "Jan", amount: 10800 },
  { month: "Fév", amount: 12000 },
  { month: "Mars", amount: 12580 },
];

// Budget limits per category (DZD)
export const budgetLimits = {
  internet: 6000,
  streaming: 4000,
  transport: 2000,
  vod: 3000,
};
