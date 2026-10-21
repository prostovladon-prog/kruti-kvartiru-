/* Перенос базы со старого сервера (Cloudflare) на свой хост.
   node tools/import-from-cloudflare.mjs https://адрес-старого-воркера
   Токен бота и путь к базе берутся из /etc/voiny.env (BOT_TOKEN, DB_PATH).
   Старая игра на время переноса переходит в режим «технические работы», чтобы ничего не потерялось. */
import { createHash } from "node:crypto";
import { readFileSync, existsSync, copyFileSync } from "node:fs";
import { openDB, loadWorker } from "../server/node-server.mjs";

const OLD = (process.argv[2] || "").replace(/\/$/, "");
if (!OLD) { console.error("Укажи адрес старого сервера: node tools/import-from-cloudflare.mjs https://....workers.dev"); process.exit(1) }
const envFile = existsSync("/etc/voiny.env") ? Object.fromEntries(readFileSync("/etc/voiny.env", "utf8").split("\n").filter(l => l.includes("=")).map(l => [l.slice(0, l.indexOf("=")).trim(), l.slice(l.indexOf("=") + 1).trim()])) : {};
const TOKEN = process.env.BOT_TOKEN || envFile.BOT_TOKEN, DB_PATH = process.env.DB_PATH || envFile.DB_PATH || "/var/lib/voiny/game.db";
if (!TOKEN) { console.error("Нет BOT_TOKEN"); process.exit(1) }
const KEY0 = createHash("sha256").update("export:" + TOKEN).digest("hex").slice(0, 40);
if (process.argv.includes("--unfreeze")) { const r = await fetch(OLD + "/export?freeze=0", { headers: { "X-Export-Key": KEY0 } }); console.log(await r.text()); process.exit(0) }
const KEY = createHash("sha256").update("export:" + TOKEN).digest("hex").slice(0, 40);
const get = async q => { const r = await fetch(OLD + "/export" + q, { headers: { "X-Export-Key": KEY } }); const t = await r.text(); let j; try { j = JSON.parse(t) } catch (e) { throw new Error("Старый сервер ответил не JSON (" + r.status + "): " + t.slice(0, 200)) } if (!j.ok) throw new Error("Старый сервер: " + j.err); return j };

console.log("1/4 Включаю «технические работы» на старом сервере…");
const { tables } = await get("?freeze=1");
await new Promise(r => setTimeout(r, 8000));   // даём закончиться действиям, которые уже идут

if (existsSync(DB_PATH)) { const b = DB_PATH + ".before-import-" + Date.now(); copyFileSync(DB_PATH, b); console.log("   Копия текущей базы: " + b) }
const env = { DB: openDB(DB_PATH), BOT_TOKEN: TOKEN, ADMINS: envFile.ADMINS || "" };
console.log("2/4 Готовлю таблицы…");
const worker = await loadWorker();
await worker.fetch(new Request("https://x/api", { method: "POST", body: "{}" }), env);   // создаёт все колонки и индексы
const db = env.DB.raw;

console.log("3/4 Скачиваю данные…");
const total = {};
db.exec("BEGIN");
try {
  for (const t of tables) {
    const cols = new Set(db.prepare(`PRAGMA table_info(${t})`).all().map(c => c.name));
    if (!cols.size) continue;
    db.exec(`DELETE FROM ${t}`); total[t] = 0;
    let after = 0;
    for (;;) {
      const j = await get(`?table=${t}&after=${after}`);
      for (const row of j.rows) {
        const ks = Object.keys(row).filter(k => k !== "_k" && cols.has(k));
        db.prepare(`INSERT OR REPLACE INTO ${t}(${ks.join(",")}) VALUES(${ks.map(() => "?").join(",")})`).run(...ks.map(k => row[k] ?? null));
        total[t]++;
      }
      if (j.done || j.last == null) break; after = j.last;
    }
    console.log(`   ${t}: ${total[t]}`);
  }
  db.prepare("DELETE FROM kv WHERE k='maintenance'").run();   // на новом сервере «технических работ» нет
  db.exec("COMMIT");
} catch (e) { db.exec("ROLLBACK"); console.error("❌ Перенос не удался, новая база не изменена:", e.message); console.error("   Старый сервер всё ещё в «технических работах». Чтобы вернуть его: node tools/import-from-cloudflare.mjs " + OLD + " --unfreeze"); process.exit(1) }

const c = db.prepare("SELECT (SELECT COUNT(*) FROM users) u,(SELECT COUNT(*) FROM cards WHERE owner>0) c").get();
console.log(`4/4 Готово! Игроков: ${c.u}, карточек у игроков: ${c.c}.`);
console.log("   Старый сервер остаётся в «технических работах», чтобы игроки не играли на нём, пока игра переключается на новый.");
