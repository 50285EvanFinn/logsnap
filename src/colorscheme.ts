export type LogLevel = 'error' | 'warn' | 'info' | 'debug' | 'trace' | 'unknown';

export interface ColorScheme {
  error: (s: string) => string;
  warn: (s: string) => string;
  info: (s: string) => string;
  debug: (s: string) => string;
  trace: (s: string) => string;
  unknown: (s: string) => string;
  timestamp: (s: string) => string;
  source: (s: string) => string;
  highlight: (s: string) => string;
}

const ansi = {
  red: (s: string) => `\x1b[31m${s}\x1b[0m`,
  yellow: (s: string) => `\x1b[33m${s}\x1b[0m`,
  cyan: (s: string) => `\x1b[36m${s}\x1b[0m`,
  blue: (s: string) => `\x1b[34m${s}\x1b[0m`,
  gray: (s: string) => `\x1b[90m${s}\x1b[0m`,
  white: (s: string) => `\x1b[37m${s}\x1b[0m`,
  magenta: (s: string) => `\x1b[35m${s}\x1b[0m`,
  bgRed: (s: string) => `\x1b[41m\x1b[97m${s}\x1b[0m`,
  bold: (s: string) => `\x1b[1m${s}\x1b[0m`,
};

export const defaultColorScheme: ColorScheme = {
  error: ansi.red,
  warn: ansi.yellow,
  info: ansi.cyan,
  debug: ansi.blue,
  trace: ansi.gray,
  unknown: ansi.white,
  timestamp: ansi.gray,
  source: ansi.magenta,
  highlight: ansi.bgRed,
};

export const noColorScheme: ColorScheme = {
  error: (s) => s,
  warn: (s) => s,
  info: (s) => s,
  debug: (s) => s,
  trace: (s) => s,
  unknown: (s) => s,
  timestamp: (s) => s,
  source: (s) => s,
  highlight: (s) => s,
};

export function resolveColorScheme(useColor: boolean): ColorScheme {
  return useColor ? defaultColorScheme : noColorScheme;
}
