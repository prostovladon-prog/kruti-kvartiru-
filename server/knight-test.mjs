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

// ---------- этап 2: торговля ----------
const C = 72003; await call(C, "sync"); await call(C, "kn_get");
const cash = id => db.prepare("SELECT cash FROM users WHERE id=?").get(id).cash;
const setCash = (id, v) => db.prepare("UPDATE users SET cash=? WHERE id=?").run(v, id);
const fresh = db.prepare("SELECT * FROM kn_items WHERE owner=? AND id NOT IN (SELECT value FROM json_each((SELECT eq FROM kn_users WHERE uid=?))) AND forge<4 LIMIT 1");
let lotItem = fresh.get(A, A);
const young = await call(A, "kn_list", { id: lotItem.id, price: 5000 });
ok(!young.ok && /старше/.test(young.err), "новый аккаунт не может продавать (защита от фейков)");
db.prepare("UPDATE users SET created=? WHERE id IN (?,?,?)").run(Date.now() - 10 * 864e5, A, B, C);
db.prepare("UPDATE kn_users SET forged=50").run();
const cap = Math.max(1000, Math.round(lotItem.v * 10));
ok(!(await call(A, "kn_list", { id: lotItem.id, price: cap + 1 })).ok, "цену выше потолка поставить нельзя");
const L = await call(A, "kn_list", { id: lotItem.id, price: 5000 });
ok(L.ok && L.res.items.find(i => i.id === lotItem.id).lp === 5000, "часть выставлена на рынок", L);
ok(!(await call(A, "kn_equip", { id: lotItem.id })).ok, "выставленную часть надеть нельзя");
setCash(B, 6000); setCash(C, 6000); setCash(A, 0);
const race = await Promise.all([call(B, "kn_buy", { id: lotItem.id, price: 5000 }), call(C, "kn_buy", { id: lotItem.id, price: 5000 })]);
const win = race.findIndex(r => r.ok);
ok(race.filter(r => r.ok).length === 1, "двое не могут купить один лот", race.map(r => r.err));
const buyer = win === 0 ? B : C, other = win === 0 ? C : B;
ok(cash(buyer) === 1000 && cash(other) === 6000 && cash(A) === 4600, "деньги: покупатель −5000, продавец +4600 (комиссия 8%), второй не потерял", { b: cash(buyer), o: cash(other), a: cash(A) });
ok(db.prepare("SELECT owner FROM kn_items WHERE id=?").get(lotItem.id).owner === buyer, "часть перешла покупателю");

// быстрая продажа системе
const qs = fresh.get(A, A); setCash(A, 0);
const sold = await call(A, "kn_sell", { ids: [qs.id] });
ok(sold.ok && cash(A) === Math.round(qs.v * .7) && !db.prepare("SELECT 1 FROM kn_items WHERE id=?").get(qs.id), "быстрая продажа: 70% оценки, часть уходит из игры", sold);

// заказ «куплю»: монеты замораживаются, отмена возвращает
setCash(B, 10000);
const it2 = fresh.get(A, A);
const oa = await call(B, "kn_ord_add", { set: it2.set_id, slot: it2.slot, forge: it2.forge, price: 3000 });
ok(oa.ok && cash(B) === 7000, "заказ замораживает монеты", oa);
const ord = db.prepare("SELECT id FROM kn_orders WHERE uid=?").get(B).id;
setCash(A, 0);
const fill = await call(A, "kn_ord_fill", { order: ord, id: it2.id });
ok(fill.ok && cash(A) === 2760 && db.prepare("SELECT owner FROM kn_items WHERE id=?").get(it2.id).owner === B, "заказ выполнен: часть у заказчика, продавцу 92%", fill);
await call(B, "kn_ord_add", { set: "gold", slot: 0, forge: 0, price: 2000 });
const ord2 = db.prepare("SELECT id FROM kn_orders WHERE uid=?").get(B).id;
await call(B, "kn_ord_cancel", { id: ord2 });
ok(cash(B) === 7000, "отмена заказа возвращает монеты");

