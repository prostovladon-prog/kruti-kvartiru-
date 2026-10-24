// @ts-nocheck
// ⚠️ Файл собран автоматически из rules.js и server/server.js (tools/build_worker.py). Правь исходники, а не его.
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
 ["Левиафан","Морские легенды",4,"Морской змей размером с остров. Моряки принимали его спину за сушу.",{comp:1,hue:200,p:[6,8,4,8,6]}],
 /* донатные воины: в основном из сундуков Сокровищницы, в прокрутке — очень маленький шанс (SPIN_P) */
 ["Илья Муромец","Древняя Русь",4,"Тридцать лет и три года сидел сиднем, а потом один разогнал целое войско.",{don:1,hue:0,p:[8,7,3,7,7]}],
 ["Добрыня Никитич","Древняя Русь",4,"Победил Змея Горыныча и освободил полон. Дипломат и боец в одном лице.",{don:1,hue:210,p:[7,6,5,6,7]}],
 ["Алёша Попович","Древняя Русь",4,"Младший из богатырей. Берёт не силой, а хитростью — и всегда первым.",{don:1,hue:120,p:[6,4,8,5,8]}],
 /* легенды 1 из 1: существуют только как «Ошибка печати», одна карточка на весь мир */
 ["Тор","Мифы Скандинавии",4,"Бог грома. Мьёльнир всегда возвращается в руку.",{don:1,one:1,sn:"444444",hue:210,p:[8,7,5,7,8]}],
 ["Три богатыря","Древняя Русь",4,"Илья, Добрыня и Алёша на одной заставе. Вместе их ещё никто не одолел.",{don:1,one:1,sn:"333333",hue:30,p:[8,8,6,8,8]}],
 ["Зевс","Мифы Греции",4,"Царь богов Олимпа. Одна молния — и спор окончен.",{don:1,one:1,sn:"999999",hue:270,p:[8,6,6,7,9]}],
 ["Геракл","Древняя Греция",4,"Совершил двенадцать подвигов. Задушил немейского льва голыми руками.",{don:1,one:1,sn:"121212",hue:30,p:[9,7,5,8,7]}]];
const NBASE=32, NHEROES=NBASE;          // в альбоме и прокрутках только 32 обычных воина
const COMP=HEROES.map((H,i)=>i).filter(i=>HEROES[i][4].comp), isComp=h=>!!(HEROES[h]&&HEROES[h][4].comp);
const DON=HEROES.map((H,i)=>i).filter(i=>HEROES[i][4].don&&!HEROES[i][4].one), ONE=HEROES.map((H,i)=>i).filter(i=>HEROES[i][4].one);
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
function classify(n){if(!/^\d{6}$/.test(n||""))return null;
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
/* крафт: «Ошибку печати» скрафтить нельзя (только выбить), у золота шанс не больше 30%.
   Скрафченная карточка стоит около цены цели — без множителей за номер 1 и характеристики, иначе крафт «печатает» деньги */
/* мифического скрафтить можно максимум с шансом 10% и в 10 раз дороже, легендарного — 30% и втрое дороже: иначе богатые штампуют мифов */
const CRAFT_TIER_MAX=[PMAX,PMAX,PMAX,.3,.1], CRAFT_TIER_K=[1,1,1,3,10];
const CRAFT_MAX=(f,h)=>Math.min(f>=3?.3:PMAX,h==null?PMAX:CRAFT_TIER_MAX[HEROES[h][2]]), craftable=f=>f<4;
const craftPrice=(h,f)=>Math.round(targetPrice(h,f)*CRAFT_TIER_K[HEROES[h][2]]*100)/100;
const amuCost=(h,f)=>Math.max(20,Math.round(craftPrice(h,f)*.15));
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

/* ---------- РЕЙТИНГОВЫЙ БОЙ ----------
   Бой до конца здоровья. Каждый ход оба игрока вслепую выбирают действие: удар бьёт финт, блок бьёт удар, финт бьёт блок.
   Угадал — наносишь полный урон. Одинаковый выбор: два удара — оба бьют вполсилы, два финта — оба по 30%, два блока — ничего.
   Характеристики: Атака — урон, Броня — защита от урона, Выносливость — здоровье, Скорость — шанс увернуться, Боевой дух — шанс крита.
   У каждого воина своя способность (ABIL). Соперник подбирается по весовой категории карты. */
const RK_ACTS={hit:"Удар",block:"Блок",feint:"Финт"},RK_IC={hit:"⚔️",block:"🛡",feint:"🌀"},RK_BEATS={hit:"feint",block:"hit",feint:"block"};
const WCLASS=["Лёгкий вес","Средний вес","Тяжёлый вес"],WC_IC=["🪶","⚔️","🔥"];
const wclass=h=>{const t=HEROES[h][2];return t<=1?0:t===2?1:2};
const LEAGUES=[{n:"Бронза",ic:"🥉",at:0},{n:"Серебро",ic:"🥈",at:1000},{n:"Золото",ic:"🥇",at:2500},{n:"Платина",ic:"💠",at:4000},{n:"Алмаз",ic:"💎",at:6000},{n:"Легенда",ic:"🔥",at:8000},{n:"Император",ic:"👑",at:10000}];
function league(r){let i=0;for(let k=0;k<LEAGUES.length;k++)if((r||0)>=LEAGUES[k].at)i=k;return i}
const RK_WIN=[25,30,40],RK_LOSS=20,RK_STREAK=5,RK_STREAK_MAX=15,RK_DAY=20,RK_UNDER=10,RK_TURNS=15;
/* награды сезона по лиге (sp — прокрутки, guar — гарантированный эпик, tier — карточка этой редкости) */
const SEASON_PRIZE=[null,{sp:2},{sp:3,guar:1},{sp:5,guar:1},{sp:7,tier:3},{sp:10,tier:3},{sp:10,tier:4}];
const FAT_N=5,FAT_MS=3600e3,FAT_K=.8;   // усталость: после 5 рейтинговых боёв подряд −20% к силе, отдых час
/* способности: [иконка, название, описание, эффект] */
const ABIL=[
["😤","Злость","+10% к Боевому духу",{st:{4:.1}}],
["🏹","Первая стрела","первый удачный удар +20%",{first:.2}],
["🎯","Белке в глаз","+8% к шансу крита",{crit:[.08,0]}],
["🛡","Строй","+10% к Броне",{st:{1:.1}}],
["🪨","Камень Давида","+15% урона против более редкого воина",{vsRare:.15}],
["🗡","Длинный меч","+10% к Атаке",{st:{0:.1}}],
["🌙","Ночная смена","+10% к Выносливости",{st:{3:.1}}],
["📚","Учебка","+5% ко всем характеристикам",{all:.05}],
["⏳","Перезарядка","каждый 3-й ход урон +30%",{every3:.3}],
["👣","Опора самураев","+10% к Скорости",{st:{2:.1}}],
["🐢","Черепаха","удачный Блок бьёт на 30% сильнее",{blockX:.3}],
["⛵","Набег","первый удачный удар +40%",{first:.4}],
["🪖","Латы","+15% к Броне",{st:{1:.15}}],
["💥","Залп","+12% к шансу крита",{crit:[.12,0]}],
["🔥","Встал с печи","после пропущенного удара следующий +10%",{afterHurt:.1}],
["🧱","Фаланга","+12% к Броне и Выносливости",{st:{1:.12,3:.12}}],
["🐎","Стрела назад","+12% к шансу увернуться",{dodge:.12}],
["⚔️","Воительница","+12% к Атаке",{st:{0:.12}}],
["🕵️","Шпионка","соперник −12% к Боевому духу",{opp:{4:-.12}}],
["🛡","Со щитом","первый пропущенный удар не наносит урона",{shield:1}],
["🗡","Первый удар","первый удачный удар ×1,5",{first:.5}],
["🌑","Тень","+25% к шансу увернуться",{dodge:.25}],
["📣","Рёв толпы","каждый удачный удар +10% к следующим",{stack:.1}],
["🪽","Выбор павших","при здоровье ниже половины урон ×1,4",{low:[.5,.4]}],
["🚩","Знамя","+20% к Боевому духу и Выносливости",{st:{4:.2,3:.2}}],
["🐍","Каменный взгляд","соперник −25% ко всему в первые 3 хода",{early:[3,-.25]}],
["🐺","Безумие","+35% к Атаке, −15% к Броне",{st:{0:.35,1:-.15}}],
["✝️","Обет","при здоровье ниже половины урон ×1,5",{low:[.5,.5]}],
["🐂","Лабиринт","соперник −12% ко всему",{oppAll:-.12}],
["⚖️","Весы","+10% к Броне и один раз переживает смертельный удар",{save:1,st:{1:.1}}],
["👹","Маска демона","первый удачный удар ×1,5 и соперник −15% ко всему",{first:.5,oppAll:-.15}],
["🔮","Чары","−35% к Атаке соперника",{opp:{0:-.35}}],
["🔥","Огненное дыхание","+30% к Атаке",{st:{0:.3}}],
["🪶","Из пепла","один раз воскресает с 40% здоровья",{revive:.4}],
["🐙","Щупальца","соперник −25% к Скорости и Броне",{opp:{1:-.25,2:-.25}}],
["🐕","Три головы","каждый удачный удар +10% к следующим",{stack:.1}],
["🦁","Тройная натура","+25% к Атаке, Духу и Скорости",{st:{0:.25,4:.25,2:.25}}],
["🌊","Пучина","+25% к Броне и Выносливости",{st:{1:.25,3:.25}}],
["🏔","Сила земли","+20% к Атаке и Выносливости",{st:{0:.2,3:.2}}],
["🐉","Змееборец","+45% урона против мифических",{vsMyth:.45}],
["🦊","Хитрость","+30% к шансу увернуться и видит первый ход соперника",{dodge:.3,peek:1}],
["🔨","Мьёльнир","30% шанс крита ×2",{crit:[.3,2]}],
["🛡","Застава","+15% ко всем характеристикам",{all:.15}],
["⚡","Молния","35% шанс ударить молнией, даже если соперник угадал",{zap:.35}],
["🦁","12 подвигов","+10% ко всему, +25% после пропущенного удара",{all:.1,afterHurt:.25}]];
const abil=h=>ABIL[h]||ABIL[0];
/* боец: характеристики с учётом уровня, звёзд, усталости и способностей (своих и соперника) */
/* внутри весовой категории разница редкости сглажена: более редкий воин сильнее примерно на 10%, а не в разы */
const RK_TIER_K=[1.75,1,1,1.22,1];
function rkFighter(c,o){o=o||{};const A=abil(c.h)[3],k=(o.tired?FAT_K:1)*(o.under?1.1:1)*RK_TIER_K[HEROES[c.h][2]];
  return {h:c.h,id:c.id,base:[0,1,2,3,4].map(i=>Math.round(eff(c,i)*k*(1+(A.all||0)+((A.st||{})[i]||0)))),shield:A.shield?1:0,save:A.save?1:0,revive:A.revive||0,stack:0,hurt:0,hits:0,tired:o.tired?1:0,under:o.under?1:0}}
function rkStats(F,E,turn){const EA=abil(E.h)[3];return F.base.map((v,i)=>Math.max(1,Math.round(v*(1+(EA.oppAll||0)+((EA.opp||{})[i]||0)+(EA.early&&turn<=EA.early[0]?EA.early[1]:0)))))}
function rkInit(ca,cb,o){o=o||{};const a=rkFighter(ca,o.a),b=rkFighter(cb,o.b);
  for(const F of [a,b]){const E=F===a?b:a,s=rkStats(F,E,99);F.mx=F.hp=Math.round(200+s[3]*1.6)}
  return {turn:0,a,b,log:[],done:0,win:null}}
/* один ход: x,y — действия сторон a и b. rnd — генератор случайности (на сервере Math.random) */
function rkTurn(S,x,y,rnd){rnd=rnd||Math.random;if(S.done)return null;S.turn++;const t=S.turn,ev={t,a:x,b:y,da:0,db:0,fa:[],fb:[]};
  const sa=rkStats(S.a,S.b,t),sb=rkStats(S.b,S.a,t);
  let ma=0,mb=0;   // множитель урона стороны a по b и наоборот
  if(x===y){if(x==="hit"){ma=mb=.5}else if(x==="feint"){ma=mb=.3}}else if(RK_BEATS[x]===y)ma=1;else mb=1;
  const strike=(X,Y,sx,sy,m,act,fx,zap)=>{const A=abil(X.h)[3],TY=HEROES[Y.h][2],TX=HEROES[X.h][2];
    let d=sx[0]*sx[0]/(sx[0]+sy[1])*.8*m;
    if(A.first&&!X.hits)d*=1+A.first;if(A.every3&&t%3===0)d*=1+A.every3;if(X.stack)d*=1+X.stack;if(A.afterHurt&&X.hurt)d*=1+A.afterHurt;
    if(A.low&&X.hp<X.mx*A.low[0])d*=1+A.low[1];if(A.vsRare&&TY>TX)d*=1+A.vsRare;if(A.vsMyth&&TY>=4)d*=1+A.vsMyth;if(A.blockX&&act==="block"&&!zap)d*=1+A.blockX;
    const cp=.05+sx[4]/(sx[4]+900)*.25+((A.crit||[0])[0]);if(rnd()<cp){d*=(A.crit&&A.crit[1])||1.5;fx.push("crit")}
    const YA=abil(Y.h)[3],dp=.03+sy[2]/(sy[2]+1500)*.2+(YA.dodge||0);if(rnd()<dp){fx.push("dodge");return 0}
    if(Y.shield){Y.shield=0;fx.push("shield");return 0}
    return Math.max(1,Math.round(d))};
  if(ma)ev.da=strike(S.a,S.b,sa,sb,ma,x,ev.fa);if(mb)ev.db=strike(S.b,S.a,sb,sa,mb,y,ev.fb);
  // молния Зевса: бьёт, даже если соперник угадал
  for(const [X,Y,sx,sy,k,fx] of [[S.a,S.b,sa,sb,"da",ev.fa],[S.b,S.a,sb,sa,"db",ev.fb]]){const A=abil(X.h)[3];if(A.zap&&!ev[k]&&rnd()<A.zap){fx.push("zap");ev[k]=strike(X,Y,sx,sy,.7,"zap",fx,1)}}
  S.b.hp-=ev.da;S.a.hp-=ev.db;
  for(const [X,Y,k] of [[S.a,S.b,"da"],[S.b,S.a,"db"]]){const A=abil(X.h)[3];if(ev[k]>0){X.hits++;if(A.stack)X.stack+=A.stack;X.hurt=0;Y.hurt=1}}
  for(const [F,fx] of [[S.a,ev.fb],[S.b,ev.fa]])if(F.hp<=0){if(F.save){F.save=0;F.hp=1;fx.push("save")}else if(F.revive){F.hp=Math.round(F.mx*F.revive);F.revive=0;fx.push("revive")}}
  S.a.hp=Math.max(0,S.a.hp);S.b.hp=Math.max(0,S.b.hp);
  if(S.a.hp<=0||S.b.hp<=0||t>=RK_TURNS){S.done=1;const pa=S.a.hp/S.a.mx,pb=S.b.hp/S.b.mx;S.win=pa>pb?"a":pb>pa?"b":"d"}
  S.log.push(ev);if(S.log.length>8)S.log.shift();return ev}
/* ход бота: случайный, но чуть хитрее — после своего удачного удара чаще повторяет его */
function rkAI(S,side){const r=Math.random(),L=S.log[S.log.length-1];if(L&&Math.random()<.25){const my=L[side],won=side==="a"?L.da>0:L.db>0;if(won)return my}return r<.36?"hit":r<.68?"block":"feint"}
/* сколько рейтинга за бой */
function rkGain(win,wc,streak,under,rating){if(win)return RK_WIN[wc]+Math.min(RK_STREAK_MAX,RK_STREAK*(streak||0))+(under?RK_UNDER:0);
  const floor=LEAGUES[league(rating)].at;return -Math.min(RK_LOSS,Math.max(0,(rating||0)-floor))}

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
function rollTier(ctx,tier,extra){const pool=HEROES.map((H,i)=>i).filter(i=>i<NBASE&&HEROES[i][2]===tier).concat(extra||[]),h=pool[Math.floor(Math.random()*pool.length)];
  let f=pick(FIN.map(x=>x.w));while(f>0&&ctx.issuedOf(h,f)>=FIN[f].run)f--;return makeCard(ctx,h,f)}
/* легенда 1 из 1 (Тор и др.): только «Ошибка печати», свой номер. null — если все уже у игроков */
function rollOne(ctx,want1){const free=ONE.filter(h=>ctx.issuedOf(h,4)<1);if(!free.length)return null;const h=want1!=null?want1:free[Math.floor(Math.random()*free.length)];if(!free.includes(h))fail("Эта легенда уже у другого игрока");
  const c=makeCard(ctx,h,4),want=HEROES[h][4].sn;if(want&&ctx.snFree(want)){ctx.takeSn(want);c.sn=want;c.v=priceOf(h,4,1,want,false)}return c}
const ONE_P={legend:.005,mythic:.02}, DON_P={legend:.04}, SPIN_P={don:.0003,one:.00001};   // в прокрутке: богатырь 0,03% (каждый 0,01%), легенда 1 из 1 — 0,001%
/* ---------- Сокровищница: покупки за Telegram Stars ----------
   Лимита на человека нет: редкость держится общим тиражом (300 правых половинок на воина, 30 мифических сундуков в месяц на всю игру).
   Отделки и номера в сундуках выпадают с обычными шансами, ничего не подкручено. */
const SHOP={
 newbie:{n:"Подарок новичку",stars:25,sp:10,guar:1,once:1,d:["🎴 <b>10</b> прокруток","💎 гарантированный <b>эпик</b>"]},
 small:{n:"Малый сундук",stars:50,sp:10,halves:1,rightP:HALF_P.right,d:["🎴 <b>10</b> прокруток","🧩 <b>1</b> половинка составного воина","шанс правой: <b>15%</b>"]},
 royal:{n:"Королевский сундук",stars:250,sp:60,halves:6,rightP:HALF_P.right,right1:1,d:["🎴 <b>60</b> прокруток","🧩 <b>6</b> половинок","минимум <b>1 правая</b> гарантированно"]},
 warrior:{n:"Сундук воина",stars:75,cards:5,epic:1,d:["🃏 <b>5</b> карточек","минимум <b>1 эпическая</b>"]},
 legend:{n:"Легендарный сундук",stars:300,cards:10,leg:1,d:["🃏 <b>10</b> карточек","гарантированно <b>легендарная</b>","шанс <b>4%</b> на богатыря"]},
 mythic:{n:"Мифический сундук",stars:1000,cards:10,myth:1,leg:1,month:30,d:["🃏 <b>10</b> карточек","гарантированно <b>мифический</b>: Сёгун, Мерлин или богатырь","+ легендарная","шанс <b>2%</b> на легенду 1 из 1","всего <b>30</b> в месяц на всю игру"]}};
const CHESTS=["newbie","small","royal","warrior","legend","mythic"];
/* «любая карточка в игре»: игрок сам выбирает воина и отделку (если тираж ещё не закончился) */
function makeAny(ctx,h,f){if(!HEROES[h]||!FIN[f]||FIN[f].excl)fail("Такой карточки нет");const W=HEROES[h][4];
  if(W.one){if(f!==4)fail("Легенды 1 из 1 бывают только «Ошибкой печати»");return rollOne(ctx,h)}
  if(W.comp){if(f!==0)fail("Составного воина можно взять только обычной отделки");const no=ctx.compSlot(h);if(!no)fail("Тираж воина «"+HEROES[h][0]+"» закончился");
    const sn=genNumber(ctx,0),B=cardBody(h,0);return {id:ctx.newId(),h,f:0,no,sn,part:0,hue:B.hue,stats:B.stats,v:priceOf(h,0,no,sn,B.top,0),xp:0,wins:0,stars:0,frame:null,away:0,dest:null,listed:0,listPrice:0}}
  return makeCard(ctx,h,f)}
SHOP.any={n:"Любая карточка в игре",stars:4000,any:1,d:["выбери <b>любого воина</b> и <b>любую отделку</b>","хоть Тора 1 из 1, если он ещё свободен"]};
SHOP.custom={n:"Карточка твоей мечты",stars:5000,manual:1,d:["нарисуем <b>любого героя</b>, какого захочешь","с <b>любым номером</b>","только у тебя, в единственном экземпляре"]};
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
function burnable(c){if(FIN[c.f].excl)fail("«Основателя» нельзя продать системе или сжечь. Его можно выставить на рынок");if(HEROES[c.h][4].one)fail("Легенду 1 из 1 нельзя продать системе или сжечь — только на рынке");return c}
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
    const rr=ctx.noRare?1:Math.random();   // noRare — только для автотестов
    if(rr<SPIN_P.one)try{c=rollOne(ctx)}catch(e){}   // легенда 1 из 1: один шанс на сто тысяч
    else if(rr<SPIN_P.one+SPIN_P.don)c=rollTier(ctx,-1,DON);   // богатырь
    if(!c&&!epic&&!ctx.noRare&&Math.random()<HALF_P.drop)try{c=rollHalf(ctx,HALF_P.right)}catch(e){}   // редко вместо карточки выпадает половинка составного воина
    if(!c)c=rollCard(ctx,epic);if(epic&&(st.guar||0)>0)st.guar--;
    st.pity=HEROES[c.h][2]>=2?0:(st.pity||0)+1;
    addCard(G,c);day(st,ctx.now).opened++;return {card:c}},

  sell(G){const c=burnable(freeCard(G,G.p.id)),got=Math.round(c.v*QUICK*100)/100;burn(G,[c.id]);earn(G.st,got);return {got}},

  /* продать выбранные карточки системе одним нажатием */
  sellmany(G){const ids=[...new Set(G.p.ids||[])].slice(0,60);if(!ids.length)fail("Выбери карточки");
    const list=ids.map(id=>burnable(freeCard(G,id))),got=Math.round(list.reduce((a,c)=>a+c.v*QUICK,0)*100)/100;burn(G,ids);earn(G.st,got);return {got,n:list.length}},

  sellcommon(G){const list=G.cards.filter(c=>!away(c)&&c.f===0&&HEROES[c.h][2]===0);if(!list.length)fail("Обычных карточек нет");
    const got=Math.round(list.reduce((a,c)=>a+c.v*QUICK,0)*100)/100;burn(G,list.map(c=>c.id));earn(G.st,got);return {got,n:list.length}},

  craft(G){const {st,ctx,p}=G;const ids=[...new Set(p.ids||[])];if(!ids.length||ids.length>5)fail("Выбери от 1 до 5 карточек");
    const h=p.h|0,f=p.f|0;if(!HEROES[h]||!FIN[f])fail("Неверная цель");if(isComp(h))fail("Составных воинов не крафтят: их собирают из половинок");if(!craftable(f))fail("«Ошибку печати» нельзя скрафтить — её можно только выбить");if(h>=NBASE)fail("Этого воина не крафтят");if(FIN[f].excl)fail("Эту отделку нельзя скрафтить");
    if(FIN[f].run!==Infinity&&ctx.issuedOf(h,f)>=FIN[f].run)fail("Тираж этой отделки закончился");
    const inp=ids.map(id=>notHalf(burnable(freeCard(G,id)),"Половинки нельзя сжигать в крафте")),sum=inp.reduce((a,c)=>a+c.v,0),t=targetPrice(h,f),cp=craftPrice(h,f),amu=p.amu?.1:0;
    if(amu)pay(st,amuCost(h,f));
    const pr=Math.min(CRAFT_MAX(f,h)+amu,HOUSE*sum/cp+amu);if(pr<=0)fail("Шанс слишком мал");
    burn(G,ids);day(st,ctx.now).crafts++;const win=!!ctx.luck||Math.random()<pr;let card=null;   // режим удачи администратора: крафт всегда удаётся
    if(win){st.crafted=(st.crafted||0)+1;card=makeCard(ctx,h,f);card.v=Math.round(t*(.9+Math.random()*.2)*100)/100;card.how="craft";addCard(G,card)}
    return {win,p:pr,card,lost:Math.round(sum*100)/100}},

  merge(G){const {ctx,p}=G;const h=p.h|0,f=p.f|0;if(f>=4)fail("Выше отделки нет");if(f>=3)fail("Из золотых «Ошибку печати» не слить — её можно только выбить");if(isComp(h))fail("Составных воинов не сливают");
    const same=G.cards.filter(c=>c.h===h&&c.f===f&&!c.part&&!away(c)).sort((a,b)=>a.v-b.v);if(same.length<3)fail("Нужно три одинаковых карточки");
    const sum=same.slice(0,3).reduce((a,c)=>a+c.v,0);burn(G,same.slice(0,3).map(c=>c.id));const card=makeCard(ctx,h,f+1);card.v=Math.round(Math.min(card.v,sum*1.5)*100)/100;card.how="merge";addCard(G,card);return {card}},

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
    if(p.rk&&c){st.fat=st.fat||{};const f=st.fat[c.id]&&ctx.now-st.fat[c.id].t<FAT_MS?st.fat[c.id]:{n:0,t:0};f.n++;f.t=ctx.now;st.fat[c.id]=f;
      for(const k in st.fat)if(ctx.now-st.fat[k].t>FAT_MS)delete st.fat[k]}   // усталость после рейтинговых боёв
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
    burn(G,[l.id,r.id]);if(ctx.takeSn)ctx.takeSn(r.sn);card.how="build";G.cards.push(card);noteCard(st,card);st.built=(st.built||0)+1;return {card}},
  /* выдача покупки из Сокровищницы: только сервер после оплаты (ctx.grant). Повтор с тем же pid ничего не выдаёт */
  grant(G){if(!G.ctx.grant)fail("Неизвестное действие");const {st,ctx,p}=G,I=SHOP[p.item];if(!I)fail("Нет такого товара");
    st.pays=st.pays||[];if(st.pays.includes(p.pid))return {dup:1};
    const got=[],add=c=>{c.how="chest";G.cards.push(c);noteCard(st,c);got.push(c)};   // купленное кладётся сверх лимита коллекции
    if(I.sp)st.spins+=I.sp;if(I.guar)st.guar=(st.guar||0)+I.guar;if(I.once)st.newbie=1;
    for(let i=0;i<(I.halves||0);i++)add(rollHalf(ctx,i===0&&I.right1?1:I.rightP));
    if(I.any)add(makeAny(ctx,p.h|0,p.f|0));
    if(I.cards){let n=I.cards;
      if(I.myth){add(rollTier(ctx,4,DON));n--}
      if(I.leg){add(!I.myth&&Math.random()<DON_P.legend?rollTier(ctx,-1,DON):rollTier(ctx,3));n--}
      const op=ONE_P[p.item];if(op&&Math.random()<op){const one=rollOne(ctx);if(one){add(one);n--}}
      if(I.epic){add(rollCard(ctx,true));n--}
      for(;n>0;n--)add(rollCard(ctx,false))}
    st.pays.push(p.pid);if(st.pays.length>40)st.pays=st.pays.slice(-40);
    return {item:p.item,sp:I.sp||0,guar:I.guar||0,cards:got}},

  /* странствующий торговец: покупка (цену и карточку назначает сервер) и продажа ему нужного воина */
  trader_take(G){const T=G.ctx.trader;if(!T)fail("Неизвестное действие");const {st,ctx}=G;if(G.cards.length>=CAP)fail("Коллекция заполнена ("+CAP+"). Продай лишнее");
    pay(st,T.price);const card=makeCard(ctx,T.h,T.f,{stats:T.stats,hue:T.hue});card.v=T.v;card.how="trader";addCard(G,card);return {card,price:T.price}},
  trader_give(G){const T=G.ctx.trader;if(!T)fail("Неизвестное действие");const c=burnable(freeCard(G,G.p.id));if(c.h!==T.h)fail("Торговец ищет другого воина");
    const got=Math.round(c.v*T.k*100)/100;burn(G,[c.id]);earn(G.st,got);return {got}},
  /* награда за сезон рейтинга: только сервер */
  season_prize(G){if(!G.ctx.season)fail("Неизвестное действие");const {st,ctx,p}=G;if(p.sp)st.spins+=p.sp;if(p.guar)st.guar=(st.guar||0)+p.guar;let card=null;
    if(p.tier){card=rollTier(ctx,p.tier);card.how="chest";G.cards.push(card);noteCard(st,card)}return {card}},

  topup(G){if(!G.ctx.test&&!G.ctx.admin)fail("Только в тестовом режиме");G.st.spins+=3;return {}}
};
/* выполнить действие: проверки времени, затем само действие */
function runAction(name,st,cards,ctx,p){const A=ACTIONS[name];if(!A)fail("Неизвестное действие");touch(st,ctx.now);const G={st,cards,ctx,p:p||{}};const res=A(G)||{};return {res,cards:G.cards}}

