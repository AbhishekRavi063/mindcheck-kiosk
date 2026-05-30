export interface NotificationPrefs {
  frequency: 'weekly' | 'twice-weekly' | 'monthly';
  timePreference: 'morning' | 'afternoon' | 'night';
  reminders: boolean;
  nextNotificationAt?: number;
}

const STORAGE_KEY = 'notificationPrefs';

const HOUR_MAP: Record<NotificationPrefs['timePreference'], number> = {
  morning: 9,
  afternoon: 14,
  night: 20,
};

const INTERVAL_DAYS: Record<NotificationPrefs['frequency'], number> = {
  weekly: 7,
  'twice-weekly': 3,
  monthly: 30,
};

const DEFAULT_PREFS: NotificationPrefs = {
  frequency: 'weekly',
  timePreference: 'morning',
  reminders: false,
};

export function loadNotificationPrefs(): NotificationPrefs {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? { ...DEFAULT_PREFS, ...JSON.parse(raw) } : { ...DEFAULT_PREFS };
  } catch {
    return { ...DEFAULT_PREFS };
  }
}

export function saveNotificationPrefs(prefs: NotificationPrefs): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
}

export function isNotificationSupported(): boolean {
  return 'Notification' in window;
}

export function getPermissionStatus(): NotificationPermission {
  if (!isNotificationSupported()) return 'denied';
  return Notification.permission;
}

export async function requestPermission(): Promise<NotificationPermission> {
  if (!isNotificationSupported()) return 'denied';
  if (Notification.permission !== 'default') return Notification.permission;
  return Notification.requestPermission();
}

export function computeNextNotificationAt(prefs: NotificationPrefs): number {
  const now = new Date();
  const hour = HOUR_MAP[prefs.timePreference];
  const days = INTERVAL_DAYS[prefs.frequency];

  const candidate = new Date(now);
  candidate.setHours(hour, 0, 0, 0);

  // If today's slot has already passed, start from tomorrow then add interval
  if (candidate.getTime() <= now.getTime()) {
    candidate.setDate(candidate.getDate() + days);
  }

  return candidate.getTime();
}

// ─── Firebase / FCM ────────────────────────────────────────────────────────

// Registers the FCM token in Firestore under /users/{userId}.
// Called when the user enables reminders and permission is granted.
export async function registerFCMToken(userId: string, prefs: NotificationPrefs): Promise<void> {
  if (!userId) return;
  try {
    const [{ db, requestFCMToken }, { doc, setDoc }] = await Promise.all([
      import('../firebase'),
      import('firebase/firestore'),
    ]);
    const token = await requestFCMToken();
    if (!token) return;
    await setDoc(
      doc(db, 'users', userId),
      {
        fcmToken: token,
        notificationPrefs: {
          frequency:      prefs.frequency,
          timePreference: prefs.timePreference,
          reminders:      true,
          lastNotifiedAt: null,
        },
        updatedAt: new Date(),
      },
      { merge: true }
    );
  } catch (err) {
    console.error('[FCM] registerFCMToken failed:', err);
  }
}

// Deletes the FCM token from Firestore and revokes it from Firebase.
// Called when the user disables reminders.
export async function unregisterFCMToken(userId: string): Promise<void> {
  if (!userId) return;
  try {
    const [{ revokeFCMToken }, { db }, { doc, updateDoc, deleteField }] = await Promise.all([
      import('../firebase'),
      import('../firebase'),
      import('firebase/firestore'),
    ]);
    await revokeFCMToken();
    await updateDoc(doc(db, 'users', userId), {
      fcmToken:                        deleteField(),
      'notificationPrefs.reminders':   false,
      updatedAt:                       new Date(),
    });
  } catch {
    // doc may not exist if user never fully registered — safe to ignore
  }
}

// Syncs frequency/timePreference changes to Firestore while reminders are on.
export async function syncPrefsToFirestore(userId: string, prefs: NotificationPrefs): Promise<void> {
  if (!userId || !prefs.reminders) return;
  try {
    const [{ db }, { doc, updateDoc }] = await Promise.all([
      import('../firebase'),
      import('firebase/firestore'),
    ]);
    await updateDoc(doc(db, 'users', userId), {
      'notificationPrefs.frequency':      prefs.frequency,
      'notificationPrefs.timePreference': prefs.timePreference,
      updatedAt:                          new Date(),
    });
  } catch {
    // doc may not exist yet — safe to ignore
  }
}

// Saves notification preferences to Firestore regardless of FCM permission status.
// Called after onboarding so that frequency/timePreference are always recorded
// even when the user declines browser notification permission.
export async function savePrefsToFirestore(userId: string, prefs: NotificationPrefs): Promise<void> {
  if (!userId) return;
  try {
    const [{ db }, { doc, setDoc }] = await Promise.all([
      import('../firebase'),
      import('firebase/firestore'),
    ]);
    await setDoc(
      doc(db, 'users', userId),
      {
        notificationPrefs: {
          frequency:      prefs.frequency,
          timePreference: prefs.timePreference,
          reminders:      prefs.reminders,
          lastNotifiedAt: null,
        },
        updatedAt: new Date(),
      },
      { merge: true }
    );
  } catch {
    // safe to ignore — metrics only
  }
}
