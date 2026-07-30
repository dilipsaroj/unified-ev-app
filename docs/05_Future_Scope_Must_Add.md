# Future Scope — Must-Add Features

> Created 2026-07-30 after competitor analysis of One Bharat Charge and Bolt.Earth.
> Updated 2026-07-30: added Tier A/B/C markers after scope decision to pull Tier A into Layer 1.
> Purpose: features NOT in V1 scaffold but which will hurt the pitch or the addressable market if not added by the noted phase. Each entry has explicit tier, "when," "why," "effort," and "trigger" markers.
> Companion: `06_Future_Scope_Should_Add.md` (credibility gaps, less urgent).

## Tier legend

- **Tier A** — pulled into Layer 1 (Weeks 1–5 build). Ship with the V1 demo. Cursor prompts 02 / 03 handle these.
- **Tier B** — deferred to Layer 1.5 (Weeks 5–8 iteration, post-demo). Real dependency on the V1 flow being stable first.
- **Tier C** — cannot be added to Layer 1 or 1.5. Hard dependency on Layer 2 or Layer 3 infrastructure (real backend, incorporation, production ops).

---

## Reading this document

For each feature:

- **What** — one line, what the feature actually is
- **Why it matters** — the market or product reason
- **Competitor precedent** — who's already doing this
- **When to build** — Layer 1.5 / Layer 2 / Layer 3
- **Effort** — rough estimate for a solo dev (day = 1 focused workday)
- **Dependencies / trigger** — what needs to be true before starting
- **Explicit anti-goals** — what NOT to over-scope while adding this

Order below is roughly by urgency (top = do sooner).

---

## 1. Multi-language support — Hindi + English minimum  **[Tier B — Layer 1.5]**

**What.** UI localization across all screens. Every string in a translation file, not hardcoded. Language chooser in Profile. Default detects device locale, falls back to English.

**Why it matters.** India has ~700M internet users but ~60%+ are non-English-first. Any pitch that says "for Indian EV drivers" while showing an English-only demo gets immediate credibility damage from any Indian investor or CPO. This is not "nice to have" — it's a table-stakes market signal.

**Competitor precedent.** One Bharat Charge claims 8 Indian languages (Hindi, Tamil, Telugu, Kannada, Bengali, Marathi, Gujarati, Punjabi). Bolt.Earth is multi-language. Government BHEL/UBC app will be multi-language by mandate.

**When to build.** Layer 1.5 (Weeks 5–8, post-demo). Two languages minimum (Hindi + English) before any investor / CPO conversation moves to a second meeting. Expand to 5+ languages in Layer 2.

**Effort.** 4–6 days for setup + Hindi:
- Day 1: Install `next-intl`, wrap layout with locale provider, set up middleware for locale routing (`/en/`, `/hi/`)
- Day 2: Extract every hardcoded string across the 7 screens into `messages/en.json`
- Day 3–4: Professional Hindi translation of `messages/en.json` — do NOT machine-translate this; use a native Hindi speaker familiar with EV terminology (₹5–10k on Upwork or a bilingual friend)
- Day 5: Language chooser UI in Profile screen
- Day 6: Test on all screens, fix RTL edge cases (Hindi is LTR but some UI patterns break)

Adding one more language after that = ~1 day per language (translation being the main cost, ~₹3–5k per language).

**Dependencies / trigger.** V1 scaffold shipped. All 7 screens implemented in English first (extracting strings from a screen mid-build wastes time).

**Anti-goals.**
- Do NOT localize error codes, log messages, or admin-facing text. Only user-facing UI.
- Do NOT support 8 languages at launch. Start with 2, prove the pattern, expand.
- Do NOT use auto-translation for anything shipped. Every language needs a human review.

---

## 2. Bharat AC + Bharat DC connector support  **[Tier A — Layer 1]**

**What.** Include `BHARAT_AC_001` and `BHARAT_DC_001` in the `ConnectorType` enum and seed data. These are India-specific low-power charging standards defined by the Ministry of Power (originally for 2-wheelers, 3-wheelers, and budget 4-wheelers).

**Why it matters.** India's EV market is dominated by 2W (10–15M vehicles projected by 2030) and 3W (autorickshaws — millions on the road). Both segments overwhelmingly use Bharat AC/DC standards, not CCS2. If your app doesn't support them, you've cut off ~70% of India's EV vehicle population by count.

**Competitor precedent.** One Bharat Charge explicitly markets "Bharat AC · Bharat DC" support. Bolt.Earth's whole 2W strategy is built around Type-6 / Type-7 fast chargers (proprietary variants but aligned with Bharat AC/DC).

**When to build.** Layer 1 seed data expansion (before Week 4 demo). Enum addition already noted in `03_Layer_2_Post_Pilot.md` schema section. Seed data expansion is a data-only change, no component work.

