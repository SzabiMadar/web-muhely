import { describe, expect, it } from 'vitest';
import { PHASE_GUIDES, TASK_TEMPLATES, tasksForWorkType, guideForPhase } from '../../src/lib/playbook/templates';
import { nextOpenTask } from '../../src/lib/server/queries';
import { PHASES } from '../../src/lib/phases';

const phaseCodes = new Set(PHASES.map((p) => p.code));

describe('playbook sablonok', () => {
  it('minden fázishoz van útmutató', () => {
    expect(PHASE_GUIDES).toHaveLength(11);
    for (const guide of PHASE_GUIDES) {
      expect(phaseCodes.has(guide.code)).toBe(true);
      expect(guide.version).toBeGreaterThanOrEqual(1);
      expect(guide.steps.length).toBeGreaterThanOrEqual(3);
      expect(guide.doneWhen.length).toBeGreaterThanOrEqual(1);
      expect(guide.warnings.length).toBeGreaterThanOrEqual(1);
    }
  });

  it('a task-kulcsok egyediek és létező fázisra mutatnak', () => {
    const keys = TASK_TEMPLATES.map((t) => t.key);
    expect(new Set(keys).size).toBe(keys.length);
    for (const task of TASK_TEMPLATES) {
      expect(phaseCodes.has(task.phase)).toBe(true);
    }
  });

  it('tasksForWorkType a sablon megfelelő részhalmazát adja', () => {
    const small = tasksForWorkType('small_change');
    const build = tasksForWorkType('new_site');
    expect(small.length).toBeGreaterThan(0);
    expect(build.length).toBeGreaterThan(small.length);
    expect(small.every((t) => t.appliesTo.includes('small_change'))).toBe(true);
  });

  it('small_change-ből hiányoznak a tervezési fázisok feladatai', () => {
    const phases = new Set(tasksForWorkType('small_change').map((t) => t.phase));
    expect(phases.has('05')).toBe(false);
    expect(phases.has('06')).toBe(false);
    expect(phases.has('07')).toBe(false);
  });

  it('guideForPhase small_change-re null a tervezési fázisokra', () => {
    expect(guideForPhase('07', 'small_change')).toBeNull();
    expect(guideForPhase('07', 'new_site')).not.toBeNull();
  });
});

describe('nextOpenTask determinisztikus logika', () => {
  it('első in_progress feladatot adja vissza', () => {
    const tasks = [
      { phase_code: '01', status: 'done', position: 0 },
      { phase_code: '02', status: 'todo', position: 1 },
      { phase_code: '02', status: 'in_progress', position: 2 },
    ];
    expect(nextOpenTask(tasks)?.status).toBe('in_progress');
  });

  it('in_progress hiányában az első todo feladat', () => {
    const tasks = [
      { phase_code: '01', status: 'done', position: 0 },
      { phase_code: '03', status: 'todo', position: 1 },
      { phase_code: '02', status: 'todo', position: 2 },
    ];
    expect(nextOpenTask(tasks)?.phase_code).toBe('03');
  });

  it('null-t ad, ha nincs nyitott feladat', () => {
    const tasks = [
      { phase_code: '01', status: 'done', position: 0 },
      { phase_code: '02', status: 'skipped', position: 1 },
    ];
    expect(nextOpenTask(tasks)).toBeNull();
  });
});
