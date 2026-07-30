# EV Charging App — Prototype Feature Spec

> Version 1.0 — Vision Prototype (4-week PWA)
> Supersedes the "What We Are Building" sections of `caas_master_blueprint.md` and `caas_platform_blueprint.md` for the purposes of the V1 build.

---

## What this document is

The single source of truth for what we're building in the next four weeks. Every feature listed here goes into the demo. Every feature *not* listed here is out of scope for V1, no matter what the older blueprints say.

The older blueprints (`caas_master_blueprint.md`, `caas_platform_blueprint.md`, `caas_api_contracts.md`) stay in the repo as **reference for the eventual production platform**. They are not the V1 spec.

---

## The one-line pitch

**"One app. Scan any charger in India. Pay with UPI. Know it works before you drive there."**

That last clause is the whole product. The first three are table stakes.

---

## Who this is for

**Primary user:** an Indian EV owner or renter who has hit the multi-app problem — Tata Power / Jio-bp / Statiq / HPCL / Indian Oil / Bharat Petroleum each demanding a separate app, profile, and prepaid wallet. Founder-market fit here is personal: this is Dilip's own story after renting an EV for a day.

**Secondary user (later):** fleet operators (delivery / cab aggregators) who need one billing surface across networks. Not built in V1.

**Not the user in V1:** CPO business teams, investors, or OEMs. They're the *audience for the demo*, but they don't use the app themselves.

---

## The core insight

The obvious pitch is "unified app across CPOs." That is not the moat. Every startup pitching to VCs right now says the same thing about their vertical.

The real moat is **charger reliability**. Ask any Indian EV owner what they hate more:

- opening a second app once, or
- driving 15 km to a "working" charger that turns out to be broken

The answer is always the second. Reliability is what stops people buying EVs, and no CPO has an incentive to publish honest reliability data about their own network. A neutral, cross-CPO platform is the only entity that *can* publish it.

**Every screen in the prototype must reinforce that we know which chargers work.** Reliability score is not one feature among many. It is the product, wearing the disguise of a directory app.

---

## Screen inventory (V1)

Seven screens. That's the whole app. Anything not on this list is out of scope for V1.

### 1. Landing / Onboarding

**Purpose:** first-time user gets the pitch in 10 seconds and creates a profile.

**Content:**
- Headline: *"Every charger. One app. UPI only. No wallets."*
- Sub-headline referencing reliability: *"See which chargers actually work before you drive."*
- Three-step visual: Scan → Charge → Pay
- CTA: "Continue with phone number" → mock OTP (any 4 digits work) → EV Profile setup

**Notes:** Landing doubles as the shareable pitch page. Investors and CPOs land here from the demo link.

### 2. Unified Map (home)

**Purpose:** show every charger from every network on one map. This is the "wow" screen on first open.

**Content:**
- Real Google Maps centered on user location (default: Mumbai for the demo)
- ~60 station pins across 6 CPO brands (Tata Power, Jio-bp, Statiq, HPCL, Indian Oil, Bharat Petroleum)
- Each pin colored by reliability tier (green >90%, amber 70–90%, red <70%)
- Filter chips at top: `Available now`, `DC fast`, `AC`, `Reliability >90%`, `<₹15/kWh`
- Search bar: text ("CCS2 near me") or location
- Bottom sheet: list view of nearby stations sorted by Smart Recommendation (not just distance)
- Tap pin or list row → Station Detail

**Data:** seeded JSON of ~60 stations. OpenChargeMap data for real Indian coordinates, hand-adjusted to spread brand coverage evenly. Reliability scores hand-seeded to look believable (mix of green/amber/red).

### 3. Station Detail

**Purpose:** the "trust" screen. Everything a driver needs to decide whether to drive there.

