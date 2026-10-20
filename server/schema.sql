-- База данных «Воинов Эпох» (Cloudflare D1).
-- Вставь этот текст целиком в консоль D1 и нажми Execute.

CREATE TABLE IF NOT EXISTS users (
  id       INTEGER PRIMARY KEY,          -- id игрока в Telegram
  name     TEXT,
  cash     REAL    NOT NULL DEFAULT 100, -- деньги меняются только прибавлением, поэтому продажи не теряются
  state    TEXT    NOT NULL DEFAULT '{}',-- прокрутки, задания, босс и прочее
  ver      INTEGER NOT NULL DEFAULT 0,   -- защита от двойного нажатия
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
