import { initializeApp, getApps } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getMessaging, getToken, deleteToken } from 'firebase/messaging';
import {
  getAuth, onAuthStateChanged, signInWithEmailAndPassword, signOut,
  setPersistence, browserLocalPersistence, type User,
} from 'firebase/auth';

// Firebase config — set these in .env (VITE_FIREBASE_*)
// Values are safe to expose in client code; security is enforced by Firestore Rules.
const firebaseConfig = {
  apiKey:            import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId:             import.meta.env.VITE_FIREBASE_APP_ID,
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
export const db   = getFirestore(app);
export const auth = getAuth(app);

// Keep the patient signed in across app restarts — they log in once (with the
// phone + password created for them at the clinic) and stay logged in.
setPersistence(auth, browserLocalPersistence).catch(() => undefined);

// ─── Patient authentication (phone + password) ─────────────────────────────
// The clinic creates the account at the Kiosk. Firebase Auth needs an email-format
// identifier, so we derive one from the phone number. This is a plain username +
// password login — NO SMS and NO real inbox are involved (no messaging cost).
//
// IMPORTANT: this domain MUST match exactly what the Kiosk uses when it CREATES the
// account. Kaustubh (Kiosk) uses "<phone>@participant.kiosk.local" (password = phone).
// If these differ, login fails. Keep in sync with the Kiosk side.
export const CLINIC_AUTH_DOMAIN = 'participant.kiosk.local';

// Normalize a phone number so it always matches what the Kiosk stored:
// digits only, strip a leading 0 and an Indian +91 country code.
export function normalizePhone(phone: string): string {
  const digits = (phone || '').replace(/\D/g, '');
  return digits.replace(/^0+/, '').replace(/^91(?=\d{10}$)/, '');
}

export function phoneToEmail(phone: string): string {
  return `${normalizePhone(phone)}@${CLINIC_AUTH_DOMAIN}`;
}

export async function loginWithPhonePassword(phone: string, password: string): Promise<User> {
  const cred = await signInWithEmailAndPassword(auth, phoneToEmail(phone), password);
  return cred.user;
}

export async function logout(): Promise<void> {
  await signOut(auth);
}

export function onAuthChange(cb: (user: User | null) => void) {
  return onAuthStateChanged(auth, cb);
}

// Current signed-in patient's UID, or null if not logged in.
export function getCurrentUid(): string | null {
  return auth.currentUser?.uid ?? null;
}

// Back-compat for existing callers — resolves the logged-in patient's UID.
// (No more anonymous fallback: data must belong to a real, clinic-linked patient.)
export async function getAuthUID(): Promise<string> {
  if (auth.currentUser) return auth.currentUser.uid;
  return new Promise((resolve, reject) => {
    const unsub = onAuthStateChanged(auth, (user) => {
      unsub();
      if (user) resolve(user.uid);
      else reject(new Error('Not signed in'));
    });
  });
}

// Requests an FCM token using the existing Workbox service worker (sw.js).
// The Workbox SW includes sw-push.js via importScripts, so it handles push events.
export async function requestFCMToken(): Promise<string | null> {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    console.warn('[FCM] serviceWorker or PushManager not supported');
    return null;
  }
  try {
    // Timeout after 10s — prevents hanging if SW never becomes ready (e.g. in dev mode)
    const swReg = await Promise.race([
      navigator.serviceWorker.ready,
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Service worker ready timeout')), 10000)
      ),
    ]) as ServiceWorkerRegistration;

    const messaging = getMessaging(app);
    const token = await getToken(messaging, {
      vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY,
      serviceWorkerRegistration: swReg,
    });
    return token || null;
  } catch (err) {
    console.error('[FCM] Token error:', err);
    return null;
  }
}

export async function revokeFCMToken(): Promise<void> {
  if (!('serviceWorker' in navigator)) return;
  try {
    const messaging = getMessaging(app);
    await deleteToken(messaging);
  } catch {
    // token may already be invalid — safe to ignore
  }
}