**Content (in order of importance):**
- **Reliability Score** — big, top of screen. "94% • Based on 1,247 sessions in the last 30 days." Sub-line: "Last confirmed working 12 minutes ago."
- Live connector status (Available / Occupied / Out of service) — with honest "last updated X min ago" timestamp
- Average wait time and today's traffic (fake sparkline)
- Price per kWh, breakdown of any surcharges
- Amenities row (café, restroom, parking, 24×7, security)
- 2–3 station photos (hand-curated placeholder images per station: entrance, connector, parking)
- 2–3 reviews (hardcoded but realistic — "Cable was damaged, station staff replaced within 20 mins" etc.)
- **Big CTA button: "Scan to Charge"**
- Secondary: "Get Directions" (opens Google Maps app)

**Design goal:** feel like an Airbnb listing, not a database row. Photos and reviews make it feel real even when they're placeholder.

### 4. Scan to Charge → Session

**Purpose:** the emotional hero of the demo. This is the 10 seconds that sells the whole app.

**Flow:**
1. Tap "Scan to Charge" → full-screen camera view with a QR alignment frame
2. On the demo, the "scan" auto-succeeds after 1.5s (we don't actually decode a QR)
3. Cut to a mock UPI mandate popup styled like GPay/Razorpay: *"Hold ₹500 for EV charging at Tata Power BKC?"* → Approve
4. Cut to Session Screen

**Session Screen content:**
- Big circular SoC dial, animating from current % upward
- kWh delivered counter, ticking up
- ₹ accrued counter, ticking up
- Current power draw (kW dial)
- Elapsed time
- Big red "Stop" button

**Animation:** 90 seconds of real animation stands in for a 40-minute session. Rates chosen so kWh, ₹, and SoC all update visibly every second.

**On Stop:**
- Cut to settlement animation: "Held ₹500 → Captured ₹347 → Refunded ₹153 to your UPI"
- Show receipt: kWh delivered, price breakdown, CO₂ saved (vs petrol equivalent), "Add to Passport"
- Return to Map

**Design goal:** looks like Tesla / Ather / Zeon session screens. Real motion. No static screenshots.

### 5. Route Planner

**Purpose:** the "smarter than any single CPO app" moment. Sells long-distance confidence.

**Flow:**
1. Enter origin (autofilled: current location) and destination
2. Show vehicle model + current SoC from Profile
3. Tap Plan Trip
4. Show route polyline on the map with 1 recommended charging stop marked
5. Cards below the map:
   - Total distance / duration
   - Arrival SoC at destination
   - Charging stop card: station name, arrival SoC, charge duration, cost estimate, depart SoC, ETA to destination
   - Alternative stops (2–3, tap to swap)

**Data:** hardcoded routes for the 3 demo pairs: Mumbai → Pune, Delhi → Jaipur, Bengaluru → Mysore. Real Google Directions API for the polyline; the stop selection is scripted.

**Skip in V1:** re-planning mid-trip, multi-stop routes, weather adjustments.

### 6. Charging Passport

**Purpose:** the "lock-in" screen. Every session builds this. Once a user has it, they don't want to lose the history.

**Content:**
- Header stats: total sessions, total kWh, total ₹ spent, total CO₂ saved
- Battery health trend line (fake but plausible)
- Session history list — each row: date, station, kWh, ₹, duration, CPO logo
- Tap row → receipt (PDF-style view)
- Filters: by month, by CPO, by vehicle (multi-vehicle support later)
- Export button (mocked)

**Seed data:** ~15 fake past sessions across 5 stations and 3 months, so the passport feels lived-in on first open.

### 7. Profile

**Purpose:** capture the EV Profile (which powers Smart Recommendation and Route Planner) and hold basic account info.

**Fields:**
- Name, phone
- UPI VPA
- **Vehicle:** make/model dropdown (Tata Nexon EV, MG ZS EV, Hyundai Kona, Mahindra XUV400, Tata Tiago EV, Ather 450X, Ola S1 Pro, etc.) — this auto-fills battery capacity, connector type, consumption
- Preferred charge-to % (default 80%)
- Preferred connector (auto-set from vehicle, editable)

**Skip in V1:** multi-vehicle, payment method management (mock UPI only), notification preferences, family sharing.

---

## The five new features (deeper spec)

These are the features from your list that were *not* in the original blueprints. Each one gets a bit more depth here because we'll be building them fresh.

### Feature 1 — Reliability Score

**What it is:** a 0–100% score per connector (rolled up to per station) that answers "if I drive here now, will it work?"

**How it's computed (in production, not V1):**
```
reliability = (successful_sessions / total_attempted_sessions) over last 30 days
```
With adjustments:
- Weight recent sessions higher (last 7 days = 2×, last 24h = 3×)
- Ignore user-fault failures (payment declined, user cancelled before start)
- Boost score if manual "confirmed working" report from another user in last 4 hours
- Cap displayed confidence when sample_size < 20 sessions ("Insufficient data — 8 sessions")

**In V1 prototype:**
- All reliability scores hardcoded per station
- Distribution: ~50% green (>90%), ~35% amber (70–90%), ~15% red (<70%)
- Include "Last confirmed working X minutes ago" timestamp that shifts on refresh so it feels live
- Include sample size ("Based on 1,247 sessions") for credibility

**Data model addition:**
```
station_reliability {
  station_id            uuid
  connector_id          uuid
  score_pct             float       -- 0-100
  sample_size           int
  last_confirmed_at     timestamp
  window_days           int         -- 30 default
  computed_at           timestamp
}
```

**Why this is the moat:** no CPO will publish honest reliability data on their own network. A neutral platform can. Once we have it, every driver's default question ("is this charger working?") has one trusted answer, and that answer only exists here.

---

### Feature 2 — Smart Recommendation

**What it is:** the ranking that decides which station is shown *first* on the map bottom sheet. It is not "nearest." It is a trade-off engine that surfaces "5 min farther, ₹120 cheaper, no wait, cafe available" as an actual reason.

**In V1 prototype:**
- Ranking function (client-side, on the seeded data):
  ```
  score = reliability_pct * 2.0
        - distance_km * 3.0
        - price_per_kwh * 1.5
        - estimated_wait_mins * 0.5
        + amenity_bonus
  ```
- For each recommended station in the list, compute *why it beat the nearest station* and display that as the recommendation reason:
  - "Nearer by 400m but only 62% reliable"
  - "5 min farther, ₹120 cheaper for a full charge"
  - "Same distance, no wait, café on-site"
- Nearest is always still shown, but the *default* selection is the recommendation

**Data model addition:** none — recommendation is derived on the fly. But every station result should return a `recommendation_reasons: string[]` so the UI can render the "why."

**Design goal:** the user thinks "oh, this app is *actually* smart" the first time they see a recommendation that isn't the nearest pin.

---

### Feature 3 — EV Profile

**What it is:** rich vehicle profile that personalizes recommendations, route planning, and price estimates.

**Vehicle catalog (hardcoded for V1):**
- ~15 popular Indian EVs with their specs (Tata Nexon EV Max, Tata Tiago EV, Tata Punch EV, MG ZS EV, MG Comet, Mahindra XUV400, Hyundai Kona, BYD Atto 3, Ather 450X, Ola S1 Pro, TVS iQube, Bajaj Chetak, etc.)
- Each vehicle row: battery_kwh, connector_type, avg_consumption_wh_per_km, max_charge_rate_kw

**Data model:**
```
vehicle_catalog {
  id, make, model, variant,
  battery_kwh, connector_type,
  avg_consumption_wh_per_km, max_charge_rate_kw
}

user_vehicle {
  id, user_id, catalog_id,
  nickname, preferred_charge_to_pct,
  registration_no (optional),
  is_primary
}
```

**V1:** one vehicle per user. Multi-vehicle deferred.

---

### Feature 4 — Charging Passport

**What it is:** every session builds a personal record. Total kWh, ₹, CO₂ saved, battery health trend, receipt archive.

**Derived from:** the session table. No new writable entities. The Passport screen is a rollup view.

**V1 seeded data:** 15 past sessions across 5 stations, spread over the last 90 days, so the Passport isn't empty on first open. Each session includes: date, station name, kWh, ₹, duration, connector type, receipt.

**CO₂ saved calculation:** simple heuristic — `(kwh_delivered × 0.82 kg CO₂/kWh grid) - (kwh_delivered × equivalent_petrol_km × 2.3 kg CO₂/L)`. Doesn't need to be precise; needs to be plausible.

**Battery health trend:** for V1, show a downward-sloping line from 100% → 96% over 12 months. Fake but plausible. Real version needs OEM telematics (deferred to V2+).

**Why this matters:** the Passport is what makes the app hard to churn from. Once a user has 6 months of history here, switching to a CPO's own app means losing that history. It's the same lock-in mechanism as Strava for runners.

---

### Feature 5 — Community Layer + Station Photos

**What it is:** user-generated reviews, quick status reports ("charger broken"), and photos per station.

**V1 prototype:**
- Reviews: 2–3 hardcoded realistic reviews per station. Written to sound like real Indian EV drivers, including specific complaints and praise. Include reviewer name, date, star rating, verified-session badge.
- Photos: 2–3 placeholder images per station, categorized (entrance, connector, parking, café)
- Quick-report chips visible on Station Detail: "Report broken", "Report cable damaged", "Report parking blocked" — tapping shows a toast "Report submitted, thanks" but does nothing
- "Confirm it worked" button visible only on Session complete → adds to reliability data

**Data model:**
```
station_review {
  id, station_id, user_id, session_id,
  rating_1_to_5, text, created_at, is_verified
}
station_report {
  id, station_id, user_id,
  type (BROKEN | CABLE_DAMAGED | PARKING_BLOCKED | LIGHTING_ISSUE),
  created_at, resolved_at
}
station_photo {
  id, station_id, user_id,
  url, category (ENTRANCE | CONNECTOR | PARKING | CAFE | GENERAL),
  created_at, is_curated
}
```

**Why this matters:** this is the Google Maps play. Once users contribute, the data quality compounds and no CPO can match it. But we don't need real UGC in V1 — we need the *UX pattern* proven.

---

## Lightweight data model (for the prototype seed data)

We don't need a real database for V1. All data lives in JSON files loaded on app start. But it helps to think in tables so the seed data is consistent.

**Tables to seed (all as JSON):**

| Table | Rows | Purpose |
|---|---|---|
| `cpo` | 6 | CPO brands (Tata Power, Jio-bp, Statiq, HPCL, IOCL, BPCL) with logos |
| `station` | ~60 | Real coordinates in Mumbai + Delhi, distributed across CPOs |
| `connector` | ~120 | 1–3 per station, mix of CCS_2 / TYPE_2_AC / BHARAT_DC_001 |
| `station_reliability` | ~120 | One per connector, hand-tuned distribution |
| `station_review` | ~150 | 2–3 per station, realistic tone |
| `station_photo` | ~180 | 3 per station, categorized |
| `vehicle_catalog` | ~15 | Popular Indian EVs |
| `user_vehicle` | 1 | Demo user's vehicle |
| `session_history` | ~15 | Past sessions for the Passport |

**Not seeded (live/mocked at runtime):**
- Current session state (React state)
- UPI mandate flow (setTimeout-driven state machine)
- Live connector status (fake ticks that flip Occupied/Available on interval)

---

## Scope table

| Feature | V1 (4 weeks) | V1.5 (post-pilot) | V2 (post-traction) | Dropped |
|---|:-:|:-:|:-:|:-:|
| Unified Map | ✅ | | | |
| Station Detail | ✅ | | | |
| Reliability Score (shown) | ✅ | | | |
| Reliability Score (real compute) | | ✅ | | |
| Scan to Charge (mocked) | ✅ | | | |
| Scan to Charge (real QR) | | ✅ | | |
| Session Screen (animated) | ✅ | | | |
| Session Screen (real OCPP) | | | ✅ | |
| UPI Flow (mocked UI) | ✅ | | | |
| UPI Flow (real Razorpay) | | ✅ | | |
| Route Planner (3 hardcoded routes) | ✅ | | | |
| Route Planner (any route + re-plan) | | ✅ | | |
| EV Profile (one vehicle) | ✅ | | | |
| Multi-vehicle | | | ✅ | |
| Charging Passport (seeded history) | ✅ | | | |
| Charging Passport (real history) | | ✅ | | |
| Battery health (fake trend) | ✅ | | | |
| Battery health (from OEM telematics) | | | ✅ | |
| Community reviews (hardcoded) | ✅ | | | |
| Community reviews (real UGC) | | ✅ | | |
| Station photos (curated) | ✅ | | | |
| Station photos (user uploads) | | ✅ | | |
| Smart Recommendation (seeded scoring) | ✅ | | | |
| Smart Recommendation (learned) | | | ✅ | |
| Reservations | | | ✅ | |
| Fleet dashboard | | | ✅ | |
| Developer API portal | | | ✅ | |
| Dynamic pricing engine | | | | ❌ |
| Notification service (push/SMS) | | ✅ | | |
| Native mobile (Capacitor wrap) | | ✅ | | |
| OCPP central system | | | ✅ | |
| Beckn / UBC | | | ✅ | |
| MQTT telemetry | | | ✅ | |
| GraphQL federation | | | | ❌ |
| Kafka event bus | | | | ❌ |
| TimescaleDB | | | | ❌ |
| Microservices architecture | | | | ❌ |
| Admin panel | | ✅ | | |

---

## Success criteria for the demo

The prototype is done when we can put it in front of a stranger who owns an EV and, without any explanation from us, they:

1. Understand the app in under 60 seconds
2. Find at least one station they'd actually drive to
3. Complete the "scan → session → payment" flow
4. Notice the Reliability Score without being pointed to it
5. Say some version of "when can I get this?"

If any of those five don't happen, the design has a specific problem worth fixing.

**For an investor demo specifically, the additional bar:**

- The 15-minute pitch runs without the demo lagging, crashing, or needing a "just imagine…" caveat
- One screen produces a spontaneous "oh, that's actually interesting" — likely candidates: reliability tier coloring on the map, the recommendation-reason cards, the mock UPI settlement animation
- The founder story lands in the first 90 seconds and is referenced at least once by the investor in Q&A

---

## What lives outside this document

The following documents remain in the repo but are **reference for the eventual production platform, not spec for V1**:

- `caas_master_blueprint.md` — production architecture, OCPP, Beckn, microservices
- `caas_platform_blueprint.md` — same, more depth on some sections
- `caas_api_contracts.md` — GraphQL / REST / webhook contracts for the eventual production platform

If V1 lands a pilot with a CPO, we go back to those docs and start building the real thing. Until then, they don't drive any V1 decisions.

---

## Open items to resolve before build kicks off

1. **Coding comfort level (Dilip):** are you comfortable with React/Next.js, some JS but not React, or not really coding? Determines whether the plan is "you build, I unblock" or "I scaffold, you fill in" or "we go Figma-clickable-prototype instead."
2. **App / company name:** doesn't block build, but needed for landing page copy and demo polish. Suggest deciding by end of Week 2.
3. **Google Maps API key:** free tier covers demo scale, but requires a Google Cloud account and billing enabled (won't be billed at demo volume, but card needed). Set up by end of Week 1.
4. **Deployment target:** Vercel free tier is the default recommendation. Confirm.
