import { useMemo, useState, useCallback } from 'react';
import {
  getAssessmentHistory,
  getWorkoutHistory,
  getGoals,
  updateWorkoutHistoryItem,
  deleteWorkoutHistoryItem,
} from '../utils/storage';
import { getProgressPercent, getSkillStatus } from '../utils/goalGenerator';
import { formatWorkoutSummary, formatAssessmentSummary, copyToClipboard } from '../utils/share';
import './Progress.css';

export default function Progress({ onBack }) {
  const [assessmentHistory] = useState(() => getAssessmentHistory());
  const [workoutHistory, setWorkoutHistory] = useState(() => getWorkoutHistory());
  const goals = getGoals();
  const [copiedId, setCopiedId] = useState(null);
  const [expandedIndex, setExpandedIndex] = useState(null); // actual array index
  const [editingIndex, setEditingIndex] = useState(null);
  const [editData, setEditData] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  async function handleShareWorkout(w, i) {
    const text = formatWorkoutSummary(w);
    await copyToClipboard(text);
    setCopiedId(`w-${i}`);
    setTimeout(() => setCopiedId(null), 2000);
  }

  async function handleShareAssessment(a, i) {
    const text = formatAssessmentSummary(a);
    await copyToClipboard(text);
    setCopiedId(`a-${i}`);
    setTimeout(() => setCopiedId(null), 2000);
  }

  // Reverse display order but track real indices
  const displayWorkouts = useMemo(() => {
    if (!workoutHistory?.length) return [];
    return workoutHistory
      .map((w, i) => ({ ...w, _realIndex: i }))
      .reverse()
      .slice(0, 30);
  }, [workoutHistory]);

  function handleToggleExpand(realIndex) {
    setExpandedIndex(prev => (prev === realIndex ? null : realIndex));
    setEditingIndex(null);
    setEditData(null);
  }

  function handleStartEdit(realIndex) {
    const w = workoutHistory[realIndex];
    setEditingIndex(realIndex);
    setEditData({
      type: w.type,
      intensity: w.intensity,
      microCycleDay: w.microCycleDay || '',
      exercises: w.exercises
        ? w.exercises.map(ex => ({ ...ex }))
        : null,
    });
  }

  function handleSaveEdit(realIndex) {
    if (!editData) return;
    const updated = { ...editData };
    if (updated.exercises) {
      updated.completedCount = updated.exercises.filter(e => e.status === 'completed').length;
      updated.failedCount = updated.exercises.filter(e => e.status === 'failed').length;
      updated.exerciseCount = updated.exercises.length;
    }
    updateWorkoutHistoryItem(realIndex, updated);
    setWorkoutHistory(getWorkoutHistory());
    setEditingIndex(null);
    setEditData(null);
  }

  function handleCancelEdit() {
    setEditingIndex(null);
    setEditData(null);
  }

  function handleDelete(realIndex) {
    deleteWorkoutHistoryItem(realIndex);
    setWorkoutHistory(getWorkoutHistory());
    setExpandedIndex(null);
    setDeleteConfirm(null);
  }

  function toggleExerciseStatus(exIdx) {
    if (!editData?.exercises) return;
    setEditData(prev => ({
      ...prev,
      exercises: prev.exercises.map((ex, i) =>
        i === exIdx
          ? { ...ex, status: ex.status === 'completed' ? 'failed' : ex.status === 'failed' ? 'skipped' : 'completed' }
          : ex
      ),
    }));
  }

  const stats = useMemo(() => {
    if (!workoutHistory?.length) return null;
    const totalWorkouts = workoutHistory.length;
    const thisWeek = workoutHistory.filter(w => {
      const d = new Date(w.date);
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
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

      {/* Goals & Expected Progress */}
      {goals && Object.keys(goals.skills).length > 0 && (
        <div className="section">
          <h3>Goals & Expected Progress</h3>
          <p className="goals-note">Conservative targets: ~5% improvement per 2-week cycle</p>
          <div className="goals-detail-list">
            {Object.entries(goals.skills).map(([key, skill]) => {
              const pct = skill.lowerIsBetter
                ? (skill.baseline > skill.target8Week
                  ? getProgressPercent(skill.baseline - skill.current + skill.baseline, skill.baseline, skill.baseline + (skill.baseline - skill.target8Week))
                  : 0)
                : getProgressPercent(skill.current, skill.baseline, skill.target8Week);
              const status = getSkillStatus(skill);
              return (
                <div key={key} className="goal-detail-card">
                  <div className="goal-detail-header">
                    <span className="goal-detail-label">{skill.label}</span>
                    <span className="goal-detail-status" style={{ color: status.color }}>
                      {status.label}
                    </span>
                  </div>
                  <div className="goal-detail-bar-track">
                    <div className="goal-detail-bar-fill" style={{ width: `${Math.min(100, Math.max(0, pct))}%` }} />
                    <div className="milestone" style={{ left: `${getProgressPercent(skill.target2Week, skill.baseline, skill.target8Week)}%` }}>
                      <span className="milestone-label">2w</span>
                    </div>
                    <div className="milestone" style={{ left: `${getProgressPercent(skill.target4Week, skill.baseline, skill.target8Week)}%` }}>
                      <span className="milestone-label">4w</span>
                    </div>
                  </div>
                  <div className="goal-timeline">
                    <div className="timeline-point">
                      <span className="tp-value">{skill.baseline}{skill.unit === 'seconds' ? 's' : skill.unit === '%' ? '%' : ''}</span>
                      <span className="tp-label">Baseline</span>
                    </div>
                    <span className="timeline-arrow">&rarr;</span>
                    <div className="timeline-point">
                      <span className="tp-value">{Math.round(skill.target2Week)}{skill.unit === 'seconds' ? 's' : skill.unit === '%' ? '%' : ''}</span>
                      <span className="tp-label">2 weeks</span>
                    </div>
                    <span className="timeline-arrow">&rarr;</span>
                    <div className="timeline-point">
                      <span className="tp-value">{Math.round(skill.target4Week)}{skill.unit === 'seconds' ? 's' : skill.unit === '%' ? '%' : ''}</span>
                      <span className="tp-label">4 weeks</span>
                    </div>
                    <span className="timeline-arrow">&rarr;</span>
                    <div className="timeline-point highlight">
                      <span className="tp-value">{Math.round(skill.target8Week)}{skill.unit === 'seconds' ? 's' : skill.unit === '%' ? '%' : ''}</span>
                      <span className="tp-label">8 weeks</span>
                    </div>
                  </div>
                  <div className="goal-current">
                    Current: <strong>{skill.current}{skill.unit === 'seconds' ? 's' : skill.unit === '%' ? '%' : ''}</strong>
                    {' '}({Math.round(pct)}% toward 8-week goal)
                    {skill.rate && <span className="rate-badge">+{Math.round(skill.rate * 100)}%/cycle</span>}
                  </div>
                </div>
              );
            })}
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
              <span>Reps</span>
              <span></span>
            </div>
            {assessmentTrend.map((a, i) => (
              <div key={i} className="table-row">
                <span>{a.date}</span>
                <span className="val">{a.maxHang}s</span>
                <span className="val">{a.avgHang}s</span>
                <span className="val">{a.repeaters}</span>
                <button
                  className="btn-share-sm"
                  onClick={() => handleShareAssessment(assessmentHistory[i], i)}
                >
                  {copiedId === `a-${i}` ? 'Copied!' : 'Share'}
                </button>
              </div>
            ))}
          </div>

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
      {displayWorkouts.length > 0 && (
        <div className="section">
          <h3>Workout Log</h3>
          <div className="workout-log">
            {displayWorkouts.map((w) => {
              const ri = w._realIndex;
              const isExpanded = expandedIndex === ri;
              const isEditing = editingIndex === ri;
              const isDeleting = deleteConfirm === ri;

              return (
                <div key={ri} className={`log-entry ${isExpanded ? 'expanded' : ''}`}>
                  {/* Summary row — clickable */}
                  <div className="log-item" onClick={() => handleToggleExpand(ri)}>
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
                    <span className={`log-chevron ${isExpanded ? 'open' : ''}`}>&#9662;</span>
                  </div>

                  {/* Expanded detail */}
                  {isExpanded && (
                    <div className="log-detail">
                      {/* Action bar */}
                      <div className="log-actions">
                        <button
                          className="btn-share-sm"
                          onClick={(e) => { e.stopPropagation(); handleShareWorkout(w, ri); }}
                        >
                          {copiedId === `w-${ri}` ? 'Copied!' : 'Share'}
                        </button>
                        {!isEditing && (
                          <button className="btn-share-sm" onClick={() => handleStartEdit(ri)}>
                            Edit
                          </button>
                        )}
                        {!isDeleting ? (
                          <button className="btn-share-sm btn-delete-sm" onClick={() => setDeleteConfirm(ri)}>
                            Delete
                          </button>
                        ) : (
                          <span className="delete-confirm">
                            <span className="delete-confirm-text">Delete?</span>
                            <button className="btn-share-sm btn-delete-sm" onClick={() => handleDelete(ri)}>Yes</button>
                            <button className="btn-share-sm" onClick={() => setDeleteConfirm(null)}>No</button>
                          </span>
                        )}
                      </div>

                      {/* Exercise list */}
                      {w.exercises?.length > 0 ? (
                        <div className="exercise-detail-list">
                          {(isEditing ? editData.exercises : w.exercises).map((ex, ei) => (
                            <div
                              key={ei}
                              className={`exercise-detail-row ${ex.status === 'failed' ? 'failed' : ex.status === 'skipped' ? 'skipped' : ''}`}
                              onClick={isEditing ? () => toggleExerciseStatus(ei) : undefined}
                            >
                              <div className="ex-status-icon">
                                {ex.status === 'completed' ? '\u2713' : ex.status === 'failed' ? '!' : '\u2014'}
                              </div>
                              <div className="ex-info">
                                <div className="ex-name">
                                  {ex.name}
                                  {ex.hand && <span className={`ex-hand ${ex.hand}`}>{ex.hand === 'right' ? 'R' : 'L'}</span>}
                                  {ex.isWarmUp && <span className="ex-warmup-tag">warm-up</span>}
                                </div>
                                <div className="ex-hold">{ex.holdName}</div>
                              </div>
                              <div className="ex-params">
                                {ex.sets > 1 && <span>{ex.sets}x</span>}
                                {ex.hangTime > 0 && <span>{ex.hangTime}s</span>}
                                {ex.reps > 1 && <span>{ex.reps}r</span>}
                              </div>
                              {ex.status === 'failed' && ex.failedAtSet !== null && (
                                <div className="ex-fail-info">
                                  Failed set {ex.failedAtSet + 1}
                                  {ex.failedAtRep !== null && `, rep ${ex.failedAtRep + 1}`}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="no-exercises-note">
                          No exercise details recorded for this workout.
                        </p>
                      )}

                      {/* Edit save/cancel */}
                      {isEditing && (
                        <div className="edit-actions">
                          <button className="btn-secondary" onClick={handleCancelEdit}>Cancel</button>
                          <button className="btn-primary" onClick={() => handleSaveEdit(ri)}>Save</button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
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
