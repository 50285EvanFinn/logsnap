import { describe, it, expect } from 'vitest';
import {
  levelPassesFilter,
  normaliseLevel,
  filterByLevel,
  LogLevel,
} from './levelfilter';

describe('normaliseLevel', () => {
  it('returns known levels unchanged', () => {
    expect(normaliseLevel('info')).toBe('info');
    expect(normaliseLevel('ERROR')).toBe('error');
    expect(normaliseLevel('WARN')).toBe('warn');
  });

  it('maps aliases correctly', () => {
    expect(normaliseLevel('warning')).toBe('warn');
    expect(normaliseLevel('err')).toBe('error');
    expect(normaliseLevel('critical')).toBe('fatal');
    expect(normaliseLevel('crit')).toBe('fatal');
    expect(normaliseLevel('trace')).toBe('debug');
    expect(normaliseLevel('verbose')).toBe('debug');
  });

  it('returns null for unknown strings', () => {
    expect(normaliseLevel('unknown')).toBeNull();
    expect(normaliseLevel('')).toBeNull();
  });
});

describe('levelPassesFilter – minLevel', () => {
  it('passes all levels when minLevel is debug', () => {
    const levels: LogLevel[] = ['debug', 'info', 'warn', 'error', 'fatal'];
    levels.forEach((l) => expect(levelPassesFilter(l, { minLevel: 'debug' })).toBe(true));
  });

  it('excludes levels below minLevel', () => {
    expect(levelPassesFilter('debug', { minLevel: 'warn' })).toBe(false);
    expect(levelPassesFilter('info', { minLevel: 'warn' })).toBe(false);
    expect(levelPassesFilter('warn', { minLevel: 'warn' })).toBe(true);
    expect(levelPassesFilter('error', { minLevel: 'warn' })).toBe(true);
  });

  it('defaults to debug when no option provided', () => {
    expect(levelPassesFilter('debug', {})).toBe(true);
  });
});

describe('levelPassesFilter – only', () => {
  it('passes only specified levels', () => {
    expect(levelPassesFilter('error', { only: ['error', 'fatal'] })).toBe(true);
    expect(levelPassesFilter('info', { only: ['error', 'fatal'] })).toBe(false);
  });

  it('only takes precedence over minLevel', () => {
    expect(levelPassesFilter('debug', { minLevel: 'fatal', only: ['debug'] })).toBe(true);
  });
});

describe('filterByLevel', () => {
  const entries = [
    { line: 'a debug line', level: 'debug' as LogLevel },
    { line: 'an info line', level: 'info' as LogLevel },
    { line: 'a warn line', level: 'warn' as LogLevel },
    { line: 'an error line', level: 'error' as LogLevel },
  ];

  it('returns only entries at or above minLevel', () => {
    const result = filterByLevel(entries, { minLevel: 'warn' });
    expect(result).toHaveLength(2);
    expect(result.map((e) => e.level)).toEqual(['warn', 'error']);
  });

  it('returns only entries matching only list', () => {
    const result = filterByLevel(entries, { only: ['info'] });
    expect(result).toHaveLength(1);
    expect(result[0].line).toBe('an info line');
  });

  it('returns all entries when no restrictions', () => {
    expect(filterByLevel(entries, {})).toHaveLength(4);
  });
});
