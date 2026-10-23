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
   - Use the **"+ Add Module"** or **"+ Add First Module"** action to enter module codes, titles, credits, and baseline weekly hours.

2. **Import Curriculum JSON:**
   - Uploads a previously saved CST workspace, an individual scenario file, or an exported curriculum dataset.
   - Validates the JSON file against **Schema 1.0.0** before loading.

3. **Explore Demo Curriculum:**
   - Loads the calibrated **Master of Public Health (Term 1 Core)** demonstration dataset.
   - Clearly flagged with a **"Sample Demo Mode"** indicator in the navigation bar.
   - You can exit demo mode at any time using **"Exit Demo"** in the top header.

---

## 3. The Protected Baseline and Scenario Isolation

A central design principle of CST is **baseline integrity**: your reference curriculum should never be accidentally altered while you are experimenting.

### What is the Protected Baseline?
- The baseline represents the approved, current reference state of the curriculum.
- In the CST interface, when **"📋 Protected Baseline"** is selected, editing controls are locked.
- If you attempt to adjust an assessment deadline or scale workload while viewing the baseline, CST will **automatically branch a new alternative scenario**, preserving your baseline intact.

### Working with Alternative Scenarios
- Click **"+ New Scenario"** or **"+ Create Scenario from Baseline"** to branch an editable alternative.
- Give your scenario a meaningful name (e.g. *"Staggered Week 9 Presentations"*, *"Coursework-Only Assessment"*).
- All changes made in an alternative scenario affect **only that scenario**.
- You can switch freely between alternative scenarios and the baseline using the scenario tabs.

### Scenario Operations
- **Duplicate:** Creates an independent copy of the active scenario to branch further variants.
- **Rename:** Updates the scenario title and rationale description.
- **Reset to Baseline:** Reverts all modifications in the scenario back to the protected baseline state.
- **Delete:** Permanently removes an alternative scenario with a confirmation prompt.
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
- **Storage Write & Quota Resilience:** If browser storage quota is exceeded or storage permissions fail, CST displays a prominent warning banner and retains your active workspace in memory. CST will **never misleadingly indicate successful persistence** when a save fails, and the user can immediately export the latest in-memory workspace as JSON.
- **Corrupted Data Protection:** If local storage data is corrupted, CST preserves the raw text in storage until explicitly reset and provides a **"Download Corrupted Backup"** button.
- **Accidental Discard Protection:** Exiting demo mode or resetting the workspace prompts for confirmation before discarding any modified scenarios or newly authored curriculum content.

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
- Directly input or adjust hours for each of the 12 teaching weeks in the numeric grid.
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
- **Delete Module (Referential Cascade):** Removing a module safely cascades through the scenario data structures, removing its workload profile and linked assessments while maintaining data integrity.
- **Reset Scenario to Baseline:** Discard scenario modifications and restore the protected baseline curriculum at any time.

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

## 11. Multi-Scenario Comparison Dashboard

The **Curriculum Scenario Comparison** dashboard provides rigorous side-by-side analysis:

### Configuration Selection
- Select **Configuration A** (e.g. Protected Baseline) and **Configuration B** (e.g. Scenario 1, Scenario 2).
- Compare Baseline vs Scenario, or contrast two alternative scenarios directly (Scenario A vs Scenario B).

### Comparative Metrics Grid
- **Total Scheduled Workload ($\Delta\text{h}$):** Net change in teaching-period study hours.
- **Peak Weekly Pressure ($\Delta\text{h}$):** Compares peak weekly hours and identifies the peak week.
- **Overload Weeks ($\ge 45\text{h}$):** Number of weeks exceeding the overload threshold.
- **Congested Assessment Weeks:** Reduction or increase in deadline clustering.
- **Programme Credits & Modules:** Structural credit balance differences.

### Responsive Workload Pressure Curve (SVG)
- Responsive inline SVG visualisation showing weekly workload across Weeks 1 to 12.
- **Dual Visual Encoding:** Configuration A is rendered with a solid line and circle markers; Configuration B is rendered with a dashed line and diamond markers. Visualisations do not rely on colour alone.
- **Threshold Reference Lines:** Visual planning target (40h) and overload limit (45h).
- **Accessible Tabular Equivalent:** Semantic comparison table toggleable for screen readers or tabular analysis, featuring high-contrast direction indicators (`↑ Increased`, `↓ Decreased`, `= Unchanged`).

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

## 13. Current Academic Calendar Limitations

- **12-Week Teaching Model:** CST currently models curriculum workload and assessments across a 12-week teaching block.
- **Deterministic Simulation:** Calculations are strictly deterministic and reproducible, designed for transparent planning assumptions rather than black-box predictive forecasting.

---

## 14. Development Roadmap & Verification Status

- **Batch 1 (Completed):** Versioned data foundations (`Schema 1.0.0`), baseline isolation, multi-scenario branching, JSON import/export, blank-first onboarding, and storage resilience.
- **Batch 2 (Completed):** Authoritative workload reconciliation, threshold boundary rigor, credit-weighted assessment congestion, honest skill exposure, cell-level scenario editing, multi-scenario comparison dashboard, responsive SVG pressure curves with accessible tabular equivalents, and rule-based planning heuristics. Verified with 57 passing automated tests.
- **Batch 3 (Planned Hardening):** Full WCAG 2.1 AA accessibility audit, cross-browser compatibility verification, responsive design polish, and performance benchmarking.
- **Verification Notice:** Automated tests pass under Vitest/jsdom. Real-browser end-to-end automation was not executed due to local headless CDP limitations. No formal accessibility certification or commercial release readiness is claimed.
