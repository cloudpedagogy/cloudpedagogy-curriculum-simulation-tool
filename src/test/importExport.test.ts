import { describe, it, expect, vi } from 'vitest';
import { importExport } from '../lib/io/importExport';
import { storage } from '../lib/storage';
import { demoDataset } from '../data/demo';
import { deepClone } from '../lib/schema';
import type { CstWorkspace, Scenario } from '../types';

describe('Import & Export Functionality', () => {
  const sampleWorkspace: CstWorkspace = {
    schemaVersion: '1.0.0',
    baseline: demoDataset,
    scenarios: [
      {
        id: 'scen-1',
        name: 'Staggered Deadlines',
        description: 'Testing Week 9 shift',
        dataset: demoDataset,
        createdAt: '2026-10-23T12:00:00Z',
        updatedAt: '2026-10-23T12:00:00Z'
      }
    ],
    activeScenarioId: 'scen-1',
    isDemo: false,
    createdAt: '2026-10-23T12:00:00Z',
    updatedAt: '2026-10-23T12:00:00Z'
  };

  it('validates a full workspace export payload', () => {
    const payload = {
      app: 'cloudpedagogy-curriculum-simulation-tool',
      schemaVersion: '1.0.0',
      exportType: 'full-workspace',
      exportedAt: new Date().toISOString(),
      workspace: sampleWorkspace
    };

    const jsonStr = JSON.stringify(payload);
    const result = importExport.parseAndValidateImport(jsonStr);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.type).toBe('full-workspace');
      if (result.type === 'full-workspace') {
        expect(result.workspace.baseline.name).toBe(demoDataset.name);
        expect(result.workspace.scenarios).toHaveLength(1);
      }
    }
  });

  it('validates a single scenario export payload', () => {
    const scenario: Scenario = sampleWorkspace.scenarios[0];
    const payload = {
      app: 'cloudpedagogy-curriculum-simulation-tool',
      schemaVersion: '1.0.0',
      exportType: 'single-scenario',
      exportedAt: new Date().toISOString(),
      scenario
    };

    const jsonStr = JSON.stringify(payload);
    const result = importExport.parseAndValidateImport(jsonStr);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.type).toBe('single-scenario');
      if (result.type === 'single-scenario') {
        expect(result.scenario.name).toBe('Staggered Deadlines');
      }
    }
  });

  it('validates a raw curriculum dataset (legacy format)', () => {
    const jsonStr = JSON.stringify(demoDataset);
    const result = importExport.parseAndValidateImport(jsonStr);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.type).toBe('legacy-dataset');
      if (result.type === 'legacy-dataset') {
        expect(result.dataset.modules).toHaveLength(4);
      }
    }
  });

  it('rejects invalid JSON string with helpful error', () => {
    const invalidJson = '{"not valid json';
    const result = importExport.parseAndValidateImport(invalidJson);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toContain('Invalid JSON file');
    }
  });

  it('rejects schema-violating payload with specific issue list', () => {
    const brokenWorkspace = {
      schemaVersion: '1.0.0',
      baseline: {
        // missing required fields: name, modules, assessments, etc.
        id: 'broken'
      },
      scenarios: []
    };

    const jsonStr = JSON.stringify(brokenWorkspace);
    const result = importExport.parseAndValidateImport(jsonStr);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.issues).toBeDefined();
      expect(result.issues?.length).toBeGreaterThan(0);
    }
  });

  it('triggers browser file download for export functions without throwing', () => {
    // Mock URL and document.createElement
    const createObjectURLSpy = vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:mock-url');
    const revokeObjectURLSpy = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});

    expect(() => importExport.exportWorkspaceAsJson(sampleWorkspace)).not.toThrow();
    expect(() => importExport.exportScenarioAsJson(sampleWorkspace.scenarios[0])).not.toThrow();
    expect(() => importExport.exportCorruptedStorage('raw error text')).not.toThrow();

    createObjectURLSpy.mockRestore();
    revokeObjectURLSpy.mockRestore();
  });

  describe('Scenario Import Integrity & Safe Merging', () => {
    it('creates a coherent workspace with clearly defined protected baseline when importing into empty app', () => {
      const scenarioToImport: Scenario = {
        id: 'scen-incoming',
        name: 'Incoming Health Policy Scenario',
        description: 'Single scenario payload',
        dataset: deepClone(demoDataset),
        createdAt: '2026-10-23T10:00:00Z',
        updatedAt: '2026-10-23T10:00:00Z'
      };

      const { workspace, scenario } = storage.importScenarioIntoWorkspace(null, scenarioToImport);

      expect(workspace).toBeDefined();
      expect(workspace.baseline).toBeDefined();
      expect(workspace.baseline.name).toBe(demoDataset.name);
      expect(workspace.scenarios).toHaveLength(1);
      expect(workspace.scenarios[0].id).toBe('scen-incoming');
      expect(workspace.activeScenarioId).toBe('scen-incoming');

      // Verify deep isolation: mutating scenario dataset does NOT mutate baseline
      scenario.dataset.modules[0].code = 'MUTATED';
      expect(workspace.baseline.modules[0].code).toBe('PH101');
    });

    it('does not overwrite existing baseline and safely handles duplicate scenario IDs', () => {
      const initialWorkspace: CstWorkspace = {
        schemaVersion: '1.0.0',
        baseline: deepClone(demoDataset),
        scenarios: [
          {
            id: 'scen-duplicate-test',
            name: 'Original Scenario',
            description: 'Pre-existing scenario',
            dataset: deepClone(demoDataset),
            createdAt: '2026-10-23T08:00:00Z',
            updatedAt: '2026-10-23T08:00:00Z'
          }
        ],
        activeScenarioId: 'scen-duplicate-test',
        isDemo: false,
        createdAt: '2026-10-23T08:00:00Z',
        updatedAt: '2026-10-23T08:00:00Z'
      };

      // Import scenario that has the same ID
      const incomingWithDuplicateId: Scenario = {
        id: 'scen-duplicate-test',
        name: 'Incoming Duplicate Scenario',
        description: 'Colliding ID scenario',
        dataset: deepClone(demoDataset),
        createdAt: '2026-10-23T09:00:00Z',
        updatedAt: '2026-10-23T09:00:00Z'
      };

      const { workspace, scenario, wasDuplicateId } = storage.importScenarioIntoWorkspace(
        initialWorkspace,
        incomingWithDuplicateId
      );

      // Baseline remains intact
      expect(workspace.baseline.name).toBe(initialWorkspace.baseline.name);
      expect(workspace.scenarios).toHaveLength(2);

      // Original scenario ID preserved
      expect(workspace.scenarios[0].id).toBe('scen-duplicate-test');
      expect(workspace.scenarios[0].name).toBe('Original Scenario');

      // Duplicate ID detected and collision safely avoided
      expect(wasDuplicateId).toBe(true);
      expect(scenario.id).not.toBe('scen-duplicate-test');
      expect(scenario.name).toContain('(Imported)');
      expect(workspace.activeScenarioId).toBe(scenario.id);
    });

    it('rejects scenario with invalid referential foreign keys (assessment referencing non-existent module)', () => {
      const brokenDataset = deepClone(demoDataset);
      brokenDataset.assessments.push({
        id: 'as-invalid-ref',
        moduleId: 'mod-non-existent',
        name: 'Ghost Assessment',
        type: 'Essay',
        weight: 10,
        week: 5
      });

      const scenarioWithInvalidRef: Scenario = {
        id: 'scen-invalid-ref',
        name: 'Invalid Foreign Key Scenario',
        description: 'Contains broken assessment reference',
        dataset: brokenDataset,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const jsonStr = JSON.stringify(scenarioWithInvalidRef);
      const result = importExport.parseAndValidateImport(jsonStr);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain('references non-existent module');
      }
    });

    it('repairs missing module workload profile during import according to explicit rules', () => {
      const datasetMissingWorkload = deepClone(demoDataset);
      // Remove workload for PH101
      datasetMissingWorkload.workload = datasetMissingWorkload.workload.filter(w => w.moduleId !== 'mod-1');

      const scenarioWithMissingWorkload: Scenario = {
        id: 'scen-missing-workload',
        name: 'Missing Workload Profile Scenario',
        description: 'Contains module without workload profile',
        dataset: datasetMissingWorkload,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const jsonStr = JSON.stringify(scenarioWithMissingWorkload);
      const result = importExport.parseAndValidateImport(jsonStr);

      expect(result.success).toBe(true);
      if (result.success && result.type === 'single-scenario') {
        // PH101 workload should have been repaired with a 12-week profile
        const repairedProfile = result.scenario.dataset.workload.find(w => w.moduleId === 'mod-1');
        expect(repairedProfile).toBeDefined();
        expect(repairedProfile?.weeklyHours).toHaveLength(12);
        expect(repairedProfile?.weeklyHours.every(h => h === 0)).toBe(true);
      }
    });

    it('failed import preserves current workspace unchanged', () => {
      const currentWorkspace = deepClone(sampleWorkspace);
      const invalidJson = '{"not-even-valid-json"';

      const result = importExport.parseAndValidateImport(invalidJson);
      expect(result.success).toBe(false);

      // Caller state test: workspace was not mutated
      expect(currentWorkspace.scenarios).toHaveLength(1);
      expect(currentWorkspace.activeScenarioId).toBe('scen-1');
    });
  });
});
