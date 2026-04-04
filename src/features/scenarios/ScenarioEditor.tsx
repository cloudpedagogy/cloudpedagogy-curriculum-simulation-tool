import React from 'react';
import type { SimulationDataset } from '../../types';

interface ScenarioEditorProps {
  dataset: SimulationDataset;
  onUpdate: (updatedDataset: SimulationDataset) => void;
  onReset: () => void;
}

export const ScenarioEditor: React.FC<ScenarioEditorProps> = ({ dataset, onUpdate, onReset }) => {
  const handleShiftAssessment = (assessmentId: string, delta: number) => {
    const updatedAssessments = dataset.assessments.map(a => {
      if (a.id === assessmentId) {
        const newWeek = Math.max(1, Math.min(12, a.week + delta));
        return { ...a, week: newWeek };
      }
      return a;
    });
    onUpdate({ ...dataset, assessments: updatedAssessments });
  };

  const handleAdjustWorkload = (moduleId: string, factor: number) => {
    const updatedWorkload = dataset.workload.map(p => {
      if (p.moduleId === moduleId) {
        return {
          ...p,
          weeklyHours: p.weeklyHours.map(h => Math.round(h * factor))
        };
      }
      return p;
    });
    onUpdate({ ...dataset, workload: updatedWorkload });
  };

  return (
    <div className="scenario-editor-container">
      <div className="scenario-header">
        <h2>Pathway Simulation & Modelling</h2>
        <p className="description">Adjust pathway parameters to model coherence and strain across "what-if" scenarios.</p>
        <button className="btn btn-ghost" onClick={onReset}>Restore Baseline</button>
      </div>

      <div className="scenario-controls-grid">
        <div className="control-group">
          <h3>Assessment Scheduling</h3>
          <div className="scroll-area">
            {dataset.assessments.map(asmt => (
              <div key={asmt.id} className="control-row">
                <span className="control-label">{asmt.name} (W{asmt.week})</span>
                <div className="button-group">
                  <button className="btn-small" onClick={() => handleShiftAssessment(asmt.id, -1)}>-</button>
                  <button className="btn-small" onClick={() => handleShiftAssessment(asmt.id, 1)}>+</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="control-group">
          <h3>Workload Modelling</h3>
          <div className="scroll-area">
            {dataset.modules.map(module => (
              <div key={module.id} className="control-row">
                <span className="control-label">{module.code}</span>
                <div className="button-group">
                  <button className="btn-small" onClick={() => handleAdjustWorkload(module.id, 0.9)}>Reduce</button>
                  <button className="btn-small" onClick={() => handleAdjustWorkload(module.id, 1.1)}>Increase</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
