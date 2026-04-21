export type ModelId =
  | "mona-lisa"
  | "van-gogh"
  | "the-scream"
  | "st-nikolai"
  | "eiffel-tower";

export interface ModelEntry {
  id: ModelId;
  type: "painting" | "monument";
  title: string;
  artist: string;
  year: string;
  image: string;
  glb?: string;
  available: boolean;
  commissionedBy?: string;
  /** Override the default <model-viewer orientation> ("roll pitch yaw", in degrees). */
  orientation?: string;
  /** Override the default <model-viewer scale>, e.g. "1 1 2.5". */
  modelScale?: string;
}

function publicPath(relative: string): string {
  const base = import.meta.env.BASE_URL || "/";
  return `${base}${relative}`.replace(/\/{2,}/g, "/");
}

export const MODELS: ModelEntry[] = [
  {
    id: "mona-lisa",
    type: "painting",
    title: "Mona Lisa",
    artist: "Leonardo da Vinci",
    year: "c. 1503",
    image: publicPath("paintings/mona-lisa.webp"),
    glb: publicPath("models/mona-lisa.glb"),
    available: true,
    commissionedBy: "Commissioned by Tvibit Norway",
  },
  {
    id: "van-gogh",
    type: "painting",
    title: "Self-Portrait with Grey Felt Hat",
    artist: "Vincent van Gogh",
    year: "1887",
    image: publicPath("paintings/van-gogh.webp"),
    glb: publicPath("models/van-gogh.glb"),
    available: true,
  },
  {
    id: "the-scream",
    type: "painting",
    title: "The Scream",
    artist: "Edvard Munch",
    year: "1893",
    image: publicPath("paintings/the-scream.jpg"),
    glb: publicPath("models/the-scream.glb"),
    available: true,
    // The Scream's mesh is authored with Z as the tall axis and Y as the
    // shallow (depth) axis — unlike Mona Lisa / Van Gogh where Y is tall
    // and Z is depth. Rotate -90° around X so the painting stands upright,
    // then stretch the resulting depth (now Z) instead of the default.
    orientation: "0 -90 0",
    modelScale: "1 1 2.5",
  },
  {
    id: "st-nikolai",
    type: "monument",
    title: "St. Nikolai Church",
    artist: "Hamburg",
    year: "19th century",
    image: publicPath("paintings/st-nikolai.jpg"),
    glb: publicPath("models/st-nikolai.glb"),
    available: true,
    commissionedBy: "Commissioned by St. Nikolai Church Museum",
  },
  {
    id: "eiffel-tower",
    type: "monument",
    title: "Eiffel Tower",
    artist: "Paris",
    year: "1889",
    image: publicPath("paintings/eiffel-tower.webp"),
    glb: publicPath("models/eiffel-tower.glb"),
    available: true,
  },
];

export const PAINTINGS = MODELS.filter((m) => m.type === "painting");
export const MONUMENTS = MODELS.filter((m) => m.type === "monument");
