/**
 * redactor.ts — Redacts sensitive patterns from log lines before output or export.
 */

export interface RedactorRule {
  pattern: RegExp;
  replacement: string;
}

export interface RedactorConfig {
  rules: RedactorRule[];
  placeholder?: string;
}

const DEFAULT_PLACEHOLDER = "[REDACTED]";

const BUILTIN_RULES: RedactorRule[] = [
  {
    pattern: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
    replacement: "[EMAIL]",
  },
  {
    pattern: /\b(?:\d[ -]?){13,16}\b/g,
    replacement: "[CARD]",
  },
  {
    pattern: /\b(?:password|passwd|secret|token|api_?key)\s*[=:]\s*\S+/gi,
    replacement: "[CREDENTIAL]",
  },
  {
    pattern: /\b(?:\d{1,3}\.){3}\d{1,3}\b/g,
    replacement: "[IP]",
  },
];

export function buildRedactorConfig(
  extra: RedactorRule[] = [],
  placeholder = DEFAULT_PLACEHOLDER
): RedactorConfig {
  return {
    rules: [
      ...BUILTIN_RULES.map((r) => ({ ...r, replacement: placeholder === DEFAULT_PLACEHOLDER ? r.replacement : placeholder })),
      ...extra,
    ],
    placeholder,
  };
}

export function redactLine(line: string, config: RedactorConfig): string {
  let result = line;
  for (const rule of config.rules) {
    const flags = rule.pattern.flags.includes("g")
      ? rule.pattern.flags
      : rule.pattern.flags + "g";
    const re = new RegExp(rule.pattern.source, flags);
    result = result.replace(re, rule.replacement);
  }
  return result;
}

export function redactLines(lines: string[], config: RedactorConfig): string[] {
  return lines.map((line) => redactLine(line, config));
}
