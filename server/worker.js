// @ts-nocheck
// ⚠️ Файл собран автоматически из rules.js и server/server.js (tools/build_worker.py). Правь исходники, а не его.
/* rules.js — общие правила «Воинов Эпох».
   Этот файл работает и в браузере (локальный режим), и на сервере (Cloudflare Worker).
   Здесь нет ничего про интерфейс: только данные игры и действия, которые меняют состояние игрока. */

const DUEL_CAP=15000,CAP=40, REFILL_MS=4*3600e3, SPINS_MAX=10, PITY=30, LPITY=90, LMAX=10, FEE=.05, HOUSE=.9, PMAX=.8, EX_SLOTS=3, MAX_LOTS=5, QUICK=.85, START_CASH=100;
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
 ["Геракл","Древняя Греция",4,"Совершил двенадцать подвигов. Задушил немейского льва голыми руками.",{don:1,one:1,sn:"121212",hue:30,p:[9,7,5,8,7]}],
 /* коллаборация: одна карточка на весь мир, только приз розыгрыша. Продаётся только на рынке, цену ставит владелец */
 ["А777МР 77","Воины Эпох × Номерок",4,"Половина — из «Воинов Эпох», половина — из «Номерка». Единственный такой номер в мире.",{collab:1,plate:["А","777","МР","77"],sn:"777777",hue:190,p:[9,9,9,9,9]}],
 /* ===== Герои древности (обычные воины альбома, выпадают в прокрутках, бывают всех отделок и «Ошибкой печати») ===== */
 ["Пелтаст","Фракия",0,"Налетел, метнул дротик — и уже далеко. Ловить его бесполезно.",{base:1,helm:"phrygcap",weapon:"javelin",shield:"pelta",hue:25,skin:1,p:[3,1,5,2,3]}],
 ["Колесничий","Древний Египет",1,"Мчится на колеснице быстрее ветра, а лук всегда наготове.",{base:1,helm:"nemes",weapon:"bow",armor:"linen",hue:200,skin:2,p:[4,2,6,3,3]}],
 ["Бессмертный","Персия",1,"Персидская гвардия. Их всегда ровно десять тысяч — павшего сразу заменяют.",{base:1,helm:"tiara",weapon:"spear",shield:"wicker",armor:"scale",hue:275,skin:2,beard:"#1a1008",p:[4,4,3,4,4]}],
 ["Гектор","Троянская война",2,"Защитник Трои. Сражался за свой город до последнего вздоха.",{base:1,helm:"attic",crest:"#2f5fd0",bronze:1,weapon:"spear",shield:"troy",armor:"plate",cape:"#1f3fae",hue:220,skin:1,beard:"#2a1a10",p:[5,6,3,5,6]}],
 ["Аякс","Троянская война",2,"Великан с щитом размером с дверь — живая стена ахейского войска.",{base:1,helm:"corinth",crest:"#2a8a3a",bronze:1,weapon:"spear",shield:"tower",armor:"plate",hue:120,fierce:1,p:[5,7,2,6,4]}],
 ["Тесей","Мифы Греции",2,"Победил Минотавра и вышел из Лабиринта по нити Ариадны.",{base:1,hair:"curls",hairc:"#5a3a1a",weapon:"club",armor:"pelt",cape:"#c0392b",x:["thread"],hue:10,skin:1,p:[6,4,5,4,5]}],
 ["Ясон","Мифы Греции",2,"Капитан «Арго». Уплыл на край света за Золотым руном — и добыл его.",{base:1,hair:"curls",hairc:"#c98a2a",weapon:"sword",armor:"plate",bronze:1,cape:"#1f6fd0",x:["fleece"],hue:210,p:[5,4,5,5,6]}],
 ["Спартак","Древний Рим",2,"Гладиатор, который поднял восстание и заставил дрожать весь Рим.",{base:1,helm:"thraex",weapon:"sica",shield:"parma",armor:"cloth",hue:0,skin:1,fierce:1,p:[6,4,5,5,5]}],
 ["Ипполита","Древняя Греция",2,"Царица амазонок. Её волшебный пояс искал сам Геракл.",{base:1,female:1,hair:"braids",hairc:"#2a1a10",helm:"diadem",weapon:"labrys",shield:"pelta",cape:"#7a1fa8",x:["belt"],hue:300,p:[5,4,6,4,5]}],
 ["Клеопатра","Древний Египет",2,"Последняя царица Египта. Умна, хитра и опаснее любой армии.",{base:1,female:1,hair:"bob",hairc:"#0d0d14",helm:"vulture",weapon:"ankh",armor:"linen",x:["collar"],hue:45,skin:1,glow:"#3fe0d0",p:[4,3,4,5,7]}],
 ["Ахиллес","Троянская война",3,"Неуязвимый герой. Кроме пятки — но об этом лучше не напоминать.",{base:1,helm:"attic",crest:"#ffd60a",gold:1,weapon:"spear",shield:"achilles",armor:"lorica",cape:"#a3262a",x:["aura"],hue:0,p:[8,5,7,5,7]}],
 ["Одиссей","Троянская война",3,"Самый хитрый из героев. Это он придумал троянского коня.",{base:1,helm:"pileus",beard:"#5a3a1a",weapon:"bow",armor:"cloth",cape:"#1f3f6b",x:["horse"],hue:200,p:[5,4,7,5,8]}],
 ["Персей","Мифы Греции",3,"Отрубил голову Медузе, глядя на неё лишь в отражение щита.",{base:1,helm:"winged",weapon:"harpe",shield:"medusa",armor:"plate",cape:"#3a8fd0",hue:190,p:[7,5,7,4,6]}],
 ["Леонид","Спарта",3,"Царь Спарты. Триста воинов против целой армии — и ни шагу назад.",{base:1,helm:"corinth",crest:"#ffd60a",gold:1,weapon:"spear",shield:"hoplon",armor:"lorica",cape:"#7d1410",beard:"#2a1a10",fierce:1,x:["laurelk"],hue:0,p:[7,8,3,7,8]}],
 ["Ганнибал","Карфаген",3,"Перевёл боевых слонов через Альпы. Рим до сих пор не может прийти в себя.",{base:1,helm:"carth",bronze:1,weapon:"sword",armor:"lorica",cape:"#6a1fa8",x:["elephant"],hue:270,skin:2,beard:"#1a1008",p:[7,6,5,6,7]}],
 ["Рамзес II","Древний Египет",3,"Великий фараон. Строил храмы размером с горы и правил 66 лет.",{base:1,helm:"khepresh",weapon:"khopesh",armor:"linen",gold:1,cape:"#1f6fd0",x:["collar","aura"],hue:45,skin:2,glow:"#ffd60a",p:[7,6,5,7,7]}],
 ["Аттила","Степь",3,"Бич Божий. От топота его конницы дрожала вся Европа.",{base:1,helm:"hun",weapon:"saber",shield:"round",shc:"#5a3a1a",armor:"pelt",stache:"#1a1008",fierce:1,cape:"#4a2a12",hue:30,skin:1,p:[8,5,7,5,6]}],
 ["Александр Македонский","Македония",4,"Покорил полмира к тридцати годам и плакал, что завоёвывать больше нечего.",{base:1,helm:"phrygian",gold:1,weapon:"sarissa",shield:"vergina",armor:"lorica",cape:"#7a1fa8",x:["aura"],glow:"#ffd60a",hue:270,p:[8,7,7,7,9]}],
 ["Юлий Цезарь","Древний Рим",4,"Пришёл, увидел, победил. Три слова — и полмира у его ног.",{base:1,helm:"laurel",hairc:"#3a2a1a",weapon:"aquila",armor:"lorica",gold:1,cape:"#a3262a",x:["aura"],hue:0,p:[7,7,6,8,9]}],
 ["Гильгамеш","Месопотамия",4,"Царь Урука, на две трети бог. Дошёл до края света в поисках бессмертия.",{base:1,helm:"sumer",gold:1,weapon:"axe",armor:"scale",cape:"#1f7a6a",beardL:"#1a1008",x:["aura"],glow:"#ffb84d",hue:160,skin:2,p:[9,7,5,8,7]}],
 /* ещё две легенды 1 из 1 */
 ["Посейдон","Мифы Греции",4,"Владыка морей. Ударит трезубцем — и поднимется шторм на полмира.",{don:1,one:1,sn:"888888",hair:"long",hairc:"#e9f6ff",helm:"crownsea",weapon:"trident",armor:"scale",cape:"#0a5ab8",beard:"#e9f6ff",x:["waves","aura"],glow:"#5ac8fa",hue:195,skinc:"#9fd6e8",p:[9,8,6,8,9]}],
 ["Аид","Подземное царство",4,"Владыка мёртвых. Из его царства ещё никто не уходил.",{don:1,one:1,sn:"666666",hair:"long",hairc:"#14101c",helm:"crownhell",weapon:"bident",armor:"plate",cape:"#1a0a24",beard:"#14101c",x:["flames"],glow:"#9f6bff",fierce:1,hue:270,skinc:"#b9b2c9",p:[9,9,5,8,9]}],
 /* Близнецы: каждой карточки ровно 2 на весь мир (отделка «Близнец»). Выпадают в прокрутках и в Сундуке Близнецов */
 ["Ромул","Древний Рим",4,"Основал Рим. Его вместе с братом вскормила волчица.",{duo:1,pair:"Ромул и Рем",helm:"wolfhood",weapon:"sword",armor:"lorica",bronze:1,cape:"#a3262a",x:["wolf"],hue:0,p:[8,7,6,7,8]}],
 ["Рем","Древний Рим",4,"Брат-близнец Ромула. Перепрыгнул через стену — и поссорился навсегда.",{duo:1,pair:"Ромул и Рем",helm:"wolfhood",weapon:"spear",shield:"scutum",armor:"lorica",bronze:1,cape:"#7d1410",x:["wolf"],hue:20,p:[7,8,7,7,7]}],
 ["Кастор","Мифы Греции",4,"Укротитель коней, один из Диоскуров. Над ним горит звезда.",{duo:1,pair:"Диоскуры",helm:"pilos",weapon:"spear",armor:"plate",cape:"#1f6fd0",x:["star"],hue:215,p:[7,6,8,7,8]}],
 ["Поллукс","Мифы Греции",4,"Бессмертный кулачный боец, брат Кастора. Отдал полжизни ради брата.",{duo:1,pair:"Диоскуры",helm:"pilos",weapon:"none",armor:"lorica",bronze:1,cape:"#c0392b",x:["star","cestus"],fierce:1,hue:5,p:[9,7,6,8,7]}],
 ["Аполлон","Мифы Греции",4,"Бог солнца и музыки. Его стрелы не знают промаха.",{duo:1,pair:"Аполлон и Артемида",hair:"curls",hairc:"#f0c35a",helm:"suncrown",weapon:"bow",gold:1,armor:"lorica",cape:"#ff9f0a",x:["aura"],glow:"#ffd60a",hue:45,p:[8,6,7,7,9]}],
 ["Артемида","Мифы Греции",4,"Богиня охоты и луны, сестра-близнец Аполлона.",{duo:1,pair:"Аполлон и Артемида",female:1,hair:"pony",hairc:"#2a1a10",helm:"moondiadem",weapon:"bow",armor:"cloth",cape:"#2a4fb0",x:["moon"],glow:"#bfe3ff",hue:230,p:[8,6,9,6,8]}],
 ["Гипнос","Подземное царство",4,"Бог сна. Взмахнёт крыльями — и целая армия уснёт.",{duo:1,pair:"Гипнос и Танатос",hair:"curls",hairc:"#e9edf5",helm:"headwings",weapon:"staff",armor:"cloth",cape:"#4b3a8f",x:["wings"],glow:"#bf9bff",hue:255,skinc:"#e8dcf0",p:[7,6,7,8,9]}],
 ["Танатос","Подземное царство",4,"Бог смерти, брат-близнец Гипноса. Приходит тихо и не опаздывает.",{duo:1,pair:"Гипнос и Танатос",hair:"long",hairc:"#14101c",weapon:"scythe",armor:"cloth",cape:"#14101c",x:["wings"],glow:"#ff2e63",fierce:1,hue:300,skinc:"#c9c2d6",p:[9,6,7,7,8]}],
 /* ===== Легенды Британии, Руси и Севера (релиз 07.11, 18:00) ===== */
 ["Король Артур","Легенды Британии", 4,"Вытащил меч из камня и собрал рыцарей Круглого стола.", {base: 1,"helm": "knight","plume": "#ffd60a","gold": 1,"weapon": "sword","shield": "kite","shc": "#1f3f9b","armor": "plate","cape": "#1f3f9b","beard": "#8a5a2a","x": ["aura"],"hue": 220,"skin": 0,"p": [7, 7, 5, 6, 8]}],
 ["Ланселот","Легенды Британии", 3,"Лучший рыцарь Круглого стола. Не проиграл ни одного поединка.", {base: 1,"helm": "knight","plume": "#ffffff","weapon": "sword","shield": "kite","shc": "#c0392b","armor": "plate","cape": "#c0392b","hue": 0,"skin": 0,"p": [7, 6, 5, 5, 6]}],
 ["Персиваль","Легенды Британии", 2,"Простой юноша из леса, который нашёл Святой Грааль.", {base: 1,"helm": "knight","plume": "#2a8a3a","weapon": "spear","shield": "kite","shc": "#2a8a3a","armor": "mail","cape": "#2a8a3a","hue": 120,"skin": 0,"p": [5, 5, 4, 5, 6]}],
 ["Василиса Микулишна","Древняя Русь", 3,"Переоделась богатырём и обыграла самого князя — и в стрельбе, и в борьбе.", {base: 1,"female": 1,"hair": "braids","hairc": "#e0b050","helm": "shishak","weapon": "bow","armor": "mail","cape": "#b3222a","hue": 0,"skin": 0,"p": [6, 5, 6, 5, 6]}],
 ["Святогор","Древняя Русь", 4,"Богатырь ростом с гору. Даже земля еле держит его на себе.", {base: 1,"helm": "shishak","gold": 1,"weapon": "sword","shield": "round","shc": "#b3222a","armor": "mail","beard": "#e0e0e0","fierce": 1,"cape": "#5a3a1a","x": ["aura"],"hue": 30,"skin": 0,"p": [9, 8, 2, 8, 7]}],
 ["Марс","Древний Рим", 4,"Римский бог войны. Перед битвой легионы молились именно ему.", {base: 1,"helm": "galea","crest": "#c0392b","gold": 1,"weapon": "spear","shield": "scutum","armor": "lorica","cape": "#7d1410","x": ["flames"],"glow": "#ff4d3d","fierce": 1,"hue": 0,"skin": 1,"p": [8, 7, 6, 7, 8]}],
 ["Фрейя","Мифы Скандинавии", 4,"Богиня любви и войны. Половину павших героев забирает к себе.", {base: 1,"female": 1,"hair": "long","hairc": "#f0c35a","helm": "winged","weapon": "sword","shield": "round","shc": "#3ab0ff","armor": "mail","cape": "#2a8a6a","x": ["aura"],"glow": "#ffe14d","hue": 160,"skin": 0,"p": [6, 6, 7, 6, 8]}],
 ["Диомед","Троянская война", 3,"Под Троей ранил даже богов. Афина сама вела его в бой.", {base: 1,"helm": "corinth","crest": "#2f5fd0","bronze": 1,"weapon": "spear","shield": "hoplon","armor": "plate","cape": "#1f3f9b","x": ["star"],"hue": 215,"skin": 1,"p": [7, 5, 6, 6, 6]}],
 ["Сигурд","Скандинавия", 3,"Убил дракона Фафнира и искупался в его крови.", {base: 1,"helm": "viking","weapon": "sword","shield": "round","shc": "#c0392b","armor": "mail","beard": "#d9a441","cape": "#7a1a1a","x": ["flames"],"fierce": 1,"hue": 10,"skin": 0,"p": [7, 5, 5, 6, 7]}],
 ["Бальдр","Мифы Скандинавии", 4,"Светлый бог, которого не берёт никакое оружие. Кроме веточки омелы.", {base: 1,"hair": "long","hairc": "#fff1b0","helm": "suncrown","weapon": "spear","armor": "cloth","cape": "#ffd60a","x": ["aura"],"glow": "#fff3a0","gold": 1,"hue": 50,"skin": 0,"p": [5, 8, 6, 7, 8]}],
 ["Робин Гуд","Легенды Британии", 2,"Грабит богатых, помогает бедным и не промахивается из лука.", {base: 1,"helm": "phood","weapon": "bow","armor": "cloth","cape": "#2a6a2a","hue": 110,"skin": 0,"stache": "#7a4a24","p": [5, 2, 7, 3, 5]}]
];
const COLLAB=HEROES.findIndex(H=>H[4].collab), isCollab=c=>!!(c&&HEROES[c.h]&&HEROES[c.h][4].collab);
const NBASE=32;          // первые 32 воина + новые с флагом base — это альбом и прокрутки
const isBase=h=>h<NBASE||!!(HEROES[h]&&HEROES[h][4].base), BASE=HEROES.map((H,i)=>i).filter(isBase), NHEROES=BASE.length, baseNo=h=>BASE.indexOf(h)+1;
const DUO=HEROES.map((H,i)=>i).filter(i=>HEROES[i][4].duo), isDuo=h=>!!(HEROES[h]&&HEROES[h][4].duo), DUO_F=7, DUO_RUN=2;
const DUO_PAIRS=(()=>{const m={};DUO.forEach(h=>{const k=HEROES[h][4].pair;(m[k]=m[k]||[]).push(h)});return Object.keys(m).map(k=>({n:k,h:m[k]}))})();
const COMP=HEROES.map((H,i)=>i).filter(i=>HEROES[i][4].comp), isComp=h=>!!(HEROES[h]&&HEROES[h][4].comp);
const DON=HEROES.map((H,i)=>i).filter(i=>HEROES[i][4].don&&!HEROES[i][4].one), ONE=HEROES.map((H,i)=>i).filter(i=>HEROES[i][4].one);
/* Тор (ошибка печати, 1 из 1) — главный трофей игры: падает только из прокрутки, шанс 1 на миллион. В сундуках и в «Любой карточке» его нет */
const THOR=HEROES.findIndex(H=>H[0]==="Тор"), THOR_P=.000001;
/* половинки: part 1 — левая (частая), part 2 — правая (в 5 раз реже, 300 на воина на весь мир).
   Целая карточка забирает номер тиража правой половинки (17/300). «Ошибка печати»: одна левая и одна правая на воина */
const HALF_RUN=300, HALF_P={drop:.0035,right:.15,err:.004}, PART_K=["","Левая ½","Правая ½"];
const notHalf=(c,m)=>{if(c.part)fail(m||"Половинка не может это делать. Собери из двух половинок целого воина в Сокровищнице");return c};
const FIN=[
 {k:"Обычная",cls:"",w:83,m:1,run:Infinity,col:"#ffffff"},
 {k:"Блестящая",cls:"shiny",w:12.5,m:4,run:1000,col:"#b8c2d8"},
 {k:"Голограмма",cls:"holo",w:3.6,m:15,run:100,col:"#c56bff"},
 {k:"Золотая",cls:"gold",w:.65,m:80,run:10,col:"#ffcc33"},
 {k:"Ошибка печати",cls:"error",w:.07,m:600,run:1,col:"#ff2e63"},
 {k:"Основатель",cls:"founder",w:0,m:2000,run:1,col:"#ffd60a",excl:1},
 {k:"Бесценная",cls:"collab",w:0,m:0,run:1,col:"#00e5ff",excl:1,collab:1},
 {k:"Близнец",cls:"duo",w:0,m:250,run:2,col:"#7cf7ff",duo:1},
 {k:"Алмазная ошибка",cls:"error dia",w:0,m:600,run:30,col:"#5ad8ff",dia:1}];   // только у воинов-Близнецов: 2 карточки на весь мир   // коллаборация с «Номерком»: приз розыгрыша   // не выпадает: 3 карточки за 15 приглашённых друзей
/* 💎 Алмазная серия: 51 «ошибок печати». Не продаются — выпадают в прокрутке (DIA_P.spin) и в Легендарном/Мифическом сундуке, пока не кончился тираж. У каждой свой дефект печати (c — css-класс) и спрятанный бриллиант (x,y — где он на рисунке), свой тираж */
const DIA_P={spin:.0005,legend:.02,empire:.03,mythic:.05};
const DIA_F=8,DIA={"59": {"n": "Двойная печать", "c": "dbl", "x": 50, "y": 30, "run": 10}, "64": {"n": "Золотой залив", "c": "gold", "x": 50, "y": 22, "run": 10}, "63": {"n": "Перевёртыш", "c": "flip", "x": 30, "y": 70, "run": 10}, "65": {"n": "Алмазный брак", "c": "crys", "x": 62, "y": 38, "run": 5}, "61": {"n": "Негатив", "c": "neg", "x": 48, "y": 24, "run": 15}, "62": {"n": "Глитч", "c": "glit", "x": 70, "y": 40, "run": 15}, "60": {"n": "Ночная смена", "c": "night", "x": 52, "y": 32, "run": 15}, "29": {"n": "Тень", "c": "shadow", "x": 44, "y": 30, "run": 20}, "28": {"n": "Перегрев", "c": "burn", "x": 36, "y": 30, "run": 20}, "25": {"n": "Кровавая печать", "c": "blood", "x": 50, "y": 26, "run": 20}, "26": {"n": "Сдвиг цвета", "c": "rgb", "x": 58, "y": 46, "run": 25}, "27": {"n": "Зеркало", "c": "mirror", "x": 50, "y": 52, "run": 25}, "36": {"n": "Радужная плёнка", "c": "rain", "x": 40, "y": 44, "run": 20}, "40": {"n": "Капля чернил", "c": "ink", "x": 64, "y": 58, "run": 20}, "58": {"n": "Без краски", "c": "sketch", "x": 52, "y": 34, "run": 25}, "57": {"n": "Растр", "c": "pix", "x": 38, "y": 40, "run": 25}, "52": {"n": "Лишний слой", "c": "ghost", "x": 60, "y": 28, "run": 30}, "20": {"n": "Порез ножа", "c": "cut", "x": 45, "y": 36, "run": 30}, "18": {"n": "Водяной знак", "c": "water", "x": 55, "y": 30, "run": 30}, "19": {"n": "Съехавший слой", "c": "mosaic", "x": 50, "y": 50, "run": 30}, "30": {"n": "Неон", "c": "neon", "x": 50, "y": 28, "run": 10}, "31": {"n": "Космос", "c": "cosmos", "x": 60, "y": 22, "run": 10}, "38": {"n": "Ледяная печать", "c": "ice", "x": 46, "y": 30, "run": 10}, "39": {"n": "Огненный край", "c": "fire", "x": 55, "y": 34, "run": 10}, "56": {"n": "Засвет", "c": "flare", "x": 48, "y": 26, "run": 10}, "55": {"n": "Старая плёнка", "c": "sepia", "x": 52, "y": 24, "run": 20}, "53": {"n": "Ржавчина", "c": "rust", "x": 40, "y": 34, "run": 20}, "49": {"n": "Тепловизор", "c": "thermo", "x": 56, "y": 30, "run": 20}, "50": {"n": "Контур мелом", "c": "outline", "x": 50, "y": 40, "run": 20}, "51": {"n": "Перекос", "c": "skew", "x": 44, "y": 30, "run": 20}, "54": {"n": "Брызги краски", "c": "splash", "x": 58, "y": 28, "run": 20}, "24": {"n": "Половина без краски", "c": "half", "x": 46, "y": 26, "run": 25}, "23": {"n": "Небо вниз", "c": "bgflip", "x": 52, "y": 22, "run": 25}, "22": {"n": "Царапины", "c": "scratch", "x": 38, "y": 36, "run": 25}, "21": {"n": "Призрак", "c": "phantom", "x": 50, "y": 30, "run": 25}, "11": {"n": "Радиация", "c": "rad", "x": 54, "y": 30, "run": 30}, "12": {"n": "Растяжение", "c": "stretch", "x": 50, "y": 20, "run": 30}, "13": {"n": "Сползший герой", "c": "drop", "x": 48, "y": 62, "run": 30}, "48": {"n": "Пустой фон", "c": "nobg", "x": 50, "y": 28, "run": 30}, "17": {"n": "Мини-герой", "c": "tiny", "x": 50, "y": 50, "run": 30}, "76": {"n": "Алмазный дождь", "c": "gemrain", "x": 50, "y": 22, "run": 10}, "80": {"n": "Тиснение", "c": "emboss", "x": 48, "y": 26, "run": 10}, "81": {"n": "Затмение", "c": "eclipse", "x": 44, "y": 30, "run": 10}, "82": {"n": "Северное сияние", "c": "aurora", "x": 52, "y": 28, "run": 10}, "85": {"n": "Золотая пыль", "c": "dust", "x": 50, "y": 24, "run": 10}, "77": {"n": "Витраж", "c": "glass", "x": 50, "y": 30, "run": 20}, "79": {"n": "Кислота", "c": "acid", "x": 46, "y": 26, "run": 20}, "83": {"n": "VHS", "c": "vhs", "x": 56, "y": 22, "run": 20}, "84": {"n": "Комикс", "c": "comic", "x": 42, "y": 28, "run": 20}, "78": {"n": "Синька", "c": "blueprint", "x": 50, "y": 30, "run": 25}, "86": {"n": "Опечатка", "c": "typo", "x": 55, "y": 30, "run": 25}};
const isDia=h=>!!DIA[h], finRun=c=>c.f===DIA_F&&DIA[c.h]?DIA[c.h].run:FIN[c.f].run;
/* три карточки «Основатель»: создаются сервером один раз, лежат в казне игры, пока их не заработают */
const FOUNDERS=[{h:30,sn:"111111",stats:[640,640,600,620,660]},{h:31,sn:"222222",stats:[560,600,600,640,720]},{h:23,sn:"333333",stats:[620,580,640,600,660]}], FOUNDER_REFS=15;
const HW=[10,4.5,1.15,.25,.045];   // при 10 прокрутках раз в 4 часа редкие выпадают чуть реже          // вес выпадения воина по его редкости

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
 {id:"half",t:"Полальбома",d:"Собери 16 разных воинов",r:3,ok:(st,cards)=>[...haveSet(cards)].filter(isBase).length>=16},
 {id:"all",t:"Коллекционер",d:"Собери весь альбом",r:10,ok:(st,cards)=>[...haveSet(cards)].filter(isBase).length>=NHEROES}];
const DEST=[
 {k:"Разведка у реки",t:"1 минута",ms:60e3,xp:20,m:[5,15],sp:.1,card:0},
 {k:"Набег на побережье",t:"1 час",ms:3600e3,xp:60,m:[20,60],sp:.35,card:.03},
 {k:"Осада замка",t:"4 часа",ms:4*3600e3,xp:180,m:[60,180],sp:1,card:.1},
 {k:"Поход за край карты",t:"8 часов",ms:8*3600e3,xp:360,m:[150,400],sp:2,card:.25}];
const BOSS={name:"Змей Горыныч",hp:25000};
/* эпохи альбома: собери всех воинов эпохи — получи награду и значок */
const ERAS=[{k:"mid",n:"Средневековье",ic:"⚔️",h:[0,1,2,3,6,8,12,13,24,27],sp:15,cash:1000},{k:"ant",n:"Античность",ic:"🏛",h:[4,5,7,10,15,17,19,22],sp:20,cash:2000},
 {k:"jap",n:"Япония",ic:"🏯",h:[9,18,20,21,30],sp:40,cash:10000},{k:"nor",n:"Север и Степь",ic:"🪓",h:[11,14,16,26],sp:15,cash:1500},{k:"myth",n:"Мифы и легенды",ic:"🐉",h:[23,25,28,29,31],sp:40,cash:10000},
 {k:"troy",n:"Троя и Эллада",ic:"🐴",h:[46,49,50,51,52,54,56,57,58,59],sp:40,cash:12000},{k:"emp",n:"Великие империи",ic:"👑",h:[47,48,53,55,60,61,62,63,64,65],sp:50,cash:15000}];
/* кланы: до 10 человек, общий босс недели (3 удара в день на игрока), таблица кланов */
const CLAN={max:12,rewardMin:10,rewardDay:100000,cost:5000,hits:3,hp:30000,grow:1.5,chest:{sp:10,cash:500},week:[20,12,6],boss:[["Змей Горыныч",32],["Кракен",34],["Цербер",35],["Левиафан",37],["Химера",36]]};
const clanHp=(n,lvl)=>Math.round(CLAN.hp*Math.max(2,n)*Math.pow(CLAN.grow,lvl-1));
function clanDmg(cards){const top=(cards||[]).filter(c=>!away(c)&&!c.part&&!FIN[c.f].excl).map(c=>eff(c,0)).sort((a,b)=>b-a).slice(0,3);
  let d=top.reduce((a,v)=>a+v*(1.6+Math.random()*.8),0);const crit=Math.random()<.18;if(crit)d*=2.5;return {dmg:Math.max(10,Math.round(d)),crit}}
const MILES=[{p:.25,t:"3 прокрутки"},{p:.5,t:"Гарантированная эпическая"},{p:.75,t:"500 🪙 и 3 прокрутки"},{p:1,t:"Легендарная карточка"}];
const FRAMES={bronze:{k:"Бронзовая",cost:100,bg:"linear-gradient(135deg,#f3c58b,#a8642a 50%,#e6a96a)"},silver:{k:"Серебряная",cost:300,bg:"linear-gradient(135deg,#ffffff,#9aa6bf 45%,#f2f4fa 60%,#7d8aa3)"},
  fire:{k:"Огненная",cost:1000,bg:"linear-gradient(180deg,#ffe14d,#ff7a1a 45%,#d0141f)"},night:{k:"Звёздная ночь",cost:2000,bg:"radial-gradient(#fff 1px,transparent 1.6px) 0 0/10px 10px,linear-gradient(135deg,#0d1030,#3b2a8c)"},
  rainbow:{k:"Радужная",cost:4000,bg:"conic-gradient(#ff5f6d,#ffc371,#47e891,#3ab0ff,#c56bff,#ff5f6d)"},
  season:{k:"Сезонная",cost:0,only:"season",bg:"conic-gradient(from 30deg,#3aa0ff,#bf5af2,#ff3b6b,#ffd23f,#34c759,#3aa0ff)"},
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
const WHEEL=[{t:"+1",s:"прокрутка",w:31,sp:1,c:"#34c759"},{t:"50",s:"🪙",w:23,cash:50,c:"#0a84ff"},{t:"+2",s:"прокрутки",w:15,sp:2,c:"#ff9f0a"},{t:"200",s:"🪙",w:12.5,cash:200,c:"#bf5af2"},
  {t:"+3",s:"прокрутки",w:9,sp:3,c:"#ff3b30"},{t:"ЭПИК",s:"гарантия",w:3,guar:1,c:"#5ac8fa"},{t:"1000",s:"🪙",w:6,cash:1000,c:"#ffd60a"},{t:"ЛЕГЕНДА",s:"карточка",w:0.5,leg:1,c:"#0d1030"}];

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
/* голем (за звёзды): энергии в 2 раза больше и восстанавливается в 2 раза быстрее. Руны сам не даёт — бить всё равно тебе */
const GOLEM={w:99,f:499,days:7};
const campMax=C=>(CAMP_E0+100*C.lv.en)*(C.gm?2:1), campFull=C=>(60-2*C.lv.rg)*60e3/(C.gm?2:1), campPow=(C,cards)=>Math.round((1+C.lv.pw)*TARGETS[C.t].m*(1+campBonus(cards))*10)/10;
const campCrit=C=>.02+.01*C.lv.cr, campSqRate=C=>30*C.lv.sq*TARGETS[C.t].m;
function camp(st,now){const C=st.camp||(st.camp={runes:0,en:CAMP_E0,at:now,lv:{pw:0,en:0,rg:0,cr:0,sq:0},t:0,hp:TARGETS[0].hp,kills:0,total:0,sqAt:now,tapAt:0});
  for(const k in CAMP_UP)if((C.lv[k]||0)>CAMP_UP[k].max)C.lv[k]=CAMP_UP[k].max;
  C.gm=(st.golemUntil||0)>now?1:0;   // после смены баланса уровни не выше новых максимумов
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
function freshState(){return {wel:0,cash:START_CASH,spins:SPINS_MAX+2,refillAt:null,pity:0,guar:0,best:0,bestFin:0,niceCount:0,crafted:0,totalWins:0,ach:{},doneCh:{},squad:[]}}
function day(st,now){if(!st.day||st.day.d!==today(now))st.day={d:today(now),opened:0,wins:0,crafts:0,got:[]};return st.day}
function boss(st,now){if(!st.boss||st.boss.w!==weekKey(now))st.boss={w:weekKey(now),dmg:0,got:[],day:"",hits:0,extra:0,squad:[]};if(st.boss.day!==today(now)){st.boss.day=today(now);st.boss.hits=0;st.boss.extra=0}return st.boss}
/* сколько прокруток даётся раз в 4 часа: VIP получает 5 (сервер ставит st.vipUntil) */
/* VIP-статусы за звёзды: больше прокруток каждые 4 часа и больше пакетов обмена рун. Обычный VIP из акций = Серебро */
const VIP_T=[null,{k:"silver",n:"VIP Серебро",ic:"🥈",sp:13,ex:1,stars:99,days:7},{k:"gold",n:"VIP Золото",ic:"👑",sp:16,ex:3,stars:299,days:30},{k:"diamond",n:"VIP Алмаз",ic:"💎",sp:20,ex:6,stars:699,days:30}];
/* ---------- место в коллекции: база 40; один раз +10 за 30% баланса монет; дальше +10 за 99 ⭐ сколько угодно; с VIP — 360 мест ---------- */
const SLOT_STEP=10, SLOT_COIN={pct:.3,min:100}, SLOT_STAR={stars:99,n:10,max:200}, VIP_CAP=360, VIP_SLOTS=[0,VIP_CAP,VIP_CAP,VIP_CAP];
const capCoinPrice=st=>Math.max(SLOT_COIN.min,Math.ceil((st.cash||0)*SLOT_COIN.pct));
function capParts(st){const c=st.capC?1:0,s=Math.min(SLOT_STAR.max,st.capS||0),own=CAP+c*SLOT_STEP+s*SLOT_STAR.n,v=vipTier(st)?Math.max(0,VIP_CAP-own):0;return {base:CAP,coin:c*SLOT_STEP,c,star:s*SLOT_STAR.n,s,vip:v,own,all:own+v}}
function capOf(st){return capParts(st).all}
const VIP_SPINS=13, vipOn=st=>(st.vipUntil||0)>Date.now(), vipTier=st=>vipOn(st)?Math.max(1,Math.min(3,st.vipT||1)):0;
const spinCap=st=>vipOn(st)?VIP_T[vipTier(st)].sp:SPINS_MAX;
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
function rollTier(ctx,tier,extra){const pool=HEROES.map((H,i)=>i).filter(i=>isBase(i)&&HEROES[i][2]===tier).concat(extra||[]),h=pool[Math.floor(Math.random()*pool.length)];
  let f=pick(FIN.map(x=>x.w));if(FIN[f].dia)f=0;while(f>0&&ctx.issuedOf(h,f)>=FIN[f].run)f--;return makeCard(ctx,h,f)}
/* легенда 1 из 1 (Тор и др.): только «Ошибка печати», свой номер. null — если все уже у игроков */
function rollOne(ctx,want1){const free=ONE.filter(h=>ctx.issuedOf(h,4)<1&&(h!==THOR||want1===THOR));if(!free.length)return null;const h=want1!=null?want1:free[Math.floor(Math.random()*free.length)];if(!free.includes(h))fail("Эта легенда уже у другого игрока");
  const c=makeCard(ctx,h,4),want=HEROES[h][4].sn;if(want&&ctx.snFree(want)){ctx.takeSn(want);c.sn=want;c.v=priceOf(h,4,1,want,false)}return c}
/* Близнец: свободная карточка из 2 на весь мир. null — если все уже разобраны */
function rollDuo(ctx,want){const free=DUO.filter(h=>ctx.issuedOf(h,DUO_F)<DUO_RUN);if(!free.length)return null;const h=want!=null?want:free[Math.floor(Math.random()*free.length)];
  if(!free.includes(h))fail("Оба Близнеца «"+HEROES[h][0]+"» уже у игроков");return makeCard(ctx,h,DUO_F)}
const ONE_P={legend:.005,mythic:.02}, DON_P={legend:.04}, SPIN_P={don:.0002,one:.000007,duo:.00025};   // в прокрутке: богатырь 0,03% (каждый 0,01%), легенда 1 из 1 — 0,001%
/* ---------- Сокровищница: покупки за Telegram Stars ----------
   Лимита на человека нет: редкость держится общим тиражом (300 правых половинок на воина, 30 мифических сундуков в месяц на всю игру).
   Отделки и номера в сундуках выпадают с обычными шансами, ничего не подкручено. */
const SHOP={
 newbie:{n:"Подарок новичку",stars:25,sp:10,guar:1,once:1,d:["🎴 <b>10</b> прокруток","💎 гарантированный <b>эпик</b>"]},
 small:{n:"Малый сундук",stars:50,sp:10,halves:1,rightP:HALF_P.right,d:["🎴 <b>10</b> прокруток","🧩 <b>1</b> половинка составного воина","шанс правой: <b>15%</b>"]},
 royal:{n:"Королевский сундук",stars:250,sp:60,halves:6,rightP:HALF_P.right,right1:1,d:["🎴 <b>60</b> прокруток","🧩 <b>6</b> половинок","минимум <b>1 правая</b> гарантированно"]},
 warrior:{n:"Сундук воина",stars:75,cards:5,epic:1,d:["🃏 <b>5</b> карточек","минимум <b>1 эпическая</b>"]},
 legend:{n:"Легендарный сундук",stars:300,cards:10,leg:1,d:["🃏 <b>10</b> карточек","гарантированно <b>легендарная</b>","💎 шанс <b>2%</b> на Алмазную серию","шанс <b>4%</b> на богатыря"]},
 mythic:{n:"Мифический сундук",stars:1000,cards:10,myth:1,leg:1,month:30,d:["🃏 <b>10</b> карточек","💎 шанс <b>5%</b> на Алмазную серию","гарантированно <b>мифический</b>: Сёгун, Мерлин или богатырь","+ легендарная","шанс <b>2%</b> на легенду 1 из 1","всего <b>30</b> в месяц на всю игру"]}};
/* новые сундуки: удачи, промокодов, полководца, Империи */
SHOP.luckbox={n:"Сундук удачи",stars:60,sp:10,luckH:3,d:["🎴 <b>10</b> прокруток","🍀 <b>3 часа</b> удачи: Голограмма и Золото ×1,25"]};
SHOP.promo={n:"Сундук промокодов",stars:25,promo:1,d:["🎟 случайный <b>промокод</b>: прокрутки или ⭐ к пополнению","можно забрать себе или <b>подарить другу</b>","шанс на <b>+1000 ⭐</b>"]};
SHOP.general={n:"Сундук полководца",stars:149,sp:15,cards:4,epic:1,horn:1,d:["🃏 <b>4</b> карточки, минимум <b>1 эпическая</b>","🎴 <b>15</b> прокруток","📯 <b>+3 битвы</b> в войне армий сегодня"]};
SHOP.empire={n:"Сундук Империи",stars:499,sp:40,cards:6,leg:1,luckH:6,d:["🃏 <b>6</b> карточек, <b>легендарная</b> гарантирована","🎴 <b>40</b> прокруток","🍀 <b>6 часов</b> удачи","💎 шанс <b>3%</b> на Алмазную серию"]};
const PROMO_BOX=[{w:55,sp:5},{w:25,bon:100,bmin:250},{w:12,bon:300,bmin:500},{w:5,sp:20},{w:3,bon:1000,bmin:1000}];
const CHESTS=["newbie","small","luckbox","promo","royal","warrior","general","legend","empire","mythic"];
/* «любая карточка в игре»: игрок сам выбирает воина и отделку (если тираж ещё не закончился) */
function makeAny(ctx,h,f){if(!HEROES[h]||!FIN[f]||FIN[f].excl||FIN[f].dia||HEROES[h][4].collab)fail("Такой карточки нет");const W=HEROES[h][4];
  if(h===THOR)fail("Тора нельзя купить — его можно только выбить в прокрутке");
  if(W.one){if(f!==4)fail("Легенды 1 из 1 бывают только «Ошибкой печати»");return rollOne(ctx,h)}
  if(W.duo){if(f!==DUO_F)fail("Близнецы бывают только с отделкой «Близнец»");return rollDuo(ctx,h)}
  if(f===DUO_F)fail("Отделка «Близнец» есть только у воинов-Близнецов");
  if(W.comp){if(f!==0)fail("Составного воина можно взять только обычной отделки");const no=ctx.compSlot(h);if(!no)fail("Тираж воина «"+HEROES[h][0]+"» закончился");
    const sn=genNumber(ctx,0),B=cardBody(h,0);return {id:ctx.newId(),h,f:0,no,sn,part:0,hue:B.hue,stats:B.stats,v:priceOf(h,0,no,sn,B.top,0),xp:0,wins:0,stars:0,frame:null,away:0,dest:null,listed:0,listPrice:0}}
  return makeCard(ctx,h,f)}
SHOP.twins={n:"Сундук Близнецов",stars:1500,twins:1,cards:3,d:["♊ <b>Близнец</b> — карточка, которой всего <b>2</b> на весь мир","+ <b>3</b> обычные карточки","собери пару близнецов — их знает вся игра"]};
function rollDia(ctx){const L=Object.keys(DIA).map(Number).filter(h=>HEROES[h]&&ctx.issuedOf(h,DIA_F)<DIA[h].run);if(!L.length)return null;
  const w=L.map(h=>DIA[h].run-ctx.issuedOf(h,DIA_F));try{return makeDia(ctx,L[pick(w)])}catch(e){return null}}   // чем больше осталось в тираже, тем чаще
function makeDia(ctx,h){const D=DIA[h];if(!D||!HEROES[h])fail("Такой карточки нет в Алмазной серии");if(ctx.issuedOf(h,DIA_F)>=D.run)fail("Тираж «"+HEROES[h][0]+"» в Алмазной серии закончился");return makeCard(ctx,h,DIA_F)}
SHOP.any={n:"Любая карточка в игре",stars:4000,any:1,d:["выбери <b>любого воина</b> и <b>любую отделку</b>","хоть Зевса 1 из 1, если он ещё свободен (кроме Тора — его только выбить)"]};
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
/* 🍀 Оберег удачи: 1 час, шанс Голограммы и Золотой ×1,25 (Ошибка, Алмазы, легенды — без изменений). Цена в монетах растёт с каждой покупкой за день.
   Гарант: если 100 прокруток подряд не было ничего лучше Блестящей — 100-я точно Голограмма */
const LUCK={boost:1.25,dur:36e5,day:3,pct:.03,min:300,pity:100};
const luckPrice=(st,now)=>{const n=st.luckD===today(now)?(st.luckN||0):0;return Math.round(Math.max(LUCK.min,(st.cash||0)*LUCK.pct)*(n+1))};
/* 👑 ИМПЕРИЯ: одна цель на всю игру. Каждая карта — воин армии и даёт ⚔️ Мощь (редкость × отделка × уровень × звёзды).
   Ещё мощь дают коллекции героев и дракон. Мощь поднимает ранг Империи, а ранг открывает бонусы во всех разделах */
const EMP={rar:[10,25,60,150,400],fin:[1,1.6,3,6,12,15,15,8,14],coll:500,dg:60,
  R:[{n:"Племя",ic:"⛺",p:0},{n:"Деревня",ic:"🛖",p:600},{n:"Город",ic:"🏘",p:2500},{n:"Крепость",ic:"🏰",p:7000},{n:"Королевство",ic:"👑",p:18000},{n:"Империя",ic:"🏛",p:45000},{n:"Легенда эпох",ic:"🌟",p:120000}],
  trib:[150,400,1000,2500,6000,15000,40000],tribSp:[0,0,1,1,2,3,5],inc:.05,
  reg:[2,2,3,3,4,4,5],hof:[0,0,0,1,1,2,2],att:[0,0,0,0,1,1,2]};
function cardPow(c){const H=HEROES[c.h];if(!H)return 0;const F=EMP.fin[c.f]||1;return Math.round(EMP.rar[H[2]||0]*F*(1+.06*(lvl(c)-1))*(1+.12*(c.stars||0))*(c.part?.5:1))}
function empPower(st,cards){let p=0;for(const c of cards||[])p+=cardPow(c);p+=hofColl(cards||[])*EMP.coll;if(st&&st.dg)p+=(st.dg.lv||0)*EMP.dg;return p}
/* 🎨 темы оформления и 🖼 аватар (герой из своей коллекции) */
const THEMES=[{k:"stars",n:"✨ Звёздная ночь",c:["#6a4aff","#05031a"],prem:1},{k:"goldp",n:"✨ Чистое золото",c:["#d4a017","#3a2600"],prem:1},{k:"neon",n:"✨ Неон",c:["#ff2ad0","#12002a"],prem:1},{k:"",n:"Классика",c:["#2f63ff","#1d44c8"]},{k:"night",n:"Ночь",c:["#3a2a8a","#140d3a"]},{k:"royal",n:"Королевская",c:["#8a6410","#2a1a05"]},{k:"forest",n:"Лес",c:["#1f8a55","#0b3a24"]},
  {k:"fire",n:"Пламя",c:["#c8361a","#4a0d0d"]},{k:"ocean",n:"Океан",c:["#0d8aa8","#062c3a"]},{k:"rose",n:"Роза",c:["#c8268a","#4a0a3a"]},{k:"ice",n:"Лёд",c:["#5ab4e8","#1a4a7a"]}];
const BIGUPD={id:"nov7",sp:5};
/* 100 уровней Империи: уровень L требует 8·L^2,35 мощи. Ранги — полосы уровней: Племя 1–4, Деревня 5–9, Город 10–19, Крепость 20–34, Королевство 35–54, Империя 55–79, Легенда эпох 80–100 */
EMP.MAXL=100;EMP.band=[1,5,10,20,35,55,80];const empLvP=L=>L<=1?0:Math.floor(8*Math.pow(L,2.35));EMP.R.forEach((R,i)=>R.p=empLvP(EMP.band[i]));
/* ⚔️ Война армий: 5 лучших воинов против 5 лучших воинов другой Империи. 5 атак в день, слава за победы */
const WAR={day:5,army:5,cool:2*36e5,win:[8,40],lose:8,def:5};
/* 👑 Донаты Империи: стиль, удобство и защита. Не дают силы армии и карт — баланс не ломают. day:1 — раз в день, once:1 — навсегда */
const AVF={fire:{n:"Огонь",ic:"🔥"},ice:{n:"Лёд",ic:"❄️"},crown:{n:"Корона",ic:"👑"},rainbow:{n:"Радуга",ic:"🌈"}},CRESTS=["🦅","🐺","🦁","🐉","⚔️","🛡","🔱","🌙"];
const ESHOP={
 fw:{n:"Салют для всех",ic:"🎆",stars:99,d:"Баннер с салютом увидят <b>все</b>, кто сейчас в игре: «⚡ Влад запустил салют в честь своей Империи!»"},
 frame:{n:"Рамка аватара",ic:"🖼",stars:79,once:1,d:"Анимированная рамка вокруг аватара на плашке, в топах и в войне. Огонь, Лёд, Корона или Радуга"},
 pth:{n:"Премиум-темы",ic:"🎨",stars:149,once:1,d:"3 особые темы игры: ✨ Звёздная ночь, ✨ Чистое золото и ✨ Неон — навсегда"},
 crest:{n:"Герб Империи",ic:"🦅",stars:99,once:1,d:"Свой герб рядом с ником в топе Империй и в войне армий"},
 shield:{n:"Щит Империи · 8 ч",ic:"🛡",stars:49,d:"8 часов на твою армию никто не нападёт в войне армий. Нападёшь сам — щит снимется"},
 horn:{n:"Боевой рог",ic:"📯",stars:49,day:1,d:"+3 битвы в войне армий сегодня (раз в день)"},
 trib2:{n:"Двойная дань",ic:"💰",stars:39,day:1,d:"Дань Империи сегодня ×2 (раз в день)"},
 hofp:{n:"Пьедестал славы",ic:"🏛",stars:199,once:1,d:"+1 место в Зале славы навсегда — ещё одна карта приносит монеты"},
 gluck:{n:"Золотой оберег · 3 ч",ic:"🍀",stars:69,day:1,d:"3 часа удачи: шанс Голограммы и Золота ×1,25. Не тратит дневные обереги (раз в день)"},
 regsh:{n:"Укрепления · 4 ч",ic:"🏰",stars:59,day:1,d:"+4 часа щита на все твои земли: регионы, логово и крепость (раз в день)"}};
function eshopCheck(st,k,v,now){const I=ESHOP[k];if(!I)fail("Нет такого товара");const d=today(now);
  if(I.day&&(st.esd||{})[k]===d)fail("Сегодня уже куплено — приходи завтра");
  if(k==="frame"){if(!AVF[v])fail("Выбери рамку");if((st.avf||{})[v])fail("Эта рамка уже твоя")}else if(k==="crest"){if(!CRESTS.includes(v))fail("Выбери герб");if(st.crest===v)fail("Этот герб уже твой")}else if(I.once&&st["es_"+k])fail("Уже куплено навсегда")}
const empLvl=p=>{let L=1;while(L<EMP.MAXL&&p>=empLvP(L+1))L++;return L};
const empRank=p=>{let r=0;EMP.R.forEach((x,i)=>{if(p>=x.p)r=i});return r};
/* 🏛 Зал славы: выставленные карточки приносят монеты — 0,5% ценности в час, копится до 12 ч. Собранная коллекция героя (все 4 отделки: обычная, блестящая, голограмма, золотая) — +10% к доходу зала, до +50% */
const HOF={rate:.005,cap:12*36e5,slots:[2,3,4,5,6],slotP:[0,2000,8000,25000,80000],coll:.1,collMax:.5};
const hofSlots=(st,cards)=>HOF.slots[Math.min(HOF.slots.length-1,st.hofL||0)]+(cards?EMP.hof[empRank(empPower(st,cards))]:0)+(st.es_hofp?1:0);
function hofColl(cards){const m={};for(const c of cards)if(c.f<=3)(m[c.h]||(m[c.h]=new Set())).add(c.f);let n=0;for(const k in m)if(m[k].size>=4)n++;return n}
function hofRate(st,cards){const ids=new Set(st.hof||[]);let v=0;for(const c of cards)if(ids.has(c.id))v+=c.v||0;return v*HOF.rate*(1+Math.min(HOF.collMax,hofColl(cards)*HOF.coll))*(1+EMP.inc*empRank(empPower(st,cards)))}
function rollCard(ctx,epic){
  const mt=epic===3?3:epic?2:0,pool=HEROES.map((H,i)=>i).filter(i=>isBase(i)&&HEROES[i][2]>=mt);
  const h=pool[pick(pool.map(i=>(ctx.luck?HW_LUCK:HW)[HEROES[i][2]]))];
  let f=pick(ctx.luck?FW_LUCK:FIN.map((x,i)=>ctx.fBoost&&(i===2||i===3)?x.w*LUCK.boost:x.w));if(FIN[f].dia)f=0;if(ctx.fForce&&f<2)f=2;while(f>0&&ctx.issuedOf(h,f)>=FIN[f].run)f--;
  return makeCard(ctx,h,f);
}
function addXp(ctx,c,x){const b=lvl(c);c.xp=(c.xp||0)+x;const a=lvl(c);if(a>b)ctx.events.push({t:"lvl",h:c.h,lv:a})}
function noteCard(st,c){st.best=Math.max(st.best||0,HEROES[c.h][2]);st.bestFin=Math.max(st.bestFin||0,c.f);if(classify(c.sn))st.niceCount=(st.niceCount||0)+1}

/* ---------- помощники для действий ---------- */
function own(G,id){const c=G.cards.find(x=>x.id===id);if(!c)fail("Карточка не найдена");return c}
function freeCard(G,id){const c=own(G,id);if(c.lock)fail("Эта карточка сейчас в бою на арене");if(c.away)fail(/^map:/.test(String(c.dest||""))?"Этот воин охраняет регион на карте мира":"Этот воин в походе");if(c.listed)fail("Эта карточка выставлена на рынок");return c}
/* «Основатель» — трофей: не дерётся и не сгорает, только рынок, витрина и походы */
/* подарочная карточка «Ошибка печати» № 000010 (приз за 10 друзей): не продаётся, не меняется, не сжигается, в боях «на карточку» не участвует */
const PRIZE_SN="000010", noTrade=c=>!!c&&c.f===4&&String(c.sn)===PRIZE_SN;
const NOTRADE_MSG="Эта карточка подарена и существует в одном экземпляре: её нельзя продать, обменять или сжечь";
const TROPHY_MSG="Карточка «Основатель» коллекционная: в боях не участвует";
function battleCard(G,id){const c=freeCard(G,id);if(FIN[c.f].excl)fail(FIN[c.f].collab?"Бесценная карточка коллекционная: в боях не участвует":TROPHY_MSG);return notHalf(c,"Половинка не воюет. Собери из двух половинок целого воина в Сокровищнице")}
function burnable(c){if(noTrade(c))fail(NOTRADE_MSG);if(FIN[c.f].collab)fail("Бесценную карточку нельзя продать системе или сжечь. Её можно только выставить на рынок — цену ставишь ты");if(FIN[c.f].excl)fail("«Основателя» нельзя продать системе или сжечь. Его можно выставить на рынок");if(HEROES[c.h][4].one)fail("Легенду 1 из 1 нельзя продать системе или сжечь — только на рынке");return c}
function addCard(G,c){if(G.cards.length>=capOf(G.st))fail("Коллекция заполнена ("+capOf(G.st)+"). Продай лишнее или расширь место");G.cards.push(c);noteCard(G.st,c)}
/* карточка уходит из игры: её номер и место в тираже освобождаются и снова могут выпасть в прокрутках */
function burn(G,ids){G.cards.forEach(x=>{if(ids.includes(x.id)&&G.ctx.release)G.ctx.release(x)});G.cards=G.cards.filter(x=>!ids.includes(x.id))}
function pay(st,n){if(st.cash<n)fail("Не хватает "+Math.ceil(n-st.cash)+" 🪙");st.cash=Math.round((st.cash-n)*100)/100}
function earn(st,n){st.cash=Math.round((st.cash+n)*100)/100}
function aiPick(card,ex){let best=-1,bv=-1;for(let i=0;i<5;i++){if(ex.includes(i))continue;const v=eff(card,i)*(.85+Math.random()*.3);if(v>bv){bv=v;best=i}}return best}
function rndPick(ex){const r=[0,1,2,3,4].filter(i=>!ex.includes(i));return r[Math.floor(Math.random()*r.length)]}
function fight3(me,opp,picks,k){const rounds=picks.map(s=>({a:Math.round(eff(me,s)*(1+(k||0))),b:eff(opp,s)}));const w=rounds.filter(r=>r.a>r.b).length,l=rounds.filter(r=>r.a<r.b).length;return {rounds,w,l}}
const snap=c=>JSON.parse(JSON.stringify(c));

/* ---------- действия ----------
   Каждое действие получает G = {st, cards, ctx, p} и меняет st и cards. Возвращает данные для анимации. */

/* ---------- подарки: у каждого свой тираж на весь мир ----------
   звёздная серия продаётся за ⭐ в Сокровищнице, серия «Удача» выпадает только из кейса в казино.
   Корона Эпох — единственный звёздный подарок, который с мизерным шансом может выпасть и из кейса */
const GR=["Обычный","Редкий","Эпический","Легендарный","Мифический","Ошибка печати"], GR_C=["#8f9bb3","#34c759","#0a84ff","#bf5af2","#ff9f0a","#ff2e63"], GR_V=[15,25,50,100,250,1000];
/* luck:1 — подарок есть и в кейсе казино (и продаётся за ⭐). err — «ошибка печати»: та же форма, но сбитые цвета, только за ⭐, крошечный тираж */
const GIFTS={
 helm:{n:"Золотой шлем",r:0,run:5000,stars:15,g:"#ffd23f"},
 potion:{n:"Зелье силы",r:0,run:5000,stars:15,g:"#ff4dd8"},
 rose:{n:"Вечная роза",r:0,run:5000,stars:15,g:"#ff3b6b"},
 shoe:{n:"Подкова удачи",r:0,run:1000,stars:15,luck:1,g:"#c9d3e6"},
 sword:{n:"Меч в камне",r:1,run:2000,stars:25,g:"#9fe8ff"},
 shield:{n:"Щит героя",r:1,run:2000,stars:25,g:"#5ac8fa"},
 cake:{n:"Праздничный торт",r:1,run:2000,stars:25,g:"#ffb3d1"},
 dice:{n:"Кости судьбы",r:1,run:500,stars:25,luck:1,g:"#ff4d6d"},
 dragon:{n:"Дракончик",r:2,run:1000,stars:50,g:"#34ffb0"},
 horn:{n:"Рог викинга",r:2,run:1000,stars:50,g:"#e8c27a"},
 lamp:{n:"Лампа джинна",r:2,run:1000,stars:50,g:"#ffd23f"},
 clover:{n:"Четырёхлистник",r:2,run:300,stars:50,luck:1,g:"#47e891"},
 feather:{n:"Перо феникса",r:3,run:300,stars:100,g:"#ff6a1a"},
 ring:{n:"Кольцо Эпох",r:3,run:300,stars:100,g:"#c56bff"},
 hourglass:{n:"Песочные часы Эпох",r:3,run:300,stars:100,g:"#7fe7ff"},
 mask:{n:"Маска сёгуна",r:3,run:100,stars:100,luck:1,g:"#ff2e63"},
 crown:{n:"Корона Эпох",r:4,run:100,stars:250,g:"#ffb800"},
 egg:{n:"Яйцо дракона",r:4,run:100,stars:250,g:"#ff7a1a"},
 cup:{n:"Кубок Фортуны",r:4,run:30,stars:250,luck:1,g:"#ffd23f"},
 scroll:{n:"Свиток мудрости",r:0,run:5000,stars:15,g:"#e8c27a"},
 axe:{n:"Боевой топор",r:1,run:2000,stars:25,g:"#9fe8ff"},
 gem:{n:"Сапфир эпохи",r:2,run:1000,stars:50,g:"#5ac8fa"},
 wheel:{n:"Колесо Фортуны",r:3,run:300,stars:100,g:"#ffd23f"},
 trident:{n:"Трезубец Посейдона",r:3,run:300,stars:100,g:"#34c7c7"},
 eye:{n:"Око дракона",r:4,run:100,stars:250,g:"#34ffb0"},
 trident_x:{n:"Трезубец Посейдона",base:"trident",err:300,r:5,run:25,stars:500,g:"#ff4dd8"},
 crown_x:{n:"Корона Эпох",base:"crown",err:150,r:5,run:10,stars:1000,g:"#3ab0ff"},
 cup_x:{n:"Кубок Фортуны",base:"cup",err:280,r:5,run:10,stars:1000,g:"#ff4dd8"},
 egg_x:{n:"Яйцо дракона",base:"egg",err:200,r:5,run:25,stars:500,g:"#7a5aff"},
 ring_x:{n:"Кольцо Эпох",base:"ring",err:110,r:5,run:25,stars:500,g:"#34ffb0"},
 feather_x:{n:"Перо феникса",base:"feather",err:190,r:5,run:25,stars:500,g:"#3ab0ff"},
 dragon_x:{n:"Дракончик",base:"dragon",err:250,r:5,run:50,stars:300,g:"#ff4dd8"}};
/* ---------- календарь новичка: 7 подарков, по одному в день (пропустил день — подарок не сгорает) ---------- */
const NB=[{sp:5},{leg:1,sp:2},{cash:500,sp:3},{sp:10},{guar:1,sp:5},{runes:5000,sp:5},{leg:1,sp:15}];
function nbView(st,ctx){const N=st.nb||{n:0,last:""},age=Math.max(0,dayNumU(ctx.now)-dayNumU(ctx.created||ctx.now));
  return {n:N.n,today:N.last===today(ctx.now),can:N.n<NB.length&&N.last!==today(ctx.now)&&N.n<age+1,done:N.n>=NB.length,age}}
const dayNumU=t=>Math.floor((t+3*3600e3)/864e5);
/* цель дня: одна понятная задача, за неё сундук */
const GOALS=[{k:"opened",n:10,t:"Открой 10 карточек"},{k:"wins",n:3,t:"Выиграй 3 боя"},{k:"opened",n:20,t:"Открой 20 карточек"},{k:"wins",n:5,t:"Выиграй 5 боёв"}],GOAL_R={sp:5,cash:200};
function goalOf(now){return GOALS[dayNumU(now)%GOALS.length]}
function goalView(st,now){const G=goalOf(now),D=day(st,now),have=Math.min(G.n,D[G.k]||0),got=!!(st.goal&&st.goal.d===today(now));return {t:G.t,n:G.n,have,got,can:have>=G.n&&!got}}
/* ---------- «Путь воина»: 5 простых шагов для новичка, за каждый прокрутки, в конце сундук ---------- */
const PATH=[{k:"open",sp:2},{k:"nick",sp:2},{k:"camp",sp:2},{k:"win",sp:2},{k:"bonus",sp:2}],PATH_FIN={sp:5,guar:1};
function pathOk(st,ctx,i){const k=(PATH[i]||{}).k;
  if(k==="open")return (st.nOp||0)>=3;if(k==="nick")return !!(ctx&&ctx.nick);if(k==="camp")return !!(st.camp&&(st.camp.kills||0)>=1);
  if(k==="win")return (st.totalWins||0)>=1;if(k==="bonus")return !!(st.streak&&st.streak.claimed);return false}
const giftVal=k=>GIFTS[k]?GIFTS[k].stars||GR_V[GIFTS[k].r]:0, SHELF_N=9;
/* ---------- казино за руны лагеря. Возврат игроку около 90%, есть лимит в день ---------- */
const CAS_DAY=30;
/* кейс 10 000 рун без дневного лимита: бывает пусто, руны, а иногда подарок (их много, но каждый редкий). Отдача рунами ~57% + подарки */
const CASE={price:1e4,day:1e9,sold:3000,
 p:[[.30,{r:0}],[.27,{r:3000}],[.20,{r:8000}],[.13,{r:15000}],[.04534,{r:30000}],
  [.02,{g:"shoe"}],[.01,{g:"scroll"}],[.005,{g:"potion"}],[.008,{g:"dice"}],[.004,{g:"axe"}],[.004,{g:"clover"}],[.002,{g:"gem"}],
  [.001,{g:"mask"}],[.0005,{g:"wheel"}],[.0001,{g:"cup"}],[.00005,{g:"eye"}],[.00001,{g:"crown"}]]};
const SLOT={min:1e3,max:5e4,t:[[.002,"💎",50],[.005,"👑",20],[.02,"⚔️",8],[.06,"🍀",4]],pair:[.2,1.5],sym:["💎","👑","⚔️","🍀","🔔","🍒"]};
const HL={min:1e3,max:5e4,k:.92,cap:100};
/* 💣 Сапёр: поле 5×5, мины прячет сервер. Каждая открытая клетка растит множитель: 0,96 · C(25,k)/C(25−мин,k) */
const MN={min:1e3,max:5e4,n:[1,3,5,10],ret:.96,size:25};
const mnM=(mines,k)=>{let m=MN.ret;for(let i=0;i<k;i++)m*=(MN.size-i)/(MN.size-mines-i);return Math.floor(m*100)/100};
/* 🎰 Джекпот: 1% всех ставок казино копится в общий банк, его срывает тот, кто выбьет 💎💎💎 в слотах. Кешбэк: 10% вчерашнего минуса в казино (до 50 000 рун) */
const JP={cut:.01,seed:1e5},CSB={pct:.1,max:5e4};
/* 🚀 Ракетка: множитель растёт e^(k·t), взрыв в случайный момент. P(дожить до ×x)=0.92/x — 92% отдачи */
const RKT={min:1e3,max:5e4,k:.11,cap:100,ret:.92,bet:8e3,pause:4e3},rkM=ms=>Math.min(RKT.cap,Math.floor(100*Math.exp(RKT.k*Math.max(0,ms)/1e3))/100),rkCr=()=>{const u=Math.random();return Math.max(1,Math.min(RKT.cap,Math.floor(100*RKT.ret/(1-u))/100))};
function rkEnd(st,ctx,K,take){const R=K.rk,m=rkM(ctx.now-R.t0);let w=0,at=R.cr;if(R.auto&&R.auto<R.cr&&m>=R.auto){w=Math.floor(R.b*R.auto);at=R.auto}else if(take&&m<R.cr){w=Math.floor(R.b*m);at=m}
  K.rk=null;if(w)camp(st,ctx.now).runes+=w;return {end:1,cr:R.cr,at,win:w,b:R.b}}
/* обмен монет на руны пакетами по 10 000 💠. Цена — процент от монет игрока: 1-й пакет за день 1%, 2-й 2% … 5-й 5% (не меньше 1 000 🪙).
   Богатый платит больше, бедный — минимум. Монеты сгорают, рун больше 50 000 в день не получить */
const EX={pack:1e4,base:.01,step:.01,min:1000,day:10};
function exDay(st,now){const E=st.ex||(st.ex={});const d=mskDay(now);if(E.d!==d){E.d=d;E.k=0}E.k=E.k||0;return E}
const exMax=st=>EX.day+(vipTier(st)?VIP_T[vipTier(st)].ex:0), exPrice=(cash,k)=>Math.max(EX.min,Math.ceil((cash||0)*(EX.base+EX.step*k)));
function casDay(st,now){const K=st.cas||(st.cas={});const d=mskDay(now);if(K.d!==d){K.d=d;K.n=0;K.cs=0}return K}
const hlP=(c,dir)=>dir==="up"?(13-c)/13:(c-1)/13, card13=()=>1+Math.floor(Math.random()*13);
function casBet(st,ctx,b,R){const C=camp(st,ctx.now),K=casDay(st,ctx.now);b=Math.floor(+b||0);
  if(!(b>=R.min&&b<=R.max))fail("Ставка от "+R.min.toLocaleString("ru")+" до "+R.max.toLocaleString("ru")+" рун");
  
  if(C.runes<b)fail("Не хватает рун: нужно "+b.toLocaleString("ru"));C.runes-=b;K.n++;return C}

/* ===================== ПОКОРЕНИЕ ЭПОХ: карта мира, 5 глав по 8 точек =====================
   Отряд из 3 воинов против 3 врагов: три схватки, кто выиграл 2 — тот прошёл. У каждой главы есть слабость к одной эпохе (+30%).
   Награда за точку — только за первое прохождение (и бонус за ★★★). Повторы тратят факел и идут в задания пропуска. */
const ERA_OF=(()=>{const m={};ERAS.forEach(E=>E.h.forEach(h=>m[h]=E.k));return m})();
const CONQ_CH=[
 {k:"mid",n:"Земли рыцарей",weak:"jap",bg:["#2b4a1e","#6b8f3a"],st:["Застава у брода","Старая мельница","Разбойничий лес","Монастырь","Турнирное поле","Осада крепости","Королевский тракт","Тронный зал"]},
 {k:"ant",n:"Берега Эллады",weak:"mid",bg:["#1e3f6b","#d9b45a"],st:["Оливковая роща","Порт Пирей","Колизей","Храм Афины","Лабиринт","Марафонская равнина","Спарта","Вершина Олимпа"]},
 {k:"nor",n:"Северные фьорды",weak:"ant",bg:["#1d3550","#9fc4d8"],st:["Ледяной брод","Деревня ярла","Курганы","Степной лагерь","Драккары","Волчья тропа","Великая степь","Чертог ярла"]},
 {k:"jap",n:"Острова сёгунов",weak:"myth",bg:["#4a1630","#ff9fb8"],st:["Бамбуковая роща","Рисовые поля","Чайный домик","Додзё","Мост над ущельем","Замок Химэдзи","Сад сакуры","Ставка сёгуна"]},
 {k:"myth",n:"Царство мифов",weak:"nor",bg:["#26104a","#bf5af2"],st:["Туманный лес","Логово Горыныча","Остров Буян","Огненная река","Кощеево царство","Бездна","Врата богов","Престол Хаоса"]},
 {k:"troy",n:"Стены Трои",weak:"emp",bg:["#4a2a10","#e0a84a"],st:["Берег ахейцев","Лагерь кораблей","Шатёр Ахиллеса","Скейские ворота","Поле битвы","Троянский конь","Пылающий город","Дворец Приама"]},
 {k:"emp",n:"Великие империи",weak:"troy",bg:["#3a1a06","#ffcf5a"],st:["Персидская застава","Висячие сады","Долина Нила","Пирамиды Гизы","Альпийский перевал","Карфаген","Форум Рима","Трон Вавилона"]}];
const CONQ={per:8,torch:5,vip:2,buy:1000,buyMax:5,bonus:1.3,base:450,grow:1.058,boss:1.15,cards:[1,2,2,3,3,3,4]};
const conqN=()=>CONQ_CH.length*CONQ.per;
const cpow=c=>[0,1,2,3,4].reduce((a,i)=>a+eff(c,i),0);
function conqStage(n){const ch=Math.floor(n/CONQ.per),i=n%CONQ.per,C=CONQ_CH[ch],E=ERAS.find(x=>x.k===C.k),P=Math.round(CONQ.base*Math.pow(CONQ.grow,n)),boss=i===CONQ.per-1;
  const hs=E.h.slice().sort((a,b)=>HEROES[a][2]-HEROES[b][2]),top=hs[hs.length-1];
  const foes=[0,1,2].map(j=>{const h=boss&&j===1?top:hs[(i*3+j*2)%hs.length];return {h,p:Math.round(P*(boss?(j===1?1.3:1.05):[.9,1,1.1][j])*(boss?CONQ.boss:1))}});
  return {n,ch,i,name:C.st[i],boss,foes,weak:C.weak,
   r:{cash:Math.round(60+n*30),runes:500+n*150,sp:boss?5+ch*2:(i===3?3:0),card:boss?CONQ.cards[ch]:null}}}
function conqDay(st,now){const Q=st.conq||(st.conq={c:0,s:{},d:"",t:0});const d=mskDay(now);if(Q.d!==d){Q.d=d;Q.t=0;Q.x=0;Q.b=0}Q.x=Q.x||0;Q.b=Q.b||0;return Q}
/* факелы: 5 в день (VIP +2) + заработанные сегодня (задания дня) + купленные за руны (1 000, 2 000, 4 000… до 5 в день) */
const conqLeft=(st,Q)=>Math.max(0,conqTorch(st)+(Q.x||0)-Q.t), conqBuyPrice=Q=>CONQ.buy*Math.pow(2,Q.b||0);
const conqTorch=st=>CONQ.torch+(vipTier(st)?CONQ.vip:0);
const conqPow=(c,weak)=>Math.round(cpow(c)*(ERA_OF[c.h]===weak?CONQ.bonus:1));


/* ===================== ДРАКОН =====================
   Тайное яйцо открывается, когда 3 приглашённых друга сделали хотя бы по 5 прокруток.
   Дракон растёт 60 уровней (7 стадий), его надо кормить и гладить. Снаряжение 5 слотов, 6 редкостей, комплекты дают бонус.
   Сила дракона помогает в боях, завоевании и клановом боссе, а взрослый дракон каждый день приносит прокрутки. */
const DG_PLAY=5,DG={fr:0,frSpins:5,since:Date.UTC(2026,9,28,17,0),max:60,satH:4,tapCap:200,feedMax:6,winXp:10,winSh:2,winCap:15,spinXp:2,taskXp:50,conqXp:40,conqSh:10,nestTaps:50,invMax:60,upMax:10,nameMax:16,hungry:20};
const DG_STAGE=[{n:"Детёныш",lv:1,gift:0},{n:"Юный дракон",lv:10,gift:1},{n:"Взрослый дракон",lv:20,gift:2},{n:"Старший дракон",lv:30,gift:3},{n:"Древний дракон",lv:40,gift:4},{n:"Владыка эпох",lv:50,gift:5},{n:"Легенда эпох",lv:60,gift:7}];
const dgStage=lv=>{let i=0;DG_STAGE.forEach((S,k)=>{if(lv>=S.lv)i=k});return i};
const dgCum=L=>Math.round(250000*Math.pow(Math.max(0,L-1)/59,2.1));   // сколько опыта нужно всего, чтобы дойти до уровня L
const DG_BREED=[
 {k:"fire",n:"Огненный",r:0,c:["#ff6a1a","#ffd27a","#a3260a"],m:1},{k:"ice",n:"Ледяной",r:0,c:["#4fb8f0","#e9f6ff","#1f5fa8"],m:1},{k:"swamp",n:"Болотный",r:0,c:["#4fb84a","#d6f5a0","#1f5a2a"],m:1},
 {k:"storm",n:"Грозовой",r:1,c:["#7a5aff","#cfc2ff","#2a1a8a"],m:1.12},{k:"shadow",n:"Теневой",r:2,c:["#4a3a5e","#c9a0ff","#140a1e"],m:1.25},
 {k:"gold",n:"Золотой",r:3,c:["#ffc21a","#fff6c8","#a3700a"],m:1.4},{k:"star",n:"Звёздный",r:4,c:["#2a2a8a","#7cf7ff","#ff7ad9"],m:1.6}];
const DG_BR_R=["Обычная","Редкая","Эпическая","Легендарная","Мифическая"], DG_BR_P=[70,20,8,1.8,.2], DG_REB_P=[0,60,28,10,2];
const DG_FOOD={meat:{n:"Мясо",ic:"🍖",runes:2000,sat:30,xp:60},fish:{n:"Рыба",ic:"🐟",cash:200,sat:40,xp:60},apple:{n:"Золотое яблоко",ic:"🍏",sat:100,xp:2500}};
const DG_SLOT=[{k:"head",n:"Шлем",ic:"⛑"},{k:"body",n:"Броня",ic:"🛡"},{k:"wings",n:"Накрылья",ic:"🪽"},{k:"claws",n:"Когти",ic:"🗡"},{k:"amul",n:"Амулет",ic:"🔮"}];
const DG_R=[{n:"Обычное",c:"#9aa6bf",p:40,dis:5},{n:"Редкое",c:"#34c759",p:90,dis:15},{n:"Эпическое",c:"#0a84ff",p:180,dis:40},{n:"Легендарное",c:"#bf5af2",p:350,dis:100},{n:"Мифическое",c:"#ff9f0a",p:650,dis:250},{n:"Божественное",c:"#ff2e63",p:1200,dis:600}];
const DG_SET=[{k:"fire",n:"Пламени",ic:"🔥",c:"#ff6a1a"},{k:"ice",n:"Льда",ic:"❄️",c:"#5ac8fa"},{k:"storm",n:"Бури",ic:"🌩",c:"#7a5aff"},{k:"shadow",n:"Тени",ic:"🌑",c:"#8a5ab8"},{k:"gold",n:"Золота Эпох",ic:"👑",c:"#ffcf33"},{k:"olymp",n:"Олимпа",ic:"⚜️",c:"#ff2e63",div:1}];
const DG_CHEST={nest:{n:"Сундук гнезда",sh:120,p:[62,28,8.5,1.4,.1,0]},royal:{n:"Королевский сундук",sh:600,p:[0,55,33,10,2,0]},
 star:{n:"Звёздный сундук",stars:99,p:[0,0,70,25,5,0],bonus:100},div:{n:"Божественный сундук",stars:499,p:[0,0,0,60,30,10],bonus:500}};
/* ---------- 💎 гемы: вставляются в дракона, он светится их цветом и получает бонус. 3 одинаковых гема = 1 следующего уровня ---------- */
const DG_GEM={ruby:{n:"Рубин",c:"#ff2e4d",w:25,b:[.03,.06,.10],d:"мощи"},sapph:{n:"Сапфир",c:"#2f8bff",w:25,b:[.05,.10,.15],d:"опыта"},emer:{n:"Изумруд",c:"#2fe07a",w:25,b:[.15,.25,.35],d:"сытость тает медленнее"},
 ameth:{n:"Аметист",c:"#b45aff",w:20,b:[.04,.08,.12],d:"силы на арене"},diam:{n:"Алмаз",c:"#e8fbff",w:5,b:[.02,.04,.06],d:"мощи и опыта"}},DG_GEM_G=["I","II","III"],DG_GEM_MERGE=3;
const dgSockN=D=>1+(dgStage(D.lv)>=2?1:0)+(dgStage(D.lv)>=4?1:0);
function dgGemB(D,k){let b=0;(D.sock||[]).forEach(g=>{if(!g)return;const m=/^([a-z]+)(\d)$/.exec(g);if(m&&m[1]===k)b+=DG_GEM[k].b[m[2]-1]});return b}
function dgGemRoll(up){let r=Math.random()*100,k="ruby";for(const x in DG_GEM){r-=DG_GEM[x].w;if(r<=0){k=x;break}}const q=Math.random();const g=q<.03+up*.07?3:q<.2+up*.2?2:1;return k+g}
function dgGemAdd(D,g){D.gems=D.gems||{};D.gems[g]=(D.gems[g]||0)+1}
/* ---------- 🧭 походы: дракон уходит на 1/4/8 часов и приносит добычу. Пока он в походе — его не погладить и не взять на арену ---------- */
const DG_EXP=[{k:"forest",n:"Тёмный лес",ic:"🌲",h:1,sh:[15,30],xp:150,gem:.12,item:0,apple:0,sp:0,up:0},{k:"cave",n:"Пещера огня",ic:"🌋",h:4,sh:[60,120],xp:600,gem:.4,item:.2,apple:.03,sp:1,up:.3},{k:"peak",n:"Пик бурь",ic:"🏔",h:8,sh:[150,300],xp:1400,gem:.75,item:.45,apple:.1,sp:3,up:.7}];
const dgAway=(D,now)=>!!(D&&D.exp&&now<D.exp.end);
/* эволюция с 20 уровня (стадия «Взрослый дракон»): выбирается один раз */
const DG_EVO={fire:{n:"Пламя",ic:"🔥",c:"#ff3d1a",d:"+10% мощи дракона"},ice:{n:"Лёд",ic:"❄️",c:"#4fd6ff",d:"сытость тает на 40% медленнее"},storm:{n:"Буря",ic:"⚡",c:"#9a6aff",d:"+20% опыта"}},DG_EVO_LV=20;
/* облики за звёзды: меняют только вид. Хэллоуинский — ограниченный по времени */
const DG_SKIN={pumpkin:{n:"Тыквенный",ic:"🎃",stars:149,until:Date.UTC(2026,10,3,21,0),c:["#ff7a12","#ffd36a","#3a1a08"],eye:"fire",acc:"pumpkin",d:"Хэллоуин! Только до 3 ноября"},
 frost:{n:"Кристальный",ic:"💎",stars:199,c:["#8fe3ff","#ffffff","#3a7fd0"],eye:"ice",acc:"crystal",d:"Ледяные кристаллы на голове"},
 abyss:{n:"Бездна",ic:"🌑",stars:249,c:["#2a1a3e","#ff4fd8","#0a0414"],eye:"shadow",acc:"horns",d:"Тёмный, с неоновыми рогами"},
 emperor:{n:"Император",ic:"👑",stars:399,c:["#ffcf2e","#fff7d0","#8a5a00"],eye:"gold",acc:"crown",d:"Золото и корона"}};
/* арена драконов: бой против драконов других игроков. Лёд бьёт огонь, огонь — бурю, буря — лёд (+20%) */
const DGA={day:7,vipDay:3,k:32,start:1000,win:{sh:12,xp:40},lose:{sh:4,xp:10},adv:1.2,prize:[200,100,50]};
const DGA_BEAT={ice:"fire",fire:"storm",storm:"ice"};
/* тактика боя: Натиск бьёт Хитрость, Хитрость — Оборону, Оборона — Натиск (+15%) */
const DGA_TAC={rush:{n:"Натиск",ic:"💥",d:"бьёт Хитрость"},trick:{n:"Хитрость",ic:"🌀",d:"бьёт Оборону"},guard:{n:"Оборона",ic:"🛡",d:"бьёт Натиск"}},DGA_TBEAT={rush:"trick",trick:"guard",guard:"rush"},DGA_TK=1.15;
function dgEl(D){if(!D)return null;if(D.evo)return D.evo;const k=(DG_BREED[D.b]||{}).k;return k==="fire"||k==="ice"||k==="storm"?k:null}
const DG_SHOP={apple:{n:"3 золотых яблока",stars:49,ap:3},reborn:{n:"Ритуал перерождения",stars:299}};
const dgSetOf=k=>DG_SET.find(x=>x.k===k)||DG_SET[0], dgSlotOf=k=>DG_SLOT.find(x=>x.k===k)||DG_SLOT[0];
const dgItemName=it=>dgSlotOf(it.s).n+" "+dgSetOf(it.t).n;
const dgItemPow=it=>Math.round(DG_R[it.r].p*(1+.12*(it.lv||0))*(it.s==="amul"?1.2:1));
const dgUpCost=it=>20*(it.r+1)*((it.lv||0)+1);
function dgEq(D){return DG_SLOT.map(S=>(D.inv||[]).find(it=>it.id===(D.eq||{})[S.k])).filter(Boolean)}
function dgSetBonus(eq){const n={};eq.forEach(it=>n[it.t]=(n[it.t]||0)+1);let best=null;for(const k in n)if(!best||n[k]>n[best])best=k;const c=best?n[best]:0;return {k:best,n:c,b:c>=5?.25:c>=3?.1:0}}
function dgPower(D){if(!D)return 0;const B=DG_BREED[D.b]||DG_BREED[0],eq=dgEq(D),g=eq.reduce((a,it)=>a+dgItemPow(it),0),sb=dgSetBonus(eq);return Math.round(((100+D.lv*45)*B.m+g)*(1+sb.b)*(D.evo==="fire"?1.1:1)*(1+dgGemB(D,"ruby")+dgGemB(D,"diam")))}
const dgSat=(D,now)=>Math.max(0,Math.min(100,(D.sat||0)-(now-(D.satAt||now))/3600e3*DG.satH*(D.evo==="ice"?.6:1)*(1-Math.min(.6,dgGemB(D,"emer")))));
function dgBonus(st,now){const D=st&&st.dg;if(!D)return 0;let b=Math.min(.2,.02+dgPower(D)/40000);if(dgSat(D,now)<DG.hungry)b/=2;return Math.round(b*1000)/1000}
function dgDay(D,now){const d=mskDay(now);if(D.d!==d){D.d=d;D.tp=0;D.fd=0;D.wx=0;D.nest=0;D.gift=0}return D}
function dgAddXp(st,ctx,x){const D=st.dg;if(!D||!x)return 0;if(ctx&&hhIs(ctx.now,"drag"))x*=3;if(D.evo==="storm")x=Math.ceil(x*1.2);x=Math.ceil(x*(1+dgGemB(D,"sapph")+dgGemB(D,"diam")));if(dgSat(D,ctx.now)<DG.hungry)x=Math.ceil(x/2);D.xp+=x;const lv0=D.lv;while(D.lv<DG.max&&D.xp>=dgCum(D.lv+1))D.lv++;
  if(D.lv>lv0&&ctx.events)ctx.events.push({t:"dglv",lv:D.lv,stage:dgStage(D.lv)>dgStage(lv0)?dgStage(D.lv):0});return x}
function dgWin(st,ctx){const D=st.dg;if(!D)return null;dgDay(D,ctx.now);if((D.wx||0)>=DG.winCap)return null;D.wx=(D.wx||0)+1;D.sh=(D.sh||0)+DG.winSh;return {xp:dgAddXp(st,ctx,DG.winXp),sh:DG.winSh}}
function dgNewItem(D,r,t,s){D.nid=(D.nid||0)+1;const sets=DG_SET.filter(x=>r===5?x.div:!x.div);return {id:D.nid,s:s||DG_SLOT[Math.floor(Math.random()*DG_SLOT.length)].k,r,t:r===5?"olymp":t||sets[Math.floor(Math.random()*sets.length)].k,lv:0}}
function dgBreedRoll(P){return (()=>{const r=pick(P),L=DG_BREED.map((B,i)=>i).filter(i=>DG_BREED[i].r===r);return L[Math.floor(Math.random()*L.length)]})()}
/* казино: у кого есть дракон, очень редко выпадает вещь для него или золотое яблоко */
const DG_CAS={case:{g:.012,a:.008},slot:{g:.0025,a:.0015},hl:{g:.0025,a:.0015},p:[40,35,18,6,1,0],full:50};
function dgCasDrop(st,ctx,k){const D=st.dg,P=DG_CAS[k];if(!D||!P||ctx.noRare)return null;const x=Math.random();
  if(x<P.g){D.cg=(D.cg||0)+1;if((D.inv||[]).length>=DG.invMax){D.sh=(D.sh||0)+DG_CAS.full;return {sh:DG_CAS.full}}const it=dgNewItem(D,pick(DG_CAS.p));it.c="cas";D.inv.push(it);return {item:it}}
  if(x<P.g+P.a){D.ap=(D.ap||0)+1;D.ca=(D.ca||0)+1;return {ap:1}}return null}
const dgView=(D,now)=>D?{b:D.b,name:D.name||"",lv:D.lv,xp:D.xp,pow:dgPower(D),stage:dgStage(D.lv),eq:dgEq(D).map(it=>({s:it.s,r:it.r,t:it.t,lv:it.lv})),set:dgSetBonus(dgEq(D)),sat:Math.round(dgSat(D,now||Date.now()))}:null;

/* ===================== СЕЗОН И БОЕВОЙ ПРОПУСК =====================
   Сезон — 4 недели, у каждого своя эпоха. Опыт за задания дня и за игру. 30 уровней, у каждого бесплатная награда и награда пропуска (за звёзды). */
const PASS={start:Date.UTC(2026,9,25,21),len:28*864e5,lv:30,xp:300,stars:199,
 themes:[{n:"Сезон Викингов",ic:"🪓",era:"nor",c:["#0f2a44","#3aa0ff","#bfe6ff"]},{n:"Сезон Самураев",ic:"🏯",era:"jap",c:["#3a0d24","#ff3b6b","#ffd1dc"]},
  {n:"Сезон Мифов",ic:"🐉",era:"myth",c:["#1e0b3a","#bf5af2","#ffd23f"]},{n:"Сезон Легионов",ic:"🏛",era:"ant",c:["#2a1d05","#ffb02e","#fff2c8"]},{n:"Сезон Рыцарей",ic:"⚔️",era:"mid",c:["#0b2a14","#34c759","#d6ffe0"]}]};
const passSeason=now=>Math.max(0,Math.floor((now-PASS.start)/PASS.len));
const passEnd=s=>PASS.start+(s+1)*PASS.len;
const passTheme=s=>PASS.themes[s%PASS.themes.length];
const PQ=[{k:"open",n:10,t:"Открой 10 карточек",xp:120},{k:"win",n:3,t:"Выиграй 3 боя",xp:120},{k:"tap",n:300,t:"Нанеси 300 ударов в лагере",xp:90},
 {k:"conq",n:2,t:"Выиграй 2 боя в Покорении",xp:120},{k:"up",n:1,t:"Усиль воина: тренер, закалка или слияние",xp:100},{k:"craft",n:1,t:"Сделай крафт или слияние карт",xp:100},
 {k:"wheel",n:1,t:"Покрути колесо удачи",xp:60},{k:"clan",n:1,t:"Ударь босса клана",xp:90},{k:"sell",n:3,t:"Продай 3 карточки",xp:70}];
const PQ_XP={open:4,win:6,conq:10};   // опыт и без заданий: за каждую карточку, победу, бой в Покорении
function passQuests(d){let h=0;for(const ch of d)h=(h*31+ch.charCodeAt(0))>>>0;const rest=PQ.slice(1),out=[0];
  while(out.length<4){h=(h*1103515245+12345)>>>0;const i=1+(h>>>8)%rest.length;if(!out.includes(i))out.push(i)}return out}
function passState(st,now){const s=passSeason(now);let P=st.pass;if(!P||P.s!==s)P=st.pass={s,xp:0,prem:P&&P.prem===s?s:-1,f:[],p:[],d:"",c:{},q:[]};
  const d=mskDay(now);if(P.d!==d){P.d=d;P.c={};P.q=[]}return P}
const passLv=P=>Math.min(PASS.lv,Math.floor(P.xp/PASS.xp));
function passReward(lv,prem){   // lv 1…30
  if(!prem){if(lv===30)return {card:2,t:"Эпическая карточка"};if(lv%5===0)return {sp:5};return lv%3===1?{cash:200+lv*20}:lv%3===2?{runes:2000+lv*200}:{sp:2}}
  if(lv===30)return {card:3,title:"season",frame:"season",t:"Легендарная карточка, титул и рамка сезона"};if(lv===20)return {card:3,t:"Легендарная карточка"};
  if(lv===10)return {card:2,t:"Эпическая карточка"};if(lv===25)return {frame:"season",sp:10,t:"Рамка сезона"};if(lv%5===0)return {sp:8,guar:1};
  return lv%3===1?{cash:800+lv*60}:lv%3===2?{runes:6000+lv*400}:{sp:4}}
function passAdd(st,ctx,k,n){if(!n)return;const P=passState(st,ctx.now);P.c[k]=(P.c[k]||0)+n;if(PQ_XP[k])P.xp+=PQ_XP[k]*n;
  passQuests(P.d).forEach(i=>{const Q=PQ[i];if(!P.q.includes(i)&&(P.c[Q.k]||0)>=Q.n){P.q.push(i);P.xp+=Q.xp;conqDay(st,ctx.now).x++;if(ctx.events)ctx.events.push({t:"pq",q:Q.t,xp:Q.xp,torch:1})}})}
const SEASON_TITLE={n:"Герой сезона",ic:"🎖"};
/* ---------- 🍀 счастливые часы: 1–2 раза в день в случайное время (12:00–22:00 МСК) на 30 минут. Расписание одинаковое у всех, считается от даты ---------- */
const HH_T={drag:{n:"Драконий час",ic:"🐉",d:"×3 опыт дракона"},coin:{n:"Монетный час",ic:"🪙",d:"+50% монет за продажу карточек"},camp:{n:"Час Лагеря",ic:"🎯",d:"×2 руны в Лагере"},gift:{n:"Час подарков",ic:"🎁",d:"+3 бесплатные прокрутки — забери!"}},HH_LEN=30*60e3;
function hhDay(d){let h=2166136261;for(const ch of "hh"+d){h^=ch.charCodeAt(0);h=Math.imul(h,16777619)>>>0}const r=()=>{h^=h<<13;h>>>=0;h^=h>>>17;h^=h<<5;h>>>=0;return h/4294967296};
  const n=r()<.55?2:1,keys=Object.keys(HH_T),out=[],base=Date.parse(d+"T00:00:00Z")-3*3600e3;let used=-1;
  for(let i=0;i<n;i++){let slot=Math.floor(r()*20);if(slot===used||Math.abs(slot-used)<4)slot=(slot+8)%20;used=slot;const k=keys[Math.floor(r()*keys.length)];const at=base+12*3600e3+slot*30*60e3;out.push({k,at,end:at+HH_LEN})}
  return out.sort((a,b)=>a.at-b.at)}
let HH_KING=null;function hhKingSet(x){HH_KING=x&&x.k&&HH_T[x.k]?x:null}   // 👑 указ Короля: свой счастливый час поверх расписания
function hhNow(now){if(HH_KING&&now>=HH_KING.at&&now<HH_KING.end)return HH_KING;const d=new Date(now+3*3600e3).toISOString().slice(0,10);return hhDay(d).find(e=>now>=e.at&&now<e.end)||null}
const hhIs=(now,k)=>{const e=hhNow(now);return !!(e&&e.k===k)};
function hofClaim(G){const {st,ctx}=G;const t=Math.min(HOF.cap,Math.max(0,ctx.now-(st.hofAt||ctx.now))),g=Math.floor(hofRate(st,G.cards)*t/36e5);st.hofAt=ctx.now;if(g>0)earn(st,g);return g}
const ACTIONS={
  sync(){return {}},

  /* мультиоткрытие: до 10 карточек разом (сколько хватит прокруток и места) */
  hh_claim(G){const e=hhNow(G.ctx.now);if(!e||e.k!=="gift")fail("Сейчас нет Часа подарков");if(G.st.hhGot===e.at)fail("Подарок этого часа уже забран");G.st.hhGot=e.at;G.st.spins+=3;return {sp:3}},
  seen(G){const k=String(G.p.k||"").slice(0,40);if(!k)fail("Нет ключа");const L=(G.st.seen||[]).filter(x=>x!==k);L.push(k);G.st.seen=L.slice(-60);return {}},
  war_use(G){if(!G.ctx.grant)fail("Неизвестное действие");const {st,ctx}=G;const d=today(ctx.now);if(st.warD!==d){st.warD=d;st.warN=0}const lim=WAR.day+(st.warXD===d?3:0);if(st.warN>=lim)fail("Сегодня армия устала: "+lim+" битв в день. Приходи завтра!");delete st.warSh;st.warN++;if(G.p.cash)earn(st,G.p.cash);return {left:WAR.day-st.warN}},
  eshop_grant(G){if(!G.ctx.grant)fail("Неизвестное действие");const {st,ctx,p}=G,k=p.k,v=p.v,d=today(ctx.now),I=ESHOP[k];if(!I)fail("Нет такого товара");if(I.day)(st.esd||(st.esd={}))[k]=d;
    if(k==="frame"){(st.avf||(st.avf={}))[v]=1;st.avfOn=v}else if(k==="crest")st.crest=v;else if(I.once)st["es_"+k]=1;
    if(k==="shield")st.warSh=Math.max(st.warSh||0,ctx.now)+8*36e5;if(k==="horn")st.warXD=d;if(k==="gluck")st.luckU=Math.max(st.luckU||0,ctx.now)+3*36e5;
    let extra=0;if(k==="trib2"){if(st.empD===d){extra=EMP.trib[empRank(empPower(st,G.cards))];earn(st,extra)}else st.trib2=d}return {k,v:v||null,extra}},
  avf_set(G){const {st}=G;const v=String(G.p.v||"");if(v&&!(st.avf||{})[v])fail("Эта рамка ещё не куплена");st.avfOn=v||null;return {avfOn:st.avfOn}},
  ava_set(G){const {st}=G;const h=G.p.h|0;if(h<0){delete st.ava;return {ava:null}}if(!G.cards.some(c=>c.h===h))fail("Аватаром можно поставить только воина из своей коллекции");st.ava=h;return {ava:h}},
  theme_set(G){const {st}=G;const k=String(G.p.k||"");const T=THEMES.find(t=>t.k===k);if(!T)fail("Нет такой темы");if(T.prem&&!st.es_pth)fail("Премиум-темы открываются в Сокровищнице → 👑 Империя");st.theme=k;return {theme:k}},
  upd_gift(G){const {st}=G;if(st.updG===BIGUPD.id)fail("Подарок обновления уже получен");st.updG=BIGUPD.id;st.spins=(st.spins||0)+BIGUPD.sp;return {sp:BIGUPD.sp}},
  emp_trib(G){const {st,ctx}=G;const d=today(ctx.now);if(st.empD===d)fail("Дань уже собрана — приходи завтра");const r=empRank(empPower(st,G.cards));st.empD=d;const x2=st.trib2===d?2:1;earn(st,EMP.trib[r]*x2);if(EMP.tribSp[r])st.spins=(st.spins||0)+EMP.tribSp[r];return {cash:EMP.trib[r]*x2,sp:EMP.tribSp[r],r,x2}},
  luck_buy(G){const {st,ctx}=G;const d=today(ctx.now);if(st.luckD!==d){st.luckD=d;st.luckN=0}if(st.luckN>=LUCK.day)fail("Сегодня обереги закончились — приходи завтра");
    const pr=luckPrice(st,ctx.now);pay(st,pr);st.luckN++;st.luckU=Math.max(st.luckU||0,ctx.now)+LUCK.dur;return {until:st.luckU,paid:pr,left:LUCK.day-st.luckN}},
  hof_set(G){const {st}=G;const ids=[...new Set((G.p.ids||[]).map(x=>x|0))].slice(0,hofSlots(st,G.cards));const own=new Set(G.cards.map(c=>c.id));
    for(const i of ids)if(!own.has(i))fail("Это не твоя карточка");hofClaim(G);st.hof=ids;return {hof:ids,rate:hofRate(st,G.cards)}},
  hof_claim(G){const g=hofClaim(G);if(g<1)fail("Зал ещё ничего не заработал");return {got:g}},
  hof_slot(G){const {st}=G;const L=st.hofL||0;if(L>=HOF.slots.length-1)fail("Все места в зале открыты");pay(st,HOF.slotP[L+1]);st.hofL=L+1;return {slots:hofSlots(st)}},
  open_multi(G){const {st,ctx}=G;refill(st,ctx.now);const want=Math.max(2,Math.min(10,G.p.n|0||5));if(st.spins<=0)fail("Прокрутки закончились");
    const free=capOf(st)-G.cards.length;if(free<=0)fail("Коллекция заполнена ("+capOf(st)+"). Продай лишнее или расширь место");
    const n=Math.min(want,st.spins,free),cards=[];let wel=0;
    for(let i=0;i<n;i++){try{const r=ACTIONS.open(G);cards.push(r.card);if(r.wel)wel=1}catch(e){if(!cards.length)throw e;break}}
    return {cards,wel,asked:want}},
  /* 🎥 эфир: карточка для зрителя — обычные шансы, без прокруток и без удачи; карточка уходит «в ожидание» по коду */
  live_roll(G){if(!G.ctx.grant||!G.ctx.admin)fail("Неизвестное действие");const {ctx}=G;ctx.luck=false;let c=null;
    if(Math.random()<SPIN_P.one)try{c=rollOne(ctx)}catch(e){}
    if(!c)c=rollCard(ctx,false);c.how="live";G.cards.push(c);return {card:c}},
  open(G){const {st,ctx}=G;refill(st,ctx.now);
    if(st.spins<=0)fail("Прокрутки закончились");
    if(G.cards.length>=capOf(st))fail("Коллекция заполнена ("+capOf(st)+"). Продай лишнее или расширь место");
    st.spins--;if(st.spins<spinCap(st)&&!st.refillAt)st.refillAt=ctx.now+REFILL_MS;if(st.dg)dgAddXp(st,ctx,DG.spinXp);
    const epic=(st.guar||0)>0||(st.pity||0)>=PITY-1;let c=null;
    const rr=ctx.noRare?1:Math.random();   // noRare — только для автотестов
    if(!ctx.noRare&&Math.random()<THOR_P)try{c=rollOne(ctx,THOR)}catch(e){}   // Тор: один шанс на миллион
    if(c){}else if(rr<SPIN_P.one)try{c=rollOne(ctx)}catch(e){}   // легенда 1 из 1: один шанс на сто тысяч
    else if(rr<SPIN_P.one+SPIN_P.don)c=rollTier(ctx,-1,DON);   // богатырь
    else if(rr<SPIN_P.one+SPIN_P.don+SPIN_P.duo)c=rollDuo(ctx);   // Близнец: 2 на весь мир
    if(!c&&!ctx.noRare&&Math.random()<DIA_P.spin)c=rollDia(ctx);   // 💎 Алмазная серия: 1 на 2000 прокруток
    if(!c&&!epic&&!ctx.noRare&&Math.random()<HALF_P.drop)try{c=rollHalf(ctx,HALF_P.right)}catch(e){}   // редко вместо карточки выпадает половинка составного воина
    st.nOp=(st.nOp||0)+1;let wel=0;
    if(st.wel===0&&st.nOp>=2&&!c){wel=1;st.wel=1;const pl=HEROES.map((H,i)=>i).filter(i=>isBase(i)&&HEROES[i][2]===3),h=pl[Math.floor(Math.random()*pl.length)];c=makeCard(ctx,h,ctx.issuedOf(h,1)<FIN[1].run?1:0)}   // подарок новичку: на 2-й прокрутке легендарный воин с блеском
    const leg=!c&&(st.lpity||0)>=LPITY-1;   // гарантия легенды: 90-я прокрутка без легендарки — точно легендарка
    ctx.fBoost=(st.luckU||0)>ctx.now;ctx.fForce=(st.fpity||0)>=LUCK.pity-1;if(!c)c=rollCard(ctx,leg?3:epic);ctx.fBoost=ctx.fForce=false;st.fpity=c.f>=2?0:(st.fpity||0)+1;if(epic&&!wel&&(st.guar||0)>0&&HEROES[c.h][2]>=2)st.guar--;
    st.pity=HEROES[c.h][2]>=2?0:(st.pity||0)+1;st.lpity=HEROES[c.h][2]>=3?0:(st.lpity||0)+1;
    addCard(G,c);day(st,ctx.now).opened++;return wel?{card:c,wel:1}:{card:c}},

  sell(G){const c=burnable(freeCard(G,G.p.id)),got=Math.round(c.v*QUICK*(hhIs(G.ctx.now,"coin")?1.5:1)*100)/100;burn(G,[c.id]);earn(G.st,got);return {got}},

  /* продать выбранные карточки системе одним нажатием */
  sellmany(G){const ids=[...new Set(G.p.ids||[])].slice(0,60);if(!ids.length)fail("Выбери карточки");
    const list=ids.map(id=>burnable(freeCard(G,id))),got=Math.round(list.reduce((a,c)=>a+c.v*QUICK,0)*(hhIs(G.ctx.now,"coin")?1.5:1)*100)/100;burn(G,ids);earn(G.st,got);return {got,n:list.length}},

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

  duel(G){const {st,ctx,p}=G;const me=battleCard(G,p.id),stat=p.stat|0;if(p.mode&&noTrade(me))fail("Эта карточка не участвует в боях на карточку: она подарена и существует в одном экземпляре");if(stat<0||stat>4)fail("Неверная характеристика");
    const t=HEROES[me.h][2],tt=Math.max(0,Math.min(4,t+[-1,0,0,0,1][Math.floor(Math.random()*5)]));
    const cand=HEROES.map((H,i)=>i).filter(i=>isBase(i)&&HEROES[i][2]===tt),oh=cand[Math.floor(Math.random()*cand.length)];
    // соперник: карточка настоящего игрока (сервер подбирает её сам), иначе бот
    const real=G.ctx.oppCard||null;
    if(real&&p.mode&&G.cards.length>=capOf(st))fail("Коллекция заполнена ("+capOf(st)+"). Освободи место, чтобы драться на карточку");
    const opp=real||phantom(oh,Math.random()<.2?1:0),before=snap(me);
    const dk=dgBonus(st,ctx.now),p2=aiPick(opp,[stat]),p3=rndPick([stat,p2]),picks=[stat,p2,p3],R=fight3(me,opp,picks,dk);
    let reward=0,gotCard=null,lostCard=false,dg=null;
    if(R.w===R.l)addXp(ctx,me,15);
    else if(R.w>R.l){me.wins=(me.wins||0)+1;st.totalWins=(st.totalWins||0)+1;addXp(ctx,me,30);day(st,ctx.now).wins++;dg=dgWin(st,ctx);
      if(p.mode&&real){ctx.takeCard=real.id;gotCard=snap(real);addCard(G,gotCard)}   // забираем карточку игрока
      else if(p.mode&&G.cards.length<capOf(st)){gotCard=makeCard(ctx,opp.h,opp.f,{stats:opp.stats,hue:opp.hue});addCard(G,gotCard)}
      else{   // награда без ставки: не больше DUEL_CAP, а за повторные победы над одной и той же карточкой сегодня — вдвое меньше каждый раз
        let base=Math.min(opp.v,DUEL_CAP);if(real){const d=today(ctx.now);if(!st.dw||st.dw.d!==d)st.dw={d,m:{}};const n=st.dw.m[real.id]||0;st.dw.m[real.id]=n+1;base*=Math.pow(.5,n)}
        reward=Math.round(base*.3+5);earn(st,reward)}}
    else{addXp(ctx,me,10);if(p.mode){if(real)ctx.giveAway=me.id;burn(G,[me.id]);lostCard=true}}   // с игроком карточка уходит к нему
    return {me:before,opp,picks,rounds:R.rounds,w:R.w,l:R.l,reward,gotCard,lostCard,real:!!real,oppName:real?G.ctx.oppName:null,oppUid:real?G.ctx.oppUid:null,dk,dg}},

  fduel(G){const {st,ctx,p}=G;const me=battleCard(G,p.myId),opp=p.opp,myStat=p.myStat|0;if(!opp)fail("Соперник не найден");if(FIN[opp.f]&&FIN[opp.f].excl)fail("С карточкой «Основатель» драться нельзя: это трофей");if(opp.part)fail("С половинкой драться нельзя");
    const p2=p.oppStat!=null?p.oppStat|0:aiPick(opp,[myStat]);if(p2===myStat)fail("Эту характеристику уже выбрал соперник");
    const dk=dgBonus(st,ctx.now),picks=[myStat,p2,rndPick([myStat,p2])],before=snap(me),R=fight3(me,opp,picks,dk);
    const key=String(p.key||"x")+"_"+me.h,first=!st.doneCh[key];let reward=0;
    if(R.w>R.l&&first){reward=Math.round(opp.v*.3+5);earn(st,reward);addXp(ctx,me,30);st.totalWins=(st.totalWins||0)+1;me.wins=(me.wins||0)+1;day(st,ctx.now).wins++;st.doneCh[key]=1}
    else if(R.w<R.l&&first){addXp(ctx,me,10);st.doneCh[key]=1}
    return {me:before,opp,picks,rounds:R.rounds,w:R.w,l:R.l,reward,first}},

  boss_squad(G){const B=boss(G.st,G.ctx.now),ids=(G.p.ids||[]).slice(0,3);ids.forEach(id=>battleCard(G,id));B.squad=ids;return {}},
  boss_hit(G){const {st,ctx}=G;const B=boss(st,ctx.now);if(B.dmg>=BOSS.hp)fail("Босс уже повержен");if(B.hits>=3+(B.extra||0))fail("Удары на сегодня закончились");
    const team=(B.squad||[]).map(id=>G.cards.find(c=>c.id===id)).filter(c=>c&&!away(c));if(!team.length)fail("Поставь воинов в отряд");
    let dmg=team.reduce((a,c)=>a+eff(c,0)*(1.6+Math.random()*.8),0);const crit=Math.random()<.18;if(crit)dmg*=2.5;dmg=Math.round(dmg);
    B.hits++;B.dmg=Math.min(BOSS.hp,B.dmg+dmg);team.forEach(c=>addXp(ctx,c,20));return {dmg,crit}},
  era_claim(G){const {st}=G;const E=ERAS.find(x=>x.k===G.p.k);if(!E)fail("Нет такой эпохи");st.eras=st.eras||{};if(st.eras[E.k])fail("Награда уже получена");
    const have=haveSet(G.cards);if(!E.h.every(h=>have.has(h)))fail("Собери всех воинов эпохи");st.eras[E.k]=1;st.spins=(st.spins||0)+E.sp;earn(st,E.cash);return {k:E.k,sp:E.sp,cash:E.cash}},
  boss_claim(G){const {st,ctx}=G;const B=boss(st,ctx.now),i=G.p.i|0,M=MILES[i];if(!M)fail("Нет такой награды");if(B.got.includes(i))fail("Уже получено");if(B.dmg<BOSS.hp*M.p)fail("Ещё не открыто");
    B.got.push(i);let card=null;
    if(i===0)st.spins+=3;if(i===1)st.guar=(st.guar||0)+1;if(i===2){earn(st,500);st.spins+=3}
    if(i===3){const pool=HEROES.map((H,k)=>k).filter(k=>HEROES[k][2]===3);card=makeCard(ctx,pool[Math.floor(Math.random()*pool.length)],1);addCard(G,card)}
    return {card,t:M.t}},

  exp_start(G){const {st,ctx,p}=G;const c=notHalf(freeCard(G,p.id)),d=p.dest|0;if(!DEST[d])fail("Нет такого похода");
    const slots=EX_SLOTS+(st.mapDay===today(ctx.now)?1:0);if(G.cards.filter(x=>x.away&&!/^map:/.test(String(x.dest||""))).length>=slots)fail("Все места для походов заняты");
    c.away=ctx.now+DEST[d].ms;c.dest=d;return {}},
  exp_rush(G){if(!G.ctx.test&&!G.ctx.admin)fail("Ускорение доступно только в тестовом режиме");const c=own(G,G.p.id);if(/^map:/.test(String(c.dest||"")))fail("Этот воин охраняет регион");if(!c.away)fail("Воин не в походе");c.away=G.ctx.now-1;return {}},
  exp_claim(G){const {st,ctx}=G;const c=own(G,G.p.id);if(!c.away)fail("Воин не в походе");if(/^map:/.test(String(c.dest||"")))fail("Этот воин охраняет регион на карте мира");if(c.away>ctx.now)fail("Воин ещё в пути");
    const D=DEST[c.dest]||DEST[0],money=rint(D.m[0],D.m[1]),sp=Math.floor(D.sp)+(Math.random()<D.sp%1?1:0);
    earn(st,money);addXp(ctx,c,D.xp);st.spins+=sp;c.away=0;c.dest=null;let card=null;
    if(Math.random()<D.card&&G.cards.length<capOf(st)){card=rollCard(ctx,false);addCard(G,card)}
    return {money,xp:D.xp,sp,card}},

  train(G){const c=notHalf(own(G,G.p.id));if(c.listed)fail("Карточка на рынке");if(lvl(c)>=LMAX)fail("Максимальный уровень");pay(G.st,trainCost(c));addXp(G.ctx,c,50);return {}},
  forge(G){const c=notHalf(own(G,G.p.id));if(c.listed)fail("Карточка на рынке");const s=c.stars||0;if(s>=STAR_MAX)fail("Уже максимум звёзд");
    if(lvl(c)<STAR_LVL[s])fail("Нужен уровень "+STAR_LVL[s]+". Качай воина в боях, походах и у тренера");
    pay(G.st,forgeCost(c));c.stars=s+1;c.v=Math.round(c.v*STAR_V*100)/100;return {stars:c.stars,v:c.v}},
  rage(G){const B=boss(G.st,G.ctx.now);if((B.extra||0)>=2)fail("Лимит зелий на сегодня");pay(G.st,150);B.extra=(B.extra||0)+1;return {}},
  map(G){if(G.st.mapDay===today(G.ctx.now))fail("Карта уже куплена");pay(G.st,120);G.st.mapDay=today(G.ctx.now);return {}},
  frame(G){const c=notHalf(own(G,G.p.id)),F=FRAMES[G.p.frame];if(!F)fail("Нет такой рамки");if(F.only==="season"){if(!(G.st.frames||[]).includes("season"))fail("Рамка сезона — награда боевого пропуска")}else if(F.only&&!G.ctx.pioneer)fail("Эта рамка только для первых "+PIONEERS+" игроков");if(c.listed)fail("Карточка на рынке");if(c.frame===G.p.frame)fail("Эта рамка уже надета");pay(G.st,F.cost);c.frame=G.p.frame;return {}},

  task(G){const {st,ctx}=G;const D=day(st,ctx.now),i=G.p.i|0,T=TASKS[i];if(!T)fail("Нет такого задания");if(D.got.includes(i))fail("Уже получено");if(D[T.k]<T.n)fail("Задание ещё не выполнено");D.got.push(i);st.spins+=T.r;const dgx=st.dg?dgAddXp(st,ctx,DG.taskXp):0;return {r:T.r,dgx}},
  streak(G){const st=G.st;checkStreak(st,G.ctx.now);if(st.streak.claimed)fail("Уже получено сегодня");st.streak.claimed=true;st.spins+=1;if(st.streak.n===7)st.guar=(st.guar||0)+1;return {n:st.streak.n}},
  ach(G){const A=ACH.find(a=>a.id===G.p.id);if(!A)fail("Нет такого достижения");if(G.st.ach[A.id])fail("Уже получено");if(!A.ok(G.st,G.cards))fail("Достижение ещё не выполнено");G.st.ach[A.id]=1;G.st.spins+=A.r;return {r:A.r,t:A.t}},

  nb_claim(G){const st=G.st,ctx=G.ctx,V=nbView(st,ctx);if(V.done)fail("Все подарки новичка уже получены");if(V.today)fail("Сегодняшний подарок уже забран — приходи завтра");if(!V.can)fail("Следующий подарок откроется завтра");
    const R=NB[V.n],out={day:V.n+1,sp:R.sp||0};st.nb={n:V.n+1,last:today(ctx.now)};if(R.sp)st.spins+=R.sp;if(R.cash){earn(st,R.cash);out.cash=R.cash}if(R.guar){st.guar=(st.guar||0)+R.guar;out.guar=1}
    if(R.runes){camp(st,ctx.now).runes+=R.runes;out.runes=R.runes}
    if(R.leg){const c=rollTier(ctx,3);addCard(G,c);out.card=c}return out},
  goal_claim(G){const st=G.st,V=goalView(st,G.ctx.now);if(V.got)fail("Сундук дня уже открыт — завтра будет новая цель");if(!V.can)fail("Цель ещё не выполнена: "+V.t+" ("+V.have+"/"+V.n+")");
    st.goal={d:today(G.ctx.now)};st.spins+=GOAL_R.sp;earn(st,GOAL_R.cash);return {sp:GOAL_R.sp,cash:GOAL_R.cash}},
  path_claim(G){const st=G.st,P=st.path||(st.path={got:[]}),i=G.p.i|0;
    if(G.p.fin){if(P.fin)fail("Сундук уже открыт");if(!PATH.every((x,k)=>P.got.includes(k)))fail("Сначала пройди все шаги");P.fin=1;st.spins+=PATH_FIN.sp;st.guar=(st.guar||0)+PATH_FIN.guar;return {sp:PATH_FIN.sp,fin:1}}
    const S=PATH[i];if(!S)fail("Нет такого шага");if(P.got.includes(i))fail("Уже получено");if(!pathOk(st,G.ctx,i))fail("Шаг ещё не выполнен");P.got.push(i);st.spins+=S.sp;return {i,sp:S.sp}},
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
    if(hhIs(ctx.now,"camp"))gain*=2;gain=Math.round(gain)+chestR;C.en-=n;C.runes+=gain;C.total+=gain;campEarn(C,ctx.now,gain);C.fullAt=C.en>=campMax(C)?0:Math.round(ctx.now+(campMax(C)-C.en)/campMax(C)*campFull(C));
    return {n,gain,crits,chests,chestR}},
  camp_up(G){const {st,ctx}=G;const C=camp(st,ctx.now),k=G.p.k,U=CAMP_UP[k];if(!U)fail("Нет такой прокачки");const l=C.lv[k]||0;if(l>=U.max)fail("Уже максимальный уровень");
    const c=U.c(l);if(C.runes<c)fail("Не хватает рун: нужно "+c);if(k==="sq"&&C.lv.sq){const g=campSq(C,ctx.now);C.runes+=g;campEarn(C,ctx.now,g)}C.runes-=c;C.lv[k]=l+1;
    if(k==="en")C.en+=100;if(k==="sq")C.sqAt=ctx.now;camp(st,ctx.now);return {k,l:l+1}},
  camp_target(G){const {st,ctx}=G;const C=camp(st,ctx.now);if(C.t>=TARGETS.length-1)fail("Это самая сильная мишень");
    const T=TARGETS[C.t+1];if(C.runes<T.cost)fail("Не хватает рун: нужно "+T.cost);if(C.lv.sq){const g=campSq(C,ctx.now);C.runes+=g;campEarn(C,ctx.now,g)}C.sqAt=ctx.now;C.runes-=T.cost;C.t++;C.hp=T.hp;return {t:C.t}},
  cas_case(G){const {st,ctx}=G;const C=camp(st,ctx.now),K=casDay(st,ctx.now);
    if(C.runes<CASE.price)fail("Не хватает рун: кейс стоит "+CASE.price.toLocaleString("ru"));
    C.runes-=CASE.price;K.cs++;const L=ctx.giftLeft||{},P=CASE.p[pick(CASE.p.map(x=>x[0]))][1];
    const dg=dgCasDrop(st,ctx,"case");
    if(P.g&&(L[P.g]||0)>0){ctx.giftWin=P.g;return {gift:P.g,i:CASE.p.findIndex(x=>x[1]===P),dg}}
    const r=P.g?CASE.sold:P.r;C.runes+=r;return {r,sold:P.g||null,i:CASE.p.findIndex(x=>x[1]===P),dg}},
  cas_comp(G){if(!G.ctx.grant)fail("Неизвестное действие");const C=camp(G.st,G.ctx.now);C.runes+=CASE.sold;return {r:CASE.sold}},
  ex_runes(G){const {st,ctx}=G;const C=camp(st,ctx.now),E=exDay(st,ctx.now);if(E.k>=exMax(st))fail("Сегодня уже обменяно "+exMax(st)+" пакетов. Завтра лимит обновится");
    const n=exPrice(st.cash,E.k);if(G.p.max!=null&&n>+G.p.max)fail("Цена изменилась — посмотри ещё раз");pay(st,n);C.runes+=EX.pack;E.k++;return {n,r:EX.pack,k:E.k,next:E.k<exMax(st)?exPrice(st.cash,E.k):0}},
  cas_slot(G){const {st,ctx}=G;const C=casBet(st,ctx,G.p.bet,SLOT),b=Math.floor(+G.p.bet);let x=Math.random(),reels,m=0;
    const any=()=>SLOT.sym[Math.floor(Math.random()*SLOT.sym.length)];
    for(const [p,s2,k] of SLOT.t){if(x<p){reels=[s2,s2,s2];m=k;break}x-=p}
    if(!reels&&x<SLOT.pair[0]){const a=any();let c;do c=any();while(c===a);reels=[a,a,a];reels[Math.floor(Math.random()*3)]=c;m=SLOT.pair[1]}
    if(!reels){const o=SLOT.sym.slice().sort(()=>Math.random()-.5);reels=o.slice(0,3)}
    const win=Math.floor(b*m);C.runes+=win;return {reels,m,win,dg:dgCasDrop(st,ctx,"slot")}},
  cas_hl_go(G){const {st,ctx}=G;const K=casDay(st,ctx.now);if(K.hl)fail("Сначала доиграй или забери выигрыш");casBet(st,ctx,G.p.bet,HL);
    K.hl={b:Math.floor(+G.p.bet),c:card13(),m:1,s:0};return {hl:K.hl,dg:dgCasDrop(st,ctx,"hl")}},
  cas_hl(G){const {st,ctx}=G;const K=casDay(st,ctx.now),H=K.hl;if(!H)fail("Игра не начата");const dir=G.p.dir==="up"?"up":"down",p=hlP(H.c,dir);
    if(p<=0)fail(dir==="up"?"Выше короля не бывает":"Ниже туза не бывает");const n=card13(),win=dir==="up"?n>H.c:n<H.c;
    if(!win){K.hl=null;return {n,win:0,lost:H.b}}H.m=Math.min(HL.cap,Math.round(H.m*HL.k/p*1000)/1000);H.c=n;H.s++;return {n,win:1,hl:H}},
  cas_cbset(G){if(!G.ctx.grant)fail("Неизвестное действие");const {st,ctx,p}=G;if(st.cbDay===p.d)fail("Кешбэк за вчера уже забран");st.cbDay=p.d;camp(st,ctx.now).runes+=p.runes;return {}},
  cas_mn_go(G){const {st,ctx}=G;const K=casDay(st,ctx.now);if(K.mn)fail("Сначала доиграй или забери выигрыш");const n=G.p.n|0;if(!MN.n.includes(n))fail("Выбери количество мин");casBet(st,ctx,G.p.bet,MN);
    const cells=[...Array(MN.size).keys()].sort(()=>Math.random()-.5);K.mn={b:Math.floor(+G.p.bet),n,m:cells.slice(0,n),o:[]};return {mn:{b:K.mn.b,n,o:[]},next:mnM(n,1),dg:dgCasDrop(st,ctx,"hl")}},
  cas_mn(G){const {st,ctx}=G;const K=casDay(st,ctx.now),M=K.mn;if(!M)fail("Игра не начата");const i=G.p.i|0;if(i<0||i>=MN.size||M.o.includes(i))fail("Эта клетка уже открыта");
    if(M.m.includes(i)){K.mn=null;return {boom:1,i,mines:M.m,lost:M.b}}M.o.push(i);const m=mnM(M.n,M.o.length);
    if(M.o.length>=MN.size-M.n){const w=Math.floor(M.b*m);camp(st,ctx.now).runes+=w;K.mn=null;return {i,m,win:w,all:1,mines:M.m}}return {i,m,next:mnM(M.n,M.o.length+1),o:M.o}},
  cas_mn_take(G){const {st,ctx}=G;const K=casDay(st,ctx.now),M=K.mn;if(!M)fail("Игра не начата");if(!M.o.length)fail("Открой хотя бы одну клетку");
    const m=mnM(M.n,M.o.length),w=Math.floor(M.b*m);camp(st,ctx.now).runes+=w;K.mn=null;return {win:w,m,mines:M.m}},
  cas_rk_bet(G){if(!G.ctx.grant)fail("Неизвестное действие");casBet(G.st,G.ctx,G.p.bet,RKT);return {dg:dgCasDrop(G.st,G.ctx,"hl")}},
  cas_rk_go(G){const {st,ctx}=G;const K=casDay(st,ctx.now);let prev=null;if(K.rk)prev=rkEnd(st,ctx,K,0);casBet(st,ctx,G.p.bet,RKT);
    const a=+G.p.auto||0;K.rk={b:Math.floor(+G.p.bet),t0:ctx.now,cr:rkCr(),auto:a>=1.1&&a<=RKT.cap?Math.round(a*100)/100:0};return {t0:ctx.now,k:RKT.k,auto:K.rk.auto,prev,dg:dgCasDrop(st,ctx,"hl")}},
  cas_rk(G){const {st,ctx}=G;const K=casDay(st,ctx.now),R=K.rk;if(!R)return {end:1,none:1};const m=rkM(ctx.now-R.t0);
    if(G.p.take||m>=R.cr||(R.auto&&m>=R.auto))return rkEnd(st,ctx,K,!!G.p.take);return {fly:1,m,el:ctx.now-R.t0}},
  cas_hl_take(G){const {st,ctx}=G;const K=casDay(st,ctx.now),H=K.hl;if(!H)fail("Игра не начата");if(!H.s)fail("Сначала угадай хотя бы одну карту");
    const C=camp(st,ctx.now),w=Math.floor(H.b*H.m);C.runes+=w;K.hl=null;return {win:w}},
  camp_collect(G){const {st,ctx}=G;const C=camp(st,ctx.now);if(!C.lv.sq)fail("Сначала найми оруженосца");const g=campSq(C,ctx.now);if(g<1)fail("Оруженосец ещё ничего не натренировал");
    C.runes+=g;C.total+=g;campEarn(C,ctx.now,g);C.sqAt=ctx.now;return {gain:g}},
  wheel(G){const {st,ctx}=G;if(st.wheelDay===today(ctx.now))fail("Колесо уже крутилось сегодня. Приходи завтра");
    st.wheelDay=today(ctx.now);const i=pick(WHEEL.map(x=>x.w)),W=WHEEL[i];let card=null;
    if(W.sp)st.spins+=W.sp;if(W.cash)earn(st,W.cash);if(W.guar)st.guar=(st.guar||0)+1;
    if(W.leg){if(G.cards.length<capOf(st)){const pool=HEROES.map((H,k)=>k).filter(k=>HEROES[k][2]===3);card=makeCard(ctx,pool[Math.floor(Math.random()*pool.length)],0);addCard(G,card)}else{st.guar=(st.guar||0)+1;earn(st,1000)}}
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
  /* выдача конкретной карточки администратором (компенсации). Тираж и номер проверяются как обычно */
  adm_card(G){if(!G.ctx.grant)fail("Неизвестное действие");const {st,ctx,p}=G,h=p.h|0,f=p.f|0;if(!HEROES[h]||!FIN[f])fail("Нет такой карточки");
    const c=makeCard(ctx,h,f,p.stats?{stats:p.stats}:null);if(p.sn){const s=String(p.sn).replace(/\D/g,"").padStart(6,"0");if(!ctx.snFree(s))fail("Номер "+s+" уже занят");c.sn=s;ctx.takeSn(s)}
    if(p.v)c.v=+p.v;if(p.xp)c.xp=+p.xp;if(p.stars)c.stars=+p.stars;c.how="prize";G.cards.push(c);noteCard(st,c);return {card:c}},
  grant(G){if(!G.ctx.grant)fail("Неизвестное действие");const {st,ctx,p}=G,I=SHOP[p.item];if(!I)fail("Нет такого товара");
    st.pays=st.pays||[];if(st.pays.includes(p.pid))return {dup:1};
    const got=[],add=c=>{c.how="chest";G.cards.push(c);noteCard(st,c);got.push(c)};   // купленное кладётся сверх лимита коллекции
    if(I.sp)st.spins+=I.sp;if(I.guar)st.guar=(st.guar||0)+I.guar;if(I.once)st.newbie=1;if(I.luckH)st.luckU=Math.max(st.luckU||0,ctx.now)+I.luckH*36e5;if(I.horn)st.warXD=today(ctx.now);
    for(let i=0;i<(I.halves||0);i++)add(rollHalf(ctx,i===0&&I.right1?1:I.rightP));
    if(I.any)add(makeAny(ctx,p.h|0,p.f|0));
    if(I.twins){const d=rollDuo(ctx);if(d)add(d);else st.guar=(st.guar||0)+3}
    if(I.cards){let n=I.cards;
      {const dp=DIA_P[p.item];if(dp&&!ctx.noRare&&Math.random()<dp){const d=rollDia(ctx);if(d){add(d);n--}}}   // 💎 шанс на Алмазную серию
      if(I.myth){add(rollTier(ctx,4,DON));n--}
      if(I.leg){add(!I.myth&&Math.random()<DON_P.legend?rollTier(ctx,-1,DON):rollTier(ctx,3));n--}
      const op=ONE_P[p.item];if(op&&Math.random()<op){const one=rollOne(ctx);if(one){add(one);n--}}
      if(I.epic){add(rollCard(ctx,true));n--}
      for(;n>0;n--)add(rollCard(ctx,false))}
    st.pays.push(p.pid);if(st.pays.length>40)st.pays=st.pays.slice(-40);
    return {item:p.item,sp:I.sp||0,guar:I.guar||0,cards:got}},

  /* странствующий торговец: покупка (цену и карточку назначает сервер) и продажа ему нужного воина */
  trader_take(G){const T=G.ctx.trader;if(!T)fail("Неизвестное действие");const {st,ctx}=G;if(G.cards.length>=capOf(st))fail("Коллекция заполнена ("+capOf(st)+"). Продай лишнее или расширь место");
    pay(st,T.price);const card=makeCard(ctx,T.h,T.f,{stats:T.stats,hue:T.hue});card.v=T.v;card.how="trader";addCard(G,card);return {card,price:T.price}},
  trader_give(G){const T=G.ctx.trader;if(!T)fail("Неизвестное действие");const c=burnable(freeCard(G,G.p.id));if(c.h!==T.h)fail("Торговец ищет другого воина");
    const got=Math.round(c.v*T.k*100)/100;burn(G,[c.id]);earn(G.st,got);return {got}},
  title_buy(G){const T=TITLES[G.p.k];if(!T)fail("Нет такого титула");if(T.ex)fail("Этот титул — награда конкурса «Звезда Эпох»");if(T.pass)fail("Этот титул — награда сезонного пропуска");if(T.sup)fail("Этот титул дают за поддержку проекта от "+SUP.title+" ⭐");if(T.stars)fail("Этот титул покупается за ⭐ в Сокровищнице");const st=G.st;st.titles=st.titles||[];if(st.titles.includes(G.p.k))fail("Этот титул уже твой");
    pay(st,T.price);st.titles.push(G.p.k);st.title=G.p.k;return {k:G.p.k}},
  title_grant(G){if(!G.ctx.grant)fail("Неизвестное действие");const k=G.p.k,st=G.st;if(!TITLES[k])fail("Нет такого титула");st.titles=st.titles||[];const newT=!st.titles.includes(k);if(newT)st.titles.push(k);if(!G.p.keep||!st.title)st.title=k;return {k,newT}},
  cos_grant(G){if(!G.ctx.grant)fail("Неизвестное действие");const {st,p}=G,t=p.t==="pbg"?"pbg":"dfx",L=t==="pbg"?PBG:DFX;if(!L[p.k])fail("Нет такого");st[t]=st[t]||[];const nw=!st[t].includes(p.k);if(nw)st[t].push(p.k);st[t+"On"]=p.k;return {t,k:p.k,nw}},
  cos_set(G){const {st,p}=G,t=p.t==="pbg"?"pbg":"dfx",k=String(p.k||"");if(k&&!(st[t]||[]).includes(k))fail("Сначала купи");st[t+"On"]=k;return {t,k}},
  present_note(G){if(!G.ctx.grant)fail("Неизвестное действие");const st=G.st;st.prs=(st.prs||[]).slice(-4);st.prs.push({f:String(G.p.f||"Друг").slice(0,32),w:G.p.w,t:G.ctx.now});return {}},
  present_seen(G){G.st.prs=[];return {}},
  title_set(G){const st=G.st,k=G.p.k||"";if(k&&!(st.titles||[]).includes(k))fail("Сначала купи этот титул");st.title=k;return {k}},
  /* выигрыш аукциона: только сервер, карточка кладётся даже сверх лимита */
  auc_win(G){const A=G.ctx.auc;if(!A)fail("Неизвестное действие");const card=makeCard(G.ctx,A.h,A.f,{stats:A.stats,hue:A.hue});card.v=A.v;card.how="auction";G.cards.push(card);noteCard(G.st,card);return {card}},
  /* награда за сезон рейтинга: только сервер */
  season_prize(G){if(!G.ctx.season)fail("Неизвестное действие");const {st,ctx,p}=G;if(p.sp)st.spins+=p.sp;if(p.guar)st.guar=(st.guar||0)+p.guar;let card=null;
    if(p.tier){card=rollTier(ctx,p.tier);card.how="chest";G.cards.push(card);noteCard(st,card)}return {card}},

  /* Покорение: бой отрядом из 3 воинов за точку карты */
  conq_fight(G){const {st,ctx,p}=G;const Q=conqDay(st,ctx.now),n=p.n|0;if(n<0||n>=conqN())fail("Нет такой точки");if(n>Q.c)fail("Сначала пройди предыдущие точки");
    if(conqLeft(st,Q)<=0)fail("Факелы закончились. Купи ещё за руны или выполни задание дня — за каждое +1 🔥");
    const ids=[...new Set(p.ids||[])].slice(0,3);if(ids.length!==3)fail("Выбери 3 воинов в отряд");const me=ids.map(id=>notHalf(battleCard(G,id),"Половинки не воюют"));
    const S=conqStage(n),dk=dgBonus(st,ctx.now);Q.t++;
    const rounds=S.foes.map((F,j)=>{const a=Math.round(conqPow(me[j],S.weak)*(1+dk)*(.88+Math.random()*.24)),b=Math.round(F.p*(.88+Math.random()*.24));return {a,b,w:a>b?1:0,h:F.h,id:me[j].id,bonus:ERA_OF[me[j].h]===S.weak?1:0}});
    const w=rounds.filter(r=>r.w).length,win=w>=2,stars=win?w:0;let reward=null,first=false,perfect=false;
    me.forEach((c,j)=>addXp(ctx,c,rounds[j].w?25:10));
    if(win){passAdd(st,ctx,"conq",1);const old=Q.s[n]||0;
      if(n===Q.c){first=true;Q.c=n+1;const r=S.r,C=camp(st,ctx.now);reward={cash:r.cash,runes:r.runes,sp:r.sp};earn(st,r.cash);C.runes+=r.runes;st.spins+=r.sp;
        if(st.dg){reward.dgxp=dgAddXp(st,ctx,DG.conqXp);st.dg.sh=(st.dg.sh||0)+DG.conqSh;reward.dgsh=DG.conqSh}
        if(r.card!=null){const c=rollTier(ctx,r.card);c.how="conq";G.cards.push(c);noteCard(st,c);reward.card=c}}
      if(stars===3&&old<3){perfect=true;st.spins+=1;reward=reward||{};reward.sp3=1}
      Q.s[n]=Math.max(old,stars)}
    return {rounds,win,stars,reward,first,perfect,n,left:conqLeft(st,Q),dk}},
  conq_buy(G){const {st,ctx}=G;const Q=conqDay(st,ctx.now);if(Q.b>=CONQ.buyMax)fail("Сегодня уже куплено "+CONQ.buyMax+" факелов. Завтра снова");const pr=conqBuyPrice(Q),C=camp(st,ctx.now);
    if(C.runes<pr)fail("Нужно "+pr.toLocaleString("ru")+" рун — потренируйся в лагере");C.runes-=pr;Q.b++;Q.x++;return {price:pr,left:conqLeft(st,Q),bought:Q.b}},

  /* Слияние душ: сжечь копии того же воина вместо уровня и монет. ★1 — 1 копия, ★2 — 2, … ★5 — 5 */
  fuse(G){const {st,ctx,p}=G;const c=notHalf(own(G,p.id));if(c.listed)fail("Карточка на рынке");if(FIN[c.f].excl)fail("Эту карточку не усилить");
    const s=c.stars||0;if(s>=STAR_MAX)fail("Уже максимум звёзд");const need=s+1,ids=[...new Set(p.ids||[])].filter(x=>x!==c.id);
    if(ids.length!==need)fail("Для ★"+(s+1)+" нужно "+need+" "+(need===1?"копия":"копии")+" этого воина");
    const don=ids.map(id=>{const d=notHalf(burnable(freeCard(G,id)),"Половинки не сжечь");if(d.h!==c.h)fail("Сжечь можно только копии этого же воина");if(FIN[d.f].excl)fail("Эту карточку нельзя сжечь");return d});
    const sum=don.reduce((a,d)=>a+d.v,0);burn(G,ids);c.stars=s+1;c.v=Math.round((c.v*STAR_V+sum*.2)*100)/100;c.xp=Math.max(c.xp||0,0);
    passAdd(st,ctx,"up",1);passAdd(st,ctx,"craft",1);return {stars:c.stars,v:c.v,burned:need}},

  /* боевой пропуск: забрать награду уровня */
  pass_claim(G){const {st,ctx,p}=G;const P=passState(st,ctx.now),lv=p.lv|0,prem=!!p.prem;if(lv<1||lv>PASS.lv)fail("Нет такого уровня");
    if(passLv(P)<lv)fail("Сначала дойди до "+lv+" уровня");if(prem&&P.prem!==P.s)fail("Награды пропуска — после покупки пропуска");
    const L=prem?P.p:P.f;if(L.includes(lv))fail("Уже получено");L.push(lv);const r=passReward(lv,prem),out={};
    if(r.cash){earn(st,r.cash);out.cash=r.cash}if(r.runes){camp(st,ctx.now).runes+=r.runes;out.runes=r.runes}if(r.sp){st.spins+=r.sp;out.sp=r.sp}if(r.guar){st.guar=(st.guar||0)+r.guar;out.guar=r.guar}
    if(r.card!=null){const c=rollTier(ctx,r.card);c.how="pass";G.cards.push(c);noteCard(st,c);out.card=c}
    if(r.title){st.titles=st.titles||[];if(!st.titles.includes("season"))st.titles.push("season");out.title=1}
    if(r.frame){st.frames=st.frames||[];if(!st.frames.includes("season"))st.frames.push("season");out.frame=1}
    return out},

  /* ---------- дракон ---------- */
  dg_story(G){const st=G.st,h=v=>{v=String(v||"").trim().replace(/^https?:\/\/(www\.)?(instagram\.com|t\.me)\//i,"").replace(/^@/,"").replace(/[/?#].*$/,"");return /^[A-Za-z0-9_.]{3,40}$/.test(v)?v:""};
    if(st.dg)fail("Дракон уже с тобой");const tg=h(G.p.tg),ig=h(G.p.ig);if(!tg&&!ig)fail("Укажи свой ник в Telegram или Instagram, где выложил историю");
    st.dgStory={t:G.ctx.now,tg,ig};return {tg,ig}},
  dg_hatch(G){const {st,ctx}=G;if(st.dg)fail("Яйцо уже раскололось");if(!ctx.admin&&!st.dgStory&&(ctx.dgFr||0)<DG.fr)fail("Яйцо ещё не готово. Позови друзей: "+(ctx.dgFr||0)+" из "+DG.fr);
    const b=dgBreedRoll(DG_BR_P),D={b,name:"",lv:1,xp:0,sat:80,satAt:ctx.now,inv:[],eq:{},sh:60,nid:0,t:ctx.now,ap:1};const it=dgNewItem(D,0,DG_BREED[b].k==="fire"?"fire":DG_BREED[b].k==="ice"?"ice":null,"head");D.inv.push(it);D.eq.head=it.id;
    dgDay(D,ctx.now);st.dg=D;return {b}},
  dg_name(G){const D=G.st.dg;if(!D)fail("Сначала нужен дракон");const n=String(G.p.name||"").replace(/[^0-9A-Za-zА-Яа-яЁё _\-]/g,"").replace(/\s+/g," ").trim().slice(0,DG.nameMax);if(n.length<2)fail("Имя — от 2 до "+DG.nameMax+" букв");D.name=n;return {name:n}},
  dg_tap(G){const {st,ctx}=G;const D=st.dg;if(!D)fail("Сначала нужен дракон");if(dgAway(D,ctx.now))return {n:0,xp:0,away:1};dgDay(D,ctx.now);const n=Math.max(0,Math.min(60,G.p.n|0,DG.tapCap-(D.tp||0)));if(!n)return {n:0,xp:0,cap:1};
    D.tp=(D.tp||0)+n;return {n,xp:dgAddXp(st,ctx,n),tp:D.tp}},
  dg_feed(G){const {st,ctx}=G;const D=st.dg;if(!D)fail("Сначала нужен дракон");if(dgAway(D,ctx.now))fail("Дракон в походе — покормишь, когда вернётся");dgDay(D,ctx.now);const F=DG_FOOD[G.p.k];if(!F)fail("Такой еды нет");const sat=dgSat(D,ctx.now);
    if(G.p.k==="apple"){if(!(D.ap>0))fail("Золотых яблок нет. Их можно купить за ⭐");D.ap--}
    else{if((D.fd||0)>=DG.feedMax)fail("Дракон сыт на сегодня: можно кормить "+DG.feedMax+" раз в день");if(sat>=99)fail("Дракон не голоден");
      if(F.runes){const C=camp(st,ctx.now);if(C.runes<F.runes)fail("Не хватает рун: нужно "+F.runes.toLocaleString("ru")+" 💠");C.runes-=F.runes}if(F.cash)pay(st,F.cash);D.fd=(D.fd||0)+1}
    D.sat=Math.min(100,sat+F.sat);D.satAt=ctx.now;return {xp:dgAddXp(st,ctx,F.xp),sat:Math.round(D.sat),fd:D.fd}},
  dg_nest(G){const {st,ctx}=G;const D=st.dg;if(!D)fail("Сначала нужен дракон");dgDay(D,ctx.now);if(D.nest)fail("Гнездо уже собрано сегодня");
    if(!(D.fd>=1)||(D.tp||0)<DG.nestTaps)fail("Покорми дракона и погладь его "+DG.nestTaps+" раз — тогда в гнезде появится чешуя");
    const n=20+dgStage(D.lv)*6+(DG_BREED[D.b].r)*5;D.nest=1;D.sh=(D.sh||0)+n;return {sh:n}},
  dg_gift(G){const {st,ctx}=G;const D=st.dg;if(!D)fail("Сначала нужен дракон");dgDay(D,ctx.now);const g=DG_STAGE[dgStage(D.lv)].gift;
    if(!g)fail("Дракон начнёт приносить прокрутки, когда станет юным (10 уровень)");if(D.gift)fail("Дар уже получен сегодня");if(dgSat(D,ctx.now)<DG.hungry)fail("Голодный дракон ничего не приносит. Покорми его");
    D.gift=1;st.spins+=g;return {sp:g}},
  dg_open(G){const {st,ctx}=G;const D=st.dg;if(!D)fail("Сначала нужен дракон");const K=DG_CHEST[G.p.k];if(!K||!K.sh)fail("Такого сундука нет");
    if((D.inv||[]).length>=DG.invMax)fail("Сумка дракона полная ("+DG.invMax+"). Разбери лишнее на чешую");if((D.sh||0)<K.sh)fail("Не хватает чешуи: нужно "+K.sh);
    D.sh-=K.sh;const it=dgNewItem(D,pick(K.p));D.inv.push(it);let gem=null;if(Math.random()<(G.p.k==="royal"?.25:.06)){gem=dgGemRoll(G.p.k==="royal"?.2:0);dgGemAdd(D,gem)}return {item:it,gem}},
  dg_exp(G){const {st,ctx}=G,D=st.dg;if(!D)fail("Сначала нужен дракон");if(D.exp)fail(dgAway(D,ctx.now)?"Дракон уже в походе":"Сначала забери добычу из прошлого похода");
    const E=DG_EXP.find(x=>x.k===G.p.k);if(!E)fail("Нет такого похода");if(dgSat(D,ctx.now)<DG.hungry)fail("Голодный дракон в поход не пойдёт — сначала покорми");
    D.exp={k:E.k,at:ctx.now,end:ctx.now+E.h*3600e3};return {exp:D.exp}},
  dg_exp_end(G){const {st,ctx}=G,D=st.dg;if(!D||!D.exp)fail("Дракон не в походе");if(ctx.now<D.exp.end)fail("Дракон ещё в пути");const E=DG_EXP.find(x=>x.k===D.exp.k)||DG_EXP[0];D.exp=null;
    const sc=1+dgStage(D.lv)*.15,out={k:E.k,sh:Math.round((E.sh[0]+Math.random()*(E.sh[1]-E.sh[0]))*sc),xp:0,gems:[],item:null,apple:0,sp:E.sp};D.sh=(D.sh||0)+out.sh;out.xp=dgAddXp(st,ctx,E.xp)||E.xp;
    if(Math.random()<E.gem){const g=dgGemRoll(E.up);dgGemAdd(D,g);out.gems.push(g)}if(E.h>=8&&Math.random()<.25){const g=dgGemRoll(E.up);dgGemAdd(D,g);out.gems.push(g)}
    if(Math.random()<E.item&&(D.inv||[]).length<DG.invMax){const r=Math.random()<.1?3:Math.random()<.35?2:1,it=dgNewItem(D,r);D.inv.push(it);out.item=it}
    if(Math.random()<E.apple){D.ap=(D.ap||0)+1;out.apple=1}if(E.sp)st.spins+=E.sp;return out},
  dg_gem_set(G){const D=G.st.dg;if(!D)fail("Сначала нужен дракон");const n=dgSockN(D),i=G.p.i|0;if(i<0||i>=n)fail("Это гнездо для гема ещё закрыто");D.sock=D.sock||[];D.gems=D.gems||{};
    const old=D.sock[i]||null,g=G.p.g?String(G.p.g):null;if(g&&!(D.gems[g]>0))fail("Такого гема нет");if(old)dgGemAdd(D,old);if(g){D.gems[g]--;if(!D.gems[g])delete D.gems[g]}D.sock[i]=g;return {sock:D.sock}},
  dg_gem_merge(G){const D=G.st.dg;if(!D)fail("Сначала нужен дракон");const m=/^([a-z]+)([12])$/.exec(String(G.p.g||""));if(!m||!DG_GEM[m[1]])fail("Этот гем нельзя улучшить");D.gems=D.gems||{};
    if((D.gems[G.p.g]||0)<DG_GEM_MERGE)fail("Нужно "+DG_GEM_MERGE+" одинаковых гема");D.gems[G.p.g]-=DG_GEM_MERGE;if(!D.gems[G.p.g])delete D.gems[G.p.g];const ng=m[1]+(+m[2]+1);dgGemAdd(D,ng);return {g:ng}},
  /* 🎾 игра с драконом: ловим мячики, до DG_PLAY раз в день. Опыт и чешуя зависят от числа пойманных (0–8) */
  dg_play(G){const {st,ctx}=G,D=st.dg;if(!D)fail("Сначала нужен дракон");if(dgAway(D,ctx.now))fail("Дракон в походе");const d=today(ctx.now);if(!D.pl||D.pl.d!==d)D.pl={d,n:0};
    if(D.pl.n>=DG_PLAY)fail("Дракон наигрался — приходи завтра 😴");D.pl.n++;const hits=Math.max(0,Math.min(8,G.p.hits|0)),xp=dgAddXp(st,ctx,30+hits*25),sh=hits>=6?3+hits:hits;D.sh=(D.sh||0)+sh;
    return {xp,sh,hits,left:DG_PLAY-D.pl.n}},
  dg_morning(G){const {st,ctx}=G,D=st.dg;if(!D)fail("Сначала нужен дракон");const h=new Date(ctx.now+3*3600e3).getUTCHours();if(h<7||h>=12)fail("«Доброе утро» — с 7 до 12 часов");
    if(D.morn===today(ctx.now))fail("Сегодня уже здоровались 😊");D.morn=today(ctx.now);const xp=dgAddXp(st,ctx,200)||200;st.spins+=1;return {xp,sp:1}},
  dg_evo(G){const D=G.st.dg;if(!D)fail("Сначала нужен дракон");if(D.evo)fail("Путь уже выбран");if(D.lv<DG_EVO_LV)fail("Эволюция открывается с "+DG_EVO_LV+" уровня");const k=String(G.p.k||"");if(!DG_EVO[k])fail("Нет такого пути");D.evo=k;return {evo:k}},
  dg_skin(G){const D=G.st.dg;if(!D)fail("Сначала нужен дракон");const k=G.p.k?String(G.p.k):null;if(k&&!(D.skins||[]).includes(k))fail("Этот облик ещё не куплен");D.skin=k;return {skin:k}},
  dg_skin_grant(G){if(!G.ctx.grant)fail("Неизвестное действие");const D=G.st.dg;if(!D)fail("Сначала нужен дракон");const k=String(G.p.k||"");if(!DG_SKIN[k])fail("Нет такого облика");D.skins=D.skins||[];if(!D.skins.includes(k))D.skins.push(k);D.skin=k;return {skin:k}},
  dga_apply(G){const A=G.ctx.dga;if(!A)fail("Неизвестное действие");const st=G.st,D=st.dg;if(!D)fail("Сначала нужен дракон");const d=today(G.ctx.now);st.dgA=st.dgA&&st.dgA.d===d?st.dgA:{d,n:0};
    if(dgAway(D,G.ctx.now))fail("Дракон в походе — арена после возвращения");const lim=DGA.day+(vipTier(st)?DGA.vipDay:0);if(st.dgA.n>=lim)fail("Бои на арене на сегодня закончились ("+lim+"). Завтра — новые!");if(A.check)return {left:lim-st.dgA.n};
    st.dgA.n++;const R=A.win?DGA.win:DGA.lose;D.sh=(D.sh||0)+R.sh;dgAddXp(st,G.ctx,R.xp);let gem=null;if(A.win&&Math.random()<.08){gem=dgGemRoll(0);dgGemAdd(D,gem)}return {sh:R.sh,xp:R.xp,left:lim-st.dgA.n,gem}},
  dg_grant(G){if(!G.ctx.grant)fail("Неизвестное действие");const {st,ctx,p}=G;const D=st.dg;if(!D)fail("Сначала нужен дракон");st.pays=st.pays||[];if(st.pays.includes(p.pid))return {dup:1};
    let out={k:p.k};const K=DG_CHEST[p.k];
    if(K&&K.stars){const it=dgNewItem(D,pick(K.p));D.inv.push(it);D.sh=(D.sh||0)+K.bonus;out.item=it;out.sh=K.bonus}
    else if(p.k==="apple"){D.ap=(D.ap||0)+DG_SHOP.apple.ap;out.ap=D.ap}
    else if(p.k==="reborn"){const old=D.b;let b=old;for(let t=0;t<20&&b===old;t++)b=dgBreedRoll(DG_REB_P);D.b=b;out.b=b;out.old=old}
    else fail("Нет такого товара");
    st.pays.push(p.pid);if(st.pays.length>40)st.pays=st.pays.slice(-40);return out},
  dg_equip(G){const D=G.st.dg;if(!D)fail("Сначала нужен дракон");const it=(D.inv||[]).find(x=>x.id===(G.p.id|0));if(!it)fail("Предмет не найден");D.eq=D.eq||{};
    if(D.eq[it.s]===it.id)delete D.eq[it.s];else D.eq[it.s]=it.id;return {pow:dgPower(D)}},
  dg_up(G){const D=G.st.dg;if(!D)fail("Сначала нужен дракон");const it=(D.inv||[]).find(x=>x.id===(G.p.id|0));if(!it)fail("Предмет не найден");if((it.lv||0)>=DG.upMax)fail("Предмет уже улучшен до +"+DG.upMax);
    const c=dgUpCost(it);if((D.sh||0)<c)fail("Не хватает чешуи: нужно "+c);D.sh-=c;it.lv=(it.lv||0)+1;return {lv:it.lv,pow:dgPower(D)}},
  dg_dis(G){const D=G.st.dg;if(!D)fail("Сначала нужен дракон");const ids=new Set((G.p.ids||[]).map(x=>x|0));const eqIds=new Set(Object.values(D.eq||{}));let got=0,n=0;
    D.inv=(D.inv||[]).filter(it=>{if(!ids.has(it.id)||eqIds.has(it.id))return true;got+=Math.round(DG_R[it.r].dis*(1+.5*(it.lv||0)));n++;return false});if(!n)fail("Выбери предметы (надетые разбирать нельзя)");
    D.sh=(D.sh||0)+got;return {sh:got,n}},
  /* расширение коллекции: +10 мест за монеты (цена растёт) и +50 за звёзды (выдаёт сервер после оплаты) */
  cap_buy(G){const {st}=G;if(st.capC)fail("За монеты место расширяется только один раз. Дальше — за звёзды или VIP");const n=capCoinPrice(st);
    if(G.p.max!=null&&n>+G.p.max)fail("Цена изменилась — посмотри ещё раз");pay(st,n);st.capC=1;return {n,cap:capOf(st)}},
  slots_grant(G){if(!G.ctx.grant)fail("Неизвестное действие");const {st,p}=G;st.pays=st.pays||[];if(st.pays.includes(p.pid))return {dup:1};
    st.capS=Math.min(SLOT_STAR.max,(st.capS||0)+1);st.pays.push(p.pid);if(st.pays.length>40)st.pays=st.pays.slice(-40);return {cap:capOf(st),n:SLOT_STAR.n}},
  pass_grant(G){if(!G.ctx.grant)fail("Неизвестное действие");const P=passState(G.st,G.ctx.now);if((G.p.s|0)!==P.s)fail("Сезон уже сменился");P.prem=P.s;return {s:P.s}},
  pass_note(G){if(!G.ctx.grant)fail("Неизвестное действие");passAdd(G.st,G.ctx,String(G.p.k||""),Math.max(0,Math.min(1000,G.p.n|0)));return {}},
  topup(G){if(!G.ctx.test&&!G.ctx.admin)fail("Только в тестовом режиме");G.st.spins+=3;return {}}
};
/* выполнить действие: проверки времени, затем само действие */
/* ---------- 🐉 желания дракона: каждый день он просит 3 вещи. Выполнил — опыт и чешуя, все три — бонус ---------- */
const DG_WISH={tap:{n:"Погладь меня 30 раз",ic:"💜",need:30},feed:{n:"Покорми меня",ic:"🍖",need:1},fight:{n:"Сразись на арене",ic:"⚔️",need:1},spin:{n:"Открой 5 карточек",ic:"🎴",need:5},exp:{n:"Своди меня в поход",ic:"🎒",need:1},play:{n:"Поиграй со мной в мячик",ic:"🎾",need:1}};
const DG_WISH_R={xp:150,sh:5},DG_WISH_ALL={sp:2,xp:300};
function dgWishes(D,now){const d=today(now);if(!D.wish||D.wish.d!==d){let h=7;for(const ch of d+(D.name||"дракон"))h=(h*31+ch.charCodeAt(0))>>>0;const ks=Object.keys(DG_WISH),L=[];
    while(L.length<3){h=(Math.imul(h,1103515245)+12345)>>>0;const k=ks[(h>>>8)%ks.length];if(!L.includes(k))L.push(k)}D.wish={d,l:L,p:{},got:[],all:0}}return D.wish}
function dgWishAdd(st,now,k,n){const D=st.dg;if(!D||!n)return;const W=dgWishes(D,now);if(!W.l.includes(k)||W.got.includes(k))return;W.p[k]=Math.min(DG_WISH[k].need,(W.p[k]||0)+n)}
ACTIONS.dg_wish=function(G){const {st,ctx}=G,D=st.dg;if(!D)fail("Сначала нужен дракон");const W=dgWishes(D,ctx.now),k=String(G.p.k||"");
  if(!W.l.includes(k))fail("Сегодня дракон этого не просил");if(W.got.includes(k))fail("Уже выполнено");if((W.p[k]||0)<DG_WISH[k].need)fail("Ещё не выполнено");
  W.got.push(k);D.sh=(D.sh||0)+DG_WISH_R.sh;let xp=dgAddXp(st,ctx,DG_WISH_R.xp),all=null;
  if(W.got.length===3&&!W.all){W.all=1;st.spins+=DG_WISH_ALL.sp;xp+=dgAddXp(st,ctx,DG_WISH_ALL.xp);all=DG_WISH_ALL}return {k,xp,sh:DG_WISH_R.sh,all}};
/* прогресс желаний — от обычных действий */
{const H={dg_tap:(r,p)=>["tap",r&&r.n||0],dg_feed:()=>["feed",1],dga_apply:()=>["fight",1],open:()=>["spin",1],open_multi:r=>["spin",r&&r.cards?r.cards.length:0],dg_exp:()=>["exp",1],dg_play:()=>["play",1]};
  for(const k in H){const f=ACTIONS[k];if(!f)continue;ACTIONS[k]=function(G){const r=f.apply(this,arguments);try{const [w,n]=H[k](r,G.p);dgWishAdd(G.st,G.ctx.now,w,n)}catch(e){}return r}}}
function runAction(name,st,cards,ctx,p){const A=ACTIONS[name];if(!A)fail("Неизвестное действие");touch(st,ctx.now);const G={st,cards,ctx,p:p||{}};
  const D0=day(st,ctx.now),o0=D0.opened,w0=st.totalWins||0,c0=st.crafted||0;const res=A(G)||{};
  try{const D=day(st,ctx.now);passAdd(st,ctx,"open",Math.max(0,D.opened-o0));passAdd(st,ctx,"win",Math.max(0,(st.totalWins||0)-w0));
    if(name==="camp_tap")passAdd(st,ctx,"tap",res.n|0);if(name==="train"||name==="forge")passAdd(st,ctx,"up",1);if(name==="craft"||name==="merge")passAdd(st,ctx,"craft",1);
    if(name==="wheel")passAdd(st,ctx,"wheel",1);if(name==="sell")passAdd(st,ctx,"sell",1);if(name==="sellmany"||name==="sellcommon")passAdd(st,ctx,"sell",res.n|0||1)}catch(e){}
  return {res,cards:G.cards}}

/* титулы за деньги игры: покупаются один раз навсегда, деньги сгорают. Виден рядом с ником в топах, чате и рейтинге */
const TITLES={merchant:{n:"Купец",ic:"🪙",price:1e5},magnate:{n:"Магнат",ic:"💼",price:1e6},oligarch:{n:"Олигарх",ic:"🏦",price:1e7},tycoon:{n:"Повелитель золота",ic:"👑",price:1e8},season:{n:"Герой сезона",ic:"🎖",price:0,pass:1},
  immortal:{n:"Бессмертный",ic:"🔥",price:0,stars:300},emperor:{n:"Император",ic:"🏛",price:0,stars:700},author:{n:"Соавтор",ic:"✍️",price:0,stars:2000,month:3},
  patron:{n:"Меценат",ic:"❤️",price:0,sup:1},vstar:{n:"Звезда Эпох",ic:"🎬",price:0,ex:1}};
/* 🎨 косметика за ⭐: анимация выпадения карточки и фон профиля (видят все, кто открывает твою витрину) */
const DFX={storm:{n:"Гроза",ic:"⚡",stars:249},fire:{n:"Пламя",ic:"🔥",stars:249},stars:{n:"Звездопад",ic:"🌠",stars:249}};
const PBG={space:{n:"Космос",ic:"🌌",stars:199},lava:{n:"Лава",ic:"🌋",stars:199},aurora:{n:"Северное сияние",ic:"🌈",stars:199},gold:{n:"Золото",ic:"💰",stars:299}};
/* 🎁 подарок другу за ⭐: что можно подарить */
const PRESENT={vip:{n:"VIP на неделю",ic:"👑"},small:{n:"Малый сундук",ic:"🧰"},royal:{n:"Королевский сундук",ic:"👑"},"t:immortal":{n:"Титул «Бессмертный»",ic:"🔥"},"t:emperor":{n:"Титул «Император»",ic:"🏛"},"d:fire":{n:"Анимация «Пламя»",ic:"🔥"},"b:space":{n:"Фон «Космос»",ic:"🌌"}};
/* ❤️ поддержать проект: игрок сам выбирает сумму. От SUP.title ⭐ за всё время — титул «Меценат» */
const SUP={min:10,max:2500,title:100};
/* 🌟 Звезда дня: ник и самая дорогая карточка игрока весь день на главной у всех. Один игрок в день, очередь на следующие свободные дни */
const SDAY={stars:250,ahead:60};
/* аукцион дня: с 8:00 до 20:00 по Минску одна редкая карточка, ставка в последние 30 секунд продлевает торги */
const AUC_HOUR=8, AUC_MS=12*3600e3, AUC_EXT=30e3, AUC_STEP=.05;
const TRADER_MS=3*3600e3, TRADER_MARKUP=[1.5,1.6], TRADER_WANT_K=1.3, TRADER_WANT_N=5;

/* ===================== 🗺 КАРТА МИРА: 50 регионов, бои карточками за землю ===================== */
const MAP_R=[["Рим","🏛","ant"],["Спарта","⚔️","troy"],["Троя","🐴","troy"],["Вавилон","🦁","emp"],["Мемфис","🐫","emp"],["Карфаген","⛵","ant"],["Персеполь","🔥","emp"],["Олимп","⚡","myth"],
 ["Афины","🏺","troy"],["Микены","👑","troy"],["Фивы","🗡","troy"],["Киото","🌸","jap"],["Эдо","🏯","jap"],["Ниппон","🗾","jap"],["Осло","❄️","nor"],["Упсала","🪓","nor"],["Валгалла","🌈","myth"],["Новгород","🛡","mid"],["Киев","⛪","mid"],["Париж","🗼","mid"],["Лондон","🏰","mid"],["Толедо","🤺","mid"],["Самарканд","🕌","nor"],["Каракорум","🐎","nor"],["Акрополь","🏛","ant"],["Александрия","📜","emp"],
 ["Вена","🎻","mid"],["Прага","🍺","mid"],["Краков","🦅","mid"],["Москва","❄️","mid"],["Казань","🌾","nor"],["Тула","🐻","mid"],["Сибирь","🌨","nor"],["Альпы","⛰","mid"],["Галлия","🍇","ant"],["Британия","☂️","mid"],["Дели","🐘","emp"],["Пекин","🐉","emp"],
 ["Лхаса","🏔","jap"],["Тибет","🧘","jap"],["Сиам","🐅","jap"],["Ангкор","🛕","jap"],["Майя","🗿","myth"],["Ацтеки","🌞","myth"],["Инки","🦙","myth"],["Сахара","🏜","emp"],["Нил","🐊","emp"],["Мекка","🌙","emp"],["Багдад","🌴","emp"],["Иерусалим","⭐","ant"],
 ["Трон Драконов","🐲","drg"],["Огненный пик","🌋","drg"],["Ледяной перевал","🧊","drg"],["Грозовой утёс","🌩","drg"],["Болото Гидры","🐍","drg"],["Золотое логово","💰","drg"],["Теневой каньон","🌑","drg"],["Кладбище драконов","🦴","drg"],["Небесный шпиль","☁️","drg"],["Пепельные врата","🔥","drg"],
 ["Крепость Братства","🏰","ally"],["Мост Клятвы","🌉","ally"],["Башня Двух Мечей","⚔️","ally"],["Застава Щитов","🛡","ally"],["Храм Союза","⛩","ally"],["Порт Побратимов","⚓","ally"],["Ущелье Верных","🗻","ally"],["Цитадель Альянса","🏯","ally"],
 ["Дальний берег","🏝","far"],["Туманная бухта","🌫","far"],["Медвежий лес","🐻","far"],["Соляные копи","🧂","far"],["Северный дозор","🗼","far"],["Волчья пустошь","🐺","far"],["Каменный брод","🪨","far"],["Кедровая падь","🌲","far"],["Ястребиный утёс","🦅","far"],["Янтарный берег","🟠","far"],["Лисья нора","🦊","far"],["Старая мельница","🌾","far"],["Сосновый бор","🌲","far"],["Речные пороги","🌊","far"],["Вересковый холм","🌸","far"],["Южная гавань","⚓","far"],["Пыльный тракт","🛤","far"],["Тихая заводь","🦆","far"],["Серебряный ручей","💧","far"],["Дикий луг","🌼","far"],
 ["Кратер Ярости","🌋","drg"],["Обсидиановая гряда","🖤","drg"],["Логово Вирма","🐲","drg"],["Пещера Эха","🕳","drg"],["Рубиновый грот","💎","drg"],["Змеиный перевал","🐍","drg"],["Гнездо Виверн","🪺","drg"],["Дымные топи","💨","drg"],["Костяной трон","☠️","drg"],
 ["Форт Двух Знамён","🏳","ally"],["Застава Рассвета","🌅","ally"],["Бастион Клятвы","🧱","ally"],["Дозорная башня","🗼","ally"],["Крепость Друзей","🤝","ally"],["Мост Верности","🌁","ally"],["Остров Братьев","🏝","ally"],["Цитадель Двух Корон","👑","ally"]];
const AL0=60,MAP_Z=i=>i>=97?4:i>=88?3:i>=68?0:i>=AL0?4:i>=50?3:i<8?2:i<26?1:0,DGL0=50,DGL_THRONE=50;
const MAP={att:3,max:3,shield:2*3600e3,home:.15,fat:.08,fatMax:.4,pack:3,packMax:2,packStars:49,z1Spins:50,z2Stage:2,capH:24,
  inc:[{c:60,r:10},{c:150,r:25},{c:400,r:60},{c:300,r:50},{c:280,r:45}],zn:["Окраины","Земли эпох","Сердце мира","Земля драконов","Земли союзов"],zc:["#22995a","#6a33d6","#d08a12","#c22a1e","#1a8fd6"],
  amax:1,ashield:3*3600e3,afat:.07,afatMax:.35,statue:249,
  dmax:1,dshield:3*3600e3,dfat:.07,dfatMax:.35,dthr:2};
/* 🐉 Земля драконов: логова захватывают и держат только драконы. Тронное логово — двойной доход */
/* id карты: 0–49 мир, 50–59 и 88–96 логова драконов, 60–67 и 97–104 крепости союзов, 68–87 дальние окраины мира */
const MAP_W=[...Array(50).keys(),...Array.from({length:20},(x,i)=>68+i)],MAP_DG=[50,51,52,53,54,55,56,57,58,59,88,89,90,91,92,93,94,95,96],MAP_AL=[60,61,62,63,64,65,66,67,97,98,99,100,101,102,103,104];
/* соты острова: центр + кольца, ближайшие n клеток */
function hexIsland(n,R,cx,cy){const W=Math.sqrt(3)*R,all=[];for(let r=-5;r<=5;r++)for(let c=-5;c<=5;c++){const x=c*W+(Math.abs(r)%2?W/2:0),y=r*R*1.5;all.push({x:cx+x,y:cy+y,d:Math.hypot(x,y*1.05)+(Math.abs(r)%2?.01:0)})}all.sort((a,b)=>a.d-b.d);return all.slice(0,n)}
const mapInc=id=>{const I=MAP.inc[MAP_Z(id)];return id===DGL_THRONE?{c:I.c*MAP.dthr,r:I.r*MAP.dthr}:I};
const MFLAG={fire:{n:"Огненный флаг",ic:"🔥",stars:99},gold:{n:"Золотой флаг",ic:"👑",stars:149},skull:{n:"Пиратский флаг",ic:"☠️",stars:149},dragon:{n:"Флаг дракона",ic:"🐉",stars:199},photo:{n:"Флаг со своим фото",ic:"📸",stars:199},conq:{n:"Флаг завоевателя",ic:"🎖",stars:0,pass:1}};
const MPASS={stars:299,th:[5,12,20,30,42,56,72,90,110,135],pts:{cap:5,def:2,claim:1},
  free:[{sp:2},{cash:500},{sp:3},{runes:2000},{sp:4},{cash:2000},{sp:5},{runes:5000},{sp:6},{sp:10}],
  prem:[{sp:5},{cash:3000},{sp:8},{guar:1},{sp:10},{runes:15000},{sp:12},{leg:1},{sp:15},{sp:20,flag:"conq"}]};
const mapMon=now=>new Date(now+3*3600e3).toISOString().slice(0,7);
function mapPass(st,now){const m=mapMon(now);if(!st.mpass||st.mpass.m!==m)st.mpass={m,pts:0,prem:0,got:[],gotP:[]};return st.mpass}
const mapLv=P=>MPASS.th.filter(x=>P.pts>=x).length;
function mapAtt(st,now){const d=today(now);if(!st.mp||st.mp.d!==d)st.mp={d,used:0,extra:0,packs:0};return st.mp}
function mapGive(G,R){const {st,ctx}=G,o={};if(R.sp){st.spins+=R.sp;o.sp=R.sp}if(R.cash){earn(st,R.cash);o.cash=R.cash}if(R.runes){camp(st,ctx.now).runes+=R.runes;o.runes=R.runes}if(R.guar){st.guar=(st.guar||0)+R.guar;o.guar=1}
  if(R.leg){const pool=HEROES.map((H,k)=>k).filter(k=>isBase(k)&&HEROES[k][2]===3);const c=makeCard(ctx,pool[Math.floor(Math.random()*pool.length)],0);c.how="pass";G.cards.push(c);noteCard(st,c);o.card=c}
  if(R.flag){st.mflags=st.mflags||[];if(!st.mflags.includes(R.flag))st.mflags.push(R.flag);st.mflagOn=R.flag;o.flag=R.flag}return o}
Object.assign(ACTIONS,{
  map_use(G){if(!G.ctx.grant)fail("Неизвестное действие");const A=mapAtt(G.st,G.ctx.now);if(A.used>=MAP.att+A.extra+EMP.att[empRank(empPower(G.st,G.cards))])fail("Атаки на сегодня закончились"+(A.packs<MAP.packMax?" — можно купить ещё "+MAP.pack:" — новые завтра"));A.used++;return {left:MAP.att+A.extra-A.used}},
  map_grant(G){if(!G.ctx.grant)fail("Неизвестное действие");const {st,ctx,p}=G;if(p.cash)earn(st,p.cash);if(p.runes)camp(st,ctx.now).runes+=p.runes;if(p.pts){const P=mapPass(st,ctx.now);P.pts+=p.pts}return {}},
  mpack_grant(G){if(!G.ctx.grant)fail("Неизвестное действие");const A=mapAtt(G.st,G.ctx.now);A.extra+=MAP.pack;A.packs++;return {extra:A.extra}},
  mpass_grant(G){if(!G.ctx.grant)fail("Неизвестное действие");const P=mapPass(G.st,G.ctx.now);P.prem=1;return {}},
  mpass_claim(G){const {st,ctx,p}=G,P=mapPass(st,ctx.now),i=p.i|0,prem=!!p.prem;if(i<0||i>=MPASS.th.length)fail("Нет такого уровня");if(mapLv(P)<=i)fail("Уровень ещё не открыт");
    if(prem&&!P.prem)fail("Нужен пропуск завоевателя");const L=prem?P.gotP:P.got;if(L.includes(i))fail("Уже забрано");L.push(i);return mapGive(G,(prem?MPASS.prem:MPASS.free)[i])},
  mflag_grant(G){if(!G.ctx.grant)fail("Неизвестное действие");const st=G.st,k=G.p.k;if(!MFLAG[k])fail("Нет такого флага");st.mflags=st.mflags||[];if(!st.mflags.includes(k))st.mflags.push(k);st.mflagOn=k;return {k}},
  mflag_set(G){const st=G.st,k=String(G.p.k||"");if(k&&!(st.mflags||[]).includes(k))fail("Сначала купи этот флаг");st.mflagOn=k;return {k}}});
if(typeof module!=="undefined")module.exports={PROMO_BOX,ESHOP,AVF,CRESTS,eshopCheck,WAR,BIGUPD,empLvP,empLvl,DG_CAS,dgCasDrop,DG,DG_STAGE,dgStage,dgCum,DG_BREED,DG_BR_R,DG_BR_P,DG_REB_P,DG_FOOD,DG_SLOT,DG_R,DG_SET,DG_CHEST,DG_SHOP,dgItemName,dgItemPow,dgUpCost,dgEq,dgSetBonus,dgPower,dgSat,dgBonus,dgDay,dgAddXp,dgWin,dgNewItem,dgView,dgSetOf,dgSlotOf,isBase,BASE,baseNo,DUO,isDuo,DUO_F,DUO_RUN,DUO_PAIRS,rollDuo,SLOT_STEP,SLOT_COIN,SLOT_STAR,VIP_SLOTS,VIP_CAP,capCoinPrice,capParts,capOf,conqLeft,conqBuyPrice,ERA_OF,CONQ,CONQ_CH,conqN,conqStage,conqDay,conqTorch,conqPow,cpow,PASS,PQ,passSeason,passEnd,passTheme,passQuests,passState,passLv,passReward,passAdd,ERAS,CLAN,clanHp,clanDmg,VIP_T,vipTier,exMax,EX,exDay,exPrice,COLLAB,isCollab,GIFTS,GR,GR_C,GR_V,giftVal,SHELF_N,CAS_DAY,CASE,SLOT,HL,hlP,casDay,GOLEM,TITLES,ABIL,abil,rkInit,rkTurn,rkAI,rkGain,rkFighter,wclass,league,LEAGUES,RK_DAY,FAT_N,FAT_MS,craftPrice,CRAFT_MAX,DON,ONE,rollOne,NBASE,COMP,isComp,SHOP,CHESTS,numPrice,checkSn,NFX,NFX_PRICE,HALF_RUN,TRAIN_B,campTrainer,campBonus,mskDay,mskWeek,camp,campMax,campFull,campPow,campCrit,campSq,campSqRate,TARGETS,CAMP_UP,CRIT_X,SQ_HOURS,spinsBought,spinPrice,BUY_MAX,WHEEL,aiPick,rndPick,away,spinCap,VIP_SPINS,checkNick,NICK_COST,STAR_MAX,epithet,HEROES,FIN,HT,NICE,classify,HH_T,HH_LEN,hhDay,hhNow,hhIs,SDAY,DFX,PBG,PRESENT,DG_WISH,DG_WISH_R,DG_WISH_ALL,dgWishes,MN,mnM,JP,CSB,EMP,cardPow,empPower,empRank,THEMES,LUCK,luckPrice,HOF,hofSlots,hofColl,hofRate,RKT,rkM,MAP_W,MAP_DG,MAP_AL,MAP_R,MAP_Z,AL0,DGL0,DGL_THRONE,mapInc,MAP,MFLAG,MPASS,mapMon,mapPass,mapLv,mapAtt,DG_PLAY,SUP,LPITY,PITY,ACTIONS,runAction,freshState,touch,GameError,lvl,eff,CAP,MAX_LOTS,FEE,QUICK};


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
const SCHEMA_V=62;const NEWB_MS=3*864e5;
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
    "ALTER TABLE users ADD COLUMN title TEXT",
    "CREATE TABLE IF NOT EXISTS auc (id INTEGER PRIMARY KEY AUTOINCREMENT, day TEXT UNIQUE, h INTEGER, f INTEGER, stats TEXT, hue INTEGER, v REAL, min REAL, start INTEGER, until INTEGER, top INTEGER, top_name TEXT, bid REAL NOT NULL DEFAULT 0, n INTEGER NOT NULL DEFAULT 0, ver INTEGER NOT NULL DEFAULT 0, done INTEGER NOT NULL DEFAULT 0, card INTEGER)",
    "CREATE TABLE IF NOT EXISTS trader_sold (slot INTEGER NOT NULL, i INTEGER NOT NULL, uid INTEGER, name TEXT, t INTEGER, PRIMARY KEY(slot,i))",
    "CREATE TABLE IF NOT EXISTS trader_buy (slot INTEGER NOT NULL, h INTEGER NOT NULL, uid INTEGER NOT NULL, PRIMARY KEY(slot,h,uid))",
    "CREATE INDEX IF NOT EXISTS rm_a ON rm(a, phase)",
    "CREATE TABLE IF NOT EXISTS gifts (id INTEGER PRIMARY KEY AUTOINCREMENT, owner INTEGER NOT NULL, k TEXT NOT NULL, no INTEGER NOT NULL, how TEXT, shelf INTEGER NOT NULL DEFAULT 0, from_uid INTEGER, created INTEGER)",
    "CREATE UNIQUE INDEX IF NOT EXISTS gifts_kn ON gifts(k,no)","CREATE INDEX IF NOT EXISTS gifts_o ON gifts(owner,shelf)",
    "ALTER TABLE users ADD COLUMN golem_until INTEGER NOT NULL DEFAULT 0","ALTER TABLE users ADD COLUMN terms_v INTEGER NOT NULL DEFAULT 0","ALTER TABLE users ADD COLUMN pm_bonus INTEGER NOT NULL DEFAULT 0","ALTER TABLE users ADD COLUMN vip_t INTEGER NOT NULL DEFAULT 0","ALTER TABLE users ADD COLUMN clan INTEGER NOT NULL DEFAULT 0",
    "CREATE TABLE IF NOT EXISTS clans (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, name_key TEXT NOT NULL, owner INTEGER NOT NULL, h INTEGER NOT NULL DEFAULT 0, created INTEGER)","CREATE UNIQUE INDEX IF NOT EXISTS clans_nk ON clans(name_key)",
    "CREATE TABLE IF NOT EXISTS clan_boss (clan INTEGER NOT NULL, week TEXT NOT NULL, lvl INTEGER NOT NULL DEFAULT 1, hp INTEGER NOT NULL, dmg INTEGER NOT NULL DEFAULT 0, total INTEGER NOT NULL DEFAULT 0, kills INTEGER NOT NULL DEFAULT 0, PRIMARY KEY(clan,week))",
    "CREATE TABLE IF NOT EXISTS ally (uid INTEGER PRIMARY KEY, mate INTEGER NOT NULL, t INTEGER NOT NULL)","CREATE TABLE IF NOT EXISTS ally_q (uid INTEGER PRIMARY KEY, t INTEGER NOT NULL, pw INTEGER NOT NULL DEFAULT 0)",
    "CREATE TABLE IF NOT EXISTS roc_round (id INTEGER PRIMARY KEY, fs INTEGER NOT NULL, cr REAL NOT NULL, ct INTEGER NOT NULL)","CREATE TABLE IF NOT EXISTS roc_bet (rid INTEGER NOT NULL, uid INTEGER NOT NULL, name TEXT, b INTEGER NOT NULL, auto REAL NOT NULL DEFAULT 0, out_m REAL, win INTEGER NOT NULL DEFAULT 0, t INTEGER NOT NULL, PRIMARY KEY(rid,uid))",
    "CREATE TABLE IF NOT EXISTS vc_part (uid INTEGER PRIMARY KEY, acc TEXT NOT NULL, vids TEXT, t INTEGER NOT NULL, upd INTEGER)",
    "CREATE TABLE IF NOT EXISTS ft_vote (tid TEXT NOT NULL, fid INTEGER NOT NULL, uid INTEGER NOT NULL, ch TEXT NOT NULL, t INTEGER NOT NULL, hit INTEGER NOT NULL DEFAULT 0, PRIMARY KEY(tid,fid,uid))","CREATE TABLE IF NOT EXISTS ft_soc (tid TEXT NOT NULL, fid INTEGER NOT NULL, uid INTEGER NOT NULL, open_t INTEGER, got_t INTEGER, PRIMARY KEY(tid,fid,uid))",
    "CREATE TABLE IF NOT EXISTS tk (cid TEXT NOT NULL, uid INTEGER NOT NULL, n INTEGER NOT NULL DEFAULT 0, lp INTEGER NOT NULL DEFAULT 0, t INTEGER NOT NULL DEFAULT 0, PRIMARY KEY(cid,uid))",
    "CREATE TABLE IF NOT EXISTS hype (id INTEGER PRIMARY KEY AUTOINCREMENT, t INTEGER NOT NULL, uid INTEGER NOT NULL, txt TEXT NOT NULL)",
    "CREATE TABLE IF NOT EXISTS clan_hits (clan INTEGER NOT NULL, week TEXT NOT NULL, uid INTEGER NOT NULL, dmg INTEGER NOT NULL DEFAULT 0, day TEXT, n INTEGER NOT NULL DEFAULT 0, PRIMARY KEY(clan,week,uid))","ALTER TABLE users ADD COLUMN cb_claim INTEGER NOT NULL DEFAULT 0","ALTER TABLE users ADD COLUMN cb_note INTEGER NOT NULL DEFAULT 0","CREATE TABLE IF NOT EXISTS cas_log (id INTEGER PRIMARY KEY AUTOINCREMENT, uid INTEGER NOT NULL, g TEXT NOT NULL, bet INTEGER NOT NULL DEFAULT 0, win INTEGER NOT NULL DEFAULT 0, gift TEXT, gno INTEGER, m REAL, at INTEGER NOT NULL)","CREATE INDEX IF NOT EXISTS cas_log_at ON cas_log(at)","ALTER TABLE users ADD COLUMN terms_at INTEGER NOT NULL DEFAULT 0","ALTER TABLE users ADD COLUMN gv INTEGER NOT NULL DEFAULT 0","CREATE INDEX IF NOT EXISTS rm_b ON rm(b, phase)","CREATE INDEX IF NOT EXISTS rm_ph ON rm(phase, until)","CREATE TABLE IF NOT EXISTS user_days (uid INTEGER NOT NULL, d INTEGER NOT NULL, PRIMARY KEY(uid,d)) WITHOUT ROWID","INSERT OR IGNORE INTO user_days(uid,d) SELECT id,CAST((created+10800000)/86400000 AS INTEGER) FROM users WHERE created>0","INSERT OR IGNORE INTO user_days(uid,d) SELECT id,CAST((created+10800000)/86400000 AS INTEGER)+1 FROM users WHERE created>0 AND d1=1","INSERT OR IGNORE INTO user_days(uid,d) SELECT id,CAST((seen+10800000)/86400000 AS INTEGER) FROM users WHERE seen>0","ALTER TABLE users ADD COLUMN star_bal INTEGER NOT NULL DEFAULT 0","ALTER TABLE clans ADD COLUMN deputy INTEGER NOT NULL DEFAULT 0","CREATE TABLE IF NOT EXISTS clan_inv (clan INTEGER NOT NULL, uid INTEGER NOT NULL, from_uid INTEGER, t INTEGER, PRIMARY KEY(clan,uid))","CREATE TABLE IF NOT EXISTS trades (id INTEGER PRIMARY KEY AUTOINCREMENT, kind TEXT NOT NULL, a INTEGER NOT NULL, b INTEGER NOT NULL, ac INTEGER NOT NULL, bc INTEGER, status TEXT NOT NULL DEFAULT 'new', t INTEGER, done INTEGER)","CREATE INDEX IF NOT EXISTS trades_b ON trades(b,status)","CREATE INDEX IF NOT EXISTS trades_a ON trades(a,status)","ALTER TABLE trades ADD COLUMN av REAL","ALTER TABLE trades ADD COLUMN bv REAL","CREATE TABLE IF NOT EXISTS story_entries (contest TEXT NOT NULL, uid INTEGER NOT NULL, tg TEXT, ig TEXT, t INTEGER, PRIMARY KEY(contest,uid))","ALTER TABLE users ADD COLUMN dg_pow INTEGER NOT NULL DEFAULT 0","CREATE INDEX IF NOT EXISTS users_dgpow ON users(dg_pow)","CREATE INDEX IF NOT EXISTS users_ref ON users(ref)",
 "CREATE TABLE IF NOT EXISTS ad_links (code TEXT PRIMARY KEY, name TEXT, created INTEGER, hidden INTEGER NOT NULL DEFAULT 0)","CREATE TABLE IF NOT EXISTS ad_clicks (id INTEGER PRIMARY KEY AUTOINCREMENT, code TEXT NOT NULL, t INTEGER, ip TEXT)","CREATE INDEX IF NOT EXISTS ad_clicks_c ON ad_clicks(code,t)",
 "CREATE TABLE IF NOT EXISTS ad_starts (code TEXT NOT NULL, uid INTEGER NOT NULL, t INTEGER, new INTEGER NOT NULL DEFAULT 0, PRIMARY KEY(code,uid))","CREATE INDEX IF NOT EXISTS ad_starts_u ON ad_starts(uid)",   // откуда карточка: craft, merge, chest, build (для ленты «Прямо сейчас»)   // тиражи считаются только по ограниченным отделкам
 "CREATE TABLE IF NOT EXISTS dm (id INTEGER PRIMARY KEY AUTOINCREMENT, a INTEGER NOT NULL, b INTEGER NOT NULL, text TEXT, t INTEGER, rd INTEGER NOT NULL DEFAULT 0, adm INTEGER NOT NULL DEFAULT 0)","CREATE INDEX IF NOT EXISTS dm_b ON dm(b,rd)","CREATE INDEX IF NOT EXISTS dm_ab ON dm(a,b,id)",
 "CREATE TABLE IF NOT EXISTS dm_block (uid INTEGER NOT NULL, who INTEGER NOT NULL, PRIMARY KEY(uid,who))",
 "ALTER TABLE users ADD COLUMN wb INTEGER NOT NULL DEFAULT 0","ALTER TABLE users ADD COLUMN nb_note INTEGER NOT NULL DEFAULT 0",
 "ALTER TABLE users ADD COLUMN dgr INTEGER NOT NULL DEFAULT 1000","ALTER TABLE users ADD COLUMN dgr_wk TEXT","ALTER TABLE users ADD COLUMN dgr_w INTEGER NOT NULL DEFAULT 0","ALTER TABLE users ADD COLUMN dgr_l INTEGER NOT NULL DEFAULT 0",
 "CREATE TABLE IF NOT EXISTS dg_fights (id INTEGER PRIMARY KEY AUTOINCREMENT, a INTEGER NOT NULL, b INTEGER NOT NULL, win INTEGER NOT NULL, ra INTEGER, rb INTEGER, t INTEGER, log TEXT)","CREATE INDEX IF NOT EXISTS dg_fights_b ON dg_fights(b,id)","CREATE INDEX IF NOT EXISTS dg_fights_a ON dg_fights(a,id)",
 "ALTER TABLE users ADD COLUMN dg_exp INTEGER NOT NULL DEFAULT 0","ALTER TABLE users ADD COLUMN dg_exp_note INTEGER NOT NULL DEFAULT 0",
 "CREATE TABLE IF NOT EXISTS star_grants (id INTEGER PRIMARY KEY AUTOINCREMENT, uid INTEGER NOT NULL, amt INTEGER NOT NULL, note TEXT, t INTEGER, by INTEGER)",
 "ALTER TABLE users ADD COLUMN hh_note INTEGER NOT NULL DEFAULT 0",
 "CREATE TABLE IF NOT EXISTS sday (d TEXT PRIMARY KEY, uid INTEGER NOT NULL, pid INTEGER, t INTEGER)",
 "CREATE TABLE IF NOT EXISTS promo (code TEXT PRIMARY KEY, sp INTEGER NOT NULL DEFAULT 0, cash INTEGER NOT NULL DEFAULT 0, mx INTEGER NOT NULL DEFAULT 0, until INTEGER NOT NULL DEFAULT 0, created INTEGER, off INTEGER NOT NULL DEFAULT 0, x2 INTEGER NOT NULL DEFAULT 0)","CREATE TABLE IF NOT EXISTS promo_uses (code TEXT NOT NULL, uid INTEGER NOT NULL, t INTEGER, x2 INTEGER NOT NULL DEFAULT 0, x2d INTEGER NOT NULL DEFAULT 0, PRIMARY KEY(code,uid))",
 "CREATE TABLE IF NOT EXISTS map_reg (id INTEGER PRIMARY KEY, owner INTEGER, card INTEGER, since INTEGER, claim_at INTEGER, shield INTEGER NOT NULL DEFAULT 0, def_n INTEGER NOT NULL DEFAULT 0, statue INTEGER NOT NULL DEFAULT 0)","CREATE TABLE IF NOT EXISTS map_photo (uid INTEGER PRIMARY KEY, img TEXT, st INTEGER NOT NULL DEFAULT 0, t INTEGER)","CREATE TABLE IF NOT EXISTS map_log (id INTEGER PRIMARY KEY AUTOINCREMENT, rid INTEGER, att INTEGER, def INTEGER, win INTEGER, t INTEGER)",
 "CREATE TABLE IF NOT EXISTS clan_msg (id INTEGER PRIMARY KEY AUTOINCREMENT, clan INTEGER NOT NULL, uid INTEGER NOT NULL, name TEXT, text TEXT, t INTEGER)","CREATE INDEX IF NOT EXISTS clan_msg_c ON clan_msg(clan,id)","CREATE TABLE IF NOT EXISTS king (wk TEXT PRIMARY KEY, uid INTEGER, name TEXT, votes INTEGER DEFAULT 0, tre INTEGER DEFAULT 0, got INTEGER DEFAULT 0, since INTEGER, dec_day TEXT)","CREATE TABLE IF NOT EXISTS king_vote (wk TEXT NOT NULL, uid INTEGER NOT NULL, cand INTEGER NOT NULL, t INTEGER, PRIMARY KEY(wk,uid))","CREATE TABLE IF NOT EXISTS tt_sub (contest TEXT NOT NULL, uid INTEGER NOT NULL, url TEXT, st INTEGER DEFAULT 0, t INTEGER, PRIMARY KEY(contest,uid))","CREATE TABLE IF NOT EXISTS live_drop (code TEXT PRIMARY KEY, card INTEGER NOT NULL, name TEXT, t INTEGER, by_uid INTEGER, got_t INTEGER, sp INTEGER DEFAULT 0)","CREATE TABLE IF NOT EXISTS live_chat (id INTEGER PRIMARY KEY AUTOINCREMENT, uid TEXT, nick TEXT, text TEXT, pic TEXT, kind TEXT, t INTEGER)","CREATE TABLE IF NOT EXISTS ref3_got (camp TEXT NOT NULL, uid INTEGER NOT NULL, t INTEGER, PRIMARY KEY(camp,uid))","CREATE TABLE IF NOT EXISTS riddle_ans (rid TEXT NOT NULL, uid INTEGER NOT NULL, name TEXT, tries INTEGER DEFAULT 0, ok_t INTEGER, last TEXT, PRIMARY KEY(rid,uid))","CREATE INDEX IF NOT EXISTS riddle_ok ON riddle_ans(rid,ok_t)","CREATE TABLE IF NOT EXISTS ep_vote (vid TEXT NOT NULL, uid INTEGER NOT NULL, ch TEXT NOT NULL, t INTEGER, PRIMARY KEY(vid,uid))","CREATE TABLE IF NOT EXISTS ep_vote_soc (vid TEXT NOT NULL, uid INTEGER NOT NULL, open_t INTEGER, got_t INTEGER, PRIMARY KEY(vid,uid))","ALTER TABLE promo ADD COLUMN bon INTEGER NOT NULL DEFAULT 0","ALTER TABLE promo_uses ADD COLUMN bon INTEGER NOT NULL DEFAULT 0","ALTER TABLE promo_uses ADD COLUMN bon_until INTEGER NOT NULL DEFAULT 0","ALTER TABLE promo ADD COLUMN bmin INTEGER NOT NULL DEFAULT 0","ALTER TABLE map_reg ADD COLUMN owner2 INTEGER","ALTER TABLE hype ADD COLUMN big INTEGER NOT NULL DEFAULT 0","ALTER TABLE users ADD COLUMN hof_note INTEGER NOT NULL DEFAULT 0","ALTER TABLE users ADD COLUMN emp INTEGER NOT NULL DEFAULT 0","ALTER TABLE users ADD COLUMN glory INTEGER NOT NULL DEFAULT 0","CREATE TABLE IF NOT EXISTS emp_war (id INTEGER PRIMARY KEY AUTOINCREMENT, att INTEGER NOT NULL, def INTEGER NOT NULL, win INTEGER NOT NULL, gl INTEGER NOT NULL DEFAULT 0, t INTEGER NOT NULL)","ALTER TABLE map_reg ADD COLUMN claim2_at INTEGER","ALTER TABLE promo_uses ADD COLUMN bmin INTEGER NOT NULL DEFAULT 0"];
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
/* ---------- рекламные ссылки со счётчиком: <сервер>/go/<метка> → считаем переход → бот с ?start=a_<метка> → считаем «Старт» ---------- */
const adCode=c=>{c=String(c||"").toLowerCase().replace(/[^a-z0-9_-]/g,"").slice(0,32);return c||null};
const adHash=t=>{let h=2166136261;for(let i=0;i<t.length;i++){h^=t.charCodeAt(i);h=Math.imul(h,16777619)}return (h>>>0).toString(36)};
async function adGo(env,req,code){code=adCode(code);const bot="https://t.me/"+(env.BOT_USERNAME||"VoinyEpohBot");
  if(!code)return new Response(null,{status:302,headers:{Location:bot}});
  const ua=req.headers.get("user-agent")||"",robot=/bot|crawl|spider|preview|facebookexternalhit|whatsapp|vkshare|skype|slack|discord/i.test(ua);
  try{const L=await env.DB.prepare("SELECT code FROM ad_links WHERE code=?").bind(code).first();
    if(L&&!robot){const ip=(req.headers.get("cf-connecting-ip")||(req.headers.get("x-forwarded-for")||"").split(",")[0]||req.headers.get("x-real-ip")||"").trim();
      await env.DB.prepare("INSERT INTO ad_clicks(code,t,ip) VALUES(?,?,?)").bind(code,Date.now(),adHash(ip+"|"+(ip?"":ua+(req.headers.get("accept-language")||"")))).run()}}catch(e){console.error("adGo",e)}
  return new Response(null,{status:302,headers:{Location:bot+"?start=a_"+code,"Cache-Control":"no-store"}})}
async function adStart(env,uid,code){code=adCode(code);if(!code)return;try{
  const L=await env.DB.prepare("SELECT code FROM ad_links WHERE code=?").bind(code).first();if(!L)return;
  const was=await env.DB.prepare("SELECT 1 FROM users WHERE id=?").bind(uid).first(),seen=await env.DB.prepare("SELECT 1 FROM ad_starts WHERE uid=?").bind(uid).first();
  await env.DB.prepare("INSERT OR IGNORE INTO ad_starts(code,uid,t,new) VALUES(?,?,?,?)").bind(code,uid,Date.now(),(!was&&!seen)?1:0).run()}catch(e){console.error("adStart",e)}}
/* ---------- личные сообщения: игрок ↔ игрок и администрация → игрок ---------- */
const DM_MAX=500;
async function dmPeer(env,uid){const u=await env.DB.prepare("SELECT id,COALESCE(nick,name) AS name,vip_until,fx,fx_until FROM users WHERE id=?").bind(uid).first();if(!u)fail("Игрок не найден");
  const now=Date.now();return {uid:u.id,name:u.name||"Игрок",vip:(u.vip_until||0)>now?1:0,fx:(u.fx_until||0)>now?u.fx:null,adm:isAdmin(env,u.id)?1:0}}
async function dmApi(env,me,a,p){const now=Date.now(),adm=isAdmin(env,me.id);
  if(a==="dm_list"){
    const R=(await env.DB.prepare("SELECT CASE WHEN a=? THEN b ELSE a END AS peer,MAX(id) AS last FROM dm WHERE a=? OR b=? GROUP BY peer ORDER BY last DESC LIMIT 50").bind(me.id,me.id,me.id).all()).results;
    if(!R.length)return {list:[]};
    const ids=R.map(r=>r.last),peers=R.map(r=>r.peer);
    const M=(await env.DB.prepare("SELECT id,a,text,t FROM dm WHERE id IN ("+ids.map(()=>"?").join(",")+")").bind(...ids).all()).results;
    const U=(await env.DB.prepare("SELECT id,COALESCE(nick,name) AS name,vip_until FROM users WHERE id IN ("+peers.map(()=>"?").join(",")+")").bind(...peers).all()).results;
    const N=(await env.DB.prepare("SELECT a,COUNT(*) AS n FROM dm WHERE b=? AND rd=0 GROUP BY a").bind(me.id).all()).results;
    const list=R.map(r=>{const m=M.find(x=>x.id===r.last)||{},u=U.find(x=>x.id===r.peer)||{},n=N.find(x=>x.a===r.peer);
      return {uid:r.peer,name:u.name||"Игрок",vip:(u.vip_until||0)>now?1:0,adm:isAdmin(env,r.peer)?1:0,text:m.text||"",t:m.t||0,mine:m.a===me.id?1:0,un:n?n.n:0}});
    return {list}}
  const peer=Math.floor(+p.uid||0);if(!peer||peer===me.id)fail("Нельзя писать самому себе");
  if(a==="dm_get"){const P=await dmPeer(env,peer),after=Math.floor(+p.after||0);
    const items=(await env.DB.prepare("SELECT id,a,text,t,adm FROM dm WHERE ((a=? AND b=?) OR (a=? AND b=?)) AND id>? ORDER BY id DESC LIMIT 80").bind(me.id,peer,peer,me.id,after).all()).results.reverse();
    await env.DB.prepare("UPDATE dm SET rd=1 WHERE a=? AND b=? AND rd=0").bind(peer,me.id).run();
    const bl=await env.DB.prepare("SELECT (SELECT 1 FROM dm_block WHERE uid=? AND who=?) AS mine,(SELECT 1 FROM dm_block WHERE uid=? AND who=?) AS his").bind(me.id,peer,peer,me.id).first()||{};
    const un=((await env.DB.prepare("SELECT COUNT(*) AS n FROM dm WHERE b=? AND rd=0").bind(me.id).first())||{}).n||0;
    return {peer:P,items,blocked:bl.mine?1:0,blockedMe:bl.his?1:0,un}}
  if(a==="dm_send"){const P=await dmPeer(env,peer),{u}=await loadUser(env,me);
    let t=String(p.text||"").replace(/[ \t]+/g," ").replace(/\n{3,}/g,"\n\n").trim();if(!t)fail("Пустое сообщение");if(t.length>DM_MAX)fail("Не длиннее "+DM_MAX+" символов");
    if(!adm){if(!u.nick)fail("Чтобы писать игрокам, выбери ник во вкладке «Топ»");
      if((u.muted||0)>now)fail("Тебе запрещено писать ещё "+Math.ceil((u.muted-now)/36e5)+" ч");
      if(CHAT_LINK.test(t))fail("Ссылки в сообщениях запрещены");t=t.replace(CHAT_BAD,m=>"*".repeat(m.length));
      if(await env.DB.prepare("SELECT 1 FROM dm_block WHERE uid=? AND who=?").bind(peer,me.id).first())fail("Игрок ограничил тебе сообщения");
      if(await env.DB.prepare("SELECT 1 FROM dm_block WHERE uid=? AND who=?").bind(me.id,peer).first())fail("Ты заблокировал этого игрока. Разблокируй, чтобы написать");
      const last=await env.DB.prepare("SELECT t FROM dm WHERE a=? ORDER BY id DESC LIMIT 1").bind(me.id).first();if(last&&now-last.t<1500)fail("Не так быстро");
      const day=((await env.DB.prepare("SELECT COUNT(*) AS n FROM dm WHERE a=? AND t>?").bind(me.id,now-864e5).first())||{}).n||0;if(day>=300)fail("На сегодня лимит сообщений исчерпан")}
    const r=await env.DB.prepare("INSERT INTO dm(a,b,text,t,adm) VALUES(?,?,?,?,?) RETURNING id").bind(me.id,peer,t,now,adm?1:0).first();
    const un=((await env.DB.prepare("SELECT COUNT(*) AS n FROM dm WHERE a=? AND b=? AND rd=0").bind(me.id,peer).first())||{}).n||0;
    const from=adm?"👑 Администрация «Воинов Эпох»":(u.nick||"Игрок");
    if(adm)await notify(env,peer,"✉️ Сообщение от администрации «Воинов Эпох»:\n\n"+t,"✉️ Ответить",PAGE+"?dm="+me.id);
    else if(un===1)await notify(env,peer,"✉️ "+from+" написал тебе в игре:\n\n«"+t.slice(0,200)+(t.length>200?"…":"")+"»","✉️ Ответить",PAGE+"?dm="+me.id);
    return {id:r.id,t:now,text:t}}
  if(a==="dm_block"){await dmPeer(env,peer);
    if(p.on)await env.DB.prepare("INSERT OR IGNORE INTO dm_block(uid,who) VALUES(?,?)").bind(me.id,peer).run();
    else await env.DB.prepare("DELETE FROM dm_block WHERE uid=? AND who=?").bind(me.id,peer).run();return {blocked:p.on?1:0}}
  if(a==="dm_report"){const P=await dmPeer(env,peer);
    const L=(await env.DB.prepare("SELECT text FROM dm WHERE a=? AND b=? ORDER BY id DESC LIMIT 5").bind(peer,me.id).all()).results.reverse().map(x=>"— "+x.text.slice(0,200)).join("\n");
    const who=await nameOf(env,me.id);
    for(const x of ADMINS)await notify(env,x,"🚩 Жалоба на сообщения\nОт: "+who+" (id "+me.id+")\nНа: "+P.name+" (id "+P.uid+")\n\nПоследние сообщения:\n"+(L||"(нет)"),"⚔️ Открыть",PAGE+"?dm="+P.uid);
    await env.DB.prepare("INSERT OR IGNORE INTO dm_block(uid,who) VALUES(?,?)").bind(me.id,peer).run();return {ok:1}}
  fail("Неизвестное действие")}
/* ---------- ⚔️ арена драконов: асинхронные бои с драконами других игроков, рейтинг на неделю ---------- */
async function dgLooks(env,uids){uids=[...new Set((uids||[]).map(x=>Math.floor(+x)).filter(x=>x>0))].slice(0,120);if(!uids.length)return {};
  const R=(await env.DB.prepare("SELECT id,json_extract(state,'$.dg.b') AS b,json_extract(state,'$.dg.lv') AS lv,json_extract(state,'$.dg.skin') AS sk,json_extract(state,'$.dg.evo') AS ev FROM users WHERE dg_pow>0 AND id IN ("+uids.map(()=>"?").join(",")+")").bind(...uids).all()).results;
  const o={};for(const r of R)o[r.id]=[r.b|0,r.lv|0,r.sk||null,r.ev||null];return o}
const dgaR=(u,wk)=>u&&u.dgr_wk===wk?u.dgr:DGA.start;
function dgaDragon(state){let D=null;try{D=JSON.parse(state||"{}").dg}catch(e){}return D}
function dgaSim(A,B,ta){const pa=Math.round(dgPower(A)*(1+dgGemB(A,"ameth"))),pb=B.__pow||Math.round(dgPower(B)*(1+dgGemB(B,"ameth"))),ea=dgEl(A),eb=dgEl(B),tl=Object.keys(DGA_TAC);ta=DGA_TAC[ta]?ta:"rush";const tb=tl[Math.floor(Math.random()*3)];
  const ka=(ea&&DGA_BEAT[ea]===eb?DGA.adv:1)*(DGA_TBEAT[ta]===tb?DGA_TK:1),kb=(eb&&DGA_BEAT[eb]===ea?DGA.adv:1)*(DGA_TBEAT[tb]===ta?DGA_TK:1);const rounds=[];let wa=0,wb=0;
  for(let i=0;i<3&&wa<2&&wb<2;i++){const x=Math.round(pa*ka*(.8+Math.random()*.4)),y=Math.round(pb*kb*(.8+Math.random()*.4));if(x>=y)wa++;else wb++;rounds.push([x,y])}
  return {win:wa>wb?1:0,rounds,ka,kb,ea,eb,ta,tb,ela:ea&&DGA_BEAT[ea]===eb?1:0,elb:eb&&DGA_BEAT[eb]===ea?1:0,tw:DGA_TBEAT[ta]===tb?1:DGA_TBEAT[tb]===ta?-1:0}}
/* дикие драконы: если живых соперников близкой силы мало, арена подбирает дикого дракона под твою мощь */
const DGA_WILD=["Дикий","Горный","Пещерный","Лесной","Морской","Пустынный","Северный","Древний"];
function dgaWild(seed,myPow,myLv){const r=k=>((seed*9301+49297*k)%233280)/233280,b=Math.floor(r(1)*5),evo=r(2)<.5?["fire","ice","storm"][Math.floor(r(3)*3)]:null,lv=Math.max(1,Math.round(myLv*(.8+r(4)*.4)));
  return {uid:-seed,name:DGA_WILD[Math.floor(r(5)*DGA_WILD.length)]+" дракон",dn:"",pow:Math.max(50,Math.round(myPow*(.75+r(6)*.4))),r:DGA.start,b,lv,skin:null,evo,wild:1,D:{b,lv,evo,inv:[],eq:{}}}}
async function dgaApi(env,me,a,p){const now=Date.now(),wk=mskWeek(now);
  const meU=await env.DB.prepare("SELECT id,state,dgr,dgr_wk,dgr_w,dgr_l,COALESCE(nick,name) AS name FROM users WHERE id=?").bind(me.id).first();const myD=dgaDragon(meU&&meU.state);if(!myD)fail("Сначала нужен дракон");
  const myR=dgaR(meU,wk);
  if(a==="dga_info"){const lo=myR-250,hi=myR+250;
    const mp=dgPower(myD);let opp=(await env.DB.prepare("SELECT id,COALESCE(nick,name) AS name,dg_pow AS pow,dgr,dgr_wk,state FROM users WHERE dg_pow>0 AND id<>? AND dg_pow BETWEEN ? AND ? ORDER BY ABS(dg_pow-?) LIMIT 30").bind(me.id,Math.floor(mp*.6),Math.ceil(mp*1.6),mp).all()).results;
    opp=opp.sort(()=>Math.random()-.5).slice(0,3).map(u=>{const D=dgaDragon(u.state)||{};return {uid:u.id,name:u.name||"Игрок",pow:u.pow,r:dgaR(u,wk),b:D.b|0,lv:D.lv|0,skin:D.skin||null,evo:D.evo||null,dn:D.name||"",el:dgEl(D)}});
    while(opp.length<3){const sd=1+Math.floor(Math.random()*2e9),W=dgaWild(sd,mp,myD.lv);delete W.D;W.el=W.evo||null;opp.push(W)}
    const top=(await env.DB.prepare("SELECT id,COALESCE(nick,name) AS name,dgr,dgr_w,dgr_l,json_extract(state,'$.dg.b') AS b,json_extract(state,'$.dg.lv') AS lv,json_extract(state,'$.dg.skin') AS sk,json_extract(state,'$.dg.evo') AS ev FROM users WHERE dgr_wk=? ORDER BY dgr DESC LIMIT 20").bind(wk).all()).results.map(r=>({uid:r.id,name:r.name,r:r.dgr,w:r.dgr_w,l:r.dgr_l,look:[r.b|0,r.lv|0,r.sk,r.ev]}));
    const place=meU.dgr_wk===wk?1+(((await env.DB.prepare("SELECT COUNT(*) AS n FROM users WHERE dgr_wk=? AND dgr>?").bind(wk,myR).first())||{}).n||0):0;
    const hist=(await env.DB.prepare("SELECT f.a,f.b,f.win,f.ra,f.rb,f.t,COALESCE(ua.nick,ua.name) AS na,COALESCE(ub.nick,ub.name) AS nb FROM dg_fights f LEFT JOIN users ua ON ua.id=f.a LEFT JOIN users ub ON ub.id=f.b WHERE f.a=? OR f.b=? ORDER BY f.id DESC LIMIT 10").bind(me.id,me.id).all()).results
      .map(f=>({att:f.a===me.id?1:0,who:f.a===me.id?f.nb:f.na,win:f.a===me.id?f.win:1-f.win,d:f.a===me.id?f.ra:f.rb,t:f.t}));
    let left=0;try{left=(await doAction(env,me,"dga_apply",{},{dga:{check:1}})).res.left}catch(e){left=0}
    const end=Date.parse(wk+"T00:00:00Z")-TZ+7*864e5;
    return {r:myR,w:meU.dgr_wk===wk?meU.dgr_w:0,l:meU.dgr_wk===wk?meU.dgr_l:0,place,opp,top,hist,left,day:DGA.day,prize:DGA.prize,wkLeft:Math.max(0,end-now),el:dgEl(myD),pow:dgPower(myD)}}
  if(a==="dga_fight"){const oid=Math.floor(+p.uid||0);if(!oid||oid===me.id)fail("Выбери соперника");
    if(oid<0){const W=dgaWild(-oid,dgPower(myD),myD.lv),oD=Object.assign({},W.D,{__pow:W.pow});await doAction(env,me,"dga_apply",{},{dga:{check:1}});
      const F=dgaSim(myD,oD,String(p.tac||"")),exp=1/(1+Math.pow(10,0)),dA=Math.round(DGA.k*.5*((F.win?1:0)-exp));const R=(await doAction(env,me,"dga_apply",{},{dga:{win:F.win}})).res;
      await env.DB.prepare("UPDATE users SET dgr=?,dgr_wk=?,dgr_w=CASE WHEN dgr_wk=? THEN dgr_w ELSE 0 END+?,dgr_l=CASE WHEN dgr_wk=? THEN dgr_l ELSE 0 END+? WHERE id=?").bind(Math.max(0,myR+dA),wk,wk,F.win,wk,1-F.win,me.id).run();
      return {...F,dA,r:Math.max(0,myR+dA),sh:R.sh,xp:R.xp,left:R.left,opp:{uid:oid,name:W.name,b:W.b,lv:W.lv,skin:null,evo:W.evo,dn:""},pa:dgPower(myD),pb:W.pow}}
    const o=await env.DB.prepare("SELECT id,state,dgr,dgr_wk,COALESCE(nick,name) AS name FROM users WHERE id=? AND dg_pow>0").bind(oid).first();if(!o)fail("У этого игрока нет дракона");
    const oD=dgaDragon(o.state);if(!oD)fail("У этого игрока нет дракона");
    await doAction(env,me,"dga_apply",{},{dga:{check:1}});   // проверка лимита до боя
    const F=dgaSim(myD,oD,String(p.tac||"")),rB=dgaR(o,wk),exp=1/(1+Math.pow(10,(rB-myR)/400)),dA=Math.round(DGA.k*((F.win?1:0)-exp)),dB=-dA;
    const R=(await doAction(env,me,"dga_apply",{},{dga:{win:F.win}})).res;
    await env.DB.batch([
      env.DB.prepare("UPDATE users SET dgr=?,dgr_wk=?,dgr_w=CASE WHEN dgr_wk=? THEN dgr_w ELSE 0 END+?,dgr_l=CASE WHEN dgr_wk=? THEN dgr_l ELSE 0 END+? WHERE id=?").bind(Math.max(0,myR+dA),wk,wk,F.win,wk,1-F.win,me.id),
      env.DB.prepare("UPDATE users SET dgr=?,dgr_wk=?,dgr_w=CASE WHEN dgr_wk=? THEN dgr_w ELSE 0 END+?,dgr_l=CASE WHEN dgr_wk=? THEN dgr_l ELSE 0 END+? WHERE id=?").bind(Math.max(0,rB+dB),wk,wk,1-F.win,wk,F.win,oid),
      env.DB.prepare("INSERT INTO dg_fights(a,b,win,ra,rb,t,log) VALUES(?,?,?,?,?,?,?)").bind(me.id,oid,F.win,dA,dB,now,JSON.stringify(F.rounds))]);
    return {...F,dA,r:Math.max(0,myR+dA),sh:R.sh,xp:R.xp,left:R.left,opp:{uid:oid,name:o.name||"Игрок",b:oD.b|0,lv:oD.lv|0,skin:oD.skin||null,evo:oD.evo||null,dn:oD.name||""},pa:dgPower(myD),pb:dgPower(oD)}}
  fail("Неизвестное действие")}
/* недельные призы арены: в понедельник топ-3 прошлой недели получают звёзды на игровой баланс */
async function dgaWeekTick(env){const now=Date.now(),wk=mskWeek(now),prev=mskWeek(now-7*864e5);if(await cached("dgaw"+prev,300e3,()=>kvGet(env,"dga_prize:"+prev)))return;
  const T=(await env.DB.prepare("SELECT id,COALESCE(nick,name) AS name,dgr FROM users WHERE dgr_wk=? ORDER BY dgr DESC LIMIT 3").bind(prev).all()).results;
  await kvSet(env,"dga_prize:"+prev,{t:now,top:T});delete topCache["dgaw"+prev];
  for(let i=0;i<T.length;i++){const amt=DGA.prize[i];await env.DB.prepare("UPDATE users SET star_bal=star_bal+? WHERE id=?").bind(amt,T[i].id).run();
    await notify(env,T[i].id,MEDAL[i]+" Твой дракон занял "+(i+1)+" место на арене за неделю (рейтинг "+T[i].dgr+")!\n\n⭐ "+amt+" звёзд уже на игровом балансе. Новая неделя — новая битва за трон 🐉","🐉 На арену",PAGE+"?dragon=1")}
  if(T.length)await chanSend(env,{chan:CHANNEL},{text:"🐉 ИТОГИ НЕДЕЛИ НА АРЕНЕ ДРАКОНОВ\n\n"+T.map((r,i)=>MEDAL[i]+" "+r.name+" — рейтинг "+r.dgr+" → "+DGA.prize[i]+" ⭐").join("\n")+"\n\nНовая неделя уже началась — рейтинг у всех снова "+DGA.start+"!\n\n👉 @VoinyEpohBot"})}
/* ---------- админ: начислить звёзды на игровой баланс ---------- */
async function starApi(env,me,a,p){if(!isAdmin(env,me.id))fail("Нет доступа");const now=Date.now();
  if(a==="st_find"){const q=String(p.q||"").trim().replace(/^@/,"").slice(0,40);if(!q)return {users:[]};
    const n=/^\d{3,}$/.test(q)?+q:-1,lo=q.toLowerCase(),cap=lo.charAt(0).toUpperCase()+lo.slice(1),P=[q,lo,cap,q.toUpperCase()].map(x=>"%"+x+"%");
    const users=(await env.DB.prepare("SELECT id,name,nick,star_bal,vip_until,seen FROM users WHERE id=? OR COALESCE(nick_key,'') LIKE ? OR COALESCE(nick,'') LIKE ? OR COALESCE(nick,'') LIKE ? OR COALESCE(name,'') LIKE ? OR COALESCE(name,'') LIKE ? OR COALESCE(name,'') LIKE ? OR COALESCE(name,'') LIKE ? ORDER BY (id=?) DESC,seen DESC LIMIT 12").bind(n,P[1],P[0],P[2],P[0],P[1],P[2],P[3],n).all()).results;
    return {users:users.map(u=>({uid:u.id,name:u.nick||u.name||"Игрок",tg:u.name||"",bal:u.star_bal||0,vip:(u.vip_until||0)>now?1:0,seen:u.seen||0}))}}
  if(a==="st_give"){const uid=Math.floor(+p.uid||0),amt=Math.round(+p.amt||0),note=String(p.note||"").trim().slice(0,200);
    if(!amt||Math.abs(amt)>100000)fail("Сумма от 1 до 100 000 ⭐");const P=await dmPeer(env,uid);
    if(amt<0){const r=await env.DB.prepare("UPDATE users SET star_bal=star_bal+? WHERE id=? AND star_bal>=?").bind(amt,uid,-amt).run();if(r.meta.changes!==1)fail("У игрока меньше звёзд на балансе")}
    else await env.DB.prepare("UPDATE users SET star_bal=star_bal+? WHERE id=?").bind(amt,uid).run();
    await env.DB.prepare("INSERT INTO star_grants(uid,amt,note,t,by) VALUES(?,?,?,?,?)").bind(uid,amt,note,now,me.id).run();
    const bal=((await env.DB.prepare("SELECT star_bal FROM users WHERE id=?").bind(uid).first())||{}).star_bal||0;
    if(amt>0){const txt="⭐ Тебе начислено "+amt+" звёзд на игровой баланс!"+(note?"\n\n"+note:"")+"\n\nТеперь у тебя "+bal+" ⭐. Трать их в Сокровищнице: сундуки, VIP, место для карточек и многое другое.";
      await notify(env,uid,txt,"🏪 В Сокровищницу",PAGE+"?shop=1");
      await env.DB.prepare("INSERT INTO dm(a,b,text,t,adm) VALUES(?,?,?,?,1)").bind(me.id,uid,txt,now).run()}
    return {uid,name:P.name,amt,bal}}
  if(a==="st_log"){const L=(await env.DB.prepare("SELECT g.uid,g.amt,g.note,g.t,COALESCE(u.nick,u.name) AS name FROM star_grants g LEFT JOIN users u ON u.id=g.uid ORDER BY g.id DESC LIMIT 30").all()).results;
    const tot=await env.DB.prepare("SELECT COALESCE(SUM(amt),0) AS s,COUNT(*) AS n FROM star_grants").first();return {log:L,sum:tot.s,n:tot.n}}
  fail("Неизвестное действие")}
async function adApi(env,me,a,p,origin){if(!isAdmin(env,me.id))fail("Нет доступа");const now=Date.now(),t0=dayNum(now)*864e5-TZ;
  if(a==="ad_create"){const name=String(p.name||"").trim().slice(0,40);if(!name)fail("Напиши название рекламы");
    let base=adCode(p.code)||adCode(name.replace(/[а-яё]/gi,ch=>({а:"a",б:"b",в:"v",г:"g",д:"d",е:"e",ё:"e",ж:"zh",з:"z",и:"i",й:"y",к:"k",л:"l",м:"m",н:"n",о:"o",п:"p",р:"r",с:"s",т:"t",у:"u",ф:"f",х:"h",ц:"c",ч:"ch",ш:"sh",щ:"sh",ъ:"",ы:"y",ь:"",э:"e",ю:"yu",я:"ya"}[ch.toLowerCase()]||"")).replace(/\s+/g,"_"))||"ad";
    let code=base;for(let i=2;await env.DB.prepare("SELECT 1 FROM ad_links WHERE code=?").bind(code).first();i++)code=(base.slice(0,28)+"_"+i);
    await env.DB.prepare("INSERT INTO ad_links(code,name,created) VALUES(?,?,?)").bind(code,name,now).run();return {code}}
  if(a==="ad_hide"){await env.DB.prepare("UPDATE ad_links SET hidden=? WHERE code=?").bind(p.hidden?1:0,adCode(p.code)).run();return {}}
  const one=async(q,...x)=>(await env.DB.prepare(q).bind(...x).first())||{};
  const links=(await env.DB.prepare("SELECT * FROM ad_links ORDER BY created DESC LIMIT 60").all()).results,out=[];
  for(const L of links){const c=L.code;
    const cl=await one("SELECT COUNT(*) AS n,COUNT(DISTINCT ip) AS u,SUM(t>=?) AS d FROM ad_clicks WHERE code=?",t0,c);
    const s0=await one("SELECT COUNT(*) AS n,SUM(new) AS nw,SUM(t>=?) AS d,SUM(t>=? AND new=1) AS dn FROM ad_starts WHERE code=?",t0,t0,c);
    const pl=await one("SELECT COUNT(*) AS op,SUM(COALESCE(json_extract(u.state,'$.nOp'),0)>=5) AS sp5,SUM(COALESCE(json_extract(u.state,'$.nOp'),0)>=30) AS sp30,SUM((SELECT COUNT(*) FROM user_days d WHERE d.uid=u.id)>=2) AS back,SUM(u.seen>=?) AS today,SUM(u.ref IS NOT NULL) AS byref FROM ad_starts a JOIN users u ON u.id=a.uid WHERE a.code=? AND a.new=1",t0,c);
    const st=await one("SELECT COALESCE(SUM(p.stars),0) AS s,COUNT(DISTINCT p.uid) AS u FROM payments p JOIN ad_starts a ON a.uid=p.uid AND a.code=? AND a.new=1 WHERE p.status IN ('paid','done') AND COALESCE(p.charge,'')<>'bal'",c);
    const days=[];for(let i=6;i>=0;i--){const a1=t0-i*864e5,b1=a1+864e5;days.push({d:mskDay(a1+864e5/2),c:(await one("SELECT COUNT(*) AS n FROM ad_clicks WHERE code=? AND t>=? AND t<?",c,a1,b1)).n||0,s:(await one("SELECT COUNT(*) AS n FROM ad_starts WHERE code=? AND t>=? AND t<?",c,a1,b1)).n||0})}
    out.push({code:c,name:L.name,created:L.created,hidden:L.hidden,link:origin+"/go/"+c,direct:"https://t.me/"+(env.BOT_USERNAME||"VoinyEpohBot")+"?start=a_"+c,
      clicks:cl.n||0,uniq:cl.u||0,clicksToday:cl.d||0,starts:s0.n||0,startsNew:s0.nw||0,startsToday:s0.d||0,newToday:s0.dn||0,opened:pl.op||0,sp5:pl.sp5||0,sp30:pl.sp30||0,back:pl.back||0,seenToday:pl.today||0,stars:st.s||0,payers:st.u||0,days})}
  return {links:out}}
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
/* сколько карточек влезает в коллекцию игрока (база + купленное место + VIP) */
async function capUid(env,id){const u=await env.DB.prepare("SELECT state,vip_until,vip_t FROM users WHERE id=?").bind(id).first();if(!u)return CAP;
  let st={};try{st=JSON.parse(u.state||"{}")}catch(e){}st.vipUntil=u.vip_until||0;st.vipT=u.vip_t||0;return capOf(st)}
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
/* дракон: «живые» друзья — пришли по моей ссылке ПОСЛЕ выхода дракона и сделали хотя бы 5 прокруток. Старые приглашения не считаются */
async function dgFriends(env,uid){return ((await env.DB.prepare("SELECT COUNT(*) AS n FROM users WHERE ref=? AND created>=? AND COALESCE(json_extract(state,'$.nOp'),0)>=?").bind(uid,DG.since,DG.frSpins).first())||{}).n||0}
async function dgTop(env,me){const rows=(await env.DB.prepare("SELECT id,COALESCE(nick,name) AS name,dg_pow AS pow,state FROM users WHERE dg_pow>0 ORDER BY dg_pow DESC LIMIT 50").all()).results;
  const list=rows.map((r,i)=>{let D=null;try{D=JSON.parse(r.state||"{}").dg}catch(e){}return {uid:r.id,name:r.name||"Игрок",pow:r.pow,lv:D?D.lv:1,b:D?D.b:0,dn:D?D.name||"":"",skin:D&&D.skin||null,evo:D&&D.evo||null,me:r.id===me.id?1:0,eq:D?dgEq(D).map(it=>({s:it.s,r:it.r,t:it.t})):[]}});
  const mine=await env.DB.prepare("SELECT dg_pow AS pow FROM users WHERE id=?").bind(me.id).first();let place=0;
  if(mine&&mine.pow>0)place=1+(((await env.DB.prepare("SELECT COUNT(*) AS n FROM users WHERE dg_pow>?").bind(mine.pow).first())||{}).n||0);
  const total=((await env.DB.prepare("SELECT COUNT(*) AS n FROM users WHERE dg_pow>0").first())||{}).n||0;return {list,place,total}}
async function dgViewOf(env,uid){const u=await env.DB.prepare("SELECT id,COALESCE(nick,name) AS name,state FROM users WHERE id=?").bind(uid).first();if(!u)fail("Игрок не найден");
  let D=null;try{D=JSON.parse(u.state||"{}").dg}catch(e){}if(!D)fail("У этого игрока ещё нет дракона");return {uid:u.id,name:u.name||"Игрок",dg:dgView(D,Date.now())}}
async function stateFor(env,me){
  let {u,cards}=await loadUser(env,me),pioneerNew=false;
  if(!u.pioneer&&await pioneersCount(env)<PIONEERS){
    try{const r=await env.DB.prepare("UPDATE users SET pioneer=(SELECT COALESCE(MAX(pioneer),0)+1 FROM users),gift_spins=gift_spins+? WHERE id=? AND pioneer=0 AND (SELECT COUNT(*) FROM users WHERE pioneer>0)<?").bind(PIONEER_SPINS,me.id,PIONEERS).run();
      if(r.meta.changes===1){pioneerNew=true;u=await env.DB.prepare("SELECT * FROM users WHERE id=?").bind(me.id).first()}}catch(e){}   // одновременно с кем-то: получит номер при следующем запросе
  }
  const prints=await cached("prints",30e3,async()=>{const o={};for(const r of (await env.DB.prepare("SELECT h,f,COUNT(*) AS m FROM cards WHERE (f>0 OR h>=26) AND owner<>-1 GROUP BY f,h").all()).results)o[r.h+"-"+r.f]=r.m;return o});
  const news=(await env.DB.prepare("SELECT h,buyer_name AS buyer,price,got FROM sales WHERE seller=? AND seen=0").bind(me.id).all()).results;
  if(news.length)await env.DB.prepare("UPDATE sales SET seen=1 WHERE seller=? AND seen=0").bind(me.id).run();
  const S=Object.assign(JSON.parse(u.state||"{}"),{cash:u.cash,cards,prints,news,hype:await hypeList(env),uid:me.id,name:u.nick||u.name,nick:u.nick||null,test:env.TEST==="1",refs:u.refs||0,admin:isAdmin(env,me.id),stake:u.stake?1:0,champion:await cached("champ",30e3,async()=>{const c=await kvGet(env,"champion");return c&&c.until>Date.now()?c:null}),vipUntil:u.vip_until||0,pm:(u.pm||me.pm)?1:0,pioneer:u.pioneer||0,pioneerNew,founder:u.founder||0,founderNew:!!(u.founder&&!u.founder_seen),foundersLeft:await cached("founders",10e3,async()=>((await env.DB.prepare("SELECT COUNT(*) AS n FROM cards WHERE owner=-1 AND f=5").first())||{}).n||0),pioneersLeft:Math.max(0,PIONEERS-await pioneersCount(env))});
  if(!S.dg)S.dgFr=await cached("dgfr:"+me.id,15e3,()=>dgFriends(env,me.id));
  try{S.rd=await rdState(env,me)}catch(e){}
  try{S.vt=await vtState(env,me)}catch(e){}
  try{S.ft=await ftState(env,me)}catch(e){}
  try{const now=Date.now();if(now>=VC.start&&now<VC.end){const r=await env.DB.prepare("SELECT uid FROM vc_part WHERE uid=?").bind(me.id).first();S.vc={end:VC.end,j:r?1:0}}}catch(e){}
  try{const C3=await ref3Cur(env);S.ref3=C3&&Date.now()<C3.end?{end:C3.end,n:await ref3Count(env,C3,me.id),got:(await env.DB.prepare("SELECT 1 FROM ref3_got WHERE camp=? AND uid=?").bind(C3.id,me.id).first())?1:0}:null}catch(e){}
  try{const K=await kingCur(env);S.wking=K?{uid:K.uid,name:K.name}:null;S.kingHH=await kingDec(env)}catch(e){}
  S.spins=(S.spins??0)+(u.gift_spins||0);S.created=u.created||0;S.starBal=u.star_bal||0;try{S.dmUn=((await env.DB.prepare("SELECT COUNT(*) AS n FROM dm WHERE b=? AND rd=0").bind(me.id).first())||{}).n||0}catch(e){S.dmUn=0}try{S.trIn=((await env.DB.prepare("SELECT COUNT(*) AS n FROM trades WHERE b=? AND kind='swap' AND status='new' AND t>?").bind(me.id,Date.now()-TR.ttl).first())||{}).n||0}catch(e){S.trIn=0}S.vipUntil=u.vip_until||0;S.vipT=u.vip_t||0;S.pmBonus=u.pm_bonus||0;S.cb={c:u.cb_claim?1:0,at:(dayNum(u.created||Date.now())+1)*864e5-TZ};S.golemUntil=u.golem_until||0;S.gv=u.gv||0;S.termsV=u.terms_v||0;
  S.gifts=(await env.DB.prepare("SELECT id,k,no,shelf,how,from_uid FROM gifts WHERE owner=? ORDER BY id DESC LIMIT 300").bind(me.id).all()).results;
  Object.assign(S,await nickFx(env));S.shopOn=1;try{S.sday=await sdayNow(env)}catch(e){S.sday=null}   // переливающиеся ники и «Король Эпох» месяца
  if(u.founder&&!u.founder_seen){await env.DB.prepare("UPDATE users SET founder_seen=1 WHERE id=?").bind(me.id).run();delete topCache.founders}
  // кто нападал на мои карточки за 3 дня: для уведомлений и реванша
  S.fights=(await env.DB.prepare("SELECT id,att_name,att_card,att_h,def_h,w,l,t,seen,stake,took FROM fights WHERE def=? AND t>? ORDER BY id DESC LIMIT 6").bind(me.id,Date.now()-3*864e5).all()).results;
  if(S.fights.some(f=>!f.seen))await env.DB.prepare("UPDATE fights SET seen=1 WHERE def=? AND seen=0").bind(me.id).run();
  S.chatLast=await cached("chatlast",5e3,async()=>((await env.DB.prepare("SELECT MAX(id) AS m FROM chat").first())||{}).m||0);
  S.chatTop=await cached("chattop",5e3,async()=>{const r=await env.DB.prepare("SELECT id,name,text,t FROM chat ORDER BY id DESC LIMIT 1").first();return r?{id:r.id,name:r.name,text:String(r.text||"").slice(0,90),t:r.t}:null});
  S.chatOn=await cached("chaton",30e3,async()=>((await env.DB.prepare("SELECT COUNT(*) AS n FROM users WHERE seen>?").bind(Date.now()-5*60e3).first())||{}).n||0);
  const P=await promo(env);if(P&&Date.now()<=P.end&&Date.now()>=P.start)S.promo={end:P.end,need:P.need,have:await promoCount(env,me.id,P)};
  touch(S,Date.now());
  // бот может писать игроку: Telegram сообщает это в данных входа
  if(me.pm&&!u.pm)try{await env.DB.prepare("UPDATE users SET pm=1 WHERE id=?").bind(me.id).run()}catch(e){}
  // когда игрок заходил: активные за день, возврат на второй день
  const now=Date.now();
  if(dayNum(u.seen||0)!==dayNum(now)||now-(u.seen||0)>5*60e3){const nd=dayNum(u.seen||0)!==dayNum(now),cd=dayNum(u.created||now),td=dayNum(now);
    const q=[env.DB.prepare("UPDATE users SET seen=?,back=MAX(back,?),d1=MAX(d1,?),wb=0 WHERE id=?").bind(now,td>cd?1:0,td===cd+1?1:0,me.id)];
    if(nd)q.push(bump(env,"dau"),env.DB.prepare("INSERT OR IGNORE INTO user_days(uid,d) VALUES(?,?)").bind(me.id,td));try{await env.DB.batch(q)}catch(e){}}
  // числа для мирового топа: обновляем, только если изменились
  const worth=Math.round(cards.reduce((a,c)=>a+c.v,0)*100)/100,album=new Set(cards.filter(c=>c.h<NBASE).map(c=>c.h)).size,wins=S.totalWins||0;
  const emp=empPower(S,cards);S.emp=emp;
  if(Math.abs((u.worth||0)-worth)>.004||(u.album||0)!==album||(u.wins||0)!==wins||(u.emp||0)!==emp){
    await env.DB.prepare("UPDATE users SET worth=?,album=?,wins=?,emp=? WHERE id=?").bind(worth,album,wins,emp,me.id).run();
    const r0=empRank(u.emp||0),r1=empRank(emp);if(r1>r0&&r1>=3&&(u.emp||0)>0)try{await hypeAdd(env,me.id,EMP.R[r1].ic+" поднял Империю до ранга «"+EMP.R[r1].n+"»!",r1>=4)}catch(e){}}
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
    const {u,cards}=await loadUser(env,me),ctx=await makeCtx(env,env.TEST==="1");try{hhKingSet(await kingDec(env))}catch(e){}
    const st=JSON.parse(u.state||"{}");st.cash=u.cash;if(extra)Object.assign(ctx,extra);
    st.vipUntil=u.vip_until||0;st.vipT=u.vip_t||0;st.golemUntil=u.golem_until||0;ctx.admin=isAdmin(env,me.id);ctx.noRare=env.NO_RARE==="1";ctx.luck=ctx.admin&&(st.luckUntil||0)>ctx.now;ctx.pioneer=!!u.pioneer;ctx.nick=!!u.nick;ctx.created=u.created||Date.now();
    const gift=u.gift_spins||0;st.spins=(st.spins??0)+gift;   // прокрутки за приглашённых друзей
    if(name==="dg_hatch")ctx.dgFr=await dgFriends(env,me.id);
    const before=new Map(cards.map(c=>[c.id,JSON.stringify(c)]));
    const out=runAction(name,st,cards.map(c=>JSON.parse(JSON.stringify(c))),ctx,p);
    const delta=Math.round((st.cash-u.cash)*100)/100;delete st.cash;
    // новая версия случайная: проверка ниже пропустит записи, только если именно этот запрос обновил игрока
    const nv=Math.floor(Math.random()*9e15)+1,guard="(SELECT ver FROM users WHERE id=?)=?",keep=new Set();
    // бой на карточку с игроком: сначала карточка соперника переходит ко мне, и только если это удалось, записывается всё остальное
    const take=ctx.takeCard?env.DB.prepare("UPDATE cards SET owner=? WHERE id=? AND owner=? AND list_price IS NULL AND away=0 AND room_id IS NULL").bind(me.id,ctx.takeCard,ctx.oppUid):null;
    const own=take?" AND (SELECT owner FROM cards WHERE id="+Math.floor(+ctx.takeCard)+")="+Math.floor(+me.id):"";   // id в Telegram больше 32 бит: без |0
    const stm=[env.DB.prepare("UPDATE users SET state=?,cash=cash+?,gift_spins=gift_spins-?,ver=?,name=?,updated=?,refill_at=?,camp_at=?,camp_dk=?,camp_dr=?,camp_wk=?,camp_wr=?,dg_pow=?,dg_exp=? WHERE id=? AND ver=?"+own).bind(JSON.stringify(st),delta,gift,nv,me.name,ctx.now,st.refillAt||0,(st.camp&&st.camp.fullAt)||0,(st.camp&&st.camp.dK)||null,(st.camp&&st.camp.dR)||0,(st.camp&&st.camp.wK)||null,(st.camp&&st.camp.wR)||0,st.dg?dgPower(st.dg):0,st.dg&&st.dg.exp?st.dg.exp.end:0,me.id,u.ver)];
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
  const price=Math.round(+p.price||0);if(!(price>=1&&price<=1e11))fail("Цена от 1 до 100 000 000 000 🪙");
  const r=await env.DB.prepare("UPDATE cards SET list_price=?,listed_at=? WHERE id=? AND owner=? AND list_price IS NULL AND away=0 AND room_id IS NULL AND NOT (f=4 AND sn='000010') AND (SELECT COUNT(*) FROM cards WHERE owner=? AND list_price IS NOT NULL)<?")
    .bind(price,Date.now(),p.id|0,me.id,me.id,MAX_LOTS).run();
  if(r.meta.changes!==1)fail("Карточку нельзя выставить: она в походе, уже на рынке, подарена (подарочные не продаются) или у тебя уже "+MAX_LOTS+" лотов");
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
  const have=await env.DB.prepare("SELECT COUNT(*) AS n FROM cards WHERE owner=?").bind(me.id).first();if(have.n>=await capUid(env,me.id))fail("Коллекция заполнена. Расширь место во вкладке «Карты»");
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
  await notify(env,seller,"💰 "+(bu.nick||me.name)+" купил твою карточку «"+HEROES[c.h][0]+"» за "+fmtD(price)+" 🪙"+". Тебе зачислено "+fmtD(got)+" 🪙"+" (минус 5% рынка)","Открыть игру");
  return {card:pub(rowToCard(Object.assign(c,{owner:me.id,list_price:null})))};
}

/* ---------- друзья ---------- */
async function profile(env,p,me){
  const u=await env.DB.prepare("SELECT id,COALESCE(nick,name) AS name,state,pioneer,vip_until FROM users WHERE id=?").bind(Math.floor(+p.uid||0)).first();if(!u)fail("Игрок не найден");
  const cards=(await env.DB.prepare("SELECT * FROM cards WHERE owner=? ORDER BY v DESC LIMIT 3").bind(u.id).all()).results.map(r=>pub(rowToCard(r)));
  const have=await env.DB.prepare("SELECT COUNT(DISTINCT h) AS n FROM cards WHERE owner=?").bind(u.id).first();
  const gs=(await env.DB.prepare("SELECT id,k,no,shelf FROM gifts WHERE owner=?").bind(u.id).all()).results;
  if(me&&me.id!==u.id)await env.DB.prepare("UPDATE users SET gv=gv+1 WHERE id=?").bind(u.id).run();
  const gv=((await env.DB.prepare("SELECT gv FROM users WHERE id=?").bind(u.id).first())||{}).gv||0;
  const _st=JSON.parse(u.state||"{}");
  return {pbg:_st.pbgOn||"",dfx:_st.dfxOn||"",name:u.name||"Игрок",pi:u.pioneer||0,vip:(u.vip_until||0)>Date.now()?1:0,wins:(JSON.parse(u.state||"{}").totalWins)||0,have:have.n,cards,uid:u.id,
    shelf:gs.filter(g=>g.shelf>0),gn:gs.length,gval:gs.reduce((a,g)=>a+giftVal(g.k),0),gv,grank:await giftRank(env,u.id)};
}
async function cardInfo(env,p){
  const r=await env.DB.prepare("SELECT c.*,COALESCE(u.nick,u.name) AS owner_name FROM cards c JOIN users u ON u.id=c.owner WHERE c.id=? AND c.owner>0").bind(p.id|0).first();
  if(!r)fail("Этой карточки больше нет в игре");return {card:pub(rowToCard(r)),name:r.owner_name||"Игрок",owner:r.owner};
}

/* ---------- мировой топ и лента выпадений ----------
   Списки общие для всех, поэтому держим их в памяти воркера 60 секунд, чтобы не нагружать базу. */
const BOARDS={worth:"worth",album:"album",wins:"wins",emp:"emp",glory:"glory"};
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
    const rows=(await env.DB.prepare(`SELECT id,COALESCE(nick,name) AS name,pioneer AS pi,vip_until AS vu,${col} AS score,json_extract(state,'$.ava') AS ava,json_extract(state,'$.avfOn') AS avf,json_extract(state,'$.crest') AS crest FROM users WHERE ${col}>0 ORDER BY ${col} DESC LIMIT 50`).all()).results;
    const out=[];for(const r of rows){const b=await env.DB.prepare("SELECT * FROM cards WHERE owner=? ORDER BY v DESC LIMIT 1").bind(r.id).first();
      out.push({uid:r.id,name:r.name||"Игрок",pi:r.pi||0,vip:(r.vu||0)>Date.now()?1:0,score:r.score,ava:r.ava==null?null:+r.ava,avf:r.avf||null,crest:r.crest||null,card:b?pub(rowToCard(b)):null})}return out});
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
  if(r.meta.changes!==1)fail("Смена ника стоит "+cost+" 🪙, не хватает монет");
  topCache={};return {nick:n,cost};
}

/* серии дней подряд: острова последовательных дней (d − номер строки одинаковый), mx — лучшая серия, cur — серия, которая длится до сегодня */
const STREAK_SQL="WITH dd AS (SELECT uid,d,d-ROW_NUMBER() OVER (PARTITION BY uid ORDER BY d) AS g FROM user_days), isl AS (SELECT uid,COUNT(*) AS len,MAX(d) AS last FROM dd GROUP BY uid,g), best AS (SELECT uid,MAX(len) AS mx,MAX(CASE WHEN last>=?1-1 THEN len ELSE 0 END) AS cur,COUNT(*) AS isl FROM isl GROUP BY uid)";
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
  let srcs=[];try{srcs=(await env.DB.prepare("SELECT v.code,COUNT(*) AS visits,SUM(u.src=v.code) AS fresh,SUM(u.src=v.code AND u.album>=1) AS c1,SUM(u.src=v.code AND u.nick IS NOT NULL) AS nk,SUM(u.src=v.code AND u.album>=3) AS act,SUM(u.src=v.code AND u.back=1) AS back FROM src_visits v LEFT JOIN users u ON u.id=v.uid GROUP BY v.code ORDER BY visits DESC LIMIT 40").all()).results}catch(e){}
  let x={};try{x=await adminStatsX(env,now,t0,D,days,by)}catch(e){console.error("statsX",e);x={err:String(e&&e.message||e)}}
  let streaks=[];try{streaks=(await env.DB.prepare(STREAK_SQL+" SELECT u.src AS code,COUNT(*) AS n,SUM(r.mx>=2) AS s2,SUM(r.mx>=3) AS s3,SUM(r.mx>=5) AS s5,SUM(r.mx>=7) AS s7,SUM(r.cur>=2) AS now2 FROM users u LEFT JOIN best r ON r.uid=u.id WHERE u.src IS NOT NULL GROUP BY u.src").bind(dayNum(now)).all()).results}catch(e){console.error("streaks",e)}
  let retC=[],nbF={},pathF={};try{const t14=(dayNum(Date.now())-14)*864e5-TZ;
    retC=(await env.DB.prepare("SELECT cd,COUNT(*) AS n,SUM(EXISTS(SELECT 1 FROM user_days x WHERE x.uid=u.id AND x.d=u.cd+1)) AS d1,SUM(EXISTS(SELECT 1 FROM user_days x WHERE x.uid=u.id AND x.d=u.cd+3)) AS d3,SUM(EXISTS(SELECT 1 FROM user_days x WHERE x.uid=u.id AND x.d=u.cd+7)) AS d7,SUM(COALESCE(json_extract(u.state,'$.nOp'),0)>=5) AS s5 FROM (SELECT id,state,CAST((created+?)/86400000 AS INTEGER) AS cd FROM users WHERE created>=?) u GROUP BY cd ORDER BY cd DESC").bind(TZ,t14).all()).results.map(r=>({...r,day:new Date(r.cd*864e5).toISOString().slice(5,10).split("-").reverse().join(".")}));
    for(const r of (await env.DB.prepare("SELECT COALESCE(json_extract(state,'$.nb.n'),0) AS k,COUNT(*) AS n FROM users WHERE created>=? GROUP BY k").bind(t14).all()).results)nbF[r.k]=r.n;
    for(const r of (await env.DB.prepare("SELECT COALESCE(json_array_length(json_extract(state,'$.path.got')),0)+COALESCE(json_extract(state,'$.path.fin'),0) AS k,COUNT(*) AS n FROM users WHERE created>=? GROUP BY k").bind(t14).all()).results)pathF[r.k]=r.n}catch(e){console.error("ret",e)}
  return {retC,nbF,pathF,x,streaks,srcs,players:tot.n||0,fromRef:tot.r||0,withNick:tot.nk||0,newToday:nw.d0||0,newYesterday:nw.d1||0,newWeek:nw.w||0,newRefToday:nw.r0||0,
    activeToday:act.d0||0,activeWeek:act.w||0,cohort:ret.n||0,d1:ret.d1||0,back:ret.b||0,
    today:{open:T.a_open||0,craft:T.a_craft||0,duel:(T.a_duel||0)+(T.a_fduel||0),boss:T.a_boss_hit||0,forge:T.a_forge||0,story:T.a_story||0,sales:sales.n||0,salesV:Math.round(sales.v||0)},
    cardsInGame:cards.n||0,inviters:inv,days:days.map(d=>({d,n:(by[d]||{}).new||0,a:(by[d]||{}).dau||0,o:(by[d]||{}).a_open||0}))};
}

/* расширенная статистика: звёзды, пропуск, Покорение, слияние, кланы, подарки, VIP */
async function adminStatsX(env,now,t0,D,days,by){const one=async(q,...a)=>(await env.DB.prepare(q).bind(...a).first())||{},all=async(q,...a)=>(await env.DB.prepare(q).bind(...a).all()).results;
  const PD="status IN ('paid','done') AND COALESCE(charge,'')<>'bal'";
  const st={all:await one(`SELECT COALESCE(SUM(stars),0) AS s,COUNT(*) AS n,COUNT(DISTINCT uid) AS u FROM payments WHERE ${PD}`),
    today:await one(`SELECT COALESCE(SUM(stars),0) AS s,COUNT(*) AS n,COUNT(DISTINCT uid) AS u FROM payments WHERE ${PD} AND COALESCE(paid,created)>=?`,t0),
    week:await one(`SELECT COALESCE(SUM(stars),0) AS s,COUNT(*) AS n,COUNT(DISTINCT uid) AS u FROM payments WHERE ${PD} AND COALESCE(paid,created)>=?`,t0-6*D),
    refund:await one("SELECT COALESCE(SUM(stars),0) AS s,COUNT(*) AS n FROM payments WHERE status='refund'"),
    items:await all(`SELECT item,COALESCE(SUM(stars),0) AS s,COUNT(*) AS n,SUM(COALESCE(paid,created)>=?) AS t FROM payments WHERE ${PD} GROUP BY item ORDER BY s DESC`,t0),
    top:await all(`SELECT p.uid,COALESCE(u.nick,u.name) AS name,SUM(p.stars) AS s,COUNT(*) AS n,MAX(COALESCE(p.paid,p.created)) AS last FROM payments p LEFT JOIN users u ON u.id=p.uid WHERE ${PD} GROUP BY p.uid ORDER BY s DESC LIMIT 15`),
    last:await all(`SELECT p.item,p.stars,COALESCE(p.paid,p.created) AS t,COALESCE(u.nick,u.name) AS name FROM payments p LEFT JOIN users u ON u.id=p.uid WHERE ${PD} ORDER BY p.id DESC LIMIT 12`)};
  const stD=[];for(const d of days.slice(-14)){const a=Date.UTC(+d.slice(0,4),+d.slice(5,7)-1,+d.slice(8,10))-TZ;stD.push({d,s:(await one(`SELECT COALESCE(SUM(stars),0) AS s FROM payments WHERE ${PD} AND COALESCE(paid,created)>=? AND COALESCE(paid,created)<?`,a,a+D)).s||0})}
  const sn=passSeason(now),J="json_extract(state,",T=by[days[days.length-1]]||{};
  const pass=await one(`SELECT COUNT(*) AS n,SUM(${J}'$.pass.prem')=?) AS prem,AVG(MIN(30,${J}'$.pass.xp')/${PASS.xp})) AS lv,SUM(${J}'$.pass.xp')>=${PASS.xp*10}) AS l10,SUM(${J}'$.pass.xp')>=${PASS.xp*20}) AS l20,SUM(${J}'$.pass.xp')>=${PASS.xp*30}) AS l30,SUM(${J}'$.pass.xp')>0) AS act FROM users WHERE ${J}'$.pass.s')=?`,sn,sn);
  const passQ=await one(`SELECT SUM(json_array_length(${J}'$.pass.q'))) AS q,SUM(${J}'$.pass.d')=?) AS dn FROM users WHERE ${J}'$.pass.s')=?`,mskDay(now),sn);
  const conq=await one(`SELECT SUM(${J}'$.conq.c')>0) AS n,MAX(${J}'$.conq.c')) AS mx,AVG(${J}'$.conq.c')) AS av,SUM(${J}'$.conq.c')>=8) AS ch1,SUM(${J}'$.conq.c')>=16) AS ch2,SUM(${J}'$.conq.c')>=24) AS ch3,SUM(${J}'$.conq.c')>=32) AS ch4,SUM(${J}'$.conq.c')>=40) AS ch5 FROM users WHERE ${J}'$.conq.c') IS NOT NULL`);
  const conqTop=await all(`SELECT COALESCE(nick,name) AS name,${J}'$.conq.c') AS c FROM users WHERE ${J}'$.conq.c')>0 ORDER BY c DESC LIMIT 5`);
  const wel=await one(`SELECT SUM(${J}'$.wel')=1) AS got,SUM(${J}'$.wel')=0) AS wait FROM users`);
  const stars=await one("SELECT SUM(stars>0) AS n,SUM(stars) AS s FROM cards WHERE owner>0");
  const clans=await one("SELECT COUNT(*) AS n FROM clans"),inClan=await one("SELECT COUNT(*) AS n FROM users WHERE clan>0"),
    clanHits=await one("SELECT COALESCE(SUM(dmg),0) AS d,COUNT(*) AS u FROM clan_hits WHERE week=?",mskWeek(now)),clanToday=await one("SELECT COALESCE(SUM(n),0) AS n FROM clan_hits WHERE day=?",mskDay(now));
  const gifts=await all("SELECT how,COUNT(*) AS n FROM gifts GROUP BY how"),giftSent=await one("SELECT COUNT(*) AS n FROM gifts WHERE from_uid IS NOT NULL AND from_uid>0");
  const vip=await one("SELECT SUM(vip_until>?) AS n,SUM(vip_until>? AND vip_t=3) AS d,SUM(vip_until>? AND vip_t=2) AS g FROM users",now,now,now),golem=await one("SELECT SUM(golem_until>?) AS n FROM users",now);
  const cnt=k=>T["a_"+k]||0,wk=k=>days.slice(-7).reduce((a,d)=>a+((by[d]||{})["a_"+k]||0),0);
  /* дракон: яйца, вылупившиеся, породы, стадии, снаряжение, казино, звёзды */
  const dg={n:0,today:0,week:0,br:DG_BREED.map(()=>0),stg:DG_STAGE.map(()=>0),lv:0,maxLv:0,pow:0,maxPow:0,items:DG_R.map(()=>0),eq:0,set5:0,set3:0,named:0,hungry:0,sh:0,ap:0,casG:0,casA:0,casItems:0,up:0};
  for(const r of await all("SELECT state FROM users WHERE dg_pow>0")){let D=null;try{D=JSON.parse(r.state||"{}").dg}catch(e){}if(!D)continue;
    dg.n++;if((D.t||0)>=t0)dg.today++;if((D.t||0)>=t0-6*864e5)dg.week++;dg.br[D.b]=(dg.br[D.b]||0)+1;dg.stg[dgStage(D.lv)]++;dg.lv+=D.lv;dg.maxLv=Math.max(dg.maxLv,D.lv);
    const p=dgPower(D);dg.pow+=p;dg.maxPow=Math.max(dg.maxPow,p);(D.inv||[]).forEach(it=>{dg.items[it.r]++;if(it.c==="cas")dg.casItems++;dg.up+=it.lv||0});dg.eq+=dgEq(D).length;
    const sb=dgSetBonus(dgEq(D));if(sb.n>=5)dg.set5++;else if(sb.n>=3)dg.set3++;if(D.name)dg.named++;if(dgSat(D,now)<DG.hungry)dg.hungry++;dg.sh+=D.sh||0;dg.ap+=D.ap||0;dg.casG+=D.cg||0;dg.casA+=D.ca||0}
  const fr=await all("SELECT ref,COUNT(*) AS n FROM users WHERE ref IS NOT NULL AND ref>0 AND created>=? AND COALESCE(json_extract(state,'$.nOp'),0)>=? GROUP BY ref",DG.since,DG.frSpins);
  const hatchedIds=new Set((await all("SELECT id FROM users WHERE dg_pow>0")).map(x=>x.id));
  const egg={f1:fr.filter(x=>x.n===1).length,f2:fr.filter(x=>x.n===2).length,f3:fr.filter(x=>x.n>=3).length,ready:fr.filter(x=>x.n>=3&&!hatchedIds.has(x.ref)).length};
  const dgPay=await all(`SELECT json_extract(p,'$.k') AS k,COALESCE(SUM(stars),0) AS s,COUNT(*) AS n,SUM(COALESCE(paid,created)>=?) AS t FROM payments WHERE item='dg' AND status IN ('paid','done') GROUP BY k`,t0);
  const dgTop=(await all("SELECT COALESCE(nick,name) AS name,dg_pow AS pow,json_extract(state,'$.dg.lv') AS lv,json_extract(state,'$.dg.b') AS b,json_extract(state,'$.dg.name') AS dn FROM users WHERE dg_pow>0 ORDER BY dg_pow DESC LIMIT 7"));
  const dgAct=Object.fromEntries(["dg_hatch","dg_tap","dg_feed","dg_nest","dg_gift","dg_open","dg_equip","dg_up","dg_dis","dg_name"].map(k=>[k,{t:cnt(k),w:wk(k)}]));
  const bal=await one("SELECT COALESCE(SUM(star_bal),0) AS s,SUM(star_bal>0) AS n FROM users"),balSpent=await one("SELECT COALESCE(SUM(stars),0) AS s,COUNT(*) AS n FROM payments WHERE charge='bal' AND status IN ('paid','done')");
  return {bal:{left:bal.s||0,users:bal.n||0,spent:balSpent.s||0,buys:balSpent.n||0},stars:st,starsDays:stD,season:{...pass,no:sn+1,name:passTheme(sn).n,end:passEnd(sn),quests:passQ.q||0,questDay:passQ.dn||0},
    conq:{...conq,top:conqTop,today:cnt("conq_fight"),week:wk("conq_fight")},fuse:{today:cnt("fuse"),week:wk("fuse"),starred:stars.n||0,stars:stars.s||0,forge:cnt("forge")},
    wel:{got:wel.got||0,wait:wel.wait||0},clans:{n:clans.n||0,members:inClan.n||0,dmg:clanHits.d||0,hitters:clanHits.u||0,hitsToday:clanToday.n||0},
    gifts:Object.fromEntries(gifts.map(g=>[g.how||"?",g.n])),giftSent:giftSent.n||0,vip:{n:vip.n||0,diamond:vip.d||0,gold:vip.g||0,golem:golem.n||0},
    today:{case:cnt("cas_case"),slot:cnt("cas_slot"),hl:cnt("cas_hl_go"),ex:cnt("ex_runes"),passClaim:cnt("pass_claim"),era:cnt("era_claim")},
    dg:{...dg,egg,pay:dgPay,top:dgTop,act:dgAct,twins:(await one("SELECT COUNT(*) AS n FROM cards WHERE f=?",DUO_F)).n||0,newCards:(await one("SELECT COUNT(*) AS n FROM cards WHERE h>=46 AND h<66")).n||0,caps:await one(`SELECT SUM(${J}'$.capC')=1) AS c,SUM(COALESCE(${J}'$.capS'),0)) AS s FROM users`)}};
}

/* ---------- бои с настоящими игроками ---------- */
/* «на интерес»: любая карточка похожей редкости.
   «на карточку»: только у игроков, которые сами включили бои на карточку, цена от 0,5× до 2× моей, и у соперника есть место в коллекции */
async function pickOpponent(env,me,p,stake){
  const row=async(sql,...a)=>env.DB.prepare(sql).bind(...a).first();
  const mine=await row("SELECT h,v FROM cards WHERE id=? AND owner=?",p.id|0,me.id);if(!mine)return null;
  let SEL="SELECT c.*,COALESCE(u.nick,u.name) AS owner_name FROM cards c JOIN users u ON u.id=c.owner WHERE c.owner>0 AND c.owner<>? AND c.list_price IS NULL AND c.away=0 AND c.room_id IS NULL AND c.f<>5 AND NOT (c.f=4 AND c.sn='000010') AND c.part=0";   // «Основатель» в боях не участвует
  const args=[me.id];
  if(stake){SEL+=" AND u.stake=1 AND c.v BETWEEN ? AND ? AND (SELECT COUNT(*) FROM cards x WHERE x.owner=c.owner)<?+"+SLOT_STEP+"*MIN(1,COALESCE(json_extract(u.state,'$.capC'),0))+"+SLOT_STAR.n+"*MIN("+SLOT_STAR.max+",COALESCE(json_extract(u.state,'$.capS'),0))";args.push(mine.v*.5,mine.v*2,CAP)}
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
  const K=await kingCur(env);const pin=await cached("chatpin",15e3,()=>kvGet(env,"chat_pin"));return {items:rows.map(r=>Object.assign(r,{a:isAdmin(env,r.uid)?1:0,k:K&&K.uid===r.uid?1:0})),pin:pin&&pin.text?pin:null};
}
/* 💬 чат клана и 🔍 поиск игроков */
async function socApi(env,me,a,p){const now=Date.now();
  if(a==="pl_find"){const q=String(p.q||"").trim().replace(/^@/,"").slice(0,30);if(q.length<2)fail("Напиши хотя бы 2 буквы ника");const k=nickKey(q.replace(/\s+/g,"_"))||q.toLowerCase();
    const L=(await env.DB.prepare("SELECT id,nick,vip_until,(SELECT COUNT(*) FROM cards c WHERE c.owner=u.id) AS n FROM users u WHERE nick_key LIKE ? ORDER BY (nick_key=?) DESC,seen DESC LIMIT 12").bind(k+"%",k).all()).results;
    return {list:L.map(u=>({uid:u.id,name:u.nick,vip:(u.vip_until||0)>now?1:0,n:u.n||0}))}}
  const u=await env.DB.prepare("SELECT clan,nick,muted FROM users WHERE id=?").bind(me.id).first();if(!u||!u.clan)fail("Ты не в клане");
  if(a==="cm_get"){const after=Math.max(0,p.after|0);const L=(await env.DB.prepare("SELECT id,uid,name,text,t FROM clan_msg WHERE clan=? AND id>? ORDER BY id DESC LIMIT 60").bind(u.clan,after).all()).results.reverse();return {list:L,me:me.id}}
  if(a==="cm_send"){if(!u.nick)fail("Чтобы писать, выбери ник во вкладке «Топ»");if((u.muted||0)>now)fail("Тебе запрещено писать в чат ещё "+Math.ceil((u.muted-now)/36e5)+" ч");
    let t=String(p.text||"").replace(/\s+/g," ").trim();if(!t)fail("Пустое сообщение");if(t.length>200)fail("Не длиннее 200 символов");if(CHAT_LINK.test(t))fail("Ссылки в чате запрещены");t=t.replace(CHAT_BAD,m=>"*".repeat(m.length));
    const last=await env.DB.prepare("SELECT t FROM clan_msg WHERE uid=? ORDER BY id DESC LIMIT 1").bind(me.id).first();if(last&&now-last.t<2000)fail("Не так быстро");
    await env.DB.prepare("INSERT INTO clan_msg(clan,uid,name,text,t) VALUES(?,?,?,?,?)").bind(u.clan,me.id,u.nick,t,now).run();return {ok:1}}
  fail("Неизвестное действие")}
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
  if(a==="chat_pin"){let P;if(p.id){const m=await env.DB.prepare("SELECT id,name,text,t FROM chat WHERE id=?").bind(p.id|0).first();if(!m)fail("Сообщение не найдено");P={id:m.id,name:m.name,text:m.text,t:m.t}}else{const t=String(p.text||"").replace(/\s+/g," ").trim().slice(0,300);if(!t)fail("Пустое сообщение");P={id:0,name:"Администрация",text:t,t:Date.now()}}
    await kvSet(env,"chat_pin",P);delete topCache.chatpin;return {pin:P}}
  if(a==="chat_unpin"){await kvSet(env,"chat_pin",{});delete topCache.chatpin;return {pin:null}}
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
    const c=await arenaCard(env,me,p.id),mode=p.mode?1:0,priv=p.priv?1:0,ok0=(()=>{if(p.mode&&noTrade(c))fail("Эта карточка не участвует в боях на карточку: она подарена и существует в одном экземпляре")})(),code=Math.random().toString(36).slice(2,8);
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
    const c=await arenaCard(env,me,p.id),hc=rj(r0.hc);if(r0.mode&&noTrade(c))fail("Эта карточка не участвует в боях на карточку: она подарена и существует в одном экземпляре");
    if(r0.mode){if(c.v<hc.v*.5||c.v>hc.v*2)fail("В бою на карточку цены должны быть похожи: от "+fmtD(hc.v*.5)+" до "+fmtD(hc.v*2)+" 🪙");
      for(const u of [me.id,r0.host]){const n=await env.DB.prepare("SELECT COUNT(*) AS n FROM cards WHERE owner=?").bind(u).first();if(n.n>=await capUid(env,u))fail(u===me.id?"У тебя полная коллекция":"У соперника полная коллекция")}}
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
async function rkGhost(env,me,q){const now=Date.now(),hs=HEROES.map((H,i)=>i).filter(i=>wclass(i)===q.wc&&!HEROES[i][4].collab);
  const r=await env.DB.prepare(`SELECT c.*,COALESCE(u.nick,u.name) AS owner_name,u.rating AS orating FROM cards c JOIN users u ON u.id=c.owner WHERE c.owner>0 AND c.owner<>? AND c.part=0 AND c.f<>5 AND NOT (c.f=4 AND c.sn='000010') AND c.h IN (${hs.join(",")}) ORDER BY ABS(COALESCE(u.rating,0)-?)+ABS(RANDOM()%400) LIMIT 1`).bind(me.id,q.rating).first();
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
  const u=await env.DB.prepare("SELECT cash,COALESCE(nick,name) AS n FROM users WHERE id=?").bind(me.id).first();if(!u||u.cash<it.price)fail("Не хватает "+fmtD(Math.max(0,it.price-((u&&u.cash)||0)))+" 🪙");
  const ins=await env.DB.prepare("INSERT OR IGNORE INTO trader_sold(slot,i,uid,name,t) VALUES(?,?,?,?,?)").bind(T.slot,it.i,me.id,u.n,Date.now()).run();if(ins.meta.changes!==1)fail("Эту карточку уже купили");
  try{return await doAction(env,me,"trader_take",{},{trader:it})}catch(e){await env.DB.prepare("DELETE FROM trader_sold WHERE slot=? AND i=? AND uid=?").bind(T.slot,it.i,me.id).run();throw e}}
async function traderSell(env,me,p){const T=await traderStock(env),h=p.h|0;if(!T.wants.includes(h))fail("Торговец сейчас не ищет этого воина");
  const n=((await env.DB.prepare("SELECT COUNT(*) AS n FROM trader_buy WHERE slot=? AND h=?").bind(T.slot,h).first())||{}).n||0;if(n>=TRADER_WANT_N)fail("Торговец уже набрал таких воинов. Жди новую смену");
  const ins=await env.DB.prepare("INSERT OR IGNORE INTO trader_buy(slot,h,uid) VALUES(?,?,?)").bind(T.slot,h,me.id).run();if(ins.meta.changes!==1)fail("Ты уже продал ему такого воина в эту смену");
  try{return await doAction(env,me,"trader_give",{id:p.id},{trader:{h,k:TRADER_WANT_K}})}catch(e){await env.DB.prepare("DELETE FROM trader_buy WHERE slot=? AND h=? AND uid=?").bind(T.slot,h,me.id).run();throw e}}
/* ---------- аукцион дня ----------
   В 20:00 по Минску одна редкая карточка: «Ошибка печати» обычного/редкого воина (если свободна) или золотой легендарный/мифический.
   Деньги ставки сразу списываются; перебили — возвращаются. Деньги победителя сгорают: это главный сток лишних денег. */
async function aucCur(env){const now=Date.now(),day=dayOf(now),d=new Date(now+TZ),start=Date.UTC(d.getUTCFullYear(),d.getUTCMonth(),d.getUTCDate(),AUC_HOUR)-TZ;
  let A=await env.DB.prepare("SELECT * FROM auc WHERE day=?").bind(day).first();
  if(!A&&now>=start-6*3600e3){const ctx=await makeCtx(env,false),R=Math.random;let h,f;
    const errFree=HEROES.map((H,i)=>i).filter(i=>i<NBASE&&HEROES[i][2]<=2&&ctx.issuedOf(i,4)<1);
    if(R()<.5&&errFree.length){h=errFree[Math.floor(R()*errFree.length)];f=4}
    else{const pool=HEROES.map((H,i)=>i).filter(i=>i<NBASE&&HEROES[i][2]>=3&&ctx.issuedOf(i,3)<FIN[3].run);h=pool[Math.floor(R()*pool.length)];f=3}
    const B=cardBody(h,f),v=priceOf(h,f,2,"123457",B.top);
    try{await env.DB.prepare("INSERT INTO auc(day,h,f,stats,hue,v,min,start,until) VALUES(?,?,?,?,?,?,?,?,?)").bind(day,h,f,JSON.stringify(B.stats),B.hue,v,Math.round(v*.5),start,start+AUC_MS).run()}catch(e){}
    A=await env.DB.prepare("SELECT * FROM auc WHERE day=?").bind(day).first()}
  if(!A){A=await env.DB.prepare("SELECT * FROM auc ORDER BY id DESC LIMIT 1").first()}
  return A}
function aucView(A,me){if(!A)return null;const now=Date.now();
  return {id:A.id,phase:A.done||now>=A.until?"done":now>=A.start?"on":"soon",left:Math.max(0,(now<A.start?A.start:A.until)-now),start:A.start,
    card:{id:"a"+A.id,h:A.h,f:A.f,no:0,sn:"??????",hue:A.hue,v:A.v,stats:rj(A.stats,[]),xp:0,wins:0,stars:0},min:A.min,bid:A.bid,next:A.bid?Math.ceil(A.bid*(1+AUC_STEP)):A.min,top:A.top,top_name:A.top_name,n:A.n,mine:A.top===me.id}}
async function aucBid(env,me,p){const A=await aucCur(env),now=Date.now();if(!A||A.done||now<A.start||now>=A.until)fail("Сейчас торгов нет. Аукцион каждый день с "+AUC_HOUR+":00 до 20:00");
  if(A.top===me.id)fail("Твоя ставка и так первая");
  const next=A.bid?Math.ceil(A.bid*(1+AUC_STEP)):A.min,amt=Math.max(next,Math.ceil(+p.amt||0));
  const pay=await env.DB.prepare("UPDATE users SET cash=cash-? WHERE id=? AND cash>=?").bind(amt,me.id,amt).run();if(pay.meta.changes!==1)fail("Не хватает монет: нужно "+fmtD(amt)+" 🪙");
  const nm=await nameOf(env,me.id),until=Math.max(A.until,now+AUC_EXT);
  const up=await env.DB.prepare("UPDATE auc SET top=?,top_name=?,bid=?,n=n+1,until=?,ver=ver+1 WHERE id=? AND ver=? AND bid<? AND done=0").bind(me.id,nm,amt,until,A.id,A.ver,amt).run();
  if(up.meta.changes!==1){await env.DB.prepare("UPDATE users SET cash=cash+? WHERE id=?").bind(amt,me.id).run();fail("Кто-то успел перебить ставку. Попробуй ещё раз")}
  if(A.top){await env.DB.prepare("UPDATE users SET cash=cash+? WHERE id=?").bind(A.bid,A.top).run();
    await notify(env,A.top,"🔨 Твою ставку на аукционе перебил "+nm+": "+fmtD(amt)+" 🪙"+". Деньги вернулись. Успей перебить!","🔨 К аукциону",PAGE+"?shop=1")}
  delete topCache.feed;return aucView(await env.DB.prepare("SELECT * FROM auc WHERE id=?").bind(A.id).first(),me)}
async function aucTick(env){const now=Date.now(),A=await aucCur(env);if(!A)return;
  if(!A.done&&now>=A.until&&now>=A.start){const t=await env.DB.prepare("UPDATE auc SET done=1 WHERE id=? AND done=0").bind(A.id).run();if(t.meta.changes!==1)return;
    if(A.top){try{const u=await env.DB.prepare("SELECT name FROM users WHERE id=?").bind(A.top).first();
      await doAction(env,{id:A.top,name:(u&&u.name)||"Игрок"},"auc_win",{},{auc:{h:A.h,f:A.f,stats:rj(A.stats,[]),hue:A.hue,v:A.v}});
      await notify(env,A.top,"🏆 Ты выиграл аукцион дня! «"+HEROES[A.h][0]+"», "+FIN[A.f].k.toLowerCase()+" — за "+fmtD(A.bid)+" 🪙"+". Карточка уже в коллекции.","🎴 Смотреть")}catch(e){console.error("auc win",e)}}
    return}
  // за минуту до старта: рассылка «аукцион начинается»
  const k=await kvGet(env,"auc_note");if(!A.done&&now>=A.start-60e3&&now<A.start+AUC_MS&&(!k||k.id!==A.id||!k.done)){const st=k&&k.id===A.id?k:{id:A.id,after:0,done:0};
    const us=(await env.DB.prepare("SELECT id FROM users WHERE pm=1 AND id>? ORDER BY id LIMIT 25").bind(st.after).all()).results;
    for(const u of us){await notify(env,u.id,"🔨 Аукцион дня начинается! Сегодня на кону: «"+HEROES[A.h][0]+"», "+FIN[A.f].k.toLowerCase()+" — "+(A.f===4?"единственная в мире":"золотая")+". Стартовая ставка "+fmtD(A.min)+" 🪙"+", торги до 20:00.","🔨 Участвовать",PAGE+"?shop=1");st.after=u.id}
    if(us.length<25)st.done=1;await kvSet(env,"auc_note",st);return}
  // за полчаса до конца: «последние 30 минут»
  const end=A.until-30*60e3,k2=await kvGet(env,"auc_note2");if(!A.done&&now>=end&&now<A.until&&(!k2||k2.id!==A.id||!k2.done)){const st=k2&&k2.id===A.id?k2:{id:A.id,after:0,done:0};
    const us=(await env.DB.prepare("SELECT id FROM users WHERE pm=1 AND id>? ORDER BY id LIMIT 25").bind(st.after).all()).results;
    for(const u of us){await notify(env,u.id,"⏰ Аукцион закрывается через 30 минут! «"+HEROES[A.h][0]+"», "+FIN[A.f].k.toLowerCase()+": "+(A.bid?"ставка "+fmtD(A.bid)+" 🪙"+" от "+A.top_name+". Перебьёшь?":"ставок ещё нет — забирай за стартовую "+fmtD(A.min)+" 🪙"+"!"),"🔨 К аукциону",PAGE+"?shop=1");st.after=u.id}
    if(us.length<25)st.done=1;await kvSet(env,"auc_note2",st)}}
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
    await tourPrize(env,champ,TOUR_PRIZE[0],"🏆 ТЫ ЧЕМПИОН ТУРНИРА! +10 000 🪙, +10 прокруток, гарантированная эпическая карточка, VIP на 7 дней и кубок 🏆 у ника на неделю!");
    if(fin)await tourPrize(env,fin,TOUR_PRIZE[1],"🥈 Второе место в турнире! +3 000 🪙 и +5 прокруток. В следующую субботу — за кубком!");
    for(const u of semis)await tourPrize(env,u,TOUR_PRIZE[2],"🥉 Полуфинал турнира! +1 000 🪙 и +3 прокрутки");
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
      last:last?{name:last.champion_name,uid:last.champion}:null,prize:"🏆 10 000 🪙 + 10 прокруток + эпик + VIP на неделю + кубок у ника"}}
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

/* x2 к пополнению: сколько ещё бонусных звёзд даст активированный промокод (берём самый щедрый неиспользованный) */
/* +N ⭐ сверху к следующему пополнению (промокод с bon), действует до bon_until */
async function bonLeft(env,uid,n){const r=await env.DB.prepare("SELECT bon FROM promo_uses WHERE uid=? AND bon>0 AND bon_until>? AND bmin<=? ORDER BY bon DESC LIMIT 1").bind(uid,Date.now(),n==null?1e9:n).first();return r?r.bon:0}
/* все действующие «+⭐ к пополнению» игрока: [{bon,bmin}] — клиент подсвечивает суммы, с которых бонус сработает */
async function bonList(env,uid){return (await env.DB.prepare("SELECT bon,bmin,bon_until AS until FROM promo_uses WHERE uid=? AND bon>0 AND bon_until>? ORDER BY bon DESC LIMIT 5").bind(uid,Date.now()).all()).results}
async function x2Left(env,uid){const r=await env.DB.prepare("SELECT code,x2 FROM promo_uses WHERE uid=? AND x2>0 AND x2d=0 ORDER BY x2 DESC LIMIT 1").bind(uid).first();return r?r.x2:0}
/* ---------- 🎟 промокоды: админ создаёт, игрок вводит один раз. По кодам видно, из какого видео и с какой площадки пришли люди ---------- */
const promoKey=c=>String(c||"").toUpperCase().replace(/Ё/g,"Е").replace(/[^A-ZА-Я0-9_-]/g,"").slice(0,24);
/* ---------- 🎥 эфир: «открываю за тебя» — карточка зрителю по одноразовому коду (48 ч) ---------- */
const LIVE_OWNER=-5,LIVE_TTL=48*36e5,LIVE_SP=[[3,22],[5,22],[7,16],[10,16],[15,10],[20,7],[30,5],[50,2]];
const liveSp=()=>{let r=Math.random()*LIVE_SP.reduce((a,x)=>a+x[1],0);for(const [n,w] of LIVE_SP){r-=w;if(r<0)return n}return 3};
async function liveApi(env,me,a,p){if(!isAdmin(env,me.id))fail("Нет доступа");const now=Date.now();
  if(a==="live_open"){const name=String(p.name||"").trim().replace(/^@/,"").slice(0,32);if(!name)fail("Напиши ник зрителя");
    const r=(await doAction(env,me,"live_roll",{},{grant:true})).res,c=r&&r.card;if(!c||!c.id)fail("Не получилось открыть");
    const mv=await env.DB.prepare("UPDATE cards SET owner=?,away=0,dest=NULL WHERE id=? AND owner=?").bind(LIVE_OWNER,c.id,me.id).run();if(mv.meta.changes!==1)fail("Карточка не отложилась");
    let code="";for(let i=0;i<20;i++){const b=new Uint32Array(1);crypto.getRandomValues(b);code=String(100000+b[0]%900000);if(!(await env.DB.prepare("SELECT 1 FROM live_drop WHERE code=?").bind(code).first()))break}
    const sp=liveSp();await env.DB.prepare("INSERT INTO live_drop(code,card,name,t,sp) VALUES(?,?,?,?,?)").bind(code,c.id,name,now,sp).run();
    const row=await env.DB.prepare("SELECT * FROM cards WHERE id=?").bind(c.id).first();return {code,name,sp,card:pub(rowToCard(row)),until:now+LIVE_TTL}}
  if(a==="live_tt"){if(!env.TT)fail("Чтение чата TikTok работает только на сервере игры");const op=String(p.op||"status");
    if(op==="start"){await env.DB.prepare("DELETE FROM live_chat WHERE t<?").bind(now-864e5).run();return await env.TT.start(p.user)}if(op==="stop")return await env.TT.stop();return env.TT.status()}
  if(a==="live_feed"){const after=Math.max(0,p.after|0);const rows=(await env.DB.prepare("SELECT id,uid,nick,text,pic,kind,t FROM live_chat WHERE id>? ORDER BY id DESC LIMIT 80").bind(after).all()).results.reverse();
    const last=after?null:((await env.DB.prepare("SELECT MAX(id) AS m FROM live_chat").first())||{}).m||0;return {rows:after?rows:rows.slice(-15),last:after?undefined:last,tt:env.TT?env.TT.status():null}}
  if(a==="live_list"){const L=(await env.DB.prepare("SELECT d.*,c.h,c.f,c.v,COALESCE(u.nick,u.name) AS who FROM live_drop d LEFT JOIN cards c ON c.id=d.card LEFT JOIN users u ON u.id=d.by_uid ORDER BY d.t DESC LIMIT 60").all()).results;
    return {list:L.map(x=>({code:x.code,name:x.name,sp:x.sp||0,t:x.t,h:x.h,f:x.f,v:x.v,who:x.who||null,got:x.got_t||0,exp:!x.got_t&&now>x.t+LIVE_TTL?1:0}))}}
  fail("Неизвестное действие")}
async function liveClaim(env,me,code){const D=await env.DB.prepare("SELECT * FROM live_drop WHERE code=?").bind(code).first();if(!D)return null;const now=Date.now();
  if(D.by_uid)fail(D.by_uid===me.id?"Эта карточка уже твоя 😉":"Эту карточку уже забрали");if(now>D.t+LIVE_TTL)fail("Код с эфира действовал 48 часов — срок закончился");
  const g=await env.DB.prepare("UPDATE live_drop SET by_uid=?,got_t=? WHERE code=? AND by_uid IS NULL").bind(me.id,now,code).run();if(g.meta.changes!==1)fail("Эту карточку уже забрали");
  await env.DB.prepare("UPDATE cards SET owner=? WHERE id=? AND owner=?").bind(me.id,D.card,LIVE_OWNER).run();
  if(D.sp)try{await doAction(env,me,"tour_prize",{sp:D.sp},{tour:1})}catch(e){console.error("livesp",e)}
  const row=await env.DB.prepare("SELECT * FROM cards WHERE id=?").bind(D.card).first();
  for(const ad of ADMINS)try{await notify(env,ad,"🎥 Карточку с эфира забрали: код "+code+" («"+D.name+"») → "+(me.nick||me.name||me.id)+" (id "+me.id+"), "+(row?HEROES[row.h][0]:"?"),"⚔️ Открыть")}catch(e){}
  return {live:1,card:row?pub(rowToCard(row)):null,name:D.name,sp:D.sp||0}}
/* ---------- 🔥 акция «пригласи 3 друзей → VIP на 7 дней + x2 к пополнению звёзд» (включает админ на N часов) ---------- */
const REF3={need:3,vip:2,days:7,x2:500,late:6*36e5};
async function ref3Cur(env){return cached("ref3",env.TEST==="1"?0:5e3,async()=>{const C=await kvGet(env,"ref3");return C&&C.end?C:null})}
async function ref3Count(env,C,uid){return ((await env.DB.prepare("SELECT COUNT(*) AS n FROM users WHERE ref=? AND created>=? AND created<? AND COALESCE(json_extract(state,'$.nOp'),0)>=?").bind(uid,C.start,C.end,CHAL_OPEN).first())||{}).n||0}
async function ref3Tick(env){const C=await ref3Cur(env),now=Date.now();if(!C||now>C.end+REF3.late)return;
  const rows=(await env.DB.prepare("SELECT ref AS uid,COUNT(*) AS n FROM users WHERE ref IS NOT NULL AND created>=? AND created<? AND COALESCE(json_extract(state,'$.nOp'),0)>=? GROUP BY ref HAVING COUNT(*)>=?").bind(C.start,C.end,CHAL_OPEN,REF3.need).all()).results;
  for(const r of rows){if(isAdmin(env,r.uid))continue;const g=await env.DB.prepare("INSERT OR IGNORE INTO ref3_got(camp,uid,t) VALUES(?,?,?)").bind(C.id,r.uid,now).run();if(g.meta.changes!==1)continue;
    const u=await env.DB.prepare("SELECT vip_until,vip_t FROM users WHERE id=?").bind(r.uid).first()||{},act=(u.vip_until||0)>now;
    await env.DB.prepare("UPDATE users SET vip_until=?,vip_t=? WHERE id=?").bind(Math.max(now,u.vip_until||0)+REF3.days*864e5,act?Math.max(u.vip_t||1,REF3.vip):REF3.vip,r.uid).run();
    delete topCache.nfx;
    try{await notify(env,r.uid,"🎉 Ты пригласил "+r.n+" друзей — акция выполнена!\n\n👑 VIP уже включён: корона у ника, больше прокруток и места для карточек.","👑 Открыть игру")}catch(e){}}}
async function ref3Api(env,me,a,p){const now=Date.now();
  if(a==="ref3_get"){const C=await ref3Cur(env);if(!C)return {on:0};const got=!!(await env.DB.prepare("SELECT 1 FROM ref3_got WHERE camp=? AND uid=?").bind(C.id,me.id).first());
    return {on:now<C.end?1:0,start:C.start,end:C.end,n:await ref3Count(env,C,me.id),need:REF3.need,got:got?1:0,days:REF3.days,x2:REF3.x2,
      adm:isAdmin(env,me.id)?{done:((await env.DB.prepare("SELECT COUNT(*) AS n FROM ref3_got WHERE camp=?").bind(C.id).first())||{}).n||0,fresh:((await env.DB.prepare("SELECT COUNT(*) AS n FROM users WHERE ref IS NOT NULL AND created>=? AND created<?").bind(C.start,Math.min(now,C.end)).first())||{}).n||0}:undefined}}
  if(!isAdmin(env,me.id))fail("Нет доступа");
  if(a==="ref3_start"){const h=Math.max(1,Math.min(24,+p.h||3)),C=await ref3Cur(env);if(C&&now<C.end)fail("Акция уже идёт");const id=new Date(now+3*3600e3).toISOString().slice(0,16).replace(/[-:T]/g,"");
    await kvSet(env,"ref3",{id,start:now,end:now+h*36e5});delete topCache.ref3;return {id,end:now+h*36e5}}
  if(a==="ref3_stop"){const C=await ref3Cur(env);if(!C||now>=C.end)fail("Акция не идёт");C.end=now;await kvSet(env,"ref3",C);delete topCache.ref3;return {end:now}}
  fail("Неизвестное действие")}
/* ---------- ⚔️ «Выбор серии»: зрители решают, что будет в следующей серии ---------- */
const VOTE_DEFAULT={id:"ep3",ep:3,title:"«Тайная тропа»",q:"Предатель показал персам тайную тропу — спартанцев окружают. Что сделает Леонид?",
  opts:[{k:"s",ic:"🛡",n:"Остаться и сражаться",d:"до последнего — и войти в историю навсегда"},{k:"r",ic:"🏃",n:"Отступить",d:"спасти своих воинов, но изменить историю"}],
  sp:3,url:"",urlIg:"",socSp:3,socWait:20,start:Date.UTC(2026,10,7,15,0),end:Date.UTC(2026,10,14,21,0)};
async function vtCfg(env){const k=await kvGet(env,"ep_vote");return k&&k.id===VOTE_DEFAULT.id?{...VOTE_DEFAULT,...k}:VOTE_DEFAULT}
async function vtState(env,me){const C=await vtCfg(env),now=Date.now();if(now<C.start||now>=C.end)return null;const r=await env.DB.prepare("SELECT ch FROM ep_vote WHERE vid=? AND uid=?").bind(C.id,me.id).first();return {id:C.id,ep:C.ep,ch:r?r.ch:""}}
async function voteApi(env,me,a,p){const C=await vtCfg(env),now=Date.now();
  const pub=async()=>{const R=(await env.DB.prepare("SELECT ch,COUNT(*) AS n FROM ep_vote WHERE vid=? GROUP BY ch").bind(C.id).all()).results;const cnt={};R.forEach(r=>cnt[r.ch]=r.n);const tot=R.reduce((x,r)=>x+r.n,0);
    const my=await env.DB.prepare("SELECT ch FROM ep_vote WHERE vid=? AND uid=?").bind(C.id,me.id).first();
    const so=await env.DB.prepare("SELECT open_t,got_t FROM ep_vote_soc WHERE vid=? AND uid=?").bind(C.id,me.id).first();const adm=isAdmin(env,me.id);
    const admx=adm?{cnt,soc:((await env.DB.prepare("SELECT COUNT(*) AS n FROM ep_vote_soc WHERE vid=? AND got_t IS NOT NULL").bind(C.id).first())||{}).n||0,opened:((await env.DB.prepare("SELECT COUNT(*) AS n FROM ep_vote_soc WHERE vid=?").bind(C.id).first())||{}).n||0}:undefined;
    return {on:now>=C.start&&now<C.end?1:0,id:C.id,ep:C.ep,title:C.title,q:C.q,sp:C.sp,end:C.end,url:C.url||"",urlIg:C.urlIg||"",socSp:C.socSp,socWait:C.socWait,soc:{open:so&&so.open_t?so.open_t:0,got:so&&so.got_t?1:0,left:so&&so.open_t&&!so.got_t?Math.max(0,Math.ceil((so.open_t+C.socWait*1e3-now)/1e3)):null},adm:admx,my:my?my.ch:"",tot,opts:C.opts.map(o=>({...o,c:my||now>=C.end?(cnt[o.k]||0):undefined,pc:my||now>=C.end?(tot?Math.round((cnt[o.k]||0)*100/tot):0):undefined}))}};
  if(a==="vt_get")return pub();
  if(a==="vt_vote"){if(now<C.start)fail("Голосование ещё не началось");if(now>=C.end)fail("Голосование закончено — смотри следующую серию");const ch=String(p.ch||"");if(!C.opts.some(o=>o.k===ch))fail("Выбери вариант");
    const r=await env.DB.prepare("INSERT OR IGNORE INTO ep_vote(vid,uid,ch,t) VALUES(?,?,?,?)").bind(C.id,me.id,ch,now).run();if(!r.meta||r.meta.changes!==1)fail("Ты уже проголосовал");
    if(C.sp)await doAction(env,me,"tour_prize",{sp:C.sp,cash:0},{tour:1});const res=await pub();res.hit=1;return res}
  /* ссылка на видео: открыл → через socWait секунд можно забрать награду за лайк и комментарий (проверить лайки TikTok нельзя — честное слово + таймер) */
  if(a==="vt_open"){if(!C.url&&!C.urlIg)fail("Видео ещё не добавлено");if(now>=C.end)fail("Голосование закончено");await env.DB.prepare("INSERT OR IGNORE INTO ep_vote_soc(vid,uid,open_t) VALUES(?,?,?)").bind(C.id,me.id,now).run();return pub()}
  if(a==="vt_soc"){if(!C.url&&!C.urlIg)fail("Видео ещё не добавлено");if(now>=C.end)fail("Голосование закончено");const so=await env.DB.prepare("SELECT open_t,got_t FROM ep_vote_soc WHERE vid=? AND uid=?").bind(C.id,me.id).first();
    if(!so||!so.open_t)fail("Сначала открой видео по кнопке");if(so.got_t)fail("Награда за лайк уже у тебя");if(now-so.open_t<C.socWait*1e3)fail("Посмотри видео до конца и поставь лайк — кнопка откроется через "+Math.ceil((so.open_t+C.socWait*1e3-now)/1e3)+" сек");
    const u=await env.DB.prepare("UPDATE ep_vote_soc SET got_t=? WHERE vid=? AND uid=? AND got_t IS NULL").bind(now,C.id,me.id).run();if(!u.meta||u.meta.changes!==1)fail("Награда за лайк уже у тебя");
    if(C.socSp)await doAction(env,me,"tour_prize",{sp:C.socSp,cash:0},{tour:1});const res=await pub();res.hit=1;return res}
  if(!isAdmin(env,me.id))fail("Нет доступа");
  if(a==="vt_set"){const url=String(p.url||"").trim(),ig=String(p.urlIg||"").trim();for(const u of [url,ig])if(u&&!/^https:\/\/[^\s]{6,300}$/.test(u))fail("Ссылка должна начинаться с https://");let k=(await kvGet(env,"ep_vote"))||{id:C.id};if(k.id!==C.id)k={id:C.id};k.url=url;if(p.urlIg!=null)k.urlIg=ig;
    if(p.socSp!=null)k.socSp=Math.max(0,Math.min(20,p.socSp|0));await kvSet(env,"ep_vote",k);return voteApi(env,me,"vt_get",{})}
  fail("Неизвестное действие")}

/* ---------- 🏆 «Турнир Эпох»: видео-турнир 10 воинов, зрители угадывают победителя каждого боя ---------- */
const FT={id:"ft1",sp:2,hit:3,socSp:2,socWait:20,
  /* бои: числа — индекс героя, "W3" — победитель боя №3 (с нуля) */
  plan:[[20,11],[21,26],[19,"W0"],[22,28],[14,"W1"],[27,23],["W2","W3"],["W4","W5"],["W6","W7"]],
  stage:["Отбор","Отбор","Четвертьфинал","Четвертьфинал","Четвертьфинал","Четвертьфинал","Полуфинал","Полуфинал","ФИНАЛ"]};
const ftW=h=>[1,1.2,1.45,1.75,2.1][HEROES[h][2]]||1;
async function ftCfg(env){const k=await kvGet(env,"ft");return k&&k.id===FT.id?k:{id:FT.id,cur:-1,f:[],fin:0}}
function ftSide(K,x){return typeof x==="number"?x:(K.f[+x.slice(1)]||{}).wh??null}
function ftPair(K,i){return [ftSide(K,FT.plan[i][0]),ftSide(K,FT.plan[i][1])]}
async function ftState(env,me){const K=await ftCfg(env);if(K.cur<0||K.fin)return null;const F=K.f[K.cur];if(!F||F.done)return null;
  const r=await env.DB.prepare("SELECT ch FROM ft_vote WHERE tid=? AND fid=? AND uid=?").bind(K.id,K.cur,me.id).first();const [a,b]=ftPair(K,K.cur);return {n:K.cur+1,a,b,ch:r?r.ch:""}}
async function ftTop(env,K,lim){return (await env.DB.prepare("SELECT v.uid,SUM(v.hit) AS n,COUNT(*) AS c,MIN(v.t) AS t0,COALESCE(u.nick,u.name) AS name FROM ft_vote v JOIN users u ON u.id=v.uid WHERE v.tid=? GROUP BY v.uid HAVING n>0 ORDER BY n DESC,c DESC,t0 ASC LIMIT ?").bind(K.id,lim).all()).results}
async function ftApi(env,me,a,p){let K=await ftCfg(env);const now=Date.now(),adm=isAdmin(env,me.id);
  const pub=async()=>{K=await ftCfg(env);const out={id:K.id,cur:K.cur,fin:K.fin||0,sp:FT.sp,hit:FT.hit,socSp:FT.socSp,stage:FT.stage,fights:[]};
    const mine={};for(const r of (await env.DB.prepare("SELECT fid,ch,hit FROM ft_vote WHERE tid=? AND uid=?").bind(K.id,me.id).all()).results)mine[r.fid]=r;
    for(let i=0;i<FT.plan.length;i++){const [x,y]=ftPair(K,i),F=K.f[i]||{};const o={a:x,b:y,st:F.done?2:i===K.cur?1:0,my:mine[i]?mine[i].ch:""};
      if(F.done){o.w=F.w}
      if(F.done||(i===K.cur&&(o.my||adm))){const R=(await env.DB.prepare("SELECT ch,COUNT(*) AS n FROM ft_vote WHERE tid=? AND fid=? GROUP BY ch").bind(K.id,i).all()).results;const c={a:0,b:0};R.forEach(r=>c[r.ch]=r.n);const t=c.a+c.b;o.tot=t;o.pa=t?Math.round(c.a*100/t):0;o.pb=t?100-o.pa:0}
      out.fights.push(o)}
    const F=K.f[K.cur];if(F&&!F.done){out.url=F.url||"";out.urlIg=F.urlIg||"";const so=await env.DB.prepare("SELECT open_t,got_t FROM ft_soc WHERE tid=? AND fid=? AND uid=?").bind(K.id,K.cur,me.id).first();
      out.soc={open:so&&so.open_t?so.open_t:0,got:so&&so.got_t?1:0,left:so&&so.open_t&&!so.got_t?Math.max(0,Math.ceil((so.open_t+FT.socWait*1e3-now)/1e3)):null}}
    out.myHit=Object.values(mine).reduce((x,r)=>x+(r.hit||0),0);out.myDone=Object.keys(mine).filter(i=>K.f[i]&&K.f[i].done).length;
    out.top=(await ftTop(env,K,10)).map(r=>({uid:r.uid,name:r.name,n:r.n}));
    if(adm)out.adm={w:F&&!F.done?F.w:null,url:F?F.url||"":"",urlIg:F?F.urlIg||"":"",soc:F?((await env.DB.prepare("SELECT COUNT(*) AS n FROM ft_soc WHERE tid=? AND fid=? AND got_t IS NOT NULL").bind(K.id,K.cur).first())||{}).n||0:0,prz:K.prz||null};
    return out};
  const open=i=>{const [x,y]=ftPair(K,i);const pa=ftW(x)/(ftW(x)+ftW(y));K.f[i]={w:Math.random()<pa?"a":"b",start:now};K.cur=i};
  if(a==="ft_get")return pub();
  const cur=()=>{const F=K.f[K.cur];if(K.cur<0||!F||F.done||K.fin)fail("Сейчас голосования нет — жди новую серию");return F};
  if(a==="ft_vote"){cur();const ch=p.ch==="a"||p.ch==="b"?p.ch:fail("Выбери воина");
    const r=await env.DB.prepare("INSERT OR IGNORE INTO ft_vote(tid,fid,uid,ch,t) VALUES(?,?,?,?,?)").bind(K.id,K.cur,me.id,ch,now).run();if(!r.meta||r.meta.changes!==1)fail("Ты уже голосовал в этом бою");
    if(FT.sp)await doAction(env,me,"tour_prize",{sp:FT.sp,cash:0},{tour:1});const res=await pub();res.hit=1;return res}
  if(a==="ft_open"){const F=cur();if(!F.url&&!F.urlIg)fail("Видео ещё не добавлено");await env.DB.prepare("INSERT OR IGNORE INTO ft_soc(tid,fid,uid,open_t) VALUES(?,?,?,?)").bind(K.id,K.cur,me.id,now).run();return pub()}
  if(a==="ft_soc"){const F=cur();if(!F.url&&!F.urlIg)fail("Видео ещё не добавлено");const so=await env.DB.prepare("SELECT open_t,got_t FROM ft_soc WHERE tid=? AND fid=? AND uid=?").bind(K.id,K.cur,me.id).first();
    if(!so||!so.open_t)fail("Сначала открой видео по кнопке");if(so.got_t)fail("Награда за лайк уже у тебя");if(now-so.open_t<FT.socWait*1e3)fail("Посмотри видео и поставь лайк — кнопка откроется через "+Math.ceil((so.open_t+FT.socWait*1e3-now)/1e3)+" сек");
    const u=await env.DB.prepare("UPDATE ft_soc SET got_t=? WHERE tid=? AND fid=? AND uid=? AND got_t IS NULL").bind(now,K.id,K.cur,me.id).run();if(!u.meta||u.meta.changes!==1)fail("Награда за лайк уже у тебя");
    if(FT.socSp)await doAction(env,me,"tour_prize",{sp:FT.socSp,cash:0},{tour:1});const res=await pub();res.hit=1;return res}
  if(!adm)fail("Нет доступа");
  if(a==="ft_start"){if(K.cur>=0)fail("Турнир уже идёт");open(0);await kvSet(env,"ft",K);return pub()}
  if(a==="ft_set"){const F=cur();for(const u of [p.url,p.urlIg])if(u&&!/^https:\/\/[^\s]{6,300}$/.test(String(u).trim()))fail("Ссылка должна начинаться с https://");F.url=String(p.url||"").trim();F.urlIg=String(p.urlIg||"").trim();await kvSet(env,"ft",K);return pub()}
  /* итог текущего боя (угадавшим +hit прокруток) и сразу открыть следующий */
  if(a==="ft_next"){const F=cur(),i=K.cur;const [x,y]=ftPair(K,i);F.done=1;F.end=now;F.wh=F.w==="a"?x:y;
    await env.DB.prepare("UPDATE ft_vote SET hit=CASE WHEN ch=? THEN 1 ELSE 0 END WHERE tid=? AND fid=?").bind(F.w,K.id,i).run();
    if(FT.hit)await env.DB.prepare("UPDATE users SET gift_spins=gift_spins+? WHERE id IN (SELECT uid FROM ft_vote WHERE tid=? AND fid=? AND ch=?)").bind(FT.hit,K.id,i,F.w).run();
    if(i+1<FT.plan.length)open(i+1);await kvSet(env,"ft",K);
    try{await hypeAdd(env,0,"🏆 Турнир Эпох: "+HEROES[F.wh][0]+" побеждает в бою №"+(i+1)+"!",1)}catch(e){}return pub()}
  /* награды за весь турнир: 1 место — VIP (+NFT-подарок Telegram вручную), 2–3 — звёзды на игровой баланс */
  if(a==="ft_fin"){if(K.fin)fail("Награды уже выданы");if(!K.f[FT.plan.length-1]||!K.f[FT.plan.length-1].done)fail("Сначала подведи итог финала");
    const T=await ftTop(env,K,3);const vd=Math.max(1,Math.min(90,p.vd|0||30)),vt=Math.max(1,Math.min(3,p.vt|0||3)),s2=Math.max(0,Math.min(5000,p.s2|0)),s3=Math.max(0,Math.min(5000,p.s3|0));
    const prz=[];for(let k=0;k<T.length;k++){const r=T[k];
      if(k===0){const u=await env.DB.prepare("SELECT vip_until,vip_t FROM users WHERE id=?").bind(r.uid).first()||{};await env.DB.prepare("UPDATE users SET vip_until=?,vip_t=? WHERE id=?").bind(Math.max(now,u.vip_until||0)+vd*864e5,Math.max(u.vip_t||0,vt),r.uid).run();
        await notify(env,r.uid,"🥇 Ты лучший предсказатель Турнира Эпох — угадал "+r.n+" боёв! VIP уже твой, а NFT-подарок в Telegram пришлём лично 🎁","🏆 Открыть игру")}
      else{const s=k===1?s2:s3;if(s)await env.DB.prepare("UPDATE users SET star_bal=star_bal+? WHERE id=?").bind(s,r.uid).run();await notify(env,r.uid,(k===1?"🥈":"🥉")+" "+(k+1)+" место в Турнире Эпох — угадано "+r.n+" боёв! +"+s+" ⭐ на игровой баланс","🏆 Открыть игру")}
      prz.push({uid:r.uid,name:r.name,n:r.n})}
    K.fin=1;K.prz=prz;await kvSet(env,"ft",K);return pub()}
  fail("Неизвестное действие")}
/* ---------- 🧩 «Загадка серии»: мультики «Хроники Эпох» заканчиваются вопросом, ответ ищут в игре ----------
   Подсказка 1 видна сразу, подсказка 2 — после 3 неверных попыток. Всего 10 попыток. За верный ответ — прокрутки, первые 10 попадают в следующую серию. */
const RIDDLE_DEFAULT={id:"ep1",ep:1,title:"«Триста»",q:"Персидский царь Ксеркс потребовал: «Сложите оружие!» Что ответил ему царь Спарты Леонид?",
  hints:["Ответ — 3 слова. Это и приглашение, и вызов одновременно","П _ _ _ _   И   В _ _ _ _ И"],ans:["Приди и возьми","приходи и возьми","придите и возьмите","приди возьми","приходите и возьмите","молон лабе","molon labe"],
  sp:5,top:10,max:10,start:Date.UTC(2026,10,5,21,0),end:Date.UTC(2026,10,6,3,0)};   // загадку убрали из игры 06.11 — осталось только голосование
const rdNorm=x=>String(x||"").toLowerCase().replace(/ё/g,"е").replace(/[^a-zа-я0-9 ]+/g," ").replace(/\s+/g," ").trim();
async function rdCfg(env){const k=await kvGet(env,"riddle");return k&&k.id?k:RIDDLE_DEFAULT}
async function rdTop(env,C,n){return (await env.DB.prepare("SELECT r.uid,COALESCE(u.nick,r.name) AS name,r.ok_t FROM riddle_ans r LEFT JOIN users u ON u.id=r.uid WHERE r.rid=? AND r.ok_t IS NOT NULL ORDER BY r.ok_t LIMIT ?").bind(C.id,n).all()).results}
async function rdState(env,me){const C=await rdCfg(env),now=Date.now();if(now<C.start||now>=C.end)return null;const r=await env.DB.prepare("SELECT ok_t FROM riddle_ans WHERE rid=? AND uid=?").bind(C.id,me.id).first();return {id:C.id,ep:C.ep,ok:r&&r.ok_t?1:0}}
async function riddleApi(env,me,a,p){const C=await rdCfg(env),now=Date.now();
  const pub=async()=>{const r=await env.DB.prepare("SELECT * FROM riddle_ans WHERE rid=? AND uid=?").bind(C.id,me.id).first()||{tries:0};const wrong=r.ok_t?0:r.tries;
    const place=r.ok_t?(((await env.DB.prepare("SELECT COUNT(*) AS n FROM riddle_ans WHERE rid=? AND ok_t IS NOT NULL AND ok_t<=?").bind(C.id,r.ok_t).first())||{}).n||1):0;
    const n=((await env.DB.prepare("SELECT COUNT(*) AS n FROM riddle_ans WHERE rid=? AND ok_t IS NOT NULL").bind(C.id).first())||{}).n||0;
    return {on:now>=C.start&&now<C.end?1:0,id:C.id,ep:C.ep,title:C.title,q:C.q,hints:C.hints.slice(0,r.ok_t||wrong>=3?2:1),next:r.ok_t||wrong>=3?0:3-wrong,tries:r.tries||0,max:C.max,left:r.ok_t?0:Math.max(0,C.max-(r.tries||0)),
      ok:r.ok_t?1:0,place,sp:C.sp,topN:C.top,n,end:C.end,ans:r.ok_t||(r.tries||0)>=C.max?C.ans[0]:undefined,last:r.ok_t?undefined:r.last,top:(await rdTop(env,C,C.top)).map(x=>x.name||"Воин")}};
  if(a==="rd_get")return pub();
  if(a==="rd_try"){if(now<C.start)fail("Загадка ещё не открылась");if(now>=C.end)fail("Эта загадка закрыта — жди следующую серию");const g=rdNorm(p.a);if(g.length<2)fail("Напиши ответ");if(g.length>60)fail("Слишком длинный ответ");
    await env.DB.prepare("INSERT OR IGNORE INTO riddle_ans(rid,uid,name,tries) VALUES(?,?,?,0)").bind(C.id,me.id,me.name||"").run();
    const r=await env.DB.prepare("SELECT * FROM riddle_ans WHERE rid=? AND uid=?").bind(C.id,me.id).first();if(r.ok_t)fail("Ты уже разгадал 🎉");if(r.tries>=C.max)fail("Попытки закончились — жди следующую серию");
    const ok=C.ans.map(rdNorm).includes(g);
    const u=await env.DB.prepare("UPDATE riddle_ans SET tries=tries+1,last=?,ok_t=? WHERE rid=? AND uid=? AND ok_t IS NULL AND tries<?").bind(g,ok?now:null,C.id,me.id,C.max).run();if(!u.meta||u.meta.changes!==1)fail("Попробуй ещё раз");
    if(ok&&C.sp)await doAction(env,me,"tour_prize",{sp:C.sp,cash:0},{tour:1});
    const res=await pub();res.hit=ok?1:0;return res}
  if(!isAdmin(env,me.id))fail("Нет доступа");
  if(a==="rd_list"){const L=(await env.DB.prepare("SELECT r.uid,COALESCE(u.nick,r.name) AS name,r.tries,r.ok_t FROM riddle_ans r LEFT JOIN users u ON u.id=r.uid WHERE r.rid=? ORDER BY r.ok_t IS NULL,r.ok_t LIMIT 300").bind(C.id).all()).results;
    return {id:C.id,title:C.title,ok:L.filter(x=>x.ok_t).length,all:L.length,list:L.filter(x=>x.ok_t).slice(0,100)}}
  fail("Неизвестное действие")}
async function promoApi(env,me,a,p){const now=Date.now();
  if(a==="promo_use"&&/^\d{6}$/.test(promoKey(p.code))){const L=await liveClaim(env,me,promoKey(p.code));if(L)return L}
  if(a==="promo_use"){const code=promoKey(p.code);if(!code)fail("Введи промокод");const P=await env.DB.prepare("SELECT * FROM promo WHERE code=?").bind(code).first();
    if(!P||P.off)fail("Такого промокода нет. Проверь, как он написан");if(P.until&&now>P.until)fail("Срок промокода закончился");
    if(P.mx){const n=((await env.DB.prepare("SELECT COUNT(*) AS n FROM promo_uses WHERE code=?").bind(code).first())||{}).n||0;if(n>=P.mx)fail("Промокод уже активировали максимальное число раз")}
    const r=await env.DB.prepare("INSERT OR IGNORE INTO promo_uses(code,uid,t) VALUES(?,?,?)").bind(code,me.id,now).run();if(!r.meta||r.meta.changes!==1)fail("Ты уже активировал этот промокод");
    if(P.x2)await env.DB.prepare("UPDATE promo_uses SET x2=? WHERE code=? AND uid=?").bind(P.x2,code,me.id).run();
    if(P.bon)await env.DB.prepare("UPDATE promo_uses SET bon=?,bon_until=?,bmin=? WHERE code=? AND uid=?").bind(P.bon,P.until||9e15,P.bmin||0,code,me.id).run();
    if(P.sp||P.cash)await doAction(env,me,"tour_prize",{sp:P.sp,cash:P.cash},{tour:1});return {code,sp:P.sp,cash:P.cash,x2:P.x2||0,bon:P.bon||0,bmin:P.bmin||0,until:P.until||0}}
  if(a==="promo_x2"){const L=await bonList(env,me.id);return {x2:await x2Left(env,me.id),bon:L.length?L[0].bon:0,bons:L}}
  if(!isAdmin(env,me.id))fail("Нет доступа");
  if(a==="pcode_set"){const code=promoKey(p.code);if(code.length<2)fail("Код — от 2 символов: буквы, цифры, _ и -");const sp=Math.max(0,Math.min(100,p.sp|0)),cash=Math.max(0,Math.min(1e6,p.cash|0)),x2=Math.max(0,Math.min(5000,p.x2|0)),bon=Math.max(0,Math.min(5000,p.bon|0)),bmin=bon?Math.max(0,Math.min(2500,p.bmin|0)):0;if(!sp&&!cash&&!x2&&!bon)fail("Укажи награду");
    const mx=Math.max(0,p.mx|0),until=(+p.days||0)>0?now+(+p.days)*864e5:0;
    await env.DB.prepare("INSERT INTO promo(code,sp,cash,mx,until,created,off,x2,bon,bmin) VALUES(?,?,?,?,?,?,0,?,?,?) ON CONFLICT(code) DO UPDATE SET sp=excluded.sp,cash=excluded.cash,mx=excluded.mx,until=excluded.until,off=0,x2=excluded.x2,bon=excluded.bon,bmin=excluded.bmin").bind(code,sp,cash,mx,until,now,x2,bon,bmin).run();return {code}}
  if(a==="pcode_off"){await env.DB.prepare("UPDATE promo SET off=1-off WHERE code=?").bind(promoKey(p.code)).run();return {}}
  if(a==="pcode_list"){const L=(await env.DB.prepare("SELECT * FROM promo ORDER BY created DESC LIMIT 100").all()).results;
    const S=(await env.DB.prepare("SELECT u.code,COUNT(*) AS n,SUM(CASE WHEN us.created>=u.t-864e5 THEN 1 ELSE 0 END) AS nw,SUM(CASE WHEN COALESCE(json_extract(us.state,'$.nOp'),0)>=3 THEN 1 ELSE 0 END) AS a3,SUM(CASE WHEN EXISTS(SELECT 1 FROM user_days d WHERE d.uid=u.uid AND d.d>CAST((u.t+10800000)/86400000 AS INTEGER)) THEN 1 ELSE 0 END) AS back,MAX(u.t) AS last FROM promo_uses u JOIN users us ON us.id=u.uid GROUP BY u.code").all()).results;
    const m=new Map(S.map(r=>[r.code,r]));return {list:L.map(P=>({...P,...(m.get(P.code)||{n:0,nw:0,a3:0,back:0})}))}}
  fail("Неизвестное действие")}
/* ---------- подписка на канал (бот должен быть администратором канала) ---------- */
const CHANNEL="@voinyepoh";
async function subCheck(env,me){
  if(me.dev)return doAction(env,me,"sub_reward",{},{subOk:true});   // тестовый вход без Telegram
  const r=await fetch("https://api.telegram.org/bot"+env.BOT_TOKEN+"/getChatMember?chat_id="+encodeURIComponent(env.CHANNEL||CHANNEL)+"&user_id="+me.id);
  const j=await r.json().catch(()=>({}));
  if(!j.ok){console.error("getChatMember",j);fail("Не получилось проверить подписку. Попробуй через минуту")}
  const R=j.result||{};if(!(["member","administrator","creator"].includes(R.status)||R.status==="restricted"&&R.is_member))fail("Подписки пока не видно. Подпишись на канал и нажми «Проверить» ещё раз");
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
    if(await notify(env,u.id,"⚡ Твои бесплатные прокрутки готовы! Вдруг сейчас выпадет легенда?","🎴 Крутить"))sent++}
  try{const cd=(await env.DB.prepare("SELECT id,camp_at FROM users WHERE pm=1 AND camp_at>0 AND camp_at<=? AND camp_note<camp_at LIMIT 60").bind(now).all()).results;
    for(const u of cd){await env.DB.prepare("UPDATE users SET camp_note=? WHERE id=?").bind(u.camp_at,u.id).run();
      if(await notify(env,u.id,"🎯 Энергия в лагере снова полная! Манекен ждёт — каждый удар приносит руны 💠","🎯 Тренироваться",PAGE+"?camp=1"))sent++}}catch(e){console.error("camp",e)}
  try{const ex=(await env.DB.prepare("SELECT id,dg_exp,json_extract(state,'$.dg.name') AS dn,json_extract(state,'$.dg.exp.k') AS k FROM users WHERE pm=1 AND dg_exp>0 AND dg_exp<=? AND dg_exp_note<dg_exp LIMIT 60").bind(now).all()).results;
    for(const u of ex){await env.DB.prepare("UPDATE users SET dg_exp_note=? WHERE id=?").bind(u.dg_exp,u.id).run();const E=DG_EXP.find(x=>x.k===u.k)||DG_EXP[0];
      if(await notify(env,u.id,"🐉 "+(u.dn||"Твой дракон")+" вернулся из похода «"+E.n+"» "+E.ic+" с добычей!\n\nЧешуя, опыт, а может и гем 💎 — заходи забрать, пока он не уснул от усталости.","🎒 Забрать добычу",PAGE+"?dragon=1"))sent++}}catch(e){console.error("dgexp",e)}
  try{const hf=(await env.DB.prepare("SELECT id,json_extract(state,'$.hofAt') AS at FROM users WHERE pm=1 AND json_array_length(json_extract(state,'$.hof'))>0 AND json_extract(state,'$.hofAt')<=? AND hof_note<json_extract(state,'$.hofAt') LIMIT 60").bind(now-HOF.cap).all()).results;
    for(const u of hf){await env.DB.prepare("UPDATE users SET hof_note=? WHERE id=?").bind(u.at,u.id).run();if(await notify(env,u.id,"🏛 Зал славы полон монет! Твои карты 12 часов работали на тебя — забери доход, пока копилка не простаивает 💰","🏛 Забрать",PAGE+"?hof=1"))sent++}}catch(e){console.error("hof",e)}
  try{sent+=await hhPush(env,now)}catch(e){console.error("hh",e)}
  try{if(h>=12&&h<21)sent+=await donBlast(env)}catch(e){console.error("donb",e)}
  try{sent+=await winBack(env,now,h)}catch(e){console.error("winback",e)}
  return {sent,due:due.length}}
/* 🍀 счастливый час: пуш один раз за событие и не больше одного в день — только тем, кто играл последние 3 дня и сейчас не в игре */
async function hhPush(env,now){const e=hhNow(now);if(!e||now>e.end-10*60e3)return 0;const T=HH_T[e.k],D=864e5,day0=Math.floor((now+TZ)/D)*D-TZ;
  const L=(await env.DB.prepare("SELECT id FROM users WHERE pm=1 AND seen>? AND seen<? AND hh_note<? LIMIT 150").bind(now-3*D,now-5*60e3,day0).all()).results;let sent=0;
  const left=Math.max(1,Math.round((e.end-now)/60e3));
  for(const u of L){await env.DB.prepare("UPDATE users SET hh_note=? WHERE id=?").bind(e.at,u.id).run();
    if(await notify(env,u.id,"🍀 Счастливый час! "+T.ic+" "+T.n+": "+T.d+".\n\nДействует ещё "+left+" мин — потом обычные правила.","🍀 Успеть"))sent++}
  return sent}
/* разовые выдачи карточек (компенсации за баги): выполняются один раз, игрок получает сообщение */
const ADM_GRANTS=[{id:"g1-vanya",uid:1025352541,h:15,f:4,sn:"200000",stats:[213,242,184,238,222],v:57529,why:"Карточка, которую ты выбил, пропала из-за сбоя с VPN — мы её вернули 🙏"},
  {id:"g2-vanya",uid:1025352541,rare:1,f:4,sn:"200000",v:57529,why:"Карточка, которую ты выбил, пропала из-за сбоя с VPN. Того же Гоплита вернуть нельзя — «ошибка печати» у него уже есть у другого игрока, поэтому дарим тебе другую редкую «ошибку печати» такой же цены 🙏"}];   // приз за 10 друзей (№ 000010) уже выдан вручную — авто-выдачу убрали
async function admGrants(env){for(const G of ADM_GRANTS){const k="grant:"+G.id;if(await kvGet(env,k))continue;
  if(!G.uid&&G.nick){const r=await env.DB.prepare("SELECT id FROM users WHERE lower(nick)=lower(?)").bind(G.nick).first();if(!r)continue;G.uid=r.id}   // выдача по нику; пока игрока с таким ником нет, ждём
  const u=await env.DB.prepare("SELECT name FROM users WHERE id=?").bind(G.uid).first();if(!u)continue;await kvSet(env,k,{t:Date.now()});
  try{let r=null,err=null;const hs=G.rare?HEROES.map((H,i)=>i).filter(i=>isBase(i)&&HEROES[i][2]===G.rare).sort(()=>Math.random()-.5):[G.h];
    for(const h of hs){try{r=(await doAction(env,{id:G.uid,name:u.name||"Игрок"},"adm_card",Object.assign({},G,{h}),{grant:true})).res;G.h=h;break}catch(e){err=e;if(!/Тираж/.test(e.message||""))break}}
    if(!r&&G.sn&&err&&/Номер/.test(err.message||""))for(const h of hs){try{r=(await doAction(env,{id:G.uid,name:u.name||"Игрок"},"adm_card",Object.assign({},G,{h,sn:null}),{grant:true})).res;G.h=h;break}catch(e){err=e}}
    if(!r)throw err||new Error("нет свободных карточек");
    await notify(env,G.uid,"🎁 "+G.why+"\n\n"+HEROES[G.h][0]+" · «"+FIN[G.f].k+"» № "+fmtSn(r.card.sn)+" уже в твоей коллекции!","🎴 Открыть игру");
    for(const a of ADMINS)await notify(env,a,"✅ Выдача "+G.id+": "+HEROES[G.h][0]+" ("+FIN[G.f].k+") выдана игроку "+G.uid,"⚔️ Открыть")}
  catch(e){console.error("grant",G.id,e&&e.message);for(const a of ADMINS)await notify(env,a,"⚠️ Выдача "+G.id+" не удалась: "+(e.message||e),"⚔️ Открыть")}}}
/* ===================== 🗺 карта мира ===================== */
async function mapSeason(env,now){const m=mapMon(now),k=await cached("mapseason",60e3,()=>kvGet(env,"map_season"));if(k&&k.m===m)return;
  if(k&&k.m!==m){await env.DB.prepare("UPDATE cards SET away=0,dest=NULL WHERE dest LIKE 'map:%'").run();await env.DB.prepare("DELETE FROM map_reg").run()}
  await kvSet(env,"map_season",{m});delete topCache.mapseason}
async function mapRegions(env){return (await env.DB.prepare("SELECT r.*,COALESCE(u.nick,u.name) AS oname,json_extract(u.state,'$.mflagOn') AS flag,(SELECT st FROM map_photo p WHERE p.uid=r.owner) AS ph,CASE WHEN (r.id BETWEEN 50 AND 59 OR r.id BETWEEN 88 AND 96) THEN json_extract(u.state,'$.dg') END AS dgj,COALESCE(u2.nick,u2.name) AS oname2 FROM map_reg r LEFT JOIN users u ON u.id=r.owner LEFT JOIN users u2 ON u2.id=r.owner2").all()).results}
/* ---------- 👑 Король мира: кандидаты недели (топ-5 завоевателей) → голосование в воскресенье → корона на неделю ---------- */
const KING={cand:5,minSpins:20,cut:.05,cutThrone:.10,throne:0,pts:{occ:3,cap:5,def:2,hold:3}};
const mskDow=now=>(new Date(now+3*3600e3).getUTCDay()+6)%7;   // 0 — понедельник, 6 — воскресенье
const weekStart=wk=>Date.parse(wk+"T00:00:00Z")-3*3600e3;
async function kingCur(env){return cached("king",env.TEST==="1"?0:5e3,async()=>{const r=await env.DB.prepare("SELECT * FROM king WHERE wk=?").bind(mskWeek(Date.now())).first();return r&&r.uid?r:null})}
async function kingDec(env){return cached("kdec",env.TEST==="1"?0:5e3,async()=>{const d=await kvGet(env,"king:dec");return d&&d.end>Date.now()?d:null})}
async function kingRace(env,wk,upto){const t0=weekStart(wk),sc={};const add=(u,v)=>{if(u>0)sc[u]=(sc[u]||0)+v};
  for(const r of (await env.DB.prepare("SELECT att,def,win FROM map_log WHERE t>=? AND t<=?").bind(t0,upto).all()).results){if(r.win===2)add(r.att,KING.pts.occ);else if(r.win===1)add(r.att,KING.pts.cap);else add(r.def,KING.pts.def)}
  for(const r of (await env.DB.prepare("SELECT owner,COUNT(*) AS n FROM map_reg WHERE owner>0 GROUP BY owner").all()).results)add(r.owner,KING.pts.hold*r.n);
  const top=Object.entries(sc).map(([u,v])=>({uid:+u,score:v})).sort((a,b)=>b.score-a.score).slice(0,KING.cand);
  for(const c of top)c.name=(await nameOf(env,c.uid))||"Игрок";return top}
async function kingTick(env){const now=Date.now(),wk=mskWeek(now),dow=mskDow(now);
  if(dow===6){const k="king:cand:"+wk;if(!(await kvGet(env,k))){const list=await kingRace(env,wk,now);await kvSet(env,k,{list,t:now});delete topCache["kc"+wk];
    for(const c of list)try{await notify(env,c.uid,"👑 Ты в пятёрке кандидатов в Короли мира!\n\nСегодня весь день идёт голосование. Позови друзей проголосовать за тебя — у Короля корона, казна с доходов всей карты и королевские указы.","👑 К выборам",PAGE+"?map=1")}catch(e){}}}
  if(!(await env.DB.prepare("SELECT 1 FROM king WHERE wk=?").bind(wk).first())){const pw=mskWeek(now-7*864e5),C=(await kvGet(env,"king:cand:"+pw))||{list:[]};
    const votes={};for(const r of (await env.DB.prepare("SELECT cand,COUNT(*) AS n FROM king_vote WHERE wk=? GROUP BY cand").bind(pw).all()).results)votes[r.cand]=r.n;
    const w=C.list.slice().sort((a,b)=>(votes[b.uid]||0)-(votes[a.uid]||0)||b.score-a.score)[0];
    const ins=await env.DB.prepare("INSERT OR IGNORE INTO king(wk,uid,name,votes,tre,got,since) VALUES(?,?,?,?,0,0,?)").bind(wk,w?w.uid:0,w?w.name:"",w?votes[w.uid]||0:0,now).run();delete topCache.king;
    if(ins.meta.changes===1&&w){try{await notify(env,w.uid,"👑 ТЫ — КОРОЛЬ МИРА на эту неделю! Голосов: "+(votes[w.uid]||0)+"\n\n• корона у ника\n• "+Math.round(KING.cut*100)+"% с дохода всех земель капает в твою казну ("+Math.round(KING.cutThrone*100)+"%, если держишь Тронный зал — Рим)\n• раз в день — королевский указ: выбери счастливый час для всех\n\nНо берегись: кто отобьёт у тебя Рим — заберёт корону 🔥","👑 На трон",PAGE+"?map=1")}catch(e){}
      for(const c of C.list)if(c.uid!==w.uid)try{await notify(env,c.uid,"👑 Выборы окончены: Королём мира стал "+w.name+". Отбей у него Тронный зал (Рим) — и корона твоя!","🗺 На карту",PAGE+"?map=1")}catch(e){}}}}
async function kingCut(env,cash){const K=await kingCur(env);if(!K||cash<=0)return;const th=await env.DB.prepare("SELECT 1 FROM map_reg WHERE id=? AND owner=?").bind(KING.throne,K.uid).first();
  const c=Math.floor(cash*(th?KING.cutThrone:KING.cut));if(c>0)await env.DB.prepare("UPDATE king SET tre=tre+? WHERE wk=?").bind(c,K.wk).run()}
async function kingPay(env,K){const left=(K.tre||0)-(K.got||0);if(left<=0)return 0;const u=await env.DB.prepare("UPDATE king SET got=? WHERE wk=? AND got=?").bind(K.tre,K.wk,K.got||0).run();if(u.meta.changes!==1)return 0;
  await doAction(env,{id:K.uid,name:K.name},"map_grant",{cash:left},{grant:true});return left}
async function kingThrone(env,me,rid,oldOwner){if(rid!==KING.throne)return;try{await hypeAdd(env,me.id,"👑 захватил ТРОН МИРА — новый Король!",1)}catch(e){}const K=await kingCur(env);if(!K||K.uid!==oldOwner||K.uid===me.id)return;
  try{await kingPay(env,K)}catch(e){}const nm=me.nick||me.name||"Игрок",u=await env.DB.prepare("UPDATE king SET uid=?,name=?,since=?,tre=0,got=0 WHERE wk=? AND uid=?").bind(me.id,nm,Date.now(),K.wk,K.uid).run();delete topCache.king;
  if(u.meta.changes===1){try{await notify(env,K.uid,"💔 "+nm+" отбил Тронный зал и забрал твою корону! Казна уже выплачена тебе. Верни трон — захвати Рим обратно!","🗺 На карту",PAGE+"?map=1")}catch(e){}return true}}
async function kingApi(env,me,a,p){const now=Date.now(),wk=mskWeek(now),dow=env.TEST==="1"&&p.dow!=null?+p.dow:mskDow(now);
  if(a==="king_get"){const K=await kingCur(env),dec=await kingDec(env),vote=dow===6;let list,my=null;
    if(vote){const C=(await kvGet(env,"king:cand:"+wk))||{list:[]},votes={};for(const r of (await env.DB.prepare("SELECT cand,COUNT(*) AS n FROM king_vote WHERE wk=? GROUP BY cand").bind(wk).all()).results)votes[r.cand]=r.n;
      list=C.list.map(c=>Object.assign({},c,{votes:votes[c.uid]||0}));const v=await env.DB.prepare("SELECT cand FROM king_vote WHERE wk=? AND uid=?").bind(wk,me.id).first();my=v?v.cand:null}
    else list=await cached("kc"+wk,env.TEST==="1"?0:60e3,()=>kingRace(env,wk,now));
    const throne=await env.DB.prepare("SELECT owner FROM map_reg WHERE id=?").bind(KING.throne).first();
    const st=JSON.parse(((await env.DB.prepare("SELECT state FROM users WHERE id=?").bind(me.id).first())||{}).state||"{}");
    return {now,phase:vote?"vote":"race",ends:weekStart(wk)+(vote?7:6)*864e5,list,my,canVote:(st.nOp||0)>=KING.minSpins,
      king:K?{uid:K.uid,name:K.name,votes:K.votes,since:K.since,throne:!!(throne&&throne.owner===K.uid),tre:K.uid===me.id?(K.tre||0)-(K.got||0):undefined,decDone:K.dec_day===mskDay(now)}:null,dec}}
  if(a==="king_vote"){if(dow!==6)fail("Голосование идёт по воскресеньям");const C=(await kvGet(env,"king:cand:"+wk))||{list:[]},c=+p.uid;if(!C.list.some(x=>x.uid===c))fail("Такого кандидата нет");
    const st=JSON.parse(((await env.DB.prepare("SELECT state FROM users WHERE id=?").bind(me.id).first())||{}).state||"{}");if((st.nOp||0)<KING.minSpins)fail("Голосовать можно после "+KING.minSpins+" прокруток");
    const r=await env.DB.prepare("INSERT OR IGNORE INTO king_vote(wk,uid,cand,t) VALUES(?,?,?,?)").bind(wk,me.id,c,now).run();if(r.meta.changes!==1)fail("Ты уже проголосовал на этой неделе");return {cand:c}}
  const K=await kingCur(env);if(!K||K.uid!==me.id)fail("Это может только Король");
  if(a==="king_claim"){const got=await kingPay(env,K);delete topCache.king;if(!got)fail("Казна пока пуста");return {cash:got}}
  if(a==="king_decree"){const k=String(p.k||"");if(!HH_T[k])fail("Нет такого указа");const day=mskDay(now);if(K.dec_day===day)fail("Указ сегодня уже был — новый завтра");
    if(await kingDec(env))fail("Сейчас уже идёт счастливый час по указу");const u=await env.DB.prepare("UPDATE king SET dec_day=? WHERE wk=? AND uid=? AND (dec_day IS NULL OR dec_day<>?)").bind(day,K.wk,me.id,day).run();if(u.meta.changes!==1)fail("Указ сегодня уже был");
    const d={k,at:now,end:now+HH_LEN,king:1,by:K.name};await kvSet(env,"king:dec",d);delete topCache.kdec;delete topCache.king;
    try{const T=HH_T[k];await env.DB.prepare("INSERT INTO chat(uid,name,text,t) VALUES(?,?,?,?)").bind(0,"📜 Указ","👑 Король "+K.name+" объявил: "+T.ic+" "+T.n+" на 30 минут! "+T.d,now).run()}catch(e){}
    return d}
  fail("Неизвестное действие")}
/* 🐉 Земля драконов: в логове стоит не карточка, а дракон хозяина (его текущая сила). Бой — как на арене: мощь, стихия, тактика */
const mapDgPow=D=>Math.round(dgPower(D)*(1+dgGemB(D,"ameth")));
function mapDgLook(j){let D=null;try{D=j?JSON.parse(j):null}catch(e){}if(!D)return null;return {b:D.b|0,lv:D.lv|0,skin:D.skin||null,evo:D.evo||null,dn:D.name||"",pow:mapDgPow(D),el:dgEl(D)}}
async function mapDgAttack(env,me,rid,st,p,now){const myD=st.dg;if(!myD||!(dgPower(myD)>0))fail("В Землю драконов пускают только с драконом — сначала выведи своего 🐉");
  const R=await env.DB.prepare("SELECT * FROM map_reg WHERE id=?").bind(rid).first();if(R&&R.owner===me.id)fail("Это уже твоё логово");
  const myN=((await env.DB.prepare("SELECT COUNT(*) AS n FROM map_reg WHERE owner=? AND (id BETWEEN 50 AND 59 OR id BETWEEN 88 AND 96)").bind(me.id).first())||{}).n||0;if(myN>=MAP.dmax)fail("Твой дракон уже охраняет логово — один дракон держит одно логово. Покинь его, чтобы занять новое");
  if(R&&R.owner&&R.shield>now)fail("Логово под щитом ещё "+Math.ceil((R.shield-now)/60e3)+" мин");
  const tac=String(p.tac||""),mp=mapDgPow(myD),look=D=>({b:D.b|0,lv:D.lv|0,skin:D.skin||null,evo:D.evo||null,dn:D.name||""});
  const occupy=async old=>{const q=old?env.DB.prepare("UPDATE map_reg SET owner=?,card=NULL,since=?,claim_at=?,shield=?,def_n=0,statue=0 WHERE id=? AND owner=?").bind(me.id,now,now,now+MAP.dshield,rid,old)
      :env.DB.prepare("INSERT INTO map_reg(id,owner,card,since,claim_at,shield,def_n,statue) VALUES(?,?,NULL,?,?,?,0,0) ON CONFLICT(id) DO UPDATE SET owner=excluded.owner,card=NULL,since=excluded.since,claim_at=excluded.claim_at,shield=excluded.shield,def_n=0,statue=0 WHERE map_reg.owner IS NULL").bind(rid,me.id,now,now,now+MAP.dshield);
    const u=await q.run();if(u.meta.changes!==1)fail("Логово только что заняли — обнови карту")};
  if(!R||!R.owner){/* свободное логово сторожит дикий дракон — бой не тратит атаку */
    const W=dgaWild((rid*7919+Math.floor(now/36e5))%100000+1,mp,myD.lv),oD=Object.assign({},W.D,{__pow:Math.max(40,Math.round(mp*(.72+Math.random()*.3)))});
    const F=dgaSim(myD,oD,tac);if(F.win){await occupy(0);await env.DB.prepare("INSERT INTO map_log(rid,att,def,win,t) VALUES(?,?,0,2,?)").bind(rid,me.id,now).run();await doAction(env,me,"map_grant",{pts:MPASS.pts.cap},{grant:true})}
    return {dragon:1,wild:1,won:F.win,rid,rounds:F.rounds,ta:F.ta,tb:F.tb,tw:F.tw,ela:F.ela,elb:F.elb,pa:mp,pb:oD.__pow,opp:{name:W.name,b:W.b,lv:W.lv,evo:W.evo,skin:null,dn:""}}}
  await doAction(env,me,"map_use",{},{grant:true});
  const du=await env.DB.prepare("SELECT state,COALESCE(nick,name) AS name FROM users WHERE id=?").bind(R.owner).first(),oD=dgaDragon(du&&du.state);
  if(!oD){await env.DB.prepare("DELETE FROM map_reg WHERE id=? AND owner=?").bind(rid,R.owner).run();fail("Дракон-хранитель улетел — логово свободно, попробуй ещё раз")}
  const fat=Math.min(MAP.dfatMax,MAP.dfat*(R.def_n||0)),pb=Math.max(1,Math.round(mapDgPow(oD)*(1-fat))),F=dgaSim(myD,Object.assign({},oD,{__pow:pb}),tac);
  await env.DB.prepare("INSERT INTO map_log(rid,att,def,win,t) VALUES(?,?,?,?,?)").bind(rid,me.id,R.owner,F.win,now).run();
  if(F.win){await occupy(R.owner);await doAction(env,me,"map_grant",{pts:MPASS.pts.cap},{grant:true});
    try{await notify(env,R.owner,"🐉 "+(me.nick||me.name||"Игрок")+" выгнал твоего дракона из логова «"+MAP_R[rid][0]+"»!\n\nВерни своё логово — Земля драконов ждёт 🔥","🗺 На карту",PAGE+"?map=1")}catch(e){}}
  else{await env.DB.prepare("UPDATE map_reg SET def_n=def_n+1 WHERE id=?").bind(rid).run();try{await doAction(env,{id:R.owner,name:(du&&du.name)||"Игрок"},"map_grant",{pts:MPASS.pts.def},{grant:true})}catch(e){}}
  return {dragon:1,won:F.win,rid,rounds:F.rounds,ta:F.ta,tb:F.tb,tw:F.tw,ela:F.ela,elb:F.elb,pa:mp,pb,fat,opp:Object.assign(look(oD),{name:(du&&du.name)||"Игрок"})}}
/* 🤝 Земли союзов: крепости берут и держат только вдвоём. Сила пары = лучшая боевая карта каждого (сумма 5 характеристик). Доход — пополам */
/* ID в Telegram бывают больше 2^31 — «|0» их обрезает. Только так: */
const uidOf=x=>{const n=Math.floor(Number(x));return Number.isSafeInteger(n)&&n>0?n:0};
/* 🎟 БИЛЕТНАЯ ГОНКА: билеты за время в игре (1 в минуту, если игрок что-то делал) и за действия. Кто больше соберёт за окно конкурса — тот и победил (3 места) */
const TK={id:"tk1108",start:Date.UTC(2026,10,8,5,0),end:Date.UTC(2026,10,8,19,0),min:1,
  act:{open:1,open_multi:"n",fight:2,duel:2,fduel:2,conq_fight:2,rk_find:2,dga_fight:2,war_attack:3,map_attack:2,roc_bet:1,cas_slot:1,cas_mn_go:1,cas_hl_go:1,cas_case:1,emp_trib:5,hof_claim:2,luck_buy:3,al_find:2},
  prizes:[{stars:300,gift:["crown","egg","feather"],n:"300 ⭐ + 👑 Корона Эпох"},{stars:200,gift:["feather","ring","hourglass"],n:"200 ⭐ + 🪶 Перо феникса"},{stars:100,gift:["dragon","horn","lamp"],n:"100 ⭐ + 🐉 Дракончик"}]};
const TKREQ=new WeakMap(),tkLive=t=>!!TK.force||t>=TK.start&&t<TK.end;
async function tkAdd(env,uid,n,ping){const now=Date.now();if(!tkLive(now)||!(n>0))return;
  await env.DB.prepare("INSERT INTO tk(cid,uid,n,lp,t) VALUES(?,?,?,?,?) ON CONFLICT(cid,uid) DO UPDATE SET n=n+excluded.n,t=excluded.t"+(ping?",lp=excluded.lp":"")).bind(TK.id,uid,n,ping?now:0,now).run();delete TKC.v}
async function tkAfter(req,env,resp){const x=TKREQ.get(req);if(!x||resp.status!==200)return;const j=await resp.clone().json();if(j&&j.ok)await tkAdd(env,x.uid,x.n)}
const TKC={};
async function tkTop(env){const now=Date.now();if(TKC.v&&now-TKC.t<5e3)return TKC.v;TKC.v=(await env.DB.prepare("SELECT t.uid,t.n,COALESCE(u.nick,u.name) AS name,json_extract(u.state,'$.ava') AS ava FROM tk t LEFT JOIN users u ON u.id=t.uid WHERE t.cid=? ORDER BY t.n DESC,t.t ASC LIMIT 20").bind(TK.id).all()).results;TKC.t=now;return TKC.v}
async function tkPing(env,me,p){const now=Date.now();let my=await env.DB.prepare("SELECT n,lp FROM tk WHERE cid=? AND uid=?").bind(TK.id,me.id).first();let got=0;
  if(p.act&&tkLive(now)&&(!my||now-(my.lp||0)>=55e3)){await tkAdd(env,me.id,TK.min,1);got=TK.min;my=await env.DB.prepare("SELECT n,lp FROM tk WHERE cid=? AND uid=?").bind(TK.id,me.id).first()}
  const n=my?my.n:0,rank=n?((await env.DB.prepare("SELECT COUNT(*) AS c FROM tk WHERE cid=? AND n>?").bind(TK.id,n).first()).c+1):0,cnt=((await env.DB.prepare("SELECT COUNT(*) AS c FROM tk WHERE cid=?").bind(TK.id).first())||{}).c||0;
  const fin=await kvGet(env,"tkfin:"+TK.id);return {id:TK.id,start:TK.start,end:TK.end,now,n,rank,cnt,got,top:(await tkTop(env)).map(x=>({uid:x.uid,n:x.n,name:x.name||"Игрок",ava:x.ava==null?null:+x.ava,me:x.uid===me.id?1:0})),prizes:TK.prizes.map(x=>x.n),act:TK.act,fin:fin||null}}
async function tkFinish(env){const now=env.TK_FIN?TK.end+1:Date.now();if(now<TK.end||now>TK.end+3*864e5)return;const k="tkfin:"+TK.id;if(await kvGet(env,k))return;
  const top=(await env.DB.prepare("SELECT t.uid,t.n,COALESCE(u.nick,u.name) AS name FROM tk t LEFT JOIN users u ON u.id=t.uid WHERE t.cid=? ORDER BY t.n DESC,t.t ASC LIMIT 3").bind(TK.id).all()).results;
  await kvSet(env,k,{w:top.map((x,i)=>({name:x.name||"Игрок",n:x.n,prize:TK.prizes[i].n})),t:now});
  for(let i=0;i<top.length;i++){const x=top[i],P=TK.prizes[i];
    try{await env.DB.prepare("UPDATE users SET star_bal=star_bal+? WHERE id=?").bind(P.stars,x.uid).run()}catch(e){console.error("tk stars",e)}
    try{for(const g of P.gift){if(await giftMint(env,x.uid,g,"prize"))break}}catch(e){console.error("tk gift",e)}
    try{await notify(env,x.uid,"🏆 Ты занял "+(i+1)+" место в Билетной гонке с "+x.n+" билетами!\n\nТвой приз — "+P.n+" — уже в игре. Поздравляем, воин! 🎉","🎁 Открыть",PAGE)}catch(e){}
    try{await hypeAdd(env,x.uid,"🏆 "+(i+1)+" место в Билетной гонке · "+P.n,1)}catch(e){}}
  try{const M=["🥇","🥈","🥉"];await tgApi(env,"sendMessage",{chat_id:CHANNEL,text:"🏁 БИЛЕТНАЯ ГОНКА ЗАВЕРШЕНА!\n\nПобедители:\n"+top.map((x,i)=>M[i]+" "+(x.name||"Игрок")+" — "+x.n+" 🎟 → "+TK.prizes[i].n).join("\n")+"\n\nПризы уже в игре. Спасибо всем, кто играл! Новые конкурсы — скоро 🔥\n👉 @VoinyEpohBot",reply_markup:{inline_keyboard:[[{text:"⚔️ Играть",url:"https://t.me/VoinyEpohBot"}]]}})}catch(e){console.error("tk chan",e)}
  for(const a of ADMINS)try{await notify(env,a,"🎟 Билетная гонка завершена!\n\n"+top.map((x,i)=>(i+1)+". "+(x.name||"Игрок")+" — "+x.n+" 🎟 → "+TK.prizes[i].n).join("\n")+"\n\nПризы выданы автоматически.","⚔️ Открыть")}catch(e){}}
async function alMate(env,uid){const r=await env.DB.prepare("SELECT mate FROM ally WHERE uid=?").bind(uid).first();return r?r.mate:0}
async function alBest(env,uid){const R=(await env.DB.prepare("SELECT * FROM cards WHERE owner=? AND COALESCE(away,0)=0 ORDER BY v DESC LIMIT 60").bind(uid).all()).results;let best=null,bp=0;
  for(const row of R){const c=rowToCard(row);if(FIN[c.f]&&FIN[c.f].excl)continue;if(c.part)continue;let s=0;for(let i=0;i<5;i++)s+=eff(c,i)||0;if(s>bp){bp=s;best=c}}return {c:best?pub(best):null,pw:bp}}
async function alPair(env,a,b,now){await env.DB.prepare("DELETE FROM ally_q WHERE uid IN (?,?)").bind(a,b).run();await env.DB.prepare("INSERT OR REPLACE INTO ally(uid,mate,t) VALUES(?,?,?),(?,?,?)").bind(a,b,now,b,a,now).run()}
async function alApi(env,me,a,p){const now=Date.now();
  if(a==="al_get"){const m=await alMate(env,me.id);const q=m?null:await env.DB.prepare("SELECT t FROM ally_q WHERE uid=?").bind(me.id).first();const my=await alBest(env,me.id);
    let mate=null;if(m){const u=await env.DB.prepare("SELECT id,COALESCE(nick,name) AS name FROM users WHERE id=?").bind(m).first();const b=await alBest(env,m);mate={id:m,name:(u&&u.name)||"Игрок",pw:b.pw,c:b.c}}
    return {mate,wait:q?q.t:0,my:{pw:my.pw,c:my.c}}}
  if(a==="al_find"){if(await alMate(env,me.id))fail("У тебя уже есть напарник");const my=(await alBest(env,me.id)).pw;if(!my)fail("Нужна хотя бы одна боевая карточка");
    const o=await env.DB.prepare("SELECT uid FROM ally_q WHERE uid<>? AND t>? AND uid NOT IN (SELECT uid FROM ally) ORDER BY ABS(pw-?) LIMIT 1").bind(me.id,now-20*6e4,my).first();
    if(o){await alPair(env,me.id,o.uid,now);try{await notify(env,o.uid,"🤝 Напарник найден: "+(me.nick||me.name||"Игрок")+"!\n\nВместе захватывайте крепости в Землях союзов 🏰","🗺 На карту",PAGE+"?map=1")}catch(e){}return alApi(env,me,"al_get",{})}
    await env.DB.prepare("INSERT OR REPLACE INTO ally_q(uid,t,pw) VALUES(?,?,?)").bind(me.id,now,my).run();return alApi(env,me,"al_get",{})}
  if(a==="al_cancel"){await env.DB.prepare("DELETE FROM ally_q WHERE uid=?").bind(me.id).run();return alApi(env,me,"al_get",{})}
  if(a==="al_join"){const t=uidOf(p.uid);if(!t||t===me.id)fail("Нельзя позвать самого себя");if(await alMate(env,me.id))fail("У тебя уже есть напарник");if(await alMate(env,t))fail("У этого игрока уже есть напарник");
    if(!(await env.DB.prepare("SELECT 1 FROM users WHERE id=?").bind(t).first()))fail("Игрок не найден");await alPair(env,me.id,t,now);
    try{await notify(env,t,"🤝 "+(me.nick||me.name||"Игрок")+" принял твоё приглашение — теперь вы союзники!","🗺 На карту",PAGE+"?map=1")}catch(e){}return alApi(env,me,"al_get",{})}
  if(a==="al_leave"){const m=await alMate(env,me.id);if(!m)fail("Напарника нет");await env.DB.prepare("DELETE FROM ally WHERE uid IN (?,?)").bind(me.id,m).run();
    try{await notify(env,m,"💔 "+(me.nick||me.name||"Игрок")+" покинул союз. Найди нового напарника в Землях союзов","🗺 На карту",PAGE+"?map=1")}catch(e){}return alApi(env,me,"al_get",{})}
  fail("Неизвестное действие")}
async function mapAlAttack(env,me,rid,now){const m=await alMate(env,me.id);if(!m)fail("Земли союзов берут только вдвоём — сначала найди напарника");
  const R=await env.DB.prepare("SELECT * FROM map_reg WHERE id=?").bind(rid).first();if(R&&R.owner&&(R.owner===me.id||R.owner2===me.id))fail("Это уже ваша крепость");
  const myN=((await env.DB.prepare("SELECT COUNT(*) AS n FROM map_reg WHERE (id BETWEEN 60 AND 67 OR id BETWEEN 97 AND 104) AND (owner IN (?,?) OR owner2 IN (?,?))").bind(me.id,m,me.id,m).first())||{}).n||0;if(myN>=MAP.amax)fail("Ваш союз уже держит крепость. Одна пара — одна крепость");
  if(R&&R.owner&&R.shield>now)fail("Крепость под щитом ещё "+Math.ceil((R.shield-now)/60e3)+" мин");
  const A1=await alBest(env,me.id),A2=await alBest(env,m),pa=A1.pw+A2.pw;if(!A1.pw||!A2.pw)fail("У обоих союзников должна быть боевая карточка");
  let pb,opp;if(R&&R.owner){await doAction(env,me,"map_use",{},{grant:true});const B1=await alBest(env,R.owner),B2=R.owner2?await alBest(env,R.owner2):{pw:0,c:null},fat=Math.min(MAP.afatMax,MAP.afat*(R.def_n||0));
    pb=Math.max(1,Math.round((B1.pw+B2.pw)*(1-fat)));opp={c1:B1.c,c2:B2.c,fat}}else{pb=Math.round(pa*(.7+Math.random()*.3));opp={garrison:1}}
  const ch=pa*pa/(pa*pa+pb*pb),win=Math.random()<ch?1:0,rounds=[0,1,2].map(()=>{const x=pa*(.8+Math.random()*.4),y=pb*(.8+Math.random()*.4);return [Math.round(x),Math.round(y)]});
  rounds.sort((u,v)=>(win?1:-1)*((u[0]-u[1])-(v[0]-v[1])));if(win){if(rounds.filter(r=>r[0]>r[1]).length<2){rounds[1]=[Math.max(rounds[1][0],rounds[1][1]+1),rounds[1][1]];rounds[2]=[Math.max(rounds[2][0],rounds[2][1]+1),rounds[2][1]]}}else if(rounds.filter(r=>r[0]<r[1]).length<2){rounds[1]=[rounds[1][0],Math.max(rounds[1][1],rounds[1][0]+1)];rounds[2]=[rounds[2][0],Math.max(rounds[2][1],rounds[2][0]+1)]}
  if(R&&R.owner)await env.DB.prepare("INSERT INTO map_log(rid,att,def,win,t) VALUES(?,?,?,?,?)").bind(rid,me.id,R.owner,win,now).run();
  if(win){const q=R&&R.owner?env.DB.prepare("UPDATE map_reg SET owner=?,owner2=?,card=NULL,since=?,claim_at=?,claim2_at=?,shield=?,def_n=0,statue=0 WHERE id=? AND owner=?").bind(me.id,m,now,now,now,now+MAP.ashield,rid,R.owner)
      :env.DB.prepare("INSERT INTO map_reg(id,owner,owner2,card,since,claim_at,claim2_at,shield,def_n,statue) VALUES(?,?,?,NULL,?,?,?,?,0,0) ON CONFLICT(id) DO UPDATE SET owner=excluded.owner,owner2=excluded.owner2,card=NULL,since=excluded.since,claim_at=excluded.claim_at,claim2_at=excluded.claim2_at,shield=excluded.shield,def_n=0 WHERE map_reg.owner IS NULL").bind(rid,me.id,m,now,now,now,now+MAP.ashield);
    if((await q.run()).meta.changes!==1)fail("Крепость только что заняли — обнови карту");await doAction(env,me,"map_grant",{pts:MPASS.pts.cap},{grant:true});
    try{await notify(env,m,"🏰 Твой союзник "+(me.nick||me.name||"Игрок")+" взял крепость «"+MAP_R[rid][0]+"» — она ваша! Доход делится пополам","🗺 На карту",PAGE+"?map=1")}catch(e){}
    if(R&&R.owner)for(const u of [R.owner,R.owner2])if(u)try{await notify(env,u,"⚔️ Ваш союз потерял крепость «"+MAP_R[rid][0]+"»! Отбейте её вместе с напарником","🗺 На карту",PAGE+"?map=1")}catch(e){}}
  else if(R&&R.owner)await env.DB.prepare("UPDATE map_reg SET def_n=def_n+1 WHERE id=?").bind(rid).run();
  return {ally:1,won:win,rid,pa,pb,ch:Math.round(ch*100),rounds,me:{c:A1.c,pw:A1.pw},mate:{c:A2.c,pw:A2.pw},opp}}
/* ⚔️ Война армий */
async function warArmy(env,uid){const R=(await env.DB.prepare("SELECT * FROM cards WHERE owner=? ORDER BY v DESC LIMIT 120").bind(uid).all()).results;const A=[];
  for(const r of R){const c=rowToCard(r);if(!FIN[c.f]||FIN[c.f].excl||c.part)continue;A.push({c,p:cardPow(c)})}A.sort((a,b)=>b.p-a.p);return A.slice(0,WAR.army)}
async function warInfo(env,uid,full){const u=await env.DB.prepare("SELECT id,COALESCE(nick,name) AS name,emp,glory,json_extract(state,'$.ava') AS ava,json_extract(state,'$.avfOn') AS avf,json_extract(state,'$.crest') AS crest,json_extract(state,'$.warSh') AS sh FROM users WHERE id=?").bind(uid).first();if(!u)return null;
  const A=full?await warArmy(env,uid):null;return {uid:u.id,name:u.name||"Игрок",emp:u.emp||0,glory:u.glory||0,ava:u.ava==null?null:+u.ava,avf:u.avf||null,crest:u.crest||null,sh:(u.sh||0)>Date.now()?1:0,army:A?A.map(x=>({c:pub(x.c),p:x.p})):undefined,ap:A?A.reduce((s,x)=>s+x.p,0):undefined}}
async function warApi(env,me,a,p){const now=Date.now();const st=JSON.parse(((await env.DB.prepare("SELECT state FROM users WHERE id=?").bind(me.id).first())||{}).state||"{}");const lim=WAR.day+(st.warXD===today(now)?3:0),left=st.warD===today(now)?lim-(st.warN||0):lim;
  if(a==="war_get"){const mine=await warInfo(env,me.id,true);const mp=mine.emp||1;
    let L=(await env.DB.prepare("SELECT id FROM users WHERE id<>? AND emp BETWEEN ? AND ? AND seen>? ORDER BY RANDOM() LIMIT 3").bind(me.id,Math.floor(mp*.6),Math.ceil(mp*1.6),now-14*864e5).all()).results;
    if(L.length<3)L=L.concat((await env.DB.prepare("SELECT id FROM users WHERE id<>? AND emp>0 ORDER BY ABS(emp-?) LIMIT 6").bind(me.id,mp).all()).results.filter(x=>!L.some(y=>y.id===x.id))).slice(0,3);
    const opp=[];for(const x of L){const i=await warInfo(env,x.id,true);if(i&&i.army.length)opp.push(i)}
    const log=(await env.DB.prepare("SELECT w.*,COALESCE(a.nick,a.name) AS an,COALESCE(d.nick,d.name) AS dn FROM emp_war w LEFT JOIN users a ON a.id=w.att LEFT JOIN users d ON d.id=w.def WHERE w.att=? OR w.def=? ORDER BY w.id DESC LIMIT 12").bind(me.id,me.id).all()).results
      .map(w=>({t:w.t,att:w.att===me.id,name:w.att===me.id?w.dn:w.an,win:w.att===me.id?!!w.win:!w.win,gl:w.gl}));
    return {me:mine,opp,left,log}}
  if(a==="war_attack"){const tid=uidOf(p.uid);if(!tid||tid===me.id)fail("Выбери соперника");
    const tst=JSON.parse(((await env.DB.prepare("SELECT state FROM users WHERE id=?").bind(tid).first())||{}).state||"{}");if((tst.warSh||0)>now)fail("🛡 Эта Империя под щитом ещё "+Math.ceil((tst.warSh-now)/36e5)+" ч");
    const recent=await env.DB.prepare("SELECT 1 FROM emp_war WHERE att=? AND def=? AND t>?").bind(me.id,tid,now-WAR.cool).first();if(recent)fail("Эту Империю ты уже атаковал недавно — дай ей 2 часа");
    const A=await warArmy(env,me.id),B=await warArmy(env,tid);if(!A.length)fail("Нужна хотя бы одна боевая карточка");if(!B.length)fail("У этой Империи нет армии");
    const me2=await warInfo(env,me.id),op=await warInfo(env,tid);
    const duels=[];let w=0;for(let i=0;i<WAR.army;i++){const x=A[i],y=B[i],a1=x?Math.round(x.p*(.8+Math.random()*.4)):0,b1=y?Math.round(y.p*(.8+Math.random()*.4)):0,ok=a1>b1;if(ok)w++;duels.push({a:x?pub(x.c):null,b:y?pub(y.c):null,ap:a1,bp:b1,win:ok?1:0})}
    const win=w>=3?1:0,ratio=Math.max(.2,Math.min(3,(op.emp||1)/Math.max(1,me2.emp||1))),gain=Math.max(WAR.win[0],Math.min(WAR.win[1],Math.round(18*Math.pow(ratio,.8))));
    const cash=win?Math.round(EMP.trib[empRank(me2.emp||0)]*.15):0;await doAction(env,me,"war_use",{cash},{grant:true});
    const gl=win?gain:-WAR.lose;await env.DB.prepare("UPDATE users SET glory=MAX(0,glory+?) WHERE id=?").bind(gl,me.id).run();
    await env.DB.prepare("UPDATE users SET glory=MAX(0,glory+?) WHERE id=?").bind(win?-Math.round(gain/2):WAR.def,tid).run();
    const hot=await env.DB.prepare("SELECT 1 FROM emp_war WHERE def=? AND t>?").bind(tid,now-36e5).first();
    await env.DB.prepare("INSERT INTO emp_war(att,def,win,gl,t) VALUES(?,?,?,?,?)").bind(me.id,tid,win,gl,now).run();delete topCache.glory;
    if(win&&!hot)try{await notify(env,tid,"⚔️ Империя «"+(me.nick||me.name||"Игрок")+"» разбила твою армию в "+w+" из 5 боёв!\n\nУсиль армию и отомсти — в «Войне армий» 👑","⚔️ Отомстить",PAGE+"?war=1")}catch(e){}
    if(win&&gain>=30)try{await hypeAdd(env,me.id,"⚔️ разбил армию сильной Империи «"+op.name+"» · +"+gain+" славы")}catch(e){}
    return {win,w,duels,gl,cash,opp:{name:op.name,ava:op.ava,emp:op.emp},left:left-1}}
  fail("Неизвестное действие")}
async function empR(env,uid){return empRank(((await env.DB.prepare("SELECT emp FROM users WHERE id=?").bind(uid).first())||{}).emp||0)}
async function mapApi(env,me,a,p){const now=Date.now();await mapSeason(env,now);
  const U=async()=>{const u=await env.DB.prepare("SELECT state FROM users WHERE id=?").bind(me.id).first();return JSON.parse((u&&u.state)||"{}")};
  if(a==="map_get"){const R=await mapRegions(env),ids=R.filter(r=>r.card).map(r=>r.card),cards={};
    for(let i=0;i<ids.length;i+=90){const part=ids.slice(i,i+90);for(const c of (await env.DB.prepare("SELECT * FROM cards WHERE id IN ("+part.map(()=>"?").join(",")+")").bind(...part).all()).results)cards[c.id]=pub(rowToCard(c))}
    const st=await U(),A=mapAtt(st,now),mine=R.filter(r=>r.owner===me.id);let cash=0,runes=0;
    for(const r of mine){const h=Math.min(MAP.capH,(now-(r.claim_at||r.since))/36e5),I=mapInc(r.id);cash+=Math.floor(I.c*h);runes+=Math.floor(I.r*h)}
    const ph=await env.DB.prepare("SELECT st FROM map_photo WHERE uid=?").bind(me.id).first();
    return {now,dgp:st.dg?{pow:mapDgPow(st.dg),el:dgEl(st.dg)}:null,regs:R.map(r=>({id:r.id,owner:r.owner,oname:r.oname,owner2:r.owner2||0,oname2:r.oname2||"",flag:r.flag||"",ph:r.ph===1?1:0,card:cards[r.card]||null,dg:mapDgLook(r.dgj),shield:r.shield>now?r.shield:0,def_n:r.def_n,statue:r.statue?1:0,since:r.since})),
      att:{left:MAP.att+A.extra+EMP.att[await empR(env,me.id)]-A.used,packs:A.packs},regMax:EMP.reg[await empR(env,me.id)],inc:{cash,runes},z1:(st.nOp||0)>=MAP.z1Spins,z2:!!(st.dg&&dgStage(st.dg.lv)>=MAP.z2Stage),ph:ph?ph.st:-1}}
  if(a==="map_claim"){const mine=(await env.DB.prepare("SELECT * FROM map_reg WHERE owner=? OR owner2=?").bind(me.id,me.id).all()).results;let cash=0,runes=0,n=0;
    for(const r of mine){const two=r.owner!==me.id,ca=two?(r.claim2_at||r.since):(r.claim_at||r.since),h=Math.min(MAP.capH,(now-ca)/36e5),I=mapInc(r.id),half=MAP_Z(r.id)===4?.5:1;const c=Math.floor(I.c*h*half),q=Math.floor(I.r*h*half);if(c<=0)continue;
      const u=await env.DB.prepare(two?"UPDATE map_reg SET claim2_at=? WHERE id=? AND owner2=? AND COALESCE(claim2_at,since)=?":"UPDATE map_reg SET claim_at=? WHERE id=? AND owner=? AND COALESCE(claim_at,since)=?").bind(now,r.id,me.id,ca).run();if(u.meta.changes===1){cash+=c;runes+=q;if(h>=1)n++}}
    if(!cash&&!runes)fail("Доход ещё не накопился");{const k=1+EMP.inc*(await empR(env,me.id));cash=Math.floor(cash*k);runes=Math.floor(runes*k)}await doAction(env,me,"map_grant",{cash,runes,pts:n*MPASS.pts.claim},{grant:true});try{await kingCut(env,cash)}catch(e){}return {cash,runes}}
  if(a==="map_leave"){const rid=p.rid|0,r=await env.DB.prepare("SELECT * FROM map_reg WHERE id=? AND (owner=? OR owner2=?)").bind(rid,me.id,me.id).first();if(!r)fail("Это не твой регион");
    await env.DB.prepare("DELETE FROM map_reg WHERE id=?").bind(rid).run();await env.DB.prepare("UPDATE cards SET away=0,dest=NULL WHERE id=? AND owner=?").bind(r.card,me.id).run();return {rid}}
  if(a==="map_attack"){const rid=p.rid|0;if(rid<0||rid>=MAP_R.length)fail("Нет такого региона");const z=MAP_Z(rid),st=await U();if(z===3)return mapDgAttack(env,me,rid,st,p,now);if(z===4)return mapAlAttack(env,me,rid,now);
    if(z===1&&(st.nOp||0)<MAP.z1Spins)fail("«Земли эпох» откроются после "+MAP.z1Spins+" прокруток");if(z===2&&!(st.dg&&dgStage(st.dg.lv)>=MAP.z2Stage))fail("«Сердце мира» откроется, когда дракон дорастёт до 3-й стадии");
    const c=await env.DB.prepare("SELECT * FROM cards WHERE id=? AND owner=?").bind(p.id|0,me.id).first();if(!c)fail("Выбери свою карточку");
    if(c.away||c.list_price!=null||c.room_id||c.part||c.f>=5)fail("Эта карточка сейчас недоступна для боя");if(z===0&&HEROES[c.h][2]>1)fail("На «Окраины» можно только обычных и редких воинов — дай шанс новичкам");
    const R=await env.DB.prepare("SELECT * FROM map_reg WHERE id=?").bind(rid).first();if(R&&R.owner===me.id)fail("Это уже твой регион");
    const myN=((await env.DB.prepare("SELECT COUNT(*) AS n FROM map_reg WHERE owner=? AND (id<50 OR id BETWEEN 68 AND 87)").bind(me.id).first())||{}).n||0;const er=await empR(env,me.id),mx=EMP.reg[er];if(myN>=mx)fail("У тебя уже "+mx+" рег. — максимум для ранга «"+EMP.R[er].n+"». Подними Империю, чтобы держать больше"+(er<EMP.R.length-1?"":""));
    if(R&&R.shield>now)fail("Регион под щитом ещё "+Math.ceil((R.shield-now)/60e3)+" мин");
    if(R&&R.owner&&rid!==KING.throne){const ou=await env.DB.prepare("SELECT created FROM users WHERE id=?").bind(R.owner).first();if(ou&&ou.created>now-NEWB_MS)fail("🌱 Хозяин — новичок: первые 3 дня его регионы под защитой. Выбери другой регион")}
    const occupy=async()=>{const ok=await env.DB.prepare("UPDATE cards SET away=1,dest=? WHERE id=? AND owner=? AND away=0 AND list_price IS NULL AND room_id IS NULL").bind("map:"+rid,c.id,me.id).run();if(ok.meta.changes!==1)fail("Карточка занята");
      await env.DB.prepare("INSERT INTO map_reg(id,owner,card,since,claim_at,shield,def_n,statue) VALUES(?,?,?,?,?,?,0,0) ON CONFLICT(id) DO UPDATE SET owner=excluded.owner,card=excluded.card,since=excluded.since,claim_at=excluded.claim_at,shield=excluded.shield,def_n=0,statue=0").bind(rid,me.id,c.id,now,now,now+MAP.shield).run()};
    if(!R||!R.owner){await occupy();await env.DB.prepare("INSERT INTO map_log(rid,att,def,win,t) VALUES(?,?,0,2,?)").bind(rid,me.id,now).run();await doAction(env,me,"map_grant",{pts:MPASS.pts.cap},{grant:true});return {won:1,empty:1,rid}}
    await doAction(env,me,"map_use",{},{grant:true});
    const D=await env.DB.prepare("SELECT * FROM cards WHERE id=?").bind(R.card).first();if(!D){await env.DB.prepare("DELETE FROM map_reg WHERE id=?").bind(rid).run();fail("Защитник исчез — регион свободен, попробуй ещё раз")}
    const du=await env.DB.prepare("SELECT state FROM users WHERE id=?").bind(R.owner).first(),dst=JSON.parse((du&&du.state)||"{}");
    const me_=rowToCard(c),op=rowToCard(D),dk=dgBonus(st,now)*1.5+(st.dg?.05:0),home=MAP_R[rid][2]===ERA_OF[op.h]?MAP.home:0,fat=Math.min(MAP.fatMax,MAP.fat*(R.def_n||0)),ddk=dgBonus(dst,now);
    const k=(1+dk)/(1+home+ddk-fat)-1,stat=Math.max(0,Math.min(4,p.stat|0)),p2=aiPick(op,[stat]),p3=rndPick([stat,p2]),F=fight3(me_,op,[stat,p2,p3],k),won=F.w>F.l;
    await env.DB.prepare("INSERT INTO map_log(rid,att,def,win,t) VALUES(?,?,?,?,?)").bind(rid,me.id,R.owner,won?1:0,now).run();
    let crown=false;
    if(won){const g=await env.DB.prepare("UPDATE map_reg SET owner=NULL WHERE id=? AND owner=? AND card=?").bind(rid,R.owner,R.card).run();if(g.meta.changes!==1)fail("Регион только что сменил хозяина — обнови карту");
      await env.DB.prepare("UPDATE cards SET away=0,dest=NULL WHERE id=?").bind(R.card).run();await occupy();await doAction(env,me,"map_grant",{pts:MPASS.pts.cap},{grant:true});try{crown=await kingThrone(env,me,rid,R.owner)}catch(e){}
      try{await notify(env,R.owner,"⚔️ "+(me.nick||me.name||"Игрок")+" захватил твой регион «"+MAP_R[rid][0]+"»! Твой "+HEROES[op.h][0]+" вернулся в коллекцию.\n\nОтбей регион обратно, пока не поздно 🔥","🗺 На карту",PAGE+"?map=1")}catch(e){}}
    else{await env.DB.prepare("UPDATE map_reg SET def_n=def_n+1 WHERE id=?").bind(rid).run();try{await doAction(env,{id:R.owner,name:R.oname||"Игрок"},"map_grant",{pts:MPASS.pts.def},{grant:true})}catch(e){}}
    return {won:won?1:0,rid,rounds:F.rounds,w:F.w,l:F.l,picks:[stat,p2,p3],me:pub(me_),opp:pub(op),bon:{dk,home,fat,ddk},crown:crown?1:0}}
  if(a==="map_photo"){const st=await U();if(!(st.mflags||[]).includes("photo"))fail("Сначала купи «Флаг со своим фото»");const img=String(p.img||"");
    if(!/^data:image\/(jpeg|png|webp);base64,/.test(img)||img.length>90000)fail("Картинка слишком большая");
    await env.DB.prepare("INSERT INTO map_photo(uid,img,st,t) VALUES(?,?,0,?) ON CONFLICT(uid) DO UPDATE SET img=excluded.img,st=0,t=excluded.t").bind(me.id,img,now).run();
    for(const ad of ADMINS)await notify(env,ad,"📸 Новое фото для флага на модерации (игрок "+me.id+"). Проверь: Статистика → «Фото флагов».","⚔️ Открыть");return {st:0}}
  if(!isAdmin(env,me.id))fail("Нет доступа");
  if(a==="map_stats"){const D=864e5,d0=Math.floor((now+TZ)/D)*D-TZ,w0=now-7*D,m0=Date.parse(mapMon(now)+"-01T00:00:00Z")-TZ,one=async(q,...x)=>(await env.DB.prepare(q).bind(...x).first())||{};
    const per=async t=>one("SELECT SUM(win=2) AS occ,SUM(win IN (0,1)) AS fights,SUM(win=1) AS caps,SUM(win=0) AS held,COUNT(DISTINCT att) AS players FROM map_log WHERE t>=?",t);
    const R=(await env.DB.prepare("SELECT r.id,r.owner,r.statue,r.def_n,r.since,COALESCE(u.nick,u.name) AS name FROM map_reg r LEFT JOIN users u ON u.id=r.owner WHERE r.owner IS NOT NULL").all()).results;
    const z=[0,0,0,0];R.forEach(r=>z[MAP_Z(r.id)]++);const rul={};R.forEach(r=>{const k=r.owner;rul[k]=rul[k]||{name:r.name,n:0,reg:[]};rul[k].n++;rul[k].reg.push(MAP_R[r.id][0])});
    const topA=(await env.DB.prepare("SELECT l.att AS uid,COALESCE(u.nick,u.name) AS name,SUM(l.win=1) AS caps,SUM(l.win IN (0,1)) AS fights FROM map_log l LEFT JOIN users u ON u.id=l.att WHERE l.t>=? GROUP BY l.att ORDER BY caps DESC,fights DESC LIMIT 7").bind(m0).all()).results;
    const hot=(await env.DB.prepare("SELECT rid,COUNT(*) AS n,SUM(win=1) AS caps FROM map_log WHERE t>=? AND win IN (0,1) GROUP BY rid ORDER BY n DESC LIMIT 5").bind(m0).all()).results.map(r=>({...r,name:MAP_R[r.rid][0]}));
    const pay=(await env.DB.prepare("SELECT item,COUNT(*) AS n,SUM(stars) AS s FROM payments WHERE item IN ('mflag','mpack','mpass','mstatue') AND status='done' AND created>=? GROUP BY item").bind(m0).all()).results;
    const ph=await one("SELECT SUM(st=0) AS wait,SUM(st=1) AS ok FROM map_photo");
    return {today:await per(d0),week:await per(w0),season:await per(m0),occupied:R.length,zones:z,statues:R.filter(r=>r.statue).length,rulers:Object.values(rul).sort((a,b)=>b.n-a.n).slice(0,7),topA,hot,pay,ph}}
  if(a==="mph_list")return {list:(await env.DB.prepare("SELECT p.uid,p.img,p.st,p.t,COALESCE(u.nick,u.name) AS name FROM map_photo p LEFT JOIN users u ON u.id=p.uid WHERE p.st=0 ORDER BY p.t LIMIT 20").all()).results};
  if(a==="mph_ok"||a==="mph_no"){const ok=a==="mph_ok";await env.DB.prepare("UPDATE map_photo SET st=? WHERE uid=?").bind(ok?1:2,uidOf(p.uid)).run();
    await notify(env,uidOf(p.uid),ok?"✅ Твоё фото одобрено — теперь оно на флаге над твоими регионами!":"❌ Фото для флага не прошло проверку. Загрузи другое — без чужих лиц, рекламы и неприличного.","🗺 На карту",PAGE+"?map=1");return {}}
  fail("Неизвестное действие")}
/* возвращаем пропавших: через 1, 3 и 7 дней тишины — сообщение с подарком (прокрутки ждут в игре). Новичкам — напоминание о подарке дня */
const WB={1:{sp:3,t:"⚔️ Твои воины заскучали! Мы оставили тебе подарок: +3 прокрутки уже в игре. Вдруг сегодня выпадет легенда?"},3:{sp:5,t:"🎁 Тебя не было 3 дня — держи +5 прокруток! Пока тебя не было, игроки выбили новые редкие карточки. Твоя очередь?"},7:{sp:10,t:"👑 Неделя без тебя! Возвращайся — в игре ждут +10 прокруток в подарок, новые воины и розыгрыши каждый день."}};
async function winBack(env,now,h){if((h<11||h>=21)&&!env.NOTIFY_TEST)return 0;let sent=0;const D=864e5;
  const R=(await env.DB.prepare("SELECT id,seen,wb,dg_pow,json_extract(state,'$.dg.name') AS dn FROM users WHERE pm=1 AND seen>? AND seen<? AND ((wb<1) OR (wb<3 AND seen<?) OR (wb<7 AND seen<?)) LIMIT 30").bind(now-30*D,now-D,now-3*D,now-7*D).all()).results;
  for(const u of R){const g=now-u.seen,st=g>=7*D?7:g>=3*D?3:1;if(st<=u.wb)continue;const W=WB[st];
    const r=await env.DB.prepare("UPDATE users SET wb=?,gift_spins=gift_spins+? WHERE id=? AND wb<?").bind(st,W.sp,u.id,st).run();if(r.meta.changes!==1)continue;
    const dn=u.dn||"Твой дракон",txt=u.dg_pow>0?(st===1?"🥺 "+dn+" скучает и ждёт тебя у входа… Он не ел со вчерашнего дня. Загляни — и забери +"+W.sp+" прокрутки в подарок.":st===3?"😢 "+dn+" грустит уже 3 дня и почти не поднимает голову. Вернись к нему — он обрадуется, а тебя ждут +"+W.sp+" прокруток.":"💔 "+dn+" ждёт тебя целую неделю… Каждый вечер смотрит на дверь. Вернись — +"+W.sp+" прокруток уже в игре."):W.t;
    if(await notify(env,u.id,txt,u.dg_pow>0?"🐉 Навестить дракона":"🎴 Забрать подарок",u.dg_pow>0?PAGE+"?dragon=1":undefined))sent++}
  if(h>=12){const td=dayNum(now);
    const N=(await env.DB.prepare("SELECT id,created,COALESCE(json_extract(state,'$.nb.n'),0) AS n,COALESCE(json_extract(state,'$.nb.last'),'') AS last FROM users WHERE pm=1 AND created>? AND nb_note<? AND seen<? LIMIT 30").bind(Math.max(now-8*D,Date.UTC(2026,9,30,21)),td,(td*864e5)-TZ).all()).results;
    for(const u of N){await env.DB.prepare("UPDATE users SET nb_note=? WHERE id=?").bind(td,u.id).run();if(u.n>=NB.length)continue;
      const k=u.n,R2=NB[k],what=R2.leg?"легендарный воин":R2.guar?"гарантированная эпическая карточка":R2.runes?fmtR(R2.runes)+" рун":R2.cash?R2.cash+" монет":(R2.sp||0)+" прокруток";
      if(await notify(env,u.id,"🎁 Подарок новичка, день "+(k+1)+" из "+NB.length+": "+what+(R2.sp&&!/прокрут/.test(what)?" + "+R2.sp+" прокруток":"")+"!\n\nОн ждёт тебя в игре — заходи и забирай. Не забудешь каждый день — на 7-й день легендарный воин и 15 прокруток 👑","🎁 Забрать подарок"))sent++}}
  return sent}

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
/* ---------- подарки и витрины ---------- */
async function giftLeft(env){return cached("gleft",3e3,async()=>{const o={};for(const k in GIFTS)o[k]=GIFTS[k].run;
  for(const r of (await env.DB.prepare("SELECT k,COUNT(*) AS n FROM gifts GROUP BY k").all()).results)if(o[r.k]!=null)o[r.k]=Math.max(0,GIFTS[r.k].run-r.n);return o})}
/* новый подарок со следующим номером тиража. null — тираж закончился */
async function giftMint(env,uid,k,how){const G=GIFTS[k];if(!G)return null;
  for(let i=0;i<8;i++){let r;try{r=await env.DB.prepare("INSERT INTO gifts(owner,k,no,how,created) SELECT ?,?,COALESCE(MAX(no),0)+1,?,? FROM gifts WHERE k=? HAVING COALESCE(MAX(no),0)<? RETURNING id,no").bind(uid,k,how,Date.now(),k,G.run).first()}
    catch(e){if(/UNIQUE/i.test(String(e&&e.message||e))){await new Promise(z=>setTimeout(z,Math.random()*30));continue}throw e}
    delete topCache.gleft;delete topCache.gtop;return r?{id:r.id,k,no:r.no}:null}
  return null}
const GVAL_SQL="CASE k "+Object.keys(GIFTS).map(k=>"WHEN '"+k+"' THEN "+giftVal(k)).join(" ")+" ELSE 0 END";
async function giftTop(env){return cached("gtop",30e3,async()=>(await env.DB.prepare("SELECT g.owner AS uid,SUM("+GVAL_SQL+") AS s,COUNT(*) AS n,COALESCE(u.nick,u.name) AS name FROM gifts g JOIN users u ON u.id=g.owner GROUP BY g.owner ORDER BY s DESC LIMIT 20").all()).results)}
async function giftRank(env,uid){const T=await giftTop(env),i=T.findIndex(r=>r.uid===uid);return i<0?0:i+1}
async function giftApi(env,me,a,p){
  if(a==="gift_top")return {top:await giftTop(env),left:await giftLeft(env)};
  if(a==="gift_shelf"){const id=Math.floor(+p.id||0),slot=Math.max(0,Math.min(SHELF_N,p.slot|0));
    const g=await env.DB.prepare("SELECT id FROM gifts WHERE id=? AND owner=?").bind(id,me.id).first();if(!g)fail("Этого подарка у тебя нет");
    const q=[];if(slot)q.push(env.DB.prepare("UPDATE gifts SET shelf=0 WHERE owner=? AND shelf=?").bind(me.id,slot));q.push(env.DB.prepare("UPDATE gifts SET shelf=? WHERE id=? AND owner=?").bind(slot,id,me.id));
    await env.DB.batch(q);return {id,slot}}
  if(a==="gift_send"){const id=Math.floor(+p.id||0),to=Math.floor(+p.to||0);if(to===me.id)fail("Себе подарить нельзя");
    const u=await env.DB.prepare("SELECT id,COALESCE(nick,name) AS name FROM users WHERE id=?").bind(to).first();if(!u)fail("Игрок не найден");
    const g=await env.DB.prepare("SELECT id,k,no FROM gifts WHERE id=? AND owner=?").bind(id,me.id).first();if(!g)fail("Этого подарка у тебя нет");
    const r=await env.DB.prepare("UPDATE gifts SET owner=?,shelf=0,from_uid=? WHERE id=? AND owner=?").bind(to,me.id,id,me.id).run();if(r.meta.changes!==1)fail("Этого подарка у тебя нет");
    delete topCache.gtop;const G=GIFTS[g.k],from=await nameOf(env,me.id);
    await notify(env,to,"🎁 "+from+" подарил тебе «"+G.n+"» № "+g.no+" из "+G.run+"!\n\nПоставь его на витрину — пусть все видят.","🏛 Моя витрина",PAGE+"?shelf=1");
    return {id,to,name:u.name}}
  fail("Неизвестное действие")}
const monthOf=t=>new Date(t+TZ).toISOString().slice(0,7),PAY_HOLD=15*60e3;
async function mythLeft(env,except){const I=SHOP.mythic,now=Date.now();
  const n=((await env.DB.prepare("SELECT COUNT(*) AS n FROM payments WHERE item='mythic' AND month=? AND id<>? AND (status IN ('paid','done') OR (status='new' AND created>?))").bind(monthOf(now),except||0,now-PAY_HOLD).first())||{}).n||0;
  return Math.max(0,I.month-n)}
async function payItem(env,uid,p,except){const item=String(p.item||""),I=SHOP[item];
  if(I){
    if(I.once){const u=await env.DB.prepare("SELECT state FROM users WHERE id=?").bind(uid).first();let st={};try{st=JSON.parse((u&&u.state)||"{}")}catch(e){}
      if(st.newbie||await env.DB.prepare("SELECT 1 FROM payments WHERE uid=? AND item=? AND status IN ('paid','done') AND id<>?").bind(uid,item,except||0).first())fail("Подарок новичку уже получен")}
    if(I.month&&await mythLeft(env,except)<=0)fail("Мифические сундуки этого месяца раскуплены. Новые появятся 1-го числа");
    if(I.twins&&((await env.DB.prepare("SELECT COUNT(*) AS n FROM cards WHERE f=?").bind(DUO_F).first())||{}).n>=DUO.length*DUO_RUN)fail("Все Близнецы уже разобраны игроками");
    let data={},title=I.n;
    if(I.any){const h=p.h|0,f=p.f|0,H=HEROES[h];if(!H||!FIN[f]||FIN[f].excl||FIN[f].dia||H[4].collab)fail("Такой карточки нет");if(h===THOR)fail("Тора нельзя купить — его можно только выбить в прокрутке");
      if(H[4].one&&f!==4)fail("Легенды 1 из 1 бывают только «Ошибкой печати»");if(H[4].comp&&f!==0)fail("Составного воина можно взять только обычной отделки");
      const f2=H[4].comp?0:f,n=((await env.DB.prepare(H[4].comp?"SELECT COUNT(*) AS n FROM cards WHERE h=? AND f=0 AND no<=?":"SELECT COUNT(*) AS n FROM cards WHERE h=? AND f=?").bind(h,H[4].comp?HALF_RUN:f2).first())||{}).n||0;
      const run=H[4].one?1:H[4].comp?HALF_RUN:FIN[f2].run;if(n>=run)fail("Тираж «"+H[0]+"» ("+FIN[f2].k.toLowerCase()+") уже закончился. Выбери другую");
      data={h,f:f2};title=(H[0]+", "+FIN[f2].k.toLowerCase()).slice(0,32)}
    return {item,stars:I.stars,title,desc:(I.any?"Любая карточка в игре: "+title:I.d.map(x=>x.replace(/<[^>]+>/g,"")).join(", ")),data}}
  if(item==="num"){const sn=checkSn(p.sn),c=await env.DB.prepare("SELECT id,h,sn FROM cards WHERE id=? AND owner=?").bind(Math.floor(+p.card||0),uid).first();if(!c)fail("Карточка не найдена");
    if(c.sn===sn)fail("У этой карточки уже такой номер");
    if(await env.DB.prepare("SELECT 1 FROM cards WHERE sn=?").bind(sn).first())fail("Номер "+fmtSn(sn)+" уже занят. Выбери другой");
    return {item,stars:numPrice(sn),title:"Номер "+fmtSn(sn),desc:"Свой номер "+fmtSn(sn)+" на карточке «"+HEROES[c.h][0]+"»",data:{card:c.id,sn}}}
  if(item==="gift"){const k=String(p.k||""),G=GIFTS[k];if(!G||!G.stars)fail("Этот подарок не продаётся за звёзды");
    if(((await giftLeft(env))[k]||0)<=0)fail("Тираж «"+G.n+"» закончился");
    return {item,stars:G.stars,title:"Подарок «"+G.n+"»",desc:"Подарок «"+G.n+"» ("+GR[G.r].toLowerCase()+", тираж "+G.run+"). Поставь на витрину или подари другу",data:{k}}}
  if(item==="vip"){const t=Math.max(1,Math.min(3,p.t|0)),V=VIP_T[t];return {item,stars:V.stars,title:V.n+" · "+V.days+" дн.",desc:V.ic+" "+V.n+" на "+V.days+" дней: "+V.sp+" прокруток каждые 4 часа вместо "+SPINS_MAX+", +"+V.ex+" пакетов обмена рун в день, "+VIP_CAP+" мест в коллекции, корона у ника",data:{t}}}
  if(item==="pass"){const now=Date.now(),sn=passSeason(now),u=await env.DB.prepare("SELECT state FROM users WHERE id=?").bind(uid).first();let st={};try{st=JSON.parse((u&&u.state)||"{}")}catch(e){}
    if(st.pass&&st.pass.s===sn&&st.pass.prem===sn)fail("Пропуск этого сезона уже твой");if(passEnd(sn)-now<36e5)fail("Сезон вот-вот закончится — купи пропуск следующего");
    const T=passTheme(sn);return {item,stars:PASS.stars,title:"Пропуск: "+T.n,desc:T.ic+" Боевой пропуск «"+T.n+"»: награды всех 30 уровней — прокрутки, руны, монеты, эпическая и 2 легендарные карточки, титул и рамка сезона",data:{s:sn}}}
  if(item==="slots"){const u=await env.DB.prepare("SELECT state FROM users WHERE id=?").bind(uid).first();let st={};try{st=JSON.parse((u&&u.state)||"{}")}catch(e){}
    if((st.capS||0)>=SLOT_STAR.max)fail("Больше расширять нельзя: у тебя уже максимум места");
    return {item,stars:SLOT_STAR.stars,title:"+"+SLOT_STAR.n+" мест в коллекции",desc:"📦 +"+SLOT_STAR.n+" мест для карточек в коллекции «Воинов Эпох» навсегда. Покупать можно сколько угодно раз",data:{}}}
  if(item==="dg"){const k=String(p.k||""),K=DG_CHEST[k],X=DG_SHOP[k];if(!(K&&K.stars)&&!X)fail("Нет такого товара");
    const u=await env.DB.prepare("SELECT state FROM users WHERE id=?").bind(uid).first();let st={};try{st=JSON.parse((u&&u.state)||"{}")}catch(e){}if(!st.dg)fail("Сначала нужен дракон");
    if(K&&(st.dg.inv||[]).length>=DG.invMax)fail("Сумка дракона полная. Разбери лишнее на чешую");
    const t=K?K.n:X.n;return {item,stars:K?K.stars:X.stars,title:("🐉 "+t).slice(0,32),desc:K?"Снаряжение для дракона: "+DG_R[K.p.findIndex(x=>x>0)].n.toLowerCase()+" и выше"+(k==="div"?", шанс 10% на божественное":"")+" + "+K.bonus+" чешуи":k==="apple"?"3 золотых яблока: +2 500 опыта дракону каждое":"Ритуал перерождения: новая порода дракона — редкая или выше",data:{k}}}
  if(item==="dgskin"){const k=String(p.k||""),K=DG_SKIN[k];if(!K)fail("Нет такого облика");if(K.until&&Date.now()>K.until)fail("Облик «"+K.n+"» больше не продаётся");
    const u=await env.DB.prepare("SELECT state FROM users WHERE id=?").bind(uid).first();let st={};try{st=JSON.parse((u&&u.state)||"{}")}catch(e){}if(!st.dg)fail("Сначала нужен дракон");if((st.dg.skins||[]).includes(k))fail("Этот облик уже твой");
    return {item,stars:K.stars,title:("🐉 Облик «"+K.n+"»").slice(0,32),desc:K.ic+" Облик дракона «"+K.n+"» навсегда: "+K.d,data:{k}}}
  if(item==="title"){const k=String(p.k||""),T=TITLES[k];if(!T||!T.stars)fail("Нет такого титула");
    const u=await env.DB.prepare("SELECT state FROM users WHERE id=?").bind(uid).first();let own=[];try{own=JSON.parse(u&&u.state||"{}").titles||[]}catch(e){}if(own.includes(k))fail("Этот титул уже твой");
    if(T.month&&await titleLeft(env,k,except)<=0)fail("Места «"+T.n+"» на этот месяц закончились. Новые — 1-го числа");
    return {item,stars:T.stars,title:"Титул «"+T.n+"»",desc:k==="author"?"✍️ Соавтор игры: титул навсегда + твою идею добавим в «Воинов Эпох» (в пределах разумного). Не получится реализовать — вернём звёзды":T.ic+" Титул «"+T.n+"» рядом с ником навсегда: в топах, чате, лагере и на арене",data:{k}}}
  if(item==="cos"){const t=p.t==="pbg"?"pbg":"dfx",L=t==="pbg"?PBG:DFX,k=String(p.k||""),K=L[k];if(!K)fail("Нет такого");
    const u=await env.DB.prepare("SELECT state FROM users WHERE id=?").bind(uid).first();let st={};try{st=JSON.parse((u&&u.state)||"{}")}catch(e){}if((st[t]||[]).includes(k))fail("Уже твоё");
    return {item,stars:K.stars,title:(K.ic+" "+(t==="pbg"?"Фон":"Анимация")+" «"+K.n+"»").slice(0,32),desc:t==="pbg"?"Анимированный фон «"+K.n+"» твоего профиля и витрины навсегда — его видят все, кто к тебе заходит":"Своя анимация выпадения карточки «"+K.n+"» навсегда: каждый раз, когда ты открываешь карточку",data:{t,k}}}
  if(item==="present"){const w=String(p.w||""),W=PRESENT[w];if(!W)fail("Такое подарить нельзя");const to=await trUser(env,p);if(!to)fail("Игрок с таким ником не найден");if(to.id===uid)fail("Себе подарить нельзя — купи обычным способом");
    const u=await env.DB.prepare("SELECT state FROM users WHERE id=?").bind(to.id).first();let st={};try{st=JSON.parse((u&&u.state)||"{}")}catch(e){}
    let stars;if(w==="vip")stars=VIP_T[1].stars;else if(SHOP[w])stars=SHOP[w].stars;else{const [c,k]=w.split(":"),L=c==="t"?TITLES:c==="d"?DFX:PBG,own=c==="t"?st.titles:c==="d"?st.dfx:st.pbg;if((own||[]).includes(k))fail("У "+to.name+" это уже есть — выбери другой подарок");stars=L[k].stars}
    return {item,stars,title:("🎁 "+W.n+" для "+to.name).slice(0,32),desc:"Подарок игроку "+to.name+": "+W.ic+" "+W.n+". Он получит его сразу и узнает, что это от тебя",data:{to:to.id,w,tn:to.name}}}
  if(item==="mflag"){const k=String(p.k||""),F=MFLAG[k];if(!F||!F.stars)fail("Нет такого флага");const u=await env.DB.prepare("SELECT state FROM users WHERE id=?").bind(uid).first();let st={};try{st=JSON.parse((u&&u.state)||"{}")}catch(e){}
    if((st.mflags||[]).includes(k))fail("Этот флаг уже твой");return {item,stars:F.stars,title:F.ic+" "+F.n,desc:F.n+" над твоими регионами на карте мира — навсегда"+(k==="photo"?". Фото проходит проверку модератором":""),data:{k}}}
  if(item==="eshop"){const u=await env.DB.prepare("SELECT state FROM users WHERE id=?").bind(uid).first();let st={};try{st=JSON.parse((u&&u.state)||"{}")}catch(e){}const k=String(p.k||""),v=String(p.v||"");eshopCheck(st,k,v,Date.now());const I=ESHOP[k];
    return {item,stars:I.stars,title:I.ic+" "+I.n,desc:I.d.replace(/<[^>]+>/g,""),data:{k,v}}}
  if(item==="mpack"){const u=await env.DB.prepare("SELECT state FROM users WHERE id=?").bind(uid).first();let st={};try{st=JSON.parse((u&&u.state)||"{}")}catch(e){}const A=mapAtt(st,Date.now());
    if(A.packs>=MAP.packMax)fail("Сегодня больше нельзя — максимум "+MAP.packMax+" пакета в день");return {item,stars:MAP.packStars,title:"⚔️ +"+MAP.pack+" атаки",desc:"+"+MAP.pack+" атаки на карте мира сегодня",data:{}}}
  if(item==="mpass"){const u=await env.DB.prepare("SELECT state FROM users WHERE id=?").bind(uid).first();let st={};try{st=JSON.parse((u&&u.state)||"{}")}catch(e){}if(mapPass(st,Date.now()).prem)fail("Пропуск этого месяца уже твой");
    return {item,stars:MPASS.stars,title:"🎖 Пропуск завоевателя",desc:"Премиум-награды карты мира на весь месяц: прокрутки, руны, гарантированный эпик, легендарная карточка и «Флаг завоевателя»",data:{m:mapMon(Date.now())}}}
  if(item==="mstatue"){const rid=p.rid|0,r=await env.DB.prepare("SELECT statue FROM map_reg WHERE id=? AND owner=?").bind(rid,uid).first();if(!r)fail("Статую можно поставить только в своём регионе");if(r.statue)fail("Статуя здесь уже стоит");
    return {item,stars:MAP.statue,title:"🗿 Статуя: "+MAP_R[rid][0],desc:"Статуя твоего воина в регионе «"+MAP_R[rid][0]+"» — её видят все на карте, пока ты держишь регион",data:{rid}}}
  if(item==="bal"){const n=Math.floor(+p.n||0);if(!(n>=50&&n<=2500))fail("Сумма — от 50 до 2500 ⭐");const x=await x2Left(env,uid),b=Math.min(n,x),bn=await bonLeft(env,uid,n);
    return {item,stars:n,title:"⭐ Пополнение баланса",desc:"+"+n+" ⭐ на игровой баланс «Воинов Эпох»"+(b?" и ещё +"+b+" ⭐ бонусом по промокоду (x2)":"")+(bn?" и +"+bn+" ⭐ в подарок по промокоду":"")+". Тратятся на любые покупки в игре",data:{n}}}
  if(item==="support"){const n=Math.floor(+p.n||0);if(!(n>=SUP.min&&n<=SUP.max))fail("Сумма — от "+SUP.min+" до "+SUP.max+" ⭐");
    return {item,stars:n,title:"❤️ Поддержка проекта",desc:"Спасибо, что поддерживаешь «Воинов Эпох»! Звёзды идут на развитие игры: новых воинов, события и сервер. От "+SUP.title+" ⭐ — титул «Меценат» ❤️",data:{}}}
  if(item==="sday"){const d=await sdayFree(env,Date.now());if(!d)fail("Все дни на 2 месяца вперёд заняты");return {item,stars:SDAY.stars,title:"🌟 Звезда дня",desc:"Твой ник и самая дорогая карточка весь день на главной у всех игроков. Ближайший свободный день: "+d.split("-").reverse().join("."),data:{}}}
  if(item==="golem"){const f=p.forever?1:0;return {item,stars:f?GOLEM.f:GOLEM.w,title:"Каменный голем",desc:"Голем в лагере "+(f?"навсегда":"на "+GOLEM.days+" дней")+": энергии в 2 раза больше и она восстанавливается в 2 раза быстрее",data:{forever:f}}}
  if(item==="fx"){const k=String(p.fx||"");if(!NFX[k])fail("Нет такого эффекта");const f=p.forever?1:0;
    return {item,stars:f?NFX_PRICE.f:NFX_PRICE.m,title:"Ник «"+NFX[k]+"»",desc:"Переливающийся ник «"+NFX[k]+"» "+(f?"навсегда":"на "+NFX_DAYS+" дней")+": в топах, чате, лагере и на арене",data:{fx:k,forever:f}}}
  fail("Нет такого товара")}
/* титулы за ⭐ с лимитом в месяц (Соавтор) и очередь «Звезды дня» */
async function titleLeft(env,k,except){const T=TITLES[k],now=Date.now();if(!T.month)return 1e9;
  const n=((await env.DB.prepare("SELECT COUNT(*) AS n FROM payments WHERE item='title' AND json_extract(p,'$.k')=? AND month=? AND id<>? AND (status IN ('paid','done') OR (status='new' AND created>?))").bind(k,monthOf(now),except||0,now-PAY_HOLD).first())||{}).n||0;return Math.max(0,T.month-n)}
async function sdayFree(env,now){const L=new Set((await env.DB.prepare("SELECT d FROM sday WHERE d>=?").bind(dayOf(now)).all()).results.map(r=>r.d));
  for(let i=0;i<SDAY.ahead;i++){const d=dayOf(now+i*864e5);if(!L.has(d))return d}return null}
async function sdayNow(env){return cached("sday",60e3,async()=>{const r=await env.DB.prepare("SELECT s.uid,COALESCE(u.nick,u.name) AS name FROM sday s JOIN users u ON u.id=s.uid WHERE s.d=?").bind(dayOf(Date.now())).first();if(!r)return null;
  const c=await env.DB.prepare("SELECT * FROM cards WHERE owner=? ORDER BY v DESC LIMIT 1").bind(r.uid).first();return {uid:r.uid,name:r.name||"Игрок",card:c?pub(rowToCard(c)):null}})}
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
  const bal=String(P.charge||"")==="bal";
  if(bal)await env.DB.prepare("UPDATE users SET star_bal=star_bal+? WHERE id=?").bind(P.stars,P.uid).run();
  else if(!/^sim/.test(String(P.charge||"")))await tgApi(env,"refundStarPayment",{user_id:P.uid,telegram_payment_charge_id:P.charge});
  await env.DB.prepare("UPDATE payments SET status='refund',res=? WHERE id=?").bind(JSON.stringify({err:msg}),P.id).run();
  await notify(env,P.uid,"↩️ "+msg+"\n\nЗвёзды ("+P.stars+" ⭐) вернулись "+(bal?"на игровой баланс.":"на твой счёт."),"🏪 Сокровищница",PAGE+"?shop=1")}
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
      if(I.promo){const B=PROMO_BOX[pick(PROMO_BOX.map(x=>x.w))];let code="";for(let i=0;i<20;i++){const b=new Uint32Array(1);crypto.getRandomValues(b);code="ЭПОХ"+String(b[0]%1e6).padStart(6,"0");if(!(await env.DB.prepare("SELECT 1 FROM promo WHERE code=?").bind(code).first()))break}
        await env.DB.prepare("INSERT INTO promo(code,sp,cash,mx,until,created,off,x2,bon,bmin) VALUES(?,?,0,1,?,?,0,0,?,?)").bind(code,B.sp||0,Date.now()+14*864e5,Date.now(),B.bon||0,B.bmin||0).run();
        const what=B.sp?"+"+B.sp+" прокруток":"+"+B.bon+" ⭐ к пополнению от "+B.bmin+" ⭐";res.promo={code,what,big:B.bon>=300||B.sp>=20?1:0};
        if(B.bon>=1000)try{await hypeAdd(env,P.uid,"🎟 выбил промокод на +1000 ⭐ из сундука!",1)}catch(e){}
        try{await notify(env,P.uid,"🎟 Твой промокод из сундука: "+code+"\n\nВнутри: "+what+". Действует 14 дней, активировать может 1 человек — себе или другу 🎁","🎟 Ввести код",PAGE+"?promo=1")}catch(e){}}
      msg="🎁 «"+I.n+"» открыт! "+(res.promo?"🎟 Промокод "+res.promo.code+" ("+res.promo.what+") — он же пришёл тебе в бот. ":"")+(res.cards&&res.cards.length?"Внутри "+res.cards.length+" "+(res.cards.some(c=>c.part)?"карточек и половинок":"карточек")+", ":"")+(res.sp?"+"+res.sp+" прокруток. ":"")+"Всё уже в игре."}
    else if(P.item==="num"){const c=await env.DB.prepare("SELECT id,sn FROM cards WHERE id=? AND owner=?").bind(d.card,P.uid).first();if(!c)fail("Карточка больше не у тебя, номер не поставлен");
      let r;try{r=await env.DB.prepare("UPDATE cards SET sn=?,nice=2 WHERE id=? AND owner=?").bind(d.sn,c.id,P.uid).run()}catch(e){if(/UNIQUE/i.test(String(e&&e.message||e)))fail("Номер "+fmtSn(d.sn)+" успели занять");throw e}
      if(r.meta.changes!==1)fail("Карточка больше не у тебя, номер не поставлен");res={card:c.id,sn:d.sn,old:c.sn};msg="✍️ Готово! Теперь у твоей карточки номер "+fmtSn(d.sn)+"."}
    else if(P.item==="gift"){const g=await giftMint(env,P.uid,d.k,"star");if(!g)fail("Тираж «"+GIFTS[d.k].n+"» закончился на секунду раньше");
      res={gift:g};msg="🎁 Подарок «"+GIFTS[d.k].n+"» № "+g.no+" из "+GIFTS[d.k].run+" твой! Поставь его на витрину или подари другу."}
    else if(P.item==="vip"){const now=Date.now(),V=VIP_T[d.t],u=await env.DB.prepare("SELECT vip_until,vip_t FROM users WHERE id=?").bind(P.uid).first()||{};
      const act=(u.vip_until||0)>now,until=Math.max(now,u.vip_until||0)+V.days*864e5,t=act?Math.max(u.vip_t||1,d.t):d.t;
      await env.DB.prepare("UPDATE users SET vip_until=?,vip_t=? WHERE id=?").bind(until,t,P.uid).run();
      res={until,t};msg=VIP_T[t].ic+" "+VIP_T[t].n+" до "+new Date(until+TZ).toISOString().slice(0,10).split("-").reverse().join(".")+"! Теперь "+VIP_T[t].sp+" прокруток каждые 4 часа."}
    else if(P.item==="pass"){const u=await env.DB.prepare("SELECT name FROM users WHERE id=?").bind(P.uid).first();if(!u)fail("Игрок не найден");
      res=(await doAction(env,{id:P.uid,name:u.name||"Игрок"},"pass_grant",{s:d.s},{grant:true})).res;delete res.events;msg="🎖 Боевой пропуск «"+passTheme(d.s).n+"» открыт! Забирай награды всех пройденных уровней во вкладке «Пропуск»."}
    else if(P.item==="dg"){const u=await env.DB.prepare("SELECT name FROM users WHERE id=?").bind(P.uid).first();if(!u)fail("Игрок не найден");
      res=(await doAction(env,{id:P.uid,name:u.name||"Игрок"},"dg_grant",{k:d.k,pid:P.id},{grant:true})).res;delete res.events;
      msg=res.item?"🐉 "+DG_CHEST[d.k].n+": "+DG_R[res.item.r].n.toLowerCase()+" «"+dgItemName(res.item)+"» + "+res.sh+" чешуи!":d.k==="apple"?"🍏 Золотые яблоки уже у дракона!":"🔮 Ритуал совершён: твой дракон переродился — "+DG_BREED[res.b].n.toLowerCase()+"!"}
    else if(P.item==="slots"){const u=await env.DB.prepare("SELECT name FROM users WHERE id=?").bind(P.uid).first();if(!u)fail("Игрок не найден");
      res=(await doAction(env,{id:P.uid,name:u.name||"Игрок"},"slots_grant",{pid:P.id},{grant:true})).res;delete res.events;msg="📦 +"+SLOT_STAR.n+" мест в коллекции! Теперь влезает "+res.cap+" карточек."}
    else if(P.item==="dgskin"){const u=await env.DB.prepare("SELECT name FROM users WHERE id=?").bind(P.uid).first();if(!u)fail("Игрок не найден");
      res=(await doAction(env,{id:P.uid,name:u.name||"Игрок"},"dg_skin_grant",{k:d.k},{grant:true})).res;delete res.events;msg=DG_SKIN[d.k].ic+" Облик «"+DG_SKIN[d.k].n+"» надет на твоего дракона! Им можно похвастаться в топе драконов и на арене."}
    else if(P.item==="title"){const T=TITLES[d.k],u=await env.DB.prepare("SELECT name,COALESCE(nick,name) AS n FROM users WHERE id=?").bind(P.uid).first();if(!u)fail("Игрок не найден");
      res=(await doAction(env,{id:P.uid,name:u.name||"Игрок"},"title_grant",{k:d.k},{grant:true})).res;delete res.events;
      await env.DB.prepare("UPDATE users SET title=? WHERE id=?").bind(d.k,P.uid).run();delete topCache.nfx;
      if(d.k==="author"){msg="✍️ Ты — Соавтор «Воинов Эпох»! Титул уже рядом с ником.\n\nТеперь напиши @voinovadmin свою идею: новый воин, событие, режим, предмет — что угодно в пределах разумного. Если реализовать не получится, вернём звёзды.";
        for(const a of ADMINS)await notify(env,a,"✍️ КУПИЛИ «Соавтора» за "+T.stars+" ⭐! Игрок "+(u.n||"?")+" (id "+P.uid+"). Ему сказано написать идею в @voinovadmin.","⚔️ Открыть")}
      else msg=T.ic+" Титул «"+T.n+"» твой навсегда! Его видят все рядом с твоим ником."}
    else if(P.item==="cos"){const u=await env.DB.prepare("SELECT name FROM users WHERE id=?").bind(P.uid).first();if(!u)fail("Игрок не найден");
      res=(await doAction(env,{id:P.uid,name:u.name||"Игрок"},"cos_grant",{t:d.t,k:d.k},{grant:true})).res;delete res.events;const K=(d.t==="pbg"?PBG:DFX)[d.k];
      msg=K.ic+" "+(d.t==="pbg"?"Фон «"+K.n+"» уже на твоём профиле!":"Анимация «"+K.n+"» включена — открой карточку и посмотри!")}
    else if(P.item==="present"){const u=await env.DB.prepare("SELECT name FROM users WHERE id=?").bind(d.to).first(),me=await env.DB.prepare("SELECT COALESCE(nick,name) AS n FROM users WHERE id=?").bind(P.uid).first();if(!u)fail("Игрок не найден");
      const to={id:d.to,name:u.name||"Игрок"},w=d.w;
      if(w==="vip"){const now=Date.now(),V=VIP_T[1],x=await env.DB.prepare("SELECT vip_until,vip_t FROM users WHERE id=?").bind(d.to).first()||{};const until=Math.max(now,x.vip_until||0)+V.days*864e5;
        await env.DB.prepare("UPDATE users SET vip_until=?,vip_t=MAX(COALESCE(vip_t,1),1) WHERE id=?").bind(until,d.to).run()}
      else if(SHOP[w]){const r=(await doAction(env,to,"grant",{item:w,pid:P.id},{grant:true})).res}
      else{const [c,k]=w.split(":");if(c==="t"){await doAction(env,to,"title_grant",{k,keep:1},{grant:true});await env.DB.prepare("UPDATE users SET title=? WHERE id=? AND (title IS NULL OR title='')").bind(k,d.to).run();delete topCache.nfx}
        else await doAction(env,to,"cos_grant",{t:c==="d"?"dfx":"pbg",k},{grant:true})}
      const fn=(me&&me.n)||"Друг";await doAction(env,to,"present_note",{f:fn,w},{grant:true});const W=PRESENT[w];res={to:d.to,tn:d.tn,w};
      msg="🎁 Подарок отправлен! "+d.tn+" получил "+W.ic+" "+W.n+" и узнает, что это от тебя.";
      await notify(env,d.to,"🎁 "+fn+" подарил тебе "+W.ic+" "+W.n+"!\n\nПодарок уже в игре — заходи посмотреть.","🎁 Открыть подарок")}
    else if(P.item==="eshop"){const u=await env.DB.prepare("SELECT name,COALESCE(nick,name) AS n FROM users WHERE id=?").bind(P.uid).first();if(!u)fail("Игрок не найден");
      res=(await doAction(env,{id:P.uid,name:u.name||"Игрок"},"eshop_grant",{k:d.k,v:d.v},{grant:true})).res;delete res.events;const I=ESHOP[d.k];
      if(d.k==="fw")await hypeAdd(env,P.uid,"🎆 запустил салют в честь своей Империи!",1);
      if(d.k==="regsh")await env.DB.prepare("UPDATE map_reg SET shield=MAX(shield,?)+? WHERE owner=? OR owner2=?").bind(Date.now(),4*36e5,P.uid,P.uid).run();
      msg=I.ic+" «"+I.n+"» — готово!"+(d.k==="trib2"&&res.extra?" Дань уже была собрана — доплатили ещё +"+res.extra+" 🪙":"")}
    else if(P.item==="mflag"||P.item==="mpack"||P.item==="mpass"){const u=await env.DB.prepare("SELECT name FROM users WHERE id=?").bind(P.uid).first();if(!u)fail("Игрок не найден");
      res=(await doAction(env,{id:P.uid,name:u.name||"Игрок"},P.item==="mflag"?"mflag_grant":P.item==="mpack"?"mpack_grant":"mpass_grant",d,{grant:true})).res;delete res.events;
      msg=P.item==="mflag"?MFLAG[d.k].ic+" «"+MFLAG[d.k].n+"» поднят над твоими регионами!"+(d.k==="photo"?" Загрузи фото на карте мира — после проверки оно появится на флаге.":""):P.item==="mpack"?"⚔️ +"+MAP.pack+" атаки на карте мира — вперёд!":"🎖 Пропуск завоевателя активирован! Забирай премиум-награды на карте мира."}
    else if(P.item==="mstatue"){const r=await env.DB.prepare("UPDATE map_reg SET statue=1 WHERE id=? AND owner=?").bind(d.rid,P.uid).run();if(r.meta.changes!==1)fail("Регион уже не твой — статую поставить нельзя");res={rid:d.rid};msg="🗿 Статуя твоего воина стоит в регионе «"+MAP_R[d.rid][0]+"» — её видят все!"}
    else if(P.item==="bal"){const n=d.n|0,r=await env.DB.prepare("SELECT code,x2 FROM promo_uses WHERE uid=? AND x2>0 AND x2d=0 ORDER BY x2 DESC LIMIT 1").bind(P.uid).first();let b=0;
      if(r){b=Math.min(n,r.x2);await env.DB.prepare("UPDATE promo_uses SET x2d=1 WHERE code=? AND uid=?").bind(r.code,P.uid).run()}
      /* +N ⭐ сверху по промокоду: один раз, если пополнил до конца срока (оплата пришла чуть позже — всё равно засчитываем, срок проверяем по времени счёта) */
      const rb=await env.DB.prepare("SELECT code,bon FROM promo_uses WHERE uid=? AND bon>0 AND bon_until>? AND bmin<=? ORDER BY bon DESC LIMIT 1").bind(P.uid,Math.min(Date.now(),(P.t||P.created||Date.now())+36e5),n).first();
      if(rb){const u=await env.DB.prepare("UPDATE promo_uses SET bon=0 WHERE code=? AND uid=? AND bon>0").bind(rb.code,P.uid).run();if(u.meta&&u.meta.changes===1)b+=rb.bon}
      await env.DB.prepare("UPDATE users SET star_bal=star_bal+? WHERE id=?").bind(n+b,P.uid).run();res={n,b};
      msg="⭐ Баланс пополнен: +"+n+" ⭐"+(b?" и +"+b+" ⭐ в подарок по промокоду — итого "+(n+b)+" ⭐!":"!")+"\n\nТрать на любые покупки в игре — при оплате выбирай «Оплатить с баланса»."}
    else if(P.item==="support"){const u=await env.DB.prepare("SELECT name,COALESCE(nick,name) AS n FROM users WHERE id=?").bind(P.uid).first();if(!u)fail("Игрок не найден");
      const tot=(((await env.DB.prepare("SELECT SUM(stars) AS s FROM payments WHERE uid=? AND item='support' AND (status='done' OR id=?)").bind(P.uid,P.id).first())||{}).s)||0;let ttl=0;
      if(tot>=SUP.title){const g=(await doAction(env,{id:P.uid,name:u.name||"Игрок"},"title_grant",{k:"patron",keep:1},{grant:true})).res;ttl=g.newT?1:0;
        await env.DB.prepare("UPDATE users SET title=? WHERE id=? AND (title IS NULL OR title='')").bind("patron",P.uid).run();delete topCache.nfx}
      res={n:P.stars,tot,ttl};msg="❤️ Спасибо за поддержку — "+P.stars+" ⭐! Это правда помогает игре расти."+(ttl?"\n\nТеперь у тебя титул «Меценат» ❤️ — надеть его можно в «Титулах».":"");
      for(const a of ADMINS)await notify(env,a,"❤️ Поддержка проекта: "+P.stars+" ⭐ от "+(u.n||"?")+" (id "+P.uid+")","⚔️ Открыть")}
    else if(P.item==="sday"){let day=null;for(let i=0;i<3&&!day;i++){const f=await sdayFree(env,Date.now());if(!f)break;try{await env.DB.prepare("INSERT INTO sday(d,uid,pid,t) VALUES(?,?,?,?)").bind(f,P.uid,P.id,Date.now()).run();day=f}catch(e){}}
      if(!day)fail("Все дни на 2 месяца вперёд заняты");delete topCache.sday;res={d:day};const today=day===dayOf(Date.now());
      msg="🌟 Ты — Звезда дня "+(today?"прямо сейчас":day.split("-").reverse().join("."))+"! Весь день твой ник и самая дорогая карточка будут на главной у всех игроков."}
    else if(P.item==="golem"){const now=Date.now(),u=await env.DB.prepare("SELECT golem_until FROM users WHERE id=?").bind(P.uid).first()||{};
      const until=d.forever?9e15:Math.max(now,u.golem_until||0)+GOLEM.days*864e5;await env.DB.prepare("UPDATE users SET golem_until=MAX(golem_until,?) WHERE id=?").bind(until,P.uid).run();
      res={until};msg="🗿 Каменный голем в лагере "+(d.forever?"навсегда":"до "+new Date(until+TZ).toISOString().slice(0,10).split("-").reverse().join("."))+"! Энергии ×2 и восстанавливается в 2 раза быстрее."}
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
async function donors(env){return cached("donors",30e3,async()=>(await env.DB.prepare("SELECT p.uid,SUM(p.stars) AS s,COALESCE(u.nick,u.name) AS name FROM payments p JOIN users u ON u.id=p.uid WHERE p.month=? AND p.status='done' AND COALESCE(p.charge,'')<>'bal' GROUP BY p.uid ORDER BY s DESC LIMIT 13").bind(monthOf(Date.now())).all()).results.filter(r=>!isAdmin(env,r.uid)).slice(0,10))}
async function nickFx(env){return cached("nfx",30e3,async()=>{const fx={};
  for(const r of (await env.DB.prepare("SELECT id,fx FROM users WHERE fx_until>? AND fx IS NOT NULL").bind(Date.now()).all()).results)fx[r.id]=r.fx;
  const ttl={};for(const r of (await env.DB.prepare("SELECT id,title FROM users WHERE title IS NOT NULL AND title<>'' LIMIT 1000").all()).results)ttl[r.id]=r.title;
  const d=await donors(env);return {nfx:fx,king:d.length?d[0].uid:0,ttl}})}
async function shopInfo(env,me){
  const comp=await cached("shopcomp",10e3,async()=>{const o={};for(const h of COMP)o[h]={l:0,r:0,full:0,e:[0,0,0]};
    for(const r of (await env.DB.prepare("SELECT h,f,part,COUNT(*) AS n FROM cards WHERE h>=? GROUP BY h,f,part").bind(NBASE).all()).results){const x=o[r.h];if(!x)continue;
      if(r.f===4)x.e[r.part|0]=1;else if(r.part===1)x.l+=r.n;else if(r.part===2)x.r+=r.n;else x.full+=r.n}return o});
  const mine=((await env.DB.prepare("SELECT SUM(stars) AS s FROM payments WHERE uid=? AND month=? AND status='done' AND COALESCE(charge,'')<>'bal'").bind(me.id,monthOf(Date.now())).first())||{}).s||0;
  const u=await env.DB.prepare("SELECT fx,fx_until FROM users WHERE id=?").bind(me.id).first()||{};
  const ones=await cached("shopones",10e3,async()=>{const o={};for(const h of ONE)o[h]=null;
    for(const r of (await env.DB.prepare("SELECT c.h,COALESCE(u.nick,u.name) AS name,c.owner FROM cards c LEFT JOIN users u ON u.id=c.owner WHERE c.f=4 AND c.h>=?").bind(NBASE).all()).results)if(ONE.includes(r.h))o[r.h]={name:r.name||"Игрок",uid:r.owner};return o});
  const duos=await cached("shopduos",10e3,async()=>{const o={};for(const h of DUO)o[h]=0;for(const r of (await env.DB.prepare("SELECT h,COUNT(*) AS n FROM cards WHERE f=? GROUP BY h").bind(DUO_F).all()).results)if(o[r.h]!=null)o[r.h]=r.n;return o});
  const dia=await cached("shopdia",8e3,async()=>{const o={};for(const h in DIA)o[h]=DIA[h].run;
    for(const r of (await env.DB.prepare("SELECT h,COUNT(*) AS n FROM cards WHERE f=? GROUP BY h").bind(DIA_F).all()).results)if(o[r.h]!=null)o[r.h]=Math.max(0,DIA[r.h].run-r.n);return o});
  return {comp,ones,duos,dia,gleft:await giftLeft(env),mythLeft:await mythLeft(env),donors:await donors(env),mine,authLeft:await titleLeft(env,"author"),sdayNext:await sdayFree(env,Date.now()),fx:u.fx_until>Date.now()?u.fx:null,fxUntil:u.fx_until||0}}
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
  if(cmd==="/start"&&arg&&/^(r_\d+|s_[A-Za-z0-9_-]{1,32})$/.test(arg)){await createUser(env,{id:m.from.id,name,start:arg});await trackSrc(env,{id:m.from.id,start:arg})}
  if(cmd==="/start"&&arg&&/^a_[A-Za-z0-9_-]{1,32}$/.test(arg))await adStart(env,m.from.id,arg.slice(2));   // рекламная ссылка: считаем «Старт»   // приглашение по ссылке ?start=r_<id>
  if(cmd==="/stop"){try{await env.DB.prepare("UPDATE users SET pm=0 WHERE id=?").bind(m.from.id).run()}catch(e){}
    return tgApi(env,"sendMessage",{chat_id:m.chat.id,text:"🔕 Уведомления выключены. Чтобы включить их снова, напиши /start"})}
  if(cmd==="/terms")return tgApi(env,"sendMessage",{chat_id:m.chat.id,text:"📜 Пользовательское соглашение и политика конфиденциальности: "+PAGE+"terms.html"});
  try{await env.DB.prepare("UPDATE users SET pm=1 WHERE id=?").bind(m.from.id).run()}catch(e){}   // написал боту: можно присылать напоминания
  if(cmd==="/invite"){
    const link="https://t.me/"+(env.BOT_USERNAME||"VoinyEpohBot")+"?startapp=r_"+m.from.id;
    return tgApi(env,"sendMessage",{chat_id:m.chat.id,text:"Твоя ссылка для друзей:\n"+link+"\n\nЗа каждого нового игрока, который зайдёт по ней, ты получишь +10 прокруток 🎁",
      reply_markup:{inline_keyboard:[[{text:"📤 Отправить другу",url:"https://t.me/share/url?url="+encodeURIComponent(link)+"&text="+encodeURIComponent("Залетай в «Воины Эпох»: крути карточки воинов и собирай легенды!")}]]}})}
  if(cmd==="/help")return tgApi(env,"sendMessage",{chat_id:m.chat.id,text:"Как играть:\n\n🎴 Жми «Играть» и открывай карточки. 10 бесплатных прокруток каждые 4 часа\n💎 Редкость, отделка и номер решают цену. Красивые номера (777 777, 000 001) стоят дороже\n🔥 Закаляй воинов до ★5 и качай уровень в боях и походах\n🛒 Продавай и покупай карточки на рынке у других игроков\n🏆 Смотри своё место в топе мира\n\n🎁 +10 прокруток за подписку на "+CHANNEL+" и за каждого друга (/invite)\n\n🐞 Нашёл баг или есть вопрос? Пиши @voinovadmin",reply_markup:play("⚔️ Играть")});
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
const CHAL_PREV={id:"2026-10-31",story:1,fr:2,gift:"dragon_x",start:Date.UTC(2026,9,31,9,0),end:Date.UTC(2026,10,1,19,0),resAt:Date.UTC(2026,10,1,19,0),prizes:["NFT-подарок «Дракончик» · ошибка печати","200 ⭐","100 ⭐"],bal:[0,200,100],img:"assets/post-nft.jpg?v=1",storyImg:"assets/story-contest.jpg?v=2",slots:[12,15,18,20,21],chanSlots:[12,16,20.5],chan:"@voinyepoh"};
/* розыгрыш 02–03.11 (прошёл): каждый друг = билет, $15/$8/100 ⭐ */
const CHAL_BIG={id:"2026-11-02",lot:1,big:1,noL2:1,min:1,start:Date.UTC(2026,10,1,21,1),end:Date.UTC(2026,10,3,19,0),prizes:["$15","$8","100 ⭐"],
  pnote:["на баланс в игре + карточка, которую сделаем специально для тебя, с твоей подписью ✍️","на баланс в игре + 10 прокруток","на баланс в игре + 5 прокруток"],usd:[750,400,100],sp:[0,10,5],
  img:"assets/post-big.jpg?v=1",slots:[8,10,13,17,20,21],chanSlots:[8,10,13,17,20,21],lastOnly:21,chan:"@voinyepoh"};
/* 💎 розыгрыш сундуков 04–05.11: каждый друг = билет, видео в TikTok с игрой = +1 билет (после проверки). Три победителя получают сундуки */
const LCH=[{k:"emperor",n:"Сундук Императора",ic:"💎",usd:"$40",items:[{shop:"mythic"},{shop:"legend"},{shop:"royal"},{vip:2,days:30},{mpass:1}],
    d:["🐉 Мифический сундук — гарантированный мифический воин + легенда","⭐ Легендарный сундук — 10 карточек, легенда внутри","👑 Королевский сундук — 60 прокруток и 6 половинок","👑 VIP Золото на 30 дней","🎖 Премиум-пропуск завоевателя"]},
  {k:"general",n:"Сундук Полководца",ic:"🏆",usd:"$20",items:[{shop:"legend"},{shop:"royal"},{vip:2,days:30},{shop:"warrior"},{shop:"small"}],
    d:["⭐ Легендарный сундук — 10 карточек, легенда внутри","👑 Королевский сундук — 60 прокруток и 6 половинок","👑 VIP Золото на 30 дней","⚔️ Сундук воина — 5 карточек, эпик внутри","🧩 Малый сундук — 10 прокруток + половинка"]},
  {k:"warrior",n:"Сундук Воина",ic:"🎁",usd:"$10",items:[{shop:"legend"},{shop:"warrior"},{shop:"small"},{vip:1,days:7}],
    d:["⭐ Легендарный сундук — 10 карточек, легенда внутри","⚔️ Сундук воина — 5 карточек, эпик внутри","🧩 Малый сундук — 10 прокруток + половинка","🥈 VIP Серебро на 7 дней"]}];
const CHAL_CH1={id:"2026-11-04",lot:1,chest:1,tt:1,noL2:1,min:1,start:Date.UTC(2026,10,3,22,30),end:Date.UTC(2026,10,5,19,0),prizes:LCH.map(c=>c.n),
  img:"assets/post-chest.jpg?v=1",slots:[8,10,13,17,20,21],chanSlots:[8,10,13,17,20,21],lastOnly:21,chan:"@voinyepoh"};
/* 💎 розыгрыш сундуков №2, 06–07.11: 5 мест — три сундука + 4 и 5 место по 100 ⭐ на баланс в игре */
const CHAL_DEFAULT={id:"2026-11-06",lot:1,chest:1,tt:1,noL2:1,min:1,start:Date.UTC(2026,10,5,21,1),end:Date.UTC(2026,10,7,19,0),prizes:LCH.map(c=>c.n).concat(["100 ⭐","100 ⭐"]),xbal:[0,0,0,100,100],
  img:"assets/post-chest2.jpg?v=1",slots:[8,10,13,17,20,21],chanSlots:[8,10,13,17,20,21],lastOnly:21,chan:"@voinyepoh"};
async function chestGive(env,uid,name,k,C){const X=LCH[k],me={id:uid,name:name||"Игрок"},got=[];let n=0;
  for(const it of X.items){n++;try{
    if(it.shop){const r=(await doAction(env,me,"grant",{item:it.shop,pid:"chest:"+C.id+":"+k+":"+n},{grant:true})).res||{};got.push(SHOP[it.shop].n+(r.cards&&r.cards.length?" ("+r.cards.length+" карт.)":""))}
    else if(it.vip){const now=Date.now(),u=await env.DB.prepare("SELECT vip_until,vip_t FROM users WHERE id=?").bind(uid).first()||{},act=(u.vip_until||0)>now,until=Math.max(now,u.vip_until||0)+it.days*864e5,t=act?Math.max(u.vip_t||1,it.vip):it.vip;
      await env.DB.prepare("UPDATE users SET vip_until=?,vip_t=? WHERE id=?").bind(until,t,uid).run();got.push(VIP_T[it.vip].n+" "+it.days+" дн.")}
    else if(it.mpass){await doAction(env,me,"mpass_grant",{},{grant:true});got.push("Премиум-пропуск завоевателя")}}catch(e){console.error("chest",k,it,e);got.push("⚠️ не выдано: "+JSON.stringify(it))}}
  return got}
/* розыгрыш 3 VIP 29–30.10: 2 друга — участник, каждый друг — билет, три победителя получают VIP Золото на 30 дней автоматически */
const VIPL="👑 3 победителя — каждому VIP на целый месяц:\n🎴 16 прокруток каждые 4 часа вместо 10\n💱 +3 обмена рун в день, 📦 360 мест для карточек\n👑 корона у ника в топах и чате";
const dmy=t=>{const d=new Date(t+TZ);return String(d.getUTCDate()).padStart(2,"0")+"."+String(d.getUTCMonth()+1).padStart(2,"0")};
const vDay=(C,now)=>mskDay(now)===mskDay(C.end)?"сегодня":"завтра";
function vipText(C,slot,rows,now){const last=slot===C.slots.length-1,lastDay=mskDay(now)===mskDay(C.end),hook=lotHook(C,rows),how="👥 Пригласи "+frA(C.min)+" — и ты в розыгрыше\n🎟 Каждый друг = 1 билет: больше друзей — больше шанс\n✅ Считаются живые друзья: пришли по твоей ссылке и открыли "+CHAL_OPEN+" карточки";
  if(slot===0&&!lastDay)return "👑 СТАРТ! РАЗЫГРЫВАЕМ 3 VIP НА МЕСЯЦ\n\n"+VIPL+"\n\nРозыгрыш идёт 2 дня — до "+dmy(C.end)+" в "+hmM(C.end)+":\n"+how+"\n\n🎁 VIP выдаётся победителям автоматически, сразу после итогов.\n\n"+LOT_PAID+"\n\nЖми «Пригласить» и отправляй ссылку 👇";
  if(slot===0)return "🔥 ПОСЛЕДНИЙ ДЕНЬ РОЗЫГРЫША 3 VIP!\n\nСегодня в "+hmM(C.end)+" бот выберет трёх победителей — каждому VIP на месяц 👑\n\n"+hook+"\n\n"+how+"\n\nЖми «Пригласить» 👇";
  if(last&&lastDay)return "⏰ ПОСЛЕДНИЙ ЧАС! В "+hmM(C.end)+" разыгрываем 3 VIP на месяц\n\n"+hook+"\n\nЕщё можно успеть позвать друзей — каждый друг = +1 билет 🔥";
  return "👑 Розыгрыш 3 VIP идёт — итоги "+vDay(C,now)+" в "+hmM(C.end)+" ("+fmtLeft(C.end-now)+")\n\n"+hook+"\n\n"+how+"\n\n"+VIPL}
function vipChan(C,k,now,rows){const bot="\n\n👉 @VoinyEpohBot",lastDay=mskDay(now)===mskDay(C.end),h=lotHook(C,rows||[]),last=k===C.chanSlots.length-1;
  if(k===0)return {photo:1,text:(lastDay?"🔥 ПОСЛЕДНИЙ ДЕНЬ! РОЗЫГРЫШ 3 VIP НА МЕСЯЦ":"👑 РОЗЫГРЫШ 3 VIP НА МЕСЯЦ — СТАРТ!")+"\n\n"+VIPL+"\n\n👥 Пригласи "+frA(C.min)+" в «Воины Эпох» — и ты в розыгрыше\n🎟 Каждый друг = 1 билет: больше друзей — больше шанс\n⏳ Итоги "+dmy(C.end)+" в "+hmM(C.end)+", VIP выдаётся автоматически\n\n"+h+"\n\n"+LOT_PAID+bot};
  if(last&&lastDay)return {text:"⏰ До розыгрыша 3 VIP осталось "+fmtLeft(C.end-now)+"!\n\n"+h+"\n\nВ "+hmM(C.end)+" бот случайно выберет трёх победителей по билетам. Успей позвать друзей 🔥"+bot};
  return {text:"👑 Розыгрыш 3 VIP на месяц идёт — итоги "+vDay(C,now)+" в "+hmM(C.end)+"\n\n"+h+"\n\n👥 "+frA(C.min)+" — и ты участник, каждый друг = +1 билет"+bot}}
/* секретный приз 25.10: бесценная карточка-коллаборация «Воины Эпох × Номерок» А777МР 77. До финала не раскрываем */
const SEC_LINE="🎁 Главный приз — СЕКРЕТ 🤫\n💰 Суммарно он стоит больше, чем все наши прошлые конкурсы — в районе $100\n🤝 Это подарок лично от игры «Номерок»";
const PZ=C=>C.secret?"СЕКРЕТНОГО ПРИЗА":C.multi?"600 ⭐":C.prizes[0], PZl=C=>C.secret?"секретного приза":C.multi?"600 ⭐":C.prizes[0];
/* розыгрыш с тремя победителями (звёзды на игровой баланс) */
const W1=C=>C.multi?"трёх победителей":"победителя";
const ML=C=>"🥇 "+C.prizes[0]+"   🥈 "+C.prizes[1]+"   🥉 "+C.prizes[2]+"\n🏆 Три победителя — выиграть может любой!";
const MNOTE="⭐ Звёзды зачисляются на игровой баланс — ими можно оплатить любые покупки в игре (VIP, пропуск, сундуки, подарки)";
async function chalCfg(env){return await cached("chalcfg",30e3,async()=>{const k=await kvGet(env,"chal");return k&&k.id>=CHAL_DEFAULT.id?k:CHAL_DEFAULT})}   // старый конкурс в kv не мешает новому
const tk=n=>n+" "+(n%10===1&&n%100!==11?"билет":n%10>=2&&n%10<=4&&(n%100<12||n%100>14)?"билета":"билетов");
const lotIn=(C,rows)=>rows.filter(r=>r.n>=C.min);
/* честный выбор победителя: случайное число по сумме билетов */
function lotDraw(C,rows){const P=lotIn(C,rows),T=P.reduce((a,r)=>a+r.n,0);if(!T)return null;const b=new Uint32Array(1);crypto.getRandomValues(b);let x=b[0]%T;for(const r of P){x-=r.n;if(x<0)return r}return P[P.length-1]}
/* несколько победителей: по очереди, без повторов, шанс по билетам */
function lotDrawN(C,rows,k){let P=lotIn(C,rows).slice();const out=[];for(let i=0;i<k&&P.length;i++){const W=lotDraw({min:0},P);if(!W)break;out.push(W);P=P.filter(r=>r.uid!==W.uid)}return out}
async function chalBoard(env,C){return await cached("chalb",20e3,async()=>{
  const q=(C.vip||C.big||C.chest?"COALESCE(json_extract(c.state,'$.nOp'),0)":"json_extract(c.state,'$.day.opened')")+">=? AND c.created>=? AND c.created<?";
  const d=(await env.DB.prepare("SELECT c.ref AS uid,COUNT(*) AS n FROM users c WHERE c.ref IS NOT NULL AND "+q+" GROUP BY c.ref").bind(CHAL_OPEN,C.start,C.end).all()).results;
  const l2=C.noL2?[]:(await env.DB.prepare("SELECT p.ref AS uid,COUNT(*) AS n FROM users c JOIN users p ON c.ref=p.id WHERE p.ref IS NOT NULL AND p.ref<>c.id AND "+q+" GROUP BY p.ref").bind(CHAL_OPEN,C.start,C.end).all()).results;
  const m=new Map();for(const r of d)m.set(r.uid,{uid:r.uid,d:r.n,l2:0,tt:0});for(const r of l2){const o=m.get(r.uid)||{uid:r.uid,d:0,l2:0,tt:0};o.l2=r.n;m.set(r.uid,o)}
  if(C.tt)for(const r of (await env.DB.prepare("SELECT uid FROM tt_sub WHERE contest=? AND st=1").bind(C.id).all()).results){const o=m.get(r.uid)||{uid:r.uid,d:0,l2:0,tt:0};o.tt=1;m.set(r.uid,o)}
  let rows=[...m.values()].filter(r=>!isAdmin(env,r.uid)).map(r=>(r.n=r.d+r.l2+(r.tt||0),r));
  // при равенстве выше тот, кто раньше набрал счёт: по времени регистрации последнего засчитанного друга
  if(rows.length){const ids=rows.map(r=>r.uid);const nm=new Map();
    for(let i=0;i<ids.length;i+=90){const part=ids.slice(i,i+90);
      for(const u of (await env.DB.prepare("SELECT u.id,COALESCE(u.nick,u.name) AS name,u.vip_until,(SELECT MAX(c.created) FROM users c LEFT JOIN users p ON c.ref=p.id WHERE (c.ref=u.id OR p.ref=u.id) AND c.created>=? AND c.created<?) AS last FROM users u WHERE u.id IN ("+part.map(()=>"?").join(",")+")").bind(C.start,C.end,...part).all()).results)nm.set(u.id,u)}
    rows=rows.map(r=>{const u=nm.get(r.uid)||{};return {...r,name:u.name||"Игрок",vip:(u.vip_until||0)>Date.now()?1:0,last:u.last||0}})}
  rows.sort((a,b)=>b.n-a.n||b.d-a.d||a.last-b.last);return rows})}
const chalPhase=(C,now)=>now<C.start?"soon":now<C.end?"on":"done";
async function chalGet(env,me){const C=await chalCfg(env),now=Date.now();if(C&&C.story)return storyGet(env,me,C,now);if(!C||now>=C.end)return null;   // конкурс закончился — блок с таблицей убираем
  const fin=now>=C.end?await kvGet(env,"chal_res:"+C.id):null,rows=fin?fin.rows:(now<C.start?[]:await chalBoard(env,C));
  const i=rows.findIndex(r=>r.uid===me.id),mine=i>=0?{...rows[i],place:i+1}:{d:0,l2:0,n:0,place:0};
  return {id:C.id,start:C.start,end:C.end,left:Math.max(0,(now<C.start?C.start:C.end)-now),phase:chalPhase(C,now),prizes:C.prizes,need:CHAL_OPEN,x2:now>=C.start&&now<C.end?1:0,
    top:rows.slice(0,10).map((r,k)=>({place:k+1,name:r.name,n:r.n,d:r.d,l2:r.l2,vip:r.vip,me:r.uid===me.id?1:0})),me:{n:mine.n,d:mine.d,l2:mine.l2,place:mine.place},total:rows.length,
    lot:C.lot?1:0,secret:C.secret?1:0,multi:C.multi?1:0,vip:C.vip?1:0,vipDays:C.vipDays||0,noL2:C.noL2?1:0,min:C.min||0,tickets:C.lot?lotIn(C,rows).reduce((a,r)=>a+r.n,0):0,players:C.lot?lotIn(C,rows).length:0,big:C.big||C.chest?1:0,pnote:C.pnote||null,chest:C.chest?1:0,chests:C.chest?LCH.map(x=>({n:x.n,ic:x.ic,usd:x.usd,d:x.d})):null,xbal:C.xbal||null,
    tt:C.tt?await ttMine(env,C,me.id):null}}
async function ttMine(env,C,uid){const r=await env.DB.prepare("SELECT url,st FROM tt_sub WHERE contest=? AND uid=?").bind(C.id,uid).first();return r?{url:r.url,st:r.st}:{st:-1}}
async function ttApi(env,me,a,p){const C=await chalCfg(env),now=Date.now();if(!C||!C.tt)fail("Сейчас нет конкурса с TikTok");
  if(a==="tt_send"){if(now<C.start||now>=C.end)fail("Конкурс сейчас не идёт");let url=String(p.url||"").trim().slice(0,300);
    if(!/^https?:\/\/([a-z0-9-]+\.)*tiktok\.com\/\S+$/i.test(url))fail("Нужна ссылка на видео в TikTok (tiktok.com/…)");
    const old=await env.DB.prepare("SELECT st FROM tt_sub WHERE contest=? AND uid=?").bind(C.id,me.id).first();if(old&&old.st===1)fail("Твоё видео уже засчитано — билет у тебя");if(old&&old.st===0)fail("Видео уже на проверке — подожди немного");
    await env.DB.prepare("INSERT INTO tt_sub(contest,uid,url,st,t) VALUES(?,?,?,0,?) ON CONFLICT(contest,uid) DO UPDATE SET url=excluded.url,st=0,t=excluded.t").bind(C.id,me.id,url,now).run();
    for(const ad of ADMINS)try{await notify(env,ad,"🎬 Новое видео в TikTok на проверку (игрок "+(me.nick||me.name||me.id)+", id "+me.id+"):\n"+url+"\n\nПроверь: Статистика → «TikTok-заявки».","⚔️ Открыть")}catch(e){}
    return {st:0,url}}
  if(!isAdmin(env,me.id))fail("Нет доступа");
  if(a==="tt_list")return {list:(await env.DB.prepare("SELECT s.uid,s.url,s.st,s.t,COALESCE(u.nick,u.name) AS name FROM tt_sub s LEFT JOIN users u ON u.id=s.uid WHERE s.contest=? ORDER BY s.st=0 DESC,s.t DESC LIMIT 100").bind(C.id).all()).results};
  const uid=+p.uid,r=await env.DB.prepare("SELECT st FROM tt_sub WHERE contest=? AND uid=?").bind(C.id,uid).first();if(!r)fail("Нет такой заявки");
  if(a==="tt_ok"){await env.DB.prepare("UPDATE tt_sub SET st=1 WHERE contest=? AND uid=?").bind(C.id,uid).run();delete topCache.chalb;
    try{await notify(env,uid,"🎬 Твоё видео в TikTok засчитано! +1 билет в розыгрыше сундуков 🎟\n\nА каждый друг, который придёт по твоей ссылке, — ещё +1 билет 🔥","🎟 Мои билеты")}catch(e){}return {ok:1}}
  if(a==="tt_no"){await env.DB.prepare("UPDATE tt_sub SET st=2 WHERE contest=? AND uid=?").bind(C.id,uid).run();
    try{await notify(env,uid,"🎬 Видео не засчитали: в нём должно быть видно игру «Воины Эпох», и оно должно быть открыто для всех. Сними новое и пришли ссылку ещё раз — билет будет твоим!","🎬 Прислать снова")}catch(e){}return {ok:1}}
  fail("Неизвестное действие")}
const fmtLeft=ms=>{const m=Math.max(0,Math.round(ms/60e3));return ((m>=60?Math.floor(m/60)+" ч ":"")+(m%60?(m%60)+" мин":"")).trim()||"0 мин"};
const hmM=t=>{const d=new Date(t+TZ);return d.getUTCHours()+":"+String(d.getUTCMinutes()).padStart(2,"0")};
const MEDAL=["🥇","🥈","🥉"],frN=n=>n+" "+(n%10===1&&n%100!==11?"друг":n%10>=2&&n%10<=4&&(n%100<12||n%100>14)?"друга":"друзей");
function chalPrizes(C){return MEDAL.map((m,k)=>m+" подарок Telegram на "+C.prizes[k]).join("\n")+"\nПриз можно забрать подарком или звёздами ⭐"}
const LOT_PAID="✅ Все призы прошлого конкурса мы выплатили — отзывы победителей можно посмотреть в чате.";
function lotHook(C,rows){const P=lotIn(C,rows),T=P.reduce((a,r)=>a+r.n,0);
  return P.length?"🎟 В розыгрыше уже "+P.length+" "+(P.length%10===1&&P.length%100!==11?"участник":P.length%10>=2&&P.length%10<=4&&(P.length%100<12||P.length%100>14)?"участника":"участников")+" и "+tk(T)+". Пригласи "+frA(C.min)+" — и ты в игре!":"🎟 В розыгрыше пока никого! Пригласи "+frA(C.min)+" — и шанс забрать "+(C.secret?"секретный приз":C.multi?"300 ⭐":C.prizes[0])+" почти 100%!"}
function lotText(C,slot,rows,now){const last=slot===C.slots.length-1,hook=lotHook(C,rows);
  if(slot===0&&C.secret)return "🔥 СТАРТ! САМЫЙ КРУПНЫЙ РОЗЫГРЫШ В ИСТОРИИ ИГРЫ\n\n"+SEC_LINE+"\n\nСегодня до "+hmM(C.end)+" зови друзей в «Воины Эпох»:\n👥 "+frA(C.min)+" — и ты участник\n🎟 Каждый друг = 1 билет. Больше друзей — больше шанс\n🏆 Победитель один — выиграть может любой!\n\n"+LOT_PAID+"\n\n"+CHAL_X2+"\n\nЖми «Пригласить» и отправляй ссылку 👇";
  if(slot===0&&C.multi)return "⭐ СТАРТ! РОЗЫГРЫШ 600 ЗВЁЗД — ТРИ ПОБЕДИТЕЛЯ\n\n"+ML(C)+"\n\nСегодня до "+hmM(C.end)+" зови друзей в «Воины Эпох»:\n👥 "+frA(C.min)+" — и ты участник\n🎟 Каждый друг = 1 билет. Чем больше друзей — тем больше шанс\n✅ Считаются только живые друзья, которые играют\n\n"+MNOTE+"\n\n"+LOT_PAID+"\n\n"+CHAL_X2+"\n\nЖми «Пригласить» и отправляй ссылку 👇";
  if(slot===0)return "🎟 СТАРТ! РОЗЫГРЫШ "+C.prizes[0]+" — ВЫИГРАТЬ МОЖЕТ ЛЮБОЙ\n\nСегодня до "+hmM(C.end)+" зови друзей в «Воины Эпох»:\n\n👥 "+frA(C.min)+" — и ты участник розыгрыша\n🎟 Каждый друг = 1 билет. Больше друзей — больше шанс\n🏆 Победитель один: подарок Telegram на "+C.prizes[0]+" или звёзды\n\nМы учли ваши пожелания: теперь не нужно обгонять лидера — повезти может каждому!\n\n"+LOT_PAID+"\n\n"+CHAL_X2+"\n\nЖми «Пригласить» и отправляй ссылку 👇";
  return (last?"⏰ ПОСЛЕДНИЙ ЧАС! До розыгрыша "+fmtLeft(C.end-now):"🎟 РОЗЫГРЫШ "+PZ(C)+" ИДЁТ — до конца "+fmtLeft(C.end-now))+"\n\n"+(C.secret?SEC_LINE+"\n\n":"")+hook+"\n\n🎟 Каждый друг = +1 билет. Друг твоего друга тоже считается!\n\n"+CHAL_X2+(C.multi?"\n\n"+ML(C):"")+"\n\nВ "+hmM(C.end)+" бот выберет "+W1(C)+" случайно по билетам 👇"}
/* ---------- большой розыгрыш: тексты для бота и канала ---------- */
const BIGP=C=>"🥇 "+C.prizes[0]+" на баланс в игре + карточка с твоей подписью ✍️\n🥈 "+C.prizes[1]+" на баланс + 10 прокруток\n🥉 "+C.prizes[2]+" на баланс + 5 прокруток";
const BIGHOW="👥 Пригласи друга в «Воины Эпох» — получи билет\n🎟 Каждый друг = +1 билет. 5 друзей — 5 билетов, 20 друзей — 20 билетов!\n📈 Больше билетов — больше шанс забрать $15\n✅ Друг считается, когда откроет "+CHAL_OPEN+" карточки";
const bigEnd=(C,now)=>(mskDay(now)===mskDay(C.end)?"сегодня в ":"завтра в ")+hmM(C.end);
function bigText(C,slot,rows,now){const last=C.slots[slot]===C.lastOnly,lastDay=mskDay(now)===mskDay(C.end),h=lotHook(C,rows);
  if(slot===0&&!lastDay)return "🔥 СТАРТ! РАЗЫГРЫВАЕМ $15, $8 И 100 ⭐\n\n"+BIGP(C)+"\n\n"+BIGHOW+"\n\n⏳ Итоги "+dmy(C.end)+" в "+hmM(C.end)+" — бот сам выберет 3 победителей по билетам\n\n"+LOT_PAID+"\n\nЖми «Мои билеты» и отправляй ссылку друзьям 👇";
  if(slot===0)return "⚡ ПОСЛЕДНИЙ ДЕНЬ РОЗЫГРЫША $15!\n\nСегодня в "+hmM(C.end)+" бот выберет трёх победителей:\n"+BIGP(C)+"\n\n"+h+"\n\n🎟 Каждый друг = +1 билет. Успей набрать побольше 👇";
  if(last)return "⏰ ПОСЛЕДНИЙ ЧАС! В "+hmM(C.end)+" разыгрываем $15, $8 и 100 ⭐\n\n"+h+"\n\nОдин друг прямо сейчас = ещё один билет. Последний шанс 🔥";
  const T=["","☀️ Розыгрыш $15 в разгаре!","🍀 Каждый друг — ещё один шанс на $15","🔥 До розыгрыша "+fmtLeft(C.end-now)+"!","🌙 Вечер — лучшее время звать друзей!"][slot]||"🎟 Розыгрыш $15 идёт!";
  return T+"\n\n"+h+"\n\n"+BIGP(C)+"\n\n🎟 Каждый друг = +1 билет · итоги "+bigEnd(C,now)}
function bigChan(C,k,now,rows){const bot="\n\n👉 @VoinyEpohBot",lastDay=mskDay(now)===mskDay(C.end),h=lotHook(C,rows||[]),last=C.chanSlots[k]===C.lastOnly;
  if(k===0)return {photo:1,text:(lastDay?"⚡ ПОСЛЕДНИЙ ДЕНЬ! РОЗЫГРЫШ $15, $8 И 100 ⭐":"🔥 РОЗЫГРЫШ $15, $8 И 100 ⭐ — СТАРТ!")+"\n\n"+BIGP(C)+"\n\n"+BIGHOW+"\n\n⏳ Итоги "+dmy(C.end)+" в "+hmM(C.end)+". Призы зачисляются автоматически\n\n"+h+"\n\n"+LOT_PAID+bot};
  if(last)return {text:"⏰ До розыгрыша $15 остался час!\n\n"+h+"\n\nВ "+hmM(C.end)+" бот случайно выберет трёх победителей по билетам. Позови ещё друга — это ещё один шанс 🔥"+bot};
  const T=["","☕ Доброе утро! Розыгрыш $15 идёт","⚡ Розыгрыш $15 в самом разгаре","🔥 До розыгрыша $15 — "+fmtLeft(C.end-now),"🌙 Вечер — зови друзей, пока все онлайн"][k]||"🎟 Розыгрыш $15 идёт";
  return {text:T+"\n\n"+h+"\n\n"+BIGP(C)+"\n\n🎟 Каждый приглашённый друг = 1 билет. Чем больше друзей — тем больше шанс\n⏳ Итоги "+bigEnd(C,now)+bot}}
/* ---------- конкурс историй: выложи историю с игрой в Telegram/Instagram, она должна провисеть 24 часа ---------- */
const STP=C=>"🥇 "+C.prizes[0]+(C.gift?" (подарок внутри игры, встаёт на витрину)":"")+"\n🥈 "+C.prizes[1]+" на игровой баланс\n🥉 "+C.prizes[2]+" на игровой баланс";
const stDay=(C,now)=>mskDay(now)===mskDay(C.end)?"сегодня":"завтра", stEnd=(C,now)=>(mskDay(now)===mskDay(C.end)?"сегодня до ":"до завтра, ")+hmM(C.end);
const ST_HOW=(C,now)=>(C.fr?"1️⃣ Пригласи "+C.fr+" друзей по своей ссылке (каждый должен открыть 3 карточки)\n2️⃣ В игре открой блок «📸 Конкурс» на главной — там фото и твоя ссылка\n3️⃣ Выложи историю в Telegram или Instagram со ссылкой на бота\n4️⃣ Нажми «Я выложил» и укажи свой ник":"1️⃣ Открой игру → блок «📸 Конкурс историй» на главной\n2️⃣ Возьми фото и свою ссылку на бота\n3️⃣ Выложи историю в Telegram или Instagram со ссылкой\n4️⃣ Нажми «Я выложил» и укажи свой ник")+"\n\n⏳ Выложить можно "+stEnd(C,now||Date.now())+". Не удаляй историю 24 часа — победителя попросим показать её в архиве историй. Итоги "+stDay(C,now||Date.now())+" в "+hmM(C.resAt)+", победителей выберем случайно";
function storyText(C,slot,now){const last=slot===C.slots.length-1,d2=C.ext&&mskDay(now)!==mskDay(C.start),lastDay=mskDay(now)===mskDay(C.end);
  if(slot===0&&d2)return "🔥 ВЫ ПРОСИЛИ — МЫ ПРОДЛИЛИ! КОНКУРС ИСТОРИЙ ИДЁТ 2 ДНЯ\n\nМногие не успели выложить историю вчера — поэтому даём ещё целый день! Сегодня последний шанс забрать призы:\n\n"+STP(C)+"\n\nЧто нужно сделать:\n"+ST_HOW(C,now)+"\n\nУже участвуешь? Ничего делать не нужно — ты в розыгрыше 🍀 Зови друзей, пусть тоже успеют!";
  if(C.gift&&slot===0&&mskDay(now)!==mskDay(C.start))return "🔥 ВТОРОЙ, ПОСЛЕДНИЙ ДЕНЬ РОЗЫГРЫША NFT-ПОДАРКА!\n\nСегодня в "+hmM(C.end)+" итоги. Ещё не участвуешь? Успеешь за 5 минут:\n\n"+ST_HOW(C,now)+"\n\nПризы:\n"+STP(C);
  if(C.gift&&slot===0)return "🐉 СТАРТ! РОЗЫГРЫШ NFT-ПОДАРКА «ДРАКОНЧИК» С ОШИБКОЙ ПЕЧАТИ\n\nТаких всего 50 на всю игру, стоит 300 ⭐ — и один достанется тебе бесплатно.\n\n"+STP(C)+"\n\nЧто нужно сделать:\n"+ST_HOW(C,now);
  if(slot===0)return "📸 СТАРТ! КОНКУРС ИСТОРИЙ — ПРИЗЫ ТРЁМ ПОБЕДИТЕЛЯМ\n\n"+STP(C)+"\n\nЧто нужно сделать:\n"+ST_HOW(C,now)+"\n\nЧем раньше выложишь — тем больше друзей придёт по твоей ссылке, а за каждого ты ещё и получаешь прокрутки 🔥";
  return (last&&lastDay?"⏰ ПОСЛЕДНИЙ ЧАС КОНКУРСА! До итогов "+fmtLeft(C.end-now):d2?"🔥 Последний день конкурса историй — успей выложить "+stEnd(C,now):C.ext?"📸 Конкурс историй продлён на 2 дня — выложить можно "+stEnd(C,now):"📸 Конкурс историй идёт — выложить можно "+stEnd(C,now))+"\n\n"+STP(C)+"\n\n"+ST_HOW(C,now)}
function storyChan(C,k,now){const bot="\n\n👉 @VoinyEpohBot",d2=C.ext&&mskDay(now)!==mskDay(C.start),lastDay=mskDay(now)===mskDay(C.end);
  if(C.gift){const two=mskDay(now)!==mskDay(C.start);
    if(k===0)return {photo:1,text:(two?"🔥 ПОСЛЕДНИЙ ДЕНЬ! РОЗЫГРЫШ NFT-ПОДАРКА":"🐉 РОЗЫГРЫШ NFT-ПОДАРКА В «ВОИНАХ ЭПОХ»!")+"\n\nГлавный приз — «Дракончик» с ошибкой печати: таких всего 50, стоит 300 ⭐\n\n"+STP(C)+"\n\nКак участвовать:\n"+ST_HOW(C,now)+"\n\n"+LOT_PAID+bot};
    return {text:(k===C.chanSlots.length-1&&lastDay?"⏰ Последние часы розыгрыша NFT-подарка — итоги в "+hmM(C.end)+"!":"🐉 Розыгрыш NFT-подарка идёт "+stEnd(C,now)+"!")+"\n\n"+STP(C)+"\n\nНужно: пригласить "+C.fr+" друзей и выложить историю с игрой. Фото и ссылка — в игре, блок «📸 Конкурс». Итоги "+stDay(C,now)+" в "+hmM(C.resAt)+" 🍀"+bot}}
  if(k===0&&d2)return {photo:1,text:"🔥 КОНКУРС ИСТОРИЙ ПРОДЛЁН — ЕЩЁ ОДИН ДЕНЬ!\n\nВы просили — мы продлили: сегодня последний шанс выложить историю и забрать призы.\n\n"+STP(C)+"\n\nКак участвовать:\n"+ST_HOW(C,now)+"\n\n"+LOT_PAID+bot};
  if(k===0)return {photo:1,text:"📸 КОНКУРС ИСТОРИЙ «ВОИНОВ ЭПОХ»!\n\n"+STP(C)+"\n\nКак участвовать:\n"+ST_HOW(C,now)+"\n\n"+LOT_PAID+bot};
  return {text:(k===C.chanSlots.length-1&&lastDay?"⏰ Последний час конкурса историй — итоги в "+hmM(C.end)+"!":"📸 Конкурс историй идёт "+stEnd(C,now)+"!")+"\n\n"+STP(C)+"\n\nФото и ссылка для истории — в игре, блок «📸 Конкурс историй». Итоги "+stDay(C,now)+" в "+hmM(C.resAt)+" 🍀"+bot}}
/* ---------- 💎 розыгрыш сундуков: тексты для бота и канала ---------- */
let CHC=null;const CHP=()=>LCH.map((x,k)=>MEDAL[k]+" "+x.ic+" "+x.n+" — на "+x.usd).join("\n")+(CHC&&CHC.xbal?CHC.xbal.map((v,k)=>v?"\n"+(k+1)+" место — "+v+" ⭐ на баланс в игре":"").join(""):"");
const CHHOW="👥 Каждый приглашённый друг = 1 билет\n🎬 Нет друзей? Сними видео с игрой в TikTok и пришли ссылку в игре — +1 билет\n📈 Больше билетов — больше шанс\n✅ Друг считается, когда откроет "+CHAL_OPEN+" карточки";
const CHIN="💎 В Сундуке Императора: мифический воин, легенда, 60 прокруток, 6 половинок, VIP Золото на месяц и премиум-пропуск";
function chestText(C,slot,rows,now){CHC=C;const last=C.slots[slot]===C.lastOnly,lastDay=mskDay(now)===mskDay(C.end),h=lotHook(C,rows);
  if(slot===0&&!lastDay)return "💎 СТАРТ! РАЗЫГРЫВАЕМ СУНДУКИ НА $70"+(C.xbal?" + ЗВЁЗДЫ":"")+"\n\n"+CHP()+"\n\n"+CHIN+"\n\n"+CHHOW+"\n\n⏳ Итоги "+dmy(C.end)+" в "+hmM(C.end)+" — бот сам выберет 3 победителей по билетам, сундуки откроются у них в игре автоматически\n\n"+LOT_PAID+"\n\nЖми «Мои билеты» 👇";
  if(slot===0)return "⚡ ПОСЛЕДНИЙ ДЕНЬ РОЗЫГРЫША СУНДУКОВ!\n\nСегодня в "+hmM(C.end)+" бот выберет "+(C.prizes.length>3?C.prizes.length+" победителей":"трёх победителей")+":\n"+CHP()+"\n\n"+h+"\n\n"+CHHOW;
  if(last)return "⏰ ПОСЛЕДНИЙ ЧАС! В "+hmM(C.end)+" разыгрываем Сундук Императора на $40\n\n"+h+"\n\nОдин друг прямо сейчас = ещё один билет. Или сними TikTok — тоже билет 🔥";
  const T=["","☀️ Розыгрыш сундуков в разгаре!","🍀 Каждый друг — ещё один шанс на Сундук Императора","🔥 До розыгрыша "+fmtLeft(C.end-now)+"!","🌙 Вечер — лучшее время звать друзей!"][slot]||"💎 Розыгрыш сундуков идёт!";
  return T+"\n\n"+h+"\n\n"+CHP()+"\n\n"+CHHOW+"\n\n⏳ Итоги "+bigEnd(C,now)}
function chestChan(C,k,now,rows){CHC=C;const bot="\n\n👉 @VoinyEpohBot",lastDay=mskDay(now)===mskDay(C.end),h=lotHook(C,rows||[]),last=C.chanSlots[k]===C.lastOnly;
  if(k===0)return {photo:1,text:(lastDay?"⚡ ПОСЛЕДНИЙ ДЕНЬ! РОЗЫГРЫШ 3 СУНДУКОВ НА $70":"💎 РОЗЫГРЫШ 3 СУНДУКОВ НА $70 — СТАРТ!")+"\n\n"+CHP()+"\n\n"+CHIN+"\n\n"+CHHOW+"\n\n⏳ Итоги "+dmy(C.end)+" в "+hmM(C.end)+". Сундуки откроются у победителей автоматически\n\n"+h+"\n\n"+LOT_PAID+bot};
  if(last)return {text:"⏰ До розыгрыша сундуков остался час!\n\n"+h+"\n\nВ "+hmM(C.end)+" бот случайно выберет трёх победителей по билетам. Позови ещё друга или сними TikTok — это ещё один шанс 🔥"+bot};
  const T=["","☕ Доброе утро! Розыгрыш сундуков идёт","⚡ Розыгрыш Сундука Императора в самом разгаре","🔥 До розыгрыша — "+fmtLeft(C.end-now),"🌙 Вечер — зови друзей, пока все онлайн"][k]||"💎 Розыгрыш сундуков идёт";
  return {text:T+"\n\n"+h+"\n\n"+CHP()+"\n\n"+CHHOW+"\n⏳ Итоги "+bigEnd(C,now)+bot}}
function chalText(C,slot,rows,now){if(C.chest)return chestText(C,slot,rows,now);if(C.big)return bigText(C,slot,rows,now);if(C.story)return storyText(C,slot,now);if(C.vip)return vipText(C,slot,rows,now);if(C.lot)return lotText(C,slot,rows,now);const last=slot===C.slots.length-1,pr=chalPrizes(C);
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
function lotChan(C,k,now,rows){if(C.chest)return chestChan(C,k,now,rows);if(C.big)return bigChan(C,k,now,rows);if(C.story)return storyChan(C,k,now);if(C.vip)return vipChan(C,k,now,rows);const bot="\n\n👉 @VoinyEpohBot",S=C.chanSlots,h=lotHook(C,rows||[]);
  if(k===0)return chanPost(C,0,now,rows);
  if(k===S.length-1)return {text:"⏰ ПОСЛЕДНИЙ ЧАС! До розыгрыша "+PZl(C)+" — "+fmtLeft(C.end-now)+"\n\n"+(C.secret?SEC_LINE+"\n\n":"")+h+(C.multi?"\n\n"+ML(C):"")+"\n\nВ "+hmM(C.end)+" бот случайно выберет "+W1(C)+" по билетам. Ещё можно успеть 🔥"+bot};
  const T=[null,"☕ Доброе утро, воины! Розыгрыш "+PZl(C)+" уже идёт","⚡ Розыгрыш "+PZl(C)+" в самом разгаре","🔥 До розыгрыша "+PZl(C)+" осталось "+fmtLeft(C.end-now)][k]||"🎟 Розыгрыш "+PZl(C)+" идёт";
  return {text:T+"\n\n"+(C.secret?SEC_LINE+"\n\n":"")+h+"\n\n👥 Пригласи "+frA(C.min)+" — и ты участник\n🎟 Каждый друг = +1 билет, друг твоего друга тоже считается\n"+(C.multi?"🏆 Три победителя: "+C.prizes.join(", ")+" — выбираем в ":"🏆 Победитель один — выбираем в ")+hmM(C.end)+"\n\n"+CHAL_X2+bot}}
function chanPost(C,slot,now,rows){rows=rows||[];if(C.story)return slot===0?storyChan(C,0,now):null;if(C.lot){const bot="\n\n👉 @VoinyEpohBot";
  if(slot===0&&C.secret)return {photo:1,text:"🔥 САМЫЙ КРУПНЫЙ РОЗЫГРЫШ В ИСТОРИИ «ВОИНОВ ЭПОХ»!\n\n"+SEC_LINE+"\n\nСегодня с "+hmM(C.start)+" до "+hmM(C.end)+":\n👥 Пригласи "+frA(C.min)+" — и ты в розыгрыше\n🎟 Каждый друг = 1 билет: больше друзей — больше шанс\n🏆 Победитель один — повезти может каждому 🍀\n\n"+LOT_PAID+"\n\n"+CHAL_X2+bot};
  if(slot===0&&C.multi)return {photo:1,text:"⭐ РОЗЫГРЫШ 600 ЗВЁЗД — ТРИ ПОБЕДИТЕЛЯ!\n\n"+ML(C)+"\n\nСегодня с "+hmM(C.start)+" до "+hmM(C.end)+":\n👥 Пригласи "+frA(C.min)+" в «Воины Эпох» — и ты в розыгрыше\n🎟 Каждый друг = 1 билет: чем больше друзей — тем больше шанс\n✅ Считаются только живые друзья, которые играют\n\n"+MNOTE+"\n\n"+LOT_PAID+"\n\n"+CHAL_X2+bot};
  if(slot===0)return {photo:1,text:"🎟 РОЗЫГРЫШ "+C.prizes[0]+" — ВЫИГРАТЬ МОЖЕТ ЛЮБОЙ!\n\nСегодня с "+hmM(C.start)+" до "+hmM(C.end)+":\n👥 Пригласи "+frA(C.min)+" в «Воины Эпох» — и ты в розыгрыше\n🎟 Каждый друг = 1 билет: больше друзей — больше шанс\n🏆 Победитель один — подарок Telegram на "+C.prizes[0]+" или звёзды\n\nВы просили — мы сделали: теперь не нужно быть первым, повезти может каждому 🍀\n\n"+LOT_PAID+"\n\n"+CHAL_X2+bot};
  if(slot===C.slots.length-1)return {text:"⏰ До розыгрыша "+PZl(C)+" остался "+fmtLeft(C.end-now)+"!\n\n"+lotHook(C,rows)+"\n\nВ "+hmM(C.end)+" бот случайно выберет "+W1(C)+" по билетам. Успей позвать друзей 🔥"+bot};
  if(C.slots[slot]===14.5)return {text:"⚡ Половина дня позади — розыгрыш "+PZl(C)+" в "+hmM(C.end)+"!\n\n"+lotHook(C,rows)+"\n\n🎟 Каждый друг = +1 билет"+bot};
  return null}const pr=chalPrizes(C),bot="\n\n👉 @VoinyEpohBot",hook=chalHook(C,rows)+"\n\n"+CHAL_X2+"\n\n";
  if(slot===0)return {photo:1,text:"🔥 ЧЕЛЛЕНДЖ ДНЯ — разыгрываем подарки Telegram!\n\nСегодня с "+hmM(C.start)+" до "+hmM(C.end)+": кто пригласит больше друзей в «Воины Эпох», тот забирает приз 👇\n"+pr+"\n\n💡 Фишка: если твой друг позовёт своего друга, он засчитается и тебе. Чем длиннее цепочка, тем выше ты в таблице!\n\n📊 Таблица лидеров онлайн — вкладка «Крутить»"+bot};
  const H=C.slots[slot];if(H===C.ext)return null;
  if(slot===C.slots.length-1)return {text:"⏰ До конца челленджа "+fmtLeft(C.end-now)+"!\n\n"+hook+"В "+hmM(C.end)+" таблица замирает, и топ-3 получают подарки Telegram. Успей позвать ещё пару друзей 🔥"+bot};
  if(H===14.5)return {text:"⚡ Половина челленджа позади!\n\n"+hook+"Открой игру, глянь таблицу на вкладке «Крутить» и кинь ссылку в пару чатов.\n\nДо "+hmM(C.end)+bot};
  return null}
async function chanSend(env,C,P,img){if(!C.chan||!env.BOT_TOKEN||env.DEV==="1"&&!env.NOTIFY_TEST)return false;
  const kb={inline_keyboard:[[{text:"⚔️ Играть",url:"https://t.me/VoinyEpohBot"}]]};
  try{const r=P.photo?await tgApi(env,"sendPhoto",{chat_id:C.chan,photo:PAGE+(img||C.img||(C.lot?"assets/post-lottery.jpg?v=1":"assets/post-challenge.jpg?v=2")),caption:P.text,reply_markup:kb}):await tgApi(env,"sendMessage",{chat_id:C.chan,text:P.text,reply_markup:kb});return !!r.ok}catch(e){return false}}
async function chanCheck(env,C){if(!C.chan||!env.BOT_TOKEN||env.DEV==="1"&&!env.NOTIFY_TEST)return;const now=Date.now();
  const k=(await kvGet(env,"chan_chk:"+C.id))||{ok:0,at:0,warned:0,fail:0};if(k.ok||now-k.at<10*60e3)return;k.at=now;
  let ok=false,why="";try{const r=await tgApi(env,"getChatMember",{chat_id:C.chan,user_id:+String(env.BOT_TOKEN).split(":")[0]});
    if(!r||!r.ok)why="Telegram ответил: "+((r&&r.description)||"нет ответа");else{const R=r.result||{};ok=R.status==="creator"||R.status==="administrator"&&R.can_post_messages!==false;if(!ok)why=R.status==="administrator"?"у бота нет права «Публикация сообщений»":"бот не администратор канала (статус: "+R.status+")"}}catch(e){why="ошибка связи с Telegram"}
  if(ok){k.ok=1;if(k.warned)for(const a of ADMINS)await notify(env,a,"✅ Всё в порядке: бот снова может публиковать в канал "+C.chan+". Посты выйдут по расписанию.","⚔️ Открыть")}
  else{k.fail=(k.fail||0)+1;console.error("chancheck",why);   // разовый сбой связи — не повод пугать: предупреждаем только после двух неудач подряд
    if(k.fail>=2&&!k.warned){k.warned=1;for(const a of ADMINS)await notify(env,a,"⚠️ Бот не может публиковать в канал "+C.chan+".\n\nПричина: "+why+".\n\nПроверю снова через 10 минут.","⚔️ Открыть")}}
  await kvSet(env,"chan_chk:"+C.id,k)}
/* ---------- казино: журнал игр, лента крупных выигрышей для всех и статистика для админа ---------- */
/* 🔥 бегущая строка: крутые выпадения всех игроков */
async function hypeAdd(env,uid,txt,big){try{await env.DB.prepare("INSERT INTO hype(t,uid,txt,big) VALUES(?,?,?,?)").bind(Date.now(),uid,txt,big?1:0).run();delete CACHE_HYPE.v}catch(e){}}
const CACHE_HYPE={};async function hypeList(env){const now=Date.now();if(CACHE_HYPE.v&&now-CACHE_HYPE.t<8e3)return CACHE_HYPE.v;
  const L=(await env.DB.prepare("SELECT h.id,h.t,h.txt,h.big,COALESCE(u.nick,u.name) AS name FROM hype h LEFT JOIN users u ON u.id=h.uid WHERE h.t>? ORDER BY h.id DESC LIMIT 20").bind(now-24*36e5).all()).results;CACHE_HYPE.v=L;CACHE_HYPE.t=now;return L}
function hypeCards(res){const out=[],seen=new Set(),add=c=>{if(c&&typeof c==="object"&&c.h!=null&&c.f!=null&&!seen.has(c)){seen.add(c);out.push(c)}};
  if(res&&typeof res==="object")for(const k of Object.keys(res)){const v=res[k];if(Array.isArray(v))v.forEach(add);else add(v)}return out}
async function jpGet(env){const v=await kvGet(env,"jp");return v&&v.v>0?v:{v:JP.seed,w:null}}
async function jpAdd(env,bet){if(!(bet>0))return;try{const J0=await jpGet(env);J0.v=Math.round(J0.v+bet*JP.cut);await kvSet(env,"jp",J0)}catch(e){}}
const mskDayOf=t=>new Date(t+3*36e5).toISOString().slice(0,10);
async function cbInfo(env,uid,st){const now=Date.now(),d0=Date.parse(mskDayOf(now)+"T00:00:00Z")-3*36e5,r=await env.DB.prepare("SELECT COALESCE(SUM(bet),0) AS b,COALESCE(SUM(win),0) AS w FROM cas_log WHERE uid=? AND at>=? AND at<?").bind(uid,d0-864e5,d0).first();
  const loss=Math.max(0,(r.b||0)-(r.w||0)),amt=Math.min(CSB.max,Math.floor(loss*CSB.pct));return {amt,taken:(st&&st.cbDay)===mskDayOf(now)}}
/* 🚀 Онлайн-ракетка: общие раунды для всех. 8 с ставки → взлёт → взрыв в точке, которую сервер выбрал заранее (её никто не видит до взрыва) → 4 с пауза */
const rocT=m=>Math.log(m)/RKT.k*1e3;
async function rocCur(env,now){let R=await env.DB.prepare("SELECT * FROM roc_round ORDER BY id DESC LIMIT 1").first();
  if(!R||now>=R.ct+RKT.pause){const id=(R?R.id:0)+1,fs=now+RKT.bet,cr=rkCr(),ct=fs+Math.ceil(rocT(cr));await env.DB.prepare("INSERT OR IGNORE INTO roc_round(id,fs,cr,ct) VALUES(?,?,?,?)").bind(id,fs,cr,ct).run();
    try{await env.DB.prepare("DELETE FROM roc_round WHERE id<?").bind(id-200).run();await env.DB.prepare("DELETE FROM roc_bet WHERE rid<?").bind(id-200).run()}catch(e){}
    R=await env.DB.prepare("SELECT * FROM roc_round WHERE id=?").bind(id).first()}return R}
async function rocPay(env,uid,rid,m,b,now){const w=Math.floor(b*m),u=await env.DB.prepare("UPDATE roc_bet SET out_m=?,win=? WHERE rid=? AND uid=? AND out_m IS NULL").bind(m,w,rid,uid).run();if(u.meta.changes!==1)return 0;
  await doAction(env,{id:uid,name:"Игрок"},"map_grant",{runes:w},{grant:true});await casLog(env,uid,"rk",0,w,null,m);if(m>=5&&w>=5000)await hypeAdd(env,uid,"🚀 забрал ракетку на ×"+m+" · +"+w.toLocaleString("ru")+" 💠",m>=20);return w}
async function rocSettle(env,R,now){const L=(await env.DB.prepare("SELECT b.uid,b.b,b.auto,b.rid,r.fs FROM roc_bet b JOIN roc_round r ON r.id=b.rid WHERE b.out_m IS NULL AND b.auto>0 AND b.auto<r.cr AND r.fs<? AND b.rid>=? LIMIT 200").bind(now,R.id-3).all()).results;
  for(const x of L)if(now-x.fs>=rocT(x.auto))await rocPay(env,x.uid,x.rid,x.auto,x.b,now)}
const ROCS={};
async function rocApi(env,me,a,p){const now=Date.now();const R=await rocCur(env,now);await rocSettle(env,R,now);
  if(a==="roc_bet"){if(now>=R.fs)fail("Ракета уже в полёте — ставь на следующий раунд");if(await env.DB.prepare("SELECT 1 FROM roc_bet WHERE rid=? AND uid=?").bind(R.id,me.id).first())fail("Ставка уже сделана");
    const b=Math.floor(+p.bet||0),au=+p.auto||0,auto=au>=1.1&&au<=RKT.cap?Math.round(au*100)/100:0;const r=await doAction(env,me,"cas_rk_bet",{bet:b},{grant:true});
    await env.DB.prepare("INSERT INTO roc_bet(rid,uid,name,b,auto,t) VALUES(?,?,?,?,?,?)").bind(R.id,me.id,me.nick||me.name||"Игрок",b,auto,now).run();await casLog(env,me.id,"rk",b,0);await jpAdd(env,b);delete ROCS.v}
  if(a==="roc_out"){const B=await env.DB.prepare("SELECT * FROM roc_bet WHERE rid=? AND uid=?").bind(R.id,me.id).first();if(!B)fail("Ставки в этом раунде нет");if(B.out_m!=null)fail("Уже забрал");
    if(now<R.fs)fail("Ракета ещё не взлетела");if(now>=R.ct)fail("💥 Ракета уже взорвалась");const m=Math.min(rkM(now-R.fs),R.cr);if(m>=R.cr)fail("💥 Ракета уже взорвалась");await rocPay(env,me.id,R.id,m,B.b,now);delete ROCS.v}
  if(!ROCS.v||now-ROCS.t>600||ROCS.id!==R.id){const bets=(await env.DB.prepare("SELECT uid,name,b,auto,out_m,win FROM roc_bet WHERE rid=? ORDER BY b DESC LIMIT 40").bind(R.id).all()).results,n=((await env.DB.prepare("SELECT COUNT(*) AS n,COALESCE(SUM(b),0) AS s FROM roc_bet WHERE rid=?").bind(R.id).first())||{});
    const hist=(await env.DB.prepare("SELECT cr FROM roc_round WHERE ct<? ORDER BY id DESC LIMIT 14").bind(now).all()).results.map(x=>x.cr);ROCS.v={bets,n:n.n||0,sum:n.s||0,hist};ROCS.t=now;ROCS.id=R.id}
  const crashed=now>=R.ct,ph=now<R.fs?"bet":crashed?"crash":"fly",my=await env.DB.prepare("SELECT b,auto,out_m,win FROM roc_bet WHERE rid=? AND uid=?").bind(R.id,me.id).first();
  return {id:R.id,ph,now,fs:R.fs,cr:crashed?R.cr:null,next:crashed?R.ct+RKT.pause:null,k:RKT.k,bets:ROCS.v.bets.map(x=>({name:x.name,b:x.b,out:x.out_m,win:x.win,me:x.uid===me.id?1:0,lost:crashed&&x.out_m==null?1:0})),n:ROCS.v.n,sum:ROCS.v.sum,hist:ROCS.v.hist,my:my||null}}
async function casLog(env,uid,g,bet,win,gift,m){try{await env.DB.prepare("INSERT INTO cas_log(uid,g,bet,win,gift,gno,m,at) VALUES(?,?,?,?,?,?,?,?)").bind(uid,g,bet|0,win|0,gift?gift.k:null,gift?gift.no:null,m||null,Date.now()).run()}catch(e){console.error("caslog",e)}}
async function casFeed(env){return cached("casfeed",5e3,async()=>(await env.DB.prepare("SELECT l.g,l.bet,l.win,l.gift,l.gno,l.m,l.at,COALESCE(u.nick,u.name) AS name FROM cas_log l LEFT JOIN users u ON u.id=l.uid WHERE l.gift IS NOT NULL OR l.win>=50000 OR (l.g='slot' AND l.m>=8) ORDER BY l.id DESC LIMIT 20").all()).results)}
async function casStats(env){const now=Date.now(),d0=dayNum(now)*864e5-TZ;
  const agg=async from=>(await env.DB.prepare("SELECT g,COUNT(*) AS n,SUM(bet) AS bet,SUM(win) AS win,COUNT(DISTINCT uid) AS players,SUM(gift IS NOT NULL) AS gifts FROM cas_log WHERE at>=? GROUP BY g").bind(from).all()).results;
  const tot=async from=>await env.DB.prepare("SELECT COUNT(*) AS n,COALESCE(SUM(bet),0) AS bet,COALESCE(SUM(win),0) AS win,COUNT(DISTINCT uid) AS players FROM cas_log WHERE at>=?").bind(from).first();
  const top=(await env.DB.prepare("SELECT l.uid,COALESCE(u.nick,u.name) AS name,SUM(l.win)-SUM(l.bet) AS net,COUNT(*) AS n FROM cas_log l LEFT JOIN users u ON u.id=l.uid WHERE l.at>=? GROUP BY l.uid ORDER BY net DESC LIMIT 5").bind(d0).all()).results;
  const lose=(await env.DB.prepare("SELECT l.uid,COALESCE(u.nick,u.name) AS name,SUM(l.win)-SUM(l.bet) AS net,COUNT(*) AS n FROM cas_log l LEFT JOIN users u ON u.id=l.uid WHERE l.at>=? GROUP BY l.uid ORDER BY net ASC LIMIT 5").bind(d0).all()).results;
  const gifts=(await env.DB.prepare("SELECT l.gift,l.gno,l.at,COALESCE(u.nick,u.name) AS name FROM cas_log l LEFT JOIN users u ON u.id=l.uid WHERE l.gift IS NOT NULL ORDER BY l.id DESC LIMIT 15").all()).results;
  return {today:{...(await tot(d0)),by:await agg(d0)},week:{...(await tot(now-7*864e5)),by:await agg(now-7*864e5)},top,lose,gifts}}
/* выдача бесценной карточки-коллаборации. Она одна на весь мир: если уже выдана — не создаём вторую */
async function collabGrant(env,uid){if(await env.DB.prepare("SELECT 1 FROM cards WHERE f=6").first())return null;
  const r=await env.DB.prepare("INSERT INTO cards(owner,h,f,no,sn,nice,hue,v,stats,xp,wins,stars,created,how) VALUES(?,?,6,1,'А777МР77',0,190,0,?,0,0,0,?,'prize') RETURNING id").bind(uid,COLLAB,JSON.stringify([700,700,700,700,700]),Date.now()).first();
  return r?r.id:null}
let chalBusy=null;
async function chalTick(env){if(chalBusy)return chalBusy;chalBusy=(async()=>{const C=await chalCfg(env),now=Date.now();if(!C||now>(C.resAt||C.end)+36e5)return;
  if(C.story&&now>=C.end){const st0=(await kvGet(env,"chal_st:"+C.id))||{};if(now>=C.resAt&&!st0.sfin){st0.sfin=1;await kvSet(env,"chal_st:"+C.id,st0);await storyDraw(env,C)}if(now>=C.end+36e5)return}
  if(now<C.end)await chanCheck(env,C);
  if(now<C.start-3600e3)return;
  const st=(await kvGet(env,"chal_st:"+C.id))||{slot:-1,after:0,fin:0,ch:{}};st.ch=st.ch||{};
  {const dk=mskDay(now);if(!st.day)st.day=dk;else if(st.day!==dk){st.day=dk;st.slot=-1;st.after=0;st.done=0;st.n=0;st.cs={};st.ch={}}}   // многодневный конкурс: расписание рассылок заново каждый день
  // итоги: фиксируем таблицу и пишем победителям, админу и в канал
  if(now>=C.end&&!st.fin&&!C.story){delete topCache.chalb;const rows=(await chalBoard(env,C)).slice(0,50);await kvSet(env,"chal_res:"+C.id,{rows,at:now});st.fin=1;st.res=0;await kvSet(env,"chal_st:"+C.id,st)}
  if(st.fin===1&&!st.res&&C.lot){st.res=1;await kvSet(env,"chal_st:"+C.id,st);const R=(await kvGet(env,"chal_res:"+C.id))||{},rows=R.rows||[];
    const all=await chalBoard(env,C),P=lotIn(C,all),T=P.reduce((a,r)=>a+r.n,0),W=lotDraw(C,all);R.winner=W||null;R.players=P.length;R.tickets=T;await kvSet(env,"chal_res:"+C.id,R);
    if(C.vip){const Ws=lotDrawN(C,all,3),V=VIP_T[C.vip],ms=(C.vipDays||30)*864e5;R.winners=Ws;await kvSet(env,"chal_res:"+C.id,R);
      for(let k=0;k<Ws.length;k++){const w=Ws[k];await env.DB.prepare("UPDATE users SET vip_until=MAX(COALESCE(vip_until,0),?)+?,vip_t=MAX(COALESCE(vip_t,0),?) WHERE id=?").bind(now,ms,C.vip,w.uid).run();
        await notify(env,w.uid,MEDAL[k]+" ТЫ ВЫИГРАЛ VIP НА МЕСЯЦ!\n\nУ тебя было "+tk(w.n)+" из "+T+" — и удача выбрала тебя 🍀\n\n"+V.ic+" "+V.n+" уже включён на "+(C.vipDays||30)+" дней: "+V.sp+" прокруток каждые 4 часа, +"+V.ex+" обмена рун в день, 360 мест для карточек и корона у ника. Заходи и пользуйся!","👑 Открыть игру")}
      for(const a of ADMINS)await notify(env,a,"👑 Розыгрыш 3 VIP ("+C.id+"): участников "+P.length+", билетов "+T+".\n\nПобедители (VIP уже выдан автоматически):\n"+(Ws.map((w,k)=>MEDAL[k]+" "+w.name+" (id "+w.uid+") — "+tk(w.n)).join("\n")||"никто не набрал "+C.min+" друзей")+"\n\nВсе участники:\n"+(P.slice(0,30).map(r=>r.name+" (id "+r.uid+") — "+tk(r.n)).join("\n")||"—"),"⚔️ Открыть");
      await chanSend(env,C,{photo:Ws.length?1:0,text:Ws.length?"🎉 ИТОГИ РОЗЫГРЫША 3 VIP НА МЕСЯЦ!\n\nУчастников: "+P.length+", билетов: "+T+"\n\n"+Ws.map((w,k)=>MEDAL[k]+" "+w.name+" — "+tk(w.n)).join("\n")+"\n\n👑 Поздравляем! VIP уже включён у победителей на 30 дней — бот написал им в личку.\n\nСпасибо всем, кто звал друзей — следующий розыгрыш скоро 🔥\n\n👉 @VoinyEpohBot":"👑 Розыгрыш 3 VIP завершён: никто не набрал "+frA(C.min)+". VIP переносятся на следующий розыгрыш 🔥\n\n👉 @VoinyEpohBot"},Ws.length?"assets/post-vip-win.jpg?v=1":null);
      return}
    if(C.chest){CHC=C;const Ws=lotDrawN(C,all,C.prizes.length||3);R.winners=Ws;await kvSet(env,"chal_res:"+C.id,R);const log=[];
      for(let k=0;k<Ws.length;k++){const w=Ws[k],X=LCH[k];if(!X){const amt=(C.xbal||[])[k]||0;if(amt)await env.DB.prepare("UPDATE users SET star_bal=star_bal+? WHERE id=?").bind(amt,w.uid).run();log.push([amt+" ⭐ на баланс"]);
          await notify(env,w.uid,(k+1)+" МЕСТО В РОЗЫГРЫШЕ СУНДУКОВ! 🎉\n\nУ тебя было "+tk(w.n)+" из "+T+" — и удача тебя заметила 🍀\n\n⭐ "+amt+" звёзд уже на твоём балансе в игре — трать в Сокровищнице на что захочешь!","⭐ Открыть игру");continue}
        const got=await chestGive(env,w.uid,w.name,k,C);log.push(got);
        await notify(env,w.uid,(MEDAL[k]||"🎖")+" ТЫ ВЫИГРАЛ "+X.ic+" "+X.n.toUpperCase()+"!\n\nУ тебя было "+tk(w.n)+" из "+T+" — и удача выбрала тебя 🍀\n\nСундук уже открыт у тебя в игре:\n"+X.d.map(x=>"• "+x).join("\n")+"\n\nЗаходи смотреть, что выпало 🔥","🎁 Открыть игру")}
      for(const a of ADMINS)await notify(env,a,"💎 Розыгрыш сундуков "+C.id+": участников "+P.length+", билетов "+T+".\n\nПобедители (сундуки выданы автоматически):\n"+(Ws.map((w,k)=>(MEDAL[k]||"🎖")+" "+w.name+" (id "+w.uid+") — "+tk(w.n)+(w.tt?" (вкл. TikTok)":"")+" → "+C.prizes[k]+"\n   "+log[k].join(", ")).join("\n")||"никто не набрал билетов")+"\n\nВсе участники:\n"+(P.slice(0,30).map(r=>r.name+" (id "+r.uid+") — "+tk(r.n)).join("\n")||"—"),"⚔️ Открыть");
      await chanSend(env,C,{text:Ws.length?"🎉 ИТОГИ РОЗЫГРЫША СУНДУКОВ!\n\nУчастников: "+P.length+", билетов: "+T+"\n\n"+Ws.map((w,k)=>(MEDAL[k]||"🎖")+" "+w.name+" — "+(LCH[k]?LCH[k].ic+" "+LCH[k].n:"⭐ "+C.prizes[k]+" на баланс")+" ("+tk(w.n)+")").join("\n")+"\n\nПоздравляем! Призы уже у победителей в игре 🎁 Спасибо всем, кто звал друзей и снимал видео — следующий розыгрыш скоро 🔥\n\n👉 @VoinyEpohBot":"💎 Розыгрыш завершён — в этот раз никто не набрал билетов. Сундуки переносятся на следующий розыгрыш 🔥\n\n👉 @VoinyEpohBot"});
      return}
    if(C.big){const Ws=lotDrawN(C,all,3);R.winners=Ws;await kvSet(env,"chal_res:"+C.id,R);
      for(let k=0;k<Ws.length;k++){const w=Ws[k];await env.DB.prepare("UPDATE users SET star_bal=star_bal+? WHERE id=?").bind(C.usd[k],w.uid).run();
        if(C.sp[k])try{await doAction(env,{id:w.uid,name:w.name},"tour_prize",{sp:C.sp[k]},{tour:1})}catch(e){console.error("bigsp",e)}
        await notify(env,w.uid,MEDAL[k]+" ТЫ ЗАНЯЛ "+(k+1)+" МЕСТО В РОЗЫГРЫШЕ!\n\nУ тебя было "+tk(w.n)+" из "+T+" — и удача выбрала тебя 🍀\n\n🎁 Твой приз: "+C.prizes[k]+" ("+C.usd[k]+" ⭐ уже на игровом балансе)"+(C.sp[k]?" + "+C.sp[k]+" прокруток":"")+"."+(k===0?"\n\n✍️ А ещё мы сделаем карточку специально для тебя — с твоей подписью! Напиши @voinovadmin: какого героя хочешь и какую подпись поставить.":"")+"\n\nЗвёздами с баланса можно оплатить любую покупку в игре.","⭐ Открыть игру")}
      for(const a of ADMINS)await notify(env,a,"🎟 Розыгрыш "+C.id+": участников "+P.length+", билетов "+T+".\n\nПобедители (баланс и прокрутки уже выданы):\n"+(Ws.map((w,k)=>MEDAL[k]+" "+w.name+" (id "+w.uid+") — "+tk(w.n)+" → "+C.prizes[k]+" = "+C.usd[k]+" ⭐"+(C.sp[k]?" + "+C.sp[k]+" 🎴":"")).join("\n")||"никто не пригласил друзей")+(Ws[0]?"\n\n✍️ 1 месту нужно сделать именную карточку с подписью — ему сказано написать в @voinovadmin.":"")+"\n\nВсе участники:\n"+(P.slice(0,30).map(r=>r.name+" (id "+r.uid+") — "+tk(r.n)).join("\n")||"—"),"⚔️ Открыть");
      await chanSend(env,C,{text:Ws.length?"🎉 ИТОГИ РОЗЫГРЫША!\n\nУчастников: "+P.length+", билетов: "+T+"\n\n"+Ws.map((w,k)=>MEDAL[k]+" "+w.name+" — "+C.prizes[k]+(C.sp[k]?" + "+C.sp[k]+" прокруток":"")+(k===0?" + именная карточка ✍️":"")+" ("+tk(w.n)+")").join("\n")+"\n\nПоздравляем! Призы уже на игровом балансе победителей ⭐ Спасибо всем, кто звал друзей — следующий розыгрыш скоро 🔥\n\n👉 @VoinyEpohBot":"🎟 Розыгрыш завершён — в этот раз никто не пригласил друзей. Следующий скоро!\n\n👉 @VoinyEpohBot"});
      return}
    if(C.multi){const Ws=lotDrawN(C,all,3);R.winners=Ws;await kvSet(env,"chal_res:"+C.id,R);
      for(let k=0;k<Ws.length;k++){const w=Ws[k],amt=C.bal[k];await env.DB.prepare("UPDATE users SET star_bal=star_bal+? WHERE id=?").bind(amt,w.uid).run();
        await notify(env,w.uid,MEDAL[k]+" ТЫ ВЫИГРАЛ "+(k+1)+" МЕСТО В РОЗЫГРЫШЕ!\n\nУ тебя было "+tk(w.n)+" из "+T+" — и удача выбрала тебя 🍀\n\n⭐ "+amt+" звёзд уже на твоём игровом балансе! Трать их на любые покупки в игре: VIP, сезонный пропуск, сундуки, подарки. При покупке выбирай «Оплатить с баланса».","⭐ Потратить звёзды",PAGE+"?shop=1")}
      for(const a of ADMINS)await notify(env,a,"🎟 Розыгрыш "+C.id+": участников "+P.length+", билетов "+T+".\n\nПобедители (звёзды уже зачислены на игровой баланс):\n"+(Ws.map((w,k)=>MEDAL[k]+" "+w.name+" (id "+w.uid+") — "+tk(w.n)+" → "+C.bal[k]+" ⭐").join("\n")||"никто не набрал "+C.min+" друзей")+"\n\nВсе участники:\n"+(P.slice(0,30).map(r=>r.name+" (id "+r.uid+") — "+tk(r.n)).join("\n")||"—"),"⚔️ Открыть");
      await chanSend(env,C,{text:Ws.length?"🎉 ИТОГИ РОЗЫГРЫША 600 ⭐\n\nУчастников: "+P.length+", билетов: "+T+"\n\n"+Ws.map((w,k)=>MEDAL[k]+" "+w.name+" — "+C.prizes[k]).join("\n")+"\n\nПоздравляем! Звёзды уже на игровом балансе победителей ⭐ Спасибо всем, кто звал друзей — следующий розыгрыш скоро 🔥\n\n👉 @VoinyEpohBot":"🎟 Розыгрыш завершён: никто не набрал "+frA(C.min)+". Звёзды переносятся на следующий розыгрыш 🔥\n\n👉 @VoinyEpohBot"});
      return}
    let card=null;if(W&&C.secret)card=await collabGrant(env,W.uid);
    if(W&&C.secret)await notify(env,W.uid,"🎉 ТЫ ВЫИГРАЛ САМЫЙ КРУПНЫЙ РОЗЫГРЫШ!\n\nУ тебя было "+tk(W.n)+" из "+T+" — и удача выбрала тебя 🍀\n\n🤝 Твой секретный приз — бесценная карточка-коллаборация «Воины Эпох × Номерок» с номером А777МР 77! Она одна во всём мире"+(card?" и уже лежит в твоей коллекции":"")+".\n\n💎 У неё нет оценки: продать её можно только на рынке, и цену назначаешь ты сам. Подарок лично от «Номерка».","💎 Открыть карточку");
    else if(W)await notify(env,W.uid,"🎉 ТЫ ВЫИГРАЛ РОЗЫГРЫШ "+C.prizes[0]+"!\n\nУ тебя было "+tk(W.n)+" из "+T+" — и удача выбрала тебя 🍀\n\nТвой приз: подарок Telegram на "+C.prizes[0]+" или звёзды на ту же сумму. Напиши @voinovadmin, что выбираешь, и пришли свой ID: "+W.uid,"⚔️ Играть");
    for(const a of ADMINS)await notify(env,a,"🎟 Розыгрыш "+C.id+": участников "+P.length+", билетов "+T+".\n\nПобедитель: "+(W?W.name+" (id "+W.uid+") — "+tk(W.n)+" (сам "+W.d+" + друзья "+W.l2+")":"никто не набрал "+C.min+" друзей")+"\n\nВсе участники:\n"+(P.slice(0,30).map(r=>r.name+" (id "+r.uid+") — "+tk(r.n)).join("\n")||"—")+"\n\nПеред выдачей проверь, что друзья живые.","⚔️ Открыть");
    if(C.secret){await chanSend(env,C,{text:W?"🎉 ИТОГИ САМОГО КРУПНОГО РОЗЫГРЫША!\n\nУчастников: "+P.length+", билетов: "+T+"\n🍀 Победитель: "+W.name+" ("+tk(W.n)+")!\n\n🤫 А теперь секрет: главный приз — БЕСЦЕННАЯ карточка-коллаборация «Воины Эпох × Номерок» с номером А777МР 77. Одна на весь мир. Продать её можно только на рынке — и цену назначает сам владелец 💎\n\nПодарок лично от «Номерка» 🤝 Поздравляем!\n\n👉 @VoinyEpohBot":"🎟 Розыгрыш завершён: никто не набрал "+frA(C.min)+". Секретный приз остаётся у нас — разыграем его в следующий раз 🔥\n\n👉 @VoinyEpohBot"});return}
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
    if(now>=at&&now<at+CHAL_LATE&&at>=C.start-3600e3&&at<C.end&&!st.cs[k]&&!(C.lastOnly===C.chanSlots[k]&&mskDay(now)!==mskDay(C.end))){st.cs[k]=1;await kvSet(env,"chal_st:"+C.id,st);const P=lotChan(C,k,now,now>=C.start?await chalBoard(env,C):[]);if(P)await chanSend(env,C,P)}}}
  let s=-1;for(let k=0;k<C.slots.length;k++)if(now>=slotAt(k)&&now<slotAt(k)+CHAL_LATE&&slotAt(k)>=C.start-3600e3&&slotAt(k)<C.end&&!(C.lastOnly===C.slots[k]&&mskDay(now)!==mskDay(C.end)))s=k;
  if(s<0)return;
  if(!C.chanSlots&&!st.ch[s]){st.ch[s]=1;await kvSet(env,"chal_st:"+C.id,st);const P=chanPost(C,s,now,now>=C.start?await chalBoard(env,C):[]);if(P)await chanSend(env,C,P)}
  if(st.slot>s||st.slot===s&&st.done)return;
  if(st.slot!==s){st.slot=s;st.after=0;st.done=0;st.n=0}
  const rows=now>=C.start?await chalBoard(env,C):[],text=chalText(C,s,rows,now);
  const us=(await env.DB.prepare("SELECT id FROM users WHERE pm=1 AND id>? ORDER BY id LIMIT 25").bind(st.after).all()).results;
  for(const u of us){if(await notify(env,u.id,text,C.story?"📸 Участвовать":C.lot?"🎟 Мои билеты":"👥 Открыть таблицу",null,s===0?PAGE+(C.img||(C.lot?"assets/post-lottery.jpg?v=1":"assets/post-challenge.jpg?v=2")):C.ext&&C.slots[s]===C.ext?PAGE+"assets/post-extend.jpg?v=1":null))st.n++;st.after=u.id}
  if(us.length<25)st.done=1;await kvSet(env,"chal_st:"+C.id,st)})().finally(()=>{chalBusy=null});return chalBusy}

async function storyGet(env,me,C,now){if(now>=C.resAt+864e5)return null;const E=await env.DB.prepare("SELECT tg,ig,t FROM story_entries WHERE contest=? AND uid=?").bind(C.id,me.id).first();
  const n=((await env.DB.prepare("SELECT COUNT(*) AS n FROM story_entries WHERE contest=?").bind(C.id).first())||{}).n||0;
  const came=((await env.DB.prepare("SELECT COUNT(*) AS n FROM users WHERE ref=? AND created>=?").bind(me.id,C.start).first())||{}).n||0;
  const frOk=C.fr?((await env.DB.prepare("SELECT COUNT(*) AS n FROM users WHERE ref=? AND created>=? AND COALESCE(json_extract(state,'$.nOp'),0)>=?").bind(me.id,C.start,CHAL_OPEN).first())||{}).n||0:0;
  const res=now>=C.resAt?await kvGet(env,"story_res:"+C.id):null;
  return {id:C.id,story:1,start:C.start,end:C.end,resAt:C.resAt,phase:now<C.start?"soon":now<C.end?"on":now<C.resAt?"wait":"done",left:Math.max(0,(now<C.start?C.start:now<C.end?C.end:C.resAt)-now),prizes:C.prizes,fr:C.fr||0,frOk,gift:C.gift||null,post:C.img,
    img:C.storyImg,link:"https://t.me/"+(env.BOT_USERNAME||"VoinyEpohBot")+"?startapp=r_"+me.id,me:E?{tg:E.tg||"",ig:E.ig||"",t:E.t}:null,players:n,came,
    winners:res&&res.conf?res.win.filter(w=>w.ok).map(w=>({place:w.place,name:w.name})):null,top:[],me2:{}}}
const stHandle=v=>{v=String(v||"").trim().replace(/^https?:\/\/(www\.)?(instagram\.com|t\.me)\//i,"").replace(/^@/,"").replace(/[/?#].*$/,"");return /^[A-Za-z0-9_.]{3,40}$/.test(v)?v:""};
async function storyJoin(env,me,p){const C=await chalCfg(env),now=Date.now();if(!C||!C.story)fail("Сейчас нет конкурса историй");if(now<C.start)fail("Конкурс ещё не начался");if(now>=C.end)fail("Выложить историю можно было до "+hmM(C.end));
  const tg=stHandle(p.tg),ig=stHandle(p.ig);if(!tg&&!ig)fail("Укажи свой ник в Telegram или Instagram — по нему мы проверим историю");
  await env.DB.prepare("INSERT INTO story_entries(contest,uid,tg,ig,t) VALUES(?,?,?,?,?) ON CONFLICT(contest,uid) DO UPDATE SET tg=excluded.tg,ig=excluded.ig").bind(C.id,me.id,tg,ig,now).run();return {tg,ig}}
/* итоги: 3 победителя + 3 запасных случайно. Админ проверяет, что история висела сутки, и подтверждает (или заменяет запасным) */
async function storyDraw(env,C){let E=(await env.DB.prepare("SELECT s.uid,s.tg,s.ig,COALESCE(u.nick,u.name) AS name FROM story_entries s JOIN users u ON u.id=s.uid WHERE s.contest=?").bind(C.id).all()).results;
  if(C.fr){const F=(await env.DB.prepare("SELECT ref,COUNT(*) AS n FROM users WHERE ref IS NOT NULL AND created>=? AND COALESCE(json_extract(state,'$.nOp'),0)>=? GROUP BY ref").bind(C.start,CHAL_OPEN).all()).results,m=new Map(F.map(r=>[r.ref,r.n]));
    const all=E.length;E=E.filter(e=>(m.get(e.uid)||0)>=C.fr);for(const a of ADMINS)await notify(env,a,"📸 Конкурс "+C.id+": выложили историю "+all+", из них пригласили "+C.fr+"+ друзей: "+E.length+". Победители выбираются только из них.","⚔️ Открыть")}
  const pick=[];const P=E.slice();while(pick.length<6&&P.length){const b=new Uint32Array(1);crypto.getRandomValues(b);pick.push(P.splice(b[0]%P.length,1)[0])}
  const R={win:pick.slice(0,3).map((w,k)=>({...w,place:k+1,ok:0})),res:pick.slice(3),total:E.length,conf:0};await kvSet(env,"story_res:"+C.id,R);
  for(const a of ADMINS)await notify(env,a,"📸 Итоги конкурса историй: участников "+E.length+".\n\nПобедители (проверь, что история висела сутки):\n"+(R.win.map(w=>MEDAL[w.place-1]+" "+w.name+" (id "+w.uid+")"+(w.tg?" · TG @"+w.tg:"")+(w.ig?" · IG @"+w.ig:"")).join("\n")||"никого")+(R.res.length?"\n\nЗапасные:\n"+R.res.map(w=>w.name+" (id "+w.uid+")"+(w.tg?" · TG @"+w.tg:"")+(w.ig?" · IG @"+w.ig:"")).join("\n"):"")+"\n\nИстории могли уже пропасть (живут 24 часа), поэтому попроси у победителя скрин из архива историй с датой и просмотрами. Подтверди или замени в игре: Профиль → Топ → статистика → «📸 Итоги конкурса историй».","⚔️ Открыть")}
async function storyAdmin(env,me,a,p){if(!isAdmin(env,me.id))fail("Нет доступа");let C=await chalCfg(env);if(!C||!C.story)C=CHAL_PREV;if(!C||!C.story)fail("Нет конкурса историй");const R=await kvGet(env,"story_res:"+C.id);
  if(a==="story_res")return {id:C.id,resAt:C.resAt,prizes:C.prizes,R};if(!R)fail("Итогов ещё нет");const w=R.win.find(x=>x.place===(p.place|0));if(!w)fail("Нет такого места");if(w.ok)fail("Уже подтверждён");
  if(a==="story_no"){const nx=R.res.shift();if(!nx){R.win=R.win.filter(x=>x!==w)}else Object.assign(w,{uid:nx.uid,tg:nx.tg,ig:nx.ig,name:nx.name,ok:0});await kvSet(env,"story_res:"+C.id,R);return {R}}
  if(a==="story_ok"&&w.place===1&&C.gift){const g=await giftMint(env,w.uid,C.gift,"contest");if(!g)fail("Тираж подарка закончился — выдай приз вручную");w.ok=1;w.gift=g;
    await notify(env,w.uid,"🥇 ТЫ ПОБЕДИЛ В РОЗЫГРЫШЕ — 1 МЕСТО!\n\n🐉 NFT-подарок «"+GIFTS[C.gift].n+"» с ошибкой печати № "+g.no+" из "+GIFTS[C.gift].run+" уже у тебя в игре! Поставь его на витрину — пусть все видят.","🏛 Моя витрина",PAGE+"?shelf=1");
    if(R.win.every(x=>x.ok)&&!R.conf){R.conf=1;await chanSend(env,C,{text:"🎉 ИТОГИ РОЗЫГРЫША NFT-ПОДАРКА\n\nУчастников: "+R.total+"\n\n"+R.win.map(x=>MEDAL[x.place-1]+" "+x.name+" — "+C.prizes[x.place-1]).join("\n")+"\n\nПоздравляем! Призы уже в игре у победителей 🎁 Спасибо всем, кто рассказал о нас!\n\n👉 @VoinyEpohBot"})}
    await kvSet(env,"story_res:"+C.id,R);return {R}}
  if(a==="story_ok"){w.ok=1;const k=w.place-1,amt=C.bal[k]||0;if(amt)await env.DB.prepare("UPDATE users SET star_bal=star_bal+? WHERE id=?").bind(amt,w.uid).run();
    await notify(env,w.uid,MEDAL[k]+" ТЫ ПОБЕДИЛ В КОНКУРСЕ ИСТОРИЙ — "+(k+1)+" МЕСТО!\n\n"+(amt?"⭐ "+amt+" звёзд уже на твоём игровом балансе — трать на любые покупки в игре.":"🎁 Твой приз — "+C.prizes[0]+". Напиши @voinovadmin, чтобы получить подарок, и пришли свой ID: "+w.uid),amt?"⭐ Потратить":"⚔️ Играть",amt?PAGE+"?shop=1":null);
    if(R.win.every(x=>x.ok)&&!R.conf){R.conf=1;await chanSend(env,C,{text:(C.gift?"🎉 ИТОГИ РОЗЫГРЫША NFT-ПОДАРКА":"🎉 ИТОГИ КОНКУРСА ИСТОРИЙ")+"\n\nУчастников: "+R.total+"\n\n"+R.win.map(x=>MEDAL[x.place-1]+" "+x.name+" — "+C.prizes[x.place-1]).join("\n")+"\n\nСпасибо всем, кто рассказал о нас! Победителям уже написал бот 🎁\n\n👉 @VoinyEpohBot"})}
    await kvSet(env,"story_res:"+C.id,R);return {R}}
  fail("Неизвестное действие")}
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
/* ---------- кланы ---------- */
const clanBossOf=week=>CLAN.boss[Math.abs(Math.floor(Date.parse(week)/6048e5))%CLAN.boss.length];
/* ---------- подарить карточку и обмен карточками между игроками ---------- */
const TR={giftDay:5,offerDay:20,ttl:24*3600e3,age:5};   // age: дарить и меняться можно, только если обоим аккаунтам не меньше 5 дней
const TR_OK="list_price IS NULL AND away=0 AND room_id IS NULL AND f<>5 AND f<>6 AND NOT (f=4 AND sn='000010')";   // не на рынке, не в походе/бою; «Основатель» и «Бесценная» не передаются
async function trUser(env,p){if(p.uid)return await env.DB.prepare("SELECT id,COALESCE(nick,name) AS name FROM users WHERE id=?").bind(Math.floor(+p.uid)).first();
  const key=nickKey(String(p.nick||"").trim().replace(/^@/,"").replace(/\s+/g,"_"));if(!key)fail("Напиши ник игрока");return await env.DB.prepare("SELECT id,COALESCE(nick,name) AS name FROM users WHERE nick_key=?").bind(key).first()}
async function tradeApi(env,me,a,p){const now=Date.now(),d0=(dayNum(now))*864e5-TZ,one=async(q,...x)=>(await env.DB.prepare(q).bind(...x).first())||{};
  const ageOk=async(uid,who)=>{const c=(await one("SELECT created FROM users WHERE id=?",uid)).created||now,d=Math.floor((now-c)/864e5);if(d<TR.age)fail((who?who+" играет":"Ты играешь")+" "+d+" "+(d===1?"день":d>=2&&d<=4?"дня":"дней")+". Дарить и меняться карточками можно, когда обоим аккаунтам "+TR.age+"+ дней"+(who?"":" — осталось "+(TR.age-d)+" "+(TR.age-d===1?"день":"дня")))};
  if(a==="tr_stats"){if(!isAdmin(env,me.id))fail("Нет доступа");return await trStats(env,now)}
  if(a==="tr_pair"){if(!isAdmin(env,me.id))fail("Нет доступа");const x=Math.floor(+p.a),y=Math.floor(+p.b);
    const rows=(await env.DB.prepare("SELECT t.kind,t.a,t.b,t.av,t.bv,t.done,ca.h AS ah,ca.f AS af,cb.h AS bh,cb.f AS bf FROM trades t LEFT JOIN cards ca ON ca.id=t.ac LEFT JOIN cards cb ON cb.id=t.bc WHERE t.status='done' AND ((t.a=? AND t.b=?) OR (t.a=? AND t.b=?)) ORDER BY t.id DESC LIMIT 60").bind(x,y,y,x).all()).results;
    return {rows:rows.map(r=>({kind:r.kind,dir:r.a===x?1:0,t:r.done,av:r.av||0,bv:r.bv||0,a:r.ah!=null?HEROES[r.ah][0]+" ("+FIN[r.af].k.toLowerCase()+")":"?",b:r.bh!=null?HEROES[r.bh][0]+" ("+FIN[r.bf].k.toLowerCase()+")":null}))}}
  const card=async(id,owner)=>await env.DB.prepare("SELECT * FROM cards WHERE id=? AND owner=? AND "+TR_OK).bind(Math.floor(+id||0),owner).first();
  const cnt=async uid=>(await one("SELECT COUNT(*) AS n FROM cards WHERE owner=?",uid)).n||0;
  const myName=await nameOf(env,me.id),cname=c=>HEROES[c.h][0]+" ("+FIN[c.f].k.toLowerCase()+(c.stars?" ★"+c.stars:"")+")";
  if(a==="tr_cards"){const T=await trUser(env,p);if(!T)fail("Игрока с таким ником нет");if(T.id===me.id)fail("Это ты 🙂");
    const cs=(await env.DB.prepare("SELECT * FROM cards WHERE owner=? AND "+TR_OK+" ORDER BY v DESC LIMIT 60").bind(T.id).all()).results.map(rowToCard);return {uid:T.id,name:T.name,cards:cs.map(pub)}}
  if(a==="tr_gift"){const T=await trUser(env,p);if(!T)fail("Игрока с таким ником нет");if(T.id===me.id)fail("Себе подарить нельзя 🙂");await ageOk(me.id);await ageOk(T.id,T.name);
    if((await one("SELECT COUNT(*) AS n FROM trades WHERE a=? AND kind='gift' AND t>=?",me.id,d0)).n>=TR.giftDay)fail("Дарить можно до "+TR.giftDay+" карточек в день");
    const c=await card(p.id,me.id);if(!c)fail("Эту карточку сейчас нельзя подарить: она на рынке, в походе или бою");{const tc=await capUid(env,T.id);if(await cnt(T.id)>=tc)fail("У "+T.name+" коллекция заполнена ("+tc+")")}
    const r=await env.DB.prepare("UPDATE cards SET owner=? WHERE id=? AND owner=? AND "+TR_OK).bind(T.id,c.id,me.id).run();if(r.meta.changes!==1)fail("Не получилось, попробуй ещё раз");
    await env.DB.prepare("INSERT INTO trades(kind,a,b,ac,status,t,done,av) VALUES('gift',?,?,?,'done',?,?,?)").bind(me.id,T.id,c.id,now,now,c.v).run();
    await env.DB.prepare("UPDATE trades SET status='gone' WHERE status='new' AND (ac=? OR bc=?)").bind(c.id,c.id).run();
    await notify(env,T.id,"🎁 "+myName+" подарил тебе карточку: "+cname(c)+"! Она уже в твоей коллекции.","🗂 Открыть",PAGE+"?cards=1");return {to:T.name}}
  if(a==="tr_offer"){const T=await trUser(env,p);if(!T)fail("Игрока с таким ником нет");if(T.id===me.id)fail("Это ты 🙂");await ageOk(me.id);await ageOk(T.id,T.name);
    if((await one("SELECT COUNT(*) AS n FROM trades WHERE a=? AND kind='swap' AND t>=?",me.id,d0)).n>=TR.offerDay)fail("Не больше "+TR.offerDay+" предложений обмена в день");
    const mc=await card(p.my,me.id),tc=await card(p.their,T.id);if(!mc)fail("Твою карточку сейчас нельзя обменять");if(!tc)fail("Эту карточку игрока сейчас нельзя обменять");
    if(await one("SELECT id FROM trades WHERE status='new' AND a=? AND ac=? AND bc=?",me.id,mc.id,tc.id).id)fail("Такое предложение уже отправлено");
    const r=await env.DB.prepare("INSERT INTO trades(kind,a,b,ac,bc,status,t) VALUES('swap',?,?,?,?,'new',?) RETURNING id").bind(me.id,T.id,mc.id,tc.id,now).first();
    await notify(env,T.id,"🔄 "+myName+" предлагает обмен:\n\nОтдаёт: "+cname(mc)+"\nХочет: твою "+cname(tc)+"\n\nОткрой игру, чтобы принять или отказаться. Предложение действует 24 часа.","🔄 Посмотреть обмен",PAGE+"?trades=1");return {id:r.id,to:T.name}}
  if(a==="tr_list"){const rows=(await env.DB.prepare("SELECT t.*,COALESCE(ua.nick,ua.name) AS an,COALESCE(ub.nick,ub.name) AS bn FROM trades t LEFT JOIN users ua ON ua.id=t.a LEFT JOIN users ub ON ub.id=t.b WHERE t.kind='swap' AND t.status='new' AND t.t>? AND (t.a=? OR t.b=?) ORDER BY t.id DESC LIMIT 30").bind(now-TR.ttl,me.id,me.id).all()).results;
    const ids=[...new Set(rows.flatMap(r=>[r.ac,r.bc]))],cs=ids.length?(await env.DB.prepare("SELECT * FROM cards WHERE id IN ("+ids.map(()=>"?").join(",")+")").bind(...ids).all()).results:[],cm=new Map(cs.map(c=>[c.id,pub(rowToCard(c))]));
    return {items:rows.map(r=>({id:r.id,mine:r.a===me.id?1:0,who:r.a===me.id?r.bn:r.an,give:cm.get(r.a===me.id?r.ac:r.bc)||null,get:cm.get(r.a===me.id?r.bc:r.ac)||null,t:r.t}))}}
  if(a==="tr_accept"||a==="tr_decline"){const T=await env.DB.prepare("SELECT * FROM trades WHERE id=? AND kind='swap' AND status='new'").bind(p.id|0).first();if(!T)fail("Предложение уже неактуально");
    if(a==="tr_decline"){if(T.a!==me.id&&T.b!==me.id)fail("Это не твой обмен");await env.DB.prepare("UPDATE trades SET status=? WHERE id=?").bind(T.a===me.id?"cancel":"no",T.id).run();
      if(T.b===me.id)await notify(env,T.a,"🔄 "+myName+" отказался от обмена.","🗂 Карточки",PAGE+"?cards=1");return {}}
    if(T.b!==me.id)fail("Принять может только тот, кому предложили");await ageOk(T.b);await ageOk(T.a,"Отправитель");if(now-T.t>TR.ttl){await env.DB.prepare("UPDATE trades SET status='old' WHERE id=?").bind(T.id).run();fail("Предложение истекло")}
    const r=await env.DB.prepare("UPDATE cards SET owner=CASE id WHEN ? THEN ? ELSE ? END WHERE id IN (?,?) AND (SELECT COUNT(*) FROM cards WHERE ((id=? AND owner=?) OR (id=? AND owner=?)) AND "+TR_OK+")=2").bind(T.ac,T.b,T.a,T.ac,T.bc,T.ac,T.a,T.bc,T.b).run();
    if(r.meta.changes!==2){await env.DB.prepare("UPDATE trades SET status='gone' WHERE id=?").bind(T.id).run();fail("Одна из карточек уже недоступна (продана, на рынке или в бою). Обмен отменён")}
    {const va=await one("SELECT v FROM cards WHERE id=?",T.ac),vb=await one("SELECT v FROM cards WHERE id=?",T.bc);await env.DB.prepare("UPDATE trades SET status='done',done=?,av=?,bv=? WHERE id=?").bind(now,va.v||0,vb.v||0,T.id).run()}
    await env.DB.prepare("UPDATE trades SET status='gone' WHERE status='new' AND id<>? AND (ac IN (?,?) OR bc IN (?,?))").bind(T.id,T.ac,T.bc,T.ac,T.bc).run();
    const c=await env.DB.prepare("SELECT * FROM cards WHERE id=?").bind(T.bc).first();await notify(env,T.a,"✅ "+myName+" принял обмен! Теперь у тебя "+(c?cname(c):"новая карточка")+".","🗂 Открыть",PAGE+"?cards=1");return {}}
  fail("Неизвестное действие")}
/* статистика передач: кто кому отдаёт ценность. Перевес = сколько монет «перетекло» от a к b (подарок целиком, в обмене — разница цен) */
async function trStats(env,now){const all=async(q,...x)=>(await env.DB.prepare(q).bind(...x).all()).results;
  const rows=await all("SELECT a,b,kind,COALESCE(av,0) AS av,COALESCE(bv,0) AS bv,done FROM trades WHERE status='done' AND done>?",now-30*864e5);
  const P=new Map();for(const r of rows){const k=r.a+">"+r.b,x=P.get(k)||{a:r.a,b:r.b,gifts:0,swaps:0,value:0,last:0};if(r.kind==="gift"){x.gifts++;x.value+=r.av}else{x.swaps++;x.value+=r.av-r.bv}x.last=Math.max(x.last,r.done||0);P.set(k,x)}
  // если перевес отрицательный — на самом деле течёт в обратную сторону
  const pairs=[];for(const x of P.values()){const y=x.value>=0?x:{...x,a:x.b,b:x.a,value:-x.value};const back=P.get(y.b+">"+y.a);pairs.push({...y,oneway:!back||back===x?1:0})}
  pairs.sort((p,q)=>q.value-p.value);const top=pairs.slice(0,25),ids=[...new Set(top.flatMap(p=>[p.a,p.b]))];
  const U=new Map();if(ids.length)for(const u of await all("SELECT id,COALESCE(nick,name) AS name,created,ref,seen,(SELECT COUNT(*) FROM user_days d WHERE d.uid=users.id) AS days,(SELECT COALESCE(SUM(stars),0) FROM payments p WHERE p.uid=users.id AND p.status='done') AS paid FROM users WHERE id IN ("+ids.map(()=>"?").join(",")+")",...ids))U.set(u.id,u);
  const fl=p=>{const A=U.get(p.a)||{},B=U.get(p.b)||{},f=[];if(A.ref===p.b||B.ref===p.a)f.push("🔗 приглашение");if(Math.abs((A.created||0)-(B.created||0))<2*3600e3)f.push("⏱ созданы рядом");
    if((A.days||0)<=6&&(A.paid||0)===0)f.push("🆕 отдающий почти не играет");if(p.oneway&&p.gifts>=3)f.push("↪️ только в одну сторону");return f};
  const tot=await env.DB.prepare("SELECT SUM(kind='gift') AS g,SUM(kind='swap') AS s,COUNT(DISTINCT a) AS ua FROM trades WHERE status='done' AND done>?").bind(now-7*864e5).first()||{};
  return {week:{gifts:tot.g||0,swaps:tot.s||0,senders:tot.ua||0},pairs:top.map(p=>{const A=U.get(p.a)||{},B=U.get(p.b)||{};return {...p,an:A.name||"?",bn:B.name||"?",adays:A.days||0,bdays:B.days||0,apaid:A.paid||0,flags:fl(p),risk:fl(p).length}})}}
async function clanMembers(env,cid){return (await env.DB.prepare("SELECT id,COALESCE(nick,name) AS name,vip_until FROM users WHERE clan=? ORDER BY id").bind(cid).all()).results}
async function clanBoss(env,cid,week,n){let B=await env.DB.prepare("SELECT * FROM clan_boss WHERE clan=? AND week=?").bind(cid,week).first();
  if(!B){await env.DB.prepare("INSERT OR IGNORE INTO clan_boss(clan,week,lvl,hp) VALUES(?,?,1,?)").bind(cid,week,clanHp(n,1)).run();B=await env.DB.prepare("SELECT * FROM clan_boss WHERE clan=? AND week=?").bind(cid,week).first()}return B}
async function clanTop(env,week){return cached("clantop"+week,10e3,async()=>(await env.DB.prepare("SELECT c.id,c.name,c.h,COALESCE(b.total,0) AS total,COALESCE(b.kills,0) AS kills,(SELECT COUNT(*) FROM users u WHERE u.clan=c.id) AS n FROM clans c LEFT JOIN clan_boss b ON b.clan=c.id AND b.week=? ORDER BY total DESC,c.id LIMIT 30").bind(week).all()).results)}
async function clanApi(env,me,a,p){const now=Date.now(),week=mskWeek(now),day=mskDay(now);
  const u=await env.DB.prepare("SELECT clan,cash,state FROM users WHERE id=?").bind(me.id).first()||{clan:0,cash:0};
  if(a==="clan_info"){const top=await clanTop(env,week);if(!u.clan){const inv=(await env.DB.prepare("SELECT i.clan AS id,c.name,COALESCE(f.nick,f.name) AS from_name FROM clan_inv i JOIN clans c ON c.id=i.clan LEFT JOIN users f ON f.id=i.from_uid WHERE i.uid=? AND i.t>? ORDER BY i.t DESC LIMIT 5").bind(me.id,now-3*864e5).all()).results;return {clan:null,top,week,inv}}
    const C=await env.DB.prepare("SELECT * FROM clans WHERE id=?").bind(u.clan).first();if(!C){await env.DB.prepare("UPDATE users SET clan=0 WHERE id=?").bind(me.id).run();return {clan:null,top,week}}
    const mem=await clanMembers(env,C.id),B=await clanBoss(env,C.id,week,mem.length);
    const hits=(await env.DB.prepare("SELECT uid,dmg,day,n FROM clan_hits WHERE clan=? AND week=?").bind(C.id,week).all()).results,hm=new Map(hits.map(h=>[h.uid,h]));
    const mine=hm.get(me.id),left=CLAN.hits-(mine&&mine.day===day?mine.n:0);const [bn,bh]=clanBossOf(week);
    return {clan:{id:C.id,name:C.name,h:C.h,owner:C.owner,deputy:C.deputy||0,place:top.findIndex(r=>r.id===C.id)+1,members:mem.map(m=>({uid:m.id,name:m.name,vip:(m.vip_until||0)>now?1:0,dmg:(hm.get(m.id)||{}).dmg||0})).sort((x,y)=>y.dmg-x.dmg)},
      boss:{name:bn,h:bh,lvl:B.lvl,hp:B.hp,dmg:B.dmg,total:B.total,kills:B.kills},left,top,week,weekEnd:Date.parse(week+"T00:00:00Z")-TZ+7*864e5}}
  if(a==="clan_create"){if(u.clan)fail("Ты уже в клане");const name=checkNick(p.name).replace(/_/g," ");const key=name.toLowerCase().replace(/ё/g,"е");
    if((u.cash||0)<CLAN.cost)fail("Создание клана стоит "+CLAN.cost.toLocaleString("ru")+" 🪙");
    const best=(await env.DB.prepare("SELECT h FROM cards WHERE owner=? ORDER BY v DESC LIMIT 1").bind(me.id).first())||{h:0};
    let id;try{const r=await env.DB.prepare("INSERT INTO clans(name,name_key,owner,h,created) VALUES(?,?,?,?,?) RETURNING id").bind(name,key,me.id,best.h<NBASE?best.h:0,now).first();id=r.id}catch(e){fail("Клан с таким названием уже есть")}
    const pay=await env.DB.prepare("UPDATE users SET cash=cash-?,clan=? WHERE id=? AND cash>=? AND clan=0").bind(CLAN.cost,id,me.id,CLAN.cost).run();
    if(pay.meta.changes!==1){await env.DB.prepare("DELETE FROM clans WHERE id=?").bind(id).run();fail("Не получилось создать клан")}delete topCache["clantop"+week];return {id}}
  if(a==="clan_join"){if(u.clan)fail("Сначала выйди из своего клана");const cid=p.id|0,C=await env.DB.prepare("SELECT id,name FROM clans WHERE id=?").bind(cid).first();if(!C)fail("Клан не найден");
    const r=await env.DB.prepare("UPDATE users SET clan=? WHERE id=? AND clan=0 AND (SELECT COUNT(*) FROM users WHERE clan=?)<?").bind(cid,me.id,cid,CLAN.max).run();if(r.meta.changes!==1)fail("В клане уже "+CLAN.max+" человек");
    const nm=await nameOf(env,me.id);for(const m of await clanMembers(env,cid))if(m.id!==me.id)await notify(env,m.id,"⚔️ В клан «"+C.name+"» вступил "+nm+"! Вместе босса бить веселее.","⚔️ Клан",PAGE+"?clan=1");
    await env.DB.prepare("DELETE FROM clan_inv WHERE uid=?").bind(me.id).run();delete topCache["clantop"+week];return {id:cid}}
  if(a==="clan_leave"){if(!u.clan)fail("Ты не в клане");await env.DB.prepare("UPDATE users SET clan=0 WHERE id=?").bind(me.id).run();
    const C=await env.DB.prepare("SELECT * FROM clans WHERE id=?").bind(u.clan).first();const rest=await clanMembers(env,u.clan);
    if(!rest.length)await env.DB.prepare("DELETE FROM clans WHERE id=?").bind(u.clan).run();else if(C&&C.owner===me.id){const nx=rest.find(m=>m.id===C.deputy)||rest[0];await env.DB.prepare("UPDATE clans SET owner=?,deputy=0 WHERE id=?").bind(nx.id,u.clan).run();await notify(env,nx.id,"👑 Ты теперь глава клана «"+C.name+"»! Прежний глава вышел.","⚔️ Клан",PAGE+"?clan=1")}
    else if(C&&C.deputy===me.id)await env.DB.prepare("UPDATE clans SET deputy=0 WHERE id=?").bind(u.clan).run();
    delete topCache["clantop"+week];return {}}
  /* управление кланом: глава и правая рука зовут и выгоняют, глава назначает правую руку и награждает монетами */
  if(a==="clan_kick"||a==="clan_invite"||a==="clan_deputy"||a==="clan_reward"){if(!u.clan)fail("Ты не в клане");const C=await env.DB.prepare("SELECT * FROM clans WHERE id=?").bind(u.clan).first();if(!C)fail("Клан не найден");
    const boss=C.owner===me.id,dep=C.deputy===me.id;if(!boss&&!(dep&&(a==="clan_kick"||a==="clan_invite")))fail(a==="clan_reward"||a==="clan_deputy"?"Это может только глава клана":"Это могут глава и правая рука");
    const myName=await nameOf(env,me.id);
    if(a==="clan_invite"){const key=nickKey(String(p.nick||"").trim().replace(/^@/,"").replace(/\s+/g,"_"));if(!key)fail("Напиши ник игрока");const t=await env.DB.prepare("SELECT id,clan,COALESCE(nick,name) AS name FROM users WHERE nick_key=?").bind(key).first();
      if(!t)fail("Игрока с таким ником нет");if(t.id===me.id)fail("Это ты 🙂");if(t.clan===C.id)fail(t.name+" уже в твоём клане");
      if(((await env.DB.prepare("SELECT COUNT(*) AS n FROM users WHERE clan=?").bind(C.id).first())||{}).n>=CLAN.max)fail("В клане уже "+CLAN.max+" человек");
      await env.DB.prepare("INSERT INTO clan_inv(clan,uid,from_uid,t) VALUES(?,?,?,?) ON CONFLICT(clan,uid) DO UPDATE SET from_uid=excluded.from_uid,t=excluded.t").bind(C.id,t.id,me.id,now).run();
      await notify(env,t.id,"🛡 "+myName+" зовёт тебя в клан «"+C.name+"»!\n\nВместе бейте общего босса недели: за победу каждому сундук с прокрутками и монетами, а топ-3 клана недели получают ещё больше."+(t.clan?"\n\nЧтобы вступить, сначала выйди из своего клана.":""),"🛡 Открыть приглашение",PAGE+"?clan=1");
      return {name:t.name}}
    const uid=Math.floor(+p.uid||0),T=uid?await env.DB.prepare("SELECT id,clan,COALESCE(nick,name) AS name FROM users WHERE id=?").bind(uid).first():null;
    if(a==="clan_deputy"){if(uid&&(!T||T.clan!==C.id))fail("Этого игрока нет в клане");if(uid===me.id)fail("Глава и так главный 🙂");
      await env.DB.prepare("UPDATE clans SET deputy=? WHERE id=?").bind(uid||0,C.id).run();if(uid)await notify(env,uid,"⭐ "+myName+" назначил тебя правой рукой клана «"+C.name+"»! Теперь ты можешь звать и выгонять участников.","⚔️ Клан",PAGE+"?clan=1");return {deputy:uid||0}}
    if(!T||T.clan!==C.id)fail("Этого игрока нет в клане");if(uid===me.id)fail("Это ты 🙂");
    if(a==="clan_kick"){if(uid===C.owner)fail("Главу выгнать нельзя");if(dep&&uid===C.deputy)fail("Правую руку может убрать только глава");
      await env.DB.prepare("UPDATE users SET clan=0 WHERE id=? AND clan=?").bind(uid,C.id).run();if(C.deputy===uid)await env.DB.prepare("UPDATE clans SET deputy=0 WHERE id=?").bind(C.id).run();
      await notify(env,uid,"🛡 Тебя исключили из клана «"+C.name+"». Можно вступить в другой клан или создать свой.","⚔️ Кланы",PAGE+"?clan=1");delete topCache["clantop"+week];return {}}
    if(a==="clan_reward"){const amt=Math.floor(+p.amount||0);if(amt<CLAN.rewardMin)fail("Минимум "+CLAN.rewardMin+" 🪙");
      const k="crw:"+day+":"+me.id,given=(await kvGet(env,k))||0;if(given+amt>CLAN.rewardDay)fail("За день можно раздать не больше "+CLAN.rewardDay.toLocaleString("ru")+" 🪙. Осталось "+(CLAN.rewardDay-given).toLocaleString("ru"));
      const pay=await env.DB.prepare("UPDATE users SET cash=cash-? WHERE id=? AND cash>=?").bind(amt,me.id,amt).run();if(pay.meta.changes!==1)fail("Не хватает монет");
      const got=await env.DB.prepare("UPDATE users SET cash=cash+? WHERE id=? AND clan=?").bind(amt,uid,C.id).run();if(got.meta.changes!==1){await env.DB.prepare("UPDATE users SET cash=cash+? WHERE id=?").bind(amt,me.id).run();fail("Игрок только что вышел из клана")}
      await kvSet(env,k,given+amt);
      await notify(env,uid,"🎖 Глава клана «"+C.name+"» "+myName+" наградил тебя: +"+amt.toLocaleString("ru")+" 🪙! Спасибо за вклад в клан.","⚔️ Клан",PAGE+"?clan=1");return {amount:amt}}}
  if(a==="clan_decline"){await env.DB.prepare("DELETE FROM clan_inv WHERE uid=? AND clan=?").bind(me.id,p.id|0).run();return {}}
  if(a==="clan_hit"){if(!u.clan)fail("Сначала вступи в клан");const cid=u.clan,mem=await clanMembers(env,cid),B=await clanBoss(env,cid,week,mem.length);
    await env.DB.prepare("INSERT OR IGNORE INTO clan_hits(clan,week,uid,dmg,day,n) VALUES(?,?,?,0,?,0)").bind(cid,week,me.id,day).run();
    const H=await env.DB.prepare("SELECT * FROM clan_hits WHERE clan=? AND week=? AND uid=?").bind(cid,week,me.id).first();const n=H.day===day?H.n:0;if(n>=CLAN.hits)fail("Удары на сегодня закончились. Завтра снова "+CLAN.hits);
    const cards=(await env.DB.prepare("SELECT * FROM cards WHERE owner=?").bind(me.id).all()).results.map(rowToCard);if(!cards.length)fail("Сначала открой карточки — бьют твои воины");
    let {dmg,crit}=clanDmg(cards),dgd=0;try{const D=JSON.parse(u.state||"{}").dg;if(D){dgd=Math.round(dgPower(D)*.4*(dgSat(D,now)<DG.hungry?.5:1));dmg+=dgd}}catch(e){}const up=await env.DB.prepare("UPDATE clan_hits SET dmg=dmg+?,day=?,n=? WHERE clan=? AND week=? AND uid=? AND (day IS NOT ? OR n=?)").bind(dmg,day,n+1,cid,week,me.id,day,n).run();
    if(up.meta.changes!==1)fail("Слишком быстро, попробуй ещё раз");
    await env.DB.prepare("UPDATE clan_boss SET dmg=dmg+?,total=total+? WHERE clan=? AND week=?").bind(dmg,dmg,cid,week).run();
    let kill=null;const B2=await env.DB.prepare("SELECT * FROM clan_boss WHERE clan=? AND week=?").bind(cid,week).first();
    if(B2.dmg>=B2.hp){const r=await env.DB.prepare("UPDATE clan_boss SET lvl=lvl+1,dmg=0,hp=?,kills=kills+1 WHERE clan=? AND week=? AND lvl=? AND dmg>=hp").bind(clanHp(mem.length,B2.lvl+1),cid,week,B2.lvl).run();
      if(r.meta.changes===1){const ids=(await env.DB.prepare("SELECT uid FROM clan_hits WHERE clan=? AND week=? AND dmg>0").bind(cid,week).all()).results.map(x=>x.uid);const [bn]=clanBossOf(week);
        for(const id of ids){await env.DB.prepare("UPDATE users SET gift_spins=gift_spins+?,cash=cash+? WHERE id=? AND clan=?").bind(CLAN.chest.sp,CLAN.chest.cash,id,cid).run();
          if(id!==me.id)await notify(env,id,"🏆 Клан победил босса «"+bn+"» (ур. "+B2.lvl+")! Сундук клана: +"+CLAN.chest.sp+" прокруток и +"+CLAN.chest.cash+" 🪙 уже у тебя. Дальше босс сильнее — бейте!","⚔️ Клан",PAGE+"?clan=1")}
        kill={lvl:B2.lvl,sp:CLAN.chest.sp,cash:CLAN.chest.cash}}}
    delete topCache["clantop"+week];try{await doAction(env,me,"pass_note",{k:"clan",n:1},{grant:true})}catch(e){}return {dmg,crit,kill,left:CLAN.hits-n-1,dgd}}
  fail("Неизвестное действие")}
/* в понедельник награды топ-3 кланам прошлой недели */
let clanWBusy=false;
async function clanWeekTick(env){if(clanWBusy)return;const now=Date.now(),prev=mskWeek(now-7*864e5);if(now-(Date.parse(mskWeek(now)+"T00:00:00Z")-TZ)>12*3600e3)return;
  clanWBusy=true;try{if(await kvGet(env,"clanw:"+prev))return;await kvSet(env,"clanw:"+prev,1);
    const top=(await env.DB.prepare("SELECT clan,total FROM clan_boss WHERE week=? AND total>0 ORDER BY total DESC LIMIT 3").bind(prev).all()).results;
    for(let i=0;i<top.length;i++){const C=await env.DB.prepare("SELECT name FROM clans WHERE id=?").bind(top[i].clan).first();if(!C)continue;
      for(const m of await clanMembers(env,top[i].clan)){await env.DB.prepare("UPDATE users SET gift_spins=gift_spins+? WHERE id=?").bind(CLAN.week[i],m.id).run();
        await notify(env,m.id,["🥇","🥈","🥉"][i]+" Клан «"+C.name+"» — "+(i+1)+" место за неделю! Каждому участнику +"+CLAN.week[i]+" прокруток.","⚔️ Клан",PAGE+"?clan=1")}}}finally{clanWBusy=false}}
/* удержание: +3 прокрутки за включённые напоминания; сундук возвращения на следующий день после регистрации, бот зовёт за ним с 12:00 до 21:00 */
const PM_BONUS=5, CB={sp:5,cash:300};
let cbBusy=false;
async function cbTick(env){if(cbBusy||!env.BOT_TOKEN||env.DEV==="1"&&!env.NOTIFY_TEST)return;const now=Date.now(),h=new Date(now+TZ).getUTCHours();if(h<12||h>=21)return;
  cbBusy=true;try{const d0=dayNum(now)*864e5-TZ,y0=d0-864e5;
    const us=(await env.DB.prepare("SELECT id FROM users WHERE pm=1 AND cb_claim=0 AND cb_note=0 AND created>=? AND created<? LIMIT 25").bind(y0,d0).all()).results;
    for(const u of us){await env.DB.prepare("UPDATE users SET cb_note=1 WHERE id=?").bind(u.id).run();
      await notify(env,u.id,"🎁 Твой сундук готов!\n\nВчера ты начал собирать воинов — а сегодня тебя ждёт подарок: "+CB.sp+" прокруток и "+CB.cash+" 🪙.\n\nЗаходи и забирай, пока не остыл 🔥","🎁 Забрать сундук")}}finally{cbBusy=false}}
/* ---------- разовая рассылка о большом обновлении 24.10: пост в канал + всем в бота (окно 20:30–22:50 по Минску, если не успели — завтра 9:30–12:00) ---------- */
const TERMS_V=1;
const UPD={id:"upd0311map",cut:Date.UTC(2026,10,3,6,0),win:[[Date.UTC(2026,10,3,7,0),Date.UTC(2026,10,3,11,0)]],photo:"assets/post-map.jpg?v=1",btn:"🗺 Открыть карту мира",link:"?map=1",
 chan:"🗺 КРУПНОЕ ОБНОВЛЕНИЕ: КАРТА МИРА!\n\n50 земель от Рима до Киото — захватывай их своими воинами ⚔️\n\n🏰 Твои земли приносят монеты и руны каждый час\n🐉 Дракон помогает в бою — чем он сильнее, тем больше бонус\n🏛 Воин своей эпохи защищает «родную землю» сильнее\n🌱 Окраины открыты всем, 👑 Сердце мира — только для сильнейших\n🚩 Флаг со своим фото и статуи над твоими землями\n🎖 Пропуск завоевателя с наградами каждый месяц\n\n🥚 И главное: ДРАКОН ТЕПЕРЬ У ВСЕХ — яйцо разбивается сразу, без друзей и историй! А ещё с ним можно играть в мячик и исполнять его желания.\n\nКарта только открылась — все земли свободны. Успей занять свою первым 🔥\n\n👉 @VoinyEpohBot",
 dm:"🗺 КРУПНОЕ ОБНОВЛЕНИЕ: КАРТА МИРА!\n\n50 земель — захватывай их своими воинами ⚔️\n🏰 Земли приносят монеты и руны каждый час\n🐉 Твой дракон помогает в бою\n🚩 Флаги со своим фото и статуи над землями\n\n🥚 А ещё дракон теперь у всех — яйцо разбивается сразу!\n\nВсе земли пока свободны — займи свою первым 🔥"};
/* ---------- разовое сообщение в игре (раздел «Сообщения», от администрации) — без рассылки в бота ---------- */
const DMB={id:"dgst3110",from:Date.UTC(2026,9,31,9,0),to:Date.UTC(2026,10,7,21,0),where:"json_extract(state,'$.dg') IS NULL",
  text:"🐉 ДРАКОН ТЕПЕРЬ ОТКРЫВАЕТСЯ ЗА ИСТОРИЮ!\n\nРаньше тайное яйцо будили только друзья. Теперь есть второй путь — быстрее:\n\n📲 Выложи историю с игрой в Telegram или Instagram со ссылкой на бота\n✅ Нажми «Я выложил» во вкладке «Тайна»\n🔨 Яйцо треснет сразу — и внутри твой дракон!\n\nДракон растёт 60 уровней, помогает в боях и каждый день приносит подарки. Не удаляй историю 24 часа 😉\n\nP.S. Эта же история участвует в розыгрыше NFT-подарка «Дракончик» — итоги 1.11 в 22:00."};
async function dmBlast(env){const now=Date.now();if(now<DMB.from||now>DMB.to)return;if(await cached("dmb"+DMB.id,60e3,()=>kvGet(env,"dmb:"+DMB.id)))return;
  await kvSet(env,"dmb:"+DMB.id,{t:now});delete topCache["dmb"+DMB.id];const a=ADMINS[0];
  const r=await env.DB.prepare("INSERT INTO dm(a,b,text,t,adm) SELECT ?,id,?,?,1 FROM users WHERE id<>? AND "+DMB.where).bind(a,DMB.text,now,a).run();
  await kvSet(env,"dmb:"+DMB.id,{t:now,n:(r.meta&&r.meta.changes)||0})}
/* разовое мягкое сообщение тем, кто уже донатил: в Сокровищнице новинки. По 40 человек за заход, ID по порядку */
const DONB={id:"don1",text:"⭐ Привет! Спасибо, что поддерживаешь «Воинов Эпох» — это правда помогает игре расти ❤️\n\nПока тебя не было, в Сокровищнице появилось кое-что новое для тех, кто любит выделяться… 👀 Загляни во вкладку «Понт» — думаю, тебе понравится."};
async function donBlast(env){if(!env.BOT_TOKEN&&!env.NOTIFY_TEST)return 0;const k="donb:"+DONB.id,st=(await kvGet(env,k))||{last:0,n:0};if(st.done)return 0;
  const L=(await env.DB.prepare("SELECT DISTINCT p.uid FROM payments p JOIN users u ON u.id=p.uid WHERE p.status='done' AND p.uid>? AND u.pm=1 ORDER BY p.uid LIMIT 40").bind(st.last).all()).results;
  if(!L.length){await kvSet(env,k,Object.assign(st,{done:1}));return 0}let sent=0;
  for(const r of L){st.last=r.uid;if(isAdmin(env,r.uid))continue;if(await notify(env,r.uid,DONB.text,"👑 Посмотреть",PAGE+"?shop=flex"))sent++}
  st.n+=sent;await kvSet(env,k,st);return sent}
/* разовый пост в канал: акция «3 друга → VIP» (06.11). Уходит один раз в первом тике после обновления */
const CHPOST={id:"vip3_0611b",from:Date.UTC(2026,10,6,13,0),to:Date.UTC(2026,10,6,21,0),photo:"assets/post-vip3.jpg?v=1",btn:"👑 Забрать VIP",
  text:"👑 ХОЧЕШЬ ВЫДЕЛЯТЬСЯ? ТОГДА ЧИТАЙ.\n\nВ «Воины Эпох» уже сотни новых игроков. Все крутят карты, все в топах, все в чате…\nНо одних замечают сразу, а других — никогда.\n\nРазница — в короне у ника 👑\n\n🔥 ЗАПУСКАЕМ АКЦИЮ: ПРИГЛАСИ 3 ДРУЗЕЙ — ПОЛУЧИ VIP-СТАТУС\n\nС VIP ты:\n👑 с короной у ника — в топах, в чате, в бою. Все видят, кто тут главный\n🎴 крутишь 16 карт вместо 10 — пока другие ждут, ты уже собираешь мифики\n📦 держишь 360 карт в коллекции — есть чем похвастаться\n\nПока остальные просто играют — ты играешь с понтом 😎\n\nКак забрать:\n1️⃣ Игра → «Друзья» → копируешь свою ссылку\n2️⃣ Кидаешь трём друзьям\n3️⃣ Они открывают первые карточки — и корона твоя. Сама. Автоматически.\n\n⏳ Акция не навсегда. Выключим — и VIP снова только за звёзды.\n\n👉 t.me/VoinyEpohBot\n\nБудь тем, на кого смотрят. А не тем, кто смотрит 👑"};
async function chPostOnce(env){if(!env.BOT_TOKEN||env.DEV==="1")return;const now=Date.now();if(now<CHPOST.from||now>=CHPOST.to)return;const k="chpost:"+CHPOST.id;
  const st=(await cached("chp"+CHPOST.id,20e3,()=>kvGet(env,k)))||{n:0,t:0};if(st.ok||st.n>=40||now-st.t<30e3)return;
  st.n++;st.t=now;await kvSet(env,k,st);delete topCache["chp"+CHPOST.id];
  /* картинку берём с raw.githubusercontent — она доступна сразу после push, а GitHub Pages обновляется с задержкой */
  const kb={inline_keyboard:[[{text:CHPOST.btn,url:"https://t.me/VoinyEpohBot"}]]};
  let r=await tgApi(env,"sendPhoto",{chat_id:CHANNEL,photo:"https://raw.githubusercontent.com/prostovladon-prog/kruti-kvartiru-/main/"+CHPOST.photo.split("?")[0]+"?t="+st.n,caption:CHPOST.text.slice(0,1024),reply_markup:kb});
  if(!r.ok)r=await tgApi(env,"sendPhoto",{chat_id:CHANNEL,photo:PAGE+CHPOST.photo+"&t="+st.n,caption:CHPOST.text.slice(0,1024),reply_markup:kb});
  if(!r.ok&&st.n>=6)r=await tgApi(env,"sendMessage",{chat_id:CHANNEL,text:CHPOST.text,reply_markup:kb});   // совсем без картинки — лишь бы пост вышел
  if(r.ok){st.ok=1;await kvSet(env,k,st);delete topCache["chp"+CHPOST.id]}else console.error("chpost",st.n,r.description)}
/* ⭐ акция 06.11: промокод ВОИН200 — +200 ⭐ сверху к любому пополнению, до 23:59 МСК. Включается сам, пост в канал + рассылка в бота */
const P200={code:"ВОИН200",bon:200,until:Date.UTC(2026,10,6,20,59,59),id:"p200_0611",photo:"assets/post-promo200.jpg",btn:"⭐ Пополнить баланс",link:"?shop=flex",
  chan:"⭐ ТОЛЬКО СЕГОДНЯ: +200 ЗВЁЗД В ПОДАРОК!\n\nПополни игровой баланс на любую сумму — и получи сверху ещё 200 ⭐ бесплатно.\n\n🎟 Промокод: ВОИН200\nДействует до 23:59 — потом всё 🔥\n\n👉 @VoinyEpohBot",
  dm:"⭐ Воин, сегодня подарок!\n\nПополняешь игровой баланс на любую сумму — получаешь +200 ⭐ сверху бесплатно.\n\n🎟 Вводи промокод ВОИН200 в «Ещё → Промокод», потом пополняй баланс в «Донат и понт».\n⏳ Только до 23:59!"};
let p200Busy=false;
/* 🔥 Большое обновление 2.0: пост с фото в канал + рассылка в бота. Включается флагом on:true (после согласования с Владом) */
const BLAST2={id:"upd2_0711",on:true,photo:"assets/post-update2.jpg",btn:"🎁 Забрать подарок",link:"?upd=1",
  chan:"🔥 БОЛЬШОЕ ОБНОВЛЕНИЕ — ВОИНЫ ЭПОХ 2.0!\n\n👑 Империя — каждая карта теперь воин твоей армии. Расти от Племени до Легенды эпох и собирай дань каждый день\n🚀 Ракетка онлайн — один полёт на всех, забери до взрыва\n🐉 Земля драконов и 🤝 Земли союзов — новые земли для захвата\n💎 Алмазная серия — 51 редчайшая карта + 11 новых героев\n🏛 Зал славы, 💣 Сапёр, джекпот, музыка, темы и аватарки\n\n🎁 Всем подарок — 5 прокруток! Заходи и забирай 👇\n👉 @VoinyEpohBot",
  dm:"🔥 Воин, вышло БОЛЬШОЕ обновление!\n\n👑 Твоя Империя, 🚀 ракетка онлайн, 🐉 Земля драконов, 🤝 захват земель вдвоём, 💎 алмазные карты и ещё куча всего.\n\n🎁 Тебя ждёт подарок — 5 прокруток. Заходи забрать!"};
let b2Busy=false;
/* 🎟 анонс Билетной гонки: в 08:00 пост с фото в канал + рассылка в бота */
const BLAST_TK={id:"tk1108_ann",on:true,at:Date.UTC(2026,10,8,5,0),until:Date.UTC(2026,10,8,17,0),photo:"assets/post-tk.jpg",btn:"🎟 Участвовать",link:"?tk=1",
  chan:"🎟 БИЛЕТНАЯ ГОНКА — СТАРТ!\n\nСегодня с 08:00 до 22:00 собирай билеты:\n⏱ 1 билет за каждую минуту в игре\n🎴 за прокрутки, ⚔️ бои, 🏰 войну армий, 🎰 казино и дань Империи\n\nКто к 22:00 соберёт больше всех — забирает приз:\n🥇 300 ⭐ + 👑 Корона Эпох\n🥈 200 ⭐ + 🪶 Перо феникса\n🥉 100 ⭐ + 🐉 Дракончик\n\nЗвёзды — на игровой баланс, подарки — NFT в игре. Таблица лидеров — прямо в игре 👇\n👉 @VoinyEpohBot",
  dm:"🎟 Воин, стартовала БИЛЕТНАЯ ГОНКА!\n\nСегодня до 22:00 за каждую минуту в игре и за любые действия ты получаешь билеты. Топ-3 забирают 300/200/100 ⭐ + NFT-подарки 🏆\n\nЗаходи — гонка уже идёт!"};

/* ---------- 🎬 «Звезда Эпох»: конкурс видео 08.11 22:00 – 11.11 22:00 (Минск). Победителей выбирает админ после проверки ---------- */
const VC={id:"vc1",start:Date.UTC(2026,10,8,19,0),end:Date.UTC(2026,10,11,19,0),gifts:["crown","egg","feather","ring","hourglass","dragon","horn","lamp"]};
const VC_OK=u=>/^https:\/\/([a-z0-9-]+\.)*(tiktok\.com|youtube\.com|youtu\.be|instagram\.com)(\/[^\s]*)?$/i.test(u)&&u.length<=300;
async function vcApi(env,me,a,p){const now=Date.now(),adm=isAdmin(env,me.id),on=now>=VC.start&&now<VC.end;
  const pub=async()=>{const r=await env.DB.prepare("SELECT acc,vids,t FROM vc_part WHERE uid=?").bind(me.id).first();const n=(await env.DB.prepare("SELECT COUNT(*) AS n FROM vc_part").first()).n;
    const o={start:VC.start,end:VC.end,on:on?1:0,n,my:r?{acc:r.acc,vids:JSON.parse(r.vids||"[]")}:null,win:(await kvGet(env,"vc_win"))||null};
    if(adm)o.adm=(await env.DB.prepare("SELECT v.uid,v.acc,v.vids,v.t,COALESCE(u.nick,u.name) AS name FROM vc_part v JOIN users u ON u.id=v.uid ORDER BY v.t").all()).results.map(x=>({uid:x.uid,name:x.name,acc:x.acc,vids:JSON.parse(x.vids||"[]"),t:x.t}));
    return o};
  if(a==="vc_get")return pub();
  if(a==="vc_join"){if(now<VC.start)fail("Конкурс начнётся 08.11 в 22:00");if(now>=VC.end)fail("Конкурс завершён — итоги после проверки");
    const acc=String(p.acc||"").trim();if(!VC_OK(acc))fail("Вставь ссылку на свой аккаунт в TikTok, YouTube или Instagram (начинается с https://)");
    const vids=(Array.isArray(p.vids)?p.vids:[]).map(x=>String(x||"").trim()).filter(Boolean).slice(0,10);for(const v of vids)if(!VC_OK(v))fail("Ссылка на видео должна быть из TikTok, YouTube или Instagram: "+v.slice(0,60));
    await env.DB.prepare("INSERT INTO vc_part(uid,acc,vids,t,upd) VALUES(?,?,?,?,?) ON CONFLICT(uid) DO UPDATE SET acc=excluded.acc,vids=excluded.vids,upd=excluded.upd").bind(me.id,acc,JSON.stringify(vids),now,now).run();
    const res=await pub();res.ok1=1;return res}
  if(!adm)fail("Нет доступа");
  if(a==="vc_win"){if(await kvGet(env,"vc_win"))fail("Награды уже выданы");const U=(p.u||[]).map(uidOf);if(U.length!==3||U.some(x=>!x)||new Set(U).size!==3)fail("Укажи 3 разных ID победителей");
    const log=[];for(let i=0;i<3;i++){const uid=U[i],u=await env.DB.prepare("SELECT id,COALESCE(nick,name) AS name FROM users WHERE id=?").bind(uid).first();if(!u)fail("Нет игрока с ID "+uid);}
    for(let i=0;i<3;i++){const uid=U[i],u=await env.DB.prepare("SELECT id,COALESCE(nick,name) AS name FROM users WHERE id=?").bind(uid).first(),me2={id:uid,name:u.name||"Игрок"},got=[];
      try{await doAction(env,me2,"grant",{item:"mythic",pid:"vc1:"+uid},{grant:true});got.push("Мифический сундук")}catch(e){got.push("⚠️ сундук: "+e.message)}
      if(i<2){let g=null;for(const k of VC.gifts){try{g=await giftMint(env,uid,k,"prize")}catch(e){}if(g)break}got.push(g?"NFT-подарок":"⚠️ NFT-подарки закончились")}
      if(i===0){try{await doAction(env,me2,"title_grant",{k:"vstar"},{grant:true});got.push("статус «Звезда Эпох»")}catch(e){got.push("⚠️ статус: "+e.message)}}
      const st=i===0?300:i===2?100:0;if(st){await env.DB.prepare("UPDATE users SET star_bal=star_bal+? WHERE id=?").bind(st,uid).run();got.push(st+" ⭐")}
      await notify(env,uid,["🥇","🥈","🥉"][i]+" Ты — "+(i+1)+" место в конкурсе «Звезда Эпох»! Твоё видео собрало больше всех просмотров 🎬\n\nВ игре уже: "+got.join(", ")+".\nСекретный приз и денежную часть приза ("+["100","70","40"][i]+" $) администратор передаст тебе лично — жди сообщение 🎁","🎁 Открыть игру");
      log.push({uid,name:u.name,got})}
    await kvSet(env,"vc_win",log);try{await hypeAdd(env,0,"🎬 Итоги «Звезды Эпох»: "+log.map((x,i)=>["🥇","🥈","🥉"][i]+" "+x.name).join(" · "),1)}catch(e){}return pub()}
  fail("Неизвестное действие")}
const VC_PR="__PR__",VC_PRT="🥇 100 $ (Мифический сундук + NFT-подарок в игре + статус «Звезда Эпох» + 300⭐ + секретный приз)\n🥈 70 $ (Мифический сундук + NFT-подарок в игре + секретный приз)\n🥉 40 $ (Мифический сундук + 100⭐ + секретный подарок)";
const VC_B=[
 {id:"vc1_start",at:Date.UTC(2026,10,8,19,15),btn:"🎬 Участвовать",
  chan:"🎬 ОГРОМНЫЙ КОНКУРС НА 210 $ — «ЗВЕЗДА ЭПОХ»!\n\nСнимай видео про «Воины Эпох» → выкладывай в TikTok / YouTube / Instagram → собирай просмотры → забирай призы!\n\n"+VC_PR+"\n\n📌 Как участвовать: выложи видео → в игре нажми «🎬 Звезда Эпох», отправь ссылку на свой аккаунт и нажми «Участвовать».\nВидео — сколько угодно, засчитаем твоё лучшее по просмотрам и комментариям.\n⏳ До среды 11.11, 22:00 (Минск)\n⛔ Накрутка запрещена — дисквалификация.\n👉 @VoinyEpohBot",
  dm:"🎬 Воин, стартовал ОГРОМНЫЙ КОНКУРС НА 210 $ — «ЗВЕЗДА ЭПОХ»!\n\nСними видео про «Воины Эпох» и выложи в TikTok, YouTube или Instagram. Чьё видео наберёт больше всех просмотров — тот и победил!\n\n"+VC_PR+"\n\n📌 Видео — сколько хочешь, засчитаем лучшее.\n👉 В игре: «🎬 Звезда Эпох» → ссылка на аккаунт → «Участвовать»\n⏳ До среды 11.11, 22:00\n⛔ Накрутка запрещена — дисквалификация"},
 {id:"vc1_09a",at:Date.UTC(2026,10,9,5,0),btn:"🎬 Участвовать",chan:"🎬 Доброе утро, воин! Идёт ОГРОМНЫЙ КОНКУРС НА 210 $ — «Звезда Эпох».\nСними видео про «Воины Эпох» и выложи в TikTok, YouTube или Instagram — самое просматриваемое забирает 100 $!\n\n"+VC_PR+"\n\n👉 @VoinyEpohBot",dm:"🎬 Доброе утро, воин! Идёт ОГРОМНЫЙ КОНКУРС НА 210 $ — «Звезда Эпох».\nСними видео про «Воины Эпох» и выложи в TikTok, YouTube или Instagram — самое просматриваемое забирает 100 $!\n\n"+VC_PR},
 {id:"vc1_09b",at:Date.UTC(2026,10,9,9,0),btn:"🎬 Участвовать",chan:"🔥 Видео с редким дропом, битвой или своей коллекцией — лучший шанс на 100 $. Конкурс «Звезда Эпох» идёт до среды 22:00 🎬\n\n"+VC_PR+"\n\n👉 @VoinyEpohBot",dm:"🔥 Видео с редким дропом, битвой или своей коллекцией — лучший шанс на 100 $. Конкурс «Звезда Эпох» идёт до среды 22:00 🎬\n\n"+VC_PR},
 {id:"vc1_09c",at:Date.UTC(2026,10,9,14,0),btn:"🎬 Участвовать",chan:"🎬 Уже снял видео для «Звезды Эпох»? Не забудь нажать «Участвовать» в игре и отправить ссылку на аккаунт! Без заявки видео не засчитаем.\n\n"+VC_PR+"\n\n👉 @VoinyEpohBot",dm:"🎬 Уже снял видео для «Звезды Эпох»? Не забудь нажать «Участвовать» в игре и отправить ссылку на аккаунт! Без заявки видео не засчитаем.\n\n"+VC_PR},
 {id:"vc1_09d",at:Date.UTC(2026,10,9,19,0),btn:"🎬 Участвовать",chan:"🌙 Вечер — самое время для просмотров! Выложи видео про «Воины Эпох» сегодня — до конца конкурса на 210 $ ещё 2 дня 🎬\n\n"+VC_PR+"\n\n👉 @VoinyEpohBot",dm:"🌙 Вечер — самое время для просмотров! Выложи видео про «Воины Эпох» сегодня — до конца конкурса на 210 $ ещё 2 дня 🎬\n\n"+VC_PR},
 {id:"vc1_10a",at:Date.UTC(2026,10,10,5,0),btn:"🎬 Участвовать",chan:"⏳ Осталось 1,5 дня конкурса «Звезда Эпох»! Видео набирают просмотры не сразу — выкладывай сегодня, чтобы успеть к 100 $ 🎬\n\n"+VC_PR+"\n\n👉 @VoinyEpohBot",dm:"⏳ Осталось 1,5 дня конкурса «Звезда Эпох»! Видео набирают просмотры не сразу — выкладывай сегодня, чтобы успеть к 100 $ 🎬\n\n"+VC_PR},
 {id:"vc1_10b",at:Date.UTC(2026,10,10,9,0),btn:"🎬 Участвовать",chan:"🎬 Видео можно выкладывать сколько угодно — засчитаем твоё лучшее. Ещё одно видео = ещё один шанс на 100 $!\n\n"+VC_PR+"\n\n👉 @VoinyEpohBot",dm:"🎬 Видео можно выкладывать сколько угодно — засчитаем твоё лучшее. Ещё одно видео = ещё один шанс на 100 $!\n\n"+VC_PR},
 {id:"vc1_10c",at:Date.UTC(2026,10,10,14,0),btn:"🎬 Участвовать",chan:"🔥 Конкурс на 210 $ в разгаре! Сними, как открываешь сундук или выбиваешь редкую карту — такие видео смотрят лучше всего 🎬\n\n"+VC_PR+"\n\n👉 @VoinyEpohBot",dm:"🔥 Конкурс на 210 $ в разгаре! Сними, как открываешь сундук или выбиваешь редкую карту — такие видео смотрят лучше всего 🎬\n\n"+VC_PR},
 {id:"vc1_10d",at:Date.UTC(2026,10,10,19,0),btn:"🎬 Участвовать",chan:"⏰ Остался всего 1 день конкурса «Звезда Эпох»! Выкладывай видео и жми «Участвовать» в игре 🎬\n\n"+VC_PR+"\n\n👉 @VoinyEpohBot",dm:"⏰ Остался всего 1 день конкурса «Звезда Эпох»! Выкладывай видео и жми «Участвовать» в игре 🎬\n\n"+VC_PR},
 {id:"vc1_11a",at:Date.UTC(2026,10,11,5,0),btn:"🎬 Участвовать",chan:"⏰ ПОСЛЕДНИЙ ДЕНЬ! Конкурс «Звезда Эпох» на 210 $ заканчивается сегодня в 22:00. Успей выложить видео и нажать «Участвовать»!\n\n"+VC_PR+"\n\n👉 @VoinyEpohBot",dm:"⏰ ПОСЛЕДНИЙ ДЕНЬ! Конкурс «Звезда Эпох» на 210 $ заканчивается сегодня в 22:00. Успей выложить видео и нажать «Участвовать»!\n\n"+VC_PR},
 {id:"vc1_11b",at:Date.UTC(2026,10,11,9,0),btn:"🎬 Участвовать",chan:"🎬 Последний день конкурса на 210 $! До финала 10 часов — ещё можно снять видео и собрать просмотры.\n\n"+VC_PR+"\n\n👉 @VoinyEpohBot",dm:"🎬 Последний день конкурса на 210 $! До финала 10 часов — ещё можно снять видео и собрать просмотры.\n\n"+VC_PR},
 {id:"vc1_11c",at:Date.UTC(2026,10,11,14,0),btn:"🎬 Участвовать",chan:"🚨 5 часов до конца конкурса «Звезда Эпох»! Делись своими видео с друзьями — каждый просмотр на счету 🎬\n\n"+VC_PR+"\n\n👉 @VoinyEpohBot",dm:"🚨 5 часов до конца конкурса «Звезда Эпох»! Делись своими видео с друзьями — каждый просмотр на счету 🎬\n\n"+VC_PR},
 {id:"vc1_11d",at:Date.UTC(2026,10,11,18,0),btn:"🎬 Участвовать",chan:"🚨 ОСТАЛСЯ 1 ЧАС! В 22:00 конкурс «Звезда Эпох» на 210 $ завершается. Последний шанс отправить заявку в игре 🎬\n\n"+VC_PR+"\n\n👉 @VoinyEpohBot",dm:"🚨 ОСТАЛСЯ 1 ЧАС! В 22:00 конкурс «Звезда Эпох» на 210 $ завершается. Последний шанс отправить заявку в игре 🎬\n\n"+VC_PR}
].map(b=>Object.assign(b,{on:true,until:b.at+3*36e5,photo:"assets/post-vc.jpg",link:"?vc=1",chan:b.chan.split(VC_PR).join(VC_PRT),dm:b.dm.split(VC_PR).join(VC_PRT)}));
let vcBusy=false;
async function vcBlastTick(env){const now=Date.now();if(vcBusy)return;const B=VC_B.find(b=>now>=b.at&&now<b.until);if(!B)return;vcBusy=true;try{await blastRun(env,B)}finally{vcBusy=false}}
let btkBusy=false;
async function blastTkTick(env){const now=Date.now();if(!BLAST_TK.on||btkBusy||now<BLAST_TK.at||now>BLAST_TK.until)return;btkBusy=true;try{await blastRun(env,BLAST_TK)}finally{btkBusy=false}}
async function blast2Tick(env){if(!BLAST2.on||b2Busy)return;b2Busy=true;try{await blastRun(env,BLAST2)}finally{b2Busy=false}}
async function blastRun(env,BLAST2){if(!env.BOT_TOKEN||env.DEV==="1"&&!env.NOTIFY_TEST)return;const now=Date.now();
  try{const k="blast:"+BLAST2.id,st=(await kvGet(env,k))||{ch:0,chn:0,cht:0,after:0,done:0,n:0};if(st.done&&st.ch)return;
    if(!st.ch&&st.chn<20&&now-st.cht>30e3){st.chn++;st.cht=now;await kvSet(env,k,st);const kb={inline_keyboard:[[{text:BLAST2.btn,url:"https://t.me/VoinyEpohBot"}]]};
      let r=await tgApi(env,"sendPhoto",{chat_id:CHANNEL,photo:"https://raw.githubusercontent.com/prostovladon-prog/kruti-kvartiru-/main/"+BLAST2.photo+"?t="+st.chn,caption:BLAST2.chan,reply_markup:kb});
      if(!r.ok)r=await tgApi(env,"sendPhoto",{chat_id:CHANNEL,photo:PAGE+BLAST2.photo+"?t="+st.chn,caption:BLAST2.chan,reply_markup:kb});
      if(!r.ok&&st.chn>=6)r=await tgApi(env,"sendMessage",{chat_id:CHANNEL,text:BLAST2.chan,reply_markup:kb});
      if(r.ok){st.ch=1;await kvSet(env,k,st)}else console.error("blast2 chan",st.chn,r.description)}
    if(st.done)return;const photo="https://raw.githubusercontent.com/prostovladon-prog/kruti-kvartiru-/main/"+BLAST2.photo;
    const us=(await env.DB.prepare("SELECT id FROM users WHERE pm=1 AND id>? ORDER BY id LIMIT 25").bind(st.after).all()).results;
    for(const u of us){if(await notify(env,u.id,BLAST2.dm,BLAST2.btn,PAGE+BLAST2.link,photo))st.n++;st.after=u.id}
    if(us.length<25){st.done=1;for(const a of ADMINS)await notify(env,a,"✅ Рассылка «"+BLAST2.id+"» ушла "+st.n+" игрокам"+(st.ch?", пост в канале вышел":", пост в канал пока не вышел — пробую ещё")+".","⚔️ Открыть")}
    await kvSet(env,k,st)}catch(e){console.error("blast",BLAST2.id,e)}}
async function p200Tick(env){const now=Date.now();if(now>=P200.until)return;if(!(await cached("p200c",60e3,()=>kvGet(env,"p200code")))){
    await env.DB.prepare("INSERT OR IGNORE INTO promo(code,sp,cash,mx,until,created,off,x2,bon) VALUES(?,0,0,0,?,?,0,0,?)").bind(P200.code,P200.until,now,P200.bon).run();await kvSet(env,"p200code",{t:now});delete topCache.p200c}
  if(p200Busy||!env.BOT_TOKEN||env.DEV==="1"&&!env.NOTIFY_TEST)return;p200Busy=true;
  try{const k="blast:"+P200.id,st=(await kvGet(env,k))||{ch:0,chn:0,cht:0,after:0,done:0,n:0};if(st.done&&st.ch)return;
    if(!st.ch&&st.chn<20&&now-st.cht>30e3){st.chn++;st.cht=now;await kvSet(env,k,st);const kb={inline_keyboard:[[{text:P200.btn,url:"https://t.me/VoinyEpohBot"}]]};
      let r=await tgApi(env,"sendPhoto",{chat_id:CHANNEL,photo:"https://raw.githubusercontent.com/prostovladon-prog/kruti-kvartiru-/main/"+P200.photo+"?t="+st.chn,caption:P200.chan,reply_markup:kb});
      if(!r.ok)r=await tgApi(env,"sendPhoto",{chat_id:CHANNEL,photo:PAGE+P200.photo+"?t="+st.chn,caption:P200.chan,reply_markup:kb});
      if(!r.ok&&st.chn>=6)r=await tgApi(env,"sendMessage",{chat_id:CHANNEL,text:P200.chan,reply_markup:kb});
      if(r.ok){st.ch=1;await kvSet(env,k,st)}else console.error("p200 chan",st.chn,r.description)}
    if(st.done)return;
    const us=(await env.DB.prepare("SELECT id FROM users WHERE pm=1 AND id>? ORDER BY id LIMIT 25").bind(st.after).all()).results;
    for(const u of us){if(await notify(env,u.id,P200.dm,P200.btn,PAGE+P200.link))st.n++;st.after=u.id}
    if(us.length<25){st.done=1;for(const a of ADMINS)await notify(env,a,"✅ Промокод ВОИН200 включён. Рассылка: "+st.n+" игрокам в бота"+(st.ch?", пост в канале вышел":", пост в канал пока не вышел — пробую ещё")+".","⚔️ Открыть")}
    await kvSet(env,k,st)}finally{p200Busy=false}}
let updBusy=false;
async function updBlast(env){if(updBusy||!env.BOT_TOKEN||env.DEV==="1"&&!env.NOTIFY_TEST)return;const now=Date.now();if(!UPD.win.some(([a,b])=>now>=a&&now<b))return;
  updBusy=true;try{const st=(await kvGet(env,"blast:"+UPD.id))||{ch:0,after:0,done:0,n:0};if(st.done&&st.ch)return;
    if(!st.ch&&UPD.noChan){st.ch=1;await kvSet(env,"blast:"+UPD.id,st)}
    if(!st.ch){st.ch=1;await kvSet(env,"blast:"+UPD.id,st);try{await tgApi(env,"sendPhoto",{chat_id:CHANNEL,photo:PAGE+UPD.photo,caption:UPD.chan,reply_markup:{inline_keyboard:[[{text:"⚔️ Играть",url:"https://t.me/VoinyEpohBot"}]]}})}catch(e){}}
    if(st.done)return;
    const us=(await env.DB.prepare("SELECT id FROM users WHERE pm=1 AND id>? AND created<?"+(UPD.where||"")+" ORDER BY id LIMIT 25").bind(st.after,UPD.cut||9e15).all()).results;   // только тем, кто уже в игре
    for(const u of us){if(await notify(env,u.id,UPD.dm,UPD.btn||"🎁 Смотреть обновление",PAGE+(UPD.link||"?shop=1"),PAGE+UPD.photo))st.n++;st.after=u.id}
    if(us.length<25){st.done=1;for(const a of ADMINS)await notify(env,a,"✅ Рассылка «"+UPD.id+"»: "+st.n+" игрокам в бота.","⚔️ Открыть")}
    await kvSet(env,"blast:"+UPD.id,st)}finally{updBusy=false}}
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
  async tick(env){await ensureSchema(env);if(await maintenance(env))return;try{await admGrants(env)}catch(e){console.error("grants",e)}try{await blast2Tick(env)}catch(e){console.error("blast2",e)}try{await vcBlastTick(env)}catch(e){console.error("vcb",e)}try{await blastTkTick(env)}catch(e){console.error("blasttk",e)}try{await tkFinish(env)}catch(e){console.error("tkfin",e)}try{await chPostOnce(env)}catch(e){console.error("chpost",e)}try{await p200Tick(env)}catch(e){console.error("p200",e)}try{await dgaWeekTick(env)}catch(e){console.error("dgaw",e)}try{await kingTick(env)}catch(e){console.error("king",e)}try{await ref3Tick(env)}catch(e){console.error("ref3",e)}try{await dmBlast(env)}catch(e){console.error("dmb",e)}await tourTick(env);try{await chalTick(env)}catch(e){console.error("chal",e)}try{await fixTsar(env)}catch(e){console.error("fix",e)}try{await resendWinners(env)}catch(e){console.error("rsw",e)}try{await payTick(env)}catch(e){console.error("pay",e)}try{await lotBlast(env)}catch(e){console.error("blast",e)}try{await updBlast(env)}catch(e){console.error("upd",e)}try{await cbTick(env)}catch(e){console.error("cb",e)}try{await clanWeekTick(env)}catch(e){console.error("clanw",e)}try{await dtopTick(env)}catch(e){console.error("dtop",e)}try{await rkTick(env);await rkSeasonTick(env)}catch(e){console.error("rk",e)}try{await aucTick(env)}catch(e){console.error("auc",e)}},
  async scheduled(event,env,ctx){ctx.waitUntil(reminders(env).catch(e=>console.error("reminders",e)))},
  async fetch(req,env){try{const resp=await handle(req,env);try{await tkAfter(req,env,resp)}catch(e){console.error("tk",e)}return resp}catch(e){console.error("fatal",e);return J({ok:false,err:"Сервер перегружен, попробуй через минуту"},503)}}
};
async function handle(req,env){{
    if(req.method==="OPTIONS")return new Response(null,{headers:CORS});
    const url=new URL(req.url);
    if(req.method==="GET"&&url.pathname==="/setup"){await ensureSchema(env);return setup(env,url.origin)}
    if(req.method==="GET"&&url.pathname.startsWith("/mp/")){await ensureSchema(env);const r=await env.DB.prepare("SELECT img FROM map_photo WHERE uid=? AND st=1").bind(Math.floor(+url.pathname.slice(4).replace(/\D/g,""))||0).first();
      if(!r)return new Response("",{status:404,headers:CORS});const m=/^data:(image\/(?:jpeg|png|webp));base64,(.+)$/.exec(r.img||"");if(!m)return new Response("",{status:404,headers:CORS});
      return new Response(Uint8Array.from(atob(m[2]),c=>c.charCodeAt(0)),{headers:{...CORS,"Content-Type":m[1],"Cache-Control":"public, max-age=600"}})}
    if(req.method==="GET"&&url.pathname.startsWith("/go/")){await ensureSchema(env);return adGo(env,req,decodeURIComponent(url.pathname.slice(4)))}
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
    if(env.TK_FORCE)TK.force=1;
    if(TK.act[a]&&tkLive(Date.now()))TKREQ.set(req,{uid:me.id,n:TK.act[a]==="n"?Math.max(1,Math.min(50,+p.n||1)):TK.act[a]});
    if(a==="tk_ping")return J({ok:true,res:await tkPing(env,me,p)});
    await trackSrc(env,me);
    try{
      if(a==="market")return J({ok:true,res:await market(env,me),S:await stateFor(env,me)});
      if(a==="list"||a==="unlist"||a==="buy"){const res=await (a==="list"?list:a==="unlist"?unlist:buy)(env,me,p);const S=await stateFor(env,me);fixIds(res,S.cards);return J({ok:true,res,S})}
      if(a==="profile")return J({ok:true,res:await profile(env,p,me),S:await stateFor(env,me)});
      if(a==="card")return J({ok:true,res:await cardInfo(env,p),S:await stateFor(env,me)});
      if(a==="fduel"){const o=await cardInfo(env,{id:p.oppId});if(o.owner===me.id)fail("Это твоя же карточка");
        const r=await doAction(env,me,"fduel",{myId:p.myId,myStat:p.myStat,oppStat:p.oppStat,key:"c"+o.card.id,opp:o.card});
        await logFight(env,me,p.myId,o,r.res);if(r.res.first)await dtopAdd(env,"fight",me.id,1);return J({ok:true,...r})}
      if(a==="duel"){const stake=!!(p.mode|0);let o=null;
        if(!stake)o=await pickOpponent(env,me,p,false);
        else{const mu=await env.DB.prepare("SELECT stake FROM users WHERE id=?").bind(me.id).first();if(mu&&mu.stake)o=await pickOpponent(env,me,p,true)}
        const r=await doAction(env,me,"duel",p,o?{oppCard:o.card,oppName:o.name,oppUid:o.owner}:null);
        if(o)await logFight(env,me,p.id,o,r.res,stake);await dtopAdd(env,"fight",me.id,1);return J({ok:true,...r})}
      if(a==="pm_on"){await env.DB.prepare("UPDATE users SET pm=1 WHERE id=?").bind(me.id).run();
        const b=await env.DB.prepare("UPDATE users SET pm_bonus=1,gift_spins=gift_spins+? WHERE id=? AND pm_bonus=0").bind(PM_BONUS,me.id).run();
        return J({ok:true,res:{bonus:b.meta.changes===1?PM_BONUS:0},S:await stateFor(env,me)})}
      if(a==="cb_claim"){const u=await env.DB.prepare("SELECT created,cb_claim FROM users WHERE id=?").bind(me.id).first();if(!u||u.cb_claim)fail("Сундук уже забран");
        if(dayNum(Date.now())<=dayNum(u.created||Date.now()))fail("Сундук откроется завтра — заходи!");
        const r=await env.DB.prepare("UPDATE users SET cb_claim=1,gift_spins=gift_spins+?,cash=cash+? WHERE id=? AND cb_claim=0").bind(CB.sp,CB.cash,me.id).run();if(r.meta.changes!==1)fail("Сундук уже забран");
        return J({ok:true,res:CB,S:await stateFor(env,me)})}
      if(a==="stake_set"){await env.DB.prepare("UPDATE users SET stake=? WHERE id=?").bind(p.on?1:0,me.id).run();return J({ok:true,res:{on:!!p.on},S:await stateFor(env,me)})}
      if(a==="chat_get")return J({ok:true,res:await chatGet(env,p)});
      if(a==="chat_send")return J({ok:true,res:await chatSend(env,me,p)});
      if(a==="chat_del"||a==="chat_mute"||a==="chat_pin"||a==="chat_unpin")return J({ok:true,res:await chatAdmin(env,me,a,p)});
      if(a==="nick"){const res=await setNick(env,me,p);return J({ok:true,res,S:await stateFor(env,me)})}
      if(a==="top")return J({ok:true,...await top(env,me,p)});
      if(a==="sub_check"){const r=await subCheck(env,me);return J({ok:true,...r})}
      if(a==="sub_reward"||a==="pvp_result"||a==="tour_prize"||a==="grant"||a==="season_prize"||a==="trader_take"||a==="trader_give"||a==="auc_win"||a==="cas_comp")fail("Неизвестное действие");
      if(a==="shop")return J({ok:true,res:await shopInfo(env,me)});
      if(a==="invoice")return J({ok:true,res:await invoice(env,me,p)});
      if(a==="pay_bal"){if(p.item==="bal"||p.item==="support")fail("Это можно оплатить только звёздами Telegram");const I=await payItem(env,me.id,p),now=Date.now();
        const r=await env.DB.prepare("UPDATE users SET star_bal=star_bal-? WHERE id=? AND star_bal>=?").bind(I.stars,me.id,I.stars).run();
        if(r.meta.changes!==1){const u=await env.DB.prepare("SELECT star_bal FROM users WHERE id=?").bind(me.id).first();fail("На игровом балансе "+((u&&u.star_bal)||0)+" ⭐, а нужно "+I.stars+" ⭐")}
        const row=await env.DB.prepare("INSERT INTO payments(uid,item,p,stars,status,month,created,charge,paid) VALUES(?,?,?,?,'paid',?,?,'bal',?) RETURNING id").bind(me.id,I.item,JSON.stringify(I.data||{}),I.stars,monthOf(now),now,now).first();
        await payApply(env,row.id);return J({ok:true,res:await payStatus(env,me,{pid:row.id}),S:await stateFor(env,me)})}
      if(a==="pay_status")return J({ok:true,res:await payStatus(env,me,p),S:await stateFor(env,me)});
      if(a==="pay_sim"){if(env.PAY_SIM!=="1")fail("Неизвестное действие");const P=await env.DB.prepare("SELECT * FROM payments WHERE id=? AND uid=?").bind(p.pid|0,me.id).first();if(!P)fail("Нет такого счёта");
        await paidUpdate(env,me.id,{currency:"XTR",total_amount:P.stars,invoice_payload:"p"+P.id,telegram_payment_charge_id:"sim"+P.id});return J({ok:true,res:await payStatus(env,me,p),S:await stateFor(env,me)})}
      if(a==="dtop")return J({ok:true,res:await dtopGet(env,me)});
      if(a==="dg_top")return J({ok:true,res:await dgTop(env,me)});
      if(/^ad_(list|create|hide)$/.test(a))return J({ok:true,res:await adApi(env,me,a,p,url.origin)});
      if(/^dm_(list|get|send|block|report)$/.test(a))return J({ok:true,res:await dmApi(env,me,a,p)});
      if(/^dga_(info|fight)$/.test(a))return J({ok:true,res:await dgaApi(env,me,a,p),S:await stateFor(env,me)});
      if(a==="dg_looks")return J({ok:true,res:await dgLooks(env,p.uids)});
      if(/^st_(find|give|log)$/.test(a))return J({ok:true,res:await starApi(env,me,a,p)});
      if(a==="dg_view")return J({ok:true,res:await dgViewOf(env,Math.floor(+p.uid||0))});
      if(a==="dg_grant")fail("Неизвестное действие");
      if(a==="trader")return J({ok:true,res:await traderInfo(env,me)});
      if(a==="auc")return J({ok:true,res:aucView(await aucCur(env),me)});
      if(a==="auc_bid"){const res=await aucBid(env,me,p);return J({ok:true,res,S:await stateFor(env,me)})}
      if(a==="trader_buy"||a==="trader_sell"){const r=await (a==="trader_buy"?traderBuy:traderSell)(env,me,p);return J({ok:true,...r})}
      if(/^rk_/.test(a)){const res=await rkApi(env,me,a,p);return J({ok:true,res,S:(a==="rk_get"&&res.phase==="done")||a==="rk_find"?await stateFor(env,me):undefined})}
      if(a==="terms_ok"){const v=Math.max(1,Math.min(TERMS_V,p.v|0));await env.DB.prepare("UPDATE users SET terms_v=MAX(terms_v,?),terms_at=? WHERE id=?").bind(v,Date.now(),me.id).run();return J({ok:true,res:{v},S:await stateFor(env,me)})}
      if(a==="pl_find"||a==="cm_get"||a==="cm_send")return J({ok:true,res:await socApi(env,me,a,p)});if(a.startsWith("king_"))return J({ok:true,res:await kingApi(env,me,a,p)});if(a==="adm_newbies"){if(!isAdmin(env,me.id))fail("Нет доступа");const D=864e5,off=Math.max(-30,Math.min(0,p.day|0)),d0=Math.floor((Date.now()+3*3600e3)/D)*D-3*3600e3+off*D;
        const rows=(await env.DB.prepare("SELECT id,nick FROM users WHERE created>=? AND created<? ORDER BY created").bind(d0,d0+D).all()).results,best=[];
        for(const r of rows){if(!r.nick)continue;const c=await env.DB.prepare("SELECT h,f,v FROM cards WHERE owner=? ORDER BY v DESC LIMIT 1").bind(r.id).first();best.push({nick:r.nick,hero:c?HEROES[c.h][0]:"",tier:c?HT[HEROES[c.h][2]].k:"",fin:c&&c.f?FIN[c.f].k:"",v:c?Math.round(c.v):0})}
        return J({ok:true,res:{day:new Date(d0+3*3600e3).toISOString().slice(0,10),total:rows.length,nicks:best.map(b=>b.nick),best}})}
      if(/^tr_/.test(a)){const res=await tradeApi(env,me,a,p);return J({ok:true,res,S:a==="tr_list"||a==="tr_cards"?undefined:await stateFor(env,me)})}
      if(/^clan_/.test(a)){const res=await clanApi(env,me,a,p);return J({ok:true,res,S:a==="clan_info"?undefined:await stateFor(env,me)})}
      if(/^live_/.test(a))return J({ok:true,res:await liveApi(env,me,a,p)});if(/^ref3_/.test(a))return J({ok:true,res:await ref3Api(env,me,a,p)});if(/^vc_/.test(a))return J({ok:true,res:await vcApi(env,me,a,p)});if(/^ft_/.test(a))return J({ok:true,res:await ftApi(env,me,a,p)});if(/^vt_/.test(a)){const res=await voteApi(env,me,a,p);return J({ok:true,res,S:res&&res.hit?await stateFor(env,me):undefined})}if(/^rd_/.test(a)){const res=await riddleApi(env,me,a,p);return J({ok:true,res,S:res&&res.hit?await stateFor(env,me):undefined})}if(a==="promo_use"||a==="promo_x2"||/^pcode_/.test(a)){const res=await promoApi(env,me,a,p);return J({ok:true,res,S:a==="promo_use"?await stateFor(env,me):undefined})}
      if(a==="roc_state"||a==="roc_bet"||a==="roc_out"){const res=await rocApi(env,me,a,p);return J({ok:true,res,S:a==="roc_state"?undefined:await stateFor(env,me)})}
      if(/^war_/.test(a)){const res=await warApi(env,me,a,p);return J({ok:true,res,S:a==="war_attack"?await stateFor(env,me):undefined})}
      if(/^al_/.test(a))return J({ok:true,res:await alApi(env,me,a,p)});
      if(/^map_|^mph_/.test(a)){const res=await mapApi(env,me,a,p);return J({ok:true,res,S:a==="map_get"||a==="mph_list"||a==="map_stats"?undefined:await stateFor(env,me)})}
      if(/^gift_/.test(a)){const res=await giftApi(env,me,a,p);return J({ok:true,res,S:a==="gift_top"?undefined:await stateFor(env,me)})}
      if(a==="cas_case"){const r=await doAction(env,me,a,p,{giftLeft:await giftLeft(env)});
        if(r.res.gift){const g=await giftMint(env,me.id,r.res.gift,"case");
          if(g){r.res.g=g;await hypeAdd(env,me.id,"🎁 достал подарок «"+((GIFTS[r.res.gift]||{}).n||"редкий")+"» из кейса")}else{await doAction(env,me,"cas_comp",{},{grant:true});r.res={r:CASE.sold,sold:r.res.gift,i:r.res.i,dg:r.res.dg}}
          r.S=await stateFor(env,me)}
        await casLog(env,me.id,"case",CASE.price,r.res.r||0,r.res.g||null);return J({ok:true,...r})}
      if(a==="cas_feed")return J({ok:true,res:await casFeed(env)});
      if(a==="hype")return J({ok:true,res:await hypeList(env)});
      if(a==="cas_info"){const st=JSON.parse(((await env.DB.prepare("SELECT state FROM users WHERE id=?").bind(me.id).first())||{}).state||"{}");const jp=await jpGet(env);return J({ok:true,res:{jp:jp.v,jw:jp.w||null,cb:await cbInfo(env,me.id,st)}})}
      if(a==="cas_cb"){const st=JSON.parse(((await env.DB.prepare("SELECT state FROM users WHERE id=?").bind(me.id).first())||{}).state||"{}");const c=await cbInfo(env,me.id,st);if(c.taken)fail("Кешбэк за вчера уже забран");if(c.amt<1)fail("Вчера ты не был в минусе — кешбэка нет");
        const r=await doAction(env,me,"cas_cbset",{d:mskDayOf(Date.now()),runes:c.amt},{grant:true});return J({ok:true,res:{got:c.amt},S:r.S||await stateFor(env,me)})}
      if(a==="cas_stats"){if(!isAdmin(env,me.id))fail("Нет доступа");return J({ok:true,res:await casStats(env)})}
      if(a==="camp_top")return J({ok:true,res:await campTop(env,me,p.per==="w"?"w":"d")});
      if(a==="chal_get")return J({ok:true,res:await chalGet(env,me)});if(/^tt_/.test(a))return J({ok:true,res:await ttApi(env,me,a,p)});
      if(a==="story_join")return J({ok:true,res:await storyJoin(env,me,p)});
      if(/^story_(res|ok|no)$/.test(a))return J({ok:true,res:await storyAdmin(env,me,a,p)});
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
      if(a==="src_users"){if(!isAdmin(env,me.id))fail("Нет доступа");const code=String(p.code||"").toLowerCase().slice(0,32);
        const rows=(await env.DB.prepare(STREAK_SQL+" SELECT u.id,COALESCE(u.nick,u.name) AS name,u.created,u.seen,u.album,COALESCE(r.mx,0) AS mx,COALESCE(r.cur,0) AS cur,(SELECT COUNT(*) FROM user_days x WHERE x.uid=u.id) AS days FROM users u LEFT JOIN best r ON r.uid=u.id WHERE u.src=?2 ORDER BY r.mx DESC,u.created DESC LIMIT 300").bind(dayNum(Date.now()),code).all()).results;
        return J({ok:true,res:{code,rows}})}
      if(a==="stats"){if(!isAdmin(env,me.id))fail("Нет доступа");return J({ok:true,res:await adminStats(env),S:await stateFor(env,me)})}
      if(a==="sync")return J({ok:true,res:{},S:await stateFor(env,me)});
      if(!ACTIONS[a])fail("Неизвестное действие");
      if(a==="title_buy"||a==="title_set"){const r=await doAction(env,me,a,p);await env.DB.prepare("UPDATE users SET title=? WHERE id=?").bind(r.res.k||null,me.id).run();delete topCache.nfx;r.S=await stateFor(env,me);return J({ok:true,...r})}
      const r=await doAction(env,me,a,p);if(a==="camp_tap"&&r.res&&r.res.n)await dtopAdd(env,"tap",me.id,r.res.n);
      if(a==="open_multi"&&r.res&&r.res.cards&&r.res.cards.some(c=>c.h===THOR))r.res.card=r.res.cards.find(c=>c.h===THOR);
      if((a==="open"||a==="open_multi")&&r.res&&r.res.card&&r.res.card.h===THOR){try{const nm=await nameOf(env,me.id);
        for(const ad of ADMINS)await notify(env,ad,"⚡⚡⚡ ТОР ВЫБИТ! Игрок "+nm+" (id "+me.id+") выбил Тора — ошибку печати, 1 из 1!\n\nВыдай обещанный приз: VIP навсегда и NFT-подарок.","⚔️ Открыть");
        await chanSend(env,{chan:CHANNEL},{text:"⚡ ЛЕГЕНДА ВЫБИТА!\n\n"+nm+" выбил ТОРА — ошибку печати, единственную карточку на всю игру. Шанс был 1 на миллион!\n\n👉 @VoinyEpohBot"})}catch(e){console.error("thor",e)}}
      try{if(r.res){if(/^open|chest|wheel|_open/.test(a))for(const c of hypeCards(r.res)){const F=FIN[c.f],H=HEROES[c.h];if(!F||!H)continue;const myth=H[2]>=4;if(!(c.f===3||c.f===4||F.dia||myth))continue;
          await hypeAdd(env,me.id,(F.dia?"💎 выбил АЛМАЗНУЮ ОШИБКУ":c.f===4?"🔥 выбил ОШИБКУ ПЕЧАТИ":c.f===3?"✨ выбил ЗОЛОТУЮ":"🟠 выбил мифического")+" · "+H[0]+(c.no?" #"+c.no:""),F.dia||c.f===4)}
        if(a==="cas_slot"&&r.res.m>=20)await hypeAdd(env,me.id,"🎰 сорвал ×"+r.res.m+" в слотах · +"+r.res.win.toLocaleString("ru")+" 💠");
        if(a==="cas_rk"&&r.res.win&&r.res.at>=10)await hypeAdd(env,me.id,"🚀 забрал ракетку на ×"+r.res.at+" · +"+r.res.win.toLocaleString("ru")+" 💠");
        if(a==="cas_case"&&r.res.g)await hypeAdd(env,me.id,"🎁 достал подарок из кейса");}}catch(e){}
      if(a==="cas_slot"||a==="cas_rk_go"||a==="cas_hl_go"||a==="cas_mn_go")await jpAdd(env,Math.floor(+p.bet||0));
      if(a==="cas_slot"&&r.res.m>=50){const J0=await jpGet(env),won=J0.v;await kvSet(env,"jp",{v:JP.seed,w:{name:me.nick||me.name||"Игрок",v:won,t:Date.now()}});await doAction(env,me,"map_grant",{runes:won},{grant:true});r.res.jp=won;r.S=await stateFor(env,me);
        await hypeAdd(env,me.id,"💎💎💎 СОРВАЛ ДЖЕКПОТ · +"+won.toLocaleString("ru")+" 💠",1)}
      if(a==="cas_mn"&&r.res.win&&r.res.m>=10)await hypeAdd(env,me.id,"💣 прошёл Сапёра на ×"+r.res.m+" · +"+r.res.win.toLocaleString("ru")+" 💠");
      if(a==="cas_mn_take"&&r.res.m>=10)await hypeAdd(env,me.id,"💣 забрал в Сапёре ×"+r.res.m+" · +"+r.res.win.toLocaleString("ru")+" 💠");
      if(a==="cas_mn_go")await casLog(env,me.id,"mn",Math.floor(+p.bet||0),0);else if((a==="cas_mn"||a==="cas_mn_take")&&r.res.win)await casLog(env,me.id,"mn",0,r.res.win,null,r.res.m);
      if(a==="cas_rk_go")await casLog(env,me.id,"rk",Math.floor(+p.bet||0),0);
      else if(a==="cas_rk"&&r.res&&r.res.end&&r.res.win)await casLog(env,me.id,"rk",0,r.res.win,null,r.res.at);
      if(a==="cas_slot")await casLog(env,me.id,"slot",Math.floor(+p.bet||0),r.res.win||0,null,r.res.m);
      else if(a==="cas_hl_go")await casLog(env,me.id,"hl",Math.floor(+p.bet||0),0);
      else if(a==="cas_hl_take")await casLog(env,me.id,"hl",0,r.res.win||0);
      return J({ok:true,...r});
    }catch(e){
      if(e instanceof GameError)return J({ok:false,err:e.message});
      console.error(e);return J({ok:false,err:"Ошибка сервера"},500);
    }
  }
}
