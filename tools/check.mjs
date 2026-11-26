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

/* ---------- проверки инвариантов Башни ---------- */
if (existsSync(path.join(root, 'server/tower-test.mjs'))) {
  try {
    const out = execFileSync(process.execPath, ['server/tower-test.mjs'], {
      cwd: root, stdio: 'pipe', encoding: 'utf8', timeout: 30000,
    });
    const last = out.trim().split('\n').filter(Boolean).pop() || 'ok';
    oks.push(`Башня: ${last.replace(/^✅\s*/, '')}`);
  } catch (e) {
    const out = String(e.stdout || '') + String(e.stderr || '');
    fails.push(`проверки Башни провалены:\n${out.trim().split('\n').slice(-8).join('\n')}`);
  }
}

/* ---------- тест фарма карт через бота в бою на карточку ---------- */
if (existsSync(path.join(root, 'server/stake-test.mjs'))) {
  try {
    const out = execFileSync(process.execPath, ['server/stake-test.mjs'], {
      cwd: root, stdio: 'pipe', encoding: 'utf8', timeout: 120000,
    });
    const last = out.trim().split('\n').filter(Boolean).pop() || 'ok';
    oks.push(`бой на карточку: ${last.replace(/^✅\\s*/, '')}`);
  } catch (e) {
    const out = String(e.stdout || '') + String(e.stderr || '');
    const bad = out.split('\n').filter(l => l.includes('✗')).slice(0, 6).join('\n');
    fails.push(`тест боя на карточку провален${bad ? ':\n' + bad : ''}`);
  }
}

/* ---------- симуляция вечерней Арены: 20 игроков, сетка, загадки, награды ---------- */
if (existsSync(path.join(root, 'server/arena-sim.mjs'))) {
  try {
    const out = execFileSync(process.execPath, ['server/arena-sim.mjs'], {
      cwd: root, stdio: 'pipe', encoding: 'utf8', timeout: 120000,
    });
    const last = out.trim().split('\n').filter(Boolean).pop() || 'ok';
    oks.push(`Арена 20:30: ${last.replace(/^✓\\s*/, '')}`);
  } catch (e) {
    const out = String(e.stdout || '') + String(e.stderr || '');
    const bad = out.split('\n').filter(l => l.includes('✗')).slice(0, 6).join('\n');
    fails.push(`симуляция Арены провалена${bad ? ':\n' + bad : ''}`);
  }
}

/* ---------- тест порога реакций и выдачи промокода ---------- */
if (existsSync(path.join(root, 'server/reaction-test.mjs'))) {
  try {
    const out = execFileSync(process.execPath, ['server/reaction-test.mjs'], {
      cwd: root, stdio: 'pipe', encoding: 'utf8', timeout: 120000,
    });
    const last = out.trim().split('\n').filter(Boolean).pop() || 'ok';
    oks.push(`промокод за реакции: ${last.replace(/^✅\\s*/, '')}`);
  } catch (e) {
    const out = String(e.stdout || '') + String(e.stderr || '');
    const bad = out.split('\n').filter(l => l.includes('✗')).slice(0, 6).join('\n');
    fails.push(`тест промокода за реакции провален${bad ? ':\n' + bad : ''}`);
  }
}

/* ---------- рыцарь: кузня, тиражи, сталь, переплавка, ключи за карты ---------- */
if (existsSync(path.join(root, 'server/knight-test.mjs'))) {
  try {
    const out = execFileSync(process.execPath, ['server/knight-test.mjs'], { cwd: root, stdio: 'pipe', encoding: 'utf8', timeout: 120000 });
    oks.push('рыцарь: ' + (out.trim().split('\n').filter(Boolean).pop() || 'ok').replace(/^✅\s*/, ''));
  } catch (e) {
    const out = String(e.stdout || '') + String(e.stderr || '');
    fails.push('тест рыцаря провален:\n' + out.split('\n').filter(l => l.includes('✗')).slice(0, 6).join('\n'));
  }
}

/* ---------- конкурс TikTok: заявки, ссылка, авторозыгрыш, именная карта ---------- */
if (existsSync(path.join(root, 'server/contest-test.mjs'))) {
  try {
    const out = execFileSync(process.execPath, ['server/contest-test.mjs'], { cwd: root, stdio: 'pipe', encoding: 'utf8', timeout: 120000 });
    oks.push('конкурс: ' + (out.trim().split('\n').filter(l => /✅|❌/.test(l)).pop() || 'ok').replace(/^✅\s*/, ''));
  } catch (e) {
    const out = String(e.stdout || '') + String(e.stderr || '');
    fails.push('тест конкурса провален:\n' + out.split('\n').filter(l => l.includes('✗')).slice(0, 6).join('\n'));
  }
}

