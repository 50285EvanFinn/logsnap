/**
 * timewindow.ts
 * Filter log lines by a time window (start/end timestamps).
 */

export interface TimeWindow {
  start?: Date;
  end?: Date;
}

export interface TimeWindowResult {
  line: string;
  timestamp: Date | null;
  included: boolean;
}

const ISO_RE = /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})?/;
const SIMPLE_RE = /\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}:\d{2}/;

export function extractTimestampFromLine(line: string): Date | null {
  const isoMatch = line.match(ISO_RE);
  if (isoMatch) {
    const d = new Date(isoMatch[0]);
    return isNaN(d.getTime()) ? null : d;
  }
  const simpleMatch = line.match(SIMPLE_RE);
  if (simpleMatch) {
    const d = new Date(simpleMatch[0].replace(' ', 'T'));
    return isNaN(d.getTime()) ? null : d;
  }
  return null;
}

export function lineInWindow(line: string, window: TimeWindow): TimeWindowResult {
  const timestamp = extractTimestampFromLine(line);

  if (timestamp === null) {
    return { line, timestamp: null, included: true };
  }

  const afterStart = window.start ? timestamp >= window.start : true;
  const beforeEnd = window.end ? timestamp <= window.end : true;
  const included = afterStart && beforeEnd;

  return { line, timestamp, included };
}

export function filterByTimeWindow(lines: string[], window: TimeWindow): string[] {
  return lines.filter((line) => lineInWindow(line, window).included);
}

export function parseWindowArg(value: string): Date {
  const d = new Date(value);
  if (isNaN(d.getTime())) {
    throw new Error(`Invalid date/time value: "${value}"`);
  }
  return d;
}
