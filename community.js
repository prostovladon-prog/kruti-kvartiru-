/* Сообщество и конкурс приглашений. */
let communityBusy=false,communityTutorial=false,recruitPanel=null,recruitRefresh=0;
const communityOldTutDone=tutDone;
tutDone=function(){if(!TUTM&&S&&ONLINE&&S.community?.required){tutClose();communityTutorial=true;communityShow(true);return}return communityOldTutDone.apply(this,arguments)};
function communityLink(url){try{tg.openTelegramLink(url)}catch(e){window.open(url,"_blank","noopener")}}
function communityShow(force=false){
 const required=S&&ONLINE&&S.community?.required;let d=$("community-gate");
 if(!required){d?.remove();return}
 if(!force&&($("tut")||$("nks")||$("birthday-quiz-dialog")))return;
 if(communityBusy)return;if(d)return;
 $("sbg")?.remove();$("chg")?.remove();d=document.createElement("div");d.id="community-gate";d.className="bq-dialog community-dialog";d.setAttribute("role","dialog");d.setAttribute("aria-modal","true");document.body.append(d);
 const c=S.community;
 d.innerHTML='<div class="box bq-box"><div class="community-icon">⚔️</div><h3>Вступи в сообщество Эпох</h3><p>Заверши обучение: подпишись на канал и вступи в чат игроков. Бот проверит обе подписки.</p><button type="button" class="community-link" id="community-channel">'+(c.channel?'✅':'📢')+' Канал · новости и промокоды</button><button type="button" class="community-link" id="community-chat">'+(c.chat?'✅':'💬')+' Чат · игроки, кланы и общение</button><p class="cln">За первую проверку канала +10 прокруток, чата +5. Уже полученные награды повторно не выдаются.</p><button type="button" class="craftbtn" id="community-check">Проверить обе подписки</button><p class="nkerr" id="community-error" aria-live="polite"></p></div>';
 $("community-channel").onclick=()=>communityLink("https://t.me/voinyepoh");$("community-chat").onclick=()=>communityLink("https://t.me/voinyepohchat");
 $("community-check").onclick=async()=>{if(communityBusy)return;communityBusy=true;const button=$("community-check");button.disabled=true;button.textContent="Проверяем в Telegram…";
  try{const r=await act("community_check");if(!r){$("community-error").textContent="Не удалось проверить. Попробуй ещё раз.";return}
   if(!S.community?.required){d.remove();if(r.reward)toast("🎁 +"+r.reward+" прокруток за сообщество");if(communityTutorial){communityTutorial=false;communityOldTutDone()}renderAll();return}
   $("community-channel").textContent=(r.channel?"✅":"📢")+" Канал · новости и промокоды";$("community-chat").textContent=(r.chat?"✅":"💬")+" Чат · игроки, кланы и общение";
   $("community-error").textContent=r.error||(!r.channel&&!r.chat?"Подпишись на канал и вступи в чат, затем проверь ещё раз.":!r.channel?"Осталось подписаться на канал.":"Осталось вступить в чат.");
  }finally{communityBusy=false;if(button.isConnected){button.disabled=false;button.textContent="Проверить обе подписки"}}
 };
}
function recruitStrip(){
 const r=S&&ONLINE?S.recruit:null;let b=$("recruit-strip");if(!r){b?.remove();return}
 if(!b){b=document.createElement("button");b.type="button";b.id="recruit-strip";b.className="r3strip vtstrip recruit-strip";b.onclick=recruitOpen;const anchor=$("birthday-quiz-strip")||$("chal")||$("stage");if(!anchor)return;anchor.before(b)}
 b.innerHTML='<i>👥</i><span><b>ПРИЗЫВ ЭПОХ · 100 / 75 / 50 🎴</b><small>'+ (r.phase==="on"?'До 23:59 · зачтено '+r.n+(r.place?' · место '+r.place:''):r.phase==="checking"?'Проверяем подписки и подводим итоги':'Конкурс завершён · посмотреть победителей')+'</small></span><em>▶</em>';
}
async function recruitOpen(){
 if(!ONLINE)return;let d=$("recruit-dialog");if(!d){d=document.createElement("div");d.id="recruit-dialog";d.className="recruit-dialog";d.innerHTML='<div class="box recruit-box"><p>Загружаю конкурс…</p></div>';document.body.append(d)}
 const r=await act("recruit_get");if(!r){d.innerHTML='<div class="box recruit-box"><p>Не удалось загрузить конкурс.</p><button type="button" class="craftbtn" id="recruit-retry">Повторить</button><button type="button" class="ghost" id="recruit-close">Закрыть</button></div>';$("recruit-retry").onclick=recruitOpen;$("recruit-close").onclick=recruitClose;return}
 recruitPanel=r;recruitDraw();if(!recruitRefresh)recruitRefresh=setInterval(()=>{if(document.hidden||!$("recruit-dialog"))return;recruitOpen()},20000);
}
function recruitClose(){$("recruit-dialog")?.remove();clearInterval(recruitRefresh);recruitRefresh=0}
function recruitDraw(){const r=recruitPanel,d=$("recruit-dialog");if(!d)return;if(r.phase==="off"){d.innerHTML='<div class="box recruit-box"><h3>Конкурс завершён</h3><button type="button" class="ghost" id="recruit-close">Закрыть</button></div>';$("recruit-close").onclick=recruitClose;return}
 const reason={open:"Нужно открыть 15 карт",pending:"Ожидает проверки Telegram",error:"Проверка Telegram повторяется",both:"Нет подписок на чат и канал",channel:"Нужна подписка на канал",chat:"Нужно вступить в чат",late:"Условия не подтверждены до окончания конкурса",ok:"Друг зачтён"};
 d.innerHTML='<div class="box recruit-box"><div class="rd-ep">👥 КОНКУРС ПРИГЛАШЕНИЙ</div><h3>Призыв Эпох</h3><p class="recruit-prizes">🥇 100 · 🥈 75 · 🥉 50 прокруток</p><p><b>'+ (r.phase==="on"?'До 23:59 сегодня по Минску':r.phase==="checking"?'Идёт итоговая проверка подписок':'Конкурс завершён')+'</b></p><div class="recruit-my">Зачтено друзей: <b>'+r.n+'</b>'+(r.place?' · место <b>'+r.place+'</b>':'')+'</div><h4>Как засчитывается друг</h4><ol><li>Новый аккаунт приходит по твоей ссылке после запуска конкурса.</li><li>Открывает минимум <b>15 обычных карт</b>. Массовое открытие тоже считается.</li><li>Подписывается на <b>@voinyepoh</b> и вступает в <b>@voinyepohchat</b>. Подписки проверяет бот.</li><li>Выполняет условия до <b>23:59 по Минску</b> и сохраняет подписки до итоговой проверки.</li></ol><p class="cln">Один друг — одному пригласившему. При равном числе друзей выше тот, кто раньше достиг результата. Призы начисляются автоматически после закрытия и проверки подписок.</p>'+ (r.phase==="on"?'<button type="button" class="craftbtn" id="recruit-share">Пригласить друзей</button><button type="button" class="ghost" id="recruit-copy">Скопировать свою ссылку</button>':'')+'<h4>🏆 Таблица лидеров</h4><div id="recruit-top"></div><h4>Твои новые друзья</h4><div id="recruit-friends"></div><p class="cln">Проверки обновляются постепенно. Здесь показаны последние 100 друзей.</p><button type="button" class="ghost" id="recruit-close">Закрыть</button></div>';
 const top=$("recruit-top");if(!r.top.length)top.textContent="Пока нет зачтённых друзей — стань первым!";r.top.forEach((u,i)=>{const row=document.createElement("div");row.className="recruit-row";row.textContent=(i+1)+". "+u.name+" — "+u.n+" друзей";top.append(row)});
 const list=$("recruit-friends");if(!r.friends.length)list.textContent="Приглашённые друзья появятся здесь.";r.friends.forEach(u=>{const row=document.createElement("div");row.className="recruit-row";row.textContent=u.name+" · "+Math.min(15,u.opened)+"/15 · "+(u.qualified?"✅ Друг зачтён":reason[u.reason]||"Ожидает проверки");list.append(row)});
 if(r.phase==="done"){const mine=r.awards.find(a=>a.uid===S.uid);if(mine){const prize=document.createElement("p");prize.className="recruit-prizes";prize.textContent="🎁 Твоё место: "+mine.place+". +"+mine.spins+" прокруток начислено!";top.before(prize)}}
 $("recruit-close").onclick=recruitClose;if($("recruit-share"))$("recruit-share").onclick=()=>communityLink("https://t.me/share/url?url="+encodeURIComponent(r.link)+"&text="+encodeURIComponent("Присоединяйся к «Воинам Эпох»! Открой 15 карт и вступи в чат и канал — поможешь мне в конкурсе приглашений."));if($("recruit-copy"))$("recruit-copy").onclick=async()=>{try{await navigator.clipboard.writeText(r.link);toast("Ссылка скопирована")}catch(e){prompt("Твоя ссылка для друзей",r.link)}};
}
{const renderCommunityBefore=renderAll;renderAll=function(){const r=renderCommunityBefore.apply(this,arguments);try{recruitStrip();communityShow()}catch(e){console.error("community",e)}return r}}
setInterval(()=>{try{if(document.hidden)return;communityShow();recruitStrip()}catch(e){}},2500);
