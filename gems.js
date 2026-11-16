/* ===== Кузня гемов стихий (клиент) ===== */
/* рисованные гемы: 🔥 рубин-пламя, 💧 сапфир, 🌍 изумруд, 🌪 небесный алмаз. Уровень = сильнее сияние и лучи */
let gemN=0;
const GEMC={f:["#ffd0a0","#ff4a1a","#8a0a14","#ff8a3a"],w:["#c8f0ff","#2f8bff","#0a1f6a","#6ad0ff"],e:["#d8ffb0","#2fc85a","#0a4a24","#8aff6a"],a:["#ffffff","#a8e8ff","#4a6a9a","#e0f8ff"]};
function gemSVG(k,lv,sz){lv=Math.max(1,Math.min(5,lv|0||1));const C=GEMC[k]||GEMC.a,u="gm"+(++gemN),S2=sz||44;
  /* внешний контур и «площадка» (table) — грани между ними раскрашиваются по-разному, как у настоящей огранки */
  const P={f:[[50,4],[60,16],[70,32],[76,50],[75,68],[68,82],[50,94],[32,82],[25,68],[24,50],[30,32],[40,16]],
    w:[[50,6],[72,12],[88,28],[94,50],[88,72],[72,88],[50,94],[28,88],[12,72],[6,50],[12,28],[28,12]],
    e:[[30,8],[70,8],[84,20],[90,36],[90,64],[84,80],[70,92],[30,92],[16,80],[10,64],[10,36],[16,20]],
    a:[[50,4],[70,14],[86,30],[88,52],[78,74],[62,90],[50,96],[38,90],[22,74],[12,52],[14,30],[30,14]]}[k]||[];
  const cx=50,cy=k==="f"?58:50,tk={f:.42,w:.5,e:.56,a:.42}[k],T=P.map(([x,y])=>[cx+(x-cx)*tk,cy+(y-cy)*tk]),pt=a=>a.map(q=>q[0].toFixed(1)+","+q[1].toFixed(1)).join(" ");
  const lit=[1,.82,.62,.45,.32,.25,.38,.55,.7,.88,1,1.08];   // свет падает слева сверху
  let fac="";for(let i=0;i<P.length;i++){const n=(i+1)%P.length,L=lit[i%12],a=P[i],b=P[n],c=T[n],d=T[i],m=[(a[0]+b[0])/2,(a[1]+b[1])/2];
    fac+=`<polygon points="${pt([a,m,d])}" fill="${L>.8?C[0]:L>.5?C[3]:C[1]}" opacity="${(.35+L*.5).toFixed(2)}"/><polygon points="${pt([m,b,c,d])}" fill="${L>.9?C[0]:L>.55?C[1]:C[2]}" opacity="${(.45+L*.45).toFixed(2)}"/>`}
  let star="";[[30,24,1.1],[70,70,.8],[62,22,.7]].slice(0,1+Math.ceil(lv/2)).forEach(([x,y,s2],i)=>{star+=`<g transform="translate(${x} ${y}) scale(${s2})"><path d="M0 -9 L2 -2 L9 0 L2 2 L0 9 L-2 2 L-9 0 L-2 -2Z" fill="#fff"><animate attributeName="opacity" values="0;1;0" dur="${1.6+i*.7}s" begin="${i*.5}s" repeatCount="indefinite"/><animateTransform attributeName="transform" type="scale" values=".3;1.2;.3" dur="${1.6+i*.7}s" begin="${i*.5}s" repeatCount="indefinite"/></path></g>`});
  let rays="";if(lv>=3)for(let i=0;i<(lv-1)*2;i++){const a=i/((lv-1)*2)*Math.PI*2;rays+=`<path d="M50 50 L${(50+Math.cos(a-.07)*72).toFixed(1)} ${(50+Math.sin(a-.07)*72).toFixed(1)} L${(50+Math.cos(a+.07)*72).toFixed(1)} ${(50+Math.sin(a+.07)*72).toFixed(1)}Z" fill="${C[3]}" opacity=".3"/>`}
  const core={f:`<path d="M50 84 Q36 72 42 58 Q45 66 50 64 Q46 50 56 40 Q56 54 62 60 Q66 74 50 84Z" fill="#ffe27a" opacity=".85"><animateTransform attributeName="transform" type="scale" values="1 1;1.04 1.1;.98 .95;1 1" dur=".8s" repeatCount="indefinite" additive="sum"/></path><path d="M50 82 Q44 74 48 66 Q52 72 54 70 Q58 78 50 82Z" fill="#fff" opacity=".8"/>`,
    w:`<path d="M10 60 Q28 52 50 60 T90 60 V96 H10Z" fill="#fff" opacity=".18"><animateTransform attributeName="transform" type="translate" values="-12 0;12 0;-12 0" dur="2.6s" repeatCount="indefinite"/></path><circle cx="40" cy="70" r="2.5" fill="#fff" opacity=".7"><animate attributeName="cy" values="78;34" dur="2.2s" repeatCount="indefinite"/><animate attributeName="opacity" values="0;.8;0" dur="2.2s" repeatCount="indefinite"/></circle><circle cx="60" cy="70" r="1.8" fill="#fff"><animate attributeName="cy" values="80;30" dur="2.8s" begin=".8s" repeatCount="indefinite"/><animate attributeName="opacity" values="0;.8;0" dur="2.8s" begin=".8s" repeatCount="indefinite"/></circle>`,
    e:`<path d="M34 64 L42 52 L48 62 L56 46 L66 64Z" fill="#0a3a1a" opacity=".35"/><path d="M42 52 L48 62 L56 46" stroke="#d8ffb0" stroke-width="1.5" fill="none" opacity=".7"/>`,
    a:`<g opacity=".8"><animateTransform attributeName="transform" type="rotate" from="0 50 50" to="360 50 50" dur="3.2s" repeatCount="indefinite"/><path d="M26 50 Q50 28 74 50" stroke="#fff" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M34 58 Q50 44 66 58" stroke="#fff" stroke-width="2.2" fill="none" stroke-linecap="round" opacity=".7"/><path d="M42 64 Q50 58 58 64" stroke="#fff" stroke-width="1.6" fill="none" stroke-linecap="round" opacity=".6"/></g>`}[k]||"";
  return `<svg class="gemsvg" viewBox="-12 -12 124 124" width="${S2}" height="${S2}" aria-hidden="true"><defs>
   <radialGradient id="${u}g" cx=".35" cy=".28" r=".85"><stop offset="0" stop-color="${C[0]}"/><stop offset=".4" stop-color="${C[1]}"/><stop offset="1" stop-color="${C[2]}"/></radialGradient>
   <radialGradient id="${u}t" cx=".4" cy=".35" r=".7"><stop offset="0" stop-color="#fff" stop-opacity=".9"/><stop offset=".35" stop-color="${C[3]}" stop-opacity=".7"/><stop offset="1" stop-color="${C[1]}" stop-opacity=".3"/></radialGradient>
   <radialGradient id="${u}h"><stop offset="0" stop-color="${C[3]}" stop-opacity="${(.2+lv*.12).toFixed(2)}"/><stop offset="1" stop-color="${C[3]}" stop-opacity="0"/></radialGradient>
   <linearGradient id="${u}s" x1="0" y1="0" x2="1" y2="1"><stop offset=".4" stop-color="#fff" stop-opacity="0"/><stop offset=".5" stop-color="#fff" stop-opacity=".6"/><stop offset=".6" stop-color="#fff" stop-opacity="0"/>
    <animate attributeName="x1" values="-1.4;1.4" dur="${(3.4-lv*.3).toFixed(1)}s" repeatCount="indefinite"/><animate attributeName="x2" values="-.4;2.4" dur="${(3.4-lv*.3).toFixed(1)}s" repeatCount="indefinite"/></linearGradient>
   <clipPath id="${u}c"><polygon points="${pt(P)}"/></clipPath></defs>
   ${rays?`<g>${rays}<animateTransform attributeName="transform" type="rotate" from="0 50 50" to="360 50 50" dur="14s" repeatCount="indefinite"/></g>`:""}
   <circle cx="50" cy="52" r="${42+lv*3}" fill="url(#${u}h)"><animate attributeName="r" values="${42+lv*3};${48+lv*4};${42+lv*3}" dur="2.2s" repeatCount="indefinite"/></circle>
   <ellipse cx="50" cy="100" rx="30" ry="5" fill="#000" opacity=".35"/>
   <polygon points="${pt(P)}" fill="url(#${u}g)"/>
   <g clip-path="url(#${u}c)">${fac}<polygon points="${pt(T)}" fill="url(#${u}t)"/>${core}
    <g stroke="${C[0]}" stroke-opacity=".55" stroke-width="1" fill="none">${P.map((a,i)=>`<path d="M${a[0]} ${a[1]} L${T[i][0].toFixed(1)} ${T[i][1].toFixed(1)}"/>`).join("")}<polygon points="${pt(T)}"/></g>
    <rect x="-20" y="-20" width="140" height="140" fill="url(#${u}s)"/></g>
   <polygon points="${pt(P)}" fill="none" stroke="#0b0712" stroke-width="4.5" stroke-linejoin="round"/>
   <polyline points="${pt(P.slice(9).concat(P.slice(0,2)))}" fill="none" stroke="#fff" stroke-opacity=".75" stroke-width="2.5" stroke-linejoin="round" transform="translate(${cx} ${cy}) scale(.9) translate(${-cx} ${-cy})"/>
   ${star}
   <g fill="#ffd23f" stroke="#0b0712" stroke-width="2">${Array.from({length:lv},(_,i)=>`<path transform="translate(${(50+(i-(lv-1)/2)*14).toFixed(1)} 106)" d="M0 -6 L1.8 -1.8 L6 -1.5 L2.8 1.2 L3.7 5.5 L0 3.2 L-3.7 5.5 L-2.8 1.2 L-6 -1.5 L-1.8 -1.8Z"/>`).join("")}</g></svg>`}
const gemI=(g,sz)=>gemSVG(g[0],+g.slice(1)||1,sz);
const GEMV={tab:"forge",card:null};
function gemName(g){const E=GEM.el[g[0]];return E?E.ic+" "+E.n+" "+g.slice(1)+" ур.":g}
function gemSrc(k){return {e:"🏕 Лагерь: тренировки и оруженосец",f:"🛡 Кланы: удары по боссу",a:"🐉 Дракон: тапы, игры, походы",w:"🎯 Задания и серия дней"}[k]}
function gemOpen(c){if(!S)return;GEMV.card=c||null;GEMV.tab=c?"put":GEMV.tab;const m=$("modal");m.hidden=false;gemDraw()}
function gemDraw(){const sh=$("msheet"),H=S.gsh||{},I=S.gems||{},d=today(Date.now()),fd=S.gfd&&S.gfd.d===d?S.gfd.n:0,gd=S.gsd&&S.gsd.d===d?S.gsd:{};
  let h='<div class="gemw"><div class="gem-h"><b>💎 Кузня гемов</b><button type="button" class="ghost" id="gm-x">✕</button></div>';
  h+='<div class="gem-tabs">'+[["forge","🔨 Выбить"],["box","📦 Сундуки"],["up","⬆️ Улучшить"],["put","🃏 Вставить"],["info","❓"]].map(([k,n])=>'<button type="button" data-t="'+k+'" class="'+(GEMV.tab===k?"on":"")+'">'+n+'</button>').join("")+'</div>';
  h+='<div class="gem-sh">'+Object.keys(GEM.el).map(k=>'<div><i>'+gemSVG(k,1,34)+'</i><b>'+(H[k]||0)+'</b><small>сегодня '+(gd[k]||0)+'/'+GEM.cap[k]+'</small></div>').join("")+'</div>';
  if(GEMV.tab==="forge"){h+='<p class="gem-p">Попытка: <b>'+GEM.cost.sh+' осколков</b> + <b>'+fmtC(GEM.cost.cash)+'</b>. Шанс '+Math.round(GEM.cost.ch*100)+'%. При неудаче вернётся '+GEM.cost.back+' осколков. Попыток сегодня: <b>'+(GEM.cost.day-fd)+'/'+GEM.cost.day+'</b></p>';
    h+=Object.keys(GEM.el).map(k=>'<button type="button" class="gem-go" data-k="'+k+'"'+((H[k]||0)<GEM.cost.sh||fd>=GEM.cost.day?" disabled":"")+'><span class="gem-gi">'+gemSVG(k,1,48)+'</span><span>Выбить гем «'+GEM.el[k].n+'»<small>'+gemSrc(k)+'</small></span></button>').join("")}
  if(GEMV.tab==="box"){const el=GEMV.el||(GEMV.el="f");
    h+='<p class="gem-p">Выбери стихию — все гемы и осколки из сундука будут этой стихии. Шансы честные и написаны на сундуке.</p><div class="gbx-el">'+Object.keys(GEM.el).map(k=>'<button type="button" data-el="'+k+'" class="'+(k===el?"on":"")+'">'+gemSVG(k,2,40)+'<small>'+GEM.el[k].n+'</small></button>').join("")+'</div>';
    h+=["gbox1","gbox2","gbox3"].map((k,i)=>{const I=SHOP[k];return '<div class="gbx gbx'+(i+1)+'"><div class="gbx-ic">'+gemSVG(el,[2,3,4][i],64)+(i?gemSVG(el,[2,3,3][i],40):"")+'</div><div class="gbx-b"><b>'+I.n+'</b><ul>'+I.d.map(x=>"<li>"+x+"</li>").join("")+'</ul><button type="button" class="buy gbx-go" data-k="'+k+'">⭐ '+I.stars+'</button></div></div>'}).join("")}
  if(GEMV.tab==="up"){const L=Object.keys(I).filter(g=>I[g]>0).sort();h+='<p class="gem-p">3 одинаковых гема → попытка получить гем уровнем выше. При неудаче сгорает 1 гем. Шансы: 50% → 30% → 15% → 5%.</p>';
    h+=L.length?L.map(g=>{const lv=+g.slice(1);return '<div class="gem-row"><span class="gem-gi">'+gemI(g,46)+'</span><span style="flex:1;min-width:0"><b>'+GEM.el[g[0]].n+' '+lv+' ур.</b> ×'+I[g]+'<small>+'+Math.round(GEM.b[lv]*100)+'% к силе</small></span>'+(lv<5?'<button type="button" class="craftbtn gem-up" data-g="'+g+'"'+(I[g]<3?" disabled":"")+'>'+Math.round(GEM.up.ch[lv]*100)+'% · '+fmtC(GEM.up.cash[lv])+'</button>':'<b>МАКС</b>')+'</div>'}).join(""):'<p class="gem-p">Гемов пока нет. Выбей первый во вкладке «Выбить».</p>'}
  if(GEMV.tab==="put"){const L=Object.keys(I).filter(g=>I[g]>0).sort((a,b)=>b.slice(1)-a.slice(1)),SK=S.gsock||{};
    const cs=S.cards.filter(c=>gemSlots(c)>0).sort((a,b)=>(GEMV.card&&b.id===GEMV.card.id)-(GEMV.card&&a.id===GEMV.card.id)||cardPow(b)-cardPow(a)).slice(0,40);
    h+='<p class="gem-p">Гемы вставляются в эпик и выше (1 слот), в мифик и ошибку печати — 2 слота. Вынуть гем: '+fmtC(GEM.pull.cash)+', шанс '+Math.round(GEM.pull.brk*100)+'% что разобьётся.</p>';
    h+=cs.length?cs.map(c=>{const g=SK[c.id]||[],n=gemSlots(c);let r='<div class="gem-card"><div class="gem-cn"><b>'+escH(HEROES[c.h][0])+'</b><small>'+(FIN[c.f]?FIN[c.f].k:"")+' · сила '+fmt(cardPow({...c,gm:g}))+'</small></div><div class="gem-slots">';
      for(let i=0;i<n;i++)r+=g[i]?'<button type="button" class="gem-s full" data-pull="'+c.id+'" data-i="'+i+'">'+gemI(g[i],46)+'</button>':(L.length?'<select class="gem-s" data-put="'+c.id+'"><option value="">＋</option>'+L.map(x=>'<option value="'+x+'">'+gemName(x)+'</option>').join("")+'</select>':'<span class="gem-s">＋</span>');
      return r+'</div></div>'}).join(""):'<p class="gem-p">Нет карт эпик и выше.</p>'}
  if(GEMV.tab==="info")h+='<div class="gem-p">1. Собирай осколки: 🌍 в лагере, 🔥 в клане, 🌪 у дракона, 💧 за задания. У каждого источника дневной лимит.<br>2. В кузне меняй '+GEM.cost.sh+' осколков + монеты на попытку выбить гем (шанс '+Math.round(GEM.cost.ch*100)+'%).<br>3. Три одинаковых гема — шанс улучшить до следующего уровня (до 5).<br>4. Вставляй гемы в карты: +3/6/10/15/22% к силе в боях, клане и Империи.</div>';
  sh.innerHTML=h+'</div>';
  $("gm-x").onclick=closeModal;sh.querySelectorAll(".gem-tabs button").forEach(b=>b.onclick=()=>{GEMV.tab=b.dataset.t;gemDraw()});
  sh.querySelectorAll("[data-el]").forEach(b=>b.onclick=()=>{GEMV.el=b.dataset.el;gemDraw()});
  sh.querySelectorAll(".gbx-go").forEach(b=>b.onclick=()=>{closeModal();buyItem({item:b.dataset.k,el:GEMV.el||"f"})});
  sh.querySelectorAll(".gem-go").forEach(b=>b.onclick=async()=>{b.disabled=true;const r=await act("gem_roll",{k:b.dataset.k});if(r)toast(r.ok?"💎 ВЫБИЛ! "+gemName(r.g):"Не повезло… вернулось "+GEM.cost.back+" осколков");gemDraw()});
  sh.querySelectorAll(".gem-up").forEach(b=>b.onclick=async()=>{b.disabled=true;const r=await act("gem_up",{g:b.dataset.g});if(r)toast(r.ok?"⬆️ Получилось: "+gemName(r.g):"Не вышло, сгорел 1 гем");gemDraw()});
  sh.querySelectorAll("select[data-put]").forEach(x=>x.onchange=async()=>{if(!x.value)return;await act("gem_put",{id:+x.dataset.put||x.dataset.put,g:x.value});gemDraw()});
  sh.querySelectorAll("[data-pull]").forEach(b=>b.onclick=async()=>{if(!confirm("Вынуть гем за "+fmtC(GEM.pull.cash).replace(/<[^>]+>/g,"")+"? С шансом "+Math.round(GEM.pull.brk*100)+"% он разобьётся."))return;const r=await act("gem_pull",{id:+b.dataset.pull||b.dataset.pull,i:+b.dataset.i});if(r)toast(r.brk?"💥 Гем разбился":"Гем вернулся в сумку");gemDraw()})}
