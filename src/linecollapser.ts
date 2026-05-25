/**
 * linecollapser.ts
 * Collapses consecutive repeated or similar lines into a summary entry.
 */

export interface CollapserConfig {
  maxRepeats: number;
  similarityKey?: (line: string) => string;
}

export interface CollapserState {
  config: CollapserConfig;
  lastKey: string | null;
  lastLine: string | null;
  repeatCount: number;
  output: string[];
}

export function createCollapserState(config: Partial<CollapserConfig> = {}): CollapserState {
  return {
    config: {
      maxRepeats: config.maxRepeats ?? 1,
      similarityKey: config.similarityKey,
    },
    lastKey: null,
    lastLine: null,
    repeatCount: 0,
    output: [],
  };
}

function getKey(line: string, keyFn?: (line: string) => string): string {
  return keyFn ? keyFn(line) : line;
}

function flushRepeat(state: CollapserState): void {
  if (state.repeatCount > state.config.maxRepeats && state.lastLine !== null) {
    const suppressed = state.repeatCount - state.config.maxRepeats;
    state.output.push(`[+${suppressed} repeated line(s) collapsed]`);
  }
}

export function feedLine(state: CollapserState, line: string): void {
  const key = getKey(line, state.config.similarityKey);

  if (key === state.lastKey) {
    state.repeatCount += 1;
    if (state.repeatCount <= state.config.maxRepeats) {
      state.output.push(line);
    }
  } else {
    flushRepeat(state);
    state.lastKey = key;
    state.lastLine = line;
    state.repeatCount = 1;
    state.output.push(line);
  }
}

export function finaliseCollapser(state: CollapserState): string[] {
  flushRepeat(state);
  const result = [...state.output];
  state.output = [];
  state.lastKey = null;
  state.lastLine = null;
  state.repeatCount = 0;
  return result;
}

export function collapseLines(lines: string[], config: Partial<CollapserConfig> = {}): string[] {
  const state = createCollapserState(config);
  for (const line of lines) {
    feedLine(state, line);
  }
  return finaliseCollapser(state);
}
