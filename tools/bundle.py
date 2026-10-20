"""Собирает index.html + style.css + game.js в один файл dist/single.html
(удобно, чтобы показать игру одним файлом или выложить превью)."""
import pathlib, re
root = pathlib.Path(__file__).resolve().parent.parent
html = (root / "index.html").read_text(encoding="utf-8")
css = (root / "style.css").read_text(encoding="utf-8")
js = (root / "game.js").read_text(encoding="utf-8")
html = html.replace('<link rel="stylesheet" href="style.css">', "<style>\n" + css + "</style>")
html = html.replace('<script src="game.js"></script>', "<script>\n" + js + "</script>")
out = root / "dist"
out.mkdir(exist_ok=True)
(out / "single.html").write_text(html, encoding="utf-8")
print("Готово:", out / "single.html")
