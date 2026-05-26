import {
  parsePrefixOptions,
  validatePrefixOptions,
  describePrefixConfig,
} from "./prefixconfig";

describe("parsePrefixOptions", () => {
  it("parses string prefix and separator", () => {
    const cfg = parsePrefixOptions({ prefix: "[INFO]", separator: ":" });
    expect(cfg.prefix).toBe("[INFO]");
    expect(cfg.separator).toBe(":");
  });

  it("parses boolean includeIndex", () => {
    const cfg = parsePrefixOptions({ includeIndex: true });
    expect(cfg.includeIndex).toBe(true);
  });

  it("parses string includeIndex", () => {
    const cfg = parsePrefixOptions({ includeIndex: "true" });
    expect(cfg.includeIndex).toBe(true);
  });

  it("parses numeric startIndex from string", () => {
    const cfg = parsePrefixOptions({ startIndex: "5" });
    expect(cfg.startIndex).toBe(5);
  });

  it("applies defaults for missing options", () => {
    const cfg = parsePrefixOptions({});
    expect(cfg.prefix).toBe("");
    expect(cfg.separator).toBe(" ");
    expect(cfg.includeIndex).toBe(false);
    expect(cfg.startIndex).toBe(1);
  });
});

describe("validatePrefixOptions", () => {
  it("returns no errors for valid config", () => {
    const cfg = parsePrefixOptions({ prefix: "X", separator: " " });
    expect(validatePrefixOptions(cfg)).toEqual([]);
  });

  it("errors on empty separator", () => {
    const cfg = parsePrefixOptions({ separator: "" });
    const errors = validatePrefixOptions(cfg);
    expect(errors).toContain("separator must be a non-empty string");
  });

  it("errors on negative startIndex", () => {
    const cfg = parsePrefixOptions({ startIndex: -1 });
    const errors = validatePrefixOptions(cfg);
    expect(errors.length).toBeGreaterThan(0);
  });
});

describe("describePrefixConfig", () => {
  it("describes a prefix-only config", () => {
    const cfg = parsePrefixOptions({ prefix: "APP" });
    expect(describePrefixConfig(cfg)).toContain('prefix="APP"');
  });

  it("describes index config", () => {
    const cfg = parsePrefixOptions({ includeIndex: true, startIndex: 0 });
    expect(describePrefixConfig(cfg)).toContain("index");
  });

  it("returns fallback message when nothing configured", () => {
    const cfg = parsePrefixOptions({});
    expect(describePrefixConfig(cfg)).toBe("no prefix configured");
  });
});
