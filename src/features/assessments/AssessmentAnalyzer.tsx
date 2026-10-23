import React from 'react';
import { analyzeAssessments } from '../../lib/simulation/assessment';
import type { SimulationDataset } from '../../types';

interface AssessmentAnalyzerProps {
  dataset: SimulationDataset;
}

export const AssessmentAnalyzer: React.FC<AssessmentAnalyzerProps> = ({ dataset }) => {
  const { clusters, typeCounts, signals, unassignedAssessments, programmeTotalCredits } = analyzeAssessments(dataset);

  return (
    <div className="assessment-analyzer-container">
      <div className="assessment-section-header">
        <h2>Assessment Congestion & Diversity</h2>
        <p className="description">
          Evaluates deadline concentration and method variety across the 12-week teaching period.
          Distinguishes module-internal grading weights from credit-weighted programme-wide assessment pressure.
        </p>
        <div className="simulation-reconciliation-banner" style={{ marginTop: '1rem' }}>
          <div className="banner-summary">
            <strong>Planning Methodology & Assumptions:</strong> Programme assessment load is credit-weighted
            (<code>Module Weight × Module Credits / {programmeTotalCredits} Total Credits</code>).
            A week is flagged as <strong>congested</strong> if it contains 3+ deadlines, or 2+ deadlines across different modules
            representing ≥ 20% of total programme assessment load. A week is <strong>high stakes</strong> if it contains an individual
            module assessment ≥ 40% weight or total programme load ≥ 25%.
            <div style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              Note: These thresholds represent illustrative planning heuristics for identifying scheduling concentration,
              not empirical measures of student effort, difficulty, or cognitive stress. Missing assessment data reflects unrecorded
              curriculum details rather than confirmed absence of assessment pressure.
            </div>
          </div>
        </div>

      </div>

      <div className="assessment-insights">
        <div className="clustering-panel">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3>Deadline Distribution (12-Week Teaching Period)</h3>
            <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
              {dataset.assessments.length} total assessment{dataset.assessments.length === 1 ? '' : 's'}
            </span>
          </div>

          <div className="clustering-grid">
            {clusters.map((cluster) => {
              const hasCongestion = cluster.isCongested;
              const hasHighStakes = cluster.isHighStakes;
              const cellClasses = [
                'cluster-cell',
                hasCongestion ? 'congested' : '',
                hasHighStakes ? 'high-stakes' : ''
              ].filter(Boolean).join(' ');

              return (
                <div key={cluster.week} className={cellClasses}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.25rem' }}>
                    <div className="week-label" style={{ fontWeight: 700 }}>W{cluster.week}</div>
                    {hasCongestion && (
                      <span
                        style={{
                          fontSize: '0.6875rem',
                          padding: '1px 4px',
                          borderRadius: '3px',
                          background: '#FEF3C7',
                          color: '#92400E',
                          fontWeight: 600
                        }}
                        title="Congested week: multiple concurrent deadlines"
                      >
                        Congested
                      </span>
                    )}
                    {!hasCongestion && hasHighStakes && (
                      <span
                        style={{
                          fontSize: '0.6875rem',
                          padding: '1px 4px',
                          borderRadius: '3px',
                          background: '#E0E7FF',
                          color: '#3730A3',
                          fontWeight: 600
                        }}
                        title="High stakes assessment week"
                      >
                        High Stakes
                      </span>
                    )}
                  </div>

                  <div className="asmt-count">
                    {cluster.assessments.length === 0
                      ? 'No deadlines'
                      : `${cluster.assessments.length} deadline${cluster.assessments.length === 1 ? '' : 's'}`}
                  </div>

                  {cluster.assessments.length > 0 && (
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                      Prog load: <strong>{cluster.programmeAssessmentWeight}%</strong>
                    </div>
                  )}

                  <div className="asmt-details">
                    {cluster.assessments.map(a => {
                      const mod = dataset.modules.find(m => m.id === a.moduleId);
                      const modCredits = mod?.credits || 0;
                      const progShare = programmeTotalCredits > 0
                        ? Math.round((a.weight * modCredits / programmeTotalCredits) * 10) / 10
                        : 0;

                      return (
                        <div
                          key={a.id}
                          className="asmt-tag"
                          title={`${a.name} (${a.type}) - ${a.weight}% of ${a.moduleId} (${progShare}% programme load)`}
                          style={{ display: 'flex', flexDirection: 'column', gap: '2px', padding: '4px', height: 'auto', whiteSpace: 'normal' }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 600 }}>
                            <span>{a.moduleId}</span>
                            <span>{a.weight}% mod</span>
                          </div>
                          <div style={{ color: 'var(--text-dim)', fontSize: '0.7rem' }}>
                            {a.name} ({a.type}) • {progShare}% prog
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {unassignedAssessments && unassignedAssessments.length > 0 && (
            <div
              style={{
                marginTop: '1.5rem',
                padding: '1rem',
                border: '1px dashed #D97706',
                background: '#FFFBEB',
                borderRadius: '6px'
              }}
            >
              <h4 style={{ color: '#92400E', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                ⚠️ Assessments Without Assigned Teaching Week ({unassignedAssessments.length})
              </h4>
              <p style={{ fontSize: '0.8125rem', color: '#78350F', marginBottom: '0.5rem' }}>
                These assessments are defined in curriculum modules but have no assigned week (1–12).
                They are excluded from the 12-week congestion profile until a valid week is assigned.
              </p>
              <ul style={{ fontSize: '0.8125rem', paddingLeft: '1.25rem', color: '#78350F' }}>
                {unassignedAssessments.map(a => (
                  <li key={a.id}>
                    <strong>{a.moduleId}:</strong> {a.name} ({a.type}, {a.weight}%)
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="diversity-panel">
          <div className="diversity-summary">
            <h3>Assessment Method Diversity</h3>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
              Mix of evaluation modalities across active modules.
            </p>
            <div className="type-distribution">
              {Object.entries(typeCounts).map(([type, count]) => (
                <div key={type} className="type-row">
                  <span className="type-label">{type}</span>
                  <span className="type-bar-bg">
                    <span
                      className="type-bar"
                      style={{ width: `${dataset.assessments.length > 0 ? (count / dataset.assessments.length) * 100 : 0}%` }}
                    />
                  </span>
                  <span className="type-count">{count}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="signals-panel">
            <h3>Assessment & Congestion Signals</h3>
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
