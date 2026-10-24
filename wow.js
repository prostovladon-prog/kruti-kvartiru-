/* wow.js — подарки и витрины, казино рун, голем и 3D-эффекты лагеря. Подключается после game.js */
/* объёмные глянцевые подарки: базовая форма + объём (радиальные градиенты), блики, ободок света */
function giftSVG(k,s){const u=k+Math.random().toString(36).slice(2,7);
 const rg=(id,c1,c2,c3,cx,cy)=>`<radialGradient id="${id}${u}" cx="${cx||.35}" cy="${cy||.3}" r=".85"><stop offset="0" stop-color="${c1}"/><stop offset=".55" stop-color="${c2}"/><stop offset="1" stop-color="${c3}"/></radialGradient>`;
 const lg=(id,a,b,c)=>`<linearGradient id="${id}${u}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${a}"/><stop offset=".5" stop-color="${b}"/><stop offset="1" stop-color="${c}"/></linearGradient>`;
 const spec=`<radialGradient id="sp${u}" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#fff" stop-opacity=".95"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>`;
 const W=(defs,body,glow)=>`<svg viewBox="0 0 120 120" width="${s}" height="${s}" style="overflow:visible;filter:drop-shadow(0 6px 6px rgba(0,0,0,.45)) drop-shadow(0 0 14px ${glow})" aria-hidden="true"><defs>${defs}${spec}</defs>${body}</svg>`;
 const hl=(x,y,rx,ry,r)=>`<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="url(#sp${u})" transform="rotate(${r||-30} ${x} ${y})"/>`;
 const L={
 crown:()=>W(rg("g","#fff7c2","#f2b51c","#7a4a06")+lg("b","#ffe27a","#c98a10","#6a3a04"),
  `<path d="M18 86 L12 34 L38 56 L60 20 L82 56 L108 34 L102 86Z" fill="url(#g${u})" stroke="#4a2a02" stroke-width="2.5"/>
   <path d="M18 86 L102 86 L100 100 L20 100Z" fill="url(#b${u})" stroke="#4a2a02" stroke-width="2.5"/>
   <circle cx="12" cy="32" r="6" fill="url(#g${u})" stroke="#4a2a02" stroke-width="2"/><circle cx="60" cy="18" r="7" fill="url(#g${u})" stroke="#4a2a02" stroke-width="2"/><circle cx="108" cy="32" r="6" fill="url(#g${u})" stroke="#4a2a02" stroke-width="2"/>
   ${["#ff2e63:40:72:6","#34ffb0:60:66:8","#3ab0ff:80:72:6"].map(x=>{const [c,X,Y,R]=x.split(":");return `<circle cx="${X}" cy="${Y}" r="${R}" fill="${c}" stroke="#4a2a02" stroke-width="2"/><circle cx="${X-R/3}" cy="${Y-R/3}" r="${R/3}" fill="#fff" opacity=".85"/>`}).join("")}
   ${hl(36,46,10,4)}${hl(78,44,8,3,30)}<path d="M24 92 H96" stroke="#fff6c8" stroke-width="2" opacity=".7"/>`,"#ffd23f"),
 feather:()=>W(rg("g","#fff3a0","#ff7a1a","#a8141a",.4,.6)+lg("b","#fff","#ffd23f","#ff3b30"),
  `<path d="M86 8 Q112 44 76 82 Q58 98 32 104 Q40 84 50 66 Q58 32 86 8Z" fill="url(#g${u})" stroke="#5a0a0a" stroke-width="2.5"/>
   <path d="M84 14 Q64 56 32 104" fill="none" stroke="url(#b${u})" stroke-width="3.5"/>
   ${[0,1,2,3,4].map(i=>`<path d="M${78-i*8} ${30+i*12} q-14 -2 -20 4" fill="none" stroke="#ffe27a" stroke-width="2" opacity=".8"/>`).join("")}
   ${hl(76,30,10,4,-60)}`,"#ff6a1a"),
 dragon:()=>W(rg("g","#d6ffe0","#2fbf5a","#0a4a22")+rg("e","#fff","#fff6a0","#ff9f0a",.4,.4),
  `<path d="M24 92 Q16 44 60 38 Q104 44 96 92Z" fill="url(#g${u})" stroke="#052a12" stroke-width="2.5"/>
   <path d="M34 44 L18 14 L46 34Z M86 44 L102 14 L74 34Z" fill="#ffd23f" stroke="#5a3a02" stroke-width="2.5"/>
   <ellipse cx="45" cy="64" rx="10" ry="11" fill="url(#e${u})" stroke="#052a12" stroke-width="2"/><ellipse cx="75" cy="64" rx="10" ry="11" fill="url(#e${u})" stroke="#052a12" stroke-width="2"/>
   <ellipse cx="46" cy="66" rx="3.5" ry="6" fill="#0d1030"/><ellipse cx="76" cy="66" rx="3.5" ry="6" fill="#0d1030"/><circle cx="42" cy="60" r="2.5" fill="#fff"/><circle cx="72" cy="60" r="2.5" fill="#fff"/>
   <path d="M52 80 Q60 86 68 80" fill="none" stroke="#052a12" stroke-width="2.5"/><circle cx="36" cy="78" r="5" fill="#ff8fb0" opacity=".6"/><circle cx="84" cy="78" r="5" fill="#ff8fb0" opacity=".6"/>${hl(40,48,12,5)}`,"#34ffb0"),
 ring:()=>W(rg("g","#fff7c2","#e8a91a","#6a3a04")+lg("d","#ffffff","#c9a8ff","#5a1fa8"),
  `<ellipse cx="60" cy="76" rx="34" ry="30" fill="none" stroke="url(#g${u})" stroke-width="12"/><ellipse cx="60" cy="76" rx="40" ry="36" fill="none" stroke="#4a2a02" stroke-width="2"/><ellipse cx="60" cy="76" rx="28" ry="24" fill="none" stroke="#4a2a02" stroke-width="2"/>
   <path d="M42 40 L60 12 L78 40 L60 54Z" fill="url(#d${u})" stroke="#2a0a50" stroke-width="2.5"/><path d="M42 40 H78 M60 12 L52 40 L60 54 L68 40Z" fill="none" stroke="#fff" stroke-width="1.5" opacity=".8"/>${hl(32,66,8,3,-70)}${hl(54,24,5,2,-50)}`,"#c56bff"),
 mask:()=>W(rg("g","#ff9a9a","#d0141f","#4a0508")+rg("h","#fff7c2","#e8b33a","#6a3a04"),
  `<path d="M20 36 Q60 14 100 36 Q106 80 60 106 Q14 80 20 36Z" fill="url(#g${u})" stroke="#2a0204" stroke-width="2.5"/>
   <path d="M20 36 L6 8 L36 28Z M100 36 L114 8 L84 28Z" fill="url(#h${u})" stroke="#4a2a02" stroke-width="2.5"/>
   <path d="M32 54 L54 60 L52 68 L32 64Z M88 54 L66 60 L68 68 L88 64Z" fill="#0d0408"/><path d="M38 58 L50 61 M82 58 L70 61" stroke="#ffd23f" stroke-width="3"/>
   <path d="M40 84 Q60 72 80 84 L74 92 H46Z" fill="#fff" stroke="#2a0204" stroke-width="2"/><path d="M48 84 v8 M56 82 v10 M64 82 v10 M72 84 v8" stroke="#2a0204" stroke-width="1.5"/>${hl(40,34,14,5,-15)}`,"#ff2e63"),
 sword:()=>W(lg("g","#ffffff","#c9d3e6","#5d6a7e")+rg("h","#fff7c2","#e8b33a","#6a3a04")+lg("st","#9aa6bf","#5d6a7e","#2a3040"),
  `<path d="M56 6 L64 6 L66 72 L54 72Z" fill="url(#g${u})" stroke="#1a2030" stroke-width="2"/><path d="M60 10 V68" stroke="#fff" stroke-width="2" opacity=".9"/>
   <path d="M36 72 H84 V80 H36Z" fill="url(#h${u})" stroke="#4a2a02" stroke-width="2"/><circle cx="60" cy="76" r="4" fill="#ff2e63" stroke="#4a2a02" stroke-width="1.5"/><path d="M55 80 H65 V92 H55Z" fill="#7a4a20" stroke="#2a1404" stroke-width="2"/>
   <path d="M20 94 Q60 78 100 94 L96 110 H24Z" fill="url(#st${u})" stroke="#1a2030" stroke-width="2.5"/>${hl(40,96,12,3,-8)}`,"#9fe8ff"),
 chest:()=>W(rg("g","#ffd9a0","#c96a1a","#4a1a02")+rg("h","#fff7c2","#e8b33a","#6a3a04")+rg("c","#ffffff","#7fe7ff","#0a4a8a",.4,.4),
  `<rect x="18" y="56" width="84" height="48" rx="8" fill="url(#g${u})" stroke="#2a1002" stroke-width="2.5"/><path d="M16 56 Q60 14 104 56Z" fill="url(#g${u})" stroke="#2a1002" stroke-width="2.5"/>
   <rect x="18" y="68" width="84" height="8" fill="url(#h${u})" stroke="#4a2a02" stroke-width="1.5"/><rect x="52" y="62" width="16" height="20" rx="3" fill="url(#h${u})" stroke="#4a2a02" stroke-width="2"/>
   <path d="M40 44 l7 -9 7 9 -7 9z M66 34 l8 -10 8 10 -8 10z" fill="url(#c${u})" stroke="#052a4a" stroke-width="1.5"/>${hl(34,62,10,3,-10)}`,"#7fe7ff"),
 shoe:()=>W(lg("g","#ffffff","#b8c3d6","#4a5468")+rg("h","#fff7c2","#e8b33a","#6a3a04"),
  `<path d="M28 18 Q8 70 34 100 Q60 116 86 100 Q112 70 92 18 L74 22 Q88 66 72 86 Q60 96 48 86 Q32 66 46 22Z" fill="url(#g${u})" stroke="#1a2030" stroke-width="2.5"/>
   ${[[30,30],[24,52],[28,74],[90,30],[96,52],[92,74]].map(([x,y])=>`<circle cx="${x}" cy="${y}" r="3.5" fill="url(#h${u})" stroke="#4a2a02" stroke-width="1.2"/>`).join("")}
   ${hl(32,40,10,3,-75)}<path d="M60 4 l4 9 9 1 -7 6 2 9 -8 -5 -8 5 2 -9 -7 -6 9 -1z" fill="#ffd23f" stroke="#6a3a04" stroke-width="1.5"/>`,"#c9d3e6"),
 dice:()=>W(rg("g","#ffb3c0","#e0213f","#5a0414")+rg("w","#ffffff","#ffd6de","#c08090"),
  `<path d="M14 46 L50 32 L80 48 L80 92 L46 108 L14 90Z" fill="url(#g${u})" stroke="#2a0208" stroke-width="2.5"/><path d="M14 46 L46 62 L80 48 M46 62 V108" fill="none" stroke="#2a0208" stroke-width="2"/>
   <path d="M60 22 L92 10 L114 28 L108 66 L80 76 L58 58Z" fill="url(#g${u})" stroke="#2a0208" stroke-width="2.5"/><path d="M60 22 L84 40 L114 28 M84 40 L80 76" fill="none" stroke="#2a0208" stroke-width="2"/>
   ${[[30,72],[38,80],[62,80],[62,94],[86,22],[98,58],[96,46],[94,34]].map(([x,y])=>`<circle cx="${x}" cy="${y}" r="4" fill="url(#w${u})"/>`).join("")}<circle cx="47" cy="47" r="4.5" fill="url(#w${u})"/>${hl(30,54,9,3,-20)}${hl(78,22,8,3,-20)}`,"#ff4d6d"),
 clover:()=>W(rg("g","#d6ffe0","#2fd06a","#0a4a22"),
  `<path d="M60 64 Q70 96 54 116" fill="none" stroke="#1a6a32" stroke-width="6" stroke-linecap="round"/>
   ${[0,90,180,270].map(a=>`<path transform="rotate(${a} 60 56)" d="M60 56 Q34 50 32 30 Q32 12 48 14 Q58 16 60 28 Q62 16 72 14 Q88 12 88 30 Q86 50 60 56Z" fill="url(#g${u})" stroke="#052a12" stroke-width="2.5"/>`).join("")}
   <circle cx="60" cy="56" r="6" fill="#ffd23f" stroke="#5a3a02" stroke-width="2"/>${hl(46,26,9,4,-30)}${hl(88,44,7,3,40)}`,"#47e891"),
 cup:()=>W(rg("g","#fff7c2","#f2b51c","#7a4a06")+lg("b","#ffe27a","#c98a10","#6a3a04")+rg("c","#ffffff","#7fe7ff","#0a4a8a",.4,.4),
  `<path d="M30 14 H90 Q92 64 60 76 Q28 64 30 14Z" fill="url(#g${u})" stroke="#4a2a02" stroke-width="2.5"/>
   <path d="M30 22 Q8 24 12 44 Q16 58 34 56 M90 22 Q112 24 108 44 Q104 58 86 56" fill="none" stroke="url(#b${u})" stroke-width="6"/><path d="M30 22 Q8 24 12 44 Q16 58 34 56 M90 22 Q112 24 108 44 Q104 58 86 56" fill="none" stroke="#4a2a02" stroke-width="1.5"/>
   <path d="M54 76 H66 V92 H54Z" fill="url(#b${u})" stroke="#4a2a02" stroke-width="2"/><path d="M34 92 H86 L90 110 H30Z" fill="url(#b${u})" stroke="#4a2a02" stroke-width="2.5"/>
   <path d="M60 30 l8 10 -8 10 -8 -10z" fill="url(#c${u})" stroke="#052a4a" stroke-width="1.5"/>${hl(42,28,10,4,-60)}<path d="M40 100 H80" stroke="#fff6c8" stroke-width="2" opacity=".7"/>`,"#ffd23f"),
 helm:()=>W(rg("g","#fff7c2","#e8b33a","#6a3a04"),
  `<path d="M24 84 Q20 24 60 18 Q100 24 96 84 L82 84 L80 54 L40 54 L38 84Z" fill="url(#g${u})" stroke="#4a2a02" stroke-width="2.5"/><path d="M54 54 L54 96 L66 96 L66 54" fill="url(#g${u})" stroke="#4a2a02" stroke-width="2.5"/>
   <path d="M60 18 Q64 2 82 6" fill="none" stroke="#c0262c" stroke-width="8" stroke-linecap="round"/><circle cx="60" cy="32" r="6" fill="#c0262c" stroke="#4a2a02" stroke-width="2"/>${hl(40,34,12,5,-40)}`,"#ffd23f")};
 return (L[k]||L.helm)()}

