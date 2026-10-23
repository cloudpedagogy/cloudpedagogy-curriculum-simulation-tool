/**
 * CloudPedagogy Curriculum Simulation Tool (CST)
 * Scenario Comparison Briefing Export
 *
 * Generates self-contained, publication-ready briefing reports in Markdown (.md),
 * standalone printable HTML (.html), and browser print view.
 *
 * Implements strict XSS sanitisation for all user-authored strings.
 */

import type { SimulationDataset } from '../../types';

export interface BriefingReportData {
  curriculumTitle: string;
  generatedAt: string;
  config1: {
    name: string;
    isBaseline: boolean;
    dataset: SimulationDataset;
  };
  config2: {
    name: string;
    isBaseline: boolean;
    dataset: SimulationDataset;
  };
  persona: {
    name: string;
    workloadMultiplier: number;
  };
  metrics: {
    credits1: number;
    credits2: number;
    creditsDelta: number;
    totalHours1: number;
    totalHours2: number;
    totalDelta: number;
    peak1: { week: number; hours: number };
    peak2: { week: number; hours: number };
    peakDelta: number;
    overloadWeeks1: number;
    overloadWeeks2: number;
    overloadDelta: number;
    highWeeks1: number;
    highWeeks2: number;
    highDelta: number;
    modules1: number;
    modules2: number;
    modulesDelta: number;
    asmts1: number;
    asmts2: number;
    asmtsDelta: number;
    congestedWeeks1: number;
    congestedWeeks2: number;
    congestedDelta: number;
    reinforcedSkills1: number;
    reinforcedSkills2: number;
    reinforcedSkillsDelta: number;
    isIdentical: boolean;
  };
  weeklyWorkload: Array<{
    week: number;
    hours1: number;
    hours2: number;
    delta: number;
    thresholdStatus: string;
  }>;
  rationaleNotes?: {
    scenarioDescription?: string;
    assumptions?: string;
    rationale?: string;
    risks?: string;
    reviewNotes?: string;
    aiInvolvement?: string;
  };
  validationWarnings?: string[];
}

/**
 * Escapes characters with special meaning in HTML to prevent XSS.
 */
