import {
  createCollapserState,
  feedLine,
  finaliseCollapser,
  collapseLines,
} from './linecollapser';

describe('collapseLines', () => {
  it('passes through non-repeating lines unchanged', () => {
    const lines = ['alpha', 'beta', 'gamma'];
    expect(collapseLines(lines)).toEqual(['alpha', 'beta', 'gamma']);
  });

  it('collapses consecutive duplicates beyond maxRepeats=1', () => {
    const lines = ['foo', 'foo', 'foo', 'foo', 'bar'];
    const result = collapseLines(lines, { maxRepeats: 1 });
    expect(result).toEqual(['foo', '[+3 repeated line(s) collapsed]', 'bar']);
  });

  it('allows maxRepeats=2 before collapsing', () => {
    const lines = ['x', 'x', 'x', 'x'];
    const result = collapseLines(lines, { maxRepeats: 2 });
    expect(result).toEqual(['x', 'x', '[+2 repeated line(s) collapsed]']);
  });

  it('does not emit collapse notice when repeats equal maxRepeats', () => {
    const lines = ['a', 'a'];
    const result = collapseLines(lines, { maxRepeats: 2 });
    expect(result).toEqual(['a', 'a']);
  });

  it('handles empty input', () => {
    expect(collapseLines([])).toEqual([]);
  });

  it('resets repeat count on new unique line', () => {
    const lines = ['a', 'a', 'a', 'b', 'b', 'b'];
    const result = collapseLines(lines, { maxRepeats: 1 });
    expect(result).toEqual([
      'a',
      '[+2 repeated line(s) collapsed]',
      'b',
      '[+2 repeated line(s) collapsed]',
    ]);
  });

  it('supports a custom similarity key function', () => {
    const lines = ['ERROR: disk full', 'ERROR: disk full', 'ERROR: timeout'];
    const keyFn = (line: string) => line.split(':')[0].trim();
    const result = collapseLines(lines, { maxRepeats: 1, similarityKey: keyFn });
    expect(result).toEqual(['ERROR: disk full', '[+1 repeated line(s) collapsed]']);
  });
});

describe('feedLine / finaliseCollapser (stateful API)', () => {
  it('accumulates output incrementally', () => {
    const state = createCollapserState({ maxRepeats: 1 });
    feedLine(state, 'hello');
    feedLine(state, 'hello');
    feedLine(state, 'world');
    const result = finaliseCollapser(state);
    expect(result).toContain('hello');
    expect(result).toContain('[+1 repeated line(s) collapsed]');
    expect(result).toContain('world');
  });

  it('resets state after finalise', () => {
    const state = createCollapserState({ maxRepeats: 1 });
    feedLine(state, 'ping');
    finaliseCollapser(state);
    expect(state.output).toEqual([]);
    expect(state.lastKey).toBeNull();
  });
});
