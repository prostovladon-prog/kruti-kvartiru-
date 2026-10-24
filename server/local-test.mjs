// Локальная проверка сервера без Cloudflare: база D1 подменяется встроенным SQLite из Node 22.
// Запуск:  python3 tools/build_worker.py && node server/local-test.mjs
import { DatabaseSync } from "node:sqlite";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const dir = path.dirname(fileURLToPath(import.meta.url));
const worker = (await import("data:text/javascript;base64," + Buffer.from(readFileSync(path.join(dir, "worker.js"))).toString("base64"))).default;

/* --- маленькая подмена D1 --- */
const db = new DatabaseSync(":memory:");
db.exec(readFileSync(path.join(dir, "schema.sql"), "utf8"));
class Stmt {
  constructor(sql, args = []) { this.sql = sql; this.args = args; }
  bind(...a) { return new Stmt(this.sql, a.map(x => x === undefined ? null : typeof x === "boolean" ? +x : x)); }
  async first() { return db.prepare(this.sql).get(...this.args) ?? null; }
  async all() { return { results: db.prepare(this.sql).all(...this.args) }; }
  async run() { return this._exec(); }
  _exec() {
    if (/^\s*(select|with)/i.test(this.sql)) return { results: db.prepare(this.sql).all(...this.args), meta: { changes: 0 } };
    const r = db.prepare(this.sql).run(...this.args); return { results: [], meta: { changes: Number(r.changes) } };
  }
}
const DB = {
  prepare: sql => new Stmt(sql),
  async batch(list) { db.exec("BEGIN"); try { const out = list.map(s => s._exec()); db.exec("COMMIT"); return out; } catch (e) { db.exec("ROLLBACK"); throw e; } }
};
const env = { DB, DEV: "1", TEST: "1", BOT_TOKEN: "123:TEST", NO_RARE: "1" };   // без случайных половинок и богатырей в прокрутках
// челлендж по умолчанию выключен, чтобы тесты не зависели от текущей даты
db.exec("CREATE TABLE IF NOT EXISTS kv (k TEXT PRIMARY KEY, v TEXT)"); db.prepare("INSERT OR REPLACE INTO kv(k,v) VALUES('chal',?)").run(JSON.stringify({ id: "off", start: 0, end: 0, prizes: ["$20", "$10", "$7"], slots: [] }));

async function call(uid, a, p = {}, start = "") {
  const r = await worker.fetch(new Request("https://x/api", { method: "POST", headers: { "Content-Type": "application/json", "X-Dev-User": String(uid), "X-Dev-Start": start }, body: JSON.stringify({ a, p }) }), env);
  return r.json();
}
const { classify } = await import("data:text/javascript;base64," + Buffer.from(readFileSync(path.join(dir, "..", "rules.js"), "utf8") + "\nexport { classify };").toString("base64"));
let fails = 0;
/* свободная карточка игрока; если всё проиграно в боях, тестовый игрок открывает новую */
async function anyCard(uid, callf) { callf = callf || call; let s = await callf(uid, "sync"); let c = s.S.cards.find(c => !c.listed && !c.away && c.f !== 5 && !c.part);
  if (!c) { db.prepare("UPDATE users SET gift_spins=gift_spins+3 WHERE id=?").run(uid); const o = await callf(uid, "open"); c = o.res.card } return c }
const ok = (cond, msg) => { console.log((cond ? "✓ " : "✗ ") + msg); if (!cond) fails++; };

/* --- проверка подписи Telegram --- */
{
  const enc = new TextEncoder();
  const hmac = async (k, m) => new Uint8Array(await crypto.subtle.sign("HMAC", await crypto.subtle.importKey("raw", typeof k === "string" ? enc.encode(k) : k, { name: "HMAC", hash: "SHA-256" }, false, ["sign"]), enc.encode(m)));
  const user = JSON.stringify({ id: 777, first_name: "Влад" }), auth = Math.floor(Date.now() / 1000);
  const dcs = `auth_date=${auth}\nuser=${user}`;
  const hash = [...await hmac(await hmac("WebAppData", env.BOT_TOKEN), dcs)].map(b => b.toString(16).padStart(2, "0")).join("");
  const init = new URLSearchParams({ auth_date: String(auth), user, hash }).toString();
  const good = await worker.fetch(new Request("https://x/api", { method: "POST", headers: { "X-Init-Data": init }, body: JSON.stringify({ a: "sync" }) }), { ...env, DEV: "0" });
  ok((await good.json()).S?.uid === 777, "вход через Telegram с правильной подписью");
  const bad = await worker.fetch(new Request("https://x/api", { method: "POST", headers: { "X-Init-Data": init.replace("777", "778") }, body: JSON.stringify({ a: "sync" }) }), { ...env, DEV: "0" });
  ok(bad.status === 401, "подделанная подпись не проходит");
}

/* --- первопроходцы: первые 100 игроков --- */
{
  let r = await call(9000, "sync"); ok(r.S.pioneer >= 1 && r.S.spins === 25 && r.S.pioneerNew === true, "первопроходец №" + r.S.pioneer + ": +20 прокруток (" + r.S.spins + ")");
  r = await call(9000, "sync"); ok(r.S.pioneerNew === false && r.S.spins === 25, "награда первопроходца выдаётся один раз");
  r = await call(9000, "open"); const pc = r.res.card;
  r = await call(9000, "frame", { id: pc.id, frame: "pioneer" }); ok(r.ok && r.S.cards.find(c => c.id === pc.id).frame === "pioneer", "рамка «Первопроходец» бесплатно надета");
  const used = db.prepare("SELECT MAX(pioneer) m FROM users").get().m;
  for (let i = used + 1; i <= 100; i++) db.prepare("INSERT INTO users(id,name,cash,state,ver,pioneer) VALUES(?,?,0,'{}',0,?)").run(100000 + i, "dummy", i);
  r = await call(9001, "sync"); ok(!r.S.pioneer && r.S.spins === 5 && r.S.pioneersLeft === 0, "101-й игрок уже не первопроходец, мест осталось " + r.S.pioneersLeft);
  r = await call(9001, "open"); r = await call(9001, "frame", { id: r.res.card.id, frame: "pioneer" }); ok(!r.ok && /первых 100/.test(r.err), "рамку первопроходца другим не надеть: " + r.err);
  r = await call(9001, "profile", { uid: 9000 }); ok(r.res.pi >= 1, "значок первопроходца виден в витрине");
}

/* --- игрок A открывает карточки --- */
let r = await call(1, "sync");
ok(r.ok && r.S.spins === 5 && r.S.cash === 100, "новый игрок: 5 прокруток и $100");
for (let i = 0; i < 5; i++) r = await call(1, "open");
ok(r.ok && r.S.cards.length === 5 && r.S.spins === 0, "5 открытий, прокрутки закончились");
r = await call(1, "open"); ok(!r.ok && /закончились/.test(r.err), "без прокруток открыть нельзя: " + r.err);
for (let i = 0; i < 4; i++) await call(1, "topup");
const par = await Promise.all(Array.from({ length: 6 }, () => call(1, "open")));
r = await call(1, "sync");
const okN = par.filter(x => x.ok).length;
ok(r.S.cards.length === 5 + okN && r.S.spins === 12 - okN, "6 открытий одновременно: прошло " + okN + ", ни одно не задвоилось (" + r.S.cards.length + " карточек, " + r.S.spins + " прокруток)");
const sns = db.prepare("SELECT COUNT(*) n, COUNT(DISTINCT sn) d FROM cards").get();
ok(sns.n === sns.d, "все номера уникальны (" + sns.n + ")");

/* --- рынок между игроками --- */
const cardA = r.S.cards[0];
r = await call(1, "list", { id: cardA.id, price: 7 }); ok(r.ok && r.S.cards.find(c => c.id === cardA.id).listed === 1, "A выставил карточку за $7");
r = await call(1, "sell", { id: cardA.id }); ok(!r.ok, "выставленную карточку нельзя продать системе");
r = await call(2, "market"); const lot = r.res.items.find(x => x.id === cardA.id);
ok(!!lot && lot.price === 7 && /Тестер 1/.test(lot.seller), "B видит лот A на рынке");
r = await call(1, "market"); ok(!r.res.items.some(x => x.id === cardA.id), "свой лот на рынке не показывается");
const both = await Promise.all([call(2, "buy", { id: cardA.id, price: 7 }), call(3, "buy", { id: cardA.id, price: 7 })]);
ok(both.filter(x => x.ok).length === 1, "два покупателя одновременно: купил только один");
const winner = both[0].ok ? 2 : 3;
r = await call(winner, "sync"); ok(r.S.cards.some(c => c.id === cardA.id) && Math.abs(r.S.cash - 93) < .01, "покупатель получил карточку и заплатил $7");
r = await call(1, "sync"); ok(r.S.news.length === 1 && Math.abs(r.S.news[0].got - 6.65) < .01, "продавец получил уведомление и $6.65 (минус 5%)");
ok(!r.S.cards.some(c => c.id === cardA.id), "у продавца карточки больше нет");
r = await call(1, "sync"); ok(r.S.news.length === 0, "уведомление приходит один раз");

/* --- остальные действия идут через правила на сервере --- */
r = await call(1, "sync"); const my = r.S.cards;
r = await call(1, "duel", { id: my[0].id, stat: 0, mode: 0 }); ok(r.ok && r.res.rounds.length === 3, "дуэль: 3 раунда, счёт " + (r.ok ? r.res.w + ":" + r.res.l : r.err));
r = await call(1, "boss_squad", { ids: [my[1].id, my[2].id] }); ok(r.ok, "отряд для босса");
r = await call(1, "boss_hit"); ok(r.ok && r.res.dmg > 0, "удар по боссу: " + (r.ok ? r.res.dmg : r.err));
r = await call(1, "exp_start", { id: my[3].id, dest: 0 }); ok(r.ok && r.S.cards.find(c => c.id === my[3].id).away > 0, "поход начался");
r = await call(1, "exp_claim", { id: my[3].id }); ok(!r.ok, "рано забирать добычу: " + r.err);
await call(1, "exp_rush", { id: my[3].id }); r = await call(1, "exp_claim", { id: my[3].id }); ok(r.ok && r.res.money > 0, "добыча из похода: $" + (r.ok ? r.res.money : r.err));
r = await call(1, "train", { id: my[4].id }); ok(r.ok, "тренер");
r = await call(1, "craft", { ids: [my[5].id], h: 0, f: 0 }); ok(r.ok, "крафт: " + (r.ok ? (r.res.win ? "получилось" : "не повезло") : r.err));
/* --- профиль и бой с другом --- */
for (let i = 0; i < 3; i++) await call(2, "open");
r = await call(2, "profile", { uid: 1 }); ok(r.ok && r.res.cards.length === 3 && r.res.name === "Тестер 1", "витрина друга");
r = await call(2, "sync"); const mine2 = r.S.cards[0];
r = await call(2, "fduel", { oppId: my[0].id, oppStat: 1, myId: mine2.id, myStat: 0 }); ok(r.ok && r.res.picks[1] === 1, "бой с другом: второй раунд по выбору друга");
r = await call(2, "fduel", { oppId: mine2.id, oppStat: 1, myId: mine2.id, myStat: 0 }); ok(!r.ok, "со своей карточкой драться нельзя");

