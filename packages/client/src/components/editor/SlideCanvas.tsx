"use client";

import { useRef } from "react";
import { useCanvasScale } from "@/hooks/useCanvasScale";
import { useCanvasInteraction } from "@/hooks/useCanvasInteraction";
import { useSlidesStore } from "@/store/slidesStore";
import { useEditorStore } from "@/store/editorStore";
import { Tool } from "@/types/editor";
import { c } from "@/lib/colors";
import { CANVAS_WIDTH, CANVAS_HEIGHT } from "@/lib/canvasConstants";
import { TextElement } from "./elements/TextElement";
import { ScaledCanvas } from "./ScaledCanvas";

export function SlideCanvas() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const { scale, containerRef } = useCanvasScale();

  const { activeSlideId, activeTool, selectElements, setEditingElement, setActiveTool, snapLines } =
    useEditorStore();
  const slides = useSlidesStore((s) => s.deck.slides);
  const addElement = useSlidesStore((s) => s.addElement);
  const activeSlide = slides.find((s) => s.id === activeSlideId);

  const isTextTool = activeTool === Tool.Text;

  const { drawRect, bandRect, handlePointerDown, handlePointerMove, handlePointerUp } =
    useCanvasInteraction({
      scale,
      wrapperRef,
      isTextTool,
      activeSlide: activeSlide!,
      addElement,
      selectElements,
      setEditingElement,
      setActiveTool,
    });

  if (!activeSlide) return null;

  const scaledWidth = CANVAS_WIDTH * scale;
  const scaledHeight = CANVAS_HEIGHT * scale;

  return (
    <div
      ref={containerRef}
      className="flex-1 flex items-center justify-center w-full h-full"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          selectElements([]);
          setEditingElement(null);
          setActiveTool(Tool.Move);
        }
      }}
    >
      {/* Outer wrapper: sized to scaled dimensions */}
      <div
        ref={wrapperRef}
        style={{
          width: scaledWidth,
          height: scaledHeight,
          position: "relative",
          borderRadius: 6,
          boxShadow: `0 8px 40px ${activeSlide.background.value}99, 0 2px 8px ${activeSlide.background.value}66`,
          overflow: "hidden",
          cursor: isTextTool ? "crosshair" : "default",
        }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      >
        {/* Inner canvas: always 1920x1080, scaled via CSS transform */}
        <ScaledCanvas
          scale={scale}
          background={activeSlide.background.value}
          pointerEvents={isTextTool ? "none" : "auto"}
        >
          {activeSlide.elements.map((el) => {
            if (el.type === "text") {
              return (
                <TextElement key={el.id} element={el} slideId={activeSlide.id} scale={scale} />
              );
            }
            return null;
          })}

          {/* Text draw preview */}
          {drawRect && drawRect.width > 0 && (
            <div
              style={{
                position: "absolute",
                left: drawRect.x,
                top: drawRect.y,
                width: drawRect.width,
                height: drawRect.height,
                border: `2px dashed ${c.brand}`,
                background: c.brandGhost,
                pointerEvents: "none",
                borderRadius: 2,
              }}
            />
          )}

          {/* Center snap lines */}
          {snapLines.showV && (
            <div
              style={{
                position: "absolute",
                left: 959,
                top: 0,
                width: 2,
                height: 1080,
                backgroundColor: c.danger,
                pointerEvents: "none",
              }}
            />
          )}
          {snapLines.showH && (
            <div
              style={{
                position: "absolute",
                left: 0,
                top: 539,
                width: 1920,
                height: 2,
                backgroundColor: c.danger,
                pointerEvents: "none",
              }}
            />
          )}

          {/* Rubber-band selection */}
          {bandRect && bandRect.width > 2 && bandRect.height > 2 && (
            <div
              style={{
                position: "absolute",
                left: bandRect.x,
                top: bandRect.y,
                width: bandRect.width,
                height: bandRect.height,
                border: `1px solid ${c.brand}`,
                background: c.brandGhost,
                pointerEvents: "none",
                borderRadius: 2,
              }}
            />
          )}
        </ScaledCanvas>
      </div>
    </div>
  );
}
