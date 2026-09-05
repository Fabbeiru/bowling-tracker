import { Ball, Competition, Frame, Game, Session, Throw, Venue } from '../../models';
import { nowLocalIso } from '../util/dates';

/** All of the user's content — everything an export/import moves. `meta`
 *  (schema version, locale) stays put; it is app config, not user data. */
export interface AppData {
  balls: Ball[];
  venues: Venue[];
  competitions: Competition[];
  sessions: Session[];
  games: Game[];
}

export interface ExportFile {
  format: typeof EXPORT_FORMAT;
  schemaVersion: number;
  exportedAt: string;
  data: AppData;
}

export interface ImportSummary {
  balls: number;
  venues: number;
  competitions: number;
  sessions: number;
  games: number;
}

export type ImportResult =
  | { ok: true; data: AppData; summary: ImportSummary }
  /** i18n key under `errors.*`. */
  | { ok: false; error: string };

export const EXPORT_FORMAT = 'bowling-tracker';
export const EXPORT_SCHEMA_VERSION = 1;
/** Hard ceiling on the file we will even try to parse. A real export is KB. */
export const MAX_IMPORT_BYTES = 25 * 1024 * 1024;

const MAX_GAMES = 50_000;
const MAX_ID = 200;
const MAX_NAME = 200;
const MAX_TEXT = 4000;
const MAX_DATE = 40;
const MAX_URL = 2048;

const COLLECTIONS = ['balls', 'venues', 'competitions', 'sessions', 'games'] as const;

export function serializeExport(data: AppData): string {
  const file: ExportFile = {
    format: EXPORT_FORMAT,
    schemaVersion: EXPORT_SCHEMA_VERSION,
    exportedAt: nowLocalIso(),
    data,
  };
  return JSON.stringify(file, null, 2);
}

/**
 * Validate an import file from scratch and return clean, typed data — or an
 * i18n error key. Nothing here touches the database; the caller only writes
 * after `ok: true`. Records are rebuilt field by field (a whitelist), so
 * unknown keys are dropped and `__proto__`-style payloads can't do anything.
 */
export function parseImport(text: string): ImportResult {
  const fail = (error: string): ImportResult => ({ ok: false, error });

  if (typeof text !== 'string' || text.trim() === '') return fail('errors.importEmpty');
  if (text.length > MAX_IMPORT_BYTES) return fail('errors.importTooBig');

  let root: unknown;
  try {
    root = JSON.parse(text);
  } catch {
    return fail('errors.importNotJson');
  }
  if (!isRecord(root)) return fail('errors.importNotJson');

  if (root['format'] !== EXPORT_FORMAT) return fail('errors.importWrongFormat');
  if (root['schemaVersion'] !== EXPORT_SCHEMA_VERSION) return fail('errors.importWrongVersion');

  const data = root['data'];
  if (!isRecord(data)) return fail('errors.importNoData');
  for (const c of COLLECTIONS) {
    if (!Array.isArray(data[c])) return fail('errors.importBadStructure');
  }
  if ((data['games'] as unknown[]).length > MAX_GAMES) return fail('errors.importTooMany');

  const balls = sanitizeAll(data['balls'] as unknown[], sanitizeBall);
  const venues = sanitizeAll(data['venues'] as unknown[], sanitizeVenue);
  const competitions = sanitizeAll(data['competitions'] as unknown[], sanitizeCompetition);
  const sessions = sanitizeAll(data['sessions'] as unknown[], sanitizeSession);
  const games = sanitizeAll(data['games'] as unknown[], sanitizeGame);
  if (!balls || !venues || !competitions || !sessions || !games) {
    return fail('errors.importBadRecord');
  }

  for (const arr of [balls, venues, competitions, sessions, games]) {
    if (new Set(arr.map((r) => r.id)).size !== arr.length) return fail('errors.importDuplicateId');
  }

  const ballIds = idSet(balls);
  const venueIds = idSet(venues);
  const compIds = idSet(competitions);
  const sessionIds = idSet(sessions);

  for (const s of sessions) {
    if (s.competitionId && !compIds.has(s.competitionId)) return fail('errors.importBrokenRef');
    if (s.venueId && !venueIds.has(s.venueId)) return fail('errors.importBrokenRef');
    if (s.defaultPrimaryBallId && !ballIds.has(s.defaultPrimaryBallId)) return fail('errors.importBrokenRef');
    if (s.defaultSpareBallId && !ballIds.has(s.defaultSpareBallId)) return fail('errors.importBrokenRef');
  }
  for (const g of games) {
    if (!sessionIds.has(g.sessionId)) return fail('errors.importBrokenRef');
    if (g.primaryBallId && !ballIds.has(g.primaryBallId)) return fail('errors.importBrokenRef');
    if (g.spareBallId && !ballIds.has(g.spareBallId)) return fail('errors.importBrokenRef');
    for (const f of g.frames ?? []) {
      for (const bid of [f.firstBallId, f.secondBallId, f.thirdBallId]) {
        if (bid && !ballIds.has(bid)) return fail('errors.importBrokenRef');
      }
      for (const t of f.throws ?? []) {
        if (t.ballId && !ballIds.has(t.ballId)) return fail('errors.importBrokenRef');
      }
    }
  }

  return {
    ok: true,
    data: { balls, venues, competitions, sessions, games },
    summary: {
      balls: balls.length,
      venues: venues.length,
      competitions: competitions.length,
      sessions: sessions.length,
      games: games.length,
    },
  };
}

