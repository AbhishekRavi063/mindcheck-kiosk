// Returns the Firebase Anonymous Auth UID — consistent across sessions via Firebase persistence.
export async function getUserId(): Promise<string> {
  const { getAuthUID } = await import('../firebase');
  return getAuthUID();
}

// ===== QUESTIONNAIRE RESPONSES =====

export async function saveQuestionnaireResponse(response: any): Promise<void> {
  const userId = await getUserId();
  const tagged = { ...response, userId };
  const history = JSON.parse(localStorage.getItem('mindcheck_history') || '[]');
  history.push(tagged);
  localStorage.setItem('mindcheck_history', JSON.stringify(history));
}

export function getQuestionnaireResponses(): any[] {
  const raw = localStorage.getItem('mindcheck_history');
  return raw ? JSON.parse(raw) : [];
}

// ===== GAME METRICS =====

export async function saveGameMetrics(metrics: any): Promise<void> {
  const userId = await getUserId();
  const tagged = { ...metrics, userId };
  const history = JSON.parse(localStorage.getItem('mindcheck_game_metrics') || '[]');
  history.push(tagged);
  localStorage.setItem('mindcheck_game_metrics', JSON.stringify(history));
}

export function getGameMetrics(): any[] {
  const raw = localStorage.getItem('mindcheck_game_metrics');
  return raw ? JSON.parse(raw) : [];
}

// ===== DAY LOGS (EMA CHECK-INS) =====

export async function saveDayLog(_dayLog: any): Promise<void> {
  // EMA data is saved directly by EMA flow components; this is a no-op retained for API compatibility.
}

export function getDayLogs(): any[] {
  const raw = localStorage.getItem('mindcheck_ema_data');
  return raw ? JSON.parse(raw) : [];
}

// ===== JOURNAL ENTRIES =====

export async function saveJournalEntry(journal: any): Promise<any> {
  const userId = await getUserId();
  return { ...journal, userId };
}

export function getJournalEntries(): any[] {
  const raw = localStorage.getItem('mindcheck_journal_entries_all');
  return raw ? JSON.parse(raw) : [];
}
