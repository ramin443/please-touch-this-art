import { motion } from "framer-motion";
import type { ModelEntry } from "@/content/models";
import { fabricationImage } from "@/content/fabrication-images";

interface Props {
  model: ModelEntry;
  onBack: () => void;
}

export function RevealStage({ model }: Props) {
  const src = fabricationImage(model.id);

  return (
    <div className="absolute inset-0 bg-stone-950 text-cream overflow-hidden">
      {/* Image area — padded so the full photo always fits between the
          top and bottom overlays, preserving aspect ratio on any screen. */}
      <div
        className="absolute inset-0 flex items-center justify-center px-4"
        style={{
          paddingTop: "1rem",
          paddingBottom:
            "calc(max(10rem, env(safe-area-inset-bottom) + 9rem))",
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

      {/* Bottom caption + CTA */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.5, ease: "easeOut" }}
        className="absolute bottom-0 left-0 right-0 z-10 px-5 pt-20 pb-[max(6.5rem,env(safe-area-inset-bottom)+5.5rem)]"
        style={{
          background:
            "linear-gradient(to top, rgba(10,8,6,0.92) 40%, rgba(10,8,6,0))",
        }}
      >
        <div className="mx-auto w-full max-w-[440px] text-center">
          <p
            className="font-serif italic text-white/95 mb-2 leading-snug"
            style={{
              fontSize: "clamp(1.25rem, 5vw, 1.65rem)",
              letterSpacing: "-0.01em",
              fontWeight: 400,
            }}
          >
            This is how it looks in your hands
          </p>
          {model.commissionedBy && (
            <p
              className="ptta-label text-white/55 mb-3"
              style={{ fontSize: "9pt" }}
            >
              {model.commissionedBy}
            </p>
          )}
        </div>
      </motion.div>
    </div>
  );
}
