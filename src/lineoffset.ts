/**
 * lineoffset.ts
 * Tracks byte/line offsets within a file for resumable reading.
 */

export interface LineOffsetState {
  byteOffset: number;
  lineNumber: number;
}

export function createLineOffsetState(): LineOffsetState {
  return { byteOffset: 0, lineNumber: 0 };
}

export function advanceOffset(
  state: LineOffsetState,
  line: string,
  encoding: BufferEncoding = 'utf8'
): LineOffsetState {
  const byteLength = Buffer.byteLength(line, encoding) + 1; // +1 for newline
  return {
    byteOffset: state.byteOffset + byteLength,
    lineNumber: state.lineNumber + 1,
  };
}

export function advanceOffsetMany(
  state: LineOffsetState,
  lines: string[],
  encoding: BufferEncoding = 'utf8'
): LineOffsetState {
  return lines.reduce((s, line) => advanceOffset(s, line, encoding), state);
}

export function resetOffset(): LineOffsetState {
  return createLineOffsetState();
}

export function offsetFromLineNumber(
  lines: string[],
  targetLine: number,
  encoding: BufferEncoding = 'utf8'
): LineOffsetState {
  const slice = lines.slice(0, targetLine);
  return advanceOffsetMany(createLineOffsetState(), slice, encoding);
}

export function formatOffset(state: LineOffsetState): string {
  return `line=${state.lineNumber} byte=${state.byteOffset}`;
}

export function serializeOffset(state: LineOffsetState): string {
  return JSON.stringify(state);
}

export function deserializeOffset(raw: string): LineOffsetState {
  const parsed = JSON.parse(raw);
  if (
    typeof parsed.byteOffset !== 'number' ||
    typeof parsed.lineNumber !== 'number'
  ) {
    throw new Error('Invalid LineOffsetState serialization');
  }
  return { byteOffset: parsed.byteOffset, lineNumber: parsed.lineNumber };
}
