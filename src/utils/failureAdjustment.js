// Tracks exercise failures and adjusts future workout parameters
import { getHoldById } from '../data/holds';
import { getFailureAdjustments, saveFailureAdjustments } from './storage';

function getAdjKey(holdId, hand) {
  const hold = getHoldById(holdId);
  if (!hold) return null;
  return hold.oneHanded && hand ? `${hold.type}__${hand}` : hold.type;
}

// Called after a workout completes with all exercise results
export function processWorkoutResults(exerciseResults) {
  const adjustments = getFailureAdjustments();

  for (const result of exerciseResults) {
    const key = getAdjKey(result.holdId, result.hand);
    if (!key) continue;

    if (result.status === 'failed') {
      applyFailure(adjustments, key, result);
    } else if (result.status === 'completed') {
      applySuccess(adjustments, key);
    }
    // 'skipped' — no effect
  }

  // Clean up fully recovered adjustments
  for (const key of Object.keys(adjustments)) {
    if (adjustments[key].hangTimeMultiplier >= 1.0 && adjustments[key].consecutiveSuccesses >= 3) {
      delete adjustments[key];
    }
  }

  saveFailureAdjustments(adjustments);
  return adjustments;
}

function applyFailure(adjustments, key, result) {
  const existing = adjustments[key];
  const now = new Date().toISOString();

  if (!existing) {
    // First failure on this hold type — 15% reduction
    adjustments[key] = {
      hangTimeMultiplier: 0.85,
      setsMultiplier: 1.0,
      failCount: 1,
      consecutiveSuccesses: 0,
      lastFailDate: now,
    };
  } else {
    // Additional failure — further 10% reduction
    existing.hangTimeMultiplier = Math.max(0.5, existing.hangTimeMultiplier * 0.9);
    existing.failCount += 1;
    existing.consecutiveSuccesses = 0;
    existing.lastFailDate = now;
  }

  // If failed on very first set/rep, also reduce sets
  if (result.failedAtSet === 0 && result.failedAtRep === 0) {
    adjustments[key].setsMultiplier = Math.max(0.34, (adjustments[key].setsMultiplier || 1.0) * 0.67);
  }
}

function applySuccess(adjustments, key) {
  const existing = adjustments[key];
  if (!existing) return;

  existing.consecutiveSuccesses = (existing.consecutiveSuccesses || 0) + 1;

  // After 3 consecutive successes, start recovering
  if (existing.consecutiveSuccesses >= 3) {
    existing.hangTimeMultiplier = Math.min(1.0, existing.hangTimeMultiplier * 1.05);
    existing.setsMultiplier = Math.min(1.0, (existing.setsMultiplier || 1.0) * 1.1);
  }
}

// Apply failure adjustments to an exercise's parameters
export function applyAdjustmentToExercise(exercise, failureAdjustments) {
  if (!failureAdjustments || Object.keys(failureAdjustments).length === 0) {
    return exercise;
  }

  const hold = getHoldById(exercise.holdId);
  if (!hold) return exercise;

  const key = hold.oneHanded && exercise.hand ? `${hold.type}__${exercise.hand}` : hold.type;
  const adj = failureAdjustments[key];

  if (!adj) return exercise;

  return {
    ...exercise,
    hangTime: exercise.hangTime > 0 ? Math.max(3, Math.round(exercise.hangTime * adj.hangTimeMultiplier)) : 0,
    sets: Math.max(1, Math.round((exercise.sets || 1) * (adj.setsMultiplier || 1.0))),
    adjusted: true,
    adjustmentInfo: {
      hangReduction: Math.round((1 - adj.hangTimeMultiplier) * 100),
      failCount: adj.failCount,
      recovering: adj.consecutiveSuccesses >= 1,
    },
    notes: exercise.notes
      ? `${exercise.notes} (adjusted -${Math.round((1 - adj.hangTimeMultiplier) * 100)}% after ${adj.failCount} failure${adj.failCount > 1 ? 's' : ''})`
      : `Adjusted after ${adj.failCount} failure${adj.failCount > 1 ? 's' : ''}`,
  };
}
