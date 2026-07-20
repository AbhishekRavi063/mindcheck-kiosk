import {
  appendSensitiveArrayValue,
  getSensitiveValueSync,
} from './secureVault';
import { syncToKioskDb } from './kioskSync';

// Returns the Firebase Anonymous Auth UID — consistent across sessions via Firebase persistence.
export async function getUserId(): Promise<string> {
  const { getAuthUID } = await import('../firebase');
  return getAuthUID();
}

// ===== QUESTIONNAIRE RESPONSES =====

export async function saveQuestionnaireResponse(response: any): Promise<void> {
  const userId = await getUserId();
  const tagged = { ...response, userId };
  await appendSensitiveArrayValue('mindcheck_history', tagged);
}

export async function getQuestionnaireResponses(): Promise<any[]> {
  return getSensitiveValueSync<any[]>('mindcheck_history', []);
}

// ===== GAME METRICS =====

export async function saveGameMetrics(metrics: any): Promise<void> {
  const userId = await getUserId();
  const tagged = { ...metrics, userId };
  await appendSensitiveArrayValue('mindcheck_game_metrics', tagged);
  // Push to the clinic DB at the point the metrics are stored. Games are saved
  // from GameScoreScreen without any completion callback reaching App.tsx, so
  // syncing higher up would never fire for them.
  syncToKioskDb().catch((e) => console.warn('[kioskSync] game sync failed', e));
}

export async function getGameMetrics(): Promise<any[]> {
  return getSensitiveValueSync<any[]>('mindcheck_game_metrics', []);
}

// ===== DAY LOGS (EMA CHECK-INS) =====

export async function saveDayLog(_dayLog: any): Promise<void> {
  // EMA data is saved directly by EMA flow components; this is a no-op retained for API compatibility.
}

export async function getDayLogs(): Promise<any> {
  return getSensitiveValueSync<any>('mindcheck_ema_data', {});
}

// ===== JOURNAL ENTRIES =====

export async function getJournalEntries(): Promise<any[]> {
  return getSensitiveValueSync<any[]>('mindcheck_journal_entries_all', []);
}
