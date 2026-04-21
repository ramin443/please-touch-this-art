import { cn } from "@/lib/utils";

export type RingState = "idle" | "active" | "done";

interface Props {
  state: RingState;
  label: string;
}

export function ProgressRing({ state, label }: Props) {
  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className="relative w-11 h-11" aria-hidden>
        {state === "idle" && (
          <div className="absolute inset-0 rounded-full border-2 border-white/15" />
        )}
        {state === "active" && (
          <>
            <div className="absolute inset-0 rounded-full border-2 border-amber-400/25" />
            <div className="absolute inset-0 rounded-full border-[2.5px] border-transparent border-t-amber-400 animate-spin" />
          </>
        )}
        {state === "done" && (
          <div className="absolute inset-0 rounded-full bg-amber-400 flex items-center justify-center">
            <svg
              viewBox="0 0 24 24"
              className="w-5 h-5 text-stone-950"
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
          "text-[10px] tracking-[0.14em] uppercase font-semibold font-sans transition-colors",
          state === "idle" && "text-white/45",
          state === "active" && "text-amber-400",
          state === "done" && "text-white/75"
        )}
      >
        {label}
      </div>
    </div>
  );
}
