/**
 * LineBuffer: a fixed-capacity circular buffer that retains the most
 * recent N lines.  Useful for "last N lines" snapshots and context.
 */

export interface LineBuffer {
  capacity: number;
  lines: string[];
  /** Next write position (mod capacity) */
  cursor: number;
  /** Total lines ever written */
  total: number;
}

export function createLineBuffer(capacity: number): LineBuffer {
  if (capacity < 1) throw new RangeError("capacity must be >= 1");
  return { capacity, lines: [], cursor: 0, total: 0 };
}

export function pushLine(buf: LineBuffer, line: string): void {
  if (buf.lines.length < buf.capacity) {
    buf.lines.push(line);
  } else {
    buf.lines[buf.cursor] = line;
  }
  buf.cursor = (buf.cursor + 1) % buf.capacity;
  buf.total++;
}

/**
 * Returns the buffered lines in chronological order (oldest first).
 */
export function drainBuffer(buf: LineBuffer): string[] {
  if (buf.lines.length < buf.capacity) {
    return [...buf.lines];
  }
  const tail = buf.lines.slice(buf.cursor);
  const head = buf.lines.slice(0, buf.cursor);
  return [...tail, ...head];
}

export function clearBuffer(buf: LineBuffer): void {
  buf.lines = [];
  buf.cursor = 0;
  buf.total = 0;
}

export function bufferSize(buf: LineBuffer): number {
  return buf.lines.length;
}
