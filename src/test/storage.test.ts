import { describe, it, expect, beforeEach, vi } from 'vitest';
import { storage, CST_STORAGE_KEYS } from '../lib/storage';
import { demoDataset } from '../data/demo';

describe('Storage, Scenario Management & Baseline Isolation', () => {
  beforeEach(() => {
    localStorage.clear();
    storage.clearWorkspace();
  });

  it('creates an empty workspace in blank-first mode', () => {
    const ws = storage.createEmptyWorkspace('Test Curriculum');
    expect(ws.schemaVersion).toBe('1.0.0');
    expect(ws.baseline.name).toBe('Test Curriculum');
    expect(ws.baseline.modules).toHaveLength(0);
    expect(ws.scenarios).toHaveLength(0);
    expect(ws.activeScenarioId).toBeNull();
  });

  it('creates a demo workspace with calibrated sample data', () => {
    const ws = storage.createDemoWorkspace();
    expect(ws.schemaVersion).toBe('1.0.0');
    expect(ws.isDemo).toBe(true);
    expect(ws.baseline.modules).toHaveLength(4);
    expect(ws.scenarios).toHaveLength(1);
    expect(ws.scenarios[0].name).toBe('Staggered Assessment Deadlines');
  });

  it('guarantees baseline isolation when creating and editing a scenario', () => {
    const ws = storage.createDemoWorkspace();
    const baselineModuleCode = ws.baseline.modules[0].code;

    // Create scenario
    const { workspace: updatedWs, scenario } = storage.createScenarioFromBaseline(
      ws,
      'Alternative A',
      'Test scenario'
    );

    expect(updatedWs.activeScenarioId).toBe(scenario.id);

    // Modify scenario dataset
    const modifiedScenarioDataset = {
      ...scenario.dataset,
      modules: scenario.dataset.modules.map(m =>
        m.id === 'mod-1' ? { ...m, code: 'MODIFIED-CODE' } : m
      )
    };

    const wsAfterEdit = storage.updateActiveDataset(updatedWs, modifiedScenarioDataset);

    // Verify scenario was modified
    const targetScenario = wsAfterEdit.scenarios.find(s => s.id === scenario.id);
    expect(targetScenario?.dataset.modules[0].code).toBe('MODIFIED-CODE');

    // Verify baseline was NOT modified!
    expect(wsAfterEdit.baseline.modules[0].code).toBe(baselineModuleCode);
  });

  it('duplicates a scenario with unique ID and deep clone', () => {
    const ws = storage.createDemoWorkspace();
    const sourceScenario = ws.scenarios[0];

    const { workspace: updatedWs, scenario: duplicate } = storage.duplicateScenario(
      ws,
      sourceScenario.id,
      'My Cloned Scenario'
    );

    expect(duplicate.id).not.toBe(sourceScenario.id);
    expect(duplicate.name).toBe('My Cloned Scenario');
    expect(updatedWs.scenarios).toHaveLength(2);
    expect(updatedWs.activeScenarioId).toBe(duplicate.id);

    // Modifying clone does not alter source scenario
    const modifiedClone = {
      ...duplicate.dataset,
      name: 'Changed in Clone'
    };
    const finalWs = storage.updateActiveDataset(updatedWs, modifiedClone);
    const originalInStorage = finalWs.scenarios.find(s => s.id === sourceScenario.id);
    expect(originalInStorage?.dataset.name).toBe(sourceScenario.dataset.name);
  });

  it('renames a scenario correctly', () => {
    const ws = storage.createDemoWorkspace();
    const scenarioId = ws.scenarios[0].id;

    const updatedWs = storage.renameScenario(ws, scenarioId, 'New Title', 'New Description');
    const renamed = updatedWs.scenarios.find(s => s.id === scenarioId);
    expect(renamed?.name).toBe('New Title');
    expect(renamed?.description).toBe('New Description');
  });

  it('deletes a scenario and resets activeScenarioId to null if active was deleted', () => {
    const ws = storage.createDemoWorkspace();
    const scenarioId = ws.scenarios[0].id;
    const activeWs = { ...ws, activeScenarioId: scenarioId };

    const updatedWs = storage.deleteScenario(activeWs, scenarioId);
    expect(updatedWs.scenarios).toHaveLength(0);
    expect(updatedWs.activeScenarioId).toBeNull();
  });

  it('resets a scenario back to the protected baseline state', () => {
    const ws = storage.createDemoWorkspace();
    const scenarioId = ws.scenarios[0].id;

    // Mutate scenario
    const mutatedDataset = {
      ...ws.scenarios[0].dataset,
      assessments: [] // remove all assessments
    };
    const wsAfterMutation = storage.updateActiveDataset(
      { ...ws, activeScenarioId: scenarioId },
      mutatedDataset
    );
    expect(wsAfterMutation.scenarios[0].dataset.assessments).toHaveLength(0);

    // Reset to baseline
    const resetWs = storage.resetScenarioToBaseline(wsAfterMutation, scenarioId);
    expect(resetWs.scenarios[0].dataset.assessments).toHaveLength(ws.baseline.assessments.length);
  });

  it('replaces the baseline when explicitly confirmed', () => {
    const ws = storage.createDemoWorkspace();
    const newBaselineData = {
      ...ws.baseline,
      name: 'Approved New Baseline'
    };

    const updatedWs = storage.replaceBaseline(ws, newBaselineData);
    expect(updatedWs.baseline.name).toBe('Approved New Baseline');
  });

  describe('Migration and Error Recovery', () => {
    it('migrates valid legacy curriculum_sim_current_dataset into Schema 1.0.0', () => {
      // Setup legacy data in localStorage
      localStorage.setItem(
        CST_STORAGE_KEYS.LEGACY_CURRENT_DATASET,
        JSON.stringify(demoDataset)
      );

      const result = storage.loadWorkspace();
      expect(result.migratedFromLegacy).toBe(true);
      expect(result.workspace).not.toBeNull();
      expect(result.workspace?.schemaVersion).toBe('1.0.0');
      expect(result.workspace?.baseline.name).toBe(demoDataset.name);

      // Subsequent load is idempotent and reads from v1 key
      const secondLoad = storage.loadWorkspace();
      expect(secondLoad.migratedFromLegacy).toBeUndefined();
      expect(secondLoad.workspace?.schemaVersion).toBe('1.0.0');
    });

    it('rejects unsupported future schema versions without crashing', () => {
      const futureWorkspace = {
        schemaVersion: '2.5.0', // Future unsupported version
        baseline: demoDataset,
        scenarios: []
      };
      localStorage.setItem(
        CST_STORAGE_KEYS.WORKSPACE_V1,
        JSON.stringify(futureWorkspace)
      );

      const result = storage.loadWorkspace();
      expect(result.isFutureVersion).toBe(true);
      expect(result.error).toContain('Unsupported schema version: 2.5.0');
    });

    it('detects corrupted JSON, exposes raw data for backup, and does not crash', () => {
      const corruptJson = '{"schemaVersion": "1.0.0", "baseline": BROKEN_SYNTAX';
      localStorage.setItem(CST_STORAGE_KEYS.WORKSPACE_V1, corruptJson);

      const result = storage.loadWorkspace();
      expect(result.corruptedRaw).toBe(corruptJson);
      expect(result.error).toContain('Stored workspace JSON is malformed');
      expect(storage.getCorruptedRaw()).toBe(corruptJson);
    });

    it('preserves in-memory workspace when storage write fails', () => {
      const ws = storage.createDemoWorkspace();

      // Mock localStorage.setItem to throw QuotaExceededError
      const setItemSpy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
        throw new Error('QuotaExceededError: storage full');
      });

      const saveResult = storage.saveWorkspace(ws);
      expect(saveResult.success).toBe(false);
      expect(saveResult.error).toContain('QuotaExceededError');
      expect(storage.getLastInMemoryWorkspace()).not.toBeNull();

      setItemSpy.mockRestore();
    });

    it('preserves original legacy storage record if persistence of migrated workspace fails', () => {
      // Put valid legacy dataset in localStorage
      localStorage.setItem(CST_STORAGE_KEYS.LEGACY_CURRENT_DATASET, JSON.stringify(demoDataset));

      // Mock save failure during migration
      const originalSave = storage.saveWorkspace;
      vi.spyOn(storage, 'saveWorkspace').mockReturnValue({
        success: false,
        error: 'QuotaExceededError: write failed'
      });

      const result = storage.loadWorkspace();
      expect(result.migratedFromLegacy).toBe(true);
      expect(result.error).toContain('could not be saved to local storage');

      // Crucial verification: original legacy record in storage must NOT be destroyed
      expect(localStorage.getItem(CST_STORAGE_KEYS.LEGACY_CURRENT_DATASET)).not.toBeNull();

      storage.saveWorkspace = originalSave;
    });

    it('corrupted storage remains in storage and recoverable until user explicitly clears', () => {
      const corruptData = '{"broken-json":';
      localStorage.setItem(CST_STORAGE_KEYS.WORKSPACE_V1, corruptData);

      const loadResult = storage.loadWorkspace();
      expect(loadResult.corruptedRaw).toBe(corruptData);

      // Verify corrupt data is not destroyed automatically
      expect(localStorage.getItem(CST_STORAGE_KEYS.WORKSPACE_V1)).toBe(corruptData);

      // Verify it is only removed upon explicit reset
      storage.clearWorkspace();
      expect(localStorage.getItem(CST_STORAGE_KEYS.WORKSPACE_V1)).toBeNull();
      expect(storage.getCorruptedRaw()).toBeNull();
    });
  });
});
