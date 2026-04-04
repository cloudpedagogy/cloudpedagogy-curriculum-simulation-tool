import React, { useMemo } from 'react';
import type { SimulationDataset } from '../../types';

interface AISuggestionPanelProps {
  dataset: SimulationDataset;
  onApplySuggestion: (updated: SimulationDataset) => void;
}

export const AISuggestionPanel: React.FC< AISuggestionPanelProps> = ({ dataset, onApplySuggestion }) => {
  const suggestions = useMemo(() => {
    const list: { id: string; title: string; description: string; type: 'sequencing' | 'assessment' | 'skill'; actionText: string; impact: string; updatedDataset: SimulationDataset }[] = [];

    // 1. Suggest Assessment Redistribution
    const clusterWeeks = [];
    for (let i = 1; i <= 12; i++) {
      if (dataset.assessments.filter(a => a.week === i).length > 2) clusterWeeks.push(i);
    }

    if (clusterWeeks.length > 0) {
      const targetWeek = clusterWeeks[0];
      const assessmentToMove = dataset.assessments.find(a => a.week === targetWeek);
      if (assessmentToMove) {
        const newWeek = targetWeek > 1 ? targetWeek - 1 : targetWeek + 1;
        const newDataset = {
          ...dataset,
          assessments: dataset.assessments.map(a => a.id === assessmentToMove.id ? { ...a, week: newWeek } : a)
        };
        list.push({
          id: 'asmt-move',
          title: 'Redistribute High-Stakes Clustering',
          description: `Moving "${assessmentToMove.name}" to Week ${newWeek} could reduce the heavy assessment burden in Week ${targetWeek}.`,
          type: 'assessment',
          actionText: 'Apply Timing Adjustment',
          impact: 'Reduces peak deadline concentration',
          updatedDataset: newDataset
        });
      }
    }

    // 2. Suggest Skill Reinforcement
    const skillCounts: Record<string, number> = {};
    dataset.modules.forEach(m => m.skillsGained.forEach(s => skillCounts[s] = (skillCounts[s] || 0) + 1));
    const underReinforced = Object.entries(skillCounts).find(([_, count]) => count === 1);
    
    if (underReinforced) {
      const [skillId] = underReinforced;
      const skillName = dataset.skills.find(s => s.id === skillId)?.name || skillId;
      const targetModule = dataset.modules.find(m => !m.skillsGained.includes(skillId));
      if (targetModule) {
        const newDataset = {
          ...dataset,
          modules: dataset.modules.map(m => m.id === targetModule.id ? { ...m, skillsGained: [...m.skillsGained, skillId] } : m)
        };
        list.push({
          id: 'skill-reinforce',
          title: 'Strengthen Skill Scaffolding',
          description: `"${skillName}" is currently only practiced in one module. Consider reinforcing it within "${targetModule.code}".`,
          type: 'skill',
          actionText: 'Apply Skill Mapping',
          impact: 'Improves student retention and competency',
          updatedDataset: newDataset
        });
      }
    }

    // 3. Suggest Sequencing Idea
    const coreModule = dataset.modules[0];
    if (coreModule) {
      list.push({
        id: 'sequence-shift',
        title: 'Optimize Module Sequencing',
        description: `Consider starting "${coreModule.code}" one week earlier to better support foundational skill acquisition.`,
        type: 'sequencing',
        actionText: 'Adjust Sequence',
        impact: 'Smoothes progression curve',
        updatedDataset: dataset // Simulating a sequence change would require week-shifting workload which is complex for a mock
      });
    }

    return list;
  }, [dataset]);

  return (
    <div className="ai-suggestion-container">
      <div className="ai-header">
        <div className="ai-badge">Optional Simulation Intelligence</div>
        <h3>Scenario Design Suggestions</h3>
        <p className="description">Model-generated curriculum refinements for review. These suggestions are <strong>non-binding</strong> and require academic oversight.</p>
      </div>

      <div className="ai-disclaimer">
        <strong>Governance Note:</strong> Suggestions are generated using rule-based heuristics to support curriculum coherence. Programme teams retain full responsibility for all decisions. The tool provides interpretive ideas for exploratory modelling, not automated compliance.
      </div>

      <div className="ai-grid">
        {suggestions.map(s => (
          <div key={s.id} className={`ai-card type-${s.type}`}>
            <div className="ai-card-content">
              <h4>{s.title}</h4>
              <p>{s.description}</p>
              <div className="ai-impact">
                <strong>Modelled Impact:</strong> {s.impact}
              </div>
            </div>
            <button className="btn-ai" onClick={() => onApplySuggestion(s.updatedDataset)}>
              Review & Integrate
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