/* ---------- общее: фоны подарков, частицы, нижнее меню ---------- */
const GBG={crown:"radial-gradient(circle at 50% 36%,#fff6c8,#ffb800 30%,#c2410c 62%,#3a0e05)",feather:"radial-gradient(circle at 50% 70%,#ffd23f,#ff3b30 35%,#5a0a1a 70%,#1a0205)",
 ring:"conic-gradient(from 0deg at 50% 40%,#2a0a5a,#7a3ad0,#0a3a8a,#bf5af2,#2a0a5a)",dragon:"radial-gradient(circle at 50% 40%,#a8ffd0,#0a8a5a 40%,#052a2a 75%)",
 sword:"radial-gradient(circle at 50% 40%,#e6fbff,#3a9ad0 40%,#0a1a3a 78%)",helm:"radial-gradient(circle at 50% 40%,#fff3c0,#d08a1a 45%,#3a1a05 80%)",
 shoe:"radial-gradient(circle at 50% 40%,#ffffff,#8a9ab8 40%,#1a2236 80%)",dice:"radial-gradient(circle at 50% 40%,#ffd0da,#c0102f 45%,#2a0208 80%)",
 clover:"radial-gradient(circle at 50% 40%,#e0ffe8,#1a9a50 42%,#032a12 80%)",mask:"radial-gradient(circle at 50% 40%,#ffb0c0,#a0001f 45%,#1a0005 80%)",
 cup:"conic-gradient(from 0deg at 50% 40%,#3a1a00,#ffd23f,#7a3a00,#fff6c8,#3a1a00)"};
