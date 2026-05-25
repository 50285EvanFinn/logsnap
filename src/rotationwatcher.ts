import * as fs from 'fs';
import * as path from 'path';

export interface RotationState {
  filePath: string;
  inode: number | null;
  size: number;
}

export function createRotationState(filePath: string): RotationState {
  return { filePath, inode: null, size: 0 };
}

export function statFile(filePath: string): { inode: number; size: number } | null {
  try {
    const st = fs.statSync(filePath);
    return { inode: st.ino, size: st.size };
  } catch {
    return null;
  }
}

export type RotationEvent = 'rotated' | 'truncated' | 'none' | 'missing';

export function detectRotation(state: RotationState): RotationEvent {
  const info = statFile(state.filePath);
  if (!info) return 'missing';

  if (state.inode === null) {
    state.inode = info.inode;
    state.size = info.size;
    return 'none';
  }

  if (info.inode !== state.inode) {
    state.inode = info.inode;
    state.size = info.size;
    return 'rotated';
  }

  if (info.size < state.size) {
    state.size = info.size;
    return 'truncated';
  }

  state.size = info.size;
  return 'none';
}

export function resolveRotatedPath(filePath: string): string {
  const dir = path.dirname(filePath);
  const base = path.basename(filePath);
  const candidate = path.join(dir, base + '.1');
  if (fs.existsSync(candidate)) return candidate;
  return filePath;
}
