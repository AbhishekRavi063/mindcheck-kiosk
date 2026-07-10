// Pushes MindCheck's daily data (EMA, journal, games) into the SHARED Kiosk
// Firestore, under the patient's participant record, in MindCheck-owned `mc_*`
// subcollections. The Kiosk (clinician view) reads these back.
//
//   participants/{participantId}
//     ├─ mc_ema/{YYYY-MM-DD_timeOfDay}
//     ├─ mc_journal/{entryId}
//     ├─ mc_games/{timestamp-type}
//     └─ mc_summary/{from_to}          (journal digest for a visit window)
//
// Doc IDs are deterministic → re-syncing is idempotent (no duplicates). Data is
// still stored locally first (offline-friendly); this just mirrors it up.

import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { resolveParticipantId } from './patientIdentity';
import { getSensitiveValueSync } from './secureVault';

function pdoc(pid: string, sub: string, id: string) {
  return doc(db, 'participants', pid, sub, id);
}

const wordCount = (s: string) =>
  (s ?? '').trim().split(/\s+/).filter((w) => w.length > 0).length;

/** Mirror all local EMA/journal/games to the shared DB under this patient. */
export async function syncToKioskDb(): Promise<void> {
  const pid = await resolveParticipantId();
  if (!pid) return; // not linked to a clinic record yet — skip silently

  const ops: Promise<unknown>[] = [];

  // ── EMA (daily check-ins) ────────────────────────────────────────────────
  // mindcheck_ema_data = { "YYYY-MM-DD": [ { section, questions[] } ] }
  const emaData: Record<string, any[]> = getSensitiveValueSync('mindcheck_ema_data', {});
  for (const [dateKey, sections] of Object.entries(emaData)) {
    for (const section of sections ?? []) {
      const timeOfDay = section.section ?? section.time_of_day ?? 'unknown';
      ops.push(
        setDoc(pdoc(pid, 'mc_ema', `${dateKey}-${timeOfDay}`), {
          date: dateKey,
          time_of_day: timeOfDay,
          questions: section.questions ?? [],
          _ts: serverTimestamp(),
        }, { merge: true }).catch(() => undefined),
      );
    }
  }

  // ── Journal ──────────────────────────────────────────────────────────────
  const journals: any[] = getSensitiveValueSync('mindcheck_journal_entries_all', []);
  for (const j of journals) {
    if (!j.id) continue;
    const moods = Object.fromEntries(
      (j.emotions ?? []).map((e: string) => [e, (j.moodIntensities ?? {})[e] ?? 5]),
    );
    ops.push(
      setDoc(pdoc(pid, 'mc_journal', String(j.id)), {
        date: j.date ?? j.timestamp ?? null,
        journal_text: j.entry ?? '',
        emotions: j.emotions ?? [],
        mood_intensities: moods,
        hashtags: j.hashtags ?? [],
        prompt_shown: j.prompt ?? null,
        has_image: !!j.media,
        word_count: wordCount(j.entry ?? ''),
        _ts: serverTimestamp(),
      }, { merge: true }).catch(() => undefined),
    );
  }

  // ── Games ────────────────────────────────────────────────────────────────
  const games: any[] = getSensitiveValueSync('mindcheck_game_metrics', []);
  for (const m of games) {
    const { type, timestamp, userId: _uid, ...metrics } = m;
    const ts = String(timestamp ?? Date.now()).replace(/[:.]/g, '-');
    ops.push(
      setDoc(pdoc(pid, 'mc_games', `${ts}-${type}`), {
        game_type: type,
        played: true,
        metrics: Object.keys(metrics).length > 0 ? metrics : null,
        _ts: serverTimestamp(),
      }, { merge: true }).catch(() => undefined),
    );
  }

  await Promise.allSettled(ops);
}

/**
 * Build a journal digest for a date window (e.g. between two clinic visits) and
 * store it at participants/{pid}/mc_summary/{from_to}. Phase 1 = a simple
 * chronological digest (date + emotions + snippet). An AI narrative can replace
 * `snippet` later without changing the schema.
 */
export async function writeJournalSummary(fromDate: string, toDate: string): Promise<void> {
  const pid = await resolveParticipantId();
  if (!pid) return;

  const journals: any[] = getSensitiveValueSync('mindcheck_journal_entries_all', []);
  const daily = journals
    .map((j) => ({ ...j, _d: String(j.date ?? j.timestamp ?? '').slice(0, 10) }))
    .filter((j) => j._d >= fromDate && j._d <= toDate)
    .sort((a, b) => a._d.localeCompare(b._d))
    .map((j) => ({
      date: j._d,
      emotions: j.emotions ?? [],
      dominant_mood: (j.emotions ?? [])[0] ?? null,
      snippet: (j.entry ?? '').slice(0, 160),
    }));

  await setDoc(doc(db, 'participants', pid, 'mc_summary', `${fromDate}_${toDate}`), {
    from_date: fromDate,
    to_date: toDate,
    entry_count: daily.length,
    daily,
    _ts: serverTimestamp(),
  }, { merge: true });
}
