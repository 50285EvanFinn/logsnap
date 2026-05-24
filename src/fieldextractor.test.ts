import {
  extractFieldsFromJson,
  extractFieldsFromKV,
  extractFields,
  pickFields,
  formatFields,
} from './fieldextractor';

describe('extractFieldsFromJson', () => {
  it('parses a valid JSON log line', () => {
    const line = '{"level":"info","msg":"started","port":3000}';
    const result = extractFieldsFromJson(line);
    expect(result).toEqual({ level: 'info', msg: 'started', port: 3000 });
  });

  it('returns null for non-JSON lines', () => {
    expect(extractFieldsFromJson('plain text log')).toBeNull();
  });

  it('returns null for malformed JSON', () => {
    expect(extractFieldsFromJson('{bad json')).toBeNull();
  });

  it('returns null for JSON arrays', () => {
    expect(extractFieldsFromJson('["a","b"]')).toBeNull();
  });

  it('returns null for JSON primitives', () => {
    expect(extractFieldsFromJson('42')).toBeNull();
    expect(extractFieldsFromJson('"just a string"')).toBeNull();
    expect(extractFieldsFromJson('true')).toBeNull();
  });
});

describe('extractFieldsFromKV', () => {
  it('parses key=value pairs', () => {
    const result = extractFieldsFromKV('level=info msg="user logged in" uid=42');
    expect(result).toEqual({ level: 'info', msg: 'user logged in', uid: 42 });
  });

  it('handles boolean and null values', () => {
    const result = extractFieldsFromKV('ok=true err=false val=null');
    expect(result).toEqual({ ok: true, err: false, val: null });
  });

  it('returns empty object for lines with no kv pairs', () => {
    expect(extractFieldsFromKV('no fields here at all')).toEqual({});
  });
});

describe('extractFields', () => {
  it('prefers JSON when line starts with {', () => {
    const line = '{"x":1}';
    expect(extractFields(line)).toEqual({ x: 1 });
  });

  it('falls back to kv parsing for plain lines', () => {
    const line = 'status=ok code=200';
    expect(extractFields(line)).toEqual({ status: 'ok', code: 200 });
  });

  it('falls back to kv parsing when JSON parse fails', () => {
    const line = '{bad json} status=ok';
    expect(extractFields(line)).toEqual({ status: 'ok' });
  });
});

describe('pickFields', () => {
  it('returns only requested keys', () => {
    const fields = { a: 1, b: 'two', c: true };
    expect(pickFields(fields, ['a', 'c'])).toEqual({ a: 1, c: true });
  });

  it('ignores missing keys silently', () => {
    expect(pickFields({ a: 1 }, ['a', 'z'])).toEqual({ a: 1 });
  });

  it('returns empty object when no keys match', () => {
    expect(pickFields({ a: 1, b: 2 }, ['x', 'y'])).toEqual({});
  });
});

describe('formatFields', () => {
  it('formats fields as key=value pairs', () => {
    const result = formatFields({ level: 'info', port: 3000 });
    expect(result).toBe('level="info" port=3000');
  });

  it('returns empty string for empty fields', () => {
    expect(formatFields({})).toBe('');
  });
});
