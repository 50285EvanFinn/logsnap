import { sampleLines } from "./sampler";
import { filterLines } from "./filter";
import { formatLines } from "./formatter";

describe("pipeline: filter -> sample -> format", () => {
  const rawLines = [
    "[INFO] 2024-01-01T00:00:00Z service started",
    "[ERROR] 2024-01-01T00:00:01Z connection refused",
    "[INFO] 2024-01-01T00:00:02Z request received",
    "[WARN] 2024-01-01T00:00:03Z slow query detected",
    "[INFO] 2024-01-01T00:00:04Z request completed",
    "[ERROR] 2024-01-01T00:00:05Z timeout",
    "[INFO] 2024-01-01T00:00:06Z cache hit",
    "[INFO] 2024-01-01T00:00:07Z cache miss",
  ];

  it("keeps all lines when sampling at rate 1.0", () => {
    const filtered = filterLines(rawLines, { pattern: "INFO" });
    const sampled = sampleLines(filtered, { rate: 1.0, seed: 1 });
    expect(sampled.length).toBe(filtered.length);
  });

  it("reduces line count when sampling at rate 0.5", () => {
    const big = Array.from({ length: 200 }, (_, i) => `[INFO] line ${i}`);
    const sampled = sampleLines(big, { rate: 0.5, seed: 42 });
    // With 200 lines at 50% we expect roughly 100; allow ±40 for randomness
    expect(sampled.length).toBeGreaterThan(60);
    expect(sampled.length).toBeLessThan(140);
  });

  it("produces formatted output after sampling", () => {
    const sampled = sampleLines(rawLines, { rate: 1.0, seed: 0 });
    const formatted = formatLines(sampled);
    expect(formatted.length).toBe(sampled.length);
    formatted.forEach((line) => expect(typeof line).toBe("string"));
  });

  it("deterministic seed produces stable pipeline output", () => {
    const run = () =>
      sampleLines(rawLines, { rate: 0.5, seed: 77 }).join("\n");
    expect(run()).toBe(run());
  });

  it("minLines guarantees minimum output even at rate 0", () => {
    const sampled = sampleLines(rawLines, {
      rate: 0.0,
      seed: 1,
      minLines: 3,
    });
    expect(sampled.length).toBe(3);
  });
});
