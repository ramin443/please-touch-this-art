# Fabrication page — design spec

**Date:** 2026-04-21
**Branch:** `feature-3d-printing-page`
**Status:** Approved

## Goal

Add a second demo module — parallel to the existing `/painting-to-model` flow — that shows how a tactile model is physically produced. Lives at `/fabrication` and is surfaced by the existing "3D Printing" card in `/demo-hub` (today that card routes to a placeholder).

The word "3D printing" stays out of the user-visible copy. We use **Fabrication** throughout.

## Scope and boundaries

### In scope (this branch)
- New page `src/pages/Fabrication.tsx`
- New component directory `src/components/fabrication/`
- New content file `src/content/fabrication-images.ts` — maps each `ModelId` to a finished-piece photo path
- Six finished-piece images dropped under `public/printed/`
- One additive edit to `src/content/copy.ts`: set `route: "/fabrication"` on the existing `3d-printing` card
- One additive edit to `src/App.tsx`: register the `/fabrication` route

### Out of scope
- No changes to the painting→3D model flow, Landing, HowItWorks, DemoHub, Header, or editorial primitives — cofounder is actively working on these files.
- No edits to `src/content/models.ts`. Finished-image paths live in a separate file to avoid conflicting with model catalog edits.
- No i18n structure changes. Stage copy is hardcoded inside the stage components; it can be migrated into `copy.ts` later without touching the component signatures.
- No shared-file refactor. Where the new page needs picker-like UI, it forks rather than extends `ModelPicker` so changes are self-contained.
- `prefers-reduced-motion`: matches the existing `ProcessingStage` stance — animations continue to run because they are the content of the demo.

## Architecture

### Routing
- One route: `/fabrication`.
- The page owns its internal state machine: `picker → dispatch → fabricate → polish → reveal`.
- Back arrow at any stage returns the user to `/demo-hub`.
- Browser back button leaves the demo (one URL for the whole flow — mirrors the `/painting-to-model` pattern).

### State shape
```ts
type FabricationState =
  | { stage: "picker" }
  | { stage: "dispatch"; modelId: ModelId }
  | { stage: "fabricate"; modelId: ModelId }
  | { stage: "polish"; modelId: ModelId }
  | { stage: "reveal"; modelId: ModelId };
```
Transitions are all pure state updates returning new objects. No mutation.

### File layout
```
artifacts/ptta-demo/
  public/printed/
    mona-lisa.jpg
    van-gogh.png
    the-scream.png
    persistence-of-memory.png
    st-nikolai.png
    eiffel-tower.png
  src/
    pages/
      Fabrication.tsx                page shell + state machine
    components/fabrication/
      FabricationPicker.tsx          picker (forked from ModelPicker)
      DispatchStage.tsx              stage 01
      FabricateStage.tsx             stage 02
      PolishStage.tsx                stage 03
      RevealStage.tsx                stage 04 (interactive end)
      ReferenceCard.tsx              pinned painting card, reused across stages 02 + 03
    content/
      fabrication-images.ts          ModelId → printed-photo path map
    App.tsx                          + <Route path="/fabrication" …/>
    content/copy.ts                  + route: "/fabrication" on the 3d-printing card
```

## Stages

All stage timings are measured from stage-enter. Auto-advance is handled by a `setTimeout` inside each stage's `useEffect`; the timer is cleared on unmount. Transitions between stages are a 250 ms cross-fade on the stage container.

### Stage 01 — Dispatch (2.5 s)
The painting starts at ~65 % of the viewport, centered, in a warm-toned frame. A stamp reading **"→ QUEUED"** fades in at an 8° tilt over the lower-right corner of the painting around t=1.0 s. Around t=1.8 s the painting scales to ~15 % and slides up to the top-right, where it remains as a pinned reference card through stages 02 and 03.

A monospace work-order docket sits at the bottom of the screen throughout the stage:
```
JOB #{hash(modelId)} · {artist} · {year}
Queued · Bay {bayNumber} · Est. {estTime}
```
Fields are derived from the `ModelEntry`. `bayNumber` and `estTime` are deterministic pseudo-random values keyed off `modelId` for stability — the docket says the same thing every time a user revisits a model.

### Stage 02 — Fabricate (4 s)
Dark build chamber fills the main canvas. Subtle side walls via faint vertical gradients. A build bed with dashed rule markings sits 10 % from the bottom. A nozzle occupies the top; it has a visible thin feed tube going up out of frame and a glowing `#D64324` heated tip.

The nozzle travels back-and-forth in a zig-zag path. **Motion is deliberately non-uniform** — brief pauses at row ends (~150 ms), tiny 2-pixel jitters mid-travel. This is the "manual" feel; no smooth constant-velocity tweening.

Discrete horizontal layer lines emit beneath the bed every ~300 ms, accumulating upward. New layers appear bright (`#D64324`, 1.5 px), then fade to ~40 % opacity to simulate settling material.

