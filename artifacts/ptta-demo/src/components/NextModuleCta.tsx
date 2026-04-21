import { useLocation } from "wouter";
import { useLanguage } from "@/context/LanguageContext";

interface Props {
  fromSlug: string;
}

export function NextModuleCta({ fromSlug }: Props) {
  const { t } = useLanguage();
  const [, navigate] = useLocation();

  const current = t.demoHub.cards.find((c) => c.slug === fromSlug);
  const nextSlug = current?.nextModule;
  const next = nextSlug
    ? t.demoHub.cards.find((c) => c.slug === nextSlug)
    : undefined;

  if (!next) return null;

  const destination = next.route ?? `/demo/${next.slug}`;

  return (
    <button
      type="button"
      onClick={() => navigate(destination)}
      className="w-full px-8 py-4 rounded-full bg-ink text-page font-bold text-base focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
      style={{ minHeight: 56, letterSpacing: "-0.02em" }}
      aria-label={`Continue to ${next.title}`}
    >
      Next: {next.title} →
    </button>
  );
}
