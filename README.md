# CloudPedagogy Curriculum Simulation Tool (CST)

A local-first web application for exploring and modelling student workload distribution, assessment clustering, and competency scaffolding across academic curriculum configurations.

## 🔗 Role in the CloudPedagogy Ecosystem

**Phase:** Phase 1 — Curriculum Spine

**Role:**
Enables programme directors, curriculum designers, and teaching teams to stress-test alternative curriculum configurations before institutional submission or approval.

**Upstream Inputs:**
Structural curriculum data from the **Curriculum Alignment & Mapping Engine (CAME)**.

**Downstream Outputs:**
Scenario risk signals and configuration trade-off reports for the **Programme Governance Dashboard (PGD)** and **Curriculum Change Manager (CCM)**.

**Boundaries (Does NOT do):**
- Define formal structural alignment or taxonomic verb mappings (handled by **CAME**).
- Act as an institutional master module syllabus catalogue (handled by **SMRS**).
- Route formal curriculum approval workflows or committee ballots (handled by **CCM**).
- Compute institutional governance health scores or annual monitoring dashboards (handled by **PGD**).
- Track individualized student elective choices or learning paths (handled by **PPE**).
- Automate curriculum redesign through algorithmic optimisation (handled by **AACRT**).

---

## 🚀 Overview & Key Capabilities (Batches 1 & 2)

1. **Blank-First Onboarding & Workspace Foundations:**
   - Default blank canvas allowing educators to create an empty programme from scratch.
   - Option to upload existing JSON workspaces or curriculum datasets (`Schema 1.0.0`).
   - Distinct, clearly labelled sample demonstration mode.

2. **Protected Baseline Isolation & Multi-Scenario Management:**
   - Formal schema specification (`1.0.0`) with runtime Zod validation.
   - Immutable baseline protection: edits made in alternative scenarios never mutate the baseline curriculum.
   - Dedicated deep-cloning and defensive in-memory state preservation.
   - Branch alternative scenarios from baseline; duplicate, rename, reset, and delete with confirmation.
   - Explicit, audited baseline replacement with pre-replacement backup export.

3. **Credible Workload Simulation & Credit Reconciliation:**
   - Strict adherence to the standard UK higher education credit convention: **one UK credit represents ten notional learning hours** (e.g. 60 credits = 600 notional hours).
   - Clear, transparent distinction between total notional learning hours and hours scheduled within the simulated 12-week teaching period (e.g. 500 teaching block hours + 100 independent study, reading, and revision hours).
   - Authoritative planning thresholds: **Overload** ($\ge 45\text{h}$), **High** ($\ge 35\text{h}$), **Standard Planning Target** ($40\text{h}$), **Moderate** ($20\text{h}$), **Spike Delta** ($\ge 15\text{h}$ jump between adjacent weeks).
   - Consistent persona scaling across all analytical panels: Full-time (1.0x), Part-time (0.5x), Intensive (1.2x).
   - Missing profile data is rigorously distinguished from confirmed zero workload.

4. **Direct Scenario Authoring & Modelling:**
   - **Cell-level workload editing:** Directly modify individual weekly hours across all 12 weeks for any module.
   - **Hour redistribution tools:** "Distribute Evenly" across all teaching weeks and "Smooth Peak Weeks" to cap peaks and relieve pressure.
   - **Assessment editing:** Move deadlines (Weeks 1–12), adjust grading weights (0–100%), modify evaluation types, or add new assessment tasks.
   - **Module management with referential integrity cascade:** Add modules, adjust credits with live notional-hour recalculation, or delete modules with automatic cascade removing associated workload profiles and assessments.
   - **Reset alternative scenario:** Revert any scenario to its protected baseline reference state with confirmation.

5. **Assessment Congestion & Credit-Weighted Programme Pressure:**
   - Calculates true programme-wide assessment pressure using credit-weighting: $\text{Programme Weight}_a = W_a \times \frac{C_m}{C_{\text{total}}}$, avoiding invalid percentage sums across unrelated modules.
   - Transparent congestion rules: 3+ deadlines in a single week, or 2+ deadlines across distinct modules with $\ge 20\%$ total programme assessment load.
   - Explicit identification of high-stakes deadlines ($\ge 40\%$ module weight or $\ge 25\%$ programme assessment load).
   - Distinguishes unassigned assessments (missing teaching week) from confirmed absence of deadlines.

6. **Honest Skill Exposure & Assessment Evidence:**
   - Completely removes misleading pseudo-mathematical "% mastery" calculations.
   - Transparent curriculum exposure metrics: number of modules addressing each competency, active practice weeks, and developmental sequence (Introduction $\rightarrow$ Reinforcement $\rightarrow$ Integrated Practice).
   - Maps documented assessment evidence for each competency.
   - Pedagogical distinction: repeated exposure represents structured opportunities to practice; it does not guarantee demonstrated student competence without supporting assessment evidence.