const TRADER_MS=3*3600e3, TRADER_MARKUP=[1.5,1.6], TRADER_WANT_K=1.3, TRADER_WANT_N=5;
if(typeof module!=="undefined")module.exports={ABIL,abil,rkInit,rkTurn,rkAI,rkGain,rkFighter,wclass,league,LEAGUES,RK_DAY,FAT_N,FAT_MS,craftPrice,CRAFT_MAX,DON,ONE,rollOne,NBASE,COMP,isComp,SHOP,CHESTS,numPrice,checkSn,NFX,NFX_PRICE,HALF_RUN,TRAIN_B,campTrainer,campBonus,mskDay,mskWeek,camp,campMax,campFull,campPow,campCrit,campSq,campSqRate,TARGETS,CAMP_UP,CRIT_X,SQ_HOURS,spinsBought,spinPrice,BUY_MAX,WHEEL,aiPick,rndPick,away,spinCap,VIP_SPINS,checkNick,NICK_COST,STAR_MAX,epithet,HEROES,FIN,HT,NICE,classify,ACTIONS,runAction,freshState,touch,GameError,lvl,eff,CAP,MAX_LOTS,FEE,QUICK};


/* server.js — сервер «Воинов Эпох» для Cloudflare Workers.
   Правила игры берутся из rules.js (при сборке файлы склеиваются в один worker.js).

   Настройки воркера:
     DB         — привязка базы D1 (Bindings → D1 database, имя переменной DB)
     BOT_TOKEN  — секрет: токен бота из @BotFather, нужен для проверки, что игрок пришёл из Telegram
     TEST       — "1" включает тестовые кнопки (+3 прокрутки, ускорение походов). Перед запуском убери.
     DEV        — "1" разрешает вход без Telegram через ?dev=123 (только для проверки, перед запуском убери) */

const CORS={"Access-Control-Allow-Origin":"*","Access-Control-Allow-Methods":"GET, POST, OPTIONS",
  "Access-Control-Allow-Headers":"Content-Type, X-Init-Data, X-Dev-User, X-Dev-Start","Access-Control-Max-Age":"86400"};
const J=(o,s=200)=>new Response(JSON.stringify(o),{status:s,headers:{...CORS,"Content-Type":"application/json; charset=utf-8"}});

/* ---------- проверка, что запрос пришёл из Telegram ---------- */
async function hmac(key,msg){const k=await crypto.subtle.importKey("raw",typeof key==="string"?new TextEncoder().encode(key):key,{name:"HMAC",hash:"SHA-256"},false,["sign"]);
  return new Uint8Array(await crypto.subtle.sign("HMAC",k,new TextEncoder().encode(msg)))}
const hex=b=>[...b].map(x=>x.toString(16).padStart(2,"0")).join("");
async function checkInit(initData,token){
  if(!initData||!token)return null;
  const q=new URLSearchParams(initData),hash=q.get("hash");if(!hash)return null;q.delete("hash");
  const dcs=[...q.entries()].sort((a,b)=>a[0]<b[0]?-1:a[0]>b[0]?1:0).map(([k,v])=>k+"="+v).join("\n");
  const sig=hex(await hmac(await hmac("WebAppData",token),dcs));if(sig!==hash)return null;
  if(Date.now()/1000-(+q.get("auth_date")||0)>7*86400)return null;
  try{const u=JSON.parse(q.get("user")||"{}");if(!u.id)return null;return {id:u.id,name:String(u.first_name||"Игрок").slice(0,32),start:q.get("start_param")||"",pm:!!u.allows_write_to_pm}}catch(e){return null}
}

/* ---------- база ---------- */
/* новые колонки добавляются сами при первом запросе, вручную в консоли ничего делать не нужно */
let schemaOk=false;
/* Миграции базы. На бесплатном тарифе Cloudflare одно обращение может сделать не больше 50 запросов к базе,
   поэтому сначала смотрим, что уже есть (2 запроса), и выполняем только недостающее. Номер версии хранится в kv. */
const SCHEMA_V=19;
const MIGRATIONS=["ALTER TABLE users ADD COLUMN ref INTEGER","ALTER TABLE users ADD COLUMN refs INTEGER NOT NULL DEFAULT 0","ALTER TABLE users ADD COLUMN gift_spins INTEGER NOT NULL DEFAULT 0",
    "ALTER TABLE cards ADD COLUMN stars INTEGER NOT NULL DEFAULT 0","ALTER TABLE users ADD COLUMN nick TEXT","ALTER TABLE users ADD COLUMN nick_key TEXT",
    "CREATE UNIQUE INDEX IF NOT EXISTS users_nick ON users(nick_key)",
    "ALTER TABLE users ADD COLUMN worth REAL NOT NULL DEFAULT 0","ALTER TABLE users ADD COLUMN album INTEGER NOT NULL DEFAULT 0","ALTER TABLE users ADD COLUMN wins INTEGER NOT NULL DEFAULT 0",
    "CREATE INDEX IF NOT EXISTS users_worth ON users(worth)","CREATE INDEX IF NOT EXISTS users_album ON users(album)","CREATE INDEX IF NOT EXISTS users_wins ON users(wins)",
    "CREATE INDEX IF NOT EXISTS cards_v ON cards(v) WHERE owner>0",
    "DELETE FROM cards WHERE owner=0",
    "ALTER TABLE users ADD COLUMN seen INTEGER NOT NULL DEFAULT 0","ALTER TABLE users ADD COLUMN back INTEGER NOT NULL DEFAULT 0","ALTER TABLE users ADD COLUMN d1 INTEGER NOT NULL DEFAULT 0",
    "CREATE INDEX IF NOT EXISTS users_created ON users(created)","CREATE INDEX IF NOT EXISTS users_seen ON users(seen)",
    "CREATE TABLE IF NOT EXISTS stats (day TEXT NOT NULL, k TEXT NOT NULL, n INTEGER NOT NULL DEFAULT 0, PRIMARY KEY(day,k))",
    "CREATE TABLE IF NOT EXISTS fights (id INTEGER PRIMARY KEY AUTOINCREMENT, att INTEGER, att_name TEXT, att_card INTEGER, att_h INTEGER, def INTEGER, def_card INTEGER, def_h INTEGER, w INTEGER, l INTEGER, t INTEGER, seen INTEGER NOT NULL DEFAULT 0)",
    "CREATE INDEX IF NOT EXISTS fights_def ON fights(def, t)",
    "CREATE TABLE IF NOT EXISTS chat (id INTEGER PRIMARY KEY AUTOINCREMENT, uid INTEGER, name TEXT, text TEXT, t INTEGER)",
    "CREATE INDEX IF NOT EXISTS chat_uid ON chat(uid, id)",
    "ALTER TABLE users ADD COLUMN muted INTEGER NOT NULL DEFAULT 0",
    "ALTER TABLE users ADD COLUMN stake INTEGER NOT NULL DEFAULT 0",
    "ALTER TABLE fights ADD COLUMN stake INTEGER NOT NULL DEFAULT 0","ALTER TABLE fights ADD COLUMN took INTEGER NOT NULL DEFAULT 0",
    "ALTER TABLE users ADD COLUMN pioneer INTEGER NOT NULL DEFAULT 0",
    "CREATE UNIQUE INDEX IF NOT EXISTS users_pioneer ON users(pioneer) WHERE pioneer>0",
    "ALTER TABLE users ADD COLUMN founder INTEGER NOT NULL DEFAULT 0","ALTER TABLE users ADD COLUMN founder_seen INTEGER NOT NULL DEFAULT 0",
    "ALTER TABLE users ADD COLUMN pm INTEGER NOT NULL DEFAULT 0","ALTER TABLE users ADD COLUMN refill_at INTEGER NOT NULL DEFAULT 0",
    "ALTER TABLE users ADD COLUMN refill_note INTEGER NOT NULL DEFAULT 0","ALTER TABLE users ADD COLUMN att_note INTEGER NOT NULL DEFAULT 0",
    "CREATE INDEX IF NOT EXISTS users_refill ON users(refill_at) WHERE pm=1 AND refill_at>0",
    "ALTER TABLE users ADD COLUMN vip_until INTEGER NOT NULL DEFAULT 0",
    "CREATE TABLE IF NOT EXISTS kv (k TEXT PRIMARY KEY, v TEXT)",
    "CREATE INDEX IF NOT EXISTS users_ref ON users(ref, created)",
    "CREATE INDEX IF NOT EXISTS cards_fhn ON cards(f, h, no)",
    "ALTER TABLE cards ADD COLUMN room_id INTEGER",
    "CREATE TABLE IF NOT EXISTS rooms (id INTEGER PRIMARY KEY AUTOINCREMENT, code TEXT, priv INTEGER NOT NULL DEFAULT 0, mode INTEGER NOT NULL DEFAULT 0, host INTEGER, host_name TEXT, hc TEXT, guest INTEGER, guest_name TEXT, gc TEXT, phase TEXT NOT NULL DEFAULT 'open', until INTEGER NOT NULL DEFAULT 0, picks TEXT NOT NULL DEFAULT '[]', rounds TEXT NOT NULL DEFAULT '[]', applied INTEGER NOT NULL DEFAULT 0, ver INTEGER NOT NULL DEFAULT 0, created INTEGER, updated INTEGER)",
    "CREATE INDEX IF NOT EXISTS rooms_phase ON rooms(phase, created)",
    "ALTER TABLE rooms ADD COLUMN tour INTEGER",
    "CREATE TABLE IF NOT EXISTS tours (id INTEGER PRIMARY KEY AUTOINCREMENT, start INTEGER, phase TEXT NOT NULL DEFAULT 'reg', round INTEGER NOT NULL DEFAULT 0, reminded INTEGER NOT NULL DEFAULT 0, champion INTEGER, champion_name TEXT, created INTEGER)",
    "CREATE TABLE IF NOT EXISTS tour_players (tour INTEGER NOT NULL, uid INTEGER NOT NULL, name TEXT, card INTEGER, PRIMARY KEY(tour, uid))",
    "CREATE TABLE IF NOT EXISTS tour_matches (id INTEGER PRIMARY KEY AUTOINCREMENT, tour INTEGER, round INTEGER, slot INTEGER, a INTEGER, b INTEGER, room INTEGER, winner INTEGER)",
    "CREATE INDEX IF NOT EXISTS tour_matches_t ON tour_matches(tour, round)",
    "ALTER TABLE users ADD COLUMN src TEXT","CREATE TABLE IF NOT EXISTS src_visits (code TEXT NOT NULL, uid INTEGER NOT NULL, t INTEGER, PRIMARY KEY(code, uid))",
    "ALTER TABLE users ADD COLUMN camp_at INTEGER NOT NULL DEFAULT 0","ALTER TABLE users ADD COLUMN camp_note INTEGER NOT NULL DEFAULT 0",
    "CREATE INDEX IF NOT EXISTS users_camp ON users(camp_at) WHERE pm=1 AND camp_at>0",
    "ALTER TABLE users ADD COLUMN camp_dk TEXT","ALTER TABLE users ADD COLUMN camp_dr INTEGER NOT NULL DEFAULT 0","ALTER TABLE users ADD COLUMN camp_wk TEXT","ALTER TABLE users ADD COLUMN camp_wr INTEGER NOT NULL DEFAULT 0",
    "CREATE INDEX IF NOT EXISTS users_camp_d ON users(camp_dk, camp_dr)","CREATE INDEX IF NOT EXISTS users_camp_w ON users(camp_wk, camp_wr)",
    "ALTER TABLE cards ADD COLUMN part INTEGER NOT NULL DEFAULT 0",
    "CREATE TABLE IF NOT EXISTS payments (id INTEGER PRIMARY KEY AUTOINCREMENT, uid INTEGER NOT NULL, item TEXT, p TEXT, stars INTEGER, status TEXT NOT NULL DEFAULT 'new', charge TEXT, res TEXT, month TEXT, created INTEGER, paid INTEGER)",
    "CREATE INDEX IF NOT EXISTS payments_st ON payments(status, paid)","CREATE INDEX IF NOT EXISTS payments_m ON payments(month, status, uid)",
    "ALTER TABLE users ADD COLUMN fx TEXT","ALTER TABLE users ADD COLUMN fx_until INTEGER NOT NULL DEFAULT 0",
    "CREATE INDEX IF NOT EXISTS users_fx ON users(fx_until) WHERE fx_until>0",
    "ALTER TABLE cards ADD COLUMN how TEXT",
    "CREATE TABLE IF NOT EXISTS dtop (day TEXT NOT NULL, k TEXT NOT NULL, uid INTEGER NOT NULL, n INTEGER NOT NULL DEFAULT 0, PRIMARY KEY(day,k,uid))",
    "CREATE INDEX IF NOT EXISTS dtop_n ON dtop(day,k,n)",
    "ALTER TABLE users ADD COLUMN rating INTEGER NOT NULL DEFAULT 0","ALTER TABLE users ADD COLUMN rk_streak INTEGER NOT NULL DEFAULT 0","ALTER TABLE users ADD COLUMN rk_best INTEGER NOT NULL DEFAULT 0",
    "ALTER TABLE users ADD COLUMN rk_day TEXT","ALTER TABLE users ADD COLUMN rk_dayn INTEGER NOT NULL DEFAULT 0","ALTER TABLE users ADD COLUMN rk_season TEXT",
    "CREATE INDEX IF NOT EXISTS users_rk ON users(rk_season, rating)",
    "CREATE TABLE IF NOT EXISTS rq (uid INTEGER PRIMARY KEY, card INTEGER, wc INTEGER, rating INTEGER, t INTEGER)",
    "CREATE TABLE IF NOT EXISTS rm (id INTEGER PRIMARY KEY AUTOINCREMENT, a INTEGER, b INTEGER, an TEXT, bn TEXT, ac TEXT, bc TEXT, wa INTEGER, wb INTEGER, ghost INTEGER NOT NULL DEFAULT 0, st TEXT, pa TEXT, pb TEXT, phase TEXT, until INTEGER, ver INTEGER NOT NULL DEFAULT 0, applied INTEGER NOT NULL DEFAULT 0, res TEXT, created INTEGER)",
    "CREATE TABLE IF NOT EXISTS trader_sold (slot INTEGER NOT NULL, i INTEGER NOT NULL, uid INTEGER, name TEXT, t INTEGER, PRIMARY KEY(slot,i))",
    "CREATE TABLE IF NOT EXISTS trader_buy (slot INTEGER NOT NULL, h INTEGER NOT NULL, uid INTEGER NOT NULL, PRIMARY KEY(slot,h,uid))",
    "CREATE INDEX IF NOT EXISTS rm_a ON rm(a, phase)","CREATE INDEX IF NOT EXISTS rm_b ON rm(b, phase)","CREATE INDEX IF NOT EXISTS rm_ph ON rm(phase, until)"];   // откуда карточка: craft, merge, chest, build (для ленты «Прямо сейчас»)   // тиражи считаются только по ограниченным отделкам
async function ensureSchema(env){if(schemaOk)return;
  try{const r=await env.DB.prepare("SELECT v FROM kv WHERE k='schema_v'").first();if(r&&+r.v>=SCHEMA_V){schemaOk=true;return}}catch(e){}
  const have=new Set();
  try{for(const r of (await env.DB.prepare("SELECT name FROM sqlite_master").all()).results)have.add(r.name)}catch(e){}
  for(const t of ["users","cards","fights"])if(have.has(t))try{for(const r of (await env.DB.prepare("PRAGMA table_info("+t+")").all()).results)have.add(t+"."+r.name)}catch(e){}
  for(const q of MIGRATIONS){
    let m=/^ALTER TABLE (\w+) ADD COLUMN (\w+)/.exec(q);if(m&&have.has(m[1]+"."+m[2]))continue;
    m=/IF NOT EXISTS (\w+)/.exec(q);if(m&&have.has(m[1]))continue;
    if(/^DELETE FROM cards WHERE owner=0/.test(q)&&have.has("kv"))continue;   // разовая чистка, уже была
    try{await env.DB.prepare(q).run()}catch(e){}}
  // три карточки «Основатель» в казне игры (владелец -1). Если номер уже занят, берём запасной
  for(const F of FOUNDERS){const have=await env.DB.prepare("SELECT 1 FROM cards WHERE f=5 AND h=?").bind(F.h).first();if(have)continue;
    for(const sn of [F.sn,F.sn.slice(0,5)+"0","00000"+(FOUNDERS.indexOf(F)+3)]){
      try{const r=await env.DB.prepare("INSERT INTO cards(owner,h,f,no,sn,nice,hue,v,stats,xp,wins,stars,created) VALUES(-1,?,5,1,?,1,?,?,?,2500,0,5,?)")
        .bind(F.h,sn,HEROES[F.h][4].hue,250000,JSON.stringify(F.stats),Date.now()).run();if(r.meta.changes)break}catch(e){}}}
  try{await env.DB.prepare("CREATE TABLE IF NOT EXISTS kv (k TEXT PRIMARY KEY, v TEXT)").run();
    await env.DB.prepare("INSERT INTO kv(k,v) VALUES('schema_v',?) ON CONFLICT(k) DO UPDATE SET v=excluded.v").bind(String(SCHEMA_V)).run()}catch(e){}
  schemaOk=true}
function rowToCard(r){return {id:r.id,h:r.h,f:r.f,no:r.no,sn:r.sn,hue:r.hue,v:r.v,stats:JSON.parse(r.stats),xp:r.xp,wins:r.wins,stars:r.stars||0,frame:r.frame,part:r.part||0,cust:r.nice===2?1:0,
  away:r.away,dest:r.dest,listed:r.list_price!=null?1:0,listPrice:r.list_price||0,lock:r.room_id?1:0}}
const pub=c=>({id:c.id,h:c.h,f:c.f,no:c.no,sn:c.sn,hue:c.hue,v:c.v,stats:c.stats,xp:c.xp,wins:c.wins,stars:c.stars||0,frame:c.frame,part:c.part||0,cust:c.cust?1:0});
/* ---------- акция: пригласи N друзей за время акции → VIP на неделю ---------- */
const VIP_DAYS=7;
async function kvGet(env,k){const r=await env.DB.prepare("SELECT v FROM kv WHERE k=?").bind(k).first();try{return r?JSON.parse(r.v):null}catch(e){return null}}
async function kvSet(env,k,v){await env.DB.prepare("CREATE TABLE IF NOT EXISTS kv (k TEXT PRIMARY KEY, v TEXT)").run();await env.DB.prepare("INSERT INTO kv(k,v) VALUES(?,?) ON CONFLICT(k) DO UPDATE SET v=excluded.v").bind(k,JSON.stringify(v)).run()}
async function promo(env){try{return await cached("promo",5e3,()=>kvGet(env,"promo"))}catch(e){return null}}
async function promoCount(env,uid,P){return ((await env.DB.prepare("SELECT COUNT(*) AS n FROM users WHERE ref=? AND created>=? AND created<=?").bind(uid,P.start,P.end).first())||{}).n||0}
async function promoCheck(env,uid){const P=await kvGet(env,"promo"),now=Date.now();if(!P||now<P.start||now>P.end)return;
  if(await promoCount(env,uid,P)<P.need)return;
  const r=await env.DB.prepare("UPDATE users SET vip_until=MAX(vip_until,?) WHERE id=? AND vip_until<?").bind(now+VIP_DAYS*864e5,uid,P.start).run();
  if(r.meta.changes===1)topCache={};
  if(r.meta.changes===1)await notify(env,uid,"👑 Ты получил VIP на 7 дней!\n\n5 прокруток каждые 4 часа вместо 3, значок 👑 в топе и чате и золотое оформление. Спасибо, что зовёшь друзей!","👑 Открыть игру")}

/* ---------- ссылки с меткой для рекламы: t.me/VoinyEpohBot?startapp=s_<метка> ---------- */
const srcCode=start=>{const m=/^s_([A-Za-z0-9_-]{1,32})$/.exec(start||"");return m?m[1].toLowerCase():null};
const srcSeen=new Set();
async function trackSrc(env,me){const code=srcCode(me.start);if(!code)return;const k=code+":"+me.id;if(srcSeen.has(k))return;srcSeen.add(k);
  try{await env.DB.prepare("INSERT OR IGNORE INTO src_visits(code,uid,t) VALUES(?,?,?)").bind(code,me.id,Date.now()).run()}catch(e){}}
/* новый игрок. Приглашение (r_<id друга>) засчитывается только новому игроку и не самому себе */
/* ---------- статистика для администратора. Дни считаются по минскому времени (UTC+3) ---------- */
const TZ=3*3600e3,dayOf=t=>new Date(t+TZ).toISOString().slice(0,10),dayNum=t=>Math.floor((t+TZ)/864e5);
const bump=(env,k,day)=>env.DB.prepare("INSERT INTO stats(day,k,n) VALUES(?,?,1) ON CONFLICT(day,k) DO UPDATE SET n=n+1").bind(day||dayOf(Date.now()),k);
async function createUser(env,me){const st=freshState(),cash=st.cash,now=Date.now();delete st.cash;
  const m=/^r_(\d+)$/.exec(me.start||""),inviter=m&&+m[1]!==me.id?+m[1]:null;
  // во время челленджа: пригласившему ×2 прокрутки, новичку — гарантированная эпическая
  let x2=false;if(inviter)try{const C=await chalCfg(env);x2=!!C&&now>=C.start&&now<C.end}catch(e){}
  if(x2)st.guar=(st.guar||0)+1;
  const src=srcCode(me.start);
  const ins=await env.DB.prepare("INSERT OR IGNORE INTO users(id,name,cash,state,ver,created,updated,ref,src) VALUES(?,?,?,?,0,?,?,?,?)").bind(me.id,me.name,cash,JSON.stringify(st),now,now,inviter,src).run();
  if(inviter&&ins.meta.changes===1){await env.DB.prepare("UPDATE users SET refs=refs+1,gift_spins=gift_spins+? WHERE id=?").bind(x2?20:10,inviter).run();
    await promoCheck(env,inviter);
    // 15 друзей: первые трое получают по карточке «Основатель» из казны
    const iv=await env.DB.prepare("SELECT refs,founder FROM users WHERE id=?").bind(inviter).first();
    if(iv&&iv.refs>=FOUNDER_REFS&&!iv.founder){const c=await env.DB.prepare("SELECT id FROM cards WHERE owner=-1 AND f=5 ORDER BY id LIMIT 1").first();
      if(c){const t=await env.DB.prepare("UPDATE cards SET owner=? WHERE id=? AND owner=-1").bind(inviter,c.id).run();
        if(t.meta.changes===1)await env.DB.prepare("UPDATE users SET founder=? WHERE id=? AND founder=0").bind(c.id,inviter).run()}}}
  if(ins.meta.changes===1)try{await env.DB.batch([bump(env,"new"),...(inviter?[bump(env,"new_ref")]:[])])}catch(e){}
  return ins.meta.changes===1}
