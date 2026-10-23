# Curriculum Simulation Tool — User Manual

## 1. Introduction

The **CloudPedagogy Curriculum Simulation Tool (CST)** is a dedicated application for simulating and comparing academic curriculum configurations. It is designed to help academic programme leaders, curriculum designers, and quality committees explore the consequences of proposed changes—such as moving assessment deadlines, adjusting credit balances, or redistributing teaching weeks—before formal approval.

CST operates **entirely within your local web browser**. No accounts, logins, server backends, or cloud storage are involved.

---

## 2. Getting Started & Blank-First Onboarding

When you first launch the tool (or after resetting your environment), you are greeted by the **Onboarding Screen** with three distinct choices:

1. **Create Empty Curriculum:**
   - Starts with a completely blank canvas.
   - Ideal when building a new programme or testing an unmapped course.
   - Use the **"+ Add Module"** action to enter module codes, titles, credits, and baseline weekly hours.

2. **Import Curriculum JSON:**
   - Uploads a previously saved CST workspace, an individual scenario file, or an exported curriculum dataset.
   - Validates the JSON file against **Schema 1.0.0** before loading.

3. **Explore Demo Curriculum:**
   - Loads the calibrated **Master of Public Health (Term 1 Core)** demonstration dataset.
   - Clearly flagged with a **"Sample Demo Mode"** indicator in the navigation bar.
   - You can exit demo mode at any time using **"Exit Demo"** in the top header (with confirmation to prevent accidental loss of authored changes).

---

## 3. The Protected Baseline and Scenario Isolation

A central design principle of CST is **baseline integrity**: your reference curriculum should never be accidentally altered while you are experimenting.

### What is the Protected Baseline?
- The baseline represents the approved, current reference state of the curriculum.
- In the CST interface, when **"📋 Protected Baseline"** is selected, direct modifications are protected.
- If you attempt to adjust an assessment deadline or scale workload while viewing the baseline, CST will **automatically branch a new alternative scenario**, preserving your baseline intact.

### Working with Alternative Scenarios
- Click **"+ New Scenario"** or **"+ Create Scenario from Baseline"** to branch an editable alternative.
- Give your scenario a meaningful name (e.g. *"Staggered Week 9 Presentations"*, *"Coursework-Only Assessment"*).
- All changes made in an alternative scenario affect **only that scenario**.
- You can switch freely between alternative scenarios and the baseline using the scenario tab bar.

### Scenario Operations
- **Duplicate:** Creates an independent copy of the active scenario to branch further variants.
- **Rename:** Updates the scenario title and rationale description.
- **Reset to Baseline:** Reverts all modifications in the scenario back to the protected baseline state (with an accessible confirmation dialogue).
- **Delete:** Permanently removes an alternative scenario with an accessible confirmation dialogue.
- **Set as Baseline:** If a scenario has been formally approved by your curriculum committee, you can replace the baseline reference. CST prompts you to download a backup JSON first.

---

## 4. Importing and Exporting Data

### Exporting Files
- **Export Workspace:** Found in the top header. Downloads a single JSON file containing the protected baseline, all alternative scenarios, active settings, and governance reflections (`Schema 1.0.0`).
- **Export Scenario:** Found in the scenario action bar. Downloads just the currently active scenario.
- **Export Baseline JSON:** Downloads the reference baseline curriculum.

### Scenario Import Integrity & Semantics
- Click **"Import JSON"** in the top header or onboarding screen.
- Supported payload formats: Full Workspace JSON, Single Scenario JSON, or Legacy Curriculum Dataset.
- **Empty Application Import:** Importing a single scenario into an empty environment automatically creates a coherent workspace with the scenario dataset configured as an isolated, protected baseline alongside the scenario itself.
- **Existing Workspace Import:** Importing a single scenario into an existing workspace **never overwrites the baseline**. The new scenario is appended to the scenario list and switched to active.
- **Duplicate Scenario ID Handling:** If an imported scenario has an identifier identical to an existing scenario, CST safely generates a unique collision-free ID and annotates the name with `(Imported)`.
- **Referential Integrity & Repair Rules:**
  - *Fatal Rejections:* If an assessment references a non-existent `moduleId`, or duplicate module IDs exist, the import is rejected with an explicit error identifying the broken reference.
  - *Non-Fatal Repairs:* If a module is missing a corresponding 12-week workload profile, CST repairs it by automatically generating a standard 12-week baseline profile.
