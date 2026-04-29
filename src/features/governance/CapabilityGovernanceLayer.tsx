import { useState } from 'react';
import type { SimulationDataset } from '../../types';

interface CapabilityGovernanceLayerProps {
  dataset: SimulationDataset;
  onUpdate: (dataset: SimulationDataset) => void;
}

export function CapabilityGovernanceLayer({ dataset, onUpdate }: CapabilityGovernanceLayerProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Lightweight capability and governance layer
  // Optional, non-blocking, and does not alter core workflow

  return (
    <div style={{
      marginTop: '4rem',
      padding: '1rem',
      border: '1px solid #E5E7EB',
      borderRadius: '0.375rem',
      backgroundColor: '#F9FAFB',
      color: '#374151',
      fontSize: '0.875rem',
      marginBottom: '2rem'
    }}>
      <button 
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: '100%',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'none',
          border: 'none',
          color: '#4B5563',
          cursor: 'pointer',
          padding: '0.5rem 0',
          fontWeight: 500,
          fontSize: '0.875rem'
        }}
      >
        <span>Capability & Governance Notes (Optional)</span>
        <span>{isOpen ? '▲' : '▼'}</span>
      </button>

      {isOpen && (
        <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 500 }}>AI Capability Support & Involvement</label>
            <textarea
              style={{ width: '100%', padding: '0.5rem', border: '1px solid #D1D5DB', borderRadius: '0.25rem', fontSize: '0.875rem', resize: 'vertical', minHeight: '60px', backgroundColor: '#FFFFFF' }}
              value={dataset.aiInvolvement || ''}
              onChange={(e) => onUpdate({ ...dataset, aiInvolvement: e.target.value })}
              placeholder="How was AI used in generating or reviewing this scenario?"
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 500 }}>Assumptions</label>
            <textarea
              style={{ width: '100%', padding: '0.5rem', border: '1px solid #D1D5DB', borderRadius: '0.25rem', fontSize: '0.875rem', resize: 'vertical', minHeight: '60px', backgroundColor: '#FFFFFF' }}
              value={dataset.assumptions || ''}
              onChange={(e) => onUpdate({ ...dataset, assumptions: e.target.value })}
              placeholder="What structural or pedagogical assumptions are embedded here?"
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 500 }}>Risks or Concerns</label>
            <textarea
              style={{ width: '100%', padding: '0.5rem', border: '1px solid #D1D5DB', borderRadius: '0.25rem', fontSize: '0.875rem', resize: 'vertical', minHeight: '60px', backgroundColor: '#FFFFFF' }}
              value={dataset.risks || ''}
              onChange={(e) => onUpdate({ ...dataset, risks: e.target.value })}
              placeholder="Any risks related to workload, coherence, or AI hallucination?"
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 500 }}>Rationale</label>
            <textarea
              style={{ width: '100%', padding: '0.5rem', border: '1px solid #D1D5DB', borderRadius: '0.25rem', fontSize: '0.875rem', resize: 'vertical', minHeight: '60px', backgroundColor: '#FFFFFF' }}
              value={dataset.rationale || ''}
              onChange={(e) => onUpdate({ ...dataset, rationale: e.target.value })}
              placeholder="Why were these structural choices made?"
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 500 }}>Human Review Notes</label>
            <textarea
              style={{ width: '100%', padding: '0.5rem', border: '1px solid #D1D5DB', borderRadius: '0.25rem', fontSize: '0.875rem', resize: 'vertical', minHeight: '60px', backgroundColor: '#FFFFFF' }}
              value={dataset.reviewNotes || ''}
              onChange={(e) => onUpdate({ ...dataset, reviewNotes: e.target.value })}
              placeholder="Notes from professional academic review."
            />
          </div>
        </div>
      )}
    </div>
  );
}
