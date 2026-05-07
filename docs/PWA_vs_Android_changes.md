# PWA vs Android — Feature Delta

Changes made to the PWA build that are **not yet in the Android app**.  
Use this as a checklist when porting changes back to the Android codebase.

---

## 1. Support Resources — Section Restructure

**File:** `src/components/modals/CrisisResourcesModal.tsx`  
**Status:** Done in PWA · Pending in Android

The single flat list of resources was reorganised into 3 labelled sections:

### Before (Android current state)
- CMHW card (standalone, above everything)
- "Crisis Support Lines" heading
  - Health Center Emergency
  - YourDOST
  - Tele MANAS, KIRAN, Vandrevala, iCALL
- "Other resources" bullet list

### After (PWA)
**Institute Support**
- Center For Mental Health and Wellbeing (CMHW)
- Health Center Emergency
- YourDOST
- Treadwill *(new — see item 2)*

**Crisis & 24/7 Helplines**
- Tele MANAS
- KIRAN
- Vandrevala Foundation
- iCALL

**Other Resources**
- Existing bullet points (unchanged)

---

## 2. Treadwill Card — New Resource Added

**File:** `src/components/modals/CrisisResourcesModal.tsx`  
**Status:** Done in PWA · Pending in Android

A new card was added under **Institute Support**, after YourDOST.  
Styled identically to the YourDOST card (name, description, Website button).

| Field | Value |
|-------|-------|
| Name | Treadwill |
| Description | Free online program for anxiety & depression — IIT Kanpur |
| Website button | https://www.treadwill.org/open (opens in new tab) |

This change appears in all 3 places the modal is used:
- After a high distress score (CheckInFlow)
- Home page "Need Support" button (CheckInHub)
- Profile → Support section (ProfileScreen)

---

## 3. Notification Preferences — PWA (Firebase FCM) vs Android (Capacitor local)

**Files:**
- `src/utils/notificationManager.ts`
- `src/components/NotificationPreferences.tsx`
- `src/components/OnboardingFlow.tsx`
- `functions/index.ts` *(Cloud Functions — PWA backend)*

**Status:** Both platforms have notifications, but via entirely different stacks. PWA Cloud Functions are **deployed** (Firebase Blaze plan active, project `mindcheck-5e4f5`).

---

### PWA — Firebase Cloud Functions + FCM push

Notifications are delivered server-side via Firebase. The app is not required to be open.

**No in-session layer:** The PWA previously had a client-side setTimeout notification system. This was removed — Cloud Functions are now the sole delivery mechanism. Android never had an in-session layer.

**Profile → "Check-in & Reminders"** section:
- Frequency: Weekly / Twice a week / Monthly
- Preferred time: Morning 9AM / Afternoon 2PM / Evening 8PM
- Reminders toggle: requests Web Notification API permission on first enable; shows inline help text if denied or unsupported

**Onboarding:** saves preferences + requests permission. If granted, registers the device's FCM token in Firestore under `/users/{anonymousUID}`.

**Delivery model:**
- 3 Cloud Functions run daily on a cron schedule:
  - `morningReminders` — 9:00 AM IST
  - `afternoonReminders` — 2:00 PM IST
  - `eveningReminders` — 8:00 PM IST
- Each function queries Firestore for users with `reminders == true` and the matching `timePreference` slot, then checks `lastNotifiedAt` against the user's chosen frequency interval before sending
- Sent via FCM using `admin.messaging().send()` — real push notifications even when the app is fully closed
- After sending, `lastNotifiedAt` is updated in Firestore to enforce the frequency interval
- Stale/invalid tokens are auto-deleted from Firestore on send failure

**Firestore composite index:** The query filters on two fields (`reminders == true` + `timePreference == slot`). If Cloud Functions fail on their first run, Firebase will log a console link to auto-create the required composite index.

**Preference changes from profile:**
- Changing frequency or time → `updateDoc` only (preserves `lastNotifiedAt`, no surprise immediate notification)
- Toggling reminders OFF → FCM token deleted from Firestore; Cloud Functions stop sending
- Toggling reminders ON → FCM token re-registered; `lastNotifiedAt` reset to null (next slot fires)

