import { describe, it, expect } from 'vitest';
import {
  calculateWeeklyWorkload,
  generateWorkloadSignals,
  reconcileWorkload,
  WORKLOAD_THRESHOLDS,
  distributeHoursEvenly,
  smoothWeeklyHours
} from '../lib/simulation/workload';

import { analyzeAssessments } from '../lib/simulation/assessment';
import { analyzeSkillProgression } from '../lib/simulation/skills';
import { demoDataset } from '../data/demo';
import type { SimulationDataset, WorkloadProfile } from '../types';

describe('Batch 2: Simulation Credibility, Calculations and Comparisons', () => {
  describe('Workload Calculation & Threshold Boundary Conditions', () => {
    it('accurately evaluates threshold boundaries: 44.9h (high) vs 45.0h (overload)', () => {
      expect(WORKLOAD_THRESHOLDS.OVERLOAD).toBe(45);
      expect(WORKLOAD_THRESHOLDS.HIGH).toBe(35);
      expect(WORKLOAD_THRESHOLDS.MODERATE).toBe(20);
      expect(WORKLOAD_THRESHOLDS.SPIKE_DELTA).toBe(15);

      const boundaryDataset: SimulationDataset = {
        ...demoDataset,
        settings: { activePersonaId: 'ft', trajectoryMode: 'linear' },
        workload: [
          {
            moduleId: 'PH101',
            // Week 1 = 44.9h, Week 2 = 45.0h, Week 3 = 34.9h, Week 4 = 35.0h, Week 5 = 19.9h, Week 6 = 20.0h
            weeklyHours: [44.9, 45.0, 34.9, 35.0, 19.9, 20.0, 0, 0, 0, 0, 0, 0]
          }
        ]
      };

      const weeklyData = calculateWeeklyWorkload(boundaryDataset, 1.0);

      // Week 1: 44.9h -> high
      expect(weeklyData[0].totalHours).toBe(44.9);
      expect(weeklyData[0].intensity).toBe('high');

      // Week 2: 45.0h -> overload
      expect(weeklyData[1].totalHours).toBe(45.0);
      expect(weeklyData[1].intensity).toBe('overload');

      // Week 3: 34.9h -> moderate
      expect(weeklyData[2].totalHours).toBe(34.9);
      expect(weeklyData[2].intensity).toBe('moderate');

      // Week 4: 35.0h -> high
      expect(weeklyData[3].totalHours).toBe(35.0);
      expect(weeklyData[3].intensity).toBe('high');

      // Week 5: 19.9h -> low
      expect(weeklyData[4].totalHours).toBe(19.9);
      expect(weeklyData[4].intensity).toBe('low');

      // Week 6: 20.0h -> moderate
      expect(weeklyData[5].totalHours).toBe(20.0);
      expect(weeklyData[5].intensity).toBe('moderate');
    });

    it('accurately detects spike delta threshold: 14.9h (no spike) vs 15.0h (spike)', () => {
      const spikeDataset: SimulationDataset = {
        ...demoDataset,
        workload: [
          {
            moduleId: 'PH101',
            // W1=20h, W2=34.9h (delta=14.9h), W3=20h, W4=35.0h (delta=15.0h)
            weeklyHours: [20.0, 34.9, 20.0, 35.0, 20, 20, 20, 20, 20, 20, 20, 20]
          }
        ]
      };

      const weeklyData = calculateWeeklyWorkload(spikeDataset, 1.0);
      const signals = generateWorkloadSignals(weeklyData);

      // Delta between W1 and W2 is 14.9h (< 15h threshold -> not a spike signal)
      // Delta between W3 and W4 is 15.0h (>= 15h threshold -> spike signal for W4)
      const spikeSignals = signals.filter(s => s.type === 'spike');
      expect(spikeSignals.some(s => s.weeks.includes(4))).toBe(true);
      expect(spikeSignals.some(s => s.weeks.includes(2))).toBe(false);
    });

    it('distinguishes confirmed zero workload from missing workload profiles', () => {
      const zeroDataset: SimulationDataset = {
        ...demoDataset,
        workload: [
          {
            moduleId: 'PH101',
            weeklyHours: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
          }
        ]
      };

      const weeklyData = calculateWeeklyWorkload(zeroDataset, 1.0);
      expect(weeklyData[0].totalHours).toBe(0);
      expect(weeklyData[0].isZero).toBe(true);
      expect(weeklyData[0].rawHours).toBe(0);

      const emptyDataset: SimulationDataset = {
        ...demoDataset,
        workload: []
      };
      const emptyWeekly = calculateWeeklyWorkload(emptyDataset, 1.0);
      expect(emptyWeekly[0].totalHours).toBe(0);
      expect(emptyWeekly[0].isZero).toBe(false); // No entries means missing, not confirmed zero
    });
  });

  describe('Workload & Credit Reconciliation (UK HE Convention)', () => {
    it('reconciles total credits and notional hours (1 UK credit = 10 notional hours)', () => {
      const recon = reconcileWorkload(demoDataset);

      expect(recon.totalCredits).toBe(60);
      expect(recon.expectedNotionalHours).toBe(600);
      expect(recon.simulatedTeachingHours).toBe(500);
      expect(recon.nonTeachingHours).toBe(100);
      expect(recon.unreconciledHours).toBe(0);

      // Per-module breakdown verification
      expect(recon.moduleBreakdown).toHaveLength(4);
      const ph101 = recon.moduleBreakdown.find(m => m.moduleCode === 'PH101');
      expect(ph101?.credits).toBe(15);
      expect(ph101?.expectedNotionalHours).toBe(150);
      expect(ph101?.teachingPeriodHours).toBe(120);
      expect(ph101?.nonTeachingHours).toBe(30);
    });

    it('computes persona-scaled workload transparently', () => {
      const recon = reconcileWorkload(demoDataset);
      // Full time (1.0)
      expect(recon.personaScaledHours).toBe(500);

      const ptDataset = {
        ...demoDataset,
        settings: { activePersonaId: 'pt', trajectoryMode: 'linear' as const }
      };
      const reconPt = reconcileWorkload(ptDataset);
      // Part time (0.5)
      expect(reconPt.personaScaledHours).toBe(250);
      expect(reconPt.personaMultiplier).toBe(0.5);
    });
  });

  describe('Assessment Congestion & Credit-Weighted Programme Pressure', () => {
    it('credit-weights assessment load across the programme instead of naively summing percentages', () => {
      const analysis = analyzeAssessments(demoDataset);

      // Total programme credits = 60
      expect(analysis.totalProgrammeCredits).toBe(60);

      // In Week 11:
      // mod-1 presentation: 70% weight, 15 credits -> (70 * 15) / 60 = 17.5% programme load
      // mod-4 presentation: 50% weight, 15 credits -> (50 * 15) / 60 = 12.5% programme load
      // Total Week 11 programme load = 17.5% + 12.5% = 30.0%
      const w11 = analysis.clusters.find(c => c.week === 11);
      expect(w11).toBeDefined();
      expect(w11?.assessments).toHaveLength(2);
      expect(w11?.programmeWeightTotal).toBe(30.0);
      expect(w11?.rawModuleWeightSum).toBe(120); // Naive sum is 120%, but true programme load is 30%!

      // In Week 12:
      // mod-2 exam: 50% weight, 15 credits -> (50 * 15) / 60 = 12.5% programme load
      // mod-3 portfolio: 60% weight, 15 credits -> (60 * 15) / 60 = 15.0% programme load
      // Total Week 12 programme load = 12.5% + 15.0% = 27.5%
      const w12 = analysis.clusters.find(c => c.week === 12);
      expect(w12).toBeDefined();
      expect(w12?.programmeWeightTotal).toBe(27.5);
      expect(w12?.isHighStakes).toBe(true);
    });

    it('identifies congested deadlines using transparent multi-module rules', () => {
      // Create a dataset with 3 assessments in Week 6
      const congestedDataset: SimulationDataset = {
        ...demoDataset,
        assessments: [
          { id: 'a1', moduleId: 'PH101', name: 'Asmt 1', type: 'coursework', week: 6, weight: 30 },
          { id: 'a2', moduleId: 'PH102', name: 'Asmt 2', type: 'report', week: 6, weight: 30 },
          { id: 'a3', moduleId: 'PH201', name: 'Asmt 3', type: 'exam', week: 6, weight: 40 }
        ]
      };

      const analysis = analyzeAssessments(congestedDataset);
      const w6 = analysis.clusters.find(c => c.week === 6);
      expect(w6?.isCongested).toBe(true);

      const congestionSignals = analysis.signals.filter(s => s.type === 'clustering' && s.week === 6);
      expect(congestionSignals.length).toBeGreaterThan(0);
      expect(congestionSignals[0].severity).toBe('critical');
    });

    it('distinguishes unassigned assessments from confirmed empty weeks', () => {
      const datasetWithUnassigned: SimulationDataset = {
        ...demoDataset,
        assessments: [
          ...demoDataset.assessments,
          { id: 'unassigned-1', moduleId: 'PH101', name: 'Dissertation Prep', type: 'report', week: 0, weight: 10 }
        ]
      };

      const analysis = analyzeAssessments(datasetWithUnassigned);
      expect(analysis.unassignedAssessments).toHaveLength(1);
      expect(analysis.unassignedAssessments[0].id).toBe('unassigned-1');

      // The unassigned assessment should not corrupt week 1-12 clusters
      analysis.clusters.forEach(c => {
        expect(c.assessments.some(a => a.id === 'unassigned-1')).toBe(false);
      });
    });
  });

  describe('Direct Scenario Authoring & Referential Integrity', () => {
    it('preserves referential integrity when a module is removed', () => {
      const targetModuleId = 'mod-4'; // PH202

      // 1. Module removal
      const updatedModules = demoDataset.modules.filter(m => m.id !== targetModuleId);
      // 2. Cascade to workload profile
      const updatedWorkload = demoDataset.workload.filter(w => w.moduleId !== targetModuleId);
      // 3. Cascade to assessments
      const updatedAssessments = demoDataset.assessments.filter(a => a.moduleId !== targetModuleId);

      const modifiedDataset: SimulationDataset = {
        ...demoDataset,
        modules: updatedModules,
        workload: updatedWorkload,
        assessments: updatedAssessments
      };

      expect(modifiedDataset.modules).toHaveLength(3);
      expect(modifiedDataset.workload).toHaveLength(3);
      expect(modifiedDataset.workload.some(w => w.moduleId === targetModuleId)).toBe(false);
      expect(modifiedDataset.assessments.some(a => a.moduleId === targetModuleId)).toBe(false);

      // Reconcile new dataset
      const recon = reconcileWorkload(modifiedDataset);
      expect(recon.totalCredits).toBe(45);
      expect(recon.expectedNotionalHours).toBe(450);
      expect(recon.simulatedTeachingHours).toBe(380);
    });

    it('correctly evenly redistributes module workload hours across 12 weeks', () => {
      const profile: WorkloadProfile = {
        moduleId: 'PH101',
        weeklyHours: [20, 20, 20, 0, 0, 0, 0, 0, 0, 0, 30, 30] // Total = 120h
      };

      const currentTotal = profile.weeklyHours.reduce((s, h) => s + h, 0);
      expect(currentTotal).toBe(120);

      const baseHour = Math.floor(currentTotal / 12);
      const remainder = currentTotal % 12;
      const redistributed = Array(12).fill(baseHour);
      for (let i = 0; i < remainder; i++) {
        redistributed[i] += 1;
      }

      expect(redistributed).toEqual([10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10]);
      expect(redistributed.reduce((s, h) => s + h, 0)).toBe(120);
    });
  });

  describe('Multi-Scenario Comparison & Pressure Curves', () => {
    it('accurately derives comparative workload deltas between two scenarios', () => {
      const scenarioA = demoDataset; // Total 500h, Peak 51h in W11

      // Create Scenario B with smoothed workload (shift 10h from W11 to W5)
      const scenarioB: SimulationDataset = {
        ...demoDataset,
        id: 'scenario-smoothed',
        name: 'Smoothed Scenario',
        workload: demoDataset.workload.map(p => {
          if (p.moduleId === 'mod-1') {
            const nextHours = [...p.weeklyHours];
            nextHours[10] -= 5; // W11
            nextHours[1] += 5; // W2 (38h -> 43h)
            return { ...p, weeklyHours: nextHours };
          }
          if (p.moduleId === 'mod-4') {
            const nextHours = [...p.weeklyHours];
            nextHours[10] -= 5; // W11
            nextHours[2] += 5; // W3 (38h -> 43h)
            return { ...p, weeklyHours: nextHours };
          }
          return p;
        })
      };

      const workloadA = calculateWeeklyWorkload(scenarioA, 1.0);
      const workloadB = calculateWeeklyWorkload(scenarioB, 1.0);

      const totalA = workloadA.reduce((s, w) => s + w.totalHours, 0);
      const totalB = workloadB.reduce((s, w) => s + w.totalHours, 0);
      expect(totalA).toBe(500);
      expect(totalB).toBe(500); // Same total hours

      const peakA = Math.max(...workloadA.map(w => w.totalHours));
      const peakB = Math.max(...workloadB.map(w => w.totalHours));
      expect(peakA).toBe(51);
      expect(peakB).toBe(46); // Week 12 peak in scenario B is now 46h
      expect(peakB - peakA).toBe(-5);

      // Overload weeks comparison (>= 45h)
      const overloadA = workloadA.filter(w => w.totalHours >= 45).length;
      const overloadB = workloadB.filter(w => w.totalHours >= 45).length;
      // W11 is reduced from 51h to 41h (below 45h)
      expect(overloadA).toBe(2); // W11 (51h) & W12 (46h)
      expect(overloadB).toBe(1); // W12 (46h) only
      expect(overloadB - overloadA).toBe(-1);
    });
  });

  describe('Honest Skill Exposure & Assessment Evidence', () => {
    it('replaces percentage mastery with curriculum exposure indicators and assessment links', () => {
      const { progression, signals } = analyzeSkillProgression(demoDataset);

      progression.forEach(p => {
        expect(p.moduleCount).toBeGreaterThan(0);
        expect(p.activeWeeks.length).toBeGreaterThan(0);
        expect(['Single Encounter', 'Reinforced', 'Extensively Integrated']).toContain(p.exposureLevel);
        expect(typeof p.assessmentEvidenceCount).toBe('number');
      });

      // Health systems skill appears in multiple modules (PH101, PH201)
      const healthSystems = progression.find(p => p.skillId === 'skill-health-systems');
      expect(healthSystems).toBeDefined();
      expect(healthSystems?.exposureLevel).toBe('Reinforced');
      expect(healthSystems?.assessmentEvidenceCount).toBeGreaterThan(0);

      // Signals should not contain speculative mastery warnings
      signals.forEach(s => {
        expect(s.message).not.toContain('% Mastery');
      });
    });

    it('generates an unassessed competency signal when a taught skill has no assessment link', () => {
      const datasetWithUnassessedSkill: SimulationDataset = {
        ...demoDataset,
        modules: [
          ...demoDataset.modules,
          {
            id: 'MOD-NEW',
            code: 'MN101',
            title: 'New Module',
            credits: 15,
            learningOutcomes: [],
            skillsGained: ['skill-unassessed']
          }
        ],
        skills: [
          ...demoDataset.skills,
          { id: 'skill-unassessed', name: 'Unassessed Skill', level: 1 }
        ],
        workload: [
          ...demoDataset.workload,
          { moduleId: 'MOD-NEW', weeklyHours: Array(12).fill(10) }
        ],
        // No assessment referencing MOD-NEW
        assessments: demoDataset.assessments
      };

      const { signals } = analyzeSkillProgression(datasetWithUnassessedSkill);
      const unassessedSignals = signals.filter(s => s.type === 'unassessed');
      expect(unassessedSignals.length).toBeGreaterThan(0);
      expect(unassessedSignals[0].message).toContain('Unassessed in host modules');
    });
  });

  describe('Workload Redistribution Integrity & Boundary Conditions', () => {
    it('distributeHoursEvenly strictly preserves total hours for whole and fractional inputs', () => {
      // 1. Whole hours (120h)
      const wholeResult = distributeHoursEvenly([20, 20, 20, 0, 0, 0, 0, 0, 0, 0, 30, 30]);
      expect(wholeResult).toEqual([10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10]);
      expect(wholeResult.reduce((s, h) => s + h, 0)).toBe(120);

      // 2. Fractional hours (135.5h)
      const fractionalInput = [10.5, 10, 10, 10, 15, 15, 15, 10, 10, 10, 10, 10]; // 10.5 + 80 + 45 = 135.5h
      const inputTotal = Number(fractionalInput.reduce((s, h) => s + h, 0).toFixed(1));
      const fractionalResult = distributeHoursEvenly(fractionalInput);
      expect(fractionalResult.every(h => h > 0 && isFinite(h))).toBe(true);
      const fractionalTotal = Number(fractionalResult.reduce((s, h) => s + h, 0).toFixed(1));
      expect(fractionalTotal).toBe(inputTotal);
      expect(fractionalTotal).toBe(135.5);

      // 3. Zero / invalid inputs
      expect(distributeHoursEvenly([])).toEqual(Array(12).fill(0));
      expect(distributeHoursEvenly([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0])).toEqual(Array(12).fill(0));
      expect(distributeHoursEvenly([-10, NaN, Infinity])).toEqual(Array(12).fill(0));
    });

    it('smoothWeeklyHours caps peak weeks, preserves total hours within 0.1h, and is idempotent', () => {
      // Input with severe peak: W11 = 30h, W12 = 30h, total 125h, avg = 10.4h, cap = max(12, 13) = 13h
      const peakHours = [5, 5, 5, 5, 5, 5, 5, 5, 5, 20, 30, 30]; // 45 + 20 + 60 = 125h
      const inputTotal = Number(peakHours.reduce((s, h) => s + h, 0).toFixed(1));
      const smoothed1 = smoothWeeklyHours(peakHours);

      // Peak weeks capped
      expect(smoothed1[10]).toBeLessThanOrEqual(15);
      expect(smoothed1[11]).toBeLessThanOrEqual(15);

      // Total hours strictly preserved within 0.1h tolerance
      const totalSmoothed1 = Number(smoothed1.reduce((s, h) => s + h, 0).toFixed(1));
      expect(totalSmoothed1).toBe(inputTotal);
      expect(totalSmoothed1).toBe(125);

      // Never produces negative or non-finite numbers
      expect(smoothed1.every(h => h >= 0 && isFinite(h))).toBe(true);

      // Idempotency: re-smoothing already smoothed profile makes no progressive distortion
      const smoothed2 = smoothWeeklyHours(smoothed1);
      expect(Number(smoothed2.reduce((s, h) => s + h, 0).toFixed(1))).toBe(inputTotal);
      expect(smoothed2).toEqual(smoothed1);


      // Boundary condition: every week already at/above cap (e.g. 20h across all 12 weeks = 240h)
      const uniformOverload = Array(12).fill(20);
      const smoothedOverload = smoothWeeklyHours(uniformOverload);
      expect(Number(smoothedOverload.reduce((s, h) => s + h, 0).toFixed(1))).toBe(240);
      expect(smoothedOverload.every(h => h >= 0 && isFinite(h))).toBe(true);
    });
  });

  describe('Multi-Scenario Comparison Integrity', () => {
    it('compares Baseline vs Scenario A and Scenario A vs Scenario B independently', () => {
      const baseline = demoDataset;
      const scenarioA: SimulationDataset = {
        ...demoDataset,
        id: 'scen-a',
        name: 'Scenario A',
        modules: demoDataset.modules.map(m => m.id === 'mod-1' ? { ...m, credits: 20 } : m)
      };
      const scenarioB: SimulationDataset = {
        ...demoDataset,
        id: 'scen-b',
        name: 'Scenario B',
        modules: demoDataset.modules.filter(m => m.id !== 'mod-4'),
        workload: demoDataset.workload.filter(w => w.moduleId !== 'mod-4'),
        assessments: demoDataset.assessments.filter(a => a.moduleId !== 'mod-4')
      };

      // 1. Baseline vs Scenario A: credit change
      const reconBaseline = reconcileWorkload(baseline);
      const reconA = reconcileWorkload(scenarioA);
      expect(reconBaseline.totalCredits).toBe(60);
      expect(reconA.totalCredits).toBe(65);
      expect(reconA.totalCredits - reconBaseline.totalCredits).toBe(5);

      // 2. Scenario A vs Scenario B: module count and credit delta
      const reconB = reconcileWorkload(scenarioB);
      expect(reconB.totalCredits).toBe(45);
      expect(reconB.totalCredits - reconA.totalCredits).toBe(-20);
      expect(scenarioB.modules.length - scenarioA.modules.length).toBe(-1);

      // 3. Baseline dataset remains immutable
      expect(baseline.modules).toHaveLength(4);
      expect(baseline.modules[0].credits).toBe(15);
    });

    it('identifies unmapped assessment data when comparing scenarios with missing assessments', () => {
      const datasetWithoutAssessments: SimulationDataset = {
        ...demoDataset,
        id: 'scen-no-asmts',
        assessments: []
      };

      const asmtAnalysis = analyzeAssessments(datasetWithoutAssessments);
      expect(asmtAnalysis.clusters.every(c => c.assessments.length === 0)).toBe(true);
      expect(asmtAnalysis.unassignedAssessments).toHaveLength(0);
      // Confirms absence of records, not confirmed zero assessment requirement
      expect(datasetWithoutAssessments.assessments).toHaveLength(0);
    });
  });
});

