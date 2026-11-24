/* Проверка проекта перед пушем: синтаксис, тесты ивента, версии и типовые ошибки клиента.
   Запуск: node tools/check.mjs */
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const fails = [];
const oks = [];
const warns = [];

const read = f => readFileSync(path.join(root, f), 'utf8');

/* ---------- 1. синтаксис всех клиентских и серверных скриптов ---------- */
const jsFiles = [
  ...readdirSync(root).filter(f => f.endsWith('.js')),
  'server/server.js',
  'server/worker.js',
];
let checked = 0;
for (const f of jsFiles) {
  if (!existsSync(path.join(root, f))) continue;
  try {
    execFileSync(process.execPath, ['--check', path.join(root, f)], { stdio: 'pipe' });
    checked++;
  } catch (e) {
    fails.push(`синтаксис ${f}:\n${String(e.stderr || e.message).trim().split('\n').slice(0, 4).join('\n')}`);
  }
}
if (!fails.length) oks.push(`синтаксис: ${checked} файлов`);

/* ---------- 2. тесты серверной части ивента ---------- */
if (existsSync(path.join(root, 'server/event-test.mjs'))) {
  try {
    const out = execFileSync(process.execPath, ['server/event-test.mjs'], {
      cwd: root, stdio: 'pipe', encoding: 'utf8', timeout: 120000,
    });
    const last = out.trim().split('\n').filter(Boolean).pop() || 'ok';
    oks.push(`тесты ивента: ${last.replace(/^✅\s*/, '')}`);
  } catch (e) {
    const out = String(e.stdout || '') + String(e.stderr || '');
    const bad = out.split('\n').filter(l => l.includes('✗')).slice(0, 6).join('\n');
    fails.push(`тесты ивента провалены${bad ? ':\n' + bad : ''}`);
  }
}

/* ---------- 3. версии в index.html совпадают с файлами ---------- */
if (existsSync(path.join(root, 'index.html'))) {
  const html = read('index.html');
  const stale = [];
  for (const m of html.matchAll(/(?:src|href)="([\w.-]+\.(?:js|css))\?v=([0-9a-f]+)"/g)) {
    const [, file, ver] = m;
    if (!existsSync(path.join(root, file))) continue;
    const h = createHash('md5').update(readFileSync(path.join(root, file))).digest('hex').slice(0, 8);
    if (h !== ver) stale.push(file);
  }
  if (stale.length) fails.push(`устаревшие версии в index.html (запусти python tools/bump.py): ${stale.join(', ')}`);
  else oks.push('версии в index.html совпадают с файлами');
}

/* ---------- 4. event.js: запрещённые способы открывать ссылки ---------- */
if (existsSync(path.join(root, 'event.js'))) {
  const src = read('event.js');
  const bad = [];
  if (/\bwindow\.open\s*\(/.test(src)) bad.push('window.open — в Telegram блокируется, используй sendLink()');
  if (/t\.me\/VoinyEpohBot/.test(src)) bad.push('жёсткая ссылка на бота — используй linkFor()');
  if (/\?startapp=/.test(src)) bad.push('жёсткий startapp — используй linkFor()');
  if (bad.length) fails.push('event.js:\n  ' + bad.join('\n  '));
  else oks.push('event.js: ссылки через linkFor/sendLink, без window.open');

  /* все ev-* id, на которые ссылается код, должны где-то создаваться */
  const ids = new Set();
  for (const m of src.matchAll(/\bid="([\w-]+)"/g)) ids.add(m[1]);
  for (const m of src.matchAll(/\.id\s*=\s*['"]([\w-]+)['"]/g)) ids.add(m[1]);
  for (const f of ['game.js', 'wow.js', 'menu.js', 'index.html']) {
    if (!existsSync(path.join(root, f))) continue;
    const t = read(f);
    for (const m of t.matchAll(/\bid="([\w-]+)"/g)) ids.add(m[1]);
  }
  const missing = new Set();
  const refs = [
    ...src.matchAll(/getElementById\(['"]([\w-]+)['"]\)/g),
    ...src.matchAll(/querySelector\(['"]#([\w-]+)['"]\)/g),
  ];
  for (const m of refs) if (m[1].startsWith('ev-') && !ids.has(m[1])) missing.add(m[1]);
  if (missing.size) fails.push(`event.js: id не найден в разметке: ${[...missing].join(', ')}`);
  else oks.push('event.js: все ev-* id существуют');

  /* дубли id внутри одного экрана ломают привязку обработчиков */
  const seen = new Map();
  for (const m of src.matchAll(/\bid="([\w-]+)"/g)) seen.set(m[1], (seen.get(m[1]) || 0) + 1);
  const dup = [...seen].filter(([, n]) => n > 1).map(([k, n]) => `${k}×${n}`);
  if (dup.length) warns.push(`event.js: повторяются id (проверь привязку): ${dup.join(', ')}`);
}

/* ---------- 5. сервер: действия ивента не потерялись при сборке ---------- */
if (existsSync(path.join(root, 'server/worker.js'))) {
  const w = read('server/worker.js');
  const need = ['ev_state', 'ev_contrib', 'ev_hit', 'ev_claim', 'ev_shop'];
  const lost = need.filter(k => !w.includes(k));
  if (lost.length) fails.push(`server/worker.js: потеряны действия ивента: ${lost.join(', ')}`);
  else oks.push('server/worker.js: все действия ивента на месте');
}

/* ---------- итог ---------- */
for (const s of oks) console.log('✓ ' + s);
for (const s of warns) console.log('! ' + s);
for (const s of fails) console.log('✗ ' + s);
if (fails.length) {
  console.log(`\n❌ ПРОВЕРКА НЕ ПРОЙДЕНА: ${fails.length}`);
  process.exit(1);
}
console.log('\n✅ ПРОВЕРКА ПРОЙДЕНА — можно пушить');