/* гемы влияют на силу карт и на клиенте */
{const _ra=renderAll;renderAll=function(){try{if(S&&S.cards)gemAnn(S,S.cards)}catch(e){}return _ra.apply(this,arguments)}}
/* осколки за действие — всплывашка */
{const _act=act;act=async function(n,p){const r=await _act(n,p);if(r&&r.gsh){const k=r.gsh[0];toast("+"+r.gsh[1]+" "+GEM.el[k].ic+" осколков «"+GEM.el[k].n+"»")}return r}}
{const _mg=menuGo;menuGo=function(k){if(k==="gems"){menuClose();return gemOpen()}return _mg.apply(this,arguments)}}
/* ===== Карта дня (2 экземпляра) ===== */
const dcHM=t=>{const d=new Date(t+3*36e5);return String(d.getUTCHours()).padStart(2,'0')+':'+String(d.getUTCMinutes()).padStart(2,'0')};
{const _ra=renderAll;renderAll=function(){try{if(S&&S.xh)xhApply(S.xh)}catch(e){}return _ra.apply(this,arguments)}}
{const _act=act;act=async function(n,p){const r=await _act(n,p);if(r&&r.dsp)setTimeout(()=>toast("🌙 +"+r.dsp+" Особый прокрут! Крути в «Карте дня»"),900);return r}}
function dcT(ms){ms=Math.max(0,ms);const h=Math.floor(ms/36e5),m=Math.floor(ms%36e5/6e4),s=Math.floor(ms%6e4/1e3);return (h?h+"ч ":"")+m+"м "+(h?"":s+"с")}
let dcTmr=null;
function dcOpen(){if(!S)return;$("modal").hidden=false;dcDraw();clearInterval(dcTmr);dcTmr=setInterval(()=>{if($("modal").hidden||!$("dc-t")){clearInterval(dcTmr);return}dcDraw(1)},1000)}
/* настоящая карточка «Ошибка печати» — как она будет выглядеть в коллекции */
const DCF={};function dcFace(h,i){try{if(!DCF[h]){const B=cardBody(h,4,null),sn=(HEROES[h][4].sn)||"000001";DCF[h]={id:"dc"+h,h,f:4,no:1,sn,hue:B.hue,stats:B.stats,v:priceOf(h,4,1,sn,B.top),xp:0,stars:0}}return miniSlot(DCF[h])}catch(e){return portrait(h,null)}}
function dcDraw(tick){const sh=$("msheet"),L0=S.dcs||(S.dc?[S.dc]:[]),now=Date.now();
  if(tick){L0.forEach((D,i)=>{const e=$("dc-t"+i);if(e)e.textContent=now<D.at?"старт через "+dcT(D.at-now):now<D.until?"осталось "+dcT(D.until-now):"завершено"});if($("dc-x"))return}
  let h='<div class="gemw"><div class="gem-h"><b>🌙 Карта дня'+(L0.length>1?' · '+L0.length+' карты':'')+'</b><button type="button" class="ghost" id="dc-x">✕</button></div>';
  h+=dspBox(L0);
  L0.forEach((D,i)=>{if(!HEROES[D.h])return;const H=HEROES[D.h],on=now>=D.at&&now<D.until,L=D.left||{buy:0,spin:0};
    h+='<div class="dc-card"><div class="dc-mc">'+dcFace(D.h,i)+'</div><div><b class="dc-n">'+escH(H[0])+'</b><small>'+escH(H[1])+' · Ошибка печати</small><p>'+escH(H[3])+'</p><span class="dc-t" id="dc-t'+i+'"></span></div></div>';
    h+='<div class="dc-left"><div class="'+(L.buy?"":"off")+'">⭐ За звёзды<b>'+(L.buy?"1 из 1":"продано")+'</b></div><div class="'+(L.spin?"":"off")+'">🎰 Из прокрута<b>'+(D.ns?"не выпадает":L.spin?"1 из 1":"выбита")+'</b></div></div>';
    if(D.ns)h+='<div class="dc-so">💀 '+escH(H[0])+' продаётся <b>только за звёзды</b> — в Особом прокруте не выпадает.</div>';
    if(!D.ns)h+='<div class="dc-so">🎰 '+escH(H[0])+(D.so?' <b>не продаётся</b> — только выбить в Особом прокруте, всего 1 экземпляр.':' — второй экземпляр выбивается в Особом прокруте.')+' Шанс <b>'+String(+((D.ch||0)*100).toFixed(2)).replace(".",",")+'%</b> за прокрут — <b>одинаковый весь вечер</b>, от времени не зависит.</div>';
    if(!D.so)h+='<button type="button" class="gem-go dc-buy" data-h="'+D.h+'"'+(on&&L.buy?"":" disabled")+'>⭐ Купить «'+escH(H[0])+'» за '+(D.stars||SHOP.daycard.stars)+'<small>достанется тому, кто оплатит первым · с '+dcHM(D.at)+' до '+dcHM(D.until)+'</small></button>'});
  if(!L0.length)h+='<p class="gem-p">Сегодня карты дня нет. Загляни вечером!</p>';
  {const Q=S.dq&&S.dq.d===today(now)?S.dq:{c:{},got:[]};h+='<div class="dq"><b class="dq-h">🎯 Задания за Особые прокруты</b>'+DQ.map((T,i)=>{const v=Math.min(T.n,dqProg(S,now,T.k)),ok=v>=T.n,got=Q.got.includes(i);return '<div class="dq-r'+(got?' got':'')+'"><i>'+T.ic+'</i><span>'+T.t+'<u><em style="width:'+Math.round(v/T.n*100)+'%"></em></u><small>'+v+' / '+T.n+'</small></span>'+(got?'<b>✅</b>':'<button type="button" class="mini2 dq-c" data-dq="'+i+'"'+(ok?'':' disabled')+'>+1 🎰</button>')+'</div>'}).join("")+
    '<b class="dq-h" style="margin-top:6px">♾ Можно много раз (очень сложно)</b>'+DQR.map((T,i)=>{const p=dqProg(S,now,T.k),got=(Q.rg||{})[T.k]||0,can=Math.floor(p/T.per)-got,v=Math.max(0,p-got*T.per);return '<div class="dq-r"><i>'+T.ic+'</i><span>'+T.t+' = +1 🎰<u><em style="width:'+Math.min(100,Math.round(v/T.per*100))+'%"></em></u><small>'+(T.k==="ws"?"серия сейчас: "+((Q.ws)||0)+" / 30 (проигрыш — с нуля)":Math.min(T.per,v)+' / '+T.per)+(got?' · получено ×'+got:'')+'</small></span><button type="button" class="mini2 dqr-c" data-dqr="'+i+'"'+(can>0?'':' disabled')+'>+'+Math.max(1,can)+' 🎰</button></div>'}).join("")+
    '<div class="dq-r all'+(Q.all?' got':'')+'"><i>🏆</i><span>Выполни все '+DQ.length+' заданий<small>'+Q.got.length+' / '+DQ.length+'</small></span>'+(Q.all?'<b>✅</b>':'<button type="button" class="mini2 dq-c" data-dq="'+DQ.length+'"'+(Q.got.length>=DQ.length?'':' disabled')+'>+1 🎰</button>')+'</div></div>'}
  {const Q=S.dq&&S.dq.d===today(now)?S.dq:{};h+='<button type="button" class="gem-go dbuy" id="dc-bsp"'+((Q.buy||0)>=DSP_BUY.day?" disabled":"")+'>💰 Купить '+DSP_BUY.n+' Особых прокрута за '+fmtN(DSP_BUY.cash)+' 🪙<small>'+((Q.buy||0)>=DSP_BUY.day?"сегодня уже куплено — завтра снова":"раз в день · у тебя "+fmtN(Math.floor(S.cash||0))+" 🪙")+'</small></button>'}
  h+='<p class="gem-p">Особые прокруты: каждые '+DSP.per+' выполненных задания дня = 1 прокрут (до '+DSP.cap+' в день). Карта выпадает только '+(S.dc?dcHM(S.dc.at)+'–'+dcHM(S.dc.until):'вечером')+', пока второй экземпляр не выбит.</p>';
  sh.innerHTML=h+'</div>';dcDraw(1);$("dc-x").onclick=closeModal;
  sh.querySelectorAll(".dc-buy").forEach(b=>b.onclick=()=>buyItem({item:"daycard",h:+b.dataset.h}));
  if($("dc-bsp"))$("dc-bsp").onclick=async()=>{if(!confirm("Купить "+DSP_BUY.n+" Особых прокрута за "+DSP_BUY.cash.toLocaleString("ru")+" монет?"))return;$("dc-bsp").disabled=true;const r=await act("dsp_buy",{});if(r)toast("🎰 +"+r.dsp+" Особых прокрута!");dcDraw()};
  sh.querySelectorAll(".dqr-c").forEach(b=>b.onclick=async()=>{b.disabled=true;const r=await act("dqr_claim",{i:+b.dataset.dqr});if(r){try{hap("medium")}catch(e){}toast("🎰 +"+r.dsp+" Особый прокрут!")}dcDraw()});
  sh.querySelectorAll(".dq-c").forEach(b=>b.onclick=async()=>{b.disabled=true;const r=await act("dq_claim",{i:+b.dataset.dq});if(r){try{hap("medium")}catch(e){}toast("🎰 +1 Особый прокрут!")}dcDraw()});
  try{dspBind()}catch(e){}}
{const _mg=menuGo;menuGo=function(k){if(k==="dcard"){menuClose();return dcOpen()}return _mg.apply(this,arguments)}}
/* ===== Избранное в «Ещё» и вкладка «Пополнить» ===== */
window.FAVE=false;
{const _mg=menuGo;menuGo=function(k){
  if(k==="favedit"){window.FAVE=!window.FAVE;return menuOpen()}
  if(window.FAVE){let F=[];try{F=JSON.parse(localStorage.getItem("we-fav")||"[]")}catch(e){}F=F.includes(k)?F.filter(x=>x!==k):[...F,k].slice(-12);try{localStorage.setItem("we-fav",JSON.stringify(F))}catch(e){}return menuOpen()}
  if(k==="topup"){menuClose();return topupOpen()}return _mg.apply(this,arguments)}}
function topupOpen(){$("modal").hidden=false;const sh=$("msheet");
  sh.innerHTML='<div class="gemw"><div class="gem-h"><b>💳 Пополнить</b><button type="button" class="ghost" id="tp-x">✕</button></div><p class="gem-p">Звёзды покупаются прямо в Telegram — в Сокровищнице выбери набор или впиши свою сумму.</p>'+
   '<button type="button" class="gem-go" id="tp-go">⭐ Открыть Сокровищницу<small>наборы, сундуки и своя сумма звёзд</small></button>'+
   '<button type="button" class="gem-go dsp" id="tp-help">🆘 Не проходит оплата?<small>Напиши админу — поможем пополнить вручную. Укажи свой ID: '+(S&&S.uid||"—")+'</small></button></div>';
  $("tp-x").onclick=closeModal;$("tp-go").onclick=()=>{closeModal();openGold()};$("tp-help").onclick=()=>{closeModal();openSupport("pay")}}
/* ===== Война кланов за земли (гекс-карта) ===== */
let CWD=null,CWsel=-1;
const cwCol=id=>id?"hsl("+(id*67%360)+" 70% 50%)":"#2a3050";
async function cwOpen(){$("modal").hidden=false;$("msheet").innerHTML='<div class="gemw"><p class="gem-p">Загружаю карту…</p></div>';const r=await act("clan_cw",{});if(!r){closeModal();return}CWD=r;cwDraw()}
function cwDraw(){const D=CWD,sh=$("msheet"),R=34,W=7*R*1.75,H=7*R*1.6;
  let svg='<svg viewBox="'+(-W/2)+' '+(-H/2)+' '+W+' '+H+'" class="cw-map">';
  D.cells.forEach(c=>{const x=R*Math.sqrt(3)*(c.q+c.r/2),y=R*1.5*c.r,pts=[0,1,2,3,4,5].map(k=>{const a=Math.PI/180*(60*k-30);return (x+R*.95*Math.cos(a)).toFixed(1)+","+(y+R*.95*Math.sin(a)).toFixed(1)}).join(" ");
    const mine=c.o&&c.o===D.clan;svg+='<g data-c="'+c.i+'"><polygon points="'+pts+'" fill="'+cwCol(c.o)+'" stroke="'+(CWsel===c.i?"#ffd23f":mine?"#3ddc84":"#0b0712")+'" stroke-width="'+(CWsel===c.i||mine?4:2)+'"/><text x="'+x+'" y="'+(y+6)+'" text-anchor="middle" font-size="18">'+["","🛢","⛏","👑"][c.lv]+'</text>'+(c.ld?'<circle cx="'+(x+R*.5)+'" cy="'+(y-R*.45)+'" r="7" fill="'+cwCol(c.ld.c)+'" stroke="#fff" stroke-width="2"/>':'')+'</g>'});
  svg+='</svg>';const c=D.cells[CWsel];
  let h='<div class="gemw"><div class="gem-h"><b>🗺 Война за земли</b><button type="button" class="ghost" id="cw-x">✕</button></div>';
  h+='<p class="gem-p">'+(D.open?'🔥 <b>Бои идут до 22:00!</b>':'⏳ Бои каждый день <b>20:00–22:00</b>. В 22:00 клетка уходит клану с наибольшим уроном.')+' Твои атаки: <b>'+D.left+'/3</b> · каждая даёт осколки 🔥</p>'+svg;
  if(c){const mine=c.o&&c.o===D.clan;h+='<div class="cw-info"><b>'+["","🛢 Скважина","⛏ Рудник","👑 Цитадель"][c.lv]+' · ур. '+c.lv+'</b><small>Владелец: '+(c.on?escH(c.on):"никто")+(c.o?' · защита '+fmtN(c.def):'')+'</small>'+(c.ld?'<small>Лидер сегодня: '+escH(c.ld.n)+' — '+fmtN(c.ld.d)+' урона</small>':'')+(c.my?'<small>Урон твоего клана: '+fmtN(c.my)+'</small>':'')+
    (D.clan&&!mine?'<button type="button" class="gem-go" id="cw-hit"'+(D.open&&D.left>0?"":" disabled")+'>⚔️ Атаковать клетку</button>':mine?'<small style="color:#3ddc84">✅ Ваша земля: каждый вечер даёт клану монеты и осколки 🔥</small>':'<small>Вступи в клан, чтобы воевать</small>')+'</div>'}
  else h+='<p class="gem-p">Нажми на клетку. Первую землю берут с края, дальше — только соседние. 👑 в центре даёт больше всех.</p>';
  if(D.top.length)h+='<div class="cw-top"><b>Топ кланов по землям</b>'+D.top.map((t,i)=>'<div><i style="background:'+cwCol(t.id)+'"></i>'+(i+1)+'. '+escH(t.name)+'<b>'+t.n+'</b></div>').join("")+'</div>';
  sh.innerHTML=h+'</div>';$("cw-x").onclick=closeModal;
  sh.querySelectorAll("[data-c]").forEach(g=>g.onclick=()=>{CWsel=+g.dataset.c;cwDraw()});
  if($("cw-hit"))$("cw-hit").onclick=async()=>{$("cw-hit").disabled=true;const r=await act("clan_cw_hit",{cell:CWsel});if(r){hap&&hap("heavy");toast((r.crit?"💥 КРИТ! ":"⚔️ ")+fmtN(r.dmg)+" урона"+(r.sh?" · +"+r.sh+" 🔥":""))}const r2=await act("clan_cw",{});if(r2)CWD=r2;cwDraw()}}
{const _dc=drawClan;drawClan=function(){_dc.apply(this,arguments);try{const b=$("clan-body");if(!b||$("sec-clan").hidden||!clData||b.querySelector(".cw-ban"))return;if(!clData.clan){const d=document.createElement("div");d.className="cw-ban";d.innerHTML='<i>🗺</i><span><b>Война за земли</b><small>Бои кланов каждый день 20:00–22:00. Вступи в клан или создай свой ниже, чтобы участвовать ⚔️</small></span>';b.prepend(d);return}const d=document.createElement("button");d.type="button";d.className="cw-ban";d.innerHTML='<i>🗺</i><span><b>Война за земли</b><small>Каждый день 20:00–22:00 · захватывай клетки, получай монеты и осколки 🔥</small></span>';d.onclick=e=>{e.stopPropagation();cwOpen()};b.prepend(d)}catch(e){}}}
/* ===== Анимация открытия сундука перед показом наград ===== */
{const _sg=showGrant;showGrant=function(R,title){const cs=(R&&R.cards)||[];if(!cs.length)return _sg(R,title);
  const best=Math.max(...cs.map(c=>Math.max(HEROES[c.h][2],c.f>=4?4:c.f>=3?3:0))),col=["#c8d0e0","#3ddc84","#2f8bff","#bf5af2","#ffd23f"][best];
  const m=$("modal"),sh=$("msheet");m.hidden=false;sh.innerHTML='<div class="chst" style="--g:'+col+'"><div class="chst-rays"></div><div class="chst-box"><div class="chst-lid"></div><div class="chst-body"></div><div class="chst-lock"></div></div><p>Нажми, чтобы открыть!</p></div>';
  let done=false;const go=()=>{if(done)return;done=true;const x=sh.querySelector(".chst");x.classList.add("open");try{hap&&hap("heavy");sfx.coin()}catch(e){}setTimeout(()=>{try{burst(best>=3?3:1)}catch(e){}_sg(R,title)},650)};
  sh.querySelector(".chst").onclick=go;setTimeout(go,2200)}}
