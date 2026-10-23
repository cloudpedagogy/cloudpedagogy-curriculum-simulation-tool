import type {
  CstWorkspace,
  Scenario,
  SimulationDataset,
  WorkspaceExportPayload,
  ScenarioExportPayload
} from '../../types';
import { CST_SCHEMA_VERSION } from '../../types';
import {
  CstWorkspaceSchema,
  ScenarioSchema,
  SimulationDatasetSchema,
  deepClone
} from '../schema';

export type ImportParsedResult =
  | { success: true; type: 'full-workspace'; workspace: CstWorkspace }
  | { success: true; type: 'single-scenario'; scenario: Scenario }
  | { success: true; type: 'legacy-dataset'; dataset: SimulationDataset }
  | { success: false; error: string; issues?: string[] };

export const importExport = {
  exportWorkspaceAsJson: (workspace: CstWorkspace): void => {
    const payload: WorkspaceExportPayload = {
      app: 'cloudpedagogy-curriculum-simulation-tool',
      schemaVersion: CST_SCHEMA_VERSION,
      exportType: 'full-workspace',
      exportedAt: new Date().toISOString(),
      workspace: deepClone(workspace)
    };

    const filename = `cst-workspace-${slugify(workspace.baseline.name || 'curriculum')}-${new Date().toISOString().slice(0, 10)}.json`;
    downloadJsonFile(payload, filename);
  },

  exportScenarioAsJson: (scenario: Scenario): void => {
    const payload: ScenarioExportPayload = {
      app: 'cloudpedagogy-curriculum-simulation-tool',
      schemaVersion: CST_SCHEMA_VERSION,
      exportType: 'single-scenario',
      exportedAt: new Date().toISOString(),
      scenario: deepClone(scenario)
    };

    const filename = `cst-scenario-${slugify(scenario.name)}-${new Date().toISOString().slice(0, 10)}.json`;
    downloadJsonFile(payload, filename);
  },

  exportCorruptedStorage: (rawContent: string): void => {
    const filename = `cst-corrupted-backup-${new Date().toISOString().slice(0, 10)}.txt`;
    downloadTextFile(rawContent, filename);
  },

  parseAndValidateImport: (jsonString: string): ImportParsedResult => {
    let parsed: unknown;
    try {
      parsed = JSON.parse(jsonString);
    } catch {
      return {
        success: false,
        error: 'Invalid JSON file: file content could not be parsed.'
      };
    }

    if (!parsed || typeof parsed !== 'object') {
      return {
        success: false,
        error: 'Invalid file format: JSON root must be an object.'
      };
    }

    // 1. Check if it is a Workspace Export Payload
    if ('exportType' in parsed && parsed.exportType === 'full-workspace' && 'workspace' in parsed) {
      const result = CstWorkspaceSchema.safeParse((parsed as Record<string, unknown>).workspace);
      if (result.success) {
        // Validate references for baseline
        const baseRef = validateAndRepairDatasetReferences(result.data.baseline);
        if (!baseRef.success) {
          return { success: false, error: `Baseline validation error: ${baseRef.error}` };
        }
        result.data.baseline = baseRef.dataset;

        // Validate references for all scenarios
        for (const scen of result.data.scenarios) {
          const scenRef = validateAndRepairDatasetReferences(scen.dataset);
          if (!scenRef.success) {
            return { success: false, error: `Scenario "${scen.name}" validation error: ${scenRef.error}` };
          }
          scen.dataset = scenRef.dataset;
        }

        return { success: true, type: 'full-workspace', workspace: result.data };
      }
      return {
        success: false,
        error: 'Exported workspace failed schema validation.',
        issues: formatZodIssues(result.error)
      };
    }

    // 2. Check if it is a Single Scenario Export Payload
    if ('exportType' in parsed && parsed.exportType === 'single-scenario' && 'scenario' in parsed) {
      const result = ScenarioSchema.safeParse((parsed as Record<string, unknown>).scenario);
      if (result.success) {
        const refCheck = validateAndRepairDatasetReferences(result.data.dataset);
        if (!refCheck.success) {
          return { success: false, error: refCheck.error };
        }
        result.data.dataset = refCheck.dataset;
        return { success: true, type: 'single-scenario', scenario: result.data };
      }
      return {
        success: false,
        error: 'Exported scenario failed schema validation.',
        issues: formatZodIssues(result.error)
      };
    }

    // 3. Check if it is a bare CstWorkspace object
    if ('schemaVersion' in parsed && 'baseline' in parsed && 'scenarios' in parsed) {
      const result = CstWorkspaceSchema.safeParse(parsed);
      if (result.success) {
        const baseRef = validateAndRepairDatasetReferences(result.data.baseline);
        if (!baseRef.success) {
          return { success: false, error: `Baseline validation error: ${baseRef.error}` };
        }
        result.data.baseline = baseRef.dataset;

        for (const scen of result.data.scenarios) {
          const scenRef = validateAndRepairDatasetReferences(scen.dataset);
          if (!scenRef.success) {
            return { success: false, error: `Scenario "${scen.name}" validation error: ${scenRef.error}` };
          }
          scen.dataset = scenRef.dataset;
        }

        return { success: true, type: 'full-workspace', workspace: result.data };
      }
      return {
        success: false,
        error: 'Workspace JSON failed schema validation.',
        issues: formatZodIssues(result.error)
      };
    }

    // 4. Check if it is a bare Scenario object
    if ('id' in parsed && 'name' in parsed && 'dataset' in parsed) {
      const result = ScenarioSchema.safeParse(parsed);
      if (result.success) {
        const refCheck = validateAndRepairDatasetReferences(result.data.dataset);
        if (!refCheck.success) {
          return { success: false, error: refCheck.error };
        }
        result.data.dataset = refCheck.dataset;
        return { success: true, type: 'single-scenario', scenario: result.data };
      }
    }

    // 5. Check if it is a SimulationDataset (e.g. from CAME, legacy CST, or demo)
    if ('modules' in parsed && 'assessments' in parsed) {
      const result = SimulationDatasetSchema.safeParse(parsed);
      if (result.success) {
        const refCheck = validateAndRepairDatasetReferences(result.data);
        if (!refCheck.success) {
          return { success: false, error: refCheck.error };
        }
        return { success: true, type: 'legacy-dataset', dataset: refCheck.dataset };
      }
      return {
        success: false,
        error: 'Curriculum dataset failed schema validation.',
        issues: formatZodIssues(result.error)
      };
    }

    return {
      success: false,
      error: 'Unrecognized file structure. Expected a CST workspace, scenario, or curriculum dataset.'
    };
  }
};

