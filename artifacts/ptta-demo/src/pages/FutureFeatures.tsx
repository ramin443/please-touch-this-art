import { Header } from "@/components/Header";
import { SectionLabel } from "@/components/editorial";
import { ArtistPersona } from "@/components/future/artist-persona/ArtistPersona";
import { GuidedWalkCard } from "@/components/future/concept-cards/GuidedWalkCard";
import { AudioDescriberCard } from "@/components/future/concept-cards/AudioDescriberCard";

export default function FutureFeatures() {
  return (
    <div className="ptta-root min-h-screen bg-page text-ink flex flex-col">
      <Header showBack backHref="/demo-hub" />
      <main className="flex-1 px-5 py-8 w-full max-w-[560px] md:max-w-[780px] lg:max-w-[960px] mx-auto">
        <SectionLabel label="Future" tag="Module" />
        <h1
          className="font-serif text-4xl md:text-5xl lg:text-6xl leading-[0.98] mt-2 mb-2"
          style={{ letterSpacing: "-0.01em" }}
        >
          What&rsquo;s next.
        </h1>
        <p className="text-body-fg text-base md:text-lg mb-10 max-w-[620px]">
          Three directions we&rsquo;re building toward —{" "}
          <em className="font-serif not-italic md:italic">one you can try right now</em>.
        </p>

        <section aria-label="Hero feature" className="mb-12 md:mb-16">
          <div className="flex items-baseline justify-between mb-3">
            <span
              className="ptta-label text-accent"
              style={{ fontSize: "9pt" }}
            >
              Live demo · 01
            </span>
            <span
              className="ptta-label text-muted-fg"
              style={{ fontSize: "9pt" }}
            >
              streaming
            </span>
          </div>
          <h2 className="font-sans text-2xl md:text-3xl mb-2">
            AI Artist Persona
          </h2>
          <p className="text-body-fg text-sm md:text-base mb-6 max-w-[620px]">
            Ask a painter from our collection what they saw, what they felt, why they painted.
          </p>
          <ArtistPersona />
        </section>

        <div className="mb-5">
          <SectionLabel label="Roadmap" tag="Coming soon" />
        </div>
        <h2 className="font-sans text-lg md:text-xl mb-4">Also on the way</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
          <GuidedWalkCard />
          <AudioDescriberCard />
        </div>
      </main>
    </div>
  );
}
