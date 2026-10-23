import React from 'react';
import { PERSONAS } from '../../data/personas';

interface PersonaSelectorProps {
  activePersonaId: string;
  onSelectPersona: (id: string) => void;
}

export const PersonaSelector: React.FC<PersonaSelectorProps> = ({ 
  activePersonaId, 
  onSelectPersona 
}) => {
  return (
    <div className="persona-selector-container" style={{
      padding: '1.25rem',
      backgroundColor: '#F9FAFB',
      borderRadius: '8px',
      border: '1px solid var(--border-color)'
    }}>
      <h3 style={{
        fontSize: '0.875rem',
        fontWeight: 700,
        color: 'var(--color-text-primary)',
        marginBottom: '0.75rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem'
      }}>
        <span>👤 Student Persona Modelling</span>
      </h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {PERSONAS.map(persona => {
          const isActive = activePersonaId === persona.id;
          return (
            <button
              key={persona.id}
              type="button"
              onClick={() => onSelectPersona(persona.id)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                padding: '0.75rem',
                borderRadius: '6px',
                border: isActive ? '1px solid #1D4ED8' : '1px solid #E5E7EB',
                backgroundColor: isActive ? '#1E40AF' : '#FFFFFF',
                color: isActive ? '#FFFFFF' : 'var(--color-text-primary)',
                textAlign: 'left',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                <span style={{ fontWeight: 600, fontSize: '0.8125rem' }}>{persona.name}</span>
                <span style={{
                  fontSize: '10px',
                  fontWeight: 600,
                  padding: '0.125rem 0.375rem',
                  borderRadius: '3px',
                  backgroundColor: isActive ? '#2563EB' : '#F3F4F6',
                  color: isActive ? '#FFFFFF' : '#4B5563'
                }}>
                  {persona.workloadMultiplier * 100}% Load
                </span>
              </div>
              <p style={{
                fontSize: '11px',
                lineHeight: '1.3',
                margin: 0,
                color: isActive ? '#DBEAFE' : '#6B7280'
              }}>
                {persona.description}
              </p>
            </button>
          );
        })}
      </div>
      <div style={{ marginTop: '0.75rem', fontSize: '10px', color: '#6B7280', lineHeight: 1.3 }}>
        * <em>Planning Notice:</em> Multipliers scale weekly workload as an illustrative sensitivity heuristic across the 12-week block. Part-time is not a multi-year stretched schedule, and intensive is not a validated compressed calendar.
      </div>
    </div>
  );
};
