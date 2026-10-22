/* game.js — интерфейс «Воинов Эпох». Правила игры лежат в rules.js. */

/* ---------- настройки ---------- */
const API_URL="https://77-221-147-102.sslip.io";                              // адрес сервера, например https://voiny-epoh.твоё-имя.workers.dev (пусто = игра без сервера)
const BOT_LINK="https://t.me/VoinyEpohBot";   // ссылка на бота, например https://t.me/VoinyEpohBot
const CHANNEL="voinyepoh";                     // канал игры, бот должен быть в нём администратором
const PAGE_URL="https://prostovladon-prog.github.io/kruti-kvartiru-/";

const $=id=>document.getElementById(id);
const fmt=n=>{n=+n||0;if(Math.abs(n)<100&&Math.abs(n-Math.round(n))>.004)return "$"+n.toFixed(2).replace(".",",");return "$"+Math.round(n).toLocaleString("ru-RU").replace(/[\u00a0\u202f,]/g," ")};
/* коротко для тесных мест: $12 345, $1,49 млн, $33,2 млн, $1,2 млрд */
const fmtC=n=>{n=+n||0;const a=Math.abs(n),k=(v,u)=>"$"+(v<10?v.toFixed(2):v<100?v.toFixed(1):Math.round(v)).replace(".",",").replace(/,?0+$/,m=>m.includes(",")&&/,\d*[1-9]/.test(m)?m:"")+" "+u;
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
    news();fightNews();chatDot();return out;
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
function fillFace(root,c){
  const q=s=>root.querySelector(s),H=HEROES[c.h],T=HT[H[2]],F=FIN[c.f],st=c.stars||0;
  root.className="face front "+F.cls+(st?" star"+st:"");root.style.setProperty("--hc",T.c);
  root.style.removeProperty("--edge");if(c.frame&&FRAMES[c.frame])root.dataset.frame=c.frame;else delete root.dataset.frame;
  q(".top b").textContent=H[0];q(".top span").textContent="№ "+String(c.h+1).padStart(2,"0")+"/"+NHEROES;
  q(".hero").innerHTML=portrait(c.h,c);q(".era").textContent=H[1];q(".tier").textContent=T.k;
  const pw=q(".power");pw.textContent=H[3];if(st>=3){const eb=document.createElement("b");eb.textContent="«"+epithet(c)+"» ";pw.prepend(eb)}
  q(".stats").innerHTML=["Атака","Броня","Скорость","Выносливость","Боевой дух"].map((n,i)=>`<span>${n}</span><span class="num">${c.stats?eff(c,i):"?"}</span>`).join("");
  const lb=q(".lvl");lb.hidden=lvl(c)<=1;lb.textContent="Ур. "+lvl(c);
  q(".finish").textContent=F.k+(F.run===Infinity?"":" "+c.no+"/"+F.run);
  const sn=c.sn||"482913",cl=classify(sn),se=q(".foot .sn");
  se.innerHTML="<small>№</small>"+fmtSn(sn);se.classList.toggle("nice",!!cl);
  const rb=q(".ribbon");rb.hidden=!cl;if(cl)rb.textContent=cl.k+", ×"+cl.m;
  q(".foot b").textContent=fmt(c.v);
  const art=q(".art");
  let sb=q(".stars");if(!sb){sb=document.createElement("div");sb.className="stars";art.appendChild(sb)}
  sb.hidden=!st;sb.innerHTML="★".repeat(st)+"<i>"+"★".repeat(STAR_MAX-st)+"</i>";
  root.style.clipPath=c.f===4?tornPoly(sn):"";
  root.querySelectorAll(".tear,.brak").forEach(e=>e.remove());if(c.f===4)q(".in").insertAdjacentHTML("beforeend",tearSVG(sn));
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
function showCard(c){fillFace(front,c);$("p-val").textContent=fmt(c.v);$("sell-v").textContent=fmt(c.v*QUICK)}
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
  if((S.spins??0)<=0&&!(S.refillAt&&NOW()>=S.refillAt)){toast("Прокрутки закончились. Новые через "+leftTxt());return}
  busy=true;ac();$("p-lbl").textContent="Цена карточки";
  if(onbStep===0)onbClear();
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
$("open").onclick=()=>open();$("stage").onclick=()=>open();
$("stage").onkeydown=e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();open()}};
$("sell").onclick=async()=>{if(!current||busy)return;if(!S.cards.some(x=>x.id===current.id)){toast("Эта карточка уже не у тебя");return}
  if(current.v>=500&&!(await confirmSell(current)))return;
  const r=await act("sell",{id:current.id});if(!r)return;toast("Продано за "+fmt(r.got));current=null;$("sell").disabled=true;renderAll()};