export function escapeHtml(str: string | null | undefined): string {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Helper to format signed deltas with appropriate text markers.
 */
function formatSignedDelta(val: number, unit = ''): string {
  if (Math.abs(val) < 0.001) return `0${unit} (Unchanged)`;
  const sign = val > 0 ? '+' : '';
  const dir = val > 0 ? '↑ Increased' : '↓ Decreased';
  return `${dir}: ${sign}${val.toFixed(1)}${unit}`;
}

/**
 * Generates a comprehensive Markdown report.
 */
export function generateBriefingMarkdown(data: BriefingReportData): string {
  const { curriculumTitle, generatedAt, config1, config2, persona, metrics, weeklyWorkload, rationaleNotes } = data;

  const lines: string[] = [];

  lines.push(`# Curriculum Scenario Comparison Briefing`);
  lines.push(`**Programme:** ${curriculumTitle || 'Curriculum Workspace'}`);
  lines.push(`**Generated:** ${generatedAt}`);
  lines.push(`**Active Persona:** ${persona.name} (${(persona.workloadMultiplier * 100).toFixed(0)}% load multiplier)`);
  lines.push(``);
  lines.push(`---`);
  lines.push(``);

  lines.push(`## 1. Configurations Under Review`);
  lines.push(`- **Configuration A (Reference):** ${config1.name}${config1.isBaseline ? ' *(Protected Baseline)*' : ''}`);
  lines.push(`- **Configuration B (Proposed):** ${config2.name}${config2.isBaseline ? ' *(Protected Baseline)*' : ''}`);
  if (rationaleNotes?.scenarioDescription) {
    lines.push(`- **Description of Proposed Change:** ${rationaleNotes.scenarioDescription}`);
  }
  if (metrics.isIdentical) {
    lines.push(`\n> **Note:** Configuration A and Configuration B are identical in curriculum structure and scheduled workload.`);
  }
  lines.push(``);

  lines.push(`## 2. Executive Metric Summary`);
  lines.push(`| Metric | Configuration A | Configuration B | Difference (B - A) |`);
  lines.push(`| :--- | :--- | :--- | :--- |`);
  lines.push(`| **Curriculum Credits** | ${metrics.credits1} credits | ${metrics.credits2} credits | ${formatSignedDelta(metrics.creditsDelta, ' credits')} |`);
  lines.push(`| **Module Count** | ${metrics.modules1} modules | ${metrics.modules2} modules | ${formatSignedDelta(metrics.modulesDelta, ' modules')} |`);
  lines.push(`| **Assessment Count** | ${metrics.asmts1 ?? 0} tasks | ${metrics.asmts2 ?? 0} tasks | ${formatSignedDelta(metrics.asmtsDelta ?? 0, ' tasks')} |`);
  lines.push(`| **Total Scheduled Workload** | ${(metrics.totalHours1 ?? 0).toFixed(1)}h | ${(metrics.totalHours2 ?? 0).toFixed(1)}h | ${formatSignedDelta(metrics.totalDelta ?? 0, 'h')} |`);
  lines.push(`| **Peak Weekly Workload** | ${(metrics.peak1?.hours ?? 0).toFixed(1)}h (Week ${metrics.peak1?.week ?? 1}) | ${(metrics.peak2?.hours ?? 0).toFixed(1)}h (Week ${metrics.peak2?.week ?? 1}) | ${formatSignedDelta(metrics.peakDelta ?? 0, 'h')} |`);
  lines.push(`| **Overload Weeks (≥ 45h)** | ${metrics.overloadWeeks1 ?? 0} weeks | ${metrics.overloadWeeks2 ?? 0} weeks | ${formatSignedDelta(metrics.overloadDelta ?? 0, ' weeks')} |`);
  lines.push(`| **High Pressure Weeks (≥ 35h)** | ${metrics.highWeeks1 ?? 0} weeks | ${metrics.highWeeks2 ?? 0} weeks | ${formatSignedDelta(metrics.highDelta ?? 0, ' weeks')} |`);
  lines.push(`| **Congested Assessment Weeks** | ${metrics.asmts1 === 0 ? 'N/A' : `${metrics.congestedWeeks1 ?? 0} weeks`} | ${metrics.asmts2 === 0 ? 'N/A' : `${metrics.congestedWeeks2 ?? 0} weeks`} | ${metrics.asmts1 === 0 || metrics.asmts2 === 0 ? 'Unavailable (unmapped assessment data)' : formatSignedDelta(metrics.congestedDelta ?? 0, ' weeks')} |`);
  lines.push(`| **Reinforced Skills (≥ 2 modules)** | ${metrics.reinforcedSkills1 ?? 0} skills | ${metrics.reinforcedSkills2 ?? 0} skills | ${formatSignedDelta(metrics.reinforcedSkillsDelta ?? 0, ' skills')} |`);
  lines.push(``);

  lines.push(`## 3. Weekly Teaching-Period Workload Profile`);
  lines.push(`| Week | Config A (${config1.name}) | Config B (${config2.name}) | Difference | Threshold Status |`);
  lines.push(`| :--- | :--- | :--- | :--- | :--- |`);
  weeklyWorkload.forEach(row => {
    const deltaStr = Math.abs(row.delta) < 0.01 ? '= 0.0h' : (row.delta > 0 ? `+${row.delta.toFixed(1)}h` : `${row.delta.toFixed(1)}h`);
    lines.push(`| Week ${row.week} | ${row.hours1.toFixed(1)}h | ${row.hours2.toFixed(1)}h | ${deltaStr} | ${row.thresholdStatus} |`);
  });
  lines.push(``);

  lines.push(`## 4. Governance, Assumptions & Rationale`);
  if (rationaleNotes) {
    if (rationaleNotes.rationale) {
      lines.push(`### Pedagogical Rationale`);
      lines.push(rationaleNotes.rationale);
      lines.push(``);
    }
    if (rationaleNotes.assumptions) {
      lines.push(`### Structural Assumptions`);
      lines.push(rationaleNotes.assumptions);
      lines.push(``);
    }
    if (rationaleNotes.risks) {
      lines.push(`### Identified Risks & Considerations`);
      lines.push(rationaleNotes.risks);
      lines.push(``);
    }
    if (rationaleNotes.reviewNotes) {
      lines.push(`### Academic Review Notes`);
      lines.push(rationaleNotes.reviewNotes);
      lines.push(``);
    }
    if (rationaleNotes.aiInvolvement) {
      lines.push(`### AI Involvement & Capability Disclosure`);
      lines.push(rationaleNotes.aiInvolvement);
      lines.push(``);
    }
  }
  if (!rationaleNotes || (!rationaleNotes.rationale && !rationaleNotes.assumptions && !rationaleNotes.risks && !rationaleNotes.reviewNotes)) {
    lines.push(`*No specific pedagogical rationale or structural assumptions were recorded for this configuration.*`);
    lines.push(``);
  }

  lines.push(`## 5. Planning Signals & Model Warnings`);
  if (data.validationWarnings && data.validationWarnings.length > 0) {
    data.validationWarnings.forEach(warn => {
      lines.push(`- **Warning:** ${warn}`);
    });
  } else {
    lines.push(`- No critical data validation anomalies detected in the selected configurations.`);
  }
  if (metrics.peak2.hours >= 45) {
    lines.push(`- **Workload Warning:** Configuration B exhibits an overload spike of ${metrics.peak2.hours.toFixed(1)}h in Week ${metrics.peak2.week}, exceeding the 45h threshold.`);
  }
  if (metrics.congestedWeeks2 > 0) {
    lines.push(`- **Deadline Concentration:** Configuration B contains ${metrics.congestedWeeks2} congested assessment week(s) where multiple submissions coincide.`);
  }
  lines.push(``);

  lines.push(`## 6. Simulation Methodology & Limitations`);
  lines.push(`1. **12-Week Teaching Period:** CST models weekly student effort across a standard 12-week teaching block. Independent reading periods, consolidation weeks, and formal post-term exam periods are excluded unless explicitly scheduled within the 12-week profile.`);
  lines.push(`2. **Credit-to-Notional-Hour Ratio:** In accordance with standard UK Higher Education frameworks, 1 credit corresponds to 10 notional learning hours (e.g. 60 credits = 600 total hours). The teaching-period profile accounts for scheduled delivery and structured study during term time.`);
  lines.push(`3. **Workload Thresholds:** Weekly load is evaluated against full-time illustrative benchmarks: standard planning target (< 35h/wk), high pressure (35–44h/wk), and overload (≥ 45h/wk).`);
  lines.push(`4. **Persona Multipliers:** Persona adjustments simulate heterogeneous student circumstances (e.g. working learners requiring extra pacing or part-time adjustments). Multipliers are illustrative stress tests, not empirical individual measurements.`);
  lines.push(`5. **Assessment Concentration:** Flagged weeks represent concurrent submission deadlines and credit-weighted grading share. Deadlines clustering does not directly measure student cognitive difficulty.`);
  lines.push(`6. **Skill Exposure vs Competence:** Skill metrics indicate exposure through learning activities in the syllabus, not verified student competence or accredited mastery.`);
  lines.push(``);
  lines.push(`---`);
  lines.push(`*CloudPedagogy Curriculum Simulation Tool · Independent Academic Planning Report*`);

  return lines.join('\n');
}

/**
 * Generates standalone, printable, fully styled HTML report with XSS protection.
 */
export function generateBriefingHtml(data: BriefingReportData): string {
  const { curriculumTitle, generatedAt, config1, config2, persona, metrics, weeklyWorkload, rationaleNotes } = data;

  const escapedTitle = escapeHtml(curriculumTitle || 'Curriculum Workspace');
  const escapedConfig1 = escapeHtml(config1.name);
  const escapedConfig2 = escapeHtml(config2.name);
  const escapedPersona = escapeHtml(persona.name);

  const rowsHtml = weeklyWorkload.map(row => {
    const deltaStr = Math.abs(row.delta) < 0.01
      ? '= 0.0h'
      : (row.delta > 0 ? `+${row.delta.toFixed(1)}h` : `${row.delta.toFixed(1)}h`);
    const isOverload = row.thresholdStatus.includes('Overload');
    const isHigh = row.thresholdStatus.includes('High');
    const statusColor = isOverload ? '#DC2626' : (isHigh ? '#D97706' : '#475569');

    return `<tr>
      <td style="font-weight: 600;">Week ${row.week}</td>
      <td>${row.hours1.toFixed(1)}h</td>
      <td style="font-weight: 600;">${row.hours2.toFixed(1)}h</td>
      <td style="font-weight: 600; color: ${row.delta > 0 ? '#DC2626' : (row.delta < 0 ? '#15803D' : '#475569')};">${deltaStr}</td>
      <td style="color: ${statusColor}; font-weight: 500;">${escapeHtml(row.thresholdStatus)}</td>
    </tr>`;
  }).join('\n');

  const governanceSectionsHtml: string[] = [];
  if (rationaleNotes?.rationale) {
    governanceSectionsHtml.push(`
      <div class="note-box">
        <h3>Pedagogical Rationale</h3>
        <p>${escapeHtml(rationaleNotes.rationale)}</p>
      </div>
    `);
  }
  if (rationaleNotes?.assumptions) {
    governanceSectionsHtml.push(`
      <div class="note-box">
        <h3>Structural Assumptions</h3>
        <p>${escapeHtml(rationaleNotes.assumptions)}</p>
      </div>
    `);
  }
  if (rationaleNotes?.risks) {
    governanceSectionsHtml.push(`
      <div class="note-box">
        <h3>Identified Risks &amp; Considerations</h3>
        <p>${escapeHtml(rationaleNotes.risks)}</p>
      </div>
    `);
  }
  if (rationaleNotes?.reviewNotes) {
    governanceSectionsHtml.push(`
      <div class="note-box">
        <h3>Academic Review Notes</h3>
        <p>${escapeHtml(rationaleNotes.reviewNotes)}</p>
      </div>
    `);
  }
  if (rationaleNotes?.aiInvolvement) {
    governanceSectionsHtml.push(`
      <div class="note-box">
        <h3>AI Involvement &amp; Capability Disclosure</h3>
        <p>${escapeHtml(rationaleNotes.aiInvolvement)}</p>
      </div>
    `);
  }

  const warningsHtml = (data.validationWarnings && data.validationWarnings.length > 0)
    ? `<ul>${data.validationWarnings.map(w => `<li><strong>Warning:</strong> ${escapeHtml(w)}</li>`).join('')}</ul>`
    : `<p>No critical data validation anomalies detected in the selected configurations.</p>`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Curriculum Scenario Comparison: ${escapedConfig1} vs ${escapedConfig2}</title>
  <style>
    :root {
      --primary: #1E293B;
      --secondary: #2563EB;
      --text: #1E293B;
      --text-muted: #64748B;
      --border: #CBD5E1;
      --bg-subtle: #F8FAFC;
    }
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      color: var(--text);
      background-color: #FFFFFF;
      line-height: 1.5;
      padding: 2.5rem 3rem;
      max-width: 960px;
      margin: 0 auto;
    }
    header {
      border-bottom: 2px solid var(--border);
      padding-bottom: 1.5rem;
      margin-bottom: 2rem;
    }
    .badge {
      display: inline-block;
      font-size: 0.75rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: #2563EB;
      margin-bottom: 0.5rem;
    }
    h1 {
      font-size: 1.75rem;
      font-weight: 700;
      color: #0F172A;
      margin-bottom: 0.5rem;
    }
    .meta-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 0.75rem;
      margin-top: 1rem;
      font-size: 0.875rem;
      color: var(--text-muted);
    }
    .meta-item strong {
      color: var(--text);
    }
    h2 {
      font-size: 1.25rem;
      font-weight: 600;
      margin: 2rem 0 1rem;
      color: #0F172A;
      border-bottom: 1px solid var(--border);
      padding-bottom: 0.4rem;
    }
    h3 {
      font-size: 0.95rem;
      font-weight: 600;
      margin-bottom: 0.35rem;
      color: #1E293B;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 0.875rem;
      margin-bottom: 1.5rem;
    }
    th, td {
      padding: 0.6rem 0.75rem;
      border: 1px solid var(--border);
      text-align: left;
    }
    th {
      background-color: var(--bg-subtle);
      font-weight: 600;
      color: #0F172A;
    }
    tr:nth-child(even) td {
      background-color: #FAFBFD;
    }
    .note-box {
      background: var(--bg-subtle);
      border-left: 4px solid var(--secondary);
      padding: 0.85rem 1.1rem;
      margin-bottom: 1rem;
      border-radius: 0 4px 4px 0;
      font-size: 0.875rem;
    }
    .note-box p {
      color: #334155;
      white-space: pre-wrap;
    }
    .methodology-list {
      font-size: 0.85rem;
      color: #334155;
      padding-left: 1.25rem;
    }
    .methodology-list li {
      margin-bottom: 0.5rem;
    }
    footer {
      margin-top: 3rem;
      padding-top: 1.5rem;
      border-top: 1px solid var(--border);
      font-size: 0.75rem;
      color: var(--text-muted);
      text-align: center;
    }
    @media print {
      body {
        padding: 0;
        max-width: 100%;
        font-size: 10pt;
      }
      h1 { font-size: 16pt; }
      h2 { font-size: 12pt; page-break-after: avoid; }
      th, td { padding: 4pt 6pt; }
      .no-print { display: none !important; }
      table { page-break-inside: auto; }
      tr { page-break-inside: avoid; page-break-after: auto; }
    }
  </style>
