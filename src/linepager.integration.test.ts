import { createPagerState, feedPager, nextPage, currentPage, totalPages, formatPagerSummary } from './linepager';

describe('linepager integration', () => {
  function buildPager(lines: string[], pageSize: number) {
    let state = createPagerState(pageSize);
    for (const line of lines) {
      state = feedPager(state, line);
    }
    return state;
  }

  it('paginates a realistic log stream', () => {
    const logs = Array.from({ length: 25 }, (_, i) => `[INFO] 2024-01-01 event=${i}`);
    let state = buildPager(logs, 10);

    expect(totalPages(state)).toBe(3);
    expect(currentPage(state)).toHaveLength(10);
    expect(currentPage(state)[0]).toBe('[INFO] 2024-01-01 event=0');

    state = nextPage(state);
    expect(currentPage(state)[0]).toBe('[INFO] 2024-01-01 event=10');

    state = nextPage(state);
    expect(currentPage(state)).toHaveLength(5);
    expect(currentPage(state)[4]).toBe('[INFO] 2024-01-01 event=24');
  });

  it('handles single page scenario', () => {
    const logs = ['line1', 'line2', 'line3'];
    const state = buildPager(logs, 10);
    expect(totalPages(state)).toBe(1);
    expect(currentPage(state)).toEqual(logs);
    const after = nextPage(state);
    expect(after.currentPage).toBe(0);
  });

  it('summary reflects correct state after navigation', () => {
    const logs = Array.from({ length: 10 }, (_, i) => `log ${i}`);
    let state = buildPager(logs, 3);
    state = nextPage(state);
    const summary = formatPagerSummary(state);
    expect(summary).toContain('Page 2 of 4');
    expect(summary).toContain('10 lines');
    expect(summary).toContain('3 per page');
  });
});
