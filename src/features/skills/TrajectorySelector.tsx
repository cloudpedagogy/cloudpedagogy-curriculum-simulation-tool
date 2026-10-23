import React from 'react';
import type { TrajectoryMode } from '../../types';

interface TrajectorySelectorProps {
  activeMode: TrajectoryMode;
  onSelectMode: (mode: TrajectoryMode) => void;
}

export const TrajectorySelector: React.FC<TrajectorySelectorProps> = ({ 
  activeMode, 
  onSelectMode 
}) => {
  const modes: { id: TrajectoryMode; name: string; icon: string; desc: string }[] = [
    {
      id: 'linear',
      name: 'Linear Weighting',
      icon: '📈',
      desc: 'Uniform weighting across all curriculum touchpoints and practice opportunities.'
    },
    {
      id: 'accelerated',
      name: 'Cumulative Weighting',
      icon: '🚀',
      desc: 'Emphasises progressive reinforcement in subsequent modules and synthesising tasks.'
    },
    {
      id: 'plateau',
      name: 'Foundational Weighting',
      icon: '📉',
      desc: 'Emphasises early core introductory modules where fundamental scaffolding occurs.'
    }
  ];

  return (
    <div className="persona-selector-container" style={{ marginBottom: '1.5rem' }}>
      <h3 style={{ fontSize: '0.875rem', fontWeight: 700, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <span>Curricular Scaffolding Model</span>
      </h3>
      <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
        Configures the exposure weighting model used for curriculum planning assumptions.
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0.5rem' }}>
        {modes.map(mode => {
          const isSelected = activeMode === mode.id;
          return (
            <button
              key={mode.id}
              onClick={() => onSelectMode(mode.id)}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.75rem',
                padding: '0.75rem',
                borderRadius: '6px',
                border: isSelected ? '2px solid var(--primary-color)' : '1px solid var(--border-color)',
                background: isSelected ? '#F9FAFB' : '#FFFFFF',
                color: 'var(--text-main)',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.15s ease'
              }}
            >
              <span style={{ fontSize: '1.25rem', lineHeight: 1 }}>{mode.icon}</span>
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.875rem', lineHeight: 1.2 }}>{mode.name}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                  {mode.desc}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