async function loadUser(env,me){
  let u=await env.DB.prepare("SELECT * FROM users WHERE id=?").bind(me.id).first();
  if(!u){await createUser(env,me);u=await env.DB.prepare("SELECT * FROM users WHERE id=?").bind(me.id).first()}
  const cards=(await env.DB.prepare("SELECT * FROM cards WHERE owner=?").bind(me.id).all()).results.map(rowToCard);
  return {u,cards};
}
/* Тираж считается по картам, которые сейчас в игре. Проданные системе карточки удаляются,
   поэтому их номер и место в тираже (например, золотая 3/10) снова могут выпасть. */
async function makeCtx(env,test){
  const cnt={},max={},gaps={},taken=new Set();let seq=0;
  // только ограниченные отделки (f>0): индекс cards_fhn читает лишь их, а не все карточки игры
  const cerr=new Set();
  for(const r of (await env.DB.prepare("SELECT h,f,part,COUNT(*) AS n,MAX(no) AS m FROM cards WHERE f>0 GROUP BY f,h,part").all()).results){
    if(isComp(r.h)&&r.f===4){cerr.add(r.h+"-"+(r.part||0));continue}   // «ошибки» составных воинов: по одной на часть
    const k=r.h+"-"+r.f;cnt[k]=(cnt[k]||0)+r.n;max[k]=Math.max(max[k]||0,r.m);
    if(r.f>0&&r.m>=FIN[r.f].run&&r.n<FIN[r.f].run){   // тираж был выпущен целиком, но часть вернулась: ищем свободные места
      const used=new Set((await env.DB.prepare("SELECT no FROM cards WHERE h=? AND f=?").bind(r.h,r.f).all()).results.map(x=>x.no));
      gaps[k]=[];for(let i=1;i<=FIN[r.f].run;i++)if(!used.has(i))gaps[k].push(i)}}
  const nice=new Set((await env.DB.prepare("SELECT sn FROM cards WHERE nice>=1").all()).results.map(r=>r.sn));
  // места тиража составных воинов (1..300): их занимают правые половинки и собранные карточки
  const slots={},usedS={};for(const h of COMP)usedS[h]=new Set();
  for(const r of (await env.DB.prepare("SELECT h,no FROM cards WHERE f=0 AND h>=? AND no<=?").bind(NBASE,HALF_RUN).all()).results)if(usedS[r.h])usedS[r.h].add(r.no);
  for(const h of COMP){slots[h]=[];for(let i=1;i<=HALF_RUN;i++)if(!usedS[h].has(i))slots[h].push(i)}
  return {now:Date.now(),test,events:[],
    compLeft:h=>slots[h].length,compSlot:h=>slots[h].length?slots[h].shift():0,
    compErr:(h,part)=>cerr.has(h+"-"+part),compErrTake:(h,part)=>cerr.add(h+"-"+part),
    issuedOf:(h,f)=>FIN[f].run===Infinity?(max[h+"-"+f]||0):(cnt[h+"-"+f]||0),
    nextNo:(h,f)=>{if(FIN[f].run===Infinity)return 1e6+Math.floor(Math.random()*2e9);   // у обычных номер в тираже не показывается: случайный, повтор отсечёт UNIQUE
      const k=h+"-"+f;cnt[k]=(cnt[k]||0)+1;if(gaps[k]&&gaps[k].length)return gaps[k].shift();return max[k]=(max[k]||0)+1},
    snFree:s=>!nice.has(s)&&!taken.has(s),takeSn:s=>taken.add(s),newId:()=>"n"+(++seq)};
}
/* администраторы игры (id в Telegram). Можно задать и переменной ADMINS="id1,id2" в настройках воркера */
const ADMINS=[6724818967];
const isAdmin=(env,id)=>ADMINS.includes(id)||String(env.ADMINS||"").split(",").map(Number).includes(id);
/* первопроходцы: первые 100 игроков, открывших игру, получают номер, +20 прокруток и рамку «Первопроходец» */
let pioneersFull=false;   // когда все 100 мест заняты, базу больше не спрашиваем
async function pioneersCount(env){if(pioneersFull)return PIONEERS;const n=((await env.DB.prepare("SELECT COUNT(*) AS n FROM users WHERE pioneer>0").first())||{}).n||0;if(n>=PIONEERS)pioneersFull=true;return n}
async function stateFor(env,me){
  let {u,cards}=await loadUser(env,me),pioneerNew=false;
  if(!u.pioneer&&await pioneersCount(env)<PIONEERS){
    try{const r=await env.DB.prepare("UPDATE users SET pioneer=(SELECT COALESCE(MAX(pioneer),0)+1 FROM users),gift_spins=gift_spins+? WHERE id=? AND pioneer=0 AND (SELECT COUNT(*) FROM users WHERE pioneer>0)<?").bind(PIONEER_SPINS,me.id,PIONEERS).run();
      if(r.meta.changes===1){pioneerNew=true;u=await env.DB.prepare("SELECT * FROM users WHERE id=?").bind(me.id).first()}}catch(e){}   // одновременно с кем-то: получит номер при следующем запросе
  }
  const prints=await cached("prints",30e3,async()=>{const o={};for(const r of (await env.DB.prepare("SELECT h,f,COUNT(*) AS m FROM cards WHERE (f>0 OR h>=26) AND owner<>-1 GROUP BY f,h").all()).results)o[r.h+"-"+r.f]=r.m;return o});
  const news=(await env.DB.prepare("SELECT h,buyer_name AS buyer,price,got FROM sales WHERE seller=? AND seen=0").bind(me.id).all()).results;
  if(news.length)await env.DB.prepare("UPDATE sales SET seen=1 WHERE seller=? AND seen=0").bind(me.id).run();
  const S=Object.assign(JSON.parse(u.state||"{}"),{cash:u.cash,cards,prints,news,uid:me.id,name:u.nick||u.name,nick:u.nick||null,test:env.TEST==="1",refs:u.refs||0,admin:isAdmin(env,me.id),stake:u.stake?1:0,champion:await cached("champ",30e3,async()=>{const c=await kvGet(env,"champion");return c&&c.until>Date.now()?c:null}),vipUntil:u.vip_until||0,pm:(u.pm||me.pm)?1:0,pioneer:u.pioneer||0,pioneerNew,founder:u.founder||0,founderNew:!!(u.founder&&!u.founder_seen),foundersLeft:await cached("founders",10e3,async()=>((await env.DB.prepare("SELECT COUNT(*) AS n FROM cards WHERE owner=-1 AND f=5").first())||{}).n||0),pioneersLeft:Math.max(0,PIONEERS-await pioneersCount(env))});
  S.spins=(S.spins??0)+(u.gift_spins||0);
  Object.assign(S,await nickFx(env));S.shopOn=1;   // переливающиеся ники и «Король Эпох» месяца
  if(u.founder&&!u.founder_seen){await env.DB.prepare("UPDATE users SET founder_seen=1 WHERE id=?").bind(me.id).run();delete topCache.founders}
  // кто нападал на мои карточки за 3 дня: для уведомлений и реванша
  S.fights=(await env.DB.prepare("SELECT id,att_name,att_card,att_h,def_h,w,l,t,seen,stake,took FROM fights WHERE def=? AND t>? ORDER BY id DESC LIMIT 6").bind(me.id,Date.now()-3*864e5).all()).results;
  if(S.fights.some(f=>!f.seen))await env.DB.prepare("UPDATE fights SET seen=1 WHERE def=? AND seen=0").bind(me.id).run();
  S.chatLast=await cached("chatlast",5e3,async()=>((await env.DB.prepare("SELECT MAX(id) AS m FROM chat").first())||{}).m||0);
  const P=await promo(env);if(P&&Date.now()<=P.end&&Date.now()>=P.start)S.promo={end:P.end,need:P.need,have:await promoCount(env,me.id,P)};
  touch(S,Date.now());
  // бот может писать игроку: Telegram сообщает это в данных входа
  if(me.pm&&!u.pm)try{await env.DB.prepare("UPDATE users SET pm=1 WHERE id=?").bind(me.id).run()}catch(e){}
  // когда игрок заходил: активные за день, возврат на второй день
  const now=Date.now();
  if(dayNum(u.seen||0)!==dayNum(now)||now-(u.seen||0)>5*60e3){const nd=dayNum(u.seen||0)!==dayNum(now),cd=dayNum(u.created||now),td=dayNum(now);
    const q=[env.DB.prepare("UPDATE users SET seen=?,back=MAX(back,?),d1=MAX(d1,?) WHERE id=?").bind(now,td>cd?1:0,td===cd+1?1:0,me.id)];
    if(nd)q.push(bump(env,"dau"));try{await env.DB.batch(q)}catch(e){}}
  // числа для мирового топа: обновляем, только если изменились
  const worth=Math.round(cards.reduce((a,c)=>a+c.v,0)*100)/100,album=new Set(cards.filter(c=>c.h<NBASE).map(c=>c.h)).size,wins=S.totalWins||0;
  if(Math.abs((u.worth||0)-worth)>.004||(u.album||0)!==album||(u.wins||0)!==wins)
    await env.DB.prepare("UPDATE users SET worth=?,album=?,wins=? WHERE id=?").bind(worth,album,wins,me.id).run();
  return S;
}
/* новые карточки получают номер в базе только при записи: подставляем его в ответ */
function fixIds(o,cards,seen=new Set()){if(!o||typeof o!=="object"||seen.has(o))return;seen.add(o);
  if(typeof o.id==="string"&&o.id[0]==="n"&&o.sn){const c=cards.find(x=>x.sn===o.sn);if(c)o.id=c.id}
  for(const k in o)fixIds(o[k],cards,seen)}

/* ---------- обычное действие: правила считают, сервер записывает всё одной пачкой ---------- */
async function doAction(env,me,name,p,extra){
  for(let attempt=0;attempt<8;attempt++){
    if(attempt)await new Promise(r=>setTimeout(r,Math.random()*40*attempt));  // кто-то менял игрока одновременно: ждём и пробуем снова
    const {u,cards}=await loadUser(env,me),ctx=await makeCtx(env,env.TEST==="1");
    const st=JSON.parse(u.state||"{}");st.cash=u.cash;if(extra)Object.assign(ctx,extra);
    st.vipUntil=u.vip_until||0;ctx.admin=isAdmin(env,me.id);ctx.noRare=env.NO_RARE==="1";ctx.luck=ctx.admin&&(st.luckUntil||0)>ctx.now;ctx.pioneer=!!u.pioneer;
    const gift=u.gift_spins||0;st.spins=(st.spins??0)+gift;   // прокрутки за приглашённых друзей
    const before=new Map(cards.map(c=>[c.id,JSON.stringify(c)]));
    const out=runAction(name,st,cards.map(c=>JSON.parse(JSON.stringify(c))),ctx,p);
    const delta=Math.round((st.cash-u.cash)*100)/100;delete st.cash;
    // новая версия случайная: проверка ниже пропустит записи, только если именно этот запрос обновил игрока
    const nv=Math.floor(Math.random()*9e15)+1,guard="(SELECT ver FROM users WHERE id=?)=?",keep=new Set();
    // бой на карточку с игроком: сначала карточка соперника переходит ко мне, и только если это удалось, записывается всё остальное
    const take=ctx.takeCard?env.DB.prepare("UPDATE cards SET owner=? WHERE id=? AND owner=? AND list_price IS NULL AND away=0 AND room_id IS NULL").bind(me.id,ctx.takeCard,ctx.oppUid):null;
    const own=take?" AND (SELECT owner FROM cards WHERE id="+Math.floor(+ctx.takeCard)+")="+Math.floor(+me.id):"";   // id в Telegram больше 32 бит: без |0
    const stm=[env.DB.prepare("UPDATE users SET state=?,cash=cash+?,gift_spins=gift_spins-?,ver=?,name=?,updated=?,refill_at=?,camp_at=?,camp_dk=?,camp_dr=?,camp_wk=?,camp_wr=? WHERE id=? AND ver=?"+own).bind(JSON.stringify(st),delta,gift,nv,me.name,ctx.now,st.refillAt||0,(st.camp&&st.camp.fullAt)||0,(st.camp&&st.camp.dK)||null,(st.camp&&st.camp.dR)||0,(st.camp&&st.camp.wK)||null,(st.camp&&st.camp.wR)||0,me.id,u.ver)];
    const ins=[];   // новые карточки пишутся после удалений: собранный воин забирает номер и место тиража правой половинки
    for(const c of out.cards){
      if(typeof c.id==="string"){ins.push(env.DB.prepare(`INSERT INTO cards(owner,h,f,no,sn,nice,hue,v,stats,xp,wins,stars,frame,away,dest,created,part,how) SELECT ?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,? WHERE ${guard}`)
        .bind(me.id,c.h,c.f,c.no,c.sn,c.cust?2:classify(c.sn)?1:0,c.hue,c.v,JSON.stringify(c.stats),c.xp|0,c.wins|0,c.stars|0,c.frame||null,c.away||0,c.dest??null,ctx.now,c.part|0,c.how||null,me.id,nv));continue}
      keep.add(c.id);
      if(before.get(c.id)!==JSON.stringify(c))stm.push(env.DB.prepare(`UPDATE cards SET xp=?,wins=?,stars=?,v=?,frame=?,away=?,dest=? WHERE id=? AND owner=? AND ${guard}`)
        .bind(c.xp|0,c.wins|0,c.stars|0,c.v,c.frame||null,c.away||0,c.dest??null,c.id,me.id,me.id,nv));
    }
    stm.push(env.DB.prepare(`INSERT INTO stats(day,k,n) SELECT ?,?,1 WHERE ${guard} ON CONFLICT(day,k) DO UPDATE SET n=n+1`).bind(dayOf(ctx.now),"a_"+name,me.id,nv));
    for(const id of before.keys())if(!keep.has(id)){
      if(id===ctx.giveAway)stm.push(env.DB.prepare(`UPDATE cards SET owner=? WHERE id=? AND owner=? AND list_price IS NULL AND ${guard}`).bind(ctx.oppUid,id,me.id,me.id,nv));   // проиграл игроку: карточка уходит к нему
      else stm.push(env.DB.prepare(`DELETE FROM cards WHERE id=? AND owner=? AND list_price IS NULL AND room_id IS NULL AND ${guard}`).bind(id,me.id,me.id,nv))}
    stm.push(...ins);
    if(take)stm.unshift(take);
    let rs;try{rs=await env.DB.batch(stm)}catch(e){if(/UNIQUE/i.test(String(e&&e.message||e)))continue;throw e}
    if(take&&rs[0].meta.changes!==1)fail("Соперник только что убрал эту карточку. Бой отменён, попробуй ещё раз");
    if(rs[take?1:0].meta.changes!==1){if(take)await env.DB.prepare("UPDATE cards SET owner=? WHERE id=? AND owner=?").bind(ctx.oppUid,ctx.takeCard,me.id).run();continue}
    if(out.cards.some(c=>typeof c.id==="string"&&(c.f>0||HEROES[c.h][2]>=3))||before.size!==keep.size)delete topCache.prints;   // тираж изменился
    const S=await stateFor(env,me);fixIds(out.res,S.cards);out.res.events=ctx.events;return {S,res:out.res};
  }
  throw new GameError("Сервер занят, попробуй ещё раз");
}

/* ---------- рынок: настоящие игроки ---------- */
async function market(env,me){
  const rows=(await env.DB.prepare("SELECT c.*,COALESCE(u.nick,u.name) AS seller_name FROM cards c JOIN users u ON u.id=c.owner WHERE c.list_price IS NOT NULL AND c.owner<>? ORDER BY c.listed_at DESC LIMIT 60").bind(me.id).all()).results;
  return {items:rows.map(r=>({id:r.id,card:pub(rowToCard(r)),price:r.list_price,seller:r.seller_name||"Игрок"}))};
}
async function list(env,me,p){
  const price=Math.round(+p.price||0);if(!(price>=1&&price<=1e11))fail("Цена от $1 до $100 000 000 000");
  const r=await env.DB.prepare("UPDATE cards SET list_price=?,listed_at=? WHERE id=? AND owner=? AND list_price IS NULL AND away=0 AND room_id IS NULL AND (SELECT COUNT(*) FROM cards WHERE owner=? AND list_price IS NOT NULL)<?")
    .bind(price,Date.now(),p.id|0,me.id,me.id,MAX_LOTS).run();
  if(r.meta.changes!==1)fail("Карточку нельзя выставить: она в походе, уже на рынке или у тебя уже "+MAX_LOTS+" лотов");
  return {price};
}
async function unlist(env,me,p){
  const r=await env.DB.prepare("UPDATE cards SET list_price=NULL,listed_at=NULL WHERE id=? AND owner=? AND list_price IS NOT NULL").bind(p.id|0,me.id).run();
  if(r.meta.changes!==1)fail("Лот не найден");return {};
}
async function buy(env,me,p){
  const c=await env.DB.prepare("SELECT * FROM cards WHERE id=? AND list_price IS NOT NULL").bind(p.id|0).first();
  if(!c)fail("Этот лот уже купили или сняли");if(c.owner===me.id)fail("Это твой лот");
  if(Math.abs(c.list_price-(+p.price||0))>.001)fail("Продавец изменил цену, обнови рынок");
  const have=await env.DB.prepare("SELECT COUNT(*) AS n FROM cards WHERE owner=?").bind(me.id).first();if(have.n>=CAP)fail("Коллекция заполнена");
  const {u:bu}=await loadUser(env,me);
  const price=c.list_price,seller=c.owner;
  const take=await env.DB.prepare("UPDATE cards SET owner=?,list_price=NULL,listed_at=NULL WHERE id=? AND owner=? AND list_price=?").bind(me.id,c.id,seller,price).run();
  if(take.meta.changes!==1)fail("Этот лот уже купили");
  const payR=await env.DB.prepare("UPDATE users SET cash=cash-? WHERE id=? AND cash>=?").bind(price,me.id,price).run();
  if(payR.meta.changes!==1){await env.DB.prepare("UPDATE cards SET owner=?,list_price=?,listed_at=? WHERE id=? AND owner=?").bind(seller,price,Date.now(),c.id,me.id).run();fail("Не хватает денег")}
  const got=Math.round(price*(1-FEE)*100)/100;
  if(price>=DTOP_MIN_PRICE){await dtopAdd(env,"trade",me.id,1);await dtopAdd(env,"trade",seller,1)}
  await env.DB.batch([env.DB.prepare("UPDATE users SET cash=cash+? WHERE id=?").bind(got,seller),
    env.DB.prepare("INSERT INTO sales(card,h,seller,buyer,buyer_name,price,got,t) VALUES(?,?,?,?,?,?,?,?)").bind(c.id,c.h,seller,me.id,bu.nick||me.name,price,got,Date.now())]);
  await notify(env,seller,"💰 "+(bu.nick||me.name)+" купил твою карточку «"+HEROES[c.h][0]+"» за $"+fmtD(price)+". Тебе зачислено $"+fmtD(got)+" (минус 5% рынка)","Открыть игру");
  return {card:pub(rowToCard(Object.assign(c,{owner:me.id,list_price:null})))};
}

/* ---------- друзья ---------- */
async function profile(env,p){
  const u=await env.DB.prepare("SELECT id,COALESCE(nick,name) AS name,state,pioneer,vip_until FROM users WHERE id=?").bind(Math.floor(+p.uid||0)).first();if(!u)fail("Игрок не найден");
  const cards=(await env.DB.prepare("SELECT * FROM cards WHERE owner=? ORDER BY v DESC LIMIT 3").bind(u.id).all()).results.map(r=>pub(rowToCard(r)));
  const have=await env.DB.prepare("SELECT COUNT(DISTINCT h) AS n FROM cards WHERE owner=?").bind(u.id).first();
  return {name:u.name||"Игрок",pi:u.pioneer||0,vip:(u.vip_until||0)>Date.now()?1:0,wins:(JSON.parse(u.state||"{}").totalWins)||0,have:have.n,cards,uid:u.id};
}
async function cardInfo(env,p){
  const r=await env.DB.prepare("SELECT c.*,COALESCE(u.nick,u.name) AS owner_name FROM cards c JOIN users u ON u.id=c.owner WHERE c.id=? AND c.owner>0").bind(p.id|0).first();
  if(!r)fail("Этой карточки больше нет в игре");return {card:pub(rowToCard(r)),name:r.owner_name||"Игрок",owner:r.owner};
}

/* ---------- мировой топ и лента выпадений ----------
   Списки общие для всех, поэтому держим их в памяти воркера 60 секунд, чтобы не нагружать базу. */
const BOARDS={worth:"worth",album:"album",wins:"wins"};
let topCache={};
async function cached(key,ms,fn){const c=topCache[key];if(c&&Date.now()-c.t<ms)return c.v;const v=await fn();topCache[key]={t:Date.now(),v};return v}
async function top(env,me,p){
  const S=await stateFor(env,me);   // заодно обновляет мои числа
  const kind=p.kind;
  if(kind==="cards"){
    const items=await cached("cards",60e3,async()=>(await env.DB.prepare("SELECT c.*,COALESCE(u.nick,u.name) AS owner_name,u.pioneer AS pi,u.vip_until AS vu FROM cards c JOIN users u ON u.id=c.owner WHERE c.owner>0 ORDER BY c.v DESC LIMIT 30").all()).results
      .map(r=>({uid:r.owner,name:r.owner_name||"Игрок",pi:r.pi||0,vip:(r.vu||0)>Date.now()?1:0,card:pub(rowToCard(r)),score:r.v})));
    return {res:{kind,items},S};
  }
  if(kind==="feed"){
    const big=HEROES.map((H,i)=>H[2]>=3?i:-1).filter(i=>i>=0).join(",");
    const items=await cached("feed",20e3,async()=>(await env.DB.prepare(`SELECT c.*,COALESCE(u.nick,u.name) AS owner_name FROM cards c JOIN users u ON u.id=c.owner WHERE c.owner>0 AND (c.f>=2 OR c.nice=1 OR c.h IN (${big})) ORDER BY c.id DESC LIMIT 20`).all()).results
      .map(r=>({uid:r.owner,name:r.owner_name||"Игрок",card:pub(rowToCard(r)),t:r.created,how:r.how||null})));
    return {res:{kind,items},S};
  }
  const col=BOARDS[kind];if(!col)fail("Нет такого рейтинга");
  const items=await cached(kind,60e3,async()=>{
    const rows=(await env.DB.prepare(`SELECT id,COALESCE(nick,name) AS name,pioneer AS pi,vip_until AS vu,${col} AS score FROM users WHERE ${col}>0 ORDER BY ${col} DESC LIMIT 50`).all()).results;
    const out=[];for(const r of rows){const b=await env.DB.prepare("SELECT * FROM cards WHERE owner=? ORDER BY v DESC LIMIT 1").bind(r.id).first();
      out.push({uid:r.id,name:r.name||"Игрок",pi:r.pi||0,vip:(r.vu||0)>Date.now()?1:0,score:r.score,card:b?pub(rowToCard(b)):null})}return out});
  const mine=await env.DB.prepare(`SELECT ${col} AS score FROM users WHERE id=?`).bind(me.id).first();
  const score=mine?mine.score:0;
  const rank=score>0?(await env.DB.prepare(`SELECT COUNT(*)+1 AS n FROM users WHERE ${col}>?`).bind(score).first()).n:null;
  return {res:{kind,items,me:{rank,score}},S};
}

/* ---------- ник: уникальный на всю игру. Большие и маленькие буквы, ё и е считаются одинаковыми ---------- */
const nickKey=n=>n.toLowerCase().replace(/ё/g,"е");
async function setNick(env,me,p){
  const n=checkNick(p.nick),{u}=await loadUser(env,me);
  if(u.nick===n)fail("Это уже твой ник");
  const cost=u.nick?NICK_COST:0;
  let r;try{r=await env.DB.prepare("UPDATE users SET nick=?,nick_key=?,cash=cash-? WHERE id=? AND cash>=?").bind(n,nickKey(n),cost,me.id,cost).run()}
  catch(e){if(/UNIQUE/i.test(String(e&&e.message||e)))fail("Ник «"+n+"» уже занят. Придумай другой");throw e}
  if(r.meta.changes!==1)fail("Смена ника стоит $"+cost+", не хватает денег");
  topCache={};return {nick:n,cost};
}

async function adminStats(env){
  const now=Date.now(),t0=(dayNum(now))*864e5-TZ,D=864e5,one=async(q,...a)=>(await env.DB.prepare(q).bind(...a).first())||{};
  const tot=await one("SELECT COUNT(*) AS n,SUM(ref IS NOT NULL) AS r,SUM(nick IS NOT NULL) AS nk FROM users");
  const nw=await one("SELECT SUM(created>=?) AS d0,SUM(created>=? AND created<?) AS d1,SUM(created>=?) AS w,SUM(created>=? AND ref IS NOT NULL) AS r0 FROM users WHERE created>=?",t0,t0-D,t0,t0-6*D,t0,t0-6*D);
  const act=await one("SELECT SUM(seen>=?) AS d0,SUM(seen>=?) AS w FROM users WHERE seen>=?",t0,t0-6*D,t0-6*D);
  // возврат на второй день: игроки, пришедшие с 8 по 1 день назад (у них второй день уже прошёл)
  const ret=await one("SELECT COUNT(*) AS n,SUM(d1) AS d1,SUM(back) AS b FROM users WHERE created>=? AND created<?",t0-8*D,t0-D);
  const days=[];for(let i=13;i>=0;i--)days.push(dayOf(now-i*D));
  const rows=(await env.DB.prepare(`SELECT day,k,n FROM stats WHERE day>=?`).bind(days[0]).all()).results;
  const by={};rows.forEach(r=>{(by[r.day]=by[r.day]||{})[r.k]=r.n});
  const sales=await one("SELECT COUNT(*) AS n,SUM(price) AS v FROM sales WHERE t>=?",t0);
  const cards=await one("SELECT COUNT(*) AS n FROM cards");
  const inv=(await env.DB.prepare("SELECT COALESCE(nick,name) AS name,refs FROM users WHERE refs>0 ORDER BY refs DESC LIMIT 5").all()).results;
  const T=by[days[13]]||{};
  let srcs=[];try{srcs=(await env.DB.prepare("SELECT v.code,COUNT(*) AS visits,SUM(u.src=v.code) AS fresh,SUM(u.src=v.code AND u.album>=3) AS act,SUM(u.src=v.code AND u.back=1) AS back FROM src_visits v LEFT JOIN users u ON u.id=v.uid GROUP BY v.code ORDER BY visits DESC LIMIT 40").all()).results}catch(e){}
  return {srcs,players:tot.n||0,fromRef:tot.r||0,withNick:tot.nk||0,newToday:nw.d0||0,newYesterday:nw.d1||0,newWeek:nw.w||0,newRefToday:nw.r0||0,
    activeToday:act.d0||0,activeWeek:act.w||0,cohort:ret.n||0,d1:ret.d1||0,back:ret.b||0,
    today:{open:T.a_open||0,craft:T.a_craft||0,duel:(T.a_duel||0)+(T.a_fduel||0),boss:T.a_boss_hit||0,forge:T.a_forge||0,story:T.a_story||0,sales:sales.n||0,salesV:Math.round(sales.v||0)},
    cardsInGame:cards.n||0,inviters:inv,days:days.map(d=>({d,n:(by[d]||{}).new||0,a:(by[d]||{}).dau||0,o:(by[d]||{}).a_open||0}))};
}

