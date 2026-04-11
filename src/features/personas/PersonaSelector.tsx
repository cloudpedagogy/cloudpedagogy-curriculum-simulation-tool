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
    <div className="persona-selector-container p-4 bg-slate-50 rounded-lg border border-slate-200">
      <h3 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
        <span>👤 Student Persona Modelling</span>
      </h3>
      <div className="flex flex-col gap-2">
        {PERSONAS.map(persona => (
          <button
            key={persona.id}
            onClick={() => onSelectPersona(persona.id)}
            className={`flex flex-col p-3 rounded-lg border transition-all text-left ${
              activePersonaId === persona.id 
                ? 'bg-blue-600 border-blue-700 text-white shadow-md' 
                : 'bg-white border-slate-200 text-slate-600 hover:border-blue-400'
            }`}
          >
            <div className="flex justify-between items-center mb-1">
              <span className="font-bold text-sm">{persona.name}</span>
              <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                activePersonaId === persona.id ? 'bg-blue-500' : 'bg-slate-100 text-slate-500'
              }`}>
                {persona.workloadMultiplier * 100}% Load
              </span>
            </div>
            <p className={`text-[10px] leading-tight ${
              activePersonaId === persona.id ? 'text-blue-100' : 'text-slate-400'
            }`}>
              {persona.description}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
};
