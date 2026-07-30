# Layer 1 — V1 Prototype Architecture

> Scope: the 4-week Next.js PWA build. All data mocked. All state client-side. Zero real backend. Deployed as a URL on Vercel.
> Companion documents: `01_MVP_Overview.md`, `03_Layer_2_Post_Pilot.md`, `04_Layer_3_Production.md`, `design_system.md`.

---

## 1. The mission of Layer 1

Ship a mobile-first PWA in 4 weeks that convincingly demos the product without any real infrastructure. Two audiences it must serve:

- **Investors and CPO decision-makers** in a 15-minute pitch: the app must run live on any phone via a URL, without crashing, without "just imagine" caveats.
- **You (the founder), post-pilot**: the codebase must be shaped so that when a CPO says yes, Layer 2 is a swap-in, not a rewrite.

Serving both requires the discipline in this document: keep V1 tiny, but make every architectural decision Layer-2-safe.

---

## 2. Stack — final choices

Small, boring, standard. No exotic dependencies.

| Concern | Choice | Why |
|---|---|---|
| Framework | **Next.js 14 (App Router)** | React Server Components, file-based routing, built-in PWA support, deploy target = Vercel |
| Language | **TypeScript** (strict) | Catches half the bugs before runtime; free with Next |
| Styling | **Tailwind CSS** | Design tokens map cleanly to Tailwind theme; no CSS bikeshedding |
| Global state | **Zustand** | 1KB, no providers, no reducers, no boilerplate; perfect for prototype scale |
| Server state (later) | **TanStack Query (React Query)** | Not needed in V1 (no server); wire in for Layer 2 |
| Animation | **framer-motion** | Sheet snaps, page transitions, settlement animation |
| Maps | **@vis.gl/react-google-maps** | Official Google React wrapper, well-maintained, actively developed |
| Icons | **lucide-react** | Clean, huge coverage, tiny bundle |
| Forms | Native React + `react-hook-form` if needed | No form library for V1 — one OTP screen is not worth a dependency |
| Charts (Passport) | **Recharts** | Only used on one screen; small addition |
| PWA | **next-pwa** | Service worker + manifest + install prompt |
| Fonts | **Inter + Instrument Serif** (via next/font) | Matches design system |
| Deploy | **Vercel** free tier | `git push` = live, zero DevOps |
| Package manager | **pnpm** | Fast, disk-efficient, matches modern JS defaults |

**What is explicitly NOT in the stack:**

- No Redux, no Recoil, no Jotai (Zustand is enough).
- No React Query in V1 (nothing to query).
- No Supabase / Firebase / any backend (all mocked).
- No Prisma / Drizzle / any ORM (no DB).
- No authentication library (mock OTP).
- No i18n library (English only in V1).
- No CMS (JSON files are enough).
- No Docker, no Kubernetes, no CI/CD beyond Vercel's built-in.
- No unit testing framework required (integration test the demo flows manually; add Playwright in Layer 2 if needed).

---

## 3. Folder structure

Type-based, not feature-based. The codebase is too small for feature folders to pay off. When Layer 2 grows the codebase past ~50 files, we revisit.

