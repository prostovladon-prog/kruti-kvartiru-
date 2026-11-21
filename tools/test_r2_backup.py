"""Run with python -m unittest discover -s tools -p test_r2_backup.py.

For the real restic integration set VOINY_TEST_RESTIC to its executable path.
No production DB, Cloudflare credentials or network are used by these tests.
"""
import contextlib
import importlib.util
import json
import os
from pathlib import Path
import sqlite3
import tempfile
import unittest
from unittest.mock import patch

spec = importlib.util.spec_from_file_location('r2_backup', Path(__file__).with_name('r2_backup.py'))
m = importlib.util.module_from_spec(spec)
spec.loader.exec_module(m)


class BackupTests(unittest.TestCase):
    def test_endpoint_rejects_other_hosts_paths_and_credentials(self):
        valid = 'https://' + 'a' * 32 + '.r2.cloudflarestorage.com'
        self.assertEqual(m.validate_endpoint(valid + '/'), valid)
        for suffix in ['eu', 'us', 'fedramp']:
            m.validate_endpoint('https://' + 'b' * 32 + '.' + suffix + '.r2.cloudflarestorage.com')
        for value in ['http://' + valid[8:], valid + '/bucket', valid + '?token=secret',
                      'https://evil.example', valid.replace('https://', 'https://user:pass@')]:
            with self.assertRaises(ValueError):
                m.validate_endpoint(value)

    def test_snapshot_includes_wal_and_preserves_source_and_previous_good_copy(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            src, dest = root / 'live.db', root / 'snap' / 'game.db'
            with contextlib.closing(sqlite3.connect(src)) as db:
                db.execute('PRAGMA journal_mode=WAL')
                db.execute('CREATE TABLE players(id INTEGER PRIMARY KEY,nick TEXT)')
                db.commit()
                db.execute('INSERT INTO players VALUES(1,?)', ('private-player-test',))
                db.commit()
                self.assertTrue(Path(str(src) + '-wal').exists())
                m.snapshot(src, dest)
                with contextlib.closing(sqlite3.connect(dest)) as copy:
                    self.assertEqual(copy.execute('SELECT * FROM players').fetchall(), [(1, 'private-player-test')])
                self.assertEqual(db.execute('SELECT COUNT(*) FROM players').fetchone()[0], 1)
                good = dest.read_bytes()
                corrupt = root / 'corrupt.db'
                corrupt.write_bytes(b'not sqlite')
                with self.assertRaises(sqlite3.DatabaseError):
                    m.snapshot(corrupt, dest)
                self.assertEqual(dest.read_bytes(), good)
                with self.assertRaises(FileNotFoundError):
                    m.snapshot(root / 'absent.db', dest)
                self.assertFalse((root / 'absent.db').exists())
                self.assertEqual(dest.read_bytes(), good)

    def test_failed_upload_does_not_record_success(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            src = root / 'source.db'
            with contextlib.closing(sqlite3.connect(src)) as db:
                db.execute('CREATE TABLE test(id)')
                db.commit()
            work = root / 'work'
            work.mkdir()
            m.update_status(work, last_backup_utc='previous-success', snapshot='deadbeef')
            with patch.object(m, 'restic', side_effect=RuntimeError('offline')):
                with self.assertRaises(RuntimeError):
                    m.backup({'db': str(src)}, work)
            state = json.loads((work / 'status.json').read_text())
            self.assertEqual(state['last_backup_utc'], 'previous-success')
            self.assertEqual(state['snapshot'], 'deadbeef')

    @unittest.skipUnless(os.environ.get('VOINY_TEST_RESTIC'), 'Set VOINY_TEST_RESTIC for real encrypted restore test')
    def test_real_restic_encryption_remote_style_restore_and_retention(self):
        exe = Path(os.environ['VOINY_TEST_RESTIC']).resolve()
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp).resolve()
            src = root / 'live.db'
            marker = 'private-player-backup-integration-982345'
            with contextlib.closing(sqlite3.connect(src)) as db:
                db.execute('CREATE TABLE players(nick)')
                db.execute('INSERT INTO players VALUES(?)', (marker,))
                db.commit()
            work = root / 'backup'
            work.mkdir()
            c = {'db': str(src), 'access_key': 'test-only', 'secret_key': 'test-only',
                 'password': 'integration-test-password-long', 'cache': str(root / 'cache')}
            env = {'PATH': str(exe.parent) + os.pathsep + os.environ.get('PATH', '')}
            with patch.dict(os.environ, env), patch.object(m, 'repository', return_value=str(root / 'repository')):
                m.restic(c, 'init')
                sid = m.backup(c, work)
                m.verify(c, work, sid)
                recovered = m.restore_copy(c, work, root / 'download', sid)
                with contextlib.closing(sqlite3.connect(recovered)) as db:
                    self.assertEqual(db.execute('SELECT nick FROM players').fetchone()[0], marker)
                with self.assertRaises(ValueError):
                    m.restore_copy(c, work, root / 'download', sid)
                m.maintain(c, work)
                state = json.loads((work / 'status.json').read_text())
                self.assertIn('last_maintenance_utc', state)
                self.assertIn('last_restore_test_utc', state)
                for path in (root / 'repository').rglob('*'):
                    if path.is_file():
                        self.assertNotIn(marker.encode(), path.read_bytes())
                wrong = dict(c, password='wrong-password-not-shared')
                with self.assertRaises(RuntimeError) as error:
                    m.restic(wrong, 'snapshots')
                self.assertNotIn(wrong['password'], str(error.exception))


if __name__ == '__main__':
    unittest.main()
