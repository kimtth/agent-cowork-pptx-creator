"""Layout specifications for python-pptx slide generation.

Ported from src/domain/layout/slide-layout-spec.ts.
Provides pre-computed safe coordinates for 10 layout types so LLM-generated
code can place elements without freehand guessing.

Usage in generated code:

    spec = get_layout_spec('cards')
    title = spec.title_rect          # RectSpec(x=0.5, y=0.72, w=12.33, h=0.34)
    cards = spec.cards               # CardsSpec(columns=2, card_w=5.9, ...)

    # Place title
    txBox = slide.shapes.add_textbox(Inches(title.x), Inches(title.y),
                                     Inches(title.w), Inches(title.h))

    # Place cards in a grid
    for i, item in enumerate(items[:spec.max_items]):
        col = i % cards.columns
        row = i // cards.columns
        cx = cards.start_x + col * (cards.card_w + cards.gap_x)
        cy = cards.start_y + row * (cards.card_h + cards.gap_y)
        shape = slide.shapes.add_shape(..., Inches(cx), Inches(cy),
                                       Inches(cards.card_w), Inches(cards.card_h))
"""

from __future__ import annotations

from dataclasses import dataclass, replace
import math

SLIDE_WIDTH_IN = 13.333
SLIDE_HEIGHT_IN = 7.5
CONTENT_LEFT_IN = 0.5
CONTENT_RIGHT_IN = 0.5
CONTENT_WIDTH_IN = SLIDE_WIDTH_IN - CONTENT_LEFT_IN - CONTENT_RIGHT_IN
SAFE_MARGIN_IN = 0.3
HEADER_WIDTH_RATIO = 0.86
ICON_CORNER_MARGIN_X = 0.5
ICON_CORNER_MARGIN_Y = 0.45


@dataclass(frozen=True)
class RectSpec:
    x: float
    y: float
    w: float
    h: float

    @property
    def right(self) -> float:
        return self.x + self.w

    @property
    def bottom(self) -> float:
        return self.y + self.h


@dataclass(frozen=True)
class CardsSpec:
    columns: int
    card_w: float
    card_h: float
    start_x: float
    start_y: float
    gap_x: float
    gap_y: float

    def card_rect(self, index: int) -> RectSpec:
        col = index % self.columns
        row = index // self.columns
        return RectSpec(
            x=self.start_x + col * (self.card_w + self.gap_x),
            y=self.start_y + row * (self.card_h + self.gap_y),
            w=self.card_w,
            h=self.card_h,
        )


@dataclass(frozen=True)
class StatsSpec:
    start_x: float
    start_y: float
    box_w: float
    box_h: float
    gap_x: float

    def box_rect(self, index: int) -> RectSpec:
        return RectSpec(
            x=self.start_x + index * (self.box_w + self.gap_x),
            y=self.start_y,
            w=self.box_w,
            h=self.box_h,
        )


@dataclass(frozen=True)
class TimelineSpec:
    line_x: float
    line_y: float
    line_h: float
    dot_x: float
    dot_size: float
    start_y: float
    step_y: float
    text_x: float
    text_w: float

    def node_rect(self, index: int) -> RectSpec:
        return RectSpec(
            x=self.text_x,
            y=self.start_y + index * self.step_y,
            w=self.text_w,
            h=self.step_y * 0.85,
        )


@dataclass(frozen=True)
class ComparisonSpec:
    left: RectSpec
    right: RectSpec


@dataclass(frozen=True)
class LayoutSpec:
    layout_type: str
    title_rect: RectSpec | None = None
    key_message_rect: RectSpec | None = None
    accent_rect: RectSpec | None = None
    icon_rect: RectSpec | None = None
    content_rect: RectSpec | None = None
    notes_rect: RectSpec | None = None
    summary_box: RectSpec | None = None
    hero_rect: RectSpec | None = None
    chips_rect: RectSpec | None = None
    footer_rect: RectSpec | None = None
    sidebar_rect: RectSpec | None = None
    max_items: int = 0
    row_step: float | None = None
    cards: CardsSpec | None = None
    stats: StatsSpec | None = None
    timeline: TimelineSpec | None = None
    comparison: ComparisonSpec | None = None


