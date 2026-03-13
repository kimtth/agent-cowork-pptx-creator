/**
 * Download all curated Iconify icons as SVGs and classify them into categories.
 *
 * Usage:
 *   node scripts/download-iconify-cache.mjs
 *
 * Output:
 *   skills/iconfy-list/cache/{collection}/{icon-name}.svg
 *   skills/iconfy-list/assets/{collection}.md  — updated with category grouping
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const SKILL_DIR = join(ROOT, 'skills', 'iconfy-list');
const ASSETS_DIR = join(SKILL_DIR, 'assets');
const CACHE_DIR = join(SKILL_DIR, 'cache');

// ── Category classification rules ──────────────────────────────────────────

const CATEGORIES = [
  {
    name: 'Charts & Analytics',
    keywords: ['chart', 'graph', 'analytics', 'dashboard', 'report', 'data', 'trending', 'trend', 'growth', 'bar-chart', 'pie-chart', 'line-chart', 'histogram', 'gauge', 'metrics', 'statistics', 'poll'],
  },
  {
    name: 'People & Organizations',
    keywords: ['people', 'person', 'team', 'group', 'user', 'account', 'organization', 'meeting', 'presentation', 'handshake', 'collaborate', 'community', 'crowd', 'audience', 'contacts', 'member'],
  },
  {
    name: 'Buildings & Places',
    keywords: ['building', 'office', 'city', 'factory', 'store', 'bank', 'hospital', 'school', 'university', 'warehouse', 'home', 'house', 'campus', 'skyscraper', 'apartment'],
  },
  {
    name: 'Finance & Money',
    keywords: ['money', 'dollar', 'currency', 'wallet', 'credit', 'cash', 'coin', 'finance', 'investment', 'budget', 'receipt', 'invoice', 'payment', 'tax', 'profit', 'revenue', 'billing', 'price'],
  },
  {
    name: 'Technology & Devices',
    keywords: ['cloud', 'server', 'database', 'network', 'code', 'terminal', 'api', 'cpu', 'chip', 'device', 'laptop', 'monitor', 'phone', 'tablet', 'robot', 'brain', 'circuit', 'wifi', 'bluetooth', 'antenna', 'computer', 'desktop'],
  },
  {
    name: 'Security & Access',
    keywords: ['security', 'shield', 'lock', 'key', 'fingerprint', 'password', 'auth', 'access', 'protect', 'encrypt', 'firewall', 'guard', 'verify'],
  },
  {
    name: 'Communication',
    keywords: ['email', 'mail', 'message', 'chat', 'comment', 'notification', 'bell', 'call', 'video', 'microphone', 'speaker', 'broadcast', 'inbox', 'send', 'reply'],
  },
  {
    name: 'Documents & Files',
    keywords: ['file', 'document', 'folder', 'clipboard', 'note', 'book', 'page', 'text', 'list', 'checkbox', 'form', 'table', 'calendar', 'schedule', 'spreadsheet', 'attachment', 'archive'],
  },
  {
    name: 'Navigation & Arrows',
    keywords: ['arrow', 'chevron', 'direction', 'navigate', 'compass', 'route', 'location', 'pin', 'map', 'globe', 'world', 'transfer', 'move', 'sort', 'align'],
  },
  {
    name: 'Actions & Controls',
    keywords: ['check', 'close', 'add', 'remove', 'edit', 'delete', 'save', 'download', 'upload', 'share', 'link', 'attach', 'bookmark', 'search', 'filter', 'settings', 'configure', 'play', 'pause', 'stop', 'refresh', 'sync', 'update', 'toggle', 'switch'],
  },
  {
    name: 'Strategy & Goals',
    keywords: ['target', 'goal', 'flag', 'milestone', 'roadmap', 'strategy', 'plan', 'puzzle', 'lightbulb', 'bulb', 'idea', 'rocket', 'launch', 'star', 'award', 'trophy', 'medal', 'certificate', 'badge'],
  },
  {
    name: 'Process & Workflow',
    keywords: ['workflow', 'flow', 'process', 'pipeline', 'funnel', 'loop', 'cycle', 'step', 'stage', 'hierarchy', 'tree', 'git', 'branch', 'merge', 'kanban', 'board'],
  },
  {
    name: 'Transport & Logistics',
    keywords: ['truck', 'ship', 'plane', 'flight', 'train', 'car', 'vehicle', 'delivery', 'package', 'box', 'container', 'warehouse', 'shipping', 'logistics'],
  },
  {
    name: 'Visuals & Media',
    keywords: ['image', 'photo', 'camera', 'eye', 'view', 'visible', 'hidden', 'color', 'palette', 'paint', 'brush', 'design', 'layout', 'scan', 'qr', 'print'],
  },
  {
    name: 'Health & Environment',
    keywords: ['heart', 'health', 'leaf', 'sun', 'wind', 'energy', 'power', 'battery', 'recycle', 'eco', 'green', 'nature', 'water', 'plant'],
  },
];

function classifyIcon(iconName) {
  const lower = iconName.toLowerCase();
  for (const cat of CATEGORIES) {
    if (cat.keywords.some((kw) => lower.includes(kw))) {
      return cat.name;
    }
  }
  return 'Other';
}

// ── Parse icon names from MD files ─────────────────────────────────────────

const COLLECTIONS = ['mdi', 'lucide', 'tabler', 'ph', 'fa6-solid', 'fluent'];

function parseIconsFromMd(collection) {
  const mdPath = join(ASSETS_DIR, `${collection}.md`);
  const content = readFileSync(mdPath, 'utf-8');
  const icons = [];
  for (const line of content.split('\n')) {
    const m = line.match(/^- (.+)$/);
    if (m) icons.push(m[1].trim());
  }
  return icons;
}

// ── Download SVGs ──────────────────────────────────────────────────────────

async function downloadCollectionIcons(collection, icons) {
  const collectionCacheDir = join(CACHE_DIR, collection);
  mkdirSync(collectionCacheDir, { recursive: true });

  // Extract just the icon names (without prefix)
  const names = icons.map((id) => {
    const parts = id.split(':');
    return parts.length > 1 ? parts.slice(1).join(':') : parts[0];
  });

  // Use batch API — fetch in chunks of 50
  const chunkSize = 50;
  let downloaded = 0;
  let skipped = 0;

  for (let i = 0; i < names.length; i += chunkSize) {
    const chunk = names.slice(i, i + chunkSize);

    // Check which icons are already cached
    const toFetch = [];
    for (const name of chunk) {
      const svgPath = join(collectionCacheDir, `${name}.svg`);
      if (existsSync(svgPath)) {
        skipped++;
      } else {
        toFetch.push(name);
      }
    }

    if (toFetch.length === 0) continue;

    const url = `https://api.iconify.design/${collection}.json?icons=${toFetch.join(',')}`;
    try {
      const res = await fetch(url, {
        signal: AbortSignal.timeout(30_000),
        headers: { 'User-Agent': 'PPTX-Slide-Agent/1.0 (icon-cache-builder)' },
      });
      if (!res.ok) {
        console.warn(`  [WARN] HTTP ${res.status} for batch ${i / chunkSize + 1} of ${collection}`);
        continue;
      }
      const data = await res.json();

      // data.icons contains { [name]: { body: string, width?, height? } }
      const prefix = data.prefix || collection;
      const defaultWidth = data.width || 24;
      const defaultHeight = data.height || 24;

      for (const name of toFetch) {
        const iconData = data.icons?.[name];
        if (!iconData) {
          console.warn(`  [MISS] ${collection}:${name} not found in API response`);
          continue;
        }

        const width = iconData.width || defaultWidth;
        const height = iconData.height || defaultHeight;
        const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">${iconData.body}</svg>`;

        const svgPath = join(collectionCacheDir, `${name}.svg`);
        writeFileSync(svgPath, svg, 'utf-8');
        downloaded++;
      }
    } catch (err) {
      console.warn(`  [ERR] Failed batch ${i / chunkSize + 1} of ${collection}: ${err.message}`);
    }
  }

  return { downloaded, skipped, total: names.length };
}

// ── Generate classified MD ─────────────────────────────────────────────────

function generateClassifiedMarkdown(collection, icons) {
  // Group by category
  const groups = {};
  for (const icon of icons) {
    const name = icon.split(':').slice(1).join(':') || icon;
    const category = classifyIcon(name);
    if (!groups[category]) groups[category] = [];
    groups[category].push(icon);
  }

  // Sort categories (put "Other" last)
  const sortedCategories = Object.keys(groups).sort((a, b) => {
    if (a === 'Other') return 1;
    if (b === 'Other') return -1;
    return a.localeCompare(b);
  });

  const lines = [
    `# ${collection} — Business Icons`,
    '',
    `Curated subset of **${icons.length}** business-relevant icons from the \`${collection}\` Iconify collection.`,
    '',
    `Use these as \`icon\` values in slide definitions. Example: \`${icons[0] || collection + ':chart-line'}\`.`,
    '',
    `Cached SVGs are stored in \`cache/${collection}/\` for offline PPTX generation.`,
    '',
  ];

  for (const category of sortedCategories) {
    const catIcons = groups[category];
    lines.push(`## ${category} (${catIcons.length})`);
    lines.push('');
    for (const icon of catIcons) {
      lines.push(`- ${icon}`);
    }
    lines.push('');
  }

  return lines.join('\n');
}

// ── Summary for SKILL.md ──────────────────────────────────────────────────

function buildCategorySummary(allIcons) {
  const counts = {};
  for (const icon of allIcons) {
    const name = icon.split(':').slice(1).join(':') || icon;
    const category = classifyIcon(name);
    counts[category] = (counts[category] || 0) + 1;
  }
  return counts;
}

// ── Main ───────────────────────────────────────────────────────────────────

async function main() {
  console.log('📦 Iconify Icon Cache Builder\n');

  const allIcons = [];

  for (const collection of COLLECTIONS) {
    const icons = parseIconsFromMd(collection);
    allIcons.push(...icons);
    console.log(`[${collection}] Parsed ${icons.length} icons from MD`);

    // Download SVGs
    console.log(`[${collection}] Downloading SVGs...`);
    const { downloaded, skipped, total } = await downloadCollectionIcons(collection, icons);
    console.log(`[${collection}] Done: ${downloaded} downloaded, ${skipped} cached, ${total} total\n`);

    // Write classified MD
    const md = generateClassifiedMarkdown(collection, icons);
    const mdPath = join(ASSETS_DIR, `${collection}.md`);
    writeFileSync(mdPath, md, 'utf-8');
    console.log(`[${collection}] Updated ${collection}.md with categories\n`);
  }

  // Build and display category summary
  const summary = buildCategorySummary(allIcons);
  console.log('\n📊 Category Distribution:');
  const sorted = Object.entries(summary).sort((a, b) => b[1] - a[1]);
  for (const [cat, count] of sorted) {
    console.log(`  ${cat}: ${count}`);
  }
  console.log(`\n  Total: ${allIcons.length} icons across ${COLLECTIONS.length} collections`);
  console.log(`  Cache: ${CACHE_DIR}`);
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
