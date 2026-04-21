import { useEffect, useState, type CSSProperties } from "react";
import { ArrowLeft } from "lucide-react";
import { ProgressRing } from "@/components/painting-to-model/ProgressRing";
import type { ModelEntry } from "@/content/models";

/*
 * Audio-guide processing stage — adapted from ProcessingStage (painting-to-3D-model).
 * Phases: Analyze → Context → Narrate → Voice.
 * Same visual vocabulary (accent scan line, fading overlays, filtered painting)
 * but captions and overlays framed around audio generation instead of mesh build.
 *
 * Animations always play regardless of prefers-reduced-motion — this stage
 * is the narrative bridge between picker and player and would otherwise feel
 * like a teleport.
 */

interface Props {
  model: ModelEntry;
  onDone: () => void;
  onBack: () => void;
}

type StepId = "analyze" | "context" | "narrate" | "voice";

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
    hint: "Reading brushstrokes and composition.",
    filter: "contrast(1.55) saturate(0.4) brightness(1.02)",
  },
  {
    id: "context",
    label: "Context",
    hint: "Gathering historical context.",
    filter: "grayscale(0.6) contrast(1.2) brightness(1.06)",
  },
  {
    id: "narrate",
    label: "Narrate",
    hint: "Composing the narrative arc.",
    filter: "contrast(1.1) saturate(0.85) brightness(1.02)",
  },
  {
    id: "voice",
    label: "Voice",
    hint: "Synthesising the voice.",
    filter: "contrast(1.08) saturate(1.15) brightness(1.02)",
  },
];

const STEP_MS = 2500;
const ACCENT = "#D64324";
const ACCENT_RGB = "214,67,36";

export function AudioProcessingStage({ model, onDone, onBack }: Props) {
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
            Composing audio — {model.title}
          </p>
        </header>

        <div className="flex-1 flex items-center justify-center px-6 py-4">
          <div className="relative w-full max-w-[300px] aspect-[3/4] rounded-md overflow-hidden">
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

            {/* ANALYZE — accent dot grid (sampling visual features) */}
            <FadeLayer
              visible={isStep("analyze")}
              style={{
                backgroundImage: `radial-gradient(circle, rgba(${ACCENT_RGB},0.8) 1px, transparent 1.6px)`,
                backgroundSize: "14px 14px",
                mixBlendMode: "screen",
              }}
            />

            {/* CONTEXT — horizontal text-scan lines (reading metadata) */}
            <FadeLayer
              visible={isStep("context")}
              style={{
                backgroundImage: `repeating-linear-gradient(0deg, rgba(${ACCENT_RGB},0.55) 0 1px, transparent 1px 5px)`,
                mixBlendMode: "screen",
              }}
            />

            {/* NARRATE — radiating concentric pulse (story forming) */}
            <FadeLayer
              visible={isStep("narrate")}
              style={{
                background: `radial-gradient(circle at 50% 50%, transparent 0%, transparent 22%, rgba(${ACCENT_RGB},0.3) 35%, transparent 48%, rgba(${ACCENT_RGB},0.25) 60%, transparent 72%, rgba(${ACCENT_RGB},0.2) 86%, transparent 100%)`,
                mixBlendMode: "screen",
                animation: "ptta-audio-ripple 2.4s ease-in-out infinite",
              }}
            />

            {/* VOICE — waveform bars glowing from the bottom */}
            <VoiceWaveformOverlay visible={isStep("voice")} />

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

/**
 * VOICE phase — a small waveform of bars glowing along the bottom edge,
 * each bar animated with a staggered delay to simulate live speech output.
 */
function VoiceWaveformOverlay({ visible }: { visible: boolean }) {
  const bars = [22, 42, 60, 38, 70, 48, 84, 55, 72, 40, 62, 80, 46, 68, 34, 58];
  return (
    <div
      aria-hidden="true"
      className="absolute inset-x-0 bottom-0 px-5 pb-5 flex items-end justify-center gap-[3px] h-1/3 pointer-events-none"
      style={{
        opacity: visible ? 1 : 0,
        transition: "opacity 0.85s ease",
      }}
    >
      {bars.map((h, i) => (
        <span
          key={i}
          className="flex-1 bg-accent rounded-full"
          style={{
            height: visible ? `${h}%` : "8%",
            maxWidth: 6,
            animation: visible
              ? `ptta-wave-pulse 1.2s ease-in-out ${(
                  i * 0.06
                ).toFixed(2)}s infinite alternate`
              : undefined,
          }}
        />
      ))}
    </div>
  );
}