- **Deep Data Isolation:** All imported datasets and scenarios are deeply cloned to ensure that in-memory mutations never bleed across scenarios or into the baseline.
- **Non-Destructive Failure Safety:** If import fails due to malformed JSON or schema rejection, an alert displays the validation issue and your current workspace is preserved without modification.

---

## 5. Storage Recovery and Resilience

- **Local Storage Key:** All workspace data is saved locally under `cst_workspace_v1`.
- **Automatic Migration:** Existing datasets saved under the legacy `curriculum_sim_current_dataset` format are automatically migrated to Schema 1.0.0. The original legacy storage record is **never destroyed** until validation and persistence both succeed.
- **Storage Write & Quota Resilience:** If browser storage quota is exceeded or storage permissions fail, CST displays a prominent warning banner (`role="alert"`) and retains your active workspace in memory. CST will **never misleadingly indicate successful persistence** when a save fails, and the user can immediately export the latest in-memory workspace as JSON.
- **Corrupted Data Protection:** If local storage data is corrupted, CST preserves the raw text in storage until explicitly reset and provides a **"Download Corrupted Backup"** button.
- **Accidental Discard Protection:** Exiting demo mode or resetting the workspace prompts for confirmation in accessible modal dialogues before discarding any modified scenarios or newly authored curriculum content.

---

## 6. Understanding the Calibrated Demonstration

The included demonstration dataset models a realistic single-term cohort:
- **Programme:** Master of Public Health (Term 1 Core Baseline)
- **Cohort Load:** 4 concurrent 15-credit modules = 60 UK credits total.
- **Credit Equivalence:** Standard UK credit framework (1 UK credit = 10 notional learning hours, yielding 600 notional hours for the term and 150 hours per module).
- **Weekly Delivery Profile:** The 12-week active teaching block models 500 scheduled hours (120–130 hours per module, averaging ~41.7 hours/week across 4 modules for a full-time student).
- **Independent Study Component:** The remaining 100 notional hours (25 hours per module on average) represent independent pre-term preparation, reading week consolidation, and post-term examination revision / feedback reflection outside the active 12-week teaching block.
- **Realistic Bottlenecks:** Week 11 features two concurrent presentations (51 hours total), triggering automated overload peak and clustering warnings for scenario testing.

---

## 7. Workload Simulation & Credit Reconciliation

CST implements mathematically sound and transparent workload accounting based on UK higher education conventions:

### UK Credit Framework Equivalence
- **1 UK Credit = 10 Notional Learning Hours.**
- A standard 60-credit postgraduate or undergraduate term represents **600 notional learning hours**.
- **Teaching-Period Hours vs Non-Teaching Hours:** In the 12-week teaching block model, contact sessions, directed tasks, and continuous coursework preparation typically account for a defined portion of notional hours (e.g. 500 hours across 4 modules, averaging ~41.7 hours/week for a full-time student).
- **Non-Teaching Independent Hours:** The remaining notional hours (e.g. 100 hours, or 25 hours per 15-credit module) represent pre-term preparation, reading/consolidation periods, and post-term examination revision / feedback reflection.
- CST **does not treat this difference as an error**. Instead, the **Workload & Credit Reconciliation** banner transparently displays the breakdown for each module and the programme as a whole.

### Student Persona Load Multipliers
- **Full-Time Student (1.0x):** Baseline nominal study pace (40h/week nominal target).
- **Part-Time Student (0.5x):** 50% study intensity, typical for students studying half-time alongside professional employment.
- **Intensive / Accelerated Student (1.2x):** 120% intensity, modelling compressed delivery formats or students taking concurrent retakes.
- Persona multipliers are applied consistently across all analytical panels, heatmaps, risk signals, and comparison dashboards.

