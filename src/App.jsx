import React, { useState, useEffect, useCallback, useRef } from 'react';
import CatAvatar from './components/CatAvatar';
import Notification from './components/Notification';
import SettingsPanel from './components/SettingsPanel';
import WidgetPanel from './components/widgets/WidgetPanel';
import AnalyticsDashboard from './components/analytics/AnalyticsDashboard';
import { useActivityTracker } from './hooks/useActivityTracker';
import { useSettings } from './hooks/useSettings';
import { useDrag } from './hooks/useDrag';
import { useSleepVoice } from './hooks/useSleepVoice';

/**
 * Main App Component
 * Routes to the correct view based on the URL hash.
 */
export default function App() {
  const hash = window.location.hash;

  if (hash === '#settings')  return <SettingsView />;
  if (hash === '#widgets')   return <WidgetsView />;
  if (hash === '#analytics') return <AnalyticsView />;

  return <WidgetView />;
}

// ─── Widget Panel View ─────────────────────────────────────────────────────────
function WidgetsView() {
  return (
    <div className="w-full h-full flex items-start justify-center" style={{ background: 'transparent' }}>
      <WidgetPanel />
    </div>
  );
}

// ─── Analytics Dashboard View ──────────────────────────────────────────────────
function AnalyticsView() {
  return (
    <div className="w-full h-full flex items-start justify-center" style={{ background: 'transparent' }}>
      <AnalyticsDashboard />
    </div>
  );
}

// ─── Main Cat Widget View ──────────────────────────────────────────────────────
function WidgetView() {
  const { settings, loading: settingsLoading } = useSettings();
  const { status, loading: statusLoading } = useActivityTracker(2000);

  const { isDragging, dragHandlers } = useDrag();

  // Cat state: idle | typing | sleeping | drinking | tired | happy
  const [catState, setCatState] = useState('idle');
  const [notification, setNotification] = useState(null);

  useSleepVoice(catState === 'sleeping', settings);

  const waterTimerRef = useRef(null);
  const lastWaterReminder = useRef(Date.now());
  const restNotifiedRef = useRef(false);

  // Listen for pomodoro-done → briefly set cat to 'happy'
  useEffect(() => {
    const handler = () => {
      setCatState('happy');
      setTimeout(() => setCatState('idle'), 3000);
    };
    window.addEventListener('pomodoro-done', handler);
    return () => window.removeEventListener('pomodoro-done', handler);
  }, []);

  // --- State Machine Logic ---
  const determineCatState = useCallback(() => {
    if (!settings || !status) return 'idle';

    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const currentTime = hours * 60 + minutes;

    const [sleepStartH, sleepStartM] = (settings.sleepStart || '23:00').split(':').map(Number);
    const [sleepEndH, sleepEndM] = (settings.sleepEnd || '07:00').split(':').map(Number);
    const sleepStart = sleepStartH * 60 + sleepStartM;
    const sleepEnd = sleepEndH * 60 + sleepEndM;

    let isSleepTime = false;
    if (sleepStart > sleepEnd) {
      isSleepTime = currentTime >= sleepStart || currentTime < sleepEnd;
    } else {
      isSleepTime = currentTime >= sleepStart && currentTime < sleepEnd;
    }

    if (isSleepTime) return 'sleeping';

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

    if (settings.enableWaterReminder) {
      const intervalMs = (settings.waterReminderInterval || 30) * 60 * 1000;
      const timeSinceLast = Date.now() - lastWaterReminder.current;
      if (timeSinceLast >= intervalMs) {
        lastWaterReminder.current = Date.now();
        setNotification({ message: 'Time to drink water! 💧', type: 'water' });
        if (window.electronAPI) {
          window.electronAPI.showNotification('🐱 Water Reminder', 'Time to drink some water! 💧');
        }
        setTimeout(() => { setCatState('idle'); setNotification(null); }, 5000);
        return 'drinking';
      }
    }

    if (settings.enableTypingDetection && status.is_typing) return 'typing';

    return 'idle';
  }, [settings, status]);

  useEffect(() => {
    const newState = determineCatState();
    // Don't override 'drinking' mid-animation, or 'happy' mid-celebration
    if (newState && catState !== 'drinking' && catState !== 'happy') {
      setCatState(newState);
    }
  }, [status, settings, determineCatState]);

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

  return (
    <div className="relative flex flex-col items-center justify-end w-full h-full pb-2">
      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onDismiss={() => setNotification(null)}
          onTakeBreak={notification.type === 'rest' ? handleResetTimer : null}
        />
      )}

      <CatAvatar state={catState} dragHandlers={dragHandlers} isDragging={isDragging} />

      {isDragging && <div className="drag-hint">🐾 Dragging…</div>}

      {/* Status indicator */}
      <div className="mt-1 flex items-center gap-1.5">
        <div className={`w-2 h-2 rounded-full ${
          catState === 'sleeping' ? 'bg-indigo-400' :
          catState === 'typing'   ? 'bg-green-400 animate-pulse' :
          catState === 'tired'    ? 'bg-red-400 animate-pulse' :
          catState === 'happy'    ? 'bg-yellow-400 animate-pulse' :
          'bg-emerald-400'
        }`} />
        <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">
          {catState}
        </span>
      </div>

      {/* Control buttons */}
      <div className="flex gap-2 mt-2">
        <button
          className="control-btn control-btn-widgets"
          onClick={() => window.electronAPI?.openWidgets()}
          title="Widgets"
          id="btn-widgets"
        >
          🧩
        </button>
        <button
          className="control-btn control-btn-analytics"
          onClick={() => window.electronAPI?.openAnalytics()}
          title="Analytics"
          id="btn-analytics"
        >
          📊
        </button>
        <button
          className="control-btn control-btn-settings"
          onClick={() => window.electronAPI?.openSettings()}
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

// ─── Settings View ─────────────────────────────────────────────────────────────
function SettingsView() {
  return (
    <div className="w-full h-full flex items-start justify-center pt-4" style={{ background: 'transparent' }}>
      <SettingsPanel />
    </div>
  );
}
