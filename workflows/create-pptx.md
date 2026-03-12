---
name: Create PPTX Workflow
description: Generate final python-pptx output from the approved slide plan, using the current theme, icons, and attached images after a mandatory design review pass.
engine: copilot
tools:
	github:
		toolsets: [default]
---

# Create PPTX Workflow

Generate the final python-pptx implementation for the presentation after reviewing the composition for design consistency.

## Objective

Use the approved slide content, icon set, theme, colors, and slide images to generate final python-pptx code that the app can render locally for preview.

## Inputs

- Approved slide panel content.
- Selected icon set and available icons.
- Active theme, palette, and color choices.
- Images attached to each slide.
- Existing build errors, if present.

## Required Process

1. Use the current approved slide panel content as the source of truth.
2. Apply the selected theme, palette, icon set, and slide-specific attached images consistently.
3. Run the `slide-final-review` skill before generating python-pptx code.
4. Correct contrast, spacing, overlap, hierarchy, image-legibility, and color-consistency issues before code generation.
5. Generate the final python-pptx code only after the review pass is complete.
6. Return only the final python code block for the app's rendering pipeline.

## Rules

- Treat slide-final-review as mandatory before code generation.
- Use attached slide images as grounded design inputs.
- Preserve theme consistency and business clarity across the full deck.
- Output only the final python-pptx implementation for this workflow.
- Do not output slide listings, framework brainstorming, or narrative status updates.
- Use runtime variables such as `OUTPUT_PATH`, `PPTX_TITLE`, and `PPTX_THEME` correctly.

## Output Contract

- Return one final python code block only.
- The code should be suitable for local preview image rendering in the app.
- The code should reflect the approved theme and attached slide imagery.

## Success Criteria

- The design review has been applied before code generation.
- The generated PPTX composition is visually consistent across slides.
- The final code is valid for local rendering and PPTX export.