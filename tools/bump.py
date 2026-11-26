"""Ставит метку версии на style.css, rules.js и game.js в index.html, чтобы Telegram не показывал старую игру из памяти."""
import hashlib, re, pathlib
root = pathlib.Path(__file__).resolve().parent.parent
idx = root / "index.html"; s = idx.read_text(encoding="utf-8")
for f in ["style.css", "rules.js", "game.js", "event.js", "wow.js", "menu.js", "dragon.js", "teach.js", "turnir.js", "zvezda.js", "enc.js", "ref.js", "tutor.js", "admin.js", "gems.js", "community.js", "tower-rules.js", "tower.js", "knight.js"]:
    # Normalize line endings so cache hashes are identical on Windows and Linux.
    data = (root / f).read_bytes().replace(b"\r\n", b"\n").replace(b"\r", b"\n")
    h = hashlib.md5(data).hexdigest()[:8]
    s = re.sub(re.escape(f) + r'(\?v=[0-9a-f]+)?"', f + "?v=" + h + '"', s)
ver = hashlib.md5("".join(re.findall(r'\?v=[0-9a-f]+', s)).encode()).hexdigest()[:10]
s = re.sub(r'<meta name="app-ver" content="[^"]*">', '', s)
s = s.replace("<head>", '<head><meta name="app-ver" content="' + ver + '">', 1)
idx.write_text(s, encoding="utf-8"); (root / "version.json").write_text('{"v":"' + ver + '"}', encoding="utf-8"); print("версии обновлены", ver)
