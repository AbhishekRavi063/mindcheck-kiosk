# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev        # Vite dev server at http://localhost:3000
npm run build      # Vite build only → dist/
npm run build:pwa  # Vite build + writes dist/.vercel/project.json (Vercel project ID)
npm run deploy     # Full deploy pipeline: build:pwa → prep-vercel-output.js → vercel deploy --prebuilt --prod
```

No lint or test commands are configured. TypeScript strict mode is disabled (`strict: false` in tsconfig.json).

## Deployment

**Always use `npm run deploy`** — never deploy manually with `vercel dist --prod` or similar.

The pipeline is:
1. `build:pwa` — Vite build + injects Vercel project.json into `dist/.vercel/`
2. `scripts/prep-vercel-output.js` — copies `dist/` → `.vercel/output/static/`, writes `config.json` with SPA fallback route (`src: '/(.*)'` → `/index.html`)
3. `vercel deploy --prebuilt --prod` — uploads the prebuilt output

**Target:** `mindcheck-pwa` project → **https://mindcheck-pwa.vercel.app**

**After deploying:** the device will still serve the old version from the service worker cache. To see updates, the user must **force-close and reopen the PWA** — the new service worker activates only on full app restart.

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

### Data Save Timing

Data is **not saved continuously** — it is written at specific completion points:

| Event | What gets saved | When |
|-------|----------------|------|
| Game score screen appears | Game metrics → `mindcheck_game_metrics` | `GameScoreScreen` `useEffect` on mount, via `saveGameMetrics()` |
| Full check-in completed | PHQ-9/GAD-7/PSS/RSES scores → `mindcheck_history` | `CompletionSummary` save helpers |
| Mid-game exit (back button) | **Nothing** | `onBack` is called; `onComplete` is never reached |
| Mid-check-in exit | **Nothing** | Questionnaire answers are in-memory only until `CompletionSummary` |

If the user quits mid-game, that game's data is lost. If they quit after a game's score screen appears, that game is saved but any incomplete questionnaires are not.

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
| `mindcheck_dark_mode` | Dark mode toggle state |
| `mindcheck_cloud_backup_enabled` | `'true'`/`'false'` — user consent for Firebase cloud sync |
| `mindcheck_sync_preference_asked` | `'true'` once the user has been shown the sync prompt |

### Component Hierarchy

- **`App.tsx`** — root orchestrator: tab state, modal states, onboarding flow, dark mode, journal deduplication on startup
- **`CheckInHub.tsx`** — home tab; daily quotes, week calendar, navigation to other flows
- **`CheckInFlow.tsx`** — full check-in: randomizes questionnaire order (PHQ-9, GAD-7, PSS, RSES), interleaves 3 games, optional journal prompt
- **`EMAFlow.tsx`** — lightweight daily check-in (separate from full check-in)
- **`TrendsScreen.tsx`** — Recharts visualizations of score history
- **`ProfileScreen.tsx`** — export (JSON/CSV/TXT), error log viewer, settings modals
- **`src/components/games/`** — Go/No-Go, Attention, Memory, Counting mini-games (GoNoGoGame, AttentionGame, MemoryGame, CountingGame, CognitiveGame)
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

### Firebase (Active)

Firebase is live and used for two things:

**1. Push notifications (FCM)** — always active if the user grants notification permission. `src/firebase.ts` exports `requestFCMToken()` and `revokeFCMToken()`. The Workbox service worker (`sw.js`) includes `sw-push.js` via `importScripts` to handle incoming push events. Anonymous auth (`signInAnonymously`) is eagerly started on module load.

**2. Cloud backup (user-consented)** — `src/utils/cloudSync.ts`. Gated by `localStorage.getItem('mindcheck_cloud_backup_enabled') === 'true'`. When enabled, `uploadAllLocalData()` bulk-uploads questionnaire history, game metrics, journal entries, and EMA data to Firestore under `users/{uid}/` with deterministic doc IDs (idempotent upserts). The user can enable/disable this in settings; it is off by default.

Firebase config is read from `VITE_FIREBASE_*` env vars (set in `.env`; values are safe to expose — security enforced by Firestore Rules).

### Supabase (Disabled)

`src/supabase/` and `src/utils/dataSync.ts` exist but cloud sync is hardcoded to `false` — none of this code runs. Project ID `tcnoazrgklhtxxhxszwu`, table `kv_store_d0949dc0` in `src/supabase/info.ts`. Do not re-enable without reviewing privacy implications.

### Vite Config Notes

`vite.config.ts` defines path aliases for Radix UI components and Figma asset URLs. The chunk size warning threshold is set to 2000 KB due to the large Radix UI dependency footprint.
