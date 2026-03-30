import { useState, useEffect, useCallback } from 'react';

const API_BASE = 'http://127.0.0.1:8765';

/**
 * useSettings Hook
 * Loads and saves settings via the FastAPI backend.
 *
 * Returns:
 *  - settings: current settings object | null
 *  - loading: boolean
 *  - saveSettings: async function to persist settings
 */
export function useSettings() {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load settings on mount
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const res = await fetch(`${API_BASE}/settings`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        setSettings(data);
      } catch (err) {
        console.error('Failed to load settings:', err);
        // Use defaults if backend is not available
        setSettings({
          sleepStart: '23:00',
          sleepEnd: '07:00',
          waterReminderInterval: 30,
          restReminderThreshold: 120,
          enableWaterReminder: true,
          enableRestReminder: true,
          enableTypingDetection: true,
          idleTimeout: 5,
          enableVoiceReminder: true,
          voiceVolume: 0.8,
        });
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, []);

  // Save settings to backend
  const saveSettings = useCallback(async (newSettings) => {
    try {
      const res = await fetch(`${API_BASE}/settings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSettings),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const saved = await res.json();
      setSettings(saved);
      return saved;
    } catch (err) {
      console.error('Failed to save settings:', err);
      throw err;
    }
  }, []);

  return { settings, loading, saveSettings };
}
