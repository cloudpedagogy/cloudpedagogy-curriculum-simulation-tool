# Curriculum Simulation Tool — User Instructions

---

### 1. Purpose of the Application
The **Curriculum Simulation Tool (CST)** is a local-first environment for exploring the potential consequences of proposed curriculum modifications before implementing them. It models student workload distribution, assessment deadline concentration, and competency scaffolding across 12-week teaching blocks.

---

### 2. Role in the CloudPedagogy Ecosystem
- **Phase:** Phase 1 — Curriculum Spine
- **Upstream Connection:** Accepts curriculum datasets from the **Curriculum Alignment & Mapping Engine (CAME)**.
- **Downstream Connection:** Provides scenario evaluation and risk signals for the **Programme Governance Dashboard (PGD)** and **Curriculum Change Manager (CCM)**.
- **Boundaries:** CST does not define structural outcomes, maintain syllabus catalogues, manage institutional committee approvals, or compute compliance metrics.

---

### 3. Step-by-Step Workflow (Batch 1)

#### Step 1: Onboarding & Setup
When launched without existing data, choose one of three options:
1. **Create Empty Curriculum:** Start with a blank canvas to author your own modules and workload profiles.
2. **Import Curriculum JSON:** Load a previous CST workspace, single scenario, or curriculum dataset. Importing a single scenario establishes a coherent workspace with an isolated protected baseline if starting empty, or appends safely with duplicate ID handling if importing into an existing workspace.
3. **Explore Demo Curriculum:** Load a calibrated 4-module Public Health sample dataset (60 UK credits = 600 notional hours, with 500 teaching block hours averaging ~41.7h/week and 100 independent study hours).

#### Step 2: Working with the Protected Baseline
The **Baseline** represents your current reference curriculum.
- The baseline is **immutable**: direct edits are locked to prevent accidental corruption.
- To model what-if adjustments, click **"+ Create Scenario from Baseline"** to branch an editable alternative.

#### Step 3: Managing Alternative Scenarios
- **Switch Scenarios:** Use the active scenario tabs at the top of the interface.
- **Duplicate Scenarios:** Create copies to experiment with multiple branching ideas.
- **Rename & Annotate:** Provide clear descriptive names and rationale for each scenario.
- **Reset:** Restore any alternative scenario back to its original baseline state at any time.
- **Delete:** Remove unneeded scenarios safely with confirmation.
- **Replace Baseline:** If an alternative scenario is approved as the new reference, use "Set as Baseline" (with an optional JSON backup export).

#### Step 4: Scenario Modelling & Observation
- Use the **Scenario Testing & Modelling** controls to adjust assessment timing or workload factors.
- Observe updates across the **Workload Heatmap**, **Assessment Pattern Analysis**, and **Timeline View**.
- Review automated risk signals for workload spikes ($\ge 15\text{h}$ jump), overload peaks ($\ge 45\text{h}$), and assessment clustering ($\ge 50\%$ weight in a single week).

#### Step 5: Exporting & Preserving Records
- Click **"Export Workspace"** to download the complete multi-scenario workspace as a versioned JSON file (`Schema 1.0.0`).
- Individual scenarios can also be exported separately from the scenario action bar.
- If storage write or quota issues occur, CST displays an immediate warning without misleading success notifications, retaining your active workspace in memory so you can export your work safely.

---

### 4. Current Limitations & Methodological Transparency
- **Exposure Heuristics:** Competency progression calculations represent curriculum exposure frequency across modules; they do not measure psychological or empirical student mastery.
- **Teaching Period Model:** Workload is currently modeled across a 12-week teaching block (500 hours); non-teaching notional hours (100 hours) represent independent study, reading, and assessment revision.
- **Batch 1 Scope:** Advanced side-by-side scenario diff tables and graphical curve visualisations belong to Batch 2.
- **Browser Automation:** Automated tests pass under Vitest/jsdom (40 tests); full end-to-end browser automation was not executed in this environment. No formal accessibility certification or release readiness is claimed.

---

### 5. Capability and Governance
All governance fields at the bottom of the interface are optional and non-blocking. They provide structured space for documenting AI involvement, pedagogical assumptions, perceived risks, rationale, and academic review notes.
