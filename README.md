# CloudPedagogy Curriculum Simulation Tool (CST)

A local-first web application for exploring, stress-testing, and comparing student workload distribution, assessment deadline concentration, and competency scaffolding across academic curriculum configurations.

## 🔗 Role in the CloudPedagogy Ecosystem

**Phase:** Phase 1 — Curriculum Spine

**Role:**
Enables programme directors, curriculum designers, and quality assurance committees to stress-test alternative curriculum configurations before institutional submission or approval.

**Upstream Inputs:**
Structural curriculum data from the **Curriculum Alignment & Mapping Engine (CAME)**.

**Downstream Outputs:**
Scenario risk signals, briefing exports, and configuration trade-off reports for the **Programme Governance Dashboard (PGD)** and **Curriculum Change Manager (CCM)**.

**Boundaries (Does NOT do):**
- Define formal structural alignment or taxonomic verb mappings (handled by **CAME**).
- Act as an institutional master module syllabus catalogue (handled by **SMRS**).
- Route formal curriculum approval workflows or committee ballots (handled by **CCM**).
- Compute institutional governance health scores or annual monitoring dashboards (handled by **PGD**).
- Track individualised student elective choices or learning paths (handled by **PPE**).
- Automate curriculum redesign through algorithmic optimisation (handled by **AACRT**).
- Connect to commercial Curriculum Studio cloud services or server backends (handled by the commercial platform).

---

## 🚀 Overview & Key Capabilities (Batches 1, 2 & 3)

1. **Blank-First Onboarding & Workspace Foundations:**
   - Default blank canvas allowing educators to create an empty programme from scratch.
   - Option to upload existing JSON workspaces or curriculum datasets (`Schema 1.0.0`).
   - Distinct, clearly labelled sample demonstration mode.

2. **Protected Baseline Isolation & Multi-Scenario Management:**
   - Formal schema specification (`1.0.0`) with runtime Zod validation.
   - Immutable baseline protection: edits made in alternative scenarios never mutate the reference curriculum.
   - Dedicated deep-cloning and defensive in-memory state preservation.
   - Branch alternative scenarios from baseline; duplicate, rename, reset, and delete with accessible confirmation dialogues.
   - Explicit, audited baseline replacement with pre-replacement backup export.

3. **Credible Workload Simulation & Credit Reconciliation:**
   - Strict adherence to the standard UK higher education credit convention: **one UK credit represents ten notional learning hours** (e.g. 60 credits = 600 notional hours).
   - Clear, transparent distinction between total notional learning hours and hours scheduled within the simulated 12-week teaching period (e.g. 500 teaching block hours + 100 independent study, reading, and revision hours).
   - Authoritative planning thresholds: **Overload** ($\ge 45\text{h}$), **High Pressure** ($\ge 35\text{h}$), **Standard Planning Target** ($40\text{h}$), **Moderate** ($20\text{h}$), **Spike Delta** ($\ge 15\text{h}$ jump between adjacent weeks).
   - Consistent persona scaling across all analytical panels: Full-time (1.0x), Part-time (0.5x), Intensive (1.2x).
   - Missing profile data is rigorously distinguished from confirmed zero workload.

4. **Direct Scenario Authoring & Modelling:**
   - **Cell-level workload editing:** Directly modify individual weekly hours across all 12 weeks for any module with accessible keyboard labels.
   - **Hour redistribution tools:** "Distribute Evenly" across all teaching weeks and "Smooth Peak Weeks" to cap peaks and relieve pressure.
   - **Assessment editing:** Move deadlines (Weeks 1–12), adjust grading weights (0–100%), modify evaluation types, or add new assessment tasks.
   - **Module management with referential integrity cascade:** Add modules, adjust credits with live notional-hour recalculation, or delete modules with automatic cascade removing associated workload profiles and assessments.
   - **Reset alternative scenario:** Revert any scenario to its protected baseline reference state with accessible confirmation.

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
   - **Accessible tabular equivalent:** Comprehensive semantic comparison table with column and row scopes, focusable horizontal scroll region, and explicit text direction indicators (`↑ Increased`, `↓ Decreased`, `= Unchanged`).

