---
name: manipulation-pptx
description: >
  Generate and manipulate PowerPoint presentations using python-pptx.
  Covers full PPTX creation from an approved slide story and theme,
  as well as programmatic editing, charts, tables, and shape manipulation.
---

# PPTX Generation & Manipulation Skill

Create, edit, and manipulate PowerPoint (.pptx) presentations using **python-pptx**.

This skill handles two use cases:

1. **Generation** — Convert an approved slide story and theme into a complete PPTX file.
2. **Manipulation** — Add, update, or extract content from existing presentations (tables, charts, shapes, images).

This skill is **not** responsible for framework recommendation, scenario creation, or slide-story planning.
Assume the current workspace slides and theme are already the approved source of truth.

## Output Format

Always return a single ` ```python ` code block.

The code must use `python-pptx` and save a `.pptx` file.

Prefer defining:

```python
def build_presentation(output_path, theme, title):
  ...
```

The runtime will call `build_presentation(output_path, theme, title)` if present.

## Primary Objective

Produce output that is robust, deterministic, and directly executable with `python-pptx`.

## Theme Contract

`PPTX_THEME` is a Python dictionary with these keys using 6-digit hex strings without `#`.

The values are runtime-dependent and come from the palette panel/theme assignment in the app.
They are not fixed to the sample values below.

Example shape only:

```json
{
  "DARK": "1B1B1B",
  "DARK2": "2D2D2D",
  "LIGHT": "FFFFFF",
  "LIGHT2": "F5F5F5",
  "ACCENT1": "0078D4",
  "ACCENT2": "005A9E",
  "ACCENT3": "107C10",
  "ACCENT4": "5C2D91",
  "ACCENT5": "008272",
  "ACCENT6": "D83B01",
  "LINK": "0078D4",
  "USED_LINK": "5C2D91",
  "PRIMARY": "0078D4",
  "SECONDARY": "005A9E",
  "BG": "FFFFFF",
  "TEXT": "1B1B1B",
  "WHITE": "FFFFFF",
  "BORDER": "E1E1E1"
}
```

Also available at runtime:

- `OUTPUT_PATH`: destination `.pptx` path
- `PPTX_TITLE`: presentation title
- `SLIDE_WIDTH_IN`, `SLIDE_HEIGHT_IN`
- `Presentation`, `Inches`, `Pt`, `RGBColor`, `PP_ALIGN`, `MSO_ANCHOR`, `MSO_AUTO_SHAPE_TYPE`
- `rgb_color()`, `apply_widescreen()`, `safe_image_path()`, `safe_add_picture()`

Always prefer these theme values over hardcoded colors.

## Code Rules

1. Wrap the output in ` ```python `.
2. Output a complete executable script, not pseudocode and not a fragment.
3. Use `python-pptx`, not OpenXML, not PresentationSpec JSON, and not PptxGenJS.
4. Save the final deck to `output_path` or `OUTPUT_PATH`.
5. Do not emit explanations before or after the code block.
6. Prefer a single `Presentation()` instance with widescreen size via `apply_widescreen(prs)`.
7. Use grounded local image paths directly when available.

## Design Guidelines

- Treat the approved workspace slides and design brief as the primary input.
- Each slide's `layout` / `icon` is a **creative hint, not a fixed command**
- Actively reinterpret layouts to improve rhythm, whitespace, visual hierarchy, and information flow
- Add deliberate variety when 3+ consecutive slides would have identical compositions
- Maintain the user-approved story assertions while being bold with visual design
- If `designBrief.layoutApproach` is `design-led`: choose the most expressive composition that preserves story
- If `designBrief.layoutApproach` is `structured`: respect scenario layout more closely
- Distribute color usage across the full theme whenever possible. Do not let the entire deck collapse to only `ACCENT1` and `ACCENT2` if `ACCENT3`-`ACCENT6` are available.
- Reuse one or two anchor accents for coherence, but actively bring in the remaining accent colors across cards, stats, dividers, timelines, comparison bands, callouts, and icon frames.

### Icon Usage (Important)

Icon or image assets may already exist as grounded local paths from the workspace state. Use those local paths when they are available.

Available icons: `arrow-trending-up`, `brain`, `building`, `calendar`, `chart`, `checkmark-circle`, `cloud`, `code`, `data-trending`, `document`, `globe`, `lightbulb`, `link`, `lock-closed`, `money`, `people-team`, `rocket`, `search`, `settings`, `shield`, `sparkle`, `star`, `target`, `warning`

**Icon placement rules:**
- Top-left of cards for visual accent
- Larger on title slides and section dividers
- As bullet-prefix replacements for rich impression
- Prefer icon-card layouts over plain bullet lists
- When a slide has an icon hint, prefer integrating it into a panel, card, sidebar, or hero visual block instead of dropping it as a tiny corner badge
- Add shape backgrounds or framing around icons so they feel intentional rather than floating
- Always prefer grounded local asset paths over invented file paths

### Layout Principles

1. **Slide title = assertion**: Use the scenario `keyMessage` as the slide title text
2. **Layout variety**: Never use the same layout 3 slides in a row
3. **Data-first**: When numbers exist, use a stats-oriented composition to make them prominent
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

## Execution Template

```python
from pptx import Presentation

