import { useLocation } from "wouter";
import { useLanguage } from "@/context/LanguageContext";

interface HeaderProps {
  showBack?: boolean;
  backHref?: string;
}

const titleStyle = { letterSpacing: "-0.05em" } as const;

export function Header({ showBack = false, backHref = "/" }: HeaderProps) {
  const { lang, setLang, t } = useLanguage();
  const [, navigate] = useLocation();

  const logo = (
    <a
      href={backHref}
      onClick={(e) => {
        e.preventDefault();
        navigate("/");
      }}
      className="text-stone-900 text-base md:text-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-600"
      style={titleStyle}
      aria-label="Please Touch This Art – home"
    >
      {t.header.logoText}
    </a>
  );

  return (
    <header
      className="sticky top-0 left-0 right-0 z-50 flex items-center px-6 md:px-10 py-4 bg-stone-50 border-b border-stone-200"
      role="banner"
    >
      <div className="flex-1 min-w-0 flex justify-start">
        {showBack ? (
          <button
            type="button"
            onClick={() => navigate(backHref)}
            aria-label={t.header.backLabel}
            className="flex items-center justify-center w-10 h-10 text-stone-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-600"
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
        ) : (
          logo
        )}
      </div>

      {showBack && (
        <div className="flex-1 flex justify-center min-w-0 text-center truncate">
          {logo}
        </div>
      )}

      <div className="flex-1 flex justify-end">
        <nav aria-label="Language selection">
          <div className="flex items-center gap-2 text-xs font-medium" role="group">
            <button
              onClick={() => setLang("en")}
              aria-label="Switch to English"
              aria-pressed={lang === "en"}
              className={`px-3 py-1.5 border focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-600 ${
                lang === "en"
                  ? "bg-stone-900 text-stone-50 border-stone-900"
                  : "bg-transparent text-stone-600 border-stone-300"
              }`}
            >
              EN
            </button>
            <button
              onClick={() => setLang("de")}
              aria-label="Zur deutschen Sprache wechseln"
              aria-pressed={lang === "de"}
              className={`px-3 py-1.5 border focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-600 ${
                lang === "de"
                  ? "bg-stone-900 text-stone-50 border-stone-900"
                  : "bg-transparent text-stone-600 border-stone-300"
              }`}
            >
              DE
            </button>
          </div>
        </nav>
      </div>
    </header>
  );
}
