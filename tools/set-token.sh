#!/usr/bin/env bash
# Заменить токен бота на сервере
set -euo pipefail
read -rsp "Вставь токен бота из @BotFather и нажми Enter: " TOKEN; echo
TOKEN=$(printf '%s' "$TOKEN" | tr -d '\r\n\t "'"'"'')
BOT=$(curl -fsS --max-time 10 "https://api.telegram.org/bot${TOKEN}/getMe" | grep -o '"username":"[^"]*"' || true)
[ -n "$BOT" ] || { echo "❌ Telegram не принял этот токен. Проверь, что скопировал его целиком"; exit 1; }
sed -i "s|^BOT_TOKEN=.*|BOT_TOKEN=${TOKEN}|" /etc/voiny.env
systemctl restart voiny
echo "✅ Токен сохранён, бот: $BOT"
