import { detectLevel, extractTimestamp, formatLine, formatLines } from './formatter';

describe('detectLevel', () => {
  it('detects error level', () => {
    expect(detectLevel('[ERROR] something went wrong')).toBe('error');
    expect(detectLevel('fatal crash occurred')).toBe('error');
  });

  it('detects warn level', () => {
    expect(detectLevel('WARNING: disk space low')).toBe('warn');
    expect(detectLevel('[warn] retrying...')).toBe('warn');
  });

  it('detects info level', () => {
    expect(detectLevel('INFO server started')).toBe('info');
  });

  it('detects debug level', () => {
    expect(detectLevel('debug: entering function')).toBe('debug');
    expect(detectLevel('[TRACE] step 1')).toBe('debug');
  });

  it('falls back to unknown', () => {
    expect(detectLevel('hello world')).toBe('unknown');
  });
});

describe('extractTimestamp', () => {
  it('extracts ISO timestamp', () => {
    expect(extractTimestamp('2024-01-15T10:30:00Z something happened')).toBe('2024-01-15T10:30:00Z');
  });

  it('extracts timestamp with offset', () => {
    expect(extractTimestamp('2024-06-01 12:00:00+05:30 log line')).toBe('2024-06-01 12:00:00+05:30');
  });

  it('returns undefined when no timestamp', () => {
    expect(extractTimestamp('no timestamp here')).toBeUndefined();
  });
});

describe('formatLine', () => {
  it('returns a FormattedLine object', () => {
    const result = formatLine('[ERROR] 2024-01-01T00:00:00Z crash');
    expect(result.level).toBe('error');
    expect(result.timestamp).toBe('2024-01-01T00:00:00Z');
    expect(result.message).toBe('[ERROR] 2024-01-01T00:00:00Z crash');
    expect(typeof result.colored).toBe('string');
  });
});

describe('formatLines', () => {
  it('formats multiple lines', () => {
    const lines = ['INFO started', 'ERROR failed', 'debug step'];
    const result = formatLines(lines);
    expect(result).toHaveLength(3);
    expect(result[0].level).toBe('info');
    expect(result[1].level).toBe('error');
    expect(result[2].level).toBe('debug');
  });
});