// подарок
const gi = fresh.get(A, A);
const gf = await call(A, "kn_gift", { id: gi.id, to: C });
ok(gf.ok && db.prepare("SELECT owner FROM kn_items WHERE id=?").get(gi.id).owner === C, "подарок другу", gf);

// обмен с доплатой
const ma = fresh.get(A, A), mc = fresh.get(C, C); setCash(A, 1000); setCash(C, 0);
const off = await call(A, "kn_trade_offer", { to: C, mine: ma.id, theirs: mc.id, extra: 500 });
ok(off.ok, "предложение обмена отправлено", off);
const tid = (await call(C, "kn_trades")).res.items[0].id;
ok(!(await call(A, "kn_trade_answer", { id: tid, ok: 1 })).ok, "своё предложение принять нельзя");
const acc = await call(C, "kn_trade_answer", { id: tid, ok: 1 });
ok(acc.ok && db.prepare("SELECT owner FROM kn_items WHERE id=?").get(ma.id).owner === C && db.prepare("SELECT owner FROM kn_items WHERE id=?").get(mc.id).owner === A && cash(A) === 500 && cash(C) === 500, "обмен: части поменялись, доплата 500 дошла", acc);
ok(!(await call(C, "kn_trade_answer", { id: tid, ok: 1 })).ok, "обмен нельзя принять дважды");

// Оружейник и заточка
const sw = (await call(A, "kn_market")).res.smith; setCash(A, 1e9);
const sb = await call(A, "kn_smith_buy", { set: sw[0], slot: 1 });
ok(sb.ok && sb.res.got[0].set === sw[0] && cash(A) < 1e9, "Оружейник продаёт часть за монеты", sb);
const sh = await call(A, "kn_sharpen", { id: sb.res.got[0].id });
ok(sh.ok && sh.res.items.find(i => i.id === sb.res.got[0].id).sh === 1, "заточка +1", sh);
setCash(A, 0); ok(!(await call(A, "kn_sharpen", { id: sb.res.got[0].id })).ok, "без монет заточить нельзя");
const total = db.prepare("SELECT SUM(cash) s FROM users").get().s;
ok(Number.isFinite(total), "балансы в порядке");

// ---------- этап 3: косметика за ⭐, подарок, витрина, уважение, Аллея ----------
env.PAY_SIM = "1";
const pay = async (uid, k, extra = {}) => { const inv = await call(uid, "invoice", { item: "kncos", k, ...extra }); if (!inv.ok) return inv; return call(uid, "pay_sim", { pid: inv.res.pid }); };
const own = (uid, k) => !!db.prepare("SELECT 1 FROM kn_cos WHERE uid=? AND k=?").get(uid, k);
ok(!(await call(A, "kn_show_set", { bg: "throne" })).ok, "некупленный фон поставить нельзя");
let pz = await pay(A, "bg_throne");
ok(pz.ok && pz.res.status === "done" && own(A, "bg_throne"), "фон куплен за звёзды", pz);
ok(!(await call(A, "invoice", { item: "kncos", k: "bg_throne" })).ok, "второй раз тот же фон не продаётся");
pz = await pay(A, "fx_snow", { to: B });
ok(pz.ok && own(B, "fx_snow") && !own(A, "fx_snow"), "фон/эффект можно подарить другу", pz);
const gs = await call(B, "kn_show_get", {});
ok(gs.ok && gs.res.gifts.fx_snow, "у друга видно, от кого подарок", gs);
pz = await pay(A, "chest_imp");
ok(own(A, "fx_goldrain") && own(A, "pl_gold") && own(A, "gr_stars"), "Сундук Императора выдаёт всё содержимое");
const myCards = db.prepare("SELECT id FROM cards WHERE owner=? ORDER BY v DESC LIMIT 4").all(A).map(r => r.id);
const ss = await call(A, "kn_show_set", { bg: "throne", fx: "goldrain", plate: "gold", ga: { t: "stars", c: "#2ee6ff" }, cards: myCards });
ok(ss.ok, "витрина настроена: фон, эффект, табличка, граффити, карты на стене", ss);
ok(!(await call(A, "kn_show_set", { ga: { t: "flame", c: "#fff" } })).ok, "некупленное граффити нельзя");
ok(!(await call(A, "kn_show_set", { cards: [bItem.id + 999999] })).ok, "чужие карты на стену не повесить");
const sg = await call(B, "kn_show_get", { uid: A });
ok(sg.ok && sg.res.set.bg === "throne" && sg.res.cards.length === myCards.length && sg.res.cards[0].id === myCards[0], "гость видит витрину и настоящие карты игрока", sg);
const r1 = await call(B, "kn_respect", { uid: A }), r2 = await call(B, "kn_respect", { uid: A });
ok(r1.ok && r1.res.resp === 1 && !r2.ok, "уважение — раз в день от одного игрока");
ok(!(await call(A, "kn_respect", { uid: A })).ok, "себе уважение не дать");
await pay(A, "fw"); await pay(A, "statue");
const al = await call(C, "kn_alley");
ok(al.ok && al.res.fw && al.res.statues.length === 1 && al.res.statues[0].uid === A, "фейерверк и статуя на Аллее героев видны всем", al);
const rt = await call(A, "kn_top", { kind: "resp" });
ok(rt.ok && rt.res.items[0].uid === A, "топ уважения");

