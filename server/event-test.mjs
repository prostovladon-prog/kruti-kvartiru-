// Серверные тесты ивента «Поколение Эпох» на встроенном SQLite.
// Запуск: python tools/build_worker.py && node server/event-test.mjs
import { DatabaseSync } from "node:sqlite";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const dir = path.dirname(fileURLToPath(import.meta.url));
const worker = (await import("data:text/javascript;base64," + Buffer.from(readFileSync(path.join(dir, "worker.js"))).toString("base64"))).default;

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
const env = { DB, DEV: "1", TEST: "1", BOT_TOKEN: "123:TEST", NO_RARE: "1" };
db.exec("CREATE TABLE IF NOT EXISTS kv (k TEXT PRIMARY KEY, v TEXT)");
db.prepare("INSERT OR REPLACE INTO kv(k,v) VALUES('chal',?)").run(JSON.stringify({ id: "off", start: 0, end: 0, prizes: [], slots: [] }));

const call = async (uid, a, p = {}) => {
  const r = await worker.fetch(new Request("https://x/api", { method: "POST", headers: { "Content-Type": "application/json", "X-Dev-User": String(uid) }, body: JSON.stringify({ a, p }) }), env);
  return r.json();
};

const ADMIN = 6724818967, PL = 1001;
const realNow = Date.now;
Date.now = () => Date.UTC(2026, 10, 24, 4, 59);
let fails = 0;
const ok = (cond, msg, extra) => { console.log((cond ? "✓ " : "✗ ") + msg + (cond || !extra ? "" : " → " + JSON.stringify(extra))); if (!cond) fails++; };
const sec = t => console.log("\n" + t);

await call(ADMIN, "sync");
await call(PL, "sync");

/* 1. Гейт по времени */
sec("1. Открытие в 08:00");
{
  const s = await call(PL, "ev_state");
  ok(s.ok && s.res && s.res.open === false, "до старта ивент закрыт", s.res && s.res.open);
  const c = await call(PL, "ev_contrib", { coins: 1000 });
  ok(!c.ok && /не открыт/i.test(c.err || ""), "вклад до старта запрещён", c.err);
  const clock = Date.now;
  Date.now = () => Date.UTC(2026, 10, 25, 5) + 1000;
  const marchLocked = await call(PL, "ev_hit", { n: 1, cards: [1] });
  Date.now = clock;
  ok(!marchLocked.ok && /стройк/i.test(marchLocked.err || ""),
    "Поход закрыт, пока игрок не завершил все сегменты Стройки", marchLocked.err);
  for (const [seg, points] of [1500, 2000, 2500, 2750].entries())
    db.prepare("INSERT OR REPLACE INTO ev_seg(season,key,seg,points,given,day) VALUES(?,?,?,?,0,0)")
      .run("epoch-2026-11-25", "u" + PL, seg, points);
  Date.now = () => Date.UTC(2026, 10, 25, 5) + 1000;
  const wrongOrder = await call(PL, "ev_hit", { n: 2, cards: [1] });
  Date.now = clock;
  ok(!wrongOrder.ok && /узел 1/i.test(wrongOrder.err || ""),
    "нельзя пропустить узел и сразу бить следующий", wrongOrder.err);
  const a = await call(ADMIN, "ev_state");
  ok(a.ok && a.res.admin === true && a.res.open === true, "админ видит тест-режим до старта", a.res && { open: a.res.open, admin: a.res.admin });
}

/* 2. Стройка: вклад и потолки */
sec("2. Стройка и лимиты");
db.prepare("UPDATE users SET cash=5000000, state=json_set(COALESCE(state,'{}'),'$.gsh.f',40,'$.gsh.w',40) WHERE id=?").run(ADMIN);
{
  const r1 = await call(ADMIN, "ev_contrib", { coins: 300000 });
  ok(r1.ok && r1.res.added === 300, "300 000 монет = 300 очков", r1.res);
  const r2 = await call(ADMIN, "ev_contrib", { shards: 30 });
  ok(r2.ok && r2.res.added === 750, "30 осколков = 750 очков", r2.res);
  const r3 = await call(ADMIN, "ev_contrib", { coins: 5000000 });
  ok(r3.ok && r3.res.added === 300, "монеты добирают остаток источника (300)", r3.res);
  const r4 = await call(ADMIN, "ev_contrib", { shards: 10 });
  ok(r4.ok && r4.res.added === 150, "осколки добивают до 1500", r4.res);
  const r5 = await call(ADMIN, "ev_contrib", { coins: 1000000 });
  ok(!r5.ok && /лимит/i.test(r5.err || ""), "сверх 1500 не принимает", r5.err);
}

