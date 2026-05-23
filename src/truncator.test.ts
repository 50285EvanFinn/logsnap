import { truncateLine, truncateLines, wouldTruncate } from './truncator';

describe('truncateLine', () => {
  const opts = { maxLength: 20, ellipsis: '...' };

  it('returns the line unchanged when within maxLength', () => {
    const line = 'short line';
    expect(truncateLine(line, opts)).toBe('short line');
  });

  it('returns the line unchanged when exactly maxLength', () => {
    const line = 'exactly twenty chars';
    expect(line.length).toBe(20);
    expect(truncateLine(line, opts)).toBe(line);
  });

  it('truncates and appends ellipsis when line exceeds maxLength', () => {
    const line = 'this line is definitely too long for our limit';
    const result = truncateLine(line, opts);
    expect(result.length).toBe(20);
    expect(result.endsWith('...')).toBe(true);
  });

  it('uses custom ellipsis', () => {
    const result = truncateLine('abcdefghij', { maxLength: 7, ellipsis: '…' });
    expect(result).toBe('abcdef…');
    expect(result.length).toBe(7);
  });

  it('throws when maxLength is smaller than ellipsis length', () => {
    expect(() => truncateLine('hello', { maxLength: 2, ellipsis: '...' })).toThrow(
      RangeError
    );
  });

  it('handles empty string', () => {
    expect(truncateLine('', opts)).toBe('');
  });
});

describe('truncateLines', () => {
  it('truncates all lines in an array', () => {
    const lines = ['short', 'this is a very long line that exceeds the limit'];
    const result = truncateLines(lines, { maxLength: 10, ellipsis: '...' });
    expect(result[0]).toBe('short');
    expect(result[1].length).toBe(10);
    expect(result[1].endsWith('...')).toBe(true);
  });

  it('returns empty array for empty input', () => {
    expect(truncateLines([], { maxLength: 80 })).toEqual([]);
  });
});

describe('wouldTruncate', () => {
  it('returns true when line exceeds maxLength', () => {
    expect(wouldTruncate('hello world', 5)).toBe(true);
  });

  it('returns false when line is within maxLength', () => {
    expect(wouldTruncate('hi', 10)).toBe(false);
  });

  it('returns false when line equals maxLength', () => {
    expect(wouldTruncate('hello', 5)).toBe(false);
  });
});
