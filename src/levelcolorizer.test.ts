import { colorizeLevelToken, colorizeLine, colorizeLines } from './levelcolorizer';
import { defaultColorScheme, noColorScheme } from './colorscheme';
import type { LogLevel } from './colorscheme';

describe('colorizeLevelToken', () => {
  it('applies the correct color for error level', () => {
    const result = colorizeLevelToken('error', 'ERROR', defaultColorScheme);
    expect(result).toContain('\x1b[31m');
    expect(result).toContain('ERROR');
  });

  it('applies the correct color for info level', () => {
    const result = colorizeLevelToken('info', 'INFO', defaultColorScheme);
    expect(result).toContain('\x1b[36m');
  });

  it('returns plain text with noColorScheme', () => {
    const result = colorizeLevelToken('warn', 'WARN', noColorScheme);
    expect(result).toBe('WARN');
  });
});

describe('colorizeLine', () => {
  it('colorizes the level token within the line', () => {
    const line = '2024-01-01 ERROR something went wrong';
    const result = colorizeLine(line, 'error', { scheme: defaultColorScheme });
    expect(result).toContain('\x1b[31m');
    expect(result).toContain('something went wrong');
  });

  it('colorizes full line when colorizeFullLine is true', () => {
    const line = 'INFO app started';
    const result = colorizeLine(line, 'info', { scheme: defaultColorScheme, colorizeFullLine: true });
    expect(result.startsWith('\x1b[36m')).toBe(true);
  });

  it('returns unchanged line for unknown level', () => {
    const line = 'some random log line';
    const result = colorizeLine(line, 'unknown', { scheme: defaultColorScheme });
    expect(result).toBe(line);
  });

  it('uses defaultColorScheme when no scheme provided', () => {
    const line = 'DEBUG checking state';
    const result = colorizeLine(line, 'debug');
    expect(result).toContain('\x1b[34m');
  });
});

describe('colorizeLines', () => {
  it('applies colorization to each line based on levelMap', () => {
    const lines = ['ERROR crash', 'INFO startup'];
    const levelMap = new Map<string, LogLevel>([
      ['ERROR crash', 'error'],
      ['INFO startup', 'info'],
    ]);
    const results = colorizeLines(lines, levelMap, { scheme: defaultColorScheme });
    expect(results[0]).toContain('\x1b[31m');
    expect(results[1]).toContain('\x1b[36m');
  });

  it('defaults to unknown for lines not in levelMap', () => {
    const lines = ['some line'];
    const levelMap = new Map<string, LogLevel>();
    const results = colorizeLines(lines, levelMap);
    expect(results[0]).toBe('some line');
  });
});
