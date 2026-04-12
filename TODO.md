# SubTracker Structure Improvements - TODO

## Phase 1: Extract Shared Logic to hooks/utils.js ✅ Started

- [x] 1. Create src/hooks/utils.js with shared hooks/functions
  - `useMediaGrid(colsCallback)` - JS resize logic
  - `useKPI()` - KPI calculations
  - `useDaysUntil(day)` - Renewal countdown
  - `formatDZD(amount)` - Currency formatting
  - `useFilteredSubscriptions(tab)` - Category filtering
- [x] 2. Refactor KPIRow.jsx to use utils.js hooks
- [x] 3. Refactor SubscriptionPanel.jsx to use utils.js hooks
- [ ] 4. Test Phase 1

## Phase 2: Routing + Pages

- [ ] 5. Install react-router-dom
- [ ] 6. Create pages/Dashboard.jsx
- [ ] 7. AppShell + Router setup

## Phase 3: Tailwind Migration

- [ ] 8. Create tokens.css + migrate inline styles

## Phase 4: Polish

- [ ] 9. Zustand store (if needed)
- [ ] 10. Tests + lint
