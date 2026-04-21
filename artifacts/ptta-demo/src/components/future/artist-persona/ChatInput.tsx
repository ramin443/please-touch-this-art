import { useState, useRef } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Send } from "lucide-react";

interface Props {
  placeholder: string;
  suggested: [string, string];
  showSuggested: boolean;
  disabled: boolean;
  accentColor: string;
  onSend: (text: string) => void;
}

const MAX_CHARS = 500;

export function ChatInput({
  placeholder,
  suggested,
  showSuggested,
  disabled,
  accentColor,
  onSend,
}: Props) {
  const [text, setText] = useState("");
  const [focused, setFocused] = useState(false);
  const reduceMotion = useReducedMotion() ?? false;
  const inputRef = useRef<HTMLInputElement | null>(null);

  const submit = () => {
    const trimmed = text.trim();
    if (!trimmed || trimmed.length > MAX_CHARS) return;
    onSend(trimmed);
    setText("");
  };

  return (
    <div className="mt-4 flex flex-col gap-3">
      {showSuggested && (
        <div className="flex gap-2 flex-wrap">
          {suggested.map((s, i) => (
            <motion.button
              key={s}
              type="button"
              onClick={() => onSend(s)}
              disabled={disabled}
              initial={reduceMotion ? false : { opacity: 0, y: 4 }}
              animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.08 }}
              className="text-xs md:text-sm px-3.5 py-2 rounded-full border bg-page text-body-fg hover:bg-surface transition-colors disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
              style={{
                borderColor: `${accentColor}55`,
              }}
            >
              <span aria-hidden className="mr-1.5" style={{ color: accentColor }}>
                ›
              </span>
              {s}
            </motion.button>
          ))}
        </div>
      )}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
        className="flex items-center gap-2 p-1.5 rounded-full border-2 bg-page transition-colors"
        style={{
          borderColor: focused ? accentColor : "var(--color-hairline, #d6cfc0)",
        }}
      >
        <label htmlFor="artist-chat-input" className="sr-only">
          Your message
        </label>
        <input
          id="artist-chat-input"
          ref={inputRef}
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value.slice(0, MAX_CHARS))}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder={placeholder}
          disabled={disabled}
          className="flex-1 px-4 py-2.5 bg-transparent text-ink placeholder:text-muted-fg outline-none text-sm md:text-base"
        />
        <button
          type="submit"
          disabled={disabled || text.trim().length === 0}
          aria-label="Send message"
          className="w-10 h-10 md:w-11 md:h-11 flex items-center justify-center rounded-full text-page disabled:opacity-40 transition-transform hover:scale-105 active:scale-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
          style={{
            backgroundColor: accentColor,
          }}
        >
          <Send size={18} />
        </button>
      </form>
      {text.length >= 400 && (
        <p className="text-xs text-muted-fg self-end -mt-1">
          {text.length} / {MAX_CHARS}
        </p>
      )}
    </div>
  );
}