/* ---------- album ---------- */
function renderAlbum(){
  const box=$("album");box.innerHTML="";let have=0;
  HEROES.forEach((H,i)=>{
    const mine=S.cards.filter(c=>c.h===i),got=mine.length>0;if(got)have++;
    const d=document.createElement("div");d.className="slot "+(got?"have":"empty");d.style.setProperty("--hc",HT[H[2]].c);
    const fins=[...new Set(mine.map(c=>c.f))].sort();
    if(got){const best=[...mine].sort((a,b)=>b.v-a.v)[0];d.innerHTML=miniSlot(best)+(mine.length>1?`<span class="cnt">×${mine.length}</span>`:"");d.onclick=()=>openCardView(best,{mine:true});box.appendChild(d);return}
    d.innerHTML=`<span class="n">${String(i+1).padStart(2,"0")}</span><span class="e">${portrait(i,null,1)}</span><small></small>`;
    d.querySelector("small").textContent="???";box.appendChild(d)});
  $("al-n").textContent=have+" из "+NHEROES;$("al-bar").style.width=have/NHEROES*100+"%";
}

/* ---------- collection ---------- */
function renderCol(){
  const box=$("col");box.innerHTML="";box.className="cgrid";
  $("col-n").textContent=S.cards.length+" из "+CAP+" мест, на "+fmt(S.cards.reduce((a,c)=>a+c.v,0));
  if(!S.cards.length){box.className="list";box.innerHTML='<div class="empty-msg">Тут пока пусто. Открой первую карточку на вкладке «Крутить»</div>';return}
  [...S.cards].sort((a,b)=>b.v-a.v).forEach(c=>{
    const el=document.createElement("div");el.className="ctile";
    el.innerHTML=`<button type="button" class="cbtn" aria-label="Рассмотреть карточку">${miniSlot(c)}</button><div class="cr"><b class="num">${fmtC(c.v)}</b><button type="button" class="mini sellx" aria-label="Продать за ${fmt(c.v*QUICK)}" title="Продать">🗑</button></div>`;
    el.querySelector(".cbtn").setAttribute("aria-label",HEROES[c.h][0]+", рассмотреть и закалить");
    el.querySelector(".cbtn").onclick=()=>openCardView(c,{mine:true});
    const m=el.querySelector(".mini");
    if(away(c)){m.disabled=true;m.textContent=c.listed?"🏷":"🧭";m.title=c.listed?"На рынке":"В походе";m.setAttribute("aria-label",m.title)}
    else if(FIN[c.f].excl){m.disabled=true;m.textContent="🏆";m.title="Трофей";m.setAttribute("aria-label","Трофей")}
    if(canForge(c)){const fb=document.createElement("span");fb.className="forgeb";fb.textContent="⭐ Можно закалить";el.querySelector(".cbtn").appendChild(fb)}
    m.onclick=async()=>{if(!(await confirmSell(c)))return;const r=await act("sell",{id:c.id});if(!r)return;if(current&&current.id===c.id){current=null;$("sell").disabled=true}renderAll();toast("Продано за "+fmt(r.got))};
    box.appendChild(el)});
}
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
    t.children[1].textContent=(o.owner?"Владелец: "+o.owner+". ":"")+FIN[cur.f].k+(FIN[cur.f].run!==Infinity?", "+cur.no+" из "+FIN[cur.f].run:"")+", № "+fmtSn(cur.sn)+(cl?" ("+cl.k.toLowerCase()+")":"")+". Таких больше нет ни у кого.";
    info.appendChild(t);
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
function crChance(){const t=targetPrice(crH,crF),sum=crSum();if(!sum)return 0;const amu=$("cr-amu")&&$("cr-amu").checked?.1:0;return Math.min(PMAX+amu,HOUSE*sum/t+amu)}
function arcPath(p){if(p<=0)return "";if(p>=.9999)return "M100 8 A92 92 0 1 1 99.99 8 Z";
  const a=p*2*Math.PI,x=100+92*Math.sin(a),y=100-92*Math.cos(a);return `M100 100 L100 8 A92 92 0 ${p>.5?1:0} 1 ${x.toFixed(2)} ${y.toFixed(2)} Z`}
