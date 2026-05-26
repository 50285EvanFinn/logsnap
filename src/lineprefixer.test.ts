import {
  buildPrefixConfig,
  prefixLine,
  prefixLines,
  extractPrefixed,
} from "./lineprefixer";

describe("buildPrefixConfig", () => {
  it("returns defaults when no options provided", () => {
    const cfg = buildPrefixConfig();
    expect(cfg.prefix).toBe("");
    expect(cfg.separator).toBe(" ");
    expect(cfg.includeIndex).toBe(false);
    expect(cfg.startIndex).toBe(1);
  });

  it("applies provided options", () => {
    const cfg = buildPrefixConfig({
      prefix: "[APP]",
      separator: "|",
      includeIndex: true,
      startIndex: 0,
    });
    expect(cfg.prefix).toBe("[APP]");
    expect(cfg.separator).toBe("|");
    expect(cfg.includeIndex).toBe(true);
    expect(cfg.startIndex).toBe(0);
  });
});

describe("prefixLine", () => {
  it("prepends prefix to line", () => {
    const cfg = buildPrefixConfig({ prefix: "[APP]" });
    const result = prefixLine("hello world", cfg, 0);
    expect(result.prefixed).toBe("[APP] hello world");
    expect(result.original).toBe("hello world");
  });

  it("includes index when configured", () => {
    const cfg = buildPrefixConfig({ includeIndex: true, startIndex: 1 });
    const result = prefixLine("log line", cfg, 2);
    expect(result.prefixed).toBe("3 log line");
    expect(result.index).toBe(3);
  });

  it("combines prefix and index", () => {
    const cfg = buildPrefixConfig({
      prefix: ">",
      separator: " ",
      includeIndex: true,
      startIndex: 10,
    });
    const result = prefixLine("msg", cfg, 0);
    expect(result.prefixed).toBe("> 10 msg");
  });

  it("returns line unchanged when no prefix or index", () => {
    const cfg = buildPrefixConfig();
    const result = prefixLine("bare line", cfg, 0);
    expect(result.prefixed).toBe("bare line");
  });
});

describe("prefixLines", () => {
  it("prefixes all lines", () => {
    const cfg = buildPrefixConfig({ prefix: "LOG" });
    const results = prefixLines(["a", "b", "c"], cfg);
    expect(results).toHaveLength(3);
    expect(results[0].prefixed).toBe("LOG a");
    expect(results[2].prefixed).toBe("LOG c");
  });

  it("returns empty array for empty input", () => {
    const cfg = buildPrefixConfig({ prefix: "X" });
    expect(prefixLines([], cfg)).toEqual([]);
  });
});

describe("extractPrefixed", () => {
  it("extracts prefixed strings from results", () => {
    const cfg = buildPrefixConfig({ prefix: "[T]" });
    const results = prefixLines(["line1", "line2"], cfg);
    expect(extractPrefixed(results)).toEqual(["[T] line1", "[T] line2"]);
  });
});
