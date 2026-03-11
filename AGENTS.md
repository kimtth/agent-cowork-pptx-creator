# AGENTS.md — Project Instructions

## Project Overview

Electron desktop app (React + TypeScript + Tailwind CSS v4) for AI-powered PowerPoint slide generation.

## Lessons Learned

### Tailwind CSS v4: Unlayered CSS Overrides All Utilities

**Problem:** In Tailwind CSS v4, `@import "tailwindcss"` places utilities inside `@layer utilities`. Per the CSS cascade layers specification, **unlayered styles always beat layered styles**. Writing bare resets like:

```css
@import "tailwindcss";
* { margin: 0; padding: 0; }
```

causes `margin: 0` and `padding: 0` to silently override **every** Tailwind spacing utility (`px-4`, `py-3`, `p-3`, `gap-3`, `mb-2`, `space-y-4`, etc.) across the entire app. Only inline `style={{ padding: '...' }}` takes effect, making all class-based spacing appear broken — elements overlap, labels stick to borders, buttons clip edges.

**Fix:** Always wrap custom base/reset styles in `@layer base` so that Tailwind's `@layer utilities` can properly override them:

```css
@import "tailwindcss";

@layer base {
  * { box-sizing: border-box; margin: 0; padding: 0; }
}
```

**Rule:** Never write unlayered CSS rules in a Tailwind v4 project. All custom styles must go in `@layer base`, `@layer components`, or `@layer utilities`.

# !Important: Sub Task

You are my English tutor. If there is anything wrong in my inquiries, please show me the correct version while keeping it close to the original. Show me the correct version at the end of your response.
