import { ParsedLine } from './lineparser';

export type OutputFormat = 'text' | 'json' | 'csv' | 'tsv';

export interface OutputFormatterOptions {
  format: OutputFormat;
  fields?: string[];
  delimiter?: string;
  includeHeader?: boolean;
}

let headerEmitted = false;

export function resetHeader(): void {
  headerEmitted = false;
}

export function formatAsText(line: ParsedLine): string {
  const parts: string[] = [];
  if (line.timestamp) parts.push(`[${line.timestamp}]`);
  if (line.level) parts.push(`[${line.level.toUpperCase()}]`);
  if (line.source) parts.push(`(${line.source})`);
  parts.push(line.message);
  return parts.join(' ');
}

export function formatAsJson(line: ParsedLine): string {
  return JSON.stringify({
    timestamp: line.timestamp ?? null,
    level: line.level ?? null,
    source: line.source ?? null,
    message: line.message,
    raw: line.raw,
  });
}

export function formatAsCsv(line: ParsedLine, delimiter = ','): string {
  const escape = (v: string | null | undefined): string => {
    if (v == null) return '';
    const s = String(v);
    return s.includes(delimiter) || s.includes('"') || s.includes('\n')
      ? `"${s.replace(/"/g, '""')}"`
      : s;
  };
  return [
    escape(line.timestamp),
    escape(line.level),
    escape(line.source),
    escape(line.message),
  ].join(delimiter);
}

export function buildHeader(format: OutputFormat, delimiter = ','): string {
  const cols = ['timestamp', 'level', 'source', 'message'];
  if (format === 'csv' || format === 'tsv') {
    return cols.join(delimiter);
  }
  return '';
}

export function formatParsedLine(
  line: ParsedLine,
  opts: OutputFormatterOptions
): string {
  const delim = opts.format === 'tsv' ? '\t' : (opts.delimiter ?? ',');
  const lines: string[] = [];

  if (opts.includeHeader && !headerEmitted) {
    const header = buildHeader(opts.format, delim);
    if (header) lines.push(header);
    headerEmitted = true;
  }

  switch (opts.format) {
    case 'json':
      lines.push(formatAsJson(line));
      break;
    case 'csv':
      lines.push(formatAsCsv(line, delim));
      break;
    case 'tsv':
      lines.push(formatAsCsv(line, delim));
      break;
    default:
      lines.push(formatAsText(line));
  }

  return lines.join('\n');
}
