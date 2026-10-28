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
  {k:"chat",ic:"💬",n:"Чат",c:["#9fe0ff","#1f6fd0"]}]],
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
