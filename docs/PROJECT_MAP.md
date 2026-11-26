# Карта проекта «Воины Эпох»

Снимок на 25.11.2026 (коммит `5a6d68a`). Номера строк примерные — искать по заголовкам-комментариям через `grep -n`.

## 1. Файлы верхнего уровня (клиент)

Порядок подключения в `index.html` важен: `rules.js → game.js → wow.js → event.js(async) → menu.js → dragon.js → teach.js → turnir.js → zvezda.js → enc.js → ref.js → tutor.js → admin.js → gems.js → community.js → tower-rules.js → tower.js`.

| Файл | Размер | Что внутри |
|---|---|---|
| `index.html` | 45 КБ | разметка, экран загрузки (boot), вкладки `tab-spin/cards/fight/dragon/shop/more/map/clan/cas/gold/prof`, модалка `#modal > #msheet` |
| `style.css` | 520 КБ | все стили |
| `rules.js` | 300 КБ | правила (общие с сервером): константы, `HEROES` (254 записи, 161 в прокрутках `BASE`), отделки, шансы, номера, уровни, закалка, крафт, лагерь, рейтинговый бой, Империя, Зал славы, Покорение, дракон, гемы, казино, `ACTIONS` (~1150+), `runAction` |
| `game.js` | 460 КБ | основной клиент: настройки (`API_URL`, `BOT_LINK` в начале), `act()`, портреты-SVG героев, рендер карточек, открытие, альбом, коллекция, крафт, слияние, лагерь, бои/дуэли/арена, походы, босс, друзья, рынок, лавка, торговец, аукцион, титулы, топ, ник, админ-статистика, Сокровищница (Stars), рейтинговый бой, чат, колесо, турнир, помощь, обучение, запуск |
| `wow.js` | 220 КБ | подарки и витрины, казино рун, голем, 3D-эффекты лагеря |
| `menu.js` | 255 КБ | нижняя панель (Крутить · Карты · Бой · Дракон · Рынок · Ещё) и шторка «Ещё» со всеми разделами, плитки на главной |
| `dragon.js` | 115 КБ | клиент дракона (яйцо, слои SVG, снаряжение, походы, арена драконов) |
| `gems.js` | 170 КБ | Кузня гемов стихий (рисованные гемы, вставка в дракона/карты) |
| `event.js` | 28 КБ | ивент «Поколение Эпох» (переопределяет `openConq()`), id элементов `ev-*` |
| `tower.js`, `tower-rules.js` | 48+40 КБ | Башня испытаний и экран её правил |
| `teach.js` | 31 КБ | «Мудрец Эпох» — справочник вопрос-ответ без ИИ (`TEACH`) |
| `tutor.js` | 14 КБ | обучение 2.0: 14 экранов → ник → канал и чат |
| `community.js` | 10 КБ | обязательная подписка канал+чат, конкурс приглашений |
| `turnir.js` | 15 КБ | «Турнир Эпох» — видео-турнир, угадай победителя |
| `zvezda.js` | 7 КБ | конкурс видео «Звезда Эпох» |
| `enc.js` | 10 КБ | энциклопедия карт (редкости, остатки тиражей) |
| `ref.js` | 13 КБ | реф-кейс и Плинко (прокрутки за приглашённых) |
| `admin.js` | 9 КБ | админка (`adm_dash`) |
| `quiz.js` | 5 КБ | викторина — **не подключена** в index.html |
| `play.html`, `terms.html` | | вспомогательная страница и правила/условия |
| `version.json` | | `{"v": ...}` — версия сборки, ставит `tools/bump.py` |

Ассеты: `assets/` (посты, видео, музыка `assets/music/*.mp3`, аватарки, `story.jpg`, `welcome.png`), `assets/ep/` (эпизоды мультиков), `event-assets/` (постеры ивентов + python-скрипты, которые их рисуют), `concepts/` (наброски карт).

## 2. Сервер

