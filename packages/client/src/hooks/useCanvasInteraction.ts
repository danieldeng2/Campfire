import { useState } from "react";
import type { Slide, SlideRect, SlideElement } from "@/types/slides";
import { Tool } from "@/types/editor";
import { DEFAULT_TEXT_STYLE } from "@/lib/defaultStyles";
import { rectsOverlap } from "@/lib/geometry";

const MIN_DRAW_SIZE = 20;
const MIN_BAND_DRAG_PX = 5;

interface Options {
  scale: number;
  wrapperRef: React.RefObject<HTMLDivElement | null>;
  isTextTool: boolean;
  activeSlide: Slide;
  addElement: (slideId: string, element: SlideElement) => void;
  selectElements: (ids: string[]) => void;
  setEditingElement: (id: string | null) => void;
  setActiveTool: (tool: Tool) => void;
}

export function useCanvasInteraction({
  scale,
  wrapperRef,
  isTextTool,
  activeSlide,
  addElement,
  selectElements,
  setEditingElement,
  setActiveTool,
}: Options) {
  const [drawStart, setDrawStart] = useState<{ x: number; y: number } | null>(null);
  const [drawRect, setDrawRect] = useState<SlideRect | null>(null);
  const [bandStart, setBandStart] = useState<{ x: number; y: number } | null>(null);
  const [bandRect, setBandRect] = useState<SlideRect | null>(null);

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
          runs: [],
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
        selectElements([]);
      } else if (bandRect) {
        const ids = activeSlide.elements
          .filter((el) => rectsOverlap(el.rect, bandRect))
          .map((el) => el.id);
        selectElements(ids);
      }
      setBandStart(null);
      setBandRect(null);
    }
  }

  return { drawRect, bandRect, handlePointerDown, handlePointerMove, handlePointerUp };
}
