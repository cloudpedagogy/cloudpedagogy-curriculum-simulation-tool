# Curriculum Simulation Tool — User Instructions

---

### 1. Purpose of the Application
The **Curriculum Simulation Tool (CST)** is a local-first environment for exploring the potential consequences of proposed curriculum modifications before implementing them. It models student workload distribution, assessment deadline concentration, and competency scaffolding across 12-week teaching blocks.

CST operates under a clear pedagogical principle: **simulation provides structured planning insight, not automated academic judgment**. It transparently exposes its mathematical formulas, reference thresholds, and data limitations so that curriculum leaders, programme directors, and teaching teams can make informed, evidence-based decisions.

---

### 2. Role in the CloudPedagogy Ecosystem
- **Phase:** Phase 1 — Curriculum Spine
- **Upstream Connection:** Accepts curriculum datasets from the **Curriculum Alignment & Mapping Engine (CAME)**.
- **Downstream Connection:** Provides scenario evaluation, workload risk signals, and configuration trade-off reports for the **Programme Governance Dashboard (PGD)** and **Curriculum Change Manager (CCM)**.
- **Boundaries:** CST does not define structural learning outcomes or taxonomic mappings (CAME), maintain institutional syllabus catalogues (SMRS), manage formal committee ballots or approvals (CCM), or compute institutional quality metrics (PGD).

---

### 3. Step-by-Step Workflow

#### Step 1: Onboarding & Setup
When launched without existing data, choose one of three options:
1. **Create Empty Curriculum:** Start with a blank canvas to author your own modules, credit allocations, and workload profiles.
2. **Import Curriculum JSON:** Load a previous CST workspace, single scenario, or curriculum dataset. Importing a single scenario establishes a coherent workspace with an isolated protected baseline if starting empty, or appends safely with duplicate ID handling if importing into an existing workspace.
3. **Explore Demo Curriculum:** Load the calibrated 4-module Public Health sample dataset (60 UK credits = 600 notional hours, comprising 500 teaching block hours averaging ~41.7h/week and 100 independent study hours).

#### Step 2: Working with the Protected Baseline
The **Baseline** represents your current reference curriculum.
- The baseline is **immutable**: direct edits are locked to prevent accidental corruption of your benchmark.
- To model what-if adjustments, click **"+ Create Scenario from Baseline"** to branch an editable alternative.

#### Step 3: Managing Alternative Scenarios
- **Switch Scenarios:** Use the active scenario tabs at the top of the workspace.
- **Duplicate Scenarios:** Create copies to experiment with multiple branching ideas.
- **Rename & Annotate:** Provide clear descriptive names and rationale for each scenario.
- **Reset to Baseline:** Revert any alternative scenario back to its original baseline state at any time.
- **Delete:** Remove unneeded alternative scenarios safely with confirmation.
- **Replace Baseline:** If an alternative scenario is approved as the new reference, use "Set as Baseline" (with an optional JSON backup export).

#### Step 4: Direct Scenario Authoring & Modelling
In any alternative scenario, open the **Scenario Testing & Modelling** panel to make meaningful curriculum adjustments:
- **Module Management:** Add new modules with specified credit values, or adjust existing module credits with live notional learning hour recalculation.
- **Referential Integrity on Deletion:** Deleting a module automatically cascades to remove its associated weekly workload profiles and assessment tasks, preventing orphaned records.
- **Weekly Workload Editing:** Edit individual weekly hours directly in the 12-week grid for any module.
- **Hour Redistribution Tools:**
  - *Distribute Evenly:* Reallocates the module's total teaching hours uniformly across all 12 teaching weeks ($H_{\text{total}} / 12$).
  - *Smooth Peak Weeks:* Caps any week exceeding 14h down to 10h and redistributes surplus hours evenly across lower-load weeks.
- **Assessment Editing:**
  - Modify deadline timing across Weeks 1–12.
  - Adjust grading weights (0–100%) and evaluation types.
  - Add new assessment tasks with assigned weeks, weights, and skill connections.
  - Assessments with unassigned deadlines are clearly flagged in the warning drawer rather than silently dropped.

#### Step 5: Reviewing Simulation & Risk Signals
- **Workload Reconciliation Banner:** Transparently displays total UK credits, expected notional hours ($1\text{ credit} = 10\text{ hours}$), scheduled teaching period hours, and reconciled non-teaching independent study hours.
- **Unified Risk Signals:**
  - *Overload Peak:* Weekly cohort workload $\ge 45\text{ hours}$ (scaled by persona).
  - *High Workload:* Weekly workload $\ge 35\text{ hours}$.
  - *Workload Spike:* Jump $\ge 15\text{ hours}$ between adjacent weeks.
  - *Sustained Pressure:* Workload $\ge 35\text{ hours}$ maintained for 3 or more consecutive weeks.
