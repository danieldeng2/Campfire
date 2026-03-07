"use client";

import { useCallback, useRef } from "react";
import type { SlideRect } from "@/types/slides";
import { CANVAS_WIDTH, CANVAS_HEIGHT } from "@/lib/canvasConstants";

export type ResizeHandle = "nw" | "n" | "ne" | "e" | "se" | "s" | "sw" | "w";

const MIN_SIZE = 20;

const CORNER_HANDLES = new Set<ResizeHandle>(["nw", "ne", "se", "sw"]);

function computeResizedRect(
  startRect: SlideRect,
  handle: ResizeHandle,
  dx: number,
  dy: number,
  aspectRatio?: number
): SlideRect {
  let { x, y, width, height } = startRect;

  // For corner handles with aspect ratio lock, constrain to maintain ratio
  if (aspectRatio && CORNER_HANDLES.has(handle)) {
    // Use the axis with the larger delta to drive the resize
    const absDx = Math.abs(dx);
    const absDy = Math.abs(dy);
    if (absDx / aspectRatio > absDy) {
      // Width-driven
      dy = (dx / aspectRatio) * (handle === "nw" || handle === "ne" ? 1 : 1);
      if (handle === "nw" || handle === "sw") {
        width -= dx;
        height = width / aspectRatio;
      } else {
        width += dx;
        height = width / aspectRatio;
      }
    } else {
      // Height-driven
      if (handle === "nw" || handle === "ne") {
        height -= dy;
        width = height * aspectRatio;
      } else {
        height += dy;
        width = height * aspectRatio;
      }
    }

    // Compute position based on which corner is anchored
    if (handle === "nw") {
      x = startRect.x + startRect.width - width;
      y = startRect.y + startRect.height - height;
    } else if (handle === "ne") {
      y = startRect.y + startRect.height - height;
    } else if (handle === "sw") {
      x = startRect.x + startRect.width - width;
    }
    // "se" keeps x, y as-is
  } else {
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
  }

  // Enforce minimum size
  if (width < MIN_SIZE) {
    if (handle.includes("w")) x = startRect.x + startRect.width - MIN_SIZE;
    width = MIN_SIZE;
    if (aspectRatio) height = width / aspectRatio;
  }
  if (height < MIN_SIZE) {
    if (handle.includes("n")) y = startRect.y + startRect.height - MIN_SIZE;
    height = MIN_SIZE;
    if (aspectRatio) width = height * aspectRatio;
  }

  // Clamp to canvas bounds
  x = Math.max(0, Math.min(CANVAS_WIDTH - width, x));
  y = Math.max(0, Math.min(CANVAS_HEIGHT - height, y));

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
  aspectRatio?: number;
}

export function useResizeElement({ rect, scale, onResize, aspectRatio }: UseResizeElementOptions) {
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
      const newRect = computeResizedRect(
        startRect.current,
        activeHandle.current,
        dx,
        dy,
        aspectRatio
      );
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
