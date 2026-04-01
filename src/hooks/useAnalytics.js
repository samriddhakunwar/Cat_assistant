import { useState, useEffect, useCallback } from 'react';
import { getAnalyticsData, saveAnalyticsSnapshot, getPomodoroSessions, getTodos } from '../utils/storage';

/**
 * useAnalytics — polls /status every minute, snapshots data,
 * then computes weekly summaries and a today productivity score.
 */
export function useAnalytics() {
  const [data, setData] = useState([]);
  const [score, setScore] = useState(null);

  const refresh = useCallback(() => {
    setData(getAnalyticsData());
  }, []);

  // Snapshot every 60 sec
  useEffect(() => {
    const doSnapshot = async () => {
      try {
        const res = await fetch('http://127.0.0.1:8765/status');
        if (!res.ok) return;
        const status = await res.json();
        saveAnalyticsSnapshot({
          screenTimeMinutes: status.screen_time_minutes,
          isTyping: status.is_typing,
        });
        refresh();
      } catch {
        // Backend might not be running in widget-only view
      }
    };

    doSnapshot();
    const id = setInterval(doSnapshot, 60_000);
    return () => clearInterval(id);
  }, [refresh]);

  // Compute daily productivity score
  useEffect(() => {
    const snapshots = getAnalyticsData();
    const today = new Date().toISOString().slice(0, 10);
    const todaySnaps = snapshots.filter((s) => {
      return new Date(s.ts).toISOString().slice(0, 10) === today;
    });

    // Pomodoro score — sessions today (capped at 8 for 100%)
    const sessions = getPomodoroSessions();
    const todaySessions = sessions.filter(
      (s) => new Date(s.completedAt).toISOString().slice(0, 10) === today
    );
    const pomodoroScore = Math.min((todaySessions.length / 8) * 100, 100);

    // Task completion score
    const todos = getTodos();
    const taskScore =
      todos.length > 0
        ? (todos.filter((t) => t.completed).length / todos.length) * 100
        : 0;

    // Screen balance score — ideal is 6–8 h of screen time
    const latestSnap = todaySnaps[todaySnaps.length - 1];
    const screenMins = latestSnap ? latestSnap.screenTimeMinutes : 0;
    const screenHours = screenMins / 60;
    const screenScore =
      screenHours <= 8
        ? Math.min((screenHours / 6) * 100, 100)
        : Math.max(0, 100 - (screenHours - 8) * 20);

    const total = Math.round((pomodoroScore + taskScore + screenScore) / 3);

    setScore({ total, pomodoroScore, taskScore, screenScore, sessionCount: todaySessions.length, screenMins });
  }, [data]);

  // Build last-7-days summary for charts
  const last7Days = (() => {
    const snapshots = getAnalyticsData();
    const buckets = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      const label = d.toLocaleDateString('en-US', { weekday: 'short' });
      buckets[key] = { day: label, screenMins: 0, typingMins: 0, snaps: 0 };
    }
    for (const s of snapshots) {
      const key = new Date(s.ts).toISOString().slice(0, 10);
      if (buckets[key]) {
        buckets[key].screenMins = Math.max(buckets[key].screenMins, s.screenTimeMinutes);
        if (s.isTyping) buckets[key].typingMins += 1;
        buckets[key].snaps += 1;
      }
    }
    return Object.values(buckets);
  })();

  return { data, score, last7Days, refresh };
}
