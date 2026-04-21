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

export function DispatchStage({ model, onDone, onBack }: Props) {
  useEffect(() => {
    const t = setTimeout(onDone, DISPATCH_MS);
    return () => clearTimeout(t);
  }, [onDone]);

  const docket = dispatchDocket(model.id);

  return (
    <div className="min-h-[100dvh] bg-stone-950 text-cream flex flex-col overflow-hidden">
      {/* Compact header */}
      <header className="flex items-center gap-3 px-5 pt-6 pb-2">
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

      {/* Painting hero — large, then animates up-right to become a reference card */}
      <div className="flex-1 relative flex items-center justify-center px-6">
        <motion.div
          initial={{ scale: 1, x: 0, y: 0, opacity: 0 }}
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
          className="relative w-[65%] aspect-[3/4] rounded-sm overflow-hidden border border-white/10 shadow-2xl"
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

          {/* Stamp: fades in at ~40% of duration, angled */}
          <motion.div
            initial={{ opacity: 0, scale: 1.4, rotate: -8 }}
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
        className="px-6 pb-10"
      >
        <div
          className="border-t border-hairline pt-3 font-mono text-white/65"
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
