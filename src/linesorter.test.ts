import { buildSortConfig, sortLines, sortLinesStable } from './linesorter';

const LINES = [
  '2024-01-03T10:00:00Z INFO  service started',
  '2024-01-01T08:00:00Z ERROR failed to connect',
  '2024-01-02T09:30:00Z DEBUG checking config',
  '2024-01-02T09:30:01Z WARN  retrying connection',
];

describe('buildSortConfig', () => {
  it('returns defaults when no args provided', () => {
    const cfg = buildSortConfig();
    expect(cfg.key).toBe('natural');
    expect(cfg.order).toBe('asc');
  });

  it('respects provided key and order', () => {
    const cfg = buildSortConfig('timestamp', 'desc');
    expect(cfg.key).toBe('timestamp');
    expect(cfg.order).toBe('desc');
  });
});

describe('sortLines by timestamp', () => {
  it('sorts ascending by timestamp', () => {
    const cfg = buildSortConfig('timestamp', 'asc');
    const sorted = sortLines(LINES, cfg);
    expect(sorted[0]).toContain('2024-01-01');
    expect(sorted[sorted.length - 1]).toContain('2024-01-03');
  });

  it('sorts descending by timestamp', () => {
    const cfg = buildSortConfig('timestamp', 'desc');
    const sorted = sortLines(LINES, cfg);
    expect(sorted[0]).toContain('2024-01-03');
    expect(sorted[sorted.length - 1]).toContain('2024-01-01');
  });
});

describe('sortLines by level', () => {
  it('sorts ascending by level severity', () => {
    const cfg = buildSortConfig('level', 'asc');
    const sorted = sortLines(LINES, cfg);
    expect(sorted[0]).toContain('DEBUG');
    expect(sorted[sorted.length - 1]).toContain('ERROR');
  });

  it('sorts descending by level severity', () => {
    const cfg = buildSortConfig('level', 'desc');
    const sorted = sortLines(LINES, cfg);
    expect(sorted[0]).toContain('ERROR');
  });
});

describe('sortLines natural order', () => {
  it('returns lines in original order when natural asc', () => {
    const cfg = buildSortConfig('natural', 'asc');
    const sorted = sortLines(LINES, cfg);
    expect(sorted).toEqual(LINES);
  });

  it('reverses lines when natural desc', () => {
    const cfg = buildSortConfig('natural', 'desc');
    const sorted = sortLines(LINES, cfg);
    expect(sorted[0]).toBe(LINES[LINES.length - 1]);
  });
});

describe('sortLinesStable', () => {
  it('produces same result as sortLines for timestamp asc', () => {
    const cfg = buildSortConfig('timestamp', 'asc');
    const a = sortLines(LINES, cfg);
    const b = sortLinesStable(LINES, cfg);
    expect(b).toEqual(a);
  });

  it('does not mutate original array', () => {
    const original = [...LINES];
    const cfg = buildSortConfig('timestamp', 'asc');
    sortLinesStable(LINES, cfg);
    expect(LINES).toEqual(original);
  });
});
