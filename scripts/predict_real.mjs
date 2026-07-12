// Reads the REAL seeded MindCheck data from Firebase, builds the feature vector,
// pulls weights from the local federated server, and runs the actual model.
// This is the true data -> model -> prediction flow (minus the Flutter UI).
import { readFileSync } from 'node:fs';
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, getDoc, collection, getDocs } from 'firebase/firestore';

// load .env
const env = Object.fromEntries(
  readFileSync(new URL('../.env', import.meta.url), 'utf8')
    .split('\n').filter((l) => l.includes('=') && !l.trim().startsWith('#'))
    .map((l) => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim()]; }),
);

const app = initializeApp({
  apiKey: env.VITE_FIREBASE_API_KEY,
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: env.VITE_FIREBASE_APP_ID,
});
const auth = getAuth(app);
const db = getFirestore(app);

const PID = process.env.PID || 'TEST_MINDCHECK_001';
const PASS = process.env.PW || 'Mindcheck123!';
const SERVER = 'http://127.0.0.1:8000';
const POS = new Set(['calm', 'happy', 'grateful', 'hopeful', 'content', 'relaxed']);
const NEG = new Set(['sad', 'anxious', 'angry', 'stressed', 'tired', 'lonely', 'hopeless', 'worried']);

async function login() {
  for (const email of ['9876543210@mindcheck.clinic', '9876543210@participant.kiosk.local']) {
    try { await signInWithEmailAndPassword(auth, email, PASS); return email; }
    catch { /* try next */ }
  }
  throw new Error('could not sign in as the seeded patient with either domain');
}

async function main() {
  const who = await login();
  console.log('Signed in as:', who, '(uid', auth.currentUser.uid + ')');

  const pdoc = await getDoc(doc(db, 'participants', PID));
  console.log('Participant doc readable:', pdoc.exists(),
    '| authUid on doc matches me:', pdoc.data()?.authUid === auth.currentUser.uid);

  const ema = (await getDocs(collection(db, 'participants', PID, 'mc_ema'))).docs.map((d) => d.data());
  const jr = (await getDocs(collection(db, 'participants', PID, 'mc_journal'))).docs.map((d) => d.data());
  const gm = (await getDocs(collection(db, 'participants', PID, 'mc_games'))).docs.map((d) => d.data());
  console.log(`REAL data read from Firebase -> mc_ema:${ema.length} mc_journal:${jr.length} mc_games:${gm.length}`);

  // ---- build features (same logic as the Dart MindcheckFeatureBuilder) ----
  const daysSinceV1 = 7;
  let mood = 0, dis = 0, en = 0, sl = 0, cnt = 0; const emaDays = new Set();
  for (const d of ema) {
    emaDays.add(d.date);
    for (const q of (d.questions || [])) {
      const v = Number(q.value ?? q.response); if (Number.isNaN(v)) continue;
      const k = String(q.key || '').toLowerCase(); cnt++;
      if (k.includes('mood')) mood += v; else if (k.includes('distress')) dis += v;
      else if (k.includes('energy')) en += v; else if (k.includes('sleep')) sl += v; else mood += v;
    }
  }
  const avg = (s) => (cnt ? s / cnt : 0);
  let pos = 0, neg = 0, tot = 0;
  for (const j of jr) for (const e of (j.emotions || [])) { tot++; if (POS.has(e)) pos++; if (NEG.has(e)) neg++; }
  let acc = 0, an = 0, mem = 0, mn = 0, rt = 0, rn = 0;
  for (const g of gm) {
    const m = g.metrics || {};
    if (m.accuracy != null) { acc += Number(m.accuracy); an++; }
    if (m.averageDigitSpan != null) { mem += Number(m.averageDigitSpan); mn++; }
    if (m.averageReactionTime != null) { rt += Number(m.averageReactionTime); rn++; }
  }
  // questionnaire (from the clinic session — realistic values for the demo)
  const feat = [
    34, 1, 1, 0, 6, 5, 28, daysSinceV1,
    avg(mood), avg(dis), avg(en), avg(sl), emaDays.size / daysSinceV1,
    jr.length, tot ? neg / tot : 0, tot ? pos / tot : 0,
    gm.length, an ? acc / an : 0, mn ? mem / mn : 0, rn ? rt / rn : 0,
  ];
  console.log('Feature vector (20):', feat.map((x) => Math.round(x * 100) / 100).join(', '));

  // ---- fetch weights + predict (same math as the Dart FederatedMlp) ----
  const spec = await (await fetch(`${SERVER}/federated/feature-spec?layer=questionnaire%2Bema`)).json();
  const model = await (await fetch(`${SERVER}/federated/model?layer=questionnaire%2Bema`)).json();
  const n = spec.featureNames.length, w = model.weights;
  const std = (i) => (feat[i] - spec.featureMean[i]) / (spec.featureStd[i] || 1);
  const relu = (z) => (z > 0 ? z : 0), sig = (z) => 1 / (1 + Math.exp(-z));
  const h = [0, 1].map((jn) => relu(w[2 * n + jn] + feat.map((_, i) => std(i) * w[2 * i + jn]).reduce((a, b) => a + b)));
  const prob = sig(w[2 * n + 4] + h[0] * w[2 * n + 2] + h[1] * w[2 * n + 3]);

  console.log('\n=== REAL END-TO-END PREDICTION (real Firebase data -> real model) ===');
  console.log(JSON.stringify({
    probability_of_response: Math.round(prob * 1000) / 1000,
    percent: Math.round(prob * 100),
    label: prob >= 0.5 ? 'Responder' : 'Non-responder',
    confidence: Math.abs(prob - 0.5) >= 0.3 ? 'high' : Math.abs(prob - 0.5) >= 0.15 ? 'medium' : 'low',
    layer_used: 'questionnaire+ema', model_version: model.version,
  }, null, 2));
  process.exit(0);
}
main().catch((e) => { console.error('FAILED:', e.message); process.exit(1); });
