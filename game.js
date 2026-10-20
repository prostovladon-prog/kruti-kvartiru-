/* game.js — интерфейс «Воинов Эпох». Правила игры лежат в rules.js. */

/* ---------- настройки ---------- */
const API_URL="https://autumn-hat-37ccvoiny-epoh.prostovladon.workers.dev";                              // адрес сервера, например https://voiny-epoh.твоё-имя.workers.dev (пусто = игра без сервера)
const BOT_LINK="https://t.me/VoinyEpohBot";   // ссылка на бота, например https://t.me/VoinyEpohBot
const PAGE_URL="https://prostovladon-prog.github.io/kruti-kvartiru-/";

const $=id=>document.getElementById(id);
const fmt=n=>{n=+n||0;if(Math.abs(n)<100&&Math.abs(n-Math.round(n))>.004)return "$"+n.toFixed(2).replace(".",",");return "$"+Math.round(n).toLocaleString("ru-RU").replace(/[\u00a0\u202f,]/g," ")};
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
    snFree:s=>!S.used[s],takeSn:s=>{S.used[s]=1},newId:()=>S.seq=(S.seq||0)+1}}
/* сколько экземпляров уже выпущено (для крафта и слияния) */
function issuedOfUI(h,f){if(FIN[f].run===Infinity)return 0;return ONLINE?((S.prints||{})[h+"-"+f]||0):localCtx().issuedOf(h,f)}

/* ---------- действие игрока: локально или через сервер ---------- */
async function act(name,p){
  try{let out;
    if(ONLINE){
      const r=await fetch(API_URL.replace(/\/$/,"")+"/api",{method:"POST",headers:{"Content-Type":"application/json","X-Init-Data":(tg&&tg.initData)||"","X-Dev-User":DEV_USER||""},body:JSON.stringify({a:name,p:p||{}})});
      const j=await r.json();if(!j.ok)throw new GameError(j.err||"Ошибка сервера");S=j.S;out=j.res||{};
    }else{
      if(LOCAL[name])out=LOCAL[name](p||{});
      else{const ctx=localCtx(),r=runAction(name,S,S.cards,ctx,p);S.cards=r.cards;out=r.res;out.events=ctx.events}
      save();
    }
    (out.events||[]).forEach(e=>{if(e.t==="lvl")toast(HEROES[e.h][0]+" достиг уровня "+e.lv+"!")});
    news();return out;
  }catch(e){if(!(e instanceof GameError))console.error(e);toast(e instanceof GameError?e.message:"Нет связи с сервером. Попробуй ещё раз");return null}
}
/* новости: кто купил твои карточки на рынке */
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
function showCard(c){
  const H=HEROES[c.h],T=HT[H[2]],F=FIN[c.f];
  front.className="face front "+F.cls;front.style.setProperty("--hc",T.c);if(c.frame&&FRAMES[c.frame])front.style.setProperty("--edge",FRAMES[c.frame].bg);else front.style.removeProperty("--edge");
  $("h-name").textContent=H[0];$("h-no").textContent="№ "+String(c.h+1).padStart(2,"0")+"/"+NHEROES;
  $("h-emo").innerHTML=portrait(c.h,c);$("h-era").textContent=H[1];$("h-tier").textContent=T.k;$("h-fin").textContent=F.k;
  $("h-pow").textContent=H[3];
  $("h-stats").innerHTML=["Атака","Броня","Скорость","Выносливость","Боевой дух"].map((n,i)=>`<span>${n}</span><span class="num">${c.stats?eff(c,i):"?"}</span>`).join("");
  const lb=$("h-lvl");lb.hidden=lvl(c)<=1;lb.textContent="Ур. "+lvl(c);
  $("h-fin").textContent=F.k+(F.run===Infinity?"":" "+c.no+"/"+F.run);
  const sn=c.sn||"482913",cl=classify(sn);
  $("h-serial").innerHTML="<small>№</small>"+fmtSn(sn);$("h-serial").classList.toggle("nice",!!cl);
  const rb=$("h-rib");rb.hidden=!cl;if(cl)rb.textContent=cl.k+", ×"+cl.m;
  $("h-val").textContent=fmt(c.v);
  $("p-val").textContent=fmt(c.v);
  $("sell-v").textContent=fmt(c.v*QUICK);
}
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
$("snd").onclick=()=>{muted=!muted;$("snd").setAttribute("aria-pressed",!muted);if(!muted)sfx.coin()};

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
  if((S.spins??0)<=0&&!(S.refillAt&&NOW()>=S.refillAt)){toast("Прокрутки закончились. Новые через "+leftTxt());return}
  busy=true;ac();$("p-lbl").textContent="Цена карточки";
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
$("open").onclick=()=>open();$("stage").onclick=()=>open();
$("stage").onkeydown=e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();open()}};
$("sell").onclick=async()=>{if(!current||busy)return;if(!S.cards.some(x=>x.id===current.id)){toast("Эта карточка уже не у тебя");return}
  const r=await act("sell",{id:current.id});if(!r)return;toast("Продано за "+fmt(r.got));current=null;$("sell").disabled=true;renderAll()};


/* ---------- album ---------- */
function renderAlbum(){
  const box=$("album");box.innerHTML="";let have=0;
  HEROES.forEach((H,i)=>{
    const mine=S.cards.filter(c=>c.h===i),got=mine.length>0;if(got)have++;
    const d=document.createElement("div");d.className="slot "+(got?"have":"empty");d.style.setProperty("--hc",HT[H[2]].c);
    const fins=[...new Set(mine.map(c=>c.f))].sort();
    d.innerHTML=`<span class="n">${String(i+1).padStart(2,"0")}</span><span class="e">${got?portrait(i,mine[0],1):portrait(i,null,1)}</span><small></small><span class="dots">${fins.map(f=>`<i style="--d:${FIN[f].col}"></i>`).join("")}</span>`;
    d.querySelector("small").textContent=got?H[0]:"???";box.appendChild(d)});
  $("al-n").textContent=have+" из "+NHEROES;$("al-bar").style.width=have/NHEROES*100+"%";
}