**Notification copy** — 3 gentle variants per time slot, picked randomly at send time:

| Slot | Title | Body |
|------|-------|------|
| Morning | Good morning | How are you feeling as the day begins? A gentle check-in is here whenever you're ready. |
| Morning | A gentle start | Taking a few minutes for yourself this morning can make the whole day feel steadier. |
| Morning | Morning moment | Your feelings matter. No pressure — just a quiet space for you. |
| Afternoon | Midday pause | How's your day unfolding? A quick check-in can help you feel more grounded. |
| Afternoon | How are you doing? | Pause for a moment — checking in with yourself is a small act of care that adds up. |
| Afternoon | Afternoon check-in | Your mental wellbeing deserves as much attention as your to-do list. Take a breath. |
| Evening | Evening reflection | You showed up today. Before you rest, take a quiet moment to check in with yourself. |
| Evening | Winding down | How are you feeling tonight? Take a gentle moment to check in with yourself. |
| Evening | Good evening | A gentle check-in before the day closes. You deserve this small moment of care. |

---

### Android — Capacitor local notifications

Android uses Capacitor's local notification plugin (`@capacitor/local-notifications`). Scheduling is done on-device; no server involved.

**Key differences vs PWA:**

| | PWA | Android |
|---|---|---|
| Delivery | Firebase FCM (server push) | Capacitor local (on-device schedule) |
| Works when app is closed | Yes | Yes |
| Requires server | Yes (Firebase Blaze) | No |
| Token registration | Firestore `/users/{uid}` | N/A |
| Frequency enforcement | `lastNotifiedAt` in Firestore | Scheduled alarm intervals |
| In-session layer | None (removed) | None |
| Notification copy | 9 variants in `functions/index.ts` | Port the 9 variants from the table above |

---

## 4. Full Check-in — 4 Games Per Session (bug fix)

**File:** `src/components/CheckInFlow.tsx`
**Status:** Fixed in PWA · Verify in Android

The game sequence was initialised with `.slice(0, 3)` on a 4-item array, meaning the 4th questionnaire (GAD-7, added later) always used whatever happened to sit at index 3 in the unshuffled array rather than a unique shuffled pick.

### Before (bug)
```ts
const randomGames = shuffleArray<GameType>(['gonogo', 'attention', 'memory', 'counting']);
setGameSequence(randomGames.slice(0, 3)); // GAD-7 had no valid game
```

### After (fixed)
```ts
const randomGames = shuffleArray<GameType>(['gonogo', 'attention', 'memory', 'counting']);
setGameSequence(randomGames); // all 4 games, each exactly once per session
```

**Android note:** If the Android CheckInFlow uses a similar slice, apply the same fix.

---

## 5. How It Works Modal — Content Update

**File:** `src/components/modals/HowItWorksModal.tsx`
**Status:** Updated in PWA · Apply equivalent copy to Android (if a similar screen exists)

Full rewrite of structure and copy:

| Before | After |
|--------|-------|
| Separate card per questionnaire with score ranges | Single "Questionnaires" card listing all 4 with question counts only |
| "Daily Check-in" section | Renamed to "Day Logs" throughout |
| Generic game descriptions | Accurate per-game descriptions (Go/No-Go, Attention, Digit Span, Counting) |
| Privacy text mentioned server transmission | Updated: health data stays on-device; token only used for reminders |
| Journal described as post-check-in only | Clarified: accessible any time from home screen, also prompted after check-in |

Game descriptions (use these if Android has a similar screen):
- **Go/No-Go:** tap or hold back based on the color of the shape shown
- **Attention:** tap each glowing square in the order it lights up
- **Digit Span:** recall a sequence of numbers in the same order
- **Counting:** count backwards from a number, subtracting 7 each time

---

## 6. Privacy Policy — Notification Disclosure

**Files:** `docs/privacy-policy.md`, `src/components/modals/AboutModal.tsx`
**Status:** Updated in PWA · Review Android in-app privacy text

