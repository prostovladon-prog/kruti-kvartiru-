/* 🎁 Реф-кейс и 🪙 Плинко — прокрутки только за приглашённых друзей */
const RFX={d:null,busy:false};
const RF_IC={"0":"💨",ch:"📦",nft:"🎁",x2:"💰",b50:"💳",b60:"💳"},RF_BK=["s500","s50","nft","x2","s15","s5","s2","0","s1","s3","b50","s10","ch","b60","s25","s100"];
const rfLbl=k=>k==="0"?"Пусто":k==="ch"?"Сундук":k==="nft"?"NFT":k==="x2"?"x2 ⭐":k[0]==="b"?"+"+k.slice(1)+"⭐ к попол.":k.slice(1)+"⭐";
const rfIco=k=>RF_IC[k]||"⭐";
const rfCol=k=>({x2:"#ff7a00",b50:"#00b3a4",b60:"#00b3a4",s500:"#ff2e63",s100:"#bf5af2",nft:"#bf5af2",s50:"#0a84ff",s25:"#0a84ff",ch:"#34c759",s15:"#34c759",s10:"#ffb020",s5:"#ffb020"})[k]||(k==="0"?"#4a4a5a":"#8f9bb3");
const rfTile=(k,pc)=>'<div class="rf-t'+(k==="s500"?" jp":"")+'" style="--c:'+rfCol(k)+'"><i>'+rfIco(k)+'</i><b>'+rfLbl(k)+'</b>'+(pc!=null?'<small>'+(pc>=1?Math.round(pc*10)/10:pc)+'%</small>':'')+'</div>';
async function rfLoad(){const r=await act("rf_get");if(r){RFX.d=r;renderCas()}}
const _renderCasRF=renderCas;
renderCas=function(){if(!S||$("sec-cas").hidden)return;if(csTab!=="rc"&&csTab!=="pl")return _renderCasRF();
  csBal();document.querySelectorAll("#cs-seg button").forEach(b=>b.setAttribute("aria-pressed",b.dataset.c===csTab));const B=$("cs-body"),R=RFX.d;
  if(!R){B.innerHTML='<div class="rd-load">🎁</div>';rfLoad();return}
  const pc={};R.P.forEach(x=>pc[x.k]=x.w);const pl=csTab==="pl";
  const top='<div class="rf-hd"><div class="rf-n"><b>'+R.left+'</b><span>🎟 реф-прокруток</span>'+(R.gift?'<em class="rf-gf">🎁 1 бесплатная!</em>':'')+'</div><div class="rf-fr">👥 Друзья: <b>'+R.ok+'</b> играют'+(R.pend?' · <b>'+R.pend+'</b> ещё не начали':'')+'<small>1 друг = 1 прокрутка, когда он: сделает '+R.op+' открытий карт, подпишется на канал (кнопка «Проверить» в заданиях) и поставит ник. Считаются только новые приглашения.</small></div>'+
    '<button type="button" class="rf-inv" id="rf-inv">📨 Позвать друга</button></div>';
  const game=pl?'<div class="rf-pl"><canvas id="rf-cv" width="680" height="760"></canvas></div>':'<div class="rf-rc"><div class="rf-ptr"></div><div class="rf-strip" id="rf-strip">'+rfStrip(null)+'</div></div>';
  const btn=R.left?'<button type="button" class="rf-go" id="rf-go">'+(pl?'🪙 Бросить монетку':'🎁 Открыть кейс')+' · 1 🎟</button>':'<button type="button" class="rf-go inv" id="rf-go">📨 Позови друга — получи прокрутку</button>';
  const prizes='<div class="rf-box"><b>📦 Что внутри</b><div class="rf-grid">'+R.P.slice().reverse().map(x=>rfTile(x.k,R.adm?x.w:null)).join("")+'</div><small>Выигрыш приходит личным промокодом — забери его одной кнопкой. После двух «Пусто» подряд третья прокрутка точно с призом.</small></div>';
  const my=R.my.length?'<div class="rf-box"><b>🎟 Мои промокоды</b>'+R.my.map(m=>'<div class="rf-my"><i>'+rfIco(m.k)+'</i><span>'+rfLbl(m.k)+'</span>'+(m.code?'<code>'+m.code+'</code>'+(m.used?'<em>✅</em>':'<button type="button" class="mini2" data-act="'+m.code+'">Активировать</button>'):'<em>—</em>')+'</div>').join("")+'</div>':"";
  const fr=R.fr.length?'<div class="rf-box"><b>👥 Мои приглашённые</b>'+R.fr.map(f=>'<div class="rf-f"><span>'+rdEsc(f.name)+'</span><em>'+(f.op>=R.op&&f.sub&&f.nk?'✅ засчитан':(f.op>=R.op?'✅':'⏳ '+f.op+'/'+R.op)+' · '+(f.sub?'✅':'❌')+' канал · '+(f.nk?'✅':'❌')+' ник')+'</em></div>').join("")+'</div>':"";
  const big=R.big.length?'<div class="rf-big">🔥 '+R.big.map(x=>rdEsc(x.name)+' — '+rfLbl(x.k)).join(" · ")+'</div>':"";
  B.innerHTML='<div class="rf-wrap">'+top+big+game+btn+prizes+my+fr+(R.adm?rfAdm(R):"")+'</div>';
  $("rf-inv").onclick=rfInvite;$("rf-go").onclick=()=>R.left?rfSpin():rfInvite();
  B.querySelectorAll("[data-act]").forEach(b=>b.onclick=()=>rfActivate(b.dataset.act));B.querySelectorAll("[data-gf]").forEach(b=>b.onclick=()=>rfGift(b.dataset.gf));
  if(pl)rfDraw(-1,0,0)}
