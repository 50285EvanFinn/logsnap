/**
 * splitterconfig.ts
 * Configuration and validation for the line splitter.
 */

export interface SplitterOptions {
  /** Strip carriage returns (\r) from lines. Default: true */
  stripCR?: boolean;
  /** Trim leading/trailing whitespace from each line. Default: false */
  trim?: boolean;
  /** Skip lines that are empty after processing. Default: true */
  skipEmpty?: boolean;
  /** Maximum line length before truncation (0 = unlimited). Default: 0 */
  maxLineLength?: number;
}

export interface SplitterConfig {
  stripCR: boolean;
  trim: boolean;
  skipEmpty: boolean;
  maxLineLength: number;
}

export function buildSplitterConfig(
  options: SplitterOptions = {}
): SplitterConfig {
  return {
    stripCR: options.stripCR !== false,
    trim: options.trim === true,
    skipEmpty: options.skipEmpty !== false,
    maxLineLength: options.maxLineLength ?? 0,
  };
}

export function validateSplitterConfig(config: SplitterConfig): string[] {
  const errors: string[] = [];
  if (config.maxLineLength < 0) {
    errors.push("maxLineLength must be >= 0");
  }
  return errors;
}

/**
 * Apply splitter config post-processing to a single raw line.
 */
export function applyConfig(line: string, config: SplitterConfig): string | null {
  let result = line;

  if (config.stripCR) {
    result = result.replace(/\r/g, "");
  }

  if (config.trim) {
    result = result.trim();
  }

  if (config.skipEmpty && result.length === 0) {
    return null;
  }

  if (config.maxLineLength > 0 && result.length > config.maxLineLength) {
    result = result.slice(0, config.maxLineLength);
  }

  return result;
}

/**
 * Apply config to an array of lines, filtering nulls.
 */
export function applyConfigToLines(
  lines: string[],
  config: SplitterConfig
): string[] {
  return lines.reduce<string[]>((acc, line) => {
    const processed = applyConfig(line, config);
    if (processed !== null) acc.push(processed);
    return acc;
  }, []);
}
