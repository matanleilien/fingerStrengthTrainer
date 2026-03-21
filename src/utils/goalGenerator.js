// Generates realistic, conservative improvement goals based on assessment results
import { getFailureAdjustments } from './storage';

// Conservative improvement rates per 2-week assessment cycle
const DEFAULT_RATE = 0.05;       // 5% for time-based metrics
const REP_RATE = 0.03;           // 3% for rep-based (discrete, small numbers)
const STRUGGLING_RATE = 0.02;    // 2% for skills with active failure adjustments
const BEHIND_RATE = 0.03;        // 3% fallback if user missed previous target
const BALANCE_REDUCTION = 3;     // 3 percentage points reduction per cycle for imbalance

const SKILL_DEFS = [
  { key: 'max_hang_jug', label: 'Max Hang — Jug', unit: 'seconds', type: 'time' },
  { key: 'max_hang_edge', label: 'Max Hang — Edge', unit: 'seconds', type: 'time' },
  { key: 'max_hang_pocket', label: 'Max Hang — 3F Pocket', unit: 'seconds', type: 'time' },
  { key: 'repeater_test', label: 'Repeaters — Jug', unit: 'reps', type: 'reps' },
  { key: 'repeater_test_edge', label: 'Repeaters — Edge', unit: 'reps', type: 'reps' },
  { key: 'max_hang_pocket_2f_r', label: 'Max Hang — 2F Pocket (R)', unit: 'seconds', type: 'time' },
  { key: 'max_hang_pocket_2f_l', label: 'Max Hang — 2F Pocket (L)', unit: 'seconds', type: 'time' },
];

export function generateGoals(assessmentData, previousGoals = null) {
  const { raw, analyzed } = assessmentData;
  const failureAdj = getFailureAdjustments();

  const skills = {};

  for (const def of SKILL_DEFS) {
    const current = raw[def.key] || 0;
    if (current === 0) continue; // skip untested skills

    // Determine improvement rate
    let rate = def.type === 'reps' ? REP_RATE : DEFAULT_RATE;

    // Check if user has failure adjustments for related hold types
    const hasFailureAdj = checkFailureAdjForSkill(def.key, failureAdj);
    if (hasFailureAdj) rate = STRUGGLING_RATE;

    // Check if user missed previous target — be more conservative
    if (previousGoals?.skills?.[def.key]) {
      const prev = previousGoals.skills[def.key];
      if (current < prev.target2Week) {
        rate = BEHIND_RATE;
      }
    }

    const baseline = current;
    const roundFn = def.type === 'reps' ? Math.round : (v) => Math.round(v * 10) / 10;

    skills[def.key] = {
      label: def.label,
      unit: def.unit,
      type: def.type,
      baseline,
      current,
      rate,
      target2Week: roundFn(baseline * (1 + rate)),
      target4Week: roundFn(baseline * Math.pow(1 + rate, 2)),
      target8Week: roundFn(baseline * Math.pow(1 + rate, 4)),
    };
  }

  // Hand balance goal
  if (analyzed?.handBalance && analyzed.handBalance.right > 0 && analyzed.handBalance.left > 0) {
    const imbalance = analyzed.handBalance.imbalance;
    skills['hand_balance'] = {
      label: 'Hand Imbalance',
      unit: '%',
      type: 'balance',
      baseline: imbalance,
      current: imbalance,
      lowerIsBetter: true,
      target2Week: Math.max(5, imbalance - BALANCE_REDUCTION),
      target4Week: Math.max(5, imbalance - BALANCE_REDUCTION * 2),
      target8Week: Math.max(5, imbalance - BALANCE_REDUCTION * 4),
    };
  }

  return {
    generatedDate: new Date().toISOString(),
    skills,
  };
}

// Update goals with new assessment data (called on re-assessment)
export function updateGoals(newAssessmentData, currentGoals) {
  const newGoals = generateGoals(newAssessmentData, currentGoals);

  // Carry forward rate adjustments based on whether user hit targets
  for (const [key, skill] of Object.entries(newGoals.skills)) {
    const old = currentGoals?.skills?.[key];
    if (!old) continue;

    const current = skill.current;
    const wasTarget = old.target2Week;

    if (skill.lowerIsBetter) {
      skill.status = current <= wasTarget ? 'on_track' : 'behind';
    } else {
      if (current >= wasTarget * 1.05) {
        skill.status = 'ahead';
      } else if (current >= wasTarget * 0.95) {
        skill.status = 'on_track';
      } else {
        skill.status = 'behind';
      }
    }
  }

  return newGoals;
}

// Calculate progress percentage from baseline toward a target
export function getProgressPercent(current, baseline, target) {
  if (target === baseline) return current >= target ? 100 : 0;
  const progress = (current - baseline) / (target - baseline);
  return Math.max(0, Math.min(100, Math.round(progress * 100)));
}

// Get a human-readable status for a skill
export function getSkillStatus(skill) {
  if (skill.status === 'ahead') return { label: 'Ahead', color: '#00e676' };
  if (skill.status === 'on_track') return { label: 'On Track', color: '#42a5f5' };
  if (skill.status === 'behind') return { label: 'Behind', color: '#ff9800' };
  // No status yet (first assessment)
  return { label: 'Baseline', color: '#888' };
}

// Check if a skill's related hold type has failure adjustments
function checkFailureAdjForSkill(skillKey, failureAdj) {
  if (!failureAdj || Object.keys(failureAdj).length === 0) return false;

  const holdTypeMap = {
    'max_hang_jug': 'jug',
    'max_hang_edge': 'edge',
    'max_hang_pocket': 'three_finger_pocket',
    'repeater_test': 'jug',
    'repeater_test_edge': 'edge',
    'max_hang_pocket_2f_r': 'two_finger_pocket__right',
    'max_hang_pocket_2f_l': 'two_finger_pocket__left',
  };

  const key = holdTypeMap[skillKey];
  return key ? !!failureAdj[key] : false;
}