/* ---------- collection ---------- */
function renderCol(){
  const box=$("col");box.innerHTML="";
  $("col-n").textContent=S.cards.length+" из "+CAP+" мест, на "+fmt(S.cards.reduce((a,c)=>a+c.v,0));
  if(!S.cards.length){box.innerHTML='<div class="empty-msg">Тут пока пусто. Открой первую карточку на вкладке «Крутить»</div>';return}
  [...S.cards].sort((a,b)=>b.v-a.v).forEach(c=>{
    const H=HEROES[c.h],F=FIN[c.f],el=document.createElement("div");el.className="it";el.style.setProperty("--hc",HT[H[2]].c);el.style.setProperty("--s",c.f?F.col:HT[H[2]].c);
    el.innerHTML=`<div class="e">${portrait(c.h,c,1)}</div><div class="t"><b></b><small><span class="tg"></span><span class="sub"></span></small></div><div class="r"><b class="num">${fmt(c.v)}</b><button type="button" class="mini">Продать</button></div>`;
    el.querySelector("b").textContent=H[0];el.querySelector(".tg").textContent=F.k;
    el.querySelector(".sub").textContent=F.run===Infinity?HT[H[2]].k:c.no+" из "+F.run;
    if(c.sn){const cl=classify(c.sn),sn=document.createElement("div");sn.className="sn num"+(cl?" nice":"");sn.textContent="№ "+fmtSn(c.sn)+(cl?", "+cl.k.toLowerCase():"");el.querySelector(".t").appendChild(sn)}
    if(away(c)){const m=el.querySelector(".mini");m.disabled=true;m.textContent=c.listed?"На рынке":"В походе"}
    if(lvl(c)>1){const t=document.createElement("span");t.className="tg";t.style.setProperty("--s","#0d1030");t.textContent="Ур. "+lvl(c);el.querySelector(".t small").prepend(t)}
    el.querySelector(".mini").onclick=async()=>{const r=await act("sell",{id:c.id});if(!r)return;if(current&&current.id===c.id){current=null;$("sell").disabled=true}renderAll();toast("Продано за "+fmt(r.got))};
    box.appendChild(el)});
}
$("sellcommon").onclick=async()=>{const r=await act("sellcommon");if(!r)return;renderAll();toast("Продано "+r.n+" шт. за "+fmt(r.got))};


/* ---------- odds ---------- */
$("odds").innerHTML=FIN.map(f=>`<div><i style="--s:${f.col}"></i><b style="text-align:left;min-width:0">${f.k}</b><span>${f.run===Infinity?"без лимита":"тираж "+f.run}</span><b>${String(f.w).replace(".",",")}%</b></div>`).join("");

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
function crChance(){const t=targetPrice(crH,crF),sum=crSum();if(!sum)return 0;const amu=$("cr-amu")&&$("cr-amu").checked?.1:0;return Math.min(PMAX+amu,HOUSE*sum/t+amu)}
function arcPath(p){if(p<=0)return "";if(p>=.9999)return "M100 8 A92 92 0 1 1 99.99 8 Z";
  const a=p*2*Math.PI,x=100+92*Math.sin(a),y=100-92*Math.cos(a);return `M100 100 L100 8 A92 92 0 ${p>.5?1:0} 1 ${x.toFixed(2)} ${y.toFixed(2)} Z`}
function renderCraft(){
  // inputs
  for(const id of [...crSel])if(!S.cards.some(c=>c.id===id))crSel.delete(id);
  const pk=$("cr-pick");pk.innerHTML="";
  if(!S.cards.length){pk.innerHTML='<p style="margin:0;color:#5a5f80">В коллекции пусто. Открой несколько карточек на вкладке «Крутить».</p>'}
  [...S.cards].filter(c=>!away(c)).sort((a,b)=>b.v-a.v).forEach(c=>{
    const H=HEROES[c.h],b=document.createElement("button");b.type="button";b.className="pc";b.style.setProperty("--hc",HT[H[2]].c);
    b.setAttribute("aria-pressed",crSel.has(c.id));
    b.innerHTML=`<span class="pv">${portrait(c.h,c,1)}</span><span></span><span style="color:#5a5f80">${FIN[c.f].k}</span><b class="num">${fmt(c.v)}</b>`;
    b.children[1].textContent=H[0];
    b.onclick=()=>{if(crBusy)return;crLast=null;if(crSel.has(c.id))crSel.delete(c.id);else{if(crSel.size>=5){toast("Можно отдать максимум 5 карточек");return}crSel.add(c.id)}renderCraft()};
    pk.appendChild(b)});
  $("cr-sum").textContent=fmt(crSum());
  $("cr-hint").textContent=crSel.size?"Выбрано "+crSel.size+" из 5":"Выбери от 1 до 5 карточек из коллекции.";
  // target finishes
  const fb=$("cr-fins");fb.innerHTML="";
  FIN.forEach((F,i)=>{const b=document.createElement("button");b.type="button";b.textContent=F.k;b.setAttribute("aria-pressed",i===crF);
    b.onclick=()=>{if(crBusy)return;crF=i;renderCraft()};fb.appendChild(b)});
  const tg=$("cr-tgt");tg.innerHTML="";
  HEROES.forEach((H,i)=>{const b=document.createElement("button");b.type="button";b.className="tg2";b.style.setProperty("--hc",HT[H[2]].c);
    b.setAttribute("aria-pressed",i===crH);b.setAttribute("aria-label",H[0]);b.title=H[0];b.innerHTML=portrait(i,null,1);
    b.onclick=()=>{if(crBusy)return;crH=i;renderCraft()};tg.appendChild(b)});
  const F=FIN[crF],left=F.run===Infinity?Infinity:F.run-issuedOfUI(crH,crF);
  $("cr-tname").innerHTML="";const nb=document.createElement("b");nb.textContent=HEROES[crH][0]+", "+F.k.toLowerCase();$("cr-tname").appendChild(nb);
  $("cr-trun").textContent=left===Infinity?HT[HEROES[crH][2]].k:(left>0?"осталось "+left+" из "+F.run:"тираж закончился");
  const tv=targetPrice(crH,crF);$("cr-tv").textContent=fmt(tv);
  // wheel
  let p=left>0?crChance():0;const showLast=!crSel.size&&crLast!=null;if(showLast)p=crLast;
  $("cr-f1").textContent=showLast?"—":fmt(crSum());$("cr-f2").textContent=fmt(tv);
  $("cr-arc").setAttribute("d",arcPath(p));
  $("cr-p").textContent=(p*100<1&&p>0?"<1":Math.round(p*100))+"%";
  $("cr-amu-t").textContent="Амулет удачи: +10% к шансу за "+fmt(amuCost(crH,crF));
  const go=$("cr-go");go.disabled=crBusy||!crSel.size||left<=0||crChance()<=0;
  go.textContent=left<=0?"Тираж закончился":!crSel.size?"Выбери карточки":"Крутить колесо, шанс "+$("cr-p").textContent;
  if(!crBusy&&crSel.size&&HOUSE*crSum()/tv>PMAX)$("cr-res").textContent="Больше 80% шанса не бывает. Выбери цель подороже или отдай меньше.";
  else if(!crBusy)$("cr-res").textContent="";
  $("cr-res").className="result";
}
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
  const nd=$("cr-needle");nd.style.transition=reduce?"none":"";nd.style.transform=`rotate(${crRot}deg)`;
  $("cr-res").textContent="Крутим...";$("cr-res").className="result";
  setTimeout(()=>{
    let msg;
    if(win){const c=r.card;current=c;showCard(c);$("sell").disabled=false;burst(Math.max(c.f,HEROES[c.h][2])+1);
      msg="Получилось! "+HEROES[c.h][0]+", "+FIN[c.f].k.toLowerCase()+", № "+fmtSn(c.sn)+", "+fmt(c.v);}
    else msg="Не повезло. Сгорело "+ids.length+" шт. на "+fmt(r.lost);
    crBusy=false;renderCraft();renderAll();
    const el=$("cr-res");el.textContent=msg;el.className="result "+(win?"win":"lose");toast(win?"Крафт удался!":"Крафт не удался");
  },reduce?50:4300);
};

