import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import type { ModelEntry } from "@/content/models";
import { polishRender } from "@/content/fabrication-images";
import { ReferenceCard } from "./ReferenceCard";

interface Props {
  model: ModelEntry;
  onDone: () => void;
  onBack: () => void;
}

const POLISH_MS = 3000;

export function PolishStage({ model, onDone, onBack }: Props) {
  const [pass, setPass] = useState(1);
  const startedAt = useRef<number>(Date.now());

  // Use the dedicated polish render if the model ships one, else fall
  // back to the painting (forced grayscale below to match the physical
  // print appearance).
  const polishSrc = useMemo(() => polishRender(model.id), [model.id]);
  const baseSrc = polishSrc ?? model.image;
  const baseFilter = polishSrc
    ? undefined
    : "grayscale(1) contrast(1.05) brightness(0.98)";

  useEffect(() => {
    const t = setTimeout(onDone, POLISH_MS);
    return () => clearTimeout(t);
  }, [onDone]);

  useEffect(() => {
    const id = window.setInterval(() => {
      const elapsed = Date.now() - startedAt.current;
      const progress = Math.min(1, elapsed / POLISH_MS);
      setPass(Math.min(4, Math.max(1, Math.ceil(progress * 4))));
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
            Finishing · Table 04
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
        — Polishing the relief…
      </p>

      {/* Finishing table */}
      <div
        className="relative flex-1 mx-5 my-3 rounded-sm overflow-hidden border border-white/10"
        style={{
          background:
            "radial-gradient(ellipse at 50% 45%, #2a1f14 0%, #0a0806 75%)",
        }}
      >
        {/* Painting frame — portrait aspect, centred on the table */}
        <div
          className="absolute rounded-sm overflow-hidden border border-white/15"
          style={{
            top: "8%",
            bottom: "8%",
            left: "18%",
            right: "18%",
            boxShadow: "0 14px 36px rgba(0,0,0,0.7)",
          }}
        >
          {baseSrc && (
            <>
              {/* Sharp/final base image — render if available, else the
                  painting with a forced grayscale filter. */}
              <img
                src={baseSrc}
                alt=""
                className="absolute inset-0 w-full h-full object-cover"
                style={baseFilter ? { filter: baseFilter } : undefined}
              />
              {/* Matte/dusty overlay — blur + dim.  Fades out as the
                  polisher works so the piece "clears" in real time. */}
              <motion.img
                src={baseSrc}
                alt=""
                aria-hidden
                className="absolute inset-0 w-full h-full object-cover pointer-events-none"
                initial={{
                  filter: baseFilter
                    ? "blur(7px) grayscale(1) brightness(0.6)"
                    : "blur(7px) brightness(0.55) contrast(0.9)",
                  opacity: 1,
                }}
                animate={{
                  filter: baseFilter
                    ? [
                        "blur(7px) grayscale(1) brightness(0.6)",
                        "blur(4px) grayscale(1) brightness(0.75)",
                        "blur(1.5px) grayscale(1) brightness(0.9)",
                        "blur(0px) grayscale(1) brightness(0.98)",
                      ]
                    : [
                        "blur(7px) brightness(0.55) contrast(0.9)",
                        "blur(4px) brightness(0.72) contrast(0.95)",
                        "blur(1.5px) brightness(0.88) contrast(1)",
                        "blur(0px) brightness(1) contrast(1)",
                      ],
                  opacity: [1, 0.85, 0.55, 0],
                }}
                transition={{
                  duration: POLISH_MS / 1000,
                  times: [0, 0.4, 0.75, 1],
                  ease: "linear",
                }}
              />
              {/* Moving highlight — follows the polisher so you see a bright
                  sweep where the cloth just passed */}
              <motion.div
                className="absolute inset-0 pointer-events-none mix-blend-screen"
                animate={{
                  background: [
                    "radial-gradient(circle at 30% 28%, rgba(255,240,210,0.55) 0%, transparent 26%)",
                    "radial-gradient(circle at 68% 32%, rgba(255,240,210,0.6) 0%, transparent 26%)",
                    "radial-gradient(circle at 62% 68%, rgba(255,240,210,0.55) 0%, transparent 26%)",
                    "radial-gradient(circle at 28% 72%, rgba(255,240,210,0.6) 0%, transparent 26%)",
                    "radial-gradient(circle at 50% 50%, rgba(255,240,210,0.35) 0%, transparent 60%)",
                  ],
                }}
                transition={{
                  duration: POLISH_MS / 1000,
                  times: [0, 0.25, 0.5, 0.75, 1],
                  ease: "linear",
                }}
              />
            </>
          )}
        </div>

        {/* Buffer tool — figure-8 over the painting */}
        <motion.div
          className="absolute z-10 rounded-full border-2 border-accent"
          style={{
            width: 26,
            height: 26,
            background:
              "radial-gradient(circle, rgba(214,67,36,0.25), transparent)",
            transform: "translate(-50%, -50%)",
          }}
          animate={{
            top: ["28%", "32%", "58%", "72%", "60%", "34%", "28%"],
            left: ["35%", "65%", "62%", "50%", "38%", "36%", "35%"],
          }}
          transition={{
            duration: POLISH_MS / 1000,
            times: [0, 0.18, 0.36, 0.5, 0.64, 0.82, 1],
            ease: "linear",
          }}
        >
          <motion.span
            aria-hidden
            className="absolute inset-[-3px] rounded-full"
            style={{ border: "1px dashed rgba(214,67,36,0.6)" }}
            animate={{ rotate: 360 }}
            transition={{ duration: 1.5, ease: "linear", repeat: Infinity }}
          />
        </motion.div>

        {/* Sparks */}
        {[0, 0.4, 0.8, 1.2, 1.8, 2.2].map((delay, i) => (
          <motion.span
            key={i}
            aria-hidden
            className="absolute rounded-full bg-white"
            style={{
              width: 3,
              height: 3,
              top: `${32 + (i % 3) * 14}%`,
              left: `${44 + (i % 4) * 4}%`,
              boxShadow: "0 0 4px rgba(255,240,210,0.9)",
            }}
            animate={{
              opacity: [0, 1, 0],
              x: [0, -10],
              y: [0, -10],
              scale: [1, 0.4],
            }}
            transition={{
              duration: 1,
              delay,
              repeat: Infinity,
              repeatDelay: 0.4,
              ease: "easeOut",
            }}
          />
        ))}
      </div>

      {/* Readout */}
      <div
        className="px-5 pb-10 flex justify-between items-center font-mono text-white/75"
        style={{ fontSize: "10pt" }}
        aria-live="polite"
      >
        <span>surface pass {pass.toString().padStart(2, "0")} of 04</span>
        <span className="text-accent">● buffing</span>
      </div>
    </div>
  );
}
