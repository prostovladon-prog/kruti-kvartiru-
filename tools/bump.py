"""Ставит метку версии на style.css, rules.js и game.js в index.html, чтобы Telegram не показывал старую игру из памяти."""
import hashlib, re, pathlib
root = pathlib.Path(__file__).resolve().parent.parent
idx = root / "index.html"; s = idx.read_text(encoding="utf-8")
for f in ["style.css", "rules.js", "game.js", "wow.js", "menu.js", "dragon.js"]:
    h = hashlib.md5((root / f).read_bytes()).hexdigest()[:8]
    s = re.sub(re.escape(f) + r'(\?v=[0-9a-f]+)?"', f + "?v=" + h + '"', s)
ver = hashlib.md5("".join(re.findall(r'\?v=[0-9a-f]+', s)).encode()).hexdigest()[:10]
s = re.sub(r'<meta name="app-ver" content="[^"]*">', '', s)
s = s.replace("<head>", '<head><meta name="app-ver" content="' + ver + '">', 1)
idx.write_text(s, encoding="utf-8"); (root / "version.json").write_text('{"v":"' + ver + '"}', encoding="utf-8"); print("версии обновлены", ver)