(function ticks(){let t="";for(let i=0;i<20;i++){const a=i/20*2*Math.PI;t+=`<line x1="${100+80*Math.sin(a)}" y1="${100-80*Math.cos(a)}" x2="${100+88*Math.sin(a)}" y2="${100-88*Math.cos(a)}" stroke="#fff" stroke-width="2" opacity=".6"/>`}$("cr-ticks").innerHTML=t})();
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
  const n=S.spins??0;$("free-n").textContent=n<=SPINS_MAX?n+"/"+SPINS_MAX:String(n);$("open-n").textContent=n>0?"осталось "+n:"через "+leftTxt();
  $("free-t").textContent=!S.refillAt?"Каждые 4 часа даётся 3 бесплатных прокрутки":"Новые 3 прокрутки через "+leftTxt();$("open").classList.toggle("empty",n<=0)}
setInterval(renderFree,1000);

/* ---------- бой в три раунда: результат считают правила, здесь только анимация ---------- */
const RN=["Твой выбор","Выбор соперника","Случайная"];
function pipsHTML(picks,rounds,cur,shown){shown=shown||[0];return [0,1,2].map(k=>{const r=rounds[k],known=r||shown.includes(k);
  const cls=r?(r.a>r.b?"w":r.a<r.b?"l":"d"):(k===cur?"cur":"");
  return `<div class="rd ${cls}"><small>Раунд ${k+1}</small><b>${known&&picks[k]!=null?STN[picks[k]]:"?"}</b><span>${r?r.a+" : "+r.b:RN[k]}</span></div>`}).join("")}
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

function mcHTML(c,stat,show){const H=HEROES[c.h];return `<div class="t">${H[0].replace(/</g,"")}</div><div class="p">${portrait(c.h,c,1)}</div><div class="v"><small>${STN[stat]}</small><b class="num">${show==null?eff(c,stat):show}</b></div>`}
function renderDuel(){
  if(duMine&&!S.cards.some(c=>c.id===duMine))duMine=null;
  const md=$("du-mode");md.innerHTML="";
  ["На интерес","На карточку"].forEach((t,i)=>{const b=document.createElement("button");b.type="button";b.textContent=t;b.setAttribute("aria-pressed",i===duMode);b.onclick=()=>{if(duBusy)return;duMode=i;renderDuel()};md.appendChild(b)});
  const me=S.cards.find(c=>c.id===duMine),mel=$("du-me");
  if(!duBusy){
    if(me){mel.className="mc";mel.style.setProperty("--hc",HT[HEROES[me.h][2]].c);mel.innerHTML=mcHTML(me,duStat)}
    else{mel.className="mc empty";mel.textContent=S.cards.length?"Выбери воина внизу":"Сначала открой карточки на вкладке «Крутить»"}
    const op=$("du-op");op.className="mc back";op.innerHTML="<span>СОПЕР<br>НИК</span>";
  }
  const sb=$("du-stats");sb.innerHTML="";
  STN.forEach((n,i)=>{const b=document.createElement("button");b.type="button";b.setAttribute("aria-pressed",i===duStat);b.innerHTML=`${n}<b class="num">${me?eff(me,i):"—"}</b>`;b.onclick=()=>{if(duBusy)return;duStat=i;renderDuel()};sb.appendChild(b)});
  if(!duBusy)$("du-rounds").innerHTML=pipsHTML([duStat,null,null],[],0);
  const go=$("du-go");go.disabled=!me||duBusy;go.textContent=duMode?"В бой на карточку!":"В бой!";
  const pk=$("du-pick");pk.innerHTML="";
  [...S.cards].filter(c=>!away(c)).sort((a,b)=>eff(b,duStat)-eff(a,duStat)).forEach(c=>{
    const H=HEROES[c.h],b=document.createElement("button");b.type="button";b.className="pc";b.style.setProperty("--hc",HT[H[2]].c);b.setAttribute("aria-pressed",c.id===duMine);
    b.innerHTML=`<span class="pv">${portrait(c.h,c,1)}</span><span></span><span style="color:#5a5f80">${STN[duStat]}: ${eff(c,duStat)}</span><b>Ур. ${lvl(c)}${c.wins?", побед "+c.wins:""}</b>`;b.children[1].textContent=H[0];
    b.onclick=()=>{if(duBusy)return;duMine=c.id;$("du-res").textContent="";renderDuel()};pk.appendChild(b)});
  $("du-wins").textContent="Побед сегодня: "+day(S,NOW()).wins;
}
$("du-go").onclick=async()=>{
  const me=S.cards.find(c=>c.id===duMine);if(!me||duBusy)return;duBusy=true;ac();
  const op=$("du-op"),mel=$("du-me"),res=$("du-res"),bot=BOTN[Math.floor(Math.random()*BOTN.length)];res.className="result";res.textContent="Соперник: "+bot;
  $("du-go").disabled=true;mel.classList.remove("win","lose");
  op.classList.add("back");op.innerHTML="<span>СОПЕР<br>НИК</span>";
  if(!reduce){op.style.animation="shake .11s linear infinite";whoosh()}
  const r=await act("duel",{id:me.id,stat:duStat,mode:duMode});
  if(!r){op.style.animation="";duBusy=false;renderDuel();return}
  setTimeout(()=>{
    op.style.animation="";op.className="mc";op.style.setProperty("--hc",HT[HEROES[r.opp.h][2]].c);
    runBattle({L:r.me,Rc:r.opp,picks:r.picks,rounds:r.rounds,leftEl:mel,rightEl:op,roundsEl:$("du-rounds"),statusEl:$("du-st"),vsEl:$("du-vs"),done:(w,l)=>{
      let msg;const sc=w+" : "+l;
      if(w===l)msg="Ничья "+sc+"! Опыт +15";
      else if(w>l){sfx.fanfare();burst(3);hapN("success");msg=r.gotCard?"Победа "+sc+"! Карточка "+HEROES[r.gotCard.h][0]+" теперь твоя":"Победа "+sc+"! Награда "+fmt(r.reward)}
      else{sfx.lose();msg=r.lostCard?"Поражение "+sc+". Твоя карточка ушла к "+bot:"Поражение "+sc+". Попробуй другого воина или характеристику";if(r.lostCard&&current&&current.id===me.id){current=null;$("sell").disabled=true}}
      res.textContent=msg;res.className="result "+(w>l?"win":w<l?"lose":"");updCash();
      setTimeout(()=>{duBusy=false;if(r.lostCard)duMine=null;$("du-st").textContent="Раунд 1: выбери характеристику";renderDuel()},2200)}});
  },reduce?0:Math.max(0,900));
};


