// Full end-to-end test: signs in as the patient, writes a week of REAL MindCheck
// data to Firebase, reads it back, pulls weights from the local federated server,
// runs the model, and prints the prediction.
//
// PREREQUISITES (you do these once in the Firebase console — see the guide):
//   1. A patient Auth user exists (email/password).
//   2. A participants/<PID> doc exists with fields:
//        clientId (string), phone (string), authUid = the patient's UID.
//   3. The federated server is running on http://127.0.0.1:8000
//
// RUN:  PID=<participantId> EMAIL=<email> PW=<password> node scripts/test_full_flow.mjs
import { readFileSync } from 'node:fs';
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, getDoc, setDoc, collection, getDocs } from 'firebase/firestore';

const env = Object.fromEntries(
  readFileSync(new URL('../.env', import.meta.url), 'utf8')
    .split('\n').filter((l) => l.includes('=') && !l.trim().startsWith('#'))
    .map((l) => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim()]; }),
);
const app = initializeApp({
  apiKey: env.VITE_FIREBASE_API_KEY, authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: env.VITE_FIREBASE_PROJECT_ID, storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID, appId: env.VITE_FIREBASE_APP_ID,
});
const auth = getAuth(app), db = getFirestore(app);

const PID = process.env.PID || 'TEST_PATIENT_1';
const EMAIL = process.env.EMAIL || '9876543210@participant.kiosk.local';
const PW = process.env.PW || 'Mindcheck123!';
const SERVER = 'http://127.0.0.1:8000';
const POS = new Set(['calm', 'happy', 'grateful', 'hopeful', 'content', 'relaxed']);
const NEG = new Set(['sad', 'anxious', 'angry', 'stressed', 'tired', 'lonely', 'hopeless', 'worried']);

// a week of fake-but-realistic daily data
const week = [
  ['2026-07-01', 'morning', 6, 4, 5, 6, 'calm', 'Felt a little better after sleeping on time.'],
  ['2026-07-02', 'morning', 5, 5, 4, 5, 'tired', 'Groggy but okay.'],
  ['2026-07-03', 'morning', 7, 3, 6, 7, 'hopeful', 'Good day, went for a walk.'],
  ['2026-07-04', 'morning', 6, 4, 5, 6, 'calm', 'Steady.'],
  ['2026-07-05', 'morning', 8, 2, 7, 8, 'happy', 'Really good day.'],
  ['2026-07-06', 'morning', 5, 6, 4, 5, 'anxious', 'Stressful morning.'],
  ['2026-07-07', 'morning', 7, 3, 6, 7, 'content', 'Calm and productive.'],
];

