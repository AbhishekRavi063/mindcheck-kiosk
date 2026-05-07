# MindCheck Design System Reference

### Tailwind Setup

**Version:** Tailwind CSS v4.1.3 — configured entirely in CSS, no `tailwind.config.js`.

**Dark mode:** Class-based via `@custom-variant dark (&:is(.dark *))`. The `.dark` class is toggled on a parent element by `App.tsx`. Use `dark:` prefix as normal.

**Path alias:** `@` resolves to `./src`.

**`cn()` utility** (`src/components/ui/utils.ts`) — always use this for composing class names:
```ts
import { cn } from '@/components/ui/utils'
cn('base-classes', conditionalClass && 'extra', className)
```

---

### Color Tokens

Defined as CSS custom properties in `src/styles/globals.css`, exposed to Tailwind via `@theme inline`. Use the semantic names (e.g. `bg-primary`, `text-muted-foreground`), not raw hex.

#### Light Mode
| Token | Value | Usage |
|---|---|---|
| `--background` | `#ffffff` | Page background |
| `--foreground` | `oklch(0.145 0 0)` | Body text |
| `--card` | `#ffffff` | Card/surface bg |
| `--card-foreground` | `oklch(0.145 0 0)` | Text on cards |
| `--primary` | `#030213` | Primary actions, filled buttons |
| `--primary-foreground` | `#ffffff` | Text on primary |
| `--secondary` | `oklch(0.95 0.0058 264.53)` | Secondary actions |
| `--muted` | `#ececf0` | Muted bg, tab list, slider track |
| `--muted-foreground` | `#717182` | Placeholder, descriptions |
| `--accent` | `#e9ebef` | Hover states, skeletons |
| `--destructive` | `#d4183d` | Errors, delete actions |
| `--border` | `rgba(0,0,0,0.1)` | Dividers, input borders |
| `--input-background` | `#f3f3f5` | Input/textarea fill |
| `--switch-background` | `#cbced4` | Unchecked switch track |
| `--ring` | `oklch(0.708 0 0)` | Focus rings |
| `--radius` | `0.625rem` | Base corner radius |

#### Dark Mode (`.dark` overrides)
Backgrounds shift into the `oklch(0.145–0.269 0 0)` range (very dark grays). `--primary` becomes near-white (`oklch(0.985 0 0)`). `--destructive` shifts to a muted dark red. Chart colors shift toward brighter blues/greens/purples.

#### Chart Palette (5 semantic chart colors)
| Token | Light | Dark |
|---|---|---|
| `--chart-1` | Orange `oklch(0.646 0.222 41)` | Blue `oklch(0.488 0.243 264)` |
| `--chart-2` | Teal `oklch(0.6 0.118 185)` | Green `oklch(0.696 0.17 162)` |
| `--chart-3` | Blue-gray `oklch(0.398 0.07 227)` | Amber `oklch(0.769 0.188 70)` |
| `--chart-4` | Yellow `oklch(0.828 0.189 84)` | Purple `oklch(0.627 0.265 304)` |
| `--chart-5` | Amber `oklch(0.769 0.188 70)` | Red `oklch(0.645 0.246 16)` |

#### App Brand Colors (hardcoded, not tokenized)
These are used directly in app components via Tailwind arbitrary values — they exist outside the shadcn token system:

| Name | Hex | Where used |
|---|---|---|
| Dark brown (dark bg) | `#1a1410` | Dark mode screen backgrounds |
| Dark surface | `#2a2218` | Dark mode cards/buttons |
| Cream (light bg/text) | `#ece5de` | Light mode text on dark, icon fills |
| Warm brown (icon) | `#8d654c` | Back button icon, accent tones |

---

### Typography Scale

**Base font size:** 16px. **Font family:** system-ui sans-serif (no custom font loaded).

| Scale | rem | px | Line height |
|---|---|---|---|
| `text-xs` | 0.75rem | 12px | 1.333 |
| `text-sm` | 0.875rem | 14px | 1.429 |
| `text-base` | 1rem | 16px | 1.5 |
| `text-lg` | 1.125rem | 18px | 1.556 |
| `text-xl` | 1.25rem | 20px | 1.4 |
| `text-2xl` | 1.5rem | 24px | 1.333 |
| `text-3xl` | 1.875rem | 30px | 1.2 |
| `text-4xl` | 2.25rem | 36px | 1.111 |

**Default heading weights** (applied in `globals.css` when no Tailwind text class is present):
- `h1` → `text-2xl font-medium`
- `h2` → `text-xl font-medium`
- `h3` → `text-lg font-medium`
- `h4`, `label`, `button` → `text-base font-medium`
- `input` → `text-base font-normal`

**Font weights available:** normal (400), medium (500), semibold (600), bold (700).

---

### Spacing

Uses Tailwind's default scale — base unit is `0.25rem` (4px). No custom spacing tokens.

