const PDFDocument = require('pdfkit');
const fs = require('fs');

const doc = new PDFDocument({ margin: 50, size: 'A4' });
doc.pipe(fs.createWriteStream('exports/MindCheck_User_Report_June2026.pdf'));

const BROWN  = '#8d654c';
const DARK   = '#1a1410';
const LIGHT  = '#6b7280';

function h1(text) {
  doc.fontSize(20).fillColor(DARK).font('Helvetica-Bold').text(text).moveDown(0.4);
}
function h2(text) {
  doc.fontSize(13).fillColor(BROWN).font('Helvetica-Bold').text(text).moveDown(0.3);
}
function h3(text) {
  doc.fontSize(11).fillColor(BROWN).font('Helvetica-Bold').text(text).moveDown(0.2);
}
function body(text) {
  doc.fontSize(10).fillColor(DARK).font('Helvetica').text(text, { lineGap: 3 }).moveDown(0.4);
}
function note(text) {
  doc.fontSize(9).fillColor(LIGHT).font('Helvetica-Oblique').text(text, { lineGap: 2 }).moveDown(0.4);
}
function divider() {
  doc.moveTo(50, doc.y).lineTo(545, doc.y).strokeColor('#e5d5c8').lineWidth(1).stroke().moveDown(0.6);
}
function tableRow(cols, widths, isHeader) {
  const x0 = 50;
  let x = x0;
  const y = doc.y;
  const rowH = 18;
  const totalW = widths.reduce((a, b) => a + b, 0);
  if (isHeader) {
    doc.rect(x0, y, totalW, rowH).fill('#f5ede6');
    doc.fillColor(BROWN);
  } else {
    doc.fillColor(DARK);
  }
  cols.forEach((col, i) => {
    doc.fontSize(9).font(isHeader ? 'Helvetica-Bold' : 'Helvetica')
      .text(col, x + 4, y + 4, { width: widths[i] - 8, lineBreak: false });
    x += widths[i];
  });
  doc.y = y + rowH;
}

// ── Cover ──────────────────────────────────────────────────────────────────────
doc.rect(0, 0, 595, 160).fill(BROWN);
doc.fontSize(26).fillColor('white').font('Helvetica-Bold').text('MindCheck PWA', 50, 48);
doc.fontSize(14).fillColor('white').font('Helvetica').text('User Analytics Report', 50, 82);
doc.fontSize(10).fillColor('white').font('Helvetica').text('Period: 30 May 2026 – 3 June 2026   |   Generated: 3 June 2026', 50, 108);
doc.fontSize(10).fillColor('white').font('Helvetica').text('Dataset: 101 users  |  Source: Firestore (cloud-sync-enabled users only)', 50, 128);
doc.y = 185;

// ── 1. Acquisition ─────────────────────────────────────────────────────────────
h1('1. User Acquisition');
body('73 users (72%) signed up on launch day (30 May). The remaining 28% arrived organically over the following days. Note: this dataset only includes users who enabled cloud backup — actual installs may be higher.');
tableRow(['Date', 'New Users', 'Cumulative'], [180, 130, 130], true);
[
  ['30 May 2026', '73', '73'],
  ['31 May 2026', '14', '87'],
  ['1 June 2026', '11', '98'],
  ['3 June 2026', '3', '101'],
].forEach(r => tableRow(r, [180, 130, 130], false));
doc.moveDown(1);

// ── 2. Retention ───────────────────────────────────────────────────────────────
divider();
h1('2. Retention');
body('35 of 101 users (35%) returned after their signup day. 66 users (65%) opened the app once and did not return. Day-2 retention (31 May) was the strongest at 19 users.');
tableRow(['Date', 'Returning Users', 'Notes'], [160, 130, 210], true);
[
  ['31 May 2026', '19', 'Day-2 — strongest return day'],
  ['1 June 2026', '16', 'Day-3'],
  ['2 June 2026', '1',  'Quiet day'],
  ['3 June 2026', '4',  'Ongoing (partial day)'],
].forEach(r => tableRow(r, [160, 130, 210], false));
doc.moveDown(0.5);
note('65% of users never returned. Re-engagement push notifications are the primary lever — but currently broken (see Section 3).');
doc.moveDown(1);

// ── 3. Cloud Sync & Notifications ─────────────────────────────────────────────
divider();
h1('3. Cloud Sync & Notifications');
tableRow(['Metric', 'Count', '% of 101'], [240, 100, 110], true);
[
  ['Cloud sync enabled',           '98', '97%'],
  ['Notification reminders on',    '36', '36%'],
  ['FCM token registered',         '1',  '1%' ],
].forEach(r => tableRow(r, [240, 100, 110], false));
doc.moveDown(0.5);
note('CRITICAL: 36 users opted into push notifications but only 1 has a working FCM token. Notifications are silently failing for 35 users. Root cause: the browser permission prompt fires outside a direct user gesture during onboarding, so it is auto-denied by mobile browsers.');
doc.moveDown(0.5);

h3('Notification frequency (37 who configured)');
tableRow(['Frequency', 'Users'], [220, 150], true);
[['Weekly', '20'], ['Twice-weekly', '15'], ['Monthly', '2']].forEach(r => tableRow(r, [220, 150], false));
doc.moveDown(0.5);

