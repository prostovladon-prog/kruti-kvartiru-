/* 🏆 «Турнир Эпох»: видео-турнир 10 воинов — угадай победителя каждого боя */
const FTU={tick:null};
const ftuN=h=>h==null?"???":HEROES[h][0];
const ftuP=h=>h==null?'<div class="ftu-q">?</div>':portrait(h,null,1);
async function ftuOpen(){if(!ONLINE)return toast("Турнир работает в игре через Telegram");const m=$("modal"),sh=$("msheet");m.hidden=false;sh.innerHTML='<div class="box nickbox ftubox"><div class="rd-load">🏆</div></div>';
  const r=await act("ft_get");if(!r){closeModal();return}ftuDraw(r)}
function ftuDraw(r){const sh=$("msheet");if(!sh)return;const F=r.cur>=0?r.fights[r.cur]:null,live=F&&F.st===1&&!r.fin,shown=F&&(F.my||F.st===2);
  let main="";
  if(r.cur<0)main='<p class="cln ftu-soon">Скоро старт! Первая серия турнира уже снимается — 10 воинов, 9 боёв, выживет один.</p>';
  else if(r.fin||(F&&F.st===2)){const fin=r.fights[r.fights.length-1];main='<div class="ftu-champ">'+ftuP(fin.w==="a"?fin.a:fin.b)+'<b>👑 Чемпион турнира: '+ftuN(fin.w==="a"?fin.a:fin.b)+'</b></div>'}
  else{const opt=k=>{const h=F[k],pc=k==="a"?F.pa:F.pb;return '<button type="button" class="ftu-o ftu-'+k+(F.my===k?" on":"")+'" data-k="'+k+'" '+(shown?"disabled":"")+'><div class="ftu-art">'+ftuP(h)+'</div><b>'+ftuN(h)+'</b>'+(shown?'<u style="width:'+pc+'%"></u><em>'+pc+'%</em>':'<small>Он победит!</small>')+'</button>'};
    main='<div class="ftu-st">'+r.stage[r.cur]+' · БОЙ '+(r.cur+1)+' из '+r.fights.length+'</div><div class="ftu-vs">'+opt("a")+'<div class="ftu-x">VS</div>'+opt("b")+'</div>'+
     (F.my?'<p class="cln">✅ Голос принят: <b>'+ftuN(F[F.my])+'</b>. Проголосовало: <b>'+F.tot+'</b>. Кто победил — в следующей серии!</p>':'<p class="cln">Кто победит? Один голос на бой · за голос <b>+'+r.sp+' 🎴</b> · угадаешь — ещё <b>+'+r.hit+' 🎴</b> и очко в турнире</p>')+ftuSoc(r)}
  const br=r.fights.map((f,i)=>{const w=f.st===2?(f.w==="a"?f.a:f.b):null;const nm=k=>{const h=f[k];return '<span class="'+(w!=null?(h===w?"win":"lose"):"")+'">'+ftuN(h)+'</span>'};
    return '<div class="ftu-bi'+(f.st===1?" now":"")+'"><i>'+(i+1)+'</i>'+nm("a")+'<small>vs</small>'+nm("b")+(f.st===2&&f.my?'<em>'+(f.my===f.w?"✅":"❌")+'</em>':f.my?'<em>🗳</em>':'')+'</div>'}).join("");
  const top=r.top.length?r.top.map((t,i)=>'<div class="ftu-tr'+(t.uid===S.uid?" me":"")+'"><i>'+(["🥇","🥈","🥉"][i]||i+1)+'</i><span>'+rdEsc(t.name)+'</span><b>'+t.n+'</b></div>').join(""):'<small class="cln">Пока никто не угадал — первые итоги после боя №1</small>';
  sh.innerHTML='<div class="box nickbox ftubox"><div class="kg-rays"></div><div class="ftu-logo">🏆 ТУРНИР ЭПОХ</div><div class="ftu-sub">10 воинов · новая серия каждый день · выживет один</div>'+main+
   '<div class="ftu-sc">🎯 Ты угадал: <b>'+r.myHit+'</b> из <b>'+r.myDone+'</b></div>'+
   '<div class="ftu-pz"><b>Призы лучшим предсказателям турнира</b><div>🥇 NFT-подарок в Telegram + VIP-статус</div><div>🥈 🥉 Звёзды*</div><small>Кто угадает больше всех боёв. Участие бесплатное. *звёзды начисляются на игровой баланс</small></div>'+
   '<details class="ftu-d" open><summary>🏅 Лучшие предсказатели</summary>'+top+'</details><details class="ftu-d"><summary>⚔️ Сетка турнира</summary>'+br+'</details><details class="ftu-d"><summary>📜 Правила турнира</summary><div class="ftu-rl"><p>Организатор — игра «Воины Эпох» (@VoinyEpohBot). Участие бесплатное, покупать ничего не нужно.</p><p>Каждый день выходит серия с новым боем. В игре один аккаунт = один голос за бой; переголосовать нельзя. Голосование закрывается перед выходом следующей серии.</p><p>Исход каждого боя определяется жребием с учётом силы карт до открытия голосования и не зависит от голосов.</p><p>Побеждают игроки, угадавшие больше всех боёв за турнир. При равенстве — у кого больше голосов, затем кто проголосовал раньше.</p><p>Призы: 1 место — подарок в Telegram и VIP-статус в игре; 2 и 3 место — звёзды на игровой баланс (внутриигровая валюта). Итоги — после финала, победителям придёт сообщение от бота.</p><p>Лайк и комментарий под видео — по желанию, на итоги не влияют. Турнир не связан с TikTok, Instagram и Telegram и не спонсируется ими. Мультяшные бои — вымышленные.</p></div></details>'+
   (r.adm?ftuAdm(r):"")+'<button type="button" class="ghost" id="ftu-x">Закрыть</button></div>';
  $("ftu-x").onclick=closeModal;ftuBind(r);
  sh.querySelectorAll(".ftu-o:not([disabled])").forEach(b=>b.onclick=async()=>{const k=b.dataset.k;if(!confirm("Голосуешь за «"+ftuN(F[k])+"»? Переголосовать нельзя"))return;
    sh.querySelectorAll(".ftu-o").forEach(x=>x.disabled=true);const q=await act("ft_vote",{ch:k});if(!q){ftuDraw(r);return}sfx.fanfare();burst(3);hapN("success");ftuDraw(q)})}