/* ---------- Telegram ---------- */
try{if(tg){tg.ready();tg.expand();tg.setHeaderColor&&tg.setHeaderColor("#1d44c8");tg.setBackgroundColor&&tg.setBackgroundColor("#1d44c8")}}catch(e){}
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
  S.cards.forEach(c=>{if(c.f<4&&!away(c)){const k=c.h+"-"+c.f;(g[k]=g[k]||[]).push(c)}});
  const groups=Object.values(g).filter(a=>a.length>=3);
  if(!groups.length){box.innerHTML='<p style="margin:0;color:#5a5f80">Пока нечего сливать. Собери три одинаковых карточки.</p>';return}
  groups.forEach(a=>{const c=a[0],nf=c.f+1,left=FIN[nf].run===Infinity||issuedOfUI(c.h,nf)<FIN[nf].run,el=document.createElement("div");el.className="mg";el.style.setProperty("--hc",HT[HEROES[c.h][2]].c);
    el.innerHTML=`<span class="e">${portrait(c.h,c,1)}</span><span><b></b><br><small style="color:#5a5f80">${a.length} шт., ${FIN[c.f].k.toLowerCase()} → ${FIN[nf].k.toLowerCase()}</small></span><button type="button" class="mini2">${left?"Слить 3":"Тираж закончился"}</button>`;
    el.querySelector("b").textContent=HEROES[c.h][0];const b=el.querySelector("button");b.disabled=!left;
    b.onclick=async()=>{const r=await act("merge",{h:c.h,f:c.f});if(!r)return;const n=r.card;
      if(current&&!S.cards.some(x=>x.id===current.id)){current=null;$("sell").disabled=true}
      sfx.fanfare();hapN("success");burst(nf+1);renderAll();toast("Слияние! "+HEROES[n.h][0]+", "+FIN[n.f].k.toLowerCase()+", № "+fmtSn(n.sn)+", "+fmt(n.v))};box.appendChild(el)})}


/* ---------- battle hub tabs ---------- */
let btView="duel";
document.querySelectorAll("#bt-seg button").forEach(b=>b.onclick=()=>{btView=b.dataset.v;renderBattle()});
function renderBattle(){document.querySelectorAll("#bt-seg button").forEach(b=>b.setAttribute("aria-pressed",b.dataset.v===btView));
  ["duel","boss","exp"].forEach(v=>$("bt-"+v).style.display=v===btView?"flex":"none");
  if(btView==="duel")renderDuel();if(btView==="boss")renderBoss();if(btView==="exp")renderExp()}
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
    el.innerHTML=`<span class="e">${portrait(c.h,c,1)}</span><span><b></b><br><small style="color:#5a5f80"></small></span><button type="button" class="mini2"></button>`;
    el.querySelector("b").textContent=HEROES[c.h][0];el.querySelector("small").textContent=D.k+(left>0?", вернётся через "+tleft(left):", вернулся!");
    const b=el.querySelector("button");const canRush=!ONLINE||S.test;b.textContent=left>0?(canRush?"Ускорить (тест)":"В пути"):"Забрать добычу";b.disabled=left>0&&!canRush;
    b.onclick=async()=>{if(left>0){if(await act("exp_rush",{id:c.id}))renderExp();return}
      const r=await act("exp_claim",{id:c.id});if(!r)return;
      let msg=HEROES[c.h][0]+" вернулся: +"+r.money+"$, +"+r.xp+" опыта";if(r.sp)msg+=", +"+r.sp+(r.sp===1?" прокрутка":" прокрутки");
      if(r.card){msg+=". Нашёл карточку: "+HEROES[r.card.h][0]+"!";burst(3)}
      sfx.coin();hapN("success");renderAll();toast(msg)};
    sl.appendChild(el)}
  const dd=$("ex-dest");dd.innerHTML="";
  DEST.forEach((D,i)=>{const b=document.createElement("button");b.type="button";b.setAttribute("aria-pressed",i===exDest);
    b.innerHTML=`<b></b>${D.t}, +${D.xp} опыта<br>$${D.m[0]}–${D.m[1]}${D.card?", шанс карточки "+Math.round(D.card*100)+"%":""}`;b.querySelector("b").textContent=D.k;b.onclick=()=>{exDest=i;renderExp()};dd.appendChild(b)});
  const pk=$("ex-pick");pk.innerHTML="";const free=S.cards.filter(c=>!away(c));
  if(!free.length)pk.innerHTML='<p style="margin:0;color:#5a5f80">Нет свободных воинов.</p>';
  free.sort((a,b)=>b.v-a.v).forEach(c=>{const H=HEROES[c.h],b=document.createElement("button");b.type="button";b.className="pc";b.style.setProperty("--hc",HT[H[2]].c);b.setAttribute("aria-pressed",c.id===exPick);
    b.innerHTML=`<span class="pv">${portrait(c.h,c,1)}</span><span></span><span style="color:#5a5f80">Ур. ${lvl(c)}</span><b>${FIN[c.f].k}</b>`;b.children[1].textContent=H[0];b.onclick=()=>{exPick=c.id;renderExp()};pk.appendChild(b)});
  const go=$("ex-go"),full=list.length>=exSlots();go.disabled=!exPick||full||!free.some(c=>c.id===exPick);go.textContent=full?"Все места заняты":"Отправить в поход: "+DEST[exDest].k.toLowerCase();
}
$("ex-go").onclick=async()=>{const c=S.cards.find(x=>x.id===exPick);if(!c)return;const r=await act("exp_start",{id:c.id,dest:exDest});if(!r)return;
  if(current&&current.id===c.id){current=null;$("sell").disabled=true}exPick=null;whoosh();renderExp();toast(HEROES[c.h][0]+" ушёл в поход")};
