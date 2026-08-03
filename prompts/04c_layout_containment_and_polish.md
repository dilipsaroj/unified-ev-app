# Cursor Prompt 04c — Layout Containment + UX Polish

> Run this **after Prompt 04b is complete** (gap fixes merged).
> Run this **before Prompt 05** (Week 5 Tier A).
> This is a **layout pass** — fixes the single biggest visual problem in the deployed build: the app renders full-width on desktop instead of inside a phone frame. No new features, no new screens.

---

You are fixing the layout containment of Unified-EV so the app renders as a **mobile-first PWA** on all viewports. Currently on desktop it stretches to the full browser width (~2000px), which makes the map enormous, the bottom sheet stretch across the entire screen, and Station Detail's photo carousel spread 3 blocks across a hero-banner width. This kills demo credibility.

The design system doc (`docs/design/design_system.md`) explicitly specifies this — it was missed during initial scaffolding.

## Read these files before starting

- **`docs/design/design_system.md`** — Section "Screen layout template" — explains: *"On desktop, wrap the whole app in a phone-shaped frame (max-width 420px, centered, subtle device chrome) so investors see the intended form factor."*
- **`docs/mockup.html`** and **`docs/mockup_variants.html`** — visual reference for how the phone frames should look on desktop
- **`docs/02_Layer_1_V1_Prototype.md`** — Section 6, "Faking 'live'" — bottom sheet snap point spec (peek 30% / half 60% / full 95%)

## Scope for this session — 4 discrete fixes

Do NOT scope-creep. This session ONLY does the following, in order:

---

### 1. Add phone-frame wrapper at root layout (2 hours) — the biggest fix

**File:** `src/app/layout.tsx`

Wrap `{children}` in a two-layer container:

- **Outer:** dark backdrop that fills the desktop viewport around the phone frame. On mobile, no backdrop (frame IS the viewport).
- **Inner (the phone frame):** max-width 420px on desktop, full width on mobile. Rounded corners + subtle device chrome (border + shadow) on desktop only. Contains the app itself.

Implementation sketch:

```tsx
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>{/* existing meta tags stay */}</head>
      <body>
        {/* Outer backdrop — visible only on desktop */}
        <div className="min-h-screen bg-neutral-950 sm:flex sm:items-center sm:justify-center sm:p-6 md:p-10">
          {/* Phone frame — full viewport on mobile, contained on desktop */}
          <div
            className="
              relative
              w-full h-[100dvh]
              sm:w-[420px] sm:h-[900px]
              sm:max-h-[calc(100dvh-3rem)]
              sm:rounded-[36px] sm:overflow-hidden
              sm:shadow-[0_30px_60px_rgba(0,0,0,0.5),0_10px_20px_rgba(0,0,0,0.3)]
              sm:ring-1 sm:ring-neutral-800
              flex flex-col
            "
            style={{ background: 'var(--color-bg)' }}
          >
            {children}
          </div>
        </div>
      </body>
    </html>
  );
}
```

**Key details to get right:**

- Use `100dvh` (dynamic viewport height) not `100vh` — accounts for mobile browser chrome (Safari bottom bar, Chrome address bar).
- The `sm:` breakpoint is Tailwind's 640px — below that (real mobile), no phone frame, no backdrop, full viewport.
- The inner frame is `flex flex-col` so children (screen content + bottom nav) stack vertically and can each use `flex-1` or fixed heights.
- The frame background respects the user's theme via `var(--color-bg)` — light mode = white, dark mode = charcoal. Regardless, the outer backdrop stays `bg-neutral-950` on desktop so the frame pops.
- No fake notch or status bar hardware chrome — keep it clean like the mockups. The `ring-1 ring-neutral-800` + `shadow` + `rounded-[36px]` is enough visual chrome to signal "this is a phone."

**Verify on desktop:** open at 1440×900 viewport. Should see a dark surrounding backdrop with a 420px phone-shaped container centered. Everything inside the frame should look coherent and mobile-scaled.

**Verify on mobile:** open at 390×844 viewport (iPhone 14 default). Should see no backdrop, full-width app, exactly as before this change.

---

### 2. Fix Station Detail photo carousel (1 hour)

**Symptom:** Currently the 3 gradient photo blocks (Entrance / Connector / Parking) render side-by-side spread across the full width. On desktop that's ~2000px; even after the phone-frame fix in Step 1, they'll be 3 tiny blocks squeezed into 420px.

**Fix:** convert to a horizontal-scroll carousel where each photo is ~85% of the phone width, with snap-align.