function ftuSoc(r){if(!r.url&&!r.urlIg)return "";const S2=r.soc||{};
  const claim=S2.got?'<p class="cln vt-sgot">✅ Награда получена <b>+'+r.socSp+'&nbsp;🎴</b></p>':S2.open?'<button type="button" class="craftbtn vt-like" id="ftu-like" '+(S2.left>0?"disabled":"")+'>'+(S2.left>0?'⏳ Смотри видео… '+S2.left+' сек':'❤️ Я лайкнул и написал комментарий · +'+r.socSp+' 🎴')+'</button>':"";
  return '<div class="vt-soc"><b>🎬 Смотри серию турнира</b><button type="button" class="vt-play" id="ftu-play"><i>▶</i><span>Смотреть видео<small>поставь ❤️ лайк и напиши в комментариях, кто победит</small></span></button>'+claim+(!S2.open&&!S2.got&&r.socSp?'<small class="vt-sh">🎁 За лайк и комментарий: <b>+'+r.socSp+' 🎴</b></small>':'')+'</div>'}
function ftuGo(r,u){hap("light");try{tg&&tg.openLink?tg.openLink(u):open(u)}catch(e){open(u)}if(!(r.soc&&r.soc.open))act("ft_open").then(q=>{if(q)ftuDraw(q)})}
function ftuBind(r){clearInterval(FTU.tick);const pl=$("ftu-play");if(pl)pl.onclick=()=>{const L=[r.url,r.urlIg].filter(Boolean);if(L.length===1)return ftuGo(r,L[0]);
    let w=$("vt-pick");if(w)w.remove();w=document.createElement("div");w.id="vt-pick";w.className="vt-pick";w.innerHTML='<div class="vt-pk"><b>Где смотреть видео?</b><button type="button" class="vt-pt tt" data-u="0"><i>♪</i>TikTok</button><button type="button" class="vt-pt ig" data-u="1"><i>◎</i>Instagram</button><button type="button" class="ghost" id="vt-pkx">Отмена</button></div>';
    document.body.appendChild(w);w.onclick=e=>{if(e.target===w||e.target.id==="vt-pkx")w.remove()};w.querySelectorAll(".vt-pt").forEach(b=>b.onclick=()=>{w.remove();ftuGo(r,b.dataset.u==="0"?r.url:r.urlIg)})};
  const lk=$("ftu-like");if(lk&&r.soc&&r.soc.left>0){let left=r.soc.left;FTU.tick=setInterval(()=>{const b=$("ftu-like");if(!b){clearInterval(FTU.tick);return}left--;if(left<=0){clearInterval(FTU.tick);r.soc.left=0;ftuDraw(r);return}b.textContent="⏳ Смотри видео… "+left+" сек"},1000)}
  if(lk&&!(r.soc.left>0))lk.onclick=async()=>{lk.disabled=true;const q=await act("ft_soc");if(!q){lk.disabled=false;return}sfx.fanfare();burst(2);hapN("success");toast("❤️ +"+q.socSp+" 🎴 за поддержку видео!");ftuDraw(q)};
  const g=id=>document.getElementById(id);
  if(g("fa-start"))g("fa-start").onclick=async()=>{if(!confirm("Запустить турнир и открыть голосование за бой №1?"))return;const q=await act("ft_start");if(q){toast("🏆 Турнир запущен!");ftuDraw(q)}};
  if(g("fa-save"))g("fa-save").onclick=async()=>{const q=await act("ft_set",{url:g("fa-tt").value.trim(),urlIg:g("fa-ig").value.trim()});if(q){toast("✅ Ссылки сохранены");ftuDraw(q)}};
  if(g("fa-next"))g("fa-next").onclick=async()=>{if(!confirm("Закрыть голосование боя №"+(r.cur+1)+", начислить угадавшим и открыть следующий бой? Делай это прямо перед выходом новой серии."))return;const q=await act("ft_next");if(q){toast("✅ Итог подведён");ftuDraw(q)}};
  if(g("fa-fin"))g("fa-fin").onclick=async()=>{if(!confirm("Выдать награды топ-3?"))return;const q=await act("ft_fin",{vt:+g("fa-vt").value,vd:+g("fa-vd").value,s2:+g("fa-s2").value,s3:+g("fa-s3").value});if(q){toast("🏆 Награды выданы");ftuDraw(q)}}}
