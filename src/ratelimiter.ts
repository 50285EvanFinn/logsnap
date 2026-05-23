/**
 * Rate limiter: suppresses bursts of log lines exceeding a given rate.
 */

export interface RateLimiterOptions {
  /** Maximum number of lines allowed per window */
  maxLines: number;
  /** Window size in milliseconds */
  windowMs: number;
  /** Message to insert when lines are suppressed */
  suppressMessage?: string;
}

export interface RateLimiterState {
  count: number;
  windowStart: number;
  suppressed: number;
}

export function createRateLimiterState(): RateLimiterState {
  return { count: 0, windowStart: Date.now(), suppressed: 0 };
}

/**
 * Determines whether a line should be emitted given current rate-limiter state.
 * Mutates state in place. Returns the line to emit, a suppression notice, or null.
 */
export function rateLimitLine(
  line: string,
  state: RateLimiterState,
  options: RateLimiterOptions,
  now: number = Date.now()
): string | null {
  const { maxLines, windowMs, suppressMessage = "[logsnap] burst suppressed" } =
    options;

  const elapsed = now - state.windowStart;

  if (elapsed >= windowMs) {
    // New window: flush suppression notice if needed, then reset
    const notice =
      state.suppressed > 0
        ? `${suppressMessage} (${state.suppressed} lines hidden)`
        : null;
    state.count = 1;
    state.windowStart = now;
    state.suppressed = 0;
    // Emit notice first by returning it; caller should re-call for the actual line
    if (notice) return notice;
    return line;
  }

  if (state.count < maxLines) {
    state.count += 1;
    return line;
  }

  state.suppressed += 1;
  return null;
}
