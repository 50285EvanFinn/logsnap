/**
 * Deduplicator: removes or collapses repeated/duplicate log lines.
 */

export interface DeduplicatorOptions {
  /** Maximum number of identical consecutive lines before collapsing */
  threshold?: number;
  /** Whether to append a count suffix when collapsing */
  showCount?: boolean;
}

export interface DeduplicatedLine {
  line: string;
  count: number;
}

/**
 * Collapses consecutive duplicate lines into a single entry with a repeat count.
 */
export function deduplicateLines(
  lines: string[],
  options: DeduplicatorOptions = {}
): DeduplicatedLine[] {
  const { threshold = 1, showCount = true } = options;
  const result: DeduplicatedLine[] = [];

  for (const line of lines) {
    const last = result[result.length - 1];
    if (last && last.line === line) {
      last.count += 1;
    } else {
      result.push({ line, count: 1 });
    }
  }

  return result.filter((entry) => entry.count >= threshold || threshold <= 1);
}

/**
 * Formats deduplicated lines back to strings, optionally appending repeat counts.
 */
export function formatDeduplicated(
  entries: DeduplicatedLine[],
  showCount = true
): string[] {
  return entries.map((entry) => {
    if (showCount && entry.count > 1) {
      return `${entry.line} [repeated ${entry.count}x]`;
    }
    return entry.line;
  });
}

/**
 * Convenience: deduplicate and format in one step.
 */
export function deduplicateAndFormat(
  lines: string[],
  options: DeduplicatorOptions = {}
): string[] {
  const deduped = deduplicateLines(lines, options);
  return formatDeduplicated(deduped, options.showCount ?? true);
}
