import { useState, useRef, useCallback, useEffect } from 'react';
import Fingerboard from '../components/Fingerboard';
import TimerDisplay from '../components/TimerDisplay';
import { useTimer } from '../utils/useTimer';
import { beepGo, beepRest, beepTick, beepWarning, beepComplete } from '../utils/audio';
import { appendWorkoutHistory } from '../utils/storage';
import { processWorkoutResults } from '../utils/failureAdjustment';
import { getHoldById } from '../data/holds';
import { formatFullWorkoutDetail, copyToClipboard } from '../utils/share';
import './Workout.css';

export default function Workout({ workout, onComplete, onCancel }) {
  const [exIndex, setExIndex] = useState(0);
  const [copied, setCopied] = useState(false);
  const [setNum, setSetNum] = useState(0);
  const [repNum, setRepNum] = useState(0);
  const [phase, setPhase] = useState('overview');
  const [isPaused, setIsPaused] = useState(false);
  const [completedExercises, setCompletedExercises] = useState([]);
  const [exerciseResults, setExerciseResults] = useState([]);

  const exercises = workout.exercises || [];
  const currentExercise = exercises[exIndex];
  const totalExercises = exercises.length;

  // Refs to break circular timer dependencies
  const repeaterHangTimerRef = useRef(null);
  const repeaterRestTimerRef = useRef(null);
  const handleRepDoneRef = useRef(null);

  const countdownTimer = useTimer(
    (t) => { if (t <= 3 && t > 0) beepTick(); },
    () => {
      beepGo();
      if (currentExercise.exercise?.id === 'repeaters') {
        startRepeaterWork();
      } else if (currentExercise.hangTime > 0) {
        setPhase('work');
        workTimer.start(currentExercise.hangTime);
      } else {
        setPhase('work');
      }
    }
  );

  const workTimer = useTimer(
    (t) => {
      if (t <= 3 && t > 0) beepWarning();
    },
    () => {
      handleRepDoneRef.current?.();
    }
  );

  const restTimer = useTimer(
    (t) => { if (t <= 3 && t > 0) beepTick(); },
    () => {
      beepGo();
      nextRepOrSet();
    }
  );

  const [repeaterRep, setRepeaterRep] = useState(0);
  const [repeaterPhase, setRepeaterPhase] = useState('hang');

  const repeaterHangTimer = useTimer(
    (t) => { if (t <= 2 && t > 0) beepWarning(); },
    () => {
      beepRest();
      setRepeaterPhase('rest');
      repeaterRestTimerRef.current?.start(currentExercise.restTime || 3);
    }
  );

  const repeaterRestTimer = useTimer(
    (t) => { if (t <= 1) beepTick(); },
    () => {
      setRepeaterRep(prev => {
        const next = prev + 1;
        if (next >= (currentExercise.reps || 5)) {
          handleRepDoneRef.current?.();
          return 0;
        }
        beepGo();
        setRepeaterPhase('hang');
        repeaterHangTimerRef.current?.start(currentExercise.hangTime || 7);
        return next;
      });
    }
  );

  // Keep refs in sync
  repeaterHangTimerRef.current = repeaterHangTimer;
  repeaterRestTimerRef.current = repeaterRestTimer;

  function startRepeaterWork() {
    setPhase('work');
    setRepeaterRep(0);
    setRepeaterPhase('hang');
    beepGo();
    repeaterHangTimer.start(currentExercise.hangTime || 7);
  }

  function handleRepDone() {
    const nextRep = repNum + 1;
    const totalReps = currentExercise.exercise?.id === 'repeaters' ? 1 : (currentExercise.reps || 1);

    if (nextRep < totalReps) {
      setRepNum(nextRep);
      beepRest();
      setPhase('rest');
      restTimer.start(currentExercise.restTime || 10);
    } else {
      handleSetDone();
    }
  }

  handleRepDoneRef.current = handleRepDone;

  function handleSetDone() {
    const nextSet = setNum + 1;
    if (nextSet < (currentExercise.sets || 1)) {
      setSetNum(nextSet);
      setRepNum(0);
      beepRest();
      setPhase('set_rest');
      restTimer.start(Math.round((currentExercise.restTime || 30) * 1.5));
    } else {
      recordExerciseResult('completed');
      setCompletedExercises(prev => [...prev, exIndex]);
      setPhase('exercise_done');
      beepComplete();
    }
  }

  function handleFail() {
    // Stop all timers
    workTimer.stop();
    restTimer.stop();
    countdownTimer.stop();
    repeaterHangTimer.stop();
    repeaterRestTimer.stop();

    recordExerciseResult('failed');
    setPhase('exercise_done');
    beepRest();
  }

  function recordExerciseResult(status) {
    const hold = getHoldById(currentExercise.holdId);
    setExerciseResults(prev => [...prev, {
      exIndex,
      status,
      holdId: currentExercise.holdId,
      holdType: hold?.type || 'unknown',
      hand: currentExercise.hand || null,
      exerciseId: currentExercise.exercise?.id || 'unknown',
      failedAtSet: status === 'failed' ? setNum : null,
      failedAtRep: status === 'failed' ? repNum : null,
    }]);
  }

  function nextRepOrSet() {
    if (phase === 'set_rest') {
      // Start new set
      startCurrentExercise();
    } else {
      // Next rep
      if (currentExercise.exercise?.id === 'repeaters') {
        startRepeaterWork();
      } else if (currentExercise.hangTime > 0) {
        setPhase('work');
        workTimer.start(currentExercise.hangTime);
      } else {
        setPhase('work');
      }
    }
  }

  function handleNextExercise() {
    const next = exIndex + 1;
    if (next >= totalExercises) {
      finishWorkout();
    } else {
      setExIndex(next);
      setSetNum(0);
      setRepNum(0);
      setPhase('overview');
    }
  }

  function startCurrentExercise() {
    setPhase('countdown');
    countdownTimer.start(5);
  }

  function handlePullUpsDone() {
    // For non-timed exercises, user clicks when done
    handleRepDone();
  }

  function handlePause() {
    setIsPaused(true);
    workTimer.pause();
    restTimer.pause();
    countdownTimer.pause();
    repeaterHangTimer.pause();
    repeaterRestTimer.pause();
  }

  function handleResume() {
    setIsPaused(false);
    workTimer.resume();
    restTimer.resume();
    countdownTimer.resume();
    repeaterHangTimer.resume();
    repeaterRestTimer.resume();
  }

  function finishWorkout() {
    // Record last exercise as completed if we got here from exercise_done
    const allResults = [...exerciseResults];

    appendWorkoutHistory({
      type: workout.type,
      intensity: workout.intensity,
      microCycleDay: workout.microCycleDay,
      exerciseCount: totalExercises,
      completedCount: allResults.filter(r => r.status === 'completed').length,
      failedCount: allResults.filter(r => r.status === 'failed').length,
    });

    // Process failures/successes to adjust future workouts
    processWorkoutResults(allResults);

    setPhase('complete');
    beepComplete();
  }

  function skipExercise() {
    recordExerciseResult('skipped');
    handleNextExercise();
  }

  // --- RENDER ---

  if (phase === 'complete') {
    const handleShare = async () => {
      const summary = formatFullWorkoutDetail(
        { type: workout.type, intensity: workout.intensity, microCycleDay: workout.microCycleDay,
          exerciseCount: totalExercises, completedCount: completedExercises.length + 1,
          date: new Date().toISOString() },
        workout.exercises
      );
      await copyToClipboard(summary);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    };
    return (
      <div className="workout">
        <div className="workout-card centered">
          <div className="complete-icon">&#10003;</div>
          <h2>Workout Complete!</h2>
          <p className="muted">
            {workout.type} cycle — {workout.microCycleDay || ''} day
          </p>
          <p>{completedExercises.length + 1} / {totalExercises} exercises completed</p>
          <button className="btn-share" onClick={handleShare}>
            {copied ? 'Copied!' : 'Share Workout'}
          </button>
          <button className="btn-primary" onClick={onComplete}>
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (!currentExercise) {
    return (
      <div className="workout">
        <p>No exercises in this workout.</p>
        <button className="btn-primary" onClick={onComplete}>Back</button>
      </div>
    );
  }

  return (
    <div className="workout">
      {/* Header */}
      <div className="workout-header">
        <button className="btn-icon" onClick={onCancel}>&larr;</button>
        <div className="workout-progress-info">
          <span className="exercise-counter">
            Exercise {exIndex + 1}/{totalExercises}
          </span>
          <span className="set-counter">
            Set {setNum + 1}/{currentExercise.sets || 1}
          </span>
        </div>
        {phase !== 'overview' && phase !== 'exercise_done' && (
          <button className="btn-icon" onClick={isPaused ? handleResume : handlePause}>
            {isPaused ? '▶' : '⏸'}
          </button>
        )}
      </div>

      {/* Progress bar */}
      <div className="workout-progress-bar">
        <div
          className="workout-progress-fill"
          style={{ width: `${((exIndex + (phase === 'exercise_done' ? 1 : 0)) / totalExercises) * 100}%` }}
        />
      </div>

      {/* Fingerboard */}
      <Fingerboard
        activeHoldIds={phase === 'rest' || phase === 'set_rest' ? [] : [currentExercise.holdId]}
        highlightColor={phase === 'work' ? '#00e676' : '#ffab00'}
        activeHand={currentExercise.hand || null}
      />

      {/* Exercise info */}
      <div className="workout-card">
        <h2>{currentExercise.exercise?.name || 'Exercise'}</h2>
        <p className="hold-name">Hold: {currentExercise.holdName}</p>
        {currentExercise.notes && <p className="exercise-notes">{currentExercise.notes}</p>}

        {/* Badges */}
        <div className="exercise-badges">
          {currentExercise.isWarmUp && (
            <span className="warm-up-badge">WARM-UP</span>
          )}
          {currentExercise.adjusted && (
            <span className="adjusted-badge">ADJUSTED</span>
          )}
        </div>

        {/* Overview phase */}
        {phase === 'overview' && (
          <div className="overview-info">
            <div className="info-grid">
              {currentExercise.hangTime > 0 && (
                <div className="info-item">
                  <span className="info-value">{currentExercise.hangTime}s</span>
                  <span className="info-label">Hang</span>
                </div>
              )}
              <div className="info-item">
                <span className="info-value">{currentExercise.sets || 1}</span>
                <span className="info-label">Sets</span>
              </div>
              {currentExercise.reps > 1 && (
                <div className="info-item">
                  <span className="info-value">{currentExercise.reps}</span>
                  <span className="info-label">Reps</span>
                </div>
              )}
              <div className="info-item">
                <span className="info-value">{currentExercise.restTime}s</span>
                <span className="info-label">Rest</span>
              </div>
            </div>
            {currentExercise.exercise?.instructions && (
              <ul className="instructions-list">
                {currentExercise.exercise.instructions.slice(0, 3).map((inst, i) => (
                  <li key={i}>{inst}</li>
                ))}
              </ul>
            )}
            <div className="btn-row">
              <button className="btn-secondary" onClick={skipExercise}>Skip</button>
              <button className="btn-primary" onClick={startCurrentExercise}>Start</button>
            </div>
          </div>
        )}

        {/* Countdown */}
        {phase === 'countdown' && (
          <TimerDisplay
            timeLeft={countdownTimer.timeLeft}
            totalTime={5}
            label="Get Ready"
            large
          />
        )}

        {/* Work phase - timed */}
        {phase === 'work' && currentExercise.hangTime > 0 && currentExercise.exercise?.id !== 'repeaters' && (
          <>
            <TimerDisplay
              timeLeft={workTimer.timeLeft}
              totalTime={currentExercise.hangTime}
              label="HANG"
              large
            />
            <button className="btn-danger btn-fail" onClick={handleFail}>
              I Failed
            </button>
          </>
        )}

        {/* Work phase - repeaters */}
        {phase === 'work' && currentExercise.exercise?.id === 'repeaters' && (
          <>
            <div className="repeater-info">
              <span className="rep-counter">Rep {repeaterRep + 1} / {currentExercise.reps}</span>
            </div>
            {repeaterPhase === 'hang' ? (
              <TimerDisplay
                timeLeft={repeaterHangTimer.timeLeft}
                totalTime={currentExercise.hangTime || 7}
                label="HANG"
                large
              />
            ) : (
              <TimerDisplay
                timeLeft={repeaterRestTimer.timeLeft}
                totalTime={currentExercise.restTime || 3}
                label="REST"
                isRest
                large
              />
            )}
            <button className="btn-danger btn-fail" onClick={handleFail}>
              I Failed
            </button>
          </>
        )}

        {/* Work phase - count-based (pull-ups etc) */}
        {phase === 'work' && currentExercise.hangTime === 0 && (
          <div className="count-exercise">
            <p className="count-instruction">
              Do {currentExercise.reps} {currentExercise.exercise?.name || 'reps'}
            </p>
            <div className="btn-row">
              <button className="btn-danger" onClick={handleFail}>Failed</button>
              <button className="btn-primary" onClick={handlePullUpsDone}>Done</button>
            </div>
          </div>
        )}

        {/* Rest phase */}
        {(phase === 'rest' || phase === 'set_rest') && (
          <>
            <TimerDisplay
              timeLeft={restTimer.timeLeft}
              totalTime={phase === 'set_rest'
                ? Math.round((currentExercise.restTime || 30) * 1.5)
                : (currentExercise.restTime || 10)}
              label={phase === 'set_rest' ? 'SET REST' : 'REST'}
              isRest
              large
            />
            <button className="btn-secondary" onClick={() => {
              restTimer.stop();
              beepGo();
              nextRepOrSet();
            }}>
              Skip Rest
            </button>
          </>
        )}

        {/* Exercise done */}
        {phase === 'exercise_done' && (() => {
          const lastResult = exerciseResults[exerciseResults.length - 1];
          const wasFailed = lastResult?.status === 'failed';
          return (
            <div className="exercise-done">
              <div className={wasFailed ? 'done-fail' : 'done-check'}>
                {wasFailed ? '!' : '\u2713'}
              </div>
              <p>{wasFailed ? 'Exercise failed — noted for plan adjustment' : 'Exercise complete!'}</p>
              <button className="btn-primary" onClick={handleNextExercise}>
                {exIndex + 1 >= totalExercises ? 'Finish Workout' : 'Next Exercise'}
              </button>
            </div>
          );
        })()}
      </div>

      {/* Pause overlay */}
      {isPaused && (
        <div className="pause-overlay" onClick={handleResume}>
          <div className="pause-content">
            <span className="pause-icon">⏸</span>
            <p>PAUSED</p>
            <p className="muted">Tap to resume</p>
          </div>
        </div>
      )}
    </div>
  );
}