async function main() {
  await signInWithEmailAndPassword(auth, EMAIL, PW);
  console.log('Signed in:', EMAIL, '(uid', auth.currentUser.uid + ')');

  const pdoc = await getDoc(doc(db, 'participants', PID));
  if (!pdoc.exists()) throw new Error(`participants/${PID} not found — create it in the console first (step 2).`);
  if (pdoc.data().authUid !== auth.currentUser.uid)
    throw new Error(`participants/${PID}.authUid does not match this user's uid — set it to ${auth.currentUser.uid} in the console.`);
  console.log(`participants/${PID} found and owned by this patient. Writing week of data...`);

  for (let i = 0; i < week.length; i++) {
    const [date, tod, mood, dis, en, sl, emo, text] = week[i];
    await setDoc(doc(db, 'participants', PID, 'mc_ema', `${date}-${tod}`), {
      date, time_of_day: tod, questions: [
        { key: 'mood', value: mood }, { key: 'distress', value: dis },
        { key: 'energy', value: en }, { key: 'sleep', value: sl }],
    });
    await setDoc(doc(db, 'participants', PID, 'mc_journal', `${date}-j`), {
      date, journal_text: text, emotions: [emo], mood_intensities: { [emo]: mood },
    });
    await setDoc(doc(db, 'participants', PID, 'mc_games', `${date}-attention`), {
      game_type: 'attention', played: true, metrics: {  // MindCheck's REAL shape:
        accuracy: Math.round(68 + mood * 3),             //   0-100 %
        averageReactionTime: Math.round(900 - en * 40),  //   milliseconds
        averageSpan: 4 + (en > 5 ? 1 : 0) },
    });
  }

  const ema = (await getDocs(collection(db, 'participants', PID, 'mc_ema'))).docs.map((d) => d.data());
  const jr = (await getDocs(collection(db, 'participants', PID, 'mc_journal'))).docs.map((d) => d.data());
  const gm = (await getDocs(collection(db, 'participants', PID, 'mc_games'))).docs.map((d) => d.data());
  console.log(`Read back from Firebase -> mc_ema:${ema.length} mc_journal:${jr.length} mc_games:${gm.length}`);

  const days = 7; let mood = 0, dis = 0, en = 0, sl = 0, cnt = 0; const set = new Set();
  for (const d of ema) { set.add(d.date); for (const q of (d.questions || [])) { const v = +q.value; cnt++;
    const k = q.key; if (k === 'mood') mood += v; else if (k === 'distress') dis += v; else if (k === 'energy') en += v; else if (k === 'sleep') sl += v; } }
  const avg = (s) => (cnt ? s / cnt : 0);
  let pos = 0, neg = 0, tot = 0; for (const j of jr) for (const e of (j.emotions || [])) { tot++; if (POS.has(e)) pos++; if (NEG.has(e)) neg++; }
  let acc = 0, an = 0, mem = 0, mn = 0, rt = 0, rn = 0;
  for (const g of gm) {                        // mirror the fixed Dart builder
    const m = g.metrics || {};
    const attn = m.accuracy ?? m.attention_accuracy;
    const span = m.averageSpan ?? m.longestSpan ?? m.memory_span ?? m.span;
    const rtv = m.averageReactionTime ?? m.reaction_time_sec ?? m.reaction_time;
    if (attn != null) { acc += (+attn > 1 ? +attn / 100 : +attn); an++; }   // % -> 0..1
    if (span != null) { mem += +span; mn++; }
    if (rtv != null) { rt += (+rtv > 20 ? +rtv / 1000 : +rtv); rn++; }        // ms -> sec
  }
  const feat = [34, 1, 1, 0, 6, 5, 28, days, avg(mood), avg(dis), avg(en), avg(sl),
    set.size / days, jr.length, tot ? neg / tot : 0, tot ? pos / tot : 0, gm.length,
    an ? acc / an : 0, mn ? mem / mn : 0, rn ? rt / rn : 0];

  const spec = await (await fetch(`${SERVER}/federated/feature-spec?layer=questionnaire%2Bema`)).json();
  const model = await (await fetch(`${SERVER}/federated/model?layer=questionnaire%2Bema`)).json();
  const n = spec.featureNames.length, w = model.weights;
  const sd = (i) => (feat[i] - spec.featureMean[i]) / (spec.featureStd[i] || 1);
  const relu = (z) => (z > 0 ? z : 0), sig = (z) => 1 / (1 + Math.exp(-z));
  const h = [0, 1].map((j) => relu(w[2 * n + j] + feat.map((_, i) => sd(i) * w[2 * i + j]).reduce((a, b) => a + b)));
  const prob = sig(w[2 * n + 4] + h[0] * w[2 * n + 2] + h[1] * w[2 * n + 3]);
  console.log('\n=== REAL END-TO-END PREDICTION (real Firebase data -> model) ===');
  console.log(JSON.stringify({ probability_of_response: +prob.toFixed(3), percent: Math.round(prob * 100),
    label: prob >= 0.5 ? 'Responder' : 'Non-responder',
    confidence: Math.abs(prob - 0.5) >= 0.3 ? 'high' : Math.abs(prob - 0.5) >= 0.15 ? 'medium' : 'low',
    layer_used: 'questionnaire+ema', model_version: model.version }, null, 2));
  process.exit(0);
}
main().catch((e) => { console.error('FAILED:', e.message); process.exit(1); });
