#!/usr/bin/env python3
"""Encrypted, verified SQLite snapshots for Cloudflare R2. No game downtime."""
import argparse
import contextlib
import datetime as dt
import getpass
import json
import os
from pathlib import Path
import re
import shutil
import sqlite3
import subprocess
import sys
import tempfile
import time
from urllib.parse import urlsplit

CONFIG = Path('/etc/voiny-backup/config.json')
ROOT = Path('/var/backups/voiny-r2')
TAG = 'voiny-r2-v1'
HOST = 'voiny-epoh'


def atomic_json(path, data):
    path = Path(path)
    path.parent.mkdir(parents=True, exist_ok=True, mode=0o700)
    fd, name = tempfile.mkstemp(prefix='.write-', dir=path.parent)
    try:
        with os.fdopen(fd, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
            f.flush()
            os.fsync(f.fileno())
        os.chmod(name, 0o600)
        os.replace(name, path)
    finally:
        if os.path.exists(name):
            os.unlink(name)


def validate_endpoint(value):
    u = urlsplit(value.rstrip('/'))
    if (u.scheme != 'https' or u.username or u.password or u.port or
            u.path not in ('', '/') or u.query or u.fragment or
            not re.fullmatch(r'[a-f0-9]{32}(?:\.(?:eu|us|fedramp))?\.r2\.cloudflarestorage\.com', u.hostname or '')):
        raise ValueError('Нужен HTTPS S3 endpoint R2 без имени бакета и пути.')
    return 'https://' + u.hostname


def validate_config(c):
    validate_endpoint(c['endpoint'])
    if not re.fullmatch(r'[a-z0-9][a-z0-9.-]{1,61}[a-z0-9]', c['bucket']):
        raise ValueError('Некорректное имя бакета.')
    if not c['access_key'] or not c['secret_key'] or len(c['password']) < 16:
        raise ValueError('Проверь ключи; пароль шифрования должен содержать минимум 16 символов.')
    if not Path(c['db']).is_absolute():
        raise ValueError('Путь к базе должен быть абсолютным.')


def read_config(path):
    path = Path(path)
    if os.name == 'posix':
        st = path.stat()
        if st.st_uid != 0 or st.st_mode & 0o077:
            raise ValueError('Конфиг должен принадлежать root и иметь права 600.')
    c = json.loads(path.read_text(encoding='utf-8'))
    validate_config(c)
    return c


def repository(c):
    return 's3:' + validate_endpoint(c['endpoint']) + '/' + c['bucket'] + '/voiny-epoh'


def restic(c, *args):
    env = {k: v for k, v in os.environ.items() if not k.startswith(('AWS_', 'RESTIC_'))}
    env.update(AWS_ACCESS_KEY_ID=c['access_key'], AWS_SECRET_ACCESS_KEY=c['secret_key'],
               AWS_DEFAULT_REGION='auto', RESTIC_PASSWORD=c['password'])
    cache = Path(c.get('cache', '/var/cache/voiny-r2'))
    cache.mkdir(parents=True, exist_ok=True, mode=0o700)
    r = subprocess.run(['restic', '--repo', repository(c), '--cache-dir', str(cache),
                        *args], env=env, text=True,
                       encoding='utf-8', errors='replace', capture_output=True, timeout=1800)
    if r.returncode:
        # Never echo command environments, signed URLs or raw provider diagnostics.
        raise RuntimeError('restic ' + args[0] + ' завершился с кодом ' + str(r.returncode) +
                           '. Проверь доступ к R2, пароль, место и соединение.')
    return r.stdout


def check_database(path, full=False):
    with contextlib.closing(sqlite3.connect(Path(path).resolve().as_uri() + '?mode=ro', uri=True)) as db:
        rows = db.execute('PRAGMA integrity_check' if full else 'PRAGMA quick_check').fetchall()
        if rows != [('ok',)]:
            raise RuntimeError('Проверка целостности копии SQLite не пройдена.')


def snapshot(source, destination):
    source, destination = Path(source), Path(destination)
    if not source.is_file():
        raise FileNotFoundError('Рабочая база не найдена; пустую базу создавать не будем.')
    destination.parent.mkdir(parents=True, exist_ok=True, mode=0o700)
    fd, name = tempfile.mkstemp(prefix='.snapshot-', suffix='.db', dir=destination.parent)
    os.close(fd)
    started = time.monotonic()
    def progress(*_):
        if time.monotonic() - started > 300:
            raise TimeoutError('Создание снимка SQLite заняло больше пяти минут.')
    try:
        with contextlib.closing(sqlite3.connect(source.resolve().as_uri() + '?mode=ro', uri=True)) as src:
            with contextlib.closing(sqlite3.connect(name)) as dst:
                src.backup(dst, pages=256, progress=progress, sleep=0.1)
        check_database(name)
        os.chmod(name, 0o600)
        os.replace(name, destination)
    finally:
        if os.path.exists(name):
            os.unlink(name)


def utc_now():
    return dt.datetime.now(dt.timezone.utc).isoformat()


def update_status(root, **fields):
    path = root / 'status.json'
    try:
        state = json.loads(path.read_text(encoding='utf-8'))
    except (FileNotFoundError, ValueError):
        state = {}
    state.update(fields)
    atomic_json(path, state)


def backup(c, root):
    stage = root / 'staging'
    snapshot(c['db'], stage / 'game.db')
    try:
        commit = subprocess.check_output(['git', '-C', '/opt/voiny', 'rev-parse', 'HEAD'],
                                         text=True, stderr=subprocess.DEVNULL).strip()
    except (OSError, subprocess.CalledProcessError):
        commit = 'unknown'
    atomic_json(stage / 'manifest.json', {'created_utc': utc_now(), 'git_commit': commit,
                'database': 'game.db', 'bytes': (stage / 'game.db').stat().st_size,
                'format': 'sqlite-online-backup-v1'})
    output = restic(c, 'backup', '--json', '--host', HOST, '--tag', TAG,
                    str(stage / 'game.db'), str(stage / 'manifest.json'))
    summaries = [json.loads(line) for line in output.splitlines() if line.strip()]
    summary = next((s for s in reversed(summaries) if s.get('message_type') == 'summary'), {})
    sid = summary.get('snapshot_id')
    if not sid or not re.fullmatch(r'[a-f0-9]{8,64}', sid):
        raise RuntimeError('Хранилище не подтвердило ID новой копии.')
    update_status(root, last_backup_utc=utc_now(), snapshot=sid, last_result='ok')
    return sid


def restore_copy(c, root, target, sid='latest'):
    target = Path(target)
    if target.exists():
        raise ValueError('Папка восстановления уже существует. Укажи новую пустую папку.')
    if sid != 'latest' and not re.fullmatch(r'[a-f0-9]{8,64}', sid):
        raise ValueError('Некорректный ID снимка.')
    target.mkdir(parents=True, mode=0o700)
    restic(c, 'restore', sid, '--tag', TAG, '--host', HOST, '--target', str(target))
    # Restore paths can include a drive prefix or differ on a replacement server.
    copies = [p for p in target.rglob('game.db') if p.is_file()]
    if len(copies) != 1 or not copies[0].resolve().is_relative_to(target.resolve()):
        raise RuntimeError('В восстановленном снимке не найдена единственная безопасная копия game.db.')
    restored = copies[0]
    check_database(restored, full=True)
    return restored


def verify(c, root, sid='latest'):
    with tempfile.TemporaryDirectory(prefix='verify-', dir=root) as tmp:
        restored = restore_copy(c, root, Path(tmp) / 'restored', sid)
        size = restored.stat().st_size
    update_status(root, last_restore_test_utc=utc_now(), restored_bytes=size)
    return size


@contextlib.contextmanager
def locked(root):
    root.mkdir(parents=True, exist_ok=True, mode=0o700)
    with (root / 'job.lock').open('a+b') as f:
        if os.name == 'posix':
            import fcntl
            fcntl.flock(f, fcntl.LOCK_EX | fcntl.LOCK_NB)
        try:
            yield
        finally:
            if os.name == 'posix':
                fcntl.flock(f, fcntl.LOCK_UN)


def maintain(c, root):
    # Run only after a fresh successful backup and an actual remote restore.
    sid = backup(c, root)
    verify(c, root, sid)
    restic(c, 'forget', '--tag', TAG, '--host', HOST, '--group-by', 'host,paths',
           '--keep-last', '3', '--keep-hourly', '48', '--keep-daily', '30', '--prune')
    restic(c, 'check')
    update_status(root, last_maintenance_utc=utc_now(), last_result='ok')


def configure(path):
    if path.exists():
        return read_config(path)
    print('Ключи вводятся здесь, не в чат. Пароль шифрования сохрани отдельно от VPS.')
    c = {'endpoint': validate_endpoint(input('S3 API endpoint (https://...): ').strip()),
         'bucket': input('Бакет [voiny-epoh-backups]: ').strip() or 'voiny-epoh-backups',
         'access_key': getpass.getpass('Access Key ID (ввод скрыт): ').strip(),
         'secret_key': getpass.getpass('Secret Access Key (ввод скрыт): ').strip(),
         'password': getpass.getpass('Придумай пароль шифрования, минимум 16 символов: '),
         'db': '/var/lib/voiny/game.db'}
    if c['password'] != getpass.getpass('Повтори пароль шифрования: '):
        raise ValueError('Пароли не совпадают.')
    validate_config(c)
    if input('Пароль сохранён у тебя вне VPS? Введи ДА: ').strip().upper() != 'ДА':
        raise ValueError('Сначала сохрани пароль отдельно, затем повтори настройку.')
    atomic_json(path, c)
    return c


def install_timers():
    destination = Path('/usr/local/lib/voiny-backup/r2_backup.py')
    destination.parent.mkdir(parents=True, exist_ok=True, mode=0o700)
    if Path(__file__).resolve() != destination:
        shutil.copyfile(__file__, destination)
    destination.chmod(0o700)
    command = Path('/usr/local/bin/voiny-r2-backup')
    command.write_text('#!/bin/sh\nexec /usr/bin/python3 /usr/local/lib/voiny-backup/r2_backup.py "$@"\n')
    command.chmod(0o700)
    units = Path('/etc/systemd/system')
    for name, action in [('voiny-r2-backup', 'run'), ('voiny-r2-maintain', 'maintain')]:
        (units / (name + '.service')).write_text('[Unit]\nDescription=Voiny encrypted R2 ' + action +
            '\nWants=network-online.target\nAfter=network-online.target\n[Service]\nType=oneshot\nUser=root\nUMask=0077\n'
            'ExecStart=/usr/local/bin/voiny-r2-backup ' + action + '\nTimeoutStartSec=2h\nNice=10\n'
            'NoNewPrivileges=true\nPrivateTmp=true\nProtectHome=true\nProtectSystem=strict\n'
            'ReadWritePaths=/var/backups/voiny-r2 /var/cache/voiny-r2\n')
        schedule = 'hourly' if action == 'run' else 'Sun *-*-* 05:20:00'
        (units / (name + '.timer')).write_text('[Unit]\nDescription=Schedule ' + name +
            '\n[Timer]\nOnCalendar=' + schedule + '\nPersistent=true\nRandomizedDelaySec=180\n'
            '[Install]\nWantedBy=timers.target\n')
    subprocess.run(['systemctl', 'daemon-reload'], check=True)
    subprocess.run(['systemctl', 'enable', '--now', 'voiny-r2-backup.timer', 'voiny-r2-maintain.timer'], check=True)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('action', choices=['configure', 'setup', 'run', 'verify', 'maintain', 'status', 'restore'])
    parser.add_argument('--config', type=Path, default=CONFIG)
    parser.add_argument('--target', type=Path)
    parser.add_argument('--snapshot', default='latest')
    args = parser.parse_args()
    if os.name != 'posix' or os.geteuid() != 0:
        raise ValueError('Запусти на Linux VPS от root. Рабочая база не изменяется.')
    if not shutil.which('restic'):
        raise ValueError('Установи restic: apt-get update && apt-get install -y restic python3')
    os.umask(0o077)
    root = ROOT
    with locked(root):
        c = configure(args.config) if args.action in ('setup', 'configure') else read_config(args.config)
        if args.action == 'configure':
            print('Конфиг сохранён. Для получения существующей копии выполни restore; база не загружалась.')
        elif args.action == 'setup':
            if args.config != CONFIG:
                raise ValueError('Для установки таймеров используй стандартный путь конфига.')
            # An existing repository must open with the supplied password; init never replaces one.
            try:
                restic(c, 'snapshots', '--json')
            except RuntimeError:
                restic(c, 'init')
            sid = backup(c, root)
            verify(c, root, sid)
            install_timers()
            print('ГОТОВО: копия загружена, восстановление проверено, почасовой таймер включён.')
        elif args.action == 'run':
            print('R2: сохранена копия ' + backup(c, root))
        elif args.action == 'verify':
            print('R2: восстановление проверено, байт: ' + str(verify(c, root, args.snapshot)))
        elif args.action == 'maintain':
            maintain(c, root)
            print('R2: свежая копия, восстановление, хранение 48 часовых/30 дневных и проверка выполнены.')
        elif args.action == 'restore':
            if args.target is None:
                raise ValueError('Укажи новую папку: --target /root/voiny-restore-DATE')
            print('Копия восстановлена и проверена: ' + str(restore_copy(c, root, args.target, args.snapshot)))
            print('Рабочая база не заменялась. Не меняй её без остановки игры и отдельного плана.')
        else:
            path = root / 'status.json'
            print(path.read_text(encoding='utf-8') if path.exists() else 'Успешных копий пока нет.')
            print(restic(c, 'snapshots', '--tag', TAG, '--host', HOST))


if __name__ == '__main__':
    try:
        main()
    except Exception as e:
        # Keep the failure visible in systemd while preserving the last successful timestamp.
        try:
            update_status(ROOT, last_result='failed', last_failure_utc=utc_now(), error_type=type(e).__name__)
        except Exception:
            pass
        print('Бэкап не завершён: ' + (str(e) if isinstance(e, (ValueError, RuntimeError, FileNotFoundError))
                                     else type(e).__name__), file=sys.stderr)
        sys.exit(1)
