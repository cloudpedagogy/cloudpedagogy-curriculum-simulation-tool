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

## 🚀 Overview & Key Capabilities (Batch 1)

1. **Blank-First Onboarding:**
   - Default blank canvas allowing educators to create an empty programme from scratch.
   - Option to upload existing JSON workspaces or curriculum datasets.
   - Distinct, clearly labelled sample demonstration mode.

2. **Schema 1.0.0 & Protected Baseline Isolation:**
   - Formal schema specification (`1.0.0`) with runtime Zod validation.
   - Immutable baseline protection: edits made in alternative scenarios never mutate the baseline curriculum.
   - Dedicated deep-cloning and defensive in-memory state preservation.

3. **Multi-Scenario Management:**
   - Create alternative scenarios branched from the protected baseline.
   - Duplicate, rename, reset, and delete scenarios with confirmation.
   - Explicit, audited baseline replacement with pre-replacement backup export.

4. **Functional JSON Import & Export:**
   - Export complete multi-scenario workspaces as versioned JSON.
   - Export individual scenarios or baseline configurations.
   - Non-destructive import validation: importing into an empty workspace establishes a coherent workspace with a clearly defined, isolated baseline.
   - Importing into an existing workspace preserves the baseline, safely handles duplicate scenario IDs by renaming, deeply clones data structures to prevent shared mutation, rejects invalid foreign key references (e.g. assessments referencing non-existent modules), and repairs missing workload profiles.
   - Failed imports safely preserve the current in-memory and stored workspace.

5. **Safe Storage & Resilience:**
   - Automatic migration from legacy `curriculum_sim_current_dataset` format to Schema 1.0.0; original storage records are preserved intact until validation and persistence succeed.
   - Storage write/quota failures trigger clear error banners without misleading success indicators.
   - Users can export the latest in-memory workspace as JSON immediately following a save failure.
   - Corrupted storage is detected and preserved in local storage until explicitly reset, with a one-click download for raw corrupted text.
   - Exiting demo mode or resetting workspace triggers an explicit confirmation dialogue to prevent accidental data loss.

6. **Calibrated Illustrative Demonstration:**
   - Coherent 4-module single-term Public Health curriculum (60 UK credits total, 15 credits each).
   - Clear equivalence: 1 UK credit = 10 notional learning hours (600 notional hours total, 150 hours per module).
   - Delivery distribution: 500 hours occur during the 12 active teaching weeks (120–130 hours per module, averaging ~41.7 hours/week across 4 modules for a full-time student).
   - The remaining 100 notional hours (25 hours per module on average) are allocated for pre-term preparation, reading week consolidation, and post-term examination revision / feedback reflection.
   - Realistic assessment deadlines featuring intentional late-term congestion in Weeks 11 & 12 for scenario testing.

---

## 📊 Current Simulation Methodology & Heuristics

The tool models curriculum configurations using transparent heuristic rules:

### Workload Signals
- **Overload Peak:** $\ge 45$ hours total weekly workload.
- **Workload Spike:** $\ge 15$ hours increase between adjacent weeks.
- **Sustained Intensity:** 3+ consecutive weeks of high ($\ge 35\text{h}$) or overload intensity.

### Assessment Signals
- **High-Stakes Cluster:** Combined assessment weighting in a single week $\ge 50\%$ (Critical).
- **Assessment Congestion:** $\ge 3$ assessment deadlines in a single week (Critical).
- **Limited Method Diversity:** Fewer than 3 unique evaluation types across the curriculum.

### Competency Scaffolding
- Tracks competency exposure across modules (Introductory $\rightarrow$ Reinforcement $\rightarrow$ Advanced).
- Flags competencies introduced late in the term (after Week 4) or lacking reinforcement (single-module usage).
- *Transparency Note:* Growth curves are qualitative pedagogical heuristics indicating exposure frequency, not empirical or psychological measures of student mastery.

---

## 🔮 Roadmap: Outstanding Batches

CST is being developed in three disciplined batches:

- **Batch 1 (Current Baseline):** Versioned data foundations (`Schema 1.0.0`), immutable baseline protection, multi-scenario branching, functional JSON import/export, blank-first onboarding, calibrated MPH demo data, storage quota resilience, and automated regression testing.
- **Batch 2 (Simulation Enhancements):** Cross-scenario comparison matrix, visual workload diffing, parameter-driven sensitivity analysis, cell-level weekly hour editing, and upgraded AI suggestion logic.
- **Batch 3 (Release Hardening):** Comprehensive WCAG 2.1 AA accessibility audit, cross-browser compatibility testing, responsive layout polish, end-to-end browser acceptance, and performance benchmarking.

---

## 🛠️ Development & Verification Commands

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
npm test             # Run Vitest automated test suite (40 tests)
npm run typecheck    # Run TypeScript compiler verification (tsc -b)
npm run lint         # Run ESLint with zero errors or warnings
npm run build        # Build production bundle with Vite
```

### Browser Automation & Acceptance Status
- The test suite comprises **40 passing automated tests** across unit, schema, storage, simulation calculations, and component rendering in a jsdom environment.
- Due to headless browser Chrome DevTools Protocol (CDP) connection limitations in the current local environment, end-to-end real browser automation was not executed during this verification cycle.
- **No formal accessibility certification or full production release readiness is claimed.** Manual cross-browser validation remains required prior to formal release.

---

## 📜 Licensing & Scope

This repository contains open-source software released under the **MIT License**.

All applications run locally in the user's browser. No user data is collected, stored remotely, or transmitted.
Synthetic demonstration data is illustrative and does not represent any real institution or programme.
