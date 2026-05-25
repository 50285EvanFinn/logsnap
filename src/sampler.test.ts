import {
  createSamplerState,
  shouldSampleLine,
  sampleLines,
  formatSamplerSummary,
} from "./sampler";
import { buildSamplerConfig } from "./samplerconfig";

describe("buildSamplerConfig", () => {
  it("defaults to rate 1.0", () => {
    const cfg = buildSamplerConfig({});
    expect(cfg.rate).toBe(1.0);
  });

  it("throws on rate out of range", () => {
    expect(() => buildSamplerConfig({ rate: 1.5 })).toThrow(RangeError);
    expect(() => buildSamplerConfig({ rate: -0.1 })).toThrow(RangeError);
  });
});

describe("createSamplerState", () => {
  it("initialises counters to zero", () => {
    const state = createSamplerState({ rate: 0.5, seed: 42 });
    expect(state.seen).toBe(0);
    expect(state.kept).toBe(0);
  });
});

describe("shouldSampleLine", () => {
  it("keeps all lines at rate 1.0", () => {
    let state = createSamplerState({ rate: 1.0, seed: 1 });
    for (let i = 0; i < 20; i++) {
      const { keep, nextState } = shouldSampleLine(state);
      expect(keep).toBe(true);
      state = nextState;
    }
    expect(state.kept).toBe(20);
  });

  it("drops all lines at rate 0.0 after minLines", () => {
    let state = createSamplerState({ rate: 0.0, seed: 1, minLines: 0 });
    for (let i = 0; i < 10; i++) {
      const { keep, nextState } = shouldSampleLine(state);
      expect(keep).toBe(false);
      state = nextState;
    }
  });

  it("always keeps at least minLines", () => {
    let state = createSamplerState({ rate: 0.0, seed: 7, minLines: 3 });
    const results: boolean[] = [];
    for (let i = 0; i < 6; i++) {
      const { keep, nextState } = shouldSampleLine(state);
      results.push(keep);
      state = nextState;
    }
    expect(results.slice(0, 3).every(Boolean)).toBe(true);
    expect(results.slice(3).every((v) => !v)).toBe(true);
  });
});

describe("sampleLines", () => {
  it("returns all lines at rate 1", () => {
    const lines = ["a", "b", "c"];
    expect(sampleLines(lines, { rate: 1.0, seed: 0 })).toEqual(lines);
  });

  it("returns no lines at rate 0 with no minLines", () => {
    const lines = ["a", "b", "c"];
    expect(sampleLines(lines, { rate: 0.0, seed: 0 })).toEqual([]);
  });

  it("is deterministic with same seed", () => {
    const lines = Array.from({ length: 50 }, (_, i) => `line ${i}`);
    const r1 = sampleLines(lines, { rate: 0.5, seed: 99 });
    const r2 = sampleLines(lines, { rate: 0.5, seed: 99 });
    expect(r1).toEqual(r2);
  });
});

describe("formatSamplerSummary", () => {
  it("formats correctly", () => {
    let state = createSamplerState({ rate: 1.0, seed: 0 });
    ["x", "y"].forEach(() => {
      const { nextState } = shouldSampleLine(state);
      state = nextState;
    });
    const summary = formatSamplerSummary(state);
    expect(summary).toContain("2/2");
    expect(summary).toContain("rate 1");
  });

  it("handles zero seen", () => {
    const state = createSamplerState({ rate: 0.5, seed: 0 });
    expect(formatSamplerSummary(state)).toContain("0/0");
  });
});
