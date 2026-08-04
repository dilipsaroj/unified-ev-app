# Cursor Prompt 04d — Data Completion

> Run this **now** — it patches gaps found during a post-deploy audit.
> Working folder: `/Users/dilipkumarsaroj/Desktop/Projects/Unified-EV/`
> **Pure data pass — no code changes, no new components, no logic changes.**
> Touch only the 5 files listed below. Nothing else.

---

A post-deploy audit of the live build at `unified-ev-charge.vercel.app` found 5 data gaps. All are JSON seed data or a single UI text removal. No interface changes, no store changes, no routing changes.

## Files to touch — exactly 5

1. `src/data/vehicles.json`
2. `src/data/connectors.json`
3. `src/data/reliability.json`
4. `src/data/reviews.json`
5. `src/app/profile/page.tsx`

Do NOT touch any other file.

---

## Fix 1 — `src/data/vehicles.json`

**Problem A:** All 12 existing vehicles are missing the `vehicleClass` field. The onboarding vehicle picker filters by `vehicleClass`, so all segment picker tabs currently return 0 results.

**Problem B:** The 7 2W/3W vehicles spec'd in Prompt 05 were never added.

**Action:** Add `vehicleClass` to all 12 existing entries + append the 7 new 2W/3W vehicles.

### Add `"vehicleClass": "FOUR_WHEELER"` to all 12 existing vehicles

Every existing vehicle entry gets one new field. Example:

```json
{
  "id": "tata-nexon-ev-max",
  "make": "Tata",
  "model": "Nexon EV Max",
  "vehicleClass": "FOUR_WHEELER",
  "batteryKwh": 40.5,
  ...
}
```

Apply `"vehicleClass": "FOUR_WHEELER"` to all 12 existing entries. Do not change any other field.

### Append these 7 new vehicles at the end of the array

```json
{
  "id": "ather-450x",
  "make": "Ather",
  "model": "450X",
  "vehicleClass": "TWO_WHEELER",
  "batteryKwh": 3.7,
  "connectorType": "BHARAT_DC_001",
  "avgConsumptionWhPerKm": 20,
  "maxChargeRateKw": 15,
  "preferredChargeToPct": 80
},
{
  "id": "ola-s1-pro",
  "make": "Ola Electric",
  "model": "S1 Pro",
  "vehicleClass": "TWO_WHEELER",
  "batteryKwh": 4.0,
  "connectorType": "BHARAT_DC_001",
  "avgConsumptionWhPerKm": 22,
  "maxChargeRateKw": 8,
  "preferredChargeToPct": 80
},
{
  "id": "tvs-iqube",
  "make": "TVS",
  "model": "iQube",
  "vehicleClass": "TWO_WHEELER",
  "batteryKwh": 5.1,
  "connectorType": "BHARAT_AC_001",
  "avgConsumptionWhPerKm": 25,
  "maxChargeRateKw": 3.3,
  "preferredChargeToPct": 80
},
{
  "id": "bajaj-chetak",
  "make": "Bajaj",
  "model": "Chetak",
  "vehicleClass": "TWO_WHEELER",
  "batteryKwh": 3.5,
  "connectorType": "BHARAT_AC_001",
  "avgConsumptionWhPerKm": 24,
  "maxChargeRateKw": 3.3,
  "preferredChargeToPct": 80
},
{
  "id": "hero-vida-v1",
  "make": "Hero",
  "model": "Vida V1",
  "vehicleClass": "TWO_WHEELER",
  "batteryKwh": 3.9,
  "connectorType": "BHARAT_AC_001",
  "avgConsumptionWhPerKm": 22,
  "maxChargeRateKw": 3.3,
  "preferredChargeToPct": 80
},
{
  "id": "mahindra-treo",
  "make": "Mahindra",
  "model": "Treo",
  "vehicleClass": "THREE_WHEELER",
  "batteryKwh": 7.4,
  "connectorType": "BHARAT_DC_001",
  "avgConsumptionWhPerKm": 65,
  "maxChargeRateKw": 15,
  "preferredChargeToPct": 80
},
{
  "id": "bajaj-re-etec",
  "make": "Bajaj",
  "model": "RE E-Tec",
  "vehicleClass": "THREE_WHEELER",
  "batteryKwh": 8.9,
  "connectorType": "BHARAT_DC_001",
  "avgConsumptionWhPerKm": 70,
  "maxChargeRateKw": 15,
  "preferredChargeToPct": 80
}
```

