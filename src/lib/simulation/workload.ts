import type { SimulationDataset } from '../../types';
import { PERSONAS } from '../../data/personas';

export interface WeeklyWorkload {
  week: number;
  totalHours: number;
  intensity: 'low' | 'moderate' | 'high' | 'overload';
}

export interface WorkloadSignal {
  type: 'peak' | 'sustained' | 'imbalance';
  message: string;
  weeks: number[];
  severity: 'warning' | 'info' | 'critical';
}

const THRESHOLDS = {
  MODERATE: 20,
  HIGH: 35,
  OVERLOAD: 45,
  SPIKE_DELTA: 15,
};

export const calculateWeeklyWorkload = (dataset: SimulationDataset): WeeklyWorkload[] => {
  const weeks = Array.from({ length: 12 }, (_, i) => i + 1);
  const activePersona = PERSONAS.find(p => p.id === dataset.settings?.activePersonaId) || PERSONAS[0];
  const multiplier = activePersona.workloadMultiplier;

  return weeks.map(week => {
    const rawHours = dataset.workload.reduce((sum, profile) => 
      sum + (profile.weeklyHours[week - 1] || 0), 0);
    
    const totalHours = rawHours * multiplier;
    
    let intensity: WeeklyWorkload['intensity'] = 'low';
    if (totalHours >= THRESHOLDS.OVERLOAD) intensity = 'overload';
    else if (totalHours >= THRESHOLDS.HIGH) intensity = 'high';
    else if (totalHours >= THRESHOLDS.MODERATE) intensity = 'moderate';
    
    return { week, totalHours, intensity };
  });
};

export const generateWorkloadSignals = (weeklyData: WeeklyWorkload[]): WorkloadSignal[] => {
  const signals: WorkloadSignal[] = [];

  // Check for overload peaks
  weeklyData.forEach(data => {
    if (data.intensity === 'overload') {
      signals.push({
        type: 'peak',
        message: `High academic intensity peak in Week ${data.week} (${data.totalHours}h)`,
        weeks: [data.week],
        severity: 'critical'
      });
    }
  });

  // Check for sustained high workload (3+ consecutive weeks of high/overload)
  let sustainedWeeks: number[] = [];
  weeklyData.forEach(data => {
    if (data.intensity === 'high' || data.intensity === 'overload') {
      sustainedWeeks.push(data.week);
    } else {
      if (sustainedWeeks.length >= 3) {
        signals.push({
          type: 'sustained',
          message: `Extended period of high clinical/research demand (Weeks ${sustainedWeeks[0]}-${sustainedWeeks[sustainedWeeks.length - 1]})`,
          weeks: [...sustainedWeeks],
          severity: 'warning'
        });
      }
      sustainedWeeks = [];
    }
  });
  // Final check if period ends at the last week
  if (sustainedWeeks.length >= 3) {
    signals.push({
      type: 'sustained',
      message: `Sustained high intensity period ending in Week ${sustainedWeeks[sustainedWeeks.length - 1]}`,
      weeks: [...sustainedWeeks],
      severity: 'warning'
    });
  }

  // Check for workload spikes (15h+ increase between adjacent weeks)
  for (let i = 1; i < weeklyData.length; i++) {
    const prev = weeklyData[i - 1];
    const curr = weeklyData[i];
    const delta = curr.totalHours - prev.totalHours;
    
    if (delta >= THRESHOLDS.SPIKE_DELTA) {
      signals.push({
        type: 'imbalance',
        message: `Rapid workload escalation in Week ${curr.week} (+${delta.toFixed(1)}h jump)`,
        weeks: [prev.week, curr.week],
        severity: 'warning'
      });
    }
  }

  return signals;
};
