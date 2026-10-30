import { describe, expect, it } from 'vitest';
import { PHASES, PHASE_CHAPTERS, getPhasesByChapter } from '../../src/lib/phases';

describe('playbook fázisok', () => {
  it('pontosan 11 fázist tartalmaz', () => {
    expect(PHASES).toHaveLength(11);
  });

  it('a fáziskódok 01–11 között sorrendben, egyediek', () => {
    const codes = PHASES.map((phase) => phase.code);
    expect(new Set(codes).size).toBe(11);
    expect(codes).toEqual(['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11']);
  });

  it('minden fázis létező fejezethez tartozik', () => {
    const chapterCodes = new Set(PHASE_CHAPTERS.map((chapter) => chapter.code));
    for (const phase of PHASES) {
      expect(chapterCodes.has(phase.chapter)).toBe(true);
    }
  });

  it('a fejezetek együtt mind a 11 fázist lefedik, átfedés nélkül', () => {
    const allCodes = PHASE_CHAPTERS.flatMap((chapter) => chapter.phaseCodes);
    expect(allCodes).toHaveLength(11);
    expect(new Set(allCodes)).toEqual(new Set(PHASES.map((phase) => phase.code)));
  });

  it('getPhasesByChapter a fejezet saját fázisait adja vissza sorrendben', () => {
    const launchChapter = PHASE_CHAPTERS.find((chapter) => chapter.code === 'launch');
    expect(launchChapter).toBeDefined();
    const phases = getPhasesByChapter(launchChapter!);
    expect(phases.map((phase) => phase.code)).toEqual(['10', '11']);
  });
});
