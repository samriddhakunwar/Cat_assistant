import React, { useState, useEffect, useCallback, useRef } from 'react';
import CatAvatar from './components/CatAvatar';
import Notification from './components/Notification';
import SettingsPanel from './components/SettingsPanel';
import { useActivityTracker } from './hooks/useActivityTracker';
import { useSettings } from './hooks/useSettings';
import { useDrag } from './hooks/useDrag';

/**
 * Main App Component
 * Determines which view to show (widget or settings) based on the URL hash.
 * In the main widget view, manages the cat state machine and notifications.
 */
export default function App() {
  const isSettingsView = window.location.hash === '#settings';

  if (isSettingsView) {
    return <SettingsView />;
  }

  return <WidgetView />;
}

/**
 * Widget View — main cat assistant floating widget
 */
function WidgetView() {
  const { settings, loading: settingsLoading } = useSettings();
  const { status, loading: statusLoading } = useActivityTracker(2000);

  // Drag functionality — click+drag to move window, double-click to reset
  const { isDragging, dragHandlers } = useDrag();

  // Cat state: idle | typing | sleeping | drinking | tired
  const [catState, setCatState] = useState('idle');
  const [notification, setNotification] = useState(null);
  const [showSettings, setShowSettings] = useState(false);

  // Timers for water and rest reminders
  const waterTimerRef = useRef(null);
  const lastWaterReminder = useRef(Date.now());
  const restNotifiedRef = useRef(false);

  // --- State Machine Logic ---
  const determineCatState = useCallback(() => {
    if (!settings || !status) return 'idle';

    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const currentTime = hours * 60 + minutes;

    // Parse sleep schedule
    const [sleepStartH, sleepStartM] = (settings.sleepStart || '23:00').split(':').map(Number);
    const [sleepEndH, sleepEndM] = (settings.sleepEnd || '07:00').split(':').map(Number);
    const sleepStart = sleepStartH * 60 + sleepStartM;
    const sleepEnd = sleepEndH * 60 + sleepEndM;

    // Check if it's sleep time
    let isSleepTime = false;
    if (sleepStart > sleepEnd) {
      // Sleep spans midnight (e.g., 23:00 - 07:00)
      isSleepTime = currentTime >= sleepStart || currentTime < sleepEnd;
    } else {
      isSleepTime = currentTime >= sleepStart && currentTime < sleepEnd;
    }

    if (isSleepTime) {
      return 'sleeping';
    }

    // Check rest reminder (screen time > threshold)
    if (
      settings.enableRestReminder &&
      status.screen_time_minutes >= (settings.restReminderThreshold || 120)
    ) {
      if (!restNotifiedRef.current) {
        restNotifiedRef.current = true;
        setNotification({
          message: `You've been working for ${Math.round(status.screen_time_minutes)} min. Take a break! 🧘`,
          type: 'rest',
        });
        // Also show a system notification
        if (window.electronAPI) {
          window.electronAPI.showNotification(
            '🐱 Rest Reminder',
            `You've been working for ${Math.round(status.screen_time_minutes)} minutes. Time for a short break!`
          );
        }
      }
      return 'tired';
    } else {
      restNotifiedRef.current = false;
    }

    // Check water reminder
    if (settings.enableWaterReminder) {
      const intervalMs = (settings.waterReminderInterval || 30) * 60 * 1000;
      const timeSinceLast = Date.now() - lastWaterReminder.current;

      if (timeSinceLast >= intervalMs) {
        lastWaterReminder.current = Date.now();
        setNotification({
          message: 'Time to drink water! 💧',
          type: 'water',
        });
        if (window.electronAPI) {
          window.electronAPI.showNotification('🐱 Water Reminder', 'Time to drink some water! 💧');
        }
        // Show drinking animation for 5 seconds
        setTimeout(() => {
          setCatState('idle');
          setNotification(null);
        }, 5000);
        return 'drinking';
      }
    }

    // Check typing state
    if (settings.enableTypingDetection && status.is_typing) {
      return 'typing';
    }

    return 'idle';
  }, [settings, status]);

  // Update cat state every time status or settings change
  useEffect(() => {
    const newState = determineCatState();
    if (newState && catState !== 'drinking') {
      setCatState(newState);
    }
  }, [status, settings, determineCatState]);

  // Auto-dismiss notifications after 6 seconds
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 6000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const handleResetTimer = async () => {
    try {
      await fetch('http://127.0.0.1:8765/reset-timer', { method: 'POST' });
      restNotifiedRef.current = false;
      setNotification(null);
      setCatState('idle');
    } catch (err) {
      console.error('Failed to reset timer:', err);
    }
  };

  const handleOpenSettings = () => {
    if (window.electronAPI) {
      window.electronAPI.openSettings();
    }
  };

  return (
    <div className="relative flex flex-col items-center justify-end w-full h-full pb-2">
      {/* Notification */}
      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onDismiss={() => setNotification(null)}
          onTakeBreak={notification.type === 'rest' ? handleResetTimer : null}
        />
      )}

      {/* Cat Avatar — drag handlers and isDragging are wired here */}
      <CatAvatar state={catState} dragHandlers={dragHandlers} isDragging={isDragging} />

      {/* Drag hint — briefly visible so the user discovers the feature */}
      {isDragging && (
        <div className="drag-hint">
          🐾 Dragging…
        </div>
      )}

      {/* Status indicator */}
      <div className="mt-1 flex items-center gap-1.5">
        <div
          className={`w-2 h-2 rounded-full ${
            catState === 'sleeping'
              ? 'bg-indigo-400'
              : catState === 'typing'
              ? 'bg-green-400 animate-pulse'
              : catState === 'tired'
              ? 'bg-red-400 animate-pulse'
              : 'bg-emerald-400'
          }`}
        />
        <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">
          {catState}
        </span>
      </div>

      {/* Control buttons */}
      <div className="flex gap-2 mt-2">
        <button
          className="control-btn control-btn-settings"
          onClick={handleOpenSettings}
          title="Settings"
          id="btn-settings"
        >
          ⚙️
        </button>
        <button
          className="control-btn control-btn-close"
          onClick={() => window.electronAPI?.quitApp()}
          title="Quit"
          id="btn-quit"
        >
          ✕
        </button>
      </div>
    </div>
  );
}

/**
 * Settings View — shown in a separate Electron window
 */
function SettingsView() {
  return (
    <div className="w-full h-full flex items-start justify-center pt-4" style={{ background: 'transparent' }}>
      <SettingsPanel />
    </div>
  );
}