```
unified-ev/
├── docs/                          # this doc suite lives here
│   ├── 01_MVP_Overview.md
│   ├── 02_Layer_1_V1_Prototype.md
│   ├── 03_Layer_2_Post_Pilot.md
│   ├── 04_Layer_3_Production.md
│   ├── design/
│   │   ├── design_system.md
│   │   ├── mockup.html
│   │   └── mockup_variants.html
│   └── reference/                 # historical, do-not-build
│       ├── caas_master_blueprint.md
│       ├── caas_platform_blueprint.md
│       └── caas_api_contracts.md
│
├── public/
│   ├── icons/                     # PWA icons (192, 512)
│   ├── stations/                  # placeholder station photos
│   ├── cpos/                      # CPO logos (Tata Power, Jio-bp, etc.)
│   └── manifest.json
│
├── src/
│   ├── app/                       # Next.js App Router
│   │   ├── layout.tsx             # root layout: fonts, viewport, PWA meta
│   │   ├── page.tsx               # / → Landing
│   │   ├── onboarding/
│   │   │   ├── page.tsx           # phone + OTP
│   │   │   └── vehicle/page.tsx   # pick vehicle → EV profile
│   │   ├── map/page.tsx           # / after onboarding
│   │   ├── station/[id]/page.tsx  # station detail
│   │   ├── scan/page.tsx          # camera view + auto-succeed
│   │   ├── session/[id]/page.tsx  # live session screen
│   │   ├── session/[id]/complete/page.tsx  # settlement + receipt
│   │   ├── route/page.tsx         # trip planner
│   │   ├── passport/page.tsx      # charging history + stats
│   │   └── profile/page.tsx       # user + vehicle + payment
│   │
│   ├── components/                # shared UI, mostly presentational
│   │   ├── ui/                    # atomic: Button, Chip, Card, BottomSheet, Modal
│   │   ├── station/               # StationCard, StationPin, ReliabilityBadge
│   │   ├── session/               # SoCDial, LiveStat, PowerDial
│   │   ├── map/                   # MapCanvas, FilterChips, SearchBar
│   │   └── layout/                # StatusBar, Header, BottomNav
│   │
│   ├── data/                      # SEED DATA — the mock backend
│   │   ├── cpos.json              # 6 CPO brands
│   │   ├── stations.json          # ~60 stations
│   │   ├── connectors.json        # ~120 connectors
│   │   ├── reliability.json       # per-connector scores
│   │   ├── reviews.json           # ~150 reviews
│   │   ├── photos.json            # ~180 photo refs
│   │   ├── vehicles.json          # ~15 EV models
│   │   ├── history.json           # ~15 past sessions for Passport
│   │   └── routes.json            # 3 hardcoded routes with polylines
│   │
│   ├── lib/
│   │   ├── data/
│   │   │   ├── types.ts           # DataClient interface — the critical file
│   │   │   ├── mockClient.ts      # V1: reads from /data/*.json
│   │   │   └── apiClient.ts       # V2 stub (throws) — swapped in later
│   │   ├── data/index.ts          # exports current client based on env
│   │   ├── recommend.ts           # Smart Recommendation scoring
│   │   ├── reliability.ts         # computes score from sessions (pure fn)
│   │   ├── mock-session.ts        # 90-second live-session simulator
│   │   ├── mock-payment.ts        # Razorpay-style checkout (UPI/card/netbanking) + capture + refund sim
│   │   ├── format.ts              # ₹, kWh, distance, duration formatters
│   │   └── analytics.ts           # PostHog client wrapper (later)
│   │
│   ├── stores/                    # Zustand stores
│   │   ├── userStore.ts           # profile, vehicle, auth state
│   │   ├── sessionStore.ts        # active session state machine
│   │   ├── mapStore.ts            # map viewport, filters, selected pin
│   │   └── passportStore.ts       # session history rollups
│   │
│   ├── hooks/
│   │   ├── useStations.ts         # wrapper around dataClient.getStationsNear
│   │   ├── useStation.ts
│   │   ├── useConnectorStatus.ts  # subscribes to live status (fake in V1)
│   │   ├── useReliabilityLive.ts  # decrements "last confirmed X min ago"
│   │   └── useSessionSim.ts       # drives the 90-second animation
│   │
│   ├── styles/
│   │   └── globals.css            # CSS variables from design_system.md
│   │
│   └── env.ts                     # typed env vars
│
├── tailwind.config.ts
├── next.config.mjs
├── tsconfig.json
├── package.json
└── README.md
```

**Why this shape:**

- The `src/lib/data/` folder is the single seam between V1 (mock) and V2 (real). Every component reads via `useStations()`, which calls `dataClient.getStationsNear()`. `dataClient` is either `mockClient` or `apiClient` depending on env. Get this right and Layer 2 is a swap.
- Stores are per-domain (user, session, map, passport), not one giant store. Zustand handles this trivially.
- App Router with dynamic segments (`station/[id]`, `session/[id]`) means every screen is deep-linkable — an investor can share `unified-ev.app/station/tp-bkc-01` and it works.

---

## 4. The DataClient adapter pattern — the single most important architectural decision

This is the one thing that, if you get right in V1, makes Layer 2 a swap-in project instead of a rewrite. Read this section twice.

**The interface (`src/lib/data/types.ts`):**

