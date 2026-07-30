# Unified-EV — MVP Overview

> Working name: **Unified-EV** (tentative)
> Version: 1.0 · MVP + comparison against original blueprints and existing market
> Companion documents: `02_Layer_1_V1_Prototype.md`, `03_Layer_2_Post_Pilot.md`, `04_Layer_3_Production.md`

---

## 1. What Unified-EV is

An Indian EV driver installs one app. They open it, see every charger in the country on one map — Tata Power, Jio-bp, Statiq, HPCL, Indian Oil, Bharat Petroleum — colored by how reliable that specific charger has been in the last 30 days. They tap the closest reliable one, scan the QR at the station, approve one payment through their preferred method — UPI, card, or netbanking — and plug in. No prepaid wallets, no minimum top-ups, no proprietary balances trapped in one CPO's app. When the car is done, the exact ₹ is captured from their bank account and any remainder refunded immediately. Every session builds a personal Charging Passport — history, kWh, ₹ spent, CO₂ saved — that lives with them across every charger and every network.

**One app. Every charger. No prepaid wallets. Reliability you can trust.**

That's the product. Everything else in this document is context.

---

## 2. The core insight — reliability is the moat, not the unified app

The obvious pitch is *"one app across all CPOs."* Every founder in this vertical says the same thing. It's true, and it's a feature, but it is not the moat.

**The moat is reliability data.**

Ask any Indian EV owner what they hate more: opening a second app, or driving 15 km to a "working" charger that's broken. It's always the second. Charger reliability — will this actually charge my car when I get there — is the single biggest blocker to EV adoption in India today. And no CPO has any incentive to publish honest reliability data about their own network. Only a neutral, cross-CPO platform can.

If Unified-EV becomes the trusted answer to "will this charger work?", the unified experience is just the delivery mechanism. Reliability data is what compounds — more users → more sessions → better reliability data → more users. Classic network effect on a data asset, not a marketplace asset.

**Every screen in the product must surface reliability. If it doesn't, we're building a directory app.**

---

## 3. Where the idea came from

Dilip owned an EV for a single day. During that trip he encountered three separate CPO networks — Indian Oil, HPCL, Bharat Petroleum — and each one required:

1. Download the CPO's own app
2. Create an account, verify phone
3. Set up a payment method or top up a prepaid wallet
4. Find the specific dock, choose a slot
5. Charge

Then repeat at the next stop. There was no universal way to just plug in and pay. Google Maps showed the pins but had no way to actually initiate a session. He couldn't tell before arriving whether the charger even worked.

This origin is not a pitch invention — it is the actual customer problem, experienced first-hand, that motivated the product. It is the strongest opening slide in any investor conversation.

---

## 4. What Unified-EV is *not*

Being explicit about what we're not building is as important as being explicit about what we are.

Unified-EV is not:

- A Charge Point Operator. We do not own or install chargers. We do not compete with Tata Power on infrastructure.
- A payment aggregator (in the RBI-licensed sense). Money flows through Razorpay Route with each CPO as a sub-merchant; funds never sit in our account.
- A route-planning app. Route planning is a feature, not the product. There are dozens of route planners; there is no reliability layer.
- A fleet management platform (yet). Fleet operators are a natural customer, but B2B fleet is a Layer 2/3 concern, not the V1 wedge.
- A CPO's white-label software. We are neutral by design. A neutral platform is the only entity that can publish honest reliability across all CPOs.
- A "super app." One thing, done exceptionally: cross-CPO charging with trustworthy reliability data.

---

## 5. Comparison — Unified-EV vs the original blueprints

Two earlier documents exist as historical reference: `caas_master_blueprint.md` and `caas_platform_blueprint.md`. These describe a full production platform — 11 microservices, GraphQL Federation, OCPP central system, Beckn/UBC integration, MQTT telemetry, TimescaleDB, Kafka event bus, and more. Unified-EV MVP has descoped or deferred almost all of that.

