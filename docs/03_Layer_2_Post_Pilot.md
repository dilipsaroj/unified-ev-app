# Layer 2 — Post-Pilot Architecture

> Scope: what changes on the day the first CPO signs a pilot. Weeks 9–24 roughly. Still one small team. One codebase. One region. Real data enters. The V1 prototype swaps its mocks for real integrations without a rewrite.
> Companion documents: `01_MVP_Overview.md`, `02_Layer_1_V1_Prototype.md`, `04_Layer_3_Production.md`.

---

## 1. The mission of Layer 2

Turn the demo into a product. The V1 PWA has real users on it — the pilot CPO's drivers, plus early adopters we've onboarded. Real money moves. Real reliability data starts accumulating. But we're still small: 1–3 engineers, one CPO integrated, low thousands of monthly sessions.

**The one guiding principle of Layer 2:** if V1 followed the DataClient adapter pattern correctly, most of Layer 2 is *implementing `apiClient.ts`*. The frontend barely changes. The heavy lifting is backend, CPO integration, payments, auth, and multi-tenant data — all new but all isolated from the UI.

---

## 2. What triggers the Layer 1 → Layer 2 transition

Not a calendar date. A specific event: **a CPO signs a pilot agreement** and hands us either an API endpoint, session data access, or a technical POC scope. Concretely:

- Pilot MoU signed (paper, LLP-signed — not a handshake)
- CPO gives us one of: OCPI 2.2 endpoint, custom REST API docs, or read access to their session database
- Commercial terms defined (₹7 platform fee at Razorpay Route level, sub-merchant onboarding process agreed)
- Scope: N stations, N months of pilot, pre-defined success metrics

Until that happens, we stay in Layer 1 iteration mode — polishing demos, doing more pilot outreach, running the app on our own phones.

**Do not start Layer 2 work speculatively.** It's tempting because the architecture is more interesting. But building Supabase + real payment + CPO adapter before any CPO has actually signed is 8+ weeks of premature work that may need to be redone based on the CPO's actual API shape.

---

## 3. Stack additions (kept minimal)

Layer 2 adds four things to the V1 stack. Nothing else changes.

| Concern | Choice | Why |
|---|---|---|
| Backend + DB + auth | **Supabase** | Postgres + RLS + auth + realtime + storage + Edge Functions in one dashboard |
| Server state | **TanStack Query (React Query)** | Handles fetch/cache/refetch cleanly; pairs perfectly with Supabase client |
| SMS OTP | **MSG91** (or Supabase phone auth) | India-native, cheap, high delivery on Indian carriers |
| Payment | **Razorpay Route (JS + Node SDK)** | Sub-merchant model — legal without PA license |

That's it. Everything else — Next.js, Tailwind, Zustand, framer-motion, Google Maps, Vercel, PWA setup — carries over unchanged from V1.

**What we still don't add in Layer 2:**
- No Kafka. No RabbitMQ. Supabase Realtime (Postgres LISTEN/NOTIFY under the hood) handles pub/sub.
- No Redis. Postgres + Vercel edge cache are enough at pilot scale.
- No microservices. Still one Next.js app.
- No native mobile app yet (unless the pilot CPO explicitly requires App Store presence — then Capacitor wrap).
- No dedicated event bus.
- No separate analytics warehouse. Supabase Postgres holds everything.

---

## 4. Supabase — why and how

### 4.1 Why Supabase (and why not the alternatives)

Supabase collapses the first year of infrastructure into one dashboard:

- **Postgres** — with automatic REST + GraphQL APIs generated from the schema
- **Row-Level Security (RLS)** — multi-tenant scoping without a single line of application code
- **Auth** — phone OTP built in, plus email/social if we ever need
- **Realtime** — WebSocket subscriptions on any table (backed by Postgres LISTEN/NOTIFY)
- **Storage** — S3-compatible for station photos and receipts
- **Edge Functions** — Deno runtime for logic that can't be a database function (Razorpay webhook handling, CPO adapter polling)
- **Cron** — scheduled jobs via `pg_cron` extension (for the 15-minute reliability recompute)

