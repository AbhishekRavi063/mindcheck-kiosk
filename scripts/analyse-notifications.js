/**
 * MindCheck — Notification & Consent Health Report
 *
 * Usage:
 *   node scripts/analyse-notifications.js
 *
 * Requires: firebase-service-account.json in project root
 * OR set GOOGLE_APPLICATION_CREDENTIALS=/path/to/key.json
 */

const admin = require('firebase-admin');
const path  = require('path');
const fs    = require('fs');

// ─── Init ──────────────────────────────────────────────────────────────────────
const serviceAccountPath = process.env.GOOGLE_APPLICATION_CREDENTIALS
  || path.join(__dirname, '../firebase-service-account.json');

if (!fs.existsSync(serviceAccountPath)) {
  console.error(`❌ Service account key not found at: ${serviceAccountPath}`);
  process.exit(1);
}

admin.initializeApp({
  credential: admin.credential.cert(require(serviceAccountPath)),
});

const db = admin.firestore();

// ─── Helpers ───────────────────────────────────────────────────────────────────
const W = 56;

function line(char = '─') { return char.repeat(W); }

function header(title) {
  console.log('\n' + line('═'));
  console.log(`  ${title}`);
  console.log(line('═'));
}

function section(title) {
  console.log('\n  ' + title);
  console.log('  ' + line('─').slice(0, W - 2));
}

function row(label, count, total, extra = '') {
  const pct   = total > 0 ? ((count / total) * 100).toFixed(1) : '0.0';
  const badge = `${String(count).padStart(4)}  (${pct.padStart(5)}%)`;
  const tail  = extra ? `  ${extra}` : '';
  console.log(`    ${label.padEnd(32)} ${badge}${tail}`);
}

function detail(label, value) {
  console.log(`    ${label.padEnd(32)} ${value}`);
}

function fmtDate(ts) {
  if (!ts) return null;
  return (ts.toDate ? ts.toDate() : new Date(ts)).toISOString().split('T')[0];
}

function hasToken(u) {
  return typeof u.fcmToken === 'string' && u.fcmToken.trim().length > 0;
}

function escapeCSV(val) {
  if (val == null) return '';
  const str = String(val);
  return str.includes(',') || str.includes('"') || str.includes('\n')
    ? `"${str.replace(/"/g, '""')}"` : str;
}

function csvRow(...cols) {
  return cols.map(escapeCSV).join(',');
}

function userStatus(u) {
  if (u.cloudSyncEnabled === false || u.cloudSyncEnabled == null) return 'no_consent';
  if (u.notificationPrefs?.reminders !== true)                    return 'no_reminders';
  if (!hasToken(u))                                               return 'broken';
  if (u.notificationPrefs?.lastNotifiedAt != null)                return 'working';
  return 'pending';
}