```typescript
// Everything the app needs from a "backend" — real or mocked.
export interface DataClient {
  // Stations
  getStationsNear(lat: number, lng: number, radiusKm: number, filters?: StationFilters): Promise<Station[]>;
  getStation(id: string): Promise<Station | null>;

  // Reliability
  getConnectorStatus(connectorId: string): Promise<ConnectorStatus>;
  subscribeToConnectorStatus(connectorId: string, cb: (status: ConnectorStatus) => void): Unsubscribe;

  // Sessions
  initiateSession(input: InitiateSessionInput): Promise<Session>;
  startSession(sessionId: string): Promise<Session>;
  stopSession(sessionId: string): Promise<Session>;
  subscribeToSession(sessionId: string, cb: (session: Session) => void): Unsubscribe;
  getSessionHistory(userId: string): Promise<Session[]>;

  // Reviews / photos
  getReviewsForStation(stationId: string): Promise<Review[]>;
  getPhotosForStation(stationId: string): Promise<Photo[]>;

  // Auth (V1: no-op accept-anything; V2: real)
  loginWithOtp(phone: string, otp: string): Promise<User>;
  getCurrentUser(): Promise<User | null>;

  // Route planning
  planRoute(input: PlanRouteInput): Promise<RoutePlan>;
}
```

**The mock implementation (`src/lib/data/mockClient.ts`):**

- Reads seeded JSON from `/data/`.
- All async methods return Promises with a small artificial delay (150–400 ms) so the UI's loading states are exercised.
- Subscriptions use `setInterval` under the hood to fake live updates (e.g., connector status flips Available/Occupied every 20 s per station).
- `initiateSession` returns a fake session immediately; `mock-session.ts` then drives the 90-second animation.
- `loginWithOtp` accepts any 4-digit OTP and returns a hardcoded user.

**The API implementation (`src/lib/data/apiClient.ts`):**

- V1: empty. Every method throws `Error("apiClient not implemented in V1")`.
- V2: wraps Supabase queries + real integrations. Same interface, no component changes.

**The switcher (`src/lib/data/index.ts`):**

```typescript
import { mockClient } from './mockClient';
import { apiClient } from './apiClient';

export const dataClient =
  process.env.NEXT_PUBLIC_DATA_MODE === 'api' ? apiClient : mockClient;
```

**Rule for every component:** never import from `mockClient` directly, never read JSON directly, never call `fetch` from a screen. Always go through `dataClient` via a hook. If you break this rule once in V1, Layer 2 becomes a rewrite.

---

## 5. State management

Zustand is used for four small stores. Each store owns one domain. No global monolithic store.

### 5.1 `userStore`

```
- currentUser: User | null
- currentVehicle: Vehicle | null
- login(phone, otp): calls dataClient.loginWithOtp
- logout(): clears currentUser
- setVehicle(v): updates + persists to localStorage
```

Persisted to `localStorage` via Zustand's `persist` middleware. On app boot, if a user exists in localStorage, they skip onboarding.

### 5.2 `sessionStore`

Holds the active session state and drives the state machine. This is where the "session lifecycle" from the old blueprint gets faked convincingly.

```
- activeSession: Session | null
- initiate(stationId, connectorId): moves through INITIATED → PAYMENT_AUTHORIZED
- start(): PAYMENT_AUTHORIZED → STARTING → ACTIVE (starts mock-session.ts)
- stop(): ACTIVE → STOPPING → COMPLETED
- settle(): COMPLETED → SETTLED (triggers settlement animation)
```

State transitions are exactly what Layer 2 will implement server-side. The state names must match the final backend enum so nothing renames later.

### 5.3 `mapStore`

Not persisted. Purely UI state.

```
- center: { lat, lng }
- zoom
- filters: { availableOnly, connectorTypes, minReliability, maxPrice }
- selectedStationId: string | null
- setFilter(...)
- selectStation(id)
```

### 5.4 `passportStore`

Read-only rollup of `history.json` (seeded past sessions) plus any sessions completed during the current demo session. Computed on the fly — no persistence needed since it derives from `dataClient.getSessionHistory()`.

---

## 6. Faking "live" — the four things that make the demo feel alive

The single biggest gap between a bad demo and a good one is whether the app *feels alive*. Four systems handle this in V1:

### 6.1 Connector status flipping

Every 20 seconds, `mockClient` picks a random connector and flips its status (Available ↔ Occupied, occasionally Out of Service). `useConnectorStatus(id)` subscribes and re-renders the pin color / status badge.

### 6.2 "Last confirmed working X minutes ago" ticker

