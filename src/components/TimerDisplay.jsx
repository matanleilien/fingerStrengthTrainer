import './TimerDisplay.css';

export default function TimerDisplay({ timeLeft, totalTime, label, isRest, large }) {
  const progress = totalTime > 0 ? (totalTime - timeLeft) / totalTime : 0;
  const radius = large ? 80 : 55;
  const stroke = large ? 8 : 6;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - progress);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const display = minutes > 0
    ? `${minutes}:${seconds.toString().padStart(2, '0')}`
    : `${seconds}`;

  return (
    <div className={`timer-display ${large ? 'large' : ''} ${isRest ? 'rest' : 'work'}`}>
      <svg
        className="timer-ring"
        width={(radius + stroke) * 2}
        height={(radius + stroke) * 2}
      >
        <circle
          className="timer-ring-bg"
          cx={radius + stroke}
          cy={radius + stroke}
          r={radius}
          strokeWidth={stroke}
        />
        <circle
          className="timer-ring-progress"
          cx={radius + stroke}
          cy={radius + stroke}
          r={radius}
          strokeWidth={stroke}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ stroke: isRest ? '#42a5f5' : '#00e676' }}
        />
      </svg>
      <div className="timer-text">
        <span className="timer-number">{display}</span>
        {label && <span className="timer-label">{label}</span>}
      </div>
    </div>
  );
}
