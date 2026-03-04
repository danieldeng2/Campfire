"use client";

import { useEffect, useRef } from "react";
import { useSlidesStore } from "@/store/slidesStore";
import "reveal.js/dist/reveal.css";
import "reveal.js/dist/theme/black.css";

export default function PresentPage() {
  const deckRef = useRef<HTMLDivElement>(null);
  const slides = useSlidesStore((s) => s.deck.slides);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const revealInstance = useRef<any>(null);

  useEffect(() => {
    let destroyed = false;

    import("reveal.js").then(async ({ default: Reveal }) => {
      if (destroyed || !deckRef.current || revealInstance.current) return;

      revealInstance.current = new Reveal(deckRef.current, {
        controls: true,
        progress: true,
        center: true,
        hash: false,
        transition: "slide",
        width: 1920,
        height: 1080,
        margin: 0,
      });
      await revealInstance.current.initialize();
    });

    return () => {
      destroyed = true;
      if (revealInstance.current) {
        revealInstance.current.destroy?.();
        revealInstance.current = null;
      }
    };
  }, []);

  return (
    <div
      className="reveal"
      ref={deckRef}
      style={{ width: "100vw", height: "100vh" }}
    >
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
  );
}
