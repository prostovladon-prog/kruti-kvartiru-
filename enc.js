/* 📚 Энциклопедия карт: как устроены редкости и отделки + все воины игры с остатком тиража */
const ENC={tab:"how",flt:"all",info:null};
const encPct=x=>x>=1?(Math.round(x*10)/10)+"%":x>=.01?(Math.round(x*100)/100)+"%":"<0,01%";
function encRarP(){const c=[0,0,0,0,0];BASE.forEach(h=>c[HEROES[h][2]]++);const w=c.map((n,r)=>n*HW[r]),t=w.reduce((a,b)=>a+b,0);return w.map(x=>x/t*100)}
async function encOpen(tab){ENC.tab=tab||ENC.tab;const m=$("modal"),sh=$("msheet");m.hidden=false;encDraw();if(ONLINE&&(!ENC.info||Date.now()-ENC.info.t>60e3)){const r=await act("cat_info");if(r){ENC.info=r;encDraw()}}}
function encDraw(){const sh=$("msheet");if(!sh)return;const T=ENC.tab;
  sh.innerHTML='<div class="box nickbox encbox"><div class="enc-hd">📚 <b>Энциклопедия карт</b><small>всё о карточках «Воинов Эпох»</small></div>'+
   '<div class="seg enc-seg">'+[["how","📖 Как устроено"],["all","🃏 Все воины"],["sp","💎 Особые"]].map(x=>'<button type="button" data-t="'+x[0]+'" class="'+(T===x[0]?"on":"")+'">'+x[1]+'</button>').join("")+'</div>'+
   '<div id="enc-b">'+(T==="how"?encHow():T==="all"?encAll():encSp())+'</div><button type="button" class="ghost" id="enc-x">Закрыть</button></div>';
  $("enc-x").onclick=closeModal;sh.querySelector(".enc-seg").onclick=e=>{const b=e.target.closest("[data-t]");if(b){hap("light");ENC.tab=b.dataset.t;encDraw()}};
  const f=sh.querySelector(".enc-flt");if(f)f.onclick=e=>{const b=e.target.closest("[data-f]");if(b){hap("light");ENC.flt=b.dataset.f;encDraw()}};
  sh.querySelectorAll("[data-h]").forEach(r=>r.onclick=()=>r.classList.toggle("open"))}
function encHow(){const rp=encRarP();
  const rar=HT.map((t,r)=>'<div class="enc-r" style="--c:'+t.c+'"><i></i><b>'+t.k+'</b><span>'+encPct(rp[r])+'</span><small>'+BASE.filter(h=>HEROES[h][2]===r).length+' воинов</small></div>').join("");
  const fins=FIN.slice(0,5).map((F,f)=>'<div class="enc-fn"><span class="enc-dot" data-k="'+F.cls+'" style="background:'+F.col+'"></span><b>'+F.k+'</b><em>'+encPct(F.w)+'</em><small>цена ×'+F.m+(F.run===Infinity?' · без лимита':' · тираж '+F.run+' на воина')+'</small></div>').join("");
  return '<div class="enc-sec"><h4>1. Редкость воина</h4><p>У каждого воина своя редкость — она решает, насколько он силён и как часто выпадает. Шанс в одной прокрутке:</p>'+rar+'</div>'+
   '<div class="enc-sec"><h4>2. Отделка карточки</h4><p>Любой воин может выпасть в одной из отделок. Чем реже отделка — тем дороже и сильнее карта. У редких отделок <b>ограниченный тираж</b>: когда он выбит, такой карты больше не будет никогда.</p>'+fins+
   '<p class="enc-n">Пример: Золотой Самурай — всего 10 штук на весь мир. «Ошибка печати» — 1 на воина: кто выбил, тот единственный владелец.</p></div>'+
   '<div class="enc-sec"><h4>3. Что делает карту ценной</h4><ul><li><b>Редкость × отделка</b> — главное в цене и мощи Империи</li><li><b>Номер в тираже</b> — «1/10» стоит втрое дороже</li><li><b>Красивый серийный номер</b> — 777 777, 000 001 и др. дают множитель к цене</li><li><b>Уровень и закалка ★</b> — растят силу в боях</li></ul></div>'+
   '<div class="enc-sec"><h4>4. Гарант</h4><p>Эпическая карта гарантирована не реже раза в 30 прокруток, Легендарная — раз в 90. Оберег удачи на час повышает шанс Голограммы и Золотой.</p></div>'+
   '<div class="enc-sec"><h4>5. Особые серии</h4><ul><li>💎 <b>Алмазная серия</b> — '+Object.keys(DIA).length+' уникальных «ошибок» с дефектами и бриллиантом</li><li>👯 <b>Близнецы</b> — всего 2 карты каждого на весь мир</li><li>🧩 <b>Составные</b> — собираются из левой и правой половинки</li><li>⚡ <b>Тор</b> — ошибка печати 1 из 1, шанс 1 на миллион</li></ul><button type="button" class="craftbtn" onclick="ENC.tab=\'sp\';encDraw()">💎 Смотреть особые карты</button></div>'}
