import { createAggregator, aggregateLines } from "./multilineaggregator";

const TIMESTAMP_PATTERN = /^\d{4}-\d{2}-\d{2}/;

describe("createAggregator", () => {
  it("emits a completed entry when a new start line is encountered", () => {
    const agg = createAggregator({ startPattern: TIMESTAMP_PATTERN });
    agg.feed("2024-01-01 INFO hello");
    const result = agg.feed("2024-01-01 ERROR world");
    expect(result).not.toBeNull();
    expect(result!.lines).toEqual(["2024-01-01 INFO hello"]);
  });

  it("groups continuation lines with the preceding start line", () => {
    const agg = createAggregator({ startPattern: TIMESTAMP_PATTERN });
    agg.feed("2024-01-01 ERROR boom");
    agg.feed("  at Object.<anonymous> (app.ts:10)");
    agg.feed("  at Module._compile (node.js:99)");
    const entry = agg.end();
    expect(entry).not.toBeNull();
    expect(entry!.lines).toHaveLength(3);
    expect(entry!.raw).toContain("at Object");
  });

  it("returns null from feed for continuation lines", () => {
    const agg = createAggregator({ startPattern: TIMESTAMP_PATTERN });
    agg.feed("2024-01-01 INFO start");
    const r = agg.feed("    continuation");
    expect(r).toBeNull();
  });

  it("emits standalone entry for non-start line with empty buffer", () => {
    const agg = createAggregator({ startPattern: TIMESTAMP_PATTERN });
    const result = agg.feed("orphan line");
    expect(result).not.toBeNull();
    expect(result!.raw).toBe("orphan line");
  });

  it("respects maxLines limit", () => {
    const agg = createAggregator({ startPattern: TIMESTAMP_PATTERN, maxLines: 3 });
    agg.feed("2024-01-01 INFO start");
    agg.feed("  line 2");
    agg.feed("  line 3");
    agg.feed("  line 4 — should be ignored");
    const entry = agg.end();
    expect(entry!.lines).toHaveLength(3);
  });

  it("end() returns null when buffer is empty", () => {
    const agg = createAggregator({ startPattern: TIMESTAMP_PATTERN });
    expect(agg.end()).toBeNull();
  });
});

describe("aggregateLines", () => {
  it("aggregates multiple log entries with stack traces", () => {
    const lines = [
      "2024-01-01 INFO request received",
      "2024-01-01 ERROR unhandled exception",
      "  at handler (server.ts:42)",
      "  at Layer.handle (router.ts:95)",
      "2024-01-01 INFO request complete",
    ];
    const entries = aggregateLines(lines, { startPattern: TIMESTAMP_PATTERN });
    expect(entries).toHaveLength(3);
    expect(entries[1].lines).toHaveLength(3);
    expect(entries[1].raw).toContain("handler");
  });

  it("returns empty array for empty input", () => {
    expect(aggregateLines([], { startPattern: TIMESTAMP_PATTERN })).toEqual([]);
  });

  it("handles single-line entries", () => {
    const lines = ["2024-01-01 INFO a", "2024-01-01 INFO b"];
    const entries = aggregateLines(lines, { startPattern: TIMESTAMP_PATTERN });
    expect(entries).toHaveLength(2);
    expect(entries[0].lines).toHaveLength(1);
  });
});
