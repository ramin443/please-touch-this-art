import { useEffect, useLayoutEffect, useRef } from "react";
import { useLocation } from "wouter";
import { Landmark } from "lucide-react";
import { MODELS, type ModelEntry, type ModelId } from "@/content/models";
import { cn } from "@/lib/utils";

interface Props {
  currentId: ModelId;
}

const AVAILABLE = MODELS.filter((m) => m.available);

const THUMB_W = 56; // px
const THUMB_H = 64;

// Pointer travel (px) before a mouse press counts as a scroll-drag rather than
// a tap. Kept generously above normal click jitter so a plain click on a
// trackpad/mouse is never mistaken for a drag and swallowed.
const DRAG_THRESHOLD = 10;

export function JourneyArtworkBar({ currentId }: Props) {
  const [, navigate] = useLocation();
  const scrollRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef<HTMLButtonElement>(null);
  const dragRef = useRef({
    startX: 0,
    startScroll: 0,
    moved: false,
    pointerId: -1,
  });

  // Center the active thumbnail in the scroll viewport on first paint and
  // whenever the active id changes.
  useLayoutEffect(() => {
    const el = activeRef.current;
    const wrap = scrollRef.current;
    if (!el || !wrap) return;
    const target = el.offsetLeft + el.offsetWidth / 2 - wrap.clientWidth / 2;
    wrap.scrollTo({ left: target, behavior: "smooth" });
  }, [currentId]);

  useEffect(() => {
    const el = activeRef.current;
    const wrap = scrollRef.current;
    if (!el || !wrap) return;
    wrap.scrollLeft =
      el.offsetLeft + el.offsetWidth / 2 - wrap.clientWidth / 2;
    // mount-only — avoid an initial visible slide
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!scrollRef.current) return;
    // Reset on every pointerdown (mouse OR touch) so a prior mouse drag
    // never lingers and suppresses a later touch tap.
    dragRef.current = {
      startX: e.clientX,
      startScroll: scrollRef.current.scrollLeft,
      moved: false,
      pointerId: e.pointerId,
    };
    // Only mouse uses manual scroll-drag — touch is handled natively. We
    // intentionally do NOT setPointerCapture here: capturing on the scroll
    // container retargets the follow-up `click` away from the tapped button,
    // which would stop selection from firing.
  };
  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== "mouse") return;
    const s = dragRef.current;
    if (s.pointerId !== e.pointerId) return;
    if (!scrollRef.current) return;
    // Buttons are only "held" while the primary button is down; once released
    // (e.buttons === 0) a stray move must not start dragging.
    if (e.buttons === 0) return;
    const dx = e.clientX - s.startX;
    if (Math.abs(dx) > DRAG_THRESHOLD) s.moved = true;
    if (s.moved) scrollRef.current.scrollLeft = s.startScroll - dx;
  };
  const endDrag = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== "mouse") return;
    const s = dragRef.current;
    if (s.pointerId !== e.pointerId) return;
    s.pointerId = -1;
  };

  const handleSelect = (m: ModelEntry) => {
    if (dragRef.current.moved) return; // suppress click after a mouse drag
    if (m.id === currentId) return;
    // One tap starts the selected artwork's journey from step one (3D model).
    navigate(`/journey/${m.id}/model`);
  };

  return (
    <div
      aria-label="Choose another artwork"
      className="ptta-artwork-bar relative bg-page/95 backdrop-blur border-b border-hairline"
    >
      <div
        ref={scrollRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        className="ptta-artwork-strip flex gap-2 sm:gap-2.5 overflow-x-auto py-2 select-none cursor-grab active:cursor-grabbing"
        style={{
          scrollbarWidth: "none",
          msOverflowStyle: "none",
          touchAction: "pan-x",
          scrollSnapType: "x mandatory",
          paddingInline: "calc(50% - var(--thumb-half))",
          scrollPaddingInline: "calc(50% - var(--thumb-half))",
          ["--thumb-half" as string]: `${THUMB_W / 2}px`,
        }}
      >
        {AVAILABLE.map((m) => {
          const isActive = m.id === currentId;
          return (
            <button
              ref={isActive ? activeRef : undefined}
              key={m.id}
              type="button"
              onClick={() => handleSelect(m)}
              aria-current={isActive ? "true" : undefined}
              aria-label={
                isActive
                  ? `Current artwork: ${m.title} by ${m.artist}`
                  : `Switch to ${m.title} by ${m.artist}`
              }
              title={`${m.title} — ${m.artist}`}
              className={cn(
                "group relative shrink-0 overflow-hidden rounded-md transition-all",
                "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
                isActive
                  ? "ring-2 ring-accent ring-offset-1 ring-offset-page scale-110"
                  : "opacity-70 hover:opacity-100",
              )}
              style={{
                width: THUMB_W,
                height: THUMB_H,
                scrollSnapAlign: "center",
              }}
            >
              {m.image ? (
                <img
                  src={m.image}
                  alt=""
                  aria-hidden
                  loading="lazy"
                  draggable={false}
                  className="block h-full w-full object-cover pointer-events-none"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-stone-800 text-cream">
                  <Landmark size={22} strokeWidth={1.2} aria-hidden />
                </div>
              )}
            </button>
          );
        })}
      </div>
      <style>{`
        .ptta-artwork-strip::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
}
