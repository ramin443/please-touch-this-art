import { useLocation } from "wouter";
import { cn } from "@/lib/utils";
import type { ModelId } from "@/content/models";

export type ProcessSlug = "model" | "fabrication" | "audio" | "artist";

export interface ProcessMeta {
  slug: ProcessSlug;
  label: string;
  shortLabel: string;
}

export const PROCESSES: readonly ProcessMeta[] = [
  { slug: "model", label: "AI 3D Model", shortLabel: "Model" },
  { slug: "fabrication", label: "Fabrication", shortLabel: "Fabrication" },
  { slug: "audio", label: "Audio Guide", shortLabel: "Audio" },
  { slug: "artist", label: "Artist Persona", shortLabel: "Artist" },
] as const;

// Monuments are buildings, not paintings, so there is no artist to converse
// with — their journey ends at the audio guide.
export function processesForType(
  type: "painting" | "monument",
): readonly ProcessMeta[] {
  return type === "monument"
    ? PROCESSES.filter((p) => p.slug !== "artist")
    : PROCESSES;
}

interface Props {
  artworkId: ModelId;
  activeSlug: ProcessSlug;
  processes?: readonly ProcessMeta[];
}

export function ProcessStepper({
  artworkId,
  activeSlug,
  processes = PROCESSES,
}: Props) {
  const [, navigate] = useLocation();
  const activeIdx = processes.findIndex((p) => p.slug === activeSlug);

  return (
    <nav
      aria-label="Demo journey progress"
      className="z-40 bg-page/95 backdrop-blur border-b border-hairline"
    >
      <div className="mx-auto w-full max-w-[560px] px-4 sm:px-6 py-2.5 sm:py-3.5">
        <ol className="flex items-start">
          {processes.map((p, i) => {
            const isActive = p.slug === activeSlug;
            const isDone = i < activeIdx;
            const leftFilled = i <= activeIdx;
            const rightFilled = i < activeIdx;
            const isFirst = i === 0;
            const isLast = i === processes.length - 1;
            return (
              <li key={p.slug} className="flex-1 min-w-0">
                <button
                  type="button"
                  onClick={() => navigate(`/journey/${artworkId}/${p.slug}`)}
                  aria-current={isActive ? "step" : undefined}
                  aria-label={`Step ${i + 1} of ${processes.length}: ${p.label}`}
                  className="group flex w-full flex-col items-center gap-1.5 focus:outline-none"
                >
                  <div className="flex w-full items-center">
                    <span
                      aria-hidden
                      className={cn(
                        "h-[2px] flex-1 rounded-full transition-colors",
                        isFirst
                          ? "opacity-0"
                          : leftFilled
                            ? "bg-accent"
                            : "bg-hairline",
                      )}
                    />
                    <span
                      aria-hidden
                      className={cn(
                        "flex h-7 w-7 sm:h-8 sm:w-8 shrink-0 items-center justify-center rounded-full border text-[11px] sm:text-[13px] font-semibold leading-none transition-all",
                        "ring-offset-2 ring-offset-page group-focus-visible:ring-2 group-focus-visible:ring-accent",
                        isActive &&
                          "border-transparent bg-accent scale-110 shadow-[0_4px_16px_-4px_var(--color-accent)]",
                        !isActive && isDone && "border-transparent bg-accent",
                        !isActive &&
                          !isDone &&
                          "border-hairline bg-transparent text-muted-fg group-hover:border-ink/40 group-hover:text-ink",
                      )}
                      style={
                        isActive || isDone ? { color: "#241A0E" } : undefined
                      }
                    >
                      {isDone && !isActive ? "✓" : i + 1}
                    </span>
                    <span
                      aria-hidden
                      className={cn(
                        "h-[2px] flex-1 rounded-full transition-colors",
                        isLast
                          ? "opacity-0"
                          : rightFilled
                            ? "bg-accent"
                            : "bg-hairline",
                      )}
                    />
                  </div>
                  <span
                    className={cn(
                      "block w-full truncate px-0.5 text-center leading-tight transition-colors text-[9pt] sm:text-[10.5pt]",
                      isActive
                        ? "font-medium text-ink"
                        : isDone
                          ? "text-accent"
                          : "text-muted-fg group-hover:text-ink",
                    )}
                  >
                    {p.shortLabel}
                  </span>
                </button>
              </li>
            );
          })}
        </ol>
      </div>
    </nav>
  );
}
