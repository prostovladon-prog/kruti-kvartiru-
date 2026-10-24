/* game.js — интерфейс «Воинов Эпох». Правила игры лежат в rules.js. */

/* ---------- настройки ---------- */
const API_URL="https://77-221-147-102.sslip.io";                              // адрес сервера, например https://voiny-epoh.твоё-имя.workers.dev (пусто = игра без сервера)
const BOT_LINK="https://t.me/VoinyEpohBot";   // ссылка на бота, например https://t.me/VoinyEpohBot
const CHANNEL="voinyepoh";                     // канал игры, бот должен быть в нём администратором
const PAGE_URL="https://prostovladon-prog.github.io/kruti-kvartiru-/";

const $=id=>document.getElementById(id);
const fmt=n=>{n=+n||0;if(Math.abs(n)<100&&Math.abs(n-Math.round(n))>.004)return n.toFixed(2).replace(".",",")+" 🪙";return Math.round(n).toLocaleString("ru-RU").replace(/[\u00a0\u202f,]/g," ")+" 🪙"};
/* коротко для тесных мест: $12 345, $1,49 млн, $33,2 млн, $1,2 млрд */
const fmtC=n=>{n=+n||0;const a=Math.abs(n),k=(v,u)=>{let t=v<10?v.toFixed(2):v<100?v.toFixed(1):String(Math.round(v));if(t.includes("."))t=t.replace(/\.?0+$/,"");return t.replace(".",",")+" "+u+" 🪙"};
  if(a>=1e9)return k(n/1e9,"млрд");if(a>=1e6)return k(n/1e6,"млн");return fmt(n)};
const fmtN=n=>Math.round(n).toLocaleString("ru-RU").replace(/[ ,]/g," ");
const reduce=matchMedia("(prefers-reduced-motion: reduce)").matches;
const tg=window.Telegram&&window.Telegram.WebApp;
const DEV_USER=new URLSearchParams(location.search).get("dev");
const ONLINE=!!API_URL&&!!((tg&&tg.initData)||DEV_USER);
const NOW=()=>Date.now();
const todayL=()=>today(NOW());

/* ---------- состояние игрока ----------
   Без сервера всё хранится в браузере. С сервером состояние приходит в ответ на каждое действие. */
let S=null;
const LKEY="we-v3";
function loadLocal(){
  try{const s=localStorage.getItem(LKEY);if(s)return JSON.parse(s)}catch(e){}
  try{const o=localStorage.getItem("we-v2");if(o){const v=JSON.parse(o),st=Object.assign(freshState(),v);st.cards=v.cards||[];return st}}catch(e){}
  const st=freshState();st.cards=[];st.issued={};st.used={};st.seq=0;return st}
function save(){if(ONLINE||!S)return;try{localStorage.setItem(LKEY,JSON.stringify(S))}catch(e){}}
function localCtx(){S.issued=S.issued||{};S.used=S.used||{};
  const issuedOf=(h,f)=>{const k=h+"-"+f;if(S.issued[k]==null){const run=FIN[f].run;S.issued[k]=run===Infinity?3000+Math.floor(Math.random()*40000):Math.floor(Math.random()*run*.6)}return S.issued[k]};
  return {now:NOW(),test:true,events:[],issuedOf,nextNo:(h,f)=>S.issued[h+"-"+f]=issuedOf(h,f)+1,
    snFree:s=>!S.used[s],takeSn:s=>{S.used[s]=1},newId:()=>S.seq=(S.seq||0)+1,
    compLeft:h=>{S.cs=S.cs||{};if(S.cs[h]==null)S.cs[h]=40+Math.floor(Math.random()*160);return HALF_RUN-S.cs[h]},
    compSlot:h=>{const l=localCtx().compLeft(h);return l>0?++S.cs[h]:0},compErr:(h,p)=>!!(S.ce||{})[h+"-"+p],compErrTake:(h,p)=>{S.ce=S.ce||{};S.ce[h+"-"+p]=1},
    release:c=>{delete S.used[c.sn];const k=c.h+"-"+c.f;if(FIN[c.f].run!==Infinity&&S.issued[k]>0)S.issued[k]--}}}
/* сколько экземпляров уже выпущено (для крафта и слияния) */
function issuedOfUI(h,f){if(FIN[f].run===Infinity)return 0;return ONLINE?((S.prints||{})[h+"-"+f]||0):localCtx().issuedOf(h,f)}

/* ---------- действие игрока: локально или через сервер ---------- */
async function act(name,p){
  try{let out;
    if(ONLINE){
      const r=await fetch(API_URL.replace(/\/$/,"")+"/api",{method:"POST",headers:{"Content-Type":"application/json","X-Init-Data":(tg&&tg.initData)||"","X-Dev-User":DEV_USER||""},body:JSON.stringify({a:name,p:p||{}})});
      let j;try{j=await r.json()}catch(e){throw new GameError(r.status===429||r.status>=500?"Сервер перегружен, попробуй через пару минут":"Нет связи с сервером. Попробуй ещё раз")}
      if(!j.ok)throw new GameError(j.err||"Ошибка сервера");if(j.S)S=j.S;out=j.res||{};
    }else{
      if(name==="sub_check")name="sub_reward";
      if(LOCAL[name])out=LOCAL[name](p||{});
      else{const ctx=localCtx();ctx.subOk=true;const r=runAction(name,S,S.cards,ctx,p);S.cards=r.cards;out=r.res;out.events=ctx.events}
      save();
    }
    (out.events||[]).forEach(e=>{if(e.t==="lvl")toast(HEROES[e.h][0]+" достиг уровня "+e.lv+"!"+(STAR_LVL.includes(e.lv)?" Его можно закалить ★"+(STAR_LVL.indexOf(e.lv)+1)+" во вкладке «Мои»":""))});
    if(name==="open")setTimeout(()=>{if(S&&S.spins<=0)askPm()},4500);
    news();fightNews();chatDot();showNotice();return out;
  }catch(e){if(!(e instanceof GameError))console.error(e);toast(e instanceof GameError?e.message:"Нет связи с сервером. Попробуй ещё раз");return null}
}
/* новости: кто купил твои карточки на рынке */
let noticeShown="";
function showNotice(){if(!S||!S.notice||noticeShown===S.notice||!$("modal").hidden)return;noticeShown=S.notice;const m=$("modal"),sh=$("msheet");sh.innerHTML="";m.hidden=false;
  sh.innerHTML='<div class="box nickbox"><h3>Сообщение от команды игры</h3><p class="ntc"></p><button type="button" class="craftbtn" id="ntc-ok">Понятно, спасибо!</button></div>';
  sh.querySelector(".ntc").textContent=S.notice;$("ntc-ok").onclick=async()=>{closeModal();await act("notice_ok");renderAll()}}
function news(){const n=(S&&S.news)||[];if(!n.length)return;n.forEach(x=>toast("Продано! "+HEROES[x.h][0]+" ушёл к "+x.buyer+" за "+fmt(x.price)+", тебе "+fmt(x.got)));S.news=[];sfx.coin();hapN("success");save()}



/* ---------- detailed illustrations for the top warriors ---------- */
const DETAILED={
 // Спартанец
 "Спартанец":u=>`<svg viewBox="0 0 200 200" class="pt" aria-hidden="true"><defs>
 <linearGradient id="bz${u}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffe29a"/><stop offset=".45" stop-color="#d9993a"/><stop offset="1" stop-color="#7a4a14"/></linearGradient>
 <linearGradient id="cp${u}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e8413a"/><stop offset="1" stop-color="#7d1410"/></linearGradient>
 <linearGradient id="cr${u}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ff5a4a"/><stop offset="1" stop-color="#9c1a14"/></linearGradient></defs>
 <g stroke="#0d1030" stroke-width="3.5" stroke-linejoin="round" stroke-linecap="round">
  <path d="M182 204 L150 8" stroke="#0d1030" stroke-width="10"/><path d="M182 204 L150 8" stroke="#8a5a2b" stroke-width="5"/>
  <path d="M150 8 C140 22 142 38 152 46 C160 36 160 20 150 8 Z" fill="url(#bz${u})"/><path d="M150 14 L151 40" stroke="#fff3c4" stroke-width="2"/>
  <path d="M24 206 C26 160 46 130 72 122 L128 122 C154 130 174 160 176 206 Z" fill="url(#cp${u})"/>
  <path d="M40 200 C44 170 52 150 64 138 M160 200 C156 170 148 150 136 138" fill="none" stroke="#5a0d0a" stroke-width="3"/>
  <path d="M50 206 C52 162 68 138 100 132 C132 138 148 162 150 206 Z" fill="url(#bz${u})"/>
  <path d="M50 206 C52 162 68 138 100 132 C82 142 72 166 70 206 Z" fill="#000" fill-opacity=".22" stroke="none"/>
  <path d="M70 162 Q84 150 98 158 M102 158 Q116 150 130 162 M100 162 L100 204 M82 182 Q100 188 118 182 M86 198 Q100 202 114 198" fill="none" stroke-width="2.6"/>
  <path d="M112 146 Q124 148 130 156" fill="none" stroke="#fff3c4" stroke-width="3" opacity=".8"/>
  <path d="M86 112 L86 136 L114 136 L114 112 Z" fill="#c98c62"/>
  <path d="M78 110 Q82 138 100 142 Q118 138 122 110 Z" fill="#24160c"/>
  <path d="M38 72 C42 22 158 22 162 72 C142 50 58 50 38 72 Z" fill="url(#cr${u})"/>
  <path d="M52 60 C60 40 76 34 86 32 M66 54 C74 40 88 34 98 33 M134 54 C126 40 112 34 102 33 M148 60 C140 40 124 34 114 32" fill="none" stroke="#5a0d0a" stroke-width="2"/>
  <path d="M64 122 C58 98 58 66 78 52 C90 44 110 44 122 52 C142 66 142 98 136 122 L116 124 L108 98 L92 98 L84 124 Z" fill="url(#bz${u})"/>
  <path d="M64 122 C58 98 58 66 78 52 C70 70 68 98 74 122 Z" fill="#000" fill-opacity=".22" stroke="none"/>
  <path d="M72 84 Q86 76 97 84 L97 92 Q86 88 74 94 Z M128 84 Q114 76 103 84 L103 92 Q114 88 126 94 Z" fill="#1a0f08"/>
  <path d="M92 98 L108 98 L114 124 L86 124 Z" fill="#1a0f08"/>
  <circle cx="86" cy="87" r="2.4" fill="#ffd36b" stroke="none"/><circle cx="114" cy="87" r="2.4" fill="#ffd36b" stroke="none"/>
  <path d="M84 54 Q100 47 116 54" fill="none" stroke="#fff6d8" stroke-width="4" opacity=".8"/>
  <circle cx="54" cy="166" r="46" fill="url(#bz${u})"/><circle cx="54" cy="166" r="37" fill="#a3262a"/>
  <path d="M36 194 L54 140 L72 194" fill="none" stroke="#ffd36b" stroke-width="8"/>
  <path d="M22 146 Q34 124 58 120" fill="none" stroke="#fff3c4" stroke-width="4" opacity=".85"/>
 </g></svg>`,
 // Викинг
 "Викинг":u=>`<svg viewBox="0 0 200 200" class="pt" aria-hidden="true"><defs>
 <linearGradient id="st${u}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f4f7fb"/><stop offset=".5" stop-color="#a9b5c6"/><stop offset="1" stop-color="#5d6a7e"/></linearGradient>
 <linearGradient id="fr${u}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9a6a3c"/><stop offset="1" stop-color="#4f3018"/></linearGradient>
 <pattern id="ml${u}" width="7" height="7" patternUnits="userSpaceOnUse"><circle cx="3.5" cy="3.5" r="2.4" fill="none" stroke="#5d6a7e" stroke-width="1.5"/></pattern></defs>
 <g stroke="#0d1030" stroke-width="3.5" stroke-linejoin="round" stroke-linecap="round">
  <path d="M178 206 L140 30" stroke-width="11"/><path d="M178 206 L140 30" stroke="#8a5a2b" stroke-width="6"/>
  <path d="M146 40 C170 30 190 46 186 82 C176 72 162 70 152 74 Z" fill="url(#st${u})"/><path d="M160 44 C172 44 180 54 182 70" fill="none" stroke="#fff" stroke-width="2.5"/>
  <path d="M46 206 C48 162 66 138 100 134 C134 138 152 162 154 206 Z" fill="#2f5fd0"/>
  <path d="M56 206 C58 166 72 148 100 144 C128 148 142 166 144 206 Z" fill="url(#ml${u})" stroke="none"/>
  <path d="M34 166 C40 136 66 126 100 128 C134 126 160 136 166 166 C150 154 128 150 100 152 C72 150 50 154 34 166 Z" fill="url(#fr${u})"/>
  <path d="M44 156 l6 8 M58 148 l5 9 M74 144 l3 9 M126 144 l-3 9 M142 148 l-5 9 M156 156 l-6 8" fill="none" stroke="#2e1a0c" stroke-width="2.5"/>
  <path d="M88 112 L88 134 L112 134 L112 112 Z" fill="#f1c7a3"/>
  <circle cx="100" cy="92" r="30" fill="#f1c7a3"/>
  <path d="M72 98 C70 136 84 156 100 160 C116 156 130 136 128 98 C120 110 110 112 100 112 C90 112 80 110 72 98 Z" fill="#e3a83c"/>
  <path d="M80 112 C82 132 90 146 100 150 C110 146 118 132 120 112" fill="none" stroke="#a8701e" stroke-width="2.5"/>
  <path d="M92 148 L90 176 M108 148 L110 176" stroke="#e3a83c" stroke-width="8"/><path d="M92 148 L90 176 M108 148 L110 176" stroke-width="1.5"/>
  <rect x="85" y="160" width="10" height="5" fill="#c9d2de" stroke-width="2"/><rect x="105" y="160" width="10" height="5" fill="#c9d2de" stroke-width="2"/>
  <path d="M82 108 C90 100 96 104 100 106 C104 104 110 100 118 108 C116 116 108 112 100 110 C92 112 84 116 82 108 Z" fill="#c98a2e" stroke-width="2.5"/>
  <path d="M64 92 C62 58 80 44 100 44 C120 44 138 58 136 92 Z" fill="url(#st${u})"/>
  <path d="M64 92 C62 58 80 44 100 44 C84 52 76 70 76 92 Z" fill="#000" fill-opacity=".18" stroke="none"/>
  <path d="M100 44 L100 86" stroke-width="3"/><rect x="62" y="84" width="76" height="9" fill="#7c8799"/>
  <path d="M70 90 Q86 82 98 92 L98 104 L102 104 L102 92 Q114 82 130 90 L128 100 Q114 94 104 106 L96 106 Q86 94 72 100 Z" fill="url(#st${u})"/>
  <ellipse cx="87" cy="96" rx="5" ry="3.4" fill="#0d1030" stroke="none"/><ellipse cx="113" cy="96" rx="5" ry="3.4" fill="#0d1030" stroke="none"/>
  <circle cx="88" cy="95.5" r="1.4" fill="#9fd6ff" stroke="none"/><circle cx="114" cy="95.5" r="1.4" fill="#9fd6ff" stroke="none"/>
  <path d="M80 54 Q92 48 104 50" fill="none" stroke="#fff" stroke-width="3.5" opacity=".9"/>
  <circle cx="52" cy="166" r="44" fill="#f4efe2"/>
  <path d="M52 122 A44 44 0 0 1 96 166 L52 166 Z M52 210 A44 44 0 0 1 8 166 L52 166 Z" fill="#c0392b" stroke-width="2.5"/>
  <circle cx="52" cy="166" r="44" fill="none"/><circle cx="52" cy="166" r="11" fill="url(#st${u})"/>
  <path d="M16 146 Q28 126 50 122" fill="none" stroke="#fff" stroke-width="3.5" opacity=".9"/>
 </g></svg>`,
 // Сёгун
 "Сёгун":u=>`<svg viewBox="0 0 200 200" class="pt" aria-hidden="true"><defs>
 <linearGradient id="gd${u}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff2b0"/><stop offset=".45" stop-color="#e8b33a"/><stop offset="1" stop-color="#8a5a10"/></linearGradient>
 <linearGradient id="lq${u}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3a3a58"/><stop offset="1" stop-color="#121228"/></linearGradient>
 <linearGradient id="kt${u}" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="#9aa6b8"/></linearGradient></defs>
 <g stroke="#0d1030" stroke-width="3.5" stroke-linejoin="round" stroke-linecap="round">
  <path d="M150 196 C156 130 170 70 190 6 L196 10 C178 72 166 132 160 198 Z" fill="url(#kt${u})"/>
  <path d="M144 186 L170 192" stroke-width="9"/><path d="M144 186 L170 192" stroke="#e8b33a" stroke-width="4"/>
  <path d="M150 196 L146 214" stroke="#4a1a1a" stroke-width="10"/>
  <path d="M44 206 C46 162 66 140 100 136 C134 140 154 162 156 206 Z" fill="url(#gd${u})"/>
  <path d="M54 160 H146 M50 174 H150 M48 188 H152" fill="none" stroke-width="2.5"/>
  <path d="M60 160 v14 M76 160 v14 M92 160 v14 M108 160 v14 M124 160 v14 M140 160 v14 M58 174 v14 M74 174 v14 M90 174 v14 M106 174 v14 M122 174 v14 M138 174 v14" stroke="#c0262c" stroke-width="3"/>
  <path d="M20 140 L64 132 L68 182 L24 192 Z M180 140 L136 132 L132 182 L176 192 Z" fill="url(#gd${u})"/>
  <path d="M22 156 L66 148 M23 172 L67 164 M178 156 L134 148 M177 172 L133 164" fill="none" stroke-width="2.5"/>
  <path d="M40 140 v42 M156 140 v42" stroke="#c0262c" stroke-width="3"/>
  <path d="M52 78 L148 78 L166 120 L34 120 Z" fill="url(#lq${u})"/>
  <path d="M46 92 H154 M40 106 H160" fill="none" stroke="#e8b33a" stroke-width="3"/>
  <path d="M88 110 L88 136 L112 136 L112 110 Z" fill="#e0ac83"/>
  <circle cx="100" cy="92" r="30" fill="#e0ac83"/>
  <path d="M70 96 C70 124 84 138 100 140 C116 138 130 124 130 96 C122 104 112 106 100 106 C88 106 78 104 70 96 Z" fill="#b3222a"/>
  <path d="M82 116 C90 110 96 112 100 114 C104 112 110 110 118 116 C114 124 106 120 100 120 C94 120 86 124 82 116 Z" fill="#111" stroke-width="2"/>
  <path d="M88 124 L112 124 L110 130 L90 130 Z" fill="#fff" stroke-width="2"/><path d="M94 124 v6 M100 124 v6 M106 124 v6" stroke-width="1.5"/>
  <path d="M80 86 L96 92 L94 98 L80 96 Z M120 86 L104 92 L106 98 L120 96 Z" fill="#111"/>
  <path d="M84 92 L92 94 M116 92 L108 94" stroke="#ffd60a" stroke-width="3"/>
  <path d="M66 86 C66 54 82 44 100 44 C118 44 134 54 134 86 Z" fill="url(#lq${u})"/>
  <path d="M74 60 v4 M86 52 v4 M100 48 v4 M114 52 v4 M126 60 v4" stroke="#e8b33a" stroke-width="3"/>
  <path d="M60 84 L46 70 L56 96 Z M140 84 L154 70 L144 96 Z" fill="url(#gd${u})"/>
  <path d="M82 50 C90 62 110 62 118 50 C124 30 140 14 162 4 C142 26 128 48 100 54 C72 48 58 26 38 4 C60 14 76 30 82 50 Z" fill="url(#gd${u})"/>
  <circle cx="100" cy="46" r="9" fill="#c0262c"/>
  <path d="M60 26 C68 20 74 18 80 18" fill="none" stroke="#fff6c0" stroke-width="3" opacity=".9"/>
 </g></svg>`
};

/* ---------- составные воины: шесть чудовищ, собираются из двух половинок ---------- */
const BEASTS={
 "Дракон":u=>`<svg viewBox="0 0 200 200" class="pt" aria-hidden="true"><defs><radialGradient id="dE${u}"><stop offset="0" stop-color="#fff6a0"/><stop offset="1" stop-color="#ff9f0a"/></radialGradient><linearGradient id="dH${u}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ff4a3a"/><stop offset="1" stop-color="#a8141a"/></linearGradient><linearGradient id="dF${u}" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#fff3a0"/><stop offset=".5" stop-color="#ffb347"/><stop offset="1" stop-color="#ff3b30" stop-opacity="0"/></linearGradient></defs>
  <g stroke="#0d1030" stroke-width="5" stroke-linejoin="round" stroke-linecap="round">
   <path d="M34 128 L4 36 L46 66 L50 22 L80 80 Z" fill="#7a0f12"/><path d="M40 112 L22 60 M50 96 L48 44" fill="none" stroke-width="3"/>
   <path d="M166 128 L196 36 L154 66 L150 22 L120 80 Z" fill="#7a0f12"/><path d="M160 112 L178 60 M150 96 L152 44" fill="none" stroke-width="3"/>
   <path d="M58 200 Q62 152 80 134 L120 134 Q138 152 142 200Z" fill="#c2222a"/>
   <path d="M84 200 Q87 166 100 150 Q113 166 116 200Z" fill="#ffb347"/><path d="M89 176 H111 M87 190 H113 M92 162 H108" fill="none" stroke-width="3"/>
   <path d="M70 62 Q46 34 58 6 Q72 32 86 54Z" fill="#ffd23f"/><path d="M130 62 Q154 34 142 6 Q128 32 114 54Z" fill="#ffd23f"/>
   <path d="M54 86 L26 70 L40 92 L18 102 L48 108Z" fill="#2fbf5a"/><path d="M146 86 L174 70 L160 92 L182 102 L152 108Z" fill="#2fbf5a"/>
   <path d="M58 92 Q60 50 100 48 Q140 50 142 92 Q142 114 128 124 L72 124 Q58 114 58 92Z" fill="url(#dH${u})"/>
   <path d="M86 56 l6 8 l8 -10 l8 10 l6 -8" fill="none" stroke="#ffd23f" stroke-width="3"/>
   <path d="M72 104 Q74 134 100 142 Q126 134 128 104 Q114 97 100 97 Q86 97 72 104Z" fill="#ff6a48"/>
   <path d="M80 124 Q100 140 120 124 Q114 134 100 136 Q86 134 80 124Z" fill="#3a0505"/>
   <path d="M85 125 l3 7 l3 -6 M96 129 l2 6 l2 -6 M104 129 l2 6 l2 -6 M115 125 l-3 7 l-3 -6" fill="#fff" stroke-width="2"/>
   <ellipse cx="91" cy="112" rx="3.5" ry="2.5" fill="#3a0505" stroke-width="2"/><ellipse cx="109" cy="112" rx="3.5" ry="2.5" fill="#3a0505" stroke-width="2"/>
   <path d="M64 76 L93 86" stroke-width="7"/><path d="M136 76 L107 86" stroke-width="7"/>
   <path d="M68 86 Q80 79 92 89 Q80 96 68 89Z" fill="url(#dE${u})" stroke-width="3"/><path d="M132 86 Q120 79 108 89 Q120 96 132 89Z" fill="url(#dE${u})" stroke-width="3"/>
   <path d="M80 82 L80 93 M120 82 L120 93" stroke-width="3"/>
  </g>
  <path d="M120 130 Q152 138 186 116 Q172 150 136 152 Q122 144 120 130Z" fill="url(#dF${u})"/><path d="M122 132 Q146 138 168 126 Q158 144 134 146Z" fill="#fff3a0" opacity=".8"/>
  <g fill="#cfd3e6" opacity=".55"><circle cx="86" cy="104" r="4"/><circle cx="82" cy="97" r="3"/><circle cx="114" cy="104" r="4"/><circle cx="118" cy="97" r="3"/></g></svg>`,
 "Феникс":u=>`<svg viewBox="0 0 200 200" class="pt" aria-hidden="true"><defs><linearGradient id="fW${u}" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#d0141f"/><stop offset=".5" stop-color="#ff7a1a"/><stop offset="1" stop-color="#ffe14d"/></linearGradient><linearGradient id="fB${u}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffd23f"/><stop offset="1" stop-color="#ff5a1f"/></linearGradient><radialGradient id="fE${u}"><stop offset="0" stop-color="#fff"/><stop offset="1" stop-color="#7fe7ff"/></radialGradient></defs>
  <g stroke="#0d1030" stroke-width="5" stroke-linejoin="round" stroke-linecap="round">
   <path d="M86 120 Q40 120 6 70 Q30 80 40 72 Q20 56 18 30 Q44 56 58 52 Q48 34 54 10 Q72 50 92 82Z" fill="url(#fW${u})"/>
   <path d="M114 120 Q160 120 194 70 Q170 80 160 72 Q180 56 182 30 Q156 56 142 52 Q152 34 146 10 Q128 50 108 82Z" fill="url(#fW${u})"/>
   <path d="M40 92 Q60 96 80 108 M30 62 Q56 80 84 96 M58 40 Q70 70 90 90" fill="none" stroke="#7a0f12" stroke-width="3"/>
   <path d="M160 92 Q140 96 120 108 M170 62 Q144 80 116 96 M142 40 Q130 70 110 90" fill="none" stroke="#7a0f12" stroke-width="3"/>
   <path d="M70 200 Q66 170 80 150 Q60 176 52 200Z M130 200 Q134 170 120 150 Q140 176 148 200Z" fill="#ff7a1a"/>
   <path d="M72 200 Q70 150 100 128 Q130 150 128 200Z" fill="url(#fB${u})"/>
   <path d="M86 170 Q100 160 114 170 M84 186 Q100 176 116 186" fill="none" stroke="#c2410c" stroke-width="3"/>
   <path d="M100 30 Q90 14 96 0 Q104 14 108 6 Q114 22 106 34 Q122 20 126 28 Q114 40 110 50 L90 50 Q84 38 72 30 Q88 26 100 30Z" fill="#ffe14d"/>
   <path d="M78 88 Q76 52 100 48 Q124 52 122 88 Q122 112 100 132 Q78 112 78 88Z" fill="url(#fB${u})"/>
   <path d="M92 96 L100 92 L108 96 L100 124Z" fill="#ffd23f"/><path d="M96 102 L104 102" stroke-width="2.5"/>
   <path d="M82 78 Q90 72 97 80 Q90 86 82 80Z" fill="url(#fE${u})" stroke-width="3"/><path d="M118 78 Q110 72 103 80 Q110 86 118 80Z" fill="url(#fE${u})" stroke-width="3"/>
   <path d="M80 70 L96 76 M120 70 L104 76" stroke-width="4"/>
  </g>
  <g fill="#fff6a0"><circle cx="30" cy="120" r="3"/><circle cx="172" cy="128" r="2.5"/><circle cx="20" cy="150" r="2"/><circle cx="182" cy="160" r="3"/><circle cx="60" cy="140" r="2"/></g>
  <path d="M100 30 Q96 20 100 10 Q104 20 100 30Z" fill="#fff" opacity=".8"/></svg>`,
 "Кракен":u=>`<svg viewBox="0 0 200 200" class="pt" aria-hidden="true"><defs><linearGradient id="kH${u}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#c56bff"/><stop offset="1" stop-color="#5a1f8a"/></linearGradient><radialGradient id="kE${u}"><stop offset="0" stop-color="#fffbe0"/><stop offset=".6" stop-color="#ffe14d"/><stop offset="1" stop-color="#ff9f0a"/></radialGradient></defs>
  <g stroke="#0d1030" stroke-width="5" stroke-linejoin="round" stroke-linecap="round">
   <path d="M30 200 Q10 160 30 130 Q44 112 30 96 Q52 104 46 132 Q38 160 58 200Z" fill="#8a3ad0"/>
   <path d="M170 200 Q190 160 170 130 Q156 112 170 96 Q148 104 154 132 Q162 160 142 200Z" fill="#8a3ad0"/>
   <path d="M60 200 Q54 168 72 150 L90 158 Q76 176 82 200Z" fill="#9b4ae0"/><path d="M140 200 Q146 168 128 150 L110 158 Q124 176 118 200Z" fill="#9b4ae0"/>
   <path d="M96 200 Q96 172 100 156 Q104 172 104 200Z" fill="#9b4ae0"/>
   <path d="M8 60 Q2 30 26 26 Q44 26 40 44 Q36 56 26 50" fill="none" stroke-width="10"/><path d="M8 60 Q2 30 26 26 Q44 26 40 44 Q36 56 26 50" fill="none" stroke="#b05cf0" stroke-width="5"/>
   <path d="M192 64 Q200 34 176 28 Q158 26 160 44 Q164 56 174 50" fill="none" stroke-width="10"/><path d="M192 64 Q200 34 176 28 Q158 26 160 44 Q164 56 174 50" fill="none" stroke="#b05cf0" stroke-width="5"/>
   <path d="M18 70 Q26 110 60 130 M182 74 Q174 110 140 130" fill="none" stroke-width="12"/><path d="M18 70 Q26 110 60 130 M182 74 Q174 110 140 130" fill="none" stroke="#b05cf0" stroke-width="7"/>
   <path d="M52 112 Q46 30 100 22 Q154 30 148 112 Q140 152 100 156 Q60 152 52 112Z" fill="url(#kH${u})"/>
   <path d="M72 40 Q80 30 90 34 M120 32 Q132 32 134 44" fill="none" stroke="#e9c4ff" stroke-width="3" opacity=".8"/>
   <ellipse cx="78" cy="98" rx="15" ry="18" fill="url(#kE${u})"/><ellipse cx="122" cy="98" rx="15" ry="18" fill="url(#kE${u})"/>
   <rect x="74" y="88" width="8" height="20" rx="3" fill="#0d1030" stroke-width="0"/><rect x="118" y="88" width="8" height="20" rx="3" fill="#0d1030" stroke-width="0"/>
   <path d="M60 80 L94 88 M140 80 L106 88" stroke-width="6"/>
   <path d="M84 132 Q100 124 116 132 Q100 146 84 132Z" fill="#3a0a50"/>
  </g>
  <g fill="#e9c4ff" stroke="#0d1030" stroke-width="2"><circle cx="34" cy="150" r="4"/><circle cx="30" cy="170" r="3.5"/><circle cx="166" cy="150" r="4"/><circle cx="170" cy="170" r="3.5"/><circle cx="66" cy="172" r="3"/><circle cx="134" cy="172" r="3"/></g>
  <g fill="#bfe3ff" opacity=".8"><circle cx="100" cy="10" r="3"/><circle cx="160" cy="12" r="2"/><circle cx="44" cy="12" r="2.5"/></g></svg>`,
 "Цербер":u=>{const head=(x,y,s,r)=>`<g transform="translate(${x} ${y}) rotate(${r}) scale(${s})"><path d="M-30 -14 L-40 -48 L-14 -30Z M30 -14 L40 -48 L14 -30Z" fill="#2a1a2e"/><path d="M-32 0 Q-32 -36 0 -38 Q32 -36 32 0 Q32 18 18 28 L-18 28 Q-32 18 -32 0Z" fill="url(#cH${u})"/><path d="M-16 12 Q0 4 16 12 L14 34 Q0 44 -14 34Z" fill="#3a2440"/><ellipse cx="0" cy="14" rx="7" ry="5" fill="#0d1030"/><path d="M-12 32 Q0 40 12 32 Q6 46 0 46 Q-6 46 -12 32Z" fill="#7a0f12"/><path d="M-10 33 l2 6 l2 -5 M10 33 l-2 6 l-2 -5" fill="#fff" stroke-width="2"/><path d="M-22 -10 L-6 -4 M22 -10 L6 -4" stroke-width="5"/><path d="M-22 -4 Q-14 -10 -7 -2 Q-14 3 -22 -2Z M22 -4 Q14 -10 7 -2 Q14 3 22 -2Z" fill="#ff3b30" stroke-width="2.5"/></g>`;
  return `<svg viewBox="0 0 200 200" class="pt" aria-hidden="true"><defs><linearGradient id="cH${u}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5a4466"/><stop offset="1" stop-color="#22142a"/></linearGradient><radialGradient id="cG${u}"><stop offset="0" stop-color="#ff3b30" stop-opacity=".7"/><stop offset="1" stop-color="#ff3b30" stop-opacity="0"/></radialGradient></defs>
  <circle cx="100" cy="110" r="90" fill="url(#cG${u})"/>
  <g stroke="#0d1030" stroke-width="5" stroke-linejoin="round" stroke-linecap="round">
   <path d="M40 200 Q42 150 70 128 L130 128 Q158 150 160 200Z" fill="#3a2440"/>
   <path d="M56 140 L144 140 L140 156 L60 156Z" fill="#7a5a10"/><g fill="#d9dee8"><path d="M66 140 l6 -12 l6 12Z M88 140 l6 -12 l6 12Z M108 140 l6 -12 l6 12Z M128 140 l6 -12 l6 12Z"/></g>
   ${head(46,110,.85,-14)}${head(154,110,.85,14)}${head(100,82,1,0)}
  </g>
  <g fill="#ffb347"><circle cx="20" cy="40" r="2.5"/><circle cx="180" cy="34" r="2"/><circle cx="170" cy="186" r="3"/><circle cx="26" cy="182" r="2.5"/></g></svg>`},
 "Химера":u=>`<svg viewBox="0 0 200 200" class="pt" aria-hidden="true"><defs><radialGradient id="hM${u}" cx=".5" cy=".55"><stop offset="0" stop-color="#ffb347"/><stop offset="1" stop-color="#b8580b"/></radialGradient><linearGradient id="hF${u}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffd27a"/><stop offset="1" stop-color="#d9993a"/></linearGradient><linearGradient id="hS${u}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#7ee89a"/><stop offset="1" stop-color="#0d5c2a"/></linearGradient></defs>
  <g stroke="#0d1030" stroke-width="5" stroke-linejoin="round" stroke-linecap="round">
   <path d="M150 200 Q150 160 172 140 Q196 118 178 92 Q170 80 184 66" fill="none" stroke-width="16"/><path d="M150 200 Q150 160 172 140 Q196 118 178 92 Q170 80 184 66" fill="none" stroke="url(#hS${u})" stroke-width="10"/>
   <path d="M176 70 Q178 48 196 50 Q200 66 186 76Z" fill="#2fbf5a"/><circle cx="188" cy="60" r="2.5" fill="#ffe14d" stroke-width="1.5"/><path d="M196 66 l4 4 M196 66 l6 0" stroke="#ff2e63" stroke-width="2"/>
   <path d="M30 70 Q14 40 30 20 Q34 44 50 58Z" fill="#e9e2cf"/><path d="M34 62 Q24 44 30 30 M42 60 Q36 46 38 34" fill="none" stroke-width="2.5"/>
   <path d="M50 200 Q54 160 76 146 L124 146 Q146 160 150 200Z" fill="#d9993a"/>
   <path d="M100 16 L118 30 L140 22 L144 46 L168 50 L158 72 L178 90 L156 104 L166 128 L140 128 L134 152 L112 140 L100 160 L88 140 L66 152 L60 128 L34 128 L44 104 L22 90 L42 72 L32 50 L56 46 L60 22 L82 30Z" fill="url(#hM${u})"/>
   <path d="M66 96 Q66 52 100 50 Q134 52 134 96 Q134 128 100 138 Q66 128 66 96Z" fill="url(#hF${u})"/>
   <path d="M84 110 Q100 100 116 110 L112 126 Q100 134 88 126Z" fill="#fff1d6"/><path d="M92 108 L100 116 L108 108Z" fill="#3a1c06"/><path d="M100 116 V124 M100 124 Q92 130 86 124 M100 124 Q108 130 114 124" fill="none" stroke-width="3"/>
   <path d="M70 80 L94 88 M130 80 L106 88" stroke-width="6"/>
   <path d="M74 90 Q84 84 94 92 Q84 98 74 92Z" fill="#ffe14d" stroke-width="3"/><path d="M126 90 Q116 84 106 92 Q116 98 126 92Z" fill="#ffe14d" stroke-width="3"/>
   <path d="M84 87 V96 M116 87 V96" stroke-width="3"/>
  </g>
  <path d="M40 150 Q20 170 6 160 Q14 180 36 176 Q20 196 46 196" fill="#ff7a1a" opacity=".85"/><path d="M38 156 Q24 170 16 166 Q24 178 38 172" fill="#ffe14d" opacity=".9"/></svg>`,
 "Левиафан":u=>`<svg viewBox="0 0 200 200" class="pt" aria-hidden="true"><defs><linearGradient id="lB${u}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#5ac8fa"/><stop offset=".55" stop-color="#0a5ab8"/><stop offset="1" stop-color="#062a63"/></linearGradient><linearGradient id="lW${u}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7fe7ff"/><stop offset="1" stop-color="#0a3c8c"/></linearGradient><radialGradient id="lE${u}"><stop offset="0" stop-color="#fff"/><stop offset="1" stop-color="#34ff9a"/></radialGradient></defs>
  <g stroke="#0d1030" stroke-width="5" stroke-linejoin="round" stroke-linecap="round">
   <path d="M150 170 Q196 150 186 110 Q178 80 150 92" fill="none" stroke-width="22"/><path d="M150 170 Q196 150 186 110 Q178 80 150 92" fill="none" stroke="url(#lB${u})" stroke-width="15"/>
   <path d="M178 100 L196 88 L190 108 M188 128 L200 124 L194 140" fill="#34c3ff"/>
   <path d="M40 200 Q30 150 60 120 Q80 100 76 70 L124 70 Q132 112 112 140 Q96 166 110 200Z" fill="url(#lB${u})"/>
   <path d="M62 150 Q76 160 92 150 M58 172 Q74 182 92 172 M70 128 Q84 136 98 128" fill="none" stroke="#7fe7ff" stroke-width="3"/>
   <path d="M76 70 L66 50 L84 58 L88 36 L100 54 L112 30 L116 56 L134 44 L124 70Z" fill="#34c3ff"/>
   <path d="M60 78 Q52 40 100 34 Q148 40 144 78 Q142 100 124 110 L84 110 Q62 100 60 78Z" fill="url(#lB${u})"/>
   <path d="M70 92 Q100 120 130 92 Q128 116 100 126 Q72 116 70 92Z" fill="#062a63"/>
   <path d="M76 96 l3 9 l4 -7 M88 102 l2 8 l3 -7 M112 102 l-2 8 l-3 -7 M124 96 l-3 9 l-4 -7" fill="#fff" stroke-width="2"/>
   <path d="M66 70 L94 76 M134 70 L106 76" stroke-width="6"/>
   <path d="M70 78 Q82 70 94 80 Q82 88 70 80Z" fill="url(#lE${u})" stroke-width="3"/><path d="M130 78 Q118 70 106 80 Q118 88 130 80Z" fill="url(#lE${u})" stroke-width="3"/>
   <path d="M82 74 V86 M118 74 V86" stroke-width="3"/>
   <path d="M0 186 Q20 174 40 186 T80 186 T120 186 T160 186 T200 186 V200 H0Z" fill="url(#lW${u})"/>
  </g>
  <g fill="#fff" opacity=".85"><circle cx="20" cy="170" r="3"/><circle cx="170" cy="182" r="2.5"/><circle cx="48" cy="160" r="2"/><path d="M14 178 Q24 168 34 178" fill="none" stroke="#fff" stroke-width="2"/></g></svg>`};
Object.assign(DETAILED,BEASTS);
/* ---------- три богатыря: подробные портреты ---------- */
const BOG_COMMON=(u,o)=>`<defs>
 <linearGradient id="bg${u}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff2b0"/><stop offset=".45" stop-color="#e8b33a"/><stop offset="1" stop-color="#8a5a10"/></linearGradient>
 <linearGradient id="bs${u}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset=".5" stop-color="#aab6c7"/><stop offset="1" stop-color="#4d5a70"/></linearGradient>
 <linearGradient id="bc${u}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${o.cape}"/><stop offset="1" stop-color="${o.cape2}"/></linearGradient>
 <pattern id="bm${u}" width="8" height="7" patternUnits="userSpaceOnUse"><rect width="8" height="7" fill="#9aa6b8"/><path d="M0 7 Q4 0 8 7" fill="none" stroke="#4d5a70" stroke-width="1.4"/><path d="M-4 3.5 Q0 -3.5 4 3.5 M4 3.5 Q8 -3.5 12 3.5" fill="none" stroke="#dfe6f0" stroke-width=".9"/></pattern>
 <radialGradient id="bk${u}" cx=".45" cy=".4"><stop offset="0" stop-color="#ffd9bd"/><stop offset="1" stop-color="#d9946a"/></radialGradient></defs>`;
/* тело: плащ, кольчуга, золотые оплечья и пояс */
const BOG_BODY=u=>`<path d="M24 206 L40 142 Q100 120 160 142 L176 206 Z" fill="url(#bc${u})"/>
  <path d="M42 206 C44 162 64 140 100 136 C136 140 156 162 158 206 Z" fill="url(#bm${u})"/>
  <path d="M84 140 L100 176 L116 140" fill="none" stroke="#e8b33a" stroke-width="4"/>
  <path d="M18 156 Q30 130 66 136 L70 168 Q40 166 22 180 Z M182 156 Q170 130 134 136 L130 168 Q160 166 178 180 Z" fill="url(#bg${u})"/>
  <path d="M26 160 Q40 146 66 150 M174 160 Q160 146 134 150" fill="none" stroke-width="2.5"/>
  <circle cx="44" cy="152" r="4" fill="#c0262c" stroke-width="2"/><circle cx="156" cy="152" r="4" fill="#0a84ff" stroke-width="2"/>
  <path d="M52 196 H148 V206 H52 Z" fill="url(#bg${u})"/><rect x="92" y="193" width="16" height="15" rx="3" fill="#c0262c"/>`;
/* шлем-шишак с наносником и бармицей */
const BOG_HELM=(u,m)=>`<path d="M62 90 L56 132 Q66 140 76 128 L78 96 Z M138 90 L144 132 Q134 140 124 128 L122 96 Z" fill="url(#bm${u})"/>
  <path d="M64 90 Q64 50 100 18 Q136 50 136 90 Z" fill="url(#${m}${u})"/>
  <path d="M100 18 L100 4" stroke-width="5"/><circle cx="100" cy="4" r="3.5" fill="url(#bg${u})" stroke-width="2"/>
  <path d="M100 24 Q88 50 84 86 M100 24 Q112 50 116 86" fill="none" stroke-width="2" opacity=".55"/>
  <path d="M60 82 Q100 74 140 82 L140 94 Q100 86 60 94 Z" fill="url(#bg${u})"/>
  <circle cx="80" cy="86" r="3" fill="#c0262c" stroke-width="1.5"/><circle cx="100" cy="83" r="3.5" fill="#34c759" stroke-width="1.5"/><circle cx="120" cy="86" r="3" fill="#0a84ff" stroke-width="1.5"/>
  <path d="M96 90 L104 90 L103 112 L97 112 Z" fill="url(#bs${u})" stroke-width="2.5"/>
  <path d="M76 40 Q86 28 96 26" fill="none" stroke="#fff" stroke-width="3" opacity=".8"/>`;
Object.assign(DETAILED,{
 "Илья Муромец":u=>`<svg viewBox="0 0 200 200" class="pt" aria-hidden="true">${BOG_COMMON(u,{cape:"#d0262c",cape2:"#6a0e14"})}
 <g stroke="#0d1030" stroke-width="3.5" stroke-linejoin="round" stroke-linecap="round">
  <path d="M152 206 L172 74" stroke-width="10"/><path d="M152 206 L172 74" stroke="#7a4a20" stroke-width="5"/>
  <path d="M162 70 l-6 -8 M178 66 l6 -8 M160 52 l-8 -2 M184 54 l8 -2 M170 40 l0 -9 M164 84 l-6 4 M180 82 l6 4" stroke-width="5"/>
  <circle cx="172" cy="62" r="17" fill="url(#bs${u})"/><path d="M162 56 Q168 50 174 50" fill="none" stroke="#fff" stroke-width="3"/>
  ${BOG_BODY(u)}
  <path d="M86 112 L86 136 L114 136 L114 112 Z" fill="url(#bk${u})"/>
  <path d="M72 94 Q72 66 100 64 Q128 66 128 94 Q128 116 100 120 Q72 116 72 94Z" fill="url(#bk${u})"/>
  <path d="M68 100 Q70 132 84 150 Q92 172 100 182 Q108 172 116 150 Q130 132 132 100 Q122 112 112 110 Q100 116 88 110 Q78 112 68 100Z" fill="#eceef5"/>
  <path d="M84 124 Q90 150 98 170 M100 120 V176 M116 124 Q110 150 102 170 M76 112 Q80 132 88 146 M124 112 Q120 132 112 146" fill="none" stroke="#a9b0c4" stroke-width="2"/>
  <path d="M78 108 Q90 100 100 106 Q110 100 122 108 Q112 116 100 112 Q88 116 78 108Z" fill="#dfe2ec"/>
  <path d="M77 86 Q86 80 95 86 M105 86 Q114 80 123 86" fill="none" stroke="#eceef5" stroke-width="6"/>
  <path d="M80 92 Q86 89 92 92 M108 92 Q114 89 120 92" fill="none" stroke-width="3"/><circle cx="86" cy="93" r="2" fill="#0d1030" stroke-width="0"/><circle cx="114" cy="93" r="2" fill="#0d1030" stroke-width="0"/>
  <path d="M74 80 L84 76 M126 80 L116 76" fill="none" stroke-width="1.5" opacity=".5"/>
  ${BOG_HELM(u,"bg")}
 </g></svg>`,
 "Добрыня Никитич":u=>`<svg viewBox="0 0 200 200" class="pt" aria-hidden="true">${BOG_COMMON(u,{cape:"#2a6ad6",cape2:"#0b2a63"})}
 <g stroke="#0d1030" stroke-width="3.5" stroke-linejoin="round" stroke-linecap="round">
  <path d="M158 132 L176 4 L186 8 L170 136 Z" fill="url(#bs${u})"/><path d="M168 120 L180 14" stroke="#fff" stroke-width="2" opacity=".8"/>
  <path d="M146 130 L182 140" stroke-width="9"/><path d="M146 130 L182 140" stroke="#e8b33a" stroke-width="4"/><path d="M164 136 L160 160" stroke="#5a2a10" stroke-width="9"/>
  ${BOG_BODY(u)}
  <circle cx="38" cy="168" r="34" fill="#c0262c"/><circle cx="38" cy="168" r="26" fill="none" stroke="url(#bg${u})" stroke-width="5"/>
  <path d="M38 142 V194 M12 168 H64 M20 150 L56 186 M56 150 L20 186" stroke="#e8b33a" stroke-width="2.5"/><circle cx="38" cy="168" r="8" fill="url(#bg${u})"/>
  <path d="M86 112 L86 136 L114 136 L114 112 Z" fill="url(#bk${u})"/>
  <path d="M72 94 Q72 66 100 64 Q128 66 128 94 Q128 116 100 120 Q72 116 72 94Z" fill="url(#bk${u})"/>
  <path d="M72 102 Q74 128 90 142 L98 154 L100 140 L102 154 L110 142 Q126 128 128 102 Q120 112 110 110 Q100 114 90 110 Q80 112 72 102Z" fill="#6b3a1a"/>
  <path d="M86 120 Q92 132 96 144 M114 120 Q108 132 104 144" fill="none" stroke="#3a1c06" stroke-width="2"/>
  <path d="M78 108 Q90 100 100 106 Q110 100 122 108 Q112 115 100 111 Q88 115 78 108Z" fill="#4a2410"/>
  <path d="M78 86 Q86 81 95 85 M105 85 Q114 81 122 86" fill="none" stroke="#4a2410" stroke-width="5"/>
  <path d="M81 93 Q87 89 93 93 M107 93 Q113 89 119 93" fill="none" stroke-width="3"/><circle cx="87" cy="94" r="2.2" fill="#0d1030" stroke-width="0"/><circle cx="113" cy="94" r="2.2" fill="#0d1030" stroke-width="0"/>
  ${BOG_HELM(u,"bs")}
 </g></svg>`,
 "Алёша Попович":u=>`<svg viewBox="0 0 200 200" class="pt" aria-hidden="true">${BOG_COMMON(u,{cape:"#34c759",cape2:"#0d5c2a"})}
 <g stroke="#0d1030" stroke-width="3.5" stroke-linejoin="round" stroke-linecap="round">
  <path d="M16 200 Q-6 110 36 22" fill="none" stroke-width="9"/><path d="M16 200 Q-6 110 36 22" fill="none" stroke="#a8642a" stroke-width="5"/><path d="M36 22 L18 200" stroke="#f4f1ea" stroke-width="1.5"/>
  <path d="M142 150 L170 20 L188 26 L160 156 Z" fill="#7a4a20"/><path d="M172 22 L166 4 M180 25 L180 6 M176 24 L172 6" stroke-width="3"/>
  <path d="M164 6 l6 -6 l4 8 Z M176 4 l6 -4 l2 8 Z" fill="#fff" stroke-width="2"/>
  ${BOG_BODY(u)}
  <path d="M86 112 L86 136 L114 136 L114 112 Z" fill="url(#bk${u})"/>
  <path d="M66 96 Q58 112 68 122 Q66 108 74 104Z M134 96 Q142 112 132 122 Q134 108 126 104Z" fill="#ffcc4d"/>
  <path d="M72 94 Q72 66 100 64 Q128 66 128 94 Q128 122 100 128 Q72 122 72 94Z" fill="url(#bk${u})"/>
  <path d="M84 106 Q92 101 100 105 Q108 101 116 106 Q108 108 100 108 Q92 108 84 106Z" fill="#e0a830" stroke-width="2"/>
  <path d="M88 114 Q100 122 114 112" fill="none" stroke-width="3"/>
  <path d="M78 84 Q86 80 94 84 M106 82 Q114 77 122 82" fill="none" stroke="#c98a1a" stroke-width="4"/>
  <path d="M81 92 Q87 88 93 92 M107 90 Q113 87 119 91" fill="none" stroke-width="3"/><circle cx="87" cy="93" r="2.2" fill="#0d1030" stroke-width="0"/><circle cx="113" cy="92" r="2.2" fill="#0d1030" stroke-width="0"/>
  <path d="M78 100 Q82 103 86 101 M114 101 Q118 103 122 100" fill="none" stroke="#e0806a" stroke-width="2.5"/>
  ${BOG_HELM(u,"bs")}
  <path d="M62 96 Q58 86 66 82 Q62 92 70 96Z M138 96 Q142 86 134 82 Q138 92 130 96Z" fill="#ffcc4d"/>
 </g></svg>`});
Object.assign(DETAILED,{
 "Тор":u=>`<svg viewBox="0 0 200 200" class="pt" aria-hidden="true">${BOG_COMMON(u,{cape:"#d0262c",cape2:"#5a0a10"})}
 <defs><linearGradient id="tl${u}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="#7fe7ff"/></linearGradient></defs>
 <path d="M150 0 L134 40 L150 42 L128 92" fill="none" stroke="#7fe7ff" stroke-width="7" opacity=".55"/><path d="M150 0 L134 40 L150 42 L128 92" fill="none" stroke="#fff" stroke-width="2.5"/>
 <path d="M40 4 L52 30 L40 32 L56 62" fill="none" stroke="#7fe7ff" stroke-width="5" opacity=".5"/><path d="M40 4 L52 30 L40 32 L56 62" fill="none" stroke="#fff" stroke-width="2"/>
 <g stroke="#0d1030" stroke-width="3.5" stroke-linejoin="round" stroke-linecap="round">
  <path d="M160 206 L166 104" stroke-width="11"/><path d="M160 206 L166 104" stroke="#7a4a20" stroke-width="6"/><path d="M161 190 l9 -4 M162 176 l9 -4 M163 162 l9 -4" stroke="#e8b33a" stroke-width="3"/>
  <path d="M138 64 L194 64 L196 108 L136 108 Z" fill="url(#bs${u})"/><path d="M138 76 H194 M138 96 H196" stroke-width="2.5"/>
  <path d="M152 70 L178 70 L178 102 L152 102 Z" fill="none" stroke="#e8b33a" stroke-width="3"/><path d="M158 86 l7 -10 l7 10 l-7 10 Z" fill="#7fe7ff" stroke-width="2"/>
  <path d="M144 70 Q150 66 160 68" fill="none" stroke="#fff" stroke-width="3"/>
  <path d="M24 206 L40 142 Q100 120 160 142 L176 206 Z" fill="url(#bc${u})"/>
  <path d="M42 206 C44 162 64 140 100 136 C136 140 156 162 158 206 Z" fill="#3a3f5a"/>
  <circle cx="72" cy="168" r="11" fill="url(#bs${u})"/><circle cx="100" cy="164" r="11" fill="url(#bs${u})"/><circle cx="128" cy="168" r="11" fill="url(#bs${u})"/>
  <circle cx="72" cy="192" r="11" fill="url(#bs${u})"/><circle cx="100" cy="190" r="11" fill="url(#bs${u})"/><circle cx="128" cy="192" r="11" fill="url(#bs${u})"/>
  <path d="M18 156 Q30 130 66 136 L70 168 Q40 166 22 180 Z M182 156 Q170 130 134 136 L130 168 Q160 166 178 180 Z" fill="url(#bs${u})"/>
  <path d="M86 112 L86 136 L114 136 L114 112 Z" fill="url(#bk${u})"/>
  <path d="M72 94 Q72 66 100 64 Q128 66 128 94 Q128 116 100 120 Q72 116 72 94Z" fill="url(#bk${u})"/>
  <path d="M60 70 Q56 110 70 126 L74 96 Z M140 70 Q144 110 130 126 L126 96 Z" fill="#d9622a"/>
  <path d="M70 102 Q72 132 88 148 L100 164 L112 148 Q128 132 130 102 Q120 112 110 110 Q100 114 90 110 Q80 112 70 102Z" fill="#d9622a"/>
  <path d="M90 128 L94 150 M100 124 V160 M110 128 L106 150" fill="none" stroke="#8a3a12" stroke-width="2"/>
  <path d="M78 108 Q90 100 100 106 Q110 100 122 108 Q112 116 100 112 Q88 116 78 108Z" fill="#b84a1a"/>
  <path d="M78 85 Q86 80 95 85 M105 85 Q114 80 122 85" fill="none" stroke="#b84a1a" stroke-width="5"/>
  <path d="M81 92 Q87 88 93 92 Q87 96 81 92Z M107 92 Q113 88 119 92 Q113 96 107 92Z" fill="url(#tl${u})" stroke-width="2"/>
  <path d="M66 80 Q66 50 100 46 Q134 50 134 80 Z" fill="url(#bs${u})"/>
  <path d="M64 76 H136 V86 H64 Z" fill="url(#bg${u})"/><circle cx="100" cy="64" r="6" fill="#7fe7ff"/>
  <path d="M66 70 Q40 60 26 30 Q46 42 54 40 Q44 30 44 16 Q60 36 72 62 Z" fill="#f4f7fb"/><path d="M134 70 Q160 60 174 30 Q154 42 146 40 Q156 30 156 16 Q140 36 128 62 Z" fill="#f4f7fb"/>
  <path d="M60 58 Q48 44 46 30 M140 58 Q152 44 154 30" fill="none" stroke-width="2" opacity=".5"/>
  <path d="M80 56 Q88 50 96 50" fill="none" stroke="#fff" stroke-width="3"/>
 </g></svg>`});
Object.assign(DETAILED,{
 "Три богатыря":u=>{const inner=(n,x,y,w)=>DETAILED[n](u+n.length).replace('<svg viewBox="0 0 200 200" class="pt" aria-hidden="true">',`<svg x="${x}" y="${y}" width="${w}" height="${w}" viewBox="0 0 200 200">`);
  return `<svg viewBox="0 0 200 200" class="pt" aria-hidden="true">${inner("Добрыня Никитич",-18,44,150)}${inner("Алёша Попович",68,44,150)}${inner("Илья Муромец",22,18,170)}</svg>`},
 "Зевс":u=>`<svg viewBox="0 0 200 200" class="pt" aria-hidden="true">${BOG_COMMON(u,{cape:"#7a3ad0",cape2:"#2a0a50"})}
 <path d="M170 0 L150 50 L166 52 L140 110" fill="none" stroke="#ffe14d" stroke-width="8" opacity=".5"/>
 <g stroke="#0d1030" stroke-width="3.5" stroke-linejoin="round" stroke-linecap="round">
  <path d="M176 10 L156 58 L170 60 L146 112 L152 70 L140 68 Z" fill="#ffe14d"/><path d="M168 22 L156 52" stroke="#fff" stroke-width="2"/>
  <path d="M24 206 L40 142 Q100 120 160 142 L176 206 Z" fill="url(#bc${u})"/>
  <path d="M42 206 C44 162 64 140 100 136 C136 140 156 162 158 206 Z" fill="#f4f1ea"/>
  <path d="M60 206 Q70 170 96 150 M80 206 Q90 176 112 156 M120 206 Q126 180 140 164" fill="none" stroke="#c9c2b0" stroke-width="2.5"/>
  <path d="M38 152 Q58 136 96 142 L150 206 L128 206 L90 158 Q66 154 48 168Z" fill="url(#bg${u})"/>
  <path d="M86 112 L86 136 L114 136 L114 112 Z" fill="url(#bk${u})"/>
  <path d="M60 92 Q50 70 66 56 Q62 44 78 40 Q84 28 100 30 Q116 28 122 40 Q138 44 134 56 Q150 70 140 92 Z" fill="#eceef5"/>
  <path d="M72 94 Q72 66 100 64 Q128 66 128 94 Q128 116 100 120 Q72 116 72 94Z" fill="url(#bk${u})"/>
  <path d="M64 98 Q58 120 70 134 Q66 150 80 158 Q82 174 100 180 Q118 174 120 158 Q134 150 130 134 Q142 120 136 98 Q124 114 112 110 Q100 116 88 110 Q76 114 64 98Z" fill="#eceef5"/>
  <path d="M76 124 q6 6 0 12 M90 132 q6 6 0 12 M110 132 q-6 6 0 12 M124 124 q-6 6 0 12 M100 140 q5 8 0 16" fill="none" stroke="#a9b0c4" stroke-width="2"/>
  <path d="M78 108 Q90 100 100 106 Q110 100 122 108 Q112 116 100 112 Q88 116 78 108Z" fill="#dfe2ec"/>
  <path d="M77 84 Q86 78 95 84 M105 84 Q114 78 123 84" fill="none" stroke="#eceef5" stroke-width="6"/>
  <path d="M81 92 Q87 88 93 92 Q87 96 81 92Z M107 92 Q113 88 119 92 Q113 96 107 92Z" fill="#ffe14d" stroke-width="2"/>
  <path d="M66 70 Q100 52 134 70" fill="none" stroke="#3a8a2a" stroke-width="6"/>
  <g fill="#7ee89a" stroke-width="2"><path d="M70 66 q-8 -8 2 -12 q4 6 -2 12Z M82 60 q-6 -10 4 -12 q2 8 -4 12Z M96 57 q-2 -10 6 -10 q0 8 -6 10Z M112 58 q2 -10 8 -8 q-2 8 -8 8Z M126 63 q6 -8 10 -4 q-4 6 -10 4Z"/></g>
 </g></svg>`,
 "Геракл":u=>`<svg viewBox="0 0 200 200" class="pt" aria-hidden="true">${BOG_COMMON(u,{cape:"#c98a2a",cape2:"#6a3a0a"})}
 <defs><radialGradient id="hl${u}" cx=".5" cy=".4"><stop offset="0" stop-color="#e0a85a"/><stop offset="1" stop-color="#8a5414"/></radialGradient></defs>
 <g stroke="#0d1030" stroke-width="3.5" stroke-linejoin="round" stroke-linecap="round">
  <path d="M150 206 Q148 140 160 70 Q170 50 186 58 Q190 80 176 140 Q170 180 172 206Z" fill="#8a5414"/>
  <path d="M164 80 l-6 -4 M178 96 l8 -2 M168 112 l-7 -2 M180 130 l7 0 M170 150 l-7 -1" stroke-width="3"/>
  <path d="M30 206 Q34 150 70 132 L130 132 Q166 150 170 206 Z" fill="url(#bk${u})"/>
  <path d="M100 150 V200 M72 160 Q86 172 100 160 Q114 172 128 160 M76 184 Q88 192 100 186 Q112 192 124 184" fill="none" stroke="#b07048" stroke-width="3"/>
  <path d="M40 150 Q60 128 100 130 Q80 150 70 206 L44 206 Z" fill="url(#hl${u})"/>
  <path d="M86 112 L86 134 L114 134 L114 112 Z" fill="url(#bk${u})"/>
  <path d="M72 94 Q72 66 100 64 Q128 66 128 94 Q128 118 100 124 Q72 118 72 94Z" fill="url(#bk${u})"/>
  <path d="M74 104 Q78 126 100 130 Q122 126 126 104 Q116 114 100 112 Q84 114 74 104Z" fill="#3a1c06"/>
  <path d="M82 108 Q100 102 118 108 Q110 114 100 112 Q90 114 82 108Z" fill="#2a1404"/>
  <path d="M79 85 Q87 80 95 86 M105 86 Q113 80 121 85" fill="none" stroke="#2a1404" stroke-width="5"/>
  <path d="M81 92 Q87 88 93 92 M107 92 Q113 88 119 92" fill="none" stroke-width="3"/><circle cx="87" cy="93" r="2.2" fill="#0d1030" stroke-width="0"/><circle cx="113" cy="93" r="2.2" fill="#0d1030" stroke-width="0"/>
  <path d="M50 100 Q40 60 62 34 Q80 14 100 16 Q120 14 138 34 Q160 60 150 100 Q140 80 130 74 Q118 62 100 62 Q82 62 70 74 Q60 80 50 100Z" fill="url(#hl${u})"/>
  <path d="M52 96 Q44 110 48 128 Q58 116 62 100 M148 96 Q156 110 152 128 Q142 116 138 100" fill="#b8740f"/>
  <path d="M74 50 Q86 40 100 40 Q114 40 126 50 Q118 60 100 58 Q82 60 74 50Z" fill="#c98a2a"/>
  <path d="M84 48 Q90 44 96 48 Q90 52 84 48Z M104 48 Q110 44 116 48 Q110 52 104 48Z" fill="#ffd60a" stroke-width="2"/>
  <path d="M94 56 l6 6 l6 -6" fill="#3a1c06" stroke-width="2"/>
  <path d="M60 40 l-6 -12 l12 6 M140 40 l6 -12 l-12 6" fill="#c98a2a"/>
  <path d="M70 66 l4 10 l4 -8 l4 10 M130 66 l-4 10 l-4 -8 l-4 10" fill="#fff" stroke-width="2"/>
 </g></svg>`});
/* ---------- warrior portraits drawn in code: cel-shaded comic style, unique tint per card ---------- */
const INK="#0d1030";
const SK=["#f1c7a3","#e0ac83","#c98c62","#a86f4a"];
function shade(hex,k){const n=parseInt(hex.slice(1),16);let r=n>>16,g=n>>8&255,b=n&255;const f=v=>Math.max(0,Math.min(255,Math.round(k<0?v*(1+k):v+(255-v)*k)));return "#"+[f(r),f(g),f(b)].map(x=>x.toString(16).padStart(2,"0")).join("")}
function portrait(h,c,mini){
  const name=HEROES[h][0];
  if(DETAILED[name])return DETAILED[name]((c?c.id:"x")+"_"+h+(mini?"s":"")+"_"+(++portrait.n));
  const W=HEROES[h][4],u="p"+h+"_"+(c?c.id:"x")+(mini?"s":"")+"_"+(++portrait.n);
  const hue=c&&c.hue!=null?c.hue:W.hue;
  const MS=W.gold?["#fff2b0","#e8b33a","#8a5a10"]:W.bronze?["#ffe29a","#d9993a","#7a4a14"]:["#f4f7fb","#aab6c7","#5d6a7e"];
  const M=`url(#M${u})`,m2=MS[2],CL=`url(#C${u})`,cloth2=`hsl(${hue} 55% 30%)`;
  const skinBase=W.skinc||SK[W.skin||0],SKF=`url(#S${u})`;
  const st=`stroke="${INK}" stroke-linejoin="round" stroke-linecap="round"`;
  const shadow=(d)=>`<path d="${d}" fill="#000" fill-opacity=".2"/>`;
  const shine=(d,w=3.5)=>`<path d="${d}" fill="none" stroke="#fff" stroke-width="${w}" stroke-linecap="round" opacity=".75"/>`;
  let defs=`<linearGradient id="M${u}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${MS[0]}"/><stop offset=".5" stop-color="${MS[1]}"/><stop offset="1" stop-color="${MS[2]}"/></linearGradient>
<linearGradient id="C${u}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="hsl(${hue} 70% 58%)"/><stop offset="1" stop-color="hsl(${hue} 60% 34%)"/></linearGradient>
<radialGradient id="S${u}" cx=".62" cy=".36" r=".8"><stop offset="0" stop-color="${shade(skinBase,.25)}"/><stop offset=".6" stop-color="${skinBase}"/><stop offset="1" stop-color="${shade(skinBase,-.25)}"/></radialGradient>
<pattern id="L${u}" width="7" height="7" patternUnits="userSpaceOnUse"><circle cx="3.5" cy="3.5" r="2.4" fill="none" stroke="${MS[2]}" stroke-width="1.5"/></pattern>`;
  if(W.glow)defs+=`<radialGradient id="G${u}"><stop offset="0" stop-color="#fff"/><stop offset=".35" stop-color="${W.glow}"/><stop offset="1" stop-color="${W.glow}" stop-opacity="0"/></radialGradient>`;
  let o="";
  /* weapon behind the right shoulder */
  o+={
    spear:`<path d="M176 204 L150 20" ${st} stroke-width="10"/><path d="M176 204 L150 20" stroke="#8a5a2b" stroke-width="5"/><path d="M150 8 C141 22 142 38 152 46 C160 36 160 20 150 8 Z" fill="${M}" ${st}/>${shine("M150 15 L151 38",2)}`,
    pitch:`<path d="M156 204 L150 52" ${st} stroke-width="10"/><path d="M156 204 L150 52" stroke="#8a5a2b" stroke-width="5"/><path d="M132 20 L134 54 L166 54 L168 20 M150 18 L150 54" fill="none" ${st} stroke-width="5"/><path d="M132 20 L134 54 L166 54 L168 20 M150 18 L150 54" fill="none" stroke="${MS[1]}" stroke-width="2"/>`,
    sword:`<g transform="rotate(18 150 150)"><path d="M143 160 L143 44 L150 28 L157 44 L157 160 Z" fill="${M}" ${st}/>${shine("M147 50 L147 150",2)}<path d="M128 160 L172 160" ${st} stroke-width="9"/><path d="M128 160 L172 160" stroke="#e8b33a" stroke-width="4"/><path d="M150 164 L150 188" stroke="#5b3a1a" stroke-width="9" stroke-linecap="round"/></g>`,
    axe:`<g transform="rotate(14 150 150)"><path d="M150 200 L150 36" ${st} stroke-width="11"/><path d="M150 200 L150 36" stroke="#8a5a2b" stroke-width="6"/><path d="M150 46 C176 32 194 50 190 88 C178 78 164 76 150 80 Z" fill="${M}" ${st}/>${shine("M162 48 C174 50 182 60 184 74",2.5)}</g>`,
    katana:`<path d="M134 196 Q150 110 180 22" fill="none" ${st} stroke-width="9"/><path d="M134 196 Q150 110 180 22" fill="none" stroke="${MS[0]}" stroke-width="4.5"/><path d="M126 170 L150 178" ${st} stroke-width="8"/><path d="M126 170 L150 178" stroke="#e8b33a" stroke-width="3.5"/>`,
    bow:`<path d="M146 26 Q200 112 146 198" fill="none" ${st} stroke-width="11"/><path d="M146 26 Q200 112 146 198" fill="none" stroke="#7a4b22" stroke-width="6"/><path d="M146 26 L146 198" stroke="${INK}" stroke-width="2"/>`,
    musket:`<g transform="rotate(16 150 150)"><rect x="144" y="22" width="12" height="170" rx="4" fill="#6b4220" ${st}/><rect x="146.5" y="8" width="7" height="46" fill="${M}" ${st} stroke-width="2.5"/></g>`,
    halberd:`<path d="M154 204 L150 26" ${st} stroke-width="9"/><path d="M154 204 L150 26" stroke="#8a5a2b" stroke-width="4.5"/><path d="M150 14 L142 34 L158 34 Z M150 42 C176 36 182 54 178 74 C168 66 158 64 150 66 Z" fill="${M}" ${st}/>`,
    sling:`<path d="M140 196 Q172 120 156 70" fill="none" ${st} stroke-width="6"/><path d="M140 196 Q172 120 156 70" fill="none" stroke="#7a4b22" stroke-width="3"/><circle cx="156" cy="64" r="8" fill="#8f8f8f" ${st}/>`,
    staff:`<path d="M166 204 L156 40" ${st} stroke-width="10"/><path d="M166 204 L156 40" stroke="${W.gold?"#e8b33a":"#6b4220"}" stroke-width="5"/>`+(W.glow?`<circle cx="155" cy="30" r="30" fill="url(#G${u})"/><path d="M155 14 L165 30 L155 46 L145 30 Z" fill="${W.glow}" ${st}/>${shine("M152 22 L149 30",2)}`:`<circle cx="156" cy="34" r="9" fill="${M}" ${st}/>`)+(W.head==="jackal"?`<path d="M140 46 Q156 30 172 46" fill="none" ${st} stroke-width="5"/><path d="M140 46 Q156 30 172 46" fill="none" stroke="#e8b33a" stroke-width="2.5"/>`:""),
    banner:`<path d="M164 204 L150 12" ${st} stroke-width="9"/><path d="M164 204 L150 12" stroke="#8a5a2b" stroke-width="4.5"/><path d="M151 18 L196 26 L188 46 L198 62 L154 58 Z" fill="#f4f1ea" ${st}/><path d="M164 30 l6 8 l6 -8 M168 44 l4 6 l4 -6" fill="none" stroke="#e8b33a" stroke-width="3"/>`
  }[W.weapon]||"";
  /* behind head: long hair, hoods, neck guards */
  const hc=W.hairc||"#2a1a10";
  if(W.hair==="long")o+=`<path d="M60 96 Q58 46 100 44 Q142 46 140 96 L148 156 Q124 150 118 124 L82 124 Q76 150 52 156 Z" fill="${hc}" ${st}/>`;
  if(W.hair==="braids")o+=`<path d="M64 100 Q60 48 100 46 Q140 48 136 100 L132 118 L68 118 Z" fill="${hc}" ${st}/>`;
  if(W.hair==="bob")o+=`<path d="M62 108 Q58 50 100 48 Q142 50 138 108 Q134 122 124 122 L76 122 Q66 122 62 108 Z" fill="${hc}" ${st}/>`;
  if(W.hair==="pony")o+=`<path d="M126 64 Q170 70 160 150 Q150 116 128 92 Z" fill="${hc}" ${st}/>`;
  if(W.hair==="snakes"){let sn="";for(let i=0;i<9;i++){const a=-2.6+i*.65,x=100+Math.cos(a)*44,y=92+Math.sin(a)*44,x2=100+Math.cos(a)*62,y2=92+Math.sin(a)*62;
    sn+=`<path d="M${100+Math.cos(a)*24} ${92+Math.sin(a)*24} Q${x+8} ${y-6} ${x2} ${y2}" fill="none" ${st} stroke-width="10"/><path d="M${100+Math.cos(a)*24} ${92+Math.sin(a)*24} Q${x+8} ${y-6} ${x2} ${y2}" fill="none" stroke="#4f9a4a" stroke-width="5.5"/><circle cx="${x2}" cy="${y2}" r="5.5" fill="#3f8a3a" ${st} stroke-width="2.5"/><circle cx="${x2+1.5}" cy="${y2-1}" r="1.3" fill="#ffe14d"/>`}o+=sn}
  if(W.helm==="shishak")o+=`<path d="M64 86 L62 126 Q100 138 138 126 L136 86 Z" fill="url(#L${u})" ${st}/><path d="M64 86 L62 126 Q100 138 138 126 L136 86 Z" fill="${MS[1]}" fill-opacity=".35"/>`;
  if(W.helm==="berserk")o+=`<path d="M62 116 L50 80 L68 86 L64 54 L84 72 L90 42 L102 64 L114 42 L118 72 L138 54 L134 86 L152 80 L138 116 Z" fill="#6b3d1f" ${st}/>`;
  if(W.helm==="hood"||W.helm==="phood")o+=`<path d="M60 134 Q56 ${W.helm==="phood"?"38 100 22 Q144 38":"56 100 46 Q144 56"} 140 134 Z" fill="${cloth2}" ${st}/>`;
  if(W.helm==="wizard")o+=`<path d="M56 140 Q50 60 100 50 Q150 60 144 140 Z" fill="#1d2a6b" ${st}/>`;
  if(W.helm==="ninja")o+=`<path d="M64 132 Q60 50 100 48 Q140 50 136 132 Z" fill="#23243a" ${st}/>`;
  if(W.helm==="gaul")o+=`<path d="M64 124 Q54 68 100 56 Q146 68 136 124 Q140 90 126 78 Q100 70 74 78 Q60 90 64 124 Z" fill="#c4842c" ${st}/>`;
  if(W.helm==="kabuto")o+=`<path d="M58 80 L142 80 L158 116 L42 116 Z" fill="${W.gold?"#b8861e":"#2a2a3a"}" ${st}/><path d="M50 96 H150 M46 106 H154" stroke="${W.gold?"#fff2b0":"#e8b33a"}" stroke-width="2.5"/>`;
  if(W.head==="jackal")o+=`<path d="M60 84 L140 84 L150 150 L120 136 L80 136 L50 150 Z" fill="#e8b33a" ${st}/><path d="M58 100 L142 100 M56 116 L144 116 M54 132 L146 132" stroke="#1f3fae" stroke-width="5"/>`;
  /* cape behind body */
  if(W.cape)o+=`<path d="M24 206 C26 160 46 130 72 122 L128 122 C154 130 174 160 176 206 Z" fill="${W.cape}" ${st}/>${shadow("M24 206 C26 160 46 130 72 122 L84 122 C60 136 46 170 44 206 Z")}`;
  /* body + armor */
  const body="M38 206 Q42 142 100 132 Q158 142 162 206 Z";
  o+=`<path d="${body}" fill="${CL}" ${st}/>`;
  o+={cloth:"",
    mail:`<path d="M54 206 Q58 152 100 144 Q142 152 146 206 Z" fill="url(#L${u})"/>`,
    plate:`<path d="M58 206 Q60 154 100 144 Q140 154 142 206 Z" fill="${M}" ${st}/><path d="M74 166 Q86 156 98 162 M102 162 Q114 156 126 166 M100 164 L100 204" fill="none" ${st} stroke-width="2.5"/>${shine("M112 152 Q124 156 130 166",3)}`,
    lam:`<path d="M54 206 Q58 152 100 144 Q142 152 146 206 Z" fill="${W.gold?M:"#a3262a"}" ${st}/><path d="M58 166 H142 M56 182 H144 M55 198 H145" ${st} stroke-width="2.4"/><path d="M70 166 v16 M86 166 v16 M100 166 v16 M114 166 v16 M130 166 v16 M64 182 v16 M80 182 v16 M100 182 v16 M120 182 v16 M136 182 v16" stroke="${W.gold?"#c0262c":"#e8b33a"}" stroke-width="2.6"/>`,
    pelt:`<path d="M34 170 C40 138 66 128 100 130 C134 128 160 138 166 170 C150 158 128 154 100 156 C72 154 50 158 34 170 Z" fill="#7a4a24" ${st}/><path d="M46 158 l6 8 M60 150 l5 9 M76 146 l3 9 M124 146 l-3 9 M140 150 l-5 9 M154 158 l-6 8" stroke="#2e1a0c" stroke-width="2.5"/>`}[W.armor||"cloth"];
  o+=shadow("M38 206 Q42 142 100 132 Q74 144 64 206 Z");
  /* neck + head */
  const creature=W.head;
  if(!creature){
    o+=`<path d="M87 110 L87 138 L113 138 L113 110 Z" fill="${SKF}" ${st}/>`+shadow("M87 128 L113 128 L113 138 L87 138 Z");
    o+=`<circle cx="100" cy="92" r="30" fill="${SKF}" ${st}/>`;
    // face
    const fem=W.female,fierce=W.fierce;
    const eyes=fem?`<ellipse cx="88" cy="95" rx="4.6" ry="5.4" fill="${INK}"/><ellipse cx="112" cy="95" rx="4.6" ry="5.4" fill="${INK}"/><circle cx="89.5" cy="93.5" r="1.7" fill="#fff"/><circle cx="113.5" cy="93.5" r="1.7" fill="#fff"/>`
      :`<ellipse cx="89" cy="95" rx="3.8" ry="4.6" fill="${W.glow&&!fem?W.glow:INK}"/><ellipse cx="111" cy="95" rx="3.8" ry="4.6" fill="${W.glow&&!fem?W.glow:INK}"/><circle cx="90" cy="93.6" r="1.3" fill="#fff"/><circle cx="112" cy="93.6" r="1.3" fill="#fff"/>`;
    o+=`<g class="eyes">${eyes}</g>`;
    if(fem)o+=`<path d="M82 89 L80 86 M85 88 L84 85 M118 89 L120 86 M115 88 L116 85" ${st} stroke-width="2"/><path d="M83 84 Q88 81 94 83 M106 83 Q112 81 117 84" ${st} stroke-width="2.4" fill="none"/><path d="M94 109 Q100 113 106 109 Q100 106 94 109 Z" fill="#c0475a" stroke="${INK}" stroke-width="2"/><circle cx="80" cy="104" r="4" fill="#ff8a8a" opacity=".35"/><circle cx="120" cy="104" r="4" fill="#ff8a8a" opacity=".35"/>`;
    else o+=(fierce?`<path d="M81 84 L96 90 M119 84 L104 90" ${st} stroke-width="4" stroke="${W.brows||INK}"/>`:`<path d="M82 86 Q89 82 96 86 M104 86 Q111 82 118 86" fill="none" ${st} stroke-width="3.4" stroke="${W.brows||INK}"/>`)+`<path d="M93 109 Q100 ${fierce?105:113} 107 109" fill="none" ${st} stroke-width="3"/><path d="M98 98 Q100 103 103 101" fill="none" stroke="${shade(skinBase,-.35)}" stroke-width="2.4"/>`;
    o+=shadow("M70 92 A30 30 0 0 0 100 122 A34 34 0 0 1 80 92 A34 34 0 0 1 100 62 A30 30 0 0 0 70 92 Z");
    if(W.beard)o+=`<path d="M70 98 Q72 138 100 148 Q128 138 130 98 Q120 112 100 112 Q80 112 70 98 Z" fill="${W.beard}" ${st}/><path d="M86 118 Q90 132 100 138 Q110 132 114 118" fill="none" stroke="${shade(W.beard,-.3)}" stroke-width="2.5"/>`;
    if(W.stache)o+=`<path d="M81 106 Q92 98 100 104 Q108 98 119 106 Q121 116 112 110 Q100 106 88 110 Q79 116 81 106 Z" fill="${W.stache}" ${st} stroke-width="2.5"/>`;
    // front hair for women
    if(W.hair==="braids"){o+=`<path d="M70 86 Q76 56 100 54 Q124 56 130 86 Q116 70 100 72 Q84 70 70 86 Z" fill="${hc}" ${st}/>`;
      for(const s of[-1,1]){let br="";for(let k=0;k<5;k++)br+=`<ellipse cx="${100+s*(30+k*1.5)}" cy="${118+k*11}" rx="7" ry="7" fill="${hc}" ${st} stroke-width="2.6"/>`;o+=br+`<rect x="${100+s*37.5-6}" y="170" width="12" height="5" fill="#c0392b" ${st} stroke-width="2"/>`}}
    if(W.hair==="long"||W.hair==="bob"||W.hair==="pony")o+=`<path d="M68 90 Q72 54 100 52 Q128 54 132 90 Q122 70 104 72 L100 64 L94 72 Q78 72 68 90 Z" fill="${hc}" ${st}/>`;
    if(W.hair==="snakes")o+=`<path d="M70 84 Q78 58 100 56 Q122 58 130 84 Q116 72 100 74 Q84 72 70 84 Z" fill="#3f8a3a" ${st}/>`;
  }else if(creature==="bull"){
    o+=`<path d="M70 70 C58 52 46 50 34 56 C46 60 56 70 62 84 Z M130 70 C142 52 154 50 166 56 C154 60 144 70 138 84 Z" fill="#f2e6c8" ${st}/>`;
    o+=`<path d="M64 84 L48 78 L58 96 Z M136 84 L152 78 L142 96 Z" fill="#6b3d1f" ${st}/>`;
    o+=`<path d="M68 70 Q100 50 132 70 Q142 98 126 120 Q118 142 100 144 Q82 142 74 120 Q58 98 68 70 Z" fill="#7a4626" ${st}/>`;
    o+=shadow("M68 70 Q100 50 132 70 Q100 60 84 84 Q74 110 86 140 Q78 134 74 120 Q58 98 68 70 Z");
    o+=`<ellipse cx="100" cy="124" rx="20" ry="14" fill="#c48a5a" ${st}/><ellipse cx="92" cy="124" rx="3.5" ry="4.5" fill="${INK}"/><ellipse cx="108" cy="124" rx="3.5" ry="4.5" fill="${INK}"/><path d="M90 134 Q100 146 110 134" fill="none" stroke="#e8b33a" stroke-width="5"/><path d="M90 134 Q100 146 110 134" fill="none" ${st} stroke-width="1.5"/>`;
    o+=`<g class="eyes"><path d="M80 94 L94 98 L90 104 L80 101 Z M120 94 L106 98 L110 104 L120 101 Z" fill="${W.glow}" ${st} stroke-width="2.5"/></g><path d="M78 88 L96 94 M122 88 L104 94" ${st} stroke-width="4"/>`;
  }else if(creature==="jackal"){
    o+=`<path d="M74 72 L66 22 L94 58 Z M126 72 L134 22 L106 58 Z" fill="#20202c" ${st}/><path d="M76 62 L72 36 L88 56 Z M124 62 L128 36 L112 56 Z" fill="#e8b33a"/>`;
    o+=`<path d="M70 76 Q100 54 130 76 Q134 102 114 122 L106 146 L94 146 L86 122 Q66 102 70 76 Z" fill="#22222e" ${st}/>`;
    o+=shine("M84 66 Q100 58 116 66",3);
    o+=`<ellipse cx="100" cy="144" rx="7" ry="5" fill="#0a0a12" ${st} stroke-width="2.5"/>`;
    o+=`<g class="eyes"><path d="M78 92 L94 96 L92 101 L80 99 Z M122 92 L106 96 L108 101 L120 99 Z" fill="${W.glow}" stroke="${W.glow}" stroke-width="1"/></g><path d="M76 104 L92 104 M124 104 L108 104" stroke="#e8b33a" stroke-width="3"/>`;
    o+=`<path d="M70 150 Q100 166 130 150 L132 162 Q100 180 68 162 Z" fill="${M}" ${st}/><path d="M76 158 H124" stroke="#1f3fae" stroke-width="4"/>`;
  }
  /* headwear */
  const H={
    hood:`<path d="M66 92 Q100 40 134 92 Q100 66 66 92 Z" fill="${cloth2}" ${st}/>`,
    phood:`<path d="M66 92 Q100 36 134 92 Q100 66 66 92 Z" fill="${cloth2}" ${st}/>`,
    wizard:`<path d="M64 88 Q72 40 100 -4 Q128 40 136 88 Q100 70 64 88 Z" fill="#1d2a6b" ${st}/><path d="M86 30 l3 6 l6 1 l-4.5 4 l1 6 l-5.5 -3 l-5.5 3 l1 -6 l-4.5 -4 l6 -1 Z M112 56 l2 4 l4 .5 l-3 3 l.8 4 l-3.8 -2 l-3.8 2 l.8 -4 l-3 -3 l4 -.5 Z" fill="#ffd60a"/><path d="M60 88 Q100 72 140 88" fill="none" stroke="#e8b33a" stroke-width="5"/>`,
    band:`<path d="M70 80 Q100 70 130 80 L130 88 Q100 78 70 88 Z" fill="${CL}" ${st}/><path d="M130 84 L146 96 M130 86 L142 106" ${st} stroke-width="3"/>`,
    kettle:`<path d="M70 82 Q72 50 100 50 Q128 50 130 82 Z" fill="${M}" ${st}/><ellipse cx="100" cy="82" rx="46" ry="8.5" fill="${m2}" ${st}/>${shine("M82 58 Q94 52 106 54")}`,
    jingasa:`<path d="M42 86 L100 52 L158 86 Q100 98 42 86 Z" fill="#2b2b2b" ${st}/><circle cx="100" cy="72" r="7" fill="#d33" ${st} stroke-width="2"/>${shine("M66 76 L94 60",3)}`,
    galea:`<path d="M66 88 Q66 52 100 50 Q134 52 134 88 Z" fill="${M}" ${st}/><path d="M66 88 L70 118 L80 114 L80 88 Z M134 88 L130 118 L120 114 L120 88 Z" fill="${M}" ${st}/><path d="M62 86 H138" ${st}/>${shine("M80 58 Q94 50 108 52")}`+(W.crest?`<path d="M78 56 Q100 8 122 56 Q100 42 78 56 Z" fill="${W.crest}" ${st}/><path d="M88 46 Q100 24 112 46" fill="none" stroke="${shade(W.crest,-.4)}" stroke-width="2"/>`:""),
    viking:`<path d="M64 90 Q62 50 100 46 Q138 50 136 90 Z" fill="${M}" ${st}/><rect x="62" y="84" width="76" height="9" fill="${m2}" ${st}/><path d="M70 90 Q86 82 98 92 L98 104 L102 104 L102 92 Q114 82 130 90 L128 100 Q114 94 104 106 L96 106 Q86 94 72 100 Z" fill="${M}" ${st}/><path d="M100 46 L100 84" ${st} stroke-width="2.5"/>${shine("M80 56 Q92 50 104 50")}`,
    knight:`<path d="M62 124 L62 80 Q62 46 100 46 Q138 46 138 80 L138 124 Q100 134 62 124 Z" fill="${M}" ${st}/><rect x="70" y="86" width="60" height="8" rx="2" fill="${INK}"/><path d="M82 106 h5 M93 106 h5 M104 106 h5 M115 106 h5 M82 115 h5 M93 115 h5 M104 115 h5 M115 115 h5" ${st} stroke-width="3"/><path d="M100 48 L100 84" ${st} stroke-width="2.5"/>${shine("M78 58 Q90 50 104 50")}`+(W.plume?`<path d="M100 48 Q84 14 114 6 Q100 24 110 46 Z" fill="${W.plume}" ${st}/>`:""),
    templar:`<path d="M64 126 L64 60 Q100 46 136 60 L136 126 Z" fill="${M}" ${st}/><rect x="70" y="86" width="60" height="8" fill="${INK}"/><path d="M100 98 V122 M88 109 H112" stroke="#d01f2e" stroke-width="8"/>${shine("M74 66 Q90 56 108 56")}`,
    corinth:`<path d="M62 122 C58 98 58 64 78 52 C90 44 110 44 122 52 C142 64 142 98 138 122 L116 124 L108 98 L92 98 L84 124 Z" fill="${M}" ${st}/><path d="M72 84 Q86 76 97 84 L97 92 Q86 88 74 94 Z M128 84 Q114 76 103 84 L103 92 Q114 88 126 94 Z M92 98 L108 98 L114 124 L86 124 Z" fill="#1a0f08"/>${shine("M84 54 Q100 47 116 54",4)}`+(W.crest?`<path d="M38 72 C42 22 158 22 162 72 C142 50 58 50 38 72 Z" fill="${W.crest}" ${st}/>`:""),
    kabuto:`<path d="M68 88 Q68 50 100 48 Q132 50 132 88 Z" fill="${W.gold?M:"#33334d"}" ${st}/><path d="M74 62 v4 M86 54 v4 M100 50 v4 M114 54 v4 M126 62 v4" stroke="#e8b33a" stroke-width="3"/><path d="M82 52 Q100 68 118 52 Q122 30 138 18 Q120 40 100 46 Q80 40 62 18 Q78 30 82 52 Z" fill="#f2c14e" ${st}/>`+(W.mask?`<path d="M72 100 Q100 134 128 100 L126 116 Q100 140 74 116 Z" fill="#b3222a" ${st}/>`:""),
    mongol:`<path d="M68 88 Q70 54 100 32 Q130 54 132 88 Z" fill="${M}" ${st}/><path d="M100 32 L100 14" ${st}/><ellipse cx="100" cy="88" rx="40" ry="10" fill="#6b4524" ${st}/>${shine("M84 62 Q92 48 100 42")}`,
    shishak:`<path d="M70 88 Q68 56 100 28 Q132 56 130 88 Z" fill="${M}" ${st}/><path d="M100 28 L100 12" ${st}/><rect x="66" y="82" width="68" height="9" fill="#c9a24a" ${st}/>${shine("M84 62 Q90 46 100 38")}`,
    ninja:`<path d="M70 88 Q100 54 130 88 Q100 78 70 88 Z" fill="#23243a" ${st}/><path d="M70 100 Q100 124 130 100 L130 118 Q100 136 70 118 Z" fill="#23243a" ${st}/><path d="M128 80 L150 72 M128 84 L148 94" stroke="#b3222a" stroke-width="5" stroke-linecap="round"/>`,
    musket:`<ellipse cx="100" cy="72" rx="60" ry="13" fill="#2a2440" ${st}/><path d="M74 72 Q76 40 100 38 Q124 40 126 72 Z" fill="#2a2440" ${st}/><path d="M118 44 Q154 20 160 52 Q142 38 122 54 Z" fill="${W.plume||"#fff"}" ${st}/>`,
    glad:`<ellipse cx="100" cy="84" rx="52" ry="10" fill="${m2}" ${st}/><path d="M68 122 L68 82 Q68 46 100 46 Q132 46 132 82 L132 122 Z" fill="${M}" ${st}/><rect x="78" y="86" width="44" height="30" rx="3" fill="${INK}"/><path d="M84 86 V116 M92 86 V116 M100 86 V116 M108 86 V116 M116 86 V116 M78 96 H122 M78 106 H122" stroke="${MS[1]}" stroke-width="2.6"/><path d="M78 46 Q100 24 122 46" fill="none" ${st} stroke-width="13"/><path d="M78 46 Q100 24 122 46" fill="none" stroke="#c0392b" stroke-width="8"/>`,
    berserk:`<path d="M64 88 Q64 50 100 48 Q136 50 136 88 Q118 74 100 74 Q82 74 64 88 Z" fill="#7a4a24" ${st}/><path d="M72 64 L66 36 L88 54 Z M128 64 L134 36 L112 54 Z" fill="#7a4a24" ${st}/><circle cx="90" cy="64" r="3.2" fill="#ffcf33"/><circle cx="110" cy="64" r="3.2" fill="#ffcf33"/>`,
    winged:`<path d="M66 88 Q66 52 100 50 Q134 52 134 88 Z" fill="${M}" ${st}/><rect x="64" y="82" width="72" height="8" fill="${m2}" ${st}/>${shine("M80 58 Q92 52 104 52")}<path d="M66 76 C48 64 38 46 40 28 C48 40 54 46 62 50 C54 40 52 30 56 20 C62 36 68 46 72 62 Z M134 76 C152 64 162 46 160 28 C152 40 146 46 138 50 C146 40 148 30 144 20 C138 36 132 46 128 62 Z" fill="#f4f7fb" ${st}/>`,
    diadem:`<path d="M70 76 Q100 60 130 76 L128 82 Q100 70 72 82 Z" fill="${M}" ${st}/><circle cx="100" cy="68" r="5" fill="#c0392b" ${st} stroke-width="2"/>`,
    gaul:"", none:""
  }[W.helm]||"";
  o+=H;
  if(W.helm==="ninja"&&W.female)o+=`<path d="M82 86 L80 83 M86 85 L85 82 M118 86 L120 83 M114 85 L115 82" ${st} stroke-width="2"/>`;
  /* shield in front */
  o+={
    round:`<circle cx="56" cy="166" r="40" fill="${W.shc||cloth2}" ${st}/><circle cx="56" cy="166" r="31" fill="none" ${st} stroke-width="2"/><circle cx="56" cy="166" r="10" fill="${M}" ${st}/>${shine("M22 148 Q32 130 52 126",3.5)}`,
    scutum:`<rect x="22" y="122" width="64" height="88" rx="10" fill="#b3222a" ${st}/><circle cx="54" cy="166" r="11" fill="${M}" ${st}/><path d="M30 138 H78 M30 194 H78 M54 128 V152 M54 180 V206" stroke="#f2c14e" stroke-width="4"/>${shine("M28 130 L28 160",3)}`,
    kite:`<path d="M24 126 H90 Q92 176 57 210 Q22 176 24 126 Z" fill="${W.shc||"#2f5fd0"}" ${st}/><path d="M57 134 V198" stroke="#f2c14e" stroke-width="6"/><path d="M38 148 l6 8 l6 -8 M64 148 l6 8 l6 -8" fill="none" stroke="#f2c14e" stroke-width="3"/>${shine("M30 132 Q30 160 40 180",3)}`,
    cross:`<path d="M24 126 H90 Q92 176 57 210 Q22 176 24 126 Z" fill="#f4f1ea" ${st}/><path d="M57 134 V198 M34 154 H80" stroke="#d01f2e" stroke-width="10"/>`,
    hoplon:`<circle cx="56" cy="166" r="44" fill="${M}" ${st}/><circle cx="56" cy="166" r="35" fill="#a3262a" ${st} stroke-width="2"/><path d="M38 192 L56 142 L74 192" fill="none" stroke="#ffd36b" stroke-width="8"/>${shine("M20 146 Q32 124 56 120",4)}`,
    pelta:`<path d="M18 140 Q56 120 94 140 Q90 190 56 206 Q22 190 18 140 Z" fill="${M}" ${st}/><path d="M40 134 Q56 150 72 134" fill="none" ${st}/><path d="M56 150 L56 196 M40 170 H72" stroke="#7a4a14" stroke-width="4"/>`
  }[W.shield]||"";
  return `<svg viewBox="0 0 200 200" class="pt" aria-hidden="true"><defs>${defs}</defs><g stroke-width="3.6">${o}</g></svg>`;
}

portrait.n=0;
/* ---------- card render ---------- */
const front=$("front"),flip=$("flip");
/* шаблон лицевой стороны: та же разметка, что у большой карточки, только без id */
const FACE_TPL=front.innerHTML.replace(/ id="[^"]*"/g,"");
function rng(seed){return ()=>{seed=seed+0x6D2B79F5|0;let t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return ((t^t>>>14)>>>0)/4294967296}}
/* ошибка печати: у каждой карточки свои рваные края и откушенный угол (зависят от номера) */
function tornPoly(sn){const R=rng(snHash(sn)),cut=1,a=11+R()*8,b=7+R()*6,/* откусан правый верхний угол: имя, номер и цена всегда видны */C=[[0,0],[100,0],[100,100],[0,100]];
  const [cx,cy]=C[cut],sx=cx?-1:1,sy=cy?-1:1,inCut=(x,y)=>((x-cx)*sx)/a+((y-cy)*sy)/b<1.02;
  const P=[];for(let k=0;k<4;k++){const e=(cut+2+k)%4,[x0,y0]=C[e],[x1,y1]=C[(e+1)%4],n=18;
    for(let i=0;i<n;i++){const t=i/n,j=R()*2.6;let x=x0+(x1-x0)*t,y=y0+(y1-y0)*t;if(e===0)y+=j;if(e===1)x-=j;if(e===2)y-=j;if(e===3)x+=j;P.push([x,y])}}
  const vert=cut===0||cut===2,A=vert?[cx,cy+sy*b]:[cx+sx*a,cy],B=vert?[cx+sx*a,cy]:[cx,cy+sy*b];
  const D=[A];for(let i=1;i<7;i++){const t=i/7;D.push([A[0]+(B[0]-A[0])*t+(R()-.5)*5,A[1]+(B[1]-A[1])*t+(R()-.5)*5])}D.push(B);
  const out=[];let done=false;for(const p of P){if(inCut(p[0],p[1])){if(!done){out.push(...D);done=true}continue}out.push(p)}
  return "polygon("+out.map(([x,y])=>x.toFixed(1)+"% "+y.toFixed(1)+"%").join(",")+")"}
function tearSVG(sn){const R=rng(snHash(sn)+7),left=R()<.5,y0=26+R()*22,len=30+R()*30;   /* надрыв в верхней части картинки: подписи внизу не закрывает */let d=`M${left?-2:102} ${y0}`,x=left?0:100,y=y0;
  while(left?x<len:x>100-len){x+=(left?1:-1)*(3+R()*5);y=Math.max(20,Math.min(55,y+(R()-.5)*7));d+=` L${x.toFixed(1)} ${y.toFixed(1)}`}
  const bx=15+R()*60,by=95+R()*30,rot=-25+R()*14;
  return `<svg class="tear" viewBox="0 0 100 140" preserveAspectRatio="none" aria-hidden="true"><ellipse cx="${bx}" cy="${by}" rx="${9+R()*7}" ry="${4+R()*4}" fill="#0d1030" opacity=".28" transform="rotate(${rot} ${bx} ${by})"/><path d="${d}" fill="none" stroke="#fffaf0" stroke-width="3.4" stroke-linejoin="bevel"/><path d="${d}" fill="none" stroke="#0d1030" stroke-width="1.5" stroke-linejoin="bevel"/></svg><div class="brak">БРАК</div>`}
/* заполнить лицевую сторону карточки: используется и в барабане, и в окне просмотра */
/* ---------- новый дизайн карточки: сцена эпохи, рамка с камнями, характеристики полосками ---------- */
const SCENES={
 jp:'<defs><linearGradient id="scJp" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3b0a2e"/><stop offset=".55" stop-color="#c2224a"/><stop offset="1" stop-color="#ff8a3d"/></linearGradient></defs><rect width="300" height="270" fill="url(#scJp)"/><circle cx="150" cy="118" r="70" fill="#ff3b30" opacity=".9"/><path d="M0 190 L70 120 L105 145 L150 90 L200 150 L240 125 L300 170 V270 H0Z" fill="#5a0f2e" opacity=".85"/><path d="M228 200v-40h-14l20-14h-10l16-12h-10l18-14 18 14h-10l16 12h-10l20 14h-14v40z" fill="#22051a"/><path d="M0 220 Q150 195 300 220 V270 H0Z" fill="#22051a"/><g fill="#ffb7d0" opacity=".9"><circle cx="30" cy="60" r="3"/><circle cx="60" cy="150" r="2.5"/><circle cx="262" cy="70" r="3"/><circle cx="280" cy="140" r="2"/><circle cx="20" cy="200" r="2.5"/></g>',
 nord:'<defs><linearGradient id="scNo" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#050b2a"/><stop offset="1" stop-color="#16407a"/></linearGradient></defs><rect width="300" height="270" fill="url(#scNo)"/><path d="M-10 70 Q60 20 120 70 T260 50 T320 80" stroke="#34ff9a" stroke-width="26" fill="none" opacity=".35"/><path d="M-10 100 Q80 50 150 95 T320 70" stroke="#bf5af2" stroke-width="18" fill="none" opacity=".3"/><g fill="#fff"><circle cx="40" cy="30" r="1.5"/><circle cx="200" cy="20" r="1.2"/><circle cx="262" cy="110" r="1.4"/><circle cx="90" cy="120" r="1"/></g><path d="M0 200 L60 120 L110 175 L170 100 L230 170 L300 130 V270 H0Z" fill="#0d1f45"/><path d="M0 225 Q150 205 300 225 V270 H0Z" fill="#081530"/><path d="M40 222 q40 14 90 0 l-8 -10 h-74z M84 212v-30 l22 14z" fill="#3b2210"/>',
 greek:'<defs><linearGradient id="scGr" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1a0630"/><stop offset=".6" stop-color="#5b1f8a"/><stop offset="1" stop-color="#b8487a"/></linearGradient></defs><rect width="300" height="270" fill="url(#scGr)"/><path d="M205 0 l-30 70 h22 l-34 70" stroke="#e8d6ff" stroke-width="4" fill="none" opacity=".75"/><g fill="#2a0a45"><rect x="20" y="110" width="22" height="130"/><rect x="70" y="120" width="22" height="120"/><rect x="210" y="120" width="22" height="120"/><rect x="258" y="110" width="22" height="130"/><rect x="10" y="100" width="90" height="14"/><rect x="200" y="100" width="90" height="14"/></g><path d="M0 225 Q150 205 300 225 V270 H0Z" fill="#14052a"/>',
 sparta:'<defs><linearGradient id="scSp" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#4a1208"/><stop offset=".6" stop-color="#c2410c"/><stop offset="1" stop-color="#ffb347"/></linearGradient></defs><rect width="300" height="270" fill="url(#scSp)"/><circle cx="150" cy="150" r="80" fill="#ffd27a" opacity=".55"/><g fill="#3a0e05"><path d="M30 230v-90h60v90zM24 140h72l-36-26z"/><rect x="40" y="150" width="8" height="80" fill="#5a1a08"/><rect x="60" y="150" width="8" height="80" fill="#5a1a08"/><path d="M210 230v-70h70v70zM204 160h82l-41-24z"/></g><path d="M0 228 Q150 208 300 228 V270 H0Z" fill="#2a0a04"/>',
 rome:'<defs><linearGradient id="scRo" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2a0f45"/><stop offset=".55" stop-color="#b8487a"/><stop offset="1" stop-color="#ffb347"/></linearGradient></defs><rect width="300" height="270" fill="url(#scRo)"/><path d="M10 230 V140 Q150 100 290 140 V230Z" fill="#5a2a1a"/><g fill="#2a0f0a"><path d="M30 150h22v30h-22zM70 145h22v30h-22zM110 142h22v30h-22zM150 142h22v30h-22zM190 145h22v30h-22zM230 150h22v30h-22zM30 195h22v30h-22zM70 192h22v30h-22zM110 190h22v30h-22zM150 190h22v30h-22zM190 192h22v30h-22zM230 195h22v30h-22z"/></g><path d="M0 228 Q150 210 300 228 V270 H0Z" fill="#2a0f0a"/>',
 egypt:'<defs><linearGradient id="scEg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0d1a4a"/><stop offset=".5" stop-color="#c2410c"/><stop offset="1" stop-color="#ffd27a"/></linearGradient></defs><rect width="300" height="270" fill="url(#scEg)"/><circle cx="150" cy="110" r="50" fill="#ffd60a" opacity=".85"/><path d="M-10 230 L70 120 L150 230Z" fill="#b8740f"/><path d="M70 120 L150 230 H110Z" fill="#8a540a"/><path d="M160 230 L240 140 L320 230Z" fill="#a8660c"/><path d="M0 225 Q150 212 300 225 V270 H0Z" fill="#7a4a08"/>',
 rus:'<defs><linearGradient id="scRu" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0d2a5a"/><stop offset=".6" stop-color="#2f7ad6"/><stop offset="1" stop-color="#bfe3ff"/></linearGradient></defs><rect width="300" height="270" fill="url(#scRu)"/><g fill="#0a2448" opacity=".9"><path d="M30 200v-60h40v60zM40 140q10-40 20 0zM200 200v-70h50v70zM212 130q13-50 26 0z"/><circle cx="50" cy="118" r="6" fill="#ffd60a"/><circle cx="225" cy="98" r="7" fill="#ffd60a"/></g><path d="M0 215 Q150 195 300 215 V270 H0Z" fill="#0a2448"/><g fill="#fff" opacity=".8"><circle cx="20" cy="40" r="2"/><circle cx="120" cy="60" r="1.5"/><circle cx="270" cy="40" r="2"/></g>',
 castle:'<defs><linearGradient id="scCa" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#14123a"/><stop offset=".6" stop-color="#4b3a8f"/><stop offset="1" stop-color="#e0708a"/></linearGradient></defs><rect width="300" height="270" fill="url(#scCa)"/><circle cx="240" cy="60" r="22" fill="#fff3c4"/><g fill="#1c1640"><path d="M20 220v-80h14v-12h10v12h10v-12h10v12h14v80zM96 220v-100h12v-14h10v14h10v-14h10v14h12v100zM190 220v-70h14v-12h10v12h10v-12h10v12h14v70z"/><path d="M118 106v-24l18 8-18 8" fill="#ff3b30"/></g><path d="M0 222 Q150 205 300 222 V270 H0Z" fill="#100c2a"/>',
 steppe:'<defs><linearGradient id="scSt" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1a1a4a"/><stop offset=".6" stop-color="#d0602a"/><stop offset="1" stop-color="#ffd27a"/></linearGradient></defs><rect width="300" height="270" fill="url(#scSt)"/><circle cx="90" cy="150" r="46" fill="#ffb347" opacity=".8"/><path d="M0 200 Q80 160 160 195 T300 180 V270 H0Z" fill="#6b3a12"/><g fill="#3a1c06"><path d="M200 210v-22q20-22 40 0v22zM190 190h60l-30-14z"/></g><path d="M0 228 Q150 214 300 228 V270 H0Z" fill="#3a1c06"/>',
 france:'<defs><linearGradient id="scFr" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0a1440"/><stop offset=".65" stop-color="#2a4fb0"/><stop offset="1" stop-color="#9fb8ff"/></linearGradient></defs><rect width="300" height="270" fill="url(#scFr)"/><circle cx="60" cy="55" r="18" fill="#fff3c4"/><g fill="#0a1236"><path d="M0 220v-60h40v-20l20-16 20 16v20h30v-40h16v-12h10v12h16v40h30v-30l20-14 20 14v30h40v20h38v60z"/></g><g fill="#ffd60a" opacity=".8"><rect x="12" y="180" width="6" height="8"/><rect x="60" y="170" width="6" height="8"/><rect x="128" y="160" width="6" height="8"/><rect x="200" y="185" width="6" height="8"/></g>'};
SCENES.volcano='<defs><linearGradient id="scVo" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1a0505"/><stop offset=".55" stop-color="#7a1208"/><stop offset="1" stop-color="#ff6a1a"/></linearGradient></defs><rect width="300" height="270" fill="url(#scVo)"/><path d="M40 230 L120 80 L150 95 L180 80 L260 230Z" fill="#2a0806"/><path d="M120 80 Q150 40 180 80 Q165 70 150 95 Q135 70 120 80Z" fill="#ff9f0a"/><path d="M148 95 Q140 150 120 230 M152 95 Q166 160 190 230" stroke="#ff6a1a" stroke-width="5" fill="none"/><g fill="#ffb347" opacity=".9"><circle cx="60" cy="60" r="3"/><circle cx="230" cy="50" r="2.5"/><circle cx="200" cy="120" r="2"/><circle cx="90" cy="140" r="2.5"/></g><path d="M0 228 Q150 210 300 228 V270 H0Z" fill="#1a0505"/>';
SCENES.sky='<defs><radialGradient id="scSk" cx=".5" cy=".45"><stop offset="0" stop-color="#fff3a0"/><stop offset=".3" stop-color="#ff9f0a"/><stop offset=".7" stop-color="#c2224a"/><stop offset="1" stop-color="#3b0a2e"/></radialGradient></defs><rect width="300" height="270" fill="url(#scSk)"/><g fill="none" stroke="#fff3a0" stroke-width="3" opacity=".5"><circle cx="150" cy="120" r="70"/><circle cx="150" cy="120" r="100"/></g><path d="M0 200 Q60 170 120 196 T240 186 T300 196 V270 H0Z" fill="#5a0f2e"/><path d="M0 228 Q150 210 300 228 V270 H0Z" fill="#22051a"/>';
SCENES.sea='<defs><linearGradient id="scSe" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#050b2a"/><stop offset=".6" stop-color="#0a3c8c"/><stop offset="1" stop-color="#0a84ff"/></linearGradient></defs><rect width="300" height="270" fill="url(#scSe)"/><circle cx="230" cy="50" r="20" fill="#e9f6ff"/><path d="M30 170 l20 -60 l4 0 l0 60z M18 168 h60 l-10 14 h-40z" fill="#0a1236"/><path d="M54 112 q24 16 0 40z" fill="#0a1236"/><g fill="none" stroke="#5ac8fa" stroke-width="3" opacity=".6"><path d="M0 190 q25 -12 50 0 t50 0 t50 0 t50 0 t50 0 t50 0"/><path d="M0 214 q25 -12 50 0 t50 0 t50 0 t50 0 t50 0 t50 0"/></g><path d="M0 228 Q150 214 300 228 V270 H0Z" fill="#06173f"/>';
SCENES.under='<defs><linearGradient id="scUn" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0a0510"/><stop offset=".6" stop-color="#3a0a1e"/><stop offset="1" stop-color="#ff3b30"/></linearGradient></defs><rect width="300" height="270" fill="url(#scUn)"/><path d="M0 80 L30 0 H70 L50 60 L80 30 L90 0 H210 L220 30 L250 60 L230 0 H270 L300 80 V0 H0Z" fill="#1a0a14"/><g fill="#2a0e1e"><path d="M20 230 V150 Q60 120 100 150 V230Z M200 230 V150 Q240 120 280 150 V230Z"/></g><g fill="#ff6a1a" opacity=".8"><circle cx="60" cy="170" r="4"/><circle cx="240" cy="170" r="4"/></g><path d="M0 228 Q150 212 300 228 V270 H0Z" fill="#1a0505"/>';
const ERA_SC={"Япония":"jp","Скандинавия":"nord","Мифы Скандинавии":"nord","Мифы Греции":"greek","Древняя Греция":"sparta","Спарта":"sparta","Древний Рим":"rome","Древний Египет":"egypt","Древняя Русь":"rus","Средние века":"castle","Крестовые походы":"castle","Легенды Британии":"castle","Франция, XV век":"castle","Франция, XVII век":"france","Степь":"steppe","Древний мир":"steppe","Легенды драконов":"volcano","Мифы Востока":"sky","Морские легенды":"sea","Подземное царство":"under"};
const STAT_IC=["⚔️","🛡","💨","❤️","🔥"],STAT_MAX=1300;
function faceV2(root,c){const q=s=>root.querySelector(s),H=HEROES[c.h],t=H[2],art=q(".art");
  root.classList.add("t"+t);
  if(!root.querySelector(":scope>.gm"))root.insertAdjacentHTML("afterbegin",'<i class="gm g1"></i><i class="gm g2"></i><i class="gm g3"></i><i class="gm g4"></i>');
  let sc=q(".scene");if(!sc){art.insertAdjacentHTML("afterbegin",'<svg class="scene" viewBox="0 0 300 270" preserveAspectRatio="xMidYMid slice" aria-hidden="true"></svg><div class="xr"></div><div class="xa"></div>');sc=q(".scene")}
  const k=ERA_SC[H[1]]||"castle";if(sc.dataset.k!==k){sc.innerHTML=SCENES[k];sc.dataset.k=k}
  let fx=q(".fx");if(t>=2){if(!fx){art.insertAdjacentHTML("beforeend",'<div class="fx" aria-hidden="true"></div>');fx=q(".fx")}
    if(fx.dataset.t!==String(t)){let h="";for(let i=0;i<(t>=4?14:t===3?10:6);i++)h+=`<i style="left:${8+((i*53)%84)}%;bottom:${4+(i*17)%24}%;--d:${2.2+(i%5)*.5}s;--dl:-${((i*.37)%3).toFixed(2)}s;--dx:${((i*29)%40)-20}px"></i>`;
      fx.innerHTML=(t>=3?'<svg class="slash" viewBox="0 0 300 270"><path d="M30 220 Q140 40 290 70" fill="none" stroke="#fff" stroke-width="6" stroke-linecap="round" opacity=".8"/><path d="M40 214 Q140 54 285 76" fill="none" stroke="var(--hac)" stroke-width="3" stroke-linecap="round"/></svg>':"")+h;fx.dataset.t=t}}
  else if(fx)fx.remove();
  const pw=q(".power");pw.textContent="«"+epithet(c)+"»";
  q(".stats").innerHTML=[0,1,2,3,4].map(i=>{const v=c.stats?eff(c,i):0;return `<div class="s${i===4?" w":""}"><i>${STAT_IC[i]}</i><div class="b"><u style="width:${Math.max(4,Math.min(100,Math.round(v/STAT_MAX*100)))}%"></u></div><b class="num">${c.stats?v:"?"}</b></div>`}).join("")}
/* составные воины: половинки обрезаны по зубчатому шву, у целой карточки золотой шов */
const HALF_CLIP=["","polygon(0 0,52% 0,47% 9%,54% 18%,46% 28%,53% 38%,45% 49%,54% 60%,46% 71%,53% 82%,47% 92%,51% 100%,0 100%)","polygon(52% 0,100% 0,100% 100%,51% 100%,47% 92%,53% 82%,46% 71%,54% 60%,45% 49%,53% 38%,46% 28%,54% 18%,47% 9%)"];
const SEAM_D="M156 0 L141 38 L162 76 L138 118 L159 160 L135 206 L162 252 L138 298 L159 344 L141 386 L153 420";
const SEAM='<svg class="seam" viewBox="0 0 300 420" preserveAspectRatio="none" aria-hidden="true"><path d="'+SEAM_D+'" fill="none" stroke="#ffd23f" stroke-width="6" stroke-linejoin="round"/><path d="'+SEAM_D+'" fill="none" stroke="#fff6c8" stroke-width="2"/></svg>';
function compFin(c){if(!isComp(c.h))return "";const err=c.f===4;
  if(c.part)return (err?"Ошибка · ":"")+PART_K[c.part]+(err?" 1/1":c.part===2?" · "+c.no+"/"+HALF_RUN:"");
  return err?"Ошибка печати 1/1":"Составной "+c.no+"/"+HALF_RUN}
function fillFace(root,c){
  const q=s=>root.querySelector(s),H=HEROES[c.h],T=HT[H[2]],F=FIN[c.f],st=c.stars||0;
  root.className="face front "+F.cls+(st?" star"+st:"");root.style.setProperty("--hc",T.c);
  root.style.removeProperty("--edge");if(c.frame&&FRAMES[c.frame])root.dataset.frame=c.frame;else delete root.dataset.frame;
  q(".top b").textContent=H[0];q(".top b").classList.toggle("lng",H[0].length>12);q(".top span").textContent=isComp(c.h)?"🧩 СОСТАВНОЙ":HEROES[c.h][4].one?"🔥 1 ИЗ 1":HEROES[c.h][4].don?"⭐ ДОНАТ":"№ "+String(c.h+1).padStart(2,"0")+"/"+NHEROES;
  q(".hero").innerHTML=portrait(c.h,c);q(".era").textContent=H[1];q(".tier").textContent=T.k;
  const pw=q(".power");pw.textContent=H[3];if(st>=3){const eb=document.createElement("b");eb.textContent="«"+epithet(c)+"» ";pw.prepend(eb)}
  q(".stats").innerHTML=["Атака","Броня","Скорость","Выносливость","Боевой дух"].map((n,i)=>`<span>${n}</span><span class="num">${c.stats?eff(c,i):"?"}</span>`).join("");
  const lb=q(".lvl");lb.hidden=lvl(c)<=1;lb.textContent="Ур. "+lvl(c);
  q(".finish").textContent=compFin(c)||F.k+(F.run===Infinity?"":" "+c.no+"/"+F.run);
  const sn=c.sn||"482913",cl=classify(sn),se=q(".foot .sn");
  se.innerHTML="<small>№</small>"+fmtSn(sn);se.classList.toggle("nice",!!cl);
  const rb=q(".ribbon");rb.hidden=!cl&&!c.cust;if(c.cust)rb.textContent="✍️ Именной номер";else if(cl)rb.textContent=cl.k+", ×"+cl.m;
  q(".foot b").textContent=fmt(c.v);
  const art=q(".art");
  let sb=q(".stars");if(!sb){sb=document.createElement("div");sb.className="stars";art.appendChild(sb)}
  sb.hidden=!st;sb.innerHTML="★".repeat(st)+"<i>"+"★".repeat(STAR_MAX-st)+"</i>";
  root.style.clipPath=c.part?HALF_CLIP[c.part]:c.f===4?tornPoly(sn):"";
  root.querySelectorAll(".tear,.brak,.seam").forEach(e=>e.remove());if(c.f===4)q(".in").insertAdjacentHTML("beforeend",tearSVG(sn));
  root.classList.toggle("half",!!c.part);root.classList.toggle("half-l",c.part===1);root.classList.toggle("half-r",c.part===2);root.classList.toggle("comp",isComp(c.h)&&!c.part);
  if(isComp(c.h)&&!c.part)q(".in").insertAdjacentHTML("beforeend",SEAM);
  faceV2(root,c);if(HEROES[c.h][4].collab&&typeof collabFace==="function")collabFace(root,c);
}
/* ---------- маленькая копия карточки для списков ----------
   miniSlot(c) возвращает пустой span, а настоящая карточка дорисовывается, как только span попадёт на страницу. */
const MINI=new Map();let miniN=0;
function miniSlot(c){if(MINI.size>3000)MINI.clear();const k="m"+(++miniN);MINI.set(k,c);return `<span class="minic" data-k="${k}"></span>`}
const miniRO=typeof ResizeObserver!=="undefined"?new ResizeObserver(es=>es.forEach(e=>{const w=e.contentRect.width;if(w)e.target.style.setProperty("--z",w/300)})):null;
function hydrate(root){if(!root||!root.querySelectorAll)return;const list=root.matches&&root.matches(".minic[data-k]")?[root]:root.querySelectorAll(".minic[data-k]");
  list.forEach(el=>{const c=MINI.get(el.dataset.k);MINI.delete(el.dataset.k);el.removeAttribute("data-k");if(!c)return;
    const f=document.createElement("div");f.innerHTML=FACE_TPL;el.appendChild(f);fillFace(f,c);
    if(miniRO)miniRO.observe(el);else el.style.setProperty("--z",(el.clientWidth||90)/300)})}
new MutationObserver(ms=>{for(const m of ms)for(const n of m.addedNodes)if(n.nodeType===1)hydrate(n)}).observe(document.body,{childList:true,subtree:true});
function showCard(c){fillFace(front,c);$("p-val").textContent=isCollab(c)?"БЕСЦЕННАЯ":fmt(c.v);$("sell-v").textContent=fmt(c.v*QUICK)}
let current=null,busy=false;

/* ---------- sound (synthesised, starts on first tap) ---------- */
let AC=null,muted=false;
function ac(){if(muted)return null;try{AC=AC||new (window.AudioContext||window.webkitAudioContext)();if(AC.state==="suspended")AC.resume()}catch(e){AC=null}return AC}
function tone(f,d,type="sine",v=.12,t0=0,f2=0){const a=ac();if(!a)return;const t=a.currentTime+t0,o=a.createOscillator(),g=a.createGain();o.type=type;o.frequency.setValueAtTime(f,t);if(f2)o.frequency.exponentialRampToValueAtTime(f2,t+d);
  g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(v,t+.01);g.gain.exponentialRampToValueAtTime(.0001,t+d);o.connect(g).connect(a.destination);o.start(t);o.stop(t+d+.05)}
function whoosh(d=.35,v=.18){const a=ac();if(!a)return;const n=a.createBufferSource(),buf=a.createBuffer(1,a.sampleRate*d,a.sampleRate),ch=buf.getChannelData(0);for(let i=0;i<ch.length;i++)ch[i]=Math.random()*2-1;
  n.buffer=buf;const f=a.createBiquadFilter();f.type="bandpass";f.Q.value=1.2;f.frequency.setValueAtTime(400,a.currentTime);f.frequency.exponentialRampToValueAtTime(3000,a.currentTime+d);
  const g=a.createGain();g.gain.setValueAtTime(v,a.currentTime);g.gain.exponentialRampToValueAtTime(.0001,a.currentTime+d);n.connect(f).connect(g).connect(a.destination);n.start()}
const sfx={tick:(hi)=>tone(hi?1700:1100,.04,"square",.035),
  lock:()=>tone(880,.09,"triangle",.09),
  reveal:L=>{const n=[523,659,784,1047,1319];for(let i=0;i<=Math.min(L,4);i++)tone(n[i],.35+i*.05,"triangle",.11,i*.07)},
  fanfare:()=>{[523,659,784,1047,784,1047,1319].forEach((f,i)=>tone(f,.28,"sawtooth",.06,i*.11));tone(65,1.2,"sine",.25,0,40)},
  rumble:i=>tone(120+i*35,.12,"sawtooth",.05),
  clash:()=>{whoosh(.25,.25);tone(90,.4,"square",.12,0,40)},
  lose:()=>{tone(392,.25,"triangle",.1);tone(330,.25,"triangle",.1,.18);tone(262,.5,"triangle",.1,.36)},
  coin:()=>{tone(1320,.08,"square",.05);tone(1760,.12,"square",.05,.07)}};
$("topup").onclick=async()=>{if(await act("topup")){renderFree();sfx.coin();toast("+3 тестовые прокрутки")}};
$("snd").onclick=()=>{muted=!muted;$("snd").setAttribute("aria-pressed",!muted);$("snd").textContent=muted?"🔇":"🔊";if(!muted)sfx.coin()};

/* ---------- reveal theatre ---------- */
function niceLevel(sn){const cl=classify(sn);if(!cl)return 0;return cl.m>=15?4:cl.m>=8?3:cl.m>=3?2:1}
function revealLevel(c){return Math.max(HEROES[c.h][2],c.f,niceLevel(c.sn))}
function revealColor(c){const t=HEROES[c.h][2],nl=niceLevel(c.sn);if(nl>=Math.max(t,c.f)&&nl>0)return "#ffd60a";if(c.f>t)return FIN[c.f].col;return t?HT[t].c:"#ffffff"}
function countUp(els,v,ms){if(reduce){els.forEach(e=>e.textContent=fmt(v));return}const t0=performance.now();
  (function f(t){const k=Math.min(1,(t-t0)/ms),e=1-Math.pow(1-k,3);els.forEach(el=>el.textContent=fmt(v*e));if(k<1)requestAnimationFrame(f)})(t0)}
function rollDigits(sn,L,done){
  const el=$("h-serial"),nice=niceLevel(sn);
  el.innerHTML="<small>№</small>"+sn.split("").map((d,i)=>`<span class="d roll">0</span>${i===2?" ":""}`).join("");
  const ds=[...el.querySelectorAll(".d")];
  if(reduce){ds.forEach((d,i)=>{d.textContent=sn[i];d.className="d"});done();return}
  const step=nice?(nice>=3?260:170):(L>=2?110:55),extra=nice>=3?520:0;
  const stops=ds.map((_,i)=>140+i*step+(i===5?extra:0));const t0=performance.now();let lastTick=0;
  (function f(t){const dt=t-t0;let all=true;
    ds.forEach((d,i)=>{if(d.classList.contains("roll")){if(dt>=stops[i]){d.textContent=sn[i];d.className="d lock";sfx.lock()}else{all=false;d.textContent=Math.floor(Math.random()*10)}}});
    if(t-lastTick>70&&!all){sfx.tick(nice>=3&&dt>stops[4]);lastTick=t}
    if(!all)requestAnimationFrame(f);else done()})(t0);
}
async function open(){
  if(busy||!S)return;
  if((S.spins??0)<=0&&!(S.refillAt&&NOW()>=S.refillAt)){if(!outOffer())toast("Прокрутки закончились. Новые через "+leftTxt());return}
  busy=true;ac();$("p-lbl").textContent="Цена карточки";
  if(onbStep===0&&ONBS===ONB)onbClear();
  const stg=$("stage");
  if(!reduce){flip.classList.add("back");whoosh();stg.classList.add("tease");stg.style.setProperty("--aura","#ffffff");stg.style.setProperty("--ai",.2)}
  const t0=NOW(),r=await act("open");
  if(!r){busy=false;flip.classList.remove("back","shake");stg.classList.remove("tease","epic");renderFree();return}
  const c=r.card;current=c;renderFree();
  hap(HEROES[c.h][2]>=3||c.f>=3?"heavy":"light");
  const L=revealLevel(c);
  stg.style.setProperty("--aura",revealColor(c));stg.style.setProperty("--ai",[.2,.5,.7,.9,1][L]);
  const finish=()=>{
    const cl=classify(c.sn);
    countUp([$("p-val"),$("h-val")],c.v,L>=3?1400:L>=1?700:250);
    if(L>=1)burst(L);
    if(L>=3){sfx.fanfare();hapN("success");const f=$("flash");if(f){f.style.setProperty("--fl",revealColor(c));f.classList.remove("go");void f.offsetWidth;f.classList.add("go")}}
    const p=$("price");p.classList.remove("big");void p.offsetWidth;if(L>=2)p.classList.add("big");
    if(cl&&cl.m>=8)toast("Красивый номер "+fmtSn(c.sn)+"! "+cl.k+", ×"+cl.m);
    else if(c.f===4)toast("ОШИБКА ПЕЧАТИ! Единственная в мире");
    else if(c.f===3)toast("Золотая! Экземпляр "+c.no+" из 10");
    else if(HEROES[c.h][2]===4)toast("Мифический воин: "+HEROES[c.h][0]);
    else if(HEROES[c.h][2]===3)toast("Легендарный воин: "+HEROES[c.h][0]);
    else if(cl)toast("Красивый номер: "+cl.k.toLowerCase()+", ×"+cl.m);
    setTimeout(()=>{stg.classList.remove("tease","epic");$("dimmer").classList.remove("on");busy=false},L>=3?900:150);
    onbOpened();
    renderAll();
  };
  const reveal=()=>{
    flip.classList.remove("shake");
    showCard(c);$("sell").disabled=false;
    $("p-val").textContent=fmt(0);$("h-val").textContent=fmt(0);
    flip.classList.remove("back");sfx.reveal(L);
    rollDigits(c.sn,L,finish);
  };
  if(reduce){showCard(c);$("sell").disabled=false;finish();return}
  if(L>=1)flip.classList.add("shake");
  if(L>=3){stg.classList.add("epic");$("dimmer").classList.add("on")}
  const tease=Math.max(150,[320,700,1100,1600,2200][L]-(NOW()-t0));
  for(let i=0;i<Math.floor(tease/160);i++)setTimeout(()=>sfx.rumble(i*(L>=2?1:.3)),i*160);
  setTimeout(reveal,tease);
}
$("buy-go").onclick=()=>openCamp();
$("open").onclick=()=>open();$("stage").onclick=()=>open();
$("stage").onkeydown=e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();open()}};
$("sell").onclick=async()=>{if(!current||busy)return;if(!S.cards.some(x=>x.id===current.id)){toast("Эта карточка уже не у тебя");return}
  if(current.v>=500&&!(await confirmSell(current)))return;
  const r=await act("sell",{id:current.id});if(!r)return;toast("Продано за "+fmt(r.got));current=null;$("sell").disabled=true;renderAll()};


/* ---------- album ---------- */
function renderAlbum(){
  const box=$("album");box.innerHTML="";let have=0;
  HEROES.forEach((H,i)=>{if(i>=NBASE)return;
    const mine=S.cards.filter(c=>c.h===i),got=mine.length>0;if(got)have++;
    const d=document.createElement("div");d.className="slot "+(got?"have":"empty");d.style.setProperty("--hc",HT[H[2]].c);
    const fins=[...new Set(mine.map(c=>c.f))].sort();
    if(got){const best=[...mine].sort((a,b)=>b.v-a.v)[0];d.innerHTML=miniSlot(best)+(mine.length>1?`<span class="cnt">×${mine.length}</span>`:"");d.onclick=()=>openCardView(best,{mine:true});box.appendChild(d);return}
    d.innerHTML=`<span class="n">${String(i+1).padStart(2,"0")}</span><span class="e">${portrait(i,null,1)}</span><small></small>`;
    d.querySelector("small").textContent="???";box.appendChild(d)});
  $("al-n").textContent=have+" из "+NHEROES;$("al-bar").style.width=have/NHEROES*100+"%";
}

/* ---------- collection ---------- */
let colView="cards",colSort="v";
const RK=["обычн.","редкие","эпич.","легенд.","миф."];
/* выбор карточек для продажи */
let colPick=false,colSel=new Set();
const sellableUI=c=>!away(c)&&!FIN[c.f].excl&&!HEROES[c.h][4].one;
function colBar(){let b=$("col-bar");if(!colPick){if(b)b.remove();return}
  if(!b){b=document.createElement("div");b.id="col-bar";b.className="colbar";document.body.appendChild(b)}
  const sel=S.cards.filter(c=>colSel.has(c.id)),sum=sel.reduce((a,c)=>a+c.v*QUICK,0);
  b.innerHTML='<button type="button" class="ghost" id="cb-x">Отмена</button><button type="button" class="ghost" id="cb-all">Все обычные</button><button type="button" class="craftbtn" id="cb-go"'+(sel.length?"":" disabled")+'>Продать '+sel.length+(sel.length?" за "+fmtC(sum):"")+'</button>';
  $("cb-x").onclick=()=>{colPick=false;colSel.clear();renderCol()};
  $("cb-all").onclick=()=>{S.cards.forEach(c=>{if(c.f===0&&HEROES[c.h][2]===0&&sellableUI(c))colSel.add(c.id)});renderCol()};
  $("cb-go").onclick=async()=>{const ids=[...colSel].filter(id=>S.cards.some(c=>c.id===id));if(!ids.length)return;const sel=S.cards.filter(c=>colSel.has(c.id)),rare=sel.filter(c=>HEROES[c.h][2]>=3||c.f>=2||c.part);
    if(rare.length&&!(await confirmMany(sel,rare)))return;const r=await act("sellmany",{ids});if(!r)return;
    colPick=false;colSel.clear();if(current&&!S.cards.some(x=>x.id===current.id)){current=null;$("sell").disabled=true}sfx.coin();renderAll();toast("Продано "+r.n+" шт. за "+fmt(r.got))}}
function confirmMany(sel,rare){return new Promise(res=>{const m=$("modal"),sh=$("msheet");sh.innerHTML="";m.hidden=false;
  sh.innerHTML='<div class="box nickbox"><h3>Продать '+sel.length+' карточек?</h3><p>Среди них есть редкие: '+rare.slice(0,6).map(c=>HEROES[c.h][0]+" ("+FIN[c.f].k.toLowerCase()+")").join(", ")+(rare.length>6?" и ещё "+(rare.length-6):"")+'. На рынке их можно продать дороже.</p><button type="button" class="craftbtn" id="cmn-yes">Да, продать за '+fmtC(sel.reduce((a,c)=>a+c.v*QUICK,0))+'</button><button type="button" class="ghost" id="cmn-no">Отмена</button></div>';
  $("cmn-yes").onclick=()=>{closeModal();res(true)};$("cmn-no").onclick=()=>{closeModal();res(false)}})}
function renderCol(){
  // шапка коллекции
  const tot=S.cards.reduce((a,c)=>a+c.v,0),best=[...S.cards].sort((a,b)=>b.v-a.v)[0],cnt=[0,0,0,0,0];S.cards.forEach(c=>cnt[HEROES[c.h][2]]++);
  $("col-head").innerHTML='<div class="t">🗂 МОЯ КОЛЛЕКЦИЯ <span></span></div><div class="v"></div><div class="s"></div><div class="bar"><i></i></div><div class="rc">'+HT.map((t,i)=>'<div style="--c:'+t.c+'"><b>'+cnt[i]+'</b>'+RK[i]+'</div>').join("")+'</div>';
  const H=$("col-head");H.querySelector(".t span").textContent=S.cards.length+" / "+CAP;H.querySelector(".v").textContent=fmt(tot);
  H.querySelector(".s").textContent=best?"стоимость коллекции · лучшая: "+HEROES[best.h][0]+", "+FIN[best.f].k.toLowerCase():"открой первую карточку на вкладке «Крутить»";
  H.querySelector(".bar i").style.width=Math.min(100,S.cards.length/CAP*100)+"%";
  ["cards","beauty","merge"].forEach(k=>{$("colp-"+k).hidden=k!==colView});
  $("col-seg").querySelectorAll("button").forEach(b=>b.setAttribute("aria-pressed",b.dataset.v===colView));
  if(colView==="beauty"){renderBeauty();return}
  if(colView==="merge"){renderMerge();return}
  $("col-sort").querySelectorAll("button").forEach(b=>b.setAttribute("aria-pressed",b.dataset.s===colSort));
  const box=$("col");box.innerHTML="";box.className="cgrid2";
  if(!S.cards.length){box.className="list";box.innerHTML='<div class="empty-msg">Тут пока пусто. Открой первую карточку на вкладке «Крутить»</div>';return}
  const pw=c=>[0,1,2,3,4].reduce((a,i)=>a+(c.stats?eff(c,i):0),0),tier=c=>HEROES[c.h][2];
  const cmp={v:(a,b)=>b.v-a.v,r:(a,b)=>tier(b)-tier(a)||b.v-a.v,f:(a,b)=>b.f-a.f||b.v-a.v,n:(a,b)=>(b.created||0)-(a.created||0)||String(b.id).localeCompare(String(a.id)),p:(a,b)=>pw(b)-pw(a)}[colSort];
  [...S.cards].sort(cmp).forEach(c=>{const t=tier(c),el=document.createElement("div");el.className="tl2"+(t===3?" leg":t===4?" myth":"");el.style.setProperty("--c",HT[t].c);
    el.innerHTML=`<span class="rb">${HT[t].k.toUpperCase()}</span>${c.f?`<span class="fb">${FIN[c.f].k}</span>`:""}<button type="button" class="cbtn">${miniSlot(c)}</button><div class="pp"><b class="num">${fmtC(c.v)}</b><button type="button" class="more" aria-label="Действия">⋯</button></div>`;
    const cb=el.querySelector(".cbtn");cb.setAttribute("aria-label",HEROES[c.h][0]+", рассмотреть и закалить");cb.onclick=()=>openCardView(c,{mine:true});
    if(colPick){const ok=sellableUI(c);el.classList.add(ok?"pick":"nopick");if(colSel.has(c.id))el.classList.add("sel");
      el.insertAdjacentHTML("beforeend",'<span class="pk">'+(colSel.has(c.id)?"✓":"")+'</span>');
      el.onclick=e=>{e.stopPropagation();if(!ok){toast(c.listed?"Карточка на рынке":away(c)?"Карточка занята":"Эту карточку нельзя продать системе");return}if(colSel.has(c.id))colSel.delete(c.id);else colSel.add(c.id);sfx.tick&&sfx.tick();renderCol()};
      el.querySelectorAll("button").forEach(b=>b.onclick=null)}
    if(canForge(c)){const fb=document.createElement("span");fb.className="forgeb";fb.textContent="⭐ Можно закалить";cb.appendChild(fb)}
    const m=el.querySelector(".more");
    if(away(c)){m.textContent=c.listed?"🏷":c.lock?"⚔️":"🧭";m.title=c.listed?"На рынке":c.lock?"В бою на арене":"В походе"}else if(FIN[c.f].excl){m.textContent="🏆";m.title="Трофей"}
    if(!colPick)m.onclick=()=>cardMenu(c);box.appendChild(el)});
  colBar();$("col-pick").textContent=colPick?"✖ Отменить выбор":"☑️ Выбрать";
}
$("col-pick").onclick=()=>{colPick=!colPick;colSel.clear();renderCol()};
/* меню «⋯»: рассмотреть или продать — чтобы не продать карточку случайным нажатием */
function cardMenu(c){const m=$("modal"),sh=$("msheet");sh.innerHTML="";m.hidden=false;const busy=away(c),tro=FIN[c.f].excl;
  sh.innerHTML='<div class="box nickbox cmenu"><div class="sellprev"></div><h3></h3><button type="button" class="craftbtn" id="cm-view">'+(c.part?'🧩 Собрать воина':'🔍 Рассмотреть и закалить')+'</button><button type="button" class="ghost cm-num" id="cm-num">✍️ Свой номер на карточке</button>'+(busy||tro?'<p class="cm-note"></p>':'<button type="button" class="linkbtn" id="cm-sell"></button>')+'<button type="button" class="ghost" id="cm-x">Закрыть</button></div>';
  sh.querySelector(".sellprev").innerHTML=miniSlot(c);sh.querySelector("h3").textContent=HEROES[c.h][0]+" · "+FIN[c.f].k+" · "+fmtC(c.v);
  $("cm-view").onclick=()=>{closeModal();if(c.part)openGold("comp");else openCardView(c,{mine:true})};$("cm-x").onclick=closeModal;$("cm-num").onclick=()=>{closeModal();numBuy(c)};
  if(busy||tro)sh.querySelector(".cm-note").textContent=tro?(FIN[c.f].collab?"💎 Бесценную карточку можно продать только на рынке — цену ставишь ты.":"🏆 Трофей «Основатель» нельзя продать системе — только на рынке."):c.listed?"🏷 Карточка выставлена на рынок.":c.lock?"⚔️ Карточка сейчас в бою на арене.":"🧭 Воин в походе.";
  else{$("cm-sell").textContent="💰 Продать за "+fmtC(c.v*QUICK);$("cm-sell").onclick=async()=>{closeModal();if(!(await confirmSell(c)))return;const r=await act("sell",{id:c.id});if(!r)return;if(current&&current.id===c.id){current=null;$("sell").disabled=true}renderAll();toast("Продано за "+fmt(r.got))}}}
/* витрина красоты: все виды карточек, что уже есть у игрока */
function renderBeauty(){const B=$("beauty"),ownF=new Set(S.cards.map(c=>c.f)),ownT=new Set(S.cards.map(c=>HEROES[c.h][2])),ownS=new Set(S.cards.map(c=>c.stars||0));
  const ctx={issuedOf:()=>0,nextNo:()=>1,snFree:()=>true,takeSn:()=>{},newId:()=>"demo"+Math.random(),now:NOW(),events:[]};
  const demo=(h,f,o)=>{let c;try{c=makeCard(ctx,h,f)}catch(e){c={h,f,no:1,sn:"482913",hue:0,v:0,stats:[300,300,300,300,300],xp:0,wins:0,stars:0}}Object.assign(c,o||{});return c};
  const slot=c=>'<div class="ms">'+miniSlot(c)+'</div>',got=FIN.filter((F,i)=>ownF.has(i)).length;
  let v='<div class="colhead"><div class="t">✨ ВИТРИНА КРАСОТЫ</div><div class="s" style="margin-top:6px">Все виды карточек в игре: какие бывают, как часто выпадают и сколько их всего. Собери все!</div><div class="bar"><i style="width:'+(got/FIN.length*100)+'%"></i></div><div class="s">собрано отделок: '+got+' из '+FIN.length+'</div></div><div class="bvh">Отделки</div>';
  const H5=[11,20,23,26,30,31];
  FIN.forEach((F,i)=>{if(F.collab)return;const o=ownF.has(i);v+='<div class="bfr'+(o?'':' lock')+'">'+slot(demo(H5[i],i,{sn:i===4?"000001":undefined}))+'<div><h4><span>'+F.k+'</span><em>'+(F.excl?'15 друзей':String(F.w).replace(".",",")+'%')+'</em></h4><p>'+(F.excl?'Не выпадает. Только 3 штуки на всю игру — за 15 приглашённых друзей.':(F.run===Infinity?'Без ограничений':'Тираж: всего '+F.run+(F.run===1?' на каждого воина — одна на весь мир':' на каждого воина'))+' · цена ×'+F.m)+'</p><div class="own '+(o?'ok':'no')+'">'+(o?'✅ У тебя есть':'🔒 Ещё нет')+'</div></div></div>'});
  v+='<div class="bvh">Редкость воинов</div><div class="bbx"><div class="bsr">'+[3,11,20,26,30].map((h,i)=>'<div class="'+(ownT.has(i)?'':'lock')+'">'+slot(demo(h,0))+'<span style="color:'+HT[i].c+'">'+HT[i].k+'</span></div>').join("")+'</div></div>';
  v+='<div class="bvh">Красивые номера</div><div class="bbx">'+NICE.map(n=>'<div class="bnm"><span>'+n.k+'</span><span>'+n.ex+'</span><span>×'+n.m+'</span></div>').join("")+'</div>';
  v+='<div class="bvh">Закалка ★1–★5</div><div class="bbx"><div class="bsr">'+[1,2,3,4,5].map(s=>'<div class="'+(ownS.has(s)?'':'lock')+'">'+slot(demo(20,0,{stars:s,xp:2500}))+'<span style="color:var(--ink)">★'+s+'</span></div>').join("")+'</div></div>';
  B.innerHTML=v}
$("col-seg").onclick=e=>{const b=e.target.closest("[data-v]");if(!b)return;colView=b.dataset.v;renderCol();sfx.tick&&sfx.tick()};
$("col-sort").onclick=e=>{const b=e.target.closest("[data-s]");if(!b)return;colSort=b.dataset.s;renderCol()};
$("sellcommon").onclick=async()=>{const r=await act("sellcommon");if(!r)return;renderAll();toast("Продано "+r.n+" шт. за "+fmt(r.got))};

/* подтверждение продажи системе: чтобы не продать дорогую карточку случайным нажатием */
function confirmSell(c){return new Promise(res=>{const m=$("modal"),sh=$("msheet");sh.innerHTML="";m.hidden=false;
  sh.innerHTML='<div class="box nickbox"><h3>Продать карточку?</h3><div class="sellprev"></div><p></p><button type="button" class="craftbtn" id="cs-yes"></button><button type="button" class="ghost" id="cs-no">Отмена</button></div>';
  sh.querySelector(".sellprev").innerHTML=miniSlot(c);
  sh.querySelector("p").textContent=HEROES[c.h][0]+", "+FIN[c.f].k.toLowerCase()+", № "+fmtSn(c.sn)+". Быстрая продажа системе: "+fmt(c.v*QUICK)+" (85% оценки). Карточка уйдёт из игры, и её номер снова сможет выпасть другим. На рынке можно продать дороже.";
  $("cs-yes").textContent="Продать за "+fmtC(c.v*QUICK);
  $("cs-yes").onclick=()=>{closeModal();res(true)};$("cs-no").onclick=()=>{closeModal();res(false)}})}

/* маленькая картинка карточки: рваная для ошибки печати, светится при звёздах */
function thumbDeco(e,c){}

/* ---------- просмотр карточки и закалка ---------- */
function openCardView(c,o){o=o||{};const m=$("modal"),sh=$("msheet");sh.innerHTML="";m.hidden=false;
  const x=document.createElement("button");x.type="button";x.className="x";x.textContent="Закрыть";x.onclick=closeModal;sh.appendChild(x);
  const cv=document.createElement("div");cv.className="cardview";const face=document.createElement("div");face.innerHTML=FACE_TPL;cv.appendChild(face);sh.appendChild(cv);
  const info=document.createElement("div");info.className="cv-info";sh.appendChild(info);
  const fb=document.createElement("div");fb.className="box";sh.appendChild(fb);
  function draw(){const cur=o.mine?(S.cards.find(y=>y.id===c.id)||c):c;fillFace(face,cur);
    const cl=classify(cur.sn);
    info.innerHTML="";const t=document.createElement("div");t.className="who";t.innerHTML="<span></span><small></small>";
    t.children[0].textContent=HEROES[cur.h][0]+((cur.stars||0)>=3?" «"+epithet(cur)+"»":"");
    t.children[1].textContent=(o.owner?"Владелец: "+o.owner+". ":"")+(isCollab(cur)?"Бесценная, 1 из 1, номер А777МР 77. Коллаборация «Воинов Эпох» и «Номерка» — такой больше нет ни у кого.":FIN[cur.f].k+(FIN[cur.f].run!==Infinity?", "+cur.no+" из "+FIN[cur.f].run:"")+", № "+fmtSn(cur.sn)+(cl?" ("+cl.k.toLowerCase()+")":"")+". Таких больше нет ни у кого.");
    {const fl=document.createElement("p");fl.className="cv-flavor";fl.textContent=HEROES[cur.h][3];t.appendChild(fl);const A=abil(cur.h),ab=document.createElement("p");if(isCollab(cur))ab.hidden=true;ab.className="cv-abil";ab.textContent="⚡ Способность в рейтинговом бою: "+A[0]+" "+A[1]+" — "+A[2]+" · "+WC_IC[wclass(cur.h)]+" "+WCLASS[wclass(cur.h)];t.appendChild(ab)}
    info.appendChild(t);
    if(FIN[cur.f].collab){fb.hidden=false;fb.innerHTML='<h3>💎 Бесценная</h3><p>Главный приз розыгрыша — подарок лично от «Номерка». У неё нет оценки: продать её можно только на рынке, и цену назначает сам владелец. В боях не участвует, сжечь или продать системе её нельзя.</p>';return}
    if(FIN[cur.f].excl){fb.hidden=false;fb.innerHTML='<h3>🏆 Трофей</h3><p>Карточка «Основатель» существует в единственном экземпляре. Она для коллекции и понтов: в боях не участвует, продать системе её нельзя, а выставить на рынок можно.</p>';return}
    if(!o.mine){fb.hidden=true;return}
    fb.hidden=false;const s=cur.stars||0;
    if(s>=STAR_MAX){fb.innerHTML='<h3>Закалка ★5: максимум</h3><p>Этот воин вознесён. Сильнее карточку уже не сделать.</p>';return}
    const need=STAR_LVL[s],cost=forgeCost(cur),okL=lvl(cur)>=need;
    fb.innerHTML=`<h3>Закалка ★${s} → ★${s+1}</h3><div class="forge"><div><small>Сила</small><b>+10%</b></div><div><small>Цена карточки</small><b>×1,3</b></div><div><small>Уровень</small><b class="${okL?"":"bad"}">${lvl(cur)} из ${need}</b></div></div><p></p><button type="button" class="craftbtn">Закалить за ${fmt(cost)}</button>`;
    fb.querySelector("p").textContent=[ "★1: воин начинает светиться.","★2: вокруг воина появляется аура.","★3: открывается личное прозвище, его нет больше ни у кого.","★4: от воина летят искры, карточка горит.","★5: вознесение. Космический фон и золотое имя."][s]+(okL?"":" Сначала подними уровень до "+need+": бои, походы, босс или тренер в Лавке.");
    const b=fb.querySelector("button");b.disabled=!okL||cur.listed;if(cur.listed)b.textContent="Карточка на рынке";
    b.onclick=async()=>{b.disabled=true;const r=await act("forge",{id:cur.id});if(!r){draw();return}
      sfx.fanfare();hapN("success");burst(Math.min(4,r.stars));cv.classList.remove("forged");void cv.offsetWidth;cv.classList.add("forged");
      draw();renderAll();toast(r.stars===3?"★3! Открыто прозвище: «"+epithet(cur)+"»":r.stars===5?"★5! Воин вознесён":"Закалка ★"+r.stars+"! Цена теперь "+fmt(r.v))}}
  draw()}

$("sellcommon").onclick=async()=>{const r=await act("sellcommon");if(!r)return;renderAll();toast("Продано "+r.n+" шт. за "+fmt(r.got))};


/* ---------- odds ---------- */
$("odds").innerHTML=FIN.filter(f=>!f.excl).map(f=>`<div><i style="--s:${f.col}"></i><b style="text-align:left;min-width:0">${f.k}</b><span>${f.run===Infinity?"без лимита":"тираж "+f.run}</span><b>${String(f.w).replace(".",",")}%</b></div>`).join("");

$("nums").innerHTML=NICE.map(n=>`<div><b>${n.ex}</b><span>${n.k}</span><b>×${n.m}</b></div>`).join("");

/* ---------- fx ---------- */
const fx=$("fx"),fc=fx.getContext("2d");let parts=[],raf=0;
function size(){const d=devicePixelRatio||1;fx.width=innerWidth*d;fx.height=innerHeight*d;fc.setTransform(d,0,0,d,0,0)}size();addEventListener("resize",size);
function burst(lvl){if(reduce)return;const r=flip.getBoundingClientRect(),x0=r.left+r.width/2,y0=r.top+r.height*.4;
  const cols=["#ffd60a","#ff3b30","#ffffff","#34c759","#0a84ff","#bf5af2"];
  for(let i=0;i<20+lvl*30;i++){const a=Math.random()*6.28,s=3+Math.random()*(5+lvl*2);parts.push({x:x0,y:y0,vx:Math.cos(a)*s,vy:Math.sin(a)*s-4,l:1,c:cols[i%cols.length],z:4+Math.random()*5,r:Math.random()*6})}
  if(!raf)raf=requestAnimationFrame(step)}
function step(){fc.clearRect(0,0,innerWidth,innerHeight);parts=parts.filter(p=>p.l>0);
  parts.forEach(p=>{p.x+=p.vx;p.y+=p.vy;p.vy+=.25;p.l-=.015;p.r+=.25;fc.globalAlpha=Math.max(p.l,0);fc.save();fc.translate(p.x,p.y);fc.rotate(p.r);fc.fillStyle=p.c;fc.fillRect(-p.z/2,-p.z/2,p.z,p.z*1.5);fc.strokeStyle="#0d1030";fc.lineWidth=1;fc.strokeRect(-p.z/2,-p.z/2,p.z,p.z*1.5);fc.restore()});
  fc.globalAlpha=1;raf=parts.length?requestAnimationFrame(step):0}


/* ---------- craft ---------- */
let crSel=new Set(),crH=19,crF=1,crBusy=false,crRot=0,crLast=null;
function crSum(){return S.cards.filter(c=>crSel.has(c.id)).reduce((a,c)=>a+c.v,0)}
function crChance(){const t=craftPrice(crH,crF),sum=crSum();if(!sum)return 0;const amu=$("cr-amu")&&$("cr-amu").checked?.1:0;return Math.min(CRAFT_MAX(crF,crH)+amu,HOUSE*sum/t+amu)}
function arcPath(p){if(p<=0)return "";if(p>=.9999)return "M100 8 A92 92 0 1 1 99.99 8 Z";
  const a=p*2*Math.PI,x=100+92*Math.sin(a),y=100-92*Math.cos(a);return `M100 100 L100 8 A92 92 0 ${p>.5?1:0} 1 ${x.toFixed(2)} ${y.toFixed(2)} Z`}
function renderCraft(){
  // inputs
  for(const id of [...crSel])if(!S.cards.some(c=>c.id===id))crSel.delete(id);
  const pk=$("cr-pick");pk.innerHTML="";
  if(!S.cards.length){pk.innerHTML='<p style="margin:0;color:#5a5f80">В коллекции пусто. Открой несколько карточек на вкладке «Крутить».</p>'}
  [...S.cards].filter(c=>!away(c)&&!(FIN[c.f].excl||c.part)).sort((a,b)=>b.v-a.v).forEach(c=>{
    const H=HEROES[c.h],b=document.createElement("button");b.type="button";b.className="pc";b.style.setProperty("--hc",HT[H[2]].c);
    b.setAttribute("aria-pressed",crSel.has(c.id));
    b.innerHTML=`<span class="pv">${miniSlot(c)}</span><span></span><span style="color:#5a5f80">${FIN[c.f].k}</span><b class="num">${fmt(c.v)}</b>`;
    b.children[1].textContent=H[0];
    b.onclick=()=>{if(crBusy)return;crLast=null;if(crSel.has(c.id))crSel.delete(c.id);else{if(crSel.size>=5){toast("Можно отдать максимум 5 карточек");return}crSel.add(c.id)}renderCraft()};
    pk.appendChild(b)});
  $("cr-sum").textContent=fmt(crSum());
  $("cr-hint").textContent=crSel.size?"в горне "+crSel.size+" из 5":"от 1 до 5 карточек";
  // target finishes
  const fb=$("cr-fins");fb.innerHTML="";
  if(!craftable(crF))crF=1;FIN.forEach((F,i)=>{if(F.excl||!craftable(i))return;const b=document.createElement("button");b.type="button";b.textContent=F.k;b.setAttribute("aria-pressed",i===crF);
    b.onclick=()=>{if(crBusy)return;crF=i;renderCraft()};fb.appendChild(b)});
  const tg=$("cr-tgt");tg.innerHTML="";
  HEROES.forEach((H,i)=>{if(i>=NBASE)return;const b=document.createElement("button");b.type="button";b.className="tg2";b.style.setProperty("--hc",HT[H[2]].c);
    b.setAttribute("aria-pressed",i===crH);b.setAttribute("aria-label",H[0]);b.title=H[0];b.innerHTML=portrait(i,null,1);
    b.onclick=()=>{if(crBusy)return;crH=i;renderCraft()};tg.appendChild(b)});
  const sel=tg.querySelector('[aria-pressed="true"]');if(sel&&!tg.dataset.scrolled){tg.dataset.scrolled="1";requestAnimationFrame(()=>{tg.scrollLeft=sel.offsetLeft-tg.clientWidth/2+sel.clientWidth/2})}
  const F=FIN[crF],left=F.run===Infinity?Infinity:F.run-issuedOfUI(crH,crF);
  $("cr-tname").textContent=HEROES[crH][0];
  $("cr-tdesc").textContent=F.k+(F.run===Infinity?" — без ограничений.":" — тираж всего "+F.run+(F.run===1?", одна на весь мир.":" на воина."))+" Цена ×"+F.m+".";
  // большая карточка-цель в новом дизайне (одна и та же, пока не сменишь цель)
  const pk2=crH+"-"+crF;if($("cr-prev").dataset.k!==pk2){$("cr-prev").dataset.k=pk2;let c;try{c=makeCard({issuedOf:()=>0,nextNo:()=>Math.max(1,(F.run===Infinity?1:F.run-left+1)),snFree:()=>true,takeSn:()=>{},newId:()=>"prev",now:NOW(),events:[]},crH,crF)}catch(e){c={h:crH,f:crF,no:1,sn:"482913",hue:0,v:0,stats:[300,300,300,300,300],xp:0,wins:0,stars:0}}c.v=targetPrice(crH,crF);$("cr-prev").innerHTML=miniSlot(c)}
  // слоты горна
  const sl=$("cr-slots"),selC=[...crSel].map(id=>S.cards.find(c=>c.id===id)).filter(Boolean);sl.innerHTML="";
  for(let i=0;i<5;i++){const c=selC[i],d=document.createElement("button");d.type="button";d.className="fslot"+(c?" f":"");
    if(c){d.innerHTML=miniSlot(c);d.setAttribute("aria-label","Убрать "+HEROES[c.h][0]+" из горна");d.onclick=()=>{if(crBusy)return;crSel.delete(c.id);crLast=null;renderCraft()}}else{d.textContent="+";d.disabled=true}
    sl.appendChild(d)}
  const mineT=S.cards.some(c=>c.h===crH&&c.f===crF);
  $("cr-trun").textContent=left===Infinity?HT[HEROES[crH][2]].k:(left>0?"осталось "+left+" из "+F.run:mineT?"единственная уже у тебя":"все "+F.run+" уже у игроков");
  const tv=targetPrice(crH,crF);$("cr-tv").textContent=fmt(tv);{const T=HEROES[crH][2];if(T>=3)$("cr-trun").textContent+=" · крафт ×"+CRAFT_TIER_K[T]+", шанс до "+Math.round(CRAFT_MAX(crF,crH)*100)+"%"}
  // wheel
  let p=left>0?crChance():0;const showLast=!crSel.size&&crLast!=null;if(showLast)p=crLast;
  $("cr-f1").textContent=showLast?"—":fmt(crSum());$("cr-f2").textContent=fmt(craftPrice(crH,crF));
  $("cr-arc").setAttribute("d",arcPath(p));
  $("cr-p").textContent=(p*100<1&&p>0?"<1":Math.round(p*100))+"%";
  $("cr-amu-t").textContent="Амулет удачи: +10% к шансу за "+fmt(amuCost(crH,crF));
  const go=$("cr-go");go.disabled=crBusy||!crSel.size||left<=0||crChance()<=0;
  go.textContent=left<=0?(mineT&&F.run===1?"Эта карточка уже у тебя":"Все "+F.run+" уже выпали"):!crSel.size?"Положи карточки в горн":"🔥 Ковать · шанс "+$("cr-p").textContent;
  if(!crBusy&&crSel.size&&HOUSE*crSum()/craftPrice(crH,crF)>CRAFT_MAX(crF,crH))$("cr-res").textContent="Больше "+Math.round(CRAFT_MAX(crF,crH)*100)+"% шанса для этой цели не бывает. Выбери цель подороже или отдай меньше.";
  else if(!crBusy)$("cr-res").textContent="";
  $("cr-res").className="result";
}
/* выпавшая карточка крупно на весь экран */
function showDrop(c,title){const m=$("modal"),sh=$("msheet");sh.innerHTML="";m.hidden=false;
  const w=document.createElement("div");w.className="who drop-t";w.innerHTML="<span></span><small></small>";w.children[0].textContent="🎉 "+title;
  const cl=classify(c.sn);w.children[1].textContent=HEROES[c.h][0]+", "+FIN[c.f].k.toLowerCase()+(FIN[c.f].run!==Infinity?" "+c.no+"/"+FIN[c.f].run:"")+", № "+fmtSn(c.sn)+(cl?" ("+cl.k.toLowerCase()+")":"");
  const cv=document.createElement("div");cv.className="cardview dropin";const face=document.createElement("div");face.innerHTML=FACE_TPL;cv.appendChild(face);fillFace(face,c);
  const pr=document.createElement("div");pr.className="drop-p";pr.innerHTML='<small>Цена карточки</small><b class="num"></b>';
  const ok=document.createElement("button");ok.type="button";ok.className="craftbtn";ok.textContent="Забрать";ok.onclick=closeModal;
  sh.append(w,cv,pr,ok);countUp([pr.querySelector("b")],c.v,1200);sfx.fanfare();hapN("success");burst(Math.min(4,Math.max(c.f,HEROES[c.h][2])+1))}

/* звук колеса: щелчок каждые 15° настоящего поворота стрелки, в зелёной зоне выше тоном */
function wheelSound(el,ms,pp){if(reduce)return;whoosh(.5,.16);let last=null,acc=0,lastTick=0;const t0=performance.now();
  (function f(t){const m=getComputedStyle(el).transform,v=m&&/matrix\(([^)]+)\)/.exec(m);
    if(v){const [a,b]=v[1].split(",").map(Number),ang=Math.atan2(b,a)*180/Math.PI;
      if(last!=null){let d=ang-last;if(d<-180)d+=360;if(d>180)d-=360;acc+=Math.abs(d);
        if(acc-lastTick>=15){lastTick=acc;const pos=(ang+360)%360;sfx.tick(pos<pp*360);hap("light")}}last=ang}
    if(t-t0<ms)requestAnimationFrame(f)})(t0)}
$("cr-go").onclick=async()=>{
  if(crBusy)return;const p=crChance();if(!crSel.size||p<=0)return;
  crBusy=true;crLast=p;$("cr-go").disabled=true;
  const ids=[...crSel],amu=$("cr-amu").checked;
  const r=await act("craft",{ids,h:crH,f:crF,amu});
  if(!r){crBusy=false;renderCraft();return}
  $("cr-amu").checked=false;crLast=r.p;
  if(current&&ids.includes(current.id)){current=null;$("sell").disabled=true}
  crSel.clear();updCash();
  const pp=r.p,win=r.win,ang=win?Math.random()*pp*360*.94+pp*360*.03:pp*360+(360-pp*360)*(.03+Math.random()*.94);
  $("cr-arc").setAttribute("d",arcPath(pp));$("cr-p").textContent=(pp*100<1?"<1":Math.round(pp*100))+"%";
  crRot=crRot-(crRot%360)+360*6+ang;
  const nd=$("cr-needle");nd.style.transition=reduce?"none":"";nd.style.transform=`rotate(${crRot}deg)`;wheelSound(nd,4300,pp);
  $("cr-res").textContent="Крутим...";$("cr-res").className="result";
  setTimeout(()=>{
    let msg;
    if(win){const c=r.card;current=c;showCard(c);$("sell").disabled=false;burst(Math.max(c.f,HEROES[c.h][2])+1);setTimeout(()=>showDrop(c,"Крафт удался!"),350);
      msg="Получилось! "+HEROES[c.h][0]+", "+FIN[c.f].k.toLowerCase()+", № "+fmtSn(c.sn)+", "+fmt(c.v);}
    else msg="Не повезло. Сгорело "+ids.length+" шт. на "+fmt(r.lost);
    crBusy=false;renderCraft();renderAll();
    const el=$("cr-res");el.textContent=msg;el.className="result "+(win?"win":"lose");toast(win?"Крафт удался!":"Крафт не удался");
    if(win){sfx.fanfare();hapN("success")}else{sfx.lose();hapN("error")}
  },reduce?50:4300);
};

(function ticks(){let t="";for(let i=0;i<24;i++){const a=i/24*2*Math.PI;t+=`<line x1="${100+82*Math.sin(a)}" y1="${100-82*Math.cos(a)}" x2="${100+90*Math.sin(a)}" y2="${100-90*Math.cos(a)}" stroke="#ffb38a" stroke-width="2" opacity=".45"/>`}$("cr-ticks").innerHTML=t;
  let e="";for(let i=0;i<16;i++)e+=`<i style="left:${(i*37)%100}%;--d:${2.4+(i%5)*.6}s;--dl:-${((i*.53)%3).toFixed(2)}s;--dx:${((i*29)%40)-20}px"></i>`;document.querySelector("#sec-craft .fembers").innerHTML=e})();
/* ---------- прокрутки + задания дня ---------- */
function renderTasks(){const box=$("tasks");if(!box||!S)return;const D=day(S,NOW());box.innerHTML="";
  TASKS.forEach((T,i)=>{const v=Math.min(D[T.k],T.n),done=v>=T.n,got=D.got.includes(i),el=document.createElement("div");el.className="task";
    el.innerHTML=`<span>${T.t} <span class="rw">+${T.r} ${T.r===1?"прокрутка":"прокрутки"}</span></span><button type="button">${got?"Получено":"Забрать"}</button><div class="bar"><i style="width:${v/T.n*100}%;background:${done?"var(--r1)":"var(--red)"}"></i></div>`;
    const b=el.querySelector("button");b.disabled=!done||got;
    b.onclick=async()=>{const r=await act("task",{i});if(!r)return;sfx.coin();renderAll();toast("Задание выполнено, +"+r.r+(r.r===1?" прокрутка":" прокрутки"))};box.appendChild(el)})}
function leftTxt(){const ms=Math.max(0,(S.refillAt||NOW())-NOW()),sec=Math.ceil(ms/1000),h=Math.floor(sec/3600),m=Math.floor(sec%3600/60),x=sec%60;return h+":"+String(m).padStart(2,"0")+":"+String(x).padStart(2,"0")}
let refillAsked=0;
function renderFree(){if(!S)return;
  if(S.refillAt&&NOW()>=S.refillAt){if(ONLINE){if(NOW()-refillAsked>10000){refillAsked=NOW();act("sync").then(()=>renderAll())}}else{refill(S,NOW());save()}}
  const bb=$("buy-go");if(bb){bb.hidden=false;const V=campView();
    bb.innerHTML="<span class=\"cpe-ic\">🎯</span><span class=\"cpe-t\"><b>Тренировочный лагерь</b><small>⚡ "+Math.floor(V.en)+"/"+V.mx+" · 💠 "+fmtN(V.runes)+" рун"+(V.sq>0?" · 🛡 +"+fmtN(V.sq):"")+"</small></span><span class=\"cpe-go\">Тапать</span>";
    bb.classList.toggle("ready",V.en>=V.mx*.99)}
  {const fc=$("free-camp");if(fc){const left=BUY_MAX-spinsBought(S,NOW()),pr=spinPrice(S,NOW()),ru=campView().runes;
    $("free-camp-t").textContent=left<=0?"Сегодня куплено "+BUY_MAX+" из "+BUY_MAX+" — завтра ещё, а пока тапай руны":"Купи за руны в Тренировочном лагере: следующая за "+fmtN(pr)+" 💠 (у тебя "+fmtN(ru)+"), ещё "+left+" сегодня";
    fc.classList.toggle("hot",(S.spins??0)<=0&&left>0)}}
  const n=S.spins??0,cap=spinCap(S);$("free-n").textContent=n<=cap?n+"/"+cap:String(n);$("open-n").textContent=n>0?"осталось "+n:"через "+leftTxt();
  const pw=cap>=5?"бесплатных прокруток":"бесплатные прокрутки";$("free-t").textContent=!S.refillAt?"Каждые 4 часа даётся "+cap+" "+pw+(cap>SPINS_MAX?" 👑":""):"Новые "+cap+" "+(cap>=5?"прокруток":"прокрутки")+" через "+leftTxt();$("open").classList.toggle("empty",n<=0);renderPromo();renderRare()}
/* ---------- Тренировочный лагерь ---------- */
let cpPend=0,cpFly=0,cpBusy=false,cpHp=null,cpLastT=-1;
const UP_IC={pw:"👊",en:"🔋",rg:"⏱",cr:"💥",sq:"🛡"};
const TG_SVG=[
 `<rect x="94" y="150" width="12" height="100" rx="3" fill="#8a5a2b" stroke="#0d1030" stroke-width="4"/><rect x="58" y="238" width="84" height="16" rx="6" fill="#6b4420" stroke="#0d1030" stroke-width="4"/><rect x="38" y="92" width="124" height="16" rx="7" fill="#d9a441" stroke="#0d1030" stroke-width="4"/><ellipse cx="100" cy="128" rx="44" ry="52" fill="#f2c45a" stroke="#0d1030" stroke-width="5"/><path d="M70 112h60M68 132h64M72 152h56" stroke="#b5832e" stroke-width="3"/><circle cx="100" cy="54" r="34" fill="#f2c45a" stroke="#0d1030" stroke-width="5"/><circle cx="100" cy="126" r="17" fill="#fff" stroke="#e24b4a" stroke-width="5"/><circle cx="100" cy="126" r="6" fill="#e24b4a"/><path d="M86 48l8 8m0-8l-8 8M106 48l8 8m0-8l-8 8" stroke="#0d1030" stroke-width="4"/><path d="M88 72q12-8 24 0" stroke="#0d1030" stroke-width="4" fill="none"/>`,
 `<path d="M70 250l30-90 30 90" stroke="#6b4420" stroke-width="10" fill="none" stroke-linecap="round"/><circle cx="100" cy="110" r="84" fill="#fff" stroke="#0d1030" stroke-width="6"/><circle cx="100" cy="110" r="66" fill="#e24b4a"/><circle cx="100" cy="110" r="50" fill="#fff"/><circle cx="100" cy="110" r="34" fill="#0a84ff"/><circle cx="100" cy="110" r="18" fill="#ffd60a" stroke="#0d1030" stroke-width="3"/><path d="M150 60l-36 40" stroke="#0d1030" stroke-width="5"/><path d="M150 60l14-6-4 14z" fill="#ff3b30" stroke="#0d1030" stroke-width="3"/>`,
 `<rect x="94" y="196" width="12" height="50" fill="#6b4420" stroke="#0d1030" stroke-width="4"/><rect x="62" y="238" width="76" height="16" rx="6" fill="#6b4420" stroke="#0d1030" stroke-width="4"/><path d="M48 100q52-30 104 0l-8 96q-44 14-88 0z" fill="#c4ccd8" stroke="#0d1030" stroke-width="5"/><path d="M100 84v110M64 130h72" stroke="#8f9bb3" stroke-width="4"/><circle cx="34" cy="104" r="20" fill="#c4ccd8" stroke="#0d1030" stroke-width="5"/><circle cx="166" cy="104" r="20" fill="#c4ccd8" stroke="#0d1030" stroke-width="5"/><path d="M66 70q0-56 34-56t34 56z" fill="#c4ccd8" stroke="#0d1030" stroke-width="5"/><rect x="74" y="40" width="52" height="8" rx="3" fill="#0d1030"/><path d="M100 14q30-12 20 20" stroke="#e24b4a" stroke-width="8" fill="none"/>`,
 `<rect x="40" y="178" width="44" height="72" rx="10" fill="#8a8f9c" stroke="#0d1030" stroke-width="5"/><rect x="116" y="178" width="44" height="72" rx="10" fill="#8a8f9c" stroke="#0d1030" stroke-width="5"/><rect x="34" y="70" width="132" height="120" rx="22" fill="#9aa0ad" stroke="#0d1030" stroke-width="5"/><rect x="4" y="84" width="34" height="96" rx="14" fill="#8a8f9c" stroke="#0d1030" stroke-width="5"/><rect x="162" y="84" width="34" height="96" rx="14" fill="#8a8f9c" stroke="#0d1030" stroke-width="5"/><rect x="62" y="14" width="76" height="62" rx="16" fill="#9aa0ad" stroke="#0d1030" stroke-width="5"/><rect x="76" y="36" width="16" height="10" fill="#5ac8fa"/><rect x="108" y="36" width="16" height="10" fill="#5ac8fa"/><path d="M60 110l26 18-10 24M140 104l-20 30" stroke="#5a5f6e" stroke-width="4" fill="none"/>`,
 `<rect x="44" y="226" width="112" height="28" rx="6" fill="#b8860b" stroke="#0d1030" stroke-width="5"/><path d="M60 226q-6-90 40-120 46 30 40 120z" fill="#ffd60a" stroke="#0d1030" stroke-width="5"/><circle cx="100" cy="76" r="38" fill="#ffd60a" stroke="#0d1030" stroke-width="5"/><path d="M62 52l14-30 12 18 12-26 12 26 12-18 14 30z" fill="#ffb800" stroke="#0d1030" stroke-width="4"/><circle cx="86" cy="76" r="6" fill="#ff2e63"/><circle cx="114" cy="76" r="6" fill="#ff2e63"/><path d="M88 96q12 8 24 0" stroke="#0d1030" stroke-width="4" fill="none"/><circle cx="100" cy="160" r="12" fill="#5ac8fa" stroke="#0d1030" stroke-width="4"/>`,
 `<path d="M30 120q-30-60 20-100 0 40 30 50z" fill="#bf2a2a" stroke="#0d1030" stroke-width="5"/><path d="M170 120q30-60-20-100 0 40-30 50z" fill="#bf2a2a" stroke="#0d1030" stroke-width="5"/><path d="M40 140q0-90 60-90t60 90q0 60-60 104-60-44-60-104z" fill="#e24b4a" stroke="#0d1030" stroke-width="5"/><path d="M70 60l-14-40 30 26M130 60l14-40-30 26" fill="#ffd60a" stroke="#0d1030" stroke-width="4"/><path d="M62 118l26 10M138 118l-26 10" stroke="#0d1030" stroke-width="6"/><circle cx="78" cy="124" r="7" fill="#ffd60a"/><circle cx="122" cy="124" r="7" fill="#ffd60a"/><path d="M76 200q24 16 48 0" stroke="#0d1030" stroke-width="5" fill="none"/><path d="M84 202l6 12 6-12M104 202l6 12 6-12" fill="#fff" stroke="#0d1030" stroke-width="2"/><circle cx="88" cy="180" r="5" fill="#0d1030"/><circle cx="112" cy="180" r="5" fill="#0d1030"/>`];
/* объёмная мишень: у каждой мишени свои цвета колец */
const TG_PAL=[["#ffd23f","#c98a2a","#ffe9a8","#a8742a","#7a4a20","🌾"],["#ffd23f","#ff3b30","#fff6ea","#e8d6b8","#7a4a20",""],["#ff2e63","#6a7a9a","#e8edf5","#b8c2d6","#3a4258","🛡"],
 ["#34ffb0","#5a6a5a","#b8c2b0","#8a948a","#3a4238","🗿"],["#fff6c8","#ff3b30","#ffd23f","#c98a2a","#8a5a10","👑"],["#ff2e63","#0a8a5a","#1a2a2a","#34ffb0","#052a2a","🐉"]];
function tgDisc(t){const P=TG_PAL[t]||TG_PAL[1];return '<i class="tgl"></i><i class="tgs"></i><div class="tgd" style="--c0:'+P[0]+';--c1:'+P[1]+';--c2:'+P[2]+';--c3:'+P[3]+';--rim:'+P[4]+'"></div>'+(P[5]?'<span class="tge">'+P[5]+'</span>':"")}
/* что видит игрок прямо сейчас: энергия по времени минус ещё не отправленные удары */
function campView(){const C=S.camp||{runes:0,en:CAMP_E0,at:NOW(),lv:{pw:0,en:0,rg:0,cr:0,sq:0},t:0,hp:TARGETS[0].hp,sqAt:NOW(),kills:0,total:0};C.gm=(S.golemUntil||0)>NOW()?1:0;
  const mx=campMax(C),en=Math.min(mx,C.en+Math.max(0,NOW()-C.at)/campFull(C)*mx)-cpPend-cpFly,pw=campPow(C,S.cards);
  return {C,mx,en:Math.max(0,en),pw,runes:Math.floor(C.runes+(cpPend+cpFly)*pw),sq:campSq(C,NOW()),full:campFull(C)}}
function openCamp(){setTab("camp");cpHp=null;renderCamp();sfx.lock();loadCampTop(true)}
async function campFlush(){if(cpBusy||cpPend<1)return;cpBusy=true;cpFly=cpPend;cpPend=0;const r=await act("camp_tap",{n:cpFly});cpFly=0;cpBusy=false;
  if(r){if(r.crits){campFloat("💥 КРИТ ×"+r.crits,"crit");campShake();hap("heavy")}if(r.chests){campShake();campFloat("📦 +"+fmtN(r.chestR),"chest");sfx.reveal(3);hapN("success");toast("Мишень разбита! Сундук: +"+fmtN(r.chestR)+" рун")}cpHp=null}
  renderCamp()}
function campFloat(t,cls,x,y){const ar=$("cp-ar");if(!ar)return;const f=document.createElement("div");f.className="cpf "+(cls||"");f.textContent=t;
  const r=ar.getBoundingClientRect();f.style.left=(x!=null?x-r.left:r.width/2)+"px";f.style.top=(y!=null?y-r.top:r.height*.35)+"px";ar.append(f);setTimeout(()=>f.remove(),900)}
let cpCombo=0,cpLast=0,cpTrH=-2;
function campFx(x,y,big){const ar=$("cp-ar"),r=ar.getBoundingClientRect(),lx=x-r.left,ly=y-r.top;
  const sl=document.createElementNS("http://www.w3.org/2000/svg","svg");sl.setAttribute("viewBox","0 0 100 100");sl.setAttribute("class","cp-slash");sl.style.left=lx+"px";sl.style.top=ly+"px";sl.style.setProperty("--r",(Math.random()*120-60)+"deg");
  sl.innerHTML='<path d="M8 70 Q50 -6 92 34" fill="none" stroke="#fff" stroke-width="'+(big?12:8)+'" stroke-linecap="round" opacity=".95"/><path d="M14 66 Q50 6 86 36" fill="none" stroke="#ffd60a" stroke-width="3" stroke-linecap="round"/>';ar.append(sl);setTimeout(()=>sl.remove(),300);
  for(let i=0;i<(big?9:5);i++){const p=document.createElement("i");p.className="cp-sp";const a=Math.random()*Math.PI*2,d=30+Math.random()*(big?70:40);p.style.left=lx+"px";p.style.top=ly+"px";p.style.setProperty("--dx",Math.cos(a)*d+"px");p.style.setProperty("--dy",Math.sin(a)*d+"px");ar.append(p);setTimeout(()=>p.remove(),460)}}
function campShake(){const a=$("cp-ar");a.classList.remove("shake");void a.offsetWidth;a.classList.add("shake")}
function campHit(e){const V=campView();if(V.en<1){$("cp-tg").classList.remove("no");void $("cp-tg").offsetWidth;$("cp-tg").classList.add("no");hapN("error");
    $("cp-eh").textContent="Энергия кончилась. Полная через "+tleft(Math.ceil((1-V.en/V.mx)*V.full))+" — бот напомнит";return}
  cpPend++;const T=TARGETS[V.C.t];cpHp=(cpHp==null?V.C.hp:cpHp)-V.pw;if(cpHp<=0)cpHp=T.hp;
  const now=performance.now();cpCombo=now-cpLast<450?cpCombo+1:1;cpLast=now;const cb=$("cp-combo");
  if(cpCombo>=5){$("cp-cbn").textContent="×"+cpCombo;cb.classList.add("on");cb.classList.remove("pop");void cb.offsetWidth;cb.classList.add("pop")}
  const g=$("cp-tg");g.classList.remove("hit");void g.offsetWidth;g.classList.add("hit");
  const h=$("cp-hero");h.classList.remove("atk");void h.offsetWidth;h.classList.add("atk");
  const tr=g.getBoundingClientRect(),x=tr.left+tr.width*(.35+Math.random()*.3),y=tr.top+tr.height*(.25+Math.random()*.35);
  campFx(x,y,cpCombo>=10);campFloat("+"+String(V.pw).replace(".",","),"",x,y-20);hap(cpCombo>=10?"medium":"light");tone(140+Math.random()*80+Math.min(cpCombo,30)*6,.05,"square",.05);
  $("cp-tip").style.opacity=0;
  if(cpPend>=25)campFlush();renderCamp(true)}
setInterval(()=>{if(performance.now()-cpLast>700&&$("cp-combo"))$("cp-combo").classList.remove("on")},300);
function renderCamp(light){if(!S||$("sec-camp").hidden)return;const V=campView(),C=V.C,T=TARGETS[C.t];updCash();
  $("cp-ru").textContent=fmtN(V.runes);const tr=campTrainer(S.cards),tb=campBonus(S.cards);
  $("cp-stat").innerHTML="удар <b>+"+String(V.pw).replace(".",",")+"</b><br>крит <b>"+Math.round(campCrit(C)*100)+"%</b>"+(tb?"<br>тренер <b>+"+Math.round(tb*100)+"%</b>":"");
  const th=tr?tr.h:-1;if(th!==cpTrH){cpTrH=th;$("cp-hpic").innerHTML=th>=0?portrait(th,tr):portrait(0,null);$("cp-hn").textContent=th>=0?HEROES[th][0]:"Новобранец"}
  $("cp-eb").style.width=(V.en/V.mx*100)+"%";$("cp-et").textContent=Math.floor(V.en)+" / "+V.mx;$("cp-en").textContent=fmtN(Math.floor(V.en));
  const hp=cpHp==null?C.hp:cpHp;$("cp-hpb").style.width=Math.min(100,Math.max(0,hp/T.hp*100))+"%";$("cp-hpt").textContent=T.n.toUpperCase()+" · "+fmtN(Math.max(0,hp))+" / "+fmtN(T.hp);
  if(V.en>=1)$("cp-eh").textContent=V.en>=V.mx?"Энергия полная — тапай по мишени!":"Полная энергия через "+tleft(Math.ceil((1-V.en/V.mx)*V.full));
  if(cpLastT!==C.t){cpLastT=C.t;$("cp-tg").innerHTML=tgDisc(C.t);$("cp-tname").innerHTML="🎯 ×"+String(T.m).replace(".",",")+" · сундук "+fmtN(T.chest)+" 💠"}
  if(light)return;
  const sq=$("cp-sq");if(C.lv.sq){sq.innerHTML="";const t=document.createElement("div");t.innerHTML="<b>🛡 Оруженосец</b><small>тренирует, пока тебя нет: "+fmtN(campSqRate(C))+" рун в час, копит до "+SQ_HOURS+" ч</small>";
    const b=document.createElement("button");b.type="button";b.className="mini2";b.textContent=V.sq>0?"Забрать "+fmtN(V.sq):"Копит…";b.disabled=V.sq<1;
    b.onclick=async()=>{const r=await act("camp_collect");if(r){sfx.coin();campFloat("+"+fmtN(r.gain)+" 💠","chest");renderCamp()}};sq.append(t,b)}
  else sq.innerHTML="<div><b>🛡 Оруженосец</b><small>Найми в прокачке — он тренируется за тебя, пока ты не в игре</small></div>";
  const bn=spinsBought(S,NOW()),pr=spinPrice(S,NOW()),bb=$("cp-buy");
  bb.innerHTML=bn>=BUY_MAX?"Сегодня куплено "+BUY_MAX+" из "+BUY_MAX+". Завтра цены сбросятся":"🎴 Купить прокрутку за <b>"+fmtN(pr)+" 💠</b>";bb.classList.toggle("dim",bn>=BUY_MAX||V.runes<pr);
  $("cp-buyt").textContent="куплено сегодня "+bn+" из "+BUY_MAX+", каждая следующая ×2 · прокруток у тебя: "+(S.spins??0);
  $("cp-tgs").innerHTML=TARGETS.map((X,i)=>`<div class="cpr${i===C.t?" on":""}${i>C.t+1?" lock":""}"><span class="cpi">${i<=C.t?"✅":i===C.t+1?"🎯":"🔒"}</span><div><b>${X.n}</b><small>×${String(X.m).replace(".",",")} руны за удар · ${fmtN(X.hp)} HP · сундук ${fmtN(X.chest)}</small></div>${i===C.t+1?`<button type="button" class="mini2${V.runes<X.cost?" dim":""}" data-tg="${i}">${fmtN(X.cost)} 💠</button>`:i===C.t?"<em>сейчас</em>":""}</div>`).join("");
  $("cp-ups").innerHTML=Object.entries(CAMP_UP).map(([k,U])=>{const l=C.lv[k]||0,mx=l>=U.max,c=mx?0:U.c(l);
    return `<div class="cpr"><span class="cpi">${UP_IC[k]}</span><div><b>${U.n} <i>ур. ${l}/${U.max}</i></b><small>${U.v(l)}${mx?"":" → "+U.v(l+1)}</small></div><button type="button" class="mini2${mx||V.runes<c?" dim":""}" data-up="${k}">${mx?"Макс.":fmtN(c)+" 💠"}</button></div>`}).join("")}
$("cp-ar").addEventListener("pointerdown",e=>{e.preventDefault();campHit(e)});
/* iPhone: при частых тапах палец чуть сдвигается и страница начинает прокручиваться — экран «прыгает». Внутри арены прокрутку и двойной тап гасим */
["touchstart","touchmove","touchend","dblclick","gesturestart"].forEach(t=>$("cp-ar").addEventListener(t,e=>{if(e.cancelable)e.preventDefault()},{passive:false}));
$("cp-back").onclick=()=>setTab("spin");
$("cp-buy").onclick=async()=>{await campFlush();const pr=spinPrice(S,NOW());if(spinsBought(S,NOW())>=BUY_MAX)return;if(campView().runes<pr){toast("Не хватает "+fmtN(pr-campView().runes)+" рун — потренируйся ещё");return}
  const r=await act("buy_spin");if(r){sfx.coin();hapN("success");toast("+1 прокрутка за "+fmtN(r.price)+" рун");renderCamp()}};
$("cp-tgs").onclick=async e=>{const b=e.target.closest("[data-tg]");if(!b)return;await campFlush();const X=TARGETS[+b.dataset.tg];if(campView().runes<X.cost){toast("Нужно ещё "+fmtN(X.cost-campView().runes)+" рун");return}
  const r=await act("camp_target");if(r){sfx.fanfare();burst(3);toast("Новая мишень: "+X.n+"! Руны за удар ×"+String(X.m).replace(".",","));cpHp=null;renderCamp()}};
$("cp-ups").onclick=async e=>{const b=e.target.closest("[data-up]");if(!b)return;await campFlush();const k=b.dataset.up,U=CAMP_UP[k],l=(campView().C.lv[k]||0);if(l>=U.max)return;
  if(campView().runes<U.c(l)){toast("Нужно ещё "+fmtN(U.c(l)-campView().runes)+" рун");return}
  const r=await act("camp_up",{k});if(r){sfx.coin();hapN("success");toast(U.n+": уровень "+r.l);renderCamp()}};
setInterval(()=>{if(cpPend>0)campFlush();if(S&&!$("sec-camp").hidden)renderCamp(true)},1000);
document.addEventListener("visibilitychange",()=>{if(document.hidden)campFlush()});
/* топ лагеря: день / неделя */
let cpPer="d",cpTop=null,cpTopAt=0;
async function loadCampTop(force){if(!ONLINE||$("sec-camp").hidden)return;if(!force&&NOW()-cpTopAt<30000){drawCampTop();return}cpTopAt=NOW();const r=await act("camp_top",{per:cpPer});if(r){cpTop=r;cpTop._t=NOW();drawCampTop()}}
function drawCampTop(){const T=cpTop,box=$("cp-top");if(!box)return;if(!ONLINE){box.innerHTML='<div class="cp-empty">Топ работает в игре через бота</div>';return}if(!T||T.per!==cpPer){box.innerHTML='<div class="cp-empty">Загружаю…</div>';return}
  $("cp-topn").textContent=(cpPer==="d"?"Сколько рун заработано сегодня. Новый день через ":"Сколько рун заработано за неделю. Новая неделя через ")+(()=>{const l=Math.max(0,T.left-(NOW()-T._t));return l>=864e5?Math.floor(l/864e5)+" дн "+Math.floor(l%864e5/36e5)+" ч":tleft(l)})();
  box.innerHTML="";if(!T.items.length)box.innerHTML='<div class="cp-empty">Пока пусто — стань первым!</div>';
  T.items.slice(0,10).forEach((it,i)=>{const d=document.createElement("div");d.className="cpt"+(it.uid===S.uid?" me":"");d.innerHTML="<i></i><span></span><b></b>";
    d.children[0].textContent=i<3?["🥇","🥈","🥉"][i]:i+1;fxName(d.children[1],champMark(it.uid)+(it.vip?"👑 ":"")+(it.pi?"🏅 ":""),it.name,it.uid);d.children[2].textContent=fmtN(it.score)+" 💠";box.append(d)});
  $("cp-me").textContent=T.me.rank?"Ты на "+T.me.rank+" месте · "+fmtN(T.me.score)+" рун":"Ты пока не в топе — тапай, и попадёшь в таблицу"}
$("cp-seg").onclick=e=>{const b=e.target.closest("[data-per]");if(!b||b.dataset.per===cpPer)return;cpPer=b.dataset.per;$("cp-seg").querySelectorAll("button").forEach(x=>x.setAttribute("aria-pressed",x===b));drawCampTop();loadCampTop(true)};
setInterval(()=>{if(S&&!$("sec-camp").hidden){if(cpTop)drawCampTop();loadCampTop()}},5000);
/* ---------- челлендж приглашений ---------- */
let chData=null,chAt=0;
const plural=(n,a,b,c)=>{const m=n%10,h=n%100;return m===1&&h!==11?a:m>=2&&m<=4&&(h<12||h>14)?b:c};
async function loadChal(){if(!ONLINE||document.hidden)return;chAt=NOW();const r=await act("chal_get");chData=r&&r.id?r:null;if(chData)chData._t=NOW();drawChal()}
function drawChal(){const C=chData,box=$("chal");if(!box)return;box.hidden=!C;if(!C)return;
  const left=Math.max(0,C.left-(NOW()-C._t)),hm=t=>new Date(t+3*3600e3).toISOString().slice(11,16);
  box.querySelector(".chal-h span").textContent=C.secret?"🤫 СЕКРЕТНЫЙ ПРИЗ":C.lot?"🎟 РОЗЫГРЫШ "+C.prizes[0]:"👥 ЧЕЛЛЕНДЖ ДНЯ";box.classList.toggle("secret",!!C.secret);
  if(C.lot)return drawLot(C,left,hm);
  $("chal-left").textContent=C.phase==="done"?"ИТОГИ":C.phase==="soon"?"через "+tleft(left):tleft(left);
  $("chal-t").textContent=C.phase==="done"?"Челлендж завершён! Победители получат призы, напиши @voinovadmin, если ты в топ-3.":C.phase==="soon"?"Сегодня с "+hm(C.start)+" до "+hm(C.end)+" — кто пригласит больше друзей, получит подарок Telegram!":(C.x2?"🔥 До "+hm(C.end)+" награда ×2: +20 прокруток за друга, а другу — гарантированная эпическая! ":"Зови друзей до "+hm(C.end)+". ")+"Топ-3 получают подарки Telegram или звёзды ⭐";
  $("chal-p").innerHTML=C.prizes.map((p,k)=>`<div>${["🥇","🥈","🥉"][k]}<b>${p}</b>подарок</div>`).join("");
  const M=C.me;$("chal-me").innerHTML="";const mb=document.createElement("div");
  mb.textContent=C.phase==="soon"?"Подготовь список друзей — счёт начнётся в "+hm(C.start):M.place?"Ты на "+M.place+" месте · "+M.n+" "+plural(M.n,"друг","друга","друзей"):"У тебя пока 0 — пригласи первого друга!";
  const lead=C.top[0],gap=lead&&!lead.me?lead.n-M.n+1:0;
  const sm=document.createElement("small");sm.textContent=(C.phase==="on"&&gap>0?"До 1 места: ещё "+gap+" "+plural(gap,"друг","друга","друзей")+" · ":"")+"твои друзья: "+M.d+" · друзья друзей: "+M.l2;$("chal-me").append(mb);if(C.phase!=="soon")$("chal-me").append(sm);
  const T=$("chal-top");T.innerHTML="";
  if(!C.top.length&&C.phase!=="soon"){T.innerHTML='<div class="empty">Пока никого — первое место свободно!</div>'}
  for(const r of C.top){const d=document.createElement("div");d.className="cr"+(r.me?" me":"");d.innerHTML="<i></i><span></span><b></b>";
    d.children[0].textContent=r.place<=3?["🥇","🥈","🥉"][r.place-1]:r.place;d.children[1].textContent=(r.vip?"👑 ":"")+r.name;d.children[2].textContent=r.n;T.append(d)}
  $("chal-go").hidden=C.phase!=="on";
  $("chal-rules").textContent="Считаются только новые игроки, которые пришли сегодня с "+hm(C.start)+" до "+hm(C.end)+" по твоей ссылке и открыли хотя бы "+C.need+" карточки. Если твой друг пригласит своего друга, он засчитывается и другу, и тебе. При равном счёте выше тот, кто набрал его раньше. Время — минское. Призы выдаёт @voinovadmin: подарок Telegram или звёзды на ту же сумму. Накрутка ботами и пустыми аккаунтами = снятие с челленджа."}
$("chal-go").onclick=()=>$("ref-go").click();
/* розыгрыш: от C.min друзей ты участник, каждый друг — билет, победитель один */
function drawLot(C,left,hm){const M=C.me,inn=M.n>=C.min,T=C.tickets||0;
  $("chal-left").textContent=C.phase==="soon"?"через "+tleft(left):tleft(left);
  $("chal-t").textContent=C.phase==="soon"?"Сегодня с "+hm(C.start)+" до "+hm(C.end)+": пригласи "+C.min+" друзей — и ты в розыгрыше "+C.prizes[0]+"!":"Пригласи "+C.min+" друзей — и ты участник. Каждый друг = 1 билет: больше друзей — больше шанс. В "+hm(C.end)+" бот выберет одного победителя. Выиграть может любой! Все призы прошлого конкурса выплачены — отзывы в чате.";
  if(C.secret)$("chal-t").textContent="🎁 Главный приз — секрет! Суммарно он стоит больше, чем все наши прошлые конкурсы — в районе $100. Это подарок лично от игры «Номерок» 🤝 "+(C.phase==="soon"?"Старт в "+hm(C.start)+", пригласи "+C.min+" друзей — и ты в розыгрыше!":"Пригласи "+C.min+" друзей — и ты участник. Каждый друг = 1 билет. В "+hm(C.end)+" бот выберет одного победителя.");
  $("chal-p").innerHTML='<div>'+(C.secret?'🤫<b>~$100</b>секрет':'🏆<b>'+C.prizes[0]+'</b>подарок')+'</div><div>🎟<b>'+T+'</b>'+plural(T,"билет","билета","билетов")+'</div><div>👥<b>'+(C.players||0)+'</b>'+plural(C.players||0,"участник","участника","участников")+'</div>';
  const me=$("chal-me");me.innerHTML="";const mb=document.createElement("div"),sm=document.createElement("small");
  mb.textContent=C.phase==="soon"?"Подготовь друзей — счёт начнётся в "+hm(C.start):inn?"🎟 Ты в розыгрыше! У тебя "+M.n+" "+plural(M.n,"билет","билета","билетов")+" · шанс "+(T?Math.max(.1,Math.round(M.n/T*1000)/10):100)+"%":"У тебя "+M.n+" из "+C.min+" друзей — ещё "+(C.min-M.n)+" и ты в розыгрыше!";
  sm.textContent="твои друзья: "+M.d+" · друзья друзей: "+M.l2+(inn?" · каждый новый друг = +1 билет":"");me.append(mb);if(C.phase!=="soon")me.append(sm);
  const Tb=$("chal-top");Tb.innerHTML="";const P=C.top.filter(r=>r.n>=C.min);
  if(C.phase!=="soon"){if(!P.length)Tb.innerHTML='<div class="empty">Пока никто не набрал '+C.min+' друзей — стань первым участником!</div>';
    for(const r of P){const d=document.createElement("div");d.className="cr"+(r.me?" me":"");d.innerHTML="<i></i><span></span><b></b>";d.children[0].textContent="🎟";d.children[1].textContent=(r.vip?"👑 ":"")+r.name;d.children[2].textContent=r.n+" · "+(T?Math.round(r.n/T*100):0)+"%";Tb.append(d)}}
  $("chal-go").hidden=C.phase!=="on";
  $("chal-rules").textContent="Считаются только новые игроки, которые пришли сегодня с "+hm(C.start)+" до "+hm(C.end)+" по твоей ссылке и открыли хотя бы "+C.need+" карточки. Друг твоего друга тоже засчитывается тебе. От "+C.min+" друзей ты участник, каждый друг — 1 билет. В "+hm(C.end)+" бот случайно выбирает победителя: чем больше билетов, тем выше шанс. Время — минское. Приз выдаёт @voinovadmin: подарок Telegram на "+C.prizes[0]+" или звёзды."}
setInterval(()=>{if(chData&&!$("chal").hidden){const l=Math.max(0,chData.left-(NOW()-chData._t));if(l<=0&&chData.phase!=="done"&&NOW()-chAt>5000)loadChal();else if(chData.phase!=="done")$("chal-left").textContent=(chData.phase==="soon"?"через ":"")+tleft(l)}},1000);
setInterval(loadChal,30000);setTimeout(loadChal,1500);
/* ---------- самые редкие воины на главной ---------- */
let rareDrawn="";
/* сколько раз воин с отделкой уже выпал в игре (сервер считает и проданные — номер всё равно был выдан) */
const everIssued=(h,f)=>ONLINE?((S.prints||{})[h+"-"+f]||0):localCtx().issuedOf(h,f);
function renderRare(){const g=$("rare-g");if(!g||!S)return;const own=new Set(S.cards.map(c=>c.h)),tot=HEROES.reduce((a,H)=>a+HW[H[2]],0);
  const list=HEROES.map((H,i)=>i).filter(i=>i<NBASE&&HEROES[i][2]>=3).sort((a,b)=>HEROES[b][2]-HEROES[a][2]);
  const ever=h=>ONLINE?FIN.reduce((a,F,f)=>a+((S.prints||{})[h+"-"+f]||0),0):S.cards.filter(c=>c.h===h).length;
  const errFree=HEROES.map((H,i)=>i).filter(i=>i<NBASE&&everIssued(i,4)<1),goldLeft=list.map(i=>[i,FIN[3].run-everIssued(i,3)]);
  const key=JSON.stringify([list.map(i=>own.has(i)?1:0),list.map(ever),errFree,goldLeft]);if(key===rareDrawn)return;rareDrawn=key;
  g.innerHTML=list.map(i=>{const H=HEROES[i],t=H[2],p=HW[t]/tot,one=Math.round(1/p),n=ever(i);
    return '<div class="rare-c'+(t===4?' myth':'')+'" style="--c:'+HT[t].c+'">'+(own.has(i)?'<span class="own" title="Есть у тебя">✅</span>':'')+'<div class="p">'+portrait(i,null,1)+'</div><b>'+H[0]+'</b><small>'+HT[t].k+'</small><i>1 из '+fmtN(one)+'</i>'+
      (n?'<em class="ev">выбит '+n+' раз</em>':'<em class="ev none">🔥 никто не выбил!</em>')+'</div>'}).join("")+
    '<div class="rare-free"><h4>🎯 Ещё ни у кого нет</h4>'+
    '<div class="rf-row"><b>❌ Ошибка печати</b><span>одна на весь мир для каждого воина · свободно <i>'+errFree.length+' из '+NHEROES+'</i></span></div>'+
    '<div class="rf-chips">'+errFree.filter(i=>HEROES[i][2]>=2).sort((a,b)=>HEROES[b][2]-HEROES[a][2]).map(i=>'<span style="--c:'+HT[HEROES[i][2]].c+'">'+portrait(i,null,1)+HEROES[i][0]+'</span>').join("")+'</div>'+
    '<div class="rf-row"><b>🥇 Золотые редкие</b><span>тираж 10 на воина · осталось выпустить</span></div>'+
    '<div class="rf-chips">'+goldLeft.map(([i,l])=>'<span style="--c:'+HT[HEROES[i][2]].c+'" class="'+(l<=0?'out':'')+'">'+portrait(i,null,1)+HEROES[i][0]+' <i>'+Math.max(0,l)+'/10</i></span>').join("")+'</div></div>'}
$("rare-all").onclick=()=>{colView="beauty";setTab("col")};
/* ---------- акция и VIP ---------- */
const isVip=()=>!!S&&(S.vipUntil||0)>NOW();
function renderPromo(){if(!S)return;const P=S.promo,box=$("promo");
  const on=!!P&&P.end>NOW()&&!isVip();box.hidden=!on;
  if(on){$("promo-left").textContent=tleft(P.end-NOW());const h=Math.min(P.have,P.need);
    $("promo-t").innerHTML="";$("promo-t").textContent="Пригласи "+P.need+" друзей, пока идёт таймер, и получи 👑 VIP на 7 дней: "+VIP_SPINS+" прокруток вместо "+SPINS_MAX+", значок VIP в топе и чате и золотое оформление. У тебя "+h+" из "+P.need;
    $("promo-bar").style.width=h/P.need*100+"%"}
  const vb=$("vipbox");vb.hidden=!isVip();if(isVip())$("vip-t").textContent="ещё "+Math.ceil((S.vipUntil-NOW())/864e5)+" дн. · "+VIP_SPINS+" прокруток каждые 4 часа";
  document.body.classList.toggle("vip",isVip())}
$("promo-go").onclick=()=>$("ref-go").click();
setInterval(renderFree,1000);

/* ---------- бой в три раунда: результат считают правила, здесь только анимация ---------- */
const RN=["Твой выбор","Выбор соперника","Случайная"];
function pipsHTML(picks,rounds,cur,shown,labels){shown=shown||[0];labels=labels||RN;return [0,1,2].map(k=>{const r=rounds[k],known=r||shown.includes(k);
  const cls=r?(r.a>r.b?"w":r.a<r.b?"l":"d"):(k===cur?"cur":"");
  return `<div class="rd ${cls}"><small>Раунд ${k+1}</small><b>${known&&picks[k]!=null?STN[picks[k]]:"?"}</b><span>${r?r.a+" : "+r.b:labels[k]}</span></div>`}).join("")}
function runBattle(o){const rounds=[];let i=0;const shown=o.shown||[0];
  const pips=()=>{o.roundsEl.innerHTML=pipsHTML(o.picks,rounds,i,shown)};
  const fight=()=>{const s=o.picks[i];if(!shown.includes(i))shown.push(i);pips();o.statusEl.textContent="Раунд "+(i+1)+" — "+STN[s];
    o.leftEl.classList.remove("win","lose");o.rightEl.classList.remove("win","lose");
    o.leftEl.innerHTML=mcHTML(o.L,s,0);o.rightEl.innerHTML=mcHTML(o.Rc,s,0);
    if(o.vsEl){o.vsEl.classList.remove("clash");void o.vsEl.offsetWidth;o.vsEl.classList.add("clash")}sfx.clash();hap("medium");
    const a=o.rounds[i].a,b=o.rounds[i].b,t0=performance.now(),ms=reduce?0:900;
    (function f(t){const k=ms?Math.min(1,(t-t0)/ms):1,e=1-Math.pow(1-k,3);o.leftEl.querySelector(".v b").textContent=Math.round(a*e);o.rightEl.querySelector(".v b").textContent=Math.round(b*e);
      if(k<1){if(Math.random()<.35)sfx.tick();requestAnimationFrame(f);return}
      rounds.push({a,b});if(a>b){o.leftEl.classList.add("win");o.rightEl.classList.add("lose");sfx.lock()}else if(a<b){o.rightEl.classList.add("win");o.leftEl.classList.add("lose");tone(220,.18,"square",.06)}
      o.statusEl.textContent="Раунд "+(i+1)+": "+(a>b?"твой":a<b?"соперника":"ничья")+" ("+a+" : "+b+")";
      i++;pips();setTimeout(next,reduce?0:1000)})(t0)};
  const next=()=>{if(i>=3){const w=rounds.filter(r=>r.a>r.b).length,l=rounds.filter(r=>r.a<r.b).length;o.leftEl.classList.remove("win","lose");o.rightEl.classList.remove("win","lose");
      if(w>l){o.leftEl.classList.add("win");o.rightEl.classList.add("lose")}else if(l>w){o.rightEl.classList.add("win");o.leftEl.classList.add("lose")}
      o.statusEl.textContent="Счёт "+w+" : "+l;o.done(w,l,rounds);return}
    if(i===1&&!reduce){pips();o.statusEl.textContent="Соперник выбирает характеристику…";setTimeout(fight,900);return}
    if(i===2&&!reduce){pips();let n=0;const iv=setInterval(()=>{o.statusEl.textContent="Случайная характеристика: "+STN[n%5];sfx.tick();n++},90);setTimeout(()=>{clearInterval(iv);fight()},1300);return}
    fight()};
  next()}

/* ---------- дуэли ---------- */
let duMine=null,duStat=0,duMode=0,duBusy=false;
const BOTN=["Артём_777","lena.k","Тимур","Max_Rich","Ксюша","Vlad_B","Самурай228","Олег"];

/* карточка в бою: та же настоящая карточка, что в коллекции, а под ней плашка с характеристикой раунда */
function mcHTML(c,stat,show){return `<div class="mcf">${miniSlot(c)}</div><div class="v"><small>${STN[stat]}</small><b class="num">${show==null?(c.stats?eff(c,stat):"?"):show}</b></div>`}
function renderDuel(){
  if(duMine&&!S.cards.some(c=>c.id===duMine))duMine=null;
  const md=$("du-mode");md.innerHTML="";
  ["На интерес","На карточку"].forEach((t,i)=>{const b=document.createElement("button");b.type="button";b.textContent=t;b.setAttribute("aria-pressed",i===duMode);b.onclick=()=>{if(duBusy)return;duMode=i;renderDuel()};md.appendChild(b)});
  const me=S.cards.find(c=>c.id===duMine),mel=$("du-me");
  if(!duBusy){
    if(me){mel.className="mc";mel.style.setProperty("--hc",HT[HEROES[me.h][2]].c);mel.innerHTML=mcHTML(me,duStat)}
    else{mel.className="mc empty";mel.textContent=S.cards.length?"Выбери воина выше":"Сначала открой карточки на вкладке «Крутить»"}
    const op=$("du-op");op.className="mc back";op.innerHTML="<span>СОПЕР<br>НИК</span>";
  }
  const sb=$("du-stats");sb.innerHTML="";
  STN.forEach((n,i)=>{const b=document.createElement("button");b.type="button";b.setAttribute("aria-pressed",i===duStat);b.innerHTML=`${n}<b class="num">${me?eff(me,i):"—"}</b>`;b.onclick=()=>{if(duBusy)return;duStat=i;renderDuel()};sb.appendChild(b)});
  if(!duBusy)$("du-rounds").innerHTML=pipsHTML([duStat,null,null],[],0);
  const go=$("du-go");go.disabled=!me||duBusy;go.textContent=duMode?"В бой на карточку!":"В бой!";
  const pk=$("du-pick");pk.innerHTML="";
  [...S.cards].filter(c=>!away(c)&&!(FIN[c.f].excl||c.part)).sort((a,b)=>eff(b,duStat)-eff(a,duStat)).forEach(c=>{
    const H=HEROES[c.h],b=document.createElement("button");b.type="button";b.className="pc";b.style.setProperty("--hc",HT[H[2]].c);b.setAttribute("aria-pressed",c.id===duMine);
    b.innerHTML=`<span class="pv">${miniSlot(c)}</span><span></span><span style="color:#5a5f80">${STN[duStat]}: ${eff(c,duStat)}</span><b>Ур. ${lvl(c)}${c.wins?", побед "+c.wins:""}</b>`;b.children[1].textContent=H[0];
    b.onclick=()=>{if(duBusy)return;duMine=c.id;$("du-res").textContent="";renderDuel();setTimeout(()=>$("du-go").scrollIntoView({block:"end",behavior:reduce?"auto":"smooth"}),60)};pk.appendChild(b)});
  $("du-wins").textContent="Побед сегодня: "+day(S,NOW()).wins;
  $("du-mode").title=duMode?"На карточку дерёшься с ботами: чужие карточки не отнимаются":"";
  renderAttacks();renderStake();
  if(duMode&&!duBusy&&!$("du-res").textContent)$("du-res").textContent=ONLINE&&S.stake?"На карточку: соперник из игроков с похожей ценой карточки, если таких нет, то бот":"Сейчас на карточку ты дерёшься с ботами. Включи бои с игроками ниже";
}
function renderStake(){const b=$("stake-go"),t=$("stake-t");if(!b)return;const on=!!S.stake;
  b.textContent=on?"Выключить":"Включить";b.style.background=on?"#e8eaf3":"";
  t.textContent=(on?"Включено. ":"")+"Твоих воинов могут вызвать на бой на карточку другие игроки, даже когда тебя нет в игре. Отобьётся твой воин, и ты заберёшь карточку нападавшего. Проиграет, и твоя карточка уйдёт к нему. Соперники только с похожей ценой карточки (от 0,5× до 2×). Карточки на рынке и в походе не участвуют. Нападать на игроков в бою на карточку можно, только если включено и у тебя."+(ONLINE?"":" Работает в игре через Telegram.")}
$("stake-go").onclick=async()=>{if(!ONLINE){toast("Бои с игроками работают в игре через Telegram");return}const on=!S.stake;const r=await act("stake_set",{on:on?1:0});if(r){renderDuel();toast(on?"Бои на карточку с игроками включены. Удачи!":"Бои на карточку с игроками выключены")}};
/* кто нападал на мои карточки: уведомление и реванш */
const seenFights=new Set();
function renderAttacks(){const box=$("du-att"),list=$("du-att-list"),F=(S&&S.fights)||[];box.hidden=!F.length;list.innerHTML="";
  F.forEach(f=>{const won=f.w>f.l,d=document.createElement("div");d.className="fr";
    d.innerHTML='<span><b></b><br><small></small></span><button type="button" class="mini2">Реванш</button>';
    d.querySelector("b").textContent=f.att_name;
    d.querySelector("small").textContent=defTxt(f)+" · "+ago(f.t);
    d.querySelector("button").onclick=()=>openParam("c_"+f.att_card);list.appendChild(d)})}
/* счёт с точки зрения защитника: сначала его раунды */
function defTxt(f){const H=HEROES[f.def_h][0],sc=f.l+":"+f.w;
  if(f.stake&&f.took)return f.w>f.l?"Бой на карточку: твой "+H+" проиграл "+sc+" и ушёл к сопернику":"Бой на карточку: твой "+H+" отбился "+sc+" и забрал карточку соперника ("+HEROES[f.att_h][0]+")";
  return f.w>f.l?"Твой "+H+" проиграл "+sc:f.w<f.l?"Твой "+H+" отбился "+sc:"Твой "+H+": ничья "+sc}
function fightNews(){((S&&S.fights)||[]).filter(f=>!f.seen&&!seenFights.has(f.id)).forEach(f=>{seenFights.add(f.id);
  toast("Нападение от "+f.att_name+": "+defTxt(f).replace("Твой","твой")+". Реванш во вкладке «Бой»")})}
let duRematch=null;
$("du-again").onclick=()=>{if(!duRematch||duBusy)return;$("du-go").click()};
$("du-go").onclick=async()=>{
  const me=S.cards.find(c=>c.id===duMine);if(!me||duBusy)return;duBusy=true;ac();$("du-again").hidden=true;
  const rem=duMode?null:duRematch;duRematch=null;
  const op=$("du-op"),mel=$("du-me"),res=$("du-res");let bot=BOTN[Math.floor(Math.random()*BOTN.length)];res.className="result";res.textContent=rem?"Реванш!":"Ищем соперника…";
  $("du-go").disabled=true;mel.classList.remove("win","lose");
  op.classList.add("back");op.innerHTML="<span>СОПЕР<br>НИК</span>";
  if(!reduce){op.style.animation="shake .11s linear infinite";whoosh()}
  const r=await act("duel",{id:me.id,stat:duStat,mode:duMode,rematch:rem||undefined});
  if(!r){op.style.animation="";duBusy=false;renderDuel();return}
  if(r.real)bot=r.oppName;res.textContent="Соперник: "+bot+(r.real?" (игрок)":"");
  setTimeout(()=>{
    op.style.animation="";op.className="mc";op.style.setProperty("--hc",HT[HEROES[r.opp.h][2]].c);
    runBattle({L:r.me,Rc:r.opp,picks:r.picks,rounds:r.rounds,leftEl:mel,rightEl:op,roundsEl:$("du-rounds"),statusEl:$("du-st"),vsEl:$("du-vs"),done:(w,l)=>{
      let msg;const sc=w+" : "+l;
      if(w===l)msg="Ничья "+sc+"! Опыт +15";
      else if(w>l){sfx.fanfare();burst(3);hapN("success");msg=r.gotCard?"Победа "+sc+"! Карточка "+HEROES[r.gotCard.h][0]+(r.real?" игрока "+bot:"")+" теперь твоя":"Победа "+sc+"! Награда "+fmt(r.reward)}
      else{sfx.lose();msg=r.lostCard?"Поражение "+sc+". Твоя карточка ушла к "+bot:"Поражение "+sc+". Попробуй другого воина или характеристику";if(r.lostCard&&current&&current.id===me.id){current=null;$("sell").disabled=true}}
      res.textContent=(r.real?"Против "+bot+". ":"")+msg;res.className="result "+(w>l?"win":w<l?"lose":"");updCash();
      if(r.real){duRematch=r.opp.id;const ag=$("du-again");ag.hidden=false;ag.textContent=(w>l?"Ещё раз с ":"Реванш с ")+bot}
      setTimeout(()=>{duBusy=false;if(r.lostCard)duMine=null;$("du-st").textContent="Раунд 1: выбери характеристику";renderDuel()},2200)}});
  },reduce?0:Math.max(0,900));
};


/* ---------- Telegram ---------- */
try{if(tg){tg.ready();tg.expand();try{tg.disableVerticalSwipes&&tg.disableVerticalSwipes()}catch(e){}tg.setHeaderColor&&tg.setHeaderColor("#1d44c8");tg.setBackgroundColor&&tg.setBackgroundColor("#1d44c8")}}catch(e){}
function hap(k){try{tg&&tg.HapticFeedback&&tg.HapticFeedback.impactOccurred(k)}catch(e){}}
function hapN(k){try{tg&&tg.HapticFeedback&&tg.HapticFeedback.notificationOccurred(k)}catch(e){}}
$("share").onclick=()=>{
  const c=current;if(!c){toast("Сначала выбей карточку");return}
  const cl=classify(c.sn),txt=`Мне выпал ${HEROES[c.h][0]} (${FIN[c.f].k.toLowerCase()}${FIN[c.f].run!==Infinity?", "+c.no+" из "+FIN[c.f].run:""}), № ${fmtSn(c.sn)}${cl?" — "+cl.k.toLowerCase():""}! Цена ${fmt(c.v)}. Сможешь круче?`;
  const url="https://t.me/share/url?url="+encodeURIComponent(BOT_LINK)+"&text="+encodeURIComponent(txt);
  if(tg&&tg.openTelegramLink){tg.openTelegramLink(url);return}
  if(navigator.clipboard)navigator.clipboard.writeText(txt+" "+BOT_LINK).then(()=>toast("Текст скопирован, отправь другу"),()=>toast(txt));else toast(txt);
};
/* ---------- серия входов + гарантия ---------- */
function renderStreak(){if(!S||!S.streak)return;const st=S.streak,box=$("streak");box.innerHTML="";
  for(let i=1;i<=7;i++){const e=document.createElement("i");e.textContent=i===7?"★":i;if(i<st.n||(i===st.n&&st.claimed))e.className="on";else if(i===7)e.className="last";box.appendChild(e)}
  $("st-t").textContent=st.n===7?"День 7: гарантированная эпическая карточка или лучше!":"День "+st.n+" из 7. Сегодня +1 прокрутка, на 7-й день гарантированная эпическая карточка.";
  const b=$("st-go");b.disabled=st.claimed;b.textContent=st.claimed?"Завтра ещё":"Забрать";
  const p=S.pity||0;$("pity-n").textContent=p+"/"+PITY;$("pity-bar").style.width=Math.min(100,p/PITY*100)+"%";
  $("pity-t").textContent=(S.guar||0)>0?"Следующая карточка будет эпической или лучше!":"Если "+PITY+" карточек подряд не будет эпической, следующая точно будет эпической или лучше. Осталось "+(PITY-p)+".";}
$("st-go").onclick=async()=>{const r=await act("streak");if(!r)return;toast(r.n===7?"Неделя подряд! Следующая карточка будет эпической или лучше":"+1 прокрутка за вход");sfx.coin();renderAll()};

/* ---------- достижения + витрина ---------- */
function renderAch(){const box=$("achs");if(!box)return;box.innerHTML="";const got0=S.ach||{};
  ACH.forEach(A=>{const ok=A.ok(S,S.cards),got=got0[A.id],el=document.createElement("div");el.className="ach"+(got?" done":"");
    el.innerHTML=`<b></b><button type="button" class="mini2">${got?"Получено":"+"+A.r+" "+(A.r===1?"прокрутка":A.r<5?"прокрутки":"прокруток")}</button><small></small>`;
    el.querySelector("b").textContent=(got?"✓ ":"")+A.t;el.querySelector("small").textContent=A.d;
    const b=el.querySelector("button");b.disabled=!ok||got;b.onclick=async()=>{const r=await act("ach",{id:A.id});if(!r)return;sfx.coin();hapN("success");renderAll();toast("Достижение «"+A.t+"»! +"+A.r)};box.appendChild(el)})}
function renderShow(){const box=$("show3");if(!box)return;box.innerHTML="";
  const top=[...S.cards].sort((a,b)=>b.v-a.v).slice(0,3);
  for(let i=0;i<3;i++){const c=top[i],d=document.createElement("div");
    if(c){d.className="mc";d.style.setProperty("--hc",HT[HEROES[c.h][2]].c);d.innerHTML=`<div class="t">${HEROES[c.h][0]}</div><div class="p">${portrait(c.h,c,1)}</div><div class="v"><small>${FIN[c.f].k}</small><b class="num">${fmt(c.v)}</b></div>`}
    else{d.className="mc empty";d.textContent="Пусто"}box.appendChild(d)}
  $("pf-t").textContent="Состояние "+fmt(S.cards.reduce((a,c)=>a+c.v,0))+", побед "+(S.totalWins||0);}

/* ---------- слияние 3 → 1 ---------- */
function renderMerge(){const box=$("merge");if(!box)return;box.innerHTML="";const g={};
  S.cards.forEach(c=>{if(c.f<3&&!c.part&&!away(c)&&c.h<NBASE){const k=c.h+"-"+c.f;(g[k]=g[k]||[]).push(c)}});
  const groups=Object.values(g).filter(a=>a.length>=3);
  if(!groups.length){box.innerHTML='<p style="margin:0;color:#5a5f80">Пока нечего сливать. Собери три одинаковых карточки.</p>';return}
  groups.forEach(a=>{const c=a[0],nf=c.f+1,left=FIN[nf].run===Infinity||issuedOfUI(c.h,nf)<FIN[nf].run,el=document.createElement("div");el.className="mg";el.style.setProperty("--hc",HT[HEROES[c.h][2]].c);
    el.innerHTML=`<span class="e">${miniSlot(c)}</span><span><b></b><br><small style="color:#5a5f80">${a.length} шт., ${FIN[c.f].k.toLowerCase()} → ${FIN[nf].k.toLowerCase()}</small></span><button type="button" class="mini2">${left?"Слить 3":"Тираж закончился"}</button>`;
    el.querySelector("b").textContent=HEROES[c.h][0];const b=el.querySelector("button");b.disabled=!left;
    b.onclick=async()=>{const r=await act("merge",{h:c.h,f:c.f});if(!r)return;const n=r.card;
      if(current&&!S.cards.some(x=>x.id===current.id)){current=null;$("sell").disabled=true}
      sfx.fanfare();hapN("success");burst(nf+1);renderAll();toast("Слияние! "+HEROES[n.h][0]+", "+FIN[n.f].k.toLowerCase()+", № "+fmtSn(n.sn)+", "+fmt(n.v))};box.appendChild(el)})}


/* ---------- battle hub tabs ---------- */
let btView="duel";
document.querySelectorAll("#bt-seg button").forEach(b=>b.onclick=()=>{btView=b.dataset.v;renderBattle()});
function renderBattle(){renderRk();document.querySelectorAll("#bt-seg button").forEach(b=>b.setAttribute("aria-pressed",b.dataset.v===btView));
  ["arena","duel","boss","exp"].forEach(v=>$("bt-"+v).style.display=v===btView?"flex":"none");
  if(btView==="arena")renderArena();if(btView==="duel")renderDuel();if(btView==="boss")renderBoss();if(btView==="exp")renderExp()}
/* ---------- арена: живые бои ----------
   Пока открыт бой, игра раз в секунду спрашивает у сервера его состояние; оба игрока и зрители видят одно и то же. */
let arRoom=null,arCode=null,arData=null,arMode=0,arPickId=null,arPoll=0,arList=null,arListAt=0,arDeadline=0,arAnim="",arDone="";
const arVisible=()=>!$("sec-duel").hidden&&btView==="arena";
function arStop(){clearInterval(arPoll);arPoll=0}
function arStart(){arStop();arPoll=setInterval(()=>{if(!arVisible()||!arRoom||document.hidden)return;arFetch()},1000)}
async function arFetch(){const r=await act("room_get",{room:arRoom});if(!r){return}arData=r;arDeadline=NOW()+r.left;drawRoom()}
async function arOpen(id,code){arRoom=id;arCode=code||null;const r=await act("room_get",{room:id});if(!r){arRoom=null;renderArena();return}
  arData=r;arDeadline=NOW()+r.left;if(r.phase==="open"&&!r.role){arRoom=null;arJoinDialog(r,code);renderArena();return}renderArena()}
function renderArena(){if(!ONLINE){$("ar-lobby").innerHTML='<div class="box"><p>Арена работает в игре через Telegram.</p></div>';return}
  $("ar-room").hidden=!arRoom;$("ar-lobby").style.display=arRoom?"none":"flex";
  if(arRoom){drawRoom();if(!arPoll)arStart();return}arStop();drawLobby();if(NOW()-arListAt>5000)loadArena()}
async function loadArena(){arListAt=NOW();loadTour();const r=await act("arena_list");if(!r)return;arList=r;if(r.mine&&!arRoom){arOpen(r.mine);return}if(arVisible()&&!arRoom)drawLobby()}
setInterval(()=>{if(arVisible()&&!arRoom&&!document.hidden)loadArena()},6000);
function drawLobby(){
  const pk=$("ar-pick");pk.innerHTML="";const free=S.cards.filter(c=>!away(c)&&!(FIN[c.f].excl||c.part)).sort((a,b)=>b.v-a.v);
  if(!free.some(c=>c.id===arPickId))arPickId=free[0]?free[0].id:null;
  if(!free.length)pk.innerHTML='<p style="margin:0;color:#5a5f80">Нет свободных воинов.</p>';
  free.forEach(c=>{const H=HEROES[c.h],b=document.createElement("button");b.type="button";b.className="pc";b.setAttribute("aria-pressed",c.id===arPickId);
    b.innerHTML=`<span class="pv">${miniSlot(c)}</span><span></span><span style="color:#5a5f80">${FIN[c.f].k}</span><b class="num">${fmtC(c.v)}</b>`;b.children[1].textContent=H[0];
    b.onclick=()=>{arPickId=c.id;drawLobby()};pk.appendChild(b)});
  const md=$("ar-mode");md.innerHTML="";["На интерес","На карточку"].forEach((t,i)=>{const b=document.createElement("button");b.type="button";b.textContent=t;b.setAttribute("aria-pressed",i===arMode);b.onclick=()=>{arMode=i;drawLobby()};md.appendChild(b)});
  $("ar-create").textContent=arMode?"Создать бой на карточку":"Создать бой";
  const L=arList||{open:[],live:[]},row=(r,btnT,fn)=>{const c=r.host.card,d=document.createElement("div");d.className="trow";
    d.innerHTML=`<span class="rk">${r.mode?"💰":"⚔️"}</span><span class="e"></span><span class="t"><b></b><small></small></span><span></span>`;
    d.querySelector(".e").innerHTML=portrait(c.h,c,1);d.querySelector(".e").style.setProperty("--hc",HT[HEROES[c.h][2]].c);
    d.querySelector("b").textContent=r.guest?r.host.name+" vs "+r.guest.name:r.host.name;
    d.querySelector("small").textContent=HEROES[c.h][0]+", "+FIN[c.f].k.toLowerCase()+(r.mode?" · на карточку ~"+fmtC(c.v):" · на интерес");
    const b=document.createElement("button");b.type="button";b.className="mini2";b.textContent=btnT;b.onclick=fn;d.lastChild.appendChild(b);return d};
  const ob=$("ar-open");ob.innerHTML="";L.open.filter(r=>r.host.uid!==S.uid).forEach(r=>ob.appendChild(row(r,"Принять",()=>arJoinDialog(r))));
  if(!ob.children.length)ob.innerHTML='<p style="margin:0;color:#5a5f80">Пока никто не ждёт. Создай бой, и он появится здесь у всех игроков.</p>';
  const lb=$("ar-live");lb.innerHTML="";L.live.forEach(r=>lb.appendChild(row(r,"Смотреть",()=>arOpen(r.id))));
  if(!lb.children.length)lb.innerHTML='<p style="margin:0;color:#5a5f80">Сейчас никто не сражается.</p>'}
async function arCreate(priv){const c=S.cards.find(x=>x.id===arPickId);if(!c){toast("Выбери воина");return}
  const r=await act("room_create",{id:c.id,mode:arMode,priv:priv?1:0});if(!r)return;arRoom=r.id;arData=r;arCode=r.code;sfx.lock();renderAll();
  if(priv)arShare()}
function arShare(){if(!arData)return;const c=arData.host.card;sendLink("Вызываю тебя на живой бой в «Воинах Эпох»! Мой "+HEROES[c.h][0]+(arData.mode?". Играем на карточку 💰":"")+". Заходи, я жду ⚔️",linkFor("b_"+arData.id+"_"+(arData.code||"")))}
$("ar-create").onclick=()=>arCreate(false);$("ar-friend").onclick=()=>arCreate(true);$("ar-refresh").onclick=()=>loadArena();
function arJoinDialog(r,code){const m=$("modal"),sh=$("msheet");sh.innerHTML="";m.hidden=false;let pick=null;const hc=r.host.card;
  sh.innerHTML='<button type="button" class="x">Закрыть</button><div class="who"><span></span><small></small></div><div class="box"><span class="step">Выбери воина</span><div class="pickrow"></div></div><button type="button" class="craftbtn">В бой!</button>';
  sh.querySelector(".x").onclick=closeModal;sh.querySelector(".who span").textContent=r.host.name+" вызывает на бой"+(r.mode?" на карточку 💰":"");
  sh.querySelector(".who small").textContent="Его воин: "+HEROES[hc.h][0]+", "+FIN[hc.f].k.toLowerCase()+". Характеристики соперника откроются только в бою."+(r.mode?" Победитель забирает карточку проигравшего. Нужна карточка ценой от "+fmtC(hc.v*.5)+" до "+fmtC(hc.v*2)+".":"");
  const pk=sh.querySelector(".pickrow"),go=sh.querySelector(".craftbtn");
  const list=S.cards.filter(c=>!away(c)&&!(FIN[c.f].excl||c.part)&&(!r.mode||(c.v>=hc.v*.5&&c.v<=hc.v*2))).sort((a,b)=>b.v-a.v);
  const draw=()=>{pk.innerHTML="";list.forEach(c=>{const b=document.createElement("button");b.type="button";b.className="pc";b.setAttribute("aria-pressed",c.id===pick);
    b.innerHTML=`<span class="pv">${miniSlot(c)}</span><span></span><span style="color:#5a5f80">${FIN[c.f].k}</span><b class="num">${fmtC(c.v)}</b>`;b.children[1].textContent=HEROES[c.h][0];b.onclick=()=>{pick=c.id;draw()};pk.appendChild(b)});
    if(!list.length)pk.innerHTML='<p style="margin:0;color:#5a5f80">'+(r.mode?"Нет подходящей по цене карточки.":"Нет свободных воинов.")+'</p>';go.disabled=!pick};
  draw();go.onclick=async()=>{go.disabled=true;const res=await act("room_join",{room:r.id,id:pick,code:code||undefined});if(!res){go.disabled=false;loadArena();return}
    closeModal();arRoom=res.id;arData=res;arDeadline=NOW()+res.left;hapN("success");setTab("duel");btView="arena";renderBattle()}}
const arSide=(R,me)=>R.role==="guest"?{L:R.guest,R:R.host,lk:"g",rk:"h"}:{L:R.host,R:R.guest,lk:"h",rk:"g"};
function drawRoom(){const R=arData;if(!R)return;const sd=arSide(R),mine=!!R.role,rounds=R.rounds.map(x=>({a:x[sd.lk],b:x[sd.rk],s:x.s}));
  const w=$("ar-who");w.children[0].textContent=(R.guest?sd.L.name+" ⚔️ "+sd.R.name:sd.L.name);
  w.children[1].textContent=(R.mode?"💰 На карточку: победитель забирает карточку проигравшего":"⚔️ На интерес")+(mine?"":" · ты смотришь бой");
  const myTurn=(R.phase==="p0"&&R.role==="host")||(R.phase==="p1"&&R.role==="guest");
  const cur=Math.min(2,rounds.length);
  const lab=R.role==="guest"?["Выбор соперника","Твой выбор","Случайная"]:R.role==="host"?RN:["Выбор "+R.host.name,R.guest?"Выбор "+R.guest.name:"Соперник","Случайная"];
  $("ar-rounds").innerHTML=pipsHTML([0,1,2].map(k=>R.picks[k]),rounds,cur,[0,1,2].filter(k=>R.picks[k]!=null),lab);
  const last=rounds[rounds.length-1],stat=last?last.s:0,Lc=sd.L.card,Rc=sd.R?sd.R.card:null;
  const lEl=$("ar-l"),rEl=$("ar-r");lEl.className="mc";lEl.style.setProperty("--hc",HT[HEROES[Lc.h][2]].c);
  const key=R.id+":"+rounds.length+":"+(R.guest?1:0);
  if(arAnim!==key){arAnim=key;lEl.innerHTML=mcHTML(Lc,stat,last?0:(Lc.stats?eff(Lc,stat):"?"));
    if(Rc){rEl.className="mc";rEl.style.setProperty("--hc",HT[HEROES[Rc.h][2]].c);rEl.innerHTML=mcHTML(Rc,stat,last?0:"?")}else{rEl.className="mc back";rEl.innerHTML="<span>ЖДЁМ<br>СОПЕРНИКА</span>"}
    if(last){const a=last.a,b=last.b,t0=performance.now(),ms=reduce?0:900;$("ar-vs").classList.remove("clash");void $("ar-vs").offsetWidth;$("ar-vs").classList.add("clash");sfx.clash();hap("medium");
      lEl.classList.remove("win","lose");rEl.classList.remove("win","lose");
      (function f(t){const k=ms?Math.min(1,(t-t0)/ms):1,e=1-Math.pow(1-k,3);const lb=lEl.querySelector(".v b"),rb=rEl.querySelector(".v b");if(lb)lb.textContent=Math.round(a*e);if(rb)rb.textContent=Math.round(b*e);
        if(k<1){requestAnimationFrame(f);return}if(a>b){lEl.classList.add("win");rEl.classList.add("lose");sfx.lock()}else if(a<b){rEl.classList.add("win");lEl.classList.add("lose")}})(t0)}}
  const st=$("ar-st"),wins=rounds.filter(x=>x.a>x.b).length,loss=rounds.filter(x=>x.a<x.b).length;
  st.textContent=R.phase==="open"?(R.role==="host"?"Ждём соперника…":"Бой ждёт соперника"):R.phase==="cancel"?"Бой отменён":R.phase==="done"?"Счёт "+wins+" : "+loss
    :myTurn?"Раунд "+(cur+1)+": твой ход, выбери характеристику":R.phase==="p0"||R.phase==="p1"?"Раунд "+(cur+1)+": "+(mine?"соперник":(R.phase==="p0"?R.host.name:R.guest.name))+" выбирает…"
    :last?"Раунд "+rounds.length+" — "+STN[last.s]+": "+(last.a>last.b?(mine?"твой":sd.L.name):last.a<last.b?(mine?"соперника":sd.R.name):"ничья")+" ("+last.a+" : "+last.b+")":"";
  const sb=$("ar-stats");sb.innerHTML="";
  if(myTurn){const me=Lc;STN.forEach((n,i)=>{const b=document.createElement("button");b.type="button";b.disabled=R.picks.includes(i);b.innerHTML=`${n}<b class="num">${me.stats?eff(me,i):"?"}</b>`;
    b.onclick=async()=>{sb.querySelectorAll("button").forEach(x=>x.disabled=true);const r=await act("room_pick",{room:R.id,stat:i});if(r){arData=r;arDeadline=NOW()+r.left;drawRoom()}else arFetch()};sb.appendChild(b)})}
  const res=$("ar-res"),bt=$("ar-btns");bt.innerHTML="";res.textContent="";res.className="result";
  const mk=(t,cls,fn)=>{const b=document.createElement("button");b.type="button";b.className=cls;b.textContent=t;b.onclick=fn;bt.appendChild(b)};
  if(R.phase==="open"&&R.role==="host"){mk("Позвать друга по ссылке","linkbtn",arShare);mk("Отменить бой","ghost",async()=>{if(await act("room_cancel",{room:R.id})){arRoom=null;arData=null;renderAll();loadArena()}})}
  if(R.phase==="done"||R.phase==="cancel"){
    if(R.phase==="done"){const win=wins>loss,lose=wins<loss;
      res.textContent=mine?(win?"🏆 Победа "+wins+" : "+loss+"!"+(R.mode?" Карточка соперника теперь твоя":""):lose?"Поражение "+wins+" : "+loss+(R.mode?". Твоя карточка ушла к сопернику":""):"Ничья "+wins+" : "+loss):(wins>loss?sd.L.name:wins<loss?sd.R.name:"Ничья")+(wins===loss?"":" побеждает "+Math.max(wins,loss)+" : "+Math.min(wins,loss));
      res.className="result "+(mine?(win?"win":lose?"lose":""):"");
      if(arDone!==R.id+":done"){arDone=R.id+":done";if(mine){if(win){sfx.fanfare();burst(3);hapN("success")}else if(lose)sfx.lose()}renderAll();updCash()}}
    mk(mine?"Новый бой":"К арене","craftbtn",()=>{arRoom=null;arData=null;arAnim="";renderArena();loadArena()})}
  arTimer()}
function arTimer(){const R=arData,el=$("ar-timer");if(!el)return;if(!R||!["p0","p1"].includes(R.phase)){el.textContent="";return}
  const s=Math.max(0,Math.ceil((arDeadline-NOW())/1000));el.textContent="⏱ "+s;el.classList.toggle("hot",s<=5)}
setInterval(()=>{if(arVisible()&&arRoom)arTimer()},250);

/* ---------- походы ---------- */
let exDest=0,exPick=null;
function exList(){return S.cards.filter(c=>c.away)}
function exSlots(){return EX_SLOTS+(S.mapDay===todayL()?1:0)}
function tleft(ms){const s=Math.max(0,Math.ceil(ms/1000)),h=Math.floor(s/3600),m=Math.floor(s%3600/60),x=s%60;return (h?h+":":"")+String(m).padStart(h?2:1,"0")+":"+String(x).padStart(2,"0")}
function renderExp(){
  const sl=$("ex-slots");sl.innerHTML="";const list=exList();
  for(let i=0;i<Math.max(exSlots(),list.length);i++){const c=list[i],el=document.createElement("div");
    if(!c){el.className="exp emptys";el.textContent="Свободное место для похода";sl.appendChild(el);continue}
    const D=DEST[c.dest]||DEST[0],left=c.away-NOW();el.className="exp";el.style.setProperty("--hc",HT[HEROES[c.h][2]].c);
    el.innerHTML=`<span class="e">${miniSlot(c)}</span><span><b></b><br><small style="color:#5a5f80"></small></span><button type="button" class="mini2"></button>`;
    el.querySelector("b").textContent=HEROES[c.h][0];el.querySelector("small").textContent=D.k+(left>0?", вернётся через "+tleft(left):", вернулся!");
    const b=el.querySelector("button");const canRush=!ONLINE||S.test||S.admin;b.textContent=left>0?(canRush?"Ускорить (тест)":"В пути"):"Забрать добычу";b.disabled=left>0&&!canRush;
    b.onclick=async()=>{if(left>0){if(await act("exp_rush",{id:c.id}))renderExp();return}
      const r=await act("exp_claim",{id:c.id});if(!r)return;
      let msg=HEROES[c.h][0]+" вернулся: +"+r.money+" 🪙, +"+r.xp+" опыта";if(r.sp)msg+=", +"+r.sp+(r.sp===1?" прокрутка":" прокрутки");
      if(r.card){msg+=". Нашёл карточку: "+HEROES[r.card.h][0]+"!";burst(3)}
      sfx.coin();hapN("success");renderAll();toast(msg)};
    sl.appendChild(el)}
  const dd=$("ex-dest");dd.innerHTML="";
  DEST.forEach((D,i)=>{const b=document.createElement("button");b.type="button";b.setAttribute("aria-pressed",i===exDest);
    b.innerHTML=`<b></b>${D.t}, +${D.xp} опыта<br>${D.m[0]}–${D.m[1]} 🪙${D.card?", шанс карточки "+Math.round(D.card*100)+"%":""}`;b.querySelector("b").textContent=D.k;b.onclick=()=>{exDest=i;renderExp()};dd.appendChild(b)});
  const pk=$("ex-pick");pk.innerHTML="";const free=S.cards.filter(c=>!away(c));
  if(!free.length)pk.innerHTML='<p style="margin:0;color:#5a5f80">Нет свободных воинов.</p>';
  free.sort((a,b)=>b.v-a.v).forEach(c=>{const H=HEROES[c.h],b=document.createElement("button");b.type="button";b.className="pc";b.style.setProperty("--hc",HT[H[2]].c);b.setAttribute("aria-pressed",c.id===exPick);
    b.innerHTML=`<span class="pv">${miniSlot(c)}</span><span></span><span style="color:#5a5f80">Ур. ${lvl(c)}</span><b>${FIN[c.f].k}</b>`;b.children[1].textContent=H[0];b.onclick=()=>{exPick=c.id;renderExp()};pk.appendChild(b)});
  const go=$("ex-go"),full=list.length>=exSlots();go.disabled=!exPick||full||!free.some(c=>c.id===exPick);go.textContent=full?"Все места заняты":"Отправить в поход: "+DEST[exDest].k.toLowerCase();
}
$("ex-go").onclick=async()=>{const c=S.cards.find(x=>x.id===exPick);if(!c)return;const r=await act("exp_start",{id:c.id,dest:exDest});if(!r)return;
  if(current&&current.id===c.id){current=null;$("sell").disabled=true}exPick=null;whoosh();renderExp();toast(HEROES[c.h][0]+" ушёл в поход")};
setInterval(()=>{if(S&&!$("sec-duel").hidden&&btView==="exp")renderExp()},1000);


/* ---------- босс недели ---------- */
const bossS=()=>boss(S,NOW());
function bossSVG(hpk){
  const dead=hpk<=0,hurt=hpk<.5,rage=hpk<.25&&!dead,K="#0d1030",eye=dead?"#5a5f80":rage?"#ff3b30":"#ffe14d";
  const st=`stroke="${K}" stroke-linejoin="round" stroke-linecap="round"`;
  const defs=`<defs>
   <linearGradient id="zgB" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5cc04f"/><stop offset=".55" stop-color="#2f8a34"/><stop offset="1" stop-color="#17501f"/></linearGradient>
   <linearGradient id="zgW" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#2a6b4a"/><stop offset="1" stop-color="#123a2c"/></linearGradient>
   <linearGradient id="zgM" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3fa06a" stop-opacity=".85"/><stop offset="1" stop-color="#7a2a3a" stop-opacity=".85"/></linearGradient>
   <linearGradient id="zgL" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f7efc4"/><stop offset="1" stop-color="#c9b77a"/></linearGradient>
   <linearGradient id="zgH" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fffbe8"/><stop offset="1" stop-color="#b9a46a"/></linearGradient>
   <radialGradient id="zgF" cx=".5" cy=".1" r=".9"><stop offset="0" stop-color="#fff7c2"/><stop offset=".35" stop-color="#ffd60a"/><stop offset=".7" stop-color="#ff7a1a"/><stop offset="1" stop-color="#d0141f" stop-opacity="0"/></radialGradient>
   <radialGradient id="zgE"><stop offset="0" stop-color="${eye}" stop-opacity=".9"/><stop offset="1" stop-color="${eye}" stop-opacity="0"/></radialGradient>
   <radialGradient id="zgMo" cx=".4" cy=".35"><stop offset="0" stop-color="#fffbe0"/><stop offset="1" stop-color="#e9d58a"/></radialGradient>
   <pattern id="zgS" width="9" height="7" patternUnits="userSpaceOnUse"><path d="M0 7 Q4.5 0 9 7" fill="none" stroke="#14451b" stroke-width="1.3" opacity=".55"/></pattern>
  </defs>`;
  /* фон: луна, горы, земля, искры */
  let bg=`<circle cx="150" cy="34" r="26" fill="url(#zgMo)" opacity=".9"/><circle cx="141" cy="28" r="4" fill="#d9c36e" opacity=".6"/><circle cx="158" cy="42" r="3" fill="#d9c36e" opacity=".6"/>
   <path d="M0 170 L30 130 L55 150 L85 112 L120 160 L180 160 L215 118 L245 148 L272 126 L300 160 L300 200 L0 200 Z" fill="#2a1450" opacity=".85"/>
   <path d="M0 186 Q75 172 150 182 Q225 172 300 186 L300 200 L0 200 Z" fill="#14081f"/>`;
  for(let i=0;i<9;i++)bg+=`<circle class="zg-em" style="--d:${(i*0.37)%2.6}s" cx="${20+i*33}" cy="${190-(i%3)*6}" r="${1.2+(i%3)*.6}" fill="${i%2?"#ffd60a":"#ff7a1a"}"/>`;
  /* крылья */
  const wing=`<g class="zg-wing"><path d="M118 128 C96 92 58 58 14 34 L34 82 Q50 76 56 96 Q70 86 82 106 Q96 98 104 122 Z" fill="url(#zgM)" ${st} stroke-width="3.5"/>
   <path d="M118 128 C96 92 58 58 14 34" fill="none" stroke="url(#zgW)" stroke-width="7" stroke-linecap="round"/><path d="M118 128 C96 92 58 58 14 34" fill="none" ${st} stroke-width="1.6"/>
   <path d="M108 112 L34 82 M104 118 L56 96 M110 124 L82 106" ${st} stroke-width="2.6" fill="none"/>
   <path d="M14 34 l-6 -4 l9 1 Z" fill="url(#zgH)" ${st} stroke-width="1.5"/>
   ${hurt?`<path d="M58 72 l8 4 l-3 6 l-7 -3 Z M86 92 l6 2 l-2 5 l-6 -2 Z" fill="#1a0b2e" ${st} stroke-width="1.5"/>`:""}</g>`;
  /* хвост */
  const tail=`<path d="M206 182 C246 192 282 172 270 146 C262 128 240 132 246 146" fill="none" stroke="${K}" stroke-width="17" stroke-linecap="round"/>
   <path d="M206 182 C246 192 282 172 270 146 C262 128 240 132 246 146" fill="none" stroke="#2f8a34" stroke-width="11" stroke-linecap="round"/>
   <path d="M246 146 l-12 -6 l14 -10 l6 14 Z" fill="#b3222a" ${st} stroke-width="2.5"/>`;
  /* тело */
  let body=`<path d="M82 200 C78 150 108 116 150 113 C192 116 222 150 218 200 Z" fill="url(#zgB)" ${st} stroke-width="4"/>
   <path d="M82 200 C78 150 108 116 150 113 C192 116 222 150 218 200 Z" fill="url(#zgS)"/>
   <path d="M120 200 C117 162 132 140 150 138 C168 140 183 162 180 200 Z" fill="url(#zgL)" ${st} stroke-width="3"/>
   <path d="M124 160 Q150 152 176 160 M121 174 Q150 166 179 174 M120 188 Q150 180 180 188" fill="none" stroke="#a8955a" stroke-width="2.4"/>
   <path d="M96 138 l-6 -12 l12 6 Z M108 126 l-2 -13 l10 9 Z M192 126 l2 -13 l-10 9 Z M204 138 l6 -12 l-12 6 Z" fill="#b3222a" ${st} stroke-width="2.2"/>
   <path d="M104 150 Q118 132 140 126" fill="none" stroke="#9be08a" stroke-width="3" stroke-linecap="round" opacity=".6"/>`;
  if(hurt)body+=`<path d="M100 160 l26 -14 M104 168 l24 -13" stroke="#fff" stroke-width="3" stroke-linecap="round"/><path d="M100 160 l26 -14 M104 168 l24 -13" stroke="#d0141f" stroke-width="1.4" stroke-linecap="round"/>`;
  if(hpk<.25)body+=`<path d="M172 150 l18 16 M168 158 l16 15" stroke="#fff" stroke-width="3" stroke-linecap="round"/><path d="M172 150 l18 16 M168 158 l16 15" stroke="#d0141f" stroke-width="1.4" stroke-linecap="round"/>`;
  const claws=[100,200].map(x=>`<ellipse cx="${x}" cy="194" rx="17" ry="9" fill="#2f8a34" ${st} stroke-width="3.5"/><path d="M${x-12} 196 l-3 7 M${x} 199 l0 7 M${x+12} 196 l3 7" stroke="url(#zgH)" stroke-width="4" stroke-linecap="round"/><path d="M${x-12} 196 l-3 7 M${x} 199 l0 7 M${x+12} 196 l3 7" ${st} stroke-width="1.2" fill="none"/>`).join("");
  /* шеи и головы */
  const H=dead?[[86,104,-40,128],[150,96,0,120],[214,104,40,172]]:[[80,64,-16,128],[150,46,0,150],[220,64,16,172]];
  let necks="",heads="";
  H.forEach(([x,y,r,nx],i)=>{const d=`M${nx} ${i===1?118:126} C${nx+(x-nx)*.2} ${y+60} ${x+(i===1?0:(x<150?14:-14))} ${y+48} ${x} ${y+26}`;
    necks+=`<path d="${d}" fill="none" stroke="${K}" stroke-width="23" stroke-linecap="round"/><path d="${d}" fill="none" stroke="#2f8a34" stroke-width="17" stroke-linecap="round"/>
      <path d="${d}" fill="none" stroke="#f0e2a8" stroke-width="6" stroke-linecap="round" stroke-dasharray="5 4" opacity=".85"/>`;
    const fire=i===1&&!dead?`<g class="zg-fire"><path d="M${x-8} ${y+48} Q${x-34} ${y+92} ${x-20} ${y+124} Q${x} ${y+108} ${x+20} ${y+124} Q${x+34} ${y+92} ${x+8} ${y+48} Z" fill="url(#zgF)"/>
      <path d="M${x-5} ${y+50} Q${x-16} ${y+82} ${x-8} ${y+102} Q${x} ${y+92} ${x+8} ${y+102} Q${x+16} ${y+82} ${x+5} ${y+50} Z" fill="#fff7c2" opacity=".9"/></g>`:"";
    const eyes=dead?`<path d="M${x-15} ${y-2} l8 8 M${x-7} ${y-2} l-8 8 M${x+7} ${y-2} l8 8 M${x+15} ${y-2} l-8 8" stroke="${K}" stroke-width="3" stroke-linecap="round"/>`
      :`<circle cx="${x-11}" cy="${y+2}" r="9" fill="url(#zgE)"/><circle cx="${x+11}" cy="${y+2}" r="9" fill="url(#zgE)"/>
       <path d="M${x-18} ${y+1} Q${x-11} ${y-5} ${x-4} ${y+4} Q${x-11} ${y+7} ${x-18} ${y+1} Z M${x+18} ${y+1} Q${x+11} ${y-5} ${x+4} ${y+4} Q${x+11} ${y+7} ${x+18} ${y+1} Z" fill="${eye}" ${st} stroke-width="1.8"/>
       <path d="M${x-11} ${y-2} v6 M${x+11} ${y-2} v6" stroke="${K}" stroke-width="2.2" stroke-linecap="round"/>`;
    const smoke=rage?`<circle class="zg-smoke" cx="${x-5}" cy="${y+30}" r="3" fill="#8a8fa8" opacity=".7"/><circle class="zg-smoke" style="--d:.6s" cx="${x+5}" cy="${y+30}" r="3" fill="#8a8fa8" opacity=".7"/>`:"";
    heads+=`${fire}<g class="zg-head" style="--d:${i*.45}s" transform="rotate(${r} ${x} ${y+30})">
      <path d="M${x-14} ${y-14} C${x-22} ${y-30} ${x-34} ${y-36} ${x-40} ${y-30} C${x-32} ${y-30} ${x-26} ${y-22} ${x-22} ${y-10} Z M${x+14} ${y-14} C${x+22} ${y-30} ${x+34} ${y-36} ${x+40} ${y-30} C${x+32} ${y-30} ${x+26} ${y-22} ${x+22} ${y-10} Z" fill="url(#zgH)" ${st} stroke-width="2.6"/>
      <path d="M${x-24} ${y+4} l-12 -4 l9 10 Z M${x+24} ${y+4} l12 -4 l-9 10 Z" fill="#b3222a" ${st} stroke-width="2"/>
      <path d="M${x-24} ${y} C${x-26} ${y-20} ${x-10} ${y-24} ${x} ${y-24} C${x+10} ${y-24} ${x+26} ${y-20} ${x+24} ${y} C${x+22} ${y+14} ${x+14} ${y+28} ${x+11} ${y+38} L${x-11} ${y+38} C${x-14} ${y+28} ${x-22} ${y+14} ${x-24} ${y} Z" fill="url(#zgB)" ${st} stroke-width="3.5"/>
      <path d="M${x} ${y-22} L${x} ${y-8} M${x-6} ${y-20} L${x-4} ${y-10} M${x+6} ${y-20} L${x+4} ${y-10}" stroke="#14451b" stroke-width="2"/>
      <path d="M${x-14} ${y-18} Q${x-6} ${y-24} ${x} ${y-24}" fill="none" stroke="#9be08a" stroke-width="2.5" stroke-linecap="round" opacity=".7"/>
      <path d="M${x-21} ${y-6} L${x-4} ${y-1} M${x+21} ${y-6} L${x+4} ${y-1}" stroke="${K}" stroke-width="4" stroke-linecap="round"/>
      ${eyes}
      <ellipse cx="${x-4.5}" cy="${y+31}" rx="2" ry="1.3" fill="${K}"/><ellipse cx="${x+4.5}" cy="${y+31}" rx="2" ry="1.3" fill="${K}"/>
      ${dead?`<path d="M${x-9} ${y+38} Q${x} ${y+42} ${x+9} ${y+38}" fill="none" ${st} stroke-width="2.5"/>`:`<path d="M${x-11} ${y+37} L${x+11} ${y+37} L${x+9} ${y+52} Q${x} ${y+58} ${x-9} ${y+52} Z" fill="#6b0f1a" ${st} stroke-width="3"/>
      <path d="M${x-9} ${y+38} l2 5 l2 -5 l2 5 l2 -5 l2 5 l2 -5 l2 5 l2 -5 M${x-7} ${y+52} l2 -4 l2 4 l2 -4 l2 4 l2 -4 l2 4" fill="#fff" stroke="#fff" stroke-width="1.2" stroke-linejoin="round"/>`}
      ${smoke}</g>`});
  return defs+bg+wing+`<g transform="matrix(-1 0 0 1 300 0)">${wing}</g>`+tail+`<g class="zg-body${dead?" zg-dead":""}">`+body+claws+necks+heads+`</g>`;
}
let bsBusy=false;
async function setSquad(ids){if(bsBusy)return;bsBusy=true;await act("boss_squad",{ids});bsBusy=false;renderBoss()}
function renderBoss(){const B=bossS(),k=Math.max(0,1-B.dmg/BOSS.hp);
  $("bs-art").innerHTML=bossSVG(k);$("bs-hp").style.width=k*100+"%";$("bs-hpt").textContent=fmtN(Math.max(0,BOSS.hp-B.dmg))+" / "+fmtN(BOSS.hp);
  $("bs-week").textContent=k<=0?"Побеждён! Новый босс в понедельник":"Ударов сегодня: "+Math.max(0,3+(B.extra||0)-B.hits)+" из "+(3+(B.extra||0));
  const squad=(B.squad||[]).filter(id=>S.cards.some(c=>c.id===id&&!away(c)));
  const sq=$("bs-squad");sq.innerHTML="";
  for(let i=0;i<3;i++){const c=S.cards.find(x=>x.id===squad[i]),d=document.createElement("div");
    if(c){d.className="mc";d.style.setProperty("--hc",HT[HEROES[c.h][2]].c);d.innerHTML=mcHTML(c,0);d.style.cursor="pointer";d.onclick=()=>setSquad(squad.filter(x=>x!==c.id))}
    else{d.className="mc empty";d.textContent="Пусто"}sq.appendChild(d)}
  const atk=squad.map(id=>S.cards.find(c=>c.id===id)).filter(Boolean).reduce((a,c)=>a+eff(c,0),0);
  $("bs-sq").textContent="Атака отряда: "+atk;
  const pk=$("bs-pick");pk.innerHTML="";
  S.cards.filter(c=>!away(c)&&!squad.includes(c.id)&&!(FIN[c.f].excl||c.part)).sort((a,b)=>eff(b,0)-eff(a,0)).forEach(c=>{const H=HEROES[c.h],b=document.createElement("button");b.type="button";b.className="pc";b.style.setProperty("--hc",HT[H[2]].c);
    b.innerHTML=`<span class="pv">${miniSlot(c)}</span><span></span><span style="color:#5a5f80">Атака ${eff(c,0)}</span><b>Ур. ${lvl(c)}</b>`;b.children[1].textContent=H[0];
    b.onclick=()=>{if(squad.length>=3){toast("В отряде максимум 3 воина");return}setSquad([...squad,c.id])};pk.appendChild(b)});
  const go=$("bs-go");const maxH=3+(B.extra||0);go.disabled=bsBusy||!squad.length||B.hits>=maxH||k<=0;go.textContent=k<=0?"Босс повержен":B.hits>=maxH?"Удары закончились, приходи завтра":"Ударить ("+(maxH-B.hits)+" из "+maxH+")";
  const ml=$("bs-miles");ml.innerHTML="";
  MILES.forEach((M,i)=>{const d=document.createElement("div"),reached=B.dmg>=BOSS.hp*M.p,got=B.got.includes(i);if(got)d.className="got";
    d.innerHTML=`<span>${Math.round(M.p*100)}% урона: ${M.t}</span>`;const b=document.createElement("button");b.type="button";b.className="mini2";b.textContent=got?"Получено":"Забрать";b.disabled=!reached||got;
    b.onclick=async()=>{const r=await act("boss_claim",{i});if(!r)return;if(r.card)burst(4);sfx.fanfare();hapN("success");renderAll();renderBoss();toast("Награда за босса: "+r.t)};d.appendChild(b);ml.appendChild(d)});
}
$("bs-go").onclick=async()=>{if(bsBusy)return;bsBusy=true;ac();$("bs-go").disabled=true;
  const r=await act("boss_hit");if(!r){bsBusy=false;renderBoss();return}
  const box=$("bs-box"),d=$("bs-dmg");whoosh(.3,.25);setTimeout(()=>{sfx.clash();hap("heavy");box.classList.remove("hit");void box.offsetWidth;box.classList.add("hit");
    d.textContent=(r.crit?"КРИТ! ":"")+"−"+fmtN(r.dmg);d.classList.remove("show");void d.offsetWidth;d.classList.add("show");if(r.crit)burst(3);
    $("bs-res").textContent=(r.crit?"Критический удар! ":"")+"Отряд нанёс "+fmtN(r.dmg)+" урона, каждый воин получил +20 опыта";$("bs-res").className="result win";
    setTimeout(()=>{bsBusy=false;renderBoss()},700)},reduce?0:300)};


/* ---------- друзья: витрина и бой по ссылке ----------
   С сервером в ссылке только номер игрока или карточки, всё остальное берётся с сервера.
   Без сервера данные карточки зашиты прямо в ссылку. */
function myName(){if(S&&S.nick)return S.nick;try{const u=tg&&tg.initDataUnsafe&&tg.initDataUnsafe.user;if(u&&u.first_name)return u.first_name.slice(0,16)}catch(e){}return (S&&S.name)||"Игрок"}
function b64e(bytes){let s="";bytes.forEach(b=>s+=String.fromCharCode(b));return btoa(s).replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/,"")}
function b64d(str){str=str.replace(/-/g,"+").replace(/_/g,"/");while(str.length%4)str+="=";const s=atob(str);return [...s].map(c=>c.charCodeAt(0))}
function encCard(c,out){const sn=+c.sn,v=Math.round(c.v*100);out.push(c.h,c.f,lvl(c),Math.round((c.hue||0)/2)&255,(c.no>>8)&255,c.no&255,(sn>>16)&255,(sn>>8)&255,sn&255);
  c.stats.forEach(x=>out.push((x>>8)&255,x&255));out.push((v>>>24)&255,(v>>16)&255,(v>>8)&255,v&255)}
function decCard(a,i){const c={h:a[i],f:a[i+1],lv:a[i+2],hue:a[i+3]*2,no:(a[i+4]<<8)|a[i+5],sn:String((a[i+6]<<16)|(a[i+7]<<8)|a[i+8]).padStart(6,"0"),stats:[]};
  for(let k=0;k<5;k++)c.stats.push((a[i+9+k*2]<<8)|a[i+10+k*2]);c.v=((a[i+19]<<24)|(a[i+20]<<16)|(a[i+21]<<8)|a[i+22])/100;c.xp=25*Math.pow(c.lv-1,2);c.id="f"+i+"_"+c.sn;
  if(c.h>=HEROES.length||c.f>4||HEROES[c.h][4].collab)throw 0;return c}
const CARD_B=23;
function encName(){const u=new TextEncoder().encode(myName()).slice(0,40);return [u.length,...u]}
function decName(a){const n=a[1];return {name:new TextDecoder().decode(new Uint8Array(a.slice(2,2+n))),i:2+n}}
function linkFor(p){const bot=BOT_LINK.includes("YOUR_BOT")?null:BOT_LINK;return bot?bot+"?startapp="+p:PAGE_URL+"?startapp="+p}
function sendLink(text,url){const share="https://t.me/share/url?url="+encodeURIComponent(url)+"&text="+encodeURIComponent(text);
  if(tg&&tg.openTelegramLink){tg.openTelegramLink(share);return}
  if(navigator.clipboard)navigator.clipboard.writeText(text+" "+url).then(()=>toast("Ссылка скопирована, отправь её другу"),()=>toast(url));else toast(url)}
function showcaseParam(){if(ONLINE)return "u_"+S.uid;
  const top=[...S.cards].sort((a,b)=>b.v-a.v).slice(0,3);const by=[1,...encName(),top.length,Math.min(255,S.totalWins||0),Math.min(255,new Set(S.cards.map(c=>c.h)).size)];top.forEach(c=>encCard(c,by));return "v_"+b64e(by)}
function challengeParam(c,stat){if(ONLINE)return "c_"+c.id+"_"+stat;const by=[1,...encName(),stat];encCard(c,by);return "d_"+b64e(by)}
$("sh-show").onclick=()=>{const top=[...S.cards].sort((a,b)=>b.v-a.v).slice(0,3);if(!top.length){toast("Сначала выбей хотя бы одну карточку");return}
  sendLink("Глянь мою витрину в «Воинах Эпох»: "+top.map(c=>HEROES[c.h][0]).join(", ")+"!",linkFor(showcaseParam()))};
$("du-friend").onclick=()=>{const me=S.cards.find(c=>c.id===duMine);if(!me){toast("Сначала выбери воина");return}
  sendLink("Вызываю тебя на бой! Мой "+HEROES[me.h][0]+", "+STN[duStat].toLowerCase()+" "+eff(me,duStat)+". Сможешь побить?",linkFor(challengeParam(me,duStat)))};
function closeModal(){$("modal").hidden=true;$("msheet").innerHTML="";if(!closeModal.nw){closeModal.nw=1;setTimeout(()=>{try{newsUpd()}catch(e){}},800)}if(chatOpen){chatOpen=false;clearInterval(chatTimer)}}
function bigMc(c,stat,show){const d=document.createElement("div");d.className="mc";d.style.setProperty("--hc",HT[HEROES[c.h][2]].c);d.innerHTML=mcHTML(c,stat,show);return d}
function friendsGet(){try{return JSON.parse(localStorage.getItem("we-friends")||"{}")}catch(e){return {}}}
function friendsPut(F){try{localStorage.setItem("we-friends",JSON.stringify(F))}catch(e){}}
function openShowcase(F){const m=$("modal"),sh=$("msheet");sh.innerHTML="";m.hidden=false;
  const x=document.createElement("button");x.type="button";x.className="x";x.textContent="Закрыть";x.onclick=closeModal;sh.appendChild(x);
  const w=document.createElement("div");w.className="who";w.innerHTML="<span></span><small></small>";w.children[0].textContent="Витрина: "+champMark(F.uid)+(F.vip?"👑 ":"")+(F.pi?"🏅 ":"")+F.name;
  w.children[1].textContent="Собрано воинов: "+F.have+" из "+NHEROES+", побед в боях: "+F.wins;sh.appendChild(w);
  const g=document.createElement("div");g.className="show3";F.cards.forEach(c=>{const d=bigMc(c,0);d.querySelector(".v").innerHTML=`<small>${FIN[c.f].k}, ур. ${lvl(c)}</small><b class="num">${fmt(c.v)}</b>`;g.appendChild(d)});
  if(!F.cards.length){const e=document.createElement("div");e.className="mc empty";e.textContent="Пока нет карточек";g.appendChild(e)}sh.appendChild(g);
  if(F.cards.length){const info=document.createElement("div");info.className="box";info.innerHTML="<h3>Вызвать на бой</h3><p>Выбери карточку друга, потом своего воина и характеристику.</p>";
    const pick=document.createElement("div");pick.className="stats5";pick.style.gridTemplateColumns="repeat(3,1fr)";
    F.cards.forEach(c=>{if(FIN[c.f]&&FIN[c.f].excl||c.part)return;const b=document.createElement("button");b.type="button";b.innerHTML=`${HEROES[c.h][0].replace(/</g,"")}<b class="num">${FIN[c.f].k}</b>`;
      b.onclick=()=>openDuel({name:F.name,card:c,stat:null,cardId:ONLINE?c.id:null,id:ONLINE?"c"+c.id:"v"+c.sn});pick.appendChild(b)});
    info.appendChild(pick);sh.appendChild(info)}
  const fr=friendsGet();fr[F.name]={p:F.p,t:NOW()};friendsPut(fr);renderFriends()}
function openDuel(D){const m=$("modal"),sh=$("msheet");sh.innerHTML="";m.hidden=false;let stat=D.stat===0?1:0,mine=null,busy2=false;
  const x=document.createElement("button");x.type="button";x.className="x";x.textContent="Закрыть";x.onclick=closeModal;sh.appendChild(x);
  const w=document.createElement("div");w.className="who";w.innerHTML="<span></span><small></small>";w.children[0].textContent=D.name+" вызывает тебя!";sh.appendChild(w);
  const box=document.createElement("div");box.className="box";box.innerHTML='<span class="step">Выбери воина</span>';const pk=document.createElement("div");pk.className="pickrow";box.appendChild(pk);sh.appendChild(box);
  const rds=document.createElement("div");rds.className="rounds";sh.appendChild(rds);
  const ar=document.createElement("div");ar.className="arena";const left=document.createElement("div"),vs=document.createElement("div"),right=bigMc(D.card,stat,"?");
  left.className="mc empty";left.textContent="Выбери воина выше";vs.className="vs";vs.textContent="VS";ar.append(left,vs,right);sh.appendChild(ar);
  const bst=document.createElement("div");bst.className="bstatus";sh.appendChild(bst);
  const st=document.createElement("div");st.className="stats5";sh.appendChild(st);
  const go=document.createElement("button");go.type="button";go.className="craftbtn";go.textContent="В бой!";sh.appendChild(go);
  const res=document.createElement("div");res.className="result";sh.appendChild(res);

  function draw(){w.children[1].textContent=D.stat==null?"Три раунда: первый выбираешь ты, второй соперник, третий случайно":"Соперник уже выбрал «"+STN[D.stat]+"» для второго раунда";
    if(!busy2){rds.innerHTML=pipsHTML([stat,D.stat,null],[],0,D.stat!=null?[0,1]:[0]);bst.textContent="Раунд 1: выбери характеристику";right.innerHTML=mcHTML(D.card,stat,"?")}
    st.innerHTML="";STN.forEach((n,i)=>{const b=document.createElement("button");b.type="button";b.setAttribute("aria-pressed",i===stat);b.disabled=D.stat!=null&&i===D.stat;if(b.disabled)b.title="Эту характеристику уже выбрал соперник";
      b.innerHTML=`${n}<b class="num">${mine?eff(mine,i):"—"}</b>`;b.onclick=()=>{if(busy2)return;stat=i;draw()};st.appendChild(b)});
    if(mine&&!busy2){left.className="mc";left.style.setProperty("--hc",HT[HEROES[mine.h][2]].c);left.innerHTML=mcHTML(mine,stat)}
    pk.innerHTML="";S.cards.filter(c=>!away(c)&&!(FIN[c.f].excl||c.part)).sort((a,b)=>eff(b,stat)-eff(a,stat)).forEach(c=>{const H=HEROES[c.h],b=document.createElement("button");b.type="button";b.className="pc";b.style.setProperty("--hc",HT[H[2]].c);b.setAttribute("aria-pressed",mine&&c.id===mine.id);
      b.innerHTML=`<span class="pv">${miniSlot(c)}</span><span></span><span style="color:#5a5f80">${STN[stat]}: ${eff(c,stat)}</span><b>Ур. ${lvl(c)}</b>`;b.children[1].textContent=H[0];b.onclick=()=>{if(busy2)return;mine=c;draw();setTimeout(()=>go.scrollIntoView({block:"end",behavior:reduce?"auto":"smooth"}),60)};pk.appendChild(b)});
    if(!S.cards.length)pk.innerHTML='<p style="margin:0;color:#5a5f80">У тебя пока нет карточек. Закрой окно и открой несколько на вкладке «Крутить».</p>';
    go.disabled=!mine||busy2}
  go.onclick=async()=>{if(!mine||busy2)return;busy2=true;draw();ac();go.disabled=true;
    [...sh.querySelectorAll(".linkbtn")].forEach(x=>x.remove());res.textContent="";
    const r=await act("fduel",{myId:mine.id,myStat:stat,oppStat:D.stat,key:D.id,oppId:D.cardId,opp:ONLINE?undefined:D.card});
    if(!r){busy2=false;draw();return}
    const myCard=mine,myStatUsed=stat;
    runBattle({shown:D.stat!=null?[0,1]:[0],L:r.me,Rc:r.opp,picks:r.picks,rounds:r.rounds,leftEl:left,rightEl:right,roundsEl:rds,statusEl:bst,vsEl:vs,done:(wn,ls)=>{
      const sc=wn+" : "+ls;let txt;
      if(wn>ls){sfx.fanfare();burst(3);hapN("success");
        res.textContent=r.first?"Победа "+sc+"! Награда "+fmt(r.reward)+" и +30 опыта":"Победа "+sc+"! Награду за этот вызов этим воином ты уже получал";
        res.className="result win";txt="Я победил твоего воина "+HEROES[D.card.h][0]+" со счётом "+sc+"! Мой "+HEROES[myCard.h][0]+" сильнее 😎 Реванш?"}
      else if(wn<ls){sfx.lose();res.textContent="Поражение "+sc+". Попробуй другого воина или характеристику";res.className="result lose";txt="Твой "+HEROES[D.card.h][0]+" меня победил ("+ls+" : "+wn+"). Держи ответный вызов!"}
      else{res.textContent="Ничья "+sc+"!";res.className="result";txt="Ничья с твоим воином "+HEROES[D.card.h][0]+" ("+sc+")! Решим в следующем бою?"}
      updCash();
      const back=document.createElement("button");back.type="button";back.className="linkbtn";back.textContent="Отправить результат и вызвать в ответ";
      back.onclick=()=>{const c=S.cards.find(x=>x.id===myCard.id)||myCard;sendLink(txt,linkFor(challengeParam(c,myStatUsed)))};res.after(back);
      setTimeout(()=>{busy2=false;mine=S.cards.find(x=>x.id===myCard.id)||null;go.disabled=false;go.textContent="Ещё раз";draw()},1800)}});
  };
  draw()}
function parseLocalParam(p){try{const kind=p[0],a=b64d(p.slice(2));if(a[0]!==1)return null;const n=decName(a);let i=n.i;
  if(kind==="v"){const cnt=a[i],wins=a[i+1],have=a[i+2];i+=3;const cards=[];for(let k=0;k<cnt;k++){cards.push(decCard(a,i));i+=CARD_B}return {kind,name:n.name,wins,have,cards,p}}
  if(kind==="d"){const stat=a[i];i++;return {kind,name:n.name,stat:stat%5,card:decCard(a,i),id:p.slice(2,40)}}}catch(e){}return null}
/* ---------- бонусы: канал и рефералы ---------- */
let subStep=0;
function renderBonus(){if(!S)return;
  const sb=$("sub-go"),st=$("sub-t");
  $("sub-row").hidden=!!S.subGot2;   // подписался: строка больше не мешает
  if(!S.subGot2){sb.disabled=false;sb.textContent=subStep?"Проверить подписку":"Подписаться";st.textContent=subStep?"Подписался? Нажми «Проверить подписку», и получишь +10 прокруток":"@"+CHANNEL+": новости, события и розыгрыши. За подписку +10 прокруток"}
  $("ref-t").textContent=ONLINE?(chData&&chData.x2?"🔥 Сегодня ×2: +20":"+10")+" прокруток за каждого друга, который зайдёт по твоей ссылке. Приглашено: "+(S.refs||0)+", получено "+(S.refs||0)*10+" прокруток":"+10 прокруток за каждого друга. Работает в игре через бота @VoinyEpohBot"}
$("sub-go").onclick=async()=>{
  if(!subStep){subStep=1;const u="https://t.me/"+CHANNEL;if(tg&&tg.openTelegramLink)tg.openTelegramLink(u);else window.open(u,"_blank");renderBonus();return}
  const r=await act("sub_check");if(!r){renderBonus();return}sfx.coin();hapN("success");burst(2);renderAll();toast("Спасибо за подписку! +10 прокруток")};
/* история в Telegram: открываем редактор с готовой картинкой и личной ссылкой, затем забираем награду */
let storyStep=0;
/* ---------- напоминания от бота ----------
   Telegram разрешает боту писать только тем, кто согласился. Спрашиваем, когда кончились прокрутки: тогда это реально полезно. */
const canPmAsk=()=>ONLINE&&!S.pm&&tg&&tg.requestWriteAccess&&(!tg.isVersionAtLeast||tg.isVersionAtLeast("6.9"));
function renderPm(){const row=$("pm-row");if(row)row.hidden=!canPmAsk()}
function enablePm(){if(!canPmAsk())return;try{tg.requestWriteAccess(ok=>{if(ok){act("pm_on").then(r=>{S.pm=1;renderAll();renderPm();if(r&&r.bonus){sfx.reveal(2);burst(3);hapN("success");toast("🔔 Напоминания включены! +"+r.bonus+" прокрутки в подарок 🎁")}else toast("🔔 Напоминания включены! Бот напишет, когда прокрутки будут готовы")})}else toast("Без разрешения бот не сможет напомнить о прокрутках")})}catch(e){}}
$("pm-go").onclick=enablePm;
function askPm(){if(!canPmAsk()||!$("modal").hidden)return;let asked=null;try{asked=localStorage.getItem("we-pm-ask")}catch(e){}if(asked)return;try{localStorage.setItem("we-pm-ask","1")}catch(e){}
  const m=$("modal"),sh=$("msheet");sh.innerHTML="";m.hidden=false;
  sh.innerHTML='<div class="box nickbox"><h3>🔔 Напомнить о прокрутках?</h3><p>Новые 3 прокрутки будут через 4 часа. Бот напишет, когда они будут готовы, а ещё если кто-то нападёт на твоих воинов или купит твою карточку. Ночью не пишет.</p><button type="button" class="craftbtn" id="pm-yes">Да, напоминать</button><button type="button" class="ghost" id="pm-no">Не надо</button></div>';
  $("pm-yes").onclick=()=>{closeModal();enablePm()};$("pm-no").onclick=closeModal}

/* ---------- подсказка про закалку ---------- */
const canForge=c=>!(FIN[c.f].excl||c.part)&&(c.stars||0)<STAR_MAX&&lvl(c)>=STAR_LVL[c.stars||0];
function forgeHint(){if(!S||onbStep>=0||!$("modal").hidden||$("onb"))return;let shown=null;try{shown=localStorage.getItem("we-forge-hint")}catch(e){}if(shown)return;
  if(S.cards.some(c=>c.stars))return;const c=S.cards.find(canForge);if(!c)return;try{localStorage.setItem("we-forge-hint","1")}catch(e){}
  const el=$("tab-cards");el.classList.add("onb-hl");const b=document.createElement("div");b.id="onb";b.className="onb";
  b.innerHTML='<div class="onb-n">Новое</div><p></p><div class="onb-b"><button type="button" class="mini2" id="fh-go">Показать</button><button type="button" class="ghost" id="fh-no">Потом</button></div>';
  b.querySelector("p").textContent="⭐ "+HEROES[c.h][0]+" дорос до "+lvl(c)+" уровня! Его можно закалить: +10% к силе, цена ×1,3 и новый вид карточки. Закалка во вкладке «Карты» → «Мои»: нажми на карточку.";
  document.body.appendChild(b);const r=el.getBoundingClientRect();b.style.top=Math.max(10,r.top-14-b.offsetHeight)+"px";
  const done=()=>{el.classList.remove("onb-hl");b.remove()};
  $("fh-no").onclick=done;$("fh-go").onclick=()=>{done();setTab("col");setTimeout(()=>openCardView(c,{mine:true}),300)}}

/* основатели: 3 эксклюзивные карточки первым трём, кто пригласит 15 друзей */
function renderFounder(){const row=$("fnd-row");if(!row)return;const left=S.foundersLeft??3,refs=S.refs||0;
  row.hidden=!S.founder&&left<=0;if(row.hidden)return;
  const b=$("fnd-go");
  if(S.founder){$("fnd-h").textContent="🏆 Ты Основатель!";$("fnd-t").textContent="Эксклюзивная карточка «Основатель» у тебя. Таких всего 3 в игре, и больше их не будет";b.textContent="Смотреть";$("fnd-bar").parentNode.hidden=true}
  else{$("fnd-h").textContent="🏆 Основатели: 15 друзей";$("fnd-t").textContent="Первые трое, кто пригласит 15 друзей, получат по эксклюзивной карточке «Основатель» ★5. Её нет в прокрутках. Осталось "+left+" из 3, у тебя "+Math.min(refs,FOUNDER_REFS)+" из "+FOUNDER_REFS;
    b.textContent="Пригласить";$("fnd-bar").parentNode.hidden=false;$("fnd-bar").style.width=Math.min(1,refs/FOUNDER_REFS)*100+"%"}}
$("fnd-go").onclick=()=>{if(S.founder){const c=S.cards.find(x=>x.id===S.founder)||S.cards.find(x=>x.f===5);if(c)openCardView(c,{mine:true});else toast("Карточки «Основатель» сейчас нет в твоей коллекции");return}$("ref-go").click()};
let fndShown=false;
function founderNews(){if(!S||!S.founderNew||fndShown)return;fndShown=true;setTimeout(()=>{sfx.fanfare();burst(4);hapN("success");
  toast("🏆 15 друзей! Ты Основатель: эксклюзивная карточка уже в коллекции");const c=S.cards.find(x=>x.id===S.founder)||S.cards.find(x=>x.f===5);if(c)setTimeout(()=>openCardView(c,{mine:true}),1200)},1500)}

/* первопроходцы: первые 100 игроков */
function renderPioneer(){const row=$("pio-row");if(!row)return;row.hidden=!S.pioneer;if(!S.pioneer)return;
  $("pio-h").textContent="🏅 Первопроходец №"+S.pioneer;$("pio-t").textContent="Ты среди первых "+PIONEERS+" игроков! +"+PIONEER_SPINS+" прокруток уже твои, а рамку «Первопроходец» больше никто не получит. Надень её в Лавке бесплатно"}
$("pio-go").onclick=()=>{lvFrame="pioneer";if(!S.cards.some(c=>c.id===lvPick)){const b=[...S.cards].filter(c=>!c.listed).sort((x,y)=>y.v-x.v)[0];lvPick=b?b.id:null}setTab("shop");shView="lavka";renderShop();setTimeout(()=>$("lv-frames").scrollIntoView({block:"center"}),100)};
let pioShown=false;
function pioneerNews(){if(!S||!S.pioneerNew||pioShown)return;pioShown=true;setTimeout(()=>{sfx.fanfare();burst(4);hapN("success");
  toast("🏅 Ты Первопроходец №"+S.pioneer+" из "+PIONEERS+"! +"+PIONEER_SPINS+" прокруток и эксклюзивная рамка")},900)}
function renderStory(){const b=$("story-go"),t=$("story-t");if(!b)return;const done=S.storyWeek===weekKey(NOW());
  b.disabled=done;b.textContent=done?"Получено":storyStep?"Забрать +10":"Выложить";
  t.textContent=done?"На этой неделе уже получено. Новая награда в понедельник":storyStep?"Выложил историю? Жми «Забрать +10»":"Картинка игры и твоя ссылка в истории Telegram: +10 прокруток раз в неделю"}
$("story-go").onclick=async()=>{
  if(!storyStep){
    if(!(tg&&tg.shareToStory&&(!tg.isVersionAtLeast||tg.isVersionAtLeast("7.8")))){toast("Истории работают в игре через Telegram на телефоне. Обнови Telegram, если не открывается");return}
    const link=ONLINE?linkFor("r_"+S.uid):BOT_LINK,premium=!!(tg.initDataUnsafe&&tg.initDataUnsafe.user&&tg.initDataUnsafe.user.is_premium);
    const opt={text:"Крути карточки воинов и выбей легенду ⚔️ "+link};if(premium)opt.widget_link={url:link,name:"Играть"};
    try{tg.shareToStory(PAGE_URL+"assets/story.jpg",opt)}catch(e){toast("Не получилось открыть истории");return}
    storyStep=1;renderStory();return}
  const r=await act("story");if(!r){renderStory();return}storyStep=0;sfx.coin();hapN("success");burst(2);renderAll();toast("Спасибо за историю! +10 прокруток")};
$("ref-go").onclick=()=>{if(!ONLINE){toast("Приглашения работают в игре через бота @VoinyEpohBot");return}
  sendLink("Залетай в «Воины Эпох»: крути карточки воинов, собирай легенды, сражайся с друзьями и торгуй на рынке!",linkFor("r_"+S.uid))};

async function openParam(p){
  if(p.startsWith("r_"))return;   // приглашение: сервер уже засчитал его при первом входе
  if(p.startsWith("u_")){if(!ONLINE){toast("Эта ссылка работает только в игре через Telegram");return}const r=await act("profile",{uid:+p.slice(2)});if(r)openShowcase(Object.assign(r,{p}));return}
  if(p.startsWith("b_")){if(!ONLINE){toast("Арена работает в игре через Telegram");return}const [,id,code]=p.split("_");setTab("duel");btView="arena";renderBattle();arOpen(+id,code);return}
  if(p.startsWith("c_")){if(!ONLINE){toast("Эта ссылка работает только в игре через Telegram");return}const [,id,stat]=p.split("_");const r=await act("card",{id:+id});
    if(r)openDuel({name:r.name,card:r.card,stat:stat!=null&&stat!==""?(+stat)%5:null,cardId:r.card.id,id:"c"+r.card.id});return}
  const v=parseLocalParam(p);if(!v){toast("Ссылка от друга не открылась");return}
  if(v.kind==="v")openShowcase(v);else openDuel(v)}
function renderFriends(){const box=$("friends");if(!box)return;box.innerHTML="";const F=friendsGet(),names=Object.keys(F).sort((a,b)=>F[b].t-F[a].t);
  if(!names.length){box.innerHTML='<p style="margin:0;color:#5a5f80">Пока никто не присылал витрину. Отправь свою, и друг пришлёт в ответ.</p>';return}
  names.forEach(n=>{const d=document.createElement("div");d.className="fr";d.innerHTML='<span><b></b><br><small></small></span><button type="button" class="mini2">Открыть</button>';
    d.querySelector("b").textContent=n;d.querySelector("small").textContent=(F[n].p.startsWith("u_")?"последний раз ":"витрина от ")+new Date(F[n].t).toLocaleDateString("ru-RU");
    d.querySelector("button").onclick=()=>openParam(F[n].p);box.appendChild(d)})}
function handleStart(){let p=null;try{p=tg&&tg.initDataUnsafe&&tg.initDataUnsafe.start_param}catch(e){}
  if(!p){const q=new URLSearchParams(location.search).get("startapp");if(q)p=q}
  if(p)openParam(p)}


$("cr-amu").onchange=()=>{if(!crBusy)renderCraft()};
/* ---------- рынок ----------
   С сервером здесь лоты настоящих игроков. Без сервера рынок изображают боты. */
const SELLERS=["Артём_777","lena.k","Тимур","Max_Rich","Ксюша","Vlad_B","Самурай228","Олег","Шейх_Района","Дима_Казань"];
const MK_REFRESH=10*60e3, SELL_TICK=20e3;
let shView="buy",slPick=null,mkCache=null,mkAt=0,mkLoading=false;
function sellChance(c){const r=c.listPrice/c.v;return Math.max(.03,Math.min(.9,(1.7-r)*.45))}
/* локальная версия рыночных действий (для игры без сервера) */
const LOCAL={
  shop(){const ones={};ONE.forEach(h=>ones[h]=null);const comp={};COMP.forEach(h=>{comp[h]={l:0,r:HALF_RUN-localCtx().compLeft(h),full:0,e:[0,0,0]}});return {comp,ones,mythLeft:SHOP.mythic.month,donors:[],mine:0,fx:null}},
  invoice(p){const I=SHOP[p.item];let stars;if(I){if(I.once&&S.newbie)fail("Подарок новичку уже получен");stars=I.stars}
    else if(p.item==="num"){const sn=checkSn(p.sn);if(!S.cards.find(c=>c.id===p.card))fail("Карточка не найдена");if(S.used&&S.used[sn])fail("Номер "+fmtSn(sn)+" уже занят");stars=numPrice(sn)}
    else if(p.item==="fx"){if(!NFX[p.fx])fail("Нет такого эффекта");stars=p.forever?NFX_PRICE.f:NFX_PRICE.m}else fail("Нет такого товара");
    S.lpay=S.lpay||{};const pid=Object.keys(S.lpay).length+1;S.lpay[pid]={p,stars,status:"new"};return {pid,sim:1,stars}},
  pay_sim(p){const P=(S.lpay||{})[p.pid];if(!P)fail("Нет такого счёта");if(P.status!=="new")return {pid:p.pid,item:P.p.item,status:P.status,res:P.res};const q=P.p;let res;
    if(SHOP[q.item]){const ctx=localCtx();ctx.grant=true;const r=runAction("grant",S,S.cards,ctx,Object.assign({},q,{pid:"l"+p.pid}));S.cards=r.cards;res=r.res}
    else if(q.item==="num"){const c=S.cards.find(x=>x.id===q.card);delete S.used[c.sn];c.sn=q.sn;c.cust=1;S.used[q.sn]=1;res={card:c.id,sn:q.sn}}
    else{S.nfx=S.nfx||{};S.nfx[S.uid||0]=q.fx;res={fx:q.fx}}
    P.status="done";P.res=res;return {pid:p.pid,item:q.item,status:"done",res}},
  pay_status(p){const P=(S.lpay||{})[p.pid];return P?{pid:p.pid,item:P.p.item,status:P.status,res:P.res}:{status:"new"}},
  market(){if(!S.market||NOW()-S.market.at>MK_REFRESH){const ctx=localCtx(),items=[];
    for(let i=0;i<8;i++){let c;try{c=rollCard(ctx,false)}catch(e){continue}c.id="m"+NOW()+"_"+i;c.xp=Math.random()<.4?Math.floor(Math.random()*900):0;items.push({id:c.id,card:c,price:Math.max(1,Math.round(c.v*(.75+Math.random()*.9))),seller:SELLERS[Math.floor(Math.random()*SELLERS.length)]})}
    items.sort((a,b)=>b.card.v-a.card.v);S.market={at:NOW(),items}}return {items:S.market.items,next:S.market.at+MK_REFRESH}},
  buy(p){const M=S.market||{items:[]},i=M.items.findIndex(x=>x.id===p.id);if(i<0)throw new GameError("Этот лот уже купили");const it=M.items[i];
    if(S.cards.length>=CAP)throw new GameError("Коллекция заполнена");if(S.cash<it.price)throw new GameError("Не хватает "+fmt(it.price-S.cash));
    S.cash=Math.round((S.cash-it.price)*100)/100;it.card.id=S.seq=(S.seq||0)+1;S.cards.push(it.card);M.items.splice(i,1);return {card:it.card,seller:it.seller}},
  list(p){const c=S.cards.find(x=>x.id===p.id);if(!c||away(c))throw new GameError("Эту карточку нельзя выставить");if(S.cards.filter(x=>x.listed).length>=MAX_LOTS)throw new GameError("Можно выставить максимум "+MAX_LOTS+" карточек");
    const pr=Math.max(1,Math.round(+p.price||0));c.listed=1;c.listPrice=pr;c.nextTry=NOW()+SELL_TICK;return {price:pr}},
  unlist(p){const c=S.cards.find(x=>x.id===p.id);if(!c||!c.listed)throw new GameError("Лот не найден");c.listed=0;c.listPrice=0;return {}}
};
function tickSales(){if(ONLINE||!S)return;let sold=false;S.cards.forEach(c=>{if(!c.listed||NOW()<(c.nextTry||0))return;c.nextTry=NOW()+SELL_TICK;
  if(Math.random()<sellChance(c)){const got=Math.round(c.listPrice*(1-FEE)*100)/100;S.cash=Math.round((S.cash+got)*100)/100;c.sold=1;sold=true;
    S.news=(S.news||[]).concat([{h:c.h,buyer:SELLERS[Math.floor(Math.random()*SELLERS.length)],price:c.listPrice,got}])}});
  if(sold){S.cards=S.cards.filter(c=>!c.sold);save();news();renderAll()}}
setInterval(tickSales,5000);
if(ONLINE)setInterval(()=>{if(S&&!document.hidden&&!chatOpen)act("sync").then(()=>{updCash();if(!$("sec-shop").hidden&&shView==="sell")renderSell()})},60000);
function lotRow(c,priceHTML,btn){const H=HEROES[c.h],d=document.createElement("div");d.className="lot";d.style.setProperty("--hc",HT[H[2]].c);
  d.innerHTML=`<span class="e">${miniSlot(c)}</span><span class="t"><b></b>${FIN[c.f].k}${FIN[c.f].run!==Infinity?" "+c.no+"/"+FIN[c.f].run:""}, ур. ${lvl(c)}<br>№ ${fmtSn(c.sn)}${classify(c.sn)?", "+classify(c.sn).k.toLowerCase():""}</span><span class="r">${priceHTML}</span>`;
  d.querySelector("b").textContent=H[0];d.querySelector(".r").appendChild(btn);thumbDeco(d.querySelector(".e"),c);
  if(c.stars)d.querySelector(".t b").insertAdjacentHTML("beforeend",' <span class="stg">★'+c.stars+'</span>');
  d.querySelector(".e").onclick=()=>openCardView(c,{});return d}
async function loadMarket(force){if(mkLoading)return;if(!force&&mkCache&&NOW()-mkAt<15000){drawMarket();return}mkLoading=true;
  if(ONLINE&&!mkCache)$("mk-list").innerHTML='<div class="box"><p>Загружаю лоты…</p></div>';
  const r=await act("market");mkLoading=false;if(!r)return;mkCache=r;mkAt=NOW();drawMarket()}
function drawMarket(){const box=$("mk-list"),M=mkCache||{items:[]};box.innerHTML="";
  $("mk-t").textContent=ONLINE?"Лоты настоящих игроков":"Обновится через "+Math.max(1,Math.ceil((M.next-NOW())/60000))+" мин";
  if(!M.items.length){box.innerHTML='<div class="box"><p>'+(ONLINE?"Пока никто ничего не выставил. Будь первым: выстави свою карточку во вкладке «Продать».":"Всё раскупили. Новые лоты появятся скоро.")+'</p></div>';return}
  M.items.forEach(it=>{const c=it.card,r=it.price/c.v,b=document.createElement("button");b.type="button";b.className="mini2";b.textContent="Купить";
    b.onclick=async()=>{b.disabled=true;const res=await act("buy",{id:it.id,price:it.price});if(!res){b.disabled=false;loadMarket(true);return}
      sfx.coin();hapN("success");if(HEROES[c.h][2]>=3||c.f>=3)burst(3);mkCache.items=mkCache.items.filter(x=>x.id!==it.id);renderAll();toast("Куплено у "+it.seller+": "+HEROES[c.h][0])};
    box.appendChild(lotRow(c,`<b class="num">${fmtC(it.price)}</b><small class="${isCollab(c)?"dear":r<1?"cheap":r>1.2?"dear":""}">${isCollab(c)?"💎 бесценная · 1 из 1":r<1?"−"+Math.round((1-r)*100)+"% от оценки":r>1?"+"+Math.round((r-1)*100)+"% к оценке":"по оценке"}</small><small style="color:#5a5f80;font-weight:500"></small>`,b));
    box.lastChild.querySelector(".r small:last-of-type").textContent=it.seller})}
function renderSell(){const lots=$("lots");lots.innerHTML="";const mine=S.cards.filter(c=>c.listed);
  if(!mine.length)lots.innerHTML='<p style="margin:0;color:#5a5f80">Ты ничего не выставил.</p>';
  mine.forEach(c=>{const b=document.createElement("button");b.type="button";b.className="mini2";b.textContent="Снять";
    b.onclick=async()=>{if(await act("unlist",{id:c.id})){renderAll();toast("Снято с продажи")}};
    lots.appendChild(lotRow(c,`<b class="num">${fmtC(c.listPrice)}</b><small style="color:#5a5f80">${ONLINE?"ждёт покупателя":"шанс продажи ~"+Math.round(sellChance(c)*100)+"% в минуту"}</small>`,b))});
  const pk=$("sl-pick");pk.innerHTML="";const free=S.cards.filter(c=>!away(c));
  if(!free.length)pk.innerHTML='<p style="margin:0;color:#5a5f80">Нет свободных карточек.</p>';
  free.sort((a,b)=>b.v-a.v).forEach(c=>{const H=HEROES[c.h],b=document.createElement("button");b.type="button";b.className="pc";b.style.setProperty("--hc",HT[H[2]].c);b.setAttribute("aria-pressed",c.id===slPick);
    b.innerHTML=`<span class="pv">${miniSlot(c)}</span><span></span><span style="color:#5a5f80">${FIN[c.f].k}</span><b class="num">${isCollab(c)?"бесценная":fmt(c.v)}</b>`;b.children[1].textContent=H[0];
    b.onclick=()=>{slPick=c.id;$("sl-range").value=120;$("sl-price").value=isCollab(c)?1e6:Math.max(1,Math.round(c.v*1.2));renderSell()};pk.appendChild(b)});
  const c=S.cards.find(x=>x.id===slPick&&!away(x)),f=$("sl-form");f.style.display=c?"flex":"none";if(!c)return;
  $("sl-name").textContent=HEROES[c.h][0]+", "+FIN[c.f].k.toLowerCase();$("sl-val").textContent=isCollab(c)?"бесценная — цену ставишь ты":"оценка "+fmt(c.v);$("sl-range").hidden=isCollab(c);sellHint(c)}
function sellHint(c){const pr=+$("sl-price").value||1,tmp={listPrice:pr,v:c.v};
  $("sl-hint").textContent="Получишь "+fmt(pr*(1-FEE))+" после комиссии 5%."+(ONLINE?" Купит тот, кому понравится цена.":" Шанс продажи примерно "+Math.round(sellChance(tmp)*100)+"% в минуту.")+(isCollab(c)?" Бесценную карточку можно продать только на рынке.":" Быстрая продажа без рынка: "+fmt(c.v*QUICK)+".")}
$("sl-range").oninput=()=>{const c=S.cards.find(x=>x.id===slPick);if(!c)return;$("sl-price").value=Math.max(1,Math.round(c.v*$("sl-range").value/100));sellHint(c)};
$("sl-price").oninput=()=>{const c=S.cards.find(x=>x.id===slPick);if(!c)return;$("sl-range").value=Math.round((+$("sl-price").value||0)/c.v*100);sellHint(c)};
$("sl-go").onclick=async()=>{const c=S.cards.find(x=>x.id===slPick&&!away(x));if(!c)return;const pr=Math.max(1,Math.round(+$("sl-price").value||0));
  const r=await act("list",{id:c.id,price:pr});if(!r)return;if(current&&current.id===c.id){current=null;$("sell").disabled=true}slPick=null;sfx.lock();renderAll();toast("Выставлено за "+fmt(pr))};

/* ---------- лавка: на что тратить деньги ---------- */
let lvPick=null,lvFrame="bronze";
function renderLavka(){const c=S.cards.find(x=>x.id===lvPick);
  $("lv-train").textContent=c?(lvl(c)>=LMAX?"Максимум":"Тренировать за "+fmt(trainCost(c))):"Выбери воина";$("lv-train").disabled=!c||lvl(c)>=LMAX;
  $("lv-train-t").textContent=c?HEROES[c.h][0]+", уровень "+lvl(c)+(lvlNext(c)?", опыт "+(c.xp||0)+" из "+lvlNext(c):""):"Выбери воина ниже: +50 опыта за деньги";
  const B=bossS();$("lv-rage").disabled=(B.extra||0)>=2;$("lv-rage").textContent=(B.extra||0)>=2?"Лимит на сегодня":"Купить за 150 🪙";
  $("lv-map").disabled=S.mapDay===todayL();$("lv-map").textContent=S.mapDay===todayL()?"Уже куплена":"Купить за 120 🪙";
  $("lv-prev").innerHTML=c?miniSlot(Object.assign({},c,{frame:lvFrame})):'<span class="lvnone">Выбери воина внизу, и здесь появится превью с рамкой</span>';
  if(FRAMES[lvFrame].only&&!S.pioneer)lvFrame="bronze";
  const fr=$("lv-frames");fr.innerHTML="";Object.entries(FRAMES).filter(([k,F])=>!F.only||S.pioneer).forEach(([k,F])=>{const b=document.createElement("button");b.type="button";b.style.setProperty("--fb",F.bg);b.setAttribute("aria-pressed",k===lvFrame);
    b.innerHTML=`<i></i><span><b></b><br>${F.only?"только для тебя":fmt(F.cost)}</span>`;b.querySelector("b").textContent=F.k;b.onclick=()=>{lvFrame=k;renderLavka()};fr.appendChild(b)});
  $("lv-fgo").disabled=!c;$("lv-fgo").textContent=c?(c.frame===lvFrame?"Эта рамка уже надета":"Надеть рамку «"+FRAMES[lvFrame].k+"» "+(FRAMES[lvFrame].cost?"за "+fmt(FRAMES[lvFrame].cost):"бесплатно")):"Выбери воина внизу";
  const pk=$("lv-pick");pk.innerHTML="";S.cards.filter(x=>!x.listed).sort((a,b)=>b.v-a.v).forEach(x=>{const H=HEROES[x.h],b=document.createElement("button");b.type="button";b.className="pc";b.style.setProperty("--hc",HT[H[2]].c);b.setAttribute("aria-pressed",x.id===lvPick);
    b.innerHTML=`<span class="pv">${miniSlot(x)}</span><span></span><span style="color:#5a5f80">Ур. ${lvl(x)}</span><b>${x.frame?FRAMES[x.frame].k:FIN[x.f].k}</b>`;b.children[1].textContent=H[0];b.onclick=()=>{lvPick=x.id;renderLavka()};pk.appendChild(b)});}
$("lv-train").onclick=async()=>{if(await act("train",{id:lvPick})){sfx.coin();updCash();renderLavka();toast("Тренировка: +50 опыта")}};
$("lv-rage").onclick=async()=>{if(await act("rage")){sfx.coin();updCash();renderLavka();toast("Зелье выпито: +1 удар по боссу сегодня")}};
$("lv-map").onclick=async()=>{if(await act("map")){sfx.coin();updCash();renderLavka();toast("Открыто 4-е место для походов")}};
$("lv-fgo").onclick=async()=>{const c=S.cards.find(x=>x.id===lvPick);if(!c)return;if(await act("frame",{id:c.id,frame:lvFrame})){sfx.coin();burst(2);updCash();renderLavka();toast("Рамка «"+FRAMES[lvFrame].k+"» надета на "+HEROES[c.h][0])}};
document.querySelectorAll("#sh-seg button").forEach(b=>b.onclick=()=>{shView=b.dataset.v;renderShop()});
/* ---------- странствующий торговец ---------- */
let trd=null,trdAt=0;
async function loadTrader(force){const box=$("tr-shop");if(!box)return;if(!ONLINE){box.hidden=true;return}box.hidden=false;
  if(force||!trd||NOW()-trdAt>15000){const r=await act("trader");if(r){trd=r;trdAt=NOW()}}if(!trd)return;drawTrader()}
function drawTrader(){const T=trd,left=Math.max(0,T.left-(NOW()-trdAt));$("trd-t").textContent="Новый товар через "+tleft(left)+" · цены выше рыночных, зато каждая карточка — только одна";
  const I=$("trd-items");I.innerHTML="";
  for(const it of T.items){const d=document.createElement("div");d.className="tri"+(it.star?" star":"")+(it.sold?" sold":"");
    d.innerHTML=(it.star?'<span class="trs">⭐ ЗВЕЗДА ВИТРИНЫ</span>':"")+'<div class="trc">'+miniSlot(it.card)+'</div><b class="num">'+fmtC(it.price)+'</b><small>оценка '+fmtC(it.card.v)+'</small>';
    const b=document.createElement("button");b.type="button";
    if(it.sold){b.className="ghost";b.disabled=true;b.textContent=it.sold.uid===S.uid?"✅ Твоя":"Купил "+it.sold.name}
    else{b.className="craftbtn";b.textContent="Купить";b.onclick=async()=>{if(S.cash<it.price){toast("Не хватает "+fmt(it.price-S.cash));return}
      b.disabled=true;const r=await act("trader_buy",{i:it.i});b.disabled=false;loadTrader(true);if(!r)return;sfx.coin();hapN("success");renderAll();toast("Куплено у торговца: "+HEROES[r.card.h][0]+" за "+fmt(r.price));openCardView(r.card,{mine:true})}}
    d.appendChild(b);I.appendChild(d)}
  const W=$("trd-wants");W.innerHTML='<div class="trwh">🔎 Торговец ищет — платит на '+Math.round((T.k-1)*100)+'% больше оценки:</div>';
  for(const w of T.wants){const mine=S.cards.filter(c=>c.h===w.h&&!away(c)&&!(FIN[c.f].excl||c.part)),d=document.createElement("div");d.className="trwi";
    d.innerHTML='<span class="e">'+portrait(w.h,null,1)+'</span><span><b></b><small></small></span>';d.querySelector("b").textContent=HEROES[w.h][0];
    d.querySelector("small").textContent=w.mine?"ты уже продал ему такого":w.left?"возьмёт ещё "+w.left+" шт.":"уже набрал";
    const b=document.createElement("button");b.type="button";b.className="mini2";
    if(w.mine||!w.left||!mine.length){b.disabled=true;b.textContent=mine.length?"—":"нет у тебя"}
    else{const c=[...mine].sort((a,b)=>a.v-b.v)[0];b.textContent="Продать за "+fmtC(c.v*T.k);b.onclick=async()=>{const pick=mine.length>1?await new Promise(res=>pickCardFrom(mine,"Какого "+HEROES[w.h][0]+" продать торговцу?",res)):c;if(!pick)return;
      if((HEROES[pick.h][2]>=3||pick.f>=2)&&!(await confirmSell(pick)))return;b.disabled=true;const r=await act("trader_sell",{h:w.h,id:pick.id});loadTrader(true);if(!r)return;sfx.coin();renderAll();toast("Торговец заплатил "+fmt(r.got))}}
    d.appendChild(b);W.appendChild(d)}}
function pickCardFrom(list,title,cb){const m=$("modal"),sh=$("msheet");sh.innerHTML="";m.hidden=false;
  sh.innerHTML='<div class="box nickbox"><h3></h3><div class="pkg">'+list.map(c=>'<button type="button" class="pki" data-id="'+c.id+'">'+miniSlot(c)+'</button>').join("")+'</div><button type="button" class="ghost" id="pk-x">Отмена</button></div>';
  sh.querySelector("h3").textContent=title;$("pk-x").onclick=()=>{closeModal();cb(null)};sh.querySelector(".pkg").onclick=e=>{const b=e.target.closest("[data-id]");if(!b)return;closeModal();cb(list.find(x=>String(x.id)===b.dataset.id)||null)}}
setInterval(()=>{if(trd&&!$("sec-shop").hidden&&shView==="buy"){if(trd.left-(NOW()-trdAt)<=0)loadTrader(true);else $("trd-t")&&drawTraderT()}},1000);
function drawTraderT(){const left=Math.max(0,trd.left-(NOW()-trdAt));$("trd-t").textContent="Новый товар через "+tleft(left)+" · цены выше рыночных, зато каждая карточка — только одна"}
/* ---------- аукцион дня ---------- */
let auc=null,aucAt=0;
async function loadAuc(force){if(!ONLINE)return null;if(force||!auc||NOW()-aucAt>8000){const r=await act("auc");if(r!==null){auc=r;aucAt=NOW()}}drawAuc();return auc}
function aucLeft(){return auc?Math.max(0,auc.left-(NOW()-aucAt)):0}
function drawAuc(){const box=$("auc-box"),bn=$("auc-go");if(!box)return;const A=auc&&auc.card?auc:null;
  if(bn){const show=A&&(A.phase==="on"||A.phase==="soon"&&aucLeft()<3600e3);bn.hidden=!show;if(show){$("auc-go-t").textContent=A.phase==="on"?"🔨 Аукцион идёт! "+tleft(aucLeft()):"🔨 Аукцион через "+tleft(aucLeft());$("auc-go-s").textContent=HEROES[A.card.h][0]+", "+FIN[A.card.f].k.toLowerCase()+(A.bid?" · ставка "+fmtC(A.bid):" · старт "+fmtC(A.min))}}
  if(!A){box.hidden=true;return}box.hidden=false;
  $("auc-t").textContent=A.phase==="on"?"⏳ "+tleft(aucLeft()):A.phase==="soon"?"старт через "+tleft(aucLeft()):"завершён";
  const B=$("auc-body"),k=A.id+"|"+A.phase+"|"+A.bid+"|"+A.top;if(B.dataset.k===k)return;B.dataset.k=k;
  B.innerHTML='<div class="aucg"><div class="aucc">'+miniSlot(A.card)+'</div><div class="auci"><b></b><small></small><div class="aucbid"></div><div class="auclead"></div><div class="aucbt"></div></div></div><p class="aucn">Каждый день с 8:00 до 20:00 · ставка в последние 30 секунд продлевает торги · перебили — деньги возвращаются · деньги победителя сгорают</p>';
  B.querySelector("b").textContent=HEROES[A.card.h][0];B.querySelector("small").textContent=FIN[A.card.f].k+(A.card.f===4?" · единственная в мире":"")+" · оценка "+fmtC(A.card.v);
  B.querySelector(".aucbid").innerHTML=A.bid?'Ставка: <b class="num">'+fmtC(A.bid)+'</b>':'Стартовая ставка: <b class="num">'+fmtC(A.min)+'</b>';
  B.querySelector(".auclead").textContent=A.phase==="done"?(A.top_name?"🏆 Победил "+A.top_name+" за "+fmtC(A.bid):"Никто не сделал ставку"):A.top_name?(A.mine?"👑 Ты лидируешь!":"Лидер: "+A.top_name)+" · ставок "+A.n:"Ставок пока нет";
  const bt=B.querySelector(".aucbt");
  if(A.phase==="on"&&!A.mine){[[1,""],[1.2,"+20%"]].forEach(([m,l])=>{const amt=Math.ceil(A.next*m),b=document.createElement("button");b.type="button";b.className=m===1?"craftbtn":"ghost";b.textContent=(l?l+" · ":"Ставка ")+fmtC(amt);
      b.onclick=async()=>{if(S.cash<amt){toast("Не хватает "+fmt(amt-S.cash));return}b.disabled=true;const r=await act("auc_bid",{amt});b.disabled=false;if(r){auc=r;aucAt=NOW();sfx.coin();hapN("success");renderAll()}else loadAuc(true);drawAuc()};bt.appendChild(b)})}}
setInterval(()=>{if(!ONLINE||!S)return;if(auc&&auc.phase!=="done"&&aucLeft()<=0)loadAuc(true);else if(auc)drawAuc()
  if(auc&&auc.phase==="on"&&NOW()-aucAt>4000&&(!$("sec-shop").hidden||!$("sec-spin").hidden))loadAuc(true)},1000);
setTimeout(()=>{try{loadAuc(true)}catch(e){}},3000);
$("auc-go").onclick=()=>{setTab("shop");shView="buy";renderShop();setTimeout(()=>$("auc-box").scrollIntoView({behavior:"smooth",block:"center"}),300)};
/* ---------- титулы ---------- */
function openTitles(){const m=$("modal"),sh=$("msheet");sh.innerHTML="";m.hidden=false;const own=S.titles||[];
  sh.innerHTML='<div class="box nickbox"><h3>🎖 Титулы</h3><p>Покупаются за деньги игры один раз и навсегда. Титул виден рядом с ником в топах, чате и рейтинге.</p><div class="ttll"></div><button type="button" class="ghost" id="ttl-x">Закрыть</button></div>';
  const L=sh.querySelector(".ttll");for(const k in TITLES){const T=TITLES[k],has=own.includes(k),d=document.createElement("div");d.className="ttli"+(S.title===k?" on":"");
    d.innerHTML='<span class="ttlb">'+T.ic+" "+T.n+'</span><b class="num">'+fmtC(T.price)+'</b>';const b=document.createElement("button");b.type="button";b.className=has?"ghost":"craftbtn";
    b.textContent=has?(S.title===k?"Снять":"Надеть"):"Купить";b.onclick=async()=>{if(!has&&S.cash<T.price){toast("Не хватает "+fmt(T.price-S.cash));return}b.disabled=true;
      const r=await act(has?"title_set":"title_buy",{k:has&&S.title===k?"":k});b.disabled=false;if(!r)return;sfx.coin();Object.keys(tpCache).forEach(x=>delete tpCache[x]);renderAll();openTitles();if(!has)toast("Теперь ты «"+T.n+"»!")};d.appendChild(b);L.appendChild(d)}
  $("ttl-x").onclick=closeModal}
$("ttl-go").onclick=openTitles;
function renderShop(){document.querySelectorAll("#sh-seg button").forEach(b=>b.setAttribute("aria-pressed",b.dataset.v===shView));
  ["buy","sell","lavka"].forEach(v=>$("sh-"+v).style.display=v===shView?"flex":"none");
  if(shView==="buy"){loadMarket();loadTrader();loadAuc()}if(shView==="sell")renderSell();if(shView==="lavka")renderLavka()}

/* ---------- мировой топ ----------
   С сервером это настоящие игроки. Без сервера показываем пример с ботами. */
let tpView="worth";const tpCache={};let tpLoading={};
const TP={worth:{t:"Самые богатые коллекции",u:v=>fmt(v)},cards:{t:"Самые дорогие карточки в мире",u:v=>fmt(v)},album:{t:"Больше всего разных воинов",u:v=>v+" из "+NHEROES},wins:{t:"Больше всего побед в боях",u:v=>fmtN(v)+" побед"}};
Object.assign(LOCAL,{nick(p){const n=checkNick(p.nick);if(n===S.nick)throw new GameError("Это уже твой ник");
  if(SELLERS.some(x=>x.toLowerCase()===n.toLowerCase()))throw new GameError("Ник «"+n+"» уже занят. Придумай другой");
  const cost=S.nick?NICK_COST:0;if(S.cash<cost)throw new GameError("Смена ника стоит "+cost+" 🪙, не хватает монет");S.cash-=cost;S.nick=n;return {nick:n,cost}},
 top(p){const k=p.kind,R=rng(snHash(todayL()+k)),names=SELLERS.slice().sort(()=>R()-.5);
  const fake=(h,f)=>{const c=phantom(h,f);c.sn=String(Math.floor(R()*1e6)).padStart(6,"0");c.no=1+Math.floor(R()*Math.min(FIN[f].run,999));c.stars=f>=2&&R()<.5?1+Math.floor(R()*4):0;c.id="b"+Math.floor(R()*1e9);return c};
  const bestH=()=>{const hs=HEROES.map((H,i)=>i).filter(i=>i<NBASE&&HEROES[i][2]>=2);return hs[Math.floor(R()*hs.length)]};
  if(k==="feed")return {items:names.slice(0,8).map((n,i)=>({name:n,card:fake(bestH(),R()<.25?3:R()<.5?2:1),t:NOW()-(i+R())*25*60e3}))};
  if(k==="cards"){const items=names.map(n=>{const c=fake(bestH(),R()<.15?4:R()<.4?3:2);c.v=Math.round(c.v*(1+R()*3));return {name:n,card:c,score:c.v}});
    S.cards.forEach(c=>items.push({name:myName()+" (ты)",card:c,score:c.v,me:1}));items.sort((a,b)=>b.score-a.score);return {items:items.slice(0,30)}}
  const mine=k==="worth"?S.cards.reduce((a,c)=>a+c.v,0):k==="album"?new Set(S.cards.map(c=>c.h)).size:(S.totalWins||0);
  const base=k==="worth"?[184200,92300,51200,23800,12400,6100,3050,1420,610,280]:k==="album"?[32,31,29,27,24,21,18,14,11,7]:[1840,960,512,301,188,97,52,30,12,5];
  const items=names.map((n,i)=>({name:n,score:base[i],card:fake(bestH(),R()<.3?3:2)}));
  if(mine>0)items.push({name:myName()+" (ты)",score:Math.round(mine*100)/100,card:[...S.cards].sort((a,b)=>b.v-a.v)[0]||null,me:1});
  items.sort((a,b)=>b.score-a.score);const rank=mine>0?items.findIndex(x=>x.me)+1:null;return {items,me:{rank,score:mine}}}});
/* ---------- ник ---------- */
function openNick(first){const m=$("modal"),sh=$("msheet");sh.innerHTML="";m.hidden=false;
  const cost=S.nick?NICK_COST:0;
  sh.innerHTML=`<div class="box nickbox"><h3></h3><p></p><input type="text" id="nk-in" maxlength="16" autocomplete="off" spellcheck="false" placeholder="Например, Царь_Горы"><small id="nk-err" class="nkerr"></small><button type="button" class="craftbtn" id="nk-go"></button><button type="button" class="ghost" id="nk-later"></button></div>`;
  sh.querySelector("h3").textContent=S.nick?"Сменить ник":"Придумай себе ник";
  sh.querySelector("p").textContent=(S.nick?"Сейчас: "+S.nick+". ":"")+"Ник видят все: в топе мира, на рынке, в витрине и в ленте выпадений. Он один такой в игре. От 3 до 16 символов: буквы, цифры, _ . -";
  const inp=$("nk-in"),go=$("nk-go"),err=$("nk-err");inp.value=S.nick||"";
  go.textContent=cost?"Сменить за "+fmt(cost):"Готово";$("nk-later").textContent=first?"Позже":"Отмена";
  if(first&&ONLINE){$("nk-later").hidden=true;sh.querySelector("h3").textContent="Придумай себе ник, чтобы играть"}   // без ника в игру не пускаем
  $("nk-later").onclick=()=>{if(first)try{localStorage.setItem("we-nick-ask",todayL())}catch(e){}closeModal()};
  inp.oninput=()=>{try{checkNick(inp.value);err.textContent=""}catch(e){err.textContent=inp.value.length>=3?e.message:""}};
  const send=async()=>{try{checkNick(inp.value)}catch(e){err.textContent=e.message;return}go.disabled=true;
    const r=await act("nick",{nick:inp.value});go.disabled=false;if(!r)return;
    Object.keys(tpCache).forEach(k=>delete tpCache[k]);closeModal();sfx.coin();hapN("success");renderAll();toast("Теперь ты «"+r.nick+"»")};
  go.onclick=send;inp.onkeydown=e=>{if(e.key==="Enter")send()};setTimeout(()=>inp.focus(),50)}
$("nick-go").onclick=()=>openNick(false);
const nickReady=()=>S&&((S.cards||[]).length>=3||(S.day&&S.day.opened>=3)||(S.best||0)>0&&(S.cards||[]).length>=1&&(S.day&&S.day.opened>=3));
function askNick(){if(!S||S.nick||!nickReady())return;if(ONLINE){if($("modal").hidden&&onbStep<0)openNick(true);return}let last=null;try{last=localStorage.getItem("we-nick-ask")}catch(e){}if(last===todayL())return;openNick(true)}
/* ник обязателен: если игрок без ника и ничего не открыто — снова просим (не чаще раза в 3 секунды) */
setInterval(()=>{try{if(ONLINE&&S&&!S.nick&&nickReady()&&$("modal").hidden&&onbStep<0&&!document.querySelector(".onb-hl,.terms,.wrev"))askNick()}catch(e){}},3000);

async function loadTop(kind,force){const c=tpCache[kind];if(!force&&c&&NOW()-c.at<30000)return c.r;if(tpLoading[kind])return null;tpLoading[kind]=1;
  const r=await act("top",{kind});tpLoading[kind]=0;if(r)tpCache[kind]={at:NOW(),r};return r}
function ago(t){const m=Math.max(1,Math.round((NOW()-t)/60000));return m<60?m+" мин назад":m<1440?Math.round(m/60)+" ч назад":Math.round(m/1440)+" дн назад"}
function topRow(it,i,kind){const c=it.card,d=document.createElement("button");d.type="button";d.className="trow"+(it.me||(ONLINE&&it.uid===S.uid)?" me":"")+(i<3?" p"+(i+1):"");
  d.innerHTML=`<span class="rk">${i<3?["🥇","🥈","🥉"][i]:i+1}</span><span class="e"></span><span class="t"><b></b><small></small></span><span class="sc num"></span>`;
  fxName(d.querySelector("b"),champMark(it.uid)+(it.pi?"🏅 ":""),it.name,it.uid);if(it.vip||(it.me&&isVip())){d.classList.add("vipr");d.querySelector("b").insertAdjacentHTML("afterbegin",'<span class="vipb">VIP</span> ')}d.querySelector(".sc").textContent=kind==="worth"||kind==="cards"?fmtC(it.score):TP[kind].u(it.score);
  if(c){const e=d.querySelector(".e");e.style.setProperty("--hc",HT[HEROES[c.h][2]].c);e.innerHTML=miniSlot(c);
    d.querySelector("small").textContent=(kind==="cards"?"":"Лучшая: ")+HEROES[c.h][0]+((c.stars||0)?" ★"+c.stars:"")+", "+FIN[c.f].k.toLowerCase()}
  d.onclick=()=>{if(kind!=="cards"&&ONLINE&&it.uid&&it.uid!==S.uid){openParam("u_"+it.uid);return}if(c)openCardView(c,{owner:it.name,mine:ONLINE?it.uid===S.uid:!!it.me})};return d}
/* ---------- статистика для администратора (видит только он) ---------- */
let stAt=0,stData=null;
const pct=(a,b)=>b?Math.round(a/b*100)+"%":"—";
async function loadStats(force){if(!S.admin||!ONLINE)return;if(!force&&stData&&NOW()-stAt<60000){drawStats();return}
  const r=await act("stats");if(!r)return;stData=r;stAt=NOW();drawStats()}
function drawStats(){drawStats0();const R=stData,b=$("st-body");if(!R||!b)return;
  const L=R.srcs||[];const box=document.createElement("div");box.className="srcbox";
  const pc=(a,b)=>b?'<u>'+Math.round(a/b*100)+'%</u>':'';
  box.innerHTML="<h4>🔗 Переходы по рекламным ссылкам — воронка</h4>"+(L.length?"<div class=\"srct f\"><b>метка</b><b>зашли</b><b>новые</b><b>1-я карта</b><b>ник</b><b>3+ воина</b><b>2-й день</b></div>"+L.map(r=>{const f=r.fresh||0;return `<div class="srct f"><span></span><i>${r.visits||0}</i><i>${f}</i><i>${r.c1||0}${pc(r.c1||0,f)}</i><i>${r.nk||0}${pc(r.nk||0,f)}</i><i>${r.act||0}${pc(r.act||0,f)}</i><i>${r.back||0}${pc(r.back||0,f)}</i></div>`}).join(""):"<small>Пока никто не заходил. Ссылка: t.me/VoinyEpohBot?startapp=s_метка</small>")+"<small>«зашли» — открыли игру по ссылке; «новые» — впервые в игре; дальше — сколько новых дошли до шага (% от новых): открыли 1-ю карточку → ввели ник → собрали 3+ разных воинов → вернулись на 2-й день</small>";
  L.forEach((r,i)=>{box.querySelectorAll(".srct span")[i].textContent=r.code});b.append(box)}
function drawStats0(){const R=stData,b=$("st-body");if(!R)return;
  const tile=(v,l,sub)=>`<div class="stt"><b class="num">${v}</b><span>${l}</span>${sub?`<small>${sub}</small>`:""}</div>`;
  const max=Math.max(1,...R.days.map(d=>Math.max(d.n,d.a))),W=300,H=110,bw=W/R.days.length;
  const bars=R.days.map((d,i)=>{const x=i*bw,ha=d.a/max*(H-20),hn=d.n/max*(H-20);
    return `<rect x="${x+2}" y="${H-14-ha}" width="${bw/2-2}" height="${ha}" rx="2" fill="#0a84ff"><title>${d.d}: активных ${d.a}</title></rect><rect x="${x+bw/2}" y="${H-14-hn}" width="${bw/2-2}" height="${hn}" rx="2" fill="#ffb800"><title>${d.d}: новых ${d.n}</title></rect>`+(i%2===1||i===R.days.length-1?`<text x="${x+bw/2}" y="${H-2}" text-anchor="middle" font-size="9" fill="#5a5f80">${+d.d.slice(8)}</text>`:"")}).join("");
  b.innerHTML=`<div class="stgrid">
    ${tile(fmtN(R.players),"игроков всего",R.withNick+" с ником")}
    ${tile(fmtN(R.newToday),"новых сегодня","вчера "+R.newYesterday+", за 7 дней "+R.newWeek)}
    ${tile(fmtN(R.activeToday),"активных сегодня","за 7 дней "+R.activeWeek)}
    ${tile(pct(R.d1,R.cohort),"вернулись на 2-й день",R.cohort?R.d1+" из "+R.cohort+" за прошлую неделю":"пока мало данных")}
    ${tile(pct(R.fromRef,R.players),"пришли по приглашению",R.fromRef+" игроков, сегодня "+R.newRefToday)}
    ${tile(fmtN(R.today.open),"прокруток сегодня",fmtN(R.cardsInGame)+" карточек в игре")}
  </div>
  <div class="stchart"><svg viewBox="0 0 300 110" aria-label="Новые и активные игроки за 14 дней">${bars}</svg>
    <div class="stleg"><span><i style="background:#0a84ff"></i>активные</span><span><i style="background:#ffb800"></i>новые</span><span style="color:#5a5f80">14 дней</span></div></div>
  <div class="stlist"><b>Сегодня</b><span>Крафтов ${R.today.craft} · боёв ${R.today.duel} · ударов по боссу ${R.today.boss} · закалок ${R.today.forge} · историй ${R.today.story} · продаж на рынке ${R.today.sales} на ${fmt(R.today.salesV)}</span></div>
  <div class="stlist"><b>Больше всех пригласили</b>${R.inviters.length?R.inviters.map((x,i)=>`<span>${i+1}. <em></em> — ${x.refs}</span>`).join(""):"<span>Пока никого</span>"}</div>
  <p class="stnote">Дни по минскому времени. «Вернулись на 2-й день» считается по игрокам, которые пришли с 8 по 1 день назад.</p>`;
  b.querySelectorAll(".stlist em").forEach((e,i)=>e.textContent=R.inviters[i].name)}
$("st-reload").onclick=()=>loadStats(true);
function renderAdminPromo(){const b=$("admin-promo");b.hidden=!(S.admin&&ONLINE);if(b.hidden)return;const P=S.promo;
  $("ap-t").textContent=P&&P.end>NOW()?"Акция идёт: «"+P.need+" друга → VIP», осталось "+tleft(P.end-NOW())+".":"Акция не запущена.";
  $("ap-go").textContent=P&&P.end>NOW()?"Остановить акцию":"Запустить акцию «друзья → VIP на 7 дней»"}
$("ap-go").onclick=async()=>{const P=S.promo,on=!(P&&P.end>NOW()),b=$("ap-go");if(b.disabled)return;b.disabled=true;b.textContent=on?"Запускаю…":"Останавливаю…";const r=await act("promo_set",on?{hours:+$("ap-hours").value||3,need:+$("ap-need").value||2}:{hours:0});b.disabled=false;renderAdminPromo();if(r){renderPromo();toast(on?"Акция запущена":"Акция остановлена")}};
$("bc-go").onclick=async()=>{const text=$("bc-text").value.trim();if(!text){toast("Напиши текст рассылки");return}const b=$("bc-go");b.disabled=true;let after=0,sent=0,total=0,done=false,guard=0;
  while(!done&&guard++<200){$("bc-res").textContent="Отправляю… "+sent;const r=await act("broadcast",{text,after,photo:($("bc-photo").value||"").trim()});if(!r)break;sent+=r.sent;total=r.total;after=r.last;done=r.done}
  b.disabled=false;$("bc-res").textContent=done?"Готово: доставлено "+sent+" из "+total+" (остальные заблокировали бота)":"Рассылка прервалась на "+sent+", нажми ещё раз";if(done)$("bc-text").value=""};
function renderAdmin(){renderAdminPromo();const sb=$("admin-stats");sb.hidden=!(S.admin&&ONLINE);if(S.admin&&ONLINE)loadStats();
  const box=$("admin-box");box.hidden=!S.admin;if(!S.admin)return;const on=(S.luckUntil||0)>NOW();
  $("luck-t").textContent=on?"Включён ещё "+tleft(S.luckUntil-NOW())+". Выпадают легендарные и мифические воины, дорогие отделки и красивые номера. Видишь эту панель только ты.":"Выключен. На 3 часа делает прокрутки на твоём аккаунте очень удачными. Проданные карточки потом вернутся в общий пул.";
  $("luck-go").textContent=on?"Выключить":"Включить на 3 часа";$("luck-go").style.background=on?"var(--red)":""}
$("luck-go").onclick=async()=>{const on=!((S.luckUntil||0)>NOW());const r=await act("luck_set",{on});if(r){renderAdmin();toast(on?"Режим удачи включён на 3 часа":"Режим удачи выключен")}};
/* герои дня */
let dtAt=0,dtData=null;
async function loadDtop(force){const box=$("dtop-body");if(!box)return;if(!ONLINE){$("dtop-box").hidden=true;return}
  if(force||!dtData||NOW()-dtAt>15000){const r=await act("dtop");if(r){dtData=r;dtAt=NOW()}}
  const D=dtData;if(!D)return;$("dtop-left").textContent="⏳ "+tleft(Math.max(0,D.left-(NOW()-dtAt)));box.innerHTML="";
  for(const C of D.cats){const w=document.createElement("div");w.className="dtc";w.innerHTML='<div class="dth"><b></b><small></small></div><div class="dtl"></div>';
    w.querySelector("b").textContent=C.ic+" "+C.n;w.querySelector("small").textContent="у тебя: "+fmtN(C.me);const L=w.querySelector(".dtl");
    if(!C.top.length)L.innerHTML='<div class="cp-empty">Пока никого — первое место свободно!</div>';
    C.top.forEach((r,i)=>{const d=document.createElement("div");d.className="cpt"+(r.uid===S.uid?" me":"");d.innerHTML="<i></i><span></span><b></b>";d.children[0].textContent=i<3?["🥇","🥈","🥉"][i]:i+1;fxName(d.children[1],"",r.name,r.uid);d.children[2].textContent=fmtN(r.n)+(i<3?" · +"+D.prize[i]+"🎴":"");L.append(d)});
    box.append(w)}}
async function renderTop(force){loadDtop(force);renderAdmin();$("my-nick").textContent=S.nick||"не выбран";$("nick-go").textContent=S.nick?"Сменить":"Выбрать";document.querySelectorAll("#top-seg button").forEach(b=>b.setAttribute("aria-pressed",b.dataset.v===tpView));
  $("top-h").textContent=TP[tpView].t;
  const box=$("top-list");if(!tpCache[tpView])box.innerHTML='<p style="margin:0;color:#5a5f80">Загружаю…</p>';
  const kind=tpView,r=await loadTop(kind,force);if(!r||kind!==tpView)return;
  box.innerHTML="";r.items.forEach((it,i)=>box.appendChild(topRow(it,i,kind)));
  if(!r.items.length)box.innerHTML='<p style="margin:0;color:#5a5f80">Пока пусто. Стань первым!</p>';
  const me=r.me;$("top-rank").textContent=kind==="cards"?"":me&&me.rank?"#"+fmtN(me.rank):"—";
  $("top-t").textContent=kind==="cards"?"Нажми на карточку, чтобы рассмотреть. Закаляй свои, чтобы попасть сюда.":me&&me.rank?(me.rank===1?"Ты на первом месте в мире! Держи позицию.":"Твоё место в мире. До следующего места: "+(r.items[me.rank-2]?TP[kind].u(Math.max(0,r.items[me.rank-2].score-me.score)):"чуть-чуть")):"Открой карточки, чтобы попасть в рейтинг.";
  const fd=await loadTop("feed");if(!fd)return;const fb=$("feed");fb.innerHTML="";
  fd.items.slice(0,8).forEach(it=>{const c=it.card,d=document.createElement("button");d.type="button";d.className="fitem";d.style.setProperty("--hc",HT[HEROES[c.h][2]].c);
    d.innerHTML=`<span class="e"></span><span><b></b><small></small></span>`;const e=d.querySelector(".e");e.innerHTML=miniSlot(c);
    d.querySelector("b").textContent=it.name+" "+({craft:"скрафтил",merge:"слил",chest:"открыл в сундуке",build:"собрал",trader:"купил у торговца",auction:"выиграл на аукционе"}[it.how]||"выбил");d.querySelector("small").textContent=HEROES[c.h][0]+", "+FIN[c.f].k.toLowerCase()+(classify(c.sn)?", № "+fmtSn(c.sn):"")+(it.t?" · "+ago(it.t):"");
    d.onclick=()=>openCardView(c,{owner:it.name,mine:ONLINE&&it.uid===S.uid});fb.appendChild(d)});
  if(!fd.items.length)fb.innerHTML='<p style="margin:0;color:#5a5f80">Пока никто не выбил ничего редкого.</p>'}
document.querySelectorAll("#top-seg button").forEach(b=>b.onclick=()=>{tpView=b.dataset.v;renderTop()});

/* ---------- вкладки ---------- */
const SUBS={cards:[["col","🗂 Мои"],["album","📖 Альбом"],["craft","⚒ Крафт"]],fight:[["duel","⚔️ Бой"],["camp","🎯 Лагерь"]],prof:[["prof","👤 Профиль"],["top","🏆 Топ"]]};
const GRP={col:"cards",album:"cards",craft:"cards",duel:"fight",camp:"fight",prof:"prof",top:"prof"},lastSub={};
function drawSub(t){document.querySelectorAll(".subnav").forEach(e=>e.remove());const g=GRP[t];if(!g)return;const d=document.createElement("div");d.className="subnav";
  d.innerHTML=SUBS[g].map(([k,n])=>'<button type="button" data-sub="'+k+'" aria-pressed="'+(k===t)+'">'+n+'</button>').join("");$("sec-"+t).prepend(d);
  d.onclick=e=>{const b=e.target.closest("[data-sub]");if(!b||b.dataset.sub===t)return;goSub(b.dataset.sub)}}
function goSub(k){if(k==="camp")openCamp();else if(k==="prof")openShelf();else setTab(k)}
function setTab(t){if(t!=="col"&&colPick){colPick=false;colSel.clear();colBar()}if(t!=="camp"&&$("sec-camp")&&!$("sec-camp").hidden)campFlush();["spin","duel","album","craft","shop","col","top","camp","gold","cas","prof"].forEach(k=>{$("sec-"+k).hidden=k!==t});
  const grp=GRP[t]||t;["spin","cards","fight","cas","gold","shop","prof"].forEach(n=>{const b=$("tab-"+n);if(b)b.setAttribute("aria-selected",n===grp)});if(GRP[t])lastSub[grp]=t;drawSub(t);renderAll();scrollTo(0,0)}
$("tab-spin").onclick=()=>setTab("spin");$("tab-gold").onclick=()=>openGold("gifts");$("fchest").onclick=()=>openGold("chest");$("tab-cards").onclick=()=>setTab(lastSub.cards||"col");$("tab-fight").onclick=()=>goSub(lastSub.fight||"duel");$("tab-cas").onclick=()=>{if(typeof openCas==="function"&&ONLINE)openCas();else setTab("cas")};$("tab-shop").onclick=()=>setTab("shop");$("tab-prof").onclick=()=>goSub(lastSub.prof||"prof");
let lastRu=-1;function updCash(){if(!S)return;const e=$("cash");e.textContent=fmtC(S.cash).replace(/ 🪙$/,"");e.title=fmt(S.cash);try{const V=campView(),r=$("cash-r");r.textContent=fmtN(V.runes);if(lastRu>=0&&V.runes>lastRu){r.classList.remove("cash-pop");void r.offsetWidth;r.classList.add("cash-pop")}lastRu=V.runes;$("camp-dot").hidden=!(V.en>=V.mx*.99||V.sq>=campSqRate(V.C)*SQ_HOURS*.99&&V.C.lv.sq)}catch(x){}}
$("cash-rw").onclick=()=>openCamp();$("free-camp").onclick=()=>openCamp();
function renderAll(){if(!S)return;updCash();{const on=!ONLINE||!!S.shopOn;$("gold-go").hidden=!on;$("gold-hdr").hidden=!on;$("tab-gold").hidden=!on;$("fchest").hidden=!on;document.querySelector("nav.tabs").classList.toggle("g9",on);
  $("fchest-t").textContent=S.newbie?"СУНДУКИ":"−50%"}if($("sec-camp")&&!$("sec-camp").hidden)renderCamp();if(!$("sec-album").hidden)renderAlbum();if(!$("sec-col").hidden)renderCol();if(!$("sec-craft").hidden&&!crBusy)renderCraft();if(!$("sec-duel").hidden)renderBattle();if(!$("sec-gold").hidden)renderGold();if(!$("sec-shop").hidden&&!(document.activeElement&&document.activeElement.tagName==="INPUT"))renderShop();if(!$("sec-album").hidden){renderAch();renderShow();renderFriends()}if(!$("sec-col").hidden)renderMerge();if(!$("sec-top").hidden)renderTop();renderTasks();renderFree();renderStreak();renderBonus();renderStory();renderPioneer();pioneerNews();renderFounder();founderNews();renderPm();renderWheel();if(!busy)setTimeout(forgeHint,1500);$("topup").hidden=ONLINE&&!S.test&&!S.admin}

/* ---------- СОКРОВИЩНИЦА: сундуки, составные воины и понт за ⭐ Telegram Stars ---------- */
let goldTab="gifts",goldData=null,goldBusy=false;
const CHEST_COL={newbie:["#7ee89a","#0d5c2a","#34c759"],small:["#7cc8ff","#0b3c8c","#0a84ff"],royal:["#ffd27a","#8a3a08","#ff9f0a"],warrior:["#ff8a8a","#7a0f12","#ff3b30"],legend:["#e0a8ff","#4a1478","#bf5af2"],mythic:["#fff1a8","#b8580b","#ffd60a"]};
let chestN=0;
function chestSVG(k,s){const [c1,c2,gl]=CHEST_COL[k],id="ch"+(++chestN);return `<svg viewBox="0 0 120 100" class="chsvg" style="width:${s}px;height:${s*100/120}px;filter:drop-shadow(0 0 14px ${gl})" aria-hidden="true"><defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${c1}"/><stop offset="1" stop-color="${c2}"/></linearGradient></defs>
  <ellipse cx="60" cy="94" rx="46" ry="5" fill="#000" opacity=".4"/><path d="M14 40 Q60 0 106 40Z" fill="#fff6c8" opacity=".9" style="filter:blur(6px)"/>
  <rect x="14" y="44" width="92" height="46" rx="6" fill="url(#${id})" stroke="#07040f" stroke-width="4"/>
  <path d="M10 44 Q60 4 110 44 L106 50 Q60 14 14 50Z" fill="url(#${id})" stroke="#07040f" stroke-width="4" transform="rotate(-14 14 47) translate(0 -6)"/>
  <rect x="14" y="58" width="92" height="8" fill="#ffd23f" stroke="#07040f" stroke-width="3"/><rect x="52" y="54" width="16" height="22" rx="3" fill="#ffd23f" stroke="#07040f" stroke-width="3"/><circle cx="60" cy="64" r="3" fill="#07040f"/>
  <path d="M26 44 V90 M94 44 V90" stroke="#ffd23f" stroke-width="4"/>
  <g fill="#fff6a0"><circle cx="40" cy="30" r="3"/><circle cx="78" cy="22" r="2.5"/><circle cx="60" cy="14" r="3.5"/><path d="M60 26 l3 7 7 3 -7 3 -3 7 -3 -7 -7 -3 7 -3z"/></g></svg>`}
$("fchest-svg").innerHTML=chestSVG("royal",72);
function openGold(tab){if(tab)goldTab=tab;setTab("gold");loadGold()}
async function loadGold(){const r=await act("shop");if(r){goldData=r;renderGold()}}
/* имя игрока с переливающимся эффектом и короной «Король Эпох» */
function fxName(el,prefix,name,uid){el.textContent=prefix||"";const tk=S&&S.ttl&&uid!=null&&S.ttl[uid];if(tk&&TITLES[tk])el.insertAdjacentHTML("beforeend",'<span class="ttlb">'+TITLES[tk].ic+" "+TITLES[tk].n+'</span> ');const s=document.createElement("span");s.textContent=name;const fx=S&&S.nfx&&uid!=null&&S.nfx[uid];if(fx)s.className="nfx nfx-"+fx;el.appendChild(s);
  if(S&&S.king&&uid!=null&&S.king==uid)el.insertAdjacentHTML("beforeend",' <span class="kingb">👑 Король Эпох</span>');return el}
function compHave(h){const L=S.cards.filter(c=>c.h===h&&c.part===1),R=S.cards.filter(c=>c.h===h&&c.part===2),F=S.cards.filter(c=>c.h===h&&!c.part);
  const fr=x=>x.filter(c=>!away(c));const ok=fr(L).some(c=>c.f===0)&&fr(R).some(c=>c.f===0)||fr(L).some(c=>c.f===4)&&fr(R).some(c=>c.f===4);return {L,R,F,ok}}
const demoComp=(h,o)=>Object.assign({id:"g"+h+"_"+(o&&o.part||0),h,f:0,no:17,sn:"482913",hue:HEROES[h][4].hue,v:0,stats:HEROES[h][4].p.map(k=>440+k*18),xp:0,wins:0,stars:0,part:0},o||{});
const escH=t=>String(t).replace(/[&<>"]/g,ch=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[ch]));
const demoOne=(h,f)=>({id:"o"+h,h,f:f==null?4:f,no:1,sn:HEROES[h][4].sn||"318274",hue:HEROES[h][4].hue,v:0,stats:HEROES[h][4].p.map(k=>440+k*18),xp:0,wins:0,stars:0,part:0});
/* прокрутки кончились: самый горячий момент предложить сундук (не чаще раза в 20 минут) */
let outAt=0;function outOffer(){if(!S||(ONLINE&&!S.shopOn)||NOW()-outAt<20*60e3||!$("modal").hidden)return false;outAt=NOW();const m=$("modal"),sh=$("msheet");sh.innerHTML="";m.hidden=false;
  const k=S.newbie?"small":"newbie",I=SHOP[k];
  sh.innerHTML='<div class="box nickbox outo"><h3>😢 Прокрутки закончились</h3><p>Новые бесплатные через <b>'+leftTxt()+'</b>. Не хочешь ждать?</p><div class="outc">'+chestSVG(k,110)+'<div><b>'+I.n+'</b><ul>'+I.d.map(x=>"<li>"+x+"</li>").join("")+'</ul></div></div><button type="button" class="buy" id="oo-buy">⭐ '+I.stars+'</button><button type="button" class="linkbtn" id="oo-all">Все сундуки 🏪</button><button type="button" class="ghost" id="oo-x">Подожду</button></div>';
  $("oo-buy").onclick=()=>{closeModal();buyItem({item:k})};$("oo-all").onclick=()=>{closeModal();openGold("chest")};$("oo-x").onclick=closeModal;return true}
function renderGold(){const B=$("gold-body");if(!B||!S)return;document.querySelectorAll("#gold-seg button").forEach(b=>b.setAttribute("aria-pressed",b.dataset.g===goldTab));
  const D=goldData||{comp:{},mythLeft:SHOP.mythic.month,donors:[],mine:0};let v="";
  const offer=(k,tag)=>{const I=SHOP[k],[c1,c2,gl]=CHEST_COL[k],left=k==="mythic"?D.mythLeft:null;
    return `<div class="of${left===0?" sold":""}" style="--fr:linear-gradient(145deg,${c1},${gl} 30%,${c2} 60%,${c1} 85%,${c2});--gl:${gl}">${tag?'<span class="tag">'+tag+'</span>':""}<div class="in">${chestSVG(k,96)}<div><h4>${I.n}</h4><ul>${I.d.map(x=>"<li>"+x+"</li>").join("")}</ul>${left!=null?'<div class="mleft">осталось в этом месяце: <b>'+left+' из '+I.month+'</b></div>':""}<button type="button" class="buy" data-buy="${k}"${left===0?" disabled":""}>${left===0?"раскуплено":"⭐ "+I.stars}</button></div></div></div>`};
  if(goldTab==="chest"){
    v+='<div class="ghd">🔥 Легенды 1 из 1</div><p class="gnote">Существуют только как «Ошибка печати» — одна карточка на весь мир. Выпадают из Мифического (2%) и Легендарного (0,5%) сундука, а в обычной прокрутке — шанс 1 на 100 000.</p><div class="oneg">'+ONE.map(h=>{const o=(D.ones||{})[h];return '<div class="onec'+(o?" taken":"")+'">'+miniSlot(demoOne(h))+'<b>'+HEROES[h][0]+'</b><small>'+(o?"у игрока "+escH(o.name):goldData?"ещё в сундуках!":"…")+'</small></div>'}).join("")+'</div>';
    v+='<div class="ghd">⚔️ Богатыри</div><p class="gnote">Мифические воины Руси. В прокрутке почти не выпадают — 0,01% на каждого. Чаще всего их дают Мифический сундук (вместе с Сёгуном и Мерлином) и Легендарный (4%).</p><div class="bogg">'+DON.map(h=>'<div>'+miniSlot(demoOne(h,0))+'</div>').join("")+'</div>';
    v+='<div class="ghd">🧩 Сундуки с половинками</div>';
    if(!S.newbie)v+=offer("newbie","1 раз · −50%");
    v+=offer("small")+offer("royal","ВЫГОДНО ×2");
    v+='<div class="ghd">🃏 Сундуки с карточками</div><p class="gnote">Только обычные 32 воина. Половинки составных воинов здесь не выпадают.</p>';
    v+=offer("warrior")+offer("legend")+offer("mythic","ЛИМИТ");
    v+='<details class="godds"><summary>Шансы и состав — всё открыто</summary><p><b>Половинка:</b> левая 85%, правая 15%. Правых у каждого составного воина всего '+HALF_RUN+' на весь мир — когда закончатся, выпадают только левые. «Ошибка печати» 0,4% — одна левая и одна правая на каждого воина.</p><p><b>Карточки в сундуках</b> выпадают с теми же шансами, что в прокрутке: отделка '+FIN.slice(0,5).map(F=>F.k.toLowerCase()+" "+String(F.w).replace(".",",")+"%").join(", ")+'. Номера и отделки не подкручены.</p><p><b>В обычной прокрутке:</b> половинка — 0,35%, богатырь — 0,01% на каждого, легенда 1 из 1 — 0,001%.</p><p>Лимита покупок на человека нет. Купленное кладётся в коллекцию даже сверх лимита в '+CAP+' карточек.</p></details>'}
  if(goldTab==="comp"){
    v+='<div class="cmphow"><div class="cmpx">'+miniSlot(demoComp(32,{part:1}))+'</div><b>+</b><div class="cmpx">'+miniSlot(demoComp(32,{part:2}))+'</div><b>=</b><div class="cmpx full">'+miniSlot(demoComp(32))+'</div></div><p class="gnote">Собери левую и правую половинку одного воина — и соедини в целую карточку. Левые выпадают часто, правые в 5 раз реже и их всего '+HALF_RUN+' на воина. Лишние половинки продавай на рынке.</p>';
    COMP.forEach(h=>{const H=compHave(h),x=(D.comp||{})[h]||{l:0,r:0,full:0,e:[0,0,0]},left=Math.max(0,HALF_RUN-x.r-x.full);
      v+=`<div class="cmpr"><div class="cmpm">${miniSlot(H.F[0]||demoComp(h))}</div><div class="cmpt"><h4>${HEROES[h][0]}</h4><small>${HEROES[h][3]}</small>
        <div class="cmph"><span class="${H.L.length?"y":""}">◧ левая ×${H.L.length}</span><span class="${H.R.length?"y":""}">◨ правая ×${H.R.length}</span>${H.F.length?'<span class="y">✦ собрано ×'+H.F.length+'</span>':""}</div>
        <div class="cmpl">правых осталось в мире: <b>${goldData?left+" / "+HALF_RUN:"…"}</b>${goldData?' · ошибки: '+(x.e[1]?"◧ ✗":"◧ свободна")+" "+(x.e[2]?"◨ ✗":"◨ свободна"):""}</div>
        <button type="button" class="craftbtn cmpgo" data-asm="${h}"${H.ok?"":" disabled"}>${H.ok?"🧩 Собрать":"Нужна пара половинок"}</button></div></div>`});
    v+='<button type="button" class="linkbtn" data-goto="chest">🧩 Сундуки с половинками →</button>'}
  if(goldTab==="flex"){
    const top=D.donors||[];
    v+='<div class="ghd">👑 Топ донатеров месяца</div><p class="gnote">Первое место получает корону «Король Эпох» рядом с ником — её видят все в топах, чате и лагере. Новый месяц — новая гонка.</p><div class="dtop" id="dtop"></div>'+(D.mine?'<p class="gnote">Ты в этом месяце: <b>⭐ '+fmtN(D.mine)+'</b></p>':"");
    v+='<div class="ghd">✨ Переливающийся ник</div><p class="gnote">Ник с эффектом в топах, чате, лагере и на арене. '+(D.fx&&NFX[D.fx]?"Сейчас у тебя: <b>"+NFX[D.fx]+"</b>"+(D.fxUntil<9e15?" до "+new Date(D.fxUntil).toLocaleDateString("ru"):" навсегда")+".":"")+'</p><div class="fxg">'+
      Object.keys(NFX).map(k=>'<div class="fxc"><div class="fxn"><span class="nfx nfx-'+k+'"></span></div><small>'+NFX[k]+'</small><button type="button" class="buy sm" data-fx="'+k+'">30 дней · ⭐ '+NFX_PRICE.m+'</button><button type="button" class="buy sm alt" data-fx="'+k+'" data-forever="1">навсегда · ⭐ '+NFX_PRICE.f+'</button></div>').join("")+'</div>';
    v+='<div class="ghd">😏 Для очень богатых</div><p class="gnote">Это шутка, никто такое не купит… Но если купишь — сделаем по-настоящему.</p>'+
      '<div class="joke"><div class="jk-h">🃏 Любая карточка в игре</div><p>Выбери <b>любого воина</b> и <b>любую отделку</b> — хоть золотого Сёгуна, хоть Тора 1 из 1, если он ещё свободен. Карточка сразу твоя.</p><button type="button" class="buy" id="any-go">⭐ 4 000</button></div>'+
      '<div class="joke j2"><div class="jk-h">👑 Карточка твоей мечты</div><p>Нарисуем <b>любого героя</b>, какого захочешь, с <b>любым номером</b>. Она будет только у тебя — в единственном экземпляре на весь мир. Дорого? Ну так это ж мечта 😅</p><button type="button" class="buy" data-buy="custom">⭐ 5 000</button></div>';
    v+='<div class="ghd">✍️ Свой номер на карточке</div><p class="gnote">Любой свободный номер из 6 цифр: дата рождения, 000 777, 123 456. Обычный — ⭐ 100, красивый дороже (×15 → ⭐ 1600). На карточке появится лента «Именной номер». Цена карточки не меняется — это чистый понт.</p><button type="button" class="craftbtn" id="num-pick">Выбрать карточку</button>'}
  B.innerHTML=v;
  if(goldTab==="flex"){const T=$("dtop");if(!(D.donors||[]).length)T.innerHTML='<div class="cp-empty">'+(ONLINE?"В этом месяце ещё никого. Стань первым королём!":"Топ работает в игре через бота")+'</div>';
    (D.donors||[]).forEach((r,i)=>{const d=document.createElement("div");d.className="cpt"+(r.uid===S.uid?" me":"");d.innerHTML="<i></i><span></span><b></b>";d.children[0].textContent=i<3?["👑","🥈","🥉"][i]:i+1;fxName(d.children[1],"",r.name,r.uid);d.children[2].textContent="⭐ "+fmtN(r.s);T.append(d)});
    B.querySelectorAll(".fxn span").forEach(e=>e.textContent=myName());$("num-pick").onclick=()=>pickCard("Какой карточке поставить свой номер?",c=>numBuy(c));$("any-go").onclick=anyPick}}
/* «любая карточка»: сначала воин, потом отделка */
function anyPick(){const m=$("modal"),sh=$("msheet");sh.innerHTML="";m.hidden=false;
  const hs=HEROES.map((H,i)=>i).filter(i=>!HEROES[i][4].collab).sort((a,b)=>(HEROES[b][4].one?2:HEROES[b][4].don||HEROES[b][4].comp?1:0)-(HEROES[a][4].one?2:HEROES[a][4].don||HEROES[a][4].comp?1:0)||HEROES[b][2]-HEROES[a][2]);
  sh.innerHTML='<div class="box nickbox"><h3>🃏 Выбери воина</h3><div class="pkg">'+hs.map(h=>'<button type="button" class="pki" data-h="'+h+'">'+miniSlot(demoOne(h,HEROES[h][4].one?4:0))+'</button>').join("")+'</div><button type="button" class="ghost" id="pk-x">Отмена</button></div>';
  $("pk-x").onclick=closeModal;sh.querySelector(".pkg").onclick=e=>{const b=e.target.closest("[data-h]");if(!b)return;const h=+b.dataset.h,W=HEROES[h][4];
    if(W.one)return anyConfirm(h,4);if(W.comp)return anyConfirm(h,0);
    sh.innerHTML='<div class="box nickbox"><h3></h3><div class="sellprev"></div><div class="anyf">'+[0,1,2,3,4].map(f=>'<button type="button" class="ghost" data-f="'+f+'">'+FIN[f].k+(FIN[f].run===Infinity?"":" · тираж "+FIN[f].run)+'</button>').join("")+'</div><button type="button" class="ghost" id="pk-x">Отмена</button></div>';
    sh.querySelector("h3").textContent=HEROES[h][0]+": какая отделка?";sh.querySelector(".sellprev").innerHTML=miniSlot(demoOne(h,3));$("pk-x").onclick=closeModal;
    sh.querySelector(".anyf").onclick=e2=>{const t=e2.target.closest("[data-f]");if(t)anyConfirm(h,+t.dataset.f)}}}
function anyConfirm(h,f){closeModal();buyItem({item:"any",h,f})}
/* что нового: показывается каждому игроку один раз после обновления */
function newsUpd(){if(!S||(ONLINE&&!S.shopOn)||!$("modal").hidden||onbStep>=0||document.querySelector(".onb-hl"))return;try{if(localStorage.getItem("we-news-gold1"))return;localStorage.setItem("we-news-gold1","1")}catch(e){return}
  const m=$("modal"),sh=$("msheet");sh.innerHTML="";m.hidden=false;
  sh.innerHTML='<div class="box nickbox newsb"><h3>🔥 Большое обновление!</h3><div class="nws">'+miniSlot(demoOne(ONE[0]))+miniSlot(demoOne(DON[0],0))+miniSlot(Object.assign(demoOne(COMP[0],0),{no:17}))+'</div><ul>'+
   '<li>🏪 <b>Сокровищница</b> — сундуки с прокрутками, карточками и половинками</li>'+
   '<li>⚔️ <b>Богатыри</b> Илья Муромец, Добрыня и Алёша — новые мифические воины</li>'+
   '<li>🔥 <b>Легенды 1 из 1</b>: Тор, Зевс, Геракл и Три богатыря — по одной на весь мир</li>'+
   '<li>🧩 <b>Составные воины</b>: Дракон, Феникс, Кракен… собери из двух половинок</li>'+
   '<li>✍️ <b>Свой номер</b> на карточке, ✨ <b>переливающийся ник</b> и 👑 <b>Король Эпох</b> месяца</li>'+
   '<li>🎁 Новичкам: <b>10 прокруток + эпик</b> за полцены</li></ul><button type="button" class="craftbtn" id="nw-go">Открыть Сокровищницу</button><button type="button" class="ghost" id="nw-x">Позже</button></div>';
  $("nw-go").onclick=()=>{closeModal();openGold("chest")};$("nw-x").onclick=closeModal}
$("gold-seg").onclick=e=>{const b=e.target.closest("[data-g]");if(!b)return;goldTab=b.dataset.g;renderGold()};
$("gold-body").onclick=async e=>{const t=e.target.closest("button");if(!t||t.disabled)return;
  if(t.dataset.goto){goldTab=t.dataset.goto;renderGold();scrollTo(0,0);return}
  if(t.dataset.buy)return buyItem({item:t.dataset.buy});
  if(t.dataset.fx)return buyItem({item:"fx",fx:t.dataset.fx,forever:t.dataset.forever?1:0});
  if(t.dataset.asm){const r=await act("assemble",{h:+t.dataset.asm});if(!r)return;sfx.coin();hapN("success");renderGold();showGrant({cards:[r.card]},"🧩 Воин собран!");loadGold()}};
$("gold-back").onclick=()=>setTab("spin");$("gold-go").onclick=()=>openGold();$("gold-hdr").onclick=()=>openGold();
/* покупка: счёт Telegram → оплата → игра ждёт, пока сервер выдаст покупку */
async function buyItem(p){if(goldBusy)return;goldBusy=true;
  try{const inv=await act("invoice",p);if(!inv)return;
    if(inv.sim){const r=await act("pay_sim",{pid:inv.pid});if(r)payShow(r);return}
    if(!tg||!tg.openInvoice){toast("Оплата работает в Telegram");return}
    tg.openInvoice(inv.link,async status=>{if(status==="paid"){toast("Оплата прошла! Открываю…");await payWait(inv.pid)}else if(status==="failed")toast("Оплата не прошла. Звёзды не списаны")})}
  finally{goldBusy=false}}
async function payWait(pid){for(let i=0;i<15;i++){const r=await act("pay_status",{pid});if(r&&(r.status==="done"||r.status==="refund")){payShow(r);return}await new Promise(z=>setTimeout(z,1000))}
  toast("Оплата получена, покупка появится через минуту. Мы пришлём сообщение в бот")}
function payShow(r){renderAll();loadGold();if(r.status==="refund"){toast("↩️ "+((r.res&&r.res.err)||"Не получилось")+". Звёзды вернулись");return}
  const R=r.res||{},I=SHOP[r.item];sfx.coin();hapN("success");
  if(I&&I.manual){const m=$("modal"),sh=$("msheet");sh.innerHTML="";m.hidden=false;sh.innerHTML='<div class="box nickbox"><h3>👑 Ого! Ты правда купил!</h3><p>Это была шутка… но мы держим слово. Напиши <b>@voinovadmin</b>: какого героя нарисовать и какой номер поставить. Карточка будет только у тебя.</p><button type="button" class="craftbtn" id="cu-ok">Написать @voinovadmin</button></div>';
    $("cu-ok").onclick=()=>{closeModal();try{tg.openTelegramLink("https://t.me/voinovadmin")}catch(e){open("https://t.me/voinovadmin")}};return}
  if(I)return showGrant(R,I.any?"🎁 Карточка твоя!":"🎁 "+I.n+" открыт!");
  if(r.item==="num"){toast("✍️ Готово! Новый номер "+fmtSn(R.sn));const c=S.cards.find(x=>x.id===R.card);if(c)openCardView(c,{mine:true});return}
  if(r.item==="fx"){toast("✨ Ник «"+NFX[R.fx]+"» включён!");goldTab="flex";renderGold()}}
function showGrant(R,title){const m=$("modal"),sh=$("msheet");sh.innerHTML="";m.hidden=false;const cs=R.cards||[];
  sh.innerHTML='<div class="box nickbox grant"><h3></h3><div class="grl">'+(R.sp?'<span>🎴 +'+R.sp+' прокруток</span>':"")+(R.guar?'<span>💎 гарантированный эпик</span>':"")+'</div><div class="grg">'+cs.map((c,i)=>'<div class="gri" style="--d:'+(i*.12)+'s">'+miniSlot(c)+'<small>'+HEROES[c.h][0]+(c.part?" · "+PART_K[c.part]:"")+'</small></div>').join("")+'</div><button type="button" class="craftbtn" id="gr-ok">Забрать</button></div>';
  sh.querySelector("h3").textContent=title;sh.classList.toggle("wide",cs.length>3);$("gr-ok").onclick=()=>{closeModal();renderAll()};
  if(cs.some(c=>HEROES[c.h][2]>=3||c.f>=3||c.part===2))setTimeout(()=>sfx.fanfare(),300)}
/* выбрать свою карточку из списка */
function pickCard(title,cb){const m=$("modal"),sh=$("msheet");sh.innerHTML="";m.hidden=false;const list=[...S.cards].sort((a,b)=>b.v-a.v).slice(0,60);
  sh.innerHTML='<div class="box nickbox"><h3></h3><div class="pkg">'+list.map(c=>'<button type="button" class="pki" data-id="'+c.id+'">'+miniSlot(c)+'</button>').join("")+'</div><button type="button" class="ghost" id="pk-x">Отмена</button></div>';
  sh.querySelector("h3").textContent=title;$("pk-x").onclick=closeModal;
  sh.querySelector(".pkg").onclick=e=>{const b=e.target.closest("[data-id]");if(!b)return;const c=S.cards.find(x=>String(x.id)===b.dataset.id);closeModal();if(c)cb(c)}}
/* свой номер: ввод 6 цифр, цена сразу видна */
function numBuy(c){const m=$("modal"),sh=$("msheet");sh.innerHTML="";m.hidden=false;
  sh.innerHTML='<div class="box nickbox"><h3>✍️ Свой номер</h3><div class="sellprev"></div><input id="num-in" inputmode="numeric" maxlength="6" placeholder="например 777777" autocomplete="off"><p class="numi" id="num-i"></p><button type="button" class="craftbtn" id="num-go" disabled>Ввести номер</button><button type="button" class="ghost" id="num-x">Отмена</button></div>';
  sh.querySelector(".sellprev").innerHTML=miniSlot(c);const inp=$("num-in"),go=$("num-go");
  const upd=()=>{const v=inp.value.replace(/\D/g,"").slice(0,6);if(inp.value!==v)inp.value=v;const cl=v.length===6?classify(v):null;
    $("num-i").textContent=v.length<6?"Ровно 6 цифр. Обычный номер — ⭐ 100, красивый дороже.":"№ "+fmtSn(v)+(cl?" — «"+cl.k+"» ×"+cl.m:" — обычный")+" · ⭐ "+numPrice(v);
    go.disabled=v.length!==6;go.textContent=v.length===6?"Купить за ⭐ "+numPrice(v):"Ввести номер"};
  inp.oninput=upd;upd();$("num-x").onclick=closeModal;go.onclick=()=>{const sn=inp.value;closeModal();buyItem({item:"num",card:c.id,sn})};setTimeout(()=>inp.focus(),100)}

/* ---------- РЕЙТИНГОВЫЙ БОЙ ---------- */
let rkInfo=null,rkInfoAt=0,rkMatch=null,rkTimer=0,rkShown=0,rkSearchT=0,rkLastCard=null,rkBusy=false;
const lgTxt=i=>LEAGUES[i].ic+" "+LEAGUES[i].n;
const rkTiredC=c=>{const f=((rkInfo||{}).fat||{})[c.id];return !!(f&&f.n>=FAT_N&&NOW()-f.t<FAT_MS)};
const rkPower=c=>[0,1,2,3,4].reduce((a,i)=>a+(c.stats?eff(c,i):0),0);
async function loadRk(force){if(!ONLINE)return null;if(!force&&rkInfo&&NOW()-rkInfoAt<10000)return rkInfo;const r=await act("rk_info");if(r){rkInfo=r;rkInfoAt=NOW()}return rkInfo}
async function renderRk(force){const box=$("rk-box");if(!box)return;if(!ONLINE){box.hidden=true;return}box.hidden=false;
  const I=await loadRk(force);if(!I)return;const lg=I.lg,nx=LEAGUES[lg+1],cur=LEAGUES[lg].at;
  $("rk-season").textContent="⏳ "+(I.seasonLeft>=864e5?Math.floor(I.seasonLeft/864e5)+" дн":tleft(I.seasonLeft));
  $("rk-me").innerHTML='<div class="rkr"><b class="num">'+fmtN(I.rating)+'</b><span class="rklg lg'+lg+'">'+lgTxt(lg)+'</span></div><div class="rkbar"><u style="width:'+(nx?Math.min(100,(I.rating-cur)/(nx.at-cur)*100):100)+'%"></u></div><small>'+(nx?"до "+lgTxt(lg+1)+" ещё "+fmtN(nx.at-I.rating):"высшая лига!")+(I.rank?" · #"+I.rank+" в сезоне":"")+(I.streak>1?" · 🔥 серия "+I.streak:"")+" · боёв сегодня "+I.dayn+"/"+I.dayMax+'</small>';
  const T=$("rk-top");T.innerHTML='<div class="rkth">Топ сезона</div>';if(!I.top.length)T.innerHTML+='<div class="cp-empty">Пока никого — стань первым!</div>';
  I.top.slice(0,10).forEach((r,i)=>{const d=document.createElement("div");d.className="cpt"+(r.uid===S.uid?" me":"");d.innerHTML="<i></i><span></span><b></b>";d.children[0].textContent=i<3?["🥇","🥈","🥉"][i]:i+1;fxName(d.children[1],LEAGUES[r.lg].ic+" ",r.name,r.uid);d.children[2].textContent=fmtN(r.rating);T.append(d)});
  $("rk-rules").innerHTML='<p><b>Как идёт бой.</b> Каждый ход вы с соперником одновременно и вслепую выбираете: ⚔️ Удар, 🛡 Блок или 🌀 Финт. <b>Удар бьёт Финт, Блок бьёт Удар, Финт бьёт Блок.</b> Угадал — наносишь урон. Бой идёт, пока у кого-то не кончится здоровье.</p><p><b>Характеристики:</b> Атака — урон, Броня — защита, Выносливость — здоровье, Скорость — шанс увернуться, Боевой дух — шанс крита. У каждого воина своя способность.</p><p><b>Весовые категории:</b> 🪶 лёгкий (обычные и редкие), ⚔️ средний (эпические), 🔥 тяжёлый (легендарные и мифические). Соперник подбирается из твоей категории. За победу: лёгкий +25, средний +30, тяжёлый +40, серия побед до +15. Поражение −20, но из лиги не вылетишь.</p><p><b>Усталость:</b> после '+FAT_N+' боёв подряд воин −20% к силе, отдых час.</p><p><b>Лиги и награды сезона</b> (в конце месяца):</p>'+LEAGUES.map((L,i)=>{const P=SEASON_PRIZE[i];return '<div class="rkl"><span>'+L.ic+" "+L.n+'</span><em>от '+fmtN(L.at)+'</em><span>'+(P?[P.tier===4?"мифическая":P.tier===3?"легендарная":"",P.guar?"эпик":"",P.sp?P.sp+" прокр.":""].filter(Boolean).join(" + "):"—")+'</span></div>'}).join("");
  if(I.active&&!rkMatch)rkOpen(I.active);else if(I.queued&&!rkMatch&&!$("rkm"))rkSearch(I.queued)}
$("rk-go").onclick=()=>rkPick();
function rkPick(){const m=$("modal"),sh=$("msheet");sh.innerHTML="";m.hidden=false;
  const list=S.cards.filter(c=>!away(c)&&!(FIN[c.f].excl||c.part)).sort((a,b)=>wclass(b.h)-wclass(a.h)||rkPower(b)-rkPower(a));
  sh.innerHTML='<div class="box nickbox"><h3>Выбери воина для рейтингового боя</h3><p class="rkpn">Соперник будет из той же весовой категории</p><div class="pkg rkpk">'+list.map(c=>'<button type="button" class="pki" data-id="'+c.id+'">'+miniSlot(c)+'<span class="rkwc">'+WC_IC[wclass(c.h)]+'</span>'+(rkTiredC(c)?'<span class="rktd">😮‍💨</span>':"")+'<small>'+abil(c.h)[0]+" "+abil(c.h)[1]+'</small></button>').join("")+'</div><button type="button" class="ghost" id="pk-x">Отмена</button></div>';
  $("pk-x").onclick=closeModal;sh.querySelector(".pkg").onclick=async e=>{const b=e.target.closest("[data-id]");if(!b)return;const c=S.cards.find(x=>String(x.id)===b.dataset.id);if(!c)return;closeModal();rkStart(c)}}
async function rkStart(c){if(rkBusy)return;rkBusy=true;try{rkLastCard=c.id;const r=await act("rk_find",{id:c.id});if(!r)return;rkInfo=null;if(r.match)rkOpen(r.match);else rkSearch(r.queued)}finally{rkBusy=false}}
function rkOverlay(){let o=$("rkm");if(!o){o=document.createElement("div");o.id="rkm";o.className="rkm";document.body.appendChild(o)}return o}
function rkClose(){clearInterval(rkTimer);rkTimer=0;rkMatch=null;const o=$("rkm");if(o)o.remove();renderRk(true);renderAll()}
function rkSearch(q){const o=rkOverlay();clearInterval(rkTimer);const since=q&&q.since?q.since:NOW(),wc=q?q.wc:0;
  o.innerHTML='<div class="rks"><div class="rksp">🔎</div><h3>Ищем соперника</h3><div class="rkswc">'+WC_IC[wc]+" "+WCLASS[wc]+'</div><b class="num" id="rks-t">0:00</b><p>Через 20 секунд поищем и в соседней категории, через 30 — бой с тенью настоящего игрока</p><button type="button" class="ghost" id="rks-x">Отмена</button></div>';
  $("rks-x").onclick=async()=>{await act("rk_cancel");rkClose()};
  const tick=async()=>{const el=Math.max(0,NOW()-since);const t=$("rks-t");if(!t){clearInterval(rkTimer);return}t.textContent=Math.floor(el/60000)+":"+String(Math.floor(el/1000)%60).padStart(2,"0");
    if(++rkSearchT%2)return;const r=await act("rk_poll");if(r&&r.match)rkOpen(r.match);else if(r&&!r.queued)rkClose()};
  rkTimer=setInterval(tick,700);tick()}
function rkOpen(id){clearInterval(rkTimer);rkMatch={id,v:null};rkShown=0;const o=rkOverlay();
  o.innerHTML='<div class="rkb"><div class="rkhd"><b id="rkb-turn">Бой</b><div class="rktm"><u id="rkb-tm"></u></div></div>'+
   '<div class="rkf op" id="rkb-op"></div><div class="rkmid" id="rkb-mid"></div><div class="rkf me" id="rkb-me"></div><div class="rkact" id="rkb-act"></div></div>';
  rkPoll();rkTimer=setInterval(rkPoll,900)}
async function rkPoll(){if(!rkMatch)return;const id=rkMatch.id;const r=await act("rk_get",{id});if(!r||!rkMatch||rkMatch.id!==id)return;rkDraw(r)}
function rkFighterHTML(F,mine){const A=abil(F.card.h);return '<div class="rkc">'+miniSlot(F.card)+'</div><div class="rki"><div class="rkn"></div><div class="rkhp"><u style="width:'+Math.max(0,F.hp/F.mx*100)+'%"></u><span class="num">'+fmtN(F.hp)+" / "+fmtN(F.mx)+'</span></div><div class="rkab">'+A[0]+" "+A[1]+'<small>'+A[2]+'</small></div><div class="rkst"></div></div>'}
function rkDraw(v){const first=!rkMatch.v;rkMatch.v=v;
  for(const [k,F] of [["me",v.me],["op",v.op]]){const el=$("rkb-"+k);if(!el)return;if(first||el.dataset.c!==String(F.card.id)){el.innerHTML=rkFighterHTML(F,k==="me");el.dataset.c=F.card.id}
    el.querySelector(".rkn").textContent="";fxName(el.querySelector(".rkn"),"",(k==="me"?"Ты":F.name)+" ",k==="me"?S.uid:F.uid);el.querySelector(".rkn").insertAdjacentHTML("beforeend",'<em>'+WC_IC[F.wc]+(F.under?" +10%":"")+(F.tired?" 😮‍💨":"")+'</em>');
    el.querySelector(".rkhp u").style.width=Math.max(0,F.hp/F.mx*100)+"%";el.querySelector(".rkhp span").textContent=fmtN(F.hp)+" / "+fmtN(F.mx);
    el.querySelector(".rkst").textContent=v.phase==="pick"?(k==="me"?(v.myPick?"✅ выбрал: "+RK_IC[v.myPick]+" "+RK_ACTS[v.myPick]:"⏳ твой ход"):(F.picked?"✅ выбрал (скрыто)":"🤔 выбирает…")):""}
  $("rkb-turn").textContent=v.phase==="done"?"Бой окончен":"Ход "+(v.turn+(v.phase==="pick"?1:0));
  $("rkb-tm").style.width=v.phase==="pick"?Math.min(100,v.left/12000*100)+"%":"0%";
  const L=v.last,mine=v.side||"a",op=mine==="a"?"b":"a";
  if(L&&L.t!==rkShown){rkShown=L.t;const mid=$("rkb-mid"),ma=L[mine],oa=L[op],dm=L["d"+mine],do_=L["d"+op],fm=L["f"+mine]||[],fo=L["f"+op]||[];
    const verdict=ma===oa?(ma==="block"?"Оба в блоке — тишина":"Одинаково — оба бьют вполсилы"):(RK_BEATS[ma]===oa?"Ты угадал!":"Соперник угадал");
    const fxT=f=>f.map(x=>({crit:"💥 крит",dodge:"💨 уворот",shield:"🛡 щит",revive:"🪶 воскрес!",save:"⚖️ выжил",zap:"⚡ молния"}[x])).join(" ");
    mid.innerHTML='<div class="rkrev"><span>'+RK_IC[ma]+" "+RK_ACTS[ma]+'</span><i>vs</i><span>'+RK_IC[oa]+" "+RK_ACTS[oa]+'</span></div><div class="rkver">'+verdict+'</div>'+(fm.length||fo.length?'<div class="rkfx">'+[fxT(fm),fxT(fo)].filter(Boolean).join(" · ")+'</div>':"");
    const hit=(k,d,fx)=>{const el=$("rkb-"+k);if(!el)return;if(d>0){el.classList.remove("hurt");void el.offsetWidth;el.classList.add("hurt");sfx.clash&&sfx.clash()}
      const n=document.createElement("b");n.className="rkdmg"+(fx.includes("crit")?" crit":"");n.textContent=d>0?"−"+fmtN(d):fx.includes("dodge")?"мимо":fx.includes("shield")?"щит":"0";el.appendChild(n);setTimeout(()=>n.remove(),1600)};
    if(dm>0||fm.length)hit("op",dm,fm);if(do_>0||fo.length)hit("me",do_,fo);
    if(fm.includes("crit")||fo.includes("crit")){try{hapN("warning")}catch(e){}}}
  const A=$("rkb-act");
  if(v.phase==="done"){clearInterval(rkTimer);rkTimer=0;const R=v.res||{},win=v.win===mine,draw=v.win==="d";
    if(A.dataset.done!=="1"){A.dataset.done="1";if(win){sfx.fanfare();hapN("success")}else hapN("error");
      A.innerHTML='<div class="rkres '+(win?"w":draw?"d":"l")+'"><h2>'+(win?"ПОБЕДА":draw?"НИЧЬЯ":"ПОРАЖЕНИЕ")+'</h2>'+(v.side?'<div class="rkrd">'+(R.d>0?"+":"")+(R.d||0)+' рейтинга</div><div class="rkrr">'+fmtN(R.r||0)+" · "+lgTxt(R.lg||0)+(R.up?" 🎉 новая лига!":"")+(R.streak>1&&win?" · 🔥 серия "+R.streak:"")+'</div>':"")+
       '<button type="button" class="craftbtn" id="rk-again">⚔️ Ещё бой</button><button type="button" class="ghost" id="rk-x">Закрыть</button></div>';
      $("rk-x").onclick=rkClose;$("rk-again").onclick=()=>{const c=S.cards.find(x=>x.id===rkLastCard&&!away(x));rkClose();if(c)rkStart(c);else rkPick()}}
    return}
  A.dataset.done="";
  if(v.phase==="pick"&&v.side&&!v.myPick){if(A.dataset.m!=="pick"){A.dataset.m="pick";
      A.innerHTML=(v.peek?'<div class="rkpeek">🦊 Хитрость: соперник выбрал '+RK_IC[v.peek]+" "+RK_ACTS[v.peek]+'</div>':"")+'<div class="rkbtns">'+["hit","block","feint"].map(k=>'<button type="button" data-a="'+k+'"><i>'+RK_IC[k]+'</i>'+RK_ACTS[k]+'<small>'+{hit:"бьёт Финт",block:"бьёт Удар",feint:"бьёт Блок"}[k]+'</small></button>').join("")+'</div>';
      A.querySelectorAll("[data-a]").forEach(b=>b.onclick=async()=>{if(A.dataset.m!=="pick")return;A.dataset.m="sent";A.querySelectorAll("button").forEach(x=>x.disabled=true);b.classList.add("on");sfx.tick&&sfx.tick();const r=await act("rk_act",{id:v.id,act:b.dataset.a});if(r)rkDraw(r)})}}
  else{A.dataset.m="";A.innerHTML='<div class="rkwait">'+(v.phase==="pick"?"Ждём соперника… ход откроется одновременно":"Следующий ход через секунду")+'</div>'}}
const TQ=[];let tBusy=false;
function toast(t){TQ.push(t);if(!tBusy)nextToast()}
function nextToast(){const t=TQ.shift();const e=$("toast");if(t==null){tBusy=false;return}tBusy=true;e.textContent=t;e.classList.add("show");setTimeout(()=>{e.classList.remove("show");setTimeout(nextToast,250)},TQ.length?1400:2200)}

/* ---------- общий чат ----------
   С сервером сообщения настоящих игроков. Без сервера показываем пример. */
let chatItems=[],chatOpen=false,chatTimer=0;
const CHAT_SEEN="we-chat-seen";
function chatSeen(){try{return +localStorage.getItem(CHAT_SEEN)||0}catch(e){return 0}}
function chatDot(){const d=$("chat-dot");if(d)d.hidden=chatOpen||!(S&&S.chatLast>chatSeen())}
const nickCol=n=>"hsl("+(snHash(n)%360)+" 70% 38%)";
Object.assign(LOCAL,{chat_get(){if(!S.chatL)S.chatL=[["Артём_777","кто выбил золото? у меня пока только блестящие"],["lena.k","Мне выпал Мерлин голограмма!! 😱"],["Самурай228","меняю спартанца на викинга, пишите"],["Max_Rich","босс сегодня жёсткий, бейте все"]].map((m,i)=>({id:i+1,uid:-(i+1),name:m[0],text:m[1],t:NOW()-(5-i)*7*60e3}));return {items:S.chatL}},
  chat_send(p){if(!S.nick)throw new GameError("Чтобы писать в чат, выбери ник во вкладке «Топ»");const t=String(p.text||"").trim().slice(0,200);if(!t)throw new GameError("Пустое сообщение");
    LOCAL.chat_get();S.chatL.push({id:S.chatL.length+1,uid:0,name:S.nick,text:t,t:NOW()});return {items:S.chatL}}});
function drawChat(){const box=$("ch-list");if(!box)return;const atEnd=box.scrollHeight-box.scrollTop-box.clientHeight<60;box.innerHTML="";
  if(!chatItems.length)box.innerHTML='<p class="chempty">Пока тихо. Напиши первым!</p>';
  chatItems.forEach(m=>{const d=document.createElement("div");const mine=ONLINE?m.uid===S.uid:m.uid===0;d.className="chm"+(mine?" me":"");
    d.innerHTML='<div class="chh"><button type="button" class="chn"></button><span class="cht"></span></div><div class="chx"></div>';
    const n=d.querySelector(".chn");fxName(n,champMark(m.uid)+(m.vip?"👑 ":"")+(m.pi?"🏅 ":""),m.name+(m.a?" ★":""),m.uid);if(m.vip)d.classList.add("vipm");n.style.color=m.a?"#d4380d":nickCol(m.name);
    d.querySelector(".cht").textContent=new Date(m.t).toLocaleTimeString("ru-RU",{hour:"2-digit",minute:"2-digit"});
    d.querySelector(".chx").textContent=m.text;
    n.onclick=()=>{if(ONLINE&&m.uid>0&&m.uid!==S.uid){closeChat();openParam("u_"+m.uid)}};
    if(S.admin&&ONLINE&&!mine){const a=document.createElement("div");a.className="chadm";a.innerHTML='<button type="button">Удалить</button><button type="button">Мут 24 ч</button>';
      a.children[0].onclick=async()=>{if(await act("chat_del",{id:m.id})){chatItems=chatItems.filter(x=>x.id!==m.id);drawChat()}};
      a.children[1].onclick=async()=>{if(await act("chat_mute",{uid:m.uid,hours:24})){chatItems=chatItems.filter(x=>x.uid!==m.uid);drawChat();toast(m.name+": мут на 24 часа")}};d.appendChild(a)}
    box.appendChild(d)});
  if(atEnd||box.dataset.first!=="1"){box.scrollTop=box.scrollHeight;box.dataset.first="1"}
  const last=chatItems.length?chatItems[chatItems.length-1].id:0;if(ONLINE)try{localStorage.setItem(CHAT_SEEN,String(Math.max(last,S.chatLast||0)))}catch(e){}chatDot()}
async function pullChat(){if(!chatOpen)return;const last=chatItems.length?chatItems[chatItems.length-1].id:0;const r=await act("chat_get",{after:ONLINE?last:0});
  if(r&&chatOpen){if(!ONLINE||!last)chatItems=r.items;else if(r.items.length)chatItems=chatItems.concat(r.items.filter(x=>x.id>last)).slice(-80);else return;drawChat()}}
function openChat(){chatOpen=true;const m=$("modal"),sh=$("msheet");sh.innerHTML="";m.hidden=false;
  sh.innerHTML='<div class="chwrap"><div class="chtop"><b>Чат игроков</b><button type="button" class="x" id="ch-x">Закрыть</button></div><div class="chlist" id="ch-list"><p class="chempty">Загружаю…</p></div><div class="chin"><input type="text" id="ch-in" maxlength="200" placeholder="Сообщение…" autocomplete="off"><button type="button" class="mini2" id="ch-send">➤</button></div><small class="chrule">Без мата, ссылок и спама. Нажми на ник, чтобы открыть витрину игрока и вызвать его на бой.</small></div>';
  $("ch-x").onclick=closeChat;
  const send=async()=>{const i=$("ch-in"),t=i.value.trim();if(!t)return;$("ch-send").disabled=true;const r=await act("chat_send",{text:t});$("ch-send").disabled=false;
    if(!r)return;i.value="";chatItems=r.items;$("ch-list").dataset.first="0";drawChat();hap("light")};
  $("ch-send").onclick=send;$("ch-in").onkeydown=e=>{if(e.key==="Enter")send()};
  if(!S.nick){$("ch-in").placeholder="Сначала выбери ник";$("ch-in").onfocus=()=>{closeChat();openNick(false)}}
  pullChat();clearInterval(chatTimer);chatTimer=setInterval(pullChat,6000);chatDot()}
function closeChat(){chatOpen=false;clearInterval(chatTimer);closeModal();chatDot()}
$("chat-go").onclick=openChat;
$("modal").addEventListener("click",e=>{if(e.target===$("modal")&&chatOpen)closeChat()});

/* ---------- колесо фортуны ---------- */
let wfRot=0,wfBusy=false;
/* колесо фортуны: золотой обод с бегущими огнями, нарисованные призы */
const WIC={
  spins:n=>[...Array(n)].map((_,i)=>`<g transform="rotate(${(i-(n-1)/2)*18}) translate(0 -2)"><rect x="-11" y="-30" width="22" height="31" rx="3" fill="#e5312a" stroke="#07040f" stroke-width="2"/><rect x="-11" y="-30" width="22" height="31" rx="3" fill="url(#wcbk)"/><circle cx="0" cy="-15" r="6.5" fill="#ffd60a" stroke="#07040f" stroke-width="1.5"/></g>`).join(""),
  coins:n=>[...Array(n)].map((_,i)=>`<g transform="translate(${(i%2?7:-6)} ${-i*6})"><ellipse rx="13" ry="5" fill="#b8740f" stroke="#07040f" stroke-width="1.5"/><rect x="-13" y="-5" width="26" height="5" fill="#e0a92e"/><ellipse cy="-5" rx="13" ry="5" fill="url(#wcoin)" stroke="#07040f" stroke-width="1.5"/></g>`).join(""),
  gem:()=>`<g transform="translate(0 -12)"><path d="M-17 -8 L-9 -17 H9 L17 -8 L0 14Z" fill="url(#wgem)" stroke="#07040f" stroke-width="2"/><path d="M-17 -8 H17 M-9 -17 L-4 -8 L0 14 L4 -8 L9 -17 M-4 -8 L0 -17 L4 -8" fill="none" stroke="#e8f7ff" stroke-width="1" opacity=".8"/></g>`,
  crown:()=>`<g transform="translate(0 -10)"><rect x="-13" y="-6" width="26" height="30" rx="3" fill="#2a1446" stroke="#ffd23f" stroke-width="2"/><circle cy="9" r="6" fill="#bf5af2"/><path d="M-16 -6 L-16 -22 L-8 -13 L0 -26 L8 -13 L16 -22 L16 -6Z" fill="url(#wcoin)" stroke="#07040f" stroke-width="2"/><circle cy="-26" r="3" fill="#ff2e63" stroke="#07040f"/></g>`};
const WCOL=[["#34c759","#063d1a"],["#0a84ff","#041d4a"],["#ff9f0a","#4a2200"],["#bf5af2","#2a0a50"],["#ff3b30","#4a0505"],["#5ac8fa","#06304f"],["#ffd60a","#4a3500"],["#7a2ad6","#0a0218"]];
(function drawWheel(){const n=WHEEL.length,R=150,seg=360/n;let d=`<defs><radialGradient id="wcoin" cx=".35" cy=".3"><stop offset="0" stop-color="#fff6c8"/><stop offset=".5" stop-color="#ffd23f"/><stop offset="1" stop-color="#c88a10"/></radialGradient>
  <linearGradient id="wcbk" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".35"/><stop offset=".4" stop-color="#fff" stop-opacity="0"/></linearGradient>
  <linearGradient id="wgem" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#e8f9ff"/><stop offset=".5" stop-color="#5ac8fa"/><stop offset="1" stop-color="#0a5aa8"/></linearGradient>
  <linearGradient id="wrim" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff3b0"/><stop offset=".25" stop-color="#e0a92e"/><stop offset=".5" stop-color="#7a4a08"/><stop offset=".75" stop-color="#ffd23f"/><stop offset="1" stop-color="#8a5208"/></linearGradient>
  <linearGradient id="wrim2" x1="1" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff8d0"/><stop offset=".5" stop-color="#b47b10"/><stop offset="1" stop-color="#ffe48a"/></linearGradient>
  <radialGradient id="whub" cx=".4" cy=".35"><stop offset="0" stop-color="#fff5b0"/><stop offset=".5" stop-color="#ff9f0a"/><stop offset="1" stop-color="#6a3204"/></radialGradient>
  <radialGradient id="wsh" cx="0" cy="0" r="150" gradientUnits="userSpaceOnUse"><stop offset=".7" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".4"/></radialGradient>`;
  let g="",lab="",sep="",pins="";
  WHEEL.forEach((W,i)=>{const a0=(i*seg-90)*Math.PI/180,a1=((i+1)*seg-90)*Math.PI/180,C=WCOL[i%WCOL.length];
    d+=`<radialGradient id="wsg${i}" cx="0" cy="0" r="${R}" gradientUnits="userSpaceOnUse"><stop offset=".2" stop-color="${C[1]}"/><stop offset=".62" stop-color="${C[0]}"/><stop offset=".92" stop-color="${C[1]}"/></radialGradient>`;
    g+=`<path d="M0 0 L${(R*Math.cos(a0)).toFixed(1)} ${(R*Math.sin(a0)).toFixed(1)} A${R} ${R} 0 0 1 ${(R*Math.cos(a1)).toFixed(1)} ${(R*Math.sin(a1)).toFixed(1)}Z" fill="url(#wsg${i})"/>`;
    sep+=`<line x2="${(R*Math.cos(a0)).toFixed(1)}" y2="${(R*Math.sin(a0)).toFixed(1)}" stroke="url(#wrim2)" stroke-width="5"/>`;pins+=`<circle cx="${((R-3)*Math.cos(a0)).toFixed(1)}" cy="${((R-3)*Math.sin(a0)).toFixed(1)}" r="6" fill="url(#wcoin)" stroke="#07040f" stroke-width="2"/>`;
    const ic=W.sp?WIC.spins(W.sp):W.cash?WIC.coins(W.cash>=1000?4:W.cash>=200?3:2):W.guar?WIC.gem():WIC.crown();
    lab+=`<g transform="rotate(${i*seg+seg/2})"><g transform="translate(0 -112) scale(1.3)">${ic}</g><text y="-70" text-anchor="middle" font-family="Rubik Mono One,Rubik,sans-serif" font-weight="900" font-size="${W.t.length>5?13:W.t.length>3?16:21}" fill="${W.leg?"#ffd60a":"#fff"}" stroke="#07040f" stroke-width="4.5" paint-order="stroke">${W.t}</text></g>`});
  d+="</defs>";let bulbs="";for(let i=0;i<32;i++){const a=i*11.25*Math.PI/180;bulbs+=`<circle class="wb b${i%2}" cx="${(168*Math.cos(a)).toFixed(1)}" cy="${(168*Math.sin(a)).toFixed(1)}" r="5.5"/>`}
  $("wf-svg").innerHTML=d+`<ellipse cx="0" cy="190" rx="120" ry="12" fill="#000" opacity=".4"/><circle r="190" fill="#07040f"/><circle r="186" fill="url(#wrim)"/><circle r="176" fill="none" stroke="#07040f" stroke-width="2" opacity=".45"/><g id="wf-bulbs">${bulbs}</g><circle r="157" fill="#07040f"/><circle r="155" fill="url(#wrim2)"/>
    <g id="wf-rot">${g}${sep}${lab}${pins}</g><circle r="${R}" fill="url(#wsh)"/><circle r="${R}" fill="none" stroke="#07040f" stroke-width="3"/>
    <circle r="44" fill="#07040f"/><circle r="41" fill="url(#wrim)"/><circle r="33" fill="url(#whub)" stroke="#07040f" stroke-width="3"/>
    <path d="M-14 12 L12 -14 M-10 -14 L14 12" stroke="#07040f" stroke-width="7" stroke-linecap="round"/><path d="M-14 12 L12 -14 M-10 -14 L14 12" stroke="#fff6c8" stroke-width="3.5" stroke-linecap="round"/><circle r="5" fill="#ff2e63" stroke="#07040f" stroke-width="2"/>
    <g transform="translate(0 -188)"><path d="M0 46 L-16 8 Q0 -10 16 8Z" fill="#ff2e63" stroke="#07040f" stroke-width="3.5"/><path d="M0 40 L-9 10 Q0 0 9 10Z" fill="#ff7a9a"/><circle cy="10" r="5" fill="#fff" opacity=".85"/></g>`;
  const tot=WHEEL.reduce((a,x)=>a+x.w,0);$("wf-odds").innerHTML=WHEEL.map(W=>`<div><span>${W.sp?"🎴":W.cash?"💰":W.guar?"💎":"👑"} ${W.t} ${W.s}</span><b>${String(W.w).replace(".",",")}%</b></div>`).join("")})();
function renderWheel(){if(!S)return;const used=S.wheelDay===today(NOW()),b=$("wf-go");if(wfBusy)return;b.disabled=used;
  const ms=Date.UTC(...(d=>[d.getUTCFullYear(),d.getUTCMonth(),d.getUTCDate()+1])(new Date(NOW())))-NOW();
  b.textContent=used?"Следующее вращение через "+tleft(ms):"Крутить бесплатно";$("wf-t").textContent=used?"✔️":"1 раз в день"}
setInterval(()=>{if(!$("sec-spin").hidden)renderWheel()},1000);
$("wf-go").onclick=async()=>{if(wfBusy)return;wfBusy=true;$("wf-go").disabled=true;ac();const r=await act("wheel");if(!r){wfBusy=false;renderWheel();return}
  const n=WHEEL.length,seg=360/n,target=360-(r.i*seg+seg/2)+(Math.random()-.5)*seg*.6;wfRot=wfRot-(wfRot%360)+360*6+target;
  const g=$("wf-rot");g.style.transition=reduce?"none":"transform 4.5s cubic-bezier(.12,.7,.12,1)";g.style.transform=`rotate(${wfRot}deg)`;
  let last=0;const t0=performance.now(),bl=$("wf-bulbs");if(!reduce)(function tk(t){const k=Math.min(1,(t-t0)/4500),e=1-Math.pow(1-k,3.2),ang=e*wfRot;if(Math.floor(ang/seg)!==last){last=Math.floor(ang/seg);sfx.tick(false);hap("light");bl.classList.toggle("alt")}if(k<1)requestAnimationFrame(tk)})(t0);
  setTimeout(()=>{wfBusy=false;const W=WHEEL[r.i];renderAll();const bl2=$("wf-bulbs");bl2.classList.add("win");setTimeout(()=>bl2.classList.remove("win"),2600);if(r.card)showDrop(r.card,"Колесо: легенда!");else{sfx.fanfare();burst(W.w<=8?3:1);hapN("success");toast("🎡 Выпало: "+W.t+" "+W.s)}},reduce?50:4700)};

/* ---------- турнир выходных ---------- */
let trData=null,trAt=0;
async function loadTour(force){if(!ONLINE)return;if(!force&&trData&&NOW()-trAt<5000){drawTour();return}trAt=NOW();const r=await act("tour_get");if(r){trData=r;trData._t=NOW();drawTour()}}
const champMark=uid=>S&&S.champion&&S.champion.uid===uid?"🏆 ":"";
function drawTour(){const T=trData,box=$("tr-box");if(!T||!box)return;const left=Math.max(0,(T.left||0)-(NOW()-T._t));
  const d=Math.floor(left/864e5),hm=tleft(left%864e5);$("tr-cnt").textContent=T.phase==="reg"?T.count+" / "+T.max:"Раунд "+T.round;
  const when=new Date(T.start).toLocaleString("ru-RU",{weekday:"long",hour:"2-digit",minute:"2-digit",timeZone:"Europe/Minsk"});
  $("tr-t").textContent=T.phase==="reg"?"Старт: "+when+" (через "+(d?d+" дн ":"")+hm+"). Сетка на выбывание, каждый бой — живой на арене. Приз: "+T.prize+"."+(T.last?" Чемпион прошлой недели: 🏆 "+T.last.name+".":"")
    :"Турнир идёт! Каждый матч — живой бой, смотри любой. Приз: "+T.prize+".";
  const me=$("tr-me"),bt=$("tr-btns");me.innerHTML="";bt.innerHTML="";
  const mk=(t,cls,fn)=>{const b=document.createElement("button");b.type="button";b.className=cls;b.textContent=t;b.onclick=fn;bt.appendChild(b)};
  if(T.phase==="reg"){const c=T.me&&S.cards.find(x=>x.id===T.me.card);
    if(T.me){me.innerHTML='<p class="trin">✅ Ты в турнире'+(c?" с воином <b></b>":"")+'. Не забудь зайти в субботу к 20:00 — бот напомнит.</p>';if(c)me.querySelector("b").textContent=HEROES[c.h][0]+", "+FIN[c.f].k.toLowerCase()}
    const pc=S.cards.find(x=>x.id===arPickId);mk(T.me?(pc&&pc.id!==T.me.card?"Сменить воина на выбранного":"Ты записан ✔️"):"Записаться выбранным воином","craftbtn",async()=>{if(!pc){toast("Выбери воина ниже, в блоке «Арена»");return}if(T.me&&pc.id===T.me.card)return;if(await act("tour_join",{id:pc.id})){toast("🏆 Ты в турнире!");loadTour(true)}});
    if(T.me)mk("Выйти из турнира","ghost",async()=>{if(await act("tour_leave"))loadTour(true)});
    if(S.admin)mk("Админ: начать турнир через 1 минуту","linkbtn",async()=>{if(await act("tour_admin",{min:1})){toast("Турнир начнётся через минуту");loadTour(true)}})}
  const br=$("tr-bracket");br.innerHTML="";
  if(T.matches&&T.matches.length){const rounds=[...new Set(T.matches.map(m=>m.round))],total=Math.log2(T.matches.filter(m=>m.round===1).length*2);
    rounds.forEach(rd=>{const ms=T.matches.filter(m=>m.round===rd),h=document.createElement("div");h.className="trh";
      h.textContent=ms.length===1?"🏆 Финал":ms.length===2?"Полуфинал":ms.length===4?"Четвертьфинал":"Раунд "+rd;br.appendChild(h);
      ms.forEach(m=>{const d=document.createElement("div");d.className="trm"+(m.a===S.uid||m.b===S.uid?" me":"");
        d.innerHTML='<span class="pa"></span><span class="vs2">vs</span><span class="pb"></span><span class="act"></span>';
        d.querySelector(".pa").textContent=m.an;d.querySelector(".pb").textContent=m.bn||"— проход";
        if(m.winner){d.querySelector(m.winner===m.a?".pa":".pb").classList.add("w");d.querySelector(".act").textContent="✔️"}
        else if(m.live&&m.room){const b=document.createElement("button");b.type="button";b.className="mini2";b.textContent=m.code?"В бой!":"🔴 Смотреть";b.onclick=()=>arOpen(m.room,m.code);d.querySelector(".act").appendChild(b)}
        br.appendChild(d)})})}}
setInterval(()=>{if(arVisible()&&!arRoom&&!document.hidden)loadTour()},5000);

/* ---------- помощь и сообщение о баге ---------- */
const SUPPORT="voinovadmin";
function openSupport(kind){const id=S&&S.uid?S.uid:"—",info="ID: "+id+(S&&S.nick?" ("+S.nick+")":"")+(kind==="bug"?"\nБаг: ":"\nВопрос: ");
  try{navigator.clipboard&&navigator.clipboard.writeText(info)}catch(e){}
  toast("Твой ID скопирован — вставь его в сообщение");const u="https://t.me/"+SUPPORT;
  setTimeout(()=>{if(tg&&tg.openTelegramLink)tg.openTelegramLink(u);else window.open(u,"_blank")},700)}
function openHelp(){const m=$("modal"),sh=$("msheet");sh.innerHTML="";m.hidden=false;
  const Q=[["Как получить прокрутки?","3 бесплатные каждые 4 часа (VIP — 5), +1 за серию входов, задания дня, +10 за подписку на канал, +10 за историю, +10 за каждого друга по твоей ссылке и до 5 в день за руны в Тренировочном лагере."],["Что такое Тренировочный лагерь?","Игра в игре: тапай по мишени, каждый удар тратит ⚡ энергию и приносит 💠 руны. Энергия восстанавливается сама, бот напомнит, когда она полная. За руны прокачивай силу удара, энергию, крит и оруженосца, открывай мишени сильнее (до Дракона) и покупай прокрутки. Разбил мишень — получи сундук рун. Тренирует твой самый редкий воин: редкий даёт +10% рун, эпический +25%, легендарный +50%, мифический +100%."],
   ["От чего зависит цена карточки?","От редкости воина, отделки (блестящая, голограмма, золото, ошибка печати), красивого номера (777 777, 000 001) и закалки ★."],
   ["Как усилить воина?","Бои, походы и босс дают опыт. С уровнем открывается закалка ★1–★5 во вкладке «Мои» — нажми на карточку."],
   ["Как сражаться с живыми игроками?","«Бой» → «⚡ Арена». Создай бой или прими чужой. Можно позвать друга по ссылке и биться вживую."],
   ["Как продать карточку дороже?","«Рынок» → «Продать»: поставь свою цену, другие игроки купят. Корзина в «Моих» — быстрая продажа системе за 85% цены."],
   ["Пропали карточки или деньги?","Напиши в поддержку и укажи свой ID — мы проверим."]];
  sh.innerHTML='<button type="button" class="x">Закрыть</button><div class="who"><span>❓ Помощь</span><small></small></div><div class="box faq"></div><button type="button" class="craftbtn" id="hp-bug">🐞 Сообщить о баге</button><button type="button" class="linkbtn" id="hp-msg">✉️ Написать в поддержку</button>';
  sh.querySelector(".x").onclick=closeModal;sh.querySelector(".who small").textContent="Твой ID: "+(S&&S.uid?S.uid:"—")+" · поддержка @"+SUPPORT;
  const f=sh.querySelector(".faq");Q.forEach(([q,a])=>{const d=document.createElement("details");d.innerHTML="<summary></summary><p></p>";d.querySelector("summary").textContent=q;d.querySelector("p").textContent=a;f.appendChild(d)});
  $("hp-bug").onclick=()=>openSupport("bug");$("hp-msg").onclick=()=>openSupport("msg")}
$("help-go").onclick=openHelp;

/* ---------- обучение для новичка ----------
   Подсвечиваем нужное место и показываем подсказку. Первый шаг ждёт, пока игрок сам откроет карточку. */
const ONB=[
  {el:"open",t:"Привет, воин! ⚔️ Жми «Открыть» или тапни по карточке — выпадет случайный воин. На старте у тебя 5 бесплатных прокруток.",wait:true},
  {el:"stage",t:"Цена карточки зависит от редкости воина, отделки (блестящая, голограмма, золото, ошибка печати) и номера. Красивые номера вроде 777 777 стоят в разы дороже."},
  {el:"free-box",t:"Каждые 4 часа — 3 бесплатные прокрутки. Ещё: +10 за подписку на канал и +10 за каждого друга."},
  {el:"tab-fight",t:"⚔️ Бой и 🎯 Лагерь — тапай по мишени, копи руны 💠, прокачивайся и покупай за руны прокрутки."},
  {el:"cash-box",t:"Сверху твои деньги 🪙 и руны 💠."},
  {el:"rare-box",t:"💎 А вот за кем охотиться: самые редкие воины и шанс их выбить."},
  {el:"tabs",t:"Внизу остальное: карты и альбом, бои, казино, подарки, рынок и твой профиль с витриной. Удачи! 🍀"}];
/* «Что нового» для тех, кто уже играл: коротко про новые функции, один раз */
const ONB_NEW=[
  {el:"tab-fight",t:"Новое! 🎯 Лагерь — тапай по мишени, копи руны 💠 и прокачивайся. Чем реже твой лучший воин, тем больше рун."},
  {el:"free-camp",t:"Прокрутки теперь покупаются за руны в Лагере — до 5 в день."},
  {el:"cash-box",t:"Руны 💠 видны сверху рядом с деньгами. Нажми на них — откроется Лагерь."},
  {el:"rare-box",t:"💎 Здесь самые редкие воины игры и шанс их выбить. Сёгун и Мерлин — 1 на ~2500 прокруток!"},
  {el:"tab-cards",t:"В «Карты» — сортировка, витрина всех видов карточек и слияние. Удачи! 🍀"}];
let onbStep=-1,ONBS=ONB,ONBK="we-onb";
function startOnb(){let done=null;try{done=localStorage.getItem("we-onb")}catch(e){}if(done||!S||S.cards.length)return false;ONBS=ONB;ONBK="we-onb";onbStep=0;showOnb();return true}
function startWhatsNew(){let done=null;try{done=localStorage.getItem("we-new1")}catch(e){}if(done||!S)return false;ONBS=ONB_NEW;ONBK="we-new1";onbStep=0;showOnb();return true}
function onbEnd(){onbClear();onbStep=-1;try{localStorage.setItem(ONBK,"1");localStorage.setItem("we-new1","1")}catch(e){}if(ONBK==="we-onb")setTimeout(askNick,400)}
function onbClear(){document.querySelectorAll(".onb-hl").forEach(e=>e.classList.remove("onb-hl"));const b=$("onb");if(b)b.remove()}
function showOnb(){onbClear();const st=ONBS[onbStep];if(!st){onbEnd();return}
  const el=st.el==="tabs"?document.querySelector("nav.tabs"):$(st.el);if(!el||el.hidden){onbStep++;showOnb();return}
  if(el.closest("header"))scrollTo({top:0,behavior:reduce?"auto":"smooth"});else if(st.el!=="tabs"&&!el.closest("nav"))el.scrollIntoView({block:"center",behavior:reduce?"auto":"smooth"});
  setTimeout(()=>{el.classList.add("onb-hl");const r=el.getBoundingClientRect(),b=document.createElement("div");b.id="onb";b.className="onb";
    b.innerHTML=`<div class="onb-n">${ONBS===ONB_NEW?"Что нового · ":""}${onbStep+1} из ${ONBS.length}</div><p></p><div class="onb-b">${st.wait?"":`<button type="button" class="mini2" id="onb-next">${onbStep===ONBS.length-1?"Играть!":"Дальше"}</button>`}<button type="button" class="ghost" id="onb-skip">Пропустить</button></div>`;
    b.querySelector("p").textContent=st.t;document.body.appendChild(b);
    const h=b.offsetHeight,below=r.bottom+14+h<innerHeight-10;b.style.top=(below?r.bottom+14:Math.max(10,r.top-14-h))+"px";b.classList.add(below?"down":"up");
    if($("onb-next"))$("onb-next").onclick=()=>{onbStep++;showOnb()};$("onb-skip").onclick=onbEnd},reduce?0:350)}
/* первый шаг: после открытия первой карточки идём дальше */
function onbOpened(){if(onbStep===0&&ONBS===ONB){onbClear();setTimeout(()=>{onbStep=1;showOnb()},1600)}}

/* ---------- запуск ---------- */
const sample={id:0,h:19,f:2,no:37,sn:"123321",hue:0,v:1236,stats:[331,352,296,348,361]};
showCard(sample);$("p-lbl").textContent="Пример карточки. Нажми «Открыть»";$("sell").disabled=true;
$("open").addEventListener("click",()=>{$("p-lbl").textContent="Цена карточки"},{once:true});
$("stage").addEventListener("click",()=>{$("p-lbl").textContent="Цена карточки"},{once:true});
(async function start(){
  if(ONLINE){$("free-t").textContent="Подключаюсь к серверу…";const r=await act("sync");if(!r){$("free-t").textContent="Сервер недоступен. Закрой игру и открой снова";return}}
  else{S=loadLocal();touch(S,NOW());save()}
  renderAll();handleStart();
  if(new URLSearchParams(location.search).get("camp"))setTimeout(()=>{try{openCamp()}catch(e){}},600);
  if(new URLSearchParams(location.search).get("shop"))setTimeout(()=>{try{openGold()}catch(e){}},600);
  setTimeout(()=>{try{newsUpd()}catch(e){}},2500);
  const fromLink=new URLSearchParams(location.search).get("startapp")||(tg&&tg.initDataUnsafe&&tg.initDataUnsafe.start_param);
  if(!fromLink)setTimeout(()=>{if(!startOnb()&&!(S.cards.length&&startWhatsNew()))askNick()},600);
})();

