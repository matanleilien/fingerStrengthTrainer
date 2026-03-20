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
  getFailureAdjustments,
  getGoals,
} from '../utils/storage';
import { getProgressPercent, getSkillStatus } from '../utils/goalGenerator';
import './Dashboard.css';

export default function Dashboard({ onStartWorkout, onStartAssessment, onViewProgress, onReset }) {
  const profile = getUserProfile();
  const assessmentResults = getAssessmentResults();
  const trainingState = getTrainingState();
  const nextAssessment = getNextAssessmentDate();
  const history = getWorkoutHistory();
  const failureAdj = getFailureAdjustments();
  const goals = getGoals();

  const cycleInfo = useMemo(() => {
    if (!trainingState?.startDate) return null;
    return getCurrentCycleInfo(trainingState.startDate);
  }, [trainingState]);

  const workout = useMemo(() => {
    if (!profile || !cycleInfo) return null;
    return generateWorkout(profile, cycleInfo, assessmentResults?.analyzed, failureAdj);
  }, [profile, cycleInfo, assessmentResults, failureAdj]);

  const isAssessmentDue = useMemo(() => {
    if (!nextAssessment) return true;
    return new Date() >= new Date(nextAssessment);
  }, [nextAssessment]);

  const daysUntilAssessment = useMemo(() => {
    if (!nextAssessment) return 0;
    const diff = new Date(nextAssessment) - new Date();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
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

      {/* Goals at a glance */}
      {goals && Object.keys(goals.skills).length > 0 && (
        <div className="section">
          <h3>Goals</h3>
          {!isAssessmentDue && (
            <p className="goals-subtitle">
              Next assessment in {daysUntilAssessment} days — expect ~5% improvement per cycle
            </p>
          )}
          <div className="goals-list">
            {Object.entries(goals.skills).slice(0, 5).map(([key, skill]) => {
              const pct = skill.lowerIsBetter
                ? getProgressPercent(skill.baseline - skill.current + skill.baseline, skill.baseline, skill.baseline + (skill.baseline - skill.target8Week))
                : getProgressPercent(skill.current, skill.baseline, skill.target8Week);
              const status = getSkillStatus(skill);
              return (
                <div key={key} className="goal-row">
                  <div className="goal-header">
                    <span className="goal-label">{skill.label}</span>
                    <span className="goal-status" style={{ color: status.color }}>{status.label}</span>
                  </div>
                  <div className="goal-bar-track">
                    <div className="goal-marker goal-2w" style={{ left: `${getProgressPercent(skill.target2Week, skill.baseline, skill.target8Week)}%` }} />
                    <div className="goal-marker goal-4w" style={{ left: `${getProgressPercent(skill.target4Week, skill.baseline, skill.target8Week)}%` }} />
                    <div className="goal-bar-fill" style={{ width: `${Math.min(100, Math.max(0, pct))}%` }} />
                  </div>
                  <div className="goal-values">
                    <span>{skill.current}{skill.unit === 'seconds' ? 's' : skill.unit === '%' ? '%' : ''}</span>
                    <span className="goal-target">Target: {Math.round(skill.target8Week)}{skill.unit === 'seconds' ? 's' : skill.unit === '%' ? '%' : ''}</span>
                  </div>
                </div>
              );
            })}
          </div>
          <button className="btn-text" onClick={onViewProgress}>See all goals &rarr;</button>
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
                    {ex.adjusted && '↓ '}
                    {ex.exercise?.name || 'Exercise'}
                  </span>
                  <span className="exercise-detail">
                    {ex.holdName} — {ex.sets}x
                    {ex.hangTime > 0 ? `${ex.hangTime}s` : `${ex.reps} reps`}
                    {ex.adjusted && ' (adjusted)'}
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
