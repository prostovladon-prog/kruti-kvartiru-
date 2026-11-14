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
  h+='<div class="gem-tabs">'+[["forge","🔨 Выбить"],["up","⬆️ Улучшить"],["put","🃏 Вставить"],["info","❓ Как"]].map(([k,n])=>'<button type="button" data-t="'+k+'" class="'+(GEMV.tab===k?"on":"")+'">'+n+'</button>').join("")+'</div>';
  h+='<div class="gem-sh">'+Object.keys(GEM.el).map(k=>'<div><i>'+gemSVG(k,1,34)+'</i><b>'+(H[k]||0)+'</b><small>сегодня '+(gd[k]||0)+'/'+GEM.cap[k]+'</small></div>').join("")+'</div>';
  if(GEMV.tab==="forge"){h+='<p class="gem-p">Попытка: <b>'+GEM.cost.sh+' осколков</b> + <b>'+fmtC(GEM.cost.cash)+'</b>. Шанс '+Math.round(GEM.cost.ch*100)+'%. При неудаче вернётся '+GEM.cost.back+' осколков. Попыток сегодня: <b>'+(GEM.cost.day-fd)+'/'+GEM.cost.day+'</b></p>';
    h+=Object.keys(GEM.el).map(k=>'<button type="button" class="gem-go" data-k="'+k+'"'+((H[k]||0)<GEM.cost.sh||fd>=GEM.cost.day?" disabled":"")+'><span class="gem-gi">'+gemSVG(k,1,48)+'</span><span>Выбить гем «'+GEM.el[k].n+'»<small>'+gemSrc(k)+'</small></span></button>').join("")}
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
    if(D.rp)h+='<div class="dc-so">🎰 '+escH(H[0])+(D.so?' <b>не продаётся</b> — только выбить в Особом прокруте, всего 1 экземпляр.':' — второй экземпляр выбивается в Особом прокруте.')+' Шанс растёт: <b>1%</b> до '+dcHM(D.until-90*60e3)+', <b>5%</b> до '+dcHM(D.until-30*60e3)+', а с '+dcHM(D.until-30*60e3)+' — <b>100%</b>: кто первый прокрутит, тот и заберёт! Сейчас: <b>'+Math.round((D.ch||0)*100)+'%</b></div>';
    if(!D.so)h+='<button type="button" class="gem-go dc-buy" data-h="'+D.h+'"'+(on&&L.buy?"":" disabled")+'>⭐ Купить «'+escH(H[0])+'» за '+(D.stars||SHOP.daycard.stars)+'<small>достанется тому, кто оплатит первым · с '+dcHM(D.at)+' до '+dcHM(D.until)+'</small></button>'});
  if(!L0.length)h+='<p class="gem-p">Сегодня карты дня нет. Загляни вечером!</p>';
  {const Q=S.dq&&S.dq.d===today(now)?S.dq:{c:{},got:[]};h+='<div class="dq"><b class="dq-h">🎯 Задания за Особые прокруты</b>'+DQ.map((T,i)=>{const v=Math.min(T.n,Q.c[T.k]||0),ok=v>=T.n,got=Q.got.includes(i);return '<div class="dq-r'+(got?' got':'')+'"><i>'+T.ic+'</i><span>'+T.t+'<u><em style="width:'+Math.round(v/T.n*100)+'%"></em></u><small>'+v+' / '+T.n+'</small></span>'+(got?'<b>✅</b>':'<button type="button" class="mini2 dq-c" data-dq="'+i+'"'+(ok?'':' disabled')+'>+1 🎰</button>')+'</div>'}).join("")+
    '<div class="dq-r all'+(Q.all?' got':'')+'"><i>🏆</i><span>Выполни все '+DQ.length+' заданий<small>'+Q.got.length+' / '+DQ.length+'</small></span>'+(Q.all?'<b>✅</b>':'<button type="button" class="mini2 dq-c" data-dq="'+DQ.length+'"'+(Q.got.length>=DQ.length?'':' disabled')+'>+1 🎰</button>')+'</div></div>'}
  {const Q=S.dq&&S.dq.d===today(now)?S.dq:{};h+='<button type="button" class="gem-go dbuy" id="dc-bsp"'+((Q.buy||0)>=DSP_BUY.day?" disabled":"")+'>💰 Купить '+DSP_BUY.n+' Особых прокрута за '+fmtN(DSP_BUY.cash)+' 🪙<small>'+((Q.buy||0)>=DSP_BUY.day?"сегодня уже куплено — завтра снова":"раз в день · у тебя "+fmtN(Math.floor(S.cash||0))+" 🪙")+'</small></button>'}
  h+='<p class="gem-p">Особые прокруты: каждые '+DSP.per+' выполненных задания дня = 1 прокрут (до '+DSP.cap+' в день). Карта выпадает только '+(S.dc?dcHM(S.dc.at)+'–'+dcHM(S.dc.until):'вечером')+', пока второй экземпляр не выбит.</p>';
  sh.innerHTML=h+'</div>';dcDraw(1);$("dc-x").onclick=closeModal;
  sh.querySelectorAll(".dc-buy").forEach(b=>b.onclick=()=>buyItem({item:"daycard",h:+b.dataset.h}));
  if($("dc-bsp"))$("dc-bsp").onclick=async()=>{if(!confirm("Купить "+DSP_BUY.n+" Особых прокрута за "+DSP_BUY.cash.toLocaleString("ru")+" монет?"))return;$("dc-bsp").disabled=true;const r=await act("dsp_buy",{});if(r)toast("🎰 +"+r.dsp+" Особых прокрута!");dcDraw()};
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
{const _dc=drawClan;drawClan=function(){_dc.apply(this,arguments);try{const b=$("clan-body");if(!b||$("sec-clan").hidden||!clData||!clData.clan||b.querySelector(".cw-ban"))return;const d=document.createElement("button");d.type="button";d.className="cw-ban";d.innerHTML='<i>🗺</i><span><b>Война за земли</b><small>Каждый день 20:00–22:00 · захватывай клетки, получай монеты и осколки 🔥</small></span>';d.onclick=e=>{e.stopPropagation();cwOpen()};b.prepend(d)}catch(e){}}}
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
function pollCard(P){const tot=P.tot||0,voted=P.my!=null||P.closed;
  return '<div class="pl-card" data-pid="'+P.id+'"><b class="pl-q">📊 '+escH(P.q)+(P.closed?' <small>(закрыт)</small>':'')+'</b>'+P.opts.map((o,i)=>{const pc=tot?Math.round(P.n[i]/tot*100):0;
    return '<button type="button" class="pl-o'+(P.my===i?' my':'')+(voted?' res':'')+'" data-opt="'+i+'"'+(P.closed?' disabled':'')+'>'+(voted?'<i style="width:'+pc+'%"></i>':'')+'<span>'+escH(o)+'</span>'+(voted?'<em>'+pc+'%</em>':'')+'</button>'}).join("")+
    '<small class="pl-f">'+tot+' '+plural(tot,"голос","голоса","голосов")+(P.my!=null&&!P.closed?' · можно переголосовать':'')+'</small>'+(S.admin?'<div class="pl-adm">'+(P.closed?'':'<button type="button" class="mini2" data-pc="'+P.id+'">Закрыть</button>')+'<button type="button" class="mini2" data-pd="'+P.id+'">Удалить</button></div>':'')+'</div>'}