`useReliabilityLive()` runs a `setInterval` every 60 seconds and decrements the timestamp displayed on Station Detail's reliability hero. Even without a real backend, the number moving forward makes the data feel live.

### 6.3 Session dial animation

When a session enters ACTIVE state, `useSessionSim()` starts a `requestAnimationFrame` loop:

- SoC advances from `startSoc` → `targetSoc` linearly over 90 seconds
- kWh delivered = `(soc - startSoc) / 100 * batteryKwh`
- ₹ accrued = `kWh * pricePerKwh` (with small floating-point jitter to feel real)
- kW power dial fluctuates ±5% around max_charge_rate to look natural

All three counters update in `<20ms` intervals so they look continuous. Use `Intl.NumberFormat` with `tnum` font-feature so digits don't jitter.

### 6.4 Settlement animation

When session completes, a 2.5-second scripted animation runs:

1. "₹500 held" (0s)
2. counter animates down: 500 → 347 (1s)
3. "Captured ₹347" (1.2s)
4. "Refunded ₹153 to dilip@ybl" (2s)
5. Receipt slides up (2.5s)

Done with `framer-motion` keyframes. No conditional logic — deterministic script.

---

## 7. Maps integration

**Library:** `@vis.gl/react-google-maps` (Google's official React wrapper, actively maintained by Google's Maps team).

**Setup:**
- Google Cloud project with billing enabled (billing card required but nothing charged at demo volume — free tier is generous).
- Maps JavaScript API + Directions API + Places API (if we add address autocomplete for Route Planner) all enabled.
- API key restricted to the Vercel deployment domain + localhost.
- Key exposed via `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`.

**Rendering:**
- Map centered on Mumbai (19.076, 72.877) by default.
- Custom map style — light theme with muted point-of-interest labels so the CPO pins pop. There's a Google Maps Styling Wizard for generating the JSON style block.
- Station pins are custom `<AdvancedMarker>` components with color from reliability tier + connector-type badge (D/A letter).
- Selected pin is 1.25× scale + shadow glow.
- Bottom sheet slides up from bottom on pin selection.

**Route drawing:**
- Google Directions API called for each of the 3 hardcoded routes at build time (baked into `routes.json`) OR at runtime with response cached in localStorage.
- Polyline decoded and drawn as a styled path.
- Charging stop marker placed at the pre-computed midpoint.

---

## 8. PWA setup

`next-pwa` handles service worker, offline caching, and install prompt.

`public/manifest.json`:

```json
{
  "name": "Unified-EV",
  "short_name": "Unified-EV",
  "description": "Every charger in India. One app. No prepaid wallets.",
  "start_url": "/",
  "display": "standalone",
  "orientation": "portrait",
  "background_color": "#FFFFFF",
  "theme_color": "#10B981",
  "icons": [
    { "src": "/icons/192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icons/512.png", "sizes": "512x512", "type": "image/png" },
    { "src": "/icons/512-maskable.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable" }
  ]
}
```

Add-to-home-screen prompt fires on second visit. Once installed, app launches full-screen without browser chrome — indistinguishable from a native app to the user.

**iOS caveats to know but not solve in V1:**
- Push notifications require iOS 16.4+ and only work when app is installed as PWA.
- No background location.
- Splash screen requires 30+ hardcoded image sizes for every iPhone model (skip for demo — default is acceptable).

---

## 9. Screen-by-screen, week-by-week

### Week 1 — Foundation + Map + Station Detail

**Day 1–2 — Project setup**
- `pnpm create next-app` → TS, App Router, Tailwind, src dir
- Install deps: `zustand @vis.gl/react-google-maps framer-motion lucide-react next-pwa @next/font`
- Copy design tokens from `design_system.md` into `tailwind.config.ts` + `globals.css`
- Set up `env.ts` for typed env vars
- Deploy empty shell to Vercel — confirm URL works

**Day 3–4 — Seed data + DataClient**
- Write `types.ts` (all interfaces)
- Write `mockClient.ts` (all methods returning fake data)
- Write seed JSON: 6 CPOs, 60 stations (OpenChargeMap Mumbai + Delhi filtered), 120 connectors, 120 reliability scores
- Write `recommend.ts` scoring function
- Confirm `dataClient.getStationsNear(19.076, 72.877, 5)` returns believable results

