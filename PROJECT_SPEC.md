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
3. **Multi-Scenario Exploration**: Branch editable scenarios from baseline, tweak assessment deadlines or workload allocations, and compare with original baseline profiles.
4. **Scenario Lifecycle**: Duplicate, rename, reset to baseline, export as JSON, or replace baseline with explicit confirmation.
5. **Governance Documentation**: Record optional reflections on AI involvement, structural assumptions, risks, and academic review notes.

## 8. Current Implemented Features (Batch 1)
- Schema 1.0.0 specification with runtime Zod validation and defensive deep cloning.
- Immutable baseline protection: edits made in alternative scenarios never mutate reference baseline.
- Multi-scenario management (create, duplicate, rename, reset, delete, switch).
- Robust JSON import/export (workspace, single-scenario, and legacy datasets).
- Scenario import integrity: coherent baseline creation for empty applications, duplicate scenario ID re-keying, foreign key referential validation, missing workload profile repair, and deep isolation.
- Blank-first onboarding default with basic module and workload authoring modal.
- Calibrated 4-module Public Health demo curriculum: 60 UK credits = 600 notional hours (500 teaching block hours, ~41.7h/week average load for full-time students; 100 independent study hours).
- Automated risk detection for workload peaks ($\ge 45\text{h}$), spikes ($\ge 15\text{h}$ jump), and assessment clustering.
- Student persona scaling (Full-time 1.0x, Part-time 0.5x, Intensive 1.2x).
- Full Vitest automated test suite (40 tests covering schema, storage, isolation, import/export, and calculations).

## 9. Planned Enhancements (Batches 2 & 3)
- **Batch 2**: Side-by-side scenario comparison dashboard, visual workload diffing, cell-level weekly hour editing, and upgraded AI suggestion logic.
- **Batch 3**: WCAG 2.1 AA accessibility compliance audit, performance benchmarking, responsive layout polish, and end-to-end browser acceptance.

## 10. Storage and Persistence Model
- **Storage**: Browser `localStorage` via key `cst_workspace_v1`.
- **Migration**: Automatic migration from legacy key `curriculum_sim_current_dataset`; original legacy records are preserved until successful validation and persistence.
- **Fault Tolerance**: Clear warning on write/quota failure without misleading success indicators; in-memory retention with export option; corrupted storage raw data export before reset; confirmation before exiting demo mode or resetting workspace.

## 11. Relationship to Other CloudPedagogy Apps
- Consumes structural node data from `curriculum-alignment-mapping-engine` (CAME).
- Exports scenario trade-off findings to `programme-governance-dashboard` (PGD) and `curriculum-change-manager` (CCM).
- Strictly preserves application boundaries (no general curriculum catalogue, approval ballots, or student pathway scheduling).

## 12. Quality & Acceptance Verification Status
- 40 automated tests passing across schema, storage, simulation calculations, and components.
- Zero TypeScript compiler errors (`tsc -b`), zero ESLint issues, clean production build (`vite build`).
- Real browser end-to-end automation was not executed during this verification cycle due to local headless CDP connection limitations.
- No formal accessibility certification or commercial release readiness is claimed.
