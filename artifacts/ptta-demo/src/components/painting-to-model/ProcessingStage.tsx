import { useEffect, useState, type CSSProperties } from "react";
import { ArrowLeft } from "lucide-react";
import { ProgressRing } from "./ProgressRing";
import type { ModelEntry } from "@/content/models";

/*
 * NOTE: we intentionally do NOT respect prefers-reduced-motion here.
 * The processing stage is the core visual of this demo — the
 * step-by-step filter/overlay animations _are_ the content. Skipping
 * them leaves the viewer with a blank "Processing…" screen that
 * teleports into the 3D viewer with no sense of what the pipeline is
 * doing. For a demo context we keep the animations running regardless
 * of OS preference.
 */

interface Props {
  model: ModelEntry;
  onDone: () => void;
  onBack: () => void;
}

type StepId = "analyze" | "depth" | "mesh" | "refine";

interface Step {
  id: StepId;
  label: string;
  hint: string;
  filter: string;
}

const STEPS: Step[] = [
  {
    id: "analyze",
    label: "Analyze",
    hint: "Reading brushstrokes and composition…",
    filter: "contrast(1.55) saturate(0.4) brightness(1.02)",
  },
  {
    id: "depth",
    label: "Depth",
    hint: "Mapping depth from surface cues…",
    filter: "grayscale(1) contrast(1.3) brightness(1.08)",
  },
  {
    id: "mesh",
    label: "Mesh",
    hint: "Assembling 3D mesh…",
    filter: "invert(1) contrast(2.3) brightness(1.3) saturate(0)",
  },
  {
    id: "refine",
    label: "Refine",
    hint: "Refining tactile detail…",
    filter: "contrast(1.1) saturate(1.15)",
  },
];

const STEP_MS = 2500;

// Accent red used throughout the rest of the app.
const ACCENT = "#D64324";
const ACCENT_RGB = "214,67,36";

export function ProcessingStage({ model, onDone, onBack }: Props) {
  const [stepIndex, setStepIndex] = useState(0);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (stepIndex < STEPS.length - 1) {
        setStepIndex((i) => i + 1);
      } else {
        onDone();
      }
    }, STEP_MS);
    return () => clearTimeout(timeout);
  }, [stepIndex, onDone]);

  const currentStep = STEPS[stepIndex];
  const isStep = (id: StepId) => currentStep.id === id;

  return (
    <div className="min-h-[100dvh] bg-stone-950 text-stone-100 flex flex-col">
      <div className="mx-auto w-full max-w-[440px] flex-1 flex flex-col">
        <header className="flex items-center gap-3 px-5 pt-6 pb-3">
          <button
            onClick={onBack}
            aria-label="Back to picker"
            className="w-11 h-11 flex items-center justify-center rounded-full text-white/80 hover:bg-white/10 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            <ArrowLeft size={20} />
          </button>
          <p
            className="ptta-label text-white/60 truncate"
            style={{ fontSize: "10pt" }}
          >
            Analyzing — {model.title}
          </p>
        </header>

        <div className="flex-1 flex items-center justify-center px-6 py-4">
          <div className="relative w-full max-w-[320px] aspect-[3/4] rounded-md overflow-hidden">
            {/* Painting — CSS filter changes per step */}
            <img
              src={model.image}
              alt=""
              aria-hidden
              className="w-full h-full object-cover"
              style={{
                filter: currentStep.filter,
                transition: "filter 1.1s ease",
              }}
            />

            {/* Accent frame */}
            <div
              className="absolute inset-0 rounded-md pointer-events-none"
              style={{
                boxShadow: `inset 0 0 0 2px rgba(${ACCENT_RGB},0.4), 0 18px 50px rgba(0,0,0,0.65)`,
              }}
            />

            {/* Depth-sample dot grid — visible during Analyze + Depth */}
            <FadeLayer
              visible={isStep("analyze") || isStep("depth")}
              style={{
                backgroundImage: `radial-gradient(circle, rgba(${ACCENT_RGB},0.75) 1px, transparent 1.6px)`,
                backgroundSize: "14px 14px",
                mixBlendMode: "screen",
              }}
            />

            {/* Depth heatmap — visible during Depth */}
            <FadeLayer
              visible={isStep("depth")}
              style={{
                background:
                  "radial-gradient(ellipse 58% 52% at 50% 42%, rgba(254,240,138,0.85) 0%, rgba(214,67,36,0.75) 30%, rgba(120,18,6,0.55) 65%, rgba(12,10,9,0.5) 100%)",
                mixBlendMode: "color",
              }}
            />

            {/* Wireframe grid — visible during Mesh */}
            <FadeLayer
              visible={isStep("mesh")}
              style={{
                backgroundImage: `repeating-linear-gradient(0deg, rgba(${ACCENT_RGB},0.75) 0 1px, transparent 1px 12px), repeating-linear-gradient(90deg, rgba(${ACCENT_RGB},0.75) 0 1px, transparent 1px 12px)`,
                mixBlendMode: "screen",
              }}
            />

            {/* Accent polish vignette — visible during Refine */}
            <FadeLayer
              visible={isStep("refine")}
              style={{
                background: `radial-gradient(ellipse at 50% 50%, transparent 55%, rgba(${ACCENT_RGB},0.3) 100%)`,
              }}
            />

            {/* Scan line — always on while processing */}
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
        </div>

        <div className="px-6 pt-4 text-center" aria-live="polite">
          <p
            className="ptta-label text-accent mb-2"
            style={{ fontSize: "10pt" }}
          >
            Step {stepIndex + 1} / {STEPS.length}
          </p>
          <p
            className="font-serif italic text-white/85 text-base md:text-lg leading-snug min-h-[2.75em]"
            style={{ letterSpacing: "-0.005em" }}
          >
            {currentStep.hint}
          </p>
        </div>

        <div className="px-6 pt-5 pb-9">
          <div className="grid grid-cols-4 gap-3">
            {STEPS.map((s, i) => (
              <ProgressRing
                key={s.id}
                state={
                  i < stepIndex ? "done" : i === stepIndex ? "active" : "idle"
                }
                label={s.label}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function FadeLayer({
  visible,
  style,
}: {
  visible: boolean;
  style: CSSProperties;
}) {
  return (
    <div
      className="absolute inset-0 pointer-events-none"
      style={{
        ...style,
        opacity: visible ? 1 : 0,
        transition: "opacity 0.85s ease",
      }}
      aria-hidden
    />
  );
}

