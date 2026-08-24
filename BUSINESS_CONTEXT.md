# Unified-EV — Business Context
# Paste this into your business/strategy Claude chat

---

## Who I am
Dilip Kumar Saroj, solo founder, Mumbai. Building Unified-EV — India's first EV charger reliability layer.
Live app: unified-ev-charge.vercel.app
Email: dilipsaroj95@gmail.com

---

## The product (brief)
Cross-CPO EV charging app. Core moat = per-connector reliability score (0–100%, green/amber/red).
No competitor (Bolt.Earth, Statiq, ChargeZone, UBC) has this.
Stack: Next.js 15 PWA, deployed on Vercel. All 11 screens built, mock data currently.

---

## Business model

### How I earn
**Phase 1 (now — no CPO agreement needed):**
- Subscription: ₹99–199/month (reliability alerts, trip planner, saved routes)
- Featured listings: CPOs pay to appear first in search
- Lead generation: CPOs pay per verified user navigated to their station

**Phase 2 (after OCPI agreement with CPOs):**
- Transaction commission: 2–4% of every charging session routed through the app
- Fleet SaaS: ₹500–2000/vehicle/month
- Reliability data sold to OEMs and insurers

### Commission math
User pays ₹200 → they get full ₹200 of charging.
CPO gets ₹194 (after 3% cut). User never loses value. Full transparency shown on payment screen.

Most stations have ₹500 minimum. At ₹500:
- ₹15/kWh = 33 kWh = ~200km range (Nexon EV)
- ₹18/kWh = 27.7 kWh = ~165km range
- ₹20/kWh = 25 kWh = ~150km range

### Weekly commission at different user scales
| Users/week | Your 3% cut/week | Monthly |
|---|---|---|
| 1,000 | ₹18,000 | ₹72,000 |
| 10,000 | ₹1,80,000 | ₹7,20,000 |
| 50,000 | ₹9,00,000 | ₹36,00,000 |
| 1,00,000 | ₹18,00,000 | ₹72,00,000 |

Business becomes real money at 50,000+ weekly active users.

---

## Investor questions — answered

### Does investor get cut of monthly revenue?
NO. Investor gets equity (ownership %), not monthly commission.
₹1L/month commission → investor gets ₹0 of it monthly.
Their return comes only at exit (acquisition or IPO).

### ₹40L investment at 20% equity
- Post-money valuation today: ₹2 crore
- Year 3 (company = ₹4Cr): investor's 20% = ₹80L (2x return)
- Year 8 (company = ₹40Cr): investor's 20% = ₹8 crore (20x return)
- Investor put in ₹40L, walks away with ₹8Cr after 8 years

### What investor gets monthly
Nothing financial. Just:
- Monthly progress update
- Transparency on spending
- Approval on major decisions if board seat

---

## CPO strategy — the big picture

### The core confusion (resolved)
I don't need every CPO to agree before the app has value.

**Phase 1 — Discovery layer (no CPO needed)**
User opens app → finds all nearby chargers (all networks) → sees reliability score → navigates there → pays in CPO's own app.
App was useful for find + trust + navigate. User comes back tomorrow.
This is how Zomato worked in 2010 — found restaurant on Zomato, paid cash inside.

**Phase 2 — One CPO (ChargeZone) unlocks everything**
ChargeZone CPO (Kartikey Hariyani) replied "Sure" to LinkedIn DM.
If ChargeZone gives OCPI access:
- User scans HP/ChargeZone QR with my app
- App reads station ID from QR → sends RemoteStartTransaction via OCPI
- Charger starts → payment via Razorpay in my app → session tracked
- 2,000+ ChargeZone chargers available in-app overnight

**Phase 3 — Other CPOs follow**
Once I have 10,000 users navigating to stations monthly, I go to HP:
"1,000 users went to your stations last month through my app. Give me OCPI and I'll send 10,000."
They don't say no to that.

### How HP/Jio-bp QR works
Physical QR on nozzle contains: station ID + connector ID
Without OCPI: user scans QR → opens HP app → pays there
With OCPI: user scans same QR with my app → my app fires remote start → HP charger starts → pay in my app

### The MakeMyTrip analogy
MakeMyTrip doesn't own IndiGo. Built users first, airlines came to them.
My app = MakeMyTrip for EV charging.

---

## Investor targets (active, early stage, EV focus)

**Priority 1 — Micelio Fund**
- India's only VC exclusively for clean mobility
- Invests Pre-seed to Series A
- Email: support@micelio.com
- Website: micelio.com/micelio-funds

**Priority 2 — 9Unicorns (Venture Catalysts)**
- Standard deal: ₹60L for 5% equity
- Invests in 100+ companies/year, EV is focus sector
- Apply: venturecatalysts.in

**Priority 3 — Venture Catalysts**
- Backed ChargeZone directly — knows my space
- Apply: venturecatalysts.in/apply

**Priority 4 — The Chennai Angels**
- Backs EV + sustainability startups
- thechennaiangels.com

**On Ananya Birla:**
She invests larger cheques at later stages. At prototype stage, Micelio + 9Unicorns are better fits.
Revisit Ananya Birla after first CPO agreement + 10,000 users.

### Pitch message to send (short, no ask for money)
"I'm building India's first EV charger reliability layer — solving the broken charger problem every EV driver faces.
Live at unified-ev-charge.vercel.app with real reliability scoring per connector.
ChargeZone CPO has expressed interest in a pilot.
Looking for ₹40–80L seed to complete payments and onboard first CPO on OCPI. Happy to share more."

---

## What unlocks everything — get 10,000 users first
That number unlocks investor conversations, CPO conversations, media.

To get 10,000 users, need:
1. Real station data (Open Charge Map API — free)
2. Real auth (SMS OTP via MSG91)
3. "Confirm working / Report broken" check-in button

No CPO agreement needed for any of these.

---

## Current development status
- All screens built (mock data)
- Next step: Prisma + Supabase DB setup (discussed in dev chat)
- After DB: real auth → real station data → check-in button → Razorpay
- GitHub: github.com/dilipsaroj/unified-ev-app
