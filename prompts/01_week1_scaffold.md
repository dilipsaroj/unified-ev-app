# Cursor Prompt — Unified-EV, Week 1: Project Scaffold + Map Screen

> Copy everything below the `---` and paste into Cursor's Composer.
> Working folder: `/Users/dilipkumarsaroj/Desktop/Projects/Unified-EV/`
> Git remote already set up: `https://github.com/dilipsaroj/unified-ev-app.git`

---

You are helping me build **Unified-EV** — a mobile-first PWA prototype for Indian EV drivers that unifies charging across every CPO (Tata Power, Jio-bp, Statiq, HPCL, Indian Oil, Bharat Petroleum) with a trustworthy reliability score on every charger.

## Read these files FIRST — do not write any code before reading them

They live in `./docs/` in this repo. All architectural decisions are made in these docs; you are implementing, not re-deciding.

1. **`docs/01_MVP_Overview.md`** — what the product is, why it exists, the reliability-as-moat insight, competitor comparison
2. **`docs/02_Layer_1_V1_Prototype.md`** — the entire Layer 1 build plan. Folder structure, stack, DataClient pattern, week-by-week screens. This is your primary reference.
3. **`docs/03_Layer_2_Post_Pilot.md`** — read only to understand what V1 data shapes must be compatible with. Do not implement any Layer 2 code.
4. **`docs/design/design_system.md`** — colors, typography, spacing, radius, shadow, component tokens. Every token you use must come from here.
5. **`docs/mockup.html`** — visual reference for **Direction A (light theme)**. Open in a browser to see the intended look.
6. **`docs/mockup_variants.html`** — visual reference for **Direction B (dark theme)**. Ignore Direction C (Warm Indian); it was dropped from V1.

If any decision in a file below contradicts the docs, the docs win. If two docs conflict, `01_MVP_Overview.md` and `02_Layer_1_V1_Prototype.md` are the source of truth.

## What this session builds — Week 1, Days 1–7

Project scaffold + Map screen with seeded stations. That's it. **Do not attempt to build the whole 4-week app in one pass** — later sessions handle Station Detail, Scan, Session, Route Planner, Passport, and Profile screens.

Deliverables for this session:

1. **Project initialization**
   - Work inside this folder — `Unified-EV/` is the git repo (local folder name intentionally differs from remote name).
   - **Before scaffolding, reorganize existing docs:** `mv DOCS docs && mkdir -p docs/design && mv docs/design_system.md docs/mockup.html docs/mockup_variants.html docs/design/`. This aligns paths with the rest of the docs.
   - `git init` if `.git/` doesn't exist. `git remote add origin https://github.com/dilipsaroj/unified-ev-app.git`.
   - `pnpm create next-app@latest .` in this folder (latest, not pinned to 14 — Next 15 is fine). Choose: TypeScript, App Router, Tailwind, src/ directory, ESLint, no import alias customization (default `@/*` is fine). Use pnpm (not npm, not yarn).
   - Add `.gitignore` entries for `.env.local`, `.next/`, `node_modules/`, `pnpm-lock.yaml` stays committed.
   - Confirm `pnpm dev` starts cleanly on `http://localhost:3000`.

2. **Install the exact V1 dependencies from `docs/02_Layer_1_V1_Prototype.md` Section 2:**
   - Runtime: `zustand`, `@vis.gl/react-google-maps`, `framer-motion`, `lucide-react`, `next-pwa`, `recharts`, `zod`
   - Fonts via `next/font/google`: `Inter` (weights 400/500/600/700). **Do NOT install Instrument Serif** — only the dropped Direction C used it; A and B don't need it.
   - Dev: `@types/node` if `create-next-app` didn't include it; otherwise nothing beyond what's already added
   - **Do not add any dependency not listed above.** If you think one is needed, stop and ask.

