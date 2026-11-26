// Тест конкурса TikTok 27–28.11: заявка, ссылка, авторозыгрыш 2–3 мест, выдача именной карты.
// Запуск: python tools/build_worker.py && node server/contest-test.mjs
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

const realNow = Date.now; let T = Date.UTC(2026, 10, 27, 3, 0); Date.now = () => T;
const ADM = 6724818967, P = [73001, 73002, 73003, 73004];
for (const u of [ADM, ...P]) await call(u, "sync");
let g = await call(P[0], "ttk_get");
ok(g.ok && g.res.start === Date.UTC(2026, 10, 27, 4, 0) && g.res.end === Date.UTC(2026, 10, 28, 19, 0), "сроки: 27.11 07:00 – 28.11 22:00 МСК", g);
ok(!(await call(P[0], "ttk_join", { tt: "lev_epoh" })).ok, "до старта заявки не принимаются");
T = Date.UTC(2026, 10, 27, 6, 0);
ok(!(await call(P[0], "ttk_url", { url: "https://www.tiktok.com/@x/video/1" })).ok, "ссылку меняет только админ");
ok(!(await call(ADM, "ttk_url", { url: "https://evil.example/v" })).ok, "чужие ссылки не принимаются");
ok((await call(ADM, "ttk_url", { url: "https://www.tiktok.com/@voinyepoh/video/123" })).ok, "админ сохранил ссылку на видео");
ok(!(await call(P[0], "ttk_join", { tt: "лев" })).ok, "ник TikTok только латиницей");
for (const [i, u] of P.entries()) ok((await call(u, "ttk_join", { tt: "player_" + i, tg: "tg_user" + i })).ok, "участник " + (i + 1) + " записан");
ok(!(await call(P[1], "ttk_join", { tt: "PLAYER_0" })).ok, "чужой ник TikTok занять нельзя");
g = await call(P[0], "ttk_get");
ok(g.res.n === 4 && g.res.me.tt === "player_0" && g.res.url.includes("tiktok.com") && !g.res.list, "игрок видит своё участие, ссылку и счётчик, список — нет", g.res);
const ga = await call(ADM, "ttk_get");
ok(ga.res.list && ga.res.list.length === 4, "админ видит список участников");
ok(!(await call(ADM, "ttk_first", { tt: "player_0" })).ok, "победителя нельзя выбрать до 22:00 28.11");
T = Date.UTC(2026, 10, 28, 19, 1);
ok(!(await call(P[3], "ttk_join", { tt: "late_one" })).ok, "после 22:00 заявки закрыты");
await worker.tick(env);
const res = JSON.parse(db.prepare("SELECT v FROM kv WHERE k='ttk1:res'").get().v);
ok(res.w2 && res.w3 && res.w2.uid !== res.w3.uid, "в 22:00 бот сам разыграл 2-е и 3-е места", res);
ok(db.prepare("SELECT COUNT(*) n FROM kn_items WHERE owner=? AND set_id='flag'").get(res.w2.uid).n === 6, "2-е место: полный сет «Знаменосец» в арсенале");
const st3 = JSON.parse(db.prepare("SELECT state FROM users WHERE id=?").get(res.w3.uid).state);
ok((st3.titles || []).includes("legend") && (st3.frames || []).includes("legend"), "3-е место: титул и рамка «Легенда»");
await worker.tick(env);
ok(db.prepare("SELECT COUNT(*) n FROM kn_items WHERE set_id='flag'").get().n === 6, "повторный тик призы не дублирует");
const first = P.find(u => u !== res.w2.uid && u !== res.w3.uid), ftt = "player_" + P.indexOf(first);
if (res.w2) ok(!(await call(ADM, "ttk_first", { tt: "player_" + P.indexOf(res.w2.uid) })).ok, "призёру 2-го места 1-е не выдать");
const w1 = await call(ADM, "ttk_first", { tt: "@" + ftt.toUpperCase() });
ok(w1.ok && w1.res.res.w1, "админ выдал 1-е место по нику TikTok", w1);
const nc = db.prepare("SELECT h,nick,frame FROM cards WHERE owner=? AND how='ttk_named'").all(first);
ok(nc.length === 1 && nc[0].nick === "@tg_user" + P.indexOf(first) && nc[0].frame === "legend", "именная карта: ник победителя и рамка «Легенда»", nc);
ok(!(await call(ADM, "ttk_first", { tt: ftt })).ok, "1-е место выдаётся один раз");
const sy = await call(first, "sync");
const mine = (sy.S || sy.res || {}).cards || [];
ok(mine.some(c => c.nick === "@tg_user" + P.indexOf(first)), "ник приходит игроку вместе с картой", mine.map(c => c.nick).filter(Boolean));
Date.now = realNow;
if (process.exitCode) console.log("\n❌ ПРОВЕРКА КОНКУРСА НЕ ПРОЙДЕНА"); else console.log("\n✅ КОНКУРС TIKTOK РАБОТАЕТ: заявки, ссылка, авторозыгрыш, именная карта");
