"""Ставит метку версии на style.css, rules.js и game.js в index.html, чтобы Telegram не показывал старую игру из памяти."""
import hashlib, re, pathlib
root = pathlib.Path(__file__).resolve().parent.parent
idx = root / "index.html"; s = idx.read_text(encoding="utf-8")
for f in ["style.css", "rules.js", "game.js"]:
    h = hashlib.md5((root / f).read_bytes()).hexdigest()[:8]
    s = re.sub(re.escape(f) + r'(\?v=[0-9a-f]+)?"', f + "?v=" + h + '"', s)
idx.write_text(s, encoding="utf-8"); print("версии обновлены")
