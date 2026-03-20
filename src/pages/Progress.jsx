import { useMemo } from 'react';
import { getAssessmentHistory, getWorkoutHistory } from '../utils/storage';
import './Progress.css';

export default function Progress({ onBack }) {
  const assessmentHistory = getAssessmentHistory();
  const workoutHistory = getWorkoutHistory();

  const stats = useMemo(() => {
    if (!workoutHistory?.length) return null;

    const totalWorkouts = workoutHistory.length;
    const thisWeek = workoutHistory.filter(w => {
      const d = new Date(w.date);
      const now = new Date();
      const weekAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);
      return d >= weekAgo;
    }).length;

    const avgIntensity = Math.round(
      workoutHistory.reduce((sum, w) => sum + (w.intensity || 0), 0) / totalWorkouts
    );

    return { totalWorkouts, thisWeek, avgIntensity };
  }, [workoutHistory]);

  const assessmentTrend = useMemo(() => {
    if (!assessmentHistory?.length) return null;
    return assessmentHistory.map((a, i) => ({
      index: i + 1,
      date: new Date(a.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      maxHang: Math.round(a.analyzed?.maxHangTime || 0),
      avgHang: Math.round(a.analyzed?.avgHangTime || 0),
      repeaters: a.analyzed?.maxRepeaterReps || 0,
      level: a.analyzed?.suggestedLevel || 1,
    }));
  }, [assessmentHistory]);

  return (
    <div className="progress-page">
      <div className="progress-header">
        <button className="btn-icon" onClick={onBack}>&larr;</button>
        <h2>Progress & History</h2>
      </div>

      {/* Workout stats */}
      {stats && (
        <div className="section">
          <h3>Workout Stats</h3>
          <div className="stats-grid">
            <div className="stat-card">
              <span className="stat-big">{stats.totalWorkouts}</span>
              <span className="stat-desc">Total Workouts</span>
            </div>
            <div className="stat-card">
              <span className="stat-big">{stats.thisWeek}</span>
              <span className="stat-desc">This Week</span>
            </div>
            <div className="stat-card">
              <span className="stat-big">{stats.avgIntensity}%</span>
              <span className="stat-desc">Avg Intensity</span>
            </div>
          </div>
        </div>
      )}

      {/* Assessment history */}
      {assessmentTrend && assessmentTrend.length > 0 && (
        <div className="section">
          <h3>Assessment History</h3>
          <div className="assessment-table">
            <div className="table-header">
              <span>Date</span>
              <span>Max Hang</span>
              <span>Avg Hang</span>
              <span>Repeaters</span>
            </div>
            {assessmentTrend.map((a, i) => (
              <div key={i} className="table-row">
                <span>{a.date}</span>
                <span className="val">{a.maxHang}s</span>
                <span className="val">{a.avgHang}s</span>
                <span className="val">{a.repeaters}</span>
              </div>
            ))}
          </div>

          {/* Simple bar chart for max hang trend */}
          {assessmentTrend.length > 1 && (
            <div className="trend-chart">
              <h4>Max Hang Trend</h4>
              <div className="bars">
                {assessmentTrend.map((a, i) => {
                  const maxVal = Math.max(...assessmentTrend.map(x => x.maxHang));
                  const height = maxVal > 0 ? (a.maxHang / maxVal) * 100 : 0;
                  return (
                    <div key={i} className="bar-col">
                      <div className="bar" style={{ height: `${height}%` }}>
                        <span className="bar-val">{a.maxHang}s</span>
                      </div>
                      <span className="bar-date">{a.date}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Improvement indicator */}
          {assessmentTrend.length >= 2 && (() => {
            const first = assessmentTrend[0];
            const last = assessmentTrend[assessmentTrend.length - 1];
            const hangDiff = last.maxHang - first.maxHang;
            const repDiff = last.repeaters - first.repeaters;
            return (
              <div className="improvement">
                <h4>Progress Since First Assessment</h4>
                <div className="improvement-row">
                  <span>Max Hang</span>
                  <span className={hangDiff >= 0 ? 'positive' : 'negative'}>
                    {hangDiff >= 0 ? '+' : ''}{hangDiff}s
                  </span>
                </div>
                <div className="improvement-row">
                  <span>Repeaters</span>
                  <span className={repDiff >= 0 ? 'positive' : 'negative'}>
                    {repDiff >= 0 ? '+' : ''}{repDiff} reps
                  </span>
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* Workout log */}
      {workoutHistory?.length > 0 && (
        <div className="section">
          <h3>Workout Log</h3>
          <div className="workout-log">
            {[...workoutHistory].reverse().slice(0, 20).map((w, i) => (
              <div key={i} className="log-item">
                <div className="log-date">
                  {new Date(w.date).toLocaleDateString('en-US', {
                    weekday: 'short', month: 'short', day: 'numeric'
                  })}
                </div>
                <div className="log-details">
                  <span className="log-type">{w.type}</span>
                  {w.microCycleDay && <span className="log-micro">{w.microCycleDay}</span>}
                </div>
                <div className="log-intensity">{w.intensity}%</div>
                <div className="log-exercises">
                  {w.completedCount}/{w.exerciseCount}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {(!workoutHistory?.length && !assessmentHistory?.length) && (
        <div className="empty-state">
          <p>No data yet. Complete your first assessment and workout to see your progress here.</p>
        </div>
      )}
    </div>
  );
}
