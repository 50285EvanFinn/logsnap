/**
 * linesorter.ts
 * Sorts log lines by timestamp, level severity, or natural order.
 */

import { parseTimestamp } from './lineparser';

export type SortKey = 'timestamp' | 'level' | 'natural';
export type SortOrder = 'asc' | 'desc';

export interface SortConfig {
  key: SortKey;
  order: SortOrder;
}

const LEVEL_PRIORITY: Record<string, number> = {
  trace: 0,
  debug: 1,
  info: 2,
  warn: 3,
  warning: 3,
  error: 4,
  fatal: 5,
  critical: 5,
};

export function buildSortConfig(
  key: SortKey = 'natural',
  order: SortOrder = 'asc'
): SortConfig {
  return { key, order };
}

function extractLevelPriority(line: string): number {
  const match = line.match(/\b(trace|debug|info|warn(?:ing)?|error|fatal|critical)\b/i);
  if (!match) return 2; // default to info priority
  return LEVEL_PRIORITY[match[1].toLowerCase()] ?? 2;
}

function compareLines(
  a: string,
  b: string,
  config: SortConfig,
  indexA: number,
  indexB: number
): number {
  let result = 0;

  if (config.key === 'timestamp') {
    const tsA = parseTimestamp(a);
    const tsB = parseTimestamp(b);
    if (tsA && tsB) {
      result = new Date(tsA).getTime() - new Date(tsB).getTime();
    } else if (tsA) {
      result = -1;
    } else if (tsB) {
      result = 1;
    }
  } else if (config.key === 'level') {
    result = extractLevelPriority(a) - extractLevelPriority(b);
  } else {
    result = indexA - indexB;
  }

  return config.order === 'desc' ? -result : result;
}

export function sortLines(lines: string[], config: SortConfig): string[] {
  if (config.key === 'natural' && config.order === 'asc') {
    return [...lines];
  }
  return [...lines].sort((a, b) =>
    compareLines(a, b, config, lines.indexOf(a), lines.indexOf(b))
  );
}

export function sortLinesStable(lines: string[], config: SortConfig): string[] {
  const indexed = lines.map((line, i) => ({ line, i }));
  indexed.sort((a, b) => compareLines(a.line, b.line, config, a.i, b.i));
  return indexed.map(({ line }) => line);
}
