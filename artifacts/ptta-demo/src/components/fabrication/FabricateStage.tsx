import { useEffect, useRef, useState } from "react";
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
const TOTAL_LAYERS = 240;
const START_LAYER = 87;

export function FabricateStage({ model, onDone, onBack }: Props) {
  const [layer, setLayer] = useState(START_LAYER);
  const startedAt = useRef<number>(Date.now());

  useEffect(() => {
    const advance = setTimeout(onDone, FABRICATE_MS);
    return () => clearTimeout(advance);
  }, [onDone]);

  useEffect(() => {
    // Climb the layer counter throughout the stage.
    const id = window.setInterval(() => {
      const elapsed = Date.now() - startedAt.current;
      const progress = Math.min(1, elapsed / FABRICATE_MS);
      const l = Math.round(
        START_LAYER + progress * (TOTAL_LAYERS - START_LAYER)
      );
      setLayer(l);
    }, 60);
    return () => window.clearInterval(id);
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

      {/* Build chamber */}
      <div
        className="relative flex-1 mx-5 my-4 rounded-sm border border-white/10 overflow-hidden"
        style={{
          background:
            "linear-gradient(to right, rgba(245,241,234,0.04) 0%, transparent 15%, transparent 85%, rgba(245,241,234,0.04) 100%), #0f0c0a",
        }}
      >
        {/* Build bed rule marks */}
        <div
          className="absolute"
          style={{
            left: "15%",
            right: "15%",
            bottom: "10%",
            height: "3px",
            backgroundImage:
              "repeating-linear-gradient(90deg, rgba(245,241,234,0.4) 0 1px, transparent 1px 6px)",
          }}
        />

        {/* Nozzle: irregular back-and-forth with pauses */}
        <motion.div
          animate={{
            left: [
              "22%", "70%", "70%", "30%",
              "30%", "72%", "68%", "24%",
              "24%",
            ],
            top: [
              "12%", "12%", "12%", "20%",
              "20%", "28%", "28%", "36%",
              "36%",
            ],
          }}
          transition={{
            duration: FABRICATE_MS / 1000,
            ease: "linear",
            times: [0, 0.16, 0.22, 0.4, 0.46, 0.62, 0.68, 0.86, 1],
          }}
          className="absolute z-10"
          style={{
            width: 14,
            height: 16,
            background: "linear-gradient(to bottom, #2a2520, #0a0806)",
            border: "1px solid rgba(245,241,234,0.45)",
            borderBottom: "2px solid #D64324",
            transform: "translateX(-50%)",
          }}
        >
          {/* Feed tube */}
          <span
            aria-hidden
            className="absolute left-1/2 -translate-x-1/2 bg-white/35"
            style={{ top: -28, width: 2, height: 28 }}
          />
          {/* Hot tip */}
          <span
            aria-hidden
            className="absolute left-1/2 -translate-x-1/2 bg-accent"
            style={{
              bottom: -4,
              width: 2,
              height: 4,
              boxShadow: "0 0 4px #D64324",
            }}
          />
        </motion.div>

        {/* Accumulating layers */}
        <div
          className="absolute flex flex-col-reverse"
          style={{ left: "20%", right: "20%", bottom: "11%", gap: 1 }}
        >
          {Array.from({ length: 16 }).map((_, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scaleX: 0 }}
              animate={{
                opacity: [0, 1, 0.45],
                scaleX: [0, 1, 1],
              }}
              transition={{
                duration: 0.9,
                delay: 0.1 + i * (FABRICATE_MS / 1000 / 18),
                times: [0, 0.35, 1],
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
      </div>

      {/* Readout */}
      <div className="px-5 pb-10 flex justify-between items-center font-mono text-white/75"
           style={{ fontSize: "10pt" }}
           aria-live="polite"
      >
        <span>
          layer {layer.toString().padStart(3, "0")} of{" "}
          {TOTAL_LAYERS.toString().padStart(3, "0")}
        </span>
        <span className="text-accent">● live</span>
      </div>
    </div>
  );
}
