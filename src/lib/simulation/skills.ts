import type { SimulationDataset } from '../../types';

export interface SkillUsage {
  week: number;
  moduleId: string;
  level: 'intro' | 'reinforce' | 'practice';
}

export interface AssessmentEvidenceItem {
  assessmentId: string;
  assessmentName: string;
  moduleId: string;
  week: number;
  type: string;
  weight: number;
}

export interface SkillProgression {
  skillId: string;
  skillName: string;
  usages: SkillUsage[];
  firstIntroWeek: number | null;
  count: number;
  moduleCount: number;
  moduleIds: string[];
  activeWeeks: number[];
  exposureLevel: 'Single Encounter' | 'Reinforced' | 'Extensively Integrated';
  assessmentEvidenceCount: number;
  assessmentEvidence: AssessmentEvidenceItem[];
  growthValue: number; // Retained for schema/test compatibility as relative exposure index (0-100)
}

export interface SkillSignal {
  type: 'late' | 'insufficient' | 'scaffolding' | 'unassessed';
  message: string;
  severity: 'warning' | 'info' | 'critical';
}

export const analyzeSkillProgression = (dataset: SimulationDataset) => {
  const { skills, modules, workload, assessments } = dataset;

  const progression: SkillProgression[] = skills.map(skill => {
    const usages: SkillUsage[] = [];
    const matchedModules = modules.filter(m => m.skillsGained.includes(skill.id));
    const moduleIds = matchedModules.map(m => m.id);

    // Track active weeks across all modules teaching this skill
    const activeWeeksSet = new Set<number>();

    matchedModules.forEach(module => {
      const profile = workload.find(w => w.moduleId === module.id);
      if (profile) {
        profile.weeklyHours.forEach((hours, idx) => {
          if (hours > 0) {
            activeWeeksSet.add(idx + 1);
          }
        });

        // Find the first active week for this module
        const firstActiveWeekIndex = profile.weeklyHours.findIndex(h => h > 0);
        if (firstActiveWeekIndex !== -1) {
          usages.push({
            week: firstActiveWeekIndex + 1,
            moduleId: module.id,
            level: 'reinforce' // will be assigned below
          });
        }
      }
    });

    // Sort usages by week
    usages.sort((a, b) => a.week - b.week);

    // Assign developmental stage based on curricular sequence
    usages.forEach((usage, idx) => {
      if (idx === 0) usage.level = 'intro';
      else if (idx >= 2) usage.level = 'practice';
      else usage.level = 'reinforce';
    });

    const activeWeeks = Array.from(activeWeeksSet).sort((a, b) => a - b);
    const firstIntroWeek = usages.length > 0 ? usages[0].week : null;

    // Compile documented assessment evidence in modules addressing this skill
    const assessmentEvidence: AssessmentEvidenceItem[] = assessments
      .filter(a => moduleIds.includes(a.moduleId))
      .map(a => ({
        assessmentId: a.id,
        assessmentName: a.name,
        moduleId: a.moduleId,
        week: a.week,
        type: a.type,
        weight: a.weight
      }));

    let exposureLevel: 'Single Encounter' | 'Reinforced' | 'Extensively Integrated' = 'Single Encounter';
    if (matchedModules.length >= 3) {
      exposureLevel = 'Extensively Integrated';
    } else if (matchedModules.length === 2) {
      exposureLevel = 'Reinforced';
    }

    // Relative exposure index (capped at 100) based on module coverage and practice weeks
    const relativeExposureIndex = Math.min(
      100,
      Math.round((matchedModules.length * 25) + (activeWeeks.length * 4) + (assessmentEvidence.length * 5))
    );

    return {
      skillId: skill.id,
      skillName: skill.name,
      usages,
      firstIntroWeek,
      count: usages.length,
      moduleCount: matchedModules.length,
      moduleIds,
      activeWeeks,
      exposureLevel,
      assessmentEvidenceCount: assessmentEvidence.length,
      assessmentEvidence,
      growthValue: relativeExposureIndex
    };
  });

  const signals: SkillSignal[] = [];

  progression.forEach(p => {
    // Flag late introductions (after Week 4 for scaffolding)
    if (p.firstIntroWeek && p.firstIntroWeek > 4) {
      signals.push({
        type: 'late',
        message: `Competency "${p.skillName}" first encountered late in Week ${p.firstIntroWeek}`,
        severity: 'warning'
      });
    }

    // Flag single-module coverage
    if (p.moduleCount === 1) {
      signals.push({
        type: 'insufficient',
        message: `Limited curricular exposure: "${p.skillName}" is addressed in only 1 module (${p.moduleIds[0]})`,
        severity: 'info'
      });
    }

    // Flag unassessed skills
    if (p.moduleCount > 0 && p.assessmentEvidenceCount === 0) {
      signals.push({
        type: 'unassessed',
        message: `Unassessed in host modules: "${p.skillName}" is covered in ${p.moduleIds.join(', ')} without configured assessment tasks`,
        severity: 'warning'
      });
    }

  });

  return { progression, signals };
};
