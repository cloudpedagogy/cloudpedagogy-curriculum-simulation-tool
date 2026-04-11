import React, { useMemo } from 'react';
import type { SimulationDataset } from '../../types';
import { calculateWeeklyWorkload } from '../../lib/simulation/workload';
import { PERSONAS } from '../../data/personas';

interface ComparisonDashboardProps {
  baseline: SimulationDataset;
  current: SimulationDataset;
}

export const ComparisonDashboard: React.FC<ComparisonDashboardProps> = ({ baseline, current }) => {
  const baseWorkload = useMemo(() => calculateWeeklyWorkload(baseline), [baseline]);
  const currWorkload = useMemo(() => calculateWeeklyWorkload(current), [current]);
  
  const activePersona = useMemo(() => 
    PERSONAS.find(p => p.id === current.settings?.activePersonaId) || PERSONAS[0],
    [current.settings?.activePersonaId]
  );

  const stats = useMemo(() => {
    const baseTotal = baseWorkload.reduce((sum, w) => sum + w.totalHours, 0);
    const currTotal = currWorkload.reduce((sum, w) => sum + w.totalHours, 0);
    const basePeak = Math.max(...baseWorkload.map(w => w.totalHours));
    const currPeak = Math.max(...currWorkload.map(w => w.totalHours));

    return {
      totalDelta: currTotal - baseTotal,
      peakDelta: currPeak - basePeak,
      isChanged: JSON.stringify(baseline) !== JSON.stringify(current)
    };
  }, [baseWorkload, currWorkload, baseline, current]);

  if (!stats.isChanged) return (
    <div className="p-6 bg-slate-50 border border-dashed border-slate-300 rounded-xl text-center">
      <p className="text-slate-400 text-sm italic">No modifications detected. Current state matches baseline.</p>
    </div>
  );

  return (
    <div className="comparison-dashboard p-6 bg-white rounded-xl shadow-sm border border-slate-200">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Scenario Impact Analysis</h2>
          <div className="flex items-center gap-2 mt-1">
            <p className="text-sm text-slate-500">Side-by-side comparison of Baseline vs Modified curriculum.</p>
            <span className="text-[10px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded border border-blue-100 font-medium">
              Modeled for: {activePersona.name} ({activePersona.workloadMultiplier * 100}% load)
            </span>
          </div>
        </div>
        <div className="flex gap-4">
          <div className="text-right">
            <div className="text-[10px] uppercase font-bold text-slate-400">Total Workload Δ</div>
            <div className={`text-lg font-bold ${stats.totalDelta > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
              {stats.totalDelta > 0 ? '+' : ''}{stats.totalDelta.toFixed(1)}h
            </div>
          </div>
          <div className="text-right">
            <div className="text-[10px] uppercase font-bold text-slate-400">Peak Pressure Δ</div>
            <div className={`text-lg font-bold ${stats.peakDelta > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
              {stats.peakDelta > 0 ? '+' : ''}{stats.peakDelta.toFixed(1)}h
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        <div className="rounded-lg overflow-hidden border border-slate-200">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="p-3 font-bold text-slate-600">Week</th>
                <th className="p-3 font-bold text-slate-600">
                  <span className="bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded mr-2 text-[9px]">BASELINE</span>
                  Baseline Hours
                </th>
                <th className="p-3 font-bold text-slate-600">
                  <span className="bg-blue-600 text-white px-1.5 py-0.5 rounded mr-2 text-[9px]">SCENARIO</span>
                  Modified Hours
                </th>
                <th className="p-3 font-bold text-slate-600">Impact</th>
              </tr>
            </thead>
            <tbody>
              {baseWorkload.map((base, idx) => {
                const curr = currWorkload[idx];
                const delta = curr.totalHours - base.totalHours;
                return (
                  <tr key={base.week} className="border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors">
                    <td className="p-3 font-medium text-slate-500">Week {base.week}</td>
                    <td className="p-3 text-slate-700">{base.totalHours.toFixed(1)}h</td>
                    <td className="p-3 font-semibold text-slate-900">{curr.totalHours.toFixed(1)}h</td>
                    <td className="p-3">
                      {delta !== 0 ? (
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          delta > 0 ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'
                        }`}>
                          {delta > 0 ? '↑' : '↓'} {Math.abs(delta).toFixed(1)}h
                        </span>
                      ) : (
                        <span className="text-slate-300">-</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
