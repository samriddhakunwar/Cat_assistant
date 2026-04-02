const { app, BrowserWindow, Tray, Menu, screen, ipcMain, Notification } = require('electron');
const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');

let mainWindow;
let settingsWindow = null;
let widgetWindow = null;
let analyticsWindow = null;
let tray;
let pythonProcess;

// --- Position Persistence ---
const POSITION_FILE = path.join(app.getPath('userData'), 'window-position.json');

// Window dimensions (must match the BrowserWindow size)
const MAIN_WIDTH = 280;
const MAIN_HEIGHT = 350;

/**
 * Load saved window position from disk.
 * Returns { x, y } or null if no saved position exists.
 */
function loadSavedPosition() {
  try {
    if (fs.existsSync(POSITION_FILE)) {
      const data = JSON.parse(fs.readFileSync(POSITION_FILE, 'utf-8'));
      if (typeof data.x === 'number' && typeof data.y === 'number') {
        return data;
      }
    }
  } catch (err) {
    console.error('Failed to load saved position:', err);
  }
  return null;
}

/**
 * Save window position to disk.
 */
function savePosition(x, y) {
  try {
    fs.writeFileSync(POSITION_FILE, JSON.stringify({ x, y }), 'utf-8');
  } catch (err) {
    console.error('Failed to save position:', err);
  }
}

/**
 * Compute the default position (bottom-right of the primary display).
 */
function getDefaultPosition() {
  const { width, height } = screen.getPrimaryDisplay().workAreaSize;
  return { x: width - MAIN_WIDTH - 20, y: height - MAIN_HEIGHT - 20 };
}

/**
 * Clamp a window position so it stays within screen boundaries.
 * At least 60px of the window must remain on-screen on every edge.
 */
function clampToScreen(x, y, winWidth, winHeight) {
  const { width: screenW, height: screenH } = screen.getPrimaryDisplay().workAreaSize;

  // Ensure the FULL window is always within screen bounds (no off-screen placement)
  const clampedX = Math.max(0, Math.min(x, screenW - winWidth));
  const clampedY = Math.max(0, Math.min(y, screenH - winHeight));
  return { x: Math.round(clampedX), y: Math.round(clampedY) };
}

/**
 * Get a safe initial position: use saved position if it's on-screen,
 * otherwise fall back to default.
 */
function getSafeInitialPosition() {
  const saved = loadSavedPosition();
  const defaultPos = getDefaultPosition();

  if (!saved) return defaultPos;

  // Validate saved position keeps the FULL window on-screen
  const { width: screenW, height: screenH } = screen.getPrimaryDisplay().workAreaSize;
  const isFullyOnScreen =
    saved.x >= 0 &&
    saved.y >= 0 &&
    saved.x + MAIN_WIDTH <= screenW &&
    saved.y + MAIN_HEIGHT <= screenH;

  if (isFullyOnScreen) {
    return { x: Math.round(saved.x), y: Math.round(saved.y) };
  }

  // Saved position is off-screen or partially off-screen — clamp it
  const clamped = clampToScreen(saved.x, saved.y, MAIN_WIDTH, MAIN_HEIGHT);
  console.warn(`[Position] Saved position (${saved.x},${saved.y}) was off-screen; clamped to (${clamped.x},${clamped.y}).`);
  savePosition(clamped.x, clamped.y);
  return clamped;
}

// --- Python Backend Management ---
function startPythonBackend() {
  const backendPath = path.join(__dirname, '..', 'backend');
  pythonProcess = spawn('python', ['-m', 'uvicorn', 'main:app', '--host', '127.0.0.1', '--port', '8765'], {
    cwd: backendPath,
    stdio: 'pipe',
  });

  pythonProcess.stdout.on('data', (data) => {
    console.log(`[Python Backend] ${data}`);
  });

  pythonProcess.stderr.on('data', (data) => {
    console.log(`[Python Backend] ${data}`);
  });

  pythonProcess.on('error', (err) => {
    console.error('Failed to start Python backend:', err);
    // Try python3 as fallback
    pythonProcess = spawn('python3', ['-m', 'uvicorn', 'main:app', '--host', '127.0.0.1', '--port', '8765'], {
      cwd: backendPath,
      stdio: 'pipe',
    });
  });

  pythonProcess.on('close', (code) => {
    console.log(`Python backend exited with code ${code}`);
  });
}