/* ---------- бои с настоящими игроками ---------- */
/* «на интерес»: любая карточка похожей редкости.
   «на карточку»: только у игроков, которые сами включили бои на карточку, цена от 0,5× до 2× моей, и у соперника есть место в коллекции */
async function pickOpponent(env,me,p,stake){
  const row=async(sql,...a)=>env.DB.prepare(sql).bind(...a).first();
  const mine=await row("SELECT h,v FROM cards WHERE id=? AND owner=?",p.id|0,me.id);if(!mine)return null;
  let SEL="SELECT c.*,COALESCE(u.nick,u.name) AS owner_name FROM cards c JOIN users u ON u.id=c.owner WHERE c.owner>0 AND c.owner<>? AND c.list_price IS NULL AND c.away=0 AND c.room_id IS NULL AND c.f<>5 AND c.part=0";   // «Основатель» в боях не участвует
  const args=[me.id];
  if(stake){SEL+=" AND u.stake=1 AND c.v BETWEEN ? AND ? AND (SELECT COUNT(*) FROM cards x WHERE x.owner=c.owner)<?";args.push(mine.v*.5,mine.v*2,CAP)}
  let r=null;
  if(p.rematch)r=await row(SEL+" AND c.id=?",...args,p.rematch|0);
  if(!r){if(!stake&&Math.random()<.2)return null;   // иногда всё равно бот, чтобы соперники были разными
    const t=HEROES[mine.h][2],hs=stake?HEROES.map((H,i)=>i).join(","):HEROES.map((H,i)=>Math.abs(H[2]-t)<=1?i:-1).filter(i=>i>=0).join(",");
    const mm=await cached("cardids",60e3,async()=>(await env.DB.prepare("SELECT MIN(id) AS a,MAX(id) AS b FROM cards").first())||{});
    const start=Math.floor((mm.a||0)+Math.random()*((mm.b||0)-(mm.a||0)+1));
    r=await row(SEL+` AND c.h IN (${hs}) AND c.id>=? ORDER BY c.id LIMIT 1`,...args,start)||await row(SEL+` AND c.h IN (${hs}) AND c.id<? ORDER BY c.id DESC LIMIT 1`,...args,start)}
  if(!r)return null;
  return {card:pub(rowToCard(r)),name:r.owner_name||"Игрок",owner:r.owner};
}
async function logFight(env,me,myCardId,opp,res,stake){
  try{const u=await env.DB.prepare("SELECT COALESCE(nick,name) AS n FROM users WHERE id=?").bind(me.id).first();
    await env.DB.prepare("INSERT INTO fights(att,att_name,att_card,att_h,def,def_card,def_h,w,l,t,stake,took) VALUES(?,?,?,?,?,?,?,?,?,?,?,?)")
      .bind(me.id,(u&&u.n)||me.name,myCardId|0,res.me.h,opp.owner,opp.card.id,opp.card.h,res.w,res.l,Date.now(),stake?1:0,(res.gotCard||res.lostCard)?1:0).run();
    // защитнику: не чаще раза в 30 минут, чтобы не заспамить
    const d=await env.DB.prepare("UPDATE users SET att_note=? WHERE id=? AND pm=1 AND att_note<?").bind(Date.now(),opp.owner,Date.now()-30*60e3).run();
    if(d.meta.changes===1){const H=HEROES[opp.card.h][0],att=(u&&u.n)||me.name,took=stake&&(res.gotCard||res.lostCard);
      const txt=res.w>res.l?(took?"⚔️ "+att+" победил твоего воина «"+H+"» в бою на карточку и забрал его!":"⚔️ "+att+" напал на твоего воина «"+H+"» и победил "+res.w+":"+res.l+"!")
        :res.w<res.l?(took?"🛡 Твой «"+H+"» отбился от "+att+" и забрал его карточку!":"🛡 Твой «"+H+"» отбился от "+att+" "+res.l+":"+res.w+"!"):"⚔️ Ничья с "+att+": твой «"+H+"» устоял";
      await notify(env,opp.owner,txt+"\n\nОтветь реваншем 👇","⚔️ Реванш",PAGE+"?startapp=c_"+(myCardId|0))}
  }catch(e){console.error("fight",e)}
}

/* ---------- общий чат ----------
   Писать можно только с ником. Ссылки запрещены, мат закрывается звёздочками, не чаще раза в 3 секунды. */
const CHAT_BAD=/(?<![а-яёa-z])(х[уy][йеёяию]\S*|п[иi]зд\S*|[её]б[аеуы]\S*|бля\S*|сук[аи]\S*|муд[ао]\S*|пид[оа]р\S*|гандон\S*|шлюх\S*|залуп\S*|fuck\S*|shit\S*|bitch\S*)/gi;
const CHAT_LINK=/(https?:\/\/|www\.|t\.me\/|telegram\.(me|dog)|\.(ru|com|net|org|me|io|gg|xyz|su|by|ua|info|site|online)\b)/i;
async function chatGet(env,p){
  const rows=(await env.DB.prepare("SELECT c.id,c.uid,c.name,c.text,c.t,COALESCE(u.pioneer,0) AS pi,CASE WHEN u.vip_until>? THEN 1 ELSE 0 END AS vip FROM chat c LEFT JOIN users u ON u.id=c.uid WHERE c.id>? ORDER BY c.id DESC LIMIT 60").bind(Date.now(),p.after|0).all()).results.reverse();
  return {items:rows.map(r=>Object.assign(r,{a:isAdmin(env,r.uid)?1:0}))};
}
async function chatSend(env,me,p){
  const {u}=await loadUser(env,me);
  if(!u.nick)fail("Чтобы писать в чат, выбери ник во вкладке «Топ»");
  if((u.muted||0)>Date.now())fail("Тебе запрещено писать в чат ещё "+Math.ceil((u.muted-Date.now())/36e5)+" ч");
  let t=String(p.text||"").replace(/\s+/g," ").trim();
  if(!t)fail("Пустое сообщение");if(t.length>200)fail("Не длиннее 200 символов");
  if(CHAT_LINK.test(t))fail("Ссылки в чате запрещены");
  t=t.replace(CHAT_BAD,m=>"*".repeat(m.length));
  const last=await env.DB.prepare("SELECT t FROM chat WHERE uid=? ORDER BY id DESC LIMIT 1").bind(me.id).first();
  if(last&&Date.now()-last.t<3000)fail("Не так быстро");
  await env.DB.prepare("INSERT INTO chat(uid,name,text,t) VALUES(?,?,?,?)").bind(me.id,u.nick,t,Date.now()).run();
  delete topCache.chatlast;
  if(Math.random()<.05)await env.DB.prepare("DELETE FROM chat WHERE id<(SELECT MAX(id)-500 FROM chat)").run();
  return chatGet(env,p);
}
async function chatAdmin(env,me,a,p){
  if(!isAdmin(env,me.id))fail("Нет доступа");
  if(a==="chat_del"){await env.DB.prepare("DELETE FROM chat WHERE id=?").bind(p.id|0).run();return {}}
  const h=Math.max(0,Math.min(24*30,+p.hours||24));
  await env.DB.prepare("UPDATE users SET muted=? WHERE id=?").bind(h?Date.now()+h*36e5:0,Math.floor(+p.uid||0)).run();
  if(h)await env.DB.prepare("DELETE FROM chat WHERE uid=?").bind(Math.floor(+p.uid||0)).run();
  return {};
}

/* ---------- арена: живые бои игрок против игрока ----------
   Оба игрока (и зрители) раз в секунду спрашивают состояние комнаты. Сервер сам двигает фазы по времени:
   open → p0 (выбирает создатель) → s0 (показ раунда 1) → p1 (выбирает соперник) → s1 → s2 (случайный раунд) → done.
   Не выбрал за 20 секунд — выбор делается автоматически, поэтому бой всегда доходит до конца. */
const PICK_MS=20e3, FIRST_PICK_MS=30e3, SHOW_MS=4200, OPEN_MS=15*60e3, LIVE=["p0","s0","p1","s1","s2"];
const rj=(s,d)=>{try{return JSON.parse(s)}catch(e){return d}};
async function nameOf(env,uid){const u=await env.DB.prepare("SELECT COALESCE(nick,name) AS n FROM users WHERE id=?").bind(uid).first();return (u&&u.n)||"Игрок"}
async function roomSave(env,r,patch){const keys=Object.keys(patch);
  const q=await env.DB.prepare(`UPDATE rooms SET ${keys.map(k=>k+"=?").join(",")},ver=ver+1,updated=? WHERE id=? AND ver=?`).bind(...keys.map(k=>patch[k]),Date.now(),r.id,r.ver).run();
  return q.meta.changes===1}
const roundOf=(r,s)=>{const hc=rj(r.hc),gc=rj(r.gc);return {s,h:eff(hc,s),g:eff(gc,s)}};
async function roomAdvance(env,r){
  for(let i=0;i<8&&r;i++){const now=Date.now(),picks=rj(r.picks,[]),rounds=rj(r.rounds,[]);let patch=null;
    if(r.phase==="open"&&now-r.created>OPEN_MS)patch={phase:"cancel"};
    else if(r.phase==="p0"&&now>r.until){const s=aiPick(rj(r.hc),[]);patch={picks:JSON.stringify([s]),rounds:JSON.stringify([roundOf(r,s)]),phase:"s0",until:now+SHOW_MS}}
    else if(r.phase==="s0"&&now>r.until)patch={phase:"p1",until:now+PICK_MS};
    else if(r.phase==="p1"&&now>r.until){const s=aiPick(rj(r.gc),picks);patch={picks:JSON.stringify([...picks,s]),rounds:JSON.stringify([...rounds,roundOf(r,s)]),phase:"s1",until:now+SHOW_MS}}
    else if(r.phase==="s1"&&now>r.until){const s=rndPick(picks);patch={picks:JSON.stringify([...picks,s]),rounds:JSON.stringify([...rounds,roundOf(r,s)]),phase:"s2",until:now+SHOW_MS+800}}
    else if(r.phase==="s2"&&now>r.until)patch={phase:"done"};
    if(!patch)break;
    await roomSave(env,r,patch);r=await env.DB.prepare("SELECT * FROM rooms WHERE id=?").bind(r.id).first()}
  if(r&&(r.phase==="done"||r.phase==="cancel")&&!r.applied)await roomFinish(env,r);
  return r}
/* итог применяется ровно один раз */
async function roomFinish(env,r){
  const t=await env.DB.prepare("UPDATE rooms SET applied=1 WHERE id=? AND applied=0").bind(r.id).run();if(t.meta.changes!==1)return;
  await env.DB.prepare("UPDATE cards SET room_id=NULL WHERE room_id=?").bind(r.id).run();
  if(r.phase!=="done")return;
  const rounds=rj(r.rounds,[]),w=rounds.filter(x=>x.h>x.g).length,l=rounds.filter(x=>x.g>x.h).length;
  const hc=rj(r.hc),gc=rj(r.gc);let hres="d",gres="d";if(w>l){hres="w";gres="l"}else if(l>w){hres="l";gres="w"}
  if(r.mode&&w!==l){const win=w>l?r.host:r.guest,lose=w>l?r.guest:r.host,card=w>l?gc.id:hc.id;
    await env.DB.prepare("UPDATE cards SET owner=? WHERE id=? AND owner=? AND list_price IS NULL").bind(win,card,lose).run()}
  for(const [uid,id,res] of [[r.host,hc.id,hres],[r.guest,gc.id,gres]])
    try{await doAction(env,{id:uid,name:await nameOf(env,uid)},"pvp_result",{id,res},{pvp:true});dtopLast.delete(uid);await dtopAdd(env,"fight",uid,1)}catch(e){console.error("pvp_result",e)}
  topCache={};
}
function roomView(r,uid){
  const role=uid===r.host?"host":uid===r.guest?"guest":null,hc=rj(r.hc),gc=r.gc?rj(r.gc):null;
  const card=(c,mine)=>{if(!c)return null;const p=pub(c);if(!mine){p.stats=null;p.v=Math.round(p.v)}return p};
  const rounds=rj(r.rounds,[]),w=rounds.filter(x=>x.h>x.g).length,l=rounds.filter(x=>x.g>x.h).length;
  return {id:r.id,mode:r.mode,priv:r.priv,code:role==="host"?r.code:undefined,phase:r.phase,left:Math.max(0,r.until-Date.now()),role,
    host:{uid:r.host,name:r.host_name,card:card(hc,role==="host")},guest:r.guest?{uid:r.guest,name:r.guest_name,card:card(gc,role==="guest")}:null,
    picks:rj(r.picks,[]),rounds,result:r.phase==="done"?{w,l}:null}}
async function myRoom(env,uid){return env.DB.prepare("SELECT * FROM rooms WHERE (host=? OR guest=?) AND phase IN ('open','p0','s0','p1','s1','s2') ORDER BY id DESC LIMIT 1").bind(uid,uid).first()}
async function arenaCard(env,me,id){
  const c=await env.DB.prepare("SELECT * FROM cards WHERE id=? AND owner=? AND list_price IS NULL AND away=0 AND room_id IS NULL").bind(id|0,me.id).first();
  if(!c)fail("Эту карточку нельзя взять в бой: она на рынке, в походе или уже в бою");if(FIN[c.f]&&FIN[c.f].excl)fail("«Основатель» — трофей, в боях не участвует");if(c.part)fail("Половинка не воюет. Собери целого воина");return rowToCard(c)}
async function arena(env,me,a,p){
  const now=Date.now();
  if(a==="arena_list"){
    // чистим брошенные и доигрываем зависшие комнаты
    for(const r of (await env.DB.prepare("SELECT * FROM rooms WHERE (phase='open' AND created<?) OR (phase IN ('p0','s0','p1','s1','s2') AND until<?) OR (phase IN ('done','cancel') AND applied=0) LIMIT 10").bind(now-OPEN_MS,now-1000).all()).results)await roomAdvance(env,r);
    const open=(await env.DB.prepare("SELECT * FROM rooms WHERE phase='open' AND priv=0 AND created>? ORDER BY id DESC LIMIT 30").bind(now-OPEN_MS).all()).results;
    const live=(await env.DB.prepare("SELECT * FROM rooms WHERE phase IN ('p0','s0','p1','s1','s2') ORDER BY id DESC LIMIT 15").all()).results;
    const mine=await myRoom(env,me.id);
    return {open:open.map(r=>roomView(r,me.id)),live:live.map(r=>roomView(r,me.id)),mine:mine?mine.id:null}}
  if(a==="room_create"){
    const cur=await myRoom(env,me.id);if(cur)fail("У тебя уже есть бой на арене");
    const c=await arenaCard(env,me,p.id),mode=p.mode?1:0,priv=p.priv?1:0,code=Math.random().toString(36).slice(2,8);
    const ins=await env.DB.prepare("INSERT INTO rooms(code,priv,mode,host,host_name,hc,phase,until,created,updated) VALUES(?,?,?,?,?,?,'open',0,?,?)").bind(code,priv,mode,me.id,await nameOf(env,me.id),JSON.stringify(c),now,now).run();
    const r=await env.DB.prepare("SELECT * FROM rooms WHERE host=? ORDER BY id DESC LIMIT 1").bind(me.id).first();
    const lock=await env.DB.prepare("UPDATE cards SET room_id=? WHERE id=? AND owner=? AND room_id IS NULL AND list_price IS NULL AND away=0").bind(r.id,c.id,me.id).run();
    if(lock.meta.changes!==1){await env.DB.prepare("UPDATE rooms SET phase='cancel',applied=1 WHERE id=?").bind(r.id).run();fail("Карточка уже занята")}
    return roomView(r,me.id)}
  const r0=await env.DB.prepare("SELECT * FROM rooms WHERE id=?").bind(p.room|0).first();if(!r0)fail("Бой не найден");
  if(a==="room_get"){const r=await roomAdvance(env,r0);return roomView(r,me.id)}
  if(a==="room_cancel"){if(r0.host!==me.id||r0.phase!=="open")fail("Отменить можно только свой бой, пока никто не принял");
    if(!(await roomSave(env,r0,{phase:"cancel"})))fail("Соперник уже принял бой");await roomFinish(env,{...r0,phase:"cancel"});return {}}
  if(a==="room_join"){
    if(r0.phase!=="open")fail("Этот бой уже начался или закрыт");if(r0.host===me.id)fail("Это твой бой");
    if(r0.priv&&String(p.code||"")!==r0.code)fail("Это закрытый бой: нужна ссылка от друга");
    if(await myRoom(env,me.id))fail("У тебя уже есть бой на арене");
    const c=await arenaCard(env,me,p.id),hc=rj(r0.hc);
    if(r0.mode){if(c.v<hc.v*.5||c.v>hc.v*2)fail("В бою на карточку цены должны быть похожи: от "+fmtD(hc.v*.5)+" до "+fmtD(hc.v*2)+" $");
      for(const u of [me.id,r0.host]){const n=await env.DB.prepare("SELECT COUNT(*) AS n FROM cards WHERE owner=?").bind(u).first();if(n.n>=CAP)fail(u===me.id?"У тебя полная коллекция":"У соперника полная коллекция")}}
    const lock=await env.DB.prepare("UPDATE cards SET room_id=? WHERE id=? AND owner=? AND room_id IS NULL AND list_price IS NULL AND away=0").bind(r0.id,c.id,me.id).run();
    if(lock.meta.changes!==1)fail("Карточка уже занята");
    const ok=await env.DB.prepare("UPDATE rooms SET guest=?,guest_name=?,gc=?,phase='p0',until=?,ver=ver+1,updated=? WHERE id=? AND phase='open'").bind(me.id,await nameOf(env,me.id),JSON.stringify(c),now+FIRST_PICK_MS,now,r0.id).run();
    if(ok.meta.changes!==1){await env.DB.prepare("UPDATE cards SET room_id=NULL WHERE id=?").bind(c.id).run();fail("Кто-то успел принять бой раньше")}
    const r=await env.DB.prepare("SELECT * FROM rooms WHERE id=?").bind(r0.id).first();
    await notify(env,r.host,"⚔️ "+r.guest_name+" принял твой вызов на арене"+(r.mode?" (на карточку)":"")+"! Бой уже идёт, у тебя 30 секунд на выбор 👇","⚔️ В бой",PAGE+"?startapp=b_"+r.id);
    return roomView(r,me.id)}
  if(a==="room_pick"){
    let r=await roomAdvance(env,r0);const picks=rj(r.picks,[]),rounds=rj(r.rounds,[]),s=p.stat|0;
    if(!(r.phase==="p0"&&me.id===r.host)&&!(r.phase==="p1"&&me.id===r.guest))fail("Сейчас не твой ход");
    if(s<0||s>4||picks.includes(s))fail("Эту характеристику выбрать нельзя");
    if(!(await roomSave(env,r,{picks:JSON.stringify([...picks,s]),rounds:JSON.stringify([...rounds,roundOf(r,s)]),phase:r.phase==="p0"?"s0":"s1",until:now+SHOW_MS})))fail("Время вышло");
    r=await env.DB.prepare("SELECT * FROM rooms WHERE id=?").bind(r.id).first();return roomView(r,me.id)}
  fail("Неизвестное действие")}

/* ---------- рейтинговый бой: поиск соперника по весовой категории, бой до конца здоровья, рейтинг и сезоны ----------
   Очередь rq: игрок с картой ждёт соперника своей категории. Через 20 секунд ищем и в соседней (у слабой карты +10%),
   через 30 секунд — «тень»: карточка настоящего игрока, которой управляет бот. Ход — 12 секунд, не выбрал — выбор случайный. */
const RK_PICK=12e3,RK_SHOW=2600,RK_WIDE=20e3,RK_GHOST=30e3,RK_LIVE_Q=60e3;
const seasonOf=t=>new Date(t+TZ).toISOString().slice(0,7);
async function rkUser(env,uid){const u=await env.DB.prepare("SELECT id,COALESCE(nick,name) AS name,rating,rk_streak,rk_best,rk_day,rk_dayn,rk_season,state FROM users WHERE id=?").bind(uid).first();
  if(!u)fail("Игрок не найден");const day=dayOf(Date.now());u.dayn=u.rk_day===day?u.rk_dayn:0;u.rating=u.rating||0;return u}
const rkTired=(st,id,now)=>{const f=((st||{}).fat||{})[id];return !!(f&&f.n>=FAT_N&&now-f.t<FAT_MS)};
async function rkActive(env,uid){return env.DB.prepare("SELECT * FROM rm WHERE (a=? OR (b=? AND ghost=0)) AND phase<>'done' ORDER BY id DESC LIMIT 1").bind(uid,uid).first()}
async function rkCardOf(env,uid,id){const c=await env.DB.prepare("SELECT * FROM cards WHERE id=? AND owner=? AND list_price IS NULL AND away=0 AND room_id IS NULL").bind(id|0,uid).first();
  if(!c)fail("Эту карточку нельзя взять в бой: она на рынке, в походе или уже в бою");if(FIN[c.f]&&FIN[c.f].excl)fail("«Основатель» — трофей, в боях не участвует");if(c.part)fail("Половинка не воюет. Собери целого воина");return rowToCard(c)}
/* создать бой; карточки блокируются (room_id = −id боя) */
async function rkCreate(env,A,B,ghost){const now=Date.now(),wa=wclass(A.card.h),wb=wclass(B.card.h),under={a:wa<wb?1:0,b:wb<wa?1:0};
  const S=rkInit(A.card,B.card,{a:{tired:A.tired,under:under.a},b:{tired:B.tired,under:under.b}});
  const row=await env.DB.prepare("INSERT INTO rm(a,b,an,bn,ac,bc,wa,wb,ghost,st,pa,pb,phase,until,ver,applied,created) VALUES(?,?,?,?,?,?,?,?,?,?,NULL,NULL,'pick',?,0,0,?) RETURNING id")
    .bind(A.uid,B.uid,A.name,B.name,JSON.stringify(A.card),JSON.stringify(B.card),wa,wb,ghost?1:0,JSON.stringify(S),now+RK_PICK+2500,now).first();
  const id=row.id;await env.DB.prepare("UPDATE cards SET room_id=? WHERE id=? AND owner=?").bind(-id,A.card.id,A.uid).run();
  if(!ghost)await env.DB.prepare("UPDATE cards SET room_id=? WHERE id=? AND owner=?").bind(-id,B.card.id,B.uid).run();
  const day=dayOf(now);for(const u of ghost?[A.uid]:[A.uid,B.uid])await env.DB.prepare("UPDATE users SET rk_dayn=CASE WHEN rk_day=? THEN rk_dayn+1 ELSE 1 END,rk_day=? WHERE id=?").bind(day,day,u).run();
  await env.DB.prepare("DELETE FROM rq WHERE uid IN (?,?)").bind(A.uid,B.uid).run();
  if(ghost)await rkGhostPick(env,id);return id}
async function rkGhostPick(env,id){const m=await env.DB.prepare("SELECT * FROM rm WHERE id=?").bind(id).first();if(!m||!m.ghost||m.phase!=="pick"||m.pb)return;
  await env.DB.prepare("UPDATE rm SET pb=?,ver=ver+1 WHERE id=? AND pb IS NULL").bind(rkAI(rj(m.st,{}),"b"),id).run()}
async function rkSave(env,m,patch){const keys=Object.keys(patch);
  return (await env.DB.prepare(`UPDATE rm SET ${keys.map(k=>k+"=?").join(",")},ver=ver+1 WHERE id=? AND ver=?`).bind(...keys.map(k=>patch[k]),m.id,m.ver).run()).meta.changes===1}
/* двигаем бой по времени: оба выбрали или время вышло → ход; показ → следующий выбор; конец → итог */
async function rkAdvance(env,m){
  for(let i=0;i<6&&m;i++){const now=Date.now();let patch=null;
    if(m.phase==="pick"&&((m.pa&&m.pb)||now>m.until)){const S=rj(m.st,{});const x=m.pa||rkAI(S,"a"),y=m.pb||rkAI(S,"b");rkTurn(S,x,y);
      patch={st:JSON.stringify(S),pa:null,pb:null,phase:S.done?"end":"show",until:now+RK_SHOW+(S.done?600:0)}}
    else if(m.phase==="show"&&now>m.until)patch={phase:"pick",until:now+RK_PICK};
    else if(m.phase==="end"&&now>m.until)patch={phase:"done"};
    if(!patch)break;if(await rkSave(env,m,patch)&&patch.phase==="pick"&&m.ghost)await rkGhostPick(env,m.id);m=await env.DB.prepare("SELECT * FROM rm WHERE id=?").bind(m.id).first()}
  if(m&&(m.phase==="end"||m.phase==="done")&&!m.applied)await rkFinish(env,m);
  return m}