/* ---------- 3. версии в index.html совпадают с файлами ---------- */
if (existsSync(path.join(root, 'index.html'))) {
  const html = read('index.html');
  const stale = [];
  for (const m of html.matchAll(/(?:src|href)="([\w.-]+\.(?:js|css))\?v=([0-9a-f]+)"/g)) {
    const [, file, ver] = m;
    if (!existsSync(path.join(root, file))) continue;
    const normalized = readFileSync(path.join(root, file), 'utf8').replace(/\r\n?/g, '\n');
    const h = createHash('md5').update(normalized).digest('hex').slice(0, 8);
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

/* ---------- 5. приглашение в клан не зависит от попадания в топ ---------- */
if (existsSync(path.join(root, 'wow.js')) && existsSync(path.join(root, 'game.js'))) {
  const wow = read('wow.js'), game = read('game.js');
  const goodInvite = wow.includes('^g_(\\d+)(?:_(\\d+))?$') &&
    wow.includes('act("clan_join",{id,inviter})');
  if (!goodInvite) fails.push('клановая ссылка: формат g_<clan>_<inviter> или прямой clan_join не найден');
  else oks.push('приглашение в клан: отдельный g_-формат и прямое вступление по id');
  if (!game.includes('if(/^c_\\d+$/.test(p))return'))
    fails.push('game.js: legacy c_<id> конфликтует с вызовом на бой');
}

/* ---------- 5. сервер: действия ивента не потерялись при сборке ---------- */
if (existsSync(path.join(root, 'server/worker.js'))) {
  const w = read('server/worker.js');
  const need = ['ev_state', 'ev_contrib', 'ev_hit', 'ev_claim', 'ev_shop'];
  const lost = need.filter(k => !w.includes(k));
  if (lost.length) fails.push(`server/worker.js: потеряны действия ивента: ${lost.join(', ')}`);
  else oks.push('server/worker.js: все действия ивента на месте');
  for (const token of ['ev_seg_contrib', 'evClanCap(active)', 'EV.starCap', 'evRewardTick'])
    if (!w.includes(token)) fails.push(`server/worker.js: отсутствует защита/награда ${token}`);
}

/* ---------- 6. автопост старта и новый постер ---------- */
if (existsSync(path.join(root, 'server/server.js'))) {
  const src = read('server/server.js');
  const image = 'event-assets/card-farm-2026-11-24.png';
  if (!src.includes(image) || !existsSync(path.join(root, image)))
    fails.push(`автопост ивента: не найден постер ${image}`);
  else {
    const png = readFileSync(path.join(root, image));
    if (png.toString('hex', 0, 8) !== '89504e470d0a1a0a' || png.readUInt32BE(16) !== 1080 || png.readUInt32BE(20) !== 1350)
      fails.push('автопост ивента: постер должен быть валидным PNG 1080×1350');
    else oks.push('автопост ивента: новый постер PNG 1080×1350 на месте');
  }
  if (!src.includes('Фарм карт снова доступен') || !src.includes('ev_posted:'))
    fails.push('автопост ивента: текст о фарме карт или защита от повторной отправки потеряны');
  else oks.push('автопост ивента: анонс фарма карт и однократная отправка на месте');
  if (!src.includes('react_241124_1030') || !src.includes('Date.UTC(2026,10,24,7,30)') ||
      !src.includes('await react4Tick(env)') || !src.includes('async function fire30React') ||
      !src.includes('react_release:'))
    fails.push('акция 10:30: расписание или обработчик реакций не подключён к серверному тику');
  else oks.push('акция 10:30: автопост и обработчик реакций подключены');
}

/* ---------- итог ---------- */
for (const s of oks) console.log('✓ ' + s);
for (const s of warns) console.log('! ' + s);
for (const s of fails) console.log('✗ ' + s);
if (fails.length) {
  console.log(`\n❌ ПРОВЕРКА НЕ ПРОЙДЕНА: ${fails.length}`);
  process.exit(1);
}
console.log('\n✅ ПРОВЕРКИ ИВЕНТА ПРОЙДЕНЫ');