/* ===== Гемы в окне карточки + анимация вставки ===== */
{const _ocv=openCardView;openCardView=function(c,o){_ocv(c,o);try{if(!o||!o.mine||!S)return;const n=gemSlots(c);if(!n)return;const sh=$("msheet"),info=sh.querySelector(".cv-info");if(!info||sh.querySelector(".gem-cv"))return;
  const g=(S.gsock||{})[c.id]||[],d=document.createElement("div");d.className="gem-cv";let h='<b>💎 Гемы</b><div class="gem-slots">';
  for(let i=0;i<n;i++)h+=g[i]?'<span class="gem-s full el-'+g[i][0]+'">'+gemI(g[i],52)+'</span>':'<span class="gem-s">＋</span>';
  h+='</div><small>'+(g.length?'Сила +'+Math.round((gemMul({gm:g})-1)*100)+'%':'Пустые слоты: вставь гем, чтобы усилить карту')+'</small><button type="button" class="mini2" id="gem-cv-go">'+(g.length<n?'Вставить гем':'Управлять')+'</button>';
  d.innerHTML=h;info.after(d);$("gem-cv-go").onclick=()=>gemOpen(S.cards.find(x=>x.id===c.id)||c)}catch(e){console.error(e)}}}
function gemFly(id){const el=document.querySelector('[data-pull="'+id+'"]')||document.querySelector('.gem-card');if(!el)return;const r=el.getBoundingClientRect(),f=document.createElement("div");f.className="gem-fly";f.style.left=r.left+r.width/2+"px";f.style.top=r.top+r.height/2+"px";f.innerHTML=gemSVG("a",5,60);document.body.appendChild(f);setTimeout(()=>f.remove(),1100)}
{const _gd=gemDraw;gemDraw=function(){_gd.apply(this,arguments);document.querySelectorAll("select[data-put]").forEach(x=>x.onchange=async()=>{if(!x.value)return;const id=+x.dataset.put||x.dataset.put,r=await act("gem_put",{id,g:x.value});if(r){try{hap&&hap("heavy");sfx.coin()}catch(e){}toast("💎 Гем вставлен! Карта стала сильнее")}gemDraw();if(r)setTimeout(()=>{const b=document.querySelectorAll('[data-pull="'+id+'"]');const e=b[b.length-1];if(e){e.classList.add("gem-in");gemFly(id)}},30)})}}
/* ===== 💎 Алмазный профиль (навсегда) ===== */
const isDiaU=uid=>!!(S&&uid&&(S.diaU||[]).includes(uid));
const DIA_SPK='<i class="dsp" style="--x:8%;--y:20%;--d:0s"></i><i class="dsp" style="--x:88%;--y:30%;--d:.7s"></i><i class="dsp" style="--x:55%;--y:80%;--d:1.3s"></i><i class="dsp" style="--x:30%;--y:65%;--d:1.9s"></i><i class="dsp" style="--x:72%;--y:12%;--d:2.4s"></i>';
{const _tr=topRow;topRow=function(it,i,kind){const d=_tr(it,i,kind);try{if(isDiaU(it.uid)){d.classList.add("diar");d.insertAdjacentHTML("beforeend",DIA_SPK);}}catch(e){}return d}}
function diaDeco(root){if(!root||root.classList.contains("diap"))return;root.classList.add("diap");root.insertAdjacentHTML("afterbegin",'<div class="dia-ban"><span>💎</span> АЛМАЗНЫЙ ПРОФИЛЬ <span>💎</span></div>'+DIA_SPK);const n=root.querySelector(".nk");if(n)n.classList.add("dian")}
{const _ds=drawShelf;drawShelf=function(){_ds.apply(this,arguments);try{if(isDiaU(S.uid))diaDeco($("prof-body").querySelector(".wsh"))}catch(e){}}}
{const _os=openShowcase;openShowcase=function(F){_os.apply(this,arguments);try{if(F&&isDiaU(F.uid)){const sh=$("msheet");diaDeco(sh.querySelector(".wsh"));const w=sh.querySelector(".who span");if(w)w.classList.add("dian")}}catch(e){}}}
{const _fx=fxName;fxName=function(el,prefix,name,uid){const r=_fx(el,prefix,name,uid);try{if(isDiaU(uid)&&!el.closest(".chm,#ch-list,.chlist,.dmm")){const sp=el.querySelector("span:not(.ttlb):not(.kingb):not(.vipb)")||el;sp.classList.add("dian");el.insertAdjacentHTML("afterbegin",'<span class="diab">💎 АЛМАЗ</span> ');const row=el.closest("button,.trow,li,.cpt");if(row&&!row.classList.contains("diar")&&!row.closest("#msheet .wsh")){row.classList.add("diar");if(!row.querySelector(".dsp"))row.insertAdjacentHTML("beforeend",DIA_SPK)}}}catch(e){}return r}}
/* ===== Акция для новичков: позови 2 друзей → VIP 7 дней + 50 ⭐ ===== */
function n2Open(){const N=S&&S.n2;if(!N)return;$("modal").hidden=false;const sh=$("msheet"),d=Math.max(0,Math.ceil((N.end-Date.now())/864e5));
  sh.innerHTML='<div class="gemw n2w"><div class="gem-h"><b>🎁 Подарок новичку</b><button type="button" class="ghost" id="n2-x">✕</button></div>'+
   '<div class="n2-hero"><div class="n2-gifts"><span>👑<b>VIP</b><small>на 7 дней</small></span><span>⭐<b>'+N.stars+'</b><small>звёзд</small></span></div><p>Позови <b>'+N.need+' друзей</b> в «Воины Эпох» — и подарок твой!</p></div>'+
   '<div class="n2-prog">'+Array.from({length:N.need},(_,i)=>'<i class="'+(i<N.have?"on":"")+'">'+(i<N.have?"✅":"👤")+'</i>').join("")+'<b>'+Math.min(N.have,N.need)+' / '+N.need+'</b></div>'+
   (N.got?'<p class="gem-p" style="text-align:center;color:#3ddc84;font-weight:900">🎉 Выполнено! VIP и звёзды уже у тебя</p>':'<button type="button" class="gem-go" id="n2-go">📨 Позвать друга<small>отправь ссылку в Telegram</small></button>')+
   '<p class="gem-p">Друг засчитывается, когда откроет '+10+' карточек, подпишется на канал и придумает ник. Награда придёт сама. Только для новых игроков · осталось '+d+' дн.</p></div>';
  $("n2-x").onclick=closeModal;if($("n2-go"))$("n2-go").onclick=()=>{try{rfInvite()}catch(e){toast("Открой Казино → Реф-кейс → «Позвать друга»")}}}
{const _mg=menuGo;menuGo=function(k){if(k==="n2"){menuClose();return n2Open()}return _mg.apply(this,arguments)}}
/* показать один раз при входе новичку */
{const _ra=renderAll;let n2shown=false;renderAll=function(){const r=_ra.apply(this,arguments);try{if(!n2shown&&S&&S.n2&&!S.n2.got&&$("modal").hidden&&(S.nOp||0)>=3){let k=0;try{k=localStorage.getItem("we-n2")}catch(e){}if(!k){n2shown=true;try{localStorage.setItem("we-n2","1")}catch(e){}setTimeout(()=>{if($("modal").hidden)n2Open()},1500)}}}catch(e){}return r}}
/* ===== производительность: кнопку чата пересчитываем раз в кадр, а не после каждой перерисовки (убирает принудительную раскладку) ===== */
{const _fu=fabUpdate;let q=0;fabUpdate=function(){if(q)return;q=requestAnimationFrame(()=>{q=0;try{_fu()}catch(e){}})}}
/* ===== Опросы в чате ===== */
let POLLS=[];
const PEXP={};
function pollCard(P){const tot=P.tot||0,voted=P.my!=null||P.closed;
  if(voted&&!PEXP[P.id]){const top=P.n.indexOf(Math.max(...P.n));return '<button type="button" class="pl-mini" data-pexp="'+P.id+'"><b>📊 '+escH(P.q)+'</b><small>'+(P.my!=null?'✓ твой голос: '+escH(P.opts[P.my])+' · ':'')+(tot?'лидирует «'+escH(P.opts[top])+'» · ':'')+tot+' '+plural(tot,"голос","голоса","голосов")+'</small><i>▾</i></button>'}
  return '<div class="pl-card" data-pid="'+P.id+'"><b class="pl-q">📊 '+escH(P.q)+(P.closed?' <small>(закрыт)</small>':'')+'</b>'+P.opts.map((o,i)=>{const pc=tot?Math.round(P.n[i]/tot*100):0;
    return '<button type="button" class="pl-o'+(P.my===i?' my':'')+(voted?' res':'')+'" data-opt="'+i+'"'+(P.closed?' disabled':'')+'>'+(voted?'<i style="width:'+pc+'%"></i>':'')+'<span>'+escH(o)+'</span>'+(voted?'<em>'+pc+'%</em>':'')+'</button>'}).join("")+
    '<small class="pl-f">'+tot+' '+plural(tot,"голос","голоса","голосов")+(P.my!=null&&!P.closed?' · можно переголосовать':'')+(voted?' · <u data-pcol="'+P.id+'" style="cursor:pointer">свернуть ▴</u>':'')+'</small>'+(S.admin?'<div class="pl-adm">'+(P.closed?'':'<button type="button" class="mini2" data-pc="'+P.id+'">Закрыть</button>')+'<button type="button" class="mini2" data-pd="'+P.id+'">Удалить</button></div>':'')+'</div>'}
async function pollLoad(){const r=await act("poll_list",{});if(r){POLLS=r.polls||[];pollDraw()}}
function pollDraw(){const box=$("ch-poll");if(!box)return;const L=POLLS.filter(p=>!p.closed).concat(POLLS.filter(p=>p.closed).slice(0,1));
  box.innerHTML=(S.admin?'<button type="button" class="pl-new" id="pl-new">📊 Создать опрос</button>':'')+L.map(pollCard).join("");
  box.onclick=async e=>{const x=e.target.closest("[data-pexp]");if(x){PEXP[+x.dataset.pexp]=1;return pollDraw()}const cl=e.target.closest("[data-pcol]");if(cl){delete PEXP[+cl.dataset.pcol];return pollDraw()}const o=e.target.closest("[data-opt]");if(o&&!o.disabled){const id=+o.closest("[data-pid]").dataset.pid,r=await act("poll_vote",{id,opt:+o.dataset.opt});if(r){delete PEXP[id];POLLS=POLLS.map(p=>p.id===id?r:p);if(S.poll&&S.poll.id===id)S.poll.v=1;try{hap("light")}catch(x){}pollDraw()}return}
    const c=e.target.closest("[data-pc]");if(c){await act("poll_close",{id:+c.dataset.pc});return pollLoad()}
    const d=e.target.closest("[data-pd]");if(d){if(!confirm("Удалить опрос?"))return;await act("poll_del",{id:+d.dataset.pd});return pollLoad()}
    if(e.target.id==="pl-new")pollNew()}}
function pollNew(){const box=$("ch-poll");box.innerHTML='<div class="pl-card pl-form"><b>📊 Новый опрос</b><input id="pl-q" maxlength="200" placeholder="Вопрос"><div id="pl-os">'+[1,2,3].map(i=>'<input class="pl-oi" maxlength="60" placeholder="Вариант '+i+'">').join("")+'</div><button type="button" class="mini2" id="pl-add">＋ вариант</button><div class="pl-adm"><button type="button" class="craftbtn" id="pl-go">Опубликовать</button><button type="button" class="ghost" id="pl-x">Отмена</button></div></div>';
  $("pl-add").onclick=()=>{const n=document.querySelectorAll(".pl-oi").length;if(n>=6)return toast("Максимум 6 вариантов");$("pl-os").insertAdjacentHTML("beforeend",'<input class="pl-oi" maxlength="60" placeholder="Вариант '+(n+1)+'">')};
  $("pl-x").onclick=pollDraw;$("pl-go").onclick=async()=>{const r=await act("poll_create",{q:$("pl-q").value,opts:[...document.querySelectorAll(".pl-oi")].map(x=>x.value)});if(r){toast("📊 Опрос опубликован — его видят все в чате");pollLoad()}}}
{const _oc=openChat;openChat=function(){const r=_oc.apply(this,arguments);try{const L=$("ch-list");if(L&&!$("ch-poll")){const d=document.createElement("div");d.id="ch-poll";d.className="ch-poll";L.before(d);pollLoad()}}catch(e){}return r}}
{const _mg=menuGo;menuGo=function(k){if(k==="poll"){menuClose();return openChat()}return _mg.apply(this,arguments)}}
/* ===== UI: эффект выпадения по редкости (только легенды/мифы/ошибки — обычные карты не грузим) ===== */
function epicFx(c,L){if(window.matchMedia&&matchMedia("(prefers-reduced-motion: reduce)").matches)return;const col=revealColor(c),t=c.f===4||c.f===8?"ОШИБКА ПЕЧАТИ!":c.f===3?"ЗОЛОТАЯ!":HEROES[c.h][2]===4?"МИФИЧЕСКИЙ!":"ЛЕГЕНДАРНЫЙ!";
  const o=document.createElement("div");o.className="epx"+(L>=4?" e4":"");o.style.setProperty("--ec",col);o.innerHTML='<div class="epx-r"></div><b>'+t+'</b>';document.body.appendChild(o);
  if(L>=4){document.body.classList.add("epx-shake");setTimeout(()=>document.body.classList.remove("epx-shake"),650)}setTimeout(()=>o.remove(),L>=4?2000:1300)}
/* ===== UI: значки на нижних вкладках — сколько прокруток и сколько новых карт/обменов ===== */
function tabBadge(id,n){const b=$(id);if(!b)return;let e=b.querySelector(".tbn");if(!n){if(e)e.remove();return}if(!e){e=document.createElement("em");e.className="tbn";b.appendChild(e)}const v=n>99?"99+":String(n);if(e.textContent!==v)e.textContent=v}
{const _ra=renderAll;renderAll=function(){const r=_ra.apply(this,arguments);try{if(S&&S.cards){tabBadge("tab-spin",S.spins>0?S.spins:0);const t=Date.now()-864e5;let seen=0;try{seen=+localStorage.getItem("we-cseen")||0}catch(e){}
  const nw=S.cards.filter(c=>(c.created||0)>Math.max(t,seen)).length;tabBadge("tab-cards",nw+(S.trIn||0))}}catch(e){}return r}}
{const _st=setTab;setTab=function(t){const r=_st.apply(this,arguments);try{if(t==="col"||t==="album"){localStorage.setItem("we-cseen",Date.now());tabBadge("tab-cards",S.trIn||0)}}catch(e){}return r}}
/* ===== UI: подсказка при первом входе в раздел ===== */
const HINTS={gems:["💎 Кузня гемов","Собирай осколки: 🌍 в лагере, 🔥 в клане, 🌪 у дракона, 💧 за задания. Меняй 40 осколков и монеты на попытку выбить гем, вставляй гемы в карты — они станут сильнее."],
 cw:["🗺 Война за земли","Каждый день 20:00–22:00 твой клан захватывает клетки карты. Первая — с края, дальше только соседние. В 22:00 клетка уходит клану с наибольшим уроном, владельцы получают монеты и осколки 🔥."],
 dc:["🌙 Карта дня","Каждый день — новый воин всего в 2 экземплярах. Один продаётся за звёзды, второй можно выбить только в Особом прокруте. Особые прокруты дают за задания дня."],
 map:["🗺 Карта мира","Занимай регионы своими воинами — они приносят доход каждый час. Нападай на чужие регионы: победишь — регион твой. Сильные карты лучше ставить в центр."]};
