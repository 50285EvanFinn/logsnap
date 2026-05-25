/**
 * linetemplate.ts
 * Simple token-based line template renderer for customising output format.
 */

export interface TemplateContext {
  timestamp?: string;
  level?: string;
  source?: string;
  message: string;
  raw: string;
  index?: number;
}

export interface TemplateConfig {
  template: string;
  fallback?: string;
}

const TOKEN_RE = /\{(timestamp|level|source|message|raw|index)\}/g;

export function renderTemplate(template: string, ctx: TemplateContext): string {
  return template.replace(TOKEN_RE, (_, token: string) => {
    const key = token as keyof TemplateContext;
    const value = ctx[key];
    if (value === undefined || value === null) return '';
    return String(value);
  });
}

export function buildTemplateConfig(raw: Partial<TemplateConfig>): TemplateConfig {
  const template = raw.template?.trim();
  if (!template) {
    throw new Error('Template string must not be empty');
  }
  return {
    template,
    fallback: raw.fallback ?? '{raw}',
  };
}

export function applyTemplate(config: TemplateConfig, ctx: TemplateContext): string {
  try {
    const result = renderTemplate(config.template, ctx);
    // If result is blank (all tokens resolved to empty), use fallback
    if (result.trim() === '' && config.fallback) {
      return renderTemplate(config.fallback, ctx);
    }
    return result;
  } catch {
    return ctx.raw;
  }
}

export function applyTemplateToLines(
  config: TemplateConfig,
  lines: TemplateContext[]
): string[] {
  return lines.map((ctx) => applyTemplate(config, ctx));
}

export function listTemplateTokens(): string[] {
  return ['timestamp', 'level', 'source', 'message', 'raw', 'index'];
}
