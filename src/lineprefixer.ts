/**
 * lineprefixer.ts — Prepend configurable prefixes to log lines
 */

export interface PrefixConfig {
  prefix: string;
  separator: string;
  includeIndex: boolean;
  startIndex: number;
}

export interface PrefixResult {
  original: string;
  prefixed: string;
  index: number;
}

export function buildPrefixConfig(
  options: Partial<PrefixConfig> = {}
): PrefixConfig {
  return {
    prefix: options.prefix ?? "",
    separator: options.separator ?? " ",
    includeIndex: options.includeIndex ?? false,
    startIndex: options.startIndex ?? 1,
  };
}

export function prefixLine(
  line: string,
  config: PrefixConfig,
  index: number
): PrefixResult {
  const parts: string[] = [];

  if (config.prefix.length > 0) {
    parts.push(config.prefix);
  }

  if (config.includeIndex) {
    parts.push(String(config.startIndex + index));
  }

  const builtPrefix = parts.join(config.separator);
  const prefixed =
    builtPrefix.length > 0
      ? `${builtPrefix}${config.separator}${line}`
      : line;

  return { original: line, prefixed, index: config.startIndex + index };
}

export function prefixLines(
  lines: string[],
  config: PrefixConfig
): PrefixResult[] {
  return lines.map((line, i) => prefixLine(line, config, i));
}

export function extractPrefixed(results: PrefixResult[]): string[] {
  return results.map((r) => r.prefixed);
}
