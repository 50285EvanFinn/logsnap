/**
 * templateconfig.ts
 * Parses and validates CLI/config options for the line template feature.
 */

import { TemplateConfig, buildTemplateConfig, listTemplateTokens } from './linetemplate';

export interface RawTemplateOptions {
  template?: string;
  fallback?: string;
  strict?: boolean;
}

export interface ResolvedTemplateOptions {
  config: TemplateConfig;
  strict: boolean;
}

export function parseTemplateOptions(opts: RawTemplateOptions): ResolvedTemplateOptions {
  if (!opts.template) {
    throw new Error('--template is required');
  }
  const config = buildTemplateConfig({
    template: opts.template,
    fallback: opts.fallback,
  });
  return {
    config,
    strict: opts.strict ?? false,
  };
}

export function validateTemplateString(template: string): string[] {
  const errors: string[] = [];
  const knownTokens = new Set(listTemplateTokens());
  const tokenRe = /\{([^}]+)\}/g;
  let match: RegExpExecArray | null;
  while ((match = tokenRe.exec(template)) !== null) {
    const token = match[1];
    if (!knownTokens.has(token)) {
      errors.push(`Unknown token: {${token}}`);
    }
  }
  if (!template.trim()) {
    errors.push('Template must not be empty');
  }
  return errors;
}

export function describeTemplate(config: TemplateConfig): string {
  const tokens = listTemplateTokens();
  const used = tokens.filter((t) => config.template.includes(`{${t}}`));
  const lines = [
    `Template : ${config.template}`,
    `Fallback : ${config.fallback ?? '(none)'}`,
    `Tokens   : ${used.length > 0 ? used.join(', ') : '(none)'}`,
  ];
  return lines.join('\n');
}