function ftuAdm(r){const A=r.adm||{},F=r.cur>=0?r.fights[r.cur]:null;let h='<div class="vt-adm"><b>👑 Только для тебя</b>';
  if(r.cur<0)return h+'<small>Нажми, когда выложишь серию 1 (представление бойцов). Исход каждого боя решает жребий по силе карт в момент открытия голосования.</small><button type="button" class="craftbtn" id="fa-start">▶ Запустить турнир (бой №1)</button></div>';
  if(F&&F.st===1){h+='<small>🤫 Исход боя №'+(r.cur+1)+' (жребий, никому не говори): <b>'+ftuN(A.w==="a"?F.a:F.b)+'</b> побеждает. Снимай следующую серию под этот итог.</small><small>Голоса: '+ftuN(F.a)+' '+(F.pa||0)+'% · '+ftuN(F.b)+' '+(F.pb||0)+'% · всего '+(F.tot||0)+' · лайки: '+(A.soc||0)+'</small>'+
    '<small>🎵 TikTok</small><input id="fa-tt" placeholder="https://www.tiktok.com/@…/video/…" value="'+rdEsc(A.url)+'"><small>📸 Instagram</small><input id="fa-ig" placeholder="https://www.instagram.com/reel/…" value="'+rdEsc(A.urlIg)+'"><button type="button" class="craftbtn" id="fa-save">💾 Сохранить ссылки на серию</button>'+
    '<button type="button" class="craftbtn" id="fa-next">🏁 Итог боя №'+(r.cur+1)+(r.cur+1<r.fights.length?' и открыть бой №'+(r.cur+2):'')+'</button>'}
  else if(!r.fin)h+='<small>Финал завершён. Награды топ-3: 🥇 VIP (+ NFT-подарок в Telegram ты отправляешь сам), 🥈🥉 звёзды на игровой баланс.</small><label>VIP уровень (1 Серебро · 2 Золото · 3 Алмаз) <input id="fa-vt" type="number" min="1" max="3" value="3"></label><label>VIP дней <input id="fa-vd" type="number" min="1" max="90" value="30"></label><label>⭐ за 2 место <input id="fa-s2" type="number" min="0" value="200"></label><label>⭐ за 3 место <input id="fa-s3" type="number" min="0" value="100"></label><button type="button" class="craftbtn" id="fa-fin">🏆 Выдать награды</button>';
  else h+='<small>Награды выданы: '+(A.prz||[]).map((p,i)=>(i+1)+') '+rdEsc(p.name)+' (ID '+p.uid+', угадал '+p.n+')').join(" · ")+'. NFT-подарок 1 месту отправь в Telegram сам.</small>';
  return h+'</div>'}
