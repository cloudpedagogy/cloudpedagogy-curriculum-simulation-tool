import type { CstWorkspace, Scenario, SimulationDataset } from '../../types';
import { CST_SCHEMA_VERSION } from '../../types';
import { CstWorkspaceSchema, SimulationDatasetSchema, deepClone } from '../schema';
import { demoDataset } from '../../data/demo';

export const CST_STORAGE_KEYS = {
  WORKSPACE_V1: 'cst_workspace_v1',
  LEGACY_CURRENT_DATASET: 'curriculum_sim_current_dataset',
  LEGACY_SCENARIO_STATE: 'curriculum_sim_scenario_state'
};

let lastInMemoryWorkspace: CstWorkspace | null = null;
let lastCorruptedRaw: string | null = null;

export const storage = {
  getLastInMemoryWorkspace: (): CstWorkspace | null => lastInMemoryWorkspace,
  getCorruptedRaw: (): string | null => lastCorruptedRaw,

  loadWorkspace: (): {
    workspace: CstWorkspace | null;
    migratedFromLegacy?: boolean;
    error?: string;
    isFutureVersion?: boolean;
    corruptedRaw?: string;
  } => {
    try {
      const v1Data = localStorage.getItem(CST_STORAGE_KEYS.WORKSPACE_V1);
      if (v1Data) {
        try {
          const parsed = JSON.parse(v1Data);
          if (parsed && typeof parsed === 'object' && 'schemaVersion' in parsed) {
            if (parsed.schemaVersion !== CST_SCHEMA_VERSION) {
              return {
                workspace: lastInMemoryWorkspace,
                isFutureVersion: true,
                error: `Unsupported schema version: ${parsed.schemaVersion}. Required: ${CST_SCHEMA_VERSION}.`
              };
            }
          }

          const validation = CstWorkspaceSchema.safeParse(parsed);
          if (validation.success) {
            lastInMemoryWorkspace = deepClone(validation.data);
            return { workspace: validation.data };
          } else {
            lastCorruptedRaw = v1Data;
            return {
              workspace: lastInMemoryWorkspace,
              error: 'Stored workspace failed schema validation.',
              corruptedRaw: v1Data
            };
          }
        } catch {
          lastCorruptedRaw = v1Data;
          return {
            workspace: lastInMemoryWorkspace,
            error: 'Stored workspace JSON is malformed.',
            corruptedRaw: v1Data
          };
        }
      }

      // Check legacy format
      const legacyData = localStorage.getItem(CST_STORAGE_KEYS.LEGACY_CURRENT_DATASET);
      if (legacyData) {
        try {
          const parsedLegacy = JSON.parse(legacyData);
          const legacyValidation = SimulationDatasetSchema.safeParse(parsedLegacy);
          if (legacyValidation.success) {
            const migrated: CstWorkspace = {
              schemaVersion: CST_SCHEMA_VERSION,
              baseline: deepClone(legacyValidation.data),
              scenarios: [],
              activeScenarioId: null,
              isDemo: false,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            };
            const saveResult = storage.saveWorkspace(migrated);
            if (saveResult.success) {
              // Successfully validated and persisted: safely remove legacy record
              localStorage.removeItem(CST_STORAGE_KEYS.LEGACY_CURRENT_DATASET);
              lastInMemoryWorkspace = deepClone(migrated);
              return { workspace: migrated, migratedFromLegacy: true };
            } else {
              // Persistence failed: preserve original legacy record untouched in storage
              lastInMemoryWorkspace = deepClone(migrated);
              return {
                workspace: migrated,
                migratedFromLegacy: true,
                error: 'Legacy curriculum migrated in memory, but could not be saved to local storage.'
              };
            }
          }
        } catch (e) {
          console.warn('Failed to parse legacy dataset during migration:', e);
        }
      }

      // No workspace exists -> Blank first state
      return { workspace: null };
    } catch (err) {
      console.error('Storage access error:', err);
      return { workspace: lastInMemoryWorkspace, error: 'Storage access error.' };
    }
  },

  saveWorkspace: (workspace: CstWorkspace): { success: boolean; error?: string } => {
    try {
      const validated = CstWorkspaceSchema.parse(workspace);
      const cloned = deepClone(validated);
      cloned.updatedAt = new Date().toISOString();
      const serialized = JSON.stringify(cloned);
      localStorage.setItem(CST_STORAGE_KEYS.WORKSPACE_V1, serialized);
      lastInMemoryWorkspace = cloned;
      return { success: true };
    } catch (err: unknown) {
      console.error('Failed to save workspace to localStorage:', err);
      lastInMemoryWorkspace = deepClone(workspace);
      const errorMsg = err instanceof Error ? err.message : 'Unknown storage error';
      return {
        success: false,
        error: `Storage save failed (${errorMsg}). In-memory workspace retained.`
      };
    }
  },

  clearWorkspace: (): void => {
    try {
      localStorage.removeItem(CST_STORAGE_KEYS.WORKSPACE_V1);
      localStorage.removeItem(CST_STORAGE_KEYS.LEGACY_CURRENT_DATASET);
      localStorage.removeItem(CST_STORAGE_KEYS.LEGACY_SCENARIO_STATE);
      lastInMemoryWorkspace = null;
      lastCorruptedRaw = null;
    } catch (err) {
      console.error('Failed to clear storage:', err);
    }
  },

  createEmptyWorkspace: (name = 'New Academic Programme'): CstWorkspace => {
    const emptyDataset: SimulationDataset = {
      id: `ds-${Date.now()}`,
      name,
      description: 'Initial curriculum configuration.',
      modules: [],
      assessments: [],
      skills: [],
      workload: [],
      settings: {
        activePersonaId: 'ft',
        trajectoryMode: 'linear'
      }
    };

    const workspace: CstWorkspace = {
      schemaVersion: CST_SCHEMA_VERSION,
      baseline: emptyDataset,
      scenarios: [],
      activeScenarioId: null,
      isDemo: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    storage.saveWorkspace(workspace);
    return workspace;
  },

  createDemoWorkspace: (): CstWorkspace => {
    const workspace: CstWorkspace = {
      schemaVersion: CST_SCHEMA_VERSION,
      baseline: deepClone(demoDataset),
      scenarios: [
        {
          id: 'scen-staggered-deadlines',
          name: 'Staggered Assessment Deadlines',
          description: 'Alternative scenario redistributing Week 11 presentations to Week 9 to alleviate assessment clustering.',
          dataset: {
            ...deepClone(demoDataset),
            assessments: demoDataset.assessments.map(a =>
              a.id === 'as-2' ? { ...a, week: 9 } : a
            )
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ],
      activeScenarioId: null,
      isDemo: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    storage.saveWorkspace(workspace);
    return workspace;
  },

  createScenarioFromBaseline: (
    workspace: CstWorkspace,
    name: string,
    description = ''
  ): { workspace: CstWorkspace; scenario: Scenario } => {
    const scenarioId = `scen-${Date.now()}`;
    const newScenario: Scenario = {
      id: scenarioId,
      name,
      description,
      dataset: deepClone(workspace.baseline),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const updatedWorkspace: CstWorkspace = {
      ...deepClone(workspace),
      scenarios: [...workspace.scenarios, newScenario],
      activeScenarioId: scenarioId,
      updatedAt: new Date().toISOString()
    };

    storage.saveWorkspace(updatedWorkspace);
    return { workspace: updatedWorkspace, scenario: newScenario };
  },

  duplicateScenario: (
    workspace: CstWorkspace,
    scenarioId: string,
    newName?: string
  ): { workspace: CstWorkspace; scenario: Scenario } => {
    const target = workspace.scenarios.find(s => s.id === scenarioId);
    if (!target) {
      throw new Error(`Scenario not found: ${scenarioId}`);
    }

    const newScenarioId = `scen-${Date.now()}`;
    const duplicate: Scenario = {
      id: newScenarioId,
      name: newName || `${target.name} (Copy)`,
      description: target.description,
      dataset: deepClone(target.dataset),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const updatedWorkspace: CstWorkspace = {
      ...deepClone(workspace),
      scenarios: [...workspace.scenarios, duplicate],
      activeScenarioId: newScenarioId,
      updatedAt: new Date().toISOString()
    };

    storage.saveWorkspace(updatedWorkspace);
    return { workspace: updatedWorkspace, scenario: duplicate };
  },

  renameScenario: (
    workspace: CstWorkspace,
    scenarioId: string,
    name: string,
    description?: string
  ): CstWorkspace => {
    const updatedScenarios = workspace.scenarios.map(s => {
      if (s.id === scenarioId) {
        return {
          ...s,
          name: name.trim() || s.name,
          description: description !== undefined ? description : s.description,
          updatedAt: new Date().toISOString()
        };
      }
      return s;
    });

    const updatedWorkspace: CstWorkspace = {
      ...deepClone(workspace),
      scenarios: updatedScenarios,
      updatedAt: new Date().toISOString()
    };

    storage.saveWorkspace(updatedWorkspace);
    return updatedWorkspace;
  },

  deleteScenario: (workspace: CstWorkspace, scenarioId: string): CstWorkspace => {
    const updatedScenarios = workspace.scenarios.filter(s => s.id !== scenarioId);
    const updatedWorkspace: CstWorkspace = {
      ...deepClone(workspace),
      scenarios: updatedScenarios,
      activeScenarioId: workspace.activeScenarioId === scenarioId ? null : workspace.activeScenarioId,
      updatedAt: new Date().toISOString()
    };

    storage.saveWorkspace(updatedWorkspace);
    return updatedWorkspace;
  },

  resetScenarioToBaseline: (workspace: CstWorkspace, scenarioId: string): CstWorkspace => {
    const updatedScenarios = workspace.scenarios.map(s => {
      if (s.id === scenarioId) {
        return {
          ...s,
          dataset: deepClone(workspace.baseline),
          updatedAt: new Date().toISOString()
        };
      }
      return s;
    });

    const updatedWorkspace: CstWorkspace = {
      ...deepClone(workspace),
      scenarios: updatedScenarios,
      updatedAt: new Date().toISOString()
    };

    storage.saveWorkspace(updatedWorkspace);
    return updatedWorkspace;
  },

  updateActiveDataset: (workspace: CstWorkspace, updatedDataset: SimulationDataset): CstWorkspace => {
    if (workspace.activeScenarioId === null) {
      // Modifying active dataset when activeScenarioId is null is locked to protect baseline.
      console.warn('Attempted direct mutation of protected baseline.');
      return workspace;
    }

    const updatedScenarios = workspace.scenarios.map(s => {
      if (s.id === workspace.activeScenarioId) {
        return {
          ...s,
          dataset: deepClone(updatedDataset),
          updatedAt: new Date().toISOString()
        };
      }
      return s;
    });

    const updatedWorkspace: CstWorkspace = {
      ...deepClone(workspace),
      scenarios: updatedScenarios,
      updatedAt: new Date().toISOString()
    };

    storage.saveWorkspace(updatedWorkspace);
    return updatedWorkspace;
  },

  replaceBaseline: (workspace: CstWorkspace, newBaseline: SimulationDataset): CstWorkspace => {
    const updatedWorkspace: CstWorkspace = {
      ...deepClone(workspace),
      baseline: deepClone(newBaseline),
      updatedAt: new Date().toISOString()
    };

    storage.saveWorkspace(updatedWorkspace);
    return updatedWorkspace;
  },

  importScenarioIntoWorkspace: (
    workspace: CstWorkspace | null,
    scenario: Scenario
  ): { workspace: CstWorkspace; scenario: Scenario; wasDuplicateId: boolean } => {
    const isolatedScenario = deepClone(scenario);

    if (!workspace) {
      // Empty workspace: establish coherent workspace with clearly defined protected baseline
      const baselineDataset = deepClone(isolatedScenario.dataset);
      const newWs: CstWorkspace = {
        schemaVersion: CST_SCHEMA_VERSION,
        baseline: baselineDataset,
        scenarios: [isolatedScenario],
        activeScenarioId: isolatedScenario.id,
        isDemo: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      storage.saveWorkspace(newWs);
      return { workspace: newWs, scenario: isolatedScenario, wasDuplicateId: false };
    }

    // Existing workspace: baseline remains intact. Handle duplicate IDs safely.
    let importedId = isolatedScenario.id;
    let importedName = isolatedScenario.name;
    let wasDuplicateId = false;

    if (workspace.scenarios.some(s => s.id === isolatedScenario.id)) {
      importedId = `scen-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      importedName = `${isolatedScenario.name} (Imported)`;
      wasDuplicateId = true;
    }

    const finalScenario: Scenario = {
      ...isolatedScenario,
      id: importedId,
      name: importedName,
      dataset: deepClone(isolatedScenario.dataset),
      updatedAt: new Date().toISOString()
    };

    const updatedWs: CstWorkspace = {
      ...deepClone(workspace),
      scenarios: [...workspace.scenarios, finalScenario],
      activeScenarioId: finalScenario.id,
      updatedAt: new Date().toISOString()
    };

    storage.saveWorkspace(updatedWs);
    return { workspace: updatedWs, scenario: finalScenario, wasDuplicateId };
  }
};