7. **Multi-Scenario Comparison Dashboard:**
   - Flexible configuration selectors: Baseline vs Scenario A, Scenario A vs Scenario B, or custom scenario comparisons.
   - Comparative metrics grid: scheduled workload delta, peak pressure delta, overload weeks delta ($\ge 45\text{h}$), congested weeks delta, credit delta, and module counts.
   - **Responsive SVG Workload Pressure Curve:** Contrasts weekly workload curves with dual visual encoding (solid line + circle markers for Config A; dashed line + diamond markers for Config B) so visualisations do not rely on colour alone. Includes 40h standard target and 45h overload threshold reference lines.
   - **Accessible tabular equivalent:** Comprehensive semantic comparison table with explicit text direction indicators (`↑ Increased`, `↓ Decreased`, `= Unchanged`) and threshold status badges.

8. **Rule-Based Planning Suggestions:**
   - Replaced speculative "AI" labels with transparent, deterministic pedagogical planning heuristics.
   - Actionable, verified mutations: assessment deadline redistribution, workload peak smoothing, and assessment evidence generation for unassessed competencies.
   - Clear educational rationales and modelled impact summaries for every recommendation.

---

## 📊 Simulation Methodology & Planning Assumptions

All calculations in CST are deterministic, reproducible, and transparent:

### UK Credit & Notional Hour Convention
- $1\text{ UK Credit} = 10\text{ Notional Learning Hours}$.
- A standard 60-credit term represents 600 notional learning hours.
- In the calibrated baseline model, 500 hours are scheduled across the 12-week teaching block (~41.7h/week average for a full-time student), with 100 hours allocated for pre-term preparation, reading/consolidation periods, and post-term examination revision.
- CST transparently displays this reconciliation and does not treat non-teaching independent hours as an error.

### Workload Thresholds (Planning Assumptions)
- **Overload Threshold:** $\ge 45.0\text{h}$ total weekly study time.
- **High Workload Threshold:** $\ge 35.0\text{h}$ total weekly study time.
- **Standard Planning Target:** $40.0\text{h}$ full-time study target.
- **Moderate Threshold:** $\ge 20.0\text{h}$ total weekly study time.
- **Workload Spike:** An increase of $\ge 15.0\text{h}$ between adjacent teaching weeks.
- **Sustained Overload:** 3 or more consecutive weeks with total workload $\ge 35.0\text{h}$.
- *Note:* These thresholds represent illustrative planning assumptions, not universal institutional standards.

### Assessment Congestion Criteria
- **Congested Week:** $\ge 3$ assessment deadlines in the same week, or $\ge 2$ deadlines across distinct modules with $\ge 20\%$ total programme assessment load.
- **High-Stakes Week:** Any week containing an individual module assessment with $\ge 40\%$ weight, or a combined programme assessment load $\ge 25\%$.
- **Programme Assessment Load:** Calculated as $(W_a \times C_m) / C_{\text{total}}$.

### Current Academic Calendar Limitations
- CST currently models curriculum workload and assessments across a **12-week teaching period**.
- Future roadmap phases (Curriculum Studio integration) will support multi-term and variable-length academic calendar structures as institutional requirements dictate.

---

## 🔮 Roadmap: Remaining Hardening (Batch 3)

- **Batch 1 (Completed):** Versioned data foundations (`Schema 1.0.0`), baseline isolation, multi-scenario branching, JSON import/export, blank-first onboarding, calibrated demo data, and storage resilience.
- **Batch 2 (Completed):** Authoritative workload reconciliation, threshold boundary rigor, credit-weighted assessment congestion, honest skill exposure, cell-level scenario editing, multi-scenario comparison dashboard, responsive SVG pressure curves with accessible tabular equivalents, and rule-based planning heuristics.
- **Batch 3 (Planned Hardening):** Full WCAG 2.1 AA accessibility audit, cross-browser compatibility verification, responsive design polish, and performance benchmarking.

---

## 🛠️ Verification & Quality Checks

Run the verification pipeline:

```bash
git diff --check
npm test
npm run typecheck
npm run lint
npm run build
```


### Prerequisites
- Node.js (v18+)
- npm

### Installation
```bash
git clone https://github.com/cloudpedagogy/cloudpedagogy-curriculum-simulation-tool.git
cd cloudpedagogy-curriculum-simulation-tool
npm install
```

### Running Locally
```bash
npm run dev
```

### Verification Pipeline
All changes must pass the full five-check verification pipeline:
```bash
git diff --check     # Check whitespace and formatting
npm test             # Run Vitest automated test suite (57 tests)
npm run typecheck    # Run TypeScript compiler verification (tsc -b)
npm run lint         # Run ESLint with zero errors or warnings
npm run build        # Build production bundle with Vite
```

### Browser Automation & Acceptance Status
- The test suite comprises **57 passing automated tests** across unit, schema, storage, simulation calculations, threshold boundaries, scenario editing, redistribution integrity, comparisons, and component rendering in a jsdom environment.
- Due to headless browser Chrome DevTools Protocol (CDP) connection limitations in the current local environment, end-to-end real browser automation was not executed during this verification cycle.
- **No formal accessibility certification or full production release readiness is claimed.** Manual cross-browser validation remains required prior to formal release.


---

## 📜 Licensing & Scope

This repository contains open-source software released under the **MIT License**.

All applications run locally in the user's browser. No user data is collected, stored remotely, or transmitted.
Synthetic demonstration data is illustrative and does not represent any real institution or programme.
