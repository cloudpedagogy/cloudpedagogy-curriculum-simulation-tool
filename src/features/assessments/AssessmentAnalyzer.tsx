import React from 'react';
import { analyzeAssessments } from '../../lib/simulation/assessment';
import type { SimulationDataset } from '../../types';

interface AssessmentAnalyzerProps {
  dataset: SimulationDataset;
}

export const AssessmentAnalyzer: React.FC<AssessmentAnalyzerProps> = ({ dataset }) => {
  const { clusters, typeCounts, signals } = analyzeAssessments(dataset);

  return (
    <div className="assessment-analyzer-container">
      <div className="assessment-section-header">
        <h2>Assessment Clustering & Diversity</h2>
        <p className="description">Mapping deadline distribution and assessment method variety to ensure balanced student evaluation.</p>
      </div>

      <div className="assessment-insights">
        <div className="clustering-panel">
          <h3>Deadline Distribution</h3>
          <div className="clustering-grid">
            {clusters.map((cluster) => (
              <div key={cluster.week} className={`cluster-cell ${cluster.isHighStakes ? 'high-stakes' : ''}`}>
                <div className="week-label">W{cluster.week}</div>
                <div className="asmt-count">
                  {cluster.assessments.length === 0 ? '-' : `${cluster.assessments.length} ASMTS`}
                </div>
                <div className="asmt-details">
                  {cluster.assessments.map(a => (
                    <div key={a.id} className="asmt-tag" title={a.name}>{a.type}</div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="diversity-panel">
          <div className="diversity-summary">
            <h3>Method Diversity</h3>
            <div className="type-distribution">
              {Object.entries(typeCounts).map(([type, count]) => (
                <div key={type} className="type-row">
                  <span className="type-label">{type}</span>
                  <span className="type-bar-bg"><span className="type-bar" style={{ width: `${(count / dataset.assessments.length) * 100}%` }}></span></span>
                  <span className="type-count">{count}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="signals-panel">
            <h3>Assessment Signals</h3>
            {signals.length > 0 ? (
              <ul className="signals-list">
                {signals.map((signal, idx) => (
                  <li key={idx} className={`signal-item severity-${signal.severity}`}>
                    <span className="signal-icon">{signal.severity === 'critical' ? '⚠️' : 'ℹ️'}</span>
                    <span className="signal-message">{signal.message}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="no-signals">No assessment clustering or diversity risks detected.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
