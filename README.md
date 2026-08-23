# SubDz — Subscription Tracker

A personal subscription management dashboard built for Algerian users. Track monthly subscriptions, manage budgets per category, and get renewal alerts across devices via Firebase. Includes full multi-language support (English, French, Arabic RTL) and a streaming AI assistant (SubDz AI) powered by Claude.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 19 |
| Build tool | Vite (rolldown-vite 7) |
| Styling | Tailwind CSS (with native RTL support) |
| Backend & Auth | Firebase (Authentication + Firestore) |
| Charts | Recharts |
| Icons | Lucide React |
| Theme | next-themes (dark / light) |
| UI primitives | Radix UI (avatar, dialog, dropdown, select, switch, tabs, tooltip) |
| State | React Context via `useStore` linked to Firestore |
| Internationalization | Custom `LanguageProvider` (en, fr, ar) |
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
│   ├── App.jsx                    # Root — Routing, Auth Checks, Layout Shell
│   ├── firebase.json              # Firebase config
│   ├── locales/
│   │   ├── ar.js                  # Arabic translations
│   │   ├── en.js                  # English translations
│   │   └── fr.js                  # French translations
│   ├── pages/
│   │   ├── dashboard.jsx          # Main dashboard page
│   │   └── Parametres.jsx         # Settings page (profile + category management)
│   ├── store/
│   │   └── useStore.jsx           # Global state — Syncs Firebase Auth & Firestore data
│   ├── providers/
│   │   └── LanguageProvider.jsx   # i18n and RTL direction provider
│   ├── hooks/
│   │   ├── useSubscriptions.js    # Shared hooks: useKPI, useMediaGrid, useWideLayout
│   │   └── useSubDzChat.js        # AI chat hook — fetch + streaming + message state
│   ├── lib/
│   │   ├── utils.js               # Pure utilities: formatDZD, daysUntil, computeBreakdown, etc.
│   │   └── firebase.js            # Firebase App, Auth, and Firestore initialization
│   ├── data/
│   │   └── subscriptions.js       # Seed/mock data loaded on first launch for new users
│   └── components/
│       ├── layout/
│       │   ├── AppHeader.jsx      # Sticky mobile top bar — theme toggle, avatar, hamburger
│       │   └── AppSidebar.jsx     # Command Center — Sticky on desktop, drawer on mobile
│       ├── auth/
│       │   ├── AuthScreen.jsx           # Login/Signup/Reset flows
│       │   └── ResetPasswordScreen.jsx  # Firebase Password Reset handling
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
│           └── ProfileModal.jsx        # Edit display name, avatar upload, initials
```

---

## AI Feature (SubDz AI)

A floating chat button (bottom-right) opens a teal-themed panel where users can ask questions about their subscriptions in Arabic, French, English, or Darija. Claude streams replies word-by-word.

**Security measures in `api/chat.js`:**
- API key stored server-side only — never shipped to the browser
- Rate limited to 20 requests / hour per IP (Upstash Redis)
- User input sanitized (control characters stripped, max 500 characters)
- Prompt injection defense baked into the system prompt

---

## State & Persistence

All data is securely synced to Firebase via `useStore.jsx`. The app requires user authentication (Email/Password).

| Firestore Path | Contents |
|-----|----------|
| `users/{uid}` | Document containing the user's data |
| `users/{uid}/profile` | `{ name, initials, currency, avatarUrl, language }` |
| `users/{uid}/budgetLimits` | Map of `{ [categoryKey]: limitDZD }` |
| `users/{uid}/categories` | Array of category objects `{ key, label, icon, color }` |
| `users/{uid}/monthlyBudget` | Total monthly budget threshold |
| `users/{uid}/subscriptions` | (Collection) Individual subscription documents |

On first login, new users are seeded with standard categories and a welcome profile.

---

## Key Conventions

- **Internationalization (i18n)** — All user-facing text must be wrapped in `t('key')` from `useLanguage()`.
- **RTL Support** — Layouts automatically switch direction based on the selected language using Tailwind's `rtl:` modifiers (e.g., `rtl:translate-x-full`, `rtl:rotate-180`).
- **Tailwind Styling** — Components heavily rely on Tailwind utility classes with CSS variables mapping to the design system (`bg-bg`, `text-gold`, `border-border-2`).
- **All amounts in DZD** — formatted via `formatCurrency()` from `lib/utils.js`.
- **Modals use `createPortal`** — rendered at `document.body` to avoid clipping issues.
- **Responsive breakpoints**: 480px (1 col), 768px (2 col / mobile sidebar overlay), 1024px (full desktop).

---

## Getting Started

### Local Development

```bash
npm install
npm run dev
```

### Firebase Setup
You must have a Firebase project configured with Authentication (Email/Password) and Firestore enabled. Add your configuration to `src/lib/firebase.js`.

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
