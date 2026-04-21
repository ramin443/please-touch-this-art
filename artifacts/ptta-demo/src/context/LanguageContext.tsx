import { createContext, useContext, useState, type ReactNode } from "react";
import { copy, type PageCopy } from "@/content/copy";

export type Lang = "en" | "de";

interface LanguageContextValue {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: PageCopy;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>("en");
  const t = copy[lang] ?? copy.en;
  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used inside LanguageProvider");
  return ctx;
}