**Post-scaffold expansion (added 2026-07-30 after competitor gap analysis):** Cursor's Week 1 scaffold shipped with a small seed set (~8 stations, 4W-only vehicles, CCS_2 / TYPE_2_AC connectors only). Before Week 4 demo, expand seed data to include:
- `BHARAT_AC_001` and `BHARAT_DC_001` connectors on at least 20% of stations (India-specific standards, essential for 2W/3W credibility)
- 5 two-wheeler models (Ather 450X, Ola S1 Pro, TVS iQube, Bajaj Chetak, Hero Vida) and 2 three-wheeler models (Mahindra Treo, Bajaj RE E-Tec) in `vehicles.json`
- A `vehicleClass` field on `vehicle_catalog` rows: `TWO_WHEELER | THREE_WHEELER | FOUR_WHEELER | COMMERCIAL`

This is a data expansion, not a code change — no new components needed. See `05_Future_Scope_Must_Add.md` for the full rationale.

**Day 5–7 — Unified Map screen**
- `MapCanvas` component with Google Maps
- `StationPin` component with reliability tier colors
- Bottom sheet with filter chips + station list
- `StationCard` component with reliability badge
- Smart Recommendation reason lines rendered on top cards
- Selected pin state + sheet snap points via framer-motion

**End of Week 1:** Real map. 60 pins. Bottom sheet with recommendations. Tap a pin → nothing (yet).

### Week 2 — Station Detail + Onboarding + Profile

**Day 8–10 — Station Detail screen**
- Reliability hero component (big number + sample size + live "confirmed X min ago" ticker)
- Connector list + prices
- Amenity chips
- Seeded reviews (3 per station, hardcoded good/bad mix)
- Seeded photo carousel (3 per station, placeholder gradient blocks + captions)
- Fixed CTA "Scan to Charge" at bottom

**Day 11–12 — Onboarding flow**
- Landing screen (hero + 4-step preview + CTA)
- Phone input → OTP screen (accepts any 4 digits)
- Vehicle picker (searchable dropdown from `vehicles.json`)
- Vehicle profile confirmation
- Persist user + vehicle to localStorage

**Day 13–14 — Profile + navigation**
- Bottom nav with 5 tabs (Map, Route, Scan, Passport, Profile)
- Scan tab is the elevated floating brand-colored button
- Profile screen (user + vehicle + payment display)
- Confirm deep links work: `/station/tp-bkc-01` opens Station Detail directly

**End of Week 2:** New user can install PWA → onboard → land on Map → tap a pin → see full Station Detail with reliability data.

### Week 3 — Scan + Session + Settlement

