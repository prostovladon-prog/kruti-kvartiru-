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
  try{const u=JSON.parse(q.get("user")||"{}");if(!u.id)return null;return {id:u.id,name:String(u.first_name||"Игрок").slice(0,32),start:q.get("start_param")||""}}catch(e){return null}
}

/* ---------- база ---------- */
/* новые колонки добавляются сами при первом запросе, вручную в консоли ничего делать не нужно */
let schemaOk=false;
async function ensureSchema(env){if(schemaOk)return;
  for(const q of ["ALTER TABLE users ADD COLUMN ref INTEGER","ALTER TABLE users ADD COLUMN refs INTEGER NOT NULL DEFAULT 0","ALTER TABLE users ADD COLUMN gift_spins INTEGER NOT NULL DEFAULT 0",
    "ALTER TABLE cards ADD COLUMN stars INTEGER NOT NULL DEFAULT 0","ALTER TABLE users ADD COLUMN nick TEXT","ALTER TABLE users ADD COLUMN nick_key TEXT",
    "CREATE UNIQUE INDEX IF NOT EXISTS users_nick ON users(nick_key)",
    "ALTER TABLE users ADD COLUMN worth REAL NOT NULL DEFAULT 0","ALTER TABLE users ADD COLUMN album INTEGER NOT NULL DEFAULT 0","ALTER TABLE users ADD COLUMN wins INTEGER NOT NULL DEFAULT 0",
    "CREATE INDEX IF NOT EXISTS users_worth ON users(worth)","CREATE INDEX IF NOT EXISTS users_album ON users(album)","CREATE INDEX IF NOT EXISTS users_wins ON users(wins)",
    "CREATE INDEX IF NOT EXISTS cards_v ON cards(v) WHERE owner>0",
    "DELETE FROM cards WHERE owner=0"])   // старые проданные карточки: освобождаем их номера
    try{await env.DB.prepare(q).run()}catch(e){}
  schemaOk=true}
function rowToCard(r){return {id:r.id,h:r.h,f:r.f,no:r.no,sn:r.sn,hue:r.hue,v:r.v,stats:JSON.parse(r.stats),xp:r.xp,wins:r.wins,stars:r.stars||0,frame:r.frame,
  away:r.away,dest:r.dest,listed:r.list_price!=null?1:0,listPrice:r.list_price||0}}
