import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { existsSync, readFileSync, unlinkSync } from 'fs';
import { exportLines, formatLineAsJson } from './exporter';

const TEST_OUTPUT = '/tmp/logsnap_test_output.txt';

function cleanup() {
  if (existsSync(TEST_OUTPUT)) {
    unlinkSync(TEST_OUTPUT);
  }
}

describe('formatLineAsJson', () => {
  it('should return a valid JSON string with index and message', () => {
    const result = formatLineAsJson('hello world', 0);
    const parsed = JSON.parse(result);
    expect(parsed.index).toBe(0);
    expect(parsed.message).toBe('hello world');
    expect(parsed.timestamp).toBeDefined();
  });

  it('should include the correct index', () => {
    const result = formatLineAsJson('error occurred', 5);
    const parsed = JSON.parse(result);
    expect(parsed.index).toBe(5);
  });
});

describe('exportLines', () => {
  beforeEach(cleanup);
  afterEach(cleanup);

  it('should write plain lines to a file', async () => {
    const lines = ['line one', 'line two', 'line three'];
    const result = await exportLines(lines, { outputPath: TEST_OUTPUT, format: 'plain' });

    expect(result.linesWritten).toBe(3);
    const content = readFileSync(TEST_OUTPUT, 'utf-8');
    expect(content).toContain('line one');
    expect(content).toContain('line three');
  });

  it('should write JSON lines to a file', async () => {
    const lines = ['error: something failed'];
    await exportLines(lines, { outputPath: TEST_OUTPUT, format: 'json' });

    const content = readFileSync(TEST_OUTPUT, 'utf-8');
    const parsed = JSON.parse(content.trim());
    expect(parsed.message).toBe('error: something failed');
  });

  it('should append lines when append option is true', async () => {
    const first = ['first line'];
    const second = ['second line'];

    await exportLines(first, { outputPath: TEST_OUTPUT, format: 'plain' });
    await exportLines(second, { outputPath: TEST_OUTPUT, format: 'plain', append: true });

    const content = readFileSync(TEST_OUTPUT, 'utf-8');
    expect(content).toContain('first line');
    expect(content).toContain('second line');
  });

  it('should return the correct file path', async () => {
    const result = await exportLines(['test'], { outputPath: TEST_OUTPUT, format: 'plain' });
    expect(result.filePath).toBe(TEST_OUTPUT);
  });
});
