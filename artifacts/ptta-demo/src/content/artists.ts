export const ARTIST_IDS = ["leonardo", "van-gogh", "dali", "munch"] as const;
export type ArtistId = (typeof ARTIST_IDS)[number];

export interface ArtistPalette {
  /** Primary accent color — used for ring, highlight, cursor. */
  accent: string;
  /** Backdrop gradient start (top). */
  gradientFrom: string;
  /** Backdrop gradient end (bottom). */
  gradientTo: string;
}

export interface ArtistMeta {
  id: ArtistId;
  displayName: string;
  shortName: string;
  placeholder: string;
  suggested: [string, string];
  portrait: string;
  portraitAlt: string;
  lifespan: string;
  tagline: string;
  /** Short italic quote shown in the hero card. */
  quote: string;
  palette: ArtistPalette;
}

export const ARTISTS: Record<ArtistId, ArtistMeta> = {
  "leonardo": {
    id: "leonardo",
    displayName: "Leonardo da Vinci",
    shortName: "Leonardo",
    placeholder: "Type your question to Leonardo",
    suggested: [
      "Why does the Mona Lisa smile?",
      "What did you learn from dissecting bodies?",
    ],
    portrait: "artists/leonardo.webp",
    portraitAlt: "Engraved portrait of Leonardo da Vinci",
    lifespan: "1452–1519",
    tagline: "Amboise, 1517",
    quote: "Simplicity is the ultimate sophistication.",
    palette: {
      accent: "#b08d57",
      gradientFrom: "#5a3d22",
      gradientTo: "#1a1208",
    },
  },
  "van-gogh": {
    id: "van-gogh",
    displayName: "Vincent van Gogh",
    shortName: "Vincent",
    placeholder: "Type your question to Vincent",
    suggested: [
      "Why the swirls in the sky?",
      "What did Theo mean to you?",
    ],
    portrait: "artists/van-gogh.webp",
    portraitAlt: "Self-portrait of Vincent van Gogh with a grey felt hat",
    lifespan: "1853–1890",
    tagline: "Saint-Rémy, 1889",
    quote: "I dream my painting and I paint my dream.",
    palette: {
      accent: "#e0a82e",
      gradientFrom: "#1b3a6b",
      gradientTo: "#2b1a0a",
    },
  },
  "dali": {
    id: "dali",
    displayName: "Salvador Dalí",
    shortName: "Salvador",
    placeholder: "Type your question to Salvador",
    suggested: [
      "Why do the clocks melt?",
      "Tell me about Gala.",
    ],
    portrait: "artists/dali.jpg",
    portraitAlt: "Photograph of Salvador Dalí with his iconic upturned moustache",
    lifespan: "1904–1989",
    tagline: "Port Lligat, 1960s",
    quote: "The only difference between me and a madman is that I am not mad.",
    palette: {
      accent: "#e28b3a",
      gradientFrom: "#c58c3f",
      gradientTo: "#3a1f0f",
    },
  },
  "munch": {
    id: "munch",
    displayName: "Edvard Munch",
    shortName: "Edvard",
    placeholder: "Type your question to Edvard",
    suggested: [
      "What scream did you hear?",
      "How did love and death meet in your work?",
    ],
    portrait: "artists/munch.jpg",
    portraitAlt: "Self-portrait of Edvard Munch holding a palette",
    lifespan: "1863–1944",
    tagline: "Ekely, Kristiania",
    quote: "I felt a great, unending scream piercing through nature.",
    palette: {
      accent: "#d55a2b",
      gradientFrom: "#1d3647",
      gradientTo: "#0a1820",
    },
  },
};
