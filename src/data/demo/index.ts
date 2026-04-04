import type { SimulationDataset } from '../../types';

export const demoDataset: SimulationDataset = {
  modules: [
    {
      id: "mod-1",
      code: "PH101",
      title: "Foundations of Public Health",
      credits: 15,
      learningOutcomes: [
        { id: "lo-1", description: "Analyze the historical evolution and core functions of public health." },
        { id: "lo-2", description: "Identify the social determinants of health in diverse populations." }
      ],
      skillsGained: ["skill-health-systems", "skill-critical-analysis"]
    },
    {
      id: "mod-2",
      code: "PH102",
      title: "Introduction to Epidemiology",
      credits: 15,
      learningOutcomes: [
        { id: "lo-3", description: "Apply basic epidemiological measures of disease frequency and association." },
        { id: "lo-4", description: "Evaluate different study designs for public health research." }
      ],
      skillsGained: ["skill-epi-reasoning", "skill-data-interpretation"]
    },
    {
      id: "mod-3",
      code: "PH201",
      title: "Biostatistics for Health Research",
      credits: 15,
      prerequisites: ["mod-2"],
      learningOutcomes: [
        { id: "lo-5", description: "Perform statistical hypothesis testing on health datasets." },
        { id: "lo-6", description: "Interpret regression models in clinical and public health contexts." }
      ],
      skillsGained: ["skill-statistical-analysis", "skill-data-interpretation"]
    },
    {
      id: "mod-4",
      code: "PH202",
      title: "Health Systems and Policy",
      credits: 15,
      prerequisites: ["mod-1"],
      learningOutcomes: [
        { id: "lo-7", description: "Compare international health system models and financing." },
        { id: "lo-8", description: "Synthesize evidence to develop a health policy brief." }
      ],
      skillsGained: ["skill-policy-analysis", "skill-health-systems"]
    },
    {
      id: "mod-5",
      code: "PH301",
      title: "Global Health in Practice",
      credits: 15,
      prerequisites: ["mod-4"],
      learningOutcomes: [
        { id: "lo-9", description: "Analyze global health burden and interdisciplinary responses." },
        { id: "lo-10", description: "Design a community health intervention for a low-resource setting." }
      ],
      skillsGained: ["skill-interdisciplinary-coord", "skill-community-engagement"]
    },
    {
      id: "mod-6",
      code: "PH302",
      title: "Health Promotion and Prevention",
      credits: 15,
      learningOutcomes: [
        { id: "lo-11", description: "Apply behavioral theories to health promotion strategies." },
        { id: "lo-12", description: "Evaluate the effectiveness of disease prevention programmes." }
      ],
      skillsGained: ["skill-prog-implementation", "skill-community-engagement"]
    },
    {
      id: "mod-7",
      code: "PH401",
      title: "Research Methods for Public Health",
      credits: 15,
      prerequisites: ["mod-2", "mod-3"],
      learningOutcomes: [
        { id: "lo-13", description: "Formulate a rigorous public health research proposal." },
        { id: "lo-14", description: "Select appropriate qualitative and quantitative methods for inquiry." }
      ],
      skillsGained: ["skill-critical-analysis", "skill-epi-reasoning"]
    },
    {
      id: "mod-8",
      code: "PH402",
      title: "Programme Monitoring and Evaluation",
      credits: 15,
      prerequisites: ["mod-7"],
      learningOutcomes: [
        { id: "lo-15", description: "Design a logic model for public health interventions." },
        { id: "lo-16", description: "Develop a comprehensive monitoring and evaluation framework." }
      ],
      skillsGained: ["skill-evaluation-methods", "skill-prog-implementation"]
    },
    {
      id: "mod-9",
      code: "PH403",
      title: "Health Inequalities",
      credits: 15,
      prerequisites: ["mod-1"],
      learningOutcomes: [
        { id: "lo-17", description: "Audit the structural drivers of health inequity." },
        { id: "lo-18", description: "Propose equity-focused health interventions." }
      ],
      skillsGained: ["skill-policy-analysis", "skill-critical-analysis"]
    },
    {
      id: "mod-10",
      code: "PH404",
      title: "Public Health Data Management",
      credits: 15,
      prerequisites: ["mod-3"],
      learningOutcomes: [
        { id: "lo-19", description: "Manage large-scale health informatics datasets." },
        { id: "lo-20", description: "Ensure data privacy and security in health research." }
      ],
      skillsGained: ["skill-data-interpretation", "skill-statistical-analysis"]
    }
  ],
  assessments: [
    { id: "as-1", moduleId: "mod-1", name: "Reflective Practice Essay", type: "Essay", weight: 30, week: 4 },
    { id: "as-2", moduleId: "mod-1", name: "Foundations Case Study", type: "Presentation", weight: 70, week: 11 },
    { id: "as-3", moduleId: "mod-2", name: "Epidemiology Report", type: "Report", weight: 50, week: 6 },
    { id: "as-4", moduleId: "mod-2", name: "Outbreak Simulation Analysis", type: "Exam", weight: 50, week: 12 },
    { id: "as-5", moduleId: "mod-3", name: "Biostatistics Portfolio", type: "Portfolio", weight: 100, week: 12 },
    { id: "as-6", moduleId: "mod-4", name: "Health Policy Brief", type: "Report", weight: 60, week: 8 },
    { id: "as-7", moduleId: "mod-4", name: "Systems Analysis Presentation", type: "Presentation", weight: 40, week: 11 },
    { id: "as-8", moduleId: "mod-5", name: "Community Intervention Proposal", type: "Project", weight: 100, week: 12 },
    { id: "as-9", moduleId: "mod-6", name: "Health Promotion Campaign", type: "Project", weight: 50, week: 9 },
    { id: "as-10", moduleId: "mod-7", name: "Formal Research Proposal", type: "Report", weight: 70, week: 10 },
    { id: "as-11", moduleId: "mod-8", name: "Programme Evaluation Plan", type: "Report", weight: 80, week: 12 },
    { id: "as-12", moduleId: "mod-9", name: "Equity Audit Report", type: "Report", weight: 50, week: 7 },
    { id: "as-13", moduleId: "mod-10", name: "Data Management Lab", type: "Lab", weight: 40, week: 5 }
  ],
  skills: [
    { id: "skill-epi-reasoning", name: "Epidemiological Reasoning", level: 30 },
    { id: "skill-statistical-analysis", name: "Statistical Analysis", level: 25 },
    { id: "skill-policy-analysis", name: "Policy Analysis", level: 25 },
    { id: "skill-prog-implementation", name: "Programme Implementation", level: 30 },
    { id: "skill-evaluation-methods", name: "Evaluation Methods", level: 20 },
    { id: "skill-community-engagement", name: "Community Engagement", level: 35 },
    { id: "skill-health-systems", name: "Health Systems Thinking", level: 30 },
    { id: "skill-critical-analysis", name: "Critical Analysis", level: 40 },
    { id: "skill-data-interpretation", name: "Data Interpretation", level: 30 },
    { id: "skill-interdisciplinary-coord", name: "Interdisciplinary Coordination", level: 20 }
  ],
  workload: [
    { moduleId: "mod-1", weeklyHours: [8, 8, 8, 12, 8, 8, 8, 8, 8, 10, 15, 10] },
    { moduleId: "mod-2", weeklyHours: [10, 10, 10, 10, 10, 18, 10, 10, 10, 10, 12, 20] },
    { moduleId: "mod-3", weeklyHours: [12, 12, 12, 12, 12, 12, 12, 15, 12, 12, 25, 25] },
    { moduleId: "mod-4", weeklyHours: [8, 8, 8, 8, 8, 8, 8, 18, 10, 10, 18, 10] },
    { moduleId: "mod-5", weeklyHours: [8, 8, 8, 10, 10, 10, 10, 10, 10, 10, 20, 25] },
    { moduleId: "mod-6", weeklyHours: [8, 8, 8, 8, 8, 8, 8, 8, 18, 10, 10, 15] },
    { moduleId: "mod-7", weeklyHours: [10, 10, 15, 10, 10, 10, 10, 10, 10, 20, 18, 15] },
    { moduleId: "mod-8", weeklyHours: [10, 10, 10, 10, 10, 10, 10, 10, 10, 15, 15, 25] },
    { moduleId: "mod-9", weeklyHours: [8, 8, 8, 8, 8, 8, 15, 10, 10, 10, 10, 10] },
    { moduleId: "mod-10", weeklyHours: [10, 10, 10, 10, 15, 10, 10, 10, 10, 10, 10, 18] }
  ]
};
