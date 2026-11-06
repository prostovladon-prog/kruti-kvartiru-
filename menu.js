/* ===================== Меню «Ещё»: шторка со всеми разделами + быстрые плитки на главной =====================
   Нижняя панель: Крутить · Карты · Бой · Дракон · Рынок · Ещё. Всё остальное — в шторке. */
/* ---------- разовые окна: «уже видел» хранится и в аккаунте, а не только в браузере — чтобы не показывать снова на другом устройстве или после очистки Telegram ---------- */
{const SYNC=k=>/^we-(don1|big-|dgann1)/.test(k),gi=Storage.prototype.getItem,si=Storage.prototype.setItem,sent=new Set();
  Storage.prototype.getItem=function(k){const v=gi.call(this,k);if(v==null&&SYNC(k)&&typeof S!=="undefined"&&S&&(S.seen||[]).includes(k))return "1";return v};
  Storage.prototype.setItem=function(k,v){si.call(this,k,v);if(SYNC(k)&&!sent.has(k)&&typeof S!=="undefined"&&S&&ONLINE&&!(S.seen||[]).includes(k)){sent.add(k);(S.seen=S.seen||[]).push(k);try{act("seen",{k})}catch(e){}}}}
const MENU_GROUPS=[
 ["Главное",[
  {k:"gold",ic:"🏪",n:"Сокровищница",c:["#ffe066","#ff9f0a"]},
  {k:"cas",ic:"🎰",n:"Казино",c:["#ff7ad9","#9b2cf0"]},
  {k:"prof",ic:"👤",n:"Профиль",c:["#7cc8ff","#2a4fd0"]},
  {k:"pass",ic:"🎖",n:"Пропуск",c:["#ffd27a","#c0502a"]},
  {k:"don",ic:"⭐",n:"Донат и понт",c:["#ffe9a8","#d06a00"]}]],
 ["Каждый день",[
  {k:"quest",ic:"🎯",n:"Задания",c:["#7ee89a","#1e8a4a"]},
  {k:"wheel",ic:"🎡",n:"Колесо",c:["#ffb84d","#d0302a"]},
  {k:"camp",ic:"🏕",n:"Лагерь",c:["#c9e86b","#4a7a1e"]},
  {k:"chat",ic:"💬",n:"Чат",c:["#9fe0ff","#1f6fd0"]},
  {k:"dm",ic:"✉️",n:"Сообщения",c:["#ffd0f0","#c03a8a"]},
  {k:"promo",ic:"🎟",n:"Промокод",c:["#c8ffe0","#1a9a6a"]},
  {k:"riddle",ic:"🧩",n:"Загадка серии",c:["#e3c8ff","#6a2ad0"]},
  {k:"vote",ic:"⚔️",n:"Выбор серии",c:["#ffd0c0","#d03a1a"]}]],
 ["Сражения",[
  {k:"conq",ic:"🗺",n:"Завоевание",c:["#ffcf5a","#8a4a10"]},
  {k:"clan",ic:"🛡",n:"Клан",c:["#b9a2ff","#4b2a9a"]},
  {k:"top",ic:"🏆",n:"Топ",c:["#fff1a8","#c08a0a"]},
  {k:"duel",ic:"⚔️",n:"Арена",c:["#ff8a8a","#9a1a1a"]}]],
 ["Коллекция",[
  {k:"album",ic:"📖",n:"Альбом",c:["#a8e0ff","#2a6ab0"]},
  {k:"craft",ic:"⚒",n:"Крафт",c:["#d0d6e0","#5a6478"]},
  {k:"trade",ic:"🔄",n:"Обмены",c:["#9ff7d6","#1a8a7a"]},
  {k:"odds",ic:"🎲",n:"Шансы",c:["#e0c8ff","#6a3ab0"]}]]];
function menuGo(k){menuClose();hap&&hap("light");
  if(k==="gold")return openGold();
  if(k==="don")return openGold("flex");
  if(k==="promo")return promoOpen();
  if(k==="riddle")return rdOpen();
  if(k==="vote")return vtOpen();
  if(k==="cas"){if(typeof openCas==="function"&&ONLINE)openCas();else setTab("cas");return}
  if(k==="prof"||k==="pass"||k==="conq"||k==="clan"||k==="camp")return goSub(k);
  if(k==="chat")return openChat();
  if(k==="trade"){setTab("col");if(typeof trInbox==="function")setTimeout(trInbox,50);return}
  if(k==="wheel"){setTab("quest");setTimeout(()=>{const e=$("wf-box");if(e)e.scrollIntoView({block:"start"})},60);return}
  if(k==="duel")return goSub("duel");
  if(k==="ads")return adOpen();
  if(k==="contest"){setTab("spin");setTimeout(()=>{const e=$("chal");if(e&&!e.hidden)e.scrollIntoView({block:"start"})},60);return}
  setTab(k)}
/* что ждёт игрока: красные точки на плитках и на кнопке «Ещё» */
function menuBadges(){const b={};if(!S)return b;const now=NOW();
  try{const D=day(S,now);const tk=TASKS.filter((T,i)=>Math.min(D[T.k],T.n)>=T.n&&!D.got.includes(i)).length;const stc=S.streak&&!S.streak.claimed?1:0;if(tk+stc)b.quest=tk+stc}catch(e){}
  try{if(S.wheelDay!==today(now))b.wheel="!"}catch(e){}
  try{const V=campView();if(V.en>=V.mx*.99||V.sq>=campSqRate(V.C)*SQ_HOURS*.99&&V.C.lv.sq)b.camp="!"}catch(e){}
  try{const V=passView();if(V.can)b.pass=V.can}catch(e){}
  try{const n=chatUnread();if(n)b.chat=n>99?"99+":n}catch(e){}
  try{if(S.trIn)b.trade=S.trIn}catch(e){}
  return b}
function menuOpen(){let d=$("drw");if(!d){d=document.createElement("div");d.id="drw";d.className="drw";d.innerHTML='<div class="drw-bg"></div><div class="drw-sh" role="dialog" aria-label="Все разделы"><div class="drw-grab"></div><div class="drw-h"><b>Все разделы</b><button type="button" class="drw-x" aria-label="Закрыть">✕</button></div><div class="drw-b"></div></div>';document.body.appendChild(d);
    d.querySelector(".drw-bg").onclick=menuClose;d.querySelector(".drw-x").onclick=menuClose;
    d.querySelector(".drw-b").onclick=e=>{const t=e.target.closest("[data-go]");if(t)menuGo(t.dataset.go)};
    const sh=d.querySelector(".drw-sh");let y0=null,dy=0;sh.addEventListener("touchstart",e=>{if(sh.scrollTop>0)return;y0=e.touches[0].clientY;dy=0},{passive:true});
    sh.addEventListener("touchmove",e=>{if(y0==null)return;dy=Math.max(0,e.touches[0].clientY-y0);sh.style.transform="translateY("+dy+"px)"},{passive:true});
    sh.addEventListener("touchend",()=>{if(y0==null)return;y0=null;sh.style.transform="";if(dy>90)menuClose()})}
  const B=menuBadges(),on=!ONLINE||!!(S&&S.shopOn);let h="";
  if(S&&typeof chData!=="undefined"&&chData&&$("chal")&&!$("chal").hidden)h+='<button type="button" class="drw-ban" data-go="contest"><i>🏆</i><span><b>Идёт конкурс!</b><small>Участвуй и забирай призы</small></span><em>›</em></button>';
  if(S&&S.admin)h+='<button type="button" class="drw-ban adm" data-go="stars"><i>⭐</i><span><b>Звёзды игрокам</b><small>Начислить звёзды на игровой баланс и написать игроку</small></span><em>›</em></button>';
  if(S&&S.admin)h+='<button type="button" class="drw-ban adm" data-go="ads"><i>📈</i><span><b>Реклама: ссылки и статистика</b><small>Переходы → Старт → зашли в игру → играют</small></span><em>›</em></button>';
  MENU_GROUPS.forEach(([g,L])=>{const items=L.filter(it=>it.k!=="gold"||on);if(!items.length)return;h+='<div class="drw-g">'+g+'</div><div class="drw-t">'+items.map(it=>'<button type="button" class="drw-i" data-go="'+it.k+'" style="--a:'+it.c[0]+';--b:'+it.c[1]+'"><i>'+it.ic+'</i><span>'+it.n+'</span>'+(B[it.k]?'<em>'+B[it.k]+'</em>':it.k==="gold"&&S&&!S.newbie?'<em class="sale">−50%</em>':'')+'</button>').join("")+'</div>'});
  d.querySelector(".drw-b").innerHTML=h;d.hidden=false;document.body.classList.add("drw-on");requestAnimationFrame(()=>d.classList.add("on"));$("tab-more").setAttribute("aria-expanded","true")}
function menuClose(){const d=$("drw");if(!d||!d.classList.contains("on"))return;d.classList.remove("on");document.body.classList.remove("drw-on");$("tab-more").setAttribute("aria-expanded","false");setTimeout(()=>{if(!d.classList.contains("on"))d.hidden=true},260)}
$("tab-more").onclick=()=>{const d=$("drw");if(d&&d.classList.contains("on"))menuClose();else menuOpen()};
$("tab-dragon").onclick=()=>{menuClose();setTab("dragon")};
["tab-spin","tab-cards","tab-fight","tab-shop"].forEach(id=>$(id).addEventListener("click",menuClose));
/* быстрые плитки на главной вместо длинной ленты */
function qTiles(){const el=$("qtiles");if(!el||!S)return;const B=menuBadges();let pv=null;try{pv=passView()}catch(e){}
  const D=day(S,NOW()),td=TASKS.filter((T,i)=>D.got.includes(i)).length;
  const dg=typeof dgTile==="function"?dgTile():{ic:"🥚",n:"Тайное яйцо",s:"Что внутри?.."};
  const T=[
   {k:"quest",ic:"🎯",n:"Задания и бонусы",s:B.quest?"🎁 можно забрать: "+B.quest:"выполнено "+td+" из "+TASKS.length,dot:B.quest,c:["#1e8a4a","#7ee89a"]},
   {k:"wheel",ic:"🎡",n:"Колесо фортуны",s:B.wheel?"крутить бесплатно!":"снова завтра",dot:B.wheel,c:["#d0302a","#ffb84d"]},
   {k:"pass",ic:pv?pv.T.ic:"🎖",n:pv?"Пропуск · ур. "+pv.lv:"Пропуск",s:B.pass?"🎁 награды ждут: "+B.pass:pv?"задания дня: "+pv.qs.filter(q=>q.done).length+"/"+pv.qs.length:"",dot:B.pass,c:["#8a3a08","#ffd27a"]},
   {k:"dragon",ic:dg.ic,n:dg.n,s:dg.s,dot:dg.dot,c:dg.c||["#3a1a6a","#bf5af2"],cls:dg.cls}];
  const k=JSON.stringify(T);if(el.dataset.k===k)return;el.dataset.k=k;
  el.innerHTML=T.map(t=>'<button type="button" class="qt'+(t.cls?" "+t.cls:"")+'" data-q="'+t.k+'" style="--a:'+t.c[0]+';--b:'+t.c[1]+'"><i>'+t.ic+'</i><span><b>'+t.n+'</b><small>'+t.s+'</small></span>'+(t.dot?'<em></em>':'')+'</button>').join("")}
$("qtiles").onclick=e=>{const b=e.target.closest("[data-q]");if(!b)return;const k=b.dataset.q;if(k==="dragon")return setTab("dragon");menuGo(k)};
function moreDot(){const B=menuBadges(),n=Object.keys(B).filter(k=>k!=="chat").length;const d=$("more-dot");if(d)d.hidden=!n}
{const _ra=renderAll;renderAll=function(){_ra.apply(this,arguments);try{qTiles();moreDot()}catch(e){}}}
setInterval(()=>{try{if(S&&!$("sec-spin").hidden)qTiles();moreDot()}catch(e){}},5000);
setInterval(()=>{try{if(S&&!$("sec-quest").hidden)renderWheel()}catch(e){}},1000);
try{qTiles();moreDot()}catch(e){}

/* ===================== 📈 Реклама (только админ): свои ссылки и воронка ===================== */
let adData=null,adBusy=false;
const adPct=(a,b)=>b?Math.round(a/b*100)+"%":"—";
async function adOpen(){if(!S||!S.admin)return;const m=$("modal"),sh=$("msheet");m.hidden=false;sh.innerHTML='<div class="box nickbox adbox"><h3>📈 Рекламные ссылки</h3><p class="cln">Загружаю…</p></div>';
  const r=await act("ad_list");if(!r){closeModal();return}adData=r;adDraw()}
function adDraw(){const sh=$("msheet");if(!sh||!adData)return;const L=adData.links.filter(x=>!x.hidden),H=adData.links.filter(x=>x.hidden);
  const link=x=>(API_URL||"").replace(/\/$/,"")+"/go/"+x.code;
  const step=(v,l,base,cls)=>'<div class="adst'+(cls?" "+cls:"")+'"><b>'+fmtN(v)+'</b><span>'+l+'</span>'+(base!=null?'<em>'+adPct(v,base)+'</em>':'')+'</div>';
  const card=x=>{const mx=Math.max(1,...x.days.map(d=>Math.max(d.c,d.s)));
    return '<div class="adc"><div class="adh"><b>'+escH(x.name)+'</b><small>метка '+x.code+' · с '+new Date(x.created+3*3600e3).toISOString().slice(8,10)+'.'+new Date(x.created+3*3600e3).toISOString().slice(5,7)+'</small></div>'+
     '<div class="adl"><input readonly value="'+link(x)+'"><button type="button" class="mini2" data-cp="'+link(x)+'">Копировать</button></div>'+
     '<div class="adf">'+step(x.clicks,"перешли по ссылке",null)+step(x.starts,"нажали «Старт» в боте",x.clicks)+step(x.startsNew,"из них новые",x.starts)+step(x.opened,"зашли в игру",x.startsNew)+step(x.sp5,"сделали 5+ прокруток",x.opened)+step(x.back,"вернулись на 2-й день",x.opened)+step(x.stars,"⭐ потратили ("+x.payers+" чел.)",null,"gold")+'</div>'+
     '<div class="adt">Сегодня: переходов <b>'+x.clicksToday+'</b> · «Старт» <b>'+x.startsToday+'</b> · новых <b>'+x.newToday+'</b> · уникальных переходов всего '+x.uniq+'</div>'+
     '<div class="add">'+x.days.map(d=>'<div><i style="height:'+Math.round(d.c/mx*46)+'px" title="переходы"></i><u style="height:'+Math.round(d.s/mx*46)+'px" title="старт"></u><small>'+d.d.slice(8,10)+'</small></div>').join("")+'</div>'+
     '<div class="adb"><button type="button" class="ghost" data-cp="'+x.direct+'">Прямая ссылка (без счёта переходов)</button><button type="button" class="ghost" data-hide="'+x.code+'">Скрыть</button></div></div>'};
  sh.innerHTML='<div class="box nickbox adbox"><h3>📈 Рекламные ссылки</h3><p class="cln">Создай ссылку на каждую рекламу. Человек жмёт ссылку → она считает переход и открывает бота → бот считает «Старт» → дальше видно, кто зашёл в игру, играет и донатит.</p>'+
   '<div class="adn"><input id="ad-name" maxlength="40" placeholder="Название, например: TikTok яйцо"><button type="button" class="craftbtn" id="ad-new">➕ Создать ссылку</button></div>'+
   (L.length?L.map(card).join(""):'<p class="cln">Ссылок пока нет — создай первую.</p>')+
   (H.length?'<details class="adhid"><summary>Скрытые ('+H.length+')</summary>'+H.map(x=>'<div class="adr"><span>'+escH(x.name)+' · переходов '+x.clicks+' · старт '+x.starts+' · в игре '+x.opened+'</span><button type="button" class="mini2" data-show="'+x.code+'">Вернуть</button></div>').join("")+'</details>':'')+
   '<div class="adb"><button type="button" class="ghost" id="ad-re">🔄 Обновить</button><button type="button" class="ghost" id="ad-x">Закрыть</button></div></div>';
  $("ad-x").onclick=closeModal;$("ad-re").onclick=adOpen;
  $("ad-new").onclick=async()=>{if(adBusy)return;const n=$("ad-name").value.trim();if(!n){toast("Напиши название рекламы");return}adBusy=true;const r=await act("ad_create",{name:n});adBusy=false;if(!r)return;toast("✅ Ссылка создана");await adOpen();const x=adData.links.find(l=>l.code===r.code);if(x)adCopy(link(x))};
  sh.querySelectorAll("[data-cp]").forEach(b=>b.onclick=()=>adCopy(b.dataset.cp));
  sh.querySelectorAll("[data-hide]").forEach(b=>b.onclick=async()=>{await act("ad_hide",{code:b.dataset.hide,hidden:1});adOpen()});
  sh.querySelectorAll("[data-show]").forEach(b=>b.onclick=async()=>{await act("ad_hide",{code:b.dataset.show,hidden:0});adOpen()})}
function adCopy(t){try{navigator.clipboard.writeText(t).then(()=>toast("📋 Скопировано: "+t),()=>adCopyOld(t))}catch(e){adCopyOld(t)}}
function adCopyOld(t){const i=document.createElement("textarea");i.value=t;document.body.appendChild(i);i.select();try{document.execCommand("copy");toast("📋 Скопировано: "+t)}catch(e){toast(t)}i.remove()}
/* ===================== 👑 Розыгрыш 3 VIP: блок, полоска на всех экранах и плитка на главной ===================== */
const cDM=t=>{const d=new Date(t+3*3600e3);return String(d.getUTCDate()).padStart(2,"0")+"."+String(d.getUTCMonth()+1).padStart(2,"0")+" в "+d.toISOString().slice(11,16)};
{const _dc2=drawChal;drawChal=function(){_dc2();try{const C=chData;if(!C||!C.vip)return;const T=C.tickets||0,M=C.me,inn=M.n>=C.min;
  $("chal").querySelector(".chal-h span").textContent="👑 РОЗЫГРЫШ 3 VIP";$("chal").classList.add("vipc");
  $("chal-t").textContent=C.phase==="soon"?"Скоро старт! Пригласи "+C.min+" друзей — и ты в розыгрыше трёх VIP на месяц.":"Пригласи "+C.min+" друзей — и ты участник. Каждый друг = 1 билет: чем больше друзей, тем больше шанс. "+cDM(C.end)+" бот выберет трёх победителей — каждому VIP на месяц, выдаётся автоматически.";
  $("chal-p").innerHTML='<div>👑<b>3 VIP</b>на месяц</div><div>🎟<b>'+T+'</b>'+plural(T,"билет","билета","билетов")+'</div><div>👥<b>'+(C.players||0)+'</b>'+plural(C.players||0,"участник","участника","участников")+'</div>';
  const sm=$("chal-me").querySelector("small");if(sm)sm.textContent="твои друзья: "+M.d+(inn?" · каждый новый друг = +1 билет":" · нужно "+C.min);
  $("chal-rules").textContent="Считаются новые игроки, которые пришли по твоей ссылке с начала розыгрыша и до "+cDM(C.end)+" и открыли хотя бы "+C.need+" карточки. От "+C.min+" друзей ты участник, каждый друг — 1 билет. В конце бот случайно выбирает трёх разных победителей: чем больше билетов, тем выше шанс. Приз — VIP Золото на "+(C.vipDays||30)+" дней: 16 прокруток каждые 4 часа, +3 обмена рун, 360 мест для карточек и корона у ника. VIP включается победителям сам, сразу после итогов. Время — минское. Накрутка ботами и пустыми аккаунтами = снятие с розыгрыша."}catch(e){console.error(e)}}}
function cOn(){return chData&&(chData.lot||chData.gift)&&chData.phase==="on"}
function cLeft(){return chData?Math.max(0,chData.left-(NOW()-chData._t)):0}
function cGo(){menuClose();setTab("spin");setTimeout(()=>{const e=$("chal");if(e&&!e.hidden)e.scrollIntoView({behavior:"smooth",block:"start"})},80)}
/* полоска под шапкой — видна на любом экране, пока идёт розыгрыш */
{const hd=document.querySelector("header");if(hd&&!$("cstrip")){const b=document.createElement("button");b.type="button";b.id="cstrip";b.className="cstrip";b.hidden=true;hd.after(b);b.onclick=()=>{hap("light");cGo()}}}
function cStrip(){const b=$("cstrip");if(!b)return;const on=cOn();b.hidden=!on;if(!on)return;const C=chData;
  if(C.gift){const fd=C.frOk>=C.fr;b.innerHTML='<i>🐉</i><span><b>Розыгрыш NFT-подарка</b><small>'+(C.me&&fd?"✅ ты участвуешь":(fd?"✅ друзья есть":"друзья "+C.frOk+"/"+C.fr)+" · "+(C.me?"✅ история":"📸 выложи историю"))+'</small></span><em>'+tleft(cLeft())+'</em>';return}
  const M=C.me,inn=M.n>=C.min;
  b.innerHTML='<i>'+(C.vip?"👑":C.chest?"💎":"🎟")+'</i><span><b>'+(C.vip?"Розыгрыш 3 VIP на месяц":C.chest?"Розыгрыш сундуков · $70":"Розыгрыш "+C.prizes[0])+'</b><small>'+(inn?"🎟 у тебя "+M.n+" "+plural(M.n,"билет","билета","билетов"):C.min===1?"позови друга — получи билет":"пригласи "+C.min+" "+plural(C.min,"друга","друзей","друзей")+" — и ты в игре ("+M.n+"/"+C.min+")")+'</small></span><em>'+tleft(cLeft())+'</em>'}
setInterval(()=>{try{cStrip()}catch(e){}},1000);
{const _dch=drawChal;drawChal=function(){_dch();try{cStrip();qTiles()}catch(e){}}}
/* большая плитка розыгрыша на главной */
{const _qt=qTiles;qTiles=function(){_qt();const el=$("qtiles");if(!el)return;let w=$("qt-c");if(!cOn()){if(w)w.remove();return}
  if(!w){w=document.createElement("button");w.type="button";w.id="qt-c";w.className="qt qtc";w.onclick=cGo}
  if(el.firstChild!==w)el.prepend(w);const C=chData,M=C.me;
  if(C.gift){w.innerHTML='<i>🐉</i><span><b>Разыгрываем NFT-подарок!</b><small>«Дракончик» с ошибкой печати · пригласи '+C.fr+' друзей + история · итоги '+cDM(C.end)+'</small></span><em></em>';return}w.innerHTML='<i>'+(C.vip?"👑":"🎟")+'</i><span><b>'+(C.vip?"Разыгрываем 3 VIP на месяц!":"Розыгрыш "+C.prizes[0])+'</b><small>'+(M.n>=C.min?"ты участвуешь · билетов: "+M.n:"пригласи "+C.min+" друзей · у тебя "+M.n)+' · итоги '+cDM(C.end)+'</small></span><em></em>'}}
/* ---------- обязательная подписка на канал: через пару минут в игре окно не закрыть, пока не подпишется ---------- */
const SUBP_K="we-subpop",SUBP_GAP=12*36e5,SUBP_AFTER=80e3,subpT0=Date.now();
function subpLS(v){try{if(v===undefined)return +localStorage.getItem(SUBP_K)||0;localStorage.setItem(SUBP_K,String(v))}catch(e){return 0}}
let subpCool=0;
function subpCan(){return typeof S!=="undefined"&&S&&ONLINE&&!S.subGot2&&$("modal").hidden&&!document.querySelector(".onb")&&Date.now()-subpLS()>subpCool}
function subpBack(min){subpLS(Date.now());subpCool=min*60e3;closeModal()}
function openSubPop(){const m=$("modal"),sh=$("msheet");m.hidden=false;let st=0,busy=false;
  sh.innerHTML='<div class="box subpop" id="subpop"><div class="sp-ic"><svg viewBox="0 0 24 24"><path d="M21.5 4.3 2.9 11.5c-1.1.4-1.1 1.1-.2 1.4l4.7 1.5 1.8 5.6c.2.6.4.8.8.8.4 0 .6-.2.9-.5l2.3-2.2 4.8 3.5c.9.5 1.5.2 1.7-.8l3.1-14.7c.3-1.3-.5-1.9-1.3-1.5z" fill="#fff"/></svg></div>'+
  '<h3>Подпишись на канал, чтобы играть дальше</h3><p class="sp-ch">@'+CHANNEL+'</p>'+
  '<ul><li>🔥 Новые карточки и обновления первым</li><li>👑 Розыгрыши VIP и призов</li><li>🎁 Промокоды и бонусы только для подписчиков</li></ul>'+
  '<div class="sp-rw">🎰 <b>+10 прокруток</b> за подписку</div>'+
  '<button type="button" class="craftbtn" id="sp-go">📢 Подписаться</button>'+
  '<button type="button" class="mini2 sp-chk" id="sp-chk">✅ Проверить подписку</button><p class="sp-t" id="sp-t"></p>'+
  '<button type="button" class="ghost sp-back" id="sp-back" hidden>← Назад в игру</button></div>';
  const go=$("sp-go"),ck=$("sp-chk"),t=$("sp-t"),bk=$("sp-back");
  bk.onclick=()=>{hap("light");subpBack(3)};
  const done=(msg)=>{sfx.coin();hapN("success");burst(2);closeModal();renderAll();toast(msg)};
  const check=async(auto)=>{if(busy||!$("subpop"))return;busy=true;ck.disabled=true;t.textContent="Проверяю…";
    let err="";const _t=toast;toast=m=>{err=String(m||"");if(!auto)_t(m)};let r=null;try{r=await act("sub_check")}finally{toast=_t}
    busy=false;if(!$("subpop"))return;ck.disabled=false;
    if(r){done("Спасибо за подписку! +10 прокруток 🎰");return}
    if(/уже получена/.test(err)){S.subGot2=1;closeModal();renderAll();toast("Подписка подтверждена ✅");return}
    if(/Не получилось проверить|Нет связи|перегружен/.test(err)){t.textContent="Telegram не ответил. Можно вернуться в игру, проверим позже";bk.hidden=false;return}
    if(auto){t.textContent="Подписался? Нажми «Проверить подписку»";return}
    t.textContent=st?"Подписки пока не видно. Подпишись на канал и нажми «Проверить» ещё раз":"Сначала нажми «Подписаться»";if(st)bk.hidden=false};
  go.onclick=()=>{hap("light");const u="https://t.me/"+CHANNEL;if(tg&&tg.openTelegramLink)tg.openTelegramLink(u);else window.open(u,"_blank");st=1;subStep=1;ck.classList.add("on");bk.hidden=false;t.textContent="Подписался? Вернись и нажми «Проверить подписку»"};
  ck.onclick=()=>check(false);
  /* вернулся из канала — проверяем сами */
  const back=()=>{if(st&&$("subpop")&&document.visibilityState!=="hidden")setTimeout(()=>check(true),700)};
  document.addEventListener("visibilitychange",back);try{tg&&tg.onEvent&&tg.onEvent("activated",back)}catch(e){}
}
setInterval(()=>{if(Date.now()-subpT0>SUBP_AFTER&&subpCan())openSubPop()},10e3);
/* ===================== ✉️ Личные сообщения: игрок ↔ игрок, администрация → игрок ===================== */
let dmPeerId=0,dmItems=[],dmTimer=0,dmInfo=null;
function dmTime(t){const d=new Date(t),n=new Date();return d.toDateString()===n.toDateString()?d.toLocaleTimeString("ru-RU",{hour:"2-digit",minute:"2-digit"}):d.toLocaleDateString("ru-RU",{day:"numeric",month:"short"})}
function dmStop(){dmPeerId=0;clearInterval(dmTimer)}
async function dmOpen(){if(!ONLINE){toast("Сообщения работают в игре через бота");return}dmStop();const m=$("modal"),sh=$("msheet");m.hidden=false;
  sh.innerHTML='<div class="box dmbox"><div class="dmtop"><b>✉️ Сообщения</b><button type="button" class="x" id="dm-x">Закрыть</button></div><div class="dml" id="dm-l"><p class="cln">Загружаю…</p></div><p class="dmhint">Чтобы написать игроку, нажми на его ник в чате или в топе и выбери «✉️ Написать»</p></div>';
  $("dm-x").onclick=closeModal;const r=await act("dm_list");const L=$("dm-l");if(!r||!L)return;
  if(!r.list.length){L.innerHTML='<p class="chempty">Пока нет сообщений</p>';return}
  L.innerHTML=r.list.map(c=>{const adm=c.adm&&!S.admin;return '<button type="button" class="dmc'+(c.un?" un":"")+'" data-u="'+c.uid+'"><i class="dmav'+(adm?" adm":"")+'" style="--h:'+((c.uid*47)%360)+'">'+(adm?"👑":esc(String(c.name||"?").slice(0,1).toUpperCase()))+'</i><span><b>'+(adm?"Администрация":(c.vip?"👑 ":"")+esc(c.name))+'</b><small>'+(c.mine?"Ты: ":"")+esc(String(c.text).slice(0,70))+'</small></span><em>'+dmTime(c.t)+(c.un?'<u>'+c.un+'</u>':'')+'</em></button>'}).join("");
  L.onclick=e=>{const b=e.target.closest("[data-u]");if(b)dmThread(+b.dataset.u)}}