const STAR_GIFTS=Object.keys(GIFTS).filter(k=>!GIFTS[k].luck).sort((a,b)=>GIFTS[b].r-GIFTS[a].r),LUCK_GIFTS=Object.keys(GIFTS).filter(k=>GIFTS[k].luck).sort((a,b)=>GIFTS[b].r-GIFTS[a].r);
const gNo=g=>"№ "+String(g.no).padStart(3,"0")+"/"+GIFTS[g.k].run;
function giftCard(k,o){o=o||{};const G=GIFTS[k],L=o.left;
  return `<div class="gc${G.r>=4?" myth":""}${G.luck?" luck":""}${o.small?" small":""}" style="--g:${G.g};--rc:${GR_C[G.r]}"><div class="bg" style="background:${GBG[k]}"></div>${G.r>=3?'<div class="rays"></div>':""}<div class="foil"></div><div class="ic">${giftSVG(k,100)}</div><div class="glare"></div><span class="rr">${GR[G.r].toUpperCase()}</span><span class="run">тираж ${fmtN(G.run)}</span><div class="nm">${G.n}</div>${L!=null?`<div class="lb"><i style="width:${Math.max(0,L)/G.run*100}%"></i></div><div class="lt">${L>0?"осталось "+fmtN(L)+" из "+fmtN(G.run):"тираж закончился"}</div>`:""}${o.btn||""}</div>`}
/* частицы на холсте: искры, ромбики, конфетти */
function wFx(cv){const X=cv.getContext("2d"),P=[];let run=false;const fit=()=>{const r=cv.getBoundingClientRect(),d=Math.min(2,devicePixelRatio||1);cv.width=r.width*d;cv.height=r.height*d;X.setTransform(d,0,0,d,0,0)};fit();
  const loop=()=>{const r=cv.getBoundingClientRect();X.clearRect(0,0,r.width,r.height);
    for(let i=P.length-1;i>=0;i--){const p=P[i];p.t++;p.x+=p.vx;p.y+=p.vy;p.vy+=p.g;p.vx*=.97;const k=1-p.t/p.l;if(k<=0){P.splice(i,1);continue}
      X.globalAlpha=k;X.fillStyle=p.c;X.save();X.translate(p.x,p.y);X.rotate(p.r+p.t*.2);if(p.s>3.5){X.beginPath();X.moveTo(0,-p.s);X.lineTo(p.s*.6,0);X.lineTo(0,p.s);X.lineTo(-p.s*.6,0);X.fill()}else X.fillRect(-p.s/2,-p.s/2,p.s,p.s);X.restore()}
    X.globalAlpha=1;if(P.length)requestAnimationFrame(loop);else run=false};
  return {fit,burst(x,y,n,cols,sp,g,life,sz){if(reduce)return;for(let i=0;i<n;i++){const a=Math.random()*Math.PI*2,v=sp*(.4+Math.random());P.push({x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v-(g>0?sp*.5:0),g:g||0,l:life*(.6+Math.random()*.6),t:0,c:cols[Math.floor(Math.random()*cols.length)],s:sz*(.6+Math.random()*.8),r:Math.random()*6})}if(!run){run=true;requestAnimationFrame(loop)}}}}
function wSheet(html,onClick){document.querySelectorAll(".wsheet").forEach(e=>e.remove());const d=document.createElement("div");d.className="wsheet";
  d.innerHTML='<div class="wsh-in">'+html+'<button type="button" class="ghost" data-x="1">Закрыть</button></div>';document.body.append(d);
  d.onclick=e=>{if(e.target===d||e.target.closest("[data-x]")){d.remove();return}const b=e.target.closest("button");if(b&&onClick){const r=onClick(b);if(r!==false)d.remove()}};return d}
/* показ нового подарка: лучи, салют, номер тиража */
function wReveal(g,title,sub,btns){const G=GIFTS[g.k],d=document.createElement("div");d.className="wrev";d.style.setProperty("--g",G.g);d.style.setProperty("--rc",GR_C[G.r]);
  d.innerHTML='<div class="rays2"></div><canvas></canvas><div class="ic">'+giftSVG(g.k,150)+'</div><h3></h3><p>'+gNo(g)+(G.luck?" · серия «Удача»":"")+'</p>'+(sub?'<p style="font-weight:700;opacity:.85"></p>':"")+'<span class="rr">'+GR[G.r].toUpperCase()+'</span><div class="bt">'+(btns||"")+'<button type="button" class="ghost" data-x="1" style="color:#fff">Отлично</button></div>';
  d.querySelector("h3").textContent=title||G.n;if(sub)d.querySelectorAll("p")[1].textContent=sub;document.body.append(d);
  const fx=wFx(d.querySelector("canvas")),w=innerWidth,h=innerHeight;const cols=[G.g,"#fff","#ffd23f",GR_C[G.r]];
  fx.burst(w/2,h*.4,120,cols,10,.12,100,6);setTimeout(()=>fx.burst(w*.25,h*.3,50,cols,7,.12,80,5),400);setTimeout(()=>fx.burst(w*.75,h*.3,50,cols,7,.12,80,5),700);
  try{sfx.fanfare()}catch(e){}hapN("success");
  d.onclick=async e=>{const b=e.target.closest("button");if(!b)return;if(b.dataset.x){d.remove();return}
    if(b.dataset.put){const r=await putOnShelf(+b.dataset.put);if(r)d.remove()}};return d}
