import {
  buildSamplerConfig,
  validateSamplerConfig,
  DEFAULT_SAMPLER_CONFIG,
} from "./samplerconfig";

describe("DEFAULT_SAMPLER_CONFIG", () => {
  it("has rate 1.0", () => {
    expect(DEFAULT_SAMPLER_CONFIG.rate).toBe(1.0);
  });

  it("has minLines 0", () => {
    expect(DEFAULT_SAMPLER_CONFIG.minLines).toBe(0);
  });
});

describe("buildSamplerConfig", () => {
  it("merges partial config over defaults", () => {
    const cfg = buildSamplerConfig({ rate: 0.25, seed: 7 });
    expect(cfg.rate).toBe(0.25);
    expect(cfg.seed).toBe(7);
    expect(cfg.minLines).toBe(0);
  });

  it("accepts boundary values 0 and 1", () => {
    expect(() => buildSamplerConfig({ rate: 0 })).not.toThrow();
    expect(() => buildSamplerConfig({ rate: 1 })).not.toThrow();
  });

  it("throws for rate > 1", () => {
    expect(() => buildSamplerConfig({ rate: 2 })).toThrow();
  });

  it("throws for rate < 0", () => {
    expect(() => buildSamplerConfig({ rate: -1 })).toThrow();
  });
});

describe("validateSamplerConfig", () => {
  it("returns empty array for valid config", () => {
    const errors = validateSamplerConfig({ rate: 0.5, minLines: 2 });
    expect(errors).toHaveLength(0);
  });

  it("returns error for invalid rate", () => {
    const errors = validateSamplerConfig({ rate: 1.5 });
    expect(errors.some((e) => e.includes("rate"))).toBe(true);
  });

  it("returns error for negative minLines", () => {
    const errors = validateSamplerConfig({ rate: 0.5, minLines: -1 });
    expect(errors.some((e) => e.includes("minLines"))).toBe(true);
  });

  it("can return multiple errors", () => {
    const errors = validateSamplerConfig({ rate: -0.5, minLines: -1 });
    expect(errors.length).toBeGreaterThanOrEqual(2);
  });
});
