/* ⚔️ Рыцарь — клиент (этап 1): вкладка вместо «Дракона», кузня, арсенал, топ. Дракон — подвкладка. */
(function(){
'use strict';
if(window.__KN_UI__)return;window.__KN_UI__=1;
const O="#0d1020";
const KSETS={
 samurai:{p:{a:"#2a2a30",ad:"#121216",al:"#6a6a78",t:"#c8102e",td:"#6a0814",c:"#8a1018",cd:"#3a0408",pl:"#ffd60a",gem:"#ffd60a",bl:"#eef0f4",fur:"#c8102e",furd:"#6a0814"},v:{helm:"horns",shoulders:"plates",chest:"lamellar",legs:"strap",boots:"plain",weapon:"royal"}},
 legion:{p:{a:"#c8873a",ad:"#7a4a18",al:"#ffe0a8",t:"#c8102e",td:"#6a0814",c:"#a81a24",cd:"#4a0a0e",pl:"#d8202e",gem:"#ffd60a",bl:"#e8e8ee"},v:{helm:"crest",shoulders:"plates",chest:"sun",legs:"strap",boots:"plain",weapon:"broad"}},
 bogatyr:{p:{a:"#c0c6d0",ad:"#5a6070",al:"#ffffff",t:"#ffc21a",td:"#8a5a00",c:"#a81a24",cd:"#4a0a0e",pl:"#ffc21a",gem:"#e0102a",bl:"#f0f2f6"},v:{helm:"spikes",shoulders:"plates",chest:"scales",legs:"fan",boots:"plain",weapon:"broad"}},
 pharaoh:{p:{a:"#ffc400",ad:"#9a5e00",al:"#fff0a0",t:"#2a6bff",td:"#16256a",c:"#16256a",cd:"#0a1236",pl:"#2a6bff",gem:"#2ee6ff",bl:"#fff8e0"},v:{helm:"crown",shoulders:"royal",chest:"sun",legs:"gem",boots:"point",weapon:"flamb"}},
 bronze:{p:{a:"#c8873a",ad:"#7a4a18",al:"#ffd9a0",t:"#6a7a3a",td:"#3a4a18",c:"#4a5a2a",cd:"#26300f",pl:"#c8873a",gem:"#e0a040",bl:"#e8e0d0"},v:{helm:"crest",shoulders:"plates",chest:"cross",legs:"fan",boots:"plain",weapon:"sword"}},
 iron:{p:{a:"#8a929e",ad:"#4a525e",al:"#d0d6e0",t:"#7a5434",td:"#3a2414",c:"#3a3a44",cd:"#1a1a22",pl:"#5a6070",gem:"#c0c8d4",bl:"#e4e8ee"},v:{helm:"plume",shoulders:"spike1",chest:"cross",legs:"strap",boots:"plain",weapon:"broad"}},
 moon:{p:{a:"#cfe6e2",ad:"#6a8a88",al:"#ffffff",t:"#5affd8",td:"#1a7a6a",c:"#0a3a4a",cd:"#041a22",pl:"#e8fff8",gem:"#5affd8",bl:"#f0fffc"},v:{helm:"fin",shoulders:"plates",chest:"sun",legs:"fan",boots:"plain",weapon:"sword"}},
 sapph:{p:{a:"#3a63e8",ad:"#16256a",al:"#9fc0ff",t:"#c8dcff",td:"#6a86b8",c:"#16256a",cd:"#0a1236",pl:"#3a8aff",gem:"#9fe0ff",bl:"#e8f2ff"},v:{helm:"plume",shoulders:"spike1",chest:"cross",legs:"gem",boots:"plain",weapon:"sword"}},
 ruby:{p:{a:"#d0142f",ad:"#7a0716",al:"#ff9aa8",t:"#ffd60a",td:"#8a5a00",c:"#4a0505",cd:"#200202",pl:"#ffd60a",gem:"#ffd60a",bl:"#ffe8ee"},v:{helm:"spikes",shoulders:"spikes",chest:"sun",legs:"spike",boots:"point",weapon:"flamb"}},
 frost:{p:{a:"#8fc8f0",ad:"#2a4a7a",al:"#ffffff",t:"#ffffff",td:"#5a8ab0",c:"#0a2a4a",cd:"#041428",pl:"#e8f8ff",gem:"#bfefff",bl:"#f0faff"},v:{helm:"fin",shoulders:"plates",chest:"scales",legs:"scale",boots:"claw",weapon:"broad"}},
 gold:{n:"Золотой лев",r:"Легендарный",p:{a:"#f2b81e",ad:"#b5760a",al:"#fff0a0",t:"#3a6ae8",td:"#1a3290",c:"#2a48c8",cd:"#14246e",pl:"#e0202e",gem:"#3a8aff",bl:"#e8eef8"},
  v:{helm:"plume",shoulders:"spike1",chest:"sun",legs:"gem",boots:"plain",weapon:"sword"}},
 steel:{n:"Стальной страж",r:"Редкий",p:{a:"#c8d2e2",ad:"#7a8aa6",al:"#ffffff",t:"#d4a020",td:"#8a5a00",c:"#b81e2e",cd:"#6a0a14",pl:"#d8202e",gem:"#e0202e",bl:"#eef2f8"},
  v:{helm:"crest",shoulders:"plates",chest:"cross",legs:"fan",boots:"plain",weapon:"broad"}},
 obsid:{n:"Обсидиан",r:"Мифический",p:{a:"#4a3e6a",ad:"#241c3a",al:"#9a8ac8",t:"#d04ae8",td:"#6a1a8a",c:"#3a1460",cd:"#1a0830",pl:"#c040e8",gem:"#ff5af0",bl:"#2a2236"},
  v:{helm:"spikes",shoulders:"spikes",chest:"rune",legs:"spike",boots:"spike",weapon:"dark"}},
 emer:{n:"Изумрудный дракон",r:"Эпический",p:{a:"#2fb06a",ad:"#126a3a",al:"#a8ffcc",t:"#ffd02a",td:"#8a6a00",c:"#0e5a34",cd:"#06301a",pl:"#ffd02a",gem:"#ffd02a",bl:"#d8ffe8"},
  v:{helm:"fin",shoulders:"dragon",chest:"scales",legs:"scale",boots:"claw",weapon:"flamb"}},
 viking:{n:"Варяг",r:"Эпический",p:{a:"#9aa0ac",ad:"#5a606c",al:"#e0e6f0",t:"#8a5a2a",td:"#4a2c10",c:"#7a1a12",cd:"#3a0a06",pl:"#e8dcc0",gem:"#4ab0ff",bl:"#d8dde6",fur:"#c8a878",furd:"#7a5a30"},
  v:{helm:"horns",shoulders:"fur",chest:"lamellar",legs:"strap",boots:"fur",weapon:"axe"}},
 imper:{n:"Император",r:"Мифический",p:{a:"#2a2620",ad:"#12100c",al:"#7a705a",t:"#ffc21a",td:"#9a6a00",c:"#8a1018",cd:"#3a0408",pl:"#ffc21a",gem:"#e0102a",bl:"#1a1814"},
  v:{helm:"crown",shoulders:"royal",chest:"crown",legs:"gem",boots:"point",weapon:"royal"}}
};
const KSLOTS=[["helm","Шлем"],["shoulders","Наплечники"],["chest","Нагрудник"],["legs","Ноги"],["boots","Сапоги"],["weapon","Оружие"]];


function knDraw(eq,opt){opt=opt||{};const u=opt.u||"k";
 const S=k=>KSETS[eq[k]],P=k=>S(k).p,V=k=>S(k).v[k];
 const H=P("helm"),SH=P("shoulders"),C=P("chest"),L=P("legs"),B=P("boots"),W=P("weapon");
 const f=(c,w)=>`fill="${c}" stroke="${O}" stroke-width="${w||5}"`;
 const st=(c,w)=>`fill="none" stroke="${c}" stroke-width="${w||4}"`;
 let o=`<svg xmlns="http://www.w3.org/2000/svg"${opt.vb?"":` viewBox="0 0 420 640"`} width="${opt.w||"100%"}"${opt.vb?` viewBox="${opt.vb}"`:""} style="display:block">${opt.bg?knBG(u):""}${opt.back||""}<defs><clipPath id="ct${u}"><path d="M150 186 C172 170 248 170 270 186 L262 270 C258 300 240 318 210 320 C180 318 162 300 158 270 Z"/></clipPath><clipPath id="cs${u}"><path d="M170 180 C120 168 88 196 90 236 C92 266 118 278 150 266 L174 214 Z"/></clipPath><clipPath id="cl${u}"><path d="M158 484 L200 484 L194 562 L148 562 Z M220 484 L262 484 L272 562 L226 562 Z"/></clipPath><clipPath id="cb${u}"><path d="${eq.weapon&&KSETS[eq.weapon].v.weapon==="axe"?"M210 540 C186 526 160 528 150 540 C146 560 152 582 164 596 C176 584 194 580 210 582Z M210 540 C234 526 260 528 270 540 C274 560 268 582 256 596 C244 584 226 580 210 582Z":"M193 372 L227 372 L224 592 L210 610 L196 592 Z"}"/></clipPath></defs><g stroke-linejoin="round" stroke-linecap="round"${opt.kt?` transform="${opt.kt}"`:""}>`;
 o+=`<ellipse cx="210" cy="598" rx="170" ry="26" fill="#000" opacity=".45"/>`;
 /* ---- плащ (сет нагрудника) ---- */
 o+=`<path d="M140 200 C100 300 78 440 66 586 C120 600 170 590 210 578 C250 590 300 600 354 586 C342 440 320 300 280 200 Z" ${f(C.c)}/>`;
 o+=`<path d="M116 300 C104 400 96 500 92 584 C110 590 124 590 136 588 C132 500 134 400 142 300 Z M304 300 C316 400 324 500 328 584 C310 590 296 590 284 588 C288 500 286 400 278 300 Z" fill="${C.cd}"/>`;
 if(V("chest")==="lamellar") o+=`<path d="M70 580 C122 594 170 584 210 572 C250 584 298 594 350 580" ${st(C.fur,12)}/><path d="M70 580 C122 594 170 584 210 572 C250 584 298 594 350 580" ${st(C.furd,3)} stroke-dasharray="2 7"/>`;
 else o+=`<path d="M70 580 C122 594 170 584 210 572 C250 584 298 594 350 580" ${st(V("chest")==="crown"?C.t:C.a,6)}/>`;
 /* ---- щит за спиной (сет нагрудника) ---- */
 const vc=V("chest");
 o+=`<g transform="rotate(-12 120 330)">`;
 if(vc==="lamellar") o+=`<circle cx="120" cy="318" r="66" ${f(C.t)}/><circle cx="120" cy="318" r="66" ${st(C.ad,6)}/><path d="M120 252 V384 M54 318 H186" ${st(C.td,5)}/><circle cx="120" cy="318" r="14" ${f(C.a,3)}/>`;
 else{o+=`<path d="M62 250 C92 236 148 236 178 250 C180 330 158 392 120 430 C82 392 60 330 62 250 Z" ${f(vc==="rune"||vc==="crown"?C.ad:C.t)}/><path d="M62 250 C92 236 148 236 178 250 C180 330 158 392 120 430 C82 392 60 330 62 250 Z" ${st(vc==="crown"?C.t:C.a,7)}/><path d="M122 244 C150 244 168 248 178 252 C180 330 158 392 120 430 Z" fill="#000" opacity=".22"/>`;
  o+= vc==="cross"?`<path d="M112 270 H128 V306 H156 V322 H128 V380 H112 V322 H84 V306 H112Z" ${f(C.t,2.5)}/>`:
      vc==="rune"?`<path d="M120 276 L148 340 L92 340Z M120 300 V330" ${st(C.gem,4)}/>`:
      vc==="scales"?`<path d="M100 300 C110 280 130 280 140 300 C130 296 124 310 120 330 C116 310 110 296 100 300Z" ${f(C.t,2.5)}/>`:
      vc==="crown"?`<path d="M94 316 L100 290 L110 306 L120 284 L130 306 L140 290 L146 316Z" ${f(C.t,2.5)}/><circle cx="120" cy="330" r="7" ${f(C.gem,2.5)}/>`:
      `<path d="M120 282 L128 300 L148 302 L132 314 L138 334 L120 322 L102 334 L108 314 L92 302 L112 300 Z" ${f(C.a,2.5)}/>`;}
 o+=`</g>`;
 /* ---- ноги ---- */
 const vl=V("legs");
 o+=`<path d="M164 362 L204 362 L200 452 L160 452 Z M216 362 L256 362 L260 452 L220 452 Z" ${f(L.a)}/>`;
 o+=`<path d="M188 366 L203 366 L199 450 L184 450 Z M240 366 L255 366 L259 450 L244 450 Z" fill="${L.ad}"/><path d="M170 372 L168 444 M222 372 L224 444" ${st(L.al)}/>`;
 if(vl==="strap") o+=`<path d="M162 386 L202 392 M162 412 L201 418 M218 392 L258 386 M219 418 L259 412" ${st(L.td||"#4a2c10",5)}/>`;
 if(vl==="scale") o+=`<g ${st(L.ad,2.5)}>${[380,398,416,434].map(y=>`<path d="M164 ${y} q6 8 12 0 q6 8 12 0 q6 8 12 0 M220 ${y} q6 8 12 0 q6 8 12 0 q6 8 12 0"/>`).join("")}</g>`;
 const knee=(x,m)=>{let s=`<path d="M${x-27} 468 C${x-33} 448 ${x-17} 436 ${x+1} 436 C${x+21} 436 ${x+33} 450 ${x+27} 470 C${x+21} 488 ${x-21} 488 ${x-27} 468 Z" ${f(L.a)}/>`;
  if(vl==="spike") s+=`<path d="M${x-6} 444 L${x} 414 L${x+6} 444Z" ${f(L.al,3)}/><path d="M${x+m*24} 460 L${x+m*48} 450 L${x+m*26} 474Z" ${f(L.a,3.5)}/>`;
  else s+=`<path d="M${x+m*27} 462 L${x+m*43} 452 L${x+m*37} 480 Z" ${f(L.a,4)}/>`;
  if(vl==="gem"||vl==="spike") s+=`<circle cx="${x}" cy="462" r="8" ${f(L.gem,3)}/>`;
  else if(vl==="fan") s+=`<path d="M${x-14} 456 L${x+14} 456 M${x-16} 466 L${x+16} 466" ${st(O,2.5)}/><circle cx="${x}" cy="446" r="3.5" ${f(L.t,1.5)}/>`;
  else if(vl==="scale") s+=`<path d="M${x-10} 470 q10 -22 20 0 q-10 -6 -20 0" ${f(L.t,2.5)}/>`;
  else s+=`<circle cx="${x}" cy="462" r="6" ${f(L.ad,2.5)}/>`;
  return s+`<path d="M${x-19} 452 C${x-13} 444 ${x-3} 442 ${x+7} 444" ${st(L.al,3.5)}/>`};
 o+=knee(179,-1)+knee(241,1);
 o+=`<path d="M158 484 L200 484 L194 562 L148 562 Z M220 484 L262 484 L272 562 L226 562 Z" ${f(L.a)}/><path d="M182 488 L199 488 L193 558 L176 558 Z M244 488 L261 488 L270 558 L252 558 Z" fill="${L.ad}"/><path d="M162 494 L156 552 M226 494 L232 552" ${st(L.al)}/>`;
  o+= vl==="strap"?`<path d="M156 504 L198 510 M154 530 L196 536 M222 510 L264 504 M224 536 L268 530" ${st(L.td||"#4a2c10",5)}/>`:`<path d="M156 510 L198 510 M222 510 L264 510" ${st(L.t)}/>`;
 if(vl==="spike") o+=`<path d="M152 520 L134 512 L150 534Z M268 520 L286 512 L270 534Z" ${f(L.a,3.5)}/>`;
 /* ---- сапоги ---- */
 const vb=V("boots");
 if(vb==="point") o+=`<path d="M146 558 L196 558 L200 592 L104 594 C96 590 116 572 146 558 Z M224 558 L274 558 C304 572 324 590 316 594 L220 592 Z" ${f(B.a)}/>`;
 else o+=`<path d="M146 558 L196 558 L200 592 L120 596 C114 588 124 568 146 558 Z M224 558 L274 558 C296 568 306 588 300 596 L220 592 Z" ${f(B.a)}/>`;
 o+=`<path d="M132 574 L198 574 M222 574 L288 574" ${st(O,3)}/><path d="M124 590 L198 588 M222 588 L296 590" ${st(B.ad)}/><path d="M138 568 C144 562 154 560 164 560" ${st(B.al,3)}/>`;
 if(vb==="spike") o+=`<path d="M126 584 L104 586 L124 574Z M294 584 L316 586 L296 574Z M170 558 L174 540 L180 558Z M240 558 L246 540 L250 558Z" ${f(B.al,3)}/>`;
 if(vb==="claw") o+=`<path d="M122 590 C110 590 104 584 106 576 C112 584 118 584 124 582Z M298 590 C310 590 316 584 314 576 C308 584 302 584 296 582Z" ${f(B.t,3)}/>`;
 if(vb==="fur") o+=`<path d="M142 560 q6 -10 12 0 q6 -10 12 0 q6 -10 12 0 q6 -10 12 0 q6 -10 8 0 L198 568 L142 568Z M222 560 q6 -10 12 0 q6 -10 12 0 q6 -10 12 0 q6 -10 12 0 q6 -10 8 0 L278 568 L222 568Z" ${f(B.fur,3)}/>`;
 if(vb==="point") o+=`<path d="M104 594 L134 586 M316 594 L286 586" ${st(B.t,3)}/>`;
 /* ---- кольчуга и фальды (нагрудник) ---- */
 o+=`<path d="M160 350 L260 350 L260 392 L252 400 L244 392 L236 400 L228 392 L220 400 L212 392 L204 400 L196 392 L188 400 L180 392 L172 400 L164 392 L160 396 Z" ${f("#5a6478",4)}/><path d="M164 360 L256 360 M164 370 L256 370 M164 380 L256 380 M164 390 L256 390" stroke="#2a3040" stroke-width="2" stroke-dasharray="3 3"/>`;
 if(vc==="lamellar") o+=`<path d="M156 316 L264 316 L270 386 C236 396 184 396 150 386 Z" ${f(C.td||C.ad)}/>${[330,346,362,378].map(y=>`<path d="M154 ${y} H266" ${st(O,2.5)}/>`).join("")}<path d="M170 316 V388 M190 316 V392 M210 316 V394 M230 316 V392 M250 316 V388" stroke="${O}" stroke-width="1.6" opacity=".5"/>`;
 else{o+=`<path d="M160 316 L260 316 L266 352 C236 362 184 362 154 352 Z" ${f(C.a)}/><path d="M156 340 C186 350 234 350 264 340" ${st(O,3)}/>`;
  o+=`<path d="M152 346 L204 352 L200 386 L158 380 Z M268 346 L216 352 L220 386 L262 380 Z" ${f(C.a)}/><path d="M158 380 L200 386 M262 380 L220 386" ${st(C.t)}/><path d="M180 352 L202 354 L200 384 L182 382 Z M240 352 L218 354 L220 384 L238 382 Z" fill="${C.ad}"/>`;}
 /* ---- оружие: нижняя часть ---- */
 const vw=V("weapon");
 if(vw==="axe"){o+=`<rect x="204" y="330" width="12" height="236" rx="4" ${f("#6a4220",4)}/><path d="M206 360 L214 360 M206 400 L214 400 M206 440 L214 440" ${st("#3a2410",2)}/>`;
  o+=`<path d="M210 540 C186 526 160 528 150 540 C146 560 152 582 164 596 C176 584 194 580 210 582Z M210 540 C234 526 260 528 270 540 C274 560 268 582 256 596 C244 584 226 580 210 582Z" ${f(W.a,4.5)}/><path d="M154 546 C150 562 156 580 164 590 M266 546 C270 562 264 580 256 590" ${st(W.al,3.5)}/><rect x="200" y="534" width="20" height="54" rx="4" ${f(W.ad,4)}/><circle cx="210" cy="560" r="5" ${f(W.gem,2.5)}/>`;}
 else if(vw==="flamb"){let l="M200 372",r="";for(let y=380;y<=588;y+=13){const d=((y-380)/13)%2?5:-3;l+=` L${200+d} ${y}`;r=` L${220-d} ${y}`+r}
  o+=`<path d="${l} L210 606 ${r.replace(/^ L/," L")} L220 372 Z" ${f(W.bl,4.5)}/><path d="M210 380 L210 596" ${st(W.ad,3)}/><path d="M205 384 L206 588" ${st("#fff",2)}/>`;}
 else if(vw==="dark"){o+=`<path d="M198 372 L222 372 L218 590 L210 608 L202 590 Z" ${f(W.bl,4.5)}/>`;
  for(let y=410;y<=560;y+=40)o+=`<path d="M199 ${y} L186 ${y-10} L200 ${y+12}Z M221 ${y+18} L234 ${y+8} L220 ${y+30}Z" ${f(W.ad,3)}/>`;
  o+=`<path d="M210 380 L210 590" stroke="${W.gem}" stroke-width="3"><animate attributeName="opacity" values=".4;1;.4" dur="2s" repeatCount="indefinite"/></path>`;}
 else if(vw==="broad"){o+=`<path d="M194 372 L226 372 L222 586 L210 606 L198 586 Z" ${f(W.bl,4.5)}/><path d="M210 380 L210 570" ${st(W.ad,5)}/><path d="M200 380 L202 584" ${st("#fff",2.5)}/>`;}
 else if(vw==="royal"){o+=`<path d="M199 372 L221 372 L217 592 L210 608 L203 592 Z" ${f(W.bl,4.5)}/><path d="M201 376 L205 592 M219 376 L215 592" ${st(W.t,3)}/><path d="M210 390 L210 580" ${st(W.gem,2)} stroke-dasharray="1 12"/>`;}
 else{o+=`<path d="M200 372 L220 372 L216 592 L210 606 L204 592 Z" ${f(W.bl,4.5)}/><path d="M210 378 L210 596" stroke="#8a9ab8" stroke-width="3"/><path d="M204 380 L206 590" ${st("#fff",2.5)}/>`;}
 /* ---- торс ---- */
 o+=`<path d="M150 186 C172 170 248 170 270 186 L262 270 C258 300 240 318 210 320 C180 318 162 300 158 270 Z" ${f(vc==="lamellar"?C.ad:C.a)}/>`;
 if(vc==="lamellar"){for(let y=196;y<=300;y+=14)o+=`<path d="M156 ${y} H264" ${st(O,2)} opacity=".6"/>`;for(let x=168;x<=252;x+=12)o+=`<path d="M${x} 186 V312" stroke="${O}" stroke-width="1.2" opacity=".35"/>`;
  o+=`<path d="M176 176 L244 300 M244 176 L176 300" ${st(C.td,9)}/><circle cx="210" cy="238" r="16" ${f(C.a,3.5)}/><path d="M202 230 L218 246 M218 230 L202 246" ${st(C.td,3)}/>`;}
 else{o+=`<path d="M236 178 C254 180 266 183 270 186 L262 270 C258 300 240 318 212 320 C236 300 248 260 236 178Z" fill="${C.ad}"/><path d="M162 196 C168 186 182 180 196 179" ${st(C.al,5)}/>`;
  if(vc==="sun"){o+=`<g>${Array.from({length:12},(_,i)=>{const a=i*Math.PI/6,r1=i%2?24:34;return `<path d="M${210+14*Math.cos(a-.25)} ${236+14*Math.sin(a-.25)} L${210+r1*Math.cos(a)} ${236+r1*Math.sin(a)} L${210+14*Math.cos(a+.25)} ${236+14*Math.sin(a+.25)}Z" ${f(C.t,2.5)}/>`}).join("")}</g><circle cx="210" cy="236" r="16" ${f(C.al,3)}/><circle cx="210" cy="236" r="7" ${f(C.gem,2.5)}/>`;}
  else if(vc==="cross"){o+=`<path d="M210 186 V314" ${st(O,2.5)} opacity=".4"/><path d="M200 200 H220 V226 H246 V246 H220 V292 H200 V246 H174 V226 H200Z" ${f(C.t,3)}/><circle cx="210" cy="236" r="6" ${f(C.gem,2.5)}/>`;}
  else if(vc==="rune"){o+=`<path d="M180 196 L210 186 L240 196 L232 280 L210 300 L188 280Z" ${f(C.ad,3)}/><g ${st(C.gem,3.5)}><path d="M210 206 L232 256 L188 256Z"/><circle cx="210" cy="240" r="7"/><path d="M210 264 V290 M198 276 H222"/><animate attributeName="opacity" values=".5;1;.5" dur="2.4s" repeatCount="indefinite"/></g>`;}
  else if(vc==="scales"){o+=`<g ${st(C.ad,2.5)}>${[200,216,232,248,264,280].map((y,j)=>{let s="";for(let x=168+(j%2?8:0);x<252;x+=16)s+=`<path d="M${x} ${y} q8 10 16 0"/>`;return s}).join("")}</g><path d="M196 226 L210 210 L224 226 L218 254 L210 262 L202 254Z" ${f(C.t,3)}/><circle cx="210" cy="236" r="6" ${f(C.gem,2)}/>`;}
  else if(vc==="crown"){o+=`<path d="M176 190 C190 200 230 200 244 190 L240 286 C232 300 188 300 180 286Z" ${st(C.t,3)}/><path d="M184 246 L190 216 L200 234 L210 206 L220 234 L230 216 L236 246Z" ${f(C.t,3)}/><path d="M182 248 H238 V258 H182Z" ${f(C.td,3)}/><circle cx="210" cy="276" r="10" ${f(C.gem,3)}/><circle cx="207" cy="273" r="3" fill="#fff" opacity=".7"/>`;}
 }
 o+=`<path d="M158 296 L262 296 L262 318 L158 318 Z" ${f("#4a2c18",4.5)}/><rect x="196" y="292" width="28" height="30" rx="5" ${f(C.a==="#2a2620"?C.t:C.a,4)}/><circle cx="210" cy="307" r="6" ${f(C.gem,2.5)}/>`;
 /* ---- руки (наплечники) ---- */
 const A=SH;
 o+=`<path d="M126 236 C112 262 112 290 120 308 L146 302 C142 284 144 262 152 244 Z M294 236 C308 262 308 290 300 308 L274 302 C278 284 276 262 268 244 Z" ${f(A.ad)}/>`;
 o+=`<circle cx="130" cy="304" r="17" ${f(A.a)}/><circle cx="290" cy="304" r="17" ${f(A.a)}/><path d="M118 312 L104 324 L126 322 Z M302 312 L316 324 L294 322 Z" ${f(A.a,3.5)}/>`;
 o+=`<path d="M126 312 C140 330 164 342 186 344 L192 322 C170 320 152 310 142 296 Z M294 312 C280 330 256 342 234 344 L228 322 C250 320 268 310 278 296 Z" ${f(A.a)}/><path d="M136 318 C150 330 166 336 182 338 M284 318 C270 330 254 336 238 338" ${st(A.t,3.5)}/>`;
 /* ---- рукоять ---- */
 if(vw==="axe") o+=`<circle cx="210" cy="322" r="10" ${f(W.a,4)}/>`;
 else{const g=vw==="royal"?`<path d="M210 366 C190 362 168 352 150 334 C160 358 178 372 210 374 C242 372 260 358 270 334 C252 352 230 362 210 366Z" ${f(W.t,4)}/>`:
  vw==="dark"?`<path d="M160 366 L180 358 L210 362 L240 358 L260 366 L240 374 L210 370 L180 374Z M160 366 L144 352 M260 366 L276 352" ${f(W.ad,4)}/>`:
  vw==="flamb"?`<path d="M164 360 C180 352 196 362 210 362 C224 362 240 352 256 360 C246 374 226 372 210 370 C194 372 174 374 164 360Z" ${f(W.t,4)}/><circle cx="164" cy="358" r="6" ${f(W.t,3)}/><circle cx="256" cy="358" r="6" ${f(W.t,3)}/>`:
  vw==="broad"?`<rect x="168" y="360" width="84" height="14" rx="3" ${f(W.t,4)}/>`:
  `<path d="M156 366 C176 356 244 356 264 366 C244 378 176 378 156 366 Z" ${f(W.t==="#3a6ae8"?W.a:W.t,4.5)}/><circle cx="156" cy="366" r="7" ${f(W.a,3.5)}/><circle cx="264" cy="366" r="7" ${f(W.a,3.5)}/>`;
  o+=g+`<circle cx="210" cy="367" r="6.5" ${f(W.gem,3)}/><rect x="203" y="322" width="14" height="40" rx="3" ${f("#4a2c18",3.5)}/><circle cx="210" cy="318" r="11" ${f(vw==="royal"?W.t:W.a==="#4a3e6a"?W.ad:W.a,4)}/><circle cx="210" cy="318" r="4.5" fill="${W.gem}"/>`;}
 o+=`<path d="M182 330 C182 320 200 318 208 324 L208 352 C200 358 184 356 182 346 Z M238 330 C238 320 220 318 212 324 L212 352 C220 358 236 356 238 346 Z" ${f(A.a,4.5)}/><path d="M186 332 L206 332 M186 340 L206 340 M186 348 L204 348 M234 332 L214 332 M234 340 L214 340 M234 348 L216 348" ${st(O,2.2)}/>`;
 /* ---- наплечники ---- */
 const vs=V("shoulders");
 const pd=()=>{let s="";
  if(vs==="fur"){s+=`<path d="M176 176 C150 160 104 168 88 196 C80 214 86 238 96 252 C104 268 124 276 146 268 L176 220Z" ${f(A.fur)}/><path d="M92 246 q6 10 14 4 q4 12 14 6 q6 10 16 2 q8 8 14 -2" ${st(A.fur,8)}/><path d="M104 206 C116 190 136 184 156 186 M100 230 C114 220 132 218 150 222" ${st(A.furd,3)}/><path d="M112 204 l4 6 M128 196 l2 7 M140 206 l3 6 M118 232 l3 6" ${st(A.furd,2.5)}/>`;return s}
  s+=`<path d="M170 180 C120 168 88 196 90 236 C92 266 118 278 150 266 L174 214 Z" ${f(A.a)}/>`;
  if(vs==="royal"){s+=`<path d="M92 236 C82 250 80 270 88 288 C110 296 136 290 156 274 L150 262 C126 274 104 266 92 236Z" ${f(A.ad,4.5)}/><path d="M88 288 C110 296 136 290 156 274" ${st(A.t,4)}/><path d="M96 214 C110 196 140 186 168 190" ${st(A.t,5)}/><path d="M110 206 L106 186 L118 198 L124 180 L130 198 L142 186 L138 206" ${f(A.t,3)}/>`}
  else if(vs==="plates"){s+=`<path d="M92 246 C104 268 130 274 156 262 L152 276 C124 290 98 280 92 258 Z M94 262 C106 284 130 290 154 280 L150 294 C124 306 100 296 96 276Z" ${f(A.a,4.5)}/><path d="M94 258 C106 278 128 284 152 276 M98 276 C110 294 130 298 150 292" ${st(A.t,4)}/><g fill="${A.t}" stroke="${O}" stroke-width="1.5"><circle cx="108" cy="224" r="3.5"/><circle cx="126" cy="210" r="3.5"/><circle cx="146" cy="202" r="3.5"/></g>`}
  else{s+=`<path d="M92 246 C104 268 130 274 156 262 L152 276 C124 290 98 280 92 258 Z" ${f(A.a,4.5)}/><path d="M94 258 C106 278 128 284 152 276" ${st(A.t)}/><path d="M96 232 C108 250 134 254 160 242" ${st(A.t)}/>`;}
  s+=`<path d="M140 262 C118 268 98 258 92 242 C94 262 112 274 140 268 Z" fill="${A.ad}"/><path d="M102 212 C110 194 130 184 152 184" ${st(A.al,5)}/>`;
  if(vs==="spike1") s+=`<path d="M108 200 L92 168 L124 188 Z" ${f(A.a,4)}/><circle cx="124" cy="216" r="6" ${f(A.gem,2.5)}/>`;
  if(vs==="spikes") s+=`<path d="M100 214 L70 192 L106 196Z M118 196 L104 158 L132 184Z M142 188 L140 150 L160 182Z" ${f(A.al,4)}/><path d="M92 252 L66 262 L96 266Z" ${f(A.a,3.5)}/><circle cx="124" cy="224" r="6" ${f(A.gem,2.5)}/>`;
  if(vs==="dragon") s+=`<g ${st(A.ad,2.5)}><path d="M104 220 q8 10 16 0 q8 10 16 0 q8 10 16 0 M100 240 q8 10 16 0 q8 10 16 0 q8 10 16 0"/></g><path d="M100 206 C90 186 94 170 108 162 C106 176 112 186 122 192Z M130 190 C128 168 138 154 154 150 C146 166 148 178 154 188Z" ${f(A.t,3.5)}/><path d="M96 256 C84 262 76 274 78 286 C86 276 94 272 104 272Z" ${f(A.t,3)}/>`;
  return s};
 o+=`<g>${pd()}</g><g transform="translate(420 0) scale(-1 1)">${pd()}</g>`;
 /* ---- горжет (шлем) ---- */
 o+=`<path d="M168 164 C184 154 236 154 252 164 L256 188 C236 198 184 198 164 188 Z" ${f(H.a)}/><path d="M166 180 C186 190 234 190 254 180" ${st(H.t)}/>`;
 /* ---- шлем ---- */
 const vh=V("helm");
 if(vh==="plume") o+=`<path d="M214 66 C204 34 228 12 270 8 C254 24 256 40 246 52 C268 46 286 56 294 72 C272 70 258 78 252 90 C266 92 276 102 278 114 C258 104 236 96 222 92 Z" ${f(H.pl,4.5)}/><path d="M222 62 C228 44 244 30 262 22 M232 78 C250 70 268 68 284 72" ${st(O,2.2)} opacity=".4"/>`;
 if(vh==="crest") o+=`<path d="M168 84 C170 40 250 40 252 84 C240 70 180 70 168 84Z" ${f(H.pl,4.5)}/><path d="M180 70 L186 52 M196 62 L198 44 M212 60 L212 42 M226 62 L224 44 M240 70 L234 52" ${st(O,2)} opacity=".35"/>`;
 if(vh==="wings"||vh==="fin"){}
 o+=`<path d="M168 112 C168 64 252 64 252 112 L254 160 C240 174 180 174 166 160 Z" ${f(H.a)}/><path d="M212 66 C240 68 252 88 252 112 L254 160 C246 168 230 172 212 173 Z" fill="${H.ad}"/><path d="M176 104 C176 86 188 74 202 70" ${st(H.al,5)}/>`;
 if(vh==="horns") o+=`<path d="M170 100 C146 96 128 76 130 44 C142 64 156 74 176 78Z M250 100 C274 96 292 76 290 44 C278 64 264 74 244 78Z" ${f("#f0e4c8",4.5)}/><path d="M140 66 l8 -4 M136 54 l8 -2 M280 66 l-8 -4 M284 54 l-8 -2" ${st("#9a8a6a",2.5)}/><path d="M168 98 C188 86 232 86 252 98" ${st(H.t,6)}/>`;
 if(vh==="spikes") o+=`<path d="M180 78 L172 46 L192 70Z M196 70 L194 30 L208 66Z M212 68 L214 22 L226 66Z M228 70 L236 32 L240 74Z M244 78 L256 50 L252 84Z" ${f(H.al,3.5)}/><path d="M168 132 L148 124 L166 146Z M252 132 L272 124 L254 146Z" ${f(H.a,3.5)}/>`;
 if(vh==="fin") o+=`<path d="M196 70 C192 40 214 18 246 14 C236 30 240 46 232 58 C246 56 256 64 260 76 C244 74 232 80 226 90Z" ${f(H.t,4.5)}/><path d="M206 62 L226 30 M216 74 L246 56" ${st(H.td,2.5)}/><path d="M168 116 L146 100 L166 130Z M252 116 L274 100 L254 130Z" ${f(H.t,3.5)}/>`;
 if(vh==="crown") o+=`<path d="M172 86 L176 50 L192 70 L210 40 L228 70 L244 50 L248 86 Z" ${f(H.t,4.5)}/><circle cx="210" cy="58" r="6" ${f(H.gem,2.5)}/><circle cx="183" cy="70" r="4" ${f(H.gem,2)}/><circle cx="237" cy="70" r="4" ${f(H.gem,2)}/><circle cx="210" cy="40" r="4" ${f(H.t,2.5)}/>`;
 /* лицо */
 o+=`<path d="M184 108 L236 108 L238 150 C230 166 190 166 182 150 Z" ${f("#f0b88a",4)}/><path d="M228 110 L236 108 L238 150 C234 158 228 161 222 163 C228 150 230 130 228 110Z" fill="#c98a5e"/><ellipse cx="196" cy="140" rx="5" ry="3" fill="#ff9a8a" opacity=".5"/>`;
 o+=`<path d="M188 120 L204 125 M232 120 L216 125" stroke="#2a1608" stroke-width="5"/><path d="M191 130 C194 127 200 127 203 130 C200 133 194 133 191 130 Z M217 130 C220 127 226 127 229 130 C226 133 220 133 217 130 Z" fill="#fff" stroke="${O}" stroke-width="1.5"/><circle cx="198" cy="130" r="2.6" fill="${O}"/><circle cx="222" cy="130" r="2.6" fill="${O}"/>`;
 o+=`<path d="M210 130 L206 142 L212 143" ${st("#7a4a2a",2.5)}/><path d="M226 112 L232 136" stroke="#a0503a" stroke-width="2.5"/>`;
 const beard=vh==="horns"?"#c07a2a":"#7a4a1e";
 o+=`<path d="M182 140 C186 166 198 ${vh==="horns"?190:178} 210 ${vh==="horns"?190:178} C222 ${vh==="horns"?190:178} 234 166 238 140 C232 150 222 148 210 150 C198 148 188 150 182 140 Z" ${f(beard,3.5)}/><path d="M196 150 C202 146 218 146 224 150 C218 155 202 155 196 150 Z" fill="#4a2a10"/>`;
 if(vh==="horns") o+=`<path d="M204 176 L206 192 M216 176 L214 192" ${st("#7a4a1a",3)}/>`;
 o+=`<path d="M166 120 L184 118 L184 158 L168 160 Z" ${f(H.a,4)}/><path d="M254 120 L236 118 L236 158 L252 160 Z" ${f(H.ad,4)}/>`;
 /* забрало / налобник */
 if(vh==="horns") o+=`<path d="M204 92 L216 92 L216 126 L210 132 L204 126Z" ${f(H.a,3.5)}/>`;
 else if(vh==="crown") o+=`<path d="M170 94 C190 84 230 84 250 94 L252 110 C230 102 190 102 168 110 Z" ${f(H.ad,4)}/><path d="M168 110 C190 102 230 102 252 110" ${st(H.t,4)}/>`;
 else o+=`<path d="M170 92 C190 80 230 80 250 92 L252 112 C230 102 190 102 168 112 Z" ${f(H.a,4.5)}/><path d="M186 94 L202 92 M218 92 L234 94" ${st(O,3.5)}/><path d="M168 112 C190 102 230 102 252 112" ${st(H.t)}/>`;
 if(vh==="plume") o+=`<path d="M205 70 L215 70 L215 100 L205 100 Z" ${f(H.t,3)}/>`;
 /* блики */
 o+=`<g fill="#fff"><path d="M112 206 C116 196 124 190 132 188 C126 196 122 202 120 210Z" opacity=".7"/><path d="M168 200 C172 192 178 188 186 186 C180 194 176 198 174 204Z" opacity=".7"/><circle cx="170" cy="450" r="3.5" opacity=".9"/><circle cx="232" cy="450" r="3.5" opacity=".9"/><circle cx="180" cy="92" r="3" opacity=".8"/></g>`;
 if(opt.engr)o+=`<text x="0" y="0" transform="translate(214 560) rotate(-90)" font-family="Georgia,serif" font-style="italic" font-weight="700" font-size="13" fill="#ffd60a" stroke="#3a2400" stroke-width=".6" paint-order="stroke">${String(opt.engr).replace(/[<&>"]/g,"")}</text>`;
 return o+`</g>${opt.front||""}</svg>`;
}

/* бесплатный фон «Двор ордена» */
function knBG(u){return `<defs><radialGradient id="kbg${u}" cx=".5" cy=".38" r=".75"><stop offset="0" stop-color="#2e3c8c"/><stop offset=".55" stop-color="#141a48"/><stop offset="1" stop-color="#070a1c"/></radialGradient></defs>
 <rect width="420" height="640" fill="url(#kbg${u})"/><path d="M90 560 V250 A120 120 0 0 1 330 250 V560" fill="none" stroke="#ffd60a" stroke-opacity=".16" stroke-width="4"/>
 <circle cx="210" cy="150" r="120" fill="#ffd60a" opacity=".06"/><path d="M0 560 C80 540 340 540 420 560 V640 H0Z" fill="#1a1d3a"/>
 <ellipse cx="210" cy="598" rx="160" ry="30" fill="none" stroke="#ffd60a" stroke-width="2.5" stroke-dasharray="10 9" opacity=".5"><animate attributeName="stroke-dashoffset" values="0;-76" dur="6s" repeatCount="indefinite"/></ellipse>`}
const SLK=["helm","shoulders","chest","legs","boots","weapon"];
const VB=["150 6 120 190","70 150 280 160","130 150 160 260","110 350 200 240","90 530 240 90","140 300 140 320"];
const eqOf=(look)=>{const e={};SLK.forEach((k,i)=>e[k]=(look&&look[i]&&KSETS[look[i]])?look[i]:"bronze");return e};
const partSVG=(it,w)=>knDraw(Object.fromEntries(SLK.map(k=>[k,KSETS[it.set]?it.set:"bronze"])),{w:w||"100%",vb:VB[it.slot],u:"p"+(++uidN)});
let uidN=0;
const esc=t=>String(t==null?"":t).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const R=it=>KN_RAR[KN_SETS[it.set]?KN_SETS[it.set].r:0];
const FCLS=["","kf1","kf2","kf3","kf4"];
const pw=it=>knPartPow(it);
const nf=n=>Math.round(n).toLocaleString("ru-RU").replace(/[  ,]/g," ");
const K={sub:"knight",d:null,busy:false,fl:-1,sel:new Set(),selMode:"",top:null,reveal:null};
const css=`
#kn-tabs{display:flex;gap:4px;margin:2px 0 10px;overflow-x:auto}
#kn-tabs button i{display:block;font-style:normal;font-size:17px;line-height:1.1}
#kn-tabs button{flex:1 1 0;min-width:0;padding:5px 1px;border-radius:11px;border:1.5px solid #2a3260;background:#0c1230;color:#aab4dc;font-weight:900;font-size:11px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
#kn-tabs button.on{border-color:#ffd60a;color:#ffd60a;background:#16204a}
.kn-stage{position:relative;border:2.5px solid #ffc21a;border-radius:18px;overflow:hidden;box-shadow:0 0 24px rgba(255,194,26,.2)}
.kn-pw{position:absolute;left:10px;top:10px;background:rgba(8,12,32,.85);border:1.5px solid #3a447a;border-radius:12px;padding:6px 10px}
.kn-pw b{display:block;font-size:24px;color:#ffd60a;line-height:1}.kn-pw small{font-size:9px;letter-spacing:1.5px;color:#8e9ac8;font-weight:900}
.kn-rk{position:absolute;right:10px;top:10px;background:rgba(40,30,0,.85);border:1.5px solid #ffd60a;border-radius:12px;padding:6px 10px;color:#ffd60a;font-weight:900;font-size:12px}
.kn-box{background:linear-gradient(180deg,#101638,#080c1e);border:1.5px solid #232c5c;border-radius:14px;padding:11px;margin-top:10px}
.kn-box h4{margin:0 0 7px;font-size:11px;letter-spacing:2px;color:#8e9ac8}
.kn-row{display:flex;align-items:center;gap:9px;padding:6px;border-radius:11px;background:#0a0f28;border:1px solid #1c2450;margin-top:5px;cursor:pointer}
.kn-th{width:46px;height:46px;flex:0 0 auto;border-radius:9px;background:#141a44;overflow:hidden;display:flex;align-items:center;justify-content:center}
.kn-th svg{width:100%;height:100%}
.kn-row .t{flex:1;min-width:0}.kn-row .t b{display:block;font-size:13px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.kn-row .t small{font-size:10.5px;color:#8e9ac8}
.kn-p{font-weight:900;color:#ffd60a;font-size:13px;white-space:nowrap}
.kn-tag{display:inline-block;font-size:9.5px;font-weight:900;padding:1px 6px;border-radius:6px;margin-right:4px}
.kf1{box-shadow:0 0 0 1.5px #6ab0ff inset}.kf2{box-shadow:0 0 0 2px #bf5af2 inset,0 0 10px #bf5af2}.kf3{box-shadow:0 0 0 2px #ffd60a inset,0 0 14px #ffd60a;animation:knglow 1.6s ease-in-out infinite}.kf4{box-shadow:0 0 0 2px #ff3b3b inset,0 0 16px #ff3b3b;animation:knglitch 1.1s steps(2) infinite}
@keyframes knglow{50%{box-shadow:0 0 0 2px #fff4a0 inset,0 0 22px #ffd60a}}@keyframes knglitch{50%{filter:hue-rotate(40deg) saturate(1.6)}}
.kn-btns{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:10px}
.kn-btn{border-radius:13px;padding:12px 6px;text-align:center;font-weight:900;font-size:14px;color:#0b0f24;background:linear-gradient(180deg,#ffe14d,#ffc400);box-shadow:0 4px 0 #8a6a00;border:2px solid #0b0f24}
.kn-btn.b{background:linear-gradient(180deg,#5aa8ff,#2a4fd0);color:#fff;box-shadow:0 4px 0 #10245a}.kn-btn.g{background:#1a1f40;color:#8e9ac8;box-shadow:none;border-color:#2a3260}
.kn-keys{display:flex;align-items:center;gap:12px}.kn-keys b{font-size:30px;color:#ffd60a}.kn-keys small{color:#aab4dc;font-size:11px;line-height:1.4}
.kn-chips{display:flex;gap:5px;flex-wrap:wrap;margin-top:6px}.kn-chip{font-size:10.5px;font-weight:900;padding:4px 8px;border-radius:8px;border:1px solid #3a447a;background:#0a0f28;color:#cfd7f8}
.kn-rev{display:grid;grid-template-columns:repeat(auto-fill,minmax(96px,1fr));gap:8px;margin-top:10px}
.kn-card{border-radius:12px;background:#0c1230;border:2px solid var(--c);padding:6px;text-align:center;animation:knin .5s cubic-bezier(.2,1.5,.4,1) both}
.kn-card .kn-th{width:100%;height:84px}.kn-card b{display:block;font-size:11px;margin-top:4px;line-height:1.15}.kn-card small{display:block;font-size:9.5px;color:#8e9ac8}
@keyframes knin{0%{transform:scale(.5) rotate(-8deg);opacity:0}100%{transform:none;opacity:1}}
.kn-shake{animation:knshake .5s}@keyframes knshake{20%,60%{transform:translateX(-5px) rotate(-1deg)}40%,80%{transform:translateX(5px) rotate(1deg)}}
.kn-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:6px}
.kn-row.sel{border-color:#ff7a4a;background:#2a1010}
.kn-odds td{font-size:11px;padding:2px 6px;color:#cfd7f8}.kn-odds{border-collapse:collapse;width:100%}
.kn-off{padding:30px 14px;text-align:center;color:#aab4dc}
`;
function ensure(){const sec=$("sec-dragon");if(!sec||$("kn-root"))return;const st=document.createElement("style");st.textContent=css;document.head.appendChild(st);
 const tabs=document.createElement("div");tabs.id="kn-tabs";const root=document.createElement("div");root.id="kn-root";sec.prepend(root);sec.prepend(tabs);
 tabs.onclick=e=>{const b=e.target.closest("[data-k]");if(!b)return;hap("light");K.sub=b.dataset.k;show()}}
function tabsHTML(){return [["knight","⚔️","Рыцарь"],["forge","🔨","Кузня"],["ars","🛡","Арсенал"],["mkt","🛒","Рынок"],["top","🏆","Топ"],["dragon","🐉","Дракон"]].map(([k,ic,n])=>`<button type="button" data-k="${k}" class="${K.sub===k?"on":""}"><i>${ic}</i>${k==="forge"&&K.d&&K.d.keys>0?K.d.keys+"🔑":n}</button>`).join("")}
function show(){ensure();const t=$("kn-tabs"),root=$("kn-root"),dg=$("dg-root");if(!t)return;t.innerHTML=tabsHTML();
 if(K.sub==="dragon"){root.hidden=true;dg.hidden=false;try{renderDragon()}catch(e){}return}
 root.hidden=false;dg.hidden=true;
 if(!ONLINE){root.innerHTML='<div class="kn-off">⚔️ Рыцарь работает в игре через Telegram</div>';return}
 if(!K.d){root.innerHTML='<div class="kn-off">⚔️ Кузнец раздувает горн…</div>';load();return}
 ({knight:drawKnight,forge:drawForge,ars:drawArs,mkt:drawMkt,top:drawTop})[K.sub]()}
async function load(){const r=await act("kn_get");if(r){K.d=r;show()}}
async function call(a,p){if(K.busy)return null;K.busy=true;try{const r=await act(a,p||{});if(r&&r.items){K.d=Object.assign(K.d||{},r)}return r}finally{K.busy=false}}
const eqItems=()=>SLK.map((_,i)=>K.d.items.find(x=>x.id===K.d.eq[i])||null);
function itLine(it,extra){const S=KN_SETS[it.set]||{n:it.set},Rr=R(it),F=KN_FORGE[it.forge];
 return `<b style="color:${Rr.c}">${esc(S.n)}</b><small>${KN_SLOT_N[it.slot]} · ${it.forge?`<span class="kn-tag" style="background:${["","#16305a","#3a1650","#3a2a00","#4a0a0a"][it.forge]};color:${["","#9fc0ff","#e0b0ff","#ffd60a","#ff8a8a"][it.forge]}">${F.k}</span>`:""}${it.q}% · №${it.no}${F.cap?"/"+F.cap:""}${extra||""}</small>`}
function drawKnight(){const d=K.d,root=$("kn-root"),E=eqItems(),look=E.map(x=>x?x.set:null),P=knPower(E.filter(Boolean));
 const cnt={};E.forEach(x=>{if(x)cnt[x.set]=(cnt[x.set]||0)+1});
 const bon=Object.entries(cnt).sort((a,b)=>b[1]-a[1]).map(([k,n])=>{const t=[[6,"+15%"],[4,"+8%"],[2,"+3%"]].find(x=>n>=x[0]);return `<span class="kn-chip" style="border-color:${KN_RAR[KN_SETS[k].r].c}">${esc(KN_SETS[k].n)} ${n}/6${t?" · "+t[1]:""}</span>`}).join("");
 const mySets=[...new Set(d.items.map(x=>x.set))].sort((a,b)=>KN_SETS[b].r-KN_SETS[a].r);
 root.innerHTML=`<div class="kn-stage">${knDraw(eqOf(look),{bg:1,u:"main",engr:d.engr})}<div class="kn-pw"><b>${nf(P.pow)}</b><small>СИЛА РЫЦАРЯ</small></div><div class="kn-rk">${knRank(P.pow)}</div></div>
 <div class="kn-box"><h4>СЕТ-БОНУСЫ · 2/6 +3% · 4/6 +8% · 6/6 +15%</h4><div class="kn-chips">${bon||'<span class="kn-chip">нет</span>'}</div></div>
 <div class="kn-box"><h4>НА ТЕБЕ · НАЖМИ, ЧТОБЫ СМЕНИТЬ</h4>${SLK.map((_,i)=>{const it=E[i];return it?`<div class="kn-row" data-slot="${i}"><div class="kn-th ${FCLS[it.forge]}">${partSVG(it)}</div><div class="t">${itLine(it)}</div><div class="kn-p">⚔ ${pw(it)}</div></div>`:`<div class="kn-row" data-slot="${i}"><div class="kn-th">${KN_SLOT_IC[i]}</div><div class="t"><b>${KN_SLOT_N[i]}</b><small>пусто</small></div></div>`}).join("")}</div>
 <div class="kn-box"><h4>НАДЕТЬ ВЕСЬ СЕТ</h4><div class="kn-chips">${mySets.map(k=>`<button type="button" class="kn-chip" data-set="${k}" style="border-color:${KN_RAR[KN_SETS[k].r].c}">${esc(KN_SETS[k].n)} · ${new Set(d.items.filter(x=>x.set===k).map(x=>x.slot)).size}/6</button>`).join("")}</div></div>`;
 root.insertAdjacentHTML("beforeend",`<div class="kn-box"><h4>ГРАВИРОВКА ИМЕНИ НА МЕЧЕ · ${nf(KN_ENGR)} 🪙</h4><div style="display:flex;gap:6px"><input id="kn-eg" maxlength="14" placeholder="${esc(d.engr||"Твоя надпись")}" style="flex:1;min-width:0"><div class="kn-btn g" id="kn-egb" style="padding:8px 12px;font-size:12px">Выгравировать</div></div></div>`);
 $("kn-egb").onclick=async()=>{const t=$("kn-eg").value.trim();if(t.length<2)return toast("Надпись от 2 до 14 символов");if(!confirmMoney(KN_ENGR))return;const r=await call("kn_engrave",{text:t});if(r){toast("✍️ Выгравировано");moneyUpd();show()}};
 root.querySelectorAll("[data-slot]").forEach(r=>r.onclick=()=>pick(+r.dataset.slot));
 root.querySelectorAll("[data-set]").forEach(b=>b.onclick=async()=>{const r=await call("kn_equip_set",{set:b.dataset.set});if(r){toast("Надет сет «"+KN_SETS[b.dataset.set].n+"»");show()}})}
function pick(sl){const L=K.d.items.filter(x=>x.slot===sl).sort((a,b)=>pw(b)-pw(a)),m=$("modal"),sh=$("msheet");m.hidden=false;
 sh.innerHTML=`<button type="button" class="x" id="kn-x">Закрыть</button><div class="box"><h3>${KN_SLOT_IC[sl]} ${KN_SLOT_N[sl]}: выбери часть</h3>${L.map(it=>`<div class="kn-row" data-id="${it.id}" style="${it.id===K.d.eq[sl]?"border-color:#ffd60a":""}"><div class="kn-th ${FCLS[it.forge]}">${partSVG(it)}</div><div class="t">${itLine(it)}</div><div class="kn-p">⚔ ${pw(it)}</div></div>`).join("")||"<p>Пока нет частей — крути кузню</p>"}</div>`;
 $("kn-x").onclick=closeModal;sh.querySelectorAll("[data-id]").forEach(r=>r.onclick=async()=>{const x=await call("kn_equip",{id:+r.dataset.id});if(x){closeModal();hap("medium");show()}})}
function oddsHTML(){return `<table class="kn-odds">${KN_RAR.map(x=>`<tr><td style="color:${x.c}">${x.k}</td><td>${String(x.w).replace(".",",")}%</td></tr>`).join("")}</table><table class="kn-odds" style="margin-top:6px">${KN_FORGE.map(x=>`<tr><td>${x.k}</td><td>${String(x.w).replace(".",",")}%</td><td>${x.cap?"тираж "+x.cap+" на часть":"без лимита"}</td></tr>`).join("")}</table><small style="color:#8e9ac8;font-size:10.5px">Слот: шлем 10%, оружие 6%, остальные по 21%. Качество 70–100%. Шансы считает сервер.</small>`}
function drawForge(){const d=K.d,root=$("kn-root"),now=Date.now()+((d.now||Date.now())-Date.now());
 const left=d.next?Math.max(0,d.next-Date.now()):0,h=Math.floor(left/36e5),mi=Math.floor(left%36e5/6e4);
 const week=KN_SETS[d.week];const craftable=knForgeSets().filter(k=>KN_SETS[k].r<4);
 root.innerHTML=`<div class="kn-box"><div class="kn-keys"><b>${d.keys} 🔑</b><small>${d.next?`+1 бесплатный ключ через ${h} ч ${mi} мин (копится до 3)`:"запас бесплатных ключей полный"}<br>🎴 Ключ за каждые 10 прокруток карт: <b style="color:#ffd60a">${d.sp}/10</b> · редкая карта +1</small></div>
  <div class="kn-chips">${week?`<span class="kn-chip" style="border-color:#ffd60a">🔥 Сет недели: ${esc(week.n)} ×3</span>`:""}${d.night?'<span class="kn-chip" style="border-color:#bf5af2">🌙 Ночная ковка: Обсидиан доступен</span>':'<span class="kn-chip">🌙 Обсидиан — только 00:00–06:00</span>'}${d.hour&&d.hour>Date.now()?'<span class="kn-chip" style="border-color:#ff7a00">⚒ Час кузнеца: редкая ковка ×2</span>':""}</div>
  <div class="kn-btns"><div class="kn-btn" id="kn-f1">🔨 Ковать · 1 🔑</div><div class="kn-btn b" id="kn-f10">×10 · 10 🔑</div></div>
  <div class="kn-chips"><span class="kn-chip">до эпика: ${Math.max(1,KN_PITY.e-d.pe)}</span><span class="kn-chip">до мифа: ${Math.max(1,KN_PITY.m-d.pm)}</span><span class="kn-chip">выковано всего: ${nf(d.forged||0)}</span></div>
  <div id="kn-rev" class="kn-rev">${(K.reveal||[]).map(revCard).join("")}</div></div>
 <div class="kn-box"><h4>СТАЛЬ 🔩 ${nf(d.steel)} · ВЫКОВАТЬ НУЖНУЮ ЧАСТЬ</h4><div style="display:flex;gap:6px;flex-wrap:wrap"><select id="kn-cs">${craftable.map(k=>`<option value="${k}">${esc(KN_SETS[k].n)} — ${KN_RAR[KN_SETS[k].r].craft} 🔩</option>`).join("")}</select><select id="kn-cl">${KN_SLOT_N.map((n,i)=>`<option value="${i}">${n}</option>`).join("")}</select><div class="kn-btn g" id="kn-cr" style="padding:8px 12px;font-size:12px">Выковать</div></div><small style="color:#8e9ac8;font-size:10.5px">Сталь — из ненужных частей в «Арсенале». Из стали выходит только обычная ковка.</small></div>
 <div class="kn-box"><h4>ШАНСЫ КУЗНИ</h4>${oddsHTML()}</div>`;
 const go=n=>async()=>{if(K.d.keys<n)return toast("Нужно "+n+" 🔑. Крути карты: каждые 10 прокруток — ключ");const box=$("kn-rev");box.classList.add("kn-shake");hap("medium");
  const r=await call("kn_forge",{n});box.classList.remove("kn-shake");if(!r)return;K.reveal=r.got;show();const best=r.got.reduce((a,b)=>(b.forge*10+R(b).w*-0.01)>(a.forge*10+R(a).w*-0.01)?b:a,r.got[0]);
  if(best.forge>=3||KN_SETS[best.set].r>=3){hap("heavy");toast("🔥 "+KN_FORGE[best.forge].k+" ковка · "+KN_SETS[best.set].n+"!")}};
 $("kn-f1").onclick=go(1);$("kn-f10").onclick=go(10);
 $("kn-cr").onclick=async()=>{const r=await call("kn_craft",{set:$("kn-cs").value,slot:+$("kn-cl").value});if(r){K.reveal=r.got;toast("Выковано из стали");show()}}}
function revCard(it){return `<div class="kn-card" style="--c:${R(it).c}"><div class="kn-th ${FCLS[it.forge]}">${partSVG(it)}</div><b style="color:${R(it).c}">${esc(KN_SETS[it.set].n)}</b><small>${KN_SLOT_N[it.slot]} · ${it.q}%</small><small>${it.forge?KN_FORGE[it.forge].k+" · ":""}№${it.no}</small></div>`}
function drawArs(){const d=K.d,root=$("kn-root"),worn=new Set(Object.values(d.eq));let L=d.items.slice();if(K.fl>=0)L=L.filter(x=>x.slot===K.fl);
 L.sort((a,b)=>b.forge-a.forge||KN_SETS[b.set].r-KN_SETS[a.set].r||pw(b)-pw(a));
 const groups={};d.items.forEach(x=>{if(worn.has(x.id)||x.forge>=4)return;const k=x.set+"|"+x.slot+"|"+x.forge;(groups[k]=groups[k]||[]).push(x)});const mg=Object.values(groups).filter(g=>g.length>=3);
 const total=knForgeSets().length*6,have=new Set(d.items.map(x=>x.set+"|"+x.slot)).size;
 root.innerHTML=`<div class="kn-box"><h4>АРСЕНАЛ · СОБРАНО ${have}/${total} ЧАСТЕЙ · ВСЕГО ${d.items.length}</h4><div class="kn-chips">${[[-1,"Все"]].concat(KN_SLOT_N.map((n,i)=>[i,KN_SLOT_IC[i]+" "+n])).map(([i,n])=>`<button type="button" class="kn-chip" data-fl="${i}" style="${K.fl===i?"border-color:#ffd60a;color:#ffd60a":""}">${n}</button>`).join("")}</div>
 ${mg.length?`<div class="kn-chips" style="margin-top:8px">${mg.slice(0,6).map(g=>`<button type="button" class="kn-chip" data-mg="${g.slice(0,3).map(x=>x.id).join(",")}" style="border-color:#ff7a00;color:#ffb070">♻️ Переплавить 3 → ${KN_FORGE[g[0].forge+1].k}: ${esc(KN_SETS[g[0].set].n)} · ${KN_SLOT_N[g[0].slot]}</button>`).join("")}</div>`:""}
 <div class="kn-btns"><div class="kn-btn g" id="kn-sm">${K.selMode?"Отмена":"🔩 Разобрать на сталь"}</div>${K.selMode?`<div class="kn-btn" id="kn-sg">Разобрать: ${K.sel.size}</div>`:""}</div></div>
 <div class="kn-box">${L.map(it=>`<div class="kn-row ${K.sel.has(it.id)?"sel":""}" data-id="${it.id}"><div class="kn-th ${FCLS[it.forge]}" style="font-size:22px">${KN_SLOT_IC[it.slot]}</div><div class="t">${itLine(it,worn.has(it.id)?" · <b style='color:#39ff9a;display:inline'>надето</b>":it.lp!=null?" · <b style='color:#ffb070;display:inline'>на рынке "+nf(it.lp)+"</b>":"")}${it.sh?`<small style="color:#ffd60a">заточка +${it.sh}</small>`:""}</div><div class="kn-p">⚔ ${pw(it)}<small style="display:block;color:#8e9ac8;font-size:10px;text-align:right">${nf(it.v)} 🪙</small></div></div>`).join("")||"<p>Пусто</p>"}</div>`;
 root.querySelectorAll("[data-fl]").forEach(b=>b.onclick=()=>{K.fl=+b.dataset.fl;show()});
 root.querySelectorAll("[data-mg]").forEach(b=>b.onclick=async()=>{const r=await call("kn_merge",{ids:b.dataset.mg.split(",").map(Number)});if(r){hap("heavy");toast("♻️ Переплавлено: "+KN_FORGE[r.got[0].forge].k+" ковка, №"+r.got[0].no);show()}});
 $("kn-sm").onclick=()=>{K.selMode=K.selMode?"":"scrap";K.sel.clear();show()};if($("kn-sg"))$("kn-sg").onclick=async()=>{if(!K.sel.size)return toast("Выбери части");const r=await call("kn_scrap",{ids:[...K.sel]});if(r){toast("+"+r.steelGot+" стали 🔩");K.sel.clear();K.selMode="";show()}};
 root.querySelectorAll(".kn-row[data-id]").forEach(r=>r.onclick=()=>{const id=+r.dataset.id;if(K.selMode){if(worn.has(id))return toast("Надетую часть разобрать нельзя");K.sel.has(id)?K.sel.delete(id):K.sel.add(id);r.classList.toggle("sel")}else itemMenu(id)})}
async function drawTop(){const root=$("kn-root");if(!K.top||Date.now()-K.top.t>60e3){root.innerHTML='<div class="kn-off">🏆 Загружаю топ…</div>';const r=await act("kn_top");if(!r)return;K.top={t:Date.now(),r}}
 if(K.sub!=="top")return;const r=K.top.r;
 root.innerHTML=`<div class="kn-box"><h4>ТОП РЫЦАРЕЙ ПО СИЛЕ · ТВОЁ МЕСТО: ${r.me.place||"—"}</h4>${r.items.map((x,i)=>`<div class="kn-row" data-u="${x.uid}"><div class="kn-th" style="font-weight:900;color:#ffd60a">${i<3?["🥇","🥈","🥉"][i]:i+1}</div>${i<10?`<div class="kn-th">${knDraw(eqOf(x.look),{vb:"120 0 180 330",u:"t"+i})}</div>`:""}<div class="t"><b>${x.vip?"👑 ":""}${esc(x.name)}</b><small>${x.rank}</small></div><div class="kn-p">⚔ ${nf(x.pow)}</div></div>`).join("")}</div>`;root.querySelectorAll("[data-u]").forEach(e=>e.onclick=()=>openInv(+e.dataset.u))}

const confirmMoney=n=>{const c=S&&S.cash||0;if(c<n){toast("Не хватает монет: нужно "+nf(n)+" 🪙");return false}return true};
const moneyUpd=()=>{try{updCash()}catch(e){}};
function modal(html){const m=$("modal"),sh=$("msheet");m.hidden=false;sh.innerHTML=`<button type="button" class="x" id="kn-x">Закрыть</button><div class="box">${html}</div>`;$("kn-x").onclick=closeModal;return sh}
function itemMenu(id){const it=K.d.items.find(x=>x.id===id);if(!it)return;const worn=Object.values(K.d.eq).includes(id),cap=Math.max(1000,Math.round(knValue(it)*KN_TRADE.capX)),sc=knSharpCost(it.sh||0);
 const sh=modal(`<div class="kn-row" style="cursor:default"><div class="kn-th ${FCLS[it.forge]}" style="width:70px;height:70px">${partSVG(it)}</div><div class="t">${itLine(it)}<small style="display:block">Сила ⚔ ${pw(it)} · оценка ${nf(it.v)} 🪙${it.sh?" · заточка +"+it.sh:""}</small></div></div>
 <div class="kn-btns" style="grid-template-columns:1fr">
 ${worn?'<div class="kn-chip">Надето — чтобы продать или подарить, надень вместо неё другую часть</div>':it.lp!=null?`<div class="kn-btn g" data-a="unlist">Снять с рынка (${nf(it.lp)} 🪙)</div>`:`<div class="kn-btn" data-a="equip">Надеть</div>
 <div style="display:flex;gap:6px"><input id="kn-pr" type="number" min="1" max="${cap}" placeholder="Цена, до ${nf(cap)}" style="flex:1;min-width:0"><div class="kn-btn b" data-a="list" style="padding:10px">На рынок</div></div>
 <div class="kn-btn g" data-a="sell">Быстро продать системе: +${nf(Math.round(knValue(it)*KN_TRADE.quick))} 🪙</div>
 <div style="display:flex;gap:6px"><input id="kn-to" placeholder="Ник друга" style="flex:1;min-width:0"><div class="kn-btn g" data-a="gift" style="padding:10px">🎁 Подарить</div></div>`}
 ${(it.sh||0)<10?`<div class="kn-btn g" data-a="sharp">🗡 Заточить до +${(it.sh||0)+1}: ${nf(sc)} 🪙 (+2% силы)</div>`:""}
 </div><small style="color:#8e9ac8;font-size:10.5px">Комиссия рынка ${Math.round(KN_TRADE.fee*100)}%. Подарки — до ${KN_TRADE.giftsDay} в день.</small>`);
 sh.querySelectorAll("[data-a]").forEach(b=>b.onclick=async()=>{const a=b.dataset.a;let r;
  if(a==="equip")r=await call("kn_equip",{id});
  if(a==="unlist")r=await call("kn_unlist",{id});
  if(a==="list"){const pr=Math.round(+$("kn-pr").value||0);if(!pr)return toast("Укажи цену");r=await call("kn_list",{id,price:pr});if(r)toast("Выставлено на рынок")}
  if(a==="sell"){if(it.forge>=2&&!confirm("Продать редкую ковку системе? Она уйдёт из игры."))return;r=await call("kn_sell",{ids:[id]});if(r){toast("+"+nf(r.sold)+" 🪙");moneyUpd()}}
  if(a==="gift"){const n=$("kn-to").value.trim();if(!n)return toast("Впиши ник друга");r=await call("kn_gift",{id,nick:n});if(r)toast("🎁 Подарено!")}
  if(a==="sharp"){if(!confirmMoney(sc))return;r=await call("kn_sharpen",{id});if(r){toast("🗡 Заточка +"+r.sharp);moneyUpd()}}
  if(r){closeModal();show()}})}
K.mk="lots";K.mf={slot:-1,forge:-1,sort:"new"};
async function drawMkt(){const root=$("kn-root");const tabs=[["lots","Лоты"],["ord","Заказы"],["tr","Обмены"],["smith","Оружейник"],["feed","Лента"]];
 const head=`<div class="kn-chips">${tabs.map(([k,n])=>`<button type="button" class="kn-chip" data-mk="${k}" style="${K.mk===k?"border-color:#ffd60a;color:#ffd60a":""}">${n}</button>`).join("")}</div>`;
 root.innerHTML=`<div class="kn-box">${head}<div id="kn-mb" style="margin-top:8px"><div class="kn-off">Загружаю…</div></div></div>`;
 root.querySelectorAll("[data-mk]").forEach(b=>b.onclick=()=>{K.mk=b.dataset.mk;show()});const box=$("kn-mb"),mk=K.mk;
 if(mk==="lots"||mk==="ord"||mk==="smith"){const f=K.mf;const r=await act("kn_market",mk==="lots"?{slot:f.slot,forge:f.forge,sort:f.sort}:{});if(!r||K.mk!==mk||K.sub!=="mkt")return;
  if(mk==="lots"){box.innerHTML=`<div style="display:flex;gap:5px;flex-wrap:wrap"><select id="kn-fs"><option value="-1">Все слоты</option>${KN_SLOT_N.map((n,i)=>`<option value="${i}" ${f.slot===i?"selected":""}>${n}</option>`).join("")}</select><select id="kn-ff"><option value="-1">Любая ковка</option>${KN_FORGE.map((x,i)=>`<option value="${i}" ${f.forge===i?"selected":""}>${x.k}</option>`).join("")}</select><select id="kn-fo"><option value="new">Новые</option><option value="cheap" ${f.sort==="cheap"?"selected":""}>Дешёвые</option><option value="rare" ${f.sort==="rare"?"selected":""}>Редкие</option></select></div>
   ${r.big?`<div class="kn-chip" style="margin-top:6px;border-color:#ffd60a">💰 Сделка недели: ${esc(KN_SETS[r.big.set_id]?KN_SETS[r.big.set_id].n:"")} · ${KN_SLOT_N[r.big.slot]} за ${nf(r.big.price)} 🪙</div>`:""}
   ${r.lots.map(it=>`<div class="kn-row" data-buy="${it.id}" data-p="${it.lp}"><div class="kn-th ${FCLS[it.forge]}">${partSVG(it)}</div><div class="t">${itLine(it)}<small style="display:block">продаёт ${esc(it.name)}</small></div><div class="kn-p">${it.mine?"твой лот":nf(it.lp)+" 🪙"}</div></div>`).join("")||'<div class="kn-off">Лотов пока нет. Выстави свою часть из «Арсенала»</div>'}`;
   ["kn-fs","kn-ff","kn-fo"].forEach(id=>$(id).onchange=()=>{K.mf={slot:+$("kn-fs").value,forge:+$("kn-ff").value,sort:$("kn-fo").value};show()});
   box.querySelectorAll("[data-buy]").forEach(e=>e.onclick=async()=>{const it=r.lots.find(x=>x.id===+e.dataset.buy);if(it.mine)return itemMenu(it.id);if(!confirmMoney(it.lp))return;if(!confirm("Купить «"+KN_SETS[it.set].n+"» ("+KN_SLOT_N[it.slot]+") за "+nf(it.lp)+" 🪙?"))return;
    const x=await call("kn_buy",{id:it.id,price:it.lp});if(x){hap("medium");toast("Куплено! Часть в арсенале");moneyUpd();show()}})}
  if(mk==="ord"){const myFree=K.d.items.filter(i=>!Object.values(K.d.eq).includes(i.id)&&i.lp==null);
   box.innerHTML=`<h4 style="margin:0 0 6px;font-size:11px;letter-spacing:2px;color:#8e9ac8">ЗАКАЗЫ «КУПЛЮ» · МОНЕТЫ ЗАМОРОЖЕНЫ</h4>${r.orders.map(o=>{const m=myFree.find(i=>i.set===o.set&&i.slot===o.slot&&i.forge===o.forge);return `<div class="kn-row"><div class="kn-th ${FCLS[o.forge]}">${partSVG({set:o.set,slot:o.slot})}</div><div class="t"><b style="color:${KN_RAR[KN_SETS[o.set].r].c}">${esc(KN_SETS[o.set].n)}</b><small>${KN_SLOT_N[o.slot]} · ${KN_FORGE[o.forge].k} · ${o.mine?"твой заказ":"от "+esc(o.name)}</small></div>${o.mine?`<button type="button" class="kn-chip" data-oc="${o.id}">Отменить</button>`:m?`<button type="button" class="kn-chip" style="border-color:#39ff9a" data-of="${o.id}" data-it="${m.id}">Продать ${nf(o.price*(1-KN_TRADE.fee))}</button>`:`<div class="kn-p">${nf(o.price)} 🪙</div>`}</div>`}).join("")||'<div class="kn-off">Заказов нет</div>'}
   <div class="kn-box"><h4>СОЗДАТЬ ЗАКАЗ</h4><div style="display:flex;gap:5px;flex-wrap:wrap"><select id="kn-os">${knSetIds().map(k=>`<option value="${k}">${esc(KN_SETS[k].n)}</option>`).join("")}</select><select id="kn-ol">${KN_SLOT_N.map((n,i)=>`<option value="${i}">${n}</option>`).join("")}</select><select id="kn-of">${KN_FORGE.map((x,i)=>`<option value="${i}">${x.k}</option>`).join("")}</select><input id="kn-op" type="number" placeholder="Цена" style="width:110px"><div class="kn-btn b" id="kn-oa" style="padding:8px 12px;font-size:12px">Создать</div></div></div>`;
   box.querySelectorAll("[data-oc]").forEach(b=>b.onclick=async()=>{if(await call("kn_ord_cancel",{id:+b.dataset.oc})){toast("Заказ отменён, монеты вернулись");moneyUpd();await load()}});
   box.querySelectorAll("[data-of]").forEach(b=>b.onclick=async()=>{if(!confirm("Отдать свою часть по заказу?"))return;const x=await call("kn_ord_fill",{order:+b.dataset.of,id:+b.dataset.it});if(x){toast("+"+nf(x.sold)+" 🪙");moneyUpd();show()}});
   $("kn-oa").onclick=async()=>{const pr=Math.round(+$("kn-op").value||0);if(!confirmMoney(pr))return;const x=await call("kn_ord_add",{set:$("kn-os").value,slot:+$("kn-ol").value,forge:+$("kn-of").value,price:pr});if(x){toast("Заказ создан");moneyUpd();show()}}}
  if(mk==="smith"){box.innerHTML=`<small style="color:#aab4dc">Оружейник продаёт части сетов эпох за монеты — без случайности. Сеты меняются каждый понедельник.</small>${r.smith.map(set=>`<h4 style="margin:10px 0 4px;color:${KN_RAR[KN_SETS[set].r].c}">${esc(KN_SETS[set].n)} · ${KN_RAR[KN_SETS[set].r].k}</h4>${KN_SLOT_N.map((n,sl)=>`<div class="kn-row" data-sb="${set}|${sl}"><div class="kn-th">${partSVG({set,slot:sl})}</div><div class="t"><b>${n}</b><small>обычная ковка · качество 75–98%</small></div><div class="kn-p">${nf(knSmithPrice(set,sl))} 🪙</div></div>`).join("")}`).join("")}`;
   box.querySelectorAll("[data-sb]").forEach(e=>e.onclick=async()=>{const [set,sl]=e.dataset.sb.split("|"),pr=knSmithPrice(set,+sl);if(!confirmMoney(pr))return;if(!confirm("Купить за "+nf(pr)+" 🪙?"))return;const x=await call("kn_smith_buy",{set,slot:+sl});if(x){K.reveal=x.got;toast("⚒ Куплено у Оружейника");moneyUpd();show()}})}}
 if(mk==="tr"){const r=await act("kn_trades");if(!r||K.mk!=="tr")return;const it=x=>x?`${esc(KN_SETS[x.set].n)} · ${KN_SLOT_N[x.slot]} ${x.forge?"("+KN_FORGE[x.forge].k+")":""} №${x.no}`:"—";
  box.innerHTML=r.items.map(t=>`<div class="kn-box" style="margin-top:6px"><small style="color:#8e9ac8">${t.in?"Тебе предлагает "+esc(t.an):"Ты предложил "+esc(t.bn)}</small><div style="font-size:12px;margin-top:4px">Отдаёт: <b>${it(t.in?t.ai:t.bi)}</b><br>Просит: <b>${it(t.in?t.bi:t.ai)}</b>${t.extra?`<br>${(t.extra>0)===!!t.in?"Доплачивает тебе":"Ты доплачиваешь"}: <b>${nf(Math.abs(t.extra))} 🪙</b>`:""}</div><div class="kn-chips">${t.in?`<button type="button" class="kn-chip" style="border-color:#39ff9a" data-ta="${t.id}">Принять</button>`:""}<button type="button" class="kn-chip" data-td="${t.id}">${t.in?"Отклонить":"Отменить"}</button></div></div>`).join("")||'<div class="kn-off">Обменов нет. Открой рыцаря игрока в «Топе» и предложи обмен</div>';
  box.querySelectorAll("[data-ta]").forEach(b=>b.onclick=async()=>{const x=await call("kn_trade_answer",{id:+b.dataset.ta,ok:1});if(x){hap("heavy");toast("🔄 Обмен состоялся!");moneyUpd();show()}});
  box.querySelectorAll("[data-td]").forEach(b=>b.onclick=async()=>{if(await act("kn_trade_answer",{id:+b.dataset.td,ok:0}))show()})}
 if(mk==="feed"){const r=await act("kn_feed");if(!r||K.mk!=="feed")return;box.innerHTML=`<h4 style="margin:0 0 6px;font-size:11px;letter-spacing:2px;color:#8e9ac8">ПРЯМО СЕЙЧАС ВЫКОВАЛИ</h4>`+(r.items.map(it=>`<div class="kn-row" data-u="${it.uid}"><div class="kn-th ${FCLS[it.forge]}">${partSVG(it)}</div><div class="t">${itLine(it)}<small style="display:block">${esc(it.name)}</small></div></div>`).join("")||'<div class="kn-off">Пока тихо — выкуй что-нибудь редкое!</div>');
  box.querySelectorAll("[data-u]").forEach(e=>e.onclick=()=>openInv(+e.dataset.u))}}
async function openInv(uid){if(K.d&&uid===(S&&S.uid)){K.sub="ars";return show()}const r=await act("kn_inv",{uid});if(!r)return;
 const sh=modal(`<h3>⚔️ Рыцарь игрока ${esc(r.name)}</h3><div style="max-width:260px;margin:0 auto;border-radius:14px;overflow:hidden">${knDraw(eqOf(r.look),{bg:1,u:"inv",engr:r.engr})}</div><p style="text-align:center">Сила ⚔ ${nf(r.pow)} · ${r.rank}</p><h4>АРСЕНАЛ · НАЖМИ, ЧТОБЫ ПРЕДЛОЖИТЬ ОБМЕН</h4>${r.items.map(it=>`<div class="kn-row" data-ti="${it.id}"><div class="kn-th ${FCLS[it.forge]}">${partSVG(it)}</div><div class="t">${itLine(it,it.worn?" · надето":"")}</div></div>`).join("")}`);
 sh.querySelectorAll("[data-ti]").forEach(e=>e.onclick=()=>{const th=r.items.find(x=>x.id===+e.dataset.ti),mine=K.d?K.d.items.filter(i=>!Object.values(K.d.eq).includes(i.id)&&i.lp==null):[];
  const s2=modal(`<h3>🔄 Обмен с ${esc(r.name)}</h3><p>Ты хочешь: <b>${esc(KN_SETS[th.set].n)} · ${KN_SLOT_N[th.slot]} №${th.no}</b></p><p>Твоя часть взамен:</p><select id="kn-tm" style="width:100%"><option value="">— без части, только монеты —</option>${mine.map(i=>`<option value="${i.id}">${esc(KN_SETS[i.set].n)} · ${KN_SLOT_N[i.slot]} ${i.forge?"("+KN_FORGE[i.forge].k+")":""} ${i.q}%</option>`).join("")}</select><p>Доплата монетами (можно 0):</p><input id="kn-tx" type="number" value="0" style="width:100%"><div class="kn-btns" style="grid-template-columns:1fr"><div class="kn-btn" id="kn-ts">Отправить предложение</div></div>`);
  $("kn-ts").onclick=async()=>{const x=await call("kn_trade_offer",{to:r.uid,theirs:th.id,mine:+$("kn-tm").value||0,extra:Math.round(+$("kn-tx").value||0)});if(x){closeModal();toast("Предложение отправлено — игрок получит сообщение")}}})}
/* вкладка внизу: «Рыцарь» вместо «Дракона», дракон — подвкладка */
const _dgNav=typeof dgNav==="function"?dgNav:null;
if(_dgNav)dgNav=function(){_dgNav.apply(this,arguments);const i=$("tab-dragon-i"),t=$("tab-dragon-t");if(i)i.textContent="⚔️";if(t)t.textContent="Рыцарь"};
const _setTab=setTab;
setTab=function(t){if(t==="dragon"&&!setTab.fromTab)K.sub="dragon";setTab.fromTab=0;_setTab.apply(this,arguments);if(t==="dragon")show()};
{const b=$("tab-dragon");if(b){b.onclick=()=>{try{menuClose()}catch(e){}if(K.sub==="dragon")K.sub="knight";setTab.fromTab=1;setTab("dragon")}}}
try{dgNav()}catch(e){}
/* ключи за карты: короткая подсказка после прокрутки */
const _act=act;act=async function(n,p,t){const r=await _act(n,p,t);if(r&&(n==="open"||n==="open_multi")&&r.knKey>0){if(K.d){K.d.keys+=r.knKey}setTimeout(()=>toast("+"+r.knKey+" 🔑 в кузню рыцаря за редкую карту"),1800)}if(r&&(n==="open"||n==="open_multi")&&K.d)K.d=null;return r};
setInterval(()=>{try{if(K.sub==="forge"&&$("kn-root")&&!$("sec-dragon").hidden&&!K.busy&&K.d&&K.d.next&&Date.now()>K.d.next)load()}catch(e){}},30000);
window.knOpen=sub=>{K.sub=sub||"knight";setTab.fromTab=1;setTab("dragon")};

})();
