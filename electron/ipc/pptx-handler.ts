import { ipcMain, dialog, app, BrowserWindow } from 'electron'
import fs from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'
import { execFile } from 'child_process'
import { promisify } from 'util'
import type { ThemeTokens } from '../../src/domain/entities/palette'
import { DEFAULT_THEME_C } from '../../src/domain/theme/default-theme'
import { ensurePythonModule, pythonSetupHint, resolvePythonExecutable } from './python-runtime.ts'
import { readWorkspaceDir } from './workspace-utils.ts'

const execFileAsync = promisify(execFile)

function truncateProcessOutput(value: string, maxLen = 12000): string {
  const trimmed = value.trim()
  if (trimmed.length <= maxLen) return trimmed
  return `${trimmed.slice(0, maxLen)}\n\n[Truncated]`
}

function formatExecutionFailure(error: unknown): string {
  if (!(error instanceof Error)) return 'PPTX code execution failed'

  const processError = error as Error & { stdout?: string; stderr?: string }
  const details = [processError.message]
  if (processError.stdout?.trim()) details.push(`Build output:\n${truncateProcessOutput(processError.stdout)}`)
  if (processError.stderr?.trim()) details.push(`Error output:\n${truncateProcessOutput(processError.stderr)}`)
  return details.join('\n\n')
}