h3('Preferred notification time');
tableRow(['Time', 'Users'], [220, 150], true);
[['Morning (9 AM)', '19'], ['Evening (8 PM)', '17'], ['Afternoon (2 PM)', '1'], ['Not configured', '64']].forEach(r => tableRow(r, [220, 150], false));
doc.moveDown(1);

// ── 4. Check-in Engagement ─────────────────────────────────────────────────────
divider();
h1('4. Check-in Engagement');
body('63% of users completed at least one questionnaire. Guided (full) check-ins represent 86% of all questionnaire completions vs 14% for individual questionnaires.');
tableRow(['Metric', 'Count', '%'], [270, 100, 80], true);
[
  ['Users with ≥1 questionnaire completed', '64',  '63%'],
  ['Total questionnaire completions',        '152', '—' ],
  ['— In guided check-in',                   '130', '86%'],
  ['— In individual check-in',               '22',  '14%'],
].forEach(r => tableRow(r, [270, 100, 80], false));
doc.moveDown(0.5);

h3('Questionnaire breakdown');
tableRow(['Questionnaire', 'Completions'], [220, 150], true);
[['GAD-7 (Anxiety)', '43'], ['RSES (Self-esteem)', '38'], ['PHQ-9 (Depression)', '36'], ['PSS (Stress)', '35']].forEach(r => tableRow(r, [220, 150], false));
doc.moveDown(0.5);

h3('Guided check-in completion funnel (returning users)');
tableRow(['Step', 'Count', 'Drop-off'], [230, 80, 150], true);
[
  ['Guided check-in started',     '18', '—'],
  ['Guided check-in completed',   '2',  '89% abandoned'],
  ['Individual started',          '8',  '—'],
  ['Individual completed',        '2',  '75% abandoned'],
  ['Journal written',             '1',  '—'],
  ['Journal skipped',             '3',  '75% skip rate'],
].forEach(r => tableRow(r, [230, 80, 150], false));
doc.moveDown(0.5);
note('89% of users who start a guided check-in abandon it. The 4-questionnaire + 3-game + journal flow may be too long for a single session on mobile.');
doc.moveDown(1);

// ── 5. Games & EMA ─────────────────────────────────────────────────────────────
divider();
h1('5. Games & EMA');
h3('Games — most engaged feature (47% of all users)');
tableRow(['Metric', 'Value'], [270, 180], true);
[
  ['Users who played ≥1 game', '47 (47%)'],
  ['Total games played',        '104'],
  ['Total games skipped',       '22 (17% skip rate)'],
].forEach(r => tableRow(r, [270, 180], false));
doc.moveDown(0.5);
tableRow(['Game', 'Play count'], [220, 150], true);
[['Go/No-Go', '39'], ['Memory', '30'], ['Attention', '29'], ['Counting', '28']].forEach(r => tableRow(r, [220, 150], false));
doc.moveDown(0.5);

h3('EMA Daily Check-in — heavily underused');
tableRow(['Metric', 'Value'], [270, 180], true);
[['Users who completed EMA', '3 (3%)'], ['Total EMA sessions', '4']].forEach(r => tableRow(r, [270, 180], false));
note('EMA appears to be difficult to discover. It is not prominently surfaced on the home screen or bottom navigation.');
doc.moveDown(1);

// ── 6. Data Quality ────────────────────────────────────────────────────────────
divider();
h1('6. Data Quality & Tag Integrity');
body('All Firestore records are correctly labelled. Zero missing or malformed checkin_type values across all questionnaire and game rows.');
tableRow(['Check', 'Result'], [320, 160], true);
[
  ['Questionnaire rows with bad checkin_type', '0'],
  ['Game rows with bad checkin_type',           '0'],
  ['guided vs individual questionnaire split',  '130 / 22'],
  ['guided vs individual game split',           '112 / 14'],
].forEach(r => tableRow(r, [320, 160], false));
doc.moveDown(1);

// ── 7. Key Takeaways ───────────────────────────────────────────────────────────
divider();
h1('7. Key Takeaways & Recommendations');

const items = [
  ['1. Push notifications are broken (CRITICAL)',
   'FCM token registration fails silently for 35 of 36 opted-in users. The browser permission prompt fires after a screen navigation, not from a direct tap — mobile browsers auto-deny it. Needs a dedicated "Allow notifications" button on the final onboarding screen.'],
  ['2. 65% one-and-done users',
   'Re-engagement notifications are the main lever, but they cannot work until issue #1 is resolved. Fixing FCM is a prerequisite to any retention campaign.'],
  ['3. Guided check-in has 89% drop-off',
   'The full flow is too long for mobile sessions. Consider saving progress mid-flow, allowing partial completions, or splitting into shorter "lite" and "full" modes.'],
  ['4. Games are the stickiest feature',
   '47% engagement vs 3% EMA and 1% journal. A standalone game entry point on the home screen could drive daily active usage without requiring a full check-in.'],
  ['5. EMA and journalling are undiscovered',
   '3% and 1% usage despite being built features. These need better home screen placement, or a push notification CTA specifically for the daily check-in.'],
];

items.forEach(([title, desc]) => {
  h3(title);
  body(desc);
  doc.moveDown(0.2);
});

doc.end();
console.log('PDF written to exports/MindCheck_User_Report_June2026.pdf');
