import React, { useState } from 'react';
import type { Module, WorkloadProfile } from '../../types';

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
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        backgroundColor: '#FFFFFF',
        borderRadius: '8px',
        maxWidth: '480px',
        width: '100%',
        padding: '2rem',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
      }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem', color: '#111827' }}>
          Add Academic Module
        </h2>
        <p style={{ fontSize: '0.875rem', color: '#4B5563', marginBottom: '1.5rem' }}>
          Define module identity, credit rating, and default weekly study hours across the 12-week block.
        </p>

        {error && (
          <div style={{
            padding: '0.75rem',
            backgroundColor: '#FEE2E2',
            color: '#991B1B',
            borderRadius: '4px',
            fontSize: '0.8125rem',
            marginBottom: '1rem'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.25rem', color: '#374151' }}>
              Module Code (e.g. PH101)
            </label>
            <input
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
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.25rem', color: '#374151' }}>
              Module Title
            </label>
            <input
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
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.25rem', color: '#374151' }}>
                Credits (UK)
              </label>
              <input
                type="number"
                min="1"
                max="120"
                value={credits}
                onChange={e => setCredits(Number(e.target.value))}
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  border: '1px solid #D1D5DB',
                  borderRadius: '4px',
                  fontSize: '0.875rem'
                }}
              />
              <span style={{ fontSize: '0.75rem', color: '#6B7280' }}>1 credit = 10 notional hours</span>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.25rem', color: '#374151' }}>
                Avg Hours/Week
              </label>
              <input
                type="number"
                min="1"
                max="40"
                value={weeklyHoursAverage}
                onChange={e => setWeeklyHoursAverage(Number(e.target.value))}
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  border: '1px solid #D1D5DB',
                  borderRadius: '4px',
                  fontSize: '0.875rem'
                }}
              />
              <span style={{ fontSize: '0.75rem', color: '#6B7280' }}>Across 12-week block</span>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
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
      </div>
    </div>
  );
};