function encOwned(){const o={};for(const c of (S&&S.cards)||[]){if(c.part)continue;(o[c.h]=o[c.h]||new Set()).add(c.f)}return o}
function encAll(){const I=ENC.info,own=encOwned(),F=ENC.flt;let L=BASE.slice().filter(h=>!HEROES[h][4].collab).sort((a,b)=>HEROES[b][2]-HEROES[a][2]||a-b);
  if(F==="mine")L=L.filter(h=>own[h]);if(F==="no")L=L.filter(h=>!own[h]);if(F==="err")L=L.filter(h=>!(I&&I.err[h]));
  const cnt=(h,f)=>I?(I.c[h+"-"+f]||0):null;
  const rows=L.map(h=>{const H=HEROES[h],t=HT[H[2]],mine=own[h];
    const fin=[1,2,3].map(f=>{const n=cnt(h,f),run=FIN[f].run,left=n==null?null:Math.max(0,run-n);return '<div class="enc-t'+(left===0?" out":"")+'"><span class="enc-dot" data-k="'+FIN[f].cls+'" style="background:'+FIN[f].col+'"></span>'+FIN[f].k+'<b>'+(n==null?"…":left===0?"всё выбито":"осталось "+left+" из "+run)+'</b></div>'}).join("");
    const er=I?(I.err[h]?'<div class="enc-t out"><span class="enc-dot" data-k="error" style="background:'+FIN[4].col+'"></span>Ошибка печати<b>выбита · '+rdEsc(I.err[h])+'</b></div>':'<div class="enc-t free"><span class="enc-dot" data-k="error" style="background:'+FIN[4].col+'"></span>Ошибка печати<b>ещё в игре!</b></div>'):"";
    return '<div class="enc-h" data-h="'+h+'" style="--c:'+t.c+'"><div class="enc-pt">'+portrait(h,null,1)+'</div><div class="enc-i"><b>'+H[0]+(mine?' <em>✓ у тебя</em>':'')+'</b><small>'+t.k+' · '+H[1]+'</small>'+(I&&!I.err[h]?'<u>🔥 Ошибка печати ещё не выбита</u>':'')+'</div><i>›</i><div class="enc-more"><p>'+H[3]+'</p>'+fin+er+(mine?'<p class="enc-n">Твои отделки: '+[...mine].sort().map(f=>FIN[f].k).join(", ")+'</p>':'')+'</div></div>'}).join("");
  const n=BASE.filter(h=>own[h]).length;
  return '<div class="enc-sum">У тебя <b>'+n+'</b> из <b>'+BASE.filter(h=>!HEROES[h][4].collab).length+'</b> воинов'+(I?' · ошибок печати ещё в игре: <b>'+BASE.filter(h=>!I.err[h]).length+'</b>':'')+'</div>'+
   '<div class="enc-flt">'+[["all","Все"],["mine","✓ Мои"],["no","Нет у меня"],["err","🔥 Ошибка ещё в игре"]].map(x=>'<button type="button" data-f="'+x[0]+'" class="'+(F===x[0]?"on":"")+'">'+x[1]+'</button>').join("")+'</div>'+
   '<small class="enc-tip">Нажми на воина — увидишь, сколько редких отделок ещё можно выбить</small>'+(rows||'<p class="cln">Тут пока пусто</p>')}
function encSp(){const I=ENC.info,own=encOwned();
  const dia=Object.keys(DIA).map(Number),dn=h=>I?(I.c[h+"-"+DIA_F]||0):null;
  const left=dia.reduce((a,h)=>a+(dn(h)==null?0:Math.max(0,DIA[h].run-dn(h))),0);
  const dRows=dia.map(h=>{const n=dn(h),run=DIA[h].run,l=n==null?null:Math.max(0,run-n);return '<div class="enc-d'+(l===0?" out":"")+'"><div class="enc-pt">'+portrait(h,null,1)+'</div><b>'+HEROES[h][0]+'</b><small>'+DIA[h].n+'</small><em>'+(l==null?"…":l===0?"выбиты все":l+" из "+run)+'</em>'+(own[h]&&own[h].has(DIA_F)?'<i>✓</i>':'')+'</div>'}).join("");
  const grp=(title,txt,L)=>L.length?'<div class="enc-sec"><h4>'+title+'</h4><p>'+txt+'</p><div class="enc-grid">'+L.map(h=>'<div class="enc-d"><div class="enc-pt">'+portrait(h,null,1)+'</div><b>'+HEROES[h][0]+'</b>'+(own[h]?'<i>✓</i>':'')+'</div>').join("")+'</div></div>':"";
  return '<div class="enc-sec"><h4>💎 Алмазная серия</h4><p>Ошибки печати с крошечным тиражом — у каждой свой дефект и спрятанный бриллиант. Выпадают в прокрутке и в Легендарном, Имперском и Мифическом сундуках.'+(I?' Сейчас в игре осталось <b>'+left+'</b> алмазных карт.':'')+'</p><div class="enc-grid">'+dRows+'</div></div>'+
   grp("👯 Близнецы","Всего 2 карты каждого воина на весь мир.",DUO)+grp("🧩 Составные воины","Собираются из левой и правой половинки. Правых — 300 на воина.",COMP)+grp("👑 Донатные легенды","Особые воины из сундуков и Сокровищницы.",DON.concat(ONE))}