function stopPythonBackend() {
  if (pythonProcess) {
    pythonProcess.kill();
    pythonProcess = null;
  }
}

// --- Window Creation ---
function createMainWindow() {
  const pos = getSafeInitialPosition();

  mainWindow = new BrowserWindow({
    width: MAIN_WIDTH,
    height: MAIN_HEIGHT,
    x: pos.x,
    y: pos.y,
    show: false,           // Don't show until content is ready
    frame: false,          // Frameless window — no title bar
    transparent: true,     // Transparent background for the floating widget
    alwaysOnTop: true,     // Always visible above all other windows
    resizable: false,
    skipTaskbar: true,     // Don't show in taskbar
    hasShadow: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  // Show window only when the renderer is fully painted
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    mainWindow.setAlwaysOnTop(true, 'screen-saver');
    mainWindow.focus();
    console.log(`[Window] Main window shown at (${pos.x}, ${pos.y})`);
  });

  // Failsafe: if ready-to-show doesn't fire within 3 seconds, force show
  const failsafeTimer = setTimeout(() => {
    if (mainWindow && !mainWindow.isVisible()) {
      console.warn('[Window] Failsafe: forcing window visible after timeout');
      mainWindow.show();
      mainWindow.setAlwaysOnTop(true, 'screen-saver');
      mainWindow.focus();
    }
  }, 3000);

  mainWindow.once('show', () => clearTimeout(failsafeTimer));

  // Log any renderer-side errors so we can diagnose paint failures
  mainWindow.webContents.on('did-fail-load', (event, code, desc) => {
    console.error(`[Window] Renderer failed to load: ${code} – ${desc}`);
    // Force show anyway so the window at least appears (even blank)
    if (mainWindow && !mainWindow.isVisible()) mainWindow.show();
  });

  // In development, load from Vite dev server; in production, load built files
  const isDev = process.argv.includes('--dev') || !app.isPackaged;

  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
  } else {
    mainWindow.loadFile(path.join(__dirname, '..', 'dist', 'index.html'));
  }

  // Ensure transparent areas DON'T block mouse events on other windows,
  // but the cat itself IS clickable.
  mainWindow.setIgnoreMouseEvents(false);

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

/**
 * Helper: compute a safe position for secondary windows.
 * Prevents negative coordinates on small screens.
 */
function safeSecondaryPosition(winWidth, winHeight, offsetX, offsetY) {
  const { width, height } = screen.getPrimaryDisplay().workAreaSize;
  const x = Math.max(20, Math.min(width - winWidth - 20, width - offsetX));
  const y = Math.max(20, Math.min(height - winHeight - 20, height - offsetY));
  return { x, y };
}