async function dmThread(uid){if(!ONLINE||!uid)return;if(S&&uid===S.uid){toast("Себе написать нельзя");return}dmStop();dmPeerId=uid;dmItems=[];dmInfo=null;const m=$("modal"),sh=$("msheet");m.hidden=false;
  sh.innerHTML='<div class="chwrap dmw"><div class="chtop"><button type="button" class="dmback" id="dm-b">‹</button><b id="dm-n">…</b><button type="button" class="dmmore" id="dm-m">⋯</button><button type="button" class="x" id="dm-x">Закрыть</button></div><div class="chlist" id="dm-list"><p class="chempty">Загружаю…</p></div><div class="chin"><textarea id="dm-in" maxlength="500" rows="1" placeholder="Сообщение…"></textarea><button type="button" class="mini2" id="dm-send">➤</button></div><small class="chrule">Без мата, ссылок и спама. Пишут гадости? ⋯ → «Пожаловаться»</small></div>';
  $("dm-x").onclick=()=>{dmStop();closeModal()};$("dm-b").onclick=dmOpen;$("dm-m").onclick=dmMenu;
  const send=async()=>{const i=$("dm-in"),t=i.value.trim();if(!t)return;$("dm-send").disabled=true;const r=await act("dm_send",{uid,text:t});if($("dm-send"))$("dm-send").disabled=false;if(!r)return;i.value="";hap("light");dmPull()};
  $("dm-send").onclick=send;$("dm-in").onkeydown=e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();send()}};
  await dmPull();if(dmPeerId===uid)dmTimer=setInterval(dmPull,4000)}
async function dmPull(){const uid=dmPeerId;if(!uid||!$("dm-list")){dmStop();return}const last=dmItems.length?dmItems[dmItems.length-1].id:0;
  const r=await act("dm_get",{uid,after:last});if(!r||uid!==dmPeerId||!$("dm-list"))return;dmInfo=r;
  $("dm-n").textContent=r.peer.adm&&!S.admin?"👑 Администрация":(r.peer.vip?"👑 ":"")+r.peer.name;
  if(r.items.length||!last){dmItems=dmItems.concat(r.items.filter(x=>x.id>last)).slice(-150);dmDraw()}
  const inp=$("dm-in");if(inp){inp.disabled=!!(r.blocked||r.blockedMe);inp.placeholder=r.blocked?"Ты заблокировал этого игрока":r.blockedMe?"Игрок ограничил сообщения":"Сообщение…";
    if(!S.nick&&!S.admin){inp.placeholder="Сначала выбери ник";inp.onfocus=()=>{dmStop();closeModal();openNick(false)}}}
  S.dmUn=r.un||0;moreDot()}
function dmDraw(){const box=$("dm-list");if(!box)return;const atEnd=!box.dataset.f||box.scrollHeight-box.scrollTop-box.clientHeight<80;
  if(!dmItems.length){box.innerHTML='<p class="chempty">Напиши первым 👋</p>';return}
  box.innerHTML=dmItems.map(m=>'<div class="chm dmm'+(m.a===S.uid?" me":"")+(m.adm&&m.a!==S.uid?" dmadm":"")+'"><div class="chx"></div><span class="cht">'+dmTime(m.t)+'</span></div>').join("");
  [...box.querySelectorAll(".chx")].forEach((e,i)=>e.textContent=dmItems[i].text);
  if(atEnd){box.scrollTop=box.scrollHeight;box.dataset.f="1"}}
function dmMenu(){const ex=$("dm-menu");if(ex){ex.remove();return}const r=dmInfo;if(!r)return;const d=document.createElement("div");d.id="dm-menu";d.className="dmmenu";
  d.innerHTML='<button type="button" data-k="p">👤 Витрина игрока</button>'+(r.peer.adm?'':'<button type="button" data-k="b">'+(r.blocked?"✅ Разблокировать":"🚫 Заблокировать")+'</button><button type="button" data-k="r">🚩 Пожаловаться</button>')+(S.admin&&!r.peer.adm?'<button type="button" data-k="s">⭐ Начислить звёзды</button>':'');
  d.onclick=async e=>{const b=e.target.closest("[data-k]");if(!b)return;const k=b.dataset.k,uid=dmPeerId;d.remove();
    if(k==="p"){dmStop();closeModal();openParam("u_"+uid)}
    if(k==="b"){const q=await act("dm_block",{uid,on:r.blocked?0:1});if(q){toast(q.blocked?"Игрок заблокирован: он больше не сможет тебе писать":"Игрок разблокирован");dmPull()}}
    if(k==="r"){const q=await act("dm_report",{uid});if(q){toast("Жалоба отправлена администрации, игрок заблокирован");dmPull()}}
    if(k==="s"){dmStop();stOpen({uid,name:r.peer.name})}};
  $("dm-list").before(d)}
/* кнопка «Написать» (и «Звёзды» для админа) на витрине игрока */
{const _osm=openShowcase;openShowcase=function(F){_osm(F);if(!ONLINE||!F||!F.uid||!S||F.uid===S.uid)return;const sh=$("msheet"),who=sh.querySelector(".who");if(!who||sh.querySelector(".dmrow"))return;
  const r=document.createElement("div");r.className="dmrow";r.innerHTML='<button type="button" class="mini2" data-k="dm">✉️ Написать</button>'+(S.admin?'<button type="button" class="mini2 stb" data-k="st">⭐ Звёзды</button>':'');
  r.onclick=e=>{const b=e.target.closest("[data-k]");if(!b)return;if(b.dataset.k==="dm")dmThread(F.uid);else stOpen({uid:F.uid,name:F.name})};who.after(r)}}
/* ===================== ⭐ Админ: звёзды на игровой баланс ===================== */
async function stOpen(pre){if(!S||!S.admin)return;dmStop();const m=$("modal"),sh=$("msheet");m.hidden=false;
  sh.innerHTML='<div class="box nickbox stbox" id="stbox"><button type="button" class="x" id="sgv-x">Закрыть</button><h3>⭐ Звёзды игрокам</h3><p class="cln">Звёзды падают на игровой баланс. Игрок тратит их в Сокровищнице как настоящие: сундуки, VIP, места, дракон. Ему придёт сообщение от бота.</p><input type="text" id="sgv-q" placeholder="🔎 ID, ник или имя игрока" autocomplete="off"><div id="sgv-res"></div><div id="sgv-form"></div><h3 class="sth">История начислений</h3><div id="sgv-log"><p class="cln">Загружаю…</p></div></div>';
  $("sgv-x").onclick=closeModal;let tm=0;$("sgv-q").oninput=()=>{clearTimeout(tm);tm=setTimeout(stFind,350)};
  if(pre)stForm(pre);stLog()}
async function stFind(){const q=$("sgv-q")?$("sgv-q").value.trim():"",R=$("sgv-res");if(!R)return;if(!q){R.innerHTML="";return}const r=await act("st_find",{q});if(!r||!$("sgv-res"))return;
  R.innerHTML=r.users.length?r.users.map(u=>'<button type="button" class="stu" data-u="'+u.uid+'"><span><b>'+(u.vip?"👑 ":"")+esc(u.name)+'</b><small>id '+u.uid+(u.tg&&u.tg!==u.name?" · "+esc(u.tg):"")+'</small></span><em>'+u.bal+' ⭐</em></button>').join(""):'<p class="cln">Никого не нашёл</p>';
  R.onclick=e=>{const b=e.target.closest("[data-u]");if(b)stForm(r.users.find(x=>x.uid===+b.dataset.u))}}
function stForm(u){const F=$("sgv-form");if(!F||!u)return;$("sgv-res").innerHTML="";let amt=50;
  F.innerHTML='<div class="stf"><div class="stwho"><b>'+esc(u.name)+'</b><small>id '+u.uid+(u.bal!=null?' · на балансе '+u.bal+' ⭐':'')+'</small></div><div class="stam">'+[25,50,100,250,500,1000].map(n=>'<button type="button" data-a="'+n+'"'+(n===amt?' class="on"':'')+'>'+n+'</button>').join("")+'</div><input type="number" id="sgv-a" min="1" max="100000" value="'+amt+'" inputmode="numeric"><input type="text" id="sgv-n" maxlength="200" placeholder="Комментарий для игрока (необязательно)"><button type="button" class="craftbtn" id="sgv-go"></button><button type="button" class="ghost" id="sgv-dm">✉️ Написать игроку</button></div>';
  const upd=()=>{amt=Math.round(+$("sgv-a").value||0);$("sgv-go").textContent="⭐ Начислить "+amt+" ⭐";[...F.querySelectorAll("[data-a]")].forEach(b=>b.classList.toggle("on",+b.dataset.a===amt))};upd();
  F.querySelector(".stam").onclick=e=>{const b=e.target.closest("[data-a]");if(!b)return;$("sgv-a").value=b.dataset.a;upd()};$("sgv-a").oninput=upd;
  $("sgv-dm").onclick=()=>dmThread(u.uid);
  $("sgv-go").onclick=async()=>{if(amt<1){toast("Укажи сумму");return}const g=$("sgv-go");g.disabled=true;const r=await act("st_give",{uid:u.uid,amt,note:$("sgv-n").value});g.disabled=false;if(!r)return;
    sfx.coin();hapN("success");toast("⭐ "+r.name+": +"+r.amt+" ⭐, теперь "+r.bal+" ⭐");F.innerHTML='<p class="stok">✅ '+esc(r.name)+' получил '+r.amt+' ⭐ · на балансе '+r.bal+' ⭐</p>';stLog()};
  F.scrollIntoView({block:"nearest"})}
async function stLog(){const r=await act("st_log");const L=$("sgv-log");if(!r||!L)return;
  L.innerHTML='<p class="cln">Всего начислено: <b>'+r.sum+' ⭐</b> · '+r.n+' раз</p>'+r.log.map(x=>'<div class="stl"><span><b>'+esc(x.name||"id "+x.uid)+'</b><small>'+dmTime(x.t)+(x.note?" · "+esc(x.note):"")+'</small></span><em class="'+(x.amt<0?"neg":"")+'">'+(x.amt>0?"+":"")+x.amt+' ⭐</em></div>').join("")}
{const _mg=menuGo;menuGo=function(k){if(k==="dm"){menuClose();return dmOpen()}if(k==="stars"){menuClose();return stOpen()}return _mg(k)}}
{const _mb=menuBadges;menuBadges=function(){const b=_mb();if(S&&S.dmUn)b.dm=S.dmUn>99?"99+":S.dmUn;return b}}
{const _cm=closeModal;closeModal=function(){dmStop();return _cm.apply(this,arguments)}}
/* ссылка из бота: ?dm=<id> — сразу в переписку */
{const q=+new URLSearchParams(location.search).get("dm");if(q){const t=setInterval(()=>{if(!S)return;clearInterval(t);setTimeout(()=>{try{closeModal()}catch(e){}dmThread(q)},800)},300)}}
setInterval(()=>{try{moreDot()}catch(e){}},15e3);
/* ===================== 🧭 «Путь воина»: понятный старт для новичка — 5 шагов, за каждый прокрутки, в конце сундук ===================== */
const PATH_UI=[
 {ic:"🎴",t:"Открой 3 карточки",d:"Жми большую жёлтую кнопку «Открыть»",go:"Открыть",f:()=>{setTab("spin");const o=$("open");if(o){o.scrollIntoView({block:"center",behavior:"smooth"});o.classList.remove("pth-pulse");void o.offsetWidth;o.classList.add("pth-pulse")}},n:st=>Math.min(3,st.nOp||0)+"/3"},
 {ic:"🏷",t:"Придумай себе ник",d:"С ником ты появишься в топах и чате",go:"Выбрать ник",f:()=>openNick(false)},
 {ic:"🎯",t:"Разбей мишень в Лагере",d:"Тапай по мишени — копишь руны 💠 и прокачиваешься",go:"В Лагерь",f:()=>openCamp()},
 {ic:"⚔️",t:"Выиграй первый бой",d:"Выбери воина и характеристику, где он сильнее",go:"В бой",f:()=>setTab("duel")},
 {ic:"📅",t:"Забери награду за вход",d:"Заходи каждый день — награда растёт, на 7-й день эпик",go:"Забрать",f:()=>{setTab("quest");setTimeout(()=>{const e=$("streak");if(e)e.closest(".box").scrollIntoView({block:"center",behavior:"smooth"})},120)}}];
function pathSt(){if(!S)return null;const P=S.path||{got:[]};const ok=PATH_UI.map((x,i)=>{try{return pathOk(S,{nick:!!S.nick},i)}catch(e){return false}});return {P,ok,got:P.got||[],fin:!!P.fin}}
/* «новичковые» блоки — только тем, кто пришёл после их запуска (31.10): у старых игроков их нет */
const NEWB_FROM=Date.UTC(2026,9,30,21);
function pathShow(){const V=pathSt();if(!V||V.fin||!ONLINE)return false;return S.created>=NEWB_FROM&&NOW()-S.created<14*864e5}
function pathDraw(){let el=$("pathbox");if(!pathShow()){if(el)el.remove();return}
  if(!el){el=document.createElement("div");el.id="pathbox";el.className="pathbox";const h=$("open")&&$("open").parentElement;if(!h)return;h.after(el);
    el.onclick=async e=>{const b=e.target.closest("[data-pa]");if(!b)return;const a=b.dataset.pa,i=+b.dataset.i;hap("light");
      if(a==="go"){PATH_UI[i].f();return}
      if(a==="get"){b.disabled=true;const r=await act("path_claim",{i});if(r){sfx.coin();hapN("success");burst(1);toast("+"+r.sp+" прокрутки 🎴");renderAll()}else b.disabled=false;return}
      if(a==="fin"){b.disabled=true;const r=await act("path_claim",{fin:1});if(r){sfx.fanfare();hapN("success");burst(3);toast("🎁 Сундук открыт: +"+r.sp+" прокруток и следующая карточка — эпическая или лучше!");renderAll()}else b.disabled=false;return}
      if(a==="all"){el.classList.toggle("open")}}}
  const V=pathSt(),n=V.got.length,all=n>=PATH_UI.length,cur=PATH_UI.findIndex((x,i)=>!V.got.includes(i));
  const k=JSON.stringify([V.got,V.ok,S.nOp>=3?3:S.nOp,el.classList.contains("open")]);if(el.dataset.k===k)return;el.dataset.k=k;
  const row=(x,i)=>{const got=V.got.includes(i),ok=V.ok[i];return '<div class="pth-r'+(got?" got":ok?" ok":"")+(i===cur?" cur":"")+'"><i>'+(got?"✅":x.ic)+'</i><span><b>'+x.t+(x.n&&!got?' <u>'+x.n(S)+'</u>':'')+'</b><small>'+(got?"готово":ok?"выполнено — забирай награду!":x.d)+'</small></span>'+(got?'':ok?'<button type="button" class="pth-get" data-pa="get" data-i="'+i+'">+'+PATH[i].sp+' 🎴</button>':'<button type="button" class="pth-go" data-pa="go" data-i="'+i+'">'+x.go+' ›</button>')+'</div>'};
  el.innerHTML='<div class="pth-h"><b>🧭 Путь воина</b><span>'+n+' из '+PATH_UI.length+'</span></div><div class="pth-bar"><i style="width:'+(n/PATH_UI.length*100)+'%"></i></div>'+
    (all?'<div class="pth-fin"><span>🎁 Все шаги пройдены!<small>Сундук: +'+PATH_FIN.sp+' прокруток и эпическая карточка</small></span><button type="button" class="craftbtn" data-pa="fin">Открыть сундук</button></div>':
    row(PATH_UI[cur],cur)+'<div class="pth-all">'+PATH_UI.map((x,i)=>i===cur?'':row(x,i)).join("")+'</div><button type="button" class="pth-tg" data-pa="all">'+(el.classList.contains("open")?"Свернуть":"Все шаги и награды")+'</button><p class="pth-note">За каждый шаг +2 🎴, за весь путь — сундук с эпической карточкой</p>')}
{const _ra5=renderAll;renderAll=function(){_ra5();try{pathDraw()}catch(e){console.error(e)}}}
setInterval(()=>{try{pathDraw()}catch(e){}},2000);
const isPathNewbie=()=>{try{return pathShow()&&pathSt().got.length<3&&NOW()-S.created<36e5}catch(e){return false}};
/* новичку не мешаем всплывашками, пока он не прошёл первые шаги (подписка — после 3 шагов или через час) */
{const _sc=subpCan;subpCan=function(){if(isPathNewbie())return false;return _sc()}}
{const _sa=storyAnnWaiting;storyAnnWaiting=function(){if(isPathNewbie())return false;return _sa()}}
/* прокрутки кончились — понятная подсказка, что делать дальше */
function noSpinDraw(){let el=$("nospin");const show=S&&ONLINE&&(S.spins||0)<=0&&$("sec-spin")&&!$("sec-spin").hidden;if(!show){if(el)el.remove();return}
  if(!el){el=document.createElement("div");el.id="nospin";el.className="nospin";const h=$("open")&&$("open").parentElement;if(!h)return;h.after(el);
    el.onclick=e=>{const b=e.target.closest("[data-ns]");if(!b)return;hap("light");const k=b.dataset.ns;if(k==="camp")openCamp();else if(k==="quest")setTab("quest");else if(k==="wheel")menuGo("wheel");else if(k==="ref"){try{$("ref-go").click()}catch(x){}}}}
  const t=S.refillAt?Math.max(0,S.refillAt-NOW()):0;
  el.innerHTML='<b>🎴 Прокрутки закончились'+(t?' · новые через <span class="num">'+tleft(t)+'</span>':'')+'</b><div class="ns-g"><button type="button" data-ns="camp">🎯<span>Лагерь<small>руны → прокрутки</small></span></button><button type="button" data-ns="quest">🎁<span>Задания<small>и награда за вход</small></span></button><button type="button" data-ns="wheel">🎡<span>Колесо<small>бесплатно раз в день</small></span></button><button type="button" data-ns="ref">👥<span>Друг<small>+10 прокруток</small></span></button></div>'}
setInterval(()=>{try{noSpinDraw()}catch(e){}},1000);
/* ===================== 📅 «Сегодня» на главной: подарки новичка (7 дней), награда за вход, цель дня ===================== */
const NB_UI=[["🎴","5 прокруток"],["👑","Легенда"],["🪙","500 монет"],["🎴","10 прокруток"],["💎","Эпик"],["💠","5 000 рун"],["🐉","Легенда +15"]];
function dayboxDraw(){let el=$("daybox");if(!S||!ONLINE){if(el)el.remove();return}
  const now=NOW(),V=nbView(S,{now,created:S.created||now}),Gv=goalView(S,now),sk=S.streak||{},stCan=sk.last!==today(now)||!sk.claimed;
  const showNb=!V.done&&V.age<21&&(S.created||0)>=NEWB_FROM;if(!showNb&&!stCan&&Gv.got){if(el)el.remove();return}
  if(!el){el=document.createElement("div");el.id="daybox";el.className="daybox";const h=$("pathbox")||($("open")&&$("open").parentElement);if(!h)return;h.after(el);
    el.onclick=async e=>{const b=e.target.closest("[data-db]");if(!b)return;hap("light");const k=b.dataset.db;b.disabled=true;
      if(k==="nb"){const r=await act("nb_claim");if(r){sfx.fanfare();hapN("success");burst(r.card?3:2);toast("🎁 Подарок дня "+r.day+": "+[r.sp?"+"+r.sp+" прокруток":"",r.cash?"+"+r.cash+" 🪙":"",r.runes?"+"+fmtN(r.runes)+" 💠":"",r.guar?"следующая карточка — эпик":"",r.card?"легендарный воин!":""].filter(Boolean).join(", "));renderAll();if(r.card&&typeof openCardView==="function")setTimeout(()=>openCardView(r.card,{mine:true}),400)}}
      else if(k==="st"){const r=await act("streak");if(r){sfx.coin();hapN("success");toast(r.n===7?"Неделя подряд! Следующая карточка — эпическая или лучше 🔥":"+1 прокрутка за вход · день "+r.n);renderAll()}}
      else if(k==="goal"){const r=await act("goal_claim");if(r){sfx.fanfare();hapN("success");burst(2);toast("🎁 Сундук дня: +"+r.sp+" прокруток и +"+r.cash+" 🪙");renderAll()}}
      else if(k==="ggo"){const G=goalOf(now);if(G.k==="wins")setTab("duel");else{setTab("spin");const o=$("open");if(o)o.scrollIntoView({block:"center",behavior:"smooth"})}}
      b.disabled=false}}
  const tl=Math.max(0,(dayNumU(now)+1)*864e5-3*3600e3-now);
  const k=JSON.stringify([V,Gv,stCan,sk.n,showNb,Math.floor(tl/60e3)]);if(el.dataset.k===k)return;el.dataset.k=k;
  let h='<div class="db-h"><b>📅 Сегодня</b><span>новое через '+tleft(tl).replace(/:\d\d$/,"")+'</span></div>';
  if(showNb)h+='<div class="db-nb"><div class="db-t">🎁 Подарки новичка — заходи 7 дней подряд</div><div class="db-cal">'+NB_UI.map((x,i)=>'<div class="dbc'+(i<V.n?" got":i===V.n&&V.can?" now":"")+'"><small>День '+(i+1)+'</small><i>'+(i<V.n?"✅":x[0])+'</i><span>'+x[1]+'</span></div>').join("")+'</div>'+
    (V.can?'<button type="button" class="craftbtn db-go" data-db="nb">🎁 Забрать подарок дня '+(V.n+1)+'</button>':'<p class="db-wait">✅ Сегодня забрано. Подарок дня '+(V.n+1)+' — завтра!</p>')+'</div>';
  if(stCan)h+='<div class="db-r"><i>🔥</i><span><b>Награда за вход</b><small>серия: '+(sk.last===today(now)?sk.n:((sk.n||0)%7)+1)+' из 7 дней · на 7-й эпик</small></span><button type="button" class="pth-get" data-db="st">+1 🎴</button></div>';
  h+='<div class="db-r'+(Gv.got?" got":"")+'"><i>🎯</i><span><b>Цель дня: '+Gv.t+'</b><small>'+(Gv.got?"✅ сундук открыт — завтра новая цель":Gv.have+" из "+Gv.n+" · награда: +"+GOAL_R.sp+" 🎴 и "+GOAL_R.cash+" 🪙")+'</small><em class="db-bar"><u style="width:'+(Gv.have/Gv.n*100)+'%"></u></em></span>'+(Gv.got?'':Gv.can?'<button type="button" class="pth-get" data-db="goal">Сундук</button>':'<button type="button" class="pth-go" data-db="ggo">Вперёд ›</button>')+'</div>';
  el.innerHTML=h}
{const _ra6=renderAll;renderAll=function(){_ra6();try{dayboxDraw()}catch(e){console.error(e)}}}
setInterval(()=>{try{dayboxDraw()}catch(e){}},5000);
PATH_UI[4].d="Кнопка «+1 🎴» в блоке «Сегодня» на главной";PATH_UI[4].f=()=>{setTab("spin");setTimeout(()=>{const e=$("daybox");if(e)e.scrollIntoView({block:"center",behavior:"smooth"})},120)};
/* админ: удержание новичков и воронки */
{const _dsR=drawStats;drawStats=function(){_dsR();try{const R=stData,b=$("st-body");if(!R||!b||!R.retC)return;let box=$("st-ret");if(!box){box=document.createElement("div");box.id="st-ret";box.className="srcbox"}b.prepend(box);
  const pc=(a,n)=>n?Math.round(a/n*100)+"%":"—",T=R.retC.reduce((a,r)=>({n:a.n+r.n,d1:a.d1+r.d1,s5:a.s5+r.s5}),{n:0,d1:0,s5:0});
  box.innerHTML='<h4>📈 Удержание новичков (14 дней)</h4><p class="cln">Вернулись на 2-й день (D1), на 4-й (D3) и на 8-й (D7). Хорошо для игр: D1 30–40%, D7 10–15%.</p><table class="rett"><tr><th>Пришли</th><th>Новых</th><th>5+ карт</th><th>D1</th><th>D3</th><th>D7</th></tr>'+
    R.retC.map(r=>'<tr><td>'+r.day+'</td><td>'+r.n+'</td><td>'+pc(r.s5,r.n)+'</td><td>'+pc(r.d1,r.n)+'</td><td>'+pc(r.d3,r.n)+'</td><td>'+pc(r.d7,r.n)+'</td></tr>').join("")+'<tr class="tot"><td>Итого</td><td>'+T.n+'</td><td>'+pc(T.s5,T.n)+'</td><td>'+pc(T.d1,T.n)+'</td><td></td><td></td></tr></table>'+
    '<p class="cln"><b>Путь воина</b> (шагов пройдено → игроков): '+[0,1,2,3,4,5,6].map(k=>k+": "+((R.pathF||{})[k]||0)).join(" · ")+'</p><p class="cln"><b>Подарки новичка</b> (дней забрано → игроков): '+[0,1,2,3,4,5,6,7].map(k=>k+": "+((R.nbF||{})[k]||0)).join(" · ")+'</p>'}catch(e){console.error(e)}}}
