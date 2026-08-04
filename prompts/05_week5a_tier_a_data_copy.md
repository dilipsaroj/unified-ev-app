# Cursor Prompt 02 — Tier A: Data Expansion + Copy Updates

> Run this **after Week 1–3 of Layer 1 are complete** (Map + Station Detail + Onboarding + Scan/Session/Settlement + Route Planner + Passport + Profile all working end-to-end).
> Working folder: `/Users/dilipkumarsaroj/Desktop/Projects/Unified-EV/`
> This is an **additive** prompt — you're adding to an existing V1 codebase, not scaffolding from scratch.

---

You are extending Unified-EV with Tier A features from `docs/05_Future_Scope_Must_Add.md` and `docs/06_Future_Scope_Should_Add.md` — the credibility-critical additions that emerged from competitor analysis of One Bharat Charge and Bolt.Earth.

## Read these files before starting

- **`docs/05_Future_Scope_Must_Add.md`** — sections 2, 3, 5 (Bharat AC/DC, 2W/3W, FAME-II)
- **`docs/06_Future_Scope_Should_Add.md`** — sections 1, 3 (WhatsApp, RuPay)
- **`docs/02_Layer_1_V1_Prototype.md`** — Week 5 section (`Days 29–31 — Prompt 02`) for the exact scope

The tier docs explain *why* each addition matters. The Layer 1 doc has the concrete task list. This prompt gives the implementation details.

## Style rule — mandatory for this session

**Use Tailwind utility classes for all new UI elements. Do NOT use inline `style={{}}` props.** Only use `style` for computed dynamic values (animated opaque values, programmatic heights). This matches the layout conventions established in Prompt 04c. Violating this rule creates drift that breaks the design system.

Bad:
```tsx
<div style={{ fontSize: 16, background: 'var(--color-surface-2)', padding: 16 }}>
```
Good:
```tsx
<div className="text-base bg-surface-2 p-4">
```

If a Tailwind token you need isn't in `tailwind.config.ts`, extend the config there and use the class — don't inline the value.

## Scope for this session — 7 discrete tasks

Do NOT scope-creep. This session ONLY does the following, in order:

---

### 1. Extend the `ConnectorType` enum (30 minutes)

**File:** `src/lib/data/types.ts`

Add two new values to the `ConnectorType` enum:

```typescript
export type ConnectorType =
  | 'CCS_2'
  | 'CHADEMO'
  | 'TYPE_2_AC'
  | 'BHARAT_AC_001'   // India-specific low-power AC (for 2W/3W and budget 4W)
  | 'BHARAT_DC_001';  // India-specific low-power DC (for 2W/3W and small 4W)
```

If the enum is currently defined differently, adapt. If any code exhaustively switches on `ConnectorType`, add cases for the two new values (default to "AC" or "DC" letter for pin display).

---

### 2. Update `connectors.json` seed data (1 hour)

**File:** `src/data/connectors.json` (or wherever seed connectors live)

Redistribute connector types so ~25% of stations offer Bharat AC or Bharat DC:

- 2 stations get `BHARAT_DC_001` (3 kW – 15 kW power range, priced ₹8–₹12/kWh)
- 2 stations get `BHARAT_AC_001` (3.3 kW power range, priced ₹6–₹10/kWh)
- Existing CCS_2 and TYPE_2_AC connectors stay where they are on the other stations

Update `reliability.json` if it uses connector IDs — new connectors need reliability entries too (mix green/amber).

**Pin display:** Bharat DC → "D" (same as CCS/CHAdeMO). Bharat AC → "A" (same as Type 2 AC). Same visual treatment.

---

### 3. Add `vehicleClass` field and expand vehicle catalog (2 hours)

**File:** `src/lib/data/types.ts`

Add to the vehicle catalog type:

```typescript
export type VehicleClass = 'TWO_WHEELER' | 'THREE_WHEELER' | 'FOUR_WHEELER' | 'COMMERCIAL';

export interface VehicleCatalogEntry {
  id: string;
  make: string;
  model: string;
  variant?: string;
  vehicleClass: VehicleClass;         // NEW field
  batteryKwh: number;
  connectorType: ConnectorType;
  avgConsumptionWhPerKm: number;
  maxChargeRateKw: number;
}
```

**File:** `src/data/vehicles.json`

Add exactly these 7 new vehicles (in addition to existing 4W entries):

| id | make | model | class | battery | connector | consumption | max kW |
|---|---|---|---|---|---|---|---|
| `ather-450x` | Ather | 450X | TWO_WHEELER | 3.7 | BHARAT_DC_001 | 20 | 15 |
| `ola-s1-pro` | Ola Electric | S1 Pro | TWO_WHEELER | 4.0 | BHARAT_DC_001 | 22 | 8 |
| `tvs-iqube` | TVS | iQube | TWO_WHEELER | 5.1 | BHARAT_AC_001 | 25 | 3.3 |
| `bajaj-chetak` | Bajaj | Chetak | TWO_WHEELER | 3.5 | BHARAT_AC_001 | 24 | 3.3 |
| `hero-vida-v1` | Hero | Vida V1 | TWO_WHEELER | 3.9 | BHARAT_AC_001 | 22 | 3.3 |
| `mahindra-treo` | Mahindra | Treo | THREE_WHEELER | 7.4 | BHARAT_DC_001 | 65 | 15 |
| `bajaj-re-etec` | Bajaj | RE E-Tec | THREE_WHEELER | 8.9 | BHARAT_DC_001 | 70 | 15 |

