import type { SimulationDataset, Assessment } from '../../types';

export interface AssessmentCluster {
  week: number;
  assessments: Assessment[];
  totalWeight: number;
  isHighStakes: boolean;
}

export interface AssessmentSignal {
  type: 'clustering' | 'diversity' | 'load';
  message: string;
  severity: 'warning' | 'info' | 'critical';
}

export const analyzeAssessments = (dataset: SimulationDataset) => {
  const { assessments } = dataset;
  const weeks = Array.from({ length: 12 }, (_, i) => i + 1);

  // Group by week
  const clusters: AssessmentCluster[] = weeks.map(week => {
    const weekAsmts = assessments.filter(a => a.week === week);
    const totalWeight = weekAsmts.reduce((sum, a) => sum + a.weight, 0);
    return {
      week,
      assessments: weekAsmts,
      totalWeight,
      isHighStakes: totalWeight >= 50 || weekAsmts.length >= 3
    };
  });

  // Analyze diversity
  const typeCounts: Record<string, number> = {};
  assessments.forEach(a => {
    typeCounts[a.type] = (typeCounts[a.type] || 0) + 1;
  });

  const uniqueTypes = Object.keys(typeCounts).length;

  // Generate signals
  const signals: AssessmentSignal[] = [];

  // Check for clustering
  clusters.forEach(cluster => {
    if (cluster.assessments.length >= 3) {
      signals.push({
        type: 'clustering',
        message: `Assessment Congestion: ${cluster.assessments.length} deadlines in Week ${cluster.week}`,
        severity: 'critical'
      });
    }
    
    if (cluster.totalWeight >= 50) {
      signals.push({
        type: 'load',
        message: `High-Stakes Cluster: Combined weight of ${cluster.totalWeight}% in Week ${cluster.week}`,
        severity: 'critical'
      });
    } else if (cluster.assessments.length === 2) {
      signals.push({
        type: 'clustering',
        message: `Assessment overlap detected in Week ${cluster.week}`,
        severity: 'warning'
      });
    }
  });

  // Check for diversity
  if (uniqueTypes < 3) {
    signals.push({
      type: 'diversity',
      message: 'Limited diversity in professional evaluation methods across the curriculum',
      severity: 'warning'
    });
  }

  // Check for type-specific repeats
  Object.entries(typeCounts).forEach(([type, count]) => {
    if (count / assessments.length > 0.6) {
      signals.push({
        type: 'diversity',
        message: `High reliance on '${type}' assessment type (${Math.round(count / assessments.length * 100)}% of total)`,
        severity: 'info'
      });
    }
  });

  return { clusters, typeCounts, signals };
};
