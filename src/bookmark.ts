import * as fs from 'fs';
import * as path from 'path';

export interface Bookmark {
  filePath: string;
  byteOffset: number;
  timestamp: string;
  label?: string;
}

const BOOKMARK_DIR = '.logsnap';

export function getBookmarkPath(filePath: string): string {
  const safe = filePath.replace(/[\/\\:]/g, '_');
  return path.join(BOOKMARK_DIR, `${safe}.bookmark.json`);
}

export function saveBookmark(filePath: string, byteOffset: number, label?: string): Bookmark {
  if (!fs.existsSync(BOOKMARK_DIR)) {
    fs.mkdirSync(BOOKMARK_DIR, { recursive: true });
  }

  const bookmark: Bookmark = {
    filePath,
    byteOffset,
    timestamp: new Date().toISOString(),
    label,
  };

  const bookmarkPath = getBookmarkPath(filePath);
  fs.writeFileSync(bookmarkPath, JSON.stringify(bookmark, null, 2), 'utf-8');
  return bookmark;
}

export function loadBookmark(filePath: string): Bookmark | null {
  const bookmarkPath = getBookmarkPath(filePath);
  if (!fs.existsSync(bookmarkPath)) {
    return null;
  }
  try {
    const raw = fs.readFileSync(bookmarkPath, 'utf-8');
    return JSON.parse(raw) as Bookmark;
  } catch {
    return null;
  }
}

export function clearBookmark(filePath: string): boolean {
  const bookmarkPath = getBookmarkPath(filePath);
  if (fs.existsSync(bookmarkPath)) {
    fs.unlinkSync(bookmarkPath);
    return true;
  }
  return false;
}

export function readFromBookmark(filePath: string, bookmark: Bookmark): string[] {
  if (!fs.existsSync(filePath)) {
    return [];
  }
  const stat = fs.statSync(filePath);
  if (bookmark.byteOffset >= stat.size) {
    return [];
  }
  const fd = fs.openSync(filePath, 'r');
  const length = stat.size - bookmark.byteOffset;
  const buffer = Buffer.alloc(length);
  fs.readSync(fd, buffer, 0, length, bookmark.byteOffset);
  fs.closeSync(fd);
  return buffer.toString('utf-8').split('\n').filter((l) => l.length > 0);
}