function rfInvite(){hap("light");sendLink("Залетай в «Воины Эпох» — крути карточки воинов и выбивай звёзды! 🎁",linkFor("r_"+S.uid))}
function rfStrip(win){const L=[];for(let i=0;i<40;i++){let r=Math.random()*100,k="0";for(const x of (RFX.d?RFX.d.P:[])){if(r<x.w){k=x.k;break}r-=x.w}if(i%9===4)k=["s500","s100","nft","s50"][i%4];L.push(i===34&&win?win:k)}return L.map(k=>rfTile(k)).join("")}
async function rfSpin(){if(RFX.busy)return;RFX.busy=true;const g=csTab;$("rf-go").disabled=true;const r=await act("rf_spin",{g});if(!r){RFX.busy=false;$("rf-go").disabled=false;return}
  const w=r.win;hap("medium");
  if(g==="pl"){const b=RF_BK.indexOf(w.k);await rfDrop(b)}else{const s=$("rf-strip");s.innerHTML=rfStrip(w.k);s.style.transition="none";s.style.transform="translateX(0)";s.offsetWidth;
    const tw=s.children[0].getBoundingClientRect().width+8,off=34*tw-(s.parentNode.clientWidth/2-tw/2)+(Math.random()-.5)*tw*.6;s.style.transition="transform 5s cubic-bezier(.12,.75,.18,1)";s.style.transform="translateX(-"+off+"px)";
    for(let i=0;i<22;i++)setTimeout(()=>{try{sfx.tick&&sfx.tick()}catch(e){}},i*i*10);await new Promise(z=>setTimeout(z,5200))}
  RFX.d=r;RFX.busy=false;rfWin(w)}
function rfWin(w){const m=$("modal"),sh=$("msheet");m.hidden=false;const ok=w.k!=="0";if(ok){sfx.fanfare();burst(w.k==="s500"||w.k==="nft"||w.k==="s100"?6:3);hapN("success")}else hapN("warning");
  sh.innerHTML='<div class="box nickbox rfwin"><div class="rf-wi" style="--c:'+rfCol(w.k)+'">'+rfIco(w.k)+'</div><h3>'+(ok?'Выпало: '+w.n+'!':'Пусто… в этот раз не повезло')+'</h3>'+
    (ok?'<p class="cln">Твой промокод:</p><code class="rf-code">'+w.code+'</code>'+(w.k=="x2"||w.k[0]==="b"?'<p class="cln">Активируй и пополни игровой баланс в течение 3 дней — бонус придёт сверху.</p>':'')+'<button type="button" class="craftbtn rf-act" id="rw-a">✅ Активировать</button>':'<p class="cln">Следующая прокрутка — шанс на джекпот 500 ⭐. Позови ещё друга!</p><button type="button" class="craftbtn" id="rw-i">📨 Позвать друга</button>')+
    '<button type="button" class="ghost" id="rw-x">Закрыть</button></div>';
  $("rw-x").onclick=()=>{closeModal();renderCas()};if(ok){$("rw-a").onclick=()=>rfActivate(w.code)}else $("rw-i").onclick=rfInvite}
