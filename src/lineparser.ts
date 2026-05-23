/**
 * lineparser.ts
 * Parses raw log lines into structured LogEntry objects.
 */

export interface LogEntry {
  raw: string;
  timestamp: string | null;
  level: string | null;
  message: string;
  source: string | null;
}

const LEVEL_PATTERN = /\b(ERROR|WARN|INFO|DEBUG|TRACE|FATAL)\b/i;
const TIMESTAMP_PATTERN =
  /(\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:?\d{2})?)/;
const SOURCE_PATTERN = /\[([\w./-]+)\]/;

export function parseLevel(line: string): string | null {
  const match = line.match(LEVEL_PATTERN);
  return match ? match[1].toUpperCase() : null;
}

export function parseTimestamp(line: string): string | null {
  const match = line.match(TIMESTAMP_PATTERN);
  return match ? match[1] : null;
}

export function parseSource(line: string): string | null {
  const match = line.match(SOURCE_PATTERN);
  return match ? match[1] : null;
}

export function parseMessage(line: string): string {
  let msg = line;
  const ts = parseTimestamp(line);
  if (ts) msg = msg.replace(ts, "");
  const level = line.match(LEVEL_PATTERN);
  if (level) msg = msg.replace(level[0], "");
  const src = line.match(SOURCE_PATTERN);
  if (src) msg = msg.replace(src[0], "");
  return msg.replace(/^[\s:|-]+|[\s:|-]+$/g, "").trim();
}

export function parseLine(raw: string): LogEntry {
  return {
    raw,
    timestamp: parseTimestamp(raw),
    level: parseLevel(raw),
    message: parseMessage(raw),
    source: parseSource(raw),
  };
}

export function parseLines(lines: string[]): LogEntry[] {
  return lines.map(parseLine);
}
