import * as fs from 'fs';
import { saveBookmark, loadBookmark, clearBookmark, readFromBookmark, Bookmark } from './bookmark';

export interface BookmarkManagerOptions {
  autoAdvance?: boolean;
}

export interface ResumeResult {
  lines: string[];
  bookmark: Bookmark;
  newOffset: number;
}

export function createBookmarkManager(options: BookmarkManagerOptions = {}) {
  const { autoAdvance = true } = options;

  function mark(filePath: string, label?: string): Bookmark {
    if (!fs.existsSync(filePath)) {
      throw new Error(`File not found: ${filePath}`);
    }
    const stat = fs.statSync(filePath);
    return saveBookmark(filePath, stat.size, label);
  }

  function resume(filePath: string): ResumeResult | null {
    const bookmark = loadBookmark(filePath);
    if (!bookmark) {
      return null;
    }

    const lines = readFromBookmark(filePath, bookmark);
    let newOffset = bookmark.byteOffset;

    if (autoAdvance && fs.existsSync(filePath)) {
      const stat = fs.statSync(filePath);
      newOffset = stat.size;
      saveBookmark(filePath, newOffset, bookmark.label);
    }

    return { lines, bookmark, newOffset };
  }

  function clear(filePath: string): boolean {
    return clearBookmark(filePath);
  }

  function status(filePath: string): { exists: boolean; offset: number | null; label?: string } {
    const bookmark = loadBookmark(filePath);
    if (!bookmark) {
      return { exists: false, offset: null };
    }
    return { exists: true, offset: bookmark.byteOffset, label: bookmark.label };
  }

  return { mark, resume, clear, status };
}
