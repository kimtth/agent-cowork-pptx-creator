export const LEGACY_ICON_ALIASES: Record<string, string> = {
  'arrow-trending-up': 'mdi:trending-up',
  brain: 'mdi:brain',
  building: 'mdi:domain',
  calendar: 'mdi:calendar',
  chart: 'mdi:chart-box',
  'checkmark-circle': 'mdi:check-circle-outline',
  cloud: 'mdi:cloud-outline',
  code: 'mdi:code-tags',
  'data-trending': 'mdi:chart-line',
  document: 'mdi:file-document-outline',
  globe: 'mdi:earth',
  lightbulb: 'mdi:lightbulb-on-outline',
  link: 'mdi:link-variant',
  'lock-closed': 'mdi:lock-outline',
  money: 'mdi:cash',
  'people-team': 'mdi:account-group-outline',
  rocket: 'mdi:rocket-outline',
  search: 'mdi:magnify',
  settings: 'mdi:cog-outline',
  shield: 'mdi:shield-check-outline',
  sparkle: 'mdi:star-four-points-outline',
  star: 'mdi:star-outline',
  target: 'mdi:target',
  warning: 'mdi:alert-outline',
}

export const ICONIFY_COLLECTIONS = [
  {
    id: 'all',
    label: 'All supported sets',
    description: 'Mix examples from every supported Iconify collection.',
    examples: [
      'mdi:trending-up',
      'lucide:brain',
      'tabler:building-skyscraper',
      'fa6-solid:rocket',
      'ph:chart-line-up-bold',
      'fluent:people-team-24-regular',
    ],
  },
  {
    id: 'mdi',
    label: 'Material Design Icons',
    description: 'Broad general-purpose icons with consistent coverage.',
    examples: ['mdi:trending-up', 'mdi:brain', 'mdi:domain', 'mdi:rocket-outline'],
  },
  {
    id: 'lucide',
    label: 'Lucide',
    description: 'Clean stroke icons suited to modern product slides.',
    examples: ['lucide:brain', 'lucide:line-chart', 'lucide:building-2', 'lucide:rocket'],
  },
  {
    id: 'tabler',
    label: 'Tabler',
    description: 'Detailed outline icons with strong business and UI coverage.',
    examples: ['tabler:building-skyscraper', 'tabler:chart-line', 'tabler:bulb', 'tabler:target-arrow'],
  },
  {
    id: 'ph',
    label: 'Phosphor',
    description: 'Expressive icons available in multiple weights.',
    examples: ['ph:chart-line-up-bold', 'ph:brain-bold', 'ph:buildings-bold', 'ph:rocket-launch-bold'],
  },
  {
    id: 'fa6-solid',
    label: 'Font Awesome 6 Solid',
    description: 'Dense filled icons that read well at small sizes.',
    examples: ['fa6-solid:rocket', 'fa6-solid:chart-line', 'fa6-solid:building', 'fa6-solid:lightbulb'],
  },
  {
    id: 'fluent',
    label: 'Fluent UI System',
    description: 'Microsoft-style icons that fit Office-adjacent presentations.',
    examples: ['fluent:people-team-24-regular', 'fluent:brain-circuit-24-regular', 'fluent:building-24-regular', 'fluent:arrow-trending-24-regular'],
  },
] as const

export type IconifyCollectionId = (typeof ICONIFY_COLLECTIONS)[number]['id']

export const DEFAULT_ICONIFY_COLLECTION: IconifyCollectionId = 'all'

export const ICONIFY_EXAMPLES = ICONIFY_COLLECTIONS[0].examples

export const ICONIFY_PROMPT_HINTS = [
  ...Object.keys(LEGACY_ICON_ALIASES),
  ...ICONIFY_EXAMPLES,
] as const

export function getIconifyCollectionOptions() {
  return ICONIFY_COLLECTIONS
}

export function getIconifyCollectionById(collectionId: IconifyCollectionId = DEFAULT_ICONIFY_COLLECTION) {
  return ICONIFY_COLLECTIONS.find((collection) => collection.id === collectionId) ?? ICONIFY_COLLECTIONS[0]
}

export function getIconifyExamples(collectionId: IconifyCollectionId = DEFAULT_ICONIFY_COLLECTION): string[] {
  return [...getIconifyCollectionById(collectionId).examples]
}

export function normalizeIconName(value: string | null | undefined): string | null {
  const raw = value?.trim()
  if (!raw) return null
  const lowered = raw.toLowerCase()
  if (lowered.includes(':')) return lowered
  if (LEGACY_ICON_ALIASES[lowered]) return LEGACY_ICON_ALIASES[lowered]
  return `mdi:${lowered}`
}

export function getAvailableIconChoices(collectionId: IconifyCollectionId = DEFAULT_ICONIFY_COLLECTION): string[] {
  return [...new Set([...Object.keys(LEGACY_ICON_ALIASES), ...getIconifyExamples(collectionId)])]
}

export function buildIconifySvgUrl(iconName: string, colorHex?: string): string {
  const normalized = normalizeIconName(iconName)
  if (!normalized) throw new Error('Icon name is required')
  const [prefix, ...nameParts] = normalized.split(':')
  if (!prefix || nameParts.length === 0) throw new Error(`Invalid Iconify icon name: ${iconName}`)

  const name = nameParts.join(':')
  const query = new URLSearchParams()
  query.set('box', '1')
  if (colorHex) {
    query.set('color', colorHex.startsWith('#') ? colorHex : `#${colorHex}`)
  }

  return `https://api.iconify.design/${encodeURIComponent(prefix)}/${encodeURIComponent(name)}.svg?${query.toString()}`
}