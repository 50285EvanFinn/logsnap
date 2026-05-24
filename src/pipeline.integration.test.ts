/**
 * Integration test: wires throttle + linebuffer together through the
 * existing runPipeline to verify end-to-end flow.
 */
import { runPipeline } from "./pipeline";
import { createThrottleState, throttleLines } from "./throttle";
import {
  createLineBuffer,
  pushLine,
  drainBuffer,
} from "./linebuffer";

const SAMPLE_LINES = [
  "[INFO]  2024-01-01T00:00:00Z service started",
  "[DEBUG] 2024-01-01T00:00:01Z connection attempt",
  "[ERROR] 2024-01-01T00:00:02Z failed to connect",
  "[INFO]  2024-01-01T00:00:03Z retrying",
  "[WARN]  2024-01-01T00:00:04Z slow response",
  "[INFO]  2024-01-01T00:00:05Z success",
];

describe("throttle + linebuffer integration", () => {
  it("throttles input and stores allowed lines in a buffer", () => {
    const state = createThrottleState({ maxLines: 3, windowMs: 10_000 });
    const buf = createLineBuffer(10);
    const now = Date.now();

    const allowed = throttleLines(SAMPLE_LINES, state, now);
    allowed.forEach((l) => pushLine(buf, l));

    expect(allowed).toHaveLength(3);
    expect(state.droppedTotal).toBe(3);
    expect(drainBuffer(buf)).toEqual(allowed);
  });

  it("buffer retains only the last N lines when overfilled", () => {
    const state = createThrottleState({ maxLines: 100, windowMs: 10_000 });
    const buf = createLineBuffer(4);
    const now = Date.now();

    const allowed = throttleLines(SAMPLE_LINES, state, now);
    allowed.forEach((l) => pushLine(buf, l));

    const result = drainBuffer(buf);
    expect(result).toHaveLength(4);
    expect(result[result.length - 1]).toBe(SAMPLE_LINES[SAMPLE_LINES.length - 1]);
  });

  it("runPipeline still processes lines independently", () => {
    const output = runPipeline(SAMPLE_LINES, { filter: "ERROR" });
    expect(output.some((l) => l.includes("ERROR"))).toBe(true);
    expect(output.every((l) => l.includes("ERROR"))).toBe(true);
  });
});
