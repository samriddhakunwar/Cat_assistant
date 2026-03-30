You are an expert desktop application engineer.

Enhance my existing desktop cat assistant app by adding a VOICE FEATURE using an audio clip extracted from "bad+cat.mp4".

---

## 🎯 GOAL

When the user’s sleep schedule starts:

* The assistant should play a voice/audio clip (from bad+cat.mp4)
* The audio should repeat every 5 minutes
* Stop automatically when sleep schedule ends

---

## 🧰 TECH STACK

* Tauri (or Electron)
* React frontend
* Optional backend (Python or Node)

---

## 🔊 AUDIO REQUIREMENTS

1. Extract audio from "bad+cat.mp4" and save as:

   * /assets/audio/cat_voice.mp3

2. Playback behavior:

   * Start playing immediately when sleep mode activates
   * Repeat every 5 minutes (300,000 ms)
   * Do NOT overlap audio (prevent multiple instances)
   * Stop playback when sleep mode ends

---

## 🧠 LOGIC IMPLEMENTATION

Implement:

1. Sleep schedule detection

   * When current time enters sleep range → trigger

2. Timer system:

   * Use setInterval (React/JS) OR backend scheduler
   * Interval = 5 minutes

3. State control:

   * isSleepMode = true/false
   * Only play audio when true

---

## 💻 FRONTEND IMPLEMENTATION (React)

* Use HTML5 Audio API

Example requirements:

* Create audio instance
* Play, pause, reset
* Ensure audio is not duplicated

---

## ⚙️ SAMPLE BEHAVIOR

IF time == sleep start:
→ play audio once
→ start 5-min interval loop

EVERY 5 minutes:
→ play audio again

IF sleep mode ends:
→ stop audio
→ clear interval

---

## 🧪 EDGE CASES

* If app restarts during sleep mode → resume behavior
* If audio is already playing → do not restart
* Handle user muting option

---

## 🎛️ EXTRA FEATURES (OPTIONAL BUT PREFERRED)

* Volume control slider
* Toggle: enable/disable voice reminders
* Fade-in audio for smoother experience

---

## 📁 OUTPUT REQUIREMENTS

Provide:

1. Full React code for audio playback system
2. Sleep detection logic
3. Interval/timer implementation
4. Audio file handling
5. Clear comments for each part

---

## 🚀 IMPORTANT

* Code must be COMPLETE and WORKING
* No partial snippets
* Ensure clean architecture and no memory leaks (clearInterval properly)
