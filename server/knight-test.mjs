// Тест рыцаря (этап 1): кузня, тиражи, сталь, переплавка, надеть, ключи за карты. Карты не затрагиваются.
// Запуск: python tools/build_worker.py && node server/knight-test.mjs
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
db.prepare("INSERT OR REPLACE INTO kv(k,v) VALUES('chal',?)").run(JSON.stringify({ id: "off", start: 0, end: 0, prizes: [], slots: [] }));
const call = async (uid, action, p = {}) => (await worker.fetch(new Request("https://x/api", {
  method: "POST", headers: { "Content-Type": "application/json", "X-Dev-User": String(uid) }, body: JSON.stringify({ a: action, p }) }), env)).json();
const ok = (c, m, x) => { console.log((c ? "✓ " : "✗ ") + m + (c || x == null ? "" : " → " + JSON.stringify(x).slice(0, 300))); if (!c) process.exitCode = 1; };
const A = 72001, B = 72002;
await call(A, "sync"); await call(B, "sync");

let g = await call(A, "kn_get");
ok(g.ok && g.res.keys === 10 && g.res.items.length === 6 && Object.keys(g.res.eq).length === 6 && g.res.pow > 0, "новый рыцарь: 10 ключей и надетый Бронзовый век", g);
g = await call(A, "kn_get");
ok(g.res.items.length === 6, "стартовый сет выдаётся один раз");

const f10 = await call(A, "kn_forge", { n: 10 });
ok(f10.ok && f10.res.got.length === 10 && f10.res.keys === 0 && f10.res.items.length === 16, "кузня ×10 тратит 10 ключей и даёт 10 частей", f10);
const f0 = await call(A, "kn_forge", { n: 1 });
ok(!f0.ok && /ключ/.test(f0.err), "без ключей кузня не работает");
const dup = db.prepare("SELECT set_id,slot,forge,no,COUNT(*) n FROM kn_items GROUP BY 1,2,3,4 HAVING n>1").all();
ok(dup.length === 0, "номера частей уникальны");

db.prepare("UPDATE kn_users SET keys=1 WHERE uid=?").run(A);
const par = await Promise.all([call(A, "kn_forge", { n: 1 }), call(A, "kn_forge", { n: 1 })]);
ok(par.filter(r => r.ok).length === 1, "один ключ нельзя потратить дважды одновременно", par.map(r => r.err));

// надеть: своё можно, чужое нельзя
const bItem = (await call(B, "kn_get")).res.items[0];
const steal = await call(A, "kn_equip", { id: bItem.id });
ok(!steal.ok, "чужую часть надеть нельзя");
const mine = db.prepare("SELECT * FROM kn_items WHERE owner=? AND set_id!='bronze' LIMIT 1").get(A);
const eqr = await call(A, "kn_equip", { id: mine.id });
ok(eqr.ok && eqr.res.eq[mine.slot] === mine.id, "своя часть надевается", eqr);

// разобрать: надетую нельзя, ненадетую — в сталь
const worn = eqr.res.eq[0];
ok(!(await call(A, "kn_scrap", { ids: [worn] })).ok, "надетую часть разобрать нельзя");
const free = eqr.res.items.filter(i => !Object.values(eqr.res.eq).includes(i.id) && i.forge < 4).slice(0, 3).map(i => i.id);
const sc = await call(A, "kn_scrap", { ids: free });
ok(sc.ok && sc.res.steel > 0 && db.prepare("SELECT COUNT(*) n FROM kn_items WHERE id IN (" + free.join(",") + ")").get().n === 0, "разборка даёт сталь и удаляет части", sc);

// ковка из стали
db.prepare("UPDATE kn_users SET steel=100 WHERE uid=?").run(A);
const cr = await call(A, "kn_craft", { set: "steel", slot: 2 });
ok(cr.ok && cr.res.steel === 40 && cr.res.got[0].set === "steel" && cr.res.got[0].forge === 0, "сталь → нужная часть обычной ковки", cr);
ok(!(await call(A, "kn_craft", { set: "gold", slot: 0 })).ok, "легендарное из стали не куётся");

// переплавка 3 → 1 и тираж
const ins = db.prepare("INSERT INTO kn_items(owner,set_id,slot,forge,no,q,v,created) VALUES(?,?,?,?,?,?,?,?)");
for (let i = 1; i <= 3; i++) ins.run(A, "imper", 0, 2, 90 + i, 90, 1, Date.now());
const three = db.prepare("SELECT id FROM kn_items WHERE owner=? AND set_id='imper' AND slot=0 AND forge=2").all(A).map(r => r.id);
for (let i = 1; i <= 10; i++) ins.run(B, "imper", 0, 3, i, 80, 1, Date.now());
const full = await call(A, "kn_merge", { ids: three });
ok(!full.ok && /Тираж/.test(full.err) && db.prepare("SELECT COUNT(*) n FROM kn_items WHERE id IN (" + three.join(",") + ")").get().n === 3, "тираж золотой ковки не превышается, части не пропадают", full);
db.prepare("DELETE FROM kn_items WHERE owner=? AND set_id='imper' AND forge=3 AND no=7").run(B);
const mg = await call(A, "kn_merge", { ids: three });
ok(mg.ok && mg.res.got[0].forge === 3 && mg.res.got[0].no === 7, "переплавка 3→1 даёт следующую ковку со свободным номером", mg);

// ключи за прокрутки карт, карты работают как раньше
db.prepare("UPDATE users SET state=json_set(COALESCE(state,'{}'),'$.spins',12) WHERE id=?").run(A);
db.prepare("UPDATE kn_users SET keys=0,sp=0 WHERE uid=?").run(A);
const cardsBefore = db.prepare("SELECT COUNT(*) n FROM cards WHERE owner=?").get(A).n;
let opened = 0; for (let i = 0; i < 10; i++) { const o = await call(A, "open"); if (o.ok && o.res.card) opened++; }
const ku = db.prepare("SELECT keys,sp FROM kn_users WHERE uid=?").get(A);
ok(opened === 10 && db.prepare("SELECT COUNT(*) n FROM cards WHERE owner=?").get(A).n === cardsBefore + 10, "карты открываются как обычно", { opened });
ok(ku.sp === 10 && ku.keys >= 1, "10 прокруток карт дают ключ кузни", ku);

const top = await call(A, "kn_top");
ok(top.ok && top.res.items.length >= 2 && top.res.me.place >= 1, "топ рыцарей", top);
ok(!(await call(A, "kn_admin", { op: "keys", n: 5 })).ok, "админ-операции недоступны обычному игроку");

if (process.exitCode) console.log("\n❌ ПРОВЕРКА РЫЦАРЯ НЕ ПРОЙДЕНА");
else console.log("\n✅ РЫЦАРЬ РАБОТАЕТ: кузня, тиражи, сталь, переплавка, ключи за карты");
