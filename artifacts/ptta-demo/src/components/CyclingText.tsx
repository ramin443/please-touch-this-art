import { useEffect, useState } from "react";

interface CyclingTextProps {
  words: string[];
  typeSpeedMs?: number;
  deleteSpeedMs?: number;
  holdMs?: number;
  gapMs?: number;
  reduceMotion?: boolean;
}

type Phase = "holding" | "deleting" | "typing";

export function CyclingText({
  words,
  typeSpeedMs = 90,
  deleteSpeedMs = 60,
  holdMs = 1800,
  gapMs = 250,
  reduceMotion = false,
}: CyclingTextProps) {
  const first = words[0] ?? "";
  const [displayed, setDisplayed] = useState(first);
  const [wordIndex, setWordIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>("holding");

  useEffect(() => {
    if (reduceMotion || words.length <= 1) return;

    const target = words[wordIndex] ?? "";
    let timer: ReturnType<typeof setTimeout> | undefined;

    if (phase === "holding") {
      timer = setTimeout(() => setPhase("deleting"), holdMs);
    } else if (phase === "deleting") {
      if (displayed.length === 0) {
        timer = setTimeout(() => {
          setWordIndex((prev) => (prev + 1) % words.length);
          setPhase("typing");
        }, gapMs);
      } else {
        timer = setTimeout(
          () => setDisplayed(displayed.slice(0, -1)),
          deleteSpeedMs
        );
      }
    } else if (phase === "typing") {
      if (displayed === target) {
        setPhase("holding");
      } else {
        timer = setTimeout(
          () => setDisplayed(target.slice(0, displayed.length + 1)),
          typeSpeedMs
        );
      }
    }

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [displayed, phase, wordIndex, words, holdMs, gapMs, deleteSpeedMs, typeSpeedMs, reduceMotion]);

  const showCaret = !reduceMotion && words.length > 1;
  // Blink while holding or deleting — stay solid only while actively typing.
  const caretIdle = phase === "holding" || phase === "deleting";

  return (
    <span className="inline-flex items-baseline">
      <span>{displayed}</span>
      {showCaret && (
        <span
          className={`ptta-caret ${caretIdle ? "ptta-caret--blink" : ""}`}
          aria-hidden="true"
        />
      )}
    </span>
  );
}
