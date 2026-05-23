/**
 * contextwindow.ts
 * Captures N lines of context before/after a matching line (like grep -C).
 */

export interface ContextWindowOptions {
  before: number;
  after: number;
}

export interface ContextResult {
  lineIndex: number;
  line: string;
  isMatch: boolean;
}

/**
 * Given all lines and a predicate, return lines with context around matches.
 * Deduplicates overlapping context windows.
 */
export function applyContextWindow(
  lines: string[],
  isMatch: (line: string) => boolean,
  options: ContextWindowOptions
): ContextResult[] {
  const { before, after } = options;
  const included = new Set<number>();

  for (let i = 0; i < lines.length; i++) {
    if (isMatch(lines[i])) {
      for (let b = Math.max(0, i - before); b <= i; b++) {
        included.add(b);
      }
      for (let a = i; a <= Math.min(lines.length - 1, i + after); a++) {
        included.add(a);
      }
    }
  }

  const sortedIndices = Array.from(included).sort((a, b) => a - b);

  return sortedIndices.map((idx) => ({
    lineIndex: idx,
    line: lines[idx],
    isMatch: isMatch(lines[idx]),
  }));
}

/**
 * Format context results into plain strings, inserting a separator "--"
 * between non-consecutive groups (mimics grep -C output).
 */
export function formatContextResults(results: ContextResult[]): string[] {
  const output: string[] = [];

  for (let i = 0; i < results.length; i++) {
    if (i > 0 && results[i].lineIndex !== results[i - 1].lineIndex + 1) {
      output.push("--");
    }
    output.push(results[i].line);
  }

  return output;
}