**Result:** 19 total vehicles. Four-wheeler tab shows 12, Two-wheeler tab shows 5, Three-wheeler tab shows 2. Segment picker is fully functional.

---

## Fix 2 — `src/data/connectors.json`

**Problem:** 9 highway stations have zero connectors. Route Planner charging stop cards and Station Detail pages for these stations show no connector info.

**Action:** Append 18 new connector entries (2 per highway station) to the end of the existing array.

```json
{ "id": "tp-lonavala-01-c1", "stationId": "tp-lonavala-01", "cpoId": "tata-power", "identifier": "A1", "type": "CCS_2", "maxPowerKw": 50, "pricePerKwh": 18.5, "status": "AVAILABLE" },
{ "id": "tp-lonavala-01-c2", "stationId": "tp-lonavala-01", "cpoId": "tata-power", "identifier": "A2", "type": "TYPE_2_AC", "maxPowerKw": 22, "pricePerKwh": 14.0, "status": "AVAILABLE" },

{ "id": "statiq-lonavala-01-c1", "stationId": "statiq-lonavala-01", "cpoId": "statiq", "identifier": "B1", "type": "CCS_2", "maxPowerKw": 50, "pricePerKwh": 17.5, "status": "AVAILABLE" },
{ "id": "statiq-lonavala-01-c2", "stationId": "statiq-lonavala-01", "cpoId": "statiq", "identifier": "B2", "type": "TYPE_2_AC", "maxPowerKw": 22, "pricePerKwh": 13.5, "status": "AVAILABLE" },

{ "id": "jio-khandala-01-c1", "stationId": "jio-khandala-01", "cpoId": "jio-bp", "identifier": "C1", "type": "CCS_2", "maxPowerKw": 60, "pricePerKwh": 19.0, "status": "AVAILABLE" },
{ "id": "jio-khandala-01-c2", "stationId": "jio-khandala-01", "cpoId": "jio-bp", "identifier": "C2", "type": "BHARAT_DC_001", "maxPowerKw": 15, "pricePerKwh": 9.5, "status": "AVAILABLE" },

{ "id": "tp-neemrana-01-c1", "stationId": "tp-neemrana-01", "cpoId": "tata-power", "identifier": "D1", "type": "CCS_2", "maxPowerKw": 50, "pricePerKwh": 18.5, "status": "AVAILABLE" },
{ "id": "tp-neemrana-01-c2", "stationId": "tp-neemrana-01", "cpoId": "tata-power", "identifier": "D2", "type": "TYPE_2_AC", "maxPowerKw": 22, "pricePerKwh": 14.0, "status": "AVAILABLE" },

{ "id": "iocl-neemrana-01-c1", "stationId": "iocl-neemrana-01", "cpoId": "iocl", "identifier": "E1", "type": "BHARAT_DC_001", "maxPowerKw": 15, "pricePerKwh": 9.0, "status": "AVAILABLE" },
{ "id": "iocl-neemrana-01-c2", "stationId": "iocl-neemrana-01", "cpoId": "iocl", "identifier": "E2", "type": "TYPE_2_AC", "maxPowerKw": 7, "pricePerKwh": 11.5, "status": "AVAILABLE" },

{ "id": "hpcl-kotputli-01-c1", "stationId": "hpcl-kotputli-01", "cpoId": "hpcl", "identifier": "F1", "type": "CCS_2", "maxPowerKw": 30, "pricePerKwh": 17.0, "status": "AVAILABLE" },
{ "id": "hpcl-kotputli-01-c2", "stationId": "hpcl-kotputli-01", "cpoId": "hpcl", "identifier": "F2", "type": "BHARAT_AC_001", "maxPowerKw": 3.3, "pricePerKwh": 7.5, "status": "AVAILABLE" },

{ "id": "statiq-mandya-01-c1", "stationId": "statiq-mandya-01", "cpoId": "statiq", "identifier": "G1", "type": "CCS_2", "maxPowerKw": 50, "pricePerKwh": 17.0, "status": "AVAILABLE" },
{ "id": "statiq-mandya-01-c2", "stationId": "statiq-mandya-01", "cpoId": "statiq", "identifier": "G2", "type": "TYPE_2_AC", "maxPowerKw": 22, "pricePerKwh": 13.0, "status": "AVAILABLE" },

{ "id": "tp-mandya-01-c1", "stationId": "tp-mandya-01", "cpoId": "tata-power", "identifier": "H1", "type": "CCS_2", "maxPowerKw": 50, "pricePerKwh": 18.0, "status": "AVAILABLE" },
{ "id": "tp-mandya-01-c2", "stationId": "tp-mandya-01", "cpoId": "tata-power", "identifier": "H2", "type": "TYPE_2_AC", "maxPowerKw": 22, "pricePerKwh": 14.0, "status": "AVAILABLE" },

{ "id": "jio-srirangapatna-01-c1", "stationId": "jio-srirangapatna-01", "cpoId": "jio-bp", "identifier": "I1", "type": "CCS_2", "maxPowerKw": 60, "pricePerKwh": 19.0, "status": "AVAILABLE" },
{ "id": "jio-srirangapatna-01-c2", "stationId": "jio-srirangapatna-01", "cpoId": "jio-bp", "identifier": "I2", "type": "BHARAT_DC_001", "maxPowerKw": 15, "pricePerKwh": 9.0, "status": "AVAILABLE" }
```