async function putOnShelf(id){const used=new Set((S.gifts||[]).filter(g=>g.shelf>0).map(g=>g.shelf));let slot=0;for(let i=1;i<=SHELF_N;i++)if(!used.has(i)){slot=i;break}
  if(!slot){toast("Все "+SHELF_N+" мест на витрине заняты. Убери подарок с полки в «Моей витрине»");return null}
  const r=await act("gift_shelf",{id,slot});if(r){toast("🏛 Подарок стоит на витрине");hap("medium")}return r}

/* ---------- Сокровищница: вкладка «Подарки» ---------- */
const _renderGold=renderGold;
renderGold=function(){_renderGold();if(goldTab!=="gifts")return;const B=$("gold-body"),L=(goldData&&goldData.gleft)||{};
  B.innerHTML='<div class="gshead"><h3>🎁 Подарки Эпох</h3><p>У каждого подарка свой тираж на весь мир — номер навсегда остаётся на подарке. Ставь на витрину и дари друзьям. Подарки нельзя продать.</p><div class="row2"><button type="button" class="craftbtn" data-shelf="1">🏛 Моя витрина</button><button type="button" class="craftbtn" data-cas="1" style="background:linear-gradient(180deg,#e0c8ff,#9a5af2);color:#fff">🎰 Кейс</button></div></div>'+
   '<div class="gg3">'+STAR_GIFTS.map(k=>{const l=goldData?L[k]:null,sold=l===0;return giftCard(k,{left:l,btn:'<button type="button" class="pr" data-gk="'+k+'"'+(sold?" disabled":"")+'>'+(sold?"раскуплено":"⭐ "+GIFTS[k].stars)+'</button>'})}).join("")+'</div>'+
   '<div class="ghd">🍀 Серия «Удача» — только из кейса</div><p class="gnote">Эти подарки не продаются за звёзды. Их можно только выбить в кейсе в Казино рун (лагерь) — и Корону Эпох тоже, но шанс мизерный: 1 на 20 000.</p>'+
   '<div class="gg3">'+LUCK_GIFTS.map(k=>giftCard(k,{left:goldData?L[k]:null,btn:'<button type="button" class="pr" data-cas="1">из кейса · '+(CASE.p.find(x=>x[1].g===k)[0]*100).toLocaleString("ru",{maximumFractionDigits:2})+'%</button>'})).join("")+'</div>'};
$("gold-body").addEventListener("click",e=>{const t=e.target.closest("button");if(!t||t.disabled)return;
  if(t.dataset.gk)buyItem({item:"gift",k:t.dataset.gk});else if(t.dataset.shelf)openShelf();else if(t.dataset.cas)openCas("case")});
const _payShow=payShow;
payShow=function(r){if(r&&r.status==="done"&&r.item==="gift"&&r.res&&r.res.gift){renderAll();loadGold();const g=r.res.gift;wReveal(g,"🎁 "+GIFTS[g.k].n,"Подарок твой! Поставь его на витрину или подари другу",'<button type="button" class="craftbtn" data-put="'+g.id+'">🏛 Поставить на витрину</button>');return}
  if(r&&r.status==="done"&&r.item==="golem"){renderAll();sfx.fanfare();hapN("success");toast("🗿 Голем в лагере! Энергия ×2 и восстанавливается в 2 раза быстрее");if(!$("sec-camp").hidden)renderCamp();return}
  return _payShow(r)};

/* ---------- витрина подарков ---------- */
function shelfHTML(o){const by={};(o.shelf||[]).forEach(g=>by[g.shelf]=g);let rows="";
  for(let r=0;r<3;r++){rows+='<div class="shf">';for(let c=1;c<=3;c++){const i=r*3+c,g=by[i];
    if(g){const G=GIFTS[g.k];rows+='<button type="button" class="xsl'+(G.r>=4?" myth":"")+'" style="--g:'+G.g+'" data-slot="'+i+'" data-gid="'+g.id+'"><div class="ray"></div><div class="halo"></div><div class="ic">'+giftSVG(g.k,72)+'</div><div class="ped"></div><span class="no">'+gNo(g)+'</span></button>'}
    else rows+=o.mine?'<button type="button" class="xsl empty" data-slot="'+i+'">＋<small>поставить</small></button>':'<div class="xsl empty ro"></div>'}rows+='</div>'}
  return '<div class="wsh"><div class="top"><div class="ava">'+portrait(o.h,o.card||null)+'</div><div><div class="nk"></div><div class="tt">'+fmtN(o.gn)+' '+plural(o.gn,"подарок","подарка","подарков")+'</div></div></div>'+
   '<div class="stats"><div>'+(o.shelf||[]).length+' / '+SHELF_N+'<small>на витрине</small></div><div>⭐ '+fmtN(o.gval)+'<small>стоимость</small></div><div>'+(o.grank?"#"+o.grank:"—")+'<small>в топе витрин</small></div></div>'+
   '<h4>🏛 ВИТРИНА <span>👁 '+fmtN(o.gv||0)+'</span></h4><div class="cab"><div class="gls"></div>'+rows+'</div>'+(o.extra||"")+'</div>'}
let shTop=null;
async function openShelf(){if(!ONLINE){toast("Витрина работает в игре через бота");return}const m=$("modal"),sh=$("msheet");m.hidden=false;sh.innerHTML='<p style="text-align:center">Загружаю витрину…</p>';
  const t=await act("gift_top");if(t)shTop=t;drawShelf()}
