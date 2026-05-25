import {
  buildMaskerConfig,
  maskLine,
  maskLines,
  countMasked,
  formatMaskSummary,
} from "./linemasker";
import { parseMaskerOptions, validateMaskerOptions } from "./maskconfig";

describe("buildMaskerConfig", () => {
  it("creates config with string pattern", () => {
    const cfg = buildMaskerConfig(["secret"]);
    expect(cfg.rules).toHaveLength(1);
    expect(cfg.defaultMask).toBe("****");
  });

  it("creates config with custom mask", () => {
    const cfg = buildMaskerConfig([/token/gi], "[HIDDEN]");
    expect(cfg.defaultMask).toBe("[HIDDEN]");
  });
});

describe("maskLine", () => {
  it("replaces matching substring", () => {
    const cfg = buildMaskerConfig([/password=\S+/g]);
    const result = maskLine("login password=abc123 ok", cfg);
    expect(result).toBe("login **** ok");
  });

  it("returns line unchanged when no match", () => {
    const cfg = buildMaskerConfig([/secret/g]);
    expect(maskLine("nothing here", cfg)).toBe("nothing here");
  });

  it("applies multiple rules", () => {
    const cfg = buildMaskerConfig([/foo/g, /bar/g], "X");
    expect(maskLine("foo and bar", cfg)).toBe("X and X");
  });

  it("resets lastIndex between calls (global regex safety)", () => {
    const cfg = buildMaskerConfig([/\d+/g]);
    expect(maskLine("line 1", cfg)).toBe("line ****");
    expect(maskLine("line 2", cfg)).toBe("line ****");
  });
});

describe("maskLines", () => {
  it("masks all lines", () => {
    const cfg = buildMaskerConfig([/secret/g]);
    const out = maskLines(["no secret here", "clean line"], cfg);
    expect(out[0]).toBe("no **** here");
    expect(out[1]).toBe("clean line");
  });
});

describe("countMasked", () => {
  it("counts only changed lines", () => {
    const cfg = buildMaskerConfig([/token/g]);
    const n = countMasked(["has token", "no match", "another token"], cfg);
    expect(n).toBe(2);
  });
});

describe("formatMaskSummary", () => {
  it("formats summary string", () => {
    expect(formatMaskSummary(10, 3)).toBe("Masked 3 of 10 line(s).");
  });
});

describe("parseMaskerOptions", () => {
  it("resolves built-in ipv4 pattern", () => {
    const cfg = parseMaskerOptions({ patterns: ["ipv4"] });
    const out = maskLine("connect from 192.168.1.1 ok", cfg);
    expect(out).toBe("connect from **** ok");
  });

  it("uses custom mask", () => {
    const cfg = parseMaskerOptions({ patterns: ["email"], mask: "[EMAIL]" });
    const out = maskLine("user: test@example.com", cfg);
    expect(out).toBe("user: [EMAIL]");
  });
});

describe("validateMaskerOptions", () => {
  it("returns error for empty mask", () => {
    const errs = validateMaskerOptions({ mask: "" });
    expect(errs).toContain("mask must not be an empty string");
  });

  it("returns error for invalid regex", () => {
    const errs = validateMaskerOptions({ patterns: ["[invalid"] });
    expect(errs.length).toBeGreaterThan(0);
  });

  it("returns no errors for valid options", () => {
    const errs = validateMaskerOptions({ patterns: ["jwt"], mask: "***" });
    expect(errs).toHaveLength(0);
  });
});