### Authoritative Planning Thresholds
- **Overload Threshold ($\ge 45\text{h}$):** Flags critical student strain that risks burnout or poor retention.
- **High Intensity ($\ge 35\text{h}$):** Heavy study commitment requiring focused time management.
- **Standard Planning Target ($40\text{h}$):** Nominal full-time academic workload benchmark.
- **Moderate ($20\text{h}$):** Baseline minimum active study engagement.
- **Workload Spike ($\ge 15\text{h}$ jump):** Rapid week-to-week escalation between adjacent weeks.
- *Educational Notice:* These thresholds are configurable planning assumptions, not universal institutional mandates.

---

## 8. Direct Scenario Authoring & Modelling

The **Scenario Testing & Modelling** panel enables direct, fine-grained curriculum authoring:

### 1. Weekly Workload Hour Editing
- Select any active module from the dropdown.
- Directly input or adjust hours for each of the 12 teaching weeks in the numeric grid. Every input contains an accessible label describing the week and module code (e.g. `aria-label="Week 1 study hours for PH101"`).
- Live recalculation immediately reflects the module's scheduled teaching hours, expected notional hours, and independent study balance.
- **Distribute Evenly:** One-click utility that mathematically divides the module's total hours equally across all 12 teaching weeks.
- **Smooth Peak Weeks:** Caps elevated peak weeks and redistributes surplus hours into weeks with lower study demands.

### 2. Assessment Deadlines & Weights
- View all assessments grouped by module.
- Modify the deadline submission week (Weeks 1 to 12).
- Adjust assessment weighting percentage (0% to 100%).
- Change assessment evaluation format (Coursework, Written Examination, Practical Examination, Oral Presentation).
- **Module Weight Validation:** Visual indicator confirms when module assessments correctly sum to 100%, or alerts when weights are unreconciled.
- **Add Assessment:** Add new assessment components to any module.

### 3. Module & Credit Management with Referential Integrity
- Adjust module credit values (e.g. from 15 to 20 credits); expected notional hours automatically scale (e.g. to 200 hours).
- **Add Module to Scenario:** Create new modules directly within an alternative scenario with code, title, and credit weighting. A balanced 12-week workload profile and default assessment are initialised automatically.
- **Delete Module (Referential Cascade):** Removing a module triggers an accessible confirmation dialogue and safely cascades through the scenario data structures, removing its workload profile and linked assessments while maintaining data integrity.
- **Reset Scenario to Baseline:** Discard scenario modifications and restore the protected baseline curriculum at any time with accessible confirmation.

---

## 9. Assessment Congestion & Diversity

CST evaluates deadline pressure across the entire cohort rather than treating each module in isolation:

- **Credit-Weighted Programme Pressure:** An assessment's programme-level impact is calculated as:
  $$\text{Programme Weight}_a = W_a \times \frac{C_m}{C_{\text{total}}}$$
  This avoids the error of naively summing percentages from unrelated modules.
- **Congested Deadlines:** A week is flagged as congested if it contains 3 or more deadlines, or 2 or more deadlines across distinct modules with $\ge 20\%$ total programme assessment load.
- **High-Stakes Deadlines:** Highlighted if an individual module assessment carries $\ge 40\%$ weight, or a week's combined programme load reaches $\ge 25\%$.
- **Method Diversity:** Monitors the mix of assessment formats (Exam, Coursework, Report, Practical, Presentation, Portfolio) to ensure varied evaluation modalities.
- **Unassigned Assessments:** Any assessment lacking an assigned teaching week is isolated and flagged in an advisory drawer, ensuring it is not confused with confirmed absence of assessment.

---

## 10. Honest Skill Exposure & Assessment Evidence

CST models capability scaffolding without unsupported mathematical claims:

- **No Speculative Mastery Metrics:** Replaces artificial "% mastery" scores with transparent, observable curriculum touchpoints.
- **Curriculum Exposure Metrics:**
  - Number of modules addressing the competency.
  - Active teaching weeks in which the competency is encountered.
  - Developmental sequencing: Initial Introduction $\rightarrow$ Reinforcement $\rightarrow$ Integrated Practice.
- **Documented Assessment Evidence:** Connects competency tags to formal assessments defined in teaching modules.
- **Pedagogical Integrity Principle:** Repeated exposure represents structured opportunities to practice; it does not constitute demonstrated student proficiency without supporting assessment evidence. Skills lacking formal assessment links are clearly flagged.

