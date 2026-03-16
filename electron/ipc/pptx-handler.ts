import { ipcMain, dialog, app, BrowserWindow } from 'electron'
import fs from 'fs/promises'
import { existsSync, readdirSync } from 'fs'
import path from 'path'
import { execFile } from 'child_process'
import { promisify } from 'util'
import type { ThemeTokens } from '../../src/domain/entities/palette'
import { DEFAULT_THEME_C } from '../../src/domain/theme/default-theme'
import { ensurePythonModule, pythonSetupHint, resolvePythonExecutable } from './python-runtime.ts'
import { readWorkspaceDir } from './workspace-utils.ts'

const execFileAsync = promisify(execFile)
const GENERATED_CODE_EXECUTION_ATTEMPTS = 2

type LayoutInputSourceSlide = {
  layout: string
  title: string
  keyMessage: string
  bullets: string[]
  notes: string
  icon?: string | null
}

export interface LayoutInputSlide {
  layout_type: string
  title_text: string
  key_message_text: string
  bullets: string[]
  notes: string
  item_count: number
  has_icon: boolean
  font_family: string
}

type SlideAssetSourceSlide = {
  number: number
  title: string
  layout: string
  icon?: string | null
  imageQuery?: string | null
  imageQueries?: string[]
  imagePath?: string | null
  selectedImages?: Array<{
    id: string
    imageQuery?: string | null
    imageUrl?: string | null
    imagePath?: string | null
    thumbnailUrl?: string | null
  }>
}

export interface SlideAssetMetadata {
  number: number
  title: string
  layout: string
  icon: string | null
  iconName: string | null
  iconCollection: string
  iconProvider: 'iconify'
  imageQuery: string | null
  imageQueries: string[]
  primaryImagePath: string | null
  selectedImages: Array<{
    id: string
    imageQuery: string | null
    imageUrl: string | null
    imagePath: string | null
    thumbnailUrl: string | null
  }>
}

function truncateProcessOutput(value: string, maxLen = 12000): string {
  const trimmed = value.trim()
  if (trimmed.length <= maxLen) return trimmed
  return `${trimmed.slice(0, maxLen)}\n\n[Truncated]`
}

export function formatExecutionFailure(error: unknown): string {
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

async function removePreviewImages(dirPath: string): Promise<void> {
  try {
    const entries = await fs.readdir(dirPath, { withFileTypes: true })
    for (const entry of entries) {
      if (entry.isFile() && /\.(png|jpg|jpeg)$/i.test(entry.name)) {
        await fs.unlink(path.join(dirPath, entry.name)).catch(() => {})
      }
    }
  } catch { /* ignore */ }
}

/** Remove old timestamped PPTX copies so only the canonical file exists. */
async function removeStaleTimestampedPptx(dirPath: string, canonicalName: string): Promise<void> {
  try {
    const entries = await fs.readdir(dirPath, { withFileTypes: true })
    const stem = canonicalName.replace(/\.pptx$/i, '')
    for (const entry of entries) {
      if (
        entry.isFile() &&
        /\.pptx$/i.test(entry.name) &&
        entry.name !== canonicalName &&
        entry.name.startsWith(stem)
      ) {
        await fs.unlink(path.join(dirPath, entry.name)).catch(() => {})
      }
    }
  } catch { /* ignore */ }
}

async function ensureCleanDirectory(dirPath: string): Promise<void> {
  await fs.rm(dirPath, { recursive: true, force: true }).catch(() => {})
  await fs.mkdir(dirPath, { recursive: true })
}

/** Resolve the icon PNG cache directory inside the app bundle (single source of truth). */
function getAppIconCacheDir(): string {
  const appPathCandidate = path.join(app.getAppPath(), 'skills', 'iconfy-list', 'cache')
  if (existsSync(appPathCandidate)) return appPathCandidate
  // In dev mode app.getAppPath() resolves to out/main; fall back to project root
  return path.join(process.cwd(), 'skills', 'iconfy-list', 'cache')
}

function buildLayoutArtifactPaths(workspaceDir: string) {
  const layoutDir = path.join(workspaceDir, 'previews')
  return {
    layoutDir,
    inputPath: path.join(layoutDir, 'layout-input.json'),
    outputPath: path.join(layoutDir, 'layout-specs.json'),
    slideAssetsPath: path.join(layoutDir, 'slide-assets.json'),
  }
}

async function assertValidLayoutInputArtifact(workspaceDir: string): Promise<void> {
  const { inputPath } = buildLayoutArtifactPaths(workspaceDir)

  let raw: string
  try {
    raw = await fs.readFile(inputPath, 'utf-8')
  } catch {
    throw new Error(
      `Required layout input file not found: ${inputPath}. Regenerate the storyboard before PPTX generation.`,
    )
  }

  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown JSON parse error'
    throw new Error(`Invalid layout input JSON at ${inputPath}: ${message}`)
  }

  if (!Array.isArray(parsed)) {
    throw new Error(`Invalid layout input JSON at ${inputPath}: expected a top-level array of slide layout entries.`)
  }
}

