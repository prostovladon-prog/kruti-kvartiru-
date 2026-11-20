/* Викторина с единственной серверной попыткой. */
let BQUIZ=null,bqBusy=false,bqClock=0,bqOffset=0;
function bqHome(){
 const r=S&&S.quiz;let box=$("birthday-quiz-strip");
 if(!ONLINE||!r){box?.remove();return}
 if(!box){const anchor=$("chal")||$("stage");if(!anchor)return;box=document.createElement("button");box.type="button";box.id="birthday-quiz-strip";box.className="r3strip vtstrip";anchor.before(box);box.onclick=bqOpen}
 box.innerHTML='<i>🧠</i><span><b>Викторина «Знаток Эпох»</b><small>'+
  (r.done?'Твой результат: '+r.score+' / 10 · '+(r.paid?'+30 прокруток получено':Date.now()+bqOffset>=r.end?'Посмотреть итог':'Итоги в 22:00'):
   r.started?'Продолжить единственную попытку':Date.now()+bqOffset>=r.end?'Викторина завершена':'10 вопросов · 2 минуты · лидерам +30 прокруток')+'</small></span><em>▶</em>';
 if(r.started&&!r.done&&!$("birthday-quiz-dialog")&&!bqBusy)bqRequest("quiz_get");
}
async function bqOpen(){
 if(bqBusy)return;
 if(!S.quiz?.started&&Date.now()+bqOffset<S.quiz.end&&!confirm("Начать единственную попытку? 10 вопросов за 2 минуты, завершение не позднее 22:00 по Минску. Таймер идёт даже после выхода. Все игроки с лучшим результатом получат по 30 прокруток после 22:00."))return;
 await bqRequest(S.quiz?.started||Date.now()+bqOffset>=S.quiz.end?"quiz_get":"quiz_start");
}
async function bqRequest(name,p){
 if(bqBusy)return;bqBusy=true;
 try{
  const r=await act(name,p);if(!r){bqError();return}
  BQUIZ=r;bqOffset=r.now-Date.now();S.quiz={...r,question:null};bqDraw();bqHome();
 }catch(e){console.error("quiz",e);bqError()}
 finally{bqBusy=false;if($("birthday-quiz-dialog"))bqTimer()}
}
function bqError(){const e=$("bq-status");if(e)e.textContent="Связь прервалась. Таймер продолжается. Нажми «Восстановить вопрос».";const retry=$("bq-retry");if(retry)retry.hidden=false;document.querySelectorAll(".bq-answer").forEach(b=>b.disabled=false)}
function bqDraw(){
 let d=$("birthday-quiz-dialog");if(!d){d=document.createElement("div");d.id="birthday-quiz-dialog";d.className="bq-dialog";d.setAttribute("role","dialog");d.setAttribute("aria-modal","true");d.setAttribute("aria-label","Викторина Знаток Эпох");document.body.append(d)}
 const r=BQUIZ;
 if(r.done||!r.started){d.innerHTML='<div class="box bq-box"><h3>🧠 Знаток Эпох</h3><div class="bq-result">'+(r.started?r.score+' / 10':'Викторина завершена')+'</div><p>'+(r.paid?'🎁 Ты в числе победителей! 30 прокруток начислены.':r.now>=r.end?'По 30 прокруток начислены всем игрокам с лучшим ненулевым результатом.':'Итоги сегодня в 22:00 по Минску. Все игроки с лучшим ненулевым результатом получат по 30 прокруток.')+'</p><button type="button" class="craftbtn" id="bq-close">Вернуться в игру</button></div>';
  $("bq-close").onclick=()=>{d.remove();clearInterval(bqClock);bqClock=0};return}
 const q=r.question;d.innerHTML='<div class="box bq-box"><div class="bq-head"><b>🧠 ЗНАТОК ЭПОХ</b><strong id="bq-time"></strong></div><div class="bq-track"><i style="width:'+r.index*10+'%"></i></div><p class="cln">Вопрос '+(r.index+1)+' из 10 · одна попытка</p><h3 id="bq-question"></h3><div class="bq-options"></div><p class="cln" id="bq-status">Выбери один ответ. Изменить его будет нельзя.</p><button type="button" class="ghost" id="bq-retry" hidden>Восстановить вопрос</button></div>';
 $("bq-question").textContent=q?.text||"Восстанавливаю вопрос…";
 (q?.options||[]).forEach((text,i)=>{const b=document.createElement("button");b.type="button";b.className="bq-answer";b.textContent=text;b.onclick=()=>{if(bqBusy)return;d.querySelectorAll(".bq-answer").forEach(x=>x.disabled=true);b.classList.add("selected");bqRequest("quiz_answer",{index:r.index,option:i})};d.querySelector(".bq-options").append(b)});
 $("bq-retry").onclick=()=>bqRequest("quiz_get");
 if(!bqClock)bqClock=setInterval(bqTimer,250);bqTimer();
}
function bqTimer(){
 const r=BQUIZ,e=$("bq-time");if(!r||r.done||!e)return;
 const left=Math.max(0,Math.ceil((r.deadline-Date.now()-bqOffset)/1000));e.textContent=Math.floor(left/60)+":"+String(left%60).padStart(2,"0");e.classList.toggle("urgent",left<=20);
 if(!left){document.querySelectorAll(".bq-answer").forEach(b=>b.disabled=true);if(!bqBusy)bqRequest("quiz_get")}
}
{const renderBeforeQuiz=renderAll;renderAll=function(){const r=renderBeforeQuiz.apply(this,arguments);try{bqHome()}catch(e){console.error("quiz home",e)}return r}}
