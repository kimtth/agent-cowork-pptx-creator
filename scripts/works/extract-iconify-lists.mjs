/**
 * Extract curated business-relevant icon subsets from @iconify/json.
 *
 * Usage:
 *   node scripts/extract-iconify-lists.mjs
 *
 * Output:
 *   skills/iconfy-list/assets/{collection}.md  — one file per collection
 */

import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const OUTPUT_DIR = join(ROOT, 'skills', 'iconfy-list', 'assets');

// Business-relevant keyword patterns for filtering icons
const BUSINESS_KEYWORDS = [
  // General business
  'chart', 'graph', 'analytics', 'dashboard', 'report', 'data',
  'trending', 'trend', 'growth', 'increase', 'decrease', 'arrow',
  // People & organizations
  'people', 'person', 'team', 'group', 'user', 'account', 'organization',
  'meeting', 'presentation', 'handshake', 'collaborate',
  // Buildings & places
  'building', 'office', 'city', 'factory', 'store', 'bank', 'hospital',
  'school', 'university', 'warehouse', 'home', 'house',
  // Finance & money
  'money', 'dollar', 'currency', 'wallet', 'credit', 'cash', 'coin',
  'bank', 'finance', 'investment', 'budget', 'receipt', 'invoice',
  'payment', 'tax',
  // Technology
  'cloud', 'server', 'database', 'network', 'code', 'terminal', 'api',
  'cpu', 'chip', 'device', 'laptop', 'monitor', 'phone', 'tablet',
  'robot', 'brain', 'circuit', 'wifi', 'bluetooth', 'antenna',
  'security', 'shield', 'lock', 'key', 'fingerprint',
  // Communication
  'email', 'mail', 'message', 'chat', 'comment', 'notification', 'bell',
  'phone', 'call', 'video', 'microphone', 'speaker', 'broadcast',
  // Documents & content
  'file', 'document', 'folder', 'clipboard', 'note', 'book', 'page',
  'text', 'list', 'checkbox', 'form', 'table', 'calendar', 'schedule',
  // Actions & states
  'check', 'close', 'add', 'remove', 'edit', 'delete', 'save',
  'download', 'upload', 'share', 'link', 'attach', 'pin', 'bookmark',
  'search', 'filter', 'sort', 'settings', 'configure',
  'play', 'pause', 'stop', 'refresh', 'sync', 'update',
  // Visuals
  'image', 'photo', 'camera', 'eye', 'view', 'visible', 'hidden',
  'color', 'palette', 'paint', 'brush', 'design', 'layout',
  // Strategy & planning
  'target', 'goal', 'flag', 'milestone', 'roadmap', 'map', 'compass',
  'strategy', 'plan', 'puzzle', 'lightbulb', 'bulb', 'idea', 'rocket',
  'launch', 'star', 'award', 'trophy', 'medal', 'certificate',
  // Process & workflow
  'workflow', 'flow', 'process', 'pipeline', 'funnel', 'loop', 'cycle',
  'step', 'stage', 'hierarchy', 'tree', 'git', 'branch', 'merge',
  // Transport & logistics
  'truck', 'ship', 'plane', 'globe', 'world', 'location', 'pin',
  'route', 'direction', 'navigation', 'transfer',
  // Health & environment
  'heart', 'health', 'leaf', 'sun', 'wind', 'energy', 'power',
  'battery', 'recycle', 'eco',
  // Shapes & indicators
  'circle', 'square', 'diamond', 'triangle', 'hexagon',
  'alert', 'warning', 'info', 'help', 'question', 'error',
];

// Words that lead to overly generic or irrelevant icons
const EXCLUDE_PATTERNS = [
  'alpha', 'beta', 'gamma', 'roman-numeral',
  'zodiac', 'hebrew', 'arabic-letter',
  'emoticon', 'emoji',
  'hand-', 'gesture-',
  'food-', 'drink-', 'fruit-', 'vegetable-',
  'sport-', 'basketball', 'football', 'tennis', 'soccer',
  'music-note', 'guitar', 'piano', 'drum',
  'weather-', 'ferris', 'roller-coaster',
  'animal', 'cat', 'dog', 'bird', 'fish',
  'toy', 'game-', 'dice', 'card-',
  'ghost', 'skull', 'sword', 'knife', 'gun', 'bomb', 'fire',
];

const COLLECTIONS = [
  { id: 'mdi', file: 'mdi.json', prefix: 'mdi' },
  { id: 'lucide', file: 'lucide.json', prefix: 'lucide' },
  { id: 'tabler', file: 'tabler.json', prefix: 'tabler' },
  { id: 'ph', file: 'ph.json', prefix: 'ph' },
  { id: 'fa6-solid', file: 'fa6-solid.json', prefix: 'fa6-solid' },
  { id: 'fluent', file: 'fluent.json', prefix: 'fluent' },
];

function loadCollection(file) {
  const jsonPath = join(ROOT, 'node_modules', '@iconify', 'json', 'json', file);
  const raw = readFileSync(jsonPath, 'utf-8');
  return JSON.parse(raw);
}

function matchesKeyword(iconName) {
  const lower = iconName.toLowerCase();
  return BUSINESS_KEYWORDS.some((kw) => lower.includes(kw));
}

function isExcluded(iconName) {
  const lower = iconName.toLowerCase();
  return EXCLUDE_PATTERNS.some((pat) => lower.includes(pat));
}

function extractBusinessIcons(collection, prefix) {
  const allNames = Object.keys(collection.icons);

  // Filter by keywords, exclude noise
  let filtered = allNames
    .filter((name) => matchesKeyword(name) && !isExcluded(name))
    .map((name) => `${prefix}:${name}`);

  // Deduplicate near-identical names (e.g., mdi:chart-line vs mdi:chart-line-variant)
  // Keep both if they exist, but cap at 200 icons per collection
  filtered.sort();

  // Cap at 200 most relevant
  if (filtered.length > 200) {
    filtered = filtered.slice(0, 200);
  }

  return filtered;
}

function generateMarkdown(collectionId, prefix, icons) {
  const lines = [
    `# ${collectionId} — Business Icons`,
    '',
    `Curated subset of **${icons.length}** business-relevant icons from the \`${collectionId}\` Iconify collection.`,
    '',
    `Use these as \`icon\` values in slide definitions. Example: \`${icons[0] || prefix + ':chart-line'}\`.`,
    '',
    '## Icons',
    '',
    ...icons.map((name) => `- ${name}`),
    '',
  ];
  return lines.join('\n');
}

// Main
mkdirSync(OUTPUT_DIR, { recursive: true });

let totalIcons = 0;

for (const { id, file, prefix } of COLLECTIONS) {
  console.log(`Processing ${id}...`);
  const collection = loadCollection(file);
  const allCount = Object.keys(collection.icons).length;
  const icons = extractBusinessIcons(collection, prefix);

  console.log(`  ${allCount} total → ${icons.length} business-relevant icons`);

  const md = generateMarkdown(id, prefix, icons);
  const outputPath = join(OUTPUT_DIR, `${id}.md`);
  writeFileSync(outputPath, md, 'utf-8');
  console.log(`  Written to ${outputPath}`);

  totalIcons += icons.length;
}

console.log(`\nDone! Extracted ${totalIcons} business icons across ${COLLECTIONS.length} collections.`);
