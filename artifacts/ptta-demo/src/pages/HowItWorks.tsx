import { useCallback, useEffect, useState, type CSSProperties, type ReactNode } from "react";
import { useLocation } from "wouter";
import { motion, useReducedMotion } from "framer-motion";
import { Header } from "@/components/Header";
import { SectionLabel, Marker } from "@/components/editorial";
import { useLanguage } from "@/context/LanguageContext";

const titleStyle = { letterSpacing: "-0.01em" } as const;
const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

const ACCENT_RGB = "214,67,36";
const ACCENT = "#D64324";

// -----------------------------------------------------------------------------
// Shared step scaffolding
// -----------------------------------------------------------------------------

function StepHeading({
  num,
  title,
  align = "left",
}: {
  num: string;
  title: string;
  align?: "left" | "center";
}) {
  return (
    <div className={align === "center" ? "text-center" : ""}>
      <div
        className={`flex items-center gap-2 mb-3 ${align === "center" ? "justify-center" : ""}`}
      >
        <Marker size={6} />
        <span className="ptta-label text-accent" style={{ fontSize: "10pt" }}>
          Step · {num}
        </span>
      </div>
      <h2
        className="font-serif text-ink text-2xl md:text-4xl leading-[1.02]"
        style={titleStyle}
      >
        — {title}
      </h2>
    </div>
  );
}

function StepBody({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <p className={`text-body-fg text-sm md:text-base leading-relaxed ${className}`}>
      {children}
    </p>
  );
}

function StepMeta({ rows }: { rows: Array<[string, string]> }) {
  return (
    <dl className="divide-y divide-hairline border-t border-b border-hairline">
      {rows.map(([k, v]) => (
        <div
          key={k}
          className="flex items-baseline justify-between gap-4 py-2.5"
        >
          <dt className="text-sm text-ink">{k}</dt>
          <dd
            className="ptta-label text-body-fg text-right"
            style={{ fontSize: "10pt" }}
          >
            {v}
          </dd>
        </div>
      ))}
    </dl>
  );
}

// Vertical connector with Courier "→ NN" label
function FlowArrow({ next }: { next: string }) {
  return (
    <div className="flex flex-col items-center gap-2 py-8 md:py-10" aria-hidden="true">
      <span
        className="ptta-label text-muted-fg"
        style={{ fontSize: "9pt" }}
      >
        → {next}
      </span>
      <span className="w-px h-10 md:h-14 bg-hairline" />
    </div>
  );
}

// -----------------------------------------------------------------------------
// Step 02: cycling filter analysis viz (re-using ProcessingStage visual vocab)
// -----------------------------------------------------------------------------

type AnalysisPhase = "analyze" | "depth" | "mesh" | "refine";

const ANALYSIS_STEPS: Array<{ id: AnalysisPhase; label: string; filter: string; caption: string }> = [
  {
    id: "analyze",
    label: "Analyze",
    filter: "contrast(1.55) saturate(0.4) brightness(1.02)",
    caption: "Reading brushstrokes and composition.",
  },
  {
    id: "depth",
    label: "Depth",
    filter: "grayscale(1) contrast(1.3) brightness(1.08)",
    caption: "Mapping depth from surface cues.",
  },
  {
    id: "mesh",
    label: "Mesh",
    filter: "invert(1) contrast(2.3) brightness(1.3) saturate(0)",
    caption: "Assembling a 3D mesh from the depth map.",
  },
  {
    id: "refine",
    label: "Refine",
    filter: "contrast(1.1) saturate(1.15)",
    caption: "Smoothing the relief for fingertips.",
  },
];