setInterval(()=>{if(S&&!$("sec-duel").hidden&&btView==="exp")renderExp()},1000);


/* ---------- босс недели ---------- */
const bossS=()=>boss(S,NOW());
function bossSVG(hpk){const eye=hpk<.3?"#ff3b30":"#ffd60a";let heads="";
  [[95,62,-18],[150,42,0],[205,62,18]].forEach(([x,y,r],i)=>{heads+=`<g transform="rotate(${r} ${x} ${y+40})"><path d="M${x-12} ${y+70} Q${x-16} ${y+30} ${x} ${y+18} Q${x+16} ${y+30} ${x+12} ${y+70} Z" fill="#3f8f3a" stroke="#0d1030" stroke-width="4"/>
   <path d="M${x-22} ${y+20} Q${x-24} ${y-6} ${x} ${y-10} Q${x+24} ${y-6} ${x+22} ${y+20} Q${x+12} ${y+34} ${x} ${y+34} Q${x-12} ${y+34} ${x-22} ${y+20} Z" fill="#4fae47" stroke="#0d1030" stroke-width="4"/>
   <path d="M${x-14} ${y-6} L${x-22} ${y-24} L${x-6} ${y-10} M${x+14} ${y-6} L${x+22} ${y-24} L${x+6} ${y-10}" fill="#f2e6c8" stroke="#0d1030" stroke-width="3"/>
   <path d="M${x-12} ${y+4} L${x-3} ${y+8} M${x+12} ${y+4} L${x+3} ${y+8}" stroke="#0d1030" stroke-width="4"/><circle cx="${x-8}" cy="${y+10}" r="3.4" fill="${eye}"/><circle cx="${x+8}" cy="${y+10}" r="3.4" fill="${eye}"/>
   <path d="M${x-10} ${y+24} L${x-6} ${y+30} L${x-2} ${y+24} L${x+2} ${y+30} L${x+6} ${y+24} L${x+10} ${y+30}" fill="none" stroke="#fff" stroke-width="2.5"/>
   ${i===1?`<path d="M${x-8} ${y+34} Q${x} ${y+60} ${x+8} ${y+34} Q${x+20} ${y+70} ${x} ${y+86} Q${x-20} ${y+70} ${x-8} ${y+34} Z" fill="#ff9f0a" opacity=".9"/><path d="M${x-4} ${y+38} Q${x} ${y+56} ${x+4} ${y+38} Q${x+10} ${y+62} ${x} ${y+72} Q${x-10} ${y+62} ${x-4} ${y+38} Z" fill="#ffd60a"/>`:""}</g>`});
  return `<path d="M40 120 Q20 60 70 40 Q66 80 98 104 Z M260 120 Q280 60 230 40 Q234 80 202 104 Z" fill="#2e6e2a" stroke="#0d1030" stroke-width="4"/>
  <path d="M60 196 Q70 120 150 112 Q230 120 240 196 Z" fill="#3f8f3a" stroke="#0d1030" stroke-width="4"/><path d="M110 196 Q118 146 150 140 Q182 146 190 196 Z" fill="#c9d98a" stroke="#0d1030" stroke-width="3"/>
  <path d="M120 160 H180 M116 176 H184" stroke="#8aa04a" stroke-width="3"/>${heads}`}
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
  S.cards.filter(c=>!away(c)&&!squad.includes(c.id)).sort((a,b)=>eff(b,0)-eff(a,0)).forEach(c=>{const H=HEROES[c.h],b=document.createElement("button");b.type="button";b.className="pc";b.style.setProperty("--hc",HT[H[2]].c);
    b.innerHTML=`<span class="pv">${portrait(c.h,c,1)}</span><span></span><span style="color:#5a5f80">Атака ${eff(c,0)}</span><b>Ур. ${lvl(c)}</b>`;b.children[1].textContent=H[0];
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
function myName(){try{const u=tg&&tg.initDataUnsafe&&tg.initDataUnsafe.user;if(u&&u.first_name)return u.first_name.slice(0,16)}catch(e){}return (S&&S.name)||"Игрок"}
function b64e(bytes){let s="";bytes.forEach(b=>s+=String.fromCharCode(b));return btoa(s).replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/,"")}
function b64d(str){str=str.replace(/-/g,"+").replace(/_/g,"/");while(str.length%4)str+="=";const s=atob(str);return [...s].map(c=>c.charCodeAt(0))}
function encCard(c,out){const sn=+c.sn,v=Math.round(c.v*100);out.push(c.h,c.f,lvl(c),Math.round((c.hue||0)/2)&255,(c.no>>8)&255,c.no&255,(sn>>16)&255,(sn>>8)&255,sn&255);
  c.stats.forEach(x=>out.push((x>>8)&255,x&255));out.push((v>>>24)&255,(v>>16)&255,(v>>8)&255,v&255)}
function decCard(a,i){const c={h:a[i],f:a[i+1],lv:a[i+2],hue:a[i+3]*2,no:(a[i+4]<<8)|a[i+5],sn:String((a[i+6]<<16)|(a[i+7]<<8)|a[i+8]).padStart(6,"0"),stats:[]};
  for(let k=0;k<5;k++)c.stats.push((a[i+9+k*2]<<8)|a[i+10+k*2]);c.v=((a[i+19]<<24)|(a[i+20]<<16)|(a[i+21]<<8)|a[i+22])/100;c.xp=25*Math.pow(c.lv-1,2);c.id="f"+i+"_"+c.sn;
  if(c.h>=NHEROES||c.f>4)throw 0;return c}
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
function closeModal(){$("modal").hidden=true;$("msheet").innerHTML=""}
function bigMc(c,stat,show){const d=document.createElement("div");d.className="mc";d.style.setProperty("--hc",HT[HEROES[c.h][2]].c);d.innerHTML=mcHTML(c,stat,show);return d}
function friendsGet(){try{return JSON.parse(localStorage.getItem("we-friends")||"{}")}catch(e){return {}}}
function friendsPut(F){try{localStorage.setItem("we-friends",JSON.stringify(F))}catch(e){}}
function openShowcase(F){const m=$("modal"),sh=$("msheet");sh.innerHTML="";m.hidden=false;
  const x=document.createElement("button");x.type="button";x.className="x";x.textContent="Закрыть";x.onclick=closeModal;sh.appendChild(x);
  const w=document.createElement("div");w.className="who";w.innerHTML="<span></span><small></small>";w.children[0].textContent="Витрина: "+F.name;
  w.children[1].textContent="Собрано воинов: "+F.have+" из "+NHEROES+", побед в боях: "+F.wins;sh.appendChild(w);
  const g=document.createElement("div");g.className="show3";F.cards.forEach(c=>{const d=bigMc(c,0);d.querySelector(".v").innerHTML=`<small>${FIN[c.f].k}, ур. ${lvl(c)}</small><b class="num">${fmt(c.v)}</b>`;g.appendChild(d)});
  if(!F.cards.length){const e=document.createElement("div");e.className="mc empty";e.textContent="Пока нет карточек";g.appendChild(e)}sh.appendChild(g);
  if(F.cards.length){const info=document.createElement("div");info.className="box";info.innerHTML="<h3>Вызвать на бой</h3><p>Выбери карточку друга, потом своего воина и характеристику.</p>";
    const pick=document.createElement("div");pick.className="stats5";pick.style.gridTemplateColumns="repeat(3,1fr)";
    F.cards.forEach(c=>{const b=document.createElement("button");b.type="button";b.innerHTML=`${HEROES[c.h][0].replace(/</g,"")}<b class="num">${FIN[c.f].k}</b>`;
      b.onclick=()=>openDuel({name:F.name,card:c,stat:null,cardId:ONLINE?c.id:null,id:ONLINE?"c"+c.id:"v"+c.sn});pick.appendChild(b)});
    info.appendChild(pick);sh.appendChild(info)}
  const fr=friendsGet();fr[F.name]={p:F.p,t:NOW()};friendsPut(fr);renderFriends()}
function openDuel(D){const m=$("modal"),sh=$("msheet");sh.innerHTML="";m.hidden=false;let stat=D.stat===0?1:0,mine=null,busy2=false;
  const x=document.createElement("button");x.type="button";x.className="x";x.textContent="Закрыть";x.onclick=closeModal;sh.appendChild(x);
  const w=document.createElement("div");w.className="who";w.innerHTML="<span></span><small></small>";w.children[0].textContent=D.name+" вызывает тебя!";sh.appendChild(w);
  const rds=document.createElement("div");rds.className="rounds";sh.appendChild(rds);
  const ar=document.createElement("div");ar.className="arena";const left=document.createElement("div"),vs=document.createElement("div"),right=bigMc(D.card,stat);
  left.className="mc empty";left.textContent="Выбери воина внизу";vs.className="vs";vs.textContent="VS";ar.append(left,vs,right);sh.appendChild(ar);
  const bst=document.createElement("div");bst.className="bstatus";sh.appendChild(bst);
  const st=document.createElement("div");st.className="stats5";sh.appendChild(st);
  const go=document.createElement("button");go.type="button";go.className="craftbtn";go.textContent="В бой!";sh.appendChild(go);
  const res=document.createElement("div");res.className="result";sh.appendChild(res);
  const box=document.createElement("div");box.className="box";box.innerHTML='<span class="step">Твои воины</span>';const pk=document.createElement("div");pk.className="pickrow";box.appendChild(pk);sh.appendChild(box);
  function draw(){w.children[1].textContent=D.stat==null?"Три раунда: первый выбираешь ты, второй соперник, третий случайно":"Соперник уже выбрал «"+STN[D.stat]+"» для второго раунда";
    if(!busy2){rds.innerHTML=pipsHTML([stat,D.stat,null],[],0,D.stat!=null?[0,1]:[0]);bst.textContent="Раунд 1: выбери характеристику";right.innerHTML=mcHTML(D.card,stat)}
    st.innerHTML="";STN.forEach((n,i)=>{const b=document.createElement("button");b.type="button";b.setAttribute("aria-pressed",i===stat);b.disabled=D.stat!=null&&i===D.stat;if(b.disabled)b.title="Эту характеристику уже выбрал соперник";
      b.innerHTML=`${n}<b class="num">${mine?eff(mine,i):"—"}</b>`;b.onclick=()=>{if(busy2)return;stat=i;draw()};st.appendChild(b)});
    if(mine&&!busy2){left.className="mc";left.style.setProperty("--hc",HT[HEROES[mine.h][2]].c);left.innerHTML=mcHTML(mine,stat)}
    pk.innerHTML="";S.cards.filter(c=>!away(c)).sort((a,b)=>eff(b,stat)-eff(a,stat)).forEach(c=>{const H=HEROES[c.h],b=document.createElement("button");b.type="button";b.className="pc";b.style.setProperty("--hc",HT[H[2]].c);b.setAttribute("aria-pressed",mine&&c.id===mine.id);
      b.innerHTML=`<span class="pv">${portrait(c.h,c,1)}</span><span></span><span style="color:#5a5f80">${STN[stat]}: ${eff(c,stat)}</span><b>Ур. ${lvl(c)}</b>`;b.children[1].textContent=H[0];b.onclick=()=>{if(busy2)return;mine=c;draw()};pk.appendChild(b)});
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
async function openParam(p){
  if(p.startsWith("u_")){if(!ONLINE){toast("Эта ссылка работает только в игре через Telegram");return}const r=await act("profile",{uid:+p.slice(2)});if(r)openShowcase(Object.assign(r,{p}));return}
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
if(ONLINE)setInterval(()=>{if(S&&!document.hidden)act("sync").then(()=>{updCash();if(!$("sec-shop").hidden&&shView==="sell")renderSell()})},30000);
function lotRow(c,priceHTML,btn){const H=HEROES[c.h],d=document.createElement("div");d.className="lot";d.style.setProperty("--hc",HT[H[2]].c);
  d.innerHTML=`<span class="e">${portrait(c.h,c,1)}</span><span class="t"><b></b>${FIN[c.f].k}${FIN[c.f].run!==Infinity?" "+c.no+"/"+FIN[c.f].run:""}, ур. ${lvl(c)}<br>№ ${fmtSn(c.sn)}${classify(c.sn)?", "+classify(c.sn).k.toLowerCase():""}</span><span class="r">${priceHTML}</span>`;
  d.querySelector("b").textContent=H[0];d.querySelector(".r").appendChild(btn);return d}
async function loadMarket(force){if(mkLoading)return;if(!force&&mkCache&&NOW()-mkAt<15000){drawMarket();return}mkLoading=true;
  if(ONLINE&&!mkCache)$("mk-list").innerHTML='<div class="box"><p>Загружаю лоты…</p></div>';
  const r=await act("market");mkLoading=false;if(!r)return;mkCache=r;mkAt=NOW();drawMarket()}
function drawMarket(){const box=$("mk-list"),M=mkCache||{items:[]};box.innerHTML="";
  $("mk-t").textContent=ONLINE?"Лоты настоящих игроков":"Обновится через "+Math.max(1,Math.ceil((M.next-NOW())/60000))+" мин";
  if(!M.items.length){box.innerHTML='<div class="box"><p>'+(ONLINE?"Пока никто ничего не выставил. Будь первым: выстави свою карточку во вкладке «Продать».":"Всё раскупили. Новые лоты появятся скоро.")+'</p></div>';return}
  M.items.forEach(it=>{const c=it.card,r=it.price/c.v,b=document.createElement("button");b.type="button";b.className="mini2";b.textContent="Купить";
    b.onclick=async()=>{b.disabled=true;const res=await act("buy",{id:it.id,price:it.price});if(!res){b.disabled=false;loadMarket(true);return}
      sfx.coin();hapN("success");if(HEROES[c.h][2]>=3||c.f>=3)burst(3);mkCache.items=mkCache.items.filter(x=>x.id!==it.id);renderAll();toast("Куплено у "+it.seller+": "+HEROES[c.h][0])};
    box.appendChild(lotRow(c,`<b class="num">${fmt(it.price)}</b><small class="${r<1?"cheap":r>1.2?"dear":""}">${r<1?"−"+Math.round((1-r)*100)+"% от оценки":r>1?"+"+Math.round((r-1)*100)+"% к оценке":"по оценке"}</small><small style="color:#5a5f80;font-weight:500"></small>`,b));
    box.lastChild.querySelector(".r small:last-of-type").textContent=it.seller})}
function renderSell(){const lots=$("lots");lots.innerHTML="";const mine=S.cards.filter(c=>c.listed);
  if(!mine.length)lots.innerHTML='<p style="margin:0;color:#5a5f80">Ты ничего не выставил.</p>';
  mine.forEach(c=>{const b=document.createElement("button");b.type="button";b.className="mini2";b.textContent="Снять";
    b.onclick=async()=>{if(await act("unlist",{id:c.id})){renderAll();toast("Снято с продажи")}};
    lots.appendChild(lotRow(c,`<b class="num">${fmt(c.listPrice)}</b><small style="color:#5a5f80">${ONLINE?"ждёт покупателя":"шанс продажи ~"+Math.round(sellChance(c)*100)+"% в минуту"}</small>`,b))});
  const pk=$("sl-pick");pk.innerHTML="";const free=S.cards.filter(c=>!away(c));
  if(!free.length)pk.innerHTML='<p style="margin:0;color:#5a5f80">Нет свободных карточек.</p>';
  free.sort((a,b)=>b.v-a.v).forEach(c=>{const H=HEROES[c.h],b=document.createElement("button");b.type="button";b.className="pc";b.style.setProperty("--hc",HT[H[2]].c);b.setAttribute("aria-pressed",c.id===slPick);
    b.innerHTML=`<span class="pv">${portrait(c.h,c,1)}</span><span></span><span style="color:#5a5f80">${FIN[c.f].k}</span><b class="num">${fmt(c.v)}</b>`;b.children[1].textContent=H[0];
    b.onclick=()=>{slPick=c.id;$("sl-range").value=120;$("sl-price").value=Math.max(1,Math.round(c.v*1.2));renderSell()};pk.appendChild(b)});
  const c=S.cards.find(x=>x.id===slPick&&!away(x)),f=$("sl-form");f.style.display=c?"flex":"none";if(!c)return;
  $("sl-name").textContent=HEROES[c.h][0]+", "+FIN[c.f].k.toLowerCase();$("sl-val").textContent="оценка "+fmt(c.v);sellHint(c)}
function sellHint(c){const pr=+$("sl-price").value||1,tmp={listPrice:pr,v:c.v};
  $("sl-hint").textContent="Получишь "+fmt(pr*(1-FEE))+" после комиссии 5%."+(ONLINE?" Купит тот, кому понравится цена.":" Шанс продажи примерно "+Math.round(sellChance(tmp)*100)+"% в минуту.")+" Быстрая продажа без рынка: "+fmt(c.v*QUICK)+"."}
$("sl-range").oninput=()=>{const c=S.cards.find(x=>x.id===slPick);if(!c)return;$("sl-price").value=Math.max(1,Math.round(c.v*$("sl-range").value/100));sellHint(c)};
$("sl-price").oninput=()=>{const c=S.cards.find(x=>x.id===slPick);if(!c)return;$("sl-range").value=Math.round((+$("sl-price").value||0)/c.v*100);sellHint(c)};
$("sl-go").onclick=async()=>{const c=S.cards.find(x=>x.id===slPick&&!away(x));if(!c)return;const pr=Math.max(1,Math.round(+$("sl-price").value||0));
  const r=await act("list",{id:c.id,price:pr});if(!r)return;if(current&&current.id===c.id){current=null;$("sell").disabled=true}slPick=null;sfx.lock();renderAll();toast("Выставлено за "+fmt(pr))};

/* ---------- лавка: на что тратить деньги ---------- */
let lvPick=null,lvFrame="bronze";
function renderLavka(){const c=S.cards.find(x=>x.id===lvPick);
  $("lv-train").textContent=c?(lvl(c)>=LMAX?"Максимум":"Тренировать за "+fmt(trainCost(c))):"Выбери воина";$("lv-train").disabled=!c||lvl(c)>=LMAX;
  $("lv-train-t").textContent=c?HEROES[c.h][0]+", уровень "+lvl(c)+(lvlNext(c)?", опыт "+(c.xp||0)+" из "+lvlNext(c):""):"Выбери воина ниже: +50 опыта за деньги";
  const B=bossS();$("lv-rage").disabled=(B.extra||0)>=2;$("lv-rage").textContent=(B.extra||0)>=2?"Лимит на сегодня":"Купить за $150";
  $("lv-map").disabled=S.mapDay===todayL();$("lv-map").textContent=S.mapDay===todayL()?"Уже куплена":"Купить за $120";
  const fr=$("lv-frames");fr.innerHTML="";Object.entries(FRAMES).forEach(([k,F])=>{const b=document.createElement("button");b.type="button";b.style.setProperty("--fb",F.bg);b.setAttribute("aria-pressed",k===lvFrame);
    b.innerHTML=`<i></i><span><b></b><br>${fmt(F.cost)}</span>`;b.querySelector("b").textContent=F.k;b.onclick=()=>{lvFrame=k;renderLavka()};fr.appendChild(b)});
  $("lv-fgo").disabled=!c;$("lv-fgo").textContent=c?(c.frame===lvFrame?"Эта рамка уже надета":"Надеть рамку «"+FRAMES[lvFrame].k+"» за "+fmt(FRAMES[lvFrame].cost)):"Выбери воина внизу";
  const pk=$("lv-pick");pk.innerHTML="";S.cards.filter(x=>!x.listed).sort((a,b)=>b.v-a.v).forEach(x=>{const H=HEROES[x.h],b=document.createElement("button");b.type="button";b.className="pc";b.style.setProperty("--hc",HT[H[2]].c);b.setAttribute("aria-pressed",x.id===lvPick);
    b.innerHTML=`<span class="pv">${portrait(x.h,x,1)}</span><span></span><span style="color:#5a5f80">Ур. ${lvl(x)}</span><b>${x.frame?FRAMES[x.frame].k:FIN[x.f].k}</b>`;b.children[1].textContent=H[0];b.onclick=()=>{lvPick=x.id;renderLavka()};pk.appendChild(b)});}
$("lv-train").onclick=async()=>{if(await act("train",{id:lvPick})){sfx.coin();updCash();renderLavka();toast("Тренировка: +50 опыта")}};
$("lv-rage").onclick=async()=>{if(await act("rage")){sfx.coin();updCash();renderLavka();toast("Зелье выпито: +1 удар по боссу сегодня")}};
$("lv-map").onclick=async()=>{if(await act("map")){sfx.coin();updCash();renderLavka();toast("Открыто 4-е место для походов")}};
$("lv-fgo").onclick=async()=>{const c=S.cards.find(x=>x.id===lvPick);if(!c)return;if(await act("frame",{id:c.id,frame:lvFrame})){sfx.coin();burst(2);updCash();renderLavka();toast("Рамка «"+FRAMES[lvFrame].k+"» надета на "+HEROES[c.h][0])}};
document.querySelectorAll("#sh-seg button").forEach(b=>b.onclick=()=>{shView=b.dataset.v;renderShop()});
function renderShop(){document.querySelectorAll("#sh-seg button").forEach(b=>b.setAttribute("aria-pressed",b.dataset.v===shView));
  ["buy","sell","lavka"].forEach(v=>$("sh-"+v).style.display=v===shView?"flex":"none");
  if(shView==="buy")loadMarket();if(shView==="sell")renderSell();if(shView==="lavka")renderLavka()}

/* ---------- вкладки ---------- */
function setTab(t){["spin","duel","album","craft","shop","col"].forEach(k=>{$("tab-"+k).setAttribute("aria-selected",k===t);$("sec-"+k).hidden=k!==t});renderAll();scrollTo(0,0)}
$("tab-spin").onclick=()=>setTab("spin");$("tab-album").onclick=()=>setTab("album");$("tab-col").onclick=()=>setTab("col");$("tab-craft").onclick=()=>setTab("craft");$("tab-duel").onclick=()=>setTab("duel");$("tab-shop").onclick=()=>setTab("shop");
function updCash(){if(S)$("cash").textContent=fmt(S.cash)}
function renderAll(){if(!S)return;updCash();if(!$("sec-album").hidden)renderAlbum();if(!$("sec-col").hidden)renderCol();if(!$("sec-craft").hidden&&!crBusy)renderCraft();if(!$("sec-duel").hidden)renderBattle();if(!$("sec-shop").hidden&&!(document.activeElement&&document.activeElement.tagName==="INPUT"))renderShop();if(!$("sec-album").hidden){renderAch();renderShow();renderFriends()}if(!$("sec-col").hidden)renderMerge();renderTasks();renderFree();renderStreak();$("topup").hidden=ONLINE&&!S.test}
const TQ=[];let tBusy=false;
function toast(t){TQ.push(t);if(!tBusy)nextToast()}
function nextToast(){const t=TQ.shift();const e=$("toast");if(t==null){tBusy=false;return}tBusy=true;e.textContent=t;e.classList.add("show");setTimeout(()=>{e.classList.remove("show");setTimeout(nextToast,250)},TQ.length?1400:2200)}

/* ---------- запуск ---------- */
const sample={id:0,h:19,f:2,no:37,sn:"123321",hue:0,v:1236,stats:[331,352,296,348,361]};
showCard(sample);$("p-lbl").textContent="Пример карточки. Нажми «Открыть»";$("sell").disabled=true;
$("open").addEventListener("click",()=>{$("p-lbl").textContent="Цена карточки"},{once:true});
$("stage").addEventListener("click",()=>{$("p-lbl").textContent="Цена карточки"},{once:true});
(async function start(){
  if(ONLINE){$("free-t").textContent="Подключаюсь к серверу…";const r=await act("sync");if(!r){$("free-t").textContent="Сервер недоступен. Закрой игру и открой снова";return}}
  else{S=loadLocal();touch(S,NOW());save()}
  renderAll();handleStart();
})();