**Effort.** 0.5 days:
- Update `connectors.json` — swap 20–30% of stations to have BHARAT_AC or BHARAT_DC connectors
- Update `mockClient.ts` filter logic if any type-specific handling exists
- Confirm map pins still render (they should — the "D/A letter" pin design accommodates any type)

**Dependencies / trigger.** None — do this immediately after Layer 1 scaffold lands.

**Anti-goals.**
- Do NOT add a new pin visual for Bharat connectors. Same D (DC) / A (AC) letter system works; just the underlying type differs.
- Do NOT try to model the Bharat AC/DC v1 vs v2 spec differences. One value each; refine only when a real CPO integration needs it.

---

## 3. 2-wheeler and 3-wheeler vehicle types  **[Tier A — Layer 1]**

**What.** Expand `vehicle_catalog` to include popular Indian 2W and 3W EVs. Add `vehicleClass` field (`TWO_WHEELER | THREE_WHEELER | FOUR_WHEELER | COMMERCIAL`) so downstream logic can filter (route planner, connector compatibility, price estimates).

**Why it matters.** Same as #2 — 2W and 3W are the majority of Indian EV market by unit count. A vehicle profile flow that only lets me pick a Nexon EV or Tata Punch signals the app is for a premium niche, not the mass market. Also: 2W/3W have different charging patterns (shorter, more frequent, home-charging heavy) — pretending they don't exist misses actual user needs.

**Competitor precedent.** Bolt.Earth's app supports 2W, 3W, 4W selection at onboarding — they explicitly market to all three segments. OBC lists Bharat AC/DC for 2W/3W.

**When to build.** Layer 1 seed data expansion (before Week 4 demo). Include in same sprint as #2.

**Effort.** 1 day:
- Add 5 2W models: Ather 450X (3.7 kWh battery, Type 6), Ola S1 Pro (4 kWh, Type 6), TVS iQube (5.1 kWh, Type 6), Bajaj Chetak (3.5 kWh, Type 6), Hero Vida V1 (3.9 kWh, Type 6)
- Add 2 3W models: Mahindra Treo (7.4 kWh, Bharat DC), Bajaj RE E-Tec (8.9 kWh, Bharat DC)
- Add `vehicleClass` field to `vehicle_catalog` schema (already present as `vehicleType` enum on User in some docs — reconcile naming)
- Add a segment-picker step to onboarding (2W / 3W / 4W)
- Filter connector compatibility based on selected vehicle class in Station Detail

**Dependencies / trigger.** Depends on #2 (Bharat AC/DC connectors seeded) for accurate compatibility filtering.

**Anti-goals.**
- Do NOT try to model exhaust vehicle specs (motor kW, top speed, torque). Just the fields that matter for charging: battery kWh, connector type, avg consumption Wh/km, max charge rate kW.
- Do NOT redesign screens for 2W. Same screens work — the map, station detail, session all render fine at any vehicle scale.

---

## 4. National Highway corridor mapping in Route Planner  **[Tier B — Layer 1.5]**

**What.** Tag stations by NH corridor they sit on (`NH-48`, `NH-44`, `NH-19`, `NH-58`, `NH-16`). Route Planner considers corridor when suggesting stops on a long trip — prefers stations on the same corridor over detours.

**Why it matters.** Long-distance EV road trips are the #1 EV anxiety in India (range + charging combined). "Can I drive Mumbai to Bengaluru in my EV?" is what makes people not buy EVs. A route planner that visibly maps to India's actual highway system (not just Google's generic directions) signals real Indian domain expertise. Also: highway station coverage is where CPOs are actively expanding — being the app that highlights this well positions you for CPO partnerships.

**Competitor precedent.** One Bharat Charge explicitly names "69+ Highway stations across 7 NH corridors" as a moat. Their trip planner is corridor-aware.

**When to build.** Layer 1.5 (Weeks 5–8) OR Layer 2. Not required for V1 demo but strong for the "when we grow" pitch.

**Effort.** 3–4 days:
- Day 1: Add `nhCorridors: string[]` field to `stations` schema. Tag ~20% of seed stations with NH corridor IDs.
- Day 2: Update Route Planner scoring to weight corridor matches higher
- Day 3: New "Highway trip" mode toggle in Route Planner UI — filter map to highway stations only, show corridor labels on pins
- Day 4: Test 3 real routes end-to-end (Mumbai→Pune NH-48, Delhi→Jaipur NH-48, Bengaluru→Mysore NH-275)

**Dependencies / trigger.** V1 Route Planner shipped and working with 3 hardcoded routes. This turns it from hardcoded to corridor-derived.

**Anti-goals.**
- Do NOT try to model every NH corridor (there are dozens). Start with the 5–7 with highest EV adoption.
- Do NOT integrate with government NH data feeds. Hardcoded corridor list is fine until Layer 3.

---

## 5. FAME-II compliance messaging in pitch materials  **[Tier A — Layer 1]**

