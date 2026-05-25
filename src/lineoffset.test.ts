import {
  createLineOffsetState,
  advanceOffset,
  advanceOffsetMany,
  resetOffset,
  offsetFromLineNumber,
  formatOffset,
  serializeOffset,
  deserializeOffset,
} from './lineoffset';

describe('createLineOffsetState', () => {
  it('starts at zero', () => {
    const s = createLineOffsetState();
    expect(s.byteOffset).toBe(0);
    expect(s.lineNumber).toBe(0);
  });
});

describe('advanceOffset', () => {
  it('increments line number by 1', () => {
    const s = advanceOffset(createLineOffsetState(), 'hello');
    expect(s.lineNumber).toBe(1);
  });

  it('increments byteOffset by byte length + 1 for newline', () => {
    const line = 'hello';
    const s = advanceOffset(createLineOffsetState(), line);
    expect(s.byteOffset).toBe(Buffer.byteLength(line, 'utf8') + 1);
  });

  it('handles multi-byte characters', () => {
    const line = '日本語';
    const s = advanceOffset(createLineOffsetState(), line);
    expect(s.byteOffset).toBe(Buffer.byteLength(line, 'utf8') + 1);
  });
});

describe('advanceOffsetMany', () => {
  it('advances through multiple lines', () => {
    const lines = ['foo', 'bar', 'baz'];
    const s = advanceOffsetMany(createLineOffsetState(), lines);
    expect(s.lineNumber).toBe(3);
  });

  it('returns initial state for empty array', () => {
    const s = advanceOffsetMany(createLineOffsetState(), []);
    expect(s.lineNumber).toBe(0);
    expect(s.byteOffset).toBe(0);
  });
});

describe('resetOffset', () => {
  it('returns zeroed state', () => {
    const s = resetOffset();
    expect(s.byteOffset).toBe(0);
    expect(s.lineNumber).toBe(0);
  });
});

describe('offsetFromLineNumber', () => {
  it('computes offset up to target line', () => {
    const lines = ['abc', 'def', 'ghi'];
    const s = offsetFromLineNumber(lines, 2);
    expect(s.lineNumber).toBe(2);
  });

  it('returns zero offset for line 0', () => {
    const s = offsetFromLineNumber(['abc', 'def'], 0);
    expect(s.lineNumber).toBe(0);
    expect(s.byteOffset).toBe(0);
  });
});

describe('formatOffset', () => {
  it('formats offset as readable string', () => {
    const s = { byteOffset: 42, lineNumber: 7 };
    expect(formatOffset(s)).toBe('line=7 byte=42');
  });
});

describe('serializeOffset / deserializeOffset', () => {
  it('round-trips correctly', () => {
    const s = { byteOffset: 100, lineNumber: 5 };
    const raw = serializeOffset(s);
    const restored = deserializeOffset(raw);
    expect(restored).toEqual(s);
  });

  it('throws on invalid input', () => {
    expect(() => deserializeOffset('{"bad":true}')).toThrow();
  });
});
