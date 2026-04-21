import { ModelViewerElement } from "@google/model-viewer";
import { useEffect, useRef, useState } from "react";
import { ArrowLeft } from "lucide-react";
import type { ModelEntry } from "@/content/models";

// Our GLBs are produced by gltfpack with EXT_meshopt_compression +
// KHR_mesh_quantization. model-viewer only wires the meshopt decoder into
// three's GLTFLoader if this location is set (see @google/model-viewer's
// features/loading.js). Without it the GLB download completes but the
// geometry is never decoded — load event never fires, canvas stays empty.
ModelViewerElement.meshoptDecoderLocation =
  "https://unpkg.com/meshoptimizer@0.20.0/meshopt_decoder.js";

interface Props {
  model: ModelEntry;
  onBack: () => void;
}

type Status = "loading" | "ready" | "error";

const AUTO_ROTATE_DELAY_INITIAL_MS = 800;
const AUTO_ROTATE_DELAY_AFTER_INTERACTION_MS = 10000;

export function ViewerStage({ model, onBack }: Props) {
  const viewerRef = useRef<HTMLElement>(null);
  const [status, setStatus] = useState<Status>("loading");
  const [progress, setProgress] = useState(0);
  const [errorDetail, setErrorDetail] = useState("");

  useEffect(() => {
    const el = viewerRef.current;
    if (!el || !model.glb) return;

    // React 19 does not always serialise `src` onto custom elements the way
    // it does for <img>, so the property can arrive as null. Setting via
    // setAttribute guarantees the viewer actually starts loading.
    el.setAttribute("src", model.glb);

    // Start auto-rotating quickly on first load. Bump the delay to 10s the
    // first time the user interacts with the camera so manual inspection
    // isn't interrupted by the spin.
    el.setAttribute(
      "auto-rotate-delay",
      String(AUTO_ROTATE_DELAY_INITIAL_MS)
    );
    let bumped = false;
    const handleCameraChange = (event: Event) => {
      const detail = (event as CustomEvent<{ source?: string }>).detail;
      if (detail?.source === "user-interaction" && !bumped) {
        bumped = true;
        el.setAttribute(
          "auto-rotate-delay",
          String(AUTO_ROTATE_DELAY_AFTER_INTERACTION_MS)
        );
      }
    };

    const handleLoad = () => {
      setStatus("ready");
      // GLBs have no embedded materials — model-viewer falls back to a
      // white PBR default that washes out in neutral lighting. Swap to a
      // warm-stone, non-metallic material so the relief topography
      // catches the HDR's directional light and casts readable shadows.
      //
      // The right roughness depends on geometry. For the church (deep
      // architectural geometry — spire, buttresses, windows) a lower
      // roughness gives nice specular highlights on the edges without
      // hiding detail. For paintings (low-relief, millimetre-scale
      // surface variation) a much higher roughness is essential —
      // specular reflections on a near-flat surface smear out the
      // subtle normal gradients that are the only cue the viewer has
      // for depth. Matte = the face reads; glossy = the face vanishes.
      const isLowRelief = model.type === "painting";
      const baseColor: [number, number, number, number] = isLowRelief
        ? [0.72, 0.66, 0.57, 1] // mid warm stone, slight darker for contrast
        : [0.82, 0.76, 0.67, 1];
      const roughness = isLowRelief ? 0.95 : 0.4;

      try {
        type PBRSetters = {
          setBaseColorFactor?: (rgba: [number, number, number, number]) => void;
          setMetallicFactor?: (v: number) => void;
          setRoughnessFactor?: (v: number) => void;
        };
        type MVMaterial = { pbrMetallicRoughness?: PBRSetters };
        type MVModel = { materials?: MVMaterial[] };
        const materials = (el as unknown as { model?: MVModel }).model
          ?.materials;
        if (materials && materials.length > 0) {
          for (const mat of materials) {
            mat.pbrMetallicRoughness?.setBaseColorFactor?.(baseColor);
            mat.pbrMetallicRoughness?.setMetallicFactor?.(0);
            mat.pbrMetallicRoughness?.setRoughnessFactor?.(roughness);
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
    el.addEventListener("camera-change", handleCameraChange);
    return () => {
      el.removeEventListener("load", handleLoad);
      el.removeEventListener("progress", handleProgress);
      el.removeEventListener("error", handleError);
      el.removeEventListener("camera-change", handleCameraChange);
    };
  }, [model.id, model.glb]);

  if (!model.glb) return null;

  const envUrl = `${import.meta.env.BASE_URL || "/"}environments/studio.hdr`
    .replace(/\/{2,}/g, "/");

  // Paintings are low-relief: start the camera at a steep angle so the
  // first frame reads as 3D under raking light, push the exposure down
  // so shadows on the relief actually read, and stretch the model's
  // depth (Z-axis) by 2.5× so millimetre surface variation casts
  // shadows visible at the viewing distance. The silhouette (X/Y)
  // stays true; only depth is exaggerated. This is what relief-
  // photography studios do physically with oblique lighting.
  // Monuments already have real geometric depth and need no stretch.
  const isLowRelief = model.type === "painting";
  const cameraOrbit = isLowRelief ? "-55deg 82deg auto" : "-25deg 76deg auto";
  const exposure = isLowRelief ? "0.8" : "0.95";
  const shadowIntensity = isLowRelief ? "2.6" : "2.0";
  const modelScale = model.modelScale ?? (isLowRelief ? "1 1 2.5" : "1 1 1");
  const orientation = model.orientation ?? "0 0 0";

  return (
    <div className="fixed inset-0 bg-stone-950 text-stone-100 overflow-hidden">
      <model-viewer
        ref={viewerRef}
        alt={`3D tactile model of ${model.title} by ${model.artist}`}
        scale={modelScale}
        orientation={orientation}
        camera-controls
        auto-rotate
        rotation-per-second="24deg"
        camera-orbit={cameraOrbit}
        min-camera-orbit="-120deg 40deg auto"
        max-camera-orbit="120deg 110deg auto"
        shadow-intensity={shadowIntensity}
        shadow-softness="0.4"
        exposure={exposure}
        environment-image={envUrl}
        touch-action="pan-y"
        interaction-prompt="none"
        loading="eager"
        reveal="auto"
        style={{
          width: "100%",
          height: "100%",
          display: "block",
          backgroundColor: "#0a0806",
        }}
      />

      {/* Top overlay — back + title */}
      <header
        className="absolute top-0 left-0 right-0 z-10 flex items-center gap-3 px-5 pt-[max(1.5rem,env(safe-area-inset-top))] pb-6 pointer-events-none"
        style={{
          background:
            "linear-gradient(to bottom, rgba(10,8,6,0.85), rgba(10,8,6,0))",
        }}
      >
        <button
          onClick={onBack}
          aria-label="Back to picker"
          className="pointer-events-auto w-11 h-11 flex items-center justify-center rounded-full bg-black/40 backdrop-blur text-white/90 hover:bg-black/60 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-400"
        >
          <ArrowLeft size={20} />
        </button>
        <div className="min-w-0 pointer-events-none">
          <h1 className="font-serif text-lg sm:text-xl font-bold leading-tight truncate text-white drop-shadow">
            {model.title}
          </h1>
          <p className="font-sans text-xs text-white/70 truncate">
            {model.artist} <span aria-hidden>·</span> {model.year}
          </p>
        </div>
      </header>

      {/* Bottom overlay — commission, hint, CTA */}
      <div
        className="absolute bottom-0 left-0 right-0 z-10 px-5 pt-16 pb-[max(2rem,env(safe-area-inset-bottom))] pointer-events-none"
        style={{
          background:
            "linear-gradient(to top, rgba(10,8,6,0.88) 40%, rgba(10,8,6,0))",
        }}
      >
        <div className="mx-auto w-full max-w-md text-center">
          {model.commissionedBy && (
            <p className="font-sans text-[11px] uppercase tracking-[0.18em] text-amber-300/90 mb-2">
              {model.commissionedBy}
            </p>
          )}
          <p className="font-sans text-white/65 text-xs mb-4">
            Drag to rotate <span aria-hidden>·</span> Pinch to zoom
          </p>
          <button
            onClick={onBack}
            aria-label="View another model"
            className="pointer-events-auto w-full flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-amber-400 text-stone-950 font-sans font-bold text-base tracking-wide hover:bg-amber-300 active:bg-amber-500 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            style={{ minHeight: 56 }}
          >
            View another
          </button>
        </div>
      </div>

      {/* Loading / error overlay */}
      {status !== "ready" && (
        <div
          className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-3 bg-stone-950/90 backdrop-blur-sm"
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
            <div className="px-6 text-center">
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
  );
}
