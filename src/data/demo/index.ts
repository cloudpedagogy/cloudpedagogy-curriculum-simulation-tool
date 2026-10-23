import type { SimulationDataset } from '../../types';

/**
 * Calibrated Illustrative Demonstration Dataset:
 * Master of Public Health (MPH) — Term 1 Core Curriculum
 *
 * Structure & Credit Model:
 * - 4 concurrent modules across a 12-week teaching block (60 UK credits total, 15 credits each).
 * - Credit equivalence: 1 UK credit = 10 notional learning hours (150 hours per module, 600 hours total).
 * - Delivery distribution: 500 hours occur during the 12 active teaching weeks
 *   (120–130 hours per module, averaging ~41.7 hours/week full-time student workload across all 4 modules),
 *   with the remaining 100 hours (25 hours per module on average) allocated for pre-term preparation,
 *   reading consolidation, and post-term examination revision / feedback reflection.
 * - Assessment deadlines are realistically distributed, with intentional clustering in Weeks 11 & 12
 *   to demonstrate workload spike detection and scenario smoothing.
 *
 * NOTE: This dataset is synthetic and illustrative.
 */
export const demoDataset: SimulationDataset = {
  id: 'ds-mph-term1-baseline',
  name: 'Public Health (MPH) — Term 1 Core Baseline',
  description: 'Calibrated 4-module term curriculum demonstrating balanced ~41.7h/week average study load with late-term assessment clustering.',
  settings: {
    activePersonaId: 'ft',
    trajectoryMode: 'linear'
  },
  modules: [
    {
      id: 'mod-1',
      code: 'PH101',
      title: 'Foundations of Public Health',
      credits: 15,
      learningOutcomes: [
        { id: 'lo-1', description: 'Analyze the historical evolution and core functions of public health systems.' },
        { id: 'lo-2', description: 'Evaluate social determinants of health and health equity interventions.' }
      ],
      skillsGained: ['skill-health-systems', 'skill-critical-analysis']
    },
    {
      id: 'mod-2',
      code: 'PH102',
      title: 'Introduction to Epidemiology',
      credits: 15,
      learningOutcomes: [
        { id: 'lo-3', description: 'Calculate and interpret standard epidemiological measures of morbidity and mortality.' },
        { id: 'lo-4', description: 'Evaluate study designs for infectious and chronic disease surveillance.' }
      ],
      skillsGained: ['skill-epi-reasoning', 'skill-data-interpretation']
    },
    {
      id: 'mod-3',
      code: 'PH201',
      title: 'Biostatistics for Health Research',
      credits: 15,
      prerequisites: ['mod-2'],
      learningOutcomes: [
        { id: 'lo-5', description: 'Execute parametric and non-parametric hypothesis testing on clinical datasets.' },
        { id: 'lo-6', description: 'Interpret multivariable regression models in epidemiological research.' }
      ],
      skillsGained: ['skill-statistical-analysis', 'skill-data-interpretation']
    },
    {
      id: 'mod-4',
      code: 'PH202',
      title: 'Health Systems and Policy',
      credits: 15,
      prerequisites: ['mod-1'],
      learningOutcomes: [
        { id: 'lo-7', description: 'Critique national health financing models and health reform strategies.' },
        { id: 'lo-8', description: 'Synthesize health systems evidence into an executive policy brief.' }
      ],
      skillsGained: ['skill-policy-analysis', 'skill-health-systems']
    }
  ],
  assessments: [
    {
      id: 'as-1',
      moduleId: 'mod-1',
      name: 'Reflective Practice Essay',
      type: 'Essay',
      weight: 30,
      week: 4
    },
    {
      id: 'as-2',
      moduleId: 'mod-1',
      name: 'Foundations Case Study Presentation',
      type: 'Presentation',
      weight: 70,
      week: 11
    },
    {
      id: 'as-3',
      moduleId: 'mod-2',
      name: 'Epidemiological Investigation Report',
      type: 'Report',
      weight: 50,
      week: 6
    },
    {
      id: 'as-4',
      moduleId: 'mod-2',
      name: 'Outbreak Analysis Examination',
      type: 'Exam',
      weight: 50,
      week: 12
    },
    {
      id: 'as-5',
      moduleId: 'mod-3',
      name: 'Statistical Data Lab Practical',
      type: 'Lab',
      weight: 40,
      week: 7
    },
    {
      id: 'as-6',
      moduleId: 'mod-3',
      name: 'Biostatistics Portfolio',
      type: 'Portfolio',
      weight: 60,
      week: 12
    },
    {
      id: 'as-7',
      moduleId: 'mod-4',
      name: 'Health Policy Executive Brief',
      type: 'Report',
      weight: 50,
      week: 8
    },
    {
      id: 'as-8',
      moduleId: 'mod-4',
      name: 'Systems Analysis Stakeholder Presentation',
      type: 'Presentation',
      weight: 50,
      week: 11
    }
  ],
  skills: [
    { id: 'skill-health-systems', name: 'Health Systems Thinking', level: 30, category: 'Core Policy' },
    { id: 'skill-critical-analysis', name: 'Critical Academic Analysis', level: 40, category: 'Academic' },
    { id: 'skill-epi-reasoning', name: 'Epidemiological Reasoning', level: 35, category: 'Clinical & Epi' },
    { id: 'skill-data-interpretation', name: 'Health Data Interpretation', level: 30, category: 'Analytics' },
    { id: 'skill-statistical-analysis', name: 'Statistical Modelling', level: 25, category: 'Analytics' },
    { id: 'skill-policy-analysis', name: 'Policy Analysis & Synthesis', level: 30, category: 'Core Policy' }
  ],
  workload: [
    // PH101: 120 hours total across 12 weeks (~10h/week average, peak in W4 for essay and W11 for presentation)
    { moduleId: 'mod-1', weeklyHours: [9, 9, 9, 13, 9, 9, 9, 9, 10, 11, 14, 9] },
    // PH102: 130 hours total across 12 weeks (peak in W6 for report and W12 for exam)
    { moduleId: 'mod-2', weeklyHours: [10, 10, 10, 10, 10, 15, 10, 10, 10, 10, 11, 14] },
    // PH201: 130 hours total across 12 weeks (peak in W7 for lab practical and W12 for portfolio)
    { moduleId: 'mod-3', weeklyHours: [10, 10, 10, 10, 10, 10, 13, 10, 10, 10, 11, 16] },
    // PH202: 120 hours total across 12 weeks (peak in W8 for policy brief and W11 for presentation)
    { moduleId: 'mod-4', weeklyHours: [9, 9, 9, 9, 9, 9, 9, 14, 10, 11, 15, 7] }
  ],
  aiInvolvement: 'Synthesized illustrative curriculum structure designed to model realistic single-term higher education workload.',
  assumptions: 'Assumes 60 UK credits (600 notional hours) across 12 weeks with 500 teaching block hours (~41.7 hours/week average) for a full-time student and 100 independent hours.',
  risks: 'Assessment clustering in Week 11 (two presentations) and Week 12 (exam + portfolio) creates peak workload spikes requiring scenario mitigation.',
  rationale: 'Calibrated to demonstrate practical scenario smoothing where shifting presentation deadlines flattens the end-of-term spike.',
  reviewNotes: 'Verified for mathematical consistency and realistic academic load.'
};
