/**
 * levelfilter.ts
 * Filter log lines by severity level with support for minimum level thresholds.
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'fatal';

const LEVEL_ORDER: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
  fatal: 4,
};

export interface LevelFilterOptions {
  /** Minimum level to include (inclusive). Defaults to 'debug' (all). */
  minLevel?: LogLevel;
  /** Explicit set of levels to include. Overrides minLevel if provided. */
  only?: LogLevel[];
}

/**
 * Returns true if the given level passes the filter options.
 */
export function levelPassesFilter(level: LogLevel, options: LevelFilterOptions): boolean {
  if (options.only && options.only.length > 0) {
    return options.only.includes(level);
  }
  const min = options.minLevel ?? 'debug';
  return LEVEL_ORDER[level] >= LEVEL_ORDER[min];
}

/**
 * Normalise a raw level string to a known LogLevel, or return null.
 */
export function normaliseLevel(raw: string): LogLevel | null {
  const lower = raw.trim().toLowerCase();
  if (lower in LEVEL_ORDER) return lower as LogLevel;
  // common aliases
  if (lower === 'warning') return 'warn';
  if (lower === 'err') return 'error';
  if (lower === 'crit' || lower === 'critical') return 'fatal';
  if (lower === 'trace' || lower === 'verbose') return 'debug';
  return null;
}

/**
 * Filter an array of { line, level } objects by the given options.
 */
export function filterByLevel(
  entries: Array<{ line: string; level: LogLevel }>,
  options: LevelFilterOptions
): Array<{ line: string; level: LogLevel }> {
  return entries.filter((e) => levelPassesFilter(e.level, options));
}