async function rkFinish(env,m){const t=await env.DB.prepare("UPDATE rm SET applied=1 WHERE id=? AND applied=0").bind(m.id).run();if(t.meta.changes!==1)return;
  await env.DB.prepare("UPDATE cards SET room_id=NULL WHERE room_id=?").bind(-m.id).run();
  const S=rj(m.st,{}),ac=rj(m.ac,{}),bc=rj(m.bc,{}),res={};
  for(const side of m.ghost?["a"]:["a","b"]){const uid=m[side],u=await rkUser(env,uid),won=S.win===side,draw=S.win==="d",wc=side==="a"?m.wa:m.wb,under=S[side].under;
    const d=draw?0:rkGain(won,wc,u.rk_streak||0,under,u.rating),nr=Math.max(0,u.rating+d),streak=won?(u.rk_streak||0)+1:draw?(u.rk_streak||0):0;
    await env.DB.prepare("UPDATE users SET rating=?,rk_streak=?,rk_best=MAX(rk_best,?),rk_season=? WHERE id=?").bind(nr,streak,nr,seasonOf(Date.now()),uid).run();
    res[side]={d,r:nr,from:u.rating,streak,lg:league(nr),up:league(nr)>league(u.rating)};
    try{await doAction(env,{id:uid,name:u.name},"pvp_result",{id:(side==="a"?ac:bc).id,res:won?"w":draw?"d":"l",rk:1},{pvp:true});dtopLast.delete(uid);await dtopAdd(env,"fight",uid,1)}catch(e){console.error("rk pvp_result",e)}}
  await env.DB.prepare("UPDATE rm SET res=? WHERE id=?").bind(JSON.stringify(res),m.id).run();delete topCache.rktop}
function rkView(m,uid){const side=m.a===uid?"a":(!m.ghost&&m.b===uid)?"b":null,op=side==="b"?"a":"b",me=side||"a",S=rj(m.st,{}),res=rj(m.res,null);
  const card=s=>pub(rj(m[s+"c"],{})),F=s=>({name:m[s+"n"],card:card(s),hp:S[s].hp,mx:S[s].mx,wc:m["w"+s],tired:S[s].tired,under:S[s].under,picked:!!m["p"+s],uid:s==="b"&&m.ghost?null:m[s]});
  const A=abil(S[me].h)[3],peek=side&&A.peek&&S.turn===0&&m["p"+op]?m["p"+op]:null;
  return {id:m.id,phase:m.phase==="end"?"show":m.phase,left:Math.max(0,m.until-Date.now()),turn:S.turn,side,ghost:m.ghost,me:F(me),op:F(op),myPick:side?m["p"+me]:null,peek,
    last:S.log.length?S.log[S.log.length-1]:null,win:m.phase==="done"||m.phase==="end"?S.win:null,res:res&&side?res[side]:null}}
async function rkMatchSearch(env,me,q,wide){const now=Date.now();
  const rows=(await env.DB.prepare("SELECT * FROM rq WHERE uid<>? AND t>? AND wc BETWEEN ? AND ? ORDER BY ABS(wc-?),ABS(rating-?),t LIMIT 5").bind(me.id,now-RK_LIVE_Q,wide?q.wc-1:q.wc,wide?q.wc+1:q.wc,q.wc,q.rating).all()).results;
  for(const o of rows){const day=dayOf(now);   // с одним соперником не больше 3 боёв в день
    const n=((await env.DB.prepare("SELECT COUNT(*) AS n FROM rm WHERE ghost=0 AND created>? AND ((a=? AND b=?) OR (a=? AND b=?))").bind(now-864e5,me.id,o.uid,o.uid,me.id).first())||{}).n||0;if(n>=3)continue;
    const del=await env.DB.prepare("DELETE FROM rq WHERE uid=? AND t=?").bind(o.uid,o.t).run();if(del.meta.changes!==1)continue;
    let oc;try{oc=await rkCardOf(env,o.uid,o.card)}catch(e){continue}
    const ou=await rkUser(env,o.uid),mu=await rkUser(env,me.id),mc=await rkCardOf(env,me.id,q.card);
    return rkCreate(env,{uid:o.uid,name:ou.name,card:oc,tired:rkTired(rj(ou.state,{}),oc.id,now)},{uid:me.id,name:mu.name,card:mc,tired:rkTired(rj(mu.state,{}),mc.id,now)},false)}
  return null}
async function rkGhost(env,me,q){const now=Date.now(),hs=HEROES.map((H,i)=>i).filter(i=>wclass(i)===q.wc);
  const r=await env.DB.prepare(`SELECT c.*,COALESCE(u.nick,u.name) AS owner_name,u.rating AS orating FROM cards c JOIN users u ON u.id=c.owner WHERE c.owner>0 AND c.owner<>? AND c.part=0 AND c.f<>5 AND c.h IN (${hs.join(",")}) ORDER BY ABS(COALESCE(u.rating,0)-?)+ABS(RANDOM()%400) LIMIT 1`).bind(me.id,q.rating).first();
  const mu=await rkUser(env,me.id),mc=await rkCardOf(env,me.id,q.card);
  const oc=r?rowToCard(r):phantom(hs[Math.floor(Math.random()*hs.length)],0);
  return rkCreate(env,{uid:me.id,name:mu.name,card:mc,tired:rkTired(rj(mu.state,{}),mc.id,now)},{uid:r?r.owner:0,name:r?(r.owner_name||"Игрок"):"Тень воина",card:oc,tired:false},true)}
async function rkTop(env){return cached("rktop",15e3,async()=>(await env.DB.prepare("SELECT id,COALESCE(nick,name) AS name,rating FROM users WHERE rating>0 AND rk_season=? ORDER BY rating DESC LIMIT 20").bind(seasonOf(Date.now())).all()).results.filter(r=>!isAdmin(env,r.id)))}
async function rkApi(env,me,a,p){const now=Date.now();
  if(a==="rk_info"){const u=await rkUser(env,me.id),top=await rkTop(env),st=rj(u.state,{});const rating=u.rating;
    const rank=rating>0?(((await env.DB.prepare("SELECT COUNT(*) AS n FROM users WHERE rating>? AND rk_season=?").bind(rating,seasonOf(now)).first())||{}).n||0)+1:0;
    const act=await rkActive(env,me.id),q=await env.DB.prepare("SELECT * FROM rq WHERE uid=?").bind(me.id).first();
    const d=new Date(now+TZ),next=Date.UTC(d.getUTCFullYear(),d.getUTCMonth()+1,1)-TZ;
    return {rating,lg:league(rating),streak:u.rk_streak||0,dayn:u.dayn,dayMax:RK_DAY,rank,seasonLeft:next-now,season:seasonOf(now),top:top.map(r=>({uid:r.id,name:r.name,rating:r.rating,lg:league(r.rating)})),
      active:act?act.id:null,queued:q?{card:q.card,wc:q.wc,since:q.t}:null,fat:st.fat||{}}}
  if(a==="rk_find"){if(await rkActive(env,me.id))fail("У тебя уже идёт рейтинговый бой");const u=await rkUser(env,me.id);if(u.dayn>=RK_DAY)fail("На сегодня рейтинговые бои закончились ("+RK_DAY+" в день). Завтра новые!");
    const c=await rkCardOf(env,me.id,p.id),q={uid:me.id,card:c.id,wc:wclass(c.h),rating:u.rating,t:now};
    await env.DB.prepare("INSERT INTO rq(uid,card,wc,rating,t) VALUES(?,?,?,?,?) ON CONFLICT(uid) DO UPDATE SET card=excluded.card,wc=excluded.wc,rating=excluded.rating,t=excluded.t").bind(q.uid,q.card,q.wc,q.rating,q.t).run();
    const id=await rkMatchSearch(env,me,q,false);return {match:id||null,queued:id?null:{card:c.id,wc:q.wc,since:now}}}
  if(a==="rk_poll"){const act=await rkActive(env,me.id);if(act)return {match:act.id};const q=await env.DB.prepare("SELECT * FROM rq WHERE uid=?").bind(me.id).first();if(!q)return {match:null,queued:null};
    const el=now-q.t;let id=await rkMatchSearch(env,me,q,el>RK_WIDE);if(!id&&el>RK_GHOST)id=await rkGhost(env,me,q);
    return {match:id||null,queued:id?null:{card:q.card,wc:q.wc,since:q.t}}}
  if(a==="rk_cancel"){await env.DB.prepare("DELETE FROM rq WHERE uid=?").bind(me.id).run();return {}}
  const m0=await env.DB.prepare("SELECT * FROM rm WHERE id=?").bind(p.id|0).first();if(!m0)fail("Бой не найден");
  if(a==="rk_get"){const m=await rkAdvance(env,m0);return rkView(m,me.id)}
  if(a==="rk_act"){const act=String(p.act||"");if(!RK_ACTS[act])fail("Неверное действие");let m=await rkAdvance(env,m0);const side=m.a===me.id?"a":(!m.ghost&&m.b===me.id)?"b":null;
    if(!side)fail("Это не твой бой");if(m.phase!=="pick")fail("Подожди следующего хода");if(m["p"+side])fail("Ты уже выбрал");
    await env.DB.prepare(`UPDATE rm SET p${side}=?,ver=ver+1 WHERE id=? AND p${side} IS NULL AND phase='pick'`).bind(act,m.id).run();
    m=await rkAdvance(env,await env.DB.prepare("SELECT * FROM rm WHERE id=?").bind(m.id).first());return rkView(m,me.id)}
  fail("Неизвестное действие")}
/* конец сезона (1-го числа): награда по лиге, рейтинг сжимается до 40%. Порциями по 25 игроков */
async function rkSeasonTick(env){const cur=seasonOf(Date.now()),k=(await kvGet(env,"rk_season_done"))||{};if(k.s===cur&&k.fin)return;
  if(k.s!==cur){k.s=cur;k.after=0;k.fin=0}
  const rows=(await env.DB.prepare("SELECT id,COALESCE(nick,name) AS name,rating,rk_season FROM users WHERE rk_season IS NOT NULL AND rk_season<? AND id>? ORDER BY id LIMIT 25").bind(cur,k.after).all()).results;
  for(const u of rows){k.after=u.id;const lg=league(u.rating),P=SEASON_PRIZE[lg];
    if(P&&!isAdmin(env,u.id)){try{await doAction(env,{id:u.id,name:u.name},"season_prize",P,{season:true})}catch(e){console.error("season",e)}
      await notify(env,u.id,"🏆 Сезон рейтинга завершён! Твоя лига: "+LEAGUES[lg].ic+" "+LEAGUES[lg].n+" ("+u.rating+").\n\nНаграда: "+[P.sp?"+"+P.sp+" прокруток":"",P.guar?"гарантированный эпик":"",P.tier===3?"легендарная карточка":P.tier===4?"мифическая карточка":""].filter(Boolean).join(", ")+" 🎁\n\nНовый сезон уже начался — рейтинг сжат до 40%. Вперёд!","⚔️ В бой")}
    await env.DB.prepare("UPDATE users SET rating=?,rk_streak=0,rk_season=? WHERE id=?").bind(Math.floor((u.rating||0)*.4),cur,u.id).run()}
  if(rows.length<25)k.fin=1;await kvSet(env,"rk_season_done",k)}
/* брошенные бои доигрываются сами (раз в 5 секунд), чтобы карточки не зависали */
async function rkTick(env){for(const m of (await env.DB.prepare("SELECT * FROM rm WHERE phase<>'done' AND until<? LIMIT 5").bind(Date.now()-1000).all()).results)await rkAdvance(env,m);
  await env.DB.prepare("DELETE FROM rq WHERE t<?").bind(Date.now()-10*60e3).run()}
/* ---------- странствующий торговец на рынке ----------
   Каждые 3 часа новый товар: 4 обычных/редких, 1 эпическая и «звезда витрины» (легендарная, иногда мифическая).
   Каждая карточка в одном экземпляре на всех, цена на 50–60% выше оценки. «Ошибку печати», богатырей, легенды 1 из 1 и половинки не продаёт.
   Ещё торговец ищет двух воинов и платит за них на 30% больше оценки (до 5 карточек каждого за смену, одну от игрока). */
const traderSlot=t=>Math.floor((t+TZ)/TRADER_MS);
function traderGen(slot,ctx){const R=rng(slot*7919+13),pickIn=a=>a[Math.floor(R()*a.length)],base=t=>HEROES.map((H,i)=>i).filter(i=>i<NBASE&&HEROES[i][2]===t);
  const finPick=w=>{let x=R()*w.reduce((a,b)=>a+b,0);for(let i=0;i<w.length;i++){x-=w[i];if(x<0)return i}return 0};
  const plan=[[R()<.6?0:1,[70,22,8]],[R()<.6?0:1,[70,22,8]],[R()<.5?0:1,[70,22,8]],[1,[60,30,10]],[2,[60,30,10]],R()<.1?[4,[80,20]]:[3,[70,25,5]]];
  const items=plan.map(([t,w],i)=>{const h=pickIn(base(t));let f=finPick(w);while(f>0&&ctx.issuedOf(h,f)>=FIN[f].run)f--;
    const B=cardBody(h,f),v=priceOf(h,f,2,"123457",B.top),k=TRADER_MARKUP[0]+R()*(TRADER_MARKUP[1]-TRADER_MARKUP[0]);return {i,h,f,stats:B.stats,hue:B.hue,v,price:Math.round(v*k*100)/100,star:i===5?1:0}});
  const wantPool=HEROES.map((H,i)=>i).filter(i=>i<NBASE&&HEROES[i][2]<=3),wants=[];while(wants.length<2){const h=pickIn(wantPool);if(!wants.includes(h))wants.push(h)}
  return {slot,items,wants}}
function rng(seed){return ()=>{seed=seed+0x6D2B79F5|0;let t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return ((t^t>>>14)>>>0)/4294967296}}
async function traderStock(env){const slot=traderSlot(Date.now());return cached("trader"+slot,TRADER_MS,async()=>{
  let T=await kvGet(env,"trader");if(!T||T.slot!==slot){T=traderGen(slot,await makeCtx(env,false));await kvSet(env,"trader",T)}return T})}
async function traderInfo(env,me){const T=await traderStock(env),now=Date.now();
  const sold={};for(const r of (await env.DB.prepare("SELECT i,uid,name FROM trader_sold WHERE slot=?").bind(T.slot).all()).results)sold[r.i]={uid:r.uid,name:r.name};
  const wants=[];for(const h of T.wants){const n=((await env.DB.prepare("SELECT COUNT(*) AS n FROM trader_buy WHERE slot=? AND h=?").bind(T.slot,h).first())||{}).n||0;
    const mine=!!(await env.DB.prepare("SELECT 1 FROM trader_buy WHERE slot=? AND h=? AND uid=?").bind(T.slot,h,me.id).first());wants.push({h,left:Math.max(0,TRADER_WANT_N-n),mine})}
  return {left:(T.slot+1)*TRADER_MS-TZ-now,items:T.items.map(x=>({i:x.i,star:x.star,price:x.price,card:{id:"t"+x.i,h:x.h,f:x.f,no:0,sn:"??????",hue:x.hue,v:x.v,stats:x.stats,xp:0,wins:0,stars:0},sold:sold[x.i]||null})),wants,k:TRADER_WANT_K}}
async function traderBuy(env,me,p){const T=await traderStock(env),it=T.items[p.i|0];if(!it)fail("Нет такого товара");
  const u=await env.DB.prepare("SELECT cash,COALESCE(nick,name) AS n FROM users WHERE id=?").bind(me.id).first();if(!u||u.cash<it.price)fail("Не хватает $"+fmtD(Math.max(0,it.price-((u&&u.cash)||0))));
  const ins=await env.DB.prepare("INSERT OR IGNORE INTO trader_sold(slot,i,uid,name,t) VALUES(?,?,?,?,?)").bind(T.slot,it.i,me.id,u.n,Date.now()).run();if(ins.meta.changes!==1)fail("Эту карточку уже купили");
  try{return await doAction(env,me,"trader_take",{},{trader:it})}catch(e){await env.DB.prepare("DELETE FROM trader_sold WHERE slot=? AND i=? AND uid=?").bind(T.slot,it.i,me.id).run();throw e}}
async function traderSell(env,me,p){const T=await traderStock(env),h=p.h|0;if(!T.wants.includes(h))fail("Торговец сейчас не ищет этого воина");
  const n=((await env.DB.prepare("SELECT COUNT(*) AS n FROM trader_buy WHERE slot=? AND h=?").bind(T.slot,h).first())||{}).n||0;if(n>=TRADER_WANT_N)fail("Торговец уже набрал таких воинов. Жди новую смену");
  const ins=await env.DB.prepare("INSERT OR IGNORE INTO trader_buy(slot,h,uid) VALUES(?,?,?)").bind(T.slot,h,me.id).run();if(ins.meta.changes!==1)fail("Ты уже продал ему такого воина в эту смену");
  try{return await doAction(env,me,"trader_give",{id:p.id},{trader:{h,k:TRADER_WANT_K}})}catch(e){await env.DB.prepare("DELETE FROM trader_buy WHERE slot=? AND h=? AND uid=?").bind(T.slot,h,me.id).run();throw e}}
/* ---------- турнир выходных: каждую субботу в 20:00 по Минску ----------
   Регистрация всю неделю (до 64 игроков). В 20:00 сетка на выбывание, каждый матч — живой бой на арене.
   Сервер сам создаёт бои, двигает раунды (раз в 5 секунд) и раздаёт призы. */
const TOUR_MAX=64, TOUR_PRIZE=[{cash:10000,sp:10,guar:1},{cash:3000,sp:5},{cash:1000,sp:3}];
function nextStart(after){const loc=new Date(after+TZ),dow=loc.getUTCDay(),mid=Date.UTC(loc.getUTCFullYear(),loc.getUTCMonth(),loc.getUTCDate())-TZ;
  let t=mid+((6-dow+7)%7)*864e5+20*3600e3;if(t<=after)t+=7*864e5;return t}
async function curTour(env){let T=await env.DB.prepare("SELECT * FROM tours WHERE phase IN ('reg','run') ORDER BY id DESC LIMIT 1").first();
  if(!T){const now=Date.now();await env.DB.prepare("INSERT INTO tours(start,phase,round,created) VALUES(?,'reg',0,?)").bind(nextStart(now),now).run();
    T=await env.DB.prepare("SELECT * FROM tours WHERE phase='reg' ORDER BY id DESC LIMIT 1").first()}return T}
async function tourCard(env,uid,pref){const q="SELECT * FROM cards WHERE owner=? AND list_price IS NULL AND away=0 AND room_id IS NULL AND f<>5 AND part=0";
  return (pref&&await env.DB.prepare(q+" AND id=?").bind(uid,pref).first())||await env.DB.prepare(q+" ORDER BY v DESC LIMIT 1").bind(uid).first()}
async function tourMatchRoom(env,T,m){const now=Date.now(),P=async u=>env.DB.prepare("SELECT * FROM tour_players WHERE tour=? AND uid=?").bind(T.id,u).first();
  const pa=await P(m.a),pb=await P(m.b),ca=await tourCard(env,m.a,pa&&pa.card),cb=await tourCard(env,m.b,pb&&pb.card);
  if(!ca||!cb){await env.DB.prepare("UPDATE tour_matches SET winner=? WHERE id=?").bind(ca||!cb?m.a:m.b,m.id).run();return}   // нет карточки — техническое поражение
  const code=Math.random().toString(36).slice(2,8);
  await env.DB.prepare("INSERT INTO rooms(code,priv,mode,host,host_name,hc,guest,guest_name,gc,phase,until,created,updated,tour) VALUES(?,1,0,?,?,?,?,?,?,'p0',?,?,?,?)")
    .bind(code,m.a,pa.name,JSON.stringify(rowToCard(ca)),m.b,pb.name,JSON.stringify(rowToCard(cb)),now+FIRST_PICK_MS,now,now,T.id).run();
  const r=await env.DB.prepare("SELECT id FROM rooms WHERE tour=? AND host=? AND guest=? ORDER BY id DESC LIMIT 1").bind(T.id,m.a,m.b).first();
  await env.DB.batch([env.DB.prepare("UPDATE cards SET room_id=? WHERE id IN (?,?)").bind(r.id,ca.id,cb.id),env.DB.prepare("UPDATE tour_matches SET room=? WHERE id=?").bind(r.id,m.id)]);
  const rn=["","1/32","1/16","1/8","1/4","полуфинал","финал"],left=await env.DB.prepare("SELECT COUNT(*) AS n FROM tour_matches WHERE tour=? AND round=?").bind(T.id,m.round).first();
  const stage=left.n===1?"ФИНАЛ":left.n===2?"полуфинал":"раунд "+m.round;
  for(const [u,o] of [[m.a,pb.name],[m.b,pa.name]])await notify(env,u,"🏆 Турнир, "+stage+": твой бой против "+o+" начался! 30 секунд на первый ход 👇","⚔️ В бой",PAGE+"?startapp=b_"+r.id+"_"+code)}
function roomWinner(r){const R=rj(r.rounds,[]);let w=R.filter(x=>x.h>x.g).length,l=R.filter(x=>x.g>x.h).length;
  if(w===l){w=R.reduce((a,x)=>a+x.h,0);l=R.reduce((a,x)=>a+x.g,0)}if(w===l)return Math.random()<.5?r.host:r.guest;return w>l?r.host:r.guest}
async function tourPrize(env,uid,P,txt){try{await doAction(env,{id:uid,name:await nameOf(env,uid)},"tour_prize",P,{tour:true})}catch(e){console.error("tour_prize",e)}if(txt)await notify(env,uid,txt,"🏆 Открыть игру")}
let tourBusy=null;
async function tourTick(env){if(tourBusy)return tourBusy;tourBusy=(async()=>{const now=Date.now();let T=await curTour(env);
  if(T.phase==="reg"){
    if(!T.reminded&&now>=T.start-15*60e3){await env.DB.prepare("UPDATE tours SET reminded=1 WHERE id=?").bind(T.id).run();
      for(const p of (await env.DB.prepare("SELECT uid FROM tour_players WHERE tour=?").bind(T.id).all()).results)await notify(env,p.uid,"🏆 Турнир начинается через 15 минут! Будь в игре, бои пойдут вживую","⚔️ Открыть игру")}
    if(now<T.start)return;
    const ps=(await env.DB.prepare("SELECT * FROM tour_players WHERE tour=? ORDER BY rowid LIMIT ?").bind(T.id,TOUR_MAX).all()).results.sort(()=>Math.random()-.5);
    if(ps.length<2){await env.DB.prepare("UPDATE tours SET phase='done' WHERE id=?").bind(T.id).run();for(const p of ps)await notify(env,p.uid,"🏆 Турнир не состоялся: мало участников. Регистрация на следующий уже открыта!","Открыть игру");return}
    let size=2;while(size<ps.length)size*=2;const byes=size-ps.length;let i=0;
    for(let k=0;k<size/2;k++){const a=ps[i++].uid,b=k<byes?null:ps[i++].uid;
      await env.DB.prepare("INSERT INTO tour_matches(tour,round,slot,a,b,winner) VALUES(?,1,?,?,?,?)").bind(T.id,k,a,b,b?null:a).run()}
    await env.DB.prepare("UPDATE tours SET phase='run',round=1 WHERE id=?").bind(T.id).run();T=await curTour(env);
    for(const m of (await env.DB.prepare("SELECT * FROM tour_matches WHERE tour=? AND round=1 AND winner IS NULL").bind(T.id).all()).results)await tourMatchRoom(env,T,m);
    topCache.tour=null;return}
  if(T.phase!=="run")return;
  const ms=(await env.DB.prepare("SELECT * FROM tour_matches WHERE tour=? AND round=? ORDER BY slot").bind(T.id,T.round).all()).results;
  for(const m of ms){if(m.winner)continue;if(!m.room){await tourMatchRoom(env,T,m);continue}
    let r=await env.DB.prepare("SELECT * FROM rooms WHERE id=?").bind(m.room).first();r=r&&await roomAdvance(env,r);
    if(!r||r.phase==="cancel")await env.DB.prepare("UPDATE tour_matches SET winner=? WHERE id=?").bind(m.a,m.id).run();
    else if(r.phase==="done")await env.DB.prepare("UPDATE tour_matches SET winner=? WHERE id=?").bind(roomWinner(r),m.id).run()}
  const done=(await env.DB.prepare("SELECT * FROM tour_matches WHERE tour=? AND round=? ORDER BY slot").bind(T.id,T.round).all()).results;
  if(done.some(m=>!m.winner))return;
  const loser=m=>m.b==null?null:(m.winner===m.a?m.b:m.a);
  if(done.length===1){const m=done[0],champ=m.winner,fin=loser(m);
    const semis=T.round>1?(await env.DB.prepare("SELECT * FROM tour_matches WHERE tour=? AND round=?").bind(T.id,T.round-1).all()).results.map(loser).filter(Boolean):[];
    const cn=await nameOf(env,champ);
    await env.DB.prepare("UPDATE tours SET phase='done',champion=?,champion_name=? WHERE id=?").bind(champ,cn,T.id).run();
    await kvSet(env,"champion",{uid:champ,name:cn,until:now+7*864e5});topCache={};
    await env.DB.prepare("UPDATE users SET vip_until=MAX(vip_until,?) WHERE id=?").bind(now+7*864e5,champ).run();
    await tourPrize(env,champ,TOUR_PRIZE[0],"🏆 ТЫ ЧЕМПИОН ТУРНИРА! +$10 000, +10 прокруток, гарантированная эпическая карточка, VIP на 7 дней и кубок 🏆 у ника на неделю!");
    if(fin)await tourPrize(env,fin,TOUR_PRIZE[1],"🥈 Второе место в турнире! +$3 000 и +5 прокруток. В следующую субботу — за кубком!");
    for(const u of semis)await tourPrize(env,u,TOUR_PRIZE[2],"🥉 Полуфинал турнира! +$1 000 и +3 прокрутки");
    return}
  const ws=done.map(m=>m.winner);
  for(let k=0;k<ws.length/2;k++)await env.DB.prepare("INSERT INTO tour_matches(tour,round,slot,a,b) VALUES(?,?,?,?,?)").bind(T.id,T.round+1,k,ws[2*k],ws[2*k+1]).run();
  await env.DB.prepare("UPDATE tours SET round=round+1 WHERE id=?").bind(T.id).run();T=await curTour(env);
  for(const m of (await env.DB.prepare("SELECT * FROM tour_matches WHERE tour=? AND round=?").bind(T.id,T.round).all()).results)await tourMatchRoom(env,T,m);
  })().catch(e=>console.error("tour",e)).finally(()=>{tourBusy=null});return tourBusy}