function hintOnce(k){const H=HINTS[k];if(!H)return;let seen=0;try{seen=localStorage.getItem("we-h-"+k)}catch(e){}if(seen)return;try{localStorage.setItem("we-h-"+k,1)}catch(e){}
  setTimeout(()=>{const d=document.createElement("div");d.className="hnt";d.innerHTML='<div class="hnt-b"><b>'+H[0]+'</b><p>'+H[1]+'</p><button type="button" class="craftbtn">Понятно</button></div>';d.onclick=e=>{if(e.target.closest("button")||e.target===d)d.remove()};document.body.appendChild(d)},350)}
{const w=(n,k)=>{const f=window[n];if(typeof f!=="function")return;window[n]=function(){const r=f.apply(this,arguments);try{hintOnce(k)}catch(e){}return r}};w("gemOpen","gems");w("cwOpen","cw");w("dcOpen","dc");w("openMap","map")}
/* ===== UI: профиль-визитка — ранг, альбом, победы, лучшая карта одной строкой под ником ===== */
function profChips(root,o){try{const top=root&&root.querySelector(".top");if(!top||root.querySelector(".pfc"))return;const R=o.emp!=null?EMP.R[empRank(o.emp)]:null;
  const ch=[R?R.ic+" "+R.n:null,o.have!=null?"📖 "+o.have+"/"+NHEROES:null,o.wins!=null?"⚔️ "+fmtN(o.wins)+" побед":null,o.best?"🏆 "+o.best:null].filter(Boolean);
  if(!ch.length)return;const d=document.createElement("div");d.className="pfc";d.innerHTML=ch.map(x=>'<span>'+escH(x)+'</span>').join("");top.after(d)}catch(e){}}
{const _ds=drawShelf;drawShelf=function(){_ds.apply(this,arguments);try{const b=S.cards.slice().sort((a,b)=>b.v-a.v)[0];profChips($("prof-body").querySelector(".wsh"),{emp:S.emp||0,have:new Set(S.cards.filter(c=>isBase(c.h)).map(c=>c.h)).size,wins:S.totalWins||0,best:b?HEROES[b.h][0]:null})}catch(e){}}}
{const _os=openShowcase;openShowcase=function(F){_os.apply(this,arguments);try{profChips($("msheet").querySelector(".wsh"),{have:F.have,wins:F.wins,best:F.cards&&F.cards[0]?HEROES[F.cards[0].h][0]:null})}catch(e){}}}
/* ===== «Сейчас важно»: лента плиток над карточкой во вкладке «Крутить», листается вбок. Только то, что сейчас актуально ===== */
let nowSig="";
function nowItems(){const L=[],now=Date.now();if(!S)return L;let B={};try{B=menuBadges()}catch(e){}
  for(const D of (S.dcs||(S.dc?[S.dc]:[])))if(D&&HEROES[D.h]&&now<D.until){const on=now>=D.at;L.push({k:"dc",ic:"🌙",t:HEROES[D.h][0],s:on?"⏳ "+dcT(D.until-now)+" · 2 экз.":"старт в "+dcHM(D.at),c:"#1a1050,#7a2ad0",hot:on})}

  {const h=new Date(now).getUTCHours();if(h>=17&&h<19)L.push({k:"cw",ic:"🗺",t:"Война за земли",s:"бои до 22:00",c:"#c4400a,#7a1a8a",em:"!"})}
  if(B.quest)L.push({k:"quest",ic:"🎁",t:"Забрать награды",s:"задания: "+B.quest+" готово",c:"#1e8a4a,#0a4a2a",em:B.quest});
  if(S.n2&&!S.n2.got)L.push({k:"n2",ic:"🎁",t:"VIP + 50 ⭐ новичку",s:"друзей "+Math.min(S.n2.have,S.n2.need)+"/"+S.n2.need,c:"#ff7a1a,#d01a6a"});
  try{const H=S.gsh||{},d=today(now),fd=S.gfd&&S.gfd.d===d?S.gfd.n:0;if(fd<GEM.cost.day&&Object.keys(GEM.el).some(k=>(H[k]||0)>=GEM.cost.sh))L.push({k:"gems",ic:"💎",t:"Кузня гемов",s:"хватает осколков на попытку",c:"#2a5ad0,#6a2ad0"})}catch(e){}
  if(S.poll&&!S.poll.v)L.push({k:"poll",ic:"📊",t:"Опрос",s:S.poll.q.slice(0,40),c:"#2a1a6a,#4a1a7a"});
  if(B.wheel)L.push({k:"wheel",ic:"🎡",t:"Колесо удачи",s:"бесплатный прокрут",c:"#ffb84d,#d0302a"});
  if(B.camp)L.push({k:"camp",ic:"🏕",t:"Лагерь",s:"энергия полная",c:"#4a7a1e,#2a4a10"});
  return L}
function nowDraw(){const sec=$("sec-spin");if(!sec||sec.hidden)return;let box=$("now-strip");const L=nowItems(),sig=JSON.stringify(L.map(x=>[x.k,x.t,x.s,x.em]));
  if(!L.length){if(box)box.remove();nowSig="";return}
  if(!box){box=document.createElement("div");box.id="now-strip";box.className="nows";sec.prepend(box);
    box.onclick=e=>{if(e.target.closest("[data-nt]")){window.NOWO=!window.NOWO;nowSig="";try{hap("light")}catch(x){}return nowDraw()}const b=e.target.closest("[data-nk]");if(!b)return;try{hap("light")}catch(x){}const k=b.dataset.nk;
      if(k==="dc")return dcOpen();if(k==="cw")return cwOpen();if(k==="n2")return n2Open();if(k==="gems")return gemOpen();if(k==="poll")return openChat();return menuGo(k)}}
  if(sig===nowSig)return;nowSig=sig;
  box.classList.toggle("nopen",!!window.NOWO);box.innerHTML='<button type="button" class="nows-h" data-nt="1"><span>🔥 Сейчас важно</span><em>'+L.length+'</em><i>'+L.slice(0,5).map(x=>x.ic).join("")+'</i><u>'+(window.NOWO?"▴":"▾")+'</u></button><div class="nows-l">'+L.map(x=>'<button type="button" class="nows-i'+(x.hot?' hot':'')+'" data-nk="'+x.k+'" style="background:linear-gradient(135deg,'+x.c+')"><i>'+x.ic+'</i><b>'+escH(x.t)+'</b><small>'+escH(x.s)+'</small>'+(x.em?'<em>'+x.em+'</em>':'')+'</button>').join("")+'</div>'}
{const _ra=renderAll;renderAll=function(){const r=_ra.apply(this,arguments);try{nowDraw()}catch(e){}return r}}
setInterval(()=>{try{nowDraw()}catch(e){}},30000);

/* ===== Закрытая карта на старте: манит открыть ===== */
const LURE=["💀 Кощей — карта дня","🔥 Мифический воин","❗ Ошибка печати 1 из 1","🐉 Звёздный дракон","👑 Легенда эпох","💎 Алмазная ошибка"];
(function lureInit(){try{const fl=$("flip"),st=$("stage");if(!fl||!st)return;const rear=fl.querySelector(".face.rear");if(!rear||rear.querySelector(".lure-t"))return;
  rear.insertAdjacentHTML("beforeend",'<div class="lure-rays"></div><div class="lure-sh"></div><div class="lure-t"><small>Может выпасть</small><b id="lure-w">'+LURE[0]+'</b></div><div class="lure-tap">👆 НАЖМИ!</div>'+Array.from({length:7},(_,i)=>'<i class="lure-sp" style="--x:'+(10+i*13)%90+'%;--y:'+(15+i*29)%85+'%;--d:'+(i*.45).toFixed(2)+'s"></i>').join(""));
  fl.classList.add("back");st.classList.add("lure");const pl=$("p-lbl");if(pl)pl.textContent="Нажми на карту — кто выпадет?";
  let i=0;const tm=setInterval(()=>{if(!st.classList.contains("lure")){clearInterval(tm);return}const w=$("lure-w");if(!w)return;i=(i+1)%LURE.length;w.classList.remove("in");void w.offsetWidth;w.textContent=LURE[i];w.classList.add("in")},1800);
  const off=()=>{st.classList.remove("lure")};st.addEventListener("click",off,{once:true});const ob=$("open");if(ob)ob.addEventListener("click",off,{once:true})}catch(e){}})();

/* ===== Особый прокрут: барабан прямо в окне «Карта дня» — выпадает карта или «пусто» ===== */
function dspCands(L0){return (L0||S.dcs||[]).filter(x=>!x.ns&&x.left&&x.left.spin&&HEROES[x.h])}
function dspTile(x){return x==null?'<div class="rl-i rl-e"><b>💨</b><small>ПУСТО</small></div>':'<div class="rl-i"><div class="rl-p">'+portrait(x,null)+'</div><small>'+escH(HEROES[x][0])+'</small></div>'}
function dspBox(L0){const C=dspCands(L0),n=S.dsp||0;let strip=[];for(let i=0;i<5;i++)strip.push(i%2&&C.length?C[i%C.length].h:null);
  return '<div class="dspb" id="dspb"><div class="dspb-h"><b>🎰 ОСОБЫЙ ПРОКРУТ</b><em>у тебя: '+n+'</em></div>'+
   '<div class="rl"><div class="rl-s" id="rl-s">'+strip.map(dspTile).join("")+'</div><i class="rl-m"></i></div>'+
   '<button type="button" class="dspb-go" id="dsp-go"'+(n>0?'':' disabled')+'>'+(n>0?'КРУТИТЬ ×1':'Нет прокрутов — выполни задание ниже 👇')+'</button>'+
   '<small class="dspb-f">Выпадает карта дня или «пусто». Можно выбить: '+(C.map(x=>escH(HEROES[x.h][0])+' '+(x.rp?Math.round((x.ch||0)*100):(DSP.ch*100).toFixed(1))+'%').join(" · ")||"сейчас нечего")+'</small></div>'}
let dspBusy=false;
function dspBind(){const b=$("dsp-go");if(!b)return;b.onclick=async()=>{if(dspBusy)return;dspBusy=true;b.disabled=true;const C=dspCands();
  const r=await act("dsp_roll",{});if(!r){dspBusy=false;dcDraw();return}
  const win=r.win&&r.card?r.card.h:null,seq=[];for(let i=0;i<22;i++)seq.push(i%3===1&&C.length?C[i%C.length].h:null);seq.push(win);seq.push(C.length?C[0].h:null);
  const S2=$("rl-s");if(S2){S2.style.transition="none";S2.style.transform="translateX(0)";S2.innerHTML=seq.map(dspTile).join("");void S2.offsetWidth;const w=S2.firstChild?S2.firstChild.getBoundingClientRect().width+8:110,box=S2.parentElement.getBoundingClientRect().width;
    S2.style.transition="transform 2.2s cubic-bezier(.12,.8,.18,1)";S2.style.transform="translateX("+(-(22*w)+box/2-w/2+4)+"px)";try{sfx.whoosh&&sfx.whoosh()}catch(e){}}
  setTimeout(()=>{dspBusy=false;if(win!=null){try{hapN("success");burst(4);epicFx(r.card,4)}catch(e){}toast("🌙🔥 ВЫБИЛ: "+HEROES[win][0]+"! Карта уже в коллекции")}else{try{hap("light")}catch(e){}toast("💨 Пусто… Попробуй ещё!")}dcDraw()},2400)}}

/* большая кнопка «Особые прокруты» над карточкой на главном экране — чтобы все видели, где крутить */
function dspBan(){const sec=$("sec-spin");if(!sec||sec.hidden)return;let b=$("dsp-ban");const n=S&&S.dsp||0,has=(S&&S.dcs||[]).some(x=>Date.now()<x.until);
  if(!has){if(b)b.remove();return}
  if(!b){b=document.createElement("button");b.type="button";b.id="dsp-ban";b.className="dsp-ban";b.onclick=()=>{dcOpen();setTimeout(()=>{const x=$("dspb");if(x)x.scrollIntoView({block:"start"})},250)};const ns=$("now-strip");if(ns)ns.after(b);else sec.prepend(b)}
  const t=n>0?'🎰 КРУТИТЬ ОСОБЫЙ ПРОКРУТ <em>×'+n+'</em>':'🎰 Особые прокруты: выполни задание и выбей карту дня';if(b._t!==t){b._t=t;const L=(S.dcs||[]).filter(D=>!D.ns&&Date.now()<D.until).map(D=>HEROES[D.h]&&HEROES[D.h][0]).filter(Boolean);b.innerHTML=t+'<small>'+(L.length?escH(L.join(" · "))+' — шанс одинаковый весь вечер':'карта дня выпадает вечером')+'</small>'}b.classList.toggle("hot",n>0)}
{const _ra=renderAll;renderAll=function(){const r=_ra.apply(this,arguments);try{dspBan()}catch(e){}return r}}
/* опросы: чат открывается разными кнопками (часть из них привязана к старой функции) — поэтому блок опросов подставляем, как только появился список чата */
setInterval(()=>{try{const L=$("ch-list");if(L&&L.isConnected&&!$("ch-poll")){const d=document.createElement("div");d.id="ch-poll";d.className="ch-poll";L.before(d);pollLoad()}}catch(e){}},500);

/* ⚡ оптимизация памяти: списки не перерисовываются, если ничего не поменялось; при уходе с вкладки тяжёлые списки очищаются (на слабых телефонах из-за них вылетало) */
{const SIG={};const sigCol=()=>JSON.stringify([colView,colSort,colF,colQ,colPick,[...colSel],S.cards,S.gsock||0,S.fav||0,S.favs||0,Math.floor(Date.now()/36e5)]),sigAlb=()=>JSON.stringify([S.cards.map(c=>c.h+"."+c.f),S.eras||0,S.ach||0]);
 const memo=(n,box,sig)=>{const f=window[n];if(typeof f!=="function")return;window[n]=function(){try{const b=$(box),k=sig();if(b&&b.childElementCount&&SIG[n]===k)return;const r=f.apply(this,arguments);SIG[n]=k;return r}catch(e){SIG[n]=null;return f.apply(this,arguments)}}};
 memo("renderCol","col",sigCol);memo("renderAlbum","album",sigAlb);
 const FREE={col:()=>{const b=$("col");if(b)b.innerHTML="";SIG.renderCol=null},album:()=>{const b=$("album");if(b)b.innerHTML="";SIG.renderAlbum=null},
  craft:()=>{["cr-pick","cr-tgt","cr-slots"].forEach(id=>{const b=$(id);if(b){b.innerHTML="";b.dataset.k="";delete b.dataset.scrolled}});const p=$("cr-prev");if(p){p.innerHTML="";p.dataset.k=""}}};
 let cur=null;const _st=setTab;setTab=function(t){const prev=cur;cur=t;if(prev&&prev!==t&&FREE[prev]&&!(prev==="craft"&&crBusy)){try{FREE[prev]()}catch(e){}}return _st.apply(this,arguments)}}

/* блик в «Картах» включается только у карточек на экране */
{const io=typeof IntersectionObserver!=="undefined"?new IntersectionObserver(es=>es.forEach(e=>{if(!e.target.isConnected){io.unobserve(e.target);return}e.target.classList.toggle("on",e.isIntersecting)})):null;
 const _fm=fillMini;fillMini=function(el){const r=_fm.apply(this,arguments);try{if(io&&el.closest&&el.closest("#sec-col"))io.observe(el)}catch(e){}return r}}

/* ⚡ большие коллекции: карточки далеко за экраном выгружаются из памяти и рисуются заново, когда к ним подлистаешь
   (быстрая прокрутка 300+ карт на iPhone больше не копит сотни нарисованных карточек) */
{const LISTS="#sec-col,#sec-album,.pickrow,.pkg,.cqpk";
 const vio=typeof IntersectionObserver!=="undefined"?new IntersectionObserver(es=>es.forEach(e=>{const el=e.target;if(!el.isConnected){vio.unobserve(el);return}
   if(e.isIntersecting){if(el._gone&&el._card){el._gone=0;el._mc=el._card;el._w=e.boundingClientRect.width;fillMini(el)}}
   else if(!el._gone&&el._card&&el.firstChild){el._gone=1;while(el.firstChild)el.removeChild(el.firstChild)}}),{rootMargin:"800px 0px"}):null;
 const _fm=fillMini;fillMini=function(el){const c=el&&el._mc;const r=_fm.apply(this,arguments);try{if(c&&vio&&el.closest&&el.closest(LISTS)&&!el._card){el._card=c;vio.observe(el)}}catch(e){}return r}}

/* SVG-анимации (SMIL) в маленьких копиях карт стоят на паузе — мини-карточки и так статичные, а SMIL перерисовывал их каждый кадр */
{const _fm=fillMini;fillMini=function(el){const r=_fm.apply(this,arguments);try{el.querySelectorAll("svg").forEach(s=>{if(s.pauseAnimations&&s.querySelector("animate,animateTransform,animateMotion"))s.pauseAnimations()})}catch(e){}return r}}

/* открытие сундука гемов: гемы вылетают и крутятся */
{const _ps=payShow;payShow=function(r){const I=r&&SHOP[r.item],R=r&&r.res||{};if(!I||!I.gbox||r.status==="refund"||!R.gems)return _ps.apply(this,arguments);
 renderAll();try{sfx.coin();hapN("success")}catch(e){}const m=$("modal"),sh=$("msheet");m.hidden=false;
 sh.innerHTML='<div class="box nickbox gbx-open"><h3>💎 '+I.n+'</h3><div class="gbx-row">'+R.gems.map((g,i)=>'<div class="gbx-gem" style="animation-delay:'+(i*.35)+'s">'+gemI(g,110)+'<b>'+gemName(g)+'</b><small>+'+Math.round(GEM.b[+g.slice(1)]*100)+'% к силе</small></div>').join("")+'</div>'+(R.gsh?'<p>+'+R.gsh[1]+' осколков '+GEM.el[R.gsh[0]].ic+'</p>':'')+'<button type="button" class="craftbtn" id="gbx-put">🃏 Вставить в карту</button><button type="button" class="ghost" id="gbx-x">Закрыть</button></div>';
 $("gbx-x").onclick=closeModal;$("gbx-put").onclick=()=>{GEMV.tab="put";gemOpen()}}}

document.addEventListener("click",e=>{if(e.target.closest&&e.target.closest("#gbx-ad")){GEMV.tab="box";gemOpen()}});

/* 📄 карточки страницами: в памяти телефона одновременно не больше одной страницы (вылеты при быстрой прокрутке больших коллекций) */
const PGV={};
function pagerApply(boxId,sel,per,label){const box=$(boxId);if(!box)return;const it=[...box.children].filter(e=>e.matches(sel));let bar=$("pg-"+boxId);
 const n=Math.ceil(it.length/per);if(n<=1){it.forEach(e=>e.classList.remove("pg-hide"));if(bar)bar.remove();const b2=$("pgt-"+boxId);if(b2)b2.remove();return}
 let p=Math.min(PGV[boxId]||0,n-1);PGV[boxId]=p;it.forEach((e,i)=>e.classList.toggle("pg-hide",i<p*per||i>=(p+1)*per));
 const html='<button type="button" data-pg="-1"'+(p?"":" disabled")+'>◀</button><span><b>'+(p+1)+'</b> / '+n+'<small>'+label+' '+(p*per+1)+'–'+Math.min(it.length,(p+1)*per)+' из '+it.length+'</small></span><button type="button" data-pg="1"'+(p<n-1?"":" disabled")+'>▶</button>';
 const mk=(id,before)=>{let b=$(id);if(!b){b=document.createElement("div");b.id=id;b.className="pgbar";if(before)box.before(b);else box.after(b)}b.innerHTML=html;
  b.onclick=e=>{const x=e.target.closest("[data-pg]");if(!x||x.disabled)return;PGV[boxId]=Math.max(0,Math.min(n-1,(PGV[boxId]||0)+(+x.dataset.pg)));try{hap("light")}catch(_){}pagerApply(boxId,sel,per,label);
   if(box.classList.contains("pickrow"))box.scrollLeft=0;else{const top=box.getBoundingClientRect().top+scrollY-120;scrollTo({top:Math.max(0,top)})}}};
 mk("pg-"+boxId,false);if(!box.classList.contains("pickrow"))mk("pgt-"+boxId,true)}
{const W=(fn,args)=>{const f=window[fn];if(typeof f!=="function")return;window[fn]=function(){const r=f.apply(this,arguments);try{pagerApply(...args)}catch(e){}return r}};
 W("renderCol",["col",".tl2",30,"карты"]);W("renderAlbum",["album",".slot",30,"воины"]);W("renderCraft",["cr-pick",".pc",20,"карты"]);}

