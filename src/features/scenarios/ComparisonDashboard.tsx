import React, { useState, useMemo } from 'react';
import type { CstWorkspace, SimulationDataset } from '../../types';
import { calculateWeeklyWorkload, reconcileWorkload, WORKLOAD_THRESHOLDS } from '../../lib/simulation/workload';
import { analyzeAssessments } from '../../lib/simulation/assessment';
import { analyzeSkillProgression } from '../../lib/simulation/skills';
import { PERSONAS } from '../../data/personas';

interface ComparisonDashboardProps {
  workspace: CstWorkspace;
}

interface ConfigurationOption {
  id: string; // 'baseline' or scenario id
  name: string;
  dataset: SimulationDataset;
  isBaseline: boolean;
}

export const ComparisonDashboard: React.FC<ComparisonDashboardProps> = ({ workspace }) => {
  const options: ConfigurationOption[] = useMemo(() => {
    const list: ConfigurationOption[] = [
      {
        id: 'baseline',
        name: 'Protected Baseline Curriculum',
        dataset: workspace.baseline,
        isBaseline: true
      }
    ];

    workspace.scenarios.forEach((s, idx) => {
      list.push({
        id: s.id,
        name: `Scenario: ${s.name || `Scenario ${idx + 1}`}`,
        dataset: s.dataset,
        isBaseline: false
      });
    });

    return list;
  }, [workspace]);

  // Default selection: Config 1 = Baseline, Config 2 = Active scenario (or first scenario if exists, else baseline)
  const [config1Id, setConfig1Id] = useState<string>('baseline');
  const [config2Id, setConfig2Id] = useState<string>(() => {
    if (workspace.activeScenarioId) return workspace.activeScenarioId;
    if (workspace.scenarios.length > 0) return workspace.scenarios[0].id;
    return 'baseline';
  });

  const [showTableOnly, setShowTableOnly] = useState<boolean>(false);

  const config1 = options.find(o => o.id === config1Id) || options[0];
  const config2 = options.find(o => o.id === config2Id) || (options[1] || options[0]);

  // Persona
  const activePersona = useMemo(() => {
    const personaId = config2.dataset.settings?.activePersonaId || config1.dataset.settings?.activePersonaId;
    return PERSONAS.find(p => p.id === personaId) || PERSONAS[0];
  }, [config1, config2]);

  // Workload calculations with persona multiplier
  const workload1 = useMemo(
    () => calculateWeeklyWorkload(config1.dataset, activePersona.workloadMultiplier),
    [config1.dataset, activePersona.workloadMultiplier]
  );
  const workload2 = useMemo(
    () => calculateWeeklyWorkload(config2.dataset, activePersona.workloadMultiplier),
    [config2.dataset, activePersona.workloadMultiplier]
  );

  // Reconciliation stats
  const recon1 = useMemo(() => reconcileWorkload(config1.dataset), [config1.dataset]);
  const recon2 = useMemo(() => reconcileWorkload(config2.dataset), [config2.dataset]);

  // Assessment congestion stats
  const asmtAnalysis1 = useMemo(() => analyzeAssessments(config1.dataset), [config1.dataset]);
  const asmtAnalysis2 = useMemo(() => analyzeAssessments(config2.dataset), [config2.dataset]);

  // Skills exposure stats
  const skills1 = useMemo(() => analyzeSkillProgression(config1.dataset), [config1.dataset]);
  const skills2 = useMemo(() => analyzeSkillProgression(config2.dataset), [config2.dataset]);

  // Derived comparative metrics
  const comparisonStats = useMemo(() => {
    const totalHours1 = workload1.reduce((sum, w) => sum + w.totalHours, 0);
    const totalHours2 = workload2.reduce((sum, w) => sum + w.totalHours, 0);

    const peak1 = workload1.reduce((max, w) => (w.totalHours > max.hours ? { week: w.week, hours: w.totalHours } : max), { week: 1, hours: 0 });
    const peak2 = workload2.reduce((max, w) => (w.totalHours > max.hours ? { week: w.week, hours: w.totalHours } : max), { week: 1, hours: 0 });

    const overloadWeeks1 = workload1.filter(w => w.totalHours >= WORKLOAD_THRESHOLDS.OVERLOAD).length;
    const overloadWeeks2 = workload2.filter(w => w.totalHours >= WORKLOAD_THRESHOLDS.OVERLOAD).length;

    const highWeeks1 = workload1.filter(w => w.totalHours >= WORKLOAD_THRESHOLDS.HIGH).length;
    const highWeeks2 = workload2.filter(w => w.totalHours >= WORKLOAD_THRESHOLDS.HIGH).length;

    const congestedWeeks1 = asmtAnalysis1.clusters.filter(c => c.isCongested).length;
    const congestedWeeks2 = asmtAnalysis2.clusters.filter(c => c.isCongested).length;

    const reinforcedSkills1 = skills1.progression.filter(p => p.moduleCount >= 2).length;
    const reinforcedSkills2 = skills2.progression.filter(p => p.moduleCount >= 2).length;

    const isIdentical = config1Id === config2Id || JSON.stringify(config1.dataset) === JSON.stringify(config2.dataset);

    return {
      totalHours1,
      totalHours2,
      totalDelta: totalHours2 - totalHours1,
      peak1,
      peak2,
      peakDelta: peak2.hours - peak1.hours,
      overloadWeeks1,
      overloadWeeks2,
      overloadDelta: overloadWeeks2 - overloadWeeks1,
      highWeeks1,
      highWeeks2,
      highDelta: highWeeks2 - highWeeks1,
      credits1: recon1.totalCredits,
      credits2: recon2.totalCredits,
      creditsDelta: recon2.totalCredits - recon1.totalCredits,
      modules1: config1.dataset.modules.length,
      modules2: config2.dataset.modules.length,
      modulesDelta: config2.dataset.modules.length - config1.dataset.modules.length,
      asmts1: config1.dataset.assessments.length,
      asmts2: config2.dataset.assessments.length,
      asmtsDelta: config2.dataset.assessments.length - config1.dataset.assessments.length,
      congestedWeeks1,
      congestedWeeks2,
      congestedDelta: congestedWeeks2 - congestedWeeks1,
      reinforcedSkills1,
      reinforcedSkills2,
      reinforcedSkillsDelta: reinforcedSkills2 - reinforcedSkills1,
      isIdentical
    };
  }, [workload1, workload2, recon1, recon2, asmtAnalysis1, asmtAnalysis2, skills1, skills2, config1Id, config2Id, config1.dataset, config2.dataset]);

  // SVG Chart Geometry
  const chartHeight = 240;
  const chartWidth = 720;
  const padding = { top: 30, right: 30, bottom: 40, left: 50 };
  const graphWidth = chartWidth - padding.left - padding.right;
  const graphHeight = chartHeight - padding.top - padding.bottom;

  const maxVal = Math.max(
    55,
    Math.ceil((Math.max(...workload1.map(w => w.totalHours), ...workload2.map(w => w.totalHours), 50) + 5) / 10) * 10
  );

  const getX = (week: number) => padding.left + ((week - 1) / 11) * graphWidth;
  const getY = (val: number) => padding.top + graphHeight - (val / maxVal) * graphHeight;

  // Path generators
  const linePath1 = workload1.reduce((path, w, i) => `${path} ${i === 0 ? 'M' : 'L'} ${getX(w.week)} ${getY(w.totalHours)}`, '');
  const linePath2 = workload2.reduce((path, w, i) => `${path} ${i === 0 ? 'M' : 'L'} ${getX(w.week)} ${getY(w.totalHours)}`, '');

  const formatDelta = (val: number, unit = '', invertPositiveIsGood = false) => {
    if (val === 0) return <span style={{ color: 'var(--text-secondary)' }}>0{unit} (Unchanged)</span>;
    const isHigher = val > 0;
    const sign = isHigher ? '+' : '';
    // By default, less workload/overload is desirable
    const isGood = invertPositiveIsGood ? isHigher : !isHigher;
    const color = isGood ? '#15803D' : '#DC2626';
    const direction = isHigher ? '↑ Increased' : '↓ Decreased';

    return (
      <span style={{ color, fontWeight: 700 }}>
        {direction}: {sign}{val.toFixed(1)}{unit}
      </span>
    );
  };

  return (
    <div className="comparison-dashboard" style={{ marginTop: '3rem', background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '2rem' }}>
      {/* Header & Configuration Selectors */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1.5rem', marginBottom: '2rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1.5rem' }}>
        <div>
          <h2>Curriculum Scenario Comparison</h2>
          <p className="description" style={{ margin: 0 }}>
            Systematic side-by-side contrast of workload distribution, assessment congestion, credits, and skill scaffolding.
          </p>
          <div style={{ marginTop: '0.5rem', fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
            Active Persona: <strong>{activePersona.name}</strong> ({activePersona.workloadMultiplier * 100}% load multiplier)
          </div>
        </div>

        {/* Dropdown selectors for Config 1 vs Config 2 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: '#F9FAFB', padding: '0.75rem 1rem', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#1E293B', marginBottom: '0.25rem' }}>
              ● Configuration A:
            </label>
            <select
              value={config1Id}
              onChange={(e) => setConfig1Id(e.target.value)}
              style={{ padding: '0.35rem 0.6rem', borderRadius: '4px', border: '1px solid var(--border-color)', fontSize: '0.8125rem', fontWeight: 600 }}
            >
              {options.map(opt => (
                <option key={opt.id} value={opt.id}>{opt.name}</option>
              ))}
            </select>
          </div>

          <div style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-dim)', alignSelf: 'center', marginTop: '1rem' }}>
            vs
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#2563EB', marginBottom: '0.25rem' }}>
              ■ Configuration B:
            </label>
            <select
              value={config2Id}
              onChange={(e) => setConfig2Id(e.target.value)}
              style={{ padding: '0.35rem 0.6rem', borderRadius: '4px', border: '1px solid var(--border-color)', fontSize: '0.8125rem', fontWeight: 600 }}
            >
              {options.map(opt => (
                <option key={opt.id} value={opt.id}>{opt.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {comparisonStats.isIdentical && (
        <div style={{ padding: '0.75rem 1rem', background: '#F9FAFB', border: '1px dashed var(--border-color)', borderRadius: '6px', marginBottom: '1.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
          ℹ️ The two selected configurations are identical in curriculum structure and workload. Select an alternative scenario to inspect differences.
        </div>
      )}

      {/* Comparative Metrics Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        {/* Metric 1: Total Teaching Hours */}
        <div style={{ background: '#FFFFFF', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '1rem', borderLeft: '4px solid #1E293B' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>Total Scheduled Workload</div>
          <div style={{ fontSize: '1.25rem', fontWeight: 700, margin: '0.25rem 0' }}>
            {comparisonStats.totalHours2.toFixed(1)}h
            <span style={{ fontSize: '0.8125rem', fontWeight: 400, color: 'var(--text-secondary)' }}> (vs {comparisonStats.totalHours1.toFixed(1)}h)</span>
          </div>
          <div style={{ fontSize: '0.75rem' }}>
            {formatDelta(comparisonStats.totalDelta, 'h')}
          </div>
        </div>

        {/* Metric 2: Peak Workload */}
        <div style={{ background: '#FFFFFF', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '1rem', borderLeft: '4px solid #F59E0B' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>Peak Weekly Pressure</div>
          <div style={{ fontSize: '1.25rem', fontWeight: 700, margin: '0.25rem 0' }}>
            {comparisonStats.peak2.hours.toFixed(1)}h <span style={{ fontSize: '0.75rem', fontWeight: 400 }}>(W{comparisonStats.peak2.week})</span>
            <span style={{ fontSize: '0.8125rem', fontWeight: 400, color: 'var(--text-secondary)' }}> vs {comparisonStats.peak1.hours.toFixed(1)}h (W{comparisonStats.peak1.week})</span>
          </div>
          <div style={{ fontSize: '0.75rem' }}>
            {formatDelta(comparisonStats.peakDelta, 'h')}
          </div>
        </div>

        {/* Metric 3: Overload Weeks */}
        <div style={{ background: '#FFFFFF', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '1rem', borderLeft: '4px solid #DC2626' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>Overload Weeks (≥ 45h)</div>
          <div style={{ fontSize: '1.25rem', fontWeight: 700, margin: '0.25rem 0' }}>
            {comparisonStats.overloadWeeks2} wks
            <span style={{ fontSize: '0.8125rem', fontWeight: 400, color: 'var(--text-secondary)' }}> (vs {comparisonStats.overloadWeeks1} wks)</span>
          </div>
          <div style={{ fontSize: '0.75rem' }}>
            {formatDelta(comparisonStats.overloadDelta, ' wks')}
          </div>
        </div>

        {/* Metric 4: Congested Assessment Weeks */}
        <div style={{ background: '#FFFFFF', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '1rem', borderLeft: '4px solid #8B5CF6' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>Congested Deadlines</div>
          <div style={{ fontSize: '1.25rem', fontWeight: 700, margin: '0.25rem 0' }}>
            {comparisonStats.asmts2 === 0 ? (
              <span style={{ fontSize: '0.9375rem', color: 'var(--text-secondary)' }}>N/A (No records)</span>
            ) : (
              <>
                {comparisonStats.congestedWeeks2} wks
                <span style={{ fontSize: '0.8125rem', fontWeight: 400, color: 'var(--text-secondary)' }}>
                  {' '}(vs {comparisonStats.asmts1 === 0 ? 'N/A' : `${comparisonStats.congestedWeeks1} wks`})
                </span>
              </>
            )}
          </div>
          <div style={{ fontSize: '0.75rem' }}>
            {comparisonStats.asmts1 === 0 || comparisonStats.asmts2 === 0 ? (
              <span style={{ color: 'var(--text-secondary)' }}>Unavailable (unmapped assessment data)</span>
            ) : (
              formatDelta(comparisonStats.congestedDelta, ' wks')
            )}
          </div>
        </div>


        {/* Metric 5: Programme Credits */}
        <div style={{ background: '#FFFFFF', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '1rem', borderLeft: '4px solid #0284C7' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>Programme Credits</div>
          <div style={{ fontSize: '1.25rem', fontWeight: 700, margin: '0.25rem 0' }}>
            {comparisonStats.credits2} credits
            <span style={{ fontSize: '0.8125rem', fontWeight: 400, color: 'var(--text-secondary)' }}> (vs {comparisonStats.credits1})</span>
          </div>
          <div style={{ fontSize: '0.75rem' }}>
            {formatDelta(comparisonStats.creditsDelta, ' credits', true)}
          </div>
        </div>
      </div>

      {/* Visualisation Controls & Toggle */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <div>
          <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>Workload Pressure Profile (12 Teaching Weeks)</h3>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', margin: 0 }}>
            Contrasting weekly distribution. Dual visual encoding (solid circles for Config A vs dashed squares for Config B) ensures clarity without relying on colour alone.
          </p>
        </div>
        <button
          className="btn btn-small"
          onClick={() => setShowTableOnly(!showTableOnly)}
          style={{ fontSize: '0.8125rem' }}
        >
          {showTableOnly ? 'Show Visual Pressure Curve' : 'Accessible Table Only'}
        </button>
      </div>

      {/* SVG WORKLOAD PRESSURE CURVE */}
      {!showTableOnly && (
        <div style={{ background: '#FFFFFF', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '1rem', marginBottom: '1.5rem', overflowX: 'auto' }}>
          <svg
            viewBox={`0 0 ${chartWidth} ${chartHeight}`}
            style={{ width: '100%', height: 'auto', display: 'block' }}
            role="img"
            aria-label={`Workload pressure comparison chart between ${config1.name} and ${config2.name}`}
          >
            <title>Workload Pressure Curve Comparison</title>
            <desc>
              X-axis shows weeks 1 to 12. Y-axis shows weekly student workload hours from 0 to {maxVal}h.
              Planning target line at 40h and overload line at 45h.
            </desc>

            {/* Background Grid Lines & Y-Axis Labels */}
            {[0, 20, 35, 40, 45, maxVal].filter((v, i, a) => a.indexOf(v) === i).map(val => (
              <g key={val}>
                <line
                  x1={padding.left}
                  y1={getY(val)}
                  x2={chartWidth - padding.right}
                  y2={getY(val)}
                  stroke={val === 45 ? '#FCA5A5' : val === 40 ? '#CBD5E1' : '#F1F5F9'}
                  strokeWidth={val === 40 || val === 45 ? 1.5 : 1}
                  strokeDasharray={val === 40 || val === 45 ? '4 4' : undefined}
                />
                <text
                  x={padding.left - 8}
                  y={getY(val) + 4}
                  textAnchor="end"
                  fontSize="10"
                  fill={val === 45 ? '#DC2626' : val === 40 ? '#475569' : '#94A3B8'}
                  fontWeight={val === 40 || val === 45 ? 'bold' : 'normal'}
                >
                  {val}h
                </text>
              </g>
            ))}

            {/* Threshold Reference Annotations */}
            <text
              x={chartWidth - padding.right - 4}
              y={getY(WORKLOAD_THRESHOLDS.OVERLOAD) - 4}
              textAnchor="end"
              fontSize="9"
              fill="#DC2626"
              fontWeight="bold"
            >
              Overload Threshold (45h)
            </text>
            <text
              x={chartWidth - padding.right - 4}
              y={getY(WORKLOAD_THRESHOLDS.STANDARD_TARGET) - 4}
              textAnchor="end"
              fontSize="9"
              fill="#475569"
            >
              Planning Target (40h)
            </text>

            {/* X-Axis Labels (Weeks 1 to 12) */}
            {Array.from({ length: 12 }, (_, i) => i + 1).map(week => (
              <g key={week}>
                <line
                  x1={getX(week)}
                  y1={chartHeight - padding.bottom}
                  x2={getX(week)}
                  y2={chartHeight - padding.bottom + 5}
                  stroke="#94A3B8"
                />
                <text
                  x={getX(week)}
                  y={chartHeight - padding.bottom + 16}
                  textAnchor="middle"
                  fontSize="11"
                  fill="#475569"
                  fontWeight="600"
                >
                  W{week}
                </text>
              </g>
            ))}

            {/* Curve 1: Config 1 (Solid, Circle Markers) */}
            <path
              d={linePath1}
              fill="none"
              stroke="#1E293B"
              strokeWidth="2.5"
            />
            {workload1.map(w => (
              <circle
                key={`c1-${w.week}`}
                cx={getX(w.week)}
                cy={getY(w.totalHours)}
                r="4.5"
                fill="#1E293B"
                stroke="#FFFFFF"
                strokeWidth="1.5"
              >
                <title>{`${config1.name} Week ${w.week}: ${w.totalHours.toFixed(1)}h`}</title>
              </circle>
            ))}

            {/* Curve 2: Config 2 (Dashed, Diamond/Square Markers) */}
            <path
              d={linePath2}
              fill="none"
              stroke="#2563EB"
              strokeWidth="2.5"
              strokeDasharray="6 3"
            />
            {workload2.map(w => (
              <rect
                key={`c2-${w.week}`}
                x={getX(w.week) - 4}
                y={getY(w.totalHours) - 4}
                width="8"
                height="8"
                fill="#2563EB"
                stroke="#FFFFFF"
                strokeWidth="1.5"
                transform={`rotate(45, ${getX(w.week)}, ${getY(w.totalHours)})`}
              >
                <title>{`${config2.name} Week ${w.week}: ${w.totalHours.toFixed(1)}h`}</title>
              </rect>
            ))}
          </svg>

          {/* SVG Legend */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', marginTop: '0.75rem', fontSize: '0.8125rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ display: 'inline-block', width: '12px', height: '12px', borderRadius: '50%', background: '#1E293B' }} />
              <span><strong>Config A:</strong> {config1.name} (Solid line, circles)</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ display: 'inline-block', width: '10px', height: '10px', background: '#2563EB', transform: 'rotate(45deg)' }} />
              <span><strong>Config B:</strong> {config2.name} (Dashed line, diamonds)</span>
            </div>
          </div>
        </div>
      )}

      {/* ACCESSIBLE TABULAR EQUIVALENT */}
      <div style={{ marginTop: '1.5rem' }}>
        <h4 style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem' }}>
          Accessible Workload Comparison Table
        </h4>
        <div style={{ overflowX: 'auto', border: '1px solid var(--border-color)', borderRadius: '6px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8125rem', textAlign: 'left' }}>
            <caption style={{ textAlign: 'left', padding: '0.5rem 1rem', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              Weekly workload comparison across the 12-week teaching period.
            </caption>
            <thead>
              <tr style={{ background: '#F9FAFB', borderBottom: '1px solid var(--border-color)' }}>
                <th style={{ padding: '0.6rem 0.75rem', fontWeight: 600 }}>Week</th>
                <th style={{ padding: '0.6rem 0.75rem', fontWeight: 600 }}>Config A: {config1.name}</th>
                <th style={{ padding: '0.6rem 0.75rem', fontWeight: 600 }}>Config B: {config2.name}</th>
                <th style={{ padding: '0.6rem 0.75rem', fontWeight: 600 }}>Difference (B - A)</th>
                <th style={{ padding: '0.6rem 0.75rem', fontWeight: 600 }}>Threshold Status</th>
              </tr>
            </thead>
            <tbody>
              {workload1.map((w1, idx) => {
                const w2 = workload2[idx];
                const delta = w2.totalHours - w1.totalHours;
                const isOverload = w2.totalHours >= WORKLOAD_THRESHOLDS.OVERLOAD;
                const isHigh = w2.totalHours >= WORKLOAD_THRESHOLDS.HIGH;

                let statusBadge = <span style={{ color: 'var(--text-secondary)' }}>Standard (&lt; 35h)</span>;
                if (isOverload) {
                  statusBadge = <span style={{ color: '#DC2626', fontWeight: 600 }}>⚠️ Overload (≥ 45h)</span>;
                } else if (isHigh) {
                  statusBadge = <span style={{ color: '#D97706', fontWeight: 600 }}>⚡ High (≥ 35h)</span>;
                }

                return (
                  <tr
                    key={w1.week}
                    style={{
                      borderBottom: '1px solid var(--border-color)',
                      background: idx % 2 === 0 ? '#FFFFFF' : '#F9FAFB'
                    }}
                  >
                    <td style={{ padding: '0.5rem 0.75rem', fontWeight: 600 }}>Week {w1.week}</td>
                    <td style={{ padding: '0.5rem 0.75rem' }}>{w1.totalHours.toFixed(1)}h</td>
                    <td style={{ padding: '0.5rem 0.75rem', fontWeight: 600 }}>{w2.totalHours.toFixed(1)}h</td>
                    <td style={{ padding: '0.5rem 0.75rem' }}>
                      {delta === 0 ? (
                        <span style={{ color: 'var(--text-secondary)' }}>= 0.0h (Unchanged)</span>
                      ) : delta > 0 ? (
                        <span style={{ color: '#DC2626', fontWeight: 600 }}>↑ +{delta.toFixed(1)}h (Increased)</span>
                      ) : (
                        <span style={{ color: '#15803D', fontWeight: 600 }}>↓ {delta.toFixed(1)}h (Decreased)</span>
                      )}
                    </td>
                    <td style={{ padding: '0.5rem 0.75rem' }}>{statusBadge}</td>
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