// --- helpers ---

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}
function isStr(v: unknown, max: number): v is string {
  return typeof v === 'string' && v.length <= max;
}
function isId(v: unknown): v is string {
  return typeof v === 'string' && v.length >= 1 && v.length <= MAX_ID;
}
function optStr(v: unknown, max: number): boolean {
  return v === undefined || isStr(v, max);
}
function optId(v: unknown): boolean {
  return v === undefined || isId(v);
}
function isInt(v: unknown, lo: number, hi: number): v is number {
  return typeof v === 'number' && Number.isInteger(v) && v >= lo && v <= hi;
}
function isNum(v: unknown, lo: number, hi: number): v is number {
  return typeof v === 'number' && Number.isFinite(v) && v >= lo && v <= hi;
}
function oneOf<T extends string>(v: unknown, allowed: readonly T[]): v is T {
  return typeof v === 'string' && (allowed as readonly string[]).includes(v);
}
function idSet(rows: { id: string }[]): Set<string> {
  return new Set(rows.map((r) => r.id));
}
function timestamps(v: Record<string, unknown>): { createdAt: string; updatedAt: string } | null {
  if (!isStr(v['createdAt'], MAX_DATE) || !isStr(v['updatedAt'], MAX_DATE)) return null;
  return { createdAt: v['createdAt'], updatedAt: v['updatedAt'] };
}
function sanitizeAll<T>(arr: unknown[], fn: (v: unknown) => T | null): T[] | null {
  const out: T[] = [];
  for (const v of arr) {
    const clean = fn(v);
    if (clean === null) return null;
    out.push(clean);
  }
  return out;
}

function sanitizeBall(v: unknown): Ball | null {
  if (!isRecord(v) || !isId(v['id'])) return null;
  if (!isStr(v['name'], MAX_NAME) || v['name'].trim() === '') return null;
  if (typeof v['active'] !== 'boolean') return null;
  const t = timestamps(v);
  if (!t) return null;
  if (v['role'] !== undefined && !oneOf(v['role'], ['strike', 'spare'] as const)) return null;
  if (!optStr(v['brand'], MAX_NAME) || !optStr(v['coverstock'], MAX_NAME)) return null;
  if (!optStr(v['layout'], MAX_NAME) || !optStr(v['imageUrl'], MAX_URL) || !optStr(v['notes'], MAX_TEXT)) return null;
  if (v['weightLb'] !== undefined && !isNum(v['weightLb'], 0, 100)) return null;
  return {
    id: v['id'],
    name: v['name'],
    role: v['role'] as Ball['role'],
    brand: v['brand'] as string | undefined,
    weightLb: v['weightLb'] as number | undefined,
    coverstock: v['coverstock'] as string | undefined,
    layout: v['layout'] as string | undefined,
    imageUrl: v['imageUrl'] as string | undefined,
    notes: v['notes'] as string | undefined,
    active: v['active'],
    ...t,
  };
}

