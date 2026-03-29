You are an expert desktop application engineer.

Modify my existing desktop assistant app to make the cat avatar FULLY DRAGGABLE and placeable anywhere on the screen.

---

## 🎯 GOAL

The cat avatar should:

* Be draggable with mouse (click + drag)
* Stay exactly where the user places it
* Remain always on top of all windows
* Not interfere with normal desktop usage

---

## 🧰 TECH STACK

* Tauri (preferred) OR Electron
* React frontend

---

## 🪟 WINDOW BEHAVIOR

* Frameless window (no title bar)
* Transparent background
* Always-on-top enabled
* Ignore taskbar (optional)
* Small floating widget style

---

## 🖱️ DRAG FUNCTIONALITY (CORE)

Implement:

1. Click and drag:

   * User can click anywhere on the cat avatar and drag it
   * Smooth movement across screen

2. Position persistence:

   * Save X and Y coordinates locally (JSON or localStorage)
   * Restore position on app restart

3. Screen boundaries:

   * Prevent the avatar from going off-screen completely
   * Allow partial edge snapping

---

## ⚙️ IMPLEMENTATION DETAILS

* If using Tauri:

  * Use window APIs (setPosition, listen to mouse events)

* If using Electron:

  * Use BrowserWindow + draggable regions OR manual drag logic

* In React:

  * Track mouse position (onMouseDown, onMouseMove, onMouseUp)
  * Update window position dynamically

---

## 🧠 EXTRA FEATURES (IMPORTANT)

* Double-click cat → reset to default position
* Optional: snap to nearest corner
* Optional: slight inertia/smooth easing while dragging

---

## 💻 OUTPUT REQUIREMENTS

Provide:

1. Updated code for draggable behavior
2. React component for cat avatar with drag logic
3. Window configuration (Tauri/Electron)
4. Position save/load logic
5. Clear comments explaining each part

---

## 🚀 IMPORTANT

* Code must be COMPLETE and WORKING
* Do not give partial snippets
* Ensure smooth performance and no lag
* Keep code clean and well-structured
