import { useLocation } from "wouter";
import { Landmark } from "lucide-react";
import {
  PAINTINGS,
  MONUMENTS,
  type ModelEntry,
  type ModelId,
} from "@/content/models";
import { cn } from "@/lib/utils";
import { Header } from "@/components/Header";
import { SectionLabel } from "@/components/editorial";

const titleStyle = { letterSpacing: "-0.01em" } as const;

interface Props {
  onSelect: (id: ModelId) => void;
}

export function ModelPicker({ onSelect }: Props) {
  return (
    <div className="ptta-root min-h-[100dvh] bg-page text-ink">
      <Header showBack backHref="/demo-hub" tag="PAINTING → 3D MODEL · 01" />

      <div className="mx-auto w-full max-w-[440px] px-5 pt-6 pb-10">
        <SectionLabel label="Painting → Model" tag="Module · 01" />

        <div className="text-center mb-8">
          <h1
            className="font-serif text-ink text-3xl md:text-4xl leading-[1.02] mb-2"
            style={titleStyle}
          >
            — Pick a piece to touch.
          </h1>
          <p className="text-body-fg text-sm leading-snug">
            See how a flat painting becomes a layered tactile form you can rotate in your hands.
          </p>
        </div>

        <section className="mb-8" aria-label="Paintings">
          <div className="flex items-center justify-between mb-4">
            <span className="ptta-label text-ink" style={{ fontSize: "10pt" }}>
              Paintings
            </span>
            <span className="ptta-label text-muted-fg" style={{ fontSize: "10pt" }}>
              {PAINTINGS.length} available
            </span>
          </div>
          <div className="flex flex-col gap-4">
            {PAINTINGS.map((m) => (
              <ModelCard key={m.id} model={m} onSelect={onSelect} />
            ))}
          </div>
        </section>

        <section aria-label="Monuments">
          <div className="flex items-center justify-between mb-4">
            <span className="ptta-label text-ink" style={{ fontSize: "10pt" }}>
              Monuments
            </span>
            <span className="ptta-label text-muted-fg" style={{ fontSize: "10pt" }}>
              {MONUMENTS.length} available
            </span>
          </div>
          <div className="flex flex-col gap-4">
            {MONUMENTS.map((m) => (
              <ModelCard key={m.id} model={m} onSelect={onSelect} />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

interface CardProps {
  model: ModelEntry;
  onSelect: (id: ModelId) => void;
}

function ModelCard({ model, onSelect }: CardProps) {
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
        "group relative w-full rounded-2xl overflow-hidden bg-surface border border-hairline text-left transition-all",
        "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
        !disabled && "hover:-translate-y-0.5 hover:shadow-md active:translate-y-0",
        disabled && "opacity-70 cursor-not-allowed"
      )}
      style={{ minHeight: 56 }}
    >
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
            <Landmark size={88} strokeWidth={1.1} aria-hidden />
          </div>
        )}
        {disabled && (
          <div className="absolute inset-0 flex items-start justify-end p-3 bg-stone-950/40">
            <span
              className="ptta-label inline-flex items-center px-3 py-1 rounded-full bg-stone-950 text-accent"
              style={{ fontSize: "10pt" }}
            >
              Coming soon
            </span>
          </div>
        )}
      </div>
      <div className="p-5">
        <h3
          className="font-serif text-ink text-xl leading-tight mb-1"
          style={titleStyle}
        >
          — {model.title}
        </h3>
        <p className="text-muted-fg text-sm">
          {model.artist} <span aria-hidden>·</span> {model.year}
        </p>
        {!disabled && (
          <span
            aria-hidden="true"
            className="ptta-label text-accent inline-block mt-3 transition-transform duration-200 group-hover:translate-x-0.5"
            style={{ fontSize: "10pt" }}
          >
            Open →
          </span>
        )}
      </div>
    </button>
  );
}