The original privacy policy stated all data stays on-device and no servers are used. This became inaccurate once FCM notifications were added. Updated sections:

**Sections changed in `docs/privacy-policy.md`:**
- **2.1** — Added notification token as a data item (PWA only, opt-in)
- **2.2** — Clarified that health data is never transmitted; FCM token is the only external data point
- **3** — Added: FCM token + notification prefs stored in Firestore under anonymous UID; deleted immediately when reminders are turned off
- **4** — Added notification delivery as a use case
- **10** — Added Firebase (Google) as a third-party service, scoped to notification delivery only

**What is and is not sent to Firebase:**

| Data | Sent to Firebase? |
|------|-----------------|
| Check-in responses (PHQ-9, GAD-7, PSS, RSES) | No |
| Journal entries | No |
| Game scores | No |
| Day log entries | No |
| Anonymous User ID | Yes (as Firestore document key, only if reminders enabled) |
| FCM device token | Yes (only if reminders enabled) |
| Notification prefs (frequency, time slot) | Yes (only if reminders enabled) |

**In-app text updated in `AboutModal.tsx`** ("Privacy First" section):
- Removed: "We don't have servers, accounts, or any way to access your information"
- Updated to: accurately describe that health data stays on-device; only an anonymous notification token reaches Firebase if reminders are on

**Android note:** Android uses local notifications only — no FCM token, no Firestore. The Android privacy text ("all data stays on-device") remains accurate as-is.

---

---

## 7. AttentionGame — Full Android Port (Spatial Span / Corsi Block)

**File:** `src/components/games/AttentionGame.tsx`  
**Status:** Replaced in PWA · Android already has the full implementation

The PWA previously had a 32-line wrapper that delegated to `src/components/checkin/games/AttentionGame` and returned fabricated metrics. It has been replaced with a full self-contained Spatial Span (Corsi Block Tapping) implementation ported from the Android codebase.

**New GameMetrics shape:**
```ts
{
  totalTrials: number;
  correctSequences: number;
  longestSequence: number;
  averageSpan: number;
  accuracy: number;
  averageReactionTime: number;
}
```

**Key implementation details:**
- 4×4 grid of blocks; sequences flash in order, user must tap them back in the same order
- Adaptive difficulty: span increases on success, decreases on failure
- `inputStartTimeRef = useRef<number | null>(null)` for reaction time tracking
- `CompletionSummary.tsx` updated: `attentionMetrics.hits` → `correctSequences`, `attentionMetrics.misses` → removed, added `longestSequence` + `averageSpan`

---

## 8. MemoryGame — Full Android Port (Digit Span)

**File:** `src/components/games/MemoryGame.tsx`  
**Status:** Replaced in PWA · Android already has the full implementation

The PWA previously had a 32-line wrapper with fake metrics. Replaced with a full self-contained Digit Span implementation ported from Android.

**New GameMetrics shape:**
```ts
{
  totalTrials: number;
  correctRecalls: number;
  averageDigitSpan: number;
  longestSpan: number;
  averageReactionTime: number;
  accuracy: number;
}
```

**Key implementation details:**
- Digits shown one at a time on screen; user inputs them back via number pad
- Adaptive difficulty: span increases on correct recall, decreases on error
- `recallStartTime = useRef<number>(0)` for reaction time tracking
- `CompletionSummary.tsx` updated: `memoryMetrics.maxSequenceLength` → `longestSpan`, `memoryMetrics.incorrectRecalls` → removed, added `averageDigitSpan`

---

## 9. CountingGame — incorrectSteps Bug Fix

**File:** `src/components/games/CountingGame.tsx`  
**Status:** Fixed in PWA · Verify in Android

`incorrectSteps` was always `0` or `1` (only tracked the last step). Fixed by adding a `useState` counter and accumulating with functional updates.

### Before (bug)
```ts
// No state — computed inline at the end, only captured last step
incorrectSteps: correct ? 0 : 1,
```