async function rfActivate(code){const r=await act("promo_use",{code});if(!r)return;sfx.fanfare();burst(3);hapN("success");toast("🎁 "+(r.st?"+"+r.st+" ⭐ на баланс":"")+(r.gift?" NFT «"+r.gift+"»":"")+(r.chest?" 📦 "+r.chest:"")+(r.x2?" x2 к пополнению (до "+r.x2+" ⭐)":"")+(r.bon?" +"+r.bon+" ⭐ к следующему пополнению":""));closeModal();try{pullStars&&pullStars()}catch(e){}rfLoad()}
function rfGift(code){hap("light");sendLink("🎁 Дарю тебе промокод в «Воинах Эпох»: "+code+" — вводи в «Ещё → Промокод»!",linkFor("r_"+S.uid))}
function rfAdm(R){const A=R.adm,n=g=>A.G.filter(x=>x.g===g).reduce((a,x)=>a+x.n,0),cnt=k=>A.G.filter(x=>x.k===k).reduce((a,x)=>a+x.n,0);
  return '<div class="vt-adm rf-adm"><b>📊 Статистика реф-слотов (с 09.11, 07:30)</b><div class="rf-st"><div><b>'+A.reg+'</b><small>пришло по приглашениям</small></div><div><b>'+A.ok+'</b><small>засчитаны (10+ открытий, канал, ник)</small></div><div><b>'+A.inv+'</b><small>человек позвали друзей</small></div><div><b>'+n("rc")+' / '+n("pl")+'</b><small>прокруток кейс / плинко (за друзей)</small></div><div><b>'+(R.giftN||0)+'</b><small>подарочных прокруток (5 ⭐)</small></div><div><b>'+A.stAct+' ⭐</b><small>звёзд забрали по кодам</small></div><div><b>'+A.giftAct+' / '+A.chestAct+'</b><small>NFT / сундуков забрали</small></div></div>'+
   '<small>Выпало: '+R.P.map(x=>rfLbl(x.k)+' '+cnt(x.k)).join(" · ")+'</small><b>🏅 Кто больше позвал</b>'+A.top.map((t,i)=>'<div class="rf-f"><span>'+(i+1)+'. '+rdEsc(t.name)+' <small>ID '+t.uid+'</small></span><em>'+t.ok+' / '+t.reg+'</em></div>').join("")+'</div>'}
/* 🪙 Плинко: 12 рядов колышков, 13 лунок */
function rfGeo(){const n=RF_BK.length,W=680,rows=n-1,dx=Math.floor(660/n),top=50,dy=40;return {W,rows,dx,top,dy,n,mid:(n-1)/2,by:top+rows*dy+14}}
function rfDraw(row,x,y){const c=$("rf-cv");if(!c)return;const g=c.getContext("2d"),G=rfGeo();g.clearRect(0,0,c.width,c.height);
  for(let r=0;r<G.rows;r++)for(let i=0;i<=r+2;i++){const px=G.W/2+(i-(r+2)/2)*G.dx,py=G.top+r*G.dy;g.fillStyle="#ffe8a8";g.shadowColor="#ffcf5a";g.shadowBlur=8;g.beginPath();g.arc(px,py,6,0,7);g.fill()}
  g.shadowBlur=0;RF_BK.forEach((k,i)=>{const bx=G.W/2+(i-G.mid)*G.dx;g.fillStyle=rfCol(k);g.globalAlpha=.9;g.beginPath();g.roundRect(bx-G.dx/2+2,G.by,G.dx-4,84,8);g.fill();g.globalAlpha=1;g.fillStyle="#fff";g.textAlign="center";g.font="30px sans-serif";g.fillText(rfIco(k),bx,G.by+36);g.font="bold 17px sans-serif";g.font="bold 14px sans-serif";g.fillText(k==="x2"?"x2":k[0]==="b"?"+"+k.slice(1):rfLbl(k).replace("Сундук","📦").replace("Пусто","0").replace("⭐",""),bx,G.by+70)});
  if(row>=0){g.fillStyle="#ffd23f";g.shadowColor="#fff";g.shadowBlur=18;g.beginPath();g.arc(x,y,13,0,7);g.fill();g.shadowBlur=0;g.fillStyle="#b07800";g.font="bold 14px sans-serif";g.fillText("⭐",x,y+5)}}
function rfDrop(b){return new Promise(res=>{const G=rfGeo(),mv=[];for(let i=0;i<G.rows;i++)mv.push(i<b?1:0);mv.sort(()=>Math.random()-.5);
  const pts=[[G.W/2,20]];let k=0;for(let r=0;r<G.rows;r++){k+=mv[r];pts.push([G.W/2+(k-(r+1)/2)*G.dx,G.top+r*G.dy+G.dy/2])}pts.push([G.W/2+(b-G.mid)*G.dx,G.by+20]);
  let i=0,t0=performance.now();const step=150;const f=now=>{const s=(now-t0)/step;i=Math.floor(s);if(i>=pts.length-1){rfDraw(1,pts[pts.length-1][0],pts[pts.length-1][1]);res();return}
    const a=pts[i],z=pts[i+1],u=s-i,x=a[0]+(z[0]-a[0])*u,y=a[1]+(z[1]-a[1])*u*u-Math.sin(u*Math.PI)*14;rfDraw(1,x,y);if(u<.08&&i>0)try{sfx.tick&&sfx.tick()}catch(e){};requestAnimationFrame(f)};requestAnimationFrame(f)})}
