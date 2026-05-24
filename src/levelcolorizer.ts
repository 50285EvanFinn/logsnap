import { ColorScheme, LogLevel, defaultColorScheme } from './colorscheme';

export interface ColorizerOptions {
  scheme?: ColorScheme;
  colorizeFullLine?: boolean;
}

export function colorizeLevelToken(level: LogLevel, token: string, scheme: ColorScheme): string {
  return scheme[level](token);
}

export function colorizeLine(
  line: string,
  level: LogLevel,
  options: ColorizerOptions = {}
): string {
  const scheme = options.scheme ?? defaultColorScheme;
  const colorFn = scheme[level];

  if (options.colorizeFullLine) {
    return colorFn(line);
  }

  // Only colorize the level token within the line
  const levelPatterns: Record<LogLevel, RegExp> = {
    error: /\b(error|err|ERROR|ERR)\b/,
    warn:  /\b(warn|warning|WARN|WARNING)\b/,
    info:  /\b(info|INFO)\b/,
    debug: /\b(debug|DEBUG)\b/,
    trace: /\b(trace|TRACE)\b/,
    unknown: /^/,
  };

  const pattern = levelPatterns[level];
  if (level === 'unknown') return line;

  return line.replace(pattern, (match) => colorFn(match));
}

export function colorizeLines(
  lines: string[],
  levelMap: Map<string, LogLevel>,
  options: ColorizerOptions = {}
): string[] {
  return lines.map((line) => {
    const level = levelMap.get(line) ?? 'unknown';
    return colorizeLine(line, level, options);
  });
}
