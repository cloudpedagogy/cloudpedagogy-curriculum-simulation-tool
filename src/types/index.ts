export interface LearningOutcome {
  id: string;
  description: string;
}

export interface Skill {
  id: string;
  name: string;
  level: number; // 0-100
}

export interface Assessment {
  id: string;
  moduleId: string;
  name: string;
  type: string; // e.g., 'Exam', 'Coursework', 'Presentation'
  weight: number; // percentage
  week: number;
}

export interface WorkloadProfile {
  moduleId: string;
  weeklyHours: number[]; // Hours per week (0-11)
}

export interface Module {
  id: string;
  code: string;
  title: string;
  credits: number;
  learningOutcomes: LearningOutcome[];
  skillsGained: string[]; // IDs of Skills
  prerequisites?: string[]; // IDs of Modules
}

export interface SimulationDataset {
  modules: Module[];
  assessments: Assessment[];
  skills: Skill[];
  workload: WorkloadProfile[];
}