/* ===== 🎰 Беспроигрышная лотерея ===== */
let LOTS=null;
async function lotLoad(){let r=null;try{if(ONLINE){const x=await fetch(API_URL.replace(/\/$/,"")+"/api",{method:"POST",headers:{"Content-Type":"application/json","X-Init-Data":INIT||"","X-Dev-User":DEV_USER||""},body:JSON.stringify({a:"lot_get",p:{}})});const j=await x.json();if(j&&j.ok)r=j.res}}catch(e){}
 if(!r){const n=Date.now(),d=new Date(n+3*36e5),s=Date.UTC(d.getUTCFullYear(),d.getUTCMonth(),d.getUTCDate(),5,0);r={on:0,start:s,end:s+14*36e5,now:n,price:29,max:15,tot:0,bank:0,players:0,my:0,left:15,fin:null,soon:1}}
 LOTS=r;LOTS.off=r.now-Date.now();return r}
function lotBar(){const sp=$("sec-spin");if(!sp||!LOTS)return;let b=$("lot-bar");const nw=Date.now()+(LOTS.off||0),pre=!LOTS.on&&nw<LOTS.start;
 if(!b){b=document.createElement("button");b.type="button";b.id="lot-bar";b.className="lot-bar";b.onclick=()=>lotOpen();const e=$("tk-bar");if(e&&e.parentNode===sp)e.after(b);else sp.insertBefore(b,sp.firstChild)}
 b.innerHTML='<i>🎰</i><span><b>'+(LOTS.on?'Лотерея: банк '+fmtN(LOTS.bank)+' ⭐':pre?'Беспроигрышная лотерея — старт в 08:00':'Лотерея — завтра с 08:00')+'</b><small>'+(LOTS.on?'беспроигрышная · у тебя '+LOTS.my+' 🎟 · розыгрыш в 22:00':pre?'через '+tkT(LOTS.start-nw)+' · билет '+LOTS.price+' ⭐ · банк одному':(LOTS.fin&&LOTS.fin.uid?'банк забрал '+escH(LOTS.fin.name):'новый банк каждый день'))+'</small></span><em>›</em>'}
async function lotOpen(){const m=$("modal"),sh=$("msheet");m.hidden=false;if(!LOTS)sh.innerHTML='<div class="box nickbox"><p>Загружаю…</p></div>';await lotLoad();lotDraw()}
function lotDraw(){const L=LOTS,sh=$("msheet");if(!L||$("modal").hidden)return;const now=Date.now()+L.off,ch=L.tot?Math.round(L.my/L.tot*1000)/10:0;
 let h='<div class="box nickbox lotbox"><small class="tk-k">🎰 КАЖДЫЙ ДЕНЬ · 08:00–22:00</small><h3>Беспроигрышная лотерея</h3>';
 h+='<div class="lot-bank"><small>БАНК ДНЯ</small><b>'+fmtN(L.bank)+' ⭐</b><span>'+L.tot+' 🎟 · '+L.players+' игр.</span></div>';
 if(L.on)h+='<div class="tk-tm">Розыгрыш через <b>'+tkT(L.end-now)+'</b></div><div class="lot-my">У тебя <b>'+L.my+'</b> из '+L.max+' 🎟'+(L.my?' · шанс <b>'+ch+'%</b>':'')+'</div>';
 else h+='<div class="tk-tm"><b>Сейчас билеты не продаются</b> — новая лотерея с 08:00</div>';
 if(L.on&&L.left>0)h+='<div class="lot-buy">'+[1,3,5,10,15].filter(n=>n<=L.left).map(n=>'<button type="button" data-n="'+n+'"><b>'+n+' 🎟</b><small>'+(n*L.price)+' ⭐</small></button>').join("")+'</div>';
 else if(L.on)h+='<p class="cln">Ты купил максимум на сегодня — удачи в 22:00! 🍀</p>';
 h+='<ul class="lot-how"><li>🎟 Билет — <b>'+L.price+' ⭐</b>, до <b>'+L.max+'</b> в день</li><li>💰 Все звёзды за билеты идут в банк</li><li>🏆 В 22:00 весь банк забирает <b>один случайный билет</b> — даже если он у тебя один</li><li>🎁 Не выиграл — получаешь <b>сундуки на сумму своих билетов</b>. Без проигрыша!</li></ul>';
 if(L.fin&&L.fin.uid)h+='<div class="lot-last">Прошлый розыгрыш: <b>'+escH(L.fin.name)+'</b> забрал <b>'+fmtN(L.fin.bank)+' ⭐</b> ('+L.fin.n+' из '+L.fin.tot+' 🎟)</div>';
 h+='<button type="button" class="ghost" id="lot-x">Закрыть</button></div>';sh.innerHTML=h;
 $("lot-x").onclick=closeModal;sh.querySelectorAll(".lot-buy [data-n]").forEach(b=>b.onclick=()=>{closeModal();buyItem({item:"lott",n:+b.dataset.n})})}
{const _ps=payShow;payShow=function(r){if(r&&r.item==="lott"&&r.status!=="refund"){renderAll();try{sfx.coin();hapN("success")}catch(e){}toast("🎟 Билеты куплены! Розыгрыш в 22:00");lotOpen();return}return _ps.apply(this,arguments)}}
{const _ra=renderAll;renderAll=function(){const r=_ra.apply(this,arguments);try{lotBar()}catch(e){}return r}}
setInterval(()=>{if(S&&ONLINE&&!document.hidden)lotLoad().then(()=>{lotBar();const o=document.querySelector(".lotbox");if(o)lotDraw()})},60e3);
{const t=setInterval(()=>{if(!S||!ONLINE||$("boot"))return;clearInterval(t);lotLoad().then(()=>{lotBar();if(new URLSearchParams(location.search).get("lot"))setTimeout(lotOpen,500)})},700)}
{const _mg=menuGo;menuGo=function(k){if(k==="lott"){menuClose();return lotOpen()}return _mg.apply(this,arguments)}}

/* 📄 страницы во ВСЕХ списках выбора карт (бои, арена, тренер, рейтинг, покорение, обмены…): следим за DOM и включаем пагинацию, если карт много */
{const AUTO=[[".pickrow",20],[".pkg",24],[".cqpk",24]];let pend=0,an=0;
 const run=()=>{pend=0;for(const [sel,per] of AUTO)document.querySelectorAll(sel).forEach(box=>{if(box.id==="cr-pick")return;if(!box.id)box.id="apg"+(++an);
   const n=box.children.length,f=box.firstElementChild;if(box._pgN===n&&box._pgF===f)return;box._pgN=n;box._pgF=f;
   if(n<=per&&!$("pg-"+box.id))return;try{pagerApply(box.id,"*",per,"карты")}catch(e){}})};
 new MutationObserver(()=>{if(pend)return;pend=1;requestAnimationFrame(run)}).observe(document.body,{childList:true,subtree:true})}

/* 🎠 шторка на «Крутить»: Билетная гонка + Лотерея в одной карусели — листается свайпом, сама переключается, по нажатию открывается выбранное */
function evCar(){const sp=$("sec-spin");if(!sp)return;const bars=["tk-bar","lot-bar","vhstrip"].map(id=>$(id)).filter(Boolean);let C=$("ev-car");
 if(!bars.length){if(C)C.remove();return}
 if(!C){C=document.createElement("div");C.id="ev-car";C.className="ev-car";C.innerHTML='<div class="ev-tr"></div><div class="ev-dots"></div>';const v=$("vhstrip"),hy=$("hype");if(v&&v.parentNode===sp)v.before(C);else if(hy&&hy.parentNode===sp)hy.after(C);else bars[0].before(C);
  const tr=C.firstChild;tr.addEventListener("scroll",()=>{const i=Math.round(tr.scrollLeft/Math.max(1,tr.clientWidth));C.querySelectorAll(".ev-dots i").forEach((d,j)=>d.classList.toggle("on",j===i))},{passive:true});
  ["pointerdown","touchstart"].forEach(ev=>tr.addEventListener(ev,()=>{C._hold=Date.now()},{passive:true}));
  setInterval(()=>{if(document.hidden||$("sec-spin").hidden||Date.now()-(C._hold||0)<8000)return;const n=tr.children.length;if(n<2)return;const i=Math.round(tr.scrollLeft/tr.clientWidth);tr.scrollTo({left:((i+1)%n)*tr.clientWidth,behavior:"smooth"})},4500)}
 {const hy=$("hype");if(hy&&hy.parentNode===sp&&C.previousElementSibling!==hy)hy.after(C)}
 const tr=C.firstChild;["tk-bar","lot-bar","vhstrip"].forEach(id=>{const b=$(id);if(b&&(b.parentNode!==tr||tr.lastElementChild!==b&&false))tr.appendChild(b)});
 {const ord=["tk-bar","lot-bar","vhstrip"].map(id=>$(id)).filter(b=>b&&b.parentNode===tr);ord.forEach((b,i)=>{if(tr.children[i]!==b)tr.insertBefore(b,tr.children[i]||null)})}
 const n=tr.children.length,D=C.lastChild;if(D.children.length!==n)D.innerHTML=n>1?[...Array(n)].map((_,i)=>'<i class="'+(i?"":"on")+'"></i>').join(""):""}
{const w=n=>{const f=window[n];if(typeof f!=="function")return;window[n]=function(){const r=f.apply(this,arguments);try{evCar()}catch(e){}return r}};w("tkBar");w("lotBar")}

{const w=n=>{const f=window[n];if(typeof f!=="function")return;window[n]=function(){const r=f.apply(this,arguments);try{evCar()}catch(e){}return r}};w("vhStrip")}
{const _ps=payShow;payShow=function(r){if(r&&r.item==="diap"&&r.status!=="refund"){renderAll();try{sfx.coin();hapN("success")}catch(e){}const m=$("modal"),sh=$("msheet");m.hidden=false;
 sh.innerHTML='<div class="box nickbox" style="text-align:center"><div style="font-size:64px">💎</div><h3>Алмазный профиль твой!</h3><p class="cln">Навсегда. Ник сияет в топе, в чате и в профиле — все видят, кто здесь король.</p><button type="button" class="craftbtn" id="dia-see">👀 Посмотреть профиль</button><button type="button" class="ghost" id="dia-x">Закрыть</button></div>';
 $("dia-x").onclick=closeModal;$("dia-see").onclick=()=>{closeModal();try{menuGo("prof")}catch(e){}};return}return _ps.apply(this,arguments)}}

/* 📌 платный закреп в чате: 50 ⭐ на 1 час */
document.addEventListener("click",e=>{const b=e.target.closest&&e.target.closest("#ch-pinbuy");if(!b)return;const box=document.createElement("div");box.className="chpbuy";
 box.innerHTML='<b>📌 Твоё сообщение наверху чата у всех — 1 час</b><textarea id="chp-t" maxlength="120" placeholder="Например: Продаю Цербера, пиши в ЛС 🔥"></textarea><small id="chp-n">0 / 120</small><div><button type="button" class="craftbtn" id="chp-go">Закрепить · 50 ⭐</button><button type="button" class="ghost" id="chp-x">Отмена</button></div>';
 b.replaceWith(box);const ta=$("chp-t");ta.focus();ta.oninput=()=>{$("chp-n").textContent=ta.value.length+" / 120"};
 $("chp-x").onclick=()=>box.replaceWith(b);$("chp-go").onclick=()=>{const t=ta.value.trim();if(t.length<3){toast("Напиши текст объявления");return}buyItem({item:"chpin",text:t})}});
{const _ps=payShow;payShow=function(r){if(r&&r.item==="chpin"&&r.status!=="refund"){try{sfx.coin();hapN("success")}catch(e){}toast("📌 Закреплено на 1 час!");try{closeModal()}catch(e){}try{openChat()}catch(e){}return}return _ps.apply(this,arguments)}}

document.addEventListener("click",e=>{if(e.target.closest&&e.target.closest("#motto-go")){const t=($("motto-in").value||"").trim();if(t.length<2){toast("Напиши фразу");return}buyItem({item:"motto",text:t})}});
{const _ps=payShow;payShow=function(r){if(r&&(r.item==="motto"||r.item==="tsp")&&r.status!=="refund"){renderAll();try{sfx.coin();hapN("success")}catch(e){}toast(r.item==="motto"?"💬 Фраза в профиле обновлена!":"🏆 Турнир назван твоим именем!");try{closeModal()}catch(e){}if(r.item==="tsp")try{loadTour(true)}catch(e){}return}return _ps.apply(this,arguments)}}

/* 👑 НАБОР ФАНАТА: карта «Все Воины Эпох» — коллаж 3×3 из воинов игры + подпись создателя */
DETAILED["Все Воины Эпох"]=id=>{const u="fw"+String(id).replace(/[^a-z0-9_]/gi,""),P=(h,x,y,s)=>{if(!HEROES[h])return "";const k=u+"c"+h+"_"+x;return '<clipPath id="'+k+'"><rect x="'+x+'" y="'+y+'" width="'+s+'" height="'+s+'" rx="'+(s/7)+'"/></clipPath><g clip-path="url(#'+k+')"><g transform="translate('+x+' '+y+') scale('+(s/200)+')">'+portrait(h,null,1).trim().replace(/^<svg[^>]*>/,"").replace(/<\/svg>$/,"")+'</g></g>'};
 const ring=[[11,22,58],[19,128,58],[23,8,98],[31,142,98],[12,40,120],[20,110,120]].map(([h,x,y])=>'<g opacity=".95">'+P(h,x,y,50)+'<rect x="'+x+'" y="'+y+'" width="50" height="50" rx="10" fill="none" stroke="url(#'+u+'g)" stroke-width="2.5"/></g>').join("");
 return '<svg viewBox="0 0 200 200" class="pt" aria-hidden="true"><defs><linearGradient id="'+u+'g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff6c8"/><stop offset=".5" stop-color="#ffd23f"/><stop offset="1" stop-color="#c47a12"/></linearGradient><radialGradient id="'+u+'r"><stop offset="0" stop-color="#ffd23f" stop-opacity=".55"/><stop offset="1" stop-color="#ffd23f" stop-opacity="0"/></radialGradient></defs>'+
  '<rect width="200" height="200" fill="#1a1030"/><circle cx="100" cy="100" r="95" fill="url(#'+u+'r)"/>'+ring+
  '<g>'+P(30,55,42,90)+'<rect x="55" y="42" width="90" height="90" rx="14" fill="none" stroke="url(#'+u+'g)" stroke-width="4"/></g>'+
  '<g transform="translate(100 36)"><path d="M-26 12 L-30 -10 L-15 0 L0 -16 L15 0 L30 -10 L26 12Z" fill="url(#'+u+'g)" stroke="#2a1400" stroke-width="2.5"/><circle cy="-16" r="3.5" fill="#ff2e63"/></g>'+
  '<g transform="translate(100 156)"><rect x="-58" y="-14" width="116" height="30" rx="9" fill="rgba(10,6,20,.85)" stroke="url(#'+u+'g)" stroke-width="2"/><text y="4" text-anchor="middle" font-family="Brush Script MT,Segoe Script,cursive" font-style="italic" font-size="21" fill="#ffd23f">Влад</text><text y="13" text-anchor="middle" font-size="5.5" font-weight="900" fill="#fff" letter-spacing="1">СОЗДАТЕЛЬ ИГРЫ</text></g></svg>'};
document.addEventListener("click",e=>{const b=e.target.closest&&e.target.closest("#fan-go");if(!b)return;
 if(!confirm("Набор фаната за 20 000 ⭐: карта «Все Воины Эпох» с подписью создателя + секретный подарок от создателя. Покупаем?"))return;buyItem({item:"fan"})});
document.addEventListener("click",e=>{const b=e.target.closest&&e.target.closest(".fan-sz [data-s]");if(!b)return;b.parentNode.querySelectorAll("[data-s]").forEach(x=>x.classList.toggle("on",x===b))});
{const _ps=payShow;payShow=function(r){if(r&&r.item==="fan"&&r.status!=="refund"){renderAll();try{sfx.coin();hapN("success")}catch(e){}const m=$("modal"),sh=$("msheet");m.hidden=false;
 sh.innerHTML='<div class="box nickbox" style="text-align:center"><div style="font-size:64px">👑</div><h3>Ты — фанат «Воинов Эпох»!</h3><p class="cln">Карта «Все Воины Эпох» с подписью создателя уже в твоей коллекции — навсегда.</p><p class="cln">🎁 Тебя ждёт секретный подарок лично от создателя — администратор <b>@voinovadmin</b> напишет тебе в Telegram в течение 24 часов.</p><p class="cln">Спасибо, что ты с нами ❤️</p><button type="button" class="craftbtn" id="fan-x">Ура!</button></div>';$("fan-x").onclick=closeModal;return}return _ps.apply(this,arguments)}}

