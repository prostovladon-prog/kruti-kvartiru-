// Проверка акции: 39 реакций не публикуют код; 40 публикуют, промокод даёт 40 прокруток один раз.
// Запуск: python tools/build_worker.py && node server/reaction-test.mjs
import { DatabaseSync } from "node:sqlite";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { webcrypto } from "node:crypto";
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
const env = { DB, DEV: "1", NOTIFY_TEST: "1", BOT_TOKEN: "123:TEST" };
db.exec("CREATE TABLE IF NOT EXISTS kv (k TEXT PRIMARY KEY, v TEXT)");
const call = async (uid, a, p = {}) => {
  const res = await worker.fetch(new Request("https://x/api", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Dev-User": String(uid) },
    body: JSON.stringify({ a, p }),
  }), env);
  return res.json();
};
const ok = (condition, message, extra) => {
  console.log((condition ? "✓ " : "✗ ") + message + (condition || extra == null ? "" : " → " + JSON.stringify(extra)));
  if (!condition) process.exitCode = 1;
};

const uid = 72001, code = "ЭПОХИ40", campaign = "react_241124_1030", messageId = 43210;
const at = Date.UTC(2026, 10, 24, 7, 31);
await call(uid, "sync");
db.prepare("INSERT OR IGNORE INTO promo(code,sp,cash,mx,until,created,off,x2,bon,bmin) VALUES(?,40,0,0,?,?,0,0,0,0)")
  .run(code, Date.UTC(2026, 10, 24, 20, 59), at);
db.prepare("INSERT OR REPLACE INTO kv(k,v) VALUES(?,?)")
  .run("blast:" + campaign, JSON.stringify({ ch: 1, mid: messageId, done: 1, after: 0, n: 0 }));

const tokenHash = await webcrypto.subtle.digest("SHA-256", new TextEncoder().encode("hook:" + env.BOT_TOKEN));
const secret = [...new Uint8Array(tokenHash)].map(x => x.toString(16).padStart(2, "0")).join("").slice(0, 48);
const sent = [];
const oldFetch = globalThis.fetch;
globalThis.fetch = async (url, init = {}) => {
  const method = String(url).split("/").pop();
  let payload = {};
  try { payload = JSON.parse(init.body || "{}"); } catch (e) {}
  sent.push({ method, payload });
  return new Response(JSON.stringify({ ok: true, result: { message_id: 999, chat: { id: -100 } } }), {
    status: 200, headers: { "Content-Type": "application/json" },
  });
};
const oldNow = Date.now;
Date.now = () => at;
async function reaction(total, updateId) {
  return worker.fetch(new Request("https://x/tg", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Telegram-Bot-Api-Secret-Token": secret,
    },
    body: JSON.stringify({ update_id: updateId, message_reaction_count: {
      chat: { id: -100, username: "voinyepoh", type: "channel" },
      message_id: messageId,
      date: Math.floor(at / 1000),
      reactions: [{ type: { type: "emoji", emoji: "🔥" }, total_count: total }],
    } }),
  }), env);
}

try {
  const early = await call(uid, "promo_use", { code });
  ok(!early.ok && /40 реакций/i.test(early.err || ""),
    "код нельзя угадать и активировать до публикации");
  const low = await reaction(39, 1);
  const postedAt39 = sent.some(x => x.payload.caption && x.payload.caption.includes(code));
  ok(low.ok && !postedAt39, "на 39 реакциях промокод ещё не публикуется");

  const reached = await Promise.all([reaction(40, 2), reaction(40, 3)]);
  const codes = sent.filter(x => x.payload.caption && x.payload.caption.includes("Промокод: " + code));
  ok(reached.every(x => x.ok) && codes.length === 1,
    "40-я реакция немедленно публикует один промокод даже при одновременных webhook", codes.length);

  await reaction(40, 4);
  const codesAfterRepeat = sent.filter(x => x.payload.caption && x.payload.caption.includes("Промокод: " + code));
  ok(codesAfterRepeat.length === 1, "повторное обновление реакций не дублирует пост промокода", codesAfterRepeat.length);

  const before = (await call(uid, "sync")).S.spins;
  const used = await call(uid, "promo_use", { code });
  const after = used.S.spins;
  ok(used.ok && after - before === 40, "промокод начисляет ровно 40 прокруток", used.res);
  const twice = await call(uid, "promo_use", { code });
  ok(!twice.ok, "один игрок не может активировать код дважды", twice.err);
} finally {
  Date.now = oldNow;
  globalThis.fetch = oldFetch;
}

if (process.exitCode) console.log("\n❌ ПРОВЕРКА РЕАКЦИОННОГО ПРОМОКОДА НЕ ПРОЙДЕНА");
else console.log("\n✅ РЕАКЦИИ И ПРОМОКОД РАБОТАЮТ");
