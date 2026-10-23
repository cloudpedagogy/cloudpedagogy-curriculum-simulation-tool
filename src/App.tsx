import { useState, useEffect, useMemo, useRef } from 'react';
import { storage } from './lib/storage';
import { importExport } from './lib/io/importExport';
import type { CstWorkspace, SimulationDataset, Scenario, Module, WorkloadProfile } from './types';
import { TimelineView } from './features/timeline/TimelineView';
import { WorkloadAnalyzer } from './features/workload/WorkloadAnalyzer';
import { AssessmentAnalyzer } from './features/assessments/AssessmentAnalyzer';
import { SkillProgressionView } from './features/skills/SkillProgressionView';
import { ScenarioEditor } from './features/scenarios/ScenarioEditor';
import { ValidationWarnings } from './features/governance/ValidationWarnings';
import { MethodologyPanel } from './features/governance/MethodologyPanel';
import { RiskSignalsPanel } from './features/governance/RiskSignalsPanel';
import { AISuggestionPanel } from './features/scenarios/AISuggestionPanel';
import { PersonaSelector } from './features/personas/PersonaSelector';
import { TrajectorySelector } from './features/skills/TrajectorySelector';
import { CapabilityGovernanceLayer } from './features/governance/CapabilityGovernanceLayer';
import { OnboardingView } from './features/onboarding/OnboardingView';
import { ScenarioManager } from './features/scenarios/ScenarioManager';
import { AddModuleModal } from './features/curriculum/AddModuleModal';

