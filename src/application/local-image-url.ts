export function toLocalImageUrl(imagePath: string, cacheKey?: string | number): string {
  const suffix = cacheKey === undefined ? '' : `&v=${encodeURIComponent(String(cacheKey))}`
  return `pptx-local://local?path=${encodeURIComponent(imagePath)}${suffix}`
}