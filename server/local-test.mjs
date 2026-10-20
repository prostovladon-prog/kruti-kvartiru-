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
const env = { DB, DEV: "1", TEST: "1", BOT_TOKEN: "123:TEST" };

async function call(uid, a, p = {}, start = "") {
  const r = await worker.fetch(new Request("https://x/api", { method: "POST", headers: { "Content-Type": "application/json", "X-Dev-User": String(uid), "X-Dev-Start": start }, body: JSON.stringify({ a, p }) }), env);
  return r.json();
}
const { classify } = await import("data:text/javascript;base64," + Buffer.from(readFileSync(path.join(dir, "..", "rules.js"), "utf8") + "\nexport { classify };").toString("base64"));
let fails = 0;
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
  r = await call(2, "sync"); const c2 = r.S.cards.find(c => !c.listed && !c.away);
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
  r = await call(1, "sync"); const anyMine = r.S.cards.find(c => !c.listed && !c.away);
  r = await call(1, "fduel", { oppId: fc.id, oppStat: 1, myId: anyMine.id, myStat: 0 }); ok(!r.ok, "против «Основателя» по ссылке тоже нельзя");
  await call(7000, "open"); r = await call(7000, "sync"); r = await call(7000, "craft", { ids: [r.S.cards.find(c => c.f !== 5).id], h: 0, f: 5 }); ok(!r.ok, "«Основателя» нельзя скрафтить");
}

/* --- история --- */
r = await call(1, "sync"); const sp1 = r.S.spins;
r = await call(1, "story"); ok(r.ok && r.S.spins === sp1 + 10, "история: +10 прокруток");
r = await call(1, "story"); ok(!r.ok && /неделе/.test(r.err), "история: второй раз на неделе нельзя");

/* --- закалка звёздами --- */
r = await call(1, "sync"); let fc = r.S.cards.find(c => !c.listed && !c.away && !c.xp);
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
  db.prepare("INSERT INTO cards(owner,h,f,no,sn,nice,hue,v,stats,created) VALUES(7,0,4,1,'314159',0,0,100,'[1,1,1,1,1]',0)").run();
  const mis = db.prepare("SELECT id FROM cards WHERE h=0 AND f=4").get().id;
  r = await call(7, "sell", { id: mis }); ok(r.ok && !db.prepare("SELECT 1 FROM cards WHERE id=?").get(mis), "проданная карточка удалена из игры");
  ok(!db.prepare("SELECT 1 FROM cards WHERE sn='314159'").get(), "её номер 314 159 снова свободен");
  // золотые: тираж 10 выпущен целиком, одну продали — следующая получит её место
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
  r = await call8("luck_set", { on: 0 }); ok(r.ok && !r.res.on, "режим удачи выключен");
  r = await call8("stats"); const T = r.res;
  ok(r.ok && T.players >= 8 && T.newToday >= 8 && T.activeToday >= 3 && T.today.open >= 4 && T.fromRef >= 3 && T.days.length === 14, "статистика: игроков " + T.players + ", новых сегодня " + T.newToday + ", активных " + T.activeToday + ", прокруток " + T.today.open + ", по приглашению " + T.fromRef);
  ok(T.inviters[0] && T.inviters[0].refs >= 2, "лучший пригласивший: " + (T.inviters[0] && T.inviters[0].name + " — " + T.inviters[0].refs));
  // возврат на второй день: игрок пришёл «вчера» и зашёл сегодня
  db.prepare("UPDATE users SET created=?, seen=?, d1=0 WHERE id=7").run(Date.now() - 864e5, Date.now() - 864e5);
  await call(7, "sync"); ok(db.prepare("SELECT d1 FROM users WHERE id=7").get().d1 === 1, "вернувшийся на второй день отмечен");
}

console.log(fails ? `\nОшибок: ${fails}` : "\nВсё работает");
process.exit(fails ? 1 : 0);
