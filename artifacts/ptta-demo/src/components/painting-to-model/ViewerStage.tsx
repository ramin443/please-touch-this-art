import { useEffect, useState, type FC, type HTMLAttributes } from "react";
import { ArrowLeft } from "lucide-react";
import type { ModelEntry } from "@/content/models";

interface Props {
  model: ModelEntry;
  onBack: () => void;
}

type ModelViewerAttrs = HTMLAttributes<HTMLElement> & {
  src?: string;
  alt?: string;
  poster?: string;
  "camera-controls"?: string;
  "auto-rotate"?: string;
  "auto-rotate-delay"?: string;
  "rotation-per-second"?: string;
  "shadow-intensity"?: string;
  "shadow-softness"?: string;
  exposure?: string;
  "touch-action"?: string;
  "interaction-prompt"?: "auto" | "none" | "when-focused";
  loading?: "eager" | "lazy";
  reveal?: "auto" | "manual";
  "camera-orbit"?: string;
};

// model-viewer is a custom element. We declare it as a string-valued "component"
// so React's JSX factory passes it to createElement as the element name, while
// TypeScript treats it as a typed component. The cast is the minimum-surface
// workaround for JSX intrinsic element typing with custom elements.
const ModelViewer = "model-viewer" as unknown as FC<ModelViewerAttrs>;

export function ViewerStage({ model, onBack }: Props) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    import("@google/model-viewer").then(() => {
      if (!cancelled) setReady(true);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  if (!model.glb) return null;

  return (
    <div className="min-h-[100dvh] bg-stone-950 text-stone-100 flex flex-col">
      <div className="mx-auto w-full max-w-md flex-1 flex flex-col">
        <header className="flex items-center gap-3 px-5 pt-6 pb-2">
          <button
            onClick={onBack}
            aria-label="Back to picker"
            className="w-11 h-11 flex items-center justify-center rounded-full text-white/80 hover:bg-white/10 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-400"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="min-w-0">
            <h1 className="font-serif text-lg font-bold leading-tight truncate">
              {model.title}
            </h1>
            <p className="font-sans text-xs text-white/60 truncate">
              {model.artist} <span aria-hidden>·</span> {model.year}
            </p>
          </div>
        </header>

        <div className="flex-1 relative px-3 pb-2 min-h-[360px]">
          <div className="w-full h-full rounded-2xl overflow-hidden bg-stone-900/70">
            {ready ? (
              <ModelViewer
                src={model.glb}
                alt={`3D tactile model of ${model.title} by ${model.artist}`}
                poster={model.image}
                camera-controls=""
                auto-rotate=""
                auto-rotate-delay="1800"
                rotation-per-second="20deg"
                shadow-intensity="1.1"
                shadow-softness="0.9"
                exposure="0.95"
                touch-action="pan-y"
                interaction-prompt="none"
                loading="eager"
                reveal="auto"
                style={{
                  width: "100%",
                  height: "100%",
                  minHeight: 360,
                  backgroundColor: "transparent",
                  ["--poster-color" as never]: "transparent",
                }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <p className="text-white/60 text-sm">Loading viewer…</p>
              </div>
            )}
          </div>
        </div>

        <p className="text-center text-white/60 text-xs px-6 pt-2 pb-1 font-sans">
          Drag to rotate <span aria-hidden>·</span> Pinch to zoom
        </p>

        <div className="px-5 pb-8 pt-3">
          <button
            onClick={onBack}
            aria-label="View another model"
            className="w-full flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-amber-400 text-stone-950 font-sans font-bold text-base tracking-wide hover:bg-amber-300 active:bg-amber-500 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            style={{ minHeight: 56 }}
          >
            View another
          </button>
        </div>
      </div>
    </div>
  );
}
