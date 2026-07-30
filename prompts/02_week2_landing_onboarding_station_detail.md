# Cursor Prompt 02 — Week 2: Landing + Onboarding + Station Detail

> Run this **after Prompt 01 is complete and merged** (Week 1 scaffold: Map + shell + theme toggle + placeholder Profile all working).
> Working folder: `/Users/dilipkumarsaroj/Desktop/Projects/Unified-EV/`
> This is an **additive** prompt — you're building on the existing V1 codebase, not scaffolding.

---

You are extending Unified-EV with Week 2 of Layer 1: the onboarding flow (Landing → OTP → Vehicle picker), and the Station Detail screen.

## Read these files before starting

- **`docs/02_Layer_1_V1_Prototype.md`** — Section 9, "Week 2 — Station Detail + Onboarding + Profile" (Days 8–14) for the exact task list
- **`docs/design/design_system.md`** — for every design token used in this session
- **`docs/mockup.html`** — visual reference for Landing (light theme) and Station Detail
- **`docs/mockup_variants.html`** — Direction B (dark theme) references — remember every screen must render correctly in both light and dark

## Scope for this session — Days 8–14

Three deliverables, in this order:

---

### 1. Landing / Onboarding flow (Days 8–10)

**A. Landing page — replace the current redirect at `/`**

Currently `/` redirects to `/map`. That was a Week 1 shortcut. Replace with a real landing page shown to unauthenticated users (no `currentUser` in `userStore`).

Landing content per `docs/01_MVP_Overview.md` and `docs/design/design_system.md`:

- Brand mark + wordmark ("Unified-EV") at top
- Eyebrow chip: `ONE APP · EVERY CHARGER`
- Hero headline: **"Charge anywhere. Know it works."** (make "Know it works" the visual emphasis via color or serif, per design mockup)
- Sub-headline: `Real-time reliability across every network. No prepaid wallets — pay how you want.`
- 4-step visual row: `Find · Scan · Charge · Pay` (each with a small icon from `lucide-react`)
- Primary CTA: **"Continue with phone number"** → routes to `/onboarding`
- Small footer with legal placeholder + FAME-II trust marker line (`🏛️ FAME-II aligned · 🇮🇳 Made in India · 🔓 Built on OCPI 2.2.1 + Beckn`)

Once user is authenticated, `/` should redirect to `/map` (existing behavior).

**B. Onboarding flow — new routes**

`/onboarding` — phone entry screen:
- Header: back button + title "Sign in"
- Large phone input with `+91` prefix locked, 10-digit numeric input
- Continue button (disabled until 10 digits entered)
- On tap → calls `dataClient.loginWithOtp(phone)` (mock accepts anything) → routes to `/onboarding/otp?phone=...`

`/onboarding/otp` — OTP entry:
- Title: "Enter the 4-digit code sent to +91 XXXXX XX210" (mask middle 5 digits)
- 4-digit OTP input (auto-advance between boxes, auto-submit on 4th digit)
- Any 4 digits work — verify calls `dataClient.verifyOtp(phone, otp)` which returns a hardcoded user
- On success → routes to `/onboarding/vehicle` (or `/map` if user already has a vehicle)
- "Resend code" link with 30-second countdown

`/onboarding/vehicle` — vehicle profile setup:
- Title: "What do you drive?"
- Vehicle model dropdown (searchable) sourced from `vehicles.json` — currently 4W-only per V1 seed
- On selection, shows the vehicle spec confirmation card: model, battery kWh, connector type, average consumption
- Preferred charge-to % slider (default 80%)
- Continue button → saves via `userStore.setVehicle()` → routes to `/map`

All three screens deep-linkable but redirect to landing if no user context earlier in the flow.

Persist user + vehicle to `localStorage` via Zustand `persist` middleware. On app boot, if user + vehicle exist, skip onboarding and land on `/map`.

---

### 2. Station Detail page (Days 11–12)

**Route:** `src/app/station/[id]/page.tsx` — replaces the placeholder that currently exists.

**Layout (top to bottom):**

- Header (status bar + back button + share button)
- Photo carousel — 180px tall, horizontal scroll of 3 hardcoded placeholder images (linear-gradient blocks for now, with a caption chip: "Entrance" / "Connector" / "Parking")
- Body content:
  - CPO chip row (small colored dot + CPO name)
  - Station name (h1)
  - Address (muted)
  - **Reliability hero card** — the top-of-fold hero:
    - Big number (94% or whatever the seed gives) colored by tier
    - Suffix: "% reliability"
    - Sample size sub-line: "Based on 1,247 sessions in the last 30 days"
    - Live indicator with pulsing dot: "Last confirmed working 12 minutes ago"
    - Ticker: decrements the minutes number every 60s via `useReliabilityLive()` hook
  - 3-column stat row: Avg wait / Traffic level / Best time to charge
  - Connectors section (heading + list): each row shows connector type badge, power (kW), status pill (Available / Occupied), price per kWh
  - Amenities row: pill chips for cafe, restroom, parking, 24×7, security (icons from lucide-react)
  - Recent reviews section: 2–3 hardcoded reviews per station from `reviews.json`, each with:
    - Reviewer name + verified badge (mint chip: "✓ verified")
    - Star rating
    - Text
    - Date (relative: "2 days ago")
  - `Report an issue` ghost button (opens toast: "Reported. Thanks for helping other drivers.")
