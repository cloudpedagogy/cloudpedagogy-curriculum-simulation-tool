import React, { useRef } from 'react';

interface OnboardingViewProps {
  onCreateEmpty: () => void;
  onLoadDemo: () => void;
  onImportClick: () => void;
}

export const OnboardingView: React.FC<OnboardingViewProps> = ({
  onCreateEmpty,
  onLoadDemo,
  onImportClick
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="onboarding-container" style={{
      maxWidth: '800px',
      margin: '4rem auto',
      padding: '2.5rem',
      backgroundColor: '#FFFFFF',
      border: '1px solid #E5E7EB',
      borderRadius: '8px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
    }}>
      <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
        <div style={{
          fontSize: '0.75rem',
          fontWeight: 700,
          color: '#4B5563',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          marginBottom: '0.5rem'
        }}>
          CloudPedagogy · Curriculum Simulation Tool
        </div>
        <h1 style={{ fontSize: '1.875rem', fontWeight: 700, marginBottom: '0.75rem', color: '#111827' }}>
          Welcome to Curriculum Simulation
        </h1>
        <p style={{ color: '#4B5563', fontSize: '0.95rem', maxWidth: '600px', margin: '0 auto', lineHeight: 1.5 }}>
          Model student workload strain, deadline congestion, and competency scaffolding across alternative curriculum scenarios before institutional implementation.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        {/* Option 1: Create Empty */}
        <div style={{
          border: '1px solid #E5E7EB',
          borderRadius: '8px',
          padding: '1.5rem',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          backgroundColor: '#FAFAFA'
        }}>
          <div>
            <div style={{ fontSize: '1.5rem', marginBottom: '0.75rem' }}>📄</div>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.5rem', color: '#111827' }}>
              Create Empty Curriculum
            </h2>
            <p style={{ fontSize: '0.8125rem', color: '#4B5563', lineHeight: 1.4, marginBottom: '1rem' }}>
              Start with a blank canvas. Define your own modules, credit allocations, and workload profiles from scratch.
            </p>
          </div>
          <button
            type="button"
            className="btn btn-primary"
            onClick={onCreateEmpty}
            style={{ width: '100%', padding: '0.625rem', fontWeight: 600, fontSize: '0.875rem' }}
          >
            Start Empty
          </button>
        </div>

        {/* Option 2: Import JSON */}
        <div style={{
          border: '1px solid #E5E7EB',
          borderRadius: '8px',
          padding: '1.5rem',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          backgroundColor: '#FAFAFA'
        }}>
          <div>
            <div style={{ fontSize: '1.5rem', marginBottom: '0.75rem' }}>📥</div>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.5rem', color: '#111827' }}>
              Import Curriculum JSON
            </h2>
            <p style={{ fontSize: '0.8125rem', color: '#4B5563', lineHeight: 1.4, marginBottom: '1rem' }}>
              Load an existing CST workspace, scenario, or curriculum dataset from a local JSON file.
            </p>
          </div>
          <button
            type="button"
            className="btn"
            onClick={onImportClick}
            style={{ width: '100%', padding: '0.625rem', fontWeight: 600, fontSize: '0.875rem' }}
          >
            Upload JSON
          </button>
        </div>

        {/* Option 3: Explore Demo */}
        <div style={{
          border: '1px solid #DBEAFE',
          borderRadius: '8px',
          padding: '1.5rem',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          backgroundColor: '#EFF6FF'
        }}>
          <div>
            <div style={{ fontSize: '1.5rem', marginBottom: '0.75rem' }}>📊</div>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.5rem', color: '#1E3A8A' }}>
              Explore Demo Curriculum
            </h2>
            <p style={{ fontSize: '0.8125rem', color: '#1E40AF', lineHeight: 1.4, marginBottom: '1rem' }}>
              Explore a calibrated 4-module Public Health sample dataset (60 credits, 40h/week average load).
            </p>
          </div>
          <button
            type="button"
            className="btn"
            onClick={onLoadDemo}
            style={{ width: '100%', padding: '0.625rem', fontWeight: 600, fontSize: '0.875rem', backgroundColor: '#2563EB', color: '#FFFFFF', border: 'none' }}
          >
            Load Sample Demo
          </button>
        </div>
      </div>

      <div style={{
        padding: '1rem',
        backgroundColor: '#F9FAFB',
        border: '1px solid #E5E7EB',
        borderRadius: '6px',
        fontSize: '0.8125rem',
        color: '#4B5563'
      }}>
        <strong>Note on Local-First Privacy:</strong> All data is stored purely within your browser's local storage. No data is sent to external servers or cloud services.
      </div>

      <input
        type="file"
        ref={fileInputRef}
        style={{ display: 'none' }}
        accept=".json"
      />
    </div>
  );
};