3. **Folder structure — exactly as specified in `docs/02_Layer_1_V1_Prototype.md` Section 3.** Create the empty directories now so future sessions have consistent placement:
   ```
   src/
   ├── app/                    (Next.js App Router — routes go here)
   ├── components/
   │   ├── ui/                 (Button, Chip, Card, BottomSheet, Modal)
   │   ├── station/            (StationCard, StationPin, ReliabilityBadge)
   │   ├── session/            (SoCDial, LiveStat, PowerDial)
   │   ├── map/                (MapCanvas, FilterChips, SearchBar)
   │   └── layout/             (StatusBar, Header, BottomNav, ThemeToggle)
   ├── data/                   (seed JSON files)
   ├── lib/
   │   ├── data/               (DataClient interface + mock/api implementations)
   │   ├── recommend.ts
   │   ├── reliability.ts
   │   ├── mock-session.ts     (empty in this session — later)
   │   ├── mock-payment.ts     (empty in this session — later)
   │   └── format.ts
   ├── stores/                 (userStore, sessionStore, mapStore, passportStore)
   ├── hooks/
   ├── styles/
   │   └── globals.css
   └── env.ts
   ```

4. **Design tokens → Tailwind + globals.css**
   - Copy every token from `docs/design/design_system.md` into `tailwind.config.ts` under `theme.extend` (colors, spacing, borderRadius, boxShadow, fontFamily, fontSize).
   - Duplicate the same tokens as CSS variables in `src/styles/globals.css` under two selectors: `:root` (light theme values) and `[data-theme='dark']` (dark theme values).
   - Import globals in `src/app/layout.tsx`.
   - Light theme values come from `mockup.html`. Dark theme values come from `mockup_variants.html` Direction B (NOT Direction C — dropped).