/* ===================== 🎴 Мультиоткрытие: ×5 и ×10 ===================== */
function multiDraw(){let el=$("multi");const h=$("open")&&$("open").parentElement;if(!h||!S)return;const n=S.spins||0;
  if(!el){el=document.createElement("div");el.id="multi";el.className="multi";h.after(el);
    el.onclick=e=>{const b=e.target.closest("[data-mo]");if(b)openMulti(+b.dataset.mo)}}
  const show=n>=2&&!(typeof isPathNewbie==="function"&&isPathNewbie()&&(S.nOp||0)<3);el.hidden=!show;if(!show)return;
  const k=String(n>=10?2:n>=5?1:0)+(n<5?n:"");if(el.dataset.k===k)return;el.dataset.k=k;
  el.innerHTML=(n>=5?'<button type="button" data-mo="5">🎴 Открыть ×5</button>':'<button type="button" data-mo="'+n+'">🎴 Открыть все ×'+n+'</button>')+(n>=10?'<button type="button" class="x10" data-mo="10">🔥 Открыть ×10</button>':'')}
{const _ra8=renderAll;renderAll=function(){_ra8();try{multiDraw()}catch(e){}}}
setInterval(()=>{try{multiDraw()}catch(e){}},2000);
let multiBusy=false;
async function openMulti(n){if(multiBusy||!S)return;multiBusy=true;hap("medium");try{whoosh()}catch(e){}
  const r=await act("open_multi",{n});multiBusy=false;if(!r||!r.cards||!r.cards.length)return;renderAll();
  const C=r.cards,best=C.reduce((a,c)=>c.v>a.v?c:a,C[0]),tot=C.reduce((a,c)=>a+c.v,0),Lv=C.map(c=>revealLevel(c));
  const RC=["#9aa6bf","#34c759","#0a84ff","#bf5af2","#ff9f0a"],col=c=>c.f>=2?["","","#5ac8fa","#ffd23f","#ff3fd8"][c.f]||RC[HEROES[c.h][2]]:RC[HEROES[c.h][2]];
  const m=$("modal"),sh=$("msheet");m.hidden=false;
  sh.innerHTML='<div class="box mop2"><div class="mop-h"><b>🎴 Пачка ×'+C.length+'</b><span id="mop-sum">открываем…</span></div><div class="mop-stage"><div class="mop-rays"></div><div class="mop-g2" id="mop-g"></div></div>'+
    '<button type="button" class="mop-skip" id="mop-skip">⏩ Открыть все сразу</button><div class="mop-end" id="mop-end" hidden><div class="mop-best" id="mop-best"></div><div class="mop-b"><button type="button" class="craftbtn" id="mop-ok">Отлично!</button>'+(S.spins>=2?'<button type="button" class="mini2" id="mop-more">🎴 Ещё ×'+Math.min(S.spins,n)+'</button>':'')+'</div><button type="button" class="ghost" id="mop-sell" hidden></button></div></div>';
  const g=$("mop-g"),slots=[];
  C.forEach((c,i)=>{const w=document.createElement("div");w.className="mop-s";w.style.setProperty("--rc",col(c));w.style.setProperty("--d",(i*.07)+"s");w.style.setProperty("--fx",((i%3)-1)*-110+"%");w.style.setProperty("--fy",(-Math.floor(i/3)*100-60)+"%");
    w.innerHTML='<div class="mop-in"><div class="mop-back"><i>⚔️</i><b>ВОИНЫ<br>ЭПОХ</b></div><div class="mop-front"></div></div>';
    const d=bigMc(c,0);const v=d.querySelector(".v");if(v)v.innerHTML='<small>'+FIN[c.f].k+'</small><b class="num">'+fmt(c.v)+'</b>';w.querySelector(".mop-front").appendChild(d);
    if(c===best)w.classList.add("best");g.appendChild(w);slots.push({w,c,L:Lv[i],done:false});w.onclick=()=>flip(slots[i],true)});
  let sum=0,left=C.length,timer=0,idx=0;
  function flip(S2,fast){if(S2.done)return;S2.done=true;left--;if(!fast)try{S2.w.scrollIntoView({block:"nearest",behavior:"smooth"})}catch(e){}const L=S2.L;S2.w.classList.remove("tease");S2.w.classList.add("open","l"+L);
    try{sfx.reveal(Math.min(L,4))}catch(e){}if(L>=2){try{burst(L-1)}catch(e){}hap(L>=3?"heavy":"medium")}else if(!fast)hap("light");
    sum+=S2.c.v;$("mop-sum").innerHTML='на сумму <b class="num">'+fmt(sum)+'</b> 🪙';
    if(L>=3){const st=sh.querySelector(".mop-stage");st.classList.remove("boom");void st.offsetWidth;st.classList.add("boom");try{sfx.fanfare();hapN("success")}catch(e){}}
    if(!left)finish()}
  function next(){if(idx>=slots.length)return;const S2=slots[idx++];if(S2.done){next();return}
    if(S2.L>=2){S2.w.classList.add("tease");try{for(let k=0;k<3;k++)setTimeout(()=>sfx.rumble(k*.6),k*150)}catch(e){}timer=setTimeout(()=>{flip(S2);timer=setTimeout(next,S2.L>=3?900:420)},S2.L>=3?900:520)}
    else{flip(S2);timer=setTimeout(next,230)}}
  function finish(){clearTimeout(timer);$("mop-skip").hidden=true;const e=$("mop-end");e.hidden=false;
    best&&slots.find(x=>x.c===best).w.classList.add("crown");
    $("mop-best").innerHTML=Lv.some(l=>l>=2)?'⭐ Лучшая: <b>'+escH(HEROES[best.h][0])+'</b> · '+FIN[best.f].k+' · '+HT[HEROES[best.h][2]].k.toLowerCase():'Редких нет — повезёт в следующий раз!';
    /* выбор, что продать: тап по карточке ставит/снимает отметку; обычные отмечены сразу */
    const can=x=>x.c.f<5&&!x.sold&&S.cards.some(y=>y.id===x.c.id),sb=$("mop-sell"),k=()=>hhIs(NOW(),"coin")?1.5:1;
    slots.forEach(x=>{x.sel=can(x)&&x.c.f===0&&HEROES[x.c.h][2]===0;x.w.classList.toggle("msel",x.sel)});
    const upd=()=>{const L=slots.filter(x=>x.sel),v=L.reduce((a,x)=>a+x.c.v*QUICK*k(),0);sb.hidden=false;sb.disabled=!L.length;sb.className="mop-sellb";
      sb.innerHTML=L.length?'💰 Продать выбранные ('+L.length+') · <b class="num">'+fmt(Math.round(v*100)/100)+'</b>':'Нажми на карточки, которые хочешь продать'};
    e.insertAdjacentHTML("afterbegin",'<p class="mop-hint">👆 Нажми на карточку, чтобы выбрать её для продажи</p>');
    slots.forEach(x=>{x.w.onclick=()=>{if(!can(x)){if(x.c.f>=5)toast("Эту карточку продать нельзя");return}x.sel=!x.sel;x.w.classList.toggle("msel",x.sel);hap("light");upd()}});upd();
    sb.onclick=async()=>{const L=slots.filter(x=>x.sel&&can(x));if(!L.length)return;sb.disabled=true;const q=await act("sellmany",{ids:L.map(x=>x.c.id)});
      if(q){try{sfx.coin()}catch(_){}hapN("success");toast("Продано "+q.n+" за "+fmt(q.got)+" 🪙");L.forEach(x=>{x.sel=false;x.sold=true;x.w.classList.remove("msel");x.w.classList.add("msold")});renderAll();upd()}else sb.disabled=false};
    $("mop-ok").onclick=closeModal;if($("mop-more"))$("mop-more").onclick=()=>{closeModal();setTimeout(()=>openMulti(n),120)}}
  $("mop-skip").onclick=()=>{clearTimeout(timer);slots.forEach((x,k)=>setTimeout(()=>flip(x,true),k*60))};
  setTimeout(next,C.length*70+450)}
/* ===================== 📦 Хранилище: большая заметная кнопка в «Картах» ===================== */
function capBarDraw(){const H=$("col-head");if(!H||!S)return;let b=$("capbar");if(!b){b=document.createElement("button");b.type="button";b.id="capbar";b.className="capbig";H.after(b);b.onclick=()=>{hap("light");openCap()}}
  const n=S.cards.length,c=capOf(S),pc=Math.min(100,n/c*100),full=n>=c-3;const k=n+"/"+c;if(b.dataset.k===k)return;b.dataset.k=k;b.classList.toggle("full",full);
  b.innerHTML='<i>📦</i><span><b>Хранилище: '+n+' / '+c+'</b><em class="cb-bar"><u style="width:'+pc+'%"></u></em><small>'+(full?(n>=c?"Места нет! Новые карточки не влезут":"Почти заполнено — осталось "+(c-n))+"":"свободно "+(c-n)+" мест")+'</small></span><strong>＋ Место</strong>'}
{const _ra9=renderAll;renderAll=function(){_ra9();try{capBarDraw()}catch(e){}}}
/* ---------- 🍀 счастливые часы: плашка с таймером + окно в начале события ---------- */
const HH_GO={drag:{b:"🐉 К дракону",f:()=>setTab("dragon")},coin:{b:"🎴 К коллекции",f:()=>setTab("col")},camp:{b:"🎯 В Лагерь",f:()=>openCamp()},gift:{b:"🎁 Забрать +3",f:null}};
async function hhGo(k){hap("light");if(k==="gift"){const r=await act("hh_claim");if(r){sfx.fanfare();hapN("success");burst(2);toast("🍀 +3 прокрутки! Удачи на счастливом часе");renderAll()}return}closeModal();HH_GO[k].f()}
function hhPop(e){const T=HH_T[e.k],o=document.createElement("div");o.className="hhpop";
  o.innerHTML=`<div class="hhcard"><div class="hhrays"></div><div class="hhclv">🍀</div><div class="hhk">Счастливый час!</div><div class="hhic">${T.ic}</div><div class="hhn">${T.n}</div><div class="hhd">${T.d}</div><div class="hht">⏳ <b data-hht>30:00</b></div><button type="button" class="hhbtn" data-hg>${HH_GO[e.k].b}</button><button type="button" class="hhx" data-hx>Позже</button></div>`;
  document.body.appendChild(o);try{sfx.fanfare()}catch(_){}hapN("success");
  o.onclick=ev=>{if(ev.target.closest("[data-hg]")){o.remove();hhGo(e.k)}else if(ev.target.closest("[data-hx]")||ev.target===o)o.remove()}}
function hhTick(){let b=$("hhbar");const now=NOW(),e=S&&ONLINE?hhNow(now):null;
  if(!e||e.k==="gift"&&S.hhGot===e.at){if(b)b.remove();document.querySelectorAll(".hhpop [data-hht]").forEach(x=>{const p=x.closest(".hhpop");if(p&&!e)p.remove()});return}
  const T=HH_T[e.k],ms=e.end-now,mm=String(Math.floor(ms/60e3)).padStart(2,"0"),ss=String(Math.floor(ms/1e3)%60).padStart(2,"0");
  if(!b){b=document.createElement("button");b.type="button";b.id="hhbar";b.className="hhbar";b.onclick=()=>{const x=hhNow(NOW());if(x)hhGo(x.k)}}
  const sec=["spin","dragon","camp","col"].map(k=>$("sec-"+k)).find(s=>s&&!s.hidden);if(sec&&b.parentElement!==sec)sec.prepend(b);
  b.innerHTML=`<span class="hhb-i">🍀${T.ic}</span><span class="hhb-t"><b>${T.n}</b><small>${T.d}</small></span><span class="hhb-c">${mm}:${ss}</span>`;
  document.querySelectorAll(".hhpop [data-hht]").forEach(x=>x.textContent=mm+":"+ss);
  let seen="";try{seen=localStorage.getItem("we-hh")||""}catch(_){}
  if(seen!==String(e.at)&&!$("onb")&&!document.querySelector(".modal:not([hidden]),.hhpop")){try{localStorage.setItem("we-hh",e.at)}catch(_){}hhPop(e)}}
setInterval(()=>{try{if(!document.hidden)hhTick()}catch(err){}},1000);
{const _r=renderAll;renderAll=function(){_r.apply(this,arguments);try{hhTick()}catch(e){}}}
/* ---------- 💎 «почти достиг»: честно показываем, сколько реально осталось до гарантии эпика и до полной эпохи ---------- */
function nmEra(){const have=new Set((S.cards||[]).map(c=>c.h)),got=S.eras||{};let best=null;
  for(const E of ERAS){if(got[E.k])continue;const miss=E.h.filter(h=>!have.has(h)),n=E.h.length-miss.length;if(!n)continue;
    const it={E,n,miss};if(!miss.length)return it;if(!best||miss.length<best.miss.length||miss.length===best.miss.length&&n/E.h.length>best.n/best.E.h.length)best=it}
  return best}
function nmPity(){return Math.max(1,LPITY-(S.lpity||0))}
let nmLast="";
function nmDraw(){let el=$("nmbox");if(!S||!ONLINE||!$("open")){if(el)el.remove();return}
  if(!el){el=document.createElement("div");el.id="nmbox";el.className="nmbox";const row=$("open").parentElement;row.after(el);
    el.onclick=e=>{const b=e.target.closest("[data-nm]");if(!b)return;hap("light");if(b.dataset.nm==="era")setTab("album");else if(b.dataset.nm==="pity")toast("Если "+(LPITY-1)+" карточек подряд не будет легендарной, "+LPITY+"-я точно будет легендарной. Счётчик обнуляется, когда выпадает легенда")}}
  const left=nmPity(),pp=left<=1?100:Math.round((S.lpity||0)/LPITY*100),R=nmEra();
  let h=`<button type="button" class="nmrow lg${left<=10?" hot":""}" data-nm="pity"><i>👑</i><span><b>${left<=1?"Следующая карточка — точно легендарная!":"Легенда гарантирована через "+left+" "+plural(left,"прокрутку","прокрутки","прокруток")}</b><u><s style="width:${pp}%"></s></u></span></button>`;
  if(R){const t=R.E.h.length,done=!R.miss.length,names=R.miss.slice(0,2).map(i=>HEROES[i][0]).join(", ");
    h+=`<button type="button" class="nmrow${done||R.miss.length<=2?" hot":""}" data-nm="era"><i>${R.E.ic}</i><span><b>${done?"Эпоха «"+R.E.n+"» собрана — забери награду!":R.E.n+": "+R.n+" из "+t+" · не хватает "+(R.miss.length<=2?names:R.miss.length+" воинов")}</b><u><s style="width:${R.n/t*100}%"></s></u><small>награда: ${R.E.sp} 🎴 + ${fmtN(R.E.cash)} 🪙</small></span></button>`}
  if(h!==nmLast){const chg=nmLast!=="";nmLast=h;el.innerHTML=h;if(chg){el.classList.remove("nmpulse");void el.offsetWidth;el.classList.add("nmpulse")}}}
{const _r=renderAll;renderAll=function(){_r.apply(this,arguments);try{nmDraw()}catch(e){console.error(e)}}}
/* после обычной прокрутки (не легенды) — одна честная подсказка, если до цели правда рукой подать */
{const _a=act;act=async function(n,p){const pre=n==="open"&&S?{era:nmEra(),left:nmPity()}:null;const r=await _a(n,p);
  try{if(pre&&r&&r.card){const c=r.card;if(HEROES[c.h][2]>=3||c.f>=3){if(HEROES[c.h][2]>=3&&pre.left<=1)setTimeout(()=>toast("👑 Гарантия сработала! Счётчик легенды начался заново"),2300);return r}const now=nmEra(),left=nmPity();let msg="";
    if(now&&!now.miss.length&&!(pre.era&&pre.era.E.k===now.E.k&&!pre.era.miss.length))msg="🗺 Эпоха «"+now.E.n+"» собрана! Забери "+now.E.sp+" прокруток в альбоме";
    else if(now&&now.miss.length<=2&&ERA_OF[c.h]===now.E.k&&(!pre.era||pre.era.E.k!==now.E.k||now.miss.length<pre.era.miss.length))msg="🔥 Почти! До эпохи «"+now.E.n+"» не хватает: "+now.miss.map(i=>HEROES[i][0]).join(", ");
    else if(left<=5&&left<pre.left)msg=left<=1?"👑 Следующая карточка точно будет легендарной!":"👑 Ещё "+left+" "+plural(left,"прокрутка","прокрутки","прокруток")+" — и легенда гарантирована";
    if(msg)setTimeout(()=>toast(msg),2300)}}catch(e){}
  return r}}
/* ---------- ⭐ донаты для понта: Соавтор, звёздные титулы, Звезда дня, поддержка проекта ---------- */
const ttlTag=k=>'<span class="ttlb'+(TITLES[k].stars||TITLES[k].sup?" ttls":"")+(k==="author"?" ttla":"")+'">'+TITLES[k].ic+" "+TITLES[k].n+'</span>';
function flexTop(D){const own=S.titles||[],al=D.authLeft==null?TITLES.author.month:D.authLeft,nx=D.sdayNext?D.sdayNext.split("-").reverse().slice(0,2).join("."):null,me=escH(S.nick||S.name||"Ты");
  const btn=(k,st)=>own.includes(k)?'<button type="button" class="buy sm alt" disabled>✓ Уже твой</button>':'<button type="button" class="buy sm" data-ttlbuy="'+k+'">⭐ '+fmtN(st)+'</button>';
  return '<div class="dnhero"><b>⭐ Донат и понт</b><span>Всё здесь — только для красоты и славы. На силу и шансы не влияет</span></div>'+
  '<div class="dnauth"><div class="dnglow"></div><div class="dnah">'+ttlTag("author")+'<em>'+(al>0?"мест в этом месяце: "+al+" из "+TITLES.author.month:"места на месяц закончились")+'</em></div>'+
   '<h4>Стань Соавтором игры</h4><ul><li>✍️ Титул <b>«Соавтор»</b> рядом с ником навсегда — особый, переливающийся</li><li>💡 <b>Твою идею добавим в игру</b>: новый воин, событие, предмет, режим — в пределах разумного</li><li>↩️ Не получится сделать — вернём звёзды</li></ul>'+
   '<div class="dnprev">Так увидят все: '+ttlTag("author")+' <b>'+me+'</b></div>'+
   (own.includes("author")?'<button type="button" class="craftbtn" disabled>✓ Ты уже Соавтор</button>':'<button type="button" class="craftbtn dnbig" data-ttlbuy="author"'+(al>0?"":" disabled")+'>Стать Соавтором · ⭐ '+fmtN(TITLES.author.stars)+'</button>')+'</div>'+
  '<div class="ghd">🎖 Титулы навсегда</div><p class="gnote">Видны рядом с ником в топах, чате, на арене и в витрине.</p><div class="dnttl">'+
   ["immortal","emperor"].map(k=>'<div class="dntc">'+ttlTag(k)+'<small>'+me+'</small>'+btn(k,TITLES[k].stars)+'</div>').join("")+'</div>'+
  '<div class="ghd">🌟 Звезда дня</div><div class="dnday"><div><b>Твой ник и лучшая карточка весь день на главной у всех игроков</b><small>'+(nx?"Ближайший свободный день: "+nx:"Все дни заняты")+' · один игрок в день</small></div><button type="button" class="buy sm" data-buy="sday"'+(nx?"":" disabled")+'>⭐ '+SDAY.stars+'</button></div>'+
  '<div class="ghd">❤️ Поддержать проект</div><div class="dnsup"><p>Игру делает один человек. Если она тебе нравится — поддержи сколько хочешь. От '+SUP.title+' ⭐ за всё время — титул '+ttlTag("patron")+'</p>'+
   '<div class="dnsr">'+[25,50,100,250,500].map(n=>'<button type="button" class="dnp" data-supn="'+n+'">'+n+' ⭐</button>').join("")+'</div>'+
   '<div class="dnsr"><input id="dn-n" type="number" inputmode="numeric" min="'+SUP.min+'" max="'+SUP.max+'" placeholder="Своя сумма"><button type="button" class="craftbtn" data-sup="1">❤️ Поддержать</button></div></div>'}
$("gold-body").addEventListener("click",e=>{const t=e.target.closest("button");if(!t||t.disabled)return;
  if(t.dataset.ttlbuy){hap("light");return buyItem({item:"title",k:t.dataset.ttlbuy})}
  if(t.dataset.supn){hap("light");const i=$("dn-n");if(i)i.value=t.dataset.supn;document.querySelectorAll(".dnp").forEach(x=>x.classList.toggle("on",x===t));return}
  if(t.dataset.sup){const n=Math.floor(+($("dn-n")||{}).value||0);if(!(n>=SUP.min&&n<=SUP.max)){toast("Выбери сумму от "+SUP.min+" до "+SUP.max+" ⭐");return}hap("light");return buyItem({item:"support",n})}});
function flexDone(k){const T=TITLES[k],m=$("modal"),sh=$("msheet");m.hidden=false;sfx.fanfare();burst(4);hapN("success");
  sh.innerHTML='<div class="box nickbox grant dndone"><h3>'+(k==="author"?"✍️ Ты — Соавтор игры!":T.ic+" Титул «"+T.n+"» твой!")+'</h3><div class="dnprev big">'+ttlTag(k)+' <b>'+escH(S.nick||S.name||"")+'</b></div>'+
    (k==="author"?'<p>Теперь самое интересное: напиши свою идею в @voinovadmin. Новый воин, событие, режим — расскажи, что хочешь увидеть в игре.</p><button type="button" class="craftbtn" id="dn-idea">💡 Написать идею</button>':'<p>Его уже видят все рядом с твоим ником. Сменить титул можно в профиле → «Титулы».</p>')+
    '<button type="button" class="ghost" id="dn-ok">Отлично</button></div>';
  const i=$("dn-idea");if(i)i.onclick=()=>{try{tg.openTelegramLink("https://t.me/voinovadmin")}catch(e){open("https://t.me/voinovadmin")}};$("dn-ok").onclick=()=>{closeModal();renderAll()}}
function flexDay(d){const t=d===today(NOW());sfx.fanfare();burst(3);hapN("success");toast("🌟 Ты — Звезда дня "+(t?"прямо сейчас! Тебя видят все на главной":d.split("-").reverse().join(".")+"! В этот день тебя увидят все"))}
{const _ps=payShow;payShow=function(r){if(r&&r.status==="done"&&r.item==="support"){const R=r.res||{};renderAll();loadGold();sfx.fanfare();burst(3);hapN("success");
  const m=$("modal"),sh=$("msheet");m.hidden=false;sh.innerHTML='<div class="box nickbox grant dndone"><h3>❤️ Спасибо!</h3><p>Твои '+R.n+' ⭐ пойдут на новых воинов, события и сервер. Это правда помогает игре расти.</p>'+(R.ttl?'<div class="dnprev big">'+ttlTag("patron")+' <b>'+escH(S.nick||S.name||"")+'</b></div><p>Тебе выдан титул «Меценат»!</p>':R.tot<SUP.title?'<p class="cln">До титула «Меценат» осталось '+(SUP.title-R.tot)+' ⭐</p>':'')+'<button type="button" class="craftbtn" id="dn-ok">Обнять разработчика 🤗</button></div>';$("dn-ok").onclick=closeModal;return}
  return _ps(r)}}
/* 🌟 Звезда дня на главной */
function sdayDraw(){let el=$("sdaybar");const d=S&&S.sday;if(!d||!ONLINE||!$("sec-spin")){if(el)el.remove();return}
  if(!el){el=document.createElement("button");el.type="button";el.id="sdaybar";el.className="sdaybar";$("sec-spin").prepend(el);el.onclick=()=>{hap("light");if(d.uid===S.uid)toast("🌟 Сегодня ты Звезда дня — тебя видят все!");else openGold("flex")}}
  const c=d.card,key=d.uid+"|"+(c&&c.id);if(el.dataset.k===key)return;el.dataset.k=key;
  el.innerHTML='<span class="sdi">🌟</span><span class="sdt"><small>ЗВЕЗДА ДНЯ</small><b></b>'+(c?'<em>'+escH(HEROES[c.h][0])+' · '+fmtC(c.v)+'</em>':"")+'</span><span class="sdq">Хочешь сюда?</span>';
  fxName(el.querySelector("b"),"",d.name,d.uid)}
{const _r=renderAll;renderAll=function(){_r.apply(this,arguments);try{sdayDraw()}catch(e){console.error(e)}}}
/* чужой звёздный титул — тап по нему открывает, где такой взять */
document.addEventListener("click",e=>{const b=e.target.closest(".ttlb[data-ttl]");if(!b)return;const T=TITLES[b.dataset.ttl];if(!T||!(T.stars||T.sup))return;e.stopPropagation();hap("light");
  toast(T.ic+" «"+T.n+"» — "+(T.sup?"титул за поддержку проекта":"титул из «Донат и понт»")+". Открываю…");setTimeout(()=>openGold("flex"),700)},true);
