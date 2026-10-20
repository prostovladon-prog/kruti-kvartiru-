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
r = await call(1, "sync"); ok(r.S.spins === sp0 + 10 && r.S.refs === 2, "2 новых друга по ссылке: +10 прокруток, повторный вход и сам себя не считаются (" + (r.S.spins - sp0) + ")");
r = await call(1, "open"); ok(r.ok && r.S.spins === sp0 + 9, "прокрутки за друзей тратятся как обычные");
r = await call(1, "sub_check"); ok(r.ok && r.res.r === 5, "подписка на канал: +5 прокруток");
r = await call(1, "sub_check"); ok(!r.ok, "за подписку награда только один раз");
r = await call(1, "sub_reward"); ok(!r.ok, "награду за подписку нельзя получить в обход проверки");

console.log(fails ? `\nОшибок: ${fails}` : "\nВсё работает");
process.exit(fails ? 1 : 0);
