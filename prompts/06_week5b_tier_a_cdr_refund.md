# Cursor Prompt 03 — Tier A: OCPI CDR Session Shape + Refund Policy

> Run this **after Prompt 02 is complete** (data + copy Tier A additions merged).
> Working folder: `/Users/dilipkumarsaroj/Desktop/Projects/Unified-EV/`
> This is an **additive** prompt — you're adding to an existing V1 codebase.

---

You are adding the two remaining Tier A features that emerged from competitor analysis:

1. **OCPI 2.2.1 CDR-compatible session shape** + a pure `toCDR()` function — so that when Layer 2 real CPO integrations arrive, session records can be exported to CPOs' billing systems in one hour rather than 40+ per CPO.
2. **Charging Session Refund Policy** — a drafted legal document at `/policies/refund` (V1 draft only; lawyer review deferred to Layer 2).

## Read these files before starting

- **`docs/06_Future_Scope_Should_Add.md`** — sections 4 (Refund Policy) and 6 (OCPI CDR) for context and rationale
- **`docs/03_Layer_2_Post_Pilot.md`** — Section 6 for the eventual Postgres `sessions` schema (your `Session` type must be a superset of these fields)
- **`docs/02_Layer_1_V1_Prototype.md`** — Week 5 section, Days 32–34, for the exact task list

## Reference — OCPI 2.2.1 CDR spec (essential fields)

