import * as fs from 'fs';
import * as path from 'path';
import { FilterOptions } from './filter';
import { formatLine } from './formatter';
import { formatLineAsJson } from './exporter';

export type SnapshotFormat = 'text' | 'json' | 'raw';

export interface SnapshotOptions {
  outputDir?: string;
  format?: SnapshotFormat;
  label?: string;
}

export interface SnapshotResult {
  filePath: string;
  lineCount: number;
  format: SnapshotFormat;
  createdAt: Date;
}

export function generateSnapshotFilename(
  label: string | undefined,
  format: SnapshotFormat
): string {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const ext = format === 'json' ? 'json' : 'txt';
  const base = label ? `${label}-${timestamp}` : `snapshot-${timestamp}`;
  return `${base}.${ext}`;
}

export function writeSnapshot(
  lines: string[],
  options: SnapshotOptions = {}
): SnapshotResult {
  const format = options.format ?? 'text';
  const outputDir = options.outputDir ?? process.cwd();
  const filename = generateSnapshotFilename(options.label, format);
  const filePath = path.join(outputDir, filename);

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  let content: string;

  if (format === 'json') {
    const records = lines.map((line) => formatLineAsJson(line));
    content = JSON.stringify(records, null, 2);
  } else if (format === 'text') {
    content = lines.map((line) => formatLine(line)).join('\n');
  } else {
    content = lines.join('\n');
  }

  fs.writeFileSync(filePath, content, 'utf-8');

  return {
    filePath,
    lineCount: lines.length,
    format,
    createdAt: new Date(),
  };
}
