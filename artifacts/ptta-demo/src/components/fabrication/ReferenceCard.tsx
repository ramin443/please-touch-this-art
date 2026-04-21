import type { ModelEntry } from "@/content/models";

interface Props {
  model: ModelEntry;
}

/**
 * Small pinned painting card that sits in the top-right of the Fabricate
 * and Polish stages, keeping the source artwork visible as a reference
 * throughout the flow.
 */
export function ReferenceCard({ model }: Props) {
  return (
    <div
      className="absolute z-20 rounded-sm overflow-hidden border border-hairline shadow-lg"
      style={{
        top: 68,
        right: 16,
        width: 52,
        height: 68,
      }}
      aria-hidden
    >
      {model.image ? (
        <img
          src={model.image}
          alt=""
          className="w-full h-full object-cover"
          loading="lazy"
        />
      ) : (
        <div className="w-full h-full bg-stone-800" />
      )}
      {/* Push-pin */}
      <span
        className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-accent"
        style={{ boxShadow: "0 0 5px rgba(214,67,36,0.9)" }}
      />
      {/* Tiny caption */}
      <span
        className="absolute -bottom-4 left-1/2 -translate-x-1/2 ptta-label text-white/55"
        style={{ fontSize: "7pt", letterSpacing: "0.12em", whiteSpace: "nowrap" }}
      >
        REF
      </span>
    </div>
  );
}