function sanitizeVenue(v: unknown): Venue | null {
  if (!isRecord(v) || !isId(v['id'])) return null;
  if (!isStr(v['name'], MAX_NAME) || v['name'].trim() === '') return null;
  if (typeof v['active'] !== 'boolean') return null;
  const t = timestamps(v);
  if (!t) return null;
  if (!optStr(v['city'], MAX_NAME) || !optStr(v['notes'], MAX_TEXT)) return null;
  if (v['lanes'] !== undefined && !isInt(v['lanes'], 0, 1000)) return null;
  return {
    id: v['id'],
    name: v['name'],
    city: v['city'] as string | undefined,
    lanes: v['lanes'] as number | undefined,
    notes: v['notes'] as string | undefined,
    active: v['active'],
    ...t,
  };
}

function sanitizeCompetition(v: unknown): Competition | null {
  if (!isRecord(v) || !isId(v['id'])) return null;
  if (!isStr(v['name'], MAX_NAME) || v['name'].trim() === '') return null;
  if (!oneOf(v['type'], ['league', 'tournament'] as const)) return null;
  if (typeof v['active'] !== 'boolean') return null;
  const t = timestamps(v);
  if (!t) return null;
  if (!optStr(v['season'], MAX_NAME) || !optStr(v['startDate'], MAX_DATE)) return null;
  if (!optStr(v['endDate'], MAX_DATE) || !optStr(v['notes'], MAX_TEXT)) return null;
  return {
    id: v['id'],
    type: v['type'],
    name: v['name'],
    season: v['season'] as string | undefined,
    startDate: v['startDate'] as string | undefined,
    endDate: v['endDate'] as string | undefined,
    notes: v['notes'] as string | undefined,
    active: v['active'],
    ...t,
  };
}

function sanitizeSession(v: unknown): Session | null {
  if (!isRecord(v) || !isId(v['id'])) return null;
  if (!oneOf(v['type'], ['practice', 'league', 'tournament', 'social'] as const)) return null;
  if (!isStr(v['date'], MAX_DATE)) return null;
  if (!oneOf(v['defaultDetailLevel'], ['total', 'frame', 'throw'] as const)) return null;
  const t = timestamps(v);
  if (!t) return null;
  if (!optId(v['competitionId']) || !optId(v['venueId'])) return null;
  if (!optId(v['defaultPrimaryBallId']) || !optId(v['defaultSpareBallId'])) return null;
  if (!optStr(v['lanes'], MAX_NAME) || !optStr(v['notes'], MAX_TEXT)) return null;
  return {
    id: v['id'],
    type: v['type'],
    date: v['date'],
    competitionId: v['competitionId'] as string | undefined,
    venueId: v['venueId'] as string | undefined,
    lanes: v['lanes'] as string | undefined,
    notes: v['notes'] as string | undefined,
    defaultDetailLevel: v['defaultDetailLevel'],
    defaultPrimaryBallId: v['defaultPrimaryBallId'] as string | undefined,
    defaultSpareBallId: v['defaultSpareBallId'] as string | undefined,
    ...t,
  };
}

