import { useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import type { ModelEntry } from "@/content/models";
import { dispatchDocket } from "@/content/fabrication-images";

interface Props {
  model: ModelEntry;
  onDone: () => void;
  onBack: () => void;
}

const DISPATCH_MS = 2500;

// Fake "other jobs in the queue" — purely atmospheric. Kept short so the
// background looks busy without being readable enough to pull focus.
const GHOST_JOBS = [
  "#5117 · The Kiss",
  "#4933 · Wanderer",
  "#4820 · Great Wave",
  "#5206 · Starry Night",
  "#4748 · Girl w/ Pearl",
  "#5089 · Composition II",
];

export function DispatchStage({ model, onDone, onBack }: Props) {
  useEffect(() => {
    const t = setTimeout(onDone, DISPATCH_MS);
    return () => clearTimeout(t);
  }, [onDone]);

  const docket = dispatchDocket(model.id);

  return (
    <div className="min-h-[100dvh] bg-stone-950 text-cream flex flex-col overflow-hidden relative">
      {/* Background: blueprint grid + register marks + ghost queue.
          All static, low contrast — pure atmosphere so the painting reads
          as one item moving through a busy dispatch bay. */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none opacity-40"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, rgba(245,241,234,0.045) 0 1px, transparent 1px 24px)," +
            "repeating-linear-gradient(90deg, rgba(245,241,234,0.045) 0 1px, transparent 1px 24px)",
        }}
      />

      {/* Four register marks at the chamber corners — technical drawing feel */}
      {([
        ["top-0 left-0", "border-t border-l"],
        ["top-0 right-0", "border-t border-r"],
        ["bottom-0 left-0", "border-b border-l"],
        ["bottom-0 right-0", "border-b border-r"],
      ] as const).map(([pos, borders], i) => (
        <span
          key={i}
          aria-hidden
          className={`absolute ${pos} w-5 h-5 m-4 border-accent ${borders}`}
          style={{ borderWidth: 1 }}
        />
      ))}

      {/* Ghost queue of other jobs — vertical strip on the left margin */}
      <div
        aria-hidden
        className="absolute top-24 left-3 flex flex-col gap-2 font-mono text-white/25 pointer-events-none"
        style={{ fontSize: "7.5pt", lineHeight: 1.3 }}
      >
        <span className="text-white/45">NEXT IN QUEUE</span>
        {GHOST_JOBS.map((j) => (
          <span key={j}>{j}</span>
        ))}
      </div>

      {/* Conveyor-like dashed routing line from left margin toward the
          painting, animated to suggest things moving through. */}
      <motion.div
        aria-hidden
        className="absolute pointer-events-none"
        style={{
          top: "46%",
          left: 24,
          right: "40%",
          height: 1,
          background:
            "repeating-linear-gradient(90deg, rgba(214,67,36,0.65) 0 8px, transparent 8px 16px)",
        }}
        animate={{ backgroundPositionX: ["0px", "32px"] }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      />

      {/* Header */}
      <header className="flex items-center gap-3 px-5 pt-6 pb-2 relative z-10">
        <button
          onClick={onBack}
          aria-label="Back to fabrication picker"
          className="w-11 h-11 flex items-center justify-center rounded-full text-white/80 hover:bg-white/10 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          <ArrowLeft size={20} />
        </button>
        <div className="min-w-0">
          <p className="ptta-label text-accent" style={{ fontSize: "9pt" }}>
            Studio · Work Order
          </p>
          <p
            className="font-serif text-base leading-none truncate"
            style={{ letterSpacing: "-0.01em" }}
          >
            — {model.title}
          </p>
        </div>
      </header>

      {/* Big italic status label above the painting, announces the stage */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 1, 1, 0.7] }}
        transition={{ duration: DISPATCH_MS / 1000, times: [0, 0.2, 0.7, 1] }}
        className="relative z-10 text-center font-serif italic text-white/85 mt-2 mb-1"
        style={{ fontSize: "15pt", letterSpacing: "-0.01em" }}
      >
        — Sending off to the studio…
      </motion.p>

      {/* Painting hero */}
      <div className="flex-1 relative flex items-center justify-center px-6 z-10">
        <motion.div
          initial={{ scale: 0.95, x: 0, y: 0, opacity: 0 }}
          animate={{
            opacity: [0, 1, 1, 1],
            scale: [0.95, 1, 1, 0.3],
            x: [0, 0, 0, 140],
            y: [0, 0, 0, -220],
          }}
          transition={{
            duration: DISPATCH_MS / 1000,
            times: [0, 0.2, 0.7, 1],
            ease: ["easeOut", "linear", "easeIn"],
          }}
          className="relative w-[62%] aspect-[3/4] rounded-sm overflow-hidden border border-white/10 shadow-2xl"
        >
          {model.image ? (
            <img
              src={model.image}
              alt={`${model.title} by ${model.artist}`}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-stone-800" />
          )}

          {/* Stamp */}
          <motion.div
            initial={{ opacity: 0, scale: 1.4 }}
            animate={{ opacity: [0, 0, 1, 1], scale: [1.4, 1.4, 1, 1] }}
            transition={{
              duration: DISPATCH_MS / 1000,
              times: [0, 0.4, 0.5, 1],
            }}
            className="absolute bottom-3 right-3 border border-accent text-accent"
            style={{
              padding: "3px 7px",
              fontSize: "8pt",
              letterSpacing: "0.18em",
              fontFamily: "'Aeonik', system-ui, sans-serif",
              fontWeight: 700,
              transform: "rotate(-8deg)",
              transformOrigin: "center",
            }}
          >
            → QUEUED
          </motion.div>
        </motion.div>
      </div>

      {/* Work-order docket, bottom */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 1] }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="px-6 pb-10 relative z-10"
      >
        <div
          className="border-t border-hairline pt-3 font-mono text-white/70"
          style={{ fontSize: "10pt", lineHeight: 1.6 }}
        >
          <div>
            <span className="text-accent font-bold">
              JOB {docket.jobNumber}
            </span>{" "}
            · {model.artist} · {model.year}
          </div>
          <div>
            Queued · Bay {docket.bayNumber} · Est. {docket.estTime}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
