// Audio utility using Web Audio API for beeps/cues during workouts

let audioContext = null;

function getAudioContext() {
  if (!audioContext) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioContext.state === 'suspended') {
    audioContext.resume();
  }
  return audioContext;
}

function playTone(frequency, duration, type = 'sine', volume = 0.3) {
  try {
    const ctx = getAudioContext();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);

    gainNode.gain.setValueAtTime(volume, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + duration);
  } catch (e) {
    console.warn('Audio playback failed:', e);
  }
}

// Short beep for countdown ticks
export function beepTick() {
  playTone(800, 0.08, 'sine', 0.2);
}

// "Go" beep — start hanging
export function beepGo() {
  playTone(1200, 0.15, 'sine', 0.4);
  setTimeout(() => playTone(1600, 0.2, 'sine', 0.4), 150);
}

// "Rest" beep — let go
export function beepRest() {
  playTone(400, 0.3, 'sine', 0.3);
}

// Warning beep — 3 seconds left
export function beepWarning() {
  playTone(600, 0.1, 'sine', 0.25);
}

// Completion fanfare
export function beepComplete() {
  playTone(523, 0.15, 'sine', 0.3); // C
  setTimeout(() => playTone(659, 0.15, 'sine', 0.3), 150); // E
  setTimeout(() => playTone(784, 0.3, 'sine', 0.4), 300);  // G
}

// Assessment recording beep
export function beepRecord() {
  playTone(1000, 0.05, 'sine', 0.3);
  setTimeout(() => playTone(1000, 0.05, 'sine', 0.3), 100);
}

// Personal Record trumpet fanfare — ascending victory melody
export function beepTrumpet() {
  const seq = [
    { f: 523, d: 0,    dur: 0.12 }, // C
    { f: 523, d: 130,  dur: 0.12 }, // C
    { f: 523, d: 260,  dur: 0.12 }, // C
    { f: 523, d: 390,  dur: 0.22 }, // C (hold)
    { f: 415, d: 390,  dur: 0.22 }, // Ab (harmony)
    { f: 523, d: 640,  dur: 0.14 }, // C
    { f: 587, d: 810,  dur: 0.14 }, // D
    { f: 659, d: 970,  dur: 0.14 }, // E
    { f: 784, d: 1120, dur: 0.55 }, // G (triumphant hold)
  ];
  seq.forEach(({ f, d, dur }) => setTimeout(() => playTone(f, dur, 'square', 0.3), d));
}

// Initialize audio context on first user interaction
export function initAudio() {
  getAudioContext();
}
