/**
 * Core log filtering module.
 * Supports plain string matching and regex-based filtering.
 */

export interface FilterOptions {
  pattern: string;
  useRegex?: boolean;
  caseSensitive?: boolean;
  invert?: boolean;
}

export interface FilterResult {
  matched: boolean;
  matchRanges: Array<{ start: number; end: number }>;
}

export function buildFilter(options: FilterOptions): (line: string) => FilterResult {
  const flags = options.caseSensitive ? 'g' : 'gi';
  let regex: RegExp;

  try {
    regex = options.useRegex
      ? new RegExp(options.pattern, flags)
      : new RegExp(escapeRegex(options.pattern), flags);
  } catch {
    throw new Error(`Invalid regex pattern: "${options.pattern}"`);
  }

  return (line: string): FilterResult => {
    const matchRanges: Array<{ start: number; end: number }> = [];
    let match: RegExpExecArray | null;

    regex.lastIndex = 0;
    while ((match = regex.exec(line)) !== null) {
      matchRanges.push({ start: match.index, end: match.index + match[0].length });
      if (!flags.includes('g')) break;
    }

    const matched = options.invert ? matchRanges.length === 0 : matchRanges.length > 0;
    return { matched, matchRanges: matched && !options.invert ? matchRanges : [] };
  };
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function filterLines(lines: string[], options: FilterOptions): string[] {
  const filter = buildFilter(options);
  return lines.filter((line) => filter(line).matched);
}