/* --- рефералы и подписка --- */
r = await call(1, "sync"); const sp0 = r.S.spins;
await call(500, "sync", {}, "r_1"); await call(500, "sync", {}, "r_1"); await call(501, "sync", {}, "r_1"); await call(1, "sync", {}, "r_1");
r = await call(1, "sync"); ok(r.S.spins === sp0 + 20 && r.S.refs === 2, "2 новых друга по ссылке: +20 прокруток, повторный вход и сам себя не считаются (" + (r.S.spins - sp0) + ")");
r = await call(1, "open"); ok(r.ok && r.S.spins === sp0 + 19, "прокрутки за друзей тратятся как обычные");
r = await call(1, "sub_check"); ok(r.ok && r.res.r === 10, "подписка на канал: +10 прокруток");
r = await call(1, "sub_check"); ok(!r.ok, "за подписку награда только один раз");
r = await call(1, "sub_reward"); ok(!r.ok, "награду за подписку нельзя получить в обход проверки");

/* --- бой с настоящими игроками, уведомление и реванш --- */
{
  const c2 = await anyCard(2);
  let d = null; for (let i = 0; i < 12 && !(d && d.ok && d.res.real); i++) d = await call(2, "duel", { id: c2.id, stat: 0, mode: 0 });
  ok(d.ok && d.res.real && d.res.oppName && d.res.oppUid !== 2, "дуэль с картой настоящего игрока: соперник " + (d.res && d.res.oppName));
  const def = d.res.oppUid;
  r = await call(def, "sync"); const f = r.S.fights[0];
  ok(f && f.seen === 0 && f.att_card === c2.id && f.w === d.res.w, "защитник получил уведомление о нападении от " + (f && f.att_name));
  r = await call(def, "sync"); ok(r.S.fights[0].seen === 1, "уведомление показывается один раз");
  const d2 = await call(2, "duel", { id: c2.id, stat: 1, mode: 0, rematch: d.res.opp.id });
  ok(d2.ok && d2.res.real && d2.res.opp.id === d.res.opp.id, "реванш с той же карточкой соперника");
  const md = await call(2, "duel", { id: c2.id, stat: 0, mode: 1 }); ok(md.ok && !md.res.real, "без включённых боёв на карточку — только бот");
  // оба включили бои на карточку
  await call(2, "stake_set", { on: 1 }); r = await call(1, "stake_set", { on: 1 }); ok(r.ok && r.S.stake === 1, "бои на карточку с игроками включены");
  db.prepare("UPDATE cards SET v=10 WHERE owner IN (1,2)").run();   // цены похожие, чтобы подбор сработал
  let moved = false, tries = 0;
  for (; tries < 30 && !moved; tries++) {
    r = await call(2, "sync"); const mine = r.S.cards.find(c => !c.listed && !c.away); if (!mine) break;
    const d = await call(2, "duel", { id: mine.id, stat: tries % 5, mode: 1 });
    if (!d.ok || !d.res.real || d.res.w === d.res.l) continue;
    moved = true;
    if (d.res.gotCard) {
      const row = db.prepare("SELECT owner FROM cards WHERE id=?").get(d.res.gotCard.id);
      ok(row && row.owner === 2, "победа на карточку: карточка соперника перешла ко мне");
    } else {
      const row = db.prepare("SELECT owner FROM cards WHERE id=?").get(mine.id);
      ok(row && row.owner === d.res.oppUid, "поражение на карточку: моя карточка ушла к сопернику, а не сгорела");
    }
    r = await call(d.res.oppUid, "sync"); ok(r.S.fights[0].stake === 1 && r.S.fights[0].took === 1, "защитник получил уведомление о бое на карточку");
  }
  ok(moved, "бой на карточку с живым игроком состоялся (попыток " + tries + ")");
  const sn = db.prepare("SELECT COUNT(*) n, COUNT(DISTINCT sn) d FROM cards").get(); ok(sn.n === sn.d, "после передач номера по-прежнему уникальны");
}
/* --- настоящие id Telegram длиннее 32 бит: бой на карточку не должен падать --- */
{
  const B = [6724818967, 7123456789];
  for (const u of B) { await call(u, "sync"); for (let i = 0; i < 5; i++) await call(u, "open"); await call(u, "stake_set", { on: 1 }) }
  db.prepare("UPDATE cards SET v=10 WHERE owner IN (?,?)").run(B[0], B[1]);
  let busy = 0, real = 0;
  for (let i = 0; i < 20; i++) { const u = B[i % 2]; r = await call(u, "sync"); const c = r.S.cards.find(c => !c.listed && !c.away); if (!c) continue; const d = await call(u, "duel", { id: c.id, stat: i % 5, mode: 1 }); if (!d.ok && /занят/.test(d.err)) busy++; if (d.ok && d.res.real) real++ }
  ok(busy === 0 && real > 0, "длинные id Telegram: боёв с игроком " + real + ", ошибок «Сервер занят» " + busy);
  r = await call(B[1], "profile", { uid: B[0] }); ok(r.ok, "витрина игрока с длинным id открывается");
}

/* --- чат --- */
{
  await call(600, "nick", { nick: "Болтун" });
  r = await call(600, "chat_send", { text: "Привет всем!" }); ok(r.ok && r.res.items.at(-1).name === "Болтун", "сообщение в чате с ником");
  r = await call(600, "chat_send", { text: "ещё" }); ok(!r.ok && /быстро/.test(r.err), "антиспам: не чаще раза в 3 секунды");
  r = await call(500, "chat_send", { text: "я без ника" }); ok(!r.ok && /ник/.test(r.err), "без ника писать нельзя");
  await call(500, "nick", { nick: "Новичок_500" });
  r = await call(500, "chat_send", { text: "заходи на t.me/scam" }); ok(!r.ok && /Ссылки/.test(r.err), "ссылки запрещены");
  r = await call(500, "chat_send", { text: "ты сука хлеба небо" }); const tx = r.ok && r.res.items.at(-1).text;
  ok(tx === "ты **** хлеба небо", "мат закрыт звёздочками, обычные слова целы: «" + tx + "»");
  r = await call(1, "chat_get", { after: 0 }); ok(r.ok && r.res.items.length === 2, "история чата: " + r.res.items.length);
  r = await call(1, "chat_del", { id: r.res.items[0].id }); ok(!r.ok, "обычный игрок не может удалять сообщения");
  const env3 = { ...env, ADMINS: "8" };
  const call8b = async (a, p = {}) => (await worker.fetch(new Request("https://x/api", { method: "POST", headers: { "Content-Type": "application/json", "X-Dev-User": "8" }, body: JSON.stringify({ a, p }) }), env3)).json();
  r = await call8b("chat_mute", { uid: 500, hours: 24 }); ok(r.ok, "админ выдал мут на 24 часа");
  r = await call(500, "chat_send", { text: "снова я" }); ok(!r.ok && /запрещено/.test(r.err), "замученный не пишет: " + r.err);
  r = await call(1, "chat_get", { after: 0 }); ok(!r.res.items.some(x => x.uid === 500), "сообщения замученного удалены");
  r = await call(1, "sync"); ok(r.S.chatLast > 0, "в состоянии есть номер последнего сообщения для значка «новое»");
}

/* --- основатели: 3 эксклюзивные карточки за 15 друзей --- */
{
  const tre = db.prepare("SELECT COUNT(*) n FROM cards WHERE owner=-1 AND f=5").get().n; ok(tre === 3, "в казне 3 карточки «Основатель»");
  r = await call(7000, "sync"); ok(r.S.foundersLeft === 3 && !r.S.founder, "осталось 3 из 3");
  for (let i = 1; i <= 14; i++) await call(70000 + i, "sync", {}, "r_7000");
  r = await call(7000, "sync"); ok(!r.S.founder && r.S.refs === 14, "14 друзей: ещё не основатель");
  await call(70015, "sync", {}, "r_7000");
  r = await call(7000, "sync"); const fc = r.S.cards.find(c => c.f === 5);
  ok(r.S.founder && r.S.founderNew && fc && fc.stars === 5, "15-й друг: карточка «Основатель» у игрока (" + (fc && fc.sn) + ", ★" + (fc && fc.stars) + ")");
  r = await call(7000, "sync"); ok(!r.S.founderNew && r.S.foundersLeft === 2, "уведомление один раз, в казне осталось " + r.S.foundersLeft);
  for (let i = 16; i <= 20; i++) await call(70000 + i, "sync", {}, "r_7000");
  r = await call(7000, "sync"); ok(r.S.cards.filter(c => c.f === 5).length === 1, "второй карточки за тех же друзей не будет");
  r = await call(7000, "duel", { id: fc.id, stat: 0, mode: 0 }); ok(!r.ok && /коллекционная/.test(r.err), "«Основатель» не дерётся в дуэли");
  r = await call(7000, "boss_squad", { ids: [fc.id] }); ok(!r.ok, "«Основатель» не идёт на босса");
  r = await call(7000, "sell", { id: fc.id }); ok(!r.ok && /рынок/.test(r.err), "«Основателя» нельзя продать системе");
  r = await call(7000, "list", { id: fc.id, price: 300000 }); ok(r.ok, "«Основателя» можно выставить на рынок");
  await call(7000, "unlist", { id: fc.id });
  const anyMine = await anyCard(1);
  r = await call(1, "fduel", { oppId: fc.id, oppStat: 1, myId: anyMine.id, myStat: 0 }); ok(!r.ok, "против «Основателя» по ссылке тоже нельзя");
  await call(7000, "open"); r = await call(7000, "sync"); r = await call(7000, "craft", { ids: [r.S.cards.find(c => c.f !== 5).id], h: 0, f: 5 }); ok(!r.ok, "«Основателя» нельзя скрафтить");
}

/* --- история --- */
r = await call(1, "sync"); const sp1 = r.S.spins;
r = await call(1, "story"); ok(r.ok && r.S.spins === sp1 + 10, "история: +10 прокруток");
r = await call(1, "story"); ok(!r.ok && /неделе/.test(r.err), "история: второй раз на неделе нельзя");

/* --- закалка звёздами --- */
r = await call(1, "sync"); let fc = r.S.cards.find(c => !c.listed && !c.away && !c.xp && c.f !== 5);
if (!fc) { await call(1, "topup"); const o = await call(1, "open"); fc = o.res.card }
r = await call(1, "forge", { id: fc.id }); ok(!r.ok && /уровень/.test(r.err), "закалка без уровня не проходит: " + r.err);
db.prepare("UPDATE users SET cash=cash+1000 WHERE id=1").run(); for (let i = 0; i < 3; i++) await call(1, "train", { id: fc.id });
const v0 = fc.v; r = await call(1, "forge", { id: fc.id }); const f1 = r.ok && r.S.cards.find(c => c.id === fc.id);
if (!r.ok) console.log("  ошибка:", r.err);
ok(f1 && f1.stars === 1 && Math.abs(f1.v - v0 * 1.3) < .02, "закалка ★1: карточка подорожала с " + v0 + " до " + (f1 && f1.v));
const dbRow = db.prepare("SELECT stars, v FROM cards WHERE id=?").get(fc.id); ok(dbRow.stars === 1 && Math.abs(dbRow.v - f1.v) < .01, "звезда и новая цена записаны в базу");

