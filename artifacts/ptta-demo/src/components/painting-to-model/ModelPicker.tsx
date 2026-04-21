import type { ReactNode } from "react";
import { ArrowLeft, Landmark } from "lucide-react";
import { useLocation } from "wouter";
import {
  PAINTINGS,
  MONUMENTS,
  type ModelEntry,
  type ModelId,
} from "@/content/models";
import { cn } from "@/lib/utils";

interface Props {
  onSelect: (id: ModelId) => void;
}

export function ModelPicker({ onSelect }: Props) {
  const [, navigate] = useLocation();

  return (
    <div className="min-h-[100dvh] bg-background text-foreground">
      <div className="mx-auto w-full max-w-md sm:max-w-3xl">
        <header
          className="flex items-center gap-3 px-5 sm:px-8 pt-6 pb-2"
          role="banner"
        >
          <button
            onClick={() => navigate("/")}
            aria-label="Back to home"
            className="w-11 h-11 flex items-center justify-center rounded-full text-stone-700 hover:bg-stone-200/70 active:bg-stone-200 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-600"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="font-serif text-xl sm:text-2xl font-bold tracking-tight text-stone-900">
            Painting <span aria-hidden>→</span>
            <span className="sr-only">to</span> 3D Model
          </h1>
        </header>

        <section className="px-5 sm:px-8 pt-3 pb-7">
          <p className="font-serif text-stone-700 text-lg sm:text-xl leading-snug max-w-2xl">
            Pick a piece to see it come alive in your hands.
          </p>
        </section>

        <section className="px-5 sm:px-8 pb-8" aria-label="Paintings">
          <SectionHeading>Paintings</SectionHeading>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            {PAINTINGS.map((m) => (
              <ModelCard
                key={m.id}
                model={m}
                onSelect={onSelect}
                aspectClass="aspect-[3/4]"
              />
            ))}
          </div>
        </section>

        <section className="px-5 sm:px-8 pb-12" aria-label="Monuments">
          <SectionHeading>Monuments</SectionHeading>
          <div className="grid grid-cols-1 gap-4">
            {MONUMENTS.map((m) => (
              <ModelCard
                key={m.id}
                model={m}
                onSelect={onSelect}
                aspectClass="aspect-[3/4] sm:aspect-[2/1]"
              />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

function SectionHeading({ children }: { children: ReactNode }) {
  return (
    <h2 className="font-sans text-[11px] font-bold uppercase tracking-[0.18em] text-amber-700 mb-3">
      {children}
    </h2>
  );
}

interface CardProps {
  model: ModelEntry;
  onSelect: (id: ModelId) => void;
  aspectClass: string;
}

function ModelCard({ model, onSelect, aspectClass }: CardProps) {
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
        "group relative w-full rounded-2xl overflow-hidden bg-card border border-card-border text-left transition-all",
        "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-600",
        !disabled &&
          "hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0",
        disabled && "opacity-75 cursor-not-allowed"
      )}
      style={{ minHeight: 56 }}
    >
      <div
        className={cn(
          "relative w-full bg-stone-200 overflow-hidden",
          aspectClass
        )}
      >
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
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-stone-400 to-stone-700 text-stone-100">
            <Landmark size={88} strokeWidth={1.1} aria-hidden />
          </div>
        )}
        {disabled && (
          <div className="absolute inset-0 flex items-start justify-end p-3 bg-stone-950/30">
            <span className="inline-flex items-center px-3 py-1 rounded-full bg-stone-950/90 text-amber-300 text-[10px] font-sans font-bold uppercase tracking-[0.14em]">
              Coming soon
            </span>
          </div>
        )}
      </div>
      <div className="p-4 sm:p-5">
        <h3 className="font-serif text-lg sm:text-xl font-bold text-stone-900 leading-tight">
          {model.title}
        </h3>
        <p className="mt-1 font-sans text-sm text-stone-500">
          {model.artist} <span aria-hidden>·</span> {model.year}
        </p>
      </div>
    </button>
  );
}
