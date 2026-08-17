# Cursor Prompt 08 — Logo & Favicon Integration

> Working folder: `/Users/dilipkumarsaroj/Desktop/Projects/Unified-EV/`
> Two SVG files already exist in `public/` — wire them up across the app.
> No design changes. No new screens. Just integration.

---

## What already exists

- `public/favicon.svg` — 512×512 SVG app icon (green background, charging plug + lightning bolt)
- `public/logo.svg` — 280×80 SVG horizontal wordmark (icon + "Unified" + "EV" text)

---

## Change 1 — Favicon in layout.tsx (10 minutes)

**File:** `src/app/layout.tsx`

Find the existing `<head>` metadata section. Add SVG favicon and Apple touch icon references:

```tsx
export const metadata: Metadata = {
  // ... existing metadata ...
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
    ],
    apple: '/favicon.svg',
  },
}
```

If `icons` is already defined, replace it entirely with the above.

Also ensure the viewport metadata has `themeColor`:
```tsx
export const viewport: Viewport = {
  themeColor: '#10b981',
  // ... rest of existing viewport config ...
}
```

---

## Change 2 — Replace text logo in header/navbar (15 minutes)

Search the codebase for any hardcoded "Unified-EV" text used as a logo/brand mark in the top navigation or header. It will likely be in one of:
- `src/components/layout/Header.tsx` (if it exists)
- `src/app/layout.tsx`
- `src/app/map/page.tsx`
- `src/app/onboarding/page.tsx`

Replace any text-based logo with the SVG:

```tsx
import Image from 'next/image'

<Image
  src="/logo.svg"
  alt="Unified-EV"
  width={140}
  height={40}
  priority
/>
```

Use `width={140} height={40}` to maintain aspect ratio at nav bar size. If no text logo exists and the app name appears nowhere in headers, skip this change.

---

## Change 3 — Update manifest icons (10 minutes)

**File:** `public/manifest.json`

Add the SVG icon entry alongside existing PNG entries:

```json
{
  "icons": [
    {
      "src": "/favicon.svg",
      "sizes": "any",
      "type": "image/svg+xml",
      "purpose": "any maskable"
    },
    {
      "src": "/icons/icon-192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/icons/icon-512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any maskable"
    }
  ]
}
```

---

## Change 4 — Onboarding splash logo (15 minutes)

**File:** `src/app/onboarding/page.tsx`

The onboarding landing screen likely shows the app name as text. Replace it with the SVG logo centered on screen:

```tsx
import Image from 'next/image'

<Image
  src="/logo.svg"
  alt="Unified-EV"
  width={200}
  height={57}
  priority
  style={{ marginBottom: 'var(--space-6)' }}
/>
```

Remove any existing `<h1>` or `<p>` tags that spell out "Unified-EV" as plain text in this screen only.

---

## Success criteria

1. `pnpm tsc --noEmit` → zero errors
2. `pnpm build` → succeeds
3. Manual check at 420px phone-frame width:
   - Browser tab shows the green charging plug favicon (not default Next.js icon)
   - Onboarding screen shows the SVG logo, not plain text
   - If logo appears in any header, it renders as the SVG wordmark
   - Logo is crisp on both light and dark theme

---

## What NOT to do

- Do NOT generate PNG versions — SVG works across all screen densities
- Do NOT change any colors — brand green `#10b981` is already baked into the SVG files
- Do NOT modify the SVG files themselves
- Do NOT add the logo to every screen — only onboarding splash and any existing header

## Suggested commits

- `feat(brand): add SVG favicon and logo, wire into layout and onboarding`

Run `git status` when done. Do not push — Dilip will review first.

Go.