/* --- мировой топ --- */
r = await call(1, "top", { kind: "worth" }); ok(r.ok && r.res.items.length >= 2 && r.res.me.rank >= 1, "топ богачей: " + r.res.items.length + " игроков, моё место " + r.res.me.rank);
ok(r.res.items.every((x, i, a) => !i || a[i - 1].score >= x.score), "топ отсортирован по убыванию");
r = await call(1, "top", { kind: "album" }); ok(r.ok && r.res.me.rank >= 1, "топ коллекционеров");
r = await call(1, "top", { kind: "wins" }); ok(r.ok, "топ бойцов");
r = await call(2, "top", { kind: "cards" }); ok(r.ok && r.res.items.length > 0 && r.res.items[0].card.v >= r.res.items.at(-1).card.v, "самые дорогие карточки мира");
r = await call(2, "top", { kind: "feed" }); ok(r.ok && Array.isArray(r.res.items), "лента выпадений: " + r.res.items.length);
r = await call(2, "top", { kind: "x; DROP TABLE users" }); ok(!r.ok, "неизвестный рейтинг отклоняется");

/* --- ники --- */
r = await call(1, "nick", { nick: "Царь_Горы" }); ok(r.ok && r.S.nick === "Царь_Горы" && r.res.cost === 0, "первый ник бесплатно");
r = await call(2, "nick", { nick: "царь_горы" }); ok(!r.ok && /занят/.test(r.err), "занятый ник другому нельзя: " + r.err);
r = await call(2, "nick", { nick: "ab" }); ok(!r.ok, "слишком короткий ник: " + r.err);
r = await call(2, "nick", { nick: "<script>" }); ok(!r.ok, "запрещённые символы: " + r.err);
r = await call(2, "nick", { nick: "Хуйло228" }); ok(!r.ok, "мат в нике нельзя");
r = await call(2, "nick", { nick: "ЦАРЬ_ГОРЫ" }); ok(!r.ok && /занят/.test(r.err), "большими буквами тот же ник тоже занят");
r = await call(3, "nick", { nick: "Vlad B" }); ok(r.ok && r.S.nick === "Vlad_B", "пробел превращается в _");
r = await call(1, "top", { kind: "worth" }); ok(r.res.items.some(x => x.name === "Царь_Горы"), "ник виден в топе");
r = await call(2, "profile", { uid: 1 }); ok(r.res.name === "Царь_Горы", "ник виден в витрине");
db.prepare("UPDATE users SET cash=0 WHERE id=1").run();
r = await call(1, "nick", { nick: "Новый" }); ok(!r.ok && /1000/.test(r.err), "смена ника стоит $1000: " + r.err);

/* --- бот: /start, приглашение через бота, настройка --- */
{
  const sent = []; const realFetch = globalThis.fetch;
  globalThis.fetch = async (u, o) => { sent.push({ m: String(u).split("/").pop(), b: JSON.parse(o.body) }); return new Response('{"ok":true,"result":true}') };
  const sec = Buffer.from(await crypto.subtle.digest("SHA-256", new TextEncoder().encode("hook:" + env.BOT_TOKEN))).toString("hex").slice(0, 48);
  const upd = (text, id = 900) => worker.fetch(new Request("https://x/tg", { method: "POST", headers: { "X-Telegram-Bot-Api-Secret-Token": sec }, body: JSON.stringify({ message: { chat: { id, type: "private" }, from: { id, first_name: "Гость" }, text } }) }), env);
  const bad = await worker.fetch(new Request("https://x/tg", { method: "POST", headers: { "X-Telegram-Bot-Api-Secret-Token": "x" }, body: "{}" }), env);
  ok(bad.status === 403, "чужие запросы к боту отклоняются");
  r = await call(1, "sync"); const s1 = r.S.spins;
  await upd("/start r_1");
  ok(sent.at(-1).m === "sendPhoto" && sent.at(-1).b.reply_markup.inline_keyboard[0][0].web_app, "на /start бот присылает картинку и кнопку «Играть»");
  r = await call(1, "sync"); ok(r.S.spins === s1 + 10, "приглашение через /start r_1 тоже засчитано");
  await upd("/start r_1"); r = await call(1, "sync"); ok(r.S.spins === s1 + 10, "повторный /start не засчитывается");
  await upd("/invite"); ok(sent.at(-1).m === "sendMessage" && /startapp=r_900/.test(sent.at(-1).b.text), "/invite даёт личную ссылку");
  sent.length = 0; const st = await (await worker.fetch(new Request("https://x/setup"), env)).text();
  ok(/Готово/.test(st) && sent.map(x => x.m).join() === "setWebhook,setMyName,setMyShortDescription,setMyDescription,setMyCommands,setChatMenuButton", "/setup настраивает бота: " + sent.map(x => x.m).join(", "));
  ok(sent[3].b.description.length <= 512 && sent[2].b.short_description.length <= 120, "описания влезают в лимиты Telegram (" + sent[3].b.description.length + "/512, " + sent[2].b.short_description.length + "/120)");
  globalThis.fetch = realFetch;
}

/* --- проданные карточки возвращаются в прокрутки --- */
{
  db.prepare("UPDATE users SET cash=cash+100000 WHERE id=7").run(); await call(7, "sync");
  // выпускаем весь тираж «ошибки печати» Ополченца и продаём её
  db.prepare("DELETE FROM cards WHERE h=0 AND f=4").run();db.prepare("INSERT INTO cards(owner,h,f,no,sn,nice,hue,v,stats,created) VALUES(7,0,4,1,'314159',0,0,100,'[1,1,1,1,1]',0)").run();
  const mis = db.prepare("SELECT id FROM cards WHERE h=0 AND f=4").get().id;
  r = await call(7, "sell", { id: mis }); ok(r.ok && !db.prepare("SELECT 1 FROM cards WHERE id=?").get(mis), "проданная карточка удалена из игры");
  ok(!db.prepare("SELECT 1 FROM cards WHERE sn='314159'").get(), "её номер 314 159 снова свободен");
  // золотые: тираж 10 выпущен целиком, одну продали — следующая получит её место
  db.prepare("DELETE FROM cards WHERE h=1 AND f=3").run();
  for (let i = 1; i <= 10; i++) db.prepare("INSERT INTO cards(owner,h,f,no,sn,nice,hue,v,stats,created) VALUES(7,1,3,?,?,0,0,100,'[1,1,1,1,1]',0)").run(i, "5550" + String(i).padStart(2, "0"));
  const g3 = db.prepare("SELECT id FROM cards WHERE h=1 AND f=3 AND no=3").get().id;
  r = await call(7, "sell", { id: g3 }); ok(r.ok, "продал золотую 3/10");
  const ids = r.S.cards.filter(c => c.h === 1 && c.f === 3).slice(0, 3).map(c => c.id);
  r = await call(7, "craft", { ids, h: 1, f: 3 });
  if (r.ok && r.res.win) ok(r.res.card.no === 3, "место 3/10 снова выпало: новая золотая получила № 3/10 (получено " + r.res.card.no + ")");
  else ok(r.ok, "крафт золотой прошёл (не повезло, место 3/10 проверено ниже)");
  r = await call(7, "sync"); ok(r.S.prints["1-3"] <= 10, "тираж считается по картам в игре: " + r.S.prints["1-3"] + "/10");
}
/* --- режим удачи --- */
r = await call(7, "luck_set", { on: 1 }); ok(!r.ok && /доступа/.test(r.err), "обычному игроку режим удачи недоступен");
r = await call(7, "stats"); ok(!r.ok && /доступа/.test(r.err), "обычному игроку статистика недоступна");
{
  const env2 = { ...env, ADMINS: "8" };
  const call8 = async (a, p = {}) => (await worker.fetch(new Request("https://x/api", { method: "POST", headers: { "Content-Type": "application/json", "X-Dev-User": "8" }, body: JSON.stringify({ a, p }) }), env2)).json();
  r = await call8("sync"); ok(r.S.admin === true, "администратор видит админ-панель");
  r = await call8("luck_set", { on: 1 }); ok(r.ok && r.res.on, "режим удачи включён");
  let rare = 0, nice = 0; for (let i = 0; i < 4; i++) { r = await call8("open"); if (r.ok) { if (r.res.card.f >= 1) rare++; if (classify(r.res.card.sn)) nice++ } }
  ok(rare >= 3 && nice >= 3, "с удачей: редких отделок " + rare + "/4, красивых номеров " + nice + "/4");
  r = await call8("sync"); let wins = 0;
  for (let i = 0; i < 3; i++) { r = await call8("sync"); const cheap = r.S.cards.filter(c => c.f !== 5 && !c.part).sort((a, b) => a.v - b.v)[0]; if (!cheap) break; const cr = await call8("craft", { ids: [cheap.id], h: 30, f: 3 }); if (cr.ok && cr.res.win) wins++; else console.log("CRAFT", JSON.stringify(cr).slice(0,200), JSON.stringify(cheap).slice(0,150)); }
  ok(wins === 3, "с удачей крафт всегда удаётся, даже с маленьким шансом (" + wins + "/3)");
  r = await call8("luck_set", { on: 0 }); ok(r.ok && !r.res.on, "режим удачи выключен");
  r = await call8("stats"); const T = r.res;
  ok(r.ok && T.players >= 8 && T.newToday >= 8 && T.activeToday >= 3 && T.today.open >= 4 && T.fromRef >= 3 && T.days.length === 14, "статистика: игроков " + T.players + ", новых сегодня " + T.newToday + ", активных " + T.activeToday + ", прокруток " + T.today.open + ", по приглашению " + T.fromRef);
  ok(T.inviters[0] && T.inviters[0].refs >= 2, "лучший пригласивший: " + (T.inviters[0] && T.inviters[0].name + " — " + T.inviters[0].refs));
  // возврат на второй день: игрок пришёл «вчера» и зашёл сегодня
  db.prepare("UPDATE users SET created=?, seen=?, d1=0 WHERE id=7").run(Date.now() - 864e5, Date.now() - 864e5);
  await call(7, "sync"); ok(db.prepare("SELECT d1 FROM users WHERE id=7").get().d1 === 1, "вернувшийся на второй день отмечен");
}