/* один раз рассказать, что донаты есть: тем, кто уже втянулся (30+ прокруток), не новичкам */
setInterval(()=>{try{if(!S||!ONLINE||document.hidden||(S.nOp||0)<10||$("onb")||document.querySelector(".modal:not([hidden]),.hhpop"))return;let seen=0;try{seen=+localStorage.getItem("we-don1")||0}catch(e){}if(seen)return;
  try{localStorage.setItem("we-don1",1)}catch(e){}const m=$("modal"),sh=$("msheet");m.hidden=false;
  sh.innerHTML='<div class="box nickbox dnann"><h3>⭐ Новое: Донат и понт</h3><div class="dnprev big">'+ttlTag("author")+' <b>'+escH(S.nick||S.name||"")+'</b></div><ul class="dnul"><li>✍️ <b>Стань Соавтором</b> — твою идею добавим в игру (3 места в месяц)</li><li>🎖 Титулы «Бессмертный» и «Император» рядом с ником</li><li>🌟 <b>Звезда дня</b> — тебя видят все на главной</li><li>❤️ Поддержать проект на любую сумму</li></ul><p class="cln">Только для красоты — на силу и шансы не влияет.</p><button type="button" class="craftbtn" id="dn-go">Посмотреть</button><button type="button" class="ghost" id="dn-x">Позже</button></div>';
  $("dn-go").onclick=()=>{closeModal();openGold("flex")};$("dn-x").onclick=closeModal}catch(e){}},20000);
/* ---------- 🎨 косметика: своя анимация выпадения, фон профиля, подарки друзьям ---------- */
function dfxPlay(k,host){host=host||$("stage");if(!host||!DFX[k])return;const o=document.createElement("div");o.className="dfx dfx-"+k;let h="";
  if(k==="storm"){h='<i class="dfx-dark"></i>'+[[-30,0],[40,1],[5,2]].map(([x,i])=>'<svg class="dfx-bolt" style="left:calc(50% + '+x+'%);animation-delay:'+(i*.18)+'s" viewBox="0 0 60 200"><path d="M34 0 L12 92 L30 92 L8 200 L52 74 L32 74 L48 0Z"/></svg>').join("")+'<i class="dfx-flash"></i>'}
  else if(k==="fire"){h='<i class="dfx-glow"></i>';for(let i=0;i<26;i++)h+='<i class="dfx-fl" style="left:'+(4+Math.random()*92)+'%;animation-delay:'+(Math.random()*.7).toFixed(2)+'s;--s:'+(.6+Math.random()*1.1).toFixed(2)+'"></i>'}
  else{for(let i=0;i<14;i++)h+='<i class="dfx-sh" style="left:'+(Math.random()*110-10)+'%;top:'+(Math.random()*40-20)+'%;animation-delay:'+(Math.random()*.9).toFixed(2)+'s"></i>';for(let i=0;i<22;i++)h+='<i class="dfx-sp" style="left:'+(Math.random()*100)+'%;top:'+(Math.random()*100)+'%;animation-delay:'+(Math.random()*1.2).toFixed(2)+'s"></i>'}
  o.innerHTML=h;host.appendChild(o);if(k==="storm"){host.classList.add("dfx-shake");setTimeout(()=>host.classList.remove("dfx-shake"),700)}setTimeout(()=>o.remove(),2300)}
{const _a=act;act=async function(n,p){const r=await _a(n,p);try{if(n==="open"&&r&&r.card&&S&&S.dfxOn)dfxPlay(S.dfxOn)}catch(e){}return r}}
const pbgBan=(k,name)=>'<div class="pbgb pbg-'+k+'"><i></i><i></i><i></i>'+(name?'<b>'+escH(name)+'</b>':"")+'</div>';
{const _os=openShowcase;openShowcase=function(F){_os.apply(this,arguments);const k=F&&F.pbg;if(!k||!PBG[k])return;
  const put=()=>{const t=$("msheet").querySelector(".wsh .top");if(!t||t.querySelector(".pbgb"))return !!t;t.classList.add("haspbg");t.insertAdjacentHTML("afterbegin",pbgBan(k).replace('class="pbgb','class="pbgb pbgbg'));return true};
  if(!put())setTimeout(put,300)}}
const presStars=w=>w==="vip"?VIP_T[1].stars:SHOP[w]?SHOP[w].stars:(()=>{const [c,k]=w.split(":");return (c==="t"?TITLES:c==="d"?DFX:PBG)[k].stars})();
let presW="vip";
function cosHTML(){const own=t=>S[t]||[],on=t=>S[t+"On"]||"";
  let v='<div class="ghd">✨ Своя анимация выпадения</div><p class="gnote">Каждый раз, когда ты открываешь карточку. Нажми на карточку — посмотри, как это выглядит.</p><div class="cosg">'+
   Object.keys(DFX).map(k=>{const K=DFX[k],h=own("dfx").includes(k),a=on("dfx")===k;return '<div class="cosc'+(a?" on":"")+'"><div class="cosp dfxp" data-dfxp="'+k+'"><span>'+K.ic+'</span></div><b>'+K.n+'</b>'+
    (h?'<button type="button" class="buy sm alt" data-cos="dfx" data-k="'+(a?"":k)+'">'+(a?"✓ Включена":"Включить")+'</button>':'<button type="button" class="buy sm" data-cosbuy="dfx" data-k="'+k+'">⭐ '+K.stars+'</button>')+'</div>'}).join("")+'</div>';
  v+='<div class="ghd">🖼 Фон профиля</div><p class="gnote">Живой фон в твоей витрине — его видят все, кто к тебе заходит.</p><div class="cosg c2">'+
   Object.keys(PBG).map(k=>{const K=PBG[k],h=own("pbg").includes(k),a=on("pbg")===k;return '<div class="cosc'+(a?" on":"")+'">'+pbgBan(k,S.nick||S.name)+'<b>'+K.ic+' '+K.n+'</b>'+
    (h?'<button type="button" class="buy sm alt" data-cos="pbg" data-k="'+(a?"":k)+'">'+(a?"✓ Стоит":"Поставить")+'</button>':'<button type="button" class="buy sm" data-cosbuy="pbg" data-k="'+k+'">⭐ '+K.stars+'</button>')+'</div>'}).join("")+'</div>';
  v+='<div class="ghd">🎁 Подарить другу</div><div class="presb"><p>Сделай другу сюрприз — он получит подарок сразу и узнает, что это от тебя.</p><div class="presg">'+
   Object.keys(PRESENT).map(w=>'<button type="button" class="presc'+(w===presW?" on":"")+'" data-presw="'+w+'"><span>'+PRESENT[w].ic+'</span><b>'+PRESENT[w].n+'</b><small>⭐ '+presStars(w)+'</small></button>').join("")+'</div>'+
   '<div class="dnsr"><input id="pres-n" placeholder="Ник друга" autocomplete="off"><button type="button" class="craftbtn" data-pres="1">🎁 Подарить</button></div></div>';
  return v}
{const _ft=flexTop;flexTop=function(D){return _ft(D)+cosHTML()}}
$("gold-body").addEventListener("click",async e=>{const t=e.target.closest("button,[data-dfxp]");if(!t||t.disabled)return;
  if(t.dataset.dfxp){hap("light");dfxPlay(t.dataset.dfxp,t);return}
  if(t.dataset.cosbuy){hap("light");return buyItem({item:"cos",t:t.dataset.cosbuy,k:t.dataset.k})}
  if(t.dataset.cos){hap("light");const r=await act("cos_set",{t:t.dataset.cos,k:t.dataset.k});if(r){sfx.coin();renderGold();if(r.t==="dfx"&&r.k)setTimeout(()=>toast("✨ Включено! Открой карточку — увидишь"),100)}return}
  if(t.dataset.presw){hap("light");presW=t.dataset.presw;document.querySelectorAll(".presc").forEach(x=>x.classList.toggle("on",x===t));return}
  if(t.dataset.pres){const n=String(($("pres-n")||{}).value||"").trim();if(!n){toast("Напиши ник друга");return}hap("light");return buyItem({item:"present",w:presW,nick:n})}});
{const _ps=payShow;payShow=function(r){if(r&&r.status==="done"&&(r.item==="cos"||r.item==="present")){renderAll();loadGold();sfx.fanfare();burst(3);hapN("success");const R=r.res||{};
  if(r.item==="present")toast("🎁 Подарок для "+R.tn+" отправлен! Он узнает, что это от тебя");else{const K=(R.t==="pbg"?PBG:DFX)[R.k];toast(K.ic+" «"+K.n+"» твоё!"+(R.t==="dfx"?" Открой карточку — посмотри":""));if(R.t==="dfx")setTimeout(()=>{setTab("spin");setTimeout(()=>dfxPlay(R.k),400)},900)}return}
  return _ps(r)}}
/* получил подарок от друга */
setInterval(()=>{try{if(!S||!ONLINE||!(S.prs&&S.prs.length)||document.hidden||$("onb")||document.querySelector(".modal:not([hidden]),.hhpop"))return;const L=S.prs.slice();S.prs=[];act("present_seen");
  const m=$("modal"),sh=$("msheet");m.hidden=false;sfx.fanfare();burst(4);hapN("success");
  sh.innerHTML='<div class="box nickbox prespop"><div class="presbox">🎁</div><h3>Тебе подарок!</h3>'+L.map(x=>'<p><b>'+escH(x.f)+'</b> подарил тебе '+(PRESENT[x.w]?PRESENT[x.w].ic+" <b>"+PRESENT[x.w].n+"</b>":"подарок")+'</p>').join("")+'<p class="cln">Всё уже в игре. Скажи спасибо — или подари что-нибудь в ответ 😉</p><button type="button" class="craftbtn" id="pr-ok">Ура!</button><button type="button" class="ghost" id="pr-back">🎁 Подарить в ответ</button></div>';
  $("pr-ok").onclick=closeModal;$("pr-back").onclick=()=>{closeModal();openGold("flex");setTimeout(()=>{const i=$("pres-n");if(i){i.value=L[L.length-1].f;i.scrollIntoView({block:"center"})}},500)}}catch(e){}},3000);
/* ---------- 🎟 большой розыгрыш: каждый друг = билет ---------- */
{const _dc=drawChal;drawChal=function(){_dc.apply(this,arguments);try{const C=chData,box=$("chal");if(!C||!C.big||!box)return;box.classList.add("bigc");
  const hm=t=>new Date(t+3*3600e3).toISOString().slice(11,16),dd=t=>new Date(t+3*3600e3).toISOString().slice(5,10).split("-").reverse().join("."),T=C.tickets||0,my=(C.me&&C.me.n)||0,ch=T&&my?Math.max(1,Math.round(my/T*100)):0;
  box.querySelector(".chal-h span").textContent="🎟 РОЗЫГРЫШ $15 · $8 · 100 ⭐";
  $("chal-t").innerHTML=C.phase==="soon"?'Старт <b>'+dd(C.start)+' в '+hm(C.start)+'</b>. Готовь список друзей — каждый друг будет билетом!':'<b>Каждый приглашённый друг = 1 билет.</b> 5 друзей — 5 билетов, 20 — 20 билетов. Чем больше билетов, тем больше шанс выиграть! Итоги <b>'+dd(C.end)+' в '+hm(C.end)+'</b>';
  $("chal-p").innerHTML=C.prizes.map((p,k)=>'<div class="bigpz"><span>'+["🥇","🥈","🥉"][k]+'</span><b>'+p+'</b><small>'+((C.pnote||[])[k]||"")+'</small></div>').join("");
  if(C.phase!=="soon")$("chal-me").innerHTML='<div class="bigme"><div class="bigt"><b>🎟 '+my+'</b><span>'+plural(my,"твой билет","твоих билета","твоих билетов")+'</span></div><div class="bigt"><b>'+(ch?ch+"%":"0%")+'</b><span>твой шанс</span></div><div class="bigt"><b>'+T+'</b><span>'+plural(T,"билет","билета","билетов")+' всего</span></div></div><p class="bigtip">'+(my?"🔥 Ещё 1 друг — и шанс вырастет до "+Math.round((my+1)/(T+1)*100)+"%":"👆 Пригласи 1 друга — и ты уже в розыгрыше!")+'</p>';
  {const tp=$("chal-top");if(tp&&/никто не набрал/.test(tp.textContent))tp.innerHTML='<div class="empty">Пока никого — пригласи первого друга и стань первым участником!</div>'}
  $("chal-rules").textContent="Билет — за каждого нового игрока, который пришёл по твоей ссылке с "+dd(C.start)+" "+hm(C.start)+" до "+dd(C.end)+" "+hm(C.end)+" (по Минску) и открыл хотя бы "+C.need+" карточки. От 1 друга ты участник. В "+hm(C.end)+" бот случайно выбирает трёх разных победителей: чем больше билетов, тем выше шанс. 1 место — $15 на игровой баланс (зачисляется звёздами) и карточка, которую сделаем специально для тебя с твоей подписью. 2 место — $8 на баланс и 10 прокруток. 3 место — 100 ⭐ на баланс и 5 прокруток. Накрутка ботами и пустыми аккаунтами — снятие с розыгрыша."}catch(e){console.error(e)}}}
/* один раз за розыгрыш — большое окно, чтобы точно увидели */
setInterval(()=>{try{const C=chData;if(!C||!C.big||C.chest||C.phase==="done"||!S||!ONLINE||(S.nOp||0)<3||document.hidden||$("onb")||document.querySelector(".modal:not([hidden]),.hhpop"))return;const key="we-big-"+C.id+"-"+C.phase;let seen="";try{seen=localStorage.getItem(key)}catch(e){}if(seen)return;try{localStorage.setItem(key,1)}catch(e){}
  const m=$("modal"),sh=$("msheet");m.hidden=false;sfx.fanfare();burst(3);
  sh.innerHTML='<div class="box nickbox bigpop"><div class="bigrays"></div><div class="bigk">🎟 РОЗЫГРЫШ</div><div class="bigusd">$15</div><div class="bigsub">+ карточка с твоей подписью</div><div class="bigrow"><div><b>🥈 $8</b><small>+10 прокруток</small></div><div><b>🥉 100 ⭐</b><small>+5 прокруток</small></div></div><small class="bignote">все призы — на баланс в игре</small>'+
    '<div class="bigrule"><b>Каждый приглашённый друг = 1 билет</b><span>Больше друзей — больше билетов — больше шанс!</span></div><button type="button" class="hhbtn" id="big-go">👥 Пригласить друзей</button><button type="button" class="hhx" id="big-x">Позже</button></div>';
  $("big-go").onclick=()=>{closeModal();setTab("spin");setTimeout(()=>{const b=$("chal");if(b){b.scrollIntoView({block:"center"});const g=$("chal-go");if(g)g.click()}},300)};$("big-x").onclick=closeModal}catch(e){}},4000);
/* ---------- новичок открыл игру и ничего не нажал: через 4 с кнопка зовёт, через 10 с первая карточка открывается сама ---------- */
{let touched=false,done=false;const t0=Date.now();["pointerdown","keydown","touchstart"].forEach(ev=>addEventListener(ev,()=>{touched=true},{capture:true,once:true}));
  const it=setInterval(()=>{try{if(done||touched){clearInterval(it);return}if(!S)return;
    if((S.cards||[]).length||(S.nOp||0)>0||(S.spins||0)<=0){clearInterval(it);return}
    if(!$("sec-spin")||$("sec-spin").hidden||!$("modal").hidden||document.querySelector(".terms,.hhpop"))return;
    const el=Date.now()-t0,b=$("open");if(el>4000&&b)b.classList.add("autonudge");
    if(el>10000){done=true;clearInterval(it);if(b)b.classList.remove("autonudge");try{scrollTo({top:0,behavior:"smooth"})}catch(e){}setTimeout(()=>{if(!touched)open()},400)}}catch(e){}},500)}
/* ---------- 🎬 экран для ежедневного видео (только админ): «100 000 игроков до Нового года» ---------- */
const VID={start:Date.UTC(2026,10,2)-3*3600e3,goal:100000,ny:Date.UTC(2026,11,31,21)};
function vidOpen(){const R=stData;if(!R)return toast("Сначала обнови статистику");const now=NOW(),day=Math.floor((now-VID.start)/864e5)+1,tot=R.players||0,left=Math.max(0,VID.goal-tot),dl=Math.max(1,Math.ceil((VID.ny-now)/864e5)),need=Math.ceil(left/dl);
  const src=(R.srcs||[]).find(r=>r.code==="d"+(day-1)),p=Math.min(100,tot/VID.goal*100);
  const o=document.createElement("div");o.className="vids";
  o.innerHTML='<div class="vbg"><i></i><i></i><i></i></div><div class="vin"><div class="vtag">ВОИНЫ ЭПОХ · ЧЕЛЛЕНДЖ</div><div class="vday">ДЕНЬ <b>'+day+'</b><small>/ 60</small></div>'+
   '<div class="vgoal">цель: <b>100 000</b> игроков до Нового года 🎄</div><div class="vnum" data-to="'+tot+'">0</div><div class="vlbl">игроков сейчас</div>'+
   '<div class="vbar"><s style="--p:'+Math.max(.6,p).toFixed(2)+'%"></s><em>'+(p<1?p.toFixed(2):p.toFixed(1))+'%</em></div>'+
   '<div class="vrow"><div><b>+'+fmtN(R.newYesterday||0)+'</b><span>вчера</span></div><div><b>+'+fmtN(R.newToday||0)+'</b><span>сегодня</span></div><div><b>'+dl+'</b><span>'+plural(dl,"день","дня","дней")+' до НГ</span></div></div>'+
   '<div class="vneed">нужно <b>'+fmtN(need)+'</b> новых игроков в день</div>'+(src?'<div class="vsrc">📹 из вчерашнего видео пришло: <b>'+(src.fresh||0)+'</b></div>':'')+
   '<div class="vbot">@VoinyEpohBot</div><div class="vhint">метка для сегодняшнего видео: <b>s_d'+day+'</b> · тап — заново · ✕ — закрыть</div></div><button type="button" class="vx">✕</button>';
  document.body.appendChild(o);const run=()=>{const n=o.querySelector(".vnum"),to=+n.dataset.to,t0=performance.now();o.classList.remove("go");void o.offsetWidth;o.classList.add("go");
    const st=t=>{const k=Math.min(1,(t-t0)/10000),e=k<.5?4*k*k*k:1-Math.pow(-2*k+2,3)/2;n.textContent=fmtN(Math.round(to*e));if(k<1)requestAnimationFrame(st)};requestAnimationFrame(st)};run();
  o.onclick=e=>{if(e.target.closest(".vx")){o.remove();return}run()}}
{const _ds=drawStats;drawStats=function(){_ds.apply(this,arguments);try{const b=$("st-body");if(!b||$("vid-go"))return;const x=document.createElement("button");x.type="button";x.id="vid-go";x.className="craftbtn";x.textContent="🎬 Экран для видео: день и игроки";x.onclick=vidOpen;b.prepend(x)}catch(e){}}}
/* ---------- 🎟 промокоды: окно для игрока + управление для админа ---------- */
function promoOpen(){if(!ONLINE)return toast("Промокоды работают в игре через Telegram");const m=$("modal"),sh=$("msheet");m.hidden=false;
  sh.innerHTML='<div class="box nickbox prbox"><div class="prtk">🎟</div><h3>Промокод</h3><p class="cln">Коды бывают в видео и постах канала. Введи — и забери награду</p><input id="pr-in" maxlength="24" autocomplete="off" autocapitalize="characters" placeholder="Например, ДЕНЬ1"><button type="button" class="craftbtn" id="pr-go">Активировать</button><button type="button" class="ghost" id="pr-x">Закрыть</button></div>';
  const i=$("pr-in"),go=async()=>{const v=i.value.trim();if(!v){i.focus();return}$("pr-go").disabled=true;const r=await act("promo_use",{code:v});$("pr-go").disabled=false;
    if(r&&r.live){closeModal();sfx.fanfare();burst(4);hapN("success");renderAll();showGrant({cards:[r.card]},"🎥 Карточка с эфира"+(r.sp?" + "+r.sp+" 🎴":""));return}
    if(r){sfx.fanfare();burst(3);hapN("success");renderAll();sh.innerHTML='<div class="box nickbox prbox"><div class="prtk ok">🎁</div><h3>Код активирован!</h3><div class="prrw">'+(r.sp?'<b>+'+r.sp+' 🎴</b><span>прокруток</span>':'')+(r.cash?'<b>+'+fmtN(r.cash)+' 🪙</b><span>монет</span>':'')+(r.x2?'<b>x2 ⭐</b><span>к пополнению баланса (бонус до '+r.x2+' ⭐)</span>':'')+'</div><button type="button" class="craftbtn" id="pr-ok">'+(r.x2&&!r.sp&&!r.cash?"⭐ Пополнить с x2":"Крутить!")+'</button></div>';$("pr-ok").onclick=()=>{closeModal();if(r.x2&&!r.sp&&!r.cash)openGold("flex");else setTab("spin")}}
    else{i.classList.remove("shk");void i.offsetWidth;i.classList.add("shk")}};
  $("pr-go").onclick=go;i.onkeydown=e=>{if(e.key==="Enter")go()};$("pr-x").onclick=closeModal;setTimeout(()=>i.focus(),200)}
/* ссылка ?promo=КОД — сразу открывает окно с подставленным кодом */
{const q=new URLSearchParams(location.search).get("promo");if(q){const t=setInterval(()=>{if(!S)return;clearInterval(t);setTimeout(()=>{promoOpen();const i=$("pr-in");if(i)i.value=q},900)},400)}}
let promoL=null;
async function promoAdmin(box){const r=await act("pcode_list");if(!r)return;promoL=r.list;const pc=(a,b)=>b?Math.round(a/b*100)+"%":"—",dt=t=>t?new Date(t+3*3600e3).toISOString().slice(5,10).split("-").reverse().join("."):"∞";
  box.innerHTML='<h4>🎟 Промокоды</h4><div class="prnew"><input id="pa-code" maxlength="24" placeholder="КОД, например ДЕНЬ1"><div class="prnr"><label>🎴<input id="pa-sp" type="number" value="3" min="0"></label><label>🪙<input id="pa-cash" type="number" value="0" min="0"></label><label title="x2 к пополнению: максимум бонусных звёзд">x2 ⭐<input id="pa-x2" type="number" value="0" min="0"></label><label>лимит<input id="pa-mx" type="number" value="0" min="0" title="0 — без лимита"></label><label>дней<input id="pa-days" type="number" value="0" min="0" title="0 — бессрочно"></label></div><button type="button" class="craftbtn" id="pa-go">Создать / изменить</button><small>x2 ⭐ — код удваивает следующее пополнение баланса звёздами (число — максимум бонуса, например 500). Лимит 0 — без ограничений, дней 0 — бессрочно. Ссылка с кодом: t.me/VoinyEpohBot?startapp=… не нужна — игрок вводит код в меню «Ещё → Промокод»</small></div>'+
   (promoL.length?'<div class="prl"><div class="prr h"><b>код</b><b>награда</b><b>ввели</b><b>новые</b><b>3+ карт</b><b>вернулись</b><b>до</b></div>'+promoL.map((P,i)=>'<div class="prr'+(P.off?" off":"")+'"><span data-pi="'+i+'"></span><i>'+(P.sp?P.sp+"🎴":"")+(P.cash?" "+fmtN(P.cash)+"🪙":"")+(P.x2?" x2⭐ до "+P.x2:"")+'</i><b>'+P.n+(P.mx?"/"+P.mx:"")+'</b><i>'+(P.nw||0)+'</i><i>'+pc(P.a3||0,P.n)+'</i><i>'+pc(P.back||0,P.n)+'</i><i><button type="button" class="mini2" data-poff="'+i+'">'+(P.off?"вкл":"выкл")+'</button> '+dt(P.until)+'</i></div>').join("")+'</div>':'<small>Кодов пока нет</small>');
  box.querySelectorAll("[data-pi]").forEach(e=>e.textContent=promoL[+e.dataset.pi].code);
  $("pa-go").onclick=async()=>{const r=await act("pcode_set",{code:$("pa-code").value,sp:+$("pa-sp").value,cash:+$("pa-cash").value,x2:+$("pa-x2").value,mx:+$("pa-mx").value,days:+$("pa-days").value});if(r){toast("✅ Код "+r.code+" готов");promoAdmin(box)}};
  box.querySelectorAll("[data-poff]").forEach(b=>b.onclick=async()=>{const P=promoL[+b.dataset.poff];if(await act("pcode_off",{code:P.code}))promoAdmin(box)})}
{const _ds=drawStats;drawStats=function(){_ds.apply(this,arguments);try{const b=$("st-body");if(!b||$("pr-adm"))return;const x=document.createElement("div");x.id="pr-adm";x.className="srcbox prad";const v=$("vid-go");if(v)v.after(x);else b.prepend(x);promoAdmin(x)}catch(e){}}}
/* экран для видео: «из вчерашнего видео пришло» — по меткам и промокодам ДЕНЬ<N-1>… */
{const _vo=vidOpen;vidOpen=async function(){const R=stData;if(R&&!promoL){try{const r=await act("pcode_list");if(r)promoL=r.list}catch(e){}}
  if(R&&promoL){const day=Math.floor((NOW()-VID.start)/864e5)+1,k="ДЕНЬ"+(day-1),pn=promoL.filter(P=>P.code===k||P.code.startsWith(k)&&!/^\d/.test(P.code.slice(k.length))).reduce((a,P)=>a+(P.n||0),0);
    if(pn){const src=(R.srcs||[]).find(r=>r.code==="d"+(day-1));R.srcs=(R.srcs||[]).filter(r=>r!==src).concat([{code:"d"+(day-1),fresh:((src&&src.fresh)||0)+pn}])}}
  return _vo.apply(this,arguments)}}