Keep all existing 4W vehicles; just add these 7.

---

### 4. Add vehicle segment picker to onboarding (2 hours)

**File:** `src/app/onboarding/vehicle/page.tsx` (or wherever vehicle selection lives)

Before the vehicle model dropdown, add a segment picker with three large tap targets:

```
┌────────────┐  ┌────────────┐  ┌────────────┐
│  🛵         │  │  🛺         │  │  🚗         │
│ Two-wheeler │  │Three-wheeler│  │ Four-wheeler│
│   (5)       │  │    (2)      │  │  (existing) │
└────────────┘  └────────────┘  └────────────┘
```

Selection filters the model dropdown to only that class. Store the choice on the user profile via `userStore.setVehicleClass()`.

Use design tokens from `docs/design/design_system.md`. Icons from `lucide-react`: `Bike` for 2W, `CarTaxiFront` or a custom 3-wheeler illustration for 3W (fall back to `Truck` icon if no auto-rickshaw icon), `Car` for 4W.

---

### 5. WhatsApp support link in Profile (1 hour)

**File:** `src/app/profile/page.tsx` (or Profile sub-section)

Under existing Profile content, add a new section:

```
HELP & SUPPORT
┌──────────────────────────────────────────┐
│  💬  Get help on WhatsApp                 │
│      Typical reply in 2 hours (9am–9pm)  │
└──────────────────────────────────────────┘
```

Tapping opens a WhatsApp deep link with a pre-filled message:

```
https://wa.me/91XXXXXXXXXX?text=Hi%20Unified-EV%20team%2C%20I%20need%20help%20with%20...
```

Use `91XXXXXXXXXX` as placeholder — Dilip will replace with real Business number. Add a comment: `// TODO: Replace with real WhatsApp Business number when registered`.

---

### 6. RuPay mention in payment sheet (30 minutes)

**File:** wherever the mock payment sheet renders (probably `src/components/payment/PaymentSheet.tsx` or in the Scan/Session flow)

Find the tab or option labeled "Card" or "Cards" and update to:

```
Card (Visa / Mastercard / RuPay)
```

If there's a card-network logo row visible, add the RuPay logo (SVG or PNG in `public/payment-methods/`). Use official RuPay brand: primary color `#2670BC`, small logo.

The order in the payment sheet: **UPI (default) → Card (Visa / Mastercard / RuPay) → Netbanking → Wallets (grayed out placeholder)**.

---

### 7. FAME-II talking point on landing page (30 minutes)

**File:** `src/app/page.tsx` (Landing) — or wherever the "trust markers" or "made in India" section appears

Add a trust marker row near the bottom of the landing page:

```
🏛️ FAME-II aligned  ·  🇮🇳 Made in India  ·  🔓 Built on OCPI 2.2.1 + Beckn
```

Small text, `text-xs`, `text-muted-foreground` color. Below the CTA, above the legal footer.

---

## Success criteria

Verify each item before considering done:

1. `pnpm tsc --noEmit` returns zero errors
2. `pnpm lint` returns zero errors
3. `pnpm build` succeeds
4. Map now shows a mix of D and A pins including Bharat variants (visible in `mockClient` output)
5. Onboarding shows three-segment picker; picking Two-wheeler shows only 2W models in dropdown; same for 3W
6. Profile → Help & Support has a working WhatsApp link (opens WhatsApp with pre-filled text)
7. Payment sheet's Card tab label reads "Card (Visa / Mastercard / RuPay)"
8. Landing page has FAME-II trust marker row visible
9. Existing V1 features (Map, Station Detail, Session, Route Planner, Passport, theme toggle) all still work

## What NOT to do in this session

- Do NOT touch anything in `src/lib/data/cdr.ts` or the refund policy — that's Prompt 03
- Do NOT start on multi-language (Hindi/English) — that's Layer 1.5, Tier B
- Do NOT start on National Highway corridor mapping — Layer 1.5, Tier B
- Do NOT add any new dependency beyond what's already in `package.json`
- Do NOT modify the existing DataClient interface signatures — just extend types

## When to stop and ask

- If any existing test breaks
- If you find a screen or component that reads directly from `vehicles.json` bypassing the store
- If the design system doesn't define a color/spacing you need for the segment picker
- If the enum extension breaks a type-check somewhere non-obvious

## Style expectations

- Additive only — don't refactor unrelated code
- No new abstractions — this is a 7-task delta, not a redesign
- Same code style as existing V1 codebase (Prettier defaults, strict TS)
- Small commits (organize your work in logical chunks even if you don't commit yourself)

## Deliverable

A `pnpm dev` session where:
- The map now shows Bharat AC/DC connector variants
- Onboarding starts with the 2W/3W/4W picker
- Profile has the WhatsApp help link
- Payment sheet says RuPay explicitly
- Landing has the FAME-II trust marker

Run `git status` when done and list changed files. Do not commit — Dilip will review.

Go.
