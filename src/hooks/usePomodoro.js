import { useState, useEffect, useRef, useCallback } from 'react';
import { savePomodoroSession } from '../utils/storage';

const WORK_MINUTES = 25;
const BREAK_MINUTES = 5;

/**
 * usePomodoro — manages Pomodoro timer state.
 * Exposes: mode, timeLeft, isRunning, sessionsCompleted,
 *          start(), pause(), reset(), skip()
 */
export function usePomodoro() {
  const [mode, setMode] = useState('work'); // 'work' | 'break'
  const [timeLeft, setTimeLeft] = useState(WORK_MINUTES * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [sessionsCompleted, setSessionsCompleted] = useState(0);

  const intervalRef = useRef(null);
  const startedAtRef = useRef(null);

  const clearTimer = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const handleSessionComplete = useCallback((completedMode) => {
    clearTimer();
    setIsRunning(false);

    // Persist session
    if (completedMode === 'work') {
      savePomodoroSession({
        type: 'work',
        durationMinutes: WORK_MINUTES,
        completedAt: Date.now(),
      });
      setSessionsCompleted((n) => n + 1);
    }

    // Notify
    if (window.electronAPI) {
      window.electronAPI.showNotification(
        completedMode === 'work' ? '🍅 Pomodoro Complete!' : '☕ Break Over!',
        completedMode === 'work'
          ? 'Great work! Time for a short break.'
          : 'Break time is over. Ready to focus?'
      );
    }

    // Dispatch event so the cat can react
    window.dispatchEvent(new CustomEvent('pomodoro-done', { detail: { mode: completedMode } }));

    // Switch mode
    const nextMode = completedMode === 'work' ? 'break' : 'work';
    setMode(nextMode);
    setTimeLeft((nextMode === 'work' ? WORK_MINUTES : BREAK_MINUTES) * 60);
  }, []);

  useEffect(() => {
    if (!isRunning) return;

    startedAtRef.current = Date.now();
    intervalRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          // Use mode from ref to access current mode insider interval
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return clearTimer;
  }, [isRunning]);

  // Watch for completion
  useEffect(() => {
    if (timeLeft === 0 && isRunning) {
      handleSessionComplete(mode);
    }
  }, [timeLeft, isRunning, mode, handleSessionComplete]);

  const start = useCallback(() => setIsRunning(true), []);
  const pause = useCallback(() => {
    clearTimer();
    setIsRunning(false);
  }, []);

  const reset = useCallback(() => {
    clearTimer();
    setIsRunning(false);
    setMode('work');
    setTimeLeft(WORK_MINUTES * 60);
  }, []);

  const skip = useCallback(() => {
    clearTimer();
    setIsRunning(false);
    const nextMode = mode === 'work' ? 'break' : 'work';
    setMode(nextMode);
    setTimeLeft((nextMode === 'work' ? WORK_MINUTES : BREAK_MINUTES) * 60);
  }, [mode]);

  return {
    mode,
    timeLeft,
    isRunning,
    sessionsCompleted,
    workMinutes: WORK_MINUTES,
    breakMinutes: BREAK_MINUTES,
    start,
    pause,
    reset,
    skip,
  };
}
