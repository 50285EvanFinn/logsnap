import {
  extractTimestampFromLine,
  lineInWindow,
  filterByTimeWindow,
  parseWindowArg,
} from './timewindow';

describe('extractTimestampFromLine', () => {
  it('extracts ISO 8601 timestamp', () => {
    const ts = extractTimestampFromLine('[2024-03-15T10:22:00Z] INFO server started');
    expect(ts).toEqual(new Date('2024-03-15T10:22:00Z'));
  });

  it('extracts simple datetime with space separator', () => {
    const ts = extractTimestampFromLine('2024-03-15 10:22:00 ERROR something failed');
    expect(ts).toEqual(new Date('2024-03-15T10:22:00'));
  });

  it('returns null when no timestamp present', () => {
    const ts = extractTimestampFromLine('no timestamp here');
    expect(ts).toBeNull();
  });

  it('handles milliseconds in timestamp', () => {
    const ts = extractTimestampFromLine('2024-03-15T10:22:00.123Z hello');
    expect(ts).toEqual(new Date('2024-03-15T10:22:00.123Z'));
  });
});

describe('lineInWindow', () => {
  const start = new Date('2024-03-15T10:00:00Z');
  const end = new Date('2024-03-15T11:00:00Z');

  it('includes line within window', () => {
    const result = lineInWindow('2024-03-15T10:30:00Z INFO ok', { start, end });
    expect(result.included).toBe(true);
  });

  it('excludes line before window start', () => {
    const result = lineInWindow('2024-03-15T09:00:00Z INFO early', { start, end });
    expect(result.included).toBe(false);
  });

  it('excludes line after window end', () => {
    const result = lineInWindow('2024-03-15T12:00:00Z INFO late', { start, end });
    expect(result.included).toBe(false);
  });

  it('includes line with no timestamp (pass-through)', () => {
    const result = lineInWindow('no timestamp at all', { start, end });
    expect(result.included).toBe(true);
    expect(result.timestamp).toBeNull();
  });

  it('works with only start bound', () => {
    const result = lineInWindow('2024-03-15T10:30:00Z INFO ok', { start });
    expect(result.included).toBe(true);
  });

  it('works with only end bound', () => {
    const result = lineInWindow('2024-03-15T09:00:00Z INFO early', { end });
    expect(result.included).toBe(true);
  });
});

describe('filterByTimeWindow', () => {
  const lines = [
    '2024-03-15T09:55:00Z DEBUG before',
    '2024-03-15T10:05:00Z INFO inside',
    '2024-03-15T10:45:00Z WARN also inside',
    '2024-03-15T11:10:00Z ERROR after',
  ];

  it('filters to only lines within window', () => {
    const result = filterByTimeWindow(lines, {
      start: new Date('2024-03-15T10:00:00Z'),
      end: new Date('2024-03-15T11:00:00Z'),
    });
    expect(result).toHaveLength(2);
    expect(result[0]).toContain('inside');
    expect(result[1]).toContain('also inside');
  });
});

describe('parseWindowArg', () => {
  it('parses a valid ISO string', () => {
    expect(parseWindowArg('2024-03-15T10:00:00Z')).toEqual(new Date('2024-03-15T10:00:00Z'));
  });

  it('throws on invalid input', () => {
    expect(() => parseWindowArg('not-a-date')).toThrow('Invalid date/time value');
  });
});