// ─── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  const snap     = await db.collection('users').get();
  const FROM     = new Date('2026-05-30T00:00:00.000Z');
  const allUsers = snap.docs.map(d => ({ uid: d.id, ...d.data() }));
  const users    = allUsers.filter(u => {
    const t = u.cloudSyncConsentAt?.toDate?.() ?? null;
    return t && t >= FROM;
  });
  const N = users.length;

  // ── Pre-compute slices ────────────────────────────────────────────────────
  const syncTrue    = users.filter(u => u.cloudSyncEnabled === true);
  const syncFalse   = users.filter(u => u.cloudSyncEnabled === false);
  const syncMissing = users.filter(u => u.cloudSyncEnabled == null);

  const remTrue  = users.filter(u => u.notificationPrefs?.reminders === true);
  const remFalse = users.filter(u => u.notificationPrefs?.reminders === false);
  const RT       = remTrue.length;

  const freqCounts = {};
  const timeCounts = {};
  for (const u of remTrue) {
    const f = u.notificationPrefs?.frequency    ?? 'unknown';
    const t = u.notificationPrefs?.timePreference ?? 'unknown';
    freqCounts[f] = (freqCounts[f] || 0) + 1;
    timeCounts[t] = (timeCounts[t] || 0) + 1;
  }

  const withToken    = remTrue.filter(u =>  hasToken(u));
  const withoutToken = remTrue.filter(u => !hasToken(u));
  const WT           = withToken.length;

  const notifiedSet  = withToken.filter(u => u.notificationPrefs?.lastNotifiedAt != null);
  const notifiedNull = withToken.filter(u => u.notificationPrefs?.lastNotifiedAt == null);

  // ── Header ────────────────────────────────────────────────────────────────
  header('MINDCHECK — NOTIFICATION & CONSENT HEALTH REPORT');
  console.log(`  Run at:     ${new Date().toISOString()}`);
  console.log(`  Filter:     consentAt >= 2026-05-30`);
  console.log(`  Total users (all): ${allUsers.length}  →  filtered: ${N}`);

  // ── 1. Cloud Sync Consent ─────────────────────────────────────────────────
  header('1. CLOUD SYNC CONSENT');
  row('cloudSyncEnabled: true',    syncTrue.length,    N);
  row('cloudSyncEnabled: false',   syncFalse.length,   N);
  row('cloudSyncEnabled: missing', syncMissing.length, N, '← old users, pre-consent flow');

  // ── 2. Notification Preferences ───────────────────────────────────────────
  header('2. NOTIFICATION PREFERENCES');
  row('reminders: true',  remTrue.length,  N);
  row('reminders: false', remFalse.length, N);
  row('reminders: missing/null',
    N - remTrue.length - remFalse.length, N);

  section('Frequency (reminders: true only)');
  const freqOrder = ['weekly', 'twice-weekly', 'monthly', 'unknown'];
  for (const f of [...freqOrder, ...Object.keys(freqCounts).filter(k => !freqOrder.includes(k))]) {
    if (freqCounts[f]) row(f, freqCounts[f], RT);
  }

  section('Time preference (reminders: true only)');
  const timeOrder = ['morning', 'afternoon', 'evening', 'unknown'];
  for (const t of [...timeOrder, ...Object.keys(timeCounts).filter(k => !timeOrder.includes(k))]) {
    if (timeCounts[t]) row(t, timeCounts[t], RT);
  }

  // ── 3. FCM Token Health ───────────────────────────────────────────────────
  header('3. FCM TOKEN HEALTH  (base: reminders=true users)');
  detail('Base (reminders: true)', RT);
  console.log();
  row('Has valid fcmToken',   WT,                RT);
  row('Missing fcmToken',     withoutToken.length, RT, '← BROKEN — will never receive');
  console.log();
  row('  of token holders: lastNotifiedAt set',  notifiedSet.length,  WT);
  row('  of token holders: lastNotifiedAt null', notifiedNull.length, WT);

  // ── 4. Broken Users Detail ────────────────────────────────────────────────
  header('4. BROKEN USERS  (reminders=true, fcmToken missing)');
  if (withoutToken.length === 0) {
    console.log('  None — all reminder users have a token.');
  } else {
    console.log(`  ${'UID (first 12)'.padEnd(14)}  ${'Consent date'.padEnd(12)}  ${'timePreference'.padEnd(14)}  frequency`);
    console.log('  ' + line('─').slice(0, W - 2));
    for (const u of withoutToken) {
      const uid   = u.uid.slice(0, 12);
      const date  = fmtDate(u.cloudSyncConsentAt) ?? 'unknown    ';
      const tp    = (u.notificationPrefs?.timePreference ?? 'unknown').padEnd(14);
      const freq  = u.notificationPrefs?.frequency ?? 'unknown';
      console.log(`  ${uid.padEnd(14)}  ${date.padEnd(12)}  ${tp}  ${freq}`);
    }
  }

  // ── 5. Delivery Summary ───────────────────────────────────────────────────
  header('5. NOTIFICATION DELIVERY SUMMARY');
  row('Definitely received (token + lastNotifiedAt set)',  notifiedSet.length,    N);
  row('Pending first send  (token, lastNotifiedAt null)',  notifiedNull.length,   N);
  row('Will never receive  (reminders=true, no token)',    withoutToken.length,   N, '← broken');
  row('Not opted in        (reminders=false or missing)',  N - RT,                N);

  console.log('\n' + line('═') + '\n');

  // ── CSV export ────────────────────────────────────────────────────────────
  const csvLines = [
    csvRow('uid','consentDate','cloudSyncEnabled','notifReminders',
           'notifFrequency','notifTime','fcmTokenPresent','lastNotifiedAt','status'),
    ...users.map(u => csvRow(
      u.uid,
      fmtDate(u.cloudSyncConsentAt),
      u.cloudSyncEnabled ?? '',
      u.notificationPrefs?.reminders ?? '',
      u.notificationPrefs?.frequency ?? '',
      u.notificationPrefs?.timePreference ?? '',
      hasToken(u),
      fmtDate(u.notificationPrefs?.lastNotifiedAt),
      userStatus(u),
    )),
  ];

  const csvPath = path.join(__dirname, 'notification-health-report.csv');
  fs.writeFileSync(csvPath, csvLines.join('\n'));
  console.log(`📄 CSV exported: ${csvPath}\n`);

  process.exit(0);
}

main().catch(err => { console.error('❌ Failed:', err); process.exit(1); });
