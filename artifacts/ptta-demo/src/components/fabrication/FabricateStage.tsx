import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import type { ModelEntry } from "@/content/models";
import { ReferenceCard } from "./ReferenceCard";

interface Props {
  model: ModelEntry;
  onDone: () => void;
  onBack: () => void;
}

const FABRICATE_MS = 4000;
const TOTAL_LAYERS_SHOWN = 18;   // visible horizontal lines that stack up
const LAYER_THICKNESS_PCT = 1.6; // vertical spacing between layers, % of chamber height
const STACK_BASE_BOTTOM_PCT = 11; // stack sits on the build plate at 11% from bottom
const TOTAL_LAYERS_FAKE = 240;    // pretty number for the "layer N of 240" readout
const START_LAYER_FAKE = 87;

export function FabricateStage({ model, onDone, onBack }: Props) {
  const [layerFake, setLayerFake] = useState(START_LAYER_FAKE);
  const [layerIdx, setLayerIdx] = useState(0); // 0…TOTAL_LAYERS_SHOWN
  const startedAt = useRef<number>(Date.now());

  useEffect(() => {
    const advance = setTimeout(onDone, FABRICATE_MS);
    return () => clearTimeout(advance);
  }, [onDone]);

  useEffect(() => {
    const id = window.setInterval(() => {
      const elapsed = Date.now() - startedAt.current;
      const progress = Math.min(1, elapsed / FABRICATE_MS);
      setLayerFake(
        Math.round(
          START_LAYER_FAKE + progress * (TOTAL_LAYERS_FAKE - START_LAYER_FAKE)
        )
      );
      setLayerIdx(Math.min(TOTAL_LAYERS_SHOWN, Math.floor(progress * TOTAL_LAYERS_SHOWN)));
    }, 60);
    return () => window.clearInterval(id);
  }, []);

  // The stack-top Y (as percentage-from-bottom) tracks the number of layers
  // already laid. The nozzle sits directly above this — so it literally moves
  // up as the stack grows, and its vertical position is the line it is
  // currently depositing.
  const stackTopPct = STACK_BASE_BOTTOM_PCT + layerIdx * LAYER_THICKNESS_PCT;

  // Horizontal oscillation of the nozzle — keyframe list sized so Framer
  // interpolates smoothly across the whole stage duration.
  const { xKeyframes, xTimes } = useMemo(() => {
    const steps = 9;
    const kf: string[] = [];
    const times: number[] = [];
    for (let i = 0; i <= steps; i += 1) {
      kf.push(i % 2 === 0 ? "20%" : "80%");
      times.push(i / steps);
    }
    return { xKeyframes: kf, xTimes: times };
  }, []);

  return (
    <div className="min-h-[100dvh] bg-stone-950 text-cream flex flex-col overflow-hidden relative">
      <header className="flex items-center gap-3 px-5 pt-6 pb-2 relative z-30">
        <button
          onClick={onBack}
          aria-label="Back to fabrication picker"
          className="w-11 h-11 flex items-center justify-center rounded-full text-white/80 hover:bg-white/10 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          <ArrowLeft size={20} />
        </button>
        <div className="min-w-0">
          <p className="ptta-label text-accent" style={{ fontSize: "9pt" }}>
            Fabrication · Bay 02
          </p>
          <p
            className="font-serif text-base leading-none truncate"
            style={{ letterSpacing: "-0.01em" }}
          >
            — {model.title}
          </p>
        </div>
      </header>

      <ReferenceCard model={model} />

      {/* Announces the stage explicitly */}
      <p
        className="relative z-20 text-center font-serif italic text-white/85 px-5 mt-1"
        style={{ fontSize: "14pt", letterSpacing: "-0.01em" }}
        aria-live="polite"
      >
        — Being fabricated…
      </p>

      {/* Build chamber */}
      <div
        className="relative flex-1 mx-5 my-3 rounded-sm border border-white/10 overflow-hidden"
        style={{
          background:
            "linear-gradient(to right, rgba(245,241,234,0.04) 0%, transparent 15%, transparent 85%, rgba(245,241,234,0.04) 100%), #0f0c0a",
        }}
      >
        {/* Build bed — horizontal tick rule at the bottom of the chamber */}
        <div
          className="absolute"
          style={{
            left: "15%",
            right: "15%",
            bottom: `${STACK_BASE_BOTTOM_PCT - 1}%`,
            height: "3px",
            backgroundImage:
              "repeating-linear-gradient(90deg, rgba(245,241,234,0.4) 0 1px, transparent 1px 6px)",
          }}
        />

        {/* Layer stack — anchored at the build plate, grows upward */}
        <div
          className="absolute flex flex-col-reverse"
          style={{
            left: "22%",
            right: "22%",
            bottom: `${STACK_BASE_BOTTOM_PCT}%`,
            gap: 1,
          }}
        >
          {Array.from({ length: TOTAL_LAYERS_SHOWN }).map((_, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scaleX: 0 }}
              animate={{
                opacity: [0, 1, 0.6],
                scaleX: [0, 1, 1],
              }}
              transition={{
                duration: 0.7,
                delay: 0.15 + i * (FABRICATE_MS / 1000 / (TOTAL_LAYERS_SHOWN + 2)),
                times: [0, 0.3, 1],
                ease: "easeOut",
              }}
              className="origin-left"
              style={{
                height: 2,
                background:
                  "linear-gradient(90deg, transparent, rgba(214,67,36,0.85), transparent)",
              }}
            />
          ))}
        </div>

        {/* Nozzle — Y tied to stack top so it sits right above the line it
            is depositing. X oscillates independently. */}
        <motion.div
          className="absolute z-10"
          style={{
            width: 14,
            height: 16,
            bottom: `${stackTopPct + 0.8}%`,
            left: 0,
            transform: "translateX(-50%)",
            background: "linear-gradient(to bottom, #2a2520, #0a0806)",
            border: "1px solid rgba(245,241,234,0.45)",
            borderBottom: "2px solid #D64324",
            transition: "bottom 0.25s linear",
          }}
          animate={{ left: xKeyframes }}
          transition={{
            duration: FABRICATE_MS / 1000,
            ease: "easeInOut",
            times: xTimes,
          }}
        >
          {/* Feed tube going up out of frame */}
          <span
            aria-hidden
            className="absolute left-1/2 -translate-x-1/2 bg-white/35"
            style={{ top: -40, width: 2, height: 40 }}
          />
          {/* Hot tip — glowing */}
          <span
            aria-hidden
            className="absolute left-1/2 -translate-x-1/2 bg-accent"
            style={{
              bottom: -4,
              width: 3,
              height: 4,
              boxShadow: "0 0 6px #D64324",
            }}
          />
        </motion.div>
      </div>

      {/* Readout */}
      <div
        className="px-5 pb-10 flex justify-between items-center font-mono text-white/75"
        style={{ fontSize: "10pt" }}
        aria-live="polite"
      >
        <span>
          layer {layerFake.toString().padStart(3, "0")} of{" "}
          {TOTAL_LAYERS_FAKE.toString().padStart(3, "0")}
        </span>
        <span className="text-accent">● printing</span>
      </div>
    </div>
  );
}
