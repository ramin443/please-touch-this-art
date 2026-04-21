import { Landmark } from "lucide-react";
import {
  PAINTINGS,
  MONUMENTS,
  type ModelEntry,
  type ModelId,
} from "@/content/models";
import { cn } from "@/lib/utils";
import { Header } from "@/components/Header";
import { SectionLabel, Marker } from "@/components/editorial";

const titleStyle = { letterSpacing: "-0.01em" } as const;

interface Props {
  onSelect: (id: ModelId) => void;
}

export function ModelPicker({ onSelect }: Props) {
  return (
    <div className="ptta-root min-h-[100dvh] bg-page text-ink">
      <Header showBack backHref="/demo-hub" tag="PAINTING → 3D MODEL" />

      <div className="mx-auto w-full max-w-[440px] px-5 pt-6 pb-10">
        <SectionLabel label="Painting → Model" tag="Module · 01" />

        <div className="text-center mb-6">
          <h1
            className="font-serif text-ink text-3xl md:text-4xl leading-[1.02]"
            style={titleStyle}
          >
            — Pick a piece to touch.
          </h1>
        </div>

        {/* Paintings — 2-col grid (same as DemoHub) */}
        <section className="mb-6" aria-label="Paintings">
          <div className="flex items-center justify-between mb-3">
            <span className="ptta-label text-ink" style={{ fontSize: "10pt" }}>
              Paintings
            </span>
            <span className="ptta-label text-muted-fg" style={{ fontSize: "10pt" }}>
              {PAINTINGS.length} available
            </span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {PAINTINGS.map((m, i) => (
              <ModelCard key={m.id} model={m} index={i} onSelect={onSelect} />
            ))}
          </div>
        </section>

        {/* Monuments — 2-col grid */}
        <section aria-label="Monuments">
          <div className="flex items-center justify-between mb-3">
            <span className="ptta-label text-ink" style={{ fontSize: "10pt" }}>
              Monuments
            </span>
            <span className="ptta-label text-muted-fg" style={{ fontSize: "10pt" }}>
              {MONUMENTS.length} available
            </span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {MONUMENTS.map((m, i) => (
              <ModelCard
                key={m.id}
                model={m}
                index={PAINTINGS.length + i}
                onSelect={onSelect}
              />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

interface CardProps {
  model: ModelEntry;
  index: number;
  onSelect: (id: ModelId) => void;
}

function ModelCard({ model, index, onSelect }: CardProps) {
  const disabled = !model.available;
  return (
    <button
      type="button"
      onClick={() => {
        if (!disabled) onSelect(model.id);
      }}
      disabled={disabled}
      aria-label={
        disabled
          ? `${model.title} — coming soon`
          : `Select ${model.title} by ${model.artist}`
      }
      className={cn(
        "group relative w-full flex flex-col text-left rounded-2xl overflow-hidden bg-surface border border-hairline shadow-sm transition-all",
        "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
        !disabled && "hover:-translate-y-0.5 hover:shadow-md active:translate-y-0",
        disabled && "opacity-70 cursor-not-allowed"
      )}
      style={{ minHeight: 56 }}
    >
      {/* Thumbnail */}
      <div className="relative w-full aspect-[3/4] overflow-hidden bg-surface-muted">
        {model.image ? (
          <img
            src={model.image}
            alt={`${model.title} by ${model.artist}`}
            loading="lazy"
            className={cn(
              "w-full h-full object-cover transition-transform duration-500",
              !disabled && "group-hover:scale-[1.03]"
            )}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-stone-800 text-cream">
            <Landmark size={60} strokeWidth={1.1} aria-hidden />
          </div>
        )}
        {disabled && (
          <div className="absolute inset-0 flex items-start justify-end p-2 bg-stone-950/40">
            <span
              className="ptta-label inline-flex items-center px-2 py-0.5 rounded-full bg-stone-950 text-accent"
              style={{ fontSize: "9pt" }}
            >
              Soon
            </span>
          </div>
        )}
      </div>

      {/* Compact text block — matches DemoHub tile */}
      <div className="p-3">
        <div className="flex items-center justify-between mb-2">
          <Marker size={6} />
          <span className="ptta-label text-muted-fg" style={{ fontSize: "9pt" }}>
            {String(index + 1).padStart(2, "0")}
          </span>
        </div>

        <h3
          className="font-sans text-ink text-sm md:text-base leading-tight"
          style={titleStyle}
        >
          — {model.title}
        </h3>
        <p className="text-muted-fg text-xs mt-0.5 truncate">
          {model.artist} · {model.year}
        </p>

        {!disabled && (
          <span
            aria-hidden="true"
            className="ptta-label text-accent inline-block mt-2 transition-transform duration-200 group-hover:translate-x-0.5"
            style={{ fontSize: "9pt" }}
          >
            Open →
          </span>
        )}
      </div>
    </button>
  );
}
