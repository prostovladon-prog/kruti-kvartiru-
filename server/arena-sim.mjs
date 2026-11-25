import { DatabaseSync } from "node:sqlite";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const dir = path.dirname(fileURLToPath(import.meta.url));
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
const env = { DB, DEV: "1", TEST: "1", BOT_TOKEN: "123:TEST", NO_RARE: "1", NOTIFY_TEST: "1" };
db.exec("CREATE TABLE IF NOT EXISTS kv (k TEXT PRIMARY KEY, v TEXT)");
db.prepare("INSERT OR REPLACE INTO kv(k,v) VALUES('chal',?)").run(JSON.stringify({ id: "off", start: 0, end: 0, prizes: [], slots: [] }));

let NOW = Date.UTC(2026, 10, 25, 17, 31); // 20:31 Minsk
Date.now = () => NOW;
const worker = (await import("data:text/javascript;base64," + Buffer.from(readFileSync(path.join(dir, "worker.js"))).toString("base64"))).default;

const call = async (uid, a, p = {}) => {
  const r = await worker.fetch(new Request("https://x/api", { method: "POST", headers: { "Content-Type": "application/json", "X-Dev-User": String(uid) }, body: JSON.stringify({ a, p }) }), env);
  return r.json();
};
const ok = (cond, msg, extra) => { console.log((cond ? "✓ " : "✗ ") + msg + (cond || !extra ? "" : " → " + JSON.stringify(extra))); if (!cond) process.exitCode = 1; };

const ids = Array.from({ length: 20 }, (_, i) => 5000 + i);
for (const id of ids) {
  await call(id, "sync");
  for (let k = 0; k < 3; k++) {
    db.prepare("INSERT INTO cards(owner,h,f,no,sn,hue,v,stats,xp,wins,stars,part,how,created) VALUES(?,?,?,?,?,?,?,?,0,0,0,0,'test',?)")
      .run(id, k + 1, 0, 1000 + id * 10 + k, "a" + id + "_" + k, 0, 100 + id + k * 10, JSON.stringify([20 + id % 5, 20, 20, 20, 20]), NOW);
  }
}
const j = await call(ids[0], "tower_arena_join");
ok(j.ok, "first join", j);
for (let i = 1; i < ids.length; i++) {
  const r = await call(ids[i], "tower_arena_join");
  if (!r.ok) console.log("join fail", ids[i], r);
}
let g = await call(ids[0], "tower_arena_get");
ok(g.ok && g.res.phase === "run", "bracket built after 20 joins", g.res && { phase: g.res.phase, count: g.res.count, matches: Object.keys(g.res.matches || {}).length });
ok(g.res.count === 20, "20 players");
const firstRounds = [...new Set(g.res.matches.map(m => m.round))];
console.log("rounds:", firstRounds);
ok(g.res.matches.filter(m => m.round === "playin").length === 4, "4 play-in matches");

let guard = 0;
while (guard++ < 40) {
  const view = await call(ids[0], "tower_arena_get");
  if (view.res.phase === "done") { g = view; break; }
  const active = view.res.matches.filter(m => !m.done);
  // advance time by 2 minutes so matches can resolve
  NOW += 120000;
  let picked = 0;
  for (const id of ids) {
    const my = await call(id, "tower_arena_get");
    if (!my.ok) continue;
    const m = (my.res.matches || []).find(x => !x.done && (x.a === id || x.b === id));
    if (m && !my.res.me.pick) {
      const r = await call(id, "tower_arena_pick", { match: m.id, st: id % 3, ans: id % 4 });
      if (r.ok) picked++;
    }
  }
  if (!picked) {
    // force resolution by jumping past deadlines
    NOW += 8 * 60000;
    await call(ids[0], "tower_arena_get");
  }
}
g = await call(ids[0], "tower_arena_get");
console.log("final phase", g.res.phase, "champion", g.res.champion, "places", g.res.places);
ok(g.res.phase === "done" && g.res.champion, "tournament finished with champion");
ok(g.res.places && Object.keys(g.res.places).length === 20, "all 20 places assigned", g.res.places);
const winner = g.res.champion && g.res.champion.uid;
const star = db.prepare("SELECT star_bal FROM users WHERE id=?").get(winner);
console.log("winner stars", star);
ok(star && star.star_bal >= 200, "champion got 200 stars");
