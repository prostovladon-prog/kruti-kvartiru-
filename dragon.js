/* ===================== 🐉 ДРАКОН: клиент =====================
   До вылупления игрок видит только «Тайное яйцо»: что внутри и зачем — не говорим.
   Дракон нарисован слоями (хвост, крылья, тело) — анимируются только transform у слоёв, поэтому телефон не греется. */
const DG_SCI='<i class="ci ci-s" aria-label="чешуя"></i>';
let dgSub="gear",dgPend=0,dgBusy=false,dgFlushT=0,dgTopD=null,dgKey="",dgHearts=0,dgUid=0;
const DG_INK="#0d1030";
const dgOf=()=>S&&S.dg||null;
const dgFmt=n=>fmtN(n||0);
const dgBr=D=>DG_BREED[D.b]||DG_BREED[0];
/* ---------- рисунок дракона ---------- */
/* цвет глаз у каждой породы */
const DG_EYE={fire:["#fff3a0","#ff9f0a","#a34a00"],ice:["#d8f6ff","#3fb8ff","#0a4a9a"],swamp:["#eaffb0","#7fd23a","#2a6a10"],storm:["#f0e8ff","#b59bff","#4a2aa8"],shadow:["#ffd0ec","#ff4fa8","#7a0a4a"],gold:["#d8fbff","#2fc8ff","#0a5a9a"],star:["#fff0fa","#ff7ad9","#7a1a8a"]};
/* рисунок дракона. Слои: сияние, хвост, крылья, тело, голова — каждый можно анимировать отдельно.
   Стадии 0–2 милые (круглые глаза, щёчки), 3–4 серьёзные (брови, зрачки-щели, лапы упёрты в землю), 5–6 опасные (горящие глаза, оскал, шипы, шрам) */
