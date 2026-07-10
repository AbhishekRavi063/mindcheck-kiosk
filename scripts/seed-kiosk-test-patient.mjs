import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import { initializeApp, getApps } from 'firebase/app';
import {
  createUserWithEmailAndPassword,
  getAuth,
  inMemoryPersistence,
  setPersistence,
  signInWithEmailAndPassword,
} from 'firebase/auth';
import {
  collection,
  doc,
  getDocs,
  getFirestore,
  limit,
  query,
  serverTimestamp,
  setDoc,
  where,
} from 'firebase/firestore';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');
const ENV_PATH = path.join(ROOT, '.env');

function loadEnv(filePath) {
  const text = fs.readFileSync(filePath, 'utf8');
  const env = {};
  for (const rawLine of text.split('\n')) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#') || !line.includes('=')) continue;
    const [key, ...rest] = line.split('=');
    env[key.trim()] = rest.join('=').trim();
  }
  return env;
}

function normalizePhone(phone) {
  const digits = String(phone || '').replace(/\D/g, '');
  return digits.replace(/^0+/, '').replace(/^91(?=\d{10}$)/, '');
}

function phoneToEmail(phone) {
  // Must match the Kiosk's account-creation domain (Kaustubh: <phone>@participant.kiosk.local)
  return `${normalizePhone(phone)}@participant.kiosk.local`;
}

function buildWeekData() {
  const days = [
    ['2026-07-01', 'morning', 6, 4, 5, 6, 'calm', 'Felt a little better after sleeping on time.'],
    ['2026-07-02', 'evening', 5, 6, 4, 5, 'anxious', 'Work pressure was high and I felt tense.'],
    ['2026-07-03', 'morning', 7, 3, 6, 7, 'hopeful', 'Woke up motivated and went for a short walk.'],
    ['2026-07-04', 'afternoon', 6, 5, 5, 5, 'tired', 'Energy dipped after lunch and I rested.'],
    ['2026-07-05', 'evening', 4, 7, 3, 4, 'overwhelmed', 'Had racing thoughts and difficulty focusing.'],
    ['2026-07-06', 'morning', 7, 3, 7, 6, 'happy', 'Spent time with family and felt supported.'],
    ['2026-07-07', 'evening', 6, 4, 6, 6, 'relieved', 'Therapy exercises helped settle my mind.'],
  ];

  return days.map(([date, timeOfDay, mood, distress, energy, sleep, emotion, text], idx) => ({
    date,
    timeOfDay,
    mood,
    distress,
    energy,
    sleep,
    emotion,
    text,
    journalId: `seed-journal-${idx + 1}`,
    gameDocId: `${date}T1${idx}-attention`,
  }));
}

async function ensureUser(auth, email, password) {
  try {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    return { user: cred.user, created: true };
  } catch (error) {
    if (error?.code !== 'auth/email-already-in-use') throw error;
    const cred = await signInWithEmailAndPassword(auth, email, password);
    return { user: cred.user, created: false };
  }
}

