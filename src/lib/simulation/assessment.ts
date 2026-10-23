import type { SimulationDataset, Assessment } from '../../types';

export interface AssessmentItemDetail {
  id: string;
  name: string;
  type: string;
  moduleId: string;
  moduleCode: string;
  moduleCredits: number;
  moduleWeight: number; // Percentage within module (0-100)
  programmeWeight: number; // Credit-weighted proportion of whole term (0-100)
  week: number;
}

export interface AssessmentCluster {
  week: number;
  assessments: Assessment[];
  assessmentDetails: AssessmentItemDetail[];
  totalWeight: number; // Kept for backward compatibility (programmeWeightTotal)
  programmeWeightTotal: number; // Sum of credit-weighted percentages across term
  programmeAssessmentWeight: number; // Convenient alias for display
  rawModuleWeightSum: number; // Raw sum of module-internal weights
  distinctModuleCount: number;
  isHighStakes: boolean;
  isCongested: boolean;
}

export interface AssessmentSignal {
  type: 'clustering' | 'diversity' | 'load';
  message: string;
  severity: 'warning' | 'info' | 'critical';
  week?: number;
}

/**
 * Authoritative Assessment Congestion and Diversity Analysis.
 *
 * Distinguishes module-internal weights (0-100% per module) from programme-level assessment
 * pressure. Rather than naively summing unrelated percentages, programme weight is calculated
 * as: (assessment.weight * module.credits) / totalProgrammeCredits.
 */
export const analyzeAssessments = (dataset: SimulationDataset) => {
  const { assessments, modules } = dataset;
  const weeks = Array.from({ length: 12 }, (_, i) => i + 1);

  const totalProgrammeCredits = modules.reduce((sum, m) => sum + (m.credits || 0), 0) || 1;
  const moduleMap = new Map(modules.map(m => [m.id, m]));

  // Build enriched assessment items
  const enrichedAssessments: AssessmentItemDetail[] = assessments.map(a => {
    const mod = moduleMap.get(a.moduleId);
    const moduleCredits = mod?.credits || 0;
    const moduleCode = mod?.code || a.moduleId;
    const programmeWeight = Number(((a.weight * moduleCredits) / totalProgrammeCredits).toFixed(1));

    return {
      id: a.id,
      name: a.name,
      type: a.type,
      moduleId: a.moduleId,
      moduleCode,
      moduleCredits,
      moduleWeight: a.weight,
      programmeWeight,
      week: a.week
    };
  });

  // Group by week
  const clusters: AssessmentCluster[] = weeks.map(week => {
    const weekDetails = enrichedAssessments.filter(a => a.week === week);
    const weekAsmts = assessments.filter(a => a.week === week);

    const rawModuleWeightSum = weekDetails.reduce((sum, a) => sum + a.moduleWeight, 0);
    const programmeWeightTotal = Number(weekDetails.reduce((sum, a) => sum + a.programmeWeight, 0).toFixed(1));
    const distinctModules = new Set(weekDetails.map(a => a.moduleId));

    const isCongested = weekDetails.length >= 3 || (weekDetails.length >= 2 && distinctModules.size >= 2);
    // High-stakes threshold: >= 20% of total term assessment weight falling in a single week, or raw module weight >= 60%
    const isHighStakes = programmeWeightTotal >= 20 || weekDetails.some(a => a.moduleWeight >= 60);

    return {
      week,
      assessments: weekAsmts,
      assessmentDetails: weekDetails,
      totalWeight: programmeWeightTotal, // Set to programmeWeightTotal for meaningful metric
      programmeWeightTotal,
      programmeAssessmentWeight: programmeWeightTotal,
      rawModuleWeightSum,
      distinctModuleCount: distinctModules.size,
      isHighStakes,
      isCongested
    };
  });

  // Analyze diversity
  const typeCounts: Record<string, number> = {};
  assessments.forEach(a => {
    typeCounts[a.type] = (typeCounts[a.type] || 0) + 1;
  });

  const uniqueTypes = Object.keys(typeCounts).length;
  const signals: AssessmentSignal[] = [];

  // Generate signals with transparent criteria
  clusters.forEach(cluster => {
    if (cluster.assessments.length >= 3) {
      signals.push({
        type: 'clustering',
        message: `Assessment Congestion: ${cluster.assessments.length} concurrent deadlines in Week ${cluster.week} across ${cluster.distinctModuleCount} modules`,
        severity: 'critical',
        week: cluster.week
      });
    } else if (cluster.assessments.length === 2 && cluster.distinctModuleCount >= 2) {
      signals.push({
        type: 'clustering',
        message: `Multi-Module Deadline Overlap: 2 concurrent deadlines in Week ${cluster.week} (${cluster.assessmentDetails.map(a => `${a.moduleCode} ${a.name}`).join(' & ')})`,
        severity: 'warning',
        week: cluster.week
      });
    }

    if (cluster.programmeWeightTotal >= 25) {
      signals.push({
        type: 'load',
        message: `Heavy Programme Assessment Concentration: ${cluster.programmeWeightTotal}% of total term assessment falls in Week ${cluster.week}`,
        severity: 'critical',
        week: cluster.week
      });
    } else if (cluster.programmeWeightTotal >= 20) {
      signals.push({
        type: 'load',
        message: `Substantial Programme Assessment Load: ${cluster.programmeWeightTotal}% of term assessment due in Week ${cluster.week}`,
        severity: 'warning',
        week: cluster.week
      });
    }
  });

  // Check for method diversity across programme
  if (assessments.length > 0 && uniqueTypes < 3) {
    signals.push({
      type: 'diversity',
      message: `Limited evaluation diversity: only ${uniqueTypes} distinct assessment method${uniqueTypes === 1 ? '' : 's'} across the programme`,
      severity: 'warning'
    });
  }

  // Check for over-reliance on a single method type
  if (assessments.length > 0) {
    Object.entries(typeCounts).forEach(([type, count]) => {
      const proportion = count / assessments.length;
      if (proportion > 0.6) {
        signals.push({
          type: 'diversity',
          message: `High reliance on '${type}' format (${Math.round(proportion * 100)}% of all assessments)`,
          severity: 'info'
        });
      }
    });
  }

  const unassignedAssessments = assessments.filter(
    a => typeof a.week !== 'number' || a.week < 1 || a.week > 12
  );

  return {
    clusters,
    typeCounts,
    signals,
    totalProgrammeCredits,
    programmeTotalCredits: totalProgrammeCredits,
    unassignedAssessments
  };
};