// ---------- этап 4: поединки, честь, провиант, побратимы, подвиги, рейд ----------
db.prepare("UPDATE kn_users SET pow=100").run();
let dv = await call(A, "kn_duel_get");
ok(dv.ok && dv.res.free === 10 && dv.res.opp.length >= 2, "поединки: 10 бесплатных, есть соперники", dv);
ok((await call(B, "kn_tactic", { moves: ["s", "s", "s"] })).ok, "защиту можно настроить");
ok(!(await call(A, "kn_duel", { uid: B, moves: ["x", "s"] })).ok, "кривые ходы не принимаются");
let d1 = await call(A, "kn_duel", { uid: B, moves: ["d", "d", "d"] });
ok(d1.ok && d1.res.res.win && d1.res.res.combo && d1.res.res.h === 15 && d1.res.hon === 15 && d1.res.free === 9, "угадал защиту — победа и честь ×1.5", d1.res && d1.res.res);
await call(A, "kn_duel", { uid: B, moves: ["d", "d", "d"] }); await call(A, "kn_duel", { uid: B, moves: ["d", "d", "d"] });
ok(!(await call(A, "kn_duel", { uid: B, moves: ["d", "d", "d"] })).ok, "с одним рыцарем — не больше 3 поединков в день");
db.prepare("UPDATE kn_users SET dn=10 WHERE uid=?").run(A); setCash(A, 10);
ok(!(await call(A, "kn_duel", { uid: C, moves: ["s", "d", "c"] })).ok && db.prepare("SELECT dn FROM kn_users WHERE uid=?").get(A).dn === 10, "платный поединок без монет не проходит и не съедает попытку");
setCash(A, 100000); const cd = await call(A, "kn_duel", { uid: C, moves: ["s", "d", "c"] });
ok(cd.ok && cd.res.res.paid && db.prepare("SELECT cash FROM users WHERE id=?").get(A).cash === 70000, "11-й поединок за 30 000 🪙", cd);
const f1 = await call(B, "kn_food", { uid: A }), f2 = await call(B, "kn_food", { uid: A });
ok(f1.ok && !f2.ok && db.prepare("SELECT dx FROM kn_users WHERE uid=?").get(A).dx === 1, "провиант: +1 бесплатный поединок, одному другу раз в день");
ok((await call(A, "kn_bro_ask", { uid: C })).ok && (await call(C, "kn_bro_ok")).ok, "побратимы: позвал и принял");
const br = db.prepare("SELECT uid,bro FROM kn_users WHERE uid IN (?,?)").all(A, C);
ok(br.every(x => x.bro === (x.uid === A ? C : A)), "братство записано у обоих");
ok(!(await call(B, "kn_bro_ask", { uid: A })).ok, "занятого побратима не переманить");
db.prepare("UPDATE users SET state=json_set(COALESCE(state,'{}'),'$.totalWins',60,'$.eras',json('{\"a\":1,\"b\":1}')) WHERE id=?").run(A);
let fe = await call(A, "kn_feats");
const fa = fe.res.feats.find(f => f.id === "arena"), fr = fe.res.feats.find(f => f.id === "eras");
ok(fa.ready === 2 && fr.ready === 2, "подвиги считаются по настоящим достижениям (60 побед → 2, 2 эпохи → 2)", fe.res.feats);
const fc = await call(A, "kn_feat_claim", { id: "arena" });
ok(fc.ok && fc.res.got === 2 && fc.res.ak.glad === 2 && !(await call(A, "kn_feat_claim", { id: "arena" })).ok, "награда за подвиг — один раз", fc);
const ao = await call(A, "kn_award_open", { set: "glad" });
ok(ao.ok && ao.res.got[0].set === "glad" && ao.res.ak.glad === 1, "ключ награды → часть сета «Гладиатор»", ao);
ok(!(await call(A, "kn_award_open", { set: "keeper" })).ok, "без ключа наградный сет не открыть");
ok(!(await call(A, "kn_craft", { set: "glad", slot: 0 })).ok, "наградный сет не крафтится из стали");
// рейд ордена
db.prepare("INSERT INTO clans(id,name,name_key,owner,created) VALUES(77,'Орден','орден',?,0)").run(A);
const extra = [72011, 72012, 72013];
for (const u of extra) { await call(u, "sync"); await call(u, "kn_get"); }
db.prepare("UPDATE users SET clan=77 WHERE id IN (?,?,?,?)").run(A, ...extra);
db.prepare("UPDATE kn_users SET pow=100").run();
let rg = await call(A, "kn_raid_get");
ok(rg.ok && rg.res.locked && rg.res.knights === 4, "рейд закрыт, пока в клане меньше 5 рыцарей", rg);
ok((await call(A, "kn_board_set", { min: 50, txt: "Ищем рыцарей в рейд!" })).ok, "глава даёт объявление на доску набора");
const bd = await call(B, "kn_board_get");
ok(bd.ok && bd.res.list[0].name === "Орден" && bd.res.list[0].kn === 4, "доска набора видна всем", bd);
ok((await call(B, "clan_join", { id: 77 })).ok, "с доски можно вступить в клан");
rg = await call(A, "kn_raid_get");
ok(rg.ok && !rg.res.locked && rg.res.hp === 500 * 14, "5 рыцарей — рейд открыт, у босса здоровье по силе клана", rg.res);
db.prepare("UPDATE kn_raid SET hp=150").run();
const h1 = await call(A, "kn_raid_hit"), h1b = await call(A, "kn_raid_hit");
ok(h1.ok && !h1.res.kill && !h1b.ok, "удар по рейду — раз в день", h1);
const ak0 = db.prepare("SELECT n FROM kn_ak WHERE uid=? AND set_id='banner'").get(72011);
const h2 = await call(B, "kn_raid_hit");
ok(h2.ok && h2.res.kill && db.prepare("SELECT n FROM kn_ak WHERE uid=? AND set_id='banner'").get(A).n === 1 && !ak0, "босс повержен — ключ «Знамя ордена» только тем, кто бил", h2.res);
ok(!(await call(72011, "kn_raid_hit")).ok, "по поверженному боссу больше не бьют");
const ht = await call(A, "kn_top", { kind: "honor" }), ct = await call(A, "kn_top", { kind: "clan" });
ok(ht.ok && ht.res.items[0].uid === A && ct.ok && ct.res.items[0].name === "Орден", "топ чести недели и топ орденов");

if (process.exitCode) console.log("\n❌ ПРОВЕРКА РЫЦАРЯ НЕ ПРОЙДЕНА");
else console.log("\n✅ РЫЦАРЬ РАБОТАЕТ: кузня, тиражи, сталь, переплавка, ключи за карты, рынок, заказы, обмен, подарки, витрина, косметика, поединки, честь, подвиги, рейд ордена");