### After (fixed)
```ts
const [incorrectSteps, setIncorrectSteps] = useState(0);

// In handleSubmit:
if (correct) { setCorrectSteps(prev => prev + 1); }
else         { setIncorrectSteps(prev => prev + 1); }

// Final metrics:
incorrectSteps: incorrectSteps + (correct ? 0 : 1),
```

**Android note:** Check if Android's CountingGame has the same accumulation bug.

---

## 10. Firebase Cloud Sync Architecture (PWA-only)

**Files:**
- `src/utils/firebaseSync.ts` *(new)*
- `src/utils/cloudSync.ts` *(new)*
- `firestore.rules`
- `src/components/ProfileScreen.tsx`
- `src/components/ema/EMAFlow.tsx`
- `src/components/modals/DataSyncPreferenceModal.tsx`
- `src/components/checkin/CompletionSummary.tsx`

**Status:** PWA-only feature · Not applicable to Android (Android is local-only)

### What it does

Users are shown a one-time consent modal ("Support Mental Health Research") after their first check-in or EMA completion. If they agree, anonymized data is synced to Firebase Firestore under their anonymous Auth UID. The toggle is also accessible any time via Profile → Data & Privacy → Cloud Backup.

### Firestore collections under `/users/{uid}/`

| Collection | Contents | Write method |
|---|---|---|
| `questionnaires` | questionnaire_type, checkin_type, individual_question_scores, total_score, severity_label, _ts | `addDoc` (live), `setDoc` w/ deterministic ID (backfill) |
| `games` | game_type, checkin_type, played, metrics{}, _ts | same |
| `journal` | checkin_type, prompt_shown, prompt_type, journal_text, word_count, has_image, emotions[], mood_intensities{}, hashtags[], _ts | same (uses existing entry.id) |
| `daylogs` | time_of_day, questions[], _ts | same |
| `activity` | event, metadata{}, _ts | `addDoc` only |

### Live writes (real-time during check-in)
- `CheckInFlow.tsx` → `saveQuestionnaire()`, `saveGame()`, `saveJournal()` from `firebaseSync.ts`
- `GamesScreen.tsx` → `saveGame()` with `checkin_type: 'individual'`
- `EMAFlow.tsx` → `saveDayLog()`
- `App.tsx` → `saveJournal()` with `checkin_type: 'individual'` for standalone journal

### Historical backfill (`uploadAllLocalData`)
On first enable (and on every re-enable), `cloudSync.ts` bulk-uploads all localStorage history using `setDoc` with deterministic document IDs:
- Questionnaires: `{timestamp}-{phq9|gad7|pss|rses}`
- Games: `{timestamp}-{type}`
- Journals: `{entry.id}`
- Daylogs: `{dateKey}-{timeOfDay}`

This makes repeated uploads idempotent — re-enabling sync never creates duplicates.

### Offline queue
Writes that fail (e.g. no connection) are stored in `mindcheck_firestoreQueue` in localStorage and flushed via `flushOfflineQueue()` on next `app_open`.

### Security rules
`firestore.rules` — users can only read/write their own subtree:
```
match /users/{userId} {
  allow read, write: if request.auth.uid == userId;
  match /{collection}/{document=**} {
    allow read, write: if request.auth.uid == userId;
  }
}
```

### checkin_type values
| Caller | Value |
|---|---|
| CheckInFlow — guided (full) | `'guided'` |
| CheckInFlow — individual questionnaire | `'individual'` |
| GamesScreen — direct game play | `'individual'` |
| App.tsx — standalone journal | `'individual'` |
| Historical backfill — `checkInType === 'full'` | mapped to `'guided'` |
| Historical backfill — any other value | mapped to `'individual'` |

---

## 11. Privacy Policy — Cloud Sync Disclosure

**Files:** `PRIVACY_POLICY.md`, `docs/PWA_vs_Android_changes.md`  
**Status:** Updated in PWA · Android privacy text unchanged (Android remains local-only)

The privacy policy was updated to reflect the optional cloud sync feature. New/changed sections:

