You are an expert full-stack desktop application engineer.

Enhance my existing desktop cat assistant app by adding:

1. A MINI WIDGET SYSTEM (floating UI beside the cat)
2. A USER ANALYTICS DASHBOARD (data tracking + visualization)

The app is built using:

* Tauri (or Electron)
* React + Tailwind CSS
* Optional backend (Python or Node)

---

## 🧩 1. MINI WIDGET SYSTEM

Create a modular floating widget panel that appears beside the cat assistant.

GENERAL REQUIREMENTS:

* Small, clean UI (glassmorphism or minimal design)
* Toggle visibility (show/hide button)
* Positioned near the draggable cat avatar
* Responsive and lightweight

---

## ⏰ POMODORO TIMER

Features:

* Default: 25 min work / 5 min break
* Start / Pause / Reset buttons
* Visual countdown timer
* Auto-switch between work and break
* Notification when session ends

---

## 📅 MINI CALENDAR

Features:

* Display current date
* Monthly view (simple grid)
* Highlight current day
* Optional: show upcoming reminders

---

## ✅ TO-DO LIST

Features:

* Add / delete tasks
* Mark tasks as completed
* Persist tasks using local storage or SQLite
* Clean checklist UI

---

## 💧 WATER TRACKER

Features:

* Log water intake (button click)
* Daily goal (e.g., 8 glasses)
* Progress indicator (bar or circles)
* Reset daily automatically

---

## 📊 2. USER ANALYTICS DASHBOARD

Create a separate panel or modal for analytics.

GENERAL REQUIREMENTS:

* Clean dashboard UI
* Charts for visualization
* Toggle open/close

---

## 📈 SCREEN TIME TRACKING

* Track active screen usage time
* Reset after inactivity threshold
* Store daily usage

---

## ⌨️ TYPING SPEED TRACKING

* Capture keyboard input activity
* Calculate words per minute (WPM)
* Store historical data

---

## 🏆 PRODUCTIVITY SCORE

Calculate a score based on:

* Pomodoro sessions completed
* Screen time balance
* Task completion rate

Display:

* Daily score
* Simple rating (e.g., Low / Medium / High)

---

## 📊 CHARTS (IMPORTANT)

Use a chart library such as:

* Recharts OR Chart.js

Include:

* Screen time graph (daily)
* Typing speed history
* Productivity score trend

---

## 🗄️ DATA STORAGE

* Use local storage OR SQLite
* Persist:

  * Tasks
  * Water logs
  * Screen time
  * Typing data
  * Pomodoro sessions

---

## 🔔 NOTIFICATIONS

* Pomodoro completion
* Water reminders
* Task reminders (optional)

---

## 🧠 INTEGRATION WITH CAT

* Cat reacts to events:

  * Pomodoro done → happy animation
  * Long screen time → tired animation
  * Water reminder → drinking animation

---

## 🎨 UI/UX REQUIREMENTS

* Modern, minimal UI
* Smooth animations
* Floating panel near cat
* Dark mode support

---

## 📁 OUTPUT REQUIREMENTS

Provide:

1. Full component structure (React)
2. Widget panel implementation
3. Each widget (Pomodoro, To-do, etc.)
4. Analytics dashboard with charts
5. Data storage logic
6. Integration with existing app
7. Clear comments in code

---

## 🚀 IMPORTANT

* Provide COMPLETE WORKING CODE (no partial snippets)
* Ensure performance is optimized
* Use reusable components
* Keep code clean and modular