function AnalysisViz() {
  const [i, setI] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setI((n) => (n + 1) % ANALYSIS_STEPS.length), 2400);
    return () => clearInterval(id);
  }, []);
  const current = ANALYSIS_STEPS[i];
  const isPhase = (p: AnalysisPhase) => current.id === p;

  return (
    <div className="w-full flex flex-col items-center">
      <div className="relative w-full max-w-[360px] md:max-w-[420px] aspect-[3/4] rounded-2xl overflow-hidden bg-stone-950">
        <img
          src={`${BASE}/paintings/van-gogh.webp`}
          alt=""
          aria-hidden="true"
          className="w-full h-full object-cover"
          style={{
            filter: current.filter,
            transition: "filter 1s ease",
          }}
        />
        {/* Dot grid — Analyze + Depth */}
        <FadeLayer
          visible={isPhase("analyze") || isPhase("depth")}
          style={{
            backgroundImage: `radial-gradient(circle, rgba(${ACCENT_RGB},0.75) 1px, transparent 1.6px)`,
            backgroundSize: "14px 14px",
            mixBlendMode: "screen",
          }}
        />
        {/* Heatmap — Depth */}
        <FadeLayer
          visible={isPhase("depth")}
          style={{
            background:
              "radial-gradient(ellipse 58% 52% at 50% 42%, rgba(254,240,138,0.85) 0%, rgba(214,67,36,0.75) 30%, rgba(120,18,6,0.55) 65%, rgba(12,10,9,0.5) 100%)",
            mixBlendMode: "color",
          }}
        />
        {/* Wireframe — Mesh */}
        <FadeLayer
          visible={isPhase("mesh")}
          style={{
            backgroundImage: `repeating-linear-gradient(0deg, rgba(${ACCENT_RGB},0.75) 0 1px, transparent 1px 12px), repeating-linear-gradient(90deg, rgba(${ACCENT_RGB},0.75) 0 1px, transparent 1px 12px)`,
            mixBlendMode: "screen",
          }}
        />
        {/* Warm vignette — Refine */}
        <FadeLayer
          visible={isPhase("refine")}
          style={{
            background: `radial-gradient(ellipse at 50% 50%, transparent 55%, rgba(${ACCENT_RGB},0.3) 100%)`,
          }}
        />
        {/* Scan line */}
        <div
          className="absolute left-0 right-0 pointer-events-none"
          style={{
            height: 2,
            top: 0,
            background: `linear-gradient(90deg, transparent, ${ACCENT}, transparent)`,
            boxShadow: `0 0 12px ${ACCENT}, 0 0 24px rgba(${ACCENT_RGB},0.5)`,
            animation: "ptta-scan-sweep 2.8s linear infinite",
          }}
        />
      </div>

      {/* Phase indicator row */}
      <div className="mt-6 grid grid-cols-4 gap-2 w-full max-w-[420px]">
        {ANALYSIS_STEPS.map((s, idx) => {
          const state = idx < i ? "done" : idx === i ? "active" : "idle";
          return (
            <div key={s.id} className="flex flex-col items-center gap-1.5">
              <span
                className={`h-px w-full transition-colors ${
                  state === "idle"
                    ? "bg-hairline"
                    : state === "active"
                    ? "bg-accent"
                    : "bg-accent/60"
                }`}
              />
              <span
                className={`ptta-label transition-colors ${
                  state === "active" ? "text-accent" : "text-muted-fg"
                }`}
                style={{ fontSize: "9pt" }}
              >
                {s.label}
              </span>
            </div>
          );
        })}
      </div>

      <p
        className="mt-5 font-serif italic text-ink text-base md:text-lg text-center max-w-sm"
        style={{ letterSpacing: "-0.005em" }}
      >
        {current.caption}
      </p>
    </div>
  );
}

function FadeLayer({ visible, style }: { visible: boolean; style: CSSProperties }) {
  return (
    <div
      aria-hidden="true"
      className="absolute inset-0 pointer-events-none"
      style={{
        ...style,
        opacity: visible ? 1 : 0,
        transition: "opacity 0.85s ease",
      }}
    />
  );
}

// -----------------------------------------------------------------------------
// Step 05: CSS-only animated audio waveform
// -----------------------------------------------------------------------------

