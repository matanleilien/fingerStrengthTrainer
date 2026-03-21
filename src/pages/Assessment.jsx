import { useState, useRef } from 'react';
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
  getGoals,
  saveGoals,
} from '../utils/storage';
import { generateGoals, updateGoals } from '../utils/goalGenerator';
import './Assessment.css';

const assessment = generateAssessment();

export default function Assessment({ onComplete }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [phase, setPhase] = useState('warmup_intro');
  const [warmupIndex, setWarmupIndex] = useState(0);
  const [results, setResults] = useState({});
  const [analysis, setAnalysis] = useState(null);
  const stopwatch = useStopwatch();
  const [repeaterCount, setRepeaterCount] = useState(0);
  const [repeaterPhase, setRepeaterPhase] = useState('hang');

  const currentTest = assessment.exercises[currentIndex];
  const isLastTest = currentIndex === assessment.exercises.length - 1;
  const currentWarmup = assessment.warmup?.[warmupIndex];

  // Use refs to break circular timer dependencies
  const repeaterHangTimerRef = useRef(null);
  const repeaterRestTimerRef = useRef(null);

  const countdownTimer = useTimer(
    (t) => { if (t <= 3 && t > 0) beepTick(); },
    () => {
      beepGo();
      if (phase === 'warmup_countdown') {
        setPhase('warmup_active');
        return;
      }
      if (currentTest.metric === 'time') {
        setPhase('active');
        stopwatch.start();
      } else {
        setPhase('active');
        setRepeaterCount(0);
        setRepeaterPhase('hang');
        repeaterHangTimerRef.current?.start(currentTest.hangTime || 7);
      }
    }
  );

  const warmupTimer = useTimer(
    (t) => { if (t <= 3 && t > 0) beepWarning(); },
    () => {
      beepComplete();
      // Move to next warmup or start tests
      if (warmupIndex < (assessment.warmup?.length || 0) - 1) {
        setWarmupIndex(prev => prev + 1);
        setPhase('warmup_rest');
      } else {
        setPhase('intro');
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

  repeaterHangTimerRef.current = repeaterHangTimer;
  repeaterRestTimerRef.current = repeaterRestTimer;

  function handleSkipWarmup() {
    setPhase('intro');
  }

  function handleStartWarmup() {
    setPhase('warmup_countdown');
    countdownTimer.start(5);
  }

  function handleWarmupRestDone() {
    setPhase('warmup_countdown');
    countdownTimer.start(5);
  }

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

    const assessmentData = { raw: results, analyzed };
    saveAssessmentResults(assessmentData);
    appendAssessmentHistory(assessmentData);

    const previousGoals = getGoals();
    const goals = previousGoals
      ? updateGoals(assessmentData, previousGoals)
      : generateGoals(assessmentData);
    saveGoals(goals);

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

  // Warmup intro
  if (phase === 'warmup_intro') {
    return (
      <div className="assessment">
        <div className="assessment-card">
          <h2>Warm Up</h2>
          <p className="test-desc">
            Before testing, warm up with a few easy hangs to get blood flowing and prevent injury.
          </p>
          <div className="warmup-list">
            {assessment.warmup?.map((w, i) => (
              <div key={i} className="warmup-item">
                <span className="warmup-name">{w.name}</span>
                <span className="warmup-detail">{w.holdName} — {w.duration}s</span>
              </div>
            ))}
          </div>
          <button className="btn-primary" onClick={handleStartWarmup}>
            Start Warm-Up
          </button>
          <button className="btn-text warmup-skip" onClick={handleSkipWarmup}>
            Skip warm-up
          </button>
        </div>
      </div>
    );
  }

  // Warmup countdown
  if (phase === 'warmup_countdown' && currentWarmup) {
    return (
      <div className="assessment">
        <Fingerboard activeHoldIds={[currentWarmup.holdId]} />
        <div className="assessment-card">
          <h2>{currentWarmup.name}</h2>
          <p className="test-desc">{currentWarmup.description}</p>
          <TimerDisplay
            timeLeft={countdownTimer.timeLeft}
            totalTime={5}
            label="Get Ready"
            large
          />
        </div>
      </div>
    );
  }

  // Warmup active hang
  if (phase === 'warmup_active' && currentWarmup) {
    if (!warmupTimer.isRunning && warmupTimer.timeLeft === 0) {
      warmupTimer.start(currentWarmup.duration);
    }
    return (
      <div className="assessment">
        <Fingerboard activeHoldIds={[currentWarmup.holdId]} />
        <div className="assessment-card">
          <h2>{currentWarmup.name}</h2>
          <TimerDisplay
            timeLeft={warmupTimer.timeLeft}
            totalTime={currentWarmup.duration}
            label="HANG"
            large
          />
          <p className="warmup-note">Easy effort — just warm up</p>
        </div>
      </div>
    );
  }

  // Warmup rest between exercises
  if (phase === 'warmup_rest') {
    return (
      <div className="assessment">
        <div className="assessment-card">
          <h2>Rest</h2>
          <p className="test-desc">Shake out your hands. Next: {assessment.warmup?.[warmupIndex]?.name}</p>
          <button className="btn-primary" onClick={handleWarmupRestDone}>
            Ready for Next
          </button>
          <button className="btn-text warmup-skip" onClick={handleSkipWarmup}>
            Skip to tests
          </button>
        </div>
      </div>
    );
  }

  // Done screen
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

          {analysis.handBalance && analysis.handBalance.right > 0 && (
            <>
              <h3>Hand Balance</h3>
              <div className="profile-bars">
                <div className="bar-row">
                  <span className="bar-label">Right</span>
                  <div className="bar-track">
                    <div className="bar-fill" style={{
                      width: `${Math.min(100, (analysis.handBalance.right / Math.max(analysis.handBalance.right, analysis.handBalance.left, 1)) * 100)}%`,
                      background: analysis.handBalance.weakerHand === 'right' ? '#ff9800' : '#00e676',
                    }} />
                  </div>
                  <span className="bar-value">{analysis.handBalance.right}s</span>
                </div>
                <div className="bar-row">
                  <span className="bar-label">Left</span>
                  <div className="bar-track">
                    <div className="bar-fill" style={{
                      width: `${Math.min(100, (analysis.handBalance.left / Math.max(analysis.handBalance.right, analysis.handBalance.left, 1)) * 100)}%`,
                      background: analysis.handBalance.weakerHand === 'left' ? '#ff9800' : '#00e676',
                    }} />
                  </div>
                  <span className="bar-value">{analysis.handBalance.left}s</span>
                </div>
              </div>
              {analysis.handBalance.imbalance > 10 && (
                <p className="imbalance-note">
                  {analysis.handBalance.imbalance}% imbalance — {analysis.handBalance.weakerHand} hand is weaker
                </p>
              )}
            </>
          )}

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

  // Main test flow
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

      <Fingerboard activeHoldIds={[currentTest.holdId]} activeHand={currentTest.hand || null} />

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