async function pollLoad(){const r=await act("poll_list",{});if(r){POLLS=r.polls||[];pollDraw()}}
function pollDraw(){const box=$("ch-poll");if(!box)return;const L=POLLS.filter(p=>!p.closed).concat(POLLS.filter(p=>p.closed).slice(0,1));
  box.innerHTML=(S.admin?'<button type="button" class="pl-new" id="pl-new">📊 Создать опрос</button>':'')+L.map(pollCard).join("");
  box.onclick=async e=>{const o=e.target.closest("[data-opt]");if(o&&!o.disabled){const id=+o.closest("[data-pid]").dataset.pid,r=await act("poll_vote",{id,opt:+o.dataset.opt});if(r){POLLS=POLLS.map(p=>p.id===id?r:p);if(S.poll&&S.poll.id===id)S.poll.v=1;try{hap("light")}catch(x){}pollDraw()}return}
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
  const t=n>0?'🎰 КРУТИТЬ ОСОБЫЙ ПРОКРУТ <em>×'+n+'</em>':'🎰 Особые прокруты: выполни задание и выбей карту дня';if(b._t!==t){b._t=t;b.innerHTML=t+'<small>Дракула · Баба Яга — шанс растёт к ночи</small>'}b.classList.toggle("hot",n>0)}
{const _ra=renderAll;renderAll=function(){const r=_ra.apply(this,arguments);try{dspBan()}catch(e){}return r}}
