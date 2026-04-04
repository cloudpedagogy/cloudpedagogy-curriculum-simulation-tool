import type { SimulationDataset } from '../../types';

const STORAGE_KEYS = {
  CURRENT_DATASET: 'curriculum_sim_current_dataset',
  SCENARIO_STATE: 'curriculum_sim_scenario_state',
};

export const storage = {
  saveDataset: (data: SimulationDataset): void => {
    try {
      localStorage.setItem(STORAGE_KEYS.CURRENT_DATASET, JSON.stringify(data));
    } catch (error) {
      console.error('Failed to save dataset to localStorage:', error);
    }
  },

  loadDataset: (): SimulationDataset | null => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CURRENT_DATASET);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Failed to load dataset from localStorage:', error);
      return null;
    }
  },

  saveScenario: (scenarioId: string, state: any): void => {
    try {
      const scenarios = storage.loadScenarios() || {};
      scenarios[scenarioId] = state;
      localStorage.setItem(STORAGE_KEYS.SCENARIO_STATE, JSON.stringify(scenarios));
    } catch (error) {
      console.error('Failed to save scenario to localStorage:', error);
    }
  },

  loadScenarios: (): Record<string, any> | null => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SCENARIO_STATE);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Failed to load scenarios from localStorage:', error);
      return null;
    }
  },

  resetData: (): void => {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_DATASET);
    localStorage.removeItem(STORAGE_KEYS.SCENARIO_STATE);
  }
};
