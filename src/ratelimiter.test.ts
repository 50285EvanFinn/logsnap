import {
  createRateLimiterState,
  rateLimitLine,
  RateLimiterOptions,
} from "./ratelimiter";

const opts: RateLimiterOptions = {
  maxLines: 3,
  windowMs: 1000,
  suppressMessage: "[suppressed]",
};

describe("rateLimitLine", () => {
  it("allows lines within the limit", () => {
    const state = createRateLimiterState();
    const now = state.windowStart;
    expect(rateLimitLine("line1", state, opts, now)).toBe("line1");
    expect(rateLimitLine("line2", state, opts, now)).toBe("line2");
    expect(rateLimitLine("line3", state, opts, now)).toBe("line3");
  });

  it("suppresses lines exceeding the limit", () => {
    const state = createRateLimiterState();
    const now = state.windowStart;
    rateLimitLine("line1", state, opts, now);
    rateLimitLine("line2", state, opts, now);
    rateLimitLine("line3", state, opts, now);
    const result = rateLimitLine("line4", state, opts, now);
    expect(result).toBeNull();
    expect(state.suppressed).toBe(1);
  });

  it("resets after the window expires and emits suppression notice", () => {
    const state = createRateLimiterState();
    const now = state.windowStart;
    rateLimitLine("line1", state, opts, now);
    rateLimitLine("line2", state, opts, now);
    rateLimitLine("line3", state, opts, now);
    rateLimitLine("line4", state, opts, now); // suppressed

    const later = now + 1500;
    const notice = rateLimitLine("line5", state, opts, later);
    expect(notice).toContain("[suppressed]");
    expect(notice).toContain("1 lines hidden");
    expect(state.suppressed).toBe(0);
    expect(state.count).toBe(1);
  });

  it("allows lines freely after window reset with no suppressed", () => {
    const state = createRateLimiterState();
    const now = state.windowStart;
    rateLimitLine("line1", state, opts, now);

    const later = now + 2000;
    const result = rateLimitLine("newline", state, opts, later);
    expect(result).toBe("newline");
  });

  it("initialises state correctly", () => {
    const state = createRateLimiterState();
    expect(state.count).toBe(0);
    expect(state.suppressed).toBe(0);
  });
});
