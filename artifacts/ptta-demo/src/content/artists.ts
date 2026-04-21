export const ARTIST_IDS = ["van-gogh", "dali", "munch"] as const;
export type ArtistId = (typeof ARTIST_IDS)[number];

export interface ArtistMeta {
  id: ArtistId;
  displayName: string;
  shortName: string;
  placeholder: string;
  suggested: [string, string];
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
  },
};
