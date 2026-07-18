# Forge Design System

## Direction

Forge is calm, precise, and quietly intelligent. The interface favors clarity,
restraint, and durable hierarchy over decoration. It must not feel playful,
cyberpunk, heavily illuminated, or like a generic AI chat product.

Sprint 1 implements dark mode only. A light theme is intentionally deferred.

## Color

The application uses a near-black charcoal (`#111315`) rather than pure black.
Elevated and subtle surfaces create hierarchy through small luminance shifts.

| Token                | Value     | Purpose                              |
| -------------------- | --------- | ------------------------------------ |
| `--background`       | `#111315` | Application canvas                   |
| `--surface-elevated` | `#1a1d21` | Panels and elevated containers       |
| `--surface-subtle`   | `#15181b` | Quiet grouped or inset regions       |
| `--text-primary`     | `#f2f4f7` | Primary content and headings         |
| `--text-secondary`   | `#b8c0ca` | Supporting content                   |
| `--text-muted`       | `#7f8995` | Low-emphasis metadata                |
| `--border`           | `#2b3138` | Dividers and component boundaries    |
| `--accent-primary`   | `#5b8def` | Primary actions and active states    |
| `--accent-secondary` | `#34c98f` | Restrained progress or secondary cue |
| `--success`          | `#36c98f` | Successful outcomes                  |
| `--warning`          | `#e5a63b` | Warnings requiring attention         |
| `--destructive`      | `#e45d63` | Destructive actions and errors       |
| `--focus-ring`       | `#82aaff` | Keyboard focus visibility            |

Blue is the dominant accent. Emerald is reserved for progress, success, and
small secondary signals; it is not a competing brand color.

## Typography

Forge uses Geist Sans through `next/font/google`. It is loaded by Next.js and
exposed as `--font-geist`, avoiding an additional font package. The fallback
stack is Arial, Helvetica, and sans-serif.

- Body copy uses a `1.5` line height for sustained readability.
- Headings use weight `600`, a `1.15` line height, and balanced wrapping.
- Font smoothing and optimized text rendering are enabled globally.

## Shape and Elevation

Radii are semantic CSS variables: `--radius-small` (`6px`), `--radius-medium`
(`10px`), `--radius-large` (`14px`), and `--radius-xlarge` (`18px`). Controls
should prefer the smaller values; larger containers may use the larger values.

Shadows remain soft and low contrast. `--shadow-elevation-small` supports small
elevation, `--shadow-elevation-medium` supports panels, and `--shadow-focus`
reinforces keyboard focus. Borders should provide most structural separation
before shadows are added.

## Accessibility and Motion

- The document declares a dark color scheme for native browser controls.
- Keyboard focus uses a visible blue outline and a restrained focus shadow.
- Text selection uses a translucent primary accent.
- Scrollbars are thin and low contrast across supporting browsers.
- Reduced-motion preferences collapse animation and transition durations and
  disable smooth scrolling.

No product animation has been introduced in this foundation.

## Tailwind Integration

Tailwind v4 maps the semantic CSS variables through `@theme inline`. Utilities
such as `bg-background`, `bg-surface-elevated`, `text-text-secondary`,
`border-border`, and `text-accent-primary` consume the same source tokens as
plain CSS. Component-specific tokens are deferred until the component system is
introduced.