function drawShelf(){const sh=$("msheet");if($("modal").hidden)return;const gs=S.gifts||[],T=(shTop&&shTop.top)||[],rank=T.findIndex(r=>r.uid===S.uid)+1,best=[...S.cards].sort((a,b)=>b.v-a.v)[0];
  const inv=gs.length?'<div class="winv">'+gs.map(g=>'<button type="button" style="--g:'+GIFTS[g.k].g+'" class="'+(g.shelf?"on":"")+'" data-inv="'+g.id+'">'+giftSVG(g.k,52)+'<span>'+gNo(g)+'</span></button>').join("")+'</div>':'<div class="emp">Подарков пока нет. Купи в Сокровищнице, выбей в кейсе или попроси друга подарить 😉</div>';
  const top='<div class="gtop">'+(T.length?T.slice(0,10).map((r,i)=>'<div class="cpt'+(r.uid===S.uid?" me":"")+'" data-u="'+r.uid+'"><i>'+(i<3?["🥇","🥈","🥉"][i]:i+1)+'</i><span></span><b>⭐ '+fmtN(r.s)+'</b></div>').join(""):'<div class="emp">Пока пусто — стань первым!</div>')+'</div>';
  sh.innerHTML='<button type="button" class="x" id="wsx">Закрыть</button>'+shelfHTML({mine:1,shelf:gs.filter(g=>g.shelf>0),gn:gs.length,gval:gs.reduce((a,g)=>a+giftVal(g.k),0),grank:rank,gv:S.gv,h:best?best.h:0,card:best,
    extra:'<p class="note">Нажми «＋», чтобы поставить подарок, или на подарок, чтобы убрать или подарить</p><div class="wsbtns"><button type="button" class="wsb1" id="ws-send">🎁 ПОДАРИТЬ</button><button type="button" class="wsb2" id="ws-shop">⭐ МАГАЗИН</button></div>'+
    '<h4 style="margin-top:14px">🎒 ВСЕ ПОДАРКИ <span>'+gs.length+'</span></h4>'+inv+'<h4 style="margin-top:14px">🏆 ТОП ВИТРИН</h4>'+top})+'';
  sh.querySelector(".nk").textContent=myName();sh.querySelectorAll(".gtop .cpt").forEach((d,i)=>fxName(d.querySelector("span"),"",T[i].name,T[i].uid));
  $("wsx").onclick=closeModal;$("ws-shop").onclick=()=>{closeModal();openGold("gifts")};$("ws-send").onclick=()=>sendHelp(null);
  sh.querySelector(".wsh").onclick=async e=>{const b=e.target.closest("button");if(!b)return;
    if(b.dataset.u){const u=+b.dataset.u;if(u!==S.uid){closeModal();openParam("u_"+u)}return}
    const tr=e.target.closest(".cpt[data-u]");if(tr&&+tr.dataset.u!==S.uid){closeModal();openParam("u_"+tr.dataset.u);return}
    if(b.dataset.gid||b.dataset.inv)return giftMenu(+(b.dataset.gid||b.dataset.inv));
    if(b.dataset.slot){const free=gs.filter(g=>!g.shelf);if(!free.length){toast(gs.length?"Все подарки уже на витрине":"Сначала добудь подарок");return}
      wSheet('<h3>Что поставить на полку?</h3><div class="winv">'+free.map(g=>'<button type="button" style="--g:'+GIFTS[g.k].g+'" data-pick="'+g.id+'">'+giftSVG(g.k,52)+'<span>'+gNo(g)+'</span></button>').join("")+'</div>',
        bb=>{if(!bb.dataset.pick)return false;act("gift_shelf",{id:+bb.dataset.pick,slot:+b.dataset.slot}).then(r=>{if(r){hap("medium");drawShelf()}})})}};
  sh.querySelector(".gtop").addEventListener("click",e=>{const d=e.target.closest(".cpt[data-u]");if(d&&+d.dataset.u!==S.uid){closeModal();openParam("u_"+d.dataset.u)}})}
function giftMenu(id){const g=(S.gifts||[]).find(x=>x.id===id);if(!g)return;const G=GIFTS[g.k];
  wSheet('<div style="display:flex;justify-content:center">'+giftSVG(g.k,110)+'</div><h3 style="text-align:center;margin:4px 0 0">'+G.n+'</h3><p style="text-align:center;margin:2px 0 10px;font-weight:800">'+gNo(g)+' · '+GR[G.r].toLowerCase()+(G.luck?" · серия «Удача»":"")+(g.how==="case"?" · из кейса":"")+(g.from_uid?" · подарок от друга":"")+'</p>'+
    (g.shelf?'<button type="button" class="craftbtn" data-off="1">Убрать с витрины</button>':'<button type="button" class="craftbtn" data-on="1">🏛 Поставить на витрину</button>')+'<button type="button" class="craftbtn" data-gift="1" style="margin-top:8px;background:linear-gradient(180deg,#ff8fb0,#ff2e63);color:#fff">🎁 Подарить другу</button>',
    b=>{if(b.dataset.off)act("gift_shelf",{id,slot:0}).then(r=>{if(r)drawShelf()});else if(b.dataset.on)putOnShelf(id).then(r=>{if(r)drawShelf()});else if(b.dataset.gift)sendHelp(id);else return false})}
/* кому подарить: друзья, чьи витрины ты открывал. Ещё можно открыть витрину игрока в топе и нажать «Подарить» */
function sendHelp(id){const F=friendsGet(),fr=Object.keys(F).filter(n=>/^u_\d+/.test(F[n].p||"")).sort((a,b)=>F[b].t-F[a].t).slice(0,12);
  wSheet('<h3>Кому подарить?</h3><p style="font-size:13px;margin:0 0 8px">Открой витрину игрока (нажми на него в топе или в чате) и нажми «🎁 Подарить». Недавние:</p>'+(fr.length?fr.map(n=>'<button type="button" class="ghost" data-fp="'+F[n].p+'" style="display:block;width:100%;margin-bottom:6px"></button>').join(""):'<p style="font-size:13px;color:#5a5f80">Ты ещё не открывал чужие витрины</p>'),
    b=>{if(!b.dataset.fp)return false;closeModal();openParam(b.dataset.fp).then(()=>{if(id)giftTo(id)})});
  document.querySelectorAll(".wsheet [data-fp]").forEach((b,i)=>b.textContent="🏛 "+fr[i])}
let shOther=null;
function giftTo(id){if(!shOther)return;const F=shOther,gs=(S.gifts||[]);if(!gs.length){toast("У тебя пока нет подарков. Купи в Сокровищнице 🎁");return}
  const pickOne=gid=>{const g=gs.find(x=>x.id===gid),G=GIFTS[g.k];
    wSheet('<div style="display:flex;justify-content:center">'+giftSVG(g.k,96)+'</div><h3 style="text-align:center">Подарить «'+G.n+'» '+gNo(g)+'?</h3><p style="text-align:center;font-size:13px;margin:0 0 10px">Игрок: <b class="wto"></b>. Вернуть подарок будет нельзя.</p><button type="button" class="craftbtn" data-ok="1">🎁 Подарить</button>',
      b=>{if(!b.dataset.ok)return false;act("gift_send",{id:gid,to:F.uid}).then(r=>{if(r){sfx.fanfare();hapN("success");toast("🎁 Подарок отправлен игроку "+r.name+"!");refreshOther()}})});
    document.querySelector(".wsheet .wto").textContent=F.name};
  if(id)return pickOne(id);
  wSheet('<h3>Что подарить?</h3><div class="winv">'+gs.map(g=>'<button type="button" style="--g:'+GIFTS[g.k].g+'" data-pick="'+g.id+'">'+giftSVG(g.k,52)+'<span>'+gNo(g)+'</span></button>').join("")+'</div>',b=>{if(!b.dataset.pick)return false;setTimeout(()=>pickOne(+b.dataset.pick),50)})}
async function refreshOther(){if(!shOther)return;const r=await act("profile",{uid:shOther.uid});if(r&&!$("modal").hidden)openShowcase(Object.assign(r,{p:shOther.p}))}
const _openShowcase=openShowcase;
openShowcase=function(F){_openShowcase(F);if(!F||F.shelf==null)return;shOther=F;const sh=$("msheet"),who=sh.querySelector(".who");
  const w=document.createElement("div");w.innerHTML=shelfHTML({shelf:F.shelf,gn:F.gn,gval:F.gval,grank:F.grank,gv:F.gv,h:F.cards[0]?F.cards[0].h:0,card:F.cards[0],
    extra:'<div class="wsbtns"><button type="button" class="wsb1" id="ws-give">🎁 ПОДАРИТЬ</button></div>'+(F.shelf.length?"":'<p class="note">Витрина пока пустая</p>')});
  const box=w.firstChild;box.querySelector(".nk").textContent=F.name;who.after(box);
  box.onclick=e=>{const b=e.target.closest("[data-gid]");if(b){const g=F.shelf.find(x=>x.id===+b.dataset.gid),G=GIFTS[g.k];wSheet('<div style="display:flex;justify-content:center">'+giftSVG(g.k,120)+'</div><h3 style="text-align:center;margin:4px 0">'+G.n+'</h3><p style="text-align:center;font-weight:800;margin:0 0 10px">'+gNo(g)+' · '+GR[G.r].toLowerCase()+(G.luck?" · серия «Удача»":"")+'</p>')}};
  $("ws-give").onclick=()=>giftTo(null)};

