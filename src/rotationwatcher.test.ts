import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import {
  createRotationState,
  detectRotation,
  resolveRotatedPath,
  statFile,
} from './rotationwatcher';

const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'logsnap-rot-'));

function cleanup() {
  fs.rmSync(tmpDir, { recursive: true, force: true });
}

afterAll(cleanup);

describe('statFile', () => {
  it('returns null for missing file', () => {
    expect(statFile(path.join(tmpDir, 'no-such-file.log'))).toBeNull();
  });

  it('returns inode and size for existing file', () => {
    const f = path.join(tmpDir, 'stat.log');
    fs.writeFileSync(f, 'hello\n');
    const info = statFile(f);
    expect(info).not.toBeNull();
    expect(typeof info!.inode).toBe('number');
    expect(info!.size).toBe(6);
  });
});

describe('detectRotation', () => {
  it('returns none on first call and initialises state', () => {
    const f = path.join(tmpDir, 'first.log');
    fs.writeFileSync(f, 'line\n');
    const state = createRotationState(f);
    expect(detectRotation(state)).toBe('none');
    expect(state.inode).not.toBeNull();
  });

  it('returns missing when file is absent', () => {
    const state = createRotationState(path.join(tmpDir, 'ghost.log'));
    expect(detectRotation(state)).toBe('missing');
  });

  it('detects truncation when size shrinks', () => {
    const f = path.join(tmpDir, 'trunc.log');
    fs.writeFileSync(f, 'abcdefgh\n');
    const state = createRotationState(f);
    detectRotation(state); // init
    fs.writeFileSync(f, 'ab\n');
    expect(detectRotation(state)).toBe('truncated');
  });

  it('returns none when size grows', () => {
    const f = path.join(tmpDir, 'grow.log');
    fs.writeFileSync(f, 'line\n');
    const state = createRotationState(f);
    detectRotation(state);
    fs.appendFileSync(f, 'more\n');
    expect(detectRotation(state)).toBe('none');
  });
});

describe('resolveRotatedPath', () => {
  it('returns .1 path when it exists', () => {
    const f = path.join(tmpDir, 'app.log');
    const rotated = f + '.1';
    fs.writeFileSync(rotated, '');
    expect(resolveRotatedPath(f)).toBe(rotated);
  });

  it('falls back to original path when .1 missing', () => {
    const f = path.join(tmpDir, 'norotated.log');
    expect(resolveRotatedPath(f)).toBe(f);
  });
});
