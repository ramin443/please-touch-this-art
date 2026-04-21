import { useState, useRef, useEffect } from "react";

interface Props {
  placeholder: string;
  suggested: [string, string];
  showSuggested: boolean;
  disabled: boolean;
  onSend: (text: string) => void;
}

const MAX_CHARS = 500;

export function ChatInput({
  placeholder,
  suggested,
  showSuggested,
  disabled,
  onSend,
}: Props) {
  const [text, setText] = useState("");
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!disabled) inputRef.current?.focus();
  }, [disabled]);

  const submit = () => {
    const trimmed = text.trim();
    if (!trimmed || trimmed.length > MAX_CHARS) return;
    onSend(trimmed);
    setText("");
  };

  return (
    <div className="mt-3 flex flex-col gap-2">
      {showSuggested && (
        <div className="flex gap-2 flex-wrap">
          {suggested.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => onSend(s)}
              disabled={disabled}
              className="text-xs px-3 py-1.5 rounded-full border border-hairline bg-page text-body-fg hover:bg-surface disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              {s}
            </button>
          ))}
        </div>
      )}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
        className="flex gap-2"
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
          placeholder={placeholder}
          disabled={disabled}
          className="flex-1 px-4 py-3 rounded-full border border-hairline bg-page text-ink placeholder:text-muted-fg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        />
        <button
          type="submit"
          disabled={disabled || text.trim().length === 0}
          className="px-5 py-3 rounded-full bg-ink text-page font-bold disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          Send
        </button>
      </form>
      {text.length >= 400 && (
        <p className="text-xs text-muted-fg self-end">
          {text.length} / {MAX_CHARS}
        </p>
      )}
    </div>
  );
}