async function tourApi(env,me,a,p){const now=Date.now();
  if(a==="tour_get"){await tourTick(env);const T=await curTour(env),last=await env.DB.prepare("SELECT * FROM tours WHERE phase='done' AND champion IS NOT NULL ORDER BY id DESC LIMIT 1").first();
    const players=(await env.DB.prepare("SELECT uid,name,card FROM tour_players WHERE tour=?").bind(T.id).all()).results,nm={};players.forEach(x=>nm[x.uid]=x.name);
    const mine=players.find(x=>x.uid===me.id);
    const mt=T.phase==="run"?(await env.DB.prepare("SELECT m.*,r.phase AS rphase,r.code AS rcode FROM tour_matches m LEFT JOIN rooms r ON r.id=m.room WHERE m.tour=? ORDER BY m.round,m.slot").bind(T.id).all()).results:[];
    return {id:T.id,phase:T.phase,start:T.start,left:Math.max(0,T.start-now),round:T.round,count:players.length,max:TOUR_MAX,me:mine?{card:mine.card}:null,
      matches:mt.map(m=>({round:m.round,a:m.a,b:m.b,an:nm[m.a]||"?",bn:m.b?nm[m.b]||"?":null,winner:m.winner,room:m.room,live:LIVE.includes(m.rphase),code:(m.a===me.id||m.b===me.id)?m.rcode:undefined})),
      last:last?{name:last.champion_name,uid:last.champion}:null,prize:"🏆 $10 000 + 10 прокруток + эпик + VIP на неделю + кубок у ника"}}
  const T=await curTour(env);
  if(a==="tour_join"){if(T.phase!=="reg")fail("Турнир уже идёт, регистрация закрыта");
    const c=await env.DB.prepare("SELECT * FROM cards WHERE id=? AND owner=? AND f<>5 AND part=0").bind(p.id|0,me.id).first();if(!c)fail("Выбери свою карточку (не «Основателя»)");
    const n=await env.DB.prepare("SELECT COUNT(*) AS n FROM tour_players WHERE tour=?").bind(T.id).first();const was=await env.DB.prepare("SELECT 1 FROM tour_players WHERE tour=? AND uid=?").bind(T.id,me.id).first();
    if(!was&&n.n>=TOUR_MAX)fail("Все "+TOUR_MAX+" мест заняты");
    await env.DB.prepare("INSERT INTO tour_players(tour,uid,name,card) VALUES(?,?,?,?) ON CONFLICT(tour,uid) DO UPDATE SET card=excluded.card,name=excluded.name").bind(T.id,me.id,await nameOf(env,me.id),c.id).run();return {}}
  if(a==="tour_leave"){if(T.phase!=="reg")fail("Турнир уже идёт");await env.DB.prepare("DELETE FROM tour_players WHERE tour=? AND uid=?").bind(T.id,me.id).run();return {}}
  if(a==="tour_admin"){if(!isAdmin(env,me.id))fail("Нет доступа");if(T.phase!=="reg")fail("Турнир уже идёт");
    await env.DB.prepare("UPDATE tours SET start=?,reminded=1 WHERE id=?").bind(now+Math.max(0,+p.min||0)*60e3,T.id).run();return {}}
  fail("Неизвестное действие")}

/* ---------- подписка на канал (бот должен быть администратором канала) ---------- */
const CHANNEL="@voinyepoh";
async function subCheck(env,me){
  if(me.dev)return doAction(env,me,"sub_reward",{},{subOk:true});   // тестовый вход без Telegram
  const r=await fetch("https://api.telegram.org/bot"+env.BOT_TOKEN+"/getChatMember?chat_id="+encodeURIComponent(env.CHANNEL||CHANNEL)+"&user_id="+me.id);
  const j=await r.json().catch(()=>({}));
  if(!j.ok){console.error("getChatMember",j);fail("Не получилось проверить подписку. Попробуй через минуту")}
  if(!["member","administrator","creator"].includes(j.result&&j.result.status))fail("Подписки пока не видно. Подпишись на канал и нажми «Проверить» ещё раз");
  return doAction(env,me,"sub_reward",{},{subOk:true});
}

/* ---------- напоминания от бота ----------
   Бот пишет только тем, кто разрешил (написал боту или нажал «Разрешить» в игре).
   Прокрутки: раз в 10 минут Cloudflare будит воркер (Cron Trigger), ночью с 23:00 до 9:00 по Минску не пишем. */
const fmtD=n=>(Math.round(n*100)/100).toLocaleString("ru-RU").replace(/[\u00a0\u202f]/g," ");
async function notify(env,uid,text,btn,url,photo){
  if(!env.BOT_TOKEN||env.DEV==="1"&&!env.NOTIFY_TEST)return false;
  try{const kb={inline_keyboard:[[{text:btn||"Играть",web_app:{url:url||PAGE}}]]};
    const r=photo?await tgApi(env,"sendPhoto",{chat_id:uid,photo,caption:text.slice(0,1024),reply_markup:kb}):await tgApi(env,"sendMessage",{chat_id:uid,text,reply_markup:kb});
    if(!r.ok&&(r.error_code===403||r.error_code===400))await env.DB.prepare("UPDATE users SET pm=0 WHERE id=?").bind(uid).run();   // заблокировал бота
    return !!r.ok}catch(e){return false}}
async function reminders(env){await ensureSchema(env);if(await maintenance(env))return {sent:0,maintenance:true};
  try{for(const r of (await env.DB.prepare("SELECT * FROM rooms WHERE (phase='open' AND created<?) OR (phase IN ('p0','s0','p1','s1','s2') AND until<?) OR (phase IN ('done','cancel') AND applied=0) LIMIT 50").bind(Date.now()-OPEN_MS,Date.now()-1000).all()).results)await roomAdvance(env,r)}catch(e){console.error("rooms",e)}const now=Date.now(),h=new Date(now+TZ).getUTCHours();
  if((h>=23||h<9)&&!env.NOTIFY_TEST)return {sent:0,quiet:true};
  const due=(await env.DB.prepare("SELECT id,refill_at FROM users WHERE pm=1 AND refill_at>0 AND refill_at<=? AND refill_note<refill_at LIMIT 60").bind(now).all()).results;
  let sent=0;for(const u of due){await env.DB.prepare("UPDATE users SET refill_note=? WHERE id=?").bind(u.refill_at,u.id).run();
    if(await notify(env,u.id,"⚡ Твои 3 бесплатные прокрутки готовы! Вдруг сейчас выпадет легенда?","🎴 Крутить"))sent++}
  try{const cd=(await env.DB.prepare("SELECT id,camp_at FROM users WHERE pm=1 AND camp_at>0 AND camp_at<=? AND camp_note<camp_at LIMIT 60").bind(now).all()).results;
    for(const u of cd){await env.DB.prepare("UPDATE users SET camp_note=? WHERE id=?").bind(u.camp_at,u.id).run();
      if(await notify(env,u.id,"🎯 Энергия в лагере снова полная! Манекен ждёт — каждый удар приносит руны 💠","🎯 Тренироваться",PAGE+"?camp=1"))sent++}}catch(e){console.error("camp",e)}
  return {sent,due:due.length}}

/* ---------- бот: ответ на /start и настройка ----------
   Один раз открой в браузере https://<адрес воркера>/setup — сервер сам подключит бота
   и заполнит название, описание и команды. */
const PAGE="https://prostovladon-prog.github.io/kruti-kvartiru-/";
const BOT_TEXT={
  name:"Воины Эпох",
  short:"Крути карточки воинов всех эпох: редкие номера, золото и ошибки печати. Бои, рынок и топ мира ⚔️",
  desc:"⚔️ ВОИНЫ ЭПОХ: коллекционная игра с карточками воинов\n\n🎴 Бесплатные прокрутки каждые 4 часа: от ополченца до Сёгуна и Мерлина\n💎 Каждая карточка одна в своём роде: свой номер, тираж и отделка. Ошибка печати одна на всю игру\n🔥 Закаляй воинов до ★5\n⚔️ Бои с друзьями, босс недели, рынок между игроками\n🏆 Поднимайся в топ мира\n\nЖми «Начать» 👇",
  cmds:[{command:"start",description:"Играть"},{command:"help",description:"Как играть"},{command:"invite",description:"Пригласить друга (+10 прокруток)"}]};
/* ---------- Сокровищница: оплата звёздами Telegram (XTR) ----------
   1) игра просит счёт (invoice) → строка в payments со статусом new; 2) Telegram спрашивает pre_checkout_query — проверяем ещё раз;
   3) приходит successful_payment → статус paid → выдаём покупку (done). Выдача идемпотентна: номер платежа запоминается у игрока.
   Если выдать нельзя (номер заняли, мифические сундуки кончились) — звёзды возвращаются автоматически (refund). */
const monthOf=t=>new Date(t+TZ).toISOString().slice(0,7),PAY_HOLD=15*60e3;
async function mythLeft(env,except){const I=SHOP.mythic,now=Date.now();
  const n=((await env.DB.prepare("SELECT COUNT(*) AS n FROM payments WHERE item='mythic' AND month=? AND id<>? AND (status IN ('paid','done') OR (status='new' AND created>?))").bind(monthOf(now),except||0,now-PAY_HOLD).first())||{}).n||0;
  return Math.max(0,I.month-n)}
async function payItem(env,uid,p,except){const item=String(p.item||""),I=SHOP[item];
  if(I){
    if(I.once){const u=await env.DB.prepare("SELECT state FROM users WHERE id=?").bind(uid).first();let st={};try{st=JSON.parse((u&&u.state)||"{}")}catch(e){}
      if(st.newbie||await env.DB.prepare("SELECT 1 FROM payments WHERE uid=? AND item=? AND status IN ('paid','done') AND id<>?").bind(uid,item,except||0).first())fail("Подарок новичку уже получен")}
    if(I.month&&await mythLeft(env,except)<=0)fail("Мифические сундуки этого месяца раскуплены. Новые появятся 1-го числа");
    let data={},title=I.n;
    if(I.any){const h=p.h|0,f=p.f|0,H=HEROES[h];if(!H||!FIN[f]||FIN[f].excl)fail("Такой карточки нет");
      if(H[4].one&&f!==4)fail("Легенды 1 из 1 бывают только «Ошибкой печати»");if(H[4].comp&&f!==0)fail("Составного воина можно взять только обычной отделки");
      const f2=H[4].comp?0:f,n=((await env.DB.prepare(H[4].comp?"SELECT COUNT(*) AS n FROM cards WHERE h=? AND f=0 AND no<=?":"SELECT COUNT(*) AS n FROM cards WHERE h=? AND f=?").bind(h,H[4].comp?HALF_RUN:f2).first())||{}).n||0;
      const run=H[4].one?1:H[4].comp?HALF_RUN:FIN[f2].run;if(n>=run)fail("Тираж «"+H[0]+"» ("+FIN[f2].k.toLowerCase()+") уже закончился. Выбери другую");
      data={h,f:f2};title=(H[0]+", "+FIN[f2].k.toLowerCase()).slice(0,32)}
    return {item,stars:I.stars,title,desc:(I.any?"Любая карточка в игре: "+title:I.d.map(x=>x.replace(/<[^>]+>/g,"")).join(", ")),data}}
  if(item==="num"){const sn=checkSn(p.sn),c=await env.DB.prepare("SELECT id,h,sn FROM cards WHERE id=? AND owner=?").bind(Math.floor(+p.card||0),uid).first();if(!c)fail("Карточка не найдена");
    if(c.sn===sn)fail("У этой карточки уже такой номер");
    if(await env.DB.prepare("SELECT 1 FROM cards WHERE sn=?").bind(sn).first())fail("Номер "+fmtSn(sn)+" уже занят. Выбери другой");
    return {item,stars:numPrice(sn),title:"Номер "+fmtSn(sn),desc:"Свой номер "+fmtSn(sn)+" на карточке «"+HEROES[c.h][0]+"»",data:{card:c.id,sn}}}
  if(item==="fx"){const k=String(p.fx||"");if(!NFX[k])fail("Нет такого эффекта");const f=p.forever?1:0;
    return {item,stars:f?NFX_PRICE.f:NFX_PRICE.m,title:"Ник «"+NFX[k]+"»",desc:"Переливающийся ник «"+NFX[k]+"» "+(f?"навсегда":"на "+NFX_DAYS+" дней")+": в топах, чате, лагере и на арене",data:{fx:k,forever:f}}}
  fail("Нет такого товара")}
async function invoice(env,me,p){const I=await payItem(env,me.id,p),now=Date.now();
  const row=await env.DB.prepare("INSERT INTO payments(uid,item,p,stars,status,month,created) VALUES(?,?,?,?,'new',?,?) RETURNING id").bind(me.id,I.item,JSON.stringify(I.data),I.stars,monthOf(now),now).first();
  const pid=row.id;if(env.PAY_SIM==="1")return {pid,sim:1,stars:I.stars};
  const r=await tgApi(env,"createInvoiceLink",{title:I.title.slice(0,32),description:I.desc.slice(0,255),payload:"p"+pid,currency:"XTR",prices:[{label:I.title.slice(0,32),amount:I.stars}]});
  if(!r||!r.ok){console.error("invoice",r);fail("Telegram не создал счёт. Попробуй через минуту")}
  return {pid,link:r.result,stars:I.stars}}
async function preCheckout(env,q){let err="";
  try{const m=/^p(\d+)$/.exec(q.invoice_payload||""),P=m?await env.DB.prepare("SELECT * FROM payments WHERE id=?").bind(+m[1]).first():null;
    if(!P||P.uid!==q.from.id||P.status!=="new"||q.currency!=="XTR"||q.total_amount!==P.stars)fail("Счёт устарел. Открой Сокровищницу и попробуй заново");
    await payItem(env,P.uid,Object.assign({item:P.item},JSON.parse(P.p||"{}")),P.id)}
  catch(e){err=e instanceof GameError?e.message:"Не получилось, попробуй ещё раз"}
  return tgApi(env,"answerPreCheckoutQuery",err?{pre_checkout_query_id:q.id,ok:false,error_message:err}:{pre_checkout_query_id:q.id,ok:true})}
async function paidUpdate(env,uid,sp){const m=/^p(\d+)$/.exec(sp.invoice_payload||"");if(!m)return;
  const P=await env.DB.prepare("SELECT * FROM payments WHERE id=?").bind(+m[1]).first();if(!P)return;
  const r=await env.DB.prepare("UPDATE payments SET status='paid',charge=?,paid=? WHERE id=? AND status='new'").bind(String(sp.telegram_payment_charge_id||""),Date.now(),P.id).run();
  if(r.meta.changes!==1)return;   // уже обработан
  if(P.uid!==uid||sp.currency!=="XTR"||sp.total_amount!==P.stars)return payRefund(env,Object.assign(P,{charge:sp.telegram_payment_charge_id,uid}),"Сумма не совпала со счётом");
  await payApply(env,P.id)}
async function payRefund(env,P,msg){
  if(!/^sim/.test(String(P.charge||"")))await tgApi(env,"refundStarPayment",{user_id:P.uid,telegram_payment_charge_id:P.charge});
  await env.DB.prepare("UPDATE payments SET status='refund',res=? WHERE id=?").bind(JSON.stringify({err:msg}),P.id).run();
  await notify(env,P.uid,"↩️ "+msg+"\n\nЗвёзды ("+P.stars+" ⭐) вернулись на твой счёт.","🏪 Сокровищница",PAGE+"?shop=1")}
async function payApply(env,pid){const P=await env.DB.prepare("SELECT * FROM payments WHERE id=?").bind(pid).first();if(!P||P.status!=="paid")return;
  const d=JSON.parse(P.p||"{}"),I=SHOP[P.item];let res,msg="";
  try{
    if(I&&I.manual){res={manual:1};msg="👑 Ты купил «Карточку твоей мечты»! Это была шутка… но мы держим слово. Напиши @voinovadmin: какого героя нарисовать и какой номер поставить. Карточка будет только у тебя.";
      const u=await env.DB.prepare("SELECT COALESCE(nick,name) AS n FROM users WHERE id=?").bind(P.uid).first();
      for(const a of ADMINS)await notify(env,a,"💰 КУПИЛИ «Карточку мечты» за 5000 ⭐! Игрок "+((u&&u.n)||"?")+" (id "+P.uid+"). Ему сказано написать в @voinovadmin.","⚔️ Открыть")}
    else if(I){if(I.month){const n=((await env.DB.prepare("SELECT COUNT(*) AS n FROM payments WHERE item=? AND month=? AND status IN ('paid','done') AND id<?").bind(P.item,P.month,P.id).first())||{}).n||0;
        if(n>=I.month)fail("Мифические сундуки этого месяца раскупили на секунду раньше")}
      const u=await env.DB.prepare("SELECT name FROM users WHERE id=?").bind(P.uid).first();if(!u)fail("Игрок не найден");
      res=(await doAction(env,{id:P.uid,name:u.name||"Игрок"},"grant",Object.assign({},d,{item:P.item,pid:P.id}),{grant:true})).res;delete res.events;
      msg="🎁 «"+I.n+"» открыт! "+(res.cards&&res.cards.length?"Внутри "+res.cards.length+" "+(res.cards.some(c=>c.part)?"карточек и половинок":"карточек")+", ":"")+(res.sp?"+"+res.sp+" прокруток. ":"")+"Всё уже в игре."}
    else if(P.item==="num"){const c=await env.DB.prepare("SELECT id,sn FROM cards WHERE id=? AND owner=?").bind(d.card,P.uid).first();if(!c)fail("Карточка больше не у тебя, номер не поставлен");
      let r;try{r=await env.DB.prepare("UPDATE cards SET sn=?,nice=2 WHERE id=? AND owner=?").bind(d.sn,c.id,P.uid).run()}catch(e){if(/UNIQUE/i.test(String(e&&e.message||e)))fail("Номер "+fmtSn(d.sn)+" успели занять");throw e}
      if(r.meta.changes!==1)fail("Карточка больше не у тебя, номер не поставлен");res={card:c.id,sn:d.sn,old:c.sn};msg="✍️ Готово! Теперь у твоей карточки номер "+fmtSn(d.sn)+"."}
    else if(P.item==="fx"){const now=Date.now(),u=await env.DB.prepare("SELECT fx,fx_until FROM users WHERE id=?").bind(P.uid).first()||{};
      const until=d.forever?9e15:Math.max(now,u.fx===d.fx&&u.fx_until<9e15?u.fx_until:0)+NFX_DAYS*864e5;
      await env.DB.prepare("UPDATE users SET fx=?,fx_until=MAX(?,CASE WHEN fx=? THEN fx_until ELSE 0 END) WHERE id=?").bind(d.fx,until,d.fx,P.uid).run();delete topCache.nfx;
      res={fx:d.fx,until};msg="✨ Ник «"+NFX[d.fx]+"» включён "+(d.forever?"навсегда":"на "+NFX_DAYS+" дней")+"! Его видят все в топах, чате и на арене."}
    else fail("Нет такого товара")}
  catch(e){if(e instanceof GameError)return payRefund(env,P,e.message);throw e}   // другая ошибка: попробуем ещё раз в payTick
  await env.DB.prepare("UPDATE payments SET status='done',res=? WHERE id=? AND status='paid'").bind(JSON.stringify(res),P.id).run();
  delete topCache.donors;delete topCache.nfx;delete topCache.shopcomp;delete topCache.shopones;
  await notify(env,P.uid,msg,"🎴 Открыть игру")}
/* оплата прошла, а выдача упала (сервер перезапускался): добиваем раз в 5 секунд. И один раз включаем платежи в вебхуке бота */
async function payTick(env){
  for(const r of (await env.DB.prepare("SELECT id FROM payments WHERE status='paid' AND paid<? LIMIT 3").bind(Date.now()-20e3).all()).results)await payApply(env,r.id);
  if(!env.BOT_TOKEN||env.DEV==="1"||await cached("hookpay",600e3,()=>kvGet(env,"hook_pay_v1")))return;
  const w=await tgApi(env,"getWebhookInfo",{});if(!w.ok||!w.result||!w.result.url)return;
  const r=await tgApi(env,"setWebhook",{url:w.result.url,secret_token:await hookSecret(env),allowed_updates:["message","pre_checkout_query"]});
  if(r.ok){await kvSet(env,"hook_pay_v1",{t:Date.now()});delete topCache.hookpay}}
async function payStatus(env,me,p){const P=await env.DB.prepare("SELECT id,item,status,res FROM payments WHERE id=? AND uid=?").bind(p.pid|0,me.id).first();if(!P)fail("Нет такого счёта");
  return {pid:P.id,item:P.item,status:P.status,res:P.res?JSON.parse(P.res):null}}
/* топ донатеров месяца (без администраторов) и «Король Эпох» — первое место */
async function donors(env){return cached("donors",30e3,async()=>(await env.DB.prepare("SELECT p.uid,SUM(p.stars) AS s,COALESCE(u.nick,u.name) AS name FROM payments p JOIN users u ON u.id=p.uid WHERE p.month=? AND p.status='done' GROUP BY p.uid ORDER BY s DESC LIMIT 13").bind(monthOf(Date.now())).all()).results.filter(r=>!isAdmin(env,r.uid)).slice(0,10))}
async function nickFx(env){return cached("nfx",30e3,async()=>{const fx={};
  for(const r of (await env.DB.prepare("SELECT id,fx FROM users WHERE fx_until>? AND fx IS NOT NULL").bind(Date.now()).all()).results)fx[r.id]=r.fx;
  const d=await donors(env);return {nfx:fx,king:d.length?d[0].uid:0}})}
async function shopInfo(env,me){
  const comp=await cached("shopcomp",10e3,async()=>{const o={};for(const h of COMP)o[h]={l:0,r:0,full:0,e:[0,0,0]};
    for(const r of (await env.DB.prepare("SELECT h,f,part,COUNT(*) AS n FROM cards WHERE h>=? GROUP BY h,f,part").bind(NBASE).all()).results){const x=o[r.h];if(!x)continue;
      if(r.f===4)x.e[r.part|0]=1;else if(r.part===1)x.l+=r.n;else if(r.part===2)x.r+=r.n;else x.full+=r.n}return o});
  const mine=((await env.DB.prepare("SELECT SUM(stars) AS s FROM payments WHERE uid=? AND month=? AND status='done'").bind(me.id,monthOf(Date.now())).first())||{}).s||0;
  const u=await env.DB.prepare("SELECT fx,fx_until FROM users WHERE id=?").bind(me.id).first()||{};
  const ones=await cached("shopones",10e3,async()=>{const o={};for(const h of ONE)o[h]=null;
    for(const r of (await env.DB.prepare("SELECT c.h,COALESCE(u.nick,u.name) AS name,c.owner FROM cards c LEFT JOIN users u ON u.id=c.owner WHERE c.f=4 AND c.h>=?").bind(NBASE).all()).results)if(ONE.includes(r.h))o[r.h]={name:r.name||"Игрок",uid:r.owner};return o});
  return {comp,ones,mythLeft:await mythLeft(env),donors:await donors(env),mine,fx:u.fx_until>Date.now()?u.fx:null,fxUntil:u.fx_until||0}}
async function tgApi(env,method,body){let r;try{r=await fetch("https://api.telegram.org/bot"+env.BOT_TOKEN+"/"+method,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(body)})}catch(e){return {ok:false,description:"network"}}return r.json().catch(()=>({ok:false}))}
/* ---------- переезд на свой сервер: выгрузка базы и режим «технические работы» ----------
   Ключ выгрузки считается из токена бота, поэтому его знает только тот, у кого есть токен. */
