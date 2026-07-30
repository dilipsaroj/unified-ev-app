# EV Prototype — Design System

> Version 1.0 | Companion to `caas_prototype_feature_spec.md` | For V1 vision prototype

The design system is deliberately small. Every token in this document maps 1:1 to a CSS variable in `globals.css` and a Tailwind theme entry in `tailwind.config.ts`. Don't add tokens ad-hoc in components — extend the system and rebuild.

---

## Design principles

Five rules that decide every design choice in this app.

1. **Reliability is the hero.** Every screen must surface reliability. Color the map pins by tier. Show the score on every station card. Never bury it below the fold.
2. **Feel premium, not corporate.** Airbnb / Tesla / Ather aesthetic, not TCS / bank-app aesthetic. Generous whitespace, real photos, real numbers, no stock icons.
3. **Motion sells.** Animate the session screen (kWh ticking, dial sweep). Animate the settlement (hold → capture → refund). Static screenshots kill the demo.
4. **One CTA per screen.** The primary action should be unmissable. Every other button is secondary.
5. **Indian context, global polish.** ₹ symbol, kWh not "kilowatt-hours", CPO names spelled correctly (Tata Power, Jio-bp, Statiq, HPCL, IOCL, BPCL). Type stays crisp, no hindi/regional font fallback needed for V1.

---

## Colors

### Brand

| Token | Hex | Use |
|---|---|---|
| `--color-brand-500` | `#10B981` | Primary CTA, active states, brand marks |
| `--color-brand-600` | `#059669` | CTA hover, pressed |
| `--color-brand-50` | `#ECFDF5` | Brand-tinted backgrounds, badge bg |
| `--color-brand-900` | `#064E3B` | Brand text on light bg |

### Neutral (light theme default)

| Token | Hex | Use |
|---|---|---|
| `--color-bg` | `#FFFFFF` | Page background |
| `--color-surface` | `#FFFFFF` | Card background |
| `--color-surface-2` | `#F5F7FA` | Section separators, muted cards |
| `--color-surface-3` | `#E8ECF1` | Hover, disabled fills |
| `--color-border` | `#E1E6ED` | Card borders, dividers |
| `--color-ink` | `#0F1419` | Primary text |
| `--color-ink-2` | `#3D4A5C` | Secondary text |
| `--color-ink-3` | `#6B7684` | Tertiary text, meta |
| `--color-ink-4` | `#A0AAB8` | Placeholder |

### Session (dark theme, session screen only)

| Token | Hex | Use |
|---|---|---|
| `--color-session-bg` | `#0A0A0F` | Session screen bg |
| `--color-session-surface` | `#14141C` | Session card |
| `--color-session-ink` | `#F5F7FA` | Session primary text |
| `--color-session-accent` | `#34E5A1` | Live values (kWh, ₹, kW) — brighter mint for glow effect |

### Reliability tiers (used on map pins, station cards)

| Token | Hex | Range | Meaning |
|---|---|---|---|
| `--color-tier-green` | `#10B981` | ≥ 90% | Reliable |
| `--color-tier-amber` | `#F59E0B` | 70–89% | Mixed |
| `--color-tier-red` | `#EF4444` | < 70% | Unreliable |
| `--color-tier-unknown` | `#9CA3AF` | insufficient data | No score |

### Semantic

| Token | Hex | Use |
|---|---|---|
| `--color-success` | `#10B981` | Success toast, verified badge |
| `--color-warning` | `#F59E0B` | Warning, wait time > 15min |
| `--color-danger` | `#EF4444` | Errors, out-of-service |
| `--color-info` | `#6366F1` | Route lines on map, info tags |

### CPO brand chips

Small colored dots used next to CPO names in lists. Real brand colors, not our palette.

| CPO | Chip color |
|---|---|
| Tata Power | `#1B4B96` |
| Jio-bp | `#00A550` |
| Statiq | `#7C3AED` |
| HPCL | `#E31E24` |
| IOCL | `#F58220` |
| BPCL | `#FFCB05` |

---

## Typography

**Font stack:** Inter, then system fallback.
```
font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
```

