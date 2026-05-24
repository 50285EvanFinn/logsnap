import { ParsedLine } from './lineparser';
import { OutputFormatterOptions, formatParsedLine, resetHeader } from './outputformatter';

export interface RenderOptions extends OutputFormatterOptions {
  lineNumbers?: boolean;
  startIndex?: number;
}

export interface RenderedOutput {
  lines: string[];
  count: number;
}

export function renderLines(
  parsed: ParsedLine[],
  opts: RenderOptions
): RenderedOutput {
  resetHeader();
  const lines: string[] = [];
  let index = opts.startIndex ?? 1;

  for (const line of parsed) {
    let formatted = formatParsedLine(line, opts);
    if (opts.lineNumbers) {
      formatted = `${String(index).padStart(4, ' ')}  ${formatted}`;
    }
    lines.push(formatted);
    index++;
  }

  return { lines, count: lines.length };
}

export function renderToString(
  parsed: ParsedLine[],
  opts: RenderOptions
): string {
  const { lines } = renderLines(parsed, opts);
  return lines.join('\n');
}

export function renderSummary(output: RenderedOutput): string {
  return `Rendered ${output.count} line${output.count !== 1 ? 's' : ''}.`;
}