/* --- напоминания от бота --- */
{
  const sent = []; const realFetch = globalThis.fetch;
  globalThis.fetch = async (u, o) => { const b = JSON.parse(o.body); sent.push(b); return new Response(b.chat_id === 8888 ? '{"ok":false,"error_code":403}' : '{"ok":true}') };
  const envN = { ...env, NOTIFY_TEST: "1" };
  const callN = async (uid, a, p = {}) => (await worker.fetch(new Request("https://x/api", { method: "POST", headers: { "Content-Type": "application/json", "X-Dev-User": String(uid) }, body: JSON.stringify({ a, p }) }), envN)).json();
  // игрок тратит прокрутки — появляется время пополнения
  await callN(8100, "sync"); for (let i = 0; i < 3; i++) await callN(8100, "open");
  let row = db.prepare("SELECT refill_at, pm FROM users WHERE id=8100").get(); ok(row.refill_at > Date.now(), "время пополнения прокруток записано");
  await callN(8100, "pm_on");
  db.prepare("UPDATE users SET refill_at=? WHERE id=8100").run(Date.now() - 1000);
  const ctxW = { waitUntil: p => ctxW.p = p }; await worker.scheduled({}, envN, ctxW); await ctxW.p;
  ok(sent.some(m => m.chat_id === 8100 && /прокрутки готовы/.test(m.text)), "бот прислал «прокрутки готовы»");
  const n1 = sent.length; await worker.scheduled({}, envN, ctxW); await ctxW.p; ok(sent.length === n1, "одно напоминание на одно пополнение");
  // без разрешения не пишем
  await callN(8101, "sync"); for (let i = 0; i < 3; i++) await callN(8101, "open"); db.prepare("UPDATE users SET refill_at=? WHERE id=8101").run(Date.now() - 1000);
  await worker.scheduled({}, envN, ctxW); await ctxW.p; ok(!sent.some(m => m.chat_id === 8101), "без разрешения бот не пишет");
  // заблокировал бота
  await callN(8888, "sync"); await callN(8888, "pm_on"); for (let i = 0; i < 3; i++) await callN(8888, "open"); db.prepare("UPDATE users SET refill_at=? WHERE id=8888").run(Date.now() - 1000);
  await worker.scheduled({}, envN, ctxW); await ctxW.p; ok(db.prepare("SELECT pm FROM users WHERE id=8888").get().pm === 0, "заблокировал бота — больше не пишем");
  // нападение и продажа
  db.prepare("UPDATE users SET pm=1, att_note=0 WHERE id IN (1,2)").run();
  const mine2 = await anyCard(2, callN), c1 = await anyCard(1, callN);
  const before = sent.length; r = await callN(2, "fduel", { oppId: c1.id, oppStat: 1, myId: mine2.id, myStat: 0 });
  const am = sent.slice(before).find(m => m.chat_id === 1);
  ok(r.ok && am && /startapp=c_/.test(am.reply_markup.inline_keyboard[0][0].web_app.url), "защитнику пришло сообщение с кнопкой «Реванш»");
  const b2 = sent.length; await callN(2, "fduel", { oppId: c1.id, oppStat: 2, myId: mine2.id, myStat: 0 }); ok(!sent.slice(b2).some(m => m.chat_id === 1), "о нападениях не чаще раза в 30 минут");
  db.prepare("UPDATE users SET cash=cash+1000 WHERE id=2").run();
  await callN(1, "list", { id: c1.id, price: 5 }); const b3 = sent.length; r = await callN(2, "buy", { id: c1.id, price: 5 });
  ok(r.ok && sent.slice(b3).some(m => m.chat_id === 1 && /купил/.test(m.text)), "продавцу пришло «твою карточку купили»");
  globalThis.fetch = realFetch;
}

/* --- акция «2 друга» → VIP и рассылка --- */
{
  const sent = []; const realFetch = globalThis.fetch;
  globalThis.fetch = async (u, o) => { sent.push(JSON.parse(o.body)); return new Response('{"ok":true}') };
  const envA = { ...env, ADMINS: "8", NOTIFY_TEST: "1" };
  const ca = async (uid, a, p = {}, start = "") => (await worker.fetch(new Request("https://x/api", { method: "POST", headers: { "Content-Type": "application/json", "X-Dev-User": String(uid), "X-Dev-Start": start }, body: JSON.stringify({ a, p }) }), envA)).json();
  r = await ca(9500, "promo_set", { hours: 3, need: 2 }); ok(!r.ok, "обычный игрок не может запустить акцию");
  r = await ca(8, "promo_set", { hours: 3, need: 2 }); ok(r.ok, "админ запустил акцию на 3 часа");
  await ca(9500, "sync"); await ca(9500, "pm_on");
  r = await ca(9500, "sync"); ok(r.S.promo && r.S.promo.have === 0 && r.S.promo.need === 2, "игрок видит акцию: 0 из 2");
  await ca(9501, "sync", {}, "r_9500");
  r = await ca(9500, "sync"); ok(r.S.promo.have === 1 && !(r.S.vipUntil > Date.now()), "1 друг: ещё не VIP");
  await ca(9502, "sync", {}, "r_9500");
  r = await ca(9500, "sync"); ok(r.S.vipUntil > Date.now() + 6 * 864e5, "2 друга за время акции: VIP на 7 дней");
  ok(sent.some(m => m.chat_id === 9500 && /VIP/.test(m.text)), "бот поздравил с VIP");
  // VIP получает 5 прокруток при пополнении
  db.prepare("UPDATE users SET gift_spins=0 WHERE id=9500").run();
  const st = JSON.parse(db.prepare("SELECT state FROM users WHERE id=9500").get().state); st.spins = 0; st.refillAt = Date.now() - 1; db.prepare("UPDATE users SET state=? WHERE id=9500").run(JSON.stringify(st));
  r = await ca(9500, "open"); ok(r.ok && r.S.spins === 4, "VIP: пополнение до 5 прокруток (после открытия осталось " + r.S.spins + ")");
  r = await ca(9500, "top", { kind: "worth" }); const me = r.res.items.find(x => x.uid === 9500); ok(me && me.vip === 1, "в топе отмечен VIP");
  // рассылка порциями
  for (let i = 0; i < 45; i++) db.prepare("INSERT OR IGNORE INTO users(id,name,cash,state,ver,pm) VALUES(?,?,0,'{}',0,1)").run(200000 + i, "b");
  const b0 = sent.length; let after = 0, total = 0, rounds = 0, done = false;
  while (!done && rounds < 10) { r = await ca(8, "broadcast", { text: "Привет всем!", after }); rounds++; total += r.res.sent; after = r.res.last; done = r.res.done }
  ok(total === r.res.total && rounds >= 2, "рассылка: " + total + " из " + r.res.total + " за " + rounds + " порции");
  r = await ca(9500, "broadcast", { text: "спам" }); ok(!r.ok, "обычный игрок не может делать рассылку");
  await ca(8, "promo_set", { hours: 0 }); r = await ca(9500, "sync"); ok(!r.S.promo, "акция выключена");
  globalThis.fetch = realFetch;
}

/* --- арена: живой бой игрок против игрока --- */
{
  const A = 6111111111, B = 6222222222, Cw = 6333333333;
  for (const u of [A, B, Cw]) { await call(u, "sync"); db.prepare("UPDATE users SET gift_spins=gift_spins+5 WHERE id=?").run(u); for (let i = 0; i < 4; i++) await call(u, "open") }
  db.prepare("UPDATE cards SET v=50 WHERE owner IN (?,?,?)").run(A, B, Cw);
  const ca = await anyCard(A), cb = await anyCard(B);
  r = await call(A, "room_create", { id: ca.id, mode: 1 }); ok(r.ok && r.res.phase === "open", "создан бой на карточку");
  const room = r.res.id;
  r = await call(A, "sell", { id: ca.id }); ok(!r.ok && /арене/.test(r.err), "карточку в бою нельзя продать: " + r.err);
  r = await call(A, "room_create", { id: (await anyCard(A)).id }); ok(!r.ok, "второй бой одновременно нельзя");
  r = await call(B, "arena_list"); ok(r.ok && r.res.open.some(x => x.id === room) && r.res.open.find(x => x.id === room).host.card.stats === null, "бой виден в лобби, характеристики скрыты");
  r = await call(B, "room_join", { room, id: cb.id }); ok(r.ok && r.res.phase === "p0" && r.res.role === "guest", "соперник принял бой");
  r = await call(Cw, "room_join", { room, id: (await anyCard(Cw)).id }); ok(!r.ok, "третий войти не может");
  r = await call(B, "room_pick", { room, stat: 0 }); ok(!r.ok && /ход/.test(r.err), "в первом раунде выбирает создатель");
  r = await call(A, "room_pick", { room, stat: 2 }); ok(r.ok && r.res.phase === "s0" && r.res.rounds.length === 1, "раунд 1 вскрыт у обоих");
  r = await call(Cw, "room_get", { room }); ok(r.ok && r.res.role === null && r.res.rounds.length === 1, "зритель видит бой в реальном времени");
  db.prepare("UPDATE rooms SET until=0 WHERE id=?").run(room);   // время показа вышло
  r = await call(B, "room_get", { room }); ok(r.res.phase === "p1", "ход соперника");
  r = await call(B, "room_pick", { room, stat: 2 }); ok(!r.ok, "уже выбранную характеристику нельзя");
  r = await call(B, "room_pick", { room, stat: 4 }); ok(r.ok && r.res.phase === "s1", "раунд 2 вскрыт");
  db.prepare("UPDATE rooms SET until=0 WHERE id=?").run(room); r = await call(A, "room_get", { room }); ok(r.res.phase === "s2" && r.res.rounds.length === 3, "раунд 3 случайный");
  db.prepare("UPDATE rooms SET until=0 WHERE id=?").run(room); r = await call(A, "room_get", { room });
  const res = r.res.result; ok(r.res.phase === "done" && res, "бой закончен: " + (res && res.w + ":" + res.l));
  const oa = db.prepare("SELECT owner, room_id FROM cards WHERE id=?").get(ca.id), ob = db.prepare("SELECT owner, room_id FROM cards WHERE id=?").get(cb.id);
  if (res.w > res.l) ok(oa.owner === A && ob.owner === A, "победитель забрал карточку соперника");
  else if (res.l > res.w) ok(oa.owner === B && ob.owner === B, "победитель забрал карточку соперника");
  else ok(oa.owner === A && ob.owner === B, "ничья: карточки остались у хозяев");
  ok(oa.room_id === null && ob.room_id === null, "карточки разблокированы");
  r = await call(A, "room_get", { room }); r = await call(B, "room_get", { room });
  const wins = db.prepare("SELECT COUNT(*) n FROM cards WHERE id IN (?,?)").get(ca.id, cb.id).n; ok(wins === 2, "итог применён один раз, карточки не задвоились и не пропали");
  // таймаут: создатель не выбирает — выбор сделает сервер
  const c2 = await anyCard(A), d2 = await anyCard(B);
  r = await call(A, "room_create", { id: c2.id, mode: 0, priv: 1 }); const room2 = r.res.id, code = r.res.code;
  r = await call(B, "arena_list"); ok(!r.res.open.some(x => x.id === room2), "закрытый бой не виден в лобби");
  r = await call(B, "room_join", { room: room2, id: d2.id }); ok(!r.ok, "в закрытый бой без кода не войти");
  r = await call(B, "room_join", { room: room2, id: d2.id, code }); ok(r.ok, "друг вошёл по ссылке");
  for (let i = 0; i < 6; i++) { db.prepare("UPDATE rooms SET until=0 WHERE id=?").run(room2); r = await call(B, "room_get", { room: room2 }) }
  ok(r.res.phase === "done" && r.res.rounds.length === 3, "если никто не нажал, бой всё равно доходит до конца");
  const c3 = await anyCard(A); r = await call(A, "room_create", { id: c3.id }); const room3 = r.res.id;
  r = await call(A, "room_cancel", { room: room3 }); ok(r.ok && db.prepare("SELECT room_id FROM cards WHERE id=?").get(c3.id).room_id === null, "отмена боя возвращает карточку");
}

