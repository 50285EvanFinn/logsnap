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

export function detectLevel(line: string): LogLevel {
  for (const level of ['error', 'warn', 'info', 'debug'] as LogLevel[]) {
    if (LEVEL_PATTERNS[level].test(line)) return level;
  }
  return 'unknown';
}

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

export function formatLine(raw: string): FormattedLine {
  const level = detectLevel(raw);
  const timestamp = extractTimestamp(raw);
  const message = raw.trim();
  const colored = LEVEL_COLORS[level](message);
  return { raw, level, timestamp, message, colored };
}

export function formatLines(lines: string[]): FormattedLine[] {
  return lines.map(formatLine);
}
