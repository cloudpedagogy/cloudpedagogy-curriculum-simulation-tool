import React from 'react';
import { analyzeAssessments } from '../../lib/simulation/assessment';
import { analyzeSkillProgression } from '../../lib/simulation/skills';
import type { SimulationDataset } from '../../types';

interface RiskSignalsPanelProps {
  dataset: SimulationDataset;
}

export const RiskSignalsPanel: React.FC<RiskSignalsPanelProps> = ({ dataset }) => {
  const { signals: assessmentSignals } = analyzeAssessments(dataset);
  const { signals: skillSignals } = analyzeSkillProgression(dataset);

  // Calculate workload signals
  const workloadSignals: { message: string, severity: 'warning' | 'info' | 'critical' }[] = [];
  for (let i = 0; i < 12; i++) {
    const totalHours = dataset.workload.reduce((sum, p) => sum + (p.weeklyHours[i] || 0), 0);
    if (totalHours > 45) {
      workloadSignals.push({ message: `Critical overload risk in Week ${i + 1} (${totalHours}h)`, severity: 'critical' });
    } else if (totalHours > 40) {
      workloadSignals.push({ message: `High workload in Week ${i + 1} (${totalHours}h)`, severity: 'warning' });
    }
  }

  const allSignals = [
    ...workloadSignals.map(s => ({ ...s, category: 'Workload' })),
    ...assessmentSignals.map(s => ({ ...s, category: 'Assessments' })),
    ...skillSignals.map(s => ({ ...s, category: 'Skills' }))
  ];

  if (allSignals.length === 0) return null;

  return (
    <div className="risk-signals-container">
      <div className="risk-header">
        <h3>Coherence & Design Signals</h3>
        <p className="description">Strategic oversight of potential design risks across workload distribution, assessment patterns, and capability development.</p>
      </div>

      <div className="risk-grid">
        {[
          { label: 'Workload Distribution', key: 'Workload' },
          { label: 'Assessment Pattern', key: 'Assessments' },
          { label: 'Capability Development', key: 'Skills' }
        ].map(cat => {
          const catSignals = allSignals.filter(s => s.category === cat.key);
          return (
            <div key={cat.key} className="risk-category">
              <h4>{cat.label}</h4>
              {catSignals.length > 0 ? (
                <ul className="risk-list">
                  {catSignals.map((signal, idx) => (
                    <li key={idx} className={`risk-item severity-${signal.severity}`}>
                      <span className="risk-label" style={{ fontWeight: 700, fontSize: '0.65rem', textTransform: 'uppercase', marginRight: '0.5rem', minWidth: '4.5rem' }}>
                        {signal.severity}
                      </span>
                      <span className="risk-message">{signal.message}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="no-risks">No significant design risks detected in this category.</p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
