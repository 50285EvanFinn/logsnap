import * as fs from 'fs';
import * as path from 'path';
import {
  saveBookmark,
  loadBookmark,
  clearBookmark,
  readFromBookmark,
  getBookmarkPath,
} from './bookmark';

const TEST_LOG = path.join(__dirname, '__test_bookmark.log');
const BOOKMARK_DIR = '.logsnap';

function cleanup() {
  if (fs.existsSync(TEST_LOG)) fs.unlinkSync(TEST_LOG);
  const bPath = getBookmarkPath(TEST_LOG);
  if (fs.existsSync(bPath)) fs.unlinkSync(bPath);
}

beforeEach(cleanup);
afterAll(cleanup);

describe('saveBookmark / loadBookmark', () => {
  it('saves and loads a bookmark', () => {
    const bm = saveBookmark(TEST_LOG, 128, 'my-label');
    expect(bm.byteOffset).toBe(128);
    expect(bm.label).toBe('my-label');
    expect(bm.filePath).toBe(TEST_LOG);

    const loaded = loadBookmark(TEST_LOG);
    expect(loaded).not.toBeNull();
    expect(loaded!.byteOffset).toBe(128);
    expect(loaded!.label).toBe('my-label');
  });

  it('returns null when no bookmark exists', () => {
    const result = loadBookmark('/nonexistent/file.log');
    expect(result).toBeNull();
  });

  it('saves bookmark without a label', () => {
    const bm = saveBookmark(TEST_LOG, 0);
    expect(bm.label).toBeUndefined();
  });
});

describe('clearBookmark', () => {
  it('removes an existing bookmark and returns true', () => {
    saveBookmark(TEST_LOG, 50);
    const result = clearBookmark(TEST_LOG);
    expect(result).toBe(true);
    expect(loadBookmark(TEST_LOG)).toBeNull();
  });

  it('returns false when bookmark does not exist', () => {
    const result = clearBookmark('/nonexistent/file.log');
    expect(result).toBe(false);
  });
});

describe('readFromBookmark', () => {
  it('reads lines after the bookmark offset', () => {
    const initial = 'line one\n';
    const extra = 'line two\nline three\n';
    fs.writeFileSync(TEST_LOG, initial, 'utf-8');
    const offset = Buffer.byteLength(initial, 'utf-8');
    fs.appendFileSync(TEST_LOG, extra, 'utf-8');

    const bm = saveBookmark(TEST_LOG, offset);
    const lines = readFromBookmark(TEST_LOG, bm);
    expect(lines).toEqual(['line two', 'line three']);
  });

  it('returns empty array when offset is at end of file', () => {
    fs.writeFileSync(TEST_LOG, 'hello\n', 'utf-8');
    const stat = fs.statSync(TEST_LOG);
    const bm = saveBookmark(TEST_LOG, stat.size);
    const lines = readFromBookmark(TEST_LOG, bm);
    expect(lines).toEqual([]);
  });

  it('returns empty array for missing file', () => {
    const bm = saveBookmark('/nonexistent.log', 0);
    const lines = readFromBookmark('/nonexistent.log', bm);
    expect(lines).toEqual([]);
  });
});
