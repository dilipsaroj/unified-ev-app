# Cursor Prompt 04b — Layer 1 Gap Fixes

> Run this **after Prompt 04 is complete and merged** (Weeks 1–4 all working, deployed to Vercel at unified-ev-charge.vercel.app).
> Run this **before Prompt 05** (Week 5 Tier A data + copy).
> This is a **cleanup pass** — no new screens, only fixing gaps found during a spec-adherence audit of the deployed Week 4 build.

---

You are patching Unified-EV to close specific gaps between what was built in Weeks 1–4 and what the specs (`docs/02_Layer_1_V1_Prototype.md`, `docs/03_Layer_2_Post_Pilot.md`, `docs/design/design_system.md`) require. Every gap is documented below with exact file paths, line-level context, and success criteria.

## Read these files before starting

- **`docs/02_Layer_1_V1_Prototype.md`** — Sections 4 (DataClient adapter), 6 (faking "live"), 10 (data shapes), 13 (non-negotiables)
- **`docs/03_Layer_2_Post_Pilot.md`** — Section 6 (schema) for `station_reviews` shape reference
- **`docs/design/design_system.md`** — for Tailwind styling approach (relevant to the guardrail below)

## Scope for this session — 6 discrete fixes

Do NOT scope-creep. This session ONLY does the following, in order:

---

### 1. Remove stale "Week 2" placeholder from Profile page (5 minutes)

**File:** `src/app/profile/page.tsx`

At the bottom of the component there's a paragraph:

```tsx
<p className="text-center" style={{ fontSize: 13, color: 'var(--color-ink-4)', marginTop: 'auto' }}>
  Full profile, payment methods, and vehicle management coming in Week 2.
</p>
```

**Delete this entire paragraph.** Week 2 has come and gone; leaving the placeholder makes the app look unfinished to any viewer. If you want a footer, replace with an empty spacer div or nothing.

---

### 2. Add `submitReview` method to `DataClient` interface + mock implementation (30 minutes)

**File 1:** `src/lib/data/types.ts`

Add to the `DataClient` interface, in the "Reviews and photos" section:

```typescript
// Reviews and photos
getReviewsForStation(stationId: string): Promise<Review[]>;
getPhotosForStation(stationId: string): Promise<Photo[]>;
submitReview(input: SubmitReviewInput): Promise<Review>;   // NEW
```

Add the input type alongside other input types:

```typescript
export interface SubmitReviewInput {
  sessionId: string;
  stationId: string;
  userId: string;
  rating: number;   // 1-5
  text?: string;
}
```

**File 2:** `src/lib/data/mockClient.ts`

Add the implementation:

```typescript
async submitReview(input: SubmitReviewInput): Promise<Review> {
  await randomDelay();
  const review: Review = {
    id: `r-${Date.now()}`,
    stationId: input.stationId,
    cpoId: (await this.getStation(input.stationId))?.cpoId ?? 'unknown',
    sessionId: input.sessionId,
    userId: input.userId,
    userName: DEMO_USER.name,
    rating: input.rating,
    text: input.text ?? '',
    isCurated: false,   // Real user-written, not seeded
    createdAt: new Date().toISOString(),
  };
  // V1: in-memory only, doesn't persist beyond page reload
  // Layer 2 will insert into Postgres via Supabase
  return review;
}
```

**File 3:** `src/lib/data/apiClient.ts` (stub)

Add the stub method that throws:

```typescript
async submitReview(): Promise<Review> {
  throw new Error('submitReview not implemented in V1 — see docs/03_Layer_2_Post_Pilot.md');
}
```

**File 4:** wherever the Session Complete "Rate this station" flow is (probably `src/app/session/[id]/complete/page.tsx`)

Verify the rating submit button actually calls `dataClient.submitReview({...})`. If it's currently a no-op or console.log, wire it to the new method. On success: show a small toast "Thanks for the review." + hide the rating section. On failure: show error toast.

---

### 3. Populate `getPhotosForStation` with placeholder photos (1 hour)

**File 1:** `src/data/photos.json` (create if not present)

