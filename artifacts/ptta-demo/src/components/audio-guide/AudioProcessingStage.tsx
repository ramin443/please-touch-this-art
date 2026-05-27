import { useEffect, useState, type CSSProperties } from "react";
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
  /** Divide all internal timings by this. Default 1 (unchanged). */
  speedMultiplier?: number;
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

const STEP_MS_BASE = 2500;
const FILTER_TRANSITION_BASE = 1.1; // seconds
const FADE_TRANSITION_BASE = 0.85; // seconds
const SCAN_SWEEP_BASE = 2.8; // seconds
const ACCENT = "hsl(20, 95%, 57%)";
const ACCENT_RGB = "250,111,41";

export function AudioProcessingStage({
  model,
  onDone,
  speedMultiplier = 1,
}: Props) {
  const STEP_MS = STEP_MS_BASE / speedMultiplier;
  const filterDur = FILTER_TRANSITION_BASE / speedMultiplier;
  const fadeDur = FADE_TRANSITION_BASE / speedMultiplier;
  const scanDur = SCAN_SWEEP_BASE / speedMultiplier;
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
  }, [stepIndex, onDone, STEP_MS]);

  const currentStep = STEPS[stepIndex];
  const isStep = (id: StepId) => currentStep.id === id;

  return (
    <div className="h-full min-h-[480px] bg-stone-950 text-stone-100 flex flex-col overflow-hidden">
      <div className="mx-auto w-full max-w-[440px] flex-1 min-h-0 flex flex-col pt-2 sm:pt-4">
        <div className="flex-1 min-h-0 flex items-center justify-center px-4 sm:px-6 py-2 sm:py-4">
          <div className="relative rounded-md overflow-hidden max-w-full max-h-full">
            {/* Painting — full image, never cropped (object-contain). */}
            <img
              src={model.image}
              alt=""
              aria-hidden
              className="block max-w-full max-h-full w-auto h-auto object-contain"
              style={{
                filter: currentStep.filter,
                transition: `filter ${filterDur}s ease`,
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
              durationSeconds={fadeDur}
              style={{
                backgroundImage: `radial-gradient(circle, rgba(${ACCENT_RGB},0.8) 1px, transparent 1.6px)`,
                backgroundSize: "14px 14px",
                mixBlendMode: "screen",
              }}
            />

            {/* CONTEXT — horizontal text-scan lines (reading metadata) */}
            <FadeLayer
              visible={isStep("context")}
              durationSeconds={fadeDur}
              style={{
                backgroundImage: `repeating-linear-gradient(0deg, rgba(${ACCENT_RGB},0.55) 0 1px, transparent 1px 5px)`,
                mixBlendMode: "screen",
              }}
            />

            {/* NARRATE — radiating concentric pulse (story forming) */}
            <FadeLayer
              visible={isStep("narrate")}
              durationSeconds={fadeDur}
              style={{
                background: `radial-gradient(circle at 50% 50%, transparent 0%, transparent 22%, rgba(${ACCENT_RGB},0.3) 35%, transparent 48%, rgba(${ACCENT_RGB},0.25) 60%, transparent 72%, rgba(${ACCENT_RGB},0.2) 86%, transparent 100%)`,
                mixBlendMode: "screen",
                animation: `ptta-audio-ripple ${(2.4 / speedMultiplier).toFixed(3)}s ease-in-out infinite`,
              }}
            />

            {/* VOICE — waveform bars glowing from the bottom */}
            <VoiceWaveformOverlay
              visible={isStep("voice")}
              durationSeconds={fadeDur}
              speedMultiplier={speedMultiplier}
            />

            {/* Scan line — always on while processing */}
            <div
              className="absolute left-0 right-0 pointer-events-none"
              style={{
                height: 2,
                top: 0,
                background: `linear-gradient(90deg, transparent, ${ACCENT}, transparent)`,
                boxShadow: `0 0 12px ${ACCENT}, 0 0 24px rgba(${ACCENT_RGB},0.5)`,
                animation: `ptta-scan-sweep ${scanDur}s linear infinite`,
              }}
            />
          </div>
        </div>

        <div className="shrink-0 px-4 sm:px-6 pt-2 sm:pt-4 text-center" aria-live="polite">
          <p
            className="ptta-label text-accent mb-1 sm:mb-2"
            style={{ fontSize: "10pt" }}
          >
            Step {stepIndex + 1} / {STEPS.length}
          </p>
          <p
            className="font-serif italic text-white/85 text-sm sm:text-base md:text-lg leading-snug min-h-[2.5em] sm:min-h-[2.75em]"
            style={{ letterSpacing: "-0.005em" }}
          >
            {currentStep.hint}
          </p>
        </div>

        <div className="shrink-0 px-4 sm:px-6 pt-3 sm:pt-5 pb-4 sm:pb-9">
          <div className="grid grid-cols-4 gap-2 sm:gap-3">
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
  durationSeconds = FADE_TRANSITION_BASE,
}: {
  visible: boolean;
  style: CSSProperties;
  durationSeconds?: number;
}) {
  return (
    <div
      aria-hidden="true"
      className="absolute inset-0 pointer-events-none"
      style={{
        ...style,
        opacity: visible ? 1 : 0,
        transition: `opacity ${durationSeconds}s ease`,
      }}
    />
  );
}

/**
 * VOICE phase — a small waveform of bars glowing along the bottom edge,
 * each bar animated with a staggered delay to simulate live speech output.
 */
function VoiceWaveformOverlay({
  visible,
  durationSeconds = FADE_TRANSITION_BASE,
  speedMultiplier = 1,
}: {
  visible: boolean;
  durationSeconds?: number;
  speedMultiplier?: number;
}) {
  const bars = [22, 42, 60, 38, 70, 48, 84, 55, 72, 40, 62, 80, 46, 68, 34, 58];
  const pulseDur = (1.2 / speedMultiplier).toFixed(3);
  const staggerStep = 0.06 / speedMultiplier;
  return (
    <div
      aria-hidden="true"
      className="absolute inset-x-0 bottom-0 px-5 pb-5 flex items-end justify-center gap-[3px] h-1/3 pointer-events-none"
      style={{
        opacity: visible ? 1 : 0,
        transition: `opacity ${durationSeconds}s ease`,
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
              ? `ptta-wave-pulse ${pulseDur}s ease-in-out ${(
                  i * staggerStep
                ).toFixed(3)}s infinite alternate`
              : undefined,
          }}
        />
      ))}
    </div>
  );
}