Here is the direct comparison so no one — Codex, a future co-founder, an investor's technical due-diligence lead — accidentally reintroduces the descoped scope.

| Concern | Original blueprint | Unified-EV MVP | Why the change |
|---|---|---|---|
| Architecture | 11-service monorepo (Apollo Federation) | Single Next.js PWA, all mocked | Solo founder building a demo, not scaling a live system |
| API | GraphQL Federation with subgraphs | Single `DataClient` interface, mock impl | Zero real backend in V1; adapter pattern lets V2 swap in real API |
| Data store | Postgres + PostGIS + Redis + TimescaleDB + S3 | JSON files in `src/data/` + Zustand state | No backend needed for a demo; JSON shapes match future Postgres schema |
| Payments | Live Razorpay UPI mandate + capture | Mocked Razorpay Standard Checkout (UPI + card + netbanking) + settlement animation | Multi-method payment — cards give proven hold-and-capture; UPI mandate offered if it works, cards as guaranteed fallback |
| Charger protocol | OCPP 1.6J / 2.0.1 central system | None (no real chargers to talk to) | We are eMSP, not CSMS. OCPP is only correct if we run CPO backends |
| CPO network | Beckn Protocol / UBC | None in V1 | UBC is a Layer 2/3 discussion; not needed to prove the wedge |
| Real-time telemetry | MQTT ingestion → Redis → GraphQL subscriptions | Fake intervals in React (`setInterval`) | The "live" feel is a UX illusion in V1 — animations, not real data |
| Session state machine | Server-side FSM with retry logic and DB persistence | Client-side React state | The state machine will exist in Layer 2; V1 fakes the outcomes |
| Reservations | Postgres range-exclusion constraint + slot conflict engine | Not built | Reservations are a V2 feature; nice-to-have but not the wedge |
| Fleet dashboard | B2B multi-vehicle + bulk billing service | Not built | Fleet is Layer 3; requires signed fleet contracts to justify |
| Dynamic pricing | Multiplier rule engine + Redis price cache | Not built | Not a differentiator; drops entirely from the roadmap |
| Notifications | Push + SMS + email service | Not built | Nice-to-have V1.5 feature |
| Auth | JWT + OAuth2 + PKCE + refresh rotation | Any 4-digit OTP works, user in `localStorage` | Real auth in Layer 2 via Supabase + MSG91 |
| Deployment | Railway → AWS EKS + multi-region | Vercel free tier, single region | `git push` deploy; India-single-region indefinitely |
| Observability | Grafana + Loki + Prometheus + alerts | Vercel logs + browser console | Ops burden = zero |
| Team required | Blueprint implies 5–10 engineers | Solo dev + Claude | Reality-fit for pre-seed stage |

**Rule of thumb: if a feature from the old blueprints is not in Section 6 or 7 of this document, it's out of V1 by default.** The old blueprints stay in the repo as reference for *when* we get to Layer 2 and Layer 3 — the eventual production platform will look more like the blueprint, not less. The disagreement is only about *when.*

---

## 6. What Unified-EV V1 actually contains — 7 screens

The entire MVP is 7 screens. If a screen isn't on this list, it doesn't exist in V1.

1. **Landing / Onboarding** — the story in 10 seconds. Phone OTP.
2. **Unified Map** — real Google Maps, ~60 seeded stations across 6 CPOs, color-coded by reliability tier (green/amber/red), Smart Recommendation-ranked list in bottom sheet.
3. **Station Detail** — reliability score as the hero (94% • last confirmed 12 min ago), connectors, prices, 2–3 seeded reviews, 2–3 seeded photos, big "Scan to Charge" CTA.
4. **Scan → Session** — mock camera view auto-succeeds → mock Razorpay Standard Checkout (UPI / card / netbanking tabs; UPI default) → live-animating session screen (SoC dial, ₹ counter, kWh counter, kW power dial).
5. **Session Complete + Settlement** — animated hold → capture → refund delta → receipt → return to map.
6. **Route Planner** — 3 hardcoded routes (Mumbai→Pune, Delhi→Jaipur, Bengaluru→Mysore). Draws real polyline via Google Directions. Drops 1 recommended charging stop.
7. **Charging Passport + Profile** — aggregated stats (total kWh, ₹, CO₂), session history, vehicle profile.

