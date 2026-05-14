# SubDz — Subscription Tracker

A personal subscription management dashboard built for Algerian users. Track monthly subscriptions, manage budgets per category, and get renewal alerts — all stored locally in the browser. Includes a streaming AI assistant (SubDz AI) powered by Claude.

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
| AI | Vercel AI SDK + Claude (Anthropic) via serverless API route |
| Rate limiting | Upstash Redis (`@upstash/ratelimit`) |

---

## Project Structure

```
subdz/
├── api/
│   └── chat.js                    # Serverless backend — rate limiting, sanitization, Claude streaming
├── src/
│   ├── App.jsx                    # Root — StoreProvider + layout shell + <AskSubDz />
│   ├── pages/
│   │   ├── dashboard.jsx          # Main dashboard page
│   │   └── Parametres.jsx         # Settings page (profile + category management)
│   ├── store/
│   │   └── useStore.jsx           # Global state (subscriptions, budget, categories, profile)
│   ├── hooks/
│   │   ├── useSubscriptions.js    # Shared hooks: useKPI, useMediaGrid, useWideLayout
│   │   └── useSubDzChat.js        # AI chat hook — fetch + streaming + message state
│   ├── lib/
│   │   └── utils.js               # Pure utilities: formatDZD, daysUntil, computeBreakdown, etc.
│   ├── data/
│   │   └── subscriptions.js       # Seed/mock data loaded on first launch
│   └── components/
│       ├── layout/
│       │   ├── AppHeader.jsx      # Sticky top bar — theme toggle, avatar, hamburger on mobile
│       │   └── AppSidebar.jsx     # Collapsible left nav — overlay on mobile
│       ├── ai/
│       │   ├── AskSubDz.jsx       # Floating teal button (bottom-right) that opens the chat
│       │   ├── ChatPanel.jsx      # Chat window — messages list + input bar
│       │   └── MessageBubble.jsx  # Single message bubble (user or assistant)
│       ├── kpi/
│       │   └── KPIRow.jsx         # 4 summary cards (total, active count, savings, next renewal)
│       ├── subs/
│       │   └── SubscriptionPanel.jsx   # Subscription grid with category filter tabs
│       ├── subscription/
│       │   └── SubscriptionModal.jsx   # Add / edit / delete modal + inline new-category form
│       ├── upcoming/
│       │   └── UpcomingRenewals.jsx    # Sorted list of upcoming renewals
│       ├── budget/
│       │   └── BudgetPanel.jsx         # Per-category budget bars with inline editing
│       ├── charts/
│       │   ├── CategoryBreakdown.jsx   # Spending breakdown by category
│       │   └── TrendCharts.jsx         # Monthly spending trend (Recharts)
│       ├── insight/
│       │   └── InsightCard.jsx         # Single AI-style insight about spending
│       └── settings/
│           └── ProfileModal.jsx        # Edit display name + initials (triggered from avatar)
```

---

## AI Feature (SubDz AI)

A floating chat button (bottom-right) opens a teal-themed panel where users can ask questions about their subscriptions in Arabic, French, English, or Darija. Claude streams replies word-by-word.

**Security measures in `api/chat.js`:**
- API key stored server-side only — never shipped to the browser
- Rate limited to 20 requests / hour per IP (Upstash Redis)
- User input sanitized (control characters stripped, max 500 characters)
- Prompt injection defense baked into the system prompt

**Planned phases:**
- Phase 1 ✅ — Streaming chat foundation
- Phase 2 — RAG: inject user's real subscription data into the system prompt
- Phase 3 — Inline components: Claude renders charts and cards inside chat bubbles
- Phase 4 — Algerian polish: local carrier/service knowledge, Darija, Ramadan awareness

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

### Without AI features

```bash
npm install
npm run dev
```

### With AI features (required for `/api/chat`)

The AI backend runs as a Vercel serverless function and needs the Vercel CLI:

```bash
npm install -g vercel
vercel login
vercel link        # link or create a Vercel project for this repo
```

Create `.env.local` in the project root with your credentials:

```
ANTHROPIC_API_KEY=sk-ant-...
UPSTASH_REDIS_REST_URL=https://...upstash.io
UPSTASH_REDIS_REST_TOKEN=...
```

Then start the dev server:

```bash
vercel dev         # runs Vite frontend + /api routes together on localhost:3000
```

> `.env.local` is gitignored. See `.env.example` for the required variable names.

```bash
npm run build      # production build
npm run preview    # preview production build locally
```