function AudioWaveform() {
  // 28 bars with varying heights — pre-computed so they look organic
  const heights = [
    28, 42, 55, 38, 66, 74, 52, 88, 68, 48, 62, 82, 94, 72,
    58, 84, 66, 46, 70, 88, 62, 44, 54, 78, 66, 50, 72, 40,
  ];
  return (
    <div className="w-full max-w-[440px] md:max-w-md">
      <div className="relative w-full aspect-[3/2] rounded-2xl bg-stone-950 overflow-hidden flex items-center justify-center px-6">
        <div className="flex items-center gap-[3px] w-full h-[55%]">
          {heights.map((h, idx) => (
            <span
              key={idx}
              className="flex-1 bg-accent rounded-full"
              style={{
                height: `${h}%`,
                animation: `ptta-wave-pulse 1.4s ease-in-out ${
                  (idx * 0.05).toFixed(2)
                }s infinite alternate`,
                transformOrigin: "center",
              }}
            />
          ))}
        </div>
        {/* Tiny label bottom-right */}
        <span
          aria-hidden="true"
          className="ptta-label absolute bottom-3 right-4 text-cream/70"
          style={{ fontSize: "9pt" }}
        >
          Audio · DE / EN
        </span>
      </div>
    </div>
  );
}

// -----------------------------------------------------------------------------
// Intro & main
// -----------------------------------------------------------------------------

function ScrollIn({
  children,
  delay = 0,
  reduceMotion,
}: {
  children: ReactNode;
  delay?: number;
  reduceMotion: boolean;
}) {
  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, y: 20 }}
      whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.5, delay }}
    >
      {children}
    </motion.div>
  );
}

