/* rules.js — общие правила «Воинов Эпох».
   Этот файл работает и в браузере (локальный режим), и на сервере (Cloudflare Worker).
   Здесь нет ничего про интерфейс: только данные игры и действия, которые меняют состояние игрока. */

const CAP=40, REFILL_MS=4*3600e3, SPINS_MAX=3, PITY=30, LMAX=10, FEE=.05, HOUSE=.9, PMAX=.8, EX_SLOTS=3, MAX_LOTS=5, QUICK=.85, START_CASH=100;
const STN=["Атака","Броня","Скорость","Выносл.","Дух"];
const HT=[{k:"Обычный",c:"#8f9bb3",b:[1,3]},{k:"Редкий",c:"#34c759",b:[4,9]},{k:"Эпический",c:"#0a84ff",b:[15,30]},{k:"Легендарный",c:"#bf5af2",b:[60,120]},{k:"Мифический",c:"#ff9f0a",b:[300,500]}];
const HEROES=[
 ["Ополченец","Средние века",0,"Взял вилы и пошёл защищать деревню. Доспехов нет, зато злости хватает.",{helm:"hood",weapon:"pitch",hue:30,skin:1,stache:"#6b4a2a",p:[2,1,2,3,4]}],
 ["Лучник","Средние века",0,"Попадает в яблоко с сотни шагов. Если ветра нет.",{helm:"phood",weapon:"bow",hue:110,skin:0,p:[3,1,4,2,2]}],
 ["Лучница","Средние века",0,"Лучшая охотница деревни. Белку в глаз, волка в сердце.",{female:1,hair:"braids",hairc:"#b5652a",weapon:"bow",hue:95,skin:0,p:[3,1,4,2,3]}],
 ["Копейщик","Средние века",0,"Стоит в строю и держит копьё. Главное не разбегаться первым.",{helm:"kettle",weapon:"spear",hue:210,skin:2,armor:"mail",p:[3,3,2,3,2]}],
 ["Пращник","Древний мир",0,"Камень и ремень. Простое оружие, которым когда-то побеждали гигантов.",{helm:"band",weapon:"sling",hue:40,skin:2,p:[2,1,4,2,3]}],
 ["Галльский воин","Древний мир",0,"Длинные усы, длинные волосы и длинный меч. Римлян не любит.",{helm:"gaul",weapon:"spear",hue:120,skin:0,stache:"#c4842c",fierce:1,p:[3,1,3,3,4]}],
 ["Стражник замка","Средние века",0,"Ночная смена на стене. Видел всё, но никому не скажет.",{helm:"kettle",weapon:"halberd",hue:0,skin:1,armor:"mail",p:[3,3,1,3,2]}],
 ["Новобранец легиона","Древний Рим",0,"Только что из учебного лагеря. Щит тяжёлый, марш длинный.",{helm:"galea",weapon:"spear",hue:0,skin:1,armor:"mail",p:[2,3,2,3,2]}],
 ["Арбалетчик","Средние века",0,"Долго перезаряжает, но если попал, то попал.",{helm:"kettle",weapon:"bow",hue:270,skin:1,armor:"mail",p:[4,2,1,2,2]}],
 ["Асигару","Япония",0,"Пеший воин в конической шляпе. Самураи на нём и держатся.",{helm:"jingasa",weapon:"spear",hue:200,skin:1,armor:"lam",p:[2,2,3,3,3]}],
 ["Римский легионер","Древний Рим",1,"Шёл строем от Британии до Египта. Щит, меч и дисциплина.",{helm:"galea",crest:"#c0392b",weapon:"sword",shield:"scutum",hue:0,skin:1,armor:"mail",p:[3,4,2,4,4]}],
 ["Викинг","Скандинавия",1,"Приплыл на драккаре на рассвете. К обеду уже уплыл с добычей.",{helm:"viking",weapon:"axe",shield:"round",shc:"#2f5fd0",hue:200,skin:0,beard:"#d9a441",fierce:1,armor:"mail",p:[4,3,3,4,4]}],
 ["Рыцарь","Средние века",1,"Латы весят тридцать килограммов. Залезть на коня помогает оруженосец.",{helm:"knight",plume:"#c0392b",weapon:"sword",shield:"kite",hue:220,skin:0,armor:"plate",p:[4,5,1,3,4]}],
 ["Мушкетёр","Франция, XVII век",1,"Служит королю, дерётся на дуэлях и не расстаётся с друзьями.",{helm:"musket",plume:"#ffffff",weapon:"musket",hue:220,skin:0,stache:"#5a3a1a",cape:"#2a4fb0",p:[4,1,4,3,4]}],
 ["Богатырь","Древняя Русь",1,"Сидел на печи тридцать лет и три года, а потом встал и пошёл.",{helm:"shishak",weapon:"sword",shield:"round",shc:"#b3222a",hue:0,skin:0,beard:"#c48a3a",armor:"mail",p:[5,4,2,5,4]}],
 ["Гоплит","Древняя Греция",1,"Стоит в фаланге плечом к плечу. Пока строй цел, он непобедим.",{helm:"corinth",bronze:1,weapon:"spear",shield:"round",shc:"#d39a4a",hue:20,skin:1,p:[3,4,2,4,3]}],
 ["Монгольский лучник","Степь",1,"Стреляет на скаку назад через плечо. Догнать его невозможно.",{helm:"mongol",weapon:"bow",hue:30,skin:2,stache:"#2a1a0a",p:[4,2,5,4,3]}],
 ["Амазонка","Древняя Греция",1,"Воительница из племени, где правят женщины. Лук и копьё с детства.",{female:1,hair:"long",hairc:"#2a1a10",helm:"diadem",bronze:1,weapon:"spear",shield:"pelta",hue:15,skin:2,armor:"plate",p:[4,3,4,4,4]}],
 ["Куноити","Япония",1,"Женщина-ниндзя. Шпион, которого никто не заподозрит.",{female:1,hair:"pony",hairc:"#151520",helm:"ninja",weapon:"katana",hue:300,skin:1,p:[4,1,5,3,4]}],
 ["Спартанец","Спарта",2,"С детства учился воевать. Возвращается со щитом или на щите.",{helm:"corinth",bronze:1,crest:"#c0392b",weapon:"spear",shield:"hoplon",hue:0,skin:1,fierce:1,cape:"#a3262a",p:[5,5,3,5,5]}],
 ["Самурай","Япония",2,"Кодекс чести, катана и рогатый шлем. Слово держит до конца.",{helm:"kabuto",weapon:"katana",hue:0,skin:1,fierce:1,armor:"lam",p:[5,4,4,4,5]}],
 ["Ниндзя","Япония",2,"Ты его не видел. Никто его не видел. В этом весь смысл.",{helm:"ninja",weapon:"katana",hue:240,skin:1,p:[4,1,5,3,4]}],
 ["Гладиатор","Древний Рим",2,"Выходит на арену под рёв толпы. Победа значит свободу.",{helm:"glad",weapon:"sword",shield:"round",shc:"#c9a24a",hue:20,skin:2,armor:"plate",p:[5,4,3,5,5]}],
 ["Валькирия","Мифы Скандинавии",2,"Выбирает самых храбрых павших воинов и уносит их в Вальхаллу.",{female:1,hair:"braids",hairc:"#f0c35a",helm:"winged",weapon:"spear",shield:"round",shc:"#e9edf5",hue:210,skin:0,armor:"plate",cape:"#2a4fb0",glow:"#9fd6ff",p:[5,4,5,4,6]}],
 ["Жанна д'Арк","Франция, XV век",2,"В 17 лет повела армию и сняла осаду Орлеана.",{female:1,hair:"bob",hairc:"#5a3418",weapon:"banner",shield:"kite",shc:"#2f5fd0",hue:220,skin:0,armor:"plate",p:[4,5,3,5,6]}],
 ["Медуза Горгона","Мифы Греции",2,"Один взгляд, и ты камень. Лучше смотреть в щит.",{female:1,hair:"snakes",skinc:"#b9d6a4",weapon:"bow",hue:150,armor:"plate",bronze:1,glow:"#ffe14d",p:[4,3,4,4,6]}],
 ["Берсерк","Скандинавия",3,"Надевает волчью шкуру и идёт в бой без страха и без щита.",{helm:"berserk",weapon:"axe",hue:20,skin:0,beard:"#b5452a",fierce:1,armor:"pelt",p:[6,2,4,6,6]}],
 ["Тамплиер","Крестовые походы",3,"Рыцарь ордена в белом плаще с красным крестом.",{helm:"templar",weapon:"sword",shield:"cross",hue:0,skin:0,armor:"plate",cape:"#f4f1ea",p:[5,6,2,5,6]}],
 ["Минотавр","Мифы Греции",3,"Человек-бык из лабиринта на Крите. Из лабиринта ещё никто не выходил.",{head:"bull",weapon:"axe",hue:20,armor:"pelt",glow:"#ff4d3d",p:[7,5,2,6,5]}],
 ["Анубис","Древний Египет",3,"Бог с головой шакала. Взвешивает сердца на весах.",{head:"jackal",weapon:"staff",hue:45,armor:"lam",gold:1,glow:"#ffd60a",p:[5,5,4,5,7]}],
 ["Сёгун","Япония",4,"Правитель всех самураев. Золотой шлем и маска демона.",{helm:"kabuto",gold:1,mask:1,weapon:"katana",hue:45,skin:1,armor:"lam",fierce:1,p:[6,6,5,6,6]}],
 ["Мерлин","Легенды Британии",4,"Величайший волшебник. Вырастил короля Артура и знает, чем всё кончится.",{helm:"wizard",weapon:"staff",hue:235,skin:0,beard:"#f2f2f2",brows:"#f2f2f2",glow:"#7fe7ff",p:[3,4,4,5,8]}],
 /* составные воины: не выпадают целиком, собираются из левой и правой половинки */
 ["Дракон","Легенды драконов",4,"Спал под горой тысячу лет. Проснулся злым.",{comp:1,hue:0,p:[7,6,4,6,7]}],
 ["Феникс","Мифы Востока",4,"Сгорает дотла и возрождается из пепла. Победить его можно только дважды.",{comp:1,hue:30,p:[6,4,7,5,8]}],
 ["Кракен","Морские легенды",4,"Утаскивает корабли на дно вместе с парусами и капитаном.",{comp:1,hue:280,p:[7,6,3,8,6]}],
 ["Цербер","Подземное царство",4,"Три головы, и все три не спят. Сторожит выход из царства мёртвых.",{comp:1,hue:10,p:[8,6,5,6,5]}],
 ["Химера","Мифы Греции",4,"Голова льва, тело козы, хвост-змея. И всё это дышит огнём.",{comp:1,hue:40,p:[7,5,6,6,6]}],
 ["Левиафан","Морские легенды",4,"Морской змей размером с остров. Моряки принимали его спину за сушу.",{comp:1,hue:200,p:[6,8,4,8,6]}]];
