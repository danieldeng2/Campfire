"use client";

import { useCallback, useRef } from "react";
import type { SlideRect } from "@/types/slides";

export type ResizeHandle = "nw" | "n" | "ne" | "e" | "se" | "s" | "sw" | "w";

const MIN_SIZE = 20;
const CANVAS_W = 1920;
const CANVAS_H = 1080;

function computeResizedRect(
  startRect: SlideRect,
  handle: ResizeHandle,
  dx: number,
  dy: number
): SlideRect {
  let { x, y, width, height } = startRect;

  if (handle.includes("w")) {
    x += dx;
    width -= dx;
  }
  if (handle.includes("e")) {
    width += dx;
  }
  if (handle.includes("n")) {
    y += dy;
    height -= dy;
  }
  if (handle.includes("s")) {
    height += dy;
  }

  // Enforce minimum size
  if (width < MIN_SIZE) {
    if (handle.includes("w")) x = startRect.x + startRect.width - MIN_SIZE;
    width = MIN_SIZE;
  }
  if (height < MIN_SIZE) {
    if (handle.includes("n")) y = startRect.y + startRect.height - MIN_SIZE;
    height = MIN_SIZE;
  }

  // Clamp to canvas bounds
  x = Math.max(0, Math.min(CANVAS_W - width, x));
  y = Math.max(0, Math.min(CANVAS_H - height, y));

  return {
    x: Math.round(x),
    y: Math.round(y),
    width: Math.round(width),
    height: Math.round(height),
  };
}

interface UseResizeElementOptions {
  rect: SlideRect;
  scale: number;
  onResize: (newRect: SlideRect) => void;
}

export function useResizeElement({ rect, scale, onResize }: UseResizeElementOptions) {
  const activeHandle = useRef<ResizeHandle | null>(null);
  const startPointer = useRef({ x: 0, y: 0 });
  const startRect = useRef<SlideRect>(rect);

  const getHandlePointerDown = useCallback(
    (handle: ResizeHandle) => (e: React.PointerEvent<HTMLElement>) => {
      e.preventDefault();
      e.stopPropagation();
      activeHandle.current = handle;
      startPointer.current = { x: e.clientX, y: e.clientY };
      startRect.current = { ...rect };
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    },
    [rect]
  );

  const onPointerMove = useCallback(
    (e: React.PointerEvent<HTMLElement>) => {
      if (!activeHandle.current) return;
      const dx = (e.clientX - startPointer.current.x) / scale;
      const dy = (e.clientY - startPointer.current.y) / scale;
      const newRect = computeResizedRect(startRect.current, activeHandle.current, dx, dy);
      onResize(newRect);
    },
    [scale, onResize]
  );

  const onPointerUp = useCallback((e: React.PointerEvent<HTMLElement>) => {
    if (!activeHandle.current) return;
    activeHandle.current = null;
    (e.target as HTMLElement).releasePointerCapture(e.pointerId);
  }, []);

  return { getHandlePointerDown, onPointerMove, onPointerUp };
}
