import {
  formatAsText,
  formatAsJson,
  formatAsCsv,
  formatParsedLine,
  buildHeader,
  resetHeader,
} from './outputformatter';
import { ParsedLine } from './lineparser';

const sample: ParsedLine = {
  timestamp: '2024-01-15T10:00:00Z',
  level: 'error',
  source: 'api',
  message: 'Something went wrong',
  raw: '[2024-01-15T10:00:00Z] [ERROR] (api) Something went wrong',
  fields: {},
};

const minimal: ParsedLine = {
  timestamp: null,
  level: null,
  source: null,
  message: 'bare message',
  raw: 'bare message',
  fields: {},
};

beforeEach(() => resetHeader());

describe('formatAsText', () => {
  it('includes all parts when present', () => {
    const result = formatAsText(sample);
    expect(result).toContain('[2024-01-15T10:00:00Z]');
    expect(result).toContain('[ERROR]');
    expect(result).toContain('(api)');
    expect(result).toContain('Something went wrong');
  });

  it('omits missing parts', () => {
    const result = formatAsText(minimal);
    expect(result).toBe('bare message');
  });
});

describe('formatAsJson', () => {
  it('produces valid JSON with all fields', () => {
    const result = JSON.parse(formatAsJson(sample));
    expect(result.level).toBe('error');
    expect(result.source).toBe('api');
    expect(result.message).toBe('Something went wrong');
  });

  it('uses null for missing fields', () => {
    const result = JSON.parse(formatAsJson(minimal));
    expect(result.timestamp).toBeNull();
    expect(result.level).toBeNull();
  });
});

describe('formatAsCsv', () => {
  it('produces comma-separated output', () => {
    const result = formatAsCsv(sample);
    expect(result.split(',').length).toBe(4);
  });

  it('escapes values containing delimiter', () => {
    const line = { ...sample, message: 'hello, world' };
    const result = formatAsCsv(line);
    expect(result).toContain('"hello, world"');
  });
});

describe('buildHeader', () => {
  it('returns header for csv', () => {
    expect(buildHeader('csv')).toBe('timestamp,level,source,message');
  });
  it('returns empty string for text/json', () => {
    expect(buildHeader('text')).toBe('');
    expect(buildHeader('json')).toBe('');
  });
});

describe('formatParsedLine', () => {
  it('emits header only once for csv with includeHeader', () => {
    const opts = { format: 'csv' as const, includeHeader: true };
    const first = formatParsedLine(sample, opts);
    const second = formatParsedLine(sample, opts);
    expect(first).toContain('timestamp,level,source,message');
    expect(second).not.toContain('timestamp,level,source,message');
  });

  it('formats tsv with tab delimiter', () => {
    const result = formatParsedLine(sample, { format: 'tsv' });
    expect(result.split('\t').length).toBe(4);
  });
});