const NBASE=32, NHEROES=NBASE;          // в альбоме и прокрутках только 32 обычных воина
const COMP=HEROES.map((H,i)=>i).filter(i=>i>=NBASE), isComp=h=>h>=NBASE;
/* половинки: part 1 — левая (частая), part 2 — правая (в 5 раз реже, 300 на воина на весь мир).
   Целая карточка забирает номер тиража правой половинки (17/300). «Ошибка печати»: одна левая и одна правая на воина */
const HALF_RUN=300, HALF_P={drop:.0035,right:.15,err:.004}, PART_K=["","Левая ½","Правая ½"];
const notHalf=(c,m)=>{if(c.part)fail(m||"Половинка не может это делать. Собери из двух половинок целого воина в Сокровищнице");return c};
const FIN=[
 {k:"Обычная",cls:"",w:78,m:1,run:Infinity,col:"#ffffff"},
 {k:"Блестящая",cls:"shiny",w:16,m:4,run:1000,col:"#b8c2d8"},
 {k:"Голограмма",cls:"holo",w:5,m:15,run:100,col:"#c56bff"},
 {k:"Золотая",cls:"gold",w:.9,m:80,run:10,col:"#ffcc33"},
 {k:"Ошибка печати",cls:"error",w:.1,m:600,run:1,col:"#ff2e63"},
 {k:"Основатель",cls:"founder",w:0,m:2000,run:1,col:"#ffd60a",excl:1}];   // не выпадает: 3 карточки за 15 приглашённых друзей
/* три карточки «Основатель»: создаются сервером один раз, лежат в казне игры, пока их не заработают */
const FOUNDERS=[{h:30,sn:"111111",stats:[640,640,600,620,660]},{h:31,sn:"222222",stats:[560,600,600,640,720]},{h:23,sn:"333333",stats:[620,580,640,600,660]}], FOUNDER_REFS=15;
const HW=[10,4.5,1.6,.35,.06];          // вес выпадения воина по его редкости

/* ---------- номера карточек: 6 цифр, уникальны на всю игру ---------- */
const NICE=[
 {k:"Номер один",m:25,ex:"000 001",gen:()=>["000001"]},
 {k:"Семь семёрок",m:15,ex:"777 777",gen:()=>["777777"]},
 {k:"Агентский",m:8,ex:"000 007",gen:()=>["000007"]},
 {k:"Все одинаковые",m:8,ex:"555 555",gen:()=>"12345689".split("").map(d=>d.repeat(6))},
 {k:"Лесенка",m:6,ex:"123 456",gen:()=>["123456","654321","234567","765432","345678","876543","456789","987654","012345","543210"]},
 {k:"Круглый",m:4,ex:"500 000",gen:()=>"123456789".split("").map(d=>d+"00000")},
 {k:"Зеркальный",m:3,ex:"128 821",gen:()=>{const o=[];for(let i=0;i<40;i++){const a=String(Math.floor(Math.random()*900)+100);o.push(a+a.split("").reverse().join(""))}return o}},
 {k:"Пары",m:3,ex:"373 737",gen:()=>{const o=[];for(let i=0;i<30;i++){const a=Math.floor(Math.random()*10),b=(a+1+Math.floor(Math.random()*9))%10;o.push((""+a+b).repeat(3))}return o}},
 {k:"Три семёрки",m:2,ex:"417 772",gen:()=>{const o=[];for(let i=0;i<30;i++){const p=Math.floor(Math.random()*4),r=String(Math.floor(Math.random()*1000)).padStart(3,"0");o.push((r.slice(0,p)+"777"+r.slice(p)).slice(0,6))}return o}}];
function classify(n){
  if(n==="000001")return NICE[0];if(n==="777777")return NICE[1];if(n==="000007")return NICE[2];
  if(/^(\d)\1{5}$/.test(n))return NICE[3];
  const st=n.split("").map(Number),up=st.every((d,i)=>!i||d===st[i-1]+1),dn=st.every((d,i)=>!i||d===st[i-1]-1);if(up||dn)return NICE[4];
  if(/^[1-9]0{5}$/.test(n))return NICE[5];
  if(n===n.split("").reverse().join(""))return NICE[6];
  if(/^(\d\d)\1\1$/.test(n))return NICE[7];
  if(n.includes("777"))return NICE[8];
  return null;
}
const NICE_P=[.04,.14,.4,.85,1];         // шанс красивого номера по отделке
const fmtSn=n=>n.slice(0,3)+" "+n.slice(3);
function pick(ws){const t=ws.reduce((a,b)=>a+b,0);let x=Math.random()*t;for(let i=0;i<ws.length;i++){x-=ws[i];if(x<0)return i}return ws.length-1}
const rint=(a,b)=>Math.round(a+Math.random()*(b-a));

