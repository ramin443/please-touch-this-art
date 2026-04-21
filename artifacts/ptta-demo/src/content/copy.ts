export interface CopyFact {
  /** Tiny Courier label shown above the value. */
  label: string;
  /** Big value shown in the metric card. */
  value: string;
}

export interface HowItWorksStep {
  num: string;
  title: string;
  body: string;
  illoAlt: string;
  /** Path relative to BASE_URL, e.g. "images/hands-exploring-model.jpeg". Optional — if omitted, a styled abstract block is rendered. */
  imageSrc?: string;
  /** Tint for abstract blocks when no imageSrc. */
  imageVariant?: "dark" | "accent" | "mid";
}

export interface DemoCard {
  slug: string;
  title: string;
  description: string;
  illoAlt: string;
  variant?: "default" | "future";
  imageSrc?: string;
  /** Override destination. If omitted, DemoHub navigates to /demo/:slug (the placeholder). */
  route?: string;
  /** Slug of the next module in the sequential tour. Terminal if omitted. */
  nextModule?: string;
  /** Force the card to span both grid columns. Automatic for variant:"future". */
  wide?: boolean;
}

export interface PageCopy {
  header: { logoText: string; backLabel: string };
  hero: {
    eyebrow: string;
    headline: {
      leading: string;
      emphasis: string;
      emphasisCycle?: string[];
      trailing?: string;
    };
    subline: { leading: string; emphasis: string; trailing: string };
    cta: string;
  };
  slogan: {
    quote: { leading: string; emphasis: string; trailing: string };
    caption: string;
  };
  problem: { heading: string; body: string };
  solution: { heading: string; body: string };
  facts: CopyFact[];
  factsCaption: string;
  footer: { email: string; disclaimer: string };
  howItWorks: {
    eyebrow: string;
    headline: string;
    subline: string;
    steps: HowItWorksStep[];
    continueCta: string;
  };
  demoHub: {
    eyebrow: string;
    headline: string;
    subline: string;
    openLabel: string;
    ariaOpenModule: (title: string) => string;
    cards: DemoCard[];
    footer: { note: string; returnLink: string };
  };
  placeholder: {
    comingSoon: string;
    backToHub: string;
    notFoundTitle: string;
  };
}

