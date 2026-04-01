import { useState, useEffect, useCallback } from 'react';
import { getWaterLog, saveWaterLog } from '../utils/storage';

/**
 * useWaterTracker — tracks daily glass intake.
 * Auto-resets when the stored date differs from today.
 */
export function useWaterTracker() {
  const todayStr = () => new Date().toISOString().slice(0, 10);

  const init = () => {
    const log = getWaterLog();
    if (log.date !== todayStr()) {
      // New day — reset
      return { glasses: 0, goal: log.goal ?? 8, date: todayStr() };
    }
    return log;
  };

  const [state, setState] = useState(init);

  // Persist on every change
  useEffect(() => {
    saveWaterLog(state);
  }, [state]);

  const logGlass = useCallback(() => {
    setState((s) => ({ ...s, glasses: Math.min(s.glasses + 1, s.goal) }));
  }, []);

  const reset = useCallback(() => {
    setState((s) => ({ ...s, glasses: 0 }));
  }, []);

  const setGoal = useCallback((goal) => {
    setState((s) => ({ ...s, goal: Math.max(1, goal) }));
  }, []);

  return {
    glasses: state.glasses,
    goal: state.goal,
    logGlass,
    reset,
    setGoal,
  };
}
