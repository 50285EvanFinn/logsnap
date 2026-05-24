/**
 * linecount.ts
 * Tracks and reports line counts with optional per-level breakdown.
 */

export interface LineCountState {
  total: number;
  byLevel: Record<string, number>;
  matched: number;
  dropped: number;
}

export function createLineCountState(): LineCountState {
  return {
    total: 0,
    byLevel: {},
    matched: 0,
    dropped: 0,
  };
}

export function recordLine(
  state: LineCountState,
  level: string | null,
  matched: boolean
): LineCountState {
  const normLevel = level ? level.toUpperCase() : "UNKNOWN";
  return {
    total: state.total + 1,
    byLevel: {
      ...state.byLevel,
      [normLevel]: (state.byLevel[normLevel] ?? 0) + 1,
    },
    matched: matched ? state.matched + 1 : state.matched,
    dropped: matched ? state.dropped : state.dropped + 1,
  };
}

export function formatLineCount(state: LineCountState): string {
  const lines: string[] = [];
  lines.push(`Total lines  : ${state.total}`);
  lines.push(`Matched      : ${state.matched}`);
  lines.push(`Dropped      : ${state.dropped}`);
  if (Object.keys(state.byLevel).length > 0) {
    lines.push("By level:");
    for (const [level, count] of Object.entries(state.byLevel).sort()) {
      lines.push(`  ${level.padEnd(8)}: ${count}`);
    }
  }
  return lines.join("\n");
}

export function mergeLineCountStates(
  a: LineCountState,
  b: LineCountState
): LineCountState {
  const byLevel: Record<string, number> = { ...a.byLevel };
  for (const [level, count] of Object.entries(b.byLevel)) {
    byLevel[level] = (byLevel[level] ?? 0) + count;
  }
  return {
    total: a.total + b.total,
    byLevel,
    matched: a.matched + b.matched,
    dropped: a.dropped + b.dropped,
  };
}