const en: PageCopy = {
  header: {
    logoText: "Please Touch This Art",
    backLabel: "Back",
  },
  hero: {
    eyebrow: "Inclusive museum experiences",
    headline: {
      leading: "Art, you can ",
      emphasis: "touch",
      emphasisCycle: ["touch", "feel", "connect with", "experience"],
    },
    subline: {
      leading:
        "AI-assisted tactile 3D models of museum artworks accessible to ",
      emphasis: "blind and visually impaired",
      trailing: " visitors.",
    },
    cta: "Tap to start demo",
  },
  slogan: {
    quote: {
      leading: "Museums tell visitors not to touch. ",
      emphasis: "We’re changing that",
      trailing: ".",
    },
    caption: "Barrier-free · Inclusive · Accessible to all",
  },
  problem: {
    heading: "The Problem",
    body: "",
  },
  solution: {
    heading: "Our Solution",
    body: "Tactile 3D models paired with custom audio. Art explored by hand.",
  },
  facts: [
    { label: "Installations", value: "27+" },
    { label: "Partners", value: "BSVH · BSVB" },
    { label: "ESA commission", value: "Mars surface" },
    { label: "Overbeck Bremen", value: "20+ models" },
  ],
  factsCaption: "Verified figures · 2026",
  footer: {
    email: "contact@ptta.art",
    disclaimer:
      "Demo prototype — actual product features include optional audio equipment, braille plaques, and mounting systems.",
  },
  howItWorks: {
    eyebrow: "How it works",
    headline: "From painting to fingertips.",
    subline: "",
    steps: [
      {
        num: "01",
        title: "High-resolution image acquisition",
        body: "",
        illoAlt:
          "Museum-quality scan of a painting on an archival imaging rig",
        imageVariant: "dark",
      },
      {
        num: "02",
        title: "AI-assisted image analysis",
        body: "",
        illoAlt:
          "Colorized depth map overlaid on the source painting",
        imageVariant: "accent",
      },
      {
        num: "03",
        title: "3D model curation",
        body:
          "Our designers refine the AI-generated geometry into a tactile-first model. This is where artistic interpretation matters most — we adjust elevation, simplify visual noise, and design for fingers rather than eyes. Decisions like replacing horizon lines with subtle inclines come from years of testing with blind collaborators.",
        illoAlt:
          "Hands exploring a finished tactile relief model",
        imageSrc: "images/hands-exploring-model.jpeg",
      },
      {
        num: "04",
        title: "3D printing",
        body: "Printed in durable PLA, tuned for tactile clarity under the hand.",
        illoAlt: "Photograph of a 3D-printed tactile model of St. Nikolai Church",
        imageSrc: "printed/st-nikolai-photo.jpg",
      },
      {
        num: "05",
        title: "Audio description curation",
        body:
          "Each model ships with a custom audio description that complements the tactile experience.",
        illoAlt: "Over-ear headphones next to an audio waveform visualisation",
        imageVariant: "mid",
      },
      {
        num: "06",
        title: "Final production and installation",
        body:
          "The tactile model, plinth, braille plaque, and audio guide ship to the museum together.",
        illoAlt:
          "Finished tactile artwork installed on a plinth with the PTTA braille plaque",
        imageSrc: "images/model-with-plaque.jpeg",
      },
    ],
    continueCta: "Explore the demo",
  },
  demoHub: {
    eyebrow: "Demo",
    headline: "Pick a process to explore.",
    subline: "",
    openLabel: "Open",
    ariaOpenModule: (title) => `Open ${title} module`,
    cards: [
      {
        slug: "3d-model",
        title: "3D Model Conversion",
        description: "See how a flat painting becomes a layered 3D form.",
        illoAlt: "Van Gogh Self-Portrait painting, the source for a tactile conversion",
        imageSrc: "paintings/van-gogh.webp",
        route: "/painting-to-model",
        nextModule: "3d-printing",
      },
      {
        slug: "3d-printing",
        title: "3D Printing",
        description: "Watch the model take physical shape, layer by layer.",
        illoAlt: "3D-printed tactile relief of Dalí's The Persistence of Memory",
        imageSrc: "printed/persistence-of-memory.png",
        route: "/fabrication",
        nextModule: "audio-guide",
      },
      {
        slug: "audio-guide",
        title: "Audio Guide",
        description:
          "Hear how audio descriptions are crafted alongside the tactile experience.",
        illoAlt: "Audio guide device and headphones for museum visitors",
        imageSrc: "images/audio-guide.jpg",
        route: "/audio-guide",
        nextModule: "artist-persona",
      },
      {
        slug: "artist-persona",
        title: "AI Artist Persona",
        description:
          "Talk with Leonardo, Vincent, Salvador or Edvard — in their own voice, about their own work.",
        illoAlt: "Engraved portrait of Leonardo da Vinci",
        imageSrc: "artists/leonardo.webp",
        route: "/artist-persona",
        nextModule: "future",
      },
      {
        slug: "showcase",
        title: "Full Product Showcase",
        description: "The finished installation in a museum gallery.",
        illoAlt:
          "Tactile model on a pedestal with the PTTA braille plaque",
        imageSrc: "images/model-with-plaque.jpeg",
        wide: true,
      },
      {
        slug: "future",
        title: "Future Features",
        description:
          "What’s next: scaling to more museums, more languages, more formats.",
        illoAlt: "Abstract roadmap visualisation",
        variant: "future",
        route: "/future-features",
      },
    ],
    footer: {
      note: "More modules coming as the demo expands.",
      returnLink: "Return to start",
    },
  },
  placeholder: {
    comingSoon: "Coming soon",
    backToHub: "Back to demo hub",
    notFoundTitle: "Module not found",
  },
};

export const copy: Record<string, PageCopy> = {
  en,
  // de: { ... } — add German translations here to enable DE mode
};
