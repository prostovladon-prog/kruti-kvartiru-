"""Склеивает rules.js и server/server.js в один файл server/worker.js.
Этот файл целиком вставляется в редактор воркера на Cloudflare (Edit code → выделить всё → вставить → Deploy)."""
import pathlib
root = pathlib.Path(__file__).resolve().parent.parent
rules = (root / "rules.js").read_text(encoding="utf-8")
server = (root / "server" / "server.js").read_text(encoding="utf-8")
head = "// ⚠️ Файл собран автоматически из rules.js и server/server.js (tools/build_worker.py). Правь исходники, а не его.\n"
(root / "server" / "worker.js").write_text(head + rules + "\n\n" + server, encoding="utf-8")
print("Готово: server/worker.js")
