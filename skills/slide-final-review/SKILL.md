---
name: slide-final-review
description: >
  Review PowerPoint slide designs before final output to catch poor color contrast,
  unreadable text, overlapping layout elements, spacing issues, and inconsistent
  visual treatment. Use together with PPTX generation/manipulation when building
  or revising slides.
---

# Slide Final Review Skill

Use this skill as the final design QA pass for PowerPoint slides.

Its job is to prevent decks that look acceptable in code but fail visually in practice.

This skill should be applied before finalizing PPTX output, especially when slides use:

- light text on light backgrounds
- dark text on dark backgrounds
- dense text blocks
- large icons or images near titles and body copy
- multi-column cards, comparison layouts, and timelines
- strong accent colors across multiple slides

## Primary Review Goals

1. Prevent unreadable contrast combinations.
2. Prevent overlapping or cramped layouts.
3. Keep typography and spacing consistent across the deck.
4. Ensure visual hierarchy remains clear at presentation distance.
5. Catch designs that would pass syntactically but fail in a boardroom.

## Required Review Checks

### 1. Contrast Safety

Reject or revise combinations like:

- white text on white or near-white background
- pale accent text on a bright background
- low-opacity text over photography without a dark/light overlay
- thin gray text on a light neutral surface

Rules:

- Body text must maintain strong contrast against its background.
- Titles must have obvious contrast at a distance.
- If an image sits behind text, add an overlay or move text to a solid panel.
- Prefer dark text on light surfaces or light text on dark surfaces, not mid-tone on mid-tone.

### 2. Layout Collision Review

Check for likely overlap between:

- title and subtitle blocks
- icons/images and text frames
- cards that are too short for their text
- timeline nodes and labels
- charts/tables and slide footers
- decorative shapes and content areas

Rules:

- No text box should visually collide with another object.
- Keep clear breathing room between sections.
- If content barely fits, the layout is wrong; recompose instead of shrinking everything.
- Do not allow edge-hugging elements that feel clipped or accidental.

### 3. Readability at Presentation Distance

Rules:

- Important text must remain readable when projected.
- Avoid overly small body text.
- Avoid long dense paragraphs when cards, bullets, or metrics would communicate better.
- Do not hide key meaning in captions or low-contrast secondary text.

### 4. Color Consistency

Rules:

- Use the active theme palette consistently.
- Avoid random one-off colors outside the approved theme.
- Reuse accent colors intentionally, not arbitrarily.
- Do not assign different semantic meanings to the same accent across nearby slides.
- Warning, success, neutral, and emphasis colors should feel stable across the deck.

### 5. Image and Background Safety

Rules:

- Images must not reduce text legibility.
- Decorative images must not compete with the main message.
- If an image is primary, let it dominate cleanly.
- If an image is secondary, reduce its visual weight.
- Avoid busy crops behind small text.

## Hard Fail Conditions

These must be corrected before final output:

- white text on white background
- near-invisible text due to poor contrast
- overlapping text and shape/image content
- cards or panels with clipped text
- objects extending outside the safe visual area unintentionally
- inconsistent font sizing or spacing that makes the deck feel unstable
- multiple slides using conflicting visual logic without a reason

## Review Actions

When problems are found, revise the slide by doing one or more of the following:

- change text color to a safer theme color
- change background fill to improve contrast
- add a solid or semi-transparent panel behind text
- move or resize imagery to restore breathing room
- split dense content into separate zones or slides
- enlarge critical type and reduce nonessential content
- normalize spacing, alignment, and card heights

## Preferred Review Mindset

Do not merely note issues. Fix them in the final PPTX composition.

If a design choice creates ambiguity between aesthetic impact and readability, choose readability first.

If a slide looks stylish but forces the viewer to work to decode it, revise it.

## Short Review Checklist

- [ ] No low-contrast text/background combinations
- [ ] No likely overlap or clipping
- [ ] Strong title readability
- [ ] Consistent use of theme accents
- [ ] Images do not interfere with legibility
- [ ] Layout has enough whitespace to breathe
- [ ] Slide remains readable from a distance

## Use With

- `manipulation-pptx`
- `pptx-design-styles`
- `elite-powerpoint-designer`

Apply this skill at the end of slide composition, before final PPTX output is considered done.