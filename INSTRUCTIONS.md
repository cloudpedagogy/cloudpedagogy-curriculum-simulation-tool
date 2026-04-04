# Curriculum Simulation Tool: Instruction Manual

Welcome to the **Curriculum Simulation Tool**, a professional environment designed for programme teams, curriculum designers, and academic leadership to model and analyze curriculum coherence, workload distribution, and professional capability development.

## 🚀 Getting Started

1.  **Initialize the Environment**: Launch the tool in your browser (local or hosted version).
2.  **Load Baseline**: Click the **"Load Public Health Baseline"** button to populate the dashboard with the standard Public Health and Health Systems curriculum.
3.  **Explore Analytics**: Review the summary cards for an immediate overview of regional workload peaks, assessment clustering, and structural risk signals.

---

## 📊 Analytical Core

The tool provides five primary analytical layers to support academic oversight:

### 1. Progression Modelling: Curriculum Timeline
A week-by-week mapping of module activity and assessment deadlines. High-intensity weeks are flagged with red icons to indicate potential oversubscription.

### 2. Workload Distribution Analysis
Visualizes the aggregate weekly hours across all active modules.
- **Critical Overload Signals**: Triggered when the total hours exceed 40h/week.
- **Interpretive Signals**: Summarizes peaks and sustained high-intensity periods to inform clinical or research placement scheduling.

### 3. Assessment Pattern Analysis
Maps deadline distribution and assessment method variety (e.g., Essays, Reports, Portfolios).
- **Assessment Clustering**: Identifies weeks where students face multiple concurrent deadlines.
- **Diversity Audit**: Summarizes the variety of evaluation methods used throughout the programme.

### 4. Capability Development (Skill Progression)
Tracks how professional competencies (e.g., Epidemiological Reasoning, Policy Analysis) are introduced, reinforced, and advanced across the timeline.
- **Scaffolding Signals**: Flags competencies that lack sufficient reinforcement (appears in only one module).

---

## 🧪 Scenario Testing & Modelling

The **Pathway Simulation & Modelling** suite allows you to test curriculum refinements without altering the baseline data.

1.  **Adjust Sequencing**: Move assessment deadlines or modify module intensity using the `-` and `+` controls.
2.  **Model Impact**: The **Scenario Comparison & Impact Analysis** section automatically calculates the delta between your experimental scenario and the baseline (e.g., *"Modelled delta: -5h strain"*).
3.  **Optional Simulation Intelligence**: Review rule-based suggestions (e.g., *"Redistribute High-Stakes Clustering"*) and click **"Review & Integrate"** to apply them to your scenario.
4.  **Baseline Persistance**: If a refinement is approved by the programme team, click **"Persist Baseline"** to set the current experimental state as the new fixed baseline for further modelling.

---

## 🛡️ Governance & Transparency

This tool adheres to high standards of academic oversight:

- **Logic Disclosure**: The **Methodology** panel at the bottom of the dashboard explains the deterministic rules and pedagogical assumptions behind every signal.
- **Non-Prescriptive Design**: All suggestions are non-binding interpretive aids. The tool does not automate curriculum "optimization" or prescribe pedagogical fixes.
- **Local-First Privacy**: No data is transmitted to external servers. All simulations run entirely in your local browser session.

---

## 🛠️ Data Management

- **Persist Baseline**: Saves the current state to your browser's `localStorage` as the new modelling baseline.
- **Reset Environment**: Clears all experimental changes and stored data, returning the tool to a clean state.
- **Import/Export**: (Coming in professional distribution) Allows for the formal sharing of curriculum JSON models between programme teams.

---

**Academic Oversight Reminder**: This environment is designed for internal reflection and professional dialogue. It should always be used in conjunction with academic judgement and institutional quality assurance processes.
