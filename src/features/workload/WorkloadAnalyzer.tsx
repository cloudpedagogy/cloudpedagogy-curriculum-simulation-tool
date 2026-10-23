import React from 'react';
import {
  calculateWeeklyWorkload,
  generateWorkloadSignals,
  reconcileWorkload,
  WORKLOAD_THRESHOLDS
} from '../../lib/simulation/workload';
import type { SimulationDataset } from '../../types';

interface WorkloadAnalyzerProps {
  dataset: SimulationDataset;
}

export const WorkloadAnalyzer: React.FC<WorkloadAnalyzerProps> = ({ dataset }) => {
  const weeklyData = calculateWeeklyWorkload(dataset);
  const signals = generateWorkloadSignals(weeklyData);
  const reconciliation = reconcileWorkload(dataset);

  return (
    <div className="workload-analyzer-container">
      <div className="workload-section-header">
        <h2>Workload Heatmap & Risk Signals</h2>
        <p className="description">
          Deterministic modelling of student study effort across the 12-week simulated teaching period.
          Models {reconciliation.simulatedTeachingHours} scheduled hours ({reconciliation.averageWeeklyHours}h/week average at 1.0x full-time load).
          {reconciliation.activePersonaMultiplier !== 1.0 && (
            <span> Scaled for <strong>{reconciliation.activePersonaName}</strong> ({reconciliation.activePersonaMultiplier * 100}% load: {reconciliation.scaledTeachingHours}h total, {reconciliation.scaledAverageWeeklyHours}h/week average).</span>
          )}
        </p>
      </div>

      {/* Credit & Notional Hours Reconciliation Summary */}
      <div style={{
        padding: '1rem',
        backgroundColor: '#F9FAFB',
        border: '1px solid var(--border-color)',
        borderRadius: '6px',
        marginBottom: '1.5rem',
        fontSize: '0.8125rem'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <strong>Credit & Notional Hours Reconciliation (1 UK credit = 10 notional hours)</strong>
          <span style={{ color: '#4B5563' }}>{reconciliation.totalCredits} credits = {reconciliation.expectedNotionalHours} notional learning hours</span>
        </div>
        <p style={{ margin: 0, color: '#4B5563', lineHeight: '1.5' }}>
          {reconciliation.unreconciledDescription}
        </p>
      </div>

      <div className="workload-insights">
        <div className="heatmap-grid">
          {weeklyData.map((data, index) => {
            const prevData = index > 0 ? weeklyData[index - 1] : null;
            const isSpike = prevData && (data.totalHours - prevData.totalHours >= WORKLOAD_THRESHOLDS.SPIKE_DELTA);
            const isOverload = data.totalHours >= WORKLOAD_THRESHOLDS.OVERLOAD;

            return (
              <div key={data.week} className={`heatmap-cell intensity-${data.intensity}`}>
                <div className="week-label">W{data.week}</div>
                <div className="hour-value">{data.totalHours}h</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', marginTop: '4px' }}>
                  {isOverload && <span style={{ fontSize: '9px', fontWeight: 700, color: '#B91C1C', textTransform: 'uppercase' }}>Overload</span>}
                  {isSpike && <span style={{ fontSize: '9px', fontWeight: 700, color: '#B45309', textTransform: 'uppercase' }}>Spike</span>}
                </div>
              </div>
            );
          })}
        </div>

        <div className="signals-panel">
          <div style={{
            marginBottom: '1rem',
            padding: '0.75rem',
            backgroundColor: '#F9FAFB',
            border: '1px solid #E5E7EB',
            borderRadius: '4px',
            fontSize: '11px',
            color: '#4B5563'
          }}>
            <span style={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '0.25rem' }}>
              Illustrative Planning Thresholds
            </span>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <span><strong>Overload Peak:</strong> &ge; {WORKLOAD_THRESHOLDS.OVERLOAD}h/week</span>
              <span><strong>Workload Spike:</strong> &ge; {WORKLOAD_THRESHOLDS.SPIKE_DELTA}h jump</span>
              <span><strong>Sustained High:</strong> 3+ wks &ge; {WORKLOAD_THRESHOLDS.HIGH}h</span>
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
