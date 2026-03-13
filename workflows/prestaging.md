---
name: Prestaging Workflow
description: Stage the presentation story before PPTX generation by understanding source material, choosing a business framework, and populating the slide panel.
engine: copilot
tools:
	github:
		toolsets: [default]
---

# Prestaging Workflow

Create or refine the preliminary presentation structure before any PPTX code is generated.

## Objective

Understand the available source content and business context, confirm the desired business framework with the user, and stage preliminary slide definitions in the slide panel.

## Inputs

- Workspace slide state, if any already exists.
- Source files, summaries, URLs, and consumed markdown available in the workspace.
- User instructions about audience, objective, tone, or constraints.
- Selected framework or design hints, if the user already provided them.

## Required Process

1. Review the available content, summaries, and current slide state.
2. Identify the business objective, target audience, decision context, and communication constraints.
3. If the user has already specified a framework (visible in Current Workspace), apply it immediately — do NOT ask the user to confirm or re-select. Only present framework options if no framework is set.
4. Produce or refine the preliminary slide scenario in the slide panel.
5. Use strong action-title headlines and coherent business logic across slides.
6. Stop after the slide scenario has been staged for human review.

## Rules

- Do not generate python-pptx code.
- Do not attempt final visual composition in this workflow.
- Treat this as a planning and staging workflow only.
- Prepare slides so the user can tweak text, reorder slides, and attach images afterward.
- Prefer concise, decision-oriented slide titles and clear supporting structure.
- If the source material is ambiguous, make the structure defensible and note the assumption through the slide content rather than long narration.

## Output Contract

- The slide panel should contain a usable preliminary slide outline.
- The output should be ready for user review and edits.
- The workflow should not emit final PPTX code.
- The workflow should leave room for later image selection and final design refinement.

## Success Criteria

- A coherent business framework is evident.
- Slide titles communicate takeaways, not just topics.
- The story is ready for user tweaking before the create-PPTX phase.