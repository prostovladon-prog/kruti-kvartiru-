/* 🏆 Конкурс TikTok 27–28.11: блок на главной, баннер в шторке «Ещё», значок на вкладке, поле админа для ссылки и выбора победителя */
(function(){
const CSS=`
#ttk{position:relative;overflow:hidden;border-radius:22px;margin:12px 0;background:linear-gradient(165deg,#ff3d8b 0%,#8a2ae0 38%,#2a1270 72%,#120a3a 100%);box-shadow:0 0 0 3px #ffd23a,0 0 28px rgba(255,61,139,.55),0 8px 0 #0b0f22}
#ttk:before{content:"";position:absolute;inset:-40%;background:conic-gradient(from 0deg,transparent 0 20deg,rgba(255,255,255,.10) 20deg 30deg,transparent 30deg 60deg,rgba(255,255,255,.08) 60deg 70deg,transparent 70deg 110deg,rgba(255,255,255,.10) 110deg 120deg,transparent 120deg);animation:kxr 24s linear infinite;pointer-events:none}
@keyframes kxr{to{transform:rotate(360deg)}}
.kx-hero{position:relative;display:flex;align-items:center;gap:6px;padding:14px 14px 6px}.kx-hero .l{flex:1;position:relative;z-index:2}
.kx-tag{display:inline-block;background:#0b0f22;color:#ffd23a;font-weight:900;font-size:11px;letter-spacing:2px;padding:5px 10px;border-radius:20px;border:2px solid #ffd23a}
.kx-h{font-weight:900;font-size:32px;line-height:1;color:#fff;margin:8px 0 4px;text-shadow:0 3px 0 #0b0f22,0 0 18px rgba(255,210,58,.6)}.kx-h i{font-style:normal;color:#ffd23a}
.kx-sub{font-weight:800;font-size:13px;line-height:1.25;color:#ffe2f2}
.kx-tm{display:inline-flex;gap:6px;margin-top:8px}.kx-tm b{background:#0b0f22;color:#fff;font-weight:900;font-size:15px;padding:6px 8px;border-radius:10px;border:2px solid rgba(255,255,255,.25)}
.kx-card{position:relative;width:118px;flex:0 0 118px;z-index:1;transform:rotate(8deg)}.kx-card .minic{display:block;width:100%;filter:drop-shadow(0 6px 0 #0b0f22) drop-shadow(0 0 18px rgba(255,210,58,.9))}
.kx-card:before{content:"";position:absolute;inset:-30px;background:radial-gradient(circle,rgba(255,230,140,.85),rgba(255,160,40,.2) 45%,transparent 70%)}
.kx-11{position:absolute;right:-10px;top:-10px;width:46px;height:46px;border-radius:50%;background:radial-gradient(circle at 35% 30%,#fff6c8,#ffd23a 45%,#c98a00);border:3px solid #6a3c00;display:flex;align-items:center;justify-content:center;font-weight:900;font-size:15px;color:#3a1c00;z-index:3}
.kx-pz{display:grid;grid-template-columns:1.25fr 1fr 1fr;gap:7px;padding:8px 12px 4px;position:relative}
.kx-pz div{border-radius:14px;padding:9px 5px 8px;text-align:center;border:2.5px solid #0b0f22;box-shadow:0 4px 0 #0b0f22;color:#2a1400;font-weight:800;font-size:10.5px;line-height:1.2}
.kx-pz div b{display:block;font-weight:900;font-size:12.5px;line-height:1.15;margin:3px 0 2px}.kx-pz div em{font-style:normal;font-size:22px;display:block}
.kx-pz .g{background:linear-gradient(160deg,#fff3b0,#ffd23a 50%,#e89a00)}.kx-pz .s{background:linear-gradient(160deg,#fff,#cfd8ec 50%,#9aa8c8)}.kx-pz .b{background:linear-gradient(160deg,#ffd8b8,#e99a5a 50%,#b8642a)}
.kx-st{position:relative;margin:10px 10px 0;background:#fff;border-radius:18px;border:3px solid #0b0f22;padding:6px 10px 10px}
.kx-s{display:flex;gap:10px;align-items:center;padding:8px 0 6px}.kx-s>i{flex:0 0 32px;height:32px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:900;font-size:16px;color:#fff;border:2.5px solid #0b0f22;font-style:normal}
.kx-s span{font-weight:800;font-size:13.5px;line-height:1.25;color:#1a1238}.kx-s span u{text-decoration:none;background:#ffe35a;padding:0 5px;border-radius:6px}
.kx-btn{display:block;width:100%;margin:4px 0 6px;border:3px solid #0b0f22;border-radius:14px;padding:11px;font:inherit;font-weight:900;font-size:15px;box-shadow:0 4px 0 #0b0f22;cursor:pointer}
.kx-btn:active{transform:translateY(3px);box-shadow:0 1px 0 #0b0f22}.kx-btn:disabled{opacity:.55}
.kx-tt{background:#0b0b0f;color:#fff;text-shadow:-2px 0 #25f4ee,2px 0 #fe2c55}.kx-y{background:#ffd23a;color:#1a1238}.kx-v{background:linear-gradient(135deg,#7a3ad0,#b44aff);color:#fff}.kx-go{background:linear-gradient(135deg,#2ad46a,#14a84c);color:#fff;font-size:17px}
.kx-in{width:100%;box-sizing:border-box;margin:5px 0;padding:11px 12px;border-radius:12px;border:2.5px solid #d6cdea;font:inherit;font-weight:700;font-size:14px;color:#1a1238;background:#faf8ff}
.kx-ok{background:#e8fff0;border:2.5px solid #2ad46a;border-radius:12px;padding:10px;font-weight:800;font-size:13.5px;color:#0d5a2a;margin:6px 0}
.kx-live{position:relative;display:flex;align-items:center;gap:8px;padding:10px 14px 4px;color:#fff;font-weight:800;font-size:13px}
.kx-av{display:flex}.kx-av i{width:24px;height:24px;border-radius:50%;border:2.5px solid #2a1270;margin-left:-8px}.kx-av i:first-child{margin-left:0}
.kx-r{position:relative;padding:6px 14px 14px;color:#e6dcff;font-weight:600;font-size:11.5px;line-height:1.35}
.kx-res{position:relative;margin:10px;background:#0b0f22;border:3px solid #ffd23a;border-radius:16px;padding:10px 12px;color:#fff;font-weight:800;font-size:14px;line-height:1.6}
.kx-adm{position:relative;margin:10px;background:#0b0f22;border:2px dashed #ffd23a;border-radius:16px;padding:10px;color:#ffe9a8;font-weight:700;font-size:12.5px}
.kx-adm .kx-in{background:#141a36;color:#fff;border-color:#3a447a}.kx-adm details{margin-top:6px}.kx-adm li{margin:2px 0}
.drw-ban.kxb{background:linear-gradient(135deg,#ff3d8b,#8a2ae0)!important;box-shadow:0 0 0 3px #ffd23a,0 0 22px rgba(255,61,139,.85)!important;animation:kxp 1.2s ease-in-out infinite}
@keyframes kxp{50%{box-shadow:0 0 0 3px #fff3b0,0 0 34px rgba(255,210,58,1)}}
#tab-more.kxt{position:relative}#tab-more.kxt:after{content:"🏆";position:absolute;top:-4px;right:6px;font-size:12px;width:21px;height:21px;border-radius:50%;background:#ff3d8b;display:flex;align-items:center;justify-content:center;box-shadow:0 0 0 2px #fff,0 0 14px #ff3d8b;animation:kxp 1.2s ease-in-out infinite}`;
let R=null,off=0,st=null;const $$=id=>document.getElementById(id);
const E=s=>String(s==null?"":s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const now=()=>Date.now()+off,live=()=>R&&now()>=R.start&&now()<R.end,shown=()=>R&&(R.admin?now()<R.end+3*864e5:now()>=R.start&&now()<R.end+2*864e5);
function css(){if($$("ttk-css"))return;const s=document.createElement("style");s.id="ttk-css";s.textContent=CSS;document.head.appendChild(s)}
function left(){const ms=Math.max(0,R.end-now()),d=Math.floor(ms/864e5),h=Math.floor(ms%864e5/36e5),m=Math.floor(ms%36e5/6e4),s=Math.floor(ms%6e4/1e3),p=x=>String(x).padStart(2,"0");return [d?d+" дн":"",p(h)+":"+p(m)+":"+p(s)].filter(Boolean)}
function best(){try{return (S.cards||[]).slice().sort((a,b)=>b.v-a.v)[0]}catch(e){return null}}
function draw(){const sec=$$("sec-spin");if(!sec||!R)return;let b=$$("ttk");if(!shown()){if(b)b.remove();tab();return}css();
 if(!b){b=document.createElement("div");b.id="ttk";const a=$$("chal");if(a&&a.parentNode)a.after(b);else sec.appendChild(b)}
 const on=live(),soon=now()<R.start,over=now()>=R.end;let card="";try{card=miniSlot(demoOne(30))}catch(e){}
 let h=`<div class="kx-hero"><div class="l"><span class="kx-tag">🏆 КОНКУРС В TIKTOK</span><div class="kx-h">ИМЕННАЯ<br>КАРТА <i>1/1</i></div><div class="kx-sub">с твоим ником — одна на всю игру</div>
  <div class="kx-tm" id="ttk-tm">${soon?"<b>старт 27.11 в 07:00</b>":over?"<b>конкурс завершён</b>":left().map(x=>"<b>"+x+"</b>").join("")}</div></div><div class="kx-card">${card}<div class="kx-11">1/1</div></div></div>
 <div class="kx-pz"><div class="g"><em>🥇</em><b>Именная карта 1/1</b>больше лайков</div><div class="s"><em>🥈</em><b>Сет «Знаменосец»</b>розыгрыш</div><div class="b"><em>🥉</em><b>Титул «Легенда»</b>розыгрыш</div></div>`;
 if(over){const W=R.res||{};h+=`<div class="kx-res">🏆 Итоги конкурса<br>🥇 ${W.w1?E(W.w1):"выбираем по лайкам в TikTok…"}<br>🥈 ${W.w2?E(W.w2):"—"}<br>🥉 ${W.w3?E(W.w3):"—"}</div>`}
 else{h+=`<div class="kx-st">
  <div class="kx-s"><i style="background:#ff3d8b">1</i><span>Впиши <u>@VoinyEpohBot</u> в ник или «О себе» в Telegram</span></div><button type="button" class="kx-btn kx-y" id="ttk-cp">📋 Скопировать @VoinyEpohBot</button>
  <div class="kx-s"><i style="background:#8a2ae0">2</i><span>Сделай скриншот своей самой сильной карты</span></div><button type="button" class="kx-btn kx-v" id="ttk-top">🃏 Открыть мою топ-карту</button>
  <div class="kx-s"><i style="background:#25c4ee">3</i><span>Оставь скрин в комментарии под нашим видео</span></div><button type="button" class="kx-btn kx-tt" id="ttk-vid"${R.url?"":" disabled"}>♪ ${R.url?"Открыть видео в TikTok":"Видео появится к старту"}</button>
  <div class="kx-s"><i style="background:#2ad46a">4</i><span>${R.me?"Ты участвуешь! Не убирай @VoinyEpohBot до итогов":"Укажи ники — по ним найдём твой комментарий"}</span></div>
  ${R.me?`<div class="kx-ok">✅ TikTok: @${E(R.me.tt)}${R.me.tg?" · Telegram: @"+E(R.me.tg):""} · <a href="#" id="ttk-ed">изменить</a></div>`:""}
  <div id="ttk-f"${R.me?" hidden":""}><input class="kx-in" id="ttk-tg" placeholder="Ник в Telegram (@username)" maxlength="33" value="${E(R.me?R.me.tg:"")}"><input class="kx-in" id="ttk-tt" placeholder="Ник в TikTok (@username)" maxlength="25" value="${E(R.me?R.me.tt:"")}">
  <button type="button" class="kx-btn kx-go" id="ttk-go"${on?"":" disabled"}>${soon?"Можно с 27.11 07:00":"✅ Я участвую"}</button></div></div>`}
 h+=`<div class="kx-live"><div class="kx-av"><i style="background:#ffd23a"></i><i style="background:#25c4ee"></i><i style="background:#fe2c55"></i><i style="background:#2ad46a"></i></div>участвуют: <b style="color:#ffd23a;font-size:16px">${R.n}</b></div>
 <div class="kx-r">🥇 — скрин карты в комментарии, у которого больше всего лайков в TikTok. 🥈 и 🥉 бот разыграет сам в 22:00 28.11 среди всех, у кого @VoinyEpohBot в профиле. Участие бесплатное, покупать ничего не нужно. Призы выдаются автоматически.</div>`;
 if(R.admin){h+=`<div class="kx-adm">👑 Только для тебя<br>Ссылка на видео в TikTok:<input class="kx-in" id="ttk-url" placeholder="https://www.tiktok.com/@…/video/…" value="${E(R.url)}"><button type="button" class="kx-btn kx-y" id="ttk-us">💾 Сохранить ссылку</button>
  ${over&&!(R.res&&R.res.w1)?`🥇 Ник TikTok победителя (по лайкам):<input class="kx-in" id="ttk-w1" placeholder="@ник из TikTok"><button type="button" class="kx-btn kx-go" id="ttk-w1go">🏆 Выдать именную карту</button>`:""}
  <details><summary>Участники: ${R.n}</summary><ol>${(R.list||[]).map(x=>`<li>${E(x.name)} · TikTok @${E(x.tt)}${x.tg?" · TG @"+E(x.tg):""}</li>`).join("")}</ol></details></div>`}
 b.innerHTML=h;bind();tab()}
function bind(){const c=$$("ttk-cp");if(c)c.onclick=()=>{try{navigator.clipboard.writeText("@VoinyEpohBot");toast("Скопировано: @VoinyEpohBot")}catch(e){toast("@VoinyEpohBot")}};
 const t=$$("ttk-top");if(t)t.onclick=()=>{const b=best();if(!b)return toast("Сначала выбей хотя бы одну карту 🎴");try{openCardView(b,{mine:true})}catch(e){}toast("📸 Сделай скриншот экрана")};
 const v=$$("ttk-vid");if(v)v.onclick=()=>{if(!R.url)return;try{tg&&tg.openLink?tg.openLink(R.url):location.assign(R.url)}catch(e){location.assign(R.url)}};
 const ed=$$("ttk-ed");if(ed)ed.onclick=e=>{e.preventDefault();$$("ttk-f").hidden=false};
 const g=$$("ttk-go");if(g)g.onclick=async()=>{g.disabled=true;const r=await act("ttk_join",{tg:$$("ttk-tg").value,tt:$$("ttk-tt").value});g.disabled=false;if(r){R=Object.assign(R,r);try{hapN("success")}catch(e){}toast("✅ Ты участвуешь! Не убирай @VoinyEpohBot до итогов");draw()}};
 const us=$$("ttk-us");if(us)us.onclick=async()=>{const r=await act("ttk_url",{url:$$("ttk-url").value});if(r){R=Object.assign(R,r);toast("💾 Ссылка сохранена — она уже в игре и в постах");draw()}};
 const w=$$("ttk-w1go");if(w)w.onclick=async()=>{const n=$$("ttk-w1").value.trim();if(!n)return toast("Впиши ник TikTok победителя");if(!confirm("Выдать именную карту игроку с TikTok "+n+"?"))return;const r=await act("ttk_first",{tt:n});if(r){R=Object.assign(R,r);toast("🏆 Карта выдана, победителю ушло сообщение");draw()}}}
function tab(){const t=$$("tab-more");if(t)t.classList.toggle("kxt",!!(R&&live()))}
async function load(){if(typeof ONLINE!=="undefined"&&!ONLINE)return;if(typeof S==="undefined"||!S)return;try{const r=await act("ttk_get");if(r){R=r;off=r.now-Date.now();draw()}}catch(e){}}
/* баннер в шторке «Ещё» */
{const mo=window.menuOpen;if(typeof mo==="function")window.menuOpen=menuOpen=function(){const x=mo.apply(this,arguments);try{if(R&&live()){const box=document.querySelector("#drw .drw-b");if(box&&!box.querySelector("[data-go=ttk]")){const b=document.createElement("button");b.type="button";b.className="drw-ban kxb";b.dataset.go="ttk";b.innerHTML='<i>🏆</i><span><b>Сейчас идёт конкурс!</b><small>Именная карта 1/1 · осталось '+left().join(" ")+'</small></span><em>›</em>';box.prepend(b)}}}catch(e){}return x};
 const mg=window.menuGo;if(typeof mg==="function")window.menuGo=menuGo=function(k){if(k!=="ttk")return mg.apply(this,arguments);try{menuClose()}catch(e){}go()}}
function go(){try{setTab("spin")}catch(e){}setTimeout(()=>{const b=$$("ttk");if(b)b.scrollIntoView({behavior:"smooth",block:"start"})},250)}
setInterval(()=>{const t=$$("ttk-tm");if(t&&R&&live())t.innerHTML=left().map(x=>"<b>"+x+"</b>").join("")},1000);
setTimeout(load,3500);setInterval(load,60000);
try{if(new URLSearchParams(location.search).get("ttk"))setTimeout(async()=>{await load();go()},4500)}catch(e){}
})();
