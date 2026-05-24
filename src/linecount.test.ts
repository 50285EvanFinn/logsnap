import {
  createLineCountState,
  recordLine,
  formatLineCount,
  mergeLineCountStates,
} from "./linecount";

describe("createLineCountState", () => {
  it("returns zeroed state", () => {
    const state = createLineCountState();
    expect(state.total).toBe(0);
    expect(state.matched).toBe(0);
    expect(state.dropped).toBe(0);
    expect(state.byLevel).toEqual({});
  });
});

describe("recordLine", () => {
  it("increments total on each call", () => {
    let state = createLineCountState();
    state = recordLine(state, "info", true);
    state = recordLine(state, "error", false);
    expect(state.total).toBe(2);
  });

  it("tracks matched and dropped separately", () => {
    let state = createLineCountState();
    state = recordLine(state, "info", true);
    state = recordLine(state, "debug", false);
    state = recordLine(state, "warn", true);
    expect(state.matched).toBe(2);
    expect(state.dropped).toBe(1);
  });

  it("normalises level to uppercase", () => {
    let state = createLineCountState();
    state = recordLine(state, "info", true);
    state = recordLine(state, "INFO", true);
    expect(state.byLevel["INFO"]).toBe(2);
  });

  it("uses UNKNOWN for null level", () => {
    let state = createLineCountState();
    state = recordLine(state, null, true);
    expect(state.byLevel["UNKNOWN"]).toBe(1);
  });

  it("does not mutate original state", () => {
    const original = createLineCountState();
    recordLine(original, "info", true);
    expect(original.total).toBe(0);
  });
});

describe("formatLineCount", () => {
  it("includes total, matched and dropped", () => {
    let state = createLineCountState();
    state = recordLine(state, "info", true);
    state = recordLine(state, "error", false);
    const output = formatLineCount(state);
    expect(output).toContain("Total lines  : 2");
    expect(output).toContain("Matched      : 1");
    expect(output).toContain("Dropped      : 1");
  });

  it("includes per-level breakdown", () => {
    let state = createLineCountState();
    state = recordLine(state, "warn", true);
    const output = formatLineCount(state);
    expect(output).toContain("WARN");
  });
});

describe("mergeLineCountStates", () => {
  it("sums totals from both states", () => {
    let a = createLineCountState();
    let b = createLineCountState();
    a = recordLine(a, "info", true);
    b = recordLine(b, "error", false);
    const merged = mergeLineCountStates(a, b);
    expect(merged.total).toBe(2);
    expect(merged.matched).toBe(1);
    expect(merged.dropped).toBe(1);
  });

  it("merges byLevel counts", () => {
    let a = createLineCountState();
    let b = createLineCountState();
    a = recordLine(a, "info", true);
    b = recordLine(b, "info", true);
    const merged = mergeLineCountStates(a, b);
    expect(merged.byLevel["INFO"]).toBe(2);
  });
});
