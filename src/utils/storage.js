// localStorage persistence layer

const GLOBAL_PREFIX = 'fst__';
let currentUserId = null;

function userKey(name) {
  if (!currentUserId) throw new Error('No active user');
  return `fst_${currentUserId}_${name}`;
}

function globalGet(name, fallback = null) {
  try {
    const raw = localStorage.getItem(GLOBAL_PREFIX + name);
    if (raw === null) return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function globalSet(name, value) {
  try {
    localStorage.setItem(GLOBAL_PREFIX + name, JSON.stringify(value));
  } catch (e) {
    console.warn('Storage write failed:', e);
  }
}

function get(name, fallback = null) {
  try {
    const raw = localStorage.getItem(userKey(name));
    if (raw === null) return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function set(name, value) {
  try {
    localStorage.setItem(userKey(name), JSON.stringify(value));
  } catch (e) {
    console.warn('Storage write failed:', e);
  }
}

function remove(name) {
  localStorage.removeItem(userKey(name));
}

// --- User Management ---
export function getUsers() {
  return globalGet('users', []);
}

function saveUsers(users) {
  globalSet('users', users);
}

export function getActiveUserId() {
  return globalGet('active_user', null);
}

export function createUser(name) {
  const users = getUsers();
  const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  users.push({ id, name, createdAt: new Date().toISOString() });
  saveUsers(users);
  return id;
}

export function switchUser(userId) {
  const users = getUsers();
  if (!users.find(u => u.id === userId)) return false;
  globalSet('active_user', userId);
  currentUserId = userId;
  return true;
}

export function deleteUser(userId) {
  const users = getUsers();
  const updated = users.filter(u => u.id !== userId);
  saveUsers(updated);
  // Clean up user data
  const prefix = `fst_${userId}_`;
  const keysToRemove = [];
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (k && k.startsWith(prefix)) keysToRemove.push(k);
  }
  keysToRemove.forEach(k => localStorage.removeItem(k));
  // If deleted user was active, clear active
  if (getActiveUserId() === userId) {
    globalSet('active_user', null);
    currentUserId = null;
  }
}

export function renameUser(userId, newName) {
  const users = getUsers();
  const user = users.find(u => u.id === userId);
  if (user) {
    user.name = newName;
    saveUsers(users);
  }
}

export function initActiveUser() {
  const activeId = getActiveUserId();
  if (activeId && getUsers().find(u => u.id === activeId)) {
    currentUserId = activeId;
    return activeId;
  }
  return null;
}

export function getCurrentUserId() {
  return currentUserId;
}

// --- Migration: move legacy fst_ data to a user ---
export function migrateLegacyData() {
  const legacyKeys = [
    'profile', 'assessment', 'assessment_history', 'training_state',
    'workout_history', 'next_assessment', 'failure_adjustments', 'goals',
  ];
  const hasLegacy = legacyKeys.some(k => localStorage.getItem('fst_' + k) !== null);
  if (!hasLegacy) return false;

  // Create a user for the legacy data
  const id = createUser('My Profile');
  legacyKeys.forEach(k => {
    const val = localStorage.getItem('fst_' + k);
    if (val !== null) {
      localStorage.setItem(`fst_${id}_${k}`, val);
      localStorage.removeItem('fst_' + k);
    }
  });
  switchUser(id);
  return true;
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

export function updateWorkoutHistoryItem(index, updatedWorkout) {
  const history = getWorkoutHistory();
  if (index >= 0 && index < history.length) {
    history[index] = { ...history[index], ...updatedWorkout };
    set('workout_history', history);
  }
}

export function deleteWorkoutHistoryItem(index) {
  const history = getWorkoutHistory();
  if (index >= 0 && index < history.length) {
    history.splice(index, 1);
    set('workout_history', history);
  }
}

// --- Next Assessment Due ---
export function getNextAssessmentDate() {
  return get('next_assessment', null);
}

export function setNextAssessmentDate(dateStr) {
  set('next_assessment', dateStr);
}

// --- Failure Adjustments ---
export function getFailureAdjustments() {
  return get('failure_adjustments', {});
}

export function saveFailureAdjustments(adjustments) {
  set('failure_adjustments', adjustments);
}

// --- Goals ---
export function getGoals() {
  return get('goals', null);
}

export function saveGoals(goals) {
  set('goals', goals);
}

// --- Full Reset ---
export function resetAllData() {
  const keys = [
    'profile', 'assessment', 'assessment_history', 'training_state',
    'workout_history', 'next_assessment', 'failure_adjustments', 'goals',
  ];
  keys.forEach(k => remove(k));
}
