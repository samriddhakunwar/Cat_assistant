"""
Cat Desktop Assistant - FastAPI Backend
Provides activity tracking and settings management via REST API.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from activity_tracker import ActivityTracker
from settings_manager import SettingsManager

# --- Initialize ---
app = FastAPI(title="Cat Desktop Assistant Backend")

# Allow CORS for the Electron frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create singleton instances
settings_manager = SettingsManager()
settings = settings_manager.load()
activity_tracker = ActivityTracker(idle_timeout_minutes=settings.get("idleTimeout", 5))

# Start tracking on startup
activity_tracker.start()


# --- Models ---
class SettingsUpdate(BaseModel):
    sleepStart: str = "23:00"
    sleepEnd: str = "07:00"
    waterReminderInterval: int = 30
    restReminderThreshold: int = 120
    enableWaterReminder: bool = True
    enableRestReminder: bool = True
    enableTypingDetection: bool = True
    idleTimeout: int = 5


# --- Endpoints ---
@app.get("/status")
def get_status():
    """
    Returns current user activity status.
    The frontend polls this to determine the cat's state.
    """
    return {
        "is_typing": activity_tracker.is_typing,
        "idle_seconds": round(activity_tracker.idle_seconds, 1),
        "screen_time_minutes": round(activity_tracker.screen_time_minutes, 1),
    }


@app.get("/settings")
def get_settings():
    """Returns current settings."""
    return settings_manager.load()


@app.post("/settings")
def update_settings(new_settings: SettingsUpdate):
    """Updates and persists settings."""
    saved = settings_manager.save(new_settings.dict())
    # Update the activity tracker's idle timeout
    activity_tracker.update_idle_timeout(new_settings.idleTimeout)
    return saved


@app.post("/reset-timer")
def reset_timer():
    """Resets the continuous screen time counter."""
    activity_tracker.reset_screen_time()
    return {"status": "ok", "message": "Screen time timer reset"}


@app.get("/health")
def health_check():
    """Simple health check endpoint."""
    return {"status": "ok"}


# --- Shutdown ---
@app.on_event("shutdown")
def shutdown_event():
    """Clean up the keyboard listener on shutdown."""
    activity_tracker.stop()
