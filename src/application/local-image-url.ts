export function toLocalImageUrl(imagePath: string): string {
  return `pptx-local://local?path=${encodeURIComponent(imagePath)}`
}