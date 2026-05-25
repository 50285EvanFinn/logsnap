/**
 * linesplitter.ts
 * Splits raw buffer/string input into discrete lines,
 * handling partial lines across chunk boundaries.
 */

export interface LineSplitterState {
  remainder: string;
}

export function createLineSplitterState(): LineSplitterState {
  return { remainder: "" };
}

/**
 * Feed a raw chunk into the splitter.
 * Returns complete lines found in this chunk.
 * Any trailing partial line is stored in state for the next call.
 */
export function feedChunk(
  state: LineSplitterState,
  chunk: string
): string[] {
  const combined = state.remainder + chunk;
  const lines = combined.split("\n");
  // Last element is either empty string (chunk ended with \n)
  // or a partial line — store it as remainder.
  state.remainder = lines.pop() ?? "";
  return lines.filter((l) => l.length > 0);
}

/**
 * Flush any remaining partial line from the splitter state.
 * Call this when the input stream ends.
 */
export function flushSplitter(state: LineSplitterState): string[] {
  const remaining = state.remainder;
  state.remainder = "";
  return remaining.length > 0 ? [remaining] : [];
}

/**
 * Convenience: split a complete string into lines (no state needed).
 */
export function splitLines(input: string): string[] {
  return input
    .split("\n")
    .filter((l) => l.length > 0);
}

/**
 * Reset the splitter state, discarding any buffered remainder.
 */
export function resetSplitter(state: LineSplitterState): void {
  state.remainder = "";
}
