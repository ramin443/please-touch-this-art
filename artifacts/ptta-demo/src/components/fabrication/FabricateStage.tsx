import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import type { ModelEntry } from "@/content/models";
import { fabricateRenders } from "@/content/fabrication-images";
import { ReferenceCard } from "./ReferenceCard";

interface Props {
  model: ModelEntry;
  onDone: () => void;
  onBack: () => void;
}

const FABRICATE_MS = 5500;
const TOTAL_LAYERS_FAKE = 240;
const START_LAYER_FAKE = 1;

export function FabricateStage({ model, onDone, onBack }: Props) {
  const [progress, setProgress] = useState(0);
  const [layerFake, setLayerFake] = useState(START_LAYER_FAKE);
  const startedAt = useRef<number>(Date.now());

  useEffect(() => {
    const t = setTimeout(onDone, FABRICATE_MS);
    return () => clearTimeout(t);
  }, [onDone]);

  useEffect(() => {
    const id = window.setInterval(() => {
      const elapsed = Date.now() - startedAt.current;
      const p = Math.min(1, elapsed / FABRICATE_MS);
      setProgress(p);
      setLayerFake(
        Math.round(
          START_LAYER_FAKE + p * (TOTAL_LAYERS_FAKE - START_LAYER_FAKE)
        )
      );
    }, 60);
    return () => window.clearInterval(id);
  }, []);

  const hiddenPct = (1 - progress) * 100;

  // If the model ships with 3D-print render angles, use those as the
  // background that gets revealed. Otherwise fall back to the original
  // painting rendered in grayscale so it reads as physical.
  const renders = useMemo(() => fabricateRenders(model.id), [model.id]);
  const baseStyle = useMemo<React.CSSProperties>(
    () =>
      renders
        ? {}
        : { filter: "grayscale(1) contrast(1.05) brightness(0.95)" },
    [renders]
  );

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

      <p
        className="relative z-20 text-center font-serif italic text-white/85 px-5 mt-1"
        style={{ fontSize: "14pt", letterSpacing: "-0.01em" }}
        aria-live="polite"
      >
        — Being fabricated…
      </p>

      <div
        className="relative flex-1 mx-5 my-3 rounded-sm border border-white/10 overflow-hidden"
        style={{ background: "#0a0806" }}
      >
        {renders ? (
          <>
            {/* Three stacked render angles; cross-fade between them across
                the stage. Angle shifts subtly sell the idea of the viewer
                moving around the print as it grows. */}
            <motion.img
              src={renders[0]}
              alt=""
              aria-hidden
              className="absolute inset-0 w-full h-full object-cover"
              initial={{ opacity: 1 }}
              animate={{ opacity: [1, 1, 0, 0, 0, 0] }}
              transition={{
                duration: FABRICATE_MS / 1000,
                times: [0, 0.3, 0.4, 0.6, 0.7, 1],
                ease: "linear",
              }}
            />
            <motion.img
              src={renders[1]}
              alt=""
              aria-hidden
              className="absolute inset-0 w-full h-full object-cover"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0, 1, 1, 0, 0] }}
              transition={{
                duration: FABRICATE_MS / 1000,
                times: [0, 0.3, 0.4, 0.6, 0.7, 1],
                ease: "linear",
              }}
            />
            <motion.img
              src={renders[2]}
              alt=""
              aria-hidden
              className="absolute inset-0 w-full h-full object-cover"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0, 0, 0, 1, 1] }}
              transition={{
                duration: FABRICATE_MS / 1000,
                times: [0, 0.3, 0.4, 0.6, 0.7, 1],
                ease: "linear",
              }}
            />
          </>
        ) : (
          model.image && (
            <img
              src={model.image}
              alt=""
              aria-hidden
              className="absolute inset-0 w-full h-full object-cover"
              style={baseStyle}
            />
          )
        )}

        {/* Dark overlay covering the un-printed portion from the top */}
        <div
          className="absolute left-0 right-0 top-0 pointer-events-none"
          style={{
            height: `${hiddenPct}%`,
            background:
              "linear-gradient(to bottom, #0a0806 0%, #0a0806 80%, rgba(10,8,6,0.92) 100%)",
            transition: "height 0.08s linear",
          }}
        />

        {/* Warm gradient just above the build front — suggests hot material */}
        <div
          className="absolute left-0 right-0 pointer-events-none"
          style={{
            top: `${hiddenPct}%`,
            height: 18,
            background:
              "linear-gradient(to bottom, rgba(214,67,36,0.4), transparent)",
            transform: "translateY(-18px)",
            transition: "top 0.08s linear",
            mixBlendMode: "screen",
          }}
        />

        {/* Scan line at the build front */}
        <div
          className="absolute left-0 right-0 pointer-events-none"
          style={{
            top: `${hiddenPct}%`,
            height: 2,
            background:
              "linear-gradient(90deg, transparent, #D64324, transparent)",
            boxShadow: "0 0 10px #D64324, 0 0 20px rgba(214,67,36,0.5)",
            transform: "translateY(-1px)",
            transition: "top 0.08s linear",
          }}
        />

        {/* Nozzle sitting just above the scan line, zig-zags across */}
        <motion.div
          className="absolute z-10 pointer-events-none"
          style={{
            width: 18,
            height: 22,
            top: `${hiddenPct}%`,
            transform: "translate(-50%, -100%)",
            transition: "top 0.08s linear",
          }}
          animate={{
            left: [
              "24%", "76%", "76%", "24%", "24%", "76%", "76%", "24%", "24%",
            ],
          }}
          transition={{
            duration: FABRICATE_MS / 1000,
            ease: "linear",
            times: [0, 0.125, 0.25, 0.375, 0.5, 0.625, 0.75, 0.875, 1],
          }}
        >
          <div
            className="w-full h-full rounded-sm"
            style={{
              background:
                "linear-gradient(to bottom, #3a3028 0%, #1c1814 60%, #0a0806 100%)",
              border: "1px solid rgba(245,241,234,0.45)",
            }}
          />
          <span
            aria-hidden
            className="absolute left-1/2 -translate-x-1/2 bg-accent"
            style={{
              bottom: -4,
              width: 3,
              height: 5,
              boxShadow: "0 0 6px #D64324, 0 0 12px #D64324",
            }}
          />
          <span
            aria-hidden
            className="absolute left-1/2 -translate-x-1/2 bg-white/30"
            style={{ top: -120, width: 2, height: 120 }}
          />
          <span
            aria-hidden
            className="absolute left-1/2 -translate-x-1/2 rounded-full"
            style={{
              bottom: -8,
              width: 16,
              height: 6,
              background:
                "radial-gradient(ellipse, rgba(214,67,36,0.55), transparent 70%)",
            }}
          />
        </motion.div>
      </div>

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
