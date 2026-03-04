"use client";

import { useRef, useState } from "react";
import { useCanvasScale } from "@/hooks/useCanvasScale";
import { useSlidesStore } from "@/store/slidesStore";
import { useEditorStore } from "@/store/editorStore";
import { Tool } from "@/types/editor";
import type { SlideRect, TextStyle } from "@/types/slides";
import { c } from "@/lib/colors";
import { TextElement } from "./elements/TextElement";

const DEFAULT_TEXT_STYLE: TextStyle = {
  fontFamily: "Inter, sans-serif",
  fontSize: 40,
  fontWeight: 400,
  fontStyle: "normal",
  color: c.ink,
  textAlign: "left",
  lineHeight: 1.4,
  letterSpacing: 0,
};

const MIN_DRAW_SIZE = 20;

export function SlideCanvas() {
  const containerRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const { scale, canvasWidth, canvasHeight } = useCanvasScale(containerRef);

  const { activeSlideId, activeTool, selectElement, setEditingElement, setActiveTool } =
    useEditorStore();
  const slides = useSlidesStore((s) => s.deck.slides);
  const addElement = useSlidesStore((s) => s.addElement);
  const activeSlide = slides.find((s) => s.id === activeSlideId);

  const [drawStart, setDrawStart] = useState<{ x: number; y: number } | null>(null);
  const [drawRect, setDrawRect] = useState<SlideRect | null>(null);

  if (!activeSlide) return null;

  const scaledWidth = canvasWidth * scale;
  const scaledHeight = canvasHeight * scale;
  const isTextTool = activeTool === Tool.Text;

  function toCanvasCoords(e: React.PointerEvent) {
    const bounds = wrapperRef.current!.getBoundingClientRect();
    return {
      x: (e.clientX - bounds.left) / scale,
      y: (e.clientY - bounds.top) / scale,
    };
  }

  function handlePointerDown(e: React.PointerEvent) {
    if (!isTextTool) return;
    e.preventDefault();
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    const pt = toCanvasCoords(e);
    setDrawStart(pt);
    setDrawRect({ x: pt.x, y: pt.y, width: 0, height: 0 });
  }

  function handlePointerMove(e: React.PointerEvent) {
    if (!drawStart) return;
    const pt = toCanvasCoords(e);
    setDrawRect({
      x: Math.min(drawStart.x, pt.x),
      y: Math.min(drawStart.y, pt.y),
      width: Math.abs(pt.x - drawStart.x),
      height: Math.abs(pt.y - drawStart.y),
    });
  }

  function handlePointerUp(e: React.PointerEvent) {
    if (!drawStart || !drawRect || !activeSlide) return;
    (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);

    if (drawRect.width > MIN_DRAW_SIZE && drawRect.height > MIN_DRAW_SIZE) {
      const id = crypto.randomUUID();
      addElement(activeSlide.id, {
        id,
        type: "text",
        rect: {
          x: Math.round(drawRect.x),
          y: Math.round(drawRect.y),
          width: Math.round(drawRect.width),
          height: Math.round(drawRect.height),
        },
        zIndex: activeSlide.elements.length + 1,
        content: "",
        style: DEFAULT_TEXT_STYLE,
      });
      setActiveTool(Tool.Move);
      selectElement(id);
      setEditingElement(id);
    }

    setDrawStart(null);
    setDrawRect(null);
  }

  return (
    <div ref={containerRef} className="flex-1 flex items-center justify-center w-full h-full">
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
        onClick={isTextTool ? undefined : () => selectElement(null)}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
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
            pointerEvents: isTextTool ? "none" : "auto",
          }}
        >
          {activeSlide.elements.map((el) => {
            if (el.type === "text") {
              return (
                <TextElement key={el.id} element={el} slideId={activeSlide.id} scale={scale} />
              );
            }
            return null;
          })}

          {/* Draw preview rect */}
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
        </div>
      </div>
    </div>
  );
}