def build_presentation(output_path, theme, title):
    prs = apply_widescreen(Presentation())
    slide = prs.slides.add_slide(prs.slide_layouts[6])
    slide.background.fill.solid()
    slide.background.fill.fore_color.rgb = rgb_color(theme.get('BG'), 'FFFFFF')
    prs.save(output_path)
```

## Input Assumptions

- The current workspace slide list is already approved.
- Each slide already contains the content that should be rendered.
- `keyMessage` should drive the visual headline.
- `notes` should still inform layout and emphasis when available.

## Content Rules

- **No emoji**: `💡` `🔄` `✅` cause rendering issues with Noto Sans JP
- **Arrows ok**: `→` `↑` in text fields are fine
- **Checkmarks**: Use `✔` (U+2714) not emoji
- **Line spacing**: Japanese text should use `lineSpacingMultiple: 1.5`
- **Minimum font**: Never go below 8pt
- Match the user's language for all slide content
- Append original terms for jargon (e.g., "Retrieval-Augmented Generation (RAG)")

## Quality Checklist

- [ ] Output is a complete `python-pptx` code block
- [ ] The script saves a `.pptx` file
- [ ] The script uses `PPTX_THEME` rather than hardcoded palette choices where practical
- [ ] Main body text is not below 14pt except for captions/footer-like metadata
- [ ] Icons/images are not all tiny badges clustered at the top edge of slides
- [ ] Key slides (`title`, `section`, `diagram`, `comparison`) use deliberate visual composition, not just stacked text

## Workflow

1. Read the current approved slide story from workspace context.
2. Convert each slide into direct `python-pptx` slide-building code.
3. Use the active theme values instead of hardcoded palette choices where possible.
4. Save the finished deck to `output_path` or `OUTPUT_PATH`.
5. Output only the final code block with no explanation before or after it.

---

## python-pptx API Reference

### Presentation Structure

```
Presentation
├── slide_layouts (predefined layouts)
├── slides (individual slides)
│   ├── shapes (text, images, charts)
│   │   ├── text_frame (paragraphs)
│   │   └── table (rows, cells)
│   └── placeholders (title, content)
└── slide_masters (templates)
```

### Slide Layouts

```python
# Common layout indices (may vary by template)
TITLE_SLIDE = 0
TITLE_CONTENT = 1
SECTION_HEADER = 2
TWO_CONTENT = 3
COMPARISON = 4
TITLE_ONLY = 5
BLANK = 6

slide_layout = prs.slide_layouts[BLANK]
slide = prs.slides.add_slide(slide_layout)
```

### Adding Text

```python
# Text box
txBox = slide.shapes.add_textbox(Inches(1), Inches(2), Inches(4), Inches(1))
tf = txBox.text_frame
p = tf.paragraphs[0]
p.text = "Custom text box"
p.font.bold = True
p.font.size = Pt(18)

# Additional paragraphs with indentation
p = tf.add_paragraph()
p.text = "Sub-bullet"
p.level = 1
```

### Shapes

```python
from pptx.enum.shapes import MSO_SHAPE

shape = slide.shapes.add_shape(
    MSO_SHAPE.RECTANGLE,
    Inches(1), Inches(2),
    Inches(3), Inches(1.5)
)
shape.text = "Rectangle with text"

# Fill and line
shape.fill.solid()
shape.fill.fore_color.rgb = RGBColor(0x00, 0x80, 0x00)
shape.line.color.rgb = RGBColor(0x00, 0x00, 0x00)
shape.line.width = Pt(2)
```

### Images

```python
slide.shapes.add_picture(
    'image.png',
    Inches(1), Inches(2),
    width=Inches(4)  # height auto-calculated
)
```

### Tables

```python
rows, cols = 4, 3
table = slide.shapes.add_table(
    rows, cols,
    Inches(1), Inches(2), Inches(8), Inches(2)
).table

table.columns[0].width = Inches(2)
table.cell(0, 0).text = "Header"
table.cell(0, 0).text_frame.paragraphs[0].font.bold = True
```

### Charts

```python
from pptx.chart.data import CategoryChartData
from pptx.enum.chart import XL_CHART_TYPE

chart_data = CategoryChartData()
chart_data.categories = ['Q1', 'Q2', 'Q3', 'Q4']
chart_data.add_series('Sales', (19.2, 21.4, 16.7, 23.8))

chart = slide.shapes.add_chart(
    XL_CHART_TYPE.COLUMN_CLUSTERED,
    Inches(1), Inches(2), Inches(8), Inches(4),
    chart_data
).chart

chart.has_legend = True
```

### Text Formatting

```python
run = p.runs[0]
run.font.name = 'Arial'
run.font.size = Pt(24)
run.font.bold = True
run.font.color.rgb = RGBColor(0x00, 0x66, 0xCC)

p.alignment = PP_ALIGN.CENTER  # LEFT, RIGHT, JUSTIFY
```

### Limitations

- No complex animations or transitions
- Limited SmartArt support
- No video embedding via python-pptx API
- Chart types limited to standard Office charts
