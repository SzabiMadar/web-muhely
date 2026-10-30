import { describe, expect, it } from 'vitest';
import { PRIMARY_NAV, isActiveNav } from '../../src/lib/navigation';

describe('fő navigáció', () => {
  it('4 menüpontot tartalmaz egyedi útvonalakkal', () => {
    expect(PRIMARY_NAV).toHaveLength(4);
    const hrefs = PRIMARY_NAV.map((item) => item.href);
    expect(new Set(hrefs).size).toBe(4);
  });

  it('magyar címkéket használ', () => {
    expect(PRIMARY_NAV.map((item) => item.label)).toEqual([
      'Áttekintés',
      'Projektek',
      'Ügyfelek',
      'Beállítások',
    ]);
  });

  it('isActiveNav pontos útvonalra aktív', () => {
    expect(isActiveNav('/dashboard', '/dashboard')).toBe(true);
    expect(isActiveNav('/projects', '/dashboard')).toBe(false);
  });

  it('isActiveNav aloldalakra is aktív, hasonló prefixre nem', () => {
    expect(isActiveNav('/projects/new', '/projects')).toBe(true);
    expect(isActiveNav('/projects-extra', '/projects')).toBe(false);
  });
});
