"""
Settings Manager Module
Handles reading and writing settings to a JSON file.
"""

import json
import os

# Default settings
DEFAULT_SETTINGS = {
    "sleepStart": "23:00",
    "sleepEnd": "07:00",
    "waterReminderInterval": 30,
    "restReminderThreshold": 120,
    "enableWaterReminder": True,
    "enableRestReminder": True,
    "enableTypingDetection": True,
    "idleTimeout": 5,
}

# Path to the settings file (relative to project root)
SETTINGS_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), "config", "settings.json")


class SettingsManager:
    """Manages application settings with JSON file persistence."""

    def __init__(self, path=None):
        self.path = path or SETTINGS_PATH
        self._ensure_config_dir()

    def _ensure_config_dir(self):
        """Create the config directory if it doesn't exist."""
        config_dir = os.path.dirname(self.path)
        if not os.path.exists(config_dir):
            os.makedirs(config_dir)

    def load(self) -> dict:
        """Load settings from JSON file. Returns defaults if file doesn't exist."""
        try:
            with open(self.path, "r") as f:
                settings = json.load(f)
            # Merge with defaults to ensure all keys exist
            merged = {**DEFAULT_SETTINGS, **settings}
            return merged
        except (FileNotFoundError, json.JSONDecodeError):
            # Return defaults and save them
            self.save(DEFAULT_SETTINGS)
            return DEFAULT_SETTINGS.copy()

    def save(self, settings: dict) -> dict:
        """Save settings to JSON file."""
        # Merge with defaults to ensure all keys exist
        merged = {**DEFAULT_SETTINGS, **settings}
        with open(self.path, "w") as f:
            json.dump(merged, f, indent=2)
        return merged
