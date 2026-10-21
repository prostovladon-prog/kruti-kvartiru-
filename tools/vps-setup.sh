#!/usr/bin/env bash
# Установка сервера «Воинов Эпох» на чистый VPS (Ubuntu 22.04/24.04 или Debian 12). Запускать от root:
#   curl -fsSL https://raw.githubusercontent.com/prostovladon-prog/kruti-kvartiru-/main/tools/vps-setup.sh -o setup.sh && bash setup.sh
# Ставит Node.js, Caddy (сам получает HTTPS), игру, автозапуск, ежедневные бэкапы базы.
set -euo pipefail
REPO="https://github.com/prostovladon-prog/kruti-kvartiru-.git"
APP=/opt/voiny; DATA=/var/lib/voiny; BACKUP=/var/backups/voiny
[ "$(id -u)" = 0 ] || { echo "Запусти от root (sudo -i)"; exit 1; }

echo "=== Воины Эпох: установка сервера ==="
IP=$(curl -fsS4 --max-time 5 https://api.ipify.org || hostname -I | awk '{print $1}')
echo "IP сервера: $IP"
read -rp "Домен для сервера (например api.voinyepoh.ru). Нет домена — просто нажми Enter: " DOMAIN
if [ -z "${DOMAIN}" ]; then DOMAIN="$(echo "$IP" | tr . -).sslip.io"; echo "Буду использовать бесплатный адрес: $DOMAIN"; fi
if [ -f /etc/voiny.env ] && grep -q '^BOT_TOKEN=.\+' /etc/voiny.env; then echo "Токен бота уже сохранён"; else
  read -rsp "Вставь токен бота из @BotFather (символы не будут видны) и нажми Enter: " TOKEN; echo
  [ -n "$TOKEN" ] || { echo "Токен пустой"; exit 1; }
  umask 077; printf 'BOT_TOKEN=%s\nADMINS=6724818967\nDB_PATH=%s/game.db\nPORT=8787\n' "$TOKEN" "$DATA" > /etc/voiny.env; umask 022
fi

echo "=== Пакеты ==="
export DEBIAN_FRONTEND=noninteractive
apt-get update -y
apt-get install -y curl git sqlite3 ca-certificates gnupg debian-keyring debian-archive-keyring apt-transport-https ufw
if ! node -v 2>/dev/null | grep -qE '^v(2[2-9]|[3-9][0-9])'; then curl -fsSL https://deb.nodesource.com/setup_22.x | bash -; apt-get install -y nodejs; fi
echo "Node: $(node -v)"
if ! command -v caddy >/dev/null; then
  curl -1sLf https://dl.cloudsmith.io/public/caddy/stable/gpg.key | gpg --dearmor --yes -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
  curl -1sLf https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt > /etc/apt/sources.list.d/caddy-stable.list
  apt-get update -y; apt-get install -y caddy
fi

echo "=== Игра ==="
if [ -d "$APP/.git" ]; then git -C "$APP" pull --ff-only; else git clone "$REPO" "$APP"; fi
id voiny >/dev/null 2>&1 || useradd --system --home "$DATA" --shell /usr/sbin/nologin voiny
mkdir -p "$DATA" "$BACKUP"; chown -R voiny:voiny "$DATA"; chown root:voiny /etc/voiny.env; chmod 640 /etc/voiny.env

cat > /etc/systemd/system/voiny.service <<UNIT
[Unit]
Description=Voiny Epoh game server
After=network-online.target
[Service]
User=voiny
EnvironmentFile=/etc/voiny.env
WorkingDirectory=$APP
ExecStart=/usr/bin/node --no-warnings $APP/server/node-server.mjs
Restart=always
RestartSec=2
[Install]
WantedBy=multi-user.target
UNIT

cat > /etc/caddy/Caddyfile <<CADDY
$DOMAIN {
  encode gzip
  reverse_proxy 127.0.0.1:8787
}
CADDY

cat > /etc/cron.daily/voiny-backup <<'BK'
#!/bin/sh
sqlite3 /var/lib/voiny/game.db ".backup /var/backups/voiny/game-$(date +%F).db" && find /var/backups/voiny -name 'game-*.db' -mtime +14 -delete
BK
chmod +x /etc/cron.daily/voiny-backup

# обновление игры одной командой: voiny-update
cat > /usr/local/bin/voiny-update <<'UP'
#!/bin/sh
set -e; git -C /opt/voiny pull --ff-only && systemctl restart voiny && echo "Сервер обновлён"
UP
chmod +x /usr/local/bin/voiny-update

ufw allow OpenSSH >/dev/null; ufw allow 80/tcp >/dev/null; ufw allow 443/tcp >/dev/null; ufw --force enable >/dev/null
systemctl daemon-reload; systemctl enable --now voiny; systemctl restart voiny; systemctl reload caddy || systemctl restart caddy
sleep 4
echo
if curl -fsS --max-time 20 "https://$DOMAIN/" | grep -q работает; then echo "✅ Сервер работает: https://$DOMAIN"; else
  echo "⚠️  Сервер запущен, но HTTPS ещё не готов. Подожди минуту и открой https://$DOMAIN в браузере."; echo "   Если используешь свой домен — проверь, что A-запись указывает на $IP."; fi
echo "$DOMAIN" > /etc/voiny.domain
echo
echo "Дальше перенеси базу командой:  bash $APP/tools/migrate.sh"
