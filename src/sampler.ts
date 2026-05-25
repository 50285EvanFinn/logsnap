import { SamplerConfig, buildSamplerConfig } from "./samplerconfig";

export interface SamplerState {
  config: SamplerConfig;
  seen: number;
  kept: number;
  pseudoRandState: number;
}

function lcg(state: number): number {
  // Linear congruential generator for deterministic pseudo-random numbers
  return (state * 1664525 + 1013904223) & 0xffffffff;
}

export function createSamplerState(
  partial: Partial<SamplerConfig> = {}
): SamplerState {
  const config = buildSamplerConfig(partial);
  return {
    config,
    seen: 0,
    kept: 0,
    pseudoRandState: config.seed ?? Date.now(),
  };
}

export function shouldSampleLine(state: SamplerState): {
  keep: boolean;
  nextState: SamplerState;
} {
  const minLines = state.config.minLines ?? 0;
  const newSeen = state.seen + 1;

  if (state.kept < minLines) {
    return {
      keep: true,
      nextState: { ...state, seen: newSeen, kept: state.kept + 1 },
    };
  }

  const nextRand = lcg(state.pseudoRandState);
  const normalised = (nextRand >>> 0) / 0xffffffff;
  const keep = normalised < state.config.rate;

  return {
    keep,
    nextState: {
      ...state,
      seen: newSeen,
      kept: keep ? state.kept + 1 : state.kept,
      pseudoRandState: nextRand,
    },
  };
}

export function sampleLines(
  lines: string[],
  partial: Partial<SamplerConfig> = {}
): string[] {
  let state = createSamplerState(partial);
  const result: string[] = [];
  for (const line of lines) {
    const { keep, nextState } = shouldSampleLine(state);
    state = nextState;
    if (keep) result.push(line);
  }
  return result;
}

export function formatSamplerSummary(state: SamplerState): string {
  const pct =
    state.seen === 0
      ? "0.00"
      : ((state.kept / state.seen) * 100).toFixed(2);
  return `sampler: kept ${state.kept}/${state.seen} lines (${pct}%) at rate ${state.config.rate}`;
}