/* 🎁 сундук-загадка: выбор одного из трёх призов */
function mystOpen(){const M=S&&S.myst;if(!M||!M.o)return;const m=$("modal"),sh=$("msheet");m.hidden=false;
 sh.innerHTML='<div class="box nickbox mystbox"><h3>🎁 Сундук-загадка</h3><p class="cln">Выбери <b>один</b> приз из трёх — остальные исчезнут.</p><div class="myst-o">'+M.o.map((k,i)=>{const R=MYST[k];return '<button type="button" data-i="'+i+'" style="animation-delay:'+(i*.12)+'s"><i>'+R.ic+'</i><b>'+R.n+'</b></button>'}).join("")+'</div><button type="button" class="ghost" id="myst-x">Выберу позже</button></div>';
 $("myst-x").onclick=closeModal;sh.querySelectorAll(".myst-o [data-i]").forEach(b=>b.onclick=async()=>{const r=await act("myst_pick",{i:+b.dataset.i});if(!r)return;try{sfx.coin();hapN("success")}catch(e){}renderAll();
  sh.innerHTML='<div class="box nickbox mystbox"><div style="font-size:60px">'+r.ic+'</div><h3>Твой приз: '+r.got+'</h3><p class="cln">Завтра — новый сундук-загадка 🎁</p><button type="button" class="craftbtn" id="myst-ok">Забрать</button></div>';$("myst-ok").onclick=closeModal})}
{const _ps=payShow;payShow=function(r){if(r&&["dia30","shelfx","clad","myst"].includes(r.item)&&r.status!=="refund"){renderAll();try{sfx.coin();hapN("success")}catch(e){}
  if(r.item==="myst"){mystOpen();return}toast({dia30:"💎 Алмазный профиль включён на 30 дней!",shelfx:"🏛 Витрина расширена до 15 мест!",clad:"📣 Твой клан в ленте LIVE на 1 час!"}[r.item]);try{closeModal()}catch(e){}return}return _ps.apply(this,arguments)}}
document.addEventListener("click",e=>{const b=e.target.closest&&e.target.closest('[data-buy="myst"]');if(b&&S&&S.myst){e.preventDefault();e.stopPropagation();mystOpen()}},true);

/* 💥 ловец вылетов: каждые 5 сек запоминаем, что происходит; если прошлый запуск оборвался без закрытия — шлём отчёт в админку */
{const K="vcrash",now=()=>Date.now(),rd=()=>{try{return JSON.parse(localStorage.getItem(K)||"null")}catch(e){return null}},wr=o=>{try{localStorage.setItem(K,JSON.stringify(o))}catch(e){}};
 let lastAct="",sent=0;const send=(kind,d)=>{if(sent>=5||!ONLINE)return;sent++;try{fetch(API_URL.replace(/\/$/,"")+"/api",{method:"POST",headers:{"Content-Type":"application/json","X-Init-Data":INIT||"","X-Dev-User":DEV_USER||""},body:JSON.stringify({a:"crash_rep",p:{kind,d}})}).catch(()=>{})}catch(e){}};
 const snap=()=>{const tab=(document.querySelector("section.sec:not([hidden])")||{}).id||"",mo=$("modal");let mem=0;try{mem=performance.memory?Math.round(performance.memory.usedJSHeapSize/1048576):0}catch(e){}
   return {t:now(),tab,modal:mo&&!mo.hidden?((document.querySelector("#msheet h3")||{}).textContent||"окно").slice(0,40):"",dom:document.getElementsByTagName("*").length,cards:S&&S.cards?S.cards.length:0,mem,act:lastAct,ua:navigator.userAgent.slice(0,140),w:innerWidth,h:innerHeight,v:(document.querySelector('script[src*="game.js"]')||{}).src?.split("v=")[1]||""}};
 const prev=rd();
 const boot=setInterval(()=>{if(!S||!ONLINE||$("boot"))return;clearInterval(boot);
   if(prev&&!prev.clean&&now()-prev.t<15*6e4&&now()-prev.t>0)send("crash",prev);
   wr(Object.assign(snap(),{clean:0}));setInterval(()=>{if(!document.hidden)wr(Object.assign(snap(),{clean:0}))},5000)},700);
 const ok=()=>{const o=rd()||snap();o.clean=1;wr(o)};document.addEventListener("visibilitychange",()=>{if(document.hidden)ok();else{const o=rd();if(o){o.clean=0;o.t=now();wr(o)}}});addEventListener("pagehide",ok);
 try{const _a=act;act=function(n){lastAct=String(n||"");return _a.apply(this,arguments)}}catch(e){}
 addEventListener("error",e=>{try{send("js",{m:String(e.message||"").slice(0,200),f:String(e.filename||"").split("/").pop().slice(0,60),l:e.lineno,c:e.colno,tab:snap().tab,act:lastAct,ua:navigator.userAgent.slice(0,120)})}catch(_){}});
 addEventListener("unhandledrejection",e=>{try{send("js",{m:String(e.reason&&e.reason.message||e.reason||"").slice(0,200),tab:snap().tab,act:lastAct})}catch(_){}})}
async function crashOpen(){const m=$("modal"),sh=$("msheet");m.hidden=false;sh.innerHTML='<div class="box nickbox"><p>Загружаю…</p></div>';const r=await act("crash_list");if(!r)return;
 const tag=k=>k==="crash"?"💥 вылет":"🐞 ошибка",dev=ua=>/iPhone|iPad/.test(ua||"")?"iPhone":/Android/.test(ua||"")?((ua.match(/;\s*([^;)]+)\sBuild/)||[])[1]||"Android"):"ПК",tm=t=>new Date(t).toLocaleString("ru-RU",{day:"2-digit",month:"2-digit",hour:"2-digit",minute:"2-digit"});
 const sum=(r.day||[]).map(x=>tag(x.kind)+": "+x.n+" ("+x.u+" игр.)").join(" · ")||"за сутки ничего";
 sh.innerHTML='<div class="box nickbox crbox"><h3>💥 Вылеты и ошибки</h3><p class="cln">За 24 ч: '+sum+'</p><div class="crl">'+(r.items||[]).map(x=>{let d={};try{d=JSON.parse(x.data)}catch(e){}
   return '<div class="cri '+x.kind+'"><b>'+tag(x.kind)+' · '+escH(x.name||String(x.uid))+'</b><small>'+tm(x.t)+' · '+dev(d.ua)+(d.cards!=null?' · карт '+d.cards:'')+(d.dom?' · DOM '+d.dom:'')+(d.mem?' · '+d.mem+' МБ':'')+'</small><span>'+escH(x.kind==="crash"?("вкладка «"+(d.tab||"?").replace("sec-","")+"»"+(d.modal?", окно «"+d.modal+"»":"")+(d.act?", последнее действие: "+d.act:"")):((d.m||"")+(d.f?" @ "+d.f+":"+d.l:"")+(d.tab?" · "+d.tab.replace("sec-",""):"")))+'</span></div>'}).join("")+'</div><button type="button" class="ghost" id="cr-x">Закрыть</button></div>';$("cr-x").onclick=closeModal}

/* 🎯 задание клана на неделю */
{const _dc=drawClan;drawClan=function(){_dc.apply(this,arguments);try{const b=$("clan-body");if(!b||!clData||!clData.clan||!clData.goal)return;const G=clData.goal,mx=CLAN_GOAL[CLAN_GOAL.length-1].n;let x=b.querySelector(".cgoal");if(!x){x=document.createElement("div");x.className="box cgoal";const ban=b.querySelector(".cw-ban");if(ban)ban.after(x);else b.prepend(x)}
  x.innerHTML='<h3>🎯 Задание клана на неделю</h3><p class="cln">Открывайте карты всем кланом — каждый участник забирает награду за каждый этап</p><div class="cg-bar"><u style="width:'+Math.min(100,G.n/mx*100)+'%"></u>'+CLAN_GOAL.map(t=>'<i style="left:'+(t.n/mx*100)+'%">'+t.t+'</i>').join("")+'</div><div class="cg-n"><b>'+fmtN(G.n)+'</b> / '+fmtN(mx)+' карт</div>'+
   CLAN_GOAL.map((t,i)=>{const got=G.got.includes(i),ok=G.n>=t.n;return '<div class="cg-t'+(got?" got":ok?" ready":"")+'"><span>'+t.t+' <b>'+fmtN(t.n)+' карт</b><small>🎴 '+t.sp+' · 🪙 '+fmtN(t.cash)+(t.guar?' · 💎 '+t.guar+' эпик':'')+'</small></span>'+(got?'<em>✅</em>':ok?'<button type="button" class="mini2" data-cg="'+i+'">Забрать</button>':'<em>'+Math.max(0,t.n-G.n)+' ещё</em>')+'</div>'}).join("");
  x.querySelectorAll("[data-cg]").forEach(bt=>bt.onclick=async()=>{bt.disabled=true;const r=await act("clan_goal",{tier:+bt.dataset.cg});if(!r){bt.disabled=false;return}try{sfx.fanfare();burst(3);hapN("success")}catch(e){}toast("🎯 Награда клана: +"+r.sp+" прокруток, +"+fmtN(r.cash)+" 🪙"+(r.guar?", +"+r.guar+" гарант эпика":""));G.got.push(r.tier);drawClan()})}catch(e){console.error(e)}}}

/* 👥 Друзья: список, онлайн, витрина, подарок и бой через витрину */
async function frOpen(){const m=$("modal"),sh=$("msheet");m.hidden=false;sh.innerHTML='<div class="box nickbox"><p>Загружаю…</p></div>';const r=await act("fr_list");if(!r)return;frDraw(r)}
function frDraw(r){const sh=$("msheet"),now=r.now||Date.now(),ago=t=>{const d=(now-t)/6e4;return !t?"давно":d<5?"🟢 в игре":d<60?Math.round(d)+" мин назад":d<1440?Math.round(d/60)+" ч назад":Math.round(d/1440)+" дн назад"};
 sh.innerHTML='<div class="box nickbox frbox"><h3>👥 Друзья</h3><div class="fr-add"><input type="text" id="fr-nick" maxlength="20" placeholder="Ник друга"><button type="button" class="mini2" id="fr-go">➕ Добавить</button></div>'+
  (r.inc&&r.inc.length?'<div class="fr-inc"><b>Тебя добавили:</b>'+r.inc.map(x=>'<button type="button" class="mini2" data-fa="'+x.uid+'">➕ '+escH(x.name)+'</button>').join("")+'</div>':'')+
  (r.list.length?'<div class="fr-l">'+r.list.map(x=>'<div class="fr-r"><span><b>'+(x.vip?"👑 ":"")+escH(x.name)+(x.mut?' <i title="взаимно">🤝</i>':'')+'</b><small>'+ago(x.seen)+' · воинов '+x.have+'</small></span><button type="button" class="mini2" data-fo="'+x.uid+'">Витрина</button><button type="button" class="fr-del" data-fd="'+x.uid+'">✕</button></div>').join("")+'</div>':'<p class="cln">Пока пусто. Добавь друга по нику или открой витрину игрока и нажми «➕ В друзья». В витрине друга — подарок карты и вызов на бой.</p>')+
  '<button type="button" class="ghost" id="fr-x">Закрыть</button></div>';
 $("fr-x").onclick=closeModal;
 $("fr-go").onclick=async()=>{const n=$("fr-nick").value.trim();if(!n)return;const a=await act("fr_add",{nick:n});if(a){toast("👥 "+a.added+" в друзьях!");frOpen()}};
 sh.querySelectorAll("[data-fa]").forEach(b=>b.onclick=async()=>{const a=await act("fr_add",{uid:+b.dataset.fa});if(a){toast("🤝 Теперь вы друзья!");frOpen()}});
 sh.querySelectorAll("[data-fd]").forEach(b=>b.onclick=async()=>{if(!confirm("Убрать из друзей?"))return;await act("fr_del",{uid:+b.dataset.fd});frOpen()});
 sh.querySelectorAll("[data-fo]").forEach(b=>b.onclick=async()=>{const uid=+b.dataset.fo,p=await act("profile",{uid});if(p){closeModal();openShowcase(Object.assign(p,{p:"u_"+uid}))}})}
{const _mg=menuGo;menuGo=function(k){if(k==="friends"){try{menuClose()}catch(e){}return frOpen()}return _mg.apply(this,arguments)}}
{const _os=openShowcase;openShowcase=function(F){const r=_os.apply(this,arguments);try{if(F&&F.uid&&S&&F.uid!==S.uid&&ONLINE){const sh=$("msheet"),b=document.createElement("button");b.type="button";b.className="mini2 fr-addb";b.textContent="➕ В друзья";b.onclick=async()=>{const a=await act("fr_add",{uid:F.uid});if(a){toast("👥 "+a.added+" в друзьях!");b.disabled=true;b.textContent="✅ В друзьях"}};const w=sh.querySelector(".who");if(w)w.after(b)}}catch(e){}return r}}
{const t=setInterval(()=>{if(!S||!ONLINE||$("boot"))return;clearInterval(t);if(new URLSearchParams(location.search).get("fr"))setTimeout(frOpen,600)},700)}

/* 🔓 Постепенное открытие разделов: всё видно сразу, но новые разделы под замком с тизером «откроется после N карт»; открытие — праздник и подарок */
const unlOn=()=>!!(S&&ONLINE&&S.created>=UNLOCK_FROM&&UNLOCKS.some(U=>!(S.unl||{})[U.k]));
const unlLocked=k=>{if(!unlOn())return false;const U=UNLOCKS.find(x=>x.k===k);return !!U&&(S.nOp||0)<U.at};
const unlOfTab=id=>UNLOCKS.find(U=>U.tabs.includes(id)),unlOfMenu=k=>UNLOCKS.find(U=>U.menu.includes(k));
function unlTease(U){const n=S.nOp||0,m=$("modal"),sh=$("msheet");m.hidden=false;
 sh.innerHTML='<div class="box nickbox unlbox"><div class="unl-ic">🔒'+U.ic+'</div><h3>'+U.n+' откроется скоро</h3><p class="cln">'+U.d+'</p><div class="unl-bar"><u style="width:'+Math.min(100,n/U.at*100)+'%"></u><span>'+n+' / '+U.at+' карт</span></div><p class="cln">Открой ещё <b>'+Math.max(0,U.at-n)+'</b> '+plural(Math.max(0,U.at-n),"карточку","карточки","карточек")+' — и раздел откроется с подарком 🎁 +'+U.gift+' прокрутки</p><button type="button" class="craftbtn" id="unl-go">🎴 Крутить</button></div>';
 $("unl-go").onclick=()=>{closeModal();setTab("spin")}}
function unlApply(){if(!S)return;const on=unlOn();UNLOCKS.forEach(U=>U.tabs.forEach(id=>{const b=$(id);if(!b)return;const lk=on&&(S.nOp||0)<U.at;b.classList.toggle("lk",lk);
  const nw=on&&!lk&&!(S.unl||{})[U.k];b.classList.toggle("unl-new",nw)}));
 if(!on)return;const R=UNLOCKS.find(U=>(S.nOp||0)>=U.at&&!(S.unl||{})[U.k]);if(R&&$("modal").hidden&&!unlApply.shown&&!$("tut")&&!$("nks")&&!$("sbg")&&!$("chg")){unlApply.shown=R.k;unlParty(R)}}
function unlParty(U){const m=$("modal"),sh=$("msheet");if(!m.hidden){unlApply.shown=0;return}m.hidden=false;try{sfx.fanfare();burst(4);hapN("success")}catch(e){}
 sh.innerHTML='<div class="box nickbox unlbox party"><div class="unl-ic">🎉'+U.ic+'</div><h3>Открыт новый раздел: '+U.n+'!</h3><p class="cln">'+U.d+'</p><button type="button" class="craftbtn" id="unl-take">🎁 Забрать +'+U.gift+' прокрутки и открыть</button></div>';
 $("unl-take").onclick=async()=>{const r=await act("unl_claim",{k:U.k});unlApply.shown=0;closeModal();if(r){toast("🎁 +"+r.sp+" прокруток!");renderAll()}const t=$(U.tabs[0]);if(t)setTimeout(()=>t.click(),150)}}
window.addEventListener("click",e=>{if(!S||!unlOn())return;const t=e.target.closest&&e.target.closest("nav.tabs button");if(t){const U=unlOfTab(t.id);if(U&&unlLocked(U.k)){e.preventDefault();e.stopImmediatePropagation();hap("light");unlTease(U)}}},true);
{const _mg=menuGo;menuGo=function(k){const U=unlOfMenu(k);if(U&&unlLocked(U.k)){try{menuClose()}catch(e){}return unlTease(U)}return _mg.apply(this,arguments)}}
{const _ra=renderAll;renderAll=function(){const r=_ra.apply(this,arguments);try{unlApply()}catch(e){}return r}}
{const SEC={duel:"fight",camp:"fight",conq:"fight",clan:"clan",dragon:"dragon",cas:"cas"};const blk=k=>{if(k&&unlLocked(k)){unlTease(UNLOCKS.find(x=>x.k===k));return true}return false};
 const _st=setTab;setTab=function(t){if(blk(SEC[t]))return;return _st.apply(this,arguments)};
 [["openMap","map"],["openCas","cas"],["openCamp","fight"]].forEach(([f,k])=>{const o=window[f];if(typeof o!=="function")return;window[f]=function(){if(blk(k))return;return o.apply(this,arguments)}})}

