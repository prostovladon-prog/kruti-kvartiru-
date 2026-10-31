/* rules.js — общие правила «Воинов Эпох».
   Этот файл работает и в браузере (локальный режим), и на сервере (Cloudflare Worker).
   Здесь нет ничего про интерфейс: только данные игры и действия, которые меняют состояние игрока. */

const CAP=40, REFILL_MS=4*3600e3, SPINS_MAX=10, PITY=30, LMAX=10, FEE=.05, HOUSE=.9, PMAX=.8, EX_SLOTS=3, MAX_LOTS=5, QUICK=.85, START_CASH=100;
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
 ["Танатос","Подземное царство",4,"Бог смерти, брат-близнец Гипноса. Приходит тихо и не опаздывает.",{duo:1,pair:"Гипнос и Танатос",hair:"long",hairc:"#14101c",weapon:"scythe",armor:"cloth",cape:"#14101c",x:["wings"],glow:"#ff2e63",fierce:1,hue:300,skinc:"#c9c2d6",p:[9,6,7,7,8]}]];
const COLLAB=HEROES.findIndex(H=>H[4].collab), isCollab=c=>!!(c&&HEROES[c.h]&&HEROES[c.h][4].collab);
const NBASE=32;          // первые 32 воина + новые с флагом base — это альбом и прокрутки
const isBase=h=>h<NBASE||!!(HEROES[h]&&HEROES[h][4].base), BASE=HEROES.map((H,i)=>i).filter(isBase), NHEROES=BASE.length, baseNo=h=>BASE.indexOf(h)+1;
const DUO=HEROES.map((H,i)=>i).filter(i=>HEROES[i][4].duo), isDuo=h=>!!(HEROES[h]&&HEROES[h][4].duo), DUO_F=7, DUO_RUN=2;
const DUO_PAIRS=(()=>{const m={};DUO.forEach(h=>{const k=HEROES[h][4].pair;(m[k]=m[k]||[]).push(h)});return Object.keys(m).map(k=>({n:k,h:m[k]}))})();
const COMP=HEROES.map((H,i)=>i).filter(i=>HEROES[i][4].comp), isComp=h=>!!(HEROES[h]&&HEROES[h][4].comp);
const DON=HEROES.map((H,i)=>i).filter(i=>HEROES[i][4].don&&!HEROES[i][4].one), ONE=HEROES.map((H,i)=>i).filter(i=>HEROES[i][4].one);
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
 {k:"Близнец",cls:"duo",w:0,m:250,run:2,col:"#7cf7ff",duo:1}];   // только у воинов-Близнецов: 2 карточки на весь мир   // коллаборация с «Номерком»: приз розыгрыша   // не выпадает: 3 карточки за 15 приглашённых друзей
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
  let f=pick(FIN.map(x=>x.w));while(f>0&&ctx.issuedOf(h,f)>=FIN[f].run)f--;return makeCard(ctx,h,f)}
/* легенда 1 из 1 (Тор и др.): только «Ошибка печати», свой номер. null — если все уже у игроков */
function rollOne(ctx,want1){const free=ONE.filter(h=>ctx.issuedOf(h,4)<1);if(!free.length)return null;const h=want1!=null?want1:free[Math.floor(Math.random()*free.length)];if(!free.includes(h))fail("Эта легенда уже у другого игрока");
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
 legend:{n:"Легендарный сундук",stars:300,cards:10,leg:1,d:["🃏 <b>10</b> карточек","гарантированно <b>легендарная</b>","шанс <b>4%</b> на богатыря"]},
 mythic:{n:"Мифический сундук",stars:1000,cards:10,myth:1,leg:1,month:30,d:["🃏 <b>10</b> карточек","гарантированно <b>мифический</b>: Сёгун, Мерлин или богатырь","+ легендарная","шанс <b>2%</b> на легенду 1 из 1","всего <b>30</b> в месяц на всю игру"]}};
