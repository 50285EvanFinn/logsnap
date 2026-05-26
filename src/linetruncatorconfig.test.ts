import {
  parseTruncatorOptions,
  validateTruncatorOptions,
  describeTruncatorConfig,
} from './linetruncatorconfig';

describe('parseTruncatorOptions', () => {
  it('returns defaults when no options provided', () => {
    const config = parseTruncatorOptions({});
    expect(config.maxLength).toBe(200);
    expect(config.ellipsis).toBe('...');
    expect(config.preserveAnsi).toBe(false);
  });

  it('applies provided values', () => {
    const config = parseTruncatorOptions({
      maxLength: 80,
      ellipsis: '…',
      preserveAnsi: true,
    });
    expect(config.maxLength).toBe(80);
    expect(config.ellipsis).toBe('…');
    expect(config.preserveAnsi).toBe(true);
  });
});

describe('validateTruncatorOptions', () => {
  it('returns no errors for valid options', () => {
    expect(validateTruncatorOptions({ maxLength: 100, ellipsis: '...' })).toEqual([]);
  });

  it('errors on maxLength < 1', () => {
    const errs = validateTruncatorOptions({ maxLength: 0 });
    expect(errs).toContain('maxLength must be at least 1');
  });

  it('errors on ellipsis too long', () => {
    const errs = validateTruncatorOptions({ ellipsis: '12345678901' });
    expect(errs).toContain('ellipsis must be 10 characters or fewer');
  });

  it('accumulates multiple errors', () => {
    const errs = validateTruncatorOptions({ maxLength: -1, ellipsis: '12345678901' });
    expect(errs).toHaveLength(2);
  });
});

describe('describeTruncatorConfig', () => {
  it('returns a readable description', () => {
    const config = parseTruncatorOptions({ maxLength: 120, ellipsis: '..', preserveAnsi: true });
    const desc = describeTruncatorConfig(config);
    expect(desc).toContain('maxLength=120');
    expect(desc).toContain('ellipsis=".."');
    expect(desc).toContain('preserveAnsi=true');
  });
});
