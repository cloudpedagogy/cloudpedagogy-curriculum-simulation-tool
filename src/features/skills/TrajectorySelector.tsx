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
    { id: 'linear', name: 'Linear', icon: '📈', desc: 'Predictable constant growth per competency exposure.' },
    { id: 'accelerated', name: 'Accelerated', icon: '🚀', desc: 'Exponential compounding—practice leads to rapid mastery.' },
    { id: 'plateau', name: 'Plateau', icon: '📉', desc: 'Diminishing returns—quick initial gains, slower high-end mastery.' }
  ];

  return (
    <div className="trajectory-selector-container p-4 bg-slate-50 rounded-lg border border-slate-200">
      <h3 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
        <span>📉 Global Skill Trajectories</span>
      </h3>
      <div className="grid grid-cols-1 gap-2">
        {modes.map(mode => (
          <button
            key={mode.id}
            onClick={() => onSelectMode(mode.id)}
            className={`flex items-center gap-3 p-3 rounded-lg border transition-all text-left ${
              activeMode === mode.id 
                ? 'bg-emerald-600 border-emerald-700 text-white shadow-md' 
                : 'bg-white border-slate-200 text-slate-600 hover:border-emerald-400'
            }`}
          >
            <span className="text-lg">{mode.icon}</span>
            <div>
              <div className="font-bold text-sm leading-tight">{mode.name}</div>
              <p className={`text-[10px] leading-tight ${
                activeMode === mode.id ? 'text-emerald-100' : 'text-slate-400'
              }`}>
                {mode.desc}
              </p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