/* ---------- уровни ---------- */
function lvl(c){return Math.min(LMAX,1+Math.floor(Math.sqrt((c.xp||0)/25)))}
function lvlNext(c){const l=lvl(c);return l>=LMAX?null:25*l*l}
function eff(c,i){return Math.round((c.stats||[])[i]*(1+.04*(lvl(c)-1))*(1+.1*(c.stars||0)))}
/* ---------- закалка: звёзды ★1–★5. Карточка становится сильнее, дороже и меняется внешне ---------- */
const STAR_MAX=5, STAR_LVL=[2,4,6,8,10], STAR_V=1.3;
const forgeCost=c=>Math.round(40*Math.pow(2.2,c.stars||0)+c.v*.3);
const EP1=["Гроза","Тень","Сердце","Клинок","Щит","Гнев","Страх","Призрак","Пламя","Буря","Ярость","Зов","Кошмар","Слава","Хозяин","Проклятие","Легенда","Ужас","Молот","Коготь","Рёв","Дух","Голос","Свет"];
const EP2=["Севера","Пустошей","Бездны","Рассвета","Заката","Гор","Морей","Степей","Пепла","Грома","Крови","Льда","Тьмы","Огня","Ветров","Курганов","Вальхаллы","Империи","Арены","Ночи","Драконов","Королей","Мёртвых","Звёзд"];
function snHash(sn){let h=2166136261;for(const ch of String(sn))h=Math.imul(h^ch.charCodeAt(0),16777619);return h>>>0}
/* у каждой карточки своё прозвище, оно открывается на ★3 */
function epithet(c){const h=snHash(c.sn+"-"+c.h);return EP1[h%EP1.length]+" "+EP2[(h>>>8)%EP2.length]}
const away=c=>!!c.away||!!c.listed||!!c.lock;   // lock: карточка сейчас в бою на арене
const targetPrice=(h,f)=>{const [a,b]=HT[HEROES[h][2]].b;return Math.round((a+b)/2*FIN[f].m*100)/100};
const amuCost=(h,f)=>Math.max(20,Math.round(targetPrice(h,f)*.15));
const trainCost=c=>Math.round(40*Math.pow(lvl(c),1.6));

/* ---------- время ---------- */
function today(now){return new Date(now).toISOString().slice(0,10)}
function yday(now){return new Date(now-864e5).toISOString().slice(0,10)}
function weekKey(now){const d=new Date(now),y=d.getUTCFullYear(),s=new Date(Date.UTC(y,0,1));return y+"-"+Math.ceil(((d-s)/864e5+s.getUTCDay()+1)/7)}

/* ---------- справочники ---------- */
const TASKS=[{k:"opened",n:3,t:"Открой 3 карточки",r:1},{k:"wins",n:3,t:"Выиграй 3 боя",r:2},{k:"crafts",n:1,t:"Сделай крафт",r:1}];
const haveSet=cards=>new Set(cards.map(c=>c.h));
const ACH=[
 {id:"ep",t:"Первая эпическая",d:"Выбей эпического воина",r:1,ok:(st)=>(st.best||0)>=2},
 {id:"lg",t:"Легенда",d:"Выбей легендарного воина",r:3,ok:(st)=>(st.best||0)>=3},
 {id:"my",t:"Миф",d:"Выбей мифического воина",r:5,ok:(st)=>(st.best||0)>=4},
 {id:"gd",t:"Золото",d:"Выбей золотую карточку",r:3,ok:(st)=>(st.bestFin||0)>=3},
 {id:"nn",t:"Красивый номер",d:"Выбей карточку с красивым номером",r:1,ok:(st)=>(st.niceCount||0)>=1},
 {id:"w10",t:"Боец",d:"Выиграй 10 боёв",r:3,ok:(st)=>(st.totalWins||0)>=10},
 {id:"cr",t:"Алхимик",d:"Сделай удачный крафт",r:2,ok:(st)=>(st.crafted||0)>=1},
 {id:"jp",t:"Вся Япония",d:"Собери всех воинов Японии",r:3,ok:(st,cards)=>{const h=haveSet(cards);return HEROES.every((H,i)=>H[1]!=="Япония"||h.has(i))}},
 {id:"half",t:"Полальбома",d:"Собери 16 разных воинов",r:3,ok:(st,cards)=>[...haveSet(cards)].filter(h=>h<NBASE).length>=16},
 {id:"all",t:"Коллекционер",d:"Собери весь альбом",r:10,ok:(st,cards)=>[...haveSet(cards)].filter(h=>h<NBASE).length>=NHEROES}];
const DEST=[
 {k:"Разведка у реки",t:"1 минута",ms:60e3,xp:20,m:[5,15],sp:.1,card:0},
 {k:"Набег на побережье",t:"1 час",ms:3600e3,xp:60,m:[20,60],sp:.35,card:.03},
 {k:"Осада замка",t:"4 часа",ms:4*3600e3,xp:180,m:[60,180],sp:1,card:.1},
 {k:"Поход за край карты",t:"8 часов",ms:8*3600e3,xp:360,m:[150,400],sp:2,card:.25}];
const BOSS={name:"Змей Горыныч",hp:25000};
const MILES=[{p:.25,t:"3 прокрутки"},{p:.5,t:"Гарантированная эпическая"},{p:.75,t:"$500 и 3 прокрутки"},{p:1,t:"Легендарная карточка"}];
const FRAMES={bronze:{k:"Бронзовая",cost:100,bg:"linear-gradient(135deg,#f3c58b,#a8642a 50%,#e6a96a)"},silver:{k:"Серебряная",cost:300,bg:"linear-gradient(135deg,#ffffff,#9aa6bf 45%,#f2f4fa 60%,#7d8aa3)"},
  fire:{k:"Огненная",cost:1000,bg:"linear-gradient(180deg,#ffe14d,#ff7a1a 45%,#d0141f)"},night:{k:"Звёздная ночь",cost:2000,bg:"radial-gradient(#fff 1px,transparent 1.6px) 0 0/10px 10px,linear-gradient(135deg,#0d1030,#3b2a8c)"},
  rainbow:{k:"Радужная",cost:4000,bg:"conic-gradient(#ff5f6d,#ffc371,#47e891,#3ab0ff,#c56bff,#ff5f6d)"},
  pioneer:{k:"Первопроходец",cost:0,only:"pioneer",bg:"linear-gradient(135deg,#14110a,#ffd60a 30%,#fff6c8 50%,#ffd60a 70%,#14110a)"}};   // только для первых 100 игроков
const PIONEERS=100, PIONEER_SPINS=20;

/* ---------- ник игрока: виден в топе, на рынке и в витрине ---------- */
const NICK_COST=1000;   // первый ник бесплатно, смена за деньги
const NICK_BAD=/(ху[йяеёи]|пизд|еб[аул]|ёб|бля|сук[аи]|муд[аи]|пид[оа]р|гандон|шлюх|залуп|дроч|нах[уе]|fuck|shit|bitch|admin|админ|модер|поддержк|support)/i;
function checkNick(n){n=String(n||"").trim().replace(/\s+/g,"_");
  if(n.length<3||n.length>16)fail("Ник от 3 до 16 символов");
  if(!/^[A-Za-zА-Яа-яЁё0-9_.\-]+$/.test(n))fail("Можно буквы, цифры и знаки _ . -");
  if(!/[A-Za-zА-Яа-яЁё]/.test(n))fail("В нике должна быть хотя бы одна буква");
  if(NICK_BAD.test(n.replace(/[_.\-]/g,"")))fail("Такой ник нельзя, придумай другой");
  return n}

/* ---------- колесо фортуны: одно бесплатное вращение в день ---------- */
const WHEEL=[{t:"+1",s:"прокрутка",w:31,sp:1,c:"#34c759"},{t:"$50",s:"",w:23,cash:50,c:"#0a84ff"},{t:"+2",s:"прокрутки",w:15,sp:2,c:"#ff9f0a"},{t:"$200",s:"",w:12.5,cash:200,c:"#bf5af2"},
  {t:"+3",s:"прокрутки",w:9,sp:3,c:"#ff3b30"},{t:"ЭПИК",s:"гарантия",w:3,guar:1,c:"#5ac8fa"},{t:"$1000",s:"",w:6,cash:1000,c:"#ffd60a"},{t:"ЛЕГЕНДА",s:"карточка",w:0.5,leg:1,c:"#0d1030"}];

