import { renderLines, renderToString, renderSummary } from './outputrenderer';
import { ParsedLine } from './lineparser';

const makeLine = (msg: string, level = 'info'): ParsedLine => ({
  timestamp: '2024-06-01T12:00:00Z',
  level,
  source: 'app',
  message: msg,
  raw: msg,
  fields: {},
});

const lines = [
  makeLine('first line'),
  makeLine('second line', 'warn'),
  makeLine('third line', 'error'),
];

describe('renderLines', () => {
  it('returns correct count', () => {
    const result = renderLines(lines, { format: 'text' });
    expect(result.count).toBe(3);
  });

  it('prefixes line numbers when enabled', () => {
    const result = renderLines(lines, { format: 'text', lineNumbers: true });
    expect(result.lines[0]).toMatch(/^\s*1\s/);
    expect(result.lines[1]).toMatch(/^\s*2\s/);
  });

  it('respects startIndex for line numbers', () => {
    const result = renderLines(lines, {
      format: 'text',
      lineNumbers: true,
      startIndex: 10,
    });
    expect(result.lines[0]).toMatch(/^\s*10\s/);
  });

  it('does not prefix numbers when disabled', () => {
    const result = renderLines(lines, { format: 'text', lineNumbers: false });
    expect(result.lines[0]).not.toMatch(/^\s*\d+\s/);
  });

  it('produces json format lines', () => {
    const result = renderLines(lines, { format: 'json' });
    result.lines.forEach((l) => {
      expect(() => JSON.parse(l)).not.toThrow();
    });
  });

  it('includes header row for csv when includeHeader is true', () => {
    const result = renderLines(lines, { format: 'csv', includeHeader: true });
    expect(result.lines[0]).toBe('timestamp,level,source,message');
    expect(result.count).toBe(4);
  });
});

describe('renderToString', () => {
  it('joins lines with newline', () => {
    const result = renderToString(lines, { format: 'text' });
    const parts = result.split('\n');
    expect(parts.length).toBe(3);
  });

  it('returns empty string for empty input', () => {
    const result = renderToString([], { format: 'text' });
    expect(result).toBe('');
  });
});

describe('renderSummary', () => {
  it('uses plural for multiple lines', () => {
    expect(renderSummary({ lines: [], count: 5 })).toBe('Rendered 5 lines.');
  });

  it('uses singular for one line', () => {
    expect(renderSummary({ lines: [], count: 1 })).toBe('Rendered 1 line.');
  });

  it('handles zero', () => {
    expect(renderSummary({ lines: [], count: 0 })).toBe('Rendered 0 lines.');
  });
});