async function exportKey(env){return hex(new Uint8Array(await crypto.subtle.digest("SHA-256",new TextEncoder().encode("export:"+env.BOT_TOKEN)))).slice(0,40)}
const EXPORT_TABLES=["users","cards","sales","stats","fights","chat","kv"];
async function exportChunk(env,url){
  const t=url.searchParams.get("table"),after=+url.searchParams.get("after")||0;
  if(url.searchParams.get("freeze")==="1"){await kvSet(env,"maintenance",{on:1,t:Date.now()});delete topCache.maint}
  if(url.searchParams.get("freeze")==="0"){await kvSet(env,"maintenance",{on:0});delete topCache.maint}
  if(!t)return J({ok:true,tables:EXPORT_TABLES});
  if(!EXPORT_TABLES.includes(t))return J({ok:false,err:"нет такой таблицы"},400);
  const key=t==="stats"||t==="kv"?"rowid":(t==="users"?"id":"id");
  const rows=(await env.DB.prepare(`SELECT ${key} AS _k,* FROM ${t} WHERE ${key}>? ORDER BY ${key} LIMIT 500`).bind(after).all()).results;
  return J({ok:true,table:t,rows,last:rows.length?rows[rows.length-1]._k:null,done:rows.length<500});
}
async function maintenance(env){return cached("maint",5e3,async()=>{try{const m=await kvGet(env,"maintenance");return !!(m&&m.on)}catch(e){return false}})}
async function hookSecret(env){return hex(new Uint8Array(await crypto.subtle.digest("SHA-256",new TextEncoder().encode("hook:"+env.BOT_TOKEN)))).slice(0,48)}
async function setup(env,origin){const out={};
  out.webhook=await tgApi(env,"setWebhook",{url:origin+"/tg",secret_token:await hookSecret(env),allowed_updates:["message","pre_checkout_query"]});
  out.name=await tgApi(env,"setMyName",{name:BOT_TEXT.name});
  out.short=await tgApi(env,"setMyShortDescription",{short_description:BOT_TEXT.short});
  out.desc=await tgApi(env,"setMyDescription",{description:BOT_TEXT.desc});
  out.cmds=await tgApi(env,"setMyCommands",{commands:BOT_TEXT.cmds});
  out.menu=await tgApi(env,"setChatMenuButton",{menu_button:{type:"web_app",text:"Играть",web_app:{url:PAGE}}});
  const ok=Object.values(out).every(r=>r&&r.ok);
  return new Response((ok?"✅ Готово! Бот настроен: приветствие, описание, команды и кнопка «Играть».":"⚠️ Не всё получилось, подробности ниже. Если ошибка про токен, проверь секрет BOT_TOKEN.")+"\n\n"+Object.entries(out).map(([k,v])=>k+": "+(v&&v.ok?"ok":JSON.stringify(v))).join("\n"),{headers:{"Content-Type":"text/plain; charset=utf-8"}});
}
async function onUpdate(env,upd){
  if(upd.pre_checkout_query)return preCheckout(env,upd.pre_checkout_query);
  if(upd.message&&upd.message.successful_payment&&upd.message.from)return paidUpdate(env,upd.message.from.id,upd.message.successful_payment);
  const m=upd.message;if(!m||!m.chat||m.chat.type!=="private"||!m.from)return;
  const text=String(m.text||""),[cmd,arg]=text.split(/\s+/),name=String(m.from.first_name||"воин").slice(0,32);
  const play=(t,url)=>({inline_keyboard:[[{text:t,web_app:{url:url||PAGE}}],[{text:"📣 Канал игры",url:"https://t.me/"+CHANNEL.slice(1)}]]});
  if(cmd==="/start"&&arg&&/^(r_\d+|s_[A-Za-z0-9_-]{1,32})$/.test(arg)){await createUser(env,{id:m.from.id,name,start:arg});await trackSrc(env,{id:m.from.id,start:arg})}   // приглашение по ссылке ?start=r_<id>
  try{await env.DB.prepare("UPDATE users SET pm=1 WHERE id=?").bind(m.from.id).run()}catch(e){}   // написал боту: можно присылать напоминания
  if(cmd==="/invite"){
    const link="https://t.me/"+(env.BOT_USERNAME||"VoinyEpohBot")+"?startapp=r_"+m.from.id;
    return tgApi(env,"sendMessage",{chat_id:m.chat.id,text:"Твоя ссылка для друзей:\n"+link+"\n\nЗа каждого нового игрока, который зайдёт по ней, ты получишь +10 прокруток 🎁",
      reply_markup:{inline_keyboard:[[{text:"📤 Отправить другу",url:"https://t.me/share/url?url="+encodeURIComponent(link)+"&text="+encodeURIComponent("Залетай в «Воины Эпох»: крути карточки воинов и собирай легенды!")}]]}})}
  if(cmd==="/help")return tgApi(env,"sendMessage",{chat_id:m.chat.id,text:"Как играть:\n\n🎴 Жми «Играть» и открывай карточки. 3 бесплатные прокрутки каждые 4 часа\n💎 Редкость, отделка и номер решают цену. Красивые номера (777 777, 000 001) стоят дороже\n🔥 Закаляй воинов до ★5 и качай уровень в боях и походах\n🛒 Продавай и покупай карточки на рынке у других игроков\n🏆 Смотри своё место в топе мира\n\n🎁 +10 прокруток за подписку на "+CHANNEL+" и за каждого друга (/invite)\n\n🐞 Нашёл баг или есть вопрос? Пиши @voinovadmin",reply_markup:play("⚔️ Играть")});
  return tgApi(env,"sendPhoto",{chat_id:m.chat.id,photo:PAGE+"assets/welcome.png",
    caption:"Привет, "+name+"! Добро пожаловать в «Воины Эпох» ⚔️\n\nТебя ждут 5 бесплатных прокруток. Открой первую карточку, вдруг выпадет легенда?\n\n🎁 +10 прокруток за подписку на "+CHANNEL+" и за каждого друга",
    reply_markup:play("⚔️ Играть")});
}

/* ---------- челлендж «Кто пригласит больше друзей» ----------
   Считаются новые игроки, пришедшие по ссылке в окно челленджа и открывшие хотя бы CHAL_OPEN карточек
   (чтобы «пустые» аккаунты не засчитывались). Друг друга (2-й уровень) засчитывается и пригласившему, и его пригласившему.
   Рассылка ботом в слоты (минское время), итоги — в конце. Настройки можно переопределить в kv "chal". */
const CHAL_OPEN=3,CHAL_LATE=50*60e3;
/* розыгрыш (lot): от C.min друзей — участник, каждый друг = билет, победитель один, выбирается случайно по билетам */
const CHAL_DEFAULT={id:"2026-10-23",lot:1,min:3,start:Date.UTC(2026,9,23,5,30),end:Date.UTC(2026,9,23,19),prizes:["$20"],slots:[8.5,11.5,14.5,17.5,19,20,21],chanSlots:[8.5,10,14,17.5,21],chan:"@voinyepoh"};
async function chalCfg(env){return await cached("chalcfg",30e3,async()=>{const k=await kvGet(env,"chal");return k&&k.id!=="2026-10-22"?k:CHAL_DEFAULT})}   // старый конкурс в kv не мешает новому
const tk=n=>n+" "+(n%10===1&&n%100!==11?"билет":n%10>=2&&n%10<=4&&(n%100<12||n%100>14)?"билета":"билетов");
const lotIn=(C,rows)=>rows.filter(r=>r.n>=C.min);
/* честный выбор победителя: случайное число по сумме билетов */
function lotDraw(C,rows){const P=lotIn(C,rows),T=P.reduce((a,r)=>a+r.n,0);if(!T)return null;const b=new Uint32Array(1);crypto.getRandomValues(b);let x=b[0]%T;for(const r of P){x-=r.n;if(x<0)return r}return P[P.length-1]}
async function chalBoard(env,C){return await cached("chalb",20e3,async()=>{
  const q="json_extract(c.state,'$.day.opened')>=? AND c.created>=? AND c.created<?";
  const d=(await env.DB.prepare("SELECT c.ref AS uid,COUNT(*) AS n FROM users c WHERE c.ref IS NOT NULL AND "+q+" GROUP BY c.ref").bind(CHAL_OPEN,C.start,C.end).all()).results;
  const l2=(await env.DB.prepare("SELECT p.ref AS uid,COUNT(*) AS n FROM users c JOIN users p ON c.ref=p.id WHERE p.ref IS NOT NULL AND p.ref<>c.id AND "+q+" GROUP BY p.ref").bind(CHAL_OPEN,C.start,C.end).all()).results;
  const m=new Map();for(const r of d)m.set(r.uid,{uid:r.uid,d:r.n,l2:0});for(const r of l2){const o=m.get(r.uid)||{uid:r.uid,d:0,l2:0};o.l2=r.n;m.set(r.uid,o)}
  let rows=[...m.values()].filter(r=>!isAdmin(env,r.uid)).map(r=>(r.n=r.d+r.l2,r));
  // при равенстве выше тот, кто раньше набрал счёт: по времени регистрации последнего засчитанного друга
  if(rows.length){const ids=rows.map(r=>r.uid);const nm=new Map();
    for(let i=0;i<ids.length;i+=90){const part=ids.slice(i,i+90);
      for(const u of (await env.DB.prepare("SELECT u.id,COALESCE(u.nick,u.name) AS name,u.vip_until,(SELECT MAX(c.created) FROM users c LEFT JOIN users p ON c.ref=p.id WHERE (c.ref=u.id OR p.ref=u.id) AND c.created>=? AND c.created<?) AS last FROM users u WHERE u.id IN ("+part.map(()=>"?").join(",")+")").bind(C.start,C.end,...part).all()).results)nm.set(u.id,u)}
    rows=rows.map(r=>{const u=nm.get(r.uid)||{};return {...r,name:u.name||"Игрок",vip:(u.vip_until||0)>Date.now()?1:0,last:u.last||0}})}
  rows.sort((a,b)=>b.n-a.n||b.d-a.d||a.last-b.last);return rows})}
const chalPhase=(C,now)=>now<C.start?"soon":now<C.end?"on":"done";
async function chalGet(env,me){const C=await chalCfg(env),now=Date.now();if(!C||now>=C.end)return null;   // конкурс закончился — блок с таблицей убираем
  const fin=now>=C.end?await kvGet(env,"chal_res:"+C.id):null,rows=fin?fin.rows:(now<C.start?[]:await chalBoard(env,C));
  const i=rows.findIndex(r=>r.uid===me.id),mine=i>=0?{...rows[i],place:i+1}:{d:0,l2:0,n:0,place:0};
  return {id:C.id,start:C.start,end:C.end,left:Math.max(0,(now<C.start?C.start:C.end)-now),phase:chalPhase(C,now),prizes:C.prizes,need:CHAL_OPEN,x2:now>=C.start&&now<C.end?1:0,
    top:rows.slice(0,10).map((r,k)=>({place:k+1,name:r.name,n:r.n,d:r.d,l2:r.l2,vip:r.vip,me:r.uid===me.id?1:0})),me:{n:mine.n,d:mine.d,l2:mine.l2,place:mine.place},total:rows.length,
    lot:C.lot?1:0,min:C.min||0,tickets:C.lot?lotIn(C,rows).reduce((a,r)=>a+r.n,0):0,players:C.lot?lotIn(C,rows).length:0}}
const fmtLeft=ms=>{const m=Math.max(0,Math.round(ms/60e3));return ((m>=60?Math.floor(m/60)+" ч ":"")+(m%60?(m%60)+" мин":"")).trim()||"0 мин"};
const hmM=t=>{const d=new Date(t+TZ);return d.getUTCHours()+":"+String(d.getUTCMinutes()).padStart(2,"0")};
const MEDAL=["🥇","🥈","🥉"],frN=n=>n+" "+(n%10===1&&n%100!==11?"друг":n%10>=2&&n%10<=4&&(n%100<12||n%100>14)?"друга":"друзей");
function chalPrizes(C){return MEDAL.map((m,k)=>m+" подарок Telegram на "+C.prizes[k]).join("\n")+"\nПриз можно забрать подарком или звёздами ⭐"}
const LOT_PAID="✅ Все призы прошлого конкурса мы выплатили — отзывы победителей можно посмотреть в чате.";
function lotHook(C,rows){const P=lotIn(C,rows),T=P.reduce((a,r)=>a+r.n,0);
  return P.length?"🎟 В розыгрыше уже "+P.length+" "+(P.length%10===1&&P.length%100!==11?"участник":P.length%10>=2&&P.length%10<=4&&(P.length%100<12||P.length%100>14)?"участника":"участников")+" и "+tk(T)+". Пригласи "+frA(C.min)+" — и ты в игре!":"🎟 В розыгрыше пока никого! Пригласи "+frA(C.min)+" — и шанс забрать $20 почти 100%!"}
function lotText(C,slot,rows,now){const last=slot===C.slots.length-1,hook=lotHook(C,rows);
  if(slot===0)return "🎟 СТАРТ! РОЗЫГРЫШ "+C.prizes[0]+" — ВЫИГРАТЬ МОЖЕТ ЛЮБОЙ\n\nСегодня до "+hmM(C.end)+" зови друзей в «Воины Эпох»:\n\n👥 "+frA(C.min)+" — и ты участник розыгрыша\n🎟 Каждый друг = 1 билет. Больше друзей — больше шанс\n🏆 Победитель один: подарок Telegram на "+C.prizes[0]+" или звёзды\n\nМы учли ваши пожелания: теперь не нужно обгонять лидера — повезти может каждому!\n\n"+LOT_PAID+"\n\n"+CHAL_X2+"\n\nЖми «Пригласить» и отправляй ссылку 👇";
  return (last?"⏰ ПОСЛЕДНИЙ ЧАС! До розыгрыша "+fmtLeft(C.end-now):"🎟 РОЗЫГРЫШ "+C.prizes[0]+" ИДЁТ — до конца "+fmtLeft(C.end-now))+"\n\n"+hook+"\n\n🎟 Каждый друг = +1 билет. Друг твоего друга тоже считается!\n\n"+CHAL_X2+"\n\nВ "+hmM(C.end)+" бот выберет победителя случайно по билетам 👇"}
function chalText(C,slot,rows,now){if(C.lot)return lotText(C,slot,rows,now);const last=slot===C.slots.length-1,pr=chalPrizes(C);
  const top=rows.slice(0,3).map((r,k)=>MEDAL[k]+" "+r.name+" — "+r.n).join("\n");
  if(C.ext&&C.slots[slot]===C.ext)return "⏰ ВЫ ПРОСИЛИ — МЫ ПРОДЛИЛИ!\n\nМногие были на работе, в школе и по делам и не успели позвать друзей. Поэтому челлендж продлён до "+hmM(C.end)+"! 🔥\n\n"+chalHook(C,rows)+"\n\n"+(top?"Сейчас в топе:\n"+top+"\n\n":"")+"Призы:\n"+pr+"\n\n"+CHAL_X2+"\n\nЖми «Пригласить» и отправляй ссылку 👇";
  if(slot===0)return "🔥 СТАРТ! ЧЕЛЛЕНДЖ ДНЯ: КТО ПРИГЛАСИТ БОЛЬШЕ ДРУЗЕЙ\n\nПрямо сейчас и до "+hmM(C.end)+" зови друзей в «Воины Эпох». Топ-3 получают призы:\n"+pr+"\n\n👥 Считаются только друзья, пришедшие сегодня по твоей ссылке. Позовёт твой друг своего друга — он засчитается и тебе!\n✅ Друг засчитывается, когда откроет "+CHAL_OPEN+" карточки.\n\n📊 Таблица лидеров — в игре на вкладке «Крутить». Жми «Пригласить» и отправляй ссылку!";
  return (last?"⏰ ФИНАЛЬНЫЙ РЫВОК — до конца челленджа "+fmtLeft(C.end-now)+"!":"⚡ ЧЕЛЛЕНДЖ ИДЁТ — до конца "+fmtLeft(C.end-now))+"\n\n"+chalHook(C,rows)+"\n\n"+(top?"Сейчас в топе:\n"+top+"\n\n":"")+CHAL_X2+"\n\nПризы:\n"+pr+"\n\nЗовёшь друга — +1. Он зовёт своего — тебе тоже +1. Итоги в "+hmM(C.end)+" 👇"}
const CHAL_X2="🔥 До 22:00 награда ×2: +"+20+" прокруток за каждого друга, а другу — гарантированная эпическая карточка!";
const frA=n=>n+" "+(n%10===1&&n%100!==11?"друга":"друзей");
function chalHook(C,rows){const L=rows[0];if(!L)return "🤯 В таблице пока пусто! Пригласи 1 друга — и ты сразу на 1 месте с подарком на "+C.prizes[0]+"!";
  if(L.n<=5)return "🤯 ШАНС ОГРОМНЫЙ! У лидера всего "+frN(L.n)+". Пригласи "+frA(L.n+1)+" — и ты на 1 месте с подарком на "+C.prizes[0]+"!";
  return "🏆 У лидера "+frN(L.n)+". Обгони его — и подарок на "+C.prizes[0]+" твой!"}
/* посты в канал: бот должен быть админом канала с правом публикации */
/* посты в канал по своему расписанию (C.chanSlots), если оно задано */
function lotChan(C,k,now,rows){const bot="\n\n👉 @VoinyEpohBot",S=C.chanSlots,h=lotHook(C,rows||[]);
  if(k===0)return chanPost(C,0,now,rows);
  if(k===S.length-1)return {text:"⏰ ПОСЛЕДНИЙ ЧАС! До розыгрыша "+C.prizes[0]+" — "+fmtLeft(C.end-now)+"\n\n"+h+"\n\nВ "+hmM(C.end)+" бот случайно выберет победителя по билетам. Ещё можно успеть 🔥"+bot};
  const T=[null,"☕ Доброе утро, воины! Розыгрыш "+C.prizes[0]+" уже идёт","⚡ Розыгрыш "+C.prizes[0]+" в самом разгаре","🔥 До розыгрыша "+C.prizes[0]+" осталось "+fmtLeft(C.end-now)][k]||"🎟 Розыгрыш "+C.prizes[0]+" идёт";
  return {text:T+"\n\n"+h+"\n\n👥 Пригласи "+frA(C.min)+" — и ты участник\n🎟 Каждый друг = +1 билет, друг твоего друга тоже считается\n🏆 Победитель один — выбираем в "+hmM(C.end)+"\n\n"+CHAL_X2+bot}}
function chanPost(C,slot,now,rows){rows=rows||[];if(C.lot){const bot="\n\n👉 @VoinyEpohBot";
  if(slot===0)return {photo:1,text:"🎟 РОЗЫГРЫШ "+C.prizes[0]+" — ВЫИГРАТЬ МОЖЕТ ЛЮБОЙ!\n\nСегодня с "+hmM(C.start)+" до "+hmM(C.end)+":\n👥 Пригласи "+frA(C.min)+" в «Воины Эпох» — и ты в розыгрыше\n🎟 Каждый друг = 1 билет: больше друзей — больше шанс\n🏆 Победитель один — подарок Telegram на "+C.prizes[0]+" или звёзды\n\nВы просили — мы сделали: теперь не нужно быть первым, повезти может каждому 🍀\n\n"+LOT_PAID+"\n\n"+CHAL_X2+bot};
  if(slot===C.slots.length-1)return {text:"⏰ До розыгрыша "+C.prizes[0]+" остался "+fmtLeft(C.end-now)+"!\n\n"+lotHook(C,rows)+"\n\nВ "+hmM(C.end)+" бот случайно выберет победителя по билетам. Успей позвать друзей 🔥"+bot};
  if(C.slots[slot]===14.5)return {text:"⚡ Половина дня позади — розыгрыш "+C.prizes[0]+" в "+hmM(C.end)+"!\n\n"+lotHook(C,rows)+"\n\n🎟 Каждый друг = +1 билет"+bot};
  return null}const pr=chalPrizes(C),bot="\n\n👉 @VoinyEpohBot",hook=chalHook(C,rows)+"\n\n"+CHAL_X2+"\n\n";
  if(slot===0)return {photo:1,text:"🔥 ЧЕЛЛЕНДЖ ДНЯ — разыгрываем подарки Telegram!\n\nСегодня с "+hmM(C.start)+" до "+hmM(C.end)+": кто пригласит больше друзей в «Воины Эпох», тот забирает приз 👇\n"+pr+"\n\n💡 Фишка: если твой друг позовёт своего друга, он засчитается и тебе. Чем длиннее цепочка, тем выше ты в таблице!\n\n📊 Таблица лидеров онлайн — вкладка «Крутить»"+bot};
  const H=C.slots[slot];if(H===C.ext)return null;
  if(slot===C.slots.length-1)return {text:"⏰ До конца челленджа "+fmtLeft(C.end-now)+"!\n\n"+hook+"В "+hmM(C.end)+" таблица замирает, и топ-3 получают подарки Telegram. Успей позвать ещё пару друзей 🔥"+bot};
  if(H===14.5)return {text:"⚡ Половина челленджа позади!\n\n"+hook+"Открой игру, глянь таблицу на вкладке «Крутить» и кинь ссылку в пару чатов.\n\nДо "+hmM(C.end)+bot};
  return null}
async function chanSend(env,C,P){if(!C.chan||!env.BOT_TOKEN||env.DEV==="1"&&!env.NOTIFY_TEST)return false;
  const kb={inline_keyboard:[[{text:"⚔️ Играть",url:"https://t.me/VoinyEpohBot"}]]};
  try{const r=P.photo?await tgApi(env,"sendPhoto",{chat_id:C.chan,photo:PAGE+(C.lot?"assets/post-lottery.jpg?v=1":"assets/post-challenge.jpg?v=2"),caption:P.text,reply_markup:kb}):await tgApi(env,"sendMessage",{chat_id:C.chan,text:P.text,reply_markup:kb});return !!r.ok}catch(e){return false}}
async function chanCheck(env,C){if(!C.chan||!env.BOT_TOKEN||env.DEV==="1"&&!env.NOTIFY_TEST)return;const now=Date.now();
  const k=(await kvGet(env,"chan_chk:"+C.id))||{ok:0,at:0,warned:0};if(k.ok||now-k.at<10*60e3)return;k.at=now;
  let ok=false;try{const r=await tgApi(env,"getChatMember",{chat_id:C.chan,user_id:+String(env.BOT_TOKEN).split(":")[0]});ok=!!(r.ok&&(r.result.status==="creator"||r.result.status==="administrator"&&r.result.can_post_messages))}catch(e){}
  if(ok){k.ok=1;for(const a of ADMINS)await notify(env,a,"✅ Бот может публиковать в канал "+C.chan+". Посты выйдут сами: "+(C.chanSlots||C.slots.filter((s,i)=>i===0||i>=C.slots.length-2)).map(h=>Math.floor(h)+":"+String(Math.round(h%1*60)).padStart(2,"0")).join(", ")+" и итоги в "+hmM(C.end)+".","⚔️ Открыть")}
  else if(!k.warned){k.warned=1;for(const a of ADMINS)await notify(env,a,"⚠️ Бот не может публиковать в канал "+C.chan+".\n\nДобавь @VoinyEpohBot администратором канала с правом «Публикация сообщений» — я проверю снова через 10 минут.","⚔️ Открыть")}
  await kvSet(env,"chan_chk:"+C.id,k)}
let chalBusy=null;
async function chalTick(env){if(chalBusy)return chalBusy;chalBusy=(async()=>{const C=await chalCfg(env),now=Date.now();if(!C||now>C.end+36e5)return;
  if(now<C.end)await chanCheck(env,C);
  if(now<C.start-3600e3)return;
  const st=(await kvGet(env,"chal_st:"+C.id))||{slot:-1,after:0,fin:0,ch:{}};st.ch=st.ch||{};
  // итоги: фиксируем таблицу и пишем победителям, админу и в канал
  if(now>=C.end&&!st.fin){delete topCache.chalb;const rows=(await chalBoard(env,C)).slice(0,50);await kvSet(env,"chal_res:"+C.id,{rows,at:now});st.fin=1;st.res=0;await kvSet(env,"chal_st:"+C.id,st)}
  if(st.fin===1&&!st.res&&C.lot){st.res=1;await kvSet(env,"chal_st:"+C.id,st);const R=(await kvGet(env,"chal_res:"+C.id))||{},rows=R.rows||[];
    const all=await chalBoard(env,C),P=lotIn(C,all),T=P.reduce((a,r)=>a+r.n,0),W=lotDraw(C,all);R.winner=W||null;R.players=P.length;R.tickets=T;await kvSet(env,"chal_res:"+C.id,R);
    if(W)await notify(env,W.uid,"🎉 ТЫ ВЫИГРАЛ РОЗЫГРЫШ "+C.prizes[0]+"!\n\nУ тебя было "+tk(W.n)+" из "+T+" — и удача выбрала тебя 🍀\n\nТвой приз: подарок Telegram на "+C.prizes[0]+" или звёзды на ту же сумму. Напиши @voinovadmin, что выбираешь, и пришли свой ID: "+W.uid,"⚔️ Играть");
    for(const a of ADMINS)await notify(env,a,"🎟 Розыгрыш "+C.id+": участников "+P.length+", билетов "+T+".\n\nПобедитель: "+(W?W.name+" (id "+W.uid+") — "+tk(W.n)+" (сам "+W.d+" + друзья "+W.l2+")":"никто не набрал "+C.min+" друзей")+"\n\nВсе участники:\n"+(P.slice(0,30).map(r=>r.name+" (id "+r.uid+") — "+tk(r.n)).join("\n")||"—")+"\n\nПеред выдачей проверь, что друзья живые.","⚔️ Открыть");
    await chanSend(env,C,{text:W?"🎉 ИТОГИ РОЗЫГРЫША "+C.prizes[0]+"\n\nУчастников: "+P.length+", билетов: "+T+"\n🍀 Победитель: "+W.name+" ("+tk(W.n)+")!\n\nПоздравляем! Бот уже написал победителю в личку 🎁 Спасибо всем, кто звал друзей — следующий розыгрыш скоро 🔥\n\n👉 @VoinyEpohBot":"🎟 Розыгрыш завершён: никто не набрал "+frA(C.min)+". Приз переносится на следующий розыгрыш — он будет ещё больше 🔥\n\n👉 @VoinyEpohBot"});
    return}
  if(st.fin===1&&!st.res){const rows=((await kvGet(env,"chal_res:"+C.id))||{}).rows||[];st.res=1;await kvSet(env,"chal_st:"+C.id,st);
    for(let k=0;k<3&&k<rows.length;k++)await notify(env,rows[k].uid,MEDAL[k]+" Поздравляем! Ты занял "+(k+1)+" место в челлендже: "+frN(rows[k].n)+".\n\nТвой приз: подарок Telegram на "+C.prizes[k]+" или звёзды на ту же сумму. Напиши @voinovadmin, что выбираешь, и пришли свой ID: "+rows[k].uid,"⚔️ Играть");
    const list=rows.slice(0,10).map((r,k)=>(k+1)+". "+r.name+" (id "+r.uid+") — "+r.n+" (сам "+r.d+" + друзья "+r.l2+")").join("\n")||"никого";
    for(const a of ADMINS)await notify(env,a,"🏁 Итоги челленджа "+C.id+":\n\n"+list+"\n\nПеред выдачей проверь, что друзья живые (не пустые аккаунты).","⚔️ Открыть");
    if(rows.length)await chanSend(env,C,{text:"🏁 ИТОГИ ЧЕЛЛЕНДЖА\n\n"+rows.slice(0,3).map((r,k)=>MEDAL[k]+" "+r.name+" — "+frN(r.n)+" → подарок на "+C.prizes[k]).join("\n")+"\n\nПобедителям бот уже написал в личку 🎁 Спасибо всем, кто звал друзей — нас стало больше 🔥\n\n👉 @VoinyEpohBot"});
    return}
  // рассылка по слотам (часы по Минску, можно дробные: 8.5 = 8:30)
  const h=new Date(now+TZ),day0=Date.UTC(h.getUTCFullYear(),h.getUTCMonth(),h.getUTCDate())-TZ,slotAt=k=>day0+C.slots[k]*36e5;
  if(C.chanSlots){st.cs=st.cs||{};for(let k=0;k<C.chanSlots.length;k++){const at=day0+C.chanSlots[k]*36e5;
    if(now>=at&&now<at+CHAL_LATE&&at>=C.start-3600e3&&at<C.end&&!st.cs[k]){st.cs[k]=1;await kvSet(env,"chal_st:"+C.id,st);const P=lotChan(C,k,now,now>=C.start?await chalBoard(env,C):[]);if(P)await chanSend(env,C,P)}}}
  let s=-1;for(let k=0;k<C.slots.length;k++)if(now>=slotAt(k)&&now<slotAt(k)+CHAL_LATE&&slotAt(k)>=C.start-3600e3&&slotAt(k)<C.end)s=k;
  if(s<0)return;
  if(!C.chanSlots&&!st.ch[s]){st.ch[s]=1;await kvSet(env,"chal_st:"+C.id,st);const P=chanPost(C,s,now,now>=C.start?await chalBoard(env,C):[]);if(P)await chanSend(env,C,P)}
  if(st.slot>s||st.slot===s&&st.done)return;
  if(st.slot!==s){st.slot=s;st.after=0;st.done=0;st.n=0}
  const rows=now>=C.start?await chalBoard(env,C):[],text=chalText(C,s,rows,now);
  const us=(await env.DB.prepare("SELECT id FROM users WHERE pm=1 AND id>? ORDER BY id LIMIT 25").bind(st.after).all()).results;
  for(const u of us){if(await notify(env,u.id,text,C.lot?"🎟 Мои билеты":"👥 Открыть таблицу",null,s===0?PAGE+(C.lot?"assets/post-lottery.jpg?v=1":"assets/post-challenge.jpg?v=2"):C.ext&&C.slots[s]===C.ext?PAGE+"assets/post-extend.jpg?v=1":null))st.n++;st.after=u.id}
  if(us.length<25)st.done=1;await kvSet(env,"chal_st:"+C.id,st)})().finally(()=>{chalBusy=null});return chalBusy}

