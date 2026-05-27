export const ARTIST_IDS = [
  "leonardo",
  "van-gogh",
  "vermeer",
  "rembrandt",
  "dali",
  "munch",
  "picasso",
  "coolidge",
  "david",
  "hokusai",
  "kuniyoshi",
  "miro",
  "lichtenstein",
] as const;
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
  "vermeer": {
    id: "vermeer",
    displayName: "Johannes Vermeer",
    shortName: "Johannes",
    placeholder: "Type your question to Johannes",
    suggested: [
      "How did you paint that pearl?",
      "Did you use a camera obscura?",
    ],
    portrait: "artists/vermeer.jpg",
    portraitAlt: "Portrait believed to depict Johannes Vermeer",
    lifespan: "1632–1675",
    tagline: "Delft, 1665",
    quote: "Light is the quietest truth a room can hold.",
    palette: {
      accent: "#c9a23c",
      gradientFrom: "#243a52",
      gradientTo: "#0a0d12",
    },
  },
  "rembrandt": {
    id: "rembrandt",
    displayName: "Rembrandt van Rijn",
    shortName: "Rembrandt",
    placeholder: "Type your question to Rembrandt",
    suggested: [
      "Why is The Night Watch so dark?",
      "What did bankruptcy cost you?",
    ],
    portrait: "artists/rembrandt.jpg",
    portraitAlt: "Self-portrait of Rembrandt van Rijn in old age",
    lifespan: "1606–1669",
    tagline: "Amsterdam, 1669",
    quote: "Choose only one master: Nature.",
    palette: {
      accent: "#c08a3e",
      gradientFrom: "#3b2a17",
      gradientTo: "#0c0805",
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
  "picasso": {
    id: "picasso",
    displayName: "Pablo Picasso",
    shortName: "Pablo",
    placeholder: "Type your question to Pablo",
    suggested: [
      "Why did you break the figure apart?",
      "What was the Blue Period about?",
    ],
    portrait: "artists/picasso.jpg",
    portraitAlt: "Photograph of Pablo Picasso in a flat cap",
    lifespan: "1881–1973",
    tagline: "Mougins, France",
    quote: "Every act of creation is first an act of destruction.",
    palette: {
      accent: "#d98a3d",
      gradientFrom: "#2a3f63",
      gradientTo: "#120c0a",
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
  "coolidge": {
    id: "coolidge",
    displayName: "C. M. Coolidge",
    shortName: "Cassius",
    placeholder: "Type your question to Cassius",
    suggested: [
      "Why did you paint dogs playing poker?",
      "Was it really just for advertising?",
    ],
    portrait: "artists/coolidge.jpg",
    portraitAlt: "Photograph of Cassius Marcellus Coolidge",
    lifespan: "1844–1934",
    tagline: "New York, 1903",
    quote: "I never took it too seriously, and that was the whole joke.",
    palette: {
      accent: "#c98a3d",
      gradientFrom: "#2f4636",
      gradientTo: "#0c0f0b",
    },
  },
  "david": {
    id: "david",
    displayName: "Jacques-Louis David",
    shortName: "Jacques-Louis",
    placeholder: "Type your question to Jacques-Louis",
    suggested: [
      "Did Napoleon really cross on a stallion?",
      "Why did you serve the Revolution?",
    ],
    portrait: "artists/david.jpg",
    portraitAlt: "Self-portrait of Jacques-Louis David",
    lifespan: "1748–1825",
    tagline: "Brussels, 1820s",
    quote: "Calm and serene, paint as the ancients did.",
    palette: {
      accent: "#b5462f",
      gradientFrom: "#36465f",
      gradientTo: "#0c0e14",
    },
  },
  "hokusai": {
    id: "hokusai",
    displayName: "Katsushika Hokusai",
    shortName: "Hokusai",
    placeholder: "Type your question to Hokusai",
    suggested: [
      "What is hidden in the great wave?",
      "Why paint Mount Fuji so many times?",
    ],
    portrait: "artists/hokusai.webp",
    portraitAlt: "Portrait of Katsushika Hokusai",
    lifespan: "1760–1849",
    tagline: "Edo, 1831",
    quote: "At seventy-three I learned a little of the true structure of things.",
    palette: {
      accent: "#3b6ea5",
      gradientFrom: "#1c3a52",
      gradientTo: "#0a0f14",
    },
  },
  "kuniyoshi": {
    id: "kuniyoshi",
    displayName: "Utagawa Kuniyoshi",
    shortName: "Kuniyoshi",
    placeholder: "Type your question to Kuniyoshi",
    suggested: [
      "What is the giant skeleton in Takiyasha?",
      "Why paint so many warriors, ghosts, and cats?",
    ],
    portrait: "artists/kuniyoshi.jpg",
    portraitAlt: "Portrait of the ukiyo-e master Utagawa Kuniyoshi",
    lifespan: "1798–1861",
    tagline: "Edo, 1844",
    quote: "The brush must not flinch from what the night conceals.",
    palette: {
      accent: "#cbb994",
      gradientFrom: "#1b2330",
      gradientTo: "#0a0c11",
    },
  },
  "miro": {
    id: "miro",
    displayName: "Joan Miró",
    shortName: "Joan",
    placeholder: "Type your question to Joan",
    suggested: [
      "What did hunger show you?",
      "What do the ladders mean?",
    ],
    portrait: "artists/miro.webp",
    portraitAlt: "Photograph of Joan Miró",
    lifespan: "1893–1983",
    tagline: "Paris, 1925",
    quote: "I want to assassinate painting.",
    palette: {
      accent: "#cc5b3a",
      gradientFrom: "#6b4536",
      gradientTo: "#0c0805",
    },
  },
  "lichtenstein": {
    id: "lichtenstein",
    displayName: "Roy Lichtenstein",
    shortName: "Roy",
    placeholder: "Type your question to Roy",
    suggested: [
      "Why paint a comic book panel?",
      "What are the Ben-Day dots for?",
    ],
    portrait: "artists/lichtenstein.jpg",
    portraitAlt: "Photograph of Roy Lichtenstein",
    lifespan: "1923–1997",
    tagline: "New York, 1963",
    quote: "I want to hide the record of my hand.",
    palette: {
      accent: "#d8a531",
      gradientFrom: "#2f5aa0",
      gradientTo: "#0c0e16",
    },
  },
};