</head>
<body>
  <div class="no-print" style="margin-bottom: 1.5rem; display: flex; justify-content: flex-end; gap: 0.5rem;">
    <button onclick="window.print()" style="padding: 0.5rem 1rem; background: #2563EB; color: #FFFFFF; border: none; border-radius: 4px; font-weight: 600; cursor: pointer;">
      Print / Save as PDF
    </button>
  </div>

  <header>
    <div class="badge">CloudPedagogy · Curriculum Simulation Tool</div>
    <h1>Scenario Comparison Briefing</h1>
    <div class="meta-grid">
      <div class="meta-item">Programme: <strong>${escapedTitle}</strong></div>
      <div class="meta-item">Date: <strong>${escapeHtml(generatedAt)}</strong></div>
      <div class="meta-item">Persona: <strong>${escapedPersona} (${(persona.workloadMultiplier * 100).toFixed(0)}%)</strong></div>
    </div>
  </header>

  <section>
    <h2>1. Configurations Under Review</h2>
    <div style="font-size: 0.875rem; margin-bottom: 1rem;">
      <p><strong>Configuration A (Reference):</strong> ${escapedConfig1}${config1.isBaseline ? ' <em>(Protected Baseline)</em>' : ''}</p>
      <p style="margin-top: 0.35rem;"><strong>Configuration B (Proposed):</strong> ${escapedConfig2}${config2.isBaseline ? ' <em>(Protected Baseline)</em>' : ''}</p>
      ${rationaleNotes?.scenarioDescription ? `<p style="margin-top: 0.5rem;"><strong>Description:</strong> ${escapeHtml(rationaleNotes.scenarioDescription)}</p>` : ''}
      ${metrics.isIdentical ? `<p style="margin-top: 0.5rem; padding: 0.5rem; background: #EFF6FF; border: 1px solid #BFDBFE; border-radius: 4px;">ℹ️ Configuration A and Configuration B are identical in curriculum structure and scheduled workload.</p>` : ''}
    </div>
  </section>

  <section>
    <h2>2. Executive Metric Summary</h2>
    <table>
      <thead>
        <tr>
          <th>Metric</th>
          <th>Configuration A</th>
          <th>Configuration B</th>
          <th>Difference (B - A)</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><strong>Curriculum Credits</strong></td>
          <td>${metrics.credits1} credits</td>
          <td>${metrics.credits2} credits</td>
          <td>${formatSignedDelta(metrics.creditsDelta, ' credits')}</td>
        </tr>
        <tr>
          <td><strong>Module Count</strong></td>
          <td>${metrics.modules1} modules</td>
          <td>${metrics.modules2} modules</td>
          <td>${formatSignedDelta(metrics.modulesDelta, ' modules')}</td>
        </tr>
        <tr>
          <td><strong>Assessment Count</strong></td>
          <td>${metrics.asmts1} tasks</td>
          <td>${metrics.asmts2} tasks</td>
          <td>${formatSignedDelta(metrics.asmtsDelta, ' tasks')}</td>
        </tr>
        <tr>
          <td><strong>Total Scheduled Workload</strong></td>
          <td>${(metrics.totalHours1 ?? 0).toFixed(1)}h</td>
          <td>${(metrics.totalHours2 ?? 0).toFixed(1)}h</td>
          <td>${formatSignedDelta(metrics.totalDelta ?? 0, 'h')}</td>
        </tr>
        <tr>
          <td><strong>Peak Weekly Workload</strong></td>
          <td>${(metrics.peak1?.hours ?? 0).toFixed(1)}h (Week ${metrics.peak1?.week ?? 1})</td>
          <td>${(metrics.peak2?.hours ?? 0).toFixed(1)}h (Week ${metrics.peak2?.week ?? 1})</td>
          <td>${formatSignedDelta(metrics.peakDelta ?? 0, 'h')}</td>
        </tr>
        <tr>
          <td><strong>Overload Weeks (&ge; 45h)</strong></td>
          <td>${metrics.overloadWeeks1 ?? 0} weeks</td>
          <td>${metrics.overloadWeeks2 ?? 0} weeks</td>
          <td>${formatSignedDelta(metrics.overloadDelta ?? 0, ' weeks')}</td>
        </tr>
        <tr>
          <td><strong>High Pressure Weeks (&ge; 35h)</strong></td>
          <td>${metrics.highWeeks1 ?? 0} weeks</td>
          <td>${metrics.highWeeks2 ?? 0} weeks</td>
          <td>${formatSignedDelta(metrics.highDelta ?? 0, ' weeks')}</td>
        </tr>
        <tr>
          <td><strong>Congested Assessment Weeks</strong></td>
          <td>${metrics.asmts1 === 0 ? 'N/A' : `${metrics.congestedWeeks1 ?? 0} weeks`}</td>
          <td>${metrics.asmts2 === 0 ? 'N/A' : `${metrics.congestedWeeks2 ?? 0} weeks`}</td>
          <td>${metrics.asmts1 === 0 || metrics.asmts2 === 0 ? 'Unavailable' : formatSignedDelta(metrics.congestedDelta ?? 0, ' weeks')}</td>
        </tr>
        <tr>
          <td><strong>Reinforced Skills (&ge; 2 modules)</strong></td>
          <td>${metrics.reinforcedSkills1 ?? 0} skills</td>
          <td>${metrics.reinforcedSkills2 ?? 0} skills</td>
          <td>${formatSignedDelta(metrics.reinforcedSkillsDelta ?? 0, ' skills')}</td>
        </tr>
      </tbody>
    </table>
  </section>

  <section>
    <h2>3. Weekly Workload Distribution (12 Teaching Weeks)</h2>
    <table>
      <thead>
        <tr>
          <th>Week</th>
          <th>Config A (${escapedConfig1})</th>
          <th>Config B (${escapedConfig2})</th>
          <th>Difference</th>
          <th>Threshold Status</th>
        </tr>
      </thead>
      <tbody>
        ${rowsHtml}
      </tbody>
    </table>
  </section>

  <section>
    <h2>4. Governance, Assumptions &amp; Pedagogical Rationale</h2>
    ${governanceSectionsHtml.length > 0 ? governanceSectionsHtml.join('\n') : '<p style="font-size: 0.875rem; color: #64748B;"><em>No specific pedagogical rationale or structural assumptions were recorded for this configuration.</em></p>'}
  </section>

  <section>
    <h2>5. Planning Signals &amp; Model Warnings</h2>
    <div style="font-size: 0.875rem; color: #334155;">
      ${warningsHtml}
    </div>
  </section>

  <section>
    <h2>6. Simulation Methodology &amp; Analytical Limits</h2>
    <ol class="methodology-list">
      <li><strong>12-Week Teaching Period:</strong> CST models weekly student effort across a standard 12-week teaching block. Independent reading periods, consolidation weeks, and formal post-term exam periods are excluded unless explicitly scheduled within the 12-week profile.</li>
      <li><strong>Credit-to-Notional-Hour Ratio:</strong> Standard UK Higher Education frameworks assume 1 credit corresponds to 10 notional learning hours (e.g. 60 credits = 600 total hours). The teaching-period profile accounts for scheduled delivery and structured study during term time.</li>
      <li><strong>Workload Thresholds:</strong> Weekly load is evaluated against full-time illustrative benchmarks: standard planning target (&lt; 35h/wk), high pressure (35–44h/wk), and overload (&ge; 45h/wk).</li>
      <li><strong>Persona Multipliers:</strong> Persona adjustments simulate heterogeneous student circumstances (e.g. working learners requiring extra pacing or part-time adjustments). Multipliers are illustrative stress tests, not empirical individual measurements.</li>
      <li><strong>Assessment Concentration:</strong> Flagged weeks represent concurrent submission deadlines and credit-weighted grading share. Deadlines clustering does not directly measure student cognitive difficulty.</li>
      <li><strong>Skill Exposure vs Competence:</strong> Skill metrics indicate exposure through learning activities in the syllabus, not verified student competence or accredited mastery.</li>
    </ol>
  </section>

  <footer>
    CloudPedagogy Curriculum Simulation Tool · Independent Academic Planning Report
  </footer>
