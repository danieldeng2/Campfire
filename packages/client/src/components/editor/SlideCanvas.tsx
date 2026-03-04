"use client";

import { useRef } from "react";
import { useCanvasScale } from "@/hooks/useCanvasScale";
import { useSlidesStore } from "@/store/slidesStore";
import { useEditorStore } from "@/store/editorStore";
import { TextElement } from "./elements/TextElement";

export function SlideCanvas() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scale, canvasWidth, canvasHeight } = useCanvasScale(containerRef);

  const { activeSlideId, selectElement } = useEditorStore();
  const slides = useSlidesStore((s) => s.deck.slides);
  const activeSlide = slides.find((s) => s.id === activeSlideId);

  if (!activeSlide) return null;

  const scaledWidth = canvasWidth * scale;
  const scaledHeight = canvasHeight * scale;

  return (
    <div
      ref={containerRef}
      className="flex-1 flex items-center justify-center w-full h-full"
    >
      {/* Outer wrapper: sized to scaled dimensions */}
      <div
        style={{
          width: scaledWidth,
          height: scaledHeight,
          position: "relative",
          borderRadius: 6,
          boxShadow: "0 8px 40px rgba(0,0,0,0.6), 0 2px 8px rgba(0,0,0,0.4)",
          overflow: "hidden",
        }}
        onClick={() => selectElement(null)}
      >
        {/* Inner canvas: always 1920x1080, scaled via CSS transform */}
        <div
          style={{
            width: canvasWidth,
            height: canvasHeight,
            backgroundColor: activeSlide.background.value,
            transform: `scale(${scale})`,
            transformOrigin: "top left",
            position: "absolute",
            top: 0,
            left: 0,
          }}
        >
          {activeSlide.elements.map((el) => {
            if (el.type === "text") {
              return (
                <TextElement
                  key={el.id}
                  element={el}
                  slideId={activeSlide.id}
                  scale={scale}
                />
              );
            }
            return null;
          })}
        </div>
      </div>
    </div>
  );
}
