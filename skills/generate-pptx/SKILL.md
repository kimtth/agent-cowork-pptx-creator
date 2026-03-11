---
name: generate-pptx
description: Generates a PowerPoint (PPTX) file by outputting PptxGenJS JavaScript code based on the approved slide story. The app executes the code server-side. Supports free-form layouts including cards, icons, charts, and diagram-style slides.
---

# PPTX Generation Skill

A skill that outputs PptxGenJS code to be executed by the app to generate a PPTX file.
By outputting JavaScript code instead of JSON, it supports card layouts, multi-column, statistical highlights, and free-form designs.

## Output Format

Wrap the code in a ` ```javascript ` code block.
The code runs with the following variables pre-scoped:

- `pres` — PptxGenJS instance (layout: 'LAYOUT_WIDE' already set)
- `C` — Color constants object (from current theme palette)
- `F` — Font constants (`F.JA`, `F.EN`)
- `SW`, `SH` — Slide width (13.33) and height (7.5) in inches
- `ML`, `MR` — Left/right margin (0.5)
- `CW` — Content width (12.33)
- `HEADER_H` — Header band height (0.45)
- `ICON_DIR` — Directory containing cached icon assets available to the code execution environment
- `iconPath(name)` — Helper that resolves an icon name or Iconify-style alias to a cached local asset path

**Important**: Only add slides to `pres`. Never write `import`, `writeFile`, or `new PptxGenJS()`.

## Scoped Constants

### Color Constants `C`

The `C` object comes from the active theme palette. Keys available:

```javascript
// Semantic theme colors
C.DARK        // Darkest color (text on light backgrounds)
C.DARK2       // Second darkest (secondary text)
C.LIGHT       // Lightest color (main background)
C.LIGHT2      // Second lightest (subtle background)
C.ACCENT1     // Primary accent
C.ACCENT2     // Second accent
C.ACCENT3     // Third accent
C.ACCENT4     // Fourth accent
C.ACCENT5     // Fifth accent
C.ACCENT6     // Sixth accent
C.LINK        // Hyperlink color
C.USED_LINK   // Followed hyperlink color

// Convenience aliases
C.PRIMARY     // Same as ACCENT1
C.SECONDARY   // Same as ACCENT2
C.BG          // Same as LIGHT (background)
C.TEXT        // Same as DARK (main text)
C.WHITE       // Same as LIGHT
C.BORDER      // Subtle border color (derived from LIGHT2)
```

**Critical**: Never use hardcoded hex strings. Always use `C.PRIMARY`, `C.ACCENT1`, `C.TEXT`, etc.
All values are 6-digit hex WITHOUT the `#` prefix (e.g., `'0078D4'` not `'#0078D4'`).

### Font Constants `F`

```javascript
F.JA  // 'Noto Sans JP' — Japanese text / body text
F.EN  // 'Segoe UI'     — Latin / numbers / headers
```

## Code Writing Rules

1. **Always** wrap in ` ```javascript ` (app detects code blocks to show download button)
2. Use `pres.addSlide()` to add slides; use `addText`, `addShape`, `addImage` etc. to place elements
3. Do NOT write `import` statements (only use scope-provided variables)
4. Do NOT write `new PptxGenJS()` (pres is already provided)
5. Do NOT write `pres.writeFile()` (app handles output)
6. PptxGenJS color values use 6-digit HEX **without** `#`

## Design Guidelines

- Treat the `set_scenario`-approved **story and designBrief as the primary input**
- Each slide's `layout` / `icon` is a **creative hint, not a fixed command**
- Actively reinterpret layouts to improve rhythm, whitespace, visual hierarchy, and information flow
- Add deliberate variety when 3+ consecutive slides would have identical compositions
- Maintain the user-approved story assertions while being bold with visual design
- If `designBrief.layoutApproach` is `design-led`: choose the most expressive composition that preserves story
- If `designBrief.layoutApproach` is `structured`: respect scenario layout more closely
- Distribute color usage across the full theme whenever possible. Do not let the entire deck collapse to only `C.ACCENT1` and `C.ACCENT2` if `C.ACCENT3`-`C.ACCENT6` are available.
- Reuse one or two anchor accents for coherence, but actively bring in the remaining accent colors across cards, stats, dividers, timelines, comparison bands, callouts, and icon frames.

### Icon Usage (Important)

Icon assets are resolved through `iconPath(...)` and may come from Iconify-backed cached assets. **Use them actively.**

```javascript
// How to use an icon
slide.addImage({
  path: iconPath('brain'),
  x: 9.8, y: 1.2, w: 1.6, h: 1.6,
});
```

Available icons: `arrow-trending-up`, `brain`, `building`, `calendar`, `chart`, `checkmark-circle`, `cloud`, `code`, `data-trending`, `document`, `globe`, `lightbulb`, `link`, `lock-closed`, `money`, `people-team`, `rocket`, `search`, `settings`, `shield`, `sparkle`, `star`, `target`, `warning`