**Result:** 34 total connectors across 17 stations. Every station has at least 2 connectors. Connector mix includes Bharat DC/AC on highway stations — realistic for HPCL/IOCL/Jio-bp which have installed Bharat-standard chargers on national highways.

---

## Fix 3 — `src/data/reliability.json`

**Problem:** Reliability data only covers the 8 Mumbai stations. 9 highway stations show 0% reliability — worse than no data.

**Action:** Append 18 reliability entries (matching the 18 new connector IDs from Fix 2).

Highway stations are real chargers on NH-48, NH-44, NH-275 — modelled with realistic but slightly lower reliability than city stations (highway chargers face more weather exposure, higher usage variance).

```json
{ "connectorId": "tp-lonavala-01-c1", "scorePct": 91, "sampleSize": 823, "windowDays": 30, "lastConfirmedAt": "2026-07-30T17:30:00Z" },
{ "connectorId": "tp-lonavala-01-c2", "scorePct": 88, "sampleSize": 612, "windowDays": 30, "lastConfirmedAt": "2026-07-30T16:45:00Z" },

{ "connectorId": "statiq-lonavala-01-c1", "scorePct": 87, "sampleSize": 534, "windowDays": 30, "lastConfirmedAt": "2026-07-30T15:20:00Z" },
{ "connectorId": "statiq-lonavala-01-c2", "scorePct": 84, "sampleSize": 401, "windowDays": 30, "lastConfirmedAt": "2026-07-30T14:55:00Z" },

{ "connectorId": "jio-khandala-01-c1", "scorePct": 83, "sampleSize": 478, "windowDays": 30, "lastConfirmedAt": "2026-07-30T18:10:00Z" },
{ "connectorId": "jio-khandala-01-c2", "scorePct": 79, "sampleSize": 312, "windowDays": 30, "lastConfirmedAt": "2026-07-30T17:50:00Z" },

{ "connectorId": "tp-neemrana-01-c1", "scorePct": 93, "sampleSize": 956, "windowDays": 30, "lastConfirmedAt": "2026-07-30T19:00:00Z" },
{ "connectorId": "tp-neemrana-01-c2", "scorePct": 90, "sampleSize": 734, "windowDays": 30, "lastConfirmedAt": "2026-07-30T18:40:00Z" },

{ "connectorId": "iocl-neemrana-01-c1", "scorePct": 76, "sampleSize": 298, "windowDays": 30, "lastConfirmedAt": "2026-07-30T12:30:00Z" },
{ "connectorId": "iocl-neemrana-01-c2", "scorePct": 81, "sampleSize": 267, "windowDays": 30, "lastConfirmedAt": "2026-07-30T13:15:00Z" },

{ "connectorId": "hpcl-kotputli-01-c1", "scorePct": 71, "sampleSize": 245, "windowDays": 30, "lastConfirmedAt": "2026-07-29T22:10:00Z" },
{ "connectorId": "hpcl-kotputli-01-c2", "scorePct": 68, "sampleSize": 178, "windowDays": 30, "lastConfirmedAt": "2026-07-29T20:45:00Z" },

{ "connectorId": "statiq-mandya-01-c1", "scorePct": 89, "sampleSize": 667, "windowDays": 30, "lastConfirmedAt": "2026-07-30T18:25:00Z" },
{ "connectorId": "statiq-mandya-01-c2", "scorePct": 86, "sampleSize": 512, "windowDays": 30, "lastConfirmedAt": "2026-07-30T17:40:00Z" },

{ "connectorId": "tp-mandya-01-c1", "scorePct": 92, "sampleSize": 789, "windowDays": 30, "lastConfirmedAt": "2026-07-30T19:05:00Z" },
{ "connectorId": "tp-mandya-01-c2", "scorePct": 88, "sampleSize": 623, "windowDays": 30, "lastConfirmedAt": "2026-07-30T18:50:00Z" },

{ "connectorId": "jio-srirangapatna-01-c1", "scorePct": 85, "sampleSize": 445, "windowDays": 30, "lastConfirmedAt": "2026-07-30T17:20:00Z" },
{ "connectorId": "jio-srirangapatna-01-c2", "scorePct": 82, "sampleSize": 334, "windowDays": 30, "lastConfirmedAt": "2026-07-30T16:30:00Z" }
```

