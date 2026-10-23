import React, { useMemo } from 'react';
import type { SimulationDataset } from '../../types';
import { calculateWeeklyWorkload, WORKLOAD_THRESHOLDS } from '../../lib/simulation/workload';
import { analyzeAssessments } from '../../lib/simulation/assessment';

interface AISuggestionPanelProps {
  dataset: SimulationDataset;
  onApplySuggestion: (updated: SimulationDataset) => void;
}

export interface PlanningSuggestion {
  id: string;
  title: string;
  rationale: string;
  category: 'assessment' | 'workload' | 'skills';
  actionText: string;
  modelledImpact: string;
  updatedDataset: SimulationDataset;
}

export const AISuggestionPanel: React.FC<AISuggestionPanelProps> = ({ dataset, onApplySuggestion }) => {
  const suggestions = useMemo(() => {
    const list: PlanningSuggestion[] = [];

    // 1. Assessment Congestion Rule: Find congested or high-stakes deadline cluster
    const asmtAnalysis = analyzeAssessments(dataset);
    const congestedCluster = asmtAnalysis.clusters.find(c => c.isCongested && c.assessments.length > 1);

    if (congestedCluster) {
      // Pick an assessment that can be shifted 1 or 2 weeks earlier
      const targetAssessment = congestedCluster.assessments.find(a => a.week > 2) || congestedCluster.assessments[0];
      if (targetAssessment) {
        const newWeek = Math.max(1, targetAssessment.week - 2);
        const newDataset: SimulationDataset = {
          ...dataset,
          assessments: dataset.assessments.map(a =>
            a.id === targetAssessment.id ? { ...a, week: newWeek } : a
          )
        };

        list.push({
          id: `asmt-decongest-${targetAssessment.id}`,
          title: `Relieve Assessment Congestion in Week ${congestedCluster.week}`,
          rationale: `Week ${congestedCluster.week} contains ${congestedCluster.assessments.length} concurrent deadlines totaling ${congestedCluster.programmeAssessmentWeight}% programme assessment load. Moving "${targetAssessment.name}" (${targetAssessment.moduleId}) from Week ${congestedCluster.week} to Week ${newWeek} separates submission deadlines.`,
          category: 'assessment',
          actionText: `Reschedule "${targetAssessment.name}" to Week ${newWeek}`,
          modelledImpact: `Reduces Week ${congestedCluster.week} concurrent deadlines to ${congestedCluster.assessments.length - 1}, smoothing submission strain without altering grading weights.`,
          updatedDataset: newDataset
        });
      }
    }

    // 2. Workload Peak Smoothing Rule: Find week exceeding overload threshold (45h) or high workload (35h)
    const weeklyWorkload = calculateWeeklyWorkload(dataset, 1.0);
    const overloadWeek = weeklyWorkload.find(w => w.totalHours >= WORKLOAD_THRESHOLDS.OVERLOAD);

    if (overloadWeek && overloadWeek.week > 1) {
      const peakWeekIndex = overloadWeek.week - 1;
      // Find the module contributing the highest hours in this peak week
      let highestModId = '';
      let highestHours = 0;

      dataset.workload.forEach(profile => {
        const h = profile.weeklyHours[peakWeekIndex] || 0;
        if (h > highestHours) {
          highestHours = h;
          highestModId = profile.moduleId;
        }
      });

      if (highestModId && highestHours >= 12) {
        const shiftHours = Math.min(4, Math.floor(highestHours * 0.3));
        const earlierWeekIndex = Math.max(0, peakWeekIndex - 2);

        const updatedWorkload = dataset.workload.map(profile => {
          if (profile.moduleId === highestModId) {
            const nextHours = [...profile.weeklyHours];
            nextHours[peakWeekIndex] -= shiftHours;
            nextHours[earlierWeekIndex] += shiftHours;
            return { ...profile, weeklyHours: nextHours };
          }
          return profile;
        });

        const newDataset: SimulationDataset = {
          ...dataset,
          workload: updatedWorkload
        };

        list.push({
          id: `workload-smooth-w${overloadWeek.week}`,
          title: `Smooth Workload Spike in Week ${overloadWeek.week}`,
          rationale: `Simulated full-time workload reaches ${overloadWeek.totalHours.toFixed(1)}h in Week ${overloadWeek.week}, exceeding the 45h overload threshold. Shifting ${shiftHours}h of independent study for ${highestModId} to Week ${earlierWeekIndex + 1} balances the progression profile.`,
          category: 'workload',
          actionText: `Redistribute ${shiftHours}h from W${overloadWeek.week} to W${earlierWeekIndex + 1}`,
          modelledImpact: `Reduces Week ${overloadWeek.week} load by ${shiftHours}h, maintaining total module learning hours while preventing an overload signal.`,
          updatedDataset: newDataset
        });
      }
    }

    // 3. Unassessed Competency Rule: Identify competencies without documented assessment evidence
    const unassessedSkill = dataset.skills.find(skill => {
      const teachingModules = dataset.modules.filter(m => m.skillsGained.includes(skill.id));
      if (teachingModules.length === 0) return false;
      const teachingModuleIds = teachingModules.map(m => m.id);
      const hasAssessment = dataset.assessments.some(a => teachingModuleIds.includes(a.moduleId));
      return !hasAssessment;
    });

    if (unassessedSkill) {
      const teachingMod = dataset.modules.find(m => m.skillsGained.includes(unassessedSkill.id));
      if (teachingMod) {
        const newAssessment = {
          id: `asmt-evidence-${unassessedSkill.id}-${teachingMod.id}`,
          moduleId: teachingMod.id,
          name: `${teachingMod.code} Practical Assessment (${unassessedSkill.name})`,
          type: 'practical' as const,
          week: 10,
          weight: 20
        };

        // Adjust other assessments in the module so weights balance to 100
        const existingModAsmts = dataset.assessments.filter(a => a.moduleId === teachingMod.id);
        const adjustedExisting = existingModAsmts.map(a => ({
          ...a,
          weight: Math.max(10, Math.round(a.weight * 0.8))
        }));
        const otherAsmts = dataset.assessments.filter(a => a.moduleId !== teachingMod.id);

        const newDataset: SimulationDataset = {
          ...dataset,
          assessments: [...otherAsmts, ...adjustedExisting, newAssessment]
        };

        list.push({
          id: `skill-evidence-${unassessedSkill.id}`,
          title: `Add Assessment Component to ${teachingMod.code}`,
          rationale: `"${unassessedSkill.name}" is listed in the syllabus for ${teachingMod.code}, but no assessment tasks are configured in this module. Introducing a practical assessment establishes module-level evaluation coverage.`,
          category: 'skills',
          actionText: `Add Practical Assessment to ${teachingMod.code}`,
          modelledImpact: `Creates an evaluation task in ${teachingMod.code}. Note: introducing an assessment component provides an opportunity for assessment, but does not claim or prove student skill mastery.`,
          updatedDataset: newDataset
        });
      }
    }


    return list;
  }, [dataset]);

  return (
    <div className="ai-suggestion-container" style={{ marginTop: '2.5rem', background: '#FFFFFF', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '1.75rem' }}>
      <div className="ai-header" style={{ marginBottom: '1.25rem' }}>
        <div style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '0.5rem', border: '1px solid var(--border-color)', padding: '0.2rem 0.5rem', display: 'inline-block', borderRadius: '4px' }}>
          Rule-Based Planning Heuristics
        </div>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: '0.25rem 0 0.5rem 0' }}>
          Scenario Design Suggestions
        </h3>
        <p className="description" style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', margin: 0 }}>
          Deterministic, rule-based recommendations derived from workload overload thresholds (45h), deadline clustering rules, and skill evidence mapping.
        </p>
      </div>

      <div className="ai-disclaimer" style={{ background: '#F9FAFB', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '0.75rem 1rem', marginBottom: '1.5rem', fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
        <strong>Academic Governance Note:</strong> All suggestions are deterministic heuristics intended for exploratory modelling. Applying a suggestion updates the working scenario with exact mathematical adjustments. Curriculum teams retain full academic discretion.
      </div>

      {suggestions.length === 0 ? (
        <div style={{ padding: '1.5rem', background: '#F9FAFB', border: '1px dashed var(--border-color)', borderRadius: '6px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
          ✓ No critical workload spikes, deadline congestion, or unassessed competencies detected in current scenario configuration.
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.25rem' }}>
          {suggestions.map(s => (
            <div
              key={s.id}
              style={{
                border: '1px solid var(--border-color)',
                borderRadius: '6px',
                padding: '1.25rem',
                background: '#FFFFFF',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <h4 style={{ fontSize: '0.9375rem', fontWeight: 700, margin: 0 }}>{s.title}</h4>
                  <span style={{ fontSize: '0.6875rem', textTransform: 'uppercase', fontWeight: 600, padding: '2px 6px', borderRadius: '4px', background: '#F3F4F6', color: 'var(--text-secondary)' }}>
                    {s.category}
                  </span>
                </div>
                <p style={{ fontSize: '0.8125rem', color: 'var(--text-main)', lineHeight: 1.5, marginBottom: '0.75rem' }}>
                  {s.rationale}
                </p>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', background: '#F9FAFB', padding: '0.5rem 0.75rem', borderRadius: '4px', marginBottom: '1rem' }}>
                  <strong>Modelled Impact:</strong> {s.modelledImpact}
                </div>
              </div>

              <button
                className="btn btn-primary"
                onClick={() => onApplySuggestion(s.updatedDataset)}
                style={{ width: '100%', fontSize: '0.8125rem', padding: '0.5rem 0.75rem' }}
              >
                Apply: {s.actionText}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
