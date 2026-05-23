/**
 * truncator.ts
 * Truncates long log lines to a configurable max length with an ellipsis suffix.
 */

export interface TruncatorOptions {
  maxLength: number;
  ellipsis?: string;
}

const DEFAULT_ELLIPSIS = '...';

/**
 * Truncates a single line if it exceeds maxLength.
 * The ellipsis is included within the maxLength budget.
 */
export function truncateLine(
  line: string,
  options: TruncatorOptions
): string {
  const { maxLength, ellipsis = DEFAULT_ELLIPSIS } = options;

  if (maxLength < ellipsis.length) {
    throw new RangeError(
      `maxLength (${maxLength}) must be >= ellipsis length (${ellipsis.length})`
    );
  }

  if (line.length <= maxLength) {
    return line;
  }

  return line.slice(0, maxLength - ellipsis.length) + ellipsis;
}

/**
 * Truncates every line in the array.
 */
export function truncateLines(
  lines: string[],
  options: TruncatorOptions
): string[] {
  return lines.map((line) => truncateLine(line, options));
}

/**
 * Returns true if the line was truncated (i.e. it would exceed maxLength).
 */
export function wouldTruncate(
  line: string,
  maxLength: number
): boolean {
  return line.length > maxLength;
}