/* ---------- Тренировочный лагерь: тапалка, руны и прокачка ----------
   Энергия тратится на удары по мишени, за удары дают руны. Руны идут на прокачку и на прокрутки
   (не больше BUY_MAX в день, каждая следующая вдвое дороже), поэтому редкие карточки не обесцениваются.
   Сервер сам считает энергию по времени и не даёт натапать больше, чем возможно (защита от автокликера). */
const CAMP_E0=1000,TAP_RATE=12,CRIT_X=3,SQ_HOURS=3,BUY_MAX=5,BUY_BASE=500;
const TARGETS=[
 {n:"Соломенное чучело",m:1,hp:300,cost:0,chest:30},
 {n:"Мишень лучника",m:1.2,hp:1000,cost:8000,chest:100},
 {n:"Рыцарские доспехи",m:1.5,hp:3000,cost:60000,chest:300},
 {n:"Каменный голем",m:2,hp:9000,cost:400000,chest:900},
 {n:"Золотой идол",m:2.5,hp:25000,cost:2500000,chest:2500},
 {n:"Дракон",m:3,hp:70000,cost:15000000,chest:7000}];
/* цены растут быстрее, чем доход: прокачка на недели, а не на час */
const CAMP_UP={
 pw:{n:"Сила удара",max:15,c:l=>Math.round(400*Math.pow(2.35,l)),v:l=>"+"+(1+l)+" за удар"},
 en:{n:"Запас энергии",max:10,c:l=>Math.round(600*Math.pow(2.5,l)),v:l=>(CAMP_E0+100*l)+" ⚡"},
 rg:{n:"Восстановление",max:10,c:l=>Math.round(1000*Math.pow(2.5,l)),v:l=>"полная за "+(60-2*l)+" мин"},
 cr:{n:"Критический удар",max:10,c:l=>Math.round(1200*Math.pow(2.4,l)),v:l=>(2+l)+"% на удар ×"+CRIT_X},
 sq:{n:"Оруженосец",max:10,c:l=>Math.round(2500*Math.pow(2.3,l)),v:l=>l?30*l+" рун в час":"не нанят"}};
/* тренер — твой лучший воин: чем он реже, тем больше рун за удар */
const TRAIN_B=[0,.05,.1,.2,.3];
function campTrainer(cards){let b=null;for(const c of cards||[]){if(!b||HEROES[c.h][2]>HEROES[b.h][2]||HEROES[c.h][2]===HEROES[b.h][2]&&c.v>b.v)b=c}return b}
const campBonus=cards=>{const t=campTrainer(cards);return t?TRAIN_B[HEROES[t.h][2]]:0};
const campMax=C=>CAMP_E0+100*C.lv.en, campFull=C=>(60-2*C.lv.rg)*60e3, campPow=(C,cards)=>Math.round((1+C.lv.pw)*TARGETS[C.t].m*(1+campBonus(cards))*10)/10;
const campCrit=C=>.02+.01*C.lv.cr, campSqRate=C=>30*C.lv.sq*TARGETS[C.t].m;
function camp(st,now){const C=st.camp||(st.camp={runes:0,en:CAMP_E0,at:now,lv:{pw:0,en:0,rg:0,cr:0,sq:0},t:0,hp:TARGETS[0].hp,kills:0,total:0,sqAt:now,tapAt:0});
  for(const k in CAMP_UP)if((C.lv[k]||0)>CAMP_UP[k].max)C.lv[k]=CAMP_UP[k].max;   // после смены баланса уровни не выше новых максимумов
  const mx=campMax(C);if(C.en<mx)C.en=Math.min(mx,C.en+Math.max(0,now-C.at)/campFull(C)*mx);C.at=now;
  C.fullAt=C.en>=mx?0:Math.round(now+(mx-C.en)/mx*campFull(C));return C}
/* заработанные руны за день и за неделю (по минскому времени) — для топа лагеря */
const mskDay=now=>new Date(now+3*3600e3).toISOString().slice(0,10);
function mskWeek(now){const d=new Date(now+3*3600e3),k=(d.getUTCDay()+6)%7;return new Date(Date.UTC(d.getUTCFullYear(),d.getUTCMonth(),d.getUTCDate()-k)).toISOString().slice(0,10)}
function campEarn(C,now,g){const d=mskDay(now),w=mskWeek(now);if(C.dK!==d){C.dK=d;C.dR=0}if(C.wK!==w){C.wK=w;C.wR=0}C.dR+=g;C.wR+=g}
function campSq(C,now){return C.lv.sq?Math.floor(Math.min(SQ_HOURS*3600e3,Math.max(0,now-C.sqAt))/3600e3*campSqRate(C)):0}
function spinsBought(st,now){const C=st.camp;return C&&C.buyDay===today(now)?(C.buyN||0):0}
function spinPrice(st,now){return BUY_BASE*Math.pow(2,spinsBought(st,now))}

/* ---------- ошибки ---------- */
class GameError extends Error{}
function fail(m){throw new GameError(m)}

/* ---------- состояние игрока ---------- */
function freshState(){return {cash:START_CASH,spins:SPINS_MAX+2,refillAt:null,pity:0,guar:0,best:0,bestFin:0,niceCount:0,crafted:0,totalWins:0,ach:{},doneCh:{},squad:[]}}
function day(st,now){if(!st.day||st.day.d!==today(now))st.day={d:today(now),opened:0,wins:0,crafts:0,got:[]};return st.day}
function boss(st,now){if(!st.boss||st.boss.w!==weekKey(now))st.boss={w:weekKey(now),dmg:0,got:[],day:"",hits:0,extra:0,squad:[]};if(st.boss.day!==today(now)){st.boss.day=today(now);st.boss.hits=0;st.boss.extra=0}return st.boss}
/* сколько прокруток даётся раз в 4 часа: VIP получает 5 (сервер ставит st.vipUntil) */
const VIP_SPINS=5;
const spinCap=st=>(st.vipUntil||0)>Date.now()?VIP_SPINS:SPINS_MAX;
function refill(st,now){const cap=spinCap(st);if(st.spins==null)st.spins=cap;if(st.refillAt&&now>=st.refillAt){st.spins=Math.max(st.spins,cap);st.refillAt=null}}
function checkStreak(st,now){const t=today(now);if(st.streak&&st.streak.last===t)return;const n=st.streak&&st.streak.last===yday(now)?st.streak.n%7+1:1;st.streak={last:t,n,claimed:false}}
function touch(st,now){refill(st,now);checkStreak(st,now);day(st,now);boss(st,now);st.ach=st.ach||{};st.doneCh=st.doneCh||{}}

/* ---------- карточки ----------
   ctx даёт доступ к общему миру: сколько экземпляров уже выпущено и какие номера заняты.
   ctx = {now, issuedOf(h,f), nextNo(h,f), snFree(sn), takeSn(sn), newId(), events:[], test} */
function genNumber(ctx,f){
  if(ctx.luck||Math.random()<NICE_P[f]){
    const w=ctx.luck?NICE.map((x,i)=>i<3?8:i<6?5:1):NICE.map((x,i)=>i<3?(f>=3?6:f===2?1.5:.3):i<6?(f>=2?4:1.2):3);
    for(let t=0;t<6;t++){const c=NICE[pick(w)],opts=c.gen().filter(n=>ctx.snFree(n));if(opts.length){const n=opts[Math.floor(Math.random()*opts.length)];ctx.takeSn(n);return n}}
  }
  for(let t=0;t<1000;t++){const n=String(Math.floor(Math.random()*1e6)).padStart(6,"0");if(!classify(n)&&ctx.snFree(n)){ctx.takeSn(n);return n}}
  fail("Номера закончились");
}
function cardBody(h,f,preset){
  const tier=HEROES[h][2],P=HEROES[h][4].p,base=isComp(h)?440:[60,140,240,330,400][tier];
  const stats=preset&&preset.stats?preset.stats.slice():P.map(k=>Math.round((base+k*18)*(.82+Math.random()*.36)));
  const hue=preset&&preset.hue!=null?preset.hue:(HEROES[h][4].hue+Math.floor(Math.random()*7-3)*25+360)%360;
  return {stats,hue,top:stats.reduce((a,b)=>a+b,0)>=(base+90)*5*1.12};
}
function priceOf(h,f,no,sn,top,part){const [a,b]=HT[HEROES[h][2]].b;let v=(a+Math.random()*(b-a))*FIN[f].m;
  if(isComp(h)){v*=[5,.3,1.5][part|0];if(!part&&f===0&&no===1)v*=3}
  if(FIN[f].run!==Infinity&&no===1)v*=3;const cl=classify(sn);if(cl)v*=cl.m;if(top)v*=2;return Math.round(v*100)/100}
