// Google Analytics 4 — event logging for MindCheck PWA
// Measurement ID: G-JPV4QEH4PM (mindcheck-pwa stream)

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    dataLayer?: any[];
  }
}

const MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID;

// Inject gtag script dynamically
export function initAnalytics(): void {
  if (!MEASUREMENT_ID || typeof window === 'undefined') return;
  if (window.gtag) return; // already initialized

  // Inject Google tag script
  const script1 = document.createElement('script');
  script1.async = true;
  script1.src = `https://www.googletagmanager.com/gtag/js?id=${MEASUREMENT_ID}`;
  document.head.appendChild(script1);

  // Init dataLayer and gtag
  window.dataLayer = window.dataLayer || [];
  window.gtag = function () { window.dataLayer!.push(arguments); };
  window.gtag('js', new Date());
  window.gtag('config', MEASUREMENT_ID, {
    send_page_view: true,
  });
}

// Log a custom event
export function logEvent(eventName: string, params?: Record<string, any>): void {
  if (!window.gtag) return;
  window.gtag('event', eventName, params ?? {});
}

// ─── Specific event helpers ────────────────────────────────────────────────

export function logAppOpen(): void {
  logEvent('app_open');
}

export function logTabVisit(tab: string): void {
  logEvent('tab_visit', { tab });
  // Also fires as screen_view for GA4 built-in reports
  logEvent('screen_view', { screen_name: tab });
}

export function logCheckinStarted(type: 'guided' | 'individual'): void {
  logEvent('checkin_started', { checkin_type: type });
}

export function logCheckinCompleted(type: 'guided' | 'individual'): void {
  logEvent('checkin_completed', { checkin_type: type });
}

export function logGamePlayed(gameType: string): void {
  logEvent('game_played', { game_type: gameType });
}

export function logGameSkipped(gameType: string): void {
  logEvent('game_skipped', { game_type: gameType });
}

export function logJournalWritten(): void {
  logEvent('journal_written');
}

export function logEMACompleted(timeOfDay: string): void {
  logEvent('ema_completed', { time_of_day: timeOfDay });
}

export function logCloudSyncEnabled(): void {
  logEvent('cloud_sync_enabled');
}

export function logCloudSyncDisabled(): void {
  logEvent('cloud_sync_disabled');
}