/* ---------- казино рун ---------- */
let csTab="case",csBet=1000,csBusy=false;
function openCas(t){if(!ONLINE){toast("Казино работает в игре через бота");return}if(t)csTab=t;campFlush();setTab("cas");renderCas()}
function casK(){const K=S.cas||{};return K.d===new Date(Date.now()+3*3600e3).toISOString().slice(0,10)?K:{n:0,cs:0}}
function csBal(){$("cs-ru").textContent=fmtN(campView().runes);const K=casK();$("cs-day").innerHTML="игр сегодня <b>"+(K.n||0)+"/"+CAS_DAY+"</b><br>кейсов <b>"+(K.cs||0)+"/"+CASE.day+"</b>"}
const PRZ=CASE.p.map(([p,P])=>P.g?{g:P.g,c:GR_C[GIFTS[P.g].r],p}:{r:P.r,c:P.r>=1e5?"#0a84ff":P.r>=6e4?"#34c759":"#8f9bb3",p});
const csTile=x=>x.g?'<div class="itc" style="--c:'+x.c+'">'+giftSVG(x.g,64)+'<span>'+GIFTS[x.g].n+'</span></div>':'<div class="itc" style="--c:'+x.c+'"><span style="font-size:40px">💠</span><span class="rn">+'+fmtN(x.r)+'</span></div>';
const rollPrz=()=>{let x=Math.random();for(const z of PRZ){if(x<z.p)return z;x-=z.p}return PRZ[0]};
function renderCas(){if(!S||$("sec-cas").hidden)return;csBal();document.querySelectorAll("#cs-seg button").forEach(b=>b.setAttribute("aria-pressed",b.dataset.c===csTab));const B=$("cs-body"),K=casK();
  const bets='<div class="cs-bets" id="cs-bets">'+[1e3,5e3,1e4,25e3,5e4].map(b=>'<button type="button" data-bet="'+b+'" aria-pressed="'+(b===csBet)+'">'+(b>=1e3?b/1e3+"K":b)+'</button>').join("")+'</div>';
  if(csTab==="case"){const prev=[];for(let i=0;i<12;i++)prev.push(PRZ[[0,3,1,0,4,2,0,5,1,3,0,6][i]]);
    B.innerHTML='<div class="cs-box"><h3>📦 КЕЙС «УДАЧА»</h3><div class="sub">Руны, подарки серии «Удача» с тиражом — и крошечный шанс на Корону Эпох</div><div class="cs-chest">'+chestSVG("legend",150)+'</div>'+
      '<div class="cs-strip" id="cs-strip"><div class="tr" id="cs-tr">'+prev.map(csTile).join("")+'</div><div class="vig"></div><div class="cs-ptr"></div></div>'+
      '<button type="button" class="cs-go" id="cs-open"'+((K.cs||0)>=CASE.day?" disabled":"")+'>'+((K.cs||0)>=CASE.day?"НА СЕГОДНЯ ВСЁ":"ОТКРЫТЬ · "+fmtN(CASE.price)+" 💠")+'</button><div class="cs-lim">сегодня открыто '+(K.cs||0)+' из '+CASE.day+'</div>'+
      '<details class="cs-odds"><summary>Шансы — всё честно</summary><table>'+PRZ.map(z=>'<tr><td>'+(z.g?"🎁 "+GIFTS[z.g].n+" ("+GR[GIFTS[z.g].r].toLowerCase()+", тираж "+GIFTS[z.g].run+")":"💠 +"+fmtN(z.r)+" рун")+'</td><td>'+(z.p*100).toLocaleString("ru",{maximumFractionDigits:3})+'%</td></tr>').join("")+'</table><p>Если тираж подарка закончился, вместо него +'+fmtN(CASE.sold)+' рун.</p></details></div>';
    $("cs-open").onclick=caseOpen}
  if(csTab==="slot"){B.innerHTML='<div class="cs-box"><h3>🎰 СЛОТЫ ЭПОХ</h3><div class="sub">Три в ряд — большой выигрыш. Пара — ×'+String(SLOT.pair[1]).replace(".",",")+'</div>'+
      '<div class="slm">'+[0,1,2].map(i=>'<div class="slr" id="sl'+i+'"><div class="st"><div>'+["💎","👑","⚔️"][i]+'</div></div></div>').join("")+'</div><div class="slres" id="sl-res"></div>'+bets+
      '<button type="button" class="cs-go" id="cs-slgo">КРУТИТЬ · '+fmtN(csBet)+' 💠</button>'+
      '<details class="cs-odds"><summary>Выплаты и шансы</summary><table>'+SLOT.t.map(([p,s,k])=>'<tr><td>'+s+s+s+' ×'+k+'</td><td>'+(p*100).toLocaleString("ru")+'%</td></tr>').join("")+'<tr><td>любая пара ×'+String(SLOT.pair[1]).replace(".",",")+'</td><td>'+SLOT.pair[0]*100+'%</td></tr></table><p>В среднем возвращается около 90% ставок.</p></details></div>';
    $("cs-slgo").onclick=slotGo}
  if(csTab==="hl"){const H=K.hl;
    B.innerHTML='<div class="cs-box"><h3>🃏 БОЛЬШЕ ИЛИ МЕНЬШЕ</h3><div class="sub">Угадай, следующая карта старше или младше. Каждая угаданная умножает выигрыш. Забирай когда хочешь</div>'+
      '<div class="hlc"><div class="hcard'+(H?"":" back")+'" id="hl-c">'+(H?hlFace(H.c):"")+'</div><div class="hlm" id="hl-m">'+(H?"ставка "+fmtN(H.b)+"<b>×"+String(H.m).replace(".",",")+"</b>"+(H.s?"угадано: "+H.s:"угадай первую"):"сделай ставку")+'</div></div>'+
      (H?'<div class="hlb"><button type="button" class="up" data-dir="up"'+(hlP(H.c,"up")<=0?" disabled":"")+'>⬆ БОЛЬШЕ<small>'+hlNext(H,"up")+'</small></button><button type="button" class="dn" data-dir="down"'+(hlP(H.c,"down")<=0?" disabled":"")+'>⬇ МЕНЬШЕ<small>'+hlNext(H,"down")+'</small></button></div>'+
        '<button type="button" class="cs-go" id="hl-take"'+(H.s?"":" disabled")+'>'+(H.s?"ЗАБРАТЬ "+fmtN(Math.floor(H.b*H.m))+" 💠":"сначала угадай одну карту")+'</button>'
       :bets+'<button type="button" class="cs-go" id="hl-go">НАЧАТЬ · '+fmtN(csBet)+' 💠</button>')+
      '<details class="cs-odds"><summary>Как считается</summary><p>Чем меньше шанс угадать, тем больше множитель. Одинаковая карта — проигрыш. В среднем возвращается 95% на каждом шаге.</p></details></div>';
    if(H){B.querySelectorAll("[data-dir]").forEach(b=>b.onclick=()=>hlGo(b.dataset.dir));$("hl-take").onclick=hlTake}else $("hl-go").onclick=hlStart}
  const bb=$("cs-bets");if(bb)bb.onclick=e=>{const b=e.target.closest("[data-bet]");if(!b)return;csBet=+b.dataset.bet;renderCas()}}
