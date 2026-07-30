# Cursor Prompt 04 — Week 4: Route Planner + Passport + Polish + Deploy

> Run this **after Prompt 03 is complete and merged** (Scan + Session + Settlement all working end-to-end).
> Working folder: `/Users/dilipkumarsaroj/Desktop/Projects/Unified-EV/`
> This is an **additive** prompt — you're building on the existing V1 codebase.

---

You are building the final two screens (Route Planner + Charging Passport), doing production polish across all screens, and shipping the demo to Vercel. This is the last prompt of Layer 1's original 4-week plan. Tier A additions (Prompts 05 and 06) come in Week 5.

## Read these files before starting

- **`docs/02_Layer_1_V1_Prototype.md`** — Section 9, "Week 4 — Settlement + Route Planner + Passport + Polish + Ship" (Days 22–28) for the exact task list
- **`docs/design/design_system.md`** — Route Planner and Passport aren't in the mockup HTML directly, but every component follows the same tokens

## Scope for this session — Days 22–28

Four deliverables:

---

### 1. Route Planner (Days 22–23)

**Route:** `src/app/route/page.tsx` — replaces the "Coming soon" placeholder from Week 1.

**Content:**

- Header (back + title "Plan a trip" + settings icon)
- Origin input (autofilled with current location string, e.g., "Current location — Bandra, Mumbai")
- Destination input — searchable dropdown OR hardcoded shortcuts for V1
- Vehicle summary card (small): current vehicle + current SoC (hardcoded 40% for demo — Layer 2 pulls from real telematics)
- "Plan trip" button

**Three hardcoded routes for V1 demo:**

1. Mumbai → Pune (148 km via NH-48)
2. Delhi → Jaipur (280 km via NH-48)
3. Bengaluru → Mysore (145 km via NH-275)

Precompute the Google Directions polyline for each route at build time OR at runtime with response cached to localStorage. Cache key: `route:{origin}:{destination}`.

**On "Plan trip":**

- Show map with route polyline drawn (color: brand mint, dashed line style, 4px stroke)
- 3 pin markers on the polyline: origin (dark dot with "A"), destination ("B"), and 1 recommended charging stop (mint pin with lightning bolt icon at ~50% of the route)
- Below the map:
  - **Summary card** (3-column grid): Distance / Duration / Arrival SoC
  - **Charging stop card** (highlighted with mint border):
    - Header: "Charging stop · ETA 11:47 am"
    - Station name + CPO chip + connector info + price + reliability score
    - 3-column: Arrive SoC / Charge to / Duration
  - Two buttons: **Start navigation** (primary — for V1 just opens Google Maps intent) and **See 2 alternative stops** (secondary — shows 2 more station cards below)

**Data:**

- Hardcode the 3 routes in `src/data/routes.json` with: origin coords, destination coords, distance, duration, decoded polyline (from Google Directions), suggested charging station ID from existing seed stations, plus 2 alternative station IDs.
- Route selection at V1: user picks from the 3 hardcoded routes via a dropdown; entering arbitrary origins/destinations is a Layer 2 feature.

---

### 2. Charging Passport (Days 24–25)

**Route:** `src/app/passport/page.tsx` — replaces the "Coming soon" placeholder.

**Content:**

- Header (dark hero card, gradient from ink to charcoal, rounded bottom corners):
  - Eyebrow: "Charging Passport"
  - Big title: "{userName}'s {vehicleModel}" (e.g., "Rohan's Nexon EV Max")
  - Stats grid (2×2 with subtle glass-morphism cards):
    - Total sessions
    - Energy delivered (kWh)
    - Total spent (₹)
    - 🌱 CO₂ saved (kg)
- **Battery health trend** section:
  - "Battery health over time" heading
  - Line chart using `Recharts` — X: months (last 12), Y: capacity % (fake trend: gently sloping from 100% → 96% over 12 months for realistic degradation)
  - Below chart: "Estimated based on your charging patterns. Direct battery telemetry coming with vehicle integration."
- **Recent sessions** section:
  - Heading: "Recent sessions"
  - List of past sessions (from `history.json` seed — Cursor should generate ~15 sessions if not already present)
  - Each row: CPO logo (colored square with 2-letter initials), station name + relative date, kWh + duration, ₹ + connector type
  - Tap a row → opens the receipt view for that session (routes to `/session/[id]/complete` — will render the settled receipt)
- Filter row above list: month picker (last 6 months) + CPO filter (chips)

**Seed data expansion:**

- If `history.json` doesn't have 15 seeded past sessions, generate them: distributed across 5 stations over the last 3 months, mix of connector types, realistic kWh (10–25) and ₹ (200–500) and durations (25–55 min).
- Include the just-completed demo session (if user has completed one) at the top of the list.

---

### 3. Polish across all screens (Days 26–27)

**A. Loading skeletons.** For any screen that reads from `dataClient` and takes >100ms, show a skeleton (light gray blocks with a subtle shimmer via CSS keyframes). Screens needing skeletons:

- Map (bottom sheet stations while loading)
- Station Detail (whole page while loading)
- Session (while state machine transitions)
- Passport (while history loads)

**B. Empty states.**

- Empty Passport (new user, 0 sessions) — friendly illustration + text: "Your first charge will show here."
- Empty Search results on Map — text: "No chargers match your filters."
- No active session on Session screen (edge case if user navigates directly) — redirect to Map + toast: "No active session."