/* 3. Поход */
sec("3. Поход: урон и защита");
await call(ADMIN, "ev_admin", { op: "reset" });
db.prepare("UPDATE users SET state=json_set(COALESCE(state,'{}'),'$.spins',20) WHERE id=?").run(ADMIN);
let cards = [];
for (let i = 0; i < 4; i++) { const o = await call(ADMIN, "open"); if (o.res && o.res.card) cards.push(o.res.card.id); }
{
  ok(cards.length >= 3, "админ открыл карточки для отряда", cards.length);
  const h1 = await call(ADMIN, "ev_hit", { n: 1, cards: cards.slice(0, 3) });
  ok(h1.ok && h1.res.dmg > 0, "удар по узлу наносит урон", h1.res);
  const h2 = await call(ADMIN, "ev_hit", { n: 1, cards: cards.slice(0, 3) });
  ok(h2.ok && h2.res.dmg <= h1.res.dmg, "повторный удар не больше первого", h2.res);
  const bad = await call(ADMIN, "ev_hit", { n: 1, cards: ["nope"] });
  ok(!bad.ok, "чужие/несуществующие карты отклонены", bad.err);
  const badNode = await call(ADMIN, "ev_hit", { n: 99, cards: cards.slice(0, 3) });
  ok(!badNode.ok, "несуществующий узел отклонён", badNode.err);
}

/* 4. Награды */
sec("4. Награды и идемпотентность");
{
  await call(ADMIN, "ev_admin", { op: "close", n: 3 });
  const c1 = await call(ADMIN, "ev_claim", { n: 3 });
  ok(c1.ok && c1.res.reward === "chest" && c1.res.cash > 0, "узел 3 выдаёт сундук", c1.res);
  const c2 = await call(ADMIN, "ev_claim", { n: 3 });
  ok(!c2.ok && /уже получена/i.test(c2.err || ""), "повторно награду не выдать", c2.err);
  const c3 = await call(ADMIN, "ev_claim", { n: 1 });
  ok(!c3.ok && /не закрыт|награды нет/i.test(c3.err || ""), "узел без награды отклонён", c3.err);
  await call(ADMIN, "ev_admin", { op: "close", n: 4 });
  const random = Math.random;
  let firstRandom = true;
  Math.random = () => { if (firstRandom) { firstRandom = false; return 0; } return random(); };
  const c4 = await call(ADMIN, "ev_claim", { n: 4 });
  Math.random = random;
  ok(c4.ok && c4.res.chest === "general" && /Карты \(4\)/.test(c4.res.loot || ""),
    "при сундуке узла 4 сервер возвращает список реально выпавших карт", c4.err || c4.res);
}

