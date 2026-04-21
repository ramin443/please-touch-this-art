export type ModelId = "mona-lisa" | "van-gogh" | "st-nikolai";

export interface ModelEntry {
  id: ModelId;
  type: "painting" | "monument";
  title: string;
  artist: string;
  year: string;
  image: string;
  glb?: string;
  available: boolean;
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
    id: "st-nikolai",
    type: "monument",
    title: "St. Nikolai Church",
    artist: "Hamburg",
    year: "19th century",
    image: publicPath("paintings/st-nikolai.jpg"),
    glb: publicPath("models/st-nikolai.glb"),
    available: true,
  },
];

export const PAINTINGS = MODELS.filter((m) => m.type === "painting");
export const MONUMENTS = MODELS.filter((m) => m.type === "monument");