$("cs-seg").onclick=e=>{const b=e.target.closest("[data-c]");if(!b||csBusy)return;csTab=b.dataset.c;renderCas()};
$("cs-back").onclick=()=>{if(!csBusy)openCamp()};$("cs-entry").onclick=()=>openCas();
async function caseOpen(){if(csBusy)return;if(campView().runes<CASE.price){toast("Нужно ещё "+fmtN(CASE.price-campView().runes)+" рун — потренируйся в лагере");return}
  csBusy=true;$("cs-open").disabled=true;const r=await act("cas_case");if(!r){csBusy=false;renderCas();return}
  const won=r.g?PRZ.find(z=>z.g===r.g.k):r.sold?PRZ[0]:PRZ.find(z=>z.r===r.r)||PRZ[0];const N=48,W=42,items=[];for(let i=0;i<N;i++)items.push(i===W?won:rollPrz());
  const tr=$("cs-tr"),st=$("cs-strip");tr.style.transition="none";tr.style.transform="translateX(0)";tr.innerHTML=items.map(csTile).join("");void tr.offsetWidth;
  const sw=st.getBoundingClientRect().width,tw=106,target=W*tw+50-sw/2+Math.round((Math.random()-.5)*60);
  tr.style.transition="transform 5.6s cubic-bezier(.08,.6,.12,1)";tr.style.transform="translateX(-"+target+"px)";let last=-1;
  const tick=()=>{if(!csBusy)return;const m=new DOMMatrix(getComputedStyle(tr).transform),i=Math.floor((-m.m41+sw/2)/tw);if(i!==last){last=i;tone(900+Math.random()*200,.025,"square",.03);hap("light")}requestAnimationFrame(tick)};tick();
  setTimeout(()=>{csBusy=false;if(r.g){wReveal(r.g,"🎁 "+GIFTS[r.g.k].n,GIFTS[r.g.k].luck?"Из кейса «Удача»!":"НЕВЕРОЯТНО! Корона Эпох из кейса!",'<button type="button" class="craftbtn" data-put="'+r.g.id+'">🏛 Поставить на витрину</button>')}
    else{sfx.coin();hapN("success");toast((r.sold?"Тираж «"+GIFTS[r.sold].n+"» закончился — ":"")+"+"+fmtN(r.r)+" рун 💠");const R=st.getBoundingClientRect();boom(R.left+R.width/2,R.top+R.height/2,won.c)}renderCas()},5900)}
let boomFx=null;function boom(x,y,c){if(!boomFx){const cv=document.createElement("canvas");cv.style.cssText="position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:250";document.body.append(cv);boomFx=wFx(cv)}boomFx.fit();boomFx.burst(x,y,60,[c,"#fff","#ffd23f","#7fe7ff"],8,.15,70,5)}
async function slotGo(){if(csBusy)return;if(campView().runes<csBet){toast("Не хватает рун на ставку");return}csBusy=true;$("cs-slgo").disabled=true;$("sl-res").textContent="";$("sl-res").className="slres";
  const r=await act("cas_slot",{bet:csBet});if(!r){csBusy=false;renderCas();return}const sym=SLOT.sym,res=$("sl-res");
  [0,1,2].forEach(i=>{const el=$("sl"+i),s=el.querySelector(".st"),n=16+i*6,list=[];el.classList.remove("win");for(let k=0;k<n;k++)list.push(sym[Math.floor(Math.random()*sym.length)]);list.push(r.reels[i]);
    s.style.transition="none";s.style.transform="translateY(0)";s.innerHTML=list.map(x=>"<div>"+x+"</div>").join("");void s.offsetWidth;
    s.style.transition="transform "+(1.1+i*.45)+"s cubic-bezier(.2,.7,.2,1.04)";s.style.transform="translateY(-"+(n*110)+"px)";setTimeout(()=>{tone(300+i*120,.06,"square",.05);hap("medium")},(1.1+i*.45)*1000)});
  setTimeout(()=>{csBusy=false;if(r.win){res.className="slres w";res.textContent=(r.m>=8?"🔥 ДЖЕКПОТ! ":"")+"+"+fmtN(r.win)+" 💠 (×"+String(r.m).replace(".",",")+")";
      const same=r.reels.map((x,i)=>r.reels.filter(y=>y===x).length>1?i:-1).filter(i=>i>=0);same.forEach(i=>$("sl"+i).classList.add("win"));
      sfx.coin();hapN("success");const R=$("sl1").getBoundingClientRect();boom(R.left+R.width/2,R.top+R.height/2,r.m>=8?"#ff9f0a":"#ffd23f");if(r.m>=8)setTimeout(()=>sfx.fanfare(),200)}
    else{res.textContent="Мимо. Ещё разок?"}csBal();$("cs-slgo").disabled=false},2200)}
const HLR=["","A","2","3","4","5","6","7","8","9","10","J","Q","K"],HLS=["♥","♦","♠","♣"];
function hlFace(c){const s=HLS[(c*7)%4];return '<b>'+HLR[c]+'</b><i>'+s+'</i><b>'+HLR[c]+'</b>'}
function hlNext(H,dir){const p=hlP(H.c,dir);if(p<=0)return "нельзя";const m=Math.min(HL.cap,H.m*HL.k/p);return "×"+m.toFixed(2).replace(".",",")+" · "+Math.round(p*100)+"%"}
function hlCard(c){const e=$("hl-c");e.className="hcard flip"+(HLS[(c*7)%4]==="♠"||HLS[(c*7)%4]==="♣"?" bk":"");e.innerHTML=hlFace(c)}
async function hlStart(){if(csBusy)return;if(campView().runes<csBet){toast("Не хватает рун на ставку");return}csBusy=true;const r=await act("cas_hl_go",{bet:csBet});csBusy=false;if(r){tone(600,.05,"square",.04);renderCas();hlCard(r.hl.c)}else renderCas()}
async function hlGo(dir){if(csBusy)return;csBusy=true;const r=await act("cas_hl",{dir});csBusy=false;if(!r){renderCas();return}
  if(r.win){renderCas();hlCard(r.n);sfx.coin();hap("medium");const R=$("hl-c").getBoundingClientRect();boom(R.left+R.width/2,R.top+R.height/2,"#47e891")}
  else{hlCard(r.n);hapN("error");$("hl-m").innerHTML="Не угадал 😬<b>−"+fmtN(r.lost)+"</b>";B_dis();setTimeout(renderCas,1500)}}
