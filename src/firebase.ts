import { initializeApp, getApps } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getMessaging, getToken, deleteToken } from 'firebase/messaging';
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth';

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

// Eagerly start anonymous sign-in on module load so auth is ready by first interaction.
signInAnonymously(auth).catch(() => undefined);

// Returns the Firebase Auth UID for the current anonymous user.
// Waits for auth state to resolve, then signs in anonymously if needed.
export async function getAuthUID(): Promise<string> {
  if (auth.currentUser) return auth.currentUser.uid;

  return new Promise((resolve, reject) => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      unsub();
      if (user) {
        resolve(user.uid);
      } else {
        try {
          const credential = await signInAnonymously(auth);
          resolve(credential.user.uid);
        } catch (err) {
          reject(err);
        }
      }
    });
  });
}

// Requests an FCM token using the existing Workbox service worker (sw.js).
// The Workbox SW includes sw-push.js via importScripts, so it handles push events.
export async function requestFCMToken(): Promise<string | null> {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) return null;
  try {
    const swReg = await navigator.serviceWorker.ready;
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
