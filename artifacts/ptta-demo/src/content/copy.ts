export interface CopyFact {
  label: string;
}

export interface HowItWorksStep {
  num: string;
  title: string;
  body: string;
  illoAlt: string;
}

export interface DemoCard {
  slug: string;
  title: string;
  description: string;
  illoAlt: string;
  variant?: "default" | "future";
}

export interface PageCopy {
  header: { logoText: string; backLabel: string };
  hero: { eyebrow: string; headline: string; subline: string; cta: string };
  slogan: { quote: string; caption: string };
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
    headline: "Art you can finally touch.",
    subline:
      "AI-assisted tactile 3D models that make paintings, sculptures, and museum objects accessible to blind and visually impaired visitors.",
    cta: "Tap to start demo",
  },
  slogan: {
    quote: "Museums tell visitors not to touch. We’re changing that.",
    caption: "Founded 2023 in Bremen · Social Impact Award Germany 2025",
  },
  problem: {
    heading: "The Problem",
    body:
      "For blind and visually impaired people, art in museums is essentially invisible. Paintings sit behind glass with “do not touch” signs. Audio guides describe what others can see — but they can’t replace the experience of perceiving a work directly.",
  },
  solution: {
    heading: "Our Solution",
    body:
      "We convert paintings and objects into precise tactile 3D models, paired with custom audio descriptions and braille plaques. Visitors explore the artwork with their hands, guided by audio crafted with blind collaborators.",
  },
  facts: [
    { label: "27+ installations" },
    { label: "Partner: BSVH & BSVB" },
    { label: "ESA Mars surface commission" },
    { label: "Overbeck-Museum Bremen — 20+ models" },
  ],
  factsCaption: "Verified figures as of 2026",
  footer: {
    email: "contact@ptta.art",
    disclaimer:
      "Demo prototype — actual product features include optional audio equipment, braille plaques, and mounting systems.",
  },
  howItWorks: {
    eyebrow: "How it works",
    headline: "From painting to fingertips.",
    subline:
      "Each tactile model goes through six stages of production. Here’s the workflow.",
    steps: [
      {
        num: "01",
        title: "High-resolution image acquisition",
        body:
          "We start with a high-resolution scan or photograph of the artwork, sourced directly from the museum’s archive or captured on-site. Resolution and color fidelity at this stage determine everything downstream.",
        illoAlt:
          "Museum-quality scan of a painting on an archival imaging rig",
      },
      {
        num: "02",
        title: "AI-assisted image analysis",
        body:
          "Computer vision and depth-estimation models analyze the image to identify foreground figures, background recession, textures, and compositional structure. The model proposes a depth interpretation that our team reviews.",
        illoAlt:
          "Colorized depth map overlaid on the source painting",
      },
      {
        num: "03",
        title: "3D model curation",
        body:
          "Our designers refine the AI-generated geometry into a tactile-first model. This is where artistic interpretation matters most — we adjust elevation, simplify visual noise, and design for fingers rather than eyes. Decisions like replacing horizon lines with subtle inclines come from years of testing with blind collaborators.",
        illoAlt:
          "Tactile 3D model being refined inside CAD software",
      },
      {
        num: "04",
        title: "3D printing",
        body:
          "Models are printed in durable PLA, with the longest dimension at 35 cm. Print parameters are tuned for tactile clarity — layer heights, infill, and surface finish are all chosen to feel right under the hand, not to look right on a screen.",
        illoAlt: "Industrial 3D printer mid-print on a tactile relief",
      },
      {
        num: "05",
        title: "Audio description curation",
        body:
          "Each model is paired with a custom audio description developed using guidelines we built with blind audio film author Hela Michalski. The audio doesn’t replace the tactile experience — it complements it, adding color, light, mood, and historical context.",
        illoAlt: "Over-ear headphones next to an audio waveform visualisation",
      },
      {
        num: "06",
        title: "Final production and installation",
        body:
          "The tactile model, mounting system, braille plaque, and audio guide ship to the museum together. We support installation and run a haptic quality check with blind partners on-site before the exhibit opens to the public.",
        illoAlt:
          "Finished tactile artwork installed on a plinth in a museum gallery",
      },
    ],
    continueCta: "Explore the demo",
  },
  demoHub: {
    eyebrow: "Demo",
    headline: "Pick a process to explore.",
    subline:
      "Each module gives you a closer look at one part of how we build a tactile model.",
    openLabel: "Open",
    ariaOpenModule: (title) => `Open ${title} module`,
    cards: [
      {
        slug: "3d-model",
        title: "3D Model Conversion",
        description: "See how a flat painting becomes a layered 3D form.",
        illoAlt: "Side-by-side view of a painting and its tactile 3D model",
      },
      {
        slug: "3d-printing",
        title: "3D Printing",
        description: "Watch the model take physical shape, layer by layer.",
        illoAlt: "3D printer mid-print on a tactile relief",
      },
      {
        slug: "audio-guide",
        title: "Audio Guide",
        description:
          "Hear how audio descriptions are crafted alongside the tactile experience.",
        illoAlt: "Headphones next to an audio waveform",
      },
      {
        slug: "showcase",
        title: "Full Product Showcase",
        description: "The finished installation in a museum gallery.",
        illoAlt:
          "Visitor touching a finished tactile artwork on a plinth in a gallery",
      },
      {
        slug: "future",
        title: "Future Features",
        description:
          "What’s next: scaling to more museums, more languages, more formats.",
        illoAlt: "Abstract roadmap visualisation",
        variant: "future",
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
