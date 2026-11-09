/* 🎓 Обучение 2.0: 13 экранов с живыми мини-сценами → обязательный ник → (после 15 открытий) обязательная подписка */
const TUT=[
 {k:"spin",t:"Крути карточки",d:"Жми «Крутить» — выпадет случайный воин из 7 эпох. Каждая карта — коллекционная и только твоя.",c:"#ffb020"},
 {k:"rar",t:"Редкость решает",d:"Обычный → Редкий → Эпический → Легендарный → Мифический. Чем реже воин — тем он сильнее и дороже.",c:"#bf5af2",go:()=>encOpen("how")},
 {k:"fin",t:"Отделки и тираж",d:"Блестящая, Голограмма, Золотая, Ошибка печати. Тираж ограничен: выбили — таких больше не будет никогда.",c:"#ff2e63",go:()=>encOpen("all")},
 {k:"price",t:"Карта — это деньги",d:"Продавай на рынке другим игрокам или ставь в Зал славы — лучшие карты приносят монеты каждый час.",c:"#34c759",go:()=>hofOpen()},
 {k:"emp",t:"Строй Империю",d:"Каждая карта — воин твоей армии. Расти до 100 уровня, бери ранги и забирай дань каждый день.",c:"#ffd23f",go:()=>empOpen()},
 {k:"duel",t:"Бои на карточках",d:"Дуэли и рейтинговые бои: твоя карта против карты соперника. Сила, отделка и прокачка решают исход.",c:"#ff7a00",go:()=>{try{openDuel()}catch(e){}}},
 {k:"war",t:"Война армий",d:"Твои 5 лучших воинов против чужой Империи. 3 победы из 5 — армия врага разбита, слава твоя.",c:"#ff3b30",go:()=>warOpen()},
 {k:"map",t:"Захватывай мир",d:"Ставь воинов на регионы карты — они приносят доход. Удержи Трон и стань Королём.",c:"#0a84ff",go:()=>openMap()},
 {k:"drg",t:"Свой дракон",d:"Выведи дракона из яйца, корми, качай и захватывай драконьи логова.",c:"#30d158",go:()=>setTab("dragon")},
 {k:"cas",t:"Казино",d:"Ракетка, Сапёр, слоты и Плинко. А в Реф-кейсе выпадают звёзды и NFT-подарки.",c:"#bf5af2",go:()=>openCas("rk")},
 {k:"fr",t:"Зови друзей",d:"Друг пришёл и начал играть — тебе прокрутка в Реф-кейсе. Джекпот — 500 ⭐!",c:"#3ddc84",go:()=>openCas("rc")},
 {k:"ev",t:"Конкурсы и подарки",d:"Турниры, конкурсы, сундуки и NFT-подарки — новое каждую неделю. Следи за плашками на главном.",c:"#ff9f0a",go:()=>voteHub()},
 {k:"go",t:"Твой первый воин ждёт",d:"Осталось одно — назови себя. Ник увидят все: в топах, на рынке и в ленте выпадений.",c:"#ffd23f"}];
