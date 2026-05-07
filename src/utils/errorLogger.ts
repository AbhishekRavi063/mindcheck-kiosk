// Error Logger — stores crash reports on device for debugging
// Access from Profile → View Error Logs

import { APP_VERSION } from './appConfig';

const ERROR_LOG_KEY = 'mindcheck_error_logs';
const MAX_LOGS = 50; // Keep last 50 errors

export interface ErrorLog {
  id: string;
  timestamp: string;
  type: 'react' | 'js' | 'promise' | 'storage' | 'manual';
  message: string;
  stack: string;
  component?: string;
  appVersion: string;
}

export function getErrorLogs(): ErrorLog[] {
  try {
    const raw = localStorage.getItem(ERROR_LOG_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function logError(
  type: ErrorLog['type'],
  message: string,
  stack?: string,
  component?: string
): void {
  try {
    const logs = getErrorLogs();
    const newLog: ErrorLog = {
      id: `err-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      timestamp: new Date().toISOString(),
      type,
      message: message.substring(0, 500),
      stack: (stack || '').substring(0, 1000),
      component: component || '',
      appVersion: APP_VERSION,
    };
    logs.unshift(newLog);
    // Keep only last MAX_LOGS
    if (logs.length > MAX_LOGS) logs.length = MAX_LOGS;
    localStorage.setItem(ERROR_LOG_KEY, JSON.stringify(logs));
  } catch {
    // If even logging fails, silently ignore
  }
}

export function clearErrorLogs(): void {
  try {
    localStorage.removeItem(ERROR_LOG_KEY);
  } catch {
    // ignore
  }
}

// Install global error handlers — call this once at app startup
export function installGlobalErrorHandlers(): void {
  // Catch unhandled JS errors
  window.onerror = function (msg, url, line, col, error) {
    const fileName = url ? url.split('/').pop() || '' : '';
    logError(
      'js',
      String(msg),
      `${fileName}:${line}:${col}\n${error?.stack || ''}`
    );
    return false; // Let ErrorBoundary also handle it
  };

  // Catch unhandled promise rejections
  window.addEventListener('unhandledrejection', function (event) {
    const reason = event.reason;
    logError(
      'promise',
      reason?.message || String(reason),
      reason?.stack || ''
    );
  });
}