def estimate_text_height_in(
    text: str,
    width_in: float,
    font_size_pt: float,
    *,
    line_height: float = 1.22,
    min_lines: int = 1,
) -> float:
    """Estimate text height in inches for wrapped text.

    This is an intentionally simple heuristic. It is not a real font metrics engine,
    but it is good enough to reserve vertical space before placing lower regions.
    """
    paragraphs = [part.strip() for part in text.splitlines() if part.strip()]
    if not paragraphs:
        lines = min_lines
    else:
        # Use a slightly conservative character width so headings reserve more height
        # before lower content zones are placed.
        avg_char_width_in = max((font_size_pt / 72.0) * 0.52, 0.085)
        chars_per_line = max(int(width_in / avg_char_width_in), 6)
        lines = 0
        for paragraph in paragraphs:
            logical_len = len(paragraph)
            if logical_len == 0:
                lines += 1
            else:
                lines += max(math.ceil(logical_len / chars_per_line), 1)
        lines = max(lines, min_lines)

    base_height = lines * (font_size_pt / 72.0) * line_height
    # Add a safety cushion for paragraph spacing and large display text.
    cushion = 0.06 + (0.02 * max(lines - 1, 0))
    if font_size_pt >= 24:
        cushion += 0.08
    return base_height + cushion


def _cascade_subzone(rect: RectSpec | None, content_y: float, content_bottom: float) -> RectSpec | None:
    """Reposition a sub-zone (hero, sidebar) so its top aligns with the content zone."""
    if rect is None:
        return None
    return replace(rect, y=content_y, h=max(content_bottom - content_y, 0.8))


def _cascade_chips(chips: RectSpec | None, content_rect: RectSpec | None, content_bottom: float) -> RectSpec | None:
    """Place chips rect below content or at a fraction of content bottom."""
    if chips is None:
        return None
    if content_rect is not None:
        target_y = content_rect.y + content_rect.h + 0.12
    else:
        target_y = content_bottom - 1.2
    return replace(chips, y=min(target_y, content_bottom - 0.5))


def _cascade_footer(
    footer: RectSpec | None,
    content_rect: RectSpec | None,
    chips: RectSpec | None,
    content_bottom: float,
) -> RectSpec | None:
    """Place footer below chips (if present) or below content."""
    if footer is None:
        return None
    if chips is not None:
        target_y = chips.y + chips.h + 0.12
    elif content_rect is not None:
        target_y = content_rect.y + content_rect.h + 0.12
    else:
        target_y = content_bottom - 0.8
    return replace(footer, y=min(target_y, content_bottom - 0.1))


def _header_rect(x: float, y: float, w: float, h: float, ratio: float = HEADER_WIDTH_RATIO) -> RectSpec:
    """Return a centered header rect that uses 80-90% of the parent width."""
    header_w = round(w * ratio, 2)
    header_x = round(x + (w - header_w) / 2, 2)
    return RectSpec(header_x, y, header_w, h)


def _icon_corner_rect(size: float, *, corner: str = 'right', top: float = ICON_CORNER_MARGIN_Y) -> RectSpec:
    """Return an icon rect pinned to a slide corner."""
    if corner == 'left':
        x = ICON_CORNER_MARGIN_X
    else:
        x = round(SLIDE_WIDTH_IN - ICON_CORNER_MARGIN_X - size, 2)
    return RectSpec(x, top, size, size)


def flow_layout_spec(
    spec: LayoutSpec,
    *,
    title_text: str,
    key_message_text: str = '',
    title_font_pt: float = 30,
    key_font_pt: float = 18,
) -> LayoutSpec:
    """Return a layout spec adjusted in display order for title -> key message -> content.

    The base template still defines widths and general regions, but vertical placement
    is recomputed from text demand so lower content starts below the actual title block.
    """
    if spec.title_rect is None:
        return spec

    title_height = max(
        spec.title_rect.h,
        estimate_text_height_in(title_text, spec.title_rect.w, title_font_pt),
    )
    title_rect = replace(spec.title_rect, h=title_height)

    next_y = title_rect.y + title_rect.h + 0.08

    key_rect = spec.key_message_rect
    if key_rect is not None:
        key_height = max(
            key_rect.h,
            estimate_text_height_in(key_message_text, key_rect.w, key_font_pt),
        ) if key_message_text.strip() else key_rect.h
        key_rect = replace(key_rect, y=next_y, h=key_height)
        next_y = key_rect.y + key_rect.h + 0.08

    accent_rect = spec.accent_rect
    if accent_rect is not None:
        accent_rect = replace(accent_rect, y=next_y)
        next_y = accent_rect.y + accent_rect.h + 0.18

    content_bottom = spec.notes_rect.y - 0.22 if spec.notes_rect is not None else 6.0

    content_rect = spec.content_rect
    if content_rect is not None:
        content_rect = replace(
            content_rect,
            y=next_y,
            h=max(content_bottom - next_y, 0.8),
        )

    summary_box = spec.summary_box
    if summary_box is not None:
        summary_box = replace(summary_box, y=next_y)
        summary_bottom = summary_box.y + summary_box.h
        if content_rect is not None:
            content_rect = replace(
                content_rect,
                y=summary_bottom + 0.22,
                h=max(content_bottom - (summary_bottom + 0.22), 0.6),
            )

    cards = spec.cards
    if cards is not None:
        cards = replace(cards, start_y=next_y)

    stats = spec.stats
    if stats is not None:
        stats = replace(stats, start_y=next_y + 0.08)

    comparison = spec.comparison
    if comparison is not None:
        left = replace(comparison.left, y=next_y, h=max(content_bottom - next_y, 1.0))
        right = replace(comparison.right, y=next_y, h=max(content_bottom - next_y, 1.0))
        comparison = ComparisonSpec(left=left, right=right)

    timeline = spec.timeline
    if timeline is not None:
        line_h = max(content_bottom - next_y, 1.2)
        timeline = replace(
            timeline,
            line_y=next_y,
            line_h=line_h,
            start_y=next_y - 0.04,
        )

    return replace(
        spec,
        title_rect=title_rect,
        key_message_rect=key_rect,
        accent_rect=accent_rect,
        content_rect=content_rect,
        summary_box=summary_box,
        hero_rect=_cascade_subzone(spec.hero_rect, next_y, content_bottom),
        chips_rect=_cascade_chips(spec.chips_rect, content_rect, content_bottom),
        footer_rect=_cascade_footer(spec.footer_rect, content_rect, spec.chips_rect, content_bottom),
        sidebar_rect=_cascade_subzone(spec.sidebar_rect, next_y, content_bottom),
        cards=cards,
        stats=stats,
        comparison=comparison,
        timeline=timeline,
    )


