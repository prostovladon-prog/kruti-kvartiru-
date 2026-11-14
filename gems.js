/* ===== Кузня гемов стихий (клиент) ===== */
const GEMV={tab:"forge",card:null};
function gemName(g){const E=GEM.el[g[0]];return E?E.ic+" "+E.n+" "+g.slice(1)+" ур.":g}
function gemSrc(k){return {e:"🏕 Лагерь: тренировки и оруженосец",f:"🛡 Кланы: удары по боссу",a:"🐉 Дракон: тапы, игры, походы",w:"🎯 Задания и серия дней"}[k]}
function gemOpen(c){if(!S)return;GEMV.card=c||null;GEMV.tab=c?"put":GEMV.tab;const m=$("modal");m.hidden=false;gemDraw()}
function gemDraw(){const sh=$("msheet"),H=S.gsh||{},I=S.gems||{},d=today(Date.now()),fd=S.gfd&&S.gfd.d===d?S.gfd.n:0,gd=S.gsd&&S.gsd.d===d?S.gsd:{};
  let h='<div class="gemw"><div class="gem-h"><b>💎 Кузня гемов</b><button type="button" class="ghost" id="gm-x">✕</button></div>';
  h+='<div class="gem-tabs">'+[["forge","🔨 Выбить"],["up","⬆️ Улучшить"],["put","🃏 Вставить"],["info","❓ Как"]].map(([k,n])=>'<button type="button" data-t="'+k+'" class="'+(GEMV.tab===k?"on":"")+'">'+n+'</button>').join("")+'</div>';
  h+='<div class="gem-sh">'+Object.keys(GEM.el).map(k=>'<div><i>'+GEM.el[k].ic+'</i><b>'+(H[k]||0)+'</b><small>сегодня '+(gd[k]||0)+'/'+GEM.cap[k]+'</small></div>').join("")+'</div>';
  if(GEMV.tab==="forge"){h+='<p class="gem-p">Попытка: <b>'+GEM.cost.sh+' осколков</b> + <b>'+fmtC(GEM.cost.cash)+'</b>. Шанс '+Math.round(GEM.cost.ch*100)+'%. При неудаче вернётся '+GEM.cost.back+' осколков. Попыток сегодня: <b>'+(GEM.cost.day-fd)+'/'+GEM.cost.day+'</b></p>';
    h+=Object.keys(GEM.el).map(k=>'<button type="button" class="gem-go" data-k="'+k+'"'+((H[k]||0)<GEM.cost.sh||fd>=GEM.cost.day?" disabled":"")+'>'+GEM.el[k].ic+' Выбить гем «'+GEM.el[k].n+'»<small>'+gemSrc(k)+'</small></button>').join("")}
  if(GEMV.tab==="up"){const L=Object.keys(I).filter(g=>I[g]>0).sort();h+='<p class="gem-p">3 одинаковых гема → попытка получить гем уровнем выше. При неудаче сгорает 1 гем. Шансы: 50% → 30% → 15% → 5%.</p>';
    h+=L.length?L.map(g=>{const lv=+g.slice(1);return '<div class="gem-row"><span>'+gemName(g)+' ×'+I[g]+'<small>+'+Math.round(GEM.b[lv]*100)+'% к силе</small></span>'+(lv<5?'<button type="button" class="craftbtn gem-up" data-g="'+g+'"'+(I[g]<3?" disabled":"")+'>'+Math.round(GEM.up.ch[lv]*100)+'% · '+fmtC(GEM.up.cash[lv])+'</button>':'<b>МАКС</b>')+'</div>'}).join(""):'<p class="gem-p">Гемов пока нет. Выбей первый во вкладке «Выбить».</p>'}
  if(GEMV.tab==="put"){const L=Object.keys(I).filter(g=>I[g]>0).sort((a,b)=>b.slice(1)-a.slice(1)),SK=S.gsock||{};
    const cs=S.cards.filter(c=>gemSlots(c)>0).sort((a,b)=>(GEMV.card&&b.id===GEMV.card.id)-(GEMV.card&&a.id===GEMV.card.id)||cardPow(b)-cardPow(a)).slice(0,40);
    h+='<p class="gem-p">Гемы вставляются в эпик и выше (1 слот), в мифик и ошибку печати — 2 слота. Вынуть гем: '+fmtC(GEM.pull.cash)+', шанс '+Math.round(GEM.pull.brk*100)+'% что разобьётся.</p>';
    h+=cs.length?cs.map(c=>{const g=SK[c.id]||[],n=gemSlots(c);let r='<div class="gem-card"><div class="gem-cn"><b>'+escH(HEROES[c.h][0])+'</b><small>'+(FIN[c.f]?FIN[c.f].k:"")+' · сила '+fmt(cardPow({...c,gm:g}))+'</small></div><div class="gem-slots">';
      for(let i=0;i<n;i++)r+=g[i]?'<button type="button" class="gem-s full" data-pull="'+c.id+'" data-i="'+i+'">'+GEM.el[g[i][0]].ic+'<small>'+g[i].slice(1)+'</small></button>':(L.length?'<select class="gem-s" data-put="'+c.id+'"><option value="">＋</option>'+L.map(x=>'<option value="'+x+'">'+gemName(x)+'</option>').join("")+'</select>':'<span class="gem-s">＋</span>');
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
{const _act=act;act=async function(n,p){const r=await _act(n,p);if(r&&r.dsp)setTimeout(()=>toast("🌙 +1 Особый прокрут! Крути в «Карте дня»"),900);return r}}
function dcT(ms){ms=Math.max(0,ms);const h=Math.floor(ms/36e5),m=Math.floor(ms%36e5/6e4),s=Math.floor(ms%6e4/1e3);return (h?h+"ч ":"")+m+"м "+(h?"":s+"с")}
let dcTmr=null;
function dcOpen(){if(!S)return;$("modal").hidden=false;dcDraw();clearInterval(dcTmr);dcTmr=setInterval(()=>{if($("modal").hidden||!$("dc-t")){clearInterval(dcTmr);return}dcDraw(1)},1000)}
function dcDraw(tick){const sh=$("msheet"),D=S.dc,now=Date.now();
  if(tick&&D&&$("dc-t")){$("dc-t").textContent=now<D.at?"старт через "+dcT(D.at-now):now<D.until?"осталось "+dcT(D.until-now):"завершено";return}
  let h='<div class="gemw"><div class="gem-h"><b>🌙 Карта дня</b><button type="button" class="ghost" id="dc-x">✕</button></div>';
  if(D&&HEROES[D.h]){const H=HEROES[D.h],on=now>=D.at&&now<D.until,L=D.left||{buy:0,spin:0};
    h+='<div class="dc-card"><div class="dc-pt">'+portrait(D.h,null)+'</div><div><b class="dc-n">'+escH(H[0])+'</b><small>'+escH(H[1])+' · Ошибка печати</small><p>'+escH(H[3])+'</p><span class="dc-t" id="dc-t"></span></div></div>';
    h+='<div class="dc-left"><div class="'+(L.buy?"":"off")+'">⭐ За звёзды<b>'+(L.buy?"1 из 1":"продано")+'</b></div><div class="'+(L.spin?"":"off")+'">🎰 Из прокрута<b>'+(L.spin?"1 из 1":"выбита")+'</b></div></div>';
    h+='<button type="button" class="gem-go" id="dc-buy"'+(on&&L.buy?"":" disabled")+'>⭐ Купить за '+SHOP.daycard.stars+'<small>достанется тому, кто оплатит первым · с '+dcHM(D.at)+' до '+dcHM(D.until)+'</small></button>';
    h+='<button type="button" class="gem-go dsp" id="dc-sp"'+((S.dsp||0)>0?"":" disabled")+'>🎰 Особый прокрут ×'+(S.dsp||0)+'<small>шанс выбить карту '+(DSP.ch*100).toFixed(1)+'% · иначе осколки, монеты, прокрутки или гем</small></button>';
  }else h+='<p class="gem-p">Сегодня карты дня нет. Загляни в 19:00!</p><button type="button" class="gem-go dsp" id="dc-sp"'+((S.dsp||0)>0?"":" disabled")+'>🎰 Особый прокрут ×'+(S.dsp||0)+'</button>';
  h+='<p class="gem-p">Особые прокруты: каждые '+DSP.per+' выполненных задания дня = 1 прокрут (до '+DSP.cap+' в день). Карта выпадает только '+(S.dc?dcHM(S.dc.at)+'–'+dcHM(S.dc.until):'с 19:00 до 23:00')+', пока второй экземпляр не выбит.</p>';
  sh.innerHTML=h+'</div>';dcDraw(1);$("dc-x").onclick=closeModal;
  if($("dc-buy"))$("dc-buy").onclick=()=>buyItem({item:"daycard"});
  $("dc-sp").onclick=async()=>{$("dc-sp").disabled=true;const r=await act("dsp_roll",{});if(r){if(r.win)toast("🌙🔥 НЕВЕРОЯТНО! Ты выбил Карту дня!");else if(r.sh)toast("+"+r.sh[1]+" "+GEM.el[r.sh[0]].ic+" осколков");else if(r.cash)toast("+"+fmt(r.cash)+" 🪙");else if(r.sp)toast("+"+r.sp+" прокрутки");else if(r.gem)toast("💎 Гем: "+gemName(r.gem))}dcDraw()};}
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
  const m=$("modal"),sh=$("msheet");m.hidden=false;sh.innerHTML='<div class="chx" style="--g:'+col+'"><div class="chx-rays"></div><div class="chx-box"><div class="chx-lid"></div><div class="chx-body"></div><div class="chx-lock"></div></div><p>Нажми, чтобы открыть!</p></div>';
  let done=false;const go=()=>{if(done)return;done=true;const x=sh.querySelector(".chx");x.classList.add("open");try{hap&&hap("heavy");sfx.coin()}catch(e){}setTimeout(()=>{try{burst(best>=3?3:1)}catch(e){}_sg(R,title)},650)};
  sh.querySelector(".chx").onclick=go;setTimeout(go,2200)}}
/* ===== Гемы в окне карточки + анимация вставки ===== */
{const _ocv=openCardView;openCardView=function(c,o){_ocv(c,o);try{if(!o||!o.mine||!S)return;const n=gemSlots(c);if(!n)return;const sh=$("msheet"),info=sh.querySelector(".cv-info");if(!info||sh.querySelector(".gem-cv"))return;
  const g=(S.gsock||{})[c.id]||[],d=document.createElement("div");d.className="gem-cv";let h='<b>💎 Гемы</b><div class="gem-slots">';
  for(let i=0;i<n;i++)h+=g[i]?'<span class="gem-s full el-'+g[i][0]+'">'+GEM.el[g[i][0]].ic+'<small>'+g[i].slice(1)+'</small></span>':'<span class="gem-s">＋</span>';
  h+='</div><small>'+(g.length?'Сила +'+Math.round((gemMul({gm:g})-1)*100)+'%':'Пустые слоты: вставь гем, чтобы усилить карту')+'</small><button type="button" class="mini2" id="gem-cv-go">'+(g.length<n?'Вставить гем':'Управлять')+'</button>';
  d.innerHTML=h;info.after(d);$("gem-cv-go").onclick=()=>gemOpen(S.cards.find(x=>x.id===c.id)||c)}catch(e){console.error(e)}}}
function gemFly(id){const el=document.querySelector('[data-pull="'+id+'"]')||document.querySelector('.gem-card');if(!el)return;const r=el.getBoundingClientRect(),f=document.createElement("div");f.className="gem-fly";f.style.left=r.left+r.width/2+"px";f.style.top=r.top+r.height/2+"px";f.textContent="💎";document.body.appendChild(f);setTimeout(()=>f.remove(),1100)}
{const _gd=gemDraw;gemDraw=function(){_gd.apply(this,arguments);document.querySelectorAll("select[data-put]").forEach(x=>x.onchange=async()=>{if(!x.value)return;const id=+x.dataset.put||x.dataset.put,r=await act("gem_put",{id,g:x.value});if(r){try{hap&&hap("heavy");sfx.coin()}catch(e){}toast("💎 Гем вставлен! Карта стала сильнее")}gemDraw();if(r)setTimeout(()=>{const b=document.querySelectorAll('[data-pull="'+id+'"]');const e=b[b.length-1];if(e){e.classList.add("gem-in");gemFly(id)}},30)})}}
