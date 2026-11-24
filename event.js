/* ЭКРАН ИВЕНТА «ПОКОЛЕНИЕ ЭПОХ» — заменяет старую карту Покорения.
   Подключается после game.js и переопределяет openConq(). */
(function () {
  'use strict';
  if (window.__EV_UI__) return;
  window.__EV_UI__ = 1;

  const css = `
  #ev-wrap{display:flex;flex-direction:column;gap:8px;padding:8px 10px 90px;color:#fff;font-family:Rubik,Arial,sans-serif}
  #ev-head{display:flex;align-items:center;justify-content:space-between;gap:8px}
  #ev-head b{font-family:'Rubik Mono One',Rubik,sans-serif;font-size:15px;color:#ffd23f;letter-spacing:.02em}
  #ev-date{font-size:10px;color:#8f9bb3}
  .ev-tabs{display:flex;gap:6px}
  .ev-tab{flex:1;text-align:center;padding:9px 4px;border-radius:12px;background:#1a1030;border:1px solid #ffffff1a;font-size:11px;font-weight:700;color:#c9d1e6}
  .ev-tab.on{background:linear-gradient(180deg,#ffd23f,#ff9f0a);color:#07040f;border-color:#07040f}
  .ev-box{background:linear-gradient(180deg,#1a1030,#0d0720);border:1px solid #ffd23f33;border-radius:14px;padding:10px}
  .ev-row{display:flex;justify-content:space-between;align-items:center;font-size:11px;color:#c9d1e6;gap:8px}
  .ev-bar{height:9px;background:#ffffff1a;border-radius:6px;overflow:hidden;margin-top:5px}
  .ev-bar i{display:block;height:100%;background:linear-gradient(90deg,#ffd23f,#ff9f0a)}
  .ev-bar.cy i{background:linear-gradient(90deg,#8fe9ff,#3ab0ff)}
  .ev-bar.pk i{background:linear-gradient(90deg,#ff2e63,#ff7ab0)}
  .ev-btn{background:linear-gradient(90deg,#ffd23f,#ff9f0a);color:#07040f;font-weight:900;text-align:center;padding:11px;border-radius:12px;border:2px solid #07040f;box-shadow:0 4px 0 #000;font-size:12px}
  .ev-btn.ghost{background:#1a1030;color:#ffd23f;border:1px solid #ffd23f55;box-shadow:none}
  .ev-btn:disabled{opacity:.45}
  .ev-in{width:100%;background:#07040f;border:1px solid #ffffff22;border-radius:10px;color:#fff;padding:9px;font-size:13px}
  .ev-node{display:flex;align-items:center;gap:8px;padding:6px 0}
  .ev-num{width:26px;height:26px;border-radius:50%;background:#1a1030;border:1px solid #3a2a63;display:grid;place-items:center;font-size:11px;color:#8f9bb3}
  .ev-num.done{background:#2a1a4a;border-color:#ffd23f66;color:#ffd23f}
  .ev-num.now{background:#ff2e63;border-color:#fff;color:#fff}
  .ev-card{width:66px;border-radius:8px;border:2px solid #ffffff22;overflow:hidden;background:#0d0720}
  .ev-card.sel{border-color:#ffd23f;box-shadow:0 0 12px #ffd23f66}
  .ev-card img{width:100%;display:block}
  .ev-cards{display:flex;gap:6px;overflow-x:auto;padding:4px 0}
  .ev-note{font-size:9.5px;color:#7d86a3;margin-top:5px}
  .ev-admin{border-color:#ff2e6355}
  .ev-mini{font-size:9px;color:#8fe9ff}
  `;
  const st = document.createElement('style');
  st.textContent = css;
  document.head.appendChild(st);

  const $ = s => document.querySelector(s);
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const fmt = n => Math.round(+n || 0).toLocaleString('ru-RU').replace(/\u00a0/g, ' ');

  let tab = 'build';
  let data = null;
  let busy = false;
  const sel = new Set();

  async function load() {
    const result = await act('ev_state', {}, 12000);
    if (!result || !Array.isArray(result.segs) || !Array.isArray(result.nodes))
      throw new Error('Не удалось загрузить «Поколение Эпох».');
    data = result;
  }

  function head() {
    const d = data;
    const left = d.open ? 'идёт' : (Date.now() < d.start ? 'откроется ' + new Date(d.start).toLocaleString('ru-RU', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }) : 'завершён');
    return `<div id="ev-head"><b>ПОКОЛЕНИЕ ЭПОХ</b>
      <span id="ev-date">${esc(left)}${d.admin ? ' · тест' : ''} <span id="ev-help" style="display:inline-block;width:18px;height:18px;line-height:16px;text-align:center;border-radius:50%;border:1px solid #ffd23f66;color:#ffd23f;cursor:pointer">?</span> <span style="color:#7d86a3;font-size:9px">ev1</span></span></div>
      <div class="ev-tabs">
        <div class="ev-tab ${tab === 'build' ? 'on' : ''}" data-t="build">🏗 Стройка</div>
        <div class="ev-tab ${tab === 'march' ? 'on' : ''}" data-t="march">🗺 Поход</div>
        <div class="ev-tab ${tab === 'shop' ? 'on' : ''}" data-t="shop">⭐ Магазин</div>
      </div>`;
  }

  function buildTab() {
    const d = data;
    const segs = d.segs.map(s => {
      const p = Math.min(100, Math.round(s.points / s.need * 100));
      return `<div class="ev-row" style="margin-top:8px"><span>${['🔥 Огонь', '❄️ Лёд', '⚡ Буря', '☠️ Яд'][s.i]}</span><span>${p}%</span></div>
        <div class="ev-bar"><i style="width:${p}%"></i></div>`;
    }).join('');
    const cur = d.segs.find(s => !s.done) || d.segs[d.segs.length - 1];
    const clanBox = d.solo
      ? `<div class="ev-box">
          <div class="ev-row"><span>Вольное знамя</span><span>личный трек</span></div>
          <div class="ev-note">Награды 50 %. Вступи в клан — прогресс перенесётся наполовину.</div>
        </div>`
      : `<div class="ev-box">
          <div class="ev-row"><span>Клан «${esc(d.clanName || '—')}»</span><span>${d.clanMembers || 0} участников · активны ${d.clanActive || 0}</span></div>
          <div class="ev-row" style="margin-top:4px"><span>Клан сегодня</span><span>${fmt(d.todayGiven || 0)} / ${fmt(d.clanCap || 6000)}</span></div>
          <div class="ev-bar"><i style="width:${Math.min(100, Math.round((d.todayGiven || 0) / (d.clanCap || 6000) * 100))}%"></i></div>
          <div class="ev-note">${(d.kvorumCount || 0) >= 5 ? '✅ Кворум ' + d.kvorumCount + '/5 — полный урон' : '⚠️ Кворум ' + (d.kvorumCount || 0) + '/5 — урон вполсилы'}</div>
          ${(d.topContrib && d.topContrib.length) ? '<div class="ev-note">Вклад: ' + d.topContrib.map(t => esc(t.name) + ' ' + fmt(t.used)).join(' · ') + '</div>' : ''}
        </div>`;
    return `<div class="ev-box">
      <div class="ev-row"><span>Врата Эпох</span><b style="font-size:22px">${fmt(cur.points)} / ${fmt(cur.need)}</b></div>
      ${segs}
    </div>
    ${clanBox}
    ${d.topClans && d.topClans.length ? `<div class="ev-box">
      <div class="ev-row"><span>🏁 Гонка кланов</span><span class="ev-mini">очки за сезон</span></div>
      ${d.topClans.map((t, i) => `<div class="ev-row" style="margin-top:5px;${t.id === d.clan ? 'color:#ffd23f;font-weight:900' : ''}">
        <span>${i + 1}. ${esc(t.name)} <span class="ev-mini">${t.n} чел.</span></span><span>${fmt(t.points)}</span></div>`).join('')}
    </div>` : ''}
    <div class="ev-box">
      <div class="ev-row"><span>🎁 Призы</span><span class="ev-mini">видны всем</span></div>
      <div class="ev-note">🥇 Первый клан, закрывший сегмент — <b style="color:#ffd23f">Легендарный сундук</b> каждому участнику</div>
      <div class="ev-note">👑 Первый клан, закрывший все 4 сегмента — <b style="color:#ffd23f">Мифический сундук</b> каждому</div>
      <div class="ev-note">🏆 Топ-1 сезона — Мифический · Топ-2 — Легендарный · Топ-3 — Королевский</div>
      <div class="ev-note">🤝 Новичок впервые внёс вклад — клану <b style="color:#ffd23f">+300 очков</b></div>
      <div class="ev-btn ghost" id="ev-invite" style="margin-top:8px">ПОЗВАТЬ ДРУГА В КЛАН</div>
    </div>
    <div class="ev-box">
      <div class="ev-row"><span>Твой вклад сегодня</span><span>${fmt(d.me.used)} / ${fmt(d.me.cap)}</span></div>
      <div class="ev-row" style="margin-top:6px"><span>Монеты</span><span>${fmt(d.cash || 0)}</span></div>
      <div class="ev-row"><span>Осколки</span><span>${fmt(d.shards || 0)}</span></div>
      <input class="ev-in" id="ev-coins" inputmode="numeric" placeholder="Монеты (1000 = 1 очко)" style="margin-top:8px">
      <input class="ev-in" id="ev-shards" inputmode="numeric" placeholder="Осколки (1 = 25 очков)" style="margin-top:6px">
      <div class="ev-btn" id="ev-send" style="margin-top:8px">ВНЕСТИ ВКЛАД</div>
      <div class="ev-note">${d.solo ? 'Вольное знамя: награды 50 %, перенос в клан — 50 % один раз' : 'Кворум: ' + d.kvorum + ' игроков'}</div>
    </div>
    ${d.admin ? `<div class="ev-box ev-admin">
      <div class="ev-row"><span>Админ-проверка</span><span class="ev-mini">сезон ${esc(d.season)}</span></div>
      <div class="ev-btn ghost" data-a="points" style="margin-top:6px">+5000 очков в сегмент</div>
      <div class="ev-btn ghost" data-a="close" style="margin-top:6px">Закрыть первый узел</div>
      <div class="ev-btn ghost" data-a="reset" style="margin-top:6px">Сбросить прогресс ивента</div>
    </div>` : ''}`;
  }

  function marchTab() {
    const d = data;
    const player = data.demo ? {} : (S || {});
    const cards = (player.cards || []).filter(c => Number.isSafeInteger(c.id) && !c.away && !c.listed && !c.lock && !c.list_price && !c.room_id).sort((a, b) => (b.v || 0) - (a.v || 0)).slice(0, 12);
    const available = new Set(cards.map(c => c.id));
    for (const id of sel) if (!available.has(id)) sel.delete(id);
    const list = d.nodes.map(n => {
      const p = Math.min(100, Math.round(n.dmg / n.hp * 100));
      const cls = n.closed ? 'done' : (p > 0 ? 'now' : '');
      return `<div class="ev-node"><div class="ev-num ${cls}">${n.n}</div>
        <div style="flex:1"><div class="ev-row"><span>${n.closed ? 'закрыт' : fmt(n.dmg) + ' / ' + fmt(n.hp)}</span><span>${p}%</span></div>
        <div class="ev-bar ${n.closed ? '' : 'pk'}"><i style="width:${p}%"></i></div></div>
        ${n.closed && n.reward && d.claimable.includes(n.n) ? `<div class="ev-btn" data-claim="${n.n}" style="padding:8px 10px">Забрать</div>` : ''}
      </div>`;
    }).join('');
    const cardsHtml = cards.map(c => `<div class="ev-card ${sel.has(c.id) ? 'sel' : ''}" data-card="${c.id}">
      <img src="" data-cid="${c.id}" alt=""><div style="font-size:8px;text-align:center;color:#c9d1e6">${String(c.id).slice(-3)}</div></div>`).join('');
    const kvLine = d.solo ? 'Вольное знамя' : ((d.kvorumCount || 0) >= 5 ? 'Кворум ' + d.kvorumCount + '/5 — полный урон' : 'Кворум ' + (d.kvorumCount || 0) + '/5 — урон вполсилы');
    return `<div class="ev-box"><div class="ev-row"><span>Узлы</span><span>${d.nodes.filter(n => n.closed).length} / ${d.nodes.length}</span></div>
      <div class="ev-note">${kvLine}</div>${list}</div>
      <div class="ev-box"><div class="ev-row"><span>Отряд (до 3)</span><span class="ev-mini">выбрано ${sel.size}</span></div>
      <div class="ev-cards">${cardsHtml}</div>
      <button type="button" class="ev-btn" id="ev-hit" ${d.open && cards.length ? "" : "disabled"}>В БОЙ</button>
      ${!d.open ? `<div class="ev-note">${Date.now() < d.start ? "Поход откроется с началом ивента." : "Ивент завершён."}</div>` : !cards.length && !d.demo ? `<div class="ev-note">Нет свободных карт для отряда.</div>` : ""}
      <div class="ev-note">Не больше 15 % HP узла в сутки с игрока</div></div>`;
  }

  function shopTab() {
    const d = data, s = d.shop;
    const row = (id, title, desc, price, extra) => `<div class="ev-box">
      <div class="ev-row"><span><b>${title}</b><br><span class="ev-note">${desc}</span></span><span>${price} ⭐</span></div>
      <div class="ev-btn ${extra ? '' : 'ghost'}" data-buy="${id}" style="margin-top:8px">Купить</div></div>`;
    return `<div class="ev-box"><div class="ev-row"><span>Баланс</span><b>${fmt(d.starBal)} ⭐</b></div>
      <div class="ev-note">Пасс даёт +200 к дневному лимиту вклада</div></div>
      ${row('pass', 'Знамя Строителя', '+200 к лимиту вклада на акт', s.pass)}
      ${row('clanpass', 'Знамя клана', 'пасс всем участникам клана + уведомление', s.clanPass)}
      ${row('chest', 'Сундук вклада', '250 очков, до 2 в день', s.chest)}
      ${row('card', 'Карта серии', 'гарантированный экземпляр, 1 на аккаунт', s.card)}
      ${row('named', 'Именной Врат', 'имя на Вратах в финале, 1 на аккаунт', s.named)}`;
  }

  function paint() {
    const sec = document.getElementById('sec-conq');
    const body = document.getElementById('conq-body');
    if (!sec || sec.hidden || !body) return;
    body.innerHTML = `<div id="ev-wrap">${head()}${tab === 'build' ? buildTab() : tab === 'march' ? marchTab() : shopTab()}</div>`;
    bind();
    paintCards();
  }

  /* SVG из движка местами невалиден как XML (дублируются атрибуты) —
     прогоняем через HTML-парсер и сериализуем заново, иначе <img> не рисует. */
  function svgUrl(h, c) {
    const holder = document.createElement('div');
    holder.innerHTML = portrait(h, c);
    const el = holder.querySelector('svg');
    if (!el) return '';
    el.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    el.setAttribute('viewBox', '0 0 200 200');
    const xml = new XMLSerializer().serializeToString(el);
    return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(xml);
  }

  function paintCards() {
    const player = data.demo ? {} : (S || {});
    (player.cards || []).forEach(c => {
      const img = document.querySelector(`img[data-cid="${c.id}"]`);
      if (!img || img.dataset.done) return;
      img.dataset.done = 1;
      try {
        if (typeof portrait === 'function') {
          const url = svgUrl(c.h, c);
          if (url) img.src = url;
          img.onerror = () => { img.style.background = 'linear-gradient(180deg,#2a1a4a,#1a1030)'; img.style.minHeight = '88px'; };
        }
      } catch (e) {
        img.style.background = 'linear-gradient(180deg,#2a1a4a,#1a1030)';
      }
    });
  }

  function bind() {
    document.querySelectorAll('.ev-tab').forEach(el => el.onclick = () => { tab = el.dataset.t; paint(); });
    if (data.demo) {
      document.querySelectorAll('#ev-wrap button:not(.ev-tab)').forEach(button => { button.disabled = true; });
      bindHelp();
      return;
    }
    const send = document.getElementById('ev-send');
    if (send) send.onclick = async () => {
      if (busy) return; busy = true; send.textContent = '...';
      try {
        const coins = Math.max(0, Math.floor(+document.getElementById('ev-coins').value || 0));
        const shards = Math.max(0, Math.floor(+document.getElementById('ev-shards').value || 0));
        const r = await act('ev_contrib', { coins, shards });
        if (r) { await load(); paint(); if (r.added) toast('+' + r.added + ' очков'); }
      } catch (e) { toast(String(e.message || e)); }
      busy = false; if (document.getElementById('ev-send')) document.getElementById('ev-send').textContent = 'ВНЕСТИ ВКЛАД';
    };
    document.querySelectorAll('[data-a]').forEach(el => el.onclick = async () => {
      const op = el.dataset.a;
      await act('ev_admin', { op, n: 1 });
      await load(); paint();
    });
    document.querySelectorAll('[data-card]').forEach(el => el.onclick = () => {
      const id = Number(el.dataset.card);
      if (!Number.isSafeInteger(id)) return;
      if (sel.has(id)) sel.delete(id); else if (sel.size < 3) sel.add(id);
      paint();
    });
    const hit = document.getElementById('ev-hit');
    if (hit) hit.onclick = async () => {
      if (busy || !data.open) return;
      if (!sel.size) return toast('Выбери отряд');
      const node = (data.nodes.find(n => !n.closed) || {}).n;
      if (!node) return toast('Все узлы закрыты');
      busy = true; hit.disabled = true; hit.textContent = '...';
      try {
        const r = await act('ev_hit', { n: node, cards: [...sel] }, 12000);
        if (r) { toast('Урон: ' + fmt(r.dmg)); await load(); }
      } catch (e) { toast(String(e.message || e)); }
      finally { busy = false; paint(); }
    };
    document.querySelectorAll('[data-claim]').forEach(el => el.onclick = async () => {
      const n = +el.dataset.claim;
      const r = await act('ev_claim', { n });
      if (r) { await load(); paint(); toast('Награда получена'); }
    });
    const inv = document.getElementById('ev-invite');
    if (inv) inv.onclick = () => {
      const uid = (typeof S !== 'undefined' && S && S.uid) || '';
      const link = 'https://t.me/VoinyEpohBot?startapp=r_' + uid;
      const text = 'Заходи в «Воины Эпох» — вместе строим Врата Эпох и берём клановые призы!';
      try { window.open('https://t.me/share/url?url=' + encodeURIComponent(link) + '&text=' + encodeURIComponent(text), '_blank'); }
      catch (e) { try { navigator.clipboard.writeText(link); toast('Ссылка скопирована'); } catch (e2) {} }
    };
    document.querySelectorAll('[data-buy]').forEach(el => el.onclick = async () => {
      const item = el.dataset.buy;
      const r = await act('ev_shop', { item });
      if (r) { await load(); paint(); toast('Куплено'); }
      else paint();
    });
    bindHelp();
  }

  function intro() {
    if (document.getElementById('ev-intro')) return;
    const d = document.createElement('div');
    d.id = 'ev-intro';
    d.style.cssText = 'position:fixed;inset:0;z-index:99999;background:#05030cee;display:flex;align-items:center;justify-content:center;padding:18px';
    d.innerHTML = `<div style="max-width:420px;background:linear-gradient(180deg,#1a1030,#0d0720);border:2px solid #ffd23f66;border-radius:18px;padding:16px;color:#fff">
      <div style="font-family:'Rubik Mono One',Rubik,sans-serif;font-size:18px;color:#ffd23f;text-align:center">ПОКОЛЕНИЕ ЭПОХ</div>
      <div style="font-size:12px;color:#c9d1e6;text-align:center;margin:6px 0 12px">Три недели. Три акта. Одна цель.</div>
      <div style="font-size:12px;line-height:1.5;color:#e8edf7">
        <p><b>1. Стройка.</b> Вноси монеты и осколки в сегменты Врат. Клан двигает стройку быстрее, у одиночек — «Вольное знамя».</p>
        <p><b>2. Поход.</b> Отряд из 3 карт бьёт узлы. Стихия гема даёт ×1.4, кворум 5 игроков — полный урон.</p>
        <p><b>3. Награды.</b> Каждые 3 узла — сундук, финал — карта серии.</p>
      </div>
      <div style="font-size:10px;color:#7d86a3;margin-top:8px">Донат не ускоряет сезон: лимиты вклада и потолок клана.</div>
      <div class="ev-btn" id="ev-intro-ok" style="margin-top:12px">ПОНЯТНО</div>
    </div>`;
    document.body.appendChild(d);
    d.querySelector('#ev-intro-ok').onclick = () => { try { localStorage.setItem('ev_intro_v1', '1'); } catch (e) {} d.remove(); };
  }

  function bindHelp() {
    const h = document.getElementById('ev-help');
    if (h) h.onclick = intro;
  }

  function demo() {
    const hp = [40000, 46000, 52000, 58000, 70000, 80000, 90000, 100000, 100000, 110000, 120000, 130000];
    data = {
      season: 'demo', start: Date.now() - 1, end: Date.now() + 864e5, open: true, admin: false,
      clan: 0, solo: true, act: 1,
      segs: [6000, 8000, 10000, 11000].map((need, i) => ({ i, need, points: [3200, 1500, 0, 0][i], done: false })),
      nodes: hp.map((h, i) => ({ n: i + 1, hp: h, dmg: i < 2 ? h : (i === 2 ? Math.round(h * 0.4) : 0), closed: i < 2, reward: [3, 6, 9].includes(i + 1) ? 'chest' : [4, 8].includes(i + 1) ? 'epic' : i + 1 === 12 ? 'card' : null })),
      me: { used: 300, starsUsed: 0, cap: 1500, hasPass: false },
      claimable: [], shop: { pass: 599, clanPass: 6000, chest: 199, card: 2500, named: 5000 },
      starBal: 0, kvorum: 1, demo: 1,
    };
    paint();
  }

  let opening = false;
  async function openConq() {
    const sec = document.getElementById('sec-conq');
    const body = document.getElementById('conq-body');
    if (!sec || !body) return;
    sec.dataset.epochEvent = '1';
    setTab('conq');
    if (!ONLINE) { demo(); return; }
    if (opening) return;
    opening = true;
    body.innerHTML = '<div style="padding:20px;color:#c9d1e6">Загрузка ивента…</div>';
    try {
      await load();
      if (sec.hidden) return;
      paint();
      try { if (!localStorage.getItem('ev_intro_v1')) intro(); } catch {}
    } catch (e) {
      if (sec.hidden) return;
      body.innerHTML = '<div style="padding:20px;color:#fff">' + esc(e.message) +
        '<br><button type="button" class="mini2" id="ev-retry">Повторить</button></div>';
      body.querySelector('#ev-retry').onclick = openConq;
    } finally { opening = false; }
  }

  window.__EV_OPEN__ = openConq;
})();
