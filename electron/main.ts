/**
 * Electron Main Process
 */

// Suppress Node.js experimental warnings (e.g. SQLite) in CLI subprocesses
process.env.NODE_NO_WARNINGS = '1';

import { app, BrowserWindow, shell } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';
import { registerChatHandlers } from './ipc/chat-handler.ts';
import { registerPptxHandlers } from './ipc/pptx-handler.ts';
import { registerThemeHandlers } from './ipc/theme-handler.ts';
import { registerFsHandlers } from './ipc/fs-handler.ts';
import { registerScrapeHandlers } from './ipc/scrape-handler.ts';
import { registerImageHandlers } from './ipc/image-handler.ts';
import { registerSettingsHandlers, applySettingsToEnv } from './ipc/settings-handler.ts';
import { registerProjectHandlers } from './ipc/project-handler.ts';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

let mainWindow: BrowserWindow | null = null;

process.on('unhandledRejection', (reason) => {
  console.error('[main] Unhandled promise rejection', reason);
});

process.on('uncaughtException', (error) => {
  console.error('[main] Uncaught exception', error);
});

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 1024,
    minHeight: 640,
    show: false,
    backgroundColor: '#f4f5f7',
    titleBarStyle: 'hiddenInset',
    frame: process.platform !== 'darwin',
    webPreferences: {
      preload: path.join(__dirname, '../preload/preload.mjs'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
  });

  // Load app
  if (process.env.ELECTRON_RENDERER_URL) {
    mainWindow.loadURL(process.env.ELECTRON_RENDERER_URL);
  } else {
    mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
  }

  mainWindow.once('ready-to-show', () => {
    mainWindow?.show();
  });

  // Open external links in default browser
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('https:') || url.startsWith('http:')) {
      shell.openExternal(url);
    }
    return { action: 'deny' };
  });
}

app.whenReady()
  .then(async () => {
    // Apply persisted settings to process.env before creating handlers
    await applySettingsToEnv();

    // Register all IPC handlers (pass mainWindow getter for streaming)
    const getWindow = () => mainWindow;
    registerSettingsHandlers();
    registerProjectHandlers();
    registerChatHandlers(getWindow);
    registerPptxHandlers();
    registerThemeHandlers();
    registerFsHandlers();
    registerScrapeHandlers();
    registerImageHandlers();

    createWindow();

    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
  })
  .catch((error) => {
    console.error('[main] Failed during app bootstrap', error);
    app.quit();
  });

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
