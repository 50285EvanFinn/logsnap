/**
 * linescorer.ts
 * Assigns a numeric relevance score to log lines based on configurable criteria.
 */

export interface ScorerConfig {
  keywords: Array<{ word: string; weight: number }>;
  levelWeights: Record<string, number>;
  boostRecent: boolean;
}

export interface ScoredLine {
  line: string;
  score: number;
  reasons: string[];
}

const DEFAULT_LEVEL_WEIGHTS: Record<string, number> = {
  error: 10,
  warn: 5,
  info: 2,
  debug: 1,
  trace: 0,
};

export function buildScorerConfig(
  partial: Partial<ScorerConfig> = {}
): ScorerConfig {
  return {
    keywords: partial.keywords ?? [],
    levelWeights: { ...DEFAULT_LEVEL_WEIGHTS, ...(partial.levelWeights ?? {}) },
    boostRecent: partial.boostRecent ?? false,
  };
}

export function scoreLine(
  line: string,
  config: ScorerConfig,
  index: number,
  total: number
): ScoredLine {
  let score = 0;
  const reasons: string[] = [];

  for (const { word, weight } of config.keywords) {
    if (line.toLowerCase().includes(word.toLowerCase())) {
      score += weight;
      reasons.push(`keyword:${word}(+${weight})`);
    }
  }

  const levelMatch = line.match(/\b(error|warn|info|debug|trace)\b/i);
  if (levelMatch) {
    const level = levelMatch[1].toLowerCase();
    const w = config.levelWeights[level] ?? 0;
    score += w;
    if (w > 0) reasons.push(`level:${level}(+${w})`);
  }

  if (config.boostRecent && total > 1) {
    const recencyBoost = Math.round((index / (total - 1)) * 3);
    score += recencyBoost;
    if (recencyBoost > 0) reasons.push(`recency(+${recencyBoost})`);
  }

  return { line, score, reasons };
}

export function scoreLines(
  lines: string[],
  config: ScorerConfig
): ScoredLine[] {
  return lines.map((line, i) => scoreLine(line, config, i, lines.length));
}

export function topScoredLines(
  scored: ScoredLine[],
  n: number
): ScoredLine[] {
  return [...scored]
    .sort((a, b) => b.score - a.score)
    .slice(0, n);
}
