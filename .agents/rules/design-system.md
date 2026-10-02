# Design System Rule

Never use hardcoded colors in UI components.

All colors must originate from the semantic design tokens defined in:
`src/app/globals.css`

If a new color is genuinely required, first add it as a semantic token to `globals.css`, then use that token in components.

Never bypass the design system with:
- arbitrary hex values
- rgb()
- hsl()
- Tailwind palette colors such as blue-500, purple-500, etc.

Prefer semantic names such as:
- bg-background
- bg-surface
- bg-primary
- text-text-primary
- text-text-secondary
- border-border
- text-success
- text-danger

The design system is the single source of truth for application colors.
