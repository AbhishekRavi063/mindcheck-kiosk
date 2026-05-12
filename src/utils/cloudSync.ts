import { db, getAuthUID } from '../firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';

const SYNC_KEY  = 'mindcheck_cloud_backup_enabled';
const ASKED_KEY = 'mindcheck_sync_preference_asked';

export function isCloudSyncEnabled(): boolean {
  return localStorage.getItem(SYNC_KEY) === 'true';
}

function severityLabel(type: 'phq9' | 'gad7' | 'pss' | 'rses', score: number): string {
  switch (type) {
    case 'phq9':
      if (score <= 4)  return 'minimal';
      if (score <= 9)  return 'mild';
      if (score <= 14) return 'moderate';
      if (score <= 19) return 'moderately severe';
      return 'severe';
    case 'gad7':
      if (score <= 4)  return 'minimal';
      if (score <= 9)  return 'mild';
      if (score <= 14) return 'moderate';
      return 'severe';
    case 'pss':
      if (score <= 13) return 'low';
      if (score <= 26) return 'moderate';
      return 'high';
    case 'rses':
      if (score <= 15) return 'low';
      if (score <= 25) return 'normal';
      return 'high';
  }
}

// Bulk-uploads all localStorage data to Firestore using setDoc with deterministic
// document IDs so re-running is idempotent — no duplicates on repeated calls.
export async function uploadAllLocalData(): Promise<void> {
  if (!isCloudSyncEnabled()) return;

  const userId = await getAuthUID();
  const userDoc = (col: string, id: string) => doc(db, 'users', userId, col, id);

  await setDoc(doc(db, 'users', userId), {
    cloudSyncEnabled: true,
    cloudSyncConsentAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  }, { merge: true });

  const ops: Promise<void>[] = [];

  // ── questionnaires ────────────────────────────────────────────────────────
  // mindcheck_history entries are flat: { checkInType, timestamp, phq9Score,
  // phq9Answers, gad7Score, gad7Answers, pssScore, pssAnswers, rsesScore, rsesAnswers }
  // Doc ID = "{timestamp}-{questionnaire_type}" → idempotent upsert.
  const history: any[] = JSON.parse(localStorage.getItem('mindcheck_history') || '[]');
  for (const entry of history) {
    const raw = entry.checkInType ?? entry.checkin_type ?? 'full';
    const checkin_type: 'guided' | 'individual' = raw === 'full' ? 'guided' : 'individual';
    const ts = String(entry.timestamp ?? Date.now());

    type QRow = ['phq9'|'gad7'|'pss'|'rses', number[]|null, number|null];
    const rows: QRow[] = [
      ['phq9', entry.phq9Answers, entry.phq9Score],
      ['gad7', entry.gad7Answers, entry.gad7Score],
      ['pss',  entry.pssAnswers,  entry.pssScore],
      ['rses', entry.rsesAnswers, entry.rsesScore],
    ];

    for (const [qtype, answers, score] of rows) {
      if (typeof score !== 'number' || !Array.isArray(answers) || !answers.length) continue;
      ops.push(
        setDoc(userDoc('questionnaires', `${ts}-${qtype}`), {
          questionnaire_type: qtype,
          checkin_type,
          individual_question_scores: answers,
          total_score: score,
          severity_label: severityLabel(qtype, score),
          _ts: serverTimestamp(),
        }, { merge: true }).catch(() => undefined)
      );
    }
  }

  // ── games ─────────────────────────────────────────────────────────────────
  // mindcheck_game_metrics entries are flat: { type, timestamp, userId, ...metrics }
  // Doc ID = "{timestamp}-{type}" → idempotent upsert.
  const gameMetrics: any[] = JSON.parse(localStorage.getItem('mindcheck_game_metrics') || '[]');
  for (const m of gameMetrics) {
    const { type, checkin_type: ct, timestamp, userId: _uid, ...metricsFields } = m;
    const ts = String(timestamp ?? Date.now()).replace(/[:.]/g, '-');
    ops.push(
      setDoc(userDoc('games', `${ts}-${type}`), {
        checkin_type: ct ?? 'guided',
        game_type: type,
        played: true,
        metrics: Object.keys(metricsFields).length > 0 ? metricsFields : null,
        _ts: serverTimestamp(),
      }, { merge: true }).catch(() => undefined)
    );
  }

  // ── journal ───────────────────────────────────────────────────────────────
  // Journal entries already have a stable `id` field — use it as doc ID.
  const journals: any[] = JSON.parse(localStorage.getItem('mindcheck_journal_entries_all') || '[]');
  for (const j of journals) {
    if (!j.id) continue;
    const wordCount = (j.entry ?? '').trim().split(/\s+/).filter((w: string) => w.length > 0).length;
    const normalised = Object.fromEntries(
      (j.emotions ?? []).map((e: string) => [e, (j.moodIntensities ?? {})[e] ?? 5])
    );
    ops.push(
      setDoc(userDoc('journal', j.id), {
        checkin_type: j.checkin_type ?? 'individual',
        prompt_shown: j.prompt ?? null,
        prompt_type: j.prompt ? 'prompted' : 'freely_written',
        journal_text: j.entry ?? '',
        word_count: wordCount,
        has_image: !!j.media,
        emotions: j.emotions ?? [],
        mood_intensities: normalised,
        hashtags: j.hashtags ?? [],
        _ts: serverTimestamp(),
      }, { merge: true }).catch(() => undefined)
    );
  }

  // ── daylogs ───────────────────────────────────────────────────────────────
  // mindcheck_ema_data: { "2025-01-01": [{ section, questions, ... }] }
  // Doc ID = "{dateKey}-{timeOfDay}" → idempotent upsert.
  const emaData: Record<string, any[]> = JSON.parse(localStorage.getItem('mindcheck_ema_data') || '{}');
  for (const [dateKey, sections] of Object.entries(emaData)) {
    for (const section of sections) {
      const timeOfDay = section.section ?? section.time_of_day ?? 'unknown';
      ops.push(
        setDoc(userDoc('daylogs', `${dateKey}-${timeOfDay}`), {
          questions: section.questions ?? [],
          time_of_day: timeOfDay,
          _ts: serverTimestamp(),
        }, { merge: true }).catch(() => undefined)
      );
    }
  }

  await Promise.allSettled(ops);
}

// Sets the sync flag and marks the preference as asked.
// Callers are responsible for calling uploadAllLocalData() to push historical data.
export function enableCloudSync(): void {
  localStorage.setItem(SYNC_KEY, 'true');
  localStorage.setItem(ASKED_KEY, 'true');
}

export async function disableCloudSync(): Promise<void> {
  localStorage.setItem(SYNC_KEY, 'false');
  try {
    const userId = await getAuthUID();
    await setDoc(doc(db, 'users', userId), {
      cloudSyncEnabled: false,
      updatedAt: serverTimestamp(),
    }, { merge: true });
  } catch {
    // user doc may not exist yet — safe to ignore
  }
}