let TUTI=0,TUTM=false;
const tutP=(h,cls)=>'<div class="tu-c '+(cls||"")+'">'+portrait(h,null,1)+'</div>';
function tutScene(k){const H=[19,20,11,64,26,22];switch(k){
 case "spin":return '<div class="tu-flip"><div class="tu-back">?</div><div class="tu-front">'+portrait(20,null,1)+'<b>Самурай</b></div></div><div class="tu-burst"></div>';
 case "rar":return '<div class="tu-row">'+[0,1,2,3,4].map(r=>'<div class="tu-r" style="--c:'+HT[r].c+';--d:'+r*.25+'s">'+portrait([11,19,20,26,64][r],null,1)+'<small>'+HT[r].k+'</small></div>').join("")+'</div>';
 case "fin":return '<div class="tu-fin">'+tutP(64,"")+'<div class="tu-fl"></div></div><div class="tu-cnt"><span>Золотая</span><b>осталось <i>3</i> из 10</b></div>';
 case "price":return tutP(26,"tu-big")+'<div class="tu-price"><b>1 240 🪙</b><b>×6</b><b>×80</b><b>99 000 🪙</b></div>';
 case "emp":return '<div class="tu-emp"><div class="tu-rk"><span>Племя</span><span>Город</span><span>Королевство</span><span>Легенда эпох</span></div><div class="tu-bar"><i></i></div><b>⚔️ Мощь растёт</b></div>';
 case "duel":return '<div class="tu-vs">'+tutP(20,"l")+'<b>VS</b>'+tutP(26,"r")+'</div><div class="tu-hp"><i class="a"></i><i class="b"></i></div>';
 case "war":return '<div class="tu-war"><div>'+H.slice(0,5).map(h=>tutP(h,"s")).join("")+'</div><b>⚔️</b><div>'+[22,53,48,28,23].map(h=>tutP(h,"s e")).join("")+'</div></div><div class="tu-win">ПОБЕДА!</div>';
 case "map":return '<div class="tu-map"><i></i><i></i><i></i><i class="me"></i><i></i><i></i><span class="tu-flag">🚩</span><em>+120 🪙/ч</em></div>';
 case "drg":return '<div class="tu-egg"><div class="tu-e1">🥚</div><div class="tu-e2">🐉</div></div>';
 case "cas":return '<div class="tu-cas"><div class="tu-rk2">🚀<small>×2.45</small></div><div class="tu-pl"><i></i><span>🪙</span></div></div>';
 case "fr":return '<div class="tu-fr"><span class="a">📨</span><span class="b">👥</span><span class="c">🎟 +1</span><em>500 ⭐</em></div>';
 case "ev":return '<div class="tu-ev"><div class="tu-box">🎁</div>'+[0,1,2,3,4,5].map(i=>'<span style="--i:'+i+'">'+["⭐","💎","🎴","⭐","🎁","⭐"][i]+'</span>').join("")+'</div>';
 default:return '<div class="tu-go">'+tutP(19,"tu-big")+'</div>'}}
function tutOpen(menu){TUTM=!!menu;TUTI=0;let o=$("tut");if(!o){o=document.createElement("div");o.id="tut";document.body.appendChild(o)}tutDraw()}
function tutDraw(){const o=$("tut"),T=TUT[TUTI],n=TUT.length;
 o.innerHTML='<div class="tu-top">'+(TUTI?'<button type="button" id="tu-bk">‹ Назад</button>':'<span></span>')+'<button type="button" id="tu-sk">'+(TUTM?"Закрыть":"Пропустить")+'</button></div>'+
  '<div class="tu-stage" style="--c:'+T.c+'"><div class="tu-glow"></div><div class="tu-sc" data-k="'+T.k+'">'+tutScene(T.k)+'</div></div>'+
  '<div class="tu-txt"><h2>'+T.t+'</h2><p>'+T.d+'</p><div class="tu-pg"><i style="width:'+((TUTI+1)/n*100)+'%"></i></div><small>'+(TUTI+1)+' из '+n+'</small>'+
  '<button type="button" class="tu-next" id="tu-nx">'+(TUTI===n-1?(TUTM?"Готово":"Придумать ник ✍️"):"Дальше")+'</button>'+(TUTM&&T.go?'<button type="button" class="tu-open" id="tu-op">Открыть: '+T.t+'</button>':'')+'</div>';
 hap("light");$("tu-nx").onclick=()=>{if(TUTI<n-1){TUTI++;tutDraw()}else tutDone()};$("tu-sk").onclick=tutDone;if($("tu-bk"))$("tu-bk").onclick=()=>{TUTI--;tutDraw()};
 if($("tu-op"))$("tu-op").onclick=()=>{const g=T.go;tutClose();g()};
 let sx=null;o.ontouchstart=e=>{sx=e.touches[0].clientX};o.ontouchend=e=>{if(sx==null)return;const dx=e.changedTouches[0].clientX-sx;sx=null;if(dx<-60&&TUTI<n-1){TUTI++;tutDraw()}else if(dx>60&&TUTI>0){TUTI--;tutDraw()}}}
