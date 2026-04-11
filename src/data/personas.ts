import type { Persona } from '../types';

export const PERSONAS: Persona[] = [
  { 
    id: 'ft', 
    name: 'Full-time Student', 
    description: 'Standard 100% study load across all modules.', 
    workloadMultiplier: 1.0 
  },
  { 
    id: 'pt', 
    name: 'Part-time Student', 
    description: 'Reduced 50% study load, typically for working professionals.', 
    workloadMultiplier: 0.5 
  },
  { 
    id: 'it', 
    name: 'Intensive Learner', 
    description: 'High-pressure 120% study load, simulating accelerated or high-attainment pathways.', 
    workloadMultiplier: 1.2 
  }
];
