const fs = require('fs');

function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const s = `${src}/${entry.name}`;
    const d = `${dest}/${entry.name}`;
    entry.isDirectory() ? copyDir(s, d) : fs.copyFileSync(s, d);
  }
}

fs.rmSync('.vercel/output', { recursive: true, force: true });
fs.mkdirSync('.vercel/output/static', { recursive: true });

copyDir('dist', '.vercel/output/static');

fs.writeFileSync('.vercel/output/config.json', JSON.stringify({
  version: 3,
  routes: [
    { handle: 'filesystem' },
    { src: '/(.*)', dest: '/index.html' }
  ]
}));

console.log('✓ .vercel/output ready');
