import { annotateLine, annotateLines, stripAnnotation, formatAnnotated } from './lineannotator';

describe('annotateLine', () => {
  it('adds line number by default', () => {
    const result = annotateLine('hello world', 1);
    expect(result.annotated).toBe('[1] hello world');
    expect(result.lineNumber).toBe(1);
    expect(result.original).toBe('hello world');
  });

  it('omits line number when showLineNumbers is false', () => {
    const result = annotateLine('hello world', 5, { showLineNumbers: false });
    expect(result.annotated).toBe('hello world');
  });

  it('includes source when showSource and source are set', () => {
    const result = annotateLine('msg', 2, { showSource: true, source: 'app.log' });
    expect(result.annotated).toBe('[2] (app.log) msg');
    expect(result.source).toBe('app.log');
  });

  it('does not include source label when showSource is false', () => {
    const result = annotateLine('msg', 2, { showSource: false, source: 'app.log' });
    expect(result.annotated).not.toContain('app.log');
  });

  it('includes timestamp prefix when enabled', () => {
    const result = annotateLine('event', 3, {
      showTimestampPrefix: true,
      timestampPrefix: '2024-01-01T00:00:00Z',
    });
    expect(result.annotated).toBe('[3] 2024-01-01T00:00:00Z event');
  });

  it('combines all annotation options', () => {
    const result = annotateLine('log line', 7, {
      showLineNumbers: true,
      showSource: true,
      source: 'server.log',
      showTimestampPrefix: true,
      timestampPrefix: 'T+5s',
    });
    expect(result.annotated).toBe('[7] (server.log) T+5s log line');
  });
});

describe('annotateLines', () => {
  it('annotates multiple lines with incrementing numbers', () => {
    const results = annotateLines(['a', 'b', 'c']);
    expect(results[0].lineNumber).toBe(1);
    expect(results[1].lineNumber).toBe(2);
    expect(results[2].lineNumber).toBe(3);
  });

  it('respects lineNumberStart offset', () => {
    const results = annotateLines(['x', 'y'], { lineNumberStart: 10 });
    expect(results[0].lineNumber).toBe(10);
    expect(results[1].lineNumber).toBe(11);
  });

  it('returns empty array for empty input', () => {
    expect(annotateLines([])).toEqual([]);
  });
});

describe('stripAnnotation / formatAnnotated', () => {
  it('stripAnnotation returns original line', () => {
    const a = annotateLine('raw line', 1);
    expect(stripAnnotation(a)).toBe('raw line');
  });

  it('formatAnnotated returns the annotated string', () => {
    const a = annotateLine('raw line', 4);
    expect(formatAnnotated(a)).toBe('[4] raw line');
  });
});
