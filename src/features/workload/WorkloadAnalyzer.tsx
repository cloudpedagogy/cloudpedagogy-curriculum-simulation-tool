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
          {weeklyData.map((data, index) => {
            const prevData = index > 0 ? weeklyData[index - 1] : null;
            const isSpike = prevData && (data.totalHours - prevData.totalHours >= 15);
            const isOverload = data.totalHours >= 45;
            
            return (
              <div key={data.week} className={`heatmap-cell intensity-${data.intensity}`}>
                <div className="week-label">W{data.week}</div>
                <div className="hour-value">{data.totalHours}h</div>
                <div className="flex flex-col gap-0.5 mt-1">
                  {isOverload && <div className="text-[8px] font-bold text-red-700 leading-tight">OVERLOAD</div>}
                  {isSpike && <div className="text-[8px] font-bold text-amber-700 leading-tight">SPIKE</div>}
                </div>
              </div>
            );
          })}
        </div>

        <div className="signals-panel">
          <div className="mb-4 p-3 bg-slate-50 border border-slate-200 rounded text-[10px] text-slate-500">
            <span className="font-bold uppercase tracking-wider block mb-1">Reference Thresholds</span>
            <div className="flex gap-4">
              <span><strong>Overload</strong>: ≥ 45h/week</span>
              <span><strong>Spike</strong>: ≥ 15h jump</span>
              <span><strong>Clustering</strong>: ≥ 3 asmts or &gt; 50% wt</span>
            </div>
          </div>
          
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
