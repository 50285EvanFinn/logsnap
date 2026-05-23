import { applyContextWindow, formatContextResults } from "./contextwindow";

const lines = [
  "line 0: debug start",
  "line 1: info something",
  "line 2: ERROR occurred",
  "line 3: info after error",
  "line 4: debug continue",
  "line 5: info all good",
  "line 6: ERROR again",
  "line 7: info recovery",
  "line 8: debug end",
];

const isError = (line: string) => line.includes("ERROR");

describe("applyContextWindow", () => {
  it("returns only match lines when before=0 and after=0", () => {
    const results = applyContextWindow(lines, isError, { before: 0, after: 0 });
    expect(results).toHaveLength(2);
    expect(results[0].line).toContain("ERROR occurred");
    expect(results[1].line).toContain("ERROR again");
    expect(results.every((r) => r.isMatch)).toBe(true);
  });

  it("includes lines before match", () => {
    const results = applyContextWindow(lines, isError, { before: 1, after: 0 });
    const indices = results.map((r) => r.lineIndex);
    expect(indices).toContain(1); // before line 2
    expect(indices).toContain(2); // match
    expect(indices).toContain(5); // before line 6
    expect(indices).toContain(6); // match
  });

  it("includes lines after match", () => {
    const results = applyContextWindow(lines, isError, { before: 0, after: 1 });
    const indices = results.map((r) => r.lineIndex);
    expect(indices).toContain(2);
    expect(indices).toContain(3); // after line 2
    expect(indices).toContain(6);
    expect(indices).toContain(7); // after line 6
  });

  it("merges overlapping context windows", () => {
    const results = applyContextWindow(lines, isError, { before: 2, after: 2 });
    const indices = results.map((r) => r.lineIndex);
    // lines 0-4 from first match, 4-8 from second => merged
    expect(indices).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8]);
  });

  it("does not exceed array bounds", () => {
    const results = applyContextWindow(lines, isError, { before: 20, after: 20 });
    const indices = results.map((r) => r.lineIndex);
    expect(Math.min(...indices)).toBe(0);
    expect(Math.max(...indices)).toBe(lines.length - 1);
  });

  it("returns empty when no matches", () => {
    const results = applyContextWindow(lines, () => false, { before: 2, after: 2 });
    expect(results).toHaveLength(0);
  });

  it("marks isMatch correctly", () => {
    const results = applyContextWindow(lines, isError, { before: 1, after: 1 });
    const matchLines = results.filter((r) => r.isMatch).map((r) => r.line);
    expect(matchLines).toHaveLength(2);
    matchLines.forEach((l) => expect(l).toContain("ERROR"));
  });
});

describe("formatContextResults", () => {
  it("inserts -- separator between non-consecutive groups", () => {
    const results = applyContextWindow(lines, isError, { before: 0, after: 0 });
    const formatted = formatContextResults(results);
    expect(formatted).toContain("--");
    expect(formatted[0]).toContain("ERROR occurred");
    expect(formatted[2]).toContain("ERROR again");
  });

  it("does not insert separator for consecutive lines", () => {
    const results = applyContextWindow(lines, isError, { before: 2, after: 2 });
    const formatted = formatContextResults(results);
    expect(formatted).not.toContain("--");
  });

  it("returns plain strings", () => {
    const results = applyContextWindow(lines, isError, { before: 1, after: 1 });
    const formatted = formatContextResults(results);
    formatted.filter((l) => l !== "--").forEach((l) => expect(typeof l).toBe("string"));
  });
});