function makeCard(ctx,h,f,preset){
  if(FIN[f].run!==Infinity&&ctx.issuedOf(h,f)>=FIN[f].run)fail("Тираж этой отделки закончился");
  const no=ctx.nextNo(h,f),sn=genNumber(ctx,f),B=cardBody(h,f,preset);
  return {id:ctx.newId(),h,f,no,sn,hue:B.hue,stats:B.stats,v:priceOf(h,f,no,sn,B.top),xp:0,wins:0,stars:0,frame:null,away:0,dest:null,listed:0,listPrice:0};
}
/* половинка составного воина. ctx.compLeft(h) — сколько правых мест тиража свободно, ctx.compSlot(h) — занять место,
   ctx.compErr(h,part) — есть ли уже «ошибка печати» этой части (part 0 — целая карточка) */
function makeHalf(ctx,h,part,f){
  if(f===4){if(ctx.compErr(h,part))fail("«Ошибка печати» этой половинки уже есть в мире");ctx.compErrTake(h,part)}
  const no=f===4?part*1000+1:part===2?ctx.compSlot(h):1e6+Math.floor(Math.random()*2e9);
  if(!no)fail("Правые половинки воина «"+HEROES[h][0]+"» закончились");
  const sn=genNumber(ctx,f),B=cardBody(h,f);
  return {id:ctx.newId(),h,f,no,sn,part,hue:B.hue,stats:B.stats,v:priceOf(h,f,no,sn,B.top,part),xp:0,wins:0,stars:0,frame:null,away:0,dest:null,listed:0,listPrice:0}}
function rollHalf(ctx,rightP){let part=Math.random()<rightP?2:1,pool=COMP;
  if(part===2){pool=COMP.filter(h=>ctx.compLeft(h)>0);if(!pool.length){part=1;pool=COMP}}
  const h=pool[Math.floor(Math.random()*pool.length)],f=Math.random()<HALF_P.err&&!ctx.compErr(h,part)?4:0;
  return makeHalf(ctx,h,part,f)}
/* воин нужной редкости (только обычные 32), отделка выпадает как обычно */
function rollTier(ctx,tier){const pool=HEROES.map((H,i)=>i).filter(i=>i<NBASE&&HEROES[i][2]===tier),h=pool[Math.floor(Math.random()*pool.length)];
  let f=pick(FIN.map(x=>x.w));while(f>0&&ctx.issuedOf(h,f)>=FIN[f].run)f--;return makeCard(ctx,h,f)}
/* ---------- Сокровищница: покупки за Telegram Stars ----------
   Лимита на человека нет: редкость держится общим тиражом (300 правых половинок на воина, 30 мифических сундуков в месяц на всю игру).
   Отделки и номера в сундуках выпадают с обычными шансами, ничего не подкручено. */
const SHOP={
 newbie:{n:"Подарок новичку",stars:25,sp:10,guar:1,once:1,d:["🎴 <b>10</b> прокруток","💎 гарантированный <b>эпик</b>"]},
 small:{n:"Малый сундук",stars:50,sp:10,halves:1,rightP:HALF_P.right,d:["🎴 <b>10</b> прокруток","🧩 <b>1</b> половинка составного воина","шанс правой: <b>15%</b>"]},
 royal:{n:"Королевский сундук",stars:250,sp:60,halves:6,rightP:HALF_P.right,right1:1,d:["🎴 <b>60</b> прокруток","🧩 <b>6</b> половинок","минимум <b>1 правая</b> гарантированно"]},
 warrior:{n:"Сундук воина",stars:75,cards:5,epic:1,d:["🃏 <b>5</b> карточек","минимум <b>1 эпическая</b>"]},
 legend:{n:"Легендарный сундук",stars:300,cards:10,leg:1,d:["🃏 <b>10</b> карточек","гарантированно <b>легендарная</b>"]},
 mythic:{n:"Мифический сундук",stars:1000,cards:10,myth:1,leg:1,month:30,d:["🃏 <b>10</b> карточек","гарантированно <b>Сёгун или Мерлин</b>","+ легендарная","всего <b>30</b> в месяц на всю игру"]}};
const CHESTS=["newbie","small","royal","warrior","legend","mythic"];
/* свой номер: 100 ⭐ + 100 ⭐ за каждый «икс» красивого номера (777 777 ×15 = 1600 ⭐) */
const numPrice=sn=>{const c=classify(sn);return 100+(c?c.m*100:0)};
const checkSn=sn=>{sn=String(sn||"").replace(/\D/g,"");if(sn.length!==6)fail("Номер — ровно 6 цифр");return sn};
/* переливающийся ник: виден в топах, чате, лагере и на арене */
const NFX={fire:"Огонь",rainbow:"Радуга",gold:"Золото",ice:"Лёд",neon:"Неон"}, NFX_PRICE={m:150,f:500}, NFX_DAYS=30;
/* соперник для боя: не выпускается в мир, пока его не выиграли */
function phantom(h,f){const B=cardBody(h,f);const [a,b]=HT[HEROES[h][2]].b;return {id:"opp",h,f,no:0,sn:"000000",hue:B.hue,stats:B.stats,v:Math.round((a+Math.random()*(b-a))*FIN[f].m*100)/100,xp:0}}
/* режим удачи (только для аккаунта администратора, включается на сервере): редкие воины, дорогие отделки, красивые номера */
const HW_LUCK=[0,0,1,3,3], FW_LUCK=[0,2,3,3,2];
function rollCard(ctx,epic){
  const pool=HEROES.map((H,i)=>i).filter(i=>i<NBASE&&(!epic||HEROES[i][2]>=2));
  const h=pool[pick(pool.map(i=>(ctx.luck?HW_LUCK:HW)[HEROES[i][2]]))];
  let f=pick(ctx.luck?FW_LUCK:FIN.map(x=>x.w));while(f>0&&ctx.issuedOf(h,f)>=FIN[f].run)f--;
  return makeCard(ctx,h,f);
}
function addXp(ctx,c,x){const b=lvl(c);c.xp=(c.xp||0)+x;const a=lvl(c);if(a>b)ctx.events.push({t:"lvl",h:c.h,lv:a})}
function noteCard(st,c){st.best=Math.max(st.best||0,HEROES[c.h][2]);st.bestFin=Math.max(st.bestFin||0,c.f);if(classify(c.sn))st.niceCount=(st.niceCount||0)+1}

