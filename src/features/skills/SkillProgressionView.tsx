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
        <h2>Skill Progression & Scaffolding</h2>
        <p className="description">Visualizing how competencies are introduced, reinforced, and advanced throughout the programme.</p>
      </div>

      <div className="skill-insights">
        <div className="progression-panel">
          <h3>Skill Timeline</h3>
          <div className="skill-grid">
            {progression.map((p) => (
              <div key={p.skillId} className="skill-row">
                <div className="skill-meta">
                  <div className="flex justify-between items-center w-full mb-1">
                    <span className="skill-name">{p.skillName}</span>
                    <span className="text-[10px] font-bold text-slate-500">{p.growthValue.toFixed(0)}% Mastery</span>
                  </div>
                  <div className="w-full bg-slate-100 h-1 rounded-full overflow-hidden">
                    <div 
                      className="bg-emerald-500 h-full transition-all duration-1000" 
                      style={{ width: `${p.growthValue}%` }}
                    />
                  </div>
                </div>
                <div className="skill-timeline">
                  {Array.from({ length: 12 }, (_, i) => i + 1).map(week => {
                    const usage = p.usages.find(u => u.week === week);
                    return (
                      <div key={week} className={`skill-cell week-${week} ${usage ? `level-${usage.level}` : ''}`} title={usage ? `Week ${week}: ${usage.level}` : `Week ${week}: No usage`}>
                        {usage && <span className="level-indicator"></span>}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
          <div className="skill-legend">
            <span className="legend-item intro">Introduction</span>
            <span className="legend-item reinforce">Reinforcement</span>
            <span className="legend-item advanced">Advanced Use</span>
          </div>
        </div>

        <div className="signals-panel">
          <h3>Scaffolding Signals</h3>
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
            <p className="no-signals">No major skill scaffolding risks detected.</p>
          )}
        </div>
      </div>
    </div>
  );
};