/* ---------- ⭐ пополнение игрового баланса (+ x2 по промокоду) ---------- */
let myX2=0;
{const _lg=loadGold;loadGold=async function(){try{if(ONLINE){const r=await act("promo_x2");if(r)myX2=r.x2||0}}catch(e){}return _lg.apply(this,arguments)}}
function topupHTML(){return '<div class="tpb'+(myX2?" x2":"")+'"><div class="tph"><b>⭐ Пополнить игровой баланс</b>'+(myX2?'<em>x2 по промокоду · бонус до '+myX2+' ⭐</em>':'<small>звёзды на балансе тратятся на любые покупки в игре</small>')+'</div><div class="tpg">'+
  [50,100,250,500,1000].map(n=>'<button type="button" class="tpc" data-topup="'+n+'"><b>'+n+' ⭐</b>'+(myX2?'<small>→ '+(n+Math.min(n,myX2))+' ⭐</small>':'')+'</button>').join("")+'</div></div>'}
{const _ft=flexTop;flexTop=function(D){const h=_ft(D),i=h.indexOf('</div>',h.indexOf('class="dnhero"'))+6;return h.slice(0,i)+topupHTML()+h.slice(i)}}
$("gold-body").addEventListener("click",e=>{const t=e.target.closest("[data-topup]");if(!t)return;hap("light");buyItem({item:"bal",n:+t.dataset.topup})});
{const _ps=payShow;payShow=function(r){if(r&&r.status==="done"&&r.item==="bal"){const R=r.res||{};myX2=0;renderAll();loadGold();sfx.coin();burst(R.b?3:1);hapN("success");toast("⭐ Баланс пополнен: +"+R.n+(R.b?" и +"+R.b+" бонусом x2!":""));return}return _ps(r)}}
/* ---------- игра открыта без данных Telegram: прогресс не сохранится — говорим об этом прямо ---------- */
if(!ONLINE&&!DEV_USER){const b=document.createElement("a");b.className="demob";b.href="https://t.me/VoinyEpohBot";
  b.innerHTML=IN_TG?"⚠️ Telegram не передал данные входа — прогресс <b>не сохранится</b>. Закрой игру и открой снова через @VoinyEpohBot (если включён VPN — выключи его на минуту)":"⚠️ Это демо: прогресс <b>не сохраняется</b>. Играй в Telegram — <b>@VoinyEpohBot</b>";document.body.prepend(b)}
/* ===================== 🗺 КАРТА МИРА ===================== */
let MD=null,mapSel=-1,mapCard=null,mapStat=0;
const MCELLS=(()=>{const R=25,W=Math.sqrt(3)*R,all=[];for(let r=-6;r<=6;r++)for(let c=-5;c<=5;c++){const x=195+c*W+(Math.abs(r)%2?W/2:0),y=230+r*R*1.5;all.push({x,y,d:Math.hypot(x-195,(y-230)*1.15)})}
  all.sort((a,b)=>a.d-b.d);return all.slice(0,50).map((p,i)=>({x:p.x,y:p.y,z:MAP_Z(i)}))})();
const MFC={fire:["#ff3b1f","#ffb21a"],gold:["#ffd23f","#ff9f0a"],skull:["#111","#444"],dragon:["#1a9a6a","#5df28a"],photo:["#fff","#ccc"],conq:["#7a3cff","#ff3fd8"],"":["#e9e4ff","#b7b0e0"]};
const hexP=(x,y,r)=>[...Array(6).keys()].map(k=>{const a=Math.PI/180*(60*k-30);return (x+r*Math.cos(a)).toFixed(1)+","+(y+r*Math.sin(a)).toFixed(1)}).join(" ");
function mapSVG(){const R=25,regs={};(MD.regs||[]).forEach(r=>regs[r.id]=r);const me=S.uid,col=u=>{if(u===me)return "#ffd23f";const h=(u*2654435761>>>0)%360;return `hsl(${h},85%,60%)`};
  let h=`<defs><radialGradient id="msea" cx="50%" cy="45%" r="70%"><stop offset="0" stop-color="#1d4fa8"/><stop offset=".6" stop-color="#12307a"/><stop offset="1" stop-color="#0a1440"/></radialGradient>
  <pattern id="mwave" width="40" height="20" patternUnits="userSpaceOnUse"><path d="M0 10 q10 -8 20 0 t20 0" fill="none" stroke="#5ab0ff" stroke-opacity=".18" stroke-width="2"/></pattern>
  ${["#6fe39a:#22995a","#b48cff:#6a33d6","#ffd86b:#d08a12"].map((c,i)=>`<linearGradient id="mz${i}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${c.split(":")[0]}"/><stop offset="1" stop-color="${c.split(":")[1]}"/></linearGradient>`).join("")}
  <radialGradient id="mglowg"><stop offset=".55" stop-color="#7fd4ff" stop-opacity="1"/><stop offset="1" stop-color="#7fd4ff" stop-opacity="0"/></radialGradient><radialGradient id="mfogg"><stop offset="0" stop-color="#fff" stop-opacity=".95"/><stop offset=".6" stop-color="#ece8ff" stop-opacity=".7"/><stop offset="1" stop-color="#e8e4ff" stop-opacity="0"/></radialGradient>
  <clipPath id="mflagc"><path d="M0 0 h18 l-5 6 l5 6 h-18z"/></clipPath></defs>
  <rect width="390" height="470" fill="url(#msea)"/><rect width="390" height="470" fill="url(#mwave)"/><ellipse cx="195" cy="232" rx="195" ry="185" fill="url(#mglowg)" opacity=".18"/>`;
  MCELLS.forEach(p=>{h+=`<polygon points="${hexP(p.x,p.y+3,R+7)}" fill="#f3e2b0" opacity=".9"/>`});
  MCELLS.forEach(p=>{h+=`<polygon points="${hexP(p.x,p.y+6,R)}" fill="${["#14603a","#3d1a8a","#7a4a06"][p.z]}"/>`});
  const lockZ=z=>z===1&&!MD.z1||z===2&&!MD.z2;let fl="";
  MCELLS.forEach((p,i)=>{const o=regs[i],lk=lockZ(p.z),M=MAP_R[i];
    h+=`<g data-rg="${i}" style="cursor:pointer"><polygon points="${hexP(p.x,p.y,R-1)}" fill="url(#mz${p.z})" stroke="${o&&o.owner?col(o.owner):"#fff"}" stroke-opacity="${o&&o.owner?1:.35}" stroke-width="${o&&o.owner?3.5:1.2}" opacity="${lk?.7:1}"/>
     <polygon points="${hexP(p.x,p.y-1,R-6)}" fill="none" stroke="#fff" stroke-opacity=".18"/>${i===mapSel?`<polygon points="${hexP(p.x,p.y,R+2)}" fill="none" stroke="#fff" stroke-width="4"/>`:""}
     <text x="${p.x}" y="${p.y+2}" font-size="${o&&o.statue?20:p.z===2?17:14}" text-anchor="middle">${o&&o.statue?"🗿":M[1]}</text>
     <text x="${p.x}" y="${p.y+15}" font-size="6.6" font-weight="900" fill="#fff" stroke="#120a34" stroke-width="2.2" paint-order="stroke" text-anchor="middle">${M[0].slice(0,9)}</text>
     ${lk?`<g opacity=".85"><circle cx="${p.x-8}" cy="${p.y-6}" r="16" fill="url(#mfogg)"/><circle cx="${p.x+7}" cy="${p.y-2}" r="17" fill="url(#mfogg)"/></g><text x="${p.x}" y="${p.y+1}" font-size="12" text-anchor="middle">🔒</text>`:""}
     ${o&&o.shield?`<text x="${p.x-14}" y="${p.y-8}" font-size="10">🛡</text>`:""}<polygon points="${hexP(p.x,p.y,R)}" fill="transparent"/></g>`;
    if(o&&o.owner){const mine=o.owner===me,C=MFC[o.flag]||MFC[""],nm=mine?"🏰 ТЫ":String(o.oname||"?").slice(0,8),w=Math.max(26,nm.length*5+8);
      fl+=`<g pointer-events="none"><line x1="${p.x+9}" y1="${p.y-27}" x2="${p.x+9}" y2="${p.y-8}" stroke="#3a2a10" stroke-width="2"/>
       <g transform="translate(${p.x+10},${p.y-27})">${o.flag==="photo"&&o.ph?`<image href="${API_URL.replace(/\/$/,"")}/mp/${o.owner}" width="18" height="12" preserveAspectRatio="xMidYMid slice" clip-path="url(#mflagc)"/>`:`<path d="M0 0 h18 l-5 6 l5 6 h-18z" fill="${C[0]}"/><path d="M0 0 h9 v12 h-9z" fill="${C[1]}" opacity=".6"/>`}<path d="M0 0 h18 l-5 6 l5 6 h-18z" fill="none" stroke="#fff" stroke-width=".8"/></g>
       <rect x="${p.x-20}" y="${p.y-34}" width="${w}" height="11" rx="5.5" fill="${mine?"#ffd23f":"rgba(10,6,40,.85)"}"/><text x="${p.x-20+w/2}" y="${p.y-26}" font-size="6.8" font-weight="900" fill="${mine?"#1c0a4a":"#fff"}" text-anchor="middle">${escH(nm)}</text></g>`}});
  return h+fl+`<text x="30" y="455" font-size="20">⛵</text><text x="340" y="40" font-size="18">⛵</text><text x="345" y="455" font-size="22">🐙</text>`}
async function mapLoad(){const r=await act("map_get");if(r){MD=r;MD._t=NOW()}return r}
async function openMap(){if(!ONLINE)return toast("Карта мира работает в игре через Telegram");let o=$("mapscr");if(!o){o=document.createElement("div");o.id="mapscr";o.className="mapscr";document.body.appendChild(o);
    o.onclick=e=>{if(mzMoved){mzMoved=false;return}const zb=e.target.closest("[data-z]");if(zb){hap("light");const k=+zb.dataset.z;if(!k)mzSet(1,0,0,true);else mzZoomAt(k>0?1.6:1/1.6,.5,.5,true);return}const g=e.target.closest("[data-rg]");if(g){hap("light");mapSel=+g.dataset.rg;mapCard=null;mapDraw();mapSheet();return}const b=e.target.closest("[data-mb]");if(!b)return;hap("light");const k=b.dataset.mb;
      if(k==="x"){o.remove();return}if(k==="claim")return mapClaim();if(k==="pass")return mapPassOpen();if(k==="flags")return mapFlags();if(k==="pack")return buyItem({item:"mpack"});if(k==="help")return mapHelp()}}
  o.innerHTML='<div class="mp-load">🗺 Загружаю карту…</div>';await mapLoad();if(!MD){o.remove();return}mapDraw();try{if(!localStorage.getItem("we-maph")){localStorage.setItem("we-maph",1);mapHelp()}}catch(e){}}
function mapDraw(){const o=$("mapscr");if(!o||!MD)return;const mine=MD.regs.filter(r=>r.owner===S.uid),P=S.mpass&&S.mpass.m===new Date(NOW()+3*3600e3).toISOString().slice(0,7)?S.mpass:{pts:0,prem:0,got:[],gotP:[]},lv=MPASS.th.filter(x=>P.pts>=x).length;
  const canClaim=P&&MPASS.th.some((t,i)=>i<lv&&(!P.got.includes(i)||P.prem&&!P.gotP.includes(i)));
  o.innerHTML=`<div class="mp-top"><button type="button" class="mp-x" data-mb="x">✕</button><b>🗺 Карта мира</b><span class="mp-pill">⚔️ ${Math.max(0,MD.att.left)} · 🏰 ${mine.length}/${MAP.max}</span></div>
   <div class="mp-leg"><span style="background:#22995a">🌱 Окраины${"" }</span><span style="background:#6a33d6">${MD.z1?"⚔️":"🔒"} Земли эпох${MD.z1?"":" · "+MAP.z1Spins+" 🎴"}</span><span style="background:#c07a10">${MD.z2?"👑":"🔒"} Сердце${MD.z2?"":" · 🐉 ст.3"}</span><button type="button" data-mb="help">❔</button></div>
   <div class="mp-map" id="mp-map"><svg id="mp-svg" viewBox="0 0 390 470" width="100%">${mapSVG()}</svg><div class="mp-zm"><button type="button" data-z="1">＋</button><button type="button" data-z="-1">－</button><button type="button" data-z="0" class="mp-z0">⤢</button></div></div>
   <div class="mp-act"><button type="button" data-mb="pass">🎖 Пропуск${canClaim?' <i class="mp-dot"></i>':""}<small>ур. ${lv}/10</small></button><button type="button" data-mb="flags">🚩 Флаги<small>${MFLAG[S.mflagOn]?MFLAG[S.mflagOn].ic:"обычный"}</small></button><button type="button" data-mb="pack">⚔️ +${MAP.pack} атаки<small>⭐ ${MAP.packStars}</small></button></div>
   <div class="mp-my">${mine.length?`<span>🏰 ${mine.map(r=>MAP_R[r.id][0]).join(" · ")}<br><small>доход: +${fmtN(MD.inc.cash)} 🪙 · +${fmtN(MD.inc.runes)} 💠</small></span><button type="button" data-mb="claim"${MD.inc.cash<1?" disabled":""}>Забрать</button>`:`<span>У тебя пока нет земель<br><small>нажми на свободный зелёный регион — и займи его воином</small></span>`}</div>`}
async function mapClaim(){const r=await act("map_claim");if(r){sfx.coin();burst(2);hapN("success");toast("🏰 Доход с земель: +"+fmtN(r.cash)+" 🪙 · +"+fmtN(r.runes)+" 💠");await mapLoad();mapDraw()}}
function mapChance(me,op,r){const z=MAP_Z(r.id),dk=dgBonus(S,NOW())*1.5+(S.dg?.05:0),home=MAP_R[r.id][2]===ERA_OF[op.h]?MAP.home:0,fat=Math.min(MAP.fatMax,MAP.fat*(r.def_n||0)),k=(1+dk)/(1+home+.03-fat)-1;
  let w=0;for(let i=0;i<80;i++){const p2=aiPick(op,[mapStat]),p3=rndPick([mapStat,p2]),F=fight3(me,op,[mapStat,p2,p3],k);if(F.w>F.l)w++}return {p:Math.round(w/80*100),dk,home,fat}}
function mapSheet(){const i=mapSel,r=(MD.regs||[]).find(x=>x.id===i)||{id:i},M=MAP_R[i],z=MAP_Z(i),I=MAP.inc[z],m=$("modal"),sh=$("msheet"),mine=r.owner===S.uid,lk=z===1&&!MD.z1||z===2&&!MD.z2;m.hidden=false;
  const cards=(S.cards||[]).filter(c=>!away(c)&&!c.part&&c.f<5&&(z>0||HEROES[c.h][2]<=1)).sort((a,b)=>cpow(b)-cpow(a)).slice(0,12);if(!mapCard&&cards[0])mapCard=cards[0].id;const me=cards.find(c=>c.id===mapCard);
  let body=`<div class="ms-h"><b>${M[1]} ${M[0]}</b><em style="background:${MAP.zc[z]}">${["🌱","⚔️","👑"][z]} ${MAP.zn[z]} · +${I.c} 🪙/ч</em></div>`;
  if(lk)body+=`<p class="ms-lock">🔒 ${z===1?"Земли эпох откроются после "+MAP.z1Spins+" прокруток (у тебя "+(S.nOp||0)+")":"Сердце мира откроется, когда дракон дорастёт до 3-й стадии"}</p>`;
  else if(mine)body+=`<p class="ms-sub">Это твой регион · держишь ${tleft(NOW()-r.since)}${r.shield?" · 🛡 щит ещё "+tleft(r.shield-NOW()):""} · отбито атак: ${r.def_n||0}</p><div class="ms-one" id="ms-def"></div>
    <div class="ms-b">${r.statue?'<span class="ms-tag">🗿 Статуя стоит</span>':'<button type="button" class="craftbtn ms-st" id="ms-statue">🗿 Поставить статую · ⭐ '+MAP.statue+'</button>'}<button type="button" class="ghost" id="ms-leave">Покинуть регион</button></div>`;
  else{body+=`<p class="ms-sub">${r.owner?"Правитель: <b>"+escH(r.oname||"?")+"</b>"+(r.shield?" · 🛡 щит ещё "+tleft(r.shield-NOW()):" · щит снят")+(r.def_n?" · устал ×"+r.def_n:""):"Регион свободен — займи его без боя!"}</p>
    <div class="ms-vs"><div id="ms-me"></div>${r.owner?'<b>VS</b><div id="ms-def"></div>':""}</div>
    <div class="ms-pick">${cards.length?cards.map(c=>`<button type="button" class="ms-c${c.id===mapCard?" on":""}" data-mc="${c.id}">${escH(HEROES[c.h][0])}<small>${fmtN(cpow(c))}</small></button>`).join(""):'<small>Нет свободных карточек'+(z===0?" (на окраины — обычные и редкие)":"")+'</small>'}</div>
    ${r.owner&&me?`<div class="ms-st5">${STN.map((n,k)=>`<button type="button" data-ms="${k}" class="${k===mapStat?"on":""}">${n}<b>${Math.round(eff(me,k))}</b></button>`).join("")}</div><div id="ms-ch"></div>`:""}
    <button type="button" class="ms-go" id="ms-go"${!me||r.shield?" disabled":""}>${r.owner?"⚔️ Атаковать "+M[0]:"🏰 Занять "+M[0]}</button><p class="ms-note">${r.owner?"Атак сегодня: "+Math.max(0,MD.att.left)+". Победишь — регион твой и щит на 2 ч. Проиграешь — карточка останется у тебя.":"Воин встанет на охрану региона и будет приносить доход. Его можно вернуть в любой момент."}</p>`}
  sh.innerHTML='<div class="box nickbox mapsh">'+body+'<button type="button" class="ghost" id="ms-x">Закрыть</button></div>';$("ms-x").onclick=closeModal;
  const put=(id,c)=>{const e=$(id);if(e&&c){e.innerHTML="";e.appendChild(bigMc(c,0))}};put("ms-def",r.card);put("ms-me",me);
  if(r.owner&&me&&r.card&&!mine){const C=mapChance(me,r.card,r),ch=$("ms-ch");if(ch)ch.innerHTML=`<div class="ms-bon">${S.dg?`<span>🐉 Твой дракон: +${Math.round(C.dk*100)}%</span>`:'<span>🥚 Без дракона бонуса нет</span>'}${C.home?`<span>🏛 Защитник дома: +15%</span>`:""}${C.fat?`<span>😓 Защитник устал: −${Math.round(C.fat*100)}%</span>`:""}</div><div class="ms-chh"><span>Твой шанс</span><b>${C.p}%</b></div><div class="ms-bar"><s style="width:${C.p}%"></s></div>`}
  sh.onclick=async e=>{const c=e.target.closest("[data-mc]");if(c){mapCard=+c.dataset.mc||c.dataset.mc;hap("light");return mapSheet()}const s=e.target.closest("[data-ms]");if(s){mapStat=+s.dataset.ms;hap("light");return mapSheet()}};
  const go=$("ms-go");if(go)go.onclick=()=>mapAttack(i);const lv=$("ms-leave");if(lv)lv.onclick=async()=>{if(await act("map_leave",{rid:i})){toast("Воин вернулся в коллекцию");closeModal();await mapLoad();mapDraw()}};
  const stt=$("ms-statue");if(stt)stt.onclick=()=>{closeModal();buyItem({item:"mstatue",rid:i})}}
async function mapAttack(i){const go=$("ms-go");if(go)go.disabled=true;const r=await act("map_attack",{rid:i,id:mapCard,stat:mapStat});if(!r){if(go)go.disabled=false;return}
  closeModal();if(r.empty){sfx.fanfare();burst(3);hapN("success");toast("🏰 "+MAP_R[i][0]+" твой! Воин встал на охрану");await mapLoad();mapDraw();return}
  mapFightShow(r,i)}
function mapPassOpen(){const P=S.mpass&&S.mpass.m===new Date(NOW()+3*3600e3).toISOString().slice(0,7)?S.mpass:{pts:0,prem:0,got:[],gotP:[]},lv=MPASS.th.filter(x=>P.pts>=x).length,m=$("modal"),sh=$("msheet");m.hidden=false;
  const rw=R=>R.sp?"+"+R.sp+" 🎴":R.cash?"+"+fmtN(R.cash)+" 🪙":R.runes?"+"+fmtN(R.runes)+" 💠":R.guar?"💎 эпик":R.leg?"⭐ легенда":"";
  sh.innerHTML=`<div class="box nickbox mpass"><h3>🎖 Пропуск завоевателя</h3><p class="cln">Очки: захват +5, отбитая атака +2, сбор дохода +1. У тебя <b>${P.pts}</b> очков · уровень ${lv}/10. Пропуск обновляется каждый месяц.</p>
   <div class="mpg"><div class="mph"><span>ур.</span><span>Бесплатно</span><span>🎖 Премиум</span></div>${MPASS.th.map((t,i)=>{const op=lv>i;return `<div class="mpr${op?" op":""}"><b>${i+1}<small>${t}</small></b>
    <button type="button" data-pc="${i}" ${!op||P.got.includes(i)?"disabled":""}>${P.got.includes(i)?"✅":rw(MPASS.free[i])}</button><button type="button" class="pr" data-pc="${i}" data-pp="1" ${!op||!P.prem||P.gotP.includes(i)?"disabled":""}>${P.gotP.includes(i)?"✅":rw(MPASS.prem[i])+(MPASS.prem[i].flag?" + 🎖 флаг":"")}</button></div>`}).join("")}</div>
   ${P.prem?'<p class="cln">✅ Премиум активен в этом месяце</p>':'<button type="button" class="craftbtn" id="mp-buy">🎖 Открыть премиум · ⭐ '+MPASS.stars+'</button>'}<button type="button" class="ghost" id="mp-x">Закрыть</button></div>`;
  $("mp-x").onclick=closeModal;const b=$("mp-buy");if(b)b.onclick=()=>{closeModal();buyItem({item:"mpass"})};
  sh.onclick=async e=>{const t=e.target.closest("[data-pc]");if(!t||t.disabled)return;t.disabled=true;const r=await act("mpass_claim",{i:+t.dataset.pc,prem:t.dataset.pp?1:0});if(r){sfx.coin();burst(r.card?4:1);toast("🎖 Награда: "+[r.sp?"+"+r.sp+" 🎴":"",r.cash?"+"+fmtN(r.cash)+" 🪙":"",r.runes?"+"+fmtN(r.runes)+" 💠":"",r.guar?"эпик":"",r.card?"легенда "+HEROES[r.card.h][0]:"",r.flag?"флаг завоевателя":""].filter(Boolean).join(", "));mapPassOpen()}else t.disabled=false}}
function mapFlags(){const m=$("modal"),sh=$("msheet");m.hidden=false;const own=S.mflags||[];
  sh.innerHTML=`<div class="box nickbox mflags"><h3>🚩 Флаги над твоими землями</h3><p class="cln">Флаг видят все игроки на карте над каждым твоим регионом.</p><div class="mfg">${Object.keys(MFLAG).map(k=>{const F=MFLAG[k],C=MFC[k],h=own.includes(k),on=S.mflagOn===k;
    return `<div class="mfc${on?" on":""}"><div class="mff" style="background:linear-gradient(90deg,${C[1]} 50%,${C[0]} 50%)">${F.ic}</div><b>${F.n}</b>${h?`<button type="button" data-mf="${on?"":k}">${on?"✓ Поднят":"Поднять"}</button>`:F.pass?'<small>за пропуск</small>':`<button type="button" class="buy" data-mfb="${k}">⭐ ${F.stars}</button>`}</div>`}).join("")}</div>
   ${own.includes("photo")?`<div class="mph2"><b>📸 Твоё фото на флаге</b><small>${MD&&MD.ph===1?"✅ одобрено":MD&&MD.ph===0?"⏳ на проверке":MD&&MD.ph===2?"❌ отклонено — загрузи другое":"загрузи фото — модератор проверит"}</small><label class="craftbtn">Загрузить фото<input type="file" accept="image/*" id="mf-file" hidden></label></div>`:""}<button type="button" class="ghost" id="mf-x">Закрыть</button></div>`;
  $("mf-x").onclick=closeModal;sh.onclick=async e=>{const b=e.target.closest("[data-mfb]");if(b){closeModal();return buyItem({item:"mflag",k:b.dataset.mfb})}const s=e.target.closest("[data-mf]");if(s){if(await act("mflag_set",{k:s.dataset.mf})){sfx.coin();await mapLoad();mapDraw();mapFlags()}}};
  const f=$("mf-file");if(f)f.onchange=()=>{const file=f.files[0];if(!file)return;const im=new Image(),u=URL.createObjectURL(file);im.onload=async()=>{const c=document.createElement("canvas"),W=180,H=120;c.width=W;c.height=H;const x=c.getContext("2d"),s=Math.max(W/im.width,H/im.height);
    x.drawImage(im,(W-im.width*s)/2,(H-im.height*s)/2,im.width*s,im.height*s);URL.revokeObjectURL(u);const r=await act("map_photo",{img:c.toDataURL("image/jpeg",.8)});if(r){toast("📸 Фото отправлено на проверку");await mapLoad();mapFlags()}};im.src=u}}
