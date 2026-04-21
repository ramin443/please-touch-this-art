import { useEffect, useRef } from "react";
import { motion, useReducedMotion } from "framer-motion";
import type { ChatMessage } from "./useArtistChat";

interface Props {
  messages: ChatMessage[];
  status: "idle" | "streaming" | "error";
  artistShortName: string;
  accentColor: string;
}

function ThinkingDots({ color }: { color: string }) {
  return (
    <span
      aria-label="Thinking"
      className="inline-flex gap-1 items-center px-2 py-1"
    >
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="w-1.5 h-1.5 rounded-full"
          style={{ backgroundColor: color }}
          animate={{ opacity: [0.25, 1, 0.25] }}
          transition={{
            duration: 1.1,
            repeat: Infinity,
            delay: i * 0.15,
            ease: "easeInOut",
          }}
        />
      ))}
    </span>
  );
}

export function ChatTranscript({
  messages,
  status,
  artistShortName,
  accentColor,
}: Props) {
  const reduceMotion = useReducedMotion() ?? false;
  const endRef = useRef<HTMLDivElement | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const userScrolledUp = useRef(false);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const handler = () => {
      const nearBottom =
        el.scrollHeight - el.scrollTop - el.clientHeight < 40;
      userScrolledUp.current = !nearBottom;
    };
    el.addEventListener("scroll", handler);
    return () => el.removeEventListener("scroll", handler);
  }, []);

  useEffect(() => {
    if (!userScrolledUp.current) {
      endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  }, [messages]);

  const lastMessage = messages[messages.length - 1];
  const showThinkingDots =
    status === "streaming" &&
    lastMessage?.role === "assistant" &&
    lastMessage.content.length === 0;

  return (
    <div
      ref={scrollRef}
      id="artist-chat-panel"
      role="log"
      aria-live="polite"
      aria-atomic="false"
      aria-label={`Chat with ${artistShortName}`}
      className="flex-1 overflow-y-auto px-4 py-4 bg-surface rounded-2xl border border-hairline"
      style={{ minHeight: 200, maxHeight: "48vh" }}
    >
      {messages.length === 0 && (
        <div className="h-full flex items-center justify-center text-center px-3">
          <p
            className="text-muted-fg text-sm md:text-base italic font-serif leading-snug"
            style={{ letterSpacing: "-0.005em" }}
          >
            Tap a suggestion below, or ask {artistShortName} anything.
          </p>
        </div>
      )}
      <ul className="flex flex-col gap-3">
        {messages.map((m, i) => (
          <motion.li
            key={i}
            initial={reduceMotion ? false : { opacity: 0, y: 6 }}
            animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className={`max-w-[82%] px-3.5 py-2.5 rounded-2xl text-sm md:text-base leading-snug whitespace-pre-wrap ${
              m.role === "user"
                ? "self-end bg-ink text-page rounded-br-md"
                : "self-start bg-page text-ink border border-hairline rounded-bl-md"
            }`}
          >
            {showThinkingDots && i === messages.length - 1 ? (
              <ThinkingDots color={accentColor} />
            ) : (
              <>
                {m.content}
                {m.role === "assistant" &&
                  status === "streaming" &&
                  i === messages.length - 1 &&
                  m.content.length > 0 && (
                    <motion.span
                      aria-hidden
                      className="inline-block ml-0.5 w-[2px] h-[1em] align-middle"
                      style={{ backgroundColor: accentColor }}
                      animate={{ opacity: [1, 0, 1] }}
                      transition={{
                        duration: 1,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                    />
                  )}
              </>
            )}
          </motion.li>
        ))}
      </ul>
      <div ref={endRef} />
    </div>
  );
}
