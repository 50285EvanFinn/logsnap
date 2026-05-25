/**
 * maskconfig.ts
 * Parses and validates options for the line masker.
 */

import { buildMaskerConfig, LineMaskerConfig } from "./linemasker";

export interface MaskerOptions {
  /** Array of regex strings or literal strings to mask */
  patterns?: string[];
  /** Replacement mask string, defaults to **** */
  mask?: string;
}

const BUILT_IN_PATTERNS: Record<string, string> = {
  ipv4: "\\b(?:\\d{1,3}\\.){3}\\d{1,3}\\b",
  email: "[a-zA-Z0-9._%+\\-]+@[a-zA-Z0-9.\\-]+\\.[a-zA-Z]{2,}",
  jwt: "eyJ[A-Za-z0-9_\\-]+\\.[A-Za-z0-9_\\-]+\\.[A-Za-z0-9_\\-]+",
  bearer: "(?<=Bearer\\s)[A-Za-z0-9\\-._~+/]+=*",
};

export function resolvePattern(raw: string): RegExp {
  const builtin = BUILT_IN_PATTERNS[raw.toLowerCase()];
  const source = builtin ?? raw;
  try {
    return new RegExp(source, "g");
  } catch {
    throw new Error(`Invalid mask pattern: "${raw}"`);
  }
}

export function parseMaskerOptions(opts: MaskerOptions): LineMaskerConfig {
  const patterns = (opts.patterns ?? []).map(resolvePattern);
  const mask = opts.mask ?? "****";
  return buildMaskerConfig(patterns, mask);
}

export function validateMaskerOptions(opts: MaskerOptions): string[] {
  const errors: string[] = [];
  if (opts.mask !== undefined && opts.mask.length === 0) {
    errors.push("mask must not be an empty string");
  }
  for (const p of opts.patterns ?? []) {
    if (!BUILT_IN_PATTERNS[p.toLowerCase()]) {
      try {
        new RegExp(p);
      } catch {
        errors.push(`Invalid regex pattern: "${p}"`);
      }
    }
  }
  return errors;
}
