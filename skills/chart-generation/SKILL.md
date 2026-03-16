---
name: chart-generation
description: >
  Generate charts, graphs, and data visualisations inside PowerPoint slides.
  Covers native editable charts (bar, line, pie, scatter) via python-pptx
  and rich statistical visuals (heatmaps, distributions, treemaps) via
  matplotlib/seaborn rendered as high-resolution images.
---

# Chart & Data-Visualisation Skill

Add charts and graphs to PPTX slides when the provided data contains
numeric series, trends, comparisons, distributions, or proportions.

## When to Use Charts

| Data pattern                         | Recommended chart type      | Approach    |
|--------------------------------------|-----------------------------|-------------|
| Categories with values (revenue, %)  | Bar / Column chart          | **Native**  |
| Trend over time                      | Line chart                  | **Native**  |
| Part-of-whole (budget split)         | Pie / Doughnut chart        | **Native**  |
| Two variables correlated             | Scatter / Bubble chart      | **Native**  |
| Matrix / cross-tab values            | Heatmap                     | **Seaborn** |
| Distribution of a variable           | Histogram / Violin / Box    | **Seaborn** |
| Hierarchical proportions             | Treemap                     | **Seaborn** |
| Funnel / waterfall                   | Stacked bar (customised)    | **Seaborn** |
| < 4 data points, simple KPIs        | Use `stats` layout instead  | —           |

**Do NOT generate chart slides** when the content is purely qualitative,
narrative, or when fewer than 3 data points exist (use `stats` layout).

## Two Approaches

### 1. Native Charts (editable in PowerPoint)

Use `add_native_chart()` or the raw `slide.shapes.add_chart()` API.
These charts remain fully editable — the user can right-click → Edit Data.

**Supported types** (via `XL_CHART_TYPE`):
- `COLUMN_CLUSTERED` / `COLUMN_STACKED`
- `BAR_CLUSTERED` / `BAR_STACKED`
- `LINE` / `LINE_MARKERS`
- `PIE` / `DOUGHNUT`
- `XY_SCATTER` / `BUBBLE`
- `AREA` / `AREA_STACKED`

#### Code Pattern — Bar Chart

```python
spec = PRECOMPUTED_LAYOUT_SPECS[slide_index]
cr = spec.content_rect

chart_data = CategoryChartData()
chart_data.categories = ['Q1', 'Q2', 'Q3', 'Q4']
chart_data.add_series('Revenue', (120, 145, 160, 190))
chart_data.add_series('Expenses', (100, 110, 125, 140))

add_native_chart(
    slide,
    XL_CHART_TYPE.COLUMN_CLUSTERED,
    chart_data,
    Inches(cr.x), Inches(cr.y), Inches(cr.w), Inches(cr.h),
    theme=PPTX_THEME,
)
```

#### Code Pattern — Pie Chart

```python
chart_data = CategoryChartData()
chart_data.categories = ['Cloud', 'SaaS', 'On-Prem']
chart_data.add_series('Split', (55, 30, 15))

add_native_chart(
    slide, XL_CHART_TYPE.PIE, chart_data,
    Inches(cr.x), Inches(cr.y), Inches(cr.w), Inches(cr.h),
    theme=PPTX_THEME,
)
```

### 2. Seaborn / Matplotlib Rendered Charts (static image)

Use `add_chart_picture()` for complex statistical visualisations that
python-pptx's native chart API cannot express.

**Styling rules:**
- Always call `sns.set_theme(style='whitegrid')` for clean backgrounds.
- Use `_theme_color_cycle(PPTX_THEME)` or access `PPTX_THEME` accent keys
  for consistent colours.
- Set `fig.patch.set_alpha(0)` for transparent background.
- Use `dpi=200` (default) for sharp rendering on slides.

#### Code Pattern — Heatmap

```python
spec = PRECOMPUTED_LAYOUT_SPECS[slide_index]
cr = spec.content_rect

data = np.array([[10, 20, 30], [40, 50, 60], [70, 80, 90]])
labels_x = ['A', 'B', 'C']
labels_y = ['X', 'Y', 'Z']

fig, ax = plt.subplots(figsize=(cr.w * 0.9, cr.h * 0.85))
sns.heatmap(data, annot=True, fmt='d', xticklabels=labels_x, yticklabels=labels_y,
            cmap='YlOrRd', ax=ax)
ax.set_title('')
fig.patch.set_alpha(0)

add_chart_picture(
    slide.shapes, fig,
    Inches(cr.x), Inches(cr.y), Inches(cr.w), Inches(cr.h),
    workspace_dir=WORKSPACE_DIR,
)
```

#### Code Pattern — Distribution

```python
fig, ax = plt.subplots(figsize=(cr.w * 0.9, cr.h * 0.85))
sns.set_theme(style='whitegrid')
sns.histplot(data_values, bins=20, kde=True, ax=ax,
             color=PPTX_THEME.get('accent1', '#6366F1'))
fig.patch.set_alpha(0)

add_chart_picture(
    slide.shapes, fig,
    Inches(cr.x), Inches(cr.y), Inches(cr.w), Inches(cr.h),
    workspace_dir=WORKSPACE_DIR,
)
```

## Layout

Use layout type `'chart'` for chart slides.  The `chart` spec provides:
- `title_rect` — slide title (compact)
- `key_message_rect` — one-line insight / chart subtitle
- `content_rect` — **large zone (~70% of slide)** for the chart
- `footer_rect` — data source citation (small)
- `notes_rect` — speaker notes

Always place the chart inside `spec.content_rect`.

## Data Extraction from Markdown

When consumed data arrives as Markdown tables, parse them into Python lists:

```python
# Example: extract from markdown table text
lines = table_text.strip().splitlines()
headers = [h.strip() for h in lines[0].split('|') if h.strip()]
rows = []
for line in lines[2:]:  # skip header separator
    cells = [c.strip() for c in line.split('|') if c.strip()]
    if cells:
        rows.append(cells)
```

## Theme Integration

- **Native charts**: pass `theme=PPTX_THEME` to `add_native_chart()` for
  automatic series colouring.
- **Seaborn charts**: build a colour palette from theme accents:
  ```python
  colors = [f'#{PPTX_THEME[k]}' for k in
            ['accent1', 'accent2', 'accent3', 'accent4', 'accent5', 'accent6']
            if k in PPTX_THEME]
  sns.set_palette(colors)
  ```

## Decision Guide

Prefer **native charts** whenever possible — they stay editable in
PowerPoint.  Use **seaborn** only for chart types that python-pptx
cannot render (heatmaps, violin plots, treemaps, complex annotations).

## Quality Checklist

- [ ] Chart uses `spec.content_rect` positioning (no hardcoded coords)
- [ ] Theme colours applied to all series / elements
- [ ] Font contrast safe (axis labels readable on slide background)
- [ ] Data source cited in `spec.footer_rect` if external data
- [ ] `fetch_icon()` still called for the slide (every slide needs an icon)
- [ ] Figure closed after rendering (`plt.close(fig)` — handled by helpers)
