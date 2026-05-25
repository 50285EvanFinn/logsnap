export interface SamplerConfig {
  rate: number; // 0.0 to 1.0, fraction of lines to keep
  seed?: number; // optional seed for deterministic sampling
  minLines?: number; // always emit at least this many lines regardless of rate
}

export const DEFAULT_SAMPLER_CONFIG: SamplerConfig = {
  rate: 1.0,
  seed: undefined,
  minLines: 0,
};

export function buildSamplerConfig(
  partial: Partial<SamplerConfig>
): SamplerConfig {
  const rate = partial.rate ?? DEFAULT_SAMPLER_CONFIG.rate;
  if (rate < 0 || rate > 1) {
    throw new RangeError(`Sampler rate must be between 0 and 1, got ${rate}`);
  }
  return {
    ...DEFAULT_SAMPLER_CONFIG,
    ...partial,
    rate,
  };
}

export function validateSamplerConfig(config: SamplerConfig): string[] {
  const errors: string[] = [];
  if (config.rate < 0 || config.rate > 1) {
    errors.push(`rate must be 0.0–1.0, got ${config.rate}`);
  }
  if (config.minLines !== undefined && config.minLines < 0) {
    errors.push(`minLines must be >= 0, got ${config.minLines}`);
  }
  return errors;
}
