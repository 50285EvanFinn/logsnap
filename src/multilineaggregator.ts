/**
 * Aggregates multi-line log entries (e.g. stack traces) into single logical units.
 * A new entry begins when a line matches the `startPattern`.
 * Subsequent lines that do NOT match `startPattern` are considered continuations.
 */

export interface AggregatorOptions {
  /** Regex that marks the start of a new log entry */
  startPattern: RegExp;
  /** Maximum number of lines to include in a single aggregated entry */
  maxLines?: number;
}

export interface AggregatedEntry {
  lines: string[];
  raw: string;
}

export function createAggregator(options: AggregatorOptions) {
  const { startPattern, maxLines = 100 } = options;
  let buffer: string[] = [];

  function flush(): AggregatedEntry | null {
    if (buffer.length === 0) return null;
    const entry: AggregatedEntry = {
      lines: [...buffer],
      raw: buffer.join("\n"),
    };
    buffer = [];
    return entry;
  }

  function feed(line: string): AggregatedEntry | null {
    const isStart = startPattern.test(line);

    if (isStart) {
      const completed = flush();
      buffer.push(line);
      return completed;
    }

    if (buffer.length > 0) {
      if (buffer.length < maxLines) {
        buffer.push(line);
      }
      return null;
    }

    // No current buffer and line is not a start — emit as standalone
    return { lines: [line], raw: line };
  }

  function end(): AggregatedEntry | null {
    return flush();
  }

  return { feed, end };
}

export function aggregateLines(
  lines: string[],
  options: AggregatorOptions
): AggregatedEntry[] {
  const aggregator = createAggregator(options);
  const results: AggregatedEntry[] = [];

  for (const line of lines) {
    const entry = aggregator.feed(line);
    if (entry) results.push(entry);
  }

  const last = aggregator.end();
  if (last) results.push(last);

  return results;
}
