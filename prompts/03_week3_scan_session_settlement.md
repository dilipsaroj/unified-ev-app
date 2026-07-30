# Cursor Prompt 03 — Week 3: Scan + Session + Settlement

> Run this **after Prompt 02 is complete and merged** (Landing + Onboarding + Station Detail all working).
> Working folder: `/Users/dilipkumarsaroj/Desktop/Projects/Unified-EV/`
> This is an **additive** prompt — you're building on the existing V1 codebase.

---

You are building the emotional hero of the entire demo: the **Scan → Payment → Live Session → Settlement** flow. This is the 90 seconds that sells the product to any investor or CPO watching the demo. Everything else is stage-setting for this moment.

## Read these files before starting

- **`docs/02_Layer_1_V1_Prototype.md`** — Section 9, "Week 3 — Scan + Session + Settlement" (Days 15–21) for the exact task list
- **`docs/02_Layer_1_V1_Prototype.md`** — Section 6, "Faking 'live' — the four things that make the demo feel alive" — the animation strategy
- **`docs/design/design_system.md`** — Session dial, Session screen tokens (dark theme)
- **`docs/mockup_variants.html`** — Direction B (dark theme) — Session Screen mockup is the visual target

The Session screen is ALWAYS dark, regardless of the app-level theme toggle. This is a deliberate design decision — it's the "wow moment," and dark makes the glowing dial feel premium.

## Scope for this session — Days 15–21

Four deliverables, in this order:

---

### 1. Scan screen (Days 15–16)

**Route:** `src/app/scan/page.tsx`

Query params from Station Detail's CTA: `?stationId=...&connectorId=...`. If either is missing, redirect back to Map with an error toast.

**Content:**

- Full-screen dark background
- Camera view via real `navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })` — the back camera
- Overlay: QR alignment frame (rounded-corner brackets, ~250×250px centered)
- Header text: "Point at the QR on the charger"
- Sub-text: "Auto-detects and starts charging"
- Cancel button top-left

**Auto-succeed behavior:**