**Icon placement rules:**
- Top-left of cards for visual accent
- Larger on title slides and section dividers
- As bullet-prefix replacements for rich impression
- Prefer icon-card layouts over plain bullet lists
- When a slide has an icon hint, prefer integrating it into a panel, card, sidebar, or hero visual block instead of dropping it as a tiny corner badge
- Add shape backgrounds or framing around icons so they feel intentional rather than floating
- Always prefer `iconPath('name')` over hardcoded relative paths so the cached asset resolver is respected

### McKinsey Layout Principles

1. **Slide title = assertion**: Use the scenario `keyMessage` as the slide title text
2. **Layout variety**: Never use the same layout 3 slides in a row
3. **Data-first**: When numbers exist, use `stats` layout (drawStat) to make them prominent
4. **Parallel comparison**: For Before/After or options, use `cards` layout side by side
5. **One message per slide**: Do not over-pack
6. **Palette breadth**: Across the deck, try to surface at least 4 accent slots when the theme provides them

### Layout Correction Rules

- If a slide would require body text below 14pt, the composition is wrong. Reduce copy, convert bullets into cards/stats, or split the content.
- Do not shrink the whole slide to fit more text. Recompose the layout instead.
- Avoid repeating the same tiny icon placement at the top edge of slides. Repeated `x < 1.2`, `y < 1.2`, `w <= 0.6`, `h <= 0.6` icon placement is usually a poor layout.
- On `title`, `section`, `diagram`, and `comparison` slides, reserve a meaningful visual area instead of making the slide text-only.
- Prefer 3-5 bullets per slide. If content is denser than that, convert it into two-column cards, stats, or a comparison structure.

### Visual Sizing Rules

- `title` slides: use a hero title block plus a dominant icon/visual zone that occupies roughly 20-35% of the slide.
- `section` slides: use large section typography and a bold icon/shape treatment; section icons should usually be around `1.2-1.8in`, not `0.5in`.
- `cards` slides: card icons should usually be around `0.45-0.75in` and integrated inside the card body, not detached above the slide.
- `diagram` and `comparison` slides: visuals should occupy roughly 25-40% of the slide width when an icon or diagram motif is used.
- Do not place images/icons in a tiny strip at the very top unless the design specifically calls for a header badge.
- A slide with fewer elements and larger type is better than a cramped slide with tiny text.

### Font Sizes

| Usage              | Size    | Weight  |
| ------------------ | ------- | ------- |
| Slide title        | 28–32pt | Bold    |
| Section title      | 36–44pt | Bold    |
| Body text          | 16–20pt | Regular |
| Bullet points      | 16–18pt | Regular |
| Card body text     | 14–16pt | Regular |
| Card title         | 15–17pt | Bold    |
| Stats number       | 32–48pt | Bold    |
| Caption            | 11–12pt | Regular |
| Header band text   | 9–10pt  | Regular |
| Footer             | 8pt     | Regular |

## Slide Master Patterns

### CONTENT (content slides)

```javascript
pres.defineSlideMaster({
  title: 'CONTENT',
  background: { color: C.LIGHT },
  objects: [
    { rect: { x: 0, y: 0, w: '100%', h: HEADER_H, fill: { color: C.ACCENT1 } } },
    { rect: { x: 0, y: 0, w: 0.06, h: HEADER_H, fill: { color: C.ACCENT2 } } },
    { text: {
        text: 'Presentation Title',
        options: { x: 0.3, y: 0.08, w: 11, h: 0.3, fontSize: 9, fontFace: F.EN, color: C.LIGHT }
    }},
    { rect: { x: ML, y: SH - 0.35, w: CW, h: 0.005, fill: { color: C.BORDER } } },
  ],
  slideNumber: { x: SW - 1.2, y: SH - 0.33, w: 0.8, h: 0.28, fontSize: 7.5, fontFace: F.EN, color: C.DARK2, align: 'right' },
});
```

### TITLE (title slide)

```javascript
pres.defineSlideMaster({
  title: 'TITLE',
  background: { color: C.ACCENT1 },
  objects: [],
});
```

### SECTION (section divider)

```javascript
pres.defineSlideMaster({
  title: 'SECTION',
  background: { color: C.DARK },
  objects: [
    { rect: { x: 0, y: 0, w: 0.1, h: '100%', fill: { color: C.ACCENT1 } } },
    { rect: { x: 1.0, y: SH - 0.7, w: 5, h: 0.04, fill: { color: C.ACCENT1 } } },
  ],
});
```

## Layout Patterns (Helper Functions)

### Slide Title + Underbar

```javascript
function addSlideTitle(slide, title, opts = {}) {
  const { y = 0.6, fontSize = 26, color = C.TEXT } = opts;
  slide.addText(title, {
    x: ML, y, w: CW, h: 0.6,
    fontSize, fontFace: F.JA, color, bold: true, valign: 'bottom',
  });
  slide.addShape(pres.ShapeType.rect, {
    x: ML, y: y + 0.62, w: 1.4, h: 0.04, fill: { color: C.ACCENT1 },
  });
}
```

