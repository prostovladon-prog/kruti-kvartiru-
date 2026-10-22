/* node-server.mjs — сервер «Воинов Эпох» на своём хосте (VPS), без Cloudflare.
   Тот же код игры (worker.js), только база не D1, а файл SQLite на диске.
   Запуск: node server/node-server.mjs   (настройки в /etc/voiny.env, см. tools/vps-setup.sh)
     BOT_TOKEN — токен бота, ADMINS — id админов через запятую, DB_PATH — файл базы, PORT — порт (по умолчанию 8787) */
import http from "node:http";
import { DatabaseSync } from "node:sqlite";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const dir = path.dirname(fileURLToPath(import.meta.url));
export function openDB(file) {
  const db = new DatabaseSync(file);
  db.exec("PRAGMA journal_mode=WAL; PRAGMA synchronous=NORMAL; PRAGMA busy_timeout=5000; PRAGMA foreign_keys=OFF;");
  db.exec(readFileSync(path.join(dir, "schema.sql"), "utf8"));
  /* обёртка с теми же методами, что у Cloudflare D1 */
  const fix = a => a.map(x => x === undefined ? null : typeof x === "boolean" ? +x : x);
  class Stmt {
    constructor(sql, args = []) { this.sql = sql; this.args = args }
    bind(...a) { return new Stmt(this.sql, fix(a)) }
    async first() { return db.prepare(this.sql).get(...this.args) ?? null }
    async all() { return { results: db.prepare(this.sql).all(...this.args) } }
    async run() { return this._exec() }
    _exec() {
      if (/^\s*(select|with|pragma)/i.test(this.sql)) return { results: db.prepare(this.sql).all(...this.args), meta: { changes: 0 } };
      const r = db.prepare(this.sql).run(...this.args); return { results: [], meta: { changes: Number(r.changes) } };
    }
  }
  return {
    raw: db,
    prepare: sql => new Stmt(sql),
    async batch(list) { db.exec("BEGIN IMMEDIATE"); try { const out = list.map(s => s._exec()); db.exec("COMMIT"); return out } catch (e) { db.exec("ROLLBACK"); throw e } }
  };
}
export async function loadWorker() {
  const code = readFileSync(path.join(dir, "worker.js"));
  return (await import("data:text/javascript;base64," + code.toString("base64"))).default;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  const env = { DB: openDB(process.env.DB_PATH || "/var/lib/voiny/game.db"), BOT_TOKEN: process.env.BOT_TOKEN || "", ADMINS: process.env.ADMINS || "", TEST: process.env.TEST || "", DEV: process.env.DEV || "" };
  if (!env.BOT_TOKEN) console.warn("⚠️  BOT_TOKEN не задан: вход из Telegram работать не будет");
  const worker = await loadWorker();
  const port = +process.env.PORT || 8787;
  http.createServer(async (req, res) => {
    try {
      const chunks = []; for await (const c of req) chunks.push(c);
      const body = chunks.length ? Buffer.concat(chunks) : undefined;
      const headers = new Headers(); for (const [k, v] of Object.entries(req.headers)) if (v != null) headers.set(k, Array.isArray(v) ? v.join(", ") : v);
      const proto = req.headers["x-forwarded-proto"] || "https";
      const request = new Request(proto + "://" + (req.headers.host || "localhost") + req.url, { method: req.method, headers, body: req.method === "GET" || req.method === "HEAD" ? undefined : body });
      const r = await worker.fetch(request, env);
      const out = Buffer.from(await r.arrayBuffer());
      res.writeHead(r.status, Object.fromEntries(r.headers.entries())); res.end(out);
    } catch (e) { console.error(e); res.writeHead(500, { "Content-Type": "application/json" }); res.end('{"ok":false,"err":"Ошибка сервера"}') }
  }).listen(port, "127.0.0.1", () => console.log("Воины Эпох: сервер запущен на порту " + port));
  /* напоминания о прокрутках: раньше это делал Cron в Cloudflare */
  const tick = () => worker.scheduled({}, env, { waitUntil: p => p && p.catch && p.catch(e => console.error("reminders", e)) });
  setInterval(tick, 10 * 60e3); setTimeout(tick, 30e3);
  /* турнир: раз в 5 секунд сервер двигает раунды */
  setInterval(() => worker.tick && worker.tick(env).catch(e => console.error("tick", e)), 5000);
}