Generate 3 photos per station across all 17 stations = 51 rows total. Use this shape:

```json
[
  {
    "id": "photo-tp-bkc-01-1",
    "stationId": "tp-bkc-01",
    "cpoId": "tata-power",
    "sessionId": null,
    "userId": "curated",
    "url": "gradient://urban/1",
    "caption": "Entrance",
    "isCurated": true,
    "createdAt": "2026-07-01T00:00:00Z"
  },
  {
    "id": "photo-tp-bkc-01-2",
    "stationId": "tp-bkc-01",
    "cpoId": "tata-power",
    "sessionId": null,
    "userId": "curated",
    "url": "gradient://urban/2",
    "caption": "Connector",
    "isCurated": true,
    "createdAt": "2026-07-01T00:00:00Z"
  },
  {
    "id": "photo-tp-bkc-01-3",
    "stationId": "tp-bkc-01",
    "cpoId": "tata-power",
    "sessionId": null,
    "userId": "curated",
    "url": "gradient://urban/3",
    "caption": "Parking",
    "isCurated": true,
    "createdAt": "2026-07-01T00:00:00Z"
  }
]
```

**Photo categories to cycle across the 3 per station:** `Entrance`, `Connector`, `Parking`, `Café`, `Charging area`. Pick 3 different categories per station (skip Café for stations without a `cafe` amenity, etc. — match to amenities where possible).

**Gradient variants to cycle across stations** — use these URL scheme codes (component will map them to CSS gradients):

- `gradient://urban/1|2|3` → dark navy gradient (for offices, malls, BKC-style stations)
- `gradient://highway/1|2|3` → sunset orange gradient (for highway/expressway stations)
- `gradient://retail/1|2|3` → purple gradient (for mall/shopping stations)
- `gradient://parkside/1|2|3` → green gradient (for parkside/nature stations)

Assign gradient category by station context (highway stations → highway gradient, BKC/office → urban, etc.).

**File 2:** `src/lib/data/mockClient.ts`

Update `getPhotosForStation` to read from the new seed:

```typescript
import rawPhotos from '@/data/photos.json';
const photos = rawPhotos as Photo[];

// ...

async getPhotosForStation(stationId: string) {
  await randomDelay();
  return photos.filter((p) => p.stationId === stationId);
},
```

**File 3:** `src/components/station/StationPhotoCarousel.tsx` (or wherever the photo carousel lives)

Update the component to render CSS gradients based on the `url` field. Small helper:

```typescript
function gradientFromUrl(url: string): string {
  const [_, category] = url.replace('gradient://', '').split('/');
  const gradients: Record<string, string> = {
    urban: 'linear-gradient(135deg, #1E3A5F 0%, #0F2340 100%)',
    highway: 'linear-gradient(135deg, #EA580C 0%, #C2410C 100%)',
    retail: 'linear-gradient(135deg, #7C3AED 0%, #4C1D95 100%)',
    parkside: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
  };
  return gradients[category] ?? gradients.urban;
}
```

Render each photo as a full-width block with the gradient as `background`, a small semi-transparent white `Zap` icon (from `lucide-react`) bottom-right, and the caption as a chip at bottom-left.

---

### 4. Rename `is_curated` → `isCurated` for consistency (20 minutes)

**Reason:** JS/TS convention is camelCase for object properties. The current `is_curated` (snake_case) is a small hygiene bug — Layer 2 Postgres will use snake_case at the DB layer, but the app-level types should stay camelCase and get transformed at the DataClient boundary.

**Steps:**

1. In `src/lib/data/types.ts`: rename `is_curated` → `isCurated` on `Review` and `Photo` interfaces.
2. In `src/data/reviews.json` (and any similar seed file): rename `is_curated` → `isCurated` in every row. Use a search+replace across the file.
3. In every component that reads the field (grep for `is_curated` across `src/`): update to `isCurated`.
4. Confirm no TypeScript errors after the rename.

---

### 5. Verify `submitReview` end-to-end flow works (30 minutes)

**Manual test:**

