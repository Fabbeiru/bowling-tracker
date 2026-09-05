import { TestBed } from '@angular/core/testing';

import { AppDb, APP_DB } from '../db/app-db';
import { Ball, Game, Session } from '../../models';
import { nowLocalIso, todayLocalIso } from '../util/dates';
import { newId } from '../util/id';
import { DexieRepository } from './dexie-repository';

function ball(name: string, active = true): Ball {
  const ts = nowLocalIso();
  return { id: newId(), name, active, createdAt: ts, updatedAt: ts };
}

function session(): Session {
  const ts = nowLocalIso();
  return {
    id: newId(),
    type: 'practice',
    date: todayLocalIso(),
    defaultDetailLevel: 'frame',
    createdAt: ts,
    updatedAt: ts,
  };
}

function game(sessionId: string, index: number): Game {
  const ts = nowLocalIso();
  return {
    id: newId(),
    sessionId,
    index,
    detailLevel: 'total',
    totalPins: 150 + index,
    createdAt: ts,
    updatedAt: ts,
  };
}

describe('DexieRepository', () => {
  let repo: DexieRepository;
  let db: AppDb;

  beforeEach(() => {
    db = new AppDb(`bowling-tracker-test-${newId()}`);
    TestBed.configureTestingModule({
      providers: [{ provide: APP_DB, useValue: db }],
    });
    repo = TestBed.inject(DexieRepository);
  });

  afterEach(async () => {
    await db.delete();
  });

  it('lists only active balls, sorted by name', async () => {
    await repo.saveBall(ball('Zzz'));
    await repo.saveBall(ball('Aaa'));
    await repo.saveBall(ball('Retired', false));

    const active = await repo.listBalls();
    expect(active.map((b) => b.name)).toEqual(['Aaa', 'Zzz']);

    const all = await repo.listBalls({ includeInactive: true });
    expect(all.length).toBe(3);
  });

  it('soft-deletes a ball', async () => {
    const b = ball('Storm');
    await repo.saveBall(b);
    await repo.deactivateBall(b.id);

    expect((await repo.getBall(b.id))?.active).toBe(false);
    expect(await repo.listBalls()).toEqual([]);
  });

  it('hard-deletes a ball', async () => {
    const b = ball('Hammer');
    await repo.saveBall(b);
    await repo.deleteBall(b.id);
    expect(await repo.getBall(b.id)).toBeUndefined();
  });

  it('deleting a session removes its games', async () => {
    const s = session();
    await repo.saveSession(s);
    await repo.saveGame(game(s.id, 1));
    await repo.saveGame(game(s.id, 2));

    expect((await repo.listGamesBySession(s.id)).length).toBe(2);

    await repo.deleteSession(s.id);

    expect(await repo.getSession(s.id)).toBeUndefined();
    expect(await repo.listGames()).toEqual([]);
  });

  it('returns games of a session ordered by index', async () => {
    const s = session();
    await repo.saveSession(s);
    await repo.saveGame(game(s.id, 3));
    await repo.saveGame(game(s.id, 1));
    await repo.saveGame(game(s.id, 2));

    const games = await repo.listGamesBySession(s.id);
    expect(games.map((g) => g.index)).toEqual([1, 2, 3]);
  });

  it('returns default meta when nothing is stored', async () => {
    const meta = await repo.getMeta();
    expect(meta.id).toBe('app');
    expect(meta.schemaVersion).toBe(1);
    expect(meta.settings.locale).toBe('es');
  });

  it('persists meta changes', async () => {
    const meta = await repo.getMeta();
    await repo.saveMeta({ ...meta, schemaVersion: 2 });
    expect((await repo.getMeta()).schemaVersion).toBe(2);
  });

  it('stamps updatedAt on every save', async () => {
    const b = ball('Phaze');
    b.updatedAt = '2000-01-01T00:00';
    await repo.saveBall(b);
    expect((await repo.getBall(b.id))?.updatedAt).not.toBe('2000-01-01T00:00');
  });

  it('exports every content table', async () => {
    const s = session();
    await repo.saveSession(s);
    await repo.saveGame(game(s.id, 1));
    await repo.saveBall(ball('Storm'));

    const data = await repo.exportData();
    expect(data.balls.length).toBe(1);
    expect(data.sessions.length).toBe(1);
    expect(data.games.length).toBe(1);
    expect(Object.keys(data).sort()).toEqual(['balls', 'competitions', 'games', 'sessions', 'venues']);
  });

  it('replaceData wipes and reloads atomically', async () => {
    await repo.saveBall(ball('Old'));
    const s = session();
    const g = game(s.id, 1);
    await repo.replaceData({
      balls: [ball('New')],
      venues: [],
      competitions: [],
      sessions: [s],
      games: [g],
    });
    const balls = await repo.listBalls();
    expect(balls.map((b) => b.name)).toEqual(['New']);
    expect((await repo.listGames()).length).toBe(1);
  });

  it('clearData empties content but keeps meta', async () => {
    await repo.saveBall(ball('Storm'));
    await repo.saveMeta({ ...(await repo.getMeta()), schemaVersion: 7 });

    await repo.clearData();

    expect(await repo.listBalls({ includeInactive: true })).toEqual([]);
    expect((await repo.getMeta()).schemaVersion).toBe(7);
  });
});
