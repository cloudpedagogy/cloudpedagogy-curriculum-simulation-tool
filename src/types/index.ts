export const CST_SCHEMA_VERSION = '1.0.0';

export interface LearningOutcome {
  id: string;
  description: string;
}

export type TrajectoryMode = 'linear' | 'accelerated' | 'plateau';

export interface Persona {
  id: string;
  name: string;
  description: string;
  workloadMultiplier: number;
}

export interface ScenarioSettings {
  activePersonaId: string;
  trajectoryMode: TrajectoryMode;
}

export interface Skill {
  id: string;
  name: string;
  level: number; // 0-100 baseline exposure rating
  category?: string;
}

export interface Assessment {
  id: string;
  moduleId: string;
  name: string;
  type: string; // e.g., 'Exam', 'Coursework', 'Report', 'Presentation', 'Portfolio', 'Lab'
  weight: number; // percentage (0-100)
  week: number; // 1-12
}

export interface WorkloadProfile {
  moduleId: string;
  weeklyHours: number[]; // Array of 12 numbers representing hours per week
}

export interface Module {
  id: string;
  code: string;
  title: string;
  credits: number; // typically 15, 20, 30
  learningOutcomes: LearningOutcome[];
  skillsGained: string[]; // IDs of Skills
  prerequisites?: string[]; // IDs of Modules
}

export interface SimulationDataset {
  id: string;
  name: string;
  description?: string;
  modules: Module[];
  assessments: Assessment[];
  skills: Skill[];
  workload: WorkloadProfile[];
  settings: ScenarioSettings;
  // Lightweight capability and governance layer
  // Optional, non-blocking, and does not alter core workflow
  aiInvolvement?: string;
  assumptions?: string;
  risks?: string;
  rationale?: string;
  reviewNotes?: string;
  capabilityNotes?: string;
}

export interface Scenario {
  id: string;
  name: string;
  description: string;
  dataset: SimulationDataset;
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
}

export interface CstWorkspace {
  schemaVersion: typeof CST_SCHEMA_VERSION;
  baseline: SimulationDataset;
  scenarios: Scenario[];
  activeScenarioId: string | null; // null represents the protected baseline
  isDemo?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface WorkspaceExportPayload {
  app: 'cloudpedagogy-curriculum-simulation-tool';
  schemaVersion: typeof CST_SCHEMA_VERSION;
  exportType: 'full-workspace';
  exportedAt: string;
  workspace: CstWorkspace;
}

export interface ScenarioExportPayload {
  app: 'cloudpedagogy-curriculum-simulation-tool';
  schemaVersion: typeof CST_SCHEMA_VERSION;
  exportType: 'single-scenario';
  exportedAt: string;
  scenario: Scenario;
}
