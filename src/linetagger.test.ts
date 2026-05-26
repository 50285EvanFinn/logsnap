import {
  buildTaggerConfig,
  tagLine,
  tagLines,
  hasTag,
  filterByTag,
  stripTags,
  formatTagged,
} from "./linetagger";
import { parseTaggerOptions, validateTaggerOptions, describeTaggerConfig } from "./taggerconfig";

describe("buildTaggerConfig", () => {
  it("builds a config with defaults", () => {
    const cfg = buildTaggerConfig(["error", "critical"]);
    expect(cfg.tags).toEqual(["error", "critical"]);
    expect(cfg.separator).toBe(",");
    expect(cfg.prefix).toBe("[tag:");
  });

  it("throws on empty tag string", () => {
    expect(() => buildTaggerConfig([""])).toThrow();
  });
});

describe("tagLine", () => {
  const cfg = buildTaggerConfig(["info"]);

  it("produces a tagged line", () => {
    const result = tagLine("hello world", cfg);
    expect(result.original).toBe("hello world");
    expect(result.tags).toEqual(["info"]);
    expect(result.rendered).toBe("[tag:info] hello world");
  });

  it("handles multiple tags", () => {
    const multi = buildTaggerConfig(["a", "b"], "|");
    const result = tagLine("msg", multi);
    expect(result.rendered).toBe("[tag:a]|[tag:b] msg");
  });
});

describe("tagLines", () => {
  it("tags all lines", () => {
    const cfg = buildTaggerConfig(["x"]);
    const results = tagLines(["line1", "line2"], cfg);
    expect(results).toHaveLength(2);
    expect(results[0].rendered).toBe("[tag:x] line1");
  });
});

describe("hasTag / filterByTag", () => {
  const cfg = buildTaggerConfig(["warn"]);
  const tagged = tagLines(["a", "b"], cfg);

  it("detects present tag", () => {
    expect(hasTag(tagged[0], "warn")).toBe(true);
    expect(hasTag(tagged[0], "error")).toBe(false);
  });

  it("filters by tag", () => {
    expect(filterByTag(tagged, "warn")).toHaveLength(2);
    expect(filterByTag(tagged, "nope")).toHaveLength(0);
  });
});

describe("stripTags / formatTagged", () => {
  const cfg = buildTaggerConfig(["t"]);
  const tagged = tagLines(["raw"], cfg);

  it("strips tags to original", () => {
    expect(stripTags(tagged[0])).toBe("raw");
  });

  it("formats all rendered lines", () => {
    expect(formatTagged(tagged)).toEqual(["[tag:t] raw"]);
  });
});

describe("parseTaggerOptions", () => {
  it("parses string tags", () => {
    const cfg = parseTaggerOptions({ tags: "a,b,c" });
    expect(cfg.tags).toEqual(["a", "b", "c"]);
  });

  it("throws when no tags given", () => {
    expect(() => parseTaggerOptions({})).toThrow();
  });
});

describe("validateTaggerOptions", () => {
  it("returns errors for missing tags", () => {
    const errs = validateTaggerOptions({});
    expect(errs.length).toBeGreaterThan(0);
  });

  it("returns no errors for valid options", () => {
    expect(validateTaggerOptions({ tags: ["ok"] })).toHaveLength(0);
  });
});

describe("describeTaggerConfig", () => {
  it("returns a readable description", () => {
    const cfg = buildTaggerConfig(["x", "y"]);
    const desc = describeTaggerConfig(cfg);
    expect(desc).toContain("x");
    expect(desc).toContain("y");
  });
});
