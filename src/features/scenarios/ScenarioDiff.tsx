import React, { useMemo } from 'react';
import type { SimulationDataset } from '../../types';

interface ScenarioDiffProps {
  base: SimulationDataset;
  current: SimulationDataset;
}

export const ScenarioDiff: React.FC<ScenarioDiffProps> = ({ base, current }) => {
  const diff = useMemo(() => {
    const calculateMetrics = (dataset: SimulationDataset) => {
      let maxWorkload = 0;
      let clusterWeeks = 0;
      for (let i = 0; i < 12; i++) {
        const weeklyWorkload = dataset.workload.reduce((sum, p) => sum + (p.weeklyHours[i] || 0), 0);
        const weeklyAsmts = dataset.assessments.filter(a => a.week === i + 1).length;
        if (weeklyWorkload > maxWorkload) maxWorkload = weeklyWorkload;
        if (weeklyAsmts > 1) clusterWeeks++;
      }
      return { maxWorkload, clusterWeeks };
    };

    const baseMetrics = calculateMetrics(base);
    const currMetrics = calculateMetrics(current);

    return {
      workloadDelta: currMetrics.maxWorkload - baseMetrics.maxWorkload,
      clusterDelta: currMetrics.clusterWeeks - baseMetrics.clusterWeeks,
      isChanged: JSON.stringify(base) !== JSON.stringify(current)
    };
  }, [base, current]);

  if (!diff.isChanged) return null;

  return (
    <div className="scenario-diff-container">
      <h3>Scenario Impact Modelling</h3>
      <div className="diff-grid">
        <div className={`diff-card ${diff.workloadDelta > 0 ? 'worse' : 'better'}`}>
          <div className="diff-label">Workload Distribution Peak</div>
          <div className="diff-value">
            {diff.workloadDelta > 0 ? `+${diff.workloadDelta}` : diff.workloadDelta}h
          </div>
          <div className="diff-sublabel">Modelled delta: {diff.workloadDelta > 0 ? 'Increased' : 'Decreased'} strain</div>
        </div>

        <div className={`diff-card ${diff.clusterDelta > 0 ? 'worse' : 'better'}`}>
          <div className="diff-label">Assessment Clustering</div>
          <div className="diff-value">
            {diff.clusterDelta > 0 ? `+${diff.clusterDelta}` : diff.clusterDelta}
          </div>
          <div className="diff-sublabel">Modelled delta: {diff.clusterDelta > 0 ? 'Added clusters' : 'Reduced clusters'}</div>
        </div>
      </div>
    </div>
  );
};