### Card Drawing

```javascript
function drawCard(slide, x, y, w, h, opts = {}) {
  const { bg = C.LIGHT2, accentTop = null, title, body, bodyBullet = false } = opts;
  slide.addShape(pres.ShapeType.roundRect, {
    x, y, w, h, fill: { color: bg }, rectRadius: 0.08,
    shadow: { type: 'outer', blur: 4, offset: 2, color: '000000', opacity: 0.1 },
  });
  if (accentTop) {
    slide.addShape(pres.ShapeType.rect, {
      x: x + 0.12, y: y + 0.1, w: w - 0.24, h: 0.045, fill: { color: accentTop },
    });
  }
  let textY = y + (accentTop ? 0.22 : 0.15);
  if (title) {
    slide.addText(title, {
      x: x + 0.2, y: textY, w: w - 0.4, h: 0.4,
      fontSize: 15, fontFace: F.JA, color: C.TEXT, bold: true, valign: 'middle',
    });
    textY += 0.42;
  }
  if (body) {
    const items = Array.isArray(body) ? body : [body];
    const textArr = items.map(t => ({
      text: t,
      options: {
        fontSize: 13, fontFace: F.JA, color: C.DARK2, breakLine: true,
        bullet: bodyBullet ? { type: 'bullet', color: C.DARK2 } : false,
        lineSpacingMultiple: 1.4,
      },
    }));
    slide.addText(textArr, {
      x: x + 0.2, y: textY, w: w - 0.4, h: h - (textY - y) - 0.15, valign: 'top',
    });
  }
}
```

### Statistical Highlight

```javascript
function drawStat(slide, x, y, w, h, { value, label, color = C.PRIMARY }) {
  slide.addShape(pres.ShapeType.roundRect, {
    x, y, w, h, fill: { color: C.LIGHT }, line: { color, width: 2 }, rectRadius: 0.08,
  });
  slide.addText(value, {
    x, y: y + 0.08, w, h: h * 0.55,
    fontSize: 28, fontFace: F.EN, color, bold: true, align: 'center', valign: 'middle',
  });
  slide.addText(label, {
    x: x + 0.1, y: y + h * 0.55, w: w - 0.2, h: h * 0.4,
    fontSize: 10, fontFace: F.JA, color: C.DARK2, align: 'center', valign: 'top',
  });
}
```

### Bullet List

```javascript
function addBullets(slide, x, y, w, h, bullets, opts = {}) {
  const { fontSize = 15, color = C.TEXT, bulletColor = C.PRIMARY } = opts;
  const items = bullets.map(t => ({
    text: t,
    options: {
      fontSize, fontFace: F.JA, color,
      bullet: { type: 'bullet', color: bulletColor },
      breakLine: true, lineSpacingMultiple: 1.4,
    },
  }));
  slide.addText(items, { x, y, w, h, valign: 'top', paraSpaceAfter: 6 });
}
```

## Connecting to a Scenario

If `set_scenario` was called earlier in this session:
- Reference each slide's `title`, `keyMessage`, `layout`, `icon`
- Use `keyMessage` as the large heading text (main message)
- `layout` may be applied as-is or reinterpreted per `designBrief`
- `icon` is a priority candidate but can be skipped if not needed
- `notes` → use as `slide.addNotes(...)` content

## Content Rules

- **No emoji**: `💡` `🔄` `✅` cause rendering issues with Noto Sans JP
- **Arrows ok**: `→` `↑` in text fields are fine
- **Checkmarks**: Use `✔` (U+2714) not emoji
- **Line spacing**: Japanese text should use `lineSpacingMultiple: 1.5`
- **Minimum font**: Never go below 8pt
- Match the user's language for all slide content
- Append original terms for jargon (e.g., "Retrieval-Augmented Generation (RAG)")

## Quality Checklist

- [ ] No `import` statements
- [ ] No `new PptxGenJS()`
- [ ] No `writeFile`
- [ ] Colors are 6-digit HEX without `#`
- [ ] No emoji characters
- [ ] Fonts use `F.JA` or `F.EN`
- [ ] Title slide and summary slide included
- [ ] Every slide has `slide.addNotes()`
- [ ] Only `C.*` keys used for colors (no hardcoded hex)
- [ ] Slide masters defined before slides (CONTENT, TITLE, SECTION)
- [ ] Main body text is not below 14pt except for captions/footer-like metadata
- [ ] Icons/images are not all tiny badges clustered at the top edge of slides
- [ ] Key slides (`title`, `section`, `diagram`, `comparison`) use deliberate visual composition, not just stacked text

## Workflow

1. If user request is vague, confirm topic, audience, and purpose
2. If web_search is available, gather latest information
3. Define Slide Masters (CONTENT, TITLE, SECTION)
4. Define helper functions (addSlideTitle, drawCard, addBullets, drawStat, etc.)
5. Add slides in order
6. Add `slide.addNotes()` for every slide
7. Prepend a brief explanation of the structure before the code block
