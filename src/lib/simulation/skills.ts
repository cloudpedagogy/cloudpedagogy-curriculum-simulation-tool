import type { SimulationDataset, TrajectoryMode } from '../../types';

const GROWTH_FUNCTIONS: Record<TrajectoryMode, (count: number) => number> = {
  linear: (count) => Math.min(100, count * 20),
  accelerated: (count) => Math.min(100, Math.pow(count, 1.5) * 15),
  plateau: (count) => Math.min(100, Math.log2(count + 1) * 40)
};

export interface SkillUsage {
  week: number;
  moduleId: string;
  level: 'intro' | 'reinforce' | 'advanced';
}

export interface SkillProgression {
  skillId: string;
  skillName: string;
  usages: SkillUsage[];
  firstIntroWeek: number | null;
  count: number;
  growthValue: number; // 0-100 based on trajectory
}

export interface SkillSignal {
  type: 'late' | 'insufficient' | 'scaffolding';
  message: string;
  severity: 'warning' | 'info' | 'critical';
}

export const analyzeSkillProgression = (dataset: SimulationDataset) => {
  const { skills, modules, workload, settings } = dataset;
  const mode = settings?.trajectoryMode || 'linear';
  const growthFn = GROWTH_FUNCTIONS[mode];
  
  const progression: SkillProgression[] = skills.map(skill => {
    const usages: SkillUsage[] = [];
    
    // For each module that contains this skill, find its start week from workload profile
    modules.forEach(module => {
      if (module.skillsGained.includes(skill.id)) {
        const profile = workload.find(w => w.moduleId === module.id);
        if (profile) {
          // Find the first week with non-zero hours
          const firstActiveWeekIndex = profile.weeklyHours.findIndex(h => h > 0);
          if (firstActiveWeekIndex !== -1) {
            usages.push({
              week: firstActiveWeekIndex + 1,
              moduleId: module.id,
              level: 'reinforce' // Default, will be updated
            });
          }
        }
      }
    });

    // Sort usages by week
    usages.sort((a, b) => a.week - b.week);
    
    // Assign levels based on order
    usages.forEach((usage, idx) => {
      if (idx === 0) usage.level = 'intro';
      else if (idx >= 2) usage.level = 'advanced';
      else usage.level = 'reinforce';
    });

    const firstIntroWeek = usages.length > 0 ? usages[0].week : null;

    return {
      skillId: skill.id,
      skillName: skill.name,
      usages,
      firstIntroWeek,
      count: usages.length,
      growthValue: growthFn(usages.length)
    };
  });

  const signals: SkillSignal[] = [];

  progression.forEach(p => {
    // Flag late introductions (after Week 4 for scaffolding)
    if (p.firstIntroWeek && p.firstIntroWeek > 4) {
      signals.push({
        type: 'late',
        message: `Strategic competency "${p.skillName}" introduced late in Week ${p.firstIntroWeek}`,
        severity: 'warning'
      });
    }
    
    // Flag insufficient reinforcement (only appears once)
    if (p.count === 1) {
      signals.push({
        type: 'insufficient',
        message: `Insufficient reinforcement of professional competency "${p.skillName}" (single module usage)`,
        severity: 'info'
      });
    }
  });

  return { progression, signals };
};