---

## 11. Multi-Scenario Comparison Dashboard & Briefing Reports

The **Curriculum Scenario Comparison** dashboard provides rigorous side-by-side analysis and publication-ready reporting:

### Configuration Selection
- Select **Configuration A** (e.g. Protected Baseline) and **Configuration B** (e.g. Scenario 1, Scenario 2).
- Compare Baseline vs Scenario, or contrast two alternative scenarios directly (Scenario A vs Scenario B).
- If identical configurations are selected, an informational advisory is displayed.

### Comparative Metrics Grid
- **Total Scheduled Workload ($\Delta\text{h}$):** Net change in teaching-period study hours.
- **Peak Weekly Pressure ($\Delta\text{h}$):** Compares peak weekly hours and identifies the peak week.
- **Overload Weeks ($\ge 45\text{h}$):** Number of weeks exceeding the overload threshold.
- **Congested Assessment Weeks:** Reduction or increase in deadline clustering.
- **Programme Credits & Modules:** Structural credit balance differences.

### Responsive Workload Pressure Curve (SVG)
- Responsive inline SVG visualisation showing weekly workload across Weeks 1 to 12.
- **Dual Visual Encoding:** Configuration A is rendered with a solid line and circular markers; Configuration B is rendered with a dashed line and diamond markers. Visualisations do not rely on colour alone.
- **Threshold Reference Lines:** Visual planning target (40h) and overload limit (45h).
- **Accessible Tabular Equivalent:** Semantic comparison table toggleable for screen readers or tabular analysis, featuring column scopes (`scope="col"`), row scopes (`scope="row"`), a focusable horizontal scroll region, and high-contrast direction indicators (`↑ Increased`, `↓ Decreased`, `= Unchanged`).

### Briefing Report Exports (Batch 3)
In the Comparison Dashboard header, educators can trigger self-contained reports:
1. **Export Markdown (`.md`):**
   - Outputs a standard Markdown briefing document.
   - Includes programme title, date, active persona, configuration metadata, an executive metrics table, 12-week workload comparisons, recorded governance rationale, planning warnings, and simulation methodology limits.
   - Ideal for incorporating directly into academic review papers, validation packs, or version-control documentation.
2. **Export HTML (`.html`):**
   - Generates a standalone, fully styled HTML document.
   - Zero external font or CSS dependencies: styles are embedded directly in the `<style>` block.
   - Formatted for clean printing with `@media print` rules, A4 margins, and page-break handling.
   - **XSS Sanitised:** All user-authored strings (scenario names, descriptions, module titles, rationales, review notes) are thoroughly escaped (`escapeHtml`) to prevent script injection.
3. **Print / Save as PDF:**
   - Launches a print-ready window with `window.print()` triggered automatically, allowing direct browser printing or saving as a PDF document.

---

## 12. Rule-Based Scenario Planning Suggestions

The **Scenario Design Suggestions** panel offers transparent, rule-based recommendations:

- **Deterministic Pedagogical Rules:** Replaces misleading "AI" claims with verifiable heuristics based on workload overload limits (45h), deadline clustering, and unassessed competencies.
- **Actionable Adjustments:**
  - *Relieve Assessment Congestion:* Reschedules concurrent deadlines to earlier weeks to separate submission peaks.
  - *Smooth Workload Spikes:* Shifts independent study hours from peak weeks to earlier preparation periods while keeping module totals intact.
  - *Document Assessment Evidence:* Identifies curriculum competencies taught without formal assessment tasks and proposes practical evaluation tasks.
- **Educational Rationales:** Every suggestion displays its pedagogical reasoning, modelled impact, and exact mathematical adjustments before application.

---

## 13. Accessibility Features (WCAG 2.2 AA Alignment Intention)

CST is engineered to align with WCAG 2.2 AA (and WCAG 2.1 AA) principles. While comprehensive automated unit checks run in JSDOM, formal conformance requires external institutional audit and manual assistive technology testing.