export function buildLayoutInputSlides(slides: LayoutInputSourceSlide[]): LayoutInputSlide[] {
  return slides.map((slide) => ({
    layout_type: slide.layout,
    title_text: slide.title,
    key_message_text: slide.keyMessage,
    bullets: slide.bullets,
    notes: slide.notes || '',
    item_count: slide.bullets.length,
    has_icon: !!slide.icon,
    font_family: 'Calibri',
  }))
}

export async function persistLayoutInputToWorkspace(
  slides: LayoutInputSourceSlide[] | string,
): Promise<{ success: boolean; slidesJson?: string; inputPath?: string; outputPath?: string; error?: string }> {
  try {
    const workspaceDir = await readWorkspaceDir()
    const { layoutDir, inputPath, outputPath } = buildLayoutArtifactPaths(workspaceDir)
    await fs.mkdir(layoutDir, { recursive: true })

    const slidesJson = typeof slides === 'string'
      ? slides
      : JSON.stringify(buildLayoutInputSlides(slides), null, 2)

    await fs.writeFile(inputPath, slidesJson, 'utf-8')
    return { success: true, slidesJson, inputPath, outputPath }
  } catch (err) {
    return { success: false, error: formatExecutionFailure(err) }
  }
}

export function buildSlideAssetMetadata(slides: SlideAssetSourceSlide[], iconCollection: string): SlideAssetMetadata[] {
  return slides.map((slide) => {
    const selectedImages = (slide.selectedImages ?? []).map((image) => ({
      id: image.id,
      imageQuery: image.imageQuery ?? null,
      imageUrl: image.imageUrl ?? null,
      imagePath: image.imagePath ?? null,
      thumbnailUrl: image.thumbnailUrl ?? null,
    }))

    return {
      number: slide.number,
      title: slide.title,
      layout: slide.layout,
      icon: slide.icon ?? null,
      iconName: slide.icon ?? null,
      iconCollection,
      iconProvider: 'iconify',
      imageQuery: slide.imageQuery ?? null,
      imageQueries: (slide.imageQueries ?? []).map((query) => query.trim()).filter(Boolean),
      primaryImagePath: selectedImages[0]?.imagePath ?? slide.imagePath ?? null,
      selectedImages,
    }
  })
}

export async function persistSlideAssetsToWorkspace(
  slides: SlideAssetSourceSlide[],
  iconCollection: string,
): Promise<{ success: boolean; slideAssetsJson?: string; assetPath?: string; error?: string }> {
  try {
    const workspaceDir = await readWorkspaceDir()
    const { layoutDir, slideAssetsPath } = buildLayoutArtifactPaths(workspaceDir)
    await fs.mkdir(layoutDir, { recursive: true })

    const slideAssetsJson = JSON.stringify(buildSlideAssetMetadata(slides, iconCollection), null, 2)
    await fs.writeFile(slideAssetsPath, slideAssetsJson, 'utf-8')
    return { success: true, slideAssetsJson, assetPath: slideAssetsPath }
  } catch (err) {
    return { success: false, error: formatExecutionFailure(err) }
  }
}

