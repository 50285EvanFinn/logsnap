import { Tailer, TailerOptions } from './tailer';
import { filterLines, buildFilter, FilterOptions } from './filter';
import { highlightLines } from './highlighter';
import { formatLineAsJson } from './exporter';

export interface WatcherOptions {
  tailerOptions: TailerOptions;
  filter?: FilterOptions;
  highlight?: string[];
  exportJson?: boolean;
  onLine?: (output: string) => void;
}

export class Watcher {
  private tailer: Tailer;
  private options: WatcherOptions;
  private predicate: ((line: string) => boolean) | null = null;

  constructor(options: WatcherOptions) {
    this.options = options;
    this.tailer = new Tailer(options.tailerOptions);

    // Pre-build the filter predicate once rather than on every line
    if (options.filter) {
      this.predicate = buildFilter(options.filter);
    }

    this.tailer.on('line', (line: string) => this.handleLine(line));
    this.tailer.on('truncated', () => console.warn('[logsnap] File truncated, resetting position.'));
    this.tailer.on('error', (err: Error) => console.error('[logsnap] Error:', err.message));
  }

  private handleLine(line: string): void {
    const { highlight, exportJson, onLine } = this.options;

    if (this.predicate) {
      const matched = filterLines([line], this.predicate);
      if (matched.length === 0) return;
    }

    let output: string;
    if (exportJson) {
      output = formatLineAsJson(line);
    } else if (highlight && highlight.length > 0) {
      const highlighted = highlightLines([line], highlight);
      output = highlighted[0] ?? line;
    } else {
      output = line;
    }

    if (onLine) {
      onLine(output);
    } else {
      process.stdout.write(output + '\n');
    }
  }

  start(): void {
    this.tailer.start();
  }

  stop(): void {
    this.tailer.stop();
  }
}

export function createWatcher(options: WatcherOptions): Watcher {
  return new Watcher(options);
}
