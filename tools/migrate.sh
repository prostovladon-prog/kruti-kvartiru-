#!/usr/bin/env bash
# Перенос базы со старого сервера Cloudflare на этот хост. Запускать от root после vps-setup.sh.
set -euo pipefail
OLD="${1:-https://autumn-hat-37ccvoiny-epoh.prostovladon.workers.dev}"
DOMAIN=$(cat /etc/voiny.domain 2>/dev/null || echo "")
echo "Переношу базу с $OLD"
sed -i 's/\r$//; s/^\(BOT_TOKEN=\)[[:space:]]*\(.*[^[:space:]]\)[[:space:]]*$/\1\2/' /etc/voiny.env   # убираем невидимые символы после вставки из Windows
set -a; . /etc/voiny.env; set +a
BOT=$(curl -fsS --max-time 10 "https://api.telegram.org/bot${BOT_TOKEN}/getMe" | grep -o '"username":"[^"]*"' || true)
if [ -z "$BOT" ]; then echo "❌ Telegram не принял токен бота. Запусти: bash /opt/voiny/tools/set-token.sh и вставь токен заново"; exit 1; fi
echo "Токен бота верный: $BOT"
systemctl stop voiny
cd /opt/voiny && sudo -u voiny --preserve-env=BOT_TOKEN,DB_PATH,ADMINS node --no-warnings tools/import-from-cloudflare.mjs "$OLD"
systemctl start voiny; sleep 2
echo
echo "✅ База перенесена, новый сервер запущен."
[ -n "$DOMAIN" ] && echo "Адрес нового сервера: https://$DOMAIN — пришли его Claude, он переключит игру."