- Fixed bottom CTA:
  - Primary button: **"Scan to Charge"** — for now routes to `/scan?stationId=...&connectorId=...` (Scan screen built in Week 3)
  - Secondary button: `Get Directions` (opens Google Maps intent — `https://www.google.com/maps/dir/?api=1&destination=<lat>,<lng>`)

Everything reads from `dataClient.getStation(id)` and `dataClient.getReviewsForStation(id)`. No JSON imports in the component.

Handle loading state (skeleton), not-found state (404-style), and error state (error toast + retry button).

---

### 3. Live reliability ticker hook (Day 13)

**File:** `src/hooks/useReliabilityLive.ts` (new)

Pure client-side hook. Takes a `lastConfirmedAt` ISO timestamp, returns a live-updating relative string ("12 minutes ago" → "13 minutes ago" as time passes).

```typescript
export function useReliabilityLive(lastConfirmedAt: string): string {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 60_000);
    return () => clearInterval(interval);
  }, []);
  const seconds = (now - new Date(lastConfirmedAt).getTime()) / 1000;
  return formatRelative(seconds); // "just now" / "3 minutes ago" / "1 hour ago"
}
```

Use this on Station Detail's reliability hero. The point is the number *visibly* increments while you're on the screen — sells the "live" feel.

---

### 4. Update Map screen's "Tap station card" behavior (Day 14)

Previously, tapping a station card in the bottom sheet routed to `/station/[id]` and landed on the Week 1 placeholder. Now that Station Detail is real, verify:

- Tap card → navigates smoothly to Station Detail
- Back button on Station Detail returns to Map with the same viewport + selected pin state preserved (use `router.back()` or persist map state in URL / sessionStorage)

Also: the search bar on Map (visual-only in Week 1) can stay visual-only this session. Search functionality is Week 4 polish.

---

## Data expansion needed for this session

Some fields the Station Detail expects may not be in the current seed. Extend as needed:

- `stations.json` — ensure each station has: `avgWaitMins`, `trafficLevel` (`LOW` / `MEDIUM` / `HIGH`), `bestTimeToCharge` (string like "2–5 pm"), `amenities` (string array from a controlled set).
- `reviews.json` — 2–3 realistic reviews per station. Reviewer names: Indian names (Anish, Priya, Rohan, Neha, Vikram, Meera). Text should sound like real Indian EV owners with specific praise or complaints. Every seeded review has `is_curated: true` per the reviews policy — real user-written reviews come in Layer 2.

If the existing seed only has 8 stations, that's fine — Week 4 expands to more. Don't add stations in this session.

---

## Tech decisions — LOCKED

- Same stack as Week 1. No new dependencies unless explicitly listed.
- Photo carousel: implement with basic CSS scroll-snap (no library needed) OR use `framer-motion` if a library-free approach is awkward. Do NOT add a carousel library.
- OTP input: 4 individual controlled inputs OR one input styled to look like 4 (either is fine). Do NOT add `react-otp-input` or similar.
- Searchable vehicle dropdown: use native `<select>` for simplicity OR a lightweight custom dropdown. Do NOT add `react-select`.

---

## Success criteria

1. `pnpm tsc --noEmit` returns zero errors
2. `pnpm lint` returns zero errors
3. `pnpm build` succeeds
4. First-time visitor lands on Landing page, not Map
5. Onboarding flow works end-to-end: phone → OTP (any 4 digits) → vehicle picker → lands on Map
6. Reloading the app after onboarding lands directly on Map (persisted user + vehicle)
7. Tapping a station card from Map opens Station Detail with:
   - Reliability score visible above the fold, colored by tier
   - "Last confirmed working X minutes ago" text that visibly updates when you wait 60 seconds
   - Connector list with prices, amenities, 2–3 reviews with verified badges
   - Fixed "Scan to Charge" CTA at bottom (routes to `/scan` — Scan screen not built yet, will 404 or land on placeholder, fine for now)
8. Both light and dark themes render every new screen correctly
9. Back button from Station Detail returns to Map with state preserved

---

## What NOT to build in this session

- Scan camera view (Week 3)
- Payment sheet / mock UPI popup (Week 3)
- Session screen + dial + animations (Week 3)
- Route Planner (Week 4)
- Charging Passport screen content (Week 4)
- Any real backend, Supabase, auth API — mock only
- Any real photo storage — placeholder gradients are fine
- Multi-language (Layer 1.5)
- Any Tier A additions (they run in Week 5)

---

## When to stop and ask

- If any Week 1 file needs restructuring to fit Week 2 flow
- If the design system doesn't specify styling for a new component (OTP input, photo carousel)
- If the DataClient interface is missing a method Station Detail needs (add to interface + mock + apiClient stub — do NOT bypass)

---

## Style expectations

- Same code style as Week 1 codebase (Prettier defaults, strict TS)
- Small components, under 150 lines
- No comments explaining WHAT; only WHY when non-obvious
- Type everything — `any` is banned
- Zero new dependencies unless flagged in this prompt

---

## Deliverable

`pnpm dev` session where:
- First open → Landing page
- Continue → Phone → OTP → Vehicle picker → Map
- Tap any station pin → sheet expands → tap station card → Station Detail with reliability hero + live ticker + reviews
- Theme toggle still works from Profile
- Back navigation preserves map state

Run `git status` when done. Do not commit — I'll review.

Go.
