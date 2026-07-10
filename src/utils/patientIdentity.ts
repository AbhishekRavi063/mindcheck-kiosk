// Resolves the patient's clinic identity (participantId) in the SHARED Kiosk
// Firestore.
//
// The Kiosk (Kaustubh) creates the patient's login and stores the link as:
//     users/{uid} = { role: 'patient', participantId, clientId, phone }
// where participantId == the normalized phone digits. After the patient logs in,
// we read users/{uid}.participantId to get their clinic identity, and cache it.
//
// (This matches the Kiosk's actual scheme — verified against its `documentation`
//  branch: participant_auth_registration.dart writes users/{uid}.participantId.)

import { doc, getDoc } from 'firebase/firestore';
import { db, getCurrentUid } from '../firebase';

const PID_KEY = 'mindcheck_participant_id';

/** Returns this patient's participantId (cached, else read from users/{uid}). */
export async function resolveParticipantId(): Promise<string | null> {
  const cached = localStorage.getItem(PID_KEY);
  if (cached) return cached;

  const uid = getCurrentUid();
  if (!uid) return null;

  const snap = await getDoc(doc(db, 'users', uid));
  if (!snap.exists()) return null;

  const pid = snap.data()?.participantId;
  if (!pid) return null;

  localStorage.setItem(PID_KEY, String(pid));
  return String(pid);
}

export function getCachedParticipantId(): string | null {
  return localStorage.getItem(PID_KEY);
}

/** Call on logout so the next patient on this device re-resolves their own ID. */
export function clearParticipantId(): void {
  localStorage.removeItem(PID_KEY);
}