</body>
</html>`;
}

/**
 * Triggers browser download of a generated text/blob file.
 */
export function downloadFile(content: string, filename: string, mimeType: string): void {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return;
  }
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}

/**
 * Exports briefing report as Markdown file (.md).
 */
export function exportBriefingMarkdown(data: BriefingReportData): void {
  const content = generateBriefingMarkdown(data);
  const safeTitle = (data.curriculumTitle || 'curriculum').toLowerCase().replace(/[^a-z0-9_-]/g, '_');
  const dateStr = new Date().toISOString().split('T')[0];
  downloadFile(content, `cst-briefing-${safeTitle}-${dateStr}.md`, 'text/markdown;charset=utf-8');
}

/**
 * Exports briefing report as standalone printable HTML file (.html).
 */
export function exportBriefingHtml(data: BriefingReportData): void {
  const content = generateBriefingHtml(data);
  const safeTitle = (data.curriculumTitle || 'curriculum').toLowerCase().replace(/[^a-z0-9_-]/g, '_');
  const dateStr = new Date().toISOString().split('T')[0];
  downloadFile(content, `cst-briefing-${safeTitle}-${dateStr}.html`, 'text/html;charset=utf-8');
}

/**
 * Opens a print-optimised pop-up window or triggers window.print().
 */
export function printBriefing(data: BriefingReportData): void {
  if (typeof window === 'undefined') return;
  const htmlContent = generateBriefingHtml(data);
  const printWindow = window.open('', '_blank');
  if (printWindow) {
    try {
      printWindow.opener = null;
    } catch {
      // In restricted test environments or sandbox modes, opener mutation may be prevented
    }
    printWindow.document.open();
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.focus();
    // Allow styles to register before print dialog triggers
    setTimeout(() => {
      try {
        printWindow.print();
      } catch {
        // Ignore if user cancelled
      }
    }, 250);
  } else {
    // If pop-up blocked, trigger standard window.print
    window.print();
  }
}