Numeric-heavy displays (session screen) use `font-feature-settings: 'tnum' 1` for tabular figures so digits don't jitter when they tick.

### Type scale

| Token | Size | Line | Weight | Use |
|---|---|---|---|---|
| `--text-display-lg` | 40px | 44px | 700 | Landing headline |
| `--text-display` | 32px | 36px | 700 | Session dial numbers |
| `--text-h1` | 24px | 30px | 600 | Screen titles |
| `--text-h2` | 20px | 26px | 600 | Section headers |
| `--text-h3` | 16px | 22px | 600 | Card titles |
| `--text-body` | 15px | 22px | 400 | Body copy |
| `--text-sm` | 13px | 18px | 400 | Meta, captions |
| `--text-xs` | 11px | 14px | 500 | Micro labels, badges |
| `--text-cta` | 15px | 20px | 600 | Button text |

Letter-spacing: -0.01em on display sizes, 0 on body, +0.02em on all-caps micro labels.

---

## Spacing

4px base grid. Use these tokens only.

| Token | Value |
|---|---|
| `--space-1` | 4px |
| `--space-2` | 8px |
| `--space-3` | 12px |
| `--space-4` | 16px |
| `--space-5` | 20px |
| `--space-6` | 24px |
| `--space-8` | 32px |
| `--space-10` | 40px |
| `--space-12` | 48px |
| `--space-16` | 64px |

Screen edge padding: `--space-4` (16px) on mobile, `--space-6` on tablet+.
Card internal padding: `--space-5` (20px).
Section vertical rhythm: `--space-8` (32px) between distinct sections.

---

## Radius

| Token | Value | Use |
|---|---|---|
| `--radius-sm` | 6px | Chips, small tags |
| `--radius-md` | 10px | Inputs, small cards |
| `--radius-lg` | 14px | Cards, buttons |
| `--radius-xl` | 20px | Sheets, modals |
| `--radius-2xl` | 28px | Hero surfaces, dial |
| `--radius-pill` | 999px | Pill buttons, filter chips |

---

## Shadow / elevation

Subtle. Never harsh.

| Token | Value | Use |
|---|---|---|
| `--shadow-sm` | `0 1px 2px rgba(15, 20, 25, 0.04)` | Cards at rest |
| `--shadow-md` | `0 4px 12px rgba(15, 20, 25, 0.06), 0 2px 4px rgba(15, 20, 25, 0.04)` | Elevated cards, sheets |
| `--shadow-lg` | `0 12px 32px rgba(15, 20, 25, 0.10), 0 4px 8px rgba(15, 20, 25, 0.06)` | Modals, floating action button |
| `--shadow-glow-brand` | `0 0 24px rgba(16, 185, 129, 0.25)` | Live session dial (dark theme only) |

---

## Components

Each component is a variant on the design tokens above. Don't hardcode colors in components; use CSS variables or Tailwind classes.

### Button

Three variants: `primary`, `secondary`, `ghost`.

**Primary** — one per screen. Brand green fill, white text, `--radius-lg`, height 52px on mobile, full width by default. Optional icon on the left.

**Secondary** — outline in ink-2, ink-2 text, `--radius-lg`, height 44px.

**Ghost** — no fill, no border, brand-500 text, height 44px. Use for tertiary actions inside cards.

States: hover (subtle bg shift), pressed (scale 0.98), disabled (surface-3 bg, ink-4 text).

### Filter chip

Pill-shaped. Height 32px. Padding 12/16px. `--radius-pill`. Two states:
- Inactive: `--color-surface-2` bg, `--color-ink-2` text, `--color-border` outline
- Active: `--color-brand-500` bg, white text, no outline

Multiple chips scroll horizontally without wrapping on mobile.

### Station card (in map bottom sheet, in list views)

Layout:
```
[reliability badge]   [distance]
[station name — h3]
[CPO chip • CPO name]
[connector row: types + max kW • price]
[recommendation reason — sm italic, if present]
```
Padding: `--space-5`. `--radius-lg`. `--shadow-sm`. On tap: `--shadow-md`.

Reliability badge in top-left is a colored circle (16px) with the score inside in `--text-xs` weight 600 white text. Color from reliability tier.