/**
 * Compute content-adaptive layout specs via the hybrid layout engine
 * (PowerPoint COM AutoFit + kiwisolver constraint solver).
 * Can be called from any IPC handler — does not depend on ipcMain.handle.
 */
export async function computeLayoutSpecs(
  slides: LayoutInputSourceSlide[] | string,
): Promise<{ success: boolean; specs?: string; error?: string }> {
  try {
    const persisted = await persistLayoutInputToWorkspace(slides)
    if (!persisted.success || !persisted.inputPath || !persisted.outputPath) {
      return { success: false, error: persisted.error ?? 'Failed to persist layout input.' }
    }
    const { inputPath, outputPath } = persisted

    let hybridScript = path.join(app.getAppPath(), 'scripts', 'layout', 'hybrid_layout.py')
    if (!existsSync(hybridScript)) {
      hybridScript = path.join(process.cwd(), 'scripts', 'layout', 'hybrid_layout.py')
    }

    const python = await resolvePythonExecutable()
    const { stdout, stderr } = await execFileAsync(
      python,
      [hybridScript, '--input', inputPath, '--output', outputPath],
      {
        windowsHide: true,
        timeout: 60_000,
        maxBuffer: 4 * 1024 * 1024,
        env: { ...process.env, PYTHONIOENCODING: 'utf-8' },
        cwd: path.dirname(hybridScript),
      },
    )

    if (stderr?.trim()) {
      console.log('[computeLayoutSpecs]', stderr.trim())
    }

    const specsJson = stdout?.trim() || await fs.readFile(outputPath, 'utf-8')
    return { success: true, specs: specsJson }
  } catch (err) {
    return { success: false, error: formatExecutionFailure(err) }
  }
}

export async function executeGeneratedPythonCodeToFile(
  code: string,
  theme: ThemeTokens | null,
  title: string,
  outputPath: string,
  opts?: { renderDir?: string; iconCollection?: string; layoutSpecsJson?: string },
): Promise<void> {
  const workDir = path.dirname(outputPath)
  const sourcePath = path.join(workDir, 'generated-source.py')
  let runnerScriptPath = path.join(app.getAppPath(), 'scripts', 'pptx-python-runner.py')
  if (!existsSync(runnerScriptPath)) {
    runnerScriptPath = path.join(process.cwd(), 'scripts', 'pptx-python-runner.py')
  }

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
  const workspaceDir = await readWorkspaceDir()
  await assertValidLayoutInputArtifact(workspaceDir)
  const iconCacheDir = getAppIconCacheDir()
  const { slideAssetsPath } = buildLayoutArtifactPaths(workspaceDir)
  const slideAssetsJson = existsSync(slideAssetsPath)
    ? await fs.readFile(slideAssetsPath, 'utf-8').catch(() => '')
    : ''

  const args = [runnerScriptPath, sourcePath, outputPath]
  if (opts?.renderDir) {
    args.push('--render-dir', opts.renderDir)
  }
  args.push('--workspace-dir', workspaceDir)

  let lastError: unknown
  for (let attempt = 1; attempt <= GENERATED_CODE_EXECUTION_ATTEMPTS; attempt++) {
    try {
      await execFileAsync(
        python,
        args,
        {
          windowsHide: true,
          timeout: 180_000,
          maxBuffer: 8 * 1024 * 1024,
          env: {
            ...process.env,
            PYTHONIOENCODING: 'utf-8',
            PPTX_THEME_JSON: themePayload,
            PPTX_TITLE: title || 'Presentation',
            ICON_CACHE_DIR: iconCacheDir,
            PPTX_ICON_COLLECTION: opts?.iconCollection ?? 'all',
            ...(opts?.renderDir ? { PPTX_SKIP_COM_LAYOUT_FIX: '1' } : {}),
            ...(slideAssetsJson.trim() ? { PPTX_SLIDE_ASSETS_JSON: slideAssetsJson } : {}),
            WORKSPACE_DIR: workspaceDir,
            ...(opts?.layoutSpecsJson ? { PPTX_LAYOUT_SPECS_JSON: opts.layoutSpecsJson } : {}),
          },
        },
      )
      return
    } catch (error) {
      lastError = error
      if (attempt < GENERATED_CODE_EXECUTION_ATTEMPTS) continue
    }
  }

  throw lastError
}

