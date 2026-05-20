import { buildFilter, filterLines } from './filter';
import { highlightLines } from './highlighter';
import { formatLines, FormattedLine } from './formatter';
import { computeStats, LogStats } from './stats';

export interface PipelineOptions {
  /** Plain-text or regex patterns to filter lines */
  patterns?: string[];
  /** Whether pattern matching is case-sensitive */
  caseSensitive?: boolean;
  /** Regex patterns to highlight within matched lines */
  highlights?: string[];
}

export interface PipelineResult {
  lines: FormattedLine[];
  stats: LogStats;
  rendered: string[];
}

/**
 * Run raw log lines through the full processing pipeline:
 * filter → format → highlight → stats.
 */
export function runPipeline(
  rawLines: string[],
  options: PipelineOptions = {}
): PipelineResult {
  const { patterns = [], caseSensitive = false, highlights = [] } = options;

  // 1. Filter
  const filter = buildFilter(patterns, caseSensitive);
  const filtered = filterLines(rawLines, filter);

  // 2. Format (level detection, timestamp extraction)
  const formatted = formatLines(filtered);

  // 3. Highlight — operate on the colored strings
  const coloredLines = formatted.map(f => f.colored);
  const rendered = highlights.length > 0
    ? highlightLines(coloredLines, highlights)
    : coloredLines;

  // 4. Stats
  const stats = computeStats(formatted);

  return { lines: formatted, stats, rendered };
}