function tutClose(){const o=$("tut");if(o)o.remove()}
function tutDone(){tutClose();try{localStorage.setItem("we-tut2","1");localStorage.setItem("we-onb","1");localStorage.setItem("we-new1","1")}catch(e){}if(!TUTM&&S&&!S.nick)setTimeout(nickScreen,250)}
/* ✍️ ник — красиво, обязательно, +3 🎴 */
const NK1=["Царь","Воин","Легат","Викинг","Самурай","Рыцарь","Страж","Ярл","Хан","Барон","Дракон","Тень"],NK2=["Эпох","Севера","Огня","Спарты","Грома","Стали","Ночи","Рима","Бури","Льда"];
function nickScreen(){if(!S||S.nick||$("nks"))return;const o=document.createElement("div");o.id="nks";document.body.appendChild(o);
 o.innerHTML='<div class="nk-stage"><div class="nk-card"><div class="nk-pt">'+portrait(19,null,1)+'</div><b id="nk-pv">Твой ник</b><small>Империя · Племя</small></div></div>'+
  '<div class="tu-txt"><h2>Как тебя зовут, воин?</h2><p>Ник видят все: в топе мира, на рынке и в ленте выпадений. За ник — <b>+3 🎴</b> прокрутки.</p>'+
  '<div class="nk-row"><input id="nk2" maxlength="16" autocomplete="off" spellcheck="false" placeholder="Например, Царь_Горы"><button type="button" id="nk-rd">🎲</button></div><small class="nkerr" id="nk2e"></small>'+
  '<button type="button" class="tu-next" id="nk-ok">В бой! ⚔️</button></div>';
 const i=$("nk2"),pv=$("nk-pv"),er=$("nk2e");
 i.oninput=()=>{pv.textContent=i.value||"Твой ник";try{checkNick(i.value);er.textContent=""}catch(e){er.textContent=i.value.length>=3?e.message:""}};
 $("nk-rd").onclick=()=>{hap("light");i.value=NK1[Math.floor(Math.random()*NK1.length)]+"_"+NK2[Math.floor(Math.random()*NK2.length)]+(Math.random()<.5?Math.floor(Math.random()*99):"");i.oninput()};
 const go=async()=>{try{checkNick(i.value)}catch(e){er.textContent=e.message;return}$("nk-ok").disabled=true;const r=await act("nick",{nick:i.value});$("nk-ok").disabled=false;if(!r)return;
   o.remove();sfx.fanfare();burst(4);hapN("success");try{Object.keys(tpCache).forEach(k=>delete tpCache[k])}catch(e){}renderAll();toast("⚔️ Добро пожаловать, «"+r.nick+"»!"+(r.gift?" +"+r.gift+" 🎴":""))};
 $("nk-ok").onclick=go;i.onkeydown=e=>{if(e.key==="Enter")go()}}
/* 📢 подписка — обязательно, но не сразу: после 15 открытий; для всех игроков */
function subGate(){if(!S||!ONLINE||S.subGot2||(S.nOp||0)<15||$("sbg")||$("tut")||$("nks"))return;const o=document.createElement("div");o.id="sbg";document.body.appendChild(o);
 o.innerHTML='<div class="nk-stage"><div class="sb-ic">📢</div></div><div class="tu-txt"><h2>Подпишись на наш канал</h2><p>Там промокоды, конкурсы со звёздами и новости обновлений. За подписку — <b>+10 🎴</b> прокруток сразу.</p>'+
  '<button type="button" class="tu-next" id="sb-go">📢 Подписаться</button><button type="button" class="tu-open" id="sb-ck">✅ Я подписался — проверить</button><small class="nkerr" id="sb-er"></small></div>';
 $("sb-go").onclick=()=>{hap("light");try{tg.openTelegramLink("https://t.me/"+String(typeof CHANNEL!=="undefined"?CHANNEL:"@voinyepoh").replace("@",""))}catch(e){open("https://t.me/voinyepoh")}};
 $("sb-ck").onclick=async()=>{$("sb-ck").disabled=true;const r=await act("sub_check");$("sb-ck").disabled=false;if(!r){$("sb-er").textContent="Подписки пока не видно — подпишись и нажми ещё раз";return}
   o.remove();S.subGot2=1;sfx.fanfare();burst(5);hapN("success");renderAll();toast("🎉 Спасибо! +10 🎴 прокруток")}}
setInterval(()=>{try{subGate()}catch(e){}},2500);
/* новичок: вместо старых подсказок — обучение 2.0 */
const _startOnb=startOnb;startOnb=function(){let d=null;try{d=localStorage.getItem("we-tut2")||localStorage.getItem("we-onb")}catch(e){}if(d||!S||S.cards.length)return false;tutOpen(false);return true};
const _askNick=askNick;askNick=function(){if($("tut")||$("nks"))return;if(S&&!S.nick&&ONLINE&&nickReady())return nickScreen();_askNick()};
