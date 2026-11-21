#!/usr/bin/env bash
# Run on the VPS as root. Never put access keys in command arguments or Git.
set -euo pipefail
[ "$(id -u)" = 0 ] || { echo 'Запусти от root'; exit 1; }
export DEBIAN_FRONTEND=noninteractive
apt-get update
apt-get install -y python3 restic ca-certificates
SCRIPT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
exec python3 "$SCRIPT_DIR/r2_backup.py" setup
