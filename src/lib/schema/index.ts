import { z } from 'zod';
import { CST_SCHEMA_VERSION } from '../../types';

export const LearningOutcomeSchema = z.object({
  id: z.string().min(1, 'Outcome ID must not be empty'),
  description: z.string().min(1, 'Outcome description must not be empty')
});

export const TrajectoryModeSchema = z.enum(['linear', 'accelerated', 'plateau']);

export const PersonaSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  description: z.string(),
  workloadMultiplier: z.number().positive()
});

export const ScenarioSettingsSchema = z.object({
  activePersonaId: z.string().default('ft'),
  trajectoryMode: TrajectoryModeSchema.default('linear')
});

export const SkillSchema = z.object({
  id: z.string().min(1, 'Skill ID must not be empty'),
  name: z.string().min(1, 'Skill name must not be empty'),
  level: z.number().min(0).max(100).default(30),
  category: z.string().optional()
});

export const AssessmentSchema = z.object({
  id: z.string().min(1, 'Assessment ID must not be empty'),
  moduleId: z.string().min(1, 'Module ID reference required'),
  name: z.string().min(1, 'Assessment name must not be empty'),
  type: z.string().min(1, 'Assessment type required'),
  weight: z.number().min(0).max(100, 'Weight must be between 0% and 100%'),
  week: z.number().int().min(1).max(12, 'Week must be between 1 and 12')
});

export const WorkloadProfileSchema = z.object({
  moduleId: z.string().min(1, 'Module ID reference required'),
  weeklyHours: z.array(z.number().min(0)).length(12, 'Workload profile must contain exactly 12 weekly hour entries')
});

export const ModuleSchema = z.object({
  id: z.string().min(1, 'Module ID must not be empty'),
  code: z.string().min(1, 'Module code must not be empty'),
  title: z.string().min(1, 'Module title must not be empty'),
  credits: z.number().nonnegative('Credits must be non-negative'),
  learningOutcomes: z.array(LearningOutcomeSchema).default([]),
  skillsGained: z.array(z.string()).default([]),
  prerequisites: z.array(z.string()).optional()
});

export const SimulationDatasetSchema = z.object({
  id: z.string().default(() => `ds-${Date.now()}`),
  name: z.string().min(1, 'Dataset name is required'),
  description: z.string().optional(),
  modules: z.array(ModuleSchema).default([]),
  assessments: z.array(AssessmentSchema).default([]),
  skills: z.array(SkillSchema).default([]),
  workload: z.array(WorkloadProfileSchema).default([]),
  settings: ScenarioSettingsSchema.default({
    activePersonaId: 'ft',
    trajectoryMode: 'linear'
  }),
  aiInvolvement: z.string().optional(),
  assumptions: z.string().optional(),
  risks: z.string().optional(),
  rationale: z.string().optional(),
  reviewNotes: z.string().optional(),
  capabilityNotes: z.string().optional()
});

export const ScenarioSchema = z.object({
  id: z.string().min(1, 'Scenario ID is required'),
  name: z.string().min(1, 'Scenario name is required'),
  description: z.string().default(''),
  dataset: SimulationDatasetSchema,
  createdAt: z.string(),
  updatedAt: z.string()
});

export const CstWorkspaceSchema = z.object({
  schemaVersion: z.literal(CST_SCHEMA_VERSION),
  baseline: SimulationDatasetSchema,
  scenarios: z.array(ScenarioSchema).default([]),
  activeScenarioId: z.string().nullable().default(null),
  isDemo: z.boolean().optional().default(false),
  createdAt: z.string(),
  updatedAt: z.string()
});

export const WorkspaceExportPayloadSchema = z.object({
  app: z.literal('cloudpedagogy-curriculum-simulation-tool'),
  schemaVersion: z.literal(CST_SCHEMA_VERSION),
  exportType: z.literal('full-workspace'),
  exportedAt: z.string(),
  workspace: CstWorkspaceSchema
});

export const ScenarioExportPayloadSchema = z.object({
  app: z.literal('cloudpedagogy-curriculum-simulation-tool'),
  schemaVersion: z.literal(CST_SCHEMA_VERSION),
  exportType: z.literal('single-scenario'),
  exportedAt: z.string(),
  scenario: ScenarioSchema
});

export function deepClone<T>(obj: T): T {
  if (typeof structuredClone === 'function') {
    return structuredClone(obj);
  }
  return JSON.parse(JSON.stringify(obj));
}