function mapHelp(){const m=$("modal"),sh=$("msheet");m.hidden=false;sh.innerHTML=`<div class="box nickbox"><h3>🗺 Карта мира — как играть</h3><ul class="dnul">
  <li>🏰 <b>Займи регион</b> — поставь туда воина. Он охраняет землю и приносит монеты и руны каждый час.</li><li>⚔️ <b>Атакуй чужие</b> — 3 атаки в день. Победишь — регион твой и щит на 2 часа.</li>
  <li>🐉 <b>Дракон помогает</b> — чем он сильнее, тем больше бонус к атаке.</li><li>🏛 Воин своей эпохи защищает «родную землю» на 15% сильнее.</li>
  <li>🌱 Окраины открыты всем (обычные и редкие воины), ⚔️ Земли эпох — после ${MAP.z1Spins} прокруток, 👑 Сердце мира — когда дракон дорастёт до 3-й стадии.</li><li>📅 Каждый месяц карта начинается заново.</li></ul><button type="button" class="craftbtn" id="mh-ok">В бой!</button></div>`;$("mh-ok").onclick=closeModal}
{const _ps=payShow;payShow=function(r){if(r&&r.status==="done"&&/^(mflag|mpack|mpass|mstatue)$/.test(r.item)){renderAll();sfx.fanfare();burst(3);hapN("success");
  toast(r.item==="mflag"?"🚩 Флаг поднят над твоими землями!":r.item==="mpack"?"⚔️ +"+MAP.pack+" атаки!":r.item==="mpass"?"🎖 Пропуск завоевателя открыт!":"🗿 Статуя стоит!");if($("mapscr"))mapLoad().then(mapDraw);if(r.item==="mflag"&&r.res&&r.res.k==="photo")setTimeout(mapFlags,600);return}return _ps(r)}}
/* вход: меню «Ещё», плитка на главной, ссылка ?map=1 */
MENU_GROUPS[0][1].unshift({k:"shop",ic:"🛒",n:"Рынок",c:["#9ff7d6","#1a8a7a"]});
{const _mg=menuGo;menuGo=function(k){if(k==="map"){menuClose();hap&&hap("light");return openMap()}return _mg.apply(this,arguments)}}
function mapTile(){let t=$("maptile");const o=$("open");if(!S||!ONLINE||!o){if(t)t.remove();return}if(!t){t=document.createElement("button");t.type="button";t.id="maptile";t.className="maptile";t.onclick=()=>{hap("light");openMap()};
  t.innerHTML='<span class="mt-i">🗺</span><span><b>Карта мира <em>НОВОЕ</em></b><small>захватывай земли воинами · драконы помогают</small></span><i>→</i>';const g=$("gold-go");if(g)g.before(t);else o.parentElement.after(t)}}
{const _ra=renderAll;renderAll=function(){_ra.apply(this,arguments);try{mapTile()}catch(e){}}}
if(new URLSearchParams(location.search).get("map")){const t=setInterval(()=>{if(!S)return;clearInterval(t);setTimeout(openMap,900)},400)}
/* админ: модерация фото флагов */
{const _ds=drawStats;drawStats=function(){_ds.apply(this,arguments);try{const b=$("st-body");if(!b||$("mph-adm"))return;const x=document.createElement("div");x.id="mph-adm";x.className="srcbox";b.appendChild(x);
  act("mph_list").then(r=>{if(!r)return;x.innerHTML='<h4>📸 Фото флагов на проверке ('+r.list.length+')</h4>'+(r.list.length?r.list.map(p=>`<div class="mphr"><img src="${p.img}"><span>${escH(p.name||"?")}<br><small>id ${p.uid}</small></span><button type="button" class="mini2" data-pok="${p.uid}">✅</button><button type="button" class="mini2" data-pno="${p.uid}">❌</button></div>`).join(""):"<small>Пусто</small>");
    x.onclick=async e=>{const a=e.target.closest("[data-pok],[data-pno]");if(!a)return;const ok=!!a.dataset.pok;if(await act(ok?"mph_ok":"mph_no",{uid:+(a.dataset.pok||a.dataset.pno)})){a.closest(".mphr").remove()}}})}catch(e){}}}

/* нижнее меню: «Карта» вместо «Рынка»; кнопка «Донат» под балансом */
$("tab-map").onclick=()=>{hap("light");openMap()};
document.querySelectorAll("nav.tabs button").forEach(b=>{if(b.id!=="tab-map")b.addEventListener("click",()=>{const o=$("mapscr");if(o)o.remove();$("tab-map").setAttribute("aria-selected","false")})});
{const _om=openMap;openMap=async function(){document.querySelectorAll("nav.tabs button").forEach(b=>b.setAttribute("aria-selected",b.id==="tab-map"?"true":"false"));return _om.apply(this,arguments)}}
document.addEventListener("click",e=>{if(e.target.closest('[data-mb="x"]')){$("tab-map").setAttribute("aria-selected","false");try{setTab("spin")}catch(x){}}},true);
$("don-go").onclick=e=>{e.stopPropagation();hap("light");openGold("flex")};
/* админ: статистика карты мира */
{const _ds=drawStats;drawStats=function(){_ds.apply(this,arguments);try{const b=$("st-body");if(!b||$("mapst"))return;const x=document.createElement("div");x.id="mapst";x.className="srcbox mapst";const ph=$("mph-adm");if(ph)ph.before(x);else b.appendChild(x);
  act("map_stats").then(r=>{if(!r)return;const n=v=>fmtN(v||0),row=(t,P)=>`<div class="mst-r"><b>${t}</b><span>${n(P.fights)}<small>боёв</small></span><span>${n(P.caps)}<small>отжато</small></span><span>${n(P.held)}<small>отбито</small></span><span>${n(P.occ)}<small>занято пустых</small></span><span>${n(P.players)}<small>игроков</small></span></div>`;
    const IT={mflag:"🚩 флаги",mpack:"⚔️ +3 атаки",mpass:"🎖 пропуск",mstatue:"🗿 статуи"},stars=(r.pay||[]).reduce((a,p)=>a+(p.s||0),0);
    x.innerHTML=`<h4>🗺 Карта мира</h4>${row("Сегодня",r.today)}${row("7 дней",r.week)}${row("Сезон",r.season)}
     <div class="mst-g"><div><b>${r.occupied}/50</b><small>регионов занято</small></div><div><b>${r.zones[0]} · ${r.zones[1]} · ${r.zones[2]}</b><small>🌱 окраины · ⚔️ эпохи · 👑 сердце</small></div><div><b>${r.statues}</b><small>🗿 статуй</small></div><div><b>${n(stars)} ⭐</b><small>донат с карты за сезон</small></div></div>
     ${(r.pay||[]).length?`<p class="mst-p">${r.pay.map(p=>IT[p.item]+": "+p.n+" шт · "+n(p.s)+" ⭐").join(" · ")}</p>`:""}
     <div class="mst-cols"><div><h5>👑 Правители сейчас</h5>${r.rulers.length?r.rulers.map((u,i)=>`<p>${i+1}. <b>${escH(u.name||"?")}</b> — ${u.n} (${escH(u.reg.join(", "))})</p>`).join(""):"<p>никого</p>"}</div>
      <div><h5>⚔️ Завоеватели сезона</h5>${r.topA.length?r.topA.map((u,i)=>`<p>${i+1}. <b>${escH(u.name||"?")}</b> — отжал ${u.caps||0} из ${u.fights||0} боёв</p>`).join(""):"<p>боёв ещё не было</p>"}</div></div>
     <h5>🔥 Самые горячие регионы</h5><p>${r.hot.length?r.hot.map(h=>escH(h.name)+": "+h.n+" боёв, сменил хозяина "+(h.caps||0)+" раз").join(" · "):"—"}</p>
     <p class="mst-p">📸 фото флагов: ждут проверки ${n(r.ph&&r.ph.wait)}, одобрено ${n(r.ph&&r.ph.ok)}</p>`})}catch(e){}}}
