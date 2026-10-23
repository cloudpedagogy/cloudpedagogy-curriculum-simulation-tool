import { describe, it, expect } from 'vitest';
import {
  CstWorkspaceSchema,
  SimulationDatasetSchema,
  AssessmentSchema,
  WorkloadProfileSchema,
  deepClone
} from '../lib/schema';
import { demoDataset } from '../data/demo';

describe('Schema 1.0.0 Validation', () => {
  it('validates a correct SimulationDataset', () => {
    const result = SimulationDatasetSchema.safeParse(demoDataset);
    expect(result.success).toBe(true);
  });

  it('validates a complete CstWorkspace', () => {
    const workspace = {
      schemaVersion: '1.0.0',
      baseline: demoDataset,
      scenarios: [],
      activeScenarioId: null,
      isDemo: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    const result = CstWorkspaceSchema.safeParse(workspace);
    expect(result.success).toBe(true);
  });

  it('rejects an invalid schemaVersion', () => {
    const workspace = {
      schemaVersion: '2.0.0',
      baseline: demoDataset,
      scenarios: [],
      activeScenarioId: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    const result = CstWorkspaceSchema.safeParse(workspace);
    expect(result.success).toBe(false);
  });

  it('rejects an assessment with week outside 1-12', () => {
    const invalidAsmt = {
      id: 'as-invalid',
      moduleId: 'mod-1',
      name: 'Bad Week Exam',
      type: 'Exam',
      weight: 50,
      week: 14 // Invalid!
    };
    const result = AssessmentSchema.safeParse(invalidAsmt);
    expect(result.success).toBe(false);
  });

  it('rejects an assessment with negative weight', () => {
    const invalidAsmt = {
      id: 'as-invalid',
      moduleId: 'mod-1',
      name: 'Bad Weight',
      type: 'Essay',
      weight: -10,
      week: 4
    };
    const result = AssessmentSchema.safeParse(invalidAsmt);
    expect(result.success).toBe(false);
  });

  it('requires workload profiles to have exactly 12 weekly hours entries', () => {
    const invalidWorkload = {
      moduleId: 'mod-1',
      weeklyHours: [10, 10, 10] // only 3 weeks!
    };
    const result = WorkloadProfileSchema.safeParse(invalidWorkload);
    expect(result.success).toBe(false);

    const validWorkload = {
      moduleId: 'mod-1',
      weeklyHours: [10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10]
    };
    expect(WorkloadProfileSchema.safeParse(validWorkload).success).toBe(true);
  });

  it('deepClone creates an isolated object without shared references', () => {
    const original = deepClone(demoDataset);
    const cloned = deepClone(original);

    // Modify cloned module code and workload
    cloned.modules[0].code = 'PH999';
    cloned.workload[0].weeklyHours[0] = 999;

    expect(original.modules[0].code).toBe('PH101');
    expect(original.workload[0].weeklyHours[0]).toBe(9);
  });
});
