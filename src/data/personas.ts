import type { Persona } from '../types';

export const PERSONAS: Persona[] = [
  {
    id: 'ft',
    name: 'Full-time Student',
    description: 'Standard 100% baseline weekly study load (40h nominal target).',
    workloadMultiplier: 1.0
  },
  {
    id: 'pt',
    name: 'Part-time Student',
    description: 'Illustrative 50% weekly study load sensitivity heuristic.',
    workloadMultiplier: 0.5
  },
  {
    id: 'it',
    name: 'Intensive Learner',
    description: 'Illustrative 120% weekly study load sensitivity heuristic.',
    workloadMultiplier: 1.2
  }
];
