import React from 'react';

export const MethodologyPanel: React.FC = () => {
  return (
    <div className="methodology-container">
      <div className="methodology-header">
        <h2>Methodology & Simulation Logic</h2>
        <p className="description">Understanding the deterministic rules and pedagogical assumptions behind the Public Health Curriculum Simulation.</p>
      </div>

      <div className="methodology-content">
        <section>
          <h3>Workload Distribution Analysis</h3>
          <p>Weekly workload is the summation of projected hours per week for all active health professional modules. Overload signals are triggered when the aggregate total exceeds 40h per week, reflecting periods of high clinical or research intensity.</p>
        </section>

        <section>
          <h3>Professional Assessment Clustering</h3>
          <p>Clusters are identified by counting valid professional assessment deadlines per week. A "High Concentration" signal is generated if multiple assessments fall in the same week, regardless of their individual weighting, to flag potential student strain.</p>
        </section>

        <section>
          <h3>Competency Progression Modelling</h3>
          <p>Core skills are mapped through 'Introduction', 'Reinforcement', and 'Advanced' stages based on their appearance across the health systems pathway. Scaffolding gaps are flagged when a professional competency lacks reinforcement (appears in only one module).</p>
        </section>

        <section>
          <h3>Pathway Scenario Simulation</h3>
          <p>When changes are made (e.g., shifting a policy brief deadline), the tool recalculates the entire analytical suite instantly. The "Scenario Comparison" logic shows the delta between the current experimental state and the fixed baseline curriculum.</p>
        </section>

        <section>
          <h3>Limitations & Governance</h3>
          <p>The tool does <strong>NOT</strong>:</p>
          <ul>
            <li>Model individual student performance or clinical proficiency.</li>
            <li>Predict specific public health outcomes.</li>
            <li>Automate curriculum "optimisation" or prescriptive pedagogical fixes.</li>
            <li>Substitute for institutional quality assurance or professional accreditation processes.</li>
          </ul>
        </section>

        <div className="governance-disclaimer">
          <p><strong>Governance Statement:</strong> This simulation environment is designed for internal reflection and professional dialogue. It is structured to provide interpretive signals and should <strong>never</strong> replace academic judgement or professional oversight.</p>
        </div>
      </div>
    </div>
  );
};
