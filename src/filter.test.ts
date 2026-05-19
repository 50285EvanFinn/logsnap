import { buildFilter, filterLines, FilterOptions } from './filter';

describe('buildFilter', () => {
  it('matches plain string patterns (case-insensitive by default)', () => {
    const filter = buildFilter({ pattern: 'error', useRegex: false });
    expect(filter('An ERROR occurred').matched).toBe(true);
    expect(filter('All good').matched).toBe(false);
  });

  it('respects caseSensitive option', () => {
    const filter = buildFilter({ pattern: 'error', useRegex: false, caseSensitive: true });
    expect(filter('An ERROR occurred').matched).toBe(false);
    expect(filter('An error occurred').matched).toBe(true);
  });

  it('matches regex patterns', () => {
    const filter = buildFilter({ pattern: '\\d{3}', useRegex: true });
    expect(filter('Status 404 not found').matched).toBe(true);
    expect(filter('No numbers here').matched).toBe(false);
  });

  it('returns correct matchRanges', () => {
    const filter = buildFilter({ pattern: 'foo', useRegex: false, caseSensitive: true });
    const result = filter('foo bar foo');
    expect(result.matched).toBe(true);
    expect(result.matchRanges).toEqual([
      { start: 0, end: 3 },
      { start: 8, end: 11 },
    ]);
  });

  it('inverts match when invert is true', () => {
    const filter = buildFilter({ pattern: 'debug', useRegex: false, invert: true });
    expect(filter('debug message').matched).toBe(false);
    expect(filter('info message').matched).toBe(true);
  });

  it('throws on invalid regex', () => {
    expect(() => buildFilter({ pattern: '[invalid', useRegex: true })).toThrow(
      'Invalid regex pattern'
    );
  });
});

describe('filterLines', () => {
  const lines = ['INFO server started', 'ERROR connection failed', 'DEBUG polling', 'ERROR timeout'];

  it('filters lines matching a pattern', () => {
    const result = filterLines(lines, { pattern: 'ERROR' } as FilterOptions);
    expect(result).toEqual(['ERROR connection failed', 'ERROR timeout']);
  });

  it('returns all lines when pattern matches all', () => {
    const result = filterLines(lines, { pattern: '' } as FilterOptions);
    expect(result.length).toBe(lines.length);
  });
});
