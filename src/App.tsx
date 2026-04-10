import { useState, useEffect, useMemo } from 'react';
import { demoDataset } from './data/demo';
import { storage } from './lib/storage';
import type { SimulationDataset } from './types';
import { TimelineView } from './features/timeline/TimelineView';
import { WorkloadAnalyzer } from './features/workload/WorkloadAnalyzer';
import { AssessmentAnalyzer } from './features/assessments/AssessmentAnalyzer';
import { SkillProgressionView } from './features/skills/SkillProgressionView';
import { ScenarioEditor } from './features/scenarios/ScenarioEditor';
import { ScenarioDiff } from './features/scenarios/ScenarioDiff';
import { ValidationWarnings } from './features/governance/ValidationWarnings';
import { MethodologyPanel } from './features/governance/MethodologyPanel';
import { RiskSignalsPanel } from './features/governance/RiskSignalsPanel';
import { AISuggestionPanel } from './features/scenarios/AISuggestionPanel';

function App() {
  const [dataset, setDataset] = useState<SimulationDataset | null>(null);
  const [baseDataset, setBaseDataset] = useState<SimulationDataset | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  useEffect(() => {
    if (statusMessage) {
      const timer = setTimeout(() => setStatusMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [statusMessage]);

  useEffect(() => {
    const savedDataset = storage.loadDataset();
    if (savedDataset) {
      setDataset(savedDataset);
      setBaseDataset(savedDataset);
    }
  }, []);

  const handleLoadDemo = () => {
    console.log('Loading Public Health Baseline...');
    setDataset(demoDataset);
    setBaseDataset(demoDataset);
    storage.saveDataset(demoDataset);
    setStatusMessage('Baseline curriculum loaded.');
  };

  const handleUpdateDataset = (updated: SimulationDataset) => {
    setDataset(updated);
  };

  const handleResetScenario = () => {
    if (baseDataset) {
      setDataset(baseDataset);
      setStatusMessage('Pathway modifications reset to baseline.');
    }
  };

  const handlePersist = () => {
    console.log('Attempting to persist baseline...');
    if (dataset) {
      storage.saveDataset(dataset);
      setBaseDataset({ ...dataset }); // Force new reference
      setStatusMessage('Scenario persisted as new baseline.');
      console.log('Baseline persisted successfully.');
    } else {
      console.warn('Persist failed: No dataset loaded.');
    }
  };

  const handleClear = () => {
    console.log('Resetting simulation environment...');
    setDataset(null);
    setBaseDataset(null);
    storage.resetData();
    setStatusMessage('Simulation environment reset.');
    console.log('Simulation environment cleared.');
  };

  const handleImport = () => {
    console.log('Import requested (stub)');
    setStatusMessage('Import: Coming soon in professional version.');
  };

  const handleExport = () => {
    console.log('Export requested (stub)');
    setStatusMessage('Export: Dataset JSON prepared for export.');
  };

  const modulesCount = dataset?.modules.length || 0;
  const assessmentCount = dataset?.assessments.length || 0;

  const metrics = useMemo(() => {
    if (!dataset) return { maxWorkload: 0, maxWeek: 0, heavyWeeks: 0 };
    
    let maxWorkload = 0;
    let maxWeek = 0;
    let heavyWeeks = 0;

    for (let i = 0; i < 12; i++) {
      const weeklyWorkload = dataset.workload.reduce((sum, p) => sum + (p.weeklyHours[i] || 0), 0);
      const weeklyAsmts = dataset.assessments.filter(a => a.week === i + 1).length;

      if (weeklyWorkload > maxWorkload) {
        maxWorkload = weeklyWorkload;
        maxWeek = i + 1;
      }

      if (weeklyAsmts > 1) {
        heavyWeeks++;
      }
    }

    return { maxWorkload, maxWeek, heavyWeeks };
  }, [dataset]);

  return (
    <div className="container">
      <nav style={{ padding: '1rem 0', marginBottom: '1rem' }}>
        <a 
          href="https://www.cloudpedagogy.com/" 
          target="_blank" 
          rel="noopener noreferrer"
          style={{ 
            fontSize: '0.75rem', 
            textDecoration: 'none', 
            color: '#666666',
            fontWeight: 500,
            letterSpacing: '0.05em',
            textTransform: 'uppercase'
          }}
        >
          CloudPedagogy
        </a>
      </nav>

      <header>
        <div className="header-top">
          <div>
            <div style={{ fontSize: '0.75rem', color: '#666666', marginBottom: '0.25rem', textTransform: 'uppercase', fontWeight: 600 }}>Curriculum Simulation Tool</div>
            <h1>Academic Programme Modelling</h1>
          </div>
          <div className="controls">
            <button type="button" className="btn btn-primary" onClick={handleLoadDemo}>Load Public Health Baseline</button>
            <button type="button" className="btn" onClick={handlePersist}>Persist Baseline</button>
            <button type="button" className="btn btn-ghost" onClick={handleClear}>Reset Environment</button>
            <button type="button" className="btn btn-ghost" onClick={handleImport}>Import Dataset</button>
            <button type="button" className="btn btn-ghost" onClick={handleExport}>Export Dataset</button>
          </div>
        </div>
        {statusMessage && (
          <div className="status-toast" style={{ marginBottom: '2rem' }}>
            <span className="status-icon">✓</span> {statusMessage}
          </div>
        )}
        <p className="description">
          A high-fidelity environment for the simulation of curriculum coherence, workload distribution, and professional capability development.
        </p>
        <div className="disclaimer">
          <strong>Institutional Governance:</strong> This system is designed to support governance frameworks and academic quality assurance. It provides analytical support for curriculum design decisions but does not replace professional academic judgement.
        </div>
      </header>

      {dataset && <ValidationWarnings dataset={dataset} />}

      <main className="dashboard-grid">
        <div className="card">
          <h2>Curriculum Coherence</h2>
          <div className="card-stat">{modulesCount}</div>
          <div className="card-label">Active professional modules</div>
        </div>

        <div className="card">
          <h2>Assessment Pattern</h2>
          <div className="card-stat">{assessmentCount}</div>
          <div className="card-label">Baseline evaluation components</div>
        </div>

        <div className="card">
          <h2>Workload Distribution</h2>
          <div className="card-stat">{metrics.maxWorkload}h</div>
          <div className="card-label">Week {metrics.maxWeek} (Peak Intensity)</div>
        </div>

        <div className="card">
          <h2>Risk Signals</h2>
          <div className="card-stat">{metrics.heavyWeeks}</div>
          <div className="card-label">Weeks with assessment clustering</div>
        </div>
      </main>

      {dataset && (
        <div className="scenario-impact-container">
          {dataset && baseDataset && (
            <div className="scenario-comparison-section">
              <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', fontWeight: 600 }}>Scenario Comparison & Impact Analysis</h2>
              <ScenarioDiff base={baseDataset} current={dataset} />
            </div>
          )}
        </div>
      )}

      {dataset && (
        <>
          <section className="simulation-controls-section" style={{ marginTop: '4rem', borderTop: '1px solid #E5E7EB', paddingTop: '3rem' }}>
            <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', fontWeight: 600 }}>Scenario Testing & Modelling</h2>
            <ScenarioEditor 
              dataset={dataset} 
              onUpdate={handleUpdateDataset} 
              onReset={handleResetScenario} 
            />
          </section>
          
          <section className="analytical-views-section">
            <AISuggestionPanel 
              dataset={dataset} 
              onApplySuggestion={handleUpdateDataset} 
            />
            <div className="view-container" style={{ marginTop: '4rem', borderTop: '1px solid #E5E7EB', paddingTop: '3rem' }}>
              <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', fontWeight: 600 }}>Structural Risk Signals</h2>
              <RiskSignalsPanel dataset={dataset} />
            </div>
            <div className="view-container" style={{ marginTop: '4rem', borderTop: '1px solid #E5E7EB', paddingTop: '3rem' }}>
              <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', fontWeight: 600 }}>Progression Modelling: Curriculum Timeline</h2>
              <TimelineView dataset={dataset} />
            </div>
            <div className="view-container" style={{ marginTop: '4rem', borderTop: '1px solid #E5E7EB', paddingTop: '3rem' }}>
              <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', fontWeight: 600 }}>Workload Distribution Analysis</h2>
              <WorkloadAnalyzer dataset={dataset} />
            </div>
            <div className="view-container" style={{ marginTop: '4rem', borderTop: '1px solid #E5E7EB', paddingTop: '3rem' }}>
              <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', fontWeight: 600 }}>Assessment Pattern Analysis</h2>
              <AssessmentAnalyzer dataset={dataset} />
            </div>
            <div className="view-container" style={{ marginTop: '4rem', borderTop: '1px solid #E5E7EB', paddingTop: '3rem' }}>
              <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', fontWeight: 600 }}>Capability Development: Skill Progression Mapping</h2>
              <SkillProgressionView dataset={dataset} />
            </div>
            <div style={{ marginTop: '4rem', borderTop: '1px solid #E5E7EB', paddingTop: '3rem' }}>
              <MethodologyPanel />
            </div>
          </section>
        </>
      )}

      {!dataset && (
        <div className="empty-state">
          <p>No curriculum data loaded. Use "Load Public Health Baseline" to get started.</p>
        </div>
      )}

      <footer style={{ 
        marginTop: '6rem', 
        padding: '3rem 0', 
        borderTop: '1px solid #E5E7EB', 
        textAlign: 'center',
        color: '#666666',
        fontSize: '0.8125rem'
      }}>
        CloudPedagogy · Governance-ready AI and curriculum systems
      </footer>
    </div>
  );
}

export default App;
