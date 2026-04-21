import { cn } from "@/lib/utils";

export type RingState = "idle" | "active" | "done";

interface Props {
  state: RingState;
  label: string;
}

export function ProgressRing({ state, label }: Props) {
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative w-11 h-11" aria-hidden>
        {state === "idle" && (
          <div className="absolute inset-0 rounded-full border-2 border-white/15" />
        )}
        {state === "active" && (
          <>
            <div className="absolute inset-0 rounded-full border-2 border-accent/25" />
            <div className="absolute inset-0 rounded-full border-[2.5px] border-transparent border-t-accent animate-spin" />
          </>
        )}
        {state === "done" && (
          <div className="absolute inset-0 rounded-full bg-accent flex items-center justify-center">
            <svg
              viewBox="0 0 24 24"
              className="w-5 h-5 text-cream"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
        )}
      </div>
      <div
        className={cn(
          "ptta-label transition-colors",
          state === "idle" && "text-white/45",
          state === "active" && "text-accent",
          state === "done" && "text-white/70"
        )}
        style={{ fontSize: "9pt" }}
      >
        {label}
      </div>
    </div>
  );
}
