import {
  createLineBuffer,
  pushLine,
  drainBuffer,
  clearBuffer,
  bufferSize,
} from "./linebuffer";

describe("createLineBuffer", () => {
  it("creates an empty buffer with the given capacity", () => {
    const buf = createLineBuffer(5);
    expect(buf.capacity).toBe(5);
    expect(buf.lines).toHaveLength(0);
    expect(buf.total).toBe(0);
  });

  it("throws for capacity < 1", () => {
    expect(() => createLineBuffer(0)).toThrow(RangeError);
  });
});

describe("pushLine + drainBuffer", () => {
  it("returns lines in insertion order when under capacity", () => {
    const buf = createLineBuffer(5);
    pushLine(buf, "a");
    pushLine(buf, "b");
    pushLine(buf, "c");
    expect(drainBuffer(buf)).toEqual(["a", "b", "c"]);
  });

  it("overwrites oldest lines when at capacity", () => {
    const buf = createLineBuffer(3);
    ["a", "b", "c", "d"].forEach((l) => pushLine(buf, l));
    expect(drainBuffer(buf)).toEqual(["b", "c", "d"]);
  });

  it("handles exactly capacity lines", () => {
    const buf = createLineBuffer(3);
    ["x", "y", "z"].forEach((l) => pushLine(buf, l));
    expect(drainBuffer(buf)).toEqual(["x", "y", "z"]);
  });

  it("tracks total lines written beyond capacity", () => {
    const buf = createLineBuffer(2);
    ["1", "2", "3", "4", "5"].forEach((l) => pushLine(buf, l));
    expect(buf.total).toBe(5);
    expect(drainBuffer(buf)).toEqual(["4", "5"]);
  });
});

describe("clearBuffer", () => {
  it("resets the buffer to empty", () => {
    const buf = createLineBuffer(4);
    pushLine(buf, "hello");
    clearBuffer(buf);
    expect(bufferSize(buf)).toBe(0);
    expect(buf.total).toBe(0);
    expect(drainBuffer(buf)).toEqual([]);
  });
});

describe("bufferSize", () => {
  it("reflects the number of lines currently held", () => {
    const buf = createLineBuffer(10);
    expect(bufferSize(buf)).toBe(0);
    pushLine(buf, "a");
    pushLine(buf, "b");
    expect(bufferSize(buf)).toBe(2);
    // Overfill — size stays capped at capacity
    for (let i = 0; i < 20; i++) pushLine(buf, String(i));
    expect(bufferSize(buf)).toBe(10);
  });
});
