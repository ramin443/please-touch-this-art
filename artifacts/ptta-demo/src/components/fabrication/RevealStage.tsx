import { ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import { useLocation } from "wouter";
import type { ModelEntry } from "@/content/models";
import { fabricationImage } from "@/content/fabrication-images";

interface Props {
  model: ModelEntry;
  onBack: () => void;
  onPickAnother: () => void;
}

export function RevealStage({ model, onBack, onPickAnother }: Props) {
  const src = fabricationImage(model.id);
  const [, navigate] = useLocation();

  return (
    <div className="fixed inset-0 bg-stone-950 text-cream overflow-hidden">
      {/* Image area — padded so the full photo always fits between the
          top and bottom overlays, preserving aspect ratio on any screen. */}
      <div
        className="absolute inset-0 flex items-center justify-center px-4"
        style={{
          paddingTop: "calc(max(5.5rem, env(safe-area-inset-top) + 4.5rem))",
          paddingBottom:
            "calc(max(11rem, env(safe-area-inset-bottom) + 10rem))",
        }}
      >
        {src ? (
          <motion.img
            initial={{ opacity: 0, scale: 1.03 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            src={src}
            alt={`Finished tactile relief of ${model.title} by ${model.artist}`}
            className="max-w-full max-h-full object-contain"
            style={{
              width: "auto",
              height: "auto",
            }}
          />
        ) : (
          <p className="text-white/60 text-sm">Finished piece not on file yet.</p>
        )}
      </div>

      {/* Top gradient + back */}
      <header
        className="absolute top-0 left-0 right-0 z-10 flex items-center gap-3 px-5 pt-[max(1.5rem,env(safe-area-inset-top))] pb-6 pointer-events-none"
        style={{
          background:
            "linear-gradient(to bottom, rgba(10,8,6,0.82), rgba(10,8,6,0))",
        }}
      >
        <button
          onClick={onBack}
          aria-label="Back to demo hub"
          className="pointer-events-auto w-11 h-11 flex items-center justify-center rounded-full bg-black/40 backdrop-blur text-white/90 hover:bg-black/60 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          <ArrowLeft size={20} />
        </button>
        <div className="min-w-0 pointer-events-none">
          <h1
            className="font-serif text-lg sm:text-xl leading-tight truncate text-white drop-shadow"
            style={{ letterSpacing: "-0.01em" }}
          >
            — {model.title}
          </h1>
          <p
            className="ptta-label text-white/70 truncate mt-0.5"
            style={{ fontSize: "10pt" }}
          >
            {model.artist} · {model.year}
          </p>
        </div>
      </header>

      {/* Bottom caption + CTA */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.5, ease: "easeOut" }}
        className="absolute bottom-0 left-0 right-0 z-10 px-5 pt-20 pb-[max(2rem,env(safe-area-inset-bottom))]"
        style={{
          background:
            "linear-gradient(to top, rgba(10,8,6,0.92) 40%, rgba(10,8,6,0))",
        }}
      >
        <div className="mx-auto w-full max-w-[440px] text-center">
          <p
            className="ptta-label text-accent mb-2"
            style={{ fontSize: "10pt" }}
          >
            This is how it looks in your hands
          </p>
          {model.commissionedBy && (
            <p
              className="ptta-label text-white/60 mb-3"
              style={{ fontSize: "9pt" }}
            >
              {model.commissionedBy}
            </p>
          )}
          <button
            onClick={onPickAnother}
            aria-label="Pick another piece to fabricate"
            className="pointer-events-auto w-full flex items-center justify-center px-8 py-4 rounded-full bg-accent text-cream font-bold text-base tracking-wide hover:opacity-90 active:opacity-100 transition-opacity focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            style={{ minHeight: 56, letterSpacing: "-0.01em" }}
          >
            View another
          </button>
          <button
            onClick={() => navigate("/audio-guide")}
            aria-label="Continue to AI Audio Guide Curator"
            className="pointer-events-auto mt-3 w-full px-6 py-3 rounded-full bg-white/10 border border-white/30 text-white/90 text-sm hover:bg-white/20 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            Next: AI Audio Guide Curator →
          </button>
        </div>
      </motion.div>
    </div>
  );
}
