import type { ModelId } from "@/content/models";

/**
 * Finished-piece photos shown on the RevealStage of the Fabrication flow.
 * Kept in a separate module (not on ModelEntry) so the cofounder's edits to
 * models.ts and this branch's fabrication work don't collide on merge.
 *
 * Values are relative paths — use `fabricationImage(id)` to get a final URL
 * that respects Vite's BASE_URL.
 */
const IMAGES: Record<ModelId, string | undefined> = {
  "mona-lisa":             "printed/mona-lisa.jpg",
  "van-gogh":              "printed/van-gogh.png",
  "the-scream":            "printed/the-scream.png",
  "persistence-of-memory": "printed/persistence-of-memory.png",
  "st-nikolai":            "printed/st-nikolai.png",
  "eiffel-tower":          "printed/eiffel-tower.png",
};

export function fabricationImage(id: ModelId): string | undefined {
  const rel = IMAGES[id];
  if (!rel) return undefined;
  const base = import.meta.env.BASE_URL || "/";
  return `${base}${rel}`.replace(/\/{2,}/g, "/");
}

/**
 * Deterministic job-docket fields for the Dispatch stage. Values derive
 * from the model id so the same model always renders with the same docket
 * across visits, without persisting state.
 */
export function dispatchDocket(id: ModelId): {
  jobNumber: string;
  bayNumber: string;
  estTime: string;
} {
  let hash = 0;
  for (const c of id) hash = (hash * 31 + c.charCodeAt(0)) >>> 0;
  const jobNumber = `#${(hash % 9000) + 1000}`;
  const bayNumber = `0${(id.length % 4) + 1}`;
  const hours = (id.length % 6) + 2;
  const minutes = (id.length * 7) % 60;
  const estTime = `${hours}h ${minutes.toString().padStart(2, "0")}m`;
  return { jobNumber, bayNumber, estTime };
}