### Reliability score display (station detail hero)

Big. Take 40% of the screen above the fold on station detail.
- Big number: `--text-display` (32px), weight 700, colored by tier
- "% reliability" suffix in `--text-body`, `--color-ink-2`
- Below: `--text-sm` `--color-ink-3` — "Based on 1,247 sessions in the last 30 days"
- Below: `--text-sm` — colored dot + "Last confirmed working 12 min ago"

### Session dial

Circular SoC meter. 280px diameter on mobile.
- Track: `--color-session-surface`, 16px stroke
- Fill: `--color-brand-500` with `--shadow-glow-brand`, animates from current % to target
- Inside: SoC % as `--text-display-lg`, weight 700, `--color-session-ink`
- Below the dial: three stat pills side by side — kWh delivered, ₹ accrued, kW power

### Bottom sheet

Sticks to bottom of viewport. Rounded top: `--radius-xl` top corners.
- Drag handle: 40px wide, 4px tall, `--color-surface-3`, top-centered, 8px from top
- Snap points: peek (30% viewport), half (60%), full (95%)
- Content padding: `--space-4` horizontal, `--space-6` top

### Map pin

Three visual weights based on reliability tier:
- Green: filled circle, `--color-tier-green`, 32px, thin white border
- Amber: filled circle, `--color-tier-amber`, 32px, thin white border
- Red: filled circle, `--color-tier-red`, 28px, thin white border

Selected pin: 1.25× scale, `--shadow-md`.

Inside each pin: a small connector-type letter (D for DC, A for AC) in white, 12px weight 700.

### Bottom nav

5 tabs: Map / Route / Scan / Passport / Profile. Height 64px.
- Scan is the center tab, elevated as a floating brand-colored button (56px circle, `--shadow-lg`), sitting 12px above the nav bar. This makes it the primary action from anywhere in the app.
- Other tabs: 24px icon + 11px label. Active state: brand-500 icon + label. Inactive: ink-3.

---

## Motion

Use `cubic-bezier(0.2, 0.8, 0.2, 1)` (a smooth ease-out) for almost everything.

| Motion | Duration | Ease |
|---|---|---|
| Button press | 100ms | ease-out |
| Tap-to-open (station detail) | 320ms | cubic-bezier(0.2, 0.8, 0.2, 1) |
| Bottom sheet snap | 240ms | cubic-bezier(0.2, 0.8, 0.2, 1) |
| Live number tick (session) | 400ms | linear |
| SoC dial fill (session) | 800ms | cubic-bezier(0.2, 0.8, 0.2, 1) |
| Settlement animation (hold→capture→refund) | 2000ms total, 3 keyframes | ease-in-out |

Use `framer-motion` for anything above 240ms. CSS transitions for the rest.

---

## Iconography

Use `lucide-react`. It's clean, huge coverage, small bundle.

Sizes: 20px inline with body, 24px in nav and buttons, 32px in feature illustrations.

Never use emoji as functional UI. Emoji is fine in one place: the CO₂-saved counter on the passport (🌱 badge).

---

## Accessibility floor

Non-negotiable even for the prototype.

- All text ≥ 4.5:1 contrast against its background
- All interactive elements ≥ 44×44px hit target
- Focus rings visible (2px `--color-brand-500` outline, `outline-offset: 2px`)
- Motion-reduce media query respected — freeze all animations to end state
- Alt text on all station photos and CPO logos

---

## Screen layout template

Mobile-first. On desktop, wrap the whole app in a phone-shaped frame (max-width 420px, centered, subtle device chrome) so investors see the intended form factor.

```
+─────────────────────────────────+
│  Status bar (mocked, dark ink)  │  44px
├─────────────────────────────────┤
│  Header (title / back / action) │  56px
├─────────────────────────────────┤
│                                 │
│         Screen content          │  flex-1
│         (scrollable)            │
│                                 │
├─────────────────────────────────┤
│  Bottom nav (5 tabs)            │  64px + 12px scan lift
+─────────────────────────────────+
```

Session screen breaks the template: no bottom nav, dark theme, full-bleed.
Landing screen breaks the template: no header, no nav, hero + CTA only.
