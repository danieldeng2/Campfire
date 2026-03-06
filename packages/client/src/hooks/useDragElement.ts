"use client";

import { useCallback, useRef } from "react";
import { SlideRect } from "@/types/slides";
import { CANVAS_WIDTH, CANVAS_HEIGHT, CANVAS_CX, CANVAS_CY } from "@/lib/canvasConstants";

const SNAP_THRESHOLD = 10;

interface UseDragElementOptions {
  rect: SlideRect;
  scale: number;
  onDragEnd: (newRect: SlideRect) => void;
  onSnapChange: (snap: { showH: boolean; showV: boolean }) => void;
  enabled: boolean;
}

export function useDragElement({
  rect,
  scale,
  onDragEnd,
  onSnapChange,
  enabled,
}: UseDragElementOptions) {
  const isDragging = useRef(false);
  const didDrag = useRef(false);
  const startPointer = useRef({ x: 0, y: 0 });
  const startRect = useRef<SlideRect>(rect);

  const onPointerDown = useCallback(
    (e: React.PointerEvent<HTMLElement>) => {
      if (!enabled) return;
      e.preventDefault();
      e.stopPropagation();

      isDragging.current = true;
      didDrag.current = false;
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

      if (Math.abs(dx) > 1 || Math.abs(dy) > 1) didDrag.current = true;

      const newX = Math.round(startRect.current.x + dx);
      const newY = Math.round(startRect.current.y + dy);

      const clampedX = Math.max(0, Math.min(CANVAS_WIDTH - rect.width, newX));
      const clampedY = Math.max(0, Math.min(CANVAS_HEIGHT - rect.height, newY));

      const elCX = clampedX + rect.width / 2;
      const elCY = clampedY + rect.height / 2;
      const nearV = Math.abs(elCX - CANVAS_CX) < SNAP_THRESHOLD;
      const nearH = Math.abs(elCY - CANVAS_CY) < SNAP_THRESHOLD;
      const snappedX = nearV ? CANVAS_CX - rect.width / 2 : clampedX;
      const snappedY = nearH ? CANVAS_CY - rect.height / 2 : clampedY;

      onSnapChange({ showH: nearH, showV: nearV });
      onDragEnd({ ...startRect.current, x: snappedX, y: snappedY });
    },
    [scale, rect.width, rect.height, onDragEnd, onSnapChange]
  );

  const onPointerUp = useCallback(
    (e: React.PointerEvent<HTMLElement>) => {
      if (!isDragging.current) return;
      isDragging.current = false;
      onSnapChange({ showH: false, showV: false });
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    },
    [onSnapChange]
  );

  const clearDidDrag = useCallback(() => {
    didDrag.current = false;
  }, []);

  return { onPointerDown, onPointerMove, onPointerUp, didDrag, clearDidDrag };
}
