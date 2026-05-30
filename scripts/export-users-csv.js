/**
 * MindCheck — Firestore to CSV Export Script
 *
 * Usage:
 *   node scripts/export-users-csv.js --from 2026-05-30
 *   node scripts/export-users-csv.js --from 2026-05-30 --to 2026-06-30
 *   node scripts/export-users-csv.js  (exports all users)
 *
 * Requires: GOOGLE_APPLICATION_CREDENTIALS env var pointing to your
 * Firebase service account JSON key file.
 *
 * Get the key from:
 * Firebase Console → Project Settings → Service accounts → Generate new private key
 */

const admin = require('firebase-admin');
const fs    = require('fs');
const path  = require('path');

// ─── Args ─────────────────────────────────────────────────────────────────────
const args     = process.argv.slice(2);
const fromIdx  = args.indexOf('--from');
const toIdx    = args.indexOf('--to');
const fromDate = fromIdx !== -1 ? new Date(args[fromIdx + 1] + 'T00:00:00.000Z') : null;
const toDate   = toIdx   !== -1 ? new Date(args[toIdx   + 1] + 'T23:59:59.999Z') : null;

// ─── Init Firebase Admin ──────────────────────────────────────────────────────
const serviceAccountPath = process.env.GOOGLE_APPLICATION_CREDENTIALS
  || path.join(__dirname, '../firebase-service-account.json');

if (!fs.existsSync(serviceAccountPath)) {
  console.error(`
❌ Service account key not found at: ${serviceAccountPath}

To fix:
1. Go to Firebase Console → Project Settings → Service accounts
2. Click "Generate new private key" → download the JSON
3. Save it as firebase-service-account.json in the project root
   OR set GOOGLE_APPLICATION_CREDENTIALS=/path/to/key.json
`);
  process.exit(1);
}

admin.initializeApp({
  credential: admin.credential.cert(require(serviceAccountPath)),
});

const db = admin.firestore();

// ─── Helpers ──────────────────────────────────────────────────────────────────
function escapeCSV(val) {
  if (val == null) return '';
  const str = String(val);
  return str.includes(',') || str.includes('"') || str.includes('\n')
    ? `"${str.replace(/"/g, '""')}"`
    : str;
}

function row(...cols) {
  return cols.map(escapeCSV).join(',');
}

function fmtDate(ts) {
  if (!ts) return '';
  const d = ts.toDate ? ts.toDate() : new Date(ts);
  return d.toISOString().split('T')[0];
}

// ─── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  console.log('📦 Fetching users from Firestore...');
  if (fromDate) console.log(`   From: ${fromDate.toISOString().split('T')[0]}`);
  if (toDate)   console.log(`   To:   ${toDate.toISOString().split('T')[0]}`);

  // ── 1. Fetch all users ─────────────────────────────────────────────────────
  let usersQuery = db.collection('users');
  const usersSnap = await usersQuery.get();

  const users = usersSnap.docs
    .map(d => ({ uid: d.id, ...d.data() }))
    .filter(u => {
      const consentAt = u.cloudSyncConsentAt?.toDate?.() ?? null;
      if (!consentAt) return false;
      if (fromDate && consentAt < fromDate) return false;
      if (toDate   && consentAt > toDate)   return false;
      return true;
    });

  console.log(`✅ Found ${users.length} user(s) in date range.`);

  if (users.length === 0) {
    console.log('No users found. Exiting.');
    process.exit(0);
  }

  const dateTag  = fromDate ? fromDate.toISOString().split('T')[0] : 'all';
  const outDir   = path.join(__dirname, '../exports');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir);

  // ── 2. Users summary CSV ───────────────────────────────────────────────────
  const userLines = [
    row('uid','consentDate','cloudSyncEnabled','notifReminders','notifFrequency','notifTime','fcmRegistered'),
    ...users.map(u => row(
      u.uid,
      fmtDate(u.cloudSyncConsentAt),
      u.cloudSyncEnabled ?? '',
      u.notificationPrefs?.reminders ?? '',
      u.notificationPrefs?.frequency ?? '',
      u.notificationPrefs?.timePreference ?? '',
      u.fcmRegistered ?? false,
    ))
  ];
  const usersFile = path.join(outDir, `users-${dateTag}.csv`);
  fs.writeFileSync(usersFile, userLines.join('\n'));
  console.log(`📄 Users CSV: ${usersFile}`);

  // ── 3. Activity CSV ────────────────────────────────────────────────────────
  const activityLines = [row('uid','date','event','source')];
  for (const u of users) {
    const snap = await db.collection('users').doc(u.uid).collection('activity').get();
    for (const doc of snap.docs) {
      const d = doc.data();
      activityLines.push(row(u.uid, d.date ?? fmtDate(d._ts), d.event, d.metadata?.source ?? ''));
    }
  }
  const activityFile = path.join(outDir, `activity-${dateTag}.csv`);
  fs.writeFileSync(activityFile, activityLines.join('\n'));
  console.log(`📄 Activity CSV: ${activityFile}`);

  // ── 4. Questionnaires CSV ─────────────────────────────────────────────────
  const qLines = [row('uid','date','questionnaire_type','checkin_type','total_score','severity_label')];
  for (const u of users) {
    const snap = await db.collection('users').doc(u.uid).collection('questionnaires').get();
    for (const doc of snap.docs) {
      const d = doc.data();
      qLines.push(row(u.uid, fmtDate(d._ts), d.questionnaire_type, d.checkin_type, d.total_score, d.severity_label));
    }
  }
  const qFile = path.join(outDir, `questionnaires-${dateTag}.csv`);
  fs.writeFileSync(qFile, qLines.join('\n'));
  console.log(`📄 Questionnaires CSV: ${qFile}`);

  // ── 5. Games CSV ───────────────────────────────────────────────────────────
  const gameLines = [row('uid','date','game_type','checkin_type','played','accuracy','avgReactionTime','inhibitionScore','longestSpan')];
  for (const u of users) {
    const snap = await db.collection('users').doc(u.uid).collection('games').get();
    for (const doc of snap.docs) {
      const d = doc.data();
      const m = d.metrics ?? {};
      gameLines.push(row(
        u.uid, fmtDate(d._ts), d.game_type, d.checkin_type, d.played,
        m.accuracy ?? '', m.averageReactionTime ?? '', m.inhibitionScore ?? '',
        m.longestSpan ?? m.longestSequence ?? '',
      ));
    }
  }
  const gameFile = path.join(outDir, `games-${dateTag}.csv`);
  fs.writeFileSync(gameFile, gameLines.join('\n'));
  console.log(`📄 Games CSV: ${gameFile}`);

  // ── 6. Day logs (EMA) CSV ─────────────────────────────────────────────────
  const emaLines = [row('uid','date','time_of_day','question','response')];
  for (const u of users) {
    const snap = await db.collection('users').doc(u.uid).collection('daylogs').get();
    for (const doc of snap.docs) {
      const d = doc.data();
      for (const q of (d.questions ?? [])) {
        emaLines.push(row(u.uid, fmtDate(d._ts), d.time_of_day, q.question_text, q.response));
      }
    }
  }
  const emaFile = path.join(outDir, `daylogs-${dateTag}.csv`);
  fs.writeFileSync(emaFile, emaLines.join('\n'));
  console.log(`📄 Day logs CSV: ${emaFile}`);

  console.log(`\n✅ All done! Files saved to: ${outDir}/`);
  process.exit(0);
}

main().catch(err => {
  console.error('❌ Export failed:', err);
  process.exit(1);
});