/* ---------- помощники для действий ---------- */
function own(G,id){const c=G.cards.find(x=>x.id===id);if(!c)fail("Карточка не найдена");return c}
function freeCard(G,id){const c=own(G,id);if(c.lock)fail("Эта карточка сейчас в бою на арене");if(c.away)fail("Этот воин в походе");if(c.listed)fail("Эта карточка выставлена на рынок");return c}
/* «Основатель» — трофей: не дерётся и не сгорает, только рынок, витрина и походы */
const TROPHY_MSG="Карточка «Основатель» коллекционная: в боях не участвует";
function battleCard(G,id){const c=freeCard(G,id);if(FIN[c.f].excl)fail(TROPHY_MSG);return notHalf(c,"Половинка не воюет. Собери из двух половинок целого воина в Сокровищнице")}
function burnable(c){if(FIN[c.f].excl)fail("«Основателя» нельзя продать системе или сжечь. Его можно выставить на рынок");return c}
function addCard(G,c){if(G.cards.length>=CAP)fail("Коллекция заполнена ("+CAP+"). Продай лишнее");G.cards.push(c);noteCard(G.st,c)}
/* карточка уходит из игры: её номер и место в тираже освобождаются и снова могут выпасть в прокрутках */
function burn(G,ids){G.cards.forEach(x=>{if(ids.includes(x.id)&&G.ctx.release)G.ctx.release(x)});G.cards=G.cards.filter(x=>!ids.includes(x.id))}
function pay(st,n){if(st.cash<n)fail("Не хватает $"+Math.ceil(n-st.cash));st.cash=Math.round((st.cash-n)*100)/100}
function earn(st,n){st.cash=Math.round((st.cash+n)*100)/100}
function aiPick(card,ex){let best=-1,bv=-1;for(let i=0;i<5;i++){if(ex.includes(i))continue;const v=eff(card,i)*(.85+Math.random()*.3);if(v>bv){bv=v;best=i}}return best}
function rndPick(ex){const r=[0,1,2,3,4].filter(i=>!ex.includes(i));return r[Math.floor(Math.random()*r.length)]}
function fight3(me,opp,picks){const rounds=picks.map(s=>({a:eff(me,s),b:eff(opp,s)}));const w=rounds.filter(r=>r.a>r.b).length,l=rounds.filter(r=>r.a<r.b).length;return {rounds,w,l}}
const snap=c=>JSON.parse(JSON.stringify(c));

/* ---------- действия ----------
   Каждое действие получает G = {st, cards, ctx, p} и меняет st и cards. Возвращает данные для анимации. */
