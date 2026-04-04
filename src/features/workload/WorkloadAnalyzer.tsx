import React from 'react';
import { calculateWeeklyWorkload, generateWorkloadSignals } from '../../lib/simulation/workload';
import type { SimulationDataset } from '../../types';

interface WorkloadAnalyzerProps {
  dataset: SimulationDataset;
}

export const WorkloadAnalyzer: React.FC<WorkloadAnalyzerProps> = ({ dataset }) => {
  const weeklyData = calculateWeeklyWorkload(dataset);
  const signals = generateWorkloadSignals(weeklyData);

  return (
    <div className="workload-analyzer-container">
      <div className="workload-section-header">
        <h2>Workload Heatmap & Risk Signals</h2>
        <p className="description">Structured modelling of student experience and potential pressure points in the curriculum.</p>
      </div>

      <div className="workload-insights">
        <div className="heatmap-grid">
          {weeklyData.map((data) => (
            <div key={data.week} className={`heatmap-cell intensity-${data.intensity}`}>
              <div className="week-label">W{data.week}</div>
              <div className="hour-value">{data.totalHours}h</div>
            </div>
          ))}
        </div>

        <div className="signals-panel">
          <h3>Interpretive Signals</h3>
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
            <p className="no-signals">No critical workload risks detected across the 12-week simulation.</p>
          )}
        </div>
      </div>
    </div>
  );
};
