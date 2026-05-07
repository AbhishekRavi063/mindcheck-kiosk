"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.eveningReminders = exports.afternoonReminders = exports.morningReminders = void 0;
const scheduler_1 = require("firebase-functions/v2/scheduler");
const admin = __importStar(require("firebase-admin"));
admin.initializeApp();
const db = admin.firestore();
const messaging = admin.messaging();
const INTERVAL_MS = {
    weekly: 7 * 24 * 60 * 60 * 1000,
    'twice-weekly': 3 * 24 * 60 * 60 * 1000,
    monthly: 30 * 24 * 60 * 60 * 1000,
};
const MESSAGES = {
    morning: [
        { title: 'Good morning', body: "How are you feeling as the day begins? A gentle check-in is here whenever you're ready." },
        { title: 'A gentle start', body: 'Taking a few minutes for yourself this morning can make the whole day feel steadier.' },
        { title: 'Morning moment', body: "Your feelings matter. No pressure — just a quiet space for you." },
    ],
    afternoon: [
        { title: 'Midday pause', body: "How's your day unfolding? A quick check-in can help you feel more grounded." },
        { title: 'How are you doing?', body: 'Pause for a moment — checking in with yourself is a small act of care that adds up.' },
        { title: 'Afternoon check-in', body: 'Your mental wellbeing deserves as much attention as your to-do list. Take a breath.' },
    ],
    night: [
        { title: 'Evening reflection', body: 'You showed up today. Before you rest, take a quiet moment to check in with yourself.' },
        { title: 'Winding down', body: "How are you feeling tonight? Take a gentle moment to check in with yourself." },
        { title: 'Good evening', body: "A gentle check-in before the day closes. You deserve this small moment of care." },
    ],
};
const PWA_URL = 'https://mindcheck-pwa.vercel.app';
function pick(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}
async function sendNotificationsForSlot(slot) {
    const now = Date.now();
    const snapshot = await db.collection('users')
        .where('notificationPrefs.reminders', '==', true)
        .where('notificationPrefs.timePreference', '==', slot)
        .get();
    if (snapshot.empty)
        return;
    const sends = [];
    for (const userDoc of snapshot.docs) {
        const data = userDoc.data();
        const token = data.fcmToken;
        if (!token)
            continue;
        const freq = data.notificationPrefs?.frequency ?? 'weekly';
        const lastMs = data.notificationPrefs?.lastNotifiedAt?.toMillis?.() ?? 0;
        if (now - lastMs < INTERVAL_MS[freq])
            continue;
        const { title, body } = pick(MESSAGES[slot]);
        sends.push((async () => {
            try {
                await messaging.send({
                    token,
                    notification: { title, body },
                    webpush: {
                        notification: {
                            icon: `${PWA_URL}/icons/icon-192.png`,
                            badge: `${PWA_URL}/icons/icon-192.png`,
                            tag: 'mindcheck-reminder',
                            renotify: true,
                        },
                        fcmOptions: { link: PWA_URL },
                    },
                });
                await userDoc.ref.update({
                    'notificationPrefs.lastNotifiedAt': admin.firestore.Timestamp.now(),
                });
            }
            catch (err) {
                const msg = err instanceof Error ? err.message : String(err);
                console.error(`[FCM] Failed for ${userDoc.id}:`, msg);
                // Remove stale tokens so we stop trying to send to them
                if (msg.includes('registration-token-not-registered') ||
                    msg.includes('invalid-registration-token')) {
                    await userDoc.ref
                        .update({ fcmToken: admin.firestore.FieldValue.delete() })
                        .catch(() => undefined);
                }
            }
        })());
    }
    await Promise.allSettled(sends);
    console.log(`[FCM] ${slot}: processed ${sends.length} user(s)`);
}
// 9:00 AM IST
exports.morningReminders = (0, scheduler_1.onSchedule)({ schedule: '0 9 * * *', timeZone: 'Asia/Kolkata' }, async () => sendNotificationsForSlot('morning'));
// 2:00 PM IST
exports.afternoonReminders = (0, scheduler_1.onSchedule)({ schedule: '0 14 * * *', timeZone: 'Asia/Kolkata' }, async () => sendNotificationsForSlot('afternoon'));
// 8:00 PM IST
exports.eveningReminders = (0, scheduler_1.onSchedule)({ schedule: '0 20 * * *', timeZone: 'Asia/Kolkata' }, async () => sendNotificationsForSlot('night'));
//# sourceMappingURL=index.js.map