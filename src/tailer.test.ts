import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { Tailer, createTailer } from './tailer';

const tmpFile = path.join(os.tmpdir(), `logsnap-tailer-test-${process.pid}.log`);

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

beforeEach(() => {
  fs.writeFileSync(tmpFile, '');
});

afterEach(() => {
  if (fs.existsSync(tmpFile)) fs.unlinkSync(tmpFile);
});

describe('Tailer', () => {
  test('emits lines appended after start', async () => {
    const lines: string[] = [];
    const tailer = createTailer({ filePath: tmpFile, pollIntervalMs: 50 });
    tailer.on('line', (line: string) => lines.push(line));
    tailer.start();

    await sleep(60);
    fs.appendFileSync(tmpFile, 'hello world\n');
    fs.appendFileSync(tmpFile, 'second line\n');
    await sleep(150);

    tailer.stop();
    expect(lines).toContain('hello world');
    expect(lines).toContain('second line');
  });

  test('reads from beginning when fromBeginning is true', async () => {
    fs.writeFileSync(tmpFile, 'pre-existing line\n');
    const lines: string[] = [];
    const tailer = new Tailer({ filePath: tmpFile, pollIntervalMs: 50, fromBeginning: true });
    tailer.on('line', (line: string) => lines.push(line));
    tailer.start();

    await sleep(150);
    tailer.stop();
    expect(lines).toContain('pre-existing line');
  });

  test('does not emit duplicate lines on repeated polls', async () => {
    const lines: string[] = [];
    const tailer = createTailer({ filePath: tmpFile, pollIntervalMs: 50 });
    tailer.on('line', (line: string) => lines.push(line));
    tailer.start();

    fs.appendFileSync(tmpFile, 'unique\n');
    await sleep(200);
    tailer.stop();

    const count = lines.filter((l) => l === 'unique').length;
    expect(count).toBe(1);
  });

  test('stop() prevents further polling', async () => {
    const lines: string[] = [];
    const tailer = createTailer({ filePath: tmpFile, pollIntervalMs: 50 });
    tailer.on('line', (line: string) => lines.push(line));
    tailer.start();
    tailer.stop();

    fs.appendFileSync(tmpFile, 'after stop\n');
    await sleep(200);
    expect(lines).not.toContain('after stop');
  });
});