const pub=c=>({id:c.id,h:c.h,f:c.f,no:c.no,sn:c.sn,hue:c.hue,v:c.v,stats:c.stats,xp:c.xp,wins:c.wins,stars:c.stars||0,frame:c.frame});
/* новый игрок. Приглашение (r_<id друга>) засчитывается только новому игроку и не самому себе */
async function createUser(env,me){const st=freshState(),cash=st.cash,now=Date.now();delete st.cash;
  const m=/^r_(\d+)$/.exec(me.start||""),inviter=m&&+m[1]!==me.id?+m[1]:null;
  const ins=await env.DB.prepare("INSERT OR IGNORE INTO users(id,name,cash,state,ver,created,updated,ref) VALUES(?,?,?,?,0,?,?,?)").bind(me.id,me.name,cash,JSON.stringify(st),now,now,inviter).run();
  if(inviter&&ins.meta.changes===1)await env.DB.prepare("UPDATE users SET refs=refs+1,gift_spins=gift_spins+10 WHERE id=?").bind(inviter).run();
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
  for(const r of (await env.DB.prepare("SELECT h,f,COUNT(*) AS n,MAX(no) AS m FROM cards GROUP BY h,f").all()).results){const k=r.h+"-"+r.f;cnt[k]=r.n;max[k]=r.m;
    if(r.f>0&&r.m>=FIN[r.f].run&&r.n<FIN[r.f].run){   // тираж был выпущен целиком, но часть вернулась: ищем свободные места
      const used=new Set((await env.DB.prepare("SELECT no FROM cards WHERE h=? AND f=?").bind(r.h,r.f).all()).results.map(x=>x.no));
      gaps[k]=[];for(let i=1;i<=FIN[r.f].run;i++)if(!used.has(i))gaps[k].push(i)}}
  const nice=new Set((await env.DB.prepare("SELECT sn FROM cards WHERE nice=1").all()).results.map(r=>r.sn));
  return {now:Date.now(),test,events:[],
    issuedOf:(h,f)=>FIN[f].run===Infinity?(max[h+"-"+f]||0):(cnt[h+"-"+f]||0),
    nextNo:(h,f)=>{const k=h+"-"+f;cnt[k]=(cnt[k]||0)+1;if(gaps[k]&&gaps[k].length)return gaps[k].shift();return max[k]=(max[k]||0)+1},
    snFree:s=>!nice.has(s)&&!taken.has(s),takeSn:s=>taken.add(s),newId:()=>"n"+(++seq)};
}
/* администраторы игры (id в Telegram). Можно задать и переменной ADMINS="id1,id2" в настройках воркера */
const ADMINS=[6724818967];
const isAdmin=(env,id)=>ADMINS.includes(id)||String(env.ADMINS||"").split(",").map(Number).includes(id);
async function stateFor(env,me){
  const {u,cards}=await loadUser(env,me);
  const prints={};for(const r of (await env.DB.prepare("SELECT h,f,COUNT(*) AS m FROM cards WHERE f>0 GROUP BY h,f").all()).results)prints[r.h+"-"+r.f]=r.m;
  const news=(await env.DB.prepare("SELECT h,buyer_name AS buyer,price,got FROM sales WHERE seller=? AND seen=0").bind(me.id).all()).results;
  if(news.length)await env.DB.prepare("UPDATE sales SET seen=1 WHERE seller=? AND seen=0").bind(me.id).run();
  const S=Object.assign(JSON.parse(u.state||"{}"),{cash:u.cash,cards,prints,news,uid:me.id,name:u.nick||u.name,nick:u.nick||null,test:env.TEST==="1",refs:u.refs||0,admin:isAdmin(env,me.id)});
  S.spins=(S.spins??0)+(u.gift_spins||0);
  touch(S,Date.now());
  // числа для мирового топа: обновляем, только если изменились
  const worth=Math.round(cards.reduce((a,c)=>a+c.v,0)*100)/100,album=new Set(cards.map(c=>c.h)).size,wins=S.totalWins||0;
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
    ctx.admin=isAdmin(env,me.id);ctx.luck=ctx.admin&&(st.luckUntil||0)>ctx.now;
    const gift=u.gift_spins||0;st.spins=(st.spins??0)+gift;   // прокрутки за приглашённых друзей
    const before=new Map(cards.map(c=>[c.id,JSON.stringify(c)]));
    const out=runAction(name,st,cards.map(c=>JSON.parse(JSON.stringify(c))),ctx,p);
    const delta=Math.round((st.cash-u.cash)*100)/100;delete st.cash;
    // новая версия случайная: проверка ниже пропустит записи, только если именно этот запрос обновил игрока
    const nv=Math.floor(Math.random()*9e15)+1,guard="(SELECT ver FROM users WHERE id=?)=?",keep=new Set();
    const stm=[env.DB.prepare("UPDATE users SET state=?,cash=cash+?,gift_spins=gift_spins-?,ver=?,name=?,updated=? WHERE id=? AND ver=?").bind(JSON.stringify(st),delta,gift,nv,me.name,ctx.now,me.id,u.ver)];
    for(const c of out.cards){
      if(typeof c.id==="string"){stm.push(env.DB.prepare(`INSERT INTO cards(owner,h,f,no,sn,nice,hue,v,stats,xp,wins,stars,frame,away,dest,created) SELECT ?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,? WHERE ${guard}`)
        .bind(me.id,c.h,c.f,c.no,c.sn,classify(c.sn)?1:0,c.hue,c.v,JSON.stringify(c.stats),c.xp|0,c.wins|0,c.stars|0,c.frame||null,c.away||0,c.dest??null,ctx.now,me.id,nv));continue}
      keep.add(c.id);
      if(before.get(c.id)!==JSON.stringify(c))stm.push(env.DB.prepare(`UPDATE cards SET xp=?,wins=?,stars=?,v=?,frame=?,away=?,dest=? WHERE id=? AND owner=? AND ${guard}`)
        .bind(c.xp|0,c.wins|0,c.stars|0,c.v,c.frame||null,c.away||0,c.dest??null,c.id,me.id,me.id,nv));
    }
    for(const id of before.keys())if(!keep.has(id))stm.push(env.DB.prepare(`DELETE FROM cards WHERE id=? AND owner=? AND list_price IS NULL AND ${guard}`).bind(id,me.id,me.id,nv));
    let rs;try{rs=await env.DB.batch(stm)}catch(e){if(/UNIQUE/i.test(String(e&&e.message||e)))continue;throw e}
    if(rs[0].meta.changes!==1)continue;
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
  const price=Math.round(+p.price||0);if(!(price>=1&&price<=1e7))fail("Цена от $1 до $10 000 000");
  const r=await env.DB.prepare("UPDATE cards SET list_price=?,listed_at=? WHERE id=? AND owner=? AND list_price IS NULL AND away=0 AND (SELECT COUNT(*) FROM cards WHERE owner=? AND list_price IS NOT NULL)<?")
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
  await env.DB.batch([env.DB.prepare("UPDATE users SET cash=cash+? WHERE id=?").bind(got,seller),
    env.DB.prepare("INSERT INTO sales(card,h,seller,buyer,buyer_name,price,got,t) VALUES(?,?,?,?,?,?,?,?)").bind(c.id,c.h,seller,me.id,bu.nick||me.name,price,got,Date.now())]);
  return {card:pub(rowToCard(Object.assign(c,{owner:me.id,list_price:null})))};
}

