export type ModelId =
  | "mona-lisa"
  | "van-gogh"
  | "starry-night"
  | "sunflowers"
  | "girl-with-pearl-earring"
  | "guernica"
  | "three-musicians"
  | "the-night-watch"
  | "dogs-playing-poker"
  | "napoleon-crossing-the-alps"
  | "the-great-wave"
  | "takiyasha"
  | "harlequins-carnival"
  | "whaam"
  | "the-weeping-woman"
  | "the-scream"
  | "persistence-of-memory"
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
  /** GLB ships with its own painted/baked textures — skip the beige material override. */
  colored?: boolean;
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
    colored: true,
  },
  {
    id: "starry-night",
    type: "painting",
    title: "The Starry Night",
    artist: "Vincent van Gogh",
    year: "1889",
    image: publicPath("paintings/starry-night.webp"),
    glb: publicPath("models/starry-night.glb"),
    available: true,
    colored: true,
    // Authored lying flat (Y = shallow depth, Z = tall), same convention
    // as The Scream / Persistence. Rotate 90° around X to stand it upright
    // facing the camera.
    orientation: "0 -90 0",
  },
  {
    id: "sunflowers",
    type: "painting",
    title: "Sunflowers",
    artist: "Vincent van Gogh",
    year: "1888",
    image: publicPath("paintings/sunflowers.jpg"),
    glb: publicPath("models/sunflowers.glb"),
    available: true,
    colored: true,
    // Same lying-flat authoring convention — stand it up to face the camera.
    orientation: "0 -90 0",
  },
  {
    id: "girl-with-pearl-earring",
    type: "painting",
    title: "Girl with a Pearl Earring",
    artist: "Johannes Vermeer",
    year: "c. 1665",
    image: publicPath("paintings/girl-with-pearl-earring.jpg"),
    glb: publicPath("models/girl-with-pearl-earring.glb"),
    available: true,
    colored: true,
    // Same lying-flat authoring convention as Starry Night — stand it up.
    orientation: "0 -90 0",
  },
  {
    id: "guernica",
    type: "painting",
    title: "Guernica",
    artist: "Pablo Picasso",
    year: "1937",
    image: publicPath("paintings/guernica.jpg"),
    glb: publicPath("models/guernica.glb"),
    available: true,
    colored: true,
    // Same lying-flat authoring convention — stand it up to face the camera.
    orientation: "0 -90 0",
  },
  {
    id: "three-musicians",
    type: "painting",
    title: "Three Musicians",
    artist: "Pablo Picasso",
    year: "1921",
    image: publicPath("paintings/three-musicians.jpg"),
    glb: publicPath("models/three-musicians.glb"),
    available: true,
    colored: true,
    // Same lying-flat authoring convention — stand it up to face the camera.
    orientation: "0 -90 0",
  },
  {
    id: "the-night-watch",
    type: "painting",
    title: "The Night Watch",
    artist: "Rembrandt van Rijn",
    year: "1642",
    image: publicPath("paintings/the-night-watch.jpg"),
    glb: publicPath("models/the-night-watch.glb"),
    available: true,
    colored: true,
    // Same lying-flat authoring convention — stand it up to face the camera.
    orientation: "0 -90 0",
  },
  {
    id: "dogs-playing-poker",
    type: "painting",
    title: "Dogs Playing Poker",
    artist: "C. M. Coolidge",
    year: "1903",
    image: publicPath("paintings/dogs-playing-poker.jpg"),
    glb: publicPath("models/dogs-playing-poker.glb"),
    available: true,
    colored: true,
    // Same lying-flat authoring convention — stand it up to face the camera.
    orientation: "0 -90 0",
  },
  {
    id: "napoleon-crossing-the-alps",
    type: "painting",
    title: "Napoleon Crossing the Alps",
    artist: "Jacques-Louis David",
    year: "1801",
    image: publicPath("paintings/napoleon-crossing-the-alps.jpg"),
    glb: publicPath("models/napoleon-crossing-the-alps.glb"),
    available: true,
    colored: true,
    // Same lying-flat authoring convention — stand it up to face the camera.
    orientation: "0 -90 0",
  },
  {
    id: "the-great-wave",
    type: "painting",
    title: "The Great Wave off Kanagawa",
    artist: "Katsushika Hokusai",
    year: "1831",
    image: publicPath("paintings/the-great-wave.jpg"),
    glb: publicPath("models/the-great-wave.glb"),
    available: true,
    colored: true,
    // Same lying-flat authoring convention — stand it up to face the camera.
    orientation: "0 -90 0",
  },
  {
    id: "takiyasha",
    type: "painting",
    title: "Takiyasha the Witch and the Skeleton Spectre",
    artist: "Utagawa Kuniyoshi",
    year: "c. 1844",
    image: publicPath("paintings/takiyasha.jpg"),
    glb: publicPath("models/takiyasha.glb"),
    available: true,
    colored: true,
    // Same lying-flat authoring convention — stand it up to face the camera.
    orientation: "0 -90 0",
  },
  {
    id: "harlequins-carnival",
    type: "painting",
    title: "The Harlequin's Carnival",
    artist: "Joan Miró",
    year: "1925",
    image: publicPath("paintings/harlequins-carnival.jpg"),
    glb: publicPath("models/harlequins-carnival.glb"),
    available: true,
    colored: true,
    // Same lying-flat authoring convention — stand it up to face the camera.
    orientation: "0 -90 0",
  },
  {
    id: "whaam",
    type: "painting",
    title: "Whaam!",
    artist: "Roy Lichtenstein",
    year: "1963",
    image: publicPath("paintings/whaam.jpg"),
    glb: publicPath("models/whaam.glb"),
    available: true,
    colored: true,
    // Same lying-flat authoring convention — stand it up to face the camera.
    orientation: "0 -90 0",
  },
  {
    id: "the-weeping-woman",
    type: "painting",
    title: "The Weeping Woman",
    artist: "Pablo Picasso",
    year: "1937",
    image: publicPath("paintings/the-weeping-woman.jpg"),
    glb: publicPath("models/the-weeping-woman.glb"),
    available: true,
    colored: true,
    // Same lying-flat authoring convention — stand it up to face the camera.
    orientation: "0 -90 0",
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
    colored: true,
    // Authored lying flat (Y = shallow depth, Z = tall). Rotate 90°
    // around X so it stands upright with its face toward the camera.
    orientation: "0 -90 0",
  },
  {
    id: "persistence-of-memory",
    type: "painting",
    title: "The Persistence of Memory",
    artist: "Salvador Dalí",
    year: "1931",
    image: publicPath("paintings/persistence-of-memory.jpeg"),
    glb: publicPath("models/persistence-of-memory.glb"),
    available: true,
    colored: true,
    // Same axis convention as The Scream — stand it up via X rotation.
    orientation: "0 -90 0",
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
