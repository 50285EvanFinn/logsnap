/**
 * redactorconfig.ts — Parses and validates redactor configuration from CLI/env options.
 */

import { RedactorRule } from "./redactor";

export interface RawRedactorOptions {
  patterns?: string[];
  placeholder?: string;
  builtins?: boolean;
}

export interface ParsedRedactorOptions {
  rules: RedactorRule[];
  placeholder: string;
  useBuiltins: boolean;
}

export function parseRedactorOptions(
  opts: RawRedactorOptions
): ParsedRedactorOptions {
  const placeholder = opts.placeholder ?? "[REDACTED]";
  const useBuiltins = opts.builtins !== false;

  const rules: RedactorRule[] = (opts.patterns ?? []).map((pat) => {
    let source = pat;
    let flags = "g";
    const flagMatch = pat.match(/^\/(.+)\/([gimsuy]*)$/);
    if (flagMatch) {
      source = flagMatch[1];
      flags = flagMatch[2].includes("g") ? flagMatch[2] : flagMatch[2] + "g";
    }
    return {
      pattern: new RegExp(source, flags),
      replacement: placeholder,
    };
  });

  return { rules, placeholder, useBuiltins };
}

export function validateRedactorOptions(opts: RawRedactorOptions): string[] {
  const errors: string[] = [];
  for (const pat of opts.patterns ?? []) {
    const flagMatch = pat.match(/^\/(.+)\/([gimsuy]*)$/);
    const source = flagMatch ? flagMatch[1] : pat;
    try {
      new RegExp(source);
    } catch {
      errors.push(`Invalid regex pattern: ${pat}`);
    }
  }
  if (
    opts.placeholder !== undefined &&
    opts.placeholder.trim().length === 0
  ) {
    errors.push("Placeholder must not be empty");
  }
  return errors;
}
