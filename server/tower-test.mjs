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
const menu = readFileSync(path.join(root, "menu.js"), "utf8");
const game = readFileSync(path.join(root, "game.js"), "utf8");
const tower = readFileSync(path.join(root, "tower.js"), "utf8");
const wow = readFileSync(path.join(root, "wow.js"), "utf8");
const css = readFileSync(path.join(root, "style.css"), "utf8");
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
assert.ok(server.includes('id:"tower-launch-20261125"') &&
  server.includes("try{await towerLaunchTick(env)}catch(e){console.error('tower launch',e)}"),
  "Tower launch announcement must be scheduled in the server tick");
const poster = readFileSync(path.join(root, "event-assets/tower-launch-2026-11-25.png"));
assert.equal(poster.toString("hex", 0, 8), "89504e470d0a1a0a");
assert.equal(poster.readUInt32BE(16), 1080);
assert.equal(poster.readUInt32BE(20), 1350);
assert.ok(server.includes('id:"2026-11-25-invite"') &&
  server.includes("needOpen:20,requireCommunity:1") &&
  server.includes("vipDays:7"), "friend-ticket contest must require 20 opens + both subscriptions and award week VIP");
assert.ok(server.includes("FRIEND_CONTEST_POSTS") &&
  server.includes("friend-ticket-20261126-20") &&
  !server.includes("friend-ticket-20261125-") &&
  server.includes("try{await friendContestPostsTick(env)}catch(e){console.error('friend contest posts',e)}"),
  "three contest photo posts on 26.11 must be scheduled, today's posts must stay disabled");
assert.ok(server.includes('id:"tower-react-20261125"') &&
  server.includes('code:"БАШНЯ30"') &&
  server.includes("mx:20") &&
  server.includes("try{await towerReactTick(env)}catch(e){console.error('tower reactions',e)}"),
  "10:30 reaction campaign must auto-publish a 30-spin promo for the first 20 players");
assert.ok(server.includes("[TOWER_REACT,REACT4,REACT3,REACT2,FIRE30]"),
  "reaction webhook must watch the new campaign post");
const reactionPoster = readFileSync(path.join(root, "event-assets/reactions-2026-11-25.png"));
assert.equal(reactionPoster.toString("hex", 0, 8), "89504e470d0a1a0a");
assert.equal(reactionPoster.readUInt32BE(16), 1080);
assert.equal(reactionPoster.readUInt32BE(20), 1350);
assert.ok(server.includes('id:"arena-20261127"') &&
  server.includes("max:30,min:1") &&
  server.includes("A.players.length===1") &&
  server.includes("const ARN_PUZZLES") &&
  server.includes("tower_arena_get") &&
  server.includes("tower_arena_join") &&
  server.includes("tower_arena_pick") &&
  server.includes("try{await arnTick(env)}catch(e){console.error('arena',e)}"),
  "27.11 arena must support 30 seats, no minimum, bracket battles, puzzles and scheduled ticks");
assert.ok(["1100","1730","2020"].every(time=>server.includes('id:"arena-20261127-'+time+'"')) &&
  server.includes("?startapp=arena") &&
  server.includes("event-assets/arena-2026-11-27-reminder.png"),
  "three channel posts must link directly to the arena, including the photo reminder");
assert.ok(rules.includes("ACTIONS.tower_arena_prize") &&
  rules.includes("TITLES.arena={n:\"Чемпион Арены\""),
  "arena rewards must grant keys, spins, shards and the champion cosmetics");
assert.ok(tower.includes('data-tab="arena"') &&
  tower.includes("tower_arena_pick") &&
  tower.includes("twArenaView"),
  "tower UI must expose the arena tab with stance and puzzle controls");
const arenaPoster = readFileSync(path.join(root, "event-assets/arena-2026-11-26.png"));
assert.equal(arenaPoster.toString("hex", 0, 8), "89504e470d0a1a0a");
assert.equal(arenaPoster.readUInt32BE(16), 1080);
assert.equal(arenaPoster.readUInt32BE(20), 1350);
assert.ok(menu.includes("const profileContestVisible=()=>false"), "the expired nickname contest must stay hidden");
assert.ok(game.includes("ПРИГЛАСИТЬ ДРУГА — ПОЛУЧИТЬ БИЛЕТ") &&
  game.includes("подписаться на канал @voinyepoh и чат @voinyepohchat"),
  "the challenge card must show eligibility and an explicit invite CTA");
assert.ok(wow.includes("C.invite") && css.includes(".chal-link div{display:grid"),
  "invite information and copy-link button must have a non-overlapping responsive layout");
const friendPoster = readFileSync(path.join(root, "event-assets/friend-ticket-2026-11-25.png"));
assert.equal(friendPoster.toString("hex", 0, 8), "89504e470d0a1a0a");
assert.equal(friendPoster.readUInt32BE(16), 1080);
assert.equal(friendPoster.readUInt32BE(20), 1350);
console.log("✅ Башня: лимиты, 1/1-карты, invite draw, постеры и рассылки проверены");
