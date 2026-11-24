# Ставит git-хук pre-push, чтобы проверка запускалась перед каждым пушем.
# Запуск: powershell -ExecutionPolicy Bypass -File tools/install-hooks.ps1
$root = Split-Path -Parent $PSScriptRoot
$hooks = Join-Path $root '.git\hooks'
if (!(Test-Path $hooks)) { Write-Host 'Это не git-репозиторий'; exit 1 }
$hook = Join-Path $hooks 'pre-push'
$sh = @'
#!/bin/sh
cd "$(git rev-parse --show-toplevel)" || exit 1
node tools/check.mjs || {
  echo ""
  echo "Пуш отменён: проверка не пройдена. Исправь и повтори."
  exit 1
}
'@
[IO.File]::WriteAllText($hook, ($sh -replace "`r`n", "`n"), (New-Object System.Text.UTF8Encoding($false)))
Write-Host "Хук установлен: $hook"
Write-Host "Проверка запускается командой: node tools/check.mjs"
