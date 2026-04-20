export interface CopyFact {
  label: string;
}

export interface PageCopy {
  header: { logoText: string };
  hero: { eyebrow: string; headline: string; subline: string; cta: string };
  slogan: { quote: string; caption: string };
  problem: { heading: string; body: string };
  solution: { heading: string; body: string };
  facts: CopyFact[];
  factsCaption: string;
  footer: { email: string; disclaimer: string };
}

const en: PageCopy = {
  header: {
    logoText: "Please Touch This Art",
  },
  hero: {
    eyebrow: "Inclusive museum experiences",
    headline: "Art you can finally touch.",
    subline:
      "AI-assisted tactile 3D models that make paintings, sculptures, and museum objects accessible to blind and visually impaired visitors.",
    cta: "Tap to start demo",
  },
  slogan: {
    quote: "Museums tell visitors not to touch. We\u2019re changing that.",
    caption: "Founded 2023 in Bremen \u00b7 Social Impact Award Germany 2025",
  },
  problem: {
    heading: "The Problem",
    body:
      "For blind and visually impaired people, art in museums is essentially invisible. Paintings sit behind glass with \u201cdo not touch\u201d signs. Audio guides describe what others can see \u2014 but they can\u2019t replace the experience of perceiving a work directly.",
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
    { label: "Overbeck-Museum Bremen \u2014 20+ models" },
  ],
  factsCaption: "Verified figures as of 2026",
  footer: {
    email: "contact@ptta.art",
    disclaimer:
      "Demo prototype \u2014 actual product features include optional audio equipment, braille plaques, and mounting systems.",
  },
};

export const copy: Record<string, PageCopy> = {
  en,
  // de: { ... } — add German translations here to enable DE mode
};
