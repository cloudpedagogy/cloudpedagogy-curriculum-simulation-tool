import type { SimulationDataset } from '../../types';
import { PERSONAS } from '../../data/personas';

export interface WeeklyWorkload {
  week: number;
  rawHours: number;
  totalHours: number;
  intensity: 'low' | 'moderate' | 'high' | 'overload';
  isZero: boolean;
}

export interface WorkloadSignal {
  type: 'peak' | 'sustained' | 'spike' | 'imbalance' | 'missing-data';
  message: string;
  weeks: number[];
  severity: 'warning' | 'info' | 'critical';
}

/**
 * Authoritative Planning Thresholds for CST Workload Simulation.
 *
 * NOTE: These thresholds represent illustrative planning assumptions calibrated for a
 * full-time UK higher education student profile (40h/week nominal full-time study target),
 * not universal academic or institutional standards.
 */
export const WORKLOAD_THRESHOLDS = {
  MODERATE: 20,
  HIGH: 35,
  STANDARD_TARGET: 40,
  OVERLOAD: 45,
  SPIKE_DELTA: 15,
  SUSTAINED_MIN_WEEKS: 3
} as const;

export interface ModuleWorkloadReconciliation {
  moduleId: string;
  moduleCode: string;
  moduleTitle: string;
  credits: number;
  expectedNotionalHours: number;
  teachingPeriodHours: number;
  nonTeachingHours: number;
  hasProfile: boolean;
}

export interface WorkloadReconciliation {
  totalCredits: number;
  expectedNotionalHours: number;
  simulatedTeachingHours: number;
  scaledTeachingHours: number;
  personaScaledHours: number;
  nonTeachingHours: number;
  unreconciledHours: number;
  averageWeeklyHours: number;
  scaledAverageWeeklyHours: number;
  activePersonaMultiplier: number;
  personaMultiplier: number;
  activePersonaName: string;
  hasWorkloadData: boolean;
  unreconciledDescription: string;
  moduleBreakdown: ModuleWorkloadReconciliation[];
}

/**
 * Retrieves persona multiplier consistently across all analytical components.
 */
export const getActivePersona = (personaId?: string) => {
  return PERSONAS.find(p => p.id === personaId) || PERSONAS[0];
};

/**
 * Authoritative Workload Calculation.
 * Computes deterministic week-by-week workload applying the active persona multiplier.
 * Correctly distinguishes genuine zero workload from missing profile data.
 */
export const calculateWeeklyWorkload = (
  dataset: SimulationDataset,
  overrideMultiplier?: number
): WeeklyWorkload[] => {
  const weeks = Array.from({ length: 12 }, (_, i) => i + 1);
  const activePersona = getActivePersona(dataset.settings?.activePersonaId);
  const multiplier = typeof overrideMultiplier === 'number'
    ? overrideMultiplier
    : activePersona.workloadMultiplier;

  return weeks.map(week => {
    let hasEntries = false;
    let rawHours = 0;

    for (const profile of dataset.workload) {
      if (profile.weeklyHours && profile.weeklyHours.length >= week) {
        hasEntries = true;
        const val = profile.weeklyHours[week - 1];
        if (typeof val === 'number' && !isNaN(val)) {
          rawHours += val;
        }
      }
    }

    const totalHours = Number((rawHours * multiplier).toFixed(1));
    const isZero = hasEntries && rawHours === 0;

    let intensity: WeeklyWorkload['intensity'] = 'low';
    if (totalHours >= WORKLOAD_THRESHOLDS.OVERLOAD) {
      intensity = 'overload';
    } else if (totalHours >= WORKLOAD_THRESHOLDS.HIGH) {
      intensity = 'high';
    } else if (totalHours >= WORKLOAD_THRESHOLDS.MODERATE) {
      intensity = 'moderate';
    }

    return { week, rawHours, totalHours, intensity, isZero };
  });
};

/**
 * Reconciles module credits, notional learning hours, and simulated teaching period hours.
 * Uses the documented UK higher education convention: 1 credit = 10 notional learning hours.
 * The difference between teaching-period hours and total notional hours is treated as an
 * intentional non-teaching allocation (independent pre/post-term study, reading week, revision).
 */