/* --- тренировочный лагерь: тапалка, руны, прокачка, прокрутки за руны --- */
{
  const runes = () => JSON.parse(db.prepare("SELECT state FROM users WHERE id=7800").get().state).camp.runes;
  const setCamp = f => { const st = JSON.parse(db.prepare("SELECT state FROM users WHERE id=7800").get().state); f(st.camp); db.prepare("UPDATE users SET state=? WHERE id=7800").run(JSON.stringify(st)) };
  await call(7800, "sync");
  r = await call(7800, "buy_spin"); ok(!r.ok && /рун/.test(r.err), "за $ прокрутки больше не купить, нужны руны: " + r.err);
  r = await call(7800, "camp_tap", { n: 40 }); ok(r.ok && r.res.n === 40 && r.res.gain >= 40 && runes() === r.res.gain, "40 ударов → " + r.res.gain + " рун");
  r = await call(7800, "camp_tap", { n: 400 }); ok(r.ok && r.res.n <= 40, "автокликер упирается в лимит по времени: засчитано " + r.res.n + " из 400");
  setCamp(C => { C.en = 5; C.at = Date.now(); C.tapAt = 0 });
  r = await call(7800, "camp_tap", { n: 50 }); ok(r.res.n === 5, "энергии 5 — засчитано только 5 ударов");
  setCamp(C => { C.runes = 100000; C.tapAt = 0 });
  r = await call(7800, "camp_up", { k: "pw" }); ok(r.ok && r.S.camp.lv.pw === 1 && r.S.camp.runes === 100000 - 400, "прокачка силы удара за 400 рун");
  r = await call(7800, "camp_target"); ok(r.ok && r.S.camp.t === 1 && r.S.camp.hp === 1000, "открыта мишень лучника");
  r = await call(7800, "camp_up", { k: "sq" }); setCamp(C => { C.sqAt = Date.now() - 10 * 3600e3 });
  r = await call(7800, "camp_collect"); ok(r.ok && r.res.gain === Math.floor(3 * 30 * 1.2), "оруженосец копит максимум 3 часа: " + r.res.gain);
  const s0 = (await call(7800, "sync")).S.spins;
  r = await call(7800, "buy_spin"); ok(r.ok && r.res.price === 500 && r.S.spins === s0 + 1, "первая прокрутка за 500 рун");
  r = await call(7800, "buy_spin"); ok(r.ok && r.res.price === 1000, "вторая вдвое дороже: " + r.res.price);
  for (let i = 0; i < 3; i++) await call(7800, "buy_spin");
  r = await call(7800, "buy_spin"); ok(!r.ok && /5/.test(r.err), "не больше 5 в день: " + r.err);
  setCamp(C => { C.hp = 3; C.tapAt = 0; C.en = 100 });
  r = await call(7800, "camp_tap", { n: 3 }); ok(r.res.chests === 1 && r.res.chestR === 100, "мишень разбита — сундук 100 рун");
  ok(db.prepare("SELECT camp_at FROM users WHERE id=7800").get().camp_at > Date.now(), "время полной энергии записано для напоминания");
  await call(7801, "sync"); r = await call(7801, "camp_tap", { n: 10 });
  r = await call(7801, "camp_top", { per: "d" }); ok(r.ok && r.res.items[0].uid === 7800 && r.res.me.rank === 2 && r.res.me.score === 10 + 0 || r.res.me.score >= 10, "топ лагеря за день: 1-й 7800, я на " + r.res.me.rank + " месте");
  r = await call(7801, "camp_top", { per: "w" }); ok(r.ok && r.res.per === "w" && r.res.items.length >= 2 && r.res.left > 0 && r.res.left <= 7 * 864e5, "топ лагеря за неделю");
}
/* --- разовый пересчёт лагеря Царь_Татарстана --- */
{
  await call(7900, "sync"); await call(7901, "sync"); await call(7901, "camp_tap", { n: 30 });
  db.prepare("UPDATE users SET nick='Царь_Татарстана',nick_key='царь_татарстана' WHERE id=7900").run();
  const st = JSON.parse(db.prepare("SELECT state FROM users WHERE id=7900").get().state); const now = Date.now();
  st.camp = { runes: 100465, en: 100, at: now, lv: { pw: 20, en: 15, rg: 12, cr: 16, sq: 3 }, t: 5, hp: 50, kills: 9, total: 100465, sqAt: now, tapAt: 0, dK: "x", dR: 100465 };
  db.prepare("UPDATE users SET state=?,camp_dk=?,camp_dr=100465 WHERE id=7900").run(JSON.stringify(st), new Date(now + 3 * 3600e3).toISOString().slice(0, 10));
  const sp0 = (await call(7900, "sync")).S.spins;
  await worker.tick(env); await worker.tick(env);
  r = await call(7900, "sync"); const C = r.S.camp;
  ok(C.dR === 15000 && C.lv.pw === 3 && C.t === 0 && Math.floor(C.runes) === 2150 && r.S.spins === sp0 + 5 && /извини/i.test(r.S.notice || ""), "пересчёт: 15 000 рун за день, прокачка частично, +5 прокруток, сообщение");
  r = await call(7901, "camp_top", { per: "d" }); ok(r.res.items[0].uid === 7900, "он остаётся первым в топе дня");
  r = await call(7900, "notice_ok"); ok(r.ok && !r.S.notice, "сообщение закрыто и больше не показывается");
  await worker.tick(env); r = await call(7900, "sync"); ok(r.S.spins === sp0 + 5, "пересчёт выполняется только один раз");
}
/* --- колесо фортуны --- */
{
  await call(7700, "sync"); r = await call(7700, "wheel"); ok(r.ok && r.res.i >= 0 && r.res.i < 8, "колесо фортуны: выпал сектор " + (r.ok && r.res.i));
  r = await call(7700, "wheel"); ok(!r.ok && /завтра/.test(r.err), "второй раз за день нельзя");
}
/* --- турнир выходных --- */
{
  const envT = { ...env, ADMINS: "8" };
  const ct = async (uid, a, p = {}) => (await worker.fetch(new Request("https://x/api", { method: "POST", headers: { "Content-Type": "application/json", "X-Dev-User": String(uid) }, body: JSON.stringify({ a, p }) }), envT)).json();
  const P = [5101, 5102, 5103, 5104, 5105];
  r = await ct(5101, "tour_get"); ok(r.ok && r.res.phase === "reg" && new Date(r.res.start + 3 * 3600e3).getUTCDay() === 6 && new Date(r.res.start + 3 * 3600e3).getUTCHours() === 20, "турнир назначен на субботу 20:00 по Минску");
  for (const u of P) { await ct(u, "sync"); const c = await anyCard(u, ct); r = await ct(u, "tour_join", { id: c.id }) }
  r = await ct(5101, "tour_get"); ok(r.res.count === 5 && r.res.me, "записались 5 игроков");
  r = await ct(5101, "tour_admin", { min: 0 }); ok(!r.ok, "обычный игрок не может запустить турнир");
  r = await ct(8, "tour_admin", { min: 0 }); ok(r.ok, "админ запустил турнир сейчас");
  await worker.tick(envT);
  r = await ct(5101, "tour_get"); ok(r.res.phase === "run" && r.res.matches.filter(m => m.round === 1).length === 4, "сетка на 8 мест: 4 матча, 3 прохода без соперника");
  let guard = 0;
  while (guard++ < 40) { db.prepare("UPDATE rooms SET until=0 WHERE tour IS NOT NULL AND phase IN ('p0','s0','p1','s1','s2')").run(); await worker.tick(envT); r = await ct(5101, "tour_get"); if (r.res.phase !== "run") break }
  const last = db.prepare("SELECT * FROM tours ORDER BY id DESC LIMIT 1 OFFSET 1").get() || db.prepare("SELECT * FROM tours WHERE phase='done' ORDER BY id DESC LIMIT 1").get();
  const done = db.prepare("SELECT * FROM tours WHERE phase='done' AND champion IS NOT NULL ORDER BY id DESC LIMIT 1").get();
  ok(done && P.includes(done.champion), "турнир завершён, чемпион " + (done && done.champion_name) + " (циклов " + guard + ")");
  r = await ct(done.champion, "sync"); ok(r.S.vipUntil > Date.now() && r.S.champion && r.S.champion.uid === done.champion, "чемпион получил VIP и кубок");
  r = await ct(5101, "tour_get"); ok(r.res.phase === "reg" && r.res.last && r.res.last.uid === done.champion, "следующий турнир уже открыт для записи");
  const locked = db.prepare("SELECT COUNT(*) n FROM cards WHERE room_id IS NOT NULL").get().n; ok(locked === 0, "после турнира все карточки разблокированы");
}

/* --- рекламные ссылки с меткой --- */
{
  const envA = { ...env, ADMINS: "8" };
  const cs = async (uid, a, p = {}, start = "") => (await worker.fetch(new Request("https://x/api", { method: "POST", headers: { "Content-Type": "application/json", "X-Dev-User": String(uid), "X-Dev-Start": start }, body: JSON.stringify({ a, p }) }), envA)).json();
  await cs(6501, "sync", {}, "s_Memes1"); await cs(6501, "open", {}, "s_Memes1"); await cs(6502, "sync", {}, "s_memes1"); await cs(9000, "sync", {}, "s_memes1"); await cs(6503, "sync", {}, "s_cats");
  const r = await cs(8, "stats"); const m = (r.res.srcs || []).find(x => x.code === "memes1");
  ok(m && m.visits === 3 && m.fresh === 2, "переходы по ссылке с меткой: зашли 3, новых 2 (" + JSON.stringify(m) + ")");
  ok((r.res.srcs || []).some(x => x.code === "cats" && x.fresh === 1), "вторая метка считается отдельно");
}
/* --- челлендж приглашений --- */
{
  const envC = { ...env, ADMINS: "8" };
  const cc = async (uid, a, p = {}, start = "") => (await worker.fetch(new Request("https://x/api", { method: "POST", headers: { "Content-Type": "application/json", "X-Dev-User": String(uid), "X-Dev-Start": start }, body: JSON.stringify({ a, p }) }), envC)).json();
  const now = Date.now();
  let r = await cc(6001, "chal_set", { cfg: { id: "t1", start: now - 36e5, end: now + 36e5, prizes: ["$20", "$10", "$7"], slots: [] } }); ok(!r.ok, "обычный игрок не может настроить челлендж");
  r = await cc(8, "chal_set", { cfg: { id: "t1", start: now - 36e5, end: now + 36e5, prizes: ["$20", "$10", "$7"], slots: [] } }); ok(r.ok, "админ настроил челлендж");
  await cc(6001, "sync");
  await cc(6002, "sync", {}, "r_6001"); for (let i = 0; i < 3; i++) await cc(6002, "open");
  await cc(6003, "sync", {}, "r_6002"); for (let i = 0; i < 3; i++) await cc(6003, "open");
  const g0 = (await cc(6001, "sync")).S.spins;
  r = await cc(6004, "sync", {}, "r_6001"); const o4 = await cc(6004, "open"); ok(o4.ok && o4.res.card.h >= 19, "во время челленджа другу выпадает гарантированная эпическая");
  const g1 = (await cc(6001, "sync")).S.spins; ok(g1 - g0 === 20, "пригласившему ×2: +20 прокруток (" + (g1 - g0) + ")");
  r = await cc(6001, "chal_get"); ok(r.ok && r.res.phase === "on" && r.res.me.n === 2 && r.res.me.d === 1 && r.res.me.l2 === 1 && r.res.me.place === 1, "друг + друг друга = 2 очка, пустой аккаунт не считается (" + JSON.stringify(r.res && r.res.me) + ")");
  r = await cc(6002, "chal_get"); ok(r.res.me.n === 1 && r.res.me.place === 2, "друг на 2 месте с 1 очком");
  await cc(8, "chal_set", { cfg: { id: "t1", start: now - 36e5, end: Date.now() - 1, prizes: ["$20", "$10", "$7"], slots: [] } });
  await worker.tick(envC); await worker.tick(envC);
  r = await cc(6001, "chal_get"); ok(r.ok && r.res === null, "после конца конкурса блок с таблицей убирается");
  { const fin = JSON.parse(db.prepare("SELECT v FROM kv WHERE k='chal_res:t1'").get().v); ok(fin.rows[0].n === 2 && fin.rows[0].uid === 6001, "итоги зафиксированы"); }
  // розыгрыш: от 3 друзей участник, каждый друг — билет, победитель один
  const n0 = Date.now();
  await cc(8, "chal_set", { cfg: { id: "lot1", lot: 1, min: 3, start: n0 - 36e5, end: n0 + 36e5, prizes: ["$20"], slots: [] } });
  for (let i = 0; i < 3; i++) { await cc(6201 + i, "sync", {}, "r_6200"); for (let k = 0; k < 3; k++) await cc(6201 + i, "open"); }
  await cc(6211, "sync", {}, "r_6210"); for (let k = 0; k < 3; k++) await cc(6211, "open");
  await cc(6200, "sync"); await cc(6210, "sync");
  r = await cc(6200, "chal_get"); ok(r.ok && r.res.lot === 1 && r.res.me.n === 3 && r.res.players === 1 && r.res.tickets === 3, "розыгрыш: 3 друга = участник с 3 билетами");
  r = await cc(6210, "chal_get"); ok(r.res.me.n === 1 && r.res.players === 1, "1 друг — ещё не участник");
  await cc(8, "chal_set", { cfg: { id: "lot1", lot: 1, min: 3, start: n0 - 36e5, end: Date.now() - 1, prizes: ["$20"], slots: [] } });
  await worker.tick(envC); await worker.tick(envC);
  { const fin = JSON.parse(db.prepare("SELECT v FROM kv WHERE k='chal_res:lot1'").get().v); ok(fin.winner && fin.winner.uid === 6200 && fin.players === 1 && fin.tickets === 3, "победитель выбран по билетам"); }
  await cc(8, "chal_set", { cfg: { id: "off", start: 0, end: 0, prizes: ["$20", "$10", "$7"], slots: [] } });
}