function isLikelyPythonPptxCode(code: string): boolean {
  return /from\s+pptx\s+import|import\s+pptx|Presentation\(|python-pptx|def\s+build_presentation\s*\(/i.test(code)
}

async function savePresentationFile(filePath: string, title: string, win: BrowserWindow | null) {
  const safeTitle = (title || 'presentation').replace(/[^\w\s\-]/g, '_')
  const dialogOptions = {
    title: 'Save Presentation',
    defaultPath: `${safeTitle}.pptx`,
    filters: [{ name: 'PowerPoint', extensions: ['pptx'] }],
  }

  const { filePath: outputPath, canceled } = win
    ? await dialog.showSaveDialog(win, dialogOptions)
    : await dialog.showSaveDialog(dialogOptions)

  if (canceled || !outputPath) {
    return { success: false, error: 'Cancelled' }
  }

  await fs.copyFile(filePath, outputPath)
  return { success: true, path: outputPath }
}

async function removeDirectoryQuietly(dirPath: string | null): Promise<void> {
  if (!dirPath) return
  await fs.rm(dirPath, { recursive: true, force: true }).catch(() => {})
}

async function ensureCleanDirectory(dirPath: string): Promise<void> {
  await fs.rm(dirPath, { recursive: true, force: true }).catch(() => {})
  await fs.mkdir(dirPath, { recursive: true })
}

async function executeGeneratedPythonCodeToFile(
  code: string,
  theme: ThemeTokens | null,
  title: string,
  outputPath: string,
  opts?: { renderDir?: string },
): Promise<void> {
  const workDir = path.dirname(outputPath)
  const sourcePath = path.join(workDir, 'generated-source.py')
  const runnerScriptPath = path.join(app.getAppPath(), 'scripts', 'pptx-python-runner.py')

  if (!existsSync(runnerScriptPath)) {
    throw new Error(`Python PPTX runner not found at ${runnerScriptPath}`)
  }

  await fs.mkdir(workDir, { recursive: true })
  await fs.writeFile(sourcePath, code, 'utf-8')

  const python = await resolvePythonExecutable()
  await ensurePythonModule(
    python,
    'pptx',
    `Install python-pptx in the managed environment. ${pythonSetupHint()}`,
  )

  const themePayload = JSON.stringify(theme?.C ?? DEFAULT_THEME_C)
  const args = [runnerScriptPath, sourcePath, outputPath]
  if (opts?.renderDir) {
    args.push('--render-dir', opts.renderDir)
  }
  await execFileAsync(
    python,
    args,
    {
      windowsHide: true,
      timeout: 180_000,
      maxBuffer: 8 * 1024 * 1024,
      env: {
        ...process.env,
        PPTX_THEME_JSON: themePayload,
        PPTX_TITLE: title || 'Presentation',
      },
    },
  )
}

function naturalSortPaths(paths: string[]): string[] {
  return [...paths].sort((left, right) => left.localeCompare(right, undefined, { numeric: true, sensitivity: 'base' }))
}

export function registerPptxHandlers(): void {
  ipcMain.handle('pptx:generate', async (_event, code: string, themeTokens: ThemeTokens | null, title: string) => {
    try {
      const win = BrowserWindow.fromWebContents(_event.sender)
      if (!code || typeof code !== 'string' || code.trim().length === 0) {
        return { success: false, error: 'code must not be empty' }
      }
      if (!isLikelyPythonPptxCode(code)) {
        return { success: false, error: 'Only agent-generated python-pptx code is supported' }
      }

      const tempRoot = path.join(app.getPath('temp'), 'pptx-slide-agent-generated-save')
      await fs.mkdir(tempRoot, { recursive: true })
      const stamp = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
      const workDir = path.join(tempRoot, stamp)
      const outputPath = path.join(workDir, 'presentation.pptx')

      try {
        await executeGeneratedPythonCodeToFile(code, themeTokens, title, outputPath)
        return await savePresentationFile(outputPath, title, win)
      } finally {
        await fs.rm(workDir, { recursive: true, force: true }).catch(() => {})
      }
    } catch (err) {
      return { success: false, error: formatExecutionFailure(err) }
    }
  })

  ipcMain.handle('pptx:renderPreview', async (_event, code: string, themeTokens: ThemeTokens | null, title: string) => {
    try {
      if (!code || typeof code !== 'string' || code.trim().length === 0) {
        return { success: false, error: 'code must not be empty' }
      }
      if (!isLikelyPythonPptxCode(code)) {
        return { success: false, error: 'Only agent-generated python-pptx code is supported' }
      }

      const workspaceDir = await readWorkspaceDir()
      const previewRoot = path.join(workspaceDir, 'previews')
      const renderDir = path.join(previewRoot, 'slides')
      const outputPath = path.join(previewRoot, 'presentation-preview.pptx')

      try {
        // Try to remove the old PPTX before regenerating; ignore if locked
        await fs.unlink(outputPath).catch(() => {})
        await ensureCleanDirectory(renderDir)
        await fs.mkdir(previewRoot, { recursive: true })
        await executeGeneratedPythonCodeToFile(code, themeTokens, title, outputPath, { renderDir })

        // Find actual PPTX (may have a timestamped name if the original was locked)
        let actualPptx: string | null = null
        try {
          const previewEntries = await fs.readdir(previewRoot, { withFileTypes: true })
          const pptxFile = previewEntries.find((e) => e.isFile() && /\.pptx$/i.test(e.name))
          if (pptxFile) actualPptx = path.join(previewRoot, pptxFile.name)
        } catch { /* ignore */ }

        let imagePaths: string[] = []
        try {
          const imageEntries = await fs.readdir(renderDir, { withFileTypes: true })
          imagePaths = naturalSortPaths(
            imageEntries
              .filter((entry) => entry.isFile() && /\.(png|jpg|jpeg)$/i.test(entry.name))
              .map((entry) => path.join(renderDir, entry.name)),
          )
        } catch {
          // renderDir may not exist if preview rendering was skipped
        }

        if (imagePaths.length === 0) {
          return {
            success: !!actualPptx,
            imagePaths: [],
            warning: actualPptx
              ? 'PPTX generated successfully but slide preview images could not be rendered. PowerPoint desktop may be required.'
              : 'Preview rendering completed but no output was generated.',
          }
        }

        return { success: true, imagePaths }
      } catch (error) {
        // Do NOT delete previewRoot — keep generated-source.py + PPTX for debugging
        throw error
      }
    } catch (err) {
      return { success: false, error: formatExecutionFailure(err) }
    }
  })

}
