import { describe, it, expect } from "vitest";
import {
  parseLine,
  parseLines,
  parseLevel,
  parseTimestamp,
  parseSource,
  parseMessage,
} from "./lineparser";

describe("parseLevel", () => {
  it("extracts ERROR level", () => {
    expect(parseLevel("2024-01-01T00:00:00Z ERROR something failed")).toBe("ERROR");
  });

  it("extracts INFO level case-insensitively", () => {
    expect(parseLevel("info: server started")).toBe("INFO");
  });

  it("returns null when no level found", () => {
    expect(parseLevel("just a plain log line")).toBeNull();
  });
});

describe("parseTimestamp", () => {
  it("extracts ISO timestamp", () => {
    expect(parseTimestamp("2024-03-15T12:34:56Z INFO hello")).toBe("2024-03-15T12:34:56Z");
  });

  it("extracts timestamp with space separator", () => {
    expect(parseTimestamp("2024-03-15 12:34:56 DEBUG msg")).toBe("2024-03-15 12:34:56");
  });

  it("returns null when no timestamp", () => {
    expect(parseTimestamp("ERROR no timestamp here")).toBeNull();
  });
});

describe("parseSource", () => {
  it("extracts bracketed source", () => {
    expect(parseSource("[app/server] INFO started")).toBe("app/server");
  });

  it("returns null when no source", () => {
    expect(parseSource("INFO plain line")).toBeNull();
  });
});

describe("parseMessage", () => {
  it("strips timestamp, level, and source", () => {
    const msg = parseMessage("2024-01-01T00:00:00Z [myapp] ERROR connection refused");
    expect(msg).toBe("connection refused");
  });
});

describe("parseLine", () => {
  it("returns a full LogEntry", () => {
    const entry = parseLine("2024-06-01T10:00:00Z [db] WARN slow query detected");
    expect(entry.level).toBe("WARN");
    expect(entry.timestamp).toBe("2024-06-01T10:00:00Z");
    expect(entry.source).toBe("db");
    expect(entry.message).toContain("slow query detected");
    expect(entry.raw).toBe("2024-06-01T10:00:00Z [db] WARN slow query detected");
  });
});

describe("parseLines", () => {
  it("parses multiple lines", () => {
    const results = parseLines(["INFO hello", "ERROR boom"]);
    expect(results).toHaveLength(2);
    expect(results[0].level).toBe("INFO");
    expect(results[1].level).toBe("ERROR");
  });

  it("handles empty array", () => {
    expect(parseLines([])).toEqual([]);
  });
});