**Notes on the scores:**
- `tp-lonavala-01` (91%) → green tier — Tata Power's highway flagship, high uptime
- `hpcl-kotputli-01` (71% / 68%) → amber/red — realistic for older HPCL station, adds credibility
- No station gets a fake 99% — dishonest reliability is the whole problem we're solving

---

## Fix 4 — `src/data/reviews.json`

**Problem:** 20 reviews exist but only for 8 Mumbai stations. Highway stations show empty review sections.

**Action:** Append 18 new reviews (2 per highway station) to the end of the existing array.

```json
{
  "id": "rv-021",
  "stationId": "tp-lonavala-01",
  "cpoId": "tata-power",
  "sessionId": null,
  "userId": "seed-user-21",
  "userName": "Nikhil Shetty",
  "rating": 5,
  "text": "Perfect mid-point stop on the Mumbai–Pune expressway. Got 30% in 28 minutes. Café inside the plaza makes the wait easy.",
  "isCurated": true,
  "createdAt": "2026-07-28T11:30:00Z"
},
{
  "id": "rv-022",
  "stationId": "tp-lonavala-01",
  "cpoId": "tata-power",
  "sessionId": null,
  "userId": "seed-user-22",
  "userName": "Ritu Sharma",
  "rating": 4,
  "text": "Both CCS2 chargers working reliably. Can get busy on long weekends — arrived early morning and had no wait.",
  "isCurated": true,
  "createdAt": "2026-07-20T08:15:00Z"
},
{
  "id": "rv-023",
  "stationId": "statiq-lonavala-01",
  "cpoId": "statiq",
  "sessionId": null,
  "userId": "seed-user-23",
  "userName": "Tarun Mehta",
  "rating": 4,
  "text": "Good alternative if Tata Power station is full. Slightly older hardware but worked perfectly both visits.",
  "isCurated": true,
  "createdAt": "2026-07-25T14:00:00Z"
},
{
  "id": "rv-024",
  "stationId": "statiq-lonavala-01",
  "cpoId": "statiq",
  "sessionId": null,
  "userId": "seed-user-24",
  "userName": "Anjali Joshi",
  "rating": 3,
  "text": "AC charger slow for a highway stop. DC worked fine. Would prefer more DC options here given the highway traffic.",
  "isCurated": true,
  "createdAt": "2026-07-18T16:20:00Z"
},
{
  "id": "rv-025",
  "stationId": "jio-khandala-01",
  "cpoId": "jio-bp",
  "sessionId": null,
  "userId": "seed-user-25",
  "userName": "Saurabh Kulkarni",
  "rating": 3,
  "text": "DC fast charger worked but power dipped during charging — got 35kW instead of 60kW. Fine for a quick top-up.",
  "isCurated": true,
  "createdAt": "2026-07-22T13:45:00Z"
},
{
  "id": "rv-026",
  "stationId": "jio-khandala-01",
  "cpoId": "jio-bp",
  "sessionId": null,
  "userId": "seed-user-26",
  "userName": "Smita Gokhale",
  "rating": 4,
  "text": "Bharat DC charger here — worked great for my Ather. Not many places on the expressway have this type yet.",
  "isCurated": true,
  "createdAt": "2026-07-15T10:10:00Z"
},
{
  "id": "rv-027",
  "stationId": "tp-neemrana-01",
  "cpoId": "tata-power",
  "sessionId": null,
  "userId": "seed-user-27",
  "userName": "Aryan Kapoor",
  "rating": 5,
  "text": "Best charging stop on Delhi–Jaipur highway. Fort view from the parking. 50kW DC, charged from 20% to 80% in 50 minutes.",
  "isCurated": true,
  "createdAt": "2026-07-29T09:30:00Z"
},
{
  "id": "rv-028",
  "stationId": "tp-neemrana-01",
  "cpoId": "tata-power",
  "sessionId": null,
  "userId": "seed-user-28",
  "userName": "Nandita Verma",
  "rating": 5,
  "text": "Both connectors in perfect condition. Staff proactively helped with cable routing. Will definitely stop here again.",
  "isCurated": true,
  "createdAt": "2026-07-21T07:00:00Z"
},
{
  "id": "rv-029",
  "stationId": "iocl-neemrana-01",
  "cpoId": "iocl",
  "sessionId": null,
  "userId": "seed-user-29",
  "userName": "Pranav Bhatia",
  "rating": 3,
  "text": "Bharat DC charger for 2-wheelers — works well. 4W CCS option also available but slower than nearby Tata Power.",
  "isCurated": true,
  "createdAt": "2026-07-17T12:00:00Z"
},
{
  "id": "rv-030",
  "stationId": "iocl-neemrana-01",
  "cpoId": "iocl",
  "sessionId": null,
  "userId": "seed-user-30",
  "userName": "Gauri Saxena",
  "rating": 3,
  "text": "Works fine but the area is dusty and exposed. AC unit was showing an error — only DC was functional on my visit.",
  "isCurated": true,
  "createdAt": "2026-07-12T15:30:00Z"
},
{
  "id": "rv-031",
  "stationId": "hpcl-kotputli-01",
  "cpoId": "hpcl",
  "sessionId": null,
  "userId": "seed-user-31",
  "userName": "Harsh Tiwari",
  "rating": 2,
  "text": "CCS charger was working but very slow — actual power was around 18kW instead of 30kW. Plan extra time here.",
  "isCurated": true,
  "createdAt": "2026-07-26T17:00:00Z"
},
{
  "id": "rv-032",
  "stationId": "hpcl-kotputli-01",
  "cpoId": "hpcl",
  "sessionId": null,
  "userId": "seed-user-32",
  "userName": "Shruti Agarwal",
  "rating": 3,
  "text": "Not the most reliable but it's the only option before Jaipur. Bharat AC for scooters worked fine. Keep expectations low.",
  "isCurated": true,
  "createdAt": "2026-07-09T14:20:00Z"
},
{
  "id": "rv-033",
  "stationId": "statiq-mandya-01",
  "cpoId": "statiq",
  "sessionId": null,
  "userId": "seed-user-33",
  "userName": "Vivek Nair",
  "rating": 4,
  "text": "Great mid-point on Bengaluru–Mysore expressway. Café nearby, clean parking, both chargers working reliably.",
  "isCurated": true,
  "createdAt": "2026-07-27T10:45:00Z"
},
{
  "id": "rv-034",
  "stationId": "statiq-mandya-01",
  "cpoId": "statiq",
  "sessionId": null,
  "userId": "seed-user-34",
  "userName": "Lakshmi Reddy",
  "rating": 5,
  "text": "Used this 3 times on my Mysore drives. Never had an issue. Statiq keeps it well maintained. Best on this route.",
  "isCurated": true,
  "createdAt": "2026-07-19T09:15:00Z"
},
{
  "id": "rv-035",
  "stationId": "tp-mandya-01",
  "cpoId": "tata-power",
  "sessionId": null,
  "userId": "seed-user-35",
  "userName": "Madan Kumar",
  "rating": 5,
  "text": "Tata Power quality — solid as always. Shopping complex nearby. Charged from 25% to 78% in 40 minutes.",
  "isCurated": true,
  "createdAt": "2026-07-24T12:30:00Z"
},
{
  "id": "rv-036",
  "stationId": "tp-mandya-01",
  "cpoId": "tata-power",
  "sessionId": null,
  "userId": "seed-user-36",
  "userName": "Usha Pillai",
  "rating": 4,
  "text": "Both chargers in good shape. Gets busy on Sunday afternoons — arrive before noon or after 3pm for no wait.",
  "isCurated": true,
  "createdAt": "2026-07-16T11:00:00Z"
},
{
  "id": "rv-037",
  "stationId": "jio-srirangapatna-01",
  "cpoId": "jio-bp",
  "sessionId": null,
  "userId": "seed-user-37",
  "userName": "Aakash Menon",
  "rating": 4,
  "text": "Historic stop — Srirangapatna fort nearby while you charge. 60kW DC got me 35% in 25 minutes. Will return.",
  "isCurated": true,
  "createdAt": "2026-07-23T14:00:00Z"
},
{
  "id": "rv-038",
  "stationId": "jio-srirangapatna-01",
  "cpoId": "jio-bp",
  "sessionId": null,
  "userId": "seed-user-38",
  "userName": "Kavitha Subramaniam",
  "rating": 4,
  "text": "Bharat DC charger for my scooter worked perfectly here. Surprised to find 2-wheeler support on a highway stop.",
  "isCurated": true,
  "createdAt": "2026-07-11T16:45:00Z"
}
```

