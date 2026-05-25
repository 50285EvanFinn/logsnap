import {
  createLineSplitterState,
  feedChunk,
  flushSplitter,
  splitLines,
  resetSplitter,
} from "./linesplitter";

describe("createLineSplitterState", () => {
  it("initialises with empty remainder", () => {
    const state = createLineSplitterState();
    expect(state.remainder).toBe("");
  });
});

describe("feedChunk", () => {
  it("returns complete lines and stores partial remainder", () => {
    const state = createLineSplitterState();
    const lines = feedChunk(state, "hello\nworld\npar");
    expect(lines).toEqual(["hello", "world"]);
    expect(state.remainder).toBe("par");
  });

  it("combines remainder with next chunk", () => {
    const state = createLineSplitterState();
    feedChunk(state, "hel");
    const lines = feedChunk(state, "lo\nworld\n");
    expect(lines).toEqual(["hello", "world"]);
    expect(state.remainder).toBe("");
  });

  it("returns empty array when chunk has no complete lines", () => {
    const state = createLineSplitterState();
    const lines = feedChunk(state, "partial");
    expect(lines).toEqual([]);
    expect(state.remainder).toBe("partial");
  });

  it("handles chunk that is only a newline", () => {
    const state = createLineSplitterState();
    feedChunk(state, "abc");
    const lines = feedChunk(state, "\n");
    expect(lines).toEqual(["abc"]);
    expect(state.remainder).toBe("");
  });

  it("filters out empty lines produced by consecutive newlines", () => {
    const state = createLineSplitterState();
    const lines = feedChunk(state, "a\n\nb\n");
    expect(lines).toEqual(["a", "b"]);
  });
});

describe("flushSplitter", () => {
  it("returns remaining partial line and clears state", () => {
    const state = createLineSplitterState();
    feedChunk(state, "no newline here");
    const flushed = flushSplitter(state);
    expect(flushed).toEqual(["no newline here"]);
    expect(state.remainder).toBe("");
  });

  it("returns empty array when remainder is empty", () => {
    const state = createLineSplitterState();
    expect(flushSplitter(state)).toEqual([]);
  });
});

describe("splitLines", () => {
  it("splits a complete string into lines", () => {
    expect(splitLines("a\nb\nc\n")).toEqual(["a", "b", "c"]);
  });

  it("filters empty lines", () => {
    expect(splitLines("a\n\nb")).toEqual(["a", "b"]);
  });

  it("returns empty array for empty string", () => {
    expect(splitLines("")).toEqual([]);
  });
});

describe("resetSplitter", () => {
  it("clears the remainder without returning it", () => {
    const state = createLineSplitterState();
    feedChunk(state, "partial");
    resetSplitter(state);
    expect(state.remainder).toBe("");
  });
});