/**
 * Validates internal referential integrity and repairs non-fatal structural gaps.
 * Rules:
 * - Reject: Assessments referencing non-existent module IDs.
 * - Reject: Duplicate module IDs or assessment IDs.
 * - Repair: Auto-synthesize default 12-week workload profiles for modules lacking them.
 * - Repair: Prune orphan workload profiles pointing to non-existent modules.
 * - Repair: Pad or trim workload weekly hours to exactly 12 entries.
 */
export function validateAndRepairDatasetReferences(
  dataset: SimulationDataset
): { success: true; dataset: SimulationDataset } | { success: false; error: string } {
  const cloned = deepClone(dataset);
  const moduleIds = new Set(cloned.modules.map(m => m.id));

  // Check duplicate module IDs
  const seenModuleIds = new Set<string>();
  for (const m of cloned.modules) {
    if (seenModuleIds.has(m.id)) {
      return { success: false, error: `Referential integrity error: Duplicate module ID "${m.id}".` };
    }
    seenModuleIds.add(m.id);
  }

  // Check duplicate assessment IDs
  const seenAsmtIds = new Set<string>();
  for (const a of cloned.assessments) {
    if (seenAsmtIds.has(a.id)) {
      return { success: false, error: `Referential integrity error: Duplicate assessment ID "${a.id}".` };
    }
    seenAsmtIds.add(a.id);
  }

  // Reject invalid module references in assessments
  for (const a of cloned.assessments) {
    if (!moduleIds.has(a.moduleId)) {
      return {
        success: false,
        error: `Referential integrity error: Assessment "${a.name}" (${a.id}) references non-existent module "${a.moduleId}".`
      };
    }
  }

  // Repair rule: Prune orphan workload profiles
  cloned.workload = cloned.workload.filter(w => moduleIds.has(w.moduleId));

  // Repair rule: Ensure every module has a workload entry with 12 weeks
  const workloadModuleIds = new Set(cloned.workload.map(w => w.moduleId));
  for (const m of cloned.modules) {
    if (!workloadModuleIds.has(m.id)) {
      cloned.workload.push({
        moduleId: m.id,
        weeklyHours: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
      });
    }
  }

  // Repair rule: Ensure weeklyHours is exactly 12 numbers
  cloned.workload = cloned.workload.map(w => {
    let hours = [...w.weeklyHours];
    if (hours.length < 12) {
      hours = [...hours, ...Array(12 - hours.length).fill(0)];
    } else if (hours.length > 12) {
      hours = hours.slice(0, 12);
    }
    return { ...w, weeklyHours: hours };
  });

  // Repair rule: default settings if missing
  if (!cloned.settings) {
    cloned.settings = { activePersonaId: 'ft', trajectoryMode: 'linear' };
  }

  return { success: true, dataset: cloned };
}

import type { ZodError } from 'zod';

function formatZodIssues(error: ZodError): string[] {
  return error.issues.map(e => `${e.path.map(String).join('.') || 'root'}: ${e.message}`);
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '')
    .slice(0, 30);
}

function downloadJsonFile(data: unknown, filename: string): void {
  const jsonStr = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  triggerBlobDownload(blob, filename);
}

function downloadTextFile(text: string, filename: string): void {
  const blob = new Blob([text], { type: 'text/plain' });
  triggerBlobDownload(blob, filename);
}

function triggerBlobDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
