/**
 * lineannotator.ts
 * Annotates log lines with metadata tags (e.g. line number, source file, timestamp prefix).
 */

export interface AnnotationOptions {
  showLineNumbers?: boolean;
  lineNumberStart?: number;
  showSource?: boolean;
  source?: string;
  showTimestampPrefix?: boolean;
  timestampPrefix?: string;
}

export interface AnnotatedLine {
  original: string;
  annotated: string;
  lineNumber: number;
  source?: string;
}

export function annotateLine(
  line: string,
  lineNumber: number,
  options: AnnotationOptions = {}
): AnnotatedLine {
  const parts: string[] = [];

  if (options.showLineNumbers ?? true) {
    parts.push(`[${lineNumber}]`);
  }

  if (options.showSource && options.source) {
    parts.push(`(${options.source})`);
  }

  if (options.showTimestampPrefix && options.timestampPrefix) {
    parts.push(`${options.timestampPrefix}`);
  }

  const prefix = parts.length > 0 ? parts.join(' ') + ' ' : '';

  return {
    original: line,
    annotated: `${prefix}${line}`,
    lineNumber,
    source: options.source,
  };
}

export function annotateLines(
  lines: string[],
  options: AnnotationOptions = {}
): AnnotatedLine[] {
  const start = options.lineNumberStart ?? 1;
  return lines.map((line, i) => annotateLine(line, start + i, options));
}

export function stripAnnotation(annotated: AnnotatedLine): string {
  return annotated.original;
}

export function formatAnnotated(annotated: AnnotatedLine): string {
  return annotated.annotated;
}