function ftuStrip(){let b=$("ftustrip");if(b)b.remove();return;const R=S&&ONLINE?S.ft:null;if(!R||R.ch){if(b)b.remove();return}
  const txt='<i>🏆</i><span><b>Турнир Эпох · бой '+R.n+'</b><small>'+ftuN(R.a)+' vs '+ftuN(R.b)+' — кто победит? Угадай · +🎴</small></span><em>▶</em>';
  if(!b){const hd=$("vtstrip")||$("rdstrip")||$("r3strip")||$("cstrip")||document.querySelector("header");if(!hd)return;b=document.createElement("button");b.type="button";b.id="ftustrip";b.className="r3strip vtstrip ftustrip";hd.after(b);b.onclick=()=>{hap("light");ftuOpen()}}
  if(b.dataset.n!==String(R.n)){b.dataset.n=R.n;b.innerHTML=txt}}
setInterval(()=>{try{ftuStrip()}catch(e){}},1500);
{const q=new URLSearchParams(location.search).get("startapp")||(()=>{try{return tg&&tg.initDataUnsafe&&tg.initDataUnsafe.start_param||INITP.get("start_param")}catch(e){return ""}})();if(q==="ft"||INITP.get("ft")){const t=setInterval(()=>{if(!S)return;clearInterval(t);setTimeout(ftuOpen,1200)},400)}}

/* 🗳 Голосование: все текущие «Выборы серии» на одной странице */
function voteHub(){const m=$("modal"),sh=$("msheet");m.hidden=false;const L=(S&&S.vts)||[];
  const card=(id,ic,t,sub,st,cls)=>'<button type="button" class="vh-c '+cls+'" data-vid="'+id+'"><i>'+ic+'</i><span><b>'+t+'</b><small>'+sub+'</small></span><em>'+st+'</em></button>';
  sh.innerHTML='<div class="box nickbox vhbox"><div class="vh-hd">🗳 <b>Голосование</b><small>Решай, что будет в следующей серии — и получай 🎴 за голос</small></div>'+
   (L.length?L.map(V=>card(V.id,V.id==="sv1"?"🪵":"⚔️",escH(V.title),escH(V.ser||"Выбор серии")+" · что будет дальше?",V.ch?"✅ голос принят":"🔥 голосуй!",V.ch?"":"hot")).join(""):'<p class="cln">Скоро новая серия и новое голосование!</p>')+
   '<button type="button" class="ghost" id="vh-x">Закрыть</button></div>';
  $("vh-x").onclick=closeModal;sh.querySelectorAll(".vh-c").forEach(b=>b.onclick=()=>{hap("light");vtOpen(b.dataset.vid)})}

/* 🗳 единая плашка «Голосование» сразу под бегущей строкой */
function vhStrip(){const L=S&&ONLINE?(S.vts||[]):[];let b=$("vhstrip");const old=$("vtstrip");if(old)old.remove();
  if(!L.length){if(b)b.remove();return}
  const todo=L.filter(x=>!x.ch).map(x=>x.title);
  const txt='<i>🗳</i><span><b>Голосование'+(todo.length?' — голосуй!':' ✅')+'</b><small>'+(todo.length?todo.join(" · ")+" · +🎴":"Ты проголосовал везде — жди новую серию")+'</small></span><em>▶</em>';
  if(!b){const sp=$("sec-spin"),hy=$("hype");if(!sp)return;b=document.createElement("button");b.type="button";b.id="vhstrip";b.onclick=()=>{hap("light");voteHub()};if(hy&&hy.parentNode===sp)hy.after(b);else sp.insertBefore(b,sp.firstChild)}
  else{const hy=$("hype");if(hy&&b.previousElementSibling!==hy&&hy.parentNode===b.parentNode)hy.after(b)}
  b.className="r3strip vtstrip vhstrip"+(todo.length?" hot":"");if(b.dataset.t!==txt){b.dataset.t=txt;b.innerHTML=txt}}
setInterval(()=>{try{vhStrip()}catch(e){}},1500);
