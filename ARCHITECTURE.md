# MindCheck — Architecture & Developer Guide

This repo is the **patient's phone app**. Patients use it at home, between clinic
visits, to track their mental health — daily check-ins, journaling, cognitive
games, and questionnaires. Whatever they record is synced up to a shared cloud
database so their clinic can see it.

This guide is for any developer working in **this repo**. It explains what each
file does, how the app works internally, and how it exchanges data with the
outside world. It does not document the clinic-side app that reads this data —
only the boundary this repo writes to.

- **Tech:** React + TypeScript, built with Vite, shipped as a PWA (and an Android
  APK via Capacitor).
- **Local storage:** patient data is stored **encrypted on-device first**
  (IndexedDB vault), then mirrored to the shared cloud database.

---

## 1. The one thing this repo talks to (the boundary)

MindCheck's only external connection is a shared **Firebase** project (Firestore +
Auth). It does not call the clinic app directly — it just writes into the shared
database, and the clinic app reads it back later.

- **Auth:** the patient signs in with a login that was created for them on the
  clinic side. Email = `{phone}@participant.kiosk.local`, password = their phone
  number (the initial credential). MindCheck never creates accounts — it only
  signs in.
- **Firestore (what this app writes):** everything the patient produces goes under
  their own participant record:

```
participants/{participantId}          ← participantId = their phone number
  ├─ mc_questionnaires/{visitBucket}   PHQ-9 / GAD-7 / PSS / RSES totals + per-item answers
  ├─ mc_ema/{YYYY-MM-DD-timeOfDay}     daily mood/distress/energy/sleep check-in
  ├─ mc_journal/{entryId}              free-text entry + emotions
  ├─ mc_games/{timestamp-type}         cognitive game metrics
  └─ mc_summary/{from_to}              journal digest for a visit window
```

The clinic app reads these back to show the doctor; the security rules let the
owning patient write and their clinic's physician read. This app only needs to
know it writes them correctly.

---

## 2. What the patient does (the four data types)

| In-app action | Internal name | Local key (vault) | Synced to |
|---------------|---------------|-------------------|-----------|
| Quick daily check-in | **EMA** | `mindcheck_ema_data` | `mc_ema` |
| Full check-in (4 questionnaires + games) | questionnaires + games | `mindcheck_history`, `mindcheck_game_metrics` | `mc_questionnaires`, `mc_games` |
| Journal entry | journal | `mindcheck_journal_entries_all` | `mc_journal` |
| Mini-games | games | `mindcheck_game_metrics` | `mc_games` |

"EMA" is just the technical name for the **quick daily check-in**. The **full
check-in** is the longer flow that runs the standardized questionnaires and
interleaves games.

---

## 3. Files, by area

### Entry & shell
- `src/main.tsx` — app bootstrap.
- `src/App.tsx` — **the orchestrator.** No routing library; navigation is
  state-driven (`currentTab` + modal flags). Holds the auth gate, the vault
  bootstrap, and the sync triggers (see §5).
- `src/firebase.ts` — Firebase init; auth helpers (`loginWithPhonePassword`,
  `phoneToEmail`, `normalizePhone`); push-notification helpers.
- `src/components/LoginScreen.tsx` — the phone/password login UI.

### Identity (linking this device to a clinic patient)
- `src/utils/patientIdentity.ts` — after login, reads `users/{uid}.participantId`
  to learn which clinic patient this is, and caches it. This id is what every sync
  writes under. `clearParticipantId()` runs on sign-out so a shared device doesn't
  carry identity to the next patient.

### Data capture (the flows that produce data)
- `src/components/CheckInFlow.tsx` — the **full check-in**. Randomizes the order of
  PHQ-9/GAD-7/PSS/RSES, interleaves games, offers a journal. `persistQuestionnaireResult`
  saves each questionnaire's score **and its raw per-question answers** to
  `mindcheck_history` the moment its score screen appears.
- `src/components/ema/EMAFlow.tsx` — the **quick daily check-in** (EMA). Saves to
  `mindcheck_ema_data` when a section's last question is answered.
- `src/components/MiniGame.tsx` + `src/components/games/` — the cognitive games;
  metrics saved via `saveGameMetrics`.
