import { ipcMain } from 'electron'
import fs from 'fs/promises'
import path from 'path'
import { createHash } from 'crypto'
import { load } from 'cheerio'
import { readWorkspaceDir } from './workspace-utils.ts'

interface SlideImageRequest {
  number: number
  title: string
  keyMessage: string
  bullets: string[]
  imageQuery?: string | null
}

interface SlideImageResult {
  number: number
  imageQuery: string | null
  imageUrl: string | null
  imagePath: string | null
  imageAttribution: string | null
}

interface GoogleImageMatch {
  imageUrl?: string | null
  sourcePageUrl?: string | null
  inlineImageDataUrl?: string | null
}

interface OpenverseImage {
  url?: string
  thumbnail?: string
  title?: string
  attribution?: string
  foreign_landing_url?: string
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60) || 'image'
}

function hashValue(value: string): string {
  return createHash('sha1').update(value).digest('hex').slice(0, 10)
}

function deriveQuery(slide: SlideImageRequest): string {
  const explicit = slide.imageQuery?.trim()
  if (explicit) return explicit
  return [slide.title, slide.keyMessage, ...slide.bullets.slice(0, 2)]
    .filter(Boolean)
    .join(' ')
    .trim()
}

function isHttpUrl(value: string): boolean {
  try {
    const parsed = new URL(value)
    return parsed.protocol === 'http:' || parsed.protocol === 'https:'
  } catch {
    return false
  }
}

function extensionFromUrl(url: string, contentType: string | null): string {
  if (contentType) {
    if (contentType.includes('png')) return '.png'
    if (contentType.includes('webp')) return '.webp'
    if (contentType.includes('svg')) return '.svg'
    if (contentType.includes('jpeg') || contentType.includes('jpg')) return '.jpg'
  }
  const pathname = new URL(url).pathname.toLowerCase()
  if (pathname.endsWith('.png')) return '.png'
  if (pathname.endsWith('.webp')) return '.webp'
  if (pathname.endsWith('.svg')) return '.svg'
  return '.jpg'
}

function extensionFromDataUrl(value: string): string {
  const match = /^data:image\/([a-zA-Z0-9.+-]+);base64,/.exec(value)
  const type = match?.[1]?.toLowerCase() ?? 'jpeg'
  if (type === 'png') return '.png'
  if (type === 'webp') return '.webp'
  if (type === 'svg+xml') return '.svg'
  return '.jpg'
}

function normalizeAbsoluteUrl(candidate: string | undefined | null, baseUrl: string): string | null {
  if (!candidate) return null
  try {
    return new URL(candidate, baseUrl).toString()
  } catch {
    return null
  }
}

function decodeGoogleHref(href: string): { imageUrl?: string | null; pageUrl?: string | null } {
  try {
    if (href.startsWith('/imgres?')) {
      const url = new URL(`https://www.google.com${href}`)
      return {
        imageUrl: url.searchParams.get('imgurl'),
        pageUrl: url.searchParams.get('imgrefurl'),
      }
    }
    if (href.startsWith('/url?')) {
      const url = new URL(`https://www.google.com${href}`)
      return { pageUrl: url.searchParams.get('q') }
    }
    if (isHttpUrl(href) && !/https?:\/\/(www\.)?google\./i.test(href)) {
      return { pageUrl: href }
    }
  } catch {
    return {}
  }
  return {}
}

async function ensureImagesDir(): Promise<string> {
  const workspaceDir = await readWorkspaceDir()
  const imagesDir = path.join(workspaceDir, 'images')
  await fs.mkdir(imagesDir, { recursive: true })
  return imagesDir
}

async function searchGoogleImages(query: string): Promise<GoogleImageMatch | null> {
  const { fetch } = await import('undici')
  const url = new URL('https://www.google.com/search')
  url.searchParams.set('q', query)
  url.searchParams.set('tbm', 'isch')
  url.searchParams.set('hl', 'en')
  url.searchParams.set('safe', 'active')

  const res = await fetch(url, {
    signal: AbortSignal.timeout(15000),
    headers: {
      'User-Agent': 'PPTX Slide Agent/1.0 (image lookup)',
      'Accept-Language': 'en-US,en;q=0.9',
    },
  })
  if (!res.ok) return null
  const html = await res.text()
  const $ = load(html)

  let inlineImageDataUrl: string | null = null
  $('img').each((_, el) => {
    const src = $(el).attr('src')
    if (!inlineImageDataUrl && src?.startsWith('data:image/')) {
      inlineImageDataUrl = src
    }
  })

  for (const anchor of $('a[href]').toArray()) {
    const href = $(anchor).attr('href')
    if (!href) continue
    const decoded = decodeGoogleHref(href)
    if (decoded.imageUrl || decoded.pageUrl) {
      return {
        imageUrl: decoded.imageUrl ?? null,
        sourcePageUrl: decoded.pageUrl ?? null,
        inlineImageDataUrl,
      }
    }
  }

  return inlineImageDataUrl ? { inlineImageDataUrl } : null
}