function dgParts(D,o){o=o||{};const u="dg"+(++dgUid),s=dgStage(D.lv),B=dgBr(D),[c0r,c1,c2r]=B.c,EY=DG_EYE[B.k]||DG_EYE.fire;
  const c0=s<=2?c0r:shade(c0r,-.07*(s-2)),c2=s<=2?c2r:shade(c2r,-.08*(s-2)),cute=s<=2,fierce=s>=3,deadly=s>=5;
  const st=`stroke="${DG_INK}" stroke-linejoin="round" stroke-linecap="round"`;
  const E={};dgEq(D).forEach(it=>E[it.s]=it);const sb=dgSetBonus(dgEq(D));
  const gc=it=>it?dgSetOf(it.t).c:null,rc=it=>it?DG_R[it.r].c:null,f=n=>(+n).toFixed(1);
  const k=[.82,.83,.84,.84,.83,.82,.82][s],hS=[1.3,1.18,1.06,.98,.93,.92,.92][s],lift=[0,4,8,10,11,11,11][s],wS=[.5,.66,.82,.96,1.06,1.14,1.2][s],hL=[0,.45,.65,.85,1,1.12,1.2][s];
  const G=(x,y)=>[150+(x-150)*k,150+(y-150)*k],P=(x,y)=>{const [X,Y]=G(x,y);return [+(X/3).toFixed(2),+(Y/2.6).toFixed(2)]};
  const by=124-lift*.4,hy=96-lift,HP=(lx,ly)=>P(150+lx*hS,hy+ly*hS);
  const rg=(id,a,b,c,d,cx,cy)=>`<radialGradient id="${id}" cx="${cx||.32}" cy="${cy||.26}" r=".9"><stop offset="0" stop-color="${a}"/><stop offset=".35" stop-color="${b}"/><stop offset=".75" stop-color="${c}"/><stop offset="1" stop-color="${d}"/></radialGradient>`;
  const defs=rg("b"+u,shade(c0,.5),shade(c0,.14),c0,shade(c0,-.5))+rg("l"+u,shade(c1,.65),shade(c1,.25),c1,shade(c1,-.3),.42,.25)+rg("w"+u,shade(c1,.35),shade(c0,.15),shade(c0,-.05),shade(c0,-.4),.3,.2)+
    `<radialGradient id="e${u}" cx=".45" cy=".38" r=".7"><stop offset="0" stop-color="${deadly?"#fff":EY[0]}"/><stop offset=".45" stop-color="${EY[1]}"/><stop offset="1" stop-color="${EY[2]}"/></radialGradient>`+
    `<radialGradient id="k${u}" cx=".35" cy=".3" r=".9"><stop offset="0" stop-color="#fffaf0"/><stop offset=".6" stop-color="${B.k==="gold"?"#ffe08a":B.k==="shadow"?"#cdb8ec":"#f3e2c4"}"/><stop offset="1" stop-color="${B.k==="shadow"?"#6a5a8a":"#a8865a"}"/></radialGradient>`+
    `<filter id="s${u}" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="3.2"/></filter><filter id="q${u}" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="5"/></filter>`+
    (E.head?rg("h"+u,shade(gc(E.head),.55),shade(gc(E.head),.15),gc(E.head),shade(gc(E.head),-.5)):"")+(E.body?rg("a"+u,shade(gc(E.body),.55),shade(gc(E.body),.15),gc(E.body),shade(gc(E.body),-.5)):"");
  const wrap=inner=>`<svg viewBox="0 0 300 260" aria-hidden="true"><defs>${defs}</defs><g transform="translate(150 150) scale(${k}) translate(-150 -150)" stroke-width="3.4">${inner}</g></svg>`;
  const gloss=(x,y,rx,ry,op)=>`<ellipse cx="${f(x)}" cy="${f(y)}" rx="${rx}" ry="${ry}" fill="#fff" opacity="${op||.5}" filter="url(#s${u})"/>`;
  const ao=(d,op)=>`<path d="${d}" fill="#000" opacity="${op||.3}" filter="url(#s${u})"/>`;
  /* сияние */
  let aura="";if(deadly||sb.n>=5){const ac=sb.n>=5?dgSetOf(sb.k).c:(s>=6?"#ff3b1a":c1);let r="";for(let i=0;i<18;i++){const a=i/18*Math.PI*2;r+=`M${f(150+Math.cos(a-.07)*72)} ${f(132+Math.sin(a-.07)*72)} L${f(150+Math.cos(a)*(i%2?110:130))} ${f(132+Math.sin(a)*(i%2?110:130))} L${f(150+Math.cos(a+.07)*72)} ${f(132+Math.sin(a+.07)*72)}Z `}
    aura=`<svg viewBox="0 0 300 260" aria-hidden="true"><defs><radialGradient id="g${u}"><stop offset="0" stop-color="${ac}" stop-opacity=".85"/><stop offset="1" stop-color="${ac}" stop-opacity="0"/></radialGradient></defs><circle cx="150" cy="132" r="124" fill="url(#g${u})"/><path d="${r}" fill="${ac}" opacity=".32"/></svg>`}
  /* хвост */
  const tl=`M184 214 C222 224 252 210 250 182 C248 160 266 148 280 156`;
  let tail=`<path d="${tl}" fill="none" stroke="${DG_INK}" stroke-width="${fierce?24:20}"/><path d="${tl}" fill="none" stroke="url(#b${u})" stroke-width="${fierce?17:13}"/><path d="M196 220 C222 226 242 214 244 192" fill="none" stroke="#fff" stroke-width="3" opacity=".4"/>`;
  tail+=fierce?`<path d="M281 157 L262 140 L280 128 L288 112 L296 132 L312 140 Z" fill="${c2}" ${st} stroke-width="3"/><path d="M272 138 L282 130" stroke="#fff" stroke-width="2" opacity=".4"/>`:`<path d="M281 157 C265 146 268 128 281 132 C283 120 302 119 301 134 C300 147 291 153 281 157 Z" fill="${c2}" ${st} stroke-width="3"/><path d="M276 136 Q279 130 284 133" fill="none" stroke="#fff" stroke-width="2.4" opacity=".5"/>`;
  if(s>=2)tail+=[[226,214],[248,196],[256,168]].map(([x,y])=>`<path d="M${x} ${y-8} l-2 -${fierce?14:10} l${fierce?11:9} ${fierce?7:5} Z" fill="${c2}" ${st} stroke-width="2.3"/>`).join("");
  /* крыло */
  const wing=sd=>{const gw=E.wings,sx=150+sd*30,mem=gw?gc(gw):null;
    const Pw=fierce?`M0 0 C8 -30 30 -62 64 -86 L66 -70 C70 -62 78 -58 90 -60 L84 -48 C82 -38 88 -32 100 -30 L90 -18 C86 -6 88 4 96 14 L80 10 C58 6 32 12 8 26 Z`:`M0 0 C8 -30 30 -62 64 -84 C60 -66 70 -56 86 -58 C76 -44 82 -30 96 -28 C84 -14 84 2 90 12 C62 6 32 12 8 26 Z`;
    return `<g transform="translate(${sx} 152) scale(${sd*wS} ${wS})"><path d="${Pw}" fill="url(#w${u})" ${st}/>${mem?`<path d="${Pw}" fill="${mem}" opacity=".42"/>`:""}<path d="M14 18 C34 2 42 -14 48 -40 C60 -30 74 -16 88 6 C60 2 34 8 14 18 Z" fill="#000" opacity=".12"/>
      <path d="M8 26 C30 4 40 -12 46 -40 M46 -40 C60 -46 72 -52 86 -58 M46 -40 C66 -36 82 -32 96 -28 M46 -40 C62 -18 76 -2 90 12" fill="none" stroke="${shade(c0,-.3)}" stroke-width="${fierce?3.4:2.6}"/>
      <path d="M0 0 C8 -30 30 -62 64 -84" fill="none" stroke="${DG_INK}" stroke-width="${gw?10:9}" stroke-linecap="round"/><path d="M0 0 C8 -30 30 -62 64 -84" fill="none" stroke="${gw?gc(gw):c0}" stroke-width="${gw?6:5}" stroke-linecap="round"/><path d="M4 -8 C12 -34 30 -58 58 -78" fill="none" stroke="#fff" stroke-width="1.8" opacity=".5"/>
      ${fierce?`<path d="M46 -40 l-6 -12 l12 6 Z M64 -84 l2 -14 l8 10 Z" fill="${gw?rc(gw):"#fff3dc"}" ${st} stroke-width="2.2"/>`:`<circle cx="64" cy="-84" r="${gw?5:4}" fill="${gw?rc(gw):"#fff4dc"}" ${st} stroke-width="2.4"/>`}</g>`};
  /* когти */
  const clawC=E.claws?gc(E.claws):null,cl=(x,y,big)=>[-1,0,1].map(i=>big?`<path d="M${f(x+i*8-3)} ${f(y-2)} q1 9 -3 13 q8 -2 9 -13 Z" fill="${clawC||"url(#k"+u+")"}" ${st} stroke-width="2"/>`:`<path d="M${f(x+i*7-3)} ${f(y)} q3 7 6 0 Z" fill="${clawC||"#fff7e6"}" ${st} stroke-width="2"/>`).join("");
  /* тело */
  let b="";
  b+=`<ellipse cx="150" cy="238" rx="${fierce?84:70}" ry="9" fill="#000" opacity=".3" filter="url(#s${u})"/>`;
  b+=[-1,1].map(sd=>`<ellipse cx="${150+sd*(fierce?52:48)}" cy="212" rx="${fierce?31:28}" ry="${fierce?26:24}" fill="url(#b${u})" ${st}/>${gloss(150+sd*(fierce?52:48)-8,200,12,6,.45)}`).join("");
  const bw=fierce?62:56;b+=`<path d="M150 ${f(by)} C${150+bw-10} ${f(by)} ${150+bw+8} 190 ${150+bw} 222 Q150 244 ${150-bw} 222 C${150-bw-8} 190 ${150-bw+10} ${f(by)} 150 ${f(by)} Z" fill="url(#b${u})" ${st}/>`;
  b+=`<path d="M${150+bw-6} ${f(by+30)} C${150+bw+4} 180 ${150+bw+2} 206 ${150+bw-6} 220" fill="none" stroke="#fff" stroke-width="3" opacity=".3"/>`;
  b+=`<path d="M150 ${f(by+20)} C178 ${f(by+20)} 190 182 184 218 Q150 232 116 218 C110 182 122 ${f(by+20)} 150 ${f(by+20)} Z" fill="url(#l${u})" ${st} stroke-width="2.6"/>`;
  b+=[0,1,2,3].map(i=>{const y=by+38+i*15,w=30-Math.abs(i-1.5)*3;return `<path d="M${f(150-w)} ${f(y)} Q150 ${f(y+7)} ${f(150+w)} ${f(y)}" fill="none" stroke="${shade(c1,-.35)}" stroke-width="2.4"/>`}).join("");
  b+=gloss(138,by+42,12,18,.45);
  if(deadly)b+=`<path d="M128 ${f(by+48)} L146 ${f(by+70)} M134 ${f(by+46)} L150 ${f(by+66)}" stroke="${shade(c1,.6)}" stroke-width="3" opacity=".9"/>`;
  b+=ao(`M110 ${f(by+14)} Q150 ${f(by+40)} 190 ${f(by+14)} Q150 ${f(by+26)} 110 ${f(by+14)} Z`,.4);
  b+=[-1,1].map(sd=>`<ellipse cx="${150+sd*44}" cy="232" rx="${fierce?23:20}" ry="10" fill="url(#b${u})" ${st}/>`+cl(150+sd*44,238,fierce)).join("");
  if(fierce)b+=[-1,1].map(sd=>`<path d="M${150+sd*(bw-8)} ${f(by+8)} l${sd*4} -16 l${sd*10} 12 Z M${150+sd*(bw-20)} ${f(by+2)} l${sd*2} -12 l${sd*8} 9 Z" fill="${c2}" ${st} stroke-width="2.4"/>`).join("");
  if(E.body)b+=`<path d="M150 ${f(by+16)} C182 ${f(by+16)} 194 176 188 206 Q150 220 112 206 C106 176 118 ${f(by+16)} 150 ${f(by+16)} Z" fill="url(#a${u})" ${st}/><path d="M118 ${f(by+40)} Q150 ${f(by+50)} 182 ${f(by+40)} M114 ${f(by+60)} Q150 ${f(by+70)} 186 ${f(by+60)}" fill="none" stroke="${rc(E.body)}" stroke-width="3"/>${[-24,0,24].map(x=>`<circle cx="${150+x}" cy="${f(by+30+Math.abs(x)*.2)}" r="3.4" fill="${rc(E.body)}" ${st} stroke-width="1.6"/>`).join("")}${gloss(136,by+30,14,7,.55)}`;
  /* передние лапы: малыш держит их на животике, взрослый упирается в землю */
  if(!fierce)b+=[-1,1].map(sd=>`<path d="M${150+sd*40} ${f(by+30)} C${150+sd*46} ${f(by+56)} ${150+sd*34} ${f(by+74)} ${150+sd*16} ${f(by+76)} C${150+sd*10} ${f(by+68)} ${150+sd*18} ${f(by+60)} ${150+sd*24} ${f(by+52)} Z" fill="url(#b${u})" ${st}/><ellipse cx="${150+sd*15}" cy="${f(by+76)}" rx="10" ry="8" fill="url(#b${u})" ${st}/>${gloss(150+sd*15-3,by+73,4,2.5,.6)}`+cl(150+sd*15,by+82,0)).join("");
  else b+=[-1,1].map(sd=>ao(`M${150+sd*22} ${f(by+40)} C${150+sd*20} 190 ${150+sd*18} 214 ${150+sd*18} 226 L${150+sd*30} 226 Z`,.35)+`<path d="M${150+sd*54} ${f(by+16)} C${150+sd*62} ${f(by+46)} ${150+sd*50} 196 ${150+sd*44} 226 L${150+sd*16} 226 C${150+sd*18} 204 ${150+sd*22} ${f(by+54)} ${150+sd*28} ${f(by+26)} Z" fill="url(#b${u})" ${st}/><path d="M${150+sd*30} ${f(by+60)} Q${150+sd*40} ${f(by+66)} ${150+sd*50} ${f(by+58)}" fill="none" stroke="${shade(c0,-.35)}" stroke-width="2.4"/><path d="M${150+sd*50} ${f(by+28)} C${150+sd*56} ${f(by+56)} ${150+sd*48} 196 ${150+sd*42} 220" fill="none" stroke="#fff" stroke-width="2.6" opacity=".35"/><ellipse cx="${150+sd*30}" cy="230" rx="19" ry="9.5" fill="url(#b${u})" ${st}/>${gloss(150+sd*30-6,226,7,3,.5)}`+cl(150+sd*30,236,1)).join("");
  if(E.claws)b+=[-1,1].map(sd=>fierce?`<path d="M${150+sd*12} 212 h${sd*20}" stroke="${DG_INK}" stroke-width="9" stroke-linecap="round"/><path d="M${150+sd*12} 212 h${sd*20}" stroke="${gc(E.claws)}" stroke-width="5" stroke-linecap="round"/>`:`<path d="M${150+sd*30} ${f(by+60)} l${sd*14} 6" stroke="${DG_INK}" stroke-width="8" stroke-linecap="round"/><path d="M${150+sd*30} ${f(by+60)} l${sd*14} 6" stroke="${gc(E.claws)}" stroke-width="4.5" stroke-linecap="round"/>`).join("");
  /* шея */
  b+=`<path d="M124 ${f(by+14)} Q128 ${f(hy+22)} 136 ${f(hy+26)} L164 ${f(hy+26)} Q172 ${f(hy+22)} 176 ${f(by+14)} Z" fill="url(#b${u})" ${st}/><path d="M138 ${f(by+14)} Q140 ${f(hy+32)} 146 ${f(hy+30)} L154 ${f(hy+30)} Q160 ${f(hy+32)} 162 ${f(by+14)} Z" fill="url(#l${u})" opacity=".9"/>`;
  if(E.amul)b+=`<path d="M132 ${f(hy+40)} Q150 ${f(hy+58)} 168 ${f(hy+40)}" fill="none" stroke="${DG_INK}" stroke-width="5"/><path d="M132 ${f(hy+40)} Q150 ${f(hy+58)} 168 ${f(hy+40)}" fill="none" stroke="#e8b33a" stroke-width="2.6"/>`+(E.amul.r>=3?`<circle cx="150" cy="${f(hy+56)}" r="15" fill="${rc(E.amul)}" opacity=".45" filter="url(#s${u})"/>`:"")+`<path d="M150 ${f(hy+46)} l9 10 l-9 12 l-9 -12 Z" fill="${rc(E.amul)}" ${st} stroke-width="2.4"/><circle cx="147" cy="${f(hy+54)}" r="2.4" fill="#fff"/>`;
  /* голова (вокруг 0,0) */
  let h="";const hornF=`url(#k${u})`;
  h+=ao(`M-40 30 Q0 62 40 30 Q0 50 -40 30 Z`,.0);
  h+=[-1,1].map(sd=>`<g transform="scale(${sd} 1)"><path d="${fierce?"M40 -6 L66 -22 L76 -14 L92 -30 L86 -6 L74 4 L46 12 Z":"M40 -6 C62 -20 78 -16 88 -26 C84 -6 72 8 46 12 Z"}" fill="url(#w${u})" ${st} stroke-width="2.8"/><path d="M46 4 L76 -14 M46 -2 L70 -18" stroke="${shade(c0,-.25)}" stroke-width="2"/></g>`).join("");
  if(s===0)h+=[-1,1].map(sd=>`<path d="M${sd*14} -40 Q${sd*22} -58 ${sd*31} -39 Z" fill="${hornF}" ${st} stroke-width="2.6"/>`).join("");
  else h+=[-1,1].map(sd=>`<g transform="scale(${sd} 1)"><path d="M14 -36 C${f(16+10*hL)} ${f(-52-10*hL)} ${f(36+16*hL)} ${f(-62-14*hL)} ${f(54+24*hL)} ${f(-62-20*hL)} C${f(44+12*hL)} ${f(-52-10*hL)} 40 -44 34 -32 Z" fill="${hornF}" ${st} stroke-width="2.8"/>${[.25,.45,.65].map(t=>`<path d="M${f(18+t*(36+20*hL))} ${f(-40-t*(22+16*hL))} l${f(5+t*3)} 3" stroke="#7a5a3a" stroke-width="1.8" opacity=".6"/>`).join("")}${deadly?`<path d="M30 -38 C40 -58 56 -70 70 -74" fill="none" stroke="#fff" stroke-width="2" opacity=".5"/>`:""}</g>`).join("");
  if(s>=4)h+=[-1,1].map(sd=>`<path d="M${sd*42} -18 l${sd*20} -8 l${sd*-12} 15 Z M${sd*46} 4 l${sd*16} 2 l${sd*-14} 8 Z" fill="${hornF}" ${st} stroke-width="2.3"/>`).join("");
  h+=`<path d="${fierce?"M0 -46 C36 -46 56 -24 54 2 C52 22 38 34 0 36 C-38 34 -52 22 -54 2 C-56 -24 -36 -46 0 -46 Z":"M0 -46 C34 -46 54 -22 52 4 C50 26 30 38 0 38 C-30 38 -50 26 -52 4 C-54 -22 -34 -46 0 -46 Z"}" fill="url(#b${u})" ${st}/>`;
  h+=gloss(-22,-30,16,9,.55)+`<path d="M44 -12 C50 0 48 14 40 24" fill="none" stroke="#fff" stroke-width="2.6" opacity=".3"/>`;
  if(s>=2&&!E.head)h+=(deadly?[-24,-12,0,12,24]:[-14,0,14]).map(x=>`<path d="M${x-5} ${-44+Math.abs(x)*.12} L${x} ${-(fierce?62:56)+Math.abs(x)*.3} L${x+5} ${-44+Math.abs(x)*.12} Z" fill="${c2}" ${st} stroke-width="2.2"/>`).join("");
  /* морда */
  const mz=fierce?`M0 4 C30 4 46 14 44 32 C42 50 22 60 0 60 C-22 60 -42 50 -44 32 C-46 14 -30 4 0 4 Z`:`M0 6 C28 6 42 16 40 30 C38 44 20 52 0 52 C-20 52 -38 44 -40 30 C-42 16 -28 6 0 6 Z`;
  h+=ao(fierce?`M-34 8 Q0 -4 34 8 Q0 2 -34 8 Z`:`M-30 10 Q0 0 30 10 Q0 4 -30 10 Z`,.35)+`<path d="${mz}" fill="url(#l${u})" ${st} stroke-width="3"/>`+gloss(-12,14,12,5,.6);
  h+=fierce?`<path d="M-14 22 q5 -6 10 0 M4 22 q5 -6 10 0" fill="none" ${st} stroke-width="3"/><ellipse cx="-9" cy="23" rx="2.6" ry="1.6" fill="${DG_INK}"/><ellipse cx="9" cy="23" rx="2.6" ry="1.6" fill="${DG_INK}"/>`:`<path d="M-11 24 q4 -5 8 0 M3 24 q4 -5 8 0" fill="none" ${st} stroke-width="2.6"/>`;
  if(cute)h+=`<path d="M-13 38 Q-6 45 0 39 Q6 45 13 38" fill="none" ${st} stroke-width="2.8"/><path d="M5 40.5 l2.5 6 l2.5 -5 Z" fill="#fff" ${st} stroke-width="1.6"/>`;
  else if(!deadly)h+=`<path d="M-24 40 Q0 50 24 40" fill="none" ${st} stroke-width="3"/><path d="M-16 42 l3 9 l4 -8 M12 42 l4 8 l3 -9" fill="#fff" ${st} stroke-width="1.8"/>`;
  else h+=`<path d="M-28 38 Q0 32 28 38 Q22 54 0 56 Q-22 54 -28 38 Z" fill="#3a0610" ${st} stroke-width="3"/><path d="M-6 50 Q0 46 6 50" fill="none" stroke="#c8344a" stroke-width="4"/><path d="M-24 39 l4 10 l4 -8 M-12 37 l3 8 l3 -8 M6 37 l3 8 l3 -8 M18 38 l4 8 l3 -9" fill="#fff" ${st} stroke-width="1.6"/><path d="M-18 54 l3 -7 l3 6 M12 54 l3 -6 l3 7" fill="#fff" ${st} stroke-width="1.6"/>`;
  if(s<=1)h+=`<ellipse cx="-33" cy="20" rx="9" ry="5.5" fill="#ff7a9a" opacity=".55" filter="url(#s${u})"/><ellipse cx="33" cy="20" rx="9" ry="5.5" fill="#ff7a9a" opacity=".55" filter="url(#s${u})"/>`;
  if(E.head)h+=`<path d="M-48 -10 C-44 -44 -20 -54 0 -54 C20 -54 44 -44 48 -10 C30 -24 -30 -24 -48 -10 Z" fill="url(#h${u})" ${st}/><path d="M-46 -12 C-28 -26 28 -26 46 -12" fill="none" stroke="${rc(E.head)}" stroke-width="3"/>`+(E.head.r>=3?`<path d="M-7 -52 L0 -74 L7 -52 Z" fill="${rc(E.head)}" ${st} stroke-width="2.4"/>`:"")+(E.head.r>=5?`<ellipse cx="0" cy="-70" rx="26" ry="6" fill="none" stroke="#ffd60a" stroke-width="3.5"/>`:"")+gloss(-18,-40,14,5,.7);
  else if(s>=5)h+=`<path d="M-20 -44 L-22 -66 L-10 -54 L0 -72 L10 -54 L22 -66 L20 -44 Q0 -50 -20 -44 Z" fill="#ffd60a" ${st} stroke-width="2.6"/><circle cx="0" cy="-52" r="3.6" fill="#ff2e63"/>${gloss(-8,-58,6,3,.8)}`;
  /* глаза */
  const glowC=s>=6?"#ff3b1a":EY[1];
  const eye=sd=>{const x=sd*21,y=-6;
    if(cute)return `<ellipse cx="${x}" cy="${y}" rx="17" ry="19" fill="#fff" ${st} stroke-width="2.6"/><circle cx="${x+sd*1.2}" cy="${y+1}" r="14.5" fill="url(#e${u})"/><circle cx="${x+sd*1.2}" cy="${y+1}" r="14.5" fill="none" stroke="${EY[2]}" stroke-width="1.6"/><circle cx="${x+sd*1.2}" cy="${y+2}" r="7.4" fill="${DG_INK}"/><circle cx="${x+sd*1.2+4.5}" cy="${y-4.5}" r="4.8" fill="#fff"/><circle cx="${x+sd*1.2-4.5}" cy="${y+7}" r="2.2" fill="#fff" opacity=".9"/><path d="M${x+sd*1.2+5} ${y+6} l1 2.4 l2.4 1 l-2.4 1 l-1 2.4 l-1 -2.4 l-2.4 -1 l2.4 -1 Z" fill="#fff" opacity=".85"/><path d="M${x-sd*16.5} ${y-7} Q${x} ${y-27} ${x+sd*17} ${y-7}" fill="none" ${st} stroke-width="3"/><path d="M${x+sd*15.5} ${y-8} q${sd*5} -1 ${sd*7} -6 M${x+sd*11} ${y-16} q${sd*3} -2 ${sd*4} -7" fill="none" ${st} stroke-width="2.2"/>`;
    const ry=deadly?11:13,lidIn=deadly?2:-3;
    return (s>=4?`<ellipse cx="${x}" cy="${y}" rx="18" ry="14" fill="${glowC}" opacity=".7" filter="url(#q${u})"/>`:"")+
     `<path d="M${x-sd*15} ${y+lidIn} Q${x-sd*2} ${y-ry-2} ${x+sd*15} ${y-ry+3} Q${x+sd*16} ${y+8} ${x} ${y+ry-1} Q${x-sd*13} ${y+8} ${x-sd*15} ${y+lidIn} Z" fill="${deadly?"url(#e"+u+")":"#fff"}" ${st} stroke-width="2.6"/>`+
     (deadly?"":`<circle cx="${x+sd*1}" cy="${y+1}" r="10.5" fill="url(#e${u})"/>`)+`<ellipse cx="${x+sd*1}" cy="${y+1}" rx="${s>=4?2.4:3.4}" ry="${deadly?9:8}" fill="${DG_INK}"/><circle cx="${x+sd*1+4}" cy="${y-3}" r="${deadly?2.2:3}" fill="#fff"/>`+
     `<path d="M${x-sd*19} ${y+lidIn+(deadly?1:3)} L${x+sd*17} ${y-ry-(deadly?6:3)} L${x+sd*20} ${y-ry-(deadly?12:8)} L${x-sd*20} ${y+lidIn-(deadly?8:5)} Z" fill="${c2}" ${st} stroke-width="2.6"/>`+
     (deadly&&sd<0?`<path d="M${x-8} ${y-20} L${x+6} ${y+16}" stroke="${shade(c1,.6)}" stroke-width="3" opacity=".9"/>`:"")};
  h+=`<g class="dg-eyes">${eye(-1)}${eye(1)}</g>`;
  const head=`<g transform="translate(150 ${f(hy)}) scale(${hS})">${h}</g>`;
  const pts={nose:[HP(-9,22),HP(9,22)],mouth:HP(0,fierce?46:42),neck:P(150,hy+34*hS),eyes:[HP(-21,-6),HP(21,-6)],glow:s>=5?glowC:null,s};
  if(o.mini)return `<svg viewBox="0 0 300 260" aria-hidden="true"><defs>${defs}${aura?`<radialGradient id="g${u}"><stop offset="0" stop-color="${sb.n>=5?dgSetOf(sb.k).c:(s>=6?"#ff3b1a":c1)}" stop-opacity=".75"/><stop offset="1" stop-color="${c1}" stop-opacity="0"/></radialGradient>`:""}</defs>${aura?`<circle cx="150" cy="132" r="112" fill="url(#g${u})"/>`:""}<g transform="translate(150 150) scale(${k}) translate(-150 -150)" stroke-width="3.4">${tail}${wing(-1)}${wing(1)}${b}${head}</g></svg>`;
  return {aura,tail:wrap(tail),wL:wrap(wing(-1)),wR:wrap(wing(1)),body:wrap(b),head:wrap(head),pts}}
function dgMini(D){return dgParts(D,{mini:1})}
/* сцена: слои + живые эффекты (дым из ноздрей, искры, горящие глаза) — только transform и opacity */
function dgStageHTML(D){const P=dgParts(D),T=P.pts,pc=a=>`left:${a[0]}%;top:${a[1]}%`;let fx="";
  if(T.s>=2)fx+=T.nose.map((n,i)=>`<i class="dgsm" style="${pc(n)};animation-delay:${i*1.3}s"></i>`).join("");
  if(T.s>=5)for(let i=0;i<7;i++)fx+=`<i class="dgem" style="left:${12+i*12}%;animation-delay:${-(i*.7).toFixed(1)}s;--dx:${(i%2?1:-1)*(8+i*3)}px"></i>`;
  if(T.glow)fx+=T.eyes.map(e=>`<i class="dgeg" style="${pc(e)};--gc:${T.glow}"></i>`).join("");
  return `<div class="dgf s${T.s}" data-mouth="${T.mouth.join(",")}">${P.aura?`<div class="dgl dga">${P.aura}</div>`:""}<div class="dgl dgt">${P.tail}</div><div class="dgl dgwl">${P.wL}</div><div class="dgl dgwr">${P.wR}</div><div class="dgl dgb">${P.body}</div><div class="dgl dghd" style="transform-origin:${T.neck[0]}% ${T.neck[1]}%">${P.head}<div class="dgfx">${fx}</div></div></div>`}
/* огонь по тапу: детёныш пыхтит облачком, взрослый выдыхает пламя */
function dgBreath(){const f=document.querySelector("#dg-stage .dgf");if(!f)return;const m=(f.dataset.mouth||"50,50").split(",").map(Number),s=+(f.className.match(/s(\d)/)||[0,0])[1];
  const e=document.createElement("i");e.className=s>=3?"dgfire":"dgpuff";e.style.left=m[0]+"%";e.style.top=m[1]+"%";f.querySelector(".dghd").appendChild(e);setTimeout(()=>e.remove(),s>=3?900:1100)}
/* ---------- иконки снаряжения ---------- */
function dgItemSVG(it){const c=dgSetOf(it.t).c,r=DG_R[it.r].c,id="di"+(++dgUid),st=`stroke="${DG_INK}" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"`;
  const sh={head:`<path d="M10 40 Q10 14 32 12 Q54 14 54 40 Q44 34 32 34 Q20 34 10 40 Z" fill="url(#${id})" ${st}/><path d="M24 14 L32 2 L40 14 Z" fill="${r}" ${st}/><path d="M12 38 Q32 28 52 38" fill="none" stroke="${r}" stroke-width="3"/>`,
   body:`<path d="M14 14 Q32 6 50 14 L48 44 Q32 58 16 44 Z" fill="url(#${id})" ${st}/><path d="M18 26 Q32 20 46 26 M19 36 Q32 30 45 36" fill="none" stroke="${r}" stroke-width="3"/><circle cx="32" cy="46" r="3" fill="${r}"/>`,
   wings:`<path d="M54 50 L40 18 L14 6 Q14 20 4 24 Q12 32 4 42 Q16 44 16 54 Q30 50 40 58 Z" fill="url(#${id})" ${st}/><path d="M54 50 L40 18 L14 6" fill="none" stroke="${r}" stroke-width="4"/>`,
   claws:`<path d="M12 50 Q14 22 22 10 Q24 30 20 50 Z M28 52 Q30 20 38 6 Q40 30 36 52 Z M44 50 Q46 24 54 14 Q54 32 52 50 Z" fill="url(#${id})" ${st}/><path d="M8 52 H58" stroke="${r}" stroke-width="5" stroke-linecap="round"/>`,
   amul:`<path d="M14 8 Q32 34 50 8" fill="none" stroke="#e8b33a" stroke-width="4"/><path d="M32 22 L46 38 L32 58 L18 38 Z" fill="url(#${id})" ${st}/><path d="M32 30 L39 38 L32 48 L25 38 Z" fill="${r}"/><circle cx="29" cy="34" r="2.4" fill="#fff"/>`}[it.s]||"";
  return `<svg viewBox="0 0 64 64" aria-hidden="true"><defs><linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${shade(c,.35)}"/><stop offset=".55" stop-color="${c}"/><stop offset="1" stop-color="${shade(c,-.45)}"/></linearGradient></defs>${sh}</svg>`}
function dgItemTile(it,o){o=o||{};const D=dgOf(),on=D&&D.eq&&D.eq[it.s]===it.id;return `<button type="button" class="dgi r${it.r}${on?" on":""}${o.sel?" sel":""}" data-it="${it.id}" style="--rc:${DG_R[it.r].c}">${dgItemSVG(it)}${it.lv?`<em>+${it.lv}</em>`:""}${on?'<i class="dgi-on">✓</i>':""}<small>${dgFmt(dgItemPow(it))}</small></button>`}
/* ---------- тайное яйцо ---------- */
function dgEggSVG(fr){const cr=["M100 18 L94 44 L108 60 L96 84 L104 98","M34 128 L58 132 L54 150 L78 160 L74 176","M166 112 L144 124 L152 142 L128 152 L134 168"];
  return `<svg viewBox="0 0 200 240" aria-hidden="true"><defs><radialGradient id="dgeg" cx=".38" cy=".3" r=".85"><stop offset="0" stop-color="#6a4ac0"/><stop offset=".55" stop-color="#2a1a5a"/><stop offset="1" stop-color="#0d0828"/></radialGradient></defs>
   <path d="M100 14 C150 14 178 96 178 148 C178 200 142 228 100 228 C58 228 22 200 22 148 C22 96 50 14 100 14 Z" fill="url(#dgeg)" stroke="${DG_INK}" stroke-width="5"/>
   <g fill="#7a5ad8" opacity=".55"><ellipse cx="64" cy="96" rx="12" ry="16"/><ellipse cx="136" cy="74" rx="9" ry="12"/><ellipse cx="128" cy="186" rx="14" ry="11"/><ellipse cx="70" cy="190" rx="8" ry="10"/><ellipse cx="150" cy="140" rx="7" ry="9"/></g>
   <g fill="none" stroke="#7cf7ff" stroke-width="2.4" opacity=".75"><path d="M94 120 l6 -10 l6 10 l-6 10 Z"/><path d="M58 150 q8 -8 16 0"/><path d="M128 100 l8 0 l-4 8 Z"/><circle cx="104" cy="168" r="6"/></g>
   ${cr.map((d,i)=>i<fr?`<path d="${d}" fill="none" stroke="#ffb84d" stroke-width="7" opacity=".55"/><path d="${d}" fill="none" stroke="#fff6c8" stroke-width="3"/>`:"").join("")}
   <ellipse cx="70" cy="70" rx="16" ry="26" fill="#fff" opacity=".18" transform="rotate(-20 70 70)"/></svg>`}
function dgFr(){return Math.min(DG.fr,(S&&S.dgFr)||0)}
function dgEggHTML(){const fr=dgFr(),ready=fr>=DG.fr||(S&&S.admin);
  return `<div class="dge${ready?" ready":""}"><div class="dge-st"><div class="dge-glow"></div><div class="dge-egg">${dgEggSVG(ready?3:fr)}</div><i class="dge-q q1">?</i><i class="dge-q q2">?</i><i class="dge-q q3">?</i></div>
   <h2>Тайное яйцо</h2><p class="dge-lore">${ready?"Оно треснуло и дрожит… Внутри кто-то ждёт тебя. Разбей скорлупу!":"Его нашли в руинах древнего храма. Внутри что-то дышит и греется… Говорят, тот, кто разбудит яйцо, получит силу, которая <b>перевернёт всю игру</b>."}</p>
   <div class="dge-prog"><div class="dge-ph"><b>Тепло друзей</b><span>${fr} из ${DG.fr}</span></div><div class="dge-sl">${[0,1,2].map(i=>`<div class="${i<fr?"on":""}"><i>${i<fr?"🔥":"❔"}</i><small>${i<fr?"друг согрел":"ждёт друга"}</small></div>`).join("")}</div>
    <small>Яйцо просыпается только от тепла друзей. Пригласи ${DG.fr} новых друзей по своей ссылке — друг считается, если пришёл после появления яйца (с 28 октября) и сделал ${DG.frSpins} прокруток.</small></div>
   <button type="button" class="craftbtn dge-go" id="dge-go">${ready?"🔨 Разбить скорлупу!":"👥 Позвать друзей"}</button>
   <div class="dge-tz"><div><i>⚔️</i><b>???</b><small>изменит твои бои</small></div><div><i>🎴</i><b>???</b><small>каждый день</small></div><div><i>👑</i><b>???</b><small>чем будут хвастаться</small></div><div><i>🌱</i><b>???</b><small>растёт вместе с тобой</small></div></div></div>`}
/* ---------- главный экран дракона ---------- */
function dgInfo(D){const now=NOW(),s=dgStage(D.lv),sat=dgSat(D,now),pw=dgPower(D),bon=dgBonus(S,now),g=DG_STAGE[s].gift;dgDay(D,now);
  return {s,sat,pw,bon,g,giftOk:g>0&&!D.gift&&sat>=DG.hungry,nestOk:!D.nest&&D.fd>=1&&(D.tp||0)>=DG.nestTaps,hungry:sat<DG.hungry,cur:dgCum(D.lv),next:dgCum(D.lv+1)}}
function dgTile(){if(!S)return null;const D=dgOf();if(!D){const fr=dgFr(),r=fr>=DG.fr;return {ic:"🥚",n:"Тайное яйцо",s:r?"оно треснуло! загляни":"разбуди его: "+fr+"/"+DG.fr+" друзей",dot:r?1:0,c:["#2a1a5a","#7a5ad8"],cls:"egg"}}
  const I=dgInfo(D);return {ic:"🐉",n:D.name||dgBr(D).n+" дракон",s:I.hungry?"🍖 голоден — покорми!":I.giftOk?"🎁 принёс "+I.g+" 🎴":I.nestOk?"🪺 в гнезде чешуя":"ур. "+D.lv+" · мощь "+dgFmt(I.pw),dot:I.hungry||I.giftOk||I.nestOk?1:0,c:[dgBr(D).c[2],dgBr(D).c[0]]}}
function dgNav(){const D=dgOf(),i=$("tab-dragon-i"),t=$("tab-dragon-t"),d=$("dg-dot");if(!i)return;i.textContent=D?"🐉":"🥚";t.textContent=D?"Дракон":"Тайна";const T=dgTile();if(d)d.hidden=!(T&&T.dot)}
function renderDragon(){const R=$("dg-root");if(!R||!S)return;dgNav();if($("sec-dragon").hidden)return;const D=dgOf();
  if(!D){const k="egg"+dgFr()+(S.admin?1:0);if(dgKey!==k){dgKey=k;R.innerHTML=dgEggHTML();$("dge-go").onclick=dgEggGo}return}
  const I=dgInfo(D),B=dgBr(D),kk="dg"+D.b+"_"+I.s+"_"+JSON.stringify(D.eq||{})+"_"+dgEq(D).map(x=>x.lv).join(",");
  if(dgKey!==kk||!$("dg-stage")){dgKey=kk;R.innerHTML=`<div class="dgm" style="--c0:${B.c[0]};--c1:${B.c[1]};--c2:${B.c[2]}">
    <div class="dgh"><div class="dgh-l"><button type="button" class="dgn" id="dg-name"></button><span class="dgst" id="dg-st"></span></div><div class="dgh-p"><small>мощь</small><b id="dg-pow"></b></div></div>
    <div class="dglv"><b id="dg-lv"></b><div class="dgbar"><i id="dg-xp"></i></div><small id="dg-xpt"></small></div>
    <div class="dgstage" id="dg-stage"><div class="dgbg"></div>${dgStageHTML(D)}<div class="dghs" id="dg-hs"></div><div class="dgtip" id="dg-tip">Погладь меня! 💜</div></div>
    <div class="dgsat"><div><span>🍖 Сытость</span><b id="dg-satn"></b></div><div class="dgbar sat"><i id="dg-sat"></i></div><div><span>💜 Ласка сегодня</span><b id="dg-tp"></b></div></div>
    <div class="dgact"><button type="button" id="dg-feed"><i>🍖</i><b>Покормить</b><small id="dg-feed-t"></small></button><button type="button" id="dg-gift"><i>🎁</i><b>Дар дракона</b><small id="dg-gift-t"></small></button><button type="button" id="dg-nest"><i>🪺</i><b>Гнездо</b><small id="dg-nest-t"></small></button></div>
    <div class="dgbuff" id="dg-buff"></div>
    <div class="dgseg" id="dg-seg"><button type="button" data-d="gear">🛡 Вещи</button><button type="button" data-d="chest">🎁 Сундуки</button><button type="button" data-d="top">🏆 Топ</button><button type="button" data-d="how">📜 Рост</button></div>
    <div id="dg-sub"></div>
    <button type="button" class="craftbtn dgbrag" id="dg-brag">📣 Похвастаться драконом</button></div>`;
    $("dg-stage").onclick=dgPet;$("dg-name").onclick=dgRename;$("dg-feed").onclick=dgFeedSheet;$("dg-gift").onclick=dgGift;$("dg-nest").onclick=dgNest;$("dg-brag").onclick=dgBrag;
    $("dg-seg").onclick=e=>{const b=e.target.closest("[data-d]");if(!b)return;dgSub=b.dataset.d;dgSubDraw();hap("light")};
    $("dg-sub").onclick=dgSubClick;dgSubDraw()}
  dgUpd(D,I)}
function dgUpd(D,I){I=I||dgInfo(D);const B=dgBr(D);
  $("dg-name").textContent=(D.name||"Назови дракона")+" ✏️";$("dg-st").innerHTML=DG_STAGE[I.s].n+' · <span style="color:'+DG_R[B.r].c+'">'+B.n+'</span> <em>'+DG_BR_R[B.r]+'</em>';
  $("dg-pow").textContent=dgFmt(I.pw);$("dg-lv").textContent=D.lv>=DG.max?"Ур. "+DG.max+" · МАКС":"Ур. "+D.lv;
  const pc=D.lv>=DG.max?1:(D.xp-I.cur)/Math.max(1,I.next-I.cur);$("dg-xp").style.transform="scaleX("+Math.max(0,Math.min(1,pc))+")";
  $("dg-xpt").textContent=D.lv>=DG.max?dgFmt(D.xp)+" опыта":dgFmt(D.xp-I.cur)+" / "+dgFmt(I.next-I.cur)+" опыта";
  $("dg-satn").textContent=Math.round(I.sat)+"%";$("dg-sat").style.transform="scaleX("+(I.sat/100)+")";$("dg-sat").parentNode.classList.toggle("low",I.hungry);
  $("dg-tp").textContent=Math.min(DG.tapCap,(D.tp||0)+dgPend)+" / "+DG.tapCap;
  $("dg-feed-t").textContent=(D.fd||0)+" / "+DG.feedMax+" сегодня";$("dg-feed").classList.toggle("hot",I.hungry);
  $("dg-gift-t").textContent=I.g?(D.gift?"завтра снова":"+"+I.g+" 🎴"):"с 10 уровня";$("dg-gift").classList.toggle("hot",I.giftOk);$("dg-gift").classList.toggle("off",!I.g||!!D.gift);
  $("dg-nest-t").textContent=D.nest?"завтра снова":I.nestOk?"чешуя ждёт!":"корм + "+DG.nestTaps+" 💜";$("dg-nest").classList.toggle("hot",I.nestOk);$("dg-nest").classList.toggle("off",!!D.nest);
  $("dg-buff").innerHTML='<div><i>⚔️</i><span>+'+Math.round(I.bon*1000)/10+'%</span><small>сила в боях и завоевании</small></div><div><i>🛡</i><span>+'+dgFmt(Math.round(I.pw*.4*(I.hungry?.5:1)))+'</span><small>урона клан-боссу</small></div><div><i>🎴</i><span>+'+I.g+'</span><small>прокруток в день</small></div>'+(I.hungry?'<p class="dgwarn">Дракон голоден: вся сила в 2 раза меньше. Покорми его!</p>':'');
  const tip=$("dg-tip");if(tip)tip.hidden=(D.tp||0)+dgPend>=DG.tapCap;
  document.querySelectorAll("#dg-seg [data-d]").forEach(b=>b.setAttribute("aria-pressed",b.dataset.d===dgSub))}
/* ---------- ласка: тапы копятся и уходят на сервер пачкой ---------- */
function dgPet(e){const D=dgOf();if(!D)return;if((D.tp||0)+dgPend>=DG.tapCap){toast("Дракон довольно мурчит — на сегодня ласки хватит 💜");return}
  dgPend++;hap("light");const st=$("dg-stage"),f=st.querySelector(".dgf");if(f){f.classList.remove("hop");void f.offsetWidth;f.classList.add("hop")}if(dgPend%4===1)dgBreath();
  if(dgHearts<6){dgHearts++;const r=st.getBoundingClientRect(),h=document.createElement("span");h.className="dgh1";h.textContent=Math.random()<.3?"✨":"💜";h.style.left=((e&&e.clientX?e.clientX-r.left:r.width/2)-10)+"px";h.style.top=((e&&e.clientY?e.clientY-r.top:r.height/2)-14)+"px";h.style.setProperty("--dx",(Math.random()*40-20)+"px");$("dg-hs").appendChild(h);setTimeout(()=>{h.remove();dgHearts--},900)}
  try{sfx.tick(Math.random()<.5)}catch(x){}$("dg-tp").textContent=Math.min(DG.tapCap,(D.tp||0)+dgPend)+" / "+DG.tapCap;
  clearTimeout(dgFlushT);dgFlushT=setTimeout(dgFlush,1100)}
async function dgFlush(){if(dgBusy||dgPend<1)return;dgBusy=true;const n=dgPend;dgPend=0;const r=await act("dg_tap",{n});dgBusy=false;if(r&&r.xp){const D=dgOf();if(D)dgUpd(D)}if(dgPend)dgFlushT=setTimeout(dgFlush,600)}
/* ---------- кормление, дар, гнездо ---------- */
function dgFeedSheet(){const D=dgOf();if(!D)return;const m=$("modal"),sh=$("msheet"),V=campView();m.hidden=false;
  const row=(k,price,can)=>{const F=DG_FOOD[k];return `<button type="button" class="dgfd" data-f="${k}"${can?"":" disabled"}><i>${F.ic}</i><span><b>${F.n}</b><small>+${F.sat}% сытости · +${dgFmt(F.xp)} опыта</small></span><em>${price}</em></button>`};
  sh.innerHTML='<div class="box nickbox dgfeed"><h3>🍖 Покормить дракона</h3><p>Сытый дракон сильнее и быстрее растёт. Кормить можно '+DG.feedMax+' раз в день (сегодня: '+(D.fd||0)+').</p>'+
   row("meat",dgFmt(DG_FOOD.meat.runes)+" 💠",V.runes>=DG_FOOD.meat.runes)+row("fish",fmtC(DG_FOOD.fish.cash),S.cash>=DG_FOOD.fish.cash)+row("apple",(D.ap||0)+" шт.",(D.ap||0)>0)+
   '<button type="button" class="linkbtn" id="dgf-ap">🍏 Купить 3 золотых яблока · ⭐ '+DG_SHOP.apple.stars+'</button><button type="button" class="ghost" id="dgf-x">Закрыть</button></div>';
  sh.querySelectorAll("[data-f]").forEach(b=>b.onclick=async()=>{b.disabled=true;const r=await act("dg_feed",{k:b.dataset.f});if(!r){b.disabled=false;return}closeModal();sfx.coin();hapN("success");toast(DG_FOOD[b.dataset.f].ic+" Ням! +"+dgFmt(r.xp)+" опыта · сытость "+r.sat+"%");renderAll()});
  $("dgf-ap").onclick=()=>{closeModal();buyItem({item:"dg",k:"apple"})};$("dgf-x").onclick=closeModal}
async function dgGift(){const D=dgOf();if(!D)return;const I=dgInfo(D);if(!I.g){toast("Дракон начнёт приносить прокрутки с 10 уровня (Юный дракон)");return}if(D.gift){toast("Дар уже получен. Завтра дракон принесёт снова");return}
  const r=await act("dg_gift");if(!r)return;sfx.fanfare();hapN("success");dgFly("🎴 +"+r.sp);toast("🐉 Дракон принёс "+r.sp+" прокрутк"+(r.sp===1?"у":r.sp<5?"и":"")+"!");renderAll()}
async function dgNest(){const D=dgOf();if(!D)return;if(D.nest){toast("Гнездо уже собрано. Завтра там снова будет чешуя");return}
  const r=await act("dg_nest");if(!r)return;sfx.coin();hapN("success");dgFly(DG_SCI+" +"+r.sh);toast("🪺 В гнезде "+r.sh+" чешуи! На неё открываются сундуки со снаряжением");renderAll()}
function dgFly(t){const st=$("dg-stage");if(!st)return;const h=document.createElement("span");h.className="dgfly";h.innerHTML=t;st.appendChild(h);setTimeout(()=>h.remove(),1400)}
/* ---------- вкладки: снаряжение, сундуки, топ, рост ---------- */
let dgInvSort="r";
function dgSubDraw(){const el=$("dg-sub"),D=dgOf();if(!el||!D)return;document.querySelectorAll("#dg-seg [data-d]").forEach(b=>b.setAttribute("aria-pressed",b.dataset.d===dgSub));
  if(dgSub==="gear"){const eq=dgEq(D),sb=dgSetBonus(eq),inv=(D.inv||[]).slice().sort((a,b)=>dgInvSort==="r"?(b.r-a.r||b.lv-a.lv||dgItemPow(b)-dgItemPow(a)):(a.s<b.s?-1:a.s>b.s?1:b.r-a.r));
    const low=inv.filter(it=>it.r<=1&&!Object.values(D.eq||{}).includes(it.id));
    el.innerHTML='<div class="dgslots">'+DG_SLOT.map(S2=>{const it=eq.find(x=>x.s===S2.k);return '<div class="dgsl">'+(it?dgItemTile(it):'<div class="dgi empty"><i>'+S2.ic+'</i></div>')+'<small>'+S2.n+'</small></div>'}).join("")+'</div>'+
     '<div class="dgset'+(sb.b?" on":"")+'">'+(sb.k?dgSetOf(sb.k).ic+' Комплект '+dgSetOf(sb.k).n+': <b>'+sb.n+'/5</b> · '+(sb.n>=5?'<b>+25% мощи и сияние!</b>':sb.n>=3?'<b>+10% мощи</b> (5/5 — +25% и сияние)':'3 предмета — +10%, 5 — +25% и сияние'):'Надень 3 предмета одного комплекта — +10% мощи, 5 — +25% и сияние')+'</div>'+
     '<div class="dginvh"><b>Сумка '+inv.length+'/'+DG.invMax+'</b><span>'+DG_SCI+' '+dgFmt(D.sh||0)+'</span><button type="button" class="mini2" data-sort="1">'+(dgInvSort==="r"?"по редкости":"по слоту")+'</button></div>'+
     (inv.length?'<div class="dginv">'+inv.map(it=>dgItemTile(it)).join("")+'</div>':'')+'<button type="button" class="craftbtn dggo" data-goch="1">🎁 Где взять вещи? Открыть сундуки'+((D.sh||0)>=DG_CHEST.nest.sh?' · хватает '+DG_SCI+' на сундук!':'')+'</button>'+
     (low.length?'<button type="button" class="craftbtn ghost dgdis" data-disall="1">♻️ Разобрать обычные и редкие ('+low.length+') → '+DG_SCI+' '+dgFmt(low.reduce((a,it)=>a+Math.round(DG_R[it.r].dis*(1+.5*(it.lv||0))),0))+'</button>':'')}
  else if(dgSub==="chest"){const ch=k=>{const K=DG_CHEST[k];const can=K.sh?(D.sh||0)>=K.sh:1;return '<div class="dgch '+k+'"><div class="dgch-i">'+chestSVG("dg_"+k,78)+'</div><div><h4>'+K.n+'</h4><p>'+K.p.map((p,r)=>p?'<span style="color:'+DG_R[r].c+'">'+DG_R[r].n+' '+String(p).replace(".",",")+'%</span>':"").filter(Boolean).join(" · ")+(K.bonus?' · <b>+'+K.bonus+' '+DG_SCI+'</b>':'')+'</p><button type="button" class="buy" data-ch="'+k+'"'+(can?"":" disabled")+'>'+(K.sh?DG_SCI+" "+K.sh:"⭐ "+K.stars)+'</button></div></div>'};
    el.innerHTML='<div class="dgshb">'+DG_SCI+' Чешуя: <b>'+dgFmt(D.sh||0)+'</b><small>гнездо каждый день, победы в боях (+'+DG.winSh+'), завоевание (+'+DG.conqSh+'), разбор снаряжения. А в казино иногда выпадают вещи и яблоки 🍏</small></div>'+ch("nest")+ch("royal")+'<div class="ghd">⭐ Сокровища за звёзды</div>'+ch("star")+ch("div")+
     '<div class="dgch apple"><div class="dgch-i big">🍏</div><div><h4>'+DG_SHOP.apple.n+'</h4><p>Каждое: +2 500 опыта и полная сытость. У тебя: '+(D.ap||0)+'</p><button type="button" class="buy" data-shop="apple">⭐ '+DG_SHOP.apple.stars+'</button></div></div>'+
     '<div class="dgch reborn"><div class="dgch-i big">🔮</div><div><h4>'+DG_SHOP.reborn.n+'</h4><p>Дракон перерождается в новую породу — только редкая или выше: '+DG_REB_P.map((p,r)=>p?DG_BR_R[r].toLowerCase()+" "+p+"%":"").filter(Boolean).join(", ")+'. Уровень и снаряжение остаются.</p><button type="button" class="buy" data-shop="reborn">⭐ '+DG_SHOP.reborn.stars+'</button></div></div>'}
  else if(dgSub==="top"){el.innerHTML='<div class="dgtop" id="dg-top">'+(dgTopD?dgTopHTML():'<p class="cln">Загружаю…</p>')+'</div>';if(ONLINE)act("dg_top").then(r=>{if(!r)return;dgTopD=r;const t=$("dg-top");if(t&&dgSub==="top"){t.innerHTML=dgTopHTML();hydrateDgTop()}});else{dgTopD={list:[{uid:S.uid,name:S.name,pow:dgPower(D),lv:D.lv,b:D.b,dn:D.name,me:1,eq:[]}],place:1,total:1};el.querySelector("#dg-top").innerHTML=dgTopHTML()}}
  else{el.innerHTML='<div class="dghow"><h4>Стадии</h4>'+DG_STAGE.map((T,i)=>'<div class="dgstg'+(dgStage(D.lv)>=i?" on":"")+'"><b>'+T.n+'</b><span>с '+T.lv+' ур.</span><em>'+(T.gift?"🎴 +"+T.gift+" в день":"—")+'</em></div>').join("")+
    '<h4>Откуда опыт</h4><ul><li>💜 Ласка: +1 за каждое касание (до '+DG.tapCap+' в день)</li><li>🍖 Кормление: +60 (до '+DG.feedMax+' раз в день), 🍏 золотое яблоко: +2 500</li><li>⚔️ Победа в бою: +'+DG.winXp+' и +'+DG.winSh+' '+DG_SCI+' (до '+DG.winCap+' побед в день)</li><li>🗺 Новая точка завоевания: +'+DG.conqXp+' и +'+DG.conqSh+' '+DG_SCI+'</li><li>✅ Задание дня: +'+DG.taskXp+'</li><li>🎴 Каждая прокрутка: +'+DG.spinXp+'</li><li>🎰 Казино: с маленьким шансом выпадает вещь для дракона или золотое яблоко</li></ul>'+
    '<h4>Что даёт дракон</h4><ul><li>⚔️ Сила в боях и завоевании: до +20% (растёт с мощью)</li><li>🛡 Бьёт кланового босса вместе с тобой</li><li>🎴 С 10 уровня каждый день приносит прокрутки</li><li>👑 Порода, снаряжение и сияние — видно в топе драконов</li></ul><p class="cln">Голодный дракон (сытость ниже '+DG.hungry+'%) отдаёт только половину силы и опыта. Сытость падает на '+DG.satH+'% в час.</p></div>'}}
function dgTopHTML(){const T=dgTopD;if(!T||!T.list.length)return '<p class="cln">Пока ни у кого нет дракона. Ты можешь стать первым!</p>';
  return (T.place?'<div class="dgtme">Твоё место: <b>'+T.place+'</b> из '+T.total+'</div>':'')+T.list.map((r,i)=>'<button type="button" class="dgtr'+(r.me?" me":"")+'" data-view="'+r.uid+'"><b class="pl">'+(i<3?["🥇","🥈","🥉"][i]:i+1)+'</b><span class="dgtm" data-mini="'+i+'"></span><span class="nm"><b>'+escH(r.dn||DG_BREED[r.b].n+" дракон")+'</b><small>'+escH(r.name)+' · ур. '+r.lv+' · <i style="color:'+DG_R[DG_BREED[r.b].r].c+'">'+DG_BREED[r.b].n+'</i></small></span><em>'+dgFmt(r.pow)+'</em></button>').join("")}
function hydrateDgTop(){const T=dgTopD;if(!T)return;document.querySelectorAll("#dg-top [data-mini]").forEach(e=>{const i=+e.dataset.mini;if(i>14){e.textContent="🐉";return}const r=T.list[i];const D={b:r.b,lv:r.lv,inv:(r.eq||[]).map((x,j)=>({id:j+1,s:x.s,r:x.r,t:x.t,lv:0})),eq:{}};D.inv.forEach(x=>D.eq[x.s]=x.id);e.innerHTML=dgMini(D)})}
async function dgSubClick(e){const D=dgOf();if(!D)return;const t=e.target.closest("button");if(!t||t.disabled)return;
  if(t.dataset.sort){dgInvSort=dgInvSort==="r"?"s":"r";dgSubDraw();return}
  if(t.dataset.goch){dgSub="chest";dgSubDraw();const g=$("dg-seg");if(g)g.scrollIntoView({behavior:"smooth",block:"start"});return}
  if(t.dataset.it)return dgItemSheet(+t.dataset.it);
  if(t.dataset.disall){const eqs=new Set(Object.values(D.eq||{})),ids=(D.inv||[]).filter(it=>it.r<=1&&!eqs.has(it.id)).map(it=>it.id);if(!ids.length)return;t.disabled=true;const r=await act("dg_dis",{ids});if(!r){t.disabled=false;return}sfx.coin();toast("♻️ Разобрано "+r.n+" → +"+r.sh+" чешуи");dgKey="";renderAll();return}
  if(t.dataset.ch){const k=t.dataset.ch,K=DG_CHEST[k];if(K.stars)return buyItem({item:"dg",k});t.disabled=true;const r=await act("dg_open",{k});if(!r){t.disabled=false;return}dgReveal(r.item,K.n,k);dgKey="";renderAll();return}
  if(t.dataset.shop)return buyItem({item:"dg",k:t.dataset.shop});
  if(t.dataset.view)return dgViewSheet(+t.dataset.view)}
function dgItemSheet(id){const D=dgOf(),it=D&&(D.inv||[]).find(x=>x.id===id);if(!it)return;const m=$("modal"),sh=$("msheet"),on=D.eq&&D.eq[it.s]===it.id,cost=dgUpCost(it);m.hidden=false;
  sh.innerHTML='<div class="box nickbox dgis" style="--rc:'+DG_R[it.r].c+'"><div class="dgis-i r'+it.r+'">'+dgItemSVG(it)+'</div><h3>'+dgItemName(it)+(it.lv?' +'+it.lv:'')+'</h3><p class="dgis-r"><b style="color:'+DG_R[it.r].c+'">'+DG_R[it.r].n+'</b> · '+dgSetOf(it.t).ic+' комплект '+dgSetOf(it.t).n+' · '+dgSlotOf(it.s).n+'</p><div class="dgis-p">Мощь <b>'+dgFmt(dgItemPow(it))+'</b>'+(it.lv<DG.upMax?' → '+dgFmt(dgItemPow(Object.assign({},it,{lv:it.lv+1}))):'')+'</div>'+
   '<button type="button" class="craftbtn" id="dgis-eq">'+(on?"Снять":"Надеть")+'</button>'+(it.lv<DG.upMax?'<button type="button" class="craftbtn" id="dgis-up"'+((D.sh||0)<cost?" disabled":"")+'>⬆️ Улучшить до +'+(it.lv+1)+' · '+DG_SCI+' '+dgFmt(cost)+'</button>':'<p class="cln">Улучшено до максимума</p>')+
   (on?'':'<button type="button" class="craftbtn ghost" id="dgis-dis">♻️ Разобрать → '+DG_SCI+' '+dgFmt(Math.round(DG_R[it.r].dis*(1+.5*(it.lv||0))))+'</button>')+'<button type="button" class="ghost" id="dgis-x">Закрыть</button></div>';
  $("dgis-eq").onclick=async()=>{const r=await act("dg_equip",{id});if(!r)return;hap("medium");closeModal();dgKey="";renderAll();toast((on?"Снято":"Надето")+" · мощь "+dgFmt(r.pow))};
  if($("dgis-up"))$("dgis-up").onclick=async()=>{const r=await act("dg_up",{id});if(!r)return;sfx.coin();hapN("success");dgKey="";renderAll();dgItemSheet(id)};
  if($("dgis-dis"))$("dgis-dis").onclick=async()=>{const r=await act("dg_dis",{ids:[id]});if(!r)return;closeModal();sfx.coin();toast("♻️ +"+r.sh+" чешуи");dgKey="";renderAll()};
  $("dgis-x").onclick=closeModal}
function dgReveal(it,title,k){const m=$("modal"),sh=$("msheet");m.hidden=false;
  sh.innerHTML='<div class="box nickbox dgrev"><small>'+escH(title)+'</small><div class="dgrev-ch">'+chestSVG("dg_"+(k||"nest"),150)+'</div><p class="cln">Открываем…</p></div>';hap("heavy");try{sfx.rumble(1);setTimeout(()=>sfx.rumble(3),300)}catch(e){}
  setTimeout(()=>{if($("modal").hidden)return;try{it.r>=3?sfx.fanfare():sfx.reveal(it.r)}catch(e){}hapN("success");dgRevealItem(it,title)},950)}
function dgRevealItem(it,title){const sh=$("msheet");
  sh.innerHTML='<div class="box nickbox dgrev r'+it.r+'" style="--rc:'+DG_R[it.r].c+'"><small>'+escH(title)+'</small><div class="dgrev-w">'+(it.r>=3?'<i class="dgrev-rays"></i>':'')+'<div class="dgrev-i">'+dgItemSVG(it)+'</div></div><h3>'+dgItemName(it)+'</h3><p><b style="color:'+DG_R[it.r].c+'">'+DG_R[it.r].n+'</b> · мощь '+dgFmt(dgItemPow(it))+'</p><button type="button" class="craftbtn" id="dgr-eq">Надеть</button><button type="button" class="ghost" id="dgr-x">В сумку</button></div>';
  $("dgr-eq").onclick=async()=>{const r=await act("dg_equip",{id:it.id});closeModal();if(r){dgKey="";renderAll();toast("Надето · мощь "+dgFmt(r.pow))}};$("dgr-x").onclick=closeModal}
async function dgViewSheet(uid){const r=await act("dg_view",{uid});if(!r)return;const V=r.dg,m=$("modal"),sh=$("msheet");m.hidden=false;const D={b:V.b,lv:V.lv,inv:V.eq.map((x,j)=>({id:j+1,s:x.s,r:x.r,t:x.t,lv:x.lv})),eq:{}};D.inv.forEach(x=>D.eq[x.s]=x.id);const B=DG_BREED[V.b];
  sh.innerHTML='<div class="box nickbox dgview" style="--c0:'+B.c[0]+';--c1:'+B.c[1]+'"><h3>'+escH(V.name||B.n+" дракон")+'</h3><p>'+escH(r.name)+' · '+DG_STAGE[V.stage].n+' · ур. '+V.lv+'</p><div class="dgview-a">'+dgMini(D)+'</div><p><span style="color:'+DG_R[B.r].c+'">'+B.n+' ('+DG_BR_R[B.r].toLowerCase()+')</span> · мощь <b>'+dgFmt(V.pow)+'</b></p><div class="dgview-eq">'+D.inv.map(it=>'<span class="dgi r'+it.r+'" style="--rc:'+DG_R[it.r].c+'">'+dgItemSVG(it)+(it.lv?'<em>+'+it.lv+'</em>':'')+'</span>').join("")+'</div><button type="button" class="ghost" id="dgv-x">Закрыть</button></div>';$("dgv-x").onclick=closeModal}
function dgRename(){const D=dgOf();if(!D)return;dgNameSheet(D.name||"","Как зовут твоего дракона?")}
function dgNameSheet(v,title){const m=$("modal"),sh=$("msheet");m.hidden=false;sh.innerHTML='<div class="box nickbox"><h3>'+title+'</h3><input type="text" id="dgn-i" maxlength="'+DG.nameMax+'" placeholder="Например, Искра" value="'+escH(v)+'"><button type="button" class="craftbtn" id="dgn-ok">Сохранить</button><button type="button" class="ghost" id="dgn-x">Позже</button></div>';
  $("dgn-ok").onclick=async()=>{const r=await act("dg_name",{name:$("dgn-i").value});if(!r)return;closeModal();dgKey="";renderAll();toast("🐉 Теперь его зовут "+r.name+"!")};$("dgn-x").onclick=closeModal;setTimeout(()=>{try{$("dgn-i").focus()}catch(e){}},200)}
function dgBrag(){const D=dgOf();if(!D)return;const B=dgBr(D);if(!ONLINE){toast("Поделиться можно в игре через бота");return}
  sendLink("🐉 Мой дракон «"+(D.name||B.n)+"» — "+DG_STAGE[dgStage(D.lv)].n.toLowerCase()+" "+D.lv+" уровня, порода "+B.n.toLowerCase()+" ("+DG_BR_R[B.r].toLowerCase()+"), мощь "+dgFmt(dgPower(D))+"! А у тебя есть дракон? Залетай в «Воины Эпох»",linkFor("r_"+S.uid))}
/* ---------- яйцо: позвать друзей или разбить ---------- */
async function dgEggGo(){const fr=dgFr();if(fr<DG.fr&&!S.admin){if(!ONLINE){toast("Приглашения работают в игре через бота");return}sendLink("Помоги разбудить моё тайное яйцо в «Воинах Эпох»! 🥚 Заходи по ссылке и крути карточки воинов",linkFor("r_"+S.uid));return}
  const egg=document.querySelector(".dge");if(!egg||egg.classList.contains("hatch"))return;egg.classList.add("hatch");try{for(let i=0;i<6;i++)setTimeout(()=>sfx.rumble(i),i*260)}catch(e){}hap("heavy");
  const r=await act("dg_hatch");if(!r){egg.classList.remove("hatch");return}
  setTimeout(()=>{const fl=document.createElement("div");fl.className="dgflash";document.body.appendChild(fl);setTimeout(()=>fl.remove(),1100);try{sfx.fanfare()}catch(e){}hapN("success")},1500);
  setTimeout(()=>{dgKey="";renderAll();dgHatchReveal()},1900)}
function dgHatchReveal(){const D=dgOf();if(!D)return;const B=dgBr(D),m=$("modal"),sh=$("msheet");m.hidden=false;
  sh.innerHTML='<div class="box nickbox dghatch r'+B.r+'" style="--c0:'+B.c[0]+';--c1:'+B.c[1]+';--rc:'+DG_R[B.r].c+'"><small>ИЗ ЯЙЦА ПОЯВИЛСЯ…</small><div class="dghatch-a">'+dgMini(D)+'</div><h3>ДРАКОН!</h3><p class="dgbreed">Порода: <b>'+B.n+'</b> · <em>'+DG_BR_R[B.r]+'</em> (шанс '+String(DG_BR_P[B.r]).replace(".",",")+'%)</p>'+
   '<ul class="dghatch-l"><li>⚔️ Даёт силу в боях и завоевании</li><li>🎴 Подрастёт — будет каждый день приносить прокрутки</li><li>🛡 Бьёт кланового босса вместе с тобой</li><li>👑 Одень его в снаряжение — и попади в топ драконов</li></ul>'+
   '<input type="text" id="dgn-i" maxlength="'+DG.nameMax+'" placeholder="Дай ему имя"><button type="button" class="craftbtn" id="dgn-ok">Назвать</button></div>';
  $("dgn-ok").onclick=async()=>{const v=$("dgn-i").value.trim();if(v.length<2){toast("Имя — хотя бы 2 буквы");return}const r=await act("dg_name",{name:v});if(!r)return;closeModal();dgKey="";renderAll();toast("🐉 "+r.name+" ждёт ласки и еды!")}}
/* ---------- события: новый уровень, бой, покупки ---------- */
function dgLvUp(e){if(e.stage){const T=DG_STAGE[e.stage];setTimeout(()=>{try{sfx.fanfare()}catch(x){}toast("🐉 Дракон вырос: теперь он «"+T.n+"»!"+(T.gift?" Каждый день приносит "+T.gift+" 🎴":""))},400)}else setTimeout(()=>toast("🐉 Дракон достиг "+e.lv+" уровня!"),300)}
{const _act=act;act=async function(n,p){const r=await _act(n,p);try{if(r&&r.events)r.events.forEach(e=>{if(e.t==="dglv")dgLvUp(e)});
  if(r&&n==="duel"&&r.dg)setTimeout(()=>toast("🐉 Дракон рад победе: +"+r.dg.xp+" опыта, +"+r.dg.sh+" чешуи"),2600);
  if(r&&n==="conq_fight"&&r.reward&&r.reward.dgxp)setTimeout(()=>toast("🐉 +"+r.reward.dgxp+" опыта и +"+r.reward.dgsh+" чешуи дракону"),2600)}catch(x){}return r}}
{const _ps=payShow;payShow=function(r){if(r&&r.status==="done"&&r.item==="dg"){renderAll();const R=r.res||{};if(R.item){dgKey="";dgReveal(R.item,DG_CHEST[R.k]?DG_CHEST[R.k].n:"Сокровище",R.k)}else if(R.k==="apple"){sfx.coin();toast("🍏 Золотые яблоки у дракона: "+R.ap+" шт.")}else if(R.k==="reborn"){dgKey="";sfx.fanfare();burst(3);toast("🔮 Дракон переродился: "+DG_BREED[R.b].n.toLowerCase()+" ("+DG_BR_R[DG_BREED[R.b].r].toLowerCase()+")!");renderAll()}return}return _ps(r)}}
CHEST_COL.dg_nest=["#c9e86b","#3a5a14","#8fd03a"];CHEST_COL.dg_royal=["#ffd27a","#7a2a08","#ff9f0a"];CHEST_COL.dg_star=["#b9a2ff","#2a1a6a","#7a5aff"];CHEST_COL.dg_div=["#ffb0c8","#8a0a3a","#ff2e63"];
{const _ra=renderAll;renderAll=function(){_ra.apply(this,arguments);try{renderDragon()}catch(e){console.error(e)}}}
setInterval(()=>{try{const D=dgOf();if(D&&!$("sec-dragon").hidden&&$("dg-stage"))dgUpd(D);dgNav()}catch(e){}},15000);
/* моргание: раз в несколько секунд, без постоянной анимации */
setInterval(()=>{const e=document.querySelector("#dg-stage .dghd");if(!e||document.hidden)return;e.classList.add("blink");setTimeout(()=>e.classList.remove("blink"),180)},4200);
try{dgNav()}catch(e){}
/* ссылка из бота: ?dragon=1 — сразу к яйцу или дракону */
{const q=new URLSearchParams(location.search);if(q.get("dragon")){const t=setInterval(()=>{if(!S)return;clearInterval(t);setTimeout(()=>{try{closeModal()}catch(e){}setTab("dragon")},700)},300)}}
/* ---------- казино: выпала вещь для дракона или яблоко ---------- */
{const _a2=act;act=async function(n,p){const r=await _a2(n,p);try{if(r&&r.dg&&/^cas_/.test(n)){const g=r.dg,dl=n==="cas_case"?4200:n==="cas_slot"?2600:900;
  setTimeout(()=>{try{sfx.fanfare()}catch(e){}hapN("success");if(g.item)toast("🐉 Удача в казино! Выпало "+DG_R[g.item.r].n.toLowerCase()+" «"+dgItemName(g.item)+"» — уже в сумке дракона");else if(g.ap)toast("🍏 Удача в казино! Золотое яблоко для дракона");else if(g.sh)toast("🐉 Выпала вещь для дракона, но сумка полная — +"+g.sh+" чешуи");dgKey=""},dl)}}catch(e){}return r}}
/* ---------- статистика (только админ): всё про дракона ---------- */
Object.assign(ITEM_N,{dg:"🐉 Дракон",twins:"♊ Сундук Близнецов",slots:"📦 Место для карточек"});
{const _ds=drawStatsX;drawStatsX=function(){_ds.apply(this,arguments);try{const R=stData&&stData.x,b=$("st-body");if(!R||!R.dg||!b)return;const g=R.dg,old=$("st-dg");if(old)old.remove();
  const tile=(v,l,sub)=>`<div class="stt"><b class="num">${v}</b><span>${l}</span>${sub?`<small>${sub}</small>`:""}</div>`,row=(a,i,v)=>`<div class="str"><span>${a}</span><i>${i}</i><b>${v}</b></div>`;
  const PN={star:"Звёздный сундук",div:"Божественный сундук",apple:"Золотые яблоки",reborn:"Перерождение"},A=g.act,an={dg_hatch:"🥚 Вылупили",dg_tap:"💜 Ласка (пачки касаний)",dg_feed:"🍖 Кормлений",dg_nest:"🪺 Гнездо",dg_gift:"🎴 Дар прокруток",dg_open:"🎁 Сундуков за чешую",dg_equip:"🛡 Надели/сняли",dg_up:"⬆️ Улучшений",dg_dis:"♻️ Разборов",dg_name:"✏️ Имён"};
  const ps=(g.pay||[]).reduce((a,x)=>a+x.s,0);
  const el=document.createElement("div");el.id="st-dg";el.className="stx";
  el.innerHTML=`<h4>🐉 Дракон</h4><div class="stgrid">
   ${tile(fmtN(g.n),"драконов вылупилось","сегодня "+g.today+" · за 7 дней "+g.week)}
   ${tile(fmtN(g.egg.ready),"яиц готовы, но не разбиты","3+ живых друга: "+g.egg.f3+" · 2 друга: "+g.egg.f2+" · 1 друг: "+g.egg.f1)}
   ${tile(g.n?(g.lv/g.n).toFixed(1):"0","средний уровень","максимум "+g.maxLv+" · средняя мощь "+fmtN(g.n?g.pow/g.n:0)+" · рекорд "+fmtN(g.maxPow))}
   ${tile(fmtN(ps)+" ⭐","потрачено на дракона",(g.pay||[]).map(x=>(PN[x.k]||x.k)+": "+x.n+" шт. / "+fmtN(x.s)+" ⭐"+(x.t?" (сегодня "+x.t+")":"")).join(" · ")||"покупок пока нет")}
   ${tile(fmtN(g.hungry),"голодных сейчас","с именем: "+g.named+" из "+g.n)}
   ${tile(fmtN(g.casG+g.casA),"выпало в казино","вещей "+g.casG+" · яблок "+g.casA)}
   ${tile(fmtN(g.items.reduce((a,b)=>a+b,0)),"вещей у драконов","надето "+g.eq+" · улучшений +"+g.up+" · из казино "+g.casItems)}
   ${tile(fmtN(g.set5),"полных комплектов 5/5","3–4 из комплекта: "+g.set3)}
   ${tile(fmtN(g.sh)+" "+DG_SCI,"чешуи на руках","яблок на руках "+g.ap)}</div>
   <div class="stl"><b>Породы</b>${DG_BREED.map((B,i)=>row(B.n,DG_BR_R[B.r].toLowerCase(),g.br[i]||0)).join("")}</div>
   <div class="stl"><b>Стадии</b>${DG_STAGE.map((T,i)=>row(T.n,"с "+T.lv+" ур.",g.stg[i]||0)).join("")}</div>
   <div class="stl"><b>Снаряжение по редкости</b>${DG_R.map((Rr,i)=>row(Rr.n,"",g.items[i]||0)).join("")}</div>
   <div class="stl"><b>Действия: сегодня / 7 дней</b>${Object.keys(an).map(k=>row(an[k],"за 7 дней "+((A[k]||{}).w||0),(A[k]||{}).t||0)).join("")}</div>
   <div class="stl"><b>Топ драконов</b>${(g.top||[]).map((t,i)=>row((i+1)+". "+escH(t.name),escH(t.dn||DG_BREED[t.b].n)+" · ур. "+t.lv,fmtN(t.pow))).join("")||"<p class=cln>Пока нет</p>"}</div>
   <h4>🃏 Новые карточки и место</h4><div class="stgrid">
   ${tile(fmtN(g.newCards),"героев древности в игре","Ахиллес, Леонид и другие")}
   ${tile(g.twins+" / 16","Близнецов разобрано","карточек по 2 на мир")}
   ${tile(fmtN((g.caps&&g.caps.c)||0),"расширили место за монеты","куплено +10 за ⭐: "+((g.caps&&g.caps.s)||0)+" раз")}</div>`;
  b.appendChild(el)}catch(e){console.error(e)}}}
/* чешуя в шапке рядом с монетами и рунами — у кого есть дракон */
function dgCash(){const w=$("cash-sw");if(!w||!S)return;const D=dgOf();w.hidden=!D;if(D){$("cash-s").textContent=fmtK(D.sh||0);w.title="Чешуя дракона: "+fmtN(D.sh||0)}}
{const _uc=updCash;updCash=function(){_uc.apply(this,arguments);try{dgCash()}catch(e){}}}
$("cash-sw").onclick=e=>{e.stopPropagation();dgSub="chest";dgKey="";setTab("dragon")};
try{dgCash()}catch(e){}
