import React, { useState } from 'react';
import type { Module, WorkloadProfile } from '../../types';
import { AccessibleModal } from '../../components/common/AccessibleModal';

interface AddModuleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddModule: (module: Module, workload: WorkloadProfile) => void;
}

export const AddModuleModal: React.FC<AddModuleModalProps> = ({
  isOpen,
  onClose,
  onAddModule
}) => {
  const [code, setCode] = useState('');
  const [title, setTitle] = useState('');
  const [credits, setCredits] = useState(15);
  const [weeklyHoursAverage, setWeeklyHoursAverage] = useState(10);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || !title.trim()) {
      setError('Module code and title are required.');
      return;
    }

    const moduleId = `mod-${code.trim().toLowerCase().replace(/[^a-z0-9]/g, '-')}-${Date.now()}`;
    const newModule: Module = {
      id: moduleId,
      code: code.trim().toUpperCase(),
      title: title.trim(),
      credits: Number(credits) || 15,
      learningOutcomes: [],
      skillsGained: []
    };

    // Generate 12-week workload profile with average hours
    const avg = Number(weeklyHoursAverage) || 10;
    const weeklyHours = Array.from({ length: 12 }, () => avg);

    const newWorkload: WorkloadProfile = {
      moduleId,
      weeklyHours
    };

    onAddModule(newModule, newWorkload);
    setCode('');
    setTitle('');
    setCredits(15);
    setWeeklyHoursAverage(10);
    setError(null);
    onClose();
  };

  return (
    <AccessibleModal
      isOpen={isOpen}
      onClose={onClose}
      title="Add Academic Module"
      titleId="add-module-modal-title"
      maxWidth="500px"
    >
      <p style={{ fontSize: '0.875rem', color: '#4B5563', marginBottom: '1.25rem' }}>
        Define module identity, credit rating, and default weekly study hours across the 12-week block.
      </p>

      {error && (
        <div
          role="alert"
          style={{
            padding: '0.75rem',
            backgroundColor: '#FEE2E2',
            color: '#991B1B',
            borderRadius: '4px',
            fontSize: '0.8125rem',
            marginBottom: '1rem'
          }}
        >
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div>
          <label htmlFor="new-module-code" style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.25rem', color: '#374151' }}>
            Module Code (e.g. PH101)
          </label>
          <input
            id="new-module-code"
            type="text"
            value={code}
            onChange={e => setCode(e.target.value)}
            placeholder="PH101"
            required
            style={{
              width: '100%',
              padding: '0.5rem',
              border: '1px solid #D1D5DB',
              borderRadius: '4px',
              fontSize: '0.875rem'
            }}
          />
        </div>

        <div>
          <label htmlFor="new-module-title" style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.25rem', color: '#374151' }}>
            Module Title
          </label>
          <input
            id="new-module-title"
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Foundations of Public Health"
            required
            style={{
              width: '100%',
              padding: '0.5rem',
              border: '1px solid #D1D5DB',
              borderRadius: '4px',
              fontSize: '0.875rem'
            }}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div>
            <label htmlFor="new-module-credits" style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.25rem', color: '#374151' }}>
              Credits (UK)
            </label>
            <input
              id="new-module-credits"
              type="number"
              min="1"
              max="120"
              value={credits}
              onChange={e => setCredits(Number(e.target.value))}
              aria-describedby="credits-hint"
              style={{
                width: '100%',
                padding: '0.5rem',
                border: '1px solid #D1D5DB',
                borderRadius: '4px',
                fontSize: '0.875rem'
              }}
            />
            <span id="credits-hint" style={{ fontSize: '0.75rem', color: '#6B7280' }}>1 credit = 10 notional hours</span>
          </div>

          <div>
            <label htmlFor="new-module-avg-hours" style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.25rem', color: '#374151' }}>
              Avg Hours/Week
            </label>
            <input
              id="new-module-avg-hours"
              type="number"
              min="1"
              max="40"
              value={weeklyHoursAverage}
              onChange={e => setWeeklyHoursAverage(Number(e.target.value))}
              aria-describedby="hours-hint"
              style={{
                width: '100%',
                padding: '0.5rem',
                border: '1px solid #D1D5DB',
                borderRadius: '4px',
                fontSize: '0.875rem'
              }}
            />
            <span id="hours-hint" style={{ fontSize: '0.75rem', color: '#6B7280' }}>Across 12-week block</span>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.25rem' }}>
          <button
            type="button"
            className="btn btn-ghost"
            onClick={onClose}
            style={{ padding: '0.5rem 1rem' }}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            style={{ padding: '0.5rem 1.25rem' }}
          >
            Add Module
          </button>
        </div>
      </form>
    </AccessibleModal>
  );
};
