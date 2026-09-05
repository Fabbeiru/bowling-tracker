import { AppData, EXPORT_SCHEMA_VERSION, parseImport, serializeExport } from './data-transfer';

function sampleData(): AppData {
  return {
    balls: [
      { id: 'b1', name: 'Phaze II', role: 'strike', weightLb: 15, active: true, createdAt: 'x', updatedAt: 'x' },
      { id: 'b2', name: 'Hammer', role: 'spare', active: false, createdAt: 'x', updatedAt: 'x' },
    ],
    venues: [{ id: 'v1', name: 'Bowling Center', city: 'Madrid', active: true, createdAt: 'x', updatedAt: 'x' }],
    competitions: [
      { id: 'c1', type: 'league', name: 'Liga', season: '2026/27', active: true, createdAt: 'x', updatedAt: 'x' },
    ],
    sessions: [
      {
        id: 's1',
        type: 'league',
        date: '2026-09-05',
        competitionId: 'c1',
        venueId: 'v1',
        defaultDetailLevel: 'throw',
        createdAt: 'x',
        updatedAt: 'x',
      },
    ],
    games: [
      {
        id: 'g1',
        sessionId: 's1',
        index: 1,
        detailLevel: 'throw',
        primaryBallId: 'b1',
        spareBallId: 'b2',
        frames: [
          { index: 1, throws: [{ index: 1, pinsKnocked: 8, pinsStanding: [7, 10], ballId: 'b1' }] },
        ],
        createdAt: 'x',
        updatedAt: 'x',
      },
      { id: 'g2', sessionId: 's1', index: 2, detailLevel: 'total', totalPins: 180, createdAt: 'x', updatedAt: 'x' },
    ],
  };
}

function importOf(mutate: (root: Record<string, unknown>) => void): ReturnType<typeof parseImport> {
  const root = JSON.parse(serializeExport(sampleData()));
  mutate(root);
  return parseImport(JSON.stringify(root));
}

describe('data-transfer — round trip', () => {
  it('exports and re-imports the same data', () => {
    const data = sampleData();
    const result = parseImport(serializeExport(data));
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data).toEqual(data);
      expect(result.summary).toEqual({ balls: 2, venues: 1, competitions: 1, sessions: 1, games: 2 });
    }
  });

  it('accepts empty collections', () => {
    const data: AppData = { balls: [], venues: [], competitions: [], sessions: [], games: [] };
    const result = parseImport(serializeExport(data));
    expect(result.ok).toBe(true);
  });
});

describe('data-transfer — rejections', () => {
  const cases: [string, string][] = [
    ['', 'errors.importEmpty'],
    ['   \n  ', 'errors.importEmpty'],
    ['not json at all', 'errors.importNotJson'],
    ['[]', 'errors.importNotJson'],
    ['"a string"', 'errors.importNotJson'],
    ['42', 'errors.importNotJson'],
  ];
  for (const [text, error] of cases) {
    it(`rejects ${JSON.stringify(text)} -> ${error}`, () => {
      expect(parseImport(text)).toEqual({ ok: false, error });
    });
  }

  it('rejects a wrong format tag', () => {
    expect(importOf((r) => (r['format'] = 'something-else'))).toEqual({
      ok: false,
      error: 'errors.importWrongFormat',
    });
  });

  it('rejects an incompatible schema version', () => {
    expect(importOf((r) => (r['schemaVersion'] = EXPORT_SCHEMA_VERSION + 1))).toEqual({
      ok: false,
      error: 'errors.importWrongVersion',
    });
    expect(importOf((r) => (r['schemaVersion'] = '1'))).toEqual({
      ok: false,
      error: 'errors.importWrongVersion',
    });
  });

  it('rejects when a collection is missing or not an array', () => {
    expect(importOf((r) => delete (r['data'] as Record<string, unknown>)['games'])).toEqual({
      ok: false,
      error: 'errors.importBadStructure',
    });
    expect(importOf((r) => ((r['data'] as Record<string, unknown>)['balls'] = {}))).toEqual({
      ok: false,
      error: 'errors.importBadStructure',
    });
  });

  it('rejects a record with the wrong field types', () => {
    expect(
      importOf((r) => ((r['data'] as { balls: unknown[] }).balls[0] = { id: 'b1', name: 5, active: true, createdAt: 'x', updatedAt: 'x' })),
    ).toEqual({ ok: false, error: 'errors.importBadRecord' });
  });

  it('rejects an out-of-range number', () => {
    expect(
      importOf((r) => ((r['data'] as { games: Record<string, unknown>[] }).games[1]['totalPins'] = 999)),
    ).toEqual({ ok: false, error: 'errors.importBadRecord' });
  });

  it('rejects an unknown enum value', () => {
    expect(
      importOf((r) => ((r['data'] as { sessions: Record<string, unknown>[] }).sessions[0]['type'] = 'party')),
    ).toEqual({ ok: false, error: 'errors.importBadRecord' });
  });

  it('rejects duplicate ids within a collection', () => {
    expect(
      importOf((r) => {
        const balls = (r['data'] as { balls: Record<string, unknown>[] }).balls;
        balls[1]['id'] = balls[0]['id'];
      }),
    ).toEqual({ ok: false, error: 'errors.importDuplicateId' });
  });

  it('rejects a game pointing at a session that is not in the file', () => {
    expect(
      importOf((r) => ((r['data'] as { games: Record<string, unknown>[] }).games[0]['sessionId'] = 'ghost')),
    ).toEqual({ ok: false, error: 'errors.importBrokenRef' });
  });

  it('rejects a throw tagged with a ball that is not in the file', () => {
    expect(
      importOf((r) => {
        const throws = ((r['data'] as { games: { frames: { throws: Record<string, unknown>[] }[] }[] }).games[0]
          .frames[0].throws)!;
        throws[0]['ballId'] = 'ghost-ball';
      }),
    ).toEqual({ ok: false, error: 'errors.importBrokenRef' });
  });

  it('drops unknown fields and is immune to __proto__ payloads', () => {
    // Written as a raw string: JSON.parse turns "__proto__" into an own key
    // (it does not invoke the prototype setter), which is the real attack shape.
    const raw =
      '{"format":"bowling-tracker","schemaVersion":1,"exportedAt":"x","data":{' +
      '"balls":[{"id":"b1","name":"X","active":true,"createdAt":"x","updatedAt":"x",' +
      '"evil":"y","__proto__":{"polluted":true}}],' +
      '"venues":[],"competitions":[],"sessions":[],"games":[]}}';
    const result = parseImport(raw);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect('evil' in result.data.balls[0]).toBe(false);
      expect(Object.getPrototypeOf(result.data.balls[0])).toBe(Object.prototype);
      expect(({} as Record<string, unknown>)['polluted']).toBeUndefined();
    }
  });
});
