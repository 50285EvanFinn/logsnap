/**
 * taggerconfig.ts
 * Parses and validates options for the line tagger.
 */

import { TaggerConfig, buildTaggerConfig } from "./linetagger";

export interface TaggerOptions {
  tags?: string | string[];
  separator?: string;
  prefix?: string;
}

export function parseTaggerOptions(opts: TaggerOptions): TaggerConfig {
  let tags: string[];

  if (!opts.tags || (Array.isArray(opts.tags) && opts.tags.length === 0)) {
    throw new Error("At least one tag must be provided");
  }

  if (typeof opts.tags === "string") {
    tags = opts.tags.split(",").map((t) => t.trim()).filter(Boolean);
  } else {
    tags = opts.tags;
  }

  if (tags.length === 0) {
    throw new Error("At least one non-empty tag must be provided");
  }

  return buildTaggerConfig(
    tags,
    opts.separator ?? ",",
    opts.prefix ?? "[tag:"
  );
}

export function validateTaggerOptions(opts: TaggerOptions): string[] {
  const errors: string[] = [];

  if (!opts.tags || (Array.isArray(opts.tags) && opts.tags.length === 0)) {
    errors.push("tags: at least one tag is required");
  }

  if (opts.separator !== undefined && opts.separator.length === 0) {
    errors.push("separator: must not be an empty string");
  }

  if (opts.prefix !== undefined && opts.prefix.length === 0) {
    errors.push("prefix: must not be an empty string");
  }

  return errors;
}

export function describeTaggerConfig(config: TaggerConfig): string {
  return `tags=[${config.tags.join(", ")}] prefix="${config.prefix}" separator="${config.separator}"`;
}
