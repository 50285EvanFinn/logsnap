import { computeStats, formatStats } from './stats';
import { formatLines } from './formatter';

const RAW_LINES = [
  '2024-01-01T00:00:00Z INFO server started',
  '2024-01-01T00:01:00Z WARN high memory usage',
  '2024-01-01T00:02:00Z ERROR connection refused',
  '2024-01-01T00:03:00Z ERROR timeout',
  'debug: internal loop',
  'just a plain log line',
];

describe('computeStats', () => {
  const formatted = formatLines(RAW_LINES);
  const stats = computeStats(formatted);

  it('counts total lines', () => {
    expect(stats.total).toBe(6);
  });

  it('counts by level', () => {
    expect(stats.byLevel.info).toBe(1);
    expect(stats.byLevel.warn).toBe(1);
    expect(stats.byLevel.error).toBe(2);
    expect(stats.byLevel.debug).toBe(1);
    expect(stats.byLevel.unknown).toBe(1);
  });

  it('calculates error rate', () => {
    expect(stats.errorRate).toBeCloseTo(2 / 6);
  });

  it('captures first and last timestamps', () => {
    expect(stats.firstTimestamp).toBe('2024-01-01T00:00:00Z');
    expect(stats.lastTimestamp).toBe('2024-01-01T00:03:00Z');
  });

  it('handles empty input', () => {
    const empty = computeStats([]);
    expect(empty.total).toBe(0);
    expect(empty.errorRate).toBe(0);
    expect(empty.firstTimestamp).toBeUndefined();
  });
});

describe('formatStats', () => {
  it('returns a non-empty string summary', () => {
    const stats = computeStats(formatLines(RAW_LINES));
    const output = formatStats(stats);
    expect(output).toContain('Total lines');
    expect(output).toContain('Error rate');
    expect(output).toContain('First event');
    expect(output).toContain('Last event');
  });
});
