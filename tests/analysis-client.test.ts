import test from 'node:test';
import { execFileSync } from 'node:child_process';

test('Python analysis downloader preserves complete stable captures and rejects partial ones', () => {
  execFileSync('python3', ['-B', 'tests/analysis_client_test.py'], { encoding: 'utf8' });
});
