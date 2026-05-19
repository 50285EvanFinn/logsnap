import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { createWatcher } from './watcher';

const tmpFile = path.join(os.tmpdir(), `logsnap-watcher-test-${process.pid}.log`);

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

beforeEach(() => {
  fs.writeFileSync(tmpFile, '');
});

afterEach(() => {
  if (fs.existsSync(tmpFile)) fs.unlinkSync(tmpFile);
});

describe('Watcher', () => {
  test('passes through unfiltered lines to onLine', async () => {
    const received: string[] = [];
    const watcher = createWatcher({
      tailerOptions: { filePath: tmpFile, pollIntervalMs: 50 },
      onLine: (line) => received.push(line),
    });
    watcher.start();

    await sleep(60);
    fs.appendFileSync(tmpFile, 'plain log line\n');
    await sleep(150);
    watcher.stop();

    expect(received).toContain('plain log line');
  });

  test('filters out non-matching lines', async () => {
    const received: string[] = [];
    const watcher = createWatcher({
      tailerOptions: { filePath: tmpFile, pollIntervalMs: 50 },
      filter: { pattern: 'ERROR' },
      onLine: (line) => received.push(line),
    });
    watcher.start();

    await sleep(60);
    fs.appendFileSync(tmpFile, 'INFO: all good\n');
    fs.appendFileSync(tmpFile, 'ERROR: something failed\n');
    await sleep(150);
    watcher.stop();

    expect(received).not.toContain('INFO: all good');
    expect(received.some((l) => l.includes('ERROR: something failed'))).toBe(true);
  });

  test('outputs JSON when exportJson is true', async () => {
    const received: string[] = [];
    const watcher = createWatcher({
      tailerOptions: { filePath: tmpFile, pollIntervalMs: 50 },
      exportJson: true,
      onLine: (line) => received.push(line),
    });
    watcher.start();

    await sleep(60);
    fs.appendFileSync(tmpFile, 'json test line\n');
    await sleep(150);
    watcher.stop();

    expect(received.length).toBeGreaterThan(0);
    const parsed = JSON.parse(received[0]);
    expect(parsed).toHaveProperty('line');
    expect(parsed).toHaveProperty('timestamp');
  });
});
