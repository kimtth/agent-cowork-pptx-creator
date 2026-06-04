/**
 * IPC Handler: Settings — persist env vars to userData/settings.json
 * Applied to process.env on startup and after save.
 */

import { ipcMain, app, BrowserWindow } from 'electron';
import fs from 'fs/promises';
import path from 'path';

const CONFIG_FILE = path.join(app.getPath('userData'), 'settings.json');

export const SETTINGS_KEYS = [
  'GITHUB_TOKEN',
  'MODEL_NAME',
  'REASONING_EFFORT',
  'SHOW_TOOL_CALLING_MESSAGES',
] as const;

export type SettingsKey = (typeof SETTINGS_KEYS)[number];
export type Settings = Partial<Record<SettingsKey, string>>;

async function readSettings(): Promise<Settings> {
  try {
    const raw = await fs.readFile(CONFIG_FILE, 'utf-8');
    return JSON.parse(raw) as Settings;
  } catch {
    return {};
  }
}

async function writeSettings(settings: Settings): Promise<void> {
  await fs.mkdir(path.dirname(CONFIG_FILE), { recursive: true });
  await fs.writeFile(CONFIG_FILE, JSON.stringify(settings, null, 2), 'utf-8');
}

/** Apply persisted settings to process.env — call at app startup. */
export async function applySettingsToEnv(): Promise<void> {
  const settings = await readSettings();
  for (const key of SETTINGS_KEYS) {
    const value = settings[key];
    if (value && value.trim()) {
      process.env[key] = value;
    }
  }
}

const onSaveCallbacks = new Set<() => void>();

/** Register a callback to be called when settings are saved. */
export function onSettingsSaved(cb: () => void): void {
  onSaveCallbacks.add(cb);
}

export function registerSettingsHandlers(): void {
  ipcMain.removeHandler('settings:get');
  ipcMain.removeHandler('settings:save');

  ipcMain.handle('settings:get', async () => {
    const saved = await readSettings();
    const result: Settings = {};
    for (const key of SETTINGS_KEYS) {
      // Return saved file value; fall back to current process.env (e.g. set via .env file)
      result[key] = saved[key] ?? process.env[key] ?? '';
    }
    return result;
  });

  ipcMain.handle('settings:save', async (_, settings: Settings) => {
    // Sanitize: only accept known keys
    const clean: Settings = {};
    for (const key of SETTINGS_KEYS) {
      clean[key] = (settings[key] ?? '').trim();
    }

    // Apply to process.env immediately so the running process uses them
    for (const key of SETTINGS_KEYS) {
      const val = clean[key];
      if (val) {
        process.env[key] = val;
      } else {
        delete process.env[key];
      }
    }

    await writeSettings(clean);
    for (const callback of onSaveCallbacks) callback();

    for (const win of BrowserWindow.getAllWindows()) {
      if (!win.isDestroyed() && !win.webContents.isDestroyed()) {
        win.webContents.send('settings:changed', clean);
      }
    }
  });
}