5. **Theme system (light + dark toggle)**
   - The whole app supports light and dark modes, toggleable by the user.
   - On first load: read `prefers-color-scheme` and set `data-theme` on `<html>` accordingly.
   - Persist user's explicit choice to `localStorage['theme']` when they toggle.
   - Toggle control lives in Profile screen (which we don't build this session — just leave a stub button in the nav for now that flips the theme).
   - CSS variables + `[data-theme='dark']` selector means swapping modes is a single attribute change — no component re-mounting.
   - Session screen (built later) will always render in dark mode regardless of app-level toggle — but don't build that logic yet.

6. **DataClient adapter pattern — the single most important part of this session**
   - Implement exactly as `docs/02_Layer_1_V1_Prototype.md` Section 4 specifies.
   - `src/lib/data/types.ts` — full `DataClient` interface + all input/output types (Station, Connector, Session, User, Review, etc.). Match the schema shapes from `docs/03_Layer_2_Post_Pilot.md` Section 6 exactly — every entity has the same field names it will have in Postgres later.
   - `src/lib/data/mockClient.ts` — implementation that reads from `src/data/*.json` and returns promises with 150–400ms artificial delay. Subscription methods use `setInterval` for fake live updates.
   - `src/lib/data/apiClient.ts` — every method throws `Error('apiClient not implemented in V1 — see Layer 2 doc')`. This is a placeholder for Layer 2.
   - `src/lib/data/index.ts` — exports `dataClient` picked based on `process.env.NEXT_PUBLIC_DATA_MODE`.
   - **No component in the app is ever allowed to import from `mockClient` directly or read JSON directly. All data access goes through `dataClient` via a hook.** This is non-negotiable.

7. **Seed JSON — small set for this session, expand later**
   - `src/data/cpos.json` — 6 CPOs (Tata Power, Jio-bp, Statiq, HPCL, IOCL, BPCL) with id, name, logoUrl, chipColor, protocol per the schema
   - `src/data/stations.json` — **8 Mumbai stations** with real coordinates (grab from OpenChargeMap or use plausible Mumbai coords). Distributed across CPOs.
   - `src/data/connectors.json` — 2 connectors per station (16 total), mix of CCS_2 (50 kW) and TYPE_2_AC (22 kW), prices ₹14.5–₹22/kWh
   - `src/data/reliability.json` — one row per connector. Distribute: ~50% green (>90%), ~35% amber (70–89%), ~15% red (<70%). Include realistic sample sizes (200–1500) and `lastConfirmedAt` timestamps in the last 6 hours.
   - `src/data/reviews.json` — 2 reviews per station (16 total). Realistic Indian names (Anish, Priya, Rohan, Neha, etc.), verified badge on all (they must be seeded with `is_curated: true` — see reviews policy in `01_MVP_Overview.md`). Text should sound like real EV owners: "Both CCS2 working, cable a bit stiff", "Café next door, security helpful", "Parking blocked one weekend — has since improved."
   - **Every JSON row must include `cpoId` where applicable.** Multi-tenant shape from day one.

8. **Zustand stores — thin stubs for this session, filled out later**
   - `src/stores/userStore.ts` — persisted to localStorage via Zustand `persist` middleware. Fields: `currentUser`, `currentVehicle`, `login`, `logout`. This session: return a hardcoded demo user so screens don't break.
   - `src/stores/mapStore.ts` — not persisted. Fields: `center`, `zoom`, `filters { availableOnly, connectorTypes, minReliability }`, `selectedStationId`, actions to update each.
   - `src/stores/sessionStore.ts` — empty scaffold, no active session logic yet.
   - `src/stores/passportStore.ts` — empty scaffold.
   - `src/stores/themeStore.ts` — theme state (`'light' | 'dark' | 'system'`), reads/writes `data-theme` attribute + localStorage.

9. **App shell + Bottom Navigation**
   - `src/app/layout.tsx` — sets fonts, viewport (mobile-first), PWA meta tags, applies theme from localStorage on mount.
   - `src/app/page.tsx` — for this session, redirects to `/map`. (Later sessions will replace with a Landing page.)
   - `src/components/layout/BottomNav.tsx` — five tabs as per design system: Map, Route, Scan (elevated center button), Passport, Profile. Active state styled from design tokens. Route to placeholder pages for tabs we haven't built.
   - Placeholder pages: `src/app/route/page.tsx`, `src/app/passport/page.tsx`, `src/app/profile/page.tsx` — each shows a simple "Coming soon" state styled with the design system so it doesn't look broken. Profile page includes the theme toggle so we can test light/dark now.

10. **Map screen — `/map`**
    - Route: `src/app/map/page.tsx`
    - Uses `@vis.gl/react-google-maps` with a `<Map>` centered on Mumbai (19.076, 72.877), default zoom ~12.
    - `<AdvancedMarker>` for each station pin. Color by reliability tier from `docs/design/design_system.md`: green (≥90%), amber (70–89%), red (<70%). Connector-type letter (D/A) shown white in pin center.
    - Search bar sticky at top: styled per design, no functionality yet (just visual).
    - Filter chips row below search: `Available now`, `DC fast`, `≥ 90% reliable`, `< ₹15/kWh` — chip toggle updates `mapStore.filters` and re-filters visible pins.
    - Bottom sheet using `framer-motion`: three snap points (peek 30%, half 60%, full 95%). Contains the ranked list of stations from `dataClient.getStationsNear(...)` sorted by `recommend.ts` scoring.
    - `StationCard` component in the sheet: reliability badge (colored circle with % inside), station name, distance, CPO chip + name, connector summary, price. If station is recommended over nearest, show italic "recommendation reason" line (see `01_MVP_Overview.md` Section 7 for examples).
    - Tapping a pin: selects the station (updates `mapStore.selectedStationId`), pin scales 1.25×, sheet snaps to half.
    - Tapping a station card: `router.push('/station/[id]')` — Station Detail page is not built yet, so navigation will land on a Next.js 404. That's fine for this session; leave a placeholder page that says "Station Detail — next session."

11. **Environment variables** — typed via a small Zod schema in `src/env.ts`
    - `NEXT_PUBLIC_DATA_MODE` — default `'mock'`, values `'mock' | 'api'`
    - `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` — required
    - `NEXT_PUBLIC_ENVIRONMENT` — `'dev' | 'demo' | 'staging' | 'prod'`, default `'dev'`
    - Create `.env.example` with placeholder values and check into git.
    - Create `.env.local` with real values (I'll add my Google Maps API key). Do not commit it.

12. **PWA manifest**
    - `public/manifest.json` per `docs/02_Layer_1_V1_Prototype.md` Section 8.
    - Description: `"Every charger in India. One app. No prepaid wallets."`
    - Theme color: `#10B981` (light) or `#0A0B10` (dark) — Next.js supports theme-color meta based on `prefers-color-scheme`.
    - Placeholder icons in `public/icons/` — solid brand-color squares (192×192 and 512×512) with a white ⚡ character. We'll replace with a real logo later.

## Tech decisions — LOCKED, do not change

- Next.js 14 App Router (never Pages Router)
- pnpm (never npm or yarn)
- TypeScript strict mode
- Tailwind for all styling (never styled-components, never CSS modules, never emotion)
- Zustand for state (never Redux, never Jotai, never Context for global state)
- `@vis.gl/react-google-maps` (never `google-map-react`, never Leaflet, never Mapbox)
- `framer-motion` for animation over 240ms; CSS transitions for shorter
- `lucide-react` for icons (never react-icons, never Heroicons)
- `next-pwa` for service worker + install prompt
- No backend / API server / database / auth in this session (all Layer 2)
- No testing framework in this session

## Design language — Direction A (light) + Direction B (dark)

Both themes must be fully implemented as CSS variables with a `[data-theme='dark']` override. Every component must render correctly in both modes. If a token is missing in either mode, stop and ask before inventing one.

Read the design system doc carefully for spacing, radius, shadow. Do not eyeball values from the mockup HTML — use the tokens.

## Data shape rules (CRITICAL — these make Layer 2 a swap-in, not a rewrite)

- Every entity that could belong to a CPO gets a `cpoId` field (stations, connectors, sessions, reviews, photos).
- Session status enum must be exactly: `INITIATED | PAYMENT_AUTHORIZED | STARTING | ACTIVE | STOPPING | COMPLETED | SETTLED | FAILED`. Even though we don't build the state machine this session, define the enum in `types.ts` now with these exact strings.
- Reliability scores are per-connector, not per-station.
- Reviews always have `sessionId` (except seeded ones which use `is_curated: true` — see reviews policy).
- All timestamps are ISO 8601 strings (`"2026-07-30T12:15:00Z"`).

## Success criteria for this session

Do not consider the session complete unless all of these pass:

1. `pnpm install` succeeds without warnings about missing peers
2. `pnpm dev` starts cleanly and opens on `http://localhost:3000`
3. `/` redirects to `/map`
4. Map centered on Mumbai displays with 8 station pins visible
5. Pins are correctly colored by reliability tier
6. Bottom sheet appears at peek height; tapping a pin snaps it to half
7. Filter chips visually toggle (functionality can be minimal for now — at least `Available now` filter must work)
8. Bottom nav visible; tapping non-Map tabs navigates to placeholder pages
9. Theme toggle on Profile placeholder page actually swaps light/dark and persists across reload
10. `pnpm build` succeeds with zero warnings
11. `pnpm tsc --noEmit` returns zero errors
12. `pnpm lint` returns zero errors

If any fail, report the specific issue clearly rather than papering over it.

## What NOT to build in this session

Refuse to build any of these — they belong to later sessions:

- Landing / Onboarding screens (Week 2)
- Station Detail page content (Week 2 — placeholder route only for now)
- Scan camera view (Week 3)
- Session screen with dial + animation (Week 3)
- UPI / payment sheet mock (Week 3)
- Route Planner (Week 4)
- Charging Passport screen content (Week 4)
- Profile screen full content (Week 2 — theme toggle placeholder is fine)
- Auth / phone OTP flow (Week 2)
- Supabase / any backend code (Layer 2 — forbidden entirely in V1)
- Real API calls of any kind
- Prisma / any ORM
- GraphQL
- Any state management library other than Zustand
- Tests
- CI/CD

If you find yourself wanting to build one of the above "while you're in here," don't. Note it and move on.

## When to stop and ask

- You're about to add any dependency not listed in Section 2 above
- The Layer 1 doc contradicts itself or contradicts another doc
- A design token you need isn't defined in the design system doc
- A schema field you'd expect isn't in the Layer 2 doc's schema section
- Anything ambiguous in the DataClient interface

## Style expectations

- Small, focused files. Component files under 150 lines each; split when bigger.
- No comments explaining WHAT code does; DO add comments explaining WHY when non-obvious (e.g., why a specific interval was chosen for fake status flipping).
- Prefer clarity over cleverness. This is a prototype meant for humans to read, not a library.
- Type everything. `any` is banned in this codebase.
- Do not add unnecessary abstractions. It's a 4-week prototype, not a framework.
- Format with Prettier defaults, no config file needed.

## Deliverable at the end

A working `pnpm dev` server showing the Map screen with 8 station pins colored by reliability tier, bottom sheet with ranked stations, filter chips, bottom nav, and a working light/dark theme toggle reachable from the Profile placeholder page.

When done, run `git status` and list files ready to commit, but do not commit — I'll review first.

Go.