**File:** `src/components/station/StationPhotoCarousel.tsx` (or wherever the carousel renders in Station Detail)

Replace the current 3-column grid layout with:

```tsx
<div className="relative">
  <div
    className="
      flex gap-3 overflow-x-auto pb-3
      snap-x snap-mandatory scroll-smooth
      scrollbar-hide
    "
    style={{ scrollbarWidth: 'none' }}
  >
    {photos.map((photo) => (
      <div
        key={photo.id}
        className="
          relative flex-shrink-0
          w-[85%] h-[220px]
          rounded-2xl overflow-hidden
          snap-center
        "
        style={{ background: gradientFromUrl(photo.url) }}
      >
        {/* Caption chip bottom-left */}
        <div className="absolute bottom-3 left-3 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-sm text-white text-xs font-medium">
          {photo.caption}
        </div>
        {/* Zap icon bottom-right */}
        <div className="absolute bottom-3 right-3 text-white/70">
          <Zap size={20} />
        </div>
      </div>
    ))}
  </div>
  {/* Pagination dots below */}
  <div className="flex justify-center gap-1.5 mt-2">
    {photos.map((_, i) => (
      <div key={i} className="w-1.5 h-1.5 rounded-full bg-neutral-400" />
    ))}
  </div>
</div>
```

Hide the horizontal scrollbar visually with `scrollbar-hide` — if that Tailwind utility isn't in the config, add to `globals.css`:

```css
.scrollbar-hide::-webkit-scrollbar { display: none; }
.scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
```

**Result:** on both desktop (inside phone frame) and mobile, users see one photo at a time with a peek of the next one, swipeable/scrollable horizontally. Matches the Airbnb-style listing pattern from the mockups.

---

### 3. Verify + fix bottom sheet snap points on Map (2 hours)

**Symptom:** The bottom sheet on `/map` currently expands to cover most of the map and doesn't have proper snap points. Spec calls for three snap positions: **peek 30%** (default, list peeks), **half 60%** (user pulls up to browse), **full 95%** (nearly full-screen for detailed browsing).

**File:** `src/components/map/MapBottomSheet.tsx` (or wherever the bottom sheet component lives)

**Implementation approach — framer-motion driven, no new dependencies:**

```tsx
'use client';
import { motion, useMotionValue, useAnimation, PanInfo } from 'framer-motion';
import { useEffect, useRef } from 'react';

const SNAP_POINTS = [0.7, 0.4, 0.05]; // relative to viewport height — 30% shown, 60% shown, 95% shown

export function MapBottomSheet({ children }: { children: React.ReactNode }) {
  const controls = useAnimation();
  const containerRef = useRef<HTMLDivElement>(null);
  const y = useMotionValue(0);

  useEffect(() => {
    // Initial snap to peek position
    const h = containerRef.current?.parentElement?.clientHeight ?? 800;
    controls.start({ y: h * SNAP_POINTS[0] });
  }, [controls]);

  function handleDragEnd(_: PointerEvent, info: PanInfo) {
    const h = containerRef.current?.parentElement?.clientHeight ?? 800;
    const currentY = y.get();
    // Find closest snap point
    const closest = SNAP_POINTS.reduce((prev, curr) =>
      Math.abs(h * curr - currentY) < Math.abs(h * prev - currentY) ? curr : prev
    );
    controls.start({ y: h * closest, transition: { type: 'spring', damping: 30, stiffness: 300 } });
  }

  return (
    <motion.div
      ref={containerRef}
      className="absolute inset-x-0 bottom-0 bg-surface rounded-t-3xl shadow-2xl z-10"
      style={{ y, height: '100%', touchAction: 'none' }}
      drag="y"
      dragConstraints={{ top: 0, bottom: 0 }}
      dragElastic={0.1}
      animate={controls}
      onDragEnd={handleDragEnd}
    >
      {/* Drag handle */}
      <div className="flex justify-center pt-2 pb-3">
        <div className="w-10 h-1 rounded-full bg-neutral-400" />
      </div>
      <div className="overflow-y-auto h-full pb-24 px-4">{children}</div>
    </motion.div>
  );
}
```

**Notes:**

- Use `y` motion value + `useAnimation` controls so drag and programmatic snap coexist.
- `dragConstraints` prevents overscroll beyond peek and full positions.
- `SNAP_POINTS` are inverse fractions — `0.7` means "top of sheet is 70% down the viewport, so sheet shows 30%."
- On drag end, snap to nearest of the 3 positions with a spring animation.
- The scrollable list inside the sheet (`overflow-y-auto h-full`) allows independent scrolling of station cards once the sheet is expanded.