### Implemented Accessibility Features:
- **Keyboard Navigation & Skip Link:** A visible "Skip to main content" link appears on initial `Tab` press, jumping keyboard focus past top navigation directly into the active workspace.
- **High-Contrast Visible Focus:** Every interactive button, link, and input features a prominent `outline: 2px solid #2563EB` with `outline-offset: 2px` on keyboard focus (`:focus-visible`).
- **Complete WAI-ARIA Tabs in Scenario Editor:**
  - Tablist (`role="tablist"`) with roving tabindex (`tabIndex={0}` on active tab, `-1` on inactive tabs).
  - Arrow key navigation: `ArrowRight` and `ArrowLeft` cycle between tabs with wrapping.
  - Quick navigation: `Home` focuses the first tab ("Weekly Workload Hours") and `End` focuses the last tab ("Modules & Credits").
  - Tabpanels (`role="tabpanel"`) with `aria-labelledby`, valid controls relationships, and `tabIndex={0}` to allow keyboard users to tab directly into the panel region.
- **Semantic Scenario Switcher in Scenario Manager:**
  - Uses semantic `<nav aria-label="Curriculum scenario views">` with toggle buttons (`aria-pressed={isActive}`) rather than misleading tab roles without associated tabpanels.
- **Accessible Modal Dialogues (9 Distinct Modals):**
  All 9 application dialogues are rendered through `AccessibleModal`:
  1. *Add Module dialogue* (`AddModuleModal.tsx`)
  2. *Create Alternative Scenario dialogue* (`ScenarioManager.tsx`)
  3. *Rename Scenario dialogue* (`ScenarioManager.tsx`)
  4. *Delete Scenario dialogue* (`ScenarioManager.tsx`)
  5. *Replace Protected Baseline dialogue* (`ScenarioManager.tsx`)
  6. *Delete Module dialogue* (`ScenarioEditor.tsx`)
  7. *Reset Scenario to Baseline dialogue* (`ScenarioEditor.tsx`)
  8. *Exit Demonstration Mode dialogue* (`App.tsx`)
  9. *Reset Curriculum Workspace dialogue* (`App.tsx`)
  Each modal implements:
  - `role="dialog"` and `aria-modal="true"`.
  - Accessible title with `aria-labelledby`.
  - Background scrolling lock (`overflow: hidden` on `document.body`) while active.
  - Background controls cannot be operated or focused while a modal is active.
  - Synchronous initial focus placement into the opened dialogue.
  - Strict keyboard focus trap cycling within the dialogue on `Tab` and `Shift+Tab`.
  - Escape-key dismissal (`Escape`) for dismissible dialogues.
  - Focus restoration returning to the triggering element upon closure.
  - Non-destructive default focus: destructive actions (Delete, Reset) require intentional navigation and cannot occur through accidental Enter keystrokes.
- **No Native Blocking Pop-ups:** Native `window.confirm` and `alert` calls have been eliminated in favour of accessible modal dialogues and screen-reader live regions.
- **Live Region Announcements:** Status confirmations announce via `role="status"` (`aria-live="polite"`). Error notices announce via `role="alert"` (`aria-live="assertive"`).
- **Accessible Form Controls:** All 12-week numeric workload inputs feature explicit programmatic labels (e.g. `aria-label="Week 1 study hours for CS101"`).
- **Accessible Tables & Charts:** Comparison tables use `scope="col"` and `scope="row"` headers and wrap wide tables in focusable scroll regions (`tabIndex={0}`, `role="region"`, `aria-label`). SVG charts provide `<title>`, `<desc>`, and non-colour visual indicators (solid lines with circles vs dashed lines with diamonds).
- **Reduced Motion & Zoom:** Fully honours user system preferences via `@media (prefers-reduced-motion: reduce)` and supports 200% browser zoom without layout collapse or horizontal clipping.

---

## 14. Verification Status & Acceptance Checklist

To maintain rigorous engineering standards, we clearly distinguish between automated tests and outstanding real-world verifications:

