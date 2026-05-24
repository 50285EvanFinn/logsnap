import { buildFilter } from "./filter";
import { highlightLines } from "./highlighter";
import { filterByLevel } from "./levelfilter";
import { truncateLines } from "./truncator";
import { deduplicateAndFormat } from "./deduplicator";
import { aggregateLines, AggregatorOptions } from "./multilineaggregator";

export interface PipelineOptions {
  filter?: string;
  level?: string;
  highlight?: string[];
  maxLineLength?: number;
  deduplicate?: boolean;
  aggregate?: boolean;
  aggregatePattern?: RegExp;
}

export function runPipeline(lines: string[], options: PipelineOptions): string[] {
  let result = [...lines];

  // 1. Aggregate multi-line entries before any per-line processing
  if (options.aggregate) {
    const aggOptions: AggregatorOptions = {
      startPattern: options.aggregatePattern ?? /^\d{4}-\d{2}-\d{2}/,
    };
    const entries = aggregateLines(result, aggOptions);
    result = entries.map((e) => e.raw);
  }

  // 2. Filter by text / regex
  if (options.filter) {
    const filterFn = buildFilter(options.filter);
    result = result.filter(filterFn);
  }

  // 3. Filter by log level
  if (options.level) {
    result = filterByLevel(result, options.level);
  }

  // 4. Deduplicate
  if (options.deduplicate) {
    result = deduplicateAndFormat(result);
  }

  // 5. Truncate long lines
  if (options.maxLineLength) {
    result = truncateLines(result, options.maxLineLength);
  }

  // 6. Highlight
  if (options.highlight && options.highlight.length > 0) {
    result = highlightLines(result, options.highlight);
  }

  return result;
}