/* ---------- друзья ---------- */
async function profile(env,p){
  const u=await env.DB.prepare("SELECT id,COALESCE(nick,name) AS name,state FROM users WHERE id=?").bind(p.uid|0).first();if(!u)fail("Игрок не найден");
  const cards=(await env.DB.prepare("SELECT * FROM cards WHERE owner=? ORDER BY v DESC LIMIT 3").bind(u.id).all()).results.map(r=>pub(rowToCard(r)));
  const have=await env.DB.prepare("SELECT COUNT(DISTINCT h) AS n FROM cards WHERE owner=?").bind(u.id).first();
  return {name:u.name||"Игрок",wins:(JSON.parse(u.state||"{}").totalWins)||0,have:have.n,cards,uid:u.id};
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
    const items=await cached("cards",60e3,async()=>(await env.DB.prepare("SELECT c.*,COALESCE(u.nick,u.name) AS owner_name FROM cards c JOIN users u ON u.id=c.owner WHERE c.owner>0 ORDER BY c.v DESC LIMIT 30").all()).results
      .map(r=>({uid:r.owner,name:r.owner_name||"Игрок",card:pub(rowToCard(r)),score:r.v})));
    return {res:{kind,items},S};
  }
  if(kind==="feed"){
    const big=HEROES.map((H,i)=>H[2]>=3?i:-1).filter(i=>i>=0).join(",");
    const items=await cached("feed",20e3,async()=>(await env.DB.prepare(`SELECT c.*,COALESCE(u.nick,u.name) AS owner_name FROM cards c JOIN users u ON u.id=c.owner WHERE c.owner>0 AND (c.f>=2 OR c.nice=1 OR c.h IN (${big})) ORDER BY c.id DESC LIMIT 20`).all()).results
      .map(r=>({uid:r.owner,name:r.owner_name||"Игрок",card:pub(rowToCard(r)),t:r.created})));
    return {res:{kind,items},S};
  }
  const col=BOARDS[kind];if(!col)fail("Нет такого рейтинга");
  const items=await cached(kind,60e3,async()=>{
    const rows=(await env.DB.prepare(`SELECT id,COALESCE(nick,name) AS name,${col} AS score FROM users WHERE ${col}>0 ORDER BY ${col} DESC LIMIT 50`).all()).results;
    const out=[];for(const r of rows){const b=await env.DB.prepare("SELECT * FROM cards WHERE owner=? ORDER BY v DESC LIMIT 1").bind(r.id).first();
      out.push({uid:r.id,name:r.name||"Игрок",score:r.score,card:b?pub(rowToCard(b)):null})}return out});
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

/* ---------- подписка на канал (бот должен быть администратором канала) ---------- */
const CHANNEL="@Voiny_official";
async function subCheck(env,me){
  if(me.dev)return doAction(env,me,"sub_reward",{},{subOk:true});   // тестовый вход без Telegram
  const r=await fetch("https://api.telegram.org/bot"+env.BOT_TOKEN+"/getChatMember?chat_id="+encodeURIComponent(env.CHANNEL||CHANNEL)+"&user_id="+me.id);
  const j=await r.json().catch(()=>({}));
  if(!j.ok){console.error("getChatMember",j);fail("Не получилось проверить подписку. Попробуй через минуту")}
  if(!["member","administrator","creator"].includes(j.result&&j.result.status))fail("Подписки пока не видно. Подпишись на канал и нажми «Проверить» ещё раз");
  return doAction(env,me,"sub_reward",{},{subOk:true});
}

