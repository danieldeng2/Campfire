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
const MIN_BAND_DRAG_PX = 5;

function rectsOverlap(a: SlideRect, b: SlideRect) {
  return a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y;
}

export function SlideCanvas() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const { scale, canvasWidth, canvasHeight, containerRef } = useCanvasScale();

  const { activeSlideId, activeTool, selectElements, setEditingElement, setActiveTool } =
    useEditorStore();
  const slides = useSlidesStore((s) => s.deck.slides);
  const addElement = useSlidesStore((s) => s.addElement);
  const activeSlide = slides.find((s) => s.id === activeSlideId);

  // Text draw state
  const [drawStart, setDrawStart] = useState<{ x: number; y: number } | null>(null);
  const [drawRect, setDrawRect] = useState<SlideRect | null>(null);

  // Rubber-band selection state (bandStart in screen px for threshold; bandRect in canvas px)
  const [bandStart, setBandStart] = useState<{ x: number; y: number } | null>(null);
  const [bandRect, setBandRect] = useState<SlideRect | null>(null);

  if (!activeSlide) return null;

  const scaledWidth = canvasWidth * scale;
  const scaledHeight = canvasHeight * scale;
  const isTextTool = activeTool === Tool.Text;

  function toCanvasCoords(clientX: number, clientY: number) {
    const bounds = wrapperRef.current!.getBoundingClientRect();
    return {
      x: (clientX - bounds.left) / scale,
      y: (clientY - bounds.top) / scale,
    };
  }

  function handlePointerDown(e: React.PointerEvent) {
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);

    if (isTextTool) {
      e.preventDefault();
      const pt = toCanvasCoords(e.clientX, e.clientY);
      setDrawStart(pt);
      setDrawRect({ x: pt.x, y: pt.y, width: 0, height: 0 });
    } else {
      setBandStart({ x: e.clientX, y: e.clientY });
      setBandRect(null);
    }
  }

  function handlePointerMove(e: React.PointerEvent) {
    if (drawStart) {
      const pt = toCanvasCoords(e.clientX, e.clientY);
      setDrawRect({
        x: Math.min(drawStart.x, pt.x),
        y: Math.min(drawStart.y, pt.y),
        width: Math.abs(pt.x - drawStart.x),
        height: Math.abs(pt.y - drawStart.y),
      });
      return;
    }

    if (bandStart) {
      const start = toCanvasCoords(bandStart.x, bandStart.y);
      const current = toCanvasCoords(e.clientX, e.clientY);
      setBandRect({
        x: Math.min(start.x, current.x),
        y: Math.min(start.y, current.y),
        width: Math.abs(current.x - start.x),
        height: Math.abs(current.y - start.y),
      });
    }
  }

  function handlePointerUp(e: React.PointerEvent) {
    (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);

    if (drawStart && drawRect) {
      if (activeSlide && drawRect.width > MIN_DRAW_SIZE && drawRect.height > MIN_DRAW_SIZE) {
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
        selectElements([id]);
        setEditingElement(id);
      }
      setDrawStart(null);
      setDrawRect(null);
      return;
    }

    if (bandStart) {
      const dx = e.clientX - bandStart.x;
      const dy = e.clientY - bandStart.y;
      if (dx * dx + dy * dy < MIN_BAND_DRAG_PX * MIN_BAND_DRAG_PX) {
        // click on background: clear selection
        selectElements([]);
      } else if (bandRect && activeSlide) {
        const ids = activeSlide.elements
          .filter((el) => rectsOverlap(el.rect, bandRect))
          .map((el) => el.id);
        selectElements(ids);
      }
      setBandStart(null);
      setBandRect(null);
    }
  }

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
        </div>
      </div>
    </div>
  );
}
