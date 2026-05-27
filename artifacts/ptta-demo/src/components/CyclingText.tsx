import { useEffect, useState, type ReactNode } from "react";

interface CyclingTextProps {
  words: string[];
  typeSpeedMs?: number;
  deleteSpeedMs?: number;
  holdMs?: number;
  gapMs?: number;
  reduceMotion?: boolean;
  /** Custom caret content. When omitted, renders the .ptta-caret thin bar. */
  caret?: ReactNode;
  /** Whether the caret blinks while idle (holding/deleting). Defaults to true. */
  blink?: boolean;
}

type Phase = "holding" | "deleting" | "typing";

export function CyclingText({
  words,
  typeSpeedMs = 90,
  deleteSpeedMs = 60,
  holdMs = 1800,
  gapMs = 250,
  reduceMotion = false,
  caret,
  blink = true,
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
  const caretIdle = phase === "holding" || phase === "deleting";
  const blinkClass = blink && caretIdle ? "ptta-caret--blink" : "";

  return (
    <span className="inline-flex items-baseline">
      <span>{displayed}</span>
      {showCaret &&
        (caret !== undefined ? (
          <span className={blinkClass} aria-hidden="true">
            {caret}
          </span>
        ) : (
          <span
            className={`ptta-caret ${blinkClass}`}
            aria-hidden="true"
          />
        ))}
    </span>
  );
}
