# Layer 3 — Production Platform Architecture

> Scope: what Unified-EV becomes after the second CPO signs, past ~10k monthly users, past ~₹50L monthly transaction volume, and typically post-Series-A. Months 9 through year 2+. A small team grows to 5–15 people. Compliance stops being optional. Team shape starts driving architecture.
> Companion documents: `01_MVP_Overview.md`, `02_Layer_1_V1_Prototype.md`, `03_Layer_2_Post_Pilot.md`.

---

## 1. The mission of Layer 3

Take the working Layer 2 platform and scale it — not just in traffic, but in surface area (multiple CPOs, multiple audiences, multiple products) — without collapsing under the operational burden of the original blueprint's 11-microservice architecture.

**The guiding principle of Layer 3:** stay boring on infrastructure, invest heavily in the parts that are actually your moat (protocol adapters, reliability compute, community data). Every service you split, every tool you add, every abstraction you introduce is a permanent tax on velocity. Pay only when the tax is smaller than the pain.

The single biggest risk in Layer 3 is over-engineering. The second biggest is under-engineering (usually payments and compliance). Both kill companies. This document is about walking the line.

---

## 2. What triggers Layer 2 → Layer 3

Specific signals, not calendar dates:

- **Second CPO signs.** Now the adapter pattern's formalization matters. Now multi-tenant settlement gets real.
- **~10k monthly active users.** Not "signups" — repeated actual users. Below this, everything scales fine on Layer 2 infra.
- **~1,000 sessions/day.** Below this, single Postgres handles both transactional and analytical queries.
- **Team hits 4+ engineers.** Module boundaries need enforcement. Deploy coordination becomes real.
- **First enterprise fleet contract.** Triggers ISO 27001 gap analysis, DPA templates, security posture questions.
- **Series A raised (or actively raising).** Investors expect a real architecture story, real ops discipline, real compliance roadmap.

Any one of these alone doesn't force Layer 3. Two or three together do.

---

## 3. Monolith vs microservices — the decision that defines the next 3 years

This is where most startups get it wrong. The instinct at this stage is: *"we're scaling, we need microservices."*

The reality:

- **Netflix** ran on a Rails monolith to ~100 engineers before splitting into services.
- **Shopify** still runs a modular Ruby monolith at billions of dollars in GMV.
- **GitHub** was a Rails monolith until they had thousands of engineers.
- **Amazon** didn't split into services because of scale — they split for team autonomy (Bezos' two-pizza rule).

**The rule that matters: services should equal teams, not domains.** Splitting a domain into a service before a real team owns it end-to-end gives you distributed transactions, deployment coordination overhead, and a distributed monolith — the worst of all worlds. Ops burden explodes for zero product benefit.

### 3.1 What Unified-EV actually does

