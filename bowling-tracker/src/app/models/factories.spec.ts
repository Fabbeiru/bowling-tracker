import { createGame, createSession } from './factories';

describe('createSession', () => {
  it('fills id, timestamps and defaults the date to today', () => {
    const s = createSession({ type: 'practice', defaultDetailLevel: 'frame' });
    expect(s.id).toMatch(/[0-9a-f-]{36}/);
    expect(s.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(s.createdAt).toBe(s.updatedAt);
    expect(s.type).toBe('practice');
  });

  it('keeps an explicit date', () => {
    expect(createSession({ type: 'league', date: '2026-01-15', defaultDetailLevel: 'total' }).date).toBe(
      '2026-01-15',
    );
  });
});

describe('createGame', () => {
  it('starts a total game without a frames array', () => {
    const g = createGame({ sessionId: 's1', index: 1, detailLevel: 'total' });
    expect(g.frames).toBeUndefined();
    expect(g.totalPins).toBeUndefined();
    expect(g.sessionId).toBe('s1');
  });

  it('starts a frame/throw game with an empty frames array', () => {
    expect(createGame({ sessionId: 's1', index: 2, detailLevel: 'frame' }).frames).toEqual([]);
    expect(createGame({ sessionId: 's1', index: 3, detailLevel: 'throw' }).frames).toEqual([]);
  });
});
