import type { SimulationDataset } from '../../types';

interface TimelineViewProps {
  dataset: SimulationDataset;
}

export const TimelineView: React.FC<TimelineViewProps> = ({ dataset }) => {
  const { modules, assessments, workload } = dataset;
  
  // Assume a 12-week timeline based on the demo data
  const weeks = Array.from({ length: 12 }, (_, i) => i + 1);

  const getModuleWorkloadForWeek = (moduleId: string, weekIndex: number) => {
    const profile = workload.find(w => w.moduleId === moduleId);
    return profile?.weeklyHours[weekIndex] || 0;
  };

  const getAssessmentsForWeek = (week: number) => {
    return assessments.filter(a => a.week === week);
  };

  const calculateTotalWorkloadForWeek = (weekIndex: number) => {
    return workload.reduce((sum, profile) => sum + (profile.weeklyHours[weekIndex] || 0), 0);
  };

  const getIntensityClass = (hours: number) => {
    if (hours > 40) return 'intensity-critical';
    if (hours > 30) return 'intensity-high';
    if (hours > 20) return 'intensity-medium';
    return 'intensity-low';
  };

  return (
    <div className="timeline-container">
      <div className="timeline-header">
        <div className="timeline-row">
          <div className="timeline-label">Weeks</div>
          {weeks.map(week => (
            <div key={week} className="timeline-week-head">
              Week {week}
            </div>
          ))}
        </div>
      </div>

      <div className="timeline-body">
        {/* Module Rows */}
        {modules.map(module => (
          <div key={module.id} className="timeline-row module-row">
            <div className="timeline-label">
              <span className="module-code">{module.code}</span>
              <span className="module-title">{module.title}</span>
            </div>
            {weeks.map((week, idx) => {
              const hours = getModuleWorkloadForWeek(module.id, idx);
              const weekAssessments = assessments.filter(a => a.moduleId === module.id && a.week === week);
              
              return (
                <div key={week} className={`timeline-cell ${hours > 0 ? 'active' : ''}`}>
                  {hours > 0 && <span className="hour-label">{hours}h</span>}
                  {weekAssessments.map(asmt => (
                    <div key={asmt.id} className="asmt-marker" title={asmt.name}>
                      !
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        ))}

        {/* Summary Row */}
        <div className="timeline-row summary-row">
          <div className="timeline-label">Total Workload</div>
          {weeks.map((week, idx) => {
            const totalHours = calculateTotalWorkloadForWeek(idx);
            const totalAsmts = getAssessmentsForWeek(week).length;
            
            return (
              <div key={week} className={`timeline-cell summary-cell ${getIntensityClass(totalHours)}`}>
                <div className="total-hours">{totalHours}h</div>
                {totalAsmts > 0 && <div className="total-asmts">{totalAsmts} Assessments</div>}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
