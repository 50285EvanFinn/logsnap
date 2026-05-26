import {
  buildScorerConfig,
  scoreLine,
  scoreLines,
  topScoredLines,
} from "./linescorer";
import {
  parseScorerOptions,
  validateScorerOptions,
  describeScorerConfig,
} from "./scorerconfig";

describe("buildScorerConfig", () => {
  it("returns defaults when called with no args", () => {
    const cfg = buildScorerConfig();
    expect(cfg.keywords).toEqual([]);
    expect(cfg.levelWeights["error"]).toBe(10);
    expect(cfg.boostRecent).toBe(false);
  });

  it("merges provided levelWeights over defaults", () => {
    const cfg = buildScorerConfig({ levelWeights: { error: 20 } });
    expect(cfg.levelWeights["error"]).toBe(20);
    expect(cfg.levelWeights["warn"]).toBe(5);
  });
});

describe("scoreLine", () => {
  const cfg = buildScorerConfig({
    keywords: [{ word: "timeout", weight: 7 }],
  });

  it("scores keyword match", () => {
    const result = scoreLine("connection timeout occurred", cfg, 0, 1);
    expect(result.score).toBeGreaterThanOrEqual(7);
    expect(result.reasons.some((r) => r.startsWith("keyword:timeout"))).toBe(true);
  });

  it("scores level match", () => {
    const result = scoreLine("[ERROR] something broke", cfg, 0, 1);
    expect(result.score).toBeGreaterThanOrEqual(10);
    expect(result.reasons.some((r) => r.startsWith("level:error"))).toBe(true);
  });

  it("returns zero score for unmatched line", () => {
    const result = scoreLine("all systems nominal", cfg, 0, 1);
    expect(result.score).toBe(0);
  });

  it("applies recency boost when boostRecent is true", () => {
    const cfg2 = buildScorerConfig({ boostRecent: true });
    const last = scoreLine("plain line", cfg2, 4, 5);
    const first = scoreLine("plain line", cfg2, 0, 5);
    expect(last.score).toBeGreaterThan(first.score);
  });
});

describe("topScoredLines", () => {
  it("returns top N lines by score", () => {
    const cfg = buildScorerConfig({ keywords: [{ word: "error", weight: 5 }] });
    const scored = scoreLines(["ok", "error here", "also error", "fine"], cfg);
    const top = topScoredLines(scored, 2);
    expect(top).toHaveLength(2);
    expect(top[0].score).toBeGreaterThanOrEqual(top[1].score);
  });
});

describe("parseScorerOptions", () => {
  it("parses keyword string", () => {
    const cfg = parseScorerOptions({ keywords: "exception:8,timeout:6" });
    expect(cfg.keywords).toContainEqual({ word: "exception", weight: 8 });
    expect(cfg.keywords).toContainEqual({ word: "timeout", weight: 6 });
  });

  it("defaults weight to 1 if omitted", () => {
    const cfg = parseScorerOptions({ keywords: "crash" });
    expect(cfg.keywords[0].weight).toBe(1);
  });
});

describe("validateScorerOptions", () => {
  it("returns no errors for valid options", () => {
    expect(validateScorerOptions({ keywords: "foo:3,bar:2" })).toHaveLength(0);
  });

  it("reports invalid weight", () => {
    const errs = validateScorerOptions({ keywords: "foo:abc" });
    expect(errs.length).toBeGreaterThan(0);
  });
});

describe("describeScorerConfig", () => {
  it("produces a readable description", () => {
    const cfg = buildScorerConfig({ keywords: [{ word: "err", weight: 4 }], boostRecent: true });
    const desc = describeScorerConfig(cfg);
    expect(desc).toContain("err:4");
    expect(desc).toContain("boostRecent=true");
  });
});
