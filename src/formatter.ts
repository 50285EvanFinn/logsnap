import chalk from 'chalk';

export type LogLevel = 'info' | 'warn' | 'error' | 'debug' | 'unknown';

export interface FormattedLine {
  raw: string;
  level: LogLevel;
  timestamp?: string;
  message: string;
  colored: string;
}

const LEVEL_PATTERNS: Record<LogLevel, RegExp> = {
  error: /\b(error|err|fatal|critical)\b/i,
  warn:  /\b(warn|warning)\b/i,
  info:  /\b(info|information)\b/i,
  debug: /\b(debug|trace|verbose)\b/i,
  unknown: /.*/,
};

const TIMESTAMP_RE = /\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}:\d{2}(\.\d+)?(Z|[+-]\d{2}:\d{2})?/;

/** Detects the log level of a line by checking for known keywords in priority order. */
export function detectLevel(line: string): LogLevel {
  for (const level of ['error', 'warn', 'info', 'debug'] as LogLevel[]) {
    if (LEVEL_PATTERNS[level].test(line)) return level;
  }
  return 'unknown';
}

/** Extracts an ISO-8601-style timestamp from a log line, if present. */
export function extractTimestamp(line: string): string | undefined {
  const match = line.match(TIMESTAMP_RE);
  return match ? match[0] : undefined;
}

const LEVEL_COLORS: Record<LogLevel, (s: string) => string> = {
  error:   chalk.red,
  warn:    chalk.yellow,
  info:    chalk.cyan,
  debug:   chalk.gray,
  unknown: chalk.white,
};

/** Formats a single raw log line into a structured {@link FormattedLine}. */
export function formatLine(raw: string): FormattedLine {
  const level = detectLevel(raw);
  const timestamp = extractTimestamp(raw);
  const message = raw.trim();
  const colored = LEVEL_COLORS[level](message);
  return { raw, level, timestamp, message, colored };
}

/** Formats an array of raw log lines into structured {@link FormattedLine} objects. */
export function formatLines(lines: string[]): FormattedLine[] {
  return lines.map(formatLine);
}

/**
 * Groups an array of {@link FormattedLine} objects by their log level.
 *
 * @param lines - The formatted lines to group.
 * @returns A record mapping each log level to the lines that belong to it.
 */
export function groupByLevel(lines: FormattedLine[]): Partial<Record<LogLevel, FormattedLine[]>> {
  const groups: Partial<Record<LogLevel, FormattedLine[]>> = {};
  for (const line of lines) {
    if (!groups[line.level]) {
      groups[line.level] = [];
    }
    groups[line.level]!.push(line);
  }
  return groups;
}