**What.** Not a product feature — a pitch talking point. Position Unified-EV as "FAME-II aligned" wherever CPO conversations happen. Add it to the CPO partnership deck and one-pager.

**Why it matters.** FAME-II is the Government of India subsidy scheme funding EV charging infrastructure. CPOs care deeply about compliance because subsidy eligibility depends on it (specifically: FAME-II mandates OCPI 2.2.1 compliance for funded stations). When you tell a CPO "we're FAME-II aligned via OCPI 2.2.1 adapter support," you're telling them your platform won't jeopardize their subsidy. Zero-effort credibility.

**Competitor precedent.** One Bharat Charge markets "FAME-II aligned" prominently. It's table-stakes in CPO conversations.

**When to build.** Layer 0 / Layer 1.5. This is a copy update, not a build. Add to the pitch deck when it's drafted. Layer 2 CPO adapter implementation should be OCPI 2.2.1 compliant to back the claim.

**Effort.** 0 days for the pitch mention. Layer 2 OCPI adapter compliance is already in scope in `03_Layer_2_Post_Pilot.md`.

**Dependencies / trigger.** None for the messaging. For the technical backing: real OCPI 2.2.1 adapter implementation happens when the first pilot CPO uses OCPI.

**Anti-goals.**
- Do NOT claim FAME-II certification if we haven't been through it. "Aligned with FAME-II open protocol requirements" is honest; "FAME-II certified" without paperwork is a lie.

---

## 6. CPO SaaS Dashboard product  **[Tier C — Layer 3, cannot be in Layer 1]**

**Why Tier C:** the dashboard's entire value is showing CPO admins real data about their network. Mock data on a CPO's own dashboard is not just useless — it's misleading and damaging in a sales conversation. Requires (a) real backend with CPO-scoped RLS (Layer 2), (b) real CPO integrations producing session/reliability data (Layer 2), (c) at least 3 CPOs live with meaningful data (early Layer 3). Do not attempt in Layer 1 even as a mockup.

**What.** A separate product surface (web-only) where CPO admins log in and see: their stations' utilization, reliability scores, driver reviews, revenue trends, benchmarking against network averages, session-level detail. Not free — priced ₹5,000–₹25,000/month per CPO depending on network size.

**Why it matters.** Two reasons.

(1) **Revenue.** This is B2B SaaS with high margin — no per-session cost, recurring revenue, credit-card-billable. Both OBC and Bolt.Earth have this as an explicit revenue line. Can start earning meaningful revenue before consumer traction scales — a Series A investor loves this data point.

(2) **Distribution.** Once a CPO uses the dashboard daily to see their network's performance, they become embedded in your platform. Switching to a competitor requires losing their historical analytics. High switching cost = the platform's actual moat.

**Competitor precedent.** OBC lists "CPO SaaS dashboard subscriptions" as revenue stream #3. Bolt.Earth sells a full CMS (Charger Management System) as a separate product. Statiq is moving this direction with their aggregator play.

**When to build.** Layer 3. Absolutely nothing to build before the first pilot CPO is live and generating real data — the dashboard is worthless without real sessions in it. But architect Layer 2 data model with this in mind: every session, every review, every reliability event needs CPO-scoped access via RLS so the dashboard can be built as a read-only view on top later.

**Effort.** 3–4 weeks for a v1 CPO dashboard (Layer 3):
- Week 1: New route surface `/cpo/*` with CPO-role-scoped auth. Reuse main app's design system.
- Week 2: Utilization + revenue trend dashboards. Chart library already in stack (Recharts).
- Week 3: Reliability score deep-dive per station + review moderation queue.
- Week 4: CPO onboarding flow, billing (Razorpay Subscriptions), monthly PDF report emails.

**Dependencies / trigger.** At least 3 CPOs live on the platform + at least ₹10L cumulative session GMV. Before that there's no data worth paying for. Also depends on multi-tenant RLS design being solid in Layer 2 (see `03_Layer_2_Post_Pilot.md` Section 7).

**Anti-goals.**
- Do NOT build the CPO dashboard as a separate app. It's the same Next.js codebase, different routes, different role-scoped views. Splitting the codebase now = premature.
- Do NOT price it in the ₹100–500/month range (SaaS anti-pattern for enterprise India — too cheap signals low value). ₹5,000+ minimum.
- Do NOT try to sell it before you have real data to show. First pilot CPO gets it free for 6 months; only from CPO #3 onward do you charge.

---

## Cross-cutting decisions

- **All six features should be reflected in the pitch deck** when it's drafted, even if only #5 (FAME-II messaging) requires no build work. Investors ask "what does your roadmap look like" — this is the answer.
- **The scope table in `01_MVP_Overview.md` Section 12b** now includes rows for all six. Update it if any of these get built or deprioritized.
- **`06_Future_Scope_Should_Add.md`** covers the second tier — features for credibility, not existential. Read it before scoping any additional work.
