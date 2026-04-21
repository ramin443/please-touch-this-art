import { Header } from "@/components/Header";
import { SectionLabel } from "@/components/editorial";
import { ArtistPersona } from "@/components/future/artist-persona/ArtistPersona";
import { GuidedWalkCard } from "@/components/future/concept-cards/GuidedWalkCard";
import { AudioDescriberCard } from "@/components/future/concept-cards/AudioDescriberCard";

export default function FutureFeatures() {
  return (
    <div className="ptta-root min-h-screen bg-page text-ink flex flex-col">
      <Header showBack backHref="/demo-hub" />
      <main className="flex-1 px-5 py-8 max-w-[560px] mx-auto w-full">
        <SectionLabel label="Future" tag="Module" />
        <h1
          className="font-serif text-4xl md:text-5xl leading-[0.98] mt-2 mb-2"
          style={{ letterSpacing: "-0.01em" }}
        >
          What's next.
        </h1>
        <p className="text-body-fg text-base mb-8">
          Three directions we're building toward — one you can try right now.
        </p>

        <section aria-label="Hero feature" className="mb-10">
          <span className="ptta-label text-accent" style={{ fontSize: "9pt" }}>
            Live demo
          </span>
          <h2 className="font-sans text-xl md:text-2xl mt-1 mb-3">
            AI Artist Persona
          </h2>
          <p className="text-body-fg text-sm mb-4">
            Ask a painter from our collection what they saw, what they felt, why they painted. Powered by Groq.
          </p>
          <ArtistPersona />
        </section>

        <h2 className="font-sans text-lg mb-3">Also on the roadmap</h2>
        <div className="flex flex-col gap-4">
          <GuidedWalkCard />
          <AudioDescriberCard />
        </div>
      </main>
    </div>
  );
}
