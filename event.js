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
    const r = await act('ev_state');
    if (!r || !r.res) throw new Error('не удалось загрузить ивент');
    data = r.res;
    window.__EV_S__ = r.S || window.__EV_S__;
  }

  function head() {
    const d = data;
    const left = d.open ? 'идёт' : (Date.now() < d.start ? 'откроется ' + new Date(d.start).toLocaleString('ru-RU', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }) : 'завершён');
    return `<div id="ev-head"><b>ПОКОЛЕНИЕ ЭПОХ</b><span id="ev-date">${esc(left)}${d.admin ? ' · тест' : ''}</span></div>
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
    return `<div class="ev-box">
      <div class="ev-row"><span>Врата Эпох</span><b style="font-size:22px">${fmt(cur.points)} / ${fmt(cur.need)}</b></div>
      ${segs}
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
    const S = window.__EV_S__ || {};
    const cards = (S.cards || []).filter(c => !c.away && !c.list_price).sort((a, b) => (b.v || 0) - (a.v || 0)).slice(0, 12);
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
      <img src="" data-cid="${c.id}" alt=""><div style="font-size:8px;text-align:center;color:#c9d1e6">${c.id.slice(-3)}</div></div>`).join('');
    return `<div class="ev-box"><div class="ev-row"><span>Узлы</span><span>${d.nodes.filter(n => n.closed).length} / ${d.nodes.length}</span></div>${list}</div>
      <div class="ev-box"><div class="ev-row"><span>Отряд (до 3)</span><span class="ev-mini">выбрано ${sel.size}</span></div>
      <div class="ev-cards">${cardsHtml}</div>
      <div class="ev-btn" id="ev-hit">В БОЙ</div>
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
    if (!sec || !body) return;
    sec.hidden = false;
    body.innerHTML = `<div id="ev-wrap">${head()}${tab === 'build' ? buildTab() : tab === 'march' ? marchTab() : shopTab()}</div>`;
    bind();
    paintCards();
  }

  function paintCards() {
    const S = window.__EV_S__ || {};
    (S.cards || []).forEach(c => {
      const img = document.querySelector(`img[data-cid="${c.id}"]`);
      if (!img || img.dataset.done) return;
      try {
        if (typeof portrait === 'function') {
          img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(
            portrait(c.h, c).replace('<svg ', '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" '));
          img.dataset.done = 1;
        }
      } catch (e) {}
    });
  }

  function bind() {
    document.querySelectorAll('.ev-tab').forEach(el => el.onclick = () => { tab = el.dataset.t; paint(); });
    const send = document.getElementById('ev-send');
    if (send) send.onclick = async () => {
      if (busy) return; busy = true; send.textContent = '...';
      try {
        const coins = Math.max(0, Math.floor(+document.getElementById('ev-coins').value || 0));
        const shards = Math.max(0, Math.floor(+document.getElementById('ev-shards').value || 0));
        const r = await act('ev_contrib', { coins, shards });
        if (r) { await load(); paint(); if (r.res && r.res.added) toast('+' + r.res.added + ' очков'); }
      } catch (e) { toast(String(e.message || e)); }
      busy = false; if (document.getElementById('ev-send')) document.getElementById('ev-send').textContent = 'ВНЕСТИ ВКЛАД';
    };
    document.querySelectorAll('[data-a]').forEach(el => el.onclick = async () => {
      const op = el.dataset.a;
      await act('ev_admin', { op, n: 1 });
      await load(); paint();
    });
    document.querySelectorAll('[data-card]').forEach(el => el.onclick = () => {
      const id = el.dataset.card;
      if (sel.has(id)) sel.delete(id); else if (sel.size < 3) sel.add(id);
      paint();
    });
    const hit = document.getElementById('ev-hit');
    if (hit) hit.onclick = async () => {
      if (!sel.size) return toast('Выбери отряд');
      const node = (data.nodes.find(n => !n.closed) || {}).n;
      if (!node) return toast('Все узлы закрыты');
      hit.textContent = '...';
      const r = await act('ev_hit', { n: node, cards: [...sel] });
      if (r) { await load(); paint(); toast('Урон: ' + fmt(r.res.dmg)); }
      else paint();
    };
    document.querySelectorAll('[data-claim]').forEach(el => el.onclick = async () => {
      const n = +el.dataset.claim;
      const r = await act('ev_claim', { n });
      if (r) { await load(); paint(); toast('Награда получена'); }
    });
    document.querySelectorAll('[data-buy]').forEach(el => el.onclick = async () => {
      const item = el.dataset.buy;
      const r = await act('ev_shop', { item });
      if (r) { await load(); paint(); toast('Куплено'); }
      else paint();
    });
  }

  async function openConq() {
    const sec = document.getElementById('sec-conq');
    const body = document.getElementById('conq-body');
    if (!sec || !body) return;
    sec.hidden = false;
    body.innerHTML = '<div style="padding:20px;color:#c9d1e6">Загрузка ивента…</div>';
    try { await load(); paint(); } catch (e) { body.innerHTML = '<div style="padding:20px;color:#ff2e63">' + esc(e.message || e) + '</div>'; }
  }

  window.openConq = openConq;
  window.__EV_OPEN__ = openConq;
})();
