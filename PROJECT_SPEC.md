# PROJECT_SPEC: cloudpedagogy-curriculum-simulation-tool

## 1. Repo Name
`cloudpedagogy-curriculum-simulation-tool`

## 2. One-Sentence Purpose
A local-first application for exploring, stress-testing, and comparing curriculum scenarios through weekly student workload, assessment congestion, and competency scaffolding modelling.

## 3. Problem the App Solves
Static curriculum matrices fail to capture the temporal dimension of learning; CST visualises how students experience study hours and assessment clustering week-by-week across 12-week terms, enabling academic teams to identify structural bottlenecks before institutional approval.

## 4. Primary User / Audience
Programme leaders, curriculum designers, directors of education, and academic quality leads.

## 5. Core Role in the CloudPedagogy Ecosystem
The **Scenario Simulator** within Phase 1 (Curriculum Spine). It builds upon structural curriculum nodes from the Mapping Engine (CAME) to model temporal workloads and trade-offs.

## 6. Main Entities / Data Structures (Schema 1.0.0)
- **CstWorkspace**: Top-level container (`schemaVersion: "1.0.0"`, `baseline`, `scenarios[]`, `activeScenarioId`).
- **SimulationDataset**: Coherent curriculum model containing modules, assessments, skills, workload profiles, settings, and optional governance reflections.
- **Module**: Educational units with credits, learning outcomes, skill tags, and optional prerequisites.
- **Assessment**: Evaluation components with assigned delivery week (1-12), type, and weighting percentage.
- **WorkloadProfile**: 12-week array of study hours associated with a specific module.
- **Skill**: Competency entities with baseline exposure ratings.
- **Scenario**: Named alternative configuration with stable identifier, metadata timestamps, and an isolated `SimulationDataset`.

## 7. Main User Workflows
1. **Onboarding & Setup**: Choose between starting a blank curriculum, importing an existing JSON workspace/dataset, or exploring the calibrated demo.
2. **Protected Baseline Inspection**: Review baseline reference metrics without risk of accidental mutation.
3. **Direct Scenario Authoring & Modelling**: Edit weekly hours per module, redistribute hours evenly, smooth spikes, reschedule assessment weeks and weights, and add or delete modules with referential integrity.
4. **Multi-Scenario Comparison**: Select any two configurations (Baseline vs Scenario A, Scenario A vs Scenario B) to contrast workload curves, peak pressure, overload weeks, credit distributions, and skill progression.
5. **Scenario Lifecycle**: Duplicate, rename, reset to baseline, export as JSON, or replace baseline with explicit confirmation.
6. **Governance Documentation**: Record optional reflections on AI involvement, structural assumptions, risks, and academic review notes.

## 8. Current Implemented Features (Batches 1 & 2)
- **Schema 1.0.0 & Defensive Isolation**: Versioned schema with runtime Zod validation and immutable baseline protection.
- **UK Credit & Workload Reconciliation**: Adheres to 1 UK credit = 10 notional hours convention (60 credits = 600 hours). Distinguishes 500 teaching block hours from 100 independent study hours transparently.
- **Authoritative Threshold Boundaries**: Overload ($\ge 45\text{h}$), High ($\ge 35\text{h}$), Target ($40\text{h}$), Moderate ($20\text{h}$), Spike Delta ($\ge 15\text{h}$). Consistent persona scaling (Full-time 1.0x, Part-time 0.5x, Intensive 1.2x).
- **Direct Scenario Authoring**: 12-week cell-level weekly workload inputs, "Distribute Evenly", "Smooth Peak Weeks", assessment deadline/weight editing, module credit adjustments, module deletion referential integrity cascade, and reset to baseline.
- **Assessment Congestion Analysis**: Credit-weighted programme assessment load $(W_a \times C_m)/C_{\text{total}}$, transparent multi-module congestion flags, high-stakes identification, and unassigned assessment tracking.
- **Honest Skill Exposure Model**: Replaced pseudo-scientific "% mastery" formulas with transparent curriculum touchpoints, practice weeks, developmental staging, and documented assessment evidence.
- **Multi-Scenario Comparison Dashboard**: Arbitrary configuration comparisons (Baseline vs Scenario, Scenario A vs Scenario B), metrics grid ($\Delta\text{h}$, peak delta, overload weeks delta, congestion delta, credit delta).
- **Responsive SVG Pressure Curve & Accessible Table**: Dual-curve workload pressure curve with non-colour visual encodings (solid line + circles vs dashed line + diamonds) and threshold reference lines. Full accessible semantic table equivalent.
- **Rule-Based Planning Heuristics**: Deterministic, executable suggestions for assessment redistribution, workload smoothing, and unassessed competency evidence.
- **Robust Import/Export & Storage Resilience**: Full workspace and scenario JSON import/export, collision-free renaming, referential foreign key validation, storage quota resilience, and corrupted raw download.

## 9. Planned Enhancements (Batch 3)
- **Batch 3 (Hardening)**: WCAG 2.1 AA accessibility compliance audit, performance benchmarking, responsive layout polish, and end-to-end browser acceptance.

## 10. Storage and Persistence Model
- **Storage**: Browser `localStorage` via key `cst_workspace_v1`.
- **Migration**: Automatic migration from legacy key `curriculum_sim_current_dataset`; original legacy records are preserved until successful validation and persistence.
- **Fault Tolerance**: Clear warning on write/quota failure without misleading success indicators; in-memory retention with export option; corrupted storage raw data export before reset; confirmation before exiting demo mode or resetting workspace.

## 11. Relationship to Other CloudPedagogy Apps
- Consumes structural node data from `curriculum-alignment-mapping-engine` (CAME).
- Exports scenario trade-off findings to `programme-governance-dashboard` (PGD) and `curriculum-change-manager` (CCM).
- Strictly preserves application boundaries (no general curriculum catalogue, approval ballots, or student pathway scheduling).

## 12. Quality & Acceptance Verification Status
- 57 automated tests passing across schema, storage, simulation calculations, threshold boundaries, scenario editing, redistribution integrity, comparisons, and skill progression.
- Zero TypeScript compiler errors (`tsc -b`), zero ESLint issues, clean production build (`vite build`).
- Real browser end-to-end automation was not executed during this verification cycle due to local headless CDP connection limitations.

- No formal accessibility certification or commercial release readiness is claimed.
