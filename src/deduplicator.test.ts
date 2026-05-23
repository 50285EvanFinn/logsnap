import {
  deduplicateLines,
  formatDeduplicated,
  deduplicateAndFormat,
} from "./deduplicator";

describe("deduplicateLines", () => {
  it("collapses consecutive duplicate lines", () => {
    const lines = ["foo", "foo", "foo", "bar", "bar", "baz"];
    const result = deduplicateLines(lines);
    expect(result).toEqual([
      { line: "foo", count: 3 },
      { line: "bar", count: 2 },
      { line: "baz", count: 1 },
    ]);
  });

  it("does not collapse non-consecutive duplicates", () => {
    const lines = ["foo", "bar", "foo"];
    const result = deduplicateLines(lines);
    expect(result).toHaveLength(3);
    expect(result[0]).toEqual({ line: "foo", count: 1 });
    expect(result[2]).toEqual({ line: "foo", count: 1 });
  });

  it("returns empty array for empty input", () => {
    expect(deduplicateLines([])).toEqual([]);
  });

  it("handles single line input", () => {
    expect(deduplicateLines(["only"])).toEqual([{ line: "only", count: 1 }]);
  });
});

describe("formatDeduplicated", () => {
  it("appends repeat count when count > 1 and showCount is true", () => {
    const entries = [
      { line: "foo", count: 3 },
      { line: "bar", count: 1 },
    ];
    const result = formatDeduplicated(entries, true);
    expect(result[0]).toBe("foo [repeated 3x]");
    expect(result[1]).toBe("bar");
  });

  it("does not append count when showCount is false", () => {
    const entries = [{ line: "foo", count: 5 }];
    const result = formatDeduplicated(entries, false);
    expect(result[0]).toBe("foo");
  });
});

describe("deduplicateAndFormat", () => {
  it("deduplicates and formats in one step", () => {
    const lines = ["hello", "hello", "world"];
    const result = deduplicateAndFormat(lines, { showCount: true });
    expect(result).toEqual(["hello [repeated 2x]", "world"]);
  });

  it("respects showCount: false option", () => {
    const lines = ["a", "a", "b"];
    const result = deduplicateAndFormat(lines, { showCount: false });
    expect(result).toEqual(["a", "b"]);
  });
});