| Section | Change |
|---|---|
| 2.2 | Removed blanket "no external servers" claim; scoped to default (non-cloud) users |
| 2.3 (new) | Full section: what is synced, anonymization via Firebase Anonymous Auth UID, research purpose, user control |
| 3 | Split into 3.1 Local (all users) and 3.2 Cloud (opted-in) with Firebase Firestore details |
| 4 | Split into 4.1 Local use and 4.2 Research use (opted-in) |
| 5.2 | Added cloud data deletion request process (30-day SLA) |
| 6 | Split into 6.1 Local and 6.2 Cloud (Firebase Security Rules, anonymous auth, TLS + at-rest encryption) |
| 10 | Added Firebase/Google LLC as data processor for opted-in users |

**What is and is not sent to Firebase (cloud-enabled users):**

| Data | Sent to Firebase? |
|---|---|
| PHQ-9, GAD-7, PSS, RSES scores + answers | Yes (if cloud enabled) |
| Journal entries (text, emotions, hashtags) | Yes (if cloud enabled) |
| Journal photo attachments | No |
| Game performance metrics | Yes (if cloud enabled) |
| Day log / EMA responses | Yes (if cloud enabled) |
| Activity events | Yes (if cloud enabled) |
| Name, email, or any PII | Never |
| Anonymous Firebase Auth UID | Yes (as Firestore key) |
| FCM notification token | Yes (if reminders enabled — unchanged from item 6) |

**Android note:** Android is local-only. The Android privacy text remains accurate as-is.

---

## 12. OnboardingFlow — Cloud Sync Consent Modal

**File:** `src/components/OnboardingFlow.tsx`
**Status:** PWA-only · Not applicable to Android (Android is local-only)

The `DataSyncPreferenceModal` ("Support Mental Health Research") is now shown during onboarding — on top of `BaselineScreen` after the PreferencesScreen step — if the user hasn't already seen it.

**Trigger logic:** `mindcheck_sync_preference_asked !== 'true'`. The modal is shown from 3 places; only the first one the user reaches fires:
1. OnboardingFlow → BaselineScreen (new)
2. CompletionSummary → after first check-in (2s delay)
3. EMAFlow → after first Day Log completion

**"I Agree":** enables cloud sync, bulk-uploads all existing localStorage data to Firestore.
**"Not Now":** declines sync; user can re-enable at any time via Profile → Data & Privacy → Cloud Backup.

---

## 13. Export Format — Full Field Coverage (CSV & TXT)

**File:** `src/components/ProfileScreen.tsx` — `doExport()`
**Status:** Improved in PWA · Apply equivalent improvements to Android if export exists

The CSV and TXT export formats were overhauled to include all stored fields consistently across all data types.

### CSV changes
| Data type | Before | After |
|---|---|---|
| Check-ins | scores only | + check-in type, severity label per score, functional impairment answer |
| Journals | entry text (200 char cap) | + type, prompt, emotions with intensities, hashtags, full text (no cap) |
| Games | ISO timestamp | readable date |
| Day Logs | unchanged | unchanged (already complete) |

### TXT changes (narrative format)
- Section dividers (`═══════════════════════════════════════`)
- Check-ins: `PHQ-9 (Mood): 8/27 — Mild` format, functional impact included
- Games: multi-line readable metrics, readable date
- Journals: prompt shown, emotions with intensities (e.g. `Calm (4/5)`), full entry text word-wrapped at 72 chars, hashtags
- Day Logs: sorted by date, `▸ Morning check-in` style headers

**JSON:** unchanged — already exported everything.

---

## Notes
- `CrisisResourcesModal.tsx` is the single shared component for all 3 support resource surfaces. Editing it once propagates everywhere.
- `CrisisModal.tsx` (`src/components/checkin/CrisisModal.tsx`) is a separate, simpler modal — it was **not changed** in the PWA and does not appear in the 3 surfaces above.
- Items 7–9 (game ports and bug fixes) should be verified against the Android codebase — the Android versions may already be correct.
- Items 10–12 (cloud sync, updated privacy policy, onboarding consent) are PWA-only and do not apply to Android.
- Item 13 (export format) applies to Android if it has a data export feature.
