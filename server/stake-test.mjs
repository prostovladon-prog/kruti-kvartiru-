// Регрессионный тест боёв на карточку: при отсутствии живого соперника доступен бот-карточка.
// Запуск: python tools/build_worker.py && node server/stake-test.mjs
import { DatabaseSync } from "node:sqlite";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const dir = path.dirname(fileURLToPath(import.meta.url));
const worker = (await import("data:text/javascript;base64," +
  Buffer.from(readFileSync(path.join(dir, "worker.js"))).toString("base64"))).default;
const db = new DatabaseSync(":memory:");
db.exec(readFileSync(path.join(dir, "schema.sql"), "utf8"));

class Stmt {
  constructor(sql, args = []) { this.sql = sql; this.args = args; }
  bind(...args) { return new Stmt(this.sql, args.map(x => x === undefined ? null : typeof x === "boolean" ? +x : x)); }
  async first() { return db.prepare(this.sql).get(...this.args) ?? null; }
  async all() { return { results: db.prepare(this.sql).all(...this.args) }; }
  async run() {
    const r = db.prepare(this.sql).run(...this.args);
    return { results: [], meta: { changes: Number(r.changes) } };
  }
}
const DB = {
  prepare: sql => new Stmt(sql),
  async batch(list) {
    db.exec("BEGIN");
    try {
      const out = list.map(s => {
        if (/^\s*(select|with)/i.test(s.sql))
          return { results: db.prepare(s.sql).all(...s.args), meta: { changes: 0 } };
        const r = db.prepare(s.sql).run(...s.args);
        return { results: [], meta: { changes: Number(r.changes) } };
      });
      db.exec("COMMIT");
      return out;
    } catch (e) { db.exec("ROLLBACK"); throw e; }
  },
};
const env = { DB, DEV: "1", TEST: "1", BOT_TOKEN: "123:TEST", NO_RARE: "1" };
db.exec("CREATE TABLE IF NOT EXISTS kv (k TEXT PRIMARY KEY, v TEXT)");
db.prepare("INSERT OR REPLACE INTO kv(k,v) VALUES('chal',?)")
  .run(JSON.stringify({ id: "off", start: 0, end: 0, prizes: [], slots: [] }));

const call = async (uid, action, p = {}) => {
  const res = await worker.fetch(new Request("https://x/api", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Dev-User": String(uid) },
    body: JSON.stringify({ a: action, p }),
  }), env);
  return res.json();
};

const ok = (condition, message, extra) => {
  console.log((condition ? "✓ " : "✗ ") + message + (condition || extra == null ? "" : " → " + JSON.stringify(extra)));
  if (!condition) process.exitCode = 1;
};

const uid = 71001;
await call(uid, "sync");
db.prepare("UPDATE users SET state=json_set(COALESCE(state,'{}'),'$.spins',5) WHERE id=?").run(uid);
const opened = await call(uid, "open");
const card = opened.res?.card;
ok(!!card, "создана своя карта для проверки");

if (card) {
  const original = db.prepare("SELECT stats,v FROM cards WHERE id=? AND owner=?").get(card.id, uid);
  db.prepare("UPDATE cards SET stats=?,v=? WHERE id=? AND owner=?")
    .run(JSON.stringify([1e9, 1e9, 1e9, 1e9, 1e9]), 1e9, card.id, uid);
  const before = db.prepare("SELECT COUNT(*) AS n FROM cards WHERE owner=?").get(uid).n;
  const duel = await call(uid, "duel", { id: card.id, stat: 0, mode: 1 });
  ok(duel.ok && !duel.res.real && duel.res.opp?.h != null,
    "без живого соперника бой на карточку запускается с ботом", duel.err || duel.res);
  ok(duel.ok && duel.res.w > duel.res.l && !!duel.res.gotCard &&
    db.prepare("SELECT owner FROM cards WHERE id=?").get(duel.res.gotCard.id)?.owner === uid &&
    db.prepare("SELECT COUNT(*) AS n FROM cards WHERE owner=?").get(uid).n === before + 1,
    "победа над ботом выдаёт его карточку игроку", duel.err || duel.res);
  const stillMine = db.prepare("SELECT 1 FROM cards WHERE id=? AND owner=?").get(card.id, uid);
  if (stillMine) db.prepare("UPDATE cards SET stats=?,v=? WHERE id=? AND owner=?")
    .run(original.stats, original.v, card.id, uid);
  ok((db.prepare("SELECT stake FROM users WHERE id=?").get(uid)?.stake || 0) === 0,
    "фарм с ботом доступен без включения ставок для реальных игроков");

  await call(uid, "stake_set", { on: 1 });
  const owned = db.prepare("SELECT stats,v FROM cards WHERE id=? AND owner=?").get(card.id, uid);
  if (owned) db.prepare("UPDATE cards SET stats=?,v=? WHERE id=? AND owner=?")
    .run(JSON.stringify([1e9, 1e9, 1e9, 1e9, 1e9]), 1e9, card.id, uid);
  const beforeFallback = db.prepare("SELECT COUNT(*) AS n FROM cards WHERE owner=?").get(uid).n;
  const fallback = await call(uid, "duel", { id: card.id, stat: 0, mode: 1 });
  ok(fallback.ok && !fallback.res.real && fallback.res.opp?.h != null,
    "если ставки включены, но живого соперника нет, тоже появляется бот", fallback.err || fallback.res);
  ok(fallback.ok && fallback.res.w > fallback.res.l && !!fallback.res.gotCard &&
    db.prepare("SELECT COUNT(*) AS n FROM cards WHERE owner=?").get(uid).n === beforeFallback + 1,
    "победа над ботом после поиска живого игрока тоже выдаёт карту");
  if (owned && db.prepare("SELECT 1 FROM cards WHERE id=? AND owner=?").get(card.id, uid))
    db.prepare("UPDATE cards SET stats=?,v=? WHERE id=? AND owner=?").run(owned.stats, owned.v, card.id, uid);
}

if (process.exitCode) console.log("\n❌ ПРОВЕРКА БОЯ НА КАРТОЧКУ НЕ ПРОЙДЕНА");
else console.log("\n✅ БОЙ НА КАРТОЧКУ С БОТОМ РАБОТАЕТ");
