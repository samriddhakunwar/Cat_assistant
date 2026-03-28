const { app, BrowserWindow, Tray, Menu, screen, ipcMain, Notification } = require('electron');
const path = require('path');
const { spawn } = require('child_process');

let mainWindow;
let settingsWindow = null;
let tray;
let pythonProcess;

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
  const { width, height } = screen.getPrimaryDisplay().workAreaSize;

  mainWindow = new BrowserWindow({
    width: 280,
    height: 350,
    x: width - 300,
    y: height - 370,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    resizable: false,
    skipTaskbar: true,
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
