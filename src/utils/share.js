// Generate shareable text summaries for clipboard/WhatsApp

export function formatWorkoutSummary(workout) {
  const date = new Date(workout.date).toLocaleDateString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric',
  });
  const lines = [
    `*Finger Strength Trainer*`,
    `${date} — ${capitalize(workout.type)} cycle${workout.microCycleDay ? ` (${workout.microCycleDay} day)` : ''}`,
    ``,
    `Intensity: ${workout.intensity}%`,
    `Exercises: ${workout.completedCount}/${workout.exerciseCount} completed`,
  ];
  if (workout.failedCount > 0) {
    lines.push(`Failed: ${workout.failedCount}`);
  }
  return lines.join('\n');
}

export function formatAssessmentSummary(assessment) {
  const date = new Date(assessment.date).toLocaleDateString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric',
  });
  const a = assessment.analyzed;
  if (!a) return '';
  const lines = [
    `*Finger Strength Assessment*`,
    `${date}`,
    ``,
    `Best Hang: ${Math.round(a.maxHangTime)}s`,
    `Avg Hang: ${Math.round(a.avgHangTime)}s`,
    `Best Repeaters: ${a.maxRepeaterReps} reps`,
  ];
  if (a.handBalance && a.handBalance.right > 0) {
    lines.push(`Hand Balance: R ${a.handBalance.right}s / L ${a.handBalance.left}s`);
    if (a.handBalance.imbalance > 10) {
      lines.push(`(${a.handBalance.imbalance}% imbalance — ${a.handBalance.weakerHand} weaker)`);
    }
  }
  const level = a.suggestedLevel === 1 ? 'Beginner' : a.suggestedLevel === 2 ? 'Intermediate' : 'Advanced';
  lines.push(`Level: ${level}`);
  return lines.join('\n');
}

export function formatFullWorkoutDetail(workout, exercises) {
  const date = new Date(workout.date).toLocaleDateString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric',
  });
  const lines = [
    `*Finger Strength Trainer*`,
    `${date} — ${capitalize(workout.type)} cycle${workout.microCycleDay ? ` (${workout.microCycleDay} day)` : ''}`,
    `Intensity: ${workout.intensity}%`,
    ``,
  ];
  if (exercises?.length) {
    exercises.forEach((ex, i) => {
      const name = ex.exercise?.name || 'Exercise';
      const hold = ex.holdName || '';
      const detail = ex.hangTime > 0
        ? `${ex.sets}x${ex.hangTime}s`
        : `${ex.sets}x${ex.reps} reps`;
      lines.push(`${i + 1}. ${name} — ${hold} (${detail})`);
    });
  }
  lines.push(``, `${workout.completedCount}/${workout.exerciseCount} completed`);
  return lines.join('\n');
}

export async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Fallback for older browsers
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
    return true;
  }
}

function capitalize(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}
