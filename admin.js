/* 👑 Админка — одна понятная страница: сегодня, деньги, неделя, обучение, быстрые кнопки */
async function admOpen(){if(!S||!S.admin)return;const m=$("modal"),sh=$("msheet");m.hidden=false;sh.innerHTML='<div class="box nickbox admbox"><div class="rd-load">👑</div></div>';const r=await act("adm_dash");if(!r){closeModal();return}admDraw(r)}
function admDraw(R){const sh=$("msheet");if(!sh)return;const U=R.U,F=R.F,n=x=>Number(x||0).toLocaleString("ru-RU"),pc=(a,b)=>b?Math.round(a/b*100)+"%":"—";
  const tile=(v,l,c,sub)=>'<div class="ad-t" style="--c:'+c+'"><b>'+v+'</b><span>'+l+'</span>'+(sub?'<small>'+sub+'</small>':'')+'</div>';
  const mx=Math.max(1,...R.days.map(d=>Math.max(d.n,d.a))),ms=Math.max(1,...R.days.map(d=>d.s));
  const chart='<div class="ad-ch">'+R.days.map(d=>'<div><i class="a" style="height:'+(d.a/mx*100)+'%"></i><i class="n" style="height:'+(d.n/mx*100)+'%"></i><em style="height:'+(d.s/ms*100)+'%"></em><small>'+d.d.slice(3)+'.'+d.d.slice(0,2)+'</small></div>').join("")+'</div><div class="ad-lg"><span class="a">активные</span><span class="n">новые</span><span class="s">⭐ доход</span></div>';
  const step=(l,v,base)=>'<div class="ad-f"><span>'+l+'</span><div><i style="width:'+(base?v/base*100:0)+'%"></i></div><b>'+n(v)+'</b><u>'+pc(v,base)+'</u></div>';
  const go=(k,ic,t)=>'<button type="button" class="ad-b" data-k="'+k+'"><i>'+ic+'</i>'+t+'</button>';
  sh.innerHTML='<div class="box nickbox admbox"><div class="ad-hd"><b>👑 Админка</b><button type="button" id="ad-rl">⟳</button></div>'+
   '<div class="ad-g">'+tile(n(U.on),"онлайн сейчас","#3ddc84")+tile(n(U.a1),"играли сегодня","#0a84ff")+tile(n(U.t),"новых сегодня","#ffb020","вчера "+n(U.y))+tile(n(R.S.t)+" ⭐","доход сегодня","#ffd23f",n(R.S.tu)+" покупателей · вчера "+n(R.S.y))+'</div>'+
   '<div class="ad-s"><h4>📅 Неделя</h4><div class="ad-g3">'+tile(n(U.w),"новых за 7 дней","#ffb020")+tile(n(U.a7),"активных за 7 дней","#0a84ff")+tile(n(R.S.w)+" ⭐","доход за 7 дней","#ffd23f")+'</div>'+chart+'</div>'+
   '<div class="ad-s"><h4>🎓 Новое обучение <small>с '+new Date(F.since).toLocaleString("ru-RU",{day:"2-digit",month:"2-digit",hour:"2-digit",minute:"2-digit"})+'</small></h4>'+
    step("Пришли новые",F.n,F.n)+step("Прошли обучение и поставили ник",F.nk,F.n)+step("Сделали 15 открытий",F.o15,F.n)+step("Подписались на канал",F.sub,F.n)+step("Вернулись на следующий день",F.back,F.n)+'</div>'+
   '<div class="ad-s"><h4>⚡ Быстрые действия</h4><div class="ad-bs">'+go("stars","⭐","Звёзды игроку")+go("promo","🎟","Создать промокод")+go("ads","📈","Реклама")+go("dm","✉️","Сообщения")+go("rf","🎁","Реф-слоты")+go("vote","🗳","Голосования")+go("tut","🎓","Обучение")+go("chat","💬","Чат")+'</div><button type="button" class="tu-next ad-all" id="ad-all">📊 Вся подробная статистика</button><div>'+'</div>'+
   '<small class="ad-n">Всего игроков: <b>'+n(U.n)+'</b> · пришли по приглашениям в реф-слотах: <b>'+n(R.ref)+'</b></small></div>'+
   '<button type="button" class="ghost" id="ad-x">Закрыть</button></div>';
  $("ad-x").onclick=closeModal;$("ad-all").onclick=admStats;$("ad-rl").onclick=()=>{hap("light");admOpen()};
  sh.querySelectorAll(".ad-b").forEach(b=>b.onclick=()=>{const k=b.dataset.k;closeModal();if(k==="rf")return openCas("rc");if(k==="vote")return voteHub();if(k==="tut")return tutOpen(true);if(k==="chat")return openChat();if(k==="promo")return admPromo();menuGo(k)})}
/* 🎟 создание промокодов — раньше жило в старой статистике */
function admPromo(){const m=$("modal"),sh=$("msheet");m.hidden=false;sh.innerHTML='<div class="box nickbox admbox"><div class="ad-hd"><b>🎟 Промокоды</b></div><div id="pr-adm" class="srcbox prad"></div><button type="button" class="ghost" id="ad-px">← Назад в админку</button></div>';$("ad-px").onclick=admOpen;promoAdmin($("pr-adm"))}
/* старый громоздкий блок статистики прячем — всё нужное теперь в «👑 Админке» */
let ADMST=null;
setInterval(()=>{const b=document.getElementById("admin-stats");if(b){ADMST=b;if(!b.hidden&&!b.closest("#msheet"))b.hidden=true}},1500);
/* 📊 вся подробная статистика (старая), внутри админки, без лишнего: эфир, старый конкурс видео, промокоды (они теперь отдельной кнопкой) */
function admClean(){["vid-go","pr-adm","ttadm","stadm"].forEach(id=>{const e=document.getElementById(id);if(e)e.remove()})}
function admStats(){const b=ADMST||document.getElementById("admin-stats");if(!b)return toast("Статистика ещё грузится — попробуй через пару секунд");const m=$("modal"),sh=$("msheet");m.hidden=false;
  sh.innerHTML='<div class="box nickbox admbox adst"><div class="ad-hd"><b>📊 Вся статистика</b><button type="button" id="ad-sb">← Назад</button></div><div id="ad-st"></div></div>';
  $("ad-st").appendChild(b);b.hidden=false;$("ad-sb").onclick=admOpen;try{loadStats(true)}catch(e){}[300,1200,3000].forEach(t=>setTimeout(admClean,t))}
