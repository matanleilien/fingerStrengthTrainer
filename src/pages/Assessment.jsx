import { useState, useRef, useCallback } from 'react';
import Fingerboard from '../components/Fingerboard';
import TimerDisplay from '../components/TimerDisplay';
import { useStopwatch, useTimer } from '../utils/useTimer';
import { beepGo, beepRest, beepTick, beepWarning, beepComplete, beepRecord } from '../utils/audio';
import { generateAssessment, analyzeAssessment } from '../data/planGenerator';
import {
  saveAssessmentResults,
  appendAssessmentHistory,
  setNextAssessmentDate,
  getUserProfile,
  saveUserProfile,
} from '../utils/storage';
import './Assessment.css';

const assessment = generateAssessment();

export default function Assessment({ onComplete }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [phase, setPhase] = useState('intro');
  const [results, setResults] = useState({});
  const [analysis, setAnalysis] = useState(null);
  const stopwatch = useStopwatch();
  const [repeaterCount, setRepeaterCount] = useState(0);
  const [repeaterPhase, setRepeaterPhase] = useState('hang');

  const currentTest = assessment.exercises[currentIndex];
  const isLastTest = currentIndex === assessment.exercises.length - 1;

  // Use refs to break circular timer dependencies
  const repeaterHangTimerRef = useRef(null);
  const repeaterRestTimerRef = useRef(null);

  const countdownTimer = useTimer(
    (t) => { if (t <= 3 && t > 0) beepTick(); },
    () => {
      beepGo();
      if (currentTest.metric === 'time') {
        setPhase('active');
        stopwatch.start();
      } else {
        setPhase('active');
        setRepeaterCount(0);
        setRepeaterPhase('hang');
        // Start first repeater hang
        repeaterHangTimerRef.current?.start(currentTest.hangTime || 7);
      }
    }
  );

  const repeaterHangTimer = useTimer(
    (t) => { if (t <= 3 && t > 0) beepWarning(); },
    () => {
      beepRest();
      setRepeaterPhase('rest');
      repeaterRestTimerRef.current?.start(currentTest.restTime || 3);
    }
  );

  const repeaterRestTimer = useTimer(
    (t) => { if (t <= 1) beepTick(); },
    () => {
      setRepeaterCount(prev => {
        const next = prev + 1;
        beepGo();
        setRepeaterPhase('hang');
        repeaterHangTimerRef.current?.start(currentTest.hangTime || 7);
        return next;
      });
    }
  );

  // Keep refs in sync
  repeaterHangTimerRef.current = repeaterHangTimer;
  repeaterRestTimerRef.current = repeaterRestTimer;

  function handleStartTest() {
    setPhase('countdown');
    countdownTimer.start(5);
  }

  function handleStopMaxHang() {
    const elapsed = stopwatch.stop();
    beepRecord();
    recordResult(elapsed);
  }

  function handleStopRepeater() {
    repeaterHangTimer.stop();
    repeaterRestTimer.stop();
    beepRecord();
    recordResult(repeaterCount + (repeaterPhase === 'hang' ? 1 : 0));
  }

  function recordResult(value) {
    const newResults = { ...results, [currentTest.id]: value };
    setResults(newResults);
    setPhase('result');
  }

  function handleNext() {
    if (isLastTest) {
      finishAssessment();
    } else {
      setCurrentIndex(prev => prev + 1);
      setPhase('intro');
      stopwatch.reset();
    }
  }

  function finishAssessment() {
    const analyzed = analyzeAssessment(results);
    setAnalysis(analyzed);

    saveAssessmentResults({ raw: results, analyzed });
    appendAssessmentHistory({ raw: results, analyzed });

    const nextDate = new Date();
    nextDate.setDate(nextDate.getDate() + 14);
    setNextAssessmentDate(nextDate.toISOString());

    setPhase('done');
  }

  function handleAcceptLevel(newLevel) {
    const profile = getUserProfile();
    if (profile) {
      saveUserProfile({ ...profile, level: newLevel });
    }
    onComplete(analysis);
  }

  // --- RENDER ---

  if (phase === 'done' && analysis) {
    const profile = getUserProfile();
    const levelChanged = analysis.suggestedLevel !== profile?.level;

    return (
      <div className="assessment">
        <div className="assessment-card">
          <h2>Assessment Complete</h2>
          <div className="results-summary">
            <div className="result-row">
              <span>Best Hang Time</span>
              <span className="result-value">{Math.round(analysis.maxHangTime)}s</span>
            </div>
            <div className="result-row">
              <span>Avg Hang Time</span>
              <span className="result-value">{Math.round(analysis.avgHangTime)}s</span>
            </div>
            <div className="result-row">
              <span>Best Repeaters</span>
              <span className="result-value">{analysis.maxRepeaterReps} reps</span>
            </div>
          </div>

          <h3>Strength Profile</h3>
          <div className="profile-bars">
            {Object.entries(analysis.strengthProfile).map(([key, val]) => (
              <div key={key} className="bar-row">
                <span className="bar-label">{key}</span>
                <div className="bar-track">
                  <div
                    className="bar-fill"
                    style={{ width: `${Math.min(100, (val / Math.max(analysis.maxHangTime, 1)) * 100)}%` }}
                  />
                </div>
                <span className="bar-value">{Math.round(val)}s</span>
              </div>
            ))}
          </div>

          {analysis.weaknesses.length > 0 && (
            <>
              <h3>Areas to Improve</h3>
              <ul className="weakness-list">
                {analysis.weaknesses.map((w, i) => (
                  <li key={i}>{w}</li>
                ))}
              </ul>
            </>
          )}

          {levelChanged ? (
            <div className="level-suggestion">
              <p>Based on your results, we suggest level: <strong>
                {analysis.suggestedLevel === 1 ? 'Beginner' : analysis.suggestedLevel === 2 ? 'Intermediate' : 'Advanced'}
              </strong></p>
              <div className="btn-row">
                <button className="btn-secondary" onClick={() => handleAcceptLevel(profile?.level)}>
                  Keep Current
                </button>
                <button className="btn-primary" onClick={() => handleAcceptLevel(analysis.suggestedLevel)}>
                  Accept
                </button>
              </div>
            </div>
          ) : (
            <button className="btn-primary" onClick={() => onComplete(analysis)}>
              Start Training
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="assessment">
      <div className="assessment-header">
        <span className="test-counter">
          Test {currentIndex + 1} / {assessment.exercises.length}
        </span>
        <div className="progress-dots">
          {assessment.exercises.map((_, i) => (
            <span key={i} className={`dot ${i < currentIndex ? 'done' : i === currentIndex ? 'current' : ''}`} />
          ))}
        </div>
      </div>

      <Fingerboard activeHoldIds={[currentTest.holdId]} />

      <div className="assessment-card">
        <h2>{currentTest.name}</h2>
        <p className="test-desc">{currentTest.description}</p>

        {phase === 'intro' && (
          <>
            <p className="test-hold">Hold: <strong>{currentTest.holdName}</strong></p>
            <p className="test-metric">
              {currentTest.metric === 'time' ? 'Hang as long as you can' : 'Complete as many reps as possible'}
            </p>
            <button className="btn-primary" onClick={handleStartTest}>
              Ready — Start 5s Countdown
            </button>
          </>
        )}

        {phase === 'countdown' && (
          <TimerDisplay
            timeLeft={countdownTimer.timeLeft}
            totalTime={5}
            label="Get Ready"
            large
          />
        )}

        {phase === 'active' && currentTest.metric === 'time' && (
          <>
            <div className="stopwatch">
              <span className="stopwatch-time">{stopwatch.elapsed}s</span>
              <span className="stopwatch-label">Hanging...</span>
            </div>
            <button className="btn-danger" onClick={handleStopMaxHang}>
              I Let Go — Stop Timer
            </button>
          </>
        )}

        {phase === 'active' && currentTest.metric === 'reps' && (
          <>
            <div className="repeater-status">
              <span className="rep-count">{repeaterCount + (repeaterPhase === 'hang' ? 1 : 0)}</span>
              <span className="rep-label">reps</span>
            </div>
            {repeaterPhase === 'hang' ? (
              <TimerDisplay
                timeLeft={repeaterHangTimer.timeLeft}
                totalTime={currentTest.hangTime || 7}
                label="HANG"
                large
              />
            ) : (
              <TimerDisplay
                timeLeft={repeaterRestTimer.timeLeft}
                totalTime={currentTest.restTime || 3}
                label="REST"
                isRest
                large
              />
            )}
            <button className="btn-danger" onClick={handleStopRepeater}>
              I Failed — Stop
            </button>
          </>
        )}

        {phase === 'result' && (
          <>
            <div className="result-big">
              <span className="result-big-value">{results[currentTest.id]}</span>
              <span className="result-big-unit">{currentTest.unit}</span>
            </div>
            <button className="btn-primary" onClick={handleNext}>
              {isLastTest ? 'See Results' : 'Next Test'}
            </button>
          </>
        )}
      </div>

      {phase === 'intro' && currentIndex > 0 && (
        <div className="rest-note">
          Take 2-3 minutes rest between tests for accurate results.
        </div>
      )}
    </div>
  );
}