The OCPI 2.2.1 CDR (Charge Detail Record) format is a standardized way for CPOs and eMSPs (us) to exchange billed session records. Full spec is at [https://ocpi-protocol.org/](https://ocpi-protocol.org/) but for V1 you only need these essential fields — enough that Layer 2 CDR export is trivial to add on top:

```typescript
// The minimum OCPI CDR shape we output from a Session
export interface CDR {
  country_code: string;              // 'IN' for India
  party_id: string;                  // Our eMSP party ID (e.g., 'UEV')
  id: string;                        // CDR unique ID (session ID works)
  start_date_time: string;           // ISO 8601 — session.startedAt
  end_date_time: string;             // ISO 8601 — session.endedAt
  session_id?: string;               // Internal session ID
  cdr_token: {
    uid: string;                     // User's phone or user ID
    type: 'RFID' | 'APP_USER' | 'AD_HOC_USER';
    contract_id: string;             // User's contract ID (user ID works)
  };
  auth_method: 'AUTH_REQUEST' | 'COMMAND' | 'WHITELIST';
  cdr_location: {
    id: string;                      // station.id
    name: string;                    // station.name
    address: string;
    city: string;
    country: string;
    coordinates: { latitude: string; longitude: string };
    evse_uid: string;                // connector.id
    evse_id: string;                 // connector.id
    connector_id: string;
    connector_standard: string;      // maps ConnectorType → OCPI values
    connector_format: 'SOCKET' | 'CABLE';
    connector_power_type: 'AC_1_PHASE' | 'AC_3_PHASE' | 'DC';
  };
  currency: string;                  // 'INR'
  charging_periods: {
    start_date_time: string;
    dimensions: {
      type: 'ENERGY' | 'TIME' | 'FLAT';
      volume: number;                // kWh for ENERGY
    }[];
  }[];
  total_cost: {
    excl_vat: number;                // ₹ before GST
    incl_vat: number;                // ₹ including GST (18%)
  };
  total_energy: number;              // kWh delivered
  total_time: number;                // hours
  total_parking_time?: number;
  remark?: string;
  last_updated: string;              // ISO 8601
}
```

**OCPI `connector_standard` mapping** (map our `ConnectorType` to OCPI values):

| Our `ConnectorType` | OCPI `connector_standard` |
|---|---|
| `CCS_2` | `IEC_62196_T2_COMBO` |
| `CHADEMO` | `CHADEMO` |
| `TYPE_2_AC` | `IEC_62196_T2` |
| `BHARAT_AC_001` | `IEC_60309_2_single_16` (closest OCPI equivalent; add a comment noting the mapping is approximate — Bharat AC 001 is India-specific and not in OCPI v2.2.1 formally) |
| `BHARAT_DC_001` | `CHADEMO` (closest OCPI equivalent for low-power DC; comment noting approximation) |

---

## Style rule — mandatory for this session

**Use Tailwind utility classes for all new UI elements. Do NOT use inline `style={{}}` props.** Only use `style` for computed dynamic values (animated opaque values, programmatic heights). This matches the layout conventions established in Prompt 04c.

Bad:
```tsx
<div style={{ fontSize: 13, color: 'var(--color-ink-3)', padding: 16 }}>
```
Good:
```tsx
<div className="text-sm text-ink-3 p-4">
```

If a Tailwind token you need isn't in `tailwind.config.ts`, extend the config there and use the class — don't inline the value.

## Scope for this session — 6 tasks

### 1. Verify and extend the `Session` type in `types.ts` (1 hour)

**File:** `src/lib/data/types.ts`

The current `Session` type probably has: `id`, `userId`, `connectorId`, `stationId`, `cpoId`, `status`, `energyKwh`, `costAccrued`, `platformFee`, `startedAt`, `endedAt`.

Add any missing fields the CDR needs:

```typescript
export interface Session {
  // ... existing fields
  vehicleId?: string;                // reference to user_vehicle
  authMethod?: 'APP_USER' | 'AD_HOC_USER';
  totalParkingTime?: number;         // hours (default 0)
  chargingPeriods?: {
    startedAt: string;
    energyKwh: number;
  }[];                               // for OCPI charging_periods array
  cpoSessionRef?: string;            // CPO's own session ID (null in V1 mock)
  currency: 'INR';                   // constant, but explicit
  gstPct: number;                    // 18 (constant for V1, may vary later)
}
```

Preserve all existing fields. Update `mockClient.ts` to populate new fields with reasonable defaults on any new session it generates.

---

### 2. Create `src/lib/data/cdr.ts` — the `toCDR()` function (2 hours)

**File:** `src/lib/data/cdr.ts` (new file)

Pure function. No I/O. No side effects. Takes a `Session` + related lookups, returns a `CDR`.

```typescript
import type { Session, Station, Connector, User } from './types';

export interface CDR {
  // ... paste the CDR interface from the reference section above
}

// Party ID for Unified-EV as eMSP — placeholder, replace when company is registered
const OUR_PARTY_ID = 'UEV';
const OUR_COUNTRY_CODE = 'IN';

export function toCDR(
  session: Session,
  station: Station,
  connector: Connector,
  user: User
): CDR {
  const durationHours =
    (new Date(session.endedAt!).getTime() - new Date(session.startedAt!).getTime()) / 3_600_000;

  return {
    country_code: OUR_COUNTRY_CODE,
    party_id: OUR_PARTY_ID,
    id: session.id,
    start_date_time: session.startedAt!,
    end_date_time: session.endedAt!,
    session_id: session.id,
    cdr_token: {
      uid: user.phone,
      type: 'APP_USER',
      contract_id: user.id,
    },
    auth_method: 'AUTH_REQUEST',
    cdr_location: {
      id: station.id,
      name: station.name,
      address: station.address,
      city: extractCity(station.address),
      country: 'India',
      coordinates: {
        latitude: station.coordinates.lat.toString(),
        longitude: station.coordinates.lng.toString(),
      },
      evse_uid: connector.id,
      evse_id: connector.id,
      connector_id: connector.identifier,
      connector_standard: mapConnectorStandard(connector.type),
      connector_format: 'CABLE',
      connector_power_type: powerType(connector.type),
    },
    currency: 'INR',
    charging_periods: (session.chargingPeriods ?? [{
      startedAt: session.startedAt!,
      energyKwh: session.energyKwh,
    }]).map((p) => ({
      start_date_time: p.startedAt,
      dimensions: [{ type: 'ENERGY', volume: p.energyKwh }],
    })),
    total_cost: {
      excl_vat: round2(session.costAccrued / (1 + session.gstPct / 100)),
      incl_vat: round2(session.costAccrued),
    },
    total_energy: session.energyKwh,
    total_time: round2(durationHours),
    total_parking_time: session.totalParkingTime ?? 0,
    last_updated: new Date().toISOString(),
  };
}

// Helpers
function mapConnectorStandard(type: string): string {
  const map: Record<string, string> = {
    CCS_2: 'IEC_62196_T2_COMBO',
    CHADEMO: 'CHADEMO',
    TYPE_2_AC: 'IEC_62196_T2',
    BHARAT_AC_001: 'IEC_60309_2_single_16', // approximate mapping — Bharat AC not in OCPI v2.2.1
    BHARAT_DC_001: 'CHADEMO',                // approximate mapping — Bharat DC not in OCPI v2.2.1
  };
  return map[type] ?? 'DOMESTIC_F';
}

function powerType(type: string): 'AC_1_PHASE' | 'AC_3_PHASE' | 'DC' {
  if (type.includes('DC') || type === 'CCS_2' || type === 'CHADEMO') return 'DC';
  if (type === 'TYPE_2_AC') return 'AC_3_PHASE';
  return 'AC_1_PHASE';
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

function extractCity(address: string): string {
  // V1 heuristic: last comma-separated segment before pin code
  const parts = address.split(',').map((s) => s.trim());
  return parts[parts.length - 2] ?? 'Mumbai';
}
```

Add a simple test file `src/lib/data/cdr.test.ts` (or inline test in the file if there's no test setup) with 2 test cases: (a) a normal session produces a valid CDR, (b) a session with a Bharat DC connector maps correctly.

---

### 3. Add a debug/export button in Session Complete or Passport (30 minutes)

**File:** `src/app/session/[id]/complete/page.tsx` OR `src/app/passport/page.tsx`

Add a small "Download CDR" button (visible in dev mode only, via env check `NEXT_PUBLIC_ENVIRONMENT === 'dev'`) that:

1. Calls `toCDR(session, station, connector, user)`
2. Downloads the JSON as a file (`cdr_<sessionId>.json`) using a browser blob download

This is developer-only — hides in demo/staging/prod. Purpose: prove the CDR export works. Layer 2 will build a proper `/api/cpo/:cpoId/cdrs` endpoint.

---

### 4. Draft the Refund Policy content (2 hours)

**File:** `src/data/policies/refund-policy.md` (new file — Markdown, will be rendered on the page)

Write ~2 pages, plain-language, no legalese jargon (that's for the lawyer to add in Layer 2). Cover these sections:

- **When you get a refund automatically** — session failed to start, charger cut off mid-session, session lasted < 2 minutes with < 0.1 kWh delivered, payment authorized but session never began within 5 minutes.
- **When you don't get a refund** — you stopped charging voluntarily after > 5 minutes, you disconnected the cable early (any charge already delivered is billed), no-shows on reservations after grace period.
- **How refunds work** — auto-refunded to the original payment method (UPI / card / netbanking) within 2 hours in most cases, up to 5 business days for cards. Processed by Razorpay directly. You'll get a notification when the refund is processed.
- **What to do if a refund doesn't arrive** — WhatsApp us with the session ID (link to Profile → Help & Support).
- **Disputes** — 7-day window from session end to raise a dispute. Reviewed within 3 business days.
- **Session pricing transparency** — every session shows the exact ₹ breakdown before you start (kWh × price + platform fee). The final charge cannot exceed the pre-authorized hold.

Header at the top of the doc:

```markdown
# Charging Session Refund Policy

**Effective date:** [To be finalized before Layer 2 payment launch]
**Version:** Draft 1.0 (V1 prototype)

> ⚠️ This is a working draft. It will be reviewed and finalized by legal counsel before Unified-EV processes real payments in production. If you're reading this in the V1 demo, actual payments are mocked and refunds do not apply.
```

Footer:

```markdown
---

Questions? WhatsApp us: [WhatsApp link — same as Profile → Help & Support]
```

Write in second person ("you"), sentence case, no jargon. Aim for the reading level of a general Indian consumer — not a lawyer, not an engineer.

---

### 5. New route `/policies/refund` renders the policy (1 hour)

**File:** `src/app/policies/refund/page.tsx` (new file)

Simple Next.js page. Reads `src/data/policies/refund-policy.md` at build time (or runtime via `fs` in a server component), renders with `react-markdown` (add to dependencies if not present) or a lightweight custom Markdown renderer.

Styling: use the design system typography — `text-body` for paragraph, `text-h2` for section headers. Contained max-width, generous line-height. Same header/footer as other app screens (`StatusBar`, back button).

If `react-markdown` isn't installed, add it: `pnpm add react-markdown` — small dependency, universally used, safe.

---

### 6. Link the policy from Profile + landing footer (30 minutes)

**File 1:** `src/app/profile/page.tsx`

In the Help & Support section, below WhatsApp:

```
Legal
  Refund Policy →   (links to /policies/refund)
  Privacy Policy →  (placeholder for now — no doc yet)
  Terms of Service → (placeholder)
```

**File 2:** `src/app/page.tsx` (Landing) footer

Add a small footer row: `Refund Policy · Privacy · Terms · © 2026 Unified-EV`

Only Refund Policy is a real link. Privacy and Terms are placeholder `#` for now.

---

## Success criteria

1. `pnpm tsc --noEmit` returns zero errors
2. `pnpm lint` returns zero errors
3. `pnpm build` succeeds
4. `toCDR()` function passes both test cases
5. In dev mode, the "Download CDR" button on Session Complete produces a valid JSON file
6. Opening `/policies/refund` renders the drafted refund policy with proper design-system styling
7. Profile → Help & Support links to `/policies/refund`
8. Landing footer links to `/policies/refund`

## What NOT to do

- Do NOT implement OCPI real-time push/pull endpoints (Layer 2)
- Do NOT expose the CDR download in non-dev environments (only visible when `NEXT_PUBLIC_ENVIRONMENT === 'dev'`)
- Do NOT get a lawyer to review the refund policy yet — that's Layer 2
- Do NOT implement actual refund logic (there are no real payments yet)
- Do NOT add real Privacy Policy or Terms of Service — placeholders only
- Do NOT modify the DataClient interface — CDR is a derivation, not a client method

## When to stop and ask

- If the `Session` type is missing any field the CDR needs beyond what's listed here
- If `react-markdown` conflicts with an existing dependency
- If the design system doesn't specify styling for long-form text (policy body)

## Deliverable

- `pnpm dev` session where:
  - Dev mode Session Complete has a "Download CDR" button producing valid OCPI CDR JSON
  - `/policies/refund` renders the drafted policy cleanly
  - Profile and landing footer link to the policy

Run `git status` when done. Do not commit — Dilip will review.

Go.
