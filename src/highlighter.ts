/**
 * Applies chalk-based terminal highlighting to matched ranges within a log line.
 */

import chalk from 'chalk';
import { buildFilter, FilterOptions } from './filter';

export type HighlightColor = 'yellow' | 'red' | 'green' | 'cyan' | 'magenta' | 'blue';

export interface HighlightOptions extends FilterOptions {
  color?: HighlightColor;
}

const colorMap: Record<HighlightColor, (text: string) => string> = {
  yellow: chalk.yellow,
  red: chalk.red,
  green: chalk.green,
  cyan: chalk.cyan,
  magenta: chalk.magenta,
  blue: chalk.blue,
};

export function highlightLine(line: string, options: HighlightOptions): string {
  const color = options.color ?? 'yellow';
  const colorFn = colorMap[color];
  const filter = buildFilter(options);
  const result = filter(line);

  if (!result.matched || result.matchRanges.length === 0) {
    return line;
  }

  let highlighted = '';
  let cursor = 0;

  for (const range of result.matchRanges) {
    highlighted += line.slice(cursor, range.start);
    highlighted += colorFn(line.slice(range.start, range.end));
    cursor = range.end;
  }

  highlighted += line.slice(cursor);
  return highlighted;
}

export function highlightLines(lines: string[], options: HighlightOptions): string[] {
  return lines.map((line) => highlightLine(line, options));
}