const CHESTS=["newbie","small","royal","warrior","legend","mythic"];
/* «любая карточка в игре»: игрок сам выбирает воина и отделку (если тираж ещё не закончился) */
function makeAny(ctx,h,f){if(!HEROES[h]||!FIN[f]||FIN[f].excl||HEROES[h][4].collab)fail("Такой карточки нет");const W=HEROES[h][4];
  if(W.one){if(f!==4)fail("Легенды 1 из 1 бывают только «Ошибкой печати»");return rollOne(ctx,h)}
  if(W.duo){if(f!==DUO_F)fail("Близнецы бывают только с отделкой «Близнец»");return rollDuo(ctx,h)}
  if(f===DUO_F)fail("Отделка «Близнец» есть только у воинов-Близнецов");
  if(W.comp){if(f!==0)fail("Составного воина можно взять только обычной отделки");const no=ctx.compSlot(h);if(!no)fail("Тираж воина «"+HEROES[h][0]+"» закончился");
    const sn=genNumber(ctx,0),B=cardBody(h,0);return {id:ctx.newId(),h,f:0,no,sn,part:0,hue:B.hue,stats:B.stats,v:priceOf(h,0,no,sn,B.top,0),xp:0,wins:0,stars:0,frame:null,away:0,dest:null,listed:0,listPrice:0}}
  return makeCard(ctx,h,f)}
SHOP.twins={n:"Сундук Близнецов",stars:1500,twins:1,cards:3,d:["♊ <b>Близнец</b> — карточка, которой всего <b>2</b> на весь мир","+ <b>3</b> обычные карточки","собери пару близнецов — их знает вся игра"]};
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
  const pool=HEROES.map((H,i)=>i).filter(i=>isBase(i)&&(!epic||HEROES[i][2]>=2));
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
function battleCard(G,id){const c=freeCard(G,id);if(FIN[c.f].excl)fail(FIN[c.f].collab?"Бесценная карточка коллекционная: в боях не участвует":TROPHY_MSG);return notHalf(c,"Половинка не воюет. Собери из двух половинок целого воина в Сокровищнице")}
function burnable(c){if(FIN[c.f].collab)fail("Бесценную карточку нельзя продать системе или сжечь. Её можно только выставить на рынок — цену ставишь ты");if(FIN[c.f].excl)fail("«Основателя» нельзя продать системе или сжечь. Его можно выставить на рынок");if(HEROES[c.h][4].one)fail("Легенду 1 из 1 нельзя продать системе или сжечь — только на рынке");return c}
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
const DG={fr:3,frSpins:5,since:Date.UTC(2026,9,28,17,0),max:60,satH:4,tapCap:200,feedMax:6,winXp:10,winSh:2,winCap:15,spinXp:2,taskXp:50,conqXp:40,conqSh:10,nestTaps:50,invMax:60,upMax:10,nameMax:16,hungry:20};
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
/* эволюция с 20 уровня (стадия «Взрослый дракон»): выбирается один раз */
const DG_EVO={fire:{n:"Пламя",ic:"🔥",c:"#ff3d1a",d:"+10% мощи дракона"},ice:{n:"Лёд",ic:"❄️",c:"#4fd6ff",d:"сытость тает на 40% медленнее"},storm:{n:"Буря",ic:"⚡",c:"#9a6aff",d:"+20% опыта"}},DG_EVO_LV=20;
/* облики за звёзды: меняют только вид. Хэллоуинский — ограниченный по времени */
const DG_SKIN={pumpkin:{n:"Тыквенный",ic:"🎃",stars:149,until:Date.UTC(2026,10,3,21,0),c:["#ff7a12","#ffd36a","#3a1a08"],eye:"fire",acc:"pumpkin",d:"Хэллоуин! Только до 3 ноября"},
 frost:{n:"Кристальный",ic:"💎",stars:199,c:["#8fe3ff","#ffffff","#3a7fd0"],eye:"ice",acc:"crystal",d:"Ледяные кристаллы на голове"},
 abyss:{n:"Бездна",ic:"🌑",stars:249,c:["#2a1a3e","#ff4fd8","#0a0414"],eye:"shadow",acc:"horns",d:"Тёмный, с неоновыми рогами"},
 emperor:{n:"Император",ic:"👑",stars:399,c:["#ffcf2e","#fff7d0","#8a5a00"],eye:"gold",acc:"crown",d:"Золото и корона"}};