1. `pnpm dev`
2. Complete the full flow: Landing → Onboarding → Map → Station Detail → Scan → Payment → Session → Stop → Settlement → Receipt
3. On the Receipt / Session Complete screen, submit a 4-star rating with text "Test review from Cursor session."
4. Confirm you see a success toast or state change
5. Navigate back to that station's Detail page — check if the review appears in the review list

If step 5's review doesn't appear, that's expected for V1 (the mock doesn't persist across navigations by default). Add an in-memory review store OR extend `mockClient` to append submitted reviews to an in-memory array that `getReviewsForStation` also reads from. Either is fine for V1.

---

### 6. Style guardrail — going forward (documentation only, no code changes)

**Do NOT retroactively refactor existing screens.** But going forward, apply this rule to every new component:

> **Use Tailwind utility classes for all styling. Reserve `style={{}}` inline props ONLY for truly dynamic values (computed heights based on scroll position, animated opacities driven by framer-motion, etc.).**

Bad (what current code does in Profile / Passport):
```tsx
<div style={{ fontSize: 16, background: 'var(--color-surface-2)', padding: 16 }}>
```

Good (what the spec expects):
```tsx
<div className="text-base bg-surface-2 p-4">
```

The design system tokens in `docs/design/design_system.md` should already be extended in `tailwind.config.ts`. If a token you need isn't defined, extend the config once and use the class — don't inline the color value.

**No code change for this section.** This is a note for Week 5 Prompt 05 and Prompt 06.

---

## Tech decisions — LOCKED

- No new dependencies
- No new routes
- No new screens
- No new stores
- No changes to Zustand state architecture
- No changes to Google Maps integration

## Success criteria

Verify each before considering done:

1. `pnpm tsc --noEmit` returns zero errors
2. `pnpm lint` returns zero errors
3. `pnpm build` succeeds
4. Profile page no longer shows "coming in Week 2" text
5. `submitReview` exists on `DataClient` interface + mockClient impl
6. Session Complete's Rate this station flow submits successfully
7. `getPhotosForStation('<any station id>')` returns 3 photos (not empty)
8. Station Detail photo carousel shows 3 gradient blocks with captions
9. `is_curated` renamed to `isCurated` everywhere (grep should return zero matches for `is_curated`)
10. Existing Week 1–4 flows still work end-to-end (no regressions)

## What NOT to do in this session

- Do NOT refactor Profile or Passport pages to use Tailwind classes (would balloon scope; save for a later refactor session if we choose)
- Do NOT add Bharat AC/DC connectors or 2W/3W vehicles (Prompt 05 / Week 5)
- Do NOT add WhatsApp link, RuPay copy, or FAME-II marker changes (Prompt 05)
- Do NOT add OCPI CDR export or refund policy (Prompt 06)
- Do NOT change the Session vs ChargingHistory type split (the current split works; unifying is Layer 2 territory)
- Do NOT touch the deploy pipeline or CI
- Do NOT add tests

## When to stop and ask

- If `submitReview` requires changes to `Session Complete` component that ripple beyond just wiring the click handler (i.e., structural refactor)
- If the `is_curated` rename cascades into files unrelated to Reviews/Photos (indicates deeper coupling — pause and report before proceeding)
- If the photo carousel component doesn't exist yet at all (which means Station Detail's photo section is stubbed — flag it and I'll adjust the prompt)

## Style expectations

- Small, focused commits (per the atomic commit strategy already in your repo)
- Suggested commit split:
  - Commit 1: `chore(profile): remove stale week 2 placeholder text`
  - Commit 2: `feat(data): add submitReview method to DataClient`
  - Commit 3: `feat(data): add curated station photos with gradient placeholders`
  - Commit 4: `refactor(types): rename is_curated to isCurated for camelCase consistency`
- Do NOT commit or push at the end — Dilip will review the diff first

## Deliverable

A `pnpm dev` session where:
- Profile has no placeholder text
- Session Complete Rate submits successfully with toast confirmation
- Station Detail carousel shows 3 gradient photo blocks with captions
- All types use camelCase (`isCurated` not `is_curated`)
- Build passes, lint passes, TypeScript passes

When done, run `git status` and list changes ready for review. Do not push.

Go.
