// Verifies the physician self-registration rules against the live project.
//
// A therapist may only join the clinic their join code names. clientId grants
// read access to a clinic's whole patient roster, so a self-asserted one would
// let anyone who can sign up read any clinic.
//
// Usage:
//   node scripts/verify_physician_rules.mjs <CLIENT_ID> <JOIN_CODE>

import { readFileSync } from 'node:fs';
import { initializeApp } from 'firebase/app';
import {
  getAuth,
  createUserWithEmailAndPassword,
  deleteUser,
} from 'firebase/auth';
import { getFirestore, doc, setDoc, collection } from 'firebase/firestore';

const env = Object.fromEntries(
  readFileSync(new URL('../.env', import.meta.url), 'utf8')
    .split('\n')
    .filter((l) => l.includes('=') && !l.trim().startsWith('#'))
    .map((l) => {
      const i = l.indexOf('=');
      return [l.slice(0, i).trim(), l.slice(i + 1).trim()];
    }),
);

const cfg = {
  apiKey: env.VITE_FIREBASE_API_KEY,
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: env.VITE_FIREBASE_APP_ID,
};

const CLIENT = process.argv[2] || 'testclient';
const CODE = process.argv[3] ? process.argv[3].toUpperCase() : null;

const app = initializeApp(cfg);
const auth = getAuth(app);
const db = getFirestore(app);

let passed = 0;
let failed = 0;

async function expectDenied(name, fn) {
  try {
    await fn();
    failed++;
    console.log(`  FAIL  ${name}`);
    console.log('        write was ALLOWED but should have been denied');
  } catch (e) {
    if (String(e?.code ?? e).includes('permission-denied')) {
      passed++;
      console.log(`  ok    ${name}`);
    } else {
      failed++;
      console.log(`  FAIL  ${name}  (unexpected: ${e?.code ?? e})`);
    }
  }
}

async function expectAllowed(name, fn) {
  try {
    await fn();
    passed++;
    console.log(`  ok    ${name}`);
  } catch (e) {
    failed++;
    console.log(`  FAIL  ${name}  (denied: ${e?.code ?? e})`);
  }
}

const email = `ruletest_${Date.now()}@test.local`;
const cred = await createUserWithEmailAndPassword(auth, email, 'RuleTest123!');
const uid = cred.user.uid;

console.log(`project: ${cfg.projectId}`);
console.log(`clinic under test: ${CLIENT}`);
console.log(`throwaway account: ${email}\n`);

try {
  console.log('users/{uid} — cannot be fabricated');
  await expectDenied('cannot claim a physician document it does not own', () =>
    setDoc(doc(db, 'users', uid), {
      role: 'physician',
      physicianId: 'PHYS_FAKE',
      clientId: CLIENT,
      email,
    }),
  );
  await expectDenied("cannot write another user's users doc", () =>
    setDoc(doc(db, 'users', 'some-other-uid'), {
      role: 'physician',
      physicianId: 'PHYS_FAKE',
      clientId: CLIENT,
      email,
    }),
  );

  console.log('\nphysicians/{id} — join code required');
  await expectDenied('cannot register with no join code at all', () =>
    setDoc(doc(collection(db, 'physicians')), {
      clientId: CLIENT,
      email,
      displayName: 'Rule Test',
      authUid: uid,
      enabledTestIds: [],
    }),
  );
  await expectDenied('cannot register with a made-up join code', () =>
    setDoc(doc(collection(db, 'physicians')), {
      clientId: CLIENT,
      email,
      displayName: 'Rule Test',
      authUid: uid,
      enabledTestIds: [],
      joinCode: 'NOPE-9999',
    }),
  );
  await expectDenied('cannot create a physician doc owned by someone else', () =>
    setDoc(doc(collection(db, 'physicians')), {
      clientId: CLIENT,
      email,
      displayName: 'Rule Test',
      authUid: 'some-other-uid',
      enabledTestIds: [],
      joinCode: CODE ?? 'NOPE-9999',
    }),
  );

  if (CODE) {
    await expectDenied(
      'cannot point a real join code at a different clinic',
      () =>
        setDoc(doc(collection(db, 'physicians')), {
          clientId: `${CLIENT}_other`,
          email,
          displayName: 'Rule Test',
          authUid: uid,
          enabledTestIds: [],
          joinCode: CODE,
        }),
    );
    await expectAllowed('can register into the clinic the code names', () =>
      setDoc(doc(collection(db, 'physicians')), {
        clientId: CLIENT,
        email,
        displayName: 'Rule Test',
        authUid: uid,
        enabledTestIds: [],
        joinCode: CODE,
      }),
    );
  } else {
    console.log('\n  (no join code passed — skipping code-bound checks)');
  }
} catch (e) {
  failed++;
  console.log(`\n  FAIL  harness error: ${e?.code ?? e}`);
} finally {
  await deleteUser(cred.user).catch(() => {});
  console.log(`\n${passed} passed, ${failed} failed`);
  process.exit(failed === 0 ? 0 : 1);
}