function naturalSortPaths(paths: string[]): string[] {
  return [...paths].sort((left, right) => left.localeCompare(right, undefined, { numeric: true, sensitivity: 'base' }))
}

async function readPreviewImagePaths(renderDir: string): Promise<string[]> {
  try {
    const imageEntries = await fs.readdir(renderDir, { withFileTypes: true })
    return naturalSortPaths(
      imageEntries
        .filter((entry) => entry.isFile() && /\.(png|jpg|jpeg)$/i.test(entry.name))
        .map((entry) => path.join(renderDir, entry.name)),
    )
  } catch {
    return []
  }
}

/** Find the most recently modified PPTX in a directory, or null if none. */
async function findMostRecentPptx(dirPath: string): Promise<string | null> {
  try {
    const entries = await fs.readdir(dirPath, { withFileTypes: true })
    let best: { path: string; mtime: number } | null = null
    for (const entry of entries) {
      if (!entry.isFile() || !/\.pptx$/i.test(entry.name)) continue
      const fullPath = path.join(dirPath, entry.name)
      const stat = await fs.stat(fullPath)
      if (!best || stat.mtimeMs > best.mtime) {
        best = { path: fullPath, mtime: stat.mtimeMs }
      }
    }
    return best?.path ?? null
  } catch {
    return null
  }
}

/** Render PNG preview images from an existing PPTX via PowerPoint COM (Windows). */
async function renderPngFromPptx(pptxPath: string, renderDir: string): Promise<void> {
  const python = await resolvePythonExecutable()
  const script = [
    'import sys, pathlib',
    'pptx_path = sys.argv[1]',
    'render_dir = sys.argv[2]',
    'import pythoncom, win32com.client',
    'pythoncom.CoInitialize()',
    'pp = None; prs = None',
    'try:',
    '    pp = win32com.client.DispatchEx("PowerPoint.Application")',
    '    pp.Visible = 1',
    '    prs = pp.Presentations.Open(pptx_path, WithWindow=False, ReadOnly=True)',
    '    prs.Export(render_dir, "PNG", 1280, 720)',
    'finally:',
    '    if prs: prs.Close()',
    '    if pp: pp.Quit()',
    '    pythoncom.CoUninitialize()',
  ].join('\n')
  await execFileAsync(python, ['-c', script, pptxPath, renderDir], {
    windowsHide: true,
    timeout: 60_000,
    env: { ...process.env, PYTHONIOENCODING: 'utf-8' },
  })
}