/* 🎩 Карта дня 15.11: «Наполеон» — пушка стреляет, ядро летит через небо и взрывается; флаг развевается */
DETAILED["Наполеон"]=id=>{const u="nap"+String(id).replace(/[^a-z0-9_]/gi,""),D='dur="2.4s" repeatCount="indefinite"',I='#1a1020';
 return '<svg viewBox="0 0 200 200" class="pt" aria-hidden="true"><defs><linearGradient id="'+u+'s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3a2a6e"/><stop offset=".45" stop-color="#d9603a"/><stop offset=".75" stop-color="#ffb35c"/><stop offset="1" stop-color="#5a2a2a"/></linearGradient>'+
  '<linearGradient id="'+u+'b" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff2b0"/><stop offset=".5" stop-color="#d9993a"/><stop offset="1" stop-color="#6a3c10"/></linearGradient><linearGradient id="'+u+'c" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#2c4596"/><stop offset="1" stop-color="#121d4a"/></linearGradient>'+
  '<radialGradient id="'+u+'x"><stop offset="0" stop-color="#fff7c0"/><stop offset=".4" stop-color="#ffb02e"/><stop offset="1" stop-color="#ff3d1e" stop-opacity="0"/></radialGradient><radialGradient id="'+u+'f" cx=".45" cy=".4"><stop offset="0" stop-color="#ffe0bf"/><stop offset="1" stop-color="#e9b58c"/></radialGradient></defs>'+
  '<rect width="200" height="200" fill="url(#'+u+'s)"/><circle cx="40" cy="92" r="20" fill="#fff0a8" opacity=".55"/>'+
  '<path d="M0 118 Q40 100 80 112 T160 104 T200 110 V200 H0Z" fill="#3b2240"/><path d="M0 134 Q60 120 120 130 T200 126 V200 H0Z" fill="#26142e"/>'+
  /* флаг Франции */
  '<g transform="translate(150 44)"><rect x="-1.5" y="0" width="3" height="80" fill="#5a3a1a" stroke="'+I+'" stroke-width="1.5"/><circle cy="-2" r="3" fill="url(#'+u+'b)"/>'+
   '<g><path d="M1.5 2 Q12 -2 22 3 T44 3 V27 Q34 22 22 27 T1.5 26Z" fill="#fff" stroke="'+I+'" stroke-width="2"><animate attributeName="d" values="M1.5 2 Q12 -2 22 3 T44 3 V27 Q34 22 22 27 T1.5 26Z;M1.5 2 Q12 7 22 2 T44 6 V30 Q34 31 22 25 T1.5 26Z;M1.5 2 Q12 -2 22 3 T44 3 V27 Q34 22 22 27 T1.5 26Z" dur="1.8s" repeatCount="indefinite"/></path>'+
   '<path d="M1.5 2 Q8 -.5 14.5 1 V25.5 Q8 25 1.5 26Z" fill="#2c4596"/><path d="M30 2.5 Q37 4 44 3 V27 Q37 24 30 26Z" fill="#d6283c"><animate attributeName="d" values="M30 2.5 Q37 4 44 3 V27 Q37 24 30 26Z;M30 4 Q37 6 44 6 V30 Q37 30 30 27Z;M30 2.5 Q37 4 44 3 V27 Q37 24 30 26Z" dur="1.8s" repeatCount="indefinite"/></path></g></g>'+
  /* дым боя */
  '<g opacity=".28" fill="#f0e2da"><g><animateTransform attributeName="transform" type="translate" values="-8 0;10 -2;-8 0" dur="9s" repeatCount="indefinite"/><circle cx="14" cy="110" r="8"/><circle cx="24" cy="106" r="10"/><circle cx="34" cy="111" r="7"/></g><g><animateTransform attributeName="transform" type="translate" values="6 0;-10 -2;6 0" dur="11s" repeatCount="indefinite"/><circle cx="172" cy="116" r="8"/><circle cx="182" cy="111" r="10"/><circle cx="192" cy="117" r="7"/></g></g>'+
  /* Наполеон */
  '<g transform="translate(96 0)">'+
   '<path d="M-44 150 Q-42 116 -14 108 L14 108 Q42 116 44 150Z" fill="url(#'+u+'c)" stroke="'+I+'" stroke-width="3" stroke-linejoin="round"/>'+
   '<path d="M-12 108 L0 140 L12 108Z" fill="#f4f1ea" stroke="'+I+'" stroke-width="2.5" stroke-linejoin="round"/><path d="M-6 122 h12 M-4 130 h8" stroke="#c9c2b4" stroke-width="1.5"/>'+
   '<circle cx="-8" cy="126" r="1.8" fill="url(#'+u+'b)"/><circle cx="-8" cy="134" r="1.8" fill="url(#'+u+'b)"/>'+
   '<path d="M-38 116 Q-30 108 -20 112 L-22 120 Q-32 118 -38 124Z M38 116 Q30 108 20 112 L22 120 Q32 118 38 124Z" fill="url(#'+u+'b)" stroke="'+I+'" stroke-width="2.5" stroke-linejoin="round"/>'+
   '<path d="M-37 124 v7 M-33 121 v8 M-29 120 v8 M37 124 v7 M33 121 v8 M29 120 v8" stroke="#ffd25a" stroke-width="2" stroke-linecap="round"/>'+
   '<path d="M-16 100 Q0 112 16 100 L17 110 Q0 118 -17 110Z" fill="#b3122e" stroke="'+I+'" stroke-width="2.5" stroke-linejoin="round"/><path d="M-15 104 Q0 113 15 104" stroke="#ffd25a" stroke-width="1.6" fill="none"/>'+
   '<path d="M-8 92 h16 v12 h-16Z" fill="url(#'+u+'f)" stroke="'+I+'" stroke-width="2.5"/>'+
   '<ellipse cx="-17" cy="78" rx="4" ry="6" fill="url(#'+u+'f)" stroke="'+I+'" stroke-width="2.5"/><ellipse cx="17" cy="78" rx="4" ry="6" fill="url(#'+u+'f)" stroke="'+I+'" stroke-width="2.5"/>'+
   '<ellipse cx="0" cy="77" rx="17" ry="20" fill="url(#'+u+'f)" stroke="'+I+'" stroke-width="3"/>'+
   '<path d="M-14 62 Q-6 58 2 64 Q-4 66 -2 72 Q-8 66 -14 70Z" fill="#3a2414" stroke="'+I+'" stroke-width="2" stroke-linejoin="round"/>'+
   '<path d="M-11 72 l7 2 M11 72 l-7 2" stroke="'+I+'" stroke-width="3" stroke-linecap="round"/>'+
   '<ellipse cx="-7" cy="78" rx="2.3" ry="2.6" fill="'+I+'"/><ellipse cx="7" cy="78" rx="2.3" ry="2.6" fill="'+I+'"/><circle cx="-6.2" cy="77" r=".8" fill="#fff"/><circle cx="7.8" cy="77" r=".8" fill="#fff"/>'+
   '<path d="M0 79 Q-3 85 1 87" stroke="#b07a55" stroke-width="2" fill="none" stroke-linecap="round"/><path d="M-6 91 Q0 89 6 91" stroke="'+I+'" stroke-width="2.6" fill="none" stroke-linecap="round"/>'+
   '<path d="M-14 84 Q-12 92 -6 95" stroke="#d99a72" stroke-width="2" fill="none" opacity=".7"/>'+
   /* двууголка */
   '<path d="M-46 66 Q-30 34 0 32 Q30 34 46 66 Q24 56 0 58 Q-24 56 -46 66Z" fill="#141018" stroke="'+I+'" stroke-width="3" stroke-linejoin="round"/>'+
   '<path d="M-44 64 Q-24 54 0 56 Q24 54 44 64" stroke="url(#'+u+'b)" stroke-width="2.5" fill="none"/>'+
   '<path d="M-30 46 Q-14 38 -4 40" stroke="#fff" stroke-width="2" fill="none" opacity=".35" stroke-linecap="round"/>'+
   '<g transform="translate(16 48)"><circle r="7.5" fill="#2c4596" stroke="'+I+'" stroke-width="2"/><circle r="5" fill="#fff"/><circle r="2.6" fill="#d6283c"/></g>'+
  '</g>'+
  /* пушка: отдача при выстреле */
  '<g><animateTransform attributeName="transform" type="translate" values="0 0;-5 2;0 0;0 0" keyTimes="0;.05;.22;1" '+D+'/>'+
   '<g transform="translate(46 116) rotate(-28)"><path d="M-22 -9 L26 -6 L26 6 L-22 9 Q-30 0 -22 -9Z" fill="url(#'+u+'b)" stroke="'+I+'" stroke-width="3" stroke-linejoin="round"/>'+
    '<rect x="22" y="-8" width="6" height="16" rx="2" fill="url(#'+u+'b)" stroke="'+I+'" stroke-width="2.5"/><path d="M-6 -8 v16 M8 -7 v14" stroke="#6a3c10" stroke-width="2"/><circle cx="-28" cy="0" r="4" fill="url(#'+u+'b)" stroke="'+I+'" stroke-width="2"/></g>'+
   '<path d="M20 140 L40 120 L60 132 L52 142Z" fill="#5a3a1a" stroke="'+I+'" stroke-width="2.5" stroke-linejoin="round"/>'+
   '<g transform="translate(40 136)"><circle r="12" fill="none" stroke="#5a3a1a" stroke-width="4"/><circle r="12" fill="none" stroke="'+I+'" stroke-width="1.5"/><path d="M-11 0 H11 M0 -11 V11 M-8 -8 L8 8 M-8 8 L8 -8" stroke="#5a3a1a" stroke-width="2.4"/><circle r="3" fill="url(#'+u+'b)" stroke="'+I+'" stroke-width="1.5"/></g></g>'+
  /* вспышка и дым у дула */
  '<g transform="translate(73 100)"><circle r="0" fill="url(#'+u+'x)"><animate attributeName="r" values="0;16;6;0;0" keyTimes="0;.04;.12;.18;1" '+D+'/></circle>'+
   '<path d="M0 -12 L3 -3 L13 -5 L5 2 L10 11 L0 5 L-6 12 L-4 2 L-12 -2 L-3 -4Z" fill="#fff4a0" opacity="0"><animate attributeName="opacity" values="0;1;0;0" keyTimes="0;.03;.12;1" '+D+'/></path>'+
   '<circle r="4" fill="#d8ccc4" opacity="0"><animate attributeName="r" values="4;4;16;22" keyTimes="0;.06;.5;1" '+D+'/><animate attributeName="opacity" values="0;.8;.35;0" keyTimes="0;.06;.5;1" '+D+'/><animate attributeName="cy" values="0;0;-10;-16" keyTimes="0;.06;.5;1" '+D+'/></circle></g>'+
  /* ядро летит по дуге */
  '<g opacity="0"><animate attributeName="opacity" values="0;1;1;0;0" keyTimes="0;.04;.56;.6;1" '+D+'/>'+
   '<animateMotion path="M74 98 Q120 4 182 52" keyPoints="0;0;1;1" keyTimes="0;.04;.6;1" calcMode="linear" '+D+'/>'+
   '<circle r="5.5" fill="#2a2430" stroke="'+I+'" stroke-width="1.5"/><circle cx="-1.8" cy="-1.8" r="1.6" fill="#8a8494"/><path d="M-6 3 Q-14 8 -22 9" stroke="#ffb02e" stroke-width="2.5" fill="none" opacity=".75" stroke-linecap="round"/></g>'+
  /* взрыв */
  '<g transform="translate(182 52)"><circle r="0" fill="url(#'+u+'x)"><animate attributeName="r" values="0;0;20;26;0" keyTimes="0;.58;.66;.8;.82" '+D+'/></circle>'+
   '<path d="M0 -16 L4 -5 L16 -8 L7 2 L13 14 L0 7 L-9 15 L-6 3 L-16 -2 L-4 -5Z" fill="#fff4a0" opacity="0"><animate attributeName="opacity" values="0;0;1;0;0" keyTimes="0;.58;.63;.75;1" '+D+'/><animateTransform attributeName="transform" type="scale" values="0;0;1.2;1.5;0" keyTimes="0;.58;.66;.78;.8" '+D+'/></path></g>'+
 '</svg>'};
/* 💀 Карта дня 15.11: «Банда» — Баба Яга, Кощей и Дракула вместе. Дракула кусается, Кощей крутит иглу */
DETAILED["Банда"]=id=>{const u="bnd"+String(id).replace(/[^a-z0-9_]/gi,""),hx=n=>{for(let i=HEROES.length-1;i>=0;i--)if(HEROES[i][0]===n)return i;return -1},
 P=(n,x,y,s)=>{const h=hx(n);if(h<0||!DETAILED[n])return "";const k=u+"c"+x;return '<clipPath id="'+k+'"><rect x="'+x+'" y="'+y+'" width="'+s+'" height="'+s+'" rx="'+(s/7)+'"/></clipPath><g clip-path="url(#'+k+')"><g transform="translate('+x+' '+y+') scale('+(s/200)+')">'+DETAILED[n](u+"_"+x).trim().replace(/^<svg[^>]*>/,"").replace(/<\/svg>$/,"")+'</g></g><rect x="'+x+'" y="'+y+'" width="'+s+'" height="'+s+'" rx="'+(s/7)+'" fill="none" stroke="url(#'+u+'g)" stroke-width="3"/>'};
 return '<svg viewBox="0 0 200 200" class="pt" aria-hidden="true"><defs><linearGradient id="'+u+'g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#e0fff0"/><stop offset=".5" stop-color="#7dffb2"/><stop offset="1" stop-color="#1f8a55"/></linearGradient><radialGradient id="'+u+'r"><stop offset="0" stop-color="#7a1fa8" stop-opacity=".7"/><stop offset="1" stop-color="#0a0614" stop-opacity="0"/></radialGradient></defs>'+
 '<rect width="200" height="200" fill="#0b0816"/><circle cx="100" cy="96" r="100" fill="url(#'+u+'r)"/>'+
 '<g><animateTransform attributeName="transform" type="translate" values="0 0;0 -6;0 0" dur="2.4s" repeatCount="indefinite"/>'+P("Баба Яга в ступе",4,50,80)+'</g>'+
 '<g>'+P("Кощей",54,40,92)+
  '<g transform="translate(100 30)"><g><animateTransform attributeName="transform" type="rotate" values="0;360" dur="1.4s" repeatCount="indefinite"/><path d="M-14 0 H12 M12 0 l-3 -2 M12 0 l-3 2" stroke="url(#'+u+'g)" stroke-width="3" stroke-linecap="round"/><circle cx="-14" cy="0" r="2.4" fill="none" stroke="#7dffb2" stroke-width="1.5"/></g><circle r="15" fill="none" stroke="#7dffb2" stroke-width="1" opacity=".4"><animate attributeName="r" values="12;18;12" dur="1.4s" repeatCount="indefinite"/></circle></g>'+
  '<g opacity="0"><animate attributeName="opacity" values="0;0;1;1;0" keyTimes="0;.42;.48;.7;.8" dur="3s" repeatCount="indefinite"/><circle cx="114" cy="100" r="2.8" fill="#d61f3a"/><circle cx="121" cy="100" r="2.8" fill="#d61f3a"/><path d="M114 103 v7 M121 103 v5" stroke="#d61f3a" stroke-width="2" stroke-linecap="round"/></g></g>'+
 '<g><animateTransform attributeName="transform" type="translate" values="0 0;0 0;-16 -6;-16 -6;0 0" keyTimes="0;.38;.46;.62;.75" dur="3s" repeatCount="indefinite"/>'+P("Дракула",116,50,80)+'</g>'+
 '<g transform="translate(156 56)" opacity="0"><animate attributeName="opacity" values="0;0;1;1;0" keyTimes="0;.44;.48;.66;.74" dur="3s" repeatCount="indefinite"/><path d="M-22 -8 L22 -10 L18 10 L-20 8Z" fill="#d61f3a" stroke="#fff" stroke-width="2"/><text y="5" text-anchor="middle" font-size="12" font-weight="900" fill="#fff">КУСЬ!</text></g>'+
 '</svg>'};

/* 🔥 Огонёк: дни подряд + спасение за звёзды */
function fireBox(){const st=$("streak");if(!st||!S)return;const box=st.closest(".box");if(!box)return;let f=$("fire-box");if(!f){f=document.createElement("div");f.id="fire-box";f.className="fire-box";box.appendChild(f)}
 const F=S.fire||{n:0,best:0},n=F.n|0,nx=FIRE.mil.find(x=>x>n)||n+1,lost=S.fireLost&&S.fireLost.day===today(NOW())?S.fireLost:null,k=Math.min(1,n/nx);
 f.innerHTML='<div class="fire-top"><span class="fire-ic'+(n>=7?" big":"")+'">🔥</span><span><b>Огонёк: '+n+' '+plural(n,"день","дня","дней")+' подряд</b><small>Рекорд: '+(F.best|0)+' · бонус к награде: +'+Math.min(5,Math.floor(n/7))+' 🎴'+(S.fireFrame?' · 🔥 огненная рамка':'')+'</small></span></div>'+
  '<div class="fire-bar"><u style="width:'+(k*100)+'%"></u><span>до '+nx+' дней: '+(nx===30?"огненная рамка профиля":nx===100?"титул «Неугасимый»":"+5 🎴 бонусом")+'</span></div>'+
  (lost?'<div class="fire-lost"><b>💨 Огонёк погас — было '+lost.n+' '+plural(lost.n,"день","дня","дней")+'</b><button type="button" class="craftbtn" id="fire-save">🔥 Спасти за '+FIRE.save+' ⭐</button></div>':'')}
document.addEventListener("click",e=>{if(e.target.closest&&e.target.closest("#fire-save"))buyItem({item:"fsave"})});
{const _rs=renderStreak;renderStreak=function(){const r=_rs.apply(this,arguments);try{fireBox()}catch(e){}return r}}
{const _ps=payShow;payShow=function(r){if(r&&r.item==="fsave"&&r.status!=="refund"){renderAll();try{sfx.coin();hapN("success")}catch(e){}toast("🔥 Огонёк спасён!");return}return _ps.apply(this,arguments)}}
{const o=$("st-go");if(o){const _c=o.onclick;o.onclick=async()=>{const r=await act("streak");if(!r)return;sfx.coin();toast((r.frame?"🔥 30 дней! Огненная рамка профиля открыта! ":"")+"+"+(1+(r.fsp||0))+" 🎴 · огонёк "+r.fire+" "+plural(r.fire,"день","дня","дней")+" подряд");renderAll()}}}

