import React, { useState } from 'react';
import type { CstWorkspace, Scenario } from '../../types';
import { AccessibleModal } from '../../components/common/AccessibleModal';

interface ScenarioManagerProps {
  workspace: CstWorkspace;
  onSelectScenario: (scenarioId: string | null) => void;
  onCreateScenario: (name: string, description?: string) => void;
  onDuplicateScenario: (scenarioId: string) => void;
  onRenameScenario: (scenarioId: string, name: string, description?: string) => void;
  onDeleteScenario: (scenarioId: string) => void;
  onResetScenario: (scenarioId: string) => void;
  onReplaceBaseline: () => void;
  onOpenAddModule: () => void;
  onExportScenario: (scenario: Scenario) => void;
  onExportBaseline: () => void;
}

export const ScenarioManager: React.FC<ScenarioManagerProps> = ({
  workspace,
  onSelectScenario,
  onCreateScenario,
  onDuplicateScenario,
  onRenameScenario,
  onDeleteScenario,
  onResetScenario,
  onReplaceBaseline,
  onOpenAddModule,
  onExportScenario,
  onExportBaseline
}) => {
  const [isCreating, setIsCreating] = useState(false);
  const [newScenarioName, setNewScenarioName] = useState('');
  const [newScenarioDesc, setNewScenarioDesc] = useState('');

  const [isRenaming, setIsRenaming] = useState(false);
  const [renameText, setRenameText] = useState('');
  const [renameDesc, setRenameDesc] = useState('');

  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [confirmReplaceBaseline, setConfirmReplaceBaseline] = useState(false);

  const activeScenario = workspace.scenarios.find(s => s.id === workspace.activeScenarioId);
  const isBaselineActive = workspace.activeScenarioId === null;

  const handleStartCreate = () => {
    setNewScenarioName(`Scenario ${workspace.scenarios.length + 1}`);
    setNewScenarioDesc('');
    setIsCreating(true);
  };

  const handleConfirmCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newScenarioName.trim()) return;
    onCreateScenario(newScenarioName.trim(), newScenarioDesc.trim());
    setIsCreating(false);
  };

  const handleStartRename = () => {
    if (!activeScenario) return;
    setRenameText(activeScenario.name);
    setRenameDesc(activeScenario.description);
    setIsRenaming(true);
  };

  const handleConfirmRename = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeScenario || !renameText.trim()) return;
    onRenameScenario(activeScenario.id, renameText.trim(), renameDesc.trim());
    setIsRenaming(false);
  };

  return (
    <div className="scenario-manager-card" style={{
      backgroundColor: '#FFFFFF',
      border: '1px solid #E5E7EB',
      borderRadius: '8px',
      padding: '1.25rem',
      marginBottom: '2rem',
      boxShadow: '0 1px 2px rgba(0,0,0,0.03)'
    }}>
      {/* Top row: Scenario Views & Status */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
        <nav aria-label="Curriculum scenario views" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', marginRight: '0.5rem' }}>
            Active View:
          </span>

          {/* Baseline Switch Button */}
          <button
            type="button"
            aria-pressed={isBaselineActive}
            onClick={() => onSelectScenario(null)}
            className="btn"
            style={{
              padding: '0.375rem 0.75rem',
              fontSize: '0.8125rem',
              fontWeight: 600,
              borderRadius: '6px',
              backgroundColor: isBaselineActive ? '#111827' : '#F3F4F6',
              color: isBaselineActive ? '#FFFFFF' : '#374151',
              border: isBaselineActive ? '1px solid #111827' : '1px solid #E5E7EB'
            }}
          >
            📋 Protected Baseline
          </button>

          {/* Scenario Switch Buttons */}
          {workspace.scenarios.map(s => {
            const isActive = s.id === workspace.activeScenarioId;
            return (
              <button
                key={s.id}
                type="button"
                aria-pressed={isActive}
                onClick={() => onSelectScenario(s.id)}
                className="btn"
                style={{
                  padding: '0.375rem 0.75rem',
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  borderRadius: '6px',
                  backgroundColor: isActive ? '#2563EB' : '#F3F4F6',
                  color: isActive ? '#FFFFFF' : '#374151',
                  border: isActive ? '1px solid #1D4ED8' : '1px solid #E5E7EB'
                }}
              >
                ⚡ {s.name}
              </button>
            );
          })}

          <button
            type="button"
            onClick={handleStartCreate}
            className="btn btn-ghost"
            aria-label="Create new scenario branched from baseline"
            style={{
              padding: '0.375rem 0.625rem',
              fontSize: '0.8125rem',
              fontWeight: 600,
              color: '#2563EB',
              border: '1px dashed #93C5FD'
            }}
          >
            + New Scenario
          </button>
        </nav>


        {/* Mode Badge & Action Bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {isBaselineActive ? (
            <span style={{
              fontSize: '0.75rem',
              fontWeight: 700,
              padding: '0.25rem 0.625rem',
              borderRadius: '9999px',
              backgroundColor: '#ECFDF5',
              color: '#065F46',
              border: '1px solid #A7F3D0'
            }}>
              🔒 Protected Baseline (Immutable)
            </span>
          ) : (
            <span style={{
              fontSize: '0.75rem',
              fontWeight: 700,
              padding: '0.25rem 0.625rem',
              borderRadius: '9999px',
              backgroundColor: '#FEF3C7',
              color: '#92400E',
              border: '1px solid #FDE68A'
            }}>
              ✏️ Alternative Scenario (Editable)
            </span>
          )}
        </div>
      </div>

      {/* Description & Context Row */}
      <div style={{
        padding: '0.75rem 1rem',
        backgroundColor: isBaselineActive ? '#F9FAFB' : '#FFFDF5',
        border: '1px solid #E5E7EB',
        borderRadius: '6px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '0.75rem'
      }}>
        <div>
          <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#111827' }}>
            {isBaselineActive ? workspace.baseline.name : activeScenario?.name}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#6B7280' }}>
            {isBaselineActive
              ? (workspace.baseline.description || 'Reference baseline curriculum. Create a scenario to model proposed changes.')
              : (activeScenario?.description || 'Alternative curriculum scenario. Testing changes against baseline.')}
          </div>
        </div>

        {/* Action Controls for Active Mode */}
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {isBaselineActive ? (
            <>
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleStartCreate}
                style={{ fontSize: '0.75rem', padding: '0.35rem 0.75rem' }}
              >
                + Create Scenario to Edit
              </button>
              <button
                type="button"
                className="btn btn-ghost"
                onClick={onOpenAddModule}
                style={{ fontSize: '0.75rem', padding: '0.35rem 0.75rem' }}
              >
                + Add Module
              </button>
              <button
                type="button"
                className="btn btn-ghost"
                onClick={onExportBaseline}
                style={{ fontSize: '0.75rem', padding: '0.35rem 0.75rem' }}
              >
                Export Baseline JSON
              </button>
            </>
          ) : (
            activeScenario && (
              <>
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={handleStartRename}
                  style={{ fontSize: '0.75rem', padding: '0.35rem 0.625rem' }}
                >
                  Rename
                </button>
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => onDuplicateScenario(activeScenario.id)}
                  style={{ fontSize: '0.75rem', padding: '0.35rem 0.625rem' }}
                >
                  Duplicate
                </button>
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => onResetScenario(activeScenario.id)}
                  style={{ fontSize: '0.75rem', padding: '0.35rem 0.625rem' }}
                >
                  Reset to Baseline
                </button>
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => onExportScenario(activeScenario)}
                  style={{ fontSize: '0.75rem', padding: '0.35rem 0.625rem' }}
                >
                  Export Scenario
                </button>
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => setConfirmReplaceBaseline(true)}
                  style={{ fontSize: '0.75rem', padding: '0.35rem 0.625rem', color: '#B45309' }}
                  title="Make this scenario the new protected baseline"
                >
                  Set as Baseline
                </button>
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => setConfirmDeleteId(activeScenario.id)}
                  style={{ fontSize: '0.75rem', padding: '0.35rem 0.625rem', color: '#DC2626' }}
                >
                  Delete
                </button>
              </>
            )
          )}
        </div>
      </div>

      {/* Modal: Create Scenario */}
      <AccessibleModal
        isOpen={isCreating}
        onClose={() => setIsCreating(false)}
        title="Create Alternative Scenario"
        titleId="create-scenario-title"
        maxWidth="440px"
      >
        <p style={{ fontSize: '0.8125rem', color: '#6B7280', marginBottom: '1rem' }}>
          Create an editable scenario branched from the protected baseline.
        </p>
        <form onSubmit={handleConfirmCreate}>
          <div style={{ marginBottom: '0.75rem' }}>
            <label htmlFor="create-scenario-name" style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.25rem' }}>
              Scenario Name
            </label>
            <input
              id="create-scenario-name"
              type="text"
              value={newScenarioName}
              onChange={e => setNewScenarioName(e.target.value)}
              required
              style={{ width: '100%', padding: '0.5rem', border: '1px solid #D1D5DB', borderRadius: '4px' }}
            />
          </div>
          <div style={{ marginBottom: '1.25rem' }}>
            <label htmlFor="create-scenario-desc" style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.25rem' }}>
              Description (Optional)
            </label>
            <input
              id="create-scenario-desc"
              type="text"
              value={newScenarioDesc}
              onChange={e => setNewScenarioDesc(e.target.value)}
              placeholder="e.g. Staggering Week 11 presentations to Week 9"
              style={{ width: '100%', padding: '0.5rem', border: '1px solid #D1D5DB', borderRadius: '4px' }}
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
            <button type="button" className="btn btn-ghost" onClick={() => setIsCreating(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary">Create Scenario</button>
          </div>
        </form>
      </AccessibleModal>

      {/* Modal: Rename Scenario */}
      <AccessibleModal
        isOpen={isRenaming}
        onClose={() => setIsRenaming(false)}
        title="Rename Scenario"
        titleId="rename-scenario-title"
        maxWidth="440px"
      >
        <form onSubmit={handleConfirmRename}>
          <div style={{ marginBottom: '0.75rem' }}>
            <label htmlFor="rename-scenario-name" style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.25rem' }}>
              Scenario Name
            </label>
            <input
              id="rename-scenario-name"
              type="text"
              value={renameText}
              onChange={e => setRenameText(e.target.value)}
              required
              style={{ width: '100%', padding: '0.5rem', border: '1px solid #D1D5DB', borderRadius: '4px' }}
            />
          </div>
          <div style={{ marginBottom: '1.25rem' }}>
            <label htmlFor="rename-scenario-desc" style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.25rem' }}>
              Description
            </label>
            <input
              id="rename-scenario-desc"
              type="text"
              value={renameDesc}
              onChange={e => setRenameDesc(e.target.value)}
              style={{ width: '100%', padding: '0.5rem', border: '1px solid #D1D5DB', borderRadius: '4px' }}
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
            <button type="button" className="btn btn-ghost" onClick={() => setIsRenaming(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary">Save</button>
          </div>
        </form>
      </AccessibleModal>

      {/* Modal: Confirm Delete */}
      <AccessibleModal
        isOpen={Boolean(confirmDeleteId)}
        onClose={() => setConfirmDeleteId(null)}
        title="Delete Scenario"
        titleId="delete-scenario-title"
        maxWidth="400px"
      >
        <p style={{ fontSize: '0.875rem', color: '#4B5563', marginBottom: '1.25rem' }}>
          Are you sure you want to delete this scenario? This action cannot be undone.
        </p>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
          <button type="button" className="btn btn-ghost" onClick={() => setConfirmDeleteId(null)}>Cancel</button>
          <button
            type="button"
            className="btn"
            style={{ backgroundColor: '#DC2626', color: '#FFFFFF', borderColor: '#DC2626' }}
            onClick={() => {
              if (confirmDeleteId) onDeleteScenario(confirmDeleteId);
              setConfirmDeleteId(null);
            }}
          >
            Delete
          </button>
        </div>
      </AccessibleModal>

      {/* Modal: Confirm Replace Baseline */}
      {activeScenario && (
        <AccessibleModal
          isOpen={confirmReplaceBaseline}
          onClose={() => setConfirmReplaceBaseline(false)}
          title="Replace Protected Baseline?"
          titleId="replace-baseline-title"
          maxWidth="460px"
        >
          <p style={{ fontSize: '0.875rem', color: '#4B5563', marginBottom: '1rem', lineHeight: 1.4 }}>
            This will overwrite the protected baseline curriculum with <strong>"{activeScenario.name}"</strong>.
            All future scenarios branched from baseline will use these modified parameters.
          </p>
          <div style={{ padding: '0.75rem', backgroundColor: '#FEF3C7', borderRadius: '6px', fontSize: '0.8125rem', color: '#92400E', marginBottom: '1.25rem' }}>
            <strong>Recommended:</strong> Export a JSON backup of your current workspace before replacing the baseline.
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', flexWrap: 'wrap' }}>
            <button type="button" className="btn btn-ghost" onClick={() => setConfirmReplaceBaseline(false)}>Cancel</button>
            <button
              type="button"
              className="btn btn-ghost"
              onClick={onExportBaseline}
            >
              Export Backup First
            </button>
            <button
              type="button"
              className="btn"
              style={{ backgroundColor: '#B45309', color: '#FFFFFF', borderColor: '#B45309' }}
              onClick={() => {
                onReplaceBaseline();
                setConfirmReplaceBaseline(false);
              }}
            >
              Confirm Replace
            </button>
          </div>
        </AccessibleModal>
      )}

    </div>
  );
};