/* ---------- бот: ответ на /start и настройка ----------
   Один раз открой в браузере https://<адрес воркера>/setup — сервер сам подключит бота
   и заполнит название, описание и команды. */
const PAGE="https://prostovladon-prog.github.io/kruti-kvartiru-/";
const BOT_TEXT={
  name:"Воины Эпох",
  short:"Крути карточки воинов всех эпох: редкие номера, золото и ошибки печати. Бои, рынок и топ мира ⚔️",
  desc:"⚔️ ВОИНЫ ЭПОХ: коллекционная игра с карточками воинов\n\n🎴 Бесплатные прокрутки каждые 4 часа: от ополченца до Сёгуна и Мерлина\n💎 Каждая карточка одна в своём роде: свой номер, тираж и отделка. Ошибка печати одна на всю игру\n🔥 Закаляй воинов до ★5\n⚔️ Бои с друзьями, босс недели, рынок между игроками\n🏆 Поднимайся в топ мира\n\nЖми «Начать» 👇",
  cmds:[{command:"start",description:"Играть"},{command:"help",description:"Как играть"},{command:"invite",description:"Пригласить друга (+10 прокруток)"}]};
async function tgApi(env,method,body){const r=await fetch("https://api.telegram.org/bot"+env.BOT_TOKEN+"/"+method,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(body)});return r.json().catch(()=>({ok:false}))}
async function hookSecret(env){return hex(new Uint8Array(await crypto.subtle.digest("SHA-256",new TextEncoder().encode("hook:"+env.BOT_TOKEN)))).slice(0,48)}
async function setup(env,origin){const out={};
  out.webhook=await tgApi(env,"setWebhook",{url:origin+"/tg",secret_token:await hookSecret(env),allowed_updates:["message"]});
  out.name=await tgApi(env,"setMyName",{name:BOT_TEXT.name});
  out.short=await tgApi(env,"setMyShortDescription",{short_description:BOT_TEXT.short});
  out.desc=await tgApi(env,"setMyDescription",{description:BOT_TEXT.desc});
  out.cmds=await tgApi(env,"setMyCommands",{commands:BOT_TEXT.cmds});
  out.menu=await tgApi(env,"setChatMenuButton",{menu_button:{type:"web_app",text:"Играть",web_app:{url:PAGE}}});
  const ok=Object.values(out).every(r=>r&&r.ok);
  return new Response((ok?"✅ Готово! Бот настроен: приветствие, описание, команды и кнопка «Играть».":"⚠️ Не всё получилось, подробности ниже. Если ошибка про токен, проверь секрет BOT_TOKEN.")+"\n\n"+Object.entries(out).map(([k,v])=>k+": "+(v&&v.ok?"ok":JSON.stringify(v))).join("\n"),{headers:{"Content-Type":"text/plain; charset=utf-8"}});
}
async function onUpdate(env,upd){const m=upd.message;if(!m||!m.chat||m.chat.type!=="private"||!m.from)return;
  const text=String(m.text||""),[cmd,arg]=text.split(/\s+/),name=String(m.from.first_name||"воин").slice(0,32);
  const play=(t,url)=>({inline_keyboard:[[{text:t,web_app:{url:url||PAGE}}],[{text:"📣 Канал игры",url:"https://t.me/"+CHANNEL.slice(1)}]]});
  if(cmd==="/start"&&arg&&/^r_\d+$/.test(arg))await createUser(env,{id:m.from.id,name,start:arg});   // приглашение по ссылке ?start=r_<id>
  if(cmd==="/invite"){
    const link="https://t.me/"+(env.BOT_USERNAME||"VoinyEpohBot")+"?startapp=r_"+m.from.id;
    return tgApi(env,"sendMessage",{chat_id:m.chat.id,text:"Твоя ссылка для друзей:\n"+link+"\n\nЗа каждого нового игрока, который зайдёт по ней, ты получишь +10 прокруток 🎁",
      reply_markup:{inline_keyboard:[[{text:"📤 Отправить другу",url:"https://t.me/share/url?url="+encodeURIComponent(link)+"&text="+encodeURIComponent("Залетай в «Воины Эпох»: крути карточки воинов и собирай легенды!")}]]}})}
  if(cmd==="/help")return tgApi(env,"sendMessage",{chat_id:m.chat.id,text:"Как играть:\n\n🎴 Жми «Играть» и открывай карточки. 3 бесплатные прокрутки каждые 4 часа\n💎 Редкость, отделка и номер решают цену. Красивые номера (777 777, 000 001) стоят дороже\n🔥 Закаляй воинов до ★5 и качай уровень в боях и походах\n🛒 Продавай и покупай карточки на рынке у других игроков\n🏆 Смотри своё место в топе мира\n\n🎁 +10 прокруток за подписку на "+CHANNEL+" и за каждого друга (/invite)",reply_markup:play("⚔️ Играть")});
  return tgApi(env,"sendPhoto",{chat_id:m.chat.id,photo:PAGE+"assets/welcome.png",
    caption:"Привет, "+name+"! Добро пожаловать в «Воины Эпох» ⚔️\n\nТебя ждут 5 бесплатных прокруток. Открой первую карточку, вдруг выпадет легенда?\n\n🎁 +10 прокруток за подписку на "+CHANNEL+" и за каждого друга",
    reply_markup:play("⚔️ Играть")});
}