Each screen exists to reinforce reliability as the moat:

- Landing headline: *"Know it works before you drive."*
- Map: reliability tier is the pin color.
- Station Detail: reliability score is the top-of-fold hero.
- Session Complete: silently increments the reliability count for that connector, and prompts the user to rate the station (post-session review — only shown to users who actually used the charger).
- Route Planner: recommended stops are the *most reliable* ones, not the nearest.
- Passport: shows *which* stations you've successfully used, building personal trust.

**Reviews policy (important):** only users who have completed a session at a station can write a review for that station. Enforced at the database level — there is no "write anonymous review" or "review a station you've never used" path. This means every user-written review on Unified-EV is verified by construction. No competitor can offer this because they don't see cross-CPO sessions. It's a downstream benefit of the reliability moat.

---

## 7. Comparison — Unified-EV vs existing CPO apps

The competitive landscape today, as an EV driver actually experiences it:

| Dimension | Tata Power EZ Charge | Jio-bp Pulse | Statiq | HPCL/IOCL/BPCL apps | Google Maps EV | **Unified-EV** |
|---|---|---|---|---|---|---|
| Coverage across CPOs | Own network only | Own network only | Own + partners | Own network only | All (as pins only) | **All CPOs unified** |
| Real charger status | Own network | Own network | Partial | Often stale | Rarely accurate | **Live + reliability score** |
| Reliability score | ❌ | ❌ | ❌ | ❌ | ❌ | **✅ — the moat** |
| Payment | Prepaid wallet | Prepaid wallet | Prepaid wallet | Prepaid wallet | Not possible | **Any method, no wallet — UPI / card / netbanking** |
| Trip planning | ❌ | Partial | ❌ | ❌ | Basic | **Multi-CPO aware** |
| Charging history | Own sessions | Own sessions | Own sessions | Own sessions | ❌ | **All CPOs, one passport** |
| Cross-CPO reviews | ❌ | ❌ | ❌ | ❌ | ❌ | **✅ — verified-only (must have used the charger)** |
| Cross-CPO photos | ❌ | ❌ | ❌ | ❌ | Some | **✅ (curated V1, UGC later)** |
| Reservation | Limited | Limited | ✅ | ❌ | ❌ | ❌ V1 → ✅ Layer 2 |
| Fleet | ❌ | Partial B2B | ❌ | ❌ | ❌ | ❌ V1 → ✅ Layer 3 |

The row that matters most is the third: **Reliability Score.** No competitor has it. No competitor can, because no competitor is neutral. This is the wedge.

---

## 8. The user story — start to end

Rohan is an EV owner in Mumbai. He's driving back from Pune with 28% battery. On the highway near Khopoli:

1. Opens Unified-EV. Sees his current battery (from his vehicle profile) and the nearest charging options along his onward route.
2. Map shows 4 chargers within 5 km. Two are green (>90% reliable), one amber, one red. The green ones are 400 m farther than the red one.
3. Taps the top-ranked green pin. Station Detail shows: 94% reliability, last confirmed working 12 minutes ago, ₹18.5/kWh, café on-site, 2 recent verified reviews.
4. Taps "Scan to Charge." Camera opens. Points at the QR sticker on the charger.
5. Razorpay checkout opens with UPI selected (his default from Profile). "Hold ₹500 for EV charging" — Approve. He could have picked his card or netbanking instead; his call.
6. Session starts. Live screen shows kWh climbing, ₹ climbing, SoC filling. He goes for a coffee.
7. 32 minutes later, session ends. Settlement animation shows ₹500 held → ₹347 captured → ₹153 refunded to his UPI. Receipt saved to Passport.
8. Back in the car. Route Planner suggests he'll make it home with 41% battery to spare.

