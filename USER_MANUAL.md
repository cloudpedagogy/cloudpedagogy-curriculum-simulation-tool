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

## 7. Capability and Governance Notes

At the bottom of the interface, the optional **Capability & Governance Notes** drawer provides fields for professional reflection:
- **AI Capability Support & Involvement:** Record whether AI tools assisted in scenario planning.
- **Assumptions:** Note pedagogical or cohort assumptions.
- **Risks or Concerns:** Highlight any student experience or resource risks.
- **Rationale:** Record the academic rationale for proposed changes.
- **Human Review Notes:** Capture notes from course review discussions.

All governance fields are completely optional and non-blocking.

---

## 8. Development Roadmap & Verification Status

- **Batch 1 (Completed):** Data foundations (`Schema 1.0.0`), baseline isolation, multi-scenario management, blank-first onboarding, JSON import/export, and calibrated demo data. Verified with 40 passing automated tests.
- **Batch 2 (Planned):** Side-by-side scenario comparison matrix, visual workload diffing, cell-level weekly hour editing, and upgraded AI suggestions.
- **Batch 3 (Planned):** WCAG 2.1 AA accessibility compliance audit, performance benchmarking, and production release hardening.
- **Verification Notice:** Automated tests run under Vitest/jsdom. Real-browser end-to-end automation was not executed due to local headless CDP limitations. No formal accessibility certification or commercial release readiness is claimed.
