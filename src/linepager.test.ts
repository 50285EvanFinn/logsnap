import {
  createPagerState,
  feedPager,
  getPage,
  currentPage,
  nextPage,
  prevPage,
  totalPages,
  formatPagerSummary,
  resetPager,
} from './linepager';

describe('createPagerState', () => {
  it('creates state with given page size', () => {
    const state = createPagerState(10);
    expect(state.pageSize).toBe(10);
    expect(state.currentPage).toBe(0);
    expect(state.buffer).toEqual([]);
  });

  it('throws if pageSize < 1', () => {
    expect(() => createPagerState(0)).toThrow('pageSize must be at least 1');
  });
});

describe('feedPager', () => {
  it('appends line to buffer', () => {
    let state = createPagerState(5);
    state = feedPager(state, 'line one');
    state = feedPager(state, 'line two');
    expect(state.buffer).toEqual(['line one', 'line two']);
  });
});

describe('getPage', () => {
  it('returns correct slice', () => {
    let state = createPagerState(2);
    ['a', 'b', 'c', 'd', 'e'].forEach(l => { state = feedPager(state, l); });
    expect(getPage(state, 0)).toEqual(['a', 'b']);
    expect(getPage(state, 1)).toEqual(['c', 'd']);
    expect(getPage(state, 2)).toEqual(['e']);
  });
});

describe('nextPage / prevPage', () => {
  it('advances and retreats page', () => {
    let state = createPagerState(2);
    ['a', 'b', 'c', 'd'].forEach(l => { state = feedPager(state, l); });
    state = nextPage(state);
    expect(state.currentPage).toBe(1);
    expect(currentPage(state)).toEqual(['c', 'd']);
    state = prevPage(state);
    expect(state.currentPage).toBe(0);
  });

  it('does not go below 0', () => {
    const state = prevPage(createPagerState(5));
    expect(state.currentPage).toBe(0);
  });

  it('does not exceed last page', () => {
    let state = createPagerState(5);
    state = feedPager(state, 'only');
    state = nextPage(state);
    expect(state.currentPage).toBe(0);
  });
});

describe('totalPages', () => {
  it('calculates total pages', () => {
    let state = createPagerState(3);
    ['a', 'b', 'c', 'd'].forEach(l => { state = feedPager(state, l); });
    expect(totalPages(state)).toBe(2);
  });
});

describe('formatPagerSummary', () => {
  it('returns readable summary', () => {
    let state = createPagerState(5);
    ['a', 'b', 'c', 'd', 'e', 'f'].forEach(l => { state = feedPager(state, l); });
    expect(formatPagerSummary(state)).toBe('Page 1 of 2 (6 lines, 5 per page)');
  });
});

describe('resetPager', () => {
  it('resets to page 0', () => {
    let state = createPagerState(2);
    ['a', 'b', 'c', 'd'].forEach(l => { state = feedPager(state, l); });
    state = nextPage(state);
    state = resetPager(state);
    expect(state.currentPage).toBe(0);
  });
});
