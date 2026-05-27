import type { ModelId } from "@/content/models";
import type { ProcessSlug } from "@/components/ProcessStepper";

/*
 * Session-scoped memory of which (artwork, process) pairs have already run
 * through their animation. When a user revisits a process they've already
 * seen, we drop them directly onto the final output instead of replaying
 * the build-up — the animation is illustrative, not the destination.
 *
 * sessionStorage (per tab, cleared on close) keeps the experience predictable
 * across reloads but doesn't persist forever.
 */

const STORAGE_PREFIX = "ptta-journey-complete";

function storageKey(artworkId: ModelId, slug: ProcessSlug): string {
  return `${STORAGE_PREFIX}:${artworkId}:${slug}`;
}

function safeStorage(): Storage | null {
  try {
    return typeof window !== "undefined" ? window.sessionStorage : null;
  } catch {
    return null;
  }
}

export function hasCompleted(
  artworkId: ModelId,
  slug: ProcessSlug,
): boolean {
  const store = safeStorage();
  if (!store) return false;
  return store.getItem(storageKey(artworkId, slug)) === "1";
}

export function markCompleted(artworkId: ModelId, slug: ProcessSlug): void {
  const store = safeStorage();
  if (!store) return;
  try {
    store.setItem(storageKey(artworkId, slug), "1");
  } catch {
    /* quota or private-mode — non-fatal, just means no skip-ahead */
  }
}
