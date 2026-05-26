export interface PagerState {
  pageSize: number;
  currentPage: number;
  buffer: string[];
}

export function createPagerState(pageSize: number): PagerState {
  if (pageSize < 1) throw new Error('pageSize must be at least 1');
  return { pageSize, currentPage: 0, buffer: [] };
}

export function feedPager(state: PagerState, line: string): PagerState {
  return { ...state, buffer: [...state.buffer, line] };
}

export function getPage(state: PagerState, page: number): string[] {
  const start = page * state.pageSize;
  const end = start + state.pageSize;
  return state.buffer.slice(start, end);
}

export function currentPage(state: PagerState): string[] {
  return getPage(state, state.currentPage);
}

export function nextPage(state: PagerState): PagerState {
  const maxPage = Math.max(0, Math.ceil(state.buffer.length / state.pageSize) - 1);
  return { ...state, currentPage: Math.min(state.currentPage + 1, maxPage) };
}

export function prevPage(state: PagerState): PagerState {
  return { ...state, currentPage: Math.max(0, state.currentPage - 1) };
}

export function totalPages(state: PagerState): number {
  return Math.ceil(state.buffer.length / state.pageSize);
}

export function formatPagerSummary(state: PagerState): string {
  const total = totalPages(state);
  return `Page ${state.currentPage + 1} of ${total} (${state.buffer.length} lines, ${state.pageSize} per page)`;
}

export function resetPager(state: PagerState): PagerState {
  return { ...state, currentPage: 0 };
}
