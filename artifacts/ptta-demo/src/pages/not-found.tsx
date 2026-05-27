import { useLocation } from "wouter";
import { Header } from "@/components/Header";

const tight = { letterSpacing: "-0.02em" } as const;

export default function NotFound() {
  const [, navigate] = useLocation();

  return (
    <div className="ptta-root min-h-screen bg-page text-ink flex flex-col">
      <Header />

      <main
        className="flex-1 flex items-center justify-center px-5 py-16"
        aria-label="Page not found"
      >
        <div className="w-full max-w-[480px] text-center">
          <p
            className="ptta-mono-eyebrow mb-3 font-medium"
            style={{
              fontSize: "clamp(13px, 3.6vw, 15px)",
              color: "hsl(38, 95%, 52%)",
            }}
          >
            Error 404
          </p>
          <h1
            className="font-serif text-ink leading-[1.05] mb-4"
            style={{ ...tight, fontSize: "clamp(2rem, 7vw, 3.25rem)" }}
          >
            This page wandered off.
          </h1>
          <p className="text-body-fg text-base md:text-lg leading-relaxed mb-9">
            The page you&rsquo;re looking for doesn&rsquo;t exist or has moved.
            Let&rsquo;s get you back to the art.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => navigate("/")}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-accent px-7 py-3.5 font-semibold text-base transition-transform hover:scale-[1.03] active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
              style={{ color: "#241A0E", minHeight: 52 }}
            >
              Back to home
            </button>
            <button
              type="button"
              onClick={() => navigate("/demo")}
              className="inline-flex items-center justify-center gap-2 rounded-full border border-hairline px-7 py-3.5 font-medium text-ink text-base transition-colors hover:bg-ink/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
              style={{ minHeight: 52 }}
            >
              Explore the gallery →
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