/* арена драконов: бой против драконов других игроков. Лёд бьёт огонь, огонь — бурю, буря — лёд (+20%) */
const DGA={day:5,vipDay:3,k:32,start:1000,win:{sh:12,xp:40},lose:{sh:4,xp:10},adv:1.2,prize:[200,100,50]};
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
function dgPower(D){if(!D)return 0;const B=DG_BREED[D.b]||DG_BREED[0],eq=dgEq(D),g=eq.reduce((a,it)=>a+dgItemPow(it),0),sb=dgSetBonus(eq);return Math.round(((100+D.lv*45)*B.m+g)*(1+sb.b)*(D.evo==="fire"?1.1:1))}
const dgSat=(D,now)=>Math.max(0,Math.min(100,(D.sat||0)-(now-(D.satAt||now))/3600e3*DG.satH*(D.evo==="ice"?.6:1)));
function dgBonus(st,now){const D=st&&st.dg;if(!D)return 0;let b=Math.min(.2,.02+dgPower(D)/40000);if(dgSat(D,now)<DG.hungry)b/=2;return Math.round(b*1000)/1000}
function dgDay(D,now){const d=mskDay(now);if(D.d!==d){D.d=d;D.tp=0;D.fd=0;D.wx=0;D.nest=0;D.gift=0}return D}
function dgAddXp(st,ctx,x){const D=st.dg;if(!D||!x)return 0;if(D.evo==="storm")x=Math.ceil(x*1.2);if(dgSat(D,ctx.now)<DG.hungry)x=Math.ceil(x/2);D.xp+=x;const lv0=D.lv;while(D.lv<DG.max&&D.xp>=dgCum(D.lv+1))D.lv++;
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
const ACTIONS={
  sync(){return {}},

  open(G){const {st,ctx}=G;refill(st,ctx.now);
    if(st.spins<=0)fail("Прокрутки закончились");
    if(G.cards.length>=capOf(st))fail("Коллекция заполнена ("+capOf(st)+"). Продай лишнее или расширь место");
    st.spins--;if(st.spins<spinCap(st)&&!st.refillAt)st.refillAt=ctx.now+REFILL_MS;if(st.dg)dgAddXp(st,ctx,DG.spinXp);
    const epic=(st.guar||0)>0||(st.pity||0)>=PITY-1;let c=null;
    const rr=ctx.noRare?1:Math.random();   // noRare — только для автотестов
    if(rr<SPIN_P.one)try{c=rollOne(ctx)}catch(e){}   // легенда 1 из 1: один шанс на сто тысяч
    else if(rr<SPIN_P.one+SPIN_P.don)c=rollTier(ctx,-1,DON);   // богатырь
    else if(rr<SPIN_P.one+SPIN_P.don+SPIN_P.duo)c=rollDuo(ctx);   // Близнец: 2 на весь мир
    if(!c&&!epic&&!ctx.noRare&&Math.random()<HALF_P.drop)try{c=rollHalf(ctx,HALF_P.right)}catch(e){}   // редко вместо карточки выпадает половинка составного воина
    st.nOp=(st.nOp||0)+1;let wel=0;
    if(st.wel===0&&st.nOp>=2&&!c){wel=1;st.wel=1;const pl=HEROES.map((H,i)=>i).filter(i=>isBase(i)&&HEROES[i][2]===3),h=pl[Math.floor(Math.random()*pl.length)];c=makeCard(ctx,h,ctx.issuedOf(h,1)<FIN[1].run?1:0)}   // подарок новичку: на 2-й прокрутке легендарный воин с блеском
    if(!c)c=rollCard(ctx,epic);if(epic&&!wel&&(st.guar||0)>0)st.guar--;
    st.pity=HEROES[c.h][2]>=2?0:(st.pity||0)+1;
    addCard(G,c);day(st,ctx.now).opened++;return wel?{card:c,wel:1}:{card:c}},

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
      else{reward=Math.round(opp.v*.3+5);earn(st,reward)}}
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
    const slots=EX_SLOTS+(st.mapDay===today(ctx.now)?1:0);if(G.cards.filter(x=>x.away).length>=slots)fail("Все места для походов заняты");
    c.away=ctx.now+DEST[d].ms;c.dest=d;return {}},
  exp_rush(G){if(!G.ctx.test&&!G.ctx.admin)fail("Ускорение доступно только в тестовом режиме");const c=own(G,G.p.id);if(!c.away)fail("Воин не в походе");c.away=G.ctx.now-1;return {}},
  exp_claim(G){const {st,ctx}=G;const c=own(G,G.p.id);if(!c.away)fail("Воин не в походе");if(c.away>ctx.now)fail("Воин ещё в пути");
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
    gain=Math.round(gain)+chestR;C.en-=n;C.runes+=gain;C.total+=gain;campEarn(C,ctx.now,gain);C.fullAt=C.en>=campMax(C)?0:Math.round(ctx.now+(campMax(C)-C.en)/campMax(C)*campFull(C));
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
  grant(G){if(!G.ctx.grant)fail("Неизвестное действие");const {st,ctx,p}=G,I=SHOP[p.item];if(!I)fail("Нет такого товара");
    st.pays=st.pays||[];if(st.pays.includes(p.pid))return {dup:1};
    const got=[],add=c=>{c.how="chest";G.cards.push(c);noteCard(st,c);got.push(c)};   // купленное кладётся сверх лимита коллекции
    if(I.sp)st.spins+=I.sp;if(I.guar)st.guar=(st.guar||0)+I.guar;if(I.once)st.newbie=1;
    for(let i=0;i<(I.halves||0);i++)add(rollHalf(ctx,i===0&&I.right1?1:I.rightP));
    if(I.any)add(makeAny(ctx,p.h|0,p.f|0));
    if(I.twins){const d=rollDuo(ctx);if(d)add(d);else st.guar=(st.guar||0)+3}
    if(I.cards){let n=I.cards;
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
  title_buy(G){const T=TITLES[G.p.k];if(!T)fail("Нет такого титула");if(T.pass)fail("Этот титул — награда сезонного пропуска");const st=G.st;st.titles=st.titles||[];if(st.titles.includes(G.p.k))fail("Этот титул уже твой");
    pay(st,T.price);st.titles.push(G.p.k);st.title=G.p.k;return {k:G.p.k}},
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
  dg_tap(G){const {st,ctx}=G;const D=st.dg;if(!D)fail("Сначала нужен дракон");dgDay(D,ctx.now);const n=Math.max(0,Math.min(60,G.p.n|0,DG.tapCap-(D.tp||0)));if(!n)return {n:0,xp:0,cap:1};
    D.tp=(D.tp||0)+n;return {n,xp:dgAddXp(st,ctx,n),tp:D.tp}},
  dg_feed(G){const {st,ctx}=G;const D=st.dg;if(!D)fail("Сначала нужен дракон");dgDay(D,ctx.now);const F=DG_FOOD[G.p.k];if(!F)fail("Такой еды нет");const sat=dgSat(D,ctx.now);
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
    D.sh-=K.sh;const it=dgNewItem(D,pick(K.p));D.inv.push(it);return {item:it}},
  dg_evo(G){const D=G.st.dg;if(!D)fail("Сначала нужен дракон");if(D.evo)fail("Путь уже выбран");if(D.lv<DG_EVO_LV)fail("Эволюция открывается с "+DG_EVO_LV+" уровня");const k=String(G.p.k||"");if(!DG_EVO[k])fail("Нет такого пути");D.evo=k;return {evo:k}},
  dg_skin(G){const D=G.st.dg;if(!D)fail("Сначала нужен дракон");const k=G.p.k?String(G.p.k):null;if(k&&!(D.skins||[]).includes(k))fail("Этот облик ещё не куплен");D.skin=k;return {skin:k}},
  dg_skin_grant(G){if(!G.ctx.grant)fail("Неизвестное действие");const D=G.st.dg;if(!D)fail("Сначала нужен дракон");const k=String(G.p.k||"");if(!DG_SKIN[k])fail("Нет такого облика");D.skins=D.skins||[];if(!D.skins.includes(k))D.skins.push(k);D.skin=k;return {skin:k}},
  dga_apply(G){const A=G.ctx.dga;if(!A)fail("Неизвестное действие");const st=G.st,D=st.dg;if(!D)fail("Сначала нужен дракон");const d=today(G.ctx.now);st.dgA=st.dgA&&st.dgA.d===d?st.dgA:{d,n:0};
    const lim=DGA.day+(vipTier(st)?DGA.vipDay:0);if(st.dgA.n>=lim)fail("Бои на арене на сегодня закончились ("+lim+"). Завтра — новые!");if(A.check)return {left:lim-st.dgA.n};
    st.dgA.n++;const R=A.win?DGA.win:DGA.lose;D.sh=(D.sh||0)+R.sh;dgAddXp(st,G.ctx,R.xp);return {sh:R.sh,xp:R.xp,left:lim-st.dgA.n}},
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
function runAction(name,st,cards,ctx,p){const A=ACTIONS[name];if(!A)fail("Неизвестное действие");touch(st,ctx.now);const G={st,cards,ctx,p:p||{}};
  const D0=day(st,ctx.now),o0=D0.opened,w0=st.totalWins||0,c0=st.crafted||0;const res=A(G)||{};
  try{const D=day(st,ctx.now);passAdd(st,ctx,"open",Math.max(0,D.opened-o0));passAdd(st,ctx,"win",Math.max(0,(st.totalWins||0)-w0));
    if(name==="camp_tap")passAdd(st,ctx,"tap",res.n|0);if(name==="train"||name==="forge")passAdd(st,ctx,"up",1);if(name==="craft"||name==="merge")passAdd(st,ctx,"craft",1);
    if(name==="wheel")passAdd(st,ctx,"wheel",1);if(name==="sell")passAdd(st,ctx,"sell",1);if(name==="sellmany"||name==="sellcommon")passAdd(st,ctx,"sell",res.n|0||1)}catch(e){}
  return {res,cards:G.cards}}

/* титулы за деньги игры: покупаются один раз навсегда, деньги сгорают. Виден рядом с ником в топах, чате и рейтинге */
const TITLES={merchant:{n:"Купец",ic:"🪙",price:1e5},magnate:{n:"Магнат",ic:"💼",price:1e6},oligarch:{n:"Олигарх",ic:"🏦",price:1e7},tycoon:{n:"Повелитель золота",ic:"👑",price:1e8},season:{n:"Герой сезона",ic:"🎖",price:0,pass:1}};
/* аукцион дня: с 8:00 до 20:00 по Минску одна редкая карточка, ставка в последние 30 секунд продлевает торги */
const AUC_HOUR=8, AUC_MS=12*3600e3, AUC_EXT=30e3, AUC_STEP=.05;
const TRADER_MS=3*3600e3, TRADER_MARKUP=[1.5,1.6], TRADER_WANT_K=1.3, TRADER_WANT_N=5;
if(typeof module!=="undefined")module.exports={DG_CAS,dgCasDrop,DG,DG_STAGE,dgStage,dgCum,DG_BREED,DG_BR_R,DG_BR_P,DG_REB_P,DG_FOOD,DG_SLOT,DG_R,DG_SET,DG_CHEST,DG_SHOP,dgItemName,dgItemPow,dgUpCost,dgEq,dgSetBonus,dgPower,dgSat,dgBonus,dgDay,dgAddXp,dgWin,dgNewItem,dgView,dgSetOf,dgSlotOf,isBase,BASE,baseNo,DUO,isDuo,DUO_F,DUO_RUN,DUO_PAIRS,rollDuo,SLOT_STEP,SLOT_COIN,SLOT_STAR,VIP_SLOTS,VIP_CAP,capCoinPrice,capParts,capOf,conqLeft,conqBuyPrice,ERA_OF,CONQ,CONQ_CH,conqN,conqStage,conqDay,conqTorch,conqPow,cpow,PASS,PQ,passSeason,passEnd,passTheme,passQuests,passState,passLv,passReward,passAdd,ERAS,CLAN,clanHp,clanDmg,VIP_T,vipTier,exMax,EX,exDay,exPrice,COLLAB,isCollab,GIFTS,GR,GR_C,GR_V,giftVal,SHELF_N,CAS_DAY,CASE,SLOT,HL,hlP,casDay,GOLEM,TITLES,ABIL,abil,rkInit,rkTurn,rkAI,rkGain,rkFighter,wclass,league,LEAGUES,RK_DAY,FAT_N,FAT_MS,craftPrice,CRAFT_MAX,DON,ONE,rollOne,NBASE,COMP,isComp,SHOP,CHESTS,numPrice,checkSn,NFX,NFX_PRICE,HALF_RUN,TRAIN_B,campTrainer,campBonus,mskDay,mskWeek,camp,campMax,campFull,campPow,campCrit,campSq,campSqRate,TARGETS,CAMP_UP,CRIT_X,SQ_HOURS,spinsBought,spinPrice,BUY_MAX,WHEEL,aiPick,rndPick,away,spinCap,VIP_SPINS,checkNick,NICK_COST,STAR_MAX,epithet,HEROES,FIN,HT,NICE,classify,ACTIONS,runAction,freshState,touch,GameError,lvl,eff,CAP,MAX_LOTS,FEE,QUICK};
