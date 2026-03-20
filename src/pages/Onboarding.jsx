import { useState } from 'react';
import { LEVELS } from '../data/planGenerator';
import { saveUserProfile, saveTrainingState, setNextAssessmentDate } from '../utils/storage';
import { initAudio } from '../utils/audio';
import './Onboarding.css';

export default function Onboarding({ onComplete }) {
  const [step, setStep] = useState(0);
  const [level, setLevel] = useState(null);
  const [daysPerWeek, setDaysPerWeek] = useState(null);

  function handleFinish() {
    initAudio();
    const profile = { level, daysPerWeek };
    saveUserProfile(profile);

    // Initialize training state — start from conditioning cycle
    saveTrainingState({
      startDate: new Date().toISOString(),
      currentCycle: 'conditioning',
    });

    // Schedule first assessment for now
    setNextAssessmentDate(new Date().toISOString());

    onComplete(profile);
  }

  if (step === 0) {
    return (
      <div className="onboarding">
        <div className="onboarding-card">
          <h1>Finger Strength Trainer</h1>
          <p className="subtitle">Metolius Simulator 3D Training App</p>
          <div className="hero-img">
            <img src="/fingerboard.png" alt="Fingerboard" />
          </div>
          <p>A follow-along training app that builds and maintains your fingerboard training plan using cyclic periodization.</p>
          <ul className="features">
            <li>Periodic strength & stamina assessments</li>
            <li>Auto-generated workout plans</li>
            <li>Visual hold guidance on your board</li>
            <li>Audio cues and timers</li>
          </ul>
          <button className="btn-primary" onClick={() => setStep(1)}>
            Get Started
          </button>
        </div>
      </div>
    );
  }

  if (step === 1) {
    return (
      <div className="onboarding">
        <div className="onboarding-card">
          <h2>What's your level?</h2>
          <p className="hint">This will be refined after your first assessment.</p>
          <div className="option-group">
            {Object.entries(LEVELS).map(([key, val]) => (
              <button
                key={key}
                className={`option-btn ${level === Number(key) ? 'selected' : ''}`}
                onClick={() => setLevel(Number(key))}
              >
                <span className="option-name">{val.name}</span>
                <span className="option-desc">
                  {key === '1' && 'New to fingerboarding or climbing < 1 year'}
                  {key === '2' && 'Regular climber, some hangboard experience'}
                  {key === '3' && 'Experienced climber, consistent training'}
                </span>
              </button>
            ))}
          </div>
          <button
            className="btn-primary"
            disabled={level === null}
            onClick={() => setStep(2)}
          >
            Next
          </button>
        </div>
      </div>
    );
  }

  if (step === 2) {
    return (
      <div className="onboarding">
        <div className="onboarding-card">
          <h2>Training days per week?</h2>
          <p className="hint">We'll adjust this based on your current training cycle.</p>
          <div className="option-group horizontal">
            {[2, 3, 4, 5].map(d => (
              <button
                key={d}
                className={`option-btn square ${daysPerWeek === d ? 'selected' : ''}`}
                onClick={() => setDaysPerWeek(d)}
              >
                {d}
              </button>
            ))}
          </div>
          <button
            className="btn-primary"
            disabled={daysPerWeek === null}
            onClick={handleFinish}
          >
            Start Assessment
          </button>
        </div>
      </div>
    );
  }

  return null;
}
