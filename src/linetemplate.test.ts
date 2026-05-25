import {
  renderTemplate,
  buildTemplateConfig,
  applyTemplate,
  applyTemplateToLines,
  listTemplateTokens,
  TemplateContext,
} from './linetemplate';

const baseCtx: TemplateContext = {
  timestamp: '2024-01-15T10:00:00Z',
  level: 'INFO',
  source: 'app',
  message: 'server started',
  raw: '[INFO] app: server started',
  index: 1,
};

describe('renderTemplate', () => {
  it('replaces all known tokens', () => {
    const result = renderTemplate('{timestamp} [{level}] {source}: {message}', baseCtx);
    expect(result).toBe('2024-01-15T10:00:00Z [INFO] app: server started');
  });

  it('replaces {raw} token', () => {
    expect(renderTemplate('{raw}', baseCtx)).toBe('[INFO] app: server started');
  });

  it('replaces {index} token', () => {
    expect(renderTemplate('#{index} {message}', baseCtx)).toBe('#1 server started');
  });

  it('leaves unknown tokens untouched', () => {
    expect(renderTemplate('{unknown} {message}', baseCtx)).toBe('{unknown} server started');
  });

  it('renders empty string for missing optional fields', () => {
    const ctx: TemplateContext = { message: 'hello', raw: 'hello' };
    expect(renderTemplate('{timestamp} {message}', ctx)).toBe(' hello');
  });
});

describe('buildTemplateConfig', () => {
  it('builds a valid config', () => {
    const cfg = buildTemplateConfig({ template: '{level}: {message}' });
    expect(cfg.template).toBe('{level}: {message}');
    expect(cfg.fallback).toBe('{raw}');
  });

  it('accepts custom fallback', () => {
    const cfg = buildTemplateConfig({ template: '{level}', fallback: '{message}' });
    expect(cfg.fallback).toBe('{message}');
  });

  it('throws on empty template', () => {
    expect(() => buildTemplateConfig({ template: '' })).toThrow();
    expect(() => buildTemplateConfig({ template: '   ' })).toThrow();
  });
});

describe('applyTemplate', () => {
  it('renders using template', () => {
    const cfg = buildTemplateConfig({ template: '[{level}] {message}' });
    expect(applyTemplate(cfg, baseCtx)).toBe('[INFO] server started');
  });

  it('falls back when result is blank', () => {
    const ctx: TemplateContext = { message: '', raw: 'raw-line' };
    const cfg = buildTemplateConfig({ template: '{message}', fallback: '{raw}' });
    expect(applyTemplate(cfg, ctx)).toBe('raw-line');
  });
});

describe('applyTemplateToLines', () => {
  it('maps template over multiple contexts', () => {
    const cfg = buildTemplateConfig({ template: '{index}: {message}' });
    const ctxs: TemplateContext[] = [
      { ...baseCtx, index: 1, message: 'first' },
      { ...baseCtx, index: 2, message: 'second' },
    ];
    expect(applyTemplateToLines(cfg, ctxs)).toEqual(['1: first', '2: second']);
  });
});

describe('listTemplateTokens', () => {
  it('returns all supported tokens', () => {
    const tokens = listTemplateTokens();
    expect(tokens).toContain('timestamp');
    expect(tokens).toContain('level');
    expect(tokens).toContain('message');
    expect(tokens).toContain('raw');
  });
});