- **Assessment Congestion:**
  - *Programme-Weighted Assessment Load:* Calculates true programme pressure as $W_a \times \frac{C_m}{C_{\text{total}}}$, avoiding invalid raw percentage sums.
  - *Congestion Flags:* Raised when a week contains 3+ deadlines, or 2+ deadlines across distinct modules representing $\ge 20\%$ total programme assessment weight.
  - *High-Stakes Flags:* Highlights individual tasks with $\ge 40\%$ module weight or $\ge 25\%$ programme assessment weight.
- **Persona Context:** Select Full-time (1.0x), Part-time (0.5x), or Intensive (1.2x) to verify that signals adapt consistently across student cohorts.

#### Step 6: Multi-Scenario Comparison Dashboard
Navigate to the **Multi-Scenario Comparison Dashboard** to evaluate two configurations side-by-side:
- **Flexible Comparison Selection:** Compare Baseline vs Scenario A, Scenario A vs Scenario B, or any two scenarios in your workspace.
- **Comparative Metrics Grid:** Instant visibility into differences in total teaching hours, peak weekly workload, weeks above overload/high thresholds, congested assessment weeks, module count, total credits, and competency touchpoints.
- **Responsive Pressure Curve (SVG):** Visualises weekly workload trajectories with dual visual encoding (Config A: solid curve with circular nodes; Config B: dashed curve with diamond nodes) and planning threshold reference lines (Overload at 45h, High at 35h, Target at 40h).
- **Accessible Comparison Table:** Complete tabular breakdown of weekly hours, differences ($\Delta$), and directional indicators (`↑ Increased`, `↓ Decreased`, `= Unchanged`).

#### Step 7: Rule-Based Planning Suggestions
Review deterministic, rule-based scenario recommendations in the **Planning Suggestions** panel:
- Clearly labelled as deterministic planning rules (never misleadingly presented as "AI" or generative models).
- *Stagger Clustered Assessments:* Suggests shifting deadlines from congested weeks to adjacent lower-load weeks.
- *Smooth Peak Workload:* Identifies spike weeks and suggests reallocating hours.
- *Link Assessment Evidence:* Suggests establishing formal assessment evidence for skills with high instructional exposure but unassessed status.
- Each suggestion displays an educator-friendly pedagogical rationale and applies a verified, valid state mutation upon acceptance.

#### Step 8: Competency Scaffolding & Honest Skill Exposure
Inspect curriculum skill progression in the **Competency Scaffolding** view:
- **No Speculative Mastery Percentages:** CST explicitly avoids claiming that students have "mastered" a percentage of a skill based on curriculum presence alone.
- **Transparent Exposure Indicators:**
  - *Module Touchpoints:* Number and titles of modules addressing the skill.
  - *Active Weeks:* Number of teaching weeks with scheduled skill instruction.
  - *Developmental Staging:* Tracks learning depth across 'introductory', 'reinforcement', and 'practice/application' stages.
  - *Assessment Evidence:* Distinguishes skills with documented assessment evidence from those with teaching exposure only.

#### Step 9: Exporting & Preserving Records
- Click **"Export Workspace"** to download the complete multi-scenario workspace as a versioned JSON file (`Schema 1.0.0`).
- Individual scenarios can also be exported separately from the scenario action bar.
- If storage write or quota issues occur, CST displays an immediate non-destructive warning, retaining your active workspace in memory so you can export your work safely.

---

### 4. Methodological Transparency & Limitations

- **UK Higher Education Credit Convention:** One UK credit represents ten notional learning hours (e.g. 15 credits = 150 hours; 60 credits = 600 hours).
- **Teaching Block vs Non-Teaching Hours:** In the 12-week simulation model, the scheduled weekly workload profile typically accounts for structured teaching block activities (lectures, seminars, labs, guided tutorials, structured coursework). The remaining unreconciled notional hours represent independent study, wider reading, revision, and assessment preparation outside the weekly teaching schedule. This difference is normal curriculum practice and is not treated as an error.
- **Planning Assumptions:** The standard planning target (40h/week), high threshold (35h/week), and overload threshold (45h/week) are illustrative planning heuristics designed to aid curriculum review, not universal statutory mandates. Institutions may configure different assumptions.
- **Calendar Engine Scope:** CST currently models a standardised 12-week teaching block. Non-standard block delivery (e.g. 6-week intensive blocks or year-long continuous delivery) should be mapped onto the 12-week grid using appropriate persona multipliers or noted in the governance assumptions.
- **Skill Exposure vs Competence:** Skill presence in a module syllabus or teaching week indicates an opportunity for learning; it does not measure or guarantee empirical student learning gain. Documented assessment evidence indicates where student attainment is formally evaluated.

---

### 5. Capability and Governance Documentation
All governance fields at the bottom of the interface are optional and non-blocking. They provide structured space for recording:
- Methodological and pedagogical assumptions.
- Identified curriculum risks and planned mitigations.
- Academic rationale for proposed scenario variations.
- External accreditation notes and formal committee review logs.
