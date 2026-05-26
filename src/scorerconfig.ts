/**
 * scorerconfig.ts
 * Parsing and validation helpers for ScorerConfig.
 */

import { ScorerConfig, buildScorerConfig } from "./linescorer";

export interface RawScorerOptions {
  keywords?: string; // comma-separated "word:weight" pairs, e.g. "exception:8,timeout:6"
  levelWeights?: string; // comma-separated "level:weight" pairs
  boostRecent?: boolean;
}

export function parseScorerOptions(opts: RawScorerOptions): ScorerConfig {
  const keywords = opts.keywords
    ? opts.keywords.split(",").map((entry) => {
        const [word, rawWeight] = entry.trim().split(":");
        const weight = rawWeight !== undefined ? parseInt(rawWeight, 10) : 1;
        return { word: word.trim(), weight: isNaN(weight) ? 1 : weight };
      })
    : [];

  const levelWeights: Record<string, number> = {};
  if (opts.levelWeights) {
    for (const entry of opts.levelWeights.split(",")) {
      const [level, rawW] = entry.trim().split(":");
      const w = parseInt(rawW, 10);
      if (level && !isNaN(w)) {
        levelWeights[level.trim().toLowerCase()] = w;
      }
    }
  }

  return buildScorerConfig({
    keywords,
    levelWeights: Object.keys(levelWeights).length ? levelWeights : undefined,
    boostRecent: opts.boostRecent,
  });
}

export function validateScorerOptions(opts: RawScorerOptions): string[] {
  const errors: string[] = [];

  if (opts.keywords) {
    for (const entry of opts.keywords.split(",")) {
      const parts = entry.trim().split(":");
      if (parts[0].trim() === "") {
        errors.push(`Empty keyword in: "${entry}"`);
      }
      if (parts[1] !== undefined && isNaN(parseInt(parts[1], 10))) {
        errors.push(`Invalid weight in: "${entry}"`);
      }
    }
  }

  if (opts.levelWeights) {
    for (const entry of opts.levelWeights.split(",")) {
      const parts = entry.trim().split(":");
      if (parts.length !== 2 || isNaN(parseInt(parts[1], 10))) {
        errors.push(`Invalid levelWeights entry: "${entry}"`);
      }
    }
  }

  return errors;
}

export function describeScorerConfig(config: ScorerConfig): string {
  const parts: string[] = [];
  if (config.keywords.length) {
    parts.push(`keywords=[${config.keywords.map((k) => `${k.word}:${k.weight}`).join(", ")}]`);
  }
  const levels = Object.entries(config.levelWeights)
    .map(([l, w]) => `${l}:${w}`)
    .join(", ");
  parts.push(`levels=[${levels}]`);
  if (config.boostRecent) parts.push("boostRecent=true");
  return `ScorerConfig(${parts.join("; ")})`;
}