/* --- Сокровищница: звёзды, сундуки, половинки, свой номер, ник --- */
{
  const envP = { ...env, PAY_SIM: "1" };
  const cp = async (uid, a, p = {}) => (await worker.fetch(new Request("https://x/api", { method: "POST", headers: { "Content-Type": "application/json", "X-Dev-User": String(uid) }, body: JSON.stringify({ a, p }) }), envP)).json();
  const buy = async (uid, p) => { const i = await cp(uid, "invoice", p); if (!i.ok) return i; return cp(uid, "pay_sim", { pid: i.res.pid }); };
  const U = 7001; await cp(U, "sync");
  let r = await call(U, "invoice", { item: "small" }); ok(!r.ok && /Telegram/.test(r.err), "без PAY_SIM счёт создаёт Telegram, симуляции нет");
  r = await call(U, "pay_sim", { pid: 1 }); ok(!r.ok, "симуляция оплаты закрыта на боевом сервере");
  r = await call(U, "grant", { item: "royal", pid: 999 }); ok(!r.ok, "выдать покупку напрямую нельзя");
  const sp0 = (await cp(U, "sync")).S.spins;
  r = await buy(U, { item: "small" });
  ok(r.ok && r.res.status === "done" && r.res.res.cards.length === 1 && r.res.res.cards[0].part > 0, "малый сундук: 1 половинка (" + JSON.stringify(r.res && r.res.res && r.res.res.cards.map(c => [c.h, c.part, c.no])) + ")");
  ok(r.S.spins - sp0 === 10, "малый сундук: +10 прокруток");
  r = await buy(U, { item: "royal" }); const hv = r.res.res.cards;
  ok(r.ok && hv.length === 6 && hv.every(c => c.part > 0 && c.h >= 32) && hv.some(c => c.part === 2), "королевский: 6 половинок, минимум 1 правая");
  ok(hv.filter(c => c.part === 2 && c.f === 0).every(c => c.no >= 1 && c.no <= 300), "правые половинки получают место тиража 1..300");
  r = await buy(U, { item: "newbie" }); ok(r.ok && r.res.status === "done" && r.S.guar >= 1, "подарок новичку: гарантия эпика");
  r = await cp(U, "invoice", { item: "newbie" }); ok(!r.ok && /уже получен/.test(r.err), "подарок новичку только один раз");
  r = await buy(U, { item: "warrior" }); ok(r.ok && r.res.res.cards.length === 5 && r.res.res.cards.some(c => c.h < 32 && [19,20,21,22,23,24,25,26,27,28,29,30,31].includes(c.h)), "сундук воина: 5 карточек, есть эпик+");
  r = await buy(U, { item: "legend" }); ok(r.ok && r.res.res.cards.length === 10 && r.res.res.cards.some(c => (c.h >= 26 && c.h <= 29) || (c.h >= 38 && c.h <= 40)), "легендарный: 10 карточек, есть легендарная (или богатырь)");
  let sh = await cp(U, "shop"); const m0 = sh.res.mythLeft;
  r = await buy(U, { item: "mythic" }); ok(r.ok && r.res.res.cards.some(c => [30, 31, 38, 39, 40].includes(c.h)) && r.res.res.cards.every(c => !c.part && (c.h < 32 || c.h >= 38)), "мифический: Сёгун, Мерлин или богатырь, без половинок");
  sh = await cp(U, "shop"); ok(m0 === 30 && sh.res.mythLeft === 29, "мифических сундуков в месяц 30 на всех (осталось " + sh.res.mythLeft + ")");
  r = await buy(U, { item: "legend" }); ok(r.ok && r.S.cards.length === 42, "купленное кладётся сверх лимита коллекции (" + r.S.cards.length + ")");
  // повторная выдача того же платежа ничего не даёт
  { const n0 = r.S.cards.length; const pid = r.res.pid; db.prepare("UPDATE payments SET status='paid' WHERE id=?").run(pid); await worker.tick(envP);
    db.prepare("UPDATE payments SET paid=0 WHERE id=?").run(pid); await worker.tick(envP); const s2 = await cp(U, "sync"); ok(s2.S.cards.length === n0, "повторная выдача того же платежа ничего не добавляет"); }
  // половинки не воюют и не крафтятся
  const half = (await cp(U, "sync")).S.cards.find(c => c.part > 0);
  r = await cp(U, "duel", { id: half.id, stat: 0 }); ok(!r.ok && /Половинка/.test(r.err), "половинка не дерётся");
  r = await cp(U, "craft", { ids: [half.id], h: 5, f: 0 }); ok(!r.ok && /Половинк/.test(r.err), "половинку нельзя сжечь в крафте");
  r = await cp(U, "craft", { ids: [(await anyCard(U, cp)).id], h: 33, f: 0 }); ok(!r.ok && /Составных/.test(r.err), "составного воина нельзя скрафтить");
  // сборка
  const U2 = 7002; await cp(U2, "sync");
  const ins = db.prepare("INSERT INTO cards(owner,h,f,no,sn,nice,hue,v,stats,xp,wins,stars,created,part) VALUES(?,?,?,?,?,0,0,100,'[500,500,500,500,500]',0,0,0,0,?)");
  ins.run(U2, 32, 0, 1000123, "410001", 1); ins.run(U2, 32, 0, 7, "410002", 2);
  r = await cp(U2, "assemble", { h: 32 }); const full = r.ok && r.res.card;
  ok(full && full.h === 32 && full.part === 0 && full.no === 7 && full.sn === "410002" && full.f === 0, "сборка: целый Дракон забирает номер тиража 7/300 и номер правой половинки");
  ok(r.S.cards.filter(c => c.h === 32).length === 1, "половинки ушли, остался один целый воин");
  r = await cp(U2, "assemble", { h: 32 }); ok(!r.ok, "без половинок собрать нельзя");
  ins.run(U2, 34, 4, 1001, "410003", 1); ins.run(U2, 34, 0, 9, "410004", 2);
  r = await cp(U2, "assemble", { h: 34 }); ok(!r.ok && /Ошибка печати/.test(r.err), "«ошибка» собирается только с «ошибкой»");
  ins.run(U2, 34, 4, 2001, "410005", 2);
  r = await cp(U2, "assemble", { h: 34 }); ok(r.ok && r.res.card.f === 4 && r.res.card.no === 1, "две «ошибки печати» = целая «ошибка печати» 1/1");
  r = await cp(U2, "duel", { id: full.id, stat: 0 }); ok(r.ok, "собранный воин дерётся");
  // тираж правых: когда 300 мест заняты, правые этого воина больше не выпадают
  { const many = db.prepare("INSERT INTO cards(owner,h,f,no,sn,nice,hue,v,stats,xp,wins,stars,created,part) VALUES(-2,33,0,?,?,0,0,1,'[1,1,1,1,1]',0,0,0,0,2)");
    for (let i = 1; i <= 300; i++) try { many.run(i, "9" + String(i).padStart(5, "0")) } catch (e) {}
    let bad = 0; for (let k = 0; k < 4; k++) { const x = await buy(U2, { item: "royal" }); bad += x.res.res.cards.filter(c => c.h === 33 && c.part === 2).length; }
    ok(bad === 0, "правые половинки Феникса закончились — больше не выпадают");
    sh = await cp(U2, "shop"); ok(sh.res.comp[33].r + sh.res.comp[33].full >= 300 && sh.res.comp[32].full === 1, "Сокровищница показывает остаток тиража"); }
  // свой номер
  const c1 = await anyCard(U, cp); db.prepare("DELETE FROM cards WHERE sn IN ('777777','100000')").run();
  r = await cp(U, "invoice", { item: "num", card: c1.id, sn: "777777" }); ok(r.ok && r.res.stars === 1600, "номер 777 777 стоит 1600 ⭐");
  r = await cp(U, "pay_sim", { pid: r.res.pid }); const c1b = r.S.cards.find(c => c.id === c1.id);
  ok(r.res.status === "done" && c1b.sn === "777777" && c1b.cust === 1 && Math.abs(c1b.v - c1.v) < .01, "свой номер поставлен, цена карточки не изменилась");
  r = await cp(U2, "invoice", { item: "num", card: full.id, sn: "777777" }); ok(!r.ok && /занят/.test(r.err), "занятый номер купить нельзя");
  r = await cp(U2, "invoice", { item: "num", card: full.id, sn: "12345" }); ok(!r.ok, "номер только из 6 цифр");
  { const a = await cp(U, "invoice", { item: "num", card: c1.id, sn: "100000" }), b = await cp(U2, "invoice", { item: "num", card: full.id, sn: "100000" });
    await cp(U, "pay_sim", { pid: a.res.pid }); const rb = await cp(U2, "pay_sim", { pid: b.res.pid });
    ok(rb.res.status === "refund", "если номер успели занять — звёзды возвращаются"); }
  // любая карточка и карточка мечты
  r = await cp(U2, "invoice", { item: "any", h: 41, f: 0 }); ok(!r.ok && /Ошибкой печати/.test(r.err), "Тор только «ошибкой печати»");
  db.prepare("DELETE FROM cards WHERE sn='444444'").run(); db.prepare("DELETE FROM cards WHERE h=41").run();
  r = await buy(U2, { item: "any", h: 41, f: 4 }); const thor = r.ok && r.res.res.cards[0];
  ok(thor && thor.h === 41 && thor.f === 4 && thor.sn === "444444", "любая карточка: Тор 1 из 1 с номером 444 444");
  r = await cp(U, "invoice", { item: "any", h: 41, f: 4 }); ok(!r.ok && /закончился/.test(r.err), "второго Тора нет");
  r = await cp(U2, "sell", { id: thor.id }); ok(!r.ok && /1 из 1/.test(r.err), "легенду 1 из 1 нельзя продать системе");
  r = await buy(U2, { item: "any", h: 30, f: 3 }); ok(r.ok && r.res.res.cards[0].h === 30 && r.res.res.cards[0].f === 3, "любая карточка: золотой Сёгун");
  r = await buy(U2, { item: "custom" }); ok(r.ok && r.res.status === "done" && r.res.res.manual === 1, "карточка мечты оплачена, заявка админу");
  sh = await cp(U2, "shop"); ok(sh.res.ones[41] && sh.res.ones[41].uid === U2 && 42 in sh.res.ones, "Сокровищница показывает, у кого легенда");
  // ник и король
  r = await buy(U2, { item: "fx", fx: "fire" }); ok(r.ok && r.S.nfx && r.S.nfx[U2] === "fire", "переливающийся ник включён");
  r = await cp(U2, "sync"); ok(r.S.king === U2, "«Король Эпох» — первый в топе донатеров месяца");
  sh = await cp(U, "shop"); ok(sh.res.donors[0].uid === U2 && sh.res.donors.length === 2, "топ донатеров месяца");
  // оплата через вебхук бота
  { const i = await cp(U2, "invoice", { item: "small" });
    const sec = (await import("node:crypto")).createHash("sha256").update("hook:" + env.BOT_TOKEN).digest("hex").slice(0, 48);
    const upd = { message: { from: { id: U2 }, chat: { id: U2, type: "private" }, successful_payment: { currency: "XTR", total_amount: 50, invoice_payload: "p" + i.res.pid, telegram_payment_charge_id: "ch_1" } } };
    await worker.fetch(new Request("https://x/tg", { method: "POST", headers: { "Content-Type": "application/json", "X-Telegram-Bot-Api-Secret-Token": sec }, body: JSON.stringify(upd) }), env);
    await worker.fetch(new Request("https://x/tg", { method: "POST", headers: { "Content-Type": "application/json", "X-Telegram-Bot-Api-Secret-Token": sec }, body: JSON.stringify(upd) }), env);
    const P = db.prepare("SELECT status,charge FROM payments WHERE id=?").get(i.res.pid); ok(P.status === "done" && P.charge === "ch_1", "оплата из Telegram выдаётся один раз");
    const bad = await cp(U2, "invoice", { item: "small" });
    await worker.fetch(new Request("https://x/tg", { method: "POST", headers: { "Content-Type": "application/json", "X-Telegram-Bot-Api-Secret-Token": sec }, body: JSON.stringify({ message: { from: { id: U2 }, chat: { id: U2, type: "private" }, successful_payment: { currency: "XTR", total_amount: 1, invoice_payload: "p" + bad.res.pid, telegram_payment_charge_id: "ch_2" } } }) }), env);
    ok(db.prepare("SELECT status FROM payments WHERE id=?").get(bad.res.pid).status === "refund", "сумма не совпала — возврат"); }
}

