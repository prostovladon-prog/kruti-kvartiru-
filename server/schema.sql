-- База данных «Воинов Эпох» (Cloudflare D1).
-- Вставь этот текст целиком в консоль D1 и нажми Execute.

CREATE TABLE IF NOT EXISTS users (
  id       INTEGER PRIMARY KEY,          -- id игрока в Telegram
  name     TEXT,
  cash     REAL    NOT NULL DEFAULT 100, -- деньги меняются только прибавлением, поэтому продажи не теряются
  state    TEXT    NOT NULL DEFAULT '{}',-- прокрутки, задания, босс и прочее
  ver      INTEGER NOT NULL DEFAULT 0,   -- защита от двойного нажатия
  nick     TEXT,                         -- ник, который игрок придумал сам
  nick_key TEXT,                         -- ник маленькими буквами, по нему проверяется уникальность
  ref      INTEGER,                      -- кто пригласил
  refs     INTEGER NOT NULL DEFAULT 0,   -- сколько друзей пригласил
  gift_spins INTEGER NOT NULL DEFAULT 0, -- прокрутки за друзей, ещё не добавленные
  worth    REAL    NOT NULL DEFAULT 0,   -- стоимость коллекции (для мирового топа)
  album    INTEGER NOT NULL DEFAULT 0,   -- сколько разных воинов собрано
  wins     INTEGER NOT NULL DEFAULT 0,   -- побед в боях
  seen     INTEGER NOT NULL DEFAULT 0,   -- когда последний раз заходил
  back     INTEGER NOT NULL DEFAULT 0,   -- возвращался в другой день
  d1       INTEGER NOT NULL DEFAULT 0,   -- вернулся на следующий день после первого входа
  muted    INTEGER NOT NULL DEFAULT 0,   -- до какого времени запрещено писать в чат
  created  INTEGER,
  updated  INTEGER
);

-- Каждая карточка существует один раз на всю игру.
-- Номер (sn) уникален, и номер экземпляра в тираже (h, f, no) тоже уникален.
CREATE TABLE IF NOT EXISTS cards (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  owner      INTEGER NOT NULL,           -- 0 = карточка ушла из игры (продана системе или проиграна)
  h          INTEGER NOT NULL,           -- воин
  f          INTEGER NOT NULL,           -- отделка
  no         INTEGER NOT NULL,           -- номер экземпляра в тираже
  sn         TEXT    NOT NULL UNIQUE,    -- номер карточки
  nice       INTEGER NOT NULL DEFAULT 0, -- красивый номер
  hue        INTEGER,
  v          REAL    NOT NULL,           -- оценка
  stats      TEXT    NOT NULL,
  xp         INTEGER NOT NULL DEFAULT 0,
  wins       INTEGER NOT NULL DEFAULT 0,
  stars      INTEGER NOT NULL DEFAULT 0, -- закалка ★1–★5
  frame      TEXT,
  away       INTEGER NOT NULL DEFAULT 0, -- время возвращения из похода
  dest       INTEGER,
  list_price REAL,                       -- цена на рынке, пусто = не продаётся
  listed_at  INTEGER,
  created    INTEGER,
  UNIQUE (h, f, no)
);
CREATE INDEX IF NOT EXISTS cards_owner  ON cards(owner);
CREATE INDEX IF NOT EXISTS cards_market ON cards(listed_at) WHERE list_price IS NOT NULL;
CREATE INDEX IF NOT EXISTS cards_nice   ON cards(nice) WHERE nice = 1;
CREATE INDEX IF NOT EXISTS cards_print  ON cards(h, f, no);
CREATE INDEX IF NOT EXISTS cards_v      ON cards(v) WHERE owner > 0;
CREATE UNIQUE INDEX IF NOT EXISTS users_nick ON users(nick_key);
CREATE INDEX IF NOT EXISTS users_worth  ON users(worth);
CREATE INDEX IF NOT EXISTS users_album  ON users(album);
CREATE INDEX IF NOT EXISTS users_wins   ON users(wins);

-- Счётчики по дням для статистики администратора (новые игроки, активные, действия).
CREATE TABLE IF NOT EXISTS stats (day TEXT NOT NULL, k TEXT NOT NULL, n INTEGER NOT NULL DEFAULT 0, PRIMARY KEY (day, k));
CREATE INDEX IF NOT EXISTS users_created ON users(created);
CREATE INDEX IF NOT EXISTS users_seen    ON users(seen);

-- Бои с настоящими игроками: кто на кого нападал (для уведомлений и реванша).
CREATE TABLE IF NOT EXISTS fights (id INTEGER PRIMARY KEY AUTOINCREMENT, att INTEGER, att_name TEXT, att_card INTEGER, att_h INTEGER, def INTEGER, def_card INTEGER, def_h INTEGER, w INTEGER, l INTEGER, t INTEGER, seen INTEGER NOT NULL DEFAULT 0);
CREATE INDEX IF NOT EXISTS fights_def ON fights(def, t);

-- Общий чат.
CREATE TABLE IF NOT EXISTS chat (id INTEGER PRIMARY KEY AUTOINCREMENT, uid INTEGER, name TEXT, text TEXT, t INTEGER);
CREATE INDEX IF NOT EXISTS chat_uid ON chat(uid, id);

-- История продаж на рынке.
CREATE TABLE IF NOT EXISTS sales (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  card       INTEGER,
  h          INTEGER,
  seller     INTEGER,
  buyer      INTEGER,
  buyer_name TEXT,
  price      REAL,
  got        REAL,
  t          INTEGER,
  seen       INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS sales_seller ON sales(seller, seen);
