export interface TruncatorConfigOptions {
  maxLength?: number;
  ellipsis?: string;
  preserveAnsi?: boolean;
}

export interface TruncatorConfig {
  maxLength: number;
  ellipsis: string;
  preserveAnsi: boolean;
}

const DEFAULT_MAX_LENGTH = 200;
const DEFAULT_ELLIPSIS = '...';

export function parseTruncatorOptions(
  options: TruncatorConfigOptions
): TruncatorConfig {
  return {
    maxLength: options.maxLength ?? DEFAULT_MAX_LENGTH,
    ellipsis: options.ellipsis ?? DEFAULT_ELLIPSIS,
    preserveAnsi: options.preserveAnsi ?? false,
  };
}

export function validateTruncatorOptions(
  options: TruncatorConfigOptions
): string[] {
  const errors: string[] = [];
  if (options.maxLength !== undefined && options.maxLength < 1) {
    errors.push('maxLength must be at least 1');
  }
  if (options.ellipsis !== undefined && options.ellipsis.length > 10) {
    errors.push('ellipsis must be 10 characters or fewer');
  }
  return errors;
}

export function describeTruncatorConfig(config: TruncatorConfig): string {
  return `maxLength=${config.maxLength} ellipsis="${config.ellipsis}" preserveAnsi=${config.preserveAnsi}`;
}