/* 5. Магазин */
sec("5. Магазин за ⭐");
db.prepare("UPDATE users SET star_bal=0 WHERE id=?").run(ADMIN);
{
  const poor = await call(ADMIN, "ev_shop", { item: "pass" });
  ok(!poor.ok && /звёзд/i.test(poor.err || ""), "без звёзд пасс не купить", poor.err);

  db.prepare("UPDATE users SET star_bal=12000 WHERE id=?").run(ADMIN);
  const p1 = await call(ADMIN, "ev_shop", { item: "pass" });
  ok(p1.ok && p1.res.stars === 599, "пасс куплен за 599", p1.res);
  const p2 = await call(ADMIN, "ev_shop", { item: "pass" });
  ok(!p2.ok && /уже куплен/i.test(p2.err || ""), "пасс дважды нельзя", p2.err);

  const st = await call(ADMIN, "ev_state");
  ok(st.res.me.cap === 1700, "пасс поднял лимит до 1700", st.res.me.cap);
  ok(p1.res.bonus === 200 && p1.res.points === undefined, "пасс даёт только +200 к дневному лимиту, без обхода лимитов очков", p1.res);

  const ch1 = await call(ADMIN, "ev_shop", { item: "chest" });
  ok(ch1.ok && ch1.res.points > 0, "сундук вклада даёт очки", ch1.res);
  const ch2 = await call(ADMIN, "ev_shop", { item: "chest" });
  ok(ch2.ok, "второй сундук в день можно", ch2.res);
  const ch3 = await call(ADMIN, "ev_shop", { item: "chest" });
  ok(!ch3.ok && /двух|лимит/i.test(ch3.err || ""), "третий сундук в день нельзя", ch3.err);
  const testDay = new Date(Date.now() + 3 * 3600e3).toISOString().slice(0, 10);
  db.prepare("UPDATE ev_shop SET qty=0,day=? WHERE season=? AND uid=? AND item='chest'")
    .run(testDay, "epoch-2026-11-25", ADMIN);
  db.prepare("UPDATE ev_contrib SET used=1700,stars_used=0 WHERE season=? AND uid=? AND day=?")
    .run("epoch-2026-11-25", ADMIN, testDay);
  const personalCap = await call(ADMIN, "ev_shop", { item: "chest" });
  ok(!personalCap.ok && /личного вклада/i.test(personalCap.err || ""),
    "покупка сундука не обходит личный дневной лимит", personalCap.err);
  db.prepare("UPDATE ev_contrib SET used=0,stars_used=500 WHERE season=? AND uid=? AND day=?")
    .run("epoch-2026-11-25", ADMIN, testDay);
  const starCap = await call(ADMIN, "ev_shop", { item: "chest" });
  ok(!starCap.ok && /звёздн/i.test(starCap.err || ""),
    "покупка сундука не обходит дневной лимит очков за ⭐", starCap.err);

  const card1 = await call(ADMIN, "ev_shop", { item: "card" });
  ok(card1.ok, "карта серии куплена за 2500", card1.res);
  const card2 = await call(ADMIN, "ev_shop", { item: "card" });
  ok(!card2.ok && /уже куплено/i.test(card2.err || ""), "карта серии одна на аккаунт", card2.err);

  const nm1 = await call(ADMIN, "ev_shop", { item: "named" });
  ok(nm1.ok, "Именной Врат куплен за 5000", nm1.res);
  const namedState = await call(ADMIN, "ev_state");
  ok(namedState.res.namedGates.some(x => x.uid === ADMIN),
    "купленное имя Врат отображается в состоянии ивента", namedState.res.namedGates);
  const nm2 = await call(ADMIN, "ev_shop", { item: "named" });
  ok(!nm2.ok, "Именной Врат один раз", nm2.err);

  const cl = await call(ADMIN, "ev_shop", { item: "clanpass" });
  ok(!cl.ok && /клан/i.test(cl.err || ""), "без клана клановый пасс нельзя", cl.err);
}

/* 6. Кривой ввод */
sec("6. Защита от кривого ввода");
{
  const neg = await call(ADMIN, "ev_contrib", { coins: -100 });
  ok(!neg.ok, "отрицательный вклад отклонён", neg.err);
  const zero = await call(ADMIN, "ev_contrib", { coins: 0, shards: 0 });
  ok(!zero.ok, "пустой вклад отклонён", zero.err);
  const badItem = await call(ADMIN, "ev_shop", { item: "hack" });
  ok(!badItem.ok, "несуществующий товар отклонён", badItem.err);
}

