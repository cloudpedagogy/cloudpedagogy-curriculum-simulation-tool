import React from 'react';
import { analyzeSkillProgression } from '../../lib/simulation/skills';
import type { SimulationDataset } from '../../types';

interface SkillProgressionViewProps {
  dataset: SimulationDataset;
}

export const SkillProgressionView: React.FC<SkillProgressionViewProps> = ({ dataset }) => {
  const { progression, signals } = analyzeSkillProgression(dataset);

  return (
    <div className="skill-progression-container">
      <div className="skill-section-header">
        <h2>Curriculum Skill Exposure & Scaffolding</h2>
        <p className="description">
          Maps where competencies are introduced, reinforced, and practised across modules and teaching weeks.
        </p>
        <div className="simulation-reconciliation-banner" style={{ marginTop: '1rem' }}>
          <div className="banner-summary">
            <strong>Pedagogical Distinction:</strong> Repeated curriculum exposure provides structured opportunities to practise;
            it is <em>not</em> an automated guarantee of student mastery. Assessment coverage is identified from assessments
            configured in the host modules addressing each skill; because individual task questions are not tracked separately,
            this indicates potential assessment coverage in host modules rather than confirmed individual skill attainment.
          </div>
        </div>
      </div>


      <div className="skill-insights">
        <div className="progression-panel">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3>Competency Touchpoints Across Modules</h3>
            <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
              {progression.length} Competencies Tracked
            </span>
          </div>

          <div className="skill-grid">
            {progression.map((p) => (
              <div key={p.skillId} className="skill-row" style={{ alignItems: 'flex-start', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border-color)' }}>
                <div className="skill-meta" style={{ flex: '0 0 220px' }}>
                  <div style={{ fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.25rem' }}>
                    {p.skillName}
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginBottom: '0.35rem' }}>
                    <span
                      style={{
                        fontSize: '0.6875rem',
                        padding: '1px 5px',
                        borderRadius: '3px',
                        background: p.moduleCount >= 2 ? '#E0F2FE' : '#F3F4F6',
                        color: p.moduleCount >= 2 ? '#0369A1' : '#4B5563',
                        fontWeight: 600
                      }}
                    >
                      {p.moduleCount} {p.moduleCount === 1 ? 'module' : 'modules'} ({p.moduleIds.join(', ')})
                    </span>
                    <span
                      style={{
                        fontSize: '0.6875rem',
                        padding: '1px 5px',
                        borderRadius: '3px',
                        background: '#F3F4F6',
                        color: 'var(--text-secondary)'
                      }}
                    >
                      {p.exposureLevel}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: p.assessmentEvidenceCount > 0 ? '#15803D' : '#B45309' }}>
                    {p.assessmentEvidenceCount > 0
                      ? `✓ ${p.assessmentEvidenceCount} assessment link${p.assessmentEvidenceCount === 1 ? '' : 's'}`
                      : '⚠️ No linked assessment'}
                  </div>
                </div>

                <div style={{ flex: 1 }}>
                  <div className="skill-timeline">
                    {Array.from({ length: 12 }, (_, i) => i + 1).map(week => {
                      const usage = p.usages.find(u => u.week === week);
                      const isTeachingWeek = p.activeWeeks.includes(week);
                      let levelClass = '';
                      let cellTitle = `Week ${week}: Not actively taught`;

                      if (usage) {
                        levelClass = `level-${usage.level}`;
                        cellTitle = `Week ${week}: ${usage.level.toUpperCase()} (${usage.moduleId})`;
                      } else if (isTeachingWeek) {
                        levelClass = 'level-practice';
                        cellTitle = `Week ${week}: Ongoing module practice`;
                      }

                      return (
                        <div
                          key={week}
                          className={`skill-cell week-${week} ${levelClass}`}
                          title={cellTitle}
                        >
                          {usage && <span className="level-indicator" />}
                        </div>
                      );
                    })}
                  </div>
                  {p.assessmentEvidence.length > 0 && (
                    <div style={{ marginTop: '0.25rem', fontSize: '0.7rem', color: 'var(--text-dim)' }}>
                      Module Assessment Coverage (Potential Evidence): {p.assessmentEvidence.map(a => `${a.moduleId} W${a.week} ${a.assessmentName} (${a.type})`).join('; ')}
                    </div>
                  )}

                </div>
              </div>
            ))}
          </div>

          <div className="skill-legend" style={{ marginTop: '1.5rem' }}>
            <span className="legend-item intro">Initial Module Introduction</span>
            <span className="legend-item reinforce">Reinforcement Module</span>
            <span className="legend-item practice">Integrated Practice</span>
          </div>
        </div>

        <div className="signals-panel">
          <h3>Curricular Scaffolding Signals</h3>
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
            <p className="no-signals">No major skill scaffolding or unassessed competency risks detected.</p>
          )}
        </div>
      </div>
    </div>
  );
};
