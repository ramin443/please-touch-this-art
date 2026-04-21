import { Header } from "@/components/Header";
import { SectionLabel } from "@/components/editorial";
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
          Two AI-powered directions we&rsquo;re building toward — to carry tactile access beyond a single artwork and into the whole museum visit.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
          <GuidedWalkCard />
          <AudioDescriberCard />
        </div>
      </main>
    </div>
  );
}