/* 7. Клановый лимит, приглашение и награды за сегменты */
sec("7. Клан: динамический лимит, приглашение и награды сегментов");
{
  const clan = 777, donor = 8100, invitee = 8200, season = "epoch-2026-11-25";
  const day = new Date(Date.now() + 3 * 3600e3).toISOString().slice(0, 10);
  db.prepare("INSERT INTO clans(id,name,name_key,owner,h,created) VALUES(?,?,?,?,?,?)")
    .run(clan, "Тестовый клан", "event_test_clan", ADMIN, 1, Date.now());
  for (let uid = 8100; uid < 8128; uid++) await call(uid, "sync");
  await call(invitee, "sync");
  db.prepare("UPDATE users SET clan=?,seen=? WHERE id=?").run(clan, Date.now(), ADMIN);
  for (let uid = 8100; uid < 8128; uid++)
    db.prepare("UPDATE users SET clan=?,seen=? WHERE id=?").run(clan, Date.now(), uid);
  db.prepare("UPDATE users SET created=?,seen=? WHERE id=?")
    .run(Date.UTC(2026, 10, 25, 5) + 1000, Date.now(), invitee);

  const joined = await call(invitee, "clan_join", { id: clan, inviter: ADMIN });
  const friend = db.prepare("SELECT clan,ref FROM users WHERE id=?").get(invitee);
  ok(joined.ok && friend.clan === clan && friend.ref === ADMIN,
    "приглашённый вступает по id клана вне топа и сохраняется пригласивший", friend);
  db.prepare("UPDATE users SET star_bal=6000 WHERE id=?").run(ADMIN);
  const clanPass = await call(ADMIN, "ev_shop", { item: "clanpass" });
  const friendPass = await call(invitee, "ev_state");
  ok(clanPass.ok && friendPass.res.me.hasPass && friendPass.res.me.cap === 1700,
    "клановый пасс включает +200 лимита всем, не начисляя отдельные очки", friendPass.res && friendPass.res.me);

  db.prepare("DELETE FROM ev_contrib WHERE season=?").run(season);
  db.prepare("DELETE FROM ev_seg WHERE season=?").run(season);
  db.prepare("DELETE FROM ev_seg_contrib WHERE season=?").run(season);
  db.prepare("UPDATE users SET cash=5000000 WHERE id=?").run(ADMIN);
  db.prepare("INSERT INTO ev_seg(season,key,seg,points,given,day) VALUES(?,?,?,?,?,?)")
    .run(season, "c" + clan, 0, 17900, 17900, day);
  db.prepare("INSERT INTO ev_seg_contrib(season,key,seg,uid,points) VALUES(?,?,?,?,?)")
    .run(season, "c" + clan, 0, donor, 500);

  const finish = await call(ADMIN, "ev_contrib", { coins: 100000 });
  const clanState = await call(ADMIN, "ev_state");
  ok(finish.ok && finish.res.added === 100 && clanState.res.clanCap === 45000 &&
    clanState.res.segs[0].points === 18000, "клан из 30 активных не упирается в старый лимит 6000", clanState.res && {
      added: finish.res && finish.res.added, cap: clanState.res.clanCap, points: clanState.res.segs[0].points,
    });

  const seasonKey = "evfirst:" + season + ":seg0";
  const donorState = JSON.parse(db.prepare("SELECT state FROM users WHERE id=?").get(donor).state || "{}");
  const adminState = JSON.parse(db.prepare("SELECT state FROM users WHERE id=?").get(ADMIN).state || "{}");
  ok((donorState.pays || []).includes("evseg:" + season + ":c" + clan + ":0:" + donor) &&
    (adminState.pays || []).includes("evseg:" + season + ":c" + clan + ":0:" + ADMIN),
    "обычный сундук получают и прежние участники сегмента, и тот, кто его закрыл");
  ok((donorState.pays || []).includes(seasonKey + ":" + donor) &&
    (adminState.pays || []).includes(seasonKey + ":" + ADMIN),
    "легендарный приз первого клана получает каждый вкладчик закрытого сегмента");

  for (const [seg, need] of [[1, 24000], [2, 30000], [3, 32900]]) {
    db.prepare("INSERT INTO ev_seg(season,key,seg,points,given,day) VALUES(?,?,?,?,?,?)")
      .run(season, "c" + clan, seg, need, 0, day);
    db.prepare("INSERT INTO ev_seg_contrib(season,key,seg,uid,points) VALUES(?,?,?,?,?)")
      .run(season, "c" + clan, seg, donor, 100);
  }
  const last = await call(ADMIN, "ev_contrib", { coins: 100000 });
  const finalDonor = JSON.parse(db.prepare("SELECT state FROM users WHERE id=?").get(donor).state || "{}");
  ok(last.ok && (finalDonor.pays || []).includes("evfirst:" + season + ":done:" + donor),
    "первый клан, закрывший четыре сегмента, получает обещанный мифический сундук");
}

Date.now = realNow;
console.log(`\n${fails === 0 ? "✅ ИВЕНТ РАБОТАЕТ" : "❌ ЕСТЬ ОШИБКИ"}: провалов ${fails}`);
process.exit(fails ? 1 : 0);