8. **Scenario Comparison Briefing Export (New in Batch 3):**
   - **Markdown Export (`.md`):** Comprehensive, publication-ready briefing document suitable for embedding in committee papers, validation documentation, or revision histories.
   - **Standalone Printable HTML Export (`.html`):** Self-contained document containing embedded CSS, clean typography, A4 print rules, and strict XSS sanitisation for all user-supplied text.
   - **Browser Print / PDF View:** Direct print stylesheet integration for one-click browser printing or Save as PDF via native print dialogue.
   - **Executive Content:** Metadata, executive metrics table, 12-week workload profile, recorded governance reflections (assumptions, rationale, risks, review notes), planning signals, and transparent simulation methodology explanation.

9. **Accessibility & Responsive Usability (New in Batch 3):**
   - Architectural alignment with WCAG 2.2 AA (minimum WCAG 2.1 AA) guidelines.
   - Keyboard skip link (`Skip to main content`).
   - High-contrast visible keyboard focus indicators (`outline: 2px solid #2563EB`).
   - 9 distinct accessible modal dialogues via `AccessibleModal` with focus trapping, Escape dismissal, background scroll lock, non-destructive initial focus, and focus restoration.
   - Complete WAI-ARIA APG tab pattern with roving tabindex and ArrowLeft/ArrowRight/Home/End keyboard navigation in Scenario Editor; semantic navigation and toggle buttons (`aria-pressed`) in Scenario Manager.
   - Native dialogue replacement: elimination of `window.confirm` and `alert` in favour of accessible modal dialogues and screen-reader live regions (`role="status"`, `role="alert"`).
   - Full responsiveness across desktop, tablet, and mobile viewports, including 200% browser zoom support and `@media (prefers-reduced-motion: reduce)` compliance.

10. **Rule-Based Planning Suggestions:**
    - Deterministic, transparent pedagogical planning heuristics (never speculative or generative AI).
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
- **High Pressure Threshold:** $\ge 35.0\text{h}$ total weekly study time.
- **Standard Planning Target:** $40.0\text{h}$ full-time study target.
- **Moderate Threshold:** $\ge 20.0\text{h}$ total weekly study time.
- **Workload Spike:** An increase of $\ge 15.0\text{h}$ between adjacent teaching weeks.
- **Sustained Overload:** 3 or more consecutive weeks with total workload $\ge 35.0\text{h}$.
- *Note:* These thresholds represent illustrative planning assumptions, not universal institutional standards.

### Assessment Congestion Criteria
- **Congested Week:** $\ge 3$ assessment deadlines in the same week, or $\ge 2$ deadlines across distinct modules with $\ge 20\%$ total programme assessment load.
- **High-Stakes Week:** Any week containing an individual module assessment with $\ge 40\%$ weight, or a combined programme assessment load $\ge 25\%$.
- **Programme Assessment Load:** Calculated as $(W_a \times C_m) / C_{\text{total}}$.

### Current Academic Calendar Scope
- CST models curriculum workload and assessments across a standard **12-week teaching period**.
- Pre-sessional reading, consolidation weeks, and formal post-term exam periods are treated as independent learning unless scheduled within the 12-week profile.

---

## 🛠️ Installation & Verification

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

### Full Verification Pipeline
All changes must pass the full five-check verification pipeline:
```bash
git diff --check     # Check whitespace and formatting
npm test             # Run Vitest automated test suite (74 tests)
npm run typecheck    # Run TypeScript compiler verification (tsc -b)
npm run lint         # Run ESLint with zero errors or warnings
npm run build        # Build production bundle with Vite
```

### Acceptance & Test Coverage Status
- **Automated Tests:** **74 passing automated tests** across 7 test files covering schema validation, storage recovery, workload reconciliation, threshold boundaries, assessment congestion, skill exposure, scenario branching, briefing export (Markdown & HTML), XSS escaping, modal focus trapping, accessible table semantics, ARIA tab navigation, opener security, and large dataset scalability (12 modules, 50 assessments).
- **Manual Verification Status:** Automated tests execute in JSDOM. Hands-on cross-browser verification (macOS Safari, Google Chrome) and assistive technology testing (Apple VoiceOver, Windows NVDA) remain required for formal institutional acceptance. A manual cross-browser acceptance checklist is provided in `USER_MANUAL.md`.
- **Notice:** Conformance with WCAG 2.2 AA is targeted in design and automated tests; formal conformance cannot be certified without an external audit. Commercial Curriculum Studio integration is out of scope.

---

## 📜 Licensing & Scope

This repository contains open-source software released under the **MIT License**.

All applications run locally in the user's browser. No user data is collected, stored remotely, or transmitted.
Synthetic demonstration data is illustrative and does not represent any real institution or programme.
