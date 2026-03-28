import React, { useState, useEffect } from 'react';
import { useSettings } from '../hooks/useSettings';

/**
 * SettingsPanel Component
 * Configuration UI for the cat assistant.
 * Allows users to set sleep schedule, water/rest reminder intervals,
 * and toggle features on/off. Persists settings via the backend API.
 */
export default function SettingsPanel() {
  const { settings, loading, saveSettings } = useSettings();
  const [localSettings, setLocalSettings] = useState(null);
  const [saved, setSaved] = useState(false);

  // Initialize local state when settings load
  useEffect(() => {
    if (settings && !localSettings) {
      setLocalSettings({ ...settings });
    }
  }, [settings]);

  if (loading || !localSettings) {
    return (
      <div className="settings-panel flex items-center justify-center">
        <div className="animate-spin text-3xl">🐱</div>
        <p className="ml-2 text-gray-500">Loading...</p>
      </div>
    );
  }

  const handleChange = (key, value) => {
    setLocalSettings((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  };

  const handleSave = async () => {
    await saveSettings(localSettings);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleClose = () => {
    if (window.electronAPI) {
      window.electronAPI.closeSettings();
    }
  };

  return (
    <div className="settings-panel">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🐱</span>
          <h2 className="text-lg font-extrabold bg-gradient-to-r from-pink-500 to-violet-500 bg-clip-text text-transparent">
            Cat Settings
          </h2>
        </div>
        <button
          onClick={handleClose}
          className="control-btn control-btn-close"
          id="btn-close-settings"
        >
          ✕
        </button>
      </div>

      {/* Sleep Schedule */}
      <section className="mb-5">
        <h3 className="text-sm font-bold text-gray-700 mb-2 flex items-center gap-1">
          🌙 Sleep Schedule
        </h3>
        <div className="flex items-center gap-3">
          <div className="flex flex-col">
            <label className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">Bedtime</label>
            <input
              type="time"
              value={localSettings.sleepStart}
              onChange={(e) => handleChange('sleepStart', e.target.value)}
              className="px-3 py-1.5 rounded-lg border border-pink-200 bg-white/80 text-sm font-semibold text-gray-700 focus:outline-none focus:ring-2 focus:ring-pink-300"
              id="input-sleep-start"
            />
          </div>
          <span className="text-gray-400 mt-4">→</span>
          <div className="flex flex-col">
            <label className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">Wake Up</label>
            <input
              type="time"
              value={localSettings.sleepEnd}
              onChange={(e) => handleChange('sleepEnd', e.target.value)}
              className="px-3 py-1.5 rounded-lg border border-pink-200 bg-white/80 text-sm font-semibold text-gray-700 focus:outline-none focus:ring-2 focus:ring-pink-300"
              id="input-sleep-end"
            />
          </div>
        </div>
      </section>

      {/* Water Reminder */}
      <section className="mb-5">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-bold text-gray-700 flex items-center gap-1">
            💧 Water Reminder
          </h3>
          <div
            className={`toggle-switch ${localSettings.enableWaterReminder ? 'active' : ''}`}
            onClick={() => handleChange('enableWaterReminder', !localSettings.enableWaterReminder)}
            id="toggle-water"
          />
        </div>
        {localSettings.enableWaterReminder && (
          <div className="flex items-center gap-3">
            <input
              type="range"
              min="5"
              max="120"
              step="5"
              value={localSettings.waterReminderInterval}
              onChange={(e) => handleChange('waterReminderInterval', parseInt(e.target.value))}
              className="flex-1 h-2 bg-pink-100 rounded-lg appearance-none cursor-pointer accent-pink-400"
              id="slider-water-interval"
            />
            <span className="text-sm font-bold text-pink-500 min-w-[50px] text-right">
              {localSettings.waterReminderInterval} min
            </span>
          </div>
        )}
      </section>

      {/* Rest Reminder */}
      <section className="mb-5">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-bold text-gray-700 flex items-center gap-1">
            🧘 Rest Reminder
          </h3>
          <div
            className={`toggle-switch ${localSettings.enableRestReminder ? 'active' : ''}`}
            onClick={() => handleChange('enableRestReminder', !localSettings.enableRestReminder)}
            id="toggle-rest"
          />
        </div>
        {localSettings.enableRestReminder && (
          <div className="flex items-center gap-3">
            <input
              type="range"
              min="1"
              max="240"
              step="1"
              value={localSettings.restReminderThreshold}
              onChange={(e) => handleChange('restReminderThreshold', parseInt(e.target.value))}
              className="flex-1 h-2 bg-violet-100 rounded-lg appearance-none cursor-pointer accent-violet-400"
              id="slider-rest-threshold"
            />
            <span className="text-sm font-bold text-violet-500 min-w-[50px] text-right">
              {localSettings.restReminderThreshold} min
            </span>
          </div>
        )}
      </section>

      {/* Typing Detection */}
      <section className="mb-5">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-gray-700 flex items-center gap-1">
            ⌨️ Typing Detection
          </h3>
          <div
            className={`toggle-switch ${localSettings.enableTypingDetection ? 'active' : ''}`}
            onClick={() => handleChange('enableTypingDetection', !localSettings.enableTypingDetection)}
            id="toggle-typing"
          />
        </div>
      </section>

      {/* Idle Timeout */}
      <section className="mb-6">
        <h3 className="text-sm font-bold text-gray-700 mb-2 flex items-center gap-1">
          ⏱️ Idle Timeout
        </h3>
        <div className="flex items-center gap-3">
          <input
            type="range"
            min="1"
            max="30"
            step="1"
            value={localSettings.idleTimeout}
            onChange={(e) => handleChange('idleTimeout', parseInt(e.target.value))}
            className="flex-1 h-2 bg-blue-100 rounded-lg appearance-none cursor-pointer accent-blue-400"
            id="slider-idle-timeout"
          />
          <span className="text-sm font-bold text-blue-500 min-w-[50px] text-right">
            {localSettings.idleTimeout} min
          </span>
        </div>
      </section>

      {/* Save Button */}
      <button
        onClick={handleSave}
        className={`w-full py-2.5 rounded-xl font-bold text-sm transition-all duration-300 ${
          saved
            ? 'bg-gradient-to-r from-green-400 to-emerald-400 text-white scale-95'
            : 'bg-gradient-to-r from-pink-400 to-violet-400 text-white hover:scale-[1.02] hover:shadow-lg active:scale-95'
        }`}
        id="btn-save-settings"
      >
        {saved ? '✓ Saved!' : '💾 Save Settings'}
      </button>
    </div>
  );
}
