import { FormattedLine, LogLevel } from './formatter';

export interface LogStats {
  total: number;
  byLevel: Record<LogLevel, number>;
  firstTimestamp?: string;
  lastTimestamp?: string;
  errorRate: number;
}

export function computeStats(lines: FormattedLine[]): LogStats {
  const byLevel: Record<LogLevel, number> = {
    info: 0,
    warn: 0,
    error: 0,
    debug: 0,
    unknown: 0,
  };

  let firstTimestamp: string | undefined;
  let lastTimestamp: string | undefined;

  for (const line of lines) {
    byLevel[line.level]++;
    if (line.timestamp) {
      if (!firstTimestamp) firstTimestamp = line.timestamp;
      lastTimestamp = line.timestamp;
    }
  }

  const total = lines.length;
  const errorRate = total > 0 ? byLevel.error / total : 0;

  return { total, byLevel, firstTimestamp, lastTimestamp, errorRate };
}

export function formatStats(stats: LogStats): string {
  const lines = [
    `Total lines : ${stats.total}`,
    `  ERROR     : ${stats.byLevel.error}`,
    `  WARN      : ${stats.byLevel.warn}`,
    `  INFO      : ${stats.byLevel.info}`,
    `  DEBUG     : ${stats.byLevel.debug}`,
    `  UNKNOWN   : ${stats.byLevel.unknown}`,
    `Error rate  : ${(stats.errorRate * 100).toFixed(1)}%`,
  ];
  if (stats.firstTimestamp) lines.push(`First event : ${stats.firstTimestamp}`);
  if (stats.lastTimestamp)  lines.push(`Last event  : ${stats.lastTimestamp}`);
  return lines.join('\n');
}
