You are an expert desktop application debugging engineer.

My desktop assistant app (built with Tauri/Electron + React) is running and all features work logically, BUT the cat avatar and widget UI are NOT visible on the screen.

Your task is to DEBUG and FIX the issue completely.

---

## 🎯 GOAL

* Ensure the cat avatar and widget panel are visible on screen
* Ensure they render in the correct position (corner or saved position)
* Ensure transparency and floating UI works correctly

---

## 🧠 DEBUG CHECKLIST (FOLLOW STEP BY STEP)

1. WINDOW CONFIGURATION

* Verify window settings:

  * visible: true
  * transparent: true
  * alwaysOnTop: true
  * width/height properly set
* If missing → fix config

2. OFF-SCREEN POSITION BUG

* Check if saved position (localStorage or backend) is pushing window outside viewport
* If yes:

  * Reset position to default (e.g., x:100, y:100)
  * Add boundary checks to prevent off-screen placement

3. REACT RENDERING

* Ensure Cat component and Widget panel are mounted in App.jsx
* Confirm they are actually rendered in DOM

4. CSS VISIBILITY ISSUES

* Check for:

  * display: none
  * opacity: 0
  * visibility: hidden
* Fix any styles hiding components

5. Z-INDEX / LAYERING

* Ensure cat and widgets have high z-index (e.g., 9999)
* Ensure they are not hidden behind other elements

6. TRANSPARENT WINDOW ISSUE

* Add temporary background (e.g., red) to confirm rendering
* If visible → fix styling to ensure content is visible on transparent background

7. CANVAS / 3D (if used)

* Ensure canvas has explicit width and height
* Ensure rendering loop is working

8. WINDOW POSITION + FOCUS

* Force window to:

  * show()
  * setFocus()
* Ensure it is not minimized or hidden

9. DEVTOOLS DEBUGGING

* Check for:

  * console errors
  * failed assets (animations, images, models)

---

## ⚙️ IMPLEMENT FIXES

* Reset position logic
* Add default safe position
* Add boundary constraints
* Fix CSS visibility
* Fix window config
* Ensure proper rendering

---

## 💻 OUTPUT REQUIREMENTS

Provide:

1. Root cause of the issue
2. Exact fixes applied
3. Updated code (FULL, not partial)
4. Any improvements to prevent this in future

---

## 🚀 IMPORTANT

* Do NOT guess — systematically debug
* Ensure final solution works reliably
* Keep code clean and well-structured
