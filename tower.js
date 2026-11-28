/* 🏰 Башня испытаний — клиент. Ветка feat/tower. */
(function () {
  if (window.__TOWER_UI__) return;
  window.__TOWER_UI__ = 1;
  const $ = id => document.getElementById(id);
  const esc = t => String(t == null ? "" : t).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

  const css = `
  #tower{position:fixed;inset:0;z-index:90;display:flex;justify-content:center;box-sizing:border-box;padding-top:max(var(--st,0px),env(safe-area-inset-top,0px),calc(var(--tg-safe-area-inset-top,0px) + var(--tg-content-safe-area-inset-top,0px)));background:rgba(4,6,20,.74);backdrop-filter:blur(3px)}
  html.tgfs #tower{padding-top:max(92px,var(--st,0px),calc(var(--tg-safe-area-inset-top,0px) + var(--tg-content-safe-area-inset-top,0px)))}
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
  .tw-nav{position:absolute;left:0;right:0;bottom:0;display:flex;gap:4px;padding:7px 10px calc(7px + env(safe-area-inset-bottom));background:linear-gradient(180deg,rgba(12,18,48,.6),#0c1230 40%);border-top:2px solid #2a3260}
  .tw-nav button{flex:1;border:2px solid #3a447a;border-radius:10px;background:#0a0f28;color:#aeb8e0;font-weight:900;font-size:11px;padding:7px 4px}
  .tw-pay{position:absolute;inset:0;z-index:5;background:rgba(0,0,0,.6);display:flex;align-items:flex-end;justify-content:center}
  .tw-pay-b{width:100%;max-width:540px;background:#111738;border-top:3px solid #ffd60a;border-radius:18px 18px 0 0;padding:16px 16px calc(16px + env(safe-area-inset-bottom));display:flex;flex-direction:column;gap:9px;color:#e8ecff}
  .tw-pay-b p{margin:0;font-size:13px;color:#aeb8e0}.tw-pay-b button{border:2px solid #ffd60a;border-radius:12px;background:#ffd60a;color:#1a1408;font-weight:900;font-size:15px;padding:12px}
  .tw-pay-b button[data-pb=tg]{background:#2a9df4;border-color:#2a9df4;color:#fff}.tw-pay-b .tw-pay-x{background:transparent;border-color:#3a447a;color:#aeb8e0}
  .tw-nav button.tw-exit{flex:0 0 34px;font-size:15px!important;border-color:#7a2a3a;color:#ff9aa8;background:#2a0f18}
  .tw-nav button.on{border-color:#ffd60a;color:#ffd60a;background:#1a2250}
  .tw-nav button{font-size:10px;white-space:nowrap;padding:7px 2px}
  .tw-load{text-align:center;color:#9aa6d0;font-size:12px;padding:20px}
  .tw-m{background:#0c1230;border:1.5px solid #2a3260;border-radius:11px;padding:8px;margin:6px 0}
  .tw-mh{font-size:10px;font-weight:900;color:#ffd60a;display:flex;justify-content:space-between;gap:6px}
  .tw-mh small{color:#9aa6d0;font-weight:700}
  .tw-vs{display:flex;align-items:center;gap:6px;margin-top:4px;font-size:12px}
  .tw-vs .nm{flex:1;font-weight:800;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
  .tw-vs .nm.win{color:#34c759}.tw-vs .nm.lose{color:#6a76a0}
  .tw-vs .sc{font-family:var(--display);font-size:14px;color:#ffd60a;min-width:28px;text-align:center}
  .tw-rd{display:grid;grid-template-columns:54px 1fr 54px;gap:5px;align-items:center;margin-top:5px;font-size:10px;color:#aeb8e0}
  .tw-rd .minic{width:54px}
  .tw-rd .mid{text-align:center;font-weight:900;color:#ffd60a}
  .tw-rd .pa{text-align:right}.tw-rd .pb{text-align:left}
  .tw-champ{background:linear-gradient(135deg,#3a1a8a,#b64024);border:2px solid #ffd60a;border-radius:12px;padding:8px;margin:8px 0;text-align:center}
  .tw-champ b{font-family:var(--display);font-size:16px;color:#ffd60a}
  .tw-champ .minic{width:120px;margin:6px auto}
  .tw-btn.ready{background:linear-gradient(135deg,#34c759,#157a35);color:#fff;border-color:#9ff7b6}
  .tw-sn{display:flex;gap:8px;align-items:center;background:#0c1230;border:1.5px solid #2a3260;border-radius:11px;padding:8px;margin-bottom:8px}
  .tw-sn .ic{font-size:24px}
  .tw-sn b{display:block;font-size:12px}.tw-sn small{display:block;color:#9aa6d0;font-size:10px}
  .tw-sn .tw-btn{margin:0;flex:0 0 auto;width:auto;padding:6px 10px;font-size:11px}
  .tw-arena-ban{position:relative;background:linear-gradient(135deg,#3a1a8a,#b3122f 60%,#ff7a1a);border:2px solid #ffd60a;border-radius:14px;padding:10px;margin-bottom:9px;text-align:center;overflow:hidden}
  .tw-arena-ban b{display:block;font-family:var(--display);font-size:22px;letter-spacing:.5px;color:#ffd60a;text-shadow:0 2px 0 #3a0a12}
  .tw-arena-ban small{display:block;color:#ffe9b0;font-size:11px;font-weight:800;margin-top:2px}
  .tw-arena-clock{font-family:var(--display);font-size:30px;color:#fff;line-height:1.1;margin:4px 0}
  .tw-arena-clock small{font-family:inherit;font-size:10px;color:#ffd8a0;font-weight:800;letter-spacing:1px}
  .tw-arena-grid{display:grid;grid-template-columns:1fr 1fr;gap:5px;margin:6px 0}
  .tw-arena-pl{display:flex;align-items:center;gap:5px;background:#0c1230;border:1.5px solid #2a3260;border-radius:8px;padding:4px 6px;font-size:11px;min-width:0}
  .tw-arena-pl.me{border-color:#ffd60a;background:#1a2250}
  .tw-arena-pl .n{flex:1;font-weight:800;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
  .tw-arena-pl .p{color:#9aa6d0;font-size:10px;white-space:nowrap}
  .tw-arena-pl .i{width:16px;text-align:center;color:#7a86b8;font-size:10px;font-weight:900}
  .tw-arena-my{background:linear-gradient(135deg,#1a2250,#2a0a12);border:2px solid #ffd60a;border-radius:12px;padding:9px;margin:7px 0}
  .tw-arena-my h3{font-family:var(--display);font-size:16px;color:#ffd60a;margin:0 0 4px}
  .tw-arena-my .vs{font-size:12px;color:#dfe6ff;margin-bottom:5px}
  .tw-stance{display:grid;grid-template-columns:repeat(3,1fr);gap:5px;margin:5px 0}
  .tw-stance button{border:2px solid #3a447a;background:#0a0f28;color:#dfe6ff;border-radius:9px;padding:7px 3px;font-size:11px;font-weight:900;cursor:pointer}
  .tw-stance button.on{border-color:#ffd60a;background:#3a2a10;color:#ffd60a;box-shadow:0 0 0 2px #ffd60a inset}
  .tw-pq{display:grid;gap:5px;margin:5px 0}
  .tw-pq button{text-align:left;border:2px solid #2a3260;background:#0a0f28;color:#dfe6ff;border-radius:9px;padding:7px 8px;font-size:11px;font-weight:800;cursor:pointer;line-height:1.25}
  .tw-pq button.on{border-color:#7ec8ff;background:#102a4a;color:#fff}
  .tw-arena-log{margin-top:5px;border-top:1px dashed #2a3260;padding-top:5px}
  .tw-arena-log .lr{display:flex;align-items:center;gap:4px;font-size:10px;color:#aeb8e0;margin:3px 0}
  .tw-arena-log .lr .minic{width:34px;flex:0 0 auto}
  .tw-arena-log .lr .d{font-family:var(--display);font-size:12px;color:#ffd60a;min-width:34px;text-align:center}
  .tw-arena-log .lr .ev{font-size:9px;color:#ff9a5a;font-weight:900}
  .tw-arena-prize{font-size:11px;color:#dfe6ff;line-height:1.4;padding:4px 6px;border-left:3px solid #ffd60a;background:#0c1230;border-radius:6px;margin:4px 0}
  .tw-arena-champ{background:linear-gradient(135deg,#3a1a8a,#b64024);border:2px solid #ffd60a;border-radius:12px;padding:10px;margin:8px 0;text-align:center}
  .tw-arena-champ b{display:block;font-family:var(--display);font-size:18px;color:#ffd60a}
  .tw-arena-champ small{color:#ffe9b0;font-size:11px;font-weight:800}
  .tw-arena-tag{display:inline-block;font-size:9px;font-weight:900;border-radius:5px;padding:1px 4px;background:#2a3260;color:#aeb8e0;margin-left:4px}
  .tw-arena-tag.live{background:#b3122f;color:#fff}
  .tw-arena-tag.win{background:#157a35;color:#fff}
  @media(max-width:380px){.tw-cards{grid-template-columns:repeat(2,1fr)}}
  `;

  let twSel = [], twTab = "main", twRes = null, twTop = null, twBusy = false, twTourData = null, twTourTimer = 0;
  let twArena = null, twArenaTimer = 0, twArenaSel = { id: "", st: null, q: null }, twArenaBusy = false;

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
        if (e.target.closest("[data-exit]")) { twClose(); return; }
        const b = e.target.closest("[data-tab]"); if (!b) return;
        twTab = b.dataset.tab; twRes = null; twRender();
      };
    }
    return el;
  }

  function twOpen(tab) {
    if (!S || !S.tower) { toast("Башня ещё не подключена. Обнови игру"); return; }
    const el = ensure(); el.hidden = false; twTab = tab === "arena" ? "arena" : "main"; twRes = null; twTop = null; twTourData = null; twArena = null; twArenaRoster = null; twArenaSel = { id: "", st: null, q: null }; twRender(); twTgBack(true);
    try { hap("light"); } catch (e) {}
  }
  const twBackBtn = () => { if (twTab !== "main") { twTab = "main"; twRes = null; twRender(); } else twClose(); };
  function twTgBack(on) { try { const B = tg && tg.BackButton; if (!B) return; B.offClick(twBackBtn); if (on) { B.onClick(twBackBtn); B.show(); } else B.hide(); } catch (e) {} }
  function twClose() { const el = $("tower"); if (el) el.hidden = true; twTgBack(false); twStopTour(); twStopArena(); }
  window.twOpen = twOpen;
  window.twClose = twClose;

  function twNav() {
    const T = S.tower || {};
    return '<button type="button" data-tab="main" class="' + (twTab === "main" ? "on" : "") + '">🏰 Забег</button>' +
      '<button type="button" data-tab="shop" class="' + (twTab === "shop" ? "on" : "") + '">🏅 Магазин</button>' +
      '<button type="button" data-tab="top" class="' + (twTab === "top" ? "on" : "") + '">📊 Топ</button>' +
      '<button type="button" data-tab="tour" class="' + (twTab === "tour" ? "on" : "") + '">🏆 Турнир</button>' +
      '<button type="button" data-tab="arena" class="' + (twTab === "arena" ? "on" : "") + '">⚔️ Арена</button>' +
      '<button type="button" data-tab="rules">📖 Правила</button>' +
      '<button type="button" data-exit="1" class="tw-exit" aria-label="Выйти">✕</button>';
  }

  function twRender() {
    const el = ensure();
    if (el.hidden) return;
    const T = S && S.tower;
    if (!T) { $("tw-body").innerHTML = '<p class="tw-note">Башня не подключена. Обнови игру.</p>'; return; }
    $("tw-sig").innerHTML = "🏅 <b>" + (T.sig | 0) + "</b>";
    $("tw-nav").innerHTML = twNav();
    if (twTab !== "tour") twStopTour();
    if (twTab !== "arena") twStopArena();
    if (twTab === "rules") { try { twClose(); openTowerRules(); } catch (e) {} twTab = "main"; return; }
    if (twTab === "shop") { twShop(T); return; }
    if (twTab === "top") { twTopView(T); return; }
    if (twTab === "tour") { twTourView(T); return; }
    if (twTab === "arena") { twArenaView(T); return; }
    twStopTour();
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
      '<div class="tw-sn"><span class="ic">👑</span><span><b>Пропуск 7 дней · 899⭐</b><small>+1 бесплатный забег/день · +20% 💠</small></span><button type="button" class="tw-btn sm" data-buy="pass">Купить</button></div>' +
      '<div class="tw-note">Покупки дают только попытки и косметику, не силу. Лимит 3 платных забега в день.</div>';
    $("tw-body").querySelectorAll("[data-shop]").forEach(b => b.onclick = () => twShopBuy(b.dataset.shop));
    $("tw-body").querySelectorAll("[data-buy]").forEach(b => b.onclick = () => twInvoice(b.dataset.buy));
  }

  async function twShopBuy(k) {
    if (twBusy) return; twBusy = true;
    try { const r = await act("tower_shop", { item: k }); if (r) { toast(k === "keeper" ? "🛡 Хранитель Башни: «" + ((r.card && HEROES[r.card.h] && HEROES[r.card.h][0]) || "легендарная карта") + "» — ищи в «Картах»" : "Куплено"); try { hapN("success"); } catch (e) {} twRender(); } }
    catch (e) { toast(e.message || "Не получилось"); }
    finally { twBusy = false; }
  }

  function twPayChoice(kind) {
    const n = (S && S.starBal) || 0;
    if (!n || !ONLINE) return twInvoice(kind, 1);
    let m = $("tw-pay"); if (m) m.remove();
    m = document.createElement("div"); m.id = "tw-pay"; m.className = "tw-pay";
    m.innerHTML = '<div class="tw-pay-b"><b>Как оплатить?</b><p>На игровом балансе <b>⭐ ' + n + '</b>. Если не хватит — оплати через Telegram.</p><button type="button" data-pb="bal">⭐ С игрового баланса</button><button type="button" data-pb="tg">Через Telegram</button><button type="button" data-pb="x" class="tw-pay-x">Отмена</button></div>';
    m.onclick = async e => {
      const b = e.target.closest("[data-pb]"); if (!b && e.target !== m) return;
      const w = b ? b.dataset.pb : "x"; m.remove();
      if (w === "tg") return twInvoice(kind, 1);
      if (w !== "bal" || twBusy) return;
      twBusy = true;
      try { const r = await act("pay_bal", { item: "tower_" + kind }); if (r) { toast("Покупка получена"); try { hapN("success"); } catch (e) {} twRender(); } }
      catch (e) { toast(e.message || "Не получилось"); }
      finally { twBusy = false; }
    };
    $("tower").appendChild(m);
  }

  async function twInvoice(kind, direct) {
    if (!direct) return twPayChoice(kind);
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

  /* ⚔️ Арена 20:30 */
  let twArenaRoster = null, twArenaCards = [];
  function twStopArena() { if (twArenaTimer) { clearInterval(twArenaTimer); twArenaTimer = 0; } }
  function twArenaClock(ms) { const s = Math.max(0, Math.ceil(ms / 1000)); return Math.floor(s / 60) + ":" + String(s % 60).padStart(2, "0"); }
  function twArenaLoad() {
    act("tower_arena_get", {}).then(r => { if (r) { twArena = r; if (twTab === "arena") twRender(); } })
      .catch(e => toast(e.message || "Арена не загрузилась"));
  }
  function twArenaPoll() {
    if (twArenaTimer) return;
    twArenaTimer = setInterval(async () => {
      if (twTab !== "arena") { twStopArena(); return; }
      if (twArenaRoster || twArenaBusy) return;
      try { const r = await act("tower_arena_get", {}); if (r) { twArena = r; twRender(); } } catch (e) {}
    }, 2500);
  }
  async function twArenaEdit() {
    if (twArenaBusy) return;
    twArenaBusy = true;
    try {
      const r = await act("tower_arena_roster", {});
      if (!r || twTab !== "arena") return;
      twArenaRoster = r.cards;
      const available = new Set(r.cards.map(c => c.id));
      twArenaCards = (twArena.me.squad || []).map(c => c.id).filter(id => available.has(id));
      twRender();
    } finally { twArenaBusy = false; }
  }
  async function twArenaJoin() {
    if (twArenaBusy || twArenaCards.length !== 3) return;
    twArenaBusy = true;
    try {
      const r = await act("tower_arena_join", { cards: twArenaCards });
      if (r) {
        toast(r.updated ? "✅ Состав сохранён" : "⚔️ Ты в Арене!");
        twArenaRoster = null;
        twArenaLoad();
      }
    } finally { twArenaBusy = false; }
  }
  function twArenaCardLabel(c) {
    return esc((HEROES[c.h] || ["Карта"])[0]) + " №" + esc(c.sn) + " · " + c.pow;
  }
  function twArenaEditor() {
    if (twArenaRoster.length < 3) return '<div class="tw-note">Для Арены нужны 3 доступные карты.</div>' +
      '<button type="button" class="tw-btn ghost" id="tw-arena-cancel">Назад</button>';
    const selected = new Set(twArenaCards);
    const byId = new Map(twArenaRoster.map(c => [c.id, c]));
    return '<div class="tw-note">Выбери 3 карты в порядке раундов. Число рядом с картой — её сила на Арене.</div>' +
      twArenaCards.map((id, i) => '<div class="tw-row"><span class="nm">' + (i + 1) + '. ' + twArenaCardLabel(byId.get(id)) +
        '</span><button type="button" class="tw-btn ghost" data-arena-remove="' + i + '">Убрать</button></div>').join("") +
      (twArenaCards.length < 3 ? '<select id="tw-arena-card" aria-label="Добавить карту" style="max-width:100%;width:100%;min-height:44px">' +
        '<option value="">Добавить карту</option>' + twArenaRoster.filter(c => !selected.has(c.id))
          .map(c => '<option value="' + c.id + '">' + twArenaCardLabel(c) + '</option>').join("") + '</select>' : '') +
      '<button type="button" class="tw-btn ghost" id="tw-arena-auto"' + (twArenaRoster.length < 3 ? ' disabled' : '') + '>Выбрать сильнейших</button>' +
      '<button type="button" class="tw-btn red" id="tw-arena-save"' + (twArenaCards.length !== 3 ? ' disabled' : '') + '>Подтвердить состав</button>' +
      '<button type="button" class="tw-btn ghost" id="tw-arena-cancel">Назад</button>';
  }
  function twBindArenaEditor() {
    $("tw-arena-cancel").onclick = () => { twArenaRoster = null; twArenaLoad(); };
    if (!$("tw-arena-auto")) return;
    const select = $("tw-arena-card");
    if (select) select.onchange = () => {
      if (select.value) { twArenaCards.push(Number(select.value)); twRender(); }
    };
    $("tw-body").querySelectorAll("[data-arena-remove]").forEach(button => button.onclick = () => {
      twArenaCards.splice(Number(button.dataset.arenaRemove), 1);
      twRender();
    });
    $("tw-arena-auto").onclick = () => { twArenaCards = twArenaRoster.slice(0, 3).map(c => c.id); twRender(); };
    $("tw-arena-save").onclick = twArenaJoin;
  }
  async function twArenaPick() {
    const D = twArena; if (!D || !D.me.active || twArenaBusy) return;
    if (twArenaSel.st == null || twArenaSel.q == null) { toast("Выбери стойку и ответ"); return; }
    twArenaBusy = true;
    try {
      const r = await act("tower_arena_pick", { match: D.me.active, st: twArenaSel.st, ans: twArenaSel.q });
      if (r) { toast("✅ Выбор принят"); try { hapN("success"); } catch (e) {} twArena = null; twArenaSel = { id: "", st: null, q: null }; await new Promise(z => setTimeout(z, 250)); twArenaLoad(); }
    } catch (e) { toast(e.message || "Не получилось"); }
    finally { twArenaBusy = false; }
  }
  function twArenaPrizes(D) {
    const med = ["🥇", "🥈", "🥉", "4️⃣"];
    let h = '<div class="tw-h">Награды</div>';
    for (const p of (D.prizes || [])) h += '<div class="tw-arena-prize">' + (p.p ? med[p.p - 1] : "🎴") + " " + esc(p.txt) + '</div>';
    return h;
  }
  function twArenaRules() {
    return '<div class="tw-h">Правила Арены</div>' +
      '<p class="tw-note"><b>Запись.</b> Подтверди состав, чтобы занять одно из 30 мест. Если все места заняты, сетка соберётся в 20:30 по Минску или сразу после заполнения, если оно произошло позже. Иначе набор закроется в 20:45.</p>' +
      '<p class="tw-note"><b>Состав.</b> Выбери три разные карты или нажми «Выбрать сильнейших». Состав можно изменить до закрытия набора. Порядок определяет раунды: первая карта играет против первой, вторая против второй, третья против третьей. Гемы на Арене не учитываются.</p>' +
      '<p class="tw-note"><b>Тактика.</b> Выбери стойку и ответь на загадку до окончания таймера. 🔥 Натиск побеждает 🌀 Обман, 🌀 Обман побеждает 🛡 Стену, 🛡 Стена побеждает 🔥 Натиск. Верная загадка даёт +25% к урону, выигрышная стойка — +15%. Бонусы перемножаются. Если пропустить выбор, бонусы за него не начислятся.</p>' +
      '<p class="tw-note"><b>Результат.</b> Урон зависит от силы карт, тактики и случайных боевых эффектов. Побеждает тот, кто выиграл больше раундов. При равном счёте сравнивается суммарный урон, затем стойки и ответы на загадку. Если всё равно ничья, победителя определяет жребий.</p>';
  }
  function twArenaPlayers(D) {
    if (!D.players || !D.players.length) return "";
    let h = '<div class="tw-h">Участники · ' + D.count + '/' + D.max + '</div><div class="tw-arena-grid">';
    for (let i = 0; i < D.max; i++) {
      const p = D.players[i];
      h += p ? '<div class="tw-arena-pl' + (p.uid === D.me.uid ? " me" : "") + '"><span class="i">' + (i + 1) + '</span><span class="n">' + esc(p.name) + '</span><span class="p">' + p.pow + '</span></div>'
        : '<div class="tw-arena-pl" style="opacity:.45"><span class="i">' + (i + 1) + '</span><span class="n">свободно</span><span class="p">—</span></div>';
    }
    return h + '</div>';
  }
  function twArenaActive(D, m, now) {
    const opp = m.a === D.me.uid ? m.bn : m.an;
    let h = '<div class="tw-arena-my"><h3>⚔️ Твой бой</h3><div class="vs">Ты против <b>' + esc(opp) + '</b></div>' +
      '<div class="tw-note">До конца боя: <b style="color:#ffd60a">' + twArenaClock(m.deadline - now) + '</b>. Не успел — бой решится по силе карт.</div>';
    if (D.me.pick) {
      h += '<div class="tw-note" style="color:#9ff7b6">✅ Выбор принят: ' + esc((D.stances || [])[D.me.pick.s] || "—") + ' · ответ ' + ((D.me.pick.q | 0) + 1) + '. Ждём соперника…</div>';
    } else if (D.me.puzzle) {
      h += '<div class="tw-h" style="margin:6px 0 2px">Стойка</div><div class="tw-stance">' +
        (D.stances || []).map((s, i) => '<button type="button" data-st="' + i + '" class="' + (twArenaSel.st === i ? "on" : "") + '">' + (i === 0 ? "🔥" : i === 1 ? "🛡" : "🌀") + " " + esc(s) + '</button>').join("") + '</div>' +
        '<div class="tw-h" style="margin:8px 0 2px">Загадка</div><div class="tw-note">' + esc(D.me.puzzle.q) + '</div><div class="tw-pq">' +
        D.me.puzzle.o.map((o, i) => '<button type="button" data-q="' + i + '" class="' + (twArenaSel.q === i ? "on" : "") + '">' + String.fromCharCode(65 + i) + ') ' + esc(o) + '</button>').join("") + '</div>' +
        '<button type="button" class="tw-btn red" id="tw-arena-go"' + (twArenaSel.st == null || twArenaSel.q == null ? " disabled" : "") + '>⚔️ Подтвердить выбор</button>';
    }
    return h + '<div class="tw-note">Правильный ответ: +25% к силе. Победа в стойке: +15%.</div></div>';
  }
  function twArenaMatch(D, m) {
    const my = m.a === D.me.uid || m.b === D.me.uid;
    const aw = m.done && m.winner === m.a, bw = m.done && m.winner === m.b;
    const score = m.score ? m.score[0] + ":" + m.score[1] : "—";
    let st = "";
    if (m.done) st = m.winner ? (m.auto ? "авто" : "победа") : "нет игроков";
    else if (Date.now() < m.start) st = "старт " + twHM(m.start);
    else st = "идёт · " + twArenaClock(m.deadline - Date.now());
    let h = '<div class="tw-m"' + (my ? ' style="border-color:#ffd60a"' : '') + '><div class="tw-mh"><span>' + (m.round === "final" ? "🏆 Финал" : m.round === "bronze" ? "🥉 За 3 место" : m.round === "playin" ? "Play-in" : "Бой") + (my ? ' <span class="tw-arena-tag live">ТЫ</span>' : '') + '</span><small>' + st + '</small></div>' +
      '<div class="tw-vs"><span class="nm ' + (aw ? "win" : m.done && m.a ? "lose" : "") + '">' + esc(m.an) + '</span><span class="sc">' + score + '</span><span class="nm ' + (bw ? "win" : m.done && m.b ? "lose" : "") + '" style="text-align:right">' + esc(m.bn) + '</span></div>';
    if (m.dmg) h += '<div class="tw-note" style="text-align:center;margin:2px 0 0">урон ' + m.dmg[0] + ' : ' + m.dmg[1] + '</div>';
    if (m.log && m.log.length) {
      h += '<div class="tw-arena-log">' + m.log.map(r => {
        const ea = r.evA === "crit" ? "💥" : r.evA === "block" ? "🛡" : r.evA === "combo" ? "⚡" : "";
        const eb = r.evB === "crit" ? "💥" : r.evB === "block" ? "🛡" : r.evB === "combo" ? "⚡" : "";
        return '<div class="lr">' + (r.a ? miniSlot(r.a) : "") + '<span class="d">' + r.da + '</span><span style="color:#7a86b8">:</span><span class="d">' + r.db + '</span>' + (r.b ? miniSlot(r.b) : "") + '<span class="ev">' + ea + eb + '</span></div>';
      }).join("") + '</div>';
    }
    if (m.done && m.correctText) h += '<div class="tw-note" style="margin:3px 0 0">Загадка: верный ответ — ' + esc(m.correctText) + '</div>';
    return h + '</div>';
  }
  function twArenaBracket(D) {
    const order = ["playin", "r32", "r16", "r8", "r4", "final", "bronze"];
    const labels = { playin: "Play-in", r32: "1/16 финала", r16: "1/8 финала", r8: "1/4 финала", r4: "Полуфиналы", final: "Финал", bronze: "За 3 место" };
    let h = '<div class="tw-h">Сетка</div>', any = false;
    for (const key of order) {
      const ms = (D.matches || []).filter(m => m.round === key);
      if (!ms.length) continue;
      any = true;
      h += '<div class="tw-note" style="margin:8px 0 3px;color:#ffd60a;font-weight:900">' + labels[key] + '</div>';
      for (const m of ms) h += twArenaMatch(D, m);
    }
    if (!any) h += '<div class="tw-note">Сетка появится после закрытия набора.</div>';
    return h;
  }
  function twArenaView(T) {
    if (!twArena) {
      $("tw-body").innerHTML = '<div class="tw-arena-ban"><b>⚔️ АРЕНА</b><small>Турнир на 30 мест</small></div><div class="tw-load">Загружаю…</div>';
      twArenaLoad(); return;
    }
    const D = twArena, now = Date.now();
    let h = '<div class="tw-arena-ban"><b>⚔️ АРЕНА 20:30</b><small>Турнир на 30 мест · стойка + загадка + 3 раунда</small></div>';
    if (D.phase === "wait") {
      h += '<div class="tw-arena-clock">' + twArenaClock(D.regOpen - now) + '<small>ДО ОТКРЫТИЯ</small></div>' +
        '<div class="tw-note">В сетку попадут первые 30 игроков, подтвердивших состав. Набор закроется в 20:45. Если 30 не наберётся — старт в 20:45 с теми, кто есть. Турнир состоится в любом случае.</div>' +
        twArenaPrizes(D) + twArenaRules();
      $("tw-body").innerHTML = h; twArenaPoll(); return;
    }
    if (D.phase === "reg") {
      const left = Math.max(0, D.regClose - now), slots = Math.max(0, D.max - D.count);
      h += '<div class="tw-arena-clock">' + twArenaClock(left) + '<small>ДО ЗАКРЫТИЯ НАБОРА</small></div>' +
        '<div class="tw-note">Свободно мест: <b style="color:#ffd60a">' + slots + '</b> из ' + D.max + ' · уже в турнире: <b>' + D.count + '</b> · сейчас в игре: <b>' + D.online + '</b></div>' +
        '<div class="tw-note">Турнир состоится в любом случае. Если 30 не наберётся, старт в 20:45 с теми, кто есть. Минимум нет.</div>';
      if (twArenaRoster) {
        $("tw-body").innerHTML = h + twArenaEditor();
        twBindArenaEditor();
        return;
      }
      if (D.me.joined) {
        h += '<div class="tw-arena-champ"><b>✅ Ты в турнире</b><small>Сила отряда ' + D.me.pow + '</small></div>' +
          (D.me.squad || []).map((c, i) => '<div class="tw-note">' + (i + 1) + '. ' + twArenaCardLabel(c) + '</div>').join('') +
          '<button type="button" class="tw-btn ghost" id="tw-arena-join">Изменить состав</button>';
      } else {
        h += '<button type="button" class="tw-btn red" id="tw-arena-join"' + (slots <= 0 ? " disabled" : "") + '>⚔️ Выбрать состав · осталось ' + slots + '</button>';
      }
      h += twArenaRules() + twArenaPlayers(D) + twArenaPrizes(D);
      $("tw-body").innerHTML = h;
      $("tw-arena-join").onclick = twArenaEdit;
      twArenaPoll(); return;
    }
    if (D.phase === "failed") {
      h += '<div class="tw-arena-champ"><b>⚔️ Арена не состоялась</b><small>Никто не записался в турнир.</small></div>' +
        '<div class="tw-note">Награды не выдаются. Ждём тебя в следующем турнире!</div>' +
        twArenaRules() + twArenaPlayers(D) + twArenaPrizes(D);
      $("tw-body").innerHTML = h;
      twArenaPoll(); return;
    }
    if (D.champion) {
      h += '<div class="tw-arena-champ"><b>👑 ' + esc(D.champion.name) + '</b><small>Чемпион Арены</small></div>';
      if (D.me.place) h += '<div class="tw-note" style="text-align:center">Твоё место: <b style="color:#ffd60a">' + D.me.place + '</b></div>';
    }
    const mine = (D.matches || []).find(m => m.id === D.me.active);
    if (mine && !mine.done) {
      if (twArenaSel.id !== mine.id) twArenaSel = { id: mine.id, st: null, q: null };
      h += twArenaActive(D, mine, now);
    } else if (D.phase === "run" && D.me.joined && !D.champion) {
      h += '<div class="tw-note" style="text-align:center">' + (D.me.place ? "Ты занял " + D.me.place + " место." : D.me.out ? "Ты выбыл. Смотри, чем закончится турнир!" : "Ты в игре. Ждём твой следующий бой…") + '</div>';
    }
    h += twArenaBracket(D);
    if (D.phase === "done") h += twArenaPrizes(D);
    h += twArenaRules();
    $("tw-body").innerHTML = h;
    if ($("tw-arena-go")) $("tw-arena-go").onclick = twArenaPick;
    $("tw-body").querySelectorAll("[data-st]").forEach(b => b.onclick = () => { twArenaSel.st = +b.dataset.st; twRender(); });
    $("tw-body").querySelectorAll("[data-q]").forEach(b => b.onclick = () => { twArenaSel.q = +b.dataset.q; twRender(); });
    twArenaPoll();
  }

  function twStopTour() { if (twTourTimer) { clearInterval(twTourTimer); twTourTimer = 0; } }
  function twTourName(D, uid) { const p = (D.top || []).find(x => x.uid === uid); return p ? p.name : "—"; }
  function twHM(ts) { try { return new Date(ts).toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit", timeZone: "Europe/Minsk" }); } catch (e) { return ""; } }

  function twTourView(T) {
    if (!twTourData) {
      $("tw-body").innerHTML = '<div class="tw-h">🏆 Турнир топ-6</div><div class="tw-load">Загружаю…</div>';
      twLoadTour(); return;
    }
    const D = twTourData, now = Date.now(), top = D.top || [];
    if (D.phase === "none") {
      twStopTour();
      $("tw-body").innerHTML = '<div class="tw-h">🏆 Турнир топ-6</div>' +
        '<div class="tw-note">Топ-6 фиксируется в воскресенье в <b>20:00</b> по Минску. Турнир: 21:00 play-in, 21:15 полуфиналы, 21:30 финал.</div>' +
        (top.length ? '<div class="tw-note">Сейчас в топе: ' + top.slice(0, 6).map((p, i) => (i + 1) + ". " + esc(p.name)).join(" · ") + '</div>' : '') +
        '<div class="tw-note">Сыграй забег, чтобы попасть в топ недели.</div>';
      return;
    }
    const labels = { p1: "Play-in · 3 vs 6", p2: "Play-in · 4 vs 5", s1: "Полуфинал 1", s2: "Полуфинал 2", f: "Финал" };
    const order = ["p1", "p2", "s1", "s2", "f"];
    const rows = order.map(id => {
      const m = (D.matches || {})[id]; if (!m) return "";
      const a = twTourName(D, m.a), b = twTourName(D, m.b);
      const aw = m.done && m.winner && m.winner === m.a, bw = m.done && m.winner && m.winner === m.b;
      const score = m.score ? m.score[0] + ":" + m.score[1] : (m.done && m.winner ? "✓" : "—");
      let st = "";
      if (m.done) st = m.winner ? "победил " + twTourName(D, m.winner) + (m.auto === 1 ? " · неявка" : m.auto === 2 ? " · неявка" : m.auto === 3 ? " · оба не пришли" : "") : "нет игроков";
      else if (now < m.start) st = "старт " + twHM(m.start);
      else if (now <= m.deadline) st = "готовность · " + Math.max(0, Math.ceil((m.deadline - now) / 1000)) + "с";
      else st = "ждём результат";
      const rounds = m.rounds ? m.rounds.map(r => '<div class="tw-rd"><div>' + (r.a ? miniSlot(r.a) : "") + '</div><div class="mid">' + r.pa + " : " + r.pb + '</div><div>' + (r.b ? miniSlot(r.b) : "") + '</div></div>').join("") : "";
      return '<div class="tw-m"><div class="tw-mh"><span>' + labels[id] + '</span><small>' + st + '</small></div>' +
        '<div class="tw-vs"><span class="nm ' + (aw ? "win" : m.done && m.a ? "lose" : "") + '">' + esc(a) + '</span>' +
        '<span class="sc">' + score + '</span>' +
        '<span class="nm ' + (bw ? "win" : m.done && m.b ? "lose" : "") + '" style="text-align:right">' + esc(b) + '</span></div>' + rounds + '</div>';
    }).join("");
    let mine = "";
    if (D.mine) {
      const m = D.mine;
      if (m.ready) mine = '<div class="tw-note" style="color:#9ff7b6">✅ Ты готов. Ждём соперника…</div>';
      else if (now >= m.start - 10 * 60e3 && now <= m.deadline) mine = '<button type="button" class="tw-btn ready" id="tw-ready">✅ Я готов</button>';
      else if (now < m.start - 10 * 60e3) mine = '<div class="tw-note">Готовность откроется за 10 минут до матча.</div>';
      else mine = '<div class="tw-note">Время готовности вышло. Ждём результат.</div>';
    } else if (D.champion) mine = '<div class="tw-note" style="color:#ffd60a">🏆 Турнир завершён.</div>';
    const champ = D.champion ? '<div class="tw-champ"><b>👑 Чемпион: ' + esc(twTourName(D, D.champion)) + '</b>' +
      (D.card ? miniSlot(D.card) : '<div class="tw-note">Карта выдаётся…</div>') + '</div>' : "";
    const phase = { fixed: "Топ-6 зафиксирован", playin: "Play-in", semi: "Полуфиналы", final: "Финал", done: "Завершён", empty: "Нет игроков" }[D.phase] || D.phase;
    $("tw-body").innerHTML = '<div class="tw-h">🏆 Турнир топ-6 <span style="font-size:11px;color:#aeb8e0">' + esc(phase) + '</span></div>' +
      '<div class="tw-note">Воскресенье, Minsk: 20:00 фиксация · 21:00 play-in · 21:15 полуфиналы · 21:30 финал. Не нажал «Готов» до старта +60 секунд — авто-поражение.</div>' +
      mine + champ + rows +
      '<button type="button" class="tw-btn ghost" id="tw-trefresh">Обновить</button>';
    if ($("tw-trefresh")) $("tw-trefresh").onclick = () => { twTourData = null; twRender(); };
    if ($("tw-ready")) $("tw-ready").onclick = () => twTourReady();
    if (D.phase !== "done" && D.phase !== "empty") twStartTourPoll(); else twStopTour();
  }

  async function twLoadTour() {
    try { twTourData = await act("tower_tour_get", {}); }
    catch (e) { twTourData = { phase: "none", top: [] }; toast(e.message || "Турнир не загрузился"); }
    if (twTab === "tour") twRender();
  }
  function twStartTourPoll() {
    if (twTourTimer) return;
    twTourTimer = setInterval(async () => {
      if (twTab !== "tour") { twStopTour(); return; }
      try { const r = await act("tower_tour_get", {}); if (r) { twTourData = r; twRender(); } } catch (e) {}
    }, 2500);
  }
  async function twTourReady() {
    if (twBusy) return; twBusy = true;
    try { await act("tower_tour_ready", {}); toast("✅ Ты готов"); twTourData = null; await twLoadTour(); }
    catch (e) { toast(e.message || "Не получилось"); }
    finally { twBusy = false; }
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
})();
