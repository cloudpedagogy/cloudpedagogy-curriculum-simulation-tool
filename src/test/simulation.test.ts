import { describe, it, expect } from 'vitest';
import { calculateWeeklyWorkload, generateWorkloadSignals } from '../lib/simulation/workload';
import { analyzeAssessments } from '../lib/simulation/assessment';
import { analyzeSkillProgression } from '../lib/simulation/skills';
import { demoDataset } from '../data/demo';

describe('Simulation Engine Calculations Preservation', () => {
  it('calculates weekly workload with 1.0 multiplier for Full-time persona', () => {
    const weeklyData = calculateWeeklyWorkload(demoDataset);
    expect(weeklyData).toHaveLength(12);

    // Week 1: 9 + 10 + 10 + 9 = 38h
    expect(weeklyData[0].totalHours).toBe(38);
    // Week 11: 14 + 11 + 11 + 15 = 51h
    expect(weeklyData[10].totalHours).toBe(51);
    expect(weeklyData[10].intensity).toBe('overload');
  });

  it('scales weekly workload by 0.5 for Part-time persona', () => {
    const ptDataset = {
      ...demoDataset,
      settings: {
        activePersonaId: 'pt',
        trajectoryMode: 'linear' as const
      }
    };
    const weeklyData = calculateWeeklyWorkload(ptDataset);

    // Week 1: 38 * 0.5 = 19h
    expect(weeklyData[0].totalHours).toBe(19);
    // Week 11: 51 * 0.5 = 25.5h
    expect(weeklyData[10].totalHours).toBe(25.5);
  });

  it('scales weekly workload by 1.2 for Intensive persona', () => {
    const intensiveDataset = {
      ...demoDataset,
      settings: {
        activePersonaId: 'it',
        trajectoryMode: 'linear' as const
      }
    };
    const weeklyData = calculateWeeklyWorkload(intensiveDataset);

    // Week 1: 38 * 1.2 = 45.6h
    expect(weeklyData[0].totalHours).toBeCloseTo(45.6, 1);
  });

  it('generates workload signals for overload peaks in calibrated demo', () => {
    const weeklyData = calculateWeeklyWorkload(demoDataset);
    const signals = generateWorkloadSignals(weeklyData);

    const peakSignals = signals.filter(s => s.type === 'peak');
    expect(peakSignals.length).toBeGreaterThan(0);
    expect(peakSignals.some(s => s.weeks.includes(11))).toBe(true);
  });

  it('analyzes assessment clustering and method diversity', () => {
    const { clusters, typeCounts, signals } = analyzeAssessments(demoDataset);
    expect(clusters).toHaveLength(12);

    // Week 11 has 2 assessments (PH101 presentation & PH202 presentation)
    const week11Cluster = clusters.find(c => c.week === 11);
    expect(week11Cluster?.assessments).toHaveLength(2);

    // Verify method diversity
    const types = Object.keys(typeCounts);
    expect(types.length).toBeGreaterThanOrEqual(4); // Essay, Presentation, Report, Exam, Lab, Portfolio

    // High-Stakes Cluster warning (type: load) should be generated for Week 11 and Week 12
    expect(signals.some(s => s.type === 'load')).toBe(true);
  });

  it('maps skill progression across active modules', () => {
    const { progression } = analyzeSkillProgression(demoDataset);
    expect(progression.length).toBeGreaterThan(0);

    const healthSystemsSkill = progression.find(p => p.skillId === 'skill-health-systems');
    expect(healthSystemsSkill).toBeDefined();
    expect(healthSystemsSkill?.usages.length).toBeGreaterThanOrEqual(2);
    expect(healthSystemsSkill?.firstIntroWeek).toBe(1);
  });

  describe('Demonstration Workload & Credit Reconciliation', () => {
    it('reconciles 60 credits to 600 expected notional hours and 500 teaching-period hours', () => {
      // 1. Total module credits: 4 modules * 15 credits = 60 credits
      const totalCredits = demoDataset.modules.reduce((sum, m) => sum + m.credits, 0);
      expect(totalCredits).toBe(60);
      expect(demoDataset.modules).toHaveLength(4);
      demoDataset.modules.forEach(m => expect(m.credits).toBe(15));

      // 2. Expected notional learning hours under standard UK convention (1 credit = 10 notional hours)
      const expectedNotionalHours = totalCredits * 10;
      expect(expectedNotionalHours).toBe(600);

      // 3. Sum of actual weekly workload profile across all modules in 12-week teaching block
      const moduleTotals = demoDataset.workload.map(profile => {
        expect(profile.weeklyHours).toHaveLength(12);
        return profile.weeklyHours.reduce((sum, h) => sum + h, 0);
      });

      // Individual module teaching period sums: PH101=120h, PH102=130h, PH201=130h, PH202=120h
      expect(moduleTotals).toEqual([120, 130, 130, 120]);

      // Total teaching block workload: 120 + 130 + 130 + 120 = 500 hours (~41.7 hours/week average)
      const totalTeachingWorkload = moduleTotals.reduce((sum, h) => sum + h, 0);
      expect(totalTeachingWorkload).toBe(500);

      // 4. Verification that model represents teaching-period component
      // Remaining 100 hours (25h per 15-credit module on average) represent pre-term preparation and post-term revision
      const independentStudyAndRevisionHours = expectedNotionalHours - totalTeachingWorkload;
      expect(independentStudyAndRevisionHours).toBe(100);
      expect(independentStudyAndRevisionHours / demoDataset.modules.length).toBe(25);
    });
  });
});