/* --- разовая рассылка 17:00: без поддельного времени не срабатывает и ничего не ломает --- */
await worker.tick(env); ok(!db.prepare("SELECT v FROM kv WHERE k='blast:lot1700'").get() || Date.now() >= Date.UTC(2026,9,23,14,0), "рассылка 17:00 не уходит раньше времени");
/* --- продажа выбранных и герои дня --- */
{ const U = 7201; await call(U, "sync"); for (let i = 0; i < 3; i++) await call(U, "open");
  let s = await call(U, "sync"); const ids = s.S.cards.slice(0, 3).map(c => c.id), sum = s.S.cards.slice(0, 3).reduce((a, c) => a + c.v * .85, 0), cash0 = s.S.cash;
  let r = await call(U, "sellmany", { ids }); ok(r.ok && r.res.n === 3 && Math.abs(r.S.cash - cash0 - sum) < .05 && r.S.cards.length === s.S.cards.length - 3, "продать выбранные: 3 карточки одним нажатием");
  r = await call(U, "sellmany", { ids: [999999] }); ok(!r.ok, "чужую карточку продать нельзя");
  await call(U, "camp_tap", { n: 30 });
  r = await call(U, "dtop"); const tap = r.ok && r.res.cats.find(c => c.k === "tap"); ok(tap && tap.me > 0 && tap.top.length > 0, "герои дня: тапы засчитаны (" + (tap && tap.me) + ")");
  db.prepare("INSERT OR REPLACE INTO dtop(day,k,uid,n) VALUES(?,?,?,?)").run(new Date(Date.now() + 3 * 3600e3 - 864e5).toISOString().slice(0, 10), "fight", U, 50);
  db.prepare("DELETE FROM kv WHERE k='dtop_paid'").run(); const g0 = db.prepare("SELECT gift_spins g FROM users WHERE id=?").get(U).g;
  await worker.tick(env); await worker.tick(env); const g1 = db.prepare("SELECT gift_spins g FROM users WHERE id=?").get(U).g;
  ok(g1 - g0 === 10, "герой дня за вчера получил +10 прокруток (" + (g1 - g0) + ")"); }
/* --- рейтинговый бой --- */
{ const ins = db.prepare("INSERT INTO cards(owner,h,f,no,sn,nice,hue,v,stats,xp,wins,stars,created,part) VALUES(?,?,0,?,?,0,0,50,'[300,300,300,300,300]',0,0,0,0,0)");
  const A = 7401, B = 7402; await call(A, "sync"); await call(B, "sync");
  ins.run(A, 20, 3000001, "740101"); ins.run(B, 21, 3000002, "740201"); ins.run(B, 2, 3000003, "740202");
  const ca = (await call(A, "sync")).S.cards.find(c => c.h === 20), cb = (await call(B, "sync")).S.cards.find(c => c.h === 21), cl = (await call(B, "sync")).S.cards.find(c => c.h === 2);
  let r = await call(A, "rk_find", { id: ca.id }); ok(r.ok && !r.res.match && r.res.queued, "рейтинг: встал в очередь");
  r = await call(B, "rk_find", { id: cl.id }); ok(r.ok && !r.res.match, "лёгкий вес не попадает к среднему сразу");
  await call(B, "rk_cancel");
  r = await call(B, "rk_find", { id: cb.id }); const mid = r.res.match; ok(r.ok && mid, "средний вес нашёл соперника своей категории");
  r = await call(A, "rk_poll"); ok(r.res.match === mid, "второй игрок видит бой");
  r = await call(A, "rk_get", { id: mid }); ok(r.ok && r.res.phase === "pick" && r.res.me.hp > 0 && r.res.op.card.h === 21, "бой: оба воина с полоской здоровья");
  r = await call(B, "duel", { id: cb.id, stat: 0 }); ok(!r.ok, "карточка в рейтинговом бою занята");
  let guard = 0; while (guard++ < 40) { const ga = await call(A, "rk_get", { id: mid }); if (ga.res.phase === "done") break;
    if (ga.res.phase === "pick") { if (!ga.res.myPick) await call(A, "rk_act", { id: mid, act: ["hit", "block", "feint"][guard % 3] }); const gb = await call(B, "rk_get", { id: mid }); if (gb.res.phase === "pick" && !gb.res.myPick) await call(B, "rk_act", { id: mid, act: ["feint", "hit", "block"][guard % 3] }); }
    else db.prepare("UPDATE rm SET until=0 WHERE id=?").run(mid); }
  r = await call(A, "rk_get", { id: mid }); ok(r.res.phase === "done" && r.res.win && r.res.res, "бой доходит до конца (" + r.res.turn + " ходов)");
  const ra = (await call(A, "rk_info")).res, rb = (await call(B, "rk_info")).res;
  ok(r.res.win === "d" || (r.res.win === "a" ? ra.rating === 30 && rb.rating === 0 : rb.rating === 30 && ra.rating === 0), "рейтинг: победитель +30 в среднем весе (" + ra.rating + " / " + rb.rating + ")");
  ok(ra.dayn === 1, "бой засчитан в дневной лимит");
  r = await call(B, "duel", { id: cb.id, stat: 0 }); ok(r.ok, "после боя карточка свободна");
  // тень: если долго нет соперника
  r = await call(A, "rk_find", { id: ca.id }); db.prepare("UPDATE rq SET t=t-31000 WHERE uid=?").run(A);
  r = await call(A, "rk_poll"); ok(r.ok && r.res.match, "через 30 секунд бой с тенью");
  const g = await call(A, "rk_get", { id: r.res.match }); ok(g.res.ghost === 1 && g.res.op.picked, "тень сама выбирает ход");
  db.prepare("UPDATE users SET rk_dayn=20 WHERE id=?").run(A); db.prepare("UPDATE rm SET phase='done',applied=1 WHERE a=?").run(A); db.prepare("UPDATE cards SET room_id=NULL WHERE owner=?").run(A);
  r = await call(A, "rk_find", { id: ca.id }); ok(!r.ok && /закончились/.test(r.err), "не больше 20 рейтинговых боёв в день"); }
/* --- странствующий торговец --- */
{ const U = 7701, V = 7702; await call(U, "sync"); await call(V, "sync"); db.prepare("UPDATE users SET cash=1e6 WHERE id IN (?,?)").run(U, V);
  let r = await call(U, "trader"); ok(r.ok && r.res.items.length === 6 && r.res.wants.length === 2 && r.res.items.every(x => x.card.f < 3 && x.card.h < 32), "торговец: 6 карточек и 2 заказа, без ошибок печати и донатных");
  ok(r.res.items.every(x => x.price >= x.card.v * 1.49 && x.price <= x.card.v * 1.61), "цена на 50–60% выше оценки");
  const it = r.res.items[5]; const c0 = (await call(U, "sync")).S.cash;
  r = await call(U, "trader_buy", { i: it.i }); ok(r.ok && r.res.card.h === it.card.h && Math.abs(c0 - r.S.cash - it.price) < .01, "купил звезду витрины у торговца");
  r = await call(V, "trader_buy", { i: it.i }); ok(!r.ok && /уже купили/.test(r.err), "второй раз ту же карточку не купить");
  r = await call(V, "trader"); ok(r.res.items[5].sold && r.res.items[5].sold.uid === U, "видно, кто купил");
  const w = r.res.wants[0];
  db.prepare("INSERT INTO cards(owner,h,f,no,sn,nice,hue,v,stats,xp,wins,stars,created,part) VALUES(?,?,0,?,?,0,0,100,'[200,200,200,200,200]',0,0,0,0,0)").run(V, w.h, 3100001, "770201");
  const cw = (await call(V, "sync")).S.cards.find(c => c.h === w.h && c.v === 100);
  r = await call(V, "trader_sell", { h: w.h, id: cw.id }); ok(r.ok && Math.abs(r.res.got - 130) < .01, "торговец купил нужного воина на 30% дороже");
  r = await call(V, "trader_sell", { h: w.h, id: cw.id }); ok(!r.ok, "второй раз в эту смену не продать"); }
