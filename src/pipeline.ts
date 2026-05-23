/**
 * pipeline.ts
 * Orchestrates the full log processing pipeline:
 * filter → deduplicate → rate-limit → truncate → format → highlight
 */

import { filterLines, buildFilter } from './filter';
import { deduplicateAndFormat } from './deduplicator';
import { createRateLimiterState, rateLimitLine } from './ratelimiter';
import { truncateLines } from './truncator';
import { formatLines } from './formatter';
import { highlightLines } from './highlighter';

export interface PipelineOptions {
  filter?: string;
  caseSensitive?: boolean;
  deduplication?: boolean;
  rateLimit?: number;        // max lines per window
  rateLimitWindow?: number;  // window in ms
  maxLineLength?: number;
  highlight?: string[];
  color?: boolean;
}

export function runPipeline(
  lines: string[],
  options: PipelineOptions = {}
): string[] {
  const {
    filter,
    caseSensitive = false,
    deduplication = false,
    rateLimit,
    rateLimitWindow = 1000,
    maxLineLength,
    highlight = [],
    color = true,
  } = options;

  // 1. Filter
  let result = filter
    ? filterLines(lines, buildFilter(filter, { caseSensitive }))
    : lines;

  // 2. Deduplicate
  if (deduplication) {
    result = deduplicateAndFormat(result);
  }

  // 3. Rate-limit
  if (rateLimit !== undefined) {
    const state = createRateLimiterState(rateLimit, rateLimitWindow);
    result = result.filter((line) => rateLimitLine(line, state));
  }

  // 4. Truncate
  if (maxLineLength !== undefined) {
    result = truncateLines(result, { maxLength: maxLineLength });
  }

  // 5. Format (level detection, timestamps)
  result = formatLines(result);

  // 6. Highlight
  if (color && highlight.length > 0) {
    result = highlightLines(result, highlight);
  }

  return result;
}
