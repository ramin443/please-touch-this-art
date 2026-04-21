import { useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import type { ModelEntry } from "@/content/models";
import { ReferenceCard } from "./ReferenceCard";

interface Props {
  model: ModelEntry;
  onDone: () => void;
  onBack: () => void;
}

const POLISH_MS = 3000;

export function PolishStage({ model, onDone, onBack }: Props) {
  useEffect(() => {
    const t = setTimeout(onDone, POLISH_MS);
    return () => clearTimeout(t);
  }, [onDone]);

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

      {/* Finishing table */}
      <div
        className="relative flex-1 mx-5 my-4 rounded-sm overflow-hidden border border-white/10"
        style={{
          background:
            "radial-gradient(ellipse at 50% 45%, #2a1f14 0%, #0a0806 70%)",
        }}
      >
        {/* The finished form sitting on the table */}
        <div
          className="absolute rounded-sm"
          style={{
            top: "18%",
            bottom: "22%",
            left: "28%",
            right: "28%",
            background:
              "linear-gradient(135deg, rgba(245,230,200,0.95) 0%, rgba(200,180,150,0.85) 50%, rgba(120,100,70,0.8) 100%)",
            boxShadow: "0 10px 30px rgba(0,0,0,0.7)",
          }}
        >
          {/* Moving polish highlight — follows the buffer's approximate path */}
          <motion.div
            className="absolute inset-0 pointer-events-none"
            animate={{
              background: [
                "radial-gradient(circle at 30% 30%, rgba(255,240,210,0.85) 0%, transparent 28%)",
                "radial-gradient(circle at 70% 32%, rgba(255,240,210,0.9) 0%, transparent 28%)",
                "radial-gradient(circle at 62% 68%, rgba(255,240,210,0.85) 0%, transparent 28%)",
                "radial-gradient(circle at 28% 70%, rgba(255,240,210,0.9) 0%, transparent 28%)",
                "radial-gradient(circle at 30% 30%, rgba(255,240,210,0.85) 0%, transparent 28%)",
              ],
            }}
            transition={{
              duration: POLISH_MS / 1000,
              times: [0, 0.25, 0.5, 0.75, 1],
              ease: "linear",
            }}
          />
        </div>

        {/* Buffer tool — figure-8 path */}
        <motion.div
          className="absolute z-10 rounded-full border-2 border-accent"
          style={{
            width: 24,
            height: 24,
            background:
              "radial-gradient(circle, rgba(214,67,36,0.3), transparent)",
            transform: "translate(-50%, -50%)",
          }}
          animate={{
            top: ["28%", "35%", "58%", "68%", "58%", "35%", "28%"],
            left: ["36%", "64%", "62%", "50%", "38%", "36%", "36%"],
          }}
          transition={{
            duration: POLISH_MS / 1000,
            times: [0, 0.18, 0.36, 0.5, 0.64, 0.82, 1],
            ease: "linear",
          }}
        >
          {/* Spinning dashed outer ring */}
          <motion.span
            aria-hidden
            className="absolute inset-[-3px] rounded-full"
            style={{ border: "1px dashed rgba(214,67,36,0.6)" }}
            animate={{ rotate: 360 }}
            transition={{ duration: 1.8, ease: "linear", repeat: Infinity }}
          />
        </motion.div>

        {/* Sparks */}
        {[0, 0.4, 0.8, 1.2, 1.6, 2.0, 2.4].map((delay, i) => (
          <motion.span
            key={i}
            aria-hidden
            className="absolute rounded-full bg-white"
            style={{
              width: 3,
              height: 3,
              top: `${30 + (i % 3) * 12}%`,
              left: `${45 + (i % 4) * 4}%`,
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
        <span>surface pass 02 of 04</span>
        <span className="text-accent">● buffing</span>
      </div>
    </div>
  );
}
