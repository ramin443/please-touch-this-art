import { ModelViewerElement } from "@google/model-viewer";
import { useEffect, useRef, useState } from "react";
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

export function ViewerStage({ model }: Props) {
  const viewerRef = useRef<HTMLElement>(null);
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

      // Colored models ship with their own painted/baked materials — don't
      // overwrite them with the legacy beige low-relief look.
      if (model.colored) return;

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
  const exposure = isPainting ? "0.85" : "0.95";
  const shadowIntensity = isPainting ? "2.8" : "2.4";
  const orientation = model.orientation ?? "0 0 0";

  return (
    <div className="absolute inset-0 bg-stone-950 text-stone-100 overflow-hidden">
      <model-viewer
        ref={viewerRef}
        alt={`3D tactile model of ${model.title} by ${model.artist}`}
        orientation={orientation}
        camera-controls
        auto-rotate
        rotation-per-second="8deg"
        camera-orbit={cameraOrbit}
        shadow-intensity={shadowIntensity}
        shadow-softness="0.22"
        tone-mapping="aces"
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
          backgroundColor: "transparent",
        }}
      />

      {/* ── Cinematic lighting rig (CSS — model-viewer has no movable light) ── */}
      {/* Focused key-light pool the model sits in */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-[2]"
        style={{
          background:
            "radial-gradient(ellipse 50% 58% at 50% 46%, rgba(255,229,176,0.07) 0%, rgba(255,208,138,0.025) 34%, transparent 64%)",
          mixBlendMode: "screen",
        }}
      />
      {/* Vignette — the model emerges from darkness */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-[4]"
        style={{
          background:
            "radial-gradient(ellipse 72% 72% at 50% 48%, transparent 40%, rgba(0,0,0,0.42) 78%, rgba(0,0,0,0.76) 100%)",
        }}
      />

      {/* Bottom overlay — commission, hint. Padded to clear the floating Next button. */}
      <div
        className="absolute bottom-0 left-0 right-0 z-10 px-5 pt-16 pb-[max(6.5rem,env(safe-area-inset-bottom)+5.5rem)] pointer-events-none"
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
            className="ptta-label text-white/55"
            style={{ fontSize: "9pt" }}
          >
            Drag to rotate · Pinch to zoom
          </p>
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
                Loading 3D model · {Math.round(progress * 100)}%
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