**Alternative if framer-motion drag is fighting you:** the `vaul` npm package is purpose-built for this and small (~6KB). But this violates the "no new dependencies" rule. Attempt framer-motion first. Only fall back to vaul if the manual implementation eats more than 3 hours.

**Test on desktop and mobile:** the sheet should peek at ~30% by default, drag up snaps to half, drag up more snaps to full. Drag down from any position snaps to the nearest lower position.

---

### 4. Independent scroll containers on each screen (1 hour)

**Symptom:** on some screens, scrolling the content also scrolls the bottom nav or the whole page, feeling janky.

**Fix:** structure every screen as:

```tsx
<div className="flex flex-col h-full">
  {/* Optional header (fixed) */}
  <header className="flex-shrink-0">...</header>

  {/* Main scrollable content */}
  <main className="flex-1 overflow-y-auto">...</main>

  {/* Bottom nav is OUTSIDE the screen — lives in layout, don't duplicate */}
</div>
```

Screens to audit and fix (if not already):

- `src/app/map/page.tsx` — map fills, sheet overlays; no page-level scroll
- `src/app/station/[id]/page.tsx` — scrollable content, fixed bottom CTA
- `src/app/passport/page.tsx` — scrollable content
- `src/app/profile/page.tsx` — scrollable content
- `src/app/route/page.tsx` — map at top, cards scrollable below

Confirm bottom nav is rendered once at the layout level (not duplicated per screen). If it's currently in every page, hoist to the frame layout.

---

## Tech decisions — LOCKED

- No new dependencies (`vaul` allowed as fallback only if framer-motion approach fails after 3 hours)
- No new screens
- No design token changes
- No changes to Zustand state
- No changes to Google Maps integration

## Success criteria

1. `pnpm tsc --noEmit` returns zero errors
2. `pnpm lint` returns zero errors
3. `pnpm build` succeeds
4. **On desktop (1440×900 viewport):** app renders inside a 420px phone frame, centered, dark backdrop around it. NOT stretched full-width.
5. **On mobile (390×844 viewport):** app fills the viewport, no visible frame or backdrop.
6. **Station Detail photo carousel:** shows ONE photo at ~85% width with a peek of the next; horizontal scroll works.
7. **Map bottom sheet:** peeks at 30% by default; dragging up snaps to half (60%); dragging up more snaps to full (95%); drag down snaps back.
8. **Independent scroll:** the bottom nav stays fixed at the bottom of the frame while content scrolls above it.
9. **Existing Weeks 1–4 functionality still works end-to-end** (no regressions).
10. Theme toggle still works in the frame (light/dark).

## What NOT to do in this session

- Do NOT add device notch, status bar, or hardware button graphics — the frame should be clean (rounded corners + subtle border + shadow only, matching mockups)
- Do NOT add a "download our app" banner or App Store CTA — this is the app, not a landing for one
- Do NOT redesign any screen
- Do NOT touch the design tokens
- Do NOT add Bharat AC/DC, 2W/3W, WhatsApp, RuPay, CDR, refund policy (all Week 5 territory)
- Do NOT refactor Profile or Passport to use Tailwind classes (deferred to a separate refactor pass)

## When to stop and ask

- If the framer-motion drag/snap approach for the bottom sheet consistently fights you after 2 hours — pause, and I'll approve adding `vaul` as an exception.
- If any Week 1–4 screen breaks visually inside the frame in a way that requires component rewrites (not just container CSS).
- If the phone-frame wrapper interacts poorly with the theme toggle (e.g., outer backdrop changes with the theme when it shouldn't).

## Style expectations

- Use Tailwind utility classes (per the style guardrail noted in 04b) for all new layout code
- Suggested atomic commits:
  - Commit 1: `feat(layout): add phone-frame wrapper for desktop viewport containment`
  - Commit 2: `fix(station): convert photo carousel to horizontal scroll with snap`
  - Commit 3: `feat(map): implement bottom sheet snap points via framer-motion`
  - Commit 4: `refactor(layout): enforce independent scroll containers per screen`
- Do NOT commit or push at the end — Dilip will review the diff first

## Deliverable

A `pnpm dev` session where:
- Desktop viewport shows the app inside a clean 420px phone frame with dark backdrop
- Mobile viewport shows the app filling the screen as before
- Station Detail photos scroll horizontally, one at a time
- Map bottom sheet has three functional snap points
- Every screen scrolls independently under a fixed bottom nav

Run `git status` when done. Do not push. Send me before/after screenshots at 1440×900 desktop viewport for verification.

Go.
