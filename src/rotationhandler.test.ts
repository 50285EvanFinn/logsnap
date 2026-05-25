import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { createRotationState, detectRotation } from './rotationwatcher';
import {
  createRotationHandler,
  checkRotation,
  formatRotationEvent,
} from './rotationhandler';

const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'logsnap-rh-'));

afterAll(() => fs.rmSync(tmpDir, { recursive: true, force: true }));

describe('createRotationHandler', () => {
  it('initialises with lastEvent none', () => {
    const f = path.join(tmpDir, 'init.log');
    fs.writeFileSync(f, '');
    const state = createRotationState(f);
    const handler = createRotationHandler(state);
    expect(handler.lastEvent).toBe('none');
  });
});

describe('checkRotation', () => {
  it('calls onTruncated callback when file is truncated', () => {
    const f = path.join(tmpDir, 'cb-trunc.log');
    fs.writeFileSync(f, 'some long content here\n');
    const state = createRotationState(f);
    detectRotation(state); // seed inode + size

    const truncated: string[] = [];
    const handler = createRotationHandler(state, {
      onTruncated: (p) => truncated.push(p),
    });

    fs.writeFileSync(f, 'x\n');
    const event = checkRotation(handler);
    expect(event).toBe('truncated');
    expect(truncated).toContain(f);
  });

  it('calls onMissing callback when file disappears', () => {
    const f = path.join(tmpDir, 'cb-missing.log');
    fs.writeFileSync(f, 'data\n');
    const state = createRotationState(f);
    detectRotation(state);

    const missing: string[] = [];
    const handler = createRotationHandler(state, {
      onMissing: (p) => missing.push(p),
    });

    fs.unlinkSync(f);
    const event = checkRotation(handler);
    expect(event).toBe('missing');
    expect(missing).toContain(f);
  });

  it('returns none and fires no callbacks on stable file', () => {
    const f = path.join(tmpDir, 'stable.log');
    fs.writeFileSync(f, 'line\n');
    const state = createRotationState(f);
    detectRotation(state);

    const calls: string[] = [];
    const handler = createRotationHandler(state, {
      onRotated: () => calls.push('rotated'),
      onTruncated: () => calls.push('truncated'),
      onMissing: () => calls.push('missing'),
    });

    expect(checkRotation(handler)).toBe('none');
    expect(calls).toHaveLength(0);
  });
});

describe('formatRotationEvent', () => {
  it.each([
    ['rotated',   '[rotation] File rotated: app.log'],
    ['truncated', '[rotation] File truncated: app.log'],
    ['missing',   '[rotation] File missing: app.log'],
    ['none',      '[rotation] No change: app.log'],
  ] as const)('formats %s correctly', (event, expected) => {
    expect(formatRotationEvent(event, 'app.log')).toBe(expected);
  });
});