---

## Fix 5 — `src/app/profile/page.tsx`

**Problem:** Stale placeholder text from Week 1 still visible on the deployed site.

**Action:** Find and delete this exact paragraph — do NOT replace it with anything:

```tsx
<p
  className="text-center"
  style={{ fontSize: 13, color: 'var(--color-ink-4)', marginTop: 'auto' }}
>
  Full profile, payment methods, and vehicle management coming in Week 2.
</p>
```

If the exact formatting differs slightly in the file, find the paragraph containing the text "Full profile, payment methods, and vehicle management coming in Week 2." and delete it entirely.

---

## Success criteria

1. `pnpm tsc --noEmit` returns zero errors
2. `pnpm lint` returns zero errors
3. `pnpm build` succeeds
4. `pnpm dev` — open onboarding, complete phone + OTP, reach vehicle picker:
   - Segment picker shows "Two-wheeler (5)", "Three-wheeler (2)", "Four-wheeler (12)"
   - Selecting Two-wheeler shows Ather 450X, Ola S1 Pro, TVS iQube, Bajaj Chetak, Hero Vida
   - Selecting Three-wheeler shows Mahindra Treo, Bajaj RE E-Tec
   - Selecting Four-wheeler shows all 12 original vehicles
5. Open any highway station via the Route Planner or by navigating to `/station/tp-lonavala-01` — connector info and reliability score are visible (not empty)
6. Profile page has no "coming in Week 2" text anywhere

## What NOT to do

- Do NOT touch `types.ts` — `VehicleClass` type already exists
- Do NOT touch any component files except `profile/page.tsx`
- Do NOT add new routes
- Do NOT modify existing connector, reliability, or review entries — append only
- Do NOT add photos.json (that was 04b's task — separate)
- Do NOT commit or push — Dilip will review the diff first

## When to stop and ask

- If `VehicleClass` is not defined in `types.ts` and TypeScript errors appear — stop and report
- If the profile placeholder text is in a different component than `src/app/profile/page.tsx` — stop and report the correct file

## Suggested commits (after Dilip reviews)

- `feat(data): add vehicleClass field + 7 2W/3W vehicles to catalog`
- `feat(data): add connectors, reliability, reviews for 9 highway stations`
- `chore(profile): remove stale week 2 placeholder text`

Run `git status` when done. Do not push.

Go.
