// Pattern detection for flagging interesting/urgent calls

// Routine intents that don't indicate medical concerns
const ROUTINE_INTENTS = [
  'appointment_booking',
  'appointment_cancellation',
  'prescription_refill',
  'billing_question',
  'test_results',
  'insurance_inquiry',
  'general_inquiry',
  'referral_request'
];

export function detectPatterns(currentCall, callerStats) {
  const flags = [];
  const { phoneMatches, nameMatches, recentCallCount, urgentCallCount } = callerStats;

  // Combine all previous calls
  const previousCalls = [...phoneMatches];
  nameMatches.forEach(nm => {
    if (!previousCalls.find(pm => pm.id === nm.id)) {
      previousCalls.push(nm);
    }
  });

  // Flag 1: Repeat caller (called before in last 72 hours)
  if (recentCallCount > 0) {
    flags.push({
      type: 'repeat_caller',
      severity: recentCallCount >= 3 ? 'high' : 'medium',
      message: `Caller has made ${recentCallCount} call(s) in the last 72 hours`,
      details: previousCalls.map(c => ({
        date: c.created_at,
        intent: c.intent,
        summary: c.summary,
        urgency: c.urgency
      }))
    });
  }

  // Flag 2: Escalating urgency
  if (currentCall.urgency === 'high' && urgentCallCount > 0) {
    flags.push({
      type: 'repeat_urgent',
      severity: 'high',
      message: `Multiple urgent calls from this caller (${urgentCallCount + 1} total)`,
      details: null
    });
  }

  // Flag 3: Same issue repeating (same intent)
  const sameIntentCalls = previousCalls.filter(c => c.intent === currentCall.intent);
  if (sameIntentCalls.length > 0) {
    flags.push({
      type: 'recurring_issue',
      severity: sameIntentCalls.length >= 2 ? 'high' : 'medium',
      message: `Caller has contacted ${sameIntentCalls.length + 1} times about "${formatIntent(currentCall.intent)}"`,
      details: sameIntentCalls.map(c => ({
        date: c.created_at,
        summary: c.summary
      }))
    });
  }

  // Flag 4: Rapid callbacks (multiple calls within 24 hours)
  const last24Hours = previousCalls.filter(c => {
    const callTime = new Date(c.created_at);
    const now = new Date();
    return (now - callTime) < 24 * 60 * 60 * 1000;
  });

  if (last24Hours.length >= 2) {
    flags.push({
      type: 'rapid_callbacks',
      severity: 'high',
      message: `${last24Hours.length + 1} calls in the last 24 hours - possible unresolved issue`,
      details: null
    });
  }

  // Flag 5: Symptom progression (if previous calls had lower urgency)
  const previousLowUrgency = previousCalls.filter(c => c.urgency === 'low' || c.urgency === 'medium');
  if (currentCall.urgency === 'high' && previousLowUrgency.length > 0) {
    flags.push({
      type: 'escalating_symptoms',
      severity: 'high',
      message: 'Symptoms appear to be escalating - previous calls were less urgent',
      details: previousLowUrgency.map(c => ({
        date: c.created_at,
        urgency: c.urgency,
        summary: c.summary
      }))
    });
  }

  // Flag 6: Routine caller (all calls are low urgency and routine intents)
  // Only add this positive flag if there are no concerning flags and caller has history
  const isCurrentRoutine = currentCall.urgency === 'low' && ROUTINE_INTENTS.includes(currentCall.intent);
  const allPreviousRoutine = previousCalls.length > 0 && previousCalls.every(c =>
    c.urgency === 'low' && ROUTINE_INTENTS.includes(c.intent)
  );

  // Only show routine flag if no high/medium severity flags exist
  const hasNoAlertFlags = flags.filter(f => f.severity === 'high' || f.severity === 'medium').length === 0;

  if (isCurrentRoutine && allPreviousRoutine && hasNoAlertFlags && previousCalls.length >= 1) {
    const totalCalls = previousCalls.length + 1;
    const uniqueIntents = [...new Set([currentCall.intent, ...previousCalls.map(c => c.intent)])];

    flags.push({
      type: 'routine_caller',
      severity: 'info',
      message: `Established patient with ${totalCalls} routine calls`,
      details: {
        totalCalls,
        intents: uniqueIntents.map(formatIntent),
        allLowUrgency: true
      }
    });
  }

  // Sort flags by severity
  const severityOrder = { high: 0, medium: 1, low: 2, info: 3 };
  flags.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);

  // Check for routine caller status
  const isRoutineCaller = flags.some(f => f.type === 'routine_caller');

  return {
    flags,
    hasHighPriorityFlags: flags.some(f => f.severity === 'high'),
    isRoutineCaller,
    previousCallCount: recentCallCount,
    previousCalls: previousCalls.slice(0, 5) // Return last 5 for context
  };
}

function formatIntent(intent) {
  return intent
    .replace(/_/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase());
}
