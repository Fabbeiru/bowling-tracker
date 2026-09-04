import { nowLocalIso, todayLocalIso } from '../core/util/dates';
import { newId } from '../core/util/id';
import { Ball } from './ball';
import { CompetitionType, DetailLevel, Id, IsoDate, SessionType } from './common';
import { Competition } from './competition';
import { Game } from './game';
import { Session } from './session';
import { Venue } from './venue';

export interface NewSessionInput {
  type: SessionType;
  date?: IsoDate;
  competitionId?: Id;
  venueId?: Id;
  defaultDetailLevel: DetailLevel;
  notes?: string;
}

export function createSession(input: NewSessionInput): Session {
  const ts = nowLocalIso();
  return {
    id: newId(),
    type: input.type,
    date: input.date ?? todayLocalIso(),
    competitionId: input.competitionId,
    venueId: input.venueId,
    notes: input.notes,
    defaultDetailLevel: input.defaultDetailLevel,
    createdAt: ts,
    updatedAt: ts,
  };
}

export interface NewGameInput {
  sessionId: Id;
  index: number;
  detailLevel: DetailLevel;
  primaryBallId?: Id;
  spareBallId?: Id;
}

export function createBall(input: { name: string } & Partial<Ball>): Ball {
  const ts = nowLocalIso();
  return {
    id: newId(),
    name: input.name,
    brand: input.brand,
    weightLb: input.weightLb,
    coverstock: input.coverstock,
    layout: input.layout,
    imageUrl: input.imageUrl,
    notes: input.notes,
    active: input.active ?? true,
    createdAt: ts,
    updatedAt: ts,
  };
}

export function createVenue(input: { name: string } & Partial<Venue>): Venue {
  const ts = nowLocalIso();
  return {
    id: newId(),
    name: input.name,
    city: input.city,
    lanes: input.lanes,
    notes: input.notes,
    active: input.active ?? true,
    createdAt: ts,
    updatedAt: ts,
  };
}

export function createCompetition(
  input: { type: CompetitionType; name: string } & Partial<Competition>,
): Competition {
  const ts = nowLocalIso();
  return {
    id: newId(),
    type: input.type,
    name: input.name,
    season: input.season,
    startDate: input.startDate,
    endDate: input.endDate,
    notes: input.notes,
    active: input.active ?? true,
    createdAt: ts,
    updatedAt: ts,
  };
}

export function createGame(input: NewGameInput): Game {
  const ts = nowLocalIso();
  return {
    id: newId(),
    sessionId: input.sessionId,
    index: input.index,
    detailLevel: input.detailLevel,
    startedAt: ts,
    primaryBallId: input.primaryBallId,
    spareBallId: input.spareBallId,
    frames: input.detailLevel === 'total' ? undefined : [],
    createdAt: ts,
    updatedAt: ts,
  };
}