function createSettingsWindow() {
  if (settingsWindow) {
    settingsWindow.show();
    settingsWindow.focus();
    return;
  }

  const pos = safeSecondaryPosition(400, 520, 420, 560);

  settingsWindow = new BrowserWindow({
    width: 400,
    height: 520,
    x: pos.x,
    y: pos.y,
    show: false,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    resizable: false,
    skipTaskbar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  settingsWindow.once('ready-to-show', () => {
    settingsWindow.show();
    settingsWindow.focus();
  });

  const isDev = process.argv.includes('--dev') || !app.isPackaged;
  const url = isDev ? 'http://localhost:5173/#settings' : `file://${path.join(__dirname, '..', 'dist', 'index.html')}#settings`;
  settingsWindow.loadURL(url);

  settingsWindow.on('closed', () => {
    settingsWindow = null;
  });
}

function createWidgetWindow() {
  if (widgetWindow) {
    widgetWindow.show();
    widgetWindow.focus();
    return;
  }

  const pos = safeSecondaryPosition(360, 500, 660, 540);

  widgetWindow = new BrowserWindow({
    width: 360,
    height: 500,
    x: pos.x,
    y: pos.y,
    show: false,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    resizable: false,
    skipTaskbar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  widgetWindow.once('ready-to-show', () => {
    widgetWindow.show();
    widgetWindow.focus();
  });

  const isDev = process.argv.includes('--dev') || !app.isPackaged;
  const url = isDev
    ? 'http://localhost:5173/#widgets'
    : `file://${path.join(__dirname, '..', 'dist', 'index.html')}#widgets`;
  widgetWindow.loadURL(url);

  widgetWindow.on('closed', () => {
    widgetWindow = null;
  });
}

function createAnalyticsWindow() {
  if (analyticsWindow) {
    analyticsWindow.show();
    analyticsWindow.focus();
    return;
  }

  const pos = safeSecondaryPosition(460, 580, 500, 620);

  analyticsWindow = new BrowserWindow({
    width: 460,
    height: 580,
    x: pos.x,
    y: pos.y,
    show: false,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    resizable: false,
    skipTaskbar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  analyticsWindow.once('ready-to-show', () => {
    analyticsWindow.show();
    analyticsWindow.focus();
  });

  const isDev = process.argv.includes('--dev') || !app.isPackaged;
  const url = isDev
    ? 'http://localhost:5173/#analytics'
    : `file://${path.join(__dirname, '..', 'dist', 'index.html')}#analytics`;
  analyticsWindow.loadURL(url);

  analyticsWindow.on('closed', () => {
    analyticsWindow = null;
  });
}

// --- IPC Handlers ---
ipcMain.handle('show-notification', (event, { title, body }) => {
  new Notification({ title, body }).show();
});

ipcMain.handle('open-settings', () => {
  createSettingsWindow();
});

ipcMain.handle('close-settings', () => {
  if (settingsWindow) {
    settingsWindow.close();
  }
});

ipcMain.handle('open-widgets', () => {
  createWidgetWindow();
});

ipcMain.handle('close-widgets', () => {
  if (widgetWindow) {
    widgetWindow.close();
  }
});

ipcMain.handle('open-analytics', () => {
  createAnalyticsWindow();
});

ipcMain.handle('close-analytics', () => {
  if (analyticsWindow) {
    analyticsWindow.close();
  }
});

ipcMain.handle('quit-app', () => {
  app.quit();
});

// --- Drag / Position IPC Handlers ---

/**
 * set-window-position: Move the main window to (x, y) and persist the position.
 * Clamps to screen boundaries to prevent off-screen placement.
 */
ipcMain.handle('set-window-position', (event, { x, y }) => {
  if (mainWindow) {
    const clamped = clampToScreen(x, y, MAIN_WIDTH, MAIN_HEIGHT);
    mainWindow.setPosition(clamped.x, clamped.y, false);
    savePosition(clamped.x, clamped.y);
  }
});

/**
 * get-window-position: Return the current [x, y] of the main window.
 */
ipcMain.handle('get-window-position', () => {
  if (mainWindow) {
    const pos = mainWindow.getPosition();
    return { x: pos[0], y: pos[1] };
  }
  return { x: 0, y: 0 };
});

/**
 * get-screen-size: Return the usable work-area dimensions of the primary display.
 */
ipcMain.handle('get-screen-size', () => {
  const { width, height } = screen.getPrimaryDisplay().workAreaSize;
  return { width, height };
});

/**
 * reset-window-position: Move the window back to its default position
 * (bottom-right corner) and persist it.
 */
ipcMain.handle('reset-window-position', () => {
  const pos = getDefaultPosition();
  if (mainWindow) {
    mainWindow.setPosition(pos.x, pos.y, true); // animate = true
    savePosition(pos.x, pos.y);
  }
  return pos;
});

// --- App Lifecycle ---
app.whenReady().then(() => {
  // Create the main window immediately — the cat must appear as fast as possible.
  // The backend is started in parallel; hooks in the renderer gracefully fall back
  // to defaults when the backend is not yet available.
  createMainWindow();

  // Start Python backend after window is visible
  startPythonBackend();
});

app.on('window-all-closed', () => {
  stopPythonBackend();
  app.quit();
});

app.on('before-quit', () => {
  stopPythonBackend();
});
