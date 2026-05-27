import { useCallback } from "react";
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
import { Marker } from "@/components/editorial";

const titleStyle = { letterSpacing: "-0.01em" } as const;

export default function ArtworkPicker() {
  const [, navigate] = useLocation();

  const handleSelect = useCallback(
    (id: ModelId) => {
      navigate(`/journey/${id}/model`);
    },
    [navigate],
  );

  return (
    <div className="ptta-root min-h-[100dvh] bg-page text-ink">
      <Header showBack backHref="/" tag="PLEASE TOUCH THIS ART" />

      <div className="mx-auto w-full max-w-[1100px] px-5 md:px-8 pt-8 md:pt-10 pb-12">
        <div className="text-center mb-8 md:mb-10 max-w-[640px] mx-auto">
          <h1
            className="font-serif text-ink text-3xl md:text-5xl leading-[1.02] mb-2"
            style={titleStyle}
          >
            Pick a piece to touch.
          </h1>
          <p className="text-body-fg text-sm md:text-base leading-snug">
            Choose any artwork to begin its full journey, step by step.
          </p>
        </div>

        <section className="mb-8 md:mb-10" aria-label="Paintings">
          <div className="flex items-center justify-between mb-3 md:mb-4">
            <span className="ptta-label text-ink" style={{ fontSize: "10pt" }}>
              Paintings
            </span>
            <span
              className="ptta-label text-muted-fg"
              style={{ fontSize: "10pt" }}
            >
              {PAINTINGS.length} available
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 md:gap-5">
            {PAINTINGS.map((m, i) => (
              <ArtworkCard
                key={m.id}
                model={m}
                index={i}
                onSelect={handleSelect}
              />
            ))}
          </div>
        </section>

        <section aria-label="Monuments">
          <div className="flex items-center justify-between mb-3 md:mb-4">
            <span className="ptta-label text-ink" style={{ fontSize: "10pt" }}>
              Monuments
            </span>
            <span
              className="ptta-label text-muted-fg"
              style={{ fontSize: "10pt" }}
            >
              {MONUMENTS.length} available
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 md:gap-5">
            {MONUMENTS.map((m, i) => (
              <ArtworkCard
                key={m.id}
                model={m}
                index={PAINTINGS.length + i}
                onSelect={handleSelect}
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

function ArtworkCard({ model, index, onSelect }: CardProps) {
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
          : `Start journey for ${model.title} by ${model.artist}`
      }
      className={cn(
        "group relative w-full flex flex-col text-left rounded-2xl overflow-hidden bg-surface border border-hairline shadow-sm transition-all",
        "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
        !disabled &&
          "hover:-translate-y-0.5 hover:shadow-md active:translate-y-0",
        disabled && "opacity-70 cursor-not-allowed",
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
              !disabled && "group-hover:scale-[1.03]",
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

      <div className="p-3">
        <div className="flex items-center justify-between mb-2">
          <Marker size={6} />
          <span
            className="ptta-label text-muted-fg"
            style={{ fontSize: "9pt" }}
          >
            {String(index + 1).padStart(2, "0")}
          </span>
        </div>

        <h3
          className="font-sans text-ink text-sm md:text-base leading-tight"
          style={titleStyle}
        >
          {model.title}
        </h3>
        <p className="text-muted-fg text-xs mt-0.5 truncate">
          {model.artist} · {model.year}
        </p>
      </div>
    </button>
  );
}