function App() {
  const [workspace, setWorkspace] = useState<CstWorkspace | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [corruptedRaw, setCorruptedRaw] = useState<string | null>(null);
  const [isAddModuleOpen, setIsAddModuleOpen] = useState(false);
  const [showExitDemoModal, setShowExitDemoModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-dismiss status messages
  useEffect(() => {
    if (statusMessage) {
      const timer = setTimeout(() => setStatusMessage(null), 3500);
      return () => clearTimeout(timer);
    }
  }, [statusMessage]);

  // Initial load & migration
  useEffect(() => {
    const result = storage.loadWorkspace();
    if (result.corruptedRaw) {
      setCorruptedRaw(result.corruptedRaw);
      setErrorMessage('Corrupted storage data detected. You can download the raw data before resetting.');
    } else if (result.isFutureVersion) {
      setErrorMessage(result.error || 'Unsupported schema version detected.');
    } else if (result.migratedFromLegacy) {
      setWorkspace(result.workspace);
      if (result.error) {
        setErrorMessage(result.error);
      } else {
        setStatusMessage('Migrated existing curriculum dataset to Schema 1.0.0.');
      }
    } else {
      setWorkspace(result.workspace);
    }
  }, []);

  // Save workspace with failure warning and in-memory retention
  const saveAndSetWorkspace = (newWs: CstWorkspace, successMessage?: string): boolean => {
    const saveResult = storage.saveWorkspace(newWs);
    setWorkspace(newWs);
    if (!saveResult.success) {
      setErrorMessage(saveResult.error || 'Storage write failed. In-memory workspace retained. You can export as JSON.');
      return false;
    }
    if (successMessage) {
      setStatusMessage(successMessage);
    }
    return true;
  };

  // Active dataset derivation: baseline if activeScenarioId is null, otherwise active scenario
  const activeDataset: SimulationDataset | null = useMemo(() => {
    if (!workspace) return null;
    if (workspace.activeScenarioId === null) {
      return workspace.baseline;
    }
    const scenario = workspace.scenarios.find(s => s.id === workspace.activeScenarioId);
    return scenario ? scenario.dataset : workspace.baseline;
  }, [workspace]);

  // Update working dataset
  const handleUpdateDataset = (updatedDataset: SimulationDataset) => {
    if (!workspace) return;

    if (workspace.activeScenarioId === null) {
      // User tried to edit while viewing the protected baseline.
      // Automatically branch into a new scenario so baseline is preserved.
      const { workspace: updatedWorkspace, scenario } = storage.createScenarioFromBaseline(
        workspace,
        `Scenario ${workspace.scenarios.length + 1}`,
        'Branched from protected baseline'
      );
      const finalWorkspace = storage.updateActiveDataset(
        { ...updatedWorkspace, activeScenarioId: scenario.id },
        updatedDataset
      );
      saveAndSetWorkspace(finalWorkspace, `Protected baseline preserved. Created and switched to "${scenario.name}".`);
      return;
    }

    const updatedWorkspace = storage.updateActiveDataset(workspace, updatedDataset);
    saveAndSetWorkspace(updatedWorkspace);
  };

  // Scenario operations
  const handleSelectScenario = (scenarioId: string | null) => {
    if (!workspace) return;
    const updated = { ...workspace, activeScenarioId: scenarioId };
    saveAndSetWorkspace(updated);
  };

  const handleCreateScenario = (name: string, description?: string) => {
    if (!workspace) return;
    const { workspace: updated, scenario } = storage.createScenarioFromBaseline(workspace, name, description);
    saveAndSetWorkspace(updated, `Created scenario "${scenario.name}".`);
  };

  const handleDuplicateScenario = (scenarioId: string) => {
    if (!workspace) return;
    const { workspace: updated, scenario } = storage.duplicateScenario(workspace, scenarioId);
    saveAndSetWorkspace(updated, `Duplicated as "${scenario.name}".`);
  };

  const handleRenameScenario = (scenarioId: string, name: string, description?: string) => {
    if (!workspace) return;
    const updated = storage.renameScenario(workspace, scenarioId, name, description);
    saveAndSetWorkspace(updated, 'Scenario updated.');
  };

  const handleDeleteScenario = (scenarioId: string) => {
    if (!workspace) return;
    const updated = storage.deleteScenario(workspace, scenarioId);
    saveAndSetWorkspace(updated, 'Scenario deleted.');
  };

  const handleResetScenario = (scenarioId: string) => {
    if (!workspace) return;
    const updated = storage.resetScenarioToBaseline(workspace, scenarioId);
    saveAndSetWorkspace(updated, 'Scenario reset to original baseline state.');
  };

  const handleReplaceBaseline = () => {
    if (!workspace || !activeDataset) return;
    const updated = storage.replaceBaseline(workspace, activeDataset);
    saveAndSetWorkspace(updated, 'Baseline curriculum updated with active scenario.');
  };

  // Blank-first & Demo Actions
  const handleCreateEmpty = () => {
    const newWs = storage.createEmptyWorkspace();
    saveAndSetWorkspace(newWs, 'Blank curriculum workspace created. Ready to add modules.');
  };

  const handleLoadDemo = () => {
    const demoWs = storage.createDemoWorkspace();
    saveAndSetWorkspace(demoWs, 'Calibrated MPH demonstration curriculum loaded.');
  };

  const handleClearEnvironment = () => {
    storage.clearWorkspace();
    setWorkspace(null);
    setCorruptedRaw(null);
    setErrorMessage(null);
    setStatusMessage('Simulation environment reset.');
  };

  // Basic Module Authoring
  const handleAddModule = (newModule: Module, newWorkload: WorkloadProfile) => {
    if (!workspace || !activeDataset) return;
    const updatedDataset: SimulationDataset = {
      ...activeDataset,
      modules: [...activeDataset.modules, newModule],
      workload: [...activeDataset.workload, newWorkload]
    };
    handleUpdateDataset(updatedDataset);
    setStatusMessage(`Added module ${newModule.code} (${newModule.credits} credits).`);
  };

  // Import / Export
  const handleExportWorkspace = () => {
    if (!workspace) return;
    importExport.exportWorkspaceAsJson(workspace);
    setStatusMessage('Workspace JSON exported successfully.');
  };

  const handleExportScenario = (scenario: Scenario) => {
    importExport.exportScenarioAsJson(scenario);
    setStatusMessage(`Scenario "${scenario.name}" exported as JSON.`);
  };

  const handleExportBaseline = () => {
    if (!workspace) return;
    const baselineAsScenario: Scenario = {
      id: 'baseline-export',
      name: `${workspace.baseline.name} (Baseline)`,
      description: workspace.baseline.description || 'Curriculum Baseline',
      dataset: workspace.baseline,
      createdAt: workspace.createdAt,
      updatedAt: workspace.updatedAt
    };
    importExport.exportScenarioAsJson(baselineAsScenario);
    setStatusMessage('Baseline dataset exported as JSON.');
  };

  const handleExportCorrupted = () => {
    if (corruptedRaw) {
      importExport.exportCorruptedStorage(corruptedRaw);
      setStatusMessage('Corrupted storage data downloaded.');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = event => {
      const content = event.target?.result as string;
      const result = importExport.parseAndValidateImport(content);

      if (!result.success) {
        setErrorMessage(`Import Failed: ${result.error}${result.issues ? ` (${result.issues.slice(0, 3).join(', ')})` : ''}`);
        return;
      }

      if (result.type === 'full-workspace') {
        saveAndSetWorkspace(result.workspace, 'Complete workspace imported successfully.');
      } else if (result.type === 'single-scenario') {
        const { workspace: updatedWs, scenario, wasDuplicateId } = storage.importScenarioIntoWorkspace(
          workspace,
          result.scenario
        );
        const msg = wasDuplicateId
          ? `Scenario imported as "${scenario.name}" (ID collision avoided).`
          : `Scenario "${scenario.name}" imported successfully.`;
        saveAndSetWorkspace(updatedWs, msg);
      } else if (result.type === 'legacy-dataset') {
        const newWs: CstWorkspace = {
          schemaVersion: '1.0.0',
          baseline: result.dataset,
          scenarios: [],
          activeScenarioId: null,
          isDemo: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        saveAndSetWorkspace(newWs, 'Curriculum dataset imported as new baseline.');
      }
    };
    reader.readAsText(file);
    // Reset input
    e.target.value = '';
  };

  const handleUpdatePersona = (id: string) => {
    if (activeDataset) {
      handleUpdateDataset({
        ...activeDataset,
        settings: {
          ...activeDataset.settings,
          activePersonaId: id
        }
      });
    }
  };

  const handleUpdateTrajectory = (mode: 'linear' | 'accelerated' | 'plateau') => {
    if (activeDataset) {
      handleUpdateDataset({
        ...activeDataset,
        settings: {
          ...activeDataset.settings,
          trajectoryMode: mode
        }
      });
    }
  };

  // Metrics for overview cards
  const modulesCount = activeDataset?.modules.length || 0;
  const assessmentCount = activeDataset?.assessments.length || 0;

  const metrics = useMemo(() => {
    if (!activeDataset) return { maxWorkload: 0, maxWeek: 0, heavyWeeks: 0 };

    let maxWorkload = 0;
    let maxWeek = 0;
    let heavyWeeks = 0;

    for (let i = 0; i < 12; i++) {
      const weeklyWorkload = activeDataset.workload.reduce((sum, p) => sum + (p.weeklyHours[i] || 0), 0);
      const weeklyAsmts = activeDataset.assessments.filter(a => a.week === i + 1).length;

      if (weeklyWorkload > maxWorkload) {
        maxWorkload = weeklyWorkload;
        maxWeek = i + 1;
      }

      if (weeklyAsmts > 1) {
        heavyWeeks++;
      }
    }

    return { maxWorkload, maxWeek, heavyWeeks };
  }, [activeDataset]);

  return (
    <div className="container">
      {/* Hidden file input for import */}
      <input
        type="file"
        ref={fileInputRef}
        style={{ display: 'none' }}
        accept=".json"
        onChange={handleFileChange}
      />

      <nav style={{ padding: '1rem 0', marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <a
          href="https://www.cloudpedagogy.com/"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            fontSize: '0.75rem',
            textDecoration: 'none',
            color: '#666666',
            fontWeight: 500,
            letterSpacing: '0.05em',
            textTransform: 'uppercase'
          }}
        >
          CloudPedagogy
        </a>

        {workspace?.isDemo && (
          <span style={{
            fontSize: '0.75rem',
            backgroundColor: '#EFF6FF',
            color: '#1E40AF',
            padding: '0.2rem 0.5rem',
            borderRadius: '4px',
            border: '1px solid #BFDBFE',
            fontWeight: 600
          }}>
            Sample Demo Mode
          </span>
        )}
      </nav>

      <header>
        <div className="header-top">
          <div>
            <div style={{ fontSize: '0.75rem', color: '#666666', marginBottom: '0.25rem', textTransform: 'uppercase', fontWeight: 600 }}>
              Curriculum Simulation Tool
            </div>
            <h1>Academic Programme Modelling</h1>
          </div>
          <div className="controls">
            {workspace ? (
              <>
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => fileInputRef.current?.click()}
                  title="Import compatible workspace or scenario JSON"
                >
                  Import JSON
                </button>
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={handleExportWorkspace}
                  title="Export full workspace with all scenarios as JSON"
                >
                  Export Workspace
                </button>
                {workspace.isDemo && (
                  <button
                    type="button"
                    className="btn btn-ghost"
                    onClick={() => setShowExitDemoModal(true)}
                    title="Exit sample demo mode and start with your own curriculum"
                  >
                    Exit Demo
                  </button>
                )}
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => setShowResetModal(true)}
                  title="Reset storage and clear active curriculum"
                >
                  Reset Workspace
                </button>
              </>
            ) : (
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => fileInputRef.current?.click()}
              >
                Import JSON
              </button>
            )}
          </div>
        </div>

        {/* Status Toast */}
        {statusMessage && (
          <div className="status-toast" style={{ marginBottom: '1.5rem' }}>
            <span className="status-icon">✓</span> {statusMessage}
          </div>
        )}

        {/* Error / Corrupted Storage Alert */}
        {errorMessage && (
          <div style={{
            padding: '1rem',
            backgroundColor: '#FEF2F2',
            border: '1px solid #F87171',
            borderRadius: '6px',
            color: '#991B1B',
            marginBottom: '1.5rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '0.875rem'
          }}>
            <span>⚠️ {errorMessage}</span>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {corruptedRaw && (
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={handleExportCorrupted}
                  style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}
                >
                  Download Corrupted Backup
                </button>
              )}
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => setErrorMessage(null)}
                style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}
              >
                Dismiss
              </button>
            </div>
          </div>
        )}

        <p className="description">
          A high-fidelity environment for the simulation of curriculum coherence, workload distribution, and professional capability development.
        </p>
        <div className="disclaimer">
          <strong>Institutional Governance:</strong> This system is designed to support governance frameworks and academic quality assurance. It provides analytical support for curriculum design decisions but does not replace professional academic judgement.
        </div>
      </header>

      {/* Main Content Area */}
      {!workspace ? (
        <OnboardingView
          onCreateEmpty={handleCreateEmpty}
          onLoadDemo={handleLoadDemo}
          onImportClick={() => fileInputRef.current?.click()}
        />
      ) : activeDataset ? (
        <>
          {/* Multi-Scenario Manager & Baseline Protection */}
          <ScenarioManager
            workspace={workspace}
            onSelectScenario={handleSelectScenario}
            onCreateScenario={handleCreateScenario}
            onDuplicateScenario={handleDuplicateScenario}
            onRenameScenario={handleRenameScenario}
            onDeleteScenario={handleDeleteScenario}
            onResetScenario={handleResetScenario}
            onReplaceBaseline={handleReplaceBaseline}
            onOpenAddModule={() => setIsAddModuleOpen(true)}
            onExportScenario={handleExportScenario}
            onExportBaseline={handleExportBaseline}
          />

          {/* Validation Warnings */}
          <ValidationWarnings dataset={activeDataset} />

          {/* Empty Curriculum Authoring Prompt */}
          {activeDataset.modules.length === 0 && (
            <div style={{
              padding: '2.5rem',
              backgroundColor: '#F9FAFB',
              border: '2px dashed #D1D5DB',
              borderRadius: '8px',
              textAlign: 'center',
              marginBottom: '3rem'
            }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#111827', marginBottom: '0.5rem' }}>
                Your curriculum currently has no modules
              </h3>
              <p style={{ fontSize: '0.875rem', color: '#6B7280', marginBottom: '1.5rem', maxWidth: '480px', margin: '0 auto 1.5rem auto' }}>
                Begin by adding academic modules with credit allocations and weekly study hours to simulate workload and assessment curves.
              </p>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => setIsAddModuleOpen(true)}
                style={{ padding: '0.625rem 1.25rem' }}
              >
                + Add First Module
              </button>
            </div>
          )}

          {activeDataset.modules.length > 0 && (
            <>
              {/* Summary Dashboard Cards */}
              <main className="dashboard-grid">
                <div className="card">
                  <h2>Curriculum Coherence</h2>
                  <div className="card-stat">{modulesCount}</div>
                  <div className="card-label">Active academic modules</div>
                </div>

                <div className="card">
                  <h2>Assessment Pattern</h2>
                  <div className="card-stat">{assessmentCount}</div>
                  <div className="card-label">Evaluation components</div>
                </div>

                <div className="card">
                  <h2>Workload Distribution</h2>
                  <div className="card-stat">{metrics.maxWorkload}h</div>
                  <div className="card-label">Week {metrics.maxWeek} (Peak Intensity)</div>
                </div>

                <div className="card">
                  <h2>Risk Signals</h2>
                  <div className="card-stat">{metrics.heavyWeeks}</div>
                  <div className="card-label">Weeks with assessment clustering</div>
                </div>
              </main>

              {/* Persona and Trajectory Settings */}
              <div className="simulation-settings-row" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
                <PersonaSelector
                  activePersonaId={activeDataset.settings.activePersonaId || 'ft'}
                  onSelectPersona={handleUpdatePersona}
                />
                <TrajectorySelector
                  activeMode={activeDataset.settings.trajectoryMode || 'linear'}
                  onSelectMode={handleUpdateTrajectory}
                />
              </div>

              {/* Scenario Testing Controls */}
              <section className="simulation-controls-section" style={{ marginTop: '2rem', borderTop: '1px solid #E5E7EB', paddingTop: '2.5rem' }}>
                <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', fontWeight: 600 }}>Scenario Testing & Modelling</h2>
                <ScenarioEditor
                  dataset={activeDataset}
                  onUpdate={handleUpdateDataset}
                  onReset={() => {
                    if (workspace.activeScenarioId) {
                      handleResetScenario(workspace.activeScenarioId);
                    }
                  }}
                />
              </section>

              {/* Analytical Views */}
              <section className="analytical-views-section">
                <AISuggestionPanel
                  dataset={activeDataset}
                  onApplySuggestion={handleUpdateDataset}
                />

                <div className="view-container" style={{ marginTop: '4rem', borderTop: '1px solid #E5E7EB', paddingTop: '3rem' }}>
                  <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', fontWeight: 600 }}>Structural Risk Signals</h2>
                  <RiskSignalsPanel dataset={activeDataset} />
                </div>

                <div className="view-container" style={{ marginTop: '4rem', borderTop: '1px solid #E5E7EB', paddingTop: '3rem' }}>
                  <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', fontWeight: 600 }}>Progression Modelling: Curriculum Timeline</h2>
                  <TimelineView dataset={activeDataset} />
                </div>

                <div className="view-container" style={{ marginTop: '4rem', borderTop: '1px solid #E5E7EB', paddingTop: '3rem' }}>
                  <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', fontWeight: 600 }}>Workload Distribution Analysis</h2>
                  <WorkloadAnalyzer dataset={activeDataset} />
                </div>

                <div className="view-container" style={{ marginTop: '4rem', borderTop: '1px solid #E5E7EB', paddingTop: '3rem' }}>
                  <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', fontWeight: 600 }}>Assessment Pattern Analysis</h2>
                  <AssessmentAnalyzer dataset={activeDataset} />
                </div>

                <div className="view-container" style={{ marginTop: '4rem', borderTop: '1px solid #E5E7EB', paddingTop: '3rem' }}>
                  <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', fontWeight: 600 }}>Capability Development: Skill Progression Mapping</h2>
                  <SkillProgressionView dataset={activeDataset} />
                </div>

                <div style={{ marginTop: '4rem', borderTop: '1px solid #E5E7EB', paddingTop: '3rem' }}>
                  <MethodologyPanel />
                </div>

                <div style={{ marginTop: '4rem', borderTop: '1px solid #E5E7EB', paddingTop: '3rem' }}>
                  <CapabilityGovernanceLayer dataset={activeDataset} onUpdate={handleUpdateDataset} />
                </div>
              </section>
            </>
          )}
        </>
      ) : null}

      {/* Exit Demo Confirmation Modal */}
      {showExitDemoModal && (
        <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="exit-demo-title">
          <div className="modal-content" style={{ maxWidth: '480px' }}>
            <h2 id="exit-demo-title">Exit Demonstration Mode?</h2>
            <p style={{ fontSize: '0.875rem', color: '#4B5563', margin: '0.75rem 0 1.25rem', lineHeight: '1.5' }}>
              Exiting demonstration mode will discard all sample scenarios and any authored module changes.
              To retain your changes, export your workspace as JSON before exiting.
            </p>
            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
              <button
                type="button"
                className="btn btn-ghost"
                onClick={handleExportWorkspace}
              >
                Export Workspace
              </button>
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => setShowExitDemoModal(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn"
                style={{ backgroundColor: '#DC2626', color: '#FFFFFF', borderColor: '#DC2626' }}
                onClick={() => {
                  setShowExitDemoModal(false);
                  handleClearEnvironment();
                }}
              >
                Discard & Exit Demo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reset Workspace Confirmation Modal */}
      {showResetModal && (
        <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="reset-ws-title">
          <div className="modal-content" style={{ maxWidth: '480px' }}>
            <h2 id="reset-ws-title">Reset Curriculum Workspace?</h2>
            <p style={{ fontSize: '0.875rem', color: '#4B5563', margin: '0.75rem 0 1.25rem', lineHeight: '1.5' }}>
              This will clear all curriculum data, baseline configurations, and alternative scenarios from local storage.
              This operation cannot be undone. To retain your data, export your workspace as JSON first.
            </p>
            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
              <button
                type="button"
                className="btn btn-ghost"
                onClick={handleExportWorkspace}
              >
                Export Workspace
              </button>
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => setShowResetModal(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn"
                style={{ backgroundColor: '#DC2626', color: '#FFFFFF', borderColor: '#DC2626' }}
                onClick={() => {
                  setShowResetModal(false);
                  handleClearEnvironment();
                }}
              >
                Reset Workspace
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Module Authoring Modal */}
      <AddModuleModal
        isOpen={isAddModuleOpen}
        onClose={() => setIsAddModuleOpen(false)}
        onAddModule={handleAddModule}
      />

      <footer style={{
        marginTop: '6rem',
        padding: '3rem 0',
        borderTop: '1px solid #E5E7EB',
        textAlign: 'center',
        color: '#666666',
        fontSize: '0.8125rem'
      }}>
        CloudPedagogy · Governance-ready AI and curriculum systems
      </footer>
    </div>
  );
}

export default App;