function sanitizeThrow(v: unknown): Throw | null {
  if (!isRecord(v) || !isInt(v['index'], 1, 3)) return null;
  if (!isNum(v['pinsKnocked'], 0, 10)) return null;
  let pinsStanding: number[] | undefined;
  if (v['pinsStanding'] !== undefined) {
    const raw = v['pinsStanding'];
    if (!Array.isArray(raw) || raw.length > 10 || !raw.every((p) => isInt(p, 1, 10))) return null;
    pinsStanding = raw as number[];
  }
  if (!optId(v['ballId'])) return null;
  if (v['foul'] !== undefined && typeof v['foul'] !== 'boolean') return null;
  const out: Throw = { index: v['index'], pinsKnocked: v['pinsKnocked'] };
  if (pinsStanding) out.pinsStanding = pinsStanding;
  if (v['ballId'] !== undefined) out.ballId = v['ballId'] as string;
  if (v['foul'] === true) out.foul = true;
  return out;
}

function sanitizeFrame(v: unknown): Frame | null {
  if (!isRecord(v) || !isInt(v['index'], 1, 10)) return null;
  for (const k of ['first', 'second', 'third'] as const) {
    if (v[k] !== undefined && !isNum(v[k], 0, 10)) return null;
  }
  for (const k of ['firstBallId', 'secondBallId', 'thirdBallId'] as const) {
    if (!optId(v[k])) return null;
  }
  let throws: Throw[] | undefined;
  if (v['throws'] !== undefined) {
    const raw = v['throws'];
    if (!Array.isArray(raw) || raw.length > 4) return null;
    const clean = sanitizeAll(raw, sanitizeThrow);
    if (!clean) return null;
    throws = clean;
  }
  const out: Frame = { index: v['index'] };
  if (v['first'] !== undefined) out.first = v['first'] as number;
  if (v['second'] !== undefined) out.second = v['second'] as number;
  if (v['third'] !== undefined) out.third = v['third'] as number;
  if (v['firstBallId'] !== undefined) out.firstBallId = v['firstBallId'] as string;
  if (v['secondBallId'] !== undefined) out.secondBallId = v['secondBallId'] as string;
  if (v['thirdBallId'] !== undefined) out.thirdBallId = v['thirdBallId'] as string;
  if (throws) out.throws = throws;
  return out;
}

function sanitizeGame(v: unknown): Game | null {
  if (!isRecord(v) || !isId(v['id']) || !isId(v['sessionId'])) return null;
  if (!isInt(v['index'], 1, 100)) return null;
  if (!oneOf(v['detailLevel'], ['total', 'frame', 'throw'] as const)) return null;
  const t = timestamps(v);
  if (!t) return null;
  if (v['startedAt'] !== undefined && !isStr(v['startedAt'], MAX_DATE)) return null;
  if (!optStr(v['notes'], MAX_TEXT)) return null;
  if (!optId(v['primaryBallId']) || !optId(v['spareBallId'])) return null;
  if (v['totalPins'] !== undefined && !isInt(v['totalPins'], 0, 300)) return null;
  let frames: Frame[] | undefined;
  if (v['frames'] !== undefined) {
    const raw = v['frames'];
    if (!Array.isArray(raw) || raw.length > 20) return null;
    const clean = sanitizeAll(raw, sanitizeFrame);
    if (!clean) return null;
    frames = clean;
  }
  const out: Game = {
    id: v['id'],
    sessionId: v['sessionId'],
    index: v['index'],
    detailLevel: v['detailLevel'],
    ...t,
  };
  if (v['startedAt'] !== undefined) out.startedAt = v['startedAt'] as string;
  if (v['notes'] !== undefined) out.notes = v['notes'] as string;
  if (v['primaryBallId'] !== undefined) out.primaryBallId = v['primaryBallId'] as string;
  if (v['spareBallId'] !== undefined) out.spareBallId = v['spareBallId'] as string;
  if (v['totalPins'] !== undefined) out.totalPins = v['totalPins'] as number;
  if (frames) out.frames = frames;
  return out;
}