async function main() {
  if (!fs.existsSync(ENV_PATH)) {
    throw new Error(`Missing .env at ${ENV_PATH}`);
  }

  const env = loadEnv(ENV_PATH);
  const required = [
    'VITE_FIREBASE_API_KEY',
    'VITE_FIREBASE_AUTH_DOMAIN',
    'VITE_FIREBASE_PROJECT_ID',
    'VITE_FIREBASE_STORAGE_BUCKET',
    'VITE_FIREBASE_MESSAGING_SENDER_ID',
    'VITE_FIREBASE_APP_ID',
  ];

  const missing = required.filter((key) => !env[key]);
  if (missing.length) {
    throw new Error(`Missing required Firebase env vars: ${missing.join(', ')}`);
  }

  const firebaseConfig = {
    apiKey: env.VITE_FIREBASE_API_KEY,
    authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: env.VITE_FIREBASE_APP_ID,
  };

  const TEST_PHONE = process.env.TEST_PHONE || '9876543210';
  const TEST_PASSWORD = process.env.TEST_PASSWORD || 'Mindcheck123!';
  const TEST_PARTICIPANT_ID = process.env.TEST_PARTICIPANT_ID || 'TEST_MINDCHECK_001';
  const TEST_CLIENT_ID = process.env.TEST_CLIENT_ID || 'test_client';

  const normalizedPhone = normalizePhone(TEST_PHONE);
  const email = phoneToEmail(TEST_PHONE);

  const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
  const auth = getAuth(app);
  await setPersistence(auth, inMemoryPersistence);
  const db = getFirestore(app);

  const { user, created } = await ensureUser(auth, email, TEST_PASSWORD);

  await setDoc(
    doc(db, 'participants', TEST_PARTICIPANT_ID),
    {
      clientId: TEST_CLIENT_ID,
      createdAt: serverTimestamp(),
      authUid: user.uid,
      phone: normalizedPhone,
      source: 'mindcheck-seed-script',
    },
    { merge: true },
  );

  const weekData = buildWeekData();

  for (const day of weekData) {
    await setDoc(
      doc(db, 'participants', TEST_PARTICIPANT_ID, 'mc_ema', `${day.date}-${day.timeOfDay}`),
      {
        date: day.date,
        time_of_day: day.timeOfDay,
        questions: [
          { key: 'mood', question_text: 'How was your mood?', response: day.mood, value: day.mood },
          { key: 'distress', question_text: 'How distressed did you feel?', response: day.distress, value: day.distress },
          { key: 'energy', question_text: 'How was your energy?', response: day.energy, value: day.energy },
          { key: 'sleep', question_text: 'How was your sleep?', response: day.sleep, value: day.sleep },
        ],
        _ts: serverTimestamp(),
      },
      { merge: true },
    );

    await setDoc(
      doc(db, 'participants', TEST_PARTICIPANT_ID, 'mc_journal', day.journalId),
      {
        date: day.date,
        journal_text: day.text,
        emotions: [day.emotion],
        mood_intensities: { [day.emotion]: day.mood },
        hashtags: ['seeded', 'test-user'],
        prompt_shown: 'How was your day?',
        has_image: false,
        word_count: day.text.trim().split(/\s+/).length,
        _ts: serverTimestamp(),
      },
      { merge: true },
    );

    await setDoc(
      doc(db, 'participants', TEST_PARTICIPANT_ID, 'mc_games', day.gameDocId),
      {
        game_type: 'attention',
        played: true,
        metrics: {
          accuracy: Number((0.68 + (day.mood * 0.03)).toFixed(2)),
          averageReactionTime: Number((1.1 - (day.energy * 0.06)).toFixed(2)),
          averageDigitSpan: 4 + (day.energy > 5 ? 1 : 0),
        },
        _ts: serverTimestamp(),
      },
      { merge: true },
    );
  }

  await setDoc(
    doc(db, 'participants', TEST_PARTICIPANT_ID, 'mc_summary', '2026-07-01_2026-07-07'),
    {
      from_date: '2026-07-01',
      to_date: '2026-07-07',
      entry_count: weekData.length,
      daily: weekData.map((day) => ({
        date: day.date,
        dominant_mood: day.emotion,
        emotions: [day.emotion],
        snippet: day.text.slice(0, 160),
      })),
      _ts: serverTimestamp(),
    },
    { merge: true },
  );

  const participantSnap = await getDocs(
    query(collection(db, 'participants'), where('authUid', '==', user.uid), limit(1)),
  );

  console.log(JSON.stringify({
    projectId: firebaseConfig.projectId,
    participantId: TEST_PARTICIPANT_ID,
    email,
    normalizedPhone,
    authUid: user.uid,
    userCreatedNow: created,
    participantLookupFound: !participantSnap.empty,
    expectedCollections: {
      mc_ema: weekData.length,
      mc_journal: weekData.length,
      mc_games: weekData.length,
      mc_summary: 1,
    },
  }, null, 2));
}

main().catch((error) => {
  console.error('\nSeed failed:\n', error);
  process.exit(1);
});