- After 1.5 seconds on the screen, transition to the payment sheet automatically (we're not actually decoding a QR — this is a demo)
- Add a subtle "scanning" animation over the frame (thin horizontal line sweeping up and down) via `framer-motion` or CSS

**Fallback:**

- If `getUserMedia` is denied or unavailable, show a graceful mock screen: dark background, message "Camera preview disabled" + spinning progress spinner, still auto-transitions after 1.5s. Do NOT block the demo flow.

---

### 2. Payment sheet — Razorpay Standard Checkout mock (Days 17–18)

This is a modal/sheet that slides up from the bottom over the Scan screen after auto-detect completes.

**File:** `src/components/payment/PaymentSheet.tsx` (new)

**Styling:** mimic Razorpay Standard Checkout's actual look — clean white sheet (light theme) or dark charcoal (dark theme), rounded top corners, drag handle at top. If not familiar with Razorpay's UI, search Razorpay's dev docs for screenshots.

**Content:**

- Header: "Confirm charging session"
- Station name + connector info (small text: "Tata Power EZ · BKC · Connector A2 · 50 kW DC")
- Amount row: **"Hold ₹500"** (this is the pre-auth estimate — actual capture happens on session end)
- Breakdown expandable: "~₹493 for 20 kWh · ₹7 platform fee" (small text below)
- Payment method tabs (in this order, UPI default):
  - **UPI** (default selected) — shows a mock UPI ID field pre-filled with user's UPI VPA from Profile (or `demo@ybl` if none), placeholder QR code image
  - **Card (Visa / Mastercard / RuPay)** — mock card grid: "Add new card" or "Use saved card ending 4242"
  - **Netbanking** — top 6 bank quick-select (SBI, HDFC, ICICI, Axis, Kotak, PNB) as icon grid
  - **Wallets** — grayed out placeholder ("Coming soon")
- Two buttons at bottom:
  - **Approve ₹500 hold** (primary, brand mint) — closes sheet + starts session
  - **Cancel** (ghost) — closes sheet, returns to Station Detail

**On approve:**

- Call `sessionStore.initiateSession({ stationId, connectorId, holdAmount: 500, method: <selected> })` — moves state to `INITIATED` → `PAYMENT_AUTHORIZED` → `STARTING`
- Route to `/session/[sessionId]`

---

### 3. Session screen — the wow moment (Days 19–21)

**Route:** `src/app/session/[id]/page.tsx`

**Layout (dark theme — force `data-theme='dark'` on this screen regardless of user preference):**

- No status bar tint; no bottom nav (immersive)
- Header row:
  - Left: `LIVE · CHARGING` label with pulsing dot (`framer-motion` pulse animation, 1.6s ease-out infinite)
  - Right: session ID (short, e.g., `#A78F`)
- Station info line: `Tata Power EZ · BKC Signature Tower`
- Connector info line: `Connector A2 · CCS2 · 50 kW`
- **SoC Dial** — the visual hero (~260×260px, centered):
  - SVG circle with animated `stroke-dashoffset` from `startSoc` → `targetSoc` over 90 seconds
  - Track: dark charcoal fill, 14px stroke
  - Fill: mint (`#34E5A1`), 14px stroke, `stroke-linecap: round`, drop-shadow glow filter
  - Center: `68` in huge font (68px+), `%` suffix smaller, "STATE OF CHARGE" label below in muted small caps
- 3-stat row below the dial (grid, 3 columns):
  - **Delivered** — kWh delivered (tabular numbers, tnum feature)
  - **Cost** — ₹ accrued
  - **Power** — current kW
- Elapsed / ETA line: `14 min elapsed · ~12 min to 80%`
- Bottom: **Stop charging** button (destructive red, full width, 56px tall)

**Live animation via `useSessionSim()` hook** (implement in `src/hooks/useSessionSim.ts`):

- Duration: 90 seconds simulated for a 40-min session
- `requestAnimationFrame` loop
- Compute from `startSoc` (user's vehicle current SoC — hardcode 40% for demo) → `targetSoc` (user's preferred charge-to %)
- Every animation frame:
  - `soc = startSoc + (targetSoc - startSoc) * (elapsed / totalDuration)`
  - `kWh = ((soc - startSoc) / 100) * vehicle.batteryKwh`
  - `costAccrued = kWh * connector.pricePerKwh` (with small ±1% jitter for realism)
  - `powerKw = maxPowerKw * (0.95 + Math.sin(elapsed / 3) * 0.05)` (natural fluctuation ±5%)
- Updates roll into `sessionStore.updateActiveSession(...)`
- Screen re-renders on store updates (all three counters visibly tick every ~200ms)

Use `font-feature-settings: 'tnum' 1` on numeric displays so digits don't jitter.

**On Stop:**

- Update session state to `STOPPING` → `COMPLETED`
- Route to `/session/[id]/complete` (settlement + receipt)

---

### 4. Settlement animation + Receipt + Rate Station (Days 20–21 tail)

**Route:** `src/app/session/[id]/complete/page.tsx`

**Content — sequential scripted animation (2.5s total) then receipt view:**

**Frame 1 (0–1s):**
- Big number: "₹500" with label "Held"
- Text: "Processing settlement..."

**Frame 2 (1–1.5s):**
- Number animates DOWN from 500 → 347 (approximately, based on real captured amount)
- Label switches to "Captured ₹347"

**Frame 3 (1.5–2.5s):**
- Number 153 appears with label "Refunded to your UPI"
- Small checkmark icon animates in

**Frame 4 (2.5s onward — settled state):**
- Receipt view slides up from bottom:
  - Session summary card:
    - Station name + CPO chip + date/time
    - Big kWh delivered (18.4 kWh) + duration (42 min) + cost accrued (₹347)
    - Breakdown: `Energy: ₹340 · Platform fee: ₹7 · Total: ₹347`
    - CO₂ saved (green mint chip: `🌱 24 kg CO₂ saved vs petrol equivalent`)
  - **Rate this station** section:
    - "How was this charger?" heading
    - 5-star tap row (thumbs, not stars — actually stars: 1–5 tappable)
    - Optional text input: "Anything worth noting? (optional)"
    - Submit button — writes to session store via `dataClient.submitReview(...)` (accepts, no-op in V1 mock but demonstrates the flow)
    - Skip link below submit
  - Bottom: primary button **"Back to Map"** → routes to `/map`

Rating attaches the completed sessionId so the review is verified-by-construction — per the reviews policy in `01_MVP_Overview.md`.

---

## Data + interface additions

**Session lifecycle state machine — add to `sessionStore`:**

```typescript
type SessionStatus =
  | 'INITIATED'
  | 'PAYMENT_AUTHORIZED'
  | 'STARTING'
  | 'ACTIVE'
  | 'STOPPING'
  | 'COMPLETED'
  | 'SETTLED'
  | 'FAILED';

interface SessionStoreState {
  activeSession: Session | null;
  initiateSession(input: InitiateSessionInput): Promise<Session>;
  startSession(sessionId: string): Promise<void>;
  updateActiveSession(update: Partial<Session>): void;
  stopSession(sessionId: string): Promise<void>;
  settleSession(sessionId: string): Promise<void>;
}
```

**DataClient methods to add** (interface + mock impl + api stub):

```typescript
initiateSession(input: InitiateSessionInput): Promise<Session>;
startSession(sessionId: string): Promise<Session>;
stopSession(sessionId: string): Promise<Session>;
subscribeToSession(sessionId: string, cb: (session: Session) => void): Unsubscribe;
submitReview(input: { sessionId: string; rating: number; text?: string }): Promise<Review>;
```

## Tech decisions — LOCKED

- Same stack as Week 1/2. No new dependencies.
- Animation: `framer-motion` for scripted sequences (settlement); `requestAnimationFrame` for continuous live counters (dial + stats).
- Camera: `navigator.mediaDevices.getUserMedia` — no library. If a specific browser rejects the permission, fall through to the mock overlay.
- QR "decode": don't. We're not actually decoding — just auto-transition after 1.5s.

---

## Success criteria

1. `pnpm tsc --noEmit` returns zero errors
2. `pnpm lint` returns zero errors
3. `pnpm build` succeeds
4. Full flow works end-to-end on desktop Chrome:
   - Land on Station Detail → tap "Scan to Charge" → camera opens (or mock overlay if denied) → auto-transitions after 1.5s
   - Payment sheet slides up with tabs; UPI is default; tap Approve → sheet closes, routes to Session screen
   - Session screen renders in dark theme with SoC dial animating from 40% upward
   - Three counters (Delivered / Cost / Power) visibly tick every ~200ms without digit jitter
   - Tap Stop → settlement animation plays (Hold → Captured → Refunded)
   - Receipt view shows with kWh, ₹ breakdown, CO₂ saved
   - Rate section accepts a rating + optional text; Submit or Skip both work
   - "Back to Map" returns to the Map screen
5. Same flow works on mobile Safari (camera permission dialog appears; if user denies, mock overlay carries the flow)
6. Session screen renders dark REGARDLESS of user's theme preference
7. Rest of app respects theme toggle unchanged

---

## What NOT to build in this session

- Route Planner (Week 4)
- Charging Passport screen content (Week 4)
- Real Razorpay integration (Layer 2)
- Real camera QR decoding (never — that's a real product feature but not V1 demo)
- Any Tier A additions (Week 5)
- Landing / Onboarding changes (Week 2 territory)
- Any real analytics or event tracking (Layer 2)

---

## When to stop and ask

- If the DataClient method signature you need doesn't exist (add to interface + mock + api stub, ask if unclear)
- If `getUserMedia` behaves differently across browsers in a way that blocks the flow — fall back to mock overlay and note the browser
- If the Session state machine enum values don't match what's in the existing `types.ts` — DO NOT rename; the values are locked (`INITIATED | PAYMENT_AUTHORIZED | ...`)
- If the design system doesn't specify styling for a new component (settlement animation, star rating)

---

## Style expectations

- Same code style as previous weeks (Prettier defaults, strict TS)
- The Session screen animation logic in one focused hook, not scattered
- Type everything
- Small components (SoC dial gets its own file; payment sheet gets its own file; settlement animation gets its own file)
- No new dependencies

---

## Deliverable

A `pnpm dev` session where the full "Scan → Payment → Live Session → Stop → Settlement → Receipt → Rate → Back to Map" flow works end-to-end. This is the demo's emotional hero — if it doesn't feel alive and premium, the whole pitch fails.

Run `git status` when done. Do not commit — I'll review.

Go.