def get_layout_spec(layout_type: str, has_icon: bool = False) -> LayoutSpec:
    """Return the pre-computed layout specification for a given slide layout type.

    Args:
        layout_type: One of title, section, agenda, bullets, cards, stats,
                     comparison, timeline, diagram, summary.
        has_icon: Whether the slide includes an icon (affects bullets layout).
    """
    lt = layout_type.lower().strip()

    if lt == 'title':
        return LayoutSpec(
            layout_type=lt,
            title_rect=_header_rect(0.5, 1.45, 7.9, 0.6),
            key_message_rect=_header_rect(0.5, 2.16, 7.3, 0.46),
            accent_rect=RectSpec(0.5, 1.08, 0.9, 0.06),
            icon_rect=_icon_corner_rect(2.35),
            hero_rect=RectSpec(8.85, 1.20, 3.65, 3.65),
            chips_rect=RectSpec(0.5, 4.85, 7.85, 0.46),
            footer_rect=RectSpec(0.5, 5.52, 7.85, 0.70),
            notes_rect=RectSpec(0.5, 6.18, 12.33, 0.7),
            max_items=0,
        )

    if lt == 'section':
        return LayoutSpec(
            layout_type=lt,
            title_rect=_header_rect(0.9, 2.1, 8.4, 0.48),
            key_message_rect=_header_rect(0.9, 2.58, 8.9, 0.68),
            accent_rect=RectSpec(0.9, 1.68, 0.9, 0.05),
            icon_rect=_icon_corner_rect(1.6),
            notes_rect=RectSpec(0.5, 6.18, 12.33, 0.7),
            max_items=0,
        )

    if lt == 'agenda':
        return LayoutSpec(
            layout_type=lt,
            title_rect=_header_rect(0.5, 0.5, 9.1, 0.50),
            key_message_rect=_header_rect(0.5, 1.02, 9.1, 0.55),
            accent_rect=RectSpec(0.5, 1.62, 1.5, 0.04),
            content_rect=RectSpec(0.5, 1.86, 8.8, 3.36),
            sidebar_rect=RectSpec(9.62, 2.18, 2.88, 3.72),
            notes_rect=RectSpec(0.5, 6.18, 12.33, 0.7),
            max_items=5,
            row_step=0.58,
        )

    if lt == 'cards':
        tw = 9.1 if has_icon else 12.33
        cw = 9.3 if has_icon else 12.33
        card_w_val = round((cw - 0.32) / 2, 2)
        return LayoutSpec(
            layout_type=lt,
            title_rect=_header_rect(0.5, 0.5, tw, 0.50),
            key_message_rect=_header_rect(0.5, 1.02, tw, 0.55),
            accent_rect=RectSpec(0.5, 1.62, 1.5, 0.04),
            icon_rect=_icon_corner_rect(2.1) if has_icon else None,
            content_rect=RectSpec(0.5, 1.86, cw, 3.8),
            notes_rect=RectSpec(0.5, 6.18, 12.33, 0.7),
            max_items=4,
            cards=CardsSpec(
                columns=2,
                card_w=card_w_val,
                card_h=1.04,
                start_x=0.5,
                start_y=1.86,
                gap_x=0.32,
                gap_y=0.28,
            ),
        )

    if lt == 'stats':
        tw = 9.1 if has_icon else 12.33
        cw = 9.3 if has_icon else 12.33
        box_w_val = round((cw - 0.35 * 2) / 3, 2)
        return LayoutSpec(
            layout_type=lt,
            title_rect=_header_rect(0.5, 0.5, tw, 0.50),
            key_message_rect=_header_rect(0.5, 1.02, tw, 0.55),
            accent_rect=RectSpec(0.5, 1.62, 1.5, 0.04),
            icon_rect=_icon_corner_rect(2.1) if has_icon else None,
            content_rect=RectSpec(0.5, 1.95, cw, 3.0),
            footer_rect=RectSpec(0.5, 4.90, 12.33, 0.72),
            notes_rect=RectSpec(0.5, 6.18, 12.33, 0.7),
            max_items=3,
            stats=StatsSpec(
                start_x=0.5,
                start_y=1.95,
                box_w=box_w_val,
                box_h=1.85,
                gap_x=0.35,
            ),
        )

    if lt == 'comparison':
        tw = 9.1 if has_icon else 12.33
        cw = 9.3 if has_icon else 12.33
        half_w = round((cw - 0.25) / 2, 2)
        right_x = round(0.5 + half_w + 0.25, 2)
        return LayoutSpec(
            layout_type=lt,
            title_rect=_header_rect(0.5, 0.5, tw, 0.50),
            key_message_rect=_header_rect(0.5, 1.02, tw, 0.55),
            accent_rect=RectSpec(0.5, 1.62, 1.5, 0.04),
            icon_rect=_icon_corner_rect(2.1) if has_icon else None,
            content_rect=RectSpec(0.5, 1.95, cw, 3.1),
            notes_rect=RectSpec(0.5, 6.18, 12.33, 0.7),
            max_items=6,
            comparison=ComparisonSpec(
                left=RectSpec(0.5, 1.95, half_w, 3.1),
                right=RectSpec(right_x, 1.95, half_w, 3.1),
            ),
        )

    if lt == 'timeline':
        tw = 9.1 if has_icon else 12.33
        return LayoutSpec(
            layout_type=lt,
            title_rect=_header_rect(0.5, 0.5, tw, 0.50),
            key_message_rect=_header_rect(0.5, 1.02, tw, 0.55),
            accent_rect=RectSpec(0.5, 1.62, 1.5, 0.04),
            icon_rect=_icon_corner_rect(2.1) if has_icon else None,
            notes_rect=RectSpec(0.5, 6.18, 12.33, 0.7),
            max_items=5,
            timeline=TimelineSpec(
                line_x=1.1,
                line_y=1.86,
                line_h=3.34,
                dot_x=0.98,
                dot_size=0.24,
                start_y=1.82,
                step_y=0.62,
                text_x=1.45,
                text_w=10.8,
            ),
        )

    if lt == 'summary':
        tw = 9.1 if has_icon else 12.33
        cw = 9.3 if has_icon else 12.33
        return LayoutSpec(
            layout_type=lt,
            title_rect=_header_rect(0.5, 0.5, tw, 0.50),
            key_message_rect=_header_rect(0.5, 1.02, tw, 0.55),
            accent_rect=RectSpec(0.5, 1.62, 1.5, 0.04),
            icon_rect=_icon_corner_rect(2.1) if has_icon else None,
            summary_box=RectSpec(0.5, 1.86, cw, 0.95),
            content_rect=RectSpec(0.5, 3.1, cw, 2.0),
            notes_rect=RectSpec(0.5, 6.18, 12.33, 0.7),
            max_items=3,
        )

    if lt == 'diagram':
        return LayoutSpec(
            layout_type=lt,
            title_rect=_header_rect(0.5, 0.5, 9.1, 0.50),
            key_message_rect=_header_rect(0.5, 1.02, 9.1, 0.55),
            accent_rect=RectSpec(0.5, 1.62, 1.5, 0.04),
            icon_rect=_icon_corner_rect(1.8),
            content_rect=RectSpec(0.5, 1.86, 8.9, 3.3),
            sidebar_rect=RectSpec(9.5, 1.86, 3.33, 3.3),
            notes_rect=RectSpec(0.5, 6.18, 12.33, 0.7),
            max_items=5,
        )

    # bullets (default)
    tw = 9.1 if has_icon else 12.33
    cw = 9.3 if has_icon else 12.33
    return LayoutSpec(
        layout_type='bullets',
        title_rect=_header_rect(0.5, 0.5, tw, 0.50),
        key_message_rect=_header_rect(0.5, 1.02, tw, 0.55),
        accent_rect=RectSpec(0.5, 1.62, 1.5, 0.04),
        icon_rect=_icon_corner_rect(2.1) if has_icon else None,
        content_rect=RectSpec(0.5, 1.86, cw, 3.8),
        notes_rect=RectSpec(0.5, 6.18, 12.33, 0.7),
        max_items=6,
    )