/* ---------- маршрутизация ---------- */
export default {
  async fetch(req,env){
    if(req.method==="OPTIONS")return new Response(null,{headers:CORS});
    const url=new URL(req.url);
    if(req.method==="GET"&&url.pathname==="/setup"){await ensureSchema(env);return setup(env,url.origin)}
    if(req.method==="GET")return J({ok:true,game:"Воины Эпох",server:"работает"});
    if(url.pathname==="/tg"){   // сообщения боту от Telegram
      if(req.headers.get("X-Telegram-Bot-Api-Secret-Token")!==await hookSecret(env))return new Response("no",{status:403});
      await ensureSchema(env);try{await onUpdate(env,await req.json())}catch(e){console.error("bot",e)}return new Response("ok")}
    let me=null;
    await ensureSchema(env);
    if(env.DEV==="1"&&req.headers.get("X-Dev-User"))me={id:+req.headers.get("X-Dev-User")||1,name:"Тестер "+req.headers.get("X-Dev-User"),start:req.headers.get("X-Dev-Start")||"",dev:1};
    else me=await checkInit(req.headers.get("X-Init-Data"),env.BOT_TOKEN);
    if(!me)return J({ok:false,err:"Открой игру через бота в Telegram"},401);
    let body;try{body=await req.json()}catch(e){return J({ok:false,err:"Плохой запрос"},400)}
    const a=String(body.a||""),p=body.p||{};
    try{
      if(a==="market")return J({ok:true,res:await market(env,me),S:await stateFor(env,me)});
      if(a==="list"||a==="unlist"||a==="buy"){const res=await (a==="list"?list:a==="unlist"?unlist:buy)(env,me,p);const S=await stateFor(env,me);fixIds(res,S.cards);return J({ok:true,res,S})}
      if(a==="profile")return J({ok:true,res:await profile(env,p),S:await stateFor(env,me)});
      if(a==="card")return J({ok:true,res:await cardInfo(env,p),S:await stateFor(env,me)});
      if(a==="fduel"){const o=await cardInfo(env,{id:p.oppId});if(o.owner===me.id)fail("Это твоя же карточка");
        const r=await doAction(env,me,"fduel",{myId:p.myId,myStat:p.myStat,oppStat:p.oppStat,key:"c"+o.card.id,opp:o.card});return J({ok:true,...r})}
      if(a==="nick"){const res=await setNick(env,me,p);return J({ok:true,res,S:await stateFor(env,me)})}
      if(a==="top")return J({ok:true,...await top(env,me,p)});
      if(a==="sub_check"){const r=await subCheck(env,me);return J({ok:true,...r})}
      if(a==="sub_reward")fail("Неизвестное действие");
      if(a==="luck_set"&&!isAdmin(env,me.id))fail("Нет доступа");
      if(a==="sync")return J({ok:true,res:{},S:await stateFor(env,me)});
      if(!ACTIONS[a])fail("Неизвестное действие");
      const r=await doAction(env,me,a,p);return J({ok:true,...r});
    }catch(e){
      if(e instanceof GameError)return J({ok:false,err:e.message});
      console.error(e);return J({ok:false,err:"Ошибка сервера"},500);
    }
  }
};