Stay in the Next.js codebase (or split into a Next.js frontend + a Fastify/NestJS backend if the frontend/backend boundary gets awkward — that's *one* extraction, not eleven). Enforce **module boundaries inside the monolith**:

```
src/
├── modules/
│   ├── stations/
│   │   ├── api/            # public interface — what other modules call
│   │   ├── internal/       # private — nothing outside stations/ imports
│   │   └── index.ts        # re-exports only from api/
│   ├── sessions/
│   ├── payments/
│   ├── reliability/
│   ├── cpo-adapters/
│   ├── fleet/
│   ├── notifications/
│   └── analytics/
```

Cross-module imports go through `modules/*/api` only. Enforce with `dependency-cruiser` in CI — commits fail if `modules/sessions/internal/foo.ts` gets imported from `modules/payments/`.

When you eventually extract a module into a service, it comes out *clean* because the boundaries were maintained.

### 3.2 The one exception — telemetry ingestion

Real-time telemetry from CPOs (via OCPP/OCPI push or MQTT) has a fundamentally different traffic shape from the rest of the app:

- High message rate, small payloads
- Bursty (spikes when many sessions active)
- Needs low-latency fan-out to WebSocket subscribers
- Data pipeline: ingest → hot cache → fan-out → batch to DB

This is the one place a **dedicated telemetry service** in Go / Node / Rust earns its keep. Deploy it separately from the main app. Everything else stays in the monolith.

```
Chargers → CPO's OCPP CSMS → Telemetry Ingestion Service (Node/Go)
                                       ↓
                                 Redis (last-known state per connector)
                                       ↓
                    WebSocket server → subscribed app clients
                                       ↓
                    Batch writer → Postgres (every 30s aggregates)
```

### 3.3 When to split further

Do not split additional modules into services until:

- A team of 3+ engineers owns that module full-time
- The module has genuinely different scaling shape (compute-heavy, memory-heavy, unusual language requirement)
- Deployment coupling between the module and the rest of the app is causing real coordination pain

If you hit those criteria for `payments` (likely first) or `reliability` (possible), extract them. Not before.

---

## 4. Payment architecture at scale

### 4.1 Stay on Razorpay Route indefinitely

The sub-merchant model from Layer 2 continues to work as you scale. It has two limits worth knowing:

**Limit 1 — commercial:** Razorpay's Route fee is ~0.5-1% of transaction value on top of the base transaction fee. At scale, this becomes material. If you're processing ₹100+ crore monthly, negotiating direct with a PA license would save meaningful money — but only if the license is achievable.

**Limit 2 — product:** Route makes it hard to offer prepaid credits, cross-CPO loyalty points, or offline reconciliation. If your product roadmap needs those, Route stops being enough.

### 4.2 When to consider becoming a Payment Aggregator

Serious answer: probably never, unless the company becomes very large. RBI PA license requires:

- ₹25 Cr net worth (was ₹15 Cr until recently)
- Detailed technical + operational KYC
- Ongoing compliance overhead (audit reports, escrow account, quarterly filings)
- 18+ months from application to approval

Realistically, this is a Series B+ decision. If you're at that stage, you have a dedicated finance/legal team to handle it, and it becomes a company-level project rather than an engineering refactor.

### 4.3 Settlement reconciliation

At scale, sub-merchant settlements need automated reconciliation:

- Daily settlement reports from Razorpay per CPO
- Cross-check against internal `sessions` table
- Flag discrepancies (missing settlements, over-settlements, refund mismatches)
- Automated CPO settlement dashboards ("here's what we settled to you this week, here's the breakdown per station")

Build a dedicated `settlement-reconciliation` module for this in the monolith. It's read-heavy, mostly batch, doesn't need real-time.

---

## 5. Protocol adapter layer — the moat, formalized

By Layer 3 you're integrated with 5–10 CPOs. The V2 adapter pattern gets a real structure:

```
src/modules/cpo-adapters/
├── api/
│   ├── types.ts              # public: StationUpdate, SessionEvent, RemoteStartInput, ...
│   └── adapter-runtime.ts    # the runtime that picks the right adapter for a session
├── internal/
│   ├── protocols/
│   │   ├── ocpi-2.2.ts       # full OCPI 2.2 spec implementation
│   │   ├── ocpp-16j.ts       # only if we run any CPO's CSMS (rare)
│   │   └── beckn-mobility.ts # Beckn Protocol / UBC — for government tender alignment
│   ├── cpos/
│   │   ├── tata-power.ts     # uses proprietary REST
│   │   ├── jio-bp.ts         # uses proprietary REST
│   │   ├── statiq.ts         # uses ocpi-2.2
│   │   ├── hpcl.ts           # uses proprietary REST
│   │   └── ...
│   └── event-normalizer.ts   # maps native events → SessionEvent shape
```

Rules:

- **One adapter per CPO.** Even if they speak the same protocol, keep the file separate — each CPO has quirks.
- **All adapters produce the same `SessionEvent` shape.** The rest of the platform is protocol-agnostic.
- **Adapter tests are contract tests.** Given a fixture of CPO responses, adapter must produce the expected internal events. Prevents CPOs "quietly" changing their API from breaking us silently.
- **Adapter versioning.** When a CPO's API version changes, we run adapter-v1 and adapter-v2 in parallel until migration is complete.

### 5.1 The Beckn / UBC play

Beckn Protocol (India's open network protocol for commerce, backed by government via ONDC and analogously extended to mobility as UBC — Unified Bharat e-Charge) is worth building for two reasons:

- **Regulatory alignment.** Beckn/UBC compliance signals to regulators that you're part of the open-network vision, not a walled garden. Meaningful for government tenders and public-sector fleet contracts.
- **Adapter economics.** Once Beckn/UBC gets meaningful CPO adoption, adding a CPO becomes "they published to Beckn, we consume from Beckn" — one adapter to add many CPOs. Currently the network is thin but growing.

Build the Beckn adapter after the first 3–5 direct CPO integrations, once you have enough experience to normalize confidently.

### 5.2 OCPP vs OCPI — final clarification

This confusion has burned every EV startup at some point. State it clearly:

- **OCPP** = charger ↔ CSMS (CPO's own backend). You speak this only if you *are* the CSMS (running the CPO's backend for them). Unified-EV is not a CSMS — we're an eMSP.
- **OCPI** = CPO ↔ eMSP (that's us). Server-to-server. This is the protocol you speak with 80% of real CPO integrations.
- **Beckn / UBC** = network-level. Discovery, transaction, and settlement across an open network. Adjacent to but not replacing OCPI.

For any CPO conversation, ask upfront: *"Do you expose an OCPI endpoint we can consume, or would you like us to integrate against your proprietary API?"* Their answer determines the adapter you build.

---

## 6. Event system — the discipline

The old blueprint proposed Kafka. Don't.

### 6.1 The event system progression

1. **Postgres LISTEN/NOTIFY** — good to ~1,000 events/sec. That's ~86M events/day. Unified-EV will not exceed this before Layer 4.
2. **Redis pub/sub** — if you need fan-out beyond Postgres consumers (typically for the telemetry service or if you have separate WebSocket workers). Good to ~50k events/sec.
3. **NATS / Kafka** — only if you have compliance-mandated event replay/audit (unlikely) OR you're doing 100k+ events/sec (also unlikely at Indian EV scale for the foreseeable future).

### 6.2 Where Unified-EV lands

- **Internal app events** (sessions, reservations, connector state changes) — Postgres LISTEN/NOTIFY. Simple, transactional (event is atomic with the DB change), zero operational overhead.
- **Telemetry fan-out** — Redis pub/sub in the dedicated telemetry service. Necessary because WebSocket subscribers scale beyond one Postgres.
- **Nothing else.** No Kafka. No RabbitMQ. If a specific consumer needs replay (rare — usually compliance auditors), build it against Postgres `sessions` + `session_telemetry` history directly. Those are your event store.

### 6.3 Idempotency

Every event handler must be idempotent — safe to run multiple times without side effects. This is a general good practice, and it becomes critical when you have retries, network hiccups, or reprocessing after downtime. Bake it in from day one of Layer 3.

---

## 7. Reliability score at scale

The Layer 2 approach (materialized view refreshed every 15 min from raw sessions) holds until you have millions of daily sessions.

**Escalation path when it stops being enough:**

1. **Incremental compute on session events.** When a session ends, an event handler updates just that connector's reliability aggregate. Materialized view becomes a nightly correctness check.
2. **Windowed aggregates in Postgres.** Use `tstzrange` + range aggregation to compute rolling 30-day windows efficiently.
3. **Precomputed rollups.** Daily rollups of session counts per connector; reliability computed from rollups instead of raw sessions.

Do not switch to a stream processor (Flink, Spark Streaming) unless the entire reliability compute doesn't fit in Postgres — which won't happen at Indian scale.

**Reliability at scale gets an important addition:** confidence intervals. At 20 sessions, a 95% score has wide confidence bounds. At 1000 sessions, that bound is tight. Display should reflect this:

- "94% ± 2%" for high-sample-size connectors
- "94% ± 8%" for lower-sample
- Only surface tight-bound scores as the pin's colored tier; wider-bound scores show the number but with a neutral pin

This matters because a driver who sees "94%" and finds the charger broken will lose trust faster than one who sees "94% ± 8%" and understands the uncertainty.

---

## 8. Data architecture at scale

### 8.1 When to split OLTP and OLAP

For the first ~1M sessions, one Postgres cluster serves both transactional traffic and analytics. When analytics queries (fleet dashboards, CPO admin reports, internal dashboards) start slowing down the app:

- **OLTP** stays in Postgres (transactional, latency-sensitive, source of truth)
- **OLAP** goes to ClickHouse (self-hosted or Aiven) or BigQuery (fully managed)
- CDC via Postgres logical replication or Debezium → analytics warehouse

Trigger: when a single analytical query holds a Postgres row lock for >2 seconds or when app p95 latency starts degrading with analytics traffic.

**Do not add a data warehouse before it hurts.** Adding one is a 2-month project with permanent operational overhead.

### 8.2 Data retention

Raw session data: keep forever. It's cheap in Postgres, it's your moat data.

Session telemetry (high-frequency): keep 90 days at full resolution, downsampled 1-minute averages beyond that. Retention job runs weekly.

Materialized views: refresh, no retention needed.

### 8.3 Backup and disaster recovery

Supabase handles daily backups automatically on paid tier. For Layer 3:

- Enable point-in-time recovery (Supabase Pro)
- Weekly logical dump to S3 (belt-and-suspenders — Supabase has never failed but paranoid)
- Documented recovery runbook: how to restore from PITR, expected downtime, communication template
- Test restore quarterly (yes, actually do it)

---

## 9. Compliance — the load-bearing table

### 9.1 The map

| Compliance | When you need it | Effort | What it costs |
|---|---|---|---|
| **DPDP compliance** (India Data Protection) | Before first paying user | 2 weeks lawyer + engineering | ₹1–3L legal + engineering time |
| **Data Processing Agreement** templates | Before first fleet contract | 1 week legal | ₹50k–1L legal |
| **ISO 27001** | Before first enterprise fleet (Uber, Amazon-scale) | 3 months + external auditor | ₹5–15L first year, ₹3–5L renewal |
| **PCI-DSS SAQ-A** | Automatic — Razorpay handles most PCI scope, we inherit it if we stay narrow | Ongoing self-attestation | ~₹50k/year |
| **SOC 2 Type I → II** | Only if selling to US enterprises | 6–12 months | ₹15–40L |
| **RBI PA License** | Only if becoming a PA (unlikely) | 18+ months, ₹25 Cr net worth | Company-level project |

### 9.2 DPDP practicalities

DPDP (Digital Personal Data Protection Act 2023) is in force in India. It's not optional. What it requires that affects architecture:

- **Data minimization.** Collect only what you need. If you don't need vehicle registration numbers, don't ask.
- **Purpose limitation.** Data collected for charging cannot be shared with third parties (like an insurance partner) without separate consent.
- **Right to deletion.** User can request deletion; we have 30 days to comply. Need a documented process + admin tool.
- **Data localization.** Sensitive personal data must be stored in India. Supabase `ap-south-1` is compliant.
- **Consent records.** Every consent (privacy policy, marketing, third-party sharing) must be timestamped, versioned, revocable.
- **Breach notification.** 72 hours to notify affected users and DPB (Data Protection Board) of any breach.

**Build a `consent` table in Layer 2** even before you legally need it, so you're not retrofitting it later. Every consent event gets logged: user_id, purpose, granted, version, timestamp, ip.

### 9.3 The compliance discipline

Every quarter, one engineer spends 2 days on compliance work:

- Review new data collection since last quarter — is it minimal?
- Review third-party integrations — any new data sharing?
- Test the deletion workflow — does it actually delete cleanly?
- Update consent records if privacy policy changed
- Review access logs to production Postgres — anything unexpected?

This is not glamorous work. It's the work that keeps the company alive.

---

## 10. Fleet dashboard — the B2B product

The first B2B fleet contract triggers a real product surface. Not just an API — a dashboard.

### 10.1 What fleet operators need

- **Multi-vehicle view.** All 50 vehicles on one screen with live SoC (if OEM telematics integrated) or last-known session.
- **Unified billing.** One monthly invoice across all CPOs, all sessions, all vehicles. This is the entire value prop.
- **Session analytics.** Cost per km, energy per km, best-performing driver, wasteful charging patterns.
- **Bulk operations.** Assign vehicles to drivers, set spending limits, freeze cards, get monthly reports emailed.
- **API access.** For fleet ops teams that want to integrate with their existing fleet management software.

### 10.2 What to build first

Start with billing. That's the pain fleet operators bring. Analytics is nice-to-have.

Every fleet gets:
- A `fleets` table row
- `fleet_vehicles` rows for each vehicle
- `fleet_drivers` rows for driver-vehicle associations
- Read-only access to their sessions via RLS scoped to fleet_id
- A monthly invoice generated on the 1st of each month, PDF via Puppeteer + emailed

### 10.3 Fleet API

REST + Webhooks. Not GraphQL. Fleet ops teams want simple REST endpoints they can `curl`.

Auth via long-lived API tokens (not JWT) scoped to fleet_id. Rate-limited via Vercel edge middleware.

Endpoints (partial list):
```
GET  /api/v1/fleets/:id/vehicles
GET  /api/v1/fleets/:id/sessions?from=...&to=...
GET  /api/v1/fleets/:id/invoices/:month
POST /api/v1/fleets/:id/webhooks (register webhook URL for session.completed events)
```

---

## 11. Developer API portal

Only build this when there's clear demand — usually from an OEM or insurance partner asking to embed charging in their app.

### 11.1 What it looks like

- Public docs site (Docusaurus or Mintlify)
- Interactive API explorer
- OAuth 2.0 for user-scoped access, API keys for server-to-server
- Sandbox environment with test CPOs
- Webhook signing + rotation
- Tiered rate limits (free / paid tiers)

### 11.2 What to expose

- Read-only station data (stations, connectors, reliability)
- Session initiation on behalf of a user (with user's OAuth consent)
- Session events via webhooks
- Trip planning API

### 11.3 What NOT to expose

- Payment details or user PII
- CPO-specific admin data
- Internal reliability compute internals (only the score)
- Any endpoint that could be used to abuse rate limits into CPO systems

---

## 12. Team shape drives architecture

The architecture at Layer 3 is downstream of team shape. Design them together.

### 12.1 Typical team growth curve

- **Team of 3** (you + 2 engineers): monolith, no service splits, one engineer per broad area (frontend, backend, ops)
- **Team of 5–7**: monolith + telemetry service. One person becomes "the reliability person," another becomes "the payments person." Module boundaries formalized.
- **Team of 10–15**: consider splitting `payments` into a service if that team of 3+ owns it end-to-end. Same for `reliability` if it becomes a data-science-heavy operation. Not before.
- **Team of 20+**: real microservices possible. But still resist splitting until each service has a real team owner.

### 12.2 Roles that matter as you grow

- **Founding engineer** (you): full-stack, product-minded, wears many hats
- **Second engineer** (month 3–6): specializes opposite you — if you're stronger frontend, hire strong backend, and vice versa
- **Designer** (month 6): product design, not just visual — someone who owns UX end-to-end
- **First infra/DevOps engineer** (month 12+): only when Vercel + Supabase isn't cutting it, which is later than you think
- **Data engineer** (month 18+): only when reliability compute + analytics need dedicated attention
- **Compliance / legal counsel** (part-time, month 12; full-time, month 24+): DPDP + ISO 27001 preparation
- **Head of CPO partnerships** (month 6–12): full-time seller for CPO onboarding

Don't hire ahead of pain. Every unnecessary hire slows the team down before they help.

---

## 13. Multi-region — probably never for India

India has one national grid, one payment regulator, one language market. Single-region deployment in Mumbai (AWS ap-south-1 or GCP asia-south1) will serve Unified-EV until international expansion.

**When multi-region actually matters:** paying customers in a second country. Not "we might expand soon" — actually running the second country's operations. That's a 6-month engineering project with permanent operational overhead. Don't touch it early.

**Data residency exception:** if you take a customer segment (like an EU fleet operator's European drivers) that requires EU data residency, that segment gets its own regional deployment. Isolated, not federated.

---

## 14. Observability at scale

Layer 2's stack (Sentry + Vercel + Supabase + PostHog + Better Uptime) carries most teams to ~50 engineers.

**When to upgrade:**

- Errors: Sentry scales indefinitely.
- Logs: if Supabase dashboard's log search becomes painfully slow, add Axiom or Baselime (cheap, hosted, no ops).
- Metrics: if you need custom business metrics dashboards, add Grafana Cloud (free tier generous, easy).
- Traces: **only** if you split into services and cross-service latency becomes a mystery. Then OpenTelemetry + Grafana Tempo. Don't add before.
- Alerting: as noise grows, invest in a proper on-call rotation (PagerDuty or Opsgenie), not more tools.

Never add Datadog. It's expensive, it's overkill for this scale, and it becomes a permanent ~₹10L/year expense that's hard to walk back.

---

## 15. What Layer 3 deliberately still does NOT do

Even at this scale, some old-blueprint items stay out:

- **No Kubernetes.** Vercel handles the frontend, Supabase handles the DB, one dedicated Node service for telemetry runs on Railway or Fly.io. Total infra services: 3. No Kubernetes justified.
- **No custom ML platform.** Reliability compute is SQL. Recommendation is a scoring function. If you eventually need ML (queue prediction, demand forecasting), start with scikit-learn on a Supabase Edge Function, not TFX/Kubeflow.
- **No GraphQL Federation.** Modular REST endpoints are simpler. Federation was over-engineered from the start for this problem.
- **No blockchain / Web3 / carbon-token whatever.** Real carbon credit accounting is a business/regulatory workflow, not a technology.
- **No IoT platform (AWS IoT Core, Azure IoT Hub).** Telemetry ingestion is one Node service. If you need a platform, you have too many products.

---

## 16. The 5-year architecture picture

If Unified-EV works:

- **Year 1:** Pilot CPO live. 5–10k users. Team of 3. Layer 2 architecture.
- **Year 2:** 5+ CPOs live. First fleet contracts. First B2B revenue. 50k users. Team of 8. Modular monolith + telemetry service.
- **Year 3:** 15+ CPOs. Reliability data is genuinely the standard. Series B raised on data moat. 250k users. Team of 20. Payments extracted as first real service. Compliance formalized (ISO 27001 in flight).
- **Year 4:** OEM telematics integrated (Tata, Mahindra, MG). Vehicle data flows into reliability compute. Developer API has 100+ integrations. 500k users. Team of 40.
- **Year 5:** Regional expansion begins (Southeast Asia — Vietnam / Thailand / Indonesia have similar fragmentation problems). New region gets its own regional deployment. India monolith has become 4–5 services split along real team lines. Team of 60–80.

At year 5, the architecture might finally look like the original CaaS blueprint — 5–7 real services, an event bus, formal compliance. But we get there by *earning it*, not by starting there.

---

## 17. Success criteria for Layer 3

- **Multi-CPO settlement works cleanly.** Zero disputed monthly settlement runs, all sub-merchant transfers reconcile within 24 hours.
- **Reliability data is trusted.** External validation: a national EV publication or automotive journalist references Unified-EV's reliability score as authoritative. This is when the moat becomes visible.
- **B2B revenue exceeds consumer platform fees.** Fleet + developer API subscriptions surpass the ₹7/session line. Signal that the platform layer has real enterprise value.
- **Ops burden per engineer is bounded.** Even as the platform grows, no engineer spends >10% of their time on ops. If it creeps above, invest in tools before hiring.
- **Compliance is on-track, not lagging.** DPDP fully implemented. ISO 27001 in active audit for first enterprise contract. No compliance-triggered churn events.
- **The team can hire.** Word of the platform's reputation attracts engineers who want to work on hard, meaningful infrastructure problems. Recruiting stops being the bottleneck.

Layer 4 (regional expansion, OEM partnerships at scale, potential exit conversations) begins when Layer 3's success criteria hold steadily for 12+ months.
