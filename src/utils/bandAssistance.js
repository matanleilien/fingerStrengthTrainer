// Band assistance system for one-arm exercises
// Uses resistance bands to assist when the user isn't yet strong enough for unassisted one-arm hangs

export const BAND_LEVELS = {
  heavy: {
    id: 'heavy',
    label: 'Heavy Band',
    color: '#e040fb',        // purple
    assistance: '~50% bodyweight',
    targetHangTime: 10,      // aim for 10s with heavy band
    promoteThreshold: 12,    // promote to medium when you hit 12s for 3 workouts
    description: 'Use your thickest resistance band. Loop it over the jug or pull-up bar and put your foot in it.',
  },
  medium: {
    id: 'medium',
    label: 'Medium Band',
    color: '#ff9800',        // orange
    assistance: '~30% bodyweight',
    targetHangTime: 10,
    promoteThreshold: 12,
    description: 'Use a medium resistance band. You should feel significantly more challenged than with the heavy band.',
  },
  light: {
    id: 'light',
    label: 'Light Band',
    color: '#ffeb3b',        // yellow
    assistance: '~15% bodyweight',
    targetHangTime: 10,
    promoteThreshold: 12,
    description: 'Use a thin resistance band for minimal assistance. Focus on quality tension.',
  },
  none: {
    id: 'none',
    label: 'No Band',
    color: '#00e676',        // green
    assistance: 'unassisted',
    targetHangTime: null,
    promoteThreshold: null,
    description: 'No band needed — hang unassisted.',
  },
};

// Determine initial band level from one-arm hang assessment result (seconds)
export function bandLevelFromHangTime(seconds) {
  if (seconds < 5) return 'heavy';
  if (seconds < 10) return 'medium';
  if (seconds < 15) return 'light';
  return 'none';
}

// Default structure for both hands
export function defaultBandAssistance() {
  return { right: 'heavy', left: 'heavy' };
}

// Given current band level and recent hang times (array of seconds), suggest if ready to promote
export function shouldPromote(bandLevel, recentHangTimes) {
  const config = BAND_LEVELS[bandLevel];
  if (!config || !config.promoteThreshold) return false;
  if (recentHangTimes.length < 3) return false;
  const last3 = recentHangTimes.slice(-3);
  return last3.every(t => t >= config.promoteThreshold);
}

export function nextBandLevel(current) {
  const order = ['heavy', 'medium', 'light', 'none'];
  const idx = order.indexOf(current);
  return idx >= 0 && idx < order.length - 1 ? order[idx + 1] : 'none';
}

export function getBandConfig(level) {
  return BAND_LEVELS[level] || BAND_LEVELS.none;
}
