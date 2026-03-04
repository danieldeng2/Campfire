"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useSlidesStore } from "@/store/slidesStore";
import { PresentToolbar } from "@/components/present/PresentToolbar";
import "reveal.js/dist/reveal.css";
import "reveal.js/dist/theme/black.css";

export default function PresentPage() {
  const deckRef = useRef<HTMLDivElement>(null);
  const slides = useSlidesStore((s) => s.deck.slides);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const revealInstance = useRef<any>(null);
  const router = useRouter();

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
        width: 1920,
        height: 1080,
        margin: 0,
      });
      await revealInstance.current.initialize();

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      revealInstance.current.on("slidechanged", (event: any) => {
        setSlideIndex({ current: event.indexh + 1, total: slides.length });
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
  }, [router, slides.length]);

  return (
    <div
      style={{ width: "100vw", height: "100vh", position: "relative" }}
      onMouseMove={handleMouseMove}
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
                      left: `${(el.rect.x / 1920) * 100}%`,
                      top: `${(el.rect.y / 1080) * 100}%`,
                      width: `${(el.rect.width / 1920) * 100}%`,
                      height: `${(el.rect.height / 1080) * 100}%`,
                      fontFamily: el.style.fontFamily,
                      fontSize: `${(el.style.fontSize / 1080) * 100}vh`,
                      fontWeight: el.style.fontWeight,
                      fontStyle: el.style.fontStyle,
                      color: el.style.color,
                      textAlign: el.style.textAlign,
                      lineHeight: el.style.lineHeight,
                      letterSpacing: `${el.style.letterSpacing / 1080}em`,
                      whiteSpace: "pre-wrap",
                      wordBreak: "break-word",
                    }}
                  >
                    {el.content}
                  </div>
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
