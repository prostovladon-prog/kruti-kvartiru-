/* 🎟 Гонка купонов 28–29.11: купоны за действия в игре и за каждые 3 минуты игры.
   Главный экран не двигаем: плитка в ленте «Сейчас важно», баннер в «Ещё», окно гонки и полные правила. */
(function(){
let TKS=null,tkActT=Date.now(),tkPingAt=0;const $$=id=>document.getElementById(id);
["pointerdown","touchstart","keydown","scroll"].forEach(ev=>document.addEventListener(ev,()=>{tkActT=Date.now()},{passive:true,capture:true}));
const E=t=>String(t==null?"":t).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const tkT=ms=>{ms=Math.max(0,ms);const d=Math.floor(ms/864e5),h=Math.floor(ms%864e5/36e5),m=Math.floor(ms%36e5/6e4),s=Math.floor(ms%6e4/1e3);return (d?d+" д ":"")+(d||h?h+" ч ":"")+(d?"":m+" мин ")+(d||h?"":s+" с")};
const NOW=()=>Date.now()+(TKS?TKS.off:0);
const phase=()=>{if(!TKS)return -1;const n=NOW();return n<TKS.start?0:n<TKS.end?1:2};
const shown=()=>TKS&&NOW()<TKS.end+864e5;
async function ping(force){if(typeof S==="undefined"||!S||!ONLINE||document.hidden)return;const now=Date.now();if(!force&&now-tkPingAt<30e3)return;tkPingAt=now;
  try{const r=await fetch(API_URL.replace(/\/$/,"")+"/api",{method:"POST",headers:{"Content-Type":"application/json","X-Init-Data":INIT||"","X-Dev-User":DEV_USER||""},body:JSON.stringify({a:"tk_ping",p:{act:now-tkActT<3*6e4?1:0}})});const j=await r.json();
    if(j.ok){const was=TKS?TKS.n:-1;TKS=j.res;TKS.off=TKS.now-Date.now();if(was>=0&&TKS.n>was&&phase()===1)fl(TKS.n-was);try{nowSig=""}catch(e){}if($$("tkbox"))open()}}catch(e){}}
function fl(d){const e=document.createElement("div");e.className="tk-fl";e.textContent="+"+d+" 🎟";document.body.appendChild(e);setTimeout(()=>e.remove(),1600)}
const medal=["🥇","🥈","🥉"];
const rateTxt=r=>r===1?"×1":r===.5?"×½":r===.25?"×¼":"лимит дня";
function open(){const T=TKS;if(!T)return;const m=$$("modal"),sh=$$("msheet");m.hidden=false;const now=NOW(),st=phase();
  const ava=x=>{try{return typeof avaHTML==="function"&&x.ava?avaHTML(x.ava,"xs"):""}catch(e){return ""}};
  sh.innerHTML='<div class="box nickbox tkbox" id="tkbox"><small class="tk-k">🎟 28–29 НОЯБРЯ · 08:00 СБ → 22:00 ВС ПО МИНСКУ</small><h3>Гонка купонов</h3>'+
   '<div class="tk-tm">'+(st===0?'Старт через <b>'+tkT(T.start-now)+'</b>':st===1?'До финиша <b>'+tkT(T.end-now)+'</b>':'<b>Гонка завершена</b>')+'</div>'+
   '<button type="button" class="craftbtn" id="tk-rules" style="margin:6px 0">📖 Правила — как получать купоны</button>'+
   '<div class="tk-me"><div><b>'+T.n+'</b><small>твоих купонов</small></div><div><b>'+(T.rank?'#'+T.rank:'—')+'</b><small>место из '+T.cnt+'</small></div></div>'+
   '<div class="tk-pr">'+T.prizes.map((p,i)=>'<div><i>'+medal[i]+'</i><b>'+E(p)+'</b></div>').join("")+'</div>'+
   (T.fin?'<div class="tk-fin"><b>🏆 Победители</b>'+T.fin.w.map((w,i)=>'<div>'+medal[i]+' '+E(w.name)+' — '+w.n+' 🎟</div>').join("")+'</div>':'')+
   '<div class="tk-top"><b>🏁 Таблица лидеров</b>'+(T.top.length?T.top.map((x,i)=>'<div class="'+(x.me?"me":"")+'"><em>'+(medal[i]||i+1)+'</em>'+ava(x)+'<span>'+E(String(x.name).slice(0,18))+'</span><b>'+x.n+' 🎟</b></div>').join(""):'<p class="cln">Пока пусто — стань первым!</p>')+'</div>'+
   (st===1&&T.caps&&T.caps.length?'<div class="tk-how tk-caps"><b>Твои купоны сегодня</b><p class="cln">×1 — полная цена, ×½ и ×¼ — купоны идут медленнее. В 00:00 по Минску всё снова ×1.</p>'+T.caps.map(c=>'<div class="'+(c.rate===0?"full":"")+'"><span>'+E(c.n)+'</span><small>'+c.have+' 🎟 · '+rateTxt(c.rate)+(c.next&&c.rate===1?' · ещё '+c.next+' по полной':'')+'</small></div>').join("")+'</div>':'')+
   '<p class="cln">Покупки, прокрутки, казино и платные попытки купонов не дают — победу не купить за звёзды.</p><button type="button" class="ghost" id="tk-x">Закрыть</button></div>';
  $$("tk-x").onclick=closeModal;$$("tk-rules").onclick=rules}
function rules(){const T=TKS;if(!T)return;const m=$$("modal"),sh=$$("msheet");m.hidden=false;
  const how=(T.how||[]).map(h=>'<div><i>'+h[0]+'</i><span><b>'+E(h[1])+'</b><br><small>'+E(h[2])+'</small></span></div>').join("");
  const sec=(t,b)=>'<div class="tk-how"><b>'+t+'</b>'+b+'</div>',p=t=>'<p class="cln" style="text-align:left;margin:6px 0">'+t+'</p>';
  sh.innerHTML='<div class="box nickbox tkbox" id="tkrules"><small class="tk-k">🎟 ГОНКА КУПОНОВ</small><h3>📖 Правила</h3>'+
   sec("⏰ Когда",p("С <b>28 ноября 08:00</b> до <b>29 ноября 22:00</b> по Минску. В 22:00 таблица замирает, призы выдаются автоматически."))+
   sec("🏆 Призы",p("🥇 300 ⭐ + Мифический сундук<br>🥈 200 ⭐ + Сундук Империи<br>🥉 100 ⭐ + Легендарный сундук<br><br>Звёзды приходят на игровой баланс, сундук — во вкладку призов. Побеждают трое с наибольшим числом купонов. При равенстве выше тот, кто набрал итоговую сумму раньше."))+
   sec("🎟 Как получать купоны",how)+
   sec("📉 Без лимитов, но с умом",p("Жёстких лимитов почти нет: играть можно сколько хочешь. Но у каждого действия есть <b>полная цена в день</b> (×1), после неё купоны идут вдвое медленнее (×½), а потом — вчетверо (×¼). Поэтому выгоднее играть разнообразно и заходить <b>оба дня</b>: в 00:00 по Минску все дневные счётчики обнуляются.<br><br>Свой текущий темп по каждому действию видно в окне гонки: «×1», «×½», «×¼»."))+
   sec("⏱ Купоны за время",p("+1 купон за каждые 3 минуты, когда игра открыта и ты что-то нажимаешь. Если игра свёрнута или ты ничего не делаешь больше 3 минут — время не идёт. Первые 3 часа в день — ×1, потом ×½, после 6 часов — ×¼."))+
   sec("🚫 Что НЕ даёт купонов",p("Покупки за звёзды, прокрутки и открытие карт, казино, лотерея, рынок, ставки в боях, забеги Башни по купленным ключам, лишние забеги по VIP или пропуску, платные поединки рыцаря за монеты. Победу нельзя купить — только сыграть."))+
   sec("🛡 Честная игра",p("Обычные бои — не чаще одного раза в 20 секунд. Рейтинговый бой засчитывается, только если ты сделал хотя бы один ход; с одним соперником — до 5 боёв в день. Друг засчитывается, если пришёл по твоей ссылке во время гонки, открыл 15 карт и подписан на канал и чат.<br><br>Мультиаккаунты, автокликеры и договорные бои — снятие с гонки без приза. Топ проверяется вручную перед выдачей."))+
   sec("❓ Частые вопросы",p("<b>Победа и поражение дают разное?</b> Нет, одинаково — важно играть.<br><b>VIP даёт больше купонов?</b> Нет, у всех одинаково.<br><b>Купоны сгорают?</b> Нет, всё за два дня суммируется.<br><b>Не начислился купон?</b> Подожди до 30 секунд — счёт обновляется. Если действие было после лимита дня (×0), купона нет.<br><b>Где моё место?</b> В окне гонки: «место из …»."))+
   '<button type="button" class="craftbtn" id="tk-back">← К гонке</button><button type="button" class="ghost" id="tk-x2">Закрыть</button></div>';
  $$("tk-back").onclick=open;$$("tk-x2").onclick=closeModal}
window.tkOpen=open;
/* плитка в ленте «Сейчас важно» — лента над карточкой, листается вбок, карточку не двигает */
if(typeof nowItems==="function"){const ni=nowItems;nowItems=function(){const L=ni.apply(this,arguments);try{if(shown()){const st=phase();L.unshift({k:"tk",ic:"🎟",t:"Гонка купонов",s:st===0?"старт 28.11 в 08:00":st===1?TKS.n+" 🎟 · "+(TKS.rank?"место #"+TKS.rank:"начни играть"):"итоги гонки",c:"#d02a89,#5a1a9a",hot:st===1,em:st===1&&TKS.rank&&TKS.rank<=3?medal[TKS.rank-1]:""})}}catch(e){}return L}}
/* слайд в верхней карусели (лотерея / голосование) — листается, карточку не двигает */
try{if(typeof EVENT_BARS!=="undefined"&&!EVENT_BARS.includes("tk-slide"))EVENT_BARS.push("tk-slide")}catch(e){}
function slide(){const sp=$$("sec-spin");if(!sp)return;let b=$$("tk-slide");if(!shown()){if(b){b.remove();try{evCar()}catch(e){}}return}
  const st=phase(),txt='<i>🎟</i><span><b>'+(st===0?"Гонка купонов — старт 28.11 в 08:00":st===1?"Гонка купонов: у тебя "+TKS.n+" 🎟":"Гонка купонов — итоги")+'</b><small>'+(st===0?"2 дня · купоны за игру · победу не купить":st===1?(TKS.rank?"место #"+TKS.rank+" · ":"")+"до финиша "+tkT(TKS.end-NOW()):"смотри победителей")+'</small></span><em>›</em>';
  if(!b){b=document.createElement("button");b.type="button";b.id="tk-slide";b.className="lot-bar";b.style.background="linear-gradient(135deg,#d02a89,#5a1a9a)";b.onclick=()=>open();sp.appendChild(b);b.innerHTML=txt;try{evCar()}catch(e){}return}
  if(b.innerHTML!==txt)b.innerHTML=txt}
/* «Ещё»: баннер «Сейчас идёт» и переход в гонку */
{const mo=window.menuOpen;if(typeof mo==="function")window.menuOpen=menuOpen=function(){const x=mo.apply(this,arguments);try{if(shown()){const box=document.querySelector("#drw .drw-b");if(box&&!box.querySelector("[data-go=tk]")){const st=phase(),b=document.createElement("button");b.type="button";b.className="drw-ban";b.dataset.go="tk";b.style.background="linear-gradient(135deg,#d02a89,#5a1a9a)";b.innerHTML='<i>🎟</i><span><b>'+(st===2?"Итоги гонки купонов":"Сейчас идёт: Гонка купонов")+'</b><small>'+(st===1?"У тебя "+TKS.n+" 🎟 · до финиша "+tkT(TKS.end-NOW()):st===0?"Старт 28.11 в 08:00 · 2 дня":"Смотри победителей")+'</small></span><em>›</em>';box.prepend(b)}}}catch(e){}return x};
 const mg=window.menuGo;if(typeof mg==="function")window.menuGo=menuGo=function(k){if(k!=="tk")return mg.apply(this,arguments);try{menuClose()}catch(e){}if(TKS)open();else ping(true).then(()=>{if(TKS)open()})}}
setInterval(()=>{try{ping();slide();const o=$$("tkbox");if(o&&TKS){const t=o.querySelector(".tk-tm b"),n=NOW();if(t&&n<TKS.end)t.textContent=tkT((n<TKS.start?TKS.start:TKS.end)-n)}}catch(e){}},1000);
/* после действий — быстрее обновить счёт */
{const _a=act;act=async function(name){const r=await _a.apply(this,arguments);if(r&&TKS&&phase()===1&&TKS.act&&(TKS.act[name]||["rk_get","rk_act","kn_duel"].includes(name)))setTimeout(()=>ping(true),400);return r}}
if(new URLSearchParams(location.search).get("tk")){const t=setInterval(()=>{if(typeof S==="undefined"||!S||!ONLINE||$$("boot")||!TKS)return;clearInterval(t);setTimeout(open,400)},500)}
})();