export const reconcileWorkload = (dataset: SimulationDataset): WorkloadReconciliation => {
  const activePersona = getActivePersona(dataset.settings?.activePersonaId);
  const totalCredits = dataset.modules.reduce((sum, m) => sum + (m.credits || 0), 0);
  const expectedNotionalHours = totalCredits * 10;

  let simulatedTeachingHours = 0;
  const moduleBreakdown: ModuleWorkloadReconciliation[] = dataset.modules.map(module => {
    const profile = dataset.workload.find(w => w.moduleId === module.id);
    const hasProfile = !!profile && profile.weeklyHours.length > 0;
    const teachingHours = hasProfile
      ? profile.weeklyHours.reduce((sum, h) => sum + (typeof h === 'number' && !isNaN(h) ? h : 0), 0)
      : 0;
    simulatedTeachingHours += teachingHours;

    const expectedHours = (module.credits || 0) * 10;
    return {
      moduleId: module.id,
      moduleCode: module.code,
      moduleTitle: module.title,
      credits: module.credits || 0,
      expectedNotionalHours: expectedHours,
      teachingPeriodHours: teachingHours,
      nonTeachingHours: expectedHours - teachingHours,
      hasProfile
    };
  });

  const scaledTeachingHours = Number((simulatedTeachingHours * activePersona.workloadMultiplier).toFixed(1));
  const nonTeachingHours = expectedNotionalHours - simulatedTeachingHours;
  const averageWeeklyHours = Number((simulatedTeachingHours / 12).toFixed(1));
  const scaledAverageWeeklyHours = Number((scaledTeachingHours / 12).toFixed(1));
  const hasWorkloadData = dataset.workload.length > 0 && simulatedTeachingHours > 0;

  let unreconciledDescription = '';
  if (nonTeachingHours > 0) {
    unreconciledDescription = `${nonTeachingHours} notional hours (${(nonTeachingHours / (dataset.modules.length || 1)).toFixed(0)}h per module average) are allocated outside the 12-week teaching schedule for pre-term preparation, consolidation/reading periods, and post-term assessment reflection.`;
  } else if (nonTeachingHours < 0) {
    unreconciledDescription = `Teaching period workload exceeds standard notional credit hours by ${Math.abs(nonTeachingHours)} hours, indicating high contact/teaching intensity.`;
  } else {
    unreconciledDescription = 'All notional learning hours are fully scheduled within the 12-week teaching period.';
  }

  return {
    totalCredits,
    expectedNotionalHours,
    simulatedTeachingHours,
    scaledTeachingHours,
    personaScaledHours: scaledTeachingHours,
    nonTeachingHours,
    unreconciledHours: 0,
    averageWeeklyHours,
    scaledAverageWeeklyHours,
    activePersonaMultiplier: activePersona.workloadMultiplier,
    personaMultiplier: activePersona.workloadMultiplier,
    activePersonaName: activePersona.name,
    hasWorkloadData,
    unreconciledDescription,
    moduleBreakdown
  };
};

/**
 * Generates deterministic workload signals based on authoritative threshold boundaries.
 */
export const generateWorkloadSignals = (weeklyData: WeeklyWorkload[]): WorkloadSignal[] => {
  const signals: WorkloadSignal[] = [];

  // Check if workload data is missing entirely
  const totalHoursSum = weeklyData.reduce((sum, w) => sum + w.totalHours, 0);
  if (totalHoursSum === 0 && weeklyData.every(w => w.rawHours === 0)) {
    // Genuine zero workload or empty curriculum
    return signals;
  }

  // 1. Overload Peaks (boundary: totalHours >= 45)
  weeklyData.forEach(data => {
    if (data.totalHours >= WORKLOAD_THRESHOLDS.OVERLOAD) {
      signals.push({
        type: 'peak',
        message: `High academic intensity peak in Week ${data.week} (${data.totalHours}h ≥ ${WORKLOAD_THRESHOLDS.OVERLOAD}h threshold)`,
        weeks: [data.week],
        severity: 'critical'
      });
    }
  });

  // 2. Sustained High Workload (boundary: 3+ consecutive weeks of totalHours >= 35)
  let sustainedWeeks: number[] = [];
  weeklyData.forEach(data => {
    if (data.totalHours >= WORKLOAD_THRESHOLDS.HIGH) {
      sustainedWeeks.push(data.week);
    } else {
      if (sustainedWeeks.length >= WORKLOAD_THRESHOLDS.SUSTAINED_MIN_WEEKS) {
        signals.push({
          type: 'sustained',
          message: `Sustained high intensity study period across Weeks ${sustainedWeeks[0]}–${sustainedWeeks[sustainedWeeks.length - 1]} (${sustainedWeeks.length} consecutive weeks ≥ ${WORKLOAD_THRESHOLDS.HIGH}h)`,
          weeks: [...sustainedWeeks],
          severity: 'warning'
        });
      }
      sustainedWeeks = [];
    }
  });

  if (sustainedWeeks.length >= WORKLOAD_THRESHOLDS.SUSTAINED_MIN_WEEKS) {
    signals.push({
      type: 'sustained',
      message: `Sustained high intensity study period ending in Week ${sustainedWeeks[sustainedWeeks.length - 1]} (${sustainedWeeks.length} consecutive weeks ≥ ${WORKLOAD_THRESHOLDS.HIGH}h)`,
      weeks: [...sustainedWeeks],
      severity: 'warning'
    });
  }

  // 3. Workload Spikes (boundary: delta >= 15h between adjacent weeks)
  for (let i = 1; i < weeklyData.length; i++) {
    const prev = weeklyData[i - 1];
    const curr = weeklyData[i];
    const delta = Number((curr.totalHours - prev.totalHours).toFixed(1));

    if (delta >= WORKLOAD_THRESHOLDS.SPIKE_DELTA) {
      signals.push({
        type: 'spike',
        message: `Rapid workload escalation in Week ${curr.week} (+${delta}h increase from Week ${prev.week})`,
        weeks: [prev.week, curr.week],
        severity: 'warning'
      });
    }
  }

  return signals;
};

