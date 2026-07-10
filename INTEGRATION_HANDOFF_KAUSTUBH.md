# MindCheck ↔ Kiosk integration — handoff for Kaustubh

This documents what I built in **MindCheck** (patient app) and exactly what the
**Kiosk** must provide so the two connect. **I did not touch any Kiosk code** — this
is the contract for your side.

---

## 1. The model (agreed with mam)

- **Kiosk** (you): staff creates the patient's account at V1 (phone + password),
  collects the questionnaire + EEG.
- **MindCheck** (me): patient logs in with that phone + password, records daily
  **EMA + journal + games** (all optional). Data is written into the **same Firebase
  project**, under the patient's participant record.
- Link between the two = the patient's **Firebase Auth account** (created by you).

---

## 2. What I changed in MindCheck (done)

| File | Change |
|---|---|
| `src/firebase.ts` | Removed anonymous sign-in. Added phone+password login (`loginWithPhonePassword`), persistent session, `logout`, `onAuthChange`, `getCurrentUid`, and phone→email helpers. |
| `src/components/LoginScreen.tsx` | Phone + password login screen (new). |
| `src/utils/patientIdentity.ts` | Resolves the patient's `participantId` by matching `participants.authUid == uid` (new). |
| `src/utils/kioskSync.ts` | Writes EMA/journal/games/summary to `participants/{id}/mc_*` (new). |
| `src/App.tsx` | Auth gate — app requires login; on login, mirrors local data to the shared DB. |

The app **builds clean** and stays logged in across restarts.

---

## 3. What YOU need to do on the Kiosk (the contract)

### 3.1 Create the patient's auth account at enrollment
Create a Firebase Auth **email/password** user where the email is derived from the
phone number. **The format must match exactly what MindCheck logs in with:**

```
email    = <normalizedPhone> + "@mindcheck.clinic"
password = whatever you set (hand it to the patient)
```

**Phone normalization (must match MindCheck's `normalizePhone`):**
- digits only (strip spaces, `+`, `-`)
- strip leading zeros
- strip a leading `91` if the remainder is 10 digits (India country code)

Example: `+91 98912 34567` → `9891234567` → email `9891234567@mindcheck.clinic`

> The domain `mindcheck.clinic` is a constant (`CLINIC_AUTH_DOMAIN` in
> `src/firebase.ts`). If you want a different domain, tell me and I'll change it —
> but both sides must use the same one.

### 3.2 Link the account to the participant
On the participant doc, store the new account's UID and the phone:

```
participants/{participantId}
   clientId, createdAt        (existing)
   authUid   = <patient's Firebase Auth UID>     ← ADD
   phone     = <normalized phone>                ← ADD
```

MindCheck finds the patient's `participantId` by querying
`participants where authUid == <logged-in uid>`. **Without `authUid`, MindCheck
can't link the data.** (Add a Firestore index for `participants.authUid` if needed.)

### 3.3 Password reset
Let staff reset a patient's password from the dashboard (patients are told to
contact the clinic; MindCheck has no self-service reset).

### 3.4 Firestore rules for the `mc_*` subcollections
A patient may read/write **only their own** data; staff may read it:

```
match /participants/{pid}/{sub}/{docId} {
  allow read, write: if isSignedIn()
      && get(/databases/$(database)/documents/participants/$(pid)).data.authUid == request.auth.uid
      && sub in ['mc_ema','mc_journal','mc_games','mc_summary'];
  allow read: if /* physician/admin for this participant's client */;
}
```
(Adjust to your existing rule helpers — the intent: patient owns their `mc_*`, staff can read.)

### 3.5 Confirm ONE shared Firebase project
MindCheck must point at the **same** project as the Kiosk. Send me the Kiosk
project's web config (`VITE_FIREBASE_*` values) and I'll set MindCheck's `.env`.

---

## 4. The data MindCheck writes (schema to read in the clinician view)

```
participants/{participantId}
  ├─ mc_ema/{YYYY-MM-DD_timeOfDay}
  │     { date, time_of_day, questions[], _ts }
  ├─ mc_journal/{entryId}
  │     { date, journal_text, emotions[], mood_intensities{}, hashtags[],
  │       prompt_shown, has_image, word_count, _ts }
  ├─ mc_games/{timestamp-type}
  │     { game_type, played, metrics{}, _ts }
  └─ mc_summary/{fromDate_toDate}          ← journal digest for a visit window
        { from_date, to_date, entry_count, daily[]:{date,dominant_mood,emotions[],snippet}, _ts }
```

- **Doc IDs are deterministic** → re-sync never duplicates.
- For the "journal summary at next visit," read `mc_summary` (or build your own from
  `mc_journal`). MindCheck writes a simple chronological digest; an AI narrative can
  be added later without changing the schema.
- Everything is **optional** — a patient may have EMA but no journal that day, etc.

---

## 5. Open items to confirm with me

1. Shared Firebase project config (send me `VITE_FIREBASE_*`).
2. Login email domain — `mindcheck.clinic` OK, or change it?
3. Schema location — I used **`mc_*` subcollections under the participant**. If you'd
   rather have top-level collections with a `participantId` field (like your
   `sessions`), tell me and I'll switch.
4. Who generates the journal summary — MindCheck writes `mc_summary`; fine, or do you
   want to build it Kiosk-side from `mc_journal`?

---

## 6. TL;DR for you

> Create each patient as a Firebase Auth user `("<normalizedPhone>@mindcheck.clinic",
> password)`, store `authUid` + `phone` on `participants/{id}`, allow staff password
> reset, and add rules so a patient owns their `participants/{id}/mc_*` data. MindCheck
> handles login and writes EMA/journal/games/summary there. Send me the shared Firebase
> config and confirm the domain.