Free tier gets us through the first pilot. Paid tier at $25/month covers well past 10k users.

**The escape hatch matters:** it's plain Postgres. If we outgrow Supabase, we dump the schema and point the app at Railway RDS or Neon with zero rewrite. We lose Realtime helpers and Auth (both are 2-week rebuilds), but the data model stays untouched.

**Rejected alternatives:**

- **Railway + Node/Fastify + Postgres** — more control, but we're building our own auth, realtime, storage. That's 3 weeks of infrastructure work Supabase gives for free.
- **Vercel Functions + Neon** — Vercel Edge Functions can't hold long-lived WebSockets. Realtime becomes complicated.
- **Firebase** — locks us into a proprietary NoSQL data model. Never Postgres. Can't migrate off. Also: less flexible RLS.
- **Raw AWS** — a full-time DevOps job. Not viable for a small team.

### 4.2 Setting it up

- New Supabase project in `ap-south-1` (Mumbai region)
- Enable extensions: `pg_cron`, `postgis` (later — not needed for pilot), `uuid-ossp`
- Set up schema via `supabase/migrations/` — version-controlled SQL files
- Enable Realtime on the tables we'll subscribe to (`sessions`, `connectors`, `reservations` when added)
- Configure Auth: phone provider (MSG91 SMS integration OR Supabase's built-in Twilio)
- Set up Storage buckets: `station-photos`, `receipts`, `user-avatars`

Environment variables added:
```
NEXT_PUBLIC_DATA_MODE=api                  # switches DataClient from mock → real
NEXT_PUBLIC_SUPABASE_URL=xxx
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
SUPABASE_SERVICE_ROLE_KEY=xxx              # server-side only, for CPO adapter functions
```

---

## 5. The DataClient swap — the actual "V1 → V2" moment

This is the payoff for doing the adapter pattern right in Layer 1. On flip day:

**Before (V1):**
```
NEXT_PUBLIC_DATA_MODE=mock
→ dataClient = mockClient (reads /data/*.json)
```

**After (V2):**
```
NEXT_PUBLIC_DATA_MODE=api
→ dataClient = apiClient (calls Supabase)
```

`apiClient.ts` implements the same `DataClient` interface. Each method wraps a Supabase query:

```typescript
export const apiClient: DataClient = {
  async getStationsNear(lat, lng, radiusKm, filters) {
    const { data, error } = await supabase.rpc('stations_near', {
      lat, lng, radius_km: radiusKm, ...filters
    });
    if (error) throw error;
    return data;
  },

  subscribeToConnectorStatus(connectorId, cb) {
    const channel = supabase
      .channel(`connector-${connectorId}`)
      .on('postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'connectors', filter: `id=eq.${connectorId}` },
        (payload) => cb(payload.new as ConnectorStatus))
      .subscribe();
    return () => supabase.removeChannel(channel);
  },

  // ...same interface, real implementations
};
```

**No component in the app changes.** Every screen, every hook, every store carries over. This is the whole game.

**Timeline for this swap:** 3–5 days if V1 was clean. 3+ weeks if V1 had hardcoded mock imports scattered around. That's why the Layer 1 doc obsesses about the pattern.

---

## 6. Database schema

The seed JSON shapes from V1 become real tables. Migration script converts JSON rows → INSERT statements. This is a one-day job if the shapes were maintained.

### Core tables

```sql
-- =====================================================================
-- CPOs (charge point operators)
-- =====================================================================
CREATE TABLE cpos (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  logo_url TEXT,
  chip_color TEXT,
  protocol TEXT NOT NULL,  -- OCPI_2_2 | OCPP_16J | PROPRIETARY_REST | BECKN
  api_config JSONB,        -- adapter-specific config (endpoints, credentials)
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================================
-- Stations
-- =====================================================================
CREATE TABLE stations (
  id TEXT PRIMARY KEY,
  cpo_id TEXT NOT NULL REFERENCES cpos(id),
  name TEXT NOT NULL,
  address TEXT,
  coordinates GEOGRAPHY(POINT, 4326) NOT NULL,  -- PostGIS added
  amenities TEXT[],
  best_time_to_charge TEXT,
  traffic_level TEXT,
  is_active BOOLEAN DEFAULT true,
  cpo_station_ref TEXT,  -- CPO's internal ID for this station
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_stations_geo ON stations USING GIST(coordinates);
CREATE INDEX idx_stations_cpo ON stations(cpo_id);

-- =====================================================================
-- Connectors
-- =====================================================================
CREATE TABLE connectors (
  id TEXT PRIMARY KEY,
  station_id TEXT NOT NULL REFERENCES stations(id),
  cpo_id TEXT NOT NULL REFERENCES cpos(id),  -- denormalized for RLS
  identifier TEXT NOT NULL,
  type TEXT NOT NULL,           -- CCS_2 | CHADEMO | TYPE_2_AC | BHARAT_AC | BHARAT_DC
  max_power_kw REAL NOT NULL,
  price_per_kwh REAL NOT NULL,
  status TEXT DEFAULT 'UNKNOWN',
  last_status_change TIMESTAMPTZ,
  cpo_connector_ref TEXT,
  UNIQUE (station_id, identifier)
);

-- =====================================================================
-- Users + vehicles + profiles
-- =====================================================================
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  phone TEXT UNIQUE NOT NULL,
  name TEXT,
  upi_vpa TEXT,
  role TEXT DEFAULT 'CONSUMER',  -- CONSUMER | FLEET_MANAGER | CPO_ADMIN | PLATFORM_ADMIN
  fleet_id UUID REFERENCES fleets(id),  -- null for consumers
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE vehicle_catalog (
  id TEXT PRIMARY KEY,
  make TEXT NOT NULL,
  model TEXT NOT NULL,
  variant TEXT,
  battery_kwh REAL NOT NULL,
  connector_type TEXT NOT NULL,
  avg_consumption_wh_per_km INT NOT NULL,
  max_charge_rate_kw REAL NOT NULL
);

CREATE TABLE user_vehicles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  catalog_id TEXT NOT NULL REFERENCES vehicle_catalog(id),
  nickname TEXT,
  registration_no TEXT,
  preferred_charge_to_pct INT DEFAULT 80,
  is_primary BOOLEAN DEFAULT true
);

-- =====================================================================
-- Sessions
-- =====================================================================
CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id),
  vehicle_id UUID REFERENCES user_vehicles(id),
  connector_id TEXT NOT NULL REFERENCES connectors(id),
  station_id TEXT NOT NULL REFERENCES stations(id),
  cpo_id TEXT NOT NULL REFERENCES cpos(id),  -- denormalized for RLS + reliability compute
  status TEXT NOT NULL,          -- enum matches V1
  energy_kwh REAL DEFAULT 0,
  cost_accrued REAL DEFAULT 0,
  platform_fee REAL DEFAULT 0,
  cpo_settlement REAL DEFAULT 0,
  razorpay_order_id TEXT,
  razorpay_payment_id TEXT,
  cpo_session_ref TEXT,           -- CPO's internal session ID
  started_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,
  failure_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_sessions_user ON sessions(user_id, created_at DESC);
CREATE INDEX idx_sessions_connector ON sessions(connector_id, created_at DESC);

-- =====================================================================
-- Telemetry (session-level, not high-frequency)
-- =====================================================================
CREATE TABLE session_telemetry (
  id BIGSERIAL PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  power_kw REAL,
  energy_kwh REAL,
  soc_pct INT,
  recorded_at TIMESTAMPTZ NOT NULL
);
CREATE INDEX idx_telemetry_session ON session_telemetry(session_id, recorded_at);
-- Note: TimescaleDB hypertable NOT added in Layer 2. Standard Postgres partitioning by month if it grows.

-- =====================================================================
-- Reliability (computed, refreshed by cron)
-- =====================================================================
CREATE TABLE station_reliability (
  connector_id TEXT PRIMARY KEY REFERENCES connectors(id),
  station_id TEXT NOT NULL REFERENCES stations(id),
  cpo_id TEXT NOT NULL REFERENCES cpos(id),
  score_pct REAL,
  sample_size INT,
  window_days INT DEFAULT 30,
  last_confirmed_at TIMESTAMPTZ,
  computed_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_reliability_score ON station_reliability(score_pct DESC);

-- =====================================================================
-- Community (reviews, reports, photos)
-- =====================================================================
CREATE TABLE station_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  station_id TEXT NOT NULL REFERENCES stations(id),
  user_id UUID REFERENCES profiles(id),      -- NULL only for seeded/curated content
  session_id UUID REFERENCES sessions(id),   -- NULL only for seeded/curated content
  rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  text TEXT,
  is_curated BOOLEAN DEFAULT false,          -- true = seeded demo content, inserted server-side
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- Every user-written review MUST have a session at the same station.
  -- Curated content is exempt (is_curated=true, session_id/user_id can be NULL).
  CONSTRAINT user_reviews_require_session CHECK (
    is_curated = true
    OR (user_id IS NOT NULL AND session_id IS NOT NULL)
  )
);

-- Prevent duplicate reviews per user per station (users can update their existing review instead)
CREATE UNIQUE INDEX one_review_per_user_per_station
  ON station_reviews(user_id, station_id)
  WHERE is_curated = false;

CREATE TABLE station_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  station_id TEXT NOT NULL REFERENCES stations(id),
  connector_id TEXT REFERENCES connectors(id),
  user_id UUID REFERENCES profiles(id),
  type TEXT NOT NULL,     -- BROKEN | CABLE_DAMAGED | PARKING_BLOCKED | LIGHTING_ISSUE
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  resolved_at TIMESTAMPTZ
);

CREATE TABLE station_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  station_id TEXT NOT NULL REFERENCES stations(id),
  user_id UUID REFERENCES profiles(id),
  url TEXT NOT NULL,
  category TEXT,          -- ENTRANCE | CONNECTOR | PARKING | CAFE | GENERAL
  is_curated BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================================
-- Fleet (placeholder — full schema in Layer 3)
-- =====================================================================
CREATE TABLE fleets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  contact_email TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

Every table with cross-CPO data has a `cpo_id` column even where it seems denormalized (connectors, sessions). This is the RLS-scoping key.

---

## 7. Row-Level Security (RLS) — multi-tenant from day one

Even with one pilot CPO, ship with RLS on. This is where 90% of "we accidentally leaked one tenant's data to another" bugs come from at scale. Solve it in Postgres, not in application code.

Every user's JWT (from Supabase Auth) carries `sub` (user_id) and `role`. Add custom claim `cpo_id` for CPO admins (via a Postgres function that runs on JWT issue).

Example policies:

```sql
-- Consumers see all stations + all connectors + all reviews (public data)
CREATE POLICY "stations are public"
  ON stations FOR SELECT
  USING (true);

-- Consumers see only their own sessions
CREATE POLICY "users see own sessions"
  ON sessions FOR SELECT
  USING (user_id = auth.uid());

-- CPO admins see only their own sessions
CREATE POLICY "cpo admins see own cpo sessions"
  ON sessions FOR SELECT
  USING (cpo_id = (auth.jwt() ->> 'cpo_id'));

-- Fleet managers see sessions for their fleet's vehicles
CREATE POLICY "fleet managers see fleet sessions"
  ON sessions FOR SELECT
  USING (
    user_id IN (
      SELECT id FROM profiles
      WHERE fleet_id = (auth.jwt() ->> 'fleet_id')::uuid
    )
  );

-- Platform admins see everything
CREATE POLICY "platform admins see all"
  ON sessions FOR ALL
  USING (auth.jwt() ->> 'role' = 'PLATFORM_ADMIN');

-- =====================================================================
-- Reviews: writable ONLY by users who completed a session at that station
-- =====================================================================

-- Anyone can read reviews (they're public)
CREATE POLICY "reviews are public"
  ON station_reviews FOR SELECT
  USING (true);

-- Users can insert a review ONLY IF they have a SETTLED session at that station
CREATE POLICY "verified users can write reviews"
  ON station_reviews FOR INSERT
  WITH CHECK (
    user_id = auth.uid()
    AND is_curated = false
    AND session_id IN (
      SELECT id FROM sessions
      WHERE user_id = auth.uid()
        AND station_id = station_reviews.station_id
        AND status = 'SETTLED'
    )
  );

-- Users can update or delete their own review only
CREATE POLICY "users manage own reviews"
  ON station_reviews FOR UPDATE
  USING (user_id = auth.uid() AND is_curated = false);

CREATE POLICY "users delete own reviews"
  ON station_reviews FOR DELETE
  USING (user_id = auth.uid() AND is_curated = false);
```

This RLS policy is the enforcement point for the "verified-only reviews" product rule. Even if the frontend or a rogue API client tries to insert a review for a station the user never visited, Postgres rejects the insert. No application code can bypass it. The trust property is a database invariant, not a policy hope.

**Every table** gets policies. Never leave a table with RLS enabled but no policies (that returns zero rows for everyone) or with RLS disabled (that returns everything to everyone).

---

## 8. Auth transition

**Provider:** MSG91 for OTP delivery + Supabase Auth for session/JWT management.

Why not just Supabase Auth's built-in phone provider? Supabase uses Twilio by default, which works but is expensive on Indian numbers and has occasional delivery issues on certain carriers (Airtel, Jio). MSG91 is India-native and delivers reliably.

**Flow:**

1. User enters phone → `POST /api/auth/otp-request` (Vercel API route calls MSG91)
2. MSG91 sends OTP, we return a nonce token
3. User enters OTP → `POST /api/auth/otp-verify` — we verify with MSG91, then create/lookup profile in Supabase, then call `supabase.auth.admin.signInWithPassword()` with a deterministic password derived from phone (or use `supabase.auth.signInWithOtp` if we go the built-in route)
4. Supabase returns JWT + refresh token
5. Frontend stores tokens in httpOnly cookies via Supabase client's `setSession`

Session lifetime: 1 hour access token, 30 day refresh token. Auto-refresh via Supabase client.

No JWT in `localStorage`. No auth logic in the frontend beyond `supabase.auth.signInWith*` and `useUser()` hook.

---

## 9. Payment — Razorpay Route (sub-merchant model)

This is the load-bearing legal architecture decision. Do not deviate.

### 9.1 The model

- **You** (Unified-EV Pvt Ltd) are the Route platform.
- **Each pilot CPO** is a sub-merchant on your Route account, onboarded via Razorpay's KYC.
- **Each session's payment** is split at capture time: platform fee (₹7) settles to your account, remainder settles to the CPO's account, both by Razorpay directly.
- **You never hold user money.** Legally, you are not a Payment Aggregator.

### 9.2 The flow

```
1. User taps "Scan to Charge" at station tp-bkc-01 (Tata Power)
2. Frontend calls dataClient.initiateSession()
   → apiClient calls supabase.rpc('initiate_session')
   → server-side function creates session row + calls Razorpay to create order
3. Razorpay order created with:
   - amount = estimated_kwh * price_per_kwh + platform_fee (locked as authorized/held)
   - transfers[] = [{ account: cpo_tata_power_acc_id, amount: estimated - platform_fee }]
4. Frontend opens real Razorpay Standard Checkout (UPI / card / netbanking / wallet tabs — user picks method; UPI default)
5. User approves → payment authorized → session moves to STARTING
6. CPO adapter sends RemoteStartTransaction (or equivalent proprietary call)
7. Charger starts. Session goes ACTIVE.
8. On session end:
   - Actual kWh + cost calculated
   - Razorpay capture called with actual_amount, transfers[] updated with actual_cpo_amount
   - Difference between held and captured is auto-refunded to user
```

### 9.3 The unresolved UPI hold-and-capture question

Re-flagging what I raised at the beginning: **verify with Razorpay directly whether true hold-and-capture works on UPI rails.** UPI AutoPay is a recurring mandate mechanism, not a per-transaction pre-auth like card networks.

Two possible fallbacks if it doesn't:

1. **Charge full estimated amount, refund delta.** User is charged ₹500 upfront, ₹153 refunded after session ends. Refund settles to UPI in ~1 hour typically. Worse UX (user's ₹ locked for an hour) but works today.
2. **Card-only for pre-auth flows.** User can pay via UPI OR use a card mandate for true hold-and-capture. Card mandate is standard Razorpay flow.

**Action:** in the first week of Layer 2, book a technical call with Razorpay's integration team. Get definitive answer. Design payment UX around their actual capability.

### 9.4 Sub-merchant onboarding

Each CPO onboards via Razorpay's Route onboarding flow:

- Business PAN, GST, cancelled cheque
- Company registration certificate
- Authorized signatory KYC
- Bank account for settlement

Razorpay processes onboarding in 2–5 business days. Do this the week the pilot MoU signs — settlements can't happen until KYC is complete.

---

## 10. CPO integration — the adapter pattern in real code

Every CPO gets one file. All files produce the same internal event shapes. The rest of the app doesn't know which CPO the event came from.

```
src/lib/cpo-adapters/
├── types.ts                   # StationUpdate, ConnectorStatusUpdate, SessionEvent
├── registry.ts                # cpoId → adapter mapping
├── adapters/
│   ├── mock.ts                # from V1, still active for non-pilot CPOs
│   ├── tata-power.ts          # if pilot CPO is Tata Power
│   └── statiq-ocpi.ts         # if pilot CPO is Statiq via OCPI
```

### 10.1 The adapter interface

```typescript
export interface CpoAdapter {
  cpoId: string;
  protocol: 'OCPI_2_2' | 'OCPP_16J' | 'PROPRIETARY_REST' | 'BECKN' | 'MOCK';

  // Pull latest station + connector status
  fetchStationStatus(stationId: string): Promise<StationUpdate>;
  fetchAllStations(): Promise<Station[]>;  // for initial sync + periodic refresh

  // Initiate a session on the charger
  remoteStart(input: RemoteStartInput): Promise<{ cpoSessionRef: string }>;
  remoteStop(input: RemoteStopInput): Promise<void>;

  // Optional: subscribe to push events if CPO supports webhooks/websocket
  subscribeToSessionEvents?(cb: (event: SessionEvent) => void): Unsubscribe;
  subscribeToStatusEvents?(cb: (event: ConnectorStatusUpdate) => void): Unsubscribe;
}
```

### 10.2 The polling worker (for CPOs without push)

Most Indian CPOs today do not support push events. They have polling REST endpoints. We handle this with a Supabase Edge Function running on cron:

```
Every 60 seconds:
  For each active CPO adapter:
    - fetchAllStations() → upsert to `stations` + `connectors` tables
    - Postgres triggers auto-fire, Realtime pushes changes to subscribed clients
```

For a CPO like Statiq that supports OCPI 2.2, we can subscribe to their `/ocpi/emsp/2.2/locations` push events and skip polling for that CPO.

### 10.3 Normalizing to internal events

The adapter's `remoteStart` returns a `cpoSessionRef` (whatever ID the CPO uses). We store it in `sessions.cpo_session_ref`. When telemetry comes back from the CPO tagged with their ID, we look up the internal session and update it.

The internal `SessionEvent` shape is the same regardless of CPO:

```typescript
type SessionEvent =
  | { type: 'STARTED'; sessionId: string; startedAt: Date }
  | { type: 'TELEMETRY'; sessionId: string; powerKw: number; energyKwh: number; socPct?: number; recordedAt: Date }
  | { type: 'STOPPED'; sessionId: string; endedAt: Date; totalKwh: number; reason: string }
  | { type: 'FAILED'; sessionId: string; failedAt: Date; reason: string };
```

Every adapter maps its native events → these. The rest of the app subscribes to these.

---

## 11. Reliability compute — the cold-start plan

Month 1 of the pilot: ~200 sessions total across ~30 stations. That's 6–7 sessions per station on average. Not enough for a credible reliability score.

**Strategy:** three-tier degradation in the UI.

```typescript
function displayReliability(rel: StationReliability | null): DisplayedReliability {
  if (!rel || rel.sampleSize === 0) {
    return { mode: 'unknown', label: 'No data yet' };
  }
  if (rel.sampleSize < 5) {
    return { mode: 'insufficient', label: 'Insufficient data', hint: '<5 sessions' };
  }
  if (rel.sampleSize < 20) {
    return {
      mode: 'limited',
      score: rel.scorePct,
      label: `${rel.scorePct}%`,
      hint: `Based on ${rel.sampleSize} sessions — limited data`
    };
  }
  return {
    mode: 'confident',
    score: rel.scorePct,
    label: `${rel.scorePct}%`,
    hint: `Based on ${rel.sampleSize} sessions in last 30 days`
  };
}
```

The pin color tier only applies in `confident` mode. `limited` shows the score but with a caveat and no color. `insufficient` / `unknown` shows neutral gray.

**The seeding trick:** ask the pilot CPO for their last 90 days of session data as a one-time export. Backfill it into `sessions` (with `status='SETTLED'` or `'FAILED'`) so the reliability compute has real data on launch day, not launch day plus 60 days. Every pilot agreement should include this data-share clause.

### 11.1 Compute mechanics

```sql
-- Materialized view, refreshed every 15 min by pg_cron
CREATE MATERIALIZED VIEW reliability_computed AS
WITH windowed AS (
  SELECT
    connector_id,
    station_id,
    cpo_id,
    COUNT(*) AS total_sessions,
    COUNT(*) FILTER (WHERE status = 'SETTLED') AS successful_sessions,
    MAX(ended_at) FILTER (WHERE status = 'SETTLED') AS last_confirmed_at
  FROM sessions
  WHERE created_at > NOW() - INTERVAL '30 days'
    AND status IN ('SETTLED', 'FAILED')  -- exclude user-cancelled
  GROUP BY connector_id, station_id, cpo_id
)
SELECT
  connector_id,
  station_id,
  cpo_id,
  ROUND((successful_sessions::real / NULLIF(total_sessions, 0)) * 100, 1) AS score_pct,
  total_sessions AS sample_size,
  30 AS window_days,
  last_confirmed_at,
  NOW() AS computed_at
FROM windowed;

-- Refresh cron
SELECT cron.schedule(
  'refresh-reliability',
  '*/15 * * * *',
  $$REFRESH MATERIALIZED VIEW CONCURRENTLY reliability_computed$$
);
```

Copy `reliability_computed` → `station_reliability` table on each refresh (or use the materialized view directly if performance is fine).

**Later (Layer 3):** switch to incremental updates on session-complete events for freshness under 15 seconds.

---

## 12. Real-time station status

Supabase Realtime handles this out of the box.

```typescript
// In apiClient.ts
subscribeToConnectorStatus(connectorId, cb) {
  const channel = supabase
    .channel(`connector-${connectorId}`)
    .on('postgres_changes',
      { event: 'UPDATE', schema: 'public', table: 'connectors', filter: `id=eq.${connectorId}` },
      (payload) => cb(payload.new as ConnectorStatus))
    .subscribe();
  return () => supabase.removeChannel(channel);
},
```

The CPO adapter writes status updates to Postgres. The trigger fires. Realtime pushes to every subscribed client via WebSocket.

For station-level subscriptions (all connectors of a station), same pattern with a broader filter.

Concurrent connection limit: Supabase Realtime free tier supports 200 concurrent, paid tier 10k+. Sufficient for pilot scale.

---

## 13. Environments — dev, staging, prod

Three environments now:

| Env | Purpose | Data | Supabase project | Deploy target |
|---|---|---|---|---|
| **dev** | Your laptop | Mock data (V1 seed) | None (mockClient) | localhost:3000 |
| **staging** | Testing before prod | Seeded but "real-shaped" data | staging Supabase project | `staging.unified-ev.app` |
| **prod** | Real pilot users | Live CPO data + real payments | prod Supabase project | `unified-ev.app` |

Toggle via env variables. Vercel handles per-environment env vars automatically per-branch.

CI: GitHub Actions runs `tsc --noEmit`, `next lint`, and Playwright smoke tests on PR. Vercel handles preview deploys automatically per PR.

---

## 14. Observability — the ops-lite version

Small team. Zero patience for tool sprawl.

| Concern | Tool | Cost |
|---|---|---|
| Errors (client + server) | **Sentry** free tier | $0 |
| Logs (Vercel + Supabase) | Built-in dashboards | $0 |
| Uptime | **Better Uptime** free tier | $0 |
| Product analytics | **PostHog** free tier | $0 |
| Feature flags | PostHog (same tool) | $0 |
| Alerts | Sentry → phone push, Better Uptime → SMS on downtime | $0 |

Total tool sprawl: 3 dashboards. Total ops burden: ~2 hours a week.

Do not add Datadog, Loki, or Grafana in Layer 2. Do not build custom dashboards. Every hour spent on observability tooling is an hour not spent shipping product.

---

## 15. What Layer 2 deliberately does NOT do

- No microservices. One Next.js app + Supabase, still.
- No Kubernetes. Vercel + Supabase.
- No Kafka / RabbitMQ / NATS. Supabase Realtime is enough.
- No Redis. Postgres is enough.
- No dedicated telemetry service. That's Layer 3.
- No compliance certifications (ISO 27001, SOC 2). DPDP review is table stakes; formal certs are Layer 3.
- No fleet dashboard. Layer 3.
- No developer API portal. Layer 3.
- No white-label. Ever, probably.
- No native mobile app unless the pilot demands it. Capacitor wrap is a 1-week job if needed.
- No dark mode toggle (light default + dark session screen). Layer 3 or user request.

**What Layer 2 explicitly ADDS beyond the V1 scaffold (updated 2026-07-30 from competitor gap analysis):**

- **Multi-language support (i18n) — Hindi + English at minimum.** Use `next-intl` with translation files per screen. Store user's language choice on the profile. Add Marathi, Tamil, Telugu, Kannada, Bengali as fast-follow (Layer 2.5). Rationale: One Bharat Charge claims 8 Indian languages; Bolt.Earth is multi-language. English-only cuts you off from ~60% of the Indian market. Details in `05_Future_Scope_Must_Add.md`.
- **National Highway corridor mapping in Route Planner.** Tag stations by NH corridor (`NH-48`, `NH-44`, `NH-19`, `NH-58`). Trip planner considers corridor when routing long-distance trips. Details in `05_Future_Scope_Must_Add.md`.
- **WhatsApp Business support channel.** Indian users expect WhatsApp far more than email. Details in `06_Future_Scope_Should_Add.md`.
- **Charging Session Refund Policy** as a signed legal document, linked from the app footer. Details in `06_Future_Scope_Should_Add.md`.
- **OCPI CDR-compliant session records.** Ensure `sessions` table can output OCPI 2.2.1 CDR format for pilot CPO integration. Details in `06_Future_Scope_Should_Add.md`.
- No multi-region. Mumbai region indefinitely.

---

## 16. Success criteria for Layer 2

Pilot succeeds when:

1. **Real sessions flowing** — the pilot CPO's users can complete Unified-EV sessions end-to-end via our app. Target: 1,000 sessions in month 1 across pilot stations.
2. **Reliability data is credible** — after month 2, at least 60% of pilot stations have `sample_size >= 20` and reliability scores that match user perception (measured via NPS-style follow-up: "did the app tell you accurately whether the charger would work?").
3. **Payment settlement is clean** — zero disputed payments, all sub-merchant settlements happen within Razorpay's expected timelines, refunds process in <2 hours average.
4. **Second CPO conversation open** — the credibility of a real pilot in production is what unlocks CPO #2. If we have zero conversations open with a second CPO by end of pilot month 3, we're not selling right.

Layer 2 ends when we sign a second CPO. That triggers Layer 3 concerns: multi-CPO settlement complexity, protocol adapter formalization, and the beginning of team growth.
