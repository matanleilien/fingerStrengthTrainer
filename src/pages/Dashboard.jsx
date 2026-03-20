import { useState, useMemo } from 'react';
import Fingerboard from '../components/Fingerboard';
import { getCurrentCycleInfo, CYCLE_CONFIG, CYCLE_ORDER } from '../data/periodization';
import { generateWorkout, LEVELS } from '../data/planGenerator';
import {
  getUserProfile,
  getAssessmentResults,
  getTrainingState,
  getNextAssessmentDate,
  getWorkoutHistory,
} from '../utils/storage';
import './Dashboard.css';

export default function Dashboard({ onStartWorkout, onStartAssessment, onViewProgress, onReset }) {
  const profile = getUserProfile();
  const assessmentResults = getAssessmentResults();
  const trainingState = getTrainingState();
  const nextAssessment = getNextAssessmentDate();
  const history = getWorkoutHistory();

  const cycleInfo = useMemo(() => {
    if (!trainingState?.startDate) return null;
    return getCurrentCycleInfo(trainingState.startDate);
  }, [trainingState]);

  const workout = useMemo(() => {
    if (!profile || !cycleInfo) return null;
    return generateWorkout(profile, cycleInfo, assessmentResults?.analyzed);
  }, [profile, cycleInfo, assessmentResults]);

  const isAssessmentDue = useMemo(() => {
    if (!nextAssessment) return true;
    return new Date() >= new Date(nextAssessment);
  }, [nextAssessment]);

  const levelName = LEVELS[profile?.level]?.name || 'Unknown';
  const recentWorkouts = history?.slice(-7) || [];

  if (!cycleInfo) return null;

  const cycleConfig = cycleInfo.config;
  const weekProgress = (cycleInfo.weekInCycle / cycleInfo.totalWeeksInCycle) * 100;

  return (
    <div className="dashboard">
      {/* Cycle overview */}
      <div className="cycle-card" style={{ borderColor: cycleConfig.color }}>
        <div className="cycle-header">
          <span className="cycle-icon">{cycleConfig.icon}</span>
          <div>
            <h2 className="cycle-name" style={{ color: cycleConfig.color }}>
              {cycleConfig.name} Cycle
            </h2>
            <span className="cycle-period">Period {cycleInfo.periodNumber}</span>
          </div>
        </div>
        <p className="cycle-desc">{cycleConfig.description}</p>
        <div className="cycle-progress">
          <div className="cycle-progress-track">
            <div
              className="cycle-progress-fill"
              style={{ width: `${weekProgress}%`, background: cycleConfig.color }}
            />
          </div>
          <span className="cycle-week">
            Week {cycleInfo.weekInCycle + 1} of {cycleInfo.totalWeeksInCycle}
          </span>
        </div>

        {/* Cycle timeline */}
        <div className="cycle-timeline">
          {CYCLE_ORDER.map((c, i) => (
            <div
              key={c}
              className={`timeline-item ${c === cycleInfo.cycle ? 'active' : ''}`}
              style={{ borderColor: CYCLE_CONFIG[c].color }}
            >
              <span className="timeline-icon">{CYCLE_CONFIG[c].icon}</span>
              <span className="timeline-name">{CYCLE_CONFIG[c].name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Assessment due banner */}
      {isAssessmentDue && (
        <div className="assessment-banner" onClick={onStartAssessment}>
          <span className="banner-text">Assessment due — tap to test your progress</span>
          <span className="banner-arrow">&rarr;</span>
        </div>
      )}

      {/* Today's workout */}
      <div className="section">
        <h3>Today's Workout</h3>
        {workout?.type === 'off' ? (
          <div className="off-card">
            <p>{workout.message}</p>
          </div>
        ) : workout ? (
          <div className="workout-preview">
            <div className="preview-stats">
              <div className="stat">
                <span className="stat-value">{workout.intensity}%</span>
                <span className="stat-label">Intensity</span>
              </div>
              <div className="stat">
                <span className="stat-value">{workout.totalSets}</span>
                <span className="stat-label">Sets</span>
              </div>
              <div className="stat">
                <span className="stat-value">~{workout.estimatedMinutes}m</span>
                <span className="stat-label">Duration</span>
              </div>
            </div>
            {workout.microCycleDay && (
              <span className={`micro-badge micro-${workout.microCycleDay}`}>
                {workout.microCycleDay} day
              </span>
            )}
            <div className="exercise-list">
              {workout.exercises.map((ex, i) => (
                <div key={i} className="exercise-item">
                  <span className="exercise-name">
                    {ex.isWarmUp && '🔥 '}
                    {ex.exercise?.name || 'Exercise'}
                  </span>
                  <span className="exercise-detail">
                    {ex.holdName} — {ex.sets}x
                    {ex.hangTime > 0 ? `${ex.hangTime}s` : `${ex.reps} reps`}
                  </span>
                </div>
              ))}
            </div>
            <button className="btn-primary" onClick={() => onStartWorkout(workout)}>
              Start Workout
            </button>
          </div>
        ) : (
          <p className="muted">No workout available</p>
        )}
      </div>

      {/* Quick stats */}
      <div className="section">
        <h3>Your Profile</h3>
        <div className="profile-grid">
          <div className="profile-item">
            <span className="profile-label">Level</span>
            <span className="profile-value">{levelName}</span>
          </div>
          <div className="profile-item">
            <span className="profile-label">Days/week</span>
            <span className="profile-value">{profile?.daysPerWeek}</span>
          </div>
          <div className="profile-item">
            <span className="profile-label">Workouts</span>
            <span className="profile-value">{history?.length || 0}</span>
          </div>
          {assessmentResults?.analyzed && (
            <div className="profile-item">
              <span className="profile-label">Best hang</span>
              <span className="profile-value">{Math.round(assessmentResults.analyzed.maxHangTime)}s</span>
            </div>
          )}
        </div>
      </div>

      {/* Recent activity */}
      {recentWorkouts.length > 0 && (
        <div className="section">
          <h3>Recent Activity</h3>
          <div className="activity-list">
            {recentWorkouts.reverse().map((w, i) => (
              <div key={i} className="activity-item">
                <span className="activity-date">
                  {new Date(w.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </span>
                <span className="activity-type">{w.type}</span>
                <span className="activity-intensity">{w.intensity}%</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="nav-buttons">
        <button className="btn-secondary" onClick={onViewProgress}>
          Progress &amp; History
        </button>
        <button className="btn-text" onClick={onReset}>
          Reset All Data
        </button>
      </div>
    </div>
  );
}