- **Automated Accessibility Checks (Verified):** 74 automated Vitest tests run in JSDOM covering modal rendering, focus trap wrapping, Escape key handling, focus restoration, table scopes, input labels, arrow-key tab navigation, semantic nav buttons, and XSS sanitisation.
- **Outstanding Real-Browser Acceptance (Manual Required):** Verifying focus rings, responsive reflow, print preview rendering, and popup management in real desktop browsers (Safari, Chrome, Firefox, Edge).
- **Outstanding Screen-Reader Acceptance (Manual Required):** Formal hands-on verification with native assistive technologies (Apple VoiceOver on macOS/iOS, NVDA on Windows, JAWS).
- **Conformance Status:** CST targets WCAG 2.2 AA alignment in its architecture and automated test suite, but formal conformance cannot be claimed without external institutional audit.

### Manual Acceptance Checklist for Deployment Reviewers:

| Check Item | Action | Expected Behaviour | Status |
| :--- | :--- | :--- | :--- |
| **Skip Link** | Press `Tab` upon initial page load | "Skip to main content" becomes visible with clear focus outline; pressing `Enter` moves focus past header. | Manual acceptance |
| **Visible Focus** | Tab through all header controls and forms | All interactive elements display a crisp 2px solid blue focus outline (`#2563EB`). | Manual acceptance |
| **Modal Focus Trap** | Open any of the 9 modal dialogues | Focus enters dialogue immediately; `Tab` / `Shift+Tab` remain trapped inside; `Escape` closes modal and restores focus to opener; background controls cannot be operated. | Automated (JSDOM) + Manual acceptance |
| **Editor Tab Navigation** | Focus editor tablist; press `ArrowRight`, `ArrowLeft`, `Home`, `End` | Active tab switches dynamically, roving tabindex updates, and associated tabpanel mounts with `tabIndex={0}`. | Automated (JSDOM) + Manual acceptance |
| **Workload Inputs** | Tab into 12-week workload grid in Scenario Editor | Screen reader announces week number and module code; values update dynamically. | Automated (JSDOM) + Manual acceptance |
| **Briefing Export (MD)** | Click "Export Markdown (.md)" | Browser downloads `.md` briefing containing comparison metrics and methodology text. | Automated (Vitest) + Manual acceptance |
| **Briefing Export (HTML)** | Click "Export HTML (.html)" | Standalone `.html` file downloads; opening in browser displays complete, self-contained report with zero broken styles and safe XSS handling. | Automated (Vitest) + Manual acceptance |
| **Print / PDF** | Click "Print / Save as PDF" | Print window opens with `opener = null` security isolation; table and metrics fit cleanly on A4 pages without clipping. | Automated (Vitest) + Manual acceptance |
| **200% Browser Zoom** | Zoom browser to 200% (`Cmd + +`) | Layout adapts to single-column; scenario switcher and comparison metrics remain readable; no horizontal page overflow. | Manual acceptance |
| **VoiceOver (macOS)** | Enable VoiceOver (`Cmd + F5`) and navigate comparison table | Announces column headers, row headers ("Week 1"), and threshold badges accurately. | Outstanding manual verification |
| **Persistence Recovery** | Trigger storage failure or corrupted JSON | Alert banner offers "Download Corrupted Backup" and preserves in-memory curriculum without data loss. | Automated (Vitest) + Manual acceptance |

---

## 15. Known Scope Boundaries & Limitations

- **12-Week Teaching Block Scope:** CST models workload and deadlines across a standard 12-week term. Full multi-semester or flexible-term calendar engines will be addressed in future phases.
- **Deterministic Simulation:** CST simulation is transparent, mathematical, and deterministic. It does not employ generative AI or unexplainable black-box algorithms.
- **Independent Open-Source Use:** CST is entirely self-contained and does not require or communicate with commercial Curriculum Studio servers.
- **No Substitute for Academic Judgement:** Model outputs and planning suggestions inform curriculum deliberation; they do not dictate policy or guarantee individual student outcomes.

---

## 16. Technical Quality & Automated Test Summary

- **Automated Tests:** **74 passing automated tests** across 7 test files (`npm test`).
- **Compiler:** Zero TypeScript errors (`npm run typecheck`).
- **Linter:** Zero ESLint warnings or errors (`npm run lint`).
- **Production Build:** Clean Vite bundle generation (`npm run build`).
- **Formatting:** Clean whitespace verification (`git diff --check`).
