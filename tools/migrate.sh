#!/usr/bin/env bash
# Перенос базы со старого сервера Cloudflare на этот хост. Запускать от root после vps-setup.sh.
set -euo pipefail
OLD="${1:-https://autumn-hat-37ccvoiny-epoh.prostovladon.workers.dev}"
DOMAIN=$(cat /etc/voiny.domain 2>/dev/null || echo "")
echo "Переношу базу с $OLD"
systemctl stop voiny
set -a; . /etc/voiny.env; set +a
cd /opt/voiny && sudo -u voiny --preserve-env=BOT_TOKEN,DB_PATH,ADMINS node --no-warnings tools/import-from-cloudflare.mjs "$OLD"
systemctl start voiny; sleep 2
echo
echo "✅ База перенесена, новый сервер запущен."
[ -n "$DOMAIN" ] && echo "Адрес нового сервера: https://$DOMAIN — пришли его Claude, он переключит игру."
