import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { of } from 'rxjs';

import { Repository } from '../../core/data/repository';
import { Ball, Game } from '../../models';
import { translocoTestingModule } from '../../../testing/transloco-testing';
import { GameEntry } from './game-entry';

function throwGame(over: Partial<Game> = {}): Game {
  return {
    id: 'g1',
    sessionId: 's1',
    index: 1,
    detailLevel: 'throw',
    frames: [],
    createdAt: 'x',
    updatedAt: 'x',
    ...over,
  };
}

function ball(id: string, name: string): Ball {
  return { id, name, active: true, createdAt: 'x', updatedAt: 'x' };
}

class FakeRepo implements Partial<Repository> {
  game: Game = throwGame();
  balls: Ball[] = [];
  saved: Game[] = [];

  getGame = async () => this.game;
  listBalls = async () => this.balls;
  getSession = async () => undefined;
  listGamesBySession = async () => [this.game];
  getCompetition = async () => undefined;
  getVenue = async () => undefined;
  saveGame = async (g: Game) => {
    this.saved.push(g);
  };
}

async function mount(repo: FakeRepo) {
  await TestBed.configureTestingModule({
    imports: [GameEntry, translocoTestingModule()],
    providers: [
      provideRouter([]),
      { provide: Repository, useValue: repo },
      { provide: ActivatedRoute, useValue: { paramMap: of(convertToParamMap({ id: 'g1' })) } },
    ],
  }).compileComponents();

  const fixture = TestBed.createComponent(GameEntry);
  fixture.detectChanges();
  await fixture.whenStable();
  fixture.detectChanges();
  return fixture;
}

describe('GameEntry — ball selection', () => {
  it('defaults the first ball to the primary ball on a fresh rack', async () => {
    const repo = new FakeRepo();
    repo.balls = [ball('a', 'Phaze'), ball('b', 'Spare')];
    repo.game = throwGame({ primaryBallId: 'a', spareBallId: 'b' });

    const fixture = await mount(repo);
    expect(fixture.componentInstance.selectedBallId()).toBe('a');
  });

  it('falls back to the first arsenal ball when the game has no ball set', async () => {
    const repo = new FakeRepo();
    repo.balls = [ball('a', 'Phaze'), ball('b', 'Spare')];
    repo.game = throwGame(); // no primary/spare

    const fixture = await mount(repo);
    expect(fixture.componentInstance.selectedBallId()).toBe('a');
  });

  it('is undefined when the arsenal is empty', async () => {
    const fixture = await mount(new FakeRepo());
    expect(fixture.componentInstance.selectedBallId()).toBeUndefined();
  });

  it('re-defaults to the spare ball after leaving a small spare, and tags the throw', async () => {
    const repo = new FakeRepo();
    repo.balls = [ball('a', 'Phaze'), ball('b', 'Spare')];
    repo.game = throwGame({ primaryBallId: 'a', spareBallId: 'b' });
    const fixture = await mount(repo);
    const cmp = fixture.componentInstance;

    // First ball: knock 8, leave the 7 and 10 (2 standing).
    await cmp.recordRack({ pinsKnocked: 8, pinsStanding: [7, 10] });
    fixture.detectChanges();

    expect(repo.saved.at(-1)?.frames?.[0].throws?.[0]).toMatchObject({ pinsKnocked: 8, ballId: 'a' });
    // 2 pins standing < 5 → default is now the spare ball.
    expect(cmp.selectedBallId()).toBe('b');
  });
});
