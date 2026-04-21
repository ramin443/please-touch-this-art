import { ModelViewerElement } from "@google/model-viewer";
import { useEffect, useRef, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { useLocation } from "wouter";
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

const titleStyle = { letterSpacing: "-0.01em" } as const;

export function ViewerStage({ model, onBack }: Props) {
  const viewerRef = useRef<HTMLElement>(null);
  const [, navigate] = useLocation();
  const [status, setStatus] = useState<Status>("loading");
  const [progress, setProgress] = useState(0);
  const [errorDetail, setErrorDetail] = useState("");

  useEffect(() => {
    const el = viewerRef.current;
    if (!el || !model.glb) return;

    el.setAttribute("src", model.glb);
    el.setAttribute("auto-rotate-delay", String(AUTO_ROTATE_DELAY_INITIAL_MS));

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
      const isLowRelief = model.type === "painting";
      const baseColor: [number, number, number, number] = isLowRelief
        ? [0.72, 0.66, 0.57, 1]
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

  const isPainting = model.type === "painting";
  const cameraOrbit = isPainting ? "-55deg 82deg auto" : "-25deg 76deg auto";
  const exposure = isPainting ? "0.8" : "0.95";
  const shadowIntensity = isPainting ? "2.6" : "2.0";
  const orientation = model.orientation ?? "0 0 0";

  return (
    <div className="fixed inset-0 bg-stone-950 text-stone-100 overflow-hidden">
      <model-viewer
        ref={viewerRef}
        alt={`3D tactile model of ${model.title} by ${model.artist}`}
        orientation={orientation}
        camera-controls
        auto-rotate
        rotation-per-second="24deg"
        camera-orbit={cameraOrbit}
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
          className="pointer-events-auto w-11 h-11 flex items-center justify-center rounded-full bg-black/40 backdrop-blur text-white/90 hover:bg-black/60 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          <ArrowLeft size={20} />
        </button>
        <div className="min-w-0 pointer-events-none">
          <h1
            className="font-serif text-lg sm:text-xl leading-tight truncate text-white drop-shadow"
            style={titleStyle}
          >
            — {model.title}
          </h1>
          <p
            className="ptta-label text-white/65 truncate mt-0.5"
            style={{ fontSize: "10pt" }}
          >
            {model.artist} · {model.year}
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
        <div className="mx-auto w-full max-w-[440px] text-center">
          {model.commissionedBy && (
            <p
              className="ptta-label text-accent mb-3"
              style={{ fontSize: "10pt" }}
            >
              {model.commissionedBy}
            </p>
          )}
          <p
            className="ptta-label text-white/55 mb-5"
            style={{ fontSize: "9pt" }}
          >
            Drag to rotate · Pinch to zoom
          </p>
          <button
            onClick={onBack}
            aria-label="View another model"
            className="pointer-events-auto w-full flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-accent text-cream text-base tracking-wide transition-transform hover:scale-[1.02] active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            style={{ minHeight: 56, letterSpacing: "-0.02em" }}
          >
            View another
          </button>
          <button
            onClick={() => navigate("/fabrication")}
            aria-label="Continue to 3D Printing"
            className="pointer-events-auto mt-3 w-full px-6 py-3 rounded-full bg-white/10 border border-white/30 text-white/90 text-sm hover:bg-white/20 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            Next: 3D Printing →
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
              <div className="w-10 h-10 rounded-full border-2 border-accent/25 border-t-accent animate-spin" />
              <p
                className="ptta-label text-white/75"
                style={{ fontSize: "10pt" }}
              >
                Loading 3D model — {Math.round(progress * 100)}%
              </p>
            </>
          )}
          {status === "error" && (
            <div className="px-6 text-center max-w-[440px]">
              <p
                className="font-serif italic text-accent text-lg mb-2"
                style={titleStyle}
              >
                Couldn&rsquo;t load the 3D model
              </p>
              <p className="text-white/65 text-xs break-words">
                {errorDetail}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