function B_dis(){document.querySelectorAll("#cs-body .hlb button,#hl-take").forEach(b=>b.disabled=true)}
async function hlTake(){if(csBusy)return;csBusy=true;const r=await act("cas_hl_take");csBusy=false;if(r){sfx.coin();hapN("success");toast("+"+fmtN(r.win)+" рун 💠");const R=$("hl-c").getBoundingClientRect();boom(R.left+R.width/2,R.top+R.height/2,"#ffd23f")}renderCas()}

/* ---------- голем ---------- */
const GOLEM_SVG='<svg viewBox="0 0 100 100" width="62" height="62" aria-hidden="true"><defs><radialGradient id="gmg" cx=".35" cy=".3"><stop offset="0" stop-color="#e8edf5"/><stop offset=".6" stop-color="#8f9bb3"/><stop offset="1" stop-color="#3a4258"/></radialGradient></defs><g stroke="#0d1030" stroke-width="3" stroke-linejoin="round"><rect x="26" y="42" width="48" height="42" rx="10" fill="url(#gmg)"/><rect x="30" y="14" width="40" height="30" rx="10" fill="url(#gmg)"/><rect x="36" y="24" width="10" height="8" rx="3" fill="#7fe7ff"/><rect x="54" y="24" width="10" height="8" rx="3" fill="#7fe7ff"/><rect x="10" y="46" width="16" height="28" rx="7" fill="url(#gmg)"/><rect x="74" y="46" width="16" height="28" rx="7" fill="url(#gmg)"/><path d="M50 14 V6"/><circle cx="50" cy="5" r="4" fill="#ff2e63"/><rect x="40" y="54" width="20" height="14" rx="4" fill="#ffd23f"/></g><circle cx="41" cy="28" r="7" fill="#7fe7ff" opacity=".4"/><circle cx="59" cy="28" r="7" fill="#7fe7ff" opacity=".4"/></svg>';
function drawGolem(){const b=$("cp-golem");if(!b)return;if(!ONLINE||!S.shopOn){b.hidden=true;return}b.hidden=false;const u=S.golemUntil||0,on=u>NOW(),V=campView();b.classList.toggle("on",on);
  b.innerHTML='<div class="gb">'+GOLEM_SVG+'</div><div><b>🗿 КАМЕННЫЙ ГОЛЕМ'+(on?" · РАБОТАЕТ":"")+'</b><small>'+(on?"Энергия ×2 ("+V.mx+") и восстанавливается в 2 раза быстрее. "+(u>=9e15?"Навсегда!":"До "+new Date(u).toLocaleDateString("ru")):"Энергии в 2 раза больше и она восстанавливается в 2 раза быстрее. Больше ударов — больше рун")+'</small></div>'+
    (on&&u>=9e15?"":'<div class="gbt"><button type="button" data-gw="0">⭐ '+GOLEM.w+' · '+(on?"+7 дней":"неделя")+'</button><button type="button" class="alt" data-gw="1">⭐ '+GOLEM.f+' · навсегда</button></div>')}
$("cp-golem").onclick=e=>{const t=e.target.closest("[data-gw]");if(t)buyItem({item:"golem",forever:+t.dataset.gw})};
const _renderCamp=renderCamp;renderCamp=function(light){_renderCamp(light);if(!light&&!$("sec-camp").hidden)drawGolem()};

/* ---------- 3D-эффекты лагеря: ударная волна, искры на холсте, крит со вспышкой ---------- */
let w3=null;
const _campFx=campFx;campFx=function(x,y,big){const ar=$("cp-ar"),r=ar.getBoundingClientRect(),lx=x-r.left,ly=y-r.top;
  if(!w3){w3=wFx($("w3fx"))}else if(Math.abs($("w3fx").width-r.width*Math.min(2,devicePixelRatio||1))>2)w3.fit();
  const sl=document.createElementNS("http://www.w3.org/2000/svg","svg");sl.setAttribute("viewBox","0 0 100 100");sl.setAttribute("class","cp-slash");sl.style.left=lx+"px";sl.style.top=ly+"px";sl.style.setProperty("--r",(Math.random()*120-60)+"deg");
  sl.innerHTML='<path d="M8 70 Q50 -6 92 34" fill="none" stroke="#fff" stroke-width="'+(big?12:8)+'" stroke-linecap="round" opacity=".95"/><path d="M14 66 Q50 6 86 36" fill="none" stroke="#ffd60a" stroke-width="3" stroke-linecap="round"/>';ar.append(sl);setTimeout(()=>sl.remove(),300);
  const s=document.createElement("i");s.className="w3shock";s.style.left=lx+"px";s.style.top=ly+"px";ar.append(s);setTimeout(()=>s.remove(),460);
  w3.burst(lx,ly,big?26:14,big?["#fff6c8","#ffd23f","#ff9f0a","#ff2e63"]:["#fff6c8","#ffd23f","#7fe7ff"],big?8:5.5,.25,big?50:36,big?5:4)};
const _campFloat=campFloat;campFloat=function(t,cls,x,y){_campFloat(t,cls,x,y);if(cls==="crit"){const ar=$("cp-ar");if(!ar)return;const f=document.createElement("div");f.className="w3flash";ar.append(f);setTimeout(()=>f.remove(),360);
  const c=document.createElement("div");c.className="w3crit";c.textContent=t.replace("💥 ","")+"!";ar.append(c);setTimeout(()=>c.remove(),820);if(w3){const r=ar.getBoundingClientRect();w3.burst(r.width*.62,r.height*.5,50,["#fff6c8","#ffd23f","#ff9f0a","#ff2e63"],9,.25,60,6)}}};

/* ---------- что нового и ссылки ---------- */
function newsGifts(){if(!S||!ONLINE||!S.shopOn||!$("modal").hidden||document.querySelector(".wrev,.onb-hl"))return false;try{if(localStorage.getItem("we-news-gift1"))return true;localStorage.setItem("we-news-gift1","1")}catch(e){return true}
  const m=$("modal"),sh=$("msheet");m.hidden=false;
  sh.innerHTML='<div class="box nickbox newsb"><h3>🎁 Подарки, витрины и казино!</h3><div style="display:flex;justify-content:center;gap:4px">'+giftSVG("crown",84)+giftSVG("ring",84)+giftSVG("cup",84)+'</div><ul>'+
   '<li>🎁 <b>Подарки Эпох</b> — у каждого свой тираж, номер навсегда на подарке</li><li>🏛 <b>Витрина</b> — 9 мест для подарков, топ витрин, дари друзьям</li>'+
   '<li>🎰 <b>Казино рун</b> в лагере: кейс как в CS:GO, слоты и «больше-меньше»</li><li>🗿 <b>Каменный голем</b> — энергии ×2 в лагере</li><li>🎯 Лагерь стал объёмным — бей мишень!</li></ul>'+
   '<button type="button" class="craftbtn" id="ng-go">Смотреть подарки</button><button type="button" class="ghost" id="ng-x">Позже</button></div>';
  $("ng-go").onclick=()=>{closeModal();openGold("gifts")};$("ng-x").onclick=closeModal;return true}
{let n=0;const t=setInterval(()=>{if(++n>30||newsGifts())clearInterval(t)},4000)}
if(new URLSearchParams(location.search).get("shelf"))setTimeout(()=>{try{openShelf()}catch(e){}},1200);
$("shelf-go").onclick=()=>openShelf();
