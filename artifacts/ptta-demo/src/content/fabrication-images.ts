import type { ModelId } from "@/content/models";

/**
 * Photo / render paths used throughout the Fabrication flow.
 *
 * - `fabricate` — three angles of the final 3D-printed piece, cycled
 *   during the build so the reveal shows the actual physical object
 *   materialising on the plate instead of a grayscale painting.
 * - `polish`    — single side-angle render used as the base image for
 *   the polishing stage. Fades in from a blurred/dim state as the
 *   buffer does its passes.
 * - `reveal`    — the finished-piece "in the wild" photo shown on the
 *   final stage.
 *
 * All paths are relative to Vite's BASE_URL. Use the helpers below
 * rather than consuming the map directly.
 *
 * Only Mona Lisa ships with render angles today; other models fall
 * back to rendering `model.image` with a grayscale filter inside the
 * Fabricate / Polish stages.
 */
interface ModelImages {
  fabricate?: [string, string, string];
  polish?: string;
  reveal?: string;
}

/**
 * Helper so each entry stays readable — all six models follow the same
 * render-file naming convention (`<id>-01.png` / `-02.png` / `-03.png`
 * for fabricate angles and `-04-polish.png` for the polish angle).
 */
function standardRenders(id: string, revealFile: string): ModelImages {
  return {
    fabricate: [
      `printed/renders/${id}-01.png`,
      `printed/renders/${id}-02.png`,
      `printed/renders/${id}-03.png`,
    ],
    polish: `printed/renders/${id}-04-polish.png`,
    reveal: `printed/${revealFile}`,
  };
}

const IMAGES: Record<ModelId, ModelImages> = {
  "mona-lisa":             standardRenders("mona-lisa",             "mona-lisa.jpg"),
  "van-gogh":              standardRenders("van-gogh",              "van-gogh.png"),
  "the-scream":            standardRenders("the-scream",            "the-scream.png"),
  "persistence-of-memory": standardRenders("persistence-of-memory", "persistence-of-memory.png"),
  "st-nikolai":            standardRenders("st-nikolai",            "st-nikolai.png"),
  "eiffel-tower":          standardRenders("eiffel-tower",          "eiffel-tower.png"),
};

function withBase(path: string): string {
  const base = import.meta.env.BASE_URL || "/";
  return `${base}${path}`.replace(/\/{2,}/g, "/");
}

export function fabricationImage(id: ModelId): string | undefined {
  const r = IMAGES[id]?.reveal;
  return r ? withBase(r) : undefined;
}

export function fabricateRenders(
  id: ModelId
): [string, string, string] | undefined {
  const r = IMAGES[id]?.fabricate;
  return r ? [withBase(r[0]), withBase(r[1]), withBase(r[2])] : undefined;
}

export function polishRender(id: ModelId): string | undefined {
  const r = IMAGES[id]?.polish;
  return r ? withBase(r) : undefined;
}

/**
 * Deterministic job-docket fields. Kept so FabricateStage / other bits
 * can display a stable "layer N of 240" / "Bay 02" without persisting
 * any state between visits.
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