Notable fixed values used in the app layout:
- `pb-20` (80px) — bottom padding on all screens to clear the fixed bottom nav
- `max-w-[390px]` — mobile container width (set in vite.config.ts, affects all screens)

---

### Border Radius

All derived from `--radius: 0.625rem` (10px):

| Token | Value | px |
|---|---|---|
| `rounded-sm` / `--radius-sm` | 0.375rem | 6px |
| `rounded-md` / `--radius-md` | 0.5rem | 8px |
| `rounded-lg` / `--radius-lg` | 0.625rem | 10px |
| `rounded-xl` / `--radius-xl` | 0.875rem | 14px |
| `rounded-2xl` | 1rem | 16px |
| `rounded-3xl` | 1.5rem | 24px |
| `rounded-full` | 9999px | Pills, switches, sliders |

---

### Global Overrides

- **Scrollbars hidden everywhere** — `scrollbar-width: none` + `::-webkit-scrollbar { display: none }` applied globally.
- **Border default** — `@apply border-border outline-ring/50` on all `*`.
- **Body** — `@apply bg-background text-foreground` + antialiased font smoothing.

---

### Component Patterns

All components in `src/components/ui/` follow these conventions:

- `cn()` for class merging — always the last merge point before the element
- `data-slot="component-name"` on root elements (enables parent `[data-slot=x]` selectors)
- `asChild` prop via Radix `<Slot>` for polymorphic rendering (Button, Badge)
- CVA (`cva()`) for multi-variant components
- `aria-invalid` drives error styles (ring-destructive), not a custom error prop
- Focus: always `focus-visible:` (not `focus:`), with `ring-[3px] ring-ring/50`
- Disabled: `disabled:opacity-50 disabled:pointer-events-none`
- Transitions: `transition-[color,box-shadow]` on interactive elements

#### Button
```
variants: default | destructive | outline | secondary | ghost | link
sizes:    sm (h-8) | default (h-9) | lg (h-10) | icon (36×36)
base:     rounded-md text-sm font-medium
```

#### Card
```
Card:            rounded-xl border bg-card flex flex-col gap-6
CardHeader:      px-6 pt-6 gap-1.5  (uses @container for action column layout)
CardContent:     px-6 pb-6
CardFooter:      flex items-center px-6 pb-6
```

#### Badge
```
variants: default | secondary | destructive | outline
base:     rounded-md text-xs font-medium px-2 py-0.5
```

#### Input / Textarea
```
base:     h-9 rounded-md border bg-input-background px-3
          focus-visible:ring-[3px] ring-ring/50
          aria-invalid → ring-destructive/20 border-destructive
Textarea: resize-none, field-sizing-content (auto-height)
```

#### Dialog
```
Overlay:  fixed inset-0 z-50 bg-black/50  (fade in/out)
Content:  fixed centered, max-w-[calc(100%-2rem)], rounded-lg p-6
          animate: fade + zoom-in-95 / zoom-out-95
Close:    absolute top-4 right-4, XIcon
```

#### Slider
```
Track:    bg-muted h-4 rounded-full
Range:    bg-primary
Thumb:    size-4 rounded-full border-primary bg-background
          hover/focus: ring-4
```

#### Switch
```
Size:     h-[1.15rem] w-8 rounded-full
Checked:  bg-primary
Unchecked: bg-switch-background (#cbced4)
Thumb:    size-4 rounded-full, translates on state change
```

#### Progress
```
Track:    h-2 rounded-full bg-primary/20
Fill:     bg-primary, translateX animation
```

#### Tabs
```
TabsList:    bg-muted h-9 rounded-xl p-[3px]
TabsTrigger: active → bg-card border; rounded-xl text-sm font-medium
```

#### Skeleton
```
bg-accent animate-pulse rounded-md
```

#### BackButton (app-specific, not shadcn)
```
40×40 circle, active:scale-95
Light: bg-white/60, icon text-[#8d654c]
Dark:  bg-[#2a2218], icon text-[#ece5de]
```

#### Toaster (Sonner)
Themed via `next-themes`. CSS vars passed in:
```
--normal-bg:     var(--popover)
--normal-text:   var(--popover-foreground)
--normal-border: var(--border)
```

---

### Two Design System Layers

The codebase has two coexisting palettes that **do not share tokens**:

1. **Shadcn/ui semantic system** — `--primary`, `--background`, `--muted`, etc. Used by all `src/components/ui/` components. Properly tokenized and dark-mode-aware.

2. **MindCheck brand palette** — `#1a1410`, `#ece5de`, `#8d654c`, `#2a2218`. Used inline in app-level components (`CheckInHub`, `CheckInFlow`, `BackButton`, etc.) via Tailwind arbitrary values like `bg-[#1a1410]`. Not tokenized — changes must be made by searching for each hex value.