export function registerPptxHandlers(): void {
  ipcMain.handle('pptx:generate', async (_event, code: string, themeTokens: ThemeTokens | null, title: string, iconCollection?: string) => {
    try {
      const win = BrowserWindow.fromWebContents(_event.sender)
      if (!code || typeof code !== 'string' || code.trim().length === 0) {
        return { success: false, error: 'code must not be empty' }
      }
      if (!isLikelyPythonPptxCode(code)) {
        return { success: false, error: 'Only agent-generated python-pptx code is supported' }
      }

      const workspaceDir = await readWorkspaceDir()
      const previewRoot = path.join(workspaceDir, 'previews')
      await fs.mkdir(previewRoot, { recursive: true })
      const outputPath = path.join(previewRoot, 'presentation-preview.pptx')

      try {
        await executeGeneratedPythonCodeToFile(code, themeTokens, title, outputPath, { iconCollection })
        return await savePresentationFile(outputPath, title, win)
      } catch (err) {
        // Keep workDir for debugging — generated-source.py + error context
        throw err
      }
    } catch (err) {
      return { success: false, error: formatExecutionFailure(err) }
    }
  })

  ipcMain.handle('pptx:readExistingPreviews', async () => {
    try {
      const workspaceDir = await readWorkspaceDir()
      const renderDir = path.join(workspaceDir, 'previews')
      const imagePaths = await readPreviewImagePaths(renderDir)

      // Fast path: images already exist
      if (imagePaths.length > 0) {
        return { success: true, imagePaths }
      }

      // No images — try to render from an existing PPTX
      const pptxPath = await findMostRecentPptx(renderDir)
      if (!pptxPath) {
        return { success: false, imagePaths: [] }
      }

      try {
        await renderPngFromPptx(pptxPath, renderDir)
      } catch (err) {
        console.log('[readExistingPreviews] COM render failed:', err)
        return { success: false, imagePaths: [], warning: 'PPTX exists but preview rendering failed. PowerPoint desktop may be required.' }
      }

      const rendered = await readPreviewImagePaths(renderDir)
      return { success: rendered.length > 0, imagePaths: rendered }
    } catch {
      return { success: false, imagePaths: [] }
    }
  })

  ipcMain.handle('pptx:renderPreview', async (_event, code: string, themeTokens: ThemeTokens | null, title: string, iconCollection?: string) => {
    try {
      if (!code || typeof code !== 'string' || code.trim().length === 0) {
        return { success: false, error: 'code must not be empty' }
      }
      if (!isLikelyPythonPptxCode(code)) {
        return { success: false, error: 'Only agent-generated python-pptx code is supported' }
      }

      const workspaceDir = await readWorkspaceDir()
      const previewRoot = path.join(workspaceDir, 'previews')
      const renderDir = previewRoot
      const outputPath = path.join(previewRoot, 'presentation-preview.pptx')

      try {
        // Try to remove the old PPTX before regenerating; ignore if locked
        await fs.unlink(outputPath).catch(() => {})
        await removeStaleTimestampedPptx(previewRoot, 'presentation-preview.pptx')
        await removePreviewImages(renderDir)
        await fs.mkdir(previewRoot, { recursive: true })
        await executeGeneratedPythonCodeToFile(code, themeTokens, title, outputPath, { renderDir, iconCollection })

        // Find actual PPTX (may have a timestamped name if the original was locked)
        let actualPptx: string | null = null
        try {
          const previewEntries = await fs.readdir(previewRoot, { withFileTypes: true })
          const pptxFile = previewEntries.find((e) => e.isFile() && /\.pptx$/i.test(e.name))
          if (pptxFile) actualPptx = path.join(previewRoot, pptxFile.name)
        } catch { /* ignore */ }

        const imagePaths = await readPreviewImagePaths(renderDir)

        if (imagePaths.length === 0) {
          return {
            success: !!actualPptx,
            imagePaths: [],
            warning: actualPptx
              ? 'PPTX generated successfully but slide preview images could not be rendered. PowerPoint desktop may be required.'
              : 'Preview rendering completed but no output was generated.',
          }
        }

        // Warn if file was renamed due to lock
        const wasRenamed = actualPptx && path.basename(actualPptx) !== 'presentation-preview.pptx'
        return {
          success: true,
          imagePaths,
          ...(wasRenamed ? { warning: `The previous PPTX was locked. New file saved as ${path.basename(actualPptx!)}.  Close the old file in PowerPoint to avoid mismatches.` } : {}),
        }
      } catch (error) {
        // Do NOT delete previewRoot — keep generated-source.py + PPTX for debugging
        throw error
      }
    } catch (err) {
      return { success: false, error: formatExecutionFailure(err) }
    }
  })

  ipcMain.handle('pptx:computeLayout', async (_event, slidesJson: string) => {
    return computeLayoutSpecs(slidesJson)
  })

}
