"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSlidesStore } from "@/store/slidesStore";
import { useEditorStore } from "@/store/editorStore";
import { runsToHtml } from "@/lib/runsToHtml";
import { PresentToolbar } from "@/components/present/PresentToolbar";
import { CANVAS_WIDTH, CANVAS_HEIGHT } from "@/lib/canvasConstants";
import "reveal.js/dist/reveal.css";
import "reveal.js/dist/theme/black.css";

export default function PresentPage() {
  const deckRef = useRef<HTMLDivElement>(null);
  const slides = useSlidesStore((s) => s.deck.slides);
  const setActiveSlide = useEditorStore((s) => s.setActiveSlide);
  const searchParams = useSearchParams();
  const startSlide = Number(searchParams.get("slide") ?? 0);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const revealInstance = useRef<any>(null);
  const router = useRouter();

  const slidesRef = useRef(slides);
  slidesRef.current = slides;

  const [showToolbar, setShowToolbar] = useState(false);
  const [slideIndex, setSlideIndex] = useState({ current: 1, total: slides.length });
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function handleMouseMove() {
    setShowToolbar(true);
    if (hideTimer.current) clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => setShowToolbar(false), 2500);
  }

  useEffect(() => {
    let destroyed = false;

    // Request fullscreen on entry
    document.documentElement.requestFullscreen?.().catch(() => {});

    // Navigate back to editor whenever fullscreen is exited (covers both
    // browser-native Escape and any programmatic exitFullscreen call)
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) {
        // Sync current slide back to editor before navigating
        const idx = revealInstance.current?.getState?.()?.indexh;
        const slideId = slidesRef.current[idx ?? 0]?.id;
        if (slideId) setActiveSlide(slideId);
        router.push("/editor");
      }
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);

    import("reveal.js").then(async ({ default: Reveal }) => {
      if (destroyed || !deckRef.current || revealInstance.current) return;

      revealInstance.current = new Reveal(deckRef.current, {
        controls: false,
        progress: false,
        center: true,
        hash: false,
        transition: "slide",
        width: CANVAS_WIDTH,
        height: CANVAS_HEIGHT,
        margin: 0,
      });
      await revealInstance.current.initialize();

      if (startSlide > 0) {
        revealInstance.current.slide(startSlide);
      }
      setSlideIndex({ current: (startSlide || 0) + 1, total: slidesRef.current.length });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      revealInstance.current.on("slidechanged", (event: any) => {
        setSlideIndex({ current: event.indexh + 1, total: slidesRef.current.length });
        const slideId = slidesRef.current[event.indexh]?.id;
        if (slideId) setActiveSlide(slideId);
      });
    });

    return () => {
      destroyed = true;
      if (hideTimer.current) clearTimeout(hideTimer.current);
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.exitFullscreen?.().catch(() => {});
      if (revealInstance.current) {
        revealInstance.current.destroy?.();
        revealInstance.current = null;
      }
    };
  }, [router, startSlide, setActiveSlide]);

  return (
    <div
      style={{ width: "100vw", height: "100vh", position: "relative" }}
      onMouseMove={handleMouseMove}
      onClick={() => revealInstance.current?.next()}
    >
      <div className="reveal" ref={deckRef} style={{ width: "100vw", height: "100vh" }}>
        <div className="slides">
          {slides.map((slide) => (
            <section
              key={slide.id}
              style={{
                backgroundColor: slide.background.value,
                position: "relative",
                width: "100%",
                height: "100%",
              }}
            >
              {slide.elements.map((el) => {
                if (el.type !== "text") return null;
                return (
                  <div
                    key={el.id}
                    style={{
                      position: "absolute",
                      left: `${(el.rect.x / CANVAS_WIDTH) * 100}%`,
                      top: `${(el.rect.y / CANVAS_HEIGHT) * 100}%`,
                      width: `${(el.rect.width / CANVAS_WIDTH) * 100}%`,
                      height: `${(el.rect.height / CANVAS_HEIGHT) * 100}%`,
                      fontFamily: el.style.fontFamily,
                      fontSize: `${(el.style.fontSize / CANVAS_HEIGHT) * 100}vh`,
                      fontWeight: el.style.fontWeight,
                      fontStyle: el.style.fontStyle,
                      textDecoration: el.style.textDecoration,
                      color: el.style.color,
                      textAlign: el.style.textAlign,
                      lineHeight: el.style.lineHeight,
                      letterSpacing: `${el.style.letterSpacing / CANVAS_HEIGHT}em`,
                      whiteSpace: "pre-wrap",
                      wordBreak: "break-word",
                    }}
                    dangerouslySetInnerHTML={{
                      __html: runsToHtml(el.content, el.runs, el.style),
                    }}
                  />
                );
              })}
            </section>
          ))}
        </div>
      </div>

      <PresentToolbar
        visible={showToolbar}
        current={slideIndex.current}
        total={slideIndex.total}
        onPrev={() => revealInstance.current?.prev()}
        onNext={() => revealInstance.current?.next()}
      />
    </div>
  );
}
