/**
 * linemasker.ts
 * Masks sensitive substrings in log lines using configurable patterns.
 * Distinct from redactor: masker replaces with a fixed mask string (e.g. ****)
 * rather than a labelled token, useful for passwords, tokens, secrets.
 */

export interface MaskRule {
  pattern: RegExp;
  mask: string;
}

export interface LineMaskerConfig {
  rules: MaskRule[];
  defaultMask: string;
}

export function buildMaskerConfig(
  patterns: Array<string | RegExp>,
  mask = "****"
): LineMaskerConfig {
  const rules: MaskRule[] = patterns.map((p) => ({
    pattern: typeof p === "string" ? new RegExp(p, "g") : ensureGlobal(p),
    mask,
  }));
  return { rules, defaultMask: mask };
}

function ensureGlobal(re: RegExp): RegExp {
  return re.flags.includes("g") ? re : new RegExp(re.source, re.flags + "g");
}

export function maskLine(line: string, config: LineMaskerConfig): string {
  let result = line;
  for (const rule of config.rules) {
    // Reset lastIndex for global regexes between calls
    rule.pattern.lastIndex = 0;
    result = result.replace(rule.pattern, rule.mask);
  }
  return result;
}

export function maskLines(
  lines: string[],
  config: LineMaskerConfig
): string[] {
  return lines.map((line) => maskLine(line, config));
}

export function countMasked(
  lines: string[],
  config: LineMaskerConfig
): number {
  return lines.reduce((acc, line) => {
    const masked = maskLine(line, config);
    return acc + (masked !== line ? 1 : 0);
  }, 0);
}

export function formatMaskSummary(
  total: number,
  masked: number
): string {
  return `Masked ${masked} of ${total} line(s).`;
}