/* --- аукцион дня и титулы --- */
{ const P = 7901, Q = 7902; await call(P, "sync"); await call(Q, "sync"); db.prepare("UPDATE users SET cash=2e6 WHERE id IN (?,?)").run(P, Q);
  const day = new Date(Date.now() + 3 * 3600e3).toISOString().slice(0, 10); db.prepare("DELETE FROM auc WHERE day=?").run(day);
  db.prepare("INSERT INTO auc(day,h,f,stats,hue,v,min,start,until) VALUES(?,?,?,?,?,?,?,?,?)").run(day, 26, 3, "[500,500,500,500,500]", 0, 30000, 15000, Date.now() - 1000, Date.now() + 600000);
  let r = await call(P, "auc"); ok(r.ok && r.res.phase === "on" && r.res.next === 15000, "аукцион идёт, старт $15 000");
  r = await call(P, "auc_bid", {}); ok(r.ok && r.res.mine && r.S.cash === 2e6 - 15000, "ставка списала деньги");
  r = await call(Q, "auc_bid", { amt: 15000 }); ok(r.ok && r.res.bid === 15750, "перебить можно минимум на 5%");
  r = await call(P, "sync"); ok(r.S.cash === 2e6, "перебитому деньги вернулись");
  db.prepare("UPDATE auc SET until=? WHERE day=?").run(Date.now() - 1, day); await worker.tick(env);
  r = await call(Q, "sync"); ok(r.S.cards.some(c => c.h === 26 && c.f === 3) && r.S.cash === 2e6 - 15750, "победитель получил карточку, деньги сгорели");
  r = await call(P, "auc_bid", {}); ok(!r.ok, "после конца ставки не принимаются");
  r = await call(P, "title_buy", { k: "magnate" }); ok(r.ok && r.S.titles.includes("magnate") && r.S.cash === 1e6 && r.S.ttl && r.S.ttl[P] === "magnate", "титул «Магнат» куплен за $1 000 000");
  r = await call(P, "title_buy", { k: "oligarch" }); ok(!r.ok, "на «Олигарха» денег не хватает");
  r = await call(P, "title_set", { k: "" }); ok(r.ok && !(r.S.ttl || {})[P], "титул можно скрыть"); }
/* --- дыра в крафте закрыта --- */
{ const U = 7101; await call(U, "sync");
  const ins = db.prepare("INSERT INTO cards(owner,h,f,no,sn,nice,hue,v,stats,xp,wins,stars,created,part) VALUES(?,?,0,?,?,0,0,?,'[300,300,300,300,300]',0,0,0,0,0)");
  for (let i = 0; i < 6; i++) ins.run(U, 20, 2000000 + i, "71010" + i, 500);
  let s = await call(U, "sync"); const ids = s.S.cards.filter(c => c.h === 20).map(c => c.id);
  let r = await call(U, "craft", { ids: ids.slice(0, 3), h: 1, f: 4 }); ok(!r.ok && /нельзя скрафтить/.test(r.err), "«Ошибку печати» скрафтить нельзя");
  let got = null; for (let k = 0; k < 6 && !got; k++) { s = await call(U, "sync"); const one = s.S.cards.find(c => c.h === 20); if (!one) break; r = await call(U, "craft", { ids: [one.id], h: 1, f: 2 }); if (r.ok && r.res.win) got = r.res.card; }
  ok(!got || (got.v >= 30 * .9 - .01 && got.v <= 30 * 1.1 + .01), "скрафченная карточка стоит около цены цели (" + (got && got.v) + ")");
  { for (let i = 0; i < 4; i++) ins.run(U, 20, 2100000 + i, "71011" + i, 100000);
    s = await call(U, "sync"); const big = s.S.cards.filter(c => c.h === 20 && c.v >= 100000).map(c => c.id);
    r = await call(U, "craft", { ids: big.slice(0, 1), h: 30, f: 0 }); ok(r.ok && Math.abs(r.res.p - .1) < 1e-9, "мифа скрафтить максимум с шансом 10% (" + (r.res && r.res.p) + ")");
    r = await call(U, "craft", { ids: big.slice(1, 2), h: 27, f: 0 }); ok(r.ok && Math.abs(r.res.p - .3) < 1e-9, "легендарного — максимум 30%");
    if (r.res.win) ok(r.res.card && r.res.card.h === 27, "скрафченная легендарная выдана");
    const feed = await call(U, "top", { kind: "feed" }); ok(feed.ok, "лента открывается"); }
  r = await call(U, "merge", { h: 1, f: 3 }); ok(!r.ok && /Ошибку печати/.test(r.err), "из золотых «Ошибку печати» не слить"); }

/* --- подарки, витрина, казино, голем --- */
{ const envP = { ...env, PAY_SIM: "1" };
  const cp = async (uid, a, p = {}) => (await worker.fetch(new Request("https://x/api", { method: "POST", headers: { "Content-Type": "application/json", "X-Dev-User": String(uid) }, body: JSON.stringify({ a, p }) }), envP)).json();
  const buy = async (uid, p) => { const i = await cp(uid, "invoice", p); if (!i.ok) return i; return cp(uid, "pay_sim", { pid: i.res.pid }); };
  const A = 8101, B = 8102; await call(A, "sync"); await call(B, "sync");
  let r = await buy(A, { item: "gift", k: "crown" }); ok(r.ok && r.res.status === "done" && r.res.res.gift.no === 1 && r.S.gifts.length === 1, "купил Корону Эпох за звёзды: № 1");
  r = await buy(B, { item: "gift", k: "crown" }); ok(r.res.res.gift.no === 2, "следующая корона — № 2");
  db.prepare("INSERT INTO gifts(owner,k,no,created) SELECT -5,'helm',value,0 FROM (WITH RECURSIVE n(value) AS (SELECT 1 UNION ALL SELECT value+1 FROM n WHERE value<5000) SELECT value FROM n)").run();
  r = await cp(A, "invoice", { item: "gift", k: "helm" }); ok(!r.ok && /закончился/.test(r.err), "тираж закончился — купить нельзя");
  const gid = (await call(A, "sync")).S.gifts[0].id;
  r = await call(A, "gift_shelf", { id: gid, slot: 3 }); ok(r.ok && r.S.gifts[0].shelf === 3, "подарок встал на 3-ю полку");
  r = await call(B, "profile", { uid: A }); ok(r.ok && r.res.shelf.length === 1 && r.res.gval === 250 && r.res.gv === 1 && r.res.grank >= 1, "чужая витрина: подарок, стоимость, просмотры, место в топе");
  r = await call(A, "gift_send", { id: gid, to: A }); ok(!r.ok, "себе подарить нельзя");
  r = await call(B, "gift_send", { id: gid, to: A }); ok(!r.ok, "чужой подарок не подарить");
  r = await call(A, "gift_send", { id: gid, to: B }); ok(r.ok && !r.S.gifts.length, "подарил другу");
  r = await call(B, "sync"); ok(r.S.gifts.length === 2 && r.S.gifts.some(g => g.id === gid && g.shelf === 0 && g.from_uid === A), "друг получил подарок");
  r = await call(A, "sync"); ok(r.S.termsV === 0, "соглашение ещё не принято");
  r = await call(A, "terms_ok", { v: 1 }); ok(r.ok && r.S.termsV === 1 && db.prepare("SELECT terms_at FROM users WHERE id=?").get(A).terms_at > 0, "соглашение принято и записано с датой");
  r = await call(A, "gift_top"); ok(r.ok && r.res.top[0].uid === B && r.res.left.crown === 98, "топ витрин и остаток тиража");
  r = await buy(A, { item: "gift", k: "cup" }); ok(r.ok && r.res.res.gift.k === "cup", "подарок из кейса теперь можно купить и за звёзды");
  r = await buy(A, { item: "gift", k: "crown_x" }); ok(r.ok && r.res.res.gift.no === 1, "ошибка печати: Корона № 1 из 10");
  // казино
  const setRunes = (uid, n) => { const u = db.prepare("SELECT state FROM users WHERE id=?").get(uid); const st = JSON.parse(u.state); st.camp = st.camp || { en: 0, at: Date.now(), lv: { pw: 0, en: 0, rg: 0, cr: 0, sq: 0 }, t: 0, hp: 100, kills: 0, total: 0, sqAt: Date.now() }; st.camp.runes = n; db.prepare("UPDATE users SET state=? WHERE id=?").run(JSON.stringify(st), uid); };
  setRunes(A, 49999); r = await call(A, "cas_case"); ok(!r.ok && /Не хватает/.test(r.err), "кейс за 50 000 рун: без рун не открыть");
  setRunes(A, 2e6); let gifts = 0, runes = 0;
  for (let i = 0; i < 10; i++) { r = await call(A, "cas_case"); if (!r.ok) { ok(false, "кейс: " + r.err); break } if (r.res.g) gifts++; else runes += r.res.r; }
  ok(r.ok && (gifts + runes / 3e4 >= 10 || runes > 0), "10 кейсов открыто (подарков: " + gifts + ")");
  r = await call(A, "cas_case"); ok(!r.ok && /10 кейсов/.test(r.err), "не больше 10 кейсов в день");
  r = await call(A, "cas_comp"); ok(!r.ok, "компенсацию напрямую не вызвать");
  r = await call(A, "cas_slot", { bet: 500 }); ok(!r.ok && /Ставка от/.test(r.err), "слоты: ставка от 1 000");
  const s0 = (await call(A, "sync")).S.camp.runes; r = await call(A, "cas_slot", { bet: 1000 });
  ok(r.ok && r.res.reels.length === 3 && Math.abs(r.S.camp.runes - (s0 - 1000 + r.res.win)) < 1, "слоты: ставка списана, выигрыш начислен (×" + r.res.m + ")");
  r = await call(A, "cas_hl_go", { bet: 1000 }); ok(r.ok && r.res.hl.c >= 1 && r.res.hl.c <= 13, "больше/меньше: первая карта");
  r = await call(A, "cas_hl_take"); ok(!r.ok, "забрать можно только после угаданной карты");
  const c = r.ok ? 0 : (await call(A, "sync")).S.cas.hl.c; r = await call(A, "cas_hl", { dir: c >= 7 ? "down" : "up" }); ok(r.ok && (r.res.win ? r.res.hl.m > 1 : !r.res.hl), "больше/меньше: ход");
  // голем
  r = await buy(A, { item: "golem" }); ok(r.ok && r.res.status === "done" && r.S.golemUntil > Date.now() + 6 * 864e5, "голем на неделю куплен");
  r = await call(A, "camp_tap", { n: 1 }); ok(r.ok && r.S.camp.gm === 1, "с големом энергии в 2 раза больше");
}
console.log(fails ? `\nОшибок: ${fails}` : "\nВсё работает");
process.exit(fails ? 1 : 0);
