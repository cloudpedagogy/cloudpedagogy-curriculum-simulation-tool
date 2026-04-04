import type { SimulationDataset } from '../../types';

export interface ValidationIssue {
  type: 'error' | 'warning';
  message: string;
  source: string;
}

export const validateDataset = (dataset: SimulationDataset): ValidationIssue[] => {
  const issues: ValidationIssue[] = [];

  // 1. Check for Duplicate IDs (Modules, Assessments, Skills)
  const moduleIds = new Set<string>();
  dataset.modules.forEach(m => {
    if (moduleIds.has(m.id)) issues.push({ type: 'error', message: `Duplicate Module ID: ${m.id}`, source: 'Modules' });
    moduleIds.add(m.id);
  });

  const asmtIds = new Set<string>();
  dataset.assessments.forEach(a => {
    if (asmtIds.has(a.id)) issues.push({ type: 'error', message: `Duplicate Assessment ID: ${a.id}`, source: 'Assessments' });
    asmtIds.add(a.id);
  });

  const skillIds = new Set<string>();
  dataset.skills.forEach(s => {
    if (skillIds.has(s.id)) issues.push({ type: 'error', message: `Duplicate Skill ID: ${s.id}`, source: 'Skills' });
    skillIds.add(s.id);
  });

  // 2. Check Missing Module References in Assessments and Workload
  dataset.assessments.forEach(a => {
    if (!moduleIds.has(a.moduleId)) {
      issues.push({ type: 'error', message: `Assessment ${a.id} references non-existent module ${a.moduleId}`, source: 'Assessments' });
    }
  });

  dataset.workload.forEach(w => {
    if (!moduleIds.has(w.moduleId)) {
      issues.push({ type: 'error', message: `Workload profile references non-existent module ${w.moduleId}`, source: 'Workload' });
    }
  });

  // 3. Check Workload Profile integrity (should have 12 weeks)
  dataset.workload.forEach(w => {
    if (w.weeklyHours.length !== 12) {
      issues.push({ type: 'warning', message: `Workload profile for ${w.moduleId} has ${w.weeklyHours.length} weeks (expected 12)`, source: 'Workload' });
    }
  });

  // 4. Check for modules without skill mappings
  dataset.modules.forEach(m => {
    if (m.skillsGained.length === 0) {
      issues.push({ type: 'warning', message: `Module ${m.code} has no skills mapped`, source: 'Skills' });
    }
    m.skillsGained.forEach(sid => {
      if (!skillIds.has(sid)) {
        issues.push({ type: 'error', message: `Module ${m.code} references non-existent skill ${sid}`, source: 'Skills' });
      }
    });
  });

  return issues;
};
