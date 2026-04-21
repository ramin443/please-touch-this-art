export const ARTIST_IDS = ["van-gogh", "dali", "munch"] as const;
export type ArtistId = (typeof ARTIST_IDS)[number];

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
}

export const ARTISTS: Record<ArtistId, ArtistMeta> = {
  "van-gogh": {
    id: "van-gogh",
    displayName: "Vincent van Gogh",
    shortName: "Vincent",
    placeholder: "Ask Vincent something…",
    suggested: [
      "Why the swirls in the sky?",
      "What did Theo mean to you?",
    ],
    portrait: "artists/van-gogh.webp",
    portraitAlt: "Self-portrait of Vincent van Gogh with a grey felt hat",
    lifespan: "1853–1890",
    tagline: "Writing from Saint-Rémy, 1889",
  },
  "dali": {
    id: "dali",
    displayName: "Salvador Dalí",
    shortName: "Salvador",
    placeholder: "Ask Salvador something…",
    suggested: [
      "Why do the clocks melt?",
      "Tell me about Gala.",
    ],
    portrait: "artists/dali.jpg",
    portraitAlt: "Photograph of Salvador Dalí with his iconic upturned moustache",
    lifespan: "1904–1989",
    tagline: "Port Lligat, 1960s",
  },
  "munch": {
    id: "munch",
    displayName: "Edvard Munch",
    shortName: "Edvard",
    placeholder: "Ask Edvard something…",
    suggested: [
      "What scream did you hear?",
      "How did love and death meet in your work?",
    ],
    portrait: "artists/munch.jpg",
    portraitAlt: "Self-portrait of Edvard Munch holding a palette",
    lifespan: "1863–1944",
    tagline: "Ekely, Kristiania",
  },
};