function renderCraft(){
  // inputs
  for(const id of [...crSel])if(!S.cards.some(c=>c.id===id))crSel.delete(id);
  const pk=$("cr-pick");pk.innerHTML="";
  if(!S.cards.length){pk.innerHTML='<p style="margin:0;color:#5a5f80">В коллекции пусто. Открой несколько карточек на вкладке «Крутить».</p>'}
  [...S.cards].filter(c=>!away(c)&&!FIN[c.f].excl).sort((a,b)=>b.v-a.v).forEach(c=>{
    const H=HEROES[c.h],b=document.createElement("button");b.type="button";b.className="pc";b.style.setProperty("--hc",HT[H[2]].c);
    b.setAttribute("aria-pressed",crSel.has(c.id));
    b.innerHTML=`<span class="pv">${miniSlot(c)}</span><span></span><span style="color:#5a5f80">${FIN[c.f].k}</span><b class="num">${fmt(c.v)}</b>`;
    b.children[1].textContent=H[0];
    b.onclick=()=>{if(crBusy)return;crLast=null;if(crSel.has(c.id))crSel.delete(c.id);else{if(crSel.size>=5){toast("Можно отдать максимум 5 карточек");return}crSel.add(c.id)}renderCraft()};
    pk.appendChild(b)});
  $("cr-sum").textContent=fmt(crSum());
  $("cr-hint").textContent=crSel.size?"Выбрано "+crSel.size+" из 5":"Выбери от 1 до 5 карточек из коллекции.";
  // target finishes
  const fb=$("cr-fins");fb.innerHTML="";
  FIN.forEach((F,i)=>{if(F.excl)return;const b=document.createElement("button");b.type="button";b.textContent=F.k;b.setAttribute("aria-pressed",i===crF);
    b.onclick=()=>{if(crBusy)return;crF=i;renderCraft()};fb.appendChild(b)});
  const tg=$("cr-tgt");tg.innerHTML="";
  HEROES.forEach((H,i)=>{const b=document.createElement("button");b.type="button";b.className="tg2";b.style.setProperty("--hc",HT[H[2]].c);
    b.setAttribute("aria-pressed",i===crH);b.setAttribute("aria-label",H[0]);b.title=H[0];b.innerHTML=portrait(i,null,1);
    b.onclick=()=>{if(crBusy)return;crH=i;renderCraft()};tg.appendChild(b)});
  const sel=tg.querySelector('[aria-pressed="true"]');if(sel&&!tg.dataset.scrolled){tg.dataset.scrolled="1";requestAnimationFrame(()=>{tg.scrollLeft=sel.offsetLeft-tg.clientWidth/2+sel.clientWidth/2})}
  const F=FIN[crF],left=F.run===Infinity?Infinity:F.run-issuedOfUI(crH,crF);
  $("cr-tname").innerHTML="";const nb=document.createElement("b");nb.textContent=HEROES[crH][0]+", "+F.k.toLowerCase();$("cr-tname").appendChild(nb);
  const mineT=S.cards.some(c=>c.h===crH&&c.f===crF);
  $("cr-trun").textContent=left===Infinity?HT[HEROES[crH][2]].k:(left>0?"осталось "+left+" из "+F.run:mineT?"единственная уже у тебя":"все "+F.run+" уже у игроков");
  const tv=targetPrice(crH,crF);$("cr-tv").textContent=fmt(tv);
  // wheel
  let p=left>0?crChance():0;const showLast=!crSel.size&&crLast!=null;if(showLast)p=crLast;
  $("cr-f1").textContent=showLast?"—":fmt(crSum());$("cr-f2").textContent=fmt(tv);
  $("cr-arc").setAttribute("d",arcPath(p));
  $("cr-p").textContent=(p*100<1&&p>0?"<1":Math.round(p*100))+"%";
  $("cr-amu-t").textContent="Амулет удачи: +10% к шансу за "+fmt(amuCost(crH,crF));
  const go=$("cr-go");go.disabled=crBusy||!crSel.size||left<=0||crChance()<=0;
  go.textContent=left<=0?(mineT&&F.run===1?"Эта карточка уже у тебя":"Все "+F.run+" уже выпали"):!crSel.size?"Выбери карточки":"Крутить колесо, шанс "+$("cr-p").textContent;
  if(!crBusy&&crSel.size&&HOUSE*crSum()/tv>PMAX)$("cr-res").textContent="Больше 80% шанса не бывает. Выбери цель подороже или отдай меньше.";
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
  const n=S.spins??0,cap=spinCap(S);$("free-n").textContent=n<=cap?n+"/"+cap:String(n);$("open-n").textContent=n>0?"осталось "+n:"через "+leftTxt();
  const pw=cap>=5?"бесплатных прокруток":"бесплатные прокрутки";$("free-t").textContent=!S.refillAt?"Каждые 4 часа даётся "+cap+" "+pw+(cap>SPINS_MAX?" 👑":""):"Новые "+cap+" "+(cap>=5?"прокруток":"прокрутки")+" через "+leftTxt();$("open").classList.toggle("empty",n<=0);renderPromo()}
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
  [...S.cards].filter(c=>!away(c)&&!FIN[c.f].excl).sort((a,b)=>eff(b,duStat)-eff(a,duStat)).forEach(c=>{
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
  S.cards.forEach(c=>{if(c.f<4&&!away(c)){const k=c.h+"-"+c.f;(g[k]=g[k]||[]).push(c)}});
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
function renderBattle(){document.querySelectorAll("#bt-seg button").forEach(b=>b.setAttribute("aria-pressed",b.dataset.v===btView));
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
async function loadArena(){arListAt=NOW();const r=await act("arena_list");if(!r)return;arList=r;if(r.mine&&!arRoom){arOpen(r.mine);return}if(arVisible()&&!arRoom)drawLobby()}
setInterval(()=>{if(arVisible()&&!arRoom&&!document.hidden)loadArena()},6000);
function drawLobby(){
  const pk=$("ar-pick");pk.innerHTML="";const free=S.cards.filter(c=>!away(c)&&!FIN[c.f].excl).sort((a,b)=>b.v-a.v);
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
  const list=S.cards.filter(c=>!away(c)&&!FIN[c.f].excl&&(!r.mode||(c.v>=hc.v*.5&&c.v<=hc.v*2))).sort((a,b)=>b.v-a.v);
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
  S.cards.filter(c=>!away(c)&&!squad.includes(c.id)&&!FIN[c.f].excl).sort((a,b)=>eff(b,0)-eff(a,0)).forEach(c=>{const H=HEROES[c.h],b=document.createElement("button");b.type="button";b.className="pc";b.style.setProperty("--hc",HT[H[2]].c);
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
function closeModal(){$("modal").hidden=true;$("msheet").innerHTML="";if(chatOpen){chatOpen=false;clearInterval(chatTimer)}}
function bigMc(c,stat,show){const d=document.createElement("div");d.className="mc";d.style.setProperty("--hc",HT[HEROES[c.h][2]].c);d.innerHTML=mcHTML(c,stat,show);return d}
function friendsGet(){try{return JSON.parse(localStorage.getItem("we-friends")||"{}")}catch(e){return {}}}
function friendsPut(F){try{localStorage.setItem("we-friends",JSON.stringify(F))}catch(e){}}
function openShowcase(F){const m=$("modal"),sh=$("msheet");sh.innerHTML="";m.hidden=false;
  const x=document.createElement("button");x.type="button";x.className="x";x.textContent="Закрыть";x.onclick=closeModal;sh.appendChild(x);
  const w=document.createElement("div");w.className="who";w.innerHTML="<span></span><small></small>";w.children[0].textContent="Витрина: "+(F.vip?"👑 ":"")+(F.pi?"🏅 ":"")+F.name;
  w.children[1].textContent="Собрано воинов: "+F.have+" из "+NHEROES+", побед в боях: "+F.wins;sh.appendChild(w);
  const g=document.createElement("div");g.className="show3";F.cards.forEach(c=>{const d=bigMc(c,0);d.querySelector(".v").innerHTML=`<small>${FIN[c.f].k}, ур. ${lvl(c)}</small><b class="num">${fmt(c.v)}</b>`;g.appendChild(d)});
  if(!F.cards.length){const e=document.createElement("div");e.className="mc empty";e.textContent="Пока нет карточек";g.appendChild(e)}sh.appendChild(g);
  if(F.cards.length){const info=document.createElement("div");info.className="box";info.innerHTML="<h3>Вызвать на бой</h3><p>Выбери карточку друга, потом своего воина и характеристику.</p>";
    const pick=document.createElement("div");pick.className="stats5";pick.style.gridTemplateColumns="repeat(3,1fr)";
    F.cards.forEach(c=>{if(FIN[c.f]&&FIN[c.f].excl)return;const b=document.createElement("button");b.type="button";b.innerHTML=`${HEROES[c.h][0].replace(/</g,"")}<b class="num">${FIN[c.f].k}</b>`;
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
    pk.innerHTML="";S.cards.filter(c=>!away(c)&&!FIN[c.f].excl).sort((a,b)=>eff(b,stat)-eff(a,stat)).forEach(c=>{const H=HEROES[c.h],b=document.createElement("button");b.type="button";b.className="pc";b.style.setProperty("--hc",HT[H[2]].c);b.setAttribute("aria-pressed",mine&&c.id===mine.id);
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
  $("ref-t").textContent=ONLINE?"+10 прокруток за каждого друга, который зайдёт по твоей ссылке. Приглашено: "+(S.refs||0)+", получено "+(S.refs||0)*10+" прокруток":"+10 прокруток за каждого друга. Работает в игре через бота @VoinyEpohBot"}
$("sub-go").onclick=async()=>{
  if(!subStep){subStep=1;const u="https://t.me/"+CHANNEL;if(tg&&tg.openTelegramLink)tg.openTelegramLink(u);else window.open(u,"_blank");renderBonus();return}
  const r=await act("sub_check");if(!r){renderBonus();return}sfx.coin();hapN("success");burst(2);renderAll();toast("Спасибо за подписку! +10 прокруток")};
/* история в Telegram: открываем редактор с готовой картинкой и личной ссылкой, затем забираем награду */
let storyStep=0;
/* ---------- напоминания от бота ----------
   Telegram разрешает боту писать только тем, кто согласился. Спрашиваем, когда кончились прокрутки: тогда это реально полезно. */
const canPmAsk=()=>ONLINE&&!S.pm&&tg&&tg.requestWriteAccess&&(!tg.isVersionAtLeast||tg.isVersionAtLeast("6.9"));
function renderPm(){const row=$("pm-row");if(row)row.hidden=!canPmAsk()}
function enablePm(){if(!canPmAsk())return;try{tg.requestWriteAccess(ok=>{if(ok){act("pm_on").then(()=>{S.pm=1;renderPm();toast("🔔 Напоминания включены! Бот напишет, когда прокрутки будут готовы")})}else toast("Без разрешения бот не сможет напомнить о прокрутках")})}catch(e){}}
$("pm-go").onclick=enablePm;
function askPm(){if(!canPmAsk()||!$("modal").hidden)return;let asked=null;try{asked=localStorage.getItem("we-pm-ask")}catch(e){}if(asked)return;try{localStorage.setItem("we-pm-ask","1")}catch(e){}
  const m=$("modal"),sh=$("msheet");sh.innerHTML="";m.hidden=false;
  sh.innerHTML='<div class="box nickbox"><h3>🔔 Напомнить о прокрутках?</h3><p>Новые 3 прокрутки будут через 4 часа. Бот напишет, когда они будут готовы, а ещё если кто-то нападёт на твоих воинов или купит твою карточку. Ночью не пишет.</p><button type="button" class="craftbtn" id="pm-yes">Да, напоминать</button><button type="button" class="ghost" id="pm-no">Не надо</button></div>';
  $("pm-yes").onclick=()=>{closeModal();enablePm()};$("pm-no").onclick=closeModal}

/* ---------- подсказка про закалку ---------- */
const canForge=c=>!FIN[c.f].excl&&(c.stars||0)<STAR_MAX&&lvl(c)>=STAR_LVL[c.stars||0];
function forgeHint(){if(!S||onbStep>=0||!$("modal").hidden||$("onb"))return;let shown=null;try{shown=localStorage.getItem("we-forge-hint")}catch(e){}if(shown)return;
  if(S.cards.some(c=>c.stars))return;const c=S.cards.find(canForge);if(!c)return;try{localStorage.setItem("we-forge-hint","1")}catch(e){}
  const el=$("tab-col");el.classList.add("onb-hl");const b=document.createElement("div");b.id="onb";b.className="onb";
  b.innerHTML='<div class="onb-n">Новое</div><p></p><div class="onb-b"><button type="button" class="mini2" id="fh-go">Показать</button><button type="button" class="ghost" id="fh-no">Потом</button></div>';
  b.querySelector("p").textContent="⭐ "+HEROES[c.h][0]+" дорос до "+lvl(c)+" уровня! Его можно закалить: +10% к силе, цена ×1,3 и новый вид карточки. Закалка во вкладке «Мои»: нажми на карточку.";
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
    box.appendChild(lotRow(c,`<b class="num">${fmtC(it.price)}</b><small class="${r<1?"cheap":r>1.2?"dear":""}">${r<1?"−"+Math.round((1-r)*100)+"% от оценки":r>1?"+"+Math.round((r-1)*100)+"% к оценке":"по оценке"}</small><small style="color:#5a5f80;font-weight:500"></small>`,b));
    box.lastChild.querySelector(".r small:last-of-type").textContent=it.seller})}
function renderSell(){const lots=$("lots");lots.innerHTML="";const mine=S.cards.filter(c=>c.listed);
  if(!mine.length)lots.innerHTML='<p style="margin:0;color:#5a5f80">Ты ничего не выставил.</p>';
  mine.forEach(c=>{const b=document.createElement("button");b.type="button";b.className="mini2";b.textContent="Снять";
    b.onclick=async()=>{if(await act("unlist",{id:c.id})){renderAll();toast("Снято с продажи")}};
    lots.appendChild(lotRow(c,`<b class="num">${fmtC(c.listPrice)}</b><small style="color:#5a5f80">${ONLINE?"ждёт покупателя":"шанс продажи ~"+Math.round(sellChance(c)*100)+"% в минуту"}</small>`,b))});
  const pk=$("sl-pick");pk.innerHTML="";const free=S.cards.filter(c=>!away(c));
  if(!free.length)pk.innerHTML='<p style="margin:0;color:#5a5f80">Нет свободных карточек.</p>';
  free.sort((a,b)=>b.v-a.v).forEach(c=>{const H=HEROES[c.h],b=document.createElement("button");b.type="button";b.className="pc";b.style.setProperty("--hc",HT[H[2]].c);b.setAttribute("aria-pressed",c.id===slPick);
    b.innerHTML=`<span class="pv">${miniSlot(c)}</span><span></span><span style="color:#5a5f80">${FIN[c.f].k}</span><b class="num">${fmt(c.v)}</b>`;b.children[1].textContent=H[0];
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
function renderShop(){document.querySelectorAll("#sh-seg button").forEach(b=>b.setAttribute("aria-pressed",b.dataset.v===shView));
  ["buy","sell","lavka"].forEach(v=>$("sh-"+v).style.display=v===shView?"flex":"none");
  if(shView==="buy")loadMarket();if(shView==="sell")renderSell();if(shView==="lavka")renderLavka()}

/* ---------- мировой топ ----------
   С сервером это настоящие игроки. Без сервера показываем пример с ботами. */
let tpView="worth";const tpCache={};let tpLoading={};
const TP={worth:{t:"Самые богатые коллекции",u:v=>fmt(v)},cards:{t:"Самые дорогие карточки в мире",u:v=>fmt(v)},album:{t:"Больше всего разных воинов",u:v=>v+" из "+NHEROES},wins:{t:"Больше всего побед в боях",u:v=>fmtN(v)+" побед"}};
Object.assign(LOCAL,{nick(p){const n=checkNick(p.nick);if(n===S.nick)throw new GameError("Это уже твой ник");
  if(SELLERS.some(x=>x.toLowerCase()===n.toLowerCase()))throw new GameError("Ник «"+n+"» уже занят. Придумай другой");
  const cost=S.nick?NICK_COST:0;if(S.cash<cost)throw new GameError("Смена ника стоит $"+cost+", не хватает денег");S.cash-=cost;S.nick=n;return {nick:n,cost}},
 top(p){const k=p.kind,R=rng(snHash(todayL()+k)),names=SELLERS.slice().sort(()=>R()-.5);
  const fake=(h,f)=>{const c=phantom(h,f);c.sn=String(Math.floor(R()*1e6)).padStart(6,"0");c.no=1+Math.floor(R()*Math.min(FIN[f].run,999));c.stars=f>=2&&R()<.5?1+Math.floor(R()*4):0;c.id="b"+Math.floor(R()*1e9);return c};
  const bestH=()=>{const hs=HEROES.map((H,i)=>i).filter(i=>HEROES[i][2]>=2);return hs[Math.floor(R()*hs.length)]};
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
  $("nk-later").onclick=()=>{if(first)try{localStorage.setItem("we-nick-ask",todayL())}catch(e){}closeModal()};
  inp.oninput=()=>{try{checkNick(inp.value);err.textContent=""}catch(e){err.textContent=inp.value.length>=3?e.message:""}};
  const send=async()=>{try{checkNick(inp.value)}catch(e){err.textContent=e.message;return}go.disabled=true;
    const r=await act("nick",{nick:inp.value});go.disabled=false;if(!r)return;
    Object.keys(tpCache).forEach(k=>delete tpCache[k]);closeModal();sfx.coin();hapN("success");renderAll();toast("Теперь ты «"+r.nick+"»")};
  go.onclick=send;inp.onkeydown=e=>{if(e.key==="Enter")send()};setTimeout(()=>inp.focus(),50)}
$("nick-go").onclick=()=>openNick(false);
function askNick(){if(!S||S.nick)return;let last=null;try{last=localStorage.getItem("we-nick-ask")}catch(e){}if(last===todayL())return;openNick(true)}

async function loadTop(kind,force){const c=tpCache[kind];if(!force&&c&&NOW()-c.at<30000)return c.r;if(tpLoading[kind])return null;tpLoading[kind]=1;
  const r=await act("top",{kind});tpLoading[kind]=0;if(r)tpCache[kind]={at:NOW(),r};return r}
function ago(t){const m=Math.max(1,Math.round((NOW()-t)/60000));return m<60?m+" мин назад":m<1440?Math.round(m/60)+" ч назад":Math.round(m/1440)+" дн назад"}
function topRow(it,i,kind){const c=it.card,d=document.createElement("button");d.type="button";d.className="trow"+(it.me||(ONLINE&&it.uid===S.uid)?" me":"")+(i<3?" p"+(i+1):"");
  d.innerHTML=`<span class="rk">${i<3?["🥇","🥈","🥉"][i]:i+1}</span><span class="e"></span><span class="t"><b></b><small></small></span><span class="sc num"></span>`;
  d.querySelector("b").textContent=(it.pi?"🏅 ":"")+it.name;if(it.vip||(it.me&&isVip())){d.classList.add("vipr");d.querySelector("b").insertAdjacentHTML("afterbegin",'<span class="vipb">VIP</span> ')}d.querySelector(".sc").textContent=kind==="worth"||kind==="cards"?fmtC(it.score):TP[kind].u(it.score);
  if(c){const e=d.querySelector(".e");e.style.setProperty("--hc",HT[HEROES[c.h][2]].c);e.innerHTML=miniSlot(c);
    d.querySelector("small").textContent=(kind==="cards"?"":"Лучшая: ")+HEROES[c.h][0]+((c.stars||0)?" ★"+c.stars:"")+", "+FIN[c.f].k.toLowerCase()}
  d.onclick=()=>{if(kind!=="cards"&&ONLINE&&it.uid&&it.uid!==S.uid){openParam("u_"+it.uid);return}if(c)openCardView(c,{owner:it.name,mine:ONLINE?it.uid===S.uid:!!it.me})};return d}
/* ---------- статистика для администратора (видит только он) ---------- */
let stAt=0,stData=null;
const pct=(a,b)=>b?Math.round(a/b*100)+"%":"—";
async function loadStats(force){if(!S.admin||!ONLINE)return;if(!force&&stData&&NOW()-stAt<60000){drawStats();return}
  const r=await act("stats");if(!r)return;stData=r;stAt=NOW();drawStats()}
function drawStats(){const R=stData,b=$("st-body");if(!R)return;
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
  while(!done&&guard++<200){$("bc-res").textContent="Отправляю… "+sent;const r=await act("broadcast",{text,after});if(!r)break;sent+=r.sent;total=r.total;after=r.last;done=r.done}
  b.disabled=false;$("bc-res").textContent=done?"Готово: доставлено "+sent+" из "+total+" (остальные заблокировали бота)":"Рассылка прервалась на "+sent+", нажми ещё раз";if(done)$("bc-text").value=""};
function renderAdmin(){renderAdminPromo();const sb=$("admin-stats");sb.hidden=!(S.admin&&ONLINE);if(S.admin&&ONLINE)loadStats();
  const box=$("admin-box");box.hidden=!S.admin;if(!S.admin)return;const on=(S.luckUntil||0)>NOW();
  $("luck-t").textContent=on?"Включён ещё "+tleft(S.luckUntil-NOW())+". Выпадают легендарные и мифические воины, дорогие отделки и красивые номера. Видишь эту панель только ты.":"Выключен. На 3 часа делает прокрутки на твоём аккаунте очень удачными. Проданные карточки потом вернутся в общий пул.";
  $("luck-go").textContent=on?"Выключить":"Включить на 3 часа";$("luck-go").style.background=on?"var(--red)":""}
$("luck-go").onclick=async()=>{const on=!((S.luckUntil||0)>NOW());const r=await act("luck_set",{on});if(r){renderAdmin();toast(on?"Режим удачи включён на 3 часа":"Режим удачи выключен")}};
async function renderTop(force){renderAdmin();$("my-nick").textContent=S.nick||"не выбран";$("nick-go").textContent=S.nick?"Сменить":"Выбрать";document.querySelectorAll("#top-seg button").forEach(b=>b.setAttribute("aria-pressed",b.dataset.v===tpView));
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
    d.querySelector("b").textContent=it.name+" выбил";d.querySelector("small").textContent=HEROES[c.h][0]+", "+FIN[c.f].k.toLowerCase()+(classify(c.sn)?", № "+fmtSn(c.sn):"")+(it.t?" · "+ago(it.t):"");
    d.onclick=()=>openCardView(c,{owner:it.name,mine:ONLINE&&it.uid===S.uid});fb.appendChild(d)});
  if(!fd.items.length)fb.innerHTML='<p style="margin:0;color:#5a5f80">Пока никто не выбил ничего редкого.</p>'}
document.querySelectorAll("#top-seg button").forEach(b=>b.onclick=()=>{tpView=b.dataset.v;renderTop()});

/* ---------- вкладки ---------- */
function setTab(t){["spin","duel","album","craft","shop","col","top"].forEach(k=>{$("tab-"+k).setAttribute("aria-selected",k===t);$("sec-"+k).hidden=k!==t});renderAll();scrollTo(0,0)}
$("tab-spin").onclick=()=>setTab("spin");$("tab-album").onclick=()=>setTab("album");$("tab-col").onclick=()=>setTab("col");$("tab-craft").onclick=()=>setTab("craft");$("tab-duel").onclick=()=>setTab("duel");$("tab-shop").onclick=()=>setTab("shop");$("tab-top").onclick=()=>setTab("top");
function updCash(){if(!S)return;const e=$("cash");e.textContent=fmtC(S.cash);e.title=fmt(S.cash)}
function renderAll(){if(!S)return;updCash();if(!$("sec-album").hidden)renderAlbum();if(!$("sec-col").hidden)renderCol();if(!$("sec-craft").hidden&&!crBusy)renderCraft();if(!$("sec-duel").hidden)renderBattle();if(!$("sec-shop").hidden&&!(document.activeElement&&document.activeElement.tagName==="INPUT"))renderShop();if(!$("sec-album").hidden){renderAch();renderShow();renderFriends()}if(!$("sec-col").hidden)renderMerge();if(!$("sec-top").hidden)renderTop();renderTasks();renderFree();renderStreak();renderBonus();renderStory();renderPioneer();pioneerNews();renderFounder();founderNews();renderPm();if(!busy)setTimeout(forgeHint,1500);$("topup").hidden=ONLINE&&!S.test&&!S.admin}
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
    const n=d.querySelector(".chn");n.textContent=(m.vip?"👑 ":"")+(m.pi?"🏅 ":"")+m.name+(m.a?" ★":"");if(m.vip)d.classList.add("vipm");n.style.color=m.a?"#d4380d":nickCol(m.name);
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

/* ---------- помощь и сообщение о баге ---------- */
const SUPPORT="voinivadmin";
function openSupport(kind){const id=S&&S.uid?S.uid:"—",info="ID: "+id+(S&&S.nick?" ("+S.nick+")":"")+(kind==="bug"?"\nБаг: ":"\nВопрос: ");
  try{navigator.clipboard&&navigator.clipboard.writeText(info)}catch(e){}
  toast("Твой ID скопирован — вставь его в сообщение");const u="https://t.me/"+SUPPORT;
  setTimeout(()=>{if(tg&&tg.openTelegramLink)tg.openTelegramLink(u);else window.open(u,"_blank")},700)}
function openHelp(){const m=$("modal"),sh=$("msheet");sh.innerHTML="";m.hidden=false;
  const Q=[["Как получить прокрутки?","3 бесплатные каждые 4 часа (VIP — 5), +1 за серию входов, задания дня, +10 за подписку на канал, +10 за историю и +10 за каждого друга по твоей ссылке."],
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
  {el:"open",t:"Привет, воин! ⚔️ Жми «Открыть» или просто тапни по карточке: выпадет случайный воин. На старте у тебя 5 бесплатных прокруток.",wait:true},
  {el:"stage",t:"Это твоя первая карточка! Цена зависит от трёх вещей: редкости воина, отделки (блестящая, голограмма, золото, ошибка печати) и номера. Красивые номера вроде 777 777 стоят в разы дороже."},
  {el:"free-box",t:"Каждые 4 часа даётся 3 бесплатные прокрутки. Заходи почаще, чтобы не терять их."},
  {el:"bonus",t:"Здесь бесплатные прокрутки сверху: +10 за подписку на канал, +10 за историю и +10 за каждого друга."},
  {el:"tabs",t:"Внизу всё остальное: «Бой» с дуэлями и боссом, «Альбом», «Крафт», «Рынок» с настоящими игроками, «Мои» с закалкой карточек и «Топ» мира. Удачи! 🍀"}];
let onbStep=-1;
function startOnb(){let done=null;try{done=localStorage.getItem("we-onb")}catch(e){}if(done||!S||S.cards.length)return false;onbStep=0;showOnb();return true}
function onbEnd(){onbClear();onbStep=-1;try{localStorage.setItem("we-onb","1")}catch(e){}setTimeout(askNick,400)}
function onbClear(){document.querySelectorAll(".onb-hl").forEach(e=>e.classList.remove("onb-hl"));const b=$("onb");if(b)b.remove()}
function showOnb(){onbClear();const st=ONB[onbStep];if(!st){onbEnd();return}
  const el=st.el==="tabs"?document.querySelector("nav.tabs"):$(st.el);if(!el){onbStep++;showOnb();return}
  if(st.el!=="tabs")el.scrollIntoView({block:"center",behavior:reduce?"auto":"smooth"});
  setTimeout(()=>{el.classList.add("onb-hl");const r=el.getBoundingClientRect(),b=document.createElement("div");b.id="onb";b.className="onb";
    b.innerHTML=`<div class="onb-n">${onbStep+1} из ${ONB.length}</div><p></p><div class="onb-b">${st.wait?"":`<button type="button" class="mini2" id="onb-next">${onbStep===ONB.length-1?"Играть!":"Дальше"}</button>`}<button type="button" class="ghost" id="onb-skip">Пропустить</button></div>`;
    b.querySelector("p").textContent=st.t;document.body.appendChild(b);
    const h=b.offsetHeight,below=r.bottom+14+h<innerHeight-10;b.style.top=(below?r.bottom+14:Math.max(10,r.top-14-h))+"px";b.classList.add(below?"down":"up");
    if($("onb-next"))$("onb-next").onclick=()=>{onbStep++;showOnb()};$("onb-skip").onclick=onbEnd},reduce?0:350)}
/* первый шаг: после открытия первой карточки идём дальше */
function onbOpened(){if(onbStep===0){onbClear();setTimeout(()=>{onbStep=1;showOnb()},1600)}}

/* ---------- запуск ---------- */
const sample={id:0,h:19,f:2,no:37,sn:"123321",hue:0,v:1236,stats:[331,352,296,348,361]};
showCard(sample);$("p-lbl").textContent="Пример карточки. Нажми «Открыть»";$("sell").disabled=true;
$("open").addEventListener("click",()=>{$("p-lbl").textContent="Цена карточки"},{once:true});
$("stage").addEventListener("click",()=>{$("p-lbl").textContent="Цена карточки"},{once:true});
(async function start(){
  if(ONLINE){$("free-t").textContent="Подключаюсь к серверу…";const r=await act("sync");if(!r){$("free-t").textContent="Сервер недоступен. Закрой игру и открой снова";return}}
  else{S=loadLocal();touch(S,NOW());save()}
  renderAll();handleStart();
  const fromLink=new URLSearchParams(location.search).get("startapp")||(tg&&tg.initDataUnsafe&&tg.initDataUnsafe.start_param);
  if(!fromLink)setTimeout(()=>{if(!startOnb())askNick()},600);
})();

