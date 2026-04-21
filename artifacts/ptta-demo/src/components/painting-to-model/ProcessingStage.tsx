import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { ProgressRing } from "./ProgressRing";
import type { ModelEntry } from "@/content/models";

interface Props {
  model: ModelEntry;
  onDone: () => void;
  onBack: () => void;
}

interface Step {
  id: string;
  label: string;
  hint: string;
}

const STEPS: Step[] = [
  { id: "analyze", label: "Analyze", hint: "Reading brushstrokes and composition…" },
  { id: "depth",   label: "Depth",   hint: "Mapping depth from surface cues…" },
  { id: "mesh",    label: "Mesh",    hint: "Assembling 3D mesh…" },
  { id: "refine",  label: "Refine",  hint: "Refining tactile detail…" },
];

const STEP_MS = 2500;
const REDUCED_MOTION_MS = 2800;

export function ProcessingStage({ model, onDone, onBack }: Props) {
  const reducedMotion = useReducedMotion();
  const [stepIndex, setStepIndex] = useState(0);

  useEffect(() => {
    if (reducedMotion) {
      const timeout = setTimeout(onDone, REDUCED_MOTION_MS);
      return () => clearTimeout(timeout);
    }
    const timeout = setTimeout(() => {
      if (stepIndex < STEPS.length - 1) {
        setStepIndex((i) => i + 1);
      } else {
        onDone();
      }
    }, STEP_MS);
    return () => clearTimeout(timeout);
  }, [stepIndex, reducedMotion, onDone]);

  const currentStep = STEPS[stepIndex];

  return (
    <div className="min-h-[100dvh] bg-stone-950 text-stone-100 flex flex-col">
      <div className="mx-auto w-full max-w-md flex-1 flex flex-col">
        <header className="flex items-center gap-3 px-5 pt-6 pb-2">
          <button
            onClick={onBack}
            aria-label="Back to picker"
            className="w-11 h-11 flex items-center justify-center rounded-full text-white/80 hover:bg-white/10 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-400"
          >
            <ArrowLeft size={20} />
          </button>
          <p className="font-serif text-sm text-white/70 truncate">
            Analyzing &ldquo;{model.title}&rdquo;…
          </p>
        </header>

        <div className="flex-1 flex items-center justify-center px-6 py-4">
          <div className="relative w-full max-w-[320px] aspect-[3/4] rounded-md overflow-hidden">
            <img
              src={model.image}
              alt=""
              aria-hidden
              className="w-full h-full object-cover"
            />
            <div
              className="absolute inset-0 rounded-md pointer-events-none"
              style={{
                boxShadow:
                  "inset 0 0 0 2px rgba(245,158,11,0.35), 0 18px 50px rgba(0,0,0,0.65)",
              }}
            />
            {!reducedMotion && (
              <>
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    backgroundImage:
                      "radial-gradient(circle, rgba(245,158,11,0.65) 1px, transparent 1.6px)",
                    backgroundSize: "14px 14px",
                    animation: "ptta-dots-in 2.8s linear infinite",
                    mixBlendMode: "screen",
                  }}
                />
                <div
                  className="absolute left-0 right-0 pointer-events-none"
                  style={{
                    height: 2,
                    top: 0,
                    background:
                      "linear-gradient(90deg, transparent, #f59e0b, transparent)",
                    boxShadow:
                      "0 0 12px #f59e0b, 0 0 24px rgba(245,158,11,0.5)",
                    animation: "ptta-scan-sweep 2.8s linear infinite",
                  }}
                />
              </>
            )}
          </div>
        </div>

        <div className="px-6 pt-4 text-center" aria-live="polite">
          <p className="font-sans text-amber-400 text-[11px] font-semibold uppercase tracking-[0.14em] mb-1">
            Step {stepIndex + 1} of {STEPS.length}
          </p>
          <p className="font-serif text-white/85 text-base md:text-lg leading-snug min-h-[2.75em]">
            {reducedMotion ? "Processing…" : currentStep.hint}
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

function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handler = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);
  return reduced;
}
