const { app, BrowserWindow, Tray, Menu, screen, ipcMain, Notification } = require('electron');
const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');

let mainWindow;
let settingsWindow = null;
let tray;
let pythonProcess;

// --- Position Persistence ---
// Save/load the cat's window position to a local JSON file so it
// survives app restarts. The file is stored in the user-data directory
// managed by Electron (e.g., %APPDATA%/cat-desktop-assistant).
const POSITION_FILE = path.join(app.getPath('userData'), 'window-position.json');

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
  return { x: width - 300, y: height - 370 };
}

// --- Python Backend Management ---
function startPythonBackend() {
  const backendPath = path.join(__dirname, '..', 'backend');
  // Try 'python' first, fall back to 'python3'
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
  // Determine initial position: use saved position if available, else default
  const saved = loadSavedPosition();
  const defaultPos = getDefaultPosition();
  const initialX = saved ? saved.x : defaultPos.x;
  const initialY = saved ? saved.y : defaultPos.y;

  mainWindow = new BrowserWindow({
    width: 280,
    height: 350,
    x: initialX,
    y: initialY,
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

  // In development, load from Vite dev server; in production, load built files
  const isDev = process.argv.includes('--dev') || !app.isPackaged;

  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
  } else {
    mainWindow.loadFile(path.join(__dirname, '..', 'dist', 'index.html'));
  }

  // Make transparent areas click-through
  mainWindow.setIgnoreMouseEvents(false);

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

function createSettingsWindow() {
  if (settingsWindow) {
    settingsWindow.focus();
    return;
  }

  const { width, height } = screen.getPrimaryDisplay().workAreaSize;

  settingsWindow = new BrowserWindow({
    width: 400,
    height: 520,
    x: width - 420,
    y: height - 560,
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

  const isDev = process.argv.includes('--dev') || !app.isPackaged;
  const url = isDev ? 'http://localhost:5173/#settings' : `file://${path.join(__dirname, '..', 'dist', 'index.html')}#settings`;
  settingsWindow.loadURL(url);

  settingsWindow.on('closed', () => {
    settingsWindow = null;
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

ipcMain.handle('quit-app', () => {
  app.quit();
});

// --- Drag / Position IPC Handlers ---

/**
 * set-window-position: Move the main window to (x, y) and persist the position.
 * Called by the renderer process during drag operations.
 */
ipcMain.handle('set-window-position', (event, { x, y }) => {
  if (mainWindow) {
    mainWindow.setPosition(Math.round(x), Math.round(y), false);
    savePosition(Math.round(x), Math.round(y));
  }
});

/**
 * get-window-position: Return the current [x, y] of the main window.
 * Used by the renderer to initialise drag offset calculations.
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
 * Used by the renderer to clamp the window inside screen boundaries.
 */
ipcMain.handle('get-screen-size', () => {
  const { width, height } = screen.getPrimaryDisplay().workAreaSize;
  return { width, height };
});

/**
 * reset-window-position: Move the window back to its default position
 * (bottom-right corner) and persist it. Triggered by double-clicking the cat.
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
  startPythonBackend();

  // Wait a bit for the backend to start
  setTimeout(() => {
    createMainWindow();
  }, 2000);
});

app.on('window-all-closed', () => {
  stopPythonBackend();
  app.quit();
});

app.on('before-quit', () => {
  stopPythonBackend();
});
