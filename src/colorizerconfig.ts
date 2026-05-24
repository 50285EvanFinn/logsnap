import { ColorScheme, resolveColorScheme } from './colorscheme';

export interface ColorizerConfig {
  useColor: boolean;
  colorizeFullLine: boolean;
  scheme: ColorScheme;
}

export interface ColorizerConfigInput {
  useColor?: boolean;
  colorizeFullLine?: boolean;
}

export function buildColorizerConfig(input: ColorizerConfigInput = {}): ColorizerConfig {
  const useColor = input.useColor ?? detectColorSupport();
  return {
    useColor,
    colorizeFullLine: input.colorizeFullLine ?? false,
    scheme: resolveColorScheme(useColor),
  };
}

export function detectColorSupport(): boolean {
  if (typeof process === 'undefined') return false;
  const { env, stdout } = process;
  if (env.NO_COLOR) return false;
  if (env.FORCE_COLOR) return true;
  return !!stdout?.isTTY;
}

export function mergeColorizerConfig(
  base: ColorizerConfig,
  overrides: Partial<ColorizerConfigInput>
): ColorizerConfig {
  return buildColorizerConfig({
    useColor: overrides.useColor ?? base.useColor,
    colorizeFullLine: overrides.colorizeFullLine ?? base.colorizeFullLine,
  });
}