**Day 15–16 — Scan screen**
- Camera view (real `getUserMedia`) with QR frame overlay
- Auto-succeed after 1.5s (don't actually decode; timer transitions to next screen)
- Fallback: "camera denied" mock screen that just says "Scanning..." for 1.5s and proceeds

**Day 17–18 — Payment sheet (Razorpay Standard Checkout mock)**
- Styled to mimic Razorpay's bottom-sheet checkout UI — tabs for UPI, Card, Netbanking, Wallet
- UPI tab is default (user's preferred method from Profile)
- "Hold ₹500 for EV charging at [station]?" header with approve/deny
- Card tab shows saved cards + "add new card" placeholder
- Netbanking tab shows top bank shortcuts
- On approve (regardless of tab): sessionStore.initiate → transition to Session screen
- On deny: back to Station Detail
- Even in V1 mock, respect the multi-method reality so the pitch reflects the actual product

**Day 19–21 — Session screen**
- SoC dial component (SVG circle with animated stroke)
- Live counters (kWh, ₹, kW) using `useSessionSim` hook
- "14 min elapsed · ~12 min to 80%" timer
- Stop button
- Full dark theme (from design_system Direction B for session)

**End of Week 3:** End-to-end flow works. Map → Detail → Scan → UPI → Live Session → Stop.

### Week 4 — Settlement + Route Planner + Passport + Polish + Ship

**Day 22–23 — Settlement animation + Receipt + Rate Station**
- 2.5s scripted settlement animation on stop
- Receipt screen: kWh, ₹ breakdown (energy + platform fee), CO₂ saved
- **Rate this station** prompt: 5-star tap + optional text (one-line placeholder "Anything worth noting?"). Skippable.
- On submit or skip: "Add to Passport" → back to Map
- Rating attaches the completed sessionId so the review is verified-by-construction — a user can only ever review a station they've actually charged at. V1 mock persists to the seeded review store; Layer 2 writes to Postgres with an RLS policy enforcing the same rule.

**Day 24–25 — Route Planner**
- Origin + destination inputs (hardcoded to 3 route pairs for demo)
- Google Directions polyline drawn on map
- Recommended charging stop card with SoC / cost / duration
- 2 alternative stops (tap to swap — updates card, no route redraw)

**Day 26–27 — Charging Passport**
- Header stats (total sessions, kWh, ₹, CO₂)
- Session history list (grouped by month, CPO logo per row)
- Battery health trend line (fake but plausible, using Recharts)

**Day 28 — Polish + ship (original Week 4 close)**
- Loading skeletons on Map, Station Detail, Session
- Empty states (no active session, empty passport for new user)
- Error toast for camera denied, geolocation denied
- Landing page copy pass (with founder story link)
- Test flow on iPhone Safari, Android Chrome, desktop Chrome
- Add to Vercel production, get final URL
- Custom domain wired if we have one

### Week 5 — Tier A additions (added 2026-07-30 after competitor gap analysis)

Original 4-week plan closes end of Week 4. Tier A features pulled from `05_Future_Scope_Must_Add.md` and `06_Future_Scope_Should_Add.md` extend the timeline by ~1 week to Week 5. Two Cursor prompts handle these:

**Days 29–31 — Prompt 02: Data + copy expansion (`prompts/02_tier_a_data_copy.md`)**
- Extend `ConnectorType` enum with `BHARAT_AC_001` and `BHARAT_DC_001`
- Update `connectors.json`: ~25% of stations get Bharat AC/DC connectors
- Add `vehicleClass` field to `vehicle_catalog` (`TWO_WHEELER | THREE_WHEELER | FOUR_WHEELER`)
- Add 5 2W and 2 3W vehicles to `vehicles.json`
- Add vehicle segment picker to onboarding flow (Two-wheeler / Three-wheeler / Four-wheeler)
- WhatsApp support link in Profile → Help & Support (Dilip's WhatsApp Business number)
- Payment sheet mock: rename "Card" tab to "Card (RuPay / Visa / Mastercard)"
- Landing page copy: add "FAME-II aligned via OCPI 2.2.1" trust marker

**Days 32–34 — Prompt 03: OCPI CDR + Refund Policy (`prompts/03_tier_a_cdr_refund.md`)**
- Session type in `types.ts` — verify all OCPI 2.2.1 CDR fields present; add any missing
- New file `src/lib/data/cdr.ts` with pure `toCDR(session: Session): CDR` function
- Draft `Charging Session Refund Policy` content (2 pages, plain-language)
- New route `/policies/refund` renders the policy
- Link from Profile → Help & Support + landing page footer
- Note in policy: "will be legally reviewed before real payments go live"

**End of Week 5:** Ship. Demo-ready with Tier A credibility additions.

**Explicitly deferred to Layer 1.5 (Weeks 6–9):** Tier B features from `05_Future_Scope_Must_Add.md` — multi-language (Hindi + English) and National Highway corridor mapping. These require the V1 flow to be stable first; adding them mid-build creates re-work loops.

**Explicitly not in Layer 1 at all:** Tier C features — CPO SaaS Dashboard, ONDC/UEI membership, ISO 27001. Real dependencies on Layer 2/3 infrastructure. Do not attempt.

---

## 10. Data shapes (schema-compatible with Layer 2)

The mock JSON files use exactly the same shapes as the future Postgres tables. This is the "your JSON should look like it came out of Supabase" rule in practice.

**`cpos.json`:**
```json
[
  { "id": "tata-power", "name": "Tata Power", "logoUrl": "/cpos/tata-power.png", "chipColor": "#1B4B96", "protocol": "OCPI_2_2" },
  { "id": "jio-bp", "name": "Jio-bp", "logoUrl": "/cpos/jio-bp.png", "chipColor": "#00A550", "protocol": "PROPRIETARY_REST" },
  ...
]
```

**`stations.json`:**
```json
[
  {
    "id": "tp-bkc-01",
    "cpoId": "tata-power",
    "name": "Tata Power EZ — BKC Signature Tower",
    "address": "Bandra Kurla Complex, Mumbai 400051",
    "coordinates": { "lat": 19.0596, "lng": 72.8295 },
    "amenities": ["cafe", "restroom", "24x7", "security"],
    "isActive": true,
    "avgWaitMins": 2,
    "bestTimeToCharge": "2-5 pm",
    "trafficLevel": "LOW"
  },
  ...
]
```

**`connectors.json`:**
```json
[
  { "id": "tp-bkc-01-c1", "stationId": "tp-bkc-01", "identifier": "A1", "type": "CCS_2", "maxPowerKw": 50, "pricePerKwh": 18.5, "status": "AVAILABLE" },
  ...
]
```

**`reliability.json`:**
```json
[
  { "connectorId": "tp-bkc-01-c1", "scorePct": 94, "sampleSize": 1247, "windowDays": 30, "lastConfirmedAt": "2026-07-29T12:15:00Z" },
  ...
]
```

**`history.json`:**
```json
[
  {
    "id": "s-past-01",
    "userId": "demo-user",
    "connectorId": "tp-bkc-01-c1",
    "stationId": "tp-bkc-01",
    "cpoId": "tata-power",
    "status": "SETTLED",
    "energyKwh": 18.4,
    "costAccrued": 340.4,
    "platformFee": 7,
    "durationMins": 42,
    "startedAt": "2026-07-28T10:15:00Z",
    "endedAt": "2026-07-28T10:57:00Z"
  },
  ...
]
```

Every field name matches what will exist in Postgres. When Layer 2 arrives, migrating this data is `pg_insert(row)` for row in JSON.

---

## 11. Environment variables

```
NEXT_PUBLIC_DATA_MODE=mock              # or 'api' in Layer 2
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=xxx
NEXT_PUBLIC_ENVIRONMENT=demo            # 'dev' | 'demo' | 'staging' | 'prod'
NEXT_PUBLIC_POSTHOG_KEY=xxx             # optional in V1, useful for tracking demo interactions
```

All variables typed via a Zod schema in `src/env.ts` so missing envs fail at build time, not runtime.

---

## 12. What Layer 1 deliberately does NOT do

- No real backend of any kind.
- No user authentication (accept any OTP; user is hardcoded).
- No real payment (mocked Razorpay Standard Checkout with UPI + card + netbanking tabs, no real gateway calls).
- No real charger integration (all mock data).
- No real reliability compute (hardcoded scores).
- No real reservation system.
- No real notifications (push, SMS, email).
- No real analytics beyond optional PostHog event tracking.
- ~~No dark mode toggle~~ **UPDATED 2026-07-30:** full app light/dark theme toggle IS in V1. Toggle lives in Profile screen; default to system preference on first load; persist choice to `localStorage['theme']`. Every component must exist in both modes via CSS variables + `[data-theme='dark']` selector. Session screen always renders in dark mode regardless of app-level toggle (design decision — dark session screen is the "wow moment," not a preference).
- No i18n (English only).
- No admin panel.
- No fleet features.
- No developer API.
- No offline mode beyond PWA install (no offline session support — needs backend).
- No tests beyond manual demo flow verification.

Every one of these is intentional and lives in a later layer. Don't sneak them in.

---

## 13. Non-negotiables — what Layer 1 MUST do

- Every fetch/query goes through `dataClient`. No exceptions.
- Every data shape matches its future Postgres schema.
- Every table/entity has a `cpoId` where applicable — multi-tenant awareness from day one.
- Reliability score is computed by a pure function `computeReliability(sessions[])`, not hardcoded on the station object. Even in V1. So Layer 2 can swap the input from seed data to real sessions with zero function changes.
- Every screen is deep-linkable (App Router dynamic segments handle this automatically — just don't put state in Zustand that should be in the URL).
- Session state transitions use the exact enum values that will exist in Postgres later (`INITIATED`, `PAYMENT_AUTHORIZED`, `STARTING`, `ACTIVE`, `STOPPING`, `COMPLETED`, `SETTLED`, `FAILED`).
- PWA install prompt works on Android Chrome and iOS Safari.
- Custom domain if we have one; otherwise the `*.vercel.app` URL is what we send.

---

## 14. Success criteria for Layer 1

Ship Week 4. Beyond that, one measurable outcome:

- 5 stranger EV owners try the demo (installed as PWA on their phones), zero explanation. At least 3 out of 5 complete the scan → session → settlement flow without help and say "when can I use this?"

If that hits, Layer 1 is done and we're ready to line up the first pilot conversation. If it misses, we iterate the specific screens where users got stuck before touching Layer 2.
