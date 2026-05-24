/**
 * Throttle: limits how many lines are emitted per time window.
 * Unlike the rate-limiter (which drops per-key), the throttler
 * enforces a global throughput cap and queues excess lines.
 */

export interface ThrottleOptions {
  /** Maximum lines allowed per window */
  maxLines: number;
  /** Window size in milliseconds */
  windowMs: number;
}

export interface ThrottleState {
  options: ThrottleOptions;
  count: number;
  windowStart: number;
  droppedTotal: number;
}

export function createThrottleState(options: ThrottleOptions): ThrottleState {
  return {
    options,
    count: 0,
    windowStart: Date.now(),
    droppedTotal: 0,
  };
}

/** Returns true if the line should be allowed through, false if throttled. */
export function throttleLine(
  state: ThrottleState,
  now: number = Date.now()
): boolean {
  const elapsed = now - state.windowStart;

  if (elapsed >= state.options.windowMs) {
    state.windowStart = now;
    state.count = 0;
  }

  if (state.count < state.options.maxLines) {
    state.count++;
    return true;
  }

  state.droppedTotal++;
  return false;
}

/** Apply throttling to an array of lines, returning only allowed lines. */
export function throttleLines(
  lines: string[],
  state: ThrottleState,
  now: number = Date.now()
): string[] {
  return lines.filter(() => throttleLine(state, now));
}

/** Human-readable summary of throttle state. */
export function formatThrottleSummary(state: ThrottleState): string {
  return `throttle: ${state.options.maxLines} lines/${state.options.windowMs}ms, dropped=${state.droppedTotal}`;
}