He did all of this in one app. He never downloaded a Statiq app, an HPCL app, or a Tata Power app. He never topped up a prepaid wallet trapped inside one CPO's ecosystem. He paid directly from his own bank via UPI — the same way he pays for everything else. He knew before he drove there that the charger would work.

This is what the demo has to make an investor or CPO feel in 15 minutes.

---

## 9. Business model in one paragraph

**Three revenue streams.** **Consumer platform fee** — flat ₹7 per completed session, added transparently at checkout, split at Razorpay-Route level so it settles to us directly, never touches CPO accounts. **B2B fleet SaaS** — fleet operators (BluSmart, Zomato, Zepto, delivery aggregators) pay ₹500–₹5,000 per vehicle per month for a unified billing surface across networks + API access. **CPO SaaS dashboard** — CPOs pay ₹5,000–₹25,000/month for analytics on their own network (utilization, reliability scores, driver reviews, revenue trends, benchmarking against other CPOs). Both One Bharat Charge and Bolt.Earth offer CMS-style products; the CPO dashboard is a proven B2B line that can start earning before consumer traction scales. At 1,000 sessions/day the consumer fee alone is ₹2.1L/month; at 500 fleet vehicles the fleet line is ₹2.5L/month; 20 CPO dashboard subscriptions at ₹10k/month is another ₹2L/month. Unit economics are net-positive from session 1 because we take no infrastructure cost per session and no working capital risk.

