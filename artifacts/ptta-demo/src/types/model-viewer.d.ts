import type { DetailedHTMLProps, HTMLAttributes } from "react";

type ModelViewerAttributes = HTMLAttributes<HTMLElement> & {
  src?: string;
  alt?: string;
  poster?: string;
  "camera-controls"?: boolean | "";
  "auto-rotate"?: boolean | "";
  "auto-rotate-delay"?: string | number;
  "rotation-per-second"?: string;
  "shadow-intensity"?: string | number;
  "shadow-softness"?: string | number;
  exposure?: string | number;
  "touch-action"?: string;
  "interaction-prompt"?: "auto" | "none" | "when-focused";
  loading?: "eager" | "lazy" | "auto";
  reveal?: "auto" | "manual";
  "camera-orbit"?: string;
  "min-camera-orbit"?: string;
  "max-camera-orbit"?: string;
  ar?: boolean | "";
  "ar-modes"?: string;
  "environment-image"?: string;
  "skybox-image"?: string;
};

declare module "react" {
  namespace JSX {
    interface IntrinsicElements {
      "model-viewer": DetailedHTMLProps<ModelViewerAttributes, HTMLElement>;
    }
  }
}

export {};
