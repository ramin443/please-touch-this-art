import { useEffect, useRef, useState } from "react";
import { useLocation } from "wouter";
import { useLanguage } from "@/context/LanguageContext";
import { useTheme, type FontTheme } from "@/context/ThemeContext";

interface HeaderProps {
  showBack?: boolean;
  backHref?: string;
  /** Optional callback. When provided, takes precedence over `backHref`. */
  onBack?: () => void;
  /** Editorial tag shown on the left in Courier label style. Defaults to the site name. */
  tag?: string;
}

const FONT_OPTIONS: { value: FontTheme; label: string }[] = [
  { value: "default", label: "Default" },
  { value: "editorial", label: "Editorial" },
  { value: "content", label: "Content v2" },
];

function FontThemeMenu() {
  const { fontTheme, setFontTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const activeLabel =
    FONT_OPTIONS.find((o) => o.value === fontTheme)?.label ?? "Default";

  return (
    <div ref={wrapRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label="Change site version"
        className="ptta-label inline-flex items-center gap-1.5 rounded-full border border-hairline px-3 py-1.5 text-[9.5pt] sm:text-[10pt] leading-none text-ink hover:bg-ink/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        style={{ minHeight: 32 }}
      >
        <span>{activeLabel}</span>
        <svg
          width="10"
          height="10"
          viewBox="0 0 10 10"
          aria-hidden="true"
          className={`transition-transform ${open ? "rotate-180" : ""}`}
        >
          <path
            d="M2 3.5 L5 6.5 L8 3.5"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
      {open && (
        <ul
          role="listbox"
          className="absolute right-0 top-[calc(100%+6px)] z-50 min-w-[140px] overflow-hidden rounded-xl border border-hairline bg-page shadow-xl"
        >
          {FONT_OPTIONS.map((opt) => {
            const isActive = opt.value === fontTheme;
            return (
              <li key={opt.value}>
                <button
                  type="button"
                  role="option"
                  aria-selected={isActive}
                  onClick={() => {
                    setFontTheme(opt.value);
                    setOpen(false);
                  }}
                  className={`ptta-label flex w-full items-center justify-between gap-3 px-3.5 py-2 text-left text-[10pt] leading-none transition-colors hover:bg-ink/5 ${
                    isActive ? "text-accent" : "text-ink"
                  }`}
                >
                  <span>{opt.label}</span>
                  {isActive && (
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 12 12"
                      aria-hidden="true"
                    >
                      <path
                        d="M2.5 6.5 L5 9 L9.5 3.5"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.6"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

export function Header({
  showBack = false,
  backHref = "/",
  onBack,
  tag,
}: HeaderProps) {
  const { t } = useLanguage();
  const [, navigate] = useLocation();

  const tagText = tag ?? "PLEASE TOUCH THIS ART";
  const isDefaultTag = tag === undefined;

  return (
    <header
      className="flex items-stretch bg-page border-b border-hairline"
      role="banner"
    >
      {/* Left: back arrow (if present) + Courier editorial label */}
      <div className="flex items-center gap-2 sm:gap-3 px-3 sm:px-5 md:px-8 py-2.5 sm:py-3 min-w-0 flex-1">
        {showBack && (
          <button
            type="button"
            onClick={() => (onBack ? onBack() : navigate(backHref))}
            aria-label={t.header.backLabel}
            className="flex shrink-0 items-center justify-center w-11 h-11 -ml-1.5 text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <line x1="19" y1="12" x2="5" y2="12" />
              <polyline points="12 19 5 12 12 5" />
            </svg>
          </button>
        )}
        <a
          href="/"
          onClick={(e) => {
            e.preventDefault();
            navigate("/");
          }}
          className="ptta-label text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent text-center sm:text-left block min-w-0 flex-1 text-[7.5pt] sm:text-[11pt] leading-tight sm:leading-none whitespace-normal sm:whitespace-nowrap break-words"
          style={{ fontWeight: 400 }}
          aria-label="Please Touch This Art – home"
        >
          {isDefaultTag ? (
            <>
              PLEASE TOUCH
              <span aria-hidden="true" className="mx-2 text-accent">·</span>
              THIS ART
            </>
          ) : (
            tagText
          )}
        </a>
        {/* Mobile-only spacer to balance the back arrow, so the title truly centers */}
        {showBack && (
          <div className="w-11 shrink-0 sm:hidden" aria-hidden />
        )}
      </div>

      {/* Right: font theme dropdown */}
      <div className="flex items-center pr-3 sm:pr-5 md:pr-8">
        <FontThemeMenu />
      </div>
    </header>
  );
}
