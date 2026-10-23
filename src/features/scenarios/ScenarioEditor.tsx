import React, { useState, useRef } from 'react';
import type { SimulationDataset, Module, Assessment } from '../../types';
import { distributeHoursEvenly, smoothWeeklyHours } from '../../lib/simulation/workload';
import { AccessibleModal } from '../../components/common/AccessibleModal';

interface ScenarioEditorProps {
  dataset: SimulationDataset;
  isBaseline?: boolean;
  onUpdate: (updatedDataset: SimulationDataset) => void;
  onReset?: () => void;
}

export const ScenarioEditor: React.FC<ScenarioEditorProps> = ({
  dataset,
  isBaseline = false,
  onUpdate,
  onReset
}) => {
  const [activeTab, setActiveTab] = useState<'workload' | 'assessments' | 'modules'>('workload');
  const [selectedModuleId, setSelectedModuleId] = useState<string>(
    dataset.modules[0]?.id || ''
  );
  const tabRefs = useRef<{ [key: string]: HTMLButtonElement | null }>({});

  const handleTabKeyDown = (e: React.KeyboardEvent, currentId: 'workload' | 'assessments' | 'modules') => {
    const tabIds: Array<'workload' | 'assessments' | 'modules'> = ['workload', 'assessments', 'modules'];
    const currentIndex = tabIds.indexOf(currentId);
    let nextIndex = -1;

    if (e.key === 'ArrowRight') {
      nextIndex = (currentIndex + 1) % tabIds.length;
    } else if (e.key === 'ArrowLeft') {
      nextIndex = (currentIndex - 1 + tabIds.length) % tabIds.length;
    } else if (e.key === 'Home') {
      nextIndex = 0;
    } else if (e.key === 'End') {
      nextIndex = tabIds.length - 1;
    }

    if (nextIndex !== -1) {
      e.preventDefault();
      const nextTabId = tabIds[nextIndex];
      setActiveTab(nextTabId);
      tabRefs.current[nextTabId]?.focus();
    }
  };

  // New module form state
  const [showAddModule, setShowAddModule] = useState(false);
  const [newModCode, setNewModCode] = useState('');
  const [newModTitle, setNewModTitle] = useState('');
  const [newModCredits, setNewModCredits] = useState(15);
  const [moduleValidationError, setModuleValidationError] = useState<string | null>(null);

  // Accessible confirmation dialog states (replaces window.confirm)
  const [moduleToDelete, setModuleToDelete] = useState<Module | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // Fallback if selectedModuleId was removed
  const activeModule = dataset.modules.find(m => m.id === selectedModuleId) || dataset.modules[0];
  const activeWorkload = activeModule
    ? dataset.workload.find(w => w.moduleId === activeModule.id)
    : undefined;

  // --- Workload Editing Handlers ---
  const handleWeeklyHourChange = (weekIndex: number, newHours: number) => {
    if (!activeModule) return;
    const clampedHours = Math.max(0, Math.min(60, isNaN(newHours) ? 0 : newHours));
    const updatedWorkload = dataset.workload.map(profile => {
      if (profile.moduleId === activeModule.id) {
        const nextHours = [...profile.weeklyHours];
        nextHours[weekIndex] = clampedHours;
        return { ...profile, weeklyHours: nextHours };
      }
      return profile;
    });
    onUpdate({ ...dataset, workload: updatedWorkload });
  };

  const handleDistributeEvenly = () => {
    if (!activeModule || !activeWorkload) return;
    const newHours = distributeHoursEvenly(activeWorkload.weeklyHours);
    const updatedWorkload = dataset.workload.map(profile => {
      if (profile.moduleId === activeModule.id) {
        return { ...profile, weeklyHours: newHours };
      }
      return profile;
    });
    onUpdate({ ...dataset, workload: updatedWorkload });
  };

  const handleSmoothPeaks = () => {
    if (!activeModule || !activeWorkload) return;
    const smoothed = smoothWeeklyHours(activeWorkload.weeklyHours);
    const updatedWorkload = dataset.workload.map(profile => {
      if (profile.moduleId === activeModule.id) {
        return { ...profile, weeklyHours: smoothed };
      }
      return profile;
    });
    onUpdate({ ...dataset, workload: updatedWorkload });
  };


  // --- Assessment Editing Handlers ---
  const handleUpdateAssessmentWeek = (asmtId: string, week: number) => {
    const updated = dataset.assessments.map(a => (a.id === asmtId ? { ...a, week } : a));
    onUpdate({ ...dataset, assessments: updated });
  };

  const handleUpdateAssessmentWeight = (asmtId: string, weight: number) => {
    const clamped = Math.max(0, Math.min(100, isNaN(weight) ? 0 : weight));
    const updated = dataset.assessments.map(a => (a.id === asmtId ? { ...a, weight: clamped } : a));
    onUpdate({ ...dataset, assessments: updated });
  };

  const handleUpdateAssessmentType = (asmtId: string, type: string) => {
    const updated = dataset.assessments.map(a => (a.id === asmtId ? { ...a, type } : a));
    onUpdate({ ...dataset, assessments: updated });
  };

  const handleDeleteAssessment = (asmtId: string) => {
    const updated = dataset.assessments.filter(a => a.id !== asmtId);
    onUpdate({ ...dataset, assessments: updated });
  };

  const handleAddAssessment = (moduleId: string) => {
    const mod = dataset.modules.find(m => m.id === moduleId);
    if (!mod) return;
    const existingModAsmts = dataset.assessments.filter(a => a.moduleId === moduleId);
    const existingWeight = existingModAsmts.reduce((s, a) => s + a.weight, 0);
    const remainingWeight = Math.max(10, 100 - existingWeight);

    const newAsmt: Assessment = {
      id: `asmt-${Date.now()}`,
      moduleId,
      name: `${mod.code} Coursework Assignment`,
      type: 'coursework',
      week: 6,
      weight: remainingWeight
    };
    onUpdate({
      ...dataset,
      assessments: [...dataset.assessments, newAsmt]
    });
  };

  // --- Module Editing Handlers (with Referential Integrity Cascade) ---
  const handleUpdateCredits = (moduleId: string, credits: number) => {
    const clamped = Math.max(5, Math.min(120, isNaN(credits) ? 15 : credits));
    const updatedModules = dataset.modules.map(m => (m.id === moduleId ? { ...m, credits: clamped } : m));
    onUpdate({ ...dataset, modules: updatedModules });
  };

  const handleDeleteModule = (moduleId: string) => {
    const modToDelete = dataset.modules.find(m => m.id === moduleId);
    if (!modToDelete) return;
    setModuleToDelete(modToDelete);
  };

  const confirmDeleteModule = () => {
    if (!moduleToDelete) return;
    const moduleId = moduleToDelete.id;

    // Referential integrity cascade:
    // 1. Remove module
    const updatedModules = dataset.modules.filter(m => m.id !== moduleId);
    // 2. Remove workload profile
    const updatedWorkload = dataset.workload.filter(w => w.moduleId !== moduleId);
    // 3. Remove associated assessments
    const updatedAssessments = dataset.assessments.filter(a => a.moduleId !== moduleId);

    if (selectedModuleId === moduleId) {
      setSelectedModuleId(updatedModules[0]?.id || '');
    }

    onUpdate({
      ...dataset,
      modules: updatedModules,
      workload: updatedWorkload,
      assessments: updatedAssessments
    });
    setModuleToDelete(null);
  };

  const handleCreateModule = (e: React.FormEvent) => {
    e.preventDefault();
    setModuleValidationError(null);
    if (!newModCode.trim() || !newModTitle.trim()) return;

    const modId = `mod-${newModCode.trim().toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
    if (dataset.modules.some(m => m.id === modId || m.code.toLowerCase() === newModCode.trim().toLowerCase())) {
      setModuleValidationError(`A module with code "${newModCode}" already exists.`);
      return;
    }

    const newModule: Module = {
      id: modId,
      code: newModCode.trim().toUpperCase(),
      title: newModTitle.trim(),
      credits: newModCredits,
      learningOutcomes: [],
      skillsGained: []
    };

    // Initialize 12-week workload profile representing ~80% of notional hours in teaching weeks
    const targetTeachingHours = Math.round(newModCredits * 10 * 0.83);
    const baseHour = Math.floor(targetTeachingHours / 12);
    const remainder = targetTeachingHours % 12;
    const weeklyHours = Array(12).fill(baseHour);
    for (let i = 0; i < remainder; i++) {
      weeklyHours[i] += 1;
    }

    const newWorkloadProfile = {
      moduleId: modId,
      weeklyHours
    };

    // Add initial default assessment
    const initialAssessment: Assessment = {
      id: `asmt-${Date.now()}`,
      moduleId: modId,
      name: `${newModule.code} Written Assignment`,
      type: 'coursework',
      week: 8,
      weight: 100
    };

    onUpdate({
      ...dataset,
      modules: [...dataset.modules, newModule],
      workload: [...dataset.workload, newWorkloadProfile],
      assessments: [...dataset.assessments, initialAssessment]
    });

    setSelectedModuleId(modId);
    setNewModCode('');
    setNewModTitle('');
    setNewModCredits(15);
    setShowAddModule(false);
  };

  const handleResetWithConfirm = () => {
    if (!onReset) return;
    setShowResetConfirm(true);
  };

  const confirmResetScenario = () => {
    setShowResetConfirm(false);
    if (onReset) {
      onReset();
    }
  };

  return (
    <div className="scenario-editor-container">
      <div className="scenario-header">
        <div>
          <h2>Direct Scenario Authoring & Modelling</h2>
          <p className="description" style={{ margin: 0 }}>
            Model curriculum changes: edit weekly workload hours, redistribute pressure, reschedule assessments, and adjust module credits.
          </p>
        </div>
        {onReset && !isBaseline && (
          <button className="btn btn-ghost" onClick={handleResetWithConfirm} style={{ color: '#DC2626' }}>
            ↺ Reset Scenario to Baseline
          </button>
        )}
      </div>

      {isBaseline && (
        <div style={{ padding: '0.75rem 1rem', background: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: '6px', marginBottom: '1.5rem', fontSize: '0.8125rem', color: '#1E40AF' }}>
          ℹ️ <strong>Protected Baseline:</strong> Any changes made here will automatically branch into an alternative scenario to preserve the baseline.
        </div>
      )}

      {/* Editor Tab Navigation */}
      <div
        role="tablist"
        aria-label="Scenario Editor navigation"
        style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid var(--border-color)', marginBottom: '1.5rem', paddingBottom: '0.5rem' }}
      >
        <button
          ref={el => { tabRefs.current['workload'] = el; }}
          role="tab"
          id="tab-workload"
          aria-selected={activeTab === 'workload'}
          aria-controls="panel-workload"
          tabIndex={activeTab === 'workload' ? 0 : -1}
          className={`btn ${activeTab === 'workload' ? 'btn-primary' : 'btn-ghost'}`}
          onClick={() => setActiveTab('workload')}
          onKeyDown={e => handleTabKeyDown(e, 'workload')}
          style={{ fontSize: '0.8125rem' }}
        >
          ⏱️ Weekly Workload Hours
        </button>
        <button
          ref={el => { tabRefs.current['assessments'] = el; }}
          role="tab"
          id="tab-assessments"
          aria-selected={activeTab === 'assessments'}
          aria-controls="panel-assessments"
          tabIndex={activeTab === 'assessments' ? 0 : -1}
          className={`btn ${activeTab === 'assessments' ? 'btn-primary' : 'btn-ghost'}`}
          onClick={() => setActiveTab('assessments')}
          onKeyDown={e => handleTabKeyDown(e, 'assessments')}
          style={{ fontSize: '0.8125rem' }}
        >
          📋 Assessment Deadlines & Weights
        </button>
        <button
          ref={el => { tabRefs.current['modules'] = el; }}
          role="tab"
          id="tab-modules"
          aria-selected={activeTab === 'modules'}
          aria-controls="panel-modules"
          tabIndex={activeTab === 'modules' ? 0 : -1}
          className={`btn ${activeTab === 'modules' ? 'btn-primary' : 'btn-ghost'}`}
          onClick={() => setActiveTab('modules')}
          onKeyDown={e => handleTabKeyDown(e, 'modules')}
          style={{ fontSize: '0.8125rem' }}
        >
          📦 Modules & Credits ({dataset.modules.length})
        </button>
      </div>

      {/* TAB 1: WEEKLY WORKLOAD */}
      {activeTab === 'workload' && (
        <div role="tabpanel" id="panel-workload" aria-labelledby="tab-workload" tabIndex={0} style={{ outline: 'none' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <label htmlFor="select-module-workload" style={{ fontWeight: 600, fontSize: '0.875rem' }}>Select Module to Edit:</label>
              <select
                id="select-module-workload"
                value={selectedModuleId}
                onChange={(e) => setSelectedModuleId(e.target.value)}
                style={{ padding: '0.4rem 0.75rem', borderRadius: '4px', border: '1px solid var(--border-color)', fontSize: '0.875rem' }}
              >
                {dataset.modules.map(m => (
                  <option key={m.id} value={m.id}>
                    {m.code} — {m.title} ({m.credits} credits)
                  </option>
                ))}
              </select>
            </div>

            {activeWorkload && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.25rem' }}>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    className="btn btn-small"
                    onClick={handleDistributeEvenly}
                    title="Evenly distribute module teaching hours uniformly across all 12 weeks while preserving total module hours"
                  >
                    ⚖️ Distribute Evenly
                  </button>
                  <button
                    className="btn btn-small"
                    onClick={handleSmoothPeaks}
                    title="Illustrative planning heuristic: caps weeks exceeding 125% of module average (minimum 12h) and reallocates surplus to lower-load weeks"
                  >
                    🌊 Smooth Peak Weeks
                  </button>
                </div>
                <span style={{ fontSize: '0.6875rem', color: 'var(--text-secondary)' }}>
                  * Preserves total hours within 0.1h numerical tolerance (illustrative planning tools)
                </span>
              </div>
            )}
          </div>


          {activeModule && activeWorkload ? (
            <div>
              {/* Module Reconciliation Stats */}
              {(() => {
                const totalHours = activeWorkload.weeklyHours.reduce((s, h) => s + h, 0);
                const notional = activeModule.credits * 10;
                const independent = notional - totalHours;

                return (
                  <div style={{ display: 'flex', gap: '1.5rem', background: '#F9FAFB', padding: '0.75rem 1rem', borderRadius: '6px', border: '1px solid var(--border-color)', marginBottom: '1.25rem', fontSize: '0.8125rem' }}>
                    <div>
                      <span style={{ color: 'var(--text-secondary)' }}>Module Credits: </span>
                      <strong>{activeModule.credits}</strong> ({notional} expected notional hours)
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-secondary)' }}>Teaching-Period Scheduled: </span>
                      <strong>{totalHours}h</strong> (avg {(totalHours / 12).toFixed(1)}h/wk)
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-secondary)' }}>Non-Teaching Independent Hours: </span>
                      <strong style={{ color: independent >= 0 ? 'var(--text-main)' : '#DC2626' }}>
                        {independent}h
                      </strong>
                    </div>
                  </div>
                );
              })()}

              {/* 12-Week Inputs */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '0.75rem' }}>
                {activeWorkload.weeklyHours.map((hours, idx) => (
                  <div
                    key={idx}
                    style={{
                      padding: '0.75rem',
                      background: '#FFFFFF',
                      border: '1px solid var(--border-color)',
                      borderRadius: '6px'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem', fontSize: '0.75rem', fontWeight: 600 }}>
                      <span>Week {idx + 1}</span>
                      <span style={{ color: hours > 20 ? '#DC2626' : 'var(--text-secondary)' }}>
                        {hours}h
                      </span>
                    </div>
                    <input
                      type="number"
                      min={0}
                      max={60}
                      step={1}
                      value={hours}
                      aria-label={`Week ${idx + 1} study hours for ${activeModule.code}`}
                      onChange={(e) => handleWeeklyHourChange(idx, parseInt(e.target.value, 10))}
                      style={{
                        width: '100%',
                        padding: '0.35rem 0.5rem',
                        borderRadius: '4px',
                        border: '1px solid var(--border-color)',
                        fontSize: '0.875rem',
                        fontWeight: 600
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p style={{ color: 'var(--text-secondary)' }}>No module selected or active.</p>
          )}
        </div>
      )}

      {/* TAB 2: ASSESSMENTS */}
      {activeTab === 'assessments' && (
        <div role="tabpanel" id="panel-assessments" aria-labelledby="tab-assessments" tabIndex={0} style={{ outline: 'none' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>Assessment Deadlines & Weighting</h3>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <select
                aria-label="Filter assessments by module"
                value={selectedModuleId}
                onChange={(e) => setSelectedModuleId(e.target.value)}
                style={{ padding: '0.35rem 0.6rem', borderRadius: '4px', border: '1px solid var(--border-color)', fontSize: '0.8125rem' }}
              >
                {dataset.modules.map(m => (
                  <option key={m.id} value={m.id}>Filter: {m.code}</option>
                ))}
              </select>
              <button
                className="btn btn-primary"
                onClick={() => handleAddAssessment(selectedModuleId)}
                style={{ fontSize: '0.8125rem' }}
              >
                + Add Assessment
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {dataset.modules.map(module => {
              const moduleAssessments = dataset.assessments.filter(a => a.moduleId === module.id);
              const totalWeight = moduleAssessments.reduce((s, a) => s + a.weight, 0);
              const isWeightValid = totalWeight === 100;

              return (
                <div
                  key={module.id}
                  style={{
                    border: '1px solid var(--border-color)',
                    borderRadius: '6px',
                    padding: '1rem',
                    background: '#FFFFFF'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', borderBottom: '1px solid #F3F4F6', paddingBottom: '0.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <strong style={{ fontSize: '0.9375rem' }}>{module.code}</strong>
                      <span style={{ color: 'var(--text-secondary)', fontSize: '0.8125rem' }}>{module.title}</span>
                    </div>
                    <div style={{ fontSize: '0.8125rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span>Total Module Weight: <strong>{totalWeight}%</strong></span>
                      {isWeightValid ? (
                        <span style={{ color: '#15803D', fontWeight: 600 }}>✓ Reconciled</span>
                      ) : (
                        <span style={{ color: '#B45309', fontWeight: 600 }}>⚠️ Sums to {totalWeight}% (Expected 100%)</span>
                      )}
                    </div>
                  </div>

                  {moduleAssessments.length === 0 ? (
                    <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', margin: 0 }}>
                      No assessments defined for this module.
                    </p>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {moduleAssessments.map(asmt => (
                        <div
                          key={asmt.id}
                          style={{
                            display: 'grid',
                            gridTemplateColumns: '2fr 1fr 1fr 1fr auto',
                            gap: '0.75rem',
                            alignItems: 'center',
                            background: '#F9FAFB',
                            padding: '0.5rem 0.75rem',
                            borderRadius: '4px',
                            fontSize: '0.8125rem'
                          }}
                        >
                          <div>
                            <span style={{ fontWeight: 600 }}>{asmt.name}</span>
                          </div>
                          <div>
                            <label style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', display: 'block' }}>Type</label>
                            <select
                              aria-label={`Assessment type for ${asmt.name}`}
                              value={asmt.type}
                              onChange={(e) => handleUpdateAssessmentType(asmt.id, e.target.value)}
                              style={{ padding: '0.2rem 0.4rem', borderRadius: '4px', border: '1px solid var(--border-color)', width: '100%' }}
                            >
                              <option value="coursework">Coursework</option>
                              <option value="exam">Examination</option>
                              <option value="practical">Practical</option>
                              <option value="presentation">Presentation</option>
                            </select>
                          </div>
                          <div>
                            <label style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', display: 'block' }}>Deadline Week</label>
                            <select
                              aria-label={`Deadline week for ${asmt.name}`}
                              value={asmt.week}
                              onChange={(e) => handleUpdateAssessmentWeek(asmt.id, parseInt(e.target.value, 10))}
                              style={{ padding: '0.2rem 0.4rem', borderRadius: '4px', border: '1px solid var(--border-color)', width: '100%', fontWeight: 600 }}
                            >
                              {Array.from({ length: 12 }, (_, i) => i + 1).map(w => (
                                <option key={w} value={w}>Week {w}</option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', display: 'block' }}>Weight (%)</label>
                            <input
                              type="number"
                              min={0}
                              max={100}
                              value={asmt.weight}
                              aria-label={`Weight percentage for ${asmt.name}`}
                              onChange={(e) => handleUpdateAssessmentWeight(asmt.id, parseInt(e.target.value, 10))}
                              style={{ padding: '0.2rem 0.4rem', borderRadius: '4px', border: '1px solid var(--border-color)', width: '100%', fontWeight: 600 }}
                            />
                          </div>
                          <div>
                            <button
                              type="button"
                              onClick={() => handleDeleteAssessment(asmt.id)}
                              style={{ background: 'none', border: 'none', color: '#DC2626', cursor: 'pointer', fontSize: '1rem', padding: '0.25rem' }}
                              title="Delete Assessment"
                              aria-label={`Delete assessment ${asmt.name}`}
                            >
                              🗑️
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: MODULES & CREDITS */}
      {activeTab === 'modules' && (
        <div role="tabpanel" id="panel-modules" aria-labelledby="tab-modules" tabIndex={0} style={{ outline: 'none' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>Programme Modules & Credit Value</h3>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', margin: 0 }}>
                Adjusting credits modifies expected notional hours (1 credit = 10 hours). Deleting a module removes its workload and assessments.
              </p>
            </div>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => {
                setShowAddModule(!showAddModule);
                setModuleValidationError(null);
              }}
              style={{ fontSize: '0.8125rem' }}
            >
              {showAddModule ? 'Cancel' : '+ Add Module to Scenario'}
            </button>
          </div>

          {/* Inline Validation Error */}
          {moduleValidationError && (
            <div
              role="alert"
              style={{
                padding: '0.75rem 1rem',
                backgroundColor: '#FEF2F2',
                border: '1px solid #F87171',
                borderRadius: '6px',
                color: '#991B1B',
                marginBottom: '1rem',
                fontSize: '0.875rem'
              }}
            >
              ⚠️ {moduleValidationError}
            </div>
          )}

          {/* Add Module Inline Form */}
          {showAddModule && (
            <form
              onSubmit={handleCreateModule}
              style={{
                background: '#F9FAFB',
                border: '1px solid var(--border-color)',
                borderRadius: '6px',
                padding: '1.25rem',
                marginBottom: '1.5rem'
              }}
            >
              <h4 style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.75rem' }}>Add New Module</h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr 1fr auto', gap: '0.75rem', alignItems: 'flex-end' }}>
                <div>
                  <label htmlFor="inline-mod-code" style={{ fontSize: '0.75rem', display: 'block', marginBottom: '0.25rem', fontWeight: 500 }}>Module Code</label>
                  <input
                    id="inline-mod-code"
                    type="text"
                    required
                    placeholder="e.g. PH203"
                    value={newModCode}
                    onChange={(e) => setNewModCode(e.target.value)}
                    style={{ width: '100%', padding: '0.4rem', border: '1px solid var(--border-color)', borderRadius: '4px' }}
                  />
                </div>
                <div>
                  <label htmlFor="inline-mod-title" style={{ fontSize: '0.75rem', display: 'block', marginBottom: '0.25rem', fontWeight: 500 }}>Module Title</label>
                  <input
                    id="inline-mod-title"
                    type="text"
                    required
                    placeholder="e.g. Health Economics & Policy"
                    value={newModTitle}
                    onChange={(e) => setNewModTitle(e.target.value)}
                    style={{ width: '100%', padding: '0.4rem', border: '1px solid var(--border-color)', borderRadius: '4px' }}
                  />
                </div>
                <div>
                  <label htmlFor="inline-mod-credits" style={{ fontSize: '0.75rem', display: 'block', marginBottom: '0.25rem', fontWeight: 500 }}>UK Credits</label>
                  <input
                    id="inline-mod-credits"
                    type="number"
                    min={5}
                    max={120}
                    step={5}
                    value={newModCredits}
                    onChange={(e) => setNewModCredits(parseInt(e.target.value, 10))}
                    style={{ width: '100%', padding: '0.4rem', border: '1px solid var(--border-color)', borderRadius: '4px' }}
                  />
                </div>
                <div>
                  <button type="submit" className="btn btn-primary" style={{ padding: '0.4rem 1rem' }}>
                    Create Module
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* Module List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {dataset.modules.map(module => {
              const notional = module.credits * 10;
              const profile = dataset.workload.find(w => w.moduleId === module.id);
              const teachingHours = profile ? profile.weeklyHours.reduce((s, h) => s + h, 0) : 0;
              const asmtCount = dataset.assessments.filter(a => a.moduleId === module.id).length;

              return (
                <div
                  key={module.id}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '1rem',
                    border: '1px solid var(--border-color)',
                    borderRadius: '6px',
                    background: '#FFFFFF'
                  }}
                >
                  <div style={{ flex: '1' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                      <strong style={{ fontSize: '0.9375rem' }}>{module.code}</strong>
                      <span style={{ fontWeight: 500 }}>{module.title}</span>
                      <span style={{ fontSize: '0.75rem', padding: '1px 6px', background: '#F3F4F6', borderRadius: '4px' }}>
                        {module.credits} UK Credits
                      </span>
                    </div>
                    <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', display: 'flex', gap: '1.5rem' }}>
                      <span>Notional Hours: <strong>{notional}h</strong></span>
                      <span>Simulated Teaching: <strong>{teachingHours}h</strong></span>
                      <span>Assessments: <strong>{asmtCount}</strong></span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <label htmlFor={`credits-${module.id}`} style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>Credits:</label>
                      <input
                        id={`credits-${module.id}`}
                        type="number"
                        min={5}
                        max={120}
                        step={5}
                        value={module.credits}
                        aria-label={`Credit value for ${module.code}`}
                        onChange={(e) => handleUpdateCredits(module.id, parseInt(e.target.value, 10))}
                        style={{ width: '60px', padding: '0.3rem', border: '1px solid var(--border-color)', borderRadius: '4px', fontWeight: 600, textAlign: 'center' }}
                      />
                    </div>
                    <button
                      type="button"
                      className="btn btn-danger"
                      onClick={() => handleDeleteModule(module.id)}
                      style={{ fontSize: '0.8125rem', padding: '0.3rem 0.6rem' }}
                      title="Remove module and maintain referential integrity"
                      aria-label={`Delete module ${module.code} (${module.title})`}
                    >
                      Delete Module
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Delete Module Accessible Confirmation Modal */}
      <AccessibleModal
        isOpen={Boolean(moduleToDelete)}
        onClose={() => setModuleToDelete(null)}
        title="Delete Curriculum Module?"
      >
        <p style={{ fontSize: '0.875rem', color: '#4B5563', margin: '0.5rem 0 1.25rem', lineHeight: '1.5' }}>
          Are you sure you want to remove <strong>{moduleToDelete?.code} ({moduleToDelete?.title})</strong>?
          This will also remove its associated workload profile and assessments to preserve referential integrity.
        </p>
        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
          <button
            type="button"
            className="btn btn-ghost"
            onClick={() => setModuleToDelete(null)}
          >
            Cancel
          </button>
          <button
            type="button"
            className="btn"
            style={{ backgroundColor: '#DC2626', color: '#FFFFFF', borderColor: '#DC2626' }}
            onClick={confirmDeleteModule}
          >
            Delete Module &amp; Linked Data
          </button>
        </div>
      </AccessibleModal>

      {/* Reset Scenario Accessible Confirmation Modal */}
      <AccessibleModal
        isOpen={showResetConfirm}
        onClose={() => setShowResetConfirm(false)}
        title="Reset Scenario to Protected Baseline?"
      >
        <p style={{ fontSize: '0.875rem', color: '#4B5563', margin: '0.5rem 0 1.25rem', lineHeight: '1.5' }}>
          This will revert all workload hours, assessment deadlines, and module modifications in this scenario back to the current protected baseline state.
          This operation cannot be undone.
        </p>
        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
          <button
            type="button"
            className="btn btn-ghost"
            onClick={() => setShowResetConfirm(false)}
          >
            Cancel
          </button>
          <button
            type="button"
            className="btn"
            style={{ backgroundColor: '#DC2626', color: '#FFFFFF', borderColor: '#DC2626' }}
            onClick={confirmResetScenario}
          >
            Reset to Baseline
          </button>
        </div>
      </AccessibleModal>
    </div>
  );
};
