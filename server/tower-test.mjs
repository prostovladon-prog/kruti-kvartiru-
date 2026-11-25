import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const require = createRequire(import.meta.url);
const R = require(path.join(root, "rules.js"));

assert.equal(R.TOWER.free, 2, "base daily attempts are 2");
assert.equal(R.TOWER.paidMax, 3, "paid attempt cap is 3");
assert.equal(R.TOWER_CHAMP_IDS.length, 2, "there are two prepared champion cards");
assert.deepEqual(R.TOWER_CHAMP_IDS.map(h => R.HEROES[h][0]), ["Страж Сумеречных Врат", "Владыка Башни"]);
assert.ok(R.TOWER_CHAMP_IDS.every(h => !R.isBase(h)), "champion cards must not enter the normal card pool");
assert.ok(R.TOWER_CHAMP_IDS.every(h => !R.ONE.includes(h)), "champions must not drop from random one-of-one rolls");

const expected = [
  { sn: "900001", stats: [612, 588, 534, 604, 596] },
  { sn: "900002", stats: [648, 612, 566, 638, 624] },
];
for (let i = 0; i < expected.length; i++) {
  const c = R.towerChampCard({ snFree: () => true, newId: () => "test" + i }, i);
  assert.ok(c);
  assert.equal(c.h, R.TOWER_CHAMP_IDS[i]);
  assert.equal(c.f, 4);
  assert.equal(c.sn, expected[i].sn);
  assert.deepEqual(c.stats, expected[i].stats);
  assert.equal(c.v, 4999999);
  assert.equal(R.finRun(c), 1);
  assert.equal(R.noTrade(c), true, "champion cards must be protected from sale/trade/burn");
  assert.equal(c.cust, undefined, "champion serial is the unique serial, not a custom-number skin");
}
assert.equal(R.towerChampCard({ snFree: () => false, newId: () => "duplicate" }, 0), null,
  "serial collision must not mint a duplicate champion card");

const now = Date.UTC(2026, 10, 25, 12);
const daily = { tower: { wk: "old", d: "old", run: { n: 3 }, free: 0 } };
R.towerOf(daily, now);
assert.equal(daily.tower.free, 2);
assert.equal(daily.tower.run.n, 3, "weekly reset must not discard an active run");
const vip = { vipUntil: now + 86400000 };
R.towerOf(vip, now);
assert.equal(vip.tower.free, 3, "VIP/Pass grants one extra free run");

const server = readFileSync(path.join(root, "server", "server.js"), "utf8");
const rules = readFileSync(path.join(root, "rules.js"), "utf8");
for (const action of ["tower_tour_get", "tower_tour_ready", "tower_admin_tick"]) {
  assert.ok(server.includes(action), `missing server action ${action}`);
}
assert.ok(server.includes("tower_tour_reminder") || server.includes("towerTourRemind"),
  "tournament readiness reminder must be wired");
assert.ok(server.includes("h NOT IN (\"+TOWER_CHAMP_IDS.join(\",\")+\")"),
  "champion card IDs must be excluded from direct trades");
assert.ok(server.includes("Карту чемпиона нельзя покупать или продавать"),
  "market checkout must reject old/already-listed champion cards");
assert.ok(server.includes("Номер чемпионской карты нельзя менять"),
  "champion serials must be immutable");
assert.ok(rules.includes("HEROES[c.h]?.[4]?.towerChamp)fail(NOTRADE_MSG)"),
  "champion cards must not be forgeable/fusable into a different trophy");

console.log("✅ Башня: лимиты, сброс, 1/1-карты, серийники и защита проверены");
