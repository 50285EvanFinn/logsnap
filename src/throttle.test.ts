import {
  createThrottleState,
  throttleLine,
  throttleLines,
  formatThrottleSummary,
} from "./throttle";

describe("createThrottleState", () => {
  it("initialises with zero count and drops", () => {
    const state = createThrottleState({ maxLines: 5, windowMs: 1000 });
    expect(state.count).toBe(0);
    expect(state.droppedTotal).toBe(0);
  });
});

describe("throttleLine", () => {
  it("allows lines within the limit", () => {
    const state = createThrottleState({ maxLines: 3, windowMs: 1000 });
    const t = 1000;
    expect(throttleLine(state, t)).toBe(true);
    expect(throttleLine(state, t)).toBe(true);
    expect(throttleLine(state, t)).toBe(true);
    expect(state.count).toBe(3);
  });

  it("drops lines exceeding the limit within the window", () => {
    const state = createThrottleState({ maxLines: 2, windowMs: 1000 });
    const t = 2000;
    throttleLine(state, t);
    throttleLine(state, t);
    expect(throttleLine(state, t)).toBe(false);
    expect(state.droppedTotal).toBe(1);
  });

  it("resets the window after windowMs has elapsed", () => {
    const state = createThrottleState({ maxLines: 1, windowMs: 500 });
    throttleLine(state, 1000);
    expect(throttleLine(state, 1000)).toBe(false);
    // New window
    expect(throttleLine(state, 1600)).toBe(true);
    expect(state.count).toBe(1);
  });

  it("accumulates droppedTotal across windows", () => {
    const state = createThrottleState({ maxLines: 1, windowMs: 100 });
    throttleLine(state, 0);
    throttleLine(state, 0); // drop
    throttleLine(state, 200); // new window, allow
    throttleLine(state, 200); // drop
    expect(state.droppedTotal).toBe(2);
  });
});

describe("throttleLines", () => {
  it("filters lines according to the throttle limit", () => {
    const state = createThrottleState({ maxLines: 2, windowMs: 1000 });
    const lines = ["a", "b", "c", "d"];
    const result = throttleLines(lines, state, 5000);
    expect(result).toEqual(["a", "b"]);
    expect(state.droppedTotal).toBe(2);
  });

  it("returns all lines when under the limit", () => {
    const state = createThrottleState({ maxLines: 10, windowMs: 1000 });
    const lines = ["x", "y", "z"];
    expect(throttleLines(lines, state, 0)).toEqual(["x", "y", "z"]);
  });
});

describe("formatThrottleSummary", () => {
  it("returns a readable summary string", () => {
    const state = createThrottleState({ maxLines: 5, windowMs: 2000 });
    state.droppedTotal = 7;
    const summary = formatThrottleSummary(state);
    expect(summary).toContain("5 lines/2000ms");
    expect(summary).toContain("dropped=7");
  });
});