const ACTIONS={
  sync(){return {}},

  open(G){const {st,ctx}=G;refill(st,ctx.now);
    if(st.spins<=0)fail("Прокрутки закончились");
    if(G.cards.length>=CAP)fail("Коллекция заполнена ("+CAP+"). Продай лишнее");
    st.spins--;if(st.spins<spinCap(st)&&!st.refillAt)st.refillAt=ctx.now+REFILL_MS;
    const epic=(st.guar||0)>0||(st.pity||0)>=PITY-1;let c=null;
    if(!epic&&Math.random()<HALF_P.drop)try{c=rollHalf(ctx,HALF_P.right)}catch(e){}   // редко вместо карточки выпадает половинка составного воина
    if(!c)c=rollCard(ctx,epic);if(epic&&(st.guar||0)>0)st.guar--;
    st.pity=HEROES[c.h][2]>=2?0:(st.pity||0)+1;
    addCard(G,c);day(st,ctx.now).opened++;return {card:c}},

  sell(G){const c=burnable(freeCard(G,G.p.id)),got=Math.round(c.v*QUICK*100)/100;burn(G,[c.id]);earn(G.st,got);return {got}},

  sellcommon(G){const list=G.cards.filter(c=>!away(c)&&c.f===0&&HEROES[c.h][2]===0);if(!list.length)fail("Обычных карточек нет");
    const got=Math.round(list.reduce((a,c)=>a+c.v*QUICK,0)*100)/100;burn(G,list.map(c=>c.id));earn(G.st,got);return {got,n:list.length}},

  craft(G){const {st,ctx,p}=G;const ids=[...new Set(p.ids||[])];if(!ids.length||ids.length>5)fail("Выбери от 1 до 5 карточек");
    const h=p.h|0,f=p.f|0;if(!HEROES[h]||!FIN[f])fail("Неверная цель");if(isComp(h))fail("Составных воинов не крафтят: их собирают из половинок");if(FIN[f].excl)fail("Эту отделку нельзя скрафтить");
    if(FIN[f].run!==Infinity&&ctx.issuedOf(h,f)>=FIN[f].run)fail("Тираж этой отделки закончился");
    const inp=ids.map(id=>notHalf(burnable(freeCard(G,id)),"Половинки нельзя сжигать в крафте")),sum=inp.reduce((a,c)=>a+c.v,0),t=targetPrice(h,f),amu=p.amu?.1:0;
    if(amu)pay(st,amuCost(h,f));
    const pr=Math.min(PMAX+amu,HOUSE*sum/t+amu);if(pr<=0)fail("Шанс слишком мал");
    burn(G,ids);day(st,ctx.now).crafts++;const win=!!ctx.luck||Math.random()<pr;let card=null;   // режим удачи администратора: крафт всегда удаётся
    if(win){st.crafted=(st.crafted||0)+1;card=makeCard(ctx,h,f);addCard(G,card)}
    return {win,p:pr,card,lost:Math.round(sum*100)/100}},

  merge(G){const {ctx,p}=G;const h=p.h|0,f=p.f|0;if(f>=4)fail("Выше отделки нет");if(isComp(h))fail("Составных воинов не сливают");
    const same=G.cards.filter(c=>c.h===h&&c.f===f&&!c.part&&!away(c)).sort((a,b)=>a.v-b.v);if(same.length<3)fail("Нужно три одинаковых карточки");
    burn(G,same.slice(0,3).map(c=>c.id));const card=makeCard(ctx,h,f+1);addCard(G,card);return {card}},

  duel(G){const {st,ctx,p}=G;const me=battleCard(G,p.id),stat=p.stat|0;if(stat<0||stat>4)fail("Неверная характеристика");
    const t=HEROES[me.h][2],tt=Math.max(0,Math.min(4,t+[-1,0,0,0,1][Math.floor(Math.random()*5)]));
    const cand=HEROES.map((H,i)=>i).filter(i=>i<NBASE&&HEROES[i][2]===tt),oh=cand[Math.floor(Math.random()*cand.length)];
    // соперник: карточка настоящего игрока (сервер подбирает её сам), иначе бот
    const real=G.ctx.oppCard||null;
    if(real&&p.mode&&G.cards.length>=CAP)fail("Коллекция заполнена ("+CAP+"). Освободи место, чтобы драться на карточку");
    const opp=real||phantom(oh,Math.random()<.2?1:0),before=snap(me);
    const p2=aiPick(opp,[stat]),p3=rndPick([stat,p2]),picks=[stat,p2,p3],R=fight3(me,opp,picks);
    let reward=0,gotCard=null,lostCard=false;
    if(R.w===R.l)addXp(ctx,me,15);
    else if(R.w>R.l){me.wins=(me.wins||0)+1;st.totalWins=(st.totalWins||0)+1;addXp(ctx,me,30);day(st,ctx.now).wins++;
      if(p.mode&&real){ctx.takeCard=real.id;gotCard=snap(real);addCard(G,gotCard)}   // забираем карточку игрока
      else if(p.mode&&G.cards.length<CAP){gotCard=makeCard(ctx,opp.h,opp.f,{stats:opp.stats,hue:opp.hue});addCard(G,gotCard)}
      else{reward=Math.round(opp.v*.3+5);earn(st,reward)}}
    else{addXp(ctx,me,10);if(p.mode){if(real)ctx.giveAway=me.id;burn(G,[me.id]);lostCard=true}}   // с игроком карточка уходит к нему
    return {me:before,opp,picks,rounds:R.rounds,w:R.w,l:R.l,reward,gotCard,lostCard,real:!!real,oppName:real?G.ctx.oppName:null,oppUid:real?G.ctx.oppUid:null}},

  fduel(G){const {st,ctx,p}=G;const me=battleCard(G,p.myId),opp=p.opp,myStat=p.myStat|0;if(!opp)fail("Соперник не найден");if(FIN[opp.f]&&FIN[opp.f].excl)fail("С карточкой «Основатель» драться нельзя: это трофей");if(opp.part)fail("С половинкой драться нельзя");
    const p2=p.oppStat!=null?p.oppStat|0:aiPick(opp,[myStat]);if(p2===myStat)fail("Эту характеристику уже выбрал соперник");
    const picks=[myStat,p2,rndPick([myStat,p2])],before=snap(me),R=fight3(me,opp,picks);
    const key=String(p.key||"x")+"_"+me.h,first=!st.doneCh[key];let reward=0;
    if(R.w>R.l&&first){reward=Math.round(opp.v*.3+5);earn(st,reward);addXp(ctx,me,30);st.totalWins=(st.totalWins||0)+1;me.wins=(me.wins||0)+1;day(st,ctx.now).wins++;st.doneCh[key]=1}
    else if(R.w<R.l&&first){addXp(ctx,me,10);st.doneCh[key]=1}
    return {me:before,opp,picks,rounds:R.rounds,w:R.w,l:R.l,reward,first}},

  boss_squad(G){const B=boss(G.st,G.ctx.now),ids=(G.p.ids||[]).slice(0,3);ids.forEach(id=>battleCard(G,id));B.squad=ids;return {}},
  boss_hit(G){const {st,ctx}=G;const B=boss(st,ctx.now);if(B.dmg>=BOSS.hp)fail("Босс уже повержен");if(B.hits>=3+(B.extra||0))fail("Удары на сегодня закончились");
    const team=(B.squad||[]).map(id=>G.cards.find(c=>c.id===id)).filter(c=>c&&!away(c));if(!team.length)fail("Поставь воинов в отряд");
    let dmg=team.reduce((a,c)=>a+eff(c,0)*(1.6+Math.random()*.8),0);const crit=Math.random()<.18;if(crit)dmg*=2.5;dmg=Math.round(dmg);
    B.hits++;B.dmg=Math.min(BOSS.hp,B.dmg+dmg);team.forEach(c=>addXp(ctx,c,20));return {dmg,crit}},
  boss_claim(G){const {st,ctx}=G;const B=boss(st,ctx.now),i=G.p.i|0,M=MILES[i];if(!M)fail("Нет такой награды");if(B.got.includes(i))fail("Уже получено");if(B.dmg<BOSS.hp*M.p)fail("Ещё не открыто");
    B.got.push(i);let card=null;
    if(i===0)st.spins+=3;if(i===1)st.guar=(st.guar||0)+1;if(i===2){earn(st,500);st.spins+=3}
    if(i===3){const pool=HEROES.map((H,k)=>k).filter(k=>HEROES[k][2]===3);card=makeCard(ctx,pool[Math.floor(Math.random()*pool.length)],1);addCard(G,card)}
    return {card,t:M.t}},

  exp_start(G){const {st,ctx,p}=G;const c=notHalf(freeCard(G,p.id)),d=p.dest|0;if(!DEST[d])fail("Нет такого похода");
    const slots=EX_SLOTS+(st.mapDay===today(ctx.now)?1:0);if(G.cards.filter(x=>x.away).length>=slots)fail("Все места для походов заняты");
    c.away=ctx.now+DEST[d].ms;c.dest=d;return {}},
  exp_rush(G){if(!G.ctx.test&&!G.ctx.admin)fail("Ускорение доступно только в тестовом режиме");const c=own(G,G.p.id);if(!c.away)fail("Воин не в походе");c.away=G.ctx.now-1;return {}},
  exp_claim(G){const {st,ctx}=G;const c=own(G,G.p.id);if(!c.away)fail("Воин не в походе");if(c.away>ctx.now)fail("Воин ещё в пути");
    const D=DEST[c.dest]||DEST[0],money=rint(D.m[0],D.m[1]),sp=Math.floor(D.sp)+(Math.random()<D.sp%1?1:0);
    earn(st,money);addXp(ctx,c,D.xp);st.spins+=sp;c.away=0;c.dest=null;let card=null;
    if(Math.random()<D.card&&G.cards.length<CAP){card=rollCard(ctx,false);addCard(G,card)}
    return {money,xp:D.xp,sp,card}},

  train(G){const c=notHalf(own(G,G.p.id));if(c.listed)fail("Карточка на рынке");if(lvl(c)>=LMAX)fail("Максимальный уровень");pay(G.st,trainCost(c));addXp(G.ctx,c,50);return {}},
  forge(G){const c=notHalf(own(G,G.p.id));if(c.listed)fail("Карточка на рынке");const s=c.stars||0;if(s>=STAR_MAX)fail("Уже максимум звёзд");
    if(lvl(c)<STAR_LVL[s])fail("Нужен уровень "+STAR_LVL[s]+". Качай воина в боях, походах и у тренера");
    pay(G.st,forgeCost(c));c.stars=s+1;c.v=Math.round(c.v*STAR_V*100)/100;return {stars:c.stars,v:c.v}},
  rage(G){const B=boss(G.st,G.ctx.now);if((B.extra||0)>=2)fail("Лимит зелий на сегодня");pay(G.st,150);B.extra=(B.extra||0)+1;return {}},
  map(G){if(G.st.mapDay===today(G.ctx.now))fail("Карта уже куплена");pay(G.st,120);G.st.mapDay=today(G.ctx.now);return {}},
  frame(G){const c=notHalf(own(G,G.p.id)),F=FRAMES[G.p.frame];if(!F)fail("Нет такой рамки");if(F.only&&!G.ctx.pioneer)fail("Эта рамка только для первых "+PIONEERS+" игроков");if(c.listed)fail("Карточка на рынке");if(c.frame===G.p.frame)fail("Эта рамка уже надета");pay(G.st,F.cost);c.frame=G.p.frame;return {}},

  task(G){const {st,ctx}=G;const D=day(st,ctx.now),i=G.p.i|0,T=TASKS[i];if(!T)fail("Нет такого задания");if(D.got.includes(i))fail("Уже получено");if(D[T.k]<T.n)fail("Задание ещё не выполнено");D.got.push(i);st.spins+=T.r;return {r:T.r}},
  streak(G){const st=G.st;checkStreak(st,G.ctx.now);if(st.streak.claimed)fail("Уже получено сегодня");st.streak.claimed=true;st.spins+=1;if(st.streak.n===7)st.guar=(st.guar||0)+1;return {n:st.streak.n}},
  ach(G){const A=ACH.find(a=>a.id===G.p.id);if(!A)fail("Нет такого достижения");if(G.st.ach[A.id])fail("Уже получено");if(!A.ok(G.st,G.cards))fail("Достижение ещё не выполнено");G.st.ach[A.id]=1;G.st.spins+=A.r;return {r:A.r,t:A.t}},

  sub_reward(G){if(!G.ctx.subOk)fail("Сначала подпишись на канал");if(G.st.subGot2)fail("Награда за подписку уже получена");G.st.subGot2=1;G.st.spins+=10;return {r:10}},

  /* история в Telegram: +10 прокруток раз в неделю. Telegram не даёт ботам проверить, что история опубликована,
     поэтому награда выдаётся после открытия окна публикации */
  story(G){const w=weekKey(G.ctx.now);if(G.st.storyWeek===w)fail("За историю на этой неделе уже получено. Новая награда в понедельник");G.st.storyWeek=w;G.st.spins+=10;return {r:10}},

  /* режим удачи на 3 часа: только администратор (сервер передаёт ctx.admin) */
  luck_set(G){if(!G.ctx.admin)fail("Нет доступа");G.st.luckUntil=G.p.on?G.ctx.now+3*3600e3:0;return {on:!!G.p.on,until:G.st.luckUntil}},

  buy_spin(G){const {st,ctx}=G;const C=camp(st,ctx.now);if(spinsBought(st,ctx.now)>=BUY_MAX)fail("Сегодня уже куплено "+BUY_MAX+" прокруток. Завтра цены сбросятся");
    const price=spinPrice(st,ctx.now);if(C.runes<price)fail("Не хватает рун: нужно "+price+", у тебя "+Math.floor(C.runes));
    C.runes-=price;if(C.buyDay!==today(ctx.now)){C.buyDay=today(ctx.now);C.buyN=0}C.buyN++;st.spins+=1;return {price}},
  /* удары по мишени пачкой: игра присылает число тапов раз в секунду */
  notice_ok(G){delete G.st.notice;return {}},
  camp_tap(G){const {st,ctx}=G;const C=camp(st,ctx.now);let n=Math.max(0,Math.min(400,Math.floor(+G.p.n||0)));
    const room=C.tapAt?Math.floor((ctx.now-C.tapAt)/1000*TAP_RATE)+20:60;n=Math.min(n,Math.floor(C.en),room);C.tapAt=ctx.now;
    let gain=0,crits=0,chests=0,chestR=0;const pw=campPow(C,G.cards),cc=campCrit(C);
    for(let i=0;i<n;i++){const cr=Math.random()<cc,d=pw*(cr?CRIT_X:1);if(cr)crits++;gain+=d;C.hp-=d;
      if(C.hp<=0){chests++;chestR+=TARGETS[C.t].chest;C.kills++;C.hp=TARGETS[C.t].hp}}
    gain=Math.round(gain)+chestR;C.en-=n;C.runes+=gain;C.total+=gain;campEarn(C,ctx.now,gain);C.fullAt=C.en>=campMax(C)?0:Math.round(ctx.now+(campMax(C)-C.en)/campMax(C)*campFull(C));
    return {n,gain,crits,chests,chestR}},
  camp_up(G){const {st,ctx}=G;const C=camp(st,ctx.now),k=G.p.k,U=CAMP_UP[k];if(!U)fail("Нет такой прокачки");const l=C.lv[k]||0;if(l>=U.max)fail("Уже максимальный уровень");
    const c=U.c(l);if(C.runes<c)fail("Не хватает рун: нужно "+c);if(k==="sq"&&C.lv.sq){const g=campSq(C,ctx.now);C.runes+=g;campEarn(C,ctx.now,g)}C.runes-=c;C.lv[k]=l+1;
    if(k==="en")C.en+=100;if(k==="sq")C.sqAt=ctx.now;camp(st,ctx.now);return {k,l:l+1}},
  camp_target(G){const {st,ctx}=G;const C=camp(st,ctx.now);if(C.t>=TARGETS.length-1)fail("Это самая сильная мишень");
    const T=TARGETS[C.t+1];if(C.runes<T.cost)fail("Не хватает рун: нужно "+T.cost);if(C.lv.sq){const g=campSq(C,ctx.now);C.runes+=g;campEarn(C,ctx.now,g)}C.sqAt=ctx.now;C.runes-=T.cost;C.t++;C.hp=T.hp;return {t:C.t}},
  camp_collect(G){const {st,ctx}=G;const C=camp(st,ctx.now);if(!C.lv.sq)fail("Сначала найми оруженосца");const g=campSq(C,ctx.now);if(g<1)fail("Оруженосец ещё ничего не натренировал");
    C.runes+=g;C.total+=g;campEarn(C,ctx.now,g);C.sqAt=ctx.now;return {gain:g}},
  wheel(G){const {st,ctx}=G;if(st.wheelDay===today(ctx.now))fail("Колесо уже крутилось сегодня. Приходи завтра");
    st.wheelDay=today(ctx.now);const i=pick(WHEEL.map(x=>x.w)),W=WHEEL[i];let card=null;
    if(W.sp)st.spins+=W.sp;if(W.cash)earn(st,W.cash);if(W.guar)st.guar=(st.guar||0)+1;
    if(W.leg){if(G.cards.length<CAP){const pool=HEROES.map((H,k)=>k).filter(k=>HEROES[k][2]===3);card=makeCard(ctx,pool[Math.floor(Math.random()*pool.length)],0);addCard(G,card)}else{st.guar=(st.guar||0)+1;earn(st,1000)}}
    return {i,card}},
  /* призы турнира: только сервер */
  tour_prize(G){if(!G.ctx.tour)fail("Неизвестное действие");const {st,p}=G;if(p.cash)earn(st,p.cash);if(p.sp)st.spins+=p.sp;if(p.guar)st.guar=(st.guar||0)+p.guar;return {}},

  /* итог живого боя на арене: только сервер (ctx.pvp) */
  pvp_result(G){if(!G.ctx.pvp)fail("Неизвестное действие");const {st,ctx,p}=G;const c=G.cards.find(x=>x.id===p.id);
    if(p.res==="w"){st.totalWins=(st.totalWins||0)+1;day(st,ctx.now).wins++;if(c){c.wins=(c.wins||0)+1;addXp(ctx,c,30)}}
    else if(c)addXp(ctx,c,p.res==="d"?15:10);return {}},

  /* собрать составного воина: левая + правая половинка. Две «ошибки печати» дают целую «ошибку печати» 1/1 */
  assemble(G){const {st,ctx}=G;const h=G.p.h|0;if(!isComp(h))fail("Это не составной воин");
    const L=G.cards.filter(c=>c.h===h&&c.part===1&&!away(c)),R=G.cards.filter(c=>c.h===h&&c.part===2&&!away(c));
    if(!L.length||!R.length)fail("Нужны свободные левая и правая половинки воина «"+HEROES[h][0]+"»");
    let l=L.find(c=>c.f===4),r=R.find(c=>c.f===4),f=4;if(!(l&&r)||ctx.compErr(h,0)){l=L.find(c=>c.f===0);r=R.find(c=>c.f===0);f=0}
    if(!l||!r)fail("«Ошибка печати» собирается только со второй половинкой «Ошибки печати»");
    const no=f===4?1:r.no,B=cardBody(h,f);if(f===4)ctx.compErrTake(h,0);
    const card={id:ctx.newId(),h,f,no,sn:r.sn,part:0,hue:r.hue,stats:B.stats,v:priceOf(h,f,no,r.sn,B.top,0),xp:Math.max(l.xp||0,r.xp||0),wins:0,stars:0,frame:null,away:0,dest:null,listed:0,listPrice:0};
    burn(G,[l.id,r.id]);if(ctx.takeSn)ctx.takeSn(r.sn);G.cards.push(card);noteCard(st,card);st.built=(st.built||0)+1;return {card}},
  /* выдача покупки из Сокровищницы: только сервер после оплаты (ctx.grant). Повтор с тем же pid ничего не выдаёт */
  grant(G){if(!G.ctx.grant)fail("Неизвестное действие");const {st,ctx,p}=G,I=SHOP[p.item];if(!I)fail("Нет такого товара");
    st.pays=st.pays||[];if(st.pays.includes(p.pid))return {dup:1};
    const got=[],add=c=>{G.cards.push(c);noteCard(st,c);got.push(c)};   // купленное кладётся сверх лимита коллекции
    if(I.sp)st.spins+=I.sp;if(I.guar)st.guar=(st.guar||0)+I.guar;if(I.once)st.newbie=1;
    for(let i=0;i<(I.halves||0);i++)add(rollHalf(ctx,i===0&&I.right1?1:I.rightP));
    if(I.cards){let n=I.cards;
      if(I.myth){add(rollTier(ctx,4));n--}
      if(I.leg){add(rollTier(ctx,3));n--}
      if(I.epic){add(rollCard(ctx,true));n--}
      for(;n>0;n--)add(rollCard(ctx,false))}
    st.pays.push(p.pid);if(st.pays.length>40)st.pays=st.pays.slice(-40);
    return {item:p.item,sp:I.sp||0,guar:I.guar||0,cards:got}},

  topup(G){if(!G.ctx.test&&!G.ctx.admin)fail("Только в тестовом режиме");G.st.spins+=3;return {}}
};
/* выполнить действие: проверки времени, затем само действие */
function runAction(name,st,cards,ctx,p){const A=ACTIONS[name];if(!A)fail("Неизвестное действие");touch(st,ctx.now);const G={st,cards,ctx,p:p||{}};const res=A(G)||{};return {res,cards:G.cards}}

if(typeof module!=="undefined")module.exports={NBASE,COMP,isComp,SHOP,CHESTS,numPrice,checkSn,NFX,NFX_PRICE,HALF_RUN,TRAIN_B,campTrainer,campBonus,mskDay,mskWeek,camp,campMax,campFull,campPow,campCrit,campSq,campSqRate,TARGETS,CAMP_UP,CRIT_X,SQ_HOURS,spinsBought,spinPrice,BUY_MAX,WHEEL,aiPick,rndPick,away,spinCap,VIP_SPINS,checkNick,NICK_COST,STAR_MAX,epithet,HEROES,FIN,HT,NICE,classify,ACTIONS,runAction,freshState,touch,GameError,lvl,eff,CAP,MAX_LOTS,FEE,QUICK};
