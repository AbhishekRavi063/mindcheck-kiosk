import { db, getAuthUID } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

// ─── Types ──────────────────────────────────────────────────────────────────

type CheckinType = 'guided' | 'individual';
type QuestionnaireType = 'phq9' | 'gad7' | 'pss' | 'rses';
type GameType = 'gonogo' | 'attention' | 'memory' | 'counting';
type ActivityEvent =
  | 'app_open' | 'tab_visit'
  | 'guided_checkin_started' | 'guided_checkin_completed'
  | 'individual_checkin_started' | 'individual_checkin_completed'
  | 'questionnaire_completed' | 'game_played' | 'game_skipped'
  | 'journal_written' | 'journal_skipped'
  | 'ema_started' | 'ema_completed'
  | 'support_resources_viewed';

interface QueueItem {
  col: string;
  data: object;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const SYNC_KEY  = 'mindcheck_cloud_backup_enabled';
const QUEUE_KEY = 'mindcheck_firestoreQueue';

function isSyncEnabled(): boolean {
  return localStorage.getItem(SYNC_KEY) === 'true';
}

function enqueue(col: string, data: object): void {
  try {
    const q: QueueItem[] = JSON.parse(localStorage.getItem(QUEUE_KEY) || '[]');
    q.push({ col, data });
    localStorage.setItem(QUEUE_KEY, JSON.stringify(q));
  } catch {
    // storage full — drop silently
  }
}

async function write(col: string, data: object): Promise<void> {
  const userId = await getAuthUID();
  await addDoc(collection(db, 'users', userId, col), {
    ...data,
    _ts: serverTimestamp(),
  });
}

async function execute(col: string, data: object): Promise<void> {
  if (!isSyncEnabled()) return;
  try {
    await write(col, data);
  } catch {
    enqueue(col, data);
  }
}

function getSeverityLabel(type: QuestionnaireType, score: number): string {
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

// ─── Offline queue flush ──────────────────────────────────────────────────────

export async function flushOfflineQueue(): Promise<void> {
  if (!isSyncEnabled()) return;
  const queue: QueueItem[] = JSON.parse(localStorage.getItem(QUEUE_KEY) || '[]');
  if (queue.length === 0) return;
  try {
    const remaining: QueueItem[] = [];
    for (const item of queue) {
      try {
        await write(item.col, item.data);
      } catch {
        remaining.push(item);
      }
    }
    localStorage.setItem(QUEUE_KEY, JSON.stringify(remaining));
  } catch {
    // getAuthUID failed — leave queue intact for next launch
  }
}

// ─── saveQuestionnaire ────────────────────────────────────────────────────────

export async function saveQuestionnaire(data: {
  questionnaire_type: QuestionnaireType;
  checkin_type: CheckinType;
  individual_question_scores: number[];
  total_score: number;
}): Promise<void> {
  await execute('questionnaires', {
    ...data,
    severity_label: getSeverityLabel(data.questionnaire_type, data.total_score),
  });
}

// ─── saveGame ─────────────────────────────────────────────────────────────────

export async function saveGame(data: {
  checkin_type: CheckinType;
  game_type: GameType;
  played: boolean;
  metrics: object | null;
}): Promise<void> {
  await execute('games', data);
}

// ─── saveJournal ──────────────────────────────────────────────────────────────

export async function saveJournal(data: {
  checkin_type: CheckinType;
  prompt_shown: string | null;
  prompt_type: 'freely_written' | 'prompted';
  journal_text: string;
  word_count: number;
  has_image: boolean;
  emotions: string[];
  mood_intensities: { [emotion: string]: number };
  hashtags: string[];
}): Promise<void> {
  // Ensure every emotion has an intensity — default 5 if slider was never touched
  const normalised = Object.fromEntries(
    data.emotions.map(e => [e, data.mood_intensities[e] ?? 5])
  );
  await execute('journal', { ...data, mood_intensities: normalised });
}

// ─── saveDayLog ───────────────────────────────────────────────────────────────

export async function saveDayLog(data: {
  questions: { question_text: string; response: any }[];
  time_of_day: string;
}): Promise<void> {
  await execute('daylogs', data);
}

// ─── logUserActivity ──────────────────────────────────────────────────────────

export async function logUserActivity(
  event: ActivityEvent,
  metadata?: {
    tab?: string;
    game_type?: string;
    questionnaire_type?: string;
    time_of_day?: string;
    source?: string;
  }
): Promise<void> {
  await execute('activity', { event, metadata: metadata ?? null });
}
