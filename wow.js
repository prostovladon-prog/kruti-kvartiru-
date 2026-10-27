/* wow.js — подарки и витрины, казино рун, голем и 3D-эффекты лагеря. Подключается после game.js */
/* объёмные глянцевые подарки: базовая форма + объём (радиальные градиенты), блики, ободок света */
function giftSVG(k,s){const GE=GIFTS[k];if(GE&&GE.base){const v=Math.random().toString(36).slice(2,7);
   return `<svg viewBox="0 0 120 120" width="${s}" height="${s}" class="gerr" style="overflow:visible;filter:drop-shadow(0 6px 6px rgba(0,0,0,.45)) drop-shadow(0 0 14px ${GE.g})" aria-hidden="true"><defs><filter id="gx${v}" x="-60%" y="-60%" width="220%" height="220%"><feColorMatrix in="SourceGraphic" type="hueRotate" values="${GE.err}" result="m"/>`+
    `<feColorMatrix in="SourceGraphic" type="matrix" values="1 0 0 0 0 0 0 0 0 0 0 0 0 0 .2 0 0 0 .75 0" result="r"/><feOffset in="r" dx="-5" dy="1" result="ro"/><feColorMatrix in="SourceGraphic" type="matrix" values="0 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 .75 0" result="c"/><feOffset in="c" dx="5" dy="-1" result="co"/>`+
    `<feMerge><feMergeNode in="ro"/><feMergeNode in="co"/><feMergeNode in="m"/></feMerge></filter></defs><g filter="url(#gx${v})">${giftSVG(GE.base,120).replace(/^<svg[^>]*>/,"").replace(/<\/svg>$/,"")}</g>`+
    `<g opacity=".55"><rect x="0" y="38" width="120" height="3" fill="#fff"/><rect x="10" y="74" width="110" height="2" fill="#00e5ff"/></g><g transform="rotate(-12 96 14)"><rect x="74" y="4" width="44" height="18" rx="4" fill="#ff2e63" stroke="#fff" stroke-width="2"/><text x="96" y="17.5" text-anchor="middle" font-size="11" font-weight="900" fill="#fff" font-family="sans-serif">ERROR</text></g></svg>`}
 const u=k+Math.random().toString(36).slice(2,7);
 const rg=(id,c1,c2,c3,cx,cy)=>`<radialGradient id="${id}${u}" cx="${cx||.35}" cy="${cy||.3}" r=".85"><stop offset="0" stop-color="${c1}"/><stop offset=".55" stop-color="${c2}"/><stop offset="1" stop-color="${c3}"/></radialGradient>`;
 const lg=(id,a,b,c)=>`<linearGradient id="${id}${u}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${a}"/><stop offset=".5" stop-color="${b}"/><stop offset="1" stop-color="${c}"/></linearGradient>`;
 const spec=`<radialGradient id="sp${u}" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#fff" stop-opacity=".95"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>`;
 const W=(defs,body,glow)=>`<svg viewBox="0 0 120 120" width="${s}" height="${s}" style="overflow:visible;filter:drop-shadow(0 6px 6px rgba(0,0,0,.45)) drop-shadow(0 0 14px ${glow})" aria-hidden="true"><defs>${defs}${spec}</defs>${body}</svg>`;
 const hl=(x,y,rx,ry,r)=>`<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="url(#sp${u})" transform="rotate(${r||-30} ${x} ${y})"/>`;
 const L={
 crown:()=>W(rg("g","#fff7c2","#f2b51c","#7a4a06")+lg("b","#ffe27a","#c98a10","#6a3a04"),
  `<path d="M18 86 L12 34 L38 56 L60 20 L82 56 L108 34 L102 86Z" fill="url(#g${u})" stroke="#4a2a02" stroke-width="2.5"/>
   <path d="M18 86 L102 86 L100 100 L20 100Z" fill="url(#b${u})" stroke="#4a2a02" stroke-width="2.5"/>
   <circle cx="12" cy="32" r="6" fill="url(#g${u})" stroke="#4a2a02" stroke-width="2"/><circle cx="60" cy="18" r="7" fill="url(#g${u})" stroke="#4a2a02" stroke-width="2"/><circle cx="108" cy="32" r="6" fill="url(#g${u})" stroke="#4a2a02" stroke-width="2"/>
   ${["#ff2e63:40:72:6","#34ffb0:60:66:8","#3ab0ff:80:72:6"].map(x=>{const [c,X,Y,R]=x.split(":");return `<circle cx="${X}" cy="${Y}" r="${R}" fill="${c}" stroke="#4a2a02" stroke-width="2"/><circle cx="${X-R/3}" cy="${Y-R/3}" r="${R/3}" fill="#fff" opacity=".85"/>`}).join("")}
   ${hl(36,46,10,4)}${hl(78,44,8,3,30)}<path d="M24 92 H96" stroke="#fff6c8" stroke-width="2" opacity=".7"/>`,"#ffd23f"),
 feather:()=>W(rg("g","#fff3a0","#ff7a1a","#a8141a",.4,.6)+lg("b","#fff","#ffd23f","#ff3b30"),
  `<path d="M86 8 Q112 44 76 82 Q58 98 32 104 Q40 84 50 66 Q58 32 86 8Z" fill="url(#g${u})" stroke="#5a0a0a" stroke-width="2.5"/>
   <path d="M84 14 Q64 56 32 104" fill="none" stroke="url(#b${u})" stroke-width="3.5"/>
   ${[0,1,2,3,4].map(i=>`<path d="M${78-i*8} ${30+i*12} q-14 -2 -20 4" fill="none" stroke="#ffe27a" stroke-width="2" opacity=".8"/>`).join("")}
   ${hl(76,30,10,4,-60)}`,"#ff6a1a"),
 dragon:()=>W(rg("g","#d6ffe0","#2fbf5a","#0a4a22")+rg("e","#fff","#fff6a0","#ff9f0a",.4,.4),
  `<path d="M24 92 Q16 44 60 38 Q104 44 96 92Z" fill="url(#g${u})" stroke="#052a12" stroke-width="2.5"/>
   <path d="M34 44 L18 14 L46 34Z M86 44 L102 14 L74 34Z" fill="#ffd23f" stroke="#5a3a02" stroke-width="2.5"/>
   <ellipse cx="45" cy="64" rx="10" ry="11" fill="url(#e${u})" stroke="#052a12" stroke-width="2"/><ellipse cx="75" cy="64" rx="10" ry="11" fill="url(#e${u})" stroke="#052a12" stroke-width="2"/>
   <ellipse cx="46" cy="66" rx="3.5" ry="6" fill="#0d1030"/><ellipse cx="76" cy="66" rx="3.5" ry="6" fill="#0d1030"/><circle cx="42" cy="60" r="2.5" fill="#fff"/><circle cx="72" cy="60" r="2.5" fill="#fff"/>
   <path d="M52 80 Q60 86 68 80" fill="none" stroke="#052a12" stroke-width="2.5"/><circle cx="36" cy="78" r="5" fill="#ff8fb0" opacity=".6"/><circle cx="84" cy="78" r="5" fill="#ff8fb0" opacity=".6"/>${hl(40,48,12,5)}`,"#34ffb0"),
 ring:()=>W(rg("g","#fff7c2","#e8a91a","#6a3a04")+lg("d","#ffffff","#c9a8ff","#5a1fa8"),
  `<ellipse cx="60" cy="76" rx="34" ry="30" fill="none" stroke="url(#g${u})" stroke-width="12"/><ellipse cx="60" cy="76" rx="40" ry="36" fill="none" stroke="#4a2a02" stroke-width="2"/><ellipse cx="60" cy="76" rx="28" ry="24" fill="none" stroke="#4a2a02" stroke-width="2"/>
   <path d="M42 40 L60 12 L78 40 L60 54Z" fill="url(#d${u})" stroke="#2a0a50" stroke-width="2.5"/><path d="M42 40 H78 M60 12 L52 40 L60 54 L68 40Z" fill="none" stroke="#fff" stroke-width="1.5" opacity=".8"/>${hl(32,66,8,3,-70)}${hl(54,24,5,2,-50)}`,"#c56bff"),
 mask:()=>W(rg("g","#ff9a9a","#d0141f","#4a0508")+rg("h","#fff7c2","#e8b33a","#6a3a04"),
  `<path d="M20 36 Q60 14 100 36 Q106 80 60 106 Q14 80 20 36Z" fill="url(#g${u})" stroke="#2a0204" stroke-width="2.5"/>
   <path d="M20 36 L6 8 L36 28Z M100 36 L114 8 L84 28Z" fill="url(#h${u})" stroke="#4a2a02" stroke-width="2.5"/>
   <path d="M32 54 L54 60 L52 68 L32 64Z M88 54 L66 60 L68 68 L88 64Z" fill="#0d0408"/><path d="M38 58 L50 61 M82 58 L70 61" stroke="#ffd23f" stroke-width="3"/>
   <path d="M40 84 Q60 72 80 84 L74 92 H46Z" fill="#fff" stroke="#2a0204" stroke-width="2"/><path d="M48 84 v8 M56 82 v10 M64 82 v10 M72 84 v8" stroke="#2a0204" stroke-width="1.5"/>${hl(40,34,14,5,-15)}`,"#ff2e63"),
 sword:()=>W(lg("g","#ffffff","#c9d3e6","#5d6a7e")+rg("h","#fff7c2","#e8b33a","#6a3a04")+lg("st","#9aa6bf","#5d6a7e","#2a3040"),
  `<path d="M56 6 L64 6 L66 72 L54 72Z" fill="url(#g${u})" stroke="#1a2030" stroke-width="2"/><path d="M60 10 V68" stroke="#fff" stroke-width="2" opacity=".9"/>
   <path d="M36 72 H84 V80 H36Z" fill="url(#h${u})" stroke="#4a2a02" stroke-width="2"/><circle cx="60" cy="76" r="4" fill="#ff2e63" stroke="#4a2a02" stroke-width="1.5"/><path d="M55 80 H65 V92 H55Z" fill="#7a4a20" stroke="#2a1404" stroke-width="2"/>
   <path d="M20 94 Q60 78 100 94 L96 110 H24Z" fill="url(#st${u})" stroke="#1a2030" stroke-width="2.5"/>${hl(40,96,12,3,-8)}`,"#9fe8ff"),
 chest:()=>W(rg("g","#ffd9a0","#c96a1a","#4a1a02")+rg("h","#fff7c2","#e8b33a","#6a3a04")+rg("c","#ffffff","#7fe7ff","#0a4a8a",.4,.4),
  `<rect x="18" y="56" width="84" height="48" rx="8" fill="url(#g${u})" stroke="#2a1002" stroke-width="2.5"/><path d="M16 56 Q60 14 104 56Z" fill="url(#g${u})" stroke="#2a1002" stroke-width="2.5"/>
   <rect x="18" y="68" width="84" height="8" fill="url(#h${u})" stroke="#4a2a02" stroke-width="1.5"/><rect x="52" y="62" width="16" height="20" rx="3" fill="url(#h${u})" stroke="#4a2a02" stroke-width="2"/>
   <path d="M40 44 l7 -9 7 9 -7 9z M66 34 l8 -10 8 10 -8 10z" fill="url(#c${u})" stroke="#052a4a" stroke-width="1.5"/>${hl(34,62,10,3,-10)}`,"#7fe7ff"),
 shoe:()=>W(lg("g","#ffffff","#b8c3d6","#4a5468")+rg("h","#fff7c2","#e8b33a","#6a3a04"),
  `<path d="M28 18 Q8 70 34 100 Q60 116 86 100 Q112 70 92 18 L74 22 Q88 66 72 86 Q60 96 48 86 Q32 66 46 22Z" fill="url(#g${u})" stroke="#1a2030" stroke-width="2.5"/>
   ${[[30,30],[24,52],[28,74],[90,30],[96,52],[92,74]].map(([x,y])=>`<circle cx="${x}" cy="${y}" r="3.5" fill="url(#h${u})" stroke="#4a2a02" stroke-width="1.2"/>`).join("")}
   ${hl(32,40,10,3,-75)}<path d="M60 4 l4 9 9 1 -7 6 2 9 -8 -5 -8 5 2 -9 -7 -6 9 -1z" fill="#ffd23f" stroke="#6a3a04" stroke-width="1.5"/>`,"#c9d3e6"),
 dice:()=>W(rg("g","#ffb3c0","#e0213f","#5a0414")+rg("w","#ffffff","#ffd6de","#c08090"),
  `<path d="M14 46 L50 32 L80 48 L80 92 L46 108 L14 90Z" fill="url(#g${u})" stroke="#2a0208" stroke-width="2.5"/><path d="M14 46 L46 62 L80 48 M46 62 V108" fill="none" stroke="#2a0208" stroke-width="2"/>
   <path d="M60 22 L92 10 L114 28 L108 66 L80 76 L58 58Z" fill="url(#g${u})" stroke="#2a0208" stroke-width="2.5"/><path d="M60 22 L84 40 L114 28 M84 40 L80 76" fill="none" stroke="#2a0208" stroke-width="2"/>
   ${[[30,72],[38,80],[62,80],[62,94],[86,22],[98,58],[96,46],[94,34]].map(([x,y])=>`<circle cx="${x}" cy="${y}" r="4" fill="url(#w${u})"/>`).join("")}<circle cx="47" cy="47" r="4.5" fill="url(#w${u})"/>${hl(30,54,9,3,-20)}${hl(78,22,8,3,-20)}`,"#ff4d6d"),
 clover:()=>W(rg("g","#d6ffe0","#2fd06a","#0a4a22"),
  `<path d="M60 64 Q70 96 54 116" fill="none" stroke="#1a6a32" stroke-width="6" stroke-linecap="round"/>
   ${[0,90,180,270].map(a=>`<path transform="rotate(${a} 60 56)" d="M60 56 Q34 50 32 30 Q32 12 48 14 Q58 16 60 28 Q62 16 72 14 Q88 12 88 30 Q86 50 60 56Z" fill="url(#g${u})" stroke="#052a12" stroke-width="2.5"/>`).join("")}
   <circle cx="60" cy="56" r="6" fill="#ffd23f" stroke="#5a3a02" stroke-width="2"/>${hl(46,26,9,4,-30)}${hl(88,44,7,3,40)}`,"#47e891"),
 cup:()=>W(rg("g","#fff7c2","#f2b51c","#7a4a06")+lg("b","#ffe27a","#c98a10","#6a3a04")+rg("c","#ffffff","#7fe7ff","#0a4a8a",.4,.4),
  `<path d="M30 14 H90 Q92 64 60 76 Q28 64 30 14Z" fill="url(#g${u})" stroke="#4a2a02" stroke-width="2.5"/>
   <path d="M30 22 Q8 24 12 44 Q16 58 34 56 M90 22 Q112 24 108 44 Q104 58 86 56" fill="none" stroke="url(#b${u})" stroke-width="6"/><path d="M30 22 Q8 24 12 44 Q16 58 34 56 M90 22 Q112 24 108 44 Q104 58 86 56" fill="none" stroke="#4a2a02" stroke-width="1.5"/>
   <path d="M54 76 H66 V92 H54Z" fill="url(#b${u})" stroke="#4a2a02" stroke-width="2"/><path d="M34 92 H86 L90 110 H30Z" fill="url(#b${u})" stroke="#4a2a02" stroke-width="2.5"/>
   <path d="M60 30 l8 10 -8 10 -8 -10z" fill="url(#c${u})" stroke="#052a4a" stroke-width="1.5"/>${hl(42,28,10,4,-60)}<path d="M40 100 H80" stroke="#fff6c8" stroke-width="2" opacity=".7"/>`,"#ffd23f"),
 potion:()=>W(rg("g","#ffd6f6","#e01fb8","#4a0540",.4,.55)+lg("gl","#ffffff","#d6e6ff","#8aa0c8")+rg("c","#fff7c2","#e8a91a","#6a3a04"),
  `<path d="M48 10 H72 V34 Q100 46 98 76 Q96 108 60 110 Q24 108 22 76 Q20 46 48 34Z" fill="url(#gl${u})" stroke="#1a2040" stroke-width="2.5" opacity=".55"/>
   <path d="M26 70 Q60 60 94 70 Q94 106 60 107 Q26 106 26 70Z" fill="url(#g${u})" stroke="#4a0540" stroke-width="2"/>
   <circle cx="44" cy="84" r="5" fill="#fff" opacity=".6"/><circle cx="68" cy="92" r="3.5" fill="#fff" opacity=".6"/><circle cx="76" cy="78" r="2.5" fill="#fff" opacity=".6"/>
   <path d="M48 10 H72 V34 Q100 46 98 76 Q96 108 60 110 Q24 108 22 76 Q20 46 48 34Z" fill="none" stroke="#1a2040" stroke-width="2.5"/>
   <rect x="44" y="4" width="32" height="12" rx="4" fill="url(#c${u})" stroke="#4a2a02" stroke-width="2"/>${hl(38,56,8,14,20)}`,"#ff4dd8"),
 rose:()=>W(rg("g","#ffb0c0","#e0103f","#4a0010",.45,.4)+rg("l","#d6ffe0","#2fbf5a","#0a4a22"),
  `<path d="M60 64 Q62 92 56 116" fill="none" stroke="#1a6a32" stroke-width="6" stroke-linecap="round"/>
   <path d="M58 92 Q34 84 30 98 Q46 104 58 96Z M60 84 Q84 72 90 86 Q74 94 60 88Z" fill="url(#l${u})" stroke="#052a12" stroke-width="2"/>
   <path d="M60 70 Q24 66 26 38 Q30 14 60 12 Q90 14 94 38 Q96 66 60 70Z" fill="url(#g${u})" stroke="#3a0010" stroke-width="2.5"/>
   <path d="M60 58 Q38 54 42 36 Q50 22 62 26 Q76 30 72 42 Q66 50 56 44 Q52 38 60 34" fill="none" stroke="#3a0010" stroke-width="2.5"/>${hl(42,28,10,4,-35)}`,"#ff3b6b"),
 shield:()=>W(lg("g","#e6f4ff","#3a8ad0","#0a2a5a")+rg("h","#fff7c2","#e8b33a","#6a3a04"),
  `<path d="M60 8 Q86 20 106 18 Q108 76 60 112 Q12 76 14 18 Q34 20 60 8Z" fill="url(#h${u})" stroke="#4a2a02" stroke-width="2.5"/>
   <path d="M60 18 Q82 28 96 27 Q96 72 60 100 Q24 72 24 27 Q38 28 60 18Z" fill="url(#g${u})" stroke="#0a1a3a" stroke-width="2"/>
   <path d="M60 36 l7 15 16 2 -12 11 3 16 -14 -8 -14 8 3 -16 -12 -11 16 -2z" fill="url(#h${u})" stroke="#4a2a02" stroke-width="2"/>${hl(40,36,10,4,-60)}`,"#5ac8fa"),
 cake:()=>W(rg("g","#fff0f6","#ff9cc4","#a8306a")+lg("c","#7a4020","#5a2a10","#3a1a08")+rg("f","#fff6c8","#ffd23f","#ff7a1a"),
  `<path d="M16 72 H104 V104 Q60 114 16 104Z" fill="url(#c${u})" stroke="#2a1004" stroke-width="2.5"/>
   <path d="M16 72 Q16 60 60 58 Q104 60 104 72 Q104 82 92 78 Q86 90 78 80 Q70 92 60 80 Q50 92 42 80 Q34 90 28 78 Q16 82 16 72Z" fill="url(#g${u})" stroke="#5a1030" stroke-width="2.5"/>
   ${[36,60,84].map((x,i)=>`<rect x="${x-4}" y="${36-i%2*4}" width="8" height="${24+i%2*4}" rx="2" fill="${["#5ac8fa","#ffd23f","#34ffb0"][i]}" stroke="#1a2040" stroke-width="1.5"/><path d="M${x} ${30-i%2*4} q-6 -8 0 -16 q6 8 0 16z" fill="url(#f${u})"/>`).join("")}
   ${[30,48,70,90].map((x,i)=>`<circle cx="${x}" cy="${94-i%2*6}" r="3" fill="${["#ff2e63","#ffd23f","#5ac8fa","#34ffb0"][i]}"/>`).join("")}${hl(34,64,10,3,-5)}`,"#ffb3d1"),
 horn:()=>W(lg("g","#fff8e6","#e8c27a","#7a5020")+rg("h","#fff7c2","#e8b33a","#6a3a04"),
  `<path d="M12 30 Q30 20 46 40 Q66 70 104 66 Q112 86 96 98 Q50 104 24 64 Q14 48 12 30Z" fill="url(#g${u})" stroke="#3a2004" stroke-width="2.5"/>
   <ellipse cx="102" cy="82" rx="9" ry="17" fill="#3a2004" stroke="#2a1404" stroke-width="2"/>
   ${[[34,46],[56,70],[78,82]].map(([x,y])=>`<path d="M${x-4} ${y-14} Q${x+8} ${y-2} ${x} ${y+14}" fill="none" stroke="url(#h${u})" stroke-width="6"/><path d="M${x-4} ${y-14} Q${x+8} ${y-2} ${x} ${y+14}" fill="none" stroke="#4a2a02" stroke-width="1.2"/>`).join("")}${hl(30,36,10,3,30)}`,"#e8c27a"),
 lamp:()=>W(rg("g","#fff7c2","#f2b51c","#7a4a06")+rg("s","#e6fbff","#a0b8ff","#5a3aff",.5,.6),
  `<path d="M70 4 Q86 10 76 22 Q96 28 92 48 Q74 54 60 42 Q48 30 70 4Z" fill="url(#s${u})" opacity=".75"/>
   <path d="M16 82 Q14 64 40 62 L82 62 Q98 50 112 40 Q108 58 94 70 Q96 92 60 96 Q30 98 16 82Z" fill="url(#g${u})" stroke="#4a2a02" stroke-width="2.5"/>
   <path d="M40 62 Q60 46 80 62" fill="url(#g${u})" stroke="#4a2a02" stroke-width="2.5"/><circle cx="60" cy="50" r="5" fill="url(#g${u})" stroke="#4a2a02" stroke-width="2"/>
   <path d="M14 76 Q2 70 6 60 Q14 62 18 70" fill="none" stroke="#4a2a02" stroke-width="5"/><path d="M38 100 H82 L76 110 H44Z" fill="url(#g${u})" stroke="#4a2a02" stroke-width="2.5"/>
   <circle cx="54" cy="78" r="5" fill="#ff2e63" stroke="#4a2a02" stroke-width="1.5"/>${hl(36,72,12,4,-10)}`,"#ffd23f"),
 hourglass:()=>W(rg("h","#fff7c2","#e8b33a","#6a3a04")+lg("gl","#ffffff","#bff6ff","#6ac8e8")+lg("sd","#fff0a0","#ffc23a","#e08a10"),
  `<rect x="22" y="6" width="76" height="12" rx="4" fill="url(#h${u})" stroke="#4a2a02" stroke-width="2.5"/><rect x="22" y="102" width="76" height="12" rx="4" fill="url(#h${u})" stroke="#4a2a02" stroke-width="2.5"/>
   <path d="M32 18 Q32 50 56 60 Q32 70 32 102 H88 Q88 70 64 60 Q88 50 88 18Z" fill="url(#gl${u})" stroke="#1a3a5a" stroke-width="2.5" opacity=".8"/>
   <path d="M40 34 Q44 48 58 56 L62 56 Q76 48 80 34Z" fill="url(#sd${u})"/><path d="M60 58 V92" stroke="#ffc23a" stroke-width="2.5"/><path d="M38 100 Q60 80 82 100Z" fill="url(#sd${u})"/>
   <path d="M26 18 V102 M94 18 V102" stroke="url(#h${u})" stroke-width="5"/>${hl(42,30,4,10,10)}`,"#7fe7ff"),
 egg:()=>W(rg("g","#ffe6b0","#ff7a1a","#5a1004",.4,.35)+rg("sc","#fff6c8","#ffd23f","#c96a10"),
  `<path d="M60 8 Q96 14 98 70 Q98 110 60 112 Q22 110 22 70 Q24 14 60 8Z" fill="url(#g${u})" stroke="#3a0a02" stroke-width="2.5"/>
   ${[[44,42],[70,36],[58,62],[36,72],[82,64],[48,90],[74,90]].map(([x,y])=>`<path d="M${x-8} ${y} Q${x} ${y-10} ${x+8} ${y} Q${x} ${y+6} ${x-8} ${y}Z" fill="url(#sc${u})" stroke="#5a1a04" stroke-width="1.5"/>`).join("")}
   <path d="M30 56 l10 6 -4 8 10 4 M86 50 l-8 8 6 6 -8 6" fill="none" stroke="#fff6c8" stroke-width="2" opacity=".85"/>${hl(44,26,12,5,-30)}`,"#ff7a1a"),
 scroll:()=>W(lg("p","#fff8e6","#f0d9a8","#c9a46a")+rg("h","#fff7c2","#e8b33a","#6a3a04")+rg("s","#ff9a9a","#d0141f","#4a0508"),
  `<rect x="22" y="22" width="76" height="70" rx="4" fill="url(#p${u})" stroke="#5a3a10" stroke-width="2.5"/>
   <rect x="14" y="14" width="92" height="14" rx="7" fill="url(#h${u})" stroke="#4a2a02" stroke-width="2.5"/><rect x="14" y="86" width="92" height="14" rx="7" fill="url(#h${u})" stroke="#4a2a02" stroke-width="2.5"/>
   ${[40,50,60,70].map(y=>`<path d="M32 ${y} H${y%20?80:72}" stroke="#8a6a3a" stroke-width="3" stroke-linecap="round"/>`).join("")}
   <circle cx="82" cy="94" r="10" fill="url(#s${u})" stroke="#2a0204" stroke-width="2"/><path d="M78 104 l-4 12 8 -6 8 6 -4 -12" fill="#d0141f" stroke="#2a0204" stroke-width="1.5"/>${hl(36,30,12,3,-5)}`,"#e8c27a"),
 axe:()=>W(lg("g","#ffffff","#c9d3e6","#5d6a7e")+lg("w","#c98a4a","#7a4a20","#3a2010")+rg("h","#fff7c2","#e8b33a","#6a3a04"),
  `<path d="M56 10 L66 10 L70 112 L52 112Z" fill="url(#w${u})" stroke="#2a1404" stroke-width="2.5"/>
   <path d="M64 20 Q104 14 108 52 Q90 46 66 54Z" fill="url(#g${u})" stroke="#1a2030" stroke-width="2.5"/><path d="M56 20 Q16 14 12 52 Q30 46 54 54Z" fill="url(#g${u})" stroke="#1a2030" stroke-width="2.5"/>
   <path d="M100 26 Q104 36 104 46 M20 26 Q16 36 16 46" stroke="#fff" stroke-width="2.5" opacity=".9"/><rect x="52" y="18" width="16" height="40" rx="3" fill="url(#h${u})" stroke="#4a2a02" stroke-width="2"/>
   <path d="M54 80 H68 M54 90 H68" stroke="#e8b33a" stroke-width="4"/>${hl(86,30,10,3,-20)}`,"#9fe8ff"),
 gem:()=>W(lg("a","#e6fbff","#5ac8fa","#0a3a8a")+lg("b","#bff6ff","#2a7ad0","#06205a"),
  `<path d="M30 40 L46 18 H74 L90 40 L60 106Z" fill="url(#a${u})" stroke="#06205a" stroke-width="2.5" stroke-linejoin="round"/>
   <path d="M30 40 H90 M46 18 L54 40 L60 106 L66 40 L74 18 M54 40 L60 18 L66 40" fill="none" stroke="#06205a" stroke-width="1.8" stroke-linejoin="round"/>
   <path d="M30 40 L60 106 L54 40Z" fill="url(#b${u})" opacity=".6"/><path d="M50 22 L56 36" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".9"/>${hl(44,32,8,3,-50)}`,"#5ac8fa"),
 trident:()=>W(lg("g","#e6fbff","#34c7c7","#0a5a6a")+rg("h","#fff7c2","#e8b33a","#6a3a04"),
  `<path d="M56 40 H64 V114 H56Z" fill="url(#h${u})" stroke="#4a2a02" stroke-width="2.5"/>
   <path d="M28 14 L34 6 L40 14 V46 Q40 52 46 52 H74 Q80 52 80 46 V14 L86 6 L92 14 V50 Q92 62 78 62 H42 Q28 62 28 50Z" fill="url(#g${u})" stroke="#063a3a" stroke-width="2.5" stroke-linejoin="round"/>
   <path d="M54 52 V8 L60 0 L66 8 V52Z" fill="url(#g${u})" stroke="#063a3a" stroke-width="2.5" stroke-linejoin="round"/>
   <circle cx="60" cy="72" r="6" fill="#ff2e63" stroke="#4a2a02" stroke-width="2"/>${hl(34,24,3,10,0)}${hl(58,22,2,10,0)}`,"#34c7c7"),
 wheel:()=>W(rg("g","#fff7c2","#e8b33a","#6a3a04"),
  `<circle cx="60" cy="60" r="50" fill="url(#g${u})" stroke="#4a2a02" stroke-width="3"/>
   ${[...Array(8)].map((_,i)=>{const a=i*Math.PI/4,a2=a+Math.PI/4;return `<path d="M60 60 L${60+42*Math.cos(a)} ${60+42*Math.sin(a)} A42 42 0 0 1 ${60+42*Math.cos(a2)} ${60+42*Math.sin(a2)}Z" fill="${["#ff2e63","#ffd23f","#34c759","#0a84ff","#bf5af2","#ff9f0a","#5ac8fa","#ff4dd8"][i]}" stroke="#4a2a02" stroke-width="1.5"/>`}).join("")}
   <circle cx="60" cy="60" r="10" fill="url(#g${u})" stroke="#4a2a02" stroke-width="2.5"/><path d="M60 4 L52 18 H68Z" fill="#fff" stroke="#4a2a02" stroke-width="2"/>${hl(40,30,14,5,-40)}`,"#ffd23f"),
 eye:()=>W(rg("g","#fff7c2","#e8b33a","#6a3a04")+rg("i","#d6ffe0","#34ffb0","#0a5a3a",.5,.5)+rg("e","#ffffff","#ffe6a0","#c98a2a"),
  `<path d="M6 60 Q60 4 114 60 Q60 116 6 60Z" fill="url(#e${u})" stroke="#4a2a02" stroke-width="3"/>
   <circle cx="60" cy="60" r="26" fill="url(#i${u})" stroke="#0a3a2a" stroke-width="2.5"/><ellipse cx="60" cy="60" rx="7" ry="22" fill="#0d1030"/>
   <path d="M6 60 Q60 4 114 60" fill="none" stroke="url(#g${u})" stroke-width="7"/><path d="M6 60 Q60 116 114 60" fill="none" stroke="url(#g${u})" stroke-width="7"/>
   <circle cx="50" cy="50" r="5" fill="#fff" opacity=".9"/>${hl(40,36,12,4,-25)}`,"#34ffb0"),
 helm:()=>W(rg("g","#fff7c2","#e8b33a","#6a3a04"),
  `<path d="M24 84 Q20 24 60 18 Q100 24 96 84 L82 84 L80 54 L40 54 L38 84Z" fill="url(#g${u})" stroke="#4a2a02" stroke-width="2.5"/><path d="M54 54 L54 96 L66 96 L66 54" fill="url(#g${u})" stroke="#4a2a02" stroke-width="2.5"/>
   <path d="M60 18 Q64 2 82 6" fill="none" stroke="#c0262c" stroke-width="8" stroke-linecap="round"/><circle cx="60" cy="32" r="6" fill="#c0262c" stroke="#4a2a02" stroke-width="2"/>${hl(40,34,12,5,-40)}`,"#ffd23f")};
 return (L[k]||L.helm)()}

/* ---------- общее: фоны подарков, частицы, нижнее меню ---------- */
const GBG={crown:"radial-gradient(circle at 50% 36%,#fff6c8,#ffb800 30%,#c2410c 62%,#3a0e05)",feather:"radial-gradient(circle at 50% 70%,#ffd23f,#ff3b30 35%,#5a0a1a 70%,#1a0205)",
 ring:"conic-gradient(from 0deg at 50% 40%,#2a0a5a,#7a3ad0,#0a3a8a,#bf5af2,#2a0a5a)",dragon:"radial-gradient(circle at 50% 40%,#a8ffd0,#0a8a5a 40%,#052a2a 75%)",
 sword:"radial-gradient(circle at 50% 40%,#e6fbff,#3a9ad0 40%,#0a1a3a 78%)",helm:"radial-gradient(circle at 50% 40%,#fff3c0,#d08a1a 45%,#3a1a05 80%)",
 shoe:"radial-gradient(circle at 50% 40%,#ffffff,#8a9ab8 40%,#1a2236 80%)",dice:"radial-gradient(circle at 50% 40%,#ffd0da,#c0102f 45%,#2a0208 80%)",
 clover:"radial-gradient(circle at 50% 40%,#e0ffe8,#1a9a50 42%,#032a12 80%)",mask:"radial-gradient(circle at 50% 40%,#ffb0c0,#a0001f 45%,#1a0005 80%)",
 cup:"conic-gradient(from 0deg at 50% 40%,#3a1a00,#ffd23f,#7a3a00,#fff6c8,#3a1a00)",
 potion:"radial-gradient(circle at 50% 60%,#ffd6f6,#c010a0 40%,#2a0228 80%)",rose:"radial-gradient(circle at 50% 35%,#ffe0e8,#d0103f 42%,#2a0010 80%)",
 shield:"radial-gradient(circle at 50% 40%,#e6f4ff,#1a6ad0 42%,#06143a 80%)",cake:"radial-gradient(circle at 50% 40%,#fff0f6,#ff6aa8 40%,#3a0a24 80%)",
 horn:"radial-gradient(circle at 50% 40%,#fff3d6,#b07a2a 42%,#2a1604 80%)",lamp:"radial-gradient(circle at 50% 30%,#d6e0ff,#5a3aff 35%,#2a0a5a 62%,#0a0420)",
 hourglass:"conic-gradient(from 0deg at 50% 40%,#06243a,#7fe7ff,#0a3a6a,#fff6c8,#06243a)",egg:"radial-gradient(circle at 50% 70%,#ffd23f,#ff5a1f 32%,#7a0a04 62%,#1a0202)",
 scroll:"radial-gradient(circle at 50% 40%,#fff8e6,#c9a46a 45%,#3a2410 80%)",axe:"radial-gradient(circle at 50% 40%,#e6f4ff,#5d6a7e 45%,#14182a 80%)",gem:"radial-gradient(circle at 50% 40%,#e6fbff,#1a6ad0 42%,#040e2a 80%)",
 trident:"radial-gradient(circle at 50% 40%,#d6ffff,#0a8a8a 42%,#032a2a 80%)",wheel:"conic-gradient(from 0deg at 50% 40%,#ff2e63,#ffd23f,#34c759,#0a84ff,#bf5af2,#ff2e63)",eye:"radial-gradient(circle at 50% 50%,#d6ffe0,#0a8a5a 35%,#3a2a04 70%,#0a0802)",
 err:"repeating-linear-gradient(0deg,rgba(255,255,255,.06) 0 2px,transparent 2px 4px),conic-gradient(from 0deg at 50% 40%,#ff2e63,#2a0a5a,#00e5ff,#0a0420,#ff2e63)"};
const byR=(a,b)=>GIFTS[b].r-GIFTS[a].r||GIFTS[a].run-GIFTS[b].run,STAR_GIFTS=Object.keys(GIFTS).filter(k=>!GIFTS[k].luck&&!GIFTS[k].base).sort(byR),LUCK_GIFTS=Object.keys(GIFTS).filter(k=>GIFTS[k].luck).sort(byR),ERR_GIFTS=Object.keys(GIFTS).filter(k=>GIFTS[k].base).sort(byR);
const gNo=g=>"№ "+String(g.no).padStart(3,"0")+"/"+GIFTS[g.k].run;
function giftCard(k,o){o=o||{};const G=GIFTS[k],L=o.left;
  return `<div class="gc${G.r>=4?" myth":""}${G.base?" err":""}${G.luck?" luck":""}${o.small?" small":""}" style="--g:${G.g};--rc:${GR_C[G.r]}"><div class="bg" style="background:${G.base?GBG.err:GBG[k]}"></div>${G.r>=3?'<div class="rays"></div>':""}<div class="foil"></div><div class="ic">${giftSVG(k,100)}</div><div class="glare"></div><span class="rr">${GR[G.r].toUpperCase()}</span><span class="run">тираж ${fmtN(G.run)}</span><div class="nm">${G.n}</div>${L!=null?`<div class="lb"><i style="width:${Math.max(0,L)/G.run*100}%"></i></div><div class="lt">${L>0?"осталось "+fmtN(L)+" из "+fmtN(G.run):"тираж закончился"}</div>`:""}${o.btn||""}</div>`}
/* частицы на холсте: искры, ромбики, конфетти */
function wFx(cv){const X=cv.getContext("2d"),P=[];let run=false;const fit=()=>{const r=cv.getBoundingClientRect(),d=Math.min(2,devicePixelRatio||1);cv.width=r.width*d;cv.height=r.height*d;X.setTransform(d,0,0,d,0,0)};fit();
  const loop=()=>{const r=cv.getBoundingClientRect();X.clearRect(0,0,r.width,r.height);
    for(let i=P.length-1;i>=0;i--){const p=P[i];p.t++;p.x+=p.vx;p.y+=p.vy;p.vy+=p.g;p.vx*=.97;const k=1-p.t/p.l;if(k<=0){P.splice(i,1);continue}
      X.globalAlpha=k;X.fillStyle=p.c;X.save();X.translate(p.x,p.y);X.rotate(p.r+p.t*.2);if(p.s>3.5){X.beginPath();X.moveTo(0,-p.s);X.lineTo(p.s*.6,0);X.lineTo(0,p.s);X.lineTo(-p.s*.6,0);X.fill()}else X.fillRect(-p.s/2,-p.s/2,p.s,p.s);X.restore()}
    X.globalAlpha=1;if(P.length)requestAnimationFrame(loop);else run=false};
  return {fit,burst(x,y,n,cols,sp,g,life,sz){if(reduce||P.length>140)return;n=Math.min(n,140-P.length);for(let i=0;i<n;i++){const a=Math.random()*Math.PI*2,v=sp*(.4+Math.random());P.push({x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v-(g>0?sp*.5:0),g:g||0,l:life*(.6+Math.random()*.6),t:0,c:cols[Math.floor(Math.random()*cols.length)],s:sz*(.6+Math.random()*.8),r:Math.random()*6})}if(!run){run=true;requestAnimationFrame(loop)}}}}
function wSheet(html,onClick){document.querySelectorAll(".wsheet").forEach(e=>e.remove());const d=document.createElement("div");d.className="wsheet";
  d.innerHTML='<div class="wsh-in">'+html+'<button type="button" class="ghost" data-x="1">Закрыть</button></div>';document.body.append(d);
  d.onclick=e=>{if(e.target===d||e.target.closest("[data-x]")){d.remove();return}const b=e.target.closest("button");if(b&&onClick){const r=onClick(b);if(r!==false)d.remove()}};return d}
/* показ нового подарка: лучи, салют, номер тиража */
function wReveal(g,title,sub,btns){const G=GIFTS[g.k],d=document.createElement("div");d.className="wrev";d.style.setProperty("--g",G.g);d.style.setProperty("--rc",GR_C[G.r]);
  d.innerHTML='<div class="rays2"></div><canvas></canvas><div class="ic">'+giftSVG(g.k,150)+'</div><h3></h3><p>'+gNo(g)+(G.luck?" · серия «Удача»":"")+'</p>'+(sub?'<p style="font-weight:700;opacity:.85"></p>':"")+'<span class="rr">'+GR[G.r].toUpperCase()+'</span><div class="bt">'+(btns||"")+'<button type="button" class="ghost" data-x="1" style="color:#fff">Отлично</button></div>';
  d.querySelector("h3").textContent=title||G.n;if(sub)d.querySelectorAll("p")[1].textContent=sub;document.body.append(d);
  const fx=wFx(d.querySelector("canvas")),w=innerWidth,h=innerHeight;const cols=[G.g,"#fff","#ffd23f",GR_C[G.r]];
  fx.burst(w/2,h*.4,120,cols,10,.12,100,6);setTimeout(()=>fx.burst(w*.25,h*.3,50,cols,7,.12,80,5),400);setTimeout(()=>fx.burst(w*.75,h*.3,50,cols,7,.12,80,5),700);
  try{sfx.fanfare()}catch(e){}hapN("success");
  d.onclick=async e=>{const b=e.target.closest("button");if(!b)return;if(b.dataset.x){d.remove();return}
    if(b.dataset.put){const r=await putOnShelf(+b.dataset.put);if(r)d.remove()}};return d}
async function putOnShelf(id){const used=new Set((S.gifts||[]).filter(g=>g.shelf>0).map(g=>g.shelf));let slot=0;for(let i=1;i<=SHELF_N;i++)if(!used.has(i)){slot=i;break}
  if(!slot){toast("Все "+SHELF_N+" мест на витрине заняты. Убери подарок с полки в «Моей витрине»");return null}
  const r=await act("gift_shelf",{id,slot});if(r){toast("🏛 Подарок стоит на витрине");hap("medium")}return r}

/* ---------- Сокровищница: вкладка «Подарки» ---------- */
const _renderGold=renderGold;
renderGold=function(){_renderGold();if(goldTab!=="gifts")return;const B=$("gold-body"),L=(goldData&&goldData.gleft)||{};
  const buyB=k=>{const l=goldData?L[k]:null,sold=l===0;return '<button type="button" class="pr" data-gk="'+k+'"'+(sold?" disabled":"")+'>'+(sold?"раскуплено":"⭐ "+GIFTS[k].stars)+'</button>'};
  const card=k=>giftCard(k,{left:goldData?L[k]:null,btn:buyB(k)+(CASE.p.some(x=>x[1].g===k)?'<span class="incase">🎰 и в кейсе</span>':"")});
  B.innerHTML='<div class="gshead"><h3>🎁 Подарки Эпох</h3><p>У каждого подарка свой тираж на весь мир — номер навсегда остаётся на подарке. Ставь на витрину и дари друзьям. Подарки нельзя продать.</p><div class="row2"><button type="button" class="craftbtn" data-shelf="1">🏛 Моя витрина</button><button type="button" class="craftbtn" data-cas="1" style="background:linear-gradient(180deg,#e0c8ff,#9a5af2);color:#fff">🎰 Казино</button></div></div>'+
   '<div class="ghd">👑 VIP-статусы</div><div class="vipg">'+[1,2,3].map(t=>{const V=VIP_T[t],cur=vipTier(S)===t;return '<div class="vipc v'+t+(cur?" on":"")+'"><i>'+V.ic+'</i><b>'+V.n.replace("VIP ","")+'</b><small>'+V.days+' дней</small><ul><li>🎴 <b>'+V.sp+'</b> прокруток / 4 ч</li><li>💱 +'+V.ex+' обмен'+(V.ex===1?"":"а")+' рун</li><li>'+V.ic+' значок у ника</li></ul><button type="button" class="pr" data-vip="'+t+'">⭐ '+V.stars+'</button>'+(cur?'<em>активен ещё '+Math.ceil((S.vipUntil-NOW())/864e5)+' дн.</em>':"")+'</div>'}).join("")+'</div><p class="gnote">Обычно — '+SPINS_MAX+' прокруток каждые 4 часа. Купишь VIP, пока активен прошлый, — дни сложатся, а статус станет выше.</p>'+
   '<div class="ghd err">🖨 ОШИБКА ПЕЧАТИ</div><p class="gnote">Бракованный тираж: цвета сбились при печати. Только за звёзды, в кейсе не выпадают. Всего от 10 до 50 штук на весь мир.</p><div class="gg3">'+ERR_GIFTS.map(card).join("")+'</div>'+
   '<div class="ghd">⭐ Подарки Эпох</div><div class="gg3">'+STAR_GIFTS.map(card).join("")+'</div>'+
   '<div class="ghd">🍀 Серия «Удача»</div><p class="gnote">Их можно купить за звёзды или выбить в кейсе в Казино. А ещё в кейсе (10 000 💠) иногда падают Свиток, Зелье, Топор, Самоцвет, Колесо, Око и даже Корона Эпох — 1 на 100 000.</p><div class="gg3">'+LUCK_GIFTS.map(card).join("")+'</div>'};
$("gold-body").addEventListener("click",e=>{const t=e.target.closest("button");if(!t||t.disabled)return;
  if(t.dataset.vip)buyItem({item:"vip",t:+t.dataset.vip});else if(t.dataset.gk)buyItem({item:"gift",k:t.dataset.gk});else if(t.dataset.shelf)openShelf();else if(t.dataset.cas)openCas("case")});
const _payShow=payShow;
payShow=function(r){if(r&&r.status==="done"&&r.item==="gift"&&r.res&&r.res.gift&&giftFor&&Date.now()-giftFor.t<6e5){const T=giftFor,g=r.res.gift;giftFor=null;
    act("gift_send",{id:g.id,to:T.uid}).then(x=>{if(x){sfx.fanfare();burst(4);hapN("success");toast("🎁 «"+GIFTS[g.k].n+"» "+gNo(g)+" подарен игроку "+x.name+"!");try{refreshOther()}catch(e){}}else{renderAll();toast("Подарок у тебя — подари его из своей витрины")}});return}
  if(r&&r.status==="done"&&r.item==="gift"&&r.res&&r.res.gift){renderAll();loadGold();const g=r.res.gift;wReveal(g,"🎁 "+GIFTS[g.k].n,"Подарок твой! Поставь его на витрину или подари другу",'<button type="button" class="craftbtn" data-put="'+g.id+'">🏛 Поставить на витрину</button>');return}
  if(r&&r.status==="done"&&r.item==="vip"){renderAll();sfx.fanfare();burst(4);hapN("success");const V=VIP_T[(r.res&&r.res.t)||1];toast(V.ic+" "+V.n+" включён! "+V.sp+" прокруток каждые 4 часа");loadGold();return}
  if(r&&r.status==="done"&&r.item==="golem"){renderAll();sfx.fanfare();hapN("success");toast("🗿 Голем в лагере! Энергия ×2 и восстанавливается в 2 раза быстрее");if(!$("sec-camp").hidden)renderCamp();return}
  return _payShow(r)};

/* ---------- витрина подарков ---------- */
function shelfHTML(o){const by={};(o.shelf||[]).forEach(g=>by[g.shelf]=g);let rows="";
  for(let r=0;r<3;r++){rows+='<div class="shf">';for(let c=1;c<=3;c++){const i=r*3+c,g=by[i];
    if(g){const G=GIFTS[g.k];rows+='<button type="button" class="xsl'+(G.r>=4?" myth":"")+'" style="--g:'+G.g+'" data-slot="'+i+'" data-gid="'+g.id+'"><div class="ray"></div><div class="halo"></div><div class="ic">'+giftSVG(g.k,72)+'</div><div class="ped"></div><span class="no">'+gNo(g)+'</span></button>'}
    else rows+=o.mine?'<button type="button" class="xsl empty" data-slot="'+i+'">＋<small>поставить</small></button>':'<div class="xsl empty ro"></div>'}rows+='</div>'}
  return '<div class="wsh"><div class="top"><div class="ava">'+portrait(o.h,o.card||null)+'</div><div><div class="nk"></div><div class="tt">'+fmtN(o.gn)+' '+plural(o.gn,"подарок","подарка","подарков")+'</div></div></div>'+
   '<div class="stats"><div>'+(o.shelf||[]).length+' / '+SHELF_N+'<small>на витрине</small></div><div>⭐ '+fmtN(o.gval)+'<small>стоимость</small></div><div>'+(o.grank?"#"+o.grank:"—")+'<small>в топе витрин</small></div></div>'+
   '<h4>🏛 ВИТРИНА <span>👁 '+fmtN(o.gv||0)+'</span></h4><div class="cab"><div class="gls"></div>'+rows+'</div>'+(o.extra||"")+'</div>'}
let shTop=null;
async function openShelf(){if(!$("modal").hidden)closeModal();setTab("prof");const sh=$("prof-body");if(!ONLINE){sh.innerHTML='<p class="prof-off">Профиль и витрина работают в игре через бота</p>';return}
  if(!sh.firstChild)sh.innerHTML='<p class="prof-off">Загружаю витрину…</p>';else drawShelf();const t=await act("gift_top");if(t)shTop=t;drawShelf()}
function drawShelf(){const sh=$("prof-body");if($("sec-prof").hidden)return;const gs=S.gifts||[],T=(shTop&&shTop.top)||[],rank=T.findIndex(r=>r.uid===S.uid)+1,best=[...S.cards].sort((a,b)=>b.v-a.v)[0];
  const inv=gs.length?'<div class="winv">'+gs.map(g=>'<button type="button" style="--g:'+GIFTS[g.k].g+'" class="'+(g.shelf?"on":"")+'" data-inv="'+g.id+'">'+giftSVG(g.k,52)+'<span>'+gNo(g)+'</span></button>').join("")+'</div>':'<div class="emp">Подарков пока нет. Купи в Сокровищнице, выбей в кейсе или попроси друга подарить 😉</div>';
  const top='<div class="gtop">'+(T.length?T.slice(0,10).map((r,i)=>'<div class="cpt'+(r.uid===S.uid?" me":"")+'" data-u="'+r.uid+'"><i>'+(i<3?["🥇","🥈","🥉"][i]:i+1)+'</i><span></span><b>⭐ '+fmtN(r.s)+'</b></div>').join(""):'<div class="emp">Пока пусто — стань первым!</div>')+'</div>';
  sh.innerHTML=shelfHTML({mine:1,shelf:gs.filter(g=>g.shelf>0),gn:gs.length,gval:gs.reduce((a,g)=>a+giftVal(g.k),0),grank:rank,gv:S.gv,h:best?best.h:0,card:best,
    extra:'<div class="wsbtns pro"><button type="button" id="pf-nick">✏️ Ник</button><button type="button" id="pf-ttl">🎖 Титулы</button><button type="button" id="pf-top">🏆 Топ</button></div><p class="note">Нажми «＋», чтобы поставить подарок, или на подарок, чтобы убрать или подарить</p><div class="wsbtns"><button type="button" class="wsb1" id="ws-send">🎁 ПОДАРИТЬ</button><button type="button" class="wsb2" id="ws-shop">⭐ МАГАЗИН</button></div>'+
    '<h4 style="margin-top:14px">🎒 ВСЕ ПОДАРКИ <span>'+gs.length+'</span></h4>'+inv+'<h4 style="margin-top:14px">🏆 ТОП ВИТРИН</h4>'+top})+'';
  sh.querySelector(".nk").textContent=myName();sh.querySelectorAll(".gtop .cpt").forEach((d,i)=>fxName(d.querySelector("span"),"",T[i].name,T[i].uid));
  $("ws-shop").onclick=()=>openGold("gifts");$("pf-nick").onclick=()=>$("nick-go").click();$("pf-ttl").onclick=()=>$("ttl-go").click();$("pf-top").onclick=()=>setTab("top");$("ws-send").onclick=()=>sendHelp(null);
  sh.querySelector(".wsh").onclick=async e=>{const b=e.target.closest("button");if(!b)return;
    if(b.dataset.u){const u=+b.dataset.u;if(u!==S.uid){closeModal();openParam("u_"+u)}return}
    const tr=e.target.closest(".cpt[data-u]");if(tr&&+tr.dataset.u!==S.uid){closeModal();openParam("u_"+tr.dataset.u);return}
    if(b.dataset.gid||b.dataset.inv)return giftMenu(+(b.dataset.gid||b.dataset.inv));
    if(b.dataset.slot){const free=gs.filter(g=>!g.shelf);if(!free.length){toast(gs.length?"Все подарки уже на витрине":"Сначала добудь подарок");return}
      wSheet('<h3>Что поставить на полку?</h3><div class="winv">'+free.map(g=>'<button type="button" style="--g:'+GIFTS[g.k].g+'" data-pick="'+g.id+'">'+giftSVG(g.k,52)+'<span>'+gNo(g)+'</span></button>').join("")+'</div>',
        bb=>{if(!bb.dataset.pick)return false;act("gift_shelf",{id:+bb.dataset.pick,slot:+b.dataset.slot}).then(r=>{if(r){hap("medium");drawShelf()}})})}};
  sh.querySelector(".gtop").addEventListener("click",e=>{const d=e.target.closest(".cpt[data-u]");if(d&&+d.dataset.u!==S.uid){closeModal();openParam("u_"+d.dataset.u)}})}
function giftMenu(id){const g=(S.gifts||[]).find(x=>x.id===id);if(!g)return;const G=GIFTS[g.k];
  wSheet('<div style="display:flex;justify-content:center">'+giftSVG(g.k,110)+'</div><h3 style="text-align:center;margin:4px 0 0">'+G.n+'</h3><p style="text-align:center;margin:2px 0 10px;font-weight:800">'+gNo(g)+' · '+GR[G.r].toLowerCase()+(G.luck?" · серия «Удача»":"")+(g.how==="case"?" · из кейса":"")+(g.from_uid?" · подарок от друга":"")+'</p>'+
    (g.shelf?'<button type="button" class="craftbtn" data-off="1">Убрать с витрины</button>':'<button type="button" class="craftbtn" data-on="1">🏛 Поставить на витрину</button>')+'<button type="button" class="craftbtn" data-gift="1" style="margin-top:8px;background:linear-gradient(180deg,#ff8fb0,#ff2e63);color:#fff">🎁 Подарить другу</button>',
    b=>{if(b.dataset.off)act("gift_shelf",{id,slot:0}).then(r=>{if(r)drawShelf()});else if(b.dataset.on)putOnShelf(id).then(r=>{if(r)drawShelf()});else if(b.dataset.gift)sendHelp(id);else return false})}
/* кому подарить: друзья, чьи витрины ты открывал. Ещё можно открыть витрину игрока в топе и нажать «Подарить» */
function sendHelp(id){const F=friendsGet(),fr=Object.keys(F).filter(n=>/^u_\d+/.test(F[n].p||"")).sort((a,b)=>F[b].t-F[a].t).slice(0,12);
  wSheet('<h3>Кому подарить?</h3><p style="font-size:13px;margin:0 0 8px">Открой витрину игрока (нажми на него в топе или в чате) и нажми «🎁 Подарить». Недавние:</p>'+(fr.length?fr.map(n=>'<button type="button" class="ghost" data-fp="'+F[n].p+'" style="display:block;width:100%;margin-bottom:6px"></button>').join(""):'<p style="font-size:13px;color:#5a5f80">Ты ещё не открывал чужие витрины</p>'),
    b=>{if(!b.dataset.fp)return false;closeModal();openParam(b.dataset.fp).then(()=>{if(id)giftTo(id)})});
  document.querySelectorAll(".wsheet [data-fp]").forEach((b,i)=>b.textContent="🏛 "+fr[i])}
let shOther=null;
let giftFor=null;
function giftBuyFor(F){const L=(goldData&&goldData.gleft)||{};const ks=Object.keys(GIFTS).filter(k=>GIFTS[k].stars&&L[k]!==0).sort((a,b)=>GIFTS[a].stars-GIFTS[b].stars);
  wSheet('<h3>🎁 Купить подарок для <span class="wto"></span></h3><p style="font-size:13px;margin:0 0 8px">Выбери подарок — после оплаты он сразу уйдёт игроку, а бот ему напишет</p><div class="winv">'+ks.map(k=>'<button type="button" style="--g:'+GIFTS[k].g+'" data-bk="'+k+'">'+giftSVG(k,52)+'<span>⭐ '+GIFTS[k].stars+'</span></button>').join("")+'</div>',
    b=>{if(!b.dataset.bk)return false;giftFor={uid:F.uid,name:F.name,t:Date.now()};buyItem({item:"gift",k:b.dataset.bk})});
  document.querySelector(".wsheet .wto").textContent=F.name}
function giftTo(id){if(!shOther)return;const F=shOther,gs=(S.gifts||[]);if(!gs.length){giftBuyFor(F);return}
  const pickOne=gid=>{const g=gs.find(x=>x.id===gid),G=GIFTS[g.k];
    wSheet('<div style="display:flex;justify-content:center">'+giftSVG(g.k,96)+'</div><h3 style="text-align:center">Подарить «'+G.n+'» '+gNo(g)+'?</h3><p style="text-align:center;font-size:13px;margin:0 0 10px">Игрок: <b class="wto"></b>. Вернуть подарок будет нельзя.</p><button type="button" class="craftbtn" data-ok="1">🎁 Подарить</button>',
      b=>{if(!b.dataset.ok)return false;act("gift_send",{id:gid,to:F.uid}).then(r=>{if(r){sfx.fanfare();hapN("success");toast("🎁 Подарок отправлен игроку "+r.name+"!");refreshOther()}})});
    document.querySelector(".wsheet .wto").textContent=F.name};
  if(id)return pickOne(id);
  wSheet('<h3>Что подарить?</h3><div class="winv">'+gs.map(g=>'<button type="button" style="--g:'+GIFTS[g.k].g+'" data-pick="'+g.id+'">'+giftSVG(g.k,52)+'<span>'+gNo(g)+'</span></button>').join("")+'</div><button type="button" class="craftbtn" data-newg="1" style="margin-top:10px">⭐ Купить новый подарок для него</button>',b=>{if(b.dataset.newg){setTimeout(()=>giftBuyFor(F),50);return}if(!b.dataset.pick)return false;setTimeout(()=>pickOne(+b.dataset.pick),50)})}
async function refreshOther(){if(!shOther)return;const r=await act("profile",{uid:shOther.uid});if(r&&!$("modal").hidden)openShowcase(Object.assign(r,{p:shOther.p}))}
const _openShowcase=openShowcase;
openShowcase=function(F){_openShowcase(F);if(!F||F.shelf==null)return;shOther=F;const sh=$("msheet"),who=sh.querySelector(".who");
  const w=document.createElement("div");w.innerHTML=shelfHTML({shelf:F.shelf,gn:F.gn,gval:F.gval,grank:F.grank,gv:F.gv,h:F.cards[0]?F.cards[0].h:0,card:F.cards[0],
    extra:'<div class="wsbtns"><button type="button" class="wsb1" id="ws-give">🎁 ПОДАРИТЬ</button></div>'+(F.shelf.length?"":'<p class="note">Витрина пока пустая</p>')});
  const box=w.firstChild;box.querySelector(".nk").textContent=F.name;who.after(box);
  box.onclick=e=>{const b=e.target.closest("[data-gid]");if(b){const g=F.shelf.find(x=>x.id===+b.dataset.gid),G=GIFTS[g.k];wSheet('<div style="display:flex;justify-content:center">'+giftSVG(g.k,120)+'</div><h3 style="text-align:center;margin:4px 0">'+G.n+'</h3><p style="text-align:center;font-weight:800;margin:0 0 10px">'+gNo(g)+' · '+GR[G.r].toLowerCase()+(G.luck?" · серия «Удача»":"")+'</p>')}};
  $("ws-give").onclick=()=>giftTo(null)};

/* ---------- казино рун ---------- */
let csTab="case",csBet=1000,csBusy=false;
function openCas(t){if(!ONLINE){toast("Казино работает в игре через бота");return}if(t)csTab=t;campFlush();setTab("cas");renderCas()}
function casK(){const K=S.cas||{};return K.d===new Date(Date.now()+3*3600e3).toISOString().slice(0,10)?K:{n:0,cs:0}}
function csBal(){$("cs-ru").textContent=fmtN(campView().runes);const K=casK();$("cs-day").innerHTML="руны для игры<br>в казино"}
const PRZ=CASE.p.map(([p,P])=>P.g?{g:P.g,c:GR_C[GIFTS[P.g].r],p}:P.r===0?{r:0,e:1,c:"#4a4a5a",p}:{r:P.r,c:P.r>=3e4?"#bf5af2":P.r>=15e3?"#0a84ff":P.r>=8e3?"#34c759":"#8f9bb3",p});
const csTile=x=>x.e?'<div class="itc empty" style="--c:#4a4a5a"><span style="font-size:40px">💨</span><span class="rn">Пусто</span></div>':x.g?'<div class="itc" style="--c:'+x.c+'">'+giftSVG(x.g,64)+'<span>'+GIFTS[x.g].n+'</span></div>':'<div class="itc" style="--c:'+x.c+'"><span style="font-size:40px">💠</span><span class="rn">+'+fmtN(x.r)+'</span></div>';
const rollPrz=()=>{let x=Math.random();for(const z of PRZ){if(x<z.p)return z;x-=z.p}return PRZ[0]};
function renderCas(){if(!S||$("sec-cas").hidden)return;csBal();document.querySelectorAll("#cs-seg button").forEach(b=>b.setAttribute("aria-pressed",b.dataset.c===csTab));const B=$("cs-body"),K=casK();
  const bets='<div class="cs-bets" id="cs-bets">'+[1e3,5e3,1e4,25e3,5e4].map(b=>'<button type="button" data-bet="'+b+'" aria-pressed="'+(b===csBet)+'">'+(b>=1e3?b/1e3+"K":b)+'</button>').join("")+'</div>';
  if(csTab==="case"){const prev=[];for(let i=0;i<12;i++)prev.push(PRZ[[0,3,1,0,4,2,0,5,1,3,0,6][i]]);
    B.innerHTML='<div class="cs-box"><h3>📦 КЕЙС «УДАЧА»</h3><div class="sub">Руны до 30 000, редкие подарки с тиражом, а бывает и пусто. Самый мизерный шанс — Корона Эпох</div><div class="cs-chest">'+chestSVG("legend",150)+'</div>'+
      '<div class="cs-strip" id="cs-strip"><div class="tr" id="cs-tr">'+prev.map(csTile).join("")+'</div><div class="vig"></div><div class="cs-ptr"></div></div>'+
      '<button type="button" class="cs-go" id="cs-open"'+((K.cs||0)>=CASE.day?" disabled":"")+'>'+((K.cs||0)>=CASE.day?"НА СЕГОДНЯ ВСЁ":"ОТКРЫТЬ · "+fmtN(CASE.price)+" 💠")+'</button>'+
      '<details class="cs-odds"><summary>Шансы — всё честно</summary><table>'+PRZ.map(z=>'<tr><td>'+(z.e?"💨 Пусто":z.g?"🎁 "+GIFTS[z.g].n+" ("+GR[GIFTS[z.g].r].toLowerCase()+", тираж "+GIFTS[z.g].run+")":"💠 +"+fmtN(z.r)+" рун")+'</td><td>'+(z.p*100).toLocaleString("ru",{maximumFractionDigits:3})+'%</td></tr>').join("")+'</table><p>Если тираж подарка закончился, вместо него +'+fmtN(CASE.sold)+' рун.</p></details></div>';
    $("cs-open").onclick=caseOpen}
  if(csTab==="slot"){B.innerHTML='<div class="cs-box"><h3>🎰 СЛОТЫ ЭПОХ</h3><div class="sub">Три в ряд — большой выигрыш. Пара — ×'+String(SLOT.pair[1]).replace(".",",")+'</div>'+
      '<div class="slm">'+[0,1,2].map(i=>'<div class="slr" id="sl'+i+'"><div class="st"><div>'+["💎","👑","⚔️"][i]+'</div></div></div>').join("")+'</div><div class="slres" id="sl-res"></div>'+bets+
      '<button type="button" class="cs-go" id="cs-slgo">КРУТИТЬ · '+fmtN(csBet)+' 💠</button>'+
      '<details class="cs-odds"><summary>Выплаты и шансы</summary><table>'+SLOT.t.map(([p,s,k])=>'<tr><td>'+s+s+s+' ×'+k+'</td><td>'+(p*100).toLocaleString("ru")+'%</td></tr>').join("")+'<tr><td>любая пара ×'+String(SLOT.pair[1]).replace(".",",")+'</td><td>'+SLOT.pair[0]*100+'%</td></tr></table><p>В среднем возвращается около 90% ставок.</p></details></div>';
    $("cs-slgo").onclick=slotGo}
  if(csTab==="hl"){const H=K.hl;
    B.innerHTML='<div class="cs-box"><h3>🃏 БОЛЬШЕ ИЛИ МЕНЬШЕ</h3><div class="sub">Угадай, следующая карта старше или младше. Каждая угаданная умножает выигрыш. Забирай когда хочешь</div>'+
      '<div class="hlc"><div class="hcard'+(H?"":" back")+'" id="hl-c">'+(H?hlFace(H.c):"")+'</div><div class="hlm" id="hl-m">'+(H?"ставка "+fmtN(H.b)+"<b>×"+String(H.m).replace(".",",")+"</b>"+(H.s?"угадано: "+H.s:"угадай первую"):"сделай ставку")+'</div></div>'+
      (H?'<div class="hlb"><button type="button" class="up" data-dir="up"'+(hlP(H.c,"up")<=0?" disabled":"")+'>⬆ БОЛЬШЕ<small>'+hlNext(H,"up")+'</small></button><button type="button" class="dn" data-dir="down"'+(hlP(H.c,"down")<=0?" disabled":"")+'>⬇ МЕНЬШЕ<small>'+hlNext(H,"down")+'</small></button></div>'+
        '<button type="button" class="cs-go" id="hl-take"'+(H.s?"":" disabled")+'>'+(H.s?"ЗАБРАТЬ "+fmtN(Math.floor(H.b*H.m))+" 💠":"сначала угадай одну карту")+'</button>'
       :bets+'<button type="button" class="cs-go" id="hl-go">НАЧАТЬ · '+fmtN(csBet)+' 💠</button>')+
      '<details class="cs-odds"><summary>Как считается</summary><p>Чем меньше шанс угадать, тем больше множитель. Одинаковая карта — проигрыш. В среднем возвращается 95% на каждом шаге.</p></details></div>';
    if(H){B.querySelectorAll("[data-dir]").forEach(b=>b.onclick=()=>hlGo(b.dataset.dir));$("hl-take").onclick=hlTake}else $("hl-go").onclick=hlStart}
  const bb=$("cs-bets");if(bb)bb.onclick=e=>{const b=e.target.closest("[data-bet]");if(!b)return;csBet=+b.dataset.bet;renderCas()}}
$("cs-seg").onclick=e=>{const b=e.target.closest("[data-c]");if(!b||csBusy)return;csTab=b.dataset.c;renderCas()};
$("cs-back").onclick=()=>{if(!csBusy)openCamp()};$("cs-entry").onclick=()=>openCas();
async function caseOpen(){if(csBusy)return;if(campView().runes<CASE.price){toast("Нужно ещё "+fmtN(CASE.price-campView().runes)+" рун — потренируйся в лагере");return}
  csBusy=true;$("cs-open").disabled=true;const r=await act("cas_case");if(!r){csBusy=false;renderCas();return}csHide=r.r||0;updCash();csBal();
  const won=r.g?PRZ.find(z=>z.g===r.g.k):r.sold?(PRZ.find(z=>z.r===CASE.sold)||PRZ[1]):PRZ.find(z=>!z.g&&z.r===r.r)||PRZ[0];const N=48,W=42,items=[];for(let i=0;i<N;i++)items.push(i===W?won:rollPrz());
  const tr=$("cs-tr"),st=$("cs-strip");tr.style.transition="none";tr.style.transform="translateX(0)";tr.innerHTML=items.map(csTile).join("");void tr.offsetWidth;
  const sw=st.getBoundingClientRect().width,tw=106,target=W*tw+50-sw/2+Math.round((Math.random()-.5)*60);
  tr.style.transition="transform 5.6s cubic-bezier(.08,.6,.12,1)";tr.style.transform="translateX(-"+target+"px)";csLast={html:tr.innerHTML,x:"translateX(-"+target+"px)",w:W};let last=-1;
  const tick=()=>{if(!csBusy)return;const m=new DOMMatrix(getComputedStyle(tr).transform),i=Math.floor((-m.m41+sw/2)/tw);if(i!==last){last=i;tone(900+Math.random()*200,.025,"square",.03);hap("light")}requestAnimationFrame(tick)};tick();
  setTimeout(()=>{csBusy=false;csHide=0;updCash();if(r.g){wReveal(r.g,"🎁 "+GIFTS[r.g.k].n,GIFTS[r.g.k].r>=4?"НЕВЕРОЯТНО! Из кейса!":"Выпал из кейса «Удача»!",'<button type="button" class="craftbtn" data-put="'+r.g.id+'">🏛 Поставить на витрину</button>')}
    else if(!r.r){hap("light");toast("💨 Пусто. Повезёт в следующий раз!")}
    else{sfx.coin();hapN("success");toast((r.sold?"Тираж «"+GIFTS[r.sold].n+"» закончился — ":"")+"+"+fmtN(r.r)+" рун 💠");const R=st.getBoundingClientRect();boom(R.left+R.width/2,R.top+R.height/2,won.c)}renderCas()},5900)}
let boomFx=null;function boom(x,y,c){if(!boomFx){const cv=document.createElement("canvas");cv.style.cssText="position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:250";document.body.append(cv);boomFx=wFx(cv)}boomFx.fit();boomFx.burst(x,y,60,[c,"#fff","#ffd23f","#7fe7ff"],8,.15,70,5)}
async function slotGo(){if(csBusy)return;if(campView().runes<csBet){toast("Не хватает рун на ставку");return}csBusy=true;$("cs-slgo").disabled=true;$("sl-res").textContent="";$("sl-res").className="slres";
  const r=await act("cas_slot",{bet:csBet});if(!r){csBusy=false;renderCas();return}csHide=r.win||0;updCash();csBal();setTimeout(()=>{csHide=0;updCash()},2200);const sym=SLOT.sym,res=$("sl-res");
  [0,1,2].forEach(i=>{const el=$("sl"+i),s=el.querySelector(".st"),n=16+i*6,list=[];el.classList.remove("win");for(let k=0;k<n;k++)list.push(sym[Math.floor(Math.random()*sym.length)]);list.push(r.reels[i]);
    s.style.transition="none";s.style.transform="translateY(0)";s.innerHTML=list.map(x=>"<div>"+x+"</div>").join("");void s.offsetWidth;
    s.style.transition="transform "+(1.1+i*.45)+"s cubic-bezier(.2,.7,.2,1.04)";s.style.transform="translateY(-"+(n*110)+"px)";setTimeout(()=>{tone(300+i*120,.06,"square",.05);hap("medium")},(1.1+i*.45)*1000)});
  setTimeout(()=>{csBusy=false;if(r.win){res.className="slres w";res.textContent=(r.m>=8?"🔥 ДЖЕКПОТ! ":"")+"+"+fmtN(r.win)+" 💠 (×"+String(r.m).replace(".",",")+")";
      const same=r.reels.map((x,i)=>r.reels.filter(y=>y===x).length>1?i:-1).filter(i=>i>=0);same.forEach(i=>$("sl"+i).classList.add("win"));
      sfx.coin();hapN("success");const R=$("sl1").getBoundingClientRect();boom(R.left+R.width/2,R.top+R.height/2,r.m>=8?"#ff9f0a":"#ffd23f");if(r.m>=8)setTimeout(()=>sfx.fanfare(),200)}
    else{res.textContent="Мимо. Ещё разок?"}csBal();$("cs-slgo").disabled=false},2200)}
const HLR=["","A","2","3","4","5","6","7","8","9","10","J","Q","K"],HLS=["♥","♦","♠","♣"];
function hlFace(c){const s=HLS[(c*7)%4];return '<b>'+HLR[c]+'</b><i>'+s+'</i><b>'+HLR[c]+'</b>'}
function hlNext(H,dir){const p=hlP(H.c,dir);if(p<=0)return "нельзя";const m=Math.min(HL.cap,H.m*HL.k/p);return "×"+m.toFixed(2).replace(".",",")+" · "+Math.round(p*100)+"%"}
function hlCard(c){const e=$("hl-c");e.className="hcard flip"+(HLS[(c*7)%4]==="♠"||HLS[(c*7)%4]==="♣"?" bk":"");e.innerHTML=hlFace(c)}
async function hlStart(){if(csBusy)return;if(campView().runes<csBet){toast("Не хватает рун на ставку");return}csBusy=true;const r=await act("cas_hl_go",{bet:csBet});csBusy=false;if(r){tone(600,.05,"square",.04);renderCas();hlCard(r.hl.c)}else renderCas()}
async function hlGo(dir){if(csBusy)return;csBusy=true;const r=await act("cas_hl",{dir});csBusy=false;if(!r){renderCas();return}
  if(r.win){renderCas();hlCard(r.n);sfx.coin();hap("medium");const R=$("hl-c").getBoundingClientRect();boom(R.left+R.width/2,R.top+R.height/2,"#47e891")}
  else{hlCard(r.n);hapN("error");$("hl-m").innerHTML="Не угадал 😬<b>−"+fmtN(r.lost)+"</b>";B_dis();setTimeout(renderCas,1500)}}
function B_dis(){document.querySelectorAll("#cs-body .hlb button,#hl-take").forEach(b=>b.disabled=true)}
async function hlTake(){if(csBusy)return;csBusy=true;const r=await act("cas_hl_take");csBusy=false;if(r){sfx.coin();hapN("success");toast("+"+fmtN(r.win)+" рун 💠");const R=$("hl-c").getBoundingClientRect();boom(R.left+R.width/2,R.top+R.height/2,"#ffd23f")}renderCas()}

/* ---------- голем ---------- */
const GOLEM_SVG='<svg viewBox="0 0 100 100" width="62" height="62" aria-hidden="true"><defs><radialGradient id="gmg" cx=".35" cy=".3"><stop offset="0" stop-color="#e8edf5"/><stop offset=".6" stop-color="#8f9bb3"/><stop offset="1" stop-color="#3a4258"/></radialGradient></defs><g stroke="#0d1030" stroke-width="3" stroke-linejoin="round"><rect x="26" y="42" width="48" height="42" rx="10" fill="url(#gmg)"/><rect x="30" y="14" width="40" height="30" rx="10" fill="url(#gmg)"/><rect x="36" y="24" width="10" height="8" rx="3" fill="#7fe7ff"/><rect x="54" y="24" width="10" height="8" rx="3" fill="#7fe7ff"/><rect x="10" y="46" width="16" height="28" rx="7" fill="url(#gmg)"/><rect x="74" y="46" width="16" height="28" rx="7" fill="url(#gmg)"/><path d="M50 14 V6"/><circle cx="50" cy="5" r="4" fill="#ff2e63"/><rect x="40" y="54" width="20" height="14" rx="4" fill="#ffd23f"/></g><circle cx="41" cy="28" r="7" fill="#7fe7ff" opacity=".4"/><circle cx="59" cy="28" r="7" fill="#7fe7ff" opacity=".4"/></svg>';
function drawGolem(){const b=$("cp-golem");if(!b)return;if(!ONLINE||!S.shopOn){b.hidden=true;return}b.hidden=false;const u=S.golemUntil||0,on=u>NOW(),V=campView();b.classList.toggle("on",on);
  b.innerHTML='<div class="gb">'+GOLEM_SVG+'</div><div><b>🗿 КАМЕННЫЙ ГОЛЕМ'+(on?" · РАБОТАЕТ":"")+'</b><small>'+(on?"Энергия ×2 ("+V.mx+") и восстанавливается в 2 раза быстрее. "+(u>=9e15?"Навсегда!":"До "+new Date(u).toLocaleDateString("ru")):"Энергии в 2 раза больше и она восстанавливается в 2 раза быстрее. Больше ударов — больше рун")+'</small></div>'+
    (on&&u>=9e15?"":'<div class="gbt"><button type="button" data-gw="0">⭐ '+GOLEM.w+' · '+(on?"+7 дней":"неделя")+'</button><button type="button" class="alt" data-gw="1">⭐ '+GOLEM.f+' · навсегда</button></div>')}
$("cp-golem").onclick=e=>{const t=e.target.closest("[data-gw]");if(t)buyItem({item:"golem",forever:+t.dataset.gw})};
const _renderCamp=renderCamp;renderCamp=function(light){_renderCamp(light);if(!light&&!$("sec-camp").hidden)drawGolem()};

/* ---------- 3D-эффекты лагеря: ударная волна, искры на холсте, крит со вспышкой ---------- */
let w3=null;
const _campFx=campFx;campFx=function(x,y,big){const ar=$("cp-ar"),r=ar.getBoundingClientRect(),lx=x-r.left,ly=y-r.top;
  if(!w3){w3=wFx($("w3fx"))}else if(Math.abs($("w3fx").width-r.width*Math.min(2,devicePixelRatio||1))>2)w3.fit();
  const sl=document.createElementNS("http://www.w3.org/2000/svg","svg");sl.setAttribute("viewBox","0 0 100 100");sl.setAttribute("class","cp-slash");sl.style.left=lx+"px";sl.style.top=ly+"px";sl.style.setProperty("--r",(Math.random()*120-60)+"deg");
  sl.innerHTML='<path d="M8 70 Q50 -6 92 34" fill="none" stroke="#fff" stroke-width="'+(big?12:8)+'" stroke-linecap="round" opacity=".95"/><path d="M14 66 Q50 6 86 36" fill="none" stroke="#ffd60a" stroke-width="3" stroke-linecap="round"/>';ar.append(sl);setTimeout(()=>sl.remove(),300);
  const s=document.createElement("i");s.className="w3shock";s.style.left=lx+"px";s.style.top=ly+"px";ar.append(s);setTimeout(()=>s.remove(),460);
  w3.burst(lx,ly,big?26:14,big?["#fff6c8","#ffd23f","#ff9f0a","#ff2e63"]:["#fff6c8","#ffd23f","#7fe7ff"],big?8:5.5,.25,big?50:36,big?5:4)};
const _campFloat=campFloat;campFloat=function(t,cls,x,y){_campFloat(t,cls,x,y);if(cls==="crit"){const ar=$("cp-ar");if(!ar)return;const f=document.createElement("div");f.className="w3flash";ar.append(f);setTimeout(()=>f.remove(),360);
  const c=document.createElement("div");c.className="w3crit";c.textContent=t.replace("💥 ","")+"!";ar.append(c);setTimeout(()=>c.remove(),820);if(w3){const r=ar.getBoundingClientRect();w3.burst(r.width*.62,r.height*.5,50,["#fff6c8","#ffd23f","#ff9f0a","#ff2e63"],9,.25,60,6)}}};

/* ---------- что нового и ссылки ---------- */
function newsGifts(){return true;if(!S||!ONLINE||!S.shopOn||!$("modal").hidden||document.querySelector(".wrev,.onb-hl"))return false;try{if(localStorage.getItem("we-news-upd3"))return true;if(termsNeed())return false;localStorage.setItem("we-news-upd3","1")}catch(e){return true}
  const m=$("modal"),sh=$("msheet");m.hidden=false;
  sh.innerHTML='<div class="box nickbox newsb"><h3>🔥 Крупное обновление!</h3><div style="display:flex;justify-content:center;gap:4px">'+giftSVG("crown_x",84)+giftSVG("egg",84)+giftSVG("cup",84)+'</div><ul>'+
   '<li>🎁 <b>Подарки</b> — 25 подарков, у каждого свой тираж и номер навсегда</li><li>🖨 <b>Ошибка печати</b> — бракованные подарки, всего 10–50 штук на весь мир</li>'+
   '<li>👤 <b>Профиль</b> — твоя витрина на 9 подарков, топ витрин, дари друзьям</li><li>🎰 <b>Казино</b> — кейс как в CS:GO, слоты и «больше-меньше»</li><li>🗿 <b>Каменный голем</b> — энергии ×2 в лагере (вкладка «Бой»)</li></ul><div class="ng-teas">⚡ <b>Завтра — крупный розыгрыш!</b> Главный приз связан с игрой «Номерок» — и он в прямом смысле очень крутой 😏</div>'+
   '<button type="button" class="craftbtn" id="ng-go">Смотреть подарки</button><button type="button" class="ghost" id="ng-x">Позже</button></div>';
  $("ng-go").onclick=()=>{closeModal();openGold("gifts")};$("ng-x").onclick=closeModal;return true}
{let n=0;const t=setInterval(()=>{if(++n>30||newsGifts())clearInterval(t)},4000)}
if(new URLSearchParams(location.search).get("shelf"))setTimeout(()=>{try{openShelf()}catch(e){}},1200);
$("shelf-go").onclick=()=>openShelf();

/* ---------- соглашение: без согласия играть нельзя. Принятие сохраняется на сервере с датой и номером редакции ---------- */
const TERMS_V=1;
function termsNeed(){if(!S||!S.nick)return false;if(ONLINE)return S.termsV!=null&&S.termsV<TERMS_V;try{return +(localStorage.getItem("we-terms")||0)<TERMS_V}catch(e){return false}}
let termsOn=false;
async function termsGate(){if(termsOn||!(termsNeed()||termsGateForce&&S&&ONLINE&&S.termsV!=null&&S.termsV<TERMS_V))return;termsGateForce=false;termsOn=true;const d=document.createElement("div");d.className="terms";
  d.innerHTML='<div class="tbox"><h3>📜 Перед игрой</h3><p class="tl">Прочитай и прими пользовательское соглашение и политику конфиденциальности. Коротко:</p><ul class="tsum">'+
   '<li>💠 Карточки, монеты 🪙, руны и подарки — игровые ценности. Их нельзя вывести или обменять на деньги</li><li>⭐ Покупки за Telegram Stars выдаются сразу и не возвращаются (кроме технической ошибки)</li>'+
   '<li>🎰 Казино — только на руны из игры. Это развлечение, а не игра на деньги</li><li>🚫 Боты, мультиаккаунты, накрутки и баги — бан без компенсации</li><li>🎁 В розыгрышах решение администрации окончательное</li><li>🔒 Мы храним только твой Telegram ID, имя и игровые данные и никому их не продаём</li></ul>'+
   '<div class="tdoc" id="tdoc">Загружаю текст…</div><label class="tchk"><input type="checkbox" id="t-ok"> <span>Я прочитал(а) и принимаю соглашение и политику конфиденциальности. Если мне нет 18 лет, мои родители (законные представители) согласны</span></label>'+
   '<button type="button" class="craftbtn" id="t-go" disabled>Принимаю</button><a class="tlink" href="terms.html" target="_blank" rel="noopener">Открыть полный текст отдельно</a></div>';
  document.body.append(d);
  try{const r=await fetch("terms.html?v="+TERMS_V,{cache:"no-cache"}),h=await r.text(),x=new DOMParser().parseFromString(h,"text/html").querySelector("#terms");$("tdoc").innerHTML="";$("tdoc").append(...x.childNodes)}catch(e){$("tdoc").textContent="Не получилось загрузить текст. Нажми «Открыть полный текст отдельно»."}
  d.querySelector(".tlink").onclick=e=>{if(tg&&tg.openLink){e.preventDefault();tg.openLink(new URL("terms.html",location.href).href)}};
  $("t-ok").onchange=()=>{$("t-go").disabled=!$("t-ok").checked};
  $("t-go").onclick=async()=>{$("t-go").disabled=true;if(ONLINE){const r=await act("terms_ok",{v:TERMS_V});if(!r){$("t-go").disabled=false;return}}else{try{localStorage.setItem("we-terms",String(TERMS_V))}catch(e){}}
    d.remove();termsOn=false;hap("medium")}}
if(typeof buyItem==="function"){const _bi=buyItem;buyItem=function(o){if(S&&ONLINE&&S.termsV!=null&&S.termsV<TERMS_V){termsOn=false;termsGateForce=true;termsGate();return}return _bi(o)}}
let termsGateForce=false;
{const t=setInterval(()=>{if(!S)return;clearInterval(t);termsGate()},300);setInterval(()=>{try{if(S&&!termsOn&&termsNeed())termsGate()}catch(e){}},5000)}

/* ---------- карточка-коллаборация «Воины Эпох × Номерок»: А777МР 77, бесценная, 1 из 1 ---------- */
const plateHTML=()=>'<span class="plate"><b>А<em>777</em>МР</b><i><u>77</u><small><s></s>RUS</small></i></span>';
DETAILED["А777МР 77"]=u=>{const L=portrait(30,null).replace(/^<svg[^>]*>/,'<svg x="6" y="-4" width="188" height="188" viewBox="0 0 200 200">');
 const T=(x,y,sz,t,anc)=>`<text x="${x}" y="${y}" text-anchor="${anc||"middle"}" font-size="${sz}" font-weight="900" fill="#0d1030" stroke="#0d1030" stroke-width="1.1" paint-order="stroke" font-family="'Arial Black',Arial,sans-serif">${t}</text>`;
 const fist=(x,flip)=>`<g transform="translate(${x} 150) scale(${flip?-.62:.62} .62)"><path d="M-12 -6 Q-14 -16 -4 -17 L8 -17 Q14 -16 14 -8 L14 14 Q14 22 6 22 L-4 22 Q-14 22 -14 12Z" fill="#1a1a2a" stroke="#0d1030" stroke-width="2.5"/><path d="M-4 -17 V4 M2 -17 V4 M8 -16 V4" stroke="#3a3a5a" stroke-width="1.6"/><path d="M-14 4 Q-22 6 -20 16" fill="none" stroke="#c0262c" stroke-width="5" stroke-linecap="round"/></g>`;
 return `<svg viewBox="0 0 200 200" class="pt" aria-hidden="true"><defs>
 <linearGradient id="ng${u}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#05081f"/><stop offset=".6" stop-color="#1a0a3a"/><stop offset="1" stop-color="#3a0a3a"/></linearGradient>
 <linearGradient id="pl${u}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset=".55" stop-color="#eef1f7"/><stop offset="1" stop-color="#c9d0de"/></linearGradient>
 <linearGradient id="sm${u}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff6c8"/><stop offset=".5" stop-color="#ffd23f"/><stop offset="1" stop-color="#ff9f0a"/></linearGradient>
 <radialGradient id="gw${u}"><stop offset="0" stop-color="#00e5ff" stop-opacity=".55"/><stop offset="1" stop-color="#00e5ff" stop-opacity="0"/></radialGradient></defs>
 <rect width="100" height="200" fill="#2a0a5a"/><rect x="100" width="100" height="200" fill="url(#ng${u})"/>
 ${[[104,52,12,60,"#ff2e63"],[122,36,14,76,"#7a5aff"],[142,58,10,54,"#00e5ff"],[160,28,16,84,"#ff2e63"],[180,46,12,66,"#00e5ff"]].map(([x,y,w,h,c])=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#0a0c24" stroke="${c}" stroke-width="1.2"/>`+[0,1,2,3].map(k=>`<rect x="${x+3}" y="${y+6+k*11}" width="${w-6}" height="3" fill="${c}" opacity=".6"/>`).join("")).join("")}
 ${[[8,40],[24,70],[14,110],[36,26],[70,18]].map(([x,y])=>`<circle cx="${x}" cy="${y}" r="1.6" fill="#ffd23f" opacity=".8"/>`).join("")}
 <ellipse cx="100" cy="120" rx="95" ry="70" fill="url(#gw${u})"/>
 ${L}
 <g transform="rotate(-3 100 136)"><rect x="33" y="109" width="134" height="56" rx="8" fill="#0d1030" stroke="url(#sm${u})" stroke-width="2"/><text x="100" y="161.5" text-anchor="middle" font-size="8.5" font-weight="900" letter-spacing="2.5" fill="#00e5ff" font-family="'Arial Black',Arial,sans-serif">НОМЕРОК</text><rect x="36" y="112" width="128" height="40" rx="6" fill="url(#pl${u})" stroke="#0d1030" stroke-width="3.5"/>
  <rect x="40" y="115.5" width="121" height="33" rx="3.5" fill="none" stroke="#0d1030" stroke-width="1.6"/>
  ${T(82,142,20,'А<tspan font-size="26">777</tspan>МР')}
  <path d="M131 115 V149" stroke="#0d1030" stroke-width="2.5"/>${T(147,133,16,"77")}
  ${T(142,145,7,"RUS")}<rect x="150" y="139" width="9" height="2.2" fill="#fff" stroke="#0d1030" stroke-width=".5"/><rect x="150" y="141.2" width="9" height="2.2" fill="#2a5ad0"/><rect x="150" y="143.4" width="9" height="2.2" fill="#d0262c"/>
  <path d="M44 119 H118" stroke="#fff" stroke-width="2" opacity=".9"/></g>
 ${fist(44,0)}${fist(156,1)}
 <path d="M100 0 V12" stroke="url(#sm${u})" stroke-width="3"/><circle cx="100" cy="16" r="11" fill="#0d1030" stroke="url(#sm${u})" stroke-width="2.5"/><text x="100" y="21.5" text-anchor="middle" font-size="16" font-weight="900" fill="#fff" font-family="Arial,sans-serif">×</text>
 </svg>`};
function collabFace(root,c){const q=s=>root.querySelector(s);root.classList.add("collab");root.style.clipPath="";
  q(".top span").textContent="🚘 НОМЕРОК";q(".era").textContent="Воины Эпох × Номерок";q(".finish").textContent="💎 Бесценная · 1/1";
  q(".foot>b").textContent="БЕСЦЕННАЯ";const sn=q(".foot .sn");sn.innerHTML=plateHTML();sn.classList.remove("nice");q(".ribbon").hidden=true;
  q(".foot>b").textContent="БЕСЦЕННАЯ";q(".power").textContent="«Подарок лично от Номерка»";
  if(!q(".clx"))q(".in").insertAdjacentHTML("beforeend",'<i class="clx c1"></i><i class="clx c2"></i><i class="clx c3"></i>')}

/* ---------- лагерь: лёгкий режим и ограничение эффектов, чтобы не лагало при быстрых тапах ---------- */
let campLite=false;try{campLite=localStorage.getItem("we-lite")==="1"}catch(e){}
function liteApply(){const ar=$("cp-ar");if(ar)ar.classList.toggle("lite",campLite);const b=$("cp-lite");if(b)b.innerHTML=campLite?"🐢 Лёгкий режим <b>включён</b> — эффекты выключены":"✨ Лагает? Включи <b>лёгкий режим</b>"}
let fxLast=0;
const _campFx2=campFx;campFx=function(x,y,big){if(campLite)return;const t=performance.now();if(t-fxLast<70&&!big)return;fxLast=t;_campFx2(x,y,big)};
const _campFloat2=campFloat;campFloat=function(t,cls,x,y){const ar=$("cp-ar");if(!cls&&ar&&ar.querySelectorAll(".cpf").length>=(campLite?3:6))return;if(campLite&&cls==="crit"){const f=document.createElement("div");f.className="cpf crit";f.textContent=t;const r=ar.getBoundingClientRect();f.style.left=r.width/2+"px";f.style.top=r.height*.35+"px";ar.append(f);setTimeout(()=>f.remove(),900);return}_campFloat2(t,cls,x,y)};
const _campShake=campShake;campShake=function(){if(!campLite)_campShake()};
$("cp-lite").onclick=()=>{campLite=!campLite;try{localStorage.setItem("we-lite",campLite?"1":"0")}catch(e){}liteApply();toast(campLite?"🐢 Лёгкий режим: эффекты выключены":"✨ Эффекты включены")};
liteApply();

/* ---------- казино: бегущая лента «выпадает прямо сейчас» и статистика для админа ---------- */
let csFeedAt=0,csFeedK="";
function csFeedTxt(r){const n=r.name||"Игрок";if(r.gift&&GIFTS[r.gift])return {ic:giftSVG(r.gift,26),t:"<b></b> выбил «"+GIFTS[r.gift].n+"» № "+r.gno+"/"+GIFTS[r.gift].run,n};
  if(r.g==="slot")return {ic:"🎰",t:"<b></b> поймал ×"+String(r.m).replace(".",",")+" → +"+fmtN(r.win)+" 💠",n};if(r.g==="hl")return {ic:"🃏",t:"<b></b> забрал +"+fmtN(r.win)+" 💠",n};return {ic:"📦",t:"<b></b> открыл кейс: +"+fmtN(r.win)+" 💠",n}}
async function loadCasFeed(){if(!ONLINE||$("sec-cas").hidden||NOW()-csFeedAt<12000)return;csFeedAt=NOW();const r=await act("cas_feed");if(!r)return;const box=$("cs-feed"),ft=$("cs-ft");
  if(!r.length){box.hidden=true;return}box.hidden=false;const k=r.map(x=>x.at).join(",");if(k===csFeedK)return;csFeedK=k;
  const one=r.map(x=>{const T=csFeedTxt(x);return '<span class="cfi"><i>'+T.ic+'</i><em>'+T.t+'</em></span>'}).join("");ft.innerHTML=one+one;
  ft.querySelectorAll(".cfi b").forEach((b,i)=>b.textContent=r[i%r.length].name||"Игрок");ft.style.animationDuration=Math.max(20,r.length*5)+"s"}
setInterval(()=>{try{loadCasFeed()}catch(e){}},3000);
async function loadCasStats(){const B=$("cs-adm-b");B.innerHTML="<p>Загружаю…</p>";const r=await act("cas_stats");if(!r){B.innerHTML="<p>Не получилось</p>";return}
  const G={case:"📦 Кейс",slot:"🎰 Слоты",hl:"🃏 Больше-меньше"},rtp=(b,w)=>b?Math.round(w/b*1000)/10+"%":"—";
  const part=(t,X)=>'<h4>'+t+'</h4><div class="csa-row"><div><b>'+fmtN(X.players||0)+'</b>игроков</div><div><b>'+fmtN(X.n||0)+'</b>игр</div><div><b>'+fmtN(X.bet||0)+'</b>поставлено 💠</div><div><b>'+fmtN(X.win||0)+'</b>выиграно 💠</div><div><b>'+rtp(X.bet,X.win)+'</b>отдача</div></div>'+
    '<table class="csa-t"><tr><th></th><th>игр</th><th>ставки</th><th>выигрыш</th><th>отдача</th><th>🎁</th></tr>'+(X.by||[]).map(g=>'<tr><td>'+(G[g.g]||g.g)+'</td><td>'+fmtN(g.n)+'</td><td>'+fmtN(g.bet||0)+'</td><td>'+fmtN(g.win||0)+'</td><td>'+rtp(g.bet,g.win)+'</td><td>'+(g.gifts||0)+'</td></tr>').join("")+'</table>';
  const ppl=(t,L)=>'<h4>'+t+'</h4>'+(L.length?L.map(x=>'<div class="csa-p"><span></span><b>'+(x.net>0?"+":"")+fmtN(x.net)+' 💠</b><small>'+x.n+' игр</small></div>').join(""):'<p>—</p>');
  B.innerHTML=part("Сегодня",r.today)+part("За 7 дней",r.week)+ppl("🏆 Больше всех выиграли сегодня",r.top)+ppl("💸 Больше всех проиграли сегодня",r.lose)+
   '<h4>🎁 Последние подарки из кейса</h4>'+(r.gifts.length?r.gifts.map(g=>'<div class="csa-p"><span></span><b>'+(GIFTS[g.gift]?GIFTS[g.gift].n:g.gift)+' № '+g.gno+'</b><small>'+new Date(g.at+3*3600e3).toISOString().slice(5,16).replace("T"," ")+'</small></div>').join(""):'<p>—</p>');
  const sp=B.querySelectorAll(".csa-p span"),names=[...r.top,...r.lose,...r.gifts];sp.forEach((s,i)=>s.textContent=names[i].name||"Игрок")}
$("cs-adm-go").onclick=loadCasStats;
const _renderCas2=renderCas;renderCas=function(){_renderCas2();const a=$("cs-adm");if(a)a.hidden=!(S&&S.admin);loadCasFeed()};

/* ---------- красивая золотая монета вместо эмодзи 🪙: во всём интерфейсе значок заменяется нарисованной монетой ---------- */
(function(){const SKIP=new Set(["SCRIPT","STYLE","TEXTAREA","INPUT","OPTION","TITLE"]);let q=new Set(),raf=0;
  const swap=n=>{const p=n.parentNode;if(!p||SKIP.has(p.nodeName)||p.closest&&p.closest("svg")||n.ownerSVGElement)return;const parts=n.nodeValue.split("🪙");if(parts.length<2)return;
    const f=document.createDocumentFragment();parts.forEach((t,i)=>{if(t)f.append(t);if(i<parts.length-1){const c=document.createElement("i");c.className="gc1";c.setAttribute("aria-label","монет");f.append(c)}});p.replaceChild(f,n)};
  const scan=root=>{if(root.nodeType===3){if(root.nodeValue.includes("🪙"))swap(root);return}if(root.nodeType!==1||SKIP.has(root.nodeName))return;
    const w=document.createTreeWalker(root,NodeFilter.SHOW_TEXT,{acceptNode:t=>t.nodeValue.includes("🪙")?1:3}),L=[];while(w.nextNode())L.push(w.currentNode);L.forEach(swap)};
  const run=()=>{raf=0;const L=[...q];q.clear();L.forEach(n=>{if(n.isConnected)scan(n)})};
  new MutationObserver(ms=>{for(const m of ms){if(m.type==="characterData")q.add(m.target);else m.addedNodes.forEach(n=>q.add(n))}if(!raf)raf=requestAnimationFrame(run)}).observe(document.body,{childList:true,subtree:true,characterData:true});
  scan(document.body)})();

/* ---------- автообновление: если на сайте уже новая версия, а Telegram показал старую из памяти — перезагружаемся на свежую ---------- */
(function(){const mv=document.querySelector('meta[name="app-ver"]'),cur=mv&&mv.content;if(!cur)return;
  async function check(){try{const r=await fetch("version.json?t="+Date.now(),{cache:"no-store"});if(!r.ok)return;const v=(await r.json()).v;if(!v||v===cur)return;
    let tried=null;try{tried=sessionStorage.getItem("we-upd")}catch(e){}if(tried===v)return;try{sessionStorage.setItem("we-upd",v)}catch(e){}
    try{if(typeof campFlush==="function")await campFlush()}catch(e){}
    updSave();const u=new URL(location.href);u.searchParams.set("u",v);location.replace(u.toString())}catch(e){}}
  /* новая версия: при открытии и при возвращении в приложение — сразу; во время игры — только когда игрок ничего не делает 90 секунд и нет окон/боя */
  let pend=false,lastIn=Date.now();["pointerdown","keydown","scroll","touchstart"].forEach(t=>addEventListener(t,()=>{lastIn=Date.now()},{passive:true,capture:true}));
  async function has(){try{const r=await fetch("version.json?t="+Date.now(),{cache:"no-store"});if(!r.ok)return false;const v=(await r.json()).v;return !!v&&v!==cur}catch(e){return false}}
  const busy=()=>!$("modal").hidden||document.querySelector(".wsheet,.cqbt,.wrev,.terms,#onb")||(typeof csBusy!=="undefined"&&csBusy)||(typeof chatOpen!=="undefined"&&chatOpen)||($("sec-camp")&&!$("sec-camp").hidden);
  setTimeout(check,1500);
  setInterval(async()=>{if(document.hidden)return;if(!pend)pend=await has();if(pend&&Date.now()-lastIn>90e3&&!busy())check()},60e3);
  document.addEventListener("visibilitychange",()=>{if(!document.hidden&&!busy())check()})})();
/* после автообновления возвращаем игрока на тот же экран */
function updSave(){try{const sec=[...document.querySelectorAll("section[id^='sec-']")].find(x=>!x.hidden);if(sec)sessionStorage.setItem("we-upd-tab",JSON.stringify({t:sec.id.slice(4),y:scrollY,at:Date.now()}))}catch(e){}}
{let st=null;try{st=JSON.parse(sessionStorage.getItem("we-upd-tab")||"null");sessionStorage.removeItem("we-upd-tab")}catch(e){}
 if(st&&Date.now()-st.at<60e3&&st.t&&st.t!=="spin"){const t=setInterval(()=>{if(!S)return;clearInterval(t);setTimeout(()=>{try{const k=st.t;if(k==="cas"&&typeof openCas==="function")openCas();else if(k==="gold")openGold();else goSub(k);setTimeout(()=>scrollTo(0,st.y||0),1200)}catch(e){}},500)},200)}}

/* ---------- удержание: сундук возвращения на завтра и +3 прокрутки за напоминания ---------- */
function drawCb(){const b=$("cb-box");if(!b)return;if(!S||!ONLINE||!S.cb||S.cb.c||(S.cards||[]).length<1){b.hidden=true;return}b.hidden=false;const left=S.cb.at-NOW(),ready=left<=0;
  const k=ready?"r":"w"+Math.ceil(left/60e3);if(b.dataset.k===k)return;b.dataset.k=k;b.classList.toggle("ready",ready);
  b.innerHTML='<div class="cbi">'+chestSVG(ready?"legend":"royal",64)+'</div><div class="cbt"><b>'+(ready?"🎁 Сундук возвращения готов!":"🎁 Завтра здесь будет сундук")+'</b><small>'+(ready?"5 прокруток и 300 "+'<i class="gc1"></i>'+" — забирай!":"5 прокруток и 300 "+'<i class="gc1"></i>'+". Откроется через "+tleft(left)+(S.pm?"":" — включи напоминания, бот позовёт"))+'</small></div>'+
   (ready?'<button type="button" class="craftbtn" id="cb-go">Забрать</button>':(S.pm?"":'<button type="button" class="mini2" id="cb-pm">🔔 +3 🎴</button>'));
  const go=$("cb-go");if(go)go.onclick=async()=>{go.disabled=true;const r=await act("cb_claim");if(r){sfx.fanfare();burst(4);hapN("success");toast("🎁 +"+r.sp+" прокруток и +"+r.cash+" монет!");renderAll()}else go.disabled=false};
  const pm=$("cb-pm");if(pm)pm.onclick=()=>enablePm()}
setInterval(()=>{try{if(S&&!$("sec-spin").hidden)drawCb()}catch(e){}},1000);
const _renderFree=renderFree;renderFree=function(){_renderFree();try{drawCb()}catch(e){}};
/* после ника и соглашения один раз предлагаем напоминания с подарком */
function pmBonusAsk(){if(!S||!ONLINE||!S.nick||S.pm||S.pmBonus||termsNeed()||typeof canPmAsk!=="function"||!canPmAsk()||!$("modal").hidden||document.querySelector(".terms,.wrev,.onb-hl,#onb"))return;
  try{if(localStorage.getItem("we-pm-ask2"))return;localStorage.setItem("we-pm-ask2","1")}catch(e){return}
  const m=$("modal"),sh=$("msheet");m.hidden=false;sh.innerHTML='<div class="box nickbox"><h3>🔔 +3 прокрутки за напоминания</h3><p>Разреши боту писать — и сразу получишь <b>3 прокрутки</b>. Бот напомнит, когда готовы новые прокрутки, позовёт за сундуком и скажет, если купят твою карточку. Ночью не пишет.</p><button type="button" class="craftbtn" id="pmb-yes">Включить и забрать +3</button><button type="button" class="ghost" id="pmb-no">Не сейчас</button></div>';
  $("pmb-yes").onclick=()=>{closeModal();enablePm()};$("pmb-no").onclick=closeModal}
setInterval(()=>{try{pmBonusAsk()}catch(e){}},4000);

/* ---------- обмен монет на руны: пакет 10 000 💠, цена — процент от твоих монет ---------- */
function exK(){const E=S.ex||{};return E.d===new Date(Date.now()+3*3600e3).toISOString().slice(0,10)?E.k||0:0}
function drawEx(){const b=$("cs-ex");if(!b||!S)return;const k=exK(),left=EX.day-k,pr=exPrice(S.cash,k),pct=Math.round((EX.base+EX.step*k)*100);
  b.innerHTML='<div class="exh"><b>💱 Обмен монет на руны</b><small>пакетов сегодня: '+k+' из '+EX.day+'</small></div>'+
   (left<=0?'<p class="exn">На сегодня обмен закончился — завтра снова</p>':
   '<p class="exn">Цена — '+pct+'% от твоих монет (не меньше '+fmtN(EX.min)+' <i class="gc1"></i>). Каждый следующий пакет за день на 1% дороже</p>'+
   '<button type="button" class="craftbtn" id="cx-go"'+(S.cash<pr?" disabled":"")+'>'+(S.cash<pr?"Нужно "+fmtN(pr)+' <i class="gc1"></i>':"Обменять "+fmtN(pr)+' <i class="gc1"></i> → '+fmtN(EX.pack)+" 💠")+'</button>');
  b.onclick=async e=>{const t=e.target.closest("button");if(!t||t.disabled||t.id!=="cx-go")return;t.disabled=true;const r=await act("ex_runes",{max:pr});
    if(r){sfx.coin();hapN("success");toast("💱 −"+fmtN(r.n)+" монет · +"+fmtN(r.r)+" рун");renderAll();try{renderCas()}catch(x){}}drawEx()}}
const _renderCas3=renderCas;renderCas=function(){_renderCas3();try{drawEx()}catch(e){}};

/* ---------- кланы ---------- */
let clData=null,clBusy=false;
async function openClan(){setTab("clan");const b=$("clan-body");if(!ONLINE){b.innerHTML='<div class="box"><p>Кланы работают в игре через бота</p></div>';return}if(!clData)b.innerHTML='<div class="box"><p>Загружаю клан…</p></div>';await loadClan()}
async function loadClan(){const r=await act("clan_info");if(r){clData=r;drawClan()}}
const clLeft=ms=>{const h=Math.max(0,Math.floor(ms/3600e3));return h>=24?Math.floor(h/24)+" д "+(h%24)+" ч":h+" ч"};
function drawClan(){const b=$("clan-body");if(!b||$("sec-clan").hidden||!clData)return;const D=clData;
  const top='<div class="box cltop"><h3>🏆 Кланы недели</h3><p class="cln">Считается урон по боссам за неделю. В понедельник топ-3 получают награды: каждому участнику 🥇 +'+CLAN.week[0]+', 🥈 +'+CLAN.week[1]+', 🥉 +'+CLAN.week[2]+' прокруток</p>'+
   (D.top.length?D.top.map((c,i)=>'<div class="clr'+(D.clan&&c.id===D.clan.id?" me":"")+'"><i>'+(i<3?["🥇","🥈","🥉"][i]:i+1)+'</i><span class="clnm"></span><small>'+c.n+'/'+CLAN.max+'</small><b>'+fmtN(c.total)+'</b>'+(!D.clan&&c.n<CLAN.max?'<button type="button" class="mini2" data-join="'+c.id+'">Вступить</button>':"")+'</div>').join(""):'<p class="cln">Кланов пока нет — создай первый!</p>')+'</div>';
  if(!D.clan){b.innerHTML='<div class="box clnew"><h3>🛡 Кланы</h3><p>Собери команду до '+CLAN.max+' человек. Каждую неделю — общий босс: все бьют его своими воинами (3 удара в день). Победили босса — каждому, кто бил, сундук: <b>+'+CLAN.chest.sp+' прокруток и +'+CLAN.chest.cash+' 🪙</b>, а следующий босс сильнее и снова с сундуком.</p>'+
     '<div class="clform"><input id="cl-name" maxlength="16" placeholder="Название клана"><button type="button" class="craftbtn" id="cl-make">Создать · '+fmtN(CLAN.cost)+' 🪙</button></div><p class="cln">Или вступи в клан из таблицы ниже</p></div>'+top}
  else{const C=D.clan,B=D.boss,pct=Math.max(0,Math.min(100,B.dmg/B.hp*100)),inv="https://t.me/VoinyEpohBot?startapp=c_"+C.id;
    b.innerHTML='<div class="box clhead"><div class="clem">'+portrait(C.h,null)+'</div><div><h3 class="clnm0"></h3><small>'+C.members.length+'/'+CLAN.max+' участников'+(C.place?' · '+C.place+' место за неделю':"")+'</small></div></div>'+
     '<div class="box clboss"><div class="clbh"><b>👹 '+B.name+' · ур. '+B.lvl+'</b><small>до конца недели '+clLeft(D.weekEnd-NOW())+'</small></div>'+clBossHTML(B)+
     '<div class="clhp"><i style="width:'+(100-pct)+'%"></i><span>'+fmtN(B.hp-B.dmg)+' / '+fmtN(B.hp)+'</span></div><p class="cln">Повержено боссов на этой неделе: <b>'+B.kills+'</b> · урон клана: <b>'+fmtN(B.total)+'</b></p>'+
     '<button type="button" class="craftbtn clhit" id="cl-hit"'+(D.left<=0?" disabled":"")+'>'+(D.left>0?"⚔️ Ударить ("+D.left+" из "+CLAN.hits+" сегодня)":"Удары на сегодня закончились — завтра снова")+'</button><p class="cln">Бьют 3 твоих самых сильных воина (по атаке). Закаляй карточки — урон растёт</p></div>'+
     '<div class="box clmem"><div class="rowb"><h3>👥 Участники</h3><button type="button" class="mini2" id="cl-inv">Позвать друга</button></div>'+C.members.map((m,i)=>'<div class="clr"><i>'+(i+1)+'</i><span class="clnm"></span><b>'+fmtN(m.dmg)+'</b></div>').join("")+'<button type="button" class="ghost" id="cl-leave" style="margin-top:10px;width:100%">Выйти из клана</button></div>'+top;
    b.querySelector(".clnm0").textContent=(C.owner===S.uid?"👑 ":"")+C.name;b.querySelectorAll(".clmem .clnm").forEach((e,i)=>e.textContent=(C.members[i].vip?"👑 ":"")+C.members[i].name+(C.members[i].uid===S.uid?" (ты)":""));
    $("cl-inv").onclick=()=>{const t="Вступай в мой клан «"+C.name+"» в «Воинах Эпох» — вместе бьём босса за сундуки!";try{tg.openTelegramLink("https://t.me/share/url?url="+encodeURIComponent(inv)+"&text="+encodeURIComponent(t))}catch(e){try{navigator.clipboard.writeText(inv);toast("Ссылка скопирована")}catch(x){}}};
    $("cl-leave").onclick=async()=>{if(!confirmLeave())return;const r=await act("clan_leave");if(r){toast("Ты вышел из клана");clData=null;loadClan()}}}
  b.querySelectorAll(".cltop .clnm").forEach((e,i)=>e.textContent=D.top[i].name);
  b.onclick=async e=>{const t=e.target.closest("button");if(!t||t.disabled||clBusy)return;clBusy=true;try{
    if(t.dataset.join){const r=await act("clan_join",{id:+t.dataset.join});if(r){sfx.fanfare();toast("🛡 Ты в клане!");await loadClan()}}
    else if(t.id==="cl-make"){const r=await act("clan_create",{name:$("cl-name").value});if(r){sfx.fanfare();burst(3);toast("🛡 Клан создан! Зови друзей");renderAll();await loadClan()}}
    else if(t.id==="cl-hit"){t.disabled=true;const r=await act("clan_hit");if(r){const bp=b.querySelector(".clbp");bp.classList.remove("hit");void bp.offsetWidth;bp.classList.add("hit");hap(r.crit?"heavy":"medium");tone(120,.12,"square",.08);
        toast((r.crit?"💥 КРИТ! ":"⚔️ ")+"−"+fmtN(r.dmg)+" боссу");if(r.kill){sfx.fanfare();burst(4);hapN("success");toast("🏆 Босс повержен! Сундук клана: +"+r.kill.sp+" прокруток и +"+r.kill.cash+" монет");renderAll()}await loadClan()}else t.disabled=false}}finally{clBusy=false}}}
let clConfirm=0;function confirmLeave(){if(NOW()-clConfirm<4000)return true;clConfirm=NOW();toast("Нажми ещё раз, чтобы выйти из клана");return false}
/* приглашение в клан по ссылке ?startapp=c_<id> */
(function(){const sp=new URLSearchParams(location.search).get("startapp")||(tg&&tg.initDataUnsafe&&tg.initDataUnsafe.start_param)||"";const m=/^c_(\d+)$/.exec(sp);
  const go=new URLSearchParams(location.search).get("clan");if(!m&&!go)return;const t=setInterval(async()=>{if(!S)return;clearInterval(t);await openClan();
    if(m&&clData&&!clData.clan){const id=+m[1],c=(clData.top||[]).find(x=>x.id===id);if(c){const r=await act("clan_join",{id});if(r){toast("🛡 Ты вступил в клан «"+c.name+"»!");await loadClan()}}}},400)})();

/* ---------- эпохи в альбоме ---------- */
function drawEras(){const sec=$("sec-album");if(!sec||sec.hidden||!S)return;let box=$("era-box");if(!box){box=document.createElement("div");box.id="era-box";box.className="box erab";const sub=sec.querySelector(".subnav");if(sub)sub.after(box);else sec.prepend(box)}
  const have=new Set((S.cards||[]).map(c=>c.h)),E=S.eras||{};
  box.innerHTML='<h3>🗺 Эпохи</h3><p class="cln">Собери всех воинов эпохи — получи награду и значок эпохи</p>'+ERAS.map(x=>{const n=x.h.filter(h=>have.has(h)).length,done=n===x.h.length,got=E[x.k];
    return '<div class="era'+(got?" got":done?" ready":"")+'"><i>'+x.ic+'</i><div><b>'+x.n+'</b><div class="erb"><u style="width:'+(n/x.h.length*100)+'%"></u></div><small>'+n+' из '+x.h.length+' · награда: '+x.sp+' прокруток и '+fmtN(x.cash)+' 🪙</small></div>'+
     (got?'<em>✅</em>':done?'<button type="button" class="mini2" data-era="'+x.k+'">Забрать</button>':'')+'</div>'}).join("");
  box.onclick=async e=>{const t=e.target.closest("[data-era]");if(!t)return;t.disabled=true;const r=await act("era_claim",{k:t.dataset.era});if(r){sfx.fanfare();burst(4);hapN("success");toast("🗺 Эпоха собрана! +"+r.sp+" прокруток и +"+fmtN(r.cash)+" монет");renderAll()}else t.disabled=false}}
const _renderAlbum=renderAlbum;renderAlbum=function(){_renderAlbum();try{drawEras()}catch(e){}};

/* кейс: после прокрутки лента остаётся на выпавшем призе, а не прыгает в начало */
let csLast=null;
const _renderCas4=renderCas;renderCas=function(){_renderCas4();try{if(csTab!=="case"||!csLast||csBusy)return;const tr=$("cs-tr");if(!tr)return;tr.style.transition="none";tr.innerHTML=csLast.html;tr.style.transform=csLast.x;const t=tr.children[csLast.w];if(t)t.classList.add("won")}catch(e){}};
/* любое действие сразу обновляет руны и монеты в шапке */
{const _act=act;act=async function(n,p){const r=await _act(n,p);try{updCash()}catch(e){}return r}}

/* босс клана в стиле «Ошибка печати»: аура, RGB-сдвиг, полосы сбоя, угли. Только transform/opacity — легко даже слабым телефонам */
function clBossHTML(B){const lite=campLite||(window.matchMedia&&matchMedia("(prefers-reduced-motion:reduce)").matches);
  return '<div class="clbp'+(lite?" lite":"")+'"><div class="cba"></div><div class="cbr"></div><div class="cbd">'+portrait(B.h,null)+'</div><div class="cbs"></div><div class="cbg"></div>'+
   (lite?"":'<i class="cbe" style="--x:18%;--d:0s"></i><i class="cbe" style="--x:74%;--d:1.1s"></i><i class="cbe" style="--x:42%;--d:2.2s"></i><i class="cbe" style="--x:86%;--d:.6s"></i><i class="cbe" style="--x:30%;--d:1.7s"></i>')+
   '<b class="cbt">ERR0R</b></div>'}

/* пока лента/барабан крутятся, выигрыш не «спойлерим» в шапке: показываем баланс уже со списанием, но без приза */
let csHide=0;
{const _u=updCash;updCash=function(){_u();if(csHide>0)try{const v=fmtN(Math.max(0,campView().runes-csHide));$("cash-r").textContent=v;const c=$("cs-ru");if(c)c.textContent=v}catch(e){}}}
{const _b=csBal;csBal=function(){_b();if(csHide>0)try{$("cs-ru").textContent=fmtN(Math.max(0,campView().runes-csHide))}catch(e){}}}

/* ===================== ПОКОРЕНИЕ ЭПОХ (карта мира) =====================
   Анимации только transform/opacity, тяжёлые фильтры статичные. Карта перерисовывается, только когда что-то изменилось. */
let cqCh=null,cqKey="",cqSel=null,cqBusy=false;
const CQ_DECO={mid:["🌲","🏰","🌾","🌳","⛪","🐎"],ant:["🏛","🫒","🌊","🏺","⛵","🦉"],nor:["🏔","🌲","❄️","🛶","🐺","⛺"],jap:["🌸","⛩","🎋","🗻","🏯","🍵"],myth:["🌋","🐉","🌫","💀","🔮","🦅"]};
const CQ_X=[22,64,80,44,18,52,82,50],CQ_GAP=104;
const cqOk=c=>!c.part&&!away(c)&&!FIN[c.f].excl;
function cqView(){const Q0=S.conq||{c:0,s:{},d:"",t:0},same=Q0.d===mskDay(NOW()),Q={t:same?Q0.t||0:0,x:same?Q0.x||0:0,b:same?Q0.b||0:0};
  return {c:Q0.c||0,s:Q0.s||{},left:conqLeft(S,Q),max:conqTorch(S)+Q.x,b:Q.b,price:conqBuyPrice(Q)}}
function cqBuySheet(after){const V=cqView(),ru=campView().runes;if(V.b>=CONQ.buyMax){toast("Сегодня уже куплено "+CONQ.buyMax+" факелов. Ещё +1 🔥 за каждое задание дня в «Пропуске»");return}
  wSheet('<div style="text-align:center;font-size:54px;line-height:1">🔥</div><h3 style="text-align:center;margin:6px 0 2px">Ещё факел</h3><p class="cln" style="text-align:center">Сейчас факелов: <b>'+V.left+'</b>. Купить за руны можно ещё '+(CONQ.buyMax-V.b)+' сегодня — каждый следующий дороже.<br>А за каждое выполненное задание дня в «Пропуске» — <b>+1 🔥 бесплатно</b>.</p>'+
   '<button type="button" class="craftbtn" data-buy="1"'+(ru<V.price?" disabled":"")+'>'+(ru<V.price?"Нужно "+fmtN(V.price)+" 💠 (у тебя "+fmtN(ru)+")":"Купить за "+fmtN(V.price)+" 💠")+'</button>'+(ru<V.price?'<button type="button" class="ghost" data-camp="1" style="width:100%;margin-top:8px">🎯 В лагерь за рунами</button>':"")+'<button type="button" class="ghost" data-pass="1" style="width:100%;margin-top:8px">📜 Задания дня</button>',
   btn=>{if(btn.dataset.camp){openCamp();return}if(btn.dataset.pass){goSub("pass");return}if(btn.dataset.buy){(async()=>{const r=await act("conq_buy");if(!r)return;sfx.coin();hap("medium");toast("🔥 +1 факел! Осталось "+r.left);cqKey="";renderAll();if(after)after()})();return}})}
function cqEra(k){return ERAS.find(e=>e.k===k)}
function openConq(){const V=cqView();if(cqCh==null)cqCh=Math.min(CONQ_CH.length-1,Math.floor(Math.min(V.c,conqN()-1)/CONQ.per));cqKey="";setTab("conq")}
function drawConq(){const b=$("conq-body");if(!b||$("sec-conq").hidden||!S)return;const V=cqView(),C=CONQ_CH[cqCh],k=[cqCh,V.c,JSON.stringify(V.s),V.left].join("|");if(k===cqKey)return;cqKey=k;
  const W=cqEra(C.weak),stars=Object.values(V.s).reduce((a,x)=>a+x,0),chDone=Math.max(0,Math.min(CONQ.per,V.c-cqCh*CONQ.per));
  const chips=CONQ_CH.map((X,i)=>{const lock=V.c<i*CONQ.per,d=Math.max(0,Math.min(CONQ.per,V.c-i*CONQ.per));return '<button type="button" class="cqc'+(i===cqCh?" on":"")+(lock?" lock":"")+'" data-ch="'+i+'"><i>'+(lock?"🔒":cqEra(X.k).ic)+'</i><span>'+X.n+'</span><small>'+d+'/'+CONQ.per+'</small></button>'}).join("");
  const H=CONQ.per*CQ_GAP+70,pos=i=>({x:CQ_X[i],y:H-50-i*CQ_GAP});
  let path="",done="";for(let i=0;i<CONQ.per-1;i++){const a=pos(i),z=pos(i+1),seg=(i?"":"M"+a.x+" "+a.y)+" C"+a.x+" "+(a.y-55)+" "+z.x+" "+(z.y+55)+" "+z.x+" "+z.y;path+=seg;if(i<chDone)done+=seg}
  const deco=CQ_DECO[C.k];let dh="";for(let i=0;i<14;i++){const side=i%2,x=side?(84+((i*37)%12)):(2+((i*53)%10)),y=30+((i*61)%(H-80));dh+='<i class="cqd" style="left:'+x+'%;top:'+y+'px;font-size:'+(22+(i*7)%16)+'px">'+deco[i%deco.length]+'</i>'}
  const nodes=[...Array(CONQ.per)].map((_,i)=>{const n=cqCh*CONQ.per+i,p=pos(i),S0=conqStage(n),st=V.s[n]||0,cls=n<V.c?"done":n===V.c?"cur":"lock";
    return '<button type="button" class="cqn '+cls+(S0.boss?" cqboss":"")+'" data-n="'+n+'" style="left:'+p.x+'%;top:'+p.y+'px">'+(S0.boss?'<span class="cqbp">'+portrait(S0.foes[1].h,null,true)+'</span>':'<b>'+(i+1)+'</b>')+
      (n<V.c?'<em class="cqst">'+"★★★".slice(0,st)+'<u>'+"★★★".slice(st)+'</u></em>':"")+'<span class="cql">'+S0.name+'</span></button>'}).join("");
  b.innerHTML='<div class="box cqhd" style="--b0:'+C.bg[0]+';--b1:'+C.bg[1]+'"><div class="cqt"><div><h3>🗺 Покорение Эпох</h3><p>Отряд из 3 воинов против 3 врагов. Выиграл 2 схватки — земля твоя</p></div><button type="button" class="cqtorch" id="cq-torch"><i>🔥</i><b>'+V.left+'</b><small>из '+V.max+'</small><em>+</em></button></div>'+
    '<div class="cqchips">'+chips+'</div><div class="cqinfo"><span>Слабость главы: <b>'+W.ic+' '+W.n+'</b> +30%</span><span>★ '+stars+' / '+conqN()*3+'</span></div></div>'+
    '<div class="cqmap" style="height:'+H+'px;--b0:'+C.bg[0]+';--b1:'+C.bg[1]+'"><div class="cqfog"></div>'+dh+'<i class="cqcloud" style="top:12%">☁️</i><i class="cqcloud c2" style="top:58%">☁️</i>'+
    '<svg class="cqpath" viewBox="0 0 100 '+H+'" preserveAspectRatio="none"><path d="'+path+'" class="p0" vector-effect="non-scaling-stroke"/>'+(done?'<path d="'+done+'" class="p1" vector-effect="non-scaling-stroke"/>':"")+'</svg>'+nodes+'</div>'+
    '<p class="cln" style="text-align:center">Награда за точку — при первом прохождении. За ★★★ ещё +1 🎴. В конце главы — сундук с карточкой</p>';
  b.onclick=e=>{if(e.target.closest("#cq-torch")){cqBuySheet();return}const ch=e.target.closest("[data-ch]");if(ch){const i=+ch.dataset.ch;if(V.c<i*CONQ.per){toast("Сначала пройди главу «"+CONQ_CH[i-1].n+"»");return}cqCh=i;cqKey="";drawConq();hap("light");return}
    const nd=e.target.closest(".cqn");if(!nd)return;const n=+nd.dataset.n;if(n>V.c){toast("Сначала пройди предыдущую точку");hap("light");return}cqSel=null;cqStageSheet(n)};
  requestAnimationFrame(()=>{const cur=b.querySelector(".cqn.cur");if(cur&&!cqDidScroll){cqDidScroll=1;cur.scrollIntoView({block:"center"})}})}
let cqDidScroll=0;
function cqAuto(n){const S0=conqStage(n),pool=S.cards.filter(cqOk).sort((a,b)=>conqPow(b,S0.weak)-conqPow(a,S0.weak)).slice(0,3);if(pool.length<3)return pool;return cqOrder(pool,S0)}
function cqOrder(cs,S0){const P=[[0,1,2],[0,2,1],[1,0,2],[1,2,0],[2,0,1],[2,1,0]];let best=null,bv=-1;for(const p of P){const v=p.reduce((a,j,i)=>{const r=conqPow(cs[j],S0.weak)/S0.foes[i].p;return a+1/(1+Math.exp(-(r-1)*8))},0);if(v>bv){bv=v;best=p}}return best.map(j=>cs[j])}
function cqStageSheet(n){const S0=conqStage(n),V=cqView(),C=CONQ_CH[S0.ch],W=cqEra(S0.weak),st=V.s[n]||0;
  let sq=cqSel?cqSel.map(id=>S.cards.find(c=>c.id===id)).filter(Boolean):cqAuto(n);if(sq.length===3)sq=cqOrder(sq,S0);
  const odds=j=>{if(!sq[j])return "";const r=conqPow(sq[j],S0.weak)/S0.foes[j].p;return r>1.12?"win":r>.88?"mid":"lose"};
  const R=S0.r,rw=n<V.c?(st<3?'<div class="cqrw">Пройдено '+"★".repeat(st)+' — за ★★★ ещё <b>+1 🎴</b></div>':'<div class="cqrw">Пройдено на ★★★ — можно повторить для заданий сезона</div>'):
    '<div class="cqrw">Награда: <b>+'+fmtN(R.cash)+' 🪙</b> · <b>+'+fmtN(R.runes)+' 💠</b>'+(R.sp?' · <b>+'+R.sp+' 🎴</b>':"")+(R.card!=null?' · <b class="cqcard" style="--c:'+HT[R.card].c+'">🃏 '+HT[R.card].k.replace(/ый$/,"ая").replace(/ий$/,"ая")+' карточка</b>':"")+'</div>';
  const d=wSheet('<div class="cqsh" style="--b0:'+C.bg[0]+';--b1:'+C.bg[1]+'"><div class="cqsh-h"><small>'+C.n+' · точка '+(S0.i+1)+(S0.boss?" · БОСС":"")+'</small><h3>'+S0.name+'</h3></div>'+
    '<div class="cqvs"><div class="cqrow foes">'+S0.foes.map((F,j)=>'<div class="cqfoe'+(S0.boss&&j===1?" big":"")+'"><div class="pt">'+portrait(F.h,null,true)+'</div><span>'+HEROES[F.h][0]+'</span><b>⚔ '+fmtN(F.p)+'</b></div>').join("")+'</div>'+
    '<div class="cqmid">'+[0,1,2].map(j=>'<i class="'+odds(j)+'"></i>').join("")+'</div>'+
    '<div class="cqrow mine">'+[0,1,2].map(j=>sq[j]?'<div class="cqme">'+miniSlot(sq[j])+'<b>⚔ '+fmtN(conqPow(sq[j],S0.weak))+(ERA_OF[sq[j].h]===S0.weak?' <em>+30%</em>':"")+'</b></div>':'<div class="cqme empty">Нет воина</div>').join("")+'</div></div>'+
    '<div class="cqweak">'+W.ic+' Слабость: воины эпохи «'+W.n+'» бьют здесь на 30% сильнее</div>'+rw+
    '<div class="cqbtns"><button type="button" class="ghost" data-pick="1">Сменить отряд</button><button type="button" class="craftbtn cqgo" data-go="1"'+(sq.length<3?" disabled":"")+'>'+(V.left>0?"⚔️ В бой · 🔥1":"🔥 Ещё факел")+'</button></div></div>',
   btn=>{if(btn.dataset.pick){cqPicker(n,sq);return}if(btn.dataset.go){if(cqView().left<=0){cqBuySheet(()=>cqStageSheet(n));return}cqFight(n,sq);return}return false})}
function cqPicker(n,cur){const S0=conqStage(n),list=S.cards.filter(cqOk).sort((a,b)=>conqPow(b,S0.weak)-conqPow(a,S0.weak)).slice(0,40),sel=new Set(cur.map(c=>c.id));
  const d=wSheet('<h3 style="margin:0 0 4px">Выбери 3 воинов</h3><p class="cln">Сила с учётом слабости главы. Отмеченные «+30%» — из эпохи «'+cqEra(S0.weak).n+'»</p><div class="cqpk">'+list.map(c=>'<button type="button" class="cqpi'+(sel.has(c.id)?" on":"")+'" data-id="'+c.id+'">'+miniSlot(c)+'<span>'+HEROES[c.h][0]+'</span><b>⚔ '+fmtN(conqPow(c,S0.weak))+(ERA_OF[c.h]===S0.weak?'<em>+30%</em>':"")+'</b></button>').join("")+'</div><button type="button" class="craftbtn" data-ok="1">Готово</button>',
   btn=>{if(btn.dataset.id){const id=+btn.dataset.id||btn.dataset.id;if(sel.has(id))sel.delete(id);else{if(sel.size>=3){toast("В отряде 3 воина. Сними кого-нибудь");return false}sel.add(id)}btn.classList.toggle("on",sel.has(id));hap("light");return false}
     if(btn.dataset.ok){if(sel.size<3){toast("Выбери ещё "+(3-sel.size));return false}cqSel=[...sel];setTimeout(()=>cqStageSheet(n),0)}})}
async function cqFight(n,sq){if(cqBusy)return;cqBusy=true;document.querySelectorAll(".wsheet").forEach(e=>e.remove());
  const r=await act("conq_fight",{n,ids:sq.map(c=>c.id)}).catch(()=>null);if(!r){cqBusy=false;return}
  const S0=conqStage(n),C=CONQ_CH[S0.ch];sfx.lock&&sfx.lock();
  const ov=document.createElement("div");ov.className="cqbt";ov.style.cssText="--b0:"+C.bg[0]+";--b1:"+C.bg[1];
  ov.innerHTML='<div class="cqbt-bg"></div><div class="cqbt-h"><small>'+C.n+'</small><b>'+S0.name+'</b><div class="cqdots">'+[0,1,2].map(j=>'<i data-d="'+j+'"></i>').join("")+'</div></div>'+
   '<div class="cqbt-row rtop">'+S0.foes.map((F,j)=>'<div class="cqbf" data-j="'+j+'"><div class="pt">'+portrait(F.h,null,true)+'</div><span>'+HEROES[F.h][0]+'</span><b class="pw"></b></div>').join("")+'</div>'+
   '<div class="cqbt-mid"><div class="cqflash"></div><div class="cqboom">💥</div><div class="cqvs2">VS</div></div>'+
   '<div class="cqbt-row rbot">'+sq.map((c,j)=>'<div class="cqbm" data-j="'+j+'">'+miniSlot(c)+'<b class="pw"></b></div>').join("")+'</div><div class="cqres"></div><p class="cqskip">нажми, чтобы пропустить</p>';
  document.body.append(ov);let skip=false,fin=false;ov.onclick=()=>{if(!fin)skip=true};
  const wait=ms=>new Promise(z=>{const t0=performance.now();const f=()=>{if(skip||performance.now()-t0>=ms)z();else setTimeout(f,40)};f()});
  await wait(450);
  for(let j=0;j<3&&!skip;j++){const R0=r.rounds[j],me=ov.querySelector('.cqbm[data-j="'+j+'"]'),fo=ov.querySelector('.cqbf[data-j="'+j+'"]');
    ov.classList.add("act");me.classList.add("go");fo.classList.add("go");tone(300,.2,"sawtooth",.05,0,120);await wait(420);if(skip)break;
    me.querySelector(".pw").textContent="⚔ "+fmtN(R0.a)+(R0.bonus?" 🔥":"");fo.querySelector(".pw").textContent="⚔ "+fmtN(R0.b);
    ov.classList.remove("hit");void ov.offsetWidth;ov.classList.add("hit");tone(110,.18,"square",.09);tone(1400,.08,"triangle",.05,.05);hap("heavy");await wait(420);if(skip)break;
    (R0.w?fo:me).classList.add("ko");(R0.w?me:fo).classList.add("win");ov.querySelector('[data-d="'+j+'"]').className=R0.w?"w":"l";R0.w?tone(880,.12,"sine",.06):tone(180,.2,"sine",.06);await wait(520);
    me.classList.remove("go");fo.classList.remove("go");ov.classList.remove("act");await wait(220)}
  r.rounds.forEach((R0,j)=>{const me=ov.querySelector('.cqbm[data-j="'+j+'"]'),fo=ov.querySelector('.cqbf[data-j="'+j+'"]');me.classList.remove("go");fo.classList.remove("go");me.querySelector(".pw").textContent="⚔ "+fmtN(R0.a);fo.querySelector(".pw").textContent="⚔ "+fmtN(R0.b);(R0.w?fo:me).classList.add("ko");(R0.w?me:fo).classList.add("win");ov.querySelector('[data-d="'+j+'"]').className=R0.w?"w":"l"});
  fin=true;ov.classList.remove("act");ov.classList.add("end",r.win?"won":"lost");const rw=r.reward||{};
  const res=ov.querySelector(".cqres");res.innerHTML=r.win?'<h2>ПОБЕДА!</h2><div class="cqstars">'+[0,1,2].map(i=>'<i class="'+(i<r.stars?"on":"")+'" style="--d:'+(.15+i*.22)+'s">★</i>').join("")+'</div>'+
     (r.first||r.perfect?'<div class="cqgot">'+(rw.cash?'<span>+'+fmtN(rw.cash)+' 🪙</span>':"")+(rw.runes?'<span>+'+fmtN(rw.runes)+' 💠</span>':"")+((rw.sp||0)+(rw.sp3||0)?'<span>+'+((rw.sp||0)+(rw.sp3||0))+' 🎴</span>':"")+(rw.card?'<span class="cd">🃏 карточка!</span>':"")+'</div>':'<p>Повторный бой засчитан в задания сезона</p>')+
     '<button type="button" class="craftbtn" data-ok="1">'+(r.first&&n+1<conqN()?"Дальше →":"Отлично")+'</button>':
    '<h2>ПОРАЖЕНИЕ</h2><p>Выиграно схваток: '+r.rounds.filter(x=>x.w).length+' из 3. Усиль воинов (тренер, закалка, слияние душ) или возьми воинов эпохи «'+cqEra(S0.weak).n+'» — они бьют на 30% сильнее.</p><button type="button" class="craftbtn" data-ok="1">Понятно</button>';
  if(r.win){sfx.fanfare();hapN("success");if(r.stars===3)setTimeout(()=>burst(3),300)}else{sfx.lose&&sfx.lose();hapN("error")}
  res.querySelector("[data-ok]").onclick=e=>{e.stopPropagation();ov.classList.add("out");setTimeout(()=>ov.remove(),250);cqBusy=false;cqSel=null;
    if(r.first&&n+1<conqN()&&(n+1)%CONQ.per===0){cqCh=Math.min(CONQ_CH.length-1,cqCh+1)}cqKey="";cqDidScroll=0;renderAll();
    if(rw.card)setTimeout(()=>showGrant({cards:[rw.card]},S0.boss?"🏆 Сундук главы!":"🃏 Награда!"),280)};
  cqKey="";renderAll()}

/* ===================== СЕЗОН И БОЕВОЙ ПРОПУСК ===================== */
let psKey="";
function passView(){const st={pass:S.pass?JSON.parse(JSON.stringify(S.pass)):null};const P=passState(st,NOW());const lv=passLv(P),prem=P.prem===P.s;
  let can=0;for(let l=1;l<=lv;l++){if(!P.f.includes(l))can++;if(prem&&!P.p.includes(l))can++}
  const qs=passQuests(P.d).map(i=>({i,Q:PQ[i],have:Math.min(PQ[i].n,P.c[PQ[i].k]||0),done:P.q.includes(i)}));return {P,lv,prem,can,qs,T:passTheme(P.s),left:passEnd(P.s)-NOW()}}
function psRw(r,big){const parts=[];if(r.card!=null)parts.push('<span class="psi card" style="--c:'+HT[r.card].c+'">🃏</span>');if(r.title)parts.push('<span class="psi">🎖</span>');if(r.frame)parts.push('<span class="psi frm"></span>');
  if(r.sp)parts.push('<span class="psi">🎴</span>');if(r.cash)parts.push('<span class="psi">🪙</span>');if(r.runes)parts.push('<span class="psi">💠</span>');if(r.guar)parts.push('<span class="psi">💎</span>');
  const lab=r.t||(r.sp?"+"+r.sp+" прокр.":r.cash?"+"+fmtN(r.cash)+" 🪙":r.runes?"+"+fmtN(r.runes)+" 💠":"")+(r.guar?" + эпик":"");return '<span class="psis">'+parts.slice(0,big?3:2).join("")+'</span><small>'+lab+'</small>'}
function openPass(){psKey="";setTab("pass")}
function drawPass(){const b=$("pass-body");if(!b||$("sec-pass").hidden||!S)return;const V=passView(),P=V.P,k=JSON.stringify([P,V.prem,Math.floor(V.left/36e5)]);if(k===psKey)return;psKey=k;const T=V.T;
  const xpIn=V.lv>=PASS.lv?PASS.xp:P.xp-V.lv*PASS.xp,days=Math.max(0,Math.ceil(V.left/864e5)),ring=2*Math.PI*30;
  const rows=[...Array(PASS.lv)].map((_,i)=>{const l=i+1,reach=V.lv>=l,f=P.f.includes(l),p=P.p.includes(l),rf=passReward(l,false),rp=passReward(l,true),big=l%5===0;
    const st=(got,ok,lock)=>got?"got":lock?"lock":ok?"can":"wait";
    return '<div class="psr'+(reach?" on":"")+(big?" big":"")+(l===V.lv+1?" next":"")+'"><button type="button" class="pst pfree '+st(f,reach,false)+'" data-lv="'+l+'">'+psRw(rf,big)+(f?'<i class="ok">✓</i>':"")+'</button>'+
      '<div class="psn"><b>'+l+'</b></div><button type="button" class="pst pprem '+st(p,reach,!V.prem)+'" data-lv="'+l+'" data-prem="1">'+psRw(rp,big)+(p?'<i class="ok">✓</i>':!V.prem?'<i class="lk">🔒</i>':"")+'</button></div>'}).join("");
  b.innerHTML='<div class="pshero" style="--c0:'+T.c[0]+';--c1:'+T.c[1]+';--c2:'+T.c[2]+'"><div class="psshine"></div><div class="psglow"></div><div class="psic">'+T.ic+'</div>'+
     '<div class="pstx"><small>СЕЗОН '+(P.s+1)+' · ⏳ ЕЩЁ '+days+' ДН.</small><h2>'+T.n+'</h2><span>30 уровней наград: прокрутки, руны, монеты и легендарные карточки</span></div>'+
     '<div class="pslv"><svg viewBox="0 0 70 70"><circle cx="35" cy="35" r="30" class="r0"/><circle cx="35" cy="35" r="30" class="r1" style="stroke-dasharray:'+ring+';stroke-dashoffset:'+(ring*(1-xpIn/PASS.xp))+'"/></svg><b>'+V.lv+'</b><small>уровень</small></div>'+
     '<div class="psxp"><i style="width:'+(xpIn/PASS.xp*100)+'%"></i><span>'+(V.lv>=PASS.lv?"Максимальный уровень!":xpIn+" / "+PASS.xp+" XP до "+(V.lv+1)+" ур.")+'</span></div>'+
     (V.prem?'<div class="psown">🎖 Пропуск открыт — забирай обе награды каждого уровня</div>':'<button type="button" class="psbuy" id="ps-buy"><b>🎖 Открыть пропуск · '+PASS.stars+' ⭐</b><small>2 легендарные и эпическая карточка, титул «Герой сезона», сезонная рамка, в 3 раза больше прокруток</small></button>')+'</div>'+
    '<div class="box psq"><h3>📜 Задания дня</h3>'+V.qs.map(q=>'<div class="psqr'+(q.done?" done":"")+'"><i>'+(q.done?"✅":"📜")+'</i><div><b>'+q.Q.t+'</b><div class="psqb"><u style="width:'+(q.have/q.Q.n*100)+'%"></u></div></div><span>+'+q.Q.xp+' XP · 🔥<small>'+fmtN(q.have)+'/'+fmtN(q.Q.n)+'</small></span></div>').join("")+
     '<p class="cln">Новые задания каждый день в 00:00 МСК. Каждое задание — ещё и <b>+1 🔥 факел</b> для Покорения. Опыт идёт и просто за игру: карточка +4, победа +6, бой в Покорении +10</p></div>'+
    '<div class="box pstrack"><div class="rowb"><h3>🏆 Награды сезона</h3>'+(V.can?'<button type="button" class="mini2 pscall" id="ps-all">Забрать всё · '+V.can+'</button>':"")+'</div><div class="pshd"><span>Бесплатно</span><span></span><span>🎖 Пропуск</span></div>'+
     '<div class="psrows" style="--fill:'+(Math.min(V.lv,PASS.lv)/PASS.lv*100)+'%">'+rows+'</div></div>';
  if($("ps-buy"))$("ps-buy").onclick=()=>buyItem({item:"pass"});if($("ps-all"))$("ps-all").onclick=psAll;
  b.querySelector(".psrows").onclick=async e=>{const t=e.target.closest(".pst");if(!t)return;const l=+t.dataset.lv,pr=!!t.dataset.prem;
    if(t.classList.contains("got")){toast("Уже получено");return}if(t.classList.contains("lock")){toast("Открой пропуск, чтобы забрать");$("ps-buy")&&$("ps-buy").scrollIntoView({block:"center"});return}
    if(t.classList.contains("wait")){toast("Нужен "+l+" уровень. Выполняй задания дня");return}await psClaim(l,pr,t)}}
let psBusy=false;
async function psClaim(l,pr,el){if(psBusy)return;psBusy=true;try{const r=await act("pass_claim",{lv:l,prem:pr?1:0});if(!r)return;sfx.coin();hap("medium");
  if(el){el.classList.add("pop");const rc=el.getBoundingClientRect();try{boom(rc.left+rc.width/2,rc.top+rc.height/2)}catch(x){}}
  const t=[r.cash?"+"+fmtN(r.cash)+" 🪙":"",r.runes?"+"+fmtN(r.runes)+" 💠":"",r.sp?"+"+r.sp+" 🎴":"",r.guar?"гарантированный эпик":"",r.title?"титул «Герой сезона»":"",r.frame?"сезонная рамка":""].filter(Boolean).join(" · ");
  if(r.card){sfx.fanfare();showGrant({cards:[r.card]},"🎖 Награда "+l+" уровня!")}else if(t)toast("🎖 "+t);psKey="";setTimeout(()=>{renderAll()},el?260:0)}finally{psBusy=false}}
async function psAll(){const V=passView();const todo=[];for(let l=1;l<=V.lv;l++){if(!V.P.f.includes(l))todo.push([l,0]);if(V.prem&&!V.P.p.includes(l))todo.push([l,1])}
  let sum={cash:0,runes:0,sp:0},cards=[];for(const [l,p] of todo){const r=await act("pass_claim",{lv:l,prem:p});if(!r)break;sum.cash+=r.cash||0;sum.runes+=r.runes||0;sum.sp+=r.sp||0;if(r.card)cards.push(r.card)}
  sfx.fanfare();hapN("success");burst(2);psKey="";renderAll();const t=[sum.cash?"+"+fmtN(sum.cash)+" 🪙":"",sum.runes?"+"+fmtN(sum.runes)+" 💠":"",sum.sp?"+"+sum.sp+" 🎴":""].filter(Boolean).join(" · ");
  if(cards.length)showGrant({cards,sp:sum.sp},"🎖 Награды сезона!");else if(t)toast("🎖 Получено: "+t)}
/* полоска сезона на главном экране */
function drawPassStrip(){if(!S)return;let el=$("ps-strip");const fb=$("free-box");if(!fb)return;if(!el){el=document.createElement("button");el.type="button";el.id="ps-strip";el.className="psstrip";fb.before(el);el.onclick=()=>goSub("pass")}
  const V=passView(),xpIn=V.lv>=PASS.lv?PASS.xp:V.P.xp-V.lv*PASS.xp,qd=V.qs.filter(q=>q.done).length,T=V.T;el.style.cssText="--c0:"+T.c[0]+";--c1:"+T.c[1]+";--c2:"+T.c[2];
  const h='<i class="pss-ic">'+T.ic+'</i><span class="pss-t"><b>'+T.n+' · ур. '+V.lv+'</b><small>'+(V.can?"🎁 Награды ждут: "+V.can:"📜 Задания дня: "+qd+"/4")+'</small><u><s style="width:'+(xpIn/PASS.xp*100)+'%"></s></u></span>'+(V.can?'<em>'+V.can+'</em>':'<span class="pss-go">›</span>');
  if(el.dataset.h!==h){el.dataset.h=h;el.innerHTML=h}el.classList.toggle("hot",!!V.can)}
{const _ra=renderAll;renderAll=function(){_ra();try{drawConq()}catch(e){console.error(e)}try{drawPass()}catch(e){console.error(e)}try{drawPassStrip()}catch(e){console.error(e)}}}
/* задание дня выполнено — сразу говорим */
{const _a2=act;act=async function(n,p){const r=await _a2(n,p);try{(r&&r.events||[]).forEach(e=>{if(e.t==="pq"){toast("📜 Задание выполнено: "+e.q+" · +"+e.xp+" XP"+(e.torch?" и +1 🔥":""));hap("medium")}})}catch(e){}return r}}
{const _ps=payShow;payShow=function(r){if(r&&r.status==="done"&&r.item==="pass"){renderAll();sfx.fanfare();hapN("success");burst(4);toast("🎖 Пропуск открыт! Забирай награды");psKey="";goSub("pass");return}return _ps(r)}}
/* лёгкий режим лагеря выключает декоративные анимации во всей игре */
{const _la=liteApply;liteApply=function(){_la();try{document.body.classList.toggle("lite",campLite)}catch(e){}};try{document.body.classList.toggle("lite",campLite)}catch(e){}}

/* «что нового» — только тем, кто был в игре до обновления. Новички видят только обучение */
const NEWS4_CUT=Date.UTC(2026,9,25,17,45);
function newsUpd4(){if(!S||!ONLINE||!$("modal").hidden||document.querySelector(".wrev,.onb-hl,.terms,.cqbt"))return false;if(!S.created||S.created>=NEWS4_CUT)return true;
  try{if(localStorage.getItem("we-news-upd4"))return true;if(termsNeed())return false;localStorage.setItem("we-news-upd4","1")}catch(e){return true}
  const m=$("modal"),sh=$("msheet");m.hidden=false;const T=passTheme(passSeason(NOW()));
  sh.innerHTML='<div class="box nickbox newsb"><h3>⚔️ Большое обновление!</h3><ul>'+
   '<li>🗺 <b>Покорение Эпох</b> — карта мира: 5 глав, 40 земель и боссы. Отряд из 3 воинов, слабости эпох, сундуки с карточками</li>'+
   '<li>'+T.ic+' <b>'+T.n+'</b> — задания каждый день и 30 уровней наград, вплоть до легендарных карточек</li>'+
   '<li>🔥 <b>Слияние душ</b> — сожги копии воина и получи звезду без прокачки</li>'+
   '<li>🎰 <b>Кейс «Удача»</b> — 12 подарков, вплоть до Короны Эпох</li></ul>'+
   '<button type="button" class="craftbtn" id="n4-go">🗺 Покорять земли</button><button type="button" class="ghost" id="n4-ps">'+T.ic+' Открыть сезон</button></div>';
  $("n4-go").onclick=()=>{closeModal();goSub("conq")};$("n4-ps").onclick=()=>{closeModal();goSub("pass")};return true}
{let n=0;const t=setInterval(()=>{if(++n>30||newsUpd4())clearInterval(t)},4000)}
/* ссылки из бота: ?conq=1 — карта, ?pass=1 — сезон */
{const q=new URLSearchParams(location.search),k=q.get("conq")?"conq":q.get("pass")?"pass":null;if(k){const t=setInterval(()=>{if(!S)return;clearInterval(t);setTimeout(()=>{try{localStorage.setItem("we-news-upd4","1")}catch(e){}goSub(k)},600)},300)}}
/* подарок новичку на 2-й прокрутке */
{const _a3=act;act=async function(n,p){const r=await _a3(n,p);try{if(n==="open"&&r&&r.wel)setTimeout(()=>{sfx.fanfare();hapN("success");burst(4);toast("🎁 Подарок новичку: ЛЕГЕНДАРНЫЙ воин с блеском! Добро пожаловать в «Воины Эпох»")},1900)}catch(e){}return r}}

/* ===================== АДМИН: звёзды и всё новое ===================== */
const ITEM_N={pass:"🎖 Сезонный пропуск",vip:"👑 VIP",gift:"🎁 Подарки",golem:"🗿 Голем",fx:"✨ Ник",num:"✍️ Свой номер",any:"🃏 Любая карточка",newbie:"🐣 Новичку",small:"📦 Малый сундук",royal:"👑 Королевский",warrior:"⚔️ Воинский",legend:"🌟 Легендарный",mythic:"🐉 Мифический",dream:"💭 Карточка мечты",custom:"💭 Карточка мечты"};
function drawStatsX(){const R=stData&&stData.x,b=$("st-body");if(!R||!b||R.err&&!R.stars){if(R&&R.err&&b)b.insertAdjacentHTML("beforeend",'<p class="cln">Ошибка статистики: '+R.err+'</p>');return}
  const X=document.createElement("div");X.className="stx";const tile=(v,l,sub)=>`<div class="stt"><b class="num">${v}</b><span>${l}</span>${sub?`<small>${sub}</small>`:""}</div>`,dt=t=>{const d=new Date(t+3*3600e3);return d.toISOString().slice(8,10)+"."+d.toISOString().slice(5,7)+" "+d.toISOString().slice(11,16)};
  const S0=R.stars,mx=Math.max(1,...R.starsDays.map(d=>d.s)),W=300,H=96,bw=W/R.starsDays.length;
  const bars=R.starsDays.map((d,i)=>{const h=d.s/mx*(H-22);return `<rect x="${i*bw+2}" y="${H-14-h}" width="${bw-4}" height="${h}" rx="2" fill="#ffb800"><title>${d.d}: ${d.s} ⭐</title></rect>`+(d.s?`<text x="${i*bw+bw/2}" y="${H-17-h}" text-anchor="middle" font-size="8" fill="#5a5f80">${d.s}</text>`:"")+(i%2===1?`<text x="${i*bw+bw/2}" y="${H-2}" text-anchor="middle" font-size="8.5" fill="#5a5f80">${d.d.slice(8)}</text>`:"")}).join("");
  const C=R.conq,P=R.season,F=R.fuse,K=R.clans,V=R.vip,T=R.today,G=R.gifts;
  X.innerHTML=`<h4>⭐ Звёзды (донат)</h4><div class="stgrid">
    ${tile(fmtN(S0.all.s)+" ⭐","потрачено всего",S0.all.n+" покупок · "+S0.all.u+" донатеров")}
    ${tile(fmtN(S0.today.s)+" ⭐","сегодня",S0.today.n+" покупок · "+S0.today.u+" чел.")}
    ${tile(fmtN(S0.week.s)+" ⭐","за 7 дней",S0.week.n+" покупок · "+S0.week.u+" чел.")}
    ${tile(fmtN(S0.refund.s)+" ⭐","возвраты",S0.refund.n+" шт.")}${R.bal?tile(fmtN(R.bal.left)+" ⭐","на игровых балансах",R.bal.users+" игроков · потрачено с баланса "+fmtN(R.bal.spent)+" ⭐ ("+R.bal.buys+" пок.)"):""}</div>
    <svg viewBox="0 0 ${W} ${H}" class="stch">${bars}</svg>
    <div class="stl"><b>По товарам</b>${S0.items.map(i=>`<div class="str"><span>${ITEM_N[i.item]||i.item}</span><i>${i.n} шт.${i.t?" · сегодня "+i.t:""}</i><b>${fmtN(i.s)} ⭐</b></div>`).join("")||"<p class=cln>Покупок пока нет</p>"}</div>
    <div class="stl"><b>Кто сколько потратил</b>${S0.top.map((u,i)=>`<div class="str"><span>${i+1}. <q data-n="${i}"></q></span><i>${u.n} пок. · ${dt(u.last)}</i><b>${fmtN(u.s)} ⭐</b></div>`).join("")||"<p class=cln>Пока никто</p>"}</div>
    <div class="stl"><b>Последние покупки</b>${S0.last.map((p,i)=>`<div class="str"><span><q data-l="${i}"></q></span><i>${ITEM_N[p.item]||p.item} · ${dt(p.t)}</i><b>${p.stars} ⭐</b></div>`).join("")}</div>
    <h4>🎖 ${P.name} (сезон ${P.no}, до ${dt(P.end).slice(0,5)})</h4><div class="stgrid">
    ${tile(fmtN(P.act||0),"играют в сезон","из "+fmtN(P.n||0)+" зашедших в сезоне")}
    ${tile(fmtN(P.prem||0),"купили пропуск",fmtN((P.prem||0)*PASS.stars)+" ⭐")}
    ${tile((+(P.lv||0)).toFixed(1),"средний уровень","10+: "+(P.l10||0)+" · 20+: "+(P.l20||0)+" · 30: "+(P.l30||0))}
    ${tile(fmtN(P.quests||0),"заданий сделано сегодня",(P.questDay||0)+" игроков заходили · забрано наград "+T.passClaim)}</div>
    <h4>🗺 Покорение Эпох</h4><div class="stgrid">
    ${tile(fmtN(C.n||0),"игроков прошли точки","в среднем "+(+(C.av||0)).toFixed(1)+" точек")}
    ${tile(fmtN(C.today),"боёв сегодня","за 7 дней "+C.week)}
    ${tile((C.mx||0)+" / 40","лучший результат",(C.top||[]).length?"":"")}
    ${tile(fmtN(C.ch1||0),"прошли 1-ю главу","2-ю: "+(C.ch2||0)+" · 3-ю: "+(C.ch3||0)+" · 4-ю: "+(C.ch4||0)+" · все: "+(C.ch5||0))}</div>
    <div class="stl"><b>Дальше всех</b>${(C.top||[]).map((u,i)=>`<div class="str"><span>${i+1}. <q data-c="${i}"></q></span><i>глава ${Math.min(5,Math.floor(u.c/8)+1)}</i><b>${u.c} точек</b></div>`).join("")}</div>
    <h4>🔥 Слияние, звёзды, новички</h4><div class="stgrid">
    ${tile(fmtN(F.today),"слияний душ сегодня","за 7 дней "+F.week+" · закалок сегодня "+F.forge)}
    ${tile(fmtN(F.starred),"карточек со звёздами",fmtN(F.stars)+" звёзд всего")}
    ${tile(fmtN(R.wel.got),"новичков получили легендарку",R.wel.wait+" ещё не дошли до 2-й прокрутки")}</div>
    <h4>🛡 Кланы, казино, VIP</h4><div class="stgrid">
    ${tile(fmtN(K.n),"кланов",K.members+" игроков в кланах")}
    ${tile(fmtN(K.hitsToday),"ударов по боссам сегодня","за неделю урон "+fmtN(K.dmg)+" от "+K.hitters+" чел.")}
    ${tile(fmtN(T.case),"кейсов открыто сегодня","слоты "+T.slot+" · больше-меньше "+T.hl+" · обменов "+T.ex)}
    ${tile(fmtN(V.n),"VIP сейчас","💎 "+V.diamond+" · 👑 "+V.gold+" · 🗿 голем у "+V.golem)}
    ${tile(fmtN(Object.values(G).reduce((a,b)=>a+b,0)),"подарков выпущено","за звёзды "+(G.star||0)+" · из кейса "+(G.case||0)+" · подарено "+(R.giftSent||0))}
    ${tile(fmtN(T.era),"эпох собрано сегодня","")}</div>`;
  b.append(X);X.querySelectorAll("q[data-n]").forEach(e=>e.textContent=S0.top[+e.dataset.n].name||"?");X.querySelectorAll("q[data-l]").forEach(e=>e.textContent=S0.last[+e.dataset.l].name||"?");X.querySelectorAll("q[data-c]").forEach(e=>e.textContent=C.top[+e.dataset.c].name||"?")}
{const _ds=drawStats;drawStats=function(){_ds();try{drawStatsX()}catch(e){console.error(e)}}}

/* ===================== АДМИН: ссылки для блогеров/партнёров ===================== */
const SRC_LINK="https://t.me/VoinyEpohBot?startapp=s_";
function drawLinks(){const R=stData,b=$("st-body");if(!R||!b)return;const L=R.streaks||[],F=Object.fromEntries((R.srcs||[]).map(r=>[r.code,r]));
  const box=document.createElement("div");box.className="srcbox lnk";
  box.innerHTML='<h4>🔗 Ссылки для людей: сколько привёл и сколько дней подряд играют</h4>'+
   '<div class="lnk-new"><input id="lnk-in" maxlength="32" placeholder="имя, например ivan или blogger1"><button type="button" class="craftbtn" id="lnk-go">Создать ссылку</button></div><div id="lnk-out"></div>'+
   (L.length?'<div class="srct s"><b>метка</b><b>пришло</b><b>2+ дня</b><b>3+</b><b>5+ подряд</b><b>7+</b><b>сейчас</b></div>'+L.sort((a,b)=>b.n-a.n).map((r,i)=>'<button type="button" class="srct s" data-code="'+i+'"><span></span><i>'+r.n+'</i><i>'+(r.s2||0)+'</i><i>'+(r.s3||0)+'</i><i class="'+(r.s5?"hot":"")+'">'+(r.s5||0)+'</i><i>'+(r.s7||0)+'</i><i>'+(r.now2||0)+'</i></button>').join("")+
    '<p class="cln">«Пришло» — новые игроки по ссылке. «5+ подряд» — сколько из них заходили 5 дней подряд или больше. «Сейчас» — у кого серия идёт прямо сейчас (заходил вчера и сегодня). Нажми на строку — увидишь каждого игрока.</p>':'<p class="cln">По ссылкам пока никто не пришёл</p>');
  b.append(box);box.querySelectorAll(".srct.s span").forEach((e,i)=>e.textContent=L[i].code);
  const make=()=>{const v=($("lnk-in").value||"").trim().toLowerCase().replace(/[^a-z0-9_-]/g,"").slice(0,32);if(!v){toast("Только латиница, цифры, _ и -");return}
    const url=SRC_LINK+v;$("lnk-out").innerHTML='<div class="lnk-url"><code></code><button type="button" class="mini2" id="lnk-cp">Копировать</button></div><p class="cln">Отдай эту ссылку человеку. Все, кто по ней придут, будут считаться в строке «'+v+'» (появится после первого перехода).</p>';
    $("lnk-out").querySelector("code").textContent=url;$("lnk-cp").onclick=()=>{try{navigator.clipboard.writeText(url);toast("Скопировано")}catch(e){toast(url)}}};
  $("lnk-go").onclick=make;
  box.querySelectorAll("[data-code]").forEach(e=>e.onclick=async()=>{const code=L[+e.dataset.code].code;const r=await act("src_users",{code});if(!r)return;
    const dt=t=>{if(!t)return "—";const d=new Date(t+3*3600e3).toISOString();return d.slice(8,10)+"."+d.slice(5,7)};
    const d=wSheet('<h3 style="margin:0 0 4px">🔗 '+code.replace(/[<>&]/g,"")+' — '+r.rows.length+' игроков</h3><p class="cln">Ссылка: '+SRC_LINK+code.replace(/[<>&]/g,"")+'<br>Серия — сколько дней подряд заходил (лучшая), сейчас — текущая серия.</p><div class="lnk-list"><div class="lnk-r h"><b>игрок</b><b>пришёл</b><b>был</b><b>дней</b><b>серия</b><b>сейчас</b></div>'+
      r.rows.map((u,i)=>'<div class="lnk-r'+(u.mx>=5?" hot":"")+'"><span data-i="'+i+'"></span><i>'+dt(u.created)+'</i><i>'+dt(u.seen)+'</i><i>'+u.days+'</i><b>'+u.mx+'</b><i>'+(u.cur||"—")+'</i></div>').join("")+'</div>');
    d.querySelectorAll("[data-i]").forEach(e=>e.textContent=r.rows[+e.dataset.i].name||"?")})}
{const _ds2=drawStats;drawStats=function(){_ds2();try{drawLinks()}catch(e){console.error(e)}}}

/* ===================== розыгрыш на звёзды: три победителя ===================== */
{const _dc=drawChal;drawChal=function(){_dc();try{const C=chData;if(!C||!C.multi)return;const hm=t=>new Date(t+3*3600e3).toISOString().slice(11,16),T=C.tickets||0;
  $("chal").querySelector(".chal-h span").textContent="⭐ РОЗЫГРЫШ 600 ЗВЁЗД";
  const dd=t=>new Date(t+3*3600e3).toISOString().slice(0,10);$("chal-t").textContent=C.phase==="soon"?(dd(C.start)===dd(NOW())?"Сегодня":"Завтра")+" с "+hm(C.start)+" до "+hm(C.end)+": пригласи "+C.min+" друзей — и ты в розыгрыше. Три победителя: 300, 200 и 100 ⭐!":"Пригласи "+C.min+" друзей — и ты участник. Каждый друг = 1 билет: чем больше друзей, тем больше шанс. В "+hm(C.end)+" бот выберет трёх победителей: 300, 200 и 100 ⭐. Звёзды — на игровой баланс.";
  $("chal-p").innerHTML=C.prizes.map((p,k)=>'<div>'+["🥇","🥈","🥉"][k]+'<b>'+p+'</b>'+(k+1)+' место</div>').join("")+'<div>🎟<b>'+T+'</b>'+plural(T,"билет","билета","билетов")+'</div>';
  $("chal-rules").textContent="Считаются только живые новые игроки, которые пришли сегодня с "+hm(C.start)+" до "+hm(C.end)+" по твоей ссылке и открыли хотя бы "+C.need+" карточки. Друг твоего друга тоже засчитывается тебе. От "+C.min+" друзей ты участник, каждый друг — 1 билет. В "+hm(C.end)+" бот случайно выбирает трёх разных победителей: чем больше билетов, тем выше шанс. Призы: 300, 200 и 100 ⭐ на игровой баланс — ими можно оплатить любые покупки в игре. Время — минское. Накрутка ботами и пустыми аккаунтами = снятие с розыгрыша."}catch(e){console.error(e)}}}

/* ===================== игровой баланс звёзд ===================== */
function balBadge(){if(!S)return;const n=S.starBal||0;let b=$("starbal");const host=$("gold-body");if(!host)return;
  if(!n){if(b)b.remove();return}if(!b||!host.contains(b)){b=document.createElement("div");b.id="starbal";b.className="starbal";host.prepend(b)}
  b.innerHTML='<b>⭐ '+fmtN(n)+'</b><span>звёзд на игровом балансе<small>Ими можно оплатить любую покупку здесь — выбери «Оплатить с баланса»</small></span>'}
{const _rg5=renderGold;renderGold=function(){_rg5();try{balBadge()}catch(e){}}}
{const _bi=buyItem;buyItem=async function(p){const n=(S&&S.starBal)||0;if(!n||!ONLINE||p&&p._tg)return _bi(p);
  wSheet('<h3 style="margin:0 0 6px">Как оплатить?</h3><p class="cln">На игровом балансе <b>⭐ '+fmtN(n)+'</b>. Если звёзд на балансе не хватит, игра скажет — тогда оплати через Telegram.</p><button type="button" class="craftbtn" data-bal="1">⭐ Оплатить с баланса</button><button type="button" class="ghost" data-tg="1" style="width:100%;margin-top:8px">Оплатить через Telegram</button>',
   btn=>{if(btn.dataset.tg){_bi(Object.assign({},p,{_tg:1}));return}if(btn.dataset.bal){(async()=>{if(goldBusy)return;goldBusy=true;try{const r=await act("pay_bal",p);if(r)payShow(r)}finally{goldBusy=false}})();return}})}}

/* ===================== КЛАН: роли, приглашения по нику, награды, исключение ===================== */
const esc=t=>String(t==null?"":t).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"})[c]);
{const _dcl=drawClan;drawClan=function(){_dcl();try{clanExtra()}catch(e){console.error(e)}}}
function clanExtra(){const b=$("clan-body"),D=clData;if(!b||!D)return;
  if(!D.clan){if(D.inv&&D.inv.length){const box=document.createElement("div");box.className="box clinv";box.innerHTML='<h3>📩 Тебя зовут в клан</h3>'+D.inv.map((v,i)=>'<div class="clir"><span><b data-n="'+i+'"></b><small data-f="'+i+'"></small></span><button type="button" class="craftbtn" data-acc="'+v.id+'">Вступить</button><button type="button" class="mini2" data-dec="'+v.id+'">✕</button></div>').join("");
      b.prepend(box);box.querySelectorAll("[data-n]").forEach(e=>e.textContent="🛡 "+D.inv[+e.dataset.n].name);box.querySelectorAll("[data-f]").forEach(e=>e.textContent="зовёт "+(D.inv[+e.dataset.f].from_name||"игрок"));
      box.onclick=async e=>{const a=e.target.closest("[data-acc]"),d=e.target.closest("[data-dec]");if(a){const r=await act("clan_join",{id:+a.dataset.acc});if(r){sfx.fanfare();toast("🛡 Ты в клане!");await loadClan()}}else if(d){await act("clan_decline",{id:+d.dataset.dec});await loadClan()}}}
    return}
  const C=D.clan,meBoss=C.owner===S.uid,meDep=C.deputy===S.uid,mgr=meBoss||meDep;
  const rows=b.querySelectorAll(".clmem .clr");rows.forEach((r,i)=>{const m=C.members[i];if(!m)return;r.dataset.uid=m.uid;r.classList.add("tap");const nm=r.querySelector(".clnm");
    nm.textContent=(m.uid===C.owner?"👑 ":m.uid===C.deputy?"⭐ ":"")+(m.vip?"💎 ":"")+m.name+(m.uid===S.uid?" (ты)":"");if(m.uid!==S.uid){const g=document.createElement("em");g.className="clgo";g.textContent="›";r.append(g)}});
  const head=b.querySelector(".clmem .rowb");if(head&&mgr&&!$("cl-invn")){const bt=document.createElement("button");bt.type="button";bt.className="mini2";bt.id="cl-invn";bt.textContent="+ По нику";head.append(bt)}
  const sub=b.querySelector(".clhead small");if(sub)sub.textContent=C.members.length+"/"+CLAN.max+" участников"+(C.place?" · "+C.place+" место за неделю":"")+(meBoss?" · ты глава 👑":meDep?" · ты правая рука ⭐":"");
  const legend=b.querySelector(".clmem .cln.lg");if(!legend){const p=document.createElement("p");p.className="cln lg";p.textContent="👑 глава · ⭐ правая рука. Нажми на участника: подарить карточку, обменяться"+(meBoss?", наградить монетами, назначить правой рукой или исключить":mgr?" или исключить":"");b.querySelector(".clmem").insertBefore(p,b.querySelector("#cl-leave"))}
  const mem=b.querySelector(".clmem");mem.onclick=e=>{if(e.target.closest("#cl-invn")){clInviteSheet();return}const r=e.target.closest(".clr[data-uid]");if(!r)return;const m=C.members.find(x=>String(x.uid)===r.dataset.uid);if(m&&m.uid!==S.uid)clMemberSheet(C,m)}}
function clInviteSheet(){wSheet('<h3 style="margin:0 0 6px">📩 Позвать в клан по нику</h3><p class="cln">Игроку придёт приглашение в бота и в игре. В клане может быть до '+CLAN.max+' человек.</p><input id="cl-nk" class="trin" maxlength="20" placeholder="Ник игрока"><button type="button" class="craftbtn" data-go="1">Отправить приглашение</button>',
  btn=>{if(!btn.dataset.go)return;(async()=>{const r=await act("clan_invite",{nick:$("cl-nk").value});if(r){sfx.coin();toast("📩 Приглашение отправлено: "+r.name);document.querySelectorAll(".wsheet").forEach(x=>x.remove())}})();return false})}
function clMemberSheet(C,m){const meBoss=C.owner===S.uid,meDep=C.deputy===S.uid,canKick=m.uid!==C.owner&&(meBoss||(meDep&&m.uid!==C.deputy));
  wSheet('<h3 style="margin:0 0 2px"><span id="clm-n"></span></h3><p class="cln">'+(m.uid===C.owner?"👑 Глава клана":m.uid===C.deputy?"⭐ Правая рука":"Участник")+' · урон за неделю '+fmtN(m.dmg)+'</p>'+
   '<div class="clacts"><button type="button" class="ghost" data-a="gift">🎁 Подарить карточку</button><button type="button" class="ghost" data-a="swap">🔄 Предложить обмен</button>'+
   (meBoss?'<button type="button" class="ghost" data-a="reward">🎖 Наградить монетами</button><button type="button" class="ghost" data-a="dep">'+(m.uid===C.deputy?"⭐ Снять с правой руки":"⭐ Сделать правой рукой")+'</button>':"")+
   (canKick?'<button type="button" class="ghost bad" data-a="kick">🚫 Исключить из клана</button>':"")+'</div>',
   btn=>{const a=btn.dataset.a;if(!a)return;
     if(a==="gift"){trPickMine("gift",{uid:m.uid,name:m.name});return}
     if(a==="swap"){trTheirCards({uid:m.uid});return}
     if(a==="reward"){clRewardSheet(m);return}
     if(a==="dep"){(async()=>{const r=await act("clan_deputy",{uid:m.uid===C.deputy?0:m.uid});if(r){toast(r.deputy?"⭐ "+m.name+" — правая рука":"Правая рука снята");loadClan()}})();return}
     if(a==="kick"){if(NOW()-(clMemberSheet.k||0)>4000||clMemberSheet.u!==m.uid){clMemberSheet.k=NOW();clMemberSheet.u=m.uid;toast("Нажми ещё раз, чтобы исключить "+m.name);return false}
       (async()=>{const r=await act("clan_kick",{uid:m.uid});if(r){toast("🚫 "+m.name+" исключён");loadClan()}})();return}});
  $("clm-n").textContent=m.name}
function clRewardSheet(m){wSheet('<h3 style="margin:0 0 6px">🎖 Наградить <span id="clr-n"></span></h3><p class="cln">Монеты списываются с твоего счёта и сразу приходят участнику. У тебя: <b>'+fmt(S.cash)+'</b></p><div class="clrw">'+[1000,5000,10000,50000].map(v=>'<button type="button" class="mini2" data-v="'+v+'">'+fmtN(v)+'</button>').join("")+'</div><input id="clr-in" class="trin" type="number" inputmode="numeric" placeholder="Своя сумма"><button type="button" class="craftbtn" data-go="1">Наградить</button>',
  btn=>{if(btn.dataset.v){$("clr-in").value=btn.dataset.v;return false}if(!btn.dataset.go)return;(async()=>{const r=await act("clan_reward",{uid:m.uid,amount:+$("clr-in").value});if(r){sfx.coin();hapN("success");toast("🎖 "+m.name+" получил "+fmtN(r.amount)+" 🪙");renderAll();document.querySelectorAll(".wsheet").forEach(x=>x.remove())}})();return false});$("clr-n").textContent=m.name}

/* ===================== ПОДАРИТЬ КАРТОЧКУ И ОБМЕН ===================== */
const trOk=c=>c&&!c.part&&!away(c)&&!FIN[c.f].excl&&!FIN[c.f].collab;
const trOk2=c=>c&&!away(c)&&!FIN[c.f].excl&&!FIN[c.f].collab;   // половинки тоже можно
function trTarget(cb,title){wSheet('<h3 style="margin:0 0 6px">'+title+'</h3><p class="cln">Напиши ник друга (как в топе и чате)'+((clData&&clData.clan)?" или выбери из клана":"")+'</p><input id="tr-nk" class="trin" maxlength="20" placeholder="Ник друга">'+
  ((clData&&clData.clan)?'<div class="trcl">'+clData.clan.members.filter(m=>m.uid!==S.uid).map(m=>'<button type="button" class="mini2" data-uid="'+m.uid+'" data-nm="'+esc(m.name)+'"></button>').join("")+'</div>':"")+'<button type="button" class="craftbtn" data-go="1">Дальше</button>',
  btn=>{if(btn.dataset.uid){cb({uid:+btn.dataset.uid,name:btn.dataset.nm});return}if(btn.dataset.go){const v=$("tr-nk").value.trim();if(!v){toast("Напиши ник");return false}cb({nick:v,name:v});return}return false});
  document.querySelectorAll(".trcl [data-uid]").forEach(b=>b.textContent=b.dataset.nm)}
function trPickMine(mode,to,their){const L=S.cards.filter(trOk2).sort((a,b)=>b.v-a.v);if(!L.length){toast("Нет карточек, которые можно передать");return}
  wSheet('<h3 style="margin:0 0 4px">'+(mode==="gift"?"🎁 Какую карточку подарить?":"🔄 Что отдашь взамен?")+'</h3><p class="cln">'+(mode==="gift"?"Получатель: ":"Обмен с ")+'<b id="trp-n"></b>. Нельзя: на рынке, в походе, «Основатель» и «Бесценная»</p><div class="cqpk">'+L.slice(0,60).map(c=>'<button type="button" class="cqpi" data-id="'+c.id+'">'+miniSlot(c)+'<span>'+HEROES[c.h][0]+'</span><b>'+fmt(c.v)+'</b></button>').join("")+'</div>',
   btn=>{const id=btn.dataset.id;if(!id)return;const c=S.cards.find(x=>String(x.id)===id);if(mode==="gift")trConfirmGift(c,to);else trConfirmSwap(c,their,to);return});$("trp-n").textContent=to.name}
function trConfirmGift(c,to){wSheet('<h3 style="margin:0 0 6px;text-align:center">🎁 Подарить?</h3><div style="width:150px;margin:0 auto">'+miniSlot(c)+'</div><p class="cln" style="text-align:center"><b>'+HEROES[c.h][0]+'</b> ('+FIN[c.f].k.toLowerCase()+', '+fmt(c.v)+') уйдёт к <b id="trc-n"></b> навсегда. Можно дарить до 5 карточек в день.</p><button type="button" class="craftbtn" data-go="1">🎁 Подарить</button>',
  btn=>{if(!btn.dataset.go)return;(async()=>{const r=await act("tr_gift",Object.assign({id:c.id},to.uid?{uid:to.uid}:{nick:to.nick}));if(r){sfx.fanfare();burst(2);hapN("success");toast("🎁 Карточка подарена: "+r.to);closeModal();renderAll()}})();return});$("trc-n").textContent=to.name}
async function trTheirCards(to,myCard){const r=await act("tr_cards",to.uid?{uid:to.uid}:{nick:to.nick});if(!r)return;const who={uid:r.uid,name:r.name};if(!r.cards.length){toast("У "+r.name+" нет карточек для обмена");return}
  wSheet('<h3 style="margin:0 0 4px">🔄 Что хочешь у <span id="trt-n"></span>?</h3><p class="cln">Выбери карточку — потом предложишь свою взамен</p><div class="cqpk">'+r.cards.map(c=>'<button type="button" class="cqpi" data-id="'+c.id+'">'+miniSlot(c)+'<span>'+HEROES[c.h][0]+'</span><b>'+fmt(c.v)+'</b></button>').join("")+'</div>',
   btn=>{const id=btn.dataset.id;if(!id)return;const tc=r.cards.find(x=>String(x.id)===id);if(myCard)trConfirmSwap(myCard,tc,who);else trPickMine("swap",who,tc);return});$("trt-n").textContent=r.name}
function trConfirmSwap(mine,their,to){wSheet('<h3 style="margin:0 0 6px;text-align:center">🔄 Предложить обмен</h3><div class="trsw"><div>'+miniSlot(mine)+'<small>отдаёшь<br><b>'+fmt(mine.v)+'</b></small></div><i>⇄</i><div>'+miniSlot(their)+'<small>получаешь<br><b>'+fmt(their.v)+'</b></small></div></div><p class="cln" style="text-align:center"><b id="trs-n"></b> получит предложение в бота и сможет принять его в течение 24 часов.</p><button type="button" class="craftbtn" data-go="1">Отправить предложение</button>',
  btn=>{if(!btn.dataset.go)return;(async()=>{const r=await act("tr_offer",Object.assign({my:mine.id,their:their.id},to.uid?{uid:to.uid}:{nick:to.nick}));if(r){sfx.coin();toast("🔄 Предложение отправлено: "+r.to);closeModal()}})();return});$("trs-n").textContent=to.name}
async function trInbox(){const r=await act("tr_list");if(!r)return;const I=r.items;
  wSheet('<h3 style="margin:0 0 6px">🔄 Обмены</h3>'+(I.length?I.map((t,i)=>'<div class="trrow"><p><b data-w="'+i+'"></b> '+(t.mine?"— ждём ответа":"предлагает обмен")+'</p><div class="trsw sm"><div>'+(t.give?miniSlot(t.give):"—")+'<small>'+(t.mine?"ты отдаёшь":"ты отдаёшь")+'</small></div><i>⇄</i><div>'+(t.get?miniSlot(t.get):"—")+'<small>ты получаешь</small></div></div>'+
    (t.mine?'<button type="button" class="ghost" data-no="'+t.id+'">Отменить</button>':'<div class="trbt"><button type="button" class="craftbtn" data-ok="'+t.id+'">✅ Принять</button><button type="button" class="ghost" data-no="'+t.id+'">Отказаться</button></div>')+'</div>').join(""):'<p class="cln">Обменов пока нет. Открой свою карточку и нажми «🔄 Обменять» или выбери игрока в клане.</p>'),
   btn=>{const ok=btn.dataset.ok,no=btn.dataset.no;if(!ok&&!no)return;(async()=>{const r2=await act(ok?"tr_accept":"tr_decline",{id:+(ok||no)});if(r2){if(ok){sfx.fanfare();burst(3);hapN("success");toast("✅ Обмен состоялся!")}else toast("Готово");renderAll()}trInbox()})();return});
  document.querySelectorAll(".trrow [data-w]").forEach(e=>e.textContent=I[+e.dataset.w].who||"Игрок")}
/* кнопки в карточке */
{const _ocv=openCardView;openCardView=function(c,o){_ocv(c,o);try{if(!o||!o.mine||!ONLINE||!trOk2(c))return;const sh=$("msheet"),info=sh.querySelector(".cv-info");if(!info||sh.querySelector(".trbox"))return;
  const d=document.createElement("div");d.className="trbox";d.innerHTML='<button type="button" class="mini2" data-t="g">🎁 Подарить</button><button type="button" class="mini2" data-t="s">🔄 Обменять</button>';info.after(d);
  d.onclick=e=>{const b=e.target.closest("[data-t]");if(!b)return;const cur=S.cards.find(x=>x.id===c.id)||c;if(b.dataset.t==="g")trTarget(to=>trConfirmGift(cur,to),"🎁 Кому подарить?");else trTarget(to=>trTheirCards(to,cur),"🔄 С кем обменяться?")}}catch(e){console.error(e)}}}
/* значок входящих обменов во вкладке «Мои» */
function trBadge(){if(!S||!ONLINE)return;const sec=$("sec-col");if(!sec||sec.hidden)return;let b=$("tr-in");if(!b){b=document.createElement("button");b.type="button";b.id="tr-in";b.className="trin-b";b.onclick=trInbox;const sub=sec.querySelector(".subnav");if(sub)sub.after(b);else sec.prepend(b)}
  const n=S.trIn||0;b.innerHTML='🔄 Обмены'+(n?' <em>'+n+'</em>':'');b.classList.toggle("hot",n>0)}
{const _ra3=renderAll;renderAll=function(){_ra3();try{trBadge()}catch(e){}}}
{const q=new URLSearchParams(location.search);if(q.get("trades")||q.get("cards")){const t=setInterval(()=>{if(!S)return;clearInterval(t);setTimeout(()=>{setTab("col");if(q.get("trades"))trInbox()},700)},300)}}

/* ===================== АДМИН: передачи карточек (поиск твинков) ===================== */
let trSt=null,trStAt=0;
async function drawTrStats(){const b=$("st-body");if(!b||!S||!S.admin)return;let box=$("trst");if(!box){box=document.createElement("div");box.id="trst";box.className="srcbox trst";b.append(box)}else b.append(box);
  if(!trSt||NOW()-trStAt>60e3){box.innerHTML='<h4>🎁 Передачи карточек</h4><p class="cln">Загружаю…</p>';const r=await act("tr_stats");if(!r)return;trSt=r;trStAt=NOW()}
  const R=trSt,P=R.pairs;box.innerHTML='<h4>🎁 Передачи карточек — кто кому отдаёт</h4><p class="cln">За 7 дней: подарков <b>'+R.week.gifts+'</b>, обменов <b>'+R.week.swaps+'</b>, отдавали <b>'+R.week.senders+'</b> игроков. Ниже — пары за 30 дней, сверху те, где «перетекло» больше всего (подарок — вся цена карточки, обмен — разница цен). Красным — подозрительные. Нажми на пару — увидишь каждую передачу.</p>'+
   (P.length?P.map((p,i)=>'<button type="button" class="trp'+(p.risk>=2?" bad":p.risk?" warn":"")+'" data-i="'+i+'"><div class="trp-h"><span data-an="'+i+'"></span><i>→</i><span data-bn="'+i+'"></span><b>'+fmt(p.value)+'</b></div><small>🎁 '+p.gifts+' · 🔄 '+p.swaps+' · отдающий играет '+p.adays+' дн.'+(p.apaid?' · донат '+p.apaid+' ⭐':'')+' · получатель '+p.bdays+' дн.</small>'+(p.flags.length?'<em>'+p.flags.join(" · ")+'</em>':'')+'</button>').join(""):'<p class="cln">Передач пока не было</p>');
  box.querySelectorAll("[data-an]").forEach(e=>e.textContent=P[+e.dataset.an].an);box.querySelectorAll("[data-bn]").forEach(e=>e.textContent=P[+e.dataset.bn].bn);
  box.onclick=async e=>{const t=e.target.closest(".trp");if(!t)return;const p=P[+t.dataset.i],r=await act("tr_pair",{a:p.a,b:p.b});if(!r)return;const dt=x=>{const d=new Date(x+3*3600e3).toISOString();return d.slice(8,10)+"."+d.slice(5,7)+" "+d.slice(11,16)};
    wSheet('<h3 style="margin:0 0 4px"><span id="tpa"></span> ⇄ <span id="tpb"></span></h3><p class="cln">id '+p.a+' → id '+p.b+'. Если похоже на твинка — сохрани эти id: по ним можно вернуть карточки и наказать вручную.</p><div class="lnk-list">'+r.rows.map((x,i)=>'<div class="trpr"><small>'+dt(x.t)+'</small><span data-r="'+i+'"></span><b>'+(x.kind==="gift"?fmt(x.av):fmt(x.av)+" ⇄ "+fmt(x.bv))+'</b></div>').join("")+'</div>');
    $("tpa").textContent=p.an;$("tpb").textContent=p.bn;document.querySelectorAll(".trpr [data-r]").forEach(e=>{const x=r.rows[+e.dataset.r],who=x.dir?"→":"←";e.textContent=x.kind==="gift"?"🎁 "+who+" "+x.a:"🔄 "+x.a+" ⇄ "+(x.b||"?")})}}
{const _ds3=drawStats;drawStats=function(){_ds3();try{drawTrStats()}catch(e){console.error(e)}}}

/* ===================== КОНКУРС ИСТОРИЙ ===================== */
{const _dc2=drawChal;drawChal=function(){const C=chData;if(C&&C.story){try{drawStory(C)}catch(e){console.error(e)}return}_dc2()}}
function drawStory(C){const box=$("chal");if(!box)return;box.hidden=false;box.classList.add("story");const hm=t=>new Date(t+3*3600e3).toISOString().slice(11,16),dd=t=>{const d=new Date(t+3*3600e3).toISOString();return d.slice(8,10)+"."+d.slice(5,7)};
  box.querySelector(".chal-h span").textContent="📸 КОНКУРС ИСТОРИЙ";
  if(box.contains(document.activeElement)&&document.activeElement.tagName==="INPUT")return;   // не мешаем печатать
  const key=JSON.stringify([C.phase,C.me,C.players,C.came,C.winners]);if(box.dataset.sk===key)return;box.dataset.sk=key;
  $("chal-t").textContent=C.phase==="soon"?"Завтра с "+hm(C.start)+" до "+hm(C.end)+": выложи историю с нашей игрой в Telegram или Instagram — и участвуй в розыгрыше!":C.phase==="on"?(dd(C.end)!==dd(NOW())?"🔥 Конкурс продлён на 2 дня! ":"⏰ Последний день! ")+"Выложи историю с игрой в Telegram или Instagram до "+dd(C.end)+" "+hm(C.end)+" и не удаляй её 24 часа. Итоги "+dd(C.resAt)+" в "+hm(C.resAt)+", победителей выберем случайно.":C.phase==="wait"?"Приём историй закрыт. Не удаляй свою историю — она должна провисеть сутки! Итоги "+dd(C.resAt)+" в "+hm(C.resAt)+".":"Итоги подведены!";
  $("chal-p").innerHTML=C.prizes.map((p,k)=>'<div>'+["🥇","🥈","🥉"][k]+'<b>'+(k?p:"NFT 🎁")+'</b>'+(k?"на баланс":"~$10 подарок")+'</div>').join("");
  const me=$("chal-me");const joined=!!C.me;
  me.innerHTML=(C.phase==="on"||C.phase==="soon")?'<div class="sty"><div class="sty-s"><b>1</b><span>Возьми фото для истории</span></div><div class="sty-b">'+(tg&&tg.shareToStory?'<button type="button" class="craftbtn" id="st-share">📲 Выложить в Telegram</button>':'')+'<button type="button" class="mini2" id="st-dl">⬇️ Скачать фото</button></div>'+
     '<div class="sty-s"><b>2</b><span>Добавь в историю свою ссылку на бота (стикер «Ссылка»)</span></div><div class="sty-l"><code id="st-link"></code><button type="button" class="mini2" id="st-cp">Копировать</button></div>'+
     '<div class="sty-s"><b>3</b><span>'+(joined?"✅ Ты участвуешь! Не удаляй историю 24 часа":"Укажи, где выложил — по нику проверим историю")+'</span></div>'+
     (joined?'<p class="sty-ok">'+(C.me.tg?"Telegram: @"+esc(C.me.tg)+" ":"")+(C.me.ig?"Instagram: @"+esc(C.me.ig):"")+' · <a href="#" id="st-edit">изменить</a></p>':"")+
     '<div class="sty-f"'+(joined?' hidden':'')+'><input id="st-tg" placeholder="Ник в Telegram (если там)" maxlength="40"><input id="st-ig" placeholder="Ник в Instagram (если там)" maxlength="60"><button type="button" class="craftbtn" id="st-join"'+(C.phase==="soon"?" disabled":"")+'>'+(C.phase==="soon"?"Можно с "+hm(C.start):"✅ Я выложил историю")+'</button></div></div>':
    (joined?'<div class="sty-ok">✅ Ты участвуешь'+(C.phase==="wait"?" — не удаляй историю до итогов!":"")+'</div>':'<div class="sty-ok">Ты не участвовал в этот раз</div>');
  $("chal-top").innerHTML='<div class="sty-n">👥 Участников: <b>'+C.players+'</b> · по твоей ссылке пришли: <b>'+C.came+'</b></div>'+(C.winners?'<div class="sty-w">'+C.winners.map(w=>["🥇","🥈","🥉"][w.place-1]+' <span data-wn="'+w.place+'"></span>').join("<br>")+'</div>':"");
  if(C.winners)C.winners.forEach(w=>{const e=box.querySelector('[data-wn="'+w.place+'"]');if(e)e.textContent=w.name});
  $("chal-go").hidden=true;
  $("chal-rules").textContent="Выложи историю в Telegram или Instagram с фото из игры и ссылкой на бота с "+dd(C.start)+" "+hm(C.start)+" до "+dd(C.end)+" "+hm(C.end)+" и нажми «Я выложил». Не удаляй историю 24 часа. Итоги "+dd(C.resAt)+" в "+hm(C.resAt)+": победителей бот выбирает случайно, затем администратор просит у победителя скрин из архива историй (с датой и просмотрами); если история была удалена раньше суток — приз уходит запасному участнику. Призы: 🥇 "+C.prizes[0]+", 🥈 "+C.prizes[1]+" и 🥉 "+C.prizes[2]+" на игровой баланс (тратятся на покупки в игре). Профиль в Instagram должен быть открытым, а история в Telegram — видна всем. Время — минское.";
  const L=$("st-link");if(L)L.textContent=C.link;
  const url=stPageUrl()+C.img;
  if($("st-cp"))$("st-cp").onclick=()=>{try{navigator.clipboard.writeText(C.link);toast("Ссылка скопирована — вставь её в стикер «Ссылка»")}catch(e){toast(C.link)}};
  if($("st-dl"))$("st-dl").onclick=()=>{try{if(tg&&tg.downloadFile){tg.downloadFile({url,file_name:"voiny-epoh-story.jpg"});return}}catch(e){}try{tg&&tg.openLink?tg.openLink(url):open(url)}catch(e){open(url)}};
  if($("st-share"))$("st-share").onclick=()=>{const p={text:"Играю в «Воины Эпох» ⚔️ Залетай: @VoinyEpohBot"};try{tg.shareToStory(url,Object.assign({},p,{widget_link:{url:C.link,name:"Играть"}}))}catch(e){try{tg.shareToStory(url,p)}catch(x){toast("Не получилось — скачай фото и выложи вручную")}}};
  if($("st-edit"))$("st-edit").onclick=e=>{e.preventDefault();box.querySelector(".sty-f").hidden=false;$("st-tg").value=C.me.tg||"";$("st-ig").value=C.me.ig||""};
  if($("st-join"))$("st-join").onclick=async()=>{const r=await act("story_join",{tg:$("st-tg").value,ig:$("st-ig").value});if(r){sfx.fanfare();burst(2);hapN("success");toast("✅ Ты участвуешь! Не удаляй историю 24 часа");await loadChal()}}}
function stPageUrl(){return location.origin+location.pathname.replace(/[^/]*$/,"")}
/* админ: подтверждение победителей конкурса историй */
let stRes=null;
async function drawStoryAdmin(){const b=$("st-body");if(!b||!S||!S.admin)return;const r=await act("story_res").catch(()=>null);if(!r||!r.R){const o=$("stadm");if(o)o.remove();return}stRes=r;let box=$("stadm");if(!box){box=document.createElement("div");box.id="stadm";box.className="srcbox"}b.prepend(box);
  const R=r.R;box.innerHTML='<h4>📸 Итоги конкурса историй</h4><p class="cln">Участников: '+R.total+'. Проверь, что история висела сутки, и подтверди. «Заменить» — приз уйдёт запасному ('+R.res.length+' в запасе).</p>'+R.win.map(w=>'<div class="stw"><b>'+["🥇","🥈","🥉"][w.place-1]+' <span data-n="'+w.place+'"></span></b><small>id '+w.uid+(w.tg?' · TG <a href="https://t.me/'+esc(w.tg)+'" target="_blank">@'+esc(w.tg)+'</a>':'')+(w.ig?' · IG <a href="https://instagram.com/'+esc(w.ig)+'" target="_blank">@'+esc(w.ig)+'</a>':'')+'</small>'+(w.ok?'<i>✅ подтверждён</i>':'<div><button type="button" class="craftbtn" data-ok="'+w.place+'">✅ Подтвердить</button><button type="button" class="ghost" data-no="'+w.place+'">Заменить</button></div>')+'</div>').join("");
  R.win.forEach(w=>{const e=box.querySelector('[data-n="'+w.place+'"]');if(e)e.textContent=w.name});
  box.onclick=async e=>{const ok=e.target.closest("[data-ok]"),no=e.target.closest("[data-no]");if(!ok&&!no)return;const x=await act(ok?"story_ok":"story_no",{place:+(ok?ok.dataset.ok:no.dataset.no)});if(x){toast(ok?"✅ Подтверждено, победителю написал бот":"Заменён запасным");drawStoryAdmin()}}}
{const _ds4=drawStats;drawStats=function(){_ds4();try{drawStoryAdmin()}catch(e){}}}

/* ===================== ЧАТ: плавающая кнопка (прячется при прокрутке вниз) + последнее сообщение на главной ===================== */
const chatAgo=t=>{const m=Math.max(0,Math.round((NOW()-t)/60e3));return m<1?"только что":m<60?m+" мин назад":m<1440?Math.floor(m/60)+" ч назад":"давно"};
function chatUnread(){return Math.max(0,(S&&S.chatLast||0)-chatSeen())}
function chatFab(){let f=$("chatfab");if(!f){f=document.createElement("button");f.type="button";f.id="chatfab";f.className="chatfab";f.setAttribute("aria-label","Чат игроков");f.innerHTML='<span>💬</span><em hidden></em>';document.body.append(f);f.onclick=()=>{hap("light");openChat()}}return f}
let fabHide=false,fabY=0,fabLastN=-1;
function fabUpdate(){if(!S)return;const f=chatFab(),n=chatUnread();const e=f.querySelector("em");e.hidden=!n;e.textContent=n>99?"99+":n;
  const block=chatOpen||!$("modal").hidden||document.querySelector(".wsheet,.cqbt,.wrev,.terms,#onb,.onb")||($("sec-camp")&&!$("sec-camp").hidden)||($("sec-cas")&&!$("sec-cas").hidden&&csBusy);
  f.classList.toggle("off",!!block);f.classList.toggle("hide",!!fabHide&&!block);
  const nav=document.querySelector("nav.tabs");if(nav){const h=nav.getBoundingClientRect().height;f.style.bottom=(h+12)+"px"}
  if(fabLastN>=0&&n>fabLastN){f.classList.remove("ping");void f.offsetWidth;f.classList.add("ping")}fabLastN=n}
addEventListener("scroll",()=>{const y=scrollY,d=y-fabY;if(Math.abs(d)<8)return;const h=d>0&&y>120;if(h!==fabHide){fabHide=h;const f=$("chatfab");if(f)f.classList.toggle("hide",h&&!f.classList.contains("off"))}fabY=y},{passive:true});
/* строка последнего сообщения на главной */
function chatStrip(){if(!S||!ONLINE)return;const T=S.chatTop;let el=$("chatstrip");const host=$("free-box");if(!host)return;
  if(!el){el=document.createElement("button");el.type="button";el.id="chatstrip";el.className="chatstrip";const ps=$("ps-strip");(ps||host).before(el);el.onclick=()=>{hap("light");openChat()}}
  const n=chatUnread(),on=S.chatOn||0;
  const k=JSON.stringify([T&&T.id,n,on,T&&chatAgo(T.t)]);if(el.dataset.k===k)return;el.dataset.k=k;
  el.innerHTML='<i>💬</i><span class="cs-t"><b>Чат игроков</b><small class="cs-m"></small></span>'+(n?'<em>'+(n>99?"99+":n)+'</em>':'<span class="cs-on">🟢 '+on+'</span>');
  el.querySelector(".cs-m").textContent=T?T.name+": "+T.text+" · "+chatAgo(T.t):"Напиши первым — здесь общаются все воины"}
{const _ra4=renderAll;renderAll=function(){_ra4();try{fabUpdate();chatStrip()}catch(e){}}}
setInterval(()=>{try{fabUpdate()}catch(e){}},700);
{const _oc=openChat;openChat=function(){_oc();try{fabUpdate()}catch(e){}}}
{const _cc=closeChat;closeChat=function(){_cc();setTimeout(()=>{try{fabUpdate();chatStrip()}catch(e){}},50)}}

/* ===================== ВСПЛЫВАШКИ: не больше одной «необязательной» за заход, новичкам в первые сутки — только обучение ===================== */
let popShown=false;
const isNewbie=()=>!!(S&&S.created&&NOW()-S.created<864e5);
function popWrap(fn,key,opt){return function(){if(popShown||(opt&&opt.newbieSkip&&isNewbie())||storyAnnWaiting())return;let was=null;try{was=localStorage.getItem(key)}catch(e){}const r=fn.apply(this,arguments);let now=null;try{now=localStorage.getItem(key)}catch(e){}if(!was&&now)popShown=true;return r}}
forgeHint=popWrap(forgeHint,"we-forge-hint",{newbieSkip:1});
pmBonusAsk=popWrap(pmBonusAsk,"we-pm-ask2",{newbieSkip:0});
newsUpd4=popWrap(newsUpd4,"we-news-upd4",{});
/* объявление о конкурсе историй — всем, кто заходит во время конкурса (один раз) */
function storyAnnOk(){const C=chData;return !!(S&&ONLINE&&C&&C.story&&C.phase==="on"&&!C.me&&S.nick&&!termsNeed())}
function storyAnnWaiting(){if(!storyAnnOk())return false;try{return !localStorage.getItem("we-story-"+chData.id+"-"+mskDay(NOW()))}catch(e){return false}}
function storyAnn(){if(!storyAnnWaiting()||popShown||!$("modal").hidden||document.querySelector(".wsheet,.wrev,.terms,#onb,.onb-hl,.cqbt"))return;const C=chData;
  try{localStorage.setItem("we-story-"+C.id+"-"+mskDay(NOW()),"1")}catch(e){return}popShown=true;const m=$("modal"),sh=$("msheet");m.hidden=false;
  sh.innerHTML='<div class="box nickbox newsb"><h3>📸 Конкурс историй — '+(new Date(C.end+3*3600e3).toISOString().slice(0,10)!==mskDay(NOW())?"2 дня!":"последний день!")+'</h3><img src="'+C.img.replace("story-contest","post-story")+'" alt="" style="width:100%;border-radius:14px;border:3px solid var(--ink);margin:4px 0 8px" onerror="this.remove()"><ul><li>🥇 <b>'+esc(C.prizes[0])+'</b></li><li>🥈 <b>'+esc(C.prizes[1])+'</b> на игровой баланс</li><li>🥉 <b>'+esc(C.prizes[2])+'</b> на игровой баланс</li></ul><p>Выложи историю с игрой в Telegram или Instagram до '+new Date(C.end+3*3600e3).toISOString().slice(8,10)+'.'+new Date(C.end+3*3600e3).toISOString().slice(5,7)+' 22:00 — фото и твою ссылку на бота уже приготовили. Не удаляй историю 24 часа. Итоги — '+new Date(C.resAt+3*3600e3).toISOString().slice(8,10)+'.'+new Date(C.resAt+3*3600e3).toISOString().slice(5,7)+' в 22:00.</p><button type="button" class="craftbtn" id="sa-go">📸 Участвовать</button><button type="button" class="ghost" id="sa-x">Позже</button></div>';
  $("sa-go").onclick=()=>{closeModal();setTab("spin");setTimeout(()=>{const b=$("chal");if(b)b.scrollIntoView({block:"start",behavior:"smooth"})},150)};$("sa-x").onclick=closeModal}
setInterval(()=>{try{storyAnn()}catch(e){}},3000);
/* кнопка чата никогда не закрывает другие кнопки: если под ней кнопка или поле — она прячется */
function fabCovers(f){if(f.classList.contains("off")||f.classList.contains("hide"))return false;const r=f.getBoundingClientRect();if(!r.width)return false;
  const cx=r.left+r.width/2,cy=r.top+r.height/2,pts=[[cx,cy],[cx,r.top-4],[r.left-4,cy],[cx,r.bottom+2],[r.right+2,cy],[r.left+8,r.top+8],[r.right-8,r.top+8],[r.left+8,r.bottom-8]];
  for(const [x,y] of pts){for(const el of document.elementsFromPoint(x,y)){if(el===f||f.contains(el))continue;const bt=el.closest("button,input,textarea,select,a,label,.craftbtn,.mini2,[data-id]");if(bt){const q=bt.getBoundingClientRect();if(/INPUT|TEXTAREA|SELECT/.test(bt.tagName)||q.width<200&&q.height<110)return true}break}}return false}
let fabCovT=0;function fabCover(){const f=$("chatfab");if(!f)return;f.classList.remove("cover");f.classList.toggle("cover",fabCovers(f))}
addEventListener("scroll",()=>{clearTimeout(fabCovT);fabCovT=setTimeout(fabCover,140)},{passive:true});
{const _fu=fabUpdate;fabUpdate=function(){_fu();try{fabCover()}catch(e){}}}
