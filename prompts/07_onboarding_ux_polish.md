# Cursor Prompt 07 — Onboarding UX Polish

> Run this after all Tier 1 fixes are merged and live.
> Working folder: `/Users/dilipkumarsaroj/Desktop/Projects/Unified-EV/`
> **Micro-improvements only — no new screens, no new routes, no logic changes.**
> Three small UX gaps found during a first-time customer walkthrough. Each is a communication fix, not a feature.

---

## Context

The onboarding flow works correctly end-to-end. These 3 changes close the gap between "it works" and "a first-time user understands what to do without thinking."

---

## Change 1 — Vehicle picker instruction line (10 minutes)

**File:** `src/app/onboarding/vehicle/page.tsx`

**Problem:** Three segment tiles render but there's no instruction. New users see three grey boxes and a greyed-out Continue button with no explanation of why it's disabled.

**Fix:** Add one instruction line directly below the `<p>Vehicle type</p>` label, before the segment grid:

```tsx
<p className="text-sm font-medium" style={{ color: 'var(--color-ink-2)' }}>
  Vehicle type
</p>
<p className="text-xs" style={{ color: 'var(--color-ink-3)', marginBottom: 4 }}>
  Select your vehicle type to get started
</p>
```

Also make the vehicle model dropdown more obviously tappable — the chevron is currently subtle. Add a visible border highlight on the input:

```
border: '1.5px solid var(--color-brand-500)'
```

when `selectedClass` is set but `selectedVehicle` is null (i.e. the user picked a segment but hasn't chosen a model yet). This draws the eye to the next required action.

Do not change the segment tile layout, icon sizes, or Continue button behavior.

---

## Change 2 — First-time welcome toast on map (20 minutes)

**File:** `src/app/map/page.tsx` (or wherever the map page initializes)

**Problem:** After completing onboarding, the user is dropped on the map with no acknowledgement. No greeting, no confirmation that setup is done.

**Fix:** When the map page mounts, check if this is a first-time arrival from onboarding. Use a simple flag in `localStorage` or `sessionStorage` — key: `uev_welcomed`, value: `true`.

Logic:
- On map mount, check if `sessionStorage.getItem('uev_welcomed')` is falsy AND `currentUser` exists
- If so: fire a success toast — `"Welcome to Unified-EV, {user.name || 'there'} 👋 Tap any station to start"`
- Then set `sessionStorage.setItem('uev_welcomed', 'true')` so it only shows once per session

Use the existing `useToast()` hook — `success()` variant. Delay by 800ms after mount so the map has time to render before the toast appears.

```typescript
useEffect(() => {
  if (!currentUser) return;
  if (sessionStorage.getItem('uev_welcomed')) return;

  const timer = setTimeout(() => {
    success(`Welcome to Unified-EV, ${currentUser.name || 'there'} 👋 Tap any station to start`);
    sessionStorage.setItem('uev_welcomed', 'true');
  }, 800);

  return () => clearTimeout(timer);
}, [currentUser]);
```

Do not add any new state, store, or persistent flag beyond `sessionStorage`. Do not show this toast on subsequent visits.

---

## Change 3 — First-time map hint (30 minutes)

**File:** `src/app/map/page.tsx` — the bottom sheet or map canvas area

**Problem:** A first-time user on the map has no guidance on what to do. The reliability scores are the product story but there's no signpost pointing to them.

**Fix:** Show a one-time hint chip that appears below the filter pills and above the station list, only on the first visit. Dismisses on tap or after 5 seconds.

```tsx
{showHint && (
  <div
    className="flex items-center justify-between px-4 py-3 mx-4 rounded-xl"
    style={{
      background: 'var(--color-brand-50)',
      border: '1px solid var(--color-brand-500)',
      marginBottom: 8,
    }}
  >
    <p className="text-sm" style={{ color: 'var(--color-brand-900)', flex: 1 }}>
      Tap any station to see its reliability score before driving there
    </p>
    <button
      onClick={() => setShowHint(false)}
      style={{ color: 'var(--color-brand-500)', marginLeft: 12, flexShrink: 0 }}
      aria-label="Dismiss"
    >
      <X size={16} />
    </button>
  </div>
)}
```

State:
```typescript
const [showHint, setShowHint] = useState(() => {
  if (typeof window === 'undefined') return false;
  return !sessionStorage.getItem('uev_map_hint_dismissed');
});
```

Auto-dismiss after 5 seconds:
```typescript
useEffect(() => {
  if (!showHint) return;
  const timer = setTimeout(() => {
    setShowHint(false);
    sessionStorage.setItem('uev_map_hint_dismissed', 'true');
  }, 5000);
  return () => clearTimeout(timer);
}, [showHint]);
```

On manual dismiss (X tap), also set `sessionStorage.setItem('uev_map_hint_dismissed', 'true')`.

The hint only shows once per session. Do not use localStorage — refreshing the page on a return visit should not show it again (sessionStorage clears on tab close).

Use the existing `X` icon from `lucide-react` (already imported in most files).

---

## Success criteria

1. `pnpm tsc --noEmit` → zero errors
2. `pnpm lint` → zero errors
3. `pnpm build` → succeeds
4. Manual walkthrough at 420px phone-frame width:
   - Vehicle picker shows instruction line below "Vehicle type"
   - After selecting Two-wheeler, the vehicle model dropdown has a visible green border
   - After completing onboarding and landing on map, welcome toast appears after ~800ms and reads "Welcome to Unified-EV, [name] 👋 Tap any station to start"
   - Green hint chip appears below filter pills on first map visit
   - Hint dismisses on tap or auto-dismisses after 5 seconds
   - Refreshing the map does not show the hint again in the same session
   - None of these appear on subsequent sessions (sessionStorage cleared)

---

## What NOT to do

- Do NOT add a dedicated welcome screen or splash screen
- Do NOT change the map layout, filter pills, or station list order
- Do NOT use localStorage for any of these flags — sessionStorage only
- Do NOT change the BottomNav, segment tile sizes, or Continue button logic
- Do NOT add any new routes or components
- Do NOT show the welcome toast or hint to users who are already logged in and returning (check `uev_welcomed` in sessionStorage)

## When to stop and ask

- If `useToast()` hook does not have a `success()` variant — report and use `info()` or `warning()` instead
- If the map bottom sheet structure makes it unclear where to inject the hint chip — report the component tree before inserting

## Suggested commits

- `fix(onboarding): add vehicle type instruction and dropdown focus hint`
- `feat(map): welcome toast and first-visit reliability hint for new users`

Run `git status` when done. Do not push — Dilip will review first.

Go.