**C. Error toasts.**

- Camera denied on Scan → "Camera unavailable. Continuing with demo mode."
- Geolocation denied on Map → "Location unavailable. Showing Mumbai by default."
- Route Planner unable to fetch directions → "Route unavailable. Please try again."

Use a simple toast component (implement in `src/components/ui/Toast.tsx` if not present) — no library. Toasts auto-dismiss after 4 seconds.

**D. Landing copy pass.**

- Ensure landing headline, sub-headline, and steps all match the final approved copy from `docs/01_MVP_Overview.md`.
- Add the founder story link at the bottom of landing (small link: "Why we're building this →") — for V1, this can route to `/story` which shows a simple page with Dilip's origin story text (from `docs/01_MVP_Overview.md` Section 3).

**E. Cross-browser test checklist.** Manually verify (Cursor should do this and report):

- Chrome desktop (light theme + dark theme)
- Chrome desktop (mobile viewport emulation, 390×844)
- Safari desktop (theme toggle)
- Firefox desktop (map renders)

Report any browser-specific issues that would need fixing before deploy.

---

### 4. Deploy to Vercel (Day 28)

**Steps:**

1. Ensure `.env.example` includes all required env vars with placeholder values:
   - `NEXT_PUBLIC_DATA_MODE=mock`
   - `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_key_here`
   - `NEXT_PUBLIC_ENVIRONMENT=demo`
2. Check `.gitignore` includes `.env.local`, `.next/`, `node_modules/`.
3. Commit all changes: `git add . && git commit -m "feat: complete week 4 - route planner + passport + polish"`
4. Push: `git push origin main`
5. **On Vercel dashboard (Dilip does this manually):**
   - Import the GitHub repo `dilipsaroj/unified-ev-app`
   - Add environment variables: `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`, `NEXT_PUBLIC_DATA_MODE=mock`, `NEXT_PUBLIC_ENVIRONMENT=demo`
   - Trigger initial deploy
6. Once deployed, update Google Cloud API key restrictions:
   - Add the Vercel production URL (e.g., `unified-ev-app.vercel.app/*`) to HTTP referrers
   - Keep `localhost:3000/*` for dev

Cursor cannot do steps 5–6 (require Vercel + Google Cloud UI access). Cursor should list them in the final report so Dilip knows what to do manually after code push.

---

## Data additions needed

Update seed JSON where necessary:

- `routes.json` — new file with 3 hardcoded routes
- `history.json` — 15 seeded past sessions if not present
- No new station additions in this session

---

## Success criteria

1. `pnpm tsc --noEmit` returns zero errors
2. `pnpm lint` returns zero errors
3. `pnpm build` succeeds
4. Route Planner renders a real polyline for all 3 demo routes with the recommended charging stop card
5. Charging Passport shows header stats + battery health chart + 15+ session history
6. All screens show loading skeletons instead of blank/janky loads
7. Empty states + error toasts work on the relevant screens
8. Landing copy matches the final approved version
9. Cross-browser verified (Chrome, Safari, Firefox — desktop + mobile viewport)
10. Deployed to Vercel, live URL accessible, map renders (with API key), full flow works on the deployed site
11. Deployed URL works on real iPhone Safari and Android Chrome (test by opening the Vercel URL on a phone — Cursor can't verify this, Dilip should)

---

## What NOT to build in this session

- Tier A additions — Bharat AC/DC, 2W/3W vehicles, WhatsApp link, RuPay copy, FAME-II marker (all Prompt 05 in Week 5)
- OCPI CDR shape + Refund Policy (Prompt 06 in Week 5)
- Multi-language, NH corridor mapping (Tier B — Layer 1.5)
- CPO Dashboard, ONDC/UEI, ISO 27001 (Tier C — never Layer 1)
- Any real backend or API (Layer 2)
- Native mobile wrap via Capacitor (Layer 3 or after pilot)
- Real user analytics beyond page views (Layer 2)
- Custom domain wiring (Dilip does this manually once name is finalized)

---

## When to stop and ask

- If the Google Directions API returns fewer than expected results (may need to verify API key has Directions API enabled)
- If a screen from a previous week broke while adding new work
- If the Recharts chart doesn't render (check next dynamic import for SSR issues — Recharts often needs `dynamic import with { ssr: false }`)
- If Vercel deploy fails on the first attempt with a build error

---

## Style expectations

- Same code style as previous weeks
- Loading skeletons: reuse a single `<Skeleton />` component with `width` and `height` props; don't build one per screen
- Toast component: single implementation, called via a small `useToast()` hook
- No new dependencies except `recharts` (should already be in `package.json` from Prompt 01)

---

## Deliverable

- All 7 core screens live and polished
- Ship to Vercel — live URL that renders correctly on desktop and mobile
- End-to-end demo flow works on the deployed site: Landing → Onboarding → Map → Station Detail → Scan → Payment → Session → Settlement → Receipt → Passport → Route Planner → Profile
- Final report from Cursor: list of any known issues, browser-specific quirks, and the manual Vercel/Google Cloud steps Dilip needs to complete

Run `git status` and confirm all changes committed + pushed. Report the deployed URL.

**End of Week 4:** Layer 1 core demo is done. Week 5 adds Tier A credibility polish (Prompts 05 and 06). After that, Layer 1 is complete and ready for investor / CPO conversations.

Go.
