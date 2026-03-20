// localStorage persistence layer

const STORAGE_PREFIX = 'fst_';

function key(name) {
  return STORAGE_PREFIX + name;
}

function get(name, fallback = null) {
  try {
    const raw = localStorage.getItem(key(name));
    if (raw === null) return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function set(name, value) {
  try {
    localStorage.setItem(key(name), JSON.stringify(value));
  } catch (e) {
    console.warn('Storage write failed:', e);
  }
}

function remove(name) {
  localStorage.removeItem(key(name));
}

// --- User Profile ---
export function getUserProfile() {
  return get('profile', null);
}

export function saveUserProfile(profile) {
  set('profile', profile);
}

// --- Assessment Results ---
export function getAssessmentResults() {
  return get('assessment', null);
}

export function saveAssessmentResults(results) {
  set('assessment', { ...results, date: new Date().toISOString() });
}

export function getAssessmentHistory() {
  return get('assessment_history', []);
}

export function appendAssessmentHistory(results) {
  const history = getAssessmentHistory();
  history.push({ ...results, date: new Date().toISOString() });
  set('assessment_history', history);
}

// --- Training Plan State ---
export function getTrainingState() {
  return get('training_state', null);
}

export function saveTrainingState(state) {
  set('training_state', state);
}

// --- Workout History ---
export function getWorkoutHistory() {
  return get('workout_history', []);
}

export function appendWorkoutHistory(workout) {
  const history = getWorkoutHistory();
  history.push({ ...workout, date: new Date().toISOString() });
  // Keep last 100 workouts
  if (history.length > 100) history.shift();
  set('workout_history', history);
}

// --- Next Assessment Due ---
export function getNextAssessmentDate() {
  return get('next_assessment', null);
}

export function setNextAssessmentDate(dateStr) {
  set('next_assessment', dateStr);
}

// --- Full Reset ---
export function resetAllData() {
  const keys = ['profile', 'assessment', 'assessment_history', 'training_state', 'workout_history', 'next_assessment'];
  keys.forEach(k => remove(k));
}
