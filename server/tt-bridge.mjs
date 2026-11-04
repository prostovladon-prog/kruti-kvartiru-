/* tt-bridge.mjs — читаем чат эфира TikTok (неофициальное подключение, как у TikFinity/pogzo) и пишем в таблицу live_chat.
   Нужна библиотека: cd /opt/voiny && npm i tiktok-live-connector
   Если TikTok попросит ключ подписи — получи бесплатный на eulerstream.com и добавь в /etc/voiny.env строку EULER_KEY=... */
export function makeBridge(DB, load = () => import("tiktok-live-connector")) {
  const B = { state: "off", user: "", err: "", conn: null, n: 0, at: 0 };
  const picOf = u => { const p = u && u.profilePicture; return (p && ((p.url && p.url[0]) || (p.urls && p.urls[0]))) || (u && u.profilePictureUrl) || "" };
  const ins = (kind, d) => {
    const u = d.user || d, uid = String(u.uniqueId || d.uniqueId || u.userId || d.userId || ""), nick = String(u.nickname || d.nickname || uid || "?").slice(0, 40);
    let text = "";
    if (kind === "chat") text = String(d.comment || "").slice(0, 200);
    if (kind === "gift") { const g = d.giftDetails || {}; text = String(d.giftName || g.giftName || "подарок") + ((d.repeatCount || 1) > 1 ? " ×" + d.repeatCount : "") }
    if (!uid && !nick) return;
    DB.prepare("INSERT INTO live_chat(uid,nick,text,pic,kind,t) VALUES(?,?,?,?,?,?)").bind(uid, nick, text, picOf(u) || picOf(d), kind, Date.now()).run().catch(() => {});
    B.n++; B.at = Date.now();
  };
  B.status = () => ({ state: B.state, user: B.user, err: B.err, n: B.n, at: B.at });
  B.stop = async () => { const c = B.conn; B.conn = null; B.state = "off"; try { c && c.disconnect && c.disconnect() } catch (e) {} return B.status() };
  B.start = async user => {
    await B.stop(); user = String(user || "").trim().replace(/^@/, ""); if (!user) { B.err = "Напиши ник в TikTok"; return B.status() }
    B.user = user; B.state = "connecting"; B.err = ""; B.n = 0;
    let mod; try { mod = await load() } catch (e) { B.state = "nolib"; B.err = "На сервере нет библиотеки. Выполни: cd /opt/voiny && npm i tiktok-live-connector"; return B.status() }
    const M = mod.default && !mod.TikTokLiveConnection && !mod.WebcastPushConnection ? mod.default : mod;
    const C = M.TikTokLiveConnection || M.WebcastPushConnection; if (!C) { B.state = "error"; B.err = "Неизвестная версия tiktok-live-connector"; return B.status() }
    const opts = process.env.EULER_KEY ? { signApiKey: process.env.EULER_KEY } : {};
    const conn = new C(user, opts); B.conn = conn;
    conn.on("chat", d => ins("chat", d));
    conn.on("gift", d => { if (d.giftType === 1 && d.repeatEnd === false) return; ins("gift", d) });   // серия подарков — пишем один раз в конце
    conn.on("member", d => ins("join", d));
    conn.on("streamEnd", () => { if (B.conn === conn) B.state = "ended" });
    conn.on("disconnected", () => { if (B.conn === conn && B.state === "on") B.state = "lost" });
    conn.on("error", e => { B.err = String((e && (e.message || e.info)) || e).slice(0, 300) });
    try { await conn.connect(); if (B.conn === conn) B.state = "on" }
    catch (e) { if (B.conn === conn) { B.state = "error"; const m = String((e && (e.message || e.info)) || e); B.err = /offline|not.*live|LIVE has ended|UserOfflineError/i.test(m) ? "Эфир @" + user + " сейчас не идёт — запусти эфир и подключи снова" : m.slice(0, 300) } }
    return B.status();
  };
  return B;
}