/* ---------- топ лагеря: кто больше всех заработал рун за день и за неделю ---------- */
async function campTop(env,me,per){const w=per==="w",now=Date.now(),key=w?mskWeek(now):mskDay(now),kc=w?"camp_wk":"camp_dk",sc=w?"camp_wr":"camp_dr";
  const items=await cached("ctop"+per+key,6e3,async()=>(await env.DB.prepare(`SELECT id,COALESCE(nick,name) AS name,pioneer AS pi,vip_until AS vu,${sc} AS score FROM users WHERE ${kc}=? AND ${sc}>0 ORDER BY ${sc} DESC LIMIT 30`).bind(key).all()).results
    .map(r=>({uid:r.id,name:r.name||"Игрок",pi:r.pi||0,vip:(r.vu||0)>Date.now()?1:0,score:r.score})));
  const m=await env.DB.prepare(`SELECT ${kc} AS k,${sc} AS s FROM users WHERE id=?`).bind(me.id).first();const score=m&&m.k===key?m.s:0;
  const rank=score>0?((await env.DB.prepare(`SELECT COUNT(*)+1 AS n FROM users WHERE ${kc}=? AND ${sc}>?`).bind(key,score).first())||{}).n:null;
  const end=w?Date.parse(key+"T00:00:00Z")-3*3600e3+7*864e5:Date.parse(key+"T00:00:00Z")-3*3600e3+864e5;
  return {per:w?"w":"d",items,me:{rank,score},left:Math.max(0,end-now)}}
/* ---------- разовый пересчёт лагеря Царь_Татарстана после смены баланса (22.10) ----------
   Прогресс считается так, будто он играл столько же по новым правилам: ~15 000 рун за день, прокачка, которую на них можно купить.
   Остаётся первым в топе дня, получает 5 прокруток и личное сообщение. Выполняется один раз (флаг в kv). */
const fmtR=n=>String(Math.round(n||0)).replace(/\B(?=(\d{3})+(?!\d))/g," "),FIX_NICK="царь_татарстана",FIX_RUNES=15000;
async function fixTsar(env){if(await cached("fixT",60e3,()=>kvGet(env,"fix_tsar_v1")))return;
  const u=await env.DB.prepare("SELECT id,state,ver FROM users WHERE nick_key=? OR lower(nick)=?").bind(FIX_NICK,FIX_NICK).first();
  if(!u){await kvSet(env,"fix_tsar_v1",{t:Date.now(),res:"нет такого ника"});delete topCache.fixT;return}
  const st=JSON.parse(u.state||"{}"),now=Date.now(),C=camp(st,now),day=mskDay(now),week=mskWeek(now);
  const second=((await env.DB.prepare("SELECT MAX(camp_dr) AS m FROM users WHERE camp_dk=? AND id<>?").bind(day,u.id).first())||{}).m||0;
  const dR=Math.max(FIX_RUNES,second+1),before={runes:Math.floor(C.runes),lv:{...C.lv},t:C.t,dR:C.dR};
  C.lv={pw:3,en:2,rg:2,cr:1,sq:1};C.t=0;C.hp=TARGETS[0].hp;C.runes=2150;C.total=dR;C.en=campMax(C);C.at=now;C.fullAt=0;C.sqAt=now;
  C.dK=day;C.dR=dR;C.wK=week;C.wR=Math.max(dR,Math.min(C.wR||0,dR));
  st.notice="⚙️ Мы обновили баланс Тренировочного лагеря: прокачка была слишком дешёвой, и прогресс разгонялся за минуты.\n\nТвой результат пересчитан по новым правилам — так, будто ты тренировался столько же времени: "+fmtR(dR)+" рун за сегодня, часть прокачки сохранена, энергия полная.\n\n🏆 Ты остаёшься первым в топе лагеря за день!\n\nИзвини за неудобство — в подарок тебе 5 прокруток 🎁";
  const r=await env.DB.prepare("UPDATE users SET state=?,ver=?,gift_spins=gift_spins+5,camp_dk=?,camp_dr=?,camp_wk=?,camp_wr=?,camp_at=0 WHERE id=? AND ver=?")
    .bind(JSON.stringify(st),Math.floor(Math.random()*9e15)+1,day,dR,week,C.wR,u.id,u.ver).run();
  if(r.meta.changes!==1)return;   // игрок как раз что-то делает — попробуем через 5 секунд
  await kvSet(env,"fix_tsar_v1",{t:now,uid:u.id,before,after:{dR,lv:C.lv}});delete topCache.fixT;topCache={};
  await notify(env,u.id,st.notice,"🎯 Открыть лагерь",PAGE+"?camp=1");
  for(const a of ADMINS)await notify(env,a,"✅ Лагерь Царь_Татарстана пересчитан: было "+fmtR(before.dR||0)+" рун за день и прокачка "+JSON.stringify(before.lv)+", стало "+fmtR(dR)+" и "+JSON.stringify(C.lv)+". +5 прокруток выдано, сообщение отправлено.","⚔️ Открыть")}
/* ---------- разовая повторная отправка победителям челленджа 22.10 с правильным ником поддержки ---------- */
/* ---------- разовая «дерзкая» рассылка о розыгрыше: 23.10 в 17:00 (Минск), в канал и всем в бота ---------- */
const BLAST={id:"lot1700",chal:"2026-10-23",at:Date.UTC(2026,9,23,14,0)};
function blastText(C,rows){const P=lotIn(C,rows),T=P.reduce((a,r)=>a+r.n,0),left=fmtLeft(C.end-Date.now()),end=hmM(C.end);
  const tail="\n\n👥 Пригласи "+frA(C.min)+" — и ты в розыгрыше\n🎟 Каждый друг = +1 билет\n🏆 Победитель один — "+C.prizes[0]+" подарком Telegram или звёздами\n⏰ Розыгрыш в "+end+", осталось "+left;
  if(P.length===1)return "😳 ВЫ СЕРЬЁЗНО?\n\nВ розыгрыше "+C.prizes[0]+" участвует ВСЕГО ОДИН человек — "+P[0].name+".\n\nЕсли так и останется, в "+end+" он заберёт "+C.prizes[0]+" со стопроцентным шансом. Просто потому что позвал друзей, а вы — нет.\n\nВы реально дадите ему победить без боя? 🤨"+tail+"\n\nЗабери шанс себе 👇";
  if(!P.length)return "😳 ВЫ СЕРЬЁЗНО?\n\nДо розыгрыша "+C.prizes[0]+" — "+left+", а в нём НИ ОДНОГО участника.\n\nПервый, кто позовёт "+frA(C.min)+", заберёт приз со стопроцентным шансом. Это можешь быть ты 🤨"+tail+"\n\nЗабери приз себе 👇";
  return "😳 ВЫ СЕРЬЁЗНО?\n\nВ розыгрыше "+C.prizes[0]+" всего "+P.length+" "+(P.length%10>=2&&P.length%10<=4&&(P.length%100<12||P.length%100>14)?"участника":"участников")+" и "+tk(T)+". Шанс выиграть сейчас — как никогда!\n\nВы реально отдадите им приз без боя? 🤨"+tail+"\n\nЗабери шанс себе 👇"}
let blastBusy=false;
async function lotBlast(env){if(blastBusy)return;const now=Date.now();if(now<BLAST.at||now>BLAST.at+3*3600e3)return;
  const C=await chalCfg(env);if(!C||!C.lot||C.id!==BLAST.chal||now>=C.end)return;
  blastBusy=true;try{const st=(await kvGet(env,"blast:"+BLAST.id))||{ch:0,after:0,done:0,n:0};if(st.done&&st.ch)return;
    const rows=await chalBoard(env,C),text=blastText(C,rows);
    if(!st.ch){st.ch=1;await kvSet(env,"blast:"+BLAST.id,st);await chanSend(env,C,{text:text+"\n\n👉 @VoinyEpohBot"})}
    if(st.done)return;
    const us=(await env.DB.prepare("SELECT id FROM users WHERE pm=1 AND id>? ORDER BY id LIMIT 25").bind(st.after).all()).results;
    for(const u of us){if(await notify(env,u.id,text,"🎟 Пригласить друзей"))st.n++;st.after=u.id}
    if(us.length<25){st.done=1;for(const a of ADMINS)await notify(env,a,"✅ Рассылка 17:00 о розыгрыше: в канал и "+st.n+" игрокам.","⚔️ Открыть")}
    await kvSet(env,"blast:"+BLAST.id,st)}finally{blastBusy=false}}
/* ---------- герои дня: больше всех боёв, сделок на рынке и тапов. Награда — в полночь по Минску ---------- */
const DTOP={fight:{n:"Больше всех боёв",ic:"⚔️",u:"боёв"},trade:{n:"Больше всех сделок на рынке",ic:"🛒",u:"сделок"},tap:{n:"Больше всех тапов в лагере",ic:"🎯",u:"тапов"}},DTOP_PRIZE=[10,5,3],DTOP_MIN_PRICE=5;
const dtopLast=new Map();
async function dtopAdd(env,k,uid,n){if(!n||isAdmin(env,uid))return;
  if(k==="fight"){const t=dtopLast.get(uid)||0;if(Date.now()-t<4000)return;dtopLast.set(uid,Date.now())}   // бой засчитывается не чаще раза в 4 секунды
  try{await env.DB.prepare("INSERT INTO dtop(day,k,uid,n) VALUES(?,?,?,?) ON CONFLICT(day,k,uid) DO UPDATE SET n=n+excluded.n").bind(dayOf(Date.now()),k,uid,n).run()}catch(e){}}
async function dtopRows(env,day,k,lim){return (await env.DB.prepare("SELECT d.uid,d.n,COALESCE(u.nick,u.name) AS name FROM dtop d LEFT JOIN users u ON u.id=d.uid WHERE d.day=? AND d.k=? ORDER BY d.n DESC,d.uid LIMIT ?").bind(day,k,lim).all()).results}
async function dtopGet(env,me){const day=dayOf(Date.now()),now=Date.now(),left=(Math.floor((now+TZ)/864e5)+1)*864e5-TZ-now;
  const tops=await cached("dtop"+day,10e3,async()=>{const o={};for(const k in DTOP)o[k]=(await dtopRows(env,day,k,5)).map(r=>({uid:r.uid,name:r.name||"Игрок",n:r.n}));return o});
  const mine={};for(const r of (await env.DB.prepare("SELECT k,n FROM dtop WHERE day=? AND uid=?").bind(day,me.id).all()).results)mine[r.k]=r.n;
  return {left,prize:DTOP_PRIZE,cats:Object.keys(DTOP).map(k=>({k,n:DTOP[k].n,ic:DTOP[k].ic,u:DTOP[k].u,top:tops[k],me:mine[k]||0}))}}
async function dtopTick(env){const y=dayOf(Date.now()-864e5);if(((await kvGet(env,"dtop_paid"))||"")>=y)return;
  await kvSet(env,"dtop_paid",y);
  for(const k in DTOP){const rows=await dtopRows(env,y,k,3);
    for(let i=0;i<rows.length;i++){await env.DB.prepare("UPDATE users SET gift_spins=gift_spins+? WHERE id=?").bind(DTOP_PRIZE[i],rows[i].uid).run();
      await notify(env,rows[i].uid,MEDAL[i]+" Ты "+(i+1)+"-й в рейтинге «"+DTOP[k].n+"» за вчера: "+rows[i].n+" "+DTOP[k].u+"!\n\nДержи подарок: +"+DTOP_PRIZE[i]+" прокруток 🎁 Сегодня новая гонка — защищай место!","🎴 Забрать")}}}
async function resendWinners(env){if(await cached("rsw",60e3,()=>kvGet(env,"resend_win_v1")))return;
  const res=await kvGet(env,"chal_res:2026-10-22");if(!res){return}
  const rows=(res.rows||[]).slice(0,3),P=["$20","$10","$7"];await kvSet(env,"resend_win_v1",{t:Date.now(),n:rows.length});delete topCache.rsw;
  for(let k=0;k<rows.length;k++)await notify(env,rows[k].uid,"✏️ Поправка: в прошлом сообщении мы ошиблись в нике поддержки.\n\n"+MEDAL[k]+" Ты занял "+(k+1)+" место в челлендже: "+frN(rows[k].n)+"! Твой приз — подарок Telegram на "+P[k]+" или звёзды на ту же сумму.\n\nНапиши нам: @voinovadmin — что выбираешь, и пришли свой ID: "+rows[k].uid,"⚔️ Играть");
  for(const a of ADMINS)await notify(env,a,"✅ Победителям повторно отправлено сообщение с @voinovadmin: "+rows.map((r,k)=>(k+1)+". "+r.name+" (id "+r.uid+")").join(", "),"⚔️ Открыть")}
/* ---------- маршрутизация ---------- */
export default {
  async tick(env){await ensureSchema(env);if(await maintenance(env))return;await tourTick(env);try{await chalTick(env)}catch(e){console.error("chal",e)}try{await fixTsar(env)}catch(e){console.error("fix",e)}try{await resendWinners(env)}catch(e){console.error("rsw",e)}try{await payTick(env)}catch(e){console.error("pay",e)}try{await lotBlast(env)}catch(e){console.error("blast",e)}try{await dtopTick(env)}catch(e){console.error("dtop",e)}try{await rkTick(env);await rkSeasonTick(env)}catch(e){console.error("rk",e)}},
  async scheduled(event,env,ctx){ctx.waitUntil(reminders(env).catch(e=>console.error("reminders",e)))},
  async fetch(req,env){try{return await handle(req,env)}catch(e){console.error("fatal",e);return J({ok:false,err:"Сервер перегружен, попробуй через минуту"},503)}}
};
async function handle(req,env){{
    if(req.method==="OPTIONS")return new Response(null,{headers:CORS});
    const url=new URL(req.url);
    if(req.method==="GET"&&url.pathname==="/setup"){await ensureSchema(env);return setup(env,url.origin)}
    if(req.method==="GET"&&url.pathname==="/remind"&&env.DEV==="1")return J(await reminders(env));   // только для проверки
    if(req.method==="GET"&&url.pathname==="/export"){await ensureSchema(env);if(req.headers.get("X-Export-Key")!==await exportKey(env))return J({ok:false,err:"нет доступа"},403);return exportChunk(env,url)}
    if(req.method==="GET")return J({ok:true,game:"Воины Эпох",server:"работает"});
    if(url.pathname==="/tg"){   // сообщения боту от Telegram
      if(req.headers.get("X-Telegram-Bot-Api-Secret-Token")!==await hookSecret(env))return new Response("no",{status:403});
      await ensureSchema(env);try{await onUpdate(env,await req.json())}catch(e){console.error("bot",e)}return new Response("ok")}
    let me=null;
    await ensureSchema(env);
    if(await maintenance(env))return J({ok:false,err:"Технические работы: игра переезжает на новый сервер. Вернёмся через несколько минут ⚔️"});
    if(env.DEV==="1"&&req.headers.get("X-Dev-User"))me={id:+req.headers.get("X-Dev-User")||1,name:"Тестер "+req.headers.get("X-Dev-User"),start:req.headers.get("X-Dev-Start")||"",dev:1};
    else me=await checkInit(req.headers.get("X-Init-Data"),env.BOT_TOKEN);
    if(!me)return J({ok:false,err:"Открой игру через бота в Telegram"},401);
    let body;try{body=await req.json()}catch(e){return J({ok:false,err:"Плохой запрос"},400)}
    const a=String(body.a||""),p=body.p||{};
    await trackSrc(env,me);
    try{
      if(a==="market")return J({ok:true,res:await market(env,me),S:await stateFor(env,me)});
      if(a==="list"||a==="unlist"||a==="buy"){const res=await (a==="list"?list:a==="unlist"?unlist:buy)(env,me,p);const S=await stateFor(env,me);fixIds(res,S.cards);return J({ok:true,res,S})}
      if(a==="profile")return J({ok:true,res:await profile(env,p),S:await stateFor(env,me)});
      if(a==="card")return J({ok:true,res:await cardInfo(env,p),S:await stateFor(env,me)});
      if(a==="fduel"){const o=await cardInfo(env,{id:p.oppId});if(o.owner===me.id)fail("Это твоя же карточка");
        const r=await doAction(env,me,"fduel",{myId:p.myId,myStat:p.myStat,oppStat:p.oppStat,key:"c"+o.card.id,opp:o.card});
        await logFight(env,me,p.myId,o,r.res);if(r.res.first)await dtopAdd(env,"fight",me.id,1);return J({ok:true,...r})}
      if(a==="duel"){const stake=!!(p.mode|0);let o=null;
        if(!stake)o=await pickOpponent(env,me,p,false);
        else{const mu=await env.DB.prepare("SELECT stake FROM users WHERE id=?").bind(me.id).first();if(mu&&mu.stake)o=await pickOpponent(env,me,p,true)}
        const r=await doAction(env,me,"duel",p,o?{oppCard:o.card,oppName:o.name,oppUid:o.owner}:null);
        if(o)await logFight(env,me,p.id,o,r.res,stake);await dtopAdd(env,"fight",me.id,1);return J({ok:true,...r})}
      if(a==="pm_on"){await env.DB.prepare("UPDATE users SET pm=1 WHERE id=?").bind(me.id).run();return J({ok:true,res:{}})}
      if(a==="stake_set"){await env.DB.prepare("UPDATE users SET stake=? WHERE id=?").bind(p.on?1:0,me.id).run();return J({ok:true,res:{on:!!p.on},S:await stateFor(env,me)})}
      if(a==="chat_get")return J({ok:true,res:await chatGet(env,p)});
      if(a==="chat_send")return J({ok:true,res:await chatSend(env,me,p)});
      if(a==="chat_del"||a==="chat_mute")return J({ok:true,res:await chatAdmin(env,me,a,p)});
      if(a==="nick"){const res=await setNick(env,me,p);return J({ok:true,res,S:await stateFor(env,me)})}
      if(a==="top")return J({ok:true,...await top(env,me,p)});
      if(a==="sub_check"){const r=await subCheck(env,me);return J({ok:true,...r})}
      if(a==="sub_reward"||a==="pvp_result"||a==="tour_prize"||a==="grant"||a==="season_prize"||a==="trader_take"||a==="trader_give")fail("Неизвестное действие");
      if(a==="shop")return J({ok:true,res:await shopInfo(env,me)});
      if(a==="invoice")return J({ok:true,res:await invoice(env,me,p)});
      if(a==="pay_status")return J({ok:true,res:await payStatus(env,me,p),S:await stateFor(env,me)});
      if(a==="pay_sim"){if(env.PAY_SIM!=="1")fail("Неизвестное действие");const P=await env.DB.prepare("SELECT * FROM payments WHERE id=? AND uid=?").bind(p.pid|0,me.id).first();if(!P)fail("Нет такого счёта");
        await paidUpdate(env,me.id,{currency:"XTR",total_amount:P.stars,invoice_payload:"p"+P.id,telegram_payment_charge_id:"sim"+P.id});return J({ok:true,res:await payStatus(env,me,p),S:await stateFor(env,me)})}
      if(a==="dtop")return J({ok:true,res:await dtopGet(env,me)});
      if(a==="trader")return J({ok:true,res:await traderInfo(env,me)});
      if(a==="trader_buy"||a==="trader_sell"){const r=await (a==="trader_buy"?traderBuy:traderSell)(env,me,p);return J({ok:true,...r})}
      if(/^rk_/.test(a)){const res=await rkApi(env,me,a,p);return J({ok:true,res,S:(a==="rk_get"&&res.phase==="done")||a==="rk_find"?await stateFor(env,me):undefined})}
      if(a==="camp_top")return J({ok:true,res:await campTop(env,me,p.per==="w"?"w":"d")});
      if(a==="chal_get")return J({ok:true,res:await chalGet(env,me)});
      if(a==="chal_set"){if(!isAdmin(env,me.id))fail("Нет доступа");await kvSet(env,"chal",p.cfg||null);delete topCache.chalcfg;delete topCache.chalb;return J({ok:true,res:{}})}
      if(/^tour_/.test(a)){const res=await tourApi(env,me,a,p);return J({ok:true,res,S:a==="tour_get"?undefined:await stateFor(env,me)})}
      if(/^(arena_list|room_)/.test(a)){const res=await arena(env,me,a,p);const S=/^room_(create|join|cancel)$/.test(a)||(res&&res.phase==="done")?await stateFor(env,me):undefined;return J({ok:true,res,S})}
      if(a==="luck_set"&&!isAdmin(env,me.id))fail("Нет доступа");
      if(a==="promo_set"){if(!isAdmin(env,me.id))fail("Нет доступа");const h=Math.max(0,Math.min(72,+p.hours||0)),need=Math.max(1,Math.min(50,+p.need||2)),now=Date.now();
        await kvSet(env,"promo",h?{start:now,end:now+h*36e5,need}:{start:0,end:0,need});delete topCache.promo;return J({ok:true,res:{},S:await stateFor(env,me)})}
      if(a==="broadcast"){if(!isAdmin(env,me.id))fail("Нет доступа");const text=String(p.text||"").trim().slice(0,1500);if(!text)fail("Пустой текст");
        // не больше 40 сообщений за запрос (лимит Cloudflare), игра присылает следующие порции сама
        const rows=(await env.DB.prepare("SELECT id FROM users WHERE pm=1 AND id>? ORDER BY id LIMIT 40").bind(+p.after||0).all()).results;let sent=0;
        const photo=/^https:\/\/[^\s]{5,400}$/.test(String(p.photo||""))?String(p.photo):null;   // картинка к рассылке (подпись до 1024 символов)
        if(photo&&text.length>1024)fail("С картинкой текст должен быть не длиннее 1024 символов");
        for(const r of rows)if(await notify(env,r.id,text,"⚔️ Играть",null,photo))sent++;
        const total=((await env.DB.prepare("SELECT COUNT(*) AS n FROM users WHERE pm=1").first())||{}).n||0;
        return J({ok:true,res:{sent,last:rows.length?rows[rows.length-1].id:null,done:rows.length<40,total}})}
      if(a==="stats"){if(!isAdmin(env,me.id))fail("Нет доступа");return J({ok:true,res:await adminStats(env),S:await stateFor(env,me)})}
      if(a==="sync")return J({ok:true,res:{},S:await stateFor(env,me)});
      if(!ACTIONS[a])fail("Неизвестное действие");
      const r=await doAction(env,me,a,p);if(a==="camp_tap"&&r.res&&r.res.n)await dtopAdd(env,"tap",me.id,r.res.n);return J({ok:true,...r});
    }catch(e){
      if(e instanceof GameError)return J({ok:false,err:e.message});
      console.error(e);return J({ok:false,err:"Ошибка сервера"},500);
    }
  }
}
