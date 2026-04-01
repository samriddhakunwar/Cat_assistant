const { contextBridge, ipcRenderer } = require('electron');

// Expose a safe API to the renderer process.
// Each method maps to an ipcMain.handle() in main.js.
contextBridge.exposeInMainWorld('electronAPI', {
  // --- Existing APIs ---
  showNotification: (title, body) =>
    ipcRenderer.invoke('show-notification', { title, body }),
  openSettings: () => ipcRenderer.invoke('open-settings'),
  closeSettings: () => ipcRenderer.invoke('close-settings'),
  openWidgets: () => ipcRenderer.invoke('open-widgets'),
  closeWidgets: () => ipcRenderer.invoke('close-widgets'),
  openAnalytics: () => ipcRenderer.invoke('open-analytics'),
  closeAnalytics: () => ipcRenderer.invoke('close-analytics'),
  quitApp: () => ipcRenderer.invoke('quit-app'),

  // --- Drag / Position APIs ---
  // Move the Electron window to an absolute screen position
  setWindowPosition: (x, y) =>
    ipcRenderer.invoke('set-window-position', { x, y }),
  // Get the current window position { x, y }
  getWindowPosition: () => ipcRenderer.invoke('get-window-position'),
  // Get the primary screen work-area size { width, height }
  getScreenSize: () => ipcRenderer.invoke('get-screen-size'),
  // Reset the window to its default position (bottom-right corner)
  resetWindowPosition: () => ipcRenderer.invoke('reset-window-position'),
});
