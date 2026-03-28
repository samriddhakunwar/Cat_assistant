import { useState, useEffect, useRef } from 'react';

const API_BASE = 'http://127.0.0.1:8765';

/**
 * useActivityTracker Hook
 * Polls the FastAPI backend at the given interval for current activity status.
 *
 * Returns:
 *  - status: { is_typing, idle_seconds, screen_time_minutes } | null
 *  - loading: boolean
 *  - error: string | null
 */
export function useActivityTracker(pollIntervalMs = 2000) {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const intervalRef = useRef(null);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await fetch(`${API_BASE}/status`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        setStatus(data);
        setError(null);
      } catch (err) {
        // Backend might not be ready yet; don't crash
        setError(err.message);
        // Return a default status so the cat still works
        setStatus({
          is_typing: false,
          idle_seconds: 0,
          screen_time_minutes: 0,
        });
      } finally {
        setLoading(false);
      }
    };

    // Initial fetch
    fetchStatus();

    // Set up polling
    intervalRef.current = setInterval(fetchStatus, pollIntervalMs);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [pollIntervalMs]);

  return { status, loading, error };
}
