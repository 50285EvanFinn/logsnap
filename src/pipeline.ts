import { buildFilter } from "./filter";
import { highlightLines } from "./highlighter";
import { formatLines } from "./formatter";
import { computeStats, formatStats } from "./stats";
import { deduplicateAndFormat } from "./deduplicator";
import { truncateLines } from "./truncator";
import { applyContextWindow, formatContextResults } from "./contextwindow";

export interface PipelineOptions {
  filter?: string;
  highlight?: string;
  format?: boolean;
  deduplicate?: boolean;
  truncate?: number;
  showStats?: boolean;
  contextBefore?: number;
  contextAfter?: number;
}

export function runPipeline(lines: string[], options: PipelineOptions): string[] {
  let result = [...lines];

  // 1. Context window (apply before filtering to preserve surrounding lines)
  if (
    (options.contextBefore !== undefined && options.contextBefore > 0) ||
    (options.contextAfter !== undefined && options.contextAfter > 0)
  ) {
    const matchFn = options.filter
      ? buildFilter(options.filter)
      : () => true;
    const contextResults = applyContextWindow(result, matchFn, {
      before: options.contextBefore ?? 0,
      after: options.contextAfter ?? 0,
    });
    result = formatContextResults(contextResults);
  } else if (options.filter) {
    // 2. Filter (only if no context window, since context handles filtering)
    const matchFn = buildFilter(options.filter);
    result = result.filter(matchFn);
  }

  // 3. Deduplicate
  if (options.deduplicate) {
    result = deduplicateAndFormat(result);
  }

  // 4. Truncate
  if (options.truncate !== undefined && options.truncate > 0) {
    result = truncateLines(result, options.truncate);
  }

  // 5. Format
  if (options.format) {
    result = formatLines(result);
  }

  // 6. Highlight
  if (options.highlight) {
    result = highlightLines(result, options.highlight);
  }

  // 7. Stats
  if (options.showStats) {
    const stats = computeStats(lines);
    result = [...result, "", ...formatStats(stats)];
  }

  return result;
}