| Файл | Что |
|---|---|
| `server/server.js` | весь сервер (~6100 строк) |
| `server/worker.js` | **сборка** rules.js + server.js (`tools/build_worker.py`). Именно её запускает VPS. Руками не править |
| `server/node-server.mjs` | HTTP-сервер для VPS: SQLite (`node:sqlite`) с обёрткой как D1, `tick` каждые 5 с, `scheduled` каждые 10 мин, мост TikTok |
| `server/tt-bridge.mjs` | чтение чата эфира TikTok в таблицу `live_chat` (нужен `npm i tiktok-live-connector` на VPS) |
| `server/schema.sql` | базовые таблицы (users, cards, stats, fights, rooms, tours, chat, sales …) |
| `server/wrangler.toml` | старый вариант для Cloudflare |
| `server/*-test.mjs`, `arena-sim.mjs` | тесты: event, tower, stake, reaction, arena-sim (входят в check.mjs); `local-test.mjs` — большой общий тест (сейчас падает, устарел) |

### Разделы server.js (по заголовкам)
- нач.: проверка Telegram initData (`checkInit`), `SCHEMA_V` + `MIGRATIONS` + `ensureSchema`
- ~165 акции VIP, рекламные ссылки `s_<метка>`, `/go/<метка>`; ~196 личные сообщения; ~242 арена драконов; ~293 админ: звёзды, обнуление/бан
- ~341 новый игрок, рефералы, статистика админа; ~409 `ADMINS`, `isAdmin`; первопроходцы
- ~484 Башня: недельный топ; ~644 **Арена 20:30** (сетка турнира)
- ~1013 день рождения игры; **~1238 `doAction`** (общий путь действий через rules.js)
- ~1534 ник; ~1619 бои с игроками; ~1660 чат, чат клана, поиск; ~1707 арена (живые бои, `room_*`); ~1800 рейтинговый бой; ~1898 торговец; ~1926 аукцион; ~1982 турнир выходных
- ~2076 промокоды; ~2078 эфир; ~2118 акции друзей; ~2163 голосования за серии; ~2240 реф-кейс/Плинко; ~2280 админка; ~2291 «Турнир Эпох»; ~2349 загадка серии
- ~2466 подписка на канал, чат; ~2502 **напоминания бота**; ~2580 карта мира, Король мира, Земля драконов, Земли союзов; ~2662 гонка активности; ~2755 лотерея; ~2821 война армий; ~2908 возврат пропавших
- ~2923 бот /start и `/setup`; ~2932 **оплата Telegram Stars (XTR)**; ~2936 подарки; **~2966 Карта дня (`DC_PLAN` — карты дня по датам Минска)**
- ~3126 титулы за звёзды; ~3304 топ донатеров; ~3324 экспорт базы / техработы (`maintenance`); ~3350 модерация чата ботом
- ~3408–3640 челленджи, розыгрыши, конкурсы историй, тексты постов; ~3640 посты в канал по расписанию
- ~3670 казино: журнал, бегущая строка, онлайн-ракетка; ~3859 кланы, подарки/обмен карточками; ~4013 война кланов (гекс-карта)
- ~4054–4670 опросы и **много разовых акций/постов по датам** (промокоды, рассылки)
- ~4692 маршрутизация, викторина; ~4773 «Призыв Эпох»; ~4998 `export default {tick, scheduled, fetch}`
- ~5004 пост в 08:00; ~5020 анонс Башни; **~5053–5857 ивент «Поколение Эпох»** (`ev_*`, сегменты, кланы, награды, админ-операции)
- **~5859 `handle()`** — HTTP-роутер: `/setup`, `/mp/<uid>`, `/go/<code>`, `/export`, `/tg` (вебхук бота), остальное `POST /api {a,p}`

