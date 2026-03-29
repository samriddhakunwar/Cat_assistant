You are an expert desktop application engineer.

Build a COMPLETE, production-ready desktop assistant app with the following requirements.

---

## 🧠 PROJECT OVERVIEW

Create a floating desktop assistant app with a CUTE CAT AVATAR that lives in the corner of the screen and behaves intelligently based on user activity.

The assistant should:

* Stay always visible (corner widget style)
* Be lightweight and responsive
* Track user activity (typing + screen time)
* Show animated behaviors (cat states)

---

## 🧰 TECH STACK (MANDATORY)

* Desktop Framework: Tauri (preferred) OR Electron (if simpler)
* Frontend: React + Tailwind CSS
* Backend logic: Python (for system monitoring)
* Communication: Local API (FastAPI) or IPC bridge
* Data storage: SQLite or JSON

---

## 🐱 CAT AVATAR BEHAVIOR (CORE FEATURE)

Create an animated cat avatar with the following states:

1. Idle State

   * Cat sits calmly and occasionally blinks

2. Typing State

   * When user is typing (detect via keyboard listener), cat animates as if typing on a keyboard

3. Sleep Mode

   * User defines sleep schedule (e.g., 11 PM – 7 AM)
   * During this time:

     * Cat lies down and sleeps (looping animation)
     * Assistant reduces notifications

4. Water Reminder State

   * Every X minutes (configurable):

     * Cat drinks water animation
     * Show notification: “Time to drink water 💧”

5. Rest Reminder State (VERY IMPORTANT)

   * If user screen time exceeds 2 hours continuously:

     * Cat looks tired or concerned
     * Show popup:
       “You’ve been working for 2 hours. Take a short break 🧘”
     * Optional: suggest a 5-minute timer

---

## ⌨️ USER ACTIVITY TRACKING

Implement:

* Keyboard activity detection
* Screen active time tracking (no idle)
* Reset timer when user is inactive for X minutes

---

## 🔔 FEATURES

* Desktop notifications
* Config panel:

  * Set sleep schedule
  * Set water reminder interval
  * Enable/disable features
* Persistent data (save settings locally)

---

## 🪟 UI REQUIREMENTS

* Small floating widget in bottom-right corner
* Transparent background
* Always-on-top window
* Smooth animations (use CSS or Lottie)

---

## 🎨 DESIGN

* Modern, minimal UI
* Cute, animated cat (use sprite sheet or Lottie animations)
* Soft colors, rounded corners

---

## 📁 PROJECT STRUCTURE

Generate FULL folder structure including:

* /src (React frontend)
* /backend (Python FastAPI)
* /assets (cat animations)
* /config
* /scripts

---

## ⚙️ IMPLEMENTATION DETAILS

* Include:

  * Full code for frontend and backend
  * Activity tracking logic
  * Timer logic (2-hour tracking)
  * IPC/API connection between frontend and backend
  * Notification system
* Provide comments in code explaining logic

---

## 🚀 OUTPUT FORMAT

1. Project folder structure
2. Step-by-step setup instructions
3. Full source code (split into files)
4. How to run the app locally
5. Suggestions for improvements

---

## 🔥 BONUS (IMPORTANT)

* Add sound effects (optional)
* Add simple animation switching system for cat states
* Ensure low CPU usage

---

Do NOT give partial code. Generate COMPLETE working code for the entire project.

