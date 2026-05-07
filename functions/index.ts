import { onSchedule } from 'firebase-functions/v2/scheduler';
import * as admin from 'firebase-admin';

admin.initializeApp();

const db = admin.firestore();
const messaging = admin.messaging();

type TimeSlot = 'morning' | 'afternoon' | 'night';
type Frequency = 'weekly' | 'twice-weekly' | 'monthly';

const INTERVAL_MS: Record<Frequency, number> = {
  weekly:        7  * 24 * 60 * 60 * 1000,
  'twice-weekly': 3 * 24 * 60 * 60 * 1000,
  monthly:       30 * 24 * 60 * 60 * 1000,
};

const MESSAGES: Record<TimeSlot, Array<{ title: string; body: string }>> = {
  morning: [
    { title: 'Good morning',    body: "How are you feeling as the day begins? A gentle check-in is here whenever you're ready." },
    { title: 'A gentle start',  body: 'Taking a few minutes for yourself this morning can make the whole day feel steadier.' },
    { title: 'Morning moment',  body: "Your feelings matter. No pressure — just a quiet space for you." },
  ],
  afternoon: [
    { title: 'Midday pause',       body: "How's your day unfolding? A quick check-in can help you feel more grounded." },
    { title: 'How are you doing?', body: 'Pause for a moment — checking in with yourself is a small act of care that adds up.' },
    { title: 'Afternoon check-in', body: 'Your mental wellbeing deserves as much attention as your to-do list. Take a breath.' },
  ],
  night: [
    { title: 'Evening reflection', body: 'You showed up today. Before you rest, take a quiet moment to check in with yourself.' },
    { title: 'Winding down',       body: "How are you feeling tonight? Take a gentle moment to check in with yourself." },
    { title: 'Good evening',       body: "A gentle check-in before the day closes. You deserve this small moment of care." },
  ],
};

const PWA_URL = 'https://mindcheck-pwa.vercel.app';

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

async function sendNotificationsForSlot(slot: TimeSlot): Promise<void> {
  const now = Date.now();

  const snapshot = await db.collection('users')
    .where('notificationPrefs.reminders', '==', true)
    .where('notificationPrefs.timePreference', '==', slot)
    .get();

  if (snapshot.empty) return;

  const sends: Promise<void>[] = [];

  for (const userDoc of snapshot.docs) {
    const data = userDoc.data();
    const token: string | undefined = data.fcmToken;
    if (!token) continue;

    const freq: Frequency = data.notificationPrefs?.frequency ?? 'weekly';
    const lastMs: number =
      (data.notificationPrefs?.lastNotifiedAt as admin.firestore.Timestamp)?.toMillis?.() ?? 0;

    if (now - lastMs < INTERVAL_MS[freq]) continue;

    const { title, body } = pick(MESSAGES[slot]);

    sends.push(
      (async () => {
        try {
          await messaging.send({
            token,
            notification: { title, body },
            webpush: {
              notification: {
                icon:     `${PWA_URL}/icons/icon-192.png`,
                badge:    `${PWA_URL}/icons/icon-192.png`,
                tag:      'mindcheck-reminder',
                renotify: true,
              },
              fcmOptions: { link: PWA_URL },
            },
          });
          await userDoc.ref.update({
            'notificationPrefs.lastNotifiedAt': admin.firestore.Timestamp.now(),
          });
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : String(err);
          console.error(`[FCM] Failed for ${userDoc.id}:`, msg);
          // Remove stale tokens so we stop trying to send to them
          if (
            msg.includes('registration-token-not-registered') ||
            msg.includes('invalid-registration-token')
          ) {
            await userDoc.ref
              .update({ fcmToken: admin.firestore.FieldValue.delete() })
              .catch(() => undefined);
          }
        }
      })()
    );
  }

  await Promise.allSettled(sends);
  console.log(`[FCM] ${slot}: processed ${sends.length} user(s)`);
}

// 9:00 AM IST
export const morningReminders = onSchedule(
  { schedule: '0 9 * * *', timeZone: 'Asia/Kolkata' },
  async () => sendNotificationsForSlot('morning')
);

// 2:00 PM IST
export const afternoonReminders = onSchedule(
  { schedule: '0 14 * * *', timeZone: 'Asia/Kolkata' },
  async () => sendNotificationsForSlot('afternoon')
);

// 8:00 PM IST
export const eveningReminders = onSchedule(
  { schedule: '0 20 * * *', timeZone: 'Asia/Kolkata' },
  async () => sendNotificationsForSlot('night')
);
