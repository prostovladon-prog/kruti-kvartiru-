/* 🏰 Башня испытаний — клиент. Ветка feat/tower. */
(function () {
  if (window.__TOWER_UI__) return;
  window.__TOWER_UI__ = 1;
  const $ = id => document.getElementById(id);
  const esc = t => String(t == null ? "" : t).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

  const css = `
  #tower{position:fixed;inset:0;z-index:90;display:flex;justify-content:center;background:rgba(4,6,20,.74);backdrop-filter:blur(3px)}
  #tower[hidden]{display:none}
  .tw-sh{width:100%;max-width:540px;display:flex;flex-direction:column;position:relative;background:linear-gradient(180deg,#111738,#070a1c 60%,#050714);color:#e8ecff;overflow:hidden;border-left:2px solid #2a3260;border-right:2px solid #2a3260}
  .tw-hd{display:flex;align-items:center;gap:8px;padding:10px 12px;background:linear-gradient(180deg,#1b2250,#121638);border-bottom:2px solid #ffd60a;flex:0 0 auto}
  .tw-hd b{font-family:var(--display);font-size:18px;letter-spacing:.4px;flex:1}
  .tw-hd .tw-x,.tw-hd .tw-back{border:2px solid #ffd60a;background:#0c1230;color:#ffd60a;border-radius:9px;font-weight:900;font-size:16px;width:34px;height:32px;line-height:1}
  .tw-pill{font-size:11px;font-weight:900;background:#0c1230;border:1.5px solid #3a447a;border-radius:999px;padding:4px 7px;white-space:nowrap}
  .tw-pill b{color:#ffd60a}
  .tw-body{flex:1 1 auto;overflow:auto;padding:10px 12px 84px;overscroll-behavior:contain}
  .tw-h{font-family:var(--display);font-size:15px;color:#ffd60a;margin:12px 0 6px}
  .tw-h:first-child{margin-top:0}
  .tw-note{font-size:12px;color:#aeb8e0;line-height:1.45;margin:0 0 8px}
  .tw-stats{display:grid;grid-template-columns:repeat(4,1fr);gap:6px;margin-bottom:8px}
  .tw-stat{background:#0c1230;border:1.5px solid #2a3260;border-radius:10px;padding:6px 5px;text-align:center}
  .tw-stat b{display:block;font-size:15px;color:#ffd60a}
  .tw-stat small{font-size:10px;color:#9aa6d0}
  .tw-slots{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:8px}
  .tw-slot{position:relative;aspect-ratio:5/7;border:2px dashed #3a447a;border-radius:10px;display:flex;align-items:center;justify-content:center;color:#7a86b8;font-size:11px;font-weight:900;text-align:center;padding:4px;background:#0a0f28}
  .tw-slot.on{border-style:solid;border-color:#ffd60a;padding:0;overflow:hidden;background:#0c1230}
  .tw-slot .minic{width:100%}
  .tw-slot .tw-pw{position:absolute;left:0;right:0;bottom:0;background:rgba(6,8,24,.82);color:#ffd60a;font-size:10px;font-weight:900;text-align:center;padding:2px 0}
  .tw-cards{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}
  .tw-card{position:relative;background:#0a0f28;border:2px solid #2a3260;border-radius:10px;padding:3px;cursor:pointer;overflow:hidden}
  .tw-card.on{border-color:#ffd60a;box-shadow:0 0 0 2px #ffd60a inset}
  .tw-card .minic{width:100%;display:block}
  .tw-card small{display:block;text-align:center;font-size:9.5px;color:#aeb8e0;padding:2px 0 1px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  .tw-card .tw-pw{position:absolute;top:4px;right:4px;background:#ffd60a;color:#0d1030;font-size:9px;font-weight:900;border-radius:6px;padding:1px 4px}
  .tw-btn{display:block;width:100%;border:2px solid #0d1030;border-radius:11px;background:#ffd60a;color:#0d1030;font-weight:900;font-size:14px;padding:10px;margin:8px 0;cursor:pointer}
  .tw-btn:disabled{opacity:.45}
  .tw-btn.ghost{background:#0c1230;color:#ffd60a;border-color:#ffd60a}
  .tw-btn.red{background:linear-gradient(135deg,#ff7a1a,#c4100a);color:#fff;border-color:#ffd60a}
  .tw-btn.blue{background:linear-gradient(135deg,#3aa0ff,#1a3a9a);color:#fff;border-color:#7ec8ff}
  .tw-btn.sm{font-size:12px;padding:7px;margin:5px 0}
  .tw-floors{display:flex;gap:4px;margin:6px 0 10px}
  .tw-fl{flex:1;text-align:center;font-size:9px;font-weight:900;color:#7a86b8}
  .tw-fl i{display:block;height:6px;border-radius:99px;background:#2a3260;margin-bottom:3px}
  .tw-fl.done i{background:#34c759}.tw-fl.cur i{background:#ffd60a}.tw-fl.cur{color:#ffd60a}
  .tw-sq{display:grid;grid-template-columns:repeat(3,1fr);gap:7px;margin-bottom:8px}
  .tw-sq .minic{width:100%}
  .tw-sq .tw-pw{font-size:10px;text-align:center;color:#ffd60a;font-weight:900}
  .tw-enemy{background:linear-gradient(135deg,#2a0a12,#12040a);border:2px solid #b3122f;border-radius:12px;padding:9px 10px;margin:6px 0 10px}
  .tw-enemy b{color:#ff8a9a}
  .tw-enemy .tw-chance{font-size:22px;font-family:var(--display);color:#ffd60a}
  .tw-chance small{font-size:11px;color:#aeb8e0;font-family:inherit}
  .tw-res{background:#0c1230;border:2px solid #ffd60a;border-radius:12px;padding:10px;margin:6px 0 10px;text-align:center}
  .tw-res.win{border-color:#34c759}.tw-res.lose{border-color:#b3122f}
  .tw-res h3{font-family:var(--display);font-size:20px;margin:2px 0 6px}
  .tw-res .tw-loot{font-size:13px;line-height:1.5;color:#dfe6ff}
  .tw-row{display:flex;align-items:center;gap:6px;padding:7px 6px;border-bottom:1px dashed #2a3260;font-size:12px}
  .tw-row.me{background:#1a2250;border-radius:8px}
  .tw-row .pl{width:22px;font-weight:900;color:#ffd60a;text-align:center}
  .tw-row .nm{flex:1;font-weight:800;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
  .tw-row .vl{color:#aeb8e0;font-size:11px;white-space:nowrap}
  .tw-shop{display:grid;grid-template-columns:1fr 1fr;gap:7px}
  .tw-item{background:#0c1230;border:2px solid #2a3260;border-radius:11px;padding:8px}
  .tw-item b{display:block;font-size:12px;line-height:1.2}
  .tw-item small{display:block;color:#9aa6d0;font-size:10px;margin:3px 0 5px;min-height:24px}
  .tw-item .tw-btn{margin:0;font-size:11px;padding:6px}
  .tw-nav{position:absolute;left:0;right:0;bottom:0;display:flex;gap:6px;padding:7px 10px calc(7px + env(safe-area-inset-bottom));background:linear-gradient(180deg,rgba(12,18,48,.6),#0c1230 40%);border-top:2px solid #2a3260}
  .tw-nav button{flex:1;border:2px solid #3a447a;border-radius:10px;background:#0a0f28;color:#aeb8e0;font-weight:900;font-size:11px;padding:7px 4px}
  .tw-nav button.on{border-color:#ffd60a;color:#ffd60a;background:#1a2250}
  .tw-load{text-align:center;color:#9aa6d0;font-size:12px;padding:20px}
  .tw-sn{display:flex;gap:8px;align-items:center;background:#0c1230;border:1.5px solid #2a3260;border-radius:11px;padding:8px;margin-bottom:8px}
  .tw-sn .ic{font-size:24px}
  .tw-sn b{display:block;font-size:12px}.tw-sn small{display:block;color:#9aa6d0;font-size:10px}
  .tw-sn .tw-btn{margin:0;flex:0 0 auto;width:auto;padding:6px 10px;font-size:11px}
  @media(max-width:380px){.tw-cards{grid-template-columns:repeat(2,1fr)}}
  `;

  let twSel = [], twTab = "main", twRes = null, twTop = null, twBusy = false;

  function ensure() {
    let el = $("tower");
    if (!el) {
      el = document.createElement("div");
      el.id = "tower"; el.hidden = true;
      el.innerHTML = '<div class="tw-sh"><div class="tw-hd"><button type="button" class="tw-back" id="tw-back">‹</button><b>🏰 Башня</b><span class="tw-pill" id="tw-sig">🏅 <b>0</b></span><button type="button" class="tw-x" id="tw-x">×</button></div><div class="tw-body" id="tw-body"></div><div class="tw-nav" id="tw-nav"></div></div>';
      document.body.appendChild(el);
      const st = document.createElement("style"); st.id = "tw-css"; st.textContent = css; document.head.appendChild(st);
      $("tw-x").onclick = twClose;
      $("tw-back").onclick = () => { if (twTab !== "main") { twTab = "main"; twRender(); } else twClose(); };
      $("tw-nav").onclick = e => {
        const b = e.target.closest("[data-tab]"); if (!b) return;
        twTab = b.dataset.tab; twRes = null; twRender();
      };
    }
    return el;
  }

  function twOpen() {
    if (!S || !S.tower) { toast("Башня ещё не подключена. Обнови игру"); return; }
    const el = ensure(); el.hidden = false; twTab = "main"; twRes = null; twTop = null; twRender();
    try { hap("light"); } catch (e) {}
  }
  function twClose() { const el = $("tower"); if (el) el.hidden = true; }
  window.twOpen = twOpen;
  window.twClose = twClose;

  function twNav() {
    const T = S.tower || {};
    return '<button type="button" data-tab="main" class="' + (twTab === "main" ? "on" : "") + '">🏰 Забег</button>' +
      '<button type="button" data-tab="shop" class="' + (twTab === "shop" ? "on" : "") + '">🏅 Магазин</button>' +
      '<button type="button" data-tab="top" class="' + (twTab === "top" ? "on" : "") + '">📊 Топ</button>' +
      '<button type="button" data-tab="rules">📖 Правила</button>';
  }

  function twRender() {
    const el = ensure();
    if (el.hidden) return;
    const T = S && S.tower;
    if (!T) { $("tw-body").innerHTML = '<p class="tw-note">Башня не подключена. Обнови игру.</p>'; return; }
    $("tw-sig").innerHTML = "🏅 <b>" + (T.sig | 0) + "</b>";
    $("tw-nav").innerHTML = twNav();
    if (twTab === "rules") { try { twClose(); openTowerRules(); } catch (e) {} twTab = "main"; return; }
    if (twTab === "shop") { twShop(T); return; }
    if (twTab === "top") { twTopView(T); return; }
    if (twRes && twRes.done) { twEnd(T); return; }
    if (T.run) { twRun(T); return; }
    twStart(T);
  }

  function twStat(v, l) { return '<div class="tw-stat"><b>' + v + '</b><small>' + l + '</small></div>'; }

  function twCard(c, on, pw) {
    return '<div class="tw-card' + (on ? " on" : "") + '" data-id="' + esc(c.id) + '">' + miniSlot(c) +
      (pw != null ? '<span class="tw-pw">' + pw + '</span>' : "") +
      '<small>' + esc((HEROES[c.h] || ["?"])[0]) + '</small></div>';
  }

  function twStart(T) {
    const pool = (S.cards || []).filter(c => !c.away && !c.listed && !c.lock && !c.part).sort((a, b) => (b.v || 0) - (a.v || 0));
    twSel = twSel.filter(id => pool.some(c => String(c.id) === String(id))).slice(0, 3);
    const slots = [0, 1, 2].map(i => {
      const c = pool.find(x => String(x.id) === String(twSel[i]));
      return c ? '<div class="tw-slot on">' + miniSlot(c) + '<span class="tw-pw">' + towerCardPow(c) + '</span></div>' : '<div class="tw-slot">' + (i + 1) + '<br>карта</div>';
    }).join("");
    const list = pool.slice(0, 90).map(c => twCard(c, twSel.includes(String(c.id)), towerCardPow(c))).join("");
    $("tw-body").innerHTML =
      '<div class="tw-stats">' + twStat(T.free, "бесплатных") + twStat(T.keys, "ключей") + twStat(T.sig, "печатей") + twStat(T.wBest, "лучший этаж") + '</div>' +
      '<div class="tw-note">Собери отряд из <b>3 своих карт</b>. Карты не теряются, прокрутки не тратятся. Победа открывает следующий этаж.</div>' +
      '<div class="tw-h">Отряд <span style="color:#aeb8e0;font-size:11px">' + twSel.length + '/3</span></div>' +
      '<div class="tw-slots">' + slots + '</div>' +
      '<button type="button" class="tw-btn" id="tw-go"' + (twSel.length !== 3 || (T.free <= 0 && T.keys <= 0) ? " disabled" : "") + '>⚔️ Начать забег</button>' +
      (T.free <= 0 && T.keys <= 0 ? '<div class="tw-note" style="text-align:center">Попытки на сегодня закончились. Ключ — в магазине.</div>' : '') +
      '<div class="tw-h">Твои карты</div>' +
      (list ? '<div class="tw-cards">' + list + '</div>' : '<p class="tw-note">Нет подходящих карт. Карты с рынка, из похода и арены не берутся.</p>') +
      '<div class="tw-h">Попытки</div>' +
      '<div class="tw-note">Бесплатных: <b>' + T.free + '</b> · Ключей: <b>' + T.keys + '</b> · Платных сегодня: <b>' + T.paid + '/' + T.paidMax + '</b>' +
      (T.pass ? ' · 👑 Пропуск до ' + new Date(T.passUntil).toLocaleDateString("ru-RU") : "") + '</div>';
    $("tw-body").querySelectorAll(".tw-card").forEach(el => {
      el.onclick = () => {
        const id = el.dataset.id, i = twSel.indexOf(id);
        if (i >= 0) twSel.splice(i, 1); else { if (twSel.length >= 3) { toast("В отряде уже 3 карты"); return; } twSel.push(id); }
        try { hap("light"); } catch (e) {} twRender();
      };
    });
    $("tw-go").onclick = () => twStartRun();
  }

  async function twStartRun() {
    if (twBusy) return;
    if (twSel.length !== 3) { toast("Выбери 3 карты"); return; }
    twBusy = true;
    try { const r = await act("tower_start", { ids: twSel.map(x => isNaN(+x) ? x : +x) }); if (r) { twRes = null; try { hapN("success"); } catch (e) {} twRender(); } }
    catch (e) { toast(e.message || "Не получилось"); }
    finally { twBusy = false; }
  }

  function twEnd(T) {
    const R = twRes, g = R.got || {}, loot = [];
    if (g.sh) loot.push("💠 +" + g.sh);
    if (g.sp) loot.push("🎴 +" + g.sp);
    if (g.xp) loot.push("XP +" + g.xp);
    if (g.sig) loot.push("🏅 +" + g.sig);
    if (R.card) loot.push("🃏 " + esc((HEROES[R.card.h] || ["карта"])[0]));
    $("tw-body").innerHTML = '<div class="tw-res ' + (R.win ? "win" : "lose") + '"><h3>' + (R.win ? "🏆 Победа!" : "💀 Поражение") + '</h3>' +
      '<div class="tw-loot">' + (loot.length ? loot.join(" · ") : "Без награды") + (R.note ? '<br><small>' + esc(R.note) + '</small>' : "") + '</div>' +
      '<div style="margin-top:6px;font-size:12px;color:#aeb8e0">Лучший этаж: <b style="color:#ffd60a">' + (R.end ? R.end.best : T.wBest) + '</b></div>' +
      '</div><button type="button" class="tw-btn" id="tw-next">Новый забег</button>';
    $("tw-next").onclick = () => { twRes = null; twSel = []; twRender(); };
  }

  function twRun(T) {
    const r = T.run, n = r.n | 0, F = T.floors[n - 1] || T.floors[0];
    const floors = T.floors.map(f => '<div class="tw-fl ' + (f.n < n ? "done" : f.n === n ? "cur" : "") + '"><i></i>' + f.n + '</div>').join("");
    const sq = (r.squad || []).map(c => '<div>' + miniSlot(c) + '<div class="tw-pw">' + towerCardPow(c) + '</div></div>').join("");
    const calm = Math.round(1000 * r.power / (r.power + F.e)) / 10;
    const risk = F.er ? Math.round(1000 * (r.power / (r.power + F.er)) * .92) / 10 : 0;
    let html = '<div class="tw-floors">' + floors + '</div>' +
      '<div class="tw-note">Этаж <b>' + n + '/5</b> · ' + esc(F.name) + '</div>' +
      '<div class="tw-sq">' + sq + '</div>' +
      '<div class="tw-enemy"><div>⚔️ Страж: <b>' + esc(F.name) + '</b></div><div style="font-size:12px;color:#aeb8e0">Сила стража: <b style="color:#ff8a9a">' + F.e + '</b>' +
      (F.er ? ' · риск: <b style="color:#ff8a9a">' + F.er + '</b>' : "") + '</div>' +
      '<div class="tw-chance">' + calm + '% <small>шанс победы</small></div></div>';
    if (!twRes) {
      html += '<button type="button" class="tw-btn blue" id="tw-calm">🛡 Спокойно · шанс ' + calm + '%</button>' +
        (F.er ? '<button type="button" class="tw-btn red" id="tw-risk">🔥 Риск · шанс ' + risk + '% · награда ×1,5</button>' : "") +
        '<div class="tw-note">Победа открывает следующий этаж. Поражение заканчивает забег, награды пройденных этажей остаются.</div>';
    } else {
      const R = twRes, g = R.got || {};
      const loot = [];
      if (g.sh) loot.push("💠 +" + g.sh);
      if (g.sp) loot.push("🎴 +" + g.sp);
      if (g.xp) loot.push("XP +" + g.xp);
      if (g.sig) loot.push("🏅 +" + g.sig);
      if (R.card) loot.push("🃏 " + esc((HEROES[R.card.h] || ["карта"])[0]));
      html += '<div class="tw-res ' + (R.win ? "win" : "lose") + '"><h3>' + (R.win ? "🏆 Победа!" : "💀 Поражение") + '</h3>' +
        '<div class="tw-loot">' + (loot.length ? loot.join(" · ") : "Без награды") + (R.note ? '<br><small>' + esc(R.note) + '</small>' : "") + '</div>' +
        (R.done ? '<div style="margin-top:6px;font-size:12px;color:#aeb8e0">Забег окончен. Лучший этаж: <b style="color:#ffd60a">' + (R.end ? R.end.best : 0) + '</b></div>' : "") +
        '</div>' +
        '<button type="button" class="tw-btn" id="tw-next">' + (R.done ? "Новый забег" : "Дальше →") + '</button>';
    }
    $("tw-body").innerHTML = html;
    if (!twRes) {
      $("tw-calm").onclick = () => twFight(false);
      if ($("tw-risk")) $("tw-risk").onclick = () => twFight(true);
    } else {
      $("tw-next").onclick = () => {
        const done = twRes.done; twRes = null; if (done) twSel = []; twRender();
      };
    }
  }

  async function twFight(risk) {
    if (twBusy) return;
    twBusy = true;
    try { const out = await act("tower_fight", { risk: !!risk }); if (out) { twRes = out; try { hapN(out.win ? "success" : "error"); } catch (e) {} twRender(); } }
    catch (e) { toast(e.message || "Бой не получился"); }
    finally { twBusy = false; }
  }

  function twShop(T) {
    const items = (T.shopDef || []).map(it => {
      const own = it.k === "keeper" ? T.shop.keeper : it.k === "frame" ? (S.frames || []).includes("tower") : it.k === "title" ? (S.titles || []).includes("tower") : 0;
      const can = !own && (T.sig | 0) >= it.cost;
      return '<div class="tw-item"><b>' + it.ic + " " + esc(it.n) + '</b><small>' + esc(it.d) + '</small>' +
        '<button type="button" class="tw-btn sm' + (can ? "" : " ghost") + '" data-shop="' + it.k + '"' + (can ? "" : " disabled") + '>' +
        (own ? "Куплено" : "🏅 " + it.cost) + '</button></div>';
    }).join("");
    $("tw-body").innerHTML =
      '<div class="tw-h">🏅 Печати Башни: <span style="color:#ffd60a">' + (T.sig | 0) + '</span></div>' +
      '<div class="tw-note">Печати дают за 5-й этаж и топ недели. За звёзды они не продаются.</div>' +
      '<div class="tw-shop">' + items + '</div>' +
      '<div class="tw-h">Попытки за звёзды</div>' +
      '<div class="tw-sn"><span class="ic">🔑</span><span><b>Ключ Башни · 199⭐</b><small>+1 забег</small></span><button type="button" class="tw-btn sm" data-buy="key">Купить</button></div>' +
      '<div class="tw-sn"><span class="ic">🛡</span><span><b>Набор Стража · 499⭐</b><small>+2 забега и карта</small></span><button type="button" class="tw-btn sm" data-buy="set">Купить</button></div>' +
      '<div class="tw-sn"><span class="ic">👑</span><span><b>Пропуск 7 дней · 899⭐</b><small>+1 бесплатный забег в день</small></span><button type="button" class="tw-btn sm" data-buy="pass">Купить</button></div>' +
      '<div class="tw-note">Покупки дают только попытки и косметику, не силу. Лимит 3 платных забега в день.</div>';
    $("tw-body").querySelectorAll("[data-shop]").forEach(b => b.onclick = () => twShopBuy(b.dataset.shop));
    $("tw-body").querySelectorAll("[data-buy]").forEach(b => b.onclick = () => twInvoice(b.dataset.buy));
  }

  async function twShopBuy(k) {
    if (twBusy) return; twBusy = true;
    try { const r = await act("tower_shop", { item: k }); if (r) { toast(k === "keeper" ? "🛡 Хранитель Башни получен!" : "Куплено"); try { hapN("success"); } catch (e) {} twRender(); } }
    catch (e) { toast(e.message || "Не получилось"); }
    finally { twBusy = false; }
  }

  async function twInvoice(kind) {
    if (twBusy) return; twBusy = true;
    try {
      const inv = await act("invoice", { item: "tower_" + kind });
      if (!inv) return;
      if (inv.sim) { const r = await act("pay_sim", { pid: inv.pid }); if (r) { toast("Покупка получена"); twRender(); } return; }
      if (!tg || !tg.openInvoice) { toast("Оплата работает в Telegram"); return; }
      tg.openInvoice(inv.link, async status => {
        if (status === "paid") {
          toast("Оплата прошла, выдаю…");
          for (let i = 0; i < 15; i++) { const r = await act("pay_status", { pid: inv.pid }); if (r && (r.status === "done" || r.status === "refund")) { toast(r.status === "done" ? "Покупка получена" : "Звёзды вернулись"); twRender(); return; } await new Promise(z => setTimeout(z, 1000)); }
        } else if (status === "failed") toast("Оплата не прошла, звёзды не списаны");
      });
    } catch (e) { toast(e.message || "Не получилось"); }
    finally { twBusy = false; }
  }

  function twTopView(T) {
    if (!twTop) {
      $("tw-body").innerHTML = '<div class="tw-h">📊 Топ недели</div><div class="tw-load">Загружаю…</div>';
      twLoadTop(); return;
    }
    const rows = (twTop.top || []).map(r => '<div class="tw-row' + (r.uid === S.uid ? " me" : "") + '"><span class="pl">' + r.place + '</span><span class="nm">' + esc(r.name) + '</span><span class="vl">этаж ' + r.best + ' · 🏅' + r.sig + ' · ' + r.runs + ' з.</span></div>').join("");
    $("tw-body").innerHTML =
      '<div class="tw-h">📊 Топ недели <span style="font-size:11px;color:#aeb8e0">' + esc(twTop.wk || "") + '</span></div>' +
      '<div class="tw-note">Лучший этаж за неделю. Тай-брейк: печати → меньше забегов → раньше время. Топ-6 в воскресенье играют турнир.</div>' +
      (rows || '<div class="tw-load">На этой неделе ещё нет результатов. Сыграй забег!</div>') +
      (twTop.me && !(twTop.top || []).some(x => x.uid === S.uid) ? '<div class="tw-row me"><span class="pl">' + twTop.me.place + '</span><span class="nm">Ты</span><span class="vl">этаж ' + twTop.me.best + ' · 🏅' + twTop.me.sig + ' · ' + twTop.me.runs + ' з.</span></div>' : "") +
      '<button type="button" class="tw-btn ghost" id="tw-refresh">Обновить</button>';
    $("tw-refresh").onclick = () => { twTop = null; twRender(); };
  }

  async function twLoadTop() {
    try { const r = await act("tower_top", {}); twTop = r || { top: [] }; }
    catch (e) { twTop = { top: [] }; toast(e.message || "Топ не загрузился"); }
    if (twTab === "top") twRender();
  }

  // меню: «Башня» в первой группе
  try {
    if (typeof MENU_GROUPS !== "undefined" && MENU_GROUPS[0] && MENU_GROUPS[0][1]) {
      if (!MENU_GROUPS[0][1].some(x => x.k === "tower")) MENU_GROUPS[0][1].unshift({ k: "tower", ic: "🏰", n: "Башня", c: ["#ffd60a", "#c4100a"] });
    }
  } catch (e) {}
  const _mg = window.menuGo;
  if (typeof _mg === "function") {
    window.menuGo = function (k) {
      if (k === "tower") { try { menuClose(); } catch (e) {} return twOpen(); }
      return _mg.apply(this, arguments);
    };
  }
  // deep link ?tower=1
  try {
    if (new URLSearchParams(location.search).has("tower") || location.hash === "#tower") {
      setTimeout(() => { if (window.S) twOpen(); }, 900);
    }
  } catch (e) {}
})();