Detailed unit economics live in a separate financial model doc (not yet created — see Section 12 for what's still needed).

---

## 10. Roadmap in one page

| Layer | When | What ships |
|---|---|---|
| **Layer 0 — Preparation** | Now → Week 0 | This doc suite, design system, mockup, first outreach list, Google Cloud + Vercel accounts |
| **Layer 1 — V1 Prototype** | Weeks 1–4 | Mobile-first PWA on Vercel. All 7 screens. All mocked data. Investor and CPO demos. |
| **Layer 1.5 — Iteration** | Weeks 5–8 | Iterate demo based on early conversations. Add secondary screens (OTP, receipt, empty states). Line up first pilot conversation. |
| **Layer 2 — Post-Pilot** | Month 3 (post first pilot handshake) | Real Supabase backend. Real auth (MSG91 + Supabase Auth). One real CPO adapter. Real reliability compute from real sessions. Razorpay Route integration with sub-merchant onboarding for the pilot CPO. |
| **Layer 3 — Production** | Month 9+ | Multi-CPO. Fleet dashboard. Developer API. Compliance layer (DPDP + ISO 27001 if enterprise). Native mobile wrap via Capacitor. Potentially split telemetry into its own service. |
| **Layer 4 — Scale/Moat** | Year 2+ | OEM telematics integrations. White-label option for smaller CPOs. Carbon credit analytics. Regional expansion. |

The three layer documents cover Layers 1–3 in depth.

---

## 11. Success criteria for the MVP

The MVP is done when we can put it in front of a stranger who owns an EV — no explanation from us — and they:

1. Understand the app in under 60 seconds
2. Find at least one station they'd actually drive to
3. Complete the "scan → session → payment" flow without help
4. Notice the Reliability Score without being pointed to it
5. Say some version of *"when can I get this?"*

For an investor demo, the additional bar:

- The 15-minute pitch runs without a lag, crash, or "just imagine…" caveat
- One screen produces a spontaneous "oh, that's actually interesting" — most likely candidates: the map's reliability-tiered pins, the recommendation-reason cards ("400 m farther but 32% more reliable"), or the settlement animation
- The founder origin story lands in the first 90 seconds and gets referenced later by the investor unprompted

For a CPO pilot conversation:

- The demo shows a coherent product without asking the CPO for anything up front
- The pitch answers "what do we get" before they ask (incremental sessions, real reliability data, brand visibility, no hardware or software changes required)
- We can hand them a 1-page pilot spec that says "give us your OCPI endpoint OR access to your live session data, we do everything else"

---

## 12. What still doesn't exist that we'll need

Documents and assets that live outside these four layer/MVP docs:

- **10-slide pitch deck** (Sequoia format). One-hour job once we have a name + logo.
- **One-pager for cold outreach** (single side of A4). Half a day.
- **Pilot agreement template** for CPOs. Needs a lawyer for the legal terms; we can draft the commercial terms.
- **Financial model / unit economics spreadsheet.** Even a rough sheet is enough for pre-seed conversations.
- **Brand identity:** logo, app icon, splash screen, favicon. If "Unified-EV" is the name, we need it wordmarked. If we pick a shorter name, do it before the pitch deck.
- **Realistic seed data:** 60 stations with real Indian coordinates (from OpenChargeMap), 150 realistic reviews written by us to sound like Indian EV drivers, 180 placeholder station photos, 15-vehicle catalog with real specs, 15 fake past sessions for the demo Passport. This is a one-week content sprint parallel to code.
- **Company incorporation:** LLP or Pvt Ltd. Needed before Razorpay Route onboarding, before signing any pilot MoU, before taking money.
- **Domain name:** whatever the app is called, register `.in` and `.com` (and grab the `.app` if available).
- **Google Cloud project** with billing enabled (Maps API needs it, but stays under free tier at demo volume).
- **Vercel account** (personal or org).
- **GitHub org + private repo** for the code (once we start Layer 1 build).
- **Supabase project** (Layer 2 setup — not needed for V1).
- **Advisor(s):** at least one person from the Indian EV industry (someone from Tata Power, Statiq, Ather, or BluSmart), and one from payments / fintech infrastructure (to sanity-check the Razorpay Route + multi-method checkout architecture, especially the hold-and-capture semantics per method). Warm intros only; cold outreach to advisors rarely works.
- **First 20 investor names** for warm outreach when the demo is ready. Focus: pre-seed India-focused funds and angels with mobility / infra portfolios.

---

## 12b. Competitive gap features (from market analysis, 2026-07-30)

After analyzing One Bharat Charge and Bolt.Earth, twelve features surfaced that are missing from V1 but matter for pitch credibility or addressable-market expansion. Rather than dump them all into V1 scope, they're split into two priority tiers, each documented separately:

- **`05_Future_Scope_Must_Add.md`** — six features that hurt the pitch or the addressable market if not added (multi-language support, Bharat AC/DC connectors, 2W/3W vehicle support, National Highway corridor mapping, FAME-II compliance messaging, CPO SaaS Dashboard product).
- **`06_Future_Scope_Should_Add.md`** — six features for credibility, not existential (WhatsApp support, ONDC/UEI membership, RuPay explicit mention, charging session refund policy, ISO 27001 path, CDR OCPI compliance).

Each feature in those docs has a "when to build" marker mapped to Layer 1.5 / Layer 2 / Layer 3. Do not sneak them into V1 scope without an explicit re-scope decision.

---

## 13. Reading order for these documents

If you (or a future co-founder, investor, or Codex) are onboarding into this project:

1. **This document (01_MVP_Overview)** — what we're building and why.
2. **`design_system.md`** — the visual language.
3. **`mockup.html` and `mockup_variants.html`** (from `docs/design/`) — see the screens.
4. **`02_Layer_1_V1_Prototype.md`** — how V1 is built (folder structure, state, mock data, adapters, screens, week-by-week).
5. **`03_Layer_2_Post_Pilot.md`** — what changes on the day a pilot signs.
6. **`04_Layer_3_Production.md`** — what the company becomes at scale.

Reference-only, historical:

- `caas_master_blueprint.md`, `caas_platform_blueprint.md`, `caas_api_contracts.md` — the original production platform blueprint. Useful for understanding *what Layer 3 could look like*, not what we're building now.

If any of these documents contradict each other, this document + the three layer docs are the source of truth. The older blueprints defer.
