import { createWriteStream, WriteStream } from 'fs';
import { resolve } from 'path';

export type ExportFormat = 'plain' | 'json';

export interface ExportOptions {
  outputPath: string;
  format: ExportFormat;
  append?: boolean;
}

export interface ExportResult {
  filePath: string;
  linesWritten: number;
}

export function formatLineAsJson(line: string, index: number): string {
  return JSON.stringify({ index, timestamp: new Date().toISOString(), message: line });
}

export async function exportLines(
  lines: string[],
  options: ExportOptions
): Promise<ExportResult> {
  const filePath = resolve(options.outputPath);
  const flags = options.append ? 'a' : 'w';
  const stream: WriteStream = createWriteStream(filePath, { flags });

  return new Promise((resolve, reject) => {
    let linesWritten = 0;

    const writeNext = (index: number): void => {
      if (index >= lines.length) {
        stream.end();
        return;
      }

      const raw = lines[index];
      const formatted =
        options.format === 'json'
          ? formatLineAsJson(raw, index) + '\n'
          : raw + '\n';

      const canContinue = stream.write(formatted);
      linesWritten++;

      if (canContinue) {
        writeNext(index + 1);
      } else {
        stream.once('drain', () => writeNext(index + 1));
      }
    };

    stream.on('finish', () => resolve({ filePath: options.outputPath, linesWritten }));
    stream.on('error', reject);

    writeNext(0);
  });
}