- Journal entries are written from the check-in / journal screens into
  `mindcheck_journal_entries_all`.
- `src/data/checkInQuestions.ts` — the question text and answer options for each
  questionnaire (used to render, and to attach readable text to synced answers).
- `src/data/emaQuestions.ts` — the EMA questions.

### Scoring
- `src/utils/phq9Score.ts`, `gad7Score.ts`, `pssScore.ts`, `rsesScore.ts` — pure
  scoring functions (each has a matching `.test.ts`).

### Storage
- `src/utils/secureVault.ts` — the **encrypted on-device store** (IndexedDB + Web
  Crypto). All patient data goes through here. `getSensitiveValueSync` reads an
  in-memory cache the vault fills on unlock; `setSensitiveValue` encrypts and
  persists.
- `src/utils/dataSync.ts` — thin save/read helpers over the vault
  (`saveQuestionnaireResponse`, `saveGameMetrics`, …).

### The sync (this app → the shared database)
- `src/utils/kioskSync.ts` — **`syncToKioskDb()`**. Mirrors everything in the vault
  up to `participants/{participantId}/mc_*`. Uses deterministic document ids so
  re-syncing is idempotent. Groups same-visit questionnaire entries into one
  document and expands raw answers into readable `{question, answer}` pairs. If the
  device isn't linked to a clinic patient yet, it skips silently.

### Read-only screens & settings
- `src/components/CheckInHub.tsx` / `HomeScreen.tsx` — home tab.
- `src/components/TrendsScreen.tsx` — charts of the patient's own history.
- `src/components/ProfileScreen.tsx` — settings, export, error logs, the signed-in
  clinic-identity card, and sign-out.
- `src/utils/errorLogger.ts` — on-device crash log (Profile → tap the version 5× →
  Error Logs).

---

## 4. How a patient signs in (start to finish)

1. `App.tsx` shows `LoginScreen` until a real user is signed in **and** the vault
   is unlocked.
2. `firebase.ts.loginWithPhonePassword` turns the phone number into the login email
   (`normalizePhone` strips `+91`, leading zeros, spaces, so any stored format
   matches) and signs in.
3. `patientIdentity.ts` reads `users/{uid}.participantId` and caches it.
4. The app is now usable; from here, everything the patient does is saved locally
   and synced up under that participant id.

There is no self-registration here by design — accounts are created on the clinic
side.

---

## 5. When does data sync? (the timing that matters)

Data is saved to the encrypted vault first, then mirrored up. `syncToKioskDb()`
runs:

1. **On login, once the vault is ready.** `App.tsx` waits for BOTH a signed-in user
   AND `vaultStatus === 'ready'` before syncing — the vault unlocks
   asynchronously, and syncing before it's ready would read an empty cache and
   upload nothing.
2. **Right after each save point** — completing a full check-in, an EMA section, a
   journal entry, or a game each calls `syncToKioskDb()` immediately after its own
   vault write. Some flows (EMA, games) never reach a single global "complete"
   callback, so each must trigger its own sync.

If you add a new data type: save it to the vault **and** trigger a sync at that
save point, or it will only appear on the patient's next login.

---

## 6. Running & building

```bash
npm install
npm run dev      # Vite dev server (http://localhost:3000)
npm run build    # production build → dist/
```

Firebase config comes from `VITE_FIREBASE_*` env vars in `.env` (safe to expose —
security is enforced by the database rules, not by hiding the config).

`scripts/` holds Node helpers (e.g. `test_full_flow.mjs` writes a week of data
end-to-end). Run with `node scripts/<name>.mjs`. See `CLAUDE.md` for deployment.

---

## 7. Gotchas

- **Patient data lives in the encrypted vault (IndexedDB), not plain
  localStorage.** In localStorage you'll only see `mindcheck_*` flags and the sync
  queue; the real entries are behind the vault.
- **Sync failures are logged, not silent** — they're `console.warn`'d; watch the
  console when debugging "nothing showed up on the clinic side".
- **The full check-in and the daily EMA are different flows** that save to
  different keys. "I did a check-in but EMA is empty" usually means one ran and not
  the other.