/**
 * Redistributes total module hours evenly across all 12 teaching weeks.
 *
 * Guarantees:
 * - Preserves the exact original total hours (sum(result) === originalTotal).
 * - Never produces negative or non-finite values.
 * - Handles whole or fractional total hours deterministically.
 */
export const distributeHoursEvenly = (weeklyHours: number[], numWeeks = 12): number[] => {
  if (!weeklyHours || weeklyHours.length === 0) {
    return Array(numWeeks).fill(0);
  }
  const cleanHours = weeklyHours.map(h => Math.max(0, isFinite(h) ? h : 0));
  const currentTotal = Number(cleanHours.reduce((s, h) => s + h, 0).toFixed(1));
  if (currentTotal <= 0) {
    return Array(numWeeks).fill(0);
  }

  const baseHour = Math.floor(currentTotal / numWeeks);
  let remainder = Number((currentTotal - (baseHour * numWeeks)).toFixed(1));
  const newHours = Array(numWeeks).fill(baseHour);

  // Distribute integer parts of remainder
  let i = 0;
  while (remainder >= 1.0 && i < numWeeks) {
    newHours[i] += 1;
    remainder = Number((remainder - 1.0).toFixed(1));
    i = (i + 1) % numWeeks;
  }
  // Add any sub-hour fractional remainder to the first week
  if (remainder > 0) {
    newHours[0] = Number((newHours[0] + remainder).toFixed(1));
  }

  return newHours;
};

/**
 * Smooths peak workload weeks by capping elevated weeks and redistributing
 * surplus hours into weeks with lowest study hours.
 *
 * Illustrative Planning Assumption:
 * Uses an illustrative cap of 125% of module average (minimum 12h cap).
 *
 * Guarantees:
 * - Strictly preserves the original total hours within 0.1h numerical rounding tolerance.
 * - Never produces negative or non-finite values.
 * - If every week is already at or above the cap, surplus is safely redistributed to the lowest weeks without losing hours.
 * - Idempotent: repeated application on an already smoothed profile makes no progressive distortion.
 */
export const smoothWeeklyHours = (weeklyHours: number[], targetCap?: number): number[] => {
  if (!weeklyHours || weeklyHours.length === 0) {
    return Array(12).fill(0);
  }
  const cleanHours = weeklyHours.map(h => Math.max(0, isFinite(h) ? h : 0));
  const total = Number(cleanHours.reduce((s, h) => s + h, 0).toFixed(1));
  if (total <= 0) {
    return Array(12).fill(0);
  }

  const avg = total / 12;
  const cap = targetCap ?? Math.max(12, Math.round(avg * 1.25));

  let surplus = 0;
  const smoothed = cleanHours.map(h => {
    if (h > cap) {
      surplus += (h - cap);
      return cap;
    }
    return h;
  });

  surplus = Number(surplus.toFixed(1));
  if (surplus <= 0) {
    // Already below cap across all weeks; no change needed (idempotent)
    return cleanHours;
  }

  // Distribute surplus into weeks with lowest hours
  while (surplus > 0.001) {
    let minIdx = 0;
    let minVal = Infinity;
    for (let i = 0; i < 12; i++) {
      if (smoothed[i] < minVal) {
        minVal = smoothed[i];
        minIdx = i;
      }
    }
    const step = surplus >= 1.0 ? 1.0 : surplus;
    smoothed[minIdx] = Number((smoothed[minIdx] + step).toFixed(1));
    surplus = Number((surplus - step).toFixed(1));
  }

  // Final sanity reconciliation to prevent numerical drift
  const currentSmoothedTotal = Number(smoothed.reduce((s, h) => s + h, 0).toFixed(1));
  const drift = Number((total - currentSmoothedTotal).toFixed(1));
  if (drift !== 0) {
    smoothed[0] = Number((smoothed[0] + drift).toFixed(1));
  }

  return smoothed;
};