/* 🏆 Витрина: огонёк и трофеи */
{const _os=openShowcase;openShowcase=function(F){const r=_os.apply(this,arguments);try{const sh=$("msheet"),who=sh.querySelector(".who");
 if(F.fire&&(F.fire.n||F.fire.best)){const d=document.createElement("div");d.className="sc-fire";d.innerHTML='🔥 <b>'+(F.fire.n|0)+'</b> '+plural(F.fire.n|0,"день","дня","дней")+' подряд · рекорд '+(F.fire.best|0)+(F.fire.title?' · <b>Неугасимый</b>':'');if(who)who.after(d)}
 if(F.fire&&F.fire.frame)sh.querySelector(".box,.who")&&sh.classList.add("fire-frame");
 const T=F.tro||[];if(T.length){const d=document.createElement("div");d.className="sc-tro";d.innerHTML='<h3>🏆 Трофеи · '+T.length+'</h3><div class="tro-g">'+T.map(x=>'<div class="tro"><i>'+escH(x.ic||"🏆")+'</i><span>'+escH(x.txt||"")+'</span></div>').join("")+'</div>';sh.appendChild(d)}}catch(e){}return r}}
{const _cm=closeModal;closeModal=function(){try{$("msheet").classList.remove("fire-frame")}catch(e){}return _cm.apply(this,arguments)}}

/* 🤝 Братья по оружию — в окне друзей */
{const _fd=frDraw;frDraw=function(r){const o=_fd.apply(this,arguments);try{const box=$("msheet").querySelector(".frbox");if(!box)return o;const d=document.createElement("div");d.className="pair-box";d.innerHTML='<p class="cln">Загружаю «Братья по оружию»…</p>';box.appendChild(d);
 act("pair_list").then(P=>{if(!P)return;const L=(P.list||[]).slice().sort((a,b)=>(b.inv-a.inv)||((b.ok&&!b.got)-(a.ok&&!a.got))||(b.n-a.n)).slice(0,15);d.innerHTML='<h3>🤝 Братья по оружию</h3><p class="cln">Позови друга по своей ссылке. Когда вы <b>оба</b> откроете по '+P.need+' карточек — каждый получит редкую карточку на двоих. Её нельзя купить или продать.</p>'+
  (L.length?L.map(x=>'<div class="fr-r"><span><b>'+(x.inv?"🎖 ":"")+escH(x.name)+'</b><small>'+(x.inv?"позвал тебя":"твой друг")+' · ты '+Math.min(P.me,P.need)+'/'+P.need+' · друг '+Math.min(x.n,P.need)+'/'+P.need+'</small></span>'+(x.got?'<em class="pair-ok">✅ есть</em>':x.ok?'<button type="button" class="mini2 pair-go" data-pc="'+x.uid+'">🎁 Забрать</button>':'<em class="pair-wait">⏳</em>')+'</div>').join(""):'<p class="cln">Пока нет друзей по приглашению. Ссылка — в «Пригласить друга».</p>');
  d.onclick=async e=>{const b=e.target.closest("[data-pc]");if(!b)return;b.disabled=true;const q=await act("pair_claim",{uid:+b.dataset.pc});if(q){try{sfx.fanfare();burst(4);hapN("success")}catch(_){}toast("🤝 «Братья по оружию» — в твоей коллекции!");frOpen()}else b.disabled=false}})}catch(e){}return o}}
DETAILED["Братья по оружию"]=id=>{const u="pr"+String(id).replace(/[^a-z0-9_]/gi,""),P=(h,x,y,s,fl)=>{const H=HEROES[h];if(!H)return "";const raw=portrait(h,null).replace(/^[\s\S]*?<svg[^>]*>/,"").replace(/<\/svg>\s*$/,"");const k=u+"c"+x;return '<clipPath id="'+k+'"><circle cx="'+(x+s/2)+'" cy="'+(y+s/2)+'" r="'+(s/2)+'"/></clipPath><g clip-path="url(#'+k+')"><g transform="translate('+(fl?x+s:x)+' '+y+') scale('+(fl?-s/200:s/200)+' '+s/200+')">'+raw+'</g></g><circle cx="'+(x+s/2)+'" cy="'+(y+s/2)+'" r="'+(s/2)+'" fill="none" stroke="url(#'+u+'g)" stroke-width="5"/>'};
 return '<svg viewBox="0 0 200 200" class="pt" aria-hidden="true"><defs><linearGradient id="'+u+'g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff6c8"/><stop offset=".5" stop-color="#ffd23f"/><stop offset="1" stop-color="#c47a12"/></linearGradient><radialGradient id="'+u+'r"><stop offset="0" stop-color="#3a7bd5" stop-opacity=".6"/><stop offset="1" stop-color="#0a1430" stop-opacity="0"/></radialGradient></defs>'+
 '<rect width="200" height="200" fill="#0e1a3a"/><circle cx="100" cy="95" r="110" fill="url(#'+u+'r)"/>'+[0,1,2,3,4,5,6,7].map(i=>'<path d="M100 95 L'+(100+Math.cos(i*.785)*160)+' '+(95+Math.sin(i*.785)*160)+'" stroke="#3a7bd5" stroke-width="10" opacity=".15"/>').join("")+
 P(11,4,34,96,0)+P(10,100,34,96,1)+
 '<g transform="translate(100 140)"><g><animateTransform attributeName="transform" type="translate" values="0 0;0 -4;0 0" dur="1.6s" repeatCount="indefinite"/><circle r="26" fill="url(#'+u+'g)" stroke="#2a1400" stroke-width="3"/><text y="10" text-anchor="middle" font-size="28">🤝</text></g></g>'+
 '<g transform="translate(100 182)"><rect x="-80" y="-13" width="160" height="24" rx="8" fill="rgba(10,14,40,.92)" stroke="url(#'+u+'g)" stroke-width="2"/><text y="5" text-anchor="middle" font-size="11" font-weight="900" letter-spacing="1.5" fill="url(#'+u+'g)">НАВСЕГДА ВМЕСТЕ</text></g></svg>'};

/* ⚔️ Битва кланов выходных */
let cwD=null,cwAt=0;async function cwLoad(){if(Date.now()-cwAt<60e3&&cwD)return cwD;const r=await act("cw_get",{},{quiet:1});if(r){cwD=r;cwAt=Date.now()}return cwD}
{const _dc=drawClan;drawClan=function(){const o=_dc.apply(this,arguments);try{const b=$("clan-body");if(!b||!clData)return o;let w=$("cww-box");if(!w){w=document.createElement("div");w.id="cww-box";w.className="box cww";b.prepend(w)}
 const R=cwD;if(!R){w.innerHTML='<p class="cln">⚔️ Битва кланов выходных…</p>';cwLoad().then(()=>{if(cwD)drawClan()});return o}
 const now=Date.now(),left=R.on?R.end-now:R.start-now,ft=ms=>{const h=Math.floor(ms/36e5),m=Math.floor(ms%36e5/6e4);return h>=24?Math.floor(h/24)+" д "+(h%24)+" ч":h+" ч "+m+" мин"};
 w.innerHTML='<div class="rowb"><h3>⚔️ Битва кланов выходных</h3><em class="cww-t">'+(R.on?"идёт · ещё "+ft(left):"старт в субботу · через "+ft(Math.max(0,left)))+'</em></div><p class="cln">Суббота 00:00 — воскресенье 22:00. Каждая открытая карточка участника = очко клана. Топ-3 клана: <b>каждому участнику</b> '+R.prize.join(" / ")+'</p>'+
  (R.top&&R.top.length?'<div class="cww-l">'+R.top.slice(0,5).map((c,i)=>'<div class="cww-r'+(clData.clan&&c.id===clData.clan.id?" me":"")+'"><b>'+(["🥇","🥈","🥉"][i]||(i+1)+".")+'</b><span>'+escH(c.name)+'</span><em>'+fmtN(c.n)+'</em></div>').join("")+'</div>':'<p class="cln">'+(R.on?"Пока никто не набрал очков — открой карточку первым!":"Таблица появится в субботу.")+'</p>')+
  (R.my&&(R.on||R.my.n)?'<p class="cww-my">Твой клан: <b>'+R.my.place+' место</b> · '+fmtN(R.my.n)+' очков</p>':'');}catch(e){}return o}}

/* 🐉 Драконьи карты усиливают твоего дракона */
{const _rd=renderDragon;renderDragon=function(){const o=_rd.apply(this,arguments);try{const R=$("dg-root"),D=dgOf();if(!R||!D)return o;const have=new Set((S.cards||[]).filter(c=>HEROES[c.h]&&HEROES[c.h][4].dgc).map(c=>c.h)),L=HEROES.map((H,i)=>H[4].dgc?i:-1).filter(i=>i>=0),n=have.size,b=Math.round((n*.03+(n>=7?.09:0))*100);
 let w=$("dgc-box");if(!w){w=document.createElement("div");w.id="dgc-box";w.className="box dgc-box";R.appendChild(w)}
 w.innerHTML='<div class="rowb"><h3>🐉 Драконьи карты</h3><em class="dgc-b">+'+b+'% к силе</em></div><div class="dgc-row">'+L.map(h=>'<span class="'+(have.has(h)?"on":"")+'" title="'+escH(HEROES[h][0])+'">'+(have.has(h)?"🐉":"🔒")+'<small>'+escH(HEROES[h][0].replace(" дракон",""))+'</small></span>').join("")+'</div><p class="cln">'+(n>=7?'✨ Все 7 собраны — твой дракон в <b>звёздном облике</b> и сильнее на 30%!':'Каждая карта дракона в коллекции даёт +3% к силе твоего дракона. Собери все 7 — +30% и звёздный облик ✨')+'</p>';
 R.classList.toggle("dg-star",n>=7)}catch(e){}return o}}

/* 👥 Подписчики: витрина, награды, лента и популярные воины */
{const _os=openShowcase;openShowcase=function(F){let r;try{r=_os.apply(this,arguments)}catch(e){console.error(e)}try{if(!F||!F.fol)return r;const sh=$("msheet"),who=sh.querySelector(".who"),fo=F.fol;
 const old=sh.querySelector(".fr-addb");if(old)old.remove();
 const d=document.createElement("div");d.className="fol-line";d.innerHTML='<span><b>'+fmtN(fo.n)+'</b> '+plural(fo.n,"подписчик","подписчика","подписчиков")+'</span><span><b>'+fmtN(fo.sub)+'</b> '+plural(fo.sub,"подписка","подписки","подписок")+'</span>'+(fo.t&&fo.t.title?'<em>'+fo.t.ic+' '+escH(fo.t.title)+'</em>':fo.t?'<em>'+fo.t.ic+'</em>':'');
 if(who)who.after(d);if(fo.t&&fo.t.frame)sh.classList.add("fol-frame");
 if(S&&F.uid!==S.uid&&ONLINE){const b=document.createElement("button");b.type="button";b.className="mini2 fol-btn"+(fo.me?" on":"");b.textContent=fo.me?"✅ Вы подписаны":"➕ Подписаться";
  b.onclick=async()=>{if(fo.me){const q=await act("fr_del",{uid:F.uid});if(q){fo.me=false;fo.n=Math.max(0,fo.n-1);b.textContent="➕ Подписаться";b.classList.remove("on");toast("Ты отписался")}}else{const q=await act("fr_add",{uid:F.uid});if(q){fo.me=true;b.textContent="✅ Вы подписаны";b.classList.add("on");toast("👥 Подписка оформлена! Его новости — в твоей ленте")}}};d.after(b)}
 if(S&&F.uid===S.uid&&ONLINE){const w=document.createElement("div");w.className="fol-rw";w.innerHTML='<p class="cln">Загружаю награды за подписчиков…</p>';d.after(w);
  act("fol_info").then(I=>{if(!I)return;w.innerHTML='<h3>🎁 Награды за подписчиков</h3><p class="cln">Считаются живые подписчики — открывшие от '+I.live+' карточек.</p>'+I.tiers.map((x,i)=>'<div class="fol-t'+(x.got?" got":x.ok?" ok":"")+'"><i>'+x.ic+'</i><span><b>'+x.n+' подписчиков</b><small>'+escH(x.t)+'</small></span>'+(x.got?'<em>✅</em>':x.ok?'<button type="button" class="mini2" data-ft="'+i+'">Забрать</button>':'<em>'+Math.min(I.n,x.n)+'/'+x.n+'</em>')+'</div>').join("");
   w.onclick=async e=>{const b=e.target.closest("[data-ft]");if(!b)return;b.disabled=true;const q=await act("fol_claim",{tier:+b.dataset.ft});if(q){try{sfx.fanfare();burst(3)}catch(_){}toast("🎁 "+q.t);act("profile",{uid:S.uid}).then(P=>P&&openShowcase(P))}else b.disabled=false}})}}catch(e){console.error(e)}return r}}
{const _cm=closeModal;closeModal=function(){try{$("msheet").classList.remove("fol-frame")}catch(e){}return _cm.apply(this,arguments)}}
{const _fd=frDraw;frDraw=function(r){const o=_fd.apply(this,arguments);try{const box=$("msheet").querySelector(".frbox");if(!box)return o;const h=box.querySelector("h3");if(h)h.textContent="👥 Друзья и подписки";
 const tabs=document.createElement("div");tabs.className="fol-tabs";tabs.innerHTML='<button type="button" class="mini2" data-fv="feed">📰 Лента подписок</button><button type="button" class="mini2" data-fv="top">🔥 Популярные воины</button>';if(h)h.after(tabs);
 const v=document.createElement("div");v.className="fol-view";tabs.after(v);
 tabs.onclick=async e=>{const b=e.target.closest("[data-fv]");if(!b)return;tabs.querySelectorAll("button").forEach(x=>x.classList.toggle("on",x===b));v.innerHTML='<p class="cln">Загружаю…</p>';
  if(b.dataset.fv==="feed"){const F=await act("fol_feed");if(!F)return;const now=F.now||Date.now(),ago=t=>{const d=(now-t)/6e4;return d<60?Math.max(1,Math.round(d))+" мин":d<1440?Math.round(d/60)+" ч":Math.round(d/1440)+" дн"};
   v.innerHTML=F.list.length?F.list.map(x=>'<div class="fol-ev" data-fu="'+x.uid+'"><b>'+escH(x.name||"Игрок")+'</b> '+escH(x.txt)+'<small>'+ago(x.t)+'</small></div>').join(""):'<p class="cln">Пока пусто. Подпишись на сильных игроков — их выбивания, победы и находки появятся здесь.</p>'}
  else{const T=await act("fol_top");if(!T)return;v.innerHTML=T.list.length?T.list.map((x,i)=>'<div class="fol-ev" data-fu="'+x.uid+'"><b>'+(["🥇","🥈","🥉"][i]||(i+1)+".")+' '+escH(x.name||"Игрок")+'</b> <em>'+fmtN(x.n)+' '+plural(x.n,"подписчик","подписчика","подписчиков")+'</em></div>').join(""):'<p class="cln">Пока ни у кого нет подписчиков — стань первым!</p>'}};
 v.onclick=async e=>{const x=e.target.closest("[data-fu]");if(!x)return;const P=await act("profile",{uid:+x.dataset.fu});if(P)openShowcase(P)}}catch(e){}return o}}

/* 👥 «тебя добавили в друзья» — уведомление в игре, а не в боте */
let frIncT=0;async function frIncCheck(){if(Date.now()-frIncT<600000||!S||!ONLINE||document.hidden||!$("modal").hidden||$("tut")||$("nks")||$("sbg")||$("chg")||$("frinc"))return;
  frIncT=Date.now();let r=null;const _t=toast;toast=()=>{};try{r=await act("fr_list")}catch(e){}finally{toast=_t}if(!r||!r.inc)return;
  let seen=[];try{seen=JSON.parse(localStorage.getItem("we-frinc")||"[]")}catch(e){}const nw=r.inc.filter(x=>!seen.includes(x.uid));
  try{localStorage.setItem("we-frinc",JSON.stringify(r.inc.map(x=>x.uid).concat(seen).slice(0,300)))}catch(e){}if(!nw.length)return;
  const b=document.createElement("div");b.id="frinc";b.innerHTML='<span>👥 <b>'+escH(nw[0].name)+'</b>'+(nw.length>1?' и ещё '+(nw.length-1):'')+' '+(nw.length>1?'добавили':'добавил')+' тебя в друзья</span><button type="button" class="mini2">Ответить</button>';
  document.body.appendChild(b);hap("light");const k=()=>{try{b.remove()}catch(e){}};b.querySelector("button").onclick=()=>{k();frOpen()};b.onclick=e=>{if(e.target===b)k()};setTimeout(k,9000)}
setTimeout(()=>setInterval(()=>{try{frIncCheck()}catch(e){}},20000),5000);

/* 🎁 бонус новичку, пришедшему по рекламной ссылке партнёров */
{let tries=0;const t=setInterval(async()=>{if(++tries>40){clearInterval(t);return}if(!S||!ONLINE)return;clearInterval(t);
  if(S.adb||(S.created&&NOW()-S.created>2*864e5))return;try{if(localStorage.getItem("we-adb"))return}catch(e){}
  let r=null;const _t=toast;toast=()=>{};try{r=await act("ad_bonus")}finally{toast=_t}try{localStorage.setItem("we-adb","1")}catch(e){}
  if(!r||!r.card)return;const go=()=>{if(!$("modal").hidden||$("tut")||$("nks")){setTimeout(go,3000);return}
    const m=$("modal"),sh=$("msheet");m.hidden=false;const H=HEROES[r.card.h];
    sh.innerHTML='<div class="box nickbox"><h3>🎁 Подарок '+escH(r.from||"от друзей")+'!</h3><p>Ты пришёл от наших друзей — держи <b>легендарную карточку «'+escH(H[0])+'»</b> и <b>+'+r.sp+' 🎴 прокруток</b>!</p><button type="button" class="craftbtn" id="adb-go">⚔️ Посмотреть карточку</button></div>';
    sfx.fanfare();burst(6);hapN("success");renderAll();$("adb-go").onclick=()=>{closeModal();openCardView(r.card)}};go()},1500)}
