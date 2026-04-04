import React from 'react';
import { validateDataset } from '../../lib/validation';
import type { SimulationDataset } from '../../types';

interface ValidationWarningsProps {
  dataset: SimulationDataset;
}

export const ValidationWarnings: React.FC<ValidationWarningsProps> = ({ dataset }) => {
  const issues = validateDataset(dataset);
  const errors = issues.filter(i => i.type === 'error');
  const warnings = issues.filter(i => i.type === 'warning');

  if (issues.length === 0) return null;

  return (
    <div className="validation-container">
      <div className="validation-header">
        <h3>Data Integrity & Validation</h3>
        <p className="description">Automated checks for curriculum structural consistency and mapping completeness.</p>
      </div>

      <div className="validation-lists">
        {errors.length > 0 && (
          <div className="validation-group error">
            <h4>Errors ({errors.length})</h4>
            <ul className="issue-list">
              {errors.map((issue, idx) => (
                <li key={idx}>[{issue.source}] {issue.message}</li>
              ))}
            </ul>
          </div>
        )}

        {warnings.length > 0 && (
          <div className="validation-group warning">
            <h4>Warnings ({warnings.length})</h4>
            <ul className="issue-list">
              {warnings.map((issue, idx) => (
                <li key={idx}>[{issue.source}] {issue.message}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};