### HTTP API
`POST /api` с `{a, p}`, заголовок `X-Init-Data`. Ответ `{ok, res, S?}` либо `{ok:false, err}`.
Действия роутера server.js: `ad_bonus adm_dash adm_newbies auc auc_bid buy camp_tap camp_top card cas_* cat_info cb_claim chal_get chal_set chat_* clan_info cm_get cm_send comeback_spin community_check crash_list crash_rep cw_get dg_grant dg_looks dg_top dg_view dtop duel ev_admin ev_claim ev_contrib ev_hit ev_shop ev_state fduel fol_* fr_add fr_del gift_top hype invoice list lot_get luck_set map_get map_stats market mph_list nick open open_multi ord_* pair_* pay_bal pay_sim pay_status pl_find pm_on profile promo_* rk_find rk_get roc_* shop src_users stake_set stats story_join sub_check sync terms_ok title_* tk_ping top tour_get tower_* tr_cards tr_list trader trader_buy trader_sell unl_claim unlist war_attack`, а также `arena_list`, `room_*`.
Остальное — в `ACTIONS` из rules.js (через `doAction`): `open open_multi sell sellmany sellcommon craft fuse merge forge assemble duel fduel boss_* exp_* camp_* castle_* dg_* gem_* cas_* conq_* wheel train streak task ach era_claim goal_claim path_claim pass_* title_* theme_set ava_set hof_* map_use war_use luck_buy cap_buy dsp_buy dsp_roll myst_pick prize_* …`.

## 3. База (SQLite на VPS)

Основные: `users` (id=Telegram id, cash, state JSON, nick, ref/refs, vip_until, clan, stake, pioneer, banned…), `cards` (owner: 0 = ушла из игры, -1 = казна; h, f, no, sn уникальны; stars, xp, list_price, room_id, away), `kv` (флаги, разовые ключи, schema_v), `stats`, `fights`, `rooms`, `tours/tour_players/tour_matches`, `chat`, `sales`, `orders`, `payments`, `promo`, `clans/clan_*`, `gifts`, `friends`, `dm`, `map_*`, `ev_*` (ивент), `tk*`, `crash_log`, `live_chat` и др. Полный список — `grep -n "CREATE TABLE" server/server.js`.

## 4. Инструменты (`tools/`)

| Файл | Зачем |
|---|---|
| `build_worker.py` | собрать `server/worker.js` |
| `bump.py` | обновить `?v=` в index.html и `version.json` (список файлов внутри скрипта!) |
| `check.mjs` | проверка перед пушем: синтаксис, тесты ивента/Башни/ставок/Арены/реакций, версии, ссылки, наличие постеров |
| `install-hooks.ps1` | pre-push хук на Windows у владельца |
| `bundle.py` | `dist/single.html` (устарел: заменяет только старые теги без `?v=`) |
| `vps-setup.sh`, `migrate.sh`, `set-token.sh`, `import-from-cloudflare.mjs` | установка VPS, перенос базы с Cloudflare, смена токена |
| `r2_backup.py`, `r2-backup-setup.sh`, `R2_BACKUP.md`, `test_r2_backup.py` | шифрованные бэкапы SQLite в Cloudflare R2 через restic |
| `release-1800/` | материалы релиза (рендеры, листы) |

## 5. Ветки на GitHub

`main` — прод. Старые ветки фич: `feat/tower`, `feat/event-epoch`, `feat/20-new-heroes`, `audit/security-hardening`, `perf/*`, `release/*`, `fix/event-reward-tick-lag` (слита PR #1). Владелец в основном коммитит прямо в `main`.

## 6. Частые задачи — где править

- **Новый воин**: запись в `HEROES` в rules.js (в конец, индексы не менять), добавить в нужный список (BASE/серия), портрет в game.js (функции портретов), build_worker + bump.
- **Карта дня**: `DC_PLAN` в server.js (дата Минска → `{n,e,d,o}`), при необходимости SVG в game.js.
- **Акция/пост в канал по времени**: функция `...Tick(env)` в server.js + вызов в `tick()` в `export default`, защита ключом в `kv`, картинка в `assets/` или `event-assets/` (запушить заранее).
- **Промокод**: таблица `promo` (админка/код в server.js раздел промокодов).
- **Баланс/шансы/цены**: константы в начале rules.js и соответствующие разделы.
- **Тексты Мудреца**: `TEACH` в teach.js.
- **Что нового**: game.js раздел «что нового» (~2591).
