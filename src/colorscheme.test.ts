import { defaultColorScheme, noColorScheme, resolveColorScheme } from './colorscheme';

describe('defaultColorScheme', () => {
  it('wraps error text in red ansi codes', () => {
    const result = defaultColorScheme.error('ERR');
    expect(result).toContain('ERR');
    expect(result).toContain('\x1b[31m');
    expect(result).toContain('\x1b[0m');
  });

  it('wraps warn text in yellow ansi codes', () => {
    const result = defaultColorScheme.warn('WARN');
    expect(result).toContain('\x1b[33m');
  });

  it('wraps info text in cyan ansi codes', () => {
    const result = defaultColorScheme.info('INFO');
    expect(result).toContain('\x1b[36m');
  });

  it('wraps highlight text in bgRed ansi codes', () => {
    const result = defaultColorScheme.highlight('match');
    expect(result).toContain('\x1b[41m');
    expect(result).toContain('match');
  });

  it('wraps timestamp in gray', () => {
    const result = defaultColorScheme.timestamp('2024-01-01');
    expect(result).toContain('\x1b[90m');
  });

  it('wraps source in magenta', () => {
    const result = defaultColorScheme.source('app');
    expect(result).toContain('\x1b[35m');
  });
});

describe('noColorScheme', () => {
  it('returns text unchanged for all levels', () => {
    const levels = ['error', 'warn', 'info', 'debug', 'trace', 'unknown'] as const;
    for (const level of levels) {
      expect(noColorScheme[level]('text')).toBe('text');
    }
  });

  it('returns timestamp unchanged', () => {
    expect(noColorScheme.timestamp('ts')).toBe('ts');
  });

  it('returns highlight unchanged', () => {
    expect(noColorScheme.highlight('hi')).toBe('hi');
  });
});

describe('resolveColorScheme', () => {
  it('returns defaultColorScheme when useColor is true', () => {
    const scheme = resolveColorScheme(true);
    expect(scheme.error('x')).toContain('\x1b[');
  });

  it('returns noColorScheme when useColor is false', () => {
    const scheme = resolveColorScheme(false);
    expect(scheme.error('x')).toBe('x');
  });
});
