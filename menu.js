/* ===================== Меню «Ещё»: шторка со всеми разделами + быстрые плитки на главной =====================
   Нижняя панель: Крутить · Карты · Бой · Дракон · Рынок · Ещё. Всё остальное — в шторке. */
const MENU_GROUPS=[
 ["Главное",[
  {k:"gold",ic:"🏪",n:"Сокровищница",c:["#ffe066","#ff9f0a"]},
  {k:"cas",ic:"🎰",n:"Казино",c:["#ff7ad9","#9b2cf0"]},
  {k:"prof",ic:"👤",n:"Профиль",c:["#7cc8ff","#2a4fd0"]},
  {k:"pass",ic:"🎖",n:"Пропуск",c:["#ffd27a","#c0502a"]}]],
 ["Каждый день",[
  {k:"quest",ic:"🎯",n:"Задания",c:["#7ee89a","#1e8a4a"]},
  {k:"wheel",ic:"🎡",n:"Колесо",c:["#ffb84d","#d0302a"]},
  {k:"camp",ic:"🏕",n:"Лагерь",c:["#c9e86b","#4a7a1e"]},
  {k:"chat",ic:"💬",n:"Чат",c:["#9fe0ff","#1f6fd0"]},
  {k:"dm",ic:"✉️",n:"Сообщения",c:["#ffd0f0","#c03a8a"]}]],
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
  b.innerHTML='<i>'+(C.vip?"👑":"🎟")+'</i><span><b>'+(C.vip?"Розыгрыш 3 VIP на месяц":"Розыгрыш "+C.prizes[0])+'</b><small>'+(inn?"🎟 у тебя "+M.n+" "+plural(M.n,"билет","билета","билетов"):"пригласи "+C.min+" друзей — и ты в игре ("+M.n+"/"+C.min+")")+'</small></span><em>'+tleft(cLeft())+'</em>'}
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
function pathShow(){const V=pathSt();if(!V||V.fin||!ONLINE)return false;return S.created&&NOW()-S.created<14*864e5}
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
  const showNb=!V.done&&V.age<21;if(!showNb&&!stCan&&Gv.got){if(el)el.remove();return}
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
