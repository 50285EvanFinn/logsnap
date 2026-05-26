/**
 * prefixconfig.ts — Parse and validate prefix configuration options
 */

import { PrefixConfig } from "./lineprefixer";

export interface RawPrefixOptions {
  prefix?: string;
  separator?: string;
  includeIndex?: boolean | string;
  startIndex?: number | string;
}

export function parsePrefixOptions(raw: RawPrefixOptions): PrefixConfig {
  const prefix = typeof raw.prefix === "string" ? raw.prefix : "";
  const separator = typeof raw.separator === "string" ? raw.separator : " ";

  const includeIndex =
    typeof raw.includeIndex === "boolean"
      ? raw.includeIndex
      : raw.includeIndex === "true";

  const startIndex =
    typeof raw.startIndex === "number"
      ? raw.startIndex
      : typeof raw.startIndex === "string"
      ? parseInt(raw.startIndex, 10)
      : 1;

  return { prefix, separator, includeIndex, startIndex };
}

export function validatePrefixOptions(config: PrefixConfig): string[] {
  const errors: string[] = [];

  if (config.separator.length === 0) {
    errors.push("separator must be a non-empty string");
  }

  if (!Number.isInteger(config.startIndex) || config.startIndex < 0) {
    errors.push("startIndex must be a non-negative integer");
  }

  return errors;
}

export function describePrefixConfig(config: PrefixConfig): string {
  const parts: string[] = [];
  if (config.prefix) parts.push(`prefix="${config.prefix}"`);
  if (config.includeIndex)
    parts.push(`index (start=${config.startIndex})`);
  if (parts.length === 0) return "no prefix configured";
  return `prefix config: ${parts.join(", ")}`;
}
