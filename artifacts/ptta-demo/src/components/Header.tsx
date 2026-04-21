import { useLocation } from "wouter";
import { useLanguage } from "@/context/LanguageContext";
import { useTheme } from "@/context/ThemeContext";

interface HeaderProps {
  showBack?: boolean;
  backHref?: string;
  /** Editorial tag shown on the left in Courier label style. Defaults to the site name. */
  tag?: string;
}

export function Header({ showBack = false, backHref = "/", tag }: HeaderProps) {
  const { lang, setLang, t } = useLanguage();
  const { theme, toggle } = useTheme();
  const [, navigate] = useLocation();

  const tagText = tag ?? "PLEASE TOUCH THIS ART";

  return (
    <header
      className="sticky top-0 left-0 right-0 z-50 grid grid-cols-[1fr_auto] items-stretch bg-page border-b border-hairline"
      role="banner"
    >
      {/* Left: back arrow (if present) + Courier editorial label */}
      <div className="flex items-center gap-3 px-5 md:px-8 py-3">
        {showBack && (
          <button
            type="button"
            onClick={() => navigate(backHref)}
            aria-label={t.header.backLabel}
            className="flex items-center justify-center w-9 h-9 text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            <svg
              width="20"
              height="20"
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
          href={backHref}
          onClick={(e) => {
            e.preventDefault();
            navigate("/");
          }}
          className="ptta-label text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent truncate"
          style={{ fontSize: "10pt" }}
          aria-label="Please Touch This Art – home"
        >
          {tagText}
        </a>
      </div>

      {/* Right: red accent block housing the language toggle + theme toggle */}
      <nav
        aria-label="Site controls"
        className="flex items-stretch bg-accent text-accent-foreground"
      >
        <div className="flex items-center gap-3 md:gap-4 px-5 md:px-6" role="group">
          <button
            type="button"
            onClick={() => setLang("en")}
            aria-label="Switch to English"
            aria-pressed={lang === "en"}
            className={`ptta-label focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cream ${
              lang === "en"
                ? "underline underline-offset-4"
                : "opacity-60 hover:opacity-100"
            }`}
          >
            EN
          </button>
          <button
            type="button"
            onClick={() => setLang("de")}
            aria-label="Zur deutschen Sprache wechseln"
            aria-pressed={lang === "de"}
            className={`ptta-label focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cream ${
              lang === "de"
                ? "underline underline-offset-4"
                : "opacity-60 hover:opacity-100"
            }`}
          >
            DE
          </button>

          {/* Divider */}
          <span aria-hidden="true" className="h-4 w-px bg-cream/40" />

          {/* Theme toggle */}
          <button
            type="button"
            onClick={toggle}
            aria-label={theme === "light" ? "Switch to dark mode" : "Switch to light mode"}
            aria-pressed={theme === "dark"}
            className="flex items-center justify-center w-7 h-7 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cream"
          >
            {theme === "light" ? (
              // moon — indicates "switch to dark"
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
            ) : (
              // sun — indicates "switch to light"
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="12" cy="12" r="4" />
                <line x1="12" y1="2" x2="12" y2="4" />
                <line x1="12" y1="20" x2="12" y2="22" />
                <line x1="4.93" y1="4.93" x2="6.34" y2="6.34" />
                <line x1="17.66" y1="17.66" x2="19.07" y2="19.07" />
                <line x1="2" y1="12" x2="4" y2="12" />
                <line x1="20" y1="12" x2="22" y2="12" />
                <line x1="4.93" y1="19.07" x2="6.34" y2="17.66" />
                <line x1="17.66" y1="6.34" x2="19.07" y2="4.93" />
              </svg>
            )}
          </button>
        </div>
      </nav>
    </header>
  );
}
