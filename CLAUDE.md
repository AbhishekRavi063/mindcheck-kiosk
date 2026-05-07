# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev        # Vite dev server at http://localhost:3000
npm run build      # Production build → dist/
```

No lint or test commands are configured. TypeScript strict mode is disabled (`strict: false` in tsconfig.json).

## Architecture Overview

MindCheck is a React + TypeScript mental wellness app. It runs as a web app in the browser and is packaged as an Android APK via Capacitor. The `dist/` directory is the Capacitor `webDir`.

### Navigation Model

There is **no routing library**. Navigation is entirely state-driven in `App.tsx`, which holds a `currentTab` string and 10+ boolean modal states. Switching screens means calling `setCurrentTab('trends')` etc. Modals are layered on top via conditional rendering.

### Data Flow

```
CheckInFlow (questionnaires + games)
  → CompletionSummary (calls save helpers)
  → localStorage (primary store)
  → TrendsScreen (reads localStorage, renders Recharts)
  → ProfileScreen (export, error logs, settings)
```

`dataSync.ts` contains Supabase sync logic but cloud sync is **hardcoded to `false`** — all data stays in localStorage only.

### Key localStorage Keys

All keys use the `mindcheck_` prefix:

| Key | Contents |
|-----|----------|
| `mindcheck_history` | Check-in responses (PHQ-9, GAD-7, PSS, RSES scores) |
| `mindcheck_game_metrics` | Game performance data |
| `mindcheck_journal_entries_all` | Journal entries |
| `mindcheck_ema_data` | Daily EMA check-in logs |
| `mindcheck_error_logs` | Last 50 on-device error logs |
| `mindcheck_user_id` | Device-scoped ID (`user-{timestamp}-{random}`) |
| `mindcheck_preferences` | User settings |
| `mindcheck_onboarded` | Boolean first-launch flag |

### Component Hierarchy

- **`App.tsx`** — root orchestrator: tab state, modal states, onboarding flow, dark mode, journal deduplication on startup
- **`CheckInHub.tsx`** — home tab; daily quotes, week calendar, navigation to other flows
- **`CheckInFlow.tsx`** — full check-in: randomizes questionnaire order (PHQ-9, GAD-7, PSS, RSES), interleaves 3 games, optional journal prompt
- **`EMAFlow.tsx`** — lightweight daily check-in (separate from full check-in)
- **`TrendsScreen.tsx`** — Recharts visualizations of score history
- **`ProfileScreen.tsx`** — export (JSON/CSV/TXT), error log viewer, settings modals
- **`src/components/checkin/games/`** — Go/No-Go, Attention, Memory, Counting mini-games
- **`src/components/ui/`** — 49 Radix UI wrapper components
- **`src/utils/errorLogger.ts`** — on-device error logger (stores to `mindcheck_error_logs`)

### Error Logging

The app has a built-in on-device crash reporter accessible at Profile → Error Logs. It hooks `window.onerror`, `unhandledrejection`, and a React error boundary to capture and store the last 50 errors in localStorage. Use `errorLogger.log(type, message, error)` to log manually. Error types: `react`, `js`, `promise`, `storage`, `manual`.

### App Version

Single source of truth: `src/utils/appConfig.ts` — `APP_VERSION = '1.9.2'`. Used in error logs and data exports.

### Styling Conventions

- Max-width container: 390px (iPhone standard), set in `vite.config.ts`
- Bottom nav clearance: `pb-20` (80px)
- Dark mode: toggled via `className` conditionals + Tailwind `dark:` prefix; state lives in `App.tsx` and persists to `mindcheck_dark_mode`
- Color palette: dark brown `#1a1410`, light cream `#ece5de`

### Supabase (Disabled)

The backend integration exists in `src/supabase/` and `src/utils/dataSync.ts` but is not active. The project ID (`tcnoazrgklhtxxhxszwu`) and table name (`kv_store_d0949dc0`) are in `src/supabase/info.ts`. Do not re-enable sync without reviewing the privacy implications — it was intentionally disabled.

### Vite Config Notes

`vite.config.ts` defines path aliases for Radix UI components and Figma asset URLs. The chunk size warning threshold is set to 2000 KB due to the large Radix UI dependency footprint.
