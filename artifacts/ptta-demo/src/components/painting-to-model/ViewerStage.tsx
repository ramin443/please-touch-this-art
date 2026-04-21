import { ModelViewerElement } from "@google/model-viewer";
import "@/types/model-viewer";
import { useEffect, useRef, useState } from "react";
import { ArrowLeft } from "lucide-react";
import type { ModelEntry } from "@/content/models";

// Our GLBs are produced by gltfpack with EXT_meshopt_compression +
// KHR_mesh_quantization. model-viewer only wires the meshopt decoder into
// three's GLTFLoader if this location is set (see @google/model-viewer's
// features/loading.js). Without it the GLB download completes but the
// geometry is never decoded — load event never fires, canvas stays empty.
// Setting this at module scope guarantees it runs before React renders any
// <model-viewer> tag. CDN-hosted; can be swapped for a local copy later.
ModelViewerElement.meshoptDecoderLocation =
  "https://unpkg.com/meshoptimizer@0.20.0/meshopt_decoder.js";

interface Props {
  model: ModelEntry;
  onBack: () => void;
}

type Status = "loading" | "ready" | "error";

export function ViewerStage({ model, onBack }: Props) {
  const viewerRef = useRef<HTMLElement>(null);
  const [status, setStatus] = useState<Status>("loading");
  const [progress, setProgress] = useState(0);
  const [errorDetail, setErrorDetail] = useState("");

  useEffect(() => {
    const el = viewerRef.current;
    if (!el) return;

    const handleLoad = () => {
      setStatus("ready");
      // GLBs have no embedded materials — model-viewer falls back to a
      // white PBR default that washes out in neutral lighting. Swap the
      // default(s) for a warm-stone, non-metallic, matte material so the
      // relief topography reads clearly under the environment lighting.
      try {
        type PBRSetters = {
          setBaseColorFactor?: (rgba: [number, number, number, number]) => void;
          setMetallicFactor?: (v: number) => void;
          setRoughnessFactor?: (v: number) => void;
        };
        type MVMaterial = { pbrMetallicRoughness?: PBRSetters };
        type MVModel = { materials?: MVMaterial[] };
        const materials = (el as unknown as { model?: MVModel }).model?.materials;
        if (materials && materials.length > 0) {
          for (const mat of materials) {
            mat.pbrMetallicRoughness?.setBaseColorFactor?.([
              0.85, 0.80, 0.72, 1,
            ]);
            mat.pbrMetallicRoughness?.setMetallicFactor?.(0);
            mat.pbrMetallicRoughness?.setRoughnessFactor?.(0.85);
          }
        }
      } catch {
        /* material tweaking is progressive enhancement */
      }
    };
    const handleProgress = (event: Event) => {
      const detail = (event as CustomEvent<{ totalProgress: number }>).detail;
      if (detail?.totalProgress != null) {
        setProgress(detail.totalProgress);
        if (detail.totalProgress >= 1) setStatus("ready");
      }
    };
    const handleError = (event: Event) => {
      const detail = (event as CustomEvent).detail;
      const msg =
        detail?.sourceError?.message ||
        detail?.type ||
        (typeof detail === "string" ? detail : JSON.stringify(detail));
      setStatus("error");
      setErrorDetail(msg || "Unknown error");
    };

    el.addEventListener("load", handleLoad);
    el.addEventListener("progress", handleProgress);
    el.addEventListener("error", handleError);
    return () => {
      el.removeEventListener("load", handleLoad);
      el.removeEventListener("progress", handleProgress);
      el.removeEventListener("error", handleError);
    };
  }, [model.id]);

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

        <div className="flex-1 relative px-3 pb-2 min-h-[420px]">
          <div className="w-full h-full rounded-2xl overflow-hidden bg-stone-900/70 relative">
            <model-viewer
              ref={viewerRef}
              src={model.glb}
              alt={`3D tactile model of ${model.title} by ${model.artist}`}
              camera-controls
              auto-rotate
              auto-rotate-delay="0"
              rotation-per-second="28deg"
              camera-orbit="-22deg 80deg auto"
              min-camera-orbit="-85deg 45deg auto"
              max-camera-orbit="85deg 100deg auto"
              shadow-intensity="1.6"
              shadow-softness="0.6"
              exposure="1.05"
              environment-image="https://modelviewer.dev/shared-assets/environments/spruit_sunrise_1k.hdr"
              skybox-image=""
              touch-action="pan-y"
              interaction-prompt="none"
              loading="eager"
              reveal="auto"
              style={{
                width: "100%",
                height: "100%",
                minHeight: 420,
                display: "block",
                backgroundColor: "#14110e",
              }}
            />
            {status !== "ready" && (
              <div
                className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-stone-950/85 backdrop-blur-sm pointer-events-none"
                aria-live="polite"
              >
                {status === "loading" && (
                  <>
                    <div className="w-10 h-10 rounded-full border-2 border-amber-400/25 border-t-amber-400 animate-spin" />
                    <p className="font-sans text-sm text-white/80">
                      Loading 3D model… {Math.round(progress * 100)}%
                    </p>
                  </>
                )}
                {status === "error" && (
                  <div className="px-6 text-center pointer-events-auto">
                    <p className="font-serif text-lg text-amber-300 mb-2">
                      Couldn&rsquo;t load the 3D model
                    </p>
                    <p className="font-sans text-xs text-white/70 break-words">
                      {errorDetail}
                    </p>
                  </div>
                )}
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
