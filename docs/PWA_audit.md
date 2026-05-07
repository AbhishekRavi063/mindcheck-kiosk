# PWA Responsive Design Audit

**Date:** 2026-04-28  
**Scope:** `src/components/` — all `.tsx` files  
**Goal:** Identify hardcoded mobile widths, fixed pixel values, and layouts that break on desktop/tablet screens (>768px).

---

## 1. `max-w-[390px]` — App-Wide Mobile Lock (Most Critical)

The entire app is constrained to 390px. Appears in 16+ files.

| File | Notes |
|------|-------|
| `src/App.tsx` | Main app container — root of the constraint |
| `src/components/BottomNav.tsx` | Fixed nav bar with `fixed bottom-0 left-0 right-0 max-w-[390px]` |
| `src/components/CheckInHub.tsx` | Home screen container |
| `src/components/modals/CheckInBottomSheet.tsx` | Modal sheet |
| `src/components/modals/DeeperCheckInPrompt.tsx` | Modal prompt |
| `src/components/ConsentScreen.tsx` | Onboarding screen |
| `src/components/checkin/CheckInTypeSelector.tsx` | Check-in selector |
| `src/components/ema/EMAQuestionScreen.tsx` | Multiple occurrences |
| `src/components/ema/EMASectionSelector.tsx` | Multiple occurrences |
| `src/components/games/AttentionGame.tsx` | 4 occurrences |
| `src/components/games/CountingGame.tsx` | 4 occurrences |
| `src/components/games/GoNoGoGame.tsx` | 4 occurrences |
| `src/components/games/MemoryGame.tsx` | 4 occurrences |
| `src/components/onboarding/BaselineScreen.tsx` | Onboarding |
| `src/components/onboarding/PreferencesScreen.tsx` | Onboarding |
| `src/components/onboarding/WelcomeScreen.tsx` | Onboarding |

**Impact:** On desktop/tablet the app renders as a narrow 390px column centered in empty space.

---

## 2. Fixed-Size Image/Illustration Containers

| File | Value | Issue |
|------|-------|-------|
| `src/components/BreathingExercise.tsx` | `w-64 h-64` (256px) | Breathing circle stays tiny on desktop |
| `src/components/QuestionSlider.tsx` | `w-64 h-64` (256px) | Question illustration fixed size |
| `src/components/checkin/SemanticIllustrations.tsx` | `w-48 h-48` (192px) | SVG container doesn't scale |
| `src/components/onboarding/WelcomeScreen.tsx` | `w-48 h-48` (192px) | Welcome art stays small |
| `src/components/MoodTrends.tsx` | `h-64` (256px) | Chart height fixed |

---

## 3. Bottom Nav Positioning Conflict

`src/components/BottomNav.tsx` uses `fixed bottom-0 left-0 right-0` (spans full viewport) combined with `max-w-[390px] mx-auto`. On desktop this creates a centered 390px nav floating over a wide viewport — visually broken.

Same pattern in:
- `src/components/modals/CheckInBottomSheet.tsx`
- `src/components/modals/DeeperCheckInPrompt.tsx`

---

## 4. Modals with Fixed Max Heights

| File | Value |
|------|-------|
| `src/components/modals/AboutModal.tsx` | `max-h-[80vh]` / `max-w-md` |
| `src/components/modals/CitationsModal.tsx` | `max-h-[90vh]` |
| `src/components/modals/CrisisResourcesModal.tsx` | Fixed constraints |
| `src/components/modals/HowItWorksModal.tsx` | `max-w-md` |
| `src/components/ProfileScreen.tsx` | Fixed modal heights |

---

## 5. No Responsive Breakpoints Anywhere

The codebase has almost zero `md:` or `lg:` Tailwind variants. All spacing, padding, and layout values assume the 390px mobile viewport with no adaptation for wider screens.

---

## Root Cause

The 390px constraint is intentional for the Capacitor Android build (set in `vite.config.ts`), but it has been applied at the component level rather than only at the container level — making desktop/tablet adaptation much harder.

## Recommended Fix

Confine `max-w-[390px]` to a single wrapper in `App.tsx` and add responsive overrides:

```tsx
// App.tsx — single source of width constraint
<div className="max-w-[390px] md:max-w-2xl lg:max-w-4xl mx-auto">
  {/* all app content */}
</div>
```

Then remove the `max-w-[390px]` from every child component and add `md:` / `lg:` breakpoint variants for spacing, image sizes, and layout throughout.