/* ---------- 🔍 найти игрока по нику: витрина и «Написать» ---------- */
MENU_GROUPS[1][1].push({k:"find",ic:"🔍",n:"Найти игрока",c:["#ffe9a8","#c08a0a"]});
{const _mg=menuGo;menuGo=function(k){if(k==="find"){menuClose();hap("light");return findOpen()}return _mg.apply(this,arguments)}}
function fnEsc(t){return String(t||"").replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"})[c])}
function findOpen(){if(!ONLINE)return toast("Поиск работает в игре через Telegram");const m=$("modal"),sh=$("msheet");m.hidden=false;
  sh.innerHTML='<div class="box nickbox fnd"><h3>🔍 Найти игрока</h3><p class="cln">Напиши ник — откроешь витрину игрока и сможешь написать ему</p><input id="fn-q" maxlength="30" autocomplete="off" placeholder="Ник игрока"><div id="fn-l" class="fn-l"></div><button type="button" class="ghost" id="fn-x">Закрыть</button></div>';
  $("fn-x").onclick=closeModal;const i=$("fn-q"),L=$("fn-l");let tm=0,seq=0;
  i.oninput=()=>{clearTimeout(tm);const q=i.value.trim();if(q.length<2){L.innerHTML="";return}tm=setTimeout(async()=>{const my=++seq;const r=await act("pl_find",{q});if(my!==seq||!r)return;
    L.innerHTML=r.list.length?r.list.map(u=>`<button type="button" class="fn-r" data-fu="${u.uid}"><b>${u.vip?"👑 ":""}${fnEsc(u.name)}</b><small>🃏 ${u.n}</small><i>→</i></button>`).join(""):'<p class="cln">Никого не нашли 🤷</p>'},350)};
  L.onclick=async e=>{const b=e.target.closest("[data-fu]");if(!b)return;hap("light");const uid=+b.dataset.fu,r=await act("profile",{uid});if(r){closeModal();openShowcase(Object.assign(r,{p:"u_"+uid}))}};setTimeout(()=>i.focus(),200)}
/* ---------- 💬 чат клана ---------- */
let cmLast=0,cmTm=0;
function cmOpen(){const m=$("modal"),sh=$("msheet");m.hidden=false;cmLast=0;
  sh.innerHTML='<div class="box nickbox cmbox"><div class="cm-h"><h3>💬 Чат клана</h3><button type="button" class="mp-x" id="cm-x">✕</button></div><div class="cm-l" id="cm-l"><p class="cln">Загружаю…</p></div><div class="cm-in"><input id="cm-t" maxlength="200" placeholder="Сообщение клану" autocomplete="off"><button type="button" class="craftbtn" id="cm-go">➤</button></div></div>';
  const stop=()=>{clearInterval(cmTm);cmTm=0};$("cm-x").onclick=()=>{stop();closeModal()};
  const send=async()=>{const t=$("cm-t"),v=t.value.trim();if(!v)return;t.value="";const r=await act("cm_send",{text:v});if(r){hap("light");pull()}else t.value=v};
  $("cm-go").onclick=send;$("cm-t").onkeydown=e=>{if(e.key==="Enter")send()};
  async function pull(){if(!$("cm-l")){stop();return}const r=await act("cm_get",{after:cmLast});if(!$("cm-l"))return;if(!r){if(!cmLast){$("cm-l").innerHTML='<p class="cln">Чат доступен только участникам клана</p>';stop()}return}const L=$("cm-l");if(!cmLast)L.innerHTML=r.list.length?"":'<p class="cln">Пока тихо. Напиши первым! 👋</p>';
    if(r.list.length&&cmLast===0)L.innerHTML="";r.list.forEach(x=>{cmLast=Math.max(cmLast,x.id);const d=document.createElement("div");d.className="cm-m"+(x.uid===r.me?" me":"");d.innerHTML='<b></b><span></span><small>'+new Date(x.t+3*3600e3).toISOString().slice(11,16)+'</small>';d.children[0].textContent=x.name||"?";d.children[1].textContent=x.text;L.appendChild(d)});
    if(r.list.length)L.scrollTop=L.scrollHeight}
  pull();stop();cmTm=setInterval(()=>{if(document.hidden)return;if(!$("cm-l")){stop();return}pull()},4000)}
{const _dc=drawClan;drawClan=function(){_dc.apply(this,arguments);try{const b=$("clan-body");if(!b||!clData||!clData.clan||b.querySelector("#cm-open"))return;const x=document.createElement("button");x.type="button";x.id="cm-open";x.className="cm-open";x.innerHTML="💬 Чат клана<small>пиши своим — видят только участники клана</small>";x.onclick=()=>{hap("light");cmOpen()};b.prepend(x)}catch(e){}}}

/* ---------- 🔍 зум карты: щипок двумя пальцами, перетаскивание, двойной тап, кнопки ＋/－ ---------- */
let MZ={s:1,x:0,y:0},mzMoved=false;
function mzBox(){const w=$("mp-map");return w?w.getBoundingClientRect():null}
function mzClamp(){const b=mzBox();if(!b)return;MZ.s=Math.max(1,Math.min(4,MZ.s));const mx=b.width*(MZ.s-1),my=b.height*(MZ.s-1);MZ.x=Math.min(0,Math.max(-mx,MZ.x));MZ.y=Math.min(0,Math.max(-my,MZ.y))}
let mzRaf=0,mzIdle=0;function mzLive(on){const w=$("mp-map");if(!w)return;clearTimeout(mzIdle);if(on)w.classList.add("mzing");else mzIdle=setTimeout(()=>{const x=$("mp-map");if(x)x.classList.remove("mzing")},320)}
function mzApply(anim){if(anim){cancelAnimationFrame(mzRaf);mzRaf=0;mzLive(true);mzDo(true);mzLive(false);return}if(mzRaf)return;mzLive(true);mzRaf=requestAnimationFrame(()=>{mzRaf=0;mzDo(false)})}
function mzDo(anim){const v=$("mp-svg");if(!v)return;mzClamp();v.style.transition=anim?"transform .28s cubic-bezier(.2,.8,.2,1)":"none";v.style.transform=`translate(${MZ.x}px,${MZ.y}px) scale(${MZ.s})`;const w=$("mp-map");if(w)w.classList.toggle("zoomed",MZ.s>1.02)}
function mzSet(s,x,y,anim){MZ={s,x,y};mzApply(anim)}
function mzZoomAt(f,fx,fy,anim){const b=mzBox();if(!b)return;const px=b.width*fx,py=b.height*fy,ns=Math.max(1,Math.min(4,MZ.s*f)),r=ns/MZ.s;MZ.x=px-(px-MZ.x)*r;MZ.y=py-(py-MZ.y)*r;MZ.s=ns;mzApply(anim)}
{const _md=mapDraw;mapDraw=function(){_md.apply(this,arguments);const w=$("mp-map");if(!w||w._mz)return;w._mz=1;mzDo(false);
  const pts=new Map();let st=null,lastTap=0;
  const snap=()=>{const a=[...pts.values()];const b=mzBox();if(a.length>=2){const cx=(a[0].x+a[1].x)/2-b.left,cy=(a[0].y+a[1].y)/2-b.top;st={pinch:1,d:Math.hypot(a[0].x-a[1].x,a[0].y-a[1].y)||1,cx,cy,s:MZ.s,x:MZ.x,y:MZ.y}}else if(a.length===1)st={pinch:0,px:a[0].x,py:a[0].y,x:MZ.x,y:MZ.y,t0x:a[0].x,t0y:a[0].y};else st=null};
  w.addEventListener("pointerdown",e=>{if(e.target.closest(".mp-zm"))return;pts.set(e.pointerId,{x:e.clientX,y:e.clientY});snap();if(pts.size===1)mzMoved=false},{passive:true});
  w.addEventListener("pointermove",e=>{if(!pts.has(e.pointerId)||!st)return;pts.set(e.pointerId,{x:e.clientX,y:e.clientY});const a=[...pts.values()],b=mzBox();
    if(st.pinch&&a.length>=2){const d=Math.hypot(a[0].x-a[1].x,a[0].y-a[1].y),cx=(a[0].x+a[1].x)/2-b.left,cy=(a[0].y+a[1].y)/2-b.top,ns=Math.max(1,Math.min(4,st.s*d/st.d)),r=ns/st.s;MZ.s=ns;MZ.x=cx-(st.cx-st.x)*r;MZ.y=cy-(st.cy-st.y)*r;mzMoved=true;mzApply(false)}
    else if(!st.pinch){const dx=e.clientX-st.px,dy=e.clientY-st.py;if(Math.abs(e.clientX-st.t0x)+Math.abs(e.clientY-st.t0y)>8)mzMoved=true;if(MZ.s>1.02&&mzMoved){MZ.x=st.x+dx;MZ.y=st.y+dy;mzApply(false)}}},{passive:true});
  const up=e=>{if(!pts.has(e.pointerId))return;pts.delete(e.pointerId);snap();if(!pts.size)mzLive(false);if(!pts.size&&!mzMoved){const now=Date.now(),b=mzBox();if(now-lastTap<300&&!e.target.closest("[data-rg]")){MZ.s>1.5?mzSet(1,0,0,true):mzZoomAt(2.2,(e.clientX-b.left)/b.width,(e.clientY-b.top)/b.height,true);lastTap=0}else lastTap=now}};
  w.addEventListener("pointerup",up);w.addEventListener("pointercancel",up);
  w.addEventListener("wheel",e=>{e.preventDefault();const b=mzBox();mzZoomAt(e.deltaY<0?1.15:1/1.15,(e.clientX-b.left)/b.width,(e.clientY-b.top)/b.height,false);mzLive(false)},{passive:false})}}
{const _om=openMap;openMap=function(){MZ={s:1,x:0,y:0};return _om.apply(this,arguments)}}

/* ---------- ⚔️ битва за регион: красивый бой по раундам ---------- */
function mapFightShow(r,i){const M=MAP_R[i],z=MAP_Z(i),m=$("modal"),sh=$("msheet");m.hidden=false;const reg=(MD&&MD.regs||[]).find(x=>x.id===i)||{},on=String(reg.oname||"Защитник").slice(0,14);
  const B=r.bon||{},chips=[B.dk>0?`🐉 Дракон +${Math.round(B.dk*100)}%`:"",B.ddk>0?`🐲 Дракон врага +${Math.round(B.ddk*100)}%`:"",B.home>0?`🏛 Родная земля врага +${Math.round(B.home*100)}%`:"",B.fat>0?`😮‍💨 Защитник устал −${Math.round(B.fat*100)}%`:""].filter(Boolean);
  const rows=r.rounds.map((x,k)=>`<div class="fx-rd" id="fx-rd${k}"><em>Раунд ${k+1}</em><span>${STN[r.picks[k]]}</span><b class="a">?</b><i>vs</i><b class="b">?</b></div>`).join("");
  sh.innerHTML=`<div class="box mfb z${z}"><div class="fx-bg"></div><div class="fx-sparks"></div>
   <div class="fx-h"><small>⚔️ БИТВА ЗА</small><b>${M[1]} ${M[0]}</b></div>
   <div class="fx-ar"><div class="fx-s me" id="fx-me"><div class="fx-c">${r.me?miniSlot(r.me):""}</div><b>Ты</b><div class="fx-hp"><i id="fx-hpa"></i></div></div>
    <div class="fx-vs"><span id="fx-vs">VS</span><em id="fx-sc">0 : 0</em></div>
    <div class="fx-s op" id="fx-op"><div class="fx-c">${r.opp?miniSlot(r.opp):""}</div><b>${escH(on)}</b><div class="fx-hp"><i id="fx-hpb"></i></div></div><div class="fx-flash" id="fx-fl"></div></div>
   <div class="fx-rds">${rows}</div>${chips.length?`<div class="fx-bon">${chips.map(c=>`<span>${c}</span>`).join("")}</div>`:""}
   <div class="fx-res" id="fx-res"></div><div class="fx-bt"><button type="button" class="ghost" id="fx-skip">⏩ Пропустить</button><button type="button" class="craftbtn" id="mf-ok" hidden>${r.won?"🏰 На карту":"⚔️ Ещё раз"}</button></div></div>`;
  const T=[];let done=false,sa=0,sb=0;const at=(ms,f)=>T.push(setTimeout(f,ms));const box=sh.querySelector(".mfb");
  const count=(el,v)=>{const t0=performance.now(),d=480;const st=()=>{const k=Math.min(1,(performance.now()-t0)/d);el.textContent=Math.round(v*(1-Math.pow(1-k,3)));if(k<1&&!done)requestAnimationFrame(st);else el.textContent=v};st()};
  const round=k=>{const x=r.rounds[k],row=$("fx-rd"+k);if(!row)return;row.classList.add("on");box.classList.remove("mf-hit");void box.offsetWidth;box.classList.add("mf-hit");try{sfx.clash()}catch(e){}hap("medium");
    count(row.querySelector(".a"),x.a);count(row.querySelector(".b"),x.b);
    at(520,()=>{const w=x.a>x.b;row.classList.add(w?"w":"l");w?sa++:sb++;$("fx-sc").textContent=sa+" : "+sb;$("fx-sc").classList.remove("pop");void $("fx-sc").offsetWidth;$("fx-sc").classList.add("pop");
      const L=$(w?"fx-op":"fx-me");L.classList.remove("dmg");void L.offsetWidth;L.classList.add("dmg");$("fx-fl").className="fx-flash "+(w?"g":"r");
      $("fx-hpa").style.width=Math.max(0,100-sb*50)+"%";$("fx-hpb").style.width=Math.max(0,100-sa*50)+"%";try{w?sfx.tick(1):sfx.lock()}catch(e){}})};
  const finish=()=>{if(done)return;done=true;T.forEach(clearTimeout);
    r.rounds.forEach((x,k)=>{const row=$("fx-rd"+k);if(!row)return;row.classList.add("on",x.a>x.b?"w":"l");row.querySelector(".a").textContent=x.a;row.querySelector(".b").textContent=x.b});
    $("fx-sc").textContent=r.w+" : "+r.l;$("fx-hpa").style.width=Math.max(0,100-r.l*50)+"%";$("fx-hpb").style.width=Math.max(0,100-r.w*50)+"%";
    box.classList.add(r.won?"mf-won":"mf-lost");$("fx-res").innerHTML=r.won?`<div class="fx-flag">🚩</div><b>ПОБЕДА!</b><small>${M[0]} теперь твой · воин встал на охрану</small>`:`<b>ЗАЩИТНИК ВЫСТОЯЛ</b><small>Попробуй другого воина или другую характеристику</small>`;
    $("fx-skip").hidden=true;$("mf-ok").hidden=false;if(r.won){try{sfx.fanfare()}catch(e){}burst(4);hapN("success")}else{try{sfx.lose()}catch(e){}hapN("error")}};
  box.classList.add("mf-in");try{sfx.rumble(2)}catch(e){}
  at(650,()=>{box.classList.add("mf-vs");hap("heavy")});r.rounds.forEach((_,k)=>at(1300+k*1250,()=>round(k)));at(1300+r.rounds.length*1250+250,finish);
  $("fx-skip").onclick=finish;$("mf-ok").onclick=async()=>{closeModal();await mapLoad();mapDraw();if(!r.won){mapSel=i;mapSheet()}}}
/* ---------- 👑 Король мира ---------- */
{const _ht=hhTick;hhTick=function(){try{hhKingSet(S&&S.kingHH)}catch(e){}return _ht.apply(this,arguments)}}
{const _fx=fxName;fxName=function(el,prefix,name,uid){_fx.apply(this,arguments);if(S&&S.wking&&uid!=null&&S.wking.uid==uid)el.insertAdjacentHTML("beforeend",' <span class="wkingb">👑 Король мира</span>');return el}}
let KG=null;
const kgLeft=ms=>{ms=Math.max(0,ms);const d=Math.floor(ms/864e5),h=Math.floor(ms/36e5)%24,m=Math.floor(ms/6e4)%60;return d?d+" д "+h+" ч":h?h+" ч "+m+" мин":m+" мин"};
{const _md=mapDraw;mapDraw=function(){_md.apply(this,arguments);const o=$("mapscr");if(!o||o.querySelector("#kg-bar"))return;const leg=o.querySelector(".mp-leg");if(!leg)return;
  const b=document.createElement("button");b.type="button";b.id="kg-bar";b.className="kg-bar";const K=S&&S.wking;
  b.innerHTML=K?`<i>👑</i><span><small>Король мира</small><b></b></span><em>${K.uid===S.uid?"Твой трон →":"Трон →"}</em>`:`<i>👑</i><span><small>Король мира</small><b>Трон свободен</b></span><em>Выборы →</em>`;
  if(K)b.querySelector("b").textContent=K.name;b.onclick=()=>{hap("light");kingOpen()};leg.after(b)}}
/* корона над Тронным залом (Рим) */
{const _ms=mapSVG;mapSVG=function(){let h=_ms.apply(this,arguments);try{const p=MCELLS[0];if(p)h+=`<g pointer-events="none"><circle cx="${p.x+13}" cy="${p.y-12}" r="7.5" fill="#3a1600" stroke="#ffd23f" stroke-width="1.5"/><text x="${p.x+13}" y="${p.y-8.6}" font-size="9" text-anchor="middle">👑</text></g>`}catch(e){}return h}}
async function kingOpen(){if(!ONLINE)return toast("Король мира работает в игре через Telegram");const r=await act("king_get");if(!r)return;KG=r;if(r.king){S.wking={uid:r.king.uid,name:r.king.name}}kingDraw()}
function kingDraw(){const r=KG,m=$("modal"),sh=$("msheet");m.hidden=false;const K=r.king,me=K&&K.uid===S.uid,vote=r.phase==="vote";
  let h=`<div class="box kg"><div class="kg-rays"></div><button type="button" class="kg-x" id="kg-x">✕</button><div class="kg-crown">👑</div><h3>Король мира</h3>`;
  if(K){h+=`<div class="kg-k"><b>${fnEsc(K.name)}</b><small>${K.votes?K.votes+" "+(K.votes%10===1&&K.votes%100!==11?"голос":"голосов")+" · ":""}${K.throne?"🏛 держит Тронный зал":"⚠️ Тронный зал не занят"}</small></div>`;
    if(me){h+=`<div class="kg-me"><div class="kg-tr"><span>💰 Казна</span><b>${fmtN(K.tre||0)} 🪙</b><button type="button" class="craftbtn" id="kg-claim"${(K.tre||0)<1?" disabled":""}>Забрать</button></div><small>Капает ${K.throne?"10":"5"}% с дохода всех земель на карте${K.throne?"":" · займи Рим — станет 10%"}</small>
      <div class="kg-dh">📜 Королевский указ${K.decDone?" — уже был сегодня":""}</div>${K.decDone||r.dec?`<p class="cln kg-dn">${r.dec?"Сейчас идёт: "+HH_T[r.dec.k].ic+" "+HH_T[r.dec.k].n:"Новый указ — завтра"}</p>`:`<div class="kg-dec">${Object.keys(HH_T).map(k=>`<button type="button" data-kd="${k}"><i>${HH_T[k].ic}</i><b>${HH_T[k].n}</b><small>${HH_T[k].d}</small></button>`).join("")}</div><p class="cln">Выбери счастливый час на 30 минут — для всех игроков, все узнают в чате</p>`}</div>`}
    else h+=`<p class="cln kg-hint">⚔️ Захвати у Короля Тронный зал (Рим) — и корона твоя до конца недели</p>`}
  else h+=`<p class="cln kg-hint">Трона ещё нет хозяина. В воскресенье — первые выборы!</p>`;
  h+=`<div class="kg-sec"><div class="kg-sh"><b>${vote?"🗳 Выборы Короля":"⚔️ Гонка завоевателей"}</b><span>${vote?"до конца ":"выборы через "}${kgLeft(r.ends-r.now)}</span></div>`;
  if(!r.list.length)h+=`<p class="cln">${vote?"Кандидатов нет — на этой неделе никто не воевал":"Пока никто не набрал очков. Захватывай регионы — и попадёшь в пятёрку!"}</p>`;
  else{const mx=Math.max(1,...r.list.map(c=>vote?c.votes:c.score));h+=r.list.map((c,i)=>{const v=vote?c.votes:c.score;return `<div class="kg-c${c.uid===S.uid?" me":""}${r.my===c.uid?" my":""}"><i>${["🥇","🥈","🥉","4","5"][i]}</i><span><b>${fnEsc(c.name)}</b><em style="width:${Math.round(v/mx*100)}%"></em></span><small>${vote?v+" 🗳":v+" оч."}</small>${vote?(r.my!=null?(r.my===c.uid?'<u>✅</u>':""):`<button type="button" data-kv="${c.uid}"${r.canVote?"":" disabled"}>Голос</button>`):""}</div>`}).join("")}
  h+=vote?(r.canVote?(r.my!=null?'<p class="cln">Твой голос учтён. Итоги — в понедельник в 00:00</p>':'<p class="cln">1 голос на неделю. Итоги — в понедельник в 00:00</p>'):'<p class="cln">Голосовать можно после 20 прокруток</p>'):'<p class="cln">Очки: захват +5, занять пустой +3, отбитая атака +2, каждый твой регион +3. В воскресенье пятёрка лучших станет кандидатами.</p>';
  h+=`</div><details class="kg-rl"><summary>Что даёт корона?</summary><p>👑 корона у ника на неделю<br>💰 5% с дохода всех земель в казну (10%, если держишь Рим)<br>📜 раз в день — указ: счастливый час для всех<br>⚔️ кто отобьёт у Короля Рим — забирает корону</p></details></div>`;
  sh.innerHTML=h;$("kg-x").onclick=closeModal;const cl=$("kg-claim");if(cl)cl.onclick=async()=>{cl.disabled=true;const x=await act("king_claim");if(x){sfx.coin();burst(2);hapN("success");toast("💰 Из казны: +"+fmtN(x.cash)+" 🪙");kingOpen()}else cl.disabled=false};
  sh.onclick=async e=>{const d=e.target.closest("[data-kd]");if(d){const k=d.dataset.kd;if(!confirm("Объявить «"+HH_T[k].n+"» для всех на 30 минут?"))return;const x=await act("king_decree",{k});if(x){S.kingHH=x;hhKingSet(x);sfx.fanfare();burst(3);hapN("success");toast("📜 Указ объявлен!");try{hhTick()}catch(e){}kingOpen()}return}
    const v=e.target.closest("[data-kv]");if(v&&!v.disabled){v.disabled=true;const x=await act("king_vote",{uid:+v.dataset.kv});if(x){sfx.coin();hapN("success");toast("🗳 Голос отдан!");kingOpen()}else v.disabled=false}}}
/* бой: корона перешла */
{const _mf=mapFightShow;mapFightShow=function(r,i){_mf.apply(this,arguments);if(r.crown){const t=setInterval(()=>{const x=$("fx-res");if(!x){clearInterval(t);return}if(x.innerHTML){clearInterval(t);x.insertAdjacentHTML("beforeend",'<div class="kg-won">👑 ТЫ ЗАБРАЛ КОРОНУ! Теперь ты — Король мира</div>');S.wking={uid:S.uid,name:S.name};burst(5)}},200)}}}
{const _sh=mapSheet;mapSheet=function(){_sh.apply(this,arguments);try{if(mapSel!==0)return;const b=document.querySelector("#msheet .ms-h");if(b&&!document.querySelector(".kg-th"))b.insertAdjacentHTML("afterend",'<div class="kg-th">👑 <b>Тронный зал.</b> Король, который держит Рим, получает 10% казны вместо 5%. Отбей Рим у Короля — и корона твоя до конца недели!</div>')}catch(e){}}}

/* ---------- 🧩 половинки: понятная причина, почему не собираются, и сборка прямо из меню карточки ---------- */
function compBusy(c){if(c.listed)return "выставлена на рынке";if(c.lock)return "сейчас в бою на арене";if(c.away){const d=String(c.dest||"");if(d.startsWith("map:"))return "охраняет регион на карте";if(typeof DEST!=="undefined"&&DEST[d])return "в походе «"+DEST[d].k+"»";return "сейчас занята"}return ""}
function compWhy(h){const H=compHave(h),n=HEROES[h][0];if(H.ok)return "";if(!H.L.length&&!H.R.length)return "Нет половинок воина «"+n+"»";
  if(!H.L.length)return "Не хватает левой половинки «"+n+"» ◧";if(!H.R.length)return "Не хватает правой половинки «"+n+"» ◨";
  const fl=H.L.filter(c=>!away(c)),fr=H.R.filter(c=>!away(c));
  const tip=c=>c.listed?" — сними её с продажи на рынке, и сразу соберёшь":c.lock?" — дождись конца боя":String(c.dest||"").startsWith("map:")?" — уведи её из региона на карте, и сразу соберёшь":" — дождись, когда вернётся, и сразу соберёшь";
  if(!fl.length)return "Левая половинка "+compBusy(H.L[0])+tip(H.L[0]);if(!fr.length)return "Правая половинка "+compBusy(H.R[0])+tip(H.R[0]);
  return "Отделка не совпадает: «Ошибка печати» собирается только со второй «Ошибкой печати», обычная — с обычной"}
async function compGo(h){const why=compWhy(h);if(why){hapN("error");toast("🧩 "+why);return false}const r=await act("assemble",{h});if(!r)return false;sfx.coin();burst(4);hapN("success");try{renderGold()}catch(e){}showGrant({cards:[r.card]},"🧩 Воин собран!");return true}
{const _cm=cardMenu;cardMenu=function(c){_cm.apply(this,arguments);if(!c.part)return;const b=$("cm-view");if(!b)return;const why=compWhy(c.h);
  b.textContent=why?"🧩 Как собрать воина":"🧩 Соединить половинки";if(why)b.insertAdjacentHTML("afterend",'<p class="cln cmp-why">'+escH(why)+'</p>');
  b.onclick=async()=>{if(compWhy(c.h)){closeModal();openGold("comp");return}closeModal();await compGo(c.h)}}}

/* 🧩 баннер над коллекцией и кнопка в окне карточки, когда есть пара половинок */
{const _rc=renderCol;renderCol=function(){_rc.apply(this,arguments);try{const box=$("col");if(!box||colPick)return;const old=$("asm-ban");if(old)old.remove();const rd=COMP.filter(h=>compHave(h).ok);if(!rd.length)return;
  const b=document.createElement("div");b.id="asm-ban";b.className="asm-ban";b.innerHTML='<i>🧩</i><span><b>Можно собрать воина!</b><small>'+rd.map(h=>escH(HEROES[h][0])).join(", ")+' — есть обе половинки</small></span>';
  const go=document.createElement("button");go.type="button";go.textContent="Собрать";go.onclick=async()=>{hap("medium");go.disabled=true;if(await compGo(rd[0]))renderCol();else go.disabled=false};b.appendChild(go);box.before(b)}catch(e){}}}
{const _cv=openCardView;openCardView=function(c,o){_cv.apply(this,arguments);try{if(!c||!c.part||!(o&&o.mine))return;const info=document.querySelector("#msheet .cv-info");if(!info)return;const why=compWhy(c.h);
  const w=document.createElement("div");w.className="cv-asm";if(!why){w.innerHTML='<button type="button" class="craftbtn">🧩 Соединить половинки</button>';w.firstChild.onclick=async()=>{closeModal();if(await compGo(c.h))try{renderCol()}catch(e){}}}
  else w.innerHTML='<p class="cmp-why">🧩 '+escH(why)+'</p>';info.prepend(w)}catch(e){}}}

/* 🎬 админ: ники новичков за день — для видео */
{const _ds=drawStats;drawStats=function(){_ds.apply(this,arguments);try{const b=$("st-body");if(!b||$("nbx"))return;const x=document.createElement("div");x.id="nbx";x.className="srcbox nbx";b.prepend(x);
  const load=async day=>{x.innerHTML='<b>🎬 Ники новичков</b><p class="cln">Загружаю…</p>';const r=await act("adm_newbies",{day});if(!r){x.innerHTML='<b>🎬 Ники новичков</b><p class="cln">Не загрузилось</p>';return}
    x.innerHTML=`<div class="nb-h"><b>🎬 Ники новичков · ${r.day}</b><span><button type="button" data-nd="-1">Вчера</button><button type="button" data-nd="0">Сегодня</button></span></div><p class="cln">Пришло ${r.total}, с ником ${r.nicks.length}${r.total>r.nicks.length?" (остальные ещё не выбрали ник)":""}</p><textarea readonly rows="5"></textarea><button type="button" class="craftbtn" id="nb-cp">📋 Скопировать список</button>`;
    const t=x.querySelector("textarea");t.value=(r.best||[]).map(b=>b.nick+(b.hero?" — "+b.hero+" ("+b.tier+(b.fin?", "+b.fin:"")+")":"")).join("\n");x.querySelectorAll("[data-nd]").forEach(z=>z.onclick=()=>load(+z.dataset.nd));
    $("nb-cp").onclick=async()=>{try{await navigator.clipboard.writeText(t.value);toast("📋 Скопировано: "+r.nicks.length+" ников")}catch(e){t.select();document.execCommand("copy");toast("📋 Скопировано")}}};
  load(-1)}catch(e){}}}

/* ---------- 💎 розыгрыш сундуков: друг = билет, TikTok = +1 билет ---------- */
{const _dc=drawChal;drawChal=function(){_dc.apply(this,arguments);try{const C=chData,box=$("chal");if(!C||!C.chest||!box)return;box.classList.add("chestc");
  const hm=t=>new Date(t+3*3600e3).toISOString().slice(11,16),dd=t=>new Date(t+3*3600e3).toISOString().slice(5,10).split("-").reverse().join(".");
  box.querySelector(".chal-h span").textContent=C.xbal?"💎 РОЗЫГРЫШ СУНДУКОВ · 5 МЕСТ":"💎 РОЗЫГРЫШ 3 СУНДУКОВ · $70";
  $("chal-t").innerHTML=C.phase==="soon"?'Старт <b>'+dd(C.start)+' в '+hm(C.start)+'</b>':'<b>Каждый друг = 1 билет.</b> Нет друзей? Сними видео с игрой в TikTok — <b>+1 билет</b>. Итоги <b>'+dd(C.end)+' в '+hm(C.end)+'</b>';
  $("chal-p").innerHTML=(C.chests||[]).map((x,k)=>`<button type="button" class="chz chz${k}" data-chz="${k}"><i>${x.ic}</i><span><b>${["🥇","🥈","🥉"][k]} ${fnEsc(x.n)}</b><small>${x.d.length} ${plural(x.d.length,"награда","награды","наград")} внутри · нажми</small></span><em>${x.usd}</em></button>`).join("")+(C.xbal?C.xbal.map((v,k)=>v?k:-1).filter(k=>k>=0).length?`<div class="chz-x">🎖 ${C.xbal.map((v,k)=>v?k+1:0).filter(Boolean).join(" и ")} место — по ${Math.max(...C.xbal)} ⭐ на баланс в игре</div>`:"":"");
  $("chal-p").onclick=e=>{const b=e.target.closest("[data-chz]");if(b){hap("light");chestInfo(+b.dataset.chz)}};
  const T=C.tt||{st:-1};let w=$("tt-box");if(!w){w=document.createElement("div");w.id="tt-box";w.className="tt-box";const me=$("chal-me");if(me)me.after(w)}
  if(C.phase!=="on"){w.hidden=true}else{w.hidden=false;
    w.innerHTML=T.st===1?'<b>🎬 Видео в TikTok засчитано — +1 билет ✅</b>':T.st===0?'<b>🎬 Видео на проверке ⏳</b><small>Как только проверим — билет придёт, бот напишет</small>':
      '<b>🎬 Нет друзей? Сними TikTok!</b><small>'+(T.st===2?"❌ Прошлое видео не засчитали: нужна игра в кадре и открытый профиль. ":"")+'Сними видео с игрой «Воины Эпох», выложи в TikTok и вставь ссылку — получишь +1 билет после проверки</small><div class="tt-in"><input id="tt-url" placeholder="https://vm.tiktok.com/…" inputmode="url" autocomplete="off"><button type="button" id="tt-go">Отправить</button></div>';
    const g=$("tt-go");if(g)g.onclick=async()=>{const u=$("tt-url").value.trim();if(!u)return toast("Вставь ссылку на видео");g.disabled=true;const r=await act("tt_send",{url:u});if(r){hapN("success");toast("🎬 Отправлено на проверку!");chData.tt={st:0,url:u};drawChal()}else g.disabled=false}}
  const rl=$("chal-rules");if(rl)rl.textContent="Билет — за каждого нового игрока, который пришёл по твоей ссылке с "+dd(C.start)+" "+hm(C.start)+" до "+dd(C.end)+" "+hm(C.end)+" (по Минску) и открыл хотя бы "+C.need+" карточки. За видео с игрой в TikTok — +1 билет после проверки (одно видео на человека). От 1 билета ты участник. В "+hm(C.end)+" бот случайно выбирает "+(C.xbal?"пять":"трёх")+" разных победителей: чем больше билетов, тем выше шанс. Сундуки открываются у победителей в игре автоматически"+(C.xbal?", звёзды за 4–5 место приходят на баланс":"")+". Накрутка ботами и пустыми аккаунтами — бан и отмена приза."}catch(e){}}}
function chestInfo(k){const C=chData,x=C&&C.chests&&C.chests[k];if(!x)return;const m=$("modal"),sh=$("msheet");m.hidden=false;
  sh.innerHTML=`<div class="box nickbox chinfo chz${k}"><div class="chi-rays"></div><div class="chi-ic">${x.ic}</div><h3>${fnEsc(x.n)}</h3><div class="chi-usd">≈ ${x.usd}</div><ul>${x.d.map(t=>"<li>"+fnEsc(t)+"</li>").join("")}</ul><p class="cln">${["🥇 1","🥈 2","🥉 3"][k]} место в розыгрыше. Сундук откроется у победителя в игре сам</p><button type="button" class="craftbtn" id="chi-go">👥 Позвать друзей</button><button type="button" class="ghost" id="chi-x">Закрыть</button></div>`;
  $("chi-x").onclick=closeModal;$("chi-go").onclick=()=>{closeModal();const g=$("chal-go");if(g)g.click()}}
/* один раз — большое окно про сундуки */
setInterval(()=>{try{const C=chData;if(!C||!C.chest||C.phase!=="on"||!S||!ONLINE||(S.nOp||0)<3||document.hidden||$("onb")||document.querySelector(".modal:not([hidden]),.hhpop"))return;const key="we-chest-"+C.id;let seen="";try{seen=localStorage.getItem(key)}catch(e){}if(seen)return;try{localStorage.setItem(key,1)}catch(e){}
  const m=$("modal"),sh=$("msheet");m.hidden=false;sfx.fanfare();burst(3);const X=C.chests||[];
  sh.innerHTML='<div class="box nickbox chpop"><div class="chi-rays"></div><div class="bigk">💎 РОЗЫГРЫШ</div><div class="chp-ic">💎</div><div class="chp-n">'+fnEsc(X[0]?X[0].n:"")+'</div><div class="chp-u">на '+(X[0]?X[0].usd:"")+'</div><div class="bigrow">'+X.slice(1).map((x,k)=>'<div><b>'+["🥈","🥉"][k]+" "+x.ic+'</b><small>'+fnEsc(x.n)+" · "+x.usd+'</small></div>').join("")+'</div>'+
    '<div class="bigrule"><b>Каждый друг = 1 билет</b><span>Нет друзей — сними TikTok с игрой: +1 билет</span></div><button type="button" class="hhbtn" id="chp-go">🎟 Участвовать</button><button type="button" class="hhx" id="chp-x">Позже</button></div>';
  $("chp-go").onclick=()=>{closeModal();setTab("spin");setTimeout(()=>{const b=$("chal");if(b)b.scrollIntoView({block:"center"})},300)};$("chp-x").onclick=closeModal}catch(e){}},4000);
/* админ: проверка TikTok-видео */
{const _ds=drawStats;drawStats=function(){_ds.apply(this,arguments);try{const b=$("st-body");if(!b||$("ttadm"))return;const x=document.createElement("div");x.id="ttadm";x.className="srcbox ttadm";const nb=$("nbx");if(nb)nb.after(x);else b.prepend(x);
  const load=async()=>{const r=await act("tt_list");if(!r){x.remove();return}const L=r.list||[];
    x.innerHTML='<b>🎬 TikTok-заявки</b>'+(L.length?L.map(t=>`<div class="tta-r st${t.st}"><span><b>${fnEsc(t.name||"?")}</b><a href="${fnEsc(t.url)}" target="_blank" rel="noopener">${fnEsc(t.url)}</a></span>${t.st===0?`<button type="button" data-tok="${t.uid}">✅</button><button type="button" data-tno="${t.uid}">❌</button>`:t.st===1?"<i>✅</i>":"<i>❌</i>"}</div>`).join(""):'<p class="cln">Заявок пока нет</p>');
    x.querySelectorAll("a").forEach(a=>a.onclick=e=>{e.preventDefault();try{tg&&tg.openLink?tg.openLink(a.href):open(a.href)}catch(_){open(a.href)}});
    x.onclick=async e=>{const o=e.target.closest("[data-tok],[data-tno]");if(!o)return;o.disabled=true;const ok=o.dataset.tok;if(await act(ok?"tt_ok":"tt_no",{uid:+(ok||o.dataset.tno)})){toast(ok?"✅ Засчитано — игроку +1 билет":"❌ Отклонено");load()}else o.disabled=false}};
  load()}catch(e){}}}

/* ---------- 🎥 режим эфира: «открываю за тебя» (только админ) ---------- */
MENU_GROUPS[0][1].push({k:"live",ic:"🎥",n:"Эфир",c:["#ff7a8a","#c0102a"]});
{const _mo=menuOpen;menuOpen=function(){_mo.apply(this,arguments);if(!(S&&S.admin))document.querySelectorAll('.drw-i[data-go="live"]').forEach(b=>b.remove())}}
{const _mg=menuGo;menuGo=function(k){if(k==="live"){menuClose();return liveOpen()}return _mg.apply(this,arguments)}}
let LV=null;
function liveOpen(){if(!S||!S.admin)return;let o=$("lvscr");if(!o){o=document.createElement("div");o.id="lvscr";o.className="lvscr";document.body.appendChild(o)}o.hidden=false;liveForm()}
function liveForm(last){const o=$("lvscr");o.innerHTML=`<div class="lv-top"><button type="button" class="lv-x" id="lv-x">✕</button><b><i class="lv-rec"></i> РЕЖИМ ЭФИРА</b></div>
  <div class="lv-brand">⚔️ Игра в Telegram · <b>Воины Эпох</b></div><div class="lv-hero"><div class="lv-ic">🎁</div><h2>Открываю за тебя</h2><p>Напиши ник в комментариях — открою карточку для тебя</p></div>
  <div class="lv-in"><input id="lv-nm" maxlength="32" placeholder="Ник зрителя из комментариев" autocomplete="off"><button type="button" id="lv-go">🎁 Открыть для него</button></div>
  <button type="button" class="lv-wbtn" id="lv-wh">🎡 Колесо зрителей</button><div class="tt-box2" id="tt-box2"></div>
  <div class="lv-hl"><b>Выдано за эфир</b><div id="lv-list"><p class="lv-mut">Загружаю…</p></div></div>`;$("lv-wh").onclick=()=>{hap("light");wheelForm()};ttBox();
  $("lv-x").onclick=()=>{o.hidden=true};const i=$("lv-nm"),go=async()=>{const n=i.value.trim();if(!n){i.focus();return}$("lv-go").disabled=true;const r=await act("live_open",{name:n});$("lv-go").disabled=false;if(r)liveShow(r)};
  $("lv-go").onclick=go;i.onkeydown=e=>{if(e.key==="Enter")go()};liveList()}
async function liveList(){const r=await act("live_list"),L=$("lv-list");if(!r||!L)return;
  L.innerHTML=r.list.length?r.list.map(x=>`<div class="lv-r${x.got?" got":x.exp?" exp":""}"><span><b>@${fnEsc(x.name)}</b><small>${x.h!=null?HEROES[x.h][0]+" · "+HT[HEROES[x.h][2]].k+(x.f?" · "+FIN[x.f].k:""):"?"}${x.sp?" · +"+x.sp+" 🎴":""}</small></span><em>${x.got?"✅ "+fnEsc(x.who||"забрал"):x.exp?"⌛ истёк":x.code}</em></div>`).join(""):'<p class="lv-mut">Пока никому не открывали</p>'}
function liveShow(r){const o=$("lvscr"),t=HEROES[r.card.h][2],rar=HT[t].k,col=HT[t].c,big=t>=3;
  o.innerHTML=`<div class="lv-show t${t}" style="--rc:${col}"><div class="lv-rays"></div><div class="lv-brand">⚔️ Игра в Telegram · <b>Воины Эпох</b></div><div class="lv-for">🎁 Карточка для</div><div class="lv-nick">@${fnEsc(r.name)}</div>
   <div class="lv-stage"><div class="lv-back">⚔️<small>ВОИНЫ ЭПОХ</small></div><div class="lv-card">${miniSlot(r.card)}</div></div>
   <div class="lv-rar">${rar.toUpperCase()}${r.card.f?" · "+FIN[r.card.f].k:""}</div><div class="lv-sp">+${r.sp} 🎴 прокруток</div>
   <div class="lv-code"><small>КОД — введи в игре → «Промокод»</small><b>${r.code}</b><span>действует 48 часов · @VoinyEpohBot</span></div>
   <button type="button" class="lv-next" id="lv-next">Следующий зритель →</button></div>`;
  const s=o.querySelector(".lv-show");sfx.rumble&&sfx.rumble(2);setTimeout(()=>{s.classList.add("flip");big?(sfx.fanfare(),burst(5)):sfx.coin();hapN("success")},1300);setTimeout(()=>s.classList.add("info"),2100);
  $("lv-next").onclick=()=>liveForm()}

/* ---------- 🎡 колесо зрителей ---------- */
let WN=[];try{WN=JSON.parse(localStorage.getItem("we-wheel")||"[]")}catch(e){}
const wSave=()=>{try{localStorage.setItem("we-wheel",JSON.stringify(WN))}catch(e){}};
const WHC=["#ff4d6d","#ffb020","#3bdc7a","#2aabee","#a66bff","#ff7ad9","#20c9b0","#ff8a3d"];
function wheelForm(){const o=$("lvscr");o.innerHTML=`<div class="lv-top"><button type="button" class="lv-x" id="lv-bk">←</button><b><i class="lv-rec"></i> КОЛЕСО ЗРИТЕЛЕЙ</b></div>
  <div class="lv-brand">⚔️ Игра в Telegram · <b>Воины Эпох</b></div>
  <div class="lv-hero"><div class="lv-ic">🎡</div><h2>Пиши в чат — попадёшь на колесо</h2><p>Победитель получит карточку и прокрутки</p></div>
  <div class="lv-in"><input id="w-nm" maxlength="32" placeholder="Ник из чата → Enter" autocomplete="off"><button type="button" id="w-add">➕ Добавить</button></div>
  <div class="w-chips" id="w-chips"></div><div class="w-cnt" id="w-cnt"></div>
  <label class="w-auto"><input type="checkbox" id="w-auto"${WAUTO?" checked":""}> 🤖 Сам добавлять всех, кто пишет в чат TikTok</label><div class="tt-feed" id="tt-feed"></div><button type="button" class="lv-wbtn big" id="w-go">🎡 КРУТИТЬ</button><button type="button" class="lv-next w-clr" id="w-clr">Очистить список</button>`;
  $("lv-bk").onclick=()=>liveForm();const i=$("w-nm");
  const draw=()=>{$("w-chips").innerHTML=WN.map((n,k)=>`<span class="w-chip" style="--c:${WHC[k%WHC.length]}">@${fnEsc(n)}<button type="button" data-wr="${k}">✕</button></span>`).join("")||'<p class="lv-mut">Добавь хотя бы 2 ника</p>';$("w-cnt").textContent=WN.length?"На колесе: "+WN.length:"";$("w-go").disabled=WN.length<2};
  const add=()=>{const v=i.value.trim().replace(/^@/,"").slice(0,32);if(!v)return;if(!WN.some(x=>x.toLowerCase()===v.toLowerCase())&&WN.length<40)WN.push(v);i.value="";wSave();draw();i.focus()};
  $("w-add").onclick=add;i.onkeydown=e=>{if(e.key==="Enter")add()};$("w-chips").onclick=e=>{const b=e.target.closest("[data-wr]");if(b){WN.splice(+b.dataset.wr,1);wSave();draw()}};
  $("w-clr").onclick=()=>{if(confirm("Очистить список ников?")){WN=[];wSave();draw()}};$("w-auto").onchange=e=>{WAUTO=e.target.checked;try{localStorage.setItem("we-wauto",WAUTO?"1":"0")}catch(_){}};window.__wdraw=draw;ttFeedDraw();$("w-go").onclick=()=>wheelSpin();draw();setTimeout(()=>i.focus(),200)}
function wheelSpin(){const o=$("lvscr"),N=WN.slice(),n=N.length;if(n<2)return;
  o.innerHTML=`<div class="w-stage"><div class="lv-brand">⚔️ Игра в Telegram · <b>Воины Эпох</b></div><div class="w-title">🎡 КОЛЕСО ЗРИТЕЛЕЙ</div><div class="w-wrap"><div class="w-ptr"></div><canvas id="w-cv" width="720" height="720"></canvas><div class="w-hub">⚔️</div></div><div class="w-win" id="w-win"></div><div class="w-btns" id="w-btns"></div></div>`;
  const cv=$("w-cv"),x=cv.getContext("2d"),R=350,seg=Math.PI*2/n,rnd=new Uint32Array(1);crypto.getRandomValues(rnd);const win=rnd[0]%n;
  // указатель сверху (угол -90°). Конечный поворот: центр сектора победителя под указателем + несколько оборотов
  const target=Math.PI*2*(6+Math.floor(Math.random()*3))-(win+.5+(Math.random()-.5)*.6)*seg,T=6200;let t0=null,lastSeg=-1;
  const paint=a=>{x.clearRect(0,0,720,720);x.save();x.translate(360,360);for(let k=0;k<n;k++){x.beginPath();x.moveTo(0,0);x.arc(0,0,R,a+k*seg-Math.PI/2,a+(k+1)*seg-Math.PI/2);x.closePath();x.fillStyle=WHC[k%WHC.length];x.fill();x.strokeStyle="#1a0c30";x.lineWidth=4;x.stroke();
      x.save();x.rotate(a+(k+.5)*seg-Math.PI/2);x.textAlign="right";x.textBaseline="middle";x.fillStyle="#fff";x.font=`900 ${Math.max(18,Math.min(38,260/Math.max(6,N[k].length)+(n<8?6:0)))}px Rubik,system-ui,sans-serif`;x.shadowColor="rgba(0,0,0,.6)";x.shadowBlur=6;x.fillText(N[k].slice(0,16),R-26,0);x.restore()}
    x.beginPath();x.arc(0,0,R,0,Math.PI*2);x.lineWidth=14;x.strokeStyle="#ffd23f";x.stroke();x.restore()};
  const fr=ts=>{if(t0==null)t0=ts;const k=Math.min(1,(ts-t0)/T),e=1-Math.pow(1-k,4),a=target*e;paint(a);
    const cur=Math.floor(((((-a)%(Math.PI*2))+Math.PI*2)%(Math.PI*2))/seg);if(cur!==lastSeg){lastSeg=cur;try{sfx.tick&&sfx.tick(k>.8)}catch(_){}if(k>.85)hap("light")}
    if(k<1)requestAnimationFrame(fr);else done()};
  const done=()=>{const fin=Math.floor(((((-target)%(Math.PI*2))+Math.PI*2)%(Math.PI*2))/seg);if(fin!==win)console.warn("wheel mismatch",fin,win);sfx.fanfare();burst(5);hapN("success");$("w-win").innerHTML=`<small>ПОБЕДИТЕЛЬ</small><b>@${fnEsc(N[win])}</b>`;$("w-win").classList.add("on");
    $("w-btns").innerHTML=`<button type="button" class="lv-wbtn big" id="w-open">🎁 Открыть карточку для @${fnEsc(N[win])}</button><button type="button" class="lv-next" id="w-again">🎡 Ещё раз (без победителя)</button><button type="button" class="lv-next" id="w-back">← К списку</button>`;
    $("w-open").onclick=async()=>{$("w-open").disabled=true;const r=await act("live_open",{name:N[win]});if(r){WN=WN.filter(z=>z!==N[win]);wSave();liveShow(r);const nb=$("lv-next");if(nb){nb.textContent="🎡 К колесу →";nb.onclick=()=>wheelForm()}}else $("w-open").disabled=false};
    $("w-again").onclick=()=>{WN=WN.filter(z=>z!==N[win]);wSave();WN.length>=2?wheelSpin():wheelForm()};$("w-back").onclick=()=>wheelForm()};
  paint(0);setTimeout(()=>requestAnimationFrame(fr),400)}

/* ---------- 🎥 чат TikTok в режиме эфира: лента + автодобавление на колесо ---------- */
let WAUTO=true;try{WAUTO=localStorage.getItem("we-wauto")!=="0"}catch(e){}
let TT={st:null,last:0,feed:[],tm:0,busy:false};
function ttUser(){try{return localStorage.getItem("we-tt")||""}catch(e){return ""}}
function ttBox(){const b=$("tt-box2");if(!b)return;const st=TT.st||{state:"off"},on=st.state==="on",cl={on:"#3bdc7a",connecting:"#ffb020",error:"#ff4d5d",nolib:"#ff4d5d",lost:"#ffb020",ended:"#8f9bb3",off:"#8f9bb3"}[st.state]||"#8f9bb3";
  const tx={on:"читаю чат @"+st.user+" · "+(st.n||0)+" сообщ.",connecting:"подключаюсь к @"+st.user+"…",error:"ошибка",nolib:"не установлена библиотека",lost:"связь потеряна — подключи снова",ended:"эфир закончился",off:"чат не подключён"}[st.state]||st.state;
  b.innerHTML=`<b>💬 Чат TikTok</b><div class="tt-row"><input id="tt-u" placeholder="твой ник в TikTok" value="${fnEsc(ttUser())}" autocomplete="off"><button type="button" id="tt-go">${on?"Отключить":"Подключить"}</button></div>
   <div class="tt-st"><i style="background:${cl};box-shadow:0 0 8px ${cl}"></i>${fnEsc(tx)}</div>${st.err&&!on?`<div class="tt-err">${fnEsc(st.err)}</div>`:""}<div class="tt-feed" id="tt-feed"></div>`;
  $("tt-go").onclick=async()=>{const u=$("tt-u").value.trim().replace(/^@/,"");try{localStorage.setItem("we-tt",u)}catch(e){}$("tt-go").disabled=true;
    const r=await act("live_tt",on?{op:"stop"}:{op:"start",user:u});if(r){TT.st=r;if(r.state==="on"){hapN("success");toast("🟢 Чат @"+r.user+" подключён")}}ttBox()};ttFeedDraw()}
function ttFeedDraw(){const f=$("tt-feed");if(!f)return;const L=TT.feed.slice(-7);f.innerHTML=L.length?L.map(m=>`<div class="tt-m ${m.kind}">${m.pic?`<img src="${fnEsc(m.pic)}" alt="">`:`<i>${fnEsc((m.nick||"?")[0])}</i>`}<span><b>${fnEsc(m.nick)}</b> ${m.kind==="gift"?"🎁 "+fnEsc(m.text):m.kind==="join"?"зашёл на эфир":fnEsc(m.text)}</span></div>`).join(""):'<p class="lv-mut">Здесь появятся комментарии с эфира</p>'}
async function ttPoll(){const o=$("lvscr");if(!o||o.hidden||!S||!S.admin){clearInterval(TT.tm);TT.tm=0;return}if(TT.busy)return;TT.busy=true;
  try{const r=await act("live_feed",{after:TT.last});if(r){const pst=TT.st&&TT.st.state;TT.st=r.tt;if(r.last!=null&&!TT.last){TT.last=r.last;TT.feed=r.rows||[]}else for(const m of r.rows||[]){TT.last=Math.max(TT.last,m.id);TT.feed.push(m);
      if(WAUTO&&(m.kind==="chat"||m.kind==="gift")){const nm=(m.nick||m.uid||"").trim().slice(0,32);if(nm&&!WN.some(x=>x.toLowerCase()===nm.toLowerCase())&&WN.length<40){WN.push(nm);wSave();if(window.__wdraw&&$("w-chips"))window.__wdraw()}}}
    if(TT.feed.length>60)TT.feed=TT.feed.slice(-60);ttFeedDraw();const sb=$("tt-box2");if(sb&&r.tt&&r.tt.state!==pst)ttBox();else if(sb){const s2=sb.querySelector(".tt-st");if(s2&&r.tt&&r.tt.state==="on")s2.lastChild.textContent="читаю чат @"+r.tt.user+" · "+(r.tt.n||0)+" сообщ."}}}catch(e){}TT.busy=false}
{const _lo=liveOpen;liveOpen=function(){_lo.apply(this,arguments);if(!TT.tm){TT.last=0;TT.tm=setInterval(ttPoll,1500);ttPoll()}}}
/* ---------- 🔥 акция «3 друга → VIP + x2» ---------- */
function r3Left(){const R=S&&S.ref3;if(!R)return "";const ms=Math.max(0,R.end-NOW()),h=Math.floor(ms/36e5),m=Math.floor(ms/6e4)%60,s=Math.floor(ms/1e3)%60;return h+":"+String(m).padStart(2,"0")+":"+String(s).padStart(2,"0")}
function r3Invite(){hap("light");sendLink("Залетай в «Воины Эпох» — открывай карточки воинов, собирай легенды и сражайся! Это игра прямо в Telegram 👇",linkFor("r_"+S.uid))}
function r3Strip(){let b=$("r3strip");const R=S&&ONLINE?S.ref3:null;if(!R||R.end<=NOW()){if(b)b.remove();return}
  if(!b){const hd=$("cstrip")||document.querySelector("header");if(!hd)return;b=document.createElement("button");b.type="button";b.id="r3strip";b.className="r3strip";hd.after(b);b.onclick=()=>{if(S.ref3&&S.ref3.got)return toast("✅ Акция выполнена: VIP уже у тебя");r3Invite()}}
  const n=Math.min(3,R.n||0);b.classList.toggle("done",!!R.got);
  b.innerHTML=R.got?`<i>🎉</i><span><b>Акция выполнена!</b><small>👑 VIP включён — корона у тебя</small></span><em>${r3Left()}</em>`:
    `<i>🔥</i><span><b>3 друга → 👑 VIP-статус</b><small><u>${[0,1,2].map(k=>`<s class="${k<n?"y":""}"></s>`).join("")}</u> друзья ${n}/3 · жми, чтобы позвать</small></span><em>${r3Left()}</em>`}
setInterval(()=>{try{r3Strip()}catch(e){}},1000);
/* один раз — окно про акцию */
setInterval(()=>{try{const R=S&&S.ref3;if(!R||R.got||R.end<=NOW()||!ONLINE||(S.nOp||0)<3||document.hidden||$("onb")||document.querySelector(".modal:not([hidden]),.hhpop,#lvscr:not([hidden])"))return;const key="we-r3-"+R.end;let seen="";try{seen=localStorage.getItem(key)}catch(e){}if(seen)return;try{localStorage.setItem(key,1)}catch(e){}
  const m=$("modal"),sh=$("msheet");m.hidden=false;sfx.fanfare();burst(3);
  sh.innerHTML=`<div class="box nickbox r3pop"><div class="kg-rays"></div><div class="r3-fire">🔥</div><h3>АКЦИЯ ТОЛЬКО ${Math.max(1,Math.round((R.end-NOW())/36e5))} ${plural(Math.max(1,Math.round((R.end-NOW())/36e5)),"ЧАС","ЧАСА","ЧАСОВ")}</h3><p class="r3-big">Пригласи 3 друзей</p>
    <div class="r3-gifts one"><div><b>👑</b><span>VIP-статус</span><small>корона у ника в топах и чате, больше прокруток и места для карточек</small></div></div>
    <p class="cln">Друг засчитывается, когда откроет 3 карточки</p><button type="button" class="hhbtn" id="r3-go">👥 Позвать друзей</button><button type="button" class="hhx" id="r3-x">Позже</button></div>`;
  $("r3-go").onclick=()=>{closeModal();r3Invite()};$("r3-x").onclick=closeModal}catch(e){}},4000);
/* админ: кнопка в статистике */
{const _ds=drawStats;drawStats=function(){_ds.apply(this,arguments);try{const b=$("st-body");if(!b||$("r3adm"))return;const x=document.createElement("div");x.id="r3adm";x.className="srcbox r3adm";b.prepend(x);
  const load=async()=>{const r=await act("ref3_get");if(!r)return;const on=r.on;const left=on?Math.max(0,r.end-Date.now()):0;
    x.innerHTML=`<b>🔥 Акция «3 друга → VIP»</b>`+(on?`<p class="cln">Идёт · осталось ${Math.floor(left/36e5)} ч ${Math.floor(left/6e4)%60} мин<br>новых по приглашениям: <b>${r.adm.fresh}</b> · выполнили акцию: <b>${r.adm.done}</b></p><button type="button" class="ghost" id="r3-stop">⏹ Остановить</button>`:
      (r.adm?`<p class="cln">Прошлая: выполнили ${r.adm.done}, пришло по приглашениям ${r.adm.fresh}</p>`:"")+`<p class="cln">Пригласил 3 друзей за время акции → VIP Золото на ${r.days||7} дней. Выдаётся автоматически.</p><button type="button" class="craftbtn" id="r3-go3">🚀 Запустить на 3 часа</button>`);
    const g=$("r3-go3");if(g)g.onclick=async()=>{if(!confirm("Запустить акцию на 3 часа? Игроки увидят баннер сразу."))return;g.disabled=true;const q=await act("ref3_start",{h:3});if(q){toast("🔥 Акция запущена до "+new Date(q.end+3*3600e3).toISOString().slice(11,16));const s2=await act("sync");load()}else g.disabled=false};
    const st=$("r3-stop");if(st)st.onclick=async()=>{if(!confirm("Остановить акцию?"))return;if(await act("ref3_stop")){toast("Акция остановлена");await act("sync");load()}}};load()}catch(e){}}}
/* ---------- 🔔 «разреши сообщения»: просим в хорошие моменты — после редкой карточки и раз в день при входе ---------- */
function pmAsk2(why){try{if(!canPmAsk()||!S||!$("modal").hidden||$("onb")||document.querySelector(".hhpop,#lvscr:not([hidden]),.drw:not([hidden])"))return;
  let st={n:0,t:0};try{st=JSON.parse(localStorage.getItem("we-pm2")||'{"n":0,"t":0}')}catch(e){}if(st.n>=5||Date.now()-st.t<20*36e5)return;st.n++;st.t=Date.now();try{localStorage.setItem("we-pm2",JSON.stringify(st))}catch(e){}
  const m=$("modal"),sh=$("msheet");m.hidden=false;hap("medium");
  sh.innerHTML=`<div class="box nickbox pmpop"><div class="kg-rays"></div><div class="pm-bell">🔔</div><h3>${why==="drop"?"Вот это выпало! 🔥":"Не пропускай главное"}</h3><p class="pm-sub">Разреши боту писать тебе — и узнавай первым:</p>
   <ul class="pm-ul"><li>🎁 о розыгрышах и акциях с призами</li><li>🎴 когда готовы новые прокрутки</li><li>⚔️ если кто-то напал на твой регион</li><li>💰 когда купили твою карточку</li></ul>
   <div class="pm-gift">+5 🎴 прокруток сразу</div><button type="button" class="hhbtn" id="pm2-yes">🔔 Разрешить сообщения</button><button type="button" class="hhx" id="pm2-no">Не сейчас</button><small class="pm-note">Ночью бот не пишет. Отключить можно в любой момент</small></div>`;
  $("pm2-yes").onclick=()=>{closeModal();enablePm()};$("pm2-no").onclick=closeModal}catch(e){}}
{const _act=act;act=async function(n,p){const r=await _act.apply(this,arguments);try{if(n==="open"&&r&&r.card&&HEROES[r.card.h][2]>=2)setTimeout(()=>pmAsk2("drop"),3800)}catch(e){}return r}}
setTimeout(()=>pmAsk2("day"),35000);

/* ---------- 🧩 «Загадка серии» — мультики «Хроники Эпох» ---------- */
const rdEsc=x=>String(x==null?"":x).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
async function rdOpen(){if(!ONLINE)return toast("Загадка работает в игре через Telegram");const m=$("modal"),sh=$("msheet");m.hidden=false;sh.innerHTML='<div class="box nickbox rdbox"><div class="rd-load">🧩</div></div>';
  const r=await act("rd_get");if(!r){closeModal();return}rdDraw(r)}
function rdDraw(r,fx){const sh=$("msheet");if(!sh)return;
  const hints=r.hints.map((h,i)=>`<div class="rd-h${i?" rd-h2":""}"><b>${i?"🔓 Подсказка 2":"💡 Подсказка"}</b><span>${rdEsc(h)}</span></div>`).join("")+(r.next&&!r.ok&&r.on?`<div class="rd-h rd-lock"><b>🔒 Подсказка 2</b><span>откроется после ${r.next} ${plural(r.next,"неверной попытки","неверных попыток","неверных попыток")}</span></div>`:"");
  const top=r.top.length?`<div class="rd-top"><b>🏆 Первые разгадавшие — попадут в следующую серию</b><ol>${r.top.map(n=>`<li>${rdEsc(n)}</li>`).join("")}</ol>${r.n>r.top.length?`<small>и ещё ${r.n-r.top.length} — всего разгадали ${r.n}</small>`:""}</div>`:`<div class="rd-top"><b>🏆 Пока никто не разгадал</b><small>Стань первым — и попадёшь в следующую серию!</small></div>`;
  let body;
  if(r.ok)body=`<div class="rd-win"><div class="rd-wbig">🎉</div><h4>Разгадал${r.place?` · ${r.place} место`:""}!</h4><p>Ответ: <b>«${rdEsc(r.ans)}»</b></p><p class="cln">+${r.sp} 🎴 прокруток уже у тебя${r.place&&r.place<=r.topN?". Ты в списке первых — увидишь свой ник в следующей серии 🔥":""}</p><p class="cln">Не пиши ответ в комментариях — пусть другие тоже поломают голову 😉</p></div>`;
  else if(!r.on)body=`<p class="cln">Загадка закрыта. Ответ: <b>«${rdEsc(r.ans||"…")}»</b> — жди следующую серию в TikTok!</p>`;
  else if(!r.left)body=`<p class="cln">Попытки закончились 😔 Ответ: <b>«${rdEsc(r.ans)}»</b>. В следующей серии — новая загадка!</p>`;
  else body=`<input id="rd-in" maxlength="60" autocomplete="off" placeholder="Твой ответ"><button type="button" class="craftbtn" id="rd-go">Ответить</button><small class="rd-left">Попыток: ${r.left} из ${r.max}${r.last?` · последний ответ: «${rdEsc(r.last)}» — не то`:""}</small>`;
  sh.innerHTML=`<div class="box nickbox rdbox${fx==="bad"?" rd-shake":""}"><div class="kg-rays"></div><div class="rd-ep">🎬 ХРОНИКИ ЭПОХ · ${rdEsc(r.title)}</div><div class="rd-ico">🧩</div><h3>Загадка серии</h3><p class="rd-q">${rdEsc(r.q)}</p>${hints}${body}
   <div class="rd-gift">🎁 За верный ответ: <b>+${r.sp} 🎴</b> · первые ${r.topN} — в следующую серию</div>${top}<button type="button" class="ghost" id="rd-x">Закрыть</button></div>`;
  $("rd-x").onclick=closeModal;const go=$("rd-go"),inp=$("rd-in");
  if(go){const send=async()=>{const v=(inp.value||"").trim();if(!v)return toast("Напиши ответ");go.disabled=true;const q=await act("rd_try",{a:v});go.disabled=false;if(!q)return;
      if(q.hit){sfx.fanfare();burst(4);hapN("success");rdDraw(q,"ok")}else{hapN("error");toast(q.left?"❌ Не угадал. Осталось попыток: "+q.left:"Попытки закончились");rdDraw(q,"bad")}};
    go.onclick=send;inp.onkeydown=e=>{if(e.key==="Enter")send()};setTimeout(()=>{try{inp.focus()}catch(e){}},200)}}
/* полоска под шапкой, пока загадка не разгадана */
function rdStrip(){let b=$("rdstrip");const R=S&&ONLINE?S.rd:null;if(!R||R.ok){if(b)b.remove();return}
  if(!b){const hd=$("r3strip")||$("cstrip")||document.querySelector("header");if(!hd)return;b=document.createElement("button");b.type="button";b.id="rdstrip";b.className="r3strip rdstrip";hd.after(b);b.onclick=()=>{hap("light");rdOpen()}
    b.innerHTML=`<i>🧩</i><span><b>Загадка серии ${R.ep} — разгадай!</b><small>Ответ на вопрос из мультика «Хроники Эпох» · +🎴 и твой ник в серии</small></span><em>▶</em>`}}
setInterval(()=>{try{rdStrip()}catch(e){}},1500);
{const q=new URLSearchParams(location.search).get("startapp")||(()=>{try{return tg&&tg.initDataUnsafe&&tg.initDataUnsafe.start_param||INITP.get("start_param")}catch(e){return ""}})();if(q==="rd"){const t=setInterval(()=>{if(!S)return;clearInterval(t);setTimeout(rdOpen,1200)},400)}}
/* админ: кто разгадал */
{const _ds=drawStats;drawStats=function(){_ds.apply(this,arguments);try{const b=$("st-body");if(!b||$("rdadm"))return;const x=document.createElement("div");x.id="rdadm";x.className="srcbox r3adm";b.prepend(x);
  (async()=>{const r=await act("rd_list");if(!r)return;x.innerHTML=`<b>🧩 Загадка: ${rdEsc(r.title)}</b><p class="cln">Пытались: <b>${r.all}</b> · разгадали: <b>${r.ok}</b></p>`+(r.list.length?`<p class="cln rd-adl">${r.list.map((u,i)=>`${i+1}. ${rdEsc(u.name||u.uid)} <small>(${u.tries} поп.)</small>`).join("<br>")}</p><button type="button" class="ghost" id="rd-copy">📋 Скопировать первых 10 для видео</button>`:"");
    const c=$("rd-copy");if(c)c.onclick=()=>{const t=r.list.slice(0,10).map((u,i)=>`${i+1}. ${u.name||u.uid}`).join("\n");try{navigator.clipboard.writeText(t);toast("Скопировано")}catch(e){prompt("Скопируй",t)}}})()}catch(e){}}}

/* ---------- ⚔️ «Выбор серии» ---------- */
async function vtOpen(){if(!ONLINE)return toast("Голосование работает в игре через Telegram");const m=$("modal"),sh=$("msheet");m.hidden=false;sh.innerHTML='<div class="box nickbox vtbox"><div class="rd-load">⚔️</div></div>';
  const r=await act("vt_get");if(!r){closeModal();return}vtDraw(r)}
function vtDraw(r){const sh=$("msheet");if(!sh)return;const shown=r.my||!r.on;
  const opts=r.opts.map((o,i)=>`<button type="button" class="vt-o vt-o${i}${r.my===o.k?" on":""}" data-k="${o.k}" ${shown?"disabled":""}><i>${o.ic}</i><b>${rdEsc(o.n)}</b><small>${rdEsc(o.d)}</small>${shown?`<u style="width:${o.pc}%"></u><em>${o.pc}%</em>`:""}</button>`).join(`<div class="vt-vs">VS</div>`);
  sh.innerHTML=`<div class="box nickbox vtbox"><div class="kg-rays"></div><div class="rd-ep">🎬 ХРОНИКИ ЭПОХ · ${rdEsc(r.title)}</div><h3>⚔️ Выбор серии</h3><p class="rd-q">${rdEsc(r.q)}</p><div class="vt-opts">${opts}</div>
   ${r.my?`<p class="cln">✅ Твой голос принят${r.sp?` · +${r.sp} 🎴 уже у тебя`:""}. Проголосовало: <b>${r.tot}</b>. Как решит большинство — так и будет в следующей серии!</p>`:r.on?`<p class="cln">Один голос с аккаунта${r.sp?` · за голос <b>+${r.sp} 🎴</b>`:""}. Как решит большинство — так и будет в следующей серии</p>`:`<p class="cln">Голосование закончено — смотри, что выбрали, в следующей серии!</p>`}
   <button type="button" class="ghost" id="vt-x">Закрыть</button></div>`;
  $("vt-x").onclick=closeModal;sh.querySelectorAll(".vt-o:not([disabled])").forEach(b=>b.onclick=async()=>{const o=r.opts.find(x=>x.k===b.dataset.k);if(!confirm("Твой выбор: «"+o.n+"»? Переголосовать нельзя"))return;
    sh.querySelectorAll(".vt-o").forEach(x=>x.disabled=true);const q=await act("vt_vote",{ch:o.k});if(!q){vtDraw(r);return}sfx.fanfare();burst(3);hapN("success");vtDraw(q)})}
function vtStrip(){let b=$("vtstrip");const R=S&&ONLINE?S.vt:null;if(!R||R.ch){if(b)b.remove();return}
  if(!b){const hd=$("rdstrip")||$("r3strip")||$("cstrip")||document.querySelector("header");if(!hd)return;b=document.createElement("button");b.type="button";b.id="vtstrip";b.className="r3strip vtstrip";hd.after(b);b.onclick=()=>{hap("light");vtOpen()}
    b.innerHTML=`<i>⚔️</i><span><b>Выбор серии ${R.ep} — голосуй!</b><small>🤝 к Ксерксу или 🔥 огонь? Решаешь ты · +🎴 за голос</small></span><em>▶</em>`}}
setInterval(()=>{try{vtStrip()}catch(e){}},1500);
{const q=new URLSearchParams(location.search).get("startapp")||(()=>{try{return tg&&tg.initDataUnsafe&&tg.initDataUnsafe.start_param||INITP.get("start_param")}catch(e){return ""}})();if(q==="vt"){const t=setInterval(()=>{if(!S)return;clearInterval(t);setTimeout(vtOpen,1200)},400)}}
{const _ds=drawStats;drawStats=function(){_ds.apply(this,arguments);try{const b=$("st-body");if(!b||$("vtadm"))return;const x=document.createElement("div");x.id="vtadm";x.className="srcbox r3adm";b.prepend(x);
  (async()=>{const r=await act("vt_get");if(!r)return;const R=r.my||!r.on?r.opts:null;x.innerHTML=`<b>⚔️ Голосование: ${rdEsc(r.title)}</b>`+(R?`<p class="cln">${R.map(o=>`${o.ic} ${rdEsc(o.n)}: <b>${o.c}</b> (${o.pc}%)`).join("<br>")}<br>всего: ${r.tot}</p>`:`<p class="cln">Проголосовало: <b>${r.tot}</b>. Проценты видны после твоего голоса</p>`)})()}catch(e){}}}
