import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type Theme = "light" | "dark";
// "default" / "editorial" are font themes; "content" is a content-variant preview
// (default fonts, but alternate copy/imagery) used to review proposed changes
// before they replace the default.
export type FontTheme = "default" | "editorial" | "content";

interface ThemeContextValue {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggle: () => void;
  fontTheme: FontTheme;
  setFontTheme: (next: FontTheme) => void;
}

const STORAGE_KEY = "ptta-theme";
const FONT_STORAGE_KEY = "ptta-font-theme";

const ThemeContext = createContext<ThemeContextValue | null>(null);

function readInitial(): Theme {
  if (typeof window === "undefined") return "dark";
  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (stored === "light" || stored === "dark") return stored;
  return "dark";
}

function readInitialFont(): FontTheme {
  if (typeof window === "undefined") return "default";
  const stored = window.localStorage.getItem(FONT_STORAGE_KEY);
  if (stored === "editorial" || stored === "default" || stored === "content")
    return stored;
  return "default";
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(readInitial);
  const [fontTheme, setFontThemeState] = useState<FontTheme>(readInitialFont);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") root.classList.add("dark");
    else root.classList.remove("dark");
    try {
      window.localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      // ignore — private mode / quota
    }
  }, [theme]);

  useEffect(() => {
    const root = document.documentElement;
    if (fontTheme === "editorial") root.classList.add("font-editorial");
    else root.classList.remove("font-editorial");
    try {
      window.localStorage.setItem(FONT_STORAGE_KEY, fontTheme);
    } catch {
      // ignore — private mode / quota
    }
  }, [fontTheme]);

  const setTheme = (next: Theme) => setThemeState(next);
  const toggle = () => setThemeState((prev) => (prev === "light" ? "dark" : "light"));
  const setFontTheme = (next: FontTheme) => setFontThemeState(next);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggle, fontTheme, setFontTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used inside ThemeProvider");
  return ctx;
}
