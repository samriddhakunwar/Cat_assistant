"""
Activity Tracker Module
Monitors keyboard activity and tracks screen time using pynput.
Runs a keyboard listener in a background thread.
"""

import time
import threading
from pynput import keyboard


class ActivityTracker:
    """Tracks user keyboard activity and continuous screen time."""

    def __init__(self, idle_timeout_minutes=5):
        self._lock = threading.Lock()
        self._idle_timeout = idle_timeout_minutes * 60  # Convert to seconds
        self._last_keystroke_time = 0.0
        self._session_start_time = time.time()
        self._total_screen_time = 0.0  # Accumulated screen time in seconds
        self._is_active = False
        self._listener = None
        self._running = False

    def start(self):
        """Start the keyboard listener in a background thread."""
        if self._running:
            return
        self._running = True
        self._session_start_time = time.time()
        self._listener = keyboard.Listener(on_press=self._on_key_press)
        self._listener.daemon = True
        self._listener.start()

    def stop(self):
        """Stop the keyboard listener."""
        self._running = False
        if self._listener:
            self._listener.stop()
            self._listener = None

    def _on_key_press(self, key):
        """Callback for each keypress event."""
        now = time.time()
        with self._lock:
            # If user was idle and is now active again, reset session start
            if not self._is_active:
                self._session_start_time = now
                self._is_active = True
            self._last_keystroke_time = now

    @property
    def is_typing(self) -> bool:
        """True if user pressed a key within the last 3 seconds."""
        with self._lock:
            if self._last_keystroke_time == 0:
                return False
            return (time.time() - self._last_keystroke_time) < 3.0

    @property
    def idle_seconds(self) -> float:
        """Seconds since the last keystroke."""
        with self._lock:
            if self._last_keystroke_time == 0:
                return time.time() - self._session_start_time
            return time.time() - self._last_keystroke_time

    @property
    def screen_time_minutes(self) -> float:
        """
        Continuous screen time in minutes.
        Resets when user is idle for longer than idle_timeout.
        """
        with self._lock:
            now = time.time()

            # If user has been idle too long, reset the counter
            if self._last_keystroke_time > 0 and (now - self._last_keystroke_time) > self._idle_timeout:
                self._session_start_time = now
                self._is_active = False
                return 0.0

            # Calculate continuous screen time from session start
            return (now - self._session_start_time) / 60.0

    def reset_screen_time(self):
        """Manually reset the screen time counter (e.g., after user takes a break)."""
        with self._lock:
            self._session_start_time = time.time()
            self._is_active = False

    def update_idle_timeout(self, minutes: int):
        """Update the idle timeout threshold."""
        with self._lock:
            self._idle_timeout = minutes * 60
