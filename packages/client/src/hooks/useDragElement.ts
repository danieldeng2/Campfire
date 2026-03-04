"use client";

import { useCallback, useRef } from "react";
import { SlideRect } from "@/types/slides";

interface UseDragElementOptions {
  rect: SlideRect;
  scale: number;
  onDragEnd: (newRect: SlideRect) => void;
  enabled: boolean;
}

export function useDragElement({ rect, scale, onDragEnd, enabled }: UseDragElementOptions) {
  const isDragging = useRef(false);
  const startPointer = useRef({ x: 0, y: 0 });
  const startRect = useRef<SlideRect>(rect);

  const onPointerDown = useCallback(
    (e: React.PointerEvent<HTMLElement>) => {
      if (!enabled) return;
      e.preventDefault();
      e.stopPropagation();

      isDragging.current = true;
      startPointer.current = { x: e.clientX, y: e.clientY };
      startRect.current = { ...rect };

      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    },
    [enabled, rect]
  );

  const onPointerMove = useCallback(
    (e: React.PointerEvent<HTMLElement>) => {
      if (!isDragging.current) return;

      const dx = (e.clientX - startPointer.current.x) / scale;
      const dy = (e.clientY - startPointer.current.y) / scale;

      const newX = Math.round(startRect.current.x + dx);
      const newY = Math.round(startRect.current.y + dy);

      const clampedX = Math.max(0, Math.min(1920 - rect.width, newX));
      const clampedY = Math.max(0, Math.min(1080 - rect.height, newY));

      onDragEnd({ ...startRect.current, x: clampedX, y: clampedY });
    },
    [scale, rect.width, rect.height, onDragEnd]
  );

  const onPointerUp = useCallback((e: React.PointerEvent<HTMLElement>) => {
    if (!isDragging.current) return;
    isDragging.current = false;
    (e.target as HTMLElement).releasePointerCapture(e.pointerId);
  }, []);

  return { onPointerDown, onPointerMove, onPointerUp };
}