A small typographic readout sits under the canvas:
```
layer 087 of 240          ● live
```
The layer counter increments visibly every ~50 ms so the number is always moving.

`ReferenceCard` is pinned top-right throughout.

### Stage 03 — Polish (3 s)
Completely different energy. Build chamber disappears. A warm radial spotlight illuminates a dark "finishing table". The solid model sits in the centre of that light as a simple, warm-toned rectangle (stand-in for the fabricated piece — we don't render a 3D viewer here; this is pure staging).

A circular buffer tool (~22 px) orbits the surface following a **figure-8 path**, not a grid scan. A dashed outer ring on the buffer rotates to sell "spinning". Where the buffer passes, a soft highlight gradient follows briefly — the lit patch persists ~400 ms before fading, so the tool appears to leave behind a polished trail.

Three or four small sparks puff out of the contact point on a 1.2 s loop, drifting diagonally as they fade.

Readout:
```
surface pass 02 of 04     ● buffing
```

`ReferenceCard` still pinned top-right.

### Stage 04 — Reveal (interactive, no auto-advance)
Full-bleed hero photo of the finished piece from `public/printed/{modelId}.{ext}`. Dark background so the photo sits in a light-box-like frame.

Top overlay (fades in at t=0.2 s):
- Back arrow (→ `/demo-hub`)
- Model title + artist/year

Bottom overlay (fades in at t=0.5 s, slightly later):
- Eyebrow: **"This is how it looks in your hands"** (accent red, uppercase, tracked)
- Model name, artist, year (serif)
- If `ModelEntry.commissionedBy` exists, show it as a small caps line above the button
- "View another" pill → returns state to `picker`

## Data

### `src/content/fabrication-images.ts`
```ts
import type { ModelId } from "@/content/models";

/**
 * Paths are relative to BASE_URL. The map is exhaustive for every ModelId
 * that has `available: true` in models.ts — if a model is flipped to
 * available without an entry here, we render a placeholder in RevealStage.
 */
export const FABRICATION_IMAGES: Record<ModelId, string | undefined> = {
  "mona-lisa":            "printed/mona-lisa.jpg",
  "van-gogh":             "printed/van-gogh.png",
  "the-scream":           "printed/the-scream.png",
  "persistence-of-memory":"printed/persistence-of-memory.png",
  "st-nikolai":           "printed/st-nikolai.png",
  "eiffel-tower":         "printed/eiffel-tower.png",
};
```

### Deterministic docket fields
```ts
function jobNumber(id: ModelId): string {
  // 4-digit deterministic hash of id, prefixed
  let n = 0;
  for (const c of id) n = (n * 31 + c.charCodeAt(0)) >>> 0;
  return `#${(n % 9000) + 1000}`;
}
function bayNumber(id: ModelId): string { return `0${(id.length % 4) + 1}`; }
function estTime(id: ModelId): string  { return `${(id.length % 6) + 2}h ${(id.length * 7) % 60}m`; }
```
Values are strings, not calculations rendered at runtime — stable on refresh.

## Accessibility

- 56 px minimum touch targets on buttons.
- Every interactive element has `aria-label`.
- Each stage has an `aria-live="polite"` region containing the current stage title so a screen reader announces "Dispatch", "Fabricate", "Polish", "Reveal" as the flow advances.
- Focus-visible outline in accent red, offset 2 px.
- The finished-piece photo in RevealStage has descriptive `alt` text: `"Finished tactile relief of {title} by {artist}"`.
- Back arrows are real `<button>` elements with `aria-label="Back to demo hub"`.

## Visual tokens

All styling pulls from the existing tokens on main:
- Background: `bg-stone-950` for dark stages, `bg-page` for picker.
- Accent: `#D64324` (matches cofounder's `--color-accent`).
- Text: `text-cream` on dark, `text-ink` on light.
- Serif headings: `font-serif` (Instrument Serif).
- Small caps / labels: `ptta-label` class (already defined in `index.css`).
- Mono for docket/log: `ui-monospace, Menlo, monospace` inline.

## Error handling and edge cases

- Unknown `modelId` in state: `Fabrication.tsx` looks up the model in `MODELS`; if missing, resets state to `picker` and renders the picker. No user-facing error message (this path is only reachable via programmatic mis-use).
- Missing finished-piece image (404): `RevealStage` shows a muted "Finished piece not on file yet" fallback with the same back + "View another" controls. No hard error.
- `model.glb` missing: not used on this page. No implication.

## Testing strategy

No unit tests are planned for this feature — the stages are presentational and time-driven. Verification is by:
1. `pnpm --filter @workspace/ptta-demo run typecheck` must pass.
2. Manual run-through of all six models end-to-end at `localhost:5173/fabrication`.
3. Puppeteer screenshot per stage per model into `/tmp/mv-test/fab-*.png` for eyeball verification — same pattern the existing viewer used during its development.

## Rollout

Single branch, single merge. No feature flag. On merge to main the `3d-printing` card in `/demo-hub` starts routing to the new page instead of the placeholder.