async function searchOpenverseImages(query: string): Promise<OpenverseImage | null> {
  const { fetch } = await import('undici')
  const endpoint = `https://api.openverse.org/v1/images/?q=${encodeURIComponent(query)}&page_size=1&mature=false`
  const res = await fetch(endpoint, {
    signal: AbortSignal.timeout(15000),
    headers: { 'User-Agent': 'PPTX Slide Agent/1.0 (image lookup)' },
  })
  if (!res.ok) return null
  const data = await res.json() as { results?: OpenverseImage[] }
  return data.results?.[0] ?? null
}

async function resolveImageFromSourcePage(pageUrl: string): Promise<string | null> {
  const { fetch } = await import('undici')
  const res = await fetch(pageUrl, {
    signal: AbortSignal.timeout(15000),
    headers: {
      'User-Agent': 'PPTX Slide Agent/1.0 (image lookup)',
      'Accept-Language': 'en-US,en;q=0.9',
    },
  })
  if (!res.ok) return null
  const html = await res.text()
  const $ = load(html)

  const candidates = [
    $('meta[property="og:image"]').attr('content'),
    $('meta[name="twitter:image"]').attr('content'),
    $('meta[property="og:image:url"]').attr('content'),
    $('link[rel="image_src"]').attr('href'),
    $('img').first().attr('src'),
  ]

  for (const candidate of candidates) {
    const absolute = normalizeAbsoluteUrl(candidate, pageUrl)
    if (absolute && isHttpUrl(absolute)) return absolute
  }
  return null
}

async function downloadImage(url: string, destination: string): Promise<void> {
  const { fetch } = await import('undici')
  const res = await fetch(url, {
    signal: AbortSignal.timeout(20000),
    headers: { 'User-Agent': 'PPTX Slide Agent/1.0 (image download)' },
  })
  if (!res.ok) throw new Error(`Image download failed: HTTP ${res.status}`)
  const buf = Buffer.from(await res.arrayBuffer())
  await fs.writeFile(destination, buf)
}

async function writeDataUrlImage(dataUrl: string, destination: string): Promise<void> {
  const base64 = dataUrl.split(',', 2)[1]
  if (!base64) throw new Error('Invalid data URL image')
  await fs.writeFile(destination, Buffer.from(base64, 'base64'))
}

async function resolveImageForSlide(slide: SlideImageRequest): Promise<SlideImageResult> {
  const query = deriveQuery(slide)
  if (!query) {
    return { number: slide.number, imageQuery: null, imageUrl: null, imagePath: null, imageAttribution: null }
  }

  try {
    const directUrl = isHttpUrl(query) ? query : null
    const googleMatch = directUrl ? null : await searchGoogleImages(query)
    const sourcePageImage = googleMatch?.sourcePageUrl ? await resolveImageFromSourcePage(googleMatch.sourcePageUrl) : null
    const openverseMatch = directUrl || googleMatch?.imageUrl || sourcePageImage || googleMatch?.inlineImageDataUrl ? null : await searchOpenverseImages(query)

    const sourceUrl = directUrl
      ?? googleMatch?.imageUrl
      ?? sourcePageImage
      ?? openverseMatch?.url
      ?? openverseMatch?.thumbnail
      ?? null
    const inlineDataUrl = directUrl || sourceUrl ? null : googleMatch?.inlineImageDataUrl ?? null

    if (!sourceUrl && !inlineDataUrl) {
      return { number: slide.number, imageQuery: query, imageUrl: null, imagePath: null, imageAttribution: null }
    }

    const imagesDir = await ensureImagesDir()
    const { fetch } = await import('undici')
    const head = sourceUrl ? await fetch(sourceUrl, { method: 'HEAD', signal: AbortSignal.timeout(10000) }).catch(() => null) : null
    const ext = sourceUrl
      ? extensionFromUrl(sourceUrl, head?.headers.get('content-type') ?? null)
      : extensionFromDataUrl(inlineDataUrl!)
    const filePath = path.join(imagesDir, `${String(slide.number).padStart(2, '0')}-${slugify(slide.title)}-${hashValue(sourceUrl ?? inlineDataUrl ?? query)}${ext}`)

    if (sourceUrl) {
      await downloadImage(sourceUrl, filePath)
    } else {
      await writeDataUrlImage(inlineDataUrl!, filePath)
    }

    return {
      number: slide.number,
      imageQuery: query,
      imageUrl: sourceUrl,
      imagePath: filePath,
      imageAttribution: directUrl
        ? sourceUrl
        : googleMatch?.sourcePageUrl
          ?? openverseMatch?.foreign_landing_url
          ?? openverseMatch?.attribution
          ?? openverseMatch?.title
          ?? null,
    }
  } catch {
    return { number: slide.number, imageQuery: query, imageUrl: null, imagePath: null, imageAttribution: null }
  }
}

export function registerImageHandlers(): void {
  ipcMain.handle('images:resolveForSlides', async (_event, slides: SlideImageRequest[]): Promise<SlideImageResult[]> => {
    if (!Array.isArray(slides) || slides.length === 0) return []
    const results: SlideImageResult[] = []
    for (const slide of slides) {
      results.push(await resolveImageForSlide(slide))
    }
    return results
  })
}