export default function HowItWorks() {
  const { t } = useLanguage();
  const [, navigate] = useLocation();
  const reduceMotion = useReducedMotion() ?? false;

  const handleContinue = useCallback(() => {
    navigate("/demo-hub");
  }, [navigate]);

  const intro = t.howItWorks;
  const [step1, step2, step3, step4, step5, step6] = intro.steps;

  return (
    <div className="ptta-root min-h-screen bg-page text-ink">
      <Header showBack backHref="/" />

      {/* INTRO */}
      <section
        className="w-full px-5 md:px-8 pt-8 md:pt-12 pb-6 md:pb-10 border-b border-hairline"
        aria-label="Page introduction"
      >
        <div className="mx-auto max-w-[440px] md:max-w-3xl">
          <SectionLabel label={intro.eyebrow} tag="Dossier · 02" />
          <div className="text-center">
            <motion.h1
              initial={reduceMotion ? false : { opacity: 0, y: 16 }}
              animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.05 }}
              className="font-serif text-ink text-3xl md:text-5xl leading-[1.02] mb-3"
              style={titleStyle}
            >
              — {intro.headline}
            </motion.h1>
            <motion.p
              initial={reduceMotion ? false : { opacity: 0, y: 12 }}
              animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-body-fg text-sm md:text-base leading-relaxed max-w-xl mx-auto"
            >
              {intro.subline}
            </motion.p>
          </div>
        </div>
      </section>

      {/* MAIN workflow */}
      <main
        className="w-full px-5 md:px-8 py-10 md:py-16"
        aria-label="Production workflow"
      >
        <div className="mx-auto max-w-[440px] md:max-w-5xl">
          {/* ================= STEP 01 — Acquisition ================= */}
          <ScrollIn reduceMotion={reduceMotion}>
            <section
              aria-labelledby="step-01"
              className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10 items-center"
            >
              <div className="order-1 md:order-1">
                <div className="relative w-full aspect-[3/4] overflow-hidden rounded-2xl bg-stone-200 shadow-sm">
                  <img
                    src={`${BASE}/paintings/mona-lisa.webp`}
                    alt={step1.illoAlt}
                    loading="lazy"
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                  <div className="absolute bottom-3 left-3 bg-stone-950/80 text-cream px-3 py-1.5 backdrop-blur">
                    <span className="ptta-label" style={{ fontSize: "9pt" }}>
                      Mona Lisa · Leonardo · 1503
                    </span>
                  </div>
                </div>
              </div>
              <div className="order-2 md:order-2 flex flex-col gap-5">
                <div id="step-01">
                  <StepHeading num={step1.num} title={step1.title} />
                </div>
                <StepBody>{step1.body}</StepBody>
                <StepMeta
                  rows={[
                    ["Source", "Museum archive"],
                    ["Resolution", "4200 × 6200 px"],
                    ["Format", "TIFF 16-bit"],
                  ]}
                />
              </div>
            </section>
          </ScrollIn>

          <FlowArrow next="02" />

          {/* ================= STEP 02 — Analysis ================= */}
          <ScrollIn reduceMotion={reduceMotion}>
            <section aria-labelledby="step-02" className="flex flex-col gap-8 md:gap-10">
              <div id="step-02" className="text-center max-w-2xl mx-auto">
                <StepHeading num={step2.num} title={step2.title} align="center" />
                <div className="mt-4">
                  <StepBody className="text-center">{step2.body}</StepBody>
                </div>
              </div>
              <div className="flex justify-center">
                <AnalysisViz />
              </div>
            </section>
          </ScrollIn>

          <FlowArrow next="03" />

          {/* ================= STEP 03 — Curation (text left, image right on desktop) ================= */}
          <ScrollIn reduceMotion={reduceMotion}>
            <section
              aria-labelledby="step-03"
              className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10 items-center"
            >
              <div className="order-2 md:order-1 flex flex-col gap-5">
                <div id="step-03">
                  <StepHeading num={step3.num} title={step3.title} />
                </div>
                <StepBody>{step3.body}</StepBody>
                <StepMeta
                  rows={[
                    ["Lead", "Human designer"],
                    ["Tooling", "Blender + CAD"],
                    ["Iterations", "3 – 5"],
                  ]}
                />
              </div>
              <div className="order-1 md:order-2">
                <div className="relative w-full aspect-[4/5] overflow-hidden rounded-2xl bg-stone-200 shadow-sm">
                  <img
                    src={`${BASE}/images/hands-exploring-model.jpeg`}
                    alt={step3.illoAlt}
                    loading="lazy"
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                  <div className="absolute top-3 right-3 bg-stone-950/80 text-cream px-3 py-1.5 backdrop-blur">
                    <span className="ptta-label" style={{ fontSize: "9pt" }}>
                      Field review
                    </span>
                  </div>
                </div>
              </div>
            </section>
          </ScrollIn>

          <FlowArrow next="04" />

          {/* ================= STEP 04 — Printing (placeholder with giant numeral) ================= */}
          <ScrollIn reduceMotion={reduceMotion}>
            <section
              aria-labelledby="step-04"
              className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10 items-center"
            >
              <div className="order-1">
                {/* Placeholder — animated print-layer bars rising from the bottom */}
                <div className="relative w-full aspect-[4/3] overflow-hidden rounded-2xl bg-stone-950 text-cream flex items-center justify-center">
                  <span
                    aria-hidden="true"
                    className="font-serif italic leading-none"
                    style={{
                      fontSize: "clamp(6rem, 16vw, 12rem)",
                      letterSpacing: "-0.02em",
                    }}
                  >
                    04
                  </span>
                  {/* Progressive print layer bars at the bottom */}
                  <div
                    className="absolute inset-x-0 bottom-0 h-1/3 pointer-events-none"
                    aria-hidden="true"
                    style={{
                      background: `repeating-linear-gradient(0deg, rgba(${ACCENT_RGB},0.4) 0 1px, transparent 1px 6px)`,
                      maskImage:
                        "linear-gradient(to top, rgba(0,0,0,1), rgba(0,0,0,0))",
                      WebkitMaskImage:
                        "linear-gradient(to top, rgba(0,0,0,1), rgba(0,0,0,0))",
                    }}
                  />
                  <span
                    aria-hidden="true"
                    className="ptta-label absolute top-3 left-3 text-cream/60"
                    style={{ fontSize: "9pt" }}
                  >
                    Footage · pending
                  </span>
                </div>
              </div>
              <div className="order-2 flex flex-col gap-5">
                <div id="step-04">
                  <StepHeading num={step4.num} title={step4.title} />
                </div>
                <StepBody>{step4.body}</StepBody>
                <StepMeta
                  rows={[
                    ["Material", "Durable PLA"],
                    ["Max dimension", "35 cm"],
                    ["Layer passes", "1,200 – 1,800"],
                  ]}
                />
              </div>
            </section>
          </ScrollIn>

          <FlowArrow next="05" />

          {/* ================= STEP 05 — Audio (waveform) ================= */}
          <ScrollIn reduceMotion={reduceMotion}>
            <section
              aria-labelledby="step-05"
              className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10 items-center"
            >
              <div className="order-2 md:order-1 flex flex-col gap-5">
                <div id="step-05">
                  <StepHeading num={step5.num} title={step5.title} />
                </div>
                <StepBody>{step5.body}</StepBody>
                <StepMeta
                  rows={[
                    ["Partner", "Hela Michalski"],
                    ["Duration", "3 – 5 min"],
                    ["Languages", "DE · EN"],
                  ]}
                />
              </div>
              <div className="order-1 md:order-2 flex justify-center md:justify-end">
                <AudioWaveform />
              </div>
            </section>
          </ScrollIn>

          <FlowArrow next="06" />

          {/* ================= STEP 06 — Installation (text-forward editorial) ================= */}
          <ScrollIn reduceMotion={reduceMotion}>
            <section
              aria-labelledby="step-06"
              className="text-center border-t border-b border-hairline py-14 md:py-20"
            >
              <div id="step-06" className="max-w-3xl mx-auto">
                <div className="flex items-center justify-center gap-2 mb-4">
                  <Marker size={6} />
                  <span className="ptta-label text-accent" style={{ fontSize: "10pt" }}>
                    Step · {step6.num}
                  </span>
                </div>
                <h2
                  className="font-serif italic text-ink text-4xl md:text-6xl lg:text-7xl leading-[0.98] mb-5"
                  style={titleStyle}
                >
                  — Ready to touch.
                </h2>
                <p className="text-body-fg text-sm md:text-base leading-relaxed max-w-xl mx-auto mb-8">
                  {step6.body}
                </p>
                <div className="flex items-center justify-center gap-6 ptta-label text-muted-fg flex-wrap" style={{ fontSize: "10pt" }}>
                  <span>Model</span>
                  <span aria-hidden="true" className="w-4 h-px bg-hairline" />
                  <span>Plinth</span>
                  <span aria-hidden="true" className="w-4 h-px bg-hairline" />
                  <span>Braille</span>
                  <span aria-hidden="true" className="w-4 h-px bg-hairline" />
                  <span>Audio guide</span>
                </div>
              </div>
            </section>
          </ScrollIn>

          {/* Continue CTA */}
          <div className="pt-10 md:pt-14 flex justify-center">
            <motion.button
              whileHover={reduceMotion ? undefined : { scale: 1.02 }}
              whileTap={reduceMotion ? undefined : { scale: 0.98 }}
              type="button"
              onClick={handleContinue}
              aria-label={intro.continueCta}
              className="w-full md:w-auto md:px-12 px-6 py-4 rounded-full bg-ink text-page text-base focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
              style={{ minHeight: 56, letterSpacing: "-0.02em" }}
            >
              {intro.continueCta} →
            </motion.button>
          </div>
        </div>
      </main>
    </div>
  );
}
