import { newId } from './id';

const uuidRe = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

describe('newId', () => {
  it('returns a v4 UUID via crypto.randomUUID when available', () => {
    expect(newId()).toMatch(uuidRe);
  });

  it('falls back to crypto.getRandomValues on insecure contexts (no randomUUID)', () => {
    const original = crypto.randomUUID;
    // @ts-expect-error simulating a non-secure context (e.g. LAN http testing)
    delete crypto.randomUUID;
    try {
      const id = newId();
      expect(id).toMatch(uuidRe);
    } finally {
      crypto.randomUUID = original;
    }
  });

  it('does not repeat ids', () => {
    const ids = new Set(Array.from({ length: 50 }, () => newId()));
    expect(ids.size).toBe(50);
  });
});
