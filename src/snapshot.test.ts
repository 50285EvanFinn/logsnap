import * as fs from 'fs';
import * as path from 'path';
import { generateSnapshotFilename, writeSnapshot } from './snapshot';

const TEST_DIR = path.join(__dirname, '__snapshot_test_tmp__');

function cleanup() {
  if (fs.existsSync(TEST_DIR)) {
    fs.readdirSync(TEST_DIR).forEach((f) =>
      fs.unlinkSync(path.join(TEST_DIR, f))
    );
    fs.rmdirSync(TEST_DIR);
  }
}

beforeEach(() => cleanup());
afterAll(() => cleanup());

describe('generateSnapshotFilename', () => {
  it('uses label when provided', () => {
    const name = generateSnapshotFilename('myapp', 'text');
    expect(name).toMatch(/^myapp-.*\.txt$/);
  });

  it('falls back to snapshot prefix when no label', () => {
    const name = generateSnapshotFilename(undefined, 'json');
    expect(name).toMatch(/^snapshot-.*\.json$/);
  });

  it('uses .txt for raw format', () => {
    const name = generateSnapshotFilename('test', 'raw');
    expect(name).toMatch(/\.txt$/);
  });
});

describe('writeSnapshot', () => {
  const lines = [
    '[2024-01-01T10:00:00Z] INFO  Server started',
    '[2024-01-01T10:00:01Z] ERROR Something failed',
  ];

  it('writes a text snapshot', () => {
    const result = writeSnapshot(lines, { outputDir: TEST_DIR, format: 'text' });
    expect(fs.existsSync(result.filePath)).toBe(true);
    expect(result.lineCount).toBe(2);
    expect(result.format).toBe('text');
    expect(result.filePath).toMatch(/\.txt$/);
  });

  it('writes a json snapshot with parseable content', () => {
    const result = writeSnapshot(lines, { outputDir: TEST_DIR, format: 'json' });
    const raw = fs.readFileSync(result.filePath, 'utf-8');
    const parsed = JSON.parse(raw);
    expect(Array.isArray(parsed)).toBe(true);
    expect(parsed.length).toBe(2);
    expect(parsed[0]).toHaveProperty('raw');
  });

  it('writes a raw snapshot preserving original lines', () => {
    const result = writeSnapshot(lines, { outputDir: TEST_DIR, format: 'raw' });
    const raw = fs.readFileSync(result.filePath, 'utf-8');
    expect(raw).toContain('Server started');
    expect(raw).toContain('Something failed');
  });

  it('creates outputDir if it does not exist', () => {
    const nested = path.join(TEST_DIR, 'deep', 'nested');
    writeSnapshot(lines, { outputDir: nested, format: 'raw' });
    expect(fs.existsSync(nested)).toBe(true);
  });

  it('includes label in filename', () => {
    const result = writeSnapshot(lines, {
      outputDir: TEST_DIR,
      format: 'text',
      label: 'myservice',
    });
    expect(path.basename(result.filePath)).toMatch(/^myservice-/);
  });
});
