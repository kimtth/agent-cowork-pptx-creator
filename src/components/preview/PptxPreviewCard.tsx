import { toLocalImageUrl } from '../../application/local-image-url.ts'

interface Props {
  title: string
  imagePath: string
  scale?: number
  onClick?: () => void
  selected?: boolean
  cacheKey?: string | number
}

const SLIDE_W = 13.33 * 96
const SLIDE_H = 7.5 * 96

export function PptxPreviewCard({ title, imagePath, scale = 1, onClick, selected, cacheKey }: Props) {
  const src = toLocalImageUrl(imagePath, cacheKey)

  return (
    <div
      onClick={onClick}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (event) => event.key === 'Enter' && onClick() : undefined}
      style={{
        width: SLIDE_W * scale,
        height: SLIDE_H * scale,
        background: '#FFFFFF',
        borderRadius: 4 * scale,
        overflow: 'hidden',
        position: 'relative',
        cursor: onClick ? 'pointer' : 'default',
        boxShadow: selected ? `0 0 0 ${2 * scale}px var(--accent)` : `0 ${2 * scale}px ${8 * scale}px rgba(0,0,0,0.25)`,
        flexShrink: 0,
        userSelect: 'none',
      }}
    >
      <img
        src={src}
        alt={title}
        draggable={false}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          display: 'block',
        }}
      />
    </div>
  )
}
