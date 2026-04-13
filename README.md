# SubDz — Subscription Tracker

A personal subscription management dashboard built for Algerian users. Track monthly subscriptions, manage budgets per category, and get renewal alerts — all stored locally in the browser.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 19 |
| Build tool | Vite (rolldown-vite 7) |
| Styling | Inline CSS with CSS custom properties — no Tailwind classes used in components |
| Charts | Recharts |
| Icons | Lucide React |
| Theme | next-themes (dark / light) |
| UI primitives | Radix UI (avatar, dialog, dropdown, select, switch, tabs, tooltip) |
| State / persistence | React Context + localStorage (no external state library) |
| Currency | DZD (Algerian Dinar) |

---

## Project Structure

```
src/
├── App.jsx                        # Root — StoreProvider + layout shell
├── pages/
│   └── dashboard.jsx              # Main dashboard page
├── store/
│   └── useStore.jsx               # Global state (subscriptions, budget, categories, profile)
├── hooks/
│   └── useSubscriptions.js        # Shared hooks: useKPI, useMediaGrid, useWideLayout
├── lib/
│   └── utils.js                   # Pure utilities: formatDZD, daysUntil, computeBreakdown, etc.
├── data/
│   └── subscriptions.js           # Seed/mock data loaded on first launch
└── components/
    ├── layout/
    │   ├── AppHeader.jsx           # Sticky top bar — theme toggle, avatar, hamburger on mobile
    │   └── AppSidebar.jsx          # Collapsible left nav — overlay on mobile
    ├── kpi/
    │   └── KPIRow.jsx              # 4 summary cards (total, active count, savings, next renewal)
    ├── subs/
    │   └── SubscriptionPanel.jsx   # Subscription grid with category filter tabs
    ├── subscription/
    │   └── SubscriptionModal.jsx   # Add / edit / delete modal + inline new-category form
    ├── upcoming/
    │   └── UpcomingRenewals.jsx    # Sorted list of upcoming renewals
    ├── budget/
    │   └── BudgetPanel.jsx         # Per-category budget bars with inline editing
    ├── charts/
    │   ├── CategoryBreakdown.jsx   # Spending breakdown by category
    │   └── TrendCharts.jsx         # Monthly spending trend (Recharts)
    ├── insight/
    │   └── InsightCard.jsx         # Single AI-style insight about spending
    └── settings/
        └── ProfileModal.jsx        # Edit display name + initials (triggered from avatar)
```

---

## State & Persistence

All data lives in `localStorage` via `useStore.jsx`. No backend, no auth.

| Key | Contents |
|-----|----------|
| `subdz_subscriptions` | Array of subscription objects |
| `subdz_budget` | Map of `{ [categoryKey]: limitDZD }` |
| `subdz_categories` | Array of category objects `{ key, label, icon, color }` |
| `subdz_profile` | `{ name, initials }` |

On first launch the store seeds from `src/data/subscriptions.js` so the dashboard is not empty.

---

## Key Conventions

- **All amounts in DZD** — formatted via `formatDZD()` from `lib/utils.js`
- **Inline CSS throughout** — no Tailwind classes in components, CSS custom properties for theming (`var(--gold)`, `var(--teal)`, `var(--bg-2)`, etc.)
- **Modals use `createPortal`** — rendered at `document.body` to avoid clipping issues
- **Responsive breakpoints**: 480px (1 col), 768px (2 col / mobile sidebar), 1024px (full desktop)
- **Categories are dynamic** — stored in the store, not hardcoded; all components derive color/label/icon via `categories.find()`

---

## Getting Started

```bash
npm install
npm run dev
```

```bash
npm run build    # production build
npm run preview  # preview production build locally
```
