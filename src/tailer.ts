import * as fs from 'fs';
import * as readline from 'readline';
import { EventEmitter } from 'events';

export interface TailerOptions {
  filePath: string;
  pollIntervalMs?: number;
  fromBeginning?: boolean;
}

export class Tailer extends EventEmitter {
  private filePath: string;
  private pollIntervalMs: number;
  private fromBeginning: boolean;
  private position: number = 0;
  private timer: NodeJS.Timeout | null = null;
  private running: boolean = false;

  constructor(options: TailerOptions) {
    super();
    this.filePath = options.filePath;
    this.pollIntervalMs = options.pollIntervalMs ?? 250;
    this.fromBeginning = options.fromBeginning ?? false;
  }

  start(): void {
    if (this.running) return;
    this.running = true;

    if (!this.fromBeginning) {
      try {
        const stat = fs.statSync(this.filePath);
        this.position = stat.size;
      } catch {
        this.position = 0;
      }
    }

    this.timer = setInterval(() => this.poll(), this.pollIntervalMs);
  }

  stop(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    this.running = false;
  }

  private poll(): void {
    let stat: fs.Stats;
    try {
      stat = fs.statSync(this.filePath);
    } catch {
      this.emit('error', new Error(`File not found: ${this.filePath}`));
      return;
    }

    if (stat.size < this.position) {
      this.position = 0;
      this.emit('truncated');
    }

    if (stat.size === this.position) return;

    const stream = fs.createReadStream(this.filePath, {
      start: this.position,
      end: stat.size,
    });

    const rl = readline.createInterface({ input: stream, crlfDelay: Infinity });

    rl.on('line', (line: string) => {
      if (line.length > 0) this.emit('line', line);
    });

    rl.on('close', () => {
      this.position = stat.size;
    });
  }
}

export function createTailer(options: TailerOptions): Tailer {
  return new Tailer(options);
}
