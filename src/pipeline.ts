import { buildFilter, filterLines, FilterOptions } from './filter';
import { highlightLines } from './highlighter';
import { formatLines } from './formatter';
import { computeStats, formatStats } from './stats';
import { writeSnapshot, SnapshotOptions, SnapshotResult } from './snapshot';

export interface PipelineOptions {
  filter?: FilterOptions;
  highlight?: string[];
  format?: boolean;
  stats?: boolean;
  snapshot?: SnapshotOptions;
}

export interface PipelineOutput {
  lines: string[];
  stats?: string;
  snapshot?: SnapshotResult;
}

export function runPipeline(
  rawLines: string[],
  options: PipelineOptions = {}
): PipelineOutput {
  let lines = [...rawLines];

  if (options.filter) {
    const predicate = buildFilter(options.filter);
    lines = filterLines(lines, predicate);
  }

  if (options.format) {
    lines = formatLines(lines);
  }

  if (options.highlight && options.highlight.length > 0) {
    lines = highlightLines(lines, options.highlight);
  }

  const output: PipelineOutput = { lines };

  if (options.stats) {
    const statsData = computeStats(rawLines);
    output.stats = formatStats(statsData);
  }

  if (options.snapshot) {
    output.snapshot = writeSnapshot(lines, options.snapshot);
  }

  return output;
}